# SNG-195 — Full prompt review against the engines and their purposes

**CCode · 2026-07-20 · audit (no engine change) · reads with `po/SPEC_SNG-195_prompt_review.md`**

The pipeline carries **60 context blocks** and **38 op keys**. This is the five-columns-per-engine review,
run in **both directions** (§2a), with `po/RUNNING_FIXES.md` **A6 (the writerly audit)** folded into column 4
as the spec directs — *a permission and an unevaluable metaphor fail identically: the model cannot act on
either with confidence.*

**Method.** Backbone from `ENGINE_MAP.md` (purpose/content/verbs, machine-derived) + the 56 `gm_registry.js`
rows. Three parallel evidence passes over the live code: every `world/scene/player.push` block classified by
directive mood (`gm.js`); every op's dispatch + firing observability (`app.js`); every authored content field
swept for a real reader across `engine/*.js` + `app.js`. Evidence quotes are in the gap tables below.

**The one-paragraph finding.** The pipeline is largely healthy: **every op dispatches, and every op's FIRING
is now observed** (the "31 uncounted" scare is stale — see G3). The real losses are all one shape, the shape
this whole batch has been chasing: **authored intent with no consumer.** It shows up as (a) orphaned content
fields — a *reputation-reaction system on 40 NPCs that nothing reads*; (b) two prompt blocks that offer a
capability the GM is never told to use; and (c) a third of the engine that cannot state its own purpose. None
are coding errors. All are missing connections.

---

# §1 — THE FIVE COLUMNS, PER ENGINE (forward pass)

Columns: **PURPOSE** (one line — ✓ authored / ✗ unstated) · **CONTENT IT NEEDS** · **IN PROMPT?** (which block) ·
**INSTRUCTED?** (is the GM told to ACT, evaluably — INSTRUCTION / PERMISSION / DATA) · **OBSERVED?** (firing seen).

## 1a — Engines that FEED the prompt (28)

