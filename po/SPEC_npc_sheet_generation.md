# SPEC — the NPC sheet: generation, level, and evolution

**Author:** Aevi (PO) · **2026-09-07** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**subject:** npc-sheets · **supersedes** the sheet halves of `SPEC_progressive_sheets` and
`SPEC_npc_character_sheets`
> Erik: *"Write a comprehensive spec to bring this all together. **I'm not sure why you picked 8 skills.
> That is level driven like the PC path. Determining level upon creation should be one of the first
> steps.**"*

---

## §1 — ⛔ HE IS RIGHT AND THE MEASUREMENT IS EMBARRASSING

**`growthFor` has carried the rule the whole time:**
```js
const capacity = Math.max(1, Math.round(level / cfg.craftsPerLevels));   // default 2
```

⚠️ **Every authored sheet in the corpus, measured against its own level:**

| npc | level | crafts | capacity | |
|---|---|---|---|---|
| `hallis_pale` | 27 | **8** | **14** | ⛔ **THIN BY 6** |
| `aro_horizon` | 26 | 8 | 13 | ⛔ thin by 5 |
| `kestrin_riven` · `bricke_making` · `oreth_quiet` · `sethran_hold` · `vantia_stillhold` | 23–25 | 8 | 12 | ⛔ thin by 4 |
| `siol` | 26 | 9 | 13 | ⛔ thin by 4 |
| `calvar` · `lys_vane` | 22 | 8 | 11 | ⛔ thin by 3 |
| `bren-thalle` · `mara-wells` · `silas-mother` | 9–18 | 6–8 | 4–9 | ✅ |
| ⚑ `pell` 27 · `veth-ondra` 33 | | 27 · 24 | 14 · 16 | ⚑ **above floor — authored, and correct** |

⛔ **I GAVE EIGHT PEOPLE EIGHT CRAFTS BECAUSE EIGHT FELT LIKE ENOUGH.** ⚠️ **The three that pass are the
three I authored at LOW levels, where 8 happens to be near capacity** — ➡️ **so the error was invisible
until Erik asked.**

---

## §2 — ⚑ LEVEL IS STEP ONE, AND EVERYTHING HANGS OFF IT

⛔ **A sheet is not a list of crafts with a level attached. IT IS A LEVEL, AND THE LIST FOLLOWS.**

| step | what it decides |
|---|---|
| ⚑ **1 · LEVEL** | ⛔ **first, always.** Health `30 + 5/level`, energy `100 + 5/level`, ⚠️ **`breakAtPressure = ceil(level/2)`**, capacity, and the tier a craft may be held at |
| **2 · DOMAINS** | ⛔ **`{primary, secondary, tertiary}` — and `kitFor` on a person without them returns `band: "open"` and draws from THE WHOLE CATALOGUE.** ⚠️ The trap that caught Pell and Veth |
| **3 · CAPACITY** | ⚑ `round(level / 2)` |
| **4 · THE KIT** | drawn from domains + capacity + evidence |
| **5 · RANKS** | ⚠️ **level bounds the top rank, not just the count** |
| **6 · ABSENCES** | ⛔ `closed[]` — what this person will NOT learn |

### ⬜ AND WHERE LEVEL COMES FROM AT CREATION

| the person is | level |
|---|---|
| ⚑ **authored** | ⛔ **the author says.** Nothing derives over it |
| ⚑ **on the tier ladder** | ⛔ **`tierFloor` — riffraff → mythic already sets a floor** |
| ⚑ **known to the player** | **`derivedLevel`** — `floor(met/4) + floor(daysKnown/96) + standing/25`, ⚠️ **R37: the three proximities STACK** |
| ⚑ **an encounter opponent** | ⛔ **from THREAT, and that is the one that has been doing all the work** |
| **generated cold** | ⬜ **their region's tier band, and the story raises them** |

⛔ **AND A CHAMPION OF THE COLISEUM SHOULD NOT BE LEVELLED FROM THREAT ONCE THEY HAVE A SHEET** —
⚠️ **that inverts: threat should be DERIVED from the person, not the person from the threat.**

---

## §3 — ⚠️ RANK IS LEVEL-BOUND, NOT FREE

**Today an authored sheet may put r3 on anything.** ⛔ **A level-9 stall-holder with a rank-3 craft is a
sheet nobody checked.**

⬜ **Proposed, mirroring the PC path:**

