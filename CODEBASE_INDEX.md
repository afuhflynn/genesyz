# Genesyz Codebase Index

**Last indexed**: 2026-07-13
**Git HEAD**: 418c78e

---

## 1. Project Identity Card

| Field | Value |
|---|---|
| **Project name** | Genesyz |
| **Primary language** | TypeScript (strict mode) |
| **Framework(s)** | Next.js 16.1.1 (App Router), React 19.2.3, Tailwind CSS v4, shadcn/ui (New York) |
| **Build system** | Next.js build (`pnpm build`) + prisma generate |
| **Package manager** | pnpm (workspaces), pnpm-lock.yaml |
| **Repo structure** | Single package (with `.opencode/` workspace plugin) |
| **Line count** | ~75,000+ (TS/TSX/CSS/JS excluding node_modules/.next) |
| **Source file count** | ~480+ source files |

---

## 2. Top-Level Directory Map

```
genesyz/
├── .agents/             # AI agent skills (react-doctor skill) (scan)
├── .github/             # CI/CD workflows + master prompt (catalog)
├── .opencode/           # opencode AI config + migration plans (scan)
├── .vscode/             # VS Code settings (skip)
├── .nvii/               # NVII project tracking (scan)
├── app/                 # Next.js App Router - 45+ pages, 65+ API routes (inspect)
│   ├── (auth)/          # Sign-in, sign-up, password reset, magic link, verify email
│   ├── (chat)/          # Global chat route
│   ├── (dashboard)/     # Dashboard, ideas, startups, billing, settings, admin, onboarding
│   ├── (marketing)/     # Landing, about, pricing, FAQ, accelerators, legal, contact
│   ├── (public)/        # Shared idea pages (public view)
│   ├── (startup)/       # Startup-specific routes (updates, metrics, tasks, chat, etc.)
│   ├── accelerator/     # Standalone accelerator admin page
│   └── api/             # 35+ API route directories with 65+ handlers
├── components/          # React components - ~140+ files across 19 dirs (inspect)
│   ├── accelerators/    # Accelerator Hub components (9 files)
│   ├── ai-elements/     # AI SDK component primitives (28 files)
│   ├── auth/            # Auth form components (3 files)
│   ├── chat/            # Chat verdict card (1 file)
│   ├── dashboard/       # Dashboard analytics cards (1 file)
│   ├── faqs/            # FAQ search bar (1 file)
│   ├── guide/           # Guide agent chat widget (1 file)
│   ├── idea/            # Idea detail server components (4 files)
│   ├── ideas/           # Idea list/form/detail components (11 files)
│   ├── layout/          # Navigation, sidebar, header, workspace (8 files)
│   ├── location/        # Geographic location selector (2 files)
│   ├── marketing/       # Landing page sections (7 files)
│   ├── onboarding/      # VC Onboarding wizard (2 files)
│   ├── prompt/          # Prompt viewer with version history (1 file)
│   ├── providers/       # Theme provider (1 file)
│   ├── settings/        # Security, sessions, audit log (3 files)
│   ├── shared/          # ConfirmDialog component (1 file)
│   ├── startups/        # Startup components: updates, team, tasks, coach (14 files)
│   └── ui/              # shadcn/ui primitives + custom (55 files)
├── config/              # Axios client config (1 file) (inspect)
├── constants/           # FAQ data (1 file) (catalog)
├── docs/                # Domain documentation (6 files) (catalog)
├── hooks/               # Custom React Query hooks (5 files) (inspect)
├── lib/                 # Core libraries - 63 source files, ~12,662 lines (inspect)
│   ├── agents/          # 12 files - 11 AI agents + types (inspect)
│   ├── ai/              # 4 files - model, fallback, tools, webfetch (inspect)
│   ├── auth/            # 2 files - access control, OAuth sign-in (inspect)
│   ├── constants/       # 1 file - 35+ metric definitions (inspect)
│   ├── email/           # 3 files - client, send templates, tests (inspect)
│   ├── inngest/         # 13 files - client + channels + 11 functions (inspect)
│   ├── location/        # 4 files - detection + research context (inspect)
│   ├── memory/          # 1 file - Mem0 AI memory client (inspect)
│   ├── opportunities/   # 2 files - discovery + generator (inspect)
│   ├── polar/           # 2 files - billing SDK + entitlements (inspect)
│   ├── scraping/        # 3 files - URL extraction + content scraping (inspect)
│   ├── utils/           # 1 file - date utilities (inspect)
│   └── validators/      # 2 files - auth + startup form validation (inspect)
├── nuqs/                # URL search params schema (1 file) (catalog)
├── prisma/              # DB schema + migrations + seed (inspect)
│   ├── schema.prisma    # 49 models, 21 enums, ~1291 lines
│   ├── seed.ts          # Accelerator program seed
│   └── migrations/      # 13 migration files
├── providers/           # React Query provider (1 file) (inspect)
├── public/              # Static assets - 14 files (favicons, OG image, logo, fonts) (skip)
├── scripts/             # Utility scripts (4 files) (catalog)
├── .env                 # Gitignored (skip)
├── .env.example         # 43 env vars across 9 categories (inspect)
├── .gitignore           # Git ignore rules (catalog)
├── ACCELERATOR_HUB_GUIDE.md  # Accelerator user guide (catalog)
├── DUAL_MODEL_DOCUMENTATION_UPDATE.md  # Outdated dual-model docs (catalog)
├── README.md            # Project README (inspect)
├── RULES.md             # Coding standards & conventions (inspect)
├── TECH_STACK.md        # Corrected tech stack reference (inspect)
├── UNUSED_DEPENDENCIES.md  # Dependency audit (catalog)
├── biome.json           # Linter/formatter v2.2 (inspect)
├── components.json      # shadcn/ui config (inspect)
├── docker-compose.yml   # PostgreSQL 15 on port 5446 (inspect)
├── feedback.txt         # User feedback (catalog)
├── mprocs.yaml          # Multi-process runner (next + inngest + ngrok) (inspect)
├── next-env.d.ts        # Next.js types (skip)
├── next.config.ts       # reactCompiler: true, serverExternalPackages: ["pdfkit"] (inspect)
├── package.json         # 128 deps, 14 devDeps, 30 scripts (inspect)
├── pnpm-lock.yaml       # Lock file (skip)
├── pnpm-workspace.yaml  # Allowed builds for prisma engines, sharp, etc. (inspect)
├── postcss.config.mjs   # @tailwindcss/postcss v4 (inspect)
├── prisma.config.ts     # Prisma ORM config (inspect)
├── proxy.ts             # Arcjet middleware + auth redirect (inspect)
├── tsconfig.json        # Strict mode, @/* alias, ES2017 target (inspect)
├── tsconfig.tsbuildinfo # Build info (skip)
└── types.d.ts           # IResearchProgress global type (scan)
```

---

## 3. Entry Points

### HTTP (Next.js App Router)

