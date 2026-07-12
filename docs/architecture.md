# Architecture

## 1. AI Agent Pipeline

```
                    Founder Input (text / audio / image)
                               │
                               ▼
                    ┌───────────────────┐
                    │    INTERPRETER    │  Step 1
                    │  (structure idea, │  Extracts URLs, detects location,
                    │   change detect)  │  compares vs existing interpretation
                    └─────────┬─────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                    │
          ▼                   ▼                    ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ MARKET RESEARCH  │ │ TREND ANALYSIS  │ │ EXECUTION       │
│ Step 2           │ │ Step 3          │ │ FRICTION        │
│ • TAM/SAM/SOM    │ │ • Timing verdict│ │ Step 4          │
│ • Competitors    │ │ • Tech readiness│ │ • Tech complexity│
│ • Trends/barriers│ │ • Regulatory    │ │ • Risk factors  │
│ • Dual-currency  │ │   & social      │ │ • Quick wins    │
└────────┬─────────┘ └────────┬────────┘ └────────┬────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │   DEEP RESEARCH   │  Step 5
                    │  (Tavily web      │  Two-phase: research
                    │   search + synth) │  then synthesize
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │    SYNTHESIS      │  Step 6
                    │ (final scores +   │  Combines all 4 prior
                    │  verdict)         │  agents' outputs
                    └─────────┬─────────┘
                              │
                              ▼
              ┌───────────────────────────┐
              │ Save scores + research    │
              │ packets + update idea     │
              │ status → RESEARCHED       │
              └───────────────────────────┘

Post-Pipeline Conversational Agents (operate on stored research):

┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│    GUIDE     │  │ STARTUP      │  │  HUB COACH   │  │  STRATEGIC       │
│ (Idea-level  │  │ COACH        │  │ (Cohort-wide │  │  ADVISORY        │
│  research QA)│  │ (Per-update  │  │  health for  │  │  (Portfolio-level│
│              │  │  analysis)   │  │  managers)   │  │  Go/Pause/Kill)  │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────────┘
```

### Fallback Architecture

```
generateObjectWithFallback<T>(prompt, schema):
  1. Try generateObject() with Gemini 2.5 Flash
     ├─ Success → return parsed + validated object
     └─ Schema complexity error → fall back to generateText
        ├─ generateText with JSON instruction
        ├─ safeJsonParse() - multi-strategy JSON extraction
        │  ├─ direct JSON.parse
        │  ├─ markdown code block extraction
        │  ├─ regex {…} or […] extraction
        │  ├─ auto-fix (trailing commas, single quotes)
        │  └─ Zod validation at each step
        └─ Success → return mock GenerateObjectResult
  2. All attempts failed → throw error
```

