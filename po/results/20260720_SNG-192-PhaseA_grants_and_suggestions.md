# SNG-192 Phase A — Grants shown first, and suggestions with reasons

**CCode · 2026-07-20 · v1.8.177 · COMPLETE_PENDING_REVIEW · suite green by exit code (EXIT=0)**

Erik-directed first phase of the SNG-192 creation overhaul. Fixes the exact screenshot: the ability step
never showed the by-right starter kit, so a pick could be silently wasted; and 45 buttons for a choice of 2
is a wall, not a character moment.

---

## The decomposition (SNG-192 lacked one)

SNG-192 is 8 concerns; I split it into shippable phases and Erik chose **A** first:
- **A (this) — grants-first + suggestions.** The wasted-pick fix + the wall + suggestions with reasons.
- **B — robustness readouts.** Coverage gaps (`functionCoverage`), the power-source common-ground window
  (§6b, novel engine), braid framing (§6c). Where `gains` may wire.
- **C — archetype picker.** Load the orphaned `class_archetypes.json`; "pick sneaky/martial" front door.

## §8 answered from the code
- **Q1 (attributes final before abilities?):** Yes — the attribute step precedes `renderAbilityStep`, and
  the step recomputes on every entry, so `nativeGrantIdsFor` is safe there and a late attribute change is
  honoured.
- **Q2 (archetypes loader):** `class_archetypes.json` is genuinely unloaded — same orphan class as the
  lore/schools files; a one-line `loadRule` (Phase C).
- **Q3 (`prologue.tags` at render):** already on `state`, no threading needed.

## What shipped

- **§1 grants-first (the fix).** `renderAbilityStep` computes `nativeGrantIdsFor({domains, attributes})` at
  render and shows *"Yours by right of being an Ashwarden"* as a **non-spendable group**, and **excludes
  those crafts from the choosable pool** — a pick can no longer be wasted on a granted craft. The
  information was one function call away; it is now used at the moment of the choice, not silently at commit.
- **§3 suggestions with reasons.** `functions.js :: suggestForCreation` wraps the existing `recommendSkills`
  (coverage + native) with the signal that matters at creation: the **prologue** (`state.prologue.tags` — a
  *revealed* preference, the paths the player actually chose), plus a light, honest bio nudge. Every result
  carries a `why` drawn from the player's own input — *"you took the Seer path twice in your prologue"*,
  *"it echoes what you wrote about yourself"*. A suggestion without a reason is just a different wall, so
  reasonless crafts are dropped, not shown.
- **§2 fold-the-wall.** Suggested crafts are shown up top; the full per-tradition pool folds behind a
  `<details>`/`<summary>` — reachable in one click (§7.3), never 45 buttons in your face.

## Invariants held (§7)
- Nothing hidden that costs a choice — grants shown before picks (§1). ✓
- Every suggestion carries a reason from what the player did/wrote (§3). ✓
- Suggestions never restrict — the full pool is one click away (`<details>`). ✓
- Completable fast — accept nothing, open "see all", or just pick from the suggested list. ✓

## Verification
- **8 tests**: `suggestForCreation` reasons (prologue revealed-preference, bio nudge, fail-closed —
  no reasonless suggestions), and the ability-step wiring (grants computed + excluded, suggestions called
  with prologue+bio, pool folded). Full suite **EXIT=0**; wiring audit + ENGINE_MAP ok; ratchets flat;
  `suggestForCreation` is imported+called (no new-export orphan).
- **Browser:** boot hit the **known stale-module cache** — engine modules import bare (no `?v=`), so a
  long-lived preview tab serves a cached older `functions.js` against the version-busted `app.js` import,
  and the CCODE-08 watchdog fires (its *designed* cache-mismatch behaviour; a returning client clicks
  "Reload fresh" to self-heal). I **verified the served files are correct** (`functions.js` exports
  `suggestForCreation`; `app.js` has the import + grants code), isolating the boot failure to browser cache,
  not code. The creation-flow **visual** (grants group, suggestion reasons, folded pool) is Erik's
  real-save test on a fresh load — consistent with how every creation-flow change is verified.

## Boundaries / next
- **B and C** are the remaining phases (coverage/source-fit/braids; archetype picker). `gains` wiring is
  Phase B (and I still owe the verification that `gains` values are actually in the 24-verb vocabulary
  before building on it — a one-sample read so far).
- Phase A touches only `renderAbilityStep` + one pure engine function; it does not alter commit-time
  `applyNativeGrants` (grants still land at commit exactly as before — the step now just *shows* them first).

*— CCode. The kit you're already handed is on the table before you spend a pick, the 45-button wall is a
short list with reasons, and the reasons are drawn from what you actually did — not a different wall.*
