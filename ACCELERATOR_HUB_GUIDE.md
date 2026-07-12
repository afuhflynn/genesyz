# Accelerator Hub: Technical & User Documentation

Welcome to the **Genesyz Accelerator Hub**. This internal platform is designed to help accelerator managers, operations leads, and mentors oversee startup cohorts with AI-powered precision.

---

## 1. Overview

The Genesyz Accelerator Program is an internal program for managing and supporting startups on the Genesyz platform. It provides:

- Centralized cohort/batch management
- Growth & performance monitoring with aggregated metrics
- Event & curriculum planning
- Mentor matching
- AI-powered coaching and insights
- Investor one-pager generation for demo days

---

## 2. Role-Based Access Control (RBAC)

To prevent operational "hazards" and protect sensitive startup data, the Hub uses a granular permission system.

| Role | Responsibility | Key Permissions |
| :--- | :--- | :--- |
| **OWNER** | Program Strategy & Team | Manage Team, Change Roles, Delete Program, Branding |
| **PROGRAM_MANAGER** | Cohort Success & Growth | Bulk Onboard, Set KPIs, Hub Reports, AI Hub Coach, Flagging |
| **OPERATIONS_LEAD** | Logistics & Curriculum | Event Scheduling, Attendance Tracking, Basic Onboarding |
| **MENTOR** | Specialized Guidance | View Paired Startups, Session Schedule, Feedback |
| **OBSERVER** | Reporting & Oversight | View-only Metrics, Growth Charts, Startup Summaries |

### Role Hierarchy

- **OWNER (Rank 1)** - Can manage all roles
- **PROGRAM_MANAGER (Rank 2)** - Can manage OPERATIONS_LEAD, MENTOR, OBSERVER
- **OPERATIONS_LEAD (Rank 3)** - Can manage MENTOR, OBSERVER
- **MENTOR (Rank 4)** - Cannot manage others
- **OBSERVER (Rank 5)** - Cannot manage others

---

## 3. Setup & Installation

### Prerequisites

1. **Database**: Ensure PostgreSQL is running
   ```bash
   pnpm db:up          # Start database (if using Docker)
   pnpm db:push       # Push schema changes
   ```

2. **Environment Variables**: Ensure `.env` contains:
   ```
   DATABASE_URL=postgresql://...
   ```

### Bootstrap the Accelerator

Run the bootstrap script to create the Genesyz Accelerator Program:

```bash
# Create the accelerator with a specific owner
pnpm bootstrap:accelerator create-accelerator --email=flynn@safuh.com

# Or use default email from script
pnpm bootstrap:accelerator create-accelerator
```

### Add Users to Accelerator

```bash
# Add a user with specific role
pnpm bootstrap:accelerator add-user --email=user@example.com --role=PROGRAM_MANAGER

# Available roles: OWNER, PROGRAM_MANAGER, OPERATIONS_LEAD, MENTOR, OBSERVER
```

### List Current Members

```bash
pnpm bootstrap:accelerator list-members
```

---

## 4. Core Management Features

### 📦 Centralized Batch Management (Cohorts)
Managers can define specific "Batches" (e.g., *Winter 2026*).
- **Startup Search:** Integrated search to find any startup on Genesyz by name, industry, or founder email.
- **One-Click Onboarding:** Instantly assign startups to a cohort.
- **Performance Overview:** A real-time table showing the stage, last update time, and "Morale Score" of every startup in the batch.

### 📈 Growth & Performance Monitoring
The Hub aggregates data from individual startup "Weekly Updates" to provide a program-level view.
- **Aggregated Metrics:** Total MRR, User Growth, and Average WoW Growth across the cohort.
- **Flagging System:** Automated and manual alerts for startups that have missed consecutive updates or show declining KPIs.

### 📅 Event & Curriculum Planning
A full logistics engine for program activities.
- **Scheduler:** Categorize events as Workshops, Mentor Sessions, Office Hours, or Demo Days.
- **Targeting:** Assign events to the "Entire Program" or specific cohorts.
- **RSVP Tracking:** Monitor founder attendance and gather feedback per session.

### 🤝 Mentor & Expert Matching
Maintain a searchable database of experts.
- **Expertise Tags:** Categorize mentors by skills (e.g., *Legal, GTM, Technical Scaling*).
- **Matchmaking:** Pair mentors with specific startups and define a "Focus Area" for the engagement.

