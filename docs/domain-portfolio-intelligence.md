# Portfolio Intelligence

## Overview

Portfolio Intelligence provides strategic oversight across a founder's entire idea portfolio. It combines an AI-powered Strategic Advisory agent, weekly strategic reports, monthly re-evaluation of stale ideas, and a research feed for per-startup insights.

## Strategic Advisory Agent

### Purpose
Portfolio-level Chief of Staff that analyzes all of a founder's ideas, gathers real-time market intelligence, and produces a structured weekly advisory report.

### Two-Phase Architecture

**Phase 1 — Market Pulse Research**
- Receives portfolio summary (all ideas with metrics and history)
- Uses Tavily web search tools (max 5 steps)
- Fetches industry news for all categories in the portfolio

**Phase 2 — Structured Report Generation**
- Synthesizes portfolio data + market intelligence + tool results
- Produces comprehensive weekly strategic report

### Operating Principles
1. **Judgment over analysis** — Opinionated and decisive
2. **Decision-first** — Every idea gets Go/Pause/Kill
3. **Structured risk** — Categorizes risk as Market/Product/Financial/Team
4. **Action-oriented** — One priority per week + one thing to stop doing
5. **Delta detection** — Compares current vs historical snapshots
6. **Brain-drilling** — 3-5 high-pressure questions to challenge assumptions
7. **Prioritization** — One primary focus (50-80% allocation), others ≤20%
8. **Measurable outcomes** — Quantifiable success criteria
9. **Kill criteria** — Explicit, timeboxed conditions for abandoning ideas

### Output Schema
- `executiveSummary` — 2-3 sentence portfolio status
- `portfolioThemes` — 3-5 key themes across portfolio
- `marketPulse` — 3-5 market observations
- `verdicts` — Go/Pause/Kill per idea
- `primaryFocus` — Main focus with time allocation (0-100%)
- `brainDrillingQuestions` — 3-5 tough questions
- `vcSentiment` — VC sentiment assessment
- `investmentPotential` — High/Medium/Low
- `weeklyFocus` — One priority action
- `topRisks` — 3 biggest risks
- `failureReasons` — 3-5 failure reasons to watch

## Weekly Strategic Report

### Schedule
Every Monday at 09:00 UTC via Inngest cron (`weekly-strategic-report`).

### Process
1. Fetch all users with researched, non-archived ideas
2. For each user:
   - Run Strategic Advisory Agent on their portfolio
   - Save verdict snapshots with delta calculations
   - Send strategic report email
   - Create research feed items (WEEKLY_DIGEST)
3. Log summary to audit log

### Idea Snapshots
- Periodic state captures per idea
- Track: state, verdict, deltas (verdict changes, priority changes, new risks, metric changes)
- Used for trend detection in strategic analysis

## Monthly Re-evaluation

### Schedule
First day of every month at 00:00 UTC via Inngest cron (`monthly-reevaluation`).

### Process
1. Find ideas that are: not archived, status RESEARCHED, researched >30 days ago
2. Limit 50 ideas per batch
3. Re-trigger research pipeline for each eligible idea

## Research Feed

Per-startup aggregated timeline:
- `IDEA_RESEARCH` — Initial validation research
- `WEEKLY_REPORT` — AI analysis reports (one per week)
- `WEEKLY_DIGEST` — Strategic portfolio digests (weekly)
- `WEEKLY_REMINDER` — Update reminder notifications (Friday/Saturday)

**Route**: `/startups/[slug]/research-feed`
**API**: `GET /api/startups/[id]/research-feed` (paginated, filterable by type and date range)

## Data Model

Key models:
- `IdeaSnapshot` — Periodic state captures with verdict, state, deltas
- `ResearchFeedItem` — Feed entries with type, title, summary, content (idempotency key for deduplication)
