# Orbit 911 - Training Tracker

## Project Overview

Orbit 911 is a commercial SaaS application built for 911 dispatch centers. It manages training records, daily observation reports (DORs), inventory/assets, employee profiles, policies, and accreditation compliance. It is intended to be sold to multiple agencies under a commercial license model.

The developer is Trevor — a CAD administrator and operations team member at a 911 communications center. He is also involved with Metro 911 Employee Association. He has deep domain knowledge of 911 center operations. Speak to him as a technical peer who understands the 911/PSAP environment.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (production), SQLite (dev/local)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (live at training-tracker-woad.vercel.app)
- **Containerization**: Docker / docker-compose available
- **Language**: TypeScript (98%+ of codebase)

## Build & Dev Commands

```bash
npm install
npx prisma migrate dev        # Run migrations (dev)
npx prisma migrate deploy     # Run migrations (production)
npx prisma db seed            # Seed core data
npx tsx scripts/seed-database.ts    # Seed employees/training
npx tsx scripts/seed-assets.ts      # Seed asset categories
npx tsx scripts/seed-dor-template.ts # Seed Metro 911 DOR template
npx tsx scripts/seed-admin-verify.ts # Create default admin user
npm run dev                   # Start dev server at localhost:3000
npm run build                 # Production build
npm start                     # Start production server
```

Default admin credentials (seeded): `admin@orbit911.com` / `orbit123`

## Architecture

### Multi-Tenancy
The app is multi-tenant via an `Agency` model. Every major model (Employee, User, Training, Asset, FormTemplate, etc.) has an `agencyId` foreign key. A `SUPERUSER` role exists for Orbit 911 staff to manage all agencies.

### User Roles
- `SUPERUSER` — Orbit 911 platform admin (cross-agency)
- `ADMIN` — Agency administrator
- `SUPERVISOR` — Supervisor role
- `TRAINER` — FTO / trainer (creates DORs)
- `TRAINEE` — New employee (signs DORs)

Custom permissions can be granted per-user via `customPermissions` (JSON array).

### Key Routes
- `/` — Main dashboard
- `/employees` — Employee roster
- `/employees/[id]` — Employee detail (training, certs, assets, DORs, EIS flags)
- `/dor/new` — Create new Daily Observation Report
- `/dor/[id]` — View DOR (trainee signature here)
- `/training` — Training module
- `/training/log` — Log attendance (bulk importer available)
- `/training/roster` — Roster checklist
- `/inventory` — Asset/inventory management
- `/inventory/[id]` — Asset detail with assignment history
- `/policies` — Policy list (trainee view)
- `/admin/*` — Admin panel
- `/admin/forms` — DOR form template management
- `/admin/forms/builder/[id]` — Form builder (drag-and-drop sections/fields)
- `/admin/policies` — Policy management
- `/admin/policies/[id]/edit/[versionId]` — Rich text policy editor
- `/admin/accreditation` — Accreditation standards management
- `/admin/accreditation/gap-analysis` — Gap analysis view
- `/admin/eis` — Early Intervention System flags
- `/admin/audit` — CJIS-compliant audit log viewer
- `/admin/settings` — License key, org name, logo, modules
- `/admin/users` — User account management
- `/admin/roles` — Role/permission templates
- `/community/[agencyId]/policies` — Public policy portal
- `/superuser` — Cross-agency platform management
- `/reports` — Reports page
- `/profile` — User profile + MFA setup
- `/setup` — Initial agency setup wizard
- `/help/*` — Built-in user manual

### Database Schema Summary

**Core Models:**
- `Agency` — Top-level tenant
- `Employee` — Staff member (linked optionally to a User login)
- `User` — Login account with role
- `Shift` — Shift assignment (unique per agency)

**Training:**
- `Training` — Training course definition
- `Attendance` — Employee attendance at a training
- `Certificate` — Certification type with required hours/validity
- `Expiration` — Employee certificate expiration record
- `CertificateTrainingExclusion` — Exclusion rules between certs and trainings

**DOR (Daily Observation Reports):**
- `FormTemplate` — Configurable DOR form (sections, fields, rating scale, naming convention)
- `FormSection` — Section within a template
- `FormField` — Field within a section (RATING, TEXT, BOOLEAN)
- `FormResponse` — Submitted DOR with JSON responseData, trainee signature timestamp