**Root layout & global files** (`app/`):
| File | Purpose |
|---|---|
| `layout.tsx` | Root layout with ThemeProvider, QueryProvider, NuqsAdapter, Toaster, UploadThing, Vercel Analytics, Inter + IBM Plex Mono fonts |
| `globals.css` | Tailwind v4 directives + CSS variables (neutral palette, dark mode) |
| `error.tsx` | Root error boundary (client component) |
| `not-found.tsx` | 404 page (server component) |

**Layouts** (6 route-group layouts):
| Route Group | File | Wraps |
|---|---|---|
| `(marketing)` | `app/(marketing)/layout.tsx` | Landing, about, pricing, FAQ, accelerators, legal (Navbar + Footer) |
| `(auth)` | `app/(auth)/layout.tsx` | Sign-in, sign-up, verify, reset (minimal centered div) |
| `(dashboard)` | `app/(dashboard)/layout.tsx` | Dashboard, ideas, startups list, billing, settings, admin (Sidebar + Header) |
| `(startup)` | `app/(startup)/startups/[slug]/layout.tsx` | All startup workspace pages (permission check + StartupLayoutShell) |
| `(chat)` | `app/(chat)/layout.tsx` | Global chat (SidebarProvider) |
| `(public)` | None | Shared ideas (no layout) |
| `accelerator` | None | Accelerator admin (no layout) |

**Non-page app components**: 8 startup workspace components co-located in `app/(startup)/startups/[slug]/` (`StartupDashboard.tsx`, `MetricsDashboard.tsx`, `StartupSettings.tsx`, `TasksPageContent.tsx`, `WeeklyUpdatesList.tsx`, `NewWeeklyUpdate.tsx`, `EditWeeklyUpdate.tsx`, `layout-shell.tsx`), plus `app/(dashboard)/startups/StartupsList.tsx`.

**Non-route app support files**: `app/api/uploadthing/core.ts` (UploadThing file router config: image/audio/pdf uploaders), `app/api/inngest/token/_actions/fetchRealtimeSubscriptionToken.ts` (server action for Inngest realtime tokens).

**Pages** (54 `page.tsx` files):

| Route Group | Routes |
|---|---|
| **Marketing** | `/`, `/about`, `/faq`, `/how-it-works`, `/pricing`, `/privacy`, `/terms`, `/contact`, `/accelerators`, `/accelerators/new`, `/accelerators/[slug]`, `/accelerators/[slug]/apply` |
| **Auth** | `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/verify-email`, `/verify-email/[token]`, `/verify-email/resend`, `/magic-link` |
| **Dashboard** | `/dashboard`, `/ideas`, `/ideas/new`, `/ideas/[id]`, `/ideas/archived`, `/startups`, `/startups/new`, `/chat`, `/billing`, `/settings`, `/onboarding`, `/my-accelerators`, `/admin`, `/admin/users`, `/admin/accelerators/[slug]` |
| **Public** | `/ideas/shared/[token]` |
| **Startup** | `/[slug]`, `/[slug]/updates`, `/[slug]/updates/new`, `/[slug]/updates/[id]/edit`, `/[slug]/metrics`, `/[slug]/tasks`, `/[slug]/chat`, `/[slug]/opportunities`, `/[slug]/profile`, `/[slug]/settings`, `/[slug]/research-feed`, `/[slug]/streaks`, `/[slug]/applications`, `/[slug]/cofounders`, `/[slug]/school` |
| **Standalone** | `/accelerator/admin` |

**Error & loading states**: Only root `error.tsx` and `not-found.tsx` exist. No `loading.tsx` files anywhere. No root `middleware.ts` (Arcjet via `proxy.ts`).

### API Routes (70 `route.ts` files, 69 unique endpoints)

| Route | Methods | Key Purpose |
|---|---|---|
| `/api/auth/[...all]` | GET/POST | Better Auth catch-all handler |
| `/api/auth/custom/delete-account` | POST | Delete user account |
| `/api/auth/custom/email-preferences` | PATCH | Update email notification preferences |
| `/api/auth/custom/forgot-password` | POST | Send password reset email |
| `/api/auth/custom/resend-verification-email` | PUT | Resend email verification |
| `/api/auth/custom/reset-password` | POST | Reset password with token |
| `/api/auth/custom/sign-up` | POST | Custom sign-up with Arcjet rate limiting |
| `/api/auth/custom/sign-up/social` | POST | Social auth sign-up |
| `/api/auth/custom/update-password` | POST | Update password (authenticated) |
| `/api/auth/custom/verify-email` | GET/POST | Verify email with code |
| `/api/auth/custom/verify-email/token` | GET/POST | Verify email with token |
| `/api/ideas` | GET/POST | List/Create ideas |
| `/api/ideas/[id]` | GET/PATCH/DELETE | Single idea CRUD |
| `/api/ideas/[id]/export` | POST | PDF export |
| `/api/ideas/[id]/guide` | POST | Guide agent chat |
| `/api/ideas/[id]/prompt` | PATCH | Update prompt (with optional re-research) |
| `/api/ideas/[id]/research` | GET | Get research packets |
| `/api/ideas/[id]/share` | GET | Get/share idea via token |
| `/api/ideas/[id]/startup` | GET | Get linked startup for idea |
| `/api/startups` | GET/POST | List/Create startups |
| `/api/startups/search` | GET | Search startups |
| `/api/startups/check-slug` | GET | Check slug availability |
| `/api/startups/[id]` | GET/PATCH/DELETE | Single startup CRUD |
| `/api/startups/[id]/applications` | GET | Get applications for startup |
| `/api/startups/[id]/chat` | POST | VC Coach chat (with memory) |
| `/api/startups/[id]/conversations` | GET/POST | List/Create conversations |
| `/api/startups/[id]/conversations/[convId]` | GET/DELETE | Single conversation detail/delete |
| `/api/startups/[id]/followers` | GET/POST | List/Add followers |
| `/api/startups/[id]/followers/[followerId]` | DELETE | Remove follower |
| `/api/startups/[id]/members` | GET/POST | List/Add team members |
| `/api/startups/[id]/members/[memberId]` | PATCH/DELETE | Update role/Remove member |
| `/api/startups/[id]/opportunities` | GET/POST | List/Create opportunities |
| `/api/startups/[id]/opportunities/generate` | POST | AI-generate opportunities |
| `/api/startups/[id]/research-feed` | GET | Research feed items |
| `/api/startups/[id]/streak` | GET/PATCH | Streak tracking |
| `/api/startups/[id]/updates` | GET/POST | List/Create weekly updates |
| `/api/accelerators` | GET/POST | List/Create accelerators |
| `/api/accelerators/check-slug` | GET | Check slug availability |
| `/api/accelerators/[slug]` | GET/PATCH/DELETE | Single accelerator CRUD |
| `/api/accelerators/[slug]/apply` | POST | Apply to accelerator |
| `/api/accelerators/[slug]/coach` | POST | AI Hub Coach |
| `/api/accelerators/[slug]/cohorts` | GET/POST | List/Create cohorts |
| `/api/accelerators/[slug]/cohorts/[cohortId]/startups` | POST | Add startup to cohort |
| `/api/accelerators/[slug]/events` | GET/POST | List/Create events |
| `/api/accelerators/[slug]/kpis` | GET/POST | List/Create KPIs |
| `/api/accelerators/[slug]/mentors` | GET/POST | List/Create mentors |
| `/api/accelerators/[slug]/mentors/[mentorId]/matches` | POST | Match mentor to startup |
| `/api/accelerators/[slug]/reports` | GET/POST | List/Create weekly reports |
| `/api/accelerators/[slug]/startups/[id]/investor-profile` | GET | Investor one-pager |
| `/api/accelerators/[slug]/team` | GET/POST/PATCH/DELETE | Team management |
| `/api/admin/stats` | GET | Admin dashboard stats |
| `/api/admin/users` | GET | Admin user management |
| `/api/analytics/dashboard` | GET | Portfolio analytics |
| `/api/assets/[id]` | DELETE | Delete uploaded asset |
| `/api/audit-logs` | GET | Paginated audit log |
| `/api/billing/subscription` | GET | Get subscription/checkout URL |
| `/api/chat` | POST | General AI brainstorming chat |
| `/api/dashboard` | GET | Dashboard metrics |
| `/api/goals/[goalId]` | PATCH | Toggle goal completion |
| `/api/guide/chat` | POST | Multi-session research guide |
| `/api/inngest` | GET/POST/PUT | Inngest serve handler |
| `/api/inngest/token` | GET | Inngest realtime subscription token |
| `/api/onboarding` | POST | Create onboarding data |
| `/api/onboarding/status` | GET | Get onboarding completion status |
| `/api/sessions` | GET/DELETE | List/Delete sessions |
| `/api/sessions/[id]` | DELETE | Delete single session |
| `/api/storage/signed-url` | POST | Signed URL for UploadThing |
| `/api/uploadthing` | GET/POST | UploadThing file handler |
| `/api/user/profile` | GET/PATCH | User profile CRUD |
| `/api/user/entitlement` | GET | Get plan entitlement |
| `/api/users/search` | GET | Search users (for team invites) |

