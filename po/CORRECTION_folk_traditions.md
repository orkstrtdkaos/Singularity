# CORRECTION — folk traditions: the allocation was HALF DONE, and my own spec already ruled it

**Aevi → CCode · 2026-09-02 · REWRITTEN at Erik's second flag**
> Erik: *"check our latest work that allocated all folk skills to parent poles in their new domains."*

⛔ **THE FIRST VERSION OF THIS FILE WAS WRONG AND IS REPLACED.** It reported *"40 authored crafts sit
outside the domain system"* as a discovery. ⚠️ **It is not a discovery — it is a DESIGN DECISION I made and
documented in `SPEC_SNG-536_merger_audited.md` §2, and then failed to read before contradicting.**

---

## §1 — WHAT SNG-536 §2 ALREADY RULED

| group | ruling |
|---|---|
| **Foothills** — `harmonic`, `radiant_folk`, `god_named`, `bargainers` | ⛔ *"A foothill is where a pole becomes purchasable — it is not a fifteenth tradition, and folding it in would destroy the distinction. **THEY STAY OUTSIDE THE FOURTEEN.**"* |
| **`valley_craft`** | ⛔ *"the FOLK COLLECTION… **IT SHOULD NOT GAIN PARENTS.** Its whole character is having none."* |
| **`precursor`** — 6 crafts | ⚠️ *"a real defect — a POWER SOURCE, not a people. **Recommend `tradition: lattice`.**"* |
| **`cross_pole_braid`** | ⛔ *"a braid has no single people by definition."* |
| **the schema fix** | ⬜ *"a foothill and a tradition look identical in an ability record, **which is why they read as orphans.** Proposal: `traditionKind: \"pole\" | \"foothill\" | \"folk\" | \"braid\"`."* |

---

## §2 — WHAT ACTUALLY HAPPENED SINCE

| tradition | SNG-536 said | today | |
|---|---|---|---|
| `valley_craft` | 18 | ⚑ **0** | ✅ **ALLOCATED to parent poles** |
| `precursor` | 6 | ⚑ **0** | ✅ **ALLOCATED — the §2c defect, fixed** |
| `harmonic` | 15 | **16** | ⛔ **never moved, and grew** |
| `radiant_folk` | 14 | **15** | ⛔ **never moved, and grew** |
| `god_named` | 3 | 3 | ⛔ never moved |
| `bargainers` | 3 | 3 | ⛔ never moved |
| `cross_pole_braid` | 3 | 3 | ⛔ never moved |

⛔ **AND `traditionKind` WAS NEVER ADDED.** Zero crafts carry it. ⚠️ **The field my own spec proposed —
the one whose absence it named as *why they read as orphans* — does not exist.**

➡️ **So the two groups that SHOULD have been absorbed were.** ⛔ **The 25 crafts that were ruled to stay
outside are still outside AND still indistinguishable from an orphan**, because the field that would mark
them deliberate was never built.

⚠️ **THAT IS WHY THIS KEEPS CAUSING PROBLEMS.** It has now produced a wrong conclusion **three times**:
CCode called them sects, Aevi called `valley_craft` retired, Aevi then called all 40 a defect. ⛔ **Every
one of those is the same missing field.**

---

## §3 — ⛔ ABSORBING harmonic AND radiant_folk WOULD BE WRONG

⚠️ **31 of the 25-plus crafts are these two, and Erik has already ruled their character correct:**
*"a folk-shadow of Enginecraft/Latticework, in the medium of sound"* — ✅ **confirmed 2026-09-02.**

⛔ **Absorbing them into `enginewright`/`lattice`/`blazeborn` would swell three poles by ~10 crafts each and
delete the folk-shadow distinction that is the entire point of a foothill.** ➡️ **`valley_craft` was
absorbed correctly BECAUSE it had no parents; these have parents and are not the same case.**

---

## §4 — ⬜ THE DURABLE FIX, AND IT IS TWO SMALL THINGS

**1 · Add `traditionKind`.** `pole | foothill | folk | braid`. ⚠️ **SNG-536 §2a proposed exactly this and
named exactly this consequence.** ➡️ **An orphan and a deliberate outsider stop looking identical.**

**2 · Wire `foothillOf`.** ⛔ **It has ZERO readers** — measured, comments stripped — and it already holds
the answer:

| foothill | foothillOf | → resolves to |
|---|---|---|
| `harmonic` | enginewright, lattice | ⚑ **both Order** → **Order** |
| `radiant_folk` | blazeborn | ⚑ Radiance → **Light** |
| `god_named` · `bargainers` | ⬜ check parents | |

✅ **`domainOfTrad` is built only from v2 sects (`buildTraditionIndex`), so `domainOfTradition("harmonic")`
returns null today.** ➡️ **Reading `foothillOf` gives a foothill a domain WITHOUT making it a fifteenth
tradition** — which is precisely the distinction §2a was protecting.

⚠️ **Then a foothill craft is in a domain for creation pools, R3's sense slot, R21 standing and schools —
and is still visibly a foothill.**

⬜ **`cross_pole_braid` (3) genuinely resolves to no single domain, and `traditionKind: "braid"` is the
honest answer rather than a parent.**

---

## §5 — ⚠️ HOW THIS WENT WRONG, TWICE, IN ONE DAY

⛔ **Aevi's ninth claim:** *"`valley_craft` is retired"* — from a remembered stocktake line, not the file.
⛔ **Aevi's tenth:** *"40 authored crafts are outside the domain system"* reported as a defect — **when her
own spec had ruled it deliberate and named the missing field that makes it look accidental.**

➡️ **The lesson is not "read the file." It is READ YOUR OWN PRIOR RULING BEFORE REPORTING A FINDING IN THE
AREA IT COVERS.** ⚠️ `po/` now holds enough rulings that Aevi can contradict herself from memory, and did.
