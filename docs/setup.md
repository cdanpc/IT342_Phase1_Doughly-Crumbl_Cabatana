# ⚙️ SETUP.md — Local Development Setup Guide

> Follow this guide to get the full Doughly Crumbl stack running on your local machine.

---

## Prerequisites

| Tool             | Version     | Download                                   |
|------------------|-------------|--------------------------------------------|
| Java JDK         | 17          | https://adoptium.net                       |
| Maven            | 3.9+        | https://maven.apache.org                  |
| Node.js          | 20+         | https://nodejs.org                         |
| PostgreSQL       | 15+         | https://www.postgresql.org/download/       |
| Android Studio   | Latest      | https://developer.android.com/studio       |
| Git              | Latest      | https://git-scm.com                        |

---

## 1. Database Setup

```sql
-- Connect to PostgreSQL as superuser, then:
CREATE DATABASE doughlycrumbl;
CREATE USER doughlyuser WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE doughlycrumbl TO doughlyuser;
```

---

## 2. Backend Setup

```bash
cd backend/

# Copy environment config
cp src/main/resources/application.properties.example \
   src/main/resources/application.properties

# Edit application.properties — fill in your DB credentials and JWT secret

# Build and run
mvn clean install
mvn spring-boot:run
```

Backend runs at: `http://localhost:8080`

---

## 3. Web Frontend Setup

```bash
cd web/

# Copy environment
cp .env.example .env

# Install dependencies
npm install

# Run dev server
npm run dev
```

Web app runs at: `http://localhost:5173`

---

## 4. Mobile Setup

1. Open `mobile/` folder in Android Studio
2. Create `local.properties` in the `mobile/` root:
   ```
   BASE_URL=http://10.0.2.2:8080/api
   ```
3. Sync Gradle → Run on emulator or device

> ℹ️ `10.0.2.2` is how the Android emulator reaches your machine's `localhost`.

---

## 5. Verify Everything Works

1. Register a user: `POST http://localhost:8080/api/auth/register`
2. Login: `POST http://localhost:8080/api/auth/login`
3. Browse products: `GET http://localhost:8080/api/products`
4. Open `http://localhost:5173` in browser

---

## 6. Seed Data (Optional)

Run the seed script to populate sample products:

```bash
cd backend/
psql -U doughlyuser -d doughlycrumbl -f src/main/resources/seed.sql
```

---

## 7. Create Admin User

After running the app, manually update the role in the DB:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@doughlycrumbl.com';
```
