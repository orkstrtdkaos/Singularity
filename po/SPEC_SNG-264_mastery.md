# SPEC — SNG-264: mastery. Sharper, not bigger; a greater surge; and bounds that yield.
## Aevi (PO) · 2026-08-02 · Erik's answer to the §11 scaling-strength question

Erik: *"A master's kindle should be sharper, cleaner, more effective… but it's still kindle. Maybe their surge
of it would be greater. Plus a master can probably overcome the cannots."*

Three distinct mechanics, and the third is the strongest idea in the roll-math arc. Timing is good: the §11
wielder-scaling term is **not built yet** (`craftmechanics.js` has no wielder/level/uses input), so this shapes
it rather than revising it. The existing use-counter is `character.practice.uses` (practice.js).

## §1 — "sharper, cleaner, more effective… but it's still kindle" (the scaling term's SIZE)
GOAL: **mastery makes a craft RELIABLE, not BIG.** The scaling term is deliberately modest on the base
magnitude — a master's `kindle` is still a `1d6` craft. What mastery buys on the base is *quality*:
- **raise the FLOOR, not the ceiling** — the same shape as the shipped `marginFloorPer` (a decisive exchange
  raises the roll's floor without ever exceeding what the dice can give). A master's kindle rarely fizzles.
- fewer wasted uses, less collateral, cleaner execution — legible as "sharper and cleaner," not "+8 damage."
This preserves the tier ladder exactly as §11 required: a T-I craft stays *viable* forever because it stays
*reliable*, while a T-III still out-damages it because dice set the ceiling. **A master's kindle is a better
kindle. It is not a radiance.**

## §2 — "maybe their surge of it would be greater" (mastery scales the CEILING of intensity)
GOAL: **mastery raises what SURGE can reach, more than it raises the baseline.** So the growth curve of a
practised craft lives in its *top end*: a novice's surge is ×2; a master's surge reaches further (and, per §6,
in that craft's own terms — a mastered `prism_sight` surge sees deeper, a mastered `radiant_lance` surge cuts
through more).
WHY THIS IS THE RIGHT SHAPE: it makes mastery *situational power* rather than *constant power*. The master's
day-to-day kindle is merely clean; when they spend, they spend bigger than anyone else can. That is a much
better felt curve than a flat multiplier, and it gives the SNG-258 §CEILING "reserve" a second place to cash
out (alongside the crit dial).

## §3 — "a master can probably overcome the cannots" (the strongest idea; needs a per-craft audit)
GOAL: **sustained mastery ERODES a craft's stated limits.** The `cannot` text stops being a permanent wall and
becomes, for some bounds, *a wall for everyone who hasn't put in the years*. This is the best answer yet to
"how does a low-tier craft stay relevant at high level" — not by scaling damage, but by the master transcending
the craft's own limitations. It also makes the `cannot` text load-bearing rather than decorative, which was
§263's whole complaint.

### BUT: bounds are NOT uniform, and a blanket "mastery breaks cannots" would wreck the fiction
Auditing the two traditions authored so far, the bounds fall into three classes. **This classification is the
authoring work** — same discipline as intensity: per-craft, judged against the text.
- **SOFT (masterable) — a limit of SKILL.** These say "you aren't good enough yet."
  · `light_bending`: *"movement breaks it above a slow creep"* → a master moves faster while veiled.
  · `afterimage`: *"one breath of hang-time"*, *"bright even light needed"* → a master's ghost lasts longer,
    works in poorer light.
  · `clarity_lens`: *"wobbles if you're winded"*, *"arm's-reach focus only"* → steadier, further.
  · `radiant_lance`: *"one heartbeat of beam per breath"* → a master sustains the cut.
  · `dawn_surgery`: *"an hour's work costs you like a day's labour"* → the cost falls with mastery.
  · `prism_sight`: *"minutes of use cost hours of eye-ache"* → the ache recedes.
- **HARD (never breaks) — a limit of WHAT THE CRAFT IS.** Breaking these makes the craft a different craft, or
  breaks the world's rules. These must be flagged so no amount of practice touches them.
  · `sun_coax`: *"CANNOT CURE — only comfort and buy time."* A master still cannot cure. That is the craft.
  · `light_bending`: *"bent light still stops no arrow"*, *"your SHADOW STAYS TRUE"* — physics of the setting.
  · `prism_sight`: *"cannot identify WHO, only that"*, *"lie-reading is a HINT, not proof"* — it would become a
    truth machine, which the text explicitly refuses.
  · `sun_seal`: *"sealed by right means someone with the right can always open it"* — the seal's nature.
  · `the_last_light`: *"it cannot be half-given"* — and see §4.
  · `radiance`: *"reveals surfaces and shapes, NOT hearts."*
- **COST (transmutable, not removable) — the price stays but its FORM changes.** A master doesn't escape it;
  they carry it differently.
  · `kindle`: *"spent, it blinds you too"* → the master is dazzled, not blinded.
  · `beacon_thread`: *"YOU ARE THE LOOM — if you fall, every thread dies"* → stays true; a master might get a
    moment's warning rather than immunity.
  · `daybreak_mantle`: *"afterward you are the most identifiable person in the valley"* → unavoidable, but a
    master chooses WHEN it lands.

### GOAL for CCode
Each bound carries a **class** (`soft` / `hard` / `cost`) and, for soft bounds, **what mastery changes**. The
engine consults practice-level when a soft bound would apply. Hard bounds are never consulted — they are simply
true. The §5 CI check should require every authored bound to declare its class, so "can mastery break this?" is
never an unwritten judgement call at the table.

## §4 — this ANSWERS the open "REFUSED" question
Erik asked whether "REFUSED" is right for an intensity mode a craft's fiction forbids. **It is — and §3 gives
the reason it's principled rather than arbitrary:** `the_last_light`'s *"it cannot be half-given"* is a **HARD**
bound, not a soft one. No mastery reaches it. A craft that refuses conserve refuses it at every level of skill,
forever, because the refusal IS the craft. Same for `light_borne`'s *"you shine — no concealment"*: hard.
So "REFUSED" stands, and it now sits inside a general system rather than being a special case.

## What's whose
- **Erik:** the size of the §1 floor-raise and the §2 surge-ceiling growth (how much greater IS a master's
  surge?); and a sanity check on the three-class split — particularly whether any HARD bound above should
  actually be soft (he knows the fiction's intent better than the text alone can tell me).
- **CCode:** the wielder-scaling term (floor-raise, not ceiling-raise), mastery-scaled surge, the bound-class
  field + the practice-level consultation, and the CI requirement that bounds declare a class.
- **Aevi:** classify bounds for every craft as I author each tradition (blazeborn + radiant need a back-pass to
  add classes — they were authored before this decision), and continue the catalog.

## Why this is a good design (the honest assessment)
It solves the low-tier-relevance problem *without* the usual RPG fix of inflating numbers. A master's kindle
doesn't out-damage a novice's radiance — it just never fails them, surges harder when spent, and works in
conditions that stop everyone else. **That is what mastery actually feels like**, and it makes the craft's own
authored limits the thing you grow against. It also retroactively justifies the richness of the `cannot` text:
those lines are now the progression system's raw material.