### Background Jobs (Inngest - 13 registered functions)

| Function | File | Trigger | Description |
|---|---|---|---|
| research-pipeline | `lib/inngest/functions/research-pipeline.ts` | `idea.submitted` | 6-agent sequential research pipeline |
| auth-emails | `lib/inngest/functions/auth-emails.ts` | `email.send.*` events | Verif/welcome/password-reset/magic-link emails |
| startup-analysis | `lib/inngest/functions/startup-analysis.ts` | `weeklyUpdate.created` | AI coach analysis post-update |
| startup-weekly-report | `lib/inngest/functions/startup-weekly-report.ts` | Event + Cron (Sun 9AM UTC) | Detailed weekly report email |
| startup-weekly-reminder | `lib/inngest/functions/startup-weekly-reminder.ts` | Cron (Fri/Sat 5PM UTC) | Reminder emails to update |
| weekly-digest | `lib/inngest/functions/weekly-digest.ts` | Cron (Mon 9AM UTC) | Portfolio strategic advisory report |
| opportunity-discovery | `lib/inngest/functions/opportunity-discovery.ts` | Cron (Daily 6AM UTC) | Tavily-powered opportunity search |
| re-evaluation | `lib/inngest/functions/re-evaluation.ts` | Cron (Monthly 1st) | Re-research stale ideas |
| follower-notifications | `lib/inngest/functions/startup-follower-notifications.ts` | Event | Follower welcome + weekly digest |
| feature-announcement | `lib/inngest/functions/startup-feature-announcement.ts` | Event | Feature announcement emails |
| cleanup-unverified | `lib/inngest/functions/cleanup-unverified.ts` | Cron (Monthly 1st) | Clean unverified users > 90 days |

6 crons + 7 event-driven = 13 registered functions.

### Middleware / Proxy

| File | Description |
|---|---|
| `proxy.ts` | Arcjet Shield + bot detection + auth redirect. Matches all routes except static files. Runs before every request. |

---

## 4. Configuration Inventory

| Purpose | Files | Key Settings |
|---|---|---|
| **Build** | `next.config.ts` | `reactCompiler: true`, `serverExternalPackages: ["pdfkit"]` |
| **Build** | `tsconfig.json` | Strict, `@/*` alias, ES2017, bundler resolution, Next.js plugin |
| **Build** | `postcss.config.mjs` | `@tailwindcss/postcss` plugin (Tailwind v4) |
| **Build** | `prisma.config.ts` | Prisma ORM v7: schema `prisma/schema.prisma`, dotenv |
| **Env** | `.env.example` | 43 vars: DB, Auth, AI, Vector, Storage, Email, Jobs, Security, Billing |
| **CI/CD** | `.github/workflows/ci.yml` | pnpm 9, Node 20, prisma generate, biome lint, tsc, next build |
| **Lint** | `biome.json` | v2.2, recommended, Next+React domains, organizeImports on save |
| **UI** | `components.json` | New York, neutral, RSC, lucide, ai-elements registry |
| **Editor** | `.vscode/settings.json` | VBNetCompanion extension (irrelevant) |
| **Deploy** | `docker-compose.yml` | PostgreSQL 15-alpine, port 5446 |
| **Process** | `mprocs.yaml` | 3 processes: next dev, inngest:start, ngrok:dev |
| **Package** | `package.json` | 128 deps, 14 devDeps, 30 scripts |
| **Workspace** | `pnpm-workspace.yaml` | Allowed builds for prisma engines, sharp, esbuild |
| **Security** | `proxy.ts` | Arcjet Shield + bot detection + auth redirect logic |
| **Git** | `.gitignore` | node_modules, .next, .env*, .vercel, *.tsbuildinfo |
| **URL State** | `nuqs/index.ts` | Typed search params (page, limit, search, tab, archived, token, etc.) |

---

## 5. Module Dependency Map

### Core Infrastructure

```
Module: lib/db
  Depends on: @prisma/adapter-pg, @prisma/client, dotenv
  Used by: lib/auth, lib/agents/*, prisma/seed, all API routes

Module: lib/auth
  Depends on: lib/db, lib/inngest/client, @polar-sh/better-auth, better-auth,
              @polar-sh/sdk, lib/polar/entitlements, lib/auth/access, lib/email/send
  Used by: app/api/auth/[...all], app/api/auth/custom/*

Module: lib/auth-client (browser)
  Depends on: better-auth/react, @polar-sh/better-auth/client, lib/auth/access
  Used by: hooks/index, components throughout

Module: lib/arcjet
  Depends on: @arcjet/next, @arcjet/ip, lib/auth
  Used by: proxy.ts, various API routes

Module: lib/api-client
  Depends on: axios, config/axios.config
  Used by: hooks/index

Module: lib/auth-utils
  Depends on: bcryptjs
  Used by: lib/auth, app/api/auth/custom/*

Module: lib/startup-permissions
  Depends on: lib/auth, lib/db
  Used by: app/api/startups/*, components

Module: lib/accelerator-permissions
  Depends on: (none external)
  Used by: lib/accelerator-permissions-server, components

Module: lib/accelerator-permissions-server
  Depends on: lib/auth, lib/db, lib/accelerator-permissions
  Used by: app/api/accelerators/*
```

