# Runbook: Deploy Doughly Crumbl

## Prerequisites
- Java 17 installed
- Node 20+ installed
- Access to Supabase PostgreSQL credentials
- Backend `application.properties` configured with real values

---

## Backend Deployment

### 1. Build the JAR
```bash
cd backend
./mvnw clean package -DskipTests
# Output: target/doughlycrumbl-0.0.1-SNAPSHOT.jar
```

### 2. Set environment variables (production)
Do NOT commit real credentials. Set these as environment variables:
```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:5432/postgres?sslmode=require
export SPRING_DATASOURCE_USERNAME=<username>
export SPRING_DATASOURCE_PASSWORD=<password>
export APP_JWT_SECRET=<strong-random-secret>
export APP_PAYMONGO_SECRET_KEY=<live-key>
export APP_PAYMONGO_PUBLIC_KEY=<live-public-key>
```

### 3. Run the JAR
```bash
java -jar target/doughlycrumbl-0.0.1-SNAPSHOT.jar \
  --server.port=8080 \
  --spring.profiles.active=prod
```

### 4. Verify
```bash
curl http://localhost:8080/api/products?page=0&size=5
# Expect: 200 OK with product list
```

---

## Frontend Deployment

### 1. Build
```bash
cd web
npm install
npm run build
# Output: dist/
```

### 2. Update API base URL
In `web/src/api/axiosInstance.ts`, set `baseURL` to the production backend URL
before building for production.

### 3. Serve
Deploy `dist/` to any static host (Netlify, Vercel, Nginx):

**Nginx example:**
```nginx
server {
    listen 80;
    root /var/www/doughlycrumbl/dist;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    location /api/ { proxy_pass http://localhost:8080; }
}
```

---

## Database
- Schema is auto-managed by Hibernate (`ddl-auto=update`)
- No manual migration scripts needed for MVP
- First run will create all tables automatically

---

## Health check
```bash
curl http://<backend-host>:8080/api/products?page=0&size=1
curl http://<frontend-host>/
```
