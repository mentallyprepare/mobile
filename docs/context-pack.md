# Mentally Prepare — Context Pack

Assembled 18 July 2026. A single paste-able briefing for an external assistant. Everything here is **decided, not speculative**. Where a rule has been amended, the amendment is inline and dated.

---

## Read this first — current state

**Product.** Anonymous 21-day peer journaling for Indian college students. Match with a stranger from another college, both answer a nightly prompt, entries seal until midnight IST, on Day 21 both choose whether to reveal identity. The web app is live at mymentallyprepare.com with real users.

**Two repos.**
- **Web (stays, is the backend):** Node/Express + better-sqlite3 monolith. 120 routes, 34 tables, 7 cron jobs. The 21-night product logic lives here and is being extended, not rewritten.
- **Mobile (net-new):** Expo SDK 56 / expo-router / TypeScript strict. Currently a bare scaffold — brand assets, design tokens in `src/theme.ts`, one placeholder home screen. No features built yet.

**Architecture, locked.**
- Reuse the existing Express backend. No new backend service.
- Mobile auth is **bearer tokens** stored in `expo-secure-store`. Web keeps its `express-session` cookies unchanged.
- Mobile brand is dark Living Night (`#050311`).
- Encrypt private writing at rest (entries, drafts, crisis content) before beta.

**Design is not an open question.** A design-complete prototype exists (see below) and the brand package is approved and shipped. Do not propose new visual directions, palettes, typefaces, or archetype systems.

**Matching logic is gated.** Do not modify it. Compatibility work is staged for ~500 users, behind consent.

---

## The Night Ritual prototype — the design-complete spec

A working prototype of the native app. Four tabs, bottom nav. This is the target the mobile app is being built to.

**1. tonight** (`/`, moon icon) — "NIGHT 9" eyebrow. The presence moon, a small crescent, warm when the partner has sealed, with the line "your match sealed something for you." Below it the prompt in Instrument Serif italic: "what did you not say out loud today?" A writing area placeholder "one small sentence is enough..." and a single **seal it** button.

**2. the silent room** (`/silent`, pulse icon) — Heading "the silent room.", subline "43 awake here tonight. one line, no replies." A feed of one-line anonymous posts, each on a soft card with a resonance dot and count (e.g. "i told my therapist i was doing fine and immediately felt like a fraud" · 12). Composer at the bottom: "one line. 200 characters." + **add**.

**3. the sky** (`/sky`, sparkles icon) — The constellation Journey. Each sealed night is a numbered star, joined in order by a thin solid polyline. The match's nights appear alongside as fainter dots on a dashed connector, labelled "THEIR SKY →" — positions only, never content. Caption: "8 nights written. 13 still dark."

**4. the mirror** (`/profile`, person icon) — The archetype: "the mirror / you see what others can't admit, even in yourself." Then **YOUR SHELF**: two songs with album art, a BOOK, a FILM. Below a divider, **YOUR MATCH · THE PROTECTOR** with the presence moon and the line "someone from another city, night 9 with you", plus the match's shelf items revealing on the unlock schedule.

Note how the match is described: "someone from another city, night 9 with you." That phrasing is the house style — see rule 3 below.

---

## What not to propose

- New palettes, typefaces, or visual languages. The brand is locked.
- New archetype systems. ECP-11 exists; the prototype uses "the mirror" and "the protector."
- Ambient decoration — starfields, orbital spinners, breathing planets. Deliberately cut.
- Changes to matching logic.
- Backend rewrites, new services, or web-side route work framed as mobile work.
- Anything requiring a new dependency without a stated reason.

---
---



<!-- ===== CLAUDE.md ===== -->

# APPENDIX — House rules (CLAUDE.md)

# Mentally Prepare — mobile

Native Expo/React Native app. Android first. The webapp lives in a separate repo and
stays the front door; this app is for people already inside the 21 nights.

## The governing rule

No user should ever think "AI" while using this app. The intelligence works in the
dark so two humans can find each other.

1. Never say it. No "AI", "smart", "powered by", "personalized for you", no sparkle icons.
2. The machine never speaks in first person. Output is the user's own words reflected
   back, or curated human-written copy selected by rules.
3. Attribute everything to the world, not the system. Not "we picked this for you" —
   just tonight's prompt. Other numbers about people stay in the admin panel.
   Exception (18 Jul 2026): one rounded compatibility score may be shown. See
   docs/decision-stardust-vs-living-night.md for the honesty requirements.
