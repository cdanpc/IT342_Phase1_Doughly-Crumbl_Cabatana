# Full Regression Test Report — Doughly Crumbl

**Filename:** FullRegressionReport_G5_DoughlyCrumbl.pdf *(export from this document)*
**Project:** Doughly Crumbl
**Group:** G5 — Cabatana
**Branch:** refactor/vertical-slice-architecture

> Template populated in Part 8 of the vertical slice refactoring session.
> Sections 5–8 contain placeholders to be filled after test execution.

---

## 1. Project Information

| Field | Value |
|---|---|
| Project | Doughly Crumbl — Artisan Bakery Web Application |
| Group | G5 — Cabatana |
| Branch | refactor/vertical-slice-architecture |
| Date of test run | [DATE] |
| Tester | Chris Daniel Cabataña |
| Backend version | Spring Boot 3.5.0, Java 17 |
| Frontend version | React 18, Vite 7, TypeScript 5.9 |

---

## 2. Refactoring Summary

### What changed
- Architecture: horizontal layer-based → Vertical Slice Architecture (VSA)
- Backend reorganized from `controller/`, `service/`, `repository/`, `model/`, `dto/`
  into `features/<slice>/` and `shared/`
- Frontend reorganized from `pages/`, `components/` into `features/<slice>/`,
  `shared/`, and `layout/`

### Files moved per feature

| Slice | Backend files moved | Frontend files moved |
|---|---|---|
| auth | [count] | [count] |
| user | [count] | [count] |
| product | [count] | [count] |
| cart | [count] | [count] |
| order | [count] | [count] |
| payment | [count] | [count] |
| delivery | [count] | [count] |
| notification | [count] | [count] |
| shared | [count] | [count] |

### Compile and build status

| Check | Before refactor | After refactor |
|---|---|---|
| `./mvnw compile` | [PASS/FAIL] | [PASS/FAIL] |
| `./mvnw test` | [PASS/FAIL] | [PASS/FAIL] |
| `npm run build` | [PASS/FAIL] | [PASS/FAIL] |

---

## 3. Updated Project Structure

### Backend (after refactor)
```
[Paste tree output here after refactor is complete]
```

### Frontend (after refactor)
```
[Paste tree output here after refactor is complete]
```

### .claude/ (restructured in Part 2)
```
.claude/
├── memory/     (global.md, patterns.md, mistakes.md)
├── skills/     (coding/, testing/)
├── agents/     (architect.md, coder.md, tester.md, reviewer.md)
└── workflows/  (build-feature.md, run-tests.md, refactor-slice.md)
```

---

## 4. Test Plan Summary

| Feature | Test classes | Test methods | Coverage |
|---|---|---|---|
| Product | ProductServiceTest | [count] | [%] |
| Delivery | DeliveryServiceTest | 4 | Fee tiers |
| Order | OrderServiceTest | [count] | Status transitions |
| Cart | CartControllerIntegrationTest | 3 | CRUD endpoints |

---

## 5. Automated Test Evidence

### Test run output
```
[PLACEHOLDER — paste ./mvnw test output here]
Tests run: X, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

### Screenshots
> [PLACEHOLDER — attach screenshots of test results in IDE or terminal]

---

## 6. Regression Test Results

| AC / Feature | Expected | Actual | Pass/Fail | Notes |
|---|---|---|---|---|
| AC-10: Add to bag | Item appears in sidebar | [ACTUAL] | [P/F] | |
| AC-11: Update qty | Subtotal recalculates | [ACTUAL] | [P/F] | |
| AC-12: Remove item | Item removed, total updates | [ACTUAL] | [P/F] | |
| AC-13: Collapse bag | Sidebar toggles | [ACTUAL] | [P/F] | |
| AC-14: Checkout | Checkout modal opens | [ACTUAL] | [P/F] | |
| AC-15: Delivery fee | Correct tier applied | [ACTUAL] | [P/F] | |
| AC-16: Payment flow | Instructions shown | [ACTUAL] | [P/F] | |
| AC-17: Order created | Order ID shown on confirm | [ACTUAL] | [P/F] | |
| AC-18: Failed payment | Bag preserved | [ACTUAL] | [P/F] | |
| Login | JWT returned | [ACTUAL] | [P/F] | |
| Register | User created, token returned | [ACTUAL] | [P/F] | |
| Product list | Paginated, filterable | [ACTUAL] | [P/F] | |

---

## 7. Issues Found

| Issue ID | Description | Severity | Status |
|---|---|---|---|
| [ISS-001] | [Description] | [High/Med/Low] | [Open/Fixed] |

---

## 8. Fixes Applied

| Fix ID | Issue Ref | What Was Changed | Commit |
|---|---|---|---|
| [FIX-001] | [ISS-001] | [Description] | [hash] |
