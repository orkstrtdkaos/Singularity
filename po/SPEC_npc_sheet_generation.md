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

---

## §3b — ✅ RULED: WHAT YOU EARNED RAISES THE CAP AS WELL AS FILLING IT

> **Erik, 2026-09-07:** *"Silas has more than he should because he's the first real play test and has been
> keeping skills, plus he has braids and earned free skills. **The minted and braids and earned should raise
> cap by 1 as well as grant the skill so a PC doesn't get penalized.**"*

⛔ **A CRAFT YOU EARNED MUST NOT COST YOU A SLOT YOU ALREADY HAD.** ⚠️ **Otherwise braiding two crafts you
own hands you a third and quietly takes a future one away — a reward that is also a tax, and the player
would learn to stop braiding.**

### ✅ THE RULE
```
capacity = round(level / craftsPerLevels) + earned.length
```

| ⚑ counts as EARNED | why |
|---|---|
| ⚑ **a minted braid** | ⛔ **R39: one rank that becomes what its use makes it.** You made it |
| ⚑ **a bond-taught craft** | ⚠️ `marrow-s-wings` — **a companion gave it to you** |
| ⚑ **a granted craft** | ⛔ a teacher, a rung, a thing the story handed over |
| ⛔ **NOT a craft taken at level-up** | ⚠️ **that IS the slot.** Counting it would make capacity meaningless |

### ⚠️ MEASURED ON SILAS

| | |
|---|---|
| level 31, **36 crafts** | formula capacity **16** |
| ⛔ **8 are not in the catalogue** | ⚑ **3 braids** (`braid_order_sense_palework`, `braid_deathsense_order_sense`, `braid_deathsense_palework`) **+ 5 minted or bond-taught** (`the-attended-end`, `marrow-s-wings`, `the-held-place`, `the-declared-threshold`, `the-received-ending`) |
| ⚑ **corrected capacity** | **16 + 8 = 24** |

⛑ **HE IS STILL ABOVE IT, AND THAT IS THE HONEST PICTURE** — ⚠️ *"the first real play test, and has been
keeping skills."* ⛔ **`room: 0` is the right answer for him; being above formula is not an error, and
`sheetFor`'s authored-wins contract already says so.**

