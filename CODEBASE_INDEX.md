# Genesyz Codebase Index

**Last indexed**: 2026-07-21
**Git HEAD**: 605dbdc

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
| **Source file count** | ~490+ source files |

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
│   └── (startup)/       # Startup-specific routes (updates, metrics, tasks, chat, etc.)
├── components/          # React components - ~140+ files across 19 dirs (inspect)
│   ├── accelerators/    # Accelerator Hub components (9 files)
│   ├── ai-elements/     # AI SDK component primitives (28 files)
│   ├── auth/            # Auth form components (3 files)
│   ├── chat/            # Chat verdict card (1 file)
│   ├── dashboard/       # Dashboard analytics cards (1 file)
│   ├── faqs/            # FAQ search bar (1 file)
│   ├── guide/           # Guide agent chat widget (1 file)
│   ├── idea/            # Idea detail server components (4 files)
│   ├── ideas/           # Idea list/form/detail components (12 files)
│   ├── layout/          # Navigation, sidebar, header, workspace (8 files)
│   ├── location/        # Geographic location selector (2 files)
│   ├── marketing/       # Landing page sections + pipeline viz (8 files)
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
├── lib/                 # Core libraries - 66 source files, ~13,100 lines (inspect)
│   ├── agents/          # 12 files - 11 AI agents + types (inspect)
│   ├── ai/              # 5 files - model, fallback, tools, webfetch, stream-fallback (inspect)
│   ├── auth/            # 2 files - access control, OAuth sign-in (inspect)
│   ├── constants/       # 2 files - 35+ metric definitions + verdicts (inspect)
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
│   ├── schema.prisma    # 49 models, 21 enums, ~1292 lines
│   ├── seed.ts          # Accelerator program seed
│   └── migrations/      # 14 migration files
├── providers/           # React Query provider (1 file) (inspect)
├── public/              # Static assets - 14 files (favicons, OG image, logo, fonts) (skip)
├── scratch/             # Local developer scratch scripts (skip)
├── scripts/             # Utility scripts (4 files) (catalog)
├── .env                 # Gitignored (skip)
├── .env.example         # 43 env vars across 9 categories (inspect)
├── .gitignore           # Git ignore rules (catalog)
├── ACCELERATOR_HUB_GUIDE.md  # Accelerator user guide (catalog)
├── DUAL_MODEL_DOCUMENTATION_UPDATE.md  # Outdated dual-model docs (catalog)
├── README.md            # Project README (inspect)
├── RULES.md             # Coding standards & conventions (inspect)
├── TECH_STACK.md        # Tech stack reference (inspect)
├── biome.json           # Linter/formatter v2.2 (inspect)
├── components.json      # shadcn/ui config (inspect)
├── docker-compose.yml   # PostgreSQL 15 on port 5446 (inspect)
├── feedback.txt         # User feedback (catalog)
├── mprocs.yaml          # Multi-process runner (next + inngest + ngrok) (inspect)
├── next-env.d.ts        # Next.js types (skip)
├── next.config.ts       # reactCompiler: true, serverExternalPackages: ["pdfkit"] (inspect)
├── package.json         # 128 deps, 14 devDeps, 31 scripts (inspect)
├── pnpm-lock.yaml       # Lock file (skip)
├── pnpm-workspace.yaml  # Allowed builds configuration (inspect)
├── postcss.config.mjs   # @tailwindcss/postcss v4 (inspect)
├── prisma.config.ts     # Prisma ORM config (inspect)
├── proxy.ts             # Arcjet middleware + auth redirect (inspect)
├── run_automation.py    # Playwright integration testing flow script (inspect)
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
| `layout.tsx` | Root layout with ThemeProvider, QueryProvider, NuqsAdapter, Toaster, UploadThing, Vercel Analytics, Inter + Space Grotesk + JetBrains Mono fonts |
| `globals.css` | Tailwind v4 directives + CSS variables (oklch colors, dark mode, typography system) |
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

**Skeleton Loading States** (RSC loading boundaries):
- `app/(dashboard)/loading.tsx` - Loading skeleton screen for main dashboard view
- `app/(dashboard)/ideas/loading.tsx` - Loading skeleton screen for ideas feed
- `app/(startup)/startups/[slug]/loading.tsx` - Loading skeleton screen for startup workspace pages

