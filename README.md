# Genesyz - Startup Operating System

Genesyz is an AI-powered platform that takes founders from raw idea → validated concept → active startup → scaled business. It combines multi-agent AI research, execution tracking, team collaboration, opportunity discovery, and accelerator program management into a single operating system.

## Features

### AI-Powered Idea Validation
- **Multi-modal input**: Submit ideas via text, voice recording (auto-transcribed), or images (OCR-extracted)
- **6-agent research pipeline** running sequentially with real-time progress streaming:
  - **Interpreter** - Structures vague input into title/summary/problem/solution; detects URLs and locations
  - **Market Research** - Analyzes TAM/SAM/SOM (dual-currency: USD + local), competitors, trends, barriers
  - **Trend Analysis** - Timing verdict (too-early / right-time / late / too-late), tech readiness score
  - **Execution Friction** - Technical complexity, resource estimates, risk factors, quick wins
  - **Deep Research** - Tavily web search for market gaps, 3-phase roadmap, pivot options, strategic moat
  - **Synthesis** - Final scores (0-100) and verdict (pursue-immediately / needs-more-research / not-recommended)
- **AI model**: Google Gemini 3.5 Flash (single model with text-only fallback for schema errors)
- **Smart re-research**: AI determines if prompt edits are "major" or "minor" to avoid unnecessary reruns
- **Prompt version control**: Full edit history with timestamps and triggered-research tracking
- **Auto-location detection**: Extracts location mentions from text for localized market sizing
- **Auto-URL extraction**: Scrapes and stores referenced URLs for research context
- **PDF export**: Server-generated research reports
- **Public sharing**: Permanent share links with nanoid tokens
- **Per-idea Guide Agent**: Multi-session conversational AI that answers questions about research results

### Startup Execution Tracker
- **Startup profiles**: Convert validated ideas into full startup profiles with slug, stage lifecycle, location
- **Weekly check-ins**: Track user conversations, primary metrics (34 types across 6 categories), up to 5 additional metrics, goals, morale (1-10)
- **Pre-launch vs post-launch branching**: Pre-launch tracks user conversations only; post-launch unlocks full metric catalog
- **AI Coach analysis**: Per-update verdicts (ON_TRACK / NEEDS_ATTENTION / AT_RISK) with positives, concerns, blind spots, trajectory, recommendations
- **Streak gamification**: Milestones at 4/8/12/16/20/24/52 weeks with flame emojis and at-risk warnings
- **3-day edit window**: Updates editable for 3 days, then locked
- **Kanban task boards**: Drag-and-drop (via @dnd-kit), 4 status columns, inline editing, deadlines
- **Goals**: Unlimited goals with Top 3 priority, weekly goal review loop
- **Metrics dashboards**: Recharts area/line charts for primary + additional metrics over time
- **VC Coach**: Per-startup AI chat with full data access, session management, reasoning trace extraction

### Team Collaboration
- **4 roles**: OWNER, ADMIN, MEMBER, VIEWER with 7 granular permissions
- **Team management**: Search and invite users, change roles, remove members
- **External followers**: Email-based investors/mentors who receive weekly update digests
- **Audit logging**: All member and follower changes recorded

### Opportunities Board
- **AI-discovered opportunities**: Daily automated discovery via Tavily web search
- **7 categories**: Fellowship, Scholarship, Funding, Competition, Accelerator, Grant, Mentorship
- **7-stage Kanban pipeline**: DISCOVERED → BOOKMARKED → TO_APPLY → APPLIED → INTERVIEWING → ACCEPTED / REJECTED
- **Automated deduplication**: Prevents duplicate opportunities across runs

### Accelerator Hub
- **Program management**: Create and manage accelerator/incubator programs with public/private visibility
- **Cohort lifecycle**: Define cohorts with start/end dates, onboard startups via search, track morale
- **Event scheduling**: 5 event types (workshop, mentor_session, office_hours, networking, demo_day) with RSVP tracking
- **Mentor management**: Expertise tagging, mentor-startup matching with focus areas, searchable directory
- **KPI tracking**: Per-program KPIs with inline editing, progress bars, deadline tracking
- **Weekly reports**: Manager-submitted progress summaries with AI-generated summaries
- **AI Hub Coach**: Cohort-wide health analysis - pattern detection, at-risk identification, KPI forecasting
- **Investor one-pagers**: Auto-generated profiles combining founder data, metrics, and AI insights (print-to-PDF)
- **Application system**: Accept and manage startup applications with status tracking
- **RBAC**: 5 roles (OWNER / PROGRAM_MANAGER / OPERATIONS_LEAD / MENTOR / OBSERVER) with 10 permissions

### Portfolio Intelligence
- **Strategic Advisory Agent**: Portfolio-level Go/Pause/Kill verdicts with brain-drilling questions and kill criteria
- **Weekly strategic reports**: Monday cron sends portfolio-wide AI analysis via email
- **Monthly re-evaluation**: Auto-reruns research on ideas older than 30 days
- **Research feed**: 4 types of per-startup content (IDEA_RESEARCH, WEEKLY_REPORT, WEEKLY_DIGEST, WEEKLY_REMINDER)

