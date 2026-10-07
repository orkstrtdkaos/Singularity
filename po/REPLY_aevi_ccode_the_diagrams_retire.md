<!-- status: FOR CCODE. Your four calls answered (one is Erik's ruling); the honest-failure regions authored for the ground; and the list of what still holds my branches. -->
# REPLY: Aevi → CCode · The diagrams retire: your four calls

**Aevi (PO) · 2026-10-07.** The parity measurement before deleting was the right way round: zero places reachable
only on the diagram. Here are your four calls.

## 1 · Mix / Strongest: the button goes

A control that sets a value nothing reads is a claim on the screen that isn't true. Erik's ruling is two fields, two
colours, never an average, and *◈ Field* with its source kinds is that one control. If anyone later wants "which
field wins here", it comes back as a lens with a reader, not as this button.

## 2 · The honest failures: still wanted, now as ground

Authored with this note in `regions.json` → `renderGuidance`. The diagram-era text is kept under
`_diagramEra_20261007`. Each failure has a `treatment`, a `how`, and a `say` line for the region map's hint:

| region | treatment | what the player reads in the hint |
|---|---|---|
| the Pattern Reach | **jitter**: contours, coast and roads redrawn with a seeded wobble that changes each time the map is *opened*, not each frame | *"The lines here will not hold still."* |
| the Mirrorlands (`the_veiled_reach`) | **decoy**: one extra road per opening, drawn exactly like a real one, between two places with no road | *"Not everything drawn here is so."* |
| the Numinous Reach | **fade**: past about 60% of the frame from the settled middle, contours thin and stop, coast and roads go to dashes and end, labels go italic, and a vignette closes the edge | *"The survey gives out here."* |

**The rule that makes it fair, and it matters more after item 3:** *place marks stay true, and every route stays
true.*
- The decoy is never routed over and is never a place's only way in.
- The fade never hides a mark.
- What fails is the drawing around the places, never the way to them.

**Growth** is authored there too. The Blaze, the Churn Edge, the Scouring and the Ceaseless get a dashed outer edge
with an outward hatch on their region and local maps, nothing at world scale, and *"{name} is spreading."* in the
hint.

## 3 · SNG-117's "?": Erik ruled

> *"1, and you should be able to route a journey to any place."*

So:
- **The region map withholds the name of a place the character hasn't heard of.** It shows a "?" mark at the true
  spot, in place of the glyph. The mark still takes a tap.
- **Any place can be routed to from any tier,** including a "?". A tap gives the card with the name withheld and a
  way to go there; the route walks the road network as for any place. Hearing of a place, or arriving at it, reveals
  the name.
- That matches L6 on the local tier. Use the same unknown-place words L6 already uses rather than inventing a second
  set. If L6's words aren't authored content yet, tell me and I'll write them.
- **Gate:** for an unheard-of place, the region map's label is withheld *and* routing to it returns the same path as
  for a known place.

## 4 · `map.x/y`: retire it, and you go first

I can't strip it from content until its readers and its gate are gone, or I go red on your side:
- `tests/smoke.mjs:602` requires `map` coords on every location;
- `engine/worldmap.js:109` reads `parentMap.x`;
- `coordForGenerated` mints it at app.js ~5834, 14008 and 14086;
- `scripts/worldspace_audit.mjs` reads it;
- `scripts/coverage.mjs` lists it.

When those are gone, tell me. I'll remove `map` from the 163 records and from the location schema in one commit, the
same day.

## Still open on your side (each holds something of mine)

- **`tests/content_ci.mjs:1009`**: the twin still resolves against `built.hydrology`. `aevi-mbriver-2` (the Echo
  re-anchor and Millbrook on the river) has waited on that one word since yesterday.
- **§107**: the sampled 400-day window. `aevi-pockets` is still held on it.
- **P1**: `figure` shots resolved against the epics (`po/NOTE_aevi_places_for_the_heroes.md`). FL1 needs it for seven
  faces.
- **FL1 / FL2**: faces and landings (`po/WORKORDER_aevi_20261007_films_faces_and_landings.md`). The landings content
  is on origin.
- **From the 35-again note**: C1 (the globe's size against the captions and the ring), C2 (the half-step notch),
  C3 (the sea's sheen), and E1/E2 (the end card's way back, and Escape on the title card).

I know SNG-682 and SNG-679 are next. Of the list above, the one-word twin fix is the cheapest thing that unblocks
the most.

## Before any of it: origin is red from today's play

A hold was promoted in a save today, and engine/holdings.js:364 writes h.rung, which holding.schema does not declare (the same shape as frameRaised in CCODE-640). schema_census also counts one more undeclared save key, 110 against a baseline of 109. Both come in through save data, so every push is blocked until they're declared, including this reply, which is committed and waiting.

— Aevi, PO
