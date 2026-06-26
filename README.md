# 🚗 WAVE — Mobile

## 🚀 Getting started

```bash
npm install
npm start
```

Press `a` for Android, `w` for web, or scan the QR code with **Expo Go**.
## 🧭 Project structure

```
mobile/
├─ app/                    # expo-router file-based routes
│  ├─ (auth)/              # welcome, login, register, forgot-password
│  ├─ (tabs)/              # home, bookings, loyalty, me (customer tabs)
│  ├─ (washer)/            # washer-only screens (queue, schedule, …)
│  ├─ booking/             # new, [id] detail, reschedule
│  ├─ vehicles/            # list, new
│  ├─ vouchers/            # list
│  ├─ loyalty/             # transactions
│  ├─ feedback/            # [orderId] rating
│  ├─ chat/                # AI assistant
│  └─ work-order/          # [id]
├─ components/             # shared UI + per-domain components
│  ├─ ui/                  # Button, EmptyState, LoadingSpinner, …
│  ├─ booking/             # OrderCard, StatusBadge
│  ├─ loyalty/             # TierBadge, TierProgressBar
│  ├─ i18n/                # LanguageToggle
│  └─ …
├─ hooks/                  # React-Query hooks per domain (auth/, booking/, …)
├─ services/               # axios services + interceptors
├─ stores/                 # zustand stores (auth, locale)
├─ i18n/                   # translations + useT()
├─ types/                  # shared TS types
├─ schemas/                # zod schemas
├─ constants/              # endpoints, Colors
└─ utils/                  # formatters, animations
```

---

## ⚙️ Tech stack

| Layer            | Library                                          |
| ---------------- | ------------------------------------------------ |
| Runtime          | Expo SDK 54, React Native 0.81, React 19         |
| Routing          | `expo-router` v6 (file-based, typed routes)      |
| State            | `zustand` (auth, locale) + AsyncStorage persist  |
| Server state     | `@tanstack/react-query` v5                       |
| HTTP             | `axios` with auth-token interceptor              |
| Forms            | `react-hook-form` + `zod` resolver               |
| Styling          | `nativewind` (Tailwind for RN) + inline styles   |
| Icons            | `lucide-react-native`                            |
| Animations       | `react-native-reanimated` v4                     |
| Toasts           | `react-native-toast-message`                     |
| Image upload     | `expo-image-picker` → Cloudinary via backend     |
| Payment handoff  | `expo-web-browser` → PayOS checkout              |
| Language         | Built-in i18n (vi / en) — see `i18n/`            |

---

## ✨ Customer features

- 🔐 **Auth** — register (auto-login), login, forgot-password with email OTP
- 🏠 **Home** — hero card with loyalty points, quick actions, featured service, promo banner
- 📅 **Bookings** — 4-step wizard (service → vehicle → slot → confirm) with voucher selection and live price preview; reschedule / cancel; live progress tracker (confirmed → washing → done)
- 💳 **Payments** — cash or online (PayOS checkout in external browser, returns to booking detail)
- ⭐ **Feedback** — 5-star overall rating + washer rating + quick tags + comment (upserts via `/me/feedback`)
- 🎁 **Loyalty** — tier progress (Bronze / Silver / Gold / Platinum), point history, current-tier benefits
- 🎟️ **Vouchers** — list with status filters, apply during booking
- 🚙 **Vehicles** — add, set default, delete
- 🤖 **Chat** — AI assistant for service questions
- 👤 **Profile** — view personal info, role, DOB

---

## 🌐 Internationalization

Two languages supported: **Tiếng Việt** (default) and **English**.

- Hook: `useT()` returns a type-safe translator: `t('home.washCount', { n: 5 })`
- Store: `useLocaleStore` — persisted to AsyncStorage
- UI: language switcher available on every auth screen (top-right pill) and in **Tôi / Me** tab
- To add keys: edit `i18n/translations.ts` (both `vi` and `en` branches)

---

## 🛠️ Scripts

```bash
npm start            # Expo dev server
npm run android      # Build & run on Android
npm run ios          # Build & run on iOS (macOS only)
npm run web          # Run on web

node_modules/.bin/tsc --noEmit   # Type-check the project
```
## 🐛 Common issues

- **`Unable to resolve module ...`** after editing imports → `npm start -- --clear`
- **Android emulator can't reach the API** → use `--tunnel` (`npm start -- --tunnel`) or set `EXPO_PUBLIC_API_URL` to your machine's LAN IP instead of `localhost`
- **Port 8081 in use** → `npm start -- --port 8082`
- **Password eye toggle doesn't update** on Android → already worked around via `key` remount on `secureTextEntry` change (see [`screens/RegisterScreen.tsx`](screens/RegisterScreen.tsx) `PasswordField`)
- **`npm audit` warnings** → safe to ignore; do NOT run `npm audit fix --force` (breaks Expo pins)
