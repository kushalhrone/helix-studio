

# Client Request Triage Dashboard — Full v1 Build Plan

A clean, minimal SaaS app for structured intake, classification, and triage of client requests. Email & password auth, role-based access (Submitter, PM, Viewer, Admin).

## 1. Backend Setup (Lovable Cloud + Supabase)

**Auth**: Email & password signup/login with protected routes.

**Database tables**:
- `user_roles` — role-based access (admin, pm, submitter, viewer) using enum + security definer function
- `requests` — all intake fields (title, description, source/customer, urgency, impact, workaround, size_estimate, request_type, status, category, date_received, submitter_id). Soft-delete only.
- `sprint_interrupts` — interrupt reason, category confirmation, deprioritised items, created_by, timestamp
- `triage_sessions` — scheduled date, status, notes
- `audit_log` — who changed what, when (immutable)
- `sprints` — sprint name, start/end dates, status

**RLS policies**: Submitters can create & view own requests. PMs/Admins can classify, triage, and manage all. Viewers can read sprint candidates only.

## 2. Pages & Navigation

Clean sidebar navigation with role-aware menu items:

- **Dashboard** — summary stats: intake volume by category, sprint interrupt rate, triage cadence compliance charts
- **Submit Request** — the intake form (mobile-friendly)
- **Intake Queue** — list of all incoming requests with filters (status, urgency, category)
- **Classification Panel** (PM/Admin only) — assign/override categories, bulk classify
- **Triage Queue** — classified items awaiting triage, sorted by urgency
- **Sprint Board** — Kanban or list view of sprint candidates and in-sprint items
- **Interrupt Log** — visible to all, shows all sprint interrupts with trade-off records
- **Settings** (Admin only) — manage categories, triage schedule, user roles

## 3. Core Workflows

### Intake Form
- All required fields from PRD (title, description, source, urgency, impact, workaround)
- Optional: size estimate, request type (initial self-assessment)
- Auto-captures date and submitter
- Works fully on mobile

### Classification (PM/Admin)
- PM-only panel to assign category: 🔴 Production Bug, 🟠 Client Commitment, 🟡 Usability Issue, 🔵 New Feature, ⚙️ Tech Enabler
- Bulk classify: select multiple → apply category
- Override submitter's initial type assessment

### Triage View
- Shows classified, not-yet-triaged items sorted by urgency
- PM promotes items to "Sprint Candidate" or parks/defers them
- Status lifecycle: Intake → Classified → In Triage → Sprint Candidate → In Sprint → Done / Deferred

### Sprint Interrupt Flow
- "Interrupt" button on Sprint Candidate or Classified items (PM only)
- Modal requires: reason, category confirmation (🔴/🟠/🟡 only), mandatory deprioritisation field
- Deferred items surface prominently at next triage session
- Interrupt log visible to all on sprint view

## 4. Dashboard Analytics
- Intake volume by category (bar/pie chart)
- Sprint interrupt rate (target < 15%)
- Triage cadence compliance tracker
- Avg time from received → classified

## 5. Design & UX
- Clean, minimal aesthetic (Linear/Notion-inspired)
- Light theme, ample whitespace
- Color-coded category badges (🔴🟠🟡🔵⚙️)
- Responsive: intake form fully functional on mobile, dashboard view-only acceptable on mobile

