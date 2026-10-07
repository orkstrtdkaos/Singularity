<!-- status: FOR AEVI AND ERIK. Both diagrams are deleted (CCODE-646, CCODE-647); the parity list is in the commits. Four things named below need a call. Next: SNG-682, then SNG-679. -->
# CCode → Aevi, Erik · the diagrams are gone, and what had no home

**CCode · 2026-10-07 · CCODE-646 (part A), CCODE-647 (part B)**

## What is deleted

The ring (part A) and the region SVG diagram (part B): `renderMap` builds no svg; `worldmap.js` lost its
auto-positioning, hull, tint, icon, overlay-placement and field-wash helpers, and `layoutCoherence`, which nothing
called; the diagram's CSS; the dev preview of the three SVG tiers under `scripts/`. The parity list — every control
and every piece of information each diagram offered, and where it lives — is in the two commit messages, as the
order asked. The gates that pinned the diagram are re-pointed at behaviour where the claim survives (§168's
viewport, §154's containment, §386's two fields, CCODE-12, §411) and retired with their subject where it does not
(SNG-046's layout, SNG-082's hull, §166's tie-breaking, §386's blobs). The ratchets are unchanged.

## Measured before deleting

*"Any place that is clickable only on the diagram has to become clickable on the ground first."* Over every save:

| | |
|---|---|
| authored places / without a `worldPos` | 158 / 0 |
| grown places, all saves | 26 |
| … carrying a `worldPos` | 24 |
| … placed by the reconcile step from their connections | 2 |
| … that would need a parent anchor, or are unplaceable | 0 / 0 |
| reachable only on the diagram | 0 |

## Looked at

Silas, the Valley: no svg under the canvas, no console error, nothing left the origin. The hint under the title
reads *7 places in this region, on real ground · Day 18 · Water Crisis answered* — the diagram's corner line, kept;
the crisis stage shows on the Valley only, whose authored event it is. *Show what you know* draws people and threads
on the ground and the painter writes the legend (the empty state is the painter's now — the chrome only leaves the
slot, because the chrome used to read a list it had laid out for itself). *Connections* and *◎ me* work.

## Four things that need a call

1. **Two per-place field toggles were drawing to nothing — deleted.** The diagram's *⛰ Lattice field* and *✵ Nanite
   field* set `mapField`, whose only reader was the svg's wash. The ground's *◈ Field* and its source kinds are the
   one control. Erik's ruling (two fields, two colours, never an average) is gated there now: each kind its own
   colour and its own toggle, evaluated at every painted point.
   **And one more toggle reads to nothing, found on the way:** the field panel's *Mix / Strongest* button sets
   `fieldCtl.mode`, and `field.js`'s `texture()` — the only thing that takes a mode — is called by nothing on any
   tier. Either the lens learns it (a kind's mark drawn only where that kind is strongest) or the button goes. I'll
   take it as the next small fix unless you say which.

2. **The deliberately-wrong regions have no home.** `regions.json` → `renderGuidance.honestFailures` asked for three
   regions drawn WRONG on purpose (the Pattern Reach resists mapping, the Veiled Reach lies, the Numinous Reach loses
   confidence) and four EXPANDING regions dashed. The diagram did that with its borders; the ground draws one region
   at a time and has no border treatment. This is the one piece of the diagram's information with nowhere to go.
   Aevi: is it still wanted, and as what — a frame treatment on those regions' maps, a word in the hint, nothing?

3. **SNG-117's "?" has no surface.** The diagram withheld the name of a place you had not heard of; the ground has
   named every placed location in a region since SNG-414, beside the diagram, and is now the only surface. The local
   tier already withholds unknown sites (L6). Erik: should the region map withhold unheard-of names (a "?" mark that
   still takes a tap), or does naming the region's places stand? Not built either way until ruled.

4. **`map.x/y` has no reader in play.** `coordForGenerated` still mints one for a new place because the location
   schema asks for it; nothing draws from it. Retiring the field — the schema, the 158 authored coords, the minting —
   is content's call (Aevi), and `FIELD_REFERENCE` says so. I did not touch it.

Still open from part A: on a 412 px pane the region map's hit-test gives Loki's own place only through the cluster
seal under the gold ring.

— CCode
