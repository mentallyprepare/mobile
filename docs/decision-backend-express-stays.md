# Decision — The Express backend stays. Supabase PRs closed.

Decided by Anushka, 20 July 2026, reviewing draft PRs #1–#3 (`codex/mp-006` → `mp-008`).

> ## Reversed by Anushka, 25 July 2026.
>
> The 20 Jul decision is superseded. New target: **Cloudflare Pages** for the
> web surface (marketing + web export of the app), **Render** for the Express
> service (moved off Railway), **Supabase** for Postgres + auth. Mobile
> continues talking to Express; Express is backed by Supabase Postgres
> instead of `better-sqlite3` and can delegate auth to Supabase Auth.
>
> This is a real replatform, not a token swap. The salvage list below is now
> in-scope, not "for later." The invisible-machine rules and the never-build
> list (`master-brief-the-quiet-app.md`) are unchanged — the platform
> changes; the product does not.
>
> **What has to happen before any migration touches live data:**
>
> 1. A dated data-migration plan for the ~existing users on SQLite → Supabase,
>    including a full backup and a dry-run against a Supabase project that is
>    NOT the production one.
> 2. Bearer-token auth (already shipped in web commit `861d875`, un-deployed)
>    either stays as the auth path OR is retired in favour of Supabase Auth —
>    not both at once. Two auth systems on one user pool is exactly what the
>    original decision was protecting against.
> 3. The Supabase branches (`codex/mp-006` → `mp-008` and `mp-009`) are
>    **reference only** until re-reviewed against the salvage list. They were
>    closed for direction, not quality; some pieces are re-usable, others
>    were built against the abandoned schema.
>
> The prompt to hand Claude Code / Codex for this migration is
> `docs/prompt-cf-render-supabase-migration.md`. That prompt is the source
> of truth for how the migration is executed; edit it there, not by
> ad-hoc instructions.
>
> This reversal is Anushka's choice, made explicitly when asked. The 20 Jul
> reasoning below is preserved verbatim, because it is still the argument
> the migration has to answer to — not to overturn silently.

---

## Original decision, 20 July 2026 (preserved)

## The decision

The product has **one backend**: the existing Express/SQLite service in the web
repo (github.com/mentallyprepare/mentallyprepare), live at mymentallyprepare.com.
The mobile app is a **client of it**, over bearer tokens. The Supabase
foundation built in PRs #1–#3 is **not merged** and is not the direction.

This re-affirms the locked decision of 2026-07-11 ("reuse the existing Express
backend; no new backend service"), which PR #1 had deleted from the record.

## Why

- **One user pool or no product.** The live users are in Express/SQLite. A
  mobile app on a fresh Supabase database is a second, empty universe: a mobile
  user could never be matched with a web user, and matching strangers is the
  product.
- The bearer-token bridge (web `861d875`, mobile `ecb2138`/`2b397de`) was
  verified end-to-end against the real backend days before these PRs.
- The migration cost of replatforming (web app, live user data, cron/matching/
  crisis machinery) was not priced anywhere in the PRs.
- The PRs' own database gate (`npm run test:db`, pgTAP) has never executed —
  no Docker/local Postgres on this machine — so the schema was unverified.

Replatforming to Supabase remains a *legitimate strategic option*. If it is
ever chosen, it is chosen explicitly, priced as a whole-product migration, and
starts from a data-migration plan for live users — not from a mobile-side PR.

## Salvage list (good work in those branches, re-homed as Express-side items)

1. **Consent-before-account flow** — age + terms + privacy captured at
   sign-up and recorded server-side. The UI in `mp-008` is good; the web
   backend already has the consent columns.
2. **Draft-revision seal model** — client-generated draft id + seal key with
   server revision checks makes sealing idempotent and safe against double-tap
   and retries. Worth porting to `POST /api/entry`.
3. **Presence-only partner projection** — `/api/me` currently sends partner
   entry *text* to the client; the sky needs day numbers and timestamps only.
   Add a mobile-scoped projection that strips partner text. (Matches the
   Living Night phase 2 rule: positions only, never content.)
4. **Email-code (OTP) sign-in** — passwordless codes are a good fit for the
   product's tone; can be built on the existing SMTP path.
5. **Adversarial ownership tests** — the spirit of the pgTAP RLS suite,
   applied as an IDOR test pass over the Express `:id` routes (Slice 0.5.3).

The branches are left in place for reference; nothing is deleted.

## Governance note

PR #1 also rewrote decision records: it deleted the locked-decisions document
(declaring the Express backend "historical reference only") and silently
reversed the 18 July compatibility-score decision. Workstreams do not overturn
recorded decisions; they propose. Anushka separately chose on 20 July to adopt
the score reversal as her own decision — see
`decision-stardust-vs-living-night.md` — so that outcome stands on her
authority, not the PR's.
