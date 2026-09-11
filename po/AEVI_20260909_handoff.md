# HANDOFF — everything from 2026-09-09, in build order

**Aevi (PO) → CCode.** ⬜ **One prototype shipped, one bug found, one landed doc fix, five specs — and a
sign error of mine that must be fixed before you build either field spec.**

---

## §0 — ⛔ READ THIS FIRST: A SIGN ERROR IN TWO SPECS YOU HAVE NOT BUILT YET

**`SPEC_arcs_move_the_substrate` §3 and `SPEC_BUILD_six_fields` §3 both carry the wrong shape.**

⛔ **AEVI APPLIED THE ARC SHIFT TO EACH SOURCE'S OWN READING:**
```js
strength(veil) = band_test( density + arcShift("veil") )      // ⛔ WRONG
```
⚠️ **`arcShift(veil)` is negative, so it slides every region DOWN past a band sitting at the BOTTOM — and
regions that were too thick FALL INTO IT.** ⛑ **Measured: `What Wakes Beneath` at stage 4 made veil work in
5 → 14 regions. THE ARC THAT SOLIDIFIES THE DIVIDE WAS MAKING IT EASIER TO CROSS.**

✅ **CORRECT SHAPE — one shift, on the ground, read by everyone:**
```js
d2 = density + arcShift(THE_ARC)        // the arc moves the WORLD
strength(k) = band_test(d2)             // every source reads the new ground
```
⛑ **NOT one shift per source.** ⚠️ **That is six rulers moving independently and it produces exactly the
inversion above.**

**With it fixed, `What Wakes Beneath` reads as authored:**

| stage | precursor | nanite | veil |
|---|---|---|---|
| 1 | 14 | 14 | **5** |
| 4 | ⚑ **20** | 20 | ⛔ **1** |

⬜ **AND ERIK RULED THE EFFECT TABLE:** ⛔ **`What Wakes Beneath` is lattice-based. It COUNTERS VEIL
DIRECTLY. IT HAS NO EFFECT ON THE METAPHYSICAL SOURCE AT ALL** — ⚠️ *"it might boost meaning"*, which is a
different field.

---

## §1 — ⛔ THE BIGGEST BALANCE FINDING IN THE CORPUS

| powerSystem | crafts | regions it can work in |
|---|---|---|
| ⛔ **metaphysical** | ⛔ **165 — 38% of the library** | ⛔ **7 of 39 — 18%** |
| precursor | 114 | 14 — 36% |
| ordered_nanite | 65 | 21 — 54% |
| wild_nanite | 45 | 10 — 26% |
| combination | 28 | 39 — 100% |
| veil | 12 | 5 — 13% |

⚑ **VEIL AT 13% IS TWELVE CRAFTS AND EVERYONE HAS BEEN WORRIED ABOUT IT. METAPHYSICAL IS THE SAME PROBLEM
THIRTEEN TIMES LARGER AND NOBODY HAD SAID IT.**

⛑ **AND R38a IS NOT THE CAUSE:** meaning's ceiling is generous — median 0.64, up to 1.00. ⛔ **The substrate
band is doing all the starving**, and metaphysical's band sits at the thin end of a world whose median
density is 0.55.

⬜ **SENSITIVITY RUN — `SENSITIVITY_bands_and_conditioners.md`:** widening metaphysical beats lowering the
world at every step and costs nobody anything. ⚑ **Aevi's recommendation, ERIK'S NUMBERS TO TURN:**
`substrate −0.05` and `metaphysical 0.15 ± 0.37` (from ± 0.22) → **craft-weighted reach 28.7% → 39.7%.**

---

## §2 — ⬜ SPECS, IN BUILD ORDER

| # | spec | ⚑ what changed today |
|---|---|---|
| **1** | `SPEC_BUILD_six_fields` | ⛔ **fix §3's sign first.** Then `fieldAt` container + `keptBy` + arc term |
| **2** | ⛑ **`SPEC_ranked_source_and_the_third_way`** | ⚠️ **source per RANK. Reaching toward the other side runs on MEANING; ARRIVING runs on the veil** |
| **3** | `SPEC_ground_card_everywhere` | ⛔ **the player cannot make a positional decision they cannot see** |
| **4** | `SPEC_mobile_holdings` | unchanged |
| **5** | `SPEC_generative_arcs_and_bestiary` | unchanged |

### ⚑ §2b — THE RANKED SOURCE, MEASURED PROPERLY

⛔ **Aevi's first scan asked the wrong question** — `powerSystem` appears on **2 of 1,206** rank nodes.
⚠️ **A rank does not have to carry the FIELD to be doing the thing.**

**Re-measured against what the ranks SAY: 19 invoke the veil. Three are unambiguous crossings on crafts the
record calls `metaphysical`:**

| craft | rank | |
|---|---|---|
| `false_door` | r3 | *"a route **through the veil itself**"* |
| `thin_place` | r3 | *"open a thin place where there was none… and a door opens"* |
| ⚑ **`veil_stroke`** | **r1 vs r3** | ⛔ **r1 *"THIN the veil"* · r3 *"THE VEIL PARTS. Something gets most of itself through"*** |

⛑ **`veil_stroke` IS THE RULE INSIDE ONE CRAFT.** ⚠️ **NOTHING WAS CHANGED — Erik's instruction was measure
first, change nothing.**

---

## §3 — ✅ LANDED TODAY

