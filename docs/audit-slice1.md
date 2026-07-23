# Slice-1 audit — repository against the native-social directive

Prepared 21 July 2026, against `main` @ `16c9c1e`. This is the audit the
directive's first Codex command requests: current routing tree, real-data
inventory, API dependencies, files to preserve/replace, and the smallest
first PR.

## Current routing tree

```
app/_layout.tsx          fonts, SafeAreaProvider, SessionProvider, auth gate
                         (redirects sign-in <-> tabs once session is known)
app/sign-in.tsx          email+password -> /api/login, stores bearer pair
app/(tabs)/_layout.tsx   4 tabs, icon-only, no labels  <- replaced by 5-tab shell
app/(tabs)/index.tsx     Tonight   [REAL DATA]
app/(tabs)/silent.tsx    Silent    [FAKE DATA - see below]
app/(tabs)/sky.tsx       Sky       [REAL DATA]
app/(tabs)/mirror.tsx    Mirror    [REAL DATA]
```

Support code, all preserved:

```
src/api/       client.ts (bearer + single-flight refresh, 8 tests), auth.ts,
               me.ts (typed /api/me + useMe), entries.ts (seal + PII 422 flow),
               storage.ts (SecureStore native / localStorage web), keys.ts
src/session.tsx  SessionProvider (cold-start restore, signIn/signOut)
src/sky.ts       star placement, seeded per user (9 tests)
src/arc.ts       phase names (The Descent / The Depth / The Return)
src/theme.ts     Living Night tokens  <- becomes the night theme inside src/design/
src/components/  Moon, Card, NightBackground, PrimaryButton, Icons
test/            client.test.js, sky.test.js  (17/17 passing)
```

## Which screens contain real data

- **Tonight** — real: night number, prompt, partner presence from `/api/me`;
  seals via `POST /api/entry`; sealed-state detection; truthful no-match state.
- **Sky** — real: built from `/api/me` entry timestamps (mine + partner's),
  deterministic seeded positions; truthful empty state.
- **Mirror** — real: archetype, streak, match, sign-out.
- **Silent** — **entirely invented** (hardcoded lines, counts, "43 awake
  here tonight"). Violates the directive's no-fake-data rule. Slice 1 removes
  it from primary navigation and the invented content must not survive. Real
  web routes exist (`routes/silent.js`: feed, post, resonance, presence count)
  for a future typed return.

## API contracts

**Available (Express, typed in `src/api/`):**
`POST /api/login`, `/api/register`, `/api/logout`,
`/api/auth/token/refresh` (bearer pair), `GET /api/me`
(user, match{day, currentPrompt, partner.archetype}, entries,
partnerEntries, partnerStatus{partnerHasWrittenToday, nextUnsealAt}, streak),
`POST /api/entry` (seal; 422 `pii_detected` flow).

**Available on the web backend but not yet typed for mobile:**
silent room (feed/post/resonance/presence), reveal, block/report/rematch,
comments, reactions, push subscribe, `GET /api/my-data`, `DELETE /api/account`.

**Missing entirely (document contract, truthful unavailable state, no data):**
discovery/search, profiles/taste identity, Inner Shelf (schema still needs
Anushka's sign-off), Sparks, rooms-as-list (today the "list" is the single
`/api/me` match — truthful as a one-item list).

**Deployment dependency, blocking device testing against production:** the
bearer-auth backend commit (`861d875` in the web repo) is still local-only.
Pushing it deploys to Railway and requires `AUTH_TOKEN_SECRET` (or
`SESSION_SECRET`) set there first. Until then the app only works against a
local server (`EXPO_PUBLIC_API_URL=http://10.0.2.2:8080`).

**Known privacy item:** `/api/me` sends partner entry *text*; the client needs
only day numbers + timestamps. A mobile-scoped projection that strips partner
text is an agreed Express-side work item (`decision-backend-express-stays.md`).

## Files to preserve / replace in slice 1

Preserve unchanged: everything under `src/api/`, `src/session.tsx`,
`src/sky.ts`, `src/arc.ts`, `src/components/*`, `app/sign-in.tsx`,
`app/_layout.tsx` (gate logic), both test files.

Replace / move:
- `app/(tabs)/_layout.tsx` → five tabs (Home, Discover, Create, Rooms, You),
  visible labels + accessibilityRole/Label, min 44pt targets.
- `app/(tabs)/index.tsx` (Tonight) → `app/(tabs)/rooms/` detail screen,
  logic unchanged.
- `app/(tabs)/sky.tsx` → Room progress view within Rooms.
- `app/(tabs)/mirror.tsx` → seeds `app/(tabs)/you.tsx`.
- `app/(tabs)/silent.tsx` → deleted from navigation; invented content dropped.

New thin screens: `home.tsx` (finite daily edition: tonight's-room card,
connection state, streak — only sections with real `/api/me` data),
`discover.tsx` (truthful unavailable state + documented contracts),
`create.tsx` (the one real action — write/seal tonight, routing into the
Room — with future actions visibly disabled, none interactive-but-dead).

Perf note for the shell: today each tab calls `useMe()` independently, so tab
switches refetch. Hoist `/api/me` into one shared provider (same pattern as
SessionProvider) as part of the shell, or five tabs will make it worse.

## Smallest first PR

Exactly the directive's slice 1: five-tab shell + relocations + truthful
Home/Discover/Create + shared `/api/me` provider + navigation/auth-routing
tests. No new visual worlds yet (Daylight lands with its first real content),
no Reanimated (nothing in the shell needs it; proven-compatible version is
4.3.1 if later slices want it), no new endpoints. Estimated surface: ~12 files.

Out of scope for slice 1, per the reconciliation ledger: anything Discover
shows beyond the unavailable state, CompatibilityReason (constrained to
shared-true-facts when it comes), Inner Shelf (schema unsigned), silent-room
return, Rooms-name collision resolution (must be decided before mobile Rooms
API work).
