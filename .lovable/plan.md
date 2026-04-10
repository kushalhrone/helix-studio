

# Role Renaming, Email Invitations & Smart Views

## Overview

Three main changes: (1) rename the 3 visible roles to Admin / CSM Team / Product, (2) add an invite-users-by-email flow in Settings, (3) add universal filter bars + auto-generated contextual views per role.

---

## 1. Role Display Renaming (UI-only)

The DB keeps `admin`, `pm`, `submitter` enums unchanged. A new `ROLE_DISPLAY` map translates them:

```text
admin     → "Admin"
pm        → "Product"
submitter → "CSM Team"
viewer    → (hidden from UI)
```

**Files changed:**
- `src/lib/constants.ts` — add `ROLE_DISPLAY` map
- `src/pages/Settings.tsx` — use display names in role selector, hide "viewer"
- `src/components/AppSidebar.tsx` — show role label under user name
- `src/contexts/AuthContext.tsx` — add `isProduct` helper (alias for `isPmOrAdmin`)

**Access mapping stays the same:**
- Admin → full access + Settings + invite users
- Product (`pm` in DB) → Classification, Triage Queue, Sprint Board
- CSM Team (`submitter` in DB) → Submit Request, view own requests

---

## 2. Email Invitations

Admin can invite users by email from Settings. An edge function sends invite emails via Supabase Auth's `inviteUserByEmail` (using service role key). The invited user gets an email, clicks the link, sets their password, and lands in the app with the pre-assigned role.

**Database migration:**
- Create `invitations` table: `id`, `email`, `role` (app_role), `invited_by` (uuid), `status` (pending/accepted), `created_at`
- RLS: admins can insert/select, no public access

**Edge function:** `supabase/functions/invite-user/index.ts`
- Accepts `{ email, role, displayName? }`
- Calls `supabase.auth.admin.inviteUserByEmail()`
- Inserts row into `invitations` table
- Supports bulk: accepts array of `{ email, role }` for mass invites

**UI in Settings:**
- New "Invite Users" card with:
  - Multi-row form: email + role selector per row, "Add another" button
  - "Send Invitations" button
  - Table of pending/accepted invitations below

**Post-signup trigger update:**
- Update `handle_new_user` function to check `invitations` table for matching email and assign the invited role instead of default "submitter"

---

## 3. Universal Filter Bar Component

Create a reusable `<RequestFilters>` component used across all list pages.

**Filters available:**
- Status (dropdown)
- Urgency / Priority (dropdown)
- Category (dropdown)
- Customer / Source (searchable dropdown, populated from distinct `source_customer` values)

**Files:**
- `src/components/RequestFilters.tsx` — the reusable filter bar
- Applied to: IntakeQueue, Classification, TriageQueue, SprintBoard

---

## 4. Smart Auto-Views (Tabs per role context)

Instead of saved views, each page gets contextual tab views that auto-filter.

### CSM Team views (IntakeQueue page):
- **My Requests** tab — all requests submitted by current user
- **By Status** — grouped/filtered by status to track progress
- **By Customer** — filter by source_customer

### Product views (Classification page):
- **Unclassified** tab — requests in "intake" status (default)
- **By Category** tabs — one tab per category (Bugs, Features, etc.) showing classified requests in that category
- **All Classified** — everything that's been classified

### Everyone views (SprintBoard):
- **All Requests** — master view with all filters
- **By Customer** — requests grouped by source_customer with status indicators
- **In Progress** — requests currently in sprint

**Implementation:** Tabs component at the top of each page, each tab sets filter presets on the shared `<RequestFilters>` component. No database table needed — views are computed from filters.

---

## Technical Details

### Migration SQL
```sql
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role app_role NOT NULL DEFAULT 'submitter',
  invited_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage invitations" ON public.invitations
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
```

### Updated handle_new_user trigger
Check invitations table for matching email, use that role if found, otherwise default to 'submitter'. Mark invitation as 'accepted'.

### Edge function: invite-user
- Validates admin auth via JWT
- Loops through array of invitees
- Calls `supabase.auth.admin.inviteUserByEmail()` for each
- Records in invitations table

### Files created/modified
- **New:** `src/components/RequestFilters.tsx`, `supabase/functions/invite-user/index.ts`
- **Modified:** `src/lib/constants.ts`, `src/pages/Settings.tsx`, `src/pages/IntakeQueue.tsx`, `src/pages/Classification.tsx`, `src/pages/SprintBoard.tsx`, `src/pages/TriageQueue.tsx`, `src/components/AppSidebar.tsx`, `src/contexts/AuthContext.tsx`
- **Migration:** invitations table + updated handle_new_user trigger

