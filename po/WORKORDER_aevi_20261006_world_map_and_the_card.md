<!-- status: OPEN for CCode. Erik 2026-10-06. Read against origin 8c49e6f86 in the browser (Silas's save, 1024 px, DPR 1) and in app.js; every claim has its line. -->
# WORKORDER: Aevi → CCode · the world map catches up, and the place card comes to the map (SNG-677)

**Aevi (PO) · 2026-10-06.** Erik:

> *"The world map needs similar treatments the region map got. Plus the place info should pop up on the map instead
> of being below. It's too far down, especially on the phone. And the region doesn't seem to change on the world map."*

The first part is a reply to CCODE-617 and 618, because one finding there sets a rule this order needs. Section W is the
world map and section P is the place card. The local maps are a separate order (SNG-678), because they come first in
Erik's sequence and are the larger job.

## 0 · CCODE-617 and 618

**618, D1: the overlap is gone, and I accept that half.** The log reads `[labels] 20 drawn, 0 overruled, of 20 queued`
on the Valley of Echoes, and the territory names no longer letter through the towns. The gate now checks boxes, as I
asked.

⛔ **But the precedence is upside down.** In `LABEL_STYLES`, `power` and `powerUnder` are rank 0 and `place` is rank 2.
`flushLabels` sorts with rank 0 on top, and the power pass (app.js:12776) reserves before the place pass (app.js:14335,
which gives a place one offset, `[[0, 0]]`). The powers take the middle, the place finds its ground taken, and the place
loses. At the valley's opening zoom, **"Millbrook +8" is not drawn at all.** It is the town Silas is standing in, under
THE FELLOWSHIP OF THE FELL PELL. A map that names the realm and drops the town you are in has the order backwards.

The rule, for every map in this order and in SNG-678:

1. **The place you are in** never drops.
2. **Places**, then **field sources**, then **named ground**.
3. **Powers** last. A power already has five candidate offsets; it should use them to move off the towns, and drop
   before it covers one. Its border still says whose ground it is.
4. **Road exits** at the frame edge are in their own band and only compete with each other.

The reservation has to happen in that order too, not only the flush. Otherwise rank still means paint order, which is
what D1 was about. The gate this needs: on the valley at opening zoom, the current place's label is drawn, and no
place label is overruled by a power.

**617 (M8, M9, M11): not verified by me.** I could not get into the Crossing from the globe. That is W1 below: a click
only flies the camera, and one of my two double-clicks on a region pin did not enter. Your measured numbers (wallR 169 → 297, 58 → 303 blocks)
are in the commit. I will look as soon as W1 lands.

## W · The world map

Here is what I saw, in order. The globe draws **no names at all**: the only `fillText` in its paint is the cluster
count (app.js:15040). Clicking a region pin flies the camera to a 26° frame, and clicking again flies to 8°. At 8° the
globe is the world raster scaled up into visible blocks, with two white dots and no labels. The breadcrumb still says
"The Valley of Echoes" throughout, and the region never changes.

**W1 · A click must arrive somewhere, the way the wheel does.** `zoomBy` (app.js:15065) hands off to the region map
when it passes `floorRadius`. `flyTo` (app.js:15130), used by both click and tap, never checks the floor. That makes
click and tap a dead end below the floor, and the wheel the only way in.

- Clamp `flyTo` at the floor, and hand off exactly as `zoomBy` does.
- **One click or tap on a region frames it; a second enters it.** Double-click entry (app.js:15164) is unreliable,
  because the first click starts a flight and the second lands on a moved pin. A phone has no double-click at all.
- The place-level 8° frame should not exist on the globe. A place click enters its region with the place selected,
  which is W7.

**W2 · The region follows the camera.** `mapTierBar` (app.js:12414) on the world tier always names
`currentRegionId()`, the character's region. That is the "doesn't change" Erik sees.

- On the globe, name the region **under the camera's centre**: `regionNearest` of the unprojected centre, the same
  call `zoomBy` already makes. Show it in the crumb, or in a line above the globe, and update it while dragging.
- Keep "you are here" as its own mark (the gold ring and its name), separate from the region being looked at.

**W3 · Names on the globe, through the label table.** Use the same `labelSpace` and queue, and the rank rule from §0.

- Region names in the district style (spaced capitals, faint), at the region's seat.
- The place you are in, always.
- Settlements and waygates by rank as the zoom allows. Below the zoom where they collide, drop them, and the glyph
  stays.
- With "whose ground" on, power names in their hue, the same style as the region map.

**W4 · Region edges.**

- A thin line where `regionVoteAt` changes.
- The region under the camera (W2) gets a faint fill or a stronger edge, so it is visibly the one you are about to
  enter.

**W5 · The region map's other treatments, on the globe.**

- M4's mote floor and cap on the field layers. The same stipple, with the same `floor` and `cap`.
- M5's power hues on "whose ground".
- M3's framing: the globe opens centred on where you are, at the 26° region frame, not at a fixed view.

**W6 · No upscaled blocks.** Since W1 hands off at the floor, nothing should ever be drawn below it. If any frame still
paints the raster past its own resolution, that frame is the bug.

**W7 · A place on the globe opens its card (P).** A tap on a place pin opens the card over the globe. "Look inside" and
"Travel" work from there, and "Show on region map" enters the region with that place selected.

## P · The place card comes to the map

Today the full place card (`map-details`, app.js:15448) renders **below** the map. On the region tier the
map is about 400 px tall, so on a phone the card is a scroll away from the place you tapped. The hover chip
(`showChip`, app.js:14525) already floats over the canvas with "Look inside" and "Travel". The fix is to make the chip
the card.

**P1 · One card, on the map.** Tapping or clicking a place opens the full card anchored to its glyph. It holds
everything `map-details` holds: name, danger, lattice, standing, people you know there, image, description, visits,
notes, places within, the journey line and the buttons. Keep it in the canvas's coordinate frame, using the `review()`
mapping the chip uses, so it tracks pan and zoom.

**P2 · Two layouts.**

- **Wide** (over 640 px): a popover beside the glyph, at most 360 px wide, scrolling inside itself. It flips to
  whichever side has room and never runs off the canvas.
- **Narrow** (phones): a bottom sheet over the lower part of the map, about 45% of the map's height, with a handle.
  Drag it up for the full card and down to dismiss. The selected glyph stays visible above it, and the map scrolls the
  glyph into the clear part when it opens.

**P3 · Hover stays light.** On a mouse, hover shows the short chip (name, kind, distance, whose ground) and click opens
the card. On touch there is no hover: the first tap opens the card.

**P4 · Closing.** Esc, a tap on empty ground, or the ✕. Closing keeps the selection, as the region map's chip already
does (app.js:14638, "click-away closes and does not deselect").

**P5 · Everywhere the same.** The globe (W7), the region map, the city and the local map (SNG-678) all use this one
card. The card **below** the map is deleted, not hidden. Two cards is the drift this order is meant to end.

**Done when:**

- At 390 × 844 (phone) and at 1024 wide, tapping a place shows its card **without scrolling the page**.
- "Plan the journey" and "Look inside" work from the card.
- A gate drives it headless: select a place, and assert the card's box lies inside the map's box at both widths.

## Order

§0's precedence first, since every label this order adds goes through it. Then W1 and W2, which are the "doesn't
change". Then P, then W3–W7. Erik's sequence puts the local maps (SNG-678) before retiring the diagram, and P is
shared by both, so P before SNG-678's drawing work.

— Aevi, PO
