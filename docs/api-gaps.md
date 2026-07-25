# API gaps — contracts the mobile app needs and Express does not have

Opened 25 July 2026. One backend: the Express service in the web repo
(`decision-backend-express-stays.md`). When a mobile screen needs an endpoint
that does not exist, the procedure is fixed:

1. document the missing contract **here**
2. write a typed interface in `src/api/`
3. render a truthful unavailable state on the screen
4. **do not invent data**
5. propose the Express endpoint in a separate note, not in this repo

Nothing in this file is implemented. Nothing here should be faked to make a
screenshot look finished.

---

## Blocker before any of it: the Rooms name collision

The web app has a live feature called **Rooms** — themed community card
spaces, `routes/rooms.js`, shipped in PR #34. The mobile **Rooms** tab is the
21-night relationship container. These are unrelated features and cannot meet
one API under one name.

Flagged 21 Jul (directive ledger item 6), still unresolved on 25 Jul. It
blocks every row in the "Rooms" section below, because the moment mobile asks
for `/api/rooms` it gets community card spaces.

**Proposed resolution:** rename the web-side feature to **Spaces**
(`/api/spaces`, `spaces` table) or scope it web-only and never expose it to
the mobile client. That is a web-repo change and needs Anushka's decision
before either repo moves. Until then, `rooms.tsx` reads Room state out of
`/api/me` and asks for nothing else.

---

## 1. Discovery

Powers the Discover tab, currently a truthful unavailable state.

| Need | Status |
|---|---|
| A daily shortlist of resonant people | No endpoint |
| A `CompatibilityReason` per person | No contract |
| Profile fetch by pseudonymous id | Partial — `GET /api/shelf/user/:userId` exists but is matched-partner-only, 404 for everyone else |

**Open product questions that must be answered before a contract can be
written.** These are design decisions, not implementation details:

- Server-computed daily edition, or user-triggered search? The never-build
  list forbids infinite feeds, so a finite daily set is the shape — but that
  means a cron job and a stored shortlist, not a query.
- What is the overlap threshold below which a person simply does not appear?
- What does a `CompatibilityReason` render as **text**? Constrained hard by
  ledger item 4 and the 20 Jul score decision: it may only surface a shared
  true fact, attributed to the world — "you both shelved *Past Lives*" — with
  no numbers, no percentages, no system-voice judgment. If it cannot be
  phrased as a fact both people can independently see about themselves, it
  does not ship.
- Does appearing in discovery require opt-in? The anonymity thesis was
  rescoped (ledger item 3) but the safety copy has not been re-checked
  against it, which is a prerequisite, not a follow-up.

## 2. Sparks

The interest signal between two people, before a Room exists. No table, no
routes, no contract. Blocked on discovery — a Spark needs someone to send it
to.

Needed eventually: send, list received, list sent, withdraw, accept
(→ creates a Room), decline. Decline must be silent to the sender; a
"declined" notification is a human moment made worse.

## 3. Taste identity beyond the Shelf

`shelf_items` ships five fixed slots (`song_a`, `song_b`, `film`, `book`,
`memory`) via `cbc839e`. The directive's broader taste identity — music,
films, books, anime, meaningful memories — is wider than five slots.

Open: does taste identity extend the Shelf schema, or is it a second
structure? `decision-stardust-vs-living-night.md` salvaged "taste categories
beyond the Shelf — games and shows" as an open product question. Same
question, still open.

## 4. Rooms (21-night container)

Blocked on the name collision above.

| Need | Status |
|---|---|
| Room state | Works today, read from `/api/me` |
| Room progress / connection history (the old Sky) | Derivable from `/api/me` entries; no dedicated endpoint |
| Multiple concurrent Rooms | No contract. `/api/me` assumes one match |
| Leave a Room | No endpoint |

The "multiple Rooms" row is the significant one: the tab is plural, the
backend is singular. Either the tab is honest about holding exactly one Room,
or `/api/me` changes shape. That is a product decision.

## 5. Silent room

Web routes exist (`routes/silent.js`: feed, post, resonance, presence count).
Not typed for mobile.

Removed from primary navigation on purpose — the previous mobile version
invented its content ("43 awake here tonight") which is exactly what this
document exists to prevent. If Silent returns it returns as a room-presence
state backed by the real routes, with the real presence count, or not at all.

## 6. Reveal, safety, account

Backend has all of these. Mobile has none of them. No new contract needed —
this is client work against endpoints that already exist:

- `POST /api/reveal` — Day 21, both must opt in
- block / report / rematch / switch-partner (`routes/app.js`)
- `GET /api/my-data`, `DELETE /api/account` — GDPR self-serve
- push subscribe / preferences

All of these live in the **dark utility** temperature: near-black, native
controls, explicit confirmation, no atmosphere around a destructive action.

## 7. Push notifications

`fcm_token` column not added to `users`. `sendGentlePush` fallback chain
(FCM → web push → email) not built. Prereqs documented in
`master-brief-the-quiet-app.md` (Track A). No mobile-side contract yet
because there is nothing to register against.

## 8. Presence-only partner projection

`/api/me` currently sends partner entry **text** to the client. The Living
Night phase 2 rule is positions only, never content — the sky needs day
numbers and timestamps and nothing else.

`src/api/me.ts` already types `PartnerEntryPresence` as `{ day, created_at }`
and documents that the server projects the text out. **It does not yet.** The
client is typed for a contract the server has not honoured, so the text is
arriving and being ignored rather than never being sent.

This is the highest-priority item in this file: it is a privacy gap, it is
already on the salvage list (`decision-backend-express-stays.md`, item 3),
and it is a small Express change rather than a new feature.
