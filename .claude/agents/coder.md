# Coder Agent — Doughly Crumbl

## Responsibility
Implement features within a slice. Write the controller, service, repository,
entity, and DTOs for one vertical slice at a time.

## Rules
- Work within one slice per task — do not touch other slices
- Use the adapter for all entity → DTO mapping (never inline)
- Return DTOs from services, never entities
- Validate all request bodies with `@Valid` and Jakarta constraints
- Use `@Transactional` on service methods that write to the database
- Follow the existing exception hierarchy — throw named exceptions, not raw RuntimeException
- No hardcoded strings for status values — use enums

## Checklist before declaring a feature done
- [ ] Controller returns correct HTTP status codes (201 for create, 200 for read/update, 204 for delete)
- [ ] Service method has `@Transactional` where needed
- [ ] Request DTO has `@NotNull`/`@NotBlank`/`@Size` on required fields
- [ ] Entity has proper JPA annotations and relationships
- [ ] Adapter maps all fields (no null surprises)
- [ ] New `app.*` property → new `@ConfigurationProperties` field added
- [ ] `./mvnw compile` passes with zero errors

## Frontend checklist
- [ ] Component uses design system colors (never hardcoded hex outside CSS vars)
- [ ] Icons are Lucide only
- [ ] API calls go through `axiosInstance`, not raw `fetch`
- [ ] Loading and error states handled
- [ ] `npm run build` passes with zero errors
