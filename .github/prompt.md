You are a senior full-stack engineer, product designer, and platform architect building a REAL startup product.

This is NOT a scaffold, NOT a demo, and NOT a boilerplate.
This must be a **fully functional, scalable, production-ready full-stack application**.

If you cannot fully implement a feature, mark it clearly with TODO + official docs link.
Do NOT invent APIs.
Do NOT output marketing fluff.
Do NOT generate ugly or generic UI.

────────────────────────────────
GLOBAL NON-NEGOTIABLE RULES
────────────────────────────────

1. Package management
   - Use **pnpm ONLY**
   - No npm
   - No yarn
   - Include `pnpm-lock.yaml`
   - All scripts must use pnpm

2. Framework
   - Use the **latest stable Next.js** (App Router)
   - Follow official Next.js best practices
   - Server Components by default
   - Client Components only when required

3. Language & quality
   - TypeScript everywhere
   - Strict mode enabled
   - No `any` unless justified in comments

4. UI / UX quality (CRITICAL)
   - The UI must look **human-designed**, professional, and calm
   - No generic AI layouts
   - No excessive gradients
   - No meaningless animations
   - Strong typography, spacing, and hierarchy
   - Looks like a serious SaaS product founders would trust

5. Animations
   - Use **Framer Motion**
   - Animations must be subtle and purposeful:
     - Page transitions
     - Expanding/collapsing research packets
     - Loading/progress states
     - Hover feedback
   - No constant motion
   - No gimmicks

6. “No AI slop” rule
   - No buzzwords
   - No filler copy
   - No fake confidence
   - Every feature must exist for a clear product reason

────────────────────────────────
TECH STACK (DO NOT DEVIATE)
────────────────────────────────

Frontend
- Next.js (latest)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion

Backend / Platform
- Next.js server actions & route handlers
- Node.js
- Prisma ORM
- PostgreSQL
- Docker Compose (local dev)

Auth
- **Better Auth**
- Google OAuth
- Better Auth must be the source of truth for users

Billing / Payments
- **Polar** (subscriptions + entitlements)
- Polar must be integrated with Better Auth
- Server-side entitlement enforcement (NO client checks)

AI
- Vercel AI SDK v7
- @ai-sdk/react
- @ai-sdk/google (Gemini 3.5 Flash)
- Single-model architecture: Gemini 3.5 Flash with text-only fallback for schema errors
- Note: @ai-sdk/mistral, @ai-sdk/openai, and @ai-sdk/xai packages exist but are not wired

Background & Realtime
- **Inngest**
- Event-driven jobs
- Realtime updates
- Scheduled functions / cron:
  https://www.inngest.com/docs/guides/scheduled-functions

Storage
- **DigitalOcean Spaces** (S3-compatible)
- Local `/storage` fallback for dev

Email
- Nodemailer
- Adapter-ready for Postmark / SendGrid

Vector Search
- Pinecone OR Supabase Vector (abstracted adapter)

Package Manager
- pnpm ONLY

────────────────────────────────
PRODUCT DEFINITION
────────────────────────────────

Build **Genesyz** — the AI-powered Startup Operating System for founders.

Core goals:
- Validate ideas instantly with a 6-agent AI research pipeline
- Track execution with weekly updates, AI coaching, Kanban tasks, and streak gamification
- Manage accelerator/incubator programs with cohorts, events, mentors, and KPIs
- Discover funding opportunities and portfolio intelligence
- Collaborate with your team and share progress with followers

────────────────────────────────
CORE FEATURES (FULLY IMPLEMENT)
────────────────────────────────

### 1. Idea Validation (6-Agent AI Pipeline)
- Text input (primary)
- Voice notes (upload + transcription) — *Coming Soon*
- Image upload (OCR + semantic extraction) — *Coming Soon*
- Six-agent pipeline: Interpreter → Market Research → Trend Analysis → Execution Friction → Deep Research → Synthesis
- Real-time progress streaming via Inngest Realtime
- Per-idea Guide Agent for follow-up Q&A
- Prompt editing with smart re-research
- URL auto-extraction and scraping
- Location-aware market sizing (TAM/SAM/SOM, dual-currency)

### 2. Startup Execution Tracker
- Convert validated ideas into startup profiles with stage lifecycle
- Weekly check-ins with AI-powered analysis (ON_TRACK / NEEDS_ATTENTION / AT_RISK)
- 34+ metric types across 6 categories
- Streak gamification with milestone rewards
- Kanban task boards (TODO / IN_PROGRESS / BLOCKED / DONE)
- Unlimited goals with priority levels
- Metrics dashboards with charts
- Per-startup AI Coach (VC perspective)

