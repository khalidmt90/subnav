# Subscriptions Radar (رادار الاشتراكات)

## Overview
A Saudi-focused mobile web app that tracks subscriptions, sends renewal alerts, and provides cancellation guides. Full Arabic RTL and English support with a dark "Indigo & Dark" aesthetic.

## Recent Changes
- 2026-02-16: Converted from frontend prototype to full-stack app with PostgreSQL backend
- 2026-02-16: Added session-based authentication, subscription CRUD API, notifications API
- 2026-02-16: Replaced all mock/hardcoded data with real database queries

## Architecture
- **Frontend**: React + Vite + TanStack Query + Wouter + Tailwind CSS v4 + Framer Motion
- **Backend**: Express.js with session auth (connect-pg-simple)
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: users, subscriptions, notifications tables (shared/schema.ts)
- **Styling**: Dark theme (#0B0C14 bg), accent #5B6CF8, danger #FA6D8A, success #2DD4BF

## Key Files
- `shared/schema.ts` - Data models (users, subscriptions, notifications)
- `server/routes.ts` - API routes with session auth
- `server/storage.ts` - Database storage interface using Drizzle
- `server/db.ts` - PostgreSQL connection pool
- `client/src/hooks/useAuth.ts` - Auth hook (login/logout/updateUser)
- `client/src/hooks/useSubscriptions.ts` - Subscriptions data hook
- `client/src/hooks/useNotifications.ts` - Notifications data hook
- `client/src/lib/i18n.tsx` - Bilingual i18n system (Arabic RTL default)
- `client/src/data/cancelUrls.ts` - Cancellation guides database

## User Preferences
- Mobile-first design, Arabic RTL by default
- Fonts: IBM Plex Sans Arabic (Arabic), DM Sans (English)
- Dark theme with glassmorphism/indigo aesthetic
- Swipeable subscription cards with mute/cancel actions

## API Routes
- POST /api/auth/login - Login/signup (creates user + seeds sample subscriptions)
- POST /api/auth/logout - Logout
- GET /api/auth/me - Current user
- PATCH /api/auth/me - Update user settings
- GET /api/subscriptions - List user subscriptions
- GET /api/subscriptions/:id - Get single subscription
- POST /api/subscriptions - Create subscription
- PATCH /api/subscriptions/:id - Update subscription
- DELETE /api/subscriptions/:id - Soft-delete subscription
- GET /api/notifications - List notifications
- POST /api/notifications/:id/read - Mark notification read
- POST /api/notifications/read-all - Mark all read
