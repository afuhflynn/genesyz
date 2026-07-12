# Genesyz Codebase Index

**Last indexed**: 2026-07-11
**Git HEAD**: Current working tree

---

## 1. Project Identity Card

| Field | Value |
|---|---|
| **Project name** | Genesyz |
| **Primary language** | TypeScript (strict mode) |
| **Framework(s)** | Next.js 16.1.1 (App Router), React 19, Tailwind CSS v4, shadcn/ui (New York) |
| **Build system** | Next.js build (`pnpm build`) |
| **Package manager** | pnpm (workspaces), pnpm-lock.yaml |
| **Repo structure** | Single package (with `.opencode/` workspace plugin) |
| **Line count** | ~56,026 (TS/TSX/CSS/JS/MJS excluding node_modules/.next) |
| **File count** | ~362 source files (TS/TSX/CSS/JS/MJS) |

---

## 2. Top-Level Directory Map

```
genesyz/
├── .agents/             # AI agent skills (react-doctor skill) (scan)
├── .github/             # CI/CD workflows + master prompt (catalog)
├── .opencode/           # opencode AI config + migration plans (scan)
├── .vscode/             # VS Code settings (skip)
├── .nvii/               # NVII project tracking (scan)
├── app/                 # Next.js App Router - 131 files (inspect)
│   ├── (auth)/          # Auth pages (sign-in, sign-up, etc.)
│   ├── (dashboard)/     # Dashboard pages (ideas, startups, billing, admin)
│   ├── (marketing)/     # Landing, about, pricing, FAQ, accelerators, legal
│   ├── (public)/        # Shared idea pages
│   ├── (startup)/       # Startup-specific pages
│   ├── accelerator/     # Accelerator admin
│   └── api/             # 63 API route files
├── components/          # React components - 156 files (inspect)
│   ├── accelerators/    # Accelerator Hub components (9 files)
│   ├── ai-elements/     # AI SDK primitive components (30 files)
│   ├── auth/            # Auth form components (4 files)
│   ├── chat/            # Chat interface components (2 files)
│   ├── dashboard/       # Dashboard analytics cards (1 file)
│   ├── faqs/            # FAQ search bar (1 file)
│   ├── guide/           # Guide agent chat (2 files)
│   ├── idea/            # Idea detail components (5 files)
│   ├── ideas/           # Idea list/form components (11 files)
│   ├── layout/          # Navigation, sidebar, header (7 files)
│   ├── location/        # Location selector (2 files)
│   ├── marketing/       # Landing page sections (7 files)
│   ├── onboarding/      # VC Onboarding wizard (2 files)
│   ├── prompt/          # Prompt viewer (2 files)
│   ├── providers/       # Theme provider (1 file)
│   ├── shared/          # Shared dialogs (1 file)
│   ├── startups/        # Startup components (14 files)
│   └── ui/              # shadcn/ui primitives + custom (55 files)
├── config/              # Axios client config (1 file) (inspect)
├── constants/           # FAQ data, static constants (1 file) (catalog)
├── docs/                # Domain documentation (6 files) (catalog)
├── hooks/               # Custom React Query hooks (5 files) (inspect)
├── lib/                 # Core libraries - 57 files (inspect)
│   ├── agents/          # 11 AI agents + types (12 files)
│   ├── ai/              # Model definitions, fallback, tools (4 files)
│   ├── auth/            # Sign-in utility (1 file)
│   ├── constants/       # Metric definitions (1 file)
│   ├── email/           # Email client + send (2 files)
│   ├── inngest/         # Inngest client + channel + 10 functions (12 files)
│   ├── location/        # Location detection + research context (4 files)
│   ├── opportunities/   # Opportunity discovery + generation (2 files)
│   ├── polar/           # Polar billing SDK + entitlements (2 files)
│   ├── scraping/        # URL extraction + content scraping (3 files)
│   ├── utils/           # Date formatting utility (1 file)
│   └── validators/      # Startup form validation (1 file)
├── nuqs/                # URL search params schema (1 file) (catalog)
├── patches/             # Empty directory (skip)
├── prisma/              # DB schema + migrations - 12 files (inspect)
├── providers/           # React Query provider (1 file) (inspect)
├── public/              # Static assets - 14 files (skip)
├── scripts/             # Utility scripts (3 files) (catalog)
├── .env                 # Environment (gitignored) (skip)
├── .env.example         # Environment template (inspect)
├── .gitignore           # Git ignore rules (catalog)
├── ACCELERATOR_HUB_GUIDE.md  # Accelerator docs (catalog)
├── DUAL_MODEL_DOCUMENTATION_UPDATE.md  # Migration log (catalog)
├── README.md            # Project README (catalog)
├── RULES.md             # Coding standards & conventions (inspect)
├── TECH_STACK.md        # Tech stack reference (catalog)
├── UNUSED_DEPENDENCIES.md  # Dep audit (catalog)
├── biome.json           # Linter/formatter config (inspect)
├── components.json      # shadcn/ui config (inspect)
├── docker-compose.yml   # PostgreSQL container (inspect)
├── feedback.txt         # User feedback note (catalog)
├── mprocs.yaml          # Multi-process runner (inspect)
├── next-env.d.ts        # Next.js types (skip)
├── next.config.ts       # Next.js config (inspect)
├── package.json         # Dependencies + scripts (inspect)
├── pnpm-lock.yaml       # Lock file (skip)
├── pnpm-workspace.yaml  # pnpm allowed builds (inspect)
├── postcss.config.mjs   # PostCSS with Tailwind v4 (inspect)
├── prisma.config.ts     # Prisma ORM config (inspect)
├── proxy.ts             # Arcjet middleware (inspect)
├── tsconfig.json        # TypeScript config (inspect)
├── tsconfig.tsbuildinfo # Build info (skip)
└── types.d.ts           # Global type IResearchProgress (scan)
```

