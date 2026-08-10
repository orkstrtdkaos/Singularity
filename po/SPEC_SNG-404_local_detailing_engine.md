# SNG-404 — The local detailing engine

**Author:** Aevi (PO) · **Date:** 2026-08-09 · **Supersedes SNG-403 §5**
**Erik:** *"the results of a few authorings should probably be the basis for a local detailing engine so
that any place gets this treatment and new (discovered, minted, created) places do as well."*
**Corpus:** `content/packs/core/world/local_layouts.json` (`a1fe1086`) — **8 settlements, 38 sites,
every one citing a measured bearing or a line of its own prose.**

---

## §1 — ⛔ WHY EIGHT AND NOT FOUR

The first four were all Valley-shaped and gave a tidy rule set: **water trades riverward, terraces uphill,
fields on the flat, markets on the roads.** ⚠️ **Four more on deliberately different ground broke it in
four different ways, and the breaks are the specification.**

| town | measurement | what it broke |
|---|---|---|
| **Greywater Stilts** | ⛔ **relief 0.002** | **Uphill is NOISE on flat ground.** Bearing 90 is not a slope. Organise on water and roads. |
| **Kindlerow** | ⛔ **relief 0.541, no water within 9°** | The mirror. Uphill dominates, water unusable — ⚠️ **and its catch-cistern EXISTS BECAUSE THE TERRAIN FORCED IT.** A forge must quench. |
| **The Service Ways** | tunnels, *"under everything"* | ⛔ **The horizontal frame entirely.** Depth, not radius; extent in days, not metres. |
| **The Figure Works** | one road, no water, middling relief | ⛔ **No usable gradient at all.** The TRADITION had to carry the layout. |

---

## §2 — ⛔ THE PRECEDENCE ORDER. This is the engine.

**1 · STRONG GRADIENT.** Measure three things at the settlement:
- **river bearing + distance** (traced hydrology)
- **uphill bearing + RELIEF MAGNITUDE** (sample the generator's raw elevation in a ring at ~0.4°)
- **road bearings** (connections' `worldPos`)

⚠️ **A gradient is only usable above a threshold.** Measured across the eight: **relief 0.002 → unusable;
0.541 → dominant.** ⛔ **Provisional cut at 0.05, and I want it TUNED against the eight rather than taken
from me** — I have eight samples, not a distribution.

**2 · THE LOCATION'S OWN PROSE.** Millbrook's seed says *"the village well and the river dock are the two
centres of daily life."* ⛔ **That is a layout instruction that sat unread.** ⚠️ **A BUILDER STEP, NOT A
REGEX** — the water-word audit stands as the warning: **a regex over prose finds words, not facts.**

**3 · THE TRADITION'S AESTHETIC.** When gradients are weak, the people decide the plan — the Figurists lay
out on a figure. `traditions.json` carries `aesthetic` for all 26.

**4 · ⛔ NOTHING.** If none of the three yields a placement, **emit fewer sites.** A town with three
well-reasoned places beats a town with eight invented ones.

---

## §3 — SCHEMA

```
localMap: { bearing, metres, level? }
```

- **bearing** 0 = toward the pole (up-map), 90 = east. Same frame as the world map.
- **metres** from the settlement centre. ⛔ **Metres, not degrees** — a village is 400–800 m and degrees
  are unreadable there.
- **level** ⚠️ **REQUIRED FOR INTERIORS AND UNDERGROUND.** 0 ground, positive up, negative below. **The
  Cogitarium's entrance hall and third terrace are the same footprint at different heights and land on top
  of each other without it. The Service Ways go to −4.**

**Conversion:** `dLat = m·cos(bearing)/111320`, `dLon = m·sin(bearing)/(111320·cos(lat))`.

⚠️ **`radiusMetres` is nullable.** The Service Ways have no radius; the seed says the network is not fully
mapped after four centuries, and inventing a bound would contradict the fiction.

---

## §4 — ⛔ EVERY PLACEMENT EMITS ITS REASON

All 38 sites carry a `why`. **That is not commentary — it is the review surface and the training signal.**

⛔ **A generated placement that cannot cite a gradient or a line of prose is decoration, and should be
dropped rather than shipped.** ⚠️ **Gate it: every generated site has a `why` naming its source.** That
gate will go red the first time the generator invents something, which is exactly when you want to know.

---

## §5 — NEW PLACES GET THIS ON CREATION

⛔ **A discovered or minted place must arrive with a local frame, not acquire one later.** The 17 promoted
places are the argument: they came into content at their parents' exact coordinates, and CCode's own
finding — *"a room's position is a duplicate, not an observation"* — is what that costs.

⚠️ **Run the engine at mint time**, so a new place has a bearing and a distance from the moment it exists.

---

## §6 — WHAT I STILL OWE

**Layouts for the remaining settlements** — I have 8 of 96. ⚠️ **I would rather the engine generate the
next tranche and I REVIEW them** than author 88 by hand: the corpus exists to be argued with.

⛔ **And one data gap found while authoring: `echo_river_crossing`'s nearest traced river is 3.83° — about
425 km — and the town IS a bridge over the Echo.** `waterauth.json` authors it; the built hydrology does
not carry it there. **I placed the bridge on the fiction and flagged it rather than bending the layout
around bad data.**
