# API Reference

62 API endpoints across 9 resource categories. All routes live under `/api/`.

## Auth (11 endpoints)

Better Auth handlers wrapped with Arcjet rate limiting.

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/custom/sign-up` | Register with email/password, generates verification code, sends email |
| POST | `/api/auth/custom/sign-up/social` | Social sign-up (Google), generates username if missing, sends welcome email |
| POST | `/api/auth/custom/verify-email` | Verify email by 6-digit code |
| POST | `/api/auth/custom/verify-email/token` | Verify email by token |
| PUT | `/api/auth/custom/resend-verification-email` | Generate new verification code and resend email |
| POST | `/api/auth/custom/forgot-password` | Request password reset (triggers Better Auth) |
| PUT | `/api/auth/custom/reset-password` | Confirm password reset with token |
| GET | `/api/auth/[...all]` | Better Auth handlers (session, user, etc.) |
| POST | `/api/auth/[...all]` | Better Auth handlers (sign-in, sign-out, etc.) - Arcjet wrapped |

## Ideas (13 endpoints)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/ideas` | Paginated user ideas with search + archived filter |
| POST | `/api/ideas` | Create idea from text, auto-detect location, extract URLs, trigger research |
| GET | `/api/ideas/[id]` | Full idea details (inputs, scores, research packets, jobs) |
| DELETE | `/api/ideas/[id]` | Delete idea (or archive if startup linked) |
| PATCH | `/api/ideas/[id]` | Update idea fields (title, summary, status, priority) |
| GET | `/api/ideas/[id]/research` | List research packets |
| POST | `/api/ideas/[id]/research` | Re-run research (Arcjet rate-limited, prevents concurrent runs) |
| GET | `/api/ideas/[id]/guide` | List guide conversations or get by conversationId |
| POST | `/api/ideas/[id]/guide` | Send message to guide agent (streaming) |
| DELETE | `/api/ideas/[id]/guide` | Archive guide conversation |
| GET | `/api/ideas/[id]/prompt` | Prompt version history |
| PUT | `/api/ideas/[id]/prompt` | Update prompt with AI interpretation; triggers re-research on major changes |
| GET | `/api/ideas/[id]/startup` | Check if idea has linked startup (`{ hasStartup, startup }`) |
| POST | `/api/ideas/[id]/share` | Generate/return existing share token (nanoid, 12 chars) |
| DELETE | `/api/ideas/[id]/share` | Remove share token |
| POST | `/api/ideas/[id]/export` | Generate PDF research report via pdfkit (Arcjet rate-limited) |

## Startups (18 endpoints)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/startups` | Paginated user startups (owner or member) with idea, latest update |
| POST | `/api/startups` | Create startup from idea, slug generation, entitlement check |
| GET | `/api/startups/search` | Global search by name/email/industry (for accelerator admins) |
| POST | `/api/startups/check-slug` | Check slug availability |
| GET | `/api/startups/[id]` | Full startup details (idea, updates, goals, metrics) |
| PATCH | `/api/startups/[id]` | Update startup profile |
| GET | `/api/startups/[id]/updates` | Paginated weekly updates with goals |
| POST | `/api/startups/[id]/updates` | Create weekly update, compute streak, trigger AI analysis + follower notifications |
| PATCH | `/api/startups/[id]/updates` | Edit update (within 3-day window) |
| POST | `/api/startups/[id]/chat` | Streaming VC Coach AI chat |
| GET | `/api/startups/[id]/research-feed` | Paginated feed with type/date filters |
| GET | `/api/startups/[id]/opportunities` | List opportunities with category/status filters |
| POST | `/api/startups/[id]/opportunities` | Create manual opportunity |
| PATCH | `/api/startups/[id]/opportunities` | Update opportunity status/notes |
| POST | `/api/startups/[id]/opportunities/generate` | AI-generate opportunities |
| GET | `/api/startups/[id]/streak` | Current/longest streak, at-risk status, milestones |
| GET | `/api/startups/[id]/members` | List members (owner synthesized + join table records) |
| POST | `/api/startups/[id]/members` | Add member with role (requires manage_team) |
| PATCH | `/api/startups/[id]/members/[memberId]` | Update member role |
| DELETE | `/api/startups/[id]/members/[memberId]` | Remove member |
| GET | `/api/startups/[id]/followers` | List external followers |
| POST | `/api/startups/[id]/followers` | Add follower by email (requires manage_team) |
| DELETE | `/api/startups/[id]/followers/[followerId]` | Remove follower |
| GET | `/api/startups/[id]/conversations` | List active VC Coach conversations |
| POST | `/api/startups/[id]/conversations` | Create new conversation |
| GET | `/api/startups/[id]/conversations/[convId]` | Get conversation with messages |
| DELETE | `/api/startups/[id]/conversations/[convId]` | Soft-delete conversation |
| POST | `/api/startups/[id]/applications` | Task board mutations (create/rename/reorder lists, CRUD tasks) |
| PATCH | `/api/startups/[id]/applications` | Update tasks, move tasks between lists/statuses |
| DELETE | `/api/startups/[id]/applications` | Delete lists/tasks |

