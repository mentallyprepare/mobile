# Decision — The Express backend stays. Supabase PRs closed.

Decided by Anushka, 20 July 2026, reviewing draft PRs #1–#3 (`codex/mp-006` → `mp-008`).

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
