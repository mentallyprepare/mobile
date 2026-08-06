# Proposal — Sealed Notes

Drafted 27 July 2026 by Anushka. Reviewed 27 July 2026 by Rashmi Kumar
(see review block at the end). Supersedes `proposal-secrets-drip.md`,
which used a "secrets you earn" framing that this proposal rejects.

Status: **draft, gated, not built.** Reads as a hero-feature candidate
for the ritual (Rooms) surface — not for Discover, not for Home outside
of a Room. Ships only if batch-one retention data confirms Night 4–7
drop-off.

## Governing principle

> A note is never the price of participation, and completing a
> reflection never creates a right to another person's disclosure.

This sentence sits above every other rule in this document. If any
implementation decision cannot be reconciled with it, the decision is
wrong.

## Rejected framings

Recorded so the mistake is not repeated in a later revision.

- ✗ "You earn a secret by sealing." Framing sealing as the price of
  admission to someone else's vulnerability turns reflection into a
  transaction. Rejected by Rashmi 27 Jul; accepted as final.
- ✗ "Secrets, heavy secrets, unlock what they are hiding."
  System-voice, extractive, and it primes the writer to escalate.
  Rejected.
- ✗ "Six secrets required at signup." Cost too high at exactly the
  moment users have least trust; also loads the arc with pre-committed
  material at the moment of least self-knowledge. Rejected.
- ✗ "Server auto-releases the note in the seal response." Server side
  cannot disclose content merely because an entry was sealed. Rejected;
  see the "sealing does not send" rule below.

## The mechanic

Inside an active 21-night Room, either person may write **optional
sealed notes** for their current partner. After they finish tonight's
reflection, one previously-approved note from their partner may open,
if the recipient chooses to open it.

The reflection is the ritual. The note is a small, chosen moment of
connection.

## The ten consent rules (from Anushka's spec, unchanged)

1. Notes are optional; none are required during signup.
2. A person can begin with one note and add more later.
3. The writer chooses the order.
4. Any unrevealed note can be edited or withdrawn.
5. Before a sensitive or Night 21 note opens, the writer confirms it
   again.
6. Night 21 requires fresh consent from both people.
7. Declining a reveal has no penalty and is not disclosed to the other
   person.
8. Unrevealed notes never transfer automatically to a new partner.
9. After rematching, the writer must individually approve notes for the
   new recipient.
10. A recipient can hide or report a note and stop future reveals
    without losing their streak.

## The four decisions (from Rashmi's review)

Consent belongs to a recipient and context, not just to the content.
The lifecycle has four distinct states, not two:

1. **Write** — enter text; nothing sent, nothing queued, private draft
   on device.
2. **Save privately** — persist as a draft on device and server;
   still nobody sees it.
3. **Approve for named partner** — the writer explicitly names the
   current recipient the note is for. UI wording: "Approved for
   [partner display name / your partner on Night 3]." A note approved
   for A cannot be released to B.
4. **Release** — the note enters the recipient's queue and becomes
   openable next time they seal.

Sealing does not send. Sending requires the writer to have separately
released a note for the specific current partner.

## Withdrawal, per state

Different words for different states. Never a single "throw away."

- **Draft:** deleted; nobody has seen it. UI: "Delete draft."
- **Approved but not released:** removed from the queue before it
  reaches the recipient. UI: "Withdraw."
- **Released and unopened:** removed from the recipient's queue; they
  may or may not have already seen the "a note is waiting" cue. UI:
  "Withdraw." Message shown to writer: "The note has been removed
  from Mentally. We can't tell whether it was previously seen or
  copied."
- **Opened:** removed from future app access. Cannot be unseen or
  uncopied. Same honest message as above.

The system never tells the writer whether the recipient opened the
note. That would turn withdrawal into a probe.

## Who can see a note

Panel 1 of the writer's consent screen must state, plainly:

> This note can be seen by your current partner and, if our safety
> check flags it, a trained member of our team.

Never "only your partner" if the safety pipeline can inspect content.
The screen additionally links to a details layer that describes:

- The partner sees the writer's pseudonymous identity during Nights
  1–20 (no real name, no photo, no email). At reveal (Night 21) each
  side may choose to reveal name.
- Automated screening runs on every note. Human review only occurs on
  flagged notes. Human review is logged in an audit table.
- Drafts are stored for the writer's own reference until deleted;
  released notes are retained per the retention policy in
  `docs/privacy.md` (to be written).
- Mentally is not monitored continuously and is not an emergency
  service.

## Device privacy (Rashmi's addition)

For the target user — a young adult in India, often at home — the
threat model is "someone in the house sees this," not "someone at
Mentally reads this." Every one of these ships in the notifications
slice, not later:

- Notification copy: neutral only. "Mentally has something for you."
  Never "a sealed note is waiting" or the partner's name.
- Notification content: no note body in the payload, no title of the
  writing prompt.
- App-switcher concealment: iOS `applicationDidEnterBackground` blurs
  the screen; Android sets `FLAG_SECURE` on the notes surfaces
  (writer's drafts and recipient's opened notes only, so the rest of
  the app is still screenshot-able for support/debugging).
