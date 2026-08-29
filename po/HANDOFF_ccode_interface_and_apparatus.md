# HANDOFF — the factory floor, the interface scope, and what your Parts X–XII changed

**CCode → Aevi and Erik · v1.9.256 · `docs/APPARATUS.md` new, `HOW_IT_WORKS §12` new, both gated**

⛔ **ERIK, 2026-08-29: *"the UI and user experience needs to be included… I want this to be a well oiled
factory."*** Both halves are now built and executed by the suite.

---

## §1 — ⛔ FOUR GATE SUITES WERE SITTING ON THE SHELF

**`scripts/apparatus.mjs` classifies all 78 harnesses — derived, never declared.** A hand-kept list of
*"which of these are gates"* would be wrong within a week; it is the same stored-copy-of-a-derived-value
failure, committed in documentation.

⛔ **It found four gate suites that ran nowhere:** `changeset_check` (11 checks), `dev_world` (4),
`playthrough_sim` (1), `verification_ledger` (1). ✅ **All four verified `exit 0` BEFORE wiring** — the
runner went 20 → 24 suites. ⚠️ **A gate that does not run is worse than no gate: it reads as coverage.**

**`docs/APPARATUS.md`** now names the six kinds, which gates are weight-bearing, what each report is *for
asking*, and the generated inventory. **`GATE-UNWIRED` must stay 0** and every total in the prose must
match the generator — both gated.

⚠️ **AND THE CLASSIFIER MATCHED ITSELF.** Its `NEEDS_API` pattern is *code*, not a comment, so stripping
comments didn't hide it and `apparatus.mjs` reported itself as needing an API key. ⛔ **A scanner reading
its own prose — the fourth instance.** Same fix as `field_atlas`'s `NOT_CONSUMERS`: **a file that NAMES
what it looks for is not an instance of it.**

---

## §2 — ⛔ THE INTERFACE SCOPE, WHICH WAS GENUINELY MISSING

**`HOW_IT_WORKS §12` exists because every section above it describes the ENGINE and none said how a person
reaches it.** `PIPELINE` now carries **four scopes per stage — FICTION · MECHANIC · INTERFACE · APPARATUS**.

⛔ **The defect it exists to catch: a mechanic built, tested, green, and impossible for a player to
invoke.** Three instances, all found at stage 7 rather than stage 4:

| built | ⛔ missing |
|---|---|
| `bringForward` — choose who acts blow by blow | **there is no pick** |
| `provoke` — needs a target | **there is no way to name one** |
| named-ally intercept (`shared_weight` guards ONE ally) | **there is no way to say which** |

✅ **A spec is not done until it says how the player reaches it.** If the answer is *"they cannot yet"*,
that is a `§10` gap, not a silence. **`PLAYERS_GUIDE` PART I½ states all three to the player plainly, as
missing QUESTIONS rather than missing features** — learning by surprise is worse.

---

## §3 — ⚠️ A REACHABILITY SWEEP, AND A FINDING I ALMOST GOT WRONG

**There is no router and no screen variable in this app** — a screen calls the next one directly — so
*"is this reachable"* has exactly one mechanical answer: **does anything call it.**

**45 of 46 render functions have a caller. `renderFormStep` does not** — a complete working screen asking
*"What do they look like?"*.

⛔ **I nearly reported a broken feature.** `state.form` has **two other live authoring surfaces** (`c-form`
in creation, `p-form` in the prologue), is persisted onto the character, and is read in three places
including the portrait prompt. ✅ **The field is fine; the screen is superseded. Dark code, not a dead
feature** — the distinction `safe_delete.mjs` exists to make, and why its verdict is never *"delete"*.

---

## §4 — ✅ AEVI: YOUR PARTS X–XII TURNED A GATE RED, AND YOU CALLED IT

**You flagged it yourself — *"AWAITING gate now correctly red, CCode's to change."* That is the two-way
ratchet working exactly as designed, and it is fixed.**

⛔ **The replacement is not a deletion.** A gate that only watched for a placeholder is worth nothing once
the placeholder is gone. So:

- **A part is either WRITTEN or MARKED `AWAITING`** — and when one goes thin, the failure names *which*.
- ✅ **Every authored companion must be named in the guide**, derived from `content/packs/valley/companions`.
  **All nine are named; all nine carry a `downedEffect`.** ⚠️ **A tenth companion goes red until the guide
  mentions them.**

**And `docs/ARCS.md` landed with nothing pointing at it.** ⛔ **Every `.md` in `docs/` must now appear in
PIPELINE's table — a document nobody links is the same unread failure as a field nobody reads, one layer
up.**

---

## §5 — STATE, AND WHAT IS STILL YOURS

**`how_it_works` 171 → 183 assertions · 24 suites · no regression · v1.9.256, pushed.**
✅ **Every new load-bearing gate was proven able to go RED by breaking the thing it guards.**

⬜ **STILL WAITING ON YOU:** the `interceptCondition` blocks on `resonant_shield` / `harbor` — **I have not
built the intercept; your note says DO NOT BUILD UNTIL I HAVE** — the `names_of_power` ruling, and the 23
narrative `extend` axes.

⬜ **STILL WAITING ON ERIK:** whether the **target affordance** should be general (a craft declares
`needsTarget: "ally"|"foe"|"place"` and one surface asks once) — **that unblocks all three interface gaps
at once** — and whether the folded-casualty pool should scale with THREAT, since at a flat 6.0 **the
`downedEffect` authored on all nine companions still cannot fire.**

— CCode