| level | top rank reachable | ⚑ |
|---|---|---|
| **1–9** | r1, ⚠️ **one r2** | a person with one thing they are good at |
| **10–19** | r2, ⚠️ **two r3** | competent, with specialities |
| **20–29** | r3 on the domain crafts | ⚑ **a champion** |
| **30+** | r3 broadly | ⛔ **Veth at 33 with 24 crafts is what this looks like** |

⚑ **AND THE SHAPE MATTERS MORE THAN THE COUNT: a sheet where everything is r2 is a person with no
character.** ⚠️ **The good sheets are spiky — Vantia is r3 in three holding crafts and r1 in a word she has
said once.**

---

## §4 — ⚑ THE KIT, DRAWN FROM EVIDENCE AND NOT FROM TASTE

⛔ **In priority order, and every step is already built:**

| # | source | ⚑ |
|---|---|---|
| **1** | ⛔ **`skillsObserved`** | ⚠️ **what the story actually SHOWED.** Mara's *"reading a technical expert's reaction as diagnostic data"* → `keen_appraisal` r3. **All 15 authored sheets were written this way** |
| **2** | ⚑ **tactic tags** | ⛔ **43 now map to a contribution family** — the same map should seed a kit |
| **3** | **`role` and `knowledge`** | *"pre-Transition filtration engineer"* is a kit |
| **4** | ⚑ **domains** | `kitFor` fills the rest at the right band |
| **5** | ⛔ **the family archetype** | ⚠️ **the floor, and never the whole answer** |

⛔ **AND ABSENCES ARE AUTHORED TOO.** ⚑ **Veth refuses `calling_back`; Oreth refuses `hastened_grey` and
`the_cut_thread`.** ⚠️ **A generator that only ADDS is half a generator** — `closed[]` is the field and it is
read.

---

## §5 — ⚑ EVOLUTION: THE SAME LOOP AS A BRAID

⛔ **R39 ruled it for crafts and the shape is identical for people:** ⚑ **a sheet is not finished at
creation; it becomes what its use makes it.**

| | |
|---|---|
| ⚑ **`growthFor` is the reader** | ⛔ **R37's rates are RULED: 1 level per completion, 1 per condition step, and the three proximities STACK** |
| ⚑ **a gained craft starts at r1** | ⛔ **Erik, 09-02. No exceptions for tenure, charge or tier** |
| ⚑ **`skillsObserved` is the evidence** | ⚠️ **the story shows a thing; the sheet gains it.** Same loop as `coActivations` growing a braid |
| ⛔ **and it must never PRUNE** | ⚑ **an authored sheet is a FLOOR** — `room = max(0, capacity − crafts)`, and Pell's 27 against capacity 14 has room 0, ⚠️ **which is correct and not an error** |

---

## §6 — ⬜ THE IMMEDIATE WORK

| # | | |
|---|---|---|
| **1** | ⛑ **bring the nine thin sheets to capacity** | ⚠️ **Aevi's, and it is authoring: 8 champions + Calvar + Siol.** ⛔ **Their tactic tags and prose already name more than 8 crafts each** |
| **2** | ⛔ **`domains` for the 41 with none** | ⚠️ **derivable from `assistTags`, `role`, `communityId` — and NOTHING ELSE WORKS WITHOUT IT** |
| **3** | ⚑ **generate a kit from level + domains + evidence** | CCode |
| **4** | ⚑ **let `growthFor` WRITE** | ⛔ it has been a reader since it shipped |
| **5** | ⬜ **derive an opponent's threat FROM the sheet** | ⚠️ **so a champion's difficulty comes from who they are, and the −0.95 correlation stops being the whole story** |

---

## §7 — ROUND 2 QUESTIONS

1. ⛔ **Is `craftsPerLevels: 2` right?** ⚑ It gives a L30 fifteen crafts and Silas has 40 at L31. ⚠️ **Either
   the PC is above formula the way Pell is, or the dial is wrong for players and right for NPCs** — ⬜ **worth
   knowing which.**
2. ⚠️ **Should rank bands be a content table** rather than prose? ⬜ Aevi's read: **yes, beside
   `craftsPerLevels`.**
3. ⛔ **Does a sheet gaining crafts change its THREAT mid-campaign?** ⚑ **It should — R37 grows NPCs, and a
   figure who has been campaigning is harder now.** ⚠️ **But an encounter authored at threat 40 would drift,
   and that is either the point or a bug.**
4. ⬜ **What levels a generated stranger?** ⚑ §2 says a region's tier band. ⚠️ **Nothing authors tier bands
   per region yet.**
