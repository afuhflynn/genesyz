# Genesyz Codebase Index

Generated 2026-07-22 from the repository source tree. This is a verified navigation index, not a product specification.

## Project identity

Genesyz is a private TypeScript web application described as an AI-powered startup operating system: idea validation, startup execution tracking, accelerator programs, opportunities, collaboration, and billing. The package metadata states the same product scope and identifies the package as `genesyz` version `0.1.0`. [package.json:2-5]

The runtime is Next.js 16.1.1 with React 19.2.3, TypeScript strict mode, Prisma 7 against PostgreSQL, Better Auth, Vercel AI SDK, Inngest, Tailwind CSS, Biome, and Vitest. [package.json:35-150] [tsconfig.json:2-33]

## Directory map

| Area | Responsibility |
|---|---|
| `app/` | Next.js App Router pages, layouts, and HTTP route handlers; route groups cover dashboard, marketing, startup, auth, public, and admin experiences. [app] |
| `components/` | React UI organized by product domain (`ideas`, `startups`, `accelerators`, `school`, `chat`, `guide`, `layout`, and shared UI primitives). [components] |
| `lib/` | Server/client infrastructure and domain services: auth, database, agents, AI providers/tools, permissions, billing, email, Inngest, scraping, location, opportunities, and school logic. [lib] |
| `prisma/` | Prisma schema, migrations, and seed data. [prisma/schema.prisma:1-15] [prisma/seed.ts:1-20] |
| `hooks/`, `providers/`, `config/` | Client hooks, React Query provider, and Axios configuration. [hooks/index.ts:1-20] [providers/query-provider.tsx:1-80] [config/axios.config.ts:1-80] |
| `scripts/`, `scratch/`, `docs/` | Operational/migration scripts, exploratory scripts, and architecture/domain/API documentation. [scripts] [scratch] [docs] |

Generated/vendor areas excluded from semantic scope are `node_modules`, `.next`, build output, and dependency lockfile contents; Biome independently excludes `node_modules`, `.next`, `dist`, and `build`. [biome.json:8-10]

## Entry points and request boundary

`app/layout.tsx` is the root UI entry point. It installs fonts, UploadThing SSR configuration, nuqs, TanStack Query, theme handling, analytics, and toast rendering around all children. [app/layout.tsx:1-12] [app/layout.tsx:64-94]

The dashboard layout adds the authenticated workspace header/sidebar shell. [app/(dashboard)/layout.tsx:1-33]

`proxy.ts` is the request boundary. Arcjet applies shield and bot detection; the proxy redirects unauthenticated users away from protected dashboard paths, redirects signed-in users away from auth pages, and sends signed-in root visits to `/dashboard`. [proxy.ts:1-14] [proxy.ts:16-65] [proxy.ts:67-80]

HTTP entry points are Next route handlers under `app/api/**/route.ts`; the current scan contains 96 handlers. The Inngest entry point exposes GET/POST/PUT and registers research, email, reports, reminders, announcements, opportunity discovery, notifications, and cleanup functions. [app/api/inngest/route.ts:1-60]

## Configuration and operations

The application enables the React compiler and externalizes `pdfkit` for the Next server bundle. [next.config.ts:1-8] TypeScript uses strict checking, bundler module resolution, no emit, incremental compilation, and the `@/*` root alias. [tsconfig.json:2-33]

Common commands are declared in `package.json`: `pnpm dev`, `pnpm build`, `pnpm lint`, Prisma generate/migrate/push/seed commands, Inngest development, and Vitest test/coverage commands. [package.json:6-33]

Local infrastructure is a PostgreSQL 15 Alpine container named `genesyz-db`, exposed on host port 5446 with a persistent Docker volume and health check. [docker-compose.yml:1-20]

## Module dependencies

The dependency graph is centered on Next/React and Prisma/Postgres. Product integrations include Better Auth, Polar billing, Arcjet security, UploadThing storage, Inngest jobs, Tavily search, AI SDK provider packages, React Query, Radix/shadcn-style UI, Recharts, dnd-kit, Nodemailer, and pdfkit. [package.json:35-150]

The database client is a singleton Prisma client using `PrismaPg` and `DATABASE_URL`; query/warn logging is enabled in development and only errors in production. [lib/db.ts:1-25]

Authentication uses Better Auth with Prisma, email/password, Google OAuth, magic links, organization support, two-factor support, and Polar plugins. New users receive an entitlement and organization/member record through a database hook. [lib/auth.ts:14-24] [lib/auth.ts:29-89] [lib/auth.ts:93-131] [lib/auth.ts:132-207]

