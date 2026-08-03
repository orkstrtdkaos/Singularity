# BRIEF — the world-simulation results, gathered for a decision
## Aevi (PO) · 2026-08-03 · Erik: "just gather all the info and we'll figure out if it's how we want it"
## Not a recommendation. Facts, and the choices they open.

## ⚠️ FIRST — A READING CORRECTION THAT CHANGES THE HEADLINE
The report says *"manifestation storm resists everyone — the valley has a problem no party can solve."*
**Checked the sign convention and the stage ladder: that is backwards.**
`dir: 1` DRIVES an arc; the storm's net push is **−41.9**, i.e. pushed DOWN. And its stage ladder starts at
**stage 1 = "First Bloom"** (*"a new domain has manifested where none was"*) rising to worse. **Stage 1 is the
LOWEST rung.**
**So the storm is not an unsolvable problem. It is a catastrophe the valley is SUCCESSFULLY HOLDING SHUT —
by 41 points, in every world, at every party size.**
That is a materially different fact, and it reframes the decision: **the question is not "should a party be
able to fix it?" but "should a party be able to LOSE it?"**

## THE STRUCTURAL FINDING UNDER EVERYTHING: NO HERO DRIVES ANY ARC
Measured across all 66 figures and all five arcs — drivers by alignment (hero/villain/neutral):
| arc | DRIVING it | OPPOSING it |
|---|---|---|
| manifestation_storm | **0** / 9 / 6 | 16 / 3 / 5 |
| what_wakes_beneath | **0** / 14 / 2 | 10 / 1 / 7 |
| the_poles_pull | **0** / 17 / 1 | 22 / 0 / 13 |
| block_bleed | **0** / 1 / 4 | 9 / 4 / 6 |
| green_schism | **0** / 1 / 0 | 2 / 0 / 0 |
**Not one hero, anywhere, wants any arc to advance.** Every arc is villains-and-neutrals pushing, heroes
holding. **This is why the no-player world is "stable and bleak": the heroes outnumber and outweigh the
villains on every front, so nothing moves — and nothing is supposed to.** The equilibrium is not a bug in the
engine. **It is the exact arithmetic consequence of how the 66 figures were authored, mine included.**
**AND IT IS THE REAL DECISION IN FRONT OF YOU**, because it means the world can only ever get *worse* through
player absence or player failure — never through anyone's ambition.

## WHAT THE RUNS ACTUALLY SHOW
**Without players (10 worlds × 1,080 days):** arcs land identically every time · 1.8 of 66 legends die · 0.8
wounded · 51.6 wants resolve. **The world is busy and goes nowhere.** People fight, get hurt, finish things —
and the map is unchanged. *"An equilibrium, not a destiny"* is exactly right.
**With players (24 worlds):** 1 player moves 1 arc (green schism — the thin one) · a party of 3 moves 4 of 5 ·
**effort maps to consequence, cleanly.** And *a lone player is contested MOST* (9 instances vs 5 at party of
six) — **being outnumbered is visible; being strong enough stops being a fight and becomes a fact.** That is a
good curve and I would not touch it.
**green_schism lands at 0.0 in every world** — which confirms the swing-zero diagnosis from the health
assessment. **It is not balanced; it is inert.** 3 figures, every care a want, nothing for attention to move.

## THE OPTIONS, WITH CONSEQUENCES — YOUR CALL, ALL FOUR
**1. THE STORM: leave it held, or let it be lost?**
· *Leave as is* — the valley has one catastrophe permanently suppressed by its own best people. **Thematically
strong**: the storm is what the Transition already did once, and 16 heroes standing on the lid is a good fact.
· *Make it losable* — requires either killing/removing anti-storm legends (the death rate is 1.8 per 1,080 days,
so attrition alone will not do it) **or giving the player a way to make it worse.** ⚠️ **Note this is already
possible in principle: a party that kills the wrong legend removes a hand from the lid.** That may be the most
interesting version — the storm is lost only by player error, never by villain success.
**2. THE HEROES DRIVE NOTHING — intended or not?**
· *Intended reading*: heroes preserve, villains change. Clean, and consistent with every authored `wants` line.
· *The cost*: no arc can improve. There is no "good" outcome, only holding. **A player cannot make the world
better on any of the five great arcs — only prevent it worsening.**
· *If you want an upward arc*, the fix is content and small: **give 2-3 heroes a `dir: 1` care on an arc where
advancement is GOOD** — e.g. `what_wakes_beneath` driven by `the_last_choirmistress`, whose want is literally
*"to meet the waking as revelation, and bring back a word from it."* **She currently opposes the very thing her
want describes.** That is arguably an authoring error of mine worth revisiting regardless of the design call.
**3. GREEN SCHISM: fix or retire?**
· *Fix* — 4-6 secondary cares from existing figures (already specced in `ASSESSMENT_world_arc_health.md`).
· *Retire* — accept it as a Deepwood-local matter that is not a world arc at all, and drop it to 4 arcs.
**Either is defensible; leaving it as a permanent 0.0 is not.**
**4. THE STAGE BUG — no decision needed, just noted as excellent.** `block bleed` read **stage 2.351351351**.
Fractional pushes had been leaking into discrete named rungs that content indexes by number, and it would have
reached a player as "Stage 2.35" and broken every rung-keyed lookup. **Push stays continuous, readout rounds.**
Worth recording *how* it was found: **not by reading code — by a range printing across six worlds with sixteen
decimals in one column.** That is an argument for range-printing as a standing diagnostic.

## THE ONE THING I WOULD FLAG AS NOT-A-CHOICE
**`the_last_choirmistress` opposing the waking is probably just wrong**, independent of any design decision.
Her authored want is *"to meet the waking as revelation."* I gave her `dir: -1`. **Same for
`the_apostate_choir`** (*"keep the faithful alive even after losing the faith"*) and possibly `the_edge_seeker`
(*"to reach the place past which there is no further"*). **Three figures whose wants point INTO an arc I have
them pushing against.** I would fix those regardless of what you decide about the rest.
