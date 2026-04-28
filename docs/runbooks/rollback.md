# Runbook: Rollback a Bad Release

## When to rollback
- Backend returns 500 on core endpoints after a deploy
- Frontend build broken (blank page, JS errors on load)
- Database migration produced incorrect schema
- A commit introduced a regression that cannot be hotfixed quickly

---

## Backend rollback

### Option A — Redeploy previous JAR
```bash
# Find the previous build in CI/CD artifacts or local target/
java -jar doughlycrumbl-<previous-version>.jar
```

### Option B — Revert via git and rebuild
```bash
# Find the last known good commit
git log --oneline -10

# Create a rollback branch from that commit
git checkout -b hotfix/rollback-<date> <good-commit-hash>

# Rebuild
cd backend
./mvnw clean package -DskipTests
java -jar target/doughlycrumbl-0.0.1-SNAPSHOT.jar
```

### Option C — Revert a specific commit
```bash
git revert <bad-commit-hash>
git push origin main
# Redeploy
```

---

## Frontend rollback

### Option A — Redeploy previous dist/
Keep a copy of the last known good `dist/` folder before each deploy.
Replace the current `dist/` with the backup and reload the static server.

### Option B — Revert and rebuild
```bash
git checkout -b hotfix/frontend-rollback <good-commit-hash>
cd web
npm run build
# Redeploy dist/
```

---

## Database rollback

> Hibernate `ddl-auto=update` only adds columns/tables — it does not drop them.
> Rolling back code that added a column will leave the column in the DB (harmless).
> Rolling back code that added a table: drop the table manually if needed.

```sql
-- Example: drop a table added in a bad release
DROP TABLE IF EXISTS new_table_name;
```

**Never run DROP on `users`, `products`, `orders`, `carts`, `cart_items`,
`order_items`, or `notifications` without a confirmed backup.**

---

## Verification after rollback
```bash
# Backend
curl http://localhost:8080/api/products?page=0&size=1   # expect 200
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Password1!"}' # expect 200 with token

# Frontend
# Open browser → login → add to cart → confirm order bag appears
```

---

## Contacts
- GitHub repo: https://github.com/cdanpc/IT342_Phase1_Doughly-Crumbl_Cabatana
- Supabase dashboard: https://supabase.com/dashboard
