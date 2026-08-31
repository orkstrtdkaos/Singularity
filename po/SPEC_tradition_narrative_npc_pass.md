# SPEC — Tradition Narrative Pass, Second Look, and NPC Thickening

**Author:** Aevi (PO) · **Date:** 2026-08-31
**Status:** `spec_ready` — CCode ROUND 2 requested before authoring begins
**Parallel work:** CCode is building the v2 tradition merger (`SPEC_SNG-536`). This pass is
content-authoring, not migration — it does not touch `tradition`/`traditionV2` fields, does not
move abilities between files, and does not require the merger to land first. It is safe to run
in parallel.

---

## §0 — WHAT THIS IS AND WHAT IT IS NOT

Erik asked for three things in the same breath:

1. **A narrative skills pass** — the whole corpus optimised for mechanics; now evaluate for
   narrative quality. *"Not everything is about mechanics."*
2. **A second look at the traditions** — we updated what we looked for as we moved along, and
   the earlier-audited traditions have not yet received the thickening and broadening we learned
   to apply.
3. **Bring the authored and minted NPCs into this** — the 111 authored NPCs and 7 with interiority
   should connect to the tradition and people work.

⚠️ **These are one pass, not three.** The traditions ARE the people. The NPC layer is where a
tradition becomes a face. Narrative quality in a craft is only testable against the people who
cast it. Separating them produces three shallow passes; running them together produces one that
lands.

---

## §1 — PWSV (measured at HEAD v1.9.285)

| claim | probe | result |
|---|---|---|
| Traditions fully audited | tracker status | ✅ **Mind, Body** closed · **Death** part-audited · 11 untouched |
| Traditions with people/civilization authored | `traditions.json` `civilization` field | ✅ all 24 sects have it |
| Traditions with thickening (schools, obscure, social verbs) | tracker | Mind: 3 schools, 4 verbs · Body: 2 schools, 2 verbs · others: sparse |
| NPCs authored | `content/packs/valley/npcs/` | **41 solo files** + `legends.json` |
| NPCs with interiority | `npc_interiority.json` | ⛔ **7 of ~111** |
| NPCs with domains derived from spectrum | sample check (`fendt`, `pell`) | ✅ present on authored NPCs |
| Minted NPCs | engine/npcs.js | minting is runtime; no authored minted-NPC records |
| Narrative skills (`foresee` fallback gloss) | backlog measurement | ⛔ **15 of 35 `foresee` crafts** print boilerplate |
| `sent_meaning` flagged by Erik | backlog | ✅ recorded as first narrative candidate |

**What this pass touches:** tradition `civilization` / `aesthetic` prose · craft `plainly` /
`narrationHints` / `description` · NPC files and `npc_interiority.json` · schools (where missing)
· obscure crafts (where missing).

