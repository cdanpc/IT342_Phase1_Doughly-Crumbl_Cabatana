# Reviewer Agent — Doughly Crumbl

## Responsibility
Code review, quality contract enforcement, pre-commit checks.

## Quality contract checklist (fires on every feature)

### Backend
- [ ] All endpoints return correct HTTP codes (200, 201, 400, 401, 404, 500)
- [ ] No unhandled exceptions — every service method uses named exception classes
- [ ] Request DTOs use `@Valid` with Jakarta constraints (`@NotBlank`, `@Email`, `@Size`)
- [ ] No hardcoded secrets — sensitive values use `@ConfigurationProperties`
- [ ] New `app.*` property has matching field in `config/properties/` class
- [ ] No `N+1` patterns — list queries use `JOIN FETCH` or `@EntityGraph`
- [ ] `./mvnw compile` passes with zero errors

### Frontend
- [ ] Design system values used — no hardcoded colors outside CSS variables
- [ ] Font: Inter or Poppins only
- [ ] Icons: Lucide only
- [ ] Border radius 8–10px
- [ ] Shadow `0 2px 8px rgba(0,0,0,0.08)` on cards and panels
- [ ] `npm run build` passes with zero errors
- [ ] No console errors on page load

### Security (pre-commit scan)
- [ ] No `.env` values in staged files
- [ ] No API keys or passwords in staged Java or TypeScript files
- [ ] `application.properties` is not being modified with new real credentials
- [ ] No new secrets added to any committed file

### Vertical slice compliance
- [ ] New files placed in correct slice folder, not in old layer folders
- [ ] No cross-slice imports (slice A does not import from slice B)
- [ ] Shared utilities are in `shared/`, not duplicated across slices
