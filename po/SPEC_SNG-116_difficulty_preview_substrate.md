# SPEC — SNG-116: "How hard is this" preview omits the substrate penalty (readout lies before you act)
## Aevi (PO) · 2026-07-15 · authored to spec · **awaiting CCode ROUND 2**

> **One line.** The pre-action difficulty readout ("this feels doable") is computed by a `successChance` call that **does not pass `substratePenalty`** — so it assumes the lattice is full. When substrate is actually thin, the preview says "easy," then the real resolution applies the penalty and the action is hard. The readout isn't mis-worded — it's fed a chance that's missing a term.

> **Verified at HEAD `v1.8.73`.** Preview path `app.js` L5117–5118:
> ```js
> const chance = successChance({ character, action, location, rules, aptitudeMods: mods, equipmentBonus: ... }); // no substratePenalty
> const sense  = senseAction({ ... }, chance); // renders "how hard" from this chance
> ```
> `successChance` (`resolve.js` L21) reads `substratePenalty = 0` by default and (L71) subtracts it when present. The **real** resolution computes it — `substrateForAction(choice, location)` → `resolveAction` (L2777, L2843) applies the SNG-090 penalty. **The preview omits that computation entirely**, so `trueChance` in the readout is the no-substrate-penalty chance. `renderSense` then honestly reports a number that's too high. Erik's live report: readout said easy; lack of substrate made it hard. Confirmed: **the readout is honest about a wrong number.**

## THE FIX
Make the preview compute and pass the **same** `substratePenalty` the real resolution uses, so the "how hard" readout reflects substrate reality:
```js
const substrate = usesAbility ? substrateForAction(action, location) : null;
const subPenalty = substrate ? substratePenaltyFrom(substrate) : 0; // same derivation as resolve path
const chance = successChance({ character, action, location, rules, aptitudeMods: mods, equipmentBonus: ..., substratePenalty: subPenalty });
const sense  = senseAction({ ... }, chance);
```
The preview must mirror the resolve path's substrate derivation exactly (single source of truth — factor the "substrate → penalty" step into one function both call, so they can't drift). After this, "how hard is this" includes the lattice, and the readout that said "easy" on thin substrate will correctly say "risky."

**Tie-in to the fog doctrine (SNG-098/sense.js):** this is NOT a fog issue — fog gates *how much* of the true chance you perceive (tier), and that's working. This bug is that the *true chance itself* was computed wrong for the preview (missing a term). Fog over a wrong number is still wrong. The true chance must be complete first; then the tier gates perception of it.

## ENGINE / UI SURFACES
| Module | Change |
|---|---|
| `app.js` (preview, ~L5117) | Compute `substratePenalty` for the previewed action (mirroring the resolve path) and pass it into the preview `successChance`. |
| `engine/resolve.js` or `engine/substrate.js` | Factor the "substrate state → penalty value" derivation into ONE exported function used by BOTH the preview and `resolveAction`, so the preview and the real roll can never disagree. |
| `tests/*` | On thin/starved substrate, the preview `chance` equals the resolved `chance` (same substrate term); the readout drops a band accordingly; on full substrate, preview == resolve as before (no regression). |

## GUARDS
- **Preview must equal resolve** for the same action/state — a test asserts the previewed `chance` matches the resolved `chance` including substrate. This is the anti-drift guarantee; it's the whole point.
- Don't double-apply — the penalty is computed once, in the shared function; preview and resolve each call it, neither adds its own.
- Fog/tier behavior unchanged — this fixes the number, not the perception gate over it.

## OPEN QUESTIONS — CCODE ROUND 2
1. Where does the resolve path turn a `substrateForAction` result into the numeric `substratePenalty` it passes to `resolveAction`? Factor exactly that into the shared function (don't reimplement it in the preview).
2. Are there OTHER preview/estimate call sites (gambit step previews, the `stdChance` at L2768) that also call `successChance` without `substratePenalty` and would mislead the same way? Fix all in this pass.
