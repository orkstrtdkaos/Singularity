# SNG-218 §2 — the LLM "next crafts" suggestion PROMPT (Aevi-authored, ready to wire)
## Aevi (PO) · 2026-07-22 · the prompt CCode was waiting on

> **CORRECTION (Aevi, 2026-07-22):** My first draft said aspirations "MAY be absent (Silas has none)."
> WRONG — I read the wrong path. Aspirations live at **`character.practice.aspirations`** as
> `[{abilityId, since, progress}]` (Silas is actively working toward `hunters_strike` 2/10 and
> `pattern_sense` 0/10). They are NOT absent — they're a PRIMARY signal, and the suggestion must read the
> right path and treat them as first-class. Also found and now folded in: **`character.practice.uses`** —
> per-craft use counts (order_sense 71, deathsense 31, palework 29, shadowstep 17…) — the real
> "leaned-on vs. underused" data. Both corrections below.

This is the deliverable the spec assigned to Aevi and I hadn't written yet. It's the `suggestNextCrafts`
function — mirrors `suggestBuild`'s shape (rich system prompt, honest-cost discipline, strict JSON, ids-only-
from-the-list). CCode wires the call + feeds the context; the prompt below is authored and final.

## Context signals VERIFIED available (from a live save — feed these in)
- `abilities` — owned crafts + rank (e.g. order_sense/deathsense/palework at rank 3, shadowstep rank 2).
- `domains` — primary/secondary/tertiary (e.g. ashwarden / cogitant / figurist).
- `playStyle.tendencies` — the SNG-113 accrual (Silas: cerebral 18, social 13, strategic 11, amorous 10,
  physical ~0 — a thinker/talker, not a fighter). **This is the richest signal — a real behavioural fingerprint.**
- `playStyle.aptitudes` — earned tags (strategist, scholar, sage, charmer).
- `skillPoints`, `level`.
- **THE REACHABLE POOL** — the §1-fixed reachable-now crafts (allowed, not owned, level AND standing met).
  The suggestion may ONLY pick from this. CCode passes it in.
- `boostedCrafts` — SNG-215 A1, may be absent (handle gracefully — weight if present, ignore if not).
- **`practice.aspirations`** — `[{abilityId, since, progress/10}]`. **VERIFIED PRESENT** (Silas: hunters_strike
  2/10, pattern_sense 0/10). A PRIMARY signal — a craft on the aspiration list, or one that ADVANCES an
  aspiration, should be strongly favoured. Read from `character.practice.aspirations`, NOT a top-level field.
- **`practice.uses`** — per-craft use counts (order_sense 71, deathsense 31…). The "leaned-on vs. underused"
  signal: a craft the player has BARELY used is a candidate for "you have this but never reach for it," and a
  heavily-used craft marks their true signature. Pass a compact summary (top-used + owned-but-unused).
- `standing` per people — may be sparse/empty in a snapshot. Use if present, don't require.

## The function (author-final)
```
export async function suggestNextCrafts({ owned, domains, tendencies, aptitudes, reachablePool,
                                          boosted = [], aspirations = [], uses = {}, standing = {},
                                          skillPoints = 0, level = 1 }) {
  // aspirations from character.practice.aspirations [{abilityId, progress}]; uses from character.practice.uses
  const sys = `You advise a player of SINGULARITY on WHICH CRAFT TO LEARN NEXT at level-up. You are not
picking for them — you are naming the 2-4 reachable crafts that best fit WHO THIS CHARACTER HAS BECOME, each
with an honest reason, so they can choose well.

WHAT YOU READ:
- Their OWNED crafts and ranks — what they already lean on, and where they're deep vs. thin.
- Their PLAY-STYLE tendencies (a behavioural fingerprint accrued from how they actually play — e.g. cerebral,
  social, strategic, physical, amorous, cautious, ruthless). This is the strongest signal: suggest crafts
  that fit how they PLAY, not a theoretical "optimal" build. A cerebral, social, non-physical character
  should rarely be steered into a raw-combat craft they'll never reach for.
