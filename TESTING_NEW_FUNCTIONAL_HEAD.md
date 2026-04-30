# Testing New Functional Head Onboarding

## Test Scenario: Adding "New Functional Head" Starting April 2026

### Assumptions
- **Current Functional Heads:** Kunal Bhattacharya, Teza Mukkavilli
- **New Functional Head:** "Rajesh Kumar" (example name)
- **Start Month:** April 2026 (2026-04)
- **Managers Transitioning:** 
  - Manager A (was under Kunal, moving to Rajesh)
  - Manager B (was under Teza, moving to Rajesh)

---

## Test Plan

### 1. Verify Pre-April Data (Backward Compatibility)

**Test:**
```bash
GET /api/hierarchy/functional-heads?month=2026-03
GET /api/leaderboard?month=2026-03&page=0&size=50
```

**Expected Result:**
- ✅ Only shows "Kunal Bhattacharya" and "Teza Mukkavilli"
- ✅ Manager A appears under Kunal's hierarchy
- ✅ Manager B appears under Teza's hierarchy
- ✅ "Rajesh Kumar" does NOT appear at all

**Verification Points:**
- March hierarchy should have NO references to new functional head
- All historical data unchanged
- Badge counts, scores, and ranks remain identical

---

### 2. Prepare April Excel Upload

**Excel File:** `Tekion_Adoption_April_2026.xlsx`

| Manager Name | Functional Head Name | Director Name | 1:1s Participated with Manager Final | ... |
|--------------|---------------------|---------------|-------------------------------------|-----|
| Manager A    | Rajesh Kumar        | Director X    | 15                                  | ... |
| Manager B    | Rajesh Kumar        | Director Y    | 20                                  | ... |
| Manager C    | Kunal Bhattacharya  | Director Z    | 18                                  | ... |
| Manager D    | Teza Mukkavilli     | Director W    | 22                                  | ... |

**Upload:**
```bash
POST /api/uploads/monthly?month=2026-04&mode=overwrite
Content-Type: multipart/form-data
Body: file=Tekion_Adoption_April_2026.xlsx
```

---

### 3. Verify April Data (Date-Gated Visibility)

**Test:**
```bash
GET /api/hierarchy/functional-heads?month=2026-04
GET /api/hierarchy/functional-heads/list/by-month?month=2026-04
```

**Expected Result:**
- ✅ Shows "Kunal Bhattacharya", "Teza Mukkavilli", AND "Rajesh Kumar"
- ✅ Rajesh Kumar's node shows Manager A and Manager B
- ✅ Kunal's and Teza's nodes show their respective managers (excluding A and B)

**Verification Points:**
- New functional head appears in hierarchy for April
- New functional head appears in filter dropdowns
- Manager counts are correct per functional head

---

### 4. Verify Data Isolation

**Test Manager A's Historical Data:**
```bash
GET /api/managers/{managerId}/metrics
```

**Expected Monthly Metrics for Manager A:**
```json
[
  {
    "month": "2026-04",
    "functionalHead": "Rajesh Kumar",    ← New assignment
    "finalScore": 85.5,
    ...
  },
  {
    "month": "2026-03",
    "functionalHead": "Kunal Bhattacharya",  ← Old assignment preserved
    "finalScore": 82.3,
    ...
  },
  {
    "month": "2026-02",
    "functionalHead": "Kunal Bhattacharya",  ← Old assignment preserved
    "finalScore": 79.8,
    ...
  }
]
```

**Verification Points:**
- ✅ April: Manager A linked to Rajesh Kumar
- ✅ Pre-April: Manager A still linked to Kunal Bhattacharya
- ✅ No historical data was modified

---

### 5. Verify Leaderboard Filtering

**Test 1: Filter by New Functional Head in April**
```bash
GET /api/leaderboard?month=2026-04&functionalHead=Rajesh Kumar&page=0&size=50
```

**Expected Result:**
- ✅ Shows only Manager A and Manager B
- ✅ Rankings are correct for April data
- ✅ Scores calculated properly

**Test 2: Try Filtering by New Functional Head in March (Should be Empty)**
```bash
GET /api/leaderboard?month=2026-03&functionalHead=Rajesh Kumar&page=0&size=50
```

**Expected Result:**
- ✅ Returns empty list or no results
- ✅ Because Rajesh Kumar had no managers in March

---

### 6. Verify Badge Awards

