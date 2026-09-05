# THE ROSTER — where every authored person lives, and who still needs a sheet

**GENERATED 2026-09-02.** ⚠️ **Regenerate rather than hand-edit the counts.**
> Erik: *"Document where to find all of our authored NPCs… we need to make their sheets."*

---

## §1 — FIVE PLACES, AND THEY ARE NOT INTERCHANGEABLE

| # | file | count | what it is |
|---|---|---|---|
| **1** | `content/packs/valley/npcs/*.json` | **45 files → 54 people** | ⚑ **the people you can MEET.** 43 single-person files + 2 pools: `legends.json` (5) and `saehara_challengers.json` (6) |
| **2** | `content/packs/valley/companions/*.json` | **9** | travel with you. Carry `boundaries`, `stages`, `bondGrants`, `substrateAura` |
| **3** | `content/packs/valley/tradition_epics.json` | **66** | heroic · epic · legendary. ⚠️ **Not met — WITNESSED** |
| **4** | `content/packs/valley/lore/legends.json` | **7 figures + the TIER LADDER** | ⛔ **THE MYTHICAL RUNG LIVES HERE**, in `_theMythicalRung`. **Corvane the Deep Warden is here, not in the epics** |
| **5** | `content/packs/valley/npc_interiority.json` | 7 | ⚠️ **NOT people** — a drive layer over people who exist elsewhere |

**63 meetable + 66 epics + 7 legends = 136 authored figures.**

### ⛔ THE TRAP THAT HAS CAUGHT BOTH OF US
⚠️ **`tradition_epics.json` IS NOT THE ROSTER.** Reading it alone and stopping produced two wrong reports
on 2026-09-02: *"there is no mythic tier"* (there is — `legends.json` `_theMythicalRung`) and *"all
legendaries are villains"* (true of the epics file, false of the roster).
➡️ ⛔ **A question about figures needs BOTH files, and a grep for the term needs all five.**

---

## §2 — ⛔ TWO SHEETS EXIST. FIFTY DO NOT.

**A sheet = an `abilities` array: crafts by id, with ranks.** `engine/npcsheet.js` derives one for anybody
without it and states its own rule: ⚠️ ***"AN AUTHORED SHEET ALWAYS WINS."***

| | |
|---|---|
| ✅ **authored** | **Pell Ran Marsh** (L27, 17 crafts) · **Veth Ondra** (L33, 15 crafts) |
| ⛔ **derived only** | **50** of the 52 single-person files |
| ⬜ **epics + legends** | **73** — ⚠️ **no sheet mechanism reaches them at all** |

### ⬜ THE ORDER TO AUTHOR IN

| priority | who | why |
|---|---|---|
| **1** | **9 companions** | ⚑ they FIGHT BESIDE YOU. Folded party contribution reads their families; a derived sheet gives a scholar a swordmaster's HARM |
| **2** | **the interiority 7** | Pell and Veth were 2 of these. Already carry `driveSummary`, `wants`, `pushesBackWhen` — ⚠️ **half-authored already** |
| **3** | **hinge NPCs** | ⛔ **the arcs move through them.** `the_deep_warden` ×4 arcs, `aevi_the_watcher` ×2, `archive_guardian` ×2, `maker_orrin` ×2, `warden_isolde` ×2, `the_old_stag` ×2 |
| **4** | **teachers** | anyone with `teaches`/`curriculum` — a sheet says what they can actually hand on |
| **5** | **the rest of the 43** | |
| ⬜ **later** | epics + legends | ⚠️ **needs a decision first: does a witnessed figure need a sheet, or a threat number?** |

---

## §3 — ⛔ THE TEMPLATE, AND IT HAS BITTEN TWICE

**`po/NPC_AUTHORING_TEMPLATE.md`. Pell and Veth hit the IDENTICAL four defects — that is a template fault,
not a slip.**

| # | check |
|---|---|
| 1 | ⛔ **path added to `manifest.json` → `provides.npcs`.** ⚠️ An unregistered file NEVER LOADS and is never schema-checked — **defect 1 hid defects 2–4** |
| 2 | `schemaVersion` present |
| 3 | `knowledge` is an **array** (40 of 43 are) |
| 4 | `reactsToReputation` is **tag → response**, prose kept in `_reactsWhy` |
| 5 | crafts under **`abilities`** as `{abilityId, level, why}` — ⚠️ **NOT `skillsObserved`, which zero NPCs have ever carried** |
| 6 | every `abilityId` **resolves in the catalogue** — check before writing |
| 7 | ⛔ **`assistTags`** — without them `contributionsOf` defaults to HARM and **a master smith counts as a striker** |
| 8 | `sex`/`gender` per R24; `romanceEligible` an explicit decision |
| 9 | ⛔ **RUN `battleSkillsFor()` AND CONFIRM IT RETURNS MORE THAN 1** |

