# IdeasVault

IdeasVault is an AI-powered platform that helps founders validate their startup ideas instantly and execute them with confidence. Using a multi-agent AI pipeline, it conducts deep market research, analyzes trends, assesses execution risks, and provides comprehensive validation reports—empowering founders to make data-driven decisions before building.

## Features

### 🔬 AI-Powered Idea Validation
- **Instant Validation**: Submit an idea (text, voice, or image) and get a comprehensive report in minutes
- **Multi-Agent Research Pipeline**:
  - **Interpreter**: Understands vague ideas and extracts core concepts
  - **Market Research**: Analyzes TAM, SAM, SOM, competitors, and growth rates
  - **Trend Analysis**: Evaluates "Why now?" and technology readiness
  - **Execution Friction**: Identifies technical and operational risks
  - **Deep Research**: Uses web search to validate market gaps and feasibility
  - **Synthesis**: Combines all data into actionable scores and verdicts
- **Dual-Model AI Architecture**:
  - Primary: Mistral `open-mixtral-8x7b` (cost-efficient for high-volume)
  - Fallback: Google Gemini 2.5 Flash (automatic failover on resilience)
- **Dual Currency Display**: Market data shown in both USD and local currency
- **Confidence Indicators**: Clear标记 for estimated vs. verified data

### 📊 Startup Execution Tracker
- **Weekly Progress Updates**: Track your startup journey week over week
- **Goals with Priorities**: Set unlimited goals with clear Top 3 focus areas
- **Visual Metrics Dashboard**: Interactive charts showing metric trends over time
- **Editable Updates**: 3-day window to edit submissions for accuracy
- **Morale Tracking**: Monitor founder wellbeing alongside progress

### 💡 Opportunities Discovery
- **Opportunity Tracking**: Find and track fellowships, scholarships, funding programs, and pitch competitions
- **Application Kanban**: Drag-and-drop board to manage applications (To Apply → Applied → Interviewing → Accepted/Rejected)
- **AI-Powered Recommendations**: Auto-generated opportunities based on your startup industry

### 🚀 Accelerator Programs
- **Create Programs**: Build custom accelerator programs with detailed requirements and benefits
- **Cohort Management**: Organize startups into cohorts with defined timelines
- **Event Planning**: Schedule office hours, mentorship sessions, and demo days
- **Application System**: Accept and manage startup applications

### 💳 Billing & Monetization
- **Free & Pro Plans**: Flexible tiers managed via Polar
- **Usage-Based Entitlements**: Pay for what you use

### 📄 Export & Notifications
- **PDF Export**: Download professional research reports
- **Email Notifications**: Get notified when research completes

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (with Prisma ORM)
- **Auth**: Better Auth (Google OAuth)
- **AI**: Dual-Model Architecture
  - Primary: Mistral `open-mixtral-8x7b` (cost-effective, high-volume)
  - Fallback: Google Gemini 2.5 Flash (resilience, edge cases)
  - Via Vercel AI SDK (@ai-sdk/mistral, @ai-sdk/google)
- **Background Jobs**: Inngest
- **Styling**: Tailwind CSS + shadcn/ui
- **Storage**: DigitalOcean Spaces (S3 compatible)
- **Charts**: Recharts
- **Drag & Drop**: @dnd-kit

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Docker (for local database)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/afuhflynn/ideas-vault.git
   cd ideas-vault
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Set up environment variables**:

   Copy `.env.example` to `.env` and fill in the required values.

   ```bash
   cp .env.example .env
   ```

4. **Start the database**:

   ```bash
   docker-compose up -d
   ```

5. **Initialize the database**:

   ```bash
   pnpm prisma db push
   ```

6. **Start the development server**:

   ```bash
   pnpm dev
   ```

7. **Start Inngest dev server** (in a separate terminal):

   ```bash
   pnpm inngest:start
   ```

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (auth)/           # Authentication pages
│   ├── (dashboard)/      # User dashboard pages
│   ├── (marketing)/       # Marketing pages
│   ├── (startup)/         # Startup management pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── idea/             # Idea-related components
│   ├── startups/          # Startup components
│   └── accelerators/     # Accelerator components
├── hooks/                # Custom React hooks
├── lib/                  # Core libraries
│   ├── agents/           # AI agent implementations
│   ├── db/               # Database utilities
│   ├── email/            # Email templates
│   ├── inngest/          # Background job functions
│   └── location/         # Location detection
├── prisma/               # Database schema
└── public/               # Static assets
```

## Environment Variables

Required environment variables (see `.env.example`):

- Database connection string
- Authentication secrets
- AI API keys (Mistral, Google)
- Storage credentials
- Payment integration (Polar)