---

## 3. Entry Points

### HTTP (Next.js App Router - 52 pages + 63 API routes)

**Pages** (52 `page.tsx` files):

| Route | File | Description |
|---|---|---|
| `/` | `app/(marketing)/page.tsx` | Landing page |
| `/about` | `app/(marketing)/about/page.tsx` | About page |
| `/faq` | `app/(marketing)/faq/page.tsx` | FAQ page |
| `/how-it-works` | `app/(marketing)/how-it-works/page.tsx` | How it works |
| `/pricing` | `app/(marketing)/pricing/page.tsx` | Pricing page |
| `/privacy` | `app/(marketing)/privacy/page.tsx` | Privacy policy |
| `/terms` | `app/(marketing)/terms/page.tsx` | Terms of service |
| `/contact` | `app/(marketing)/contact/page.tsx` | Contact form |
| `/sign-in` | `app/(auth)/sign-in/page.tsx` | Sign in |
| `/sign-up` | `app/(auth)/sign-up/page.tsx` | Sign up |
| `/forgot-password` | `app/(auth)/forgot-password/page.tsx` | Forgot password |
| `/reset-password` | `app/(auth)/reset-password/page.tsx` | Reset password |
| `/verify-email` | `app/(auth)/verify-email/page.tsx` | Verify email |
| `/verify-email/[token]` | `app/(auth)/verify-email/[token]/page.tsx` | Verify with token |
| `/verify-email/resend` | `app/(auth)/verify-email/resend/page.tsx` | Resend verification |
| `/magic-link` | `app/(auth)/magic-link/page.tsx` | Magic link |
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | Main dashboard |
| `/ideas` | `app/(dashboard)/ideas/page.tsx` | Ideas list |
| `/ideas/new` | `app/(dashboard)/ideas/new/page.tsx` | New idea |
| `/ideas/[id]` | `app/(dashboard)/ideas/[id]/page.tsx` | Idea detail |
| `/ideas/archived` | `app/(dashboard)/ideas/archived/page.tsx` | Archived ideas |
| `/ideas/shared/[token]` | `app/(public)/ideas/shared/[token]/page.tsx` | Shared idea |
| `/startups` | `app/(dashboard)/startups/page.tsx` | Startups list |
| `/startups/new` | `app/(dashboard)/startups/new/page.tsx` | New startup |
| `/startups/[slug]` | `app/(startup)/startups/[slug]/page.tsx` | Startup dashboard |
| `/startups/[slug]/updates` | `app/(startup)/startups/[slug]/updates/page.tsx` | Weekly updates |
| `/startups/[slug]/updates/new` | `app/(startup)/startups/[slug]/updates/new/page.tsx` | New update |
| `/startups/[slug]/updates/[id]/edit` | `app/(startup)/startups/[slug]/updates/[id]/edit/page.tsx` | Edit update |
| `/startups/[slug]/metrics` | `app/(startup)/startups/[slug]/metrics/page.tsx` | Metrics dashboard |
| `/startups/[slug]/tasks` | `app/(startup)/startups/[slug]/tasks/page.tsx` | Task board |
| `/startups/[slug]/chat` | `app/(startup)/startups/[slug]/chat/page.tsx` | VC Coach chat |
| `/startups/[slug]/opportunities` | `app/(startup)/startups/[slug]/opportunities/page.tsx` | Opportunities board |
| `/startups/[slug]/profile` | `app/(startup)/startups/[slug]/profile/page.tsx` | Startup profile |
| `/startups/[slug]/settings` | `app/(startup)/startups/[slug]/settings/page.tsx` | Startup settings |
| `/startups/[slug]/research-feed` | `app/(startup)/startups/[slug]/research-feed/page.tsx` | Research feed |
| `/startups/[slug]/streaks` | `app/(startup)/startups/[slug]/streaks/page.tsx` | Streak tracking |
| `/startups/[slug]/applications` | `app/(startup)/startups/[slug]/applications/page.tsx` | Accelerator applications |
| `/startups/[slug]/cofounders` | `app/(startup)/startups/[slug]/cofounders/page.tsx` | Cofounders |
| `/startups/[slug]/school` | `app/(startup)/startups/[slug]/school/page.tsx` | School resources |
| `/chat` | `app/(dashboard)/chat/page.tsx` | Global chat |
| `/billing` | `app/(dashboard)/billing/page.tsx` | Billing/plans |
| `/settings` | `app/(dashboard)/settings/page.tsx` | User settings |
| `/onboarding` | `app/(dashboard)/onboarding/page.tsx` | VC Onboarding |
| `/my-accelerators` | `app/(dashboard)/my-accelerators/page.tsx` | My accelerators |
| `/admin` | `app/(dashboard)/admin/page.tsx` | Admin panel |
| `/admin/users` | `app/(dashboard)/admin/users/page.tsx` | User management |
| `/admin/accelerators/[slug]` | `app/(dashboard)/admin/accelerators/[slug]/page.tsx` | Admin accelerator |
| `/accelerators` | `app/(marketing)/accelerators/page.tsx` | Public accelerators |
| `/accelerators/new` | `app/(marketing)/accelerators/new/page.tsx` | New accelerator |
| `/accelerators/[slug]` | `app/(marketing)/accelerators/[slug]/page.tsx` | Accelerator detail |
| `/accelerators/[slug]/apply` | `app/(marketing)/accelerators/[slug]/apply/page.tsx` | Apply to accelerator |
| `/accelerator/admin` | `app/accelerator/admin/page.tsx` | Accelerator admin (no route group) |