---

## 5. AI & Investor Features

### 🤖 AI Hub Coach
A specialized agent built for high-level oversight.
- **Pattern Recognition:** Identifies if multiple startups are struggling with the same hurdle (e.g., "60% of the cohort is stuck on B2B pricing").
- **Risk Assessment:** Highlights specific "At-Risk" startups that need a 1-on-1 intervention.
- **KPI Forecast:** Predicts if the program will hit its set targets based on current velocity.

### 📄 Investor One-Pager (Demo Day Prep)
Automatically generates a professional, print-ready "One-Pager" for any startup.
- **Synthesis:** Combines founder data, growth charts, and key achievements.
- **VC AI Insight:** Includes summarized feedback from the platform's AI Coach to provide an objective investment thesis.
- **Export:** Optimized for PDF export and sharing with external investors.

---

## 6. Reporting & KPIs

### 🎯 Program KPIs
Managers can set high-level goals for the entire accelerator (e.g., *"Total Cohort Revenue: $1M"*).
- **Achievement Tracking:** Visual progress bars show how close the cohort is to the goal.
- **Manual Adjustments:** Hub Managers can update "Current Values" as milestones are reached.

### 📝 Weekly Hub Reports
The official record of the accelerator's progress.
- **Structured Logs:** Managers submit a weekly summary of program activity.
- **AI Synthesis:** The system automatically generates a concise "AI Synthesis" of the report for stakeholders.

---

## 7. Getting Started

### For Admins (OWNER/PROGRAM_MANAGER)

1. **Access the Accelerator Hub:**
   - Navigate to `/accelerator/admin` (redirects to `/admin/accelerators/genesyz-accelerator`)
   - Or directly: `/admin/accelerators/genesyz-accelerator`

2. **Create a Cohort:**
   - Go to the **Cohorts** tab
   - Click "Create Cohort"
   - Set name (e.g., "Spring 2026"), dates, and description

3. **Add Startups to Cohort:**
   - Click on a cohort
   - Use "Add Startup" to search and onboard startups
   - Select from existing Genesyz startups

4. **Manage Team:**
   - Go to the **Team** tab
   - Add team members with appropriate roles
   - Use: `pnpm bootstrap:accelerator add-user --email=EMAIL --role=ROLE`

5. **Set KPIs:**
   - Go to the **KPI Reporting** tab
   - Create program-level KPIs
   - Track progress visually

6. **Schedule Events:**
   - Go to the **Curriculum** tab
   - Create workshops, mentor sessions, etc.
   - Track RSVPs

7. **Use AI Coach:**
   - Go to the **Hub Coach** tab
   - Run analysis on cohort data
   - Review AI insights and recommendations

### For Mentors

1. Access the accelerator via `/admin/accelerators/genesyz-accelerator`
2. View assigned startups in the dashboard
3. Provide feedback and schedule sessions

### For Observers

1. Access the accelerator to view metrics
2. Review startup progress and growth charts
3. No editing capabilities

---

## 8. Database Schema

### Core Models

```prisma
model Accelerator {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  description   String?
  programType   String   @default("accelerator")
  logoUrl       String?
  website       String?
  contactEmail  String?
  durationWeeks Int?
  benefits      String?
  requirements  String?
  maxStartups  Int?
  fundingAmount String?
  isPublic     Boolean  @default(true)
  isActive     Boolean  @default(true)
  ownerId       String
  createdAt     DateTime @default(now())

  cohorts       Cohort[]
  events        AcceleratorEvent[]
  applications  AcceleratorApplication[]
  members       AcceleratorMember[]
  invitations   AcceleratorInvitation[]
  kpis          AcceleratorKPI[]
  reports       AcceleratorWeeklyReport[]
  mentors       Mentor[]
}

enum AcceleratorRole {
  OWNER           // Superior Admin: Full access, manage admins
  PROGRAM_MANAGER // Manage cohorts, startups, flags
  OPERATIONS_LEAD // Manage events, curriculum, logistics
  MENTOR          // View assigned startups, feedback
  OBSERVER        // Read-only
}

model AcceleratorMember {
  id            String          @id @default(cuid())
  acceleratorId String
  userId        String
  role          AcceleratorRole @default(PROGRAM_MANAGER)
  joinedAt      DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  accelerator   Accelerator     @relation(fields: [acceleratorId], references: [id], onDelete: Cascade)
  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([acceleratorId, userId])
}

model Cohort {
  id              String   @id @default(cuid())
  acceleratorId   String
  name            String   // "Winter 2026"
  description     String?
  startDate       DateTime
  endDate         DateTime
  isActive        Boolean  @default(true)

  accelerator     Accelerator @relation(fields: [acceleratorId], references: [id], onDelete: Cascade)
  startups        CohortStartup[]
  events          AcceleratorEvent[]
}

model CohortStartup {
  cohortId      String
  startupId     String
  joinedAt      DateTime @default(now())

  cohort        Cohort   @relation(fields: [cohortId], references: [id], onDelete: Cascade)
  startup       Startup  @relation(fields: [startupId], references: [id], onDelete: Cascade)

  @@id([cohortId, startupId])
}

```

