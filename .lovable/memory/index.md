# Project Memory

## Core
Client Request Triage Dashboard SaaS. Clean & minimal design (light theme).
Email/password auth. Roles: admin, pm, submitter, viewer via user_roles table.
Lovable Cloud backend. Categories: 🔴Bug 🟠Commitment 🟡Usability 🔵Feature ⚙️Enabler.
Status lifecycle: Intake→Classified→In Triage→Sprint Candidate→In Sprint→Done/Deferred.
Role display names: admin→Admin, pm→Product, submitter→CSM Team. Viewer hidden from UI.

## Memories
- [Auth flow](mem://features/auth) — Email/password, auto-profile on signup, default role=submitter
- [DB schema](mem://features/db-schema) — 7 tables: profiles, user_roles, requests, sprints, sprint_interrupts, triage_sessions, audit_log
- [Invitations](mem://features/invitations) — invitations table, invite-user edge function, handle_new_user checks invitations for role
- [Filters & views](mem://features/filters) — RequestFilters component, contextual tabs per role on IntakeQueue/Classification/SprintBoard
