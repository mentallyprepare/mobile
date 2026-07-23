# Codex build directive — verbatim

Given by Anushka, 21 July 2026. Read together with
`directive-native-social-app.md`, whose reconciliation ledger governs where
this text touches standing decisions (never-build amendments, brand scope,
CompatibilityReason constraint, Rooms naming, palette canonicality).

```text
You are working in the repository:
C:\Users\anush\mentally-prepare-mobile
Your task is to evolve Mentally Prepare from its current four-screen ritual alpha into a real native social application.
This is not a visual prototype task.
Every screen must be:
- connected to real backend state where an endpoint exists;
- explicit about unavailable backend dependencies;
- free from invented profiles, counts, messages or activity;
- accessible;
- testable;
- implemented in reusable components;
- suitable for production Android and iOS use.
PRODUCT DIRECTION
Use:
1. EQUALS as the structural reference for social discovery, taste identity, cultural objects, profiles, activity, reactions and connections.
2. Stardust as the reference for emotional world-building, custom illustration, state-based visuals, motion and distinctive language.
3. Mentally Prepare's existing 21-night ritual as the core original relationship experience.
Do not copy screens, artwork, icons, naming, colour systems or proprietary interaction patterns from any reference.
The product is:
"A social discovery app where people express themselves through music, films, books, anime and meaningful memories, meet people who resonate with their inner world, and optionally build trust through a private 21-night ritual."
BACKEND DECISION
The existing Express backend remains the single source of truth.
Do not:
- introduce a second Supabase backend;
- create another user pool;
- replace the Express bearer-token architecture;
- add local-only fake social functionality.
Before implementing a feature, inspect the existing backend contract.
When a required endpoint does not exist:
1. document the missing contract;
2. create a typed interface;
3. implement a truthful empty or unavailable state;
4. do not invent data;
5. propose the required Express endpoint separately.
PRIMARY NAVIGATION
Replace the old primary navigation:
- Tonight
- Silent
- Sky
- Mirror
with:
1. Home
2. Discover
3. Create
4. Rooms
5. You
Use visible text labels and accessible icons.
Relocate existing functionality:
- Tonight becomes part of an active 21-night Room.
- Sky becomes Room progress or connection history.
- Mirror becomes a section within You.
- Silent must not remain a primary tab.
VISUAL SYSTEM
Build three connected visual environments.
A. DAYLIGHT SOCIAL WORLD
Used for:
- Home
- Discover
- Search
- Taste onboarding
- Profiles
- Inner Shelf
- Sparks
Design direction:
- warm cream or pale lilac backgrounds;
- high-contrast dark ink typography;
- expressive cultural artwork;
- editorial card compositions;
- soft matte 3D objects;
- controlled collage;
- subtle grain;
- varied but muted colours;
- strong spacing;
- clear native actions.
Do not make the whole app dark purple.
B. LIVING NIGHT WORLD
Used only for:
- active 21-night Rooms;
- writing;
- sealing;
- private shared objects;
- connection constellation;
- milestones;
- reveal.
Retain:
- deep ink background;
- moon lavender;
- dusty rose;
- Instrument Serif prompts;
- sparse composition;
- quiet state-based motion.
C. UTILITY WORLD
Used for:
- settings;
- privacy;
- safety;
- account;
- blocking;
- reporting;
- deletion.
Use:
- minimal decoration;
- native controls;
- highly readable text;
- explicit confirmation;
- accessible interaction.
DESIGN TOKENS
Create or refactor tokens into:
src/design/
  colors.ts
  typography.ts
  spacing.ts
  radius.ts
  elevation.ts
  motion.ts
  opacity.ts
  themes.ts
Recommended starting palette:
deepInk: #09071A
nightSurface: #171126
cream: #F5F0E7
paleLilac: #E7E1F8
moonViolet: #A99BF0
dustyRose: #D98EA4
coral: #E58B75
amber: #D7A64A
moss: #74836B
softBlue: #86A5BE
darkPlum: #25152E
These are starting tokens, not a requirement to use every colour on every screen.
TYPOGRAPHY
Use:
- Instrument Serif for emotional display text and ritual prompts;
- Manrope for interface text, navigation, buttons and settings;
- no decorative font for long-form content;
- dynamic type support;
- no critical labels below accessible reading size.
COMPONENT SYSTEM
Create reusable components rather than styling every screen separately.
Required component families:
Navigation:
- AppTabBar
- ScreenHeader
- BackButton
- CreateButton
Cultural identity:
- TasteObjectCard
- TasteObjectTile
- InnerShelf
- ObjectAnnotation
- CategoryChip
- CulturalArtwork
Social:
- PersonDiscoveryCard
- CompatibilityReason
- SparkButton
- SparkComposer
- ConnectionCard
- EmptyDiscoveryState
Rooms:
- RoomCard
- RoomHeader
- NightProgress
- RitualPrompt
- SealButton
- PartnerPresence
- SharedShelf
- ConnectionConstellation
System:
- EmptyState
- LoadingSkeleton
- InlineError
- RetryState
- PermissionSheet
- PrivacyControl
- SafetyMenu
- ConfirmationDialog
Every reusable component must support:
- default;
- pressed;
- loading;
- empty;
- disabled;
- error;
- large-text;
- reduced-motion.
3D AND ILLUSTRATION
Do not attempt heavy realtime 3D throughout the app.
Create an asset interface supporting pre-rendered WebP/PNG and optional Rive animation.
Suggested original object family:
- sealed envelope;
- headphones;
- vinyl record;
- book;
- film ticket;
- doorway;
- connecting thread;
- small flame;
- bowl or cup;
- star fragment;
- memory box;
- protective shell.
Style:
- matte;
- softly dimensional;
- rounded but mature;
- slight texture;
- warm directional light;
- no glossy crypto aesthetic;
- no generic floating blobs;
- no childlike mascot overload.
MOTION
Use React Native Reanimated if it is compatible with the project's Expo version.
Create central motion tokens:
instant: 100
micro: 180
standard: 320
expressive: 460
ritual: 900
Motion rules:
- motion must explain a transition or state;
- no permanent bouncing;
- no continuous motion behind reading content;
- no parallax in reduced-motion mode;
- no information conveyed only through animation;
- all ritual animations must be interruptible;
- gestures must remain responsive during animation.
Reduced-motion behaviour:
- replace slide/zoom/shared-element transitions with fades;
- disable parallax and depth simulation;
- disable repeated floating;
- reduce spring bounce;
- preserve state feedback.
FIRST IMPLEMENTATION SLICE
Do not redesign the entire app in one change.
Build the production-quality application shell first.
Required flow:
1. Authenticated user enters the app.
2. Existing backend/profile state is loaded.
3. User sees the new five-tab app shell.
4. Home shows only truthful backend-backed modules.
5. Rooms lists the current real 21-night connection.
6. Opening that Room leads to the existing Tonight functionality.
7. You contains the real current archetype, streak, identity and sign-out.
8. Discover shows a truthful dependency state if discovery endpoints are not available.
9. Create shows only actions currently supported, with unavailable future actions clearly disabled.
10. Existing entry sealing still works.
Do not remove working authentication or entry functionality.
HOME V1
Home should be a finite daily edition, not an infinite feed.
Possible sections:
- Tonight's room
- Current connection state
- Profile completion
- One personal reflection
- Available cultural identity actions
Only show a section when its data is real.
ROOMS V1
Create:
- Rooms list screen
- Active Room card
- Room detail
- Tonight
- Connection progress
- Safety menu
Use the existing backend match and entry state.
YOU V1
Create:
- identity header;
- archetype;
- streak;
- profile state;
- privacy summary;
- account;
- sign out.
Do not restore the fake cultural shelf.
DISCOVER V1
Until real discovery APIs exist:
- show a designed but truthful empty/dependency state;
- explain that taste identity and discovery are not yet available;
- do not show fake people;
- document required endpoint contracts.
CREATE V1
Supported actions should work.
Unsupported actions should be visually clear and disabled.
Do not show an interactive button that does nothing.
ACCESSIBILITY
All touch targets must meet platform recommendations.
Add:
- accessibilityRole;
- accessibilityLabel;
- accessibilityHint where useful;
- logical focus order;
- large text testing;
- sufficient contrast;
- non-colour status cues;
- Reduce Motion support;
- screen-reader descriptions for custom icons and constellation visuals.
The constellation must have an accessible text summary.
PRODUCTION REQUIREMENTS
Do not call the slice complete until:
- npm run typecheck passes;
- npm run lint passes;
- all existing tests pass;
- new navigation tests pass;
- auth routing tests pass;
- room routing tests pass;
- entry sealing tests pass;
- reduced-motion tests pass;
- no placeholder social content exists;
- no console errors occur;
- no secrets are committed;
- Expo Android build/export succeeds;
- Expo iOS build/export or config validation succeeds;
- web export does not show a blank screen;
- app is tested at small and large phone widths;
- loading, empty, error and offline states are visible.
WORKFLOW
Before coding:
1. inspect README, DECISIONS.md and backend decision records;
2. inspect the current routing tree;
3. inspect all existing API contracts;
4. identify which current screens contain real data;
5. produce a short implementation plan;
6. list files that will change;
7. identify backend dependencies;
8. do not alter locked product decisions silently.
After coding:
1. run all verification commands;
2. report exactly what passed and failed;
3. provide screenshots for each main screen where possible;
4. list any mocked or unavailable feature explicitly;
5. create a draft PR;
6. do not merge;
7. do not deploy.
SUCCESS DEFINITION
The result must feel like the beginning of a real native social application, not a reskinned website and not a static design prototype.
The existing 21-night ritual must remain operational, but it must now live inside the broader native application structure.
```
