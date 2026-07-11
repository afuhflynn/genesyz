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
- Vercel AI SDK
- @ai-sdk/react
- @ai-sdk/google (Gemini 2.5 Flash)
- @ai-sdk/mistral (Mistral open-mixtral-8x7b)
- Dual-Model Architecture: Mistral primary, Gemini fallback for resilience

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

Build **Genesyz** — an AI-powered startup validation platform for founders.

Core goals:
- Capture ideas instantly
- Research ideas passively
- Surface actionable insights
- Reduce founder procrastination
- Respect privacy and IP

────────────────────────────────
CORE FEATURES (FULLY IMPLEMENT)
────────────────────────────────

### 1. Idea Capture
- Text input
- Voice notes (upload + transcription)
- Image upload (OCR + semantic extraction)
- Raw input stored permanently
- Structured interpretation stored separately

### 2. AI Research System (REAL, NOT MOCKED)
Implement a **multi-agent pipeline**, each as a TypeScript module:

- InterpreterAgent
- MarketResearchAgent
- TrendAnalysisAgent
- ExecutionFrictionAgent
- SynthesisAgent

Each agent must:
- Have strict input/output types
- Use Vercel AI SDK
- Return confidence metadata
- Log prompts + raw responses to DB

### 3. Inngest Orchestration
- Event: `idea.submitted`
- Step-based pipeline with retries
- Idempotent execution
- Realtime progress updates
- Scheduled weekly digest (cron)
- Scheduled re-evaluation jobs for ideas

### 4. Scoring System
- Idea clarity score
- Market readiness score
- Execution friction score
- Overall readiness score
- Scores must be explainable

### 5. UI Pages (ALL REQUIRED)
- Landing (credible, restrained)
- Auth (Better Auth)
- Dashboard (ideas + scores)
- Idea capture
- Idea detail (expandable research packets)
- Billing (Polar)
- Account / settings
- Admin panel

### 6. Billing & Entitlements (IMPORTANT)
- Use **Polar**
- Plans:
  - Free: 3 active ideas
  - Pro: unlimited
- Enforce limits **server-side**
- Middleware:
  `isAllowedToCreateIdea(userId)`
- Sync Polar entitlements with Better Auth users

### 7. Storage
- DigitalOcean Spaces for:
  - Audio
  - Images
  - PDF exports
- Signed URLs for secure access

### 8. Email
- Welcome email
- Weekly digest email
- Triggered via Inngest
- Templates must be clean and professional

### 9. Exports
- Export idea research packet as PDF
- Store PDF in Spaces
- Download via signed URL

### 10. Security & Privacy
- Strict tenant isolation
- No cross-user access
- No training on user data without opt-in
- Audit logs for research runs

────────────────────────────────
DATABASE REQUIREMENTS
────────────────────────────────

Must include tables for:
- users (via Better Auth)
- ideas
- idea_inputs (raw)
- research_jobs
- research_packets
- idea_scores
- idea_research_logs (prompts + outputs)
- entitlements (from Polar)
- audit_logs

────────────────────────────────
DELIVERABLES (MUST OUTPUT)
────────────────────────────────

1. Full project file tree
2. `docker-compose.yml`
3. `package.json` (pnpm)
4. `pnpm-lock.yaml`
5. Prisma schema + migrations
6. Next.js config files
7. Inngest event + cron functions
8. AI agent modules
9. UI pages (TSX)
10. DO Spaces upload logic
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
- User signs up via Google
- User subscribes via Polar
- Idea submission triggers research pipeline
- Scores + packets appear in UI
- Weekly digest cron runs
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
