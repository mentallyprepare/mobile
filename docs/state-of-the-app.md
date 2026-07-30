# State of the app

Compiled 23 July 2026 by Claude. Reads as a cold-start briefing: what the
product is, what is built, what is decided, what is pending, and who did
which piece. Every fact here is verifiable against a commit or a document.

If any single doc contradicts this one, that doc is stale and this file
wins until you say otherwise.

---

## 1. What the app is

> **"It's an app where you find people who resonate — and then some of them
> and you do the 21 nights."**

One product, two phases:

- **The finding phase** — the social surface. Taste identity, discovery,
  Sparks, profiles. Pseudonymous (a shelf is an identity; no real name, no
  photo). This is the front door.
- **The 21 nights** — the ritual. Two people opt into a Room together;
  anonymity comes back on inside it; entries seal at midnight IST; on Day
  21 both choose whether to reveal.

Chosen by Anushka on 21 Jul 2026, after seven prior product framings.
Recorded in `docs/the-version.md`. If it changes, that file changes first.

---

## 2. Where the code lives

### Web repo (the backend, and the marketing site)

**`github.com/mentallyprepare/mentallyprepare`** · public · live at
`mymentallyprepare.com` · deployed on Railway. Node / Express /
better-sqlite3 monolith. 120+ HTTP routes, 30+ tables, 7 cron jobs. Live
users are on this backend today.

Local: `C:\Users\anush\OneDrive\Desktop\mentally prepare app 1\New folder`

### Mobile repo (the native app)

**`github.com/mentallyprepare/mobile`** · **PRIVATE** · Expo SDK 56 /
expo-router / TypeScript strict. Bearer-token client of the web backend.
Currently at commit `39bdf74` on `main`.

Local: `C:\Users\anush\mentally-prepare-mobile`

**Do not flip this repo public** until:

1. The backend commits `861d875` (bearer tokens) and `cbc839e` (shelf) are
   deployed and the vulnerabilities listed in `docs/agents/current-status.md`
   are addressed, AND
2. That current-status doc is either purged from git history or its
   sensitive lines removed.

The old repo URL `github.com/mentallyprepare/claude` redirects to `mobile`.

### Retired repos (do not build in these)

- `github.com/mentallyprepare/app` — first Expo attempt.
- `github.com/mentallyprepare/mentally-prepare-app` — the Capacitor attempt.
- `github.com/mentallyprepare/APP-CODEX` — empty.

### Unresolved fork (dangerous)

- **`github.com/mentallyprepare/Mentally-prepare`** — 17-commit Expo repo
  built on a **cream/amber** brand that has been superseded. Its
  `BRAND_GUIDELINES.md` now opens with a dated superseded notice pointing at
  Living Night. Its `Voice` and `Interaction Principles` sections are still
  good and still hold. Anyone opening this repo sees the notice first, but
  it will still confuse readers until it is archived or merged.

---

## 3. The decision ledger

Every decision has a date and an author. Workstreams do not overturn
recorded decisions; only Anushka does. Every time that discipline slipped,
a session was spent recovering.

| Date | Decision | By | Doc |
|---|---|---|---|
| 7 Jul | Living Night visual direction approved | Anushka | brand package + brief |
| 8 Jul | Master Brief with invisible-machine rules (no AI language, no first-person machine voice, no fabricated numbers, latency-is-atmosphere, human wins ties) | Anushka | `master-brief-the-quiet-app.md` |
| 8 Jul | Living Night brief phases 1–4 (presence moon, time sky, constellation, seal, shelf) | Anushka | `brief-living-night.md` |
| 11 Jul | Reuse the Express backend; mobile is a bearer-token client; encrypt entries at rest before beta | Anushka | `docs/agents/current-status.md` |
| 18 Jul | Stardust rejected as a direction; salvage list captured (11-dimension mapping, taste categories, offline matching math) | Anushka | `decision-stardust-vs-living-night.md` |
| 18 Jul | One rounded compatibility score MAY be shown | Anushka | ↑ |
| 20 Jul | Express backend stays; Supabase PRs #1-#3 closed | Anushka | `decision-backend-express-stays.md` |
| 20 Jul | Compatibility scores forbidden again (reversed the 18 Jul reversal) | Anushka | ↑ |
| 21 Jul | Native-social directive adopted: five tabs (Home, Discover, Create, Rooms, You), three visual worlds (Daylight, Living Night, Utility) | Anushka | `directive-native-social-app.md` |
| 21 Jul | The version sentence recorded | Anushka | `the-version.md` |
| 21 Jul | Daylight world design + contextual Create button | Anushka | `design-daylight-world.md` |

