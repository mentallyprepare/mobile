# Production-readiness review — Mentally Prepare (mobile)

Reviewed 30 July 2026 against the working tree at `C:\Users\anush\mentally-prepare-mobile`,
branch `codex/mobile-presence-contract` (1 ahead of origin, 35 untracked paths).

**Read this first.** The GitHub repository at `github.com/mentallyprepare/mobile` does
**not** contain most of what this review covers. Sign-up, forgot-password, report,
block, delete-account, notification settings, the privacy export, the shelf editor,
the Living Night scene and every safety contract are untracked on disk
(`git status --porcelain | grep '^??'` → 35 paths). The review is of the local tree.

---

## A. Executive assessment

| Dimension | Score | Why |
| --- | --- | --- |
| **Overall production readiness** | **4 / 10** | The happy path is coherent and the writing is unusually careful. It fails on the unhappy paths: no error state, no offline state, no request timeout, no session invalidation, no error boundary. Those are the states a distressed user actually hits. |
| Product experience | 5 / 10 | The 21-night spine is legible and the safety copy is genuinely good. But a network failure is rendered as "you have no match yet", and the single most important screen — writing tonight's note — has no keyboard handling and no draft persistence. |
| Visual design | 6 / 10 | The Living Night identity is consistent, restrained and distinctive; component vocabulary is coherent. Undercut by systematic contrast failures and a type ramp that bottoms out at 7 px. |
| Accessibility | 3 / 10 | Roles and labels are present on most controls — better than typical. But core text colours fail WCAG AA, ~12 interactive elements are under 44 dp, no headings are marked, and two Switch tracks are invisible. Reduced motion is handled correctly, which is rare and worth keeping. |
| Privacy & security | 4 / 10 | Tokens are in SecureStore, no journal text is logged, no secrets in the repo, notification routes are allowlisted. Against that: the data export is written unencrypted to app cache and never deleted, blocking destroys the reporter's own evidence, there is no shelf matching opt-in, and the repo's own status doc records entries as plaintext at rest on the backend. |
| Code quality | 6 / 10 | Typecheck is clean, the API client is well-factored and genuinely tested, providers hoist fetches correctly. Against that: ~11 dead modules, two competing token systems, `any` through the whole API surface, and stale house rules in `CLAUDE.md`/`README.md`. |
| Test coverage | 3 / 10 | 53 assertions across 9 files, all passing. Zero of them render a component, exercise navigation, or touch a screen. Every defect in section C would pass the current suite. |

**Verdict in one line:** ready for internal testing on a device you control; not ready
for anyone who is having a bad night.

---

## B. Current user journey

Every route discovered in `app/`:

```
app/_layout.tsx            Root. Fonts → splash gate → SafeArea → Session → Me → Shelf
                           → NotificationRouting → Stack (headers off)
  RootNavigator            Redirects to /sign-in unless on sign-in | sign-up | forgot-password

app/sign-in.tsx            Email + password. Links to /forgot-password and /sign-up.
app/sign-up.tsx            3 steps in one screen (account → profile → age/consent).
                           409 renders an "you already have an account" branch.
app/forgot-password.tsx    request code → reset → complete, all in one screen.

app/(tabs)/_layout.tsx     4 visible tabs. `discover` registered with href: null.
  index.tsx     "Home"     Matched: header + LivingNightScene + 3 metrics + shelf strip.
                           Unmatched: header + "Set up your world" (scan, shelf, reminders)
                           + shelf strip + static 21-night explainer.
  create.tsx    "Shelf"    5 fixed slots, progress bar, grid of ShelfCover tiles.
  rooms.tsx     "Night"    Matched: LivingNightScene + write/seal sheet, or sealed state.
                           Unmatched: inactive scene + "Prepare your side of the room".
  you.tsx       "You"      Identity, 3 stats, shelf strip, current room, settings, sign out.
  discover.tsx             Reachable by URL only. Renders "Not available in this beta".

app/scan.tsx               ECP-11. intro → 11 questions → submitting → result → /you.
                           Also an error stage with retry.
app/shelf/[kind].tsx       Single-slot editor with live cover preview, PII re-confirm, clear.
app/safety-privacy.tsx     Report / rematch / switch / block; export / notifications / delete.
app/report.tsx             Category radio + 10–500 char detail → confirmation screen.
app/delete-account.tsx     Password + typed DELETE → deleteMyAccount → signOut.
app/notification-settings.tsx  Master switch + 4 categories + the privacy promise.
```

**Movement.** Cold start holds the splash until fonts resolve, then `RootNavigator`
reads `signedIn` (`null` while SecureStore is read) and redirects. Signed in, you land
on Home. Home, Night and You all read one shared `/api/me`; Shelf and You read one
shared `/api/shelf`. Everything below the tabs is a stack push with a hand-rolled
`← back` control — there are no navigation headers anywhere in the app.

**Missing routes and states.** No `+not-found`, no error boundary, no offline screen,
no email-verification screen (`MeUser.emailVerified` is typed and never read), no
first-run explainer for what anonymity actually means, no reveal/day-21 surface, no
skeletons — every loading state in the app is a bare `ActivityIndicator`.

---

## C. Critical blockers

Fix before any external tester touches this.

### C1 — A dead session leaves the user inside a signed-in shell forever
**Severity: Critical** · `src/session.tsx:27`, `src/api/client.ts:73–77`

`hasSession()` returns `!!accessToken` — presence, not validity. If the refresh token
is revoked or expired, `client.ts:75` clears both tokens, but nothing ever calls
`setSignedIn(false)`. `signedIn` stays `true`, `RootNavigator` never redirects, and the
user sits on a permanently empty Home with no way back to sign-in except force-quitting.

*Why it matters:* the failure is silent and unrecoverable in-app, and it looks exactly
like "the app lost all my writing".

*Fix:* have the client emit an `onSessionLost` callback when it clears tokens; wire
`SessionProvider` to `setSignedIn(false)` and route to `/sign-in` with a calm message.

### C2 — API failure is rendered as "you have nothing"
**Severity: Critical** · `app/(tabs)/index.tsx:12`, `rooms.tsx:13`, `you.tsx:12–13`, `create.tsx:10`

`MeProvider` and `ShelfProvider` both track `error` (`me-provider.tsx:24,36`;
`shelf-provider.tsx:22,34`) and set `data`/`items` to `null`/`[]` on failure. **No screen
reads `error`.** A 500, a DNS failure or a dropped connection therefore renders:

- Home → "Set up your world, 0%" as if the user had never done the scan
- Night → "Before night one — prepare your side of the room" as if there were no match
- Shelf → five empty slots as if nothing had been saved
- You → "Connection scan not completed"

*Why it matters:* this is the worst possible failure mode for this product. It tells a
vulnerable user their private writing and their connection are gone. There is also no
retry — the only recovery is killing the app.

