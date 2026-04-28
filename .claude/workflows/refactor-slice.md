# Workflow: Move a File into Its Vertical Slice — Doughly Crumbl

## Rule: move only, never rewrite
During a structural refactor, do not change logic. Move the file, fix imports, compile, commit.
Logic changes are a separate PR.

## Backend: moving one class

### Step 1 — Identify destination
Check `agents/architect.md` for the correct slice.
Example: `service/OrderService.java` → `features/order/OrderService.java`

### Step 2 — Move the file
```bash
# Create destination directory if needed
mkdir -p backend/src/main/java/edu/cit/cabatana/doughlycrumbl/features/order

# Move (git mv preserves history)
git mv backend/src/main/java/edu/cit/cabatana/doughlycrumbl/service/OrderService.java \
       backend/src/main/java/edu/cit/cabatana/doughlycrumbl/features/order/OrderService.java
```

### Step 3 — Update the package declaration
Change line 1 of the moved file:
```java
// Before
package edu.cit.cabatana.doughlycrumbl.service;
// After
package edu.cit.cabatana.doughlycrumbl.features.order;
```

### Step 4 — Fix all import references
Find every file that imports the old path and update it:
```bash
grep -r "import edu.cit.cabatana.doughlycrumbl.service.OrderService" backend/src/main
```
Update each found import to the new path.

### Step 5 — Compile
```bash
./mvnw compile
```
If errors: fix imports, compile again. If still failing after 2 attempts, stop and report.

### Step 6 — Commit this one slice move
```bash
git add -A
git commit -m "refactor(order): move OrderService to features/order slice"
```

## Frontend: moving one component

### Step 1 — Move the file
```bash
git mv web/src/pages/OrdersPage.tsx web/src/features/orders/MyOrdersPage.tsx
```

### Step 2 — Update all imports referencing the old path
```bash
grep -r "from.*pages/OrdersPage" web/src
```
Update each found import.

### Step 3 — Update route in AppRouter.tsx
Change the import path for the moved component.

### Step 4 — Build check
```bash
npm run build
```

### Step 5 — Commit
```bash
git commit -m "refactor(orders): move OrdersPage to features/orders slice"
```

## Order of moves (backend)
1. `shared/` — config, exception, util (no dependencies to fix)
2. `auth` slice
3. `user` slice
4. `product` slice
5. `cart` slice
6. `order` slice
7. `payment` slice
8. `delivery` slice
9. `notification` slice
