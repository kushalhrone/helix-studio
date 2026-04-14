

# Role-Based Access Control — Strict Enforcement

Currently the sidebar shows most pages to all users, and route protection is inconsistent. This plan locks down navigation, routes, and page content per role.

## Role Access Matrix

```text
Page / Feature           Admin    Product (pm)    CSM Team (submitter)
─────────────────────────────────────────────────────────────────────
Dashboard                ✓ full   ✓ full          ✓ own requests only
Submit Request           ✓        ✗               ✓
Intake Queue             ✓        ✓ all           ✓ own requests only
Classification           ✓        ✓               ✗
Triage Queue             ✓        ✓               ✗
Sprint Board             ✓        ✓               ✓ read-only
Interrupt Log            ✓        ✓               ✓ read-only
Settings (invite/roles)  ✓        ✗               ✗
```

## Changes

### 1. Sidebar — Role-aware navigation
- **CSM Team** sees: Dashboard, Submit Request, Intake Queue (own), Sprint Board (read-only), Interrupt Log (read-only)
- **Product** sees: Dashboard, Intake Queue, Classification, Triage Queue, Sprint Board, Interrupt Log — no Submit Request
- **Admin** sees everything
- Each nav item gets a `roles` array; sidebar filters based on current user role

### 2. Route protection in App.tsx
- Add a generic `allowedRoles` prop to `ProtectedRoute` instead of just `requirePm`/`requireAdmin`
- `/submit` — only `admin` and `submitter`
- `/classify`, `/triage` — only `admin` and `pm`
- `/settings` — only `admin`
- `/sprints`, `/interrupts` — all authenticated (but UI restricts actions)

### 3. Dashboard — Role-aware content
- **CSM Team**: Show only their own submitted requests summary (count by status, recent requests list). Hide charts that require all-requests data.
- **Product / Admin**: Show full analytics dashboard as-is.

### 4. Sprint Board & Interrupt Log — Read-only for CSM
- Hide "Create Sprint", "Add to Sprint", and interrupt action buttons when user is CSM (not `isPmOrAdmin`)
- CSM can view sprint contents and interrupt history but cannot modify

### 5. Intake Queue — CSM sees only own requests
- Already handled by RLS (submitters can only SELECT their own requests), but reinforce in UI: remove "All Requests" tab for CSM users, default to "My Requests"

## Files Modified
- `src/components/AppSidebar.tsx` — role-filtered nav items
- `src/App.tsx` — updated `ProtectedRoute` with role arrays
- `src/pages/Dashboard.tsx` — conditional content per role
- `src/pages/SprintBoard.tsx` — hide mutation UI for CSM
- `src/pages/InterruptLog.tsx` — hide create UI for CSM
- `src/pages/IntakeQueue.tsx` — CSM defaults to own requests only
- `src/contexts/AuthContext.tsx` — no changes needed (already has `isCsm`, `isProduct`, `isPmOrAdmin`)

No database changes required — RLS already enforces data access correctly.