*Fix:* surface `error` in all four screens with a quiet retry ("we couldn't reach your
account — nothing has been lost"), and never let an error path render the empty state.

### C3 — The writing screen has no keyboard handling and no draft persistence
**Severity: Critical** · `app/(tabs)/rooms.tsx:105–157`

`rooms.tsx` is the only screen with a large multiline input and the only one **without**
a `KeyboardAvoidingView` (present in `sign-in`, `sign-up`, `forgot-password`,
`shelf/[kind]`). The 214 dp input, the character counter, the privacy line and the
"Seal as a star" button all sit below the input inside `CosmicScreen`'s ScrollView,
under an absolutely-positioned 72 dp tab bar. On Android with the keyboard open the
primary action is not reachable without blind scrolling.

The draft lives only in `useState` (`rooms.tsx:14`). It is lost on process death, on
sign-out, and on any low-memory kill — with no autosave and no warning.

*Why it matters:* this is the product. Losing a paragraph someone was brave enough to
write is worse than any crash.

*Fix:* wrap the sheet in `KeyboardAvoidingView` (Android needs `height` or a resize
config, not `undefined`), keep the seal button pinned above the keyboard, and persist
the draft to storage on every change with a debounce.

### C4 — No request timeout anywhere
**Severity: Critical** · `src/api/client.ts:93–125`

There is no `AbortController` and no timeout in the client (`grep -n "AbortController\|timeout" src/api` → nothing). React Native's `fetch` will hang indefinitely on a stalled
connection. Every caller sets `busy = true` and only clears it in `catch`, so sign-in,
seal, report, delete and export can all stick on "Signing in…" / "Sealing…" forever.

*Fix:* a 15 s `AbortController` in `request()`, mapped to a distinct offline error, plus a
`finally` that always clears `busy`.

### C5 — A font failure is an unrecoverable splash screen
**Severity: Critical** · `app/_layout.tsx:20, 58, 66, 90`

`useFonts` returns `[loaded, error]`; line 58 destructures only `fontsLoaded`. Line 90
returns `null` while `!fontsLoaded`, and line 66 only hides the splash when loaded. If a
font fails to load, the splash never lifts and the app is bricked for that install.
Separately, `SplashScreen.preventAutoHideAsync()` at line 20 has no `.catch()` and can
produce an unhandled rejection.

*Fix:* read the error, hide the splash on `loaded || error`, and render with the system
fallback rather than nothing.

### C6 — The tab bar sits under Android's system navigation
**Severity: Critical (Android-first)** · `app/(tabs)/_layout.tsx:54–70`

The tab bar is `position: absolute; bottom: 0; height: 72; paddingBottom: 8` with no
safe-area inset (`grep -rn useSafeAreaInsets app src` → nothing). On any device with
gesture navigation or a software nav bar — most of the Android install base — the tab
labels and the gesture pill overlap. `CosmicScreen`'s `paddingBottom: 132`
(`CosmicScreen.tsx:40`) is a magic number tuned to one device.

*Fix:* `useSafeAreaInsets().bottom` added to tab bar height and to the scroll padding.

### C7 — Core text colours fail WCAG AA
**Severity: Critical** · `src/design/colors.ts:14–18` and every screen

Measured contrast against `brand.void` (#08050F) / `brand.card` (#0E0A18):

| Token / usage | Ratio | AA needs | Result |
| --- | --- | --- | --- |
| `brand.ink` on void | 18.42 | 4.5 | pass |
| `brand.inkMid` on void | 7.17 | 4.5 | pass |
| **`brand.inkLow` on void** | **3.25** | 4.5 | **fail** |
| **`brand.inkLow` on card** | **3.31** | 4.5 | **fail** |
| **`brand.inkFaint` on void** | **1.67** | 3.0 (UI) | **fail** |
| **`#A1445A` danger on void** | **3.36** | 4.5 | **fail** |
| **`rgba(255,255,255,0.64)` on `brand.purple`** (tile label) | **2.75** | 4.5 | **fail** |
| **`rgba(255,255,255,0.70)` on purple** (tile detail, 9.5 px) | **2.98** | 4.5 | **fail** |
| **`rgba(255,255,255,0.76)` on ShelfCover film top** | **1.43** | 4.5 | **fail** |
| **same, song_a top** | **1.56** | 4.5 | **fail** |
| **same, book top** | **2.31** | 4.5 | **fail** |
| `rgba(8,5,15,0.58)` on rose (task label) | 4.18 | 4.5 | fail |

`brand.inkLow` is not decoration — it carries `rooms.tsx:282` *"Only you can see this
before the scheduled reveal"*, every `rowDetail`, every `statLabel`, the character
counters, and the tab bar's inactive tint. The privacy promise is the least readable
text on the screen.

Additionally: the notification Switch tracks measure **1.01** (on) and **1.18** (off)
against their surface (`notification-settings.tsx:216`) — the track is invisible and
state is carried by thumb colour alone, which is both a contrast and a
non-colour-indicator failure.

*Fix:* raise `inkLow` to ~0.55 alpha (≈4.7:1), `inkFaint` to ~0.32 for UI strokes,
darken danger to ~#C96B80 or lighten the ground behind it, and give ShelfCover a
scrim behind the top row. This is a token change in one file plus the cover component.

### C8 — Back navigation silently destroys work
**Severity: Critical** · `app/scan.tsx:37–48`, `app/shelf/[kind].tsx:38–39`, `app/sign-up.tsx:50–51`, `app/(tabs)/rooms.tsx:14`

There is no `BackHandler`, no `usePreventRemove`, no `beforeRemove` listener anywhere
(`grep -rn "BackHandler\|usePreventRemove\|beforeRemove" app src` → nothing). Android
hardware back and the swipe gesture therefore discard, with no confirmation:

- 11 scan answers (~2 minutes of reflection)
- a sign-up draft mid-way through 3 steps
- an in-progress shelf entry
- tonight's note

`sign-up.tsx:116` handles *its own* `← back` control step-by-step, which makes the
hardware-back behaviour actively inconsistent with the on-screen affordance.

*Fix:* `usePreventRemove` with a confirm sheet on scan, sign-up and the shelf editor;
autosave for the night draft (see C3).

### C9 — The data export is written unencrypted to app cache and never deleted
**Severity: Critical (privacy)** · `src/privacy/export.ts:20–30`

The full `/api/my-data` payload is serialised and written to
`Paths.cache/mentally-prepare-data-<date>.json`, shared, and **left there**. Nothing
deletes it after the share sheet closes. On Android that file is readable by anything
with access to the app sandbox and survives until the OS reclaims cache.

The web branch (`export.ts:10–16`) puts the entire payload into `Share.share({message})`,
handing a full journal to whatever target the user taps.

*Why it matters:* this is a one-tap path from "export my data" to a durable plaintext
copy of someone's private writing sitting on disk.

*Fix:* delete the file in a `finally` after `shareAsync` resolves; drop the web branch
or replace it with a download that does not route content through a share message; warn
the user that the export is unencrypted before generating it.

### C10 — Blocking destroys the reporter's own evidence
**Severity: Critical (safety)** · `app/safety-privacy.tsx:74–82`, `src/api/safety.ts:15–20`

The confirm copy is explicit: *"The current server also removes the shared match history,
including writing attached to it, for both people."* So the fastest way for a bad actor
to destroy the record of what they wrote is to block the person they harmed — and the
person who was harmed destroys their own evidence by protecting themselves.

*Why it matters:* block and report are the two controls that have to work when everything
else has gone wrong. Right now using one weakens the other.

*Fix (backend-led):* blocking should hide, not delete. Retain the exchange under
moderation retention, surface it only to review, and change the copy once the behaviour
changes. Until then, prompt "report first?" before block, and never offer block as the
lower-friction option.

### C11 — There is no shelf matching opt-in, so the stated guarantee cannot be honoured
**Severity: Critical (requirement)** · `src/api/shelf.ts:79–93`, `app/shelf/[kind].tsx`

The stated boundary is *"Shelf items must not influence matching unless the user
explicitly opts in."* `saveShelfItem` sends `{title, detail, piiConfirmed}` — there is no
consent flag, no per-item toggle, and no setting anywhere in the app. The app tells the
user the shelf is *"part of your private inner shelf, not a public profile"*
(`shelf/[kind].tsx:130`) but has no mechanism to make that true.

*Fix:* add an explicit, default-off "let this help find someone" control (per-item or
per-shelf), send it, and have the matcher honour it. Until it exists, the shelf must not
be an input to matching at all.

### C12 — The repo's own status document records unfixed backend P0s
**Severity: Critical, unverifiable here** · `docs/agents/current-status.md`

That file (dated 2026-07-11) lists, still open:

- *"private entries stored plaintext (`server.js:435`)"* — unit 0.5.4 encryption-at-rest: **Todo**
- *"IDOR ownership-check pass across `:id` routes"* — 0.5.3: **Todo**
- *"single shared admin password, no moderator/support roles or audit"* — 0.5.5: **Todo**
- *"account deletion unreachable for Google-only users"* — **Todo**
- staging env separation and `.env.example` — **Todo**

I cannot verify the current backend from this repository. If any of these are still true,
they outrank everything else in this document: an anonymous journaling product cannot
enter closed beta with plaintext entries and a shared admin password.

### C13 — No error boundary
**Severity: Critical** · `app/_layout.tsx`

No `ErrorBoundary` export, no `+not-found` route. Any render throw — a malformed
`/api/me`, a null `match.currentPrompt`, an unexpected shelf `kind` — is a white screen
with no recovery and no report path.

*Fix:* export `ErrorBoundary` from `app/_layout.tsx` with a calm message and a "try
again" that resets, and add `app/+not-found.tsx`.

### C14 — Unvalidated API responses reach render
**Severity: High–Critical** · `src/api/client.ts:21,93,124`, `src/api/me.ts:53–64`

`FetchLike` is `(url: string, init?: any) => Promise<any>`; `request<T>` casts the parsed
body straight to `T` with no runtime check. Every screen then does
`data?.user?.archetype`, `data?.match?.day`, `data?.entries?.some(...)`. A response where
`entries` is an object instead of an array (`rooms.tsx:70`) or `match.day` is a string
crashes into C13's missing boundary.

*Fix:* a narrow runtime guard for `/api/me` and `/api/shelf` at the client edge —
hand-written type predicates are enough; no new dependency needed.

### C15 — No component, navigation or integration tests
**Severity: Critical for change safety** · `test/`

53 assertions pass across 9 files. All of them are pure functions or file-content
greps. None renders a component, none exercises navigation, none simulates a failed
save. **Every defect C1–C14 passes the current suite.** `test/provider-layout.test.js`
asserts provider nesting with a regex over `_layout.tsx` source, which is a proxy for
the thing rather than the thing.

---

## D. High-priority improvements

### D1 — The shelf editor can open before the shelf has loaded and then overwrite it
**High** · `app/shelf/[kind].tsx:38–39`

`useState(existing?.title ?? '')` initialises once. Reached by deep link, notification
or a cold start where `ShelfProvider` is still loading, the editor opens blank on a slot
that has content — and saving replaces it.
*Fix:* gate on `loading`, or re-sync state when `existing` first arrives.

### D2 — Nothing tells the user what "anonymous" actually means
**High** · onboarding

Sign-up collects name, email, college, year and gender. Sign-in's footer says
`18+ · private by default · no public feed` (`sign-in.tsx:154`) and the shelf editor says
"not a public profile". There is no screen that says plainly: what a match can see, when,
what the day-21 reveal exposes, and what the college/year fields are used for.
*Fix:* one short, honest "what your match can see" screen after sign-up, before the scan.

### D3 — Tonight's error message is not announced
**High** · `app/(tabs)/rooms.tsx:143`

Every other screen wraps errors in `accessibilityLiveRegion="polite"`
(`sign-in.tsx:126`, `sign-up.tsx:261`, `report.tsx:128`, `delete-account.tsx:87`,
`forgot-password.tsx:207`, `safety-privacy.tsx:179`). The seal-failure message on the
writing screen does not. A screen-reader user is told nothing when their note fails to
save.

### D4 — Touch targets below 44 dp
**High** · multiple

| Element | Size | File |
| --- | --- | --- |
| "See all" | ~19 dp, no padding | `ShelfStrip.tsx:20–27` |
| "forgot password?" | ~27 dp | `sign-in.tsx:235` |
| every `← back` | ~31 dp | `sign-up:418`, `forgot-password:238`, `report:147`, `safety-privacy:237`, `delete-account:121`, `scan:349` |
| "not now" / "back to the last question" | ~31 dp | `scan.tsx:346` |
| "Remove from shelf" | ~31 dp | `shelf/[kind].tsx:306` |
| "use a different email" | ~35 dp | `sign-up.tsx:560` |
| choice chips | 42 dp | `sign-up.tsx:490` |
| notification bell | 42 dp | `index.tsx:257` |

Android's guidance is 48 dp. Several of these are the only way to leave a screen.

### D5 — No semantic headings
**High** · every screen

`grep -rn 'accessibilityRole="header"' app src` → nothing. TalkBack users cannot jump
between sections and must traverse linearly through Home's ~40 nodes.

### D6 — Type ramp bottoms out at 7 px
**High** · `src/design/typography.ts:10` plus ~30 local overrides

`type.eyebrow` is 11 px but is overridden to 7, 7.5, 8, 8.5, 9 and 9.5 px in
`index.tsx:304,343,367,393`, `_layout.tsx:17` (tab labels at 8.5), `ShelfCover.tsx:178`,
`LivingNightScene.tsx:452,463,506`. Nothing sets `allowFontScaling={false}`, which is
correct — but 7 px is below legibility before scaling and these sit in fixed-height
containers (`sign-in.tsx:225 height:56`, `index.tsx:247,259,308,335`) that will clip at
large system font sizes.
*Fix:* floor the ramp at 11 px, convert fixed heights to `minHeight`.

### D7 — SVG text falls back to the system font
**High (visual)** · `LivingNightScene.tsx:168,180`, `CosmicWelcome.tsx:49`

`fontFamily="Manrope"` and `fontFamily="Instrument Serif"` do not match the loaded
family names (`InstrumentSerif_400Regular`, `Manrope_500Medium` — `typography.ts:1–6`).
The night number at the centre of the hero artwork — the app's signature image — renders
in Roboto on Android.

### D8 — Streak mechanics are still surfaced
**Medium–High (product boundary)** · `index.tsx:60`, `you.tsx:45`, `preferences.ts:6`

Home shows "NIGHT STREAK" as the first of three metrics and You shows "streak" as the
first stat. The stated boundary is to avoid streak pressure. The notification copy is
careful ("No streak-loss pressure", `notification-settings.tsx:59`) but the field is
still `streakReminder` and the number is still the most prominent thing on Home.
*Fix:* replace the streak count with "nights written" (a total, not a chain) or move it
out of primary position.

### D9 — No crisis or support pathway
**Medium–High (safety)** · app-wide

`report.tsx:58` correctly states *"Mentally is not an emergency service"*. That is the
only place in the app that acknowledges distress. There is no route to support
resources from the writing screen, the safety screen or settings.
*Fix:* a quiet, non-alarming "if tonight is heavy" link in Safety & Privacy pointing to
region-appropriate resources. Not a popup, not triggered by content analysis.

### D10 — Reports carry no context
**Medium** · `app/report.tsx:37`, `src/api/safety.ts:4–13`

`submitReport` accepts an optional `day` and the screen never sends one; no match id is
sent either. The server must infer the target from current state — which breaks if the
user blocks first, or reports after a switch.

### D11 — Notification copy safety is asserted against a bank the client never uses
**Medium (privacy)** · `src/notifications/copy.ts`, `test/notifications.test.js`

`copy.ts` is imported by nothing in `app/` or `src/` — only by the test. The test proves
that *this* bank contains no private fields; the notifications a user actually receives
are composed server-side. The guarantee is real for the client and unproven for the
product.
*Fix:* move the copy bank server-side as the single source, or state plainly in the doc
that the server owns notification text.

### D12 — Dead code and two competing token systems
**Medium** · `src/`

Never imported: `components/Card.tsx`, `Moon.tsx`, `NightBackground.tsx`,
`PrimaryButton.tsx`, `BrandMark.tsx`, `app/CosmicCard.tsx`, `app/RitualHero.tsx`,
`app/OrbitTrack.tsx` (only by RitualHero), `auth/CosmicBackdrop.tsx`,
`auth/StardustGuide.tsx`, `src/arc.ts` (only by RitualHero), `useMe()` in
`src/api/me.ts:66–98`, five unused icons in `Icons.tsx`, and the `duration` tokens in
`design/motion.ts` (every animation hard-codes 900/1800/2100/2200 instead).

`src/theme.ts` is imported by `app/_layout.tsx:17` for `sky.late` only; every other
importer is dead. Yet `CLAUDE.md` says *"`src/theme.ts` is the only place colour and type
are defined"* and `README.md` repeats it. The real authority is `src/design/colors.ts`.
**Fix the docs first** — a stale house rule will misdirect every future agent run.

### D13 — Image weight
**Medium (performance)** · `assets/images/`

`icon.png` 795 KB, `android-icon-background.png` 761 KB,
`mentally-prepare-orbit.png` 676 KB. The orbit PNG is rendered at 62–68 dp on
sign-in, sign-up and forgot-password (`OrbitArtifact.tsx:106`) — roughly 2 MB of
decoded bitmap for a 68 dp element on the first screen a new user sees.
*Fix:* export at 3× the display size (~204 px) and compress; ship the large asset only
where it is large.

### D14 — Six build-output directories are on disk
**Low–Medium** · repo hygiene

`dist`, `dist-authored-check`, `dist-design-check`, `dist-mp007`,
`dist-native-auth-check`, `dist-review` — 22 MB total. `.gitignore` covers `dist-*/`,
so this is disk noise rather than a leak, but it makes `expo export` results ambiguous.

### D15 — Stray marker comment
**Low** · `app/(tabs)/index.tsx:1` — `// touched`.

---

## E. UI/UX review by screen

### Sign in — `app/sign-in.tsx`
**Works.** Genuinely lovely. The wordmark/orbit topline, the italic "welcome back.", the
card-wrapped form and the `18+ · private by default · no public feed` footer set the tone
in three lines. Error state has a dot marker, a live region and clears on typing.
**Weak.** `height: 56` on inputs (line 225) will clip at large font sizes. "forgot
password?" is a 27 dp target. No "show password". No inline email validation before
submit — you learn it's malformed from the server.
**Do.** `minHeight: 56`; pad the forgot link to 44 dp; add a reveal toggle.
**A11y.** Labels present (92, 111). Missing: `accessibilityRole="header"` on the title.
**States.** Missing: offline (C4), and the disabled button gives no reason.

### Sign up — `app/sign-up.tsx`
**Works.** Three steps in one screen with a segmented progress bar is the right shape.
The 409 branch (247–259, 269–292) is excellent product thinking: three ways out, no
blame, no confirmation that the address exists to a stranger.
**Weak.** Hardware back exits the whole flow while the on-screen back moves one step
(C8) — actively confusing. `ChoiceGroup` uses `accessibilityRole="radio"` on items with
no `radiogroup` container (334–368). Gender and match preference are collected with no
explanation of how they are used. Chips are 42 dp.
**Do.** Wrap each group in `accessibilityRole="radiogroup"` with the label as its
`accessibilityLabel`; add one line under "set your boundaries." saying what these fields
do; `usePreventRemove`.
**States.** Missing: field-level errors (one string for the whole step), offline.

### Forgot password — `app/forgot-password.tsx`
**Works.** The neutral-response note (214–217) is exactly right. Code field letter-spaced.
**Weak.** Step 2 does not show which email the code went to. "request another code" has
no cooldown or feedback — tapping it silently returns to step 1. Advancing to `reset`
happens even when the request failed silently.
**Do.** Echo the masked email; disable resend for 30 s with a countdown.

### Home — `app/(tabs)/index.tsx`
**Works.** Two distinct states (matched / setup) rather than one screen pretending. The
numbered task list with a percentage badge is legible. Nothing invented — no fake
activity anywhere.
**Weak.** "Good evening" is hard-coded at line 199 regardless of time — it reads as a
bug at 8 a.m. Three metrics with a streak first (D8). Tile text fails contrast (C7). The
hand-drawn bell (267–290) is three Views, is 42 dp, and is the only notification
affordance. The static 21-night explainer (158–180) repeats on every visit forever.
**Do.** Time-aware greeting or drop it; swap streak for a total; move the explainer
behind a "how this works" row after the first week.
**A11y.** Avatar (197) has no label. Metrics read as bare numbers. No headings.
**States.** Missing: error + retry (C2), offline, skeleton.

### Shelf — `app/(tabs)/create.tsx`
**Works.** "Choose objects you would genuinely want another person to understand" is the
best line in the app. Progress bar with "private until revealed" is honest. Five fixed
slots is the right constraint.
**Weak.** The tab is labelled "Shelf" but the route is `/create` — every deep link,
notification allowlist entry and internal push says `create`. Cover top labels fail
contrast at 1.43–2.31 (C7). No empty-state guidance for what a good memory looks like.
**Do.** Rename the route to `/shelf`; add a scrim behind the cover's top row.
**States.** Missing: error, offline, per-slot save feedback.

### Shelf item editor — `app/shelf/[kind].tsx`
**Works.** Live cover preview above the form is a genuinely good idea. The PII
re-confirmation flow (78–86, 193–201) — server says stop, button becomes "Save anyway" —
is well-handled. `memory` gets a longer limit and its own footnote.
**Weak.** Can open blank over existing content (D1). `autoFocus` on a screen reached from
a scroll list yanks the keyboard up over the preview. Bad `kind` renders a bare line of
text with no way back (44–53).
**Do.** Sync state when `existing` arrives; drop `autoFocus`; give the not-found branch a
back control.
**States.** Has: error, saving, PII. Missing: unsaved-changes guard.

### Night — `app/(tabs)/rooms.tsx`
**Works.** The strongest screen conceptually. "Write before you polish it." The sealed
state that asks for nothing more. "Nothing is simulated here" on the inactive scene
(`LivingNightScene.tsx:394`) is the governing rule made visible.
**Weak.** Keyboard and draft loss (C3). Error not announced (D3). The privacy line is
`inkLow` at 3.25:1 — the least readable text on the most sensitive screen. The 5000-char
counter is visible from character 0, which makes a blank page feel like a quota. The
scene is `minHeight: 620` (`LivingNightScene.tsx:422`), taller than a 640 dp viewport, so
small phones start mid-artwork with the input off-screen.
**Do.** Show the counter past ~4000; raise the privacy line to `inkMid`; cap the scene at
a viewport fraction on short screens.
**States.** Missing: offline, save-in-progress persistence, unsaved-draft warning.

### You — `app/(tabs)/you.tsx`
**Works.** Clean settings hierarchy. Safety & Privacy is one tap from the profile, above
notifications — correct priority.
**Weak.** Sign out has no confirmation and will discard an unsaved night draft. `as Href`
casts (81, 86) indicate typed routes aren't resolving these paths — worth fixing rather
than casting. "Current night" shows `—` when unmatched, which reads as an error.
**Do.** Confirm sign-out; regenerate route types; replace `—` with "not started".

### Scan — `app/scan.tsx`
**Works.** The cleanest state machine in the codebase (23–28). Dots have `hitSlop={8}`
(213) — the only place touch targets were considered. Explicit error stage with retry
*and* "back to the last question". "Private, reflective, non-diagnostic" is used
consistently.
**Weak.** Progress reads `{index} of 11 answered` (194) using the index, so it shows
"0 of 11" while you are answering Q1 and never reaches 11. No way to review answers
before submitting. Losing 11 answers to hardware back (C8). Result screen has no "retake
later" explanation even though the server refuses retakes after matching
(`src/api/scan.ts:17–19`).
**Do.** Count actual non-null answers; add a review step; guard back.
**A11y.** `accessibilityRole="radio"` on dots without a radiogroup; the scale endpoints
are the only clue to what the dots mean.

### Safety & privacy — `app/safety-privacy.tsx`
**Works.** The best-written screen in the product. *"You never have to remain in a
connection to protect a streak or another person's feelings."* Confirmations state
consequences plainly, including the uncomfortable ones. Disabled rows explain why.
**Weak.** Block deletes shared history (C10). Export writes to cache (C9). Danger colour
fails contrast at 3.36:1. Only feedback is a single `message` string at the bottom of a
scroll — after a block you may not see it. No blocked-list, no way to undo.
**Do.** Confirm the destructive result with a dedicated state, not a line of text;
darken danger; add "report first?" ahead of block.

### Report — `app/report.tsx`
**Works.** Five categories that name real harms without diagnosing. "The other person is
not told" repeated three times. The confirmation screen sets expectations honestly and
does not promise a response time.
**Weak.** No context sent (D10). No attachment or "which night". 500-char cap may be too
tight for a real incident. `setReason(value.slice(0,500))` silently truncates a paste.
**Do.** Send match/day context; warn on truncation rather than swallowing it.

### Delete account — `app/delete-account.tsx`
**Works.** Password + typed DELETE is the right friction. The "export first" card is
genuinely considerate. The consequences list is specific.
**Weak.** No final confirmation sheet — `canDelete` flips and the button is live. No
grace period. On failure the user is left on the screen with `busy` cleared and a raw
server message. `signOut()` after deletion will call `disableNativeNotificationsForThisDevice`
against a deleted account (`session.tsx:50`), which throws and is swallowed — harmless
but noisy.
**Do.** Use the existing `ConfirmActionSheet` for the final step; offer a 7-day soft
delete.

### Notification settings — `app/notification-settings.tsx`
**Works.** "The promise." card is exactly the right register. Android channel is set to
`PRIVATE` lockscreen visibility with no sound (`registration.ts:36–44`) — a real
privacy decision correctly implemented. `not_a_device` / `project_not_configured`
failures are named rather than generic.
**Weak.** Switch tracks invisible (C7). Toggles are disabled until the master is on, so
you cannot express a preference before granting permission. `toggle` writes to the
server on every tap with no debounce. Loading state is a bare spinner on a blank screen.
**Do.** Fix track colours; allow pre-configuration; debounce writes.

### Discover — `app/(tabs)/discover.tsx`
**Works.** Correctly hidden (`href: null`) and honest when reached: "Discovery will appear
in navigation after its matching and safety systems are ready." No invented users. This
is the right way to park a feature.
**Weak.** Still deep-linkable via `mentallyprepare://discover`. Fine, given the content.

---

## F. Code and architecture review

**Structure.** `app/` routes, `src/api` transport, `src/design` tokens, `src/components`
by world (`app/`, `auth/`, `ritual/`, `shelf/`, `brand/`), pure logic isolated in
`src/quiz.ts`, `src/sky.ts`, `src/auth/*`, `src/safety/contracts.ts`,
`src/notifications/preferences.ts`. That separation is the best thing about this
codebase — it is why the tests can run in bare Node with no RN mocking.

**API client — `src/api/client.ts`.** Well designed. Dependency injection of
`storage`/`fetchImpl` (23–27), single-flight refresh (40, 56–91), one refresh + one
retry (110–114), 204 → null (116), and a correct distinction between "network failed"
(keep tokens, 69–72) and "refresh rejected" (clear tokens, 73–77). Weaknesses: `FetchLike`
and `options` are `any` (21, 93); no timeout (C4); no session-lost signal (C1); no
response validation (C14).

**Storage — `src/api/storage.ts`.** SecureStore lazily required inside the native branch
(42–45) with an explanatory comment — correct, and the reason is documented. The web
`localStorage` fallback is dev-only and clearly labelled, but nothing enforces that a
production web build can't hit it; the guard is a comment.

**Config — `src/api/index.ts:20–23`.** `EXPO_PUBLIC_API_URL || (web && __DEV__ ? local :
production)`. Production is a hard-coded literal (line 11). No staging tier, no
`.env.example`. Any preview build silently points at production.

**Session — `src/session.tsx`.** Clean context. `signedIn: boolean | null` with `null`
meaning "still reading storage" is exactly right and prevents the sign-in flash. The
cancellation guard (26, 34–36) is correct. The gap is C1.

**Providers — `me-provider.tsx`, `shelf-provider.tsx`.** Correctly hoisted out of the
tabs (the comment at `me-provider.tsx:16–20` explains why), memoised values, guarded
effects. Two problems: `error` is produced and never consumed (C2), and both wrap loads
in `Promise.resolve().then(load)` (44–52) — a defensive microtask hop with no comment
explaining what it defends against.

**Routing — `app/_layout.tsx:27–55`.** The `rootSegment` string dependency with its
comment (32–35) is a real bug fixed properly. But `RootNavigator` is the only place
auth-gating happens, and it only reacts to `signedIn`, never to API 401s.

**Components.** `LivingNightScene.tsx` is 537 lines doing SVG artwork, two animations,
reduced-motion subscription, a 21-segment rail, prompt copy and a CTA. It should be at
least three files. Lines **416–417** are dead: `if (!onPress || !actionLabel) return
content; return content;` — both branches identical.

**Styling.** Every screen defines its own `StyleSheet`, and the same patterns are
redeclared 6–8 times: `back`/`backLabel` (6 screens), `eyebrow`/`title`/`intro` (6),
`pressed: {opacity: ...}` with 7 different values (0.65, 0.7, 0.72, 0.74, 0.76, 0.82,
0.85). Token drift is visible: `radius.md` is 14 but `forgot-password.tsx:292` hard-codes
`borderRadius: 14`; `LivingNightScene.tsx:459` hard-codes `999` instead of `radius.pill`;
`ConfirmActionSheet`/`ShelfCover` hard-code `#000000` shadows.

**Performance.** No `FlatList` anywhere — but no list exceeds 21 items, so that is fine.
`orbitNodes()` and `starPositions()` run on every `SkyArtwork` render without memo
(`LivingNightScene.tsx:62–68`) — cheap, but the surrounding `rail` *is* memoised, which
is inconsistent. Real costs are the PNGs (D13) and the 620 dp gradient scene.

**Memory / async.** Cleanup is handled well: `session.tsx:34`, `me.ts` and both
providers, `NotificationRouting.tsx:25`, `LivingNightScene.tsx:238–241`,
`OrbitArtifact.tsx:38–41`, `notification-settings.tsx:92–94` all cancel or unsubscribe.
No leaks found. The one race is `shelf/[kind].tsx:38` (D1).

**Dependencies.** 26 runtime deps, all Expo SDK 56 or React Native core. No unjustified
additions. `expo-file-system`'s new `File`/`Paths` API is used correctly for SDK 56.

**Docs vs code.** `CLAUDE.md` and `README.md` both name `src/theme.ts` as the single
source of colour; it is not (D12). `README.md` describes `app/index.tsx` as "the Living
Night home"; the home is `app/(tabs)/index.tsx` and Living Night lives in Night.
`docs/current-state.md` is a retraction stub — good practice, keep it.

---

## G. Privacy and security review

### Confirmed protections (verified in this repo)

- Tokens in `expo-secure-store` on native — Keychain / EncryptedSharedPreferences (`storage.ts:42–51`)
- Native module lazily required so it never enters the web bundle (`storage.ts:8–10, 42–45`)
- **No journal text, tokens or PII in any log.** `grep -rn "console\." app src` → two hits, both in `scripts/` dev tooling
- **No secrets in the repo.** `grep -rn "process.env" app src` → one hit, `EXPO_PUBLIC_API_URL`. `.gitignore` covers `.env*`, `*.jks`, `*.p8`, `*.p12`, `*.key`, `google-services.json`, `credentials.json`, `*.db`
- Notification deep links are allowlisted to 5 routes; anything else is dropped (`routing.ts:3–10`)
- Android notification channel is `PRIVATE` lockscreen visibility, no sound (`registration.ts:36–44`)
- No error-reporting or analytics SDK is installed at all, so journal text cannot leak through one
- **Matching explanations do not exist as a surface**, so private notes cannot leak through one
- The client renders only the user's own `entries` into the sky (`rooms.tsx:98`, `index.tsx:64`); `PartnerEntryPresence` is typed as `{day, created_at}` only (`me.ts:38–41`)
- Refresh is single-flight and a network failure does not sign the user out (`client.ts:40, 69–72`)
- Age (18+) and policy consent are required, blocking, and sent to the server (`sign-up.tsx:222–233`, `auth/sign-up.ts:54–58`)
- Account deletion requires password + typed DELETE (`safety/contracts.ts:26–31`)
- Password reset gives an identical response whether or not the account exists, and says so (`forgot-password.tsx:214–217`)
- Block, report and rematch all exist and are reachable in two taps from You

### Confirmed risks (verified in this repo)

| Risk | Where |
| --- | --- |
| Data export written unencrypted to app cache and never deleted | `privacy/export.ts:20–30` (C9) |
| Web export pushes the entire journal into `Share.share({message})` | `privacy/export.ts:10–16` |
| Block deletes both people's writing — destroys the reporter's evidence | `safety-privacy.tsx:79` (C10) |
| No shelf matching opt-in exists, so the stated guarantee is unenforceable | `api/shelf.ts:79–93` (C11) |
| Cleared tokens never invalidate `signedIn` | `session.tsx:27` (C1) |
| No request timeout | `client.ts:93–125` (C4) |
| No rate-limit (429) handling — a 429 surfaces as a raw server string | `client.ts:119–123` |
| API responses cast to `T` with no validation | `client.ts:124` (C14) |
| `Linking.openURL` on hard-coded HTTPS policy URLs (low risk, but unvalidated) | `sign-up.tsx:401` |
| Every route is deep-linkable via `mentallyprepare://`; only notification routes are allowlisted | `app.json:6` |
| Production API is a hard-coded literal with no staging tier | `api/index.ts:11` |
| Sign-out does not clear the in-memory night draft | `session.tsx:49–53` |

### Cannot be verified from this repository

- Whether entries are encrypted at rest (repo's own doc says no — C12)
- Whether `/api/me` actually projects out the partner's text before responding — the mobile type says it must; only the server can guarantee it
- What `/api/my-data` contains
- Whether the shelf is currently an input to matching
- Whether `/api/report` is monitored, and by whom, under what SLA
- Whether admin access is still a single shared password
- TLS/certificate pinning (none configured client-side)
- Whether Android `FLAG_SECURE` is set — it is **not** set in this repo, so screenshots and the app-switcher preview of the writing screen are unrestricted. For a private journaling app this is worth adding.

---

## H. Testing report

### Commands executed

| Command | Result |
| --- | --- |
| `node node_modules/typescript/bin/tsc --noEmit` | **PASS** — exit 0, zero diagnostics |
| `node test/client.test.js` | **PASS** — 8/8 |
| `node test/sky.test.js` | **PASS** — 9/9 |
| `node test/quiz.test.js` | **PASS** — 13/13 |
| `node test/notifications.test.js` | **PASS** — 5/5 |
| `node test/safety.test.js` | **PASS** — 3/3 |
| `node test/password-reset.test.js` | **PASS** — 5/5 |
| `node test/sign-up.test.js` | **PASS** — 8/8 |
| `node test/provider-layout.test.js` | **PASS** — 1/1 |
| `node test/deployment.test.js` | **PASS** — 1/1 |
| `npm test` (aggregate) | Completes, but takes **~4 minutes** — see below |
| `npm run lint` / `expo lint` | **Could not complete** in the review sandbox |
| `npx expo-doctor` | **Not run** — requires network |
| Android build / `expo export` | **Not run** — no Android toolchain available here |

**Total: 53 assertions, 53 passing, 0 failing.**

**`npm test` is far too slow.** `client.test.js` and `notifications.test.js` each shell out
to `tsc` to compile TypeScript into a temp dir before asserting
(`client.test.js:22–29`, `notifications.test.js:10–26`). On this machine each compile took
~30 s. That is a real developer-experience defect: a suite nobody runs is a suite that
doesn't protect anything.
*Fix:* compile once into a shared temp dir, or run the tests through `tsx`/`ts-node`.

**Lint could not be completed.** ESLint with `eslint-config-expo` exceeded every
available execution window against the mounted filesystem. This is an environment
limitation, not evidence of failure — commit `5c47cf3` ("Clear mobile lint gate")
suggests it was recently clean. **Treat lint as unverified.**

### Missing coverage — what does not exist

No test in the repo renders a component, mounts a provider, exercises navigation, or
simulates a failed request at the screen level. Specifically absent:

Authentication · session restore from SecureStore · session invalidation on 401 ·
navigation redirects · writing and saving an entry · a failed save · offline behaviour ·
private-by-default rendering · deleting shelf content · API error rendering · empty
states · accessibility tree assertions · small-screen layout · reduced-motion behaviour ·
malformed API responses.

### Recommended test cases, in the order I would write them

1. `MeProvider` sets `error` and `data: null` on a 500; Home renders an error state, **not** the setup state (C2)
2. A cleared token pair drives `signedIn → false` and a redirect to `/sign-in` (C1)
3. `request()` aborts after 15 s and throws a distinguishable offline error (C4)
4. Cold start with a stored token renders the tab shell without flashing sign-in
5. Seal succeeds → draft cleared, `reload()` called, celebrate fires
6. Seal fails → draft **preserved**, error rendered and announced
7. Malformed `/api/me` (`entries: {}`, `match.day: "3"`) does not crash
8. Shelf editor opened while the provider is loading does not save an empty title (D1)
9. `clearShelfItem` removes the item and the count decrements
10. Every `Pressable` in the tree has an `accessibilityLabel` and ≥44 dp measured height
11. Reduced-motion on → no looping animation is started (`LivingNightScene`, `OrbitArtifact`)
12. Snapshot at 320×640 with `fontScale: 1.3` — no clipped or overlapping text
13. `routeFromNotificationData` rejects `/delete-account`, `../`, absolute URLs (extend the existing test)
14. Export deletes its temp file after sharing (C9)

Add `@testing-library/react-native` + `jest-expo`. This is a justified new dev
dependency: there is currently no way to test a screen at all, and every critical defect
above lives in a screen.

---

## I. Implementation plan

### Phase 1 — Beta blockers

| # | Task | Priority | Size | Files | Depends on | Acceptance |
| --- | --- | --- | --- | --- | --- | --- |
| 1.1 | Session invalidation on auth loss | P0 | M | `api/client.ts`, `session.tsx`, `_layout.tsx` | — | Revoking the refresh token on the server signs the app out and lands on `/sign-in` with a calm message; test 2 passes |
| 1.2 | Error + retry states in all four tabs | P0 | M | `(tabs)/index.tsx`, `rooms.tsx`, `you.tsx`, `create.tsx` | — | With the API down, no screen renders an empty/setup state; each shows a retry; test 1 passes |
| 1.3 | Request timeout + offline error | P0 | S | `api/client.ts` | — | A stalled request rejects in 15 s; no `busy` flag can stick; test 3 passes |
| 1.4 | Keyboard handling + draft autosave on Night | P0 | M | `(tabs)/rooms.tsx` | 1.3 | Seal button reachable with keyboard open on a 640 dp device; force-quit mid-draft restores the text; tests 5–6 pass |
| 1.5 | Error boundary + `+not-found` | P0 | S | `_layout.tsx`, `app/+not-found.tsx` | — | A thrown render error shows a recoverable screen, not white; test 7 passes |
| 1.6 | Font-load failure recovery | P0 | S | `_layout.tsx` | — | Splash lifts on `loaded \|\| error`; app renders with fallback fonts |
| 1.7 | Safe-area insets on the tab bar | P0 | S | `(tabs)/_layout.tsx`, `app/CosmicScreen.tsx` | — | No overlap with gesture nav on a Pixel with gesture navigation |
| 1.8 | Contrast pass on tokens | P0 | S | `design/colors.ts`, `ShelfCover.tsx`, `notification-settings.tsx` | — | Every text pair ≥4.5:1, UI strokes ≥3:1, Switch track visible; verified with the ratio script |
| 1.9 | Delete the export file after sharing; drop the web share-message path | P0 | S | `privacy/export.ts` | — | No file remains in cache after the share sheet closes; test 14 passes |
| 1.10 | Block stops deleting shared writing (+ copy change) | P0 | L | backend + `safety-privacy.tsx` | backend | Blocking hides the exchange and retains it for moderation; copy matches behaviour |
| 1.11 | Shelf matching opt-in, default off | P0 | M | `api/shelf.ts`, `shelf/[kind].tsx`, `create.tsx` + backend | backend | Shelf is not an input to matching unless the flag is set; flag is visible and reversible |
| 1.12 | Confirm backend P0s from `docs/agents/current-status.md` | P0 | L | backend | — | Entries encrypted at rest; IDOR pass done; admin RBAC in place — or beta does not open |
| 1.13 | Back-navigation guards | P1 | M | `scan.tsx`, `sign-up.tsx`, `shelf/[kind].tsx` | — | Hardware back on any of the three prompts to confirm; test suite covers scan |
| 1.14 | Response validation at the client edge | P1 | M | `api/client.ts`, `api/me.ts`, `api/shelf.ts` | 1.5 | Malformed responses produce an error state, never a crash; test 7 passes |
| 1.15 | Set up `@testing-library/react-native` + `jest-expo`; write tests 1–8 | P1 | L | `package.json`, `test/` | 1.1–1.4 | `npm test` runs component tests and finishes in under 60 s |
| 1.16 | Commit the 35 untracked paths | P0 | S | repo | — | `git status` clean; GitHub reflects the reviewed app |

### Phase 2 — Experience and accessibility

| # | Task | Priority | Size | Files | Depends on | Acceptance |
| --- | --- | --- | --- | --- | --- | --- |
| 2.1 | Touch targets ≥44 dp everywhere | P1 | M | 9 screens + `ShelfStrip.tsx` | — | Test 10 passes |
| 2.2 | Semantic headings on every screen | P1 | S | all screens | — | TalkBack heading navigation works |
| 2.3 | Floor the type ramp at 11 px; fixed heights → `minHeight` | P1 | M | `design/typography.ts` + ~30 overrides | 1.8 | Test 12 passes at `fontScale` 1.3 |
| 2.4 | Live region on the Night error | P1 | XS | `(tabs)/rooms.tsx` | — | Screen reader announces a failed seal |
| 2.5 | "What your match can see" screen after sign-up | P1 | M | new route, `sign-up.tsx` | — | Every new user sees it once before the scan |
| 2.6 | Fix SVG font family names | P1 | XS | `LivingNightScene.tsx`, `CosmicWelcome.tsx` | — | Night number renders in Instrument Serif on Android |
| 2.7 | Shelf editor load race | P1 | S | `shelf/[kind].tsx` | — | Test 8 passes |
| 2.8 | Radiogroup containers on scan, sign-up, report | P1 | S | 3 screens | — | Screen reader announces "1 of 7" correctly |
| 2.9 | Scan progress counts real answers; add a review step | P2 | M | `scan.tsx` | — | Counter reaches 11 of 11 |
| 2.10 | Skeletons replacing bare spinners | P2 | M | `app/` shared component | — | No screen flashes an empty column while loading |
| 2.11 | Time-aware greeting or remove it | P2 | XS | `(tabs)/index.tsx` | — | No "Good evening" at 8 a.m. |
| 2.12 | Streak → total nights written | P2 | S | `(tabs)/index.tsx`, `you.tsx` | — | No chain-breaking metric in primary position |
| 2.13 | Support-resources link in Safety & Privacy | P2 | S | `safety-privacy.tsx` | copy approval | Present, quiet, region-appropriate |
| 2.14 | Sign-out and delete confirmations | P2 | S | `you.tsx`, `delete-account.tsx` | — | Both use `ConfirmActionSheet` |
| 2.15 | `FLAG_SECURE` on the writing screen | P2 | S | `app.json` / native config | — | Writing screen excluded from screenshots and the app switcher |

### Phase 3 — Scalability and refinement

| # | Task | Priority | Size | Files | Depends on | Acceptance |
| --- | --- | --- | --- | --- | --- | --- |
| 3.1 | Delete the 11 dead modules and 5 unused icons | P2 | S | `src/components/*`, `src/arc.ts`, `api/me.ts` | 1.15 | Typecheck + tests pass; nothing imports them |
| 3.2 | Collapse `theme.ts` into `design/`; correct `CLAUDE.md` + `README.md` | P2 | M | `theme.ts`, `_layout.tsx`, docs | 3.1 | One token source; house rules match reality |
| 3.3 | Extract shared `ScreenHeader`, `BackLink`, `SettingsRow`, `pressed` | P2 | M | `src/components/` | 3.2 | Six duplicated definitions become one each |
| 3.4 | Split `LivingNightScene.tsx` (537 lines) into scene / artwork / rail | P2 | M | `components/ritual/` | 3.3 | No file over ~250 lines; dead lines 416–417 removed |
| 3.5 | Speed up the test suite (shared tsc pass or `tsx`) | P2 | S | `test/`, `package.json` | 1.15 | `npm test` under 30 s |
| 3.6 | Compress and right-size images | P2 | S | `assets/images/` | — | No asset over 150 KB; cold start to first paint measurably faster |
| 3.7 | Staging tier + `.env.example` | P2 | S | `api/index.ts`, `eas.json` | — | Preview builds cannot reach production by default |
| 3.8 | Rename `/create` → `/shelf` | P3 | S | route, `routing.ts`, callers | 1.15 | Route name matches the tab label everywhere |
| 3.9 | Rate-limit (429) handling with human copy | P3 | S | `api/client.ts` | 1.3 | A 429 shows "too many attempts, try again in a moment" |
| 3.10 | Remove the six `dist-*` directories | P3 | XS | repo | — | One build output |

---

## J. Changes completed

**No code changes were made.**

This is deliberate, for three reasons:

1. **You asked for the audit first** ("Produce the audit before making large changes"),
   and the house rule is minimal diffs, one change one retest.
2. **The tree is mid-flight.** The working copy is on `codex/mobile-presence-contract`,
   1 commit ahead of origin, with 46 modified files and 35 untracked paths. Editing
   files another agent is actively producing risks
   silent collisions. The first change should be `git add` (task 1.16), and that is your
   call, not mine.
3. **I could not run lint here.** ESLint with `eslint-config-expo` would not complete
   against the mounted filesystem in any available execution window. Shipping edits I
   cannot lint would violate your own rule 10.

**What I would do first, on your word** — three changes, one commit each, each verifiable
with the existing toolchain:

- **1.3** request timeout in `src/api/client.ts` — ~15 lines, covered by the existing
  injected-fetch test harness, zero UI impact
- **1.8** contrast tokens in `src/design/colors.ts` — three alpha values, verifiable with
  the ratio script, no layout change
- **1.6** font-failure recovery in `app/_layout.tsx` — ~4 lines

None touches user-facing copy, so none needs your sign-off before it lands. 1.1, 1.2 and
1.4 are the ones that matter most, but they change what people see when things break, so
I would want your reading of the copy first.

**Remaining risks if nothing changes:** a user whose connection drops is told their
connection and writing are gone (C2); a user whose session expires cannot get back in
(C1); a user writing on Android cannot reach the seal button with the keyboard open
(C3); and the export feature leaves a plaintext copy of the journal on disk (C9).

---

## K. Final verdict

| Stage | Ready? | Condition |
| --- | --- | --- |
| **Internal testing** | **Yes** | On devices you control, with the caveat that a network blip will look like data loss. Use it to validate the ritual, not the resilience. |
| **Closed beta** (people you know, who can text you when it breaks) | **No — not yet** | Needs Phase 1 items 1.1–1.9 and 1.16, plus written confirmation on 1.12 (entries encrypted at rest, IDOR pass, admin RBAC). That is roughly a focused week of work on the client. |
| **Public beta** | **No** | Needs all of Phase 1 including 1.10 (block stops destroying evidence) and 1.11 (shelf opt-in), all of Phase 2, a real moderation rota behind `/api/report`, and a documented incident path. Discover stays hidden until then, as currently designed. |
| **Production** | **No** | Needs Phase 3, meaningful test coverage on the paths that carry someone's private writing, and an accessibility pass verified on a real device with TalkBack. |

**The honest summary.** This app builds, typechecks clean, passes every test it has, and
has better privacy copy than most funded products in this category. The care in the
writing is real and it shows — "Nothing is simulated here", "You never have to remain in
a connection to protect a streak", the 409 branch on sign-up, the PII re-confirmation.
Those are the hard parts and they are done well.

What is missing is the same thing that is missing from most careful prototypes: the app
has been built for the case where everything works. Every one of the critical blockers
is a failure state — no network, no session, no keyboard room, no error boundary. For a
product whose users are, by definition, sometimes overwhelmed, the failure states are
not the edge case. They are the product.

Fix Phase 1 and this is a closed beta I would be comfortable putting in front of real
students.
