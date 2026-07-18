# Master Brief — The Quiet App

The full build plan for taking Mentally Prepare from webapp to the app it should be, with one governing rule: **no user should ever think "AI" while using it.** The intelligence works in the dark so two humans can find each other. 8 July 2026.

## The invisible-machine rules (apply to every feature, forever)

1. **Never say it.** No "AI", "smart", "powered by", "personalized for you", no sparkle icons. If a feature needs to explain that it's intelligent, it failed.
2. **The machine never speaks in first person.** No feature writes sentences *to* the user as if it knows them. Output is either the user's own words reflected back, or curated human-written copy selected by rules.
3. **Attribute everything to the world, not the system.** Not "we picked this prompt for you" but simply tonight's prompt.
   > **Amended 18 July 2026.** This rule originally also forbade compatibility numbers ("not 'your match is 87% compatible'"). That part is overturned: a single compatibility score **may** be shown to users, subject to the honesty requirements in `decision-stardust-vs-living-night.md` (no fabricated values, real spread, rounded to the nearest 5, computed offline, one number not a dashboard). The rest of this rule stands, and other numbers about people stay in the admin panel.
4. **Perfect timing reads as care, precision reads as surveillance.** "your match wrote something last night" feels human. "your match wrote 214 words at 11:52pm" feels watched. Round everything soft.
5. **Latency is atmosphere.** Anything model-computed happens offline (cron, at-seal, at-match), never as a spinner the user waits on. The app is instant because nothing intelligent runs in the user's way.
6. **When in doubt, the human wins.** Any feature that replaces a human moment (a reply, a reaction, a presence) is rejected regardless of quality.

## Build order

### Track A — Delivery (weeks 1–2): the Capacitor app
- Capacitor shell around the existing webapp, Android first. Play Console ($25), FCM via the existing Firebase project.
- Server: `fcm_token` column on users; `sendGentlePush` tries FCM → web push → email. `firebase-admin` already ships; sending is `admin.messaging().send()`.
- Deep links: every notification opens the exact screen (tonight's prompt, the unsealed entry, the reveal).
- Keep the webapp as the acquisition front door; the app is for people already inside.
- Prereqs already agreed: push-permission ask moves to right after the first seal; SPF/DKIM on the domain so email fallback lands.

> Note (18 July 2026): superseded by the decision to build a fresh Expo/React Native app instead of a Capacitor shell. Kept here for the reasoning and the server-side prereqs (FCM column, `sendGentlePush` fallback chain, deep links), which still apply.

### Track B — Aliveness (weeks 1–4): the Living Night
Execute `brief-living-night.md` phases 1–4 (presence moon, time-aware sky, constellation Journey, seal moment, the Shelf). This is what "interactive and alive" actually is: the app reacting to true things. Zero model involvement.

### Track C — Voice (week 1, parallel): the notification bank
- 60–80 lines in the 3am-friend voice, drafted with Claude offline, edited and approved by Anushka, stored as a versioned JSON copy bank.
- Selector (plain rules): day number, partner state, streak state, hour. One push per evening max, quiet hours, no line repeats within 7 days.
- Users experience: an app that texts like a person. No model runs at send time.

### Track D — The dark machinery (staged by scale)

| When | What | User-visible as |
|---|---|---|
| Now | Funnel instrumentation (analytics_events, six numbers signup→reveal) | Nothing |
| Now + consent update | Crisis classifier on flagged entries (severity tiers → crisis_review) | Nothing — only better human follow-up |
| ~3 months of data | Ghost prediction (behavioral features → early gentle nudge) | "the night waited for you" |
| Growth | Send-time bandit (per-user best hour) | Notifications that feel weirdly well-timed |
| ~500 users | Compatibility matching (Shelf + archetype + writing-texture embeddings, consented) | "your match gets it", plus one rounded score (amended 18 Jul 2026) |
| Later | Day-21 mirror (user's own words reflected back, consent-gated, part of the reveal ceremony) | A gift, in their own words |

### Never-build list (standing decisions)
AI companion or synthetic replies · live-generated notification copy · user-facing mood graphs or sentiment dashboards · browsable profiles, feeds, follower graphs · any feature that must be labeled to be understood.

> **Amended 18 July 2026.** "Compatibility scores shown to users" was removed from this list. Per-dimension breakdowns and sentiment dashboards remain forbidden — the reversal permits exactly one rounded number.

## Privacy gates (before any model touches entries)
Consent language + privacy policy update naming exactly what is processed and why (safety classification; matching texture features; the Day-21 mirror). Each individually opt-in-able. Entries never leave for anything the user didn't say yes to. Copy generation (Track C) uses no user data and needs no gate.

## What "perfect" means here, measurably
Day-3 and Day-7 retention up, Day-21 reveal rate known and rising, partner-abandonment (5+ day silence on a live match) falling, and zero users describing the app with the word "AI" in feedback. That last one is a real metric: ask "how would you describe this app to a friend?" in the Day-21 flow and read the answers.

## Session sequencing for Claude Code
1. Notification copy bank + selector (C) — ships this week, no risk.
2. Living Night phase 1 (B) — presence moon, time sky.
3. Funnel instrumentation (D) — before anything else in D.
4. Native app scaffold + FCM (A).
5. Living Night phases 2–4.
6. Crisis classifier behind the consent update.

One session each, one change one retest, minimal diffs, per CLAUDE.md.
