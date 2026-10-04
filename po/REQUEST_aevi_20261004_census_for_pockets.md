<!-- status: BLOCKING Aevi's content push. One number in content_ci's ratified census needs Erik's new ruling: 96 settlements -> 111. Everything else in SNG-670 pass 1 is green -->
# REQUEST: Aevi → CCode · the ratified census, for the peoples' pockets (SNG-670)

**Aevi (PO) · 2026-10-04.** Erik:

> *"[Elves and dwarves] live in pockets across the world. In the typical places of their kind. Dwarves have mountain holds
> and underground kingdoms. Elves have sky cities and forest territories. And don't forget to populate the seas and
> oceans."*

He approved the plan with the sites on the canvas (board *"Peoples of the world (proposal)"*): *"Yes, proceed."*

## What is ready (committed locally, not pushed)

15 new authored places, each a **pocket**: a centre with its own ground, the way a foothill is (`regionId:
pocket_<id>`), placed on the world's own terrain:

| kind | places |
|---|---|
| dwarven mountain holds | the Anvilhall, the Long Delve, Greyspire Hold |
| dwarven underground kingdoms (depth −1) | Deepmark, Undermere |
| elven forest territories | the Evenwood, the Silverbough |
| elven sky cities | Highmere, Windspire |
| inner-sea peoples | the Coral Court, the Saltmarch, the Greywater Deep |
| world-ocean peoples | the Tidewrought, the Drowned Crown, the Leviathan Road |

Each one comes with:
- its location file, manifest entry, `regions.json` row, `location_kinds` entry and `axisVector`;
- a `substrateDensity`, a `regionHomeTradition` and a frozen-world index row;
- a **land seat** (a sea pocket's seat is its landing on the nearest shore, so §391 holds);
- reciprocal connections, inserted as text so neighbours' files keep their formatting;
- **15 new bench gladiators**.

The bench now has 47 challengers, fielding dwarven, elven, merfolk, saltfolk, selkie and drowned peoples. The Feeling
Coast's region note no longer claims to be *"the only coastline in the world"*.

Gates green on that commit: content CI except the one check below, schema census 31/0, how_it_works 4,464/0 after
`roster.mjs --write`, `certify_counts.mjs --write` and EXESA's place count (158 → 173).

## The one check that needs you

`content_ci.mjs`, SNG-392/398/396:

> *"the hierarchy matches the RATIFIED census — 25 regions, 96 settlements, 37 authored-in-play sites"*

Measured with the pockets: **25 / 111 / 37**. The 15 pockets are settlements. The census is a ratified number, Erik's,
and he ratified the change. The number lives in your test, so it is yours to move. **96 → 111**, with Erik's line
beside it. Tell me when it is on origin and I will rebase and push the content.

⚠️ I did **not** add the pockets to `field_model.json`'s region baselines: §334 counts that table's states (21 ordered,
10 wild, 8 clear), and the pockets read the nearest field like any unbaselined ground. If you would rather they carry
baselines, say so and give me the counts to move with them.

## Pass 2 (mine, next)

Each pocket's ruling power and leader, and its house at the Crossing.

— Aevi, PO
