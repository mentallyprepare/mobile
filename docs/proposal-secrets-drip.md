# Proposal — The secret drip

Proposed by Anushka, 27 July 2026. Not yet decided. Retention mechanic for
Nights 3 through 21, aimed at the Day 4 to Day 7 drop-off.

Status: **draft for review**. Backend work lands in the web repo
(Express/SQLite); the mobile app surfaces it. Nothing here is built.

## The mechanic

At sign-up each person deposits **six secrets**, ordered by weight —
lightest first, heaviest last. Through the 21 nights, their partner
unlocks one at a time.

**A secret is earned, not delivered.** You unlock the next one by sealing
tonight's entry. No writing, no unlock. The curiosity is the reason to
show up, and it feeds the ritual instead of competing with it.

Why the ordering matters: the heavy ones land in week three, which is
where people go quiet in most 21-day products. Escalating intimacy tracks
the arc instead of front-loading it.

## Rules

1. **Ordered by the writer, not the system.** One sign-up screen, drag to
   arrange. The writer decides what is light and what is heavy. The system
   never ranks or scores a secret.
2. **Unlocked by sealing.** Seal tonight → the next secret opens. The
   unlock is the reward for writing, and it happens after the seal, not
   before.
3. **Top-up allowed.** Users can add secrets mid-arc (decided 27 Jul). The
   bank is not fixed at six. New secrets append to the end of the queue,
   so added-later means revealed-later, which preserves escalation.
4. **One held back.** A user may lock a single secret until Night 21,
   released only if **both** people opt into the reveal. This is the
   carrot on the whole arc and gives a reason to reveal to someone who
   otherwise would not.
5. **Crisis screening at write time.** Every secret runs through the same
   keyword screener that already guards `POST /api/entry` in `server.js`.
   A secret that trips it never enters the drip pool: it routes to
   `crisis_review` and the writer sees support resources. This is a
   function call on an existing path, not a new system. Non-negotiable.

## Open decisions (need Anushka)

### D1. Rematch trigger

The writer gets rematched when their partner goes quiet. How quiet?

Recommended: **three consecutive unsealed nights**, and the app *offers*
rematch rather than performing it. The existing 9pm quiet-partner nudge
already runs on night two, so this sits one night after a nudge the
partner has already ignored. Offering keeps the choice with the human —
consistent with rule 6 of the governing rules.

### D2. Arc position after rematch

If A is on Night 8 and is rematched with a fresh B, where does A land?

Recommended: **two counters, already present in the data model.**

- `streak` is personal. It is your relationship with the practice and it
  never resets on rematch. A keeps their 8.
- `match.day` is shared. It is your relationship with *this person* and it
  starts at Night 1 for the new pair.

This is the only option that avoids either punishing A (full reset) or
misaligning the secret escalation (A's heavy secrets meeting B's light
ones). `/api/me` already returns `streak` and `match.day` separately, so
the shape exists.

### D3. What happens to a ghost's secrets

Recommended: **already-revealed secrets stay revealed; the remaining ones
stop.** You cannot unknow what you read. But consent to the drip was given
in the context of an active pair, and it ends when the pair ends. The
ghost's unrevealed secrets return to their bank and go to whoever they
match with next.

The mobile copy for this moment matters and is not written yet. It should
not read as a system announcement. Something closer to: "the room is
quiet. it has been three nights." Then the rematch offer.

## Data (web repo)

New tables, provisional:

    secrets
      id, user_id, body, position, locked_until_reveal (bool),
      screened_ok (bool), created_at

    secret_reveals
      id, match_id, secret_id, revealed_to_user_id, revealed_at,
      unlocked_by_entry_id

`unlocked_by_entry_id` is the audit trail proving the unlock was earned by
a real seal. It also makes the whole mechanic testable.

New endpoints, provisional:

    POST   /api/secrets           deposit or append, runs crisis screen
    PATCH  /api/secrets/reorder   drag-to-arrange
    DELETE /api/secrets/:id       withdraw an unrevealed secret
    GET    /api/secrets/mine      the writer's own bank and queue state

The reveal itself is not its own endpoint. It happens as a side effect of
`POST /api/entry` succeeding, and the newly-unlocked secret comes back in
the seal response. One round trip, no spinner, consistent with rule 5.

## Withdrawal

A user can delete any secret that has not yet been revealed. Once
revealed, it is gone from their control — same as an entry. This must be
stated plainly at deposit time, in the writer's own reading level, before
they type anything.

## Mobile surface (this repo)

- Sign-up: one secret-deposit screen, drag to order. Utility temperature,
  no atmosphere, because this is a consent moment.
- Home: the unlocked secret is the night's reward, revealed after sealing.
  Moonlit-warm. One painted object, the envelope-unsealed state.
- You: manage your bank, add, reorder, withdraw.
- The unlock animation is `ritual` (900ms) and interruptible.

## What this does not do

It does not show counts ("4 of 6 revealed"). It does not score or rank
secrets. It does not tell the user the system chose anything. The queue is
the writer's own ordering, reflected back.

## Gate

This ships **after** batch-1 Day 21 numbers are in the repo at
`docs/batch-1-metrics.md`. If people are already completing 21 nights at a
healthy rate, retention is not the bleed point and this is expensive
insurance. If they are dropping at Night 4 to 7, this is the right fix and
it goes ahead of Discover in the slice order.