**Layouts** (5 `layout.tsx` files): Root, (auth), (dashboard), (marketing), (startup)/[slug]

**Error boundaries**: Root `error.tsx`, root `not-found.tsx`

**No `loading.tsx` files anywhere.**

### API Routes (63 `route.ts` files)

| Category | Count | Key Routes (methods) |
|---|---|---|
| Auth | 8 | `[...all]` (GET/POST), custom sign-up, verify-email, forgot (POST/PUT) |
| Ideas | 8 | CRUD (GET/POST/DELETE/PATCH), export (POST), share, guide, prompt |
| Startups | 17 | CRUD, members, followers, updates, streak, chat, opportunities, research-feed |
| Accelerators | 13 | CRUD, cohorts, events, mentors, KPIs, reports, team, investor-profile, apply |
| Admin | 2 | Stats (GET), users (GET) |
| Billing | 1 | Subscription (GET) |
| Chat | 1 | General AI chat (POST) |
| Guide | 1 | Guide agent chat (POST) |
| Dashboard | 1 | Dashboard analytics (GET) |
| Goals | 1 | Goal update (PATCH) |
| Onboarding | 2 | Create (POST), status (GET) |
| Inngest | 2 | Serve (GET/POST/PUT), realtime token (GET) |
| Storage | 1 | Signed URL (POST) |
| Uploadthing | 1 | File upload handler (GET/POST) |
| User | 2 | Profile (GET/PATCH), entitlement (GET) |
| Users | 1 | Search (GET) |
| Analytics | 1 | Dashboard metrics (GET) |
| Assets | 1 | Delete (DELETE) |