---

## 9. Route & API Reference

### 🖼️ Frontend Pages (UI)

The entire hub management experience is consolidated into a single, high-performance dynamic route:

- **Main Dashboard:** `/admin/accelerators/[slug]`
  - *Note: This page uses a tabbed interface to manage Overview, Cohorts, Curriculum, Mentors, Team, and Settings without full page reloads.*

### 🔌 Backend API Endpoints

All routes are protected by the Accelerator RBAC system and scoped to the specific program.

#### **Cohort & Startup Management**
- `GET/POST /api/accelerators/[slug]/cohorts`: List all cohorts or create a new batch.
- `GET/POST /api/accelerators/[slug]/cohorts/[cohortId]/startups`: Manage startups within a specific cohort.
- `GET /api/startups/search`: Global search for startups to onboard (Admin/Manager only).

#### **Curriculum & Logistics**
- `GET/POST /api/accelerators/[slug]/events`: Manage workshops, mentor sessions, and office hours.
- `GET/POST /api/accelerators/[slug]/mentors`: Manage the mentor database.
- `POST/DELETE /api/accelerators/[slug]/mentors/[mentorId]/matches`: Pair mentors with startups.

#### **Performance & AI**
- `POST /api/accelerators/[slug]/coach`: Trigger the AI Hub Coach strategic analysis.
- `GET /api/accelerators/[slug]/startups/[id]/investor-profile`: Fetch synthesized demo-day data.
- `GET/POST/PATCH /api/accelerators/[slug]/kpis`: Define and track program-level targets.
- `GET/POST /api/accelerators/[slug]/reports`: Submit and retrieve weekly hub progress logs.

#### **Team & Access**
- `GET/POST /api/accelerators/[slug]/team`: Manage admin staff and send secure role-based invitations.
- `PATCH/DELETE /api/accelerators/[slug]`: Update program settings or deactivate the accelerator

---

## 10. Commands Reference

### Database Setup

```bash
# Push schema changes to database
pnpm db:push

# Or with reset (warning: deletes data)
pnpm db:push:reset
```

### Accelerator Bootstrap

```bash
# Create the Genesyz Accelerator Program
pnpm bootstrap:accelerator create-accelerator --email=OWNER_EMAIL

# Add a user to the accelerator
pnpm bootstrap:accelerator add-user --email=EMAIL --role=ROLE

# List all accelerator members
pnpm bootstrap:accelerator list-members
```

### Development

```bash
# Start development server
pnpm dev

# Start database (Docker)
pnpm db:up

# Stop database
pnpm db:down

# Open Prisma Studio
pnpm db:studio
```

---

## 11. Troubleshooting

### User Cannot Access Accelerator

1. Check if user exists in the system
2. Run: `pnpm bootstrap:accelerator list-members`
3. If not added: `pnpm bootstrap:accelerator add-user --email=EMAIL --role=ROLE`

### Accelerator Not Found

1. Ensure bootstrap was run: `pnpm bootstrap:accelerator create-accelerator`
2. Check database: `pnpm db:studio` → verify `accelerators` table has entry

### Permission Errors

- Ensure user has appropriate role in `accelerator_members` table
- OWNER can manage all; PROGRAM_MANAGER can manage below rank

---

## 12. Future Enhancements

Planned features:

- Multi-accelerator support (vertical-specific accelerators)
- Advanced analytics dashboard
- Integration with external CRM tools
- Automated investor matching