### AI Layer

```
Module: lib/ai/models
  Depends on: @ai-sdk/google, ai
  Used by: lib/agents/*

Module: lib/ai/fallback
  Depends on: ai (generateObject, generateText), lib/ai/models
  Used by: lib/agents/*

Module: lib/ai/tools
  Depends on: @tavily/core, ai, lib/ai/webfetch, zod
  Used by: lib/agents/strategic-advisory, lib/agents/guide, lib/agents/deep-research

Module: lib/ai/webfetch
  Depends on: axios
  Used by: lib/ai/tools, lib/scraping/content-scraper
```

### Agent Pipeline

```
Module: lib/agents/pipeline
  Depends on: all 6 agents, lib/ai/models, lib/inngest/channels, lib/db, uuid
  Used by: lib/inngest/functions/research-pipeline

Module: lib/agents/types
  Depends on: zod, @prisma/client
  Used by: all agent modules

Module: lib/agents/interpreter
  Depends on: generateObjectWithFallback, lib/db, lib/location, lib/scraping
  Used by: lib/agents/pipeline

Module: lib/agents/market-research
  Depends on: generateObjectWithFallback, lib/db, lib/location
  Used by: lib/agents/pipeline

Module: lib/agents/trend-analysis
  Depends on: generateObjectWithFallback, lib/db, lib/location
  Used by: lib/agents/pipeline

Module: lib/agents/execution-friction
  Depends on: generateObjectWithFallback, lib/db, lib/location
  Used by: lib/agents/pipeline

Module: lib/agents/deep-research
  Depends on: generateObjectWithFallback, generateTextWithFallback, lib/ai/tools, lib/db
  Used by: lib/agents/pipeline

Module: lib/agents/synthesis
  Depends on: generateObjectWithFallback, lib/db, lib/location
  Used by: lib/agents/pipeline

Module: lib/agents/strategic-advisory
  Depends on: generateObjectWithFallback, generateTextWithFallback, lib/ai/tools
  Used by: lib/inngest/functions/weekly-digest

Module: lib/agents/guide
  Depends on: streamText, generateTextWithFallback, lib/ai/models, lib/ai/tools, lib/db
  Used by: app/api/ideas/[id]/guide

Module: lib/agents/startup-coach
  Depends on: generateObjectWithFallback, zod
  Used by: lib/inngest/functions/startup-analysis, lib/inngest/functions/startup-follower-notifications

Module: lib/agents/hub-coach
  Depends on: generateObjectWithFallback, zod
  Used by: app/api/accelerators/[slug]/coach
```

### Inngest

```
Module: lib/inngest/client
  Depends on: inngest
  Used by: lib/auth, lib/inngest/functions/*, app/api/inngest

Module: lib/inngest/channels
  Depends on: inngest, zod
  Used by: lib/agents/pipeline, lib/inngest/functions/research-pipeline

Module: lib/inngest/functions/*
  Depends on: lib/inngest/client, lib/inngest/channels, lib/db, lib/agents/*,
              lib/email/send, lib/opportunities/*, lib/polar/*
  Used by: app/api/inngest (serve)
```

### Data & Email

```
Module: lib/email/client
  Depends on: nodemailer
  Used by: lib/email/send

Module: lib/email/send
  Depends on: lib/email/client
  Used by: All Inngest functions, lib/auth

Module: lib/location/*
  Depends on: (standalone - country-state-city for types)
  Used by: lib/agents/*

Module: lib/scraping/*
  Depends on: lib/ai/webfetch
  Used by: lib/agents/interpreter

Module: lib/opportunities/*
  Depends on: @prisma/client (types), tavily, lib/ai/fallback, lib/ai/tools
  Used by: lib/inngest/functions/opportunity-discovery

Module: lib/polar/*
  Depends on: @polar-sh/sdk
  Used by: lib/auth

Module: lib/memory/client
  Depends on: fetch (native)
  Used by: app/api/startups/[id]/chat
```

### API Routes → Core

```
All API routes in app/api/*
  Depends on: lib/db, lib/auth (for session), lib/arcjet (selective)
  Also depends on: lib/polar/entitlements, lib/startup-permissions,
                   lib/accelerator-permissions-server, lib/email/send,
                   lib/agents/*, lib/memory/*
```

### Components → Hooks

```
components/* (client components)
  Depends on: hooks/index (React Query hooks)
  hooks/index depends on: lib/api-client, lib/auth-client
```

---

## 6. Domain Model

### Core Entities (49 models in Prisma schema)

```
User:
  - CUID, name, email (unique), username? (unique)
  - role: USER | ADMIN, accountStatus: ACTIVE | FROZEN | DELETED
  - emailVerified (Boolean), twoFactorEnabled, emailNotifications
  - relations: ideas[], sessions[], accounts[], entitlements[], auditLogs[],
               startups[], organizations[], twoFactor?, guideConversations[]
  - source: schema.prisma:19-37

TwoFactor:
  - userId (FK->User, unique), secret, backupCodes (Json)
  - source: schema.prisma:39-43

Session:
  - id, userId (FK->User), token, ipAddress, userAgent, activeOrganizationId?
  - source: schema.prisma:45-51

Organization:
  - id, name, slug (unique), logo?, metadata (Json)
  - relations: members[], invitations[]
  - source: schema.prisma:53-60

Member:
  - organizationId (FK->Organization), userId (FK->User), role (owner/admin/member)
  - source: schema.prisma:62-67

Idea:
  - CUID, userId (FK->User)
  - status: PENDING | PROCESSING | RESEARCHED | FAILED | CONVERTED
  - title?, summary?, state? (Json), shareToken? (unique), extractedUrls[] (String)
  - locationInput?, locationCountry?, locationCity?, locationDetected?
  - relations: inputs[3], researchJobs[], researchPackets[], scores[],
               researchLogs[], urlContents[], promptVersions[],
               guideConversations[], startup?, snapshots[]
  - source: schema.prisma:102-131

Startup:
  - CUID, ideaId? (unique FK->Idea), userId (FK->User)
  - slug (unique), name, stage (IDEA->VALIDATION->BUILDING->LAUNCHED->SCALING)
  - targetMarket, isLaunched, currentWeekNumber (default 1)
  - primaryMetricType (34 values), primaryMetricValue?
  - locationCountry?, locationCity?, organizationId?
  - relations: weeklyUpdates[], metrics[], goals[], opportunities[],
               taskLists[], tasks[], members[], followers[], conversations[],
               streak?, mentorMatches[], cohortStartups[], feedItems[]
  - source: schema.prisma:265-300

Accelerator:
  - CUID, name, slug (unique), ownerId (FK->User)
  - isPublic (default true), isActive (default true)
  - relations: cohorts[], events[], applications[], members[],
               invitations[], kpis[], reports[], mentors[]
  - source: schema.prisma:428-450

WeeklyUpdate:
  - CUID, startupId (FK->Startup), weekNumber, weekStart, weekEnd
  - learnings (min 10 chars), morale (1-10), submittedAt
  - aiVerdict? (ON_TRACK/NEEDS_ATTENTION/AT_RISK), aiAnalysis? (Json)
  - aiConfidence?, aiTrajectory?, aiRecommendations?[]
  - editedAt? (3-day edit window)
  - relations: goals[1-3], metricEntries[], user?
  - source: schema.prisma:315-337
```

