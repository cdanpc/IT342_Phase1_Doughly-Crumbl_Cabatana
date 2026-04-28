# /debug — Full-Stack Diagnostic

Runs all compiler, type-checker, and build-tool checks for Doughly Crumbl
and produces a classified report of every **Error**, **Warning**, and **Info**
— exactly what you'd see in the VSCode Problems panel.

Optionally fixes all Errors automatically, then re-runs to confirm clean.

---

## Step 1 — Frontend: TypeScript type check

Run from `web/`:
```bash
cd web && npx tsc --noEmit 2>&1
```

Collect every line that contains:
- `error TS` → **🔴 Error**
- `warning` → **🟡 Warning**

Record: file path, line number, TS error code, message.

---

## Step 2 — Frontend: Vite production build

Run from `web/`:
```bash
cd web && npm run build 2>&1
```

Collect:
- Lines starting with `ERROR` or `error` → **🔴 Error**
- Lines starting with `warn` or `WARN` → **🟡 Warning**
- Plugin or transform errors → **🔴 Error**

A successful build ends with `✓ built in Xs`. If that line is absent, treat it as an error.

---

## Step 3 — Frontend: ESLint (if config exists)

Check if `web/eslint.config.*` or `web/.eslintrc*` exists. If yes, run:
```bash
cd web && npx eslint src/ --ext .ts,.tsx --max-warnings=9999 2>&1
```

Collect:
- Lines marked `error` → **🔴 Error**
- Lines marked `warning` → **🟡 Warning**

If no ESLint config exists, skip this step and note it as unconfigured.

---

## Step 4 — Backend: Java compile

Run from `backend/`:
```bash
cd backend && ./mvnw compile 2>&1
```

Collect:
- `ERROR` lines → **🔴 Error**
- `WARNING` lines → **🟡 Warning**
- `[INFO]` lines that indicate a problem (e.g. dependency conflicts) → **🔵 Info**

A successful compile ends with `BUILD SUCCESS`. If `BUILD FAILURE` appears, all
errors under it are **🔴 Error**.

---

## Step 5 — Backend: Maven test compile (catches test-only import errors)

```bash
cd backend && ./mvnw test-compile 2>&1
```

Same classification as Step 4. This catches broken imports in test files that
`compile` alone misses.

---

## Report format

After all five steps, write the findings to the terminal in this format:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/debug — Doughly Crumbl Diagnostic Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🔴 Errors (N)

### [tsc] TypeScript
  web/src/features/checkout/CheckoutModal.tsx:42 — TS2345: Argument of type...

### [vite] Build
  web/src/layout/OrderPanel.tsx — Cannot find module '...'

### [javac] Backend compile
  backend/src/.../OrderService.java:88 — cannot find symbol: OrderAdapter

---

## 🟡 Warnings (N)

### [eslint] Frontend
  web/src/features/menu/MenuPage.tsx:17 — react-hooks/exhaustive-deps: ...

### [mvn] Backend
  [WARNING] Some dependencies could not be resolved...

---

## 🔵 Infos (N)
  (list any informational diagnostics here)

---

## ✅ Clean (list checks that passed with zero issues)
  - tsc: 0 errors
  - vite build: success
  - mvn compile: BUILD SUCCESS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: N errors · N warnings · N infos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Auto-fix behaviour

After printing the report:

- If there are **zero errors** — print `✅ All checks clean. Nothing to fix.` and stop.
- If there are **errors** — ask the user:
  > "Found N errors. Fix them all automatically? (yes / show me first)"
  - **yes** → fix each error, then re-run Steps 1–5 to confirm clean
  - **show me first** → display the diff for each proposed fix and wait for approval per file

**Never auto-fix warnings or infos.** Report them and let the developer decide.

---

## Common errors in this project and their fixes

| Error | Root cause | Fix |
|---|---|---|
| `Cannot find module '../../shared/api/...'` | Import path wrong after VSA move | Update import to new `shared/api/` path |
| `TS2345 Argument of type 'string' is not assignable to 'OrderStatus'` | Status string not cast | Cast with `as OrderStatus` or use the enum |
| `cannot find symbol` in Java after refactor | Package changed but import not updated | Update `import` to new `features/<slice>/` package |
| `BUILD FAILURE: No tests found` | Test class missing `@Test` or wrong runner | Add `@Test` annotation or fix `@ExtendWith` |
| `eslint: react-hooks/exhaustive-deps` | Missing dep in `useEffect` array | Add the missing dependency or wrap in `useCallback` |
