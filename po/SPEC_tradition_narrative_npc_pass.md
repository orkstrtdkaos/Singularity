# SPEC — Tradition Narrative Pass, Second Look, and NPC Thickening

**Author:** Aevi (PO) · **Date:** 2026-08-31
**Status:** `spec_ready` — CCode ROUND 2 requested before authoring begins
**Parallel work:** CCode is building the v2 tradition merger (`SPEC_SNG-536`). This pass is
content-authoring, not migration — it does not touch `tradition`/`traditionV2` fields, does not
move abilities between files, and does not require the merger to land first. Safe to run in
parallel.

---

## §0 — WHAT THIS IS AND WHAT IT IS NOT

Erik asked for three things in the same breath:

1. **A narrative skills pass** — the whole corpus optimised for mechanics; now evaluate for
   narrative quality. *"Not everything is about mechanics."*
2. **A second look at the traditions** — we updated what we looked for as we moved along, and
   the earlier-audited traditions have not yet received the thickening and broadening we learned
   to apply. Erik directed that this applies to **all 14 traditions**, not only the three
   earliest-closed.
3. **Bring the authored and minted NPCs into this** — the 111 authored NPCs and 7 with
   interiority should connect to the tradition and people work.

⚠️ **These are one pass, not three.** The traditions ARE the people. The NPC layer is where a
tradition becomes a face. Narrative quality in a craft is only testable against the people who
cast it.

**Scope:** all 14 traditions (24 sects), across all 12 axis files.

**For the two ✅-closed traditions (Mind, Body)** and in-progress Death: the pass applies the
items that postdate their original close. For the 11 untouched traditions: the narrative and
thickening lens runs as part of their first full pass — not a separate second look, but the same
work done once with the full current checklist.

---

## §1 — PWSV (measured at HEAD v1.9.285)

| claim | probe | result |
|---|---|---|
| Traditions fully audited (✅ in tracker) | `TRACKER_traditions.md` | **Mind, Body** only |
| Traditions in-progress | tracker | **Death** |
| Traditions untouched | tracker | **Dark, Breaking, Span, Light, Building, Order, Demonic, Life, Chaos, Angelic, Spirit** — 11 of 14 |
| All axis files present | `content/packs/core/abilities/reach_*.json` | ✅ all 12 exist |
| NPCs authored | `content/packs/valley/npcs/` | 41 solo files + `legends.json` |
| NPCs with interiority | `npc_interiority.json` | ⛔ **7 of ~111** |
| Narrative skills (`foresee` fallback gloss) | backlog measurement | ⛔ **15 of 35 `foresee` crafts** print boilerplate |
| `sent_meaning` flagged by Erik | backlog | ✅ recorded as first narrative candidate |

**What this pass touches:** craft `plainly` / `narrationHints` / `description` · tradition
`civilization` / `aesthetic` prose · NPC files and `npc_interiority.json` · schools (where
missing) · obscure crafts (where missing) · `backlash` / `conserveSuppresses` · `folkAccessible`.

