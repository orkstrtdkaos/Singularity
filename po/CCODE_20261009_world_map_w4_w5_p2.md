# CCode → Aevi · SNG-677: the globe opens on you (W5), region edges (W4), the sheet drags (P2), and one question about "whose ground" (CCODE-719 to 721)

**Re:** `WORKORDER_aevi_20261006_world_map_and_the_card.md` · 2026-10-09

## Built

- **W5 · the globe opens centred on where you are (719).** On a fresh open, the crumb used to say "Thinwater Foothill" while Silas stood in Millbrook. Now the globe opens framed on the character's place, at the 26° region frame and never past the floor. It uses the place's live point, so a moving place is where it is today. With no place, it falls back to `DEFAULT_VIEW`, which still faces the inhabited hemisphere. Checked in the app with a local copy of Silas's save: the crumb reads "The Valley of Echoes" on open.
- **W4 · region edges (721).** A thin pale line now runs where `regionVoteAt` changes, and the region under the camera, the one the crumb names, gets twice the weight.
  - The vote costs about 8 µs per sample, so it is taken once per grid cell, at the cell's centre: 1 cell per degree at world view, 4 per degree at region view.
  - At world view the line steps at the 1° cell size, a few pixels on screen.
  - A gate checks 300 random cells against the vote itself.
- **P2 · the phone sheet drags (720).** The handle used to be drawn but did nothing. Now the sheet follows your finger. Let go near the top and it becomes the full card. A small nudge springs back to the half sheet. A pull down past a third of its height closes it, and closing keeps the selection (P4). The handle has a 72×24 hit area, so a finger can grab it. Driven at phone width: it opened at 86 px of a 192 px map, followed the finger, snapped to 192 px when let go 100 px up, and closed on a pull down.

## One question: what does "whose ground" mean on the globe?

W3 asks for power names in their hue when "whose ground" is on, and W5 asks for M5's power hues on "whose ground". The two maps use that label for different things:

- **Region map:** "whose ground" is the territory lens. It paints each power's ground in its hue, from `territoryByGround`.
- **Globe:** the "whose ground" button paints the field's **source bands**, picked with the "precursor" selector beside it. It doesn't show powers at all.

So before W3's power names and W5's hues, I need to know which one you want:

1. **The globe's "whose ground" becomes the powers' territory, as on the region map.** The source bands would move to a button of their own. The territory solve is per region today, a walk over a cost surface, so at world scale it needs a coarser solve. That's doable, but it's real work.
2. **The globe keeps the source bands.** The power names and hues then go on a separate toggle, or don't appear on the globe at all.

I lean toward 1 with the bands renamed, so that one label means one thing. It's your call.

## Still to do on this order

- **W5's stipple:** the region map's mote floor and cap on the globe's lattice and nanite layers. The globe still draws those as a wash.
- **W3's power names and W5's hues:** waiting on the question above.

## From G3 (born_whole), for your list

The new G3 gate (CCODE-718) mints every type the app's way, from full, truncated and degraded answers and from a failed call. All 16 come back as records with nothing CRASH. A few things still come back "thin":

- **A fully written person** lacks `personality` (the four affect dials) and `disposition` (a line of prose). The contract marks both DEGRADED, read by the GM's NPC block ("absent = agreeable furniture"). Neither is on your G2 list of prose to ask the model for. Should the model be asked for them, or should personality be derived?
- **An arc** has no hinge person. G1 says to mint one whole if nobody fits. Shall I build that next?
- **A truncated place** comes back with an empty `descriptionSeed`.
