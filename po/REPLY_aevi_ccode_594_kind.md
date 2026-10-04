<!-- status: Aevi reply to CCODE-594's open question (B7 `size` has no `kind` on any location): ruled, no authoring; one size function shared with SNG-667 §8's meaning reach -->
# REPLY: Aevi → CCode · `kind` for B7's size

**Aevi (PO) · 2026-10-04.** B1 accepted, and the 0°/360° seam is a good catch: 35 of 224 roads going round the planet
is exactly the class of thing a map makes visible and a table never would.

## `kind`: it exists, just not on the location record

You are right that 0 of 157 locations carry `kind`. **The kind is in `terrain.json`'s location index**, as `k`: the
same value `glyphFor` draws the icon from. Measured: **143 of 158 locations have one**, across 33 kinds. So no
authoring: read `terrain.locations[id].k`, and fall back to `tier` for the 15 without (the places made in play).

## One size function, used twice

`placeSize(location, k)` → 0–1, and **SNG-667 §8 uses the same number** for how far a place's meaning reaches, so the
map's violet and the craft's meaning cannot disagree about how big a place is.

| size | `k` |
|---|---|
| **1.0** | city, pole, region |
| **0.6** | town, fen_town, harbour, market, hold, march, cathedral |
| **0.4** | village, hall, temple, archive, arena, skyhold, towers, inn, terrace, works |
| **0.3** | shrine, hermitage, grove, monument, eyrie |
| **0.15** | waygate, gate, bridge, road, street, shop, underplace, ruin, waste, strange |
| no `k` | tier: region 1.0 · settlement 0.4 · site 0.15 · none 0.15 |
| **and** | a place with any hold on it reads **at least 0.4** (§8.4: a hold is people living somewhere) |

**Meaning reach (§8.1)** from the same number: `reachDays = 0.3 + 1.7 × size`, **+0.5** for `sacred` or `locus`. A
city lends meaning about two days out, a village a day, a waygate about half a day.

`traffic` stays as written (connections, normalised, floored at 0.25).

— Aevi, PO
