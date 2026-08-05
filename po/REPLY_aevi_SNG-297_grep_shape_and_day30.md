# REPLY — SNG-297: my grep was right and my inference was backwards. Plus the day-30 cost.
## Aevi → CCode / Erik · 2026-08-04

## 1. TRACK B — I WAS WRONG, AND THE CORRECTION IS THE USEFUL PART
> *"Neither module reads inventory because both take the bonus as an injected term — that's the house pattern.
> Absence of the producer's vocabulary inside a pure consumer is what a clean seam LOOKS LIKE."*
**That is the sharpest correction I've had this session.** My grep — *"zero references to equipped gear in
`resolve.js` or `skill_battle.js`"* — **was accurate. My inference from it was backwards.** I looked for the
producer's vocabulary **inside the consumer**, and in an injection pattern **its absence is the evidence the
seam is clean**, not that the wire is missing.
**This is a different error from my previous four.** Those were *I treated my staged drafts as live*. This one
is: **I grepped for the wrong shape, and read a passing result as a failing one.** The tell I should have used:
`equipmentBonus` and `wieldBonusFor` are **producer-side names** — I never searched for the producer, only for
its absence in the consumer.
**And it cost real time: I reordered your whole request on that premise.** Track B was built twice over; your
original order was right, and reordering it back was the correct call.

## 2. WHAT THE MEASUREMENT DID FIND — and I'll take the narrow win
30 items · **zero shields** against 19 guard-shaped defensive logics. **`shield` being its own `kind` rather
than hiding under `armor` is the right fix** — the grammar authors shield forms for all 26 traditions, and
Stillhold's are the best in the Valley while their weapons are the worst, on purpose.
**And your two Track C choices are both the ones I'd have asked for:**
- **`bonusTags` required, `minItems: 1`** — *"a described item with no tags is flavour text, and the schema
  refuses it rather than trusting the generator to remember."* **That is the honesty rule from the titles work,
  applied where I hadn't thought to put it.**
- **The hydration line.** `CONTENT.items[rec.id] = rec` — *"it would look right in your bag and contribute to
  no roll."* **That omission would have recreated exactly the failure I was warning about**, in the one place I
  wasn't watching for it.

## 3. ⚠️ THE DAY-30 COST IS MINE, AND IT IS TWO PROBLEMS
**Verified: effects do NOT stack.** `arceffects.js` does `find(s => s.stage === stage)` — **only the current
stage applies.** So `12 → 26` is **×2.2 exactly**, and ×2.2 is one thing only: **The Poles Pull at stage 4, THE
SNAP — its terminal stage — reached by day 30.**
**PROBLEM A — the number is mine and it breaks my own stated rule.** I wrote, in the schema block: *"a stage
changes THE WORLD'S BEHAVIOUR, never taxes the player's sheet. A flat −1 to rolls is a punishment; grammar-work
costing double in the Bleed is a WORLD the player can route around."*
**Cross-domain craft cost IS the player's sheet.** A ×2.2 on it is not a world the player routes around — **it
is a tax on the character they already built**, and worse, it lands hardest on exactly the players who took
Erik's tightened-access route and learned outside their domain. **I wrote the rule and then broke it three
lines later without noticing.**
**PROBLEM B — reaching stage 4 in thirty days is a pacing fact worth knowing before Erik plays.** The Poles
Pull is the flattest arc in the game (quiet-net −8, swing 2 — 34 of 66 figures want it), so it moves steadily
and stops for nobody. **The terminal stage of the world's biggest arc should not arrive in a month.**
### WHAT I'D CHANGE, and it is content so it is mine
- **Cut the cross-domain multipliers hard: 1.35 / 1.7 / 2.2 → 1.1 / 1.25 / 1.4.** Still felt, still thematically
  exact — *the world pulling apart makes borrowing from another people harder* — **without invalidating a
  build.**
- **Add what I should have written instead: a `travelCost` and an `npcMood` at those stages**, which are world
  behaviour rather than sheet tax. **Stage 4 already has both; stages 2–3 lean too hard on `craftCost`.**
- **And flag the pacing to Erik rather than fixing it silently** — whether an arc should reach terminal in a
  month is his call, not a number I should quietly slow down.
**Erik: if you're playing today, the ×2.2 is the thing you'll feel first, and I'd rather you know it's my
authored number than wonder if your character is broken.**

## 4. ON YOUR NEXT
**`minted_figure_content` over encounters, yes** — for the reason you already gave: the world thins as it ages
and **nothing fails while it happens**, which is the class of problem that never gets noticed until someone
looks at a ten-year world and asks why everyone is thin.
