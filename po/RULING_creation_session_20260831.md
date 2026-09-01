# RULING — Character Creation Session

**Ruled by:** Erik · **Date:** 2026-08-31
**Recorded by:** Aevi
**Spec:** `po/SPEC_starting_grants_and_creation_revamp.md`
**Closes:** OI-3, OI-7, OI-10, OI-13, OI-15 · **Partial:** OI-11

---

## R1 — Cross-class and tier cost structure (OI-10) ✅ RULED

**Tier prices** (replaces 1/2/3/4/5):

| tier | price |
|---|---|
| T1 | 1 |
| T2 | 2 |
| T3 | 2 |
| T4 | 3 |
| T5 | 3 |

**Distance cost: additive, not multiplicative.**
`learnPointCost = tierPrice + band` — band 0 (home) · 1 (near) · 2 (far/antipode)

| tier | home | near | far |
|---|---|---|---|
| T1 | 1 | 2 | 3 |
| T2 | 2 | 3 | 4 |
| T3 | 2 | 3 | 4 |
| T4 | 3 | 4 | 5 |
| T5 | 3 | 4 | 5 |

Far T5 drops from 15 → 5.

**Intent:** distance should make cross-domain learning meaningfully more expensive, not
prohibitive. A dedicated generalist should reach far-ring capstone mastery in late game. Two
natural investment steps (T1→T2, T3→T4). The `+1 levelReq` cross-training gate remains the
primary difficulty signal.

**CCode follow-up:** re-run the affordability table at L10/50/100 against the new prices —
average craft cost drops well below 2.511, which changes the points-bind curve and must be
re-measured before OI-11 insight-bonus curves are finalized. `crossClass.costMultiplier: 2`
in `skill_capacity.json` is superseded; note or remove it.

---

## R2 — Attribute allocation on all three creation paths (OI-13) ✅ RULED

**Finding:** `state.attrs` is mutated only inside quick-start's `draw()`. Describe and Play
never call it, so those characters keep `3/3/3/3` — and the argmax resolves a four-way tie to
mental, compounded by `byLean.mental` fallback. The mental bias lands twice on two of three
paths. That, not a weak mechanism, is why stat sensitivity does not bite.

**The ruling:** there is a **dedicated point allocation step** on every path. It may follow a
suggested allocation derived from the path's signals (prologue tags, domain choice, revealed
preference). The player can always change it before locking in.

- Suggested allocation is a starting position, never the final word
- The player explicitly confirms before the allocation locks
- Quick Start's current `draw()` becomes the suggestion seed rather than the final assignment
- Allocation must complete before the ability pick step on all three paths

---

## R3 — Sense slot at creation (OI-7) ✅ RULED

**At creation, the player makes a forced choice: one Tier-1 sense skill from the pool
available to their primary domain (any sect within that domain).**

Clarifications that corrected earlier framing:

- ⛔ **"Free" means free to OBTAIN at creation.** The sense craft costs energy to use like any
  other craft the character owns. Nothing is being zeroed. No energy costs change.
- ⛔ **Domain, not pole.** Under v2, a domain is the grouping above the poles. 14 domains,
  7 axes, 24 sects. A player draws from any sect in their primary domain.
- ⛔ **Not from origin location.** Starting location and sense choice are independent.
- ⛔ **There is no "Harmonic player."** Harmonic Heights is a location (a foothill of
  Enginecraft/Latticework in the medium of sound). A player with **Order** as primary domain
  can select `echo_sense` or `tremor_sense` regardless of where they start.

**Sense coverage — VERIFIED, no gap:** all 14 domains have at least one Tier-1 sense craft.
The earlier "6 missing poles" count was a pole-level view of a domain-level requirement.
Nothing needs authoring.

