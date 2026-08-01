# Phase 1 follow-ups

Written 31 July 2026, after the six beta-blocker commits on
`codex/mobile-presence-contract` (`5023d72` … `1f8e78d`).

Everything here was **deliberately not done** in that phase. Each item names
what it is, why it was deferred, and what it blocks.

## Blocks closed beta

| # | Item | Where | Note |
| --- | --- | --- | --- |
| 1 | ~~Data export is written unencrypted to app cache and never deleted~~ | `src/privacy/export.ts` | **Partially fixed** (commit after `dd507f4`). Web branch removed — no more `Share.share({message: journal})` leak; web returns `'unavailable'` and the caller renders the existing "not available on this device" copy. Filename fixed (was dated, so exports accumulated) — at most one plaintext copy on device at any moment, next export overwrites it. Delete-on-error added; delete-on-success deliberately not added (Android hands the recipient a content:// URI backed by the cache file and may read it after `shareAsync` resolves). Still todo: warn before generating; sweep on sign-out. |
| 2 | Blocking deletes both people's writing | `app/safety-privacy.tsx` confirm copy + backend | Blocking should hide and retain under moderation, not destroy the reporter's own evidence. Backend-led; the copy changes only once the behaviour does. |
| 3 | No shelf matching opt-in | `src/api/shelf.ts:79–93` | `saveShelfItem` sends no consent flag and no setting exists, so "the shelf does not influence matching unless the user opts in" cannot currently be honoured. |
| 4 | Journal entries plaintext at rest | backend | `docs/agents/current-status.md` unit 0.5.4, still Todo. |
| 5 | IDOR ownership pass across `:id` routes | backend | unit 0.5.3, still Todo. |
| 6 | Single shared admin password, no RBAC or audit | backend | unit 0.5.5, still Todo. |
| 7 | Discover stays hidden | `app/(tabs)/discover.tsx` | Correctly parked. Needs moderation, blocking, reporting and matching before it appears in navigation. |

## Introduced by this phase

| # | Item | Where |
| --- | --- | --- |
| 8 | Drafts live in the app document directory, which Android's automatic backup includes | `src/drafts/index.ts` | Exclude the `unsealed-drafts` folder via `android:fullBackupContent` / `dataExtractionRules`. Documented in the file. |
| 9 | `console.warn` on font fallback is the app's only diagnostic output | `app/_layout.tsx` | Fine as-is; revisit if a crash reporter is ever added, and keep it incapable of carrying user content. |

## Known, unfixed, not urgent

| # | Item | Evidence |
| --- | --- | --- |
| 10 | 74 hard-coded rgba/hex values bypass the token system | mostly decorative gradient and glow layers in `app/` and `src/components/` |
| 11 | ~~Session is never invalidated when the client clears tokens~~ | **Fixed** in `dd507f4` (C1). Client exposes `onSessionLost`; `SessionProvider` subscribes and drops `signedIn`; existing `RootNavigator` effect routes to `/sign-in`. Fires on rejected refresh or malformed refresh body; does NOT fire on network/timeout. |
| 12 | ~~No error boundary, no `+not-found`~~ | **Fixed.** Root `app/_layout.tsx` exports a named `ErrorBoundary` in the LoadFailure voice; `app/+not-found.tsx` catches dead routes with a Go-home CTA. Static contract in `test/error-boundary.test.js`. |
| 13 | ~~No runtime validation of API responses~~ | **Fixed for every endpoint whose response body the app reads.** Boundary parsers in `src/api/parse.ts` (primitives + `SchemaError`), `parse-me.ts`, `parse-shelf.ts`, `parse-auth.ts`, and `parse-endpoints.ts` (scan, seal, switch-partner) throw a `SchemaError` that names the exact field path (`user.email`, `entries[3].day`, `items[1].kind`, `auth.refreshToken`, `state`). `failures.ts` classifies it as a `'schema'` kind with copy that never claims data loss. Types isolated in `types-*.ts` so parsers stay react-free and testable in plain Node. 30-test contract in `test/parse.test.js`. Not parsed: password / report / block / rematch (return void), export (returns `Record<string, unknown>` by design), notifications (already sanitized via `cleanNotificationPreferences`). |
| 14 | Touch targets below 44dp | ~12 controls; see section D4 of the audit |
| 15 | No semantic headings anywhere | `accessibilityRole="header"` appears zero times |
| 16 | Notification `Switch` tracks measure 1.01:1 and 1.18:1 | `app/notification-settings.tsx` — state is carried by thumb colour alone |
| 17 | SVG text uses font family names that do not match the loaded faces | `LivingNightScene.tsx`, `CosmicWelcome.tsx` |
| 18 | Back navigation still discards scan answers and sign-up drafts | no `usePreventRemove` anywhere |
| 19 | ~~`npm test` takes minutes because several tests shell out to `tsc` separately~~ | **Fixed.** All 12 tests now share `test/_precompile.js` — one tsc invocation per fresh Node process, cached to `test/.build/` (gitignored), skipped entirely on subsequent runs when every output is newer than its source. Full `npm test` is ~22s cold, ~18s warm, down from ~45–60s. |

Full detail for 10–19 is in `docs/audit-production-readiness-2026-07-30.md`.
