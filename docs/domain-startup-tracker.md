# Startup Execution Tracker

## Overview

The Startup Execution Tracker converts validated ideas into active startup profiles and provides tools for weekly progress tracking, AI coaching, task management, team collaboration, and metrics visualization.

## Startup Profiles

### Creation Flow
1. A researched idea (`status: RESEARCHED`) can be converted to a startup
2. The startup creation form pre-fills from the idea (name, summary)
3. A unique slug is auto-generated from the name (with real-time availability check)
4. Location is captured via geographic selector (continent → country → region → city)

### Startup Fields
- **name**, **slug** - Unique identifiers
- **tagline**, **description** - Pitch and full description
- **industry** - Free-text industry tag
- **stage** - `IDEA → VALIDATION → BUILDING → LAUNCHED → SCALING`
- **targetMarket** - `CONSUMER`, `SMB`, `ENTERPRISE`
- **website**, **location** - Contact info
- **primaryMetricType** - The single metric the founder commits to (default: `USER_CONVERSATIONS`)
- **isLaunched**, **launchDate**, **weeksToLaunch** - Launch tracking
- **currentWeekNumber** - Auto-incremented week counter (relative to creation date)

### Idea-to-Startup Pipeline
- The `ConvertToStartupCTA` component is shown on researched ideas with no existing startup
- Creating a startup from an idea checks Polar entitlement limits (Free: 3 active ideas)
- The idea is linked one-to-one with the startup via `Startup.ideaId`

## Weekly Updates

### Core Concept
Founders submit a weekly check-in every week. The week number is relative to the startup's creation date (not calendar week). Updates are locked after 3 days.

### Pre-Launch Mode (`isLaunched: false`)
Only `USER_CONVERSATIONS` metric is tracked. Fields:
- Users talked to (number)
- User learnings (textarea)
- Previous goals review (mark completed/incomplete)
- Goals for next week (1-3)
- Morale score (1-10 with labeled values)
- Top improvements, biggest obstacle

### Post-Launch Mode (`isLaunched: true`)
Unlocks full metric catalog (34 types across 6 categories):
- **Revenue & Financial** - MRR, ARR, Gross/Net Revenue, Take Rate, etc.
- **User & Engagement** - DAU, WAU, MAU, Retention, Churn, etc.
- **Marketplace & Transactions** - GMV, Completed Orders, Bookings
- **Growth & Trajectory** - WoW Growth, MoM Growth
- **Special Cases** - Signed Contracts, Pipeline Value, Product Milestones
- **Custom** - Named custom metric

Up to 5 additional metrics can be tracked per week alongside the primary metric.

### Streak System
- Consecutive weekly updates tracked automatically
- Milestones (with badges): 4, 8, 12, 16, 20, 24, 52 weeks
- Flame emojis appear at 4+ week streaks
- At-risk detection: orange warning if update is overdue
- Streak breaks if a week is skipped (resets to 1)
- Managed server-side on update creation

### AI Coach Analysis
Triggered by Inngest on `weeklyUpdate.created` event:
- **Verdict**: `ON_TRACK`, `NEEDS_ATTENTION`, or `AT_RISK`
- **Positives**: What's working well
- **Concerns**: Areas needing attention
- **Blind spots**: Things the founder is missing
- **Trajectory**: Trend assessment and weeks-to-milestone estimate
- **Recommendations**: Actionable next-week steps
- **Task analysis**: Considers task completion rates and overdue items

A separate follower-friendly analysis is generated for external subscribers.

#### API Endpoint
`POST /api/startups/[id]/updates` - Creates weekly update, triggers streak sync and AI analysis events.

### Metrics Dashboard
**Route**: `/startups/[slug]/metrics`
- Primary metric history (area chart, 8-week window)
- User conversations history (line chart)
- Auto-discovered additional metric types rendered as individual charts
- Delta calculations (week-over-week)
- Format-aware display (currency, percentage, number)

## Task Board

**Route**: `/startups/[slug]/tasks`

A Kanban board using `@dnd-kit`:
- Create/rename/delete task lists
- 4 status columns per list: TODO, IN_PROGRESS, BLOCKED, DONE
- Drag tasks between lists and statuses
- Inline editing (title, description, deadline)
- Task counts per list and status

**API**: Unified action-based endpoint at `POST/PATCH/DELETE /api/startups/[id]/applications` with actions: `create_list`, `create_task`, `rename_list`, `reorder_lists`, `update_task`, `move_task`, `delete_list`, `delete_task`.

## Team Collaboration

### Roles & Permissions

| Role | Permissions |
|------|------------|
| OWNER | view, edit, submit_weekly_update, manage_tasks, manage_team, delete, view_settings |
| ADMIN | view, edit, submit_weekly_update, manage_tasks, manage_team, view_settings |
| MEMBER | view, submit_weekly_update, manage_tasks |
| VIEWER | view |

### Team Management
- Owner is implicit (the startup creator) - no join table record needed
- Members stored in `StartupMember` join table with role
- Owner cannot be assigned via API; only ADMIN, MEMBER, VIEWER can be invited
- Search users by name/email via `/api/users/search`

### External Followers
- Email-based subscribers (no account required)
- Receive weekly update notification emails with AI-generated analysis
- Managed via `/api/startups/[id]/followers`

## VC Coach

**Route**: `/startups/[slug]/chat`

An AI-powered strategic advisor chat:
- Uses `useChat` from `@ai-sdk/react` with streaming
- Full access to startup data, metrics, and research
- Multiple conversation sessions with history
- Reasoning extraction from `<thinking>` tags
- Session ID persisted in URL via nuqs (bookmarkable)
- Suggested questions: review weekly update, pitch prep, competitor analysis, growth priorities

**API**: `POST /api/startups/[id]/chat` - Streaming AI chat endpoint.

## Research Feed

**Route**: `/startups/[slug]/research-feed`

Aggregated timeline of AI-generated content:
- `IDEA_RESEARCH` - Initial idea validation research
- `WEEKLY_REPORT` - Weekly AI analysis reports
- `WEEKLY_DIGEST` - Weekly strategic portfolio digests
- `WEEKLY_REMINDER` - AI-generated update reminders

Filterable by type and date range. Paginated (20 items/page).

## Streaks

**Route**: `/startups/[slug]/streaks`

Displays current streak, longest streak, milestone progress, and at-risk status.

## Profile & Settings

**Routes**:
- `/startups/[slug]/profile` - Edit startup profile, manage team
- `/startups/[slug]/settings` - General settings, team management, danger zone (delete startup)
