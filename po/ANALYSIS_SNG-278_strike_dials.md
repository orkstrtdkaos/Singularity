# ANALYSIS — SNG-278: the strike dials. CCode asked and this is the derivation, not a guess.
## Aevi (PO) · 2026-08-04 · CCode: "it is too lethal at my default and I am not tuning it alone."

## FIRST — CCODE-121 IS THE BEST RESULT OF THIS WHOLE CHAIN
`HEROIC MORTALITY 0.5% → 8.6%`, a **17-fold** rise from safest rung to properly at risk. And **291 of 481
strikes intercepted by a guard (38%)** — *"38% of strikes stopped by someone who chose to stand still"* is
exactly the mechanic worth having. **The design works.** What follows is only about the dial.

## ⚠️ A CORRECTION TO MY OWN FIRST PASS
My first calculation said 0.12 leaves *"one legend in twelve reaching mythic."* **That was wrong.** The real
figure is **42% of legendaries survive the 8 years to mythic** — which is *inside* a healthy band, not outside
it. **The lethality is not the problem.** I'm recording the error because the corrected number changes the
recommendation.

## THE REAL CONSTRAINT: CCODE MEASURED A ROSTER WITH NO INFLOW
Deaths per 3-year world at `strikeRate 0.12`, on the **live** pyramid (11 legendary / 27 epic / 28 heroic):
| tier | figures | rate | deaths/3yr |
|---|---|---|---|
| legendary | 11 | 27.8% | 3.1 |
| epic | 27 | 6.3% | 1.7 |
| heroic | 28 | 8.6% | 2.4 |
| **total** | **66** | | **7.2 per 3 years = 2.39 per world-year** |
**To hold the pyramid steady, minting must produce ≥ 2.39 new figures per world-year at the bottom, and
promotion must lift them on the 2/4/8-year ladder.**
**⚠️ NEITHER IS BUILT.** Verified: **no `.tier` assignment at runtime, and no `figures.push` anywhere.** So
today **every one of those deaths is permanent** — the roster loses **~24 figures per decade with zero
replacement.**

## SO THE DIAL HAS TWO ANSWERS, AND WHICH ONE IS RIGHT DEPENDS ON BUILD ORDER
**A) TODAY, with no inflow → `strikeRate` 0.03–0.05.**
Anything above ~0.04 is a slow-motion extinction: the top of the ladder empties and nothing replaces it. Not
because the mechanic is wrong — **because it is a predator in a world with no births.**
**B) WITH minting + promotion → CCode's 0.10–0.12 is RIGHT and I'd leave it alone.**
Legendary mortality is high *on purpose*, ~half of legends reach mythic, and **every death opens a seat
somebody climbs into.** That is precisely the world Erik asked for: *"the ones that stay the longest are the
true legends."* **A legend who cannot die cannot have earned it.**
**⚠️ THEREFORE THE DIAL IS NOT INDEPENDENTLY TUNABLE. Setting it now means picking a number for a world that is
about to change underneath it.**

## MY RECOMMENDATION TO ERIK — one dial, one sequence
1. **Set `strikeRate` to 0.04 now** — the mechanic stays live and visible, heroes stop being the safest people
   in the valley (~2.9% vs 0.5%), and nothing empties.
2. **Build minting** (`po/ASSESSMENT_npc_progression.md`) — the prerequisite, and the birth events already
   exist: `arcCasualties`, `arcVacancies`, deeds that `spread`, and the arena circuit.
3. **Then raise to 0.10–0.12 and re-run.** The test of done is the one I'd want anyway: **roster roughly
   stable, several figures at a tier they didn't start at, and one mythic in some worlds and not others.**
**`guardInterceptChance` 0.45 I would NOT change.** 38% of strikes stopped is a guard that matters without
being a wall — and if `strikeRate` drops to 0.04, intercepts get rarer in absolute terms anyway, which is
self-correcting.

## AND ONE THING WORTH RECORDING FROM CCODE'S OWN NOTE
`arc_response.json` **did not exist until 2026-08-04**, while the engine had read `rules.arcResponse` for
weeks — *"a reader with no writer… the fourth door of the PromisedButUnread family."* **That is the third
instance of this exact class this week** (the encounters XP table, the background id lookup, this). The
pattern is always the same: **code reads a key; nobody authored it; the fallback is plausible enough that
nothing looks broken.** `promise_sweep` catching it is the right answer — **worth making sure it runs on
every rules key an engine module reads, not only the ones someone remembered to register.**
