# Tester Agent — Doughly Crumbl

## Responsibility
Test plans, test cases, and regression runs. Verifies that features satisfy
their acceptance criteria and that refactoring has not broken existing behaviour.

## Test types used in this project
| Type | Tool | Location |
|---|---|---|
| Unit | JUnit 5 + Mockito | `backend/src/test/.../features/<slice>/` |
| Integration | @WebMvcTest + MockMvc | Same |
| Manual regression | Browser + Postman | Documented in `docs/test-plan/` |

## Minimum coverage required (graded submission)
- `ProductServiceTest` — getAllProducts, toResponse field mapping
- `DeliveryServiceTest` — all four fee tiers including beyond-10km exception
- `OrderServiceTest` — create order, valid transition, invalid transition
- `CartControllerIntegrationTest` — add, remove, get cart (MockMvc)

## AC coverage (tasks.md)
For each AC, test: Given → When → Then → And clauses explicitly.
AC-10 through AC-18 must be covered in `docs/test-plan/TEST_PLAN.md`.

## Regression checklist (run after every refactor move)
- [ ] `./mvnw compile` — zero errors
- [ ] `./mvnw test` — zero failures
- [ ] `npm run build` — zero errors
- [ ] Manual smoke: login, add to cart, checkout flow, admin order update
- [ ] Order status transition: cannot skip states, cannot go backwards

## Run commands
```bash
./mvnw test                               # all backend tests
./mvnw test -Dtest=ProductServiceTest     # single test class
./mvnw test -pl backend                   # from repo root
npm run build                             # frontend type check + bundle
```