**What this pass does NOT touch:** `tradition`/`traditionV2` field values (merger's lane) ·
ability mechanical fields (`energyCost`, `levelReq`, `functions`, `mechanic`) · engine code ·
the `powerSystem` defect cleanup (that runs inside each tradition audit).

---

## §2 — THE FOUR WORK STREAMS

### §2a — Narrative skills pass

**The standard from the backlog:**
> A craft can be mechanically perfect and narratively inert. A whole verb went that way without
> anyone noticing — `foresee` is the proof. The `foresee` finding above is the first evidence that
> a whole verb went that way without anyone noticing.

**T7 applied as a narrative lens, not a mechanical one.** The second-turn test already asks
"what does the GM narrate CHANGING?" — the narrative pass asks the same question but does not
accept a dice roll as the answer.

**Three signals to sort by, in order:**

1. ⛔ **`foresee` with boilerplate plainly.** 15 of 35 crafts resolve to *"reveals information or
   sets up a later action."* That sentence says nothing about which information, or how it changes
   the scene. Each one needs a concrete rewrite: what the GM must now say out loud, what the
   player can act on.
2. ⚠️ **`sent_meaning` — Erik's named candidate.** Erik flagged it as *"interesting but we'll need
   to update it."* Read it, apply T7, rewrite if it fails.
3. ⚠️ **Any craft whose `plainly` is mostly scene-setting.** A `narrate` or `reveal` craft that
   describes the experience of perceiving without naming the output. The tell: the description
   reads like what the wielder FEELS, not what the GM must SAY.

**Scope:** targeted. Not a full corpus plainly-rewrite — only crafts that fail the narrative lens
by the signals above. Gate: after each rewrite, T7 must produce a concrete answer in one sentence.

### §2b — Second look at earlier-audited traditions

**The problem:** Mind and Body were audited first, before we understood the full checklist.
Specifically, these items did not exist when Mind was closed:

| item | when it was established |
|---|---|
| T5 Rank = mastery (costs at earned ranks are a tax) | 2026-08-07 |
| T6 Cannot is the backlash (`backlash` / `conserveSuppresses`) | 2026-08-07 |
| T7 Second-turn test | 2026-08-07 |
| Emotional/thematic palette pass (monoculture visible only across the set) | 2026-08-23 |
| Every tradition reaches all verbs in its own idiom (Erik's correction) | 2026-08-29 |
| `folkAccessible` — 12 of 24 poles have none | 2026-08-30 |
| `foresee` as a narrative verb needing a concrete output | 2026-08-30 |

**The pass:** re-run the full current checklist against **Mind, Body, and the Death traditions
already audited (ashwarden, threnodist)**. Not a full re-audit — targeted against the items that
postdate the original close.

**Per tradition:**

**Mind** — 25 skills, 3 schools.
- ⚠️ Run T5/T6/T7 against all 25. T6 means checking whether `backlash` and `conserveSuppresses`
  are authored (they will not be — these fields postdate the audit).
- ⚠️ Thematic palette: Mind is cogitant/syllogist/figurist. Audit the emotional range across the
  25. Is the tradition's full intellectual character present, or is one mode dominant?
- ⛔ `folkAccessible`: 2 crafts marked on Mind. Is the selection deliberate? The rule says 2–3
  per pole, one per sect minimum.
- ⛔ 4 social verbs present — confirm each reaches all four in its own idiom, not just as a
  function tag.

**Body** — 22 skills, 2 schools.
- ⚠️ T5/T6/T7 pass as above.
- ⛔ Erik explicitly named Body gaps: stunning strike (`hinder`), joint lock (`bind`), iron-body
  ward, shout that carries command. Check whether these exist. If not, author them.
- ⛔ `folkAccessible`: 2 crafts. Same question as Mind.
- ⚠️ Thematic palette: somatic is a body-discipline tradition. Does it carry the full range of
  what a body can do in this world, or is it weighted toward one register?

**Death (ashwarden + threnodist)** — 30 skills, 3 schools.
- ⚠️ T5/T6/T7 pass.
- ⛔ Threnody emotional palette: measured at 12/15 grief, joy 2 (never the subject), love/hope/
  longing/awe = 0. This is unresolved. Erik has not ruled on how joy and rage enter — do not
  author new crafts yet, but do flag which existing crafts are grief-only and could carry a
  second register.
- ⛔ Deathsense cannot currently reads wrong (forbids reading undead; should read inverted).
  Correct it.
- ⛔ `bargain` still missing from Death. One bargaining craft for ashwarden or threnodist.
- ⛔ `folkAccessible`: 1 craft on threnodist. Review the selection.

### §2c — Tradition people thickening

**What changed as we moved along:** starting with the later traditions, we learned to read the
`civilization` and `aesthetic` lines as PROMISES the craft list must fulfill. *"The beam-craft
that makes them feared"* (Blazeborn) predicted a craft that did not exist — and the check found
two. That lens was not applied to Mind, Body, or Death.

**The pass:** for each of the three traditions, read the `civilization`, `aesthetic`, `cultOfPurity`,
and `people` prose in `traditions.json` and then ask: *what does this text promise that the craft
list does not have?*

Write down every promise. For each one, check whether a craft fulfills it. If not, it is a gap.
Author or flag per T7 before anything is written.

**Also:** the backlog holds several thickening threads that are authored as world material but
not yet reflected in NPC or craft content:

- ⛔ **Ashwarden schism** — Marrow's choice vs. the ones who chose otherwise. The faction is real
  before the bird is confirmed. This is people-material, not craft-material. Where does it live
  in `npc_interiority.json` or a future NPC file?
- ⛔ **Threnody as mourning vs. feeling** — the full emotion range. Not to be solved by authoring
  crafts, but the existing people-prose in `traditions.json` should reflect the intended scope,
  not the current monoculture.
- ⛔ **Greyhearth** — ratified foothill, authored with `abilities: 0`. The Grave-Callers exist as
  foes. The place needs its people described in prose even if the crafts are not yet built.

### §2d — NPC thickening

**The gap:** 111 authored NPCs, 7 with interiority. 104 people with a face and no inner life.

**The backlog already named this as item 5 in Erik's seven:** *"the widest gap between what is
authored and what is alive."* The engine note says the trigger mechanism (`drivenNpcDirective`)
is waiting on a want-clock. That is CCode's lane and is not built. **But interiority is
content-authored and does not require the clock to be useful** — the GM prompt already uses it
for the 7 who have it.

**Scope of this pass:** interiority for the named authored NPCs who appear in traditions or are
tradition-adjacent. Not all 111 — the traditions second look tells us which NPCs are
tradition-facing. Start there.

**Selection criteria:**

1. ⛔ **NPCs who are a tradition's only named face.** If a tradition has a `civilization` that
   describes a people and the only NPC from that people has no interiority, the tradition is
   thin at its human layer.
2. ⚠️ **NPCs already referenced in craft `description` or `narrationHints`.** A named person
   inside a craft description and not in interiority is a dead link.
3. ⛔ **NPCs with a domain who appear in the backlog's open threads** — the Ashwarden schism,
   Threnody's emotional range, the Grave-Callers. These are the faces of the world material
   waiting to be written.

**Format:** `npc_interiority.json` entry per NPC, matching the Pell/Veth-Ondra schema:
`driveSummary` · `wants[]` · `fears[]` · and optionally `traditionRelation` (how this person
stands relative to their people's defining question — the schism, the emotional monoculture,
the arithmetic the polite half won't say).

**Minted NPCs:** the engine mints NPCs at runtime. Authored interiority entries do not reach
minted NPCs — that is correct and should not change. What this pass addresses is the 41 solo
authored files plus the legends pool. Minted NPCs get their character from `npcPromptSeed`
and `appearance`, which is the right architecture for that layer.

---

## §3 — ORDER AND DEPENDENCIES

| order | work | dependency |
|---|---|---|
| 1 | Narrative skills pass (§2a) | none — targeted rewrites on existing `plainly` |
| 2 | Tradition promises audit (§2c, prose only) | none — read and list, no authoring |
| 3 | Second look: Mind + Body + Death (§2b) | §2c's promise list for each tradition |
| 4 | NPC selection and interiority (§2d) | §2b — NPC selection is driven by tradition second look |
| 5 | Tradition people thickening prose (ashwarden schism, Threnody scope, Greyhearth people) | §2b + Erik ruling on Threnody emotional range |

**The Threnody emotional range (joy, rage, love) is a HELD ITEM until Erik rules.** Do not
author new crafts for Threnody in this pass. Do update the `civilization` prose if it is
currently narrower than the intended scope.

---

## §4 — WHAT EACH FILE I TOUCH LOOKS LIKE

| file | what changes |
|---|---|
| craft files in `content/packs/core/abilities/reach_*.json` | `plainly` rewrites (§2a), `backlash`/`conserveSuppresses` additions (§2b), new crafts if promise audit finds gaps |
| `content/packs/valley/npc_interiority.json` | new entries for tradition-adjacent NPCs |
| `content/packs/core/rules/traditions.json` | `civilization`/`aesthetic` prose corrections (§2c); `folkAccessible` selection confirmation |
| Possibly new NPC files | if a tradition-facing named person does not have a solo file |

**Nothing touched:** `tradition` / `traditionV2` fields · `energyCost` · `levelReq` ·
`functions` · `mechanic` · engine code.

---

## §5 — AUTHORING GATE

Every new or rewritten craft runs the full gate:

```
python3 po/authoring_gate.py <authored.json>            # before the write
python3 po/authoring_gate.py <pulled-from-origin.json>  # after
```

T7 written in prose for every new craft before it is committed.

---

## §6 — VERIFICATION

- `node scripts/certify_counts.mjs --check` after any craft file is touched
- No ratchet regressions (`abilitiesMissingHarmRung`, `abilitiesCombatClaimedNotTaught`)
- Every new craft: T7 answer written
- Every rewritten `plainly`: the new version names a concrete GM output, not an experience
- Every new interiority entry: `driveSummary` + at least two `wants` + at least two `fears`

---

## §7 — ROUND 2 REQUEST — CCode substrate-verify before Aevi begins

Per `OPERATIONAL_FLOWS_sng.md`, no authoring begins from an unverified premise.

1. **§2a:** Are there `foresee` crafts where the boilerplate gloss originates from the engine
   (a fallback the engine inserts) rather than from the authored `plainly` field? If so, which
   ones should be fixed in the craft vs. in the fallback?
2. **§2b:** Do `backlash` and `conserveSuppresses` have consumers in the engine today? If not,
   authoring them is decoration — flag it so the spec can hold the authoring until CCode wires
   them, or note they belong in `bounds` (prose-only) until they do.
3. **§2d:** Does the GM prompt use `npc_interiority.json` entries today for the 7 NPCs who have
   them? Confirm the path so new entries land where the engine reads.
4. **§2c:** Is there any engine reader of the `civilization` or `aesthetic` fields in
   `traditions.json`? If yes, naming the field and line matters. If no, it is GM-prompt territory.
5. **Anything in this spec that is already true at HEAD** — the domain gate lesson. If a gap
   I named has been closed since the backlog was written, say so.