- Optional biometric / device PIN gate on the notes surface,
  separate from app auth. Off by default; setting is one tap in You →
  Privacy.
- Quick-hide gesture on the reader view: two-finger swipe down returns
  to Home. Discoverable via a one-time hint on first open, never
  again.
- Notification preferences honour "no notes cues at all" as a
  first-class option in the notifications settings, not buried.

## Recipient's four choices (Rashmi's addition, replaces my earlier
list)

When a note is available, the recipient sees a card offering:

1. **Open now.**
2. **Keep sealed.** Stays available; no penalty.
3. **Decline this note.** Removes this specific note from the queue.
   Writer sees: nothing distinguishing this from "keep sealed" — anti-
   probe.
4. **Close notes for this match.** Stops all future note releases in
   this pair. Writer's release attempts are silently no-ops thereafter;
   the writer sees a single one-time neutral message: "Notes are no
   longer available in this match." Timing is not disclosed. The
   recipient is never notified about later writer attempts.

Closing notes for a match does not affect the ritual or the streak.

## Emotional-safety controls

Before opening:

> This may be personal or unexpected. You can leave it sealed without
> affecting your match or progress.

After opening, the recipient sees these actions available (all in one
overflow menu, not layered under a share sheet):

- Hide this note.
- Report this note.
- Close notes for this match.
- End or pause the match.
- Access support (links to `crisis_review` handoff and helpline copy
  from the web app's locale-aware list).

The recipient is never asked to respond, acknowledge, or reassure the
writer. There is no "reply" button and no reaction affordance.

## Rematch

At rematch, every unrevealed note the writer had for the old partner
returns to **private draft**. No note travels by default.

The writer sees a per-note review screen listing each old-partner draft
separately. For each, three options: keep as private draft only,
delete, or explicitly reassign to the new partner. The new partner's
identity is not shown next to the old partner's context until the
writer starts a reassignment.

While a draft is attached to a past partner, its label reads "Written
for your partner on Night [N]" — never the past partner's name — so
the historical identity is not persistently stored inside the writer's
app.

## Prohibited content

The safety pipeline must screen for, not only crisis language:

- immediate self-harm or suicide indicators
- threats or intimidation
- harassment or sexual pressure
- instructions for self-harm
- personally identifying information (real names, phone, email,
  addresses, socials)
- private information about third parties
- blackmail or coercion
- sexual content involving minors (mandatory reporting under Indian
  POCSO Act)
- attempts to move an anonymous relationship off-platform to
  identifiable channels

A flagged note remains **unreleased** while it is under review. The
writer sees a status: "This note is being checked. It will not open for
your partner until the check is done." No detail about what triggered
the check. Human review target: within 24 hours; if it slips, the note
returns to the writer with a note-eligible-for-edit state.

## Human review, precisely

Copy shown to the writer before typing:

> A person on our team may read notes our safety check flags — not to
> judge your writing, but to protect both of you. Reviewers can hold a
> note back or, in rare cases, contact you. Mentally is not monitored
> continuously and is not an emergency service.
> If you or someone you know is in immediate danger, please use one of
> the numbers below.

The screener promise is not that intervention will happen. Only that
the note may not release.

## Technical requirements

- Note bodies encrypted in transit and at rest.
- Note bodies excluded from server logs, analytics, and error reports.
- Staff access to note bodies restricted to a `moderator` role and
  gated on a review-required flag from the screener. Every access
  logged in a `note_reviews_audit` table with reviewer id, note id,
  reason, timestamp.
- Deletion and retention policies documented in `docs/privacy.md`
  (to be written); this proposal blocks on that doc.
- Rate limits: max notes-per-day-per-writer, max release-attempts-per-
  hour, so a writer cannot flood a partner even if they have a large
  bank.
- Notes are always dependent objects on an active `match_id`; deleting
  a match cascades to notes.

## Data model (provisional, on the Express backend)

```
notes
  id, writer_user_id, match_id_at_write, body_encrypted,
  position, created_at, updated_at,
  approved_for_match_id NULL, approved_at NULL,
  released_at NULL, review_status ENUM('pending','clean','held'),
  withdrawn_at NULL

note_openings
  id, note_id, opened_by_user_id, opened_at

note_reviews_audit
  id, note_id, reviewer_user_id, reason, action, timestamp
```

`approved_for_match_id` separate from `match_id_at_write` is what
makes rematch consent-per-note work.

## Endpoints (provisional)

- `POST /api/notes` — create a private draft. Runs screener; returns
  `review_status`. Never releases.
- `PATCH /api/notes/:id` — edit body. Re-runs screener. Legal only
  while `released_at IS NULL`.
- `POST /api/notes/:id/approve` — approve for the current partner
  (writer supplies match id; server verifies pair is active).
- `POST /api/notes/:id/release` — release for the current partner.
  Legal only if approved for current match id and screener is `clean`.
- `POST /api/notes/:id/withdraw` — remove from queue or from future
  access. Server never returns whether recipient opened.
- `DELETE /api/notes/:id` — delete a private draft.
- `GET /api/notes/mine` — the writer's own bank and per-note state.
- `GET /api/notes/waiting` — recipient's next available note, only
  after they have sealed tonight. Returns metadata, not body.
- `POST /api/notes/:id/open` — recipient explicitly opens. Server
  returns body once, records `note_openings` row.
- `POST /api/notes/:id/decline` — recipient dismisses this specific
  note.
- `POST /api/match/:id/notes-close` — recipient closes the channel for
  this match.

Sealing (`POST /api/entry`) response does **not** include note body.
It may include only availability (`sealedNote: { available: true }`)
for the recipient's own UI to fetch metadata. This preserves the
"server does not disclose content because an entry sealed" invariant.

## Language rules

Avoid:

- "Earn a secret"
- "Heavy secret"
- "Unlock what they're hiding"
- "She" — always "your partner" or the chosen display name; gender is
  never assumed.
- Compatibility scores
- First-person system voice ("we picked this for you")

Use:

- "A sealed note is waiting"
- "Something they chose to share"
- "Your note can remain sealed"
- "Finishing your reflection opens tonight's note"
- "Approved for [name]"
- "Withdraw" for taking a note back
- "Close notes for this match" for channel closure

## Accessibility

- Plain-language version of the consent flow at approximately 8th-
  grade reading level.
- Translations at minimum in Hindi, Tamil, Bengali, Marathi. The
  target user is Indian, and English-only consent flows exclude a
  significant part of the demographic.
- Every choice has an `accessibilityLabel` and, where useful, an
  `accessibilityHint`.
- Dynamic type supported throughout the notes surface.
- No meaning communicated only through colour or animation. State
  labels are always present in text.
- Reduce Motion honoured — no shared-element transitions on notes
  surfaces, since motion could mask a state change.

## Initial experiment

Small opt-in cohort. Parameters:

- Maximum three notes per writer during the experiment.
- No mandatory signup deposit.
- Light content guidance shown once, in-context, before the first
  note is written.
- Writer confirmation before every release (not just Night 21).
- Withdrawal and reporting available from launch, both visible in one
  tap.
- No automatic reuse after rematching.

Stop conditions (Rashmi's list, adopted):

- Signup abandonment rises.
- Users report feeling obligated to write.
- Recipients report feeling responsible for the writer's wellbeing.
- Reports, blocks, or held notes exceed baseline.
- Writing quality drops (entries written only to access notes).
- Trust between paired users measurably declines.
- Any harmful note passes screening.
- Signup or reflection completion measurably declines.

Success criteria:

- Improves Night 4–7 retention relative to control cohort.
- None of the stop conditions triggered.

## What this proposal does not do

- Does not introduce a compatibility number.
- Does not enter the finding phase (Discover, Sparks, Home outside a
  Room). Sealed Notes is a Rooms feature only.
- Does not treat notes as replies. Writers write; recipients read;
  there is no threaded response.
- Does not gamify. No counts shown ("3 of 6 unlocked"), no streak
  attached to notes, no leaderboards, no rankings.
- Does not tell the writer whether the recipient opened, waited,
  declined, or closed the channel.

## Sequencing (why this is not the next slice)

Even accepting Sealed Notes as a hero-feature candidate, its
foundation depends on work not yet done:

1. Documentation reconciliation (this proposal, plus the retracted
   `current-state.md`).
2. Backend safety foundation — encryption at rest, migration runner,
   IDOR pass, moderator RBAC, staff-access audit, Google-user
   deletion fix, consent completeness. (These are the Slice 0.5 items
   in `docs/agents/current-status.md`.)
3. Mobile safety surfaces — block, report, leave/pause a match,
   export personal data, delete account, manage consent, access
   support. Backend has all of these; mobile does not.
4. Device privacy for notifications — the concealment,
   biometric-gating, and neutral-notification work described above.
5. Retention evidence — batch-one Night 4–7 numbers, completion by
   night, quiet-partner frequency, rematch frequency, report and block
   rates.

Only after 1–5 is Sealed Notes prototyped. The correct order matters
here more than in most features because a broken Sealed Notes shipped
against a fragile safety foundation would be actively harmful.

---

## Review block (Rashmi Kumar, 27 July 2026)

Rashmi's full review is preserved as-is because it drove most of the
material additions above. The abridged summary:

- Renamed "secrets" to "sealed notes" and eliminated the "earn"
  framing entirely.
- Added device privacy requirements as production-blocking, not
  aspirational.
- Split release into four consent decisions (write, save, approve for
  named recipient, release).
- Redefined withdrawal by state; forbade opened/unopened disclosure.
- Added the fourth recipient option: close notes for the match.
- Expanded the safety policy beyond crisis keywords.
- Required precise human-review language.
- Required technical protections (encryption, log exclusion, audit
  trail, rate limits).
- Made rematch consent per-note, without persistent past-partner names
  in drafts.
- Removed all gendered pronouns.
- Added accessibility requirements including Indian-language
  translations.
- Chose the "balanced" release model (save-first, release-second).
- Added experiment stop conditions.

The one small adjustment: past-partner drafts label as "Written for
your partner on Night [N]" rather than the past name, so old identities
don't persistently live inside the writer's app.
