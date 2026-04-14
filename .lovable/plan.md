

# User Management Page + Role Mapping

## Current State
The Settings page (`/settings`) already contains both "Invite Users" and "User Role Management" cards. The role display mapping (`admin` → Admin, `pm` → Product, `submitter` → CSM Team) is already in `constants.ts`. The invite edge function and invitation table are working.

## What This Plan Does
Extract user management into a dedicated `/users` page with improved UX, keeping Settings for app config only.

## Changes

### 1. New User Management Page (`src/pages/UserManagement.tsx`)
- **Invite section** (top): Multi-row email + role form with bulk send — moved from Settings
- **Active Users table**: Name, email, role badge, role change dropdown, last active date
- **Pending Invitations table**: Email, assigned role, status (pending/accepted), sent date, resend button
- Search/filter bar to find users by name or email
- Admin-only access (same as Settings)

### 2. Sidebar & Routing Updates
- Add "User Management" nav item under Admin group (admin-only), with `Users` icon
- Add `/users` route in `App.tsx` with `allowedRoles={["admin"]}`
- Remove invite and role management cards from `Settings.tsx` (keep Settings for future app-level config)

### 3. Role Display Enhancements
- Show role as colored badges: Admin (purple), Product (blue), CSM Team (green)
- Role descriptions shown as tooltips: "Admin — Full access + user management", "Product — Classify & triage requests", "CSM Team — Submit & track requests"

### 4. Resend Invitation
- Add a "Resend" button on pending invitations that re-invokes the `invite-user` edge function for that email

## Files
- **New:** `src/pages/UserManagement.tsx`
- **Modified:** `src/App.tsx` (add route), `src/components/AppSidebar.tsx` (add nav item), `src/pages/Settings.tsx` (remove user cards)

No database changes needed.