### What stays on the never-build list (as of 23 Jul 2026)

- AI companion or synthetic replies
- Live-generated notification copy
- User-facing mood graphs or sentiment dashboards
- **Compatibility scores shown to users** (re-affirmed 20 Jul)
- Follower graphs and follower counts
- Infinite feeds (Home is a finite daily edition)
- Synthetic activity or invented people (all screens truthfully empty when
  data is missing)
- Any feature that must be labelled to be understood

### What left the never-build list

- "Browsable profiles" — left on 21 Jul. Taste-identity profiles and
  discovery are now in scope. Follower graphs did not come with them.

---

## 4. What is built

### Web repo (backend)

Every commit here except the last two is pre-existing production code. The
two committed but **not yet pushed / deployed**:

- **`861d875` — Bearer-token auth for the native client.** `lib/tokens.js`
  (HMAC-SHA256, dependency-free, access/refresh pair) wired into
  `requireAuth`. Web keeps its cookie sessions untouched. Tokens issued on
  register/login/Google exchange. `POST /api/auth/token/refresh` swaps
  refresh for a new pair. Non-enumerable `req.session.userId` shim so mobile
  requests never leak `Set-Cookie`. 8 unit tests pass. Verified end-to-end
  with curl. Author: Claude.
- **`cbc839e` — The Shelf schema and four endpoints.** `shelf_items` table
  (fixed slots: `song_a`, `song_b`, `film`, `book`, `memory`). Endpoints:
  `GET /api/shelf`, `PUT /api/shelf/:kind`, `DELETE /api/shelf/:kind`,
  `GET /api/shelf/user/:userId` (matched partner only, respecting unlock
  schedule, memory never exposed, 404 not 403 for out-of-scope viewers).
  PII scan integrated via existing `scanForSafety`. 9/9 end-to-end curl
  checks pass. Author: Claude.

**Deployment gate.** Pushing `main` here triggers a Railway deploy against
live users. Blocks:

1. `AUTH_TOKEN_SECRET` (or reuse `SESSION_SECRET`) must be set in Railway —
   `lib/tokens.js` refuses to mint in production without one, rather than
   using an ephemeral secret that dies on restart.
2. `docs/agents/current-status.md` (in the mobile repo, not this one) lists
   live-app vulnerabilities. Not a blocker for this push per se, but the
   mobile repo must stay private until Slice 0.5 closes them.

### Mobile repo (native app)

Commits, newest last:

