package com.tekion.tekleader.service;

import com.tekion.tekleader.dto.HierarchyResponse;
import com.tekion.tekleader.entity.*;
import com.tekion.tekleader.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HierarchyService {

    private final ManagerRepository managerRepository;
    private final MonthlyMetricRepository monthlyMetricRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final BadgeAwardRepository badgeAwardRepository;
    private final BadgeDefinitionRepository badgeDefinitionRepository;

    public List<HierarchyResponse.FunctionalHeadNode> getFunctionalHeadHierarchy(String month) {
        List<MonthlyMetric> allMetrics = monthlyMetricRepository.findByMonth(month);
        Map<String, Manager> managerMap = managerRepository.findAll().stream()
            .collect(Collectors.toMap(Manager::getId, m -> m));

        Map<String, List<MonthlyMetric>> byFunctionalHead = allMetrics.stream()
            .collect(Collectors.groupingBy(MonthlyMetric::getFunctionalHead));

        return byFunctionalHead.entrySet().stream()
            .map(entry -> buildFunctionalHeadNode(entry.getKey(), entry.getValue(), managerMap, month))
            .sorted(Comparator.comparing(HierarchyResponse.FunctionalHeadNode::getName))
            .collect(Collectors.toList());
    }

    public HierarchyResponse.DirectorNode getDirectorHierarchy(String directorName, String month) {
        // Find all managers under this director
        List<Manager> managersUnderDirector = managerRepository.findAll().stream()
            .filter(m -> directorName.equalsIgnoreCase(m.getDirectorName()))
            .collect(Collectors.toList());

        // Get metrics for these managers
        List<MonthlyMetric> metrics = managersUnderDirector.stream()
            .map(m -> monthlyMetricRepository.findByManagerIdAndMonth(m.getId(), month))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .collect(Collectors.toList());

        Map<String, Manager> managerMap = managerRepository.findAll().stream()
            .collect(Collectors.toMap(Manager::getId, m -> m));

        return buildDirectorNode(directorName, metrics, managerMap, month);
    }

    public List<String> getAllDirectorNames() {
        return managerRepository.findAll().stream()
            .map(Manager::getDirectorName)
            .filter(Objects::nonNull)
            .filter(name -> !name.isEmpty())
            .filter(name -> !name.equalsIgnoreCase("Unknown"))
            .filter(name -> !name.equalsIgnoreCase("Unassigned"))
            .distinct()
            .sorted()
            .collect(Collectors.toList());
    }

    public List<String> getAllFunctionalHeadNames() {
        return managerRepository.findAll().stream()
            .map(Manager::getFunctionalHead)
            .filter(Objects::nonNull)
            .filter(name -> !name.isEmpty())
            .filter(name -> !name.equalsIgnoreCase("Unknown"))
            .filter(name -> !name.equalsIgnoreCase("Unassigned"))
            .distinct()
            .sorted()
            .collect(Collectors.toList());
    }

    private HierarchyResponse.FunctionalHeadNode buildFunctionalHeadNode(
        String functionalHead,
        List<MonthlyMetric> metrics,
        Map<String, Manager> managerMap,
        String month
    ) {
        Map<String, List<MonthlyMetric>> byDirector = new HashMap<>();
        
        for (MonthlyMetric metric : metrics) {
            Manager manager = managerMap.get(metric.getManagerId());
            if (manager != null) {
                String directorName = manager.getDirectorName() != null ? manager.getDirectorName() : "Unassigned";
                byDirector.computeIfAbsent(directorName, k -> new ArrayList<>()).add(metric);
            }
        }

        List<HierarchyResponse.DirectorNode> directors = byDirector.entrySet().stream()
            .map(entry -> buildDirectorNode(entry.getKey(), entry.getValue(), managerMap, month))
            .sorted(Comparator.comparing(HierarchyResponse.DirectorNode::getName))
            .collect(Collectors.toList());

        int totalManagers = metrics.size();
        int totalTeamMembers = metrics.stream()
            .mapToInt(MonthlyMetric::getHeadcount)
            .sum();
        
        BigDecimal avgScore = metrics.stream()
            .map(MonthlyMetric::getFinalScore)
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .divide(BigDecimal.valueOf(metrics.size()), 2, RoundingMode.HALF_UP);

        return HierarchyResponse.FunctionalHeadNode.builder()
            .name(functionalHead)
            .directors(directors)
            .totalManagers(totalManagers)
            .totalTeamMembers(totalTeamMembers)
            .avgScore(avgScore)
            .build();
    }

    private HierarchyResponse.DirectorNode buildDirectorNode(
        String directorName,
        List<MonthlyMetric> metrics,
        Map<String, Manager> managerMap,
        String month
    ) {
        List<HierarchyResponse.ManagerNode> managers = metrics.stream()
            .map(metric -> buildManagerNode(metric, managerMap.get(metric.getManagerId()), month))
            .sorted(Comparator.comparing(HierarchyResponse.ManagerNode::getDisplayName))
            .collect(Collectors.toList());

        int totalTeamMembers = metrics.stream()
            .mapToInt(MonthlyMetric::getHeadcount)
            .sum();

        BigDecimal avgScore = metrics.isEmpty() ? BigDecimal.ZERO :
            metrics.stream()
                .map(MonthlyMetric::getFinalScore)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(metrics.size()), 2, RoundingMode.HALF_UP);

        return HierarchyResponse.DirectorNode.builder()
            .id(null)
            .name(directorName)
            .email(null)
            .avatarUrl(null)
            .managers(managers)
            .totalTeamMembers(totalTeamMembers)
            .avgScore(avgScore)
            .build();
    }

    private HierarchyResponse.ManagerNode buildManagerNode(
        MonthlyMetric metric,
        Manager manager,
        String month
    ) {
        List<TeamMember> teamMembers = teamMemberRepository.findByManagerIdAndMonth(
            metric.getManagerId(), month
        );

        List<HierarchyResponse.TeamMemberNode> teamMemberNodes = teamMembers.stream()
            .map(tm -> HierarchyResponse.TeamMemberNode.builder()
                .name(tm.getPreferredFullName())
                .department(tm.getDepartment())
                .isUtilizing(tm.getIsUtilizing())
                .oneOnOnesCount(tm.getOneOnOnesParticipated() != null ? tm.getOneOnOnesParticipated() : 0)
                .build())
            .collect(Collectors.toList());

        List<BadgeAward> awards = badgeAwardRepository.findByManagerIdAndMonth(
            metric.getManagerId(), month
        );

        List<HierarchyResponse.BadgeInfo> badges = awards.stream()
            .map(award -> {
                BadgeDefinition def = badgeDefinitionRepository.findById(award.getBadgeDefinitionId()).orElse(null);
                return def != null ? HierarchyResponse.BadgeInfo.builder()
                    .code(def.getCode())
                    .name(def.getName())
                    .iconKey(def.getIconKey())
                    .color(def.getColor())
                    .build() : null;
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        return HierarchyResponse.ManagerNode.builder()
            .id(manager != null ? manager.getId() : null)
            .displayName(manager != null ? manager.getDisplayName() : "Unknown")
            .email(manager != null ? manager.getEmail() : null)
            .avatarUrl(manager != null ? manager.getAvatarUrl() : null)
            .classificationBand(metric.getClassificationBand())
            .finalScore(metric.getFinalScore())
            .utilization(metric.getUtilization())
            .headcount(metric.getHeadcount())
            .teamMembers(teamMemberNodes)
            .badges(badges)
            .build();
    }
}