4. Perfect timing reads as care; precision reads as surveillance. Round everything soft.
5. Latency is atmosphere. Anything model-computed happens offline, never as a spinner.
6. When in doubt, the human wins.

## House rules

- Minimal diffs. One change, one retest. No new dependencies without a reason.
- Propose before shipping user-facing copy.
- `src/theme.ts` is the only place colour and type are defined. Use the tokens.
- Brand marks are generated from `brand/logo-mark.svg`. Edit the SVG, regenerate rasters.

## Stack

Expo SDK 56, expo-router, TypeScript strict. Fonts: Instrument Serif (display),
Manrope (body). Package id `com.mentallyprepare.app`, scheme `mentallyprepare`.


<!-- ===== docs/master-brief-the-quiet-app.md ===== -->

# APPENDIX — Master Brief — The Quiet App

# Master Brief — The Quiet App

The full build plan for taking Mentally Prepare from webapp to the app it should be, with one governing rule: **no user should ever think "AI" while using it.** The intelligence works in the dark so two humans can find each other. 8 July 2026.

## The invisible-machine rules (apply to every feature, forever)

1. **Never say it.** No "AI", "smart", "powered by", "personalized for you", no sparkle icons. If a feature needs to explain that it's intelligent, it failed.
2. **The machine never speaks in first person.** No feature writes sentences *to* the user as if it knows them. Output is either the user's own words reflected back, or curated human-written copy selected by rules.
3. **Attribute everything to the world, not the system.** Not "we picked this prompt for you" but simply tonight's prompt.
   > **Amended 18 July 2026.** This rule originally also forbade compatibility numbers ("not 'your match is 87% compatible'"). That part is overturned: a single compatibility score **may** be shown to users, subject to the honesty requirements in `decision-stardust-vs-living-night.md` (no fabricated values, real spread, rounded to the nearest 5, computed offline, one number not a dashboard). The rest of this rule stands, and other numbers about people stay in the admin panel.
4. **Perfect timing reads as care, precision reads as surveillance.** "your match wrote something last night" feels human. "your match wrote 214 words at 11:52pm" feels watched. Round everything soft.
5. **Latency is atmosphere.** Anything model-computed happens offline (cron, at-seal, at-match), never as a spinner the user waits on. The app is instant because nothing intelligent runs in the user's way.
6. **When in doubt, the human wins.** Any feature that replaces a human moment (a reply, a reaction, a presence) is rejected regardless of quality.

## Build order

