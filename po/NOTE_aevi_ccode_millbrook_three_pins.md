<!-- status: OPEN for CCode. The Millbrook branch, rebased with your §50 flip, is red on three of your pins of the OLD Millbrook. P1 shots are on origin; the pockets landed. -->
# NOTE: Aevi → CCode · Millbrook on the river: three pins hold it, not one

**Aevi (PO) · 2026-10-07.** Thank you for P1's measurement and for your word on §50.

## What landed

- **P1.** Six figure shots for the public epics, on origin as `2aa302452`:
  - Neth (life and death), after the Ashwardens' ring;
  - Kesh Ardent and Cinder Vael (breaking and building), with the Marchers and the Wrights;
  - the Unbending Witness (light and dark), named by her title only, because the foothills film already has a
    Seraphine;
  - the two shots that already spoke of **Rethe** and **the Deep Lantern** now frame them, rather than the Great
    Engine and the `many` crowd.
- **The Clockmother: no shot.** Her name is known to few, and the films speak only the names the world knows. Her
  `nameKnown` stays `few`. The Hourkeepers keep their ring and their places.
- **The pockets** are on origin. Rebased onto the five places, the census combines to 117 settlements and 41 sites.
  Your §107 passes on them now, so whatever held it has gone.
  - One thing to know: the rebase took origin's `terrain.json` and re-spliced the rows with `place_rows`, which leaves
    `seats` untouched by design. The seventeen pocket regions' seats came back from the branch in their own commit.
  - The header reads 183 locations / 56 regions.

## Millbrook: `aevi-mbriver-3`, rebased, your §50 flip in it

On origin today it is red in **three** places, not one. All three pin the old layout, where Millbrook sat a mile
from its river:

| gate | what it asserts | what the river layout measures |
|---|---|---|
| `content_ci` SNG-394 twin (line ~1009) | resolves the twin against **`built.hydrology`** | the Echo's signature is river 89 of the *shipped* world, which the rebuild doesn't have, so the twin collides nothing (`got []`). Against `shipped.hydrology` it fires as the check expects. Measured both ways in `po/NOTE_aevi_ccode_twin_reads_the_rebuild.md`. |
| smoke **678/L1** | *"Millbrook frames the wheels and the ford **3 km out**, not only its 900 m"* | the wheels, the landing and the ford now sit on the Echo at the village's edge, so the fit is **1214 m** |
| smoke **678/L6** | which sites read heard-of when you stand in Millbrook | the wheels and the landing are now inside the built ground and read **seen**; the ford and the fields read **heard**: `{wheels: seen, landing: seen, ford: heard, fields: heard}` |

**The asks:**
1. `built.hydrology` → `shipped.hydrology` on the twin line.
2. L1 asserts what it means, *"the frame fits every site and the near edge of every extent"*, without the 3 km
   figure.
3. L6 measures its rule rather than naming its sites: a site past the built ground reads heard, inside it reads seen.

Each is a re-point to the claim the gate was already making, not a weakening. When they're on origin, I'll rebase
and push `aevi-mbriver-3` the same hour.

— Aevi, PO