- Their earned APTITUDES (strategist, scholar, charmer…) — who the world already recognises them as.
- Their DOMAINS — the peoples they can draw from.
- BOOSTED crafts, if any — crafts the PLAYER flagged they want to use more: weight these UP when they fit.
- ASPIRATIONS — the crafts the player has DECLARED they're working toward (with progress). This is a DIRECT
  statement of intent: a reachable aspiration craft, or a craft that clearly advances one, is the STRONGEST
  fit-signal there is. If an aspiration is reachable now, it should almost always be among your picks (tagged
  fit:"aspiration"), and named as the thing they SAID they wanted.
- USE COUNTS — which owned crafts they actually lean on vs. barely touch. A high-use craft is their signature;
  an owned-but-near-zero craft may be worth a "you have this but never use it" note (not a new-craft pick, but
  useful context for judging what genuinely fills a gap).

⛔ SUGGEST ONLY FROM THE REACHABLE LIST GIVEN. Every craft you name MUST be in the reachable pool — a craft
the character can learn RIGHT NOW (domain-allowed, level met, standing met, not already owned). Never suggest
something they cannot learn this moment. You MAY, in a rationale, gesture at where a craft LEADS ("and it
opens the road toward X") but the PICK itself is always reachable-now.

⛔ EACH PICK CARRIES ITS REASON — grounded in THIS character, not generic. "You read every situation but have
no way to WARD a friend — Death-Ward closes that gap" (specific to their kit). NOT "a versatile defensive
option" (generic). A reason that could be pasted onto any character is a failure.

⛔ COVER THE GAP, DON'T PILE ON THE STRENGTH. Prefer a pick that gives them something they LACK (a missing
function family, a defensive tool for an all-offense kit, a way to act where they're currently helpless) over
a fourth craft in the family they already dominate — UNLESS deepening a signature strength is the clearly
aspirational move for how they play. Name which it is.

⛔ HONESTLY RANK. Order the picks best-fit first. If the reachable pool is thin (1-2 crafts), suggest those
plainly and say the field is narrow this level; never pad to four with poor fits.

Reply with ONLY JSON:
{"picks":[{"abilityId":"id from the reachable list","why":"one sentence, specific to THIS character's kit and
play-style","fit":"gap|aspiration|strength|synergy — which kind of pick this is"}],
"note":"one optional short line on the shape of the choice this level, or empty string"}

Use ONLY abilityIds from the REACHABLE list. 2-4 picks, best first. If reachable is empty, return
{"picks":[],"note":"nothing new is within reach this level — deepen what you have through use"}.`;

  const content =
`OWNED CRAFTS (id · rank): ${owned}
DOMAINS: primary ${domains.primary} · secondary ${domains.secondary} · tertiary ${domains.tertiary}
PLAY-STYLE (higher = more that way): ${tendencies}
APTITUDES: ${aptitudes}
${boosted.length ? `BOOSTED (player wants to use more): ${boosted}\n` : ""}ASPIRATIONS (declared goals · progress/10): ${aspirations.length ? aspirations : "none declared"}\nUSE COUNTS (leaned-on vs. rarely-used owned crafts): ${uses}\nSKILL POINTS: ${skillPoints} · LEVEL: ${level}

REACHABLE NOW — the ONLY crafts you may suggest (id · name · family · what it does · cost):
${reachablePool}`;

  return callClaudeJSON([{ role: "user", content }], { task: "suggest-next-crafts", system: sys, maxTokens: 900 });
}
```

## Wiring notes for CCode
- **Reachable pool is the guardrail.** Build it from the §1-fixed `reachable` predicate and pass ONLY those
  crafts (id · name · family · short effect · cost). The prompt is instructed to pick only from it, but the
  RENDER must also hard-filter the output against the reachable set — belt and suspenders, so a stray model
  pick can't render a Learn button on an unlearnable craft (the exact SNG-218 root bug).
- **Graceful fallback (per spec §2):** on LLM failure, fall back to the existing heuristic "Suggested for
  you" — never leave the top empty. Wrap the call; catch; heuristic.
- **§3 highlight:** the returned `picks[].abilityId` are what the wheel highlights. Same list drives the
  top-of-modal text (with `why`) and the on-wheel markers — one source, two surfaces.
- **`fit` tag** ("gap/aspiration/strength/synergy") lets the UI optionally show WHY-kind as a small label; and
  it's a check on the model — a good suggestion set usually isn't four "strength" picks.
- **aspirations + uses:** read `character.practice.aspirations` ([{abilityId, progress}]) and
  `character.practice.uses` (id→count). Pass aspirations as "hunters_strike 2/10, pattern_sense 0/10" and a
  compact use summary (the few most-used + any owned craft with ~0 uses). BOTH are load-bearing signals — a
  suggestion that ignores a declared aspiration the player can reach NOW has failed the 'rationalized' bar.
- **tendencies formatting:** pass the tendency map as a compact "cerebral 18, social 13, strategic 11…" list
  (drop near-zero ones) — the prompt reads it as a fingerprint, not raw numbers.

## ⇄ AUGMENTATION INVITATION — CCode, improve the INPUTS, not just wire the prompt (Erik-directed)
This prompt was authored from the signals Aevi surfaced by inspecting a save — which is a PARTIAL view. Aevi
has a session-built model of the game, not the whole engine. Before wiring, **audit the prompt's input set
against what the engine actually knows about craft-learning, and augment it.** The prompt structure is sound;
its INPUTS may be incomplete. Treat the signal list as a floor, not a ceiling.

**Known gap Aevi flagged: SCHOOLS and TEACHERS.** Aevi left these out of the reasoning and shouldn't have.
Verified in the save:
- `character.schools` — the adopted school PER DOMAIN (Silas: ashwarden→`ash_plain`, cogitant→`cog_unaided`,
  figurist→`fig_forming`). 67 schools exist across the traditions; 19 abilities carry `schoolAffinity` marks.
- `character.teachers` — a teacher map (empty for Silas here, but the mechanism exists; `markTeacher` /
  `adoptSchool` are live ops).
- The established finding "the material school is the one that travels — it carries the floor" implies a
  craft's SCHOOL-FIT with the character's adopted school plausibly affects whether it's a good next pick
  (a craft aligned to their school may be more reachable / more natural / cheaper; a teacher may unlock or
  ease specific crafts).

Aevi does NOT understand the school/teacher learning mechanics well enough to encode them correctly — so
rather than guess and get it wrong, **CCode decides how (and whether) school-affinity and teacher-availability
should feed the suggestion**, because CCode owns that engine. Options CCode should weigh:
- Add `schools` + `schoolAffinity` of each reachable craft to the input, and a prompt line ("a craft aligned
  to their adopted school is a more natural reach; note when a pick would need a different school").
- Add teacher-availability (a craft a present/known teacher could grant is a stronger, story-earned pick).
- Or, if school-fit is already baked into the §1 `reachable` predicate (a craft's school-gate is part of
  "can learn now"), then it may need NO new input — just confirm and note it.

**Broader ask:** beyond schools/teachers, CCode should check for OTHER learning-relevant signals Aevi may have
missed — braid/combination affinity (`coActivations` is in `practice`), emergence readiness, precursor/
substrate access, ring-neighbour relationships, cross-pole braid eligibility. Any that genuinely shape "what's
a good next craft" should be folded into the input payload + a matching prompt line. Aevi authored the
reasoning FRAME (fit-to-character, cover-the-gap, honest reasons, reachable-only); CCode completes the
SIGNAL SET from the engine it owns.

**Then:** note back in the results doc what you added (or why a candidate signal was left out), so Aevi can
fold the final input contract into the canonical prompt. This is the proposal→augment→ratify loop, applied to
a prompt's inputs: Aevi proposes the frame, CCode augments from the substrate, Aevi ratifies the result.

## Guard held
Same discipline as suggestBuild: honest reasons, name the cost/gap, suggest-never-impose, reachable-only.
This is the "genuinely rationalized suggestion" Erik asked for — reasoning from the character's real
play-fingerprint, not a rules table.
