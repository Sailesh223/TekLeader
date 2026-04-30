# Functional Head Onboarding Guide

## Overview
This guide explains how to onboard a new functional head starting from a specific month (e.g., April 2026) while maintaining complete backward compatibility.

## System Architecture (Date-Aware Design)

### ✅ Good News: The System Already Supports Date-Gated Functional Heads!

The TEKLeader system stores functional head information in **TWO** places:

1. **`Manager.functionalHead`** (Static - for reference only)
   - Stores the "current" or "latest" functional head
   - Used for quick lookups
   - **Not used for historical filtering**

2. **`MonthlyMetric.functionalHead`** (Monthly - SOURCE OF TRUTH) ⭐
   - Stored **per manager per month**
   - Comes from Excel upload "Functional Head Name" column
   - **This is what drives all dashboards, filters, and calculations**

### Key Insight
Because `MonthlyMetric.functionalHead` is stored monthly, the system **automatically** maintains historical data integrity. A manager can have:
- January-March 2026: Functional Head = "Kunal Bhattacharya"
- April 2026 onwards: Functional Head = "New Functional Head"

---

## How to Onboard a New Functional Head

### Step 1: Prepare Excel Data for April
For April 2026 Excel upload, update the "Functional Head Name" column:
- Managers moving to new functional head: Enter new functional head name
- Managers staying with existing functional heads: Keep existing names

Example:
```
Manager Name          | Functional Head Name
---------------------|----------------------
John Doe             | New Functional Head    <-- Changed from April
Jane Smith           | Kunal Bhattacharya     <-- Unchanged
```

### Step 2: Upload April Data
Upload the April Excel file normally. The system will:
- ✅ Create new `MonthlyMetric` records with the new functional head for April
- ✅ Keep all pre-April data exactly as-is (unchanged)
- ✅ The new functional head will automatically appear in April filters

### Step 3: Verify Data Isolation
Check that:
- Pre-April months: Old functional head appears
- April and later: New functional head appears
- No historical data was modified

---

## Technical Details

### Data Model
```java
@Document(collection = "monthly_metrics")
public class MonthlyMetric {
    private String managerId;
    private String month;              // "2026-04"
    private String functionalHead;      // Per-month functional head
    private BigDecimal finalScore;
    // ... other fields
}
```

### How Filtering Works
All dashboard queries filter by `month` first, then group by `MonthlyMetric.functionalHead`:

```java
// HierarchyService.java
public List<FunctionalHeadNode> getFunctionalHeadHierarchy(String month) {
    List<MonthlyMetric> allMetrics = monthlyMetricRepository.findByMonth(month);
    
    // Groups by the functional head FROM THAT MONTH's data
    Map<String, List<MonthlyMetric>> byFunctionalHead = allMetrics.stream()
        .collect(Collectors.groupingBy(MonthlyMetric::getFunctionalHead));
    
    // Returns only functional heads that have data for this month
    return buildHierarchy(byFunctionalHead);
}
```

### Leaderboard Filtering
```java
// LeaderboardService.java
List<MonthlyMetric> metrics = monthlyMetricRepository.findFilteredMetrics(
    month,                    // April 2026
    functionalHead,           // "New Functional Head" or null for all
    band                      // Classification band filter
);
```

---

## Automatic Features (No Code Changes Needed)

### ✅ 1. Backward Compatibility
- Pre-April data: Unchanged
- All filters/views for old months: Show only old functional heads

### ✅ 2. Date-Gated Visibility
- April filter selected: New functional head appears in dropdown
- March filter selected: New functional head does NOT appear

### ✅ 3. Data Isolation
- Manager's pre-April metrics: Link to old functional head
- Manager's April metrics: Link to new functional head

### ✅ 4. Badge Calculations
- Badges are awarded per month
- Each month's calculation uses that month's functional head assignment

### ✅ 5. Score Aggregations
- Seasonal XP: Calculated across months, respects each month's functional head
- Leaderboard: Always uses the selected month's functional head data

---

## Frontend Behavior (Automatic)

### Functional Head Dashboard
```typescript
// Automatically filtered by selected month
const response = await fetch(`/api/hierarchy/functional-heads?month=${selectedMonth}`);
```
- Selecting April 2026: Shows new functional head
- Selecting March 2026: Shows only old functional heads

### Leaderboard Filters
The functional head dropdown is populated dynamically based on the selected month's data.

---

## Manager Entity Update (Optional)

The `Manager.functionalHead` field can be updated to reflect the "current" functional head:

```java
// In ExcelImportService.java - already implemented!
private Manager getOrCreateManager(..., String functionalHead) {
    Manager manager = existing.orElse(new Manager());
    
    // This updates the "current" functional head reference
    if (!functionalHead.equals(manager.getFunctionalHead())) {
        manager.setFunctionalHead(functionalHead);
    }
    
    return managerRepository.save(manager);
}
```

This happens automatically during Excel upload, so the Manager entity always reflects the latest functional head assignment.

---

## Summary

### What You Need to Do:
1. ✅ Update April Excel file with new functional head name in "Functional Head Name" column
2. ✅ Upload April file normally
3. ✅ Verify the new functional head appears when filtering to April

### What the System Handles Automatically:
- ✅ Maintains all pre-April data unchanged
- ✅ Shows new functional head only for April and later
- ✅ Isolates data properly per month
- ✅ Calculates badges/scores correctly per month
- ✅ Updates manager's "current" functional head reference

### No Code Changes Required! 🎉

The system is already designed to handle this scenario perfectly. The monthly storage of functional head data provides complete date-gated functionality out of the box.
