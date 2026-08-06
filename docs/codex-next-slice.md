# Codex — next slice: Mobile Safety Surfaces

Corrected 27 July 2026 after Rashmi Kumar's verification pass against
the live repo caught five factual errors in an earlier draft. This is
the block to paste. Do not use any earlier draft.

---

```text
You are working in the repository at C:\Users\anush\mentally-prepare-mobile.

Read these files first. They are the authority for what exists, what has
been decided, and what is out of scope. If this prompt contradicts them,
they win.

  docs/state-of-the-app.md         ← authoritative repo state
  docs/the-version.md
  docs/master-brief-the-quiet-app.md
  docs/brief-living-night.md
  docs/design-daylight-world.md
  docs/directive-native-social-app.md
  docs/decision-backend-express-stays.md
  docs/decision-stardust-vs-living-night.md
  docs/web-functionality-map.md
  docs/proposal-sealed-notes.md    ← proposal, do not build
  docs/current-state.md            ← retracted stub, historical only

  app/(tabs)/_layout.tsx
  app/(tabs)/index.tsx
  app/(tabs)/create.tsx
  app/(tabs)/discover.tsx
  app/(tabs)/rooms.tsx
  app/(tabs)/you.tsx
  app/shelf/[kind].tsx
  app/sign-in.tsx
  src/design/*.ts
  src/api/client.ts
  src/api/me.ts
  src/api/entries.ts
  src/api/shelf.ts

Do not read or use docs/current-state.md as truth. It is a retraction
stub, kept only so the earlier mistake stays visible in git.

CURRENT SHELL — LABEL VS ROUTE

The visible tab bar has FOUR tabs, not five. The route file names
differ from the label the user sees. Do not rename either without
Anushka. Mapping:

  route file             label shown       icon
  app/(tabs)/index.tsx   Home              HomeIcon
  app/(tabs)/create.tsx  Shelf             DiscoverIcon
  app/(tabs)/rooms.tsx   Sky               RoomsIcon
  app/(tabs)/you.tsx     You               YouIcon
  app/(tabs)/discover.tsx  (hidden — href: null in the layout)

The Sky tab (route `rooms`) is where the active 21-night Room lives.
The Shelf tab (route `create`) is the taste-identity shelf.

CONTEXT

The four-tab Daylight shell has shipped. Living Night is preserved
inside a Room. The Shelf ships end-to-end (mobile + backend). The next
required work is Mobile Safety Surfaces — wiring existing backend
safety endpoints into the app so users can actually use the block,
report, rematch, GDPR export, and delete-account paths from the phone.
This is a prerequisite for a broader beta and a hard prerequisite for
the Sealed Notes hero-feature candidate whose spec lives in
docs/proposal-sealed-notes.md.

THIS SLICE

Build the mobile-side safety surfaces against endpoints that already
exist on the Express backend. Utility styling per docs/design-daylight-
world.md — plain native controls, high contrast, no atmospheric
animation around destructive actions, explicit confirmation states.

Endpoint paths, verified against the live web repo:

  POST   /api/block-partner       (routes/app.js:928)   block partner.
                                                        Whether this also
                                                        unassigns the
                                                        match is not yet
                                                        confirmed — see
                                                        BLOCK SEMANTICS
                                                        below.
  POST   /api/report              (routes/app.js:906)   report entry
                                                        or partner
  POST   /api/switch-partner      (routes/app.js:816)   self-serve
                                                        immediate rematch,
                                                        gated. See REMATCH
                                                        SEMANTICS below.
  POST   /api/rematch-request     (routes/app.js:948)   files a request
                                                        for human review.
                                                        Not instant.
                                                        See REMATCH
                                                        SEMANTICS below.
  GET    /api/my-data             (routes/app.js:1150)  GDPR export
  DELETE /api/account             (routes/app.js:1204)  delete account

REMATCH SEMANTICS — both endpoints ship

Verified against `routes/app.js:816` and `:948`.

`/api/switch-partner` is the self-serve immediate rematch. Gated:
`canSwitch = daysSinceActive >= 5 && switchesRemaining > 0`, max 2
per cycle. `/api/me` already exposes `partnerStatus.canSwitch`,
`partnerStatus.switchesRemaining`, and
`partnerStatus.nextSwitchAvailableAt` (`:145`). Branch on those; do
not call and handle rejection.

`/api/rematch-request` writes a row to the `rematch_requests` table
with an optional reason and returns "Rematch request saved for
review." No immediate effect on the match. Works regardless of
`canSwitch`.

The gap that makes both endpoints necessary: a partner who is silent
5+ days makes `canSwitch` true and the self-serve path available. A
partner who is present but distressing on Day 2 makes `canSwitch`
false. If only `switch-partner` shipped, the user in the worse
situation — an active harmful partner rather than an absent one —
would have no rematch path at all. That is a safety regression the
slice exists to prevent.

Ship both, wired conditionally on `partnerStatus.canSwitch`:

  When canSwitch is true:
    Show "find a new match" wired to POST /api/switch-partner.
    Small text under the button: "N switch(es) left this cycle" from
    `switchesRemaining`. Two-step confirmation.

  When canSwitch is false:
    Show "ask to be rematched" wired to POST /api/rematch-request.
    Copy is honest that this goes to a person and is not instant:
    "someone on our side will read this and match you with someone
    new. this usually takes a day or two. your current partner is
    not told." Two-step confirmation.
    Optional reason textarea; passed through as the request body's
    reason field. If the user leaves it empty, send empty; do not
    prompt again.

The two actions are mutually exclusive at any given moment — only
one is shown, based on `canSwitch`. Never show both.

BLOCK SEMANTICS — resolved

`POST /api/block-partner` at `routes/app.js:928` does three things
in one transaction: blocks the partner, auto-files a report of
type `block`, and closes the match. After blocking, the user has
no active match and is eligible for normal rematching.

**But it goes further than closing.** The third statement in that
transaction is `deleteMatchData(match.id)` at `server.js:2289`, a
hard cascade delete across every table that holds a foreign key
to `matches.id`. Entries, reactions, comments, and nudges are
destroyed for BOTH users. The blocked partner loses their own
writing from these nights and is never told why. This is a real
consequence and the user pressing "block" needs to know it before
they press it.

The server's own success string ("Partner blocked. Your identity
remains anonymous and the match has been closed") omits the data
loss. Do not use it as the user-facing message. Use this exactly:

  Title:      block this partner
  Body:       this closes the match and removes the writing from
              these nights for both of you. it cannot be undone.
              your identity stays anonymous — they are not told
              what you did.
  Confirm:    block and close
  Cancel:     back

Two-step: an initial "block partner" tap on the safety menu opens
this dialog. The dialog's "block and close" is the second and
final tap. No third confirmation — block is a safety action and
must be reachable quickly. The reversible destructive dialogs
(delete account, rematch) get more friction; this one gets less.

After successful block, route the user to Home. Home reads the
new /api/me state, sees no active match, and shows the truthful
"no room open" state. Do not route back to a Room that no longer
exists.

Required surfaces:

  A. In the You tab, add a Privacy & Safety section that opens a
     Utility-style stack:
       • Block partner (POST /api/block-partner, current match only)
       • Report partner or an entry (POST /api/report; reasons list
         and freeform textarea)
       • Move on from this partner. Conditional on
         `partnerStatus.canSwitch` from /api/me — see REMATCH
         SEMANTICS above. When true, "find a new match" wired to
         POST /api/switch-partner with the switches-remaining
         subtext. When false, "ask to be rematched" wired to POST
         /api/rematch-request with the honest "this goes to a person,
         a day or two" copy. Two-step confirmation on both.
       • Export my data (GET /api/my-data; native share sheet with the
         returned payload)
       • Delete account (DELETE /api/account; three-step confirmation)
       • Access support (helpline list — see the gap note below)

  B. In the active Room (route `rooms`, labeled Sky), surface a Safety
     menu accessible without leaving the Room. Same block, report,
     rematch, support actions, contextually placed. No account-deletion
     or export from inside the Room.

DELETE ACCOUNT — GOOGLE ACCOUNTS

Delete for Google-signed accounts is not currently supported on the
backend (open P1 in docs/agents/current-status.md). Detect Google-only
accounts from `/api/me` (or attempt the DELETE and read the specific
error) and show this copy exactly, do not paraphrase:

  Title:     account deletion for Google sign-in
  Body:      account deletion for accounts created with Google is not
             yet available inside the app. write to
             privacy@mentallyprepare.in and it will be handled by
             hand. an export of your data will be sent first if you
             ask.
  Actions:   [ copy email address ]   [ close ]

  Address: privacy@mentallyprepare.in is the address already published
  in the web app's privacy.html. Do not invent a different address.
  Do not use @mymentallyprepare.com — the product's marketing domain
  is not the correspondence domain. Anushka confirms the inbox is
  monitored before this slice is merged. If she has not confirmed,
  land the slice with the copy above but hold the PR from merge until
  she has.

  The earlier draft said "within seven days." Removed. Do not promise
  a timeframe on a manually-monitored inbox unless Anushka commits to
  a monitoring schedule. If she does, put the number back in.

  Detection: /api/me returns `authProvider` on the safe user payload
  ('password' or otherwise). Branch on that; do not attempt the
  DELETE first to discover the failure.

No red destructive button on this screen. No confirmation dialog. The
generic three-step delete confirmation only appears for accounts that
the endpoint can actually delete.

HELPLINES — DOCUMENTED GAP

There is no GET endpoint for helplines today. `HELPLINES` is a server
constant that only surfaces inside crisis responses (e.g. `/api/entry`
returns `safety.helplines` when the crisis screener fires).

Two options. Choose one and stop:

  Option 1 (recommended if a small backend change is acceptable):
    document the missing contract in docs/api-gaps.md and stop.
    Do not build the Support screen in this slice. Anushka will add
    GET /api/helplines to the backend, then Support ships as a small
    follow-up.

  Option 2 (only if Anushka has already added the endpoint by the time
  you run):
    consume it. Do not invent a URL. Do not hardcode a helpline list
    into the mobile bundle.

Copy discipline (all surfaces):

  • World-attributed. Never "we". "This ends the current match" not
    "we'll end your match."
  • No emoji. No exclamation. Sentence case.
  • The rematch flow never tells the writer whether the partner is
    told, because the answer is no.

Do not touch:

  • Sealed Notes. It is a proposal only, gated on batch-one data.
  • Discover beyond its current href-null hidden state.
  • The Shelf.
  • src/theme.ts. Still imported by app/(tabs)/rooms.tsx and
    app/_layout.tsx; leave both imports alone. Do not migrate them in
    this slice.
  • Any docs/decision-*.md or docs/directive-*.md.
  • The web backend. This slice ships in the mobile repo only.

TYPED API LAYER

Add src/api/safety.ts with typed wrappers for each endpoint above.
Follow the pattern already in src/api/entries.ts and src/api/shelf.ts —
one small module per resource, exports one function per endpoint,
returns the response body. Use the existing bearer client
(src/api/client.ts). No new dependencies.

COMPONENTS

Build reusable Utility components in src/components/utility/. Bare
minimum:

  ConfirmationDialog (single, double, triple confirmation variants)
  DestructiveButton (visual weight without decoration)
  ReasonList (for report reasons)
  HelplineList (accessible list with tel: links and copy-safe fallback;
    only wired if Option 2 above)

Every component supports default, pressed, loading, disabled, error,
large-text.

SIDE TASK: PROPOSAL CLEANUP

While you are in the repo, apply the EIGHT confirmed cleanup edits to
docs/proposal-sealed-notes.md. Four other items in Rashmi Kumar's
review are open decisions Anushka has not resolved and must not be
edited into the doc yet.

Apply exactly these eight, no more, no less:

  1. Sequencing section: update all references to point at
     docs/state-of-the-app.md as authoritative. The retracted
     current-state.md is historical only.
  2. Add a `match_note_preferences` table to the data-model section:
     match_id, user_id, state (accepting | paused | closed),
     updated_at.
  3. Broaden note recipient state: add a note_recipient_state model
     (note_id, recipient_user_id, state enum: waiting | opened |
     declined | hidden | withdrawn_before_open) that the writer's
     projection never exposes.
  4. Fix the rematch/cascade conflict: matches are archived, not
     deleted. Notes to a partner are not cascade-deleted. Rematched
     drafts detach from match_id_at_write and re-attach only on
     explicit reassignment.
  5. Editing an approved note resets it to private draft, re-runs the
     screener, requires fresh approval and release. Add as an explicit
     rule under "The four decisions."
  6. Expand review states to: pending | clean | held |
     returned_for_edit | rejected | expired | withdrawn_during_review.
  7. Add a copying-limits honesty statement to the "who can see" panel
     and to the recipient's post-open menu: "device protections reduce
     accidental exposure but cannot prevent someone photographing the
     screen or manually copying the text."
  8. Add a "Current-state gap" note directly under item 4's archive
     rule: as of 27 July 2026 the backend does the opposite.
     `POST /api/block-partner` calls `deleteMatchData(match.id)`
     (`server.js:2289`), a hard cascade delete across every table
     with a foreign key to `matches.id`, destroying entries for both
     users. The archive-not-delete rule is a prerequisite for Sealed
     Notes, not a description of current behaviour. Any note attached
     to a match would be destroyed by a block under today's code.

Do NOT edit for these four (still open, awaiting Anushka's decision):

  • Reread policy (open once vs reread-until-withdrawn)
  • Channel-closure timing (immediate vs coarse session boundary)
  • Room-anonymous identity display ("your partner in this Room" vs
    per-Room pseudonym)
  • Whether recipient's channel-closed preference persists across
    future matches

Add a new section at the top of proposal-sealed-notes.md titled "Open
decisions" that lists all four in one paragraph each. Do not answer
them.

WORKFLOW

Before any code:
  1. Read all files listed above.
  2. Produce a short implementation plan with file list and API
     dependencies.
  3. Confirm every endpoint you plan to call is already live on the
     backend per docs/web-functionality-map.md.
  4. If any endpoint is missing, stop and document the contract as a
     gap in docs/api-gaps.md; do not invent it.

After code:
  1. npm run typecheck must pass.
  2. npm run lint must pass.
  3. npm test must pass. There are 30 tests today (8 client + 9 sky +
     13 quiz). Do not delete any of them.
  4. Add new tests in test/safety.test.js for the safety API layer —
     mocked fetch, at least: block-partner, report, switch-partner
     (with double confirm; canSwitch true path), rematch-request
     (with double confirm; canSwitch false path), export (payload
     passthrough), delete (triple confirm), Google-delete path shows
     the exact copy above. The canSwitch branching UI has its own
     test: given a mocked /api/me with canSwitch true, the shown
     button posts to /api/switch-partner; given canSwitch false, it
     posts to /api/rematch-request.
  5. Expo Android build succeeds.
  6. Screens tested at 360px and 430px.
  7. Loading, empty, error and offline states all visible on the new
     surfaces.

DRAFT PR ONLY. Do not merge. Do not deploy. Do not push the web repo.

THE INSTRUCTION TO REPEAT

Do not build the Sealed Notes feature. Its proposal matures now; its
implementation waits for batch-one retention data and for the Slice
0.5 backend safety foundation. This slice is Mobile Safety Surfaces —
plumbing that must exist before any disclosure feature ships.
```

