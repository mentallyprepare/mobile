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