| domain | Tier-1 sense crafts available |
|---|---|
| Mind | `mind_read_folk` (cogitant) · `pattern_sense`, `the_true_figure` (figurist) |
| Body | `body_read` (somatic) · `sound_read`, `stone_read` (mason) |
| Light | `read_burn`, `lightsense` (blazeborn) · `the_plain_seeing` (verist) |
| Dark | `darksight`, `felt_room`, `known_in_the_dark` (umbral) · `see_the_made_thing` (veilwright) |
| Life | `lifesense` (rootkin) |
| Death | `deathsense` (ashwarden) |
| Angelic | `the_measuring_eye` (seraphic) |
| Demonic | `appetite_sense`, `the_read_hunger` (abyssal) |
| Breaking | `fault_sense` (unmaker) · `read_field`, `read_the_fight` (marcher) |
| Building | `makers_eye` (wright) · `read_the_room` (stillhold) |
| Chaos | `loose_thread`, `chaos_sense` (churnfolk) |
| Order | `ordered_record`, `order_sense` (lattice) · `mech_sense` (enginewright) |
| Span | `long_watch`, `kept_count`, `hour_sense` (hourkeeper) · `known_way`, `way_sense` (horizon) |
| Spirit | `numen_sense` (numinous) |

---

## R4 — Starting location (new creation element) ✅ RULED

The player chooses a starting location at creation. It must be **within one of their domains,
or a folk/crossing location.** Independent of the sense choice and of domain selection.

---

## R5 — `backlashRung` semantics (OI-15) ✅ RULED

**`backlashRung` raises the landed harm tier on a critical failure.** It is not a flat
penalty multiplier — `exhaustedPenalty` already covers generic "it hurts more."

`backlashRung: N` means a crit failure lands harm N rungs above the craft's own tier.
Most crafts are `backlashRung: 1`; a volatile craft may be 2.

**Worked examples:**
- A Marcher's Tier-3 violence craft with `backlashRung: 1` — crit fail lands a Tier-4 harm
  on the wielder. The blade meant to open someone opens them instead, deeper than the tier
  should produce.
- A Threnodist's Tier-2 grief craft with `backlashRung: 1` — crit fail floods the channeled
  grief back at Tier-3 intensity, one rung past what a Tier-2 misfire normally costs.

**Intent:** the craft's own nature turns against the wielder in a craft-specific way, not as
generic pain. This is why the field is per-craft rather than global.

**CCode build:** `applyBacklash` takes no ability — that is exactly why the field cannot fire.
One signature change plus two call sites. Now ruled; ready to build.

---

## R6 — Mental sub-attribute for bonus skill points (OI-11) ⚠️ PARTIAL — sub ruled, shape provisional

**Ruled:** the sub-attribute is **Insight.**

**Provisional shape (Erik: "for now — let's see what CCode says"):** milestone-based, not a
continuous curve. Milestones are explainable at creation and avoid banking fractional points.

| Insight rank | bonus | skill points / level |
|---|---|---|
| 1–6 | — | 2 |
| 7 | +1 | 3 |
| 14 | +1 more | 4 |

**Why 7 and 14:** Insight already wires `senseTier` at ranks 4 and 10. Ranks 7, 14, 18, and 20
are narrative-only with no mechanical effect. 7 and 14 are the two whose existing milestone text
is already about integrating more — rank 7 *"You read WHY, not only how much"*; rank 14 *"You see
the shape of a thing before it has finished becoming it."* Ranks 18 and 20 stay narrative
(certainty, not acquisition).

**CCode to model before this locks:**
1. Re-run the affordability table at L10/50/100 against the **R1 tier prices** (average craft
   cost drops well below the previously-measured 2.511, which shifts the whole points-bind curve).
2. Then layer Insight 7 and Insight 14 on top. Show total skill points and affordable crafts vs.
   the breadth cap at each level.
3. **The specific question:** does a high-Insight late-game character ever hit the breadth cap?
   CCode's ROUND 2 found points bind in every band at every level and called the cap decorative.
   If R1 prices plus Insight bonuses make the cap bind for the first time, that is a real change
   in what the cap means and Erik should see it before the numbers lock.

