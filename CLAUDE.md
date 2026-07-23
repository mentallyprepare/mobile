# Mentally Prepare — mobile

Native Expo/React Native app. Android first. The webapp lives in a separate repo;
its Express backend is this app's single source of truth.

Direction (adopted 21 Jul 2026, see docs/directive-native-social-app.md): a
social discovery app — taste identity, discovery, Sparks — with the private
21-night ritual as the core relationship experience. Three visual worlds:
Daylight (social), Living Night (ritual only), Utility (settings/safety).
The reconciliation ledger in that directive governs where it amends earlier
decisions; read it before trusting any older rule below.

## The governing rule

No user should ever think "AI" while using this app. The intelligence works in the
dark so two humans can find each other.

1. Never say it. No "AI", "smart", "powered by", "personalized for you", no sparkle icons.
2. The machine never speaks in first person. Output is the user's own words reflected
   back, or curated human-written copy selected by rules.
3. Attribute everything to the world, not the system. Not "we picked this for you" —
   just tonight's prompt. Numbers about people are for the admin panel only.
   (Compatibility scores: permitted 18 Jul, forbidden again 20 Jul, both by
   Anushka — see docs/decision-stardust-vs-living-night.md.)
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
