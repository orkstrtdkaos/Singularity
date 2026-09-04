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