**What this pass does NOT touch:** `tradition`/`traditionV2` field values (merger's lane) ·
mechanical fields (`energyCost`, `levelReq`, `functions`, `mechanic`) · engine code · the
`powerSystem` defect cleanup (that runs inside each tradition's full audit separately).

---

## §2 — THE FOUR WORK STREAMS

### §2a — Narrative skills pass (all 14 traditions)

The audit optimised for mechanical correctness. A craft can be mechanically perfect and
narratively inert. The `foresee` finding is the proof: a whole verb went that way without anyone
noticing.

**T7 applied as a narrative lens across the full corpus.** The second-turn test already asks
"what does the GM narrate CHANGING?" — the narrative pass does not accept a dice roll as the
answer.

**Three signals to sort by, in order:**

1. ⛔ **`foresee` with boilerplate plainly** — 15 of 35 crafts resolve to *"reveals information
   or sets up a later action."* Each needs a rewrite: what the GM must now say out loud, what
   the player can act on. Not which file it is in — every axis file is in scope.
2. ⚠️ **`sent_meaning` — Erik's named candidate.** Apply T7; rewrite if it fails.
3. ⚠️ **Any craft whose `plainly` describes what the wielder FEELS rather than what the GM must
   SAY.** Perception and reveal crafts are the highest-risk zone — the same failure pattern
   found in `the_true_figure`, `the_standing_figure`, `the_plain_seeing` during the Body pass.

**Scope:** targeted rewrites only. Gate: after each rewrite, T7 must produce a concrete answer
in one sentence.

### §2b — Second look: what postdates the original audits (Mind, Body, Death)

Five items were established after Mind and Body closed, and after Death's partial audit began:

| item | established |
|---|---|
| T5 — rank = mastery, costs at earned ranks are a tax | 2026-08-07 |
| T6 — cannot is the backlash (`backlash` / `conserveSuppresses`) | 2026-08-07 |
| T7 — second-turn test | 2026-08-07 |
| Emotional/thematic palette pass | 2026-08-23 |
| Every tradition reaches all verbs in its own idiom (Erik's correction) | 2026-08-29 |
| `folkAccessible` — 12 of 24 poles have none | 2026-08-30 |

**Mind** (25 skills, 3 schools):
- T5/T6/T7 across all 25. `backlash` and `conserveSuppresses` will be absent — add them.
- Thematic palette: cogitant/syllogist/figurist. Which modes dominate? What is missing?
- `folkAccessible`: 2 crafts present. Is the selection deliberate (2–3 per pole is the rule)?
- 4 social verbs confirmed present — verify each reaches all four in the tradition's idiom.

**Body** (22 skills, 2 schools):
- T5/T6/T7 across all 22. `backlash` and `conserveSuppresses` absent — add them.
- ⛔ Erik named Body gaps: stunning strike (`hinder`), joint lock (`bind`), iron-body ward, shout
  that carries command. Check whether these exist; author any that do not.
- `folkAccessible`: 2 crafts. Same question.
- Thematic palette: does the tradition carry the full range of what a body can do, or is it
  weighted toward one register?

**Death (ashwarden + threnodist)** (30 skills, 3 schools, in-progress):
- T5/T6/T7 across what has been re-authored.
- ⛔ Deathsense `cannot` currently forbids reading undead; it should read inverted life. Correct.
- ⛔ `bargain` still missing. One bargaining craft for ashwarden or threnodist.
- ⛔ Threnody emotional palette — 12/15 grief, joy 2 (never the subject), love/hope/longing/awe
  = 0. Do not author new crafts until Erik rules on how those emotions enter. Flag the existing
  grief-only crafts that could carry a second register.
- `folkAccessible`: 1 craft on threnodist — review.

### §2c — Tradition promises audit and thickening (all 14 traditions)

**The lens:** read `civilization`, `aesthetic`, `cultOfPurity`, and `people` in `traditions.json`
as promises the craft list must fulfill. Every named capability, every described act, every
characterisation of what a people does — check whether a craft exists that fulfills it. If not,
it is a gap. Author or flag per T7.

**This applies to all 14.** The Blazeborn lesson (the text said "beam-craft that makes them
feared" and no such craft existed) was found in the middle of the audit. It has not been run
against the untouched 11 at all, and it was not run systematically against Mind, Body, or Death.

**Per tradition, before any authoring:** write the promise list from the prose. Then diff it
against the craft list. Author against the gaps.

**Specific threads from the backlog that feed this stream:**

- ⛔ **Ashwarden schism** — Marrow's choice vs. those who chose otherwise. Faction is real before
  the bird is confirmed. People-material, not craft-material. Reflected in `npc_interiority.json`
  and in the `civilization` prose, not in new crafts.
- ⛔ **Threnody scope** — the `civilization` prose should reflect the intended full-emotion scope,
  not the grief monoculture the current craft list demonstrates.
- ⛔ **Greyhearth** — ratified foothill, `abilities: 0`. The Grave-Callers exist as foes. The
  people need their prose even if the crafts are not yet built.
- ⚠️ **Spirit as a field, not a box** — the `civilization` prose for the numinous should reflect
  that Spirit permeates (142 of 412 crafts are metaphysical, 134 of them outside the numinous).
  The prose should name what the numinous ARE without implying they are the only ones running on
  this source.
- ⛔ **`folkAccessible` across all 24 poles** — 12 of 24 have none. The full-corpus pass is here.
  2–3 per pole, L1 crafts first, avoid first offenses. Do not assign by guess — write the
  selection reasoning per pole before committing.

### §2d — NPC thickening (tradition-adjacent priority)

**The gap:** 111 authored NPCs, 7 with interiority. The GM prompt uses interiority for the 7 —
this is live content, not future-proofing.

**Selection criteria — not all 111, tradition-adjacent first:**

1. ⛔ **NPCs who are a tradition's only named face.** If a tradition's `civilization` describes a
   people and their only authored NPC has no interiority, the tradition is thin at its human layer.
2. ⚠️ **NPCs referenced inside craft `description` or `narrationHints`.** A named person inside a
   craft is a dead link without interiority.
3. ⛔ **NPCs in the open world-material threads** — the Ashwarden schism, Threnody's emotional
   range, the Grave-Callers. These are the faces of the backlog material that is about to be
   written.

**Format:** `npc_interiority.json` entries matching the Pell/Veth-Ondra schema:
`driveSummary` · `wants[]` · `fears[]` · and optionally `traditionRelation` (how this person
stands relative to their tradition's defining question).

**Minted NPCs:** correctly outside this scope. They get character from `npcPromptSeed` and
`appearance`. Authored interiority is for the 41 solo-filed NPCs and the legends pool.

---

## §3 — ORDER AND DEPENDENCIES

| order | work | dependency |
|---|---|---|
| 1 | Narrative skills pass — `foresee` and T7 failures (§2a) | none |
| 2 | Tradition promises audit, all 14 — read and list only, no authoring yet (§2c) | none |
| 3 | Second look: Mind + Body + Death (§2b) | §2c promise list for those three |
| 4 | Full current checklist on untouched 11 traditions (§2c authoring) | §2c promise list per tradition |
| 5 | NPC selection and interiority (§2d) | §2b + §2c — NPC selection driven by tradition work |
| 6 | Thickening prose: ashwarden schism, Threnody scope, Greyhearth people, Spirit framing | §2b + Erik ruling on Threnody emotional range |
| 7 | `folkAccessible` full-corpus assignment (§2c) | All tradition passes complete |

**Held item:** Threnody new crafts (joy, rage, love) — do not author until Erik rules.
**Held item:** Spirit new crafts — do not author to fix the imbalance; the imbalance is a
category error, not a content gap (`SPIRIT ALREADY PERMEATES` finding, backlog 2026-08-30).

---

## §4 — WHAT EACH FILE I TOUCH LOOKS LIKE

| file | what changes |
|---|---|
| All 12 `content/packs/core/abilities/reach_*.json` | `plainly` rewrites (§2a), `backlash`/`conserveSuppresses` additions (§2b), new crafts where promise audit finds gaps |
| `content/packs/valley/npc_interiority.json` | new entries for tradition-adjacent NPCs |
| `content/packs/core/rules/traditions.json` | `civilization`/`aesthetic` prose corrections (§2c); `folkAccessible` selection (§2c) |
| Possibly new NPC files | if a tradition-facing named person does not have a solo file |

**Nothing touched:** `tradition` / `traditionV2` field values · `energyCost` · `levelReq` ·
`functions` · `mechanic` · engine code.

---

## §5 — AUTHORING GATE

Every new or rewritten craft runs the full gate:

```
python3 po/authoring_gate.py <authored.json>            # before the write
python3 po/authoring_gate.py <pulled-from-origin.json>  # after
```

T7 written in prose per ability before committing. `node scripts/certify_counts.mjs --check`
after any craft file is touched. No ratchet regressions.

---

## §6 — ROUND 2 REQUEST — CCode substrate-verify before Aevi begins

1. **§2a:** Does the boilerplate `foresee` gloss originate from the engine (a fallback the engine
   inserts when `plainly` is absent or generic) rather than from the authored field? If yes, which
   crafts should be fixed in the craft vs. in the fallback?
2. **§2b:** Do `backlash` and `conserveSuppresses` have consumers in the engine today? If not,
   authoring them is decoration — flag it so the spec can hold those fields until CCode wires
   them, or note they belong in `bounds` (prose-only) until they do.
3. **§2d:** Does the GM prompt use `npc_interiority.json` entries today for the 7 NPCs who have
   them? Confirm the read path so new entries land where the engine reads.
4. **§2c:** Is there any engine reader of the `civilization` or `aesthetic` fields in
   `traditions.json`? If yes, naming the field and line matters. If no, it is GM-prompt territory.
5. **`folkAccessible`:** what does the engine do with the flag today — does it appear in the
   skill wheel, the learn screen, the GM prompt, or nowhere yet?
6. **Anything in this spec that is already true at HEAD** — the domain gate lesson applies.
