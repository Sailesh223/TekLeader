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
    private final TeamMemberRepository teamMemberRepository;
    private final ScoringService scoringService;
    private final BadgeService badgeService;
    private final XPService xpService;
    


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
            Sheet sheet = findAcceptableSheet(workbook);

            if (sheet == null) {
                throw new IllegalArgumentException(
                    "Excel file contains no sheets. Please ensure your Excel file has at least one sheet with data."
                );
            }

            log.info("Using sheet: '{}'", sheet.getSheetName());

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
                        .computeIfAbsent(empData.managerName, k -> new ManagerAggregation(
                            empData.managerName,
                            empData.managerEmail,
                            empData.directorName,
                            empData.functionalHead))
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
                    Manager manager = getOrCreateManager(agg.managerName, agg.managerEmail, agg.directorName, agg.functionalHead);

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

                    // Save team members
                    saveTeamMembers(manager, month, agg.employees, uploadMode);

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

            // Recalculate seasonal XP for all managers
            recalculateSeasonalXPForAllManagers(month);

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

    private Sheet findAcceptableSheet(Workbook workbook) {
        // Simply use the first sheet - works with any sheet name
        if (workbook.getNumberOfSheets() > 0) {
            Sheet firstSheet = workbook.getSheetAt(0);
            log.info("Using sheet: '{}' (first sheet in workbook)", firstSheet.getSheetName());
            return firstSheet;
        }

        log.error("Excel file contains no sheets");
        return null;
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

        // Required columns
        Integer managerNameCol = columnMap.get("Manager Name");
        data.managerName = managerNameCol != null ? getCellValueAsString(row, managerNameCol) : "";

        Integer functionalHeadCol = columnMap.get("Functional Head Name");
        data.functionalHead = functionalHeadCol != null ? getCellValueAsString(row, functionalHeadCol) : "";

        // Optional columns - handle null safely
        Integer managerEmailCol = columnMap.get("Manager Email");
        data.managerEmail = managerEmailCol != null ? getCellValueAsString(row, managerEmailCol) : "";

        Integer directorNameCol = columnMap.get("Director Name");
        data.directorName = directorNameCol != null ? getCellValueAsString(row, directorNameCol) : "";

        Integer preferredFullNameCol = columnMap.get("Preferred full name");
        data.preferredFullName = preferredFullNameCol != null ? getCellValueAsString(row, preferredFullNameCol) : "";

        Integer preferredFirstNameCol = columnMap.get("Preferred first name");
        data.preferredFirstName = preferredFirstNameCol != null ? getCellValueAsString(row, preferredFirstNameCol) : "";

        Integer preferredLastNameCol = columnMap.get("Preferred last name");
        data.preferredLastName = preferredLastNameCol != null ? getCellValueAsString(row, preferredLastNameCol) : "";

        Integer departmentCol = columnMap.get("Department");
        data.department = departmentCol != null ? getCellValueAsString(row, departmentCol) : "";

        Integer hrbpCol = columnMap.get("HRBP");
        data.hrbp = hrbpCol != null ? getCellValueAsString(row, hrbpCol) : "";

        Integer participatedCol = columnMap.get("1:1s Participated with Manager Final");
        data.participated = participatedCol != null ? getCellValueAsInt(row, participatedCol) : 0;

        Integer setUpCol = columnMap.get("1:1s Set Up with Manager");
        data.oneOnOnesSetUp = setUpCol != null ? getCellValueAsInt(row, setUpCol) : 0;

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

    private Manager getOrCreateManager(String name, String email, String directorName, String functionalHead) {
        String canonical = name.toLowerCase().trim().replaceAll("\\s+", " ");

        Optional<Manager> existing = managerRepository.findByCanonicalName(canonical);

        if (existing.isPresent()) {
            Manager manager = existing.get();
            boolean updated = false;

            if (email != null && !email.isEmpty() && !email.equals(manager.getEmail())) {
                manager.setEmail(email);
                updated = true;
            }
            if (directorName != null && !directorName.isEmpty() && !directorName.equals(manager.getDirectorName())) {
                manager.setDirectorName(directorName);
                updated = true;
            }
            if (functionalHead != null && !functionalHead.isEmpty() && !functionalHead.equals(manager.getFunctionalHead())) {
                manager.setFunctionalHead(functionalHead);
                updated = true;
            }

            if (updated) {
                return managerRepository.save(manager);
            }
            return manager;
        }

        Manager manager = new Manager();
        manager.setDisplayName(name);
        manager.setCanonicalName(canonical);
        manager.setEmail(email);
        manager.setDirectorName(directorName);
        manager.setFunctionalHead(functionalHead);
        return managerRepository.save(manager);
    }

    private MonthlyMetric createOrUpdateMetric(
        MonthlyMetric existing,
        Manager manager,
        String month,
        ManagerAggregation agg,
        FormulaConfig formula
    ) {
        BigDecimal teamSizeScore = scoringService.calculateTeamSizeScore(
            agg.headcount, formula.getTeamSizeMapping()
        );

        BigDecimal finalScoreWithoutConsistency = scoringService.calculateFinalScore(
            agg.utilization, teamSizeScore, BigDecimal.valueOf(50), formula
        );

        String preliminaryBand = scoringService.classifyManager(
            finalScoreWithoutConsistency, formula.getClassificationThresholds()
        );

        String previousTier = scoringService.getPreviousMonthTier(manager.getId(), month);

        BigDecimal consistencyScore = scoringService.calculateMultiMonthConsistencyScore(
            manager.getId(),
            month,
            preliminaryBand,
            formula,
            formula.getConsistencyMonthsToConsider()
        );

        BigDecimal finalScore = scoringService.calculateFinalScore(
            agg.utilization, teamSizeScore, consistencyScore, formula
        );

        String band = scoringService.classifyManager(
            finalScore, formula.getClassificationThresholds()
        );

        BigDecimal monthlyXP = xpService.calculateMonthlyXP(finalScore, band);
        xpService.updateManagerXP(manager.getId(), month, monthlyXP);
        xpService.updateStreak(manager.getId(), month, finalScore);

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

        // Sort by: 1. Final Score (DESC), 2. Utilization (DESC), 3. Not Utilising (ASC), 4. Name (ASC)
        metrics.sort(Comparator
            .comparing((MonthlyMetric m) -> m.getFinalScore(), Comparator.reverseOrder())
            .thenComparing((MonthlyMetric m) -> m.getUtilization(), Comparator.reverseOrder())
            .thenComparing((MonthlyMetric m) -> m.getNotUtilising())  // ASC: lower is better
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

    private void saveTeamMembers(Manager manager, String month, List<EmployeeData> employees, String uploadMode) {
        for (EmployeeData emp : employees) {
            if (emp.preferredFullName == null || emp.preferredFullName.isEmpty()) {
                continue;
            }

            String canonicalName = emp.preferredFullName.toLowerCase();

            Optional<TeamMember> existing = teamMemberRepository
                .findByManagerIdAndMonthAndCanonicalName(manager.getId(), month, canonicalName);

            if (existing.isPresent() && "skip".equalsIgnoreCase(uploadMode)) {
                continue;
            }

            TeamMember teamMember = existing.orElse(TeamMember.builder()
                .managerId(manager.getId())
                .month(month)
                .canonicalName(canonicalName)
                .build());

            teamMember.setPreferredFullName(emp.preferredFullName);
            teamMember.setPreferredFirstName(emp.preferredFirstName);
            teamMember.setPreferredLastName(emp.preferredLastName);
            teamMember.setDepartment(emp.department);
            teamMember.setFunctionalHead(emp.functionalHead);
            teamMember.setDirectorName(emp.directorName);
            teamMember.setHrbp(emp.hrbp);
            teamMember.setOneOnOnesParticipated(emp.participated);
            teamMember.setOneOnOnesSetUp(emp.oneOnOnesSetUp);
            teamMember.setIsUtilizing(emp.participated > 0);

            teamMemberRepository.save(teamMember);
        }
    }

    private static class EmployeeData {
        String managerName;
        String managerEmail;
        String functionalHead;
        String directorName;
        int participated;
        String preferredFullName;
        String preferredFirstName;
        String preferredLastName;
        String department;
        String hrbp;
        int oneOnOnesSetUp;
    }

    private static class ManagerAggregation {
        String managerName;
        String managerEmail;
        String directorName;
        String functionalHead;
        int headcount = 0;
        int oneOnOnes = 0;
        int notUtilising = 0;
        BigDecimal utilization = BigDecimal.ZERO;
        List<EmployeeData> employees = new ArrayList<>();

        ManagerAggregation(String managerName, String managerEmail, String directorName, String functionalHead) {
            this.managerName = managerName;
            this.managerEmail = managerEmail;
            this.directorName = directorName;
            this.functionalHead = functionalHead;
        }

        void addEmployee(EmployeeData emp) {
            employees.add(emp);
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

    private void recalculateSeasonalXPForAllManagers(String month) {
        log.info("Recalculating seasonal XP for all managers based on month: {}", month);

        try {
            FormulaConfig formula = scoringService.getActiveFormula();
            List<String> seasonMonths = getSeasonMonths(month, formula);

            log.info("Season months for {}: {}", month, seasonMonths);

            // Get all managers who have metrics in any of the season months
            List<MonthlyMetric> seasonMetrics = monthlyMetricRepository.findByMonthIn(seasonMonths);
            Set<String> managerIds = seasonMetrics.stream()
                .map(MonthlyMetric::getManagerId)
                .collect(Collectors.toSet());

            log.info("Recalculating seasonal XP for {} managers", managerIds.size());

            for (String managerId : managerIds) {
                xpService.recalculateSeasonalXP(managerId, seasonMonths);
            }

            log.info("Seasonal XP recalculation completed");
        } catch (Exception e) {
            log.error("Error recalculating seasonal XP", e);
        }
    }

    private List<String> getSeasonMonths(String currentMonth, FormulaConfig formula) {
        List<String> months = new ArrayList<>();

        try {
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM");
            java.time.LocalDate current = java.time.LocalDate.parse(currentMonth + "-01");

            int monthsInSeason = getSeasonalMonthCount(formula);
            int startMonth = getSeasonStartMonth(current, monthsInSeason);

            java.time.LocalDate seasonStart = current.withMonth(startMonth).withDayOfMonth(1);

            for (int i = 0; i < monthsInSeason; i++) {
                java.time.LocalDate monthDate = seasonStart.plusMonths(i);
                if (!monthDate.isAfter(current)) {
                    months.add(monthDate.format(formatter));
                }
            }
        } catch (Exception e) {
            log.error("Error calculating season months", e);
            months.add(currentMonth);
        }

        return months;
    }

    private int getSeasonalMonthCount(FormulaConfig formula) {
        String periodType = formula.getSeasonalPeriodType();
        if (periodType == null) periodType = "QUARTERLY";

        return switch (periodType) {
            case "MONTHLY" -> 1;
            case "QUARTERLY" -> 3;
            case "SEMI_ANNUALLY" -> 6;
            case "ANNUALLY" -> 12;
            case "CUSTOM" -> formula.getSeasonalCustomMonths() != null ? formula.getSeasonalCustomMonths() : 3;
            default -> 3;
        };
    }

    private int getSeasonStartMonth(java.time.LocalDate current, int monthsInSeason) {
        int currentMonth = current.getMonthValue();
        return ((currentMonth - 1) / monthsInSeason) * monthsInSeason + 1;
    }
}