**Test: Award Premium Badge to Manager A for April**
```bash
POST /api/badges/award-premium
{
  "managerId": "...",
  "month": "2026-04",
  "functionalHeadName": "Rajesh Kumar",
  "reason": "Outstanding Q1 performance"
}
```

**Expected Result:**
- ✅ Badge awarded successfully
- ✅ Badge visible in Manager A's April metrics
- ✅ Badge NOT visible in Manager A's March metrics

**Verify in Hierarchy:**
```bash
GET /api/hierarchy/functional-heads?month=2026-04
```
Manager A should show the Premium Badge in Rajesh Kumar's hierarchy.

---

### 7. Verify Seasonal XP Calculation

**Test: Manager A's Seasonal XP (Q1: Jan, Feb, Mar)**
```bash
GET /api/leaderboard/seasonal?season=2026-Q1
```

**Expected Behavior:**
- Manager A's seasonal XP should include Jan-Mar data
- All three months should show "Kunal Bhattacharya" as functional head
- XP calculation should respect the per-month functional head assignment

---

### 8. Verify Frontend Dashboards

**Functional Head Dashboard - March View:**
- Navigate to Functional Head Dashboard
- Select "March 2026"
- **Expected:** 
  - ✅ Sidebar shows only Kunal & Teza
  - ✅ Rajesh Kumar NOT visible
  - ✅ Manager A appears under Kunal

**Functional Head Dashboard - April View:**
- Select "April 2026"
- **Expected:**
  - ✅ Sidebar shows Kunal, Teza, AND Rajesh
  - ✅ Rajesh Kumar's section shows Manager A and B
  - ✅ Kunal's section does NOT show Manager A

**Leaderboard Page - Filter Dropdown:**
- Navigate to Leaderboard
- Select "April 2026"
- Open "Functional Head" filter dropdown
- **Expected:**
  - ✅ Dropdown shows "All", "Kunal Bhattacharya", "Teza Mukkavilli", "Rajesh Kumar"

- Change month to "March 2026"
- **Expected:**
  - ✅ Dropdown shows "All", "Kunal Bhattacharya", "Teza Mukkavilli" ONLY

---

## Success Criteria

### ✅ All Tests Must Pass:
1. Pre-April data completely unchanged
2. New functional head appears ONLY in April and later
3. Manager transitions reflected correctly per month
4. Historical data maintains old functional head assignments
5. Badge awards respect monthly assignments
6. Score calculations work correctly
7. All filters are date-aware
8. Frontend dynamically adjusts based on selected month

---

## Database Verification Queries

### MongoDB Queries for Manual Verification:

**Check Manager A's monthly metrics:**
```javascript
db.monthly_metrics.find({ 
  managerId: "MANAGER_A_ID" 
}).sort({ month: 1 })
```

**Check functional heads by month:**
```javascript
db.monthly_metrics.aggregate([
  { $match: { month: "2026-04" } },
  { $group: { _id: "$functionalHead", count: { $sum: 1 } } }
])
```

**Check Manager entity update:**
```javascript
db.managers.findOne({ _id: "MANAGER_A_ID" })
```
Should show `functionalHead: "Rajesh Kumar"` (updated to latest)

---

## Troubleshooting

### Issue: New functional head doesn't appear in April
**Solution:** Check that April Excel upload completed successfully and `MonthlyMetric` records were created with correct functional head name.

### Issue: Pre-April data shows new functional head
**Solution:** This should NOT happen. If it does, the Excel upload may have overwritten historical data. Use `mode=skip` to avoid this.

### Issue: Manager.functionalHead not updated
**Solution:** This is cosmetic. The critical field is `MonthlyMetric.functionalHead`. However, the Excel import service should auto-update this.

---

## Rollback Plan

If issues occur:
1. Delete April monthly metrics: `db.monthly_metrics.deleteMany({ month: "2026-04" })`
2. Re-upload April Excel with corrected functional head names
3. Historical data (Jan-Mar) remains untouched

---

## Summary

This testing plan validates that the system properly handles:
- ✅ Backward compatibility (no historical changes)
- ✅ Date-gated visibility (new FH only visible for April+)
- ✅ Data isolation (per-month assignments)
- ✅ All calculations respect monthly assignments
- ✅ Frontend adapts dynamically to selected month

The monthly storage of `functionalHead` in `MonthlyMetric` ensures complete date-awareness automatically! 🎉