⚠️ **STEP 9 IS THE ONE THAT CATCHES ALL THE OTHERS.** Pell returned **1** skill before the fixes and **32**
after. ⛔ **A sheet can be complete, well-formed, schema-valid and entirely unread.**

---

## §4 — ⚠️ WHAT A SHEET NEEDS THAT THE DERIVER CANNOT GUESS

`npcsheet.js` derives `level`, `tier`, `leans`, `kit` and `battleSkills` from `role`, `met`, `standing` and
days-known. ⛔ **It cannot invent:**

- **which crafts** — ⚠️ *"a person the story keeps showing doing one thing has one thing"* is `growthFor`'s
  own `thin` flag. **Pell's `skillsObserved` said 'ironsense' and that was THREE crafts** — `stone_read`,
  `stonewise`, `thingcraft`
- **ranks** — what they can teach vs merely do
- **`assistTags`** — the families they actually contribute
- ⛔ **the absences** — ⚠️ **Veth has no `bone_lance`, no `set_hand`, no `reaping_sickle`, and those
  absences are the character.** A deriver would have given her all three

⚠️ **AND THE STANDING WARNING:** Aevi built Veth's first sheet around *"she has never struck anything"* when
**nobody had authored her.** ⛔ **A DATA GAP IS NOT A PERSONALITY.** Check whether anyone wrote the presence
before reading the absence as intent.

---

## ⛔ CORRECTION 2026-09-05 — COMPANIONS DO NOT WANT NPC SHEETS

⚠️ **This file's §2 put *"9 companions"* first in the sheet-authoring order. ⛔ MEASURED, THAT IS THE WRONG
SHAPE FOR THEM.**

| | |
|---|---|
| ✅ **companions already fight** | `alliesOf` derives their level from the character's — *"a companion of a level-9 character is not a level-1 bystander"* — and reads their `assistTags` for contributions |
| ⛔ **their progression is `stages[]`, NOT craft ranks** | `companion_template.json`: *"stages are the spine… bond 0–2 → stage 1, 3–9 → 2, 10 → 3."* ⚠️ **A companion does not spend points** |
| ⛔ **AND THE TEMPLATE RECORDS AEVI MAKING THIS EXACT MISTAKE BEFORE** | *"I wrote Attended End with its own r1/r2/r3 ladder because I did not know `stages[]` was the progression — which is stated nowhere except in nine examples"* |

### ⚑ WHAT THEY ACTUALLY OWE: THE BOND GRANTS

`companion_template.json` `_theEight`: ⛔ ***"all nine are currently STUBS carrying 9 fields and missing 14 —
no `tree`, no `mechanic`, no `bounds`, no `plainly`, no `challengeTypes`."***

| | |
|---|---|
| ✅ **done** | `the_attended_end` (Marrow) — the exemplar |
| ✅ **done 2026-09-05** | ⚑ **`pack_sense` (Bristle) · `scholars_margin` (Quill) · `the_kept_dark` (Hush)** |
| ⬜ **owed — 5** | Motes' Vigil (Aevi) · The Old Procedure (Coil) · Thin-Place Sense (Ember) · The Taking Root (Sprig) · A Second Pair of Hands (Tal) |

⚑ **EACH RANK KEYS TO A `stage`** — the stage names what the COMPANION becomes, the rank names what it LENDS
YOU — **and its bounds come from that companion's own `boundaries`.** ⛔ **Nothing invented.**

### ⬜ SO THE ORDER IS NOW

| # | who | what |
|---|---|---|
| **1** | **companions** | ⚑ **bond grants (5 left)**, not sheets |
| **2** | the interiority 7 | ⚑ full sheets — half-authored already |
| **3** | hinge NPCs | the arcs move through them |
| **4** | teachers | |
| **5** | the rest of the 43 | |

---

## ✅ AND THE SCHEMA NOW DECLARES THE SHEET (2026-09-05)

⛔ **`schemas/npc.schema.json` declared 25 properties and knew about NONE of the last two weeks** — not
`abilities`, not `assistTags`, not `sex`, not `physicality`, and not R45c's `inventory`/`practice`.
⚠️ **`additionalProperties` unset → JSON Schema defaults PERMISSIVE, so nothing ever failed and the validator
had never checked a single field that matters for combat.**

✅ **+22 properties, each documented where an author will look.**

⚠️ **AND AEVI'S FIRST PASS DECLARED TYPES FROM THE FIELD NAMES AND RED-LINED ALL 43:** `people` is the
**SPECIES** (*"human"*), not relationships; `domains` is **`{primary, secondary, tertiary}`** — R25's
standing structure that `kitFor` draws from — not a list; `teaches` is prose in 22 files.
⛔ **It also caught two sheets Aevi authored wrong: Pell and Veth were the ONLY two files in the corpus with
`domains` as an array. Corrected.**