| Commit | Title | Author |
|---|---|---|
| `2f6137f` | Scaffold fresh Expo app with Living Night brand | Claude |
| `31c1c5d` | Add planning briefs and brand spec as docs | Claude |
| `9f20fe2` | Record Stardust decision and reverse the no-scores rule | Claude |
| `52259db` | Add paste-able context pack for briefing external assistants | Claude |
| `ea7d79b` | Build the four-tab Night Ritual scaffold | Claude |
| `095ac0f` | Rework the four screens: proportion, air, and surface | Claude |
| `6897afc` | Add phase-named arc and room presence line to Tonight | Claude |
| `f2036dc` | Give the screens the web app's material weight | Claude |
| `18413a6` | Nights, not days, in the arc label | Claude |
| `ecb2138` | Add the bearer-token API layer | Claude |
| `2b397de` | Add sign-in, auth gating, and wire the screens to /api/me | Claude |
| `2bfbada` | Send credentials with API requests | **Anushka** |
| `6a36954` | Commit static web bundle for buildless hosting | **Anushka** |
| `16c9c1e` | Record backend decision: Express stays, Supabase PRs closed | Claude |
| `2e35b28` | Adopt the native-social directive; record reconciliation and slice-1 audit | Claude |
| `aca0c3a` | Record the one-sentence version, in Anushka's words | Claude |
| `29434b4` | Record the Daylight world design and the contextual Create tab | Claude |
| `a76856b` | Slice 1: the five-tab Daylight shell, Living Night preserved inside a Room | Claude |
| `e65a8c2` | Migrate sign-in to Daylight; draft the Shelf contract proposal | Claude |
| `39bdf74` | The Shelf: mobile client, chooser, add screen, You display | Claude |

**What the mobile app does today, verified running:**

- Auth: email + password sign-in (Daylight), redirect gate that only fires
  once the session is known (no flash), tokens in `expo-secure-store` on
  native / localStorage on web.
- **Home** (Daylight): a finite daily edition. Real hero card for tonight
  when a Room is active, truthful "no room yet" otherwise. Real streak.
- **Discover** (Daylight): truthful unavailable state. No fake people.
- **Create** (Daylight): contextual. In a Room → routes to `/rooms`. Out of
  a Room → shelf chooser (five rows: filled show current title + `edit`,
  empty invite `add`).
- **`/shelf/[kind]`** (Daylight): per-slot add/edit. Character counter,
  optional detail input (artist/director/author), memory footnote, PII
  422 flow with "save anyway" override.
- **Rooms** (Living Night, inside the Room): the ritual, unchanged.
  Truthful "no room open" state when there is no match.
- **You** (Daylight): archetype, streak, real shelf (tap to edit), match
  info, sign out.

**Screens still using placeholder illustrations.** Every `Illustration`
slot ships a matte rounded shape in its slot's accent colour. Registry
(`src/components/Illustration.tsx`) is empty on purpose — Anushka owns
sourcing, real assets swap in via the manifest without screen changes.

**Tests:** `npm test` runs both suites.

- `test/client.test.js` — 8 tests. Bearer header, single-flight refresh,
  refresh-token rejection clears session, retry ceiling, concurrent-401
  collapsing, offline preservation, 204 handling.
- `test/sky.test.js` — 9 tests. Star placement determinism, ordering,
  bounds, evening-time clamping.

Web-repo also has 8 token tests in `test/tokens.test.js` (part of the
un-pushed `861d875`).

### Codex's contribution

Codex opened three draft PRs to the mobile repo on 20 July, all now
**closed** with a rationale comment linking the decision record. Branches
remain on the remote as reference; salvage list captured.

- **PR #1 `codex/mp-006-supabase-foundation`** — CLOSED. Fresh Supabase
  database, RLS, pgTAP tests, email-code auth, draft-revision seal model.
  Rejected as a direction (one Express backend, not two) — not as a
  quality verdict.
- **PR #2 `codex/mp-007-taste-identity`** — CLOSED (built on #1).
- **PR #3 `codex/mp-008-account-onboarding`** — CLOSED (built on #2).

**What was salvaged from Codex's work as Express-side items:**

1. Consent-before-account flow (age + terms + privacy captured at sign-up,
   recorded server-side).
2. Draft-revision seal model — client-generated `draft_id` + `seal_key`
   with server revision checks, idempotent against double-tap.
3. Presence-only partner projection — `/api/me` currently sends partner
   entry text; a mobile-scoped projection stripping text is queued.
4. Email-code (OTP) sign-in as an alternative to passwords.
5. Adversarial ownership tests, applied as an IDOR pass over Express
   `:id` routes.

