# SPEC — SNG-333: THE LEG IS A GAMBIT. Plus auto-populated fallbacks.
## Aevi (PO) · 2026-08-06 · Erik: "navigating a leg or passing through a dangerous area can include a gambit
## … you either play out of a failure or pass the way you intended."

## WHY THIS IS THE RIGHT FIT AND NOT A BOLT-ON
The gambit already is **an ordered plan of steps, each with an optional fallback, assessed before commitment,
with a weak link the experienced can see and an adaptation point to spend when it breaks.**
**That is a journey leg, described exactly.** A leg has an order, a visible risk, a point where it goes wrong,
and a choice about whether to press on or turn back. **Nothing needs inventing — the leg just needs to be
handed to `assessGambit` instead of to a dice roll.**

## THE LEG AS A GAMBIT
```
  LEG 2 — the Ford → the Wend        5 days · east-northeast · danger ⚠⚠
  ─────────────────────────────────────────────────────────────────────
  1  cross the Ford at the shallows          wayfinding      likely
  2  pass the Wend crossing unseen           shroud          ⚠ weak link
  3  make camp on the far bank               wildcraft       likely
  [ Set out ]   [ Revise ]   [ Go around — 7 days ]
```
- **each step is a craft the party actually has** — drawn from the 96 journey-claiming crafts
- **the weak link is visible at read-tier 2+**, exactly as in a normal gambit. ⚠️ **On the road that visibility
  IS `wayfinding` and `pattern_sense` doing their job** — the planning crafts pay off by showing you which
  step will break before you commit.
- **a failed step does not fail the journey.** It drops you into the scene the failure implies — the crossing
  is watched, the camp is found, the ford is higher than it was. **Erik: "you either play out of a failure or
  pass the way you intended."**

## ⚠️ AUTO-POPULATED FALLBACKS — the robustness Erik asked for
Today a fallback is a free-text field the player fills or leaves empty. **An empty fallback is the common case,
and it is why a broken gambit feels like a dead end.**
**Proposal: offer fallbacks the character can actually perform, ranked, and let the player accept or overwrite.**
Sources, in priority order:
1. **⚠️ ANOTHER CRAFT THAT ADDRESSES THE SAME CHALLENGE TYPE.** Step 2 is `shroud` (STEALTH) — the character
   also has `dim` and `blend_in`. **That is a real fallback the engine can name.**
2. **A different approach to the same obstacle** — the step's `operativeAxis` gives the alternative: if the
   planned step is stealth, offer the speed answer and the social answer if they hold one.
3. **The mundane version** — no craft at all. *"Ford it slowly and get wet."* **⚠️ THIS ONE MATTERS MOST: it
   guarantees every step has a fallback, so a gambit can never present a step with no way out.**
4. **The party** — a companion's `assistTags` matching the step.
**AND THE RULE THAT KEEPS IT HONEST: a suggested fallback must be something the character can actually do
right now** — craft known, energy available, no cooldown pending. **A suggestion the player cannot take is
worse than a blank field, because it reads as a plan.**

## WHAT THIS BRINGS INTO PLAY — and it is most of the catalog
- **planning crafts become the gambit's read** — `wayfinding`, `pattern_sense`, `way_sense` reveal steps and
  weak links
- **the nine flight crafts become STEP-SKIPPERS** — `the_stepped_span` removes an obstacle step outright;
  `the_borrowed_hour` skips the leg and everything on it; **`the_unlit_step` turns the whole leg into one
  stealth step**
- **provisioning crafts change the step COUNT** — `wildcraft` converts a camp step into a roofed one
- **and the road-safety crafts are fallbacks by nature** — `safe_ground`, `the_laid_ground`, `death_ward` are
  what you fall back TO
**⚠️ THAT IS THE PAYOFF: 96 crafts currently claim a travel challenge type the game rarely raises. A leg-gambit
raises it every single leg.**

## THE ONE DESIGN GUARD
**Not every leg should be a gambit.** A safe leg through known country is a line of prose and a day count.
**Gambit the leg when it earns it** — danger ≥ 2, an unknown stretch, a named figure on the road, or a player
who asks to plan. **If every leg is a gambit, the gambit stops meaning "this one is dangerous."**

## MINE TO AUTHOR
Step vocabulary per terrain and danger band · which crafts answer which step kind (the mapping is drafted in
`po/staged_content/journey_skills.json`) · the mundane-fallback lines, which are the ones that must never
sound like failure.
