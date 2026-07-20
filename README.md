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

Copy `.env.example` to `.env` only after starting a local Supabase stack. The
app requires `EXPO_PUBLIC_SUPABASE_URL` and
`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; it has no production fallback.

## Backend

The backend source lives in `supabase/`:

- `migrations/` — forward-only PostgreSQL schema, trusted functions, grants, and RLS.
- `tests/database/` — pgTAP policy and adversarial-identity tests.
- `seed.sql` — fictional approved prompts only.

Run `supabase start` and `npm run db:verify` before merging any migration. The
same clean reset and pgTAP suite run in `.github/workflows/verify.yml`. Never
place a service-role key in an Expo environment variable.

If `npm install` complains about a font package version, run
`npx expo install @expo-google-fonts/instrument-serif @expo-google-fonts/manrope`.

## Layout

- `app/` — expo-router routes. `_layout.tsx` loads brand fonts and holds the splash
  until they are ready; `index.tsx` is the Living Night home.
- `src/backend/` — typed Supabase auth, session, ritual, writing, and safe projection access.
- `src/theme.ts` — the single source of colour and type (Living Night tokens).
- `assets/images/` — app icon, Android adaptive icon (foreground + background),
  splash, favicon. All generated from `brand/logo-mark.svg`.
- `brand/` — source-of-truth brand package (marks, wordmarks, lockup, social banner).
  Edit the SVGs and regenerate the raster set from them.

## Identity

Instrument Serif for the wordmark, Manrope for everything else. Mark colours and the
full palette live in `src/theme.ts` and `brand/`. Don't rotate the mark, don't add glow
to it, don't put the light wordmark on a light background.
