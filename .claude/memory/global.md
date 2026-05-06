# Global Context — Doughly Crumbl

## Project identity
Name: Doughly Crumbl
Type: Artisan bakery ordering system
Stage: Development — approximately 60% complete
Deadline: May 9, 2026 (regression testing submission)

## Team
Developer: Chris Daniel Cabataña (solo developer)
Course: IT342 — Revilleza
Group: G5 — Cabatana

## Business rules (never change these)
- Minimum cookie order: 4 units
- No vegan or gluten-free products offered
- Delivery only within range (calculator determines cutoff)
- Cash payment only for PICKUP orders — not for DELIVERY
- Delivery fee quoted by seller after order placed (manual flow)
- Store address: Don Gil Garcia St., Capitol Site, Cebu City

## API base URLs
- Emulator: http://10.0.2.2:8080/api
- Local web: http://localhost:8080/api
- Supabase DB: configured in application.properties (not committed)

## PayMongo
Status: config class exists, no actual integration yet
Keys stored in: app.paymongo.secret-key / app.paymongo.public-key
Mode: sandbox only during development