---

## Changes from the earlier draft

Recorded here for the git trail.

Round one (Rashmi's verification pass):

1. Endpoint paths corrected: `/api/block` → `/api/block-partner`,
   `/api/rematch` → `/api/rematch-request`. `/api/report`,
   `/api/my-data`, `DELETE /api/account` unchanged.
2. Tab shell corrected from "five" to "four". Route-file-vs-label
   mapping stated explicitly, because `app/(tabs)/create.tsx` is
   labeled "Shelf" and `app/(tabs)/rooms.tsx` is labeled "Sky" — a
   Codex reading only file names would build wrong.
3. Test count corrected from "17" to "30" (8 client + 9 sky + 13
   quiz).
4. `src/theme.ts` note corrected. Still imported by two files; not
   deprecated in this slice.
5. "six" → "seven" cleanup edits; renumbered so the count matches
   the list.
6. Google-delete copy pre-answered rather than left as a runtime
   discovery.
7. Helpline endpoint marked as a documented gap. Two options offered
   (defer or consume-if-added), no invented URL, no hardcoded list.

Round two (Rashmi's second pass, caught safety-critical errors in
round-one additions):

8. `/api/switch-partner` reclassified as a user control, not admin.
   Verified against `routes/app.js:816` (apiLimiter, requireAuth) and
   the web UI at `public/app.js:2521`, `:2918`, `:2935`. Shipping the
   earlier "admin-only" guidance would have made mobile less safe
   than web — a user with a silent partner would have no way to move
   on. Corrected.
9. `/api/rematch-request` semantics de-asserted. The prompt asks
   Codex to read both routes side by side and write a one-line
   summary of each before wiring. Under no circumstance ships without
   a user-facing move-on action.
10. Google-delete email corrected from the invented
    `hello@mymentallyprepare.com` (does not exist; wrong domain) to
    `privacy@mentallyprepare.in` (already published in privacy.html).
    Note the domain split: product runs at mymentallyprepare.com,
    correspondence is on mentallyprepare.in. The invented address was
    wrong in both halves.
11. "within seven days" promise removed from the delete copy. Not
    committing a timeframe on a manually-monitored inbox unless
    Anushka commits to a monitoring schedule.
12. Google-account detection method specified: read `authProvider`
    from `/api/me` safe user payload; do not attempt the DELETE first
    to discover the failure.

Round three (Rashmi audited the two rematch routes so Codex would
not have to; result changed the design):

13. Both rematch endpoints ship. `/api/switch-partner` is gated on
    `canSwitch = daysSinceActive >= 5 && switchesRemaining > 0`;
    `/api/rematch-request` files a request for human review with
    no gating. Shipping only switch-partner would strand the user
    with an active harmful partner — the exact case this slice
    exists to serve. Wire the visible button conditionally on
    `partnerStatus.canSwitch` from /api/me (already exposed at
    routes/app.js:145).
14. Test list updated to cover both endpoints and the canSwitch
    branching UI, not one hypothetical rematch action.
15. Block semantics flagged as still unaudited. If block does not
    also unassign the match, then rematch-request is load-bearing
    after block, and the block confirmation copy must direct the
    user to the rematch action. Codex confirms against
    routes/app.js:928 before wiring the confirmation.

Round four (Rashmi audited routes/app.js:928 so Codex would not have
to; result changed the block copy and revealed a Sealed-Notes-side
gap):

16. Block-partner semantics resolved: three statements in one
    transaction. Blocks the partner, auto-files a report of type
    `block`, then hard-cascade-deletes match data via
    `deleteMatchData(match.id)` at `server.js:2289`. Entries,
    reactions, comments and nudges are destroyed for BOTH users.
    The blocked partner loses their own writing and is not told why.
17. Block confirmation copy rewritten to disclose the data loss —
    the server's own success string omits it. Two-step, not three,
    because block is a safety action; other destructive actions get
    more friction.
18. Cleanup edit 8 added to the Sealed Notes cleanup list. Item 4
    of the cleanup list says matches are archived not deleted;
    that is the desired state, not the current state. Without a
    "Current-state gap" note, a future session would build Sealed
    Notes on a foundation that silently destroys notes on block.
19. Two open product questions surfaced but held: whether unilateral
    block should destroy the other person's writing with no notice,
    and whether `deleteMatchData` should become a soft archive
    before any disclosure feature ships. The second must be answered
    before Sealed Notes; both are Anushka's calls. Recorded here so
    they are not lost.
