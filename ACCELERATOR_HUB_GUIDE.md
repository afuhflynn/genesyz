# Accelerator Hub: Technical & User Documentation

Welcome to the **IdeasVault Accelerator Hub**. This internal platform is designed to help accelerator managers, operations leads, and mentors oversee startup cohorts with AI-powered precision.

---

## 1. Role-Based Access Control (RBAC)
To prevent operational "hazards" and protect sensitive startup data, the Hub uses a granular permission system.

| Role | Responsibility | Key Permissions |
| :--- | :--- | :--- |
| **OWNER (Superior Admin)** | Program Strategy & Team | Manage Team, Change Roles, Delete Program, Branding |
| **PROGRAM_MANAGER** | Cohort Success & Growth | Bulk Onboard, Set KPIs, Hub Reports, AI Hub Coach, Flagging |
| **OPERATIONS_LEAD** | Logistics & Curriculum | Event Scheduling, Attendance Tracking, Basic Onboarding |
| **MENTOR** | Specialized Guidance | View Paired Startups, Session Schedule, Feedback |
| **OBSERVER** | Reporting & Oversight | View-only Metrics, Growth Charts, Startup Summaries |

---

## 2. Core Management Features

### 📦 Centralized Batch Management (Cohorts)
Managers can define specific "Batches" (e.g., *Winter 2026*).
- **Startup Search:** Integrated search to find any startup on IdeasVault by name, industry, or founder email.
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

## 3. AI & Investor Features

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

## 4. Reporting & KPIs

### 🎯 Program KPIs
Managers can set high-level goals for the entire accelerator (e.g., *"Total Cohort Revenue: $1M"*).
- **Achievement Tracking:** Visual progress bars show how close the cohort is to the goal.
- **Manual Adjustments:** Hub Managers can update "Current Values" as milestones are reached.

### 📝 Weekly Hub Reports
The official record of the accelerator's progress.
- **Structured Logs:** Managers submit a weekly summary of program activity.
- **AI Synthesis:** The system automatically generates a concise "AI Synthesis" of the report for stakeholders.

---

## 5. Getting Started
1. **Access:** Click the **Accelerator Hub** link in the main sidebar.
2. **Setup:** Create your first **Cohort**.
3. **Onboard:** Search for and add startups to the cohort.
4. **Invite:** Go to the **Team** tab to invite your Program Managers and Operations Leads.
5. **Analyze:** Run the **AI Hub Coach** once your startups have submitted their first weekly updates.

---

## 6. Route & API Reference

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
- `PATCH/DELETE /api/accelerators/[slug]`: Update program settings or deactivate the accelerator.

