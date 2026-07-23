# The version

Chosen by Anushka, 21 July 2026.

> **"It's an app where you find people who resonate — and then some of them and you do the 21 nights."**

That is the sentence a user says when they describe the app to a friend. Every product decision below should be reachable from it.

## What that means, concretely

The app is **one product with two phases**, not two products sharing a shell:

1. **The finding phase** — the social surface. Taste identity, discovery, Sparks, profiles. Public-ish presence: a pseudonymous identity built from what you shelve, not a real name and not a photograph. This is where people meet.
2. **The 21 nights** — the ritual. A container two people opt into together, out of the finding phase. Anonymity comes back on inside it. This is the deep thing.

The finding phase is the front door. The ritual is what the door leads to for the pairs who choose it.

## The consequences (so nothing has to be re-argued)

- **Discovery is not decoration.** It is the entry point. If discovery is broken or empty, the app has no way in — this is why the directive puts Home + Discover first and reads the ritual as *inside Rooms*.
- **Not every user does the 21 nights.** Many will stay in the finding phase, shelving and being seen, never entering a Room. That is a valid path, not a failure state. Retention and success metrics measure both flows separately.
- **Consent to enter a Room is a real product moment.** Two people cross from "found" to "in the ritual together." That handshake needs its own screen, its own copy, and its own safety review — it is not just a matching side-effect.
- **Anonymity is scoped, not global.** In the finding phase you are pseudonymous but recognisable (a shelf is an identity). In the ritual you are anonymous to your partner until Day 21 reveal. Safety, blocking and reporting copy must not conflate the two.
- **The Rooms name collision must be resolved.** The web app already has Rooms (community walls). The mobile "Rooms" here are 21-night relationship containers. They are different things and cannot share a name in front of users.
- **The Silent tab in its current form violates this version.** It sits between the two phases without belonging to either. Slice 1 removes it. If it returns, it returns either as a discovery-side feature or as a room-presence state — not floating on its own.
- **CompatibilityReason must be a shared true fact**, not a system judgement or a number. "you both shelved Past Lives" is the shape. Any language that has the machine narrating an opinion about people is out.

## How the tabs map to the sentence

- **Home** — a finite daily edition of what is happening for *you* in both phases. Tonight's room card when you're in one. The one Spark that came in. Nothing infinite.
- **Discover** — the finding phase.
- **Create** — the actions available to you right now. Shelve something. Write tonight if you're in a Room. Never a button that does nothing.
- **Rooms** — every 21-night container you're currently in or have been in. This is where the ritual lives.
- **You** — your taste identity, your archetype, streak, privacy, account. Not a shelf of invented things.

## What this displaces from earlier records

- "The anonymity is the product" — was true for the ritual-only version. Now anonymity is the *ritual's* property, not the app's. Recorded in `directive-native-social-app.md` already; this doc is the *why*.
- "The app is for people already inside the 21 nights" (from CLAUDE.md's opening line) — was true for the ritual-only version. Now the app is also the finding phase. CLAUDE.md's intro was updated on 21 Jul; this doc is why.
- "The webapp stays the front door" — the webapp remains the acquisition surface for now, but the *native app* also has a front door of its own (Discover). Both facts hold; the earlier record read as though the app had no way in without the web.

## What this does not change

The Express backend as the single source of truth. The no-fabricated-data rule. No compatibility scores shown to users (re-affirmed 20 Jul). The Living Night brand for the ritual world. The invisible-machine rules (never say AI, no first-person machine voice).

## If this sentence changes

It has changed seven times in two weeks. If it changes again, update this file first — dated, in Anushka's name. Everything else should flow from here.
