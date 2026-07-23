# SPEC — SNG-213: The complete repair surface — the GM can fix any field on any entity
## Aevi (PO) · 2026-07-22 · verified coverage audit at origin · Erik-directed

> **Erik:** *"I haven't seen the GM actually fix anything I've asked it to so far. Make sure the GM can fix
> any field in any place, as well as create, grant, remove, etc."*

## §0 — The frame: TWO failure modes, both must be fixed
"The GM can't fix things" is really two separate failures, and completing one without the other leaves it
broken:
- **A. MISSING VOCABULARY** — for many entities/fields, no repair op EXISTS, so even a willing GM finds every
  op refuses (SNG-212, the mother's name, is one instance). §1–2 fix this.
- **B. GM DOESN'T EMIT existing ops** — where an op DOES exist, the GM deflects/defers instead of emitting it
  (SNG-207c, the location escape). §3 fixes this.
A complete vocabulary the GM still won't reach for is useless; a willing GM with missing ops is helpless.
Both, or neither works.

## §1 — Verified coverage audit (16 gaps at origin)
corrections.js exposes 16 ops. Mapped against the full entity×field space, **16 gaps**:

**NPC (the worst-covered entity):** can fix gender ONLY. GAPS: **name** (212), **role**, **description**,
**status** (active/injured/missing/departed), **history**. → An NPC is barely correctable.
**Location:** pointer (reanchorLocation) yes. GAPS: a **place's own data** (name/description/parent), explicit
**place creation**.
**Quest:** stage + unstick yes. GAPS: quest **fields** (name/desc/giver), **creating** a quest the fiction
started.
**Item:** create (grantStoryItem) yes. GAPS: item **fields**, item **removal** (removeEntity has no item kind!).
**Companion:** bond yes, remove yes. GAP: **create** a companion the fiction established.
**Codex:** fact-fix + remove yes. GAP: **create** a codex entry the story established.
**No coverage at all:** **scene state** (setting/npcsPresent/objects — the SNG-207c case touched this),
**tradition standing**, **time/day**.

## §2 — Outcome: a UNIFIED, COMPLETE repair vocabulary, doctrine-bounded
Rather than 16 more one-off ops, generalize into a small complete set, each still gated by the FOUR RUNGS
(repair free · grant-what-conferred judged · advance refused · floors absolute — unchanged; this is coverage,
not a loosening):

1. **`correctEntityField`** — the general repair. `{kind, id, field, to}` for kind ∈
   player|npc|location|quest|item|companion|codex, any correctable field (name, role, description, status,
   parent, giver, etc.). Subsumes correctField/correctNpcGender/correctNpcName/fixCodexFact into ONE
   trace-gated repair. Numeric fields keep their clamps (ranks/attrs lower-only, vitals clamp).
2. **`registerEstablished`** — the general grant (extends registerEstablishedNpc to all kinds:
   npc|item|companion|quest|codex|location). Records what the FICTION established but the tracker missed —
   trace-gated exactly as today (no trace → refused as a wish). This is create/grant, judged.
3. **`removeEntity`** — extend to ALL kinds (add item, location-sublink) — currently missing item.
4. **`correctSceneState`** — repair the active scene (setting/npcsPresent/objects) when it desyncs from the
   fiction — the SNG-207c "you're not where the scene says" case, made directly fixable.
5. **`correctStanding`** / **`correctTime`** — the two orphan systems (tradition standing, day/season) get a
   repair path.
Existing specialized ops (correctVital, correctAttribute, correctBond, gmAdvanceQuest, unstickQuest,
reanchorLocation, correctDomain) stay — they carry domain-specific clamps/logic worth keeping; the general
ops fill the GAPS around them.

**The line that does NOT move:** every one is still trace-or-assertion gated and rung-bounded. "Fix any field"
means any WRONG field, and "create/grant" means what the FICTION conferred — NOT "grant me power." Advance
(xp/levels/unearned abilities/power) stays refused by the GM's fairness judgment. Erik ratified this himself
("power comes from play, not from me"); completing the repair surface does not touch it. A complete repair
tool is MORE able to say a clean "no" to a wish, because it's no longer confused about what it can't reach.

## §3 — Make the GM actually EMIT (failure mode B)
Coverage is half; the GM must reach for it. From SNG-207c's captured escape, the behavioral fixes:
- **Every op needs a trigger example.** SNG-207c + 212 both traced to ops that existed (or should) but had no
  "when the player says X, emit Y" example, so the ask didn't pattern-match to a repair. The prompt's repair
  block must pair EACH op with the player phrasing that fires it ("her name is X" → correctEntityField;
  "I'm actually in Y" → reanchorLocation; "the scene has me in the wrong spot" → correctSceneState).
- **Close the reframe (207c).** "It'll fix itself on the next beat / that's a display artifact / just keep
  playing" is a DEFLECTION when the player reports a stuck/wrong value. Name it as forbidden: reporting a
  wrong value is a repair request; emit THIS turn, never defer.
- **Never hallucinate a limitation (207c §5).** The GM claimed the Repair panel can't edit location; it can.
  Guard BOTH directions: don't claim a control exists that doesn't, AND don't claim one doesn't that does.
  The answer to "can you fix this?" is to emit the op, never to describe why you can't.
- **ACKNOWLEDGE MEANS EMIT stays the spine** — already in the prompt; the above make it reachable.

## §4 — The proof Erik is missing: a repair that VISIBLY lands
Erik has never seen the GM fix anything — so the acceptance criterion is not "ops exist" but "the player asks,
the GM emits, and the value visibly changes." Suggested verification (Tier-2, CCode-preview + god-mode per the
verification-model doc): drive the preview, ask the GM in-scene to fix each of a representative set (an NPC
name, the location, a scene desync, a wrong stat), and confirm at origin that the op fired and the field
changed. The FIRST visible successful repair is the thing that restores Erik's trust that the tool works at
all.

## GUARDS
- **Coverage, not license.** The four rungs are unchanged; this fills gaps in what REPAIR can reach, and
  leaves the wish-line exactly where Erik put it.
- **Trace-gate the grants** — registerEstablished for any kind still refuses without a fiction trace.
- **Clamps survive generalization** — folding correctVital/Attribute into the general field-op must keep the
  lower-only/clamp rules; don't let generalization become a power leak.
- **Every op ships with its trigger** — an op with no trigger example is an op the GM won't emit (the lesson
  of 207c + 212).

## OPEN QUESTIONS — CCODE ROUND 2
1. Generalize into `correctEntityField` + `registerEstablished`, or keep adding specialized ops? I lean
   general (2 ops close 12 gaps, and one trigger-family teaches the GM the whole shape) — but the specialized
   clamps (vitals/attrs/rank) must survive. Your call on the refactor vs. addition balance.
2. Field whitelist per kind — which fields are correctable vs. off-limits (e.g. an NPC's `firstMet` day
   probably shouldn't be player-editable; `relationship` maybe only via the bond/consequence path)? Author a
   per-kind correctable-field list (I can author it as content, parallel to the repair_panel_manifest).
3. Scene-state repair scope — full scene object, or just the desync-prone fields (location/who's present)?
4. Does the Repair PANEL also expand to match (it reads repair_panel_manifest)? If so I update the manifest
   content when the ops land, so panel + GM stay in lockstep (the 207c false-claim came partly from panel/GM
   drift).
