# SPEC — Tradition Narrative Pass, Second Look, and NPC Thickening

**Author:** Aevi (PO) · **Date:** 2026-08-31
**Status:** `promoted` — CCode ROUND 2 incorporated, ready to author
**Parallel work:** CCode's v2 tradition merger (`SPEC_SNG-536`) is complete (A–F + antipode
rework landed). No in-flight engine work to collide with. ✅ Safe to proceed.

---

## §0 — WHAT THIS IS AND WHAT IT IS NOT

Erik asked for three things in the same breath:

1. **A narrative skills pass** — the corpus optimised for mechanics; now evaluate for narrative
   quality. *"Not everything is about mechanics."*
2. **A second look at the traditions** — applies to **all 14 traditions**, not only the
   earliest-closed. Earlier traditions get the items that postdate their close; untouched
   traditions get the full current checklist once, not twice.
3. **Bring the authored and minted NPCs into this** — 111 authored NPCs, 7 with interiority,
   should connect to the tradition and people work.

⚠️ **These are one pass, not three.** The traditions are the people. The NPC layer is where a
tradition becomes a face. Narrative quality in a craft is only testable against the people who
cast it.

**What this pass does NOT touch:** `tradition`/`traditionV2` field values · mechanical fields
(`energyCost`, `levelReq`, `functions`, `mechanic`) · engine code · `powerSystem` defect cleanup
(that runs inside each tradition's full audit separately).

---

## §1 — PWSV (corrected from ROUND 2)

| claim | measured at HEAD v1.9.286 |
|---|---|
| Traditions ✅ closed | Mind, Body only |
| Traditions in-progress | Death |
| Traditions untouched | Dark, Breaking, Span, Light, Building, Order, Demonic, Life, Chaos, Angelic, Spirit — 11 of 14 |
| All axis files present | ✅ all 12 `reach_*.json` exist |
| NPCs authored | 41 solo files + `legends.json` |
| NPCs with interiority | 7 of ~111 |
| Mind craft count | **30** (spec draft said 25 — stale) |
| Body craft count | **28** (spec draft said 22 — stale) |
| Death craft count | **39** (spec draft said 30 — stale) |
| `bargain` in Death | ✅ **exists** — `true_account` (ashwarden L1, `bargain`+`reveal`+`empower`+`persuade`) — retire the gap claim |
| `folkAccessible` gap | **14 of 24 poles have none** (spec draft said 12 — stale) |
| `folkAccessible` readers | ⛔ **ZERO** — authored on 18 crafts, read by nothing |
| `backlash` readers | ✅ 3 engine, 10 app — real field, author it |
| `conserveSuppresses` readers | ✅ 1 — `app.js:7351` resolution note — real field, author it |
| `backlashRung` readers | ⛔ **ZERO** — 20 crafts author it, nothing reads it |
| `civilization` reader | `app.js:11582` — player-facing lore screen (not GM-prompt) |
| `aesthetic` readers | 3 engine modules + 15 app sites — load-bearing, drives images |
| `cultOfPurity` readers | ⛔ **ZERO** |
| `npc_interiority.json` read path | `state.js:603` → `worldtick.js:435` + `app.js:7727` — live |
| `foresee` boilerplate | authored content, not engine-generated — 15 of **34** (not 35) |
| Gloss fossil scope | ⛔ **251 of 414 crafts** carry one of 8 stock glosses; **48 carry a wrong one** |

---

## §2 — THE FOUR WORK STREAMS

### §2a — Narrative skills pass (all 14 traditions, full corpus)

**The problem is larger than the spec draft scoped.** CCode measured it:

| | crafts |
|---|---|
| Carrying one of 8 stock glosses (thin — says *that*, never *which*) | **251 of 414** |
| ⛔ Carrying a gloss naming a verb family the craft does not have (wrong) | **~48** |
| Carrying the *"A investigate action…"* grammar bug (fossil generation tell) | **59** |

⚠️ **The 15 `foresee` crafts are a subset.** `foresee` was where the audit happened to look, not
where the problem lives. Every verb family has entries in the 251.

**Two tiers of work, in order:**

**Tier 1 — Wrong glosses (~48 crafts).** A concealment craft described as *"makes or animates
something"* is actively misleading. These are correctness bugs, not narrative polish. Fix these
first regardless of the narrative pass scope. CCode can land `scripts/gloss_audit.mjs` as a
standing ratchet — request it.

**Tier 2 — Thin glosses (remainder of the 251).** The narrative pass proper. Each craft needs a
`plainly` that names a concrete GM output, not a category. T7 applied: what does the GM narrate
CHANGING? A dice roll is not an answer.

**Signals to sort by within Tier 2:**

1. `foresee` crafts — 34 in scope, 15 carrying the stock gloss. The verb most exposed because it
   has no mechanical result to hide behind.
2. `sent_meaning` — Erik's named candidate.
3. Any `reveal`, `perceive`, or `foresee` craft whose `plainly` describes what the wielder
   FEELS rather than what the GM must SAY. Same failure pattern as `the_true_figure` /
   `the_standing_figure` / `the_plain_seeing`.

**Gate:** after each rewrite, T7 must produce a concrete answer in one sentence.

**Note on `plainly` readers:** `plainly` is read by 7 engine modules and 11 app sites. These are
not decorative rewrites.

### §2b — Second look: items postdating original audits (Mind, Body, Death)

**Corrected craft counts (ROUND 2):** Mind 30 · Body 28 · Death 39.

**Items postdating the original closes:**

| item | established |
|---|---|
| T5 — rank = mastery, costs at earned ranks are a tax | 2026-08-07 |
| T6 — `backlash` / `conserveSuppresses` (both real and wired) | 2026-08-07 |
| T7 — second-turn test | 2026-08-07 |
| Emotional/thematic palette pass | 2026-08-23 |
| Every tradition reaches all verbs in its own idiom | 2026-08-29 |

**`folkAccessible` is HELD** pending a decision on whether the flag gets a reader or is retired.
Do not audit or extend it in this pass. See §2e.

**`backlashRung` is HELD.** It has zero readers — same shape as `folkAccessible`. Do not author
more `backlashRung` entries. Existing entries are noted as unread in `bounds` or left alone.

**Mind** (30 crafts, 3 schools):
- T5/T6/T7 across all 30. `backlash` and `conserveSuppresses` absent — add them.
- Thematic palette: cogitant/syllogist/figurist. Which modes dominate? What is absent?
- ⛔ `folkAccessible`: **zero** on all three Mind poles. If the selection is deliberate, say so.
  If not, this is a content gap — but do not assign until §2e resolves the reader question.
- 4 social verbs present — verify each reaches all four in the tradition's own idiom.

**Body** (28 crafts, 2 schools):
- T5/T6/T7 across all 28. `backlash` and `conserveSuppresses` absent — add them.
- ⛔ Erik named Body gaps: stunning strike (`hinder`), joint lock (`bind`), iron-body ward, shout
  that carries command. Check whether these exist at current count; author any missing.
- `folkAccessible`: held (§2e).
- Thematic palette: does the tradition carry the full range of what a body can do?

**Death — ashwarden + threnodist** (39 crafts, 3 schools, in-progress):
- T5/T6/T7 across what has been re-authored.
- ⛔ `bargain` — RETIRE. `true_account` already covers it.
- ⛔ Deathsense `cannot` — current text: *"Reads the living and the dying, not the already-dead.
  A corpse has nothing left to sense."* The correction: a corpse has nothing, but an undead has
  inverted life that should be loud to a craft built to read life. The sentence forbids a corpse,
  not an undead — rewrite to address what the correction actually targets.
- ⛔ Threnody emotional palette — 12/15 grief, love/hope/longing/awe = 0. Do not author new
  crafts until Erik rules. Flag existing grief-only crafts that could carry a second register.
- `folkAccessible`: held (§2e).

### §2c — Tradition promises audit and thickening (all 14 traditions)

**The lens:** `civilization` and `aesthetic` are the **player-facing lore screen** (both fields
read at `app.js:11582`). Every characterisation of what a people does is visible to the player.
A promise the craft list does not keep is one a player can see unkept.

**`cultOfPurity` is unread** — world material with no surface. Do not thicken it. Do not update
it as if it will be read.

**Per tradition, before any authoring:**
1. Read `civilization` and `aesthetic` as a promise list.
2. Diff against the craft list.
3. Author against confirmed gaps, per T7 and the full authoring gate.

**Specific threads from the backlog:**

- ⛔ **Ashwarden schism** — people-material, not craft-material. Reflected in `npc_interiority.json`
  and `civilization` prose. Do not add crafts.
- ⛔ **Threnody scope** — `civilization` prose should name the intended full-emotion scope, not
  reflect the grief monoculture the craft list demonstrates. Do not author new crafts — update
  the prose framing.
- ⛔ **Greyhearth** — ratified foothill, `abilities: 0`. People need their prose. Note: a foothill
  is a place — do not give it a ring position or domain (that gate fires in `how_it_works` §31C).
- ⚠️ **Spirit as a field** — `civilization` prose for the numinous should name what the numinous
  ARE without implying they are the only ones running on metaphysical. 134 of 142 metaphysical
  crafts are outside Spirit. The prose should carry this without claiming exclusivity.

### §2d — NPC thickening (tradition-adjacent priority)

**Complete interiority schema (all six fields — ROUND 2 correction):**

| field | engine readers | note |
|---|---|---|
| `driveSummary` | 1 | ✅ include |
| `wants` | 33 engine + 16 app | ✅ include — most-read field |
| `fears` | 4 engine + 4 app | ✅ include |
| `pushesBackWhen` | 2 | ✅ include — omitted from draft, include it |
| `emotionalRange` | 2 | ✅ include — omitted from draft, include it |
| `acknowledgeTone` | 1 | ✅ include — omitted from draft, include it |
| `traditionRelation` (proposed) | **0** | ⚠️ prose-only — no reader. Include if useful as world material; label it as unread so it is not mistaken for a wired field |

All seven existing interiority entries carry all six schema fields. New entries must match.

**Selection criteria:**

1. ⛔ NPCs who are a tradition's only named face — if the lore screen describes a people and
   their only authored NPC has no interiority, the tradition is thin at its human layer.
2. ⚠️ NPCs referenced inside craft `description` or `narrationHints` — a named person in a craft
   is a dead link without interiority.
3. ⛔ NPCs in the open world threads — ashwarden schism, Threnody's emotional range, the
   Grave-Callers.

**Minted NPCs:** outside this scope. Their character comes from `npcPromptSeed` and `appearance`.

### §2e — Two unread fields: `folkAccessible` and `backlashRung` (held — ruling needed)

These are not authoring tasks. They are decisions.

**`folkAccessible`** (18 crafts, 0 readers):

The intended job — Valleyfolk starting kit — is already done by `native_grants.json` as
`folkNativeGrant` (13 anchors). The flag is a second, unread expression of the same fact.

Two paths:
- **Wire it** — the Valleyfolk origin derives its starting kit from crafts carrying this flag,
  retiring the hand-kept grant list as a derived artifact. Engine work, half a day.
- **Retire it** — the 13 anchors stay as the single source; the flag is removed from existing
  crafts and the schema.

⛔ **Do not author more `folkAccessible` entries until this is decided.** Reviewing existing
selections (§2b) is also premature until there is a reader to review against.

**`backlashRung`** (20 crafts, 0 readers):

Either it wants a consumer (controlling how hard a backlash lands) or it moves into `bounds` as
prose. It should not accrue more entries while nothing reads it.

⬜ **Both are Erik's calls.** Surface them; do not resolve them in this pass.

---

## §3 — ORDER AND DEPENDENCIES

| order | work | dependency |
|---|---|---|
| 1 | Surface §2e decisions to Erik — `folkAccessible` and `backlashRung` | none — do this first |
| 2 | Request `gloss_audit.mjs` ratchet from CCode | none |
| 3 | Tier 1 narrative pass — ~48 wrong glosses (§2a) | gloss_audit.mjs standing |
| 4 | Tradition promises audit, all 14 — read and list only (§2c) | none |
| 5 | Second look: Mind + Body + Death (§2b, excluding folkAccessible) | §2c promise list for those three |
| 6 | Full current checklist on untouched 11 traditions (§2c authoring) | §2c promise list per tradition |
| 7 | Tier 2 narrative pass — thin glosses (§2a) | runs in parallel with 5 and 6 |
| 8 | NPC interiority (§2d) | §2b + §2c — NPC selection driven by tradition work |
| 9 | Thickening prose: schism, Threnody scope, Greyhearth, Spirit framing | §2b + Erik ruling on Threnody |
| 10 | `folkAccessible` and `backlashRung` — only after §2e ruling | §2e |

**Held:** Threnody new crafts — pending Erik ruling on emotional range.
**Held:** Spirit new crafts — the imbalance is a category error, not a content gap.

---

## §4 — AUTHORING GATE

Every new or rewritten craft:

```
python3 po/authoring_gate.py <authored.json>
python3 po/authoring_gate.py <pulled-from-origin.json>
```

T7 written in prose per ability before committing.
`node scripts/certify_counts.mjs --check` after any craft file is touched.
No ratchet regressions (`abilitiesMissingHarmRung`, `abilitiesCombatClaimedNotTaught`).
