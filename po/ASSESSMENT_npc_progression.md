# ASSESSMENT — is NPC progression sound? (Erik: "you should be seeing new NPCs growing all the way up")
## Aevi (PO) · 2026-08-03 · measured against the live code

## SHORT ANSWER: NO. NOTHING PROMOTES, AND THE ROSTER CANNOT GROW.
Erik's expectation is the right one and **the machinery for it does not exist yet.** Three separate gaps, and
they must be built in order.

## GAP 1 — TIER IS NEVER WRITTEN AT RUNTIME
Searched every assignment to `.tier` in `worldtick.js` and `legends.js`: **there is none.** `tierRank` and
`tierFor` are READ constantly; **nothing ever sets a figure's tier.** A figure begins and ends a 1,080-day
simulation at the tier I authored into the JSON.
**⚠️ AND A NAMING TRAP THAT COULD COST SOMEONE AN AFTERNOON:** `worldtick.js` is full of the word *promote* —
`promotionCandidates`, `promoteInto`, `promotedWorldDay`, `canonTier`. **That is CANON promotion** (a locally
generated entity becoming shared world-truth across players) **and has nothing whatsoever to do with power
tier.** Two unrelated systems, one word. Worth renaming one of them before somebody wires the wrong thing.

## GAP 2 — THE ROSTER NEVER GROWS
No `figures.push`, no `epics.push`, no minting into the legend roster anywhere. **The world has exactly the 66
figures I authored, forever.** So:
- **1.8 legends die per 1,080 days** (CCode's measurement) with **no replacement**.
- Over a long campaign the roster only shrinks. **A world simulated long enough empties out.**
- **And the tier pyramid I just built decays**: deaths concentrate wherever the tier-gap mechanic bites, so the
  shape degrades in exactly the way the re-tier was meant to fix.

## GAP 3 — THERE IS NO BOTTOM TO PROMOTE *FROM*
Even with promotion built, the ladder starts at **heroic (28 figures)**. `notable` and `riffraff` are **empty**.
So promotion would only ever move existing named figures upward — **there is no inflow.** The pyramid needs a
base, and the base has to be *minted*, not authored: I can write 30 more figures, but that just moves the
problem to a bigger fixed number.

## WHAT SOUND PROGRESSION NEEDS — three pieces, in dependency order
**1. MINTING AT THE BOTTOM (prerequisite for everything else).**
New figures enter at `riffraff`/`notable` from things the world already produces: a survivor of a casualty
event · a member of a faction that just lost its leader · **the arena circuit** (Erik's item 27 — a fighter who
accumulates wins is *exactly* a minted `notable`) · a player's own ally who gets noticed. **The sim already
records `arcCasualties`, `arcVacancies` and deeds that `spread` — those are the birth events.**
**2. PROMOTION BY DURATION AND DEED** (specced in `tier_ladder_v2.json`, not built).
Erik's own rule: *"the ones that stay the longest are the true legends."* Rise on **survival + arc contribution
+ contests won**. `reputation.js` already tracks deeds with `weight` and `spread`; **the inputs exist.**
**3. DEMOTION AND RETIREMENT.** A wounded figure who abandons every front falls a rung. Figures who lose their
want, or whose arc resolves, should be able to leave the board **without dying** — otherwise the only exit is
death and the roster becomes a body count.

## THE TEST OF SOUND PROGRESSION (what a good sim run should show)
After 10 world-years, a healthy world should report:
- **roster size roughly stable** (minting ≈ deaths), not monotonically shrinking
- **at least a few figures at a tier they did not start at** — and their names should differ per seed
- **the pyramid shape preserved**: still many heroic, few legendary
- **and ideally one mythic somewhere, in some worlds and not others.** ⚠️ **That is the single clearest signal
  the system works** — a rung that is empty at world-start and occupied by someone the world *made*.

## MY READ ON SEQUENCING
**Minting first, and it is not close.** Promotion without inflow just re-sorts a shrinking fixed cast; minting
without promotion at least keeps the world populated. **Built in the wrong order, promotion looks like it works
for about two world-years and then quietly runs out of people.**