## Domain model and data flow

The Prisma schema currently defines 69 models and 27 enums. Its major bounded areas are authentication/organizations, ideas and multimodal inputs, AI research jobs/packets/scores/logs, entitlements/audit logs, startups, weekly execution updates, goals/metrics/streaks/tasks, growth/marketing, opportunities, accelerators, and school/LMS progress. [prisma/schema.prisma:16-206] [prisma/schema.prisma:207-573] [prisma/schema.prisma:574-1004] [prisma/schema.prisma:1006-1540]

An `Idea` can contain text/audio/image inputs, research jobs and packets, versioned scores/logs, URL content, guide conversations, and an optional linked `Startup`. [prisma/schema.prisma:207-277] [prisma/schema.prisma:286-396] [prisma/schema.prisma:481-573]

Startup execution is represented by a `Startup` linked to an optional idea and organization, with weekly updates, metrics, goals, opportunities, streaks, task lists/tasks, members, followers, conversations, research feed items, accelerator relationships, and school lecture progress. [prisma/schema.prisma:574-642]

Weekly updates are unique per startup and week number, carry launch/user-conversation/metric/goal/morale/AI fields, and record an editable-until timestamp plus lock state. [prisma/schema.prisma:711-765]

The idea creation API requires authentication, applies an AI rate-limit decision and entitlement check, accepts text/audio/image form data, extracts URLs, resolves a target location or detects one, persists the idea, and dispatches research work. [app/api/ideas/route.ts:11-29] [app/api/ideas/route.ts:77-105] [app/api/ideas/route.ts:107-218]

The research pipeline runs Interpreter first, then Market Research, Trend Analysis, Execution Friction, and Deep Research in parallel, then Synthesis; packets and scores are persisted and the idea is marked researched. [lib/agents/pipeline.ts:61-115] [lib/agents/pipeline.ts:118-180] [lib/agents/pipeline.ts:182-240]

Weekly update reads and writes require authentication and startup permissions. Creation validates input, prevents duplicate weekly records, calculates metric delta and a three-day edit window, persists goals, updates startup state, writes an audit log, and continues streak/notification workflow processing. [app/api/startups/[id]/updates/route.ts:14-29] [app/api/startups/[id]/updates/route.ts:67-121] [app/api/startups/[id]/updates/route.ts:138-218]

## Contracts and conventions

API handlers generally obtain the session through `auth.api.getSession({ headers: await headers() })`, return JSON responses, and use Prisma for persistence. [app/api/ideas/route.ts:1-10] [app/api/startups/[id]/updates/route.ts:1-13]

Startup authorization is capability-based rather than only route-based: the weekly update handler asks `checkStartupAccess` for `view_startup` or `submit_weekly_update`. [app/api/startups/[id]/updates/route.ts:24-30] [app/api/startups/[id]/updates/route.ts:88-92]

Validation schemas live in `lib/validators`; the weekly update endpoint uses `createWeeklyUpdateSchema.safeParse` before persistence. [app/api/startups/[id]/updates/route.ts:12-13] [app/api/startups/[id]/updates/route.ts:77-85]

Biome is the formatter/linter and uses recommended rules plus Next/React domains; its source action organizes imports. [biome.json:1-36]

## Tests and infrastructure guarantees

The repository declares Vitest commands, but the repository-owned test scan found only `lib/email/send.test.ts`; no broader unit, integration, E2E, or CI test configuration was found in the indexed source scope. [package.json:31-33] [lib/email/send.test.ts:1-200]

Background processing is Inngest-backed and registered through `/api/inngest`; the handler sets `maxDuration = 300`. [app/api/inngest/route.ts:1-4] The local multi-process development configuration runs Next, Inngest, and ngrok together. [mprocs.yaml:1-7]

## Unknowns and verification

- The deployment provider and CI workflow are not represented by a tracked workflow/configuration file in the indexed source scope; deployment behavior therefore remains unknown. [app] [scripts]
- Runtime environment variable values are intentionally not indexed; required names are referenced through `process.env` in auth, database, and proxy code. [lib/db.ts:5-7] [lib/auth.ts:70-75] [proxy.ts:5-13]
- The count of 96 API handlers is a deterministic file scan, not a product-level endpoint count; dynamic behavior and method coverage must be inspected per route when implementing changes. [app/api]

Verification completed for this index: required coverage categories `foundation`, `system`, `flow`, `contract`, `test-guarantee`, `convention`, and `unknown` are represented above; all claims cite repository paths and line ranges or deterministic directory scans. No external sources were needed.