| engine | purpose | content it needs | in prompt? (block) | instructed? | observed? |
|---|---|---|---|---|---|
| `gm.js` | ✓ assemble prompt, parse reply | — | (assembler) · `scene` | DATA | emit ✓ |
| `npcs.js` | ✓ NPC permanence | `wants` `questSeeds` `communityId` | KNOWN PEOPLE (data) · **WHAT THEY WANT** | **PERMISSION** ⚠ | npcUpdates emit ✓ |
| `quests.js` | ✓ typed quest state | `arcId` `boundToCharacter` | ACTIVE + STRUCTURED QUESTS | INSTRUCTION (stageOps) | emit ✓ |
| `standing.js` | ✓ how a people regards you | `teaches` `liaisonFor` | HOW YOU ARE REGARDED | DATA | standingOps emit ✓ |
| `reputation.js` | ✓ deeds→opinion view | `communityId` | LOCAL REPUTATION | DATA | deeds emit ✓ |
| `places.js` | ✓ location permanence | `want` | PLACE HISTORY · **RECALLED** | INSTRUCTION | placeUpdates/moveTo emit ✓ |
| `codex.js` | ✗ unstated | — | CODEX | DATA | codexUpdates emit ✓ |
| `progression.js` | ✓ growth with receipts | — | ABILITY LAW · **RIPE FOR MASTERY** | INSTRUCTION (rule 19B MUST) | markDefiningMoment ✓ (counted) |
| `substrate.js` | ✓ second difficulty map | `CONTENT.schools` `substrateSource` | THE SUBSTRATE · THE SCHOOLS | INSTRUCTION | adoptSchool ✓ (counted) |
| `assignments.js` | ✓ delegated work as state | — | DELEGATED WORK | INSTRUCTION (soft) | delegateOps ✓ (counted) |
| `latentarcs.js` | ✓ the world's own agenda | — | STIRRING · THE SEASON | INSTRUCTION | arcOps ✓ (counted) |
| `pacing.js` | ✗ unstated | — | THE WORLD ACTS · **THERE IS ROOM** | INSTRUCTION | offer ✓ (counted) |
| `encounters.js` | ✗ unstated | — | ACTIVE ENCOUNTER · **AVAILABLE ENCOUNTERS** | INSTRUCTION / PERMISSION | encounterOps emit ✓ |
| `company.js` | ✓ stacking party roles | `teaches` `curriculum` `liaisonFor` | **YOUR TEACHERS** | **PERMISSION** ⚠ | markTeacher ✓ (counted) |
| `toolkit.js` | ✗ unstated | `knowledge` | TOOLKIT | PERMISSION (correct) | — (no op) |
| `practice.js` | ✓ competency as residue | — | RIPE EMERGENCE | PERMISSION (correct) | — |
| `worldtime.js` | ✗ unstated | `CONTENT.worldClock` | CURRENT TIME · TIME | INSTRUCTION | timeOps emit ✓ |
| `worldtick.js` | ✗ unstated | `poleIntensity` `wants` | RECENT NEWS | DATA | (drives tick) |
| `generate.js` | ✓ the one generative path | `descriptionSeed` `loreRefs` | LIVING WORLD | DATA | generateRequest emit ✓ |
| `facts.js` | ✗ unstated | — | ESTABLISHED FACTS | DATA | factUpdates emit ✓ |
| `evolution.js` | ✗ unstated | — | LIVING GEAR · AN ITEM WAKES | INSTRUCTION | (itemUpdates) |
| `inventory.js` | ✗ unstated | — | INVENTORY | DATA | itemUpdates emit ✓ |
| `companions.js` | ✗ unstated | `voiceHints` `knowledge` `hooks` | COMPANIONS | DATA | — |
| `corrections.js` | ✗ unstated | `pronouns` | POSSIBLE ERROR | PERMISSION (advisory, correct) | stateOps emit ✓ |
| `narration_voice.js` | ✗ unstated | — | READ ALOUD · REGISTER | INSTRUCTION | — |
| `waygate.js` | ✓ the gate network | `waygate` `waygateHub` | WAYGATE | PERMISSION (correct) | moveTo emit ✓ |
| `party.js` | ✓ shared-world play | `_open_index.json` | PARTY | INSTRUCTION | (shared) |
| `legends.js` | ✗ unstated | — | (LEGEND) | DATA | — |

Also feeding the prompt as data/enum: `traditions.js` (THE PEOPLES enum), `intent.js` (offerIntent, PERMISSION-rare, correct), `romanceGuidance`/`rating` (register, INSTRUCTION).

## 1b — Engines that do NOT feed the prompt (infra / UI / pure-compute — 31)

These are correctly absent from the prompt; their surface is a screen, a save, or another engine. Listed so the
forward pass is complete: `state.js` `sync.js` `art.js` `playerprofile.js` `worldmap.js` `skilltree.js`
`affiliation.js` `canon.js` `chronicle.js` `backfill.js` `reconcile.js` `recurrence.js` `random_encounters.js`
`skill_battle.js` `gambit.js` `sense.js` `resolve.js` `vectors.js` `functions.js` `intensity.js` `genschema.js`
`entityDetail.js` `personalArc.js` `affinities.js` `names.js` `devcapture.js` `gm_registry.js` `claude.js`
`traditions.js` `standing`-adjacent. **No engine is missing from the prompt that should be in it** — the forward
pass found no "built capability the GM can't see." The losses are content-side (§4) and permission-side (§3.3).

## 1c — Column-1 gap: 31 of 59 engines cannot state their purpose

`ENGINE_MAP.md` shows **28/59 with an authored one-line purpose; 31 are `— unstated —`**. Per SNG-183 §3a a system
nobody can describe in one line is a design smell — and several of these are load-bearing (`codex` `worldtick`
`encounters` `intensity` `recurrence` `evolution` `reconcile`). This is the cheapest gap to close (author the
lines in `engine_map.authored.json`; the generator preserves them) and the one most likely to hide the *next*
built-never-reached, because an engine no one can describe is one no one audits. **Ranked G5 below.**

