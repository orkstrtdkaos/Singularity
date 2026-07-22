# SNG-207 Phase 1a — the GM stops hallucinating the fix screen

**CCode · 2026-07-22 · v1.8.199 (`5b6ac681`) · full suite green · clean boot verified.** The prompt-contract half of SNG-207 — the slice ROUND 2 Q4 confirmed ships independent of the new ops. It closes Erik's most concrete complaint: *"it often sends the user to the character-fix screen, which it sometimes makes up can fix the issue."*

---

## What shipped

**Gap B (§3) closed.** Your `repair_panel_manifest.json` — the authoritative op list + the `cannotDoHere` list — was listed in the core manifest but **never actually loaded** into `CONTENT` (no `loadRule` for it). Now it loads (`state.js`), renders as a GM context block (`corrections.repairPanelForGM` → `gm_registry` `repairPanelDetail` → `gm.js` scene block), and reaches the GM every turn a state-fix could come up. The GM now sees *exactly* what the panel can and cannot do — it can neither invent a control nor deflect to a missing one. A smoke test also asserts **every op the manifest advertises is a real `corrections.js` op**, so the manifest can never drift into advertising a phantom capability.

**§5 prompt contract.** The `stateOps` block now leads with **ACT, DON'T DEFLECT**: emitting the op yourself, this turn, is always the first answer; the panel is a fallback, never a destination; a referral to a control not on the manifest is called out as a hallucinated capability — the same class of failure as inventing a rule. The existing SNG-137 "acknowledge means emit, same turn" contract stays and is reinforced.

## ROUND 2 — answered

**Q1 (the grant/wish line — is a structured check wanted?) — YES, and it's the spine of Phase 1b.** A grant-op ("record the item the story gave me", "register the person I clearly met") should validate against a **trace**, not pure model say-so: the entity should appear in the established-facts / chronicle / active-scene signal (the SNG-205 established-facts layer, reused). This makes "the fiction conferred it" *checkable* — the engine confirms there's evidence the story granted it, and the GM's fairness judgment rides on top. "Repair is free, grant is judged **against a trace**, advance is earned, floors are absolute." Pure say-so grants are exactly the wish-inflation SNG-070 walled off; a trace requirement is what lets the wall come down safely.

**Q2 (compose vs new ops) — new composite ops where the fairness check must live in one place; sequenced GM emissions where it doesn't.** `register-established-NPC` and `grant-story-conferred-item` are single new ops (each carries its own trace-check + log entry). `reanchor-then-generate` is better as the GM emitting `reanchorLocation` + a `generate` request in sequence — two existing, independently-validated ops, no new composite needed. The rule: one op per fairness decision.

**Q3 (manifest freshness — authored vs generated) — authored is right, and now guarded.** Your hand-authored manifest reads better than a generated dump (it explains each op in play-language, not signatures). The staleness risk is covered by the new smoke test that fails if the manifest ever advertises an op `corrections.js` doesn't have. Authored prose, machine-checked completeness — the best of both.

**Q4 (sequencing) — confirmed: the prompt-contract half shipped independently (this).** The new ops (Phase 1b) ride on the SNG-205 established-facts signal for their trace-check; they're the next slice.

**Q5 (dev/GM god-mode) — kept strictly separate, per your §0 ruling.** This is the fair, in-fiction GM. The author god-mode is SNG-207b, a different surface calling different entry points. The one guard §0 imposes is honored: nothing here leaves a `skipFairness` seam — the grant path (when 1b builds it) will bake the fairness/trace check IN, so a future no-fairness author lever must be its own door, not a flag on these ops.

## Verified

8 smoke tests: manifest completeness (12 ops + theRule + cannotDoHere); every advertised op is a real correction; `repairPanelForGM` renders the capability + act-don't-deflect + is null-safe when unloaded; full wiring `state.js` → `gm_registry` → `gm.js` + the ACT-DON'T-DEFLECT prose. Full `npm test` green; `testOnlyExports` unchanged at 7 (`repairPanelForGM` is consumed by the registry). Clean boot + full content load on a fresh port with the manifest live; 0 console errors, 0 mojibake.

## Phase 1b — the coverage holes (the meatier slice)

The §2 asks that have no op today, each an engine op with a trace-check + a `corrections`-ledger entry:

1. **`registerEstablishedNpc`** — the Teva case: a person the fiction clearly established but `meet` never fired for. Trace: the NPC appears in the scene / established-facts. Repair, not grant (the story met them; the engine missed it).
2. **`grantStoryItem`** — an item the narrative conferred but never recorded. Trace: the item appears in the chronicle / active scene as given. Grant-judged (the §4 rung that moves the line).
3. **`gmAdvanceQuest`** — a GM-judged "you did this offscreen/in-narration, the tracker missed it" stage advance, thicker than `unstickQuest` + SNG-162.

All bounded by: repair is free, grant is judged **against a trace**, advance is earned, floors are absolute — and every one logged + reversible in the SNG-070 ledger. This is where "ultimately capable" gets its reach; it wants its own focused build.

*— CCode. The GM will stop pointing Erik at a fix screen it invented. Next: give it the levers for the fixes it currently can't make at all — with the fiction's own receipt as the check that keeps "the story gave it to me" honest. Only-Aevi-closes.*
