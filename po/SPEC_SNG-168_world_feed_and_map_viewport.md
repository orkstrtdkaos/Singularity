# SNG-168 — The world feed, in-game messaging, and a map you can actually use on a phone

**Author:** Aevi (PO) · 2026-07-18 · Erik-directed from live play on mobile
**Numbering:** checked `po/` at HEAD before minting (highest was 167).

---

# §1 — THE MAP: measured, and Erik's report decomposes exactly

## The symptom

Erik: *"On my phone I couldn't zoom or move around in the lowest level map. I would want to be able
to click each place to see what is there and perhaps travel there if I'm in the larger region."*

## What exists

Pan/zoom is **built** — `wireSkillGraphViewport` (app.js:4391): a persisted `{k, tx, ty}` transform on
a `<g class="graph-vp">` group, zoom-at-cursor that keeps the point under the pointer fixed,
drag-to-pan, and a `_graphDidPan` flag that suppresses a node-select when a drag actually moved. It
is careful, correct work.

## Two precise defects

**1a. Two of the three map tiers have no viewport group at all.**

| tier | renderer | `.graph-vp`? |
|---|---|---|
| world (region grid) | `renderMapWorld` app.js:3781 | **NO** |
| region | `renderMap` app.js:3873 | yes |
| location (interior) | `renderMapLocation` app.js:3809 | **NO** |

Erik's *"lowest level map"* is the location tier, which has **no pan and no zoom whatsoever**. The
function was written for the skill graph and wired to the one map tier that shares its shape.

**1b. Where it does exist, zoom is wheel-only — so a phone cannot zoom.**

```js
svg.addEventListener("touchstart", e => { if (e.touches[0]) down(...) }, { passive: true });
svg.addEventListener("touchmove",  e => { if (e.touches[0]) { move(...) } }, { passive: true });
```

Only `e.touches[0]` is ever read. **There is no two-finger path, so no pinch-to-zoom.** Zoom is
bound to `wheel`, which does not fire on touch. On mobile Erik can drag-pan the region tier and
cannot zoom it — which is exactly what he reported.

## Fix

1. **Give every map tier the viewport.** Wrap `renderMapWorld` and `renderMapLocation` contents in
   `<g class="graph-vp">` and call the wiring. Rename `wireSkillGraphViewport` → `wireSvgViewport`;
   it was never skill-specific.
2. **Pinch-to-zoom.** On `touchmove` with `e.touches.length === 2`, zoom by the ratio of current to
   previous finger distance, centred on the midpoint — reusing the existing `zoomAt`, which already
   does the correct keep-the-point-fixed math. `passive: true` must become `passive: false` on the
   two-finger path so the browser's own pinch can be prevented.
3. **Per-tier view state.** `graphView` is a single module-level variable shared with the skill graph
   and wheel. Zooming the map then opening the skill wheel currently inherits a transform. Key it by
   surface.
4. **Double-tap / double-click to reset to fit** — the standard escape hatch, and cheap.

## 1c. Click a place, see what's there, travel there

Region-tier nodes already carry `data-mapsel` and the hint reads *"Click a place, then 'Look
inside'"*, so selection exists. What Erik is asking for is the **place card**:

- tap a node → a card with its name, what's known of it (respecting `isPlaceKnown` — an unvisited
  place shows what he has *heard*, not its contents), danger, who is known to be there, and any
  `encounterSeeds` hints he has earned.
- **Travel from the card**, when the rules already allow it: `travelTo` exists and app.js:2994 refers
  to *"a one-tap 'arrive' (the map's own travelTo path)"*. Surface it on the card rather than making
  him leave the map.
- **Availability is honest:** if travel is not currently legal (distance, region, an active
  encounter), the button says *why* rather than being absent.

---

# §2 — THE WORLD FEED (out-of-game sharing)

Erik: *"Players should be able to post a turn they really like — perhaps with its attached image —
so other players can see it. Like a world news page with a running list of events known characters
are doing… mainly for the player to feel like the world is alive, and to share the experience with
friends."*

Note the two distinct purposes, and **the second one is not in-fiction**: sharing with *friends*, not
between characters. Those must not be built as one thing.

## What exists

- **Shared canon** (BATCH-9 Phase 3) — `sharedCanonView`, rating-lensed, hydrated into CONTENT and
  fed to the GM. That is *world-state* sharing between family characters. It is the right substrate
  and the wrong surface: it makes another player's canon **real in your game**, silently.
- **The chronicle share toggle** — *"SHARE MY CHRONICLE WITH THE FAMILY"* on the standing screen.
  The permission model already exists.

## What to build

**A feed of authored posts, not an automatic log.** The value is in the *choosing* — Erik said *a
turn they really like*. An auto-feed of every turn is noise and a privacy problem; a feed of
deliberately-posted moments is a scrapbook.

- **Post a turn.** A control on any turn in the log: post it to the feed, with its `imagePrompt`
  image if one was generated. The poster picks; nothing is automatic.
- **The feed shows** poster's character, location, world-date, the turn's narration (or an excerpt
  the poster trims), and the image.
- **Epic NPCs and world events post too** — `worldtick.js` already generates world movement, and
  legends/greater arcs exist. A world-tick of real consequence should be able to appear in the feed
  as a **world-news item**, which is what makes the place feel inhabited rather than merely shared.
- **Rating lens applies** — the same lens shared canon already uses. A post from an R-rated session
  must not land unfiltered in a family member's feed.
- **Sensitivity:** a post is opt-in per post, even when chronicle-sharing is on. Two different
  consents; do not collapse them.

## What it must NOT do