### Key Enums (21 enums)

| Enum | Values | Source |
|---|---|---|
| `UserRole` | USER, ADMIN | :15 |
| `AccountStatus` | ACTIVE, FROZEN, DELETED | :16 |
| `StartupMemberRole` | OWNER, ADMIN, MEMBER, VIEWER | :17 |
| `IdeaStatus` | PENDING, PROCESSING, RESEARCHED, FAILED, CONVERTED | :89 |
| `IdeaInputType` | TEXT, AUDIO, IMAGE | :91 |
| `ResearchJobStatus` | PENDING, RUNNING, COMPLETED, FAILED | :93 |
| `ResearchAgentType` | INTERPRETER, MARKET_RESEARCH, TREND_ANALYSIS, EXECUTION_FRICTION, SYNTHESIS, DEEP_RESEARCH, STRATEGIC_ADVISORY | :95 |
| `EntitlementPlan` | FREE, PRO | :184 |
| `EntitlementStatus` | ACTIVE, CANCELED, PAST_DUE, EXPIRED | :185 |
| `UrlContentStatus` | PENDING, SCRAPED, FAILED | :194 |
| `GuideMessageRole` | USER, ASSISTANT, SYSTEM | :201 |
| `StartupStage` | IDEA, VALIDATION, BUILDING, LAUNCHED, SCALING | :246 |
| `TargetMarket` | CONSUMER, SMB, ENTERPRISE | :247 |
| `PrimaryMetricType` | MRR, ARR, DAU, MAU, RETENTION_RATE, CHURN_RATE, LTV, CAC, ... (34 total) | :260 |
| `MetricPeriod` | DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY | :261 |
| `MetricFormat` | CURRENCY, PERCENTAGE, NUMBER | :262 |
| `OpportunityCategory` | FELLOWSHIP, SCHOLARSHIP, FUNDING, COMPETITION, ACCELERATOR, GRANT, MENTORSHIP, OTHER | :380 |
| `OpportunityStatus` | DISCOVERED, BOOKMARKED, TO_APPLY, APPLIED, INTERVIEWING, ACCEPTED, REJECTED | :386 |
| `AcceleratorRole` | OWNER, PROGRAM_MANAGER, OPERATIONS_LEAD, MENTOR, OBSERVER | :403 |
| `ResearchFeedType` | IDEA_RESEARCH, WEEKLY_REPORT, WEEKLY_DIGEST, WEEKLY_REMINDER | :402 |
| `TaskStatus` | TODO, IN_PROGRESS, BLOCKED, DONE | :500 |

### Data Flow

```
User submits Idea (text/audio/image)
  -> IdeaInput created, status=PENDING
  -> Inngest event "idea.submitted" fires
  -> research-pipeline runs 6 agents sequentially:
      Interpreter -> MarketResearch -> TrendAnalysis ->
      ExecutionFriction -> DeepResearch -> Synthesis
  -> Each agent publishes realtime progress via Inngest channels
  -> ResearchPacket persisted for each agent
  -> IdeaScores stored: clarity, market, execution, overall (0-100)
  -> Verdict: pursue-immediately / needs-more-research / not-recommended
  -> Idea status -> RESEARCHED
  -> Email notification sent to user

Idea -> conversion -> Startup profile
  -> Weekly updates tracked via WeeklyUpdate (pre-launch: conversations only)
  -> Update submission triggers AI Coach analysis (ON_TRACK/NEEDS_ATTENTION/AT_RISK)
  -> Streak tracking via StartupStreak (milestones at 4/8/12/16/20/24/52)
  -> Task management via TaskList + Task (4-status Kanban)
  -> Team management via StartupMember (4 roles, 7 permissions)
  -> External followers receive weekly digest (AI-generated analysis)
  -> Opportunity discovery via daily Tavily cron (8 categories, 7-stage pipeline)
  -> VC Coach: per-startup AI chat with memory, session management

Accelerator program creation
  -> Cohort lifecycle management (start/end dates)
  -> Event scheduling (5 types: workshop, mentor_session, etc.)
  -> Mentor management with expertise tagging
  -> KPI tracking with progress bars + deadlines
  -> Weekly manager reports with AI summaries
  -> AI Hub Coach: cohort health analysis (EXCELLENT/STABLE/CONCERNING/CRITICAL)
  -> Investor one-pagers (print-to-PDF)
  -> Application system with status tracking

Portfolio Intelligence (Weekly on Monday 9AM UTC)
  -> StrategicAdvisory agent runs for all active ideas
  -> Two-phase: web research (5 Tavily calls) + structured synthesis
  -> Verdict: Go / Pause / Kill with brain-drilling questions + kill criteria
  -> Research feed items created with idempotency keys
  -> Email report sent to founder

Billing enforcement:
  -> Idea creation checks isAllowedToCreateIdea() against plan limits
  -> Free plan: 3 active ideas | Pro plan ($20/mo): unlimited
  -> Polar webhooks sync entitlement status via @polar-sh/better-auth
```

---

## 7. External Dependency Audit

### Runtime Dependencies (key)

| Package | Version | Purpose |
|---|---|---|
| `next` | 16.1.1 | Framework |
| `react`/`react-dom` | 19.2.3 | UI library |
| `@prisma/client` | ^7.3.0 | ORM client |
| `@prisma/adapter-pg` | ^7.2.0 | PostgreSQL adapter |
| `better-auth` | ^1.4.10 | Authentication (email/password, Google OAuth, magic link, 2FA, orgs) |
| `@polar-sh/better-auth` | ^1.6.3 | Billing integration plugin |
| `@polar-sh/sdk` | ^0.47.1 | Polar billing SDK |
| `@ai-sdk/google` | ^4.0.10 | Google Gemini AI SDK (single production model) |
| `ai` | ^7.0.18 | Vercel AI SDK v7 (generateObject, generateText, streamText, useChat) |
| `@tanstack/react-query` | ^5.90.16 | Server state management |
| `inngest` | ^4.11.0 | Background jobs + realtime |
| `@arcjet/next` | 1.0.0-beta.16 | Rate limiting / bot detection |
| `@uploadthing/react` | ^7.3.3 | File uploads |
| `nodemailer` | ^7.0.12 | Email (Gmail SMTP) |
| `zod` | ^4.3.5 | Schema validation |
| `recharts` | 3.8.1 | Area/line charts |
| `@dnd-kit/core` | ^6.3.1 | Kanban drag-and-drop |
| `framer-motion` | ^12.24.10 | Animations |
| `tailwindcss` | ^4 | CSS framework |
| `nuqs` | ^2.8.6 | URL search params |
| `pdfkit` | ^0.17.2 | PDF generation (server-side) |
| `@tavily/core` | ^0.6.4 | Web search API |
| `@xyflow/react` | ^12.10.0 | Flow graph visualization |
| `biome` | 2.2.0 | Linter + formatter |

