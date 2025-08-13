# AZRA - Asset Management System v0.4.6

A modern asset management system for managing units/equipment, work orders and breakdowns, maintenance history (RFU), reporting, and role-based user management.

## Key Features
- Asset and equipment management
- Work order and breakdown tracking + RFU report
- Maintenance history and unit activity
- User management + RBAC (role-based)
- Dashboard, reporting, and lightweight analytics

## Tech Stack
- Frontend: Next.js 15 (App Router), React 18, TypeScript, HeroUI, Tailwind CSS
- Backend/DB: Next.js API Routes, Prisma 6, PostgreSQL, NextAuth (Credentials), bcrypt
- Infra/Utils: Sharp, AWS S3 (optional), Upstash Redis (rate limiting), Pino, Zod, TanStack Query, date-fns

## Project Structure
azra/
├─ app/ (routes, api, pages)
├─ components/ (UI & forms)
├─ lib/ (auth, prisma, logger, limiter, utils)
├─ prisma/ (schema, migrations, seed)
├─ public/
└─ types/

## Quick Start
```bash
# Install dependencies
npm install

# Prisma & database (dev)
npx prisma generate
npx prisma db push
# (optional) seed
# npx prisma db seed

# Start dev server
npm run dev
```

## Environment (minimal)
Create a `.env` file with the following core variables:
```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Main APIs
- Auth: `POST /api/auth/[...nextauth]`
- Dashboard: `GET /api/dashboard`, `/assets`, `/users`, `/workorders`, `/report`, `/recent-activities`
- Maintenance History: `GET|POST /api/maintenance-history`
- General data: `GET /api/data`

CRUD for assets/users/WO is available via dashboard pages, server actions, or related APIs.

## Security
- NextAuth (JWT sessions), bcrypt hashing
- RBAC (Prisma role enum), route protection via `middleware.ts`
- Input validation (Zod/Prisma), rate limiting (Upstash)

## Build & Deploy
```bash
# Build production
npm run build

# Start production
npm start
```
Target: Vercel or VPS/Docker. Store secrets in `.env` or the platform dashboard.

## License
MIT License