⬜ **CCode: `earned` needs a marker.** ⚠️ **MEASURED: every one of Silas's 36 crafts reads `source:
authored` — there is no field distinguishing a braid from a level-up pick**, and the only reason the eight
are findable today is that they are ABSENT FROM THE CATALOGUE. ⛔ **That is an inference, not a record.**

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

1. ✅ **ANSWERED BY §3b.** ⚑ Silas is L31 with 36 crafts against a formula 16 — **and 8 are earned, so his
   real capacity is 24.** ⚠️ He is still above it, *"because he's the first real play test."* ⛔ **The dial is
   not wrong; the cap was missing a term.**
1b. ⬜ **`earned` needs a FIELD.** ⚠️ Every craft on his sheet reads `source: authored`, and the eight are
   only findable because they are absent from the catalogue — ⛔ **an inference where a record belongs.**
2. ⚠️ **Should rank bands be a content table** rather than prose? ⬜ Aevi's read: **yes, beside
   `craftsPerLevels`.**
3. ⛔ **Does a sheet gaining crafts change its THREAT mid-campaign?** ⚑ **It should — R37 grows NPCs, and a
   figure who has been campaigning is harder now.** ⚠️ **But an encounter authored at threat 40 would drift,
   and that is either the point or a bug.**
4. ⬜ **What levels a generated stranger?** ⚑ §2 says a region's tier band. ⚠️ **Nothing authors tier bands
   per region yet.**

---

# ROUND 2 — CCODE

**CCode (engine) · 2026-09-08.** ⚑ **Erik: *"this needs some foundational work."*** ✅ **The foundation is
wired (§146). Five of the spec's premises measured differently, and two of them change the build order.**

---

## §8 — ✅ AGREED, AND ALREADY TRUE

⚑ **§2 is the spine and I am building to it:** *level is step one, and everything hangs off it.* ⛔ **Every
correction below makes that MORE true, not less** — level turns out to be the binding constraint in the one
place I could measure.

---

## §9 — ⛔ §3b's PREREQUISITE IS ALREADY SATISFIED, AND THE REAL GAP IS ONE LINE AWAY

> *"`domains` for the 41 with none — the prerequisite. NOTHING ELSE WORKS WITHOUT IT."*

⚑ **MEASURED: all 56 non-legend people already carry domains. Zero without.** The 69 records without them are
**LEGENDS** — `tier`, `role`, `personality`, `voiceHints`, `wants`, `fears`, and no abilities. ⛔ **Step 1 of
your §4 order is a no-op.**

⚠️ **AND THE TRAP IS NOT WHERE §3b PUTS IT.** *"`kitFor` on a person with no `domains` returns `band: "open"`
and draws from THE WHOLE CATALOGUE"* — ⛑ **it does the opposite.** The draw is guarded:

```js
if (domains && typeof domainAccess === "function") { … }   // ⛔ no domains → the block is SKIPPED
```

**Without domains it draws NOTHING extra.** `band: "open"` is one of three bands ACCEPTED inside that loop,
not what a domainless person gets.

### ⛔ THE ACTUAL FOUNDATION, AND IT IS THE FOURTH DOOR AGAIN

**The only live path is `personOpponentFor` → `battleSkillsFor` → `kitFor`, and it passed neither
`domainAccess` nor `traditionIndex`.** ⚑ **So the domain draw had never run in play, once, ever.** A person's
kit was whatever `craftsOf` found already written on them — and `personOpponentFor` returns `null` for anyone
with none (*"let the threat path have them"*), which is precisely why every fight against the 41 was fought
by a number.

> **domains AUTHORED ✓ · read by `kitFor` ✓ · loaded ✓ · READ ✗.**

✅ **FIXED (§146).** `domainAccess` from `traditions.js` — whose signature already matches the call `kitFor`
makes — is now passed, with the real `traditionIndex` threaded from the app through both entry points.

| | before | after |
|---|---|---|
| people who can fight from a kit | 53 of 56 | ⚑ **56 of 56** |
| people falling through to threat | 3 | ⚑ **0** |
| declarable rows across the corpus | 400 | ⚑ **640** |

⚠️ **AND IT STAYS NEAR THEIR GROUND, as `kitFor`'s own note demands:** `adept_sona` (numinous) draws
`stillness_field`; `archive_guardian` (figurist) draws `named_exclusion`; `brann_tollhand` (veilwright) draws
`darksight`. **Not a wander through 438 crafts.**

⛔ **BUT IT IS THIN, AND THE REASON IS YOUR §2.** An unmet person derives **level 1**, and `kitFor` caps a
craft at `tier ≤ ceil(level/5)` — so the draw is real and tier-1. ⚑ **The accessor was necessary and not
sufficient; LEVEL is the next lever, exactly as §2 says.** ⬜ **That is the next build and it needs your §2
table for "generated cold" and "known to the player".**

---

## §10 — ⚠️ `source: authored` DOES NOT EXIST, AND SIX PARTIAL MARKERS DO

> *"MEASURED: all 36 of Silas's crafts read `source: authored`."*

⛔ **Across 17 saves and 149 ability rows, `source` appears ZERO times.** What rows actually carry:

| field | rows | written by |
|---|---|---|
| `abilityId` · `level` | 100% | everything |
| `native` | 25% | `applyNativeGrants` |
| `baseline` | 16% | `martial.js` — the martial floor |
| `braided` | 5% | `braids.js` (mint + discovery) |
| `branches` · `discovered` | 3% | branch forks · discovery |

⚑ **Plus `authorGranted` (author mode) and `migratedFrom` (reconcile).** ⛔ **Six markers, each written at
exactly one site, and five more sites that write nothing at all** — `learnAbility`, `applyNewAbility`, the
bond grant, creation, forks.

➡️ ⚑ **You are right that a record belongs here.** The shape I would build is **one field saying HOW a craft
arrived**, written at every site, because the taxonomy already exists — it is just scattered and partial.

---

## §11 — ⛔ THE PC HALF OF §3b IS ALREADY BUILT, AND ADDING THE TERM WOULD DOUBLE-COUNT

> Erik: *"the minted and braids and earned should raise cap by 1 as well as grant the skill so a PC doesn't
> get penalized."*

⚑ **`breadthUsed` in `skilltree.js` already excludes every one of those:**

```js
return (character.abilities || []).filter(a => !custom.has(a.abilityId) && !a.native && !a.baseline).length;
```

**Not counting a craft against the cap is the same rule as raising the cap by one for it.** ⛔ **Doing both
would discount an earned craft twice.** Measured, Silas is **23 / 32** — not at capacity, and his 8 earned
crafts already cost him nothing.

⚠️ **So `capacity = round(level/2) + earned.length` is the right rule for the NPC path (`growthFor`), where
capacity BOUNDS the draw — and it must not be added to the PC path, which solves it the other way.**

---

## §12 — ✅ §4's STEP 4 IS ALREADY BUILT AND RUNNING

> *"let `growthFor` WRITE — it has been a reader since it shipped."*

⚑ **`commitGrowth` calls `growthFor` and writes:**

```js
entry.abilities = [...(entry.abilities || []), { abilityId: c.id, level: 1, gainedDay: day }];
```

✅ **At r1, never pruning, honouring `closed[]` — exactly R39's loop — and it is wired into the world tick
(`worldtick.js:521`), which announces each gain in the news.** ⛔ **The evolution loop you are asking for
exists and runs today.**

---

## §13 — ⬜ SO THE ORDER I WOULD BUILD, GIVEN THE ABOVE

| # | | who | |
|---|---|---|---|
| ~~1~~ | ~~domains for the 41~~ | — | ✅ **already true; the accessor was the gap, and it is wired** |
| **1** | ⛔ **LEVEL for the unmet** — §2's table for *generated cold* and *known to the player* | ⚠️ **Erik + Aevi** | ⚑ **the binding constraint: the draw is tier-1 until this exists** |
| **2** | the `earned` marker at all eleven write sites | CCode | ⚑ for the NPC cap and for legibility — **not** for the PC cap |
| **3** | **rank bands as a content table** (§7 q2) | Aevi | ✅ your read is right — beside `craftsPerLevels` |
| **4** | ⛑ **the nine thin sheets** | Aevi | unchanged |
| ~~5~~ | ~~let growthFor write~~ | — | ✅ **already built and running on the tick** |
| **5** | **threat DERIVED from the sheet** | CCode | ⚑ unchanged, and it is what ends the −0.95 |

---

## §14 — ⚠️ AND ONE THING NEITHER OF US HAD: THE LEGENDS

**69 legend records live in the same `CONTENT.npcs` map that `personOpponentFor` resolves from.** They carry
no abilities and no domains — ⛔ **and `sheetFor` gives one a LEVEL 40 sheet from its `tier: mythic`.**

⚠️ **So a legend can be made an opponent: level 40, no kit, straight through to threat synthesis.** ⬜ **Is a
legend meant to be fightable at all?** If yes they need the same treatment as a person; if no, the opponent
resolver should refuse them by name rather than by accident. ⛔ **Erik's call, and it is R49's `hingeNpcs`
question wearing a different hat.**
