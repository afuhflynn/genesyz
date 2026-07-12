# Opportunities Board

## Overview

The Opportunities Board automatically discovers and tracks funding, fellowship, scholarship, competition, accelerator, grant, and mentorship opportunities for startups. It combines AI-powered web search with a Kanban-style pipeline for managing applications.

## Opportunity Categories

| Category | Description |
|----------|-------------|
| FELLOWSHIP | Founder/startup fellowship programs |
| SCHOLARSHIP | Educational scholarships |
| FUNDING | Investment/grant funding opportunities |
| COMPETITION | Pitch competitions and hackathons |
| ACCELERATOR | Accelerator program applications |
| GRANT | Government and foundation grants |
| MENTORSHIP | Mentorship programs |
| OTHER | Uncategorized opportunities |

## Pipeline Statuses

```
DISCOVERED → BOOKMARKED → TO_APPLY → APPLIED → INTERVIEWING → ACCEPTED
                                                               → REJECTED
```

- **DISCOVERED**: Auto-discovered by AI, awaiting review
- **BOOKMARKED**: Saved for later consideration
- **TO_APPLY**: Planning to submit application
- **APPLIED**: Application submitted
- **INTERVIEWING**: In interview/due diligence process
- **ACCEPTED**: Accepted into program
- **REJECTED**: Application rejected

## Automated Discovery

### Schedule
Daily cron at 06:00 UTC via Inngest (`startup-opportunity-discovery-daily`).

### Process
1. Fetch all active startups with industry, stage, description, and idea summary
2. For each startup, call `generateStartupOpportunities()` via AI (Tavily web search)
3. Filter results through `isTrackableOpportunity()` validation
4. Deduplicate against existing opportunities (by title + URL)
5. Insert up to 10 new opportunities per startup per run
6. Log summary metrics to audit log

### Opportunity Fields
- title, description, URL, category
- eligibility criteria, benefits description
- application deadline
- source: `manual` or `ai_generated`
- notes (user-editable)

## Manual Entry

Users can create opportunities manually via the UI:
- Title, URL, category, description, eligibility, benefits, deadline
- Status defaults to DISCOVERED

## User Interface

**Route**: `/startups/[slug]/opportunities`

- Filterable list by category and status
- AI auto-generation button
- Per-opportunity edit, delete, status change
- Tab-based Kanban view by status

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/startups/[id]/opportunities` | List with category/status filters |
| POST | `/api/startups/[id]/opportunities` | Create manual opportunity |
| PATCH | `/api/startups/[id]/opportunities` | Update status/notes/fields |
| POST | `/api/startups/[id]/opportunities/generate` | AI-generate opportunities |

## Data Model

Model: `StartupOpportunity` (`startup_opportunities` table)
- Linked to startup, with title, description, URL, category, status
- Tracks eligibility, benefits, deadline, notes, source
- Indexes on startupId, status, category
