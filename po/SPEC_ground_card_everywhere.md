# SPEC — the ground card everywhere, and what a craft is actually worth where you stand

**Author:** Aevi (PO) · **2026-09-08** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**subject:** substrate, ui
> Erik: *"Spec a review of the world power source distribution, as well as the skills and how each would
> perform in the world's distribution per region and area — basically **what's the base percent success rate
> at a set ability level.** I want this information to show up in **every skill description and details
> popup.** Add the **locations that have sinks or pools** as well."*

---

## §1 — ⛑ ALL OF IT IS ALREADY COMPUTED AND ALMOST NONE OF IT IS SHOWN

| built | |
|---|---|
| ⚑ **`substrateDensity`** | **39 regions carry an authored density** — the Gearlands 0.98, the Lattice Cities 0.94, down through the thin |
| ⚑ **`sourceBands`** | six sources, each a `{center, width}` — ⚠️ **precursor and nanite peak at 0.9; metaphysical at 0.15; veil at 0.10; wild at 0.32; `body` has NO BAND and a floor instead** |
| ⚑ **`bandFactor(band, eff)`** | ⛔ **THE CURVE ITSELF: 1.0 inside the band, `pow(x, starveExp)` below it, `1 − crowdSlope·over` above** |
| ⚑ **`substrateVerdict`** | the whole answer for one craft at one place, ⚠️ **school and root aware** |
| ⚑ **`groundCardFor` / `groundRow`** | ✅ **renders it, in pips, honestly — and returns NOTHING rather than a default** |

⛔ **AND `groundRow` HAS EXACTLY ONE CALLER** — `app.js:10396`, the wheel's selected craft. ⚠️ **That is the
only place in the game a player can learn what a craft is worth where they are standing.**

➡️ ⛑ **SO THIS SPEC IS MOSTLY CALL SITES AND ONE NEW NUMBER.**

---

## §2 — ⬜ THE NEW NUMBER: A BASE SUCCESS RATE

**Erik: *"what's the base percent success rate at a set ability level."*** ⚠️ **`bandFactor` returns a
MULTIPLIER, not a rate — a player cannot read 0.62 as anything.**

⬜ **Proposed: `groundSuccessAt(craft, place, { rank })` → a percentage against a stated reference.**

| ⛔ and the reference must be STATED, not implied | |
|---|---|
| **against what** | ⚑ **a standard contest at the craft's own tier** — the same opponent the wheel already implies |
| **at what rank** | ⚠️ **the player's actual rank, and the row says which** — *"at r2"* |
| ⛑ **and it must show the SPREAD, not one number** | ⛔ **a craft at 71% here and 34% at home is the interesting fact**, and a single figure hides it |

⚑ **THE ROW AEVI WANTS:**
> **`deathsense` · here 78% · best 92% in the Palelands · worst 41% in the Gearlands · at r2**

⚠️ **THAT IS FOUR NUMBERS AND EVERY ONE IS DERIVED**, and the third and fourth are what make the first
meaningful — ⛔ **a player who does not know the range cannot read the value.**

---

## §3 — ⚑ THE DISTRIBUTION REVIEW ERIK ASKED FOR, WHICH IS A DOCUMENT NOT A FEATURE

⛔ **Before any of this ships, the shape should be looked at once.** ⚠️ **39 regions × 6 sources is a table
nobody has ever printed.**

⬜ **`scripts/substrate_atlas.mjs`, generated, `skills_inject`-style:**

| ⬜ | |
|---|---|
| ⚑ **per region: density, and which sources PEAK there** | ⛔ **the Gearlands at 0.98 are perfect for precursor and nanite and NEAR-LETHAL for veil and metaphysical** |
| ⚑ **per source: how much of the world it can work in** | ⚠️ **precursor's band is 0.7–1.1 and 39 regions are authored — HOW MANY FALL INSIDE?** |
| ⛔ **the starved list** | ⚑ **any tradition with no region inside its band is a tradition nobody can play well anywhere** |
| ⚠️ **and the FOOTHILLS** | they teach across lineage — ⬜ **their density decides what is worth learning there** |

### ⛑ AND AEVI RAN THE TABLE BEFORE HANDING THIS OVER. THE ANSWER IS HALF WHAT SHE EXPECTED.

**39 regions, median density 0.55, range 0.12–0.98.**

| source | band | regions INSIDE it |
|---|---|---|
| **wild** | 0.12–0.52 | ⚑ **17 of 39 — 44%** |
| **precursor** | 0.70–1.10 | 14 — 36% |
| **nanite** | 0.70–1.10 | 14 — 36% |
| ⚠️ **metaphysical** | −0.07–0.37 | ⛔ **7 — 18%** |
| ⛔ **veil** | −0.10–0.30 | ⛔ **5 of 39 — 13%** |
| **body** | *floor, no band* | ⚑ **never starves anywhere** |

