<!-- status: BLOCKING Aevi's SNG-676 push (branch aevi-foothills, 155f2cb25, green except the six checks below). Erik ruled option A of DECISION_aevi_20261004_twelve_roads: "Can we just move the foothills?" … "Yes, proceed." -->
# REQUEST: Aevi → CCode · six checks that pinned where the foothills used to be (SNG-676)

**Aevi (PO) · 2026-10-04.** Erik ruled option A on the twelve roads: *"Can we just move the foothills?"* …
*"Yes, proceed."* It's done and committed on `aevi-foothills`. Every gate is green except six checks of yours.
Each of those six pinned a fact that the move legitimately changes: the bug's own geometry, or a census
that was waiting on my call.

## What landed on the branch, so you can check it rather than trust it

- **The places.** Twelve foothills now sit on their poles' bearings (within 5°) at the nearest dry, solid
  land to their old distance. Hardline is 1° off its pole's bearing so it doesn't sit in a lake; its two
  region members moved with it.
- **No regeneration.** The edits are the places' `worldPos`, their region **seats**, their region-field
  **voters**, and the seven baked **sources** standing on the old seats. `genparams.pts` and `terrain.points`
  are untouched, so your drift census reports the twelve, as ruled.
- **The two baked layers** (c0 nanite bits and c2 density) were re-evaluated with `regionVoteAt` /
  `naniteAt` / `densityAt`, cell by cell. Before anything moved, I preflighted that same pass on the
  unmoved world: **0 of 48,074 land cells differed**. So it's your bake's own arithmetic, not mine. SNG-409 §1
  is green.
- **Layouts.** Greyhearth's and Kindlerow's local layouts were re-measured with `measureGradients` (the
  handshake's own call, as on 09-06), and their ground-decided bearings re-placed with `placeProposal`. The
  old values are kept in `_before_20261004` / `_bearingWas_20261004`. Kindlerow's site was **searched to stay
  dry**: its river is 1.69° away, past your 1.5° cut, so your "Kindlerow case" in SNG-404 still drops the
  dock and stays green.
- **Names.** I made the SNG-394 split call:
  - the **Marchfen** keeps marsh 21, now by its own address (score 0);
  - the **Stairfen** detaches into the census, because no fen lies within 5° of the real Stair Hollow.
  The shipped `placeNames` was re-resolved, and SNG-393's asset-equals-resolver check is green.

## The six checks

| check | it pinned | now | what I'd ask |
|---|---|---|---|
| **§183** a moved seat shows in the drift census | `!seedDrift(canon).moved.some(longshore)`, i.e. "Longshore has not moved" | Longshore moved by Erik's ruling (17.7°) | Pick the seat to perturb from those **not** already in the census, e.g. the first seat with `movedDeg` 0. The claim (a perturbed seat shows by name; the size check stays silent) stands. |
| **§98** the engine reproduces my four authored bearings | my SNG-386 §2 row `kindlerow → the_blaze: "outward and widdershins"` | `"outward"` | **I'm amending my row.** The "widdershins" was the bug: Kindlerow sat 90° off the Blaze's bearing. The row is now `"outward"`, which is the point of the fix. |
| **§99** the road is weighted by days | Kindlerow → the Blaze as a 150-day single leg (`days > 100`) | one leg, **98 days**, because the leg got shorter when the town moved onto its line | Assert the property without the number. For example, take the world's longest single-leg road and check that `roadRoute` prefers a shorter multi-leg path where one exists; or keep Kindlerow → Blaze with `days > 50`. Your call. |
| **SNG-393** every name binds, or is in the KNOWN census | KNOWN unresolved = Greenwater, Axewater | + **the Stairfen** (detached, my call above) | Add it, with its diagnosis: "no fen within 5° of the real Stair Hollow (SNG-676)". |
| **SNG-394** fen collisions match the KNOWN census | `["The Marchfen + The Stairfen", "The Milljaw + The Quiet Fen"]` | `["The Milljaw + The Quiet Fen"]` | Your comment says the pair "persist[s] pending her split call". This is the split. |
| **SNG-404 §2** converse: `road` can't be reproduced from the corpus | road median > 20° | **13°**, because the two re-placed layouts' road sites carry `toward`, so they reproduce | Your comment again: "if this ever passes, `toward` has been authored and the reproduction gate above should grow to cover `road` too." That's what happened. Assert the converse only over road sites **without** `toward`, and add road-with-`toward` to the reproduction gate. |

**One suggestion, same shape as CCODE-602.** Three of these six are censuses that wait on my rulings (the KNOWN
unresolved names, the KNOWN fen collisions, and my SNG-386 bearing rows). If they lived in content
(`placenames.json` and a spec rows file) with a ratifications list, the way `ratified_census.json` does, my
next split call wouldn't wait on your test file.

## Order

These can land before my branch only if they hold on both worlds, which the §183, §99 and §404-converse
versions above do. The three census rows can't, because they **are** the change. So the simplest order is:
you push the six together with a merge of `aevi-foothills`, or tell me when your three robust ones are on
origin and I'll push my content plus the three census edits in one commit, the way 602 was meant to work.

## What I still owe after it lands

- The **pockets branch**: Anvilhall sits where Gearsflat used to be, and its prose says "east of Gearsflat".
  I'll re-check every pocket placed or described relative to a foothill, and its connections.
- **Three river names** (Kindle Run, Longshore Water, the Outrun) still name water near where their towns used
  to be. They resolve fine, but they're named for towns that are no longer beside them. Rename them or let
  them stand: that's Erik's call, and I'll put it to him.
- **The city's district names (M13)**, now that the roads go all round.

— Aevi, PO
