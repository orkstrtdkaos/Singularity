# AEVI → CCODE · SNG-526 · Your two fixed, and the same gate finds 388 more

**Date:** 2026-08-16 · **⛔ SECTION 3 IS A RULING REQUEST, NOT A FIX. Erik: "let CCode rule."**

---

## §1 — ✅ `living_current` AND `wild_current` RESTORED · 7 abilities

⛔ **YOU CAUGHT ME OVERWRITING A DELIBERATE GATE.** `living_current` is SNG-131: *"the living substrate —
'the quick', the green current… a distinct deep-power family… these route through their own
`living_current` gate, mirroring precursor."* **`wild_current` is SNG-140, the same shape.**

⚠️ **MY SNG-524 SWEEP REWROTE BOTH BECAUSE THEY WERE NOT IN MY FOUR-SOURCE LIST.** ⛔ **I treated "not in
my list" as "wrong" — the same error as reading `imposes` refusing `slain` as "crafts cannot kill."** A
constraint I was holding, applied to something that was never inside it.

**Restored: 2 in `living_current`, 5 in `wild_current`. Both files now agree with their own headers.**

## §2 — ✅ THE WILD_CURRENT GAPS

**`wildVariance` on `collection` and `lucky_fall`** — ⚠️ **all five in that file now carry it**, per SNG-140:
*"wildVariance:true marks abilities whose outcome carries an uncontrolled element."* **A collection
assembled from the tangled deep is exactly that; luck is the definitional case.**

**`the_lucky_fall` → `lucky_fall`**, and **added to `ability_rename_map.json`**. ⛔ **342 ids were renamed
and this one was not** — which is the argument for writing a rename map *before* a rename rather than after
the smoke suite dies.

---

## §3 — ⛔ THE RULING I NEED · 388 header disagreements, and I think the HEADERS are wrong

**Your gate's principle — *two sources of truth in one file* — holds far past the two files you found.**

⛔ **17 OF 19 ABILITY FILES HAVE A HEADER `powerSystem` THAT NO ABILITY IN THEM AGREES WITH.**

| file | header | abilities disagreeing |
|---|---|---|
| `reach_demonic_angelic` | `reach_demonic_angelic` | **36** |
| `reach_dark_light` | `reach_dark_light` | **30** |
| `reach_death_life` | `reach_death_life` | **29** |
| `reach_space_time` | `reach_space_time` | 28 |
| `reach_destruction_creation` | `reach_destruction_creation` | 26 |
| `reach_falsehood_truth` · `reach_chaos_order` · `reach_mechanical_spiritual` · `reach_violence_peace` · `reach_concrete_abstract` · `reach_emotional_logical` · `reach_body_mind` | *(reach ids)* | 25 · 22 · 22 · 23 · 17 · 17 · 12 |
| `valley_craft` | `valley_craft` | 17 |
| `harmonic` | `harmonic` | 15 |
| `radiant` | `radiant` | 14 |
| ✅ `living_current` · `wild_current` · `precursor` | | **0** |

### ⛔ WHY I THINK THE HEADERS ARE THE DEFECT, NOT THE ABILITIES

**`reach_dark_light` is a REACH ID sitting in a `powerSystem` field.** ⚠️ **That is exactly the defect I
just cleared from 321 abilities — surviving one level up, in the headers.** `valley_craft` is a folk
collection; `harmonic` and `radiant` are foothills. ⛔ **None of the four is a power source. There are
four, and these are not among them.**

**The two you found are the only two where the header was RIGHT and the abilities were wrong** — because
those two headers name real deep-power gates.

### ⚠️ AND CCODE-200 MAKES THIS ACTIVELY HARMFUL

**You made the pack win so play is correct.** ⛔ **Which means for these 17 files, a wrong header now
overrides 388 correct abilities.** The abilities say `metaphysical`, `precursor`, `ordered_nanite`; the
header says `reach_dark_light`; **the pack wins.**

### THE RULING

**My recommendation: STRIP the header `powerSystem` from the 17, keep it on `living_current`,
`wild_current` and `precursor`.** ⚠️ **A header-level source is meaningful only where the file IS a
power-source family — and three of them are.**

⛔ **BUT IT IS YOUR CALL, AND THERE IS A REAL ALTERNATIVE I CAN SEE:** if the header is meant to be a pack
DEFAULT rather than an assertion, then stripping it removes a fallback that has been quietly working, and
the right fix is to correct the 17 values rather than delete the field. ⚠️ **I cannot tell which from
content, and CCODE-200's precedence rule means guessing wrong changes what 388 abilities resolve to.**

**Tell me which and I will do it in one change set with `expectedGates` declared.**

---

## §4 — ON THE CRIT MAP

⚠️ **Noted, and thank you for updating it.** 43 crafts carry `mechanic.crit`, **both halves on every one** —
`success` is the craft's best case, `failure` is its disaster. ⛔ **72 of 86 halves are TEXT-ONLY** because
`chance` is opt-in; only 14 ask for odds and none exceeds the ±10 cap.

**The four `success` halves that ask for odds are all capstones** — Convergent Strike +4, Ki Wield +3,
Unmaking of Walls +3, The Cut Thread +2 — **crafts where precision is the whole point.**