## Accelerators (14 endpoints)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/accelerators` | List accelerators (public or user-accessible) |
| POST | `/api/accelerators` | Create accelerator with slug + owner |
| GET | `/api/accelerators/[slug]` | Get accelerator details with cohorts, members, counts |
| PATCH | `/api/accelerators/[slug]` | Update accelerator |
| DELETE | `/api/accelerators/[slug]` | Delete accelerator |
| POST | `/api/accelerators/[slug]/apply` | Submit application |
| GET | `/api/accelerators/[slug]/cohorts` | List cohorts |
| POST | `/api/accelerators/[slug]/cohorts` | Create cohort |
| GET | `/api/accelerators/[slug]/cohorts/[cohortId]/startups` | List startups in cohort |
| POST | `/api/accelerators/[slug]/cohorts/[cohortId]/startups` | Add startup to cohort |
| GET | `/api/accelerators/[slug]/team` | List members with owner |
| POST | `/api/accelerators/[slug]/team` | Invite member by email |
| DELETE | `/api/accelerators/[slug]/team` | Remove member |
| GET | `/api/accelerators/[slug]/mentors` | List mentors with matches |
| POST | `/api/accelerators/[slug]/mentors` | Create mentor |
| POST | `/api/accelerators/[slug]/mentors/[mentorId]/matches` | Create mentor-startup match |
| DELETE | `/api/accelerators/[slug]/mentors/[mentorId]/matches` | Remove mentor-startup match |
| GET | `/api/accelerators/[slug]/events` | List events (optional cohortId filter) |
| POST | `/api/accelerators/[slug]/events` | Create event (requires manage_events) |
| GET | `/api/accelerators/[slug]/reports` | List weekly reports |
| POST | `/api/accelerators/[slug]/reports` | Create weekly report |
| GET | `/api/accelerators/[slug]/kpis` | List KPIs |
| POST | `/api/accelerators/[slug]/kpis` | Create KPI |
| PATCH | `/api/accelerators/[slug]/kpis` | Update KPI current value |
| POST | `/api/accelerators/[slug]/coach` | Run Hub Coach AI analysis |
| GET | `/api/accelerators/[slug]/startups/[id]/investor-profile` | Investor one-pager data |

## General Chat (2 endpoints)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/chat` | General AI chat (streaming, with model selection + research mode) |
| POST | `/api/guide/chat` | Guide agent chat (idea-specific research Q&A) |

## Goals (1 endpoint)

| Method | Route | Description |
|--------|-------|-------------|
| PATCH | `/api/goals/[goalId]` | Toggle goal completion status |

## Admin (2 endpoints)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/stats` | Dashboard stats (total users, ideas, researched ideas) - ADMIN role |
| GET | `/api/admin/users` | Paginated users with search - ADMIN role |

## Assets (1 endpoint)

| Method | Route | Description |
|--------|-------|-------------|
| DELETE | `/api/assets/[id]` | Delete asset from UploadThing |
| POST | `/api/assets/generate` | **(Not implemented)** AI asset generation |

## Billing (1 endpoint)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/billing/subscription` | Current plan + usage (active ideas, max ideas) |

## Onboarding (2 endpoints)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/onboarding` | Submit onboarding data, create idea, trigger research |
| GET | `/api/onboarding/status` | Check if onboarding needed (`{ showOnboarding, ideaCount }`) |

## Storage (1 endpoint)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/storage/signed-url` | Generate signed download URL for file key |

## User (3 endpoints)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/user/profile` | User profile |
| PUT | `/api/user/profile` | Update profile (name, image) |
| GET | `/api/user/entitlement` | Entitlement record |
| GET | `/api/users/search` | Search users by name/email (min 2 chars) |

## Analytics & Dashboard (2 endpoints)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/analytics/dashboard` | Computed analytics (scores, verdict breakdown, trends) |
| GET | `/api/dashboard` | Dashboard data (usage, recent ideas, top ideas, avg score) |

## Infrastructure (3 endpoints)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/inngest` | Inngest dev server handler |
| POST | `/api/inngest` | Inngest event ingestion |
| PUT | `/api/inngest` | Inngest function registration |
| GET | `/api/inngest/token` | Real-time subscription token for idea research progress (via Server Action) |
| GET | `/api/uploadthing` | UploadThing handler |
| POST | `/api/uploadthing` | UploadThing file upload handler |