## 2. Inngest Event Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                         EVENT-DRIVEN                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  idea.submitted ──→ research-pipeline ──→ idea.research.completed
│       │                  │                         │
│       │            ┌─────┴──────┐                  │
│       │            │ realtime:  │                  │
│       │            │ idea:{id}  │                  │
│       │            │ channels   │                  │
│       │            └────────────┘                  │
│       │                                            ▼
│       │                              (triggers no current
│       │                               functions, available
│       │                               for future chaining)
│       │
│  weeklyUpdate.created ──→ analyze-weekly-update (AI coach)
│       │                    └─ saves aiVerdict, aiAnalysis
│       │
│       └──→ follower-weekly-update-notification
│             └─ generateFollowerAnalysis + email subscribers
│
│  startup.follower.added ──→ follower-added (welcome email)
│  startup.member.added ──→ team-member-added-notification
│  announcement.startupFeature ──→ send-startup-feature-announcement
│  announcement.startupFeature.broadcast ──→ broadcast to all users
│
├──────────────────────────────────────────────────────────────────┤
│                            CRON                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Mon 09:00 UTC ──→ weekly-strategic-report
│    └─ runStrategicAdvisoryAgent → save snapshots → email → feed
│                                                                  │
│  1st of month ──→ monthly-reevaluation
│    └─ rerun research on ideas older than 30 days
│    └─ max 50 per batch
│                                                                  │
│  Sun 09:00 UTC ──→ weekly-startup-report-cron
│    └─ send startup.weeklyReport for active startups
│      └─ weekly-startup-report → email + feed
│                                                                  │
│  Fri 17:00 UTC ──→ weekly-update-reminder-cron-friday
│    └─ send startup.weeklyReminder to startups missing this week
│                                                                  │
│  Sat 17:00 UTC ──→ weekly-update-reminder-cron-saturday
│    └─ send startup.weeklyReminder to startups missing this week
│                                                                  │
│  Daily 06:00 UTC ──→ startup-opportunity-discovery-daily
│    └─ generateStartupOpportunities → dedupe → insert → audit log
│    └─ per-startup, max 10 per run
│
└──────────────────────────────────────────────────────────────────┘
```

### Typed Event Definitions

```typescript
interface InngestEvents {
  "idea.submitted": { ideaId: string; userId: string };
  "idea.research.completed": { ideaId: string; userId: string; overallScore: number };
  "user.created": { userId: string; email: string; name?: string };
  "email.send.verification": { email: string; name: string; code: string; url: string };
  "email.send.welcome": { email: string; name: string };
  "email.send.passwordReset": { email: string; name: string; url: string };
  "email.send.magicLink": { email: string; url: string };
  "weeklyUpdate.created": { updateId: string; startupId: string; userId: string };
  "startup.weeklyReport": { startupId: string; userId: string };
  "startup.weeklyReminder": { startupId: string; userId: string; reminderDay: "friday" | "saturday" };
  "startup.follower.added": { followerId: string; startupId: string; ... };
  "startup.member.added": { startupId: string; newMemberUserId: string; ... };
  "startup.weeklyUpdate.followerNotification": { updateId: string; startupId: string };
  "announcement.startupFeature": { userId: string };
  "announcement.startupFeature.broadcast": Record<string, never>;
  "digest.weekly": Record<string, never>;
}
```

## 3. Database Schema (45 Models)

### Core Entities

```
User ──→ Entitlement (1:1)
  │
  ├── Idea ──→ IdeaInput (1:N)
  │     ├── ResearchJob (1:N)
  │     ├── ResearchPacket (1:N) - one per agent per run
  │     ├── IdeaScore (1:N) - versioned scores
  │     ├── ResearchLog (1:N) - prompt/response audit trail
  │     ├── UrlContent (1:N) - scraped URL contents
  │     ├── PromptVersion (1:N) - edit history
  │     ├── GuideConversation ──→ GuideMessage (1:N)
  │     ├── IdeaSnapshot (1:N) - periodic state captures
  │     └── Startup (1:1, optional) - conversion target
  │
  ├── Startup ──→ StartupStreak (1:1)
  │     ├── WeeklyUpdate ──→ WeeklyGoal (1:N)
  │     │                └── WeeklyMetricEntry (1:N)
  │     ├── StartupMetric (1:N) - named metrics
  │     ├── StartupGoal (1:N)
  │     ├── TaskList ──→ Task (1:N)
  │     ├── StartupMember (1:N)
  │     ├── StartupFollower (1:N)
  │     ├── StartupConversation ──→ StartupMessage (1:N)
  │     ├── StartupOpportunity (1:N)
  │     ├── ResearchFeedItem (1:N)
  │     ├── StartupFlag (1:N)
  │     ├── MentorMatch (1:N) - accelerator mentor pairing
  │     ├── CohortStartup (1:N) - accelerator cohort membership
  │     └── AcceleratorApplication (1:N)
  │
  ├── Accelerator ──→ Cohort ──→ CohortStartup (1:N)
  │     ├── AcceleratorMember (1:N)
  │     ├── AcceleratorInvitation (1:N)
  │     ├── AcceleratorKPI (1:N)
  │     ├── AcceleratorWeeklyReport (1:N)
  │     ├── AcceleratorEvent ──→ EventAttendance (1:N)
  │     ├── AcceleratorApplication (1:N)
  │     └── Mentor ──→ MentorMatch (1:N)
  │
  └── AuditLog (1:N)
