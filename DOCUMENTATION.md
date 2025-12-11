### Dokumentasi AZRA-BLOG - Asset Management System v0.3.1 (11/12/2025)

## 🏢 Tentang Project

**AZRA** adalah sistem manajemen aset untuk kebutuhan pengelolaan unit/equipment, work order, dan maintenance tracking. Sistem ini dibangun dengan stack modern, fokus pada skalabilitas, keamanan, dan kemudahan penggunaan.

### 🎯 Tujuan Utama
- Manajemen aset dan equipment terpusat
- Tracking work order dan breakdown
- Monitoring maintenance history dan RFU
- User management berbasis role
- Reporting dan analytics operasional

## 🛠️ Tech Stack (saat ini)

### Frontend
- Next.js 15.3.1 (App Router)
- React 18.3.1
- TypeScript 5.6.3
- HeroUI 2.x (komponen via @heroui/*)
- Tailwind CSS 3.4.16
- Framer Motion 11.x
- Lucide React 0.513.x

### Backend & Database
- Next.js API Routes
- Prisma 6.10.1 (ORM)
- PostgreSQL
- NextAuth.js 4.24.x (Credentials)
- bcrypt 6.x (hashing)

### Infrastruktur & Utilitas
- Sharp (image processing)
- AWS SDK v3 (@aws-sdk/client-s3) untuk storage (opsional)
- Upstash Redis (@upstash/redis) + next-rate-limit (rate limiting)
- Pino + pino-pretty (logging)
- Axios, Zod, date-fns, TanStack Query

### Development Tools
- ESLint 9 + @typescript-eslint 8, eslint-config-next
- Prettier 3
- Turbopack (dev)
- Auto-changelog

## 🧱 Arsitektur Sistem

### Relasi Utama (ringkas)
- User ⇄ Unit (created_by, assigned_to)
- User ⇄ Breakdown (reported_by, in_progress_by)
- Breakdown ⇄ RFUReport (resolved_by)
- RFUReport ⇄ RFUReportAction (actions)
- Category ⇄ Unit
- Unit ⇄ UnitHistory, Breakdown

## 🧱 Arsitektur Sistem

### Relasi Utama (ringkas)
- User ⇄ Unit (created_by, assigned_to)
- User ⇄ Breakdown (reported_by, in_progress_by)
- Breakdown ⇄ RFUReport (resolved_by)
- RFUReport ⇄ RFUReportAction (actions)
- Category ⇄ Unit
- Unit ⇄ UnitHistory, Breakdown

### Struktur Database (ERD)
```mermaid
erDiagram
    User ||--o{ Unit : "created_by"
    User ||--o{ Unit : "assigned_to"
    User ||--o{ Breakdown : "reported_by"
    User ||--o{ Breakdown : "in_progress_by"
    User ||--o{ RFUReport : "resolved_by"

    Category ||--o{ Unit : "belongs_to"

    Unit ||--o{ Breakdown : "has"
    Unit ||--o{ UnitHistory : "has"

    Breakdown ||--o{ BreakdownComponent : "has"
    Breakdown ||--|| RFUReport : "resolved_by"

    RFUReport ||--o{ RFUReportAction : "has"
```

### Model Database (berdasarkan Prisma)

1) User
- id (uuid), name, email, password, role (enum: super_admin, admin_heavy, admin_elec, pengawas, mekanik, guest)
- Optional: photo, phone, location, department, avatar, status, lastActive, tasksCompleted, joinDate
- Relasi: reportedBreakdowns, inProgressBreakdowns, resolvedRFUs, assignedUnits, createdUnits

2) Category
- id (auto), name (unique)
- Relasi: units

3) Unit
- id (uuid), assetTag (unique), name, description?, categoryId, status (default: operational), condition?, serialNumber?, location, department?, manufacturer?, installDate?, warrantyExpiry?, lastMaintenance?, nextMaintenance?, assetValue?, utilizationRate?, createdAt, createdById, assignedToId?
- Relasi: category, createdBy, assignedTo?, breakdowns, histories

4) Breakdown
- id (uuid), description, breakdownTime, workingHours (Float), status (enum: pending, in_progress, rfu, overdue), createdAt, unitId, reportedById, breakdownNumber?, priority?, shift?, inProgressById?, inProgressAt?, photo?
- Relasi: reportedBy, inProgressBy?, unit, components, rfuReport?

5) BreakdownComponent
- id (uuid), component, subcomponent, breakdownId

6) RFUReport
- id (uuid), solution, resolvedAt (default now), breakdownId (unique), resolvedById, workDetails?
- Relasi: breakdown, resolvedBy, actions

7) RFUReportAction
- id (uuid), action, description?, actionTime (default now), rfuReportId

8) UnitHistory
- id (uuid), logType, referenceId, message, createdAt, unitId

## 📁 Struktur Project (ringkas, aktual)

```
azra/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── dashboard/
│   │   │   ├── assets/route.ts
│   │   │   ├── users/route.ts
│   │   │   ├── workorders/route.ts
│   │   │   ├── report/route.ts
│   │   │   └── recent-activities/route.ts
│   │   ├── maintenance-history/route.ts
│   │   ├── data/route.ts
│   │   └── settings/... (konfigurasi terkait)
│   ├── dashboard/... (halaman dashboard)
│   ├── login/
│   ├── about/
│   ├── admin/
│   ├── unit/
│   ├── userwo/
│   ├── layout.tsx
│   └── providers.tsx
├── components/ (UI & forms)
├── lib/
│   ├── auth.ts (NextAuth config)
│   ├── prisma.ts (Prisma client)
│   ├── logger.ts (pino)
│   ├── limiter.ts (rate limit)
│   ├── imageResize.ts (sharp utils)
│   ├── validation.ts (zod)
│   └── dateUtils.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
├── styles/
├── config/
└── types/
```

## 🔧 Setup & Instalasi

### Prasyarat
- Node.js 18+
- PostgreSQL
- npm/yarn/pnpm

### Environment Variables (contoh)

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"
POSTGRES_URL_NON_POOLING="postgresql://user:pass@host:5432/db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Supabase (opsional)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-key"

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# AWS S3 (opsional penyimpanan file)
AWS_REGION="ap-southeast-1"
AWS_S3_BUCKET="your-bucket"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."

# Google reCAPTCHA (opsional pada form)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="..."
RECAPTCHA_SECRET_KEY="..."
```

### Langkah Instalasi

```bash
# 1) Clone repository
git clone <repository-url>
cd azra

# 2) Instal dependency
npm install

# 3) Generate Prisma client
npx prisma generate

# 4) Setup database schema (dev)
npx prisma db push

# 5) Seed database (jika diperlukan)
# Gunakan mekanisme seeding Prisma:
npx prisma db seed

# 6) Jalankan development server
npm run dev
```

### Build & Deploy

```bash
# Build production
npm run build

# Start production server
npm start
```

## 🔐 Keamanan

### Authentication
- NextAuth (Credentials) dengan JWT session
- Password hashing: bcrypt
- Session maxAge: 30 jam (konfigurasi saat ini)
- Secure cookies (httpOnly)

### Authorization & Proteksi
- RBAC (enum Role pada Prisma)
- Route protection via middleware.ts
- Proteksi endpoint API & pengecekan role per aksi
- Rate limiting via Upstash Redis + next-rate-limit

### Proteksi Data
- Validasi input (Zod/Prisma)
- Mitigasi SQL injection oleh Prisma
- XSS/CSRF mitigations (best practices Next.js)

## 🔌 API Endpoints (utama, aktual)

- Auth
  - `POST /api/auth/[...nextauth]` (NextAuth) — sign-in/out/session via NextAuth routes
- Dashboard
  - `GET /api/dashboard` — ringkasan statistik/metric
  - `GET /api/dashboard/assets` — data aset untuk dashboard/report
  - `GET /api/dashboard/users` — data pengguna untuk dashboard
  - `GET /api/dashboard/workorders` — data work order untuk dashboard
  - `GET /api/dashboard/report` — data laporan terkait
  - `GET /api/dashboard/recent-activities` — aktivitas terbaru
- Maintenance History
  - `GET /api/maintenance-history` — daftar log maintenance
  - `POST /api/maintenance-history` — tambah log maintenance
- Data umum
  - `GET /api/data` — data utilitas/metadata
- Settings
  - `/api/settings/*` — endpoint terkait konfigurasi (jika diaktifkan)

Catatan: Operasi CRUD aset/user/WO dapat di-handle melalui halaman dashboard & server action, atau spesifik API route yang tersedia pada subfolder dashboard.

## 🎨 UI/UX
- Komponen via HeroUI + Tailwind
- Dark/Light mode
- Responsive untuk mobile/desktop
- Aksesibilitas dasar
- Loading & error states, validasi form, pencarian & filter

## 📈 Performa
- Code splitting & image optimization (Next.js Image)
- Lazy loading komponen, memoization
- Indeks database pada field kunci
- Caching data statis

## 🧪 Testing
- Rencana: unit/integration/E2E
- Saat ini: belum ada dependensi Jest/Playwright di package.json
- Status: Planned (akan ditambahkan pada versi berikutnya)

## 📝 Pedoman Development
- TypeScript, ESLint, Prettier
- Conventional commits
- Branching via feature branches + PR review
- Changelog otomatis via auto-changelog

## 🚀 Deployment
- Target: Vercel atau VPS via Docker
- Database: PostgreSQL terkelola
- Secrets: .env / dashboard environment Vercel
- SSL by platform

## 📡 Monitoring & Logging
- Logging: pino/pino-pretty
- Error/performance monitoring: Sentry (planned)

---

**AZRA Asset Management System** - Made with ❤️ Azvan IT

*Dokumentasi ini akan diperbarui secara berkala sesuai dengan perkembangan sistem.*
