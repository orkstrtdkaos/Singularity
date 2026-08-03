# ASSESSMENT — do the world-arc outcomes make sense, or do they need balancing?
## Aevi (PO) · 2026-08-03 · measured from live content, not estimated

**Short answer: four of five arcs are healthy and the ranges make sense. ONE arc is broken, and it is not the
one that looks broken. It is `green_schism` — and it is my fault, not the engine's.**

## THE SIM RESULT THAT LOOKED WRONG, AND WHY IT IS RIGHT
CCode's five-seed run: `block_bleed −6.3 … +5` (flips), `manifestation_storm −47.1 … −40.5` (locked),
`what_wakes_beneath 8.7 … 12.9` (locked).
A static weight count of the live content says the opposite — `block_bleed` is the MOST lopsided arc
(for 5 figures / weight 7, against 19 / weight 29, **net −22**). By that measure it should be the *least*
likely to flip. **It flips anyway, and the reason is the whole point of attention:**
| arc | quiet-world net (WANT only) | full net (all cares) | **swing available** |
|---|---|---|---|
| green_schism | −1 | −1 | **0** |
| the_poles_pull | −8 | −10 | 2 |
| what_wakes_beneath | +3 | +6 | 3 |
| manifestation_storm | −6 | −15 | 9 |
| **block_bleed** | **−4** | **−22** | **18** |
**`block_bleed`'s −22 is almost entirely SECONDARY cares.** Only 8 figures *want* it; the other 17 pick it up
only when it catches fire. **So its resting state is −4, not −22 — and 18 points of push only arrive if the arc
gets urgent enough to pull people off their wants.** That is a genuine knife-edge: quiet, it drifts one way;
loud, it gets swamped. **CCode's prediction that the 4-vs-4 arc would be the one to flip came true for a
reason neither static analysis nor intuition would have given.** The chain is behaving as designed.
**So: `block_bleed` needs no balancing. It is the healthiest arc in the game.**

## THE ONE THAT IS ACTUALLY BROKEN: `green_schism`
**3 figures. Total weight 7. Swing available: ZERO.**
· for: `thornmother_sealed` (w2) · against: `the_last_walker` (w1), `the_first_moot` (w1)
**Every care on this arc is a WANT.** Nobody holds it as a secondary, so **attention never moves it** — no one
ever abandons it, and no one ever rushes to it. It resolves as the same near-tie every world, forever.
And it is worse than static: **`the_last_walker` now holds THREE cares** (I gave her the poles and the storm,
because her want is *"refuses to choose"*). So under a budget of 1 **she frequently isn't there at all** — and
the arc's only serious defender is `the_first_moot` at weight 1 against a weight-2 opponent.
**⚠️ THIS IS MY AUTHORING ERROR, NOT AN ENGINE PROBLEM.** I gave 62 figures second cares derived from their
wants, and *the Green Schism is a Deepwood-internal argument that almost nobody outside the wood has an opinion
about.* Deriving honestly produced an arc nobody watches. **Honest derivation can still produce a dead system.**

## RECOMMENDATION — three fixes, smallest first
1. **GIVE `green_schism` FOUR TO SIX SECONDARY CARES.** Not new NPCs — **existing figures who would plausibly
   care once it is loud.** Derivable, same discipline as before:
   · `neth_the_stayed` (ashwarden, *"no one dies unattended"*) → **against** sealing: a sealed wood means deaths
     she cannot reach.
   · `iselde_the_wanderer` (*"keep the far places connected"*) → **against**: a sealed wood is a severed road.
   · `the_cornerstone` (*"something solid to stand on"*) → **for**: he would read sealing as the wood choosing
     a stable answer.
   · `thornmother_sealed` already drives it; add `the_starless` (umbral, *"a dark so total nothing is seen"*)
     → **for**: a sealed wood is a place light does not reach.
   · `the_edge_that_holds` (marcher, *"the edge that protects"*) → **against**: sealing is a wall he does not
     trust.
   **That gives the arc a resting state AND a swing — the same shape that makes block_bleed work.**
2. **`manifestation_storm` at −47 to −40 is LOCKED and should stay locked** — with one caveat. Its swing is 9,
   so it *can* move, but never across zero. **That is correct**: the storm is a world-condition the Valley
   collectively resists, and a world where the anti-storm coalition randomly loses would contradict every
   tradition's stated position. **Leave it. Not every arc should be a coin-flip.**
3. **`the_poles_pull` swing is only 2** — the flattest of the big arcs, because 34 of 66 figures WANT it.
   That is right thematically (it is the ring's own arc, everyone lives on it) but it means **it barely
   responds to events.** Low priority; if it ever needs loosening, the fix is giving a few pole-figures a
   secondary care elsewhere so they can be pulled AWAY.

## THE HONEST BOTTOM LINE
**The engine does not need balancing. The content does, in exactly one place.** And the diagnostic that found
it is worth keeping: **an arc's health is not its net weight — it is the gap between its QUIET net and its FULL
net.** Zero gap means nobody's attention is ever in play, and the arc is decorative.
**`green_schism` swing 0 · `block_bleed` swing 18.** One of those is a world event; the other is a number that
never moves.