### Background Jobs (Inngest - 16 functions, 11 registered)

| Function | File | Trigger | Description |
|---|---|---|---|
| research-pipeline | `lib/inngest/functions/research-pipeline.ts` | `idea.submitted` | Runs 6-agent sequential pipeline |
| auth-emails | `lib/inngest/functions/auth-emails.ts` | Event | Send verification/password reset emails |
| opportunity-discovery | `lib/inngest/functions/opportunity-discovery.ts` | Cron | Daily Tavily search for opportunities |
| re-evaluation | `lib/inngest/functions/re-evaluation.ts` | Cron | Monthly re-evaluation of stale ideas |
| startup-analysis | `lib/inngest/functions/startup-analysis.ts` | `update.submitted` | AI coach analysis after weekly update |
| startup-weekly-report | `lib/inngest/functions/startup-weekly-report.ts` | Cron (Monday) | Portfolio-wide weekly strategic report |
| startup-weekly-reminder | `lib/inngest/functions/startup-weekly-reminder.ts` | Cron | Weekly check-in reminders |
| weekly-digest | `lib/inngest/functions/weekly-digest.ts` | Cron | Digest emails to external followers |
| startup-feature-announcement | `lib/inngest/functions/startup-feature-announcement.ts` | Event | Feature announcements |
| startup-follower-notifications | `lib/inngest/functions/startup-follower-notifications.ts` | Event | Follower notifications |
| startup-weekly-report-v2 | `lib/inngest/functions/startup-weekly-report-v2.ts` | Cron | Enhanced weekly reporting |

6 crons + 5 event-driven = 11 registered functions. 5 additional function modules exist in the functions directory but are not registered in the Inngest client.

### Middleware / Proxy

| File | Description |
|---|---|
| `proxy.ts` | Arcjet Shield + bot detection middleware + auth redirect. Not a root `middleware.ts`. |

---

## 4. Configuration Inventory

| Purpose | Files | Key Settings |
|---|---|---|
| **Build** | `next.config.ts` | `reactCompiler: true`, `serverExternalPackages: ["pdfkit"]` |
| **Build** | `tsconfig.json` | Strict mode, `@/*` path alias, ES2017 target, bundler resolution |
| **Build** | `postcss.config.mjs` | `@tailwindcss/postcss` plugin |
| **Build** | `prisma.config.ts` | Prisma ORM v7 config |
| **Env** | `.env.example` | 43 variables across 9 categories |
| **CI/CD** | `.github/workflows/ci.yml` | pnpm 9, Node 20, prisma generate, lint, tsc, build |
| **Lint/Format** | `biome.json` | v2.2, recommended rules, Next + React domains, organizeImports on save |
| **UI** | `components.json` | shadcn/ui New York, neutral, RSC, lucide icons |
| **Editor** | `.vscode/settings.json` | VBNetCompanion extension (irrelevant) |
| **Deploy** | `docker-compose.yml` | PostgreSQL 15-alpine, port 5446 |
| **Process** | `mprocs.yaml` | Runs `next dev`, `inngest:start`, `ngrok:dev` |
| **JS** | `package.json` | 128 deps, 14 devDeps, scripts for dev/build/db |
| **Workspace** | `pnpm-workspace.yaml` | Allowed builds for prisma engines, msgpackr-extract, sharp |
| **Security** | `proxy.ts` | Arcjet Shield + bot detection + auth redirect |
| **Inngest** | `lib/inngest/client.ts` | Event key + signing key |