**Non-page app components**: 8 startup workspace components co-located in `app/(startup)/startups/[slug]/` (`StartupDashboard.tsx`, `MetricsDashboard.tsx`, `StartupSettings.tsx`, `TasksPageContent.tsx`, `WeeklyUpdatesList.tsx`, `NewWeeklyUpdate.tsx`, `EditWeeklyUpdate.tsx`, `layout-shell.tsx`), plus `app/(dashboard)/startups/StartupsList.tsx`.

**Non-route app support files**: `app/api/uploadthing/core.ts` (UploadThing file router config: image/audio/pdf uploaders), `app/api/inngest/token/_actions/fetchRealtimeSubscriptionToken.ts` (server action for Inngest realtime tokens).

**Pages** (54 `page.tsx` files):

| Route Group | Routes |
|---|---|
| **Marketing** | `/`, `/about`, `/faq`, `/how-it-works`, `/pricing`, `/privacy`, `/terms`, `/contact`, `/accelerators`, `/accelerators/new`, `/accelerators/[slug]`, `/accelerators/[slug]/apply` |
| **Auth** | `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/verify-email`, `/verify-email/[token]`, `/verify-email/resend`, `/magic-link` |
| **Dashboard** | `/dashboard`, `/ideas`, `/ideas/new`, `/ideas/[id]`, `/ideas/archived`, `/startups`, `/startups/new`, `/chat`, `/billing`, `/settings`, `/onboarding`, `/my-accelerators`, `/admin`, `/admin/users`, `/admin/accelerators/[slug]` |
| **Public** | `/ideas/shared/[token]` |
| **Startup** | `/[slug]`, `/[slug]/updates`, `/[slug]/updates/new`, `/[slug]/updates/[id]/edit`, `/[slug]/metrics`, `/[slug]/tasks`, `/[slug]/chat/[[...convId]]` (VC Coach optional chat route), `/[slug]/opportunities`, `/[slug]/profile`, `/[slug]/settings`, `/[slug]/research-feed`, `/[slug]/streaks`, `/[slug]/applications`, `/[slug]/cofounders`, `/[slug]/school` |
| **Standalone** | `/accelerator/admin` |

---

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

---

### Background Jobs (Inngest - 20 registered functions across 11 files)

The Inngest background job system serves 20 distinct functions grouped in `lib/inngest/functions/`:

| File | Registered Function(s) | Trigger / Cron | Description |
|---|---|---|---|
| `research-pipeline.ts` | `researchPipelineFunction` | `idea.submitted` | 3-phase sequential multi-agent research pipeline (Interpreter Phase → Parallel Agents Phase → Synthesis Phase) |
| `auth-emails.ts` | `sendVerificationEmailFunction`, `sendWelcomeEmailFunction`, `sendPasswordResetEmailFunction`, `sendMagicLinkEmailFunction` | `email.send.*` events | Sends auth emails and provisions default subscriptions |
| `startup-analysis.ts` | `analyzeWeeklyUpdateFn` | `weeklyUpdate.created` | AI coach feedback analysis on founder's weekly check-in |
| `startup-weekly-report.ts` | `weeklyStartupReportFn`, `weeklyStartupReportCron` | Event + Cron (Sun 9AM UTC) | Prepares and emails detailed weekly progress report |
| `startup-weekly-reminder.ts` | `weeklyUpdateReminderFn`, `weeklyUpdateReminderCronFriday`, `weeklyUpdateReminderCronSaturday` | Event + Crons (Fri/Sat 5PM UTC) | Sends reminder notifications to update weekly startup logs |
| `weekly-digest.ts` | `weeklyStrategicReportFunction` | Cron (Mon 9AM UTC) | Generates and sends portfolio strategic advisory report |
| `opportunity-discovery.ts` | `opportunityDiscoveryCron` | Cron (Daily 6AM UTC) | Discovers localized startup opportunities via Tavily |
| `re-evaluation.ts` | `reevaluationFunction` | Cron (Monthly 1st) | Automatically re-researches stale ideas older than 30 days |
| `startup-follower-notifications.ts` | `followerAddedFn`, `teamMemberAddedFn`, `followerWeeklyUpdateFn` | Events | Handles welcome digests and alerts for team additions and followers |
| `startup-feature-announcement.ts` | `sendStartupFeatureAnnouncement`, `broadcastStartupFeatureAnnouncement` | Events | Handles system announcements and targeted emails |
| `cleanup-unverified.ts` | `cleanupUnverifiedUsers` | Cron (Monthly 1st) | Prunes unverified accounts older than 90 days |

