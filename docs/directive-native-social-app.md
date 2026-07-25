# Directive — The Native Social App

Adopted by Anushka, 21 July 2026. This is the current product direction for the
native app. It supersedes parts of earlier records; the reconciliation ledger
below says exactly which parts, so no document in this repo contradicts another.

The product:

> "A social discovery app where people express themselves through music, films,
> books, anime and meaningful memories, meet people who resonate with their
> inner world, and optionally build trust through a private 21-night ritual."

Formula: **EQUALS provides the social architecture. Stardust provides the
emotional world-building. The Pinterest references provide illustration, 3D and
layout inspiration. Mentally Prepare contributes the private 21-night ritual.**
References are for structure and craft — never copy screens, artwork, icons,
naming, colour systems or proprietary interaction patterns.

## Reconciliation ledger (what changed in the standing records, and by whom)

1. **Never-build list, amended 21 Jul 2026 by Anushka.** "Browsable profiles"
   leaves the list: taste-identity profiles and social discovery are now in
   scope for the native app. What **stays** on the never-build list: follower
   graphs and follower counts, infinite feeds (Home is a finite daily edition),
   synthetic activity or invented people, and compatibility scores shown to
   users (re-affirmed 20 Jul).
2. **Brand scope, amended 21 Jul 2026 by Anushka.** Living Night is no longer
   the whole-app brand; it is the law **inside the ritual world only** (active
   21-night Rooms, writing, sealing, constellation, milestones, reveal). The
   Daylight social world (cream/pale lilac, dark ink, cultural artwork) is a
   brand extension for the social surface. Utility surfaces are plain and
   native. The 2026-07-11 "mobile brand = dark Living Night" decision is
   superseded to this narrower scope.
3. **The anonymity thesis is rescoped.** Previously "the anonymity is the
   product." Now: the **ritual** is anonymous; the social surface is a curated
   taste identity (pseudonymous, no real-name requirement). Safety copy and
   consent language must be re-checked against this before any social surface
   ships.
4. **CompatibilityReason is constrained by the 20 Jul score decision.** No
   numbers, no percentages, and no system-voice judgments ("deeply aligned",
   "87%"). A CompatibilityReason may only surface a *shared true fact*,
   attributed to the world: "you both shelved Past Lives." If it cannot be
   phrased as a fact both people can see about themselves, it does not ship.
5. **Backend decision unchanged.** One Express backend, mobile as bearer-token
   client (see `decision-backend-express-stays.md`). The directive itself
   re-affirms this. Missing endpoints get: documented contract → typed
   interface → truthful unavailable state → separate Express proposal. Never
   invented data.
