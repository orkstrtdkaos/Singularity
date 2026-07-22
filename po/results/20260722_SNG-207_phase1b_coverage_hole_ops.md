# SNG-207 Phase 1b — the coverage-hole ops: register, grant, advance

**CCode · 2026-07-22 · v1.8.200 (`e8b308f1`) · full suite green · clean boot verified.** The "ultimately capable" reach. Three new `stateOps` close the §2 gaps where the GM had *no lever* and could only narrate around the ask or deflect. Built on the doctrine you approved: **repair is free, grant is judged against a trace, advance is earned, floors are absolute.**

(And thank you for the fast turn on the 2B content — I see `the_maker_who_would_not_stop` / Cinder Vael landed the first real arc **retreat** at weight 3 plus weight:2 on the legend-hinged outcomes. The both-ways engine has content exercising it now.)

---

## The three ops

**`registerEstablishedNpc`** — the Teva case, finally fixable. A person the fiction clearly established but `meet` never fired for. This is **repair** (the story met them; the engine missed it), so no fairness question — but a **trace-check still guards against inventing a person**: the name must appear in the fiction's own record. It reuses the *canonical* meet path (`applyNpcUpdates`), so the SNG-199 codex mirror fires exactly as a real meet would — one code path, no divergence.

**`grantStoryItem`** — the **grant rung**, the line SNG-070 walled off, now open under judgment. An item the narrative conferred but the engine never recorded. Refused unless the fiction's own record shows a trace — *"the story didn't give you that."* Critically, a story item is a **narrative object** (name + description only): **no stats, no effects, no bonuses.** Mechanical power is earned through play (items grow — SNG evolution), never granted here. So "record the blade she gave me" works; "grant me a legendary flaming sword" with no fictional basis is a wish, and refused.

**`gmAdvanceQuest`** — a structured quest caught up to a stage the player completed in narration but the tracker missed. **Forward only** (a backward/stuck state is `unstickQuest`'s job); it records the intervening stages' `change` as findable progress, and it **never resolves the quest or hands out the outcome's rewards** — those stay earned at resolution.

## The trace-check — "checkable, not just assertable" (your ROUND 2 Q1)

`corrections.hasFictionTrace` reads three sources, all of them the **fiction's own record**, never the player's request:

1. the durable **established-facts ledger** (the SNG-205 signal — text or subjectId),
2. the **chronicle** beats,
3. **this turn's GM narration** (`turn.narration`, passed as `ctx.traceText`).

If none of them mention the thing, the grant/register is a wish and the engine refuses it. This is what keeps "the story gave it to me" honest: the GM exercises the fairness judgment, and the engine confirms there's a fictional basis for it before applying. The player's own "I want X" is never a trace.

## The doctrine in the prompt, and the §0 guard

The GM prompt now carries the **four-rung doctrine** in its own voice — repair free / grant judged-against-a-trace / advance earned / floors absolute — with each new op's "use when" and the explicit note that the engine checks for a trace so the GM only emits a grant when the story actually conferred it. Per your §0 ruling, there is **no `skipFairness` seam**: the fairness/trace check is baked into these ops, so SNG-207b's author god-mode must be its own surface calling different entry points, not a flag that loosens these. The panel manifest is unchanged and stays correct — the panel *can't* grant (`cannotDoHere` already says so); the GM can, in-turn, by judgment.

## Verified

10 smoke tests: register with a trace (+ codex mirror), refused with no trace, refused when already known; grant with a trace (no stats on the item), refused with no trace; advance forward (records the changes), refused backward; everything logged in the corrections ledger; the prompt doctrine + the call-site trace/catalog wiring. Full `npm test` green; `testOnlyExports` unchanged at 7 (`hasFictionTrace` is module-internal; the ops are cases inside `applyStateOps`). Clean boot + full content load on a fresh port with the new imports resolving; 0 console errors, 0 mojibake.

## SNG-207 status

Phase 1 (the fair, in-fiction GM) is now complete: **1a** killed the fix-screen deflection + hallucination (manifest in context, act-don't-deflect); **1b** closed the coverage holes (register / grant / advance, trace-judged). The GM can now make every state fix Erik named — location, known people, inventory, quest status — bounded only by its fairness judgment and the fiction's own receipt, never by a missing op. What remains is **SNG-207b** (the author/dev god-mode, explicitly deferred per §0) — a separate surface, its own door.

*— CCode. "I met her, why isn't she known?" — registered, with the codex written, because the river-rescue is in your facts. "Record the knife she gave me" — in your pack, because the crossing scene says she pressed it into your hand. "Give me a flaming sword" — the story didn't give you that. Ultimately capable, and still fair. Only-Aevi-closes.*