`lib/tokens.js` (used by `861d875`) was authored by an earlier
parallel workstream that also produced `docs/agents/current-status.md`.
Claude wired it into `requireAuth` and issued at auth responses — the file
existed but was not connected to anything.

---

## 5. What is pending

### Sign-off gates blocking real product work

**Backend deploy.** Two commits (`861d875` bearer, `cbc839e` shelf) are
local. Push deploys to Railway; needs `AUTH_TOKEN_SECRET` set there first.
Once pushed, the mobile app can hit production instead of localhost.

**Shelf contract.** Proposal in `docs/proposal-shelf-contract.md`.
Currently implemented on both sides with these defaults (from the proposal
recommendations):

- Categories: `song_a`, `song_b`, `film`, `book`, `memory` (5 fixed slots)
- Fixed slots, not free-form
- Memory not visible on Discover
- 240-char cap on memory, 120 on other titles
- No album art in v1
- No rate limit yet (should reuse `apiLimiter`)

Change any of these and both the schema and the API layer need editing.

**Discovery contract.** Not written. Needed before Discover can leave the
truthful-unavailable state. Real questions: server-computed daily
shortlist? user-triggered? overlap threshold? what a `CompatibilityReason`
actually shows as text (must be a shared true fact per the 20 Jul rule)?

