# Proposal — The Shelf contract

Draft, 21 July 2026. Needs Anushka's sign-off before implementation.
Reads together with `directive-native-social-app.md`, `the-version.md`
(the finding phase = the shelf), and the original ritual-era Phase 4
sketch (which this supersedes).

## Why now

The version's finding phase is "songs, films, books, memories that
resonate." The shell shipped in slice 1 has three surfaces pointing at
"the shelf" and truthful-empty-stating that it's not built:

- Create tab (contextual → "Add to shelf" when out of a Room)
- Discover ("first, you build a shelf…")
- You (the old fake shelf was pulled, correctly)

Until this contract is signed off, three screens truthfully explain
they are waiting. Signing it off unlocks all three.

## Two decisions I need before code

**1. Which taste categories ship in v1?**

- Original ritual sketch (Phase 4): `song`, `song2`, `book`, `film`.
  Four fixed slots, two songs allowed on purpose.
- New directive: "music, films, books, anime and meaningful memories."

Recommendation: **v1 ships `song`, `film`, `book`, `memory`.** Reasons:

- `song / film / book` are the three the ritual sketch and the
  directive agree on.
- `memory` (a short one-line thing that happened, no photo, no place)
  is the honest emotional item and reads like the product's voice.
- `anime` is a specific case of a `film` or a `show`; adding it as its
  own category invites "why not comics, why not games" and fragments
  the shelf. Ship without; the community teaches us if it's needed.
- Two songs (`song`, `song2`) — the ritual sketch's instinct — is a
  taste truth (people define themselves by two songs, not one), but
  it makes the schema quirky. Alternative below.

**2. Fixed slots or free-form list?**

- **Fixed slots (recommended):** every user's shelf has exactly the
  same slots. Empty ones are visible and dimmed. `POST /api/shelf/song`
  fills one, and there is at most one row per `(user_id, kind)`. Two
  songs = `song_a`, `song_b` slots. Discovery matching is set-based
  and simple; UI is quiet.
- **Free-form list:** users pick as many as they want per category.
  More expressive; harder to compare across users, harder to render
  quietly. EQUALS's Vinyl Wall is this shape, and it grows.

I lean **fixed slots** for v1: it fits the app's voice (quiet, few),
makes Discover math tractable, and does not close the door on
free-form later. If the answer is free-form, most of the schema below
still applies — the difference is a `position` column and a
`(user_id, kind, position)` primary key.

## Proposed schema (Express / SQLite side, additive)

```sql
CREATE TABLE IF NOT EXISTS shelf_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL,   -- 'song_a' | 'song_b' | 'film' | 'book' | 'memory'
  title       TEXT NOT NULL,   -- max 120 chars, PII-scanned
  detail      TEXT,            -- artist / author / director / null for memory. max 120 chars, PII-scanned
  external_id TEXT,            -- future: iTunes/OpenLibrary id for matching, unused v1
  artwork_url TEXT,            -- future: album/book cover, unused v1
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  UNIQUE(user_id, kind)
);

CREATE INDEX IF NOT EXISTS idx_shelf_user ON shelf_items(user_id);
```

Notes:

- `title` and `detail` both run through the existing PII scanner. This
  is not an escape hatch from the anonymity rule — the shelf is
  visible on Discover, and a memory that says "my breakup with Ravi in
  Bangalore last April" is a real name and a real place.
- `memory` uses `title` for the line, `detail` NULL.
- `song_a` / `song_b` in schema; UI labels them "two songs." Users do
  not see the underscore.
- No photos. No free-text bio. Not browsable beyond your own match's
  shelf and Discover's daily shortlist (see below).

## Proposed endpoints (Express)

All bearer-authed. All PII-scan on write.

```
GET  /api/shelf                     -> { items: [ShelfItem, ...] }        (my shelf)
GET  /api/shelf/user/:userId        -> { items: [ShelfItem, ...] }        (someone else's — see auth notes)
PUT  /api/shelf/:kind               -> upsert one slot: { title, detail } (max 120 chars each, PII-scanned)
DELETE /api/shelf/:kind             -> clear one slot (does not delete history)
```

Auth on `GET /api/shelf/user/:userId`:

- If `:userId` is your matched partner → 200, respecting the ritual's
  unlock schedule (song_a on night 3, song_b on night 7, book on
  night 14, film on reveal). Memory: never revealed unless both
  choose to (Day-21-mirror gate, later).
- If `:userId` was surfaced to you by Discover today → 200, all
  categories except `memory`.
- Otherwise → 404 (not 403; do not leak existence).

No pagination, no listing, no search of shelves by content. Discovery
is the only way to *see* someone else's shelf; you cannot go looking.

## Mobile flow (what the three waiting screens become)

**Create tab (`app/(tabs)/create.tsx`)** — when out of a Room, opens
a chooser: five tiles, one per shelf slot, each showing its current
value or "add." Tapping opens the per-kind add screen (a single input
for `title`, optional `detail`, character counter, PII warning if
triggered, `save it` button).

**You tab (`app/(tabs)/you.tsx`)** — the "your shelf" section returns.
Shows only real filled slots. Empty slots are one dimmed row: "add a
song." Tap → same per-kind add screen.

**Discover tab (`app/(tabs)/discover.tsx`)** — needs its own contract
(next proposal). Discovery is *not* just "list all users." Sketch:
`GET /api/discover/today` returns up to 5 users, chosen server-side,
whose shelves overlap yours on set membership (not scored, not
percentage — a CompatibilityReason returns one shared truth, e.g.
"you both shelved Past Lives," per `directive-native-social-app.md`).

## What this does not include on purpose

- **Album art / covers.** iTunes Search API is free and unauthenticated
  and would populate `artwork_url` client-side, cached in
  SecureStore. Original ritual sketch called for it. Leaving it out
  of v1 keeps the shelf typographic and honest to the "quiet" voice —
  the moment covers arrive, this becomes a music app that displays
  songs. Add later, deliberately.
- **Sparks.** Sending a spark to someone based on their shelf is the
  next contract. Needs consent language, rate limits, safety.
- **Editing history.** Users can overwrite a slot freely for v1; we
  do not surface "you changed your song six times." Add if it
  matters for retention analysis, silently.

## Open questions I cannot answer

- **`memory` character limit.** 120 chars is a tweet-ish honest line;
  the ritual writing already goes longer. Higher makes it prose;
  lower forces poetry. Anushka.
- **Whether `memory` is visible on Discover or purely for the ritual
  reveal.** The safer answer is "ritual only" — surfacing a real
  memory on a discovery card raises the emotional stakes of matching
  in a way we can't UX for yet.
- **Rate limit on shelf edits.** Suggest 10 saves per hour per user,
  reused from `apiLimiter` — enough for real curation, catches bots.

## Sign-off checklist

- [ ] Categories: `song_a`, `song_b`, `film`, `book`, `memory` — yes / edit
- [ ] Fixed slots — yes / free-form / hybrid
- [ ] `memory` visible on Discover — no (recommended) / yes
- [ ] `memory` character limit
- [ ] Album art in v1 — no (recommended) / yes
- [ ] The four write surfaces above are the right ones — yes / edit

Once these are answered, the schema, endpoints, and mobile add screens
are one focused session.
