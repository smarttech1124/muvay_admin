# Muvay Admin Portal

A secure, full-featured administration dashboard for the Muvay community travel platform.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + custom CSS variables (deep-space theme)
- **State**: Zustand with persist middleware
- **Charts**: Recharts
- **HTTP**: Axios
- **Fonts**: Syne (display) + IBM Plex Sans (body) + IBM Plex Mono

## Getting Started

```bash
cd admin
npm install
npm run dev     # Runs on http://localhost:3001
```

## Demo Credentials

| Email | Role |
|-------|------|
| elena@muvay.com | Super Admin |
| marcus@muvay.com | Operations Admin |
| aisha@muvay.com | Support Admin |
| luca@muvay.com | Finance Admin |

**Password**: `admin123` (demo mode — no backend required)

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Admin login with session management |
| `/overview` | Dashboard with KPIs, charts, activity feed |
| `/users` | User management — search, filter, suspend, delete |
| `/users/[id]` | User detail with booking history |
| `/trips` | Experience management — approve/reject/feature |
| `/activities` | Activity management |
| `/influencers` | Creator application review |
| `/bookings` | Booking oversight with detail modal |
| `/transactions` | Payment monitoring + refund processing |
| `/analytics` | Platform analytics with charts |
| `/admins` | Admin account management + RBAC permissions |
| `/logs` | Full audit trail of all admin actions |
| `/settings` | Platform settings — general, payments, security |

## Role-Based Access Control

| Feature | Super Admin | Operations | Finance | Support |
|---------|:-----------:|:----------:|:-------:|:-------:|
| Users | ✅ Full | 👁 View | 👁 View | ✅ Edit/Suspend |
| Experiences | ✅ Full | ✅ Approve | 👁 View | 👁 View |
| Transactions | ✅ Refund | — | 👁 View | 👁 View |
| Admin Mgmt | ✅ Full | — | — | — |
| Settings | ✅ Edit | — | — | — |

## Security Features

- JWT-based admin authentication (separate from user tokens)
- 15-minute idle session timeout
- Route-level RBAC protection
- Audit logging for all admin actions
- No sensitive data exposed in client state
- Secure cookie handling

## Backend Integration

Admin routes are served at `/api/admin/*`. See `backend/src/routes/admin.ts`.

Seed admin accounts:
```bash
cd backend
npx ts-node src/scripts/seedAdmin.ts
```