---

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
| **Package** | `package.json` | 128 deps, 14 devDeps, 34 scripts |
| **Workspace** | `pnpm-workspace.yaml` | Allowed builds for prisma engines, sharp, better-sqlite3, @google/genai |
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
  Depends on: @ai-sdk/google, @ai-sdk/mistral, @openrouter/ai-sdk-provider, ai
  Used by: lib/agents/*, lib/ai/fallback, lib/ai/stream-fallback

Module: lib/ai/fallback
  Depends on: ai (generateObject, generateText), lib/ai/models, zod
  Used by: lib/agents/*

Module: lib/ai/stream-fallback
  Depends on: ai (streamText, generateText), lib/ai/models
  Used by: lib/agents/guide

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
  Depends on: streamTextWithFallback, generateTextWithFallback, lib/ai/models, lib/ai/tools, lib/db
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
  Depends on: fetch (native), mem0ai
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
  - emailVerified (Boolean), twoFactorEnabled, emailNotifications, onboardingDismissed
  - relations: ideas[], sessions[], accounts[], entitlements[], auditLogs[],
               startups[], organizations[], twoFactor?, guideConversations[]
  - source: schema.prisma:19-38

TwoFactor:
  - userId (FK->User, unique), secret, backupCodes (Json)
  - source: schema.prisma:40-44

Session:
  - id, userId (FK->User), token, ipAddress, userAgent, activeOrganizationId?
  - source: schema.prisma:46-52

Organization:
  - id, name, slug (unique), logo?, metadata (Json)
  - relations: members[], invitations[]
  - source: schema.prisma:54-61

Member:
  - organizationId (FK->Organization), userId (FK->User), role (owner/admin/member)
  - source: schema.prisma:63-68

Idea:
  - CUID, userId (FK->User)
  - status: PENDING | PROCESSING | RESEARCHED | FAILED | CONVERTED
  - title?, summary?, state? (Json), shareToken? (unique), extractedUrls[] (String)
  - locationInput?, locationCountry?, locationCity?, locationDetected?
  - relations: inputs[3], researchJobs[], researchPackets[], scores[],
               researchLogs[], urlContents[], promptVersions[],
               guideConversations[], startup?, snapshots[]
  - source: schema.prisma:103-132

Startup:
  - CUID, ideaId? (unique FK->Idea), userId (FK->User)
  - slug (unique), name, stage (IDEA->VALIDATION->BUILDING->LAUNCHED->SCALING)
  - targetMarket, isLaunched, currentWeekNumber (default 1)
  - primaryMetricType (34 values), primaryMetricValue?
  - locationCountry?, locationCity?, organizationId?
  - relations: weeklyUpdates[], metrics[], goals[], opportunities[],
               taskLists[], tasks[], members[], followers[], conversations[],
               streak?, mentorMatches[], cohortStartups[], feedItems[]
  - source: schema.prisma:266-301

Accelerator:
  - CUID, name, slug (unique), ownerId (FK->User)
  - isPublic (default true), isActive (default true)
  - relations: cohorts[], events[], applications[], members[],
               invitations[], kpis[], reports[], mentors[]
  - source: schema.prisma:429-451

WeeklyUpdate:
  - CUID, startupId (FK->Startup), weekNumber, weekStart, weekEnd
  - learnings (min 10 chars), morale (1-10), submittedAt
  - aiVerdict? (ON_TRACK/NEEDS_ATTENTION/AT_RISK), aiAnalysis? (Json)
  - aiConfidence?, aiTrajectory?, aiRecommendations?[]
  - editedAt? (3-day edit window)
  - relations: goals[1-3], metricEntries[], user?
  - source: schema.prisma:316-338
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
  -> research-pipeline runs 3 phases:
      1. Interpreter Phase -> runInterpreterPhase() (determines title/summary, edits significance)
      2. Parallel Phase -> runParallelPhase() (MarketResearch + TrendAnalysis + ExecutionFriction + DeepResearch in parallel)
      3. Synthesis Phase -> runSynthesisPhase() (combines inputs to output final scores & recommendation)
  -> Real-time progress updates streamed through Inngest event channels (Interpreter, Market, Trend, Friction, Deep, Synthesis)
  -> ResearchPacket persisted for each agent
  -> IdeaScores stored: clarity, market, execution, overall (0-100)
  -> Verdict: pursue-immediately / needs-more-research / not-recommended
  -> Idea status -> RESEARCHED
  -> Email notification sent to user

Idea -> conversion -> Startup profile
  -> Weekly updates tracked via WeeklyUpdate (pre-launch: conversations only; post-launch: full metrics)
  -> Update submission triggers AI Coach analysis (ON_TRACK/NEEDS_ATTENTION/AT_RISK)
  -> Streak tracking via StartupStreak (milestones at 4/8/12/16/20/24/52)
  -> Task management via TaskList + Task (4-status Kanban)
  -> Team management via StartupMember (4 roles, 7 permissions)
  -> External followers receive weekly digest (AI-generated analysis)
  -> Opportunity discovery via daily Tavily cron (8 categories, 7-stage pipeline)
  -> VC Coach: per-startup AI chat (via x-conversation-id headers state-replaces url) with memory, session management

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
| `@openrouter/ai-sdk-provider` | ^3.0.0 | OpenRouter AI SDK provider wrapper |
| `@ai-sdk/google` | ^4.0.10 | Google Gemini AI SDK provider |
| `@ai-sdk/mistral` | ^4.0.7 | Mistral AI SDK provider |
| `ai` | ^7.0.18 | Vercel AI SDK v7 (generateObject, generateText, streamText, useChat) |
| `@tanstack/react-query` | ^5.90.16 | Server state management |
| `inngest` | ^4.11.0 | Background jobs + realtime |
| `@arcjet/next` | 1.0.0-beta.16 | Rate limiting / bot detection |
| `@uploadthing/react` | ^7.3.3 | File uploads |
| `nodemailer` | ^7.0.12 | Email (Gmail SMTP with PREVIEW_EMAILS_DIR HTML write support) |
| `zod` | ^4.3.5 | Schema validation |
| `recharts` | 3.8.1 | Area/line charts |
| `@dnd-kit/core` | ^6.3.1 | Kanban drag-and-drop |
| `framer-motion` | ^12.24.10 | Animations |
| `tailwindcss` | ^4 | CSS framework |
| `nuqs` | ^2.8.6 | URL search params |
| `pdfkit` | ^0.17.2 | PDF generation (server-side) |
| `@tavily/core` | ^0.6.4 | Web search API |
| `@xyflow/react` | ^12.10.0 | Flow graph visualization |
| `mem0ai` | ^3.0.13 | Mem0 AI Memory SDK |
| `biome` | 2.2.0 | Linter + formatter |

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
| **Email** | Nodemailer + Gmail SMTP (Postmark/SendGrid adapter-ready; disk storage preview enabled via `PREVIEW_EMAILS_DIR`) |
| **Security** | Arcjet (Shield + bot detection + 3 rate limit tiers) |
| **Analytics** | `@vercel/analytics` |
| **Billing** | Polar.sh (Free: 3 ideas / Pro: $20/mo unlimited) |
| **Fonts** | Inter (sans-serif), Space Grotesk (display), JetBrains Mono (mono) via Tailwind variables |
| **Assets** | OG image, favicons, logo, apple-touch-icon in `public/` |
| **Automation** | `run_automation.py` (Playwright flow simulating signup → onboarding skip → idea submit → research wait → startup convert → dashboard & VC coach screenshotting) |

---

## 10. Lib Directory Deep Dive (66 files, ~13,100 lines)

### lib/agents/ (12 files, ~2,706 lines)

| File | Lines | Exports | Description |
|---|---|---|---|
| `types.ts` | 358 | `IdeaInputData`, `AgentInput`, `PortfolioInput`, `AgentOutput`, `InterpretedIdea`, `MarketResearch`, `MarketSizeData`, `MarketCapitalization`, `LocationMarketSize`, `TrendAnalysis`, `ExecutionFriction`, `Synthesis`, `DeepResearch`, `DeepResearchOutput`, `StrategicAdvisory`, `IdeaState` interfaces + Zod schemas | Central type definitions for all agent I/O. Both nested and flat score formats for backward compat. |
| `pipeline.ts` | 297 | `runInterpreterPhase()`, `runParallelPhase()`, `runSynthesisPhase()`, `runResearchPipeline()` | Orchestrates 6-agent pipeline. Split into phases to execute via Inngest steps (Market, Trend, Friction, Deep run in parallel). |
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

### lib/ai/ (5 files, ~1,300 lines)

| File | Lines | Exports | Description |
|---|---|---|---|
| `models.ts` | 70 | `model`, `getModel()`, `modelChain` | Defines provider chains for Mistral, OpenRouter (Gemini, Llama, Qwen, Nemotron), and Google. Dev priorities Mistral first, Prod priorities Gemini first. |
| `fallback.ts` | 392 | `generateObjectWithFallback<T>()`, `generateTextWithFallback()` | Implements multi-model try/catch loop with quota delay backoffs, truncated JSON repair (`repairTruncatedJson()`), and text-only JSON generation fallback. |
| `stream-fallback.ts` | 77 | `streamTextWithFallback()` | Streaming text model routing that queries parallel fast probe health checks (`isModelHealthy`), filters down to online systems, and maps instructions parameter context. |
| `tools.ts` | 562 | `webSearch`, `getIndustryNews`, `getCompetitorUpdates`, `getIdeaContext`, `updateIdeaState`, `addStartupTask`, `trackOpportunity`, etc. (16 tools) | AI tools available to agents. Tavily search + DB CRUD. Lazy-imports db to avoid circular deps. |
| `webfetch.ts` | 113 | `webfetch()`, `isUrlReachable()`, `getContentType()` | HTTP fetch via axios with configurable timeout, max length, redirect following. |

### lib/inngest/ (13 files, ~2,088 lines)

| File | Lines | Exports | Description |
|---|---|---|---|
| `client.ts` | 128 | `inngest` instance, `InngestEvents` type | SDK init + type-safe event definitions |
| `channels.ts` | 38 | `ideaChannel` realtime channel | Real-time progress topics for idea research |
| `functions/research-pipeline.ts` | 238 | `researchPipelineFunction` | `idea.submitted` -> runs 3 phase pipeline steps -> email + feed item |
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

### lib/email/ (3 files, ~2,100 lines)

| File | Lines | Exports | Description |
|---|---|---|---|
| `client.ts` | 106 | `getEmailBranding()`, `sendEmail()`, `verifyEmailConnection()` | Nodemailer transport. Logo via Cloudinary CID. Includes a directory-write preview mode. |
| `send.ts` | 1919 | `renderPremiumEmail()`, 14 email send functions | Full HTML email templates with light-mode-only enforcement to prevent dark-mode CSS overrides. |
| `send.test.ts` | 51 | Tests for branding, layout, verification code display | Vitest script validating logo, colors, and layout metrics. |

### Other lib modules:

| Directory | Files | Key exports |
|---|---|---|
| `location/` | 4 | `detectLocationFromIp()`, `detectLocationFromText()`, `buildLocationResearchContext()` — country detection + AI context |
| `scraping/` | 3 | `extractUrls()`, `scrapeUrl()`, `scrapeUrls()`, `sanitizeUrlStrings()` — URL extraction + content scraping |
| `opportunities/` | 2 | `dedupeOpportunities()`, `generateStartupOpportunities()`, opportunity normalization |
| `polar/` | 2 | `isAllowedToCreateIdea()`, `syncEntitlement()`, `PLANS` — billing enforcement |
| `validators/` | 2 | Zod schemas for auth forms + startup forms (metric periods, slug regex, etc.) |
| `constants/` | 2 | 35+ metric definitions with labels (`metrics.ts`) + weekly status updates configs (`verdicts.ts`) |
| `memory/` | 1 | Mem0 AI memory client — persistent conversation context (sanitizes invisible key chars, log failures) |
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

**shadcn/ui primitives (55 files)**: All 35 Radix primitives mapped. Notable custom additions: `Empty`, `Field` (compound form field), `Item`, `Kbd`, `ButtonGroup`, `InputGroup`, `InfiniteScroll`, `FileUpload`, `Spinner`, `Sidebar` (primitives integration matching shadcn conventions).

**Business components**:
- `accelerators/`: KPI reporting, investor one-pager, cohort/mentor/event/team management, hub coach, public view
- `ideas/`: CRUD dialogs, market size display, asset management, enhanced form, idea submitted success, research-pipeline-progress (realtime pipeline progress tracker utilizing `useRealtime` hook subscriptions)
- `startups/`: Weekly update form, task board (Kanban), streak dashboard, VC coach, team/follower management
- `marketing/`: Navbar, Hero, and `pipeline-viz.tsx` (Framer motion animated 6-agent display for marketing landing pages)
- `onboarding/`: 10-step VC Onboarding wizard with LocationSelector and modal triggers
- `settings/`: 2FA toggle, active sessions, audit log
- `layout/`: Collapsible sidebar layout structure, header, user nav, workspace switcher

---

## 12. Hooks & Data Fetching

### hooks/index.ts (~1575 lines)
Comprehensive React Query hooks organized by domain:

**Ideas**: `useIdeas`, `useIdea`, `useIdeaResearch`, `useIdeaPromptHistory`, `useCreateIdea`, `useUpdateIdea`, `useArchiveIdea`/`useUnArchiveIdea`, `useDeleteIdea`, `useRerunResearch`, `useUpdateIdeaPrompt`, `useExportIdeaPdf`

**Dashboard**: `useDashboard` (2 min stale)

**Profile/Billing**: `useProfile`, `useEntitlement`, `useUpdateProfile`, `useSubscription`

**Admin**: `useAdminStats`, `useAdminUsers`, `useAdminAuditLogs`

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

## 13. Migration History (14 migrations)

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
| 2026-07-20 | `fix_users_location_column` | Adjusts database mapping for location fields and adds `onboardingDismissed` to User |

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

## 16. Structural Insights

1. **Skeleton Loading Boundaries**: The app incorporates server loading skeletons (`loading.tsx` files) at key routes: `app/(dashboard)/loading.tsx`, `app/(dashboard)/ideas/loading.tsx`, and `app/(startup)/startups/[slug]/loading.tsx`, improving the perception of load latency during route transitions.

2. **No Root Next.js Middleware**: The Arcjet security rules are initialized in `proxy.ts`, but this is imported and run by individual API routes and components rather than registering as a root `middleware.ts`.

3. **Multi-Model Provider Fallbacks**: The AI architecture defines a tiered list of providers and models (`mistralModels`, `openRouterModels`, `geminiModels`) with robust client fallback behavior. If structured generation `generateObject` fails due to schema validation issues or rate limits, the library handles retry backoff delays, parses text fallbacks directly, and auto-repairs truncated JSON packets (`repairTruncatedJson()`).

4. **Stream Fallbacks & Health Checks**: Streaming text generation (`streamTextWithFallback`) queries model health proactively via parallel probes, selecting only verified online models while normalising client instructions fields to the correct system prompt key.

5. **Smooth VC Coach Transition**: The VC Coach component updates the browser's conversation path dynamically without a full-page reload. The custom `fetch` interceptor on the AI SDK's `DefaultChatTransport` captures the returned `x-conversation-id` header on the first request and seamlessly applies it via HTML5 history state updates.

6. **Vitest Production Deps**: `vitest` is declared in `dependencies` rather than `devDependencies` inside `package.json`.

7. **Babel Compiler Config**: `babel-plugin-react-compiler` is included in devDependencies, but the Next.js runtime is configured to use SWC natively.
