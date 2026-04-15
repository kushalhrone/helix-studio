

# User Management UX Overhaul

## Changes

### 1. Tabbed Layout
Replace stacked cards with a `Tabs` component containing three tabs:
- **Team Members** — active users table (default tab)
- **Invitations** — pending/accepted invitations table
- **Invite New** — the invite form

Add a header bar with page title, total user count badge, and a prominent "Invite Users" button that switches to the Invite New tab.

### 2. Visual Polish
- **User avatars**: Show initials-based `Avatar` circles next to each user name
- **Stats row**: Show counts at top — "X active users", "Y pending invitations"
- **Loading skeletons**: Show `Skeleton` rows while queries load
- **Empty states**: Illustrated empty states with icon + message for each tab
- **Smooth transitions**: Add fade/slide animation when switching tabs
- **User count badge** on Team Members tab header

### 3. Confirmation Dialogs
- **Role change**: `AlertDialog` asking "Change [Name]'s role from [Current] to [New]?" before mutating
- **Delete invitation**: Add a cancel/revoke button on pending invitations with confirmation
- **Bulk role change**: Checkbox selection on user rows + bulk role assignment with confirmation

### 4. Better Invite Flow
- **Inline email validation**: Real-time format check, duplicate detection against existing users/invitations
- **Success animation**: Green checkmark animation after invites sent, auto-switch to Invitations tab
- **Copy invite link**: Button to copy a signup link (pre-filled with role) to clipboard
- **Keyboard support**: Enter key adds a new row, Ctrl+Enter sends all

## Files Modified
- `src/pages/UserManagement.tsx` — full rewrite with tabs, avatars, dialogs, validation, skeletons

No database changes needed.

