# Global Project Context — Doughly Crumbl

## Identity
- **Project:** Doughly Crumbl — Artisan Bakery Web Application
- **Group:** G5 — Cabatana
- **Store:** Don Gil Garcia St., Capitol Site, Cebu City
- **Contact:** 09165667589 | FB: Doughly Crumbl | IG: @doughlycrumbl

## Stack
| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.5.0, Java 17, Maven |
| Database | PostgreSQL (Supabase-hosted), HikariCP, Hibernate |
| Security | Spring Security, JWT (jjwt 0.12.6), Google OAuth2 |
| Frontend | React 18, TypeScript, Vite 7 |
| Real-time | WebSocket (STOMP) |
| Payments | PayMongo (sandbox → production) |
| Maps | OpenStreetMap Nominatim (no API key, 1 req/sec limit) |

## Design System
| Token | Value |
|---|---|
| Primary / Crimson | `#6B1A2B` |
| Background | `#FAF7F4` |
| Surface | `#FFFFFF` |
| Font | Inter (body), Poppins (display) |
| Icons | Lucide only |
| Border radius | 8–10px |
| Shadow | `0 2px 8px rgba(0,0,0,0.08)` |

## Business Rules (never change)
- Delivery available within 10 km of store only
- Minimum order: 4 units per cookie type
- Cash on pickup only — no cash on delivery
- No vegan or gluten-free products on the menu

## Delivery Fee Tiers
| Distance | Fee |
|---|---|
| 0–3 km | ₱50 |
| 3–6 km | ₱80 |
| 6–10 km | ₱120 |
| Beyond 10 km | Block checkout |

## Order Status Flow
ORDER_PLACED → AWAITING_DELIVERY_QUOTE → DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED
→ PAYMENT_SUBMITTED_AWAITING_CONFIRMATION → PAYMENT_CONFIRMED
→ PREPARING → OUT_FOR_DELIVERY / READY_FOR_PICKUP → COMPLETED
Any state → CANCELLED (before PREPARING)