**A feed post is not canon.** Shared canon has its own path with its own lens and reconciliation.
Posting a turn to the feed must not hydrate anything into another player's CONTENT. Keeping these
apart is the whole reason to spec them together — they will look mergeable and they are not.

---

# §3 — IN-GAME MESSAGING

Erik: *"In game could use some messaging skills though — right now there is a narrative 'runner'
system, but we can do better."*

The in-fiction courier today is narration-only — `pacing.js` lists *"something ARRIVES — a messenger,
riffraff, a body, a summons"* as a beat shape. There is no mechanism behind it.

**Proposal, kept small and in-world:**

- **Send word.** A character can dispatch a message to a known NPC or another player's character.
  It takes **in-game time** proportional to distance, and it can fail — that is the interesting part.
- **The waygate network is the fast path.** SNG-148 gave every region a gate with a tier. A message
  routed gate-to-gate arrives quickly; one going overland does not. The network we just built earns a
  second use, and gate access becomes strategically valuable beyond travel.
- **Traditions have their own idiom** — the Lattice schedules, the Hourkeepers log, the Veilwrights'
  messages may not be from whom they claim. This is where the 24 traditions get to be *different*
  rather than reskinned.
- **Cross-player messages** land in the recipient's game as an arriving beat, using the shared-canon
  permission model that already exists.

**Deliberately out of scope:** an out-of-fiction chat. That is what the feed (§2) and their actual
phones are for.

---

# §4 — Sequencing

**§1 first, and it is not close.** It is a live usability defect on the device Erik plays on, most of
the machinery exists, and the fix is small. §2 is a feature. §3 is a design conversation with content
implications across 24 traditions.

# §5 — Questions for CCode ROUND 2

1. §1.3 — is per-surface view state a real bug today, or does every re-render reset `graphView`
   anyway? I read it as persisted across node-select by design, which implies the leak, but the
   render paths are yours.
2. §1c — does a place card want to be an SVG overlay or a DOM panel beside the map? On a phone the
   panel is probably right; on desktop the overlay reads better. One or both?
3. §2 — where does the feed live: inside the app per family group, or a published surface? That
   changes the auth story completely and I would rather you priced it before I spec further.
4. §3 — does message-in-flight want to be a first-class state object, or can it ride the existing
   quest/event machinery? I suspect the latter and I would rather not invent a system.

---

# §6 — RESOLVED (Erik, 2026-07-22) — BUILD THE FEED NOW (Brooklyn wants it)

Erik's two calls, closing the ROUND 2 blocker (Q3) and scoping the build:

## Decision 1 — WHERE the feed lives: **IN THE APP, shared per family group** (Q3 answered)
Not a published web page. The feed is an in-app surface scoped to the family group — it rides the
EXISTING family-sync substrate, so no new auth story:
- **`syncSharedCanon`/`sharedCanonView`** (app.js:2164, worldtick.js) already syncs per family group
  WITH the rating-lens. The feed uses the SAME group-sync channel + lens — a feed post is lensed on
  read exactly as shared canon is. Verified present.
- **`profile.sharedChronicle`** (app.js:6292, the "share my chronicle with the family" toggle) is the
  existing family-consent model. The feed's per-post consent is a SECOND, separate opt-in (§2: "two
  different consents; do not collapse them") but lives in the same family-group frame.
- **Turn images** ride `imagePrompt`/`addGalleryImage` (app.js:1973) — a posted turn carries its
  generated image the same way the gallery already stores one.
So: no published surface, no new backend — the feed is a per-family-group in-app view on the sync
channel that already exists. This is why it's now a SMALL build.

## Decision 2 — SCOPE: **JUST THE FEED (§2).** Ship it alone, fastest path to Brooklyn.
- **§1 (mobile map pinch/pan)** — still a real live defect, but DECOUPLED; ship separately, not
  blocking the feed.
- **§3 (in-game messaging)** — remains a design conversation (24-tradition implications); NOT now.
- Build ONLY §2 §"What to build", scoped to the in-app per-family-group decision above.

## The §2 build, now unblocked (for CCode)
1. **Post-a-turn control** on any turn in the log → posts that turn to the family feed, carrying its
   image (imagePrompt) if one exists. Poster picks; nothing automatic (the value is the CHOOSING).
2. **The feed view** (in-app, per family group): each post shows poster's character, location,
   world-date, the narration (or a poster-trimmed excerpt), and the image. Reverse-chron.
3. **Per-post consent** — opt-in per post, SEPARATE from sharedChronicle (two consents). A post from
   an R-rated session is rating-lensed on the family reader's side (reuse the sharedCanon lens).
4. **World-news items** (§2, keep if cheap) — a worldtick of real consequence CAN appear as a
   feed item so the world feels inhabited, not just shared. If it adds scope, defer to a fast-follow;
   the PLAYER-post feed is the thing Brooklyn wants first.
5. **MUST NOT** hydrate a feed post into another player's CONTENT — a feed post is NOT canon (§2 "What
   it must NOT do"). The feed is a scrapbook surface; shared-canon is the separate real-in-your-game
   path. Keep them apart — this is the whole reason they were specced together.

## Acceptance (Erik/Brooklyn browser-leg)
Brooklyn posts a turn she loves (with its image) from her character; it appears in the family feed;
Erik (or another family character) sees it in-app, rating-lensed, WITHOUT it becoming canon in their
game. That's the win condition.

## OWNERSHIP
CCode — the post control, the feed view, per-post consent, the lens reuse. All on existing substrate
(sharedCanon sync + rating-lens + imagePrompt). No new content from Aevi; no new backend.
