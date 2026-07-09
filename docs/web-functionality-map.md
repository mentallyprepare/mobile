# Mentally Prepare — Web Functionality Map

Generated 7 July 2026 from the live web codebase (commit `6933020`). 120 HTTP routes, 34 tables, 7 cron jobs, 26 app screens. This maps the **web app** (separate repo), which the native app talks to as its backend. Paths below are relative to the web repo.

## What the app is
Anonymous 21-day peer journaling for Indian college students. Match with a stranger from another college, both answer a nightly prompt, entries seal until midnight IST, Day 21 both choose whether to reveal identity. Live at mymentallyprepare.com.

## User journey, end to end
1. Land — `public/index.html` (marketing) or `public/app.html` (app shell).
2. Sign up / log in — email+password (bcrypt, 8-char min) or Google via Firebase (`routes/auth.js`). Email verification links, password reset with 15-min hashed codes over SMTP (`lib/email.js`, `email-templates.js`).
3. ECP-11 scan — 11-question archetype quiz, result stored via `POST /api/scan`, snapshot in `archetype_snapshots`. Can be taken before signup (pending scan in localStorage).
4. Waiting state — until matched: Tonight's Question (`routes/tonights-question.js`), Silent Room, waiting entries (`routes/waiting-entry.js`). Matching is manual/admin-triggered or via `POST /admin/run-matching`.
5. The 21 days — nightly prompt on Today screen, entry sealed via `POST /api/entry` (empty rejected, crisis keywords screened server-side, PII flagged). Partner's entry unseals at midnight IST. Reactions and comments per entry. Mood picker. Word count.
6. Day 21 reveal — `POST /api/reveal`, both must opt in (`reveals` table). Then optional continue-solo.
7. Safety anytime — block partner, report entry (`reports`, `blocked_users`), rematch request, crisis helplines by locale, `crisis_review` queue for human review, urgent-help link on every auth screen.

## Backend map (the API the native app consumes)
- `server.js` — bootstrap, all 34 `CREATE TABLE`s, helmet CSP, sessions (SQLite store, 7-day cookie), rate limiters, compression + static caching, Firebase auth helper proxy, crisis keyword screening, push sending, cron. Health: `/api/health`, `/api/ready`.
- `routes/auth.js` — signup, login, Google exchange, verify-email, forgot/reset password.
- `routes/app.js` — the core API (28 routes): `/api/me` (state), `/api/entry`, `/api/scan`, `/api/reveal`, block/report/rematch/switch-partner, push subscribe/preferences, profile, consent + GDPR endpoints (`/api/my-data`, `DELETE /api/account`, `deletion_log`), dev helpers.
- `routes/silent.js` — Silent Room: one-line posts with approval queue, resonance, presence count, admin moderation.
- `routes/tonights-question.js` — nightly community prompt for unmatched users.
- `routes/wall.js` — Wall: posts per question, reactions, match requests between wall users.
- `routes/rooms.js` — Rooms: themed card spaces, comments, reactions, reports, freeze/moderation.
- `routes/waiting-entry.js`, `routes/waitlist.js` — pre-match writing and waitlist capture.
- `routes/payments.js` — Razorpay (order + HMAC verify) and Stripe (raw-body webhook). Plumbed, not gating anything yet.
- `routes/admin.js` — stats, users, reports queue, matching controls, re-engagement email suggestions, logs, activity, export, invite, push broadcast. Auth: `x-admin-key` header, timing-safe.
- `routes/static.js` — page serving.
- `lib/` — config, email (Hostinger SMTP), note library. `scripts/` — backup, broadcast, seeds, smoke tests.

## Cron (IST, in-process via node-cron)
8:30am morning push · 9pm not-written-yet email + push + quiet-partner nudges · 10pm "partner wrote" conditional push (rotating copy) · midnight unseals · 10:30pm Silent Room push · 11am inactive 24h/48h pushes · 4am DB backup.

## Data (SQLite, better-sqlite3, volume at /data/db)
Core: `users`, `matches`, `entries`, `reveals`, `archetype_snapshots`, `daily_notes`, `reactions`, `comments`, `nudges`. Safety: `reports`, `report_status_history`, `blocked_users`, `rematch_requests`, `crisis_review`, `deletion_log`. Community: `silent_lines`, `silent_resonance`, `tonights_question_entries`, `waiting_entries`, `wall_*` (5), `rooms`/`room_*` (4), `sealed_room_picks`. Growth/ops: `analytics_events`, `payments`, `waitlist`, `reminder_signups`, `password_reset_tokens`.

## For the native app
- `/api/me` is the single state endpoint — one call returns user, match, entries, partner entries, partner status, streak, reveal, comments, reactions, nudges. It already exposes `partnerStatus.partnerHasWrittenToday` (the presence-moon signal).
- Auth is session-cookie based today. The native app will need token auth or cookie handling; confirm the approach before wiring login.
- FCM: server prereq is an `fcm_token` column on users and `sendGentlePush` trying FCM → web push → email.