---

## R7 — Novel use: energy cost and crit band, not success penalty (OI-3) ✅ RULED

**The problem with the existing milestones:** Wits 4 and Wits 10 promise relief from an
untried-action penalty that does not exist in the engine. Building the penalty so the milestone
can remove it would make the game worse. But the underlying design question was real: should
using a craft against its grain cost anything?

**The ruling: yes — in energy and in crit-failure risk, never in success chance.**

Your odds are your odds. Working against the grain shows up as effort and as risk, which is
what actually happens when a tool is used for something it was not shaped for. A player can
always try the clever thing; it burns them down faster and fails worse when it fails.

### Stretch tiers — the penalty scales to the STRETCH, not to the character

| stretch | definition | example | energy | crit band |
|---|---|---|---|---|
| **Adjacent** | outside declared `functions`, within the spirit | `body_read` to judge a bluff | +10% | unchanged |
| **Real** | outside what the craft does | `body_read` to check if a wall is load-bearing | +25% | slightly wider |
| **Against `notFor`** | explicitly what the craft is not for | `body_read` to read thoughts | +50% | notably wider |

⚠️ **This scaling is the fix for the low-level weighting problem.** A flat novel-use penalty
lands hardest on characters with four crafts and no energy pool — exactly the players who must
improvise. Scaling to stretch means a level-1 character doing something small and clever pays
almost nothing, while anyone reaching past an explicit `notFor` pays regardless of level. The
tax is on the stretch, not on being new. Most level-1 improvisation is adjacent-stretch, so
early play gets the encouraging version by default.

### Wits reduces the surcharge and narrows the band

| Wits rank | effect on novel use |
|---|---|
| 1–3 | full surcharge, full crit band |
| 4 | surcharge halved, band narrowed |
| 10 | no surcharge — novel use costs the same as intended use |
| 14 | −25% — the unplanned answer comes cheaper than the planned one |

Ranks 18 and 20 stay narrative (same pattern as Insight).

**Milestone prose at Wits 4 and 10 must be rewritten** — from "relief from the untried-action
penalty" to the surcharge/band language above. `milestoneEffects.blocked` on both can be cleared.

### Interaction with the zero-energy floor (R-prior, 2026-08-23)

A drained character cannot afford novel use — they are down to rank-1 crafts doing what those
crafts do. Too tired to be clever. This falls out of the mechanics rather than being authored.

### `notFor` becomes load-bearing

`notFor` is authored on every craft but is currently prose. Making it the top stretch tier makes
it a mechanical field for the first time. ⚠️ **Authoring pass needed:** audit `notFor` lines for
consistency — some are hard limits, others are flavor. Not a blocker; the tiers work on GM
judgment in the interim.

### GM offers, and the gear panel

- **The GM may offer novel uses as options occasionally.** This is what turns the mechanic from
  a tax into an invitation — a player who never thought to use `body_read` on a wall will try it
  after the GM offers once. The system teaches itself through play.
- **Stretch belongs in the gear-shaped configure button**, same surface as conserve and surge.
- ⚠️ **Stretch and intensity are ORTHOGONAL, not a third mutually-exclusive option.** Conserve-
  stretch (a cautious attempt at something odd) and surge-stretch (throwing everything at a thing
  the craft was never for) are genuinely different moments. The panel must let both exist.

### Open implementation question for CCode

Does the engine flag novel use, or does the GM declare it? Aevi's read: GM-declared, with
`notFor` and `functions` as the reference — the engine cannot know that reading a wall with
`body_read` is a stretch, but a GM reading `notFor` can. Ask whether a cleaner hook exists.

---

## Still open

| OI | item | held on |
|---|---|---|
| OI-11 | Bonus skill points — sub RULED (Insight). Milestone shape provisional pending CCode curves | CCode model, then Erik confirm |
| OI-5 | Minted NPC baseline kit repurpose | Erik |
