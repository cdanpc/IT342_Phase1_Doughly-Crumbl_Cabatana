# Workflow: Build a New Feature Slice — Doughly Crumbl

## When to use
Adding a new feature that does not exist yet (new slice or extending existing).

## Steps

### 1. Identify the slice
- Does a slice already exist for this feature? If yes, add to it.
- If no, create a new folder: `features/<slice-name>/`
- Check `agents/architect.md` for the current slice map.

### 2. Backend — create the slice
```
features/<slice>/
├── <Slice>Controller.java
├── <Slice>Service.java
├── <Slice>Repository.java   (if this slice owns a table)
├── <Slice>.java             (entity, if new table)
├── <Slice>Request.java
└── <Slice>Response.java
```

### 3. Backend — wire it up
- Add `@RestController`, `@RequestMapping("/api/<slice>")` to controller
- Inject service with `@RequiredArgsConstructor`
- Secure admin endpoints with `@PreAuthorize("hasRole('ADMIN')")`
- Register new routes in `SecurityConfig` if they need to be public

### 4. Backend — compile check
```bash
./mvnw compile
```
Fix all errors before continuing.

### 5. Frontend — create the slice
```
features/<slice>/
├── <Slice>Page.tsx
├── <SubComponent>.tsx
└── <SubComponent>.css
```

### 6. Frontend — wire it up
- Add route in `AppRouter.tsx`
- Add to `ROUTES` constants in `utils/routes.ts`
- Add API function in `<slice>Api.ts`
- Add to sidebar nav in `Sidebar.tsx` if user-facing

### 7. Frontend — build check
```bash
npm run build
```
Fix all errors before continuing.

### 8. Commit
```bash
git add <specific files only>
git commit -m "feat(<slice>): <what it does>"
```

### 9. Update docs
- Check the relevant AC off in `docs/tasks.md`
- Update `docs/MASTER.md` if an architectural decision was made