---

## 5. Module Dependency Map

### Core Infrastructure

```
Module: lib/db
  Depends on: @prisma/adapter-pg, @prisma/client, dotenv
  Used by: lib/auth, lib/agents/*, prisma/seed, all API routes

Module: lib/auth
  Depends on: lib/db, lib/inngest/client, @polar-sh/better-auth, better-auth, lib/polar/entitlements
  Used by: app/api/auth/[...all]

Module: lib/auth-client (browser)
  Depends on: better-auth/react, @polar-sh/better-auth/client
  Used by: hooks/index, components throughout

Module: lib/arcjet
  Depends on: @arcjet/next, @arcjet/ip, lib/auth
  Used by: various API routes

Module: lib/api-client
  Depends on: axios, config/axios.config
  Used by: hooks/index
```

### AI Layer

```
Module: lib/ai/models
  Depends on: @ai-sdk/google, ai
  Used by: lib/agents/*

Module: lib/ai/fallback
  Depends on: ai (generateObject, generateText)
  Used by: lib/agents/*

Module: lib/ai/tools
  Depends on: @tavily/core, ai, lib/ai/webfetch
  Used by: lib/agents/*

Module: lib/ai/webfetch
  Depends on: @tavily/core
  Used by: lib/ai/tools
```

### Agent Pipeline

```
Module: lib/agents/pipeline
  Depends on: lib/agents/interpreter, market-research, trend-analysis,
              execution-friction, deep-research, synthesis, lib/ai/models, lib/inngest/channels
  Used by: lib/inngest/functions/research-pipeline

Module: lib/agents/strategic-advisory
  Depends on: lib/ai/models, lib/ai/fallback
  Used by: lib/inngest/functions/startup-analysis

Module: lib/agents/guide
  Depends on: lib/ai/models, lib/ai/tools
  Used by: app/api/ideas/[id]/guide

Module: lib/agents/startup-coach (VC Coach)
  Depends on: lib/ai/models
  Used by: app/api/startups/[id]/chat

Module: lib/agents/hub-coach
  Depends on: lib/ai/models
  Used by: app/api/accelerators/[slug]/coach
```

### Inngest

```
Module: lib/inngest/client
  Depends on: inngest
  Used by: lib/auth, lib/inngest/functions/*, app/api/inngest

Module: lib/inngest/functions/*
  Depends on: lib/inngest/client, lib/inngest/channels, lib/db, lib/agents/*
  Used by: app/api/inngest (serve)
```

### API Routes → Core

```
All API routes in app/api/*
  Depends on: lib/db, lib/auth, lib/arcjet
  Also depends on domain-specific modules (agents, polar, email, etc.)
```

### Components → Hooks

```
components/* (client components)
  Depends on: hooks/index (React Query hooks)
  hooks/index depends on: lib/api-client, lib/auth-client
```

---

## 6. Domain Model

### Core Entities

