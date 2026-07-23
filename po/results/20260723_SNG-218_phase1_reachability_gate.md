# SNG-218 §1 — the ONE reachability gate (the root fix under the redesign)

**CCode · 2026-07-23 · v1.8.213 (`a5b17456`) · 6 new tests green · live-verified.** The spec calls §1 *"the root fix; the redesign is the UX around it"* — so it's built first, and it's the actual bug Erik hit: The Cut Thread offered a Learn button that then refused. That disagreement is gone.

---

## The bug, precisely

The wheel's `reachable` predicate was `v.allowed && !isOwned && level >= levelReq` — level, domain, owned, but **not the capstone STANDING bar.** So The Cut Thread (levelReq 5, Silas level 19, standing 7/10) read `reachable: true`. And the detail-panel Learn button **hand-rolled its own gate too** (`!gate.ok || capBlock || tooPoor || !levelOk`) and **also missed standing** — so it showed "Learn", and only on click did `learnAbility` (which *does* check standing) refuse. **Three definitions of "can learn"; the two the UI read both disagreed with the one that writes.**

## The fix — one non-mutating gate everything reads

`canLearnAbility(character, id, catalog, rules, opts)` in `progression.js` runs **every** learn-gate term in order — access/level, domain (antipode/tier/closed), attribute gate, the **capstone standing bar**, capacity, affordability — and returns `{ok, why, gate, cost, band}` **without mutating**. `learnAbility` now calls it and only writes on `ok`, so the check and the write are the same code. Both UI surfaces read it:

- **The wheel's `reachable`** = `canLearnAbility(...).ok`. The Cut Thread now reads `reachable: false`.
- **The detail-panel Learn button** reads the same verdict — a standing-locked capstone shows its real *"deep standing with this people is not yet earned (standing 7 of 10)"* instead of a button that refuses.

The refusal is tagged: `gate: 'standing'` → the node is marked **`aspirational`** (blocked only by standing, earnable "later" — the dimmed state §3 renders); `gate` of `cost`/`capacity`/`level`/`domain` → other blocks. The node now carries `reachable` / `learnGate` / `learnGateWhy` / `aspirational`, ready for §3's highlight-vs-dim.

## ROUND 2 — Q1 answered (the full learn-gate, enumerated)

The complete gate, in `learnAbility`'s own order: **owned → access/level (`req` via domain gate or effectiveLevelReq) → domain gate (`domainGateFor`: antipode/tier/closed-opposite) → attribute gate (`meetsLearnGate`) → capstone standing bar (`meetsStandingBar`, levelReq ≥ capstoneTier, non-folk pole) → capacity (`atCapacity`, non-learned) → affordability (skill points ≥ cost).** `reachable` was missing the last four; standing was the one that bit Erik. `canLearnAbility` now *is* that list, so "any other real learn-gate term" is covered by construction — a new gate added to `learnAbility` is inherited by `reachable` for free.

## Verified

6 smoke tests on the exact case: the old level-only predicate reads the standing-locked capstone as reachable (the bug); the fixed gate blocks it on standing (`gate: 'standing'`); `learnAbility` refuses identically (single source); earn deep standing + a willing teacher and the *same* gate opens it → `learnAbility` then learns it (agreement both directions); `canLearnAbility` never mutates. All existing `learnAbility`/capstone/domain-gate tests green — the refactor preserved behavior. Ratchets held (`canLearnAbility` consumed by app.js + `learnAbility`, no orphan). **Live** (fresh port 8231): the skill wheel renders all 282 nodes through the new per-node gate with **0 console errors** — the read-only gate uses only functions `learnAbility` already calls on the same data, so no new throw surface.

## Where the rest of SNG-218 stands

- **§4 (detail panel) — largely already present.** The panel renders the **rank ladder** (`ab.tree` → r1/r2/r3 with each rank's grant + "cannot") on select, plus the now-correct cost+gate line. That covers "what it does / rank progression / cost+gates." The one possible add is *"what it deepens into / braids"* — small, if wanted.
- **§3 (wheel in the level-up modal) — the substantive remaining UX.** Bring the (existing) wheel into the modal, replace the linear all-traditions list, and render reachable-highlighted / aspirational-dimmed using the `reachable`/`aspirational` flags §1 just added. This is the bulk of the visual redesign.
- **§2 (LLM suggestion) — needs Aevi's prompt (per §OWNERSHIP).** The plumbing reuses `suggestBuild`'s call shape and filters on `reachable` (so it can never suggest an unlearnable craft — §1 guarantees that). But the *prompt + rationale structure* is Aevi's to author. **§3's "highlight the recommendations on the wheel" is only meaningful once §2's picks exist** — so §2 and §3 pair.

**Recommend:** Aevi authors the §2 suggestion prompt; then §2 (plumbing) + §3 (wheel-in-modal, highlighting the picks) build together as Phase 2. I can start §3 now against the existing heuristic as a placeholder recommendation source if you'd rather not wait — say which.

*— CCode. The gate that offered a door it wouldn't open now tells the truth from one place: the wheel, the button, and the write all read the same verdict. Cut Thread reads "deepen your standing," not "Learn." The redesign hangs off this; §1 is the nail it hangs on.*
