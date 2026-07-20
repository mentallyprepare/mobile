# Decision — Stardust vs Living Night

Decided 18 July 2026. Two decisions, recorded together because they came from the same review.

## 1. Living Night stands. Stardust is not the direction.

A "Stardust Edition" blueprint (compiled 10 July 2026) proposed a different visual and product direction. It was reviewed and **rejected as a direction**. Living Night remains the law: the approved brand package, the invisible-machine rules, and the Night Ritual prototype.

**Why it was rejected:**

- **Re-added the ambient decoration Living Night deliberately cut.** Starfields, orbital spinners, breathing planets. The Living Night principle is that reactive moments carry the life; Phase 1 makes the breathing moon the only ambient animation on Today.
- **Forked the brand.** Georgia + Inter and `#58B2DC`/`#7B5EA7`, against the approved Instrument Serif + Manrope on `#B4A8F4→#413670` / `#050311`.
- **Introduced a fourth archetype system** (Quiet Storm / Cosmonaut / Nebula / Safe Harbor) without reconciling the existing ECP-11 archetypes or the prototype's "the mirror" / "the protector".
- **Changed matching logic**, which Living Night lists as out of scope and the Master Brief gates behind scale and consent.
- **Was written for the web app** (Express routes, `public/app.html`, SQLite migrations) after the pivot to a fresh native Expo app.

**Technical faults found in the proposed implementation** (worth remembering so they are not repeated):

- The taste fallback was `Math.round(Math.random() * 15 + 40)` — it fabricated a compatibility number when there was no real overlap and showed it to users. Never ship a fabricated number.
- Cosine similarity over all-positive summed score vectors lands near 0.9 for almost any two people. Every pair would read 87–95%, which is noise presented as insight.
- `ALTER TABLE ... ADD COLUMN` has no `IF NOT EXISTS` in SQLite; re-running the migration throws. Migrations need guards.
- `/api/profile/setup` risks colliding with the existing `/api/profile` in `routes/app.js` depending on mount order.

**Salvaged for later, not now:**

- The **11-dimension psychometric mapping** (emotional regulation, attachment, social energy, coping, vulnerability, night mind, support preference, expression mode, resilience, connection depth, inner-world metaphor). Richer than the current quiz; a candidate to deepen ECP-11.
- **Taste categories beyond the Shelf** — games and shows alongside song/song/book/film. Open product question.
- **Cosine + Jaccard as offline machinery** for Track D compatibility matching, computed off the user's path.

## 2. Compatibility score: superseded on 20 July 2026.

The earlier permission to show a score is superseded by the approved MP-006
backend boundary. The current implementation stores versioned explanation
evidence but exposes no compatibility percentage. Any future score requires a
new product, fairness, safety, and evidence review.

### Historical decision below

**This reverses a standing rule.** The Master Brief's rule 3 and never-build list previously forbade showing compatibility numbers to users. As of 18 July 2026 that is overturned by Anushka's decision: a compatibility score **may** be shown.

Narrow scope of the reversal — everything else in the invisible-machine rules stands:

- Rule 1 (never say "AI"), rule 2 (machine never speaks in first person), rule 5 (nothing model-computed in the user's way), and rule 6 (the human wins) are unchanged.
- Rule 3's first half is unchanged: attribute to the world, not the system. No "we picked this for you."
- Rule 4 is unchanged and now constrains how the score is displayed: precision reads as surveillance.

### Requirements for an honest score

If a number is shown, it must be real. Non-negotiable:

1. **No fabrication.** If either profile is incomplete, show nothing at all. Never fall back to a random or floored value.
2. **Real spread.** Do not use cosine similarity on raw positive sums — it compresses everyone into the high 80s. Normalize each bipolar dimension to 0–100 per user, then score as `100 − mean(|a − b|)` across the texture axes, so genuinely mismatched pairs see genuinely low numbers.
3. **Taste via plain Jaccard** across the shared categories, with no floor and no randomness. Zero overlap means zero.
4. **Round soft.** Nearest 5, no decimals. "85" not "87.5". A number with a decimal point claims a precision this does not have.
5. **Computed offline**, at match time, stored — never a spinner in the user's path.
6. **One number, not a dashboard.** No per-dimension breakdown, no mood graphs, no sentiment charts. Those remain on the never-build list.

### Open question, flagged not answered

Similarity is assumed here to mean compatibility. For a journaling peer match that is a hypothesis, not a fact — shared night-mind may matter while complementary coping styles may matter more. There is no data to settle it yet. Revisit once there are enough completed 21-day arcs to compare score against reveal rate.

### Where this lands

Matching lives in the **web repo** (`routes/`, the matching job), not this one. The score is surfaced in the native app once the web side computes and exposes it. Not scheduled yet.
