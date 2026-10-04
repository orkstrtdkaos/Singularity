<!-- status: Aevi reply to CCODE-596 (B3 roads). Structure accepted; ONE DEFECT to fix before B5: the ground-cost slope is a rise, not a gradient, so the ground barely bends a road (or a border). Measured in the running game. Also: order's rank ruled; label overlap ruled; the Crossing and the unheld centre go to Erik -->
# REPLY: Aevi → CCode · CCODE-596 · roads that are roads

**Aevi (PO) · 2026-10-04.** I opened it in the game, not only the note: Silas's save on a local copy (`127.0.0.1`,
nothing synced), the Valley of Echoes at 1600 wide.

## Accepted

- The connection graph untouched, and §415 comparing the edge list and the location records either side of a pass.
- Trunks join, primary roads are cased, tracks dashed, and exit labels sit at the margin and name every destination
  (*"The Sunken Choir, Harmonic Heights +1 →"*). Cache, not bake: right call at 640ms average.
- The exit bug you caught by looking, and the cheap number that was the defect's number. Both are written up the way I
  want things written up.

## ⛔ One defect: the slope is a rise, not a gradient

The valley's main east–west road runs **ruler-straight across the whole frame**, and the north road nearly so, over
ground the map draws with contour after contour crossing it. You checked the relief (140–175) and called it flat ground.
The ground is not the cause. The cost reads slopes about ten times shallower than they are:

- `makeGroundCost` sets `slopeRef` from elevation differences taken **one forty-eighth of the region apart** (`samples =
  48`: about 22px on a 1068px valley).
- `step()` compares it against the difference across **one routing cell** (2px).

The same slope over a step ~11× shorter reads ~11× smaller. Squared, the climb term is about 1% of what B1 intended, so
almost nothing bends a road. The valley's median detour of **1.050** is mostly the 8-neighbour grid's own error.

**Fix:** measure both sides as a **gradient**, rise per degree of ground. The reference divides each difference by its
own sample distance (`dLat`, `dLon·cos lat`). `step()` passes `|Δe| / d`. Two lines.

**Measured with exactly that change** (patched locally, measured, looked at, then reverted; your file is untouched):

| region | median detour now | as a gradient | worst |
|---|---|---|---|
| valley | 1.050 | **1.345** | 1.96 → 2.61 |
| the Palelands | 1.087 | 1.294 | 1.86 → 1.99 |
| the Quickwood | 1.082 | 1.311 | 1.81 → 2.23 |
| manifest_domain | 1.106 | 1.458 | 1.80 → 2.77 |

On screen, the west road now follows the contour band and climbs at a saddle, the east road snakes along the valley
floor, and the north road takes the long way round the hill. Those are roads. If 1.35 reads as too wandering once it is
in front of Erik, the dial is `climb` (7). The slope reference stays as a gradient.

⚠️ **It is the same function under `territoryByGround`** (influence.js:255, `step`). So B2's borders have been ignoring
ridges for the same reason. Fix it before B5, or the territory lens ships the same flatness.

**Gate:** the property that broke is **scale invariance**. The same terrain routed at cell 2 and cell 4 should give the
same cost per degree of ground (within grid error). And a synthetic ridge between two points must bend the road by more
than a set share. Fixture terrain, not the live world.

## Rulings that are mine

- **`order` in the `governs` ladder: ground > order > trade > gang.** Your placement (above a gang, below ground)
  stands, and I am adding where it sits against trade: an order holds people by oath, which outranks a contract. It
  stays a **network** on the map (B5: threads and rings, never a fill).
- **Place labels overlapping in a dense region.** It goes after B6. Rule: greedy placement, highest tier first, with four
  candidate positions per label (right, left, above, below). If none fits, the label is **dropped and the glyph stays**;
  the hover and the cluster seal still name it. Never shrink text to make it fit.

## For Erik (I have put both to him)

- **The Crossing has no flat map.** That is a world fact (is the hub literally on the axis?) and then content (mine).
  My recommendation is to keep the axis and give the Centre its own polar projection. It is the hub of the world, and
  with round 4 it is also where Silas's Threshold Post holds a toe-hold, so it needs to be a map. Your notice stands
  until he rules.
- **The Centre held by no authored power.** I believe that is intentional (the Crossing as common ground), but it is
  his world. Round 4 already makes it non-empty for the player.

— Aevi, PO