### Dev Dependencies

| Package | Version | Purpose |
|---|---|---|
| `@biomejs/biome` | 2.2.0 | Linter + formatter |
| `typescript` | ^5 | Language |
| `prisma` | ^7.2.0 | ORM CLI |
| `@tailwindcss/postcss` | ^4 | PostCSS plugin |
| `babel-plugin-react-compiler` | 1.0.0 | React compiler Babel plugin |
| `vitest` | ^4.0.16 | Test runner (in deps, not devDeps) |

### Unused / Questionable Packages

See `UNUSED_DEPENDENCIES.md`. Notable:
- `@ai-sdk/mistral`, `@ai-sdk/openai`, `@ai-sdk/xai`, `ai-sdk-ollama`, `@openrouter/ai-sdk-provider` — alternative AI providers, not integrated
- `@pinecone-database/pinecone` — vector search not wired
- `@react-pdf/renderer` — dual PDF lib; `pdfkit` is the active one
- `mprocs`, `list`, `streamdown`, `tokenlens` — dev utilities in production deps

---

## 8. Test Strategy

| Aspect | Detail |
|---|---|
| **Framework** | Vitest (in package.json) |
| **Files discovered** | `lib/email/send.test.ts` (51 lines) — tests email branding, premium layout, verification code display |
| **Naming convention** | `*.test.ts` (colocated) |
| **Coverage targets** | None configured |
| **CI integration** | No test step in CI workflow (`ci.yml`) |
| **Scripts** | `pnpm test` (vitest), `pnpm test:ui`, `pnpm test:coverage` |

---

## 9. Infrastructure Summary

| Aspect | Detail |
|---|---|
| **CI/CD** | GitHub Actions (`ci.yml`) — push/PR to main: pnpm install, prisma generate, biome lint, tsc, next build |
| **Deployment** | Vercel (inferred from `@vercel/analytics` + framework) |
| **Development** | Docker Compose (PostgreSQL 15, port 5446) + mprocs (next dev + inngest + ngrok) |
| **Background Jobs** | Inngest Cloud (local dev via `inngest-cli dev`) |
| **File Storage** | UploadThing (images, audio, video, PDF) |
| **Email** | Nodemailer + Gmail SMTP (Postmark/SendGrid adapter-ready) |
| **Security** | Arcjet (Shield + bot detection + 3 rate limit tiers) |
| **Analytics** | `@vercel/analytics` |
| **Billing** | Polar.sh (Free: 3 ideas / Pro: $20/mo unlimited) |
| **Fonts** | Inter + IBM Plex Mono (Google Fonts via next/font), Nunito (local TTF) |
| **Assets** | OG image, favicons, logo, apple-touch-icon in `public/` |

---

## 10. Lib Directory Deep Dive (63 files, ~12,662 lines)

### lib/agents/ (12 files, ~2,706 lines)

| File | Lines | Exports | Description |
|---|---|---|---|
| `types.ts` | 358 | `IdeaInputData`, `AgentInput`, `PortfolioInput`, `AgentOutput`, `InterpretedIdea`, `MarketResearch`, `MarketSizeData`, `MarketCapitalization`, `LocationMarketSize`, `TrendAnalysis`, `ExecutionFriction`, `Synthesis`, `DeepResearch`, `DeepResearchOutput`, `StrategicAdvisory`, `IdeaState` interfaces + Zod schemas | Central type definitions for all agent I/O. Both nested and flat score formats for backward compat. |
| `pipeline.ts` | 288 | `runResearchPipeline()` | Orchestrates 6-agent sequential pipeline with realtime progress. Saves research packets + scores to DB. |
| `interpreter.ts` | 185 | `runInterpreterAgent()`, `ChangeSignificanceSchema` | Structures raw input. Extracts URLs + locations. AI decides if prompt edit is "major" change. |
| `market-research.ts` | 155 | `runMarketResearchAgent()` | TAM/SAM/SOM analysis with location-aware context. Dual-currency (USD + local). |
| `trend-analysis.ts` | 100 | `runTrendAnalysisAgent()` | Timing verdict (too-early/right-time/late/too-late), tech readiness 1-10. |
| `execution-friction.ts` | 106 | `runExecutionFrictionAgent()` | Tech complexity, resource estimates, risk factors, quick wins. |
| `deep-research.ts` | 129 | `runDeepResearchAgent()` | Two-phase: Tavily web search (5 steps) + structured synthesis. Market gaps, 3-phase roadmap, moat. |
| `synthesis.ts` | 137 | `runSynthesisAgent()` | Final scores (0-100) + verdict + recommendations. Combines 4 previous agent outputs. |
| `startup-coach.ts` | 329 | `analyzeWeeklyUpdate()`, `generateFollowerAnalysis()`, `generateVerdictMessage()` | Blunt coach for founders + softer analysis for followers. |
| `hub-coach.ts` | 85 | `analyzeCohortHealth()` | Accelerator cohort health analysis (EXCELLENT/STABLE/CONCERNING/CRITICAL). |
| `strategic-advisory.ts` | 112 | `runStrategicAdvisoryAgent()` | Portfolio-level Go/Pause/Kill with brain-drilling questions. |
| `guide.ts` | 522 | `initializeGuideConversation()`, `streamGuideMessage()`, `sendGuideMessage()`, etc. | Largest agent. Multi-session conversational AI guide with streaming + full research context. |

### lib/ai/ (4 files, ~859 lines)

| File | Lines | Exports | Description |
|---|---|---|---|
| `models.ts` | 7 | `model`, `getModel()` | Google Gemini 3.5 Flash via `@ai-sdk/google`. Single model for all agents. |
| `fallback.ts` | 177 | `generateObjectWithFallback<T>()`, `generateTextWithFallback()` | Single-model fallback: try `generateObject`, on schema error fall to `generateText` + JSON parse. |
| `tools.ts` | 562 | `webSearch`, `getIndustryNews`, `getCompetitorUpdates`, `getIdeaContext`, `updateIdeaState`, `addStartupTask`, `trackOpportunity`, etc. (16 tools) | AI tools available to agents. Tavily search + DB CRUD. Lazy-imports db to avoid circular deps. |
| `webfetch.ts` | 113 | `webfetch()`, `isUrlReachable()`, `getContentType()` | HTTP fetch via axios with configurable timeout, max length, redirect following. |

### lib/inngest/ (13 files, ~2,088 lines)

