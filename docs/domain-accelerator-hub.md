# Accelerator Hub

## Overview

The Accelerator Hub is a full program management system for running startup accelerator and incubator programs. It covers cohort management, event planning, mentor matching, KPI tracking, weekly reporting, and AI-powered cohort analysis.

## RBAC (Role-Based Access Control)

### 5 Roles, 10 Permissions

| Role | Level | Key Permissions |
|------|-------|----------------|
| OWNER | 5 (admin) | Full access - manage_accelerator, manage_team, manage_cohorts, manage_startups, manage_events, manage_kpis, view_metrics, view_startups, submit_reports, flag_startups |
| PROGRAM_MANAGER | 4 | manage_cohorts, manage_startups, manage_kpis, view_metrics, view_startups, submit_reports, flag_startups, manage_events |
| OPERATIONS_LEAD | 3 | manage_events, view_startups, manage_startups, view_metrics |
| MENTOR | 2 | view_startups (assigned only) |
| OBSERVER | 1 | view_metrics, view_startups |

### Authorization Pattern
1. Check if user is `accelerator.ownerId` (auto-returns OWNER)
2. Otherwise look up `AcceleratorMember` record for role
3. Check `hasAcceleratorPermission(role, permission)` against permission map
4. Both client-side (`accelerator-permissions.ts`) and server-side (`accelerator-permissions-server.ts`) enforcement

## Programs

### CRUD
- Create: name, description, program type (accelerator/incubator/cohort_based/fellowship/VC), duration, website, contact email, benefits, requirements, max startups, funding amount, public/private toggle
- Read: public listing (`/accelerators`), detail page (`/accelerators/[slug]`)
- Update: Full edit via admin panel
- Delete: With authorization check

### Public Pages
- `/accelerators` - Browse all public/active programs with search
- `/accelerators/[slug]` - Detail page with stats, benefits, cohorts
- `/accelerators/[slug]/apply` - Application form (name, email, phone, startup, pitch)

## Cohorts

### Lifecycle
1. Create cohort (name, description, start date, end date)
2. Onboard startups via platform-wide search (`/api/startups/search`)
3. Track per-startup metrics: stage, last update date, morale score
4. Monitor morale color-coding: green (>7), amber (>4), red (<4)

### Cohort Management UI
**Route**: `/admin/accelerators/[slug]` (Cohorts tab)
- Left sidebar: cohort list with selection
- Right panel: cohort detail with onboarded startups table
- Per-startup actions: view investor one-pager, track morale

## Events

### Event Types
1. **workshop** - Educational session
2. **mentor_session** - One-on-one or group mentoring
3. **office_hours** - Open office hours
4. **networking** - Networking event
5. **demo_day** - Demo day / pitch event

### Event Fields
- title, description, event type, scheduled date/time
- duration (minutes), location (physical), meeting URL (virtual)
- cohort association (optional, can be program-wide)
- RSVP tracking via `EventAttendance` (composite key: eventId + userId)
- Per-event attendance count display

### Permissions
- Create: OWNER, PROGRAM_MANAGER, OPERATIONS_LEAD
- Filterable by cohort or show all

## Mentor Management

### Mentor CRUD
- Add mentor: name, email, expertise (string array), bio, LinkedIn
- Display: grid of mentor cards with expertise badges and matched startups
- Searchable mentor directory

### Mentor-Startup Matching
- Pair mentors with startups by focus area (e.g., "Marketing Strategy, GTM")
- One-to-many: one mentor can match with multiple startups
- Unique constraint: one match per mentor-startup pair
- Display matched startups per mentor card

## KPIs & Reports

### KPI Tracking
- Name, target value, current value, unit, deadline
- Inline editing of current values (onBlur triggers PATCH)
- Visual progress bars showing percentage achieved
- Role-gated: OWNER and PROGRAM_MANAGER can manage KPIs

### Weekly Hub Reports
- Manager-submitted progress summaries
- AI-generated summaries on submit
- Week number tracking per report
- Role-gated: OWNER and PROGRAM_MANAGER can submit

## AI Hub Coach

### Purpose
Cohort-wide strategic analysis for accelerator managers. Identifies patterns across all startups in a program.

### Analysis Output
- **Sentiment**: EXCELLENT, STABLE, CONCERNING, CRITICAL
- **Top bottleneck**: Single most impactful issue across the cohort
- **Cohort patterns**: Recurring observations with impact assessment and recommendations
- **At-risk startups**: Flagged startups with reason and suggested intervention
- **KPI forecast**: Whether program-level KPIs are on track with analysis

### Trigger
POST to `/api/accelerators/[slug]/coach` - collects all startup data, updates, flags, and KPIs, then runs AI analysis.

## Investor One-Pager

### Purpose
Print-ready startup profiles for demo days, combining founder data, growth metrics, and AI insights.

### Data
- Startup info: name, tagline, description, industry, stage, website, location
- Founder info: name, email
- Cohort details
- Metrics: current primary metric value, weekly deltas (4-week history), achievements
- AI insights: Natural language VC-style commentary generated by the AI

### Export
- Browser print-to-PDF (`window.print()`)
- Growth chart: **placeholder** - not yet implemented

**API**: GET `/api/accelerators/[slug]/startups/[id]/investor-profile`

## Applications

### Application Flow
1. Founders apply via public `/accelerators/[slug]/apply` form
2. Application fields: founder name, email, phone, optional startup link, pitch
3. Status tracking: pending, accepted, rejected
4. Dashboard view: grouped by accelerator with status badges

### Dashboard
**Route**: `/my-accelerators`
- Stats bar: total accelerators, active programs, total applications
- Tabs: My Accelerators, All Applications
- Note: Status update UI (accept/reject) not yet implemented in frontend

## Data Model

Key models in `prisma/schema.prisma`:
- `Accelerator` - Program definition (45 fields)
- `AcceleratorMember` - Role assignment (unique: acceleratorId + userId)
- `AcceleratorInvitation` - Email-based invites with token
- `Cohort` - Program cohort with date range
- `CohortStartup` - Composite join table (cohortId + startupId)
- `AcceleratorEvent` - Scheduled events with RSVP
- `EventAttendance` - Composite join table (eventId + userId)
- `Mentor` - Mentor profiles with expertise array
- `MentorMatch` - Mentor-startup pairing (unique: mentorId + startupId)
- `AcceleratorKPI` - Program-level KPIs
- `AcceleratorWeeklyReport` - Weekly progress summaries
- `StartupFlag` - At-risk flagging (severity: warning/critical)
- `AcceleratorApplication` - Incoming applications

## Bootstrap

```bash
pnpm bootstrap:accelerator create-accelerator --email=<owner-email>
```

This script initializes the Genesyz accelerator program with the specified owner.
