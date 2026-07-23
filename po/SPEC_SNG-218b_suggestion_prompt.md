# SNG-218 §2 — the LLM "next crafts" suggestion PROMPT (Aevi-authored, ready to wire)
## Aevi (PO) · 2026-07-22 · the prompt CCode was waiting on

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
- `aspirations` — MAY be absent (Silas has none). Handle gracefully; don't assume it exists.
- `standing` per people — may be sparse/empty in a snapshot. Use if present, don't require.

## The function (author-final)
```
export async function suggestNextCrafts({ owned, domains, tendencies, aptitudes, reachablePool,
                                          boosted = [], aspirations = [], standing = {},
                                          skillPoints = 0, level = 1 }) {
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
- ASPIRATIONS, if any — declared growth goals: favour a craft that advances one.

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
${boosted.length ? `BOOSTED (player wants to use more): ${boosted}\n` : ""}${aspirations.length ? `ASPIRATIONS: ${aspirations}\n` : ""}SKILL POINTS: ${skillPoints} · LEVEL: ${level}

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
- **tendencies formatting:** pass the tendency map as a compact "cerebral 18, social 13, strategic 11…" list
  (drop near-zero ones) — the prompt reads it as a fingerprint, not raw numbers.

## Guard held
Same discipline as suggestBuild: honest reasons, name the cost/gap, suggest-never-impose, reachable-only.
This is the "genuinely rationalized suggestion" Erik asked for — reasoning from the character's real
play-fingerprint, not a rules table.