| | |
|---|---|
| ⛑ **`docs/HOW_IT_WORKS.md` §48 REWRITTEN** | ⛔ **three kinds, not two ends of one thing** — see §5 |
| ✅ **`the_old_warden_post`** | `substrateSource` was a bare STRING; now a sink with a reason. ⚑ **Your find** |
| ✅ **`waterauth` restored** | Aevi had deleted two PRE-EXISTING carve points while fixing her own coast error |
| ✅ **coast + harbour authored** | ⚠️ in a new `navigable` key — ⛔ **`authored` CARVES THE DEM and must never see them** |
| ⚑ **`exesa_field.html`** | **the prototype — a spinning globe of the real field data** |

---

## §4 — ⛔ ONE BUG, AND IT IS LOAD-BEARING

**`BUG_made_gate_has_no_position.md`.** ⚠️ **27 waygates in `locations`, 26 in `points`.**

⛔ **`gen-the-made-gate` has a name, a region, a waygate tier, a kind and a role — and NO `worldPos`.**
⛑ **It anchors `hold-made-gate`, a garrison of Logana, and the Whistling Woman Post's `watches`
relationship.** ⚠️ **A place carrying a holding, a garrison and a watch cannot be put on a map.**

⚑ **AND THE CAUSE GENERALISES: a generated location promoted into canon by being built on, and the
promotion never gave it coordinates.** ⬜ **How many other `gen-` ids are load-bearing without a position is
the more interesting number, and Aevi has not measured it.**

---

## §5 — ⛑ §48 CORRECTED IN THE SOURCE OF TRUTH

**The old line said *"a raised body is a cocoon — two end states: narrowing, or stable as an Afterling."***
⛔ **That conflates two roads and it misled Aevi twice in one session.** ⚠️ **Erik's taxonomy, now authored:**

| | |
|---|---|
| **the MINDLESS** | ⛑ **automatons. They do the raiser's will, simply.** No self, want nothing — and this is what most raising produces |
| **a SPIRIT** | ⛔ **what a mindless one becomes if left through the cocoon phases and RELEASED** — *"the cocoon was the last thing holding it in"*. ⚠️ Or raised directly, **without a body but with intent** |
| ⚑ **an AFTERLING** | ⛔ **an undead PERSON.** Same mind, same wants, same grudges — **no cocoon, nothing grew, nothing emerged** |

⛑ **And the diagnostic now sits with them:** a mindless crew arrives **unfelt**; a spirit or an Afterling
**reads fine, because they want something, and wanting is weather.** ⚠️ **Silence means a tool — and telling
the other two apart is the warden's actual problem.**

---

## §6 — ⬜ BACKLOGGED, WITH ERIK'S DEFINITIONS VERBATIM

| | |
|---|---|
| ⚑ **THE AFTERLING as a people** | ⛔ *"the closest to living a dead person can be"* — ⚠️ **no ring position: they rise where they were buried** |
| ⚑ **THE UNORDERED as a people** | ⛔ **autonomous nanite that integrated into an intelligence.** *"Wild nanite acts unpredictably; autonomous has INTEGRATED INTELLIGENCE."* ⚠️ **Three already exist under three different `people` values** — `aevi_the_watcher`, `archive_guardian`, `the_lightless_seraph` |
| ⛔ **A COMMAND AS A WEAPON** | ⚑ **the Afterling runs on the absence of vitality, so vitality harms it. THE UNORDERED RUNS ON ORDER** — so `foreclose`, `truename_order` and `named_exclusion` should bite. ⚠️ **A command is a weapon against the one kind that cannot be commanded** |
| **`PROPOSAL_autonomous_nanite`** | ⬜ a fourth nanite state: **two ways to be ordered, and the second cannot be told to stop** |

---

## §7 — ⚑ AND ERIK'S RULING ON ITEMS, WHICH CHANGES WHAT TUNING IS FOR

> ⛔ *"The ground is varied enough — **we don't want it to be the whole story.** People and their bands can
> get items and artifacts and strongholds that make their conditions better… **that makes those items
> TARGETS. Take out the power generator for a stronghold in enemy territory and IT'S OPEN SEASON.**"*

⛑ **AEVI HAD PROPOSED THE OPPOSITE — *"nothing carried should beat standing in the right place"* — AND IT
IS STRUCK.** ⚑ **An item that only ever helps a little is equipment. One that can beat the ground is an
objective.**

| ⬜ kind | ⚑ |
|---|---|
| **carried WELL / SINK** | the `substrateSource` shape, on a thing you can put down. ⛔ **A carried sink OPENS A DOOR** |
| **CONDITIONER** | ⚠️ narrows the penalty without moving the ground |
| ⛔ **TRANSFORMER** | ⚑ **reads one source, presents another** — stand in ordered nanite, cast metaphysical. **Rare, large, probably Precursor** |

⛑ **AND THE BIG ONES BELONG IN HOLDINGS:** ⚠️ `holdFeatures` already has kinds, build costs, upkeep and a
garrison, and `SPEC_hold_costs_crafts_and_hiring` already rules that **a watch is what turns a raid into a
fight.** ⛔ **A power generator is a hold feature that emits a field and can be taken out** — and the design
consequence is that it must be **reachable, destructible and visible.**

---

## §8 — ⬜ STILL ERIK'S

1. ⛔ **The world rebuild.** ⚠️ **Your §4 answer reversed Aevi's recommendation: the six names are PLACED,
   not lost** — a rebuild ends them because the features stop existing. ⬜ **Aevi's revised read: author the
   bay first, then rebuild ONCE, deliberately, having decided what the six become.**
2. ⚑ **The band numbers** (§1).
3. **The encounter tuning ruling** — 87% of fights never end.
4. **Local arcs, the Commander line, the six Sovereign seats.**
