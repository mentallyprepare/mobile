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