### 3. Team Collaboration
- 4 roles: OWNER, ADMIN, MEMBER, VIEWER
- Team management with search/invite
- External followers with weekly digest emails
- Audit logging

### 4. Opportunities Board
- AI-discovered opportunities (daily cron via Tavily)
- 7 categories: Fellowship, Scholarship, Funding, Competition, Accelerator, Grant, Mentorship
- 7-stage pipeline: DISCOVERED → BOOKMARKED → TO_APPLY → APPLIED → INTERVIEWING → ACCEPTED / REJECTED
- Automated deduplication

### 5. Accelerator Program Manager
- Program lifecycle with public/private visibility
- Cohort management with onboarding flows
- Event scheduling (workshop, mentor_session, office_hours, networking, demo_day)
- Mentor management with expertise tagging and matching
- KPI tracking with progress bars and deadlines
- Weekly manager reports with AI summaries
- AI Hub Coach for cohort-wide health analysis
- Investor one-pager auto-generation (PDF)
- Application system with status tracking
- RBAC: 5 roles (OWNER / PROGRAM_MANAGER / OPERATIONS_LEAD / MENTOR / OBSERVER)

### 6. Portfolio Intelligence
- Strategic Advisory Agent: portfolio-level Go/Pause/Kill verdicts
- Weekly strategic reports (Monday cron)
- Monthly re-evaluation of ideas older than 30 days
- Research feed: idea research, weekly reports, digests, reminders

### 7. Inngest Orchestration (16 functions, 11 registered)
- 5 cron jobs: strategic report, startup report, reminders, opportunity discovery, monthly re-evaluation, feature announcements
- 9 event-driven: research pipeline, weekly reports, emails, startup analysis, notifications
- Real-time progress streaming

### 8. Billing & Entitlements
- Polar subscriptions
- Free: 3 active ideas
- Pro ($20/month): unlimited
- Server-side enforcement

### 9. Storage & Exports
- UploadThing for file storage
- PDF exports of idea research packets (react-pdf)
- DigitalOcean Spaces (S3-compatible) configured

### 10. Security & Privacy
- Strict tenant isolation
- Server-side entitlement enforcement
- No cross-user access

────────────────────────────────
DATABASE REQUIREMENTS
────────────────────────────────

Must include tables for (see Prisma schema for full details):
- users, accounts, sessions, verifications (Better Auth)
- ideas, idea_inputs, research_packets, idea_scores
- startups, startup_members, startup_followers
- weekly_updates, weekly_update_metrics, weekly_update_goals
- streak_milestones
- tasks, task_comments
- opportunities, opportunity_applications
- accelerator_programs, cohorts, cohort_applications
- events, rsvps
- mentors, mentor_startups
- kpis, kpi_progress
- reports
- research_logs
- audit_logs
- entitlements (Polar)

────────────────────────────────
DELIVERABLES (MUST OUTPUT)
────────────────────────────────

1. Full project file tree
2. `docker-compose.yml`
3. `package.json` (pnpm)
4. `pnpm-lock.yaml`
5. Prisma schema + migrations
6. Next.js config files
7. Inngest event + cron functions (16 total, 11 registered)
8. AI agent modules (6 agents)
9. UI pages for all products (marketing, dashboard, startup, accelerator)
10. UploadThing + DigitalOcean Spaces config
11. Polar integration
12. Better Auth integration
13. Middleware for plan enforcement
14. `.env.example`
15. GitHub Actions CI
16. README with real setup steps

────────────────────────────────
ACCEPTANCE CRITERIA
────────────────────────────────

- `pnpm install` works
- `docker-compose up` starts DB
- `pnpm dev` runs app
- User signs up via Google or email/password
- User subscribes via Polar
- Idea submission triggers 6-agent research pipeline with real-time progress
- Scores + packets appear in UI
- User can convert idea to startup and track execution
- Weekly update cron runs with AI analysis
- Accelerator programs can be created and managed
- UI looks intentional and professional

────────────────────────────────
FINAL INSTRUCTION
────────────────────────────────

This is a real product.
Build it like you’d maintain it for 3 years.
If something is ugly, redesign it.
If something is fragile, harden it.
If something is unclear, document it.

Generate the full application now.