6. **Naming collision, flagged.** The web app already has a live feature named
   Rooms (community card spaces, `routes/rooms.js`, shipped PR #34). The
   directive's "Rooms" are 21-night relationship containers. Before any mobile
   Rooms API work, decide which one owns the name; do not let two features
   called Rooms meet one API.
7. **Palette.** The directive's tokens are starting points. For existing Living
   Night surfaces and the mark, the brand package hexes remain canonical
   (`brand/BRAND.md`, e.g. moon #B4A8F4→#413670 — note the directive's
   moonViolet #A99BF0 is NOT the same value as the brand's #A89BF0; do not
   drift by accident). Consolidation happens once, in `src/design/`, during the
   token refactor — not screen by screen.
8. **The current Silent tab placeholder violates this directive** (invented
   lines and counts, "43 awake here tonight"). Slice 1 removes Silent from
   primary navigation; the invented content must not survive anywhere. The web
   backend has real silent-room routes (feed, post, resonance, presence count)
   if Silent returns later as a room-presence state — as a typed contract, not
   a mock.

9. **The whole app is dark, amended 25 Jul 2026 by Anushka.** Ledger item 2
   above is superseded in one specific respect: there is no cream Daylight
   world. The Daylight palette (`#F5F0E7` cream, `#E7E1F8` pale lilac, dark
   plum ink) is retired. The three surfaces still exist, but as **three
   temperatures of one dark atmosphere**, not three worlds — see "The three
   temperatures" below. The 21 Jul instruction "do not make the whole app
   dark purple" no longer applies.

   Two sub-decisions taken at the same time, because the amendment could not
   be implemented without them:

   - **`deepInk` resolves to `#050311`, not `#0A0714`.** The amendment text
     specified `#0A0714`. That value conflicts with the shipped brand: the
     app icon's sky gradient in `brand/logo-mark.svg` terminates at `#050311`,
     and every raster in `assets/images/` is generated from it. A base of
     `#0A0714` puts a visible seam between the splash and the app on OLED
     Android. Ledger item 7 already makes brand-package hexes canonical over
     directive hexes; this follows that rule. `#0A0714` is recorded as
     superseded. Reversing this means regenerating the whole brand raster set.
   - **`moonViolet` is `#A89BF0`.** Confirmed as the brand value.
     `src/design/colors.ts` carried the `#A99BF0` typo on `daylight.accent`;
     corrected in the same pass. Ledger item 7 anticipated exactly this drift.

   **Migration note.** The retirement is staged, not instant. The `daylight`
   token group survives in `src/design/colors.ts` marked deprecated so the
   eight screens built on it keep compiling and rendering. Screens migrate to
   the dark themes one at a time, per the house rule "minimal diffs, one
   change one retest". The tab bar's skin migrates *with* the screens, not
   before them — a dark tab bar under cream screens is a broken app, not a
   partial one.

## The three temperatures

Amended 25 Jul 2026. Supersedes "The three worlds" below. The whole app runs
on deep ink. Each temperature is that same atmosphere warmed or cooled by one
accent per screen.

1. **Moonlit-warm** — Home, Rooms, Tonight, Sealing, Reveal. Deep ink base,
   warm cream-amber highlights, dusty rose shadow. A single painted object
   owns the composition.
2. **Cool-lavender** — Discover, Taste onboarding, Profiles, Sparks. Same deep
   ink, cooler moon-lavender accent, slightly more chrome to support
   navigation. Still no card-grid wallpaper.
3. **Dark utility** — Settings, Privacy, Safety, Account, Blocking. Near-black,
   no illustration, no atmosphere, high contrast, native controls, explicit
   confirmation.

### Contrast finding, flagged 25 Jul 2026

`textMuted #4d426e` on `deepInk #050311` measures **2.26:1**. WCAG AA needs
4.5:1 for body text and 3:1 for large text and UI boundaries. It fails both.
This token is therefore constrained to decoration that carries no information
— it must never be the only thing rendering a word, a count, or a state.
`textSecondary #7a6fa8` measures 4.54:1 and passes AA for normal text with
almost no margin; do not darken it. `textPrimary`, `moonViolet` and
`dustyRose` all clear 8:1.

## The three worlds (superseded 25 Jul 2026 — see above)

- **Daylight social world** — Home, Discover, Search, Taste onboarding,
  Profiles, Inner Shelf, Sparks. Warm cream / pale lilac, dark ink type,
  cultural artwork, editorial cards, soft matte 3D objects, subtle grain,
  native navigation. Do not make the whole app dark purple.
- **Living Night world** — active 21-night Rooms, writing, sealing, shared
  constellation, milestones, reveal. Deep ink, moon lavender, dusty rose,
  Instrument Serif prompts, sparse composition, quiet state-based motion.
- **Utility world** — settings, privacy, safety, account, blocking, reporting,
  deletion. Minimal decoration, native controls, explicit confirmation, no
  atmospheric animation around critical actions.

## Motion

Central tokens: instant 100 / micro 180 / standard 320 / expressive 460 /
ritual 900 (ms). Motion explains a transition or state; no permanent bouncing,
no continuous motion behind reading content, nothing conveyed only through
animation, ritual animations interruptible. Reduce Motion: fades replace
slide/zoom/shared-element, no parallax, no floating loops, springs tightened,
all information available without animation. (Reanimated note: not currently
installed; the sibling Expo repo runs react-native-reanimated 4.3.1 on this
same SDK 56, so that is the proven version to pin if needed. Slice 1 needs no
Reanimated.)

## The full implementation directive (as given to Codex)

The verbatim build directive — navigation, visual system, token layout,
component families, 3D/illustration guidance, accessibility bar, production
requirements, workflow, and the first implementation slice — is maintained in
`docs/directive-codex-verbatim.md`. Codex slices are commanded one at a time:
audit → five-tab shell → onboarding port (Express, not Supabase) → Inner Shelf
contract. Draft PRs only; nothing merges without Anushka's review.

The instruction to keep repeating: **do not optimise for screenshots; optimise
for a working user journey backed by real state.**