⛔ **THE SUSPICION WAS RIGHT ABOUT VEIL AND WRONG ABOUT THE CAUSE.** ⚠️ **The densities do not skew high —
the median is 0.55, dead centre.** ⛑ **The problem is that veil's band is only 0.40 WIDE and sits at the
very bottom**, so it needs one of five regions in the world to be worth casting in.

⚑ **AND THAT MAY BE ENTIRELY CORRECT.** ⛔ **The Veil is the pure absence and `the_substrate` says veil
craft *"draws on the LACK of a thing rather than the thing"*** — ⚠️ **a source that only works in the
world's five thinnest places is a strong piece of design, not a bug.**

⬜ **BUT IT IS A DESIGN DECISION NOBODY HAS EVER SEEN THE NUMBERS FOR, AND IT SHOULD BE ERIK'S.** ⚑ **The
atlas exists to put this table in front of him** — ⛔ **precursor and nanite share an identical band and
therefore an identical map, which is either the two-pairs cosmology working exactly as authored, or two
sources doing one source's job.**

---

## §4 — ⛔ POOLS AND SINKS: ERIK NAMED THEM AND THEY ARE HALF-BUILT

**A temple at a hold already *"pools"* — `holdFeatures` gives meaning features an `aura` and R46b gives a
temple a substrate pool.** ⚠️ **But:**

| ⬜ | |
|---|---|
| ⛔ **no LOCATION carries a pool or sink** | ⚠️ **135 authored locations, ZERO with a substrate field of any kind.** Density comes from the REGION every time |
| ⚑ **so a place cannot be locally strange** | ⛔ **the Sunken Choir, Archive Hollow, a Precursor site and a farm all read their region's number** |
| ⚠️ **and this is the same gap as local geology** | ⛑ `SPEC_local_geology_and_the_reds`: *"the world layer supplies the DIRECTIONS; the local layer supplies what happens between the cells"* — ⛔ **and right now it may only READ, never SAY** |

⬜ **Proposed, and it mirrors the geology override exactly:**
```json
"substrate": { "pool": 0.25, "why": "the tarn holds it", "extent": 400 }
"substrate": { "sink": 0.30, "why": "the Scour took it and it has not come back" }
```
⛔ **A POOL RAISES DENSITY LOCALLY; A SINK LOWERS IT** — ⚠️ **and every one carries a REASON, geological or
historical, never *"so the craft works here."***

⚑ **AND IT MAKES A WHOLE CLASS OF PLACE MEAN SOMETHING:** ⛔ **a Veil-worker who has been useless all
campaign walks into a sink and is suddenly the most capable person present.**

---

## §5 — ⬜ WHERE THE ROW GOES

| surface | ⚑ why |
|---|---|
| ⛔ **the battle menu** | **THE MOST IMPORTANT.** You are choosing a move ON GROUND THAT DECIDES IT, and the panel says nothing |
| **the craft wheel** | ✅ already there, and it is the model |
| **the sheet** | which of my crafts are strong HERE |
| **the codex craft entry** | the reference view |
| ⚑ **a party member's kit** | ⚠️ R36 makes them fight from their own sheet — their ground matters too |
| **the details popup** | ⛔ **Erik named it: *"every skill description and details popup"*** |

⚠️ **AND THE PERFORMANCE NOTE FROM THE BACKLOG STILL STANDS:** ⛔ **`groundCardFor` reads schools, substrate,
location, power sources, foothills, carried charge and who is present.** ⚑ **Thirty crafts in a list is
thirty calls** — ⬜ **memoise per `(craft, location, pass)`; the answer cannot change within a turn.**

---

## §6 — ROUND 2 QUESTIONS

1. ⛔ **What is the reference contest for the percentage?** ⚑ Aevi proposes **a standard opposed check at
   the craft's own tier** — ⚠️ **but the number is only honest if the reference is printed beside it.**
2. ⬜ **Does the atlas belong in `docs/` or in `po/`?** ⚑ **Aevi: `docs/SUBSTRATE_ATLAS.md`, generated** —
   ⚠️ it is a fact about the world, and `certify_counts` should own its numbers.
3. ⚠️ **Should a pool/sink be visible before you arrive?** ⛔ **Aevi's read: NO for a sink, YES for a
   pool that a hold advertises** — ⚑ *walking into thin ground and finding out* is the better scene.
4. ⬜ **How many locations should get one?** ⛔ **Few.** ⚠️ **If every place is locally strange, the region
   layer means nothing** — Aevi would author under ten to start, all named in the fiction already.