```
User:
  - id: CUID, name, email (unique), username? (unique)
  - role: USER | ADMIN
  - accountStatus: ACTIVE | FROZEN | DELETED
  - relations: ideas[], sessions[], accounts[], entitlements[], auditLogs[], startups[]
  - source: prisma/schema.prisma:19-37

Idea:
  - id: CUID, userId (FK->User)
  - status: PENDING | PROCESSING | RESEARCHED | FAILED
  - title?, summary?, state? (Json), shareToken? (unique)
  - extractedUrls[] (String list)
  - relations: inputs[], researchJobs[], researchPackets[], scores[],
               researchLogs[], snapshots[], urlContents[], promptVersions[],
               guideConversations[], startup?
  - source: prisma/schema.prisma:102-131

Startup:
  - id: CUID, ideaId (unique FK->Idea), userId (FK->User)
  - slug (unique), name, stage (IDEA->VALIDATION->BUILDING->LAUNCHED->SCALING)
  - isLaunched, currentWeekNumber (default 1)
  - primaryMetricType (36 values), primaryMetricValue?
  - relations: weeklyUpdates[], metrics[], goals[], opportunities[],
               taskLists[], tasks[], members[], followers[], conversations[],
               streak?, mentorMatches[], cohortStartups[]
  - source: prisma/schema.prisma:249-280

Accelerator:
  - id: CUID, name, slug (unique), ownerId (FK->User)
  - isPublic (default true), isActive (default true)
  - relations: cohorts[], events[], applications[], members[],
               invitations[], kpis[], reports[], mentors[]
  - source: prisma/schema.prisma:408-430
```

### Key Enums

| Enum | Values | Source |
|---|---|---|
| `UserRole` | USER, ADMIN | :15 |
| `IdeaStatus` | PENDING, PROCESSING, RESEARCHED, FAILED | :89 |
| `ResearchAgentType` | INTERPRETER, MARKET_RESEARCH, TREND_ANALYSIS, EXECUTION_FRICTION, SYNTHESIS, DEEP_RESEARCH, STRATEGIC_ADVISORY | :93 |
| `StartupStage` | IDEA, VALIDATION, BUILDING, LAUNCHED, SCALING | :238 |
| `PrimaryMetricType` | MRR, ARR, DAU, MAU, RETENTION_RATE, CHURN_RATE, + 30 more | :202-234 |
| `TaskStatus` | TODO, IN_PROGRESS, BLOCKED, DONE | :390 |
| `OpportunityCategory` | FELLOWSHIP, SCHOLARSHIP, FUNDING, COMPETITION, ACCELERATOR, GRANT, MENTORSHIP, OTHER | :361 |
| `OpportunityStatus` | DISCOVERED, BOOKMARKED, TO_APPLY, APPLIED, INTERVIEWING, ACCEPTED, REJECTED | :367 |
| `AcceleratorRole` | OWNER, PROGRAM_MANAGER, OPERATIONS_LEAD, MENTOR, OBSERVER | :399 |
| `ResearchFeedType` | IDEA_RESEARCH, WEEKLY_REPORT, WEEKLY_DIGEST, WEEKLY_REMINDER | :483 |
| `EntitlementPlan` | FREE, PRO | :183 |
| `StartupMemberRole` | OWNER, ADMIN, MEMBER, VIEWER | :305 |

### Data Flow

