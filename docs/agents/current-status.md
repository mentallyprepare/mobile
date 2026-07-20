# Mentally Prepare — Mobile Program Status

_Last updated: 2026-07-20._

## Source of truth

This repository is the native application and version-controlled backend source. The legacy Express/SQLite web backend is historical reference only and must not be connected to, copied into, or deployed by this app.

## Approved direction

- Expo SDK 56 with Expo Router and TypeScript.
- New Supabase/PostgreSQL backend under `supabase/`.
- Email OTP authentication; account creation remains closed until age and consent intake is implemented.
- Publishable client key only. The service-role key must never enter Expo code or builds.
- Private drafts and sealed writing are author-only. Partners receive presence and approved reveal projections, never raw writing.
- Matching, sealing, presence, blocking, moderation, notifications, export, and deletion are trusted operations.
- Local development first. No hosted project, production migration, deployment, notification, or real-user connection without a separate Rashmi approval.

## Implemented on `codex/mp-006-supabase-foundation`

- Version-controlled schema migration covering identity projections, consent, matching, rituals, drafts, sealed entries, presence, reveals, safety, moderation, notifications, deletion, and audit records.
- Deny-by-default privileges and RLS policies.
- Transactional draft conflict detection, idempotent sealing, minimum presence projection, and immediate block boundary.
- pgTAP schema/privilege and adversarial-identity tests ready for the local Supabase stack.
- Typed Supabase mobile client with fail-closed environment configuration.
- Native session persistence in chunked SecureStore; web sessions are memory-only.
- Email-code sign-in, auth route gating, Tonight writes, safe constellation metadata, profile summary, and sign-out use the new data layer.
- The legacy bearer-token `/api/*` client and tests were removed.
- GitHub verification workflow starts an isolated Supabase stack, rebuilds the database, runs pgTAP, and then destroys the stack.

## Verification

- TypeScript and ESLint: passed.
- Four backend/CI contract tests and nine sky tests: passed.
- Full `supabase db reset` and `supabase test db`: pending because Docker and Supabase CLI are not installed on this machine.

## Next gate

Run the new verification workflow on the branch (or install Docker Desktop locally), fix any migration/runtime findings, then review the schema and auth flow before creating a hosted development project.
