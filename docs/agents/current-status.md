# Mentally Prepare — Mobile Program Status

_Living document. Reflects implemented/decided reality only — not speculation._
_Last updated: 2026-07-11 (Slice 0.5 kickoff)._

## Repos in play
- **Backend (reused):** `C:\Users\anush\OneDrive\Desktop\mentally prepare app 1\New folder` — Node/Express + better-sqlite3 monolith. The 21-night product logic lives here and is being extended, not rewritten.
- **Mobile (net-new):** `C:\Users\anush\mentally-prepare-mobile` — Expo SDK 56 / expo-router / TS strict. Currently a bare scaffold.
- **Retire:** `MentallyPrepare`, `mentallyprepare-1`, `mentallyprepare-app`, `mentallyprepare-repo` (stale web prototypes) — pending Rashmi go-ahead to archive.

## Locked decisions (2026-07-11)
1. **Reuse the existing Express backend**; add a versioned, native-safe mobile API layer on top (bearer tokens, typed contracts, encryption-at-rest). No new backend service.
2. **Native auth = bearer tokens.** Web keeps express-session cookies unchanged. Mobile sends `Authorization: Bearer`. Tokens stored in `expo-secure-store`.
3. **Mobile brand = dark "Living Night"** (`#050311`), per the committed scaffold. Web keeps its light cream/amber brand.
4. **Encrypt private writing at rest before beta** (entries, drafts, crisis content) — lands in Slice 0.5, with documented key handling.

## Audit headlines (Slice 0)
- Backend is mature and reusable: auth (email+Google), 21-day journey, matching+reveal, Wall/Rooms/Silent Room, payments, push/PWA, admin, export, deletion.
- **P0s:** mobile app ~0% built; backend not yet native-consumable (was cookie-only); private entries stored plaintext (`server.js:435`).
- **P1s:** single shared admin password, no moderator/support roles or audit (`server.js:2794`); account deletion unreachable for Google-only users (`routes/app.js:1210`); no migration system; per-endpoint IDOR ownership checks need a verification pass; confirm `.session-secret`/`.vapid-keys.json` are git-untracked.
- **Correction to first-pass audit:** consent/age fields DO exist on `users` (`consent_age_confirmed`, `consent_policy_version`, `consent_given`), and a `crisis_review` table exists (`server.js:662`) — so age/consent capture and crisis-flagging are partially present, not absent.

## Build order
Phase 0 (decisions ✓) → **Slice 0.5 backend beta-hardening** → Slice 1 mobile foundation → 2 auth → 3 onboarding+scan → 4 matching → 5 Day 1 → 6 progression → 7 interruption → 8 report/block → 9 unseal/reveal → 10 notifications → 11 profile/export/deletion → 12 admin(RBAC) → 13 beta readiness.

## Slice 0.5 progress (backend beta-hardening)
| Unit | Work | Status | Evidence |
| --- | --- | --- | --- |
| 0.5.1 | Bearer-token core (`lib/tokens.js`) | **Done** | `node test/tokens.test.js` → 8/8 pass; `node scripts/check-syntax.js` → pass |
| 0.5.2 | Wire bearer into `requireAuth` (server.js:1562) + issue tokens in `establishSession` path (auth.js:133) + return on login/register/google; add `/api/auth/token/refresh` + `/api/auth/token` on logout revoke note | Next | — |
| 0.5.3 | IDOR ownership-check pass across `:id` routes | Todo | — |
| 0.5.4 | Encryption-at-rest for entries/drafts/crisis content + migration runner | Todo | — |
| 0.5.5 | Minimal RBAC (moderator/support) + audit events; Google-user deletion fix; age/consent completeness | Todo | — |
| 0.5.6 | Staging env + `.env.example` (`AUTH_TOKEN_SECRET`) + envs separation | Todo | — |

## Open approval gates (Section 38 — do NOT act without Rashmi)
- Archiving the 4 stale repos.
- Any production deploy / real push / inviting real beta users.
- Schema migration against production data (encryption rollout).

## Next action
Implement Unit 0.5.2 (bearer verification in `requireAuth` via the non-enumerable `req.session.userId` shim so all 72 existing read-sites work unchanged; token issuance at the 3 auth responses; refresh endpoint), then integration-test the token→protected-route flow.
