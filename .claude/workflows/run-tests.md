# Workflow: Run Tests — Doughly Crumbl

## Quick reference
```bash
# Backend — from /backend or repo root with -pl backend
./mvnw compile                             # compile only (fastest)
./mvnw test                                # all unit + integration tests
./mvnw test -Dtest=OrderServiceTest        # single test class
./mvnw test -Dtest=OrderServiceTest#testCreateOrder  # single method

# Frontend — from /web
npm run build                              # TypeScript check + Vite bundle (CI equivalent)
npm run dev                                # dev server (manual testing)
```

## Test locations
```
backend/src/test/java/edu/cit/cabatana/doughlycrumbl/features/
├── product/ProductServiceTest.java
├── order/OrderServiceTest.java
├── delivery/DeliveryServiceTest.java
└── cart/CartControllerIntegrationTest.java
```

## What to run after each refactor move
1. `./mvnw compile` — verify imports are correct
2. `./mvnw test` — verify no behaviour broken
3. `npm run build` — verify frontend types still resolve
4. Manual smoke test: login → add to cart → checkout

## Interpreting test output
- `BUILD SUCCESS` with `Tests run: N, Failures: 0, Errors: 0` = all good
- Any `FAILURE` or `ERROR` = stop, fix before next move
- `[WARNING]` lines about unused imports = acceptable, not blocking

## Test data
- Unit tests use Mockito mocks — no database needed
- `@WebMvcTest` uses `@MockBean` for services — no database needed
- `@SpringBootTest` connects to the real Supabase database — use `@Transactional` to roll back