---

# §2 — THE 60 BLOCKS (backward pass): who needs each, and could it be cut

Full per-block classification is in the evidence appendix; the shape: **26 INSTRUCTION · 7 PERMISSION · 27 PLAIN-DATA**.
Every block has a live consumer (the narration reads it; the DATA blocks are consistency guardrails the MUST-emit
ops in the constitution depend on). **No block is orphaned prompt-weight** in the way content fields are orphaned
data. Two cut/merge candidates only, both minor:

- **LOCAL REPUTATION vs HOW YOU ARE REGARDED** — two standing-adjacent DATA blocks. `reputation.js` (deeds→view) and
  `standing.js` (bands) overlap in what they tell the GM about your welcome. Candidate to MERGE into one "how you
  are regarded here" block; saves a header and removes the chance they disagree. **Low priority.**
- **`opLossNote` (SNG-009)** — restates ops dropped last turn. Fires rarely and is self-healing (the next turn
  re-derives). Keep, but it is the one block whose absence would cost least. **Not recommended to cut.**

The backward pass's real yield is **column 4**: which of the 7 PERMISSION blocks *should* be instructions. That is
§3.3 — the class Aevi predicted "will not be the only one," and it is not.

---

# §3 — RANKED GAPS (most worth fixing first)

### G1 — Orphaned authored CONTENT: intent that silently does nothing ⭐ the biggest loss
The largest waste is not prompt weight — it is **authored design intent with no consumer**. An author fills in
`reactsToReputation` on 40 people believing it matters; it never once affects play. Full table in §4. The three
that carry real authored *prose/behaviour* (not derived numbers) and so genuinely mislead the author:

| field | carried on | what's lost |
|---|---|---|
| `reactsToReputation` | **40 NPCs** | a whole reputation-reaction system (`{balanced:"instant kinship", extreme:"challenges them…"}`) — the ONLY code touching it is a write-of-empty at `generate.js:83`. Reputation exists (`reputation.js`); these authored reactions to it are never read. |
| `personality` (+ warmth/trust/candor/patience) | **40 NPCs** | a per-NPC behavioural model; sub-keys verified unread (a generator stub + romance-prose coincidences only). NPC voice is authored and then not consulted. |
| `gains` | **779 rank-nodes** | a growth-prose string on nearly every ability rank node, sibling to the read `grants`/`cannot`. Zero reads. The single largest authored-string orphan in the game. |