**Rooms name collision.** The web app already has a `Rooms` feature
(community walls, `routes/rooms.js`, shipped PR #34). The mobile "Rooms"
tab is 21-night relationship containers. They are different things and
cannot share a name in front of users. Blocks any mobile Rooms API work.

**Push notifications (mobile).** `fcm_token` column not added to users;
`sendGentlePush` fallback chain (FCM → web push → email) not built.
Prereqs are documented in `master-brief-the-quiet-app.md` (Track A).

### Not gated, but not built

- **Silent Room mobile view.** Web routes exist (`routes/silent.js`);
  contract not typed for mobile. If Silent returns, it returns as either a
  discovery-side feature or a room-presence state, not a top-level tab.
- **Reveal (Day 21) flow on mobile.** Backend has it; mobile does not.
- **Block / report / rematch on mobile.** Backend has it; mobile does not.
- **Push subscribe / preferences on mobile.**
- **`GET /api/my-data` and `DELETE /api/account` on mobile** (GDPR
  self-serve).

### Proposed hero feature (drafted 27 Jul, not built)

- **Sealed Notes** — optional, opt-in channel inside an active Room. A
  writer may leave short notes for their current partner; the recipient
  may choose to open one after finishing their own reflection. Governed
  by the sentence "a note is never the price of participation, and
  completing a reflection never creates a right to another person's
  disclosure." Full spec in `docs/proposal-sealed-notes.md`, including
  the Rashmi Kumar review that reshaped the earlier `secrets-drip`
  draft into its current consent-led form. **Gated on batch-one Night
  4–7 retention data and on the Slice 0.5 backend safety foundation.**
  Rooms-only; never enters the finding phase.

### Known technical debt

- Every tab currently calls its data provider on mount. `MeProvider` and
  `ShelfProvider` share state within the tab tree, but on sign-out and
  sign-in the whole tree unmounts, which is fine but not measured.
- `docs/agents/current-status.md` (originally from Codex's parallel
  workstream) lists live-app vulnerabilities (plaintext entries at
  `server.js:435`, single shared admin password, unverified IDOR checks,
  Google-only account deletion broken). These are real. The mobile repo
  must stay private until they are closed — or that file must be purged
  from history before the repo is flipped public.
- Two illustration slots (`spark-received`, `home-hero` in some empty
  states) are declared but not yet used by any screen. Fine, will be
  needed by Sparks and by Home's expanded modules.
- The `credentials: 'include'` in `src/api/client.ts` was added by Anushka
  in commit `2bfbada`. It is harmless on native (no cookies to send) and
  helpful on web (talking to the same-origin backend during dev), so it
  stays.

---

## 6. Documentation index

All documents live under `docs/` in the mobile repo. Read them in this
order for a full picture:

1. **`the-version.md`** — one sentence, everything else flows from it.
2. **`master-brief-the-quiet-app.md`** — invisible-machine rules,
   never-build list, build order (Tracks A–D).
3. **`brief-living-night.md`** — the ritual world's four phases.
4. **`directive-native-social-app.md`** — 21 Jul reconciliation ledger.
5. **`directive-codex-verbatim.md`** — the build directive as given to
   Codex, preserved for reproducibility.
6. **`design-daylight-world.md`** — the daylight world's rules, the
   contextual Create button, the illustration slot system.
7. **`decision-stardust-vs-living-night.md`** — Stardust rejection,
   score-rule flip history.
8. **`decision-backend-express-stays.md`** — Supabase rejection, salvage
   list.
9. **`context-pack.md`** — one paste-able briefing for external
   assistants.
10. **`web-functionality-map.md`** — what the backend exposes.
11. **`audit-slice1.md`** — the audit Codex's first command requests.
12. **`proposal-shelf-contract.md`** — the shelf design (now implemented).
13. **`agents/current-status.md`** — Codex's parallel-workstream status
    doc. Contains real live-app vulnerabilities; do not surface publicly.

The brand package lives in `brand/` with its own `BRAND.md`.

---

## 7. How to run it

### The web backend, locally

```bash
cd "C:/Users/anush/OneDrive/Desktop/mentally prepare app 1/New folder"
PORT=8090 node server.js
```

Health: `curl http://localhost:8090/api/health` → 200.

### The mobile app, against the local backend

```bash
cd C:\Users\anush\mentally-prepare-mobile
EXPO_PUBLIC_API_URL=http://10.0.2.2:8090 npx expo start
# then press `a` for Android emulator
# (10.0.2.2 is how the Android emulator reaches the host)
```

For iOS simulator, use `http://localhost:8090`. For a physical device on
the same wifi, use the host's LAN IP.

### The full test suite

```bash
# Mobile
cd C:\Users\anush\mentally-prepare-mobile
npm run typecheck
npm test              # 17 tests (8 client + 9 sky)

# Web
cd "C:/Users/anush/OneDrive/Desktop/mentally prepare app 1/New folder"
node scripts/check-syntax.js
node test/tokens.test.js   # 8 tests
```

### The web export (for previewing the mobile app in a browser)

```bash
cd C:\Users\anush\mentally-prepare-mobile
EXPO_PUBLIC_API_URL=http://localhost:8090 npx expo export --platform web --output-dir dist
# then serve dist/ statically
```

Note: the local backend does not set CORS headers, so the web preview
cannot actually reach it. Web export is for structural verification only —
native builds are where the real end-to-end runs.

---

## 8. What the two of us should do differently

Neither Claude nor Codex can coordinate in real time; whichever one runs
last wins the working tree. Every failure mode this project has hit came
from that:

- The Supabase branches were opened against a direction Codex had not seen
  documented (because it had not been documented yet).
- Codex rewrote decision records inside feature PRs.
- Two parallel workstreams have edited the same files hours apart.

**What works:** decisions written down, dated, in Anushka's name, before
either agent builds on them. Every doc under `docs/` is that discipline
made concrete. Diff any PR against `docs/` before trusting it.

**A cheap next step,** if you want to prevent silent rewrites: a
`.github/CODEOWNERS` file requiring Anushka's review on any PR that
touches `docs/decision-*.md`, `docs/directive-*.md`, or
`docs/the-version.md`. That converts "please do not rewrite decisions
silently" from a plea into a mechanical check. Free on public repos, $4/mo
Pro for private.

---

## 9. Nine-word summary

**Both phases mostly work; discovery and native deploy are next.**
