# Design — the Daylight world

Anushka, 21 July 2026. Read together with `directive-native-social-app.md`
(three-worlds system) and `the-version.md` (the finding phase / the ritual).

## What the Daylight world should feel like

Lively, warm, illustrated. Not gradient cards on a dark background — a
different visual planet from the Living Night. Cream / pale lilac / soft mint
backgrounds. Chunky rounded shapes. Handmade type moments. Real illustrations
of state objects (moon, envelope, shelf, doorway, thread, cup) — matte,
softly dimensional, mature.

Explicit references (used for direction, never copied): the RIFE app, the
pastel finance UI, the meditation UI, the sleep-tracker illustrated
landscapes. Explicit anti-references, kept for the record so we do not drift
into them: the Clay-style talking-cherry / googly-eyed food characters, and
any mascot-face aesthetic. Users write at midnight; a talking cherry
undermines the product.

## The tab bar (EQUALS-shaped)

- **Five tabs**, each with an icon *and a visible text label*.
- Rounded floating bar, sitting above the safe area with a bit of shadow —
  not flush against the bottom edge.
- **Center tab is Create**, visibly the largest and most prominent
  (accent-colored disc behind the icon), same shape EQUALS and the RIFE
  reference use.
- Active tab in the brand accent; inactive tabs muted.
- The bar spans Home / Discover / **Create** / Rooms / You in that order.

## Create is contextual

The Create button's label and destination change based on state. This is the
version doc's "one product, two phases" made a single button:

- **When you are in an active 21-night Room:** label "Write tonight",
  destination = tonight's writing (the ritual). Sits inside Living Night.
- **When you are not in a Room:** label "Add to shelf", destination =
  add-a-cultural-object flow (the finding phase, Daylight).
- **When both are true** (you have a Room *and* the shelf is incomplete):
  writing wins. The ritual is the deeper commitment; do not upstage it.
- **Screen-reader / accessibility label** must match the current label,
  not a static "Create" — a screen-reader user should hear the same verb a
  sighted user reads.

This is one control that changes verb, not two controls squeezed into one.

## Illustrations — the pipeline

Anushka owns illustration sourcing (Figma community files, image search,
Google Stitch). The mobile app provides **pluggable slots** — not baked
graphics. That means:

- An `Illustration` component that takes a named slot
  (`shelf-empty`, `room-empty`, `spark-received`, etc.) and renders whatever
  asset is currently mapped to that slot, at the size the caller asks for.
- Assets live in `assets/illustrations/`, mapped by name in a manifest, and
  can be swapped without touching screen code. Component interface supports
  PNG / WebP today and an optional Rive path later (per the directive).
- **Slots ship with a coherent placeholder** (a rounded matte shape in the
  slot's accent color) so screens are never broken by a missing asset. That
  is not a design; it is a promise that the layout will not shift when the
  real illustration lands.

One honest caveat: illustrations sourced from three different origins
(Figma community, image search, AI generation) will land in three different
styles unless curated. This is Anushka's craft call, not the app's — but the
slot system means the app does not need to change to consolidate the style
later. Swap the assets, ship.

## What is Daylight and what is not

- **Daylight:** Home, Discover, Create (when not in a Room), You, Search,
  Taste onboarding, Profiles, Inner Shelf, Sparks. Cream / pale lilac
  backgrounds. Illustrated.
- **Living Night stays exactly as approved** for: the inside of an active
  Room, writing, sealing, constellation, milestones, Day-21 reveal, and
  Create when it becomes "Write tonight." Deep ink, moon lavender, dusty
  rose, Instrument Serif prompts. Do not port illustrations into Living
  Night — the ritual keeps its sparse, quiet composition.
- **Utility** (settings, privacy, safety, blocking, reporting, deletion)
  stays plain, native, high-readability. No illustrations there either;
  atmosphere around a delete button is a category error.

## What this does not decide

- The exact hexes for Daylight beyond "warm cream / pale lilac / soft accents."
  Consolidation happens once, in `src/design/colors.ts`, during the token
  refactor slice — not screen by screen.
- Type scale, spacing tokens, radius tokens. Same — one pass, in the token
  refactor slice, using EQUALS / RIFE proportions as the reference.
- The exact center-tab shape (a full circle, a raised pill, a notch).
  That is a component decision inside the tab-bar build.