```
User submits Idea (text/audio/image)
  -> IdeaInput created, status=PENDING
  -> Inngest event "idea.submitted" fires
  -> research-pipeline runs 6 agents sequentially:
      Interpreter -> MarketResearch -> TrendAnalysis ->
      ExecutionFriction -> DeepResearch -> Synthesis
  -> Each agent creates a ResearchPacket
  -> Scores stored in IdeaScore
  -> Idea status -> RESEARCHED
  -> StrategicAdvisory runs optionally for startup ideas

Idea -> conversion -> Startup profile
  -> Weekly updates tracked via WeeklyUpdate
  -> Update submission triggers AI Coach analysis
  -> Streak tracking via StartupStreak
  -> Task management via TaskList + Task (Kanban)
  -> Opportunity tracking via StartupOpportunity
  -> External followers receive weekly digest
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
| `better-auth` | ^1.4.10 | Authentication |
| `@polar-sh/better-auth` | ^1.6.3 | Billing auth plugin |
| `@polar-sh/sdk` | ^0.47.1 | Polar billing SDK |
| `@ai-sdk/google` | ^4.0.10 | Google Gemini AI SDK |
| `ai` | ^7.0.18 | Vercel AI SDK |
| `@tanstack/react-query` | ^5.90.16 | Server state management |
| `inngest` | ^4.11.0 | Background jobs |
| `@arcjet/next` | 1.0.0-beta.16 | Rate limiting/security |
| `@uploadthing/react` | ^7.3.3 | File uploads |
| `nodemailer` | ^7.0.12 | Email sending |
| `zod` | ^4.3.5 | Schema validation |
| `recharts` | 3.8.1 | Charts |
| `@dnd-kit/core` | ^6.3.1 | Drag and drop |
| `framer-motion` | ^12.24.10 | Animations |
| `tailwindcss` | ^4 | CSS framework |
| `nuqs` | ^2.8.6 | URL search params |
| `pdfkit` | ^0.17.2 | PDF generation |
| `@tavily/core` | ^0.6.4 | Web search |

### Dev Dependencies

| Package | Version | Purpose |
|---|---|---|
| `@biomejs/biome` | 2.2.0 | Linter/formatter |
| `typescript` | ^5 | Language |
| `prisma` | ^7.2.0 | ORM CLI |
| `@tailwindcss/postcss` | ^4 | PostCSS plugin |
| `babel-plugin-react-compiler` | 1.0.0 | React compiler Babel plugin |
| `vitest` | ^4.0.16 | Test runner (in deps, not devDeps) |

### Unused / Questionable

See `UNUSED_DEPENDENCIES.md` for full analysis. Notable:
- `@ai-sdk/xai`, `ai-sdk-ollama`, `@openrouter/ai-sdk-provider` - alternative AI providers, not integrated
- `@pinecone-database/pinecone` - vector search not wired
- `@react-pdf/renderer` - dual PDF lib; `pdfkit` is active
- `mprocs`, `list`, `streamdown`, `tokenlens` - dev utilities in production deps

---

## 8. Test Strategy

| Aspect | Detail |
|---|---|
| **Framework** | Vitest (in package.json) |
| **Location** | No test files found during exploration |
| **Naming convention** | Unknown |
| **Coverage targets** | None configured |
| **CI integration** | No test step in CI workflow (`ci.yml`) |
| **Test types** | Not determined |

---

## 9. Infrastructure Summary

| Aspect | Detail |
|---|---|
| **CI/CD** | GitHub Actions (push/PR to main) - lint, typecheck, build |
| **Deployment** | Vercel (inferred from framework + `@vercel/analytics`) |
| **Database** | PostgreSQL 15 via Docker (local dev), port 5446 |
| **Background Jobs** | Inngest Cloud (local dev via Inngest CLI) |
| **File Storage** | UploadThing |
| **Email** | Nodemailer + Gmail SMTP (Postmark/SendGrid adapter-ready) |
| **Monitoring** | Arcjet (security/rate limiting only) |
| **Analytics** | `@vercel/analytics` |
| **Assets** | `public/images/logo/` (header, footer, sticky, email, favicons, OG image) |
| **Fonts** | Nunito (local TTF in `public/fonts/`) |

---

## 10. Unknowns & Human Questions

1. **No tests found**: `vitest` is in deps but no `__tests__/` or `.test.ts` files were discovered.

2. **Model architecture**: Single model: Google Gemini 3.5 Flash (via @ai-sdk/google). See `lib/ai/models.ts` and `lib/ai/fallback.ts`. Triple-model fallback was a prior spec that was never implemented.

3. **Inngest function count**: 16 function files exist in `lib/inngest/functions/`, 11 are registered in the Inngest client. See `lib/inngest/client.ts` for registration.

4. **`.nvii/` directory**: Contains `nvii.json` with a project ID - purpose unclear.

5. **`feedback.txt`**: Unstructured user feedback about ads/competition - not actionable.

6. **No root `middleware.ts`**: Arcjet proxy in `proxy.ts` but not wired as Next.js middleware at root level.

7. **No `loading.tsx` files**: No loading states at any route level.

8. **Pinecone**: SDK in deps, variables in `.env.example`, but listed as unused.