| File | Lines | Exports | Description |
|---|---|---|---|
| `client.ts` | 128 | `inngest` instance, `InngestEvents` type | SDK init + type-safe event definitions |
| `channels.ts` | 38 | `ideaChannel` realtime channel | Real-time progress topics for idea research |
| `functions/research-pipeline.ts` | 232 | `researchPipelineFunction` | `idea.submitted` -> full pipeline -> email + feed item |
| `functions/startup-analysis.ts` | 176 | `analyzeWeeklyUpdateFn` | `weeklyUpdate.created` -> AI coach analysis |
| `functions/startup-weekly-report.ts` | 167 | `weeklyStartupReportFn`, `weeklyStartupReportCron` | Sun 9AM UTC weekly report email |
| `functions/startup-weekly-reminder.ts` | 241 | `weeklyUpdateReminderFn`, `FridayCron`, `SaturdayCron` | Fri/Sat 5PM UTC reminder emails |
| `functions/startup-follower-notifications.ts` | 266 | `followerAddedFn`, `teamMemberAddedFn`, `followerWeeklyUpdateFn` | Follower welcome + weekly digest |
| `functions/weekly-digest.ts` | 312 | `weeklyStrategicReportFunction` | Mon 9AM UTC strategic advisory + email |
| `functions/opportunity-discovery.ts` | 140 | `opportunityDiscoveryCron` | Daily 6AM UTC Tavily opportunity search |
| `functions/re-evaluation.ts` | 66 | `reevaluationFunction` | Monthly re-research stale ideas |
| `functions/auth-emails.ts` | 97 | `sendVerificationEmailFunction*` | Auth email sending + default entitlement creation |
| `functions/startup-feature-announcement.ts` | 69 | `sendStartupFeatureAnnouncement`, `broadcastStartupFeatureAnnouncement` | Feature announcement emails |
| `functions/cleanup-unverified.ts` | 92 | `cleanupUnverifiedUsers` | Monthly cleanup of unverified users > 90 days |

### lib/email/ (3 files, ~2,068 lines)

| File | Lines | Exports | Description |
|---|---|---|---|
| `client.ts` | 98 | `getEmailBranding()`, `sendEmail()`, `verifyEmailConnection()` | Nodemailer transport. Logo via Cloudinary CID. |
| `send.ts` | 1919 | `renderPremiumEmail()`, 14 email send functions | Largest file. Full HTML email templates with responsive design. |
| `send.test.ts` | 51 | Tests for branding, layout, verification code display | Only test file in the project. |

### Other lib modules:

| Directory | Files | Key exports |
|---|---|---|
| `location/` | 4 | `detectLocationFromIp()`, `detectLocationFromText()`, `buildLocationResearchContext()` — country detection + AI context |
| `scraping/` | 3 | `extractUrls()`, `scrapeUrl()`, `scrapeUrls()`, `sanitizeUrlStrings()` — URL extraction + content scraping |
| `opportunities/` | 2 | `dedupeOpportunities()`, `generateStartupOpportunities()`, opportunity normalization |
| `polar/` | 2 | `isAllowedToCreateIdea()`, `syncEntitlement()`, `PLANS` — billing enforcement |
| `validators/` | 2 | Zod schemas for auth forms + startup forms (metric periods, slug regex, etc.) |
| `constants/` | 1 | 35+ metric definitions with labels, formats, periods |
| `memory/` | 1 | Mem0 AI memory client — persistent conversation context (gracefully disabled without API key) |
| `auth/` | 2 | `ac` (AccessControl), `signInWithOAuth()` — org-level permissions |
| `utils/` | 1 | `getWeeksSinceCreation()`, `getWeekStartForDate()`, `getWeekEndForDate()` |
| Top-level | 14 | `db.ts`, `auth.ts`, `auth-client.ts`, `arcjet.ts`, `api-client.ts`, `utils.ts`, `files.ts`, `auth-utils.ts`, `startup-permissions.ts`, `accelerator-permissions.ts`, `accelerator-permissions-server.ts`, `get-server-session.ts`, `uploadthing.ts`, `uploadthing-server.ts` |

---

## 11. Components Architecture (~140+ files)

### Server Components (14 files)
- `ai-elements/` (8): `model-selector.tsx`, `image.tsx`, `node.tsx`, `edge.tsx`, `panel.tsx`, `connection.tsx`, `canvas.tsx`, `toolbar.tsx`
- `idea/` (4): `research-state.tsx`, `score-card.tsx`, `idea-detail-skeleton.tsx`, `idea-notfound.tsx`
- `auth/` (1): `AuthLayout.tsx`
- `marketing/` (1): `footer.tsx`

### Client Components (~130 files)
All other components are `"use client"`. Key groupings:

**AI Elements (28 files)**: Full set of AI SDK primitives — `PromptInput` (multi-modal), `Message` (chat bubbles), `CodeBlock` (Shiki syntax), `Suggestions`, `Artifact`, `ChainOfThought`, `Reasoning`, `Sources`, `InlineCitation`, `WebPreview`, `Loader`, `Shimmer`, `Tool`, `Confirmation`, `Context` (token usage), `Conversation`, `Queue`, `Plan`, `Checkpoint`, `Controls`, `Task`.

**shadcn/ui primitives (55 files)**: All 35 Radix primitives mapped. Notable custom additions: `Empty`, `Field` (compound form field), `Item`, `Kbd`, `ButtonGroup`, `InputGroup`, `InfiniteScroll`, `FileUpload`, `Spinner`, `Sidebar` (725-line custom implementation).

**Business components**:
- `accelerators/`: KPI reporting, investor one-pager, cohort/mentor/event/team management, hub coach, public view
- `ideas/`: CRUD dialogs, market size display, asset management, enhanced form, idea submitted success
- `startups/`: Weekly update form, task board (Kanban), streak dashboard, VC coach, team/follower management
- `onboarding/`: 10-step VC Onboarding wizard with LocationSelector
- `settings/`: 2FA toggle, active sessions, audit log
- `layout/`: Sidebar with collapsible panels, header, user nav, workspace switcher

---

## 12. Hooks & Data Fetching

### hooks/index.ts (~1575 lines)
Comprehensive React Query hooks organized by domain:

**Ideas**: `useIdeas`, `useIdea`, `useIdeaResearch`, `useIdeaPromptHistory`, `useCreateIdea`, `useUpdateIdea`, `useArchiveIdea`/`useUnArchiveIdea`, `useDeleteIdea`, `useRerunResearch`, `useUpdateIdeaPrompt`, `useExportIdeaPdf`

**Dashboard**: `useDashboard` (2 min stale)

**Profile/Billing**: `useProfile`, `useEntitlement`, `useUpdateProfile`, `useSubscription`

**Admin**: `useAdminStats`, `useAdminUsers`, `useAdminAuditLogs`

**Auth**: `useSignIn`, `useSignUp`, `useForgotPassword`, `useResetPassword`, `useVerifyEmail`, `useMagicLink`, `useResendVerification`

**Startups**: `useStartups`, `useStartup`, `useWeeklyUpdates`, `useStartupStreak`, `useCheckSlug`, `useCreateStartup`, `useUpdateStartup`, `useDeleteStartup`, `useCreateWeeklyUpdate`, `useUpdateWeeklyUpdate`, `useToggleGoalCompletion`, `useIdeaStartup`

**Tasks**: `useTaskLists`, `useCreateTaskList`, `useRenameTaskList`, `useDeleteTaskList`, `useCreateTask`, `useMoveTask`, `useDeleteTask`, `useUpdateTask`