### Billing
- **Free plan**: 3 active ideas
- **Pro plan**: Unlimited ideas ($20/month)
- **Server-side entitlement enforcement** via Polar + Better Auth plugin
- **Usage tracking**: Active idea count, plan status, period management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Database** | PostgreSQL 15 (via Docker Compose, port 5446) |
| **ORM** | Prisma 7 |
| **Auth** | Better Auth (email/password, Google OAuth, Magic Link) |
| **AI** | Vercel AI SDK v7 - Gemini 3.5 Flash (single model) |
| **Background Jobs** | Inngest (16 functions: 6 crons, 10 event-driven) |
| **Rate Limiting** | Arcjet |
| **File Storage** | UploadThing |
| **Billing** | Polar (via @polar-sh/better-auth plugin) |
| **Styling** | Tailwind CSS v4 + shadcn/ui (New York) |
| **Charts** | Recharts |
| **Drag & Drop** | @dnd-kit |
| **Forms** | React Hook Form + Zod |
| **State** | TanStack React Query v5 |
| **URL State** | nuqs |
| **Animations** | Framer Motion |
| **Email** | Nodemailer (Gmail SMTP, adapter-ready for Postmark/SendGrid) |
| **Web Search** | Tavily |
| **Linting** | Biome |

## Project Structure

```
├── app/                    # Next.js App Router pages & API routes
│   ├── (auth)/           # Sign-in, sign-up, password reset, magic link
│   ├── (dashboard)/      # Dashboard, ideas, startups, billing, settings, admin
│   ├── (marketing)/      # Landing page, pricing, FAQ, about, public accelerators
│   ├── (public)/         # Shared idea pages
│   ├── (startup)/        # Startup-specific routes (updates, metrics, chat, tasks)
│   └── api/              # 62 API endpoints (auth, ideas, startups, accelerators, etc.)
├── components/            # React components (~145 files)
│   ├── ui/              # shadcn/ui primitives
│   ├── ai-elements/     # AI SDK component primitives
│   ├── ideas/           # Idea submission, list, detail, assets
│   ├── startups/        # Weekly updates, task board, team, followers, VC Coach
│   ├── accelerators/    # Cohorts, events, mentors, KPIs, hub coach, one-pagers
│   ├── marketing/       # Landing page sections
│   ├── layout/          # Navigation, sidebars, headers
│   ├── chat/            # General AI chat interface
│   ├── guide/           # Research guide agent chat
│   ├── onboarding/      # VC Onboarding wizard
│   └── location/        # Geographic location selector
├── lib/                   # Core libraries
│   ├── agents/          # 10 AI agents (6 pipeline + Guide, Startup Coach, Hub Coach, Strategic Advisory)
│   ├── ai/              # Model definitions, fallback mechanism, tools (Tavily), webfetch
│   ├── inngest/         # 16 Inngest functions
│   ├── email/           # Email templates (welcome, verification, research complete, weekly digest)
│   ├── location/        # Location detection and research context builder
│   ├── opportunities/   # Opportunity discovery and generation
│   ├── scraping/        # URL extraction and content scraping
│   ├── polar/           # Polar billing SDK and plan definitions
│   └── utils/           # Date formatting, general utilities
├── prisma/                # Database schema (45 models, 17 enums)
├── hooks/                 # Custom React hooks
├── providers/             # React providers (TanStack Query)
├── config/                # Axios client configuration
└── scripts/               # Utility scripts (accelerator bootstrap, URL repair)
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Docker (for local database)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/afuhflynn/genesyz.git
   cd genesyz
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Fill in required values (see `.env.example` for descriptions).

4. **Start the database**:
   ```bash
   docker-compose up -d
   ```

5. **Initialize the database**:
   ```bash
   pnpm db:push
   ```

6. **Start development** (single command runs all services):
   ```bash
   pnpm dev:all    # Runs: next dev + inngest:start + ngrok via mprocs
   ```
   Or run individually:
   ```bash
   pnpm dev             # Next.js dev server
   pnpm inngest:start   # Inngest dev server (separate terminal)
   ```

### Quick Start (Onboarding)

1. Open `http://localhost:3000`
2. Create an account or sign in with Google
3. Submit your startup idea via text, voice, or image
4. Watch the AI research pipeline process your idea in real-time
5. Review scores, market data, and verdict
6. Convert your validated idea into a startup profile
7. Start tracking weekly progress with AI coaching

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Full production build (prisma generate + next build) |
| `pnpm dev:all` | Run all services via mprocs |
| `pnpm lint` | Biome linting |
| `pnpm format` | Biome auto-formatting |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:seed` | Seed database |
| `pnpm db:up` | Start Docker PostgreSQL |
| `pnpm db:down` | Stop Docker PostgreSQL |
| `pnpm bootstrap:accelerator` | Bootstrap accelerator program |

## Documentation

See the `docs/` directory for detailed documentation:

- `docs/domain-startup-tracker.md` - Startup execution tracker
- `docs/domain-accelerator-hub.md` - Accelerator program management
- `docs/domain-opportunities.md` - Opportunities board
- `docs/domain-portfolio-intelligence.md` - Portfolio advisory
- `docs/api-reference.md` - All 62 API endpoints
- `docs/architecture.md` - Agent pipeline, Inngest flow, DB schema, RBAC
- `TECH_STACK.md` - Corrected tech stack details
