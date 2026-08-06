# Contributing to Mentally Prepare mobile

Mentally Prepare is a private social connection product. Changes must preserve
the boundary between a person's private writing and the minimum state needed to
run the shared 21-night experience.

## Ownership and approval

- Codex is the implementation owner. Other tools may provide review or bounded
  specialist work when assigned by the Orchestrator.
- Rashmi approval is required before deployment or publication, production
  authentication or schema changes, real-user notifications, destructive
  production-data operations, or new external integrations.
- Use a focused branch and pull request. Do not push directly to `main`.
- Keep pull requests in draft until their required checks and product gates are
  satisfied. Only the Orchestrator may mark a feature ready for Rashmi approval.

## Local setup

Use Node.js 22 and the npm version declared in `package.json`.

```text
npm ci
npm run web
```

Use npm only. Commit `package-lock.json` whenever dependencies change, and do
not add another package-manager lockfile.

## Required checks

Before requesting review, run:

```text
npm run brand:check
npm run typecheck
npm run lint
npm test
npx expo-doctor --verbose
npm audit --audit-level=high
npm run build
```

The GitHub `Verify mobile` workflow runs the same gates and uploads `dist` as a
temporary build artifact. `build/`, `dist/`, Expo state, dependencies, signing
credentials, environment files, and native build output must not be committed.

## Product and privacy rules

- Never fabricate people, activity, messages, compatibility, urgency, or
  evidence of understanding.
- Journal text, drafts, unsent letters, and private Shelf meaning stay
  account-private unless an approved, explicit consent contract says otherwise.
- Do not put secrets, service credentials, private content, or user data in the
  repository, logs, tests, screenshots, fixtures, analytics, or notifications.
- New matching, reveal, reporting, blocking, deletion, notification, analytics,
  or provider behavior requires product, privacy, security, safety, and QA
  review together.

## Design and generated assets

- `src/design/colors.ts` is the canonical palette. Do not add screen-level hex
  or RGBA values when an approved token can represent the state.
- `brand/logo-mark.svg` and `brand/logo-mark-transparent.svg` are the source
  files for app icon, adaptive icon, splash, favicon, and documented mark PNGs.
- After changing either SVG, run `npm run brand:generate` and commit every
  resulting PNG. CI runs `npm run brand:check` to prevent drift.

## Commits and pull requests

- Keep changes narrow and describe the user impact and root cause.
- Include the exact verification performed and disclose checks that could not
  be completed.
- Generated web bundles belong in CI artifacts or the approved host, not source
  control.
- Merging a pull request does not authorize deployment, store release, tagging,
  notification delivery, or production operations.
