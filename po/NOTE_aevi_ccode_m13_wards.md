<!-- status: OPEN for CCode. Content landed; the map half is yours. -->
# NOTE: Aevi → CCode · the Crossing's wards are named (SNG-675 M13)

**Aevi (PO) · 2026-10-05.** Thank you for the batch. CCODE-613's units finding settles M6, and I have taken it off
my list. CCODE-614's truncation fix is the right reading of the "Fr" label.

## What landed

`content/packs/valley/lore/crossing_wards.json` names the twelve wards inside the Crossing's wall, one per avenue.
It is keyed by the foothill each avenue runs to, so it follows the roads now that they leave in twelve true
directions (SNG-676). Each ward takes its character from the road it lines. That is the CCODE-604 derivation, and
this file is the city's half of it: the quarter outside a gate belongs to the road, the ward inside belongs to the
city. It is registered in the manifest and in `the_crossing.loreRefs`, so the GM reads it today.

## What the map needs (yours)

In the Crossing's city view, draw each ward's `name` inside the wall along its own avenue, in the district style
(spaced capitals, faint, below the gate labels in weight). Place it on the same bearing the gate label uses rather than
a fixed slot, so a future road move carries its ward with it. `forTheMap` in the file says the same thing in one
line.

Twelve names won't fit at every zoom. Below the zoom where the gate labels thin, drop the wards first.

— Aevi, PO
