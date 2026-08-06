# Mentally Prepare — mobile

Native app for Mentally Prepare, the anonymous 21-day peer journaling experience.
Expo (SDK 56) + expo-router + TypeScript. Android first.

The webapp (separate repo) stays the acquisition front door. This app is for people
already inside the 21 nights.

## Run

```
npm install
npx expo install       # reconcile any dependency to the exact SDK 56 version
npx expo start         # press a for Android, w for web
```

If `npm install` complains about a font package version, run
`npx expo install @expo-google-fonts/instrument-serif @expo-google-fonts/manrope`.

Before opening a pull request, run the complete checks documented in
[`CONTRIBUTING.md`](./CONTRIBUTING.md). Web exports are uploaded by CI as
temporary artifacts and are not committed to source control.

## Layout

- `app/` — expo-router routes. `_layout.tsx` loads brand fonts and holds the splash
  until they are ready; `index.tsx` is the Living Night home.
- `src/design/` — the canonical design tokens. `colors.ts` is the single source
  of colour; `typography.ts`, `spacing.ts` and `chrome.ts` cover type, spacing
  and the fixed chrome screens must stay clear of. Import via `src/design`.
- `src/theme.ts` — a compatibility shim for older ritual components, not the
  palette. Only `sky` is still read by live code.
- `assets/images/` — app icon, Android adaptive icon (foreground + background),
  splash, favicon. All generated from `brand/logo-mark.svg`.
- `brand/` — source-of-truth brand package (marks, wordmarks, lockup, social banner).
  Edit the SVGs and run `npm run brand:generate` to regenerate the raster set.

## Identity

Instrument Serif for the wordmark, Manrope for everything else. Mark colours and the
full palette live in `src/design/colors.ts` and `brand/`. Don't rotate the mark, don't add glow
to it, don't put the light wordmark on a light background.