**Assets/Inventory:**
- `AssetCategory` — Category (Radio, Headset, Locker, etc.)
- `Asset` — Individual asset with status/condition
- `AssetAssignment` — Assignment history (chain of custody)

**EIS (Early Intervention System):**
- `EISFlag` — Auto-generated flag (PERFORMANCE, ASSET, COMPLIANCE) with severity/status

**Policy & Attestation (Phase 2):**
- `PolicyContainer` — Policy document container
- `PolicyVersion` — Versioned content (DRAFT/PUBLISHED/ARCHIVED), enforcement levels (1=Info, 2=Required, 3=Gate), reading timer
- `UserAttestation` — Employee signature/acknowledgment of a policy version
- `PolicyMapping` — Links policy versions to accreditation requirements

**Accreditation & Compliance (Phase 2):**
- `AccreditationStandard` — External standard (e.g., CALEA)
- `StandardRequirement` — Specific clause within a standard
- `ComplianceEvidence` — Locked file uploads proving compliance

**Platform:**
- `OrganizationSettings` — Per-agency settings (license, logo, enabled modules)
- `IssuedLicense` — Commercial license key management
- `AuditLog` — CJIS-compliant action logging
- `EmailTemplate` — Configurable email templates
- `RoleTemplate` — Permission set templates

## Key Components

- `Gatekeeper.tsx` — Blocks UI for users with unsigned required policies
- `MandatorySignOverlay.tsx` — Overlay requiring policy attestation before proceeding
- `GracePeriodBanner.tsx` — Banner shown during license grace period
- `RichTextEditor.tsx` — Policy content editor
- `SplitScreenMapper.tsx` — Side-by-side policy-to-requirement mapping tool
- `DORForm.tsx` — Main DOR submission form
- `FormBuilder.tsx` — Drag-and-drop DOR template builder
- `RatingScaleEditor.tsx` — Custom rating scale configuration
- `NamingConventionBuilder.tsx` — Dynamic report naming with variables

## Cron Jobs
- `/api/cron/daily-reports` — Daily automated reports
- `/api/cron/policy-lifecycle` — Policy expiration/lifecycle management

## Module System
Modules can be enabled/disabled per agency via `OrganizationSettings.modules` (JSON array): `["INVENTORY", "EIS", "DOR"]`

## Licensing
- Built-in commercial license enforcement via `IssuedLicense` and `OrganizationSettings`
- Grace period support (default 30 days)
- Non-admin lockout on expiry

## Environment Variables

```env
DATABASE_URL="..."        # PostgreSQL connection string (pooled)
DIRECT_URL="..."          # Direct PostgreSQL connection (for migrations)
AUTH_SECRET="..."         # NextAuth secret (generate: openssl rand -base64 32)
AUTH_URL="..."            # Deployment URL
```

## Domain Context

This is built for **PSAPs** (Public Safety Answering Points / 911 centers). Key terminology:
- **DOR** — Daily Observation Report (trainer grades trainee performance)
- **FTO** — Field Training Officer (the trainer)
- **EIS** — Early Intervention System (flags at-risk employees)
- **CJIS** — Criminal Justice Information Services (FBI compliance standard requiring audit logging)
- **CALEA** — Commission on Accreditation for Law Enforcement Agencies (accreditation body)
- **APCO / NENA** — Professional associations for 911 dispatchers (training hour categories)
- **CEU** — Continuing Education Units

## Current State (as of June 2026)

- 168 commits on main branch
- Core modules (Training, DOR, Assets, EIS, Audit, Users) are feature-complete
- Phase 2 (Policies, Attestation, Accreditation/CALEA mapping) has schema + UI scaffolded
- Live Vercel deployment active
- Multi-agency (SaaS) architecture in place
- Commercialization roadmap exists (see COMMERCIALIZATION_ROADMAP.md)

## Notes for Claude

- Always maintain multi-tenancy — filter by `agencyId` in all queries
- CJIS compliance means audit logging critical actions (logins, deletes, updates)
- The `SUPERUSER` role bypasses agency scoping — handle carefully
- `globalGateOverride` on Agency allows bypassing policy gates for testing
- Prisma schema uses both `String` IDs (Agency uses cuid) and `Int` IDs (most other models)
- Next.js App Router patterns throughout — use server components and server actions where possible
- Check `app/actions/` for existing server action patterns before writing new ones