**Opportunities**: `useGenerateOpportunities`, `useOpportunities`, `useCreateOpportunity`, `useUpdateOpportunity`, `useDeleteOpportunity`

**Team**: `useTeamMembers`, `useSearchUsers`, `useAddTeamMember`, `useUpdateTeamMember`, `useRemoveTeamMember`

**Followers**: `useFollowers`, `useAddFollower`, `useRemoveFollower`

**Conversations**: `useStartupConversations`, `useStartupConversation`, `useCreateStartupConversation`, `useDeleteStartupConversation`

**Accelerators**: `useAccelerators`, `useAccelerator`, `useCreateAccelerator`, `useUpdateAccelerator`, `useDeleteAccelerator`, `useApplyToAccelerator`, `useAcceleratorApplications`

### Separate hook files:
| File | Hooks | Description |
|---|---|---|
| `useAnalytics.ts` | `useAnalytics`, `useOnboardingStatus`, `useCompleteOnboarding` | Dashboard analytics + onboarding state |
| `useInfiniteIdeas.ts` | `useInfiniteIdeas` | Infinite scroll pagination for ideas |
| `useInfiniteStartups.ts` | `useInfiniteStartups` | Infinite scroll pagination for startups (uses raw fetch) |
| `use-mobile.ts` | `useIsMobile` | Mobile viewport detection (< 768px) |

### Query Configuration
- Default stale time: 5 minutes
- Default gc time: 10 minutes
- Refetch on window focus: enabled
- Retries: 1 (queries), 1 (mutations)
- Provider: `providers/query-provider.tsx`

---

## 13. Migration History (13 migrations)

| Date | Name | Purpose |
|---|---|---|
| 2026-01-07 | `initial_migration` | 8 core tables + 7 enums |
| 2026-01-08 | `add_new_fields_for_better_auth` | AccountStatus, verification/reset fields |
| 2026-01-08 | `update_account_verification_session_models` | Drop/recreate session/account/verification per BA conventions |
| 2026-01-08 | `remove_is_admin_field_from_user_model` | Drop isAdmin |
| 2026-01-08 | `add_username_and_notif_to_user_model` | username, emailNotifications |
| 2026-02-26 | `add_goals_priority_opportunities_accelerator` | **Major**: 15+ tables — startups, updates, accelerators, opportunities |
| 2026-02-28 | `add_startup_streak_model` | startup_streaks |
| 2026-03-04 | `add_tasks_models` | task_lists, tasks |
| 2026-03-04 | `add_team_workflow` | startup_members, shareToken |
| 2026-07-12 | `add_location_fields` | 10 tables + location fields on users/startups |
| 2026-07-12 | `add_organization_tables` | organization, member, invitation (Better Auth orgs) |
| 2026-07-12 | `add_org_setup_models` | two_factor, organizationId on startups, CONVERTED status |

---

## 14. RBAC Model

### Startup Permissions (4 roles, 7 permissions)

| Role | Permissions |
|---|---|
| OWNER | All |
| ADMIN | All except delete_startup |
| MEMBER | update_weekly_update, manage_tasks, view_metrics |
| VIEWER | view_startup (read-only) |

**Permissions**: `view_startup`, `edit_startup`, `delete_startup`, `manage_team`, `manage_followers`, `update_weekly_update`, `manage_tasks`

### Accelerator Permissions (5 roles, 10 permissions)

| Role | Permissions |
|---|---|
| OWNER | All |
| PROGRAM_MANAGER | manage_startups, manage_cohorts, manage_events, manage_kpis, view_metrics, view_startups, submit_reports |
| OPERATIONS_LEAD | manage_startups, manage_events, view_metrics, view_startups, submit_reports |
| MENTOR | view_startups, submit_reports |
| OBSERVER | view_metrics, view_startups |

**Permissions**: `manage_startups`, `manage_cohorts`, `manage_events`, `manage_mentors`, `manage_kpis`, `manage_team`, `manage_accelerator`, `manage_applications`, `view_metrics`, `view_startups`, `submit_reports`

---

## 15. Security & Rate Limiting

### Arcjet Tiers

| Instance | Rule | Endpoints |
|---|---|---|
| `aj` (proxy.ts) | Shield + bot detection | All non-static routes (middleware) |
| `ajRateLimit` | Token bucket: 10 req/60s, burst 100 | General purpose |
| `ajAuth` | Token bucket: 5 req/60s, burst 20 | Auth endpoints |
| `ajAI` | Token bucket: 2 req/60s, burst 10 | POST /api/ideas, research, export |

### Unrated Endpoints (potential abuse vectors)
- `POST /api/auth/custom/verify-email`
- `POST /api/auth/custom/verify-email/token`
- `PUT /api/auth/custom/resend-verification-email`
- `POST /api/auth/custom/sign-up/social`

### Known Security Issues
- `lib/auth-utils.ts` uses `Math.random()` instead of crypto-secure RNG (source: `lib/auth-utils.ts`)
- `lib/auth.ts:97` — `onCustomerStateChanged` uses `forEach` + `await` (doesn't actually await)
- `components/ideas/AssetTab.tsx` imports `@prisma/client` types (server-only leak risk)

---

## 16. Unknowns & Human Questions

1. **No `loading.tsx` files**: The app has no loading states at any route level — all loading is handled client-side via React Query.

2. **No root `middleware.ts`**: Arcjet proxy in `proxy.ts` but not wired as Next.js middleware — it's imported by individual API routes instead.

3. **Pinecone**: SDK in deps, variables in `.env.example`, but listed as unused. No reference found in any source file.

4. **`@ai-sdk/mistral`, `@ai-sdk/openai`, `@ai-sdk/xai`, `@openrouter/ai-sdk-provider`, `ai-sdk-ollama`**: All installed but only `@ai-sdk/google` is actively used. Single-model Gemini architecture.

5. **`DUAL_MODEL_DOCUMENTATION_UPDATE.md`**: Documents a dual-model fallback (Mistral -> Gemini) that contradicts the current single-model code. This is outdated documentation — the code uses only Gemini.

6. **`@react-pdf/renderer`**: Installed alongside `pdfkit` but `pdfkit` is the active PDF engine.

7. **`.nvii/` directory**: Contains `nvii.json` with a project ID — purpose unclear, possibly an NVII project tracking tool.

8. **`feedback.txt`**: Unstructured user feedback about ads/competition — not actionable without context.

9. **`constants/` vs `lib/constants/`**: Dual locations for constants — `constants/index.ts` has FAQ data, `lib/constants/metrics.ts` has metric definitions. Not unified.

10. **`vitest` in production deps**: Listed in `dependencies` instead of `devDependencies` in `package.json`.

11. **Test coverage near-zero**: Only `lib/email/send.test.ts` exists. Vitest is configured but no test runs in CI.

12. **`babel-plugin-react-compiler`**: Listed as devDependency but no Babel config found in the project. Next.js uses the built-in SWC compiler. This plugin may be unused.