```

### Composite Keys

| Table | Key | Purpose |
|-------|-----|---------|
| `cohort_startups` | (cohortId, startupId) | Cohort membership |
| `event_attendance` | (eventId, userId) | Event RSVP |

### Unique Constraints

| Table | Constraint |
|-------|-----------|
| `entitlements` | Unique per userId (one-to-one) |
| `startup_followers` | (startupId, email) |
| `startup_members` | (startupId, userId) |
| `weekly_updates` | (startupId, weekNumber) |
| `startup_metrics` | (startupId, name) |
| `accelerator_members` | (acceleratorId, userId) |
| `mentor_matches` | (mentorId, startupId) |

### Enums (17)

- `UserRole`: USER, ADMIN
- `AccountStatus`: ACTIVE, FROZEN, DELETED
- `StartupMemberRole`: OWNER, ADMIN, MEMBER, VIEWER
- `IdeaStatus`: PENDING, PROCESSING, RESEARCHED, FAILED
- `IdeaInputType`: TEXT, AUDIO, IMAGE
- `ResearchJobStatus`: PENDING, RUNNING, COMPLETED, FAILED
- `ResearchAgentType`: INTERPRETER, MARKET_RESEARCH, TREND_ANALYSIS, EXECUTION_FRICTION, SYNTHESIS, DEEP_RESEARCH, STRATEGIC_ADVISORY
- `EntitlementPlan`: FREE, PRO
- `EntitlementStatus`: ACTIVE, CANCELED, PAST_DUE, EXPIRED
- `UrlContentStatus`: PENDING, SCRAPED, FAILED
- `GuideMessageRole`: USER, ASSISTANT, SYSTEM
- `TaskStatus`: TODO, IN_PROGRESS, BLOCKED, DONE
- `StartupStage`: IDEA, VALIDATION, BUILDING, LAUNCHED, SCALING
- `TargetMarket`: CONSUMER, SMB, ENTERPRISE
- `PrimaryMetricType`: 34 values (MRR, ARR, DAU, MAU, etc.)
- `OpportunityCategory`: 8 values
- `OpportunityStatus`: 7 values
- `AcceleratorRole`: OWNER, PROGRAM_MANAGER, OPERATIONS_LEAD, MENTOR, OBSERVER
- `ResearchFeedType`: IDEA_RESEARCH, WEEKLY_REPORT, WEEKLY_DIGEST, WEEKLY_REMINDER
- `MetricPeriod`: DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY
- `MetricFormat`: CURRENCY, PERCENTAGE, NUMBER

## 4. RBAC Architecture

### Startup Permissions

```
OWNER   → view_startup, edit_startup, submit_weekly_update, manage_tasks,
           manage_team, delete_startup, view_settings  (7 permissions)
ADMIN   → view_startup, edit_startup, submit_weekly_update, manage_tasks,
           manage_team, view_settings                   (6 permissions)
MEMBER  → view_startup, submit_weekly_update, manage_tasks                   (3 permissions)
VIEWER  → view_startup                                                        (1 permission)
```

Access check: `getUserStartupRole(userId, startupId)` → checks ownership first → checks `StartupMember` → resolves via `hasPermission(role, permission)`.

### Accelerator Permissions

```
OWNER              → manage_accelerator, manage_team, manage_cohorts, manage_startups,
                     manage_events, manage_kpis, view_metrics, view_startups,
                     submit_reports, flag_startups                           (10 permissions)
PROGRAM_MANAGER    → manage_cohorts, manage_startups, manage_kpis, view_metrics,
                     view_startups, submit_reports, flag_startups,
                     manage_events                                           (8 permissions)
OPERATIONS_LEAD    → manage_events, view_startups, manage_startups, view_metrics (4 permissions)
MENTOR             → view_startups                                           (1 permission)
OBSERVER           → view_metrics, view_startups                             (2 permissions)
```

Access check: `checkAcceleratorAccess(slug, permission)` → checks ownership first → checks `AcceleratorMember` → resolves via `hasAcceleratorPermission(role, permission)`.

## 5. Module Architecture

```
next.config.ts
  ├── reactCompiler: true
  └── serverExternalPackages: ["pdfkit"]

app/layout.tsx (root)
  └── NextSSRPlugin (UploadThing)
      └── NuqsAdapter
          └── ThemeProvider (next-themes)
              └── QueryProvider (TanStack React Query)
                  └── Toaster (sonner)
                      └── Analytics (Vercel)

lib/
  ├── auth.ts + auth-client.ts - Better Auth instance
  ├── db.ts - Prisma client singleton (PrismaPg adapter)
  ├── agents/ - 10 AI agents
  ├── ai/ - Model definitions, fallback, tools
  ├── inngest/client.ts - Inngest client + typed events
  ├── inngest/functions/ - 14 Inngest functions
  ├── email/ - Nodemailer client + templates
  ├── polar/ - Polar SDK + plan definitions
  ├── location/ - Geo detection + research context
  ├── opportunities/ - Discovery + generation
  ├── scraping/ - URL extraction + content scraping
  └── uploadthing-server.ts - UploadThing config

proxy.ts (Arcjet middleware)
  └── Arcjet Shield + Bot detection (LIVE)
      └── Auth routing (protect /dashboard, /ideas, /admin)
          └── Auth redirect (signed-in → dashboard, signed-out → sign-in)
```
