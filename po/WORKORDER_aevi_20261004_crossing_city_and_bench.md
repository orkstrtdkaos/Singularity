<!-- status: READY. Erik 2026-10-04 on the polar Crossing: "really bad" / "can we make it look like a big city with these places laid out?" and "every reach and distinct people should have at least one gladiator, if not a whole bench. The coliseum is central in the culture here." Two parts: X (the Crossing drawn as a city, replacing the polar terrain) and Y (the Coliseum's bench, content landed, reader yours) -->
# WORKORDER: Aevi → CCode · 2026-10-04 · the Crossing as a city, and the Coliseum's bench

**Aevi (PO).** Erik saw the polar Crossing in the game (*"really bad"*), and then:

> *"Can we make it look like a big city with these places laid out? And every reach and distinct people should have at
> least one gladiator, if not a whole bench. The coliseum is central in the culture here."*

The canvas has the picture: board **"The Crossing: a hub plan (proposal)"** now shows the city version. It is drawn from
the real places, roads, gates and houses. The streets and blocks are generated; nothing is hand-placed except the
landmark styling.

---

## X · The Crossing is drawn as a city

**Why the polar ground fails:** the Crossing is ~1° across, below the terrain's 0.25° information floor. The concentric
rings and radial seams Erik saw are the generator meeting the pole, not ground. Keep C1's projection (bearing =
longitude, distance from the hub) because the plan stands on it. **Do not draw generated terrain inside the wall.**
`regionMaps`'s own render guidance for `the_center` already says *"Every road on the map ends here. Draw the twelve
roads as the map's spine."*

**X1 · Layout (from data, every paint the same):**
- **Radius:** log-scaled distance from the hub, `r = r_hall + (R_wall − pad)·ln(1 + ρ/0.06) / ln(1 + ρ_max/0.06)`. The
  hall sits at the centre. Bearing is true.
- **Wards at the pole:** places at colatitude 0 (North Gate Street, Ossian's Registry, the Hub Yard) sit on a small ward
  ring at the bearing their names give (north), not stacked on the hall.
- **The wall** at a fixed radius, with **one gate per road out**: twelve roads to the twelve foothills. The roads are the
  city's **avenues**, from the hall out through their gates to the foothill labels on the outer ring.
- **The gate ring:** every pole the Axis Gate reaches, as a dot and a label at its **true bearing** on an outer ring,
  thin lattice-blue. Roads go to foothills, gates go to poles; the map shows that split.
- **Drawing-only relaxation:** landmark footprints push apart until they do not overlap (the hall fixed, the wall a
  limit). Data never moves; this is the cluster rule's job at city scale.

**X2 · The city fabric (generated, seeded by region id, cached):** ring streets at fixed radii; blocks between ring
streets and avenues, cut by minor radials about every 34px; each block split into one to three roofs, an occasional
garden, an occasional courtyard. **No block inside a landmark's footprint.** Paper ground, terracotta roofs, ink
outlines, a dark field band outside the wall. Palette and seed from the mock.

**X3 · Landmarks** (one drawing each, by location id; anything unlisted gets a plain plaza and its glyph):

| place | drawn as |
|---|---|
| the Crossing | the Mavens' round hall; **the houses as a ring of banners** round it, one per `houseAt` power in its id colour (C4) |
| the Great Coliseum | **the biggest thing in the city**: an oval stadium, tiers, sand. Erik: *"central in the culture."* |
| the Hundred Markets | a market square of stalls |
| the Axis Gate | a plaza with the arch, lattice-blue glow |
| the Quiet House | a walled white compound |
| the Ent Grove | a wood |
| the Null Stone, the Regulator Chamber | one precinct, the stone and the chamber |
| the Hub Yard | a caravan yard |

**X4 · Labels:** landmarks bold, with an italic second line where there is one (the Coliseum: *"a bench from every
reach"*); district names in the open wards (content will name them; the mock's four are placeholders). Rim labels push
apart when they collide. Same click, hover and cluster behaviour as every region (A1, A3).

**X5 · Player holds near the Crossing** (Threshold Post) draw outside the wall in the realm's colour (R4).

*Done when:* the Crossing opens as the city in the mock, every one of its places is clickable, the twelve roads leave
through twelve gates, and the Coliseum is the first thing you see.

---

## Y · The Coliseum's bench: content landed, the reader is yours

`content/packs/valley/npcs/coliseum_bench.json` (SNG-669), `kind: "challenger_pool"`, **no `arcId`**, so the loader
files it beside `saehara_challengers` and recurrence never picks it up.

- **`heads`**: each reach's existing champions by `npcId` (the eight cell champions, Saehara, Kesh Ardent).
- **`challengers`**: 32 contenders and novices in the `saehara_challengers` shape (`concept`, `style`, `voiceHints`,
  `duelStakes`) plus `reach`, `people`, `families` (two or three of the eight), `rank`, `record`, `tacticTags`.
- **Coverage: all 38 regions.** Peoples beyond human: valleyfolk, precursor-construct, glade-born, djinn, ent, fae,
  minotaur, gorgon, keener, revenant.

**What the engine needs:**
1. **`benchAt(content)` → by reach**, pure: heads and challengers grouped by region.
2. **At the Coliseum, a bout can be chosen from the bench**: by reach, by people, by rank. A challenger becomes a duel
   opponent through the existing synthesis. Their **blind-grid four** come from `families` (weighted, the fourth drawn
   from all eight, exactly as `drawAxis` does for a competitor). Heads keep their authored encounters.
3. **The GM** sees the bench when the player is at the Coliseum: who is on the card today, from where. A reach's bench
   is also a fair thing for a GM to mention anywhere in that reach (*"our Haldor fights at the Crossing"*).
4. **Gate (fixture world):** every region has at least one bench member; every `families` entry is one of the eight;
   every head's `npcId` resolves.

Benches grow later (Erik: *"if not a whole bench"*): two or three per reach is the next content pass, and it changes
nothing in the reader.

---

## Also corrected (mine)

The Ones Called and the Table of Kept Terms are **reseated by canon**. Stair Hollow's own description says *"the
god-named hold court here,"* and the Low Market's says *"bargains with the terms written down."* I had seated them before
reading either. `_seatWhy` on each records the correction. Seats stay exclusive.

— Aevi, PO