### Track A — Delivery (weeks 1–2): the Capacitor app
- Capacitor shell around the existing webapp, Android first. Play Console ($25), FCM via the existing Firebase project.
- Server: `fcm_token` column on users; `sendGentlePush` tries FCM → web push → email. `firebase-admin` already ships; sending is `admin.messaging().send()`.
- Deep links: every notification opens the exact screen (tonight's prompt, the unsealed entry, the reveal).
- Keep the webapp as the acquisition front door; the app is for people already inside.
- Prereqs already agreed: push-permission ask moves to right after the first seal; SPF/DKIM on the domain so email fallback lands.

> Note (18 July 2026): superseded by the decision to build a fresh Expo/React Native app instead of a Capacitor shell. Kept here for the reasoning and the server-side prereqs (FCM column, `sendGentlePush` fallback chain, deep links), which still apply.

### Track B — Aliveness (weeks 1–4): the Living Night
Execute `brief-living-night.md` phases 1–4 (presence moon, time-aware sky, constellation Journey, seal moment, the Shelf). This is what "interactive and alive" actually is: the app reacting to true things. Zero model involvement.

### Track C — Voice (week 1, parallel): the notification bank
- 60–80 lines in the 3am-friend voice, drafted with Claude offline, edited and approved by Anushka, stored as a versioned JSON copy bank.
- Selector (plain rules): day number, partner state, streak state, hour. One push per evening max, quiet hours, no line repeats within 7 days.
- Users experience: an app that texts like a person. No model runs at send time.

### Track D — The dark machinery (staged by scale)

| When | What | User-visible as |
|---|---|---|
| Now | Funnel instrumentation (analytics_events, six numbers signup→reveal) | Nothing |
| Now + consent update | Crisis classifier on flagged entries (severity tiers → crisis_review) | Nothing — only better human follow-up |
| ~3 months of data | Ghost prediction (behavioral features → early gentle nudge) | "the night waited for you" |
| Growth | Send-time bandit (per-user best hour) | Notifications that feel weirdly well-timed |
| ~500 users | Compatibility matching (Shelf + archetype + writing-texture embeddings, consented) | "your match gets it", plus one rounded score (amended 18 Jul 2026) |
| Later | Day-21 mirror (user's own words reflected back, consent-gated, part of the reveal ceremony) | A gift, in their own words |

### Never-build list (standing decisions)
AI companion or synthetic replies · live-generated notification copy · user-facing mood graphs or sentiment dashboards · browsable profiles, feeds, follower graphs · any feature that must be labeled to be understood.

> **Amended 18 July 2026.** "Compatibility scores shown to users" was removed from this list. Per-dimension breakdowns and sentiment dashboards remain forbidden — the reversal permits exactly one rounded number.

## Privacy gates (before any model touches entries)
Consent language + privacy policy update naming exactly what is processed and why (safety classification; matching texture features; the Day-21 mirror). Each individually opt-in-able. Entries never leave for anything the user didn't say yes to. Copy generation (Track C) uses no user data and needs no gate.

## What "perfect" means here, measurably
Day-3 and Day-7 retention up, Day-21 reveal rate known and rising, partner-abandonment (5+ day silence on a live match) falling, and zero users describing the app with the word "AI" in feedback. That last one is a real metric: ask "how would you describe this app to a friend?" in the Day-21 flow and read the answers.

## Session sequencing for Claude Code
1. Notification copy bank + selector (C) — ships this week, no risk.
2. Living Night phase 1 (B) — presence moon, time sky.
3. Funnel instrumentation (D) — before anything else in D.
4. Native app scaffold + FCM (A).
5. Living Night phases 2–4.
6. Crisis classifier behind the consent update.

One session each, one change one retest, minimal diffs, per CLAUDE.md.


<!-- ===== docs/brief-living-night.md ===== -->

# APPENDIX — Design Brief — The Living Night

# Claude Code Brief — The Living Night

Design reference: `design-board-living-night.html` (open in browser, tokens and motion specs annotated per screen). Approved direction, 7 July 2026. Follow CLAUDE.md rules: minimal diffs, propose before user-facing copy changes, one change one retest, no new dependencies without reason.

## The principle

The interface reacts to four true things: the hour, the day, the match's presence, the ritual of sealing. Cut ambient decoration; the reactive moments carry the life. Nothing should look computed: star positions come from real entry timestamps, spacing is irregular, motion curves drift. Seed all randomness per user id so each sky is stable across visits.

## Phase 1 — Presence and time (ship first, smallest)

1. **Time-aware sky.** On app load and every 10 min, set `--sky` on `:root` from IST hour: `#0B0820` before 23:30, `#050311` after. 1.2s background transition. One small function, no re-render.
2. **Presence moon on Today.** `/api/me` match payload already lets the client know if the partner sealed today (same check `send10pmReminders` does server-side; expose a boolean `partnerSealedToday` if not already present). Quiet: `#6B5FAE`, no glow. Present: `#A89BF0`, glow blooms over 1.2s. Presence line copy: quiet = "your match hasn't written yet", present = "your match sealed something for you tonight". Copy is user-facing: show Anushka before merging.
3. **Moon breathing.** Scale 1 to 1.06, 7s ease-in-out infinite, slight randomized phase offset per session. This is the ONLY ambient animation on the screen; while here, remove other looping animations from the Today screen. Respect prefers-reduced-motion.

Acceptance: Today screen at 9pm vs midnight looks different; moon warms within a second of partner state changing on refresh; GPU quiet on a low-end Android.

## Phase 2 — The sky (Journey screen)

Replace the past-entries list with the constellation view (screen 03 on the board).

- Your stars: one per sealed entry, lavender `#CFC7FF`, connected by a 1px `rgba(207,199,255,.35)` polyline in entry order. Position: x spreads across the 21 days with jitter seeded from `hash(userId, day)`; y derived from seal timestamp (earlier evening = higher). Tonight's pending star: `#EFEAFF`, slightly larger.
- Match's sky: fainter dots `#A89BF0` at 80% opacity, dashed connector, positions only, no content, labeled "their sky". Data: which days partner sealed (day numbers only, never text).
- Tap a star: opens that night's entry (existing detail view). Keep a "list view" text link at the bottom for accessibility and older phones.
- Empty state (day 1): one star, copy proposal: "your first star. twenty nights of sky left."

Acceptance: renders from the existing entries query, no new endpoint beyond the partner-days array; screen readable with 1 entry and with 21.

## Phase 3 — The seal moment

On seal success, before showing the sealed state: draft card folds upward into a point of light that travels to tonight's star position, ~900ms, then sealed screen. Pure transform + one positioned element. Skip entirely under prefers-reduced-motion. Do not delay the POST; animate optimistically after server confirms (keep current error handling).

## Phase 4 — The Shelf (biggest, propose schema first)

Screen 04. New feature, needs Anushka's sign-off on schema before code.

- Table `shelf_items(user_id, kind, title, detail, position, created_at)` — kind in (song, song2, book, film). No free text beyond title + one-line detail; run detail through the existing PII scanner.
- Onboarding addition after the archetype reveal: "before you meet them: three things that are honestly you." Two songs, one book, one film. Skippable, nudged on Day 2 if empty.
- Unlock schedule (server-enforced, not client): match's song 1 at night 3, song 2 at night 7, book at night 14, film at reveal. Locked rows visible, dimmed, labeled with unlock night.
- Album art v1: iTunes Search API (`itunes.apple.com/search`), free, no auth, fetch on demand, cache locally. No new dependency.
- Hard boundaries: no photos, no free-text bio, not browsable beyond your own match.

## Explicitly out of scope

Public profiles, feeds, DMs, any change to matching logic.

## Order and estimate

Phase 1: one evening. Phase 2: two to three sessions. Phase 3: one session. Phase 4: one week including copy review. Ship and retest each phase alone.

> Note (2026-07-08): this brief was written for the webapp. On the native app the same phases apply, but the mechanics change: `--sky` becomes a theme value / animated background, CSS keyframes become Reanimated or Animated, and prefers-reduced-motion becomes the RN `AccessibilityInfo.isReduceMotionEnabled` check. The palette tokens are already in `src/theme.ts`. Phase 1 shipped on the webapp; port it here.


<!-- ===== docs/decision-stardust-vs-living-night.md ===== -->

# APPENDIX — Decision Record — Stardust vs Living Night

# Decision — Stardust vs Living Night

Decided 18 July 2026. Two decisions, recorded together because they came from the same review.

## 1. Living Night stands. Stardust is not the direction.

A "Stardust Edition" blueprint (compiled 10 July 2026) proposed a different visual and product direction. It was reviewed and **rejected as a direction**. Living Night remains the law: the approved brand package, the invisible-machine rules, and the Night Ritual prototype.

**Why it was rejected:**

- **Re-added the ambient decoration Living Night deliberately cut.** Starfields, orbital spinners, breathing planets. The Living Night principle is that reactive moments carry the life; Phase 1 makes the breathing moon the only ambient animation on Today.
- **Forked the brand.** Georgia + Inter and `#58B2DC`/`#7B5EA7`, against the approved Instrument Serif + Manrope on `#B4A8F4→#413670` / `#050311`.
- **Introduced a fourth archetype system** (Quiet Storm / Cosmonaut / Nebula / Safe Harbor) without reconciling the existing ECP-11 archetypes or the prototype's "the mirror" / "the protector".
- **Changed matching logic**, which Living Night lists as out of scope and the Master Brief gates behind scale and consent.
- **Was written for the web app** (Express routes, `public/app.html`, SQLite migrations) after the pivot to a fresh native Expo app.

**Technical faults found in the proposed implementation** (worth remembering so they are not repeated):

- The taste fallback was `Math.round(Math.random() * 15 + 40)` — it fabricated a compatibility number when there was no real overlap and showed it to users. Never ship a fabricated number.
- Cosine similarity over all-positive summed score vectors lands near 0.9 for almost any two people. Every pair would read 87–95%, which is noise presented as insight.
- `ALTER TABLE ... ADD COLUMN` has no `IF NOT EXISTS` in SQLite; re-running the migration throws. Migrations need guards.
- `/api/profile/setup` risks colliding with the existing `/api/profile` in `routes/app.js` depending on mount order.

**Salvaged for later, not now:**

- The **11-dimension psychometric mapping** (emotional regulation, attachment, social energy, coping, vulnerability, night mind, support preference, expression mode, resilience, connection depth, inner-world metaphor). Richer than the current quiz; a candidate to deepen ECP-11.
- **Taste categories beyond the Shelf** — games and shows alongside song/song/book/film. Open product question.
- **Cosine + Jaccard as offline machinery** for Track D compatibility matching, computed off the user's path.

## 2. Compatibility score: now shown to users.

**This reverses a standing rule.** The Master Brief's rule 3 and never-build list previously forbade showing compatibility numbers to users. As of 18 July 2026 that is overturned by Anushka's decision: a compatibility score **may** be shown.

Narrow scope of the reversal — everything else in the invisible-machine rules stands:

- Rule 1 (never say "AI"), rule 2 (machine never speaks in first person), rule 5 (nothing model-computed in the user's way), and rule 6 (the human wins) are unchanged.
- Rule 3's first half is unchanged: attribute to the world, not the system. No "we picked this for you."
- Rule 4 is unchanged and now constrains how the score is displayed: precision reads as surveillance.

### Requirements for an honest score

If a number is shown, it must be real. Non-negotiable:

1. **No fabrication.** If either profile is incomplete, show nothing at all. Never fall back to a random or floored value.
2. **Real spread.** Do not use cosine similarity on raw positive sums — it compresses everyone into the high 80s. Normalize each bipolar dimension to 0–100 per user, then score as `100 − mean(|a − b|)` across the texture axes, so genuinely mismatched pairs see genuinely low numbers.
3. **Taste via plain Jaccard** across the shared categories, with no floor and no randomness. Zero overlap means zero.
4. **Round soft.** Nearest 5, no decimals. "85" not "87.5". A number with a decimal point claims a precision this does not have.
5. **Computed offline**, at match time, stored — never a spinner in the user's path.
6. **One number, not a dashboard.** No per-dimension breakdown, no mood graphs, no sentiment charts. Those remain on the never-build list.

### Open question, flagged not answered

Similarity is assumed here to mean compatibility. For a journaling peer match that is a hypothesis, not a fact — shared night-mind may matter while complementary coping styles may matter more. There is no data to settle it yet. Revisit once there are enough completed 21-day arcs to compare score against reveal rate.

### Where this lands

Matching lives in the **web repo** (`routes/`, the matching job), not this one. The score is surfaced in the native app once the web side computes and exposes it. Not scheduled yet.


<!-- ===== brand/BRAND.md ===== -->

# APPENDIX — Brand Package

# Mentally Prepare — Brand Package

Refined from the original repo logo (kept: the ringed planet identity; changed: Living Night palette, eye-like glint removed, wordmark moved to Instrument Serif). 8 July 2026.

## Files
- `logo-mark.svg` — app icon with night background, source of truth for all raster icons.
- `logo-mark-transparent.svg` / `-512.png` — mark alone, for dark surfaces.
- `app-icon-{1024,512,192}.png` — app icon on the night sky. 1024 for the Play Store.
- `wordmark-light.png` — "mentally prepare", Instrument Serif, ink `#EFEAFF`, for dark backgrounds.
- `wordmark-dark.png` — same in `#26215C`, for light backgrounds (press, documents).
- `lockup-horizontal-dark-bg.png` — mark + wordmark, site header size.
- `social-banner-1200x630.png` — Open Graph / link preview card.

The app's own icon set (Android adaptive foreground/background, splash, favicon) is generated from `logo-mark.svg` into `../assets/images/`.

## Rules
Type: wordmark always Instrument Serif Regular, lowercase. Tagline Manrope, letterspaced, `#8F87BB`. Mark colors: moon `#B4A8F4→#413670`, ring front `#DDD6FF`, ring back `#453E75`, star `#EFEAFF`, sky `#100C2E→#050311`. Don't rotate the mark, don't add glow, don't put the light wordmark on light backgrounds. The single star stays: it's tonight's entry.

Note: the SVGs are flat-color (no opacity) so they rasterize identically everywhere. Edit colors directly in the file. Fonts are Google Fonts (OFL license), loaded in-app via `@expo-google-fonts/instrument-serif` and `@expo-google-fonts/manrope`. All palette values are also in `../src/theme.ts`.