**Decision each needs (Erik/Aevi, not CCode):** WIRE it (make reputation-reactions and personality actually reach
the NPC's block — they are exactly the non-hostile-surprise and voice material SNG-194 just started using), or
**STOP AUTHORING it** (an unread field is worse than absent — it costs authoring effort and reads as covered).
My recommendation: `reactsToReputation` and `personality` are worth WIRING (small: add them to `npcRegistryForGM`
/ the offer material); `gains` should be cut from the schema unless a levelling-preview surface is planned.

### G2 — Permission that should be instruction (the §3.3 class) — 2 of 7
Of the 7 PERMISSION blocks, **5 are correctly optional** (TOOLKIT, RIPE EMERGENCE, AVAILABLE ENCOUNTERS, WAYGATE
"a door offered lightly", POSSIBLE ERROR "advisory") — forcing any would make noise. **2 are genuine L2 gaps:**

- **WHAT THE PEOPLE HERE WANT** (rule 10b, `npcSeedDetail`) — *"when a bond deepens you may surface ONE."* This is
  Aevi's known case. **SNG-194 already built the fix's engine half** — the offer's `roomForAnOffer` gate now drives
  wants-as-initiative. Remaining: the wants block still carries the permission wording *in parallel*; simplify it
  to pure material and let the offer instruction own the trigger, so there is one initiative path, not a permission
  beside an instruction.
- **YOUR TEACHERS** (rule 16B, `teacherDetail`) — *"at most one offer a beat, and only when the moment fits."* This
  is the **exact SNG-179 teacher-gate shape** wearing SNG-175's clothes: a capability present, a trigger left to the
  model's judgement of "when the moment fits." It is the clean next **SNG-194-pattern** target: the engine can
  compute teacher-offer room (a bonded teacher present, off a cooldown, a lull) and hand a short unconditional
  instruction, exactly as `roomForAnOffer` does. **Recommend a small ticket: `roomForATeacherOffer`.**

### G3 — Op OUTCOME display drift (a real 1-line bug, not the scare it looks like)
The "31 uncounted ops" is **stale**: firing is now observed for **all 36** via `opsFiredIn → _opEmitted` (app.js
~3048), which drives the panel's fired/never split (`isEmitted`, line 953) — *not* `logOpOutcome`. So there is no
false-zero. BUT: 5 ops now write applied/rejected outcome (`markTeacher` `delegateOps` `arcOps` `adoptSchool`
`offer`), while the Machine panel's `OUTCOME_INSTRUMENTED = new Set(["markTeacher"])` (app.js:954) renders the
badge for **only one**. The instrumentation set (5) and the display allow-list (1) are out of sync — the other four
write outcome data no one can see. **Fix: widen the set to all 5.** One line.

### G4 — Contract asymmetries (the model isn't told about ops that exist)
- **`relationshipDeltas`** is in `SALVAGEABLE_OPS` + dispatched (app.js ~3154) but **not in the reply-format
  contract** — the model is never told it can emit it (the real field is `npcUpdates.relationshipDelta`; the
  top-level op is a legacy tolerated alias). Either document it or drop it from the salvage vocabulary.
- **Three undocumented dispatch aliases** — `unlockLivingCurrent`, `unlockWildCurrent`, `timeAdvanceHours` — are
  handled in `app.js` but appear in neither `SALVAGEABLE_OPS` nor the contract nor `logOpOutcome`. Fold into their
  canonical ops (`unlockSubstrate`/`timeOps`) or document them.

### G5 — 31 engines with no stated purpose (§1c)
Author the one-line purposes in `engine_map.authored.json`. Cheap, and it is the layer that catches the next
built-never-reached (§1c). Priority order by blast-radius: `codex` `worldtick` `encounters` `intensity`
`recurrence` `reconcile` `evolution` first.

### G6 — Writerly (A6) instances still live in the prompt
The A6 audit's own known instances are already struck (§4/§4b history). Scanning the 60 blocks for the five markers,
the live residue is small and mostly benign, but two carry load:
- **Rule 19C** (the origin case) — already rebalanced by CCode; keep watching, it is the canonical stacked-caution.
- **Soft-directive blocks** (`DELEGATED WORK` "speak to them as live", `THE SEASON` "let it colour", `SCENE PACING`)
  are INSTRUCTION-mood but *unevaluable* — they ask the model to judge tone, which is fine (tone is the model's job)
  but should never be relied on to FIRE anything. None currently gate an op, so they are safe; flagged so no future
  spec hangs a trigger on one. **The rule going forward (A6 marker 4): if a block must FIRE something, the engine
  computes the condition — the block never asks the model to judge timing.** SNG-194 is the reference implementation.

---

# §4 — ORPHANED CONTENT FIELDS (the backward pass over the corpus)

Authored but read by **no** engine code (writes and name-collisions excluded). Ranked by carrying-count, but note
the **cost axis differs from the count axis**: `axisVector` is largest by files yet cheapest (a derived number),
while `reactsToReputation`/`personality`/`gains` are smaller in reach but carry real authored prose.

| field | corpus | files | class | verdict |
|---|---|---|---|---|
| `axisVector` | location | 95 | derived numeric (from `poleIntensity`, which IS read via `worldPos`) | CUT — precomputed convenience nothing consumes |
| `reactsToReputation` | npc | 40 | authored reaction system | **WIRE** (into NPC block / offer material) or cut |
| `personality` (+subkeys) | npc | 40 | authored behavioural model | **WIRE** (NPC voice) or cut |
| `gains` | ability | 779 nodes | authored growth prose | CUT unless a levelling-preview is planned |
| `challengeTypes` | ability | 16 | 45 values; `gm_registry.js:33` already comments "read by nothing" | CUT or wire to challenge selection |
| `universalRole` | npc | 6 | role tag | investigate — may be intended for company/standing |
| `schoolAffinity` | ability | 3 | **CI-validated (SNG-193b), runtime-unconsumed** | KEEP — deliberate per SNG-193 (not a gate); the pending consumer is braid-detection. **CCode owns this note.** |
| `coUseTag` | item | 3 | evolution tag (engine reads `unlockCoUse` counts instead) | CUT or reconcile with `unlockCoUse` |
| singletons | npc/ability/item | 1 each | `whatHeIs` `trueName` `arcOwner` `poleSignature` `abilitiesFlavor` `sensitivity` `recruitable` `innatePrecursorSource` `notes_for_gm` `archetype` `peril` `rankModel` + `the_unfinished_spear` (7 fields) | case-by-case; most are one-off authoring reaches |
| `disposition` `relationships` `legends` | npc | 1 | **name-collision** — engine reads target a *different* object | the names are taken; rename if wiring these |

**DOC-ONLY (authoring notes, not waste, correctly unread):** `domainsNote` `curriculumNote` `companyNote`
`worldPosNote` `radiusNote` `axisVectorNote` `substrateNote` `trueNameNote` `schoolAffinityNote`.

**`recruitable` correction:** Aevi listed it as an instruction-to-the-engine-never-received. Confirmed unread as a
field, BUT the only code hits are a coincidental local `const recruitable = knownPeopleAt(...)` (app.js ~6768) — so
the *concept* is used elsewhere; the authored NPC field specifically is the orphan. If recruitment should read it,
that is a real wire; if not, cut the field.

---

# §5 — WHAT NOT TO FIX (not every gap is worth it)

- **The 27 PLAIN-DATA blocks are not permission-gaps.** They are consistency guardrails ("never contradict", "these
  are TRUE") paired with MUST-emit ops in the constitution. Leave them.
- **5 of the 7 permission blocks are correctly optional** (§3.2). Do not force TOOLKIT/EMERGENCE/ENCOUNTERS/WAYGATE/
  POSSIBLE-ERROR — a surprise the player didn't earn and a forced door are worse than a quiet one.
- **The "31 uncounted ops" needs no fix** beyond G3's one line — firing is already observed.
- **`axisVector`/`gains`/singleton orphans**: cutting is cleanup, not capability. Batch it with a schema pass; it is
  not worth a dedicated ticket.

---

# Recommended follow-on tickets (ranked)

1. **G1 wire-or-cut** `reactsToReputation` + `personality` (40 NPCs each) — the biggest authored-intent loss; the
   material SNG-194's offer wants anyway. *(Aevi decides wire vs cut; CCode wires.)*
2. **G2 `roomForATeacherOffer`** — apply the SNG-194 engine-gate pattern to the teacher block (the last clean L2).
3. **G3** — widen `OUTCOME_INSTRUMENTED` to the 5 outcome-writing ops (1 line).
4. **G4** — document or drop `relationshipDeltas` + the three unlock/time aliases.
5. **G5** — author the 31 missing engine purpose lines (start with `codex`/`worldtick`/`encounters`).
6. **G1 cleanup** — schema pass to cut `axisVector`/`gains`/`challengeTypes`/singleton orphans.

*— CCode. The pipeline fires; what it forgets is what was written down and never read. The reputation a person
would have to your face, the temperament an author gave them, the growth-line on 779 abilities — all authored, all
silent. That, and two places where the world is still allowed to merely be permitted to act.*
