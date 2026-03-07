package com.tekion.tekleader.service;

import com.tekion.tekleader.dto.UploadResponse;
import com.tekion.tekleader.entity.*;
import com.tekion.tekleader.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExcelImportService {
    
    private final ManagerRepository managerRepository;
    private final MonthlyMetricRepository monthlyMetricRepository;
    private final UploadHistoryRepository uploadHistoryRepository;
    private final ScoringService scoringService;
    private final BadgeService badgeService;
    
    private static final String MASTER_REPORT_TAB = "Master Report";
    private static final List<String> FUNCTIONAL_HEADS = Arrays.asList(
        "Kunal Bhattacharya", "Teza Mukkavilli"
    );

    @Transactional
    public UploadResponse processExcelFile(
        MultipartFile file,
        String month,
        String uploadMode
    ) throws IOException {
        long startTime = System.currentTimeMillis();

        UploadResponse.UploadResponseBuilder responseBuilder = UploadResponse.builder()
            .month(month)
            .uploadMode(uploadMode);

        List<UploadResponse.UploadError> errors = new ArrayList<>();
        int processed = 0, created = 0, updated = 0, skipped = 0, failed = 0;

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheet(MASTER_REPORT_TAB);

            if (sheet == null) {
                throw new IllegalArgumentException(
                    "Tab '" + MASTER_REPORT_TAB + "' not found in Excel file. Available sheets: " +
                    String.join(", ", getSheetNames(workbook))
                );
            }

            Row headerRow = sheet.getRow(0);
            Map<String, Integer> columnMap = buildColumnMap(headerRow);

            FormulaConfig activeFormula = scoringService.getActiveFormula();

            //Arrange
            Map<String, ManagerAggregation> managerAggregations = new HashMap<>();

            //Act
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                processed++;

                try {
                    EmployeeData empData = parseEmployeeRow(row, columnMap);

                    if (empData.managerName == null || empData.managerName.isEmpty()) {
                        skipped++;
                        continue;
                    }

                    managerAggregations
                        .computeIfAbsent(empData.managerName, k -> new ManagerAggregation(empData.managerName, empData.functionalHead))
                        .addEmployee(empData);

                } catch (Exception e) {
                    failed++;
                    errors.add(UploadResponse.UploadError.builder()
                        .row(i + 1)
                        .message(e.getMessage())
                        .build());
                    log.error("Error processing row {}: {}", i + 1, e.getMessage());
                }
            }

            //Assert
            for (ManagerAggregation agg : managerAggregations.values()) {
                try {
                    Manager manager = getOrCreateManager(agg.managerName);

                    Optional<MonthlyMetric> existing = monthlyMetricRepository
                        .findByManagerIdAndMonth(manager.getId(), month);

                    if (existing.isPresent() && "skip".equalsIgnoreCase(uploadMode)) {
                        skipped++;
                        continue;
                    }

                    MonthlyMetric metric = createOrUpdateMetric(
                        existing.orElse(null),
                        manager,
                        month,
                        agg,
                        activeFormula
                    );

                    monthlyMetricRepository.save(metric);

                    if (existing.isPresent()) {
                        updated++;
                    } else {
                        created++;
                    }

                } catch (Exception e) {
                    failed++;
                    errors.add(UploadResponse.UploadError.builder()
                        .row(0)
                        .message("Manager " + agg.managerName + ": " + e.getMessage())
                        .build());
                    log.error("Error processing manager {}: {}", agg.managerName, e.getMessage());
                }
            }

            updateRankings(month);
            badgeService.awardBadgesForMonth(month);

        } catch (Exception e) {
            log.error("Error processing Excel file", e);
            throw e;
        }

        long processingTime = System.currentTimeMillis() - startTime;

        String status = failed == 0 ? "SUCCESS" : (created + updated > 0 ? "PARTIAL" : "FAILED");

        UploadHistory history = saveUploadHistory(
            month, file.getOriginalFilename(), uploadMode,
            processed, created, updated, skipped, failed,
            status, errors, processingTime
        );

        return responseBuilder
            .status(status)
            .summary(UploadResponse.UploadSummary.builder()
                .recordsProcessed(processed)
                .recordsCreated(created)
                .recordsUpdated(updated)
                .recordsSkipped(skipped)
                .recordsFailed(failed)
                .build())
            .processingTimeMs(processingTime)
            .uploadId(history.getId())
            .errors(errors)
            .build();
    }

    private List<String> getSheetNames(Workbook workbook) {
        List<String> names = new ArrayList<>();
        for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
            names.add(workbook.getSheetName(i));
        }
        return names;
    }

    private Map<String, Integer> buildColumnMap(Row headerRow) {
        Map<String, Integer> map = new HashMap<>();
        for (Cell cell : headerRow) {
            if (cell != null && cell.getCellType() == CellType.STRING) {
                String header = cell.getStringCellValue().trim();
                map.put(header, cell.getColumnIndex());
            }
        }

        List<String> required = Arrays.asList(
            "Manager Name", "Functional Head Name",
            "1:1s Participated with Manager Final"
        );

        for (String col : required) {
            if (!map.containsKey(col)) {
                throw new IllegalArgumentException("Required column '" + col + "' not found. Available columns: " + map.keySet());
            }
        }

        return map;
    }

    private EmployeeData parseEmployeeRow(Row row, Map<String, Integer> columnMap) {
        EmployeeData data = new EmployeeData();

        data.managerName = getCellValueAsString(row, columnMap.get("Manager Name"));
        data.functionalHead = getCellValueAsString(row, columnMap.get("Functional Head Name"));

        Integer participatedCol = columnMap.get("1:1s Participated with Manager Final");
        data.participated = participatedCol != null ? getCellValueAsInt(row, participatedCol) : 0;

        return data;
    }

    private String getCellValueAsString(Row row, int colIndex) {
        Cell cell = row.getCell(colIndex);
        if (cell == null) return "";

        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((int) cell.getNumericCellValue());
            default -> "";
        };
    }

    private int getCellValueAsInt(Row row, int colIndex) {
        Cell cell = row.getCell(colIndex);
        if (cell == null) return 0;

        return switch (cell.getCellType()) {
            case NUMERIC -> (int) cell.getNumericCellValue();
            case STRING -> Integer.parseInt(cell.getStringCellValue().trim());
            default -> 0;
        };
    }

    private BigDecimal parseUtilization(String value) {
        if (value == null || value.isEmpty()) return BigDecimal.ZERO;

        value = value.trim().replace("%", "");
        BigDecimal parsed = new BigDecimal(value);

        if (parsed.compareTo(BigDecimal.ONE) <= 0) {
            parsed = parsed.multiply(BigDecimal.valueOf(100));
        }

        return parsed.setScale(2, RoundingMode.HALF_UP);
    }

    private Manager getOrCreateManager(String name) {
        String canonical = name.toLowerCase().trim().replaceAll("\\s+", " ");

        return managerRepository.findByCanonicalName(canonical)
            .orElseGet(() -> {
                Manager manager = new Manager();
                manager.setDisplayName(name);
                manager.setCanonicalName(canonical);
                return managerRepository.save(manager);
            });
    }

    private MonthlyMetric createOrUpdateMetric(
        MonthlyMetric existing,
        Manager manager,
        String month,
        ManagerAggregation agg,
        FormulaConfig formula
    ) {
        BigDecimal previousUtilization = scoringService
            .getPreviousMonthUtilization(manager.getId(), month);

        BigDecimal teamSizeScore = scoringService.calculateTeamSizeScore(
            agg.headcount, formula.getTeamSizeMapping()
        );

        BigDecimal consistencyScore = scoringService.calculateConsistencyScore(
            agg.utilization, previousUtilization, formula.getConsistencyPenaltyMultiplier()
        );

        BigDecimal finalScore = scoringService.calculateFinalScore(
            agg.utilization, teamSizeScore, consistencyScore, formula
        );

        String band = scoringService.classifyManager(
            finalScore, formula.getClassificationThresholds()
        );

        if (existing != null) {
            existing.setFunctionalHead(agg.functionalHead);
            existing.setHeadcount(agg.headcount);
            existing.setOneOnOnes(agg.oneOnOnes);
            existing.setNotUtilising(agg.notUtilising);
            existing.setUtilization(agg.utilization);
            existing.setTeamSizeScore(teamSizeScore);
            existing.setConsistencyScore(consistencyScore);
            existing.setFinalScore(finalScore);
            existing.setClassificationBand(band);
            existing.setFormulaVersion(formula.getVersion());
            return existing;
        }

        MonthlyMetric metric = new MonthlyMetric();
        metric.setManagerId(manager.getId());
        metric.setMonth(month);
        metric.setFunctionalHead(agg.functionalHead);
        metric.setHeadcount(agg.headcount);
        metric.setOneOnOnes(agg.oneOnOnes);
        metric.setNotUtilising(agg.notUtilising);
        metric.setUtilization(agg.utilization);
        metric.setTeamSizeScore(teamSizeScore);
        metric.setConsistencyScore(consistencyScore);
        metric.setFinalScore(finalScore);
        metric.setClassificationBand(band);
        metric.setFormulaVersion(formula.getVersion());
        return metric;
    }

    private void updateRankings(String month) {
        List<MonthlyMetric> metrics = monthlyMetricRepository.findByMonth(month);

        // Fetch all managers for sorting
        Set<String> managerIds = metrics.stream()
            .map(MonthlyMetric::getManagerId)
            .collect(Collectors.toSet());

        Map<String, Manager> managerMap = managerRepository.findAllById(managerIds)
            .stream()
            .collect(Collectors.toMap(Manager::getId, m -> m));

        metrics.sort(Comparator
            .comparing((MonthlyMetric m) -> m.getFinalScore()).reversed()
            .thenComparing((MonthlyMetric m) -> m.getUtilization()).reversed()
            .thenComparing((MonthlyMetric m) -> m.getNotUtilising())
            .thenComparing(m -> {
                Manager manager = managerMap.get(m.getManagerId());
                return manager != null ? manager.getCanonicalName() : "";
            })
        );

        for (int i = 0; i < metrics.size(); i++) {
            metrics.get(i).setRank(i + 1);
        }

        monthlyMetricRepository.saveAll(metrics);
    }

    private UploadHistory saveUploadHistory(
        String month, String filename, String uploadMode,
        int processed, int created, int updated, int skipped, int failed,
        String status, List<UploadResponse.UploadError> errors, long processingTime
    ) {
        UploadHistory history = UploadHistory.builder()
            .month(month)
            .filename(filename)
            .uploadMode(uploadMode.toUpperCase())
            .recordsProcessed(processed)
            .recordsCreated(created)
            .recordsUpdated(updated)
            .recordsSkipped(skipped)
            .recordsFailed(failed)
            .status(status)
            .errorReport(errors.isEmpty() ? null : errors.toString())
            .uploadedBy("admin")
            .processingTimeMs(processingTime)
            .build();

        return uploadHistoryRepository.save(history);
    }

    private static class EmployeeData {
        String managerName;
        String functionalHead;
        int participated;
    }

    private static class ManagerAggregation {
        String managerName;
        String functionalHead;
        int headcount = 0;
        int oneOnOnes = 0;
        int notUtilising = 0;
        BigDecimal utilization = BigDecimal.ZERO;

        ManagerAggregation(String managerName, String functionalHead) {
            this.managerName = managerName;
            this.functionalHead = functionalHead;
        }

        void addEmployee(EmployeeData emp) {
            headcount++;
            if (emp.participated > 0) {
                oneOnOnes++;
            } else {
                notUtilising++;
            }

            if (headcount > 0) {
                utilization = BigDecimal.valueOf(oneOnOnes)
                    .divide(BigDecimal.valueOf(headcount), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
            }
        }
    }
}

