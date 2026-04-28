# React Patterns — Doughly Crumbl

## Project conventions
- React 18, TypeScript, Vite 7
- CSS: plain CSS files per component (no Tailwind, no CSS modules)
- Icons: Lucide only — `import { IconName } from 'lucide-react'`
- Fonts: Poppins (display), Inter (body) via Google Fonts in `index.html`

## Component file structure
```
features/cart/
├── OrderBag.tsx          ← page-level or panel-level component
├── OrderBagItem.tsx      ← sub-component
├── CartSummary.tsx       ← sub-component
└── OrderBag.css          ← styles co-located with component
```

## API call pattern
```typescript
// In featureApi.ts
import axiosInstance from './axiosInstance';
import { FeatureResponse } from '../types';

export const getFeature = (id: number): Promise<FeatureResponse> =>
  axiosInstance.get(`/feature/${id}`).then(r => r.data);

export const createFeature = (data: FeatureRequest): Promise<FeatureResponse> =>
  axiosInstance.post('/feature', data).then(r => r.data);
```

## Auth context usage
```typescript
const { user, token, login, logout } = useAuth();
// user is null when not logged in
// token is the JWT string
```

## Cart context usage
```typescript
const { items, addItem, updateQuantity, removeItem, clearCart, total } = useCart();
```

## Notification context usage
```typescript
const { notifications, markRead, unreadCount } = useNotifications();
```

## Protected routes
```tsx
// In AppRouter.tsx
<Route element={<ProtectedRoute />}>
  <Route path={ROUTES.MENU} element={<MenuPage />} />
</Route>
<Route element={<ProtectedRoute requireAdmin />}>
  <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
</Route>
```

## Design system — always use these values
```css
--color-primary: #6B1A2B;
--color-bg: #FAF7F4;
--color-surface: #FFFFFF;
--border-radius: 8px;
--shadow: 0 2px 8px rgba(0,0,0,0.08);
```

## Build check
```bash
npm run build    # TypeScript compile + Vite bundle
npm run dev      # dev server on :5173
```
