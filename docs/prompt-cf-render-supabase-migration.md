# Prompt — Cloudflare + Render + Supabase migration

Paste this into Claude Code or Codex, in the mobile repo working tree, once
the web repo is checked out at a known-clean commit alongside it. Save any
edits back to this file — the prompt is versioned, not an ad-hoc paste.

The reversal that makes this migration in-scope is recorded in
`docs/decision-backend-express-stays.md` (Anushka, 25 Jul 2026). Read that
first.

---

## The prompt

> You are executing a platform migration for Mentally Prepare, an anonymous
> 21-day peer journaling app for Indian college students, live at
> mymentallyprepare.com with real users. Before doing anything else, read
> these files, in this order, and treat them as the source of truth. If any
> instruction I give you here conflicts with any of them, stop and ask.
>
> - `CLAUDE.md`
> - `docs/directive-native-social-app.md` — especially the reconciliation
>   ledger, and ledger item 9 (the 25 Jul all-dark amendment)
> - `docs/decision-backend-express-stays.md` — read the top block first; it
>   records the reversal that makes this migration in-scope
> - `docs/decision-stardust-vs-living-night.md`
> - `docs/master-brief-the-quiet-app.md` — the invisible-machine rules
> - `docs/state-of-the-app.md`
> - `docs/api-gaps.md`
> - `docs/web-functionality-map.md`
> - the web repo's `server.js` and `routes/`
> - the web repo's schema (the `CREATE TABLE`s in `server.js`)
>
> **The goal.** Move the platform, not the product. Same features, same live
> users, same URLs to the end user.
>
> - **Cloudflare Pages** hosts the web surface: the marketing site at
>   `mymentallyprepare.com` and the Expo web export used for structural
>   preview.
> - **Render** hosts the Express service (`api.mymentallyprepare.com`,
>   moved off Railway). Same code, new home.
> - **Supabase** provides Postgres (replacing `better-sqlite3`) and,
>   optionally, Supabase Auth (replacing hand-rolled bcrypt + Firebase
>   Google). Do NOT roll out Supabase Auth in the same slice as the
>   Postgres move.
> - **GitHub Actions** wires deploys: pushes to `main` in the web repo
>   trigger Render + Cloudflare Pages; pushes to `main` in the mobile repo
>   only ship EAS builds when explicitly tagged.
>
> All services on their free tier. If you hit a limit and the only way past
> it is a paid plan, STOP and tell me — do not upgrade anything on my
> behalf.
>
> ## Sequencing — reversible slices, not one migration
>
> Do NOT attempt to move everything at once. Work in the order below. Each
> slice ends with a working system I can retest before the next slice
> starts. If a slice fails, we roll back to the previous one; that is only
> possible because they are sequenced this way.
>
> 1. **Snapshot and instrument.**
>    - Full backup of the live SQLite DB (`/data/db/*.db`) to a
>      timestamped file in a directory I confirm is safe. Print its full
>      path and its SHA-256. Do NOT overwrite an earlier snapshot.
>    - Add a `DEPLOY_TARGET` env var to the Express service (values:
>      `railway`, `render`) so the two deploys can differ without a code
>      fork.
>    - Verify `npm test` on both repos passes on `main` before you touch
>      anything.
> 2. **Provision Supabase, empty.**
>    - Create two Supabase projects: `mentallyprepare-staging` and
>      `mentallyprepare-production`. Never run a schema change against the
>      production one until the staging one has passed the same change.
>    - Author `migrations/` in the web repo as forward-only SQL files, one
>      per feature area. Every `CREATE TABLE` must be `IF NOT EXISTS`, every
>      `ALTER TABLE ADD COLUMN` must be guarded (Postgres supports
>      `ADD COLUMN IF NOT EXISTS` since 9.6). Ledger item in
>      `decision-stardust-vs-living-night.md` explicitly calls out
>      unguarded ALTERs as a bug that has already bitten this project.
>    - The 34 SQLite tables from `server.js` map to Postgres schema; produce
>      the mapping as a table in a new `docs/migration-schema-map.md`
>      before writing SQL. Types differ (SQLite is dynamic;
>      Postgres is not). Nothing runs against production until I read that
>      doc.
> 3. **Dual-write in staging.**
>    - Point the staging Express at Supabase-staging. Write a `db.js`
>      abstraction that lets `better-sqlite3` and `pg` sit behind the same
>      query surface. Run the app against both, comparing responses on the
>      100 most-hit routes. Deltas get logged, not swallowed.
>    - Do NOT dual-write in production. That direction is one-way.
> 4. **Render deploy of the Express service.**
>    - `render.yaml` at the web repo root. Persistent disk for the SQLite
>      backup only. Health check at `/api/health`. Autoscaling off.
>    - Secrets set via the Render dashboard, NOT committed. If you find any
>      secret in git history, stop and tell me.
>    - Verify `curl https://api.mymentallyprepare.com/api/health` returns
>      200 from the Render deploy before touching DNS.
> 5. **Cloudflare Pages for the web surface.**
>    - Project name `mentallyprepare-web`. Build command: `npm run build`
>      (add one if it does not exist). Publish directory: whatever the web
>      repo's existing static output is. DO NOT change the build to fit
>      Cloudflare; make Cloudflare fit the build.
>    - Marketing at `mymentallyprepare.com`, app export at
>      `app.mymentallyprepare.com`. DNS changes are the LAST step in this
>      slice.
> 6. **Data migration to Supabase-production.**
>    - Only after slices 1–5 are live and stable for at least seven
>      calendar days.
>    - This is the irreversible step. It gets its own document
>      (`docs/migration-plan-live-data.md`) and its own approval from me
>      before it runs. The plan must include: pre-flight checks, the exact
>      SQL, the rollback procedure, and the expected downtime window
>      (target: zero, via read-only mode on the old DB during the cutover).
> 7. **Supabase Auth (optional, LAST).**
>    - A separate migration entirely. Do not begin until slice 6 has been
>      stable for a further seven days. Two auth systems on one user pool
>      is exactly what the closed 20 Jul decision was protecting against,
>      and remains a real hazard.
>
> ## What does not change under any circumstances
>
> - The invisible-machine rules (`master-brief-the-quiet-app.md` §
>   "invisible-machine rules"). No AI language, no first-person machine
>   voice, no fabricated numbers, latency is atmosphere, human wins ties.
> - The never-build list — compatibility scores stay forbidden
>   (re-affirmed 20 Jul), no follower graphs, no infinite feeds, no
>   synthetic activity.
> - The all-dark visual amendment (`directive-native-social-app.md` ledger
>   item 9). Do NOT touch mobile screens as part of this migration; that is
>   a different slice on a different branch.
> - `brand/` and `assets/images/`. Do NOT regenerate rasters. Do NOT edit
>   `brand/logo-mark.svg`.
>
> ## Safety guardrails — non-negotiable
>
> These apply to every command you run, every file you touch, every
> external call. Treat them as errors if you catch yourself about to break
> them.
>
> 1. **Ask before deleting anything.** Never `rm`, `rm -rf`, `git clean`,
>    `git reset --hard`, `DROP TABLE`, `DROP DATABASE`, `TRUNCATE`, or any
>    equivalent, without asking me first and getting a "yes" back in the
>    same session. Move-to-trash counts as deletion.
> 2. **Never touch anything outside the two repo trees.** The two repos
>    are `C:\Users\anush\mentally-prepare-mobile` (mobile) and
>    `C:\Users\anush\OneDrive\Desktop\mentally prepare app 1\New folder`
>    (web). Everything else on the disk is off-limits. Never `cd` up out
>    of these. Never write to `~`, `%APPDATA%`, `%LOCALAPPDATA%`,
>    `/etc`, `/usr`, `System32`, or any global config unless I explicitly
>    ask.
> 3. **Never modify `.env`, `.env.*`, `.session-secret`, `.vapid-keys.json`,
>    or any file matching `*secret*` / `*credential*` / `*.pem` / `*.key`.**
>    If a secret needs to change, tell me and I do it by hand.
> 4. **Never commit to `main` directly.** Every change goes on a branch
>    named `migration/<slice-number>-<what>`. Every branch merges via PR.
>    Never `git push --force`. Never rewrite history on a shared branch.
> 5. **Never modify `docs/decision-*.md`, `docs/directive-*.md`,
>    `docs/the-version.md`, or `CLAUDE.md`** — those are decision records
>    Anushka owns. Propose text; do not write it in.
> 6. **Never run destructive database commands against production.** If a
>    command would write to production Postgres, stop and print the
>    command, the target URL, and the reason. I approve or reject each one
>    interactively.
> 7. **Never install a global npm/pip/system package** (`npm i -g`,
>    `pip install --user`, `brew install`, `winget install`, `choco install`).
>    Repo-local `devDependencies` only.
> 8. **Never call `sudo`, `runas`, `Set-ExecutionPolicy`, or ask for
>    admin rights.** Not needed for anything in this plan.
> 9. **Never disable an existing test to make the tree pass.** Never
>    delete a test file. Fix the test or fix the code.
> 10. **Rate-limit yourself on paid APIs.** The stack is free-tier; if a
>     call would push past a free-tier limit, stop and tell me.
>
> ## Output shape for each slice
>
> When you begin a slice, print, in this exact order:
>
> 1. The slice number and title from the sequencing above.
> 2. Every file you plan to create or modify, as a bulleted list.
> 3. Every external command you plan to run, in order, with the working
>    directory each will run in.
> 4. **Wait for me to approve or amend the plan** before touching the disk
>    or the network.
>
> When you finish a slice, print:
>
> 1. What changed (files + external services + DNS + secrets).
> 2. How to roll it back, as commands or steps.
> 3. What I need to click through in the Cloudflare / Render / Supabase
>    dashboards, if anything.
> 4. Which tests you ran and how many passed.
>
> Then STOP and wait. Do not chain into the next slice.
>
> ## What "done" looks like
>
> - `curl https://mymentallyprepare.com` serves the Cloudflare-hosted
>   marketing site with the same HTML the Railway host serves today.
> - `curl https://api.mymentallyprepare.com/api/health` returns 200 from
>   Render.
> - The mobile app, pointed at `api.mymentallyprepare.com`, signs in,
>   loads `/api/me`, and seals an entry — end to end, on a real Android
>   device, not a simulator screenshot.
> - The live SQLite DB has been backed up in at least three places
>   (developer laptop, Render disk, off-site cold storage), and its
>   contents match what is now in Supabase-production row for row.
> - Nothing in `CLAUDE.md`, `docs/decision-*.md`, or `docs/directive-*.md`
>   has been edited by you.
>
> If any of those is not true, we are not done.

---

## Notes for future-me on how to use this prompt

- Do not run it against the mobile repo alone. It needs the web repo
  checked out too, because slices 1–4 all happen there. Claude Code can
  hold two roots open; give it both.
- The "seven calendar days" gates in slices 6 and 7 are not a formality.
  Every failure this project has hit came from moving on before the last
  step had stopped throwing errors. Do not compress them.
- If Codex opens draft PRs for this migration, diff each one against the
  ledger in `docs/decision-backend-express-stays.md` and the never-build
  list before merging. Salvage what belongs, close what doesn't.
