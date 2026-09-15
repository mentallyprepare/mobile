# Prompt — Slice 0: prep the tree for the migration

Paste this into Claude Code, in the mobile repo working tree, BEFORE
`docs/prompt-cf-render-supabase-migration.md`. Slice 0 is git-only — it
splits the current uncommitted working set into three clean branches so
Slice 1 can start against a `main` that records the authorizing decision.
No app code changes. No production impact.

Save any edits back to this file.

---

## The prompt

> You are prepping the mobile repo tree so a downstream migration can begin.
> Read these files first and treat them as authoritative:
>
> - `CLAUDE.md`
> - `docs/decision-backend-express-stays.md` (the reversal block at the top
>   is uncommitted; that is the point of this prep)
> - `docs/prompt-cf-render-supabase-migration.md` (also uncommitted; will
>   become the migration's source of truth once committed)
> - `docs/directive-native-social-app.md` (ledger item 9 is uncommitted)
>
> The current branch is `codex/mobile-presence-contract`. Its working tree
> contains three unrelated workstreams entangled together:
>
> - **W1** — the presence-contract code that this branch was opened for
>   (edits under `src/api/*`, `src/session.tsx`, `test/client.test.js`,
>   `app/_layout.tsx`, `CLAUDE.md`, `README.md`, `.gitignore`,
>   `package-lock.json`, `docs/agents/current-status.md`).
> - **W2** — an all-dark theme refactor (edits under `src/design/*`, new
>   `src/design/{themes,opacity,radius}.ts`, edits to
>   `app/(tabs)/_layout.tsx`, edits to `docs/directive-native-social-app.md`
>   for ledger item 9, and a new `docs/api-gaps.md`).
> - **W3** — the migration authorization (edits to
>   `docs/decision-backend-express-stays.md` and a new
>   `docs/prompt-cf-render-supabase-migration.md`).
>
> Plus **W4**: committed Expo web export churn under `build/*`. It is
> tracked but should not be; every source change re-generates it and makes
> diffs unreadable.
>
> **Your job is to land W3 and W2 on `main` as separate PR-ready branches,
> gitignore `build/`, and leave W1 untouched on `codex/mobile-presence-contract`.**
> That is all. Do not run the migration itself — the follow-up prompt
> handles that.
>
> ## Safety guardrails — identical to the migration prompt
>
> 1. **Ask before deleting anything.** Never `rm -rf`, `git clean`,
>    `git reset --hard`, `git stash drop`, `git branch -D`, or any command
>    that erases work, without asking me and getting a "yes" back in the
>    same session.
> 2. **Never touch anything outside `C:\Users\anush\mentally-prepare-mobile`
>    for this slice.** No web-repo commands here.
> 3. **Never modify `.env`, `.session-secret`, or any file matching
>    `*secret*` / `*credential*` / `*.pem` / `*.key`.**
> 4. **Never commit to `main` directly.** Push branches; open PRs.
> 5. **Never modify the CONTENT of `docs/decision-*.md`, `docs/directive-*.md`,
>    `docs/prompt-*.md`, `docs/the-version.md`, or `CLAUDE.md`.** Committing
>    the existing file bytes unchanged is fine — that is what this slice
>    is for. Editing their text is not.
> 6. **Never force-push or rewrite history on a remote branch.**
> 7. **Do not run any migration commands. Do not touch Supabase, Render,
>    Cloudflare, or DNS in this slice.**
>
> ## The plan — 6 steps, print each one, wait for approval, then execute
>
> Do NOT chain steps. Run each, print what changed, wait for me to say
> "next" before the following one.
>
> ### Step 1 — Sanity checks
>
> Print:
> - current branch (expect `codex/mobile-presence-contract`)
> - `git status --short`
> - `ls -la .git/index.lock` (if it exists — it's a stale 0-byte lockfile
>   from a sandboxed session that couldn't clean it up)
> - `git log --oneline main..HEAD` (the six presence-contract commits)
> - `git log --oneline HEAD..main` (expect empty)
>
> If any of the following are false, STOP and tell me:
> - current branch is `codex/mobile-presence-contract`
> - `main` exists locally
> - the working tree matches the file list in W1/W2/W3/W4 above
>   (allow small drift — CRLF churn, package-lock re-hashes — but flag any
>   file you cannot classify)
>
> ### Step 2 — Clear the stale index lock
>
> If `.git/index.lock` exists AND is 0 bytes AND was modified more than 10
> minutes ago:
> - `rm .git/index.lock`
> - print "cleared stale index.lock"
>
> If it is non-zero or recent, STOP. That means another git process is
> actually running and I need to know.
>
> ### Step 3 — Snapshot everything before touching anything
>
> - `git stash push -u -m "prep-tree slice 0: full snapshot $(date -Iseconds)"`
> - print `git stash list` so I can see the stash ref
> - the working tree is now clean; original branch HEAD is unchanged
>
> Recovery, if any later step fails: `git stash pop stash@{0}` restores
> everything exactly. Do not `stash drop` under any circumstances.
>
> ### Step 4 — Land W3 on its own branch off `main` (the migration authorization)
>
> Two files, no others:
> - `docs/decision-backend-express-stays.md`
> - `docs/prompt-cf-render-supabase-migration.md`
>
> Commands, in order:
> - `git switch -c docs/backend-decision-reversal main`
> - `git checkout stash@{0} -- docs/decision-backend-express-stays.md docs/prompt-cf-render-supabase-migration.md`
>   (pulls just those two files out of the stash without applying anything
>   else)
> - `git diff --stat --cached` — verify only those two files staged
> - `git commit -m "Reverse the 20 Jul Express-stays decision; land migration prompt" -m "Records Anushka's 25 Jul reversal in a dated block at the top of decision-backend-express-stays.md. The 20 Jul reasoning is preserved verbatim below it. Adds docs/prompt-cf-render-supabase-migration.md as the versioned prompt for the CF+Render+Supabase migration. Content authored by Anushka in a Cowork session; committed here unchanged."`
> - print `git log -1 --stat`
> - `git push -u origin docs/backend-decision-reversal`
>
> ### Step 5 — Land W2 on its own branch off `main` (the all-dark theme)
>
> Files, no others:
> - `src/design/colors.ts`
> - `src/design/index.ts`
> - `src/design/motion.ts`
> - `src/design/opacity.ts` (new)
> - `src/design/radius.ts` (new)
> - `src/design/spacing.ts`
> - `src/design/themes.ts` (new)
> - `src/design/typography.ts`
> - `app/(tabs)/_layout.tsx`
> - `docs/directive-native-social-app.md`
> - `docs/api-gaps.md` (new)
>
> Commands, in order:
> - `git switch -c theme/all-dark-amendment main`
> - `git checkout stash@{0} -- <each file above>`
> - `git diff --stat --cached` — verify only those files staged
> - Run `npm test` and `npx tsc --noEmit -p tsconfig.json`. Both must pass.
>   If either fails, STOP and tell me — do not commit.
> - `git commit -m "All-dark amendment: seven-file design tokens, five-tab nav, api gaps" -m "Retires the cream Daylight world per ledger item 9 of docs/directive-native-social-app.md (Anushka, 25 Jul). Fixes the moonViolet #A99BF0->#A89BF0 typo. Splits tokens into colors/typography/spacing/radius/motion/opacity/themes. Cleans the five-tab labels (Home, Discover, Create, Rooms, You) and unhides Discover on a truthful unavailable state. Adds docs/api-gaps.md documenting the missing Express contracts. Screens are not retinted in this commit; the migration prompt is a separate branch (docs/backend-decision-reversal)."`
> - `git push -u origin theme/all-dark-amendment`
>
> ### Step 6 — Restore W1 on `codex/mobile-presence-contract`
>
> - `git switch codex/mobile-presence-contract`
> - `git stash pop stash@{0}`
> - `git status --short` — should show only W1 files (the presence-contract
>   edits) plus W4 (`build/*`)
> - If W2 or W3 files appear in the status, STOP and tell me — they should
>   have been checked out in steps 4–5 and the stash pop should be a no-op
>   for them
>
> ### Step 7 — Gitignore `build/` in its own tiny commit
>
> On `codex/mobile-presence-contract` (do NOT branch further):
> - append `build/` to `.gitignore` if not already present
> - `git rm --cached -r build/`
> - `git add .gitignore`
> - `git status --short` — verify only `.gitignore` and `build/*` deletions
>   are staged
> - `git commit -m "Stop tracking Expo web export"`
> - `git push`
>
> ## Output when done
>
> Print, in this exact order:
> 1. The three branch names and their tip SHAs
> 2. The URLs of the two PRs I need to open (fill in the origin URL you see
>    in `git remote -v`)
> 3. Recovery command if I want to undo everything:
>    `git switch codex/mobile-presence-contract && git branch -D docs/backend-decision-reversal theme/all-dark-amendment && git reset --hard <sha of codex/mobile-presence-contract tip BEFORE this prep>`
> 4. Confirmation that `git stash list` is empty (or, if not, why)
>
> Then STOP. The migration prompt runs next, in a separate session.
