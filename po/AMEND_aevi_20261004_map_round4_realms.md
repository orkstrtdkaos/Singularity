<!-- status: READY except one ruling marked ⬜ ERIK (the reach curve). R4.3 ruled 2026-10-04: neutral unless they clash. Amends WORKORDER_aevi_20261004_map_round2 (B2, B5, B6): the map reads the LIVE world (losses, growth, broken powers, taken holds, held gates, standing); a player's holds and bands are a realm with ground of their own; the watch is what carries it out along the roads; and Both draws the nanite -->
# AMENDMENT: Aevi → CCode · 2026-10-04 · round 4: the map reads the world as it is now, and the player holds ground too

**Aevi (PO).** Erik, today:

> *"Make sure changes to power sources and local lords and powers are able to be reflected in the map. I want to see how
> far the band of the Fell Pell's holds provide influence in their local areas. This is the reason we had decided the
> watch and patrolling were more than just seeing a raid. Plus territory should grow with influence and army size that is
> able to exert that influence."*

And earlier: *"Nanite isn't showing up when the Both button is clicked."*

B2 is good work, and the far-anchor clamp catch is exactly the kind of thing the map was supposed to flush out. This
amends B2, B5 and B6. Every number below comes from the mock running your painter copy against Silas's and Loki's save
(`player-s9z9u1`). The canvas has a new board: **"The Fellowship's ground (round 4)"**.

---

## R4.0 · B6: Both draws the nanite

Both = territory borders and a light fill, lattice and veil lines, **the wild stipple and the ordered stipple (B4's,
unchanged)**, and every source. My work order left the nanite out of Both's list, so the Both lens has no dots. The fault
is mine. The Main and Compare boards now show it.

## R4.1 · The map reads the live world, not the authored record

`influence.js` reads `p.strength.contingents`, which is the **authored** strength. Everything that has happened in play
lives on the save (`powers.js`, "it lives on the SAVE, not on the record"), so today a power the player has bled, grown or
broken looks the same on the map as it did on day one. The rule: **the caller hands `makeInfluence` / `territoryByGround`
powers as they stand for this character**, the way `contingentsOf` already resolves them for the raid. The evaluator
stays pure and imports nothing.

| what happened in play | where it lives | what the map does |
|---|---|---|
| a power lost people, or grew (`lost`, `grownHeads`) | `contingentsOf(power, character)` | radius from **those** heads |
| a power is broken | `isStanding(character, power) === false` | holds no ground (its reach is drawn as nothing; the Today lens may keep a *"broken"* ghost mark at the seat) |
| a hold changed hands (`holdsTaken`) | `powerState[id].holdsTaken` | that hold is **no longer the power's anchor**; it is the player's (R4.2) |
| a garrison ground down (`holdLost`) | `powerState[id].holdLost` | that hold's anchor weighs what is left of its garrison (an emptied hold is the empty weight, 0.3) |
| a gate seized (`gateHeld`) | `gateHeldByPower(power, character)`, `gatesHeldBy(character)` | the gate's place becomes a **hold anchor** of whoever holds it |
| what a power thinks of you (`standing`) | `powerState[id].standing` | ally or rival (R4.3) |
| the field moved: a hold's pool or sink, an arc's source | `holdingFieldDelta` (every hold's, per SNG-667 §8.2), the arc's source changes | the Field lens draws the **same field the craft card reads**: one field, one number |

⚠️ **Cache key.** The territory grid is cached per region. Its key gains a cheap state stamp (the sum of heads in view,
the taken/broken/held ids, the realm's holds and watch counts), so the picture changes on the turn the world does and
not a session later.

## R4.2 · A player's holds and bands are a realm

`realmsOf(character, locations, cfg)` → territorial powers, one per character with holds. Same evaluator, same rule as
every lord in the world: no special case for players, which is what *"territory should grow with … army size"* asks for.

- **Anchors** are the character's holdings at their `locationId`.
- **Heads at a hold** = the band contingents raised there (a contingent's `from` is the hold id; the save already says
  *"raised at Stillwater's Trouble"*) + garrison people not already in a band.
- **The army reaches from home.** The band's home hold (`band.from`) is the **seat** and reaches with the **whole band**:
  it can march from there. Every other hold reaches with the hands that are there.
- **The watch is the reach.** Eyes at a hold = `watchOf(holding).length` (garrison, hands on the watch, `watch: true`
  features) + `sense` features it does not already count (the tower). Each hold's radius × **(1 + 0.15 per
  watcher)**, capped ×1.6.
- **Walking the bounds is real now.** A realm that keeps any watch walks its own roads at **0.6** of the cost (B3's
  routed road cells), so its ground runs out along them. That is the *"eyes on the road"* your CCODE-568 note said
  nothing implemented. Patrolling merged into the watch (step 94), and the watch now carries the hold's ground out along
  its roads, which is how it does more than see a raid. (The road-danger ease you sketched then is the natural next
  consequence: held road, safer road. Not in this order.)
- **Weights**: seat 1.0 · a hold with heads or eyes 0.8 · an empty hold 0.3 (its own doorstep).
- Kind `lordship` for the evaluator; drawn with the realm's name and *"your realm"* beneath, and a small keep at each hold.

**Measured (Silas, the Fellowship of the Fell Pell, 33):**

| hold | heads | eyes | reach (days) |
|---|---|---|---|
| The Fell Pell (home, Millbrook) | 33 | 1 | **6.3** |
| The Made Gate | 4 | 2 (Bryn, the ward-line) | 1.8 |
| Whistling Woman Post | 4 | 1 | 1.6 |
| Stillwater's Trouble (Palelands) | 11 | 5 | 4.2 |
| Threshold Post (the Crossing) | 3 | 1 | 1.4 |

With the watch: **9.9 days along the east road**, a quarter of the valley. Nobody on watch: 6.0 days and 12%. The band at
99: 12.4 days from home and 93% of the valley. Loki's Questioning Churn-Revelers (12, the Standing Annex at the Made Gate):
3.4 days, inside the Fellowship's ground.

⚑ **Your "the centre is genuinely unheld" (CCODE-595):** confirmed for the authored powers, and it stays true for them.
But Threshold Post is Silas's and sits at the Crossing, so with realms on, a small piece of the hub is his. It is a
player's ground, so that is correct.

## R4.3 · Allies and neutrals share ground; only rivals contest it ✅ ERIK

> **Erik, 2026-10-04:** *"Some alliances are obvious, as you have already ruled with the Millbrook Council. Others, such as
> the Castellany of the Echo Crossing, are ok to be assumed neutral to each other unless they clash. This will be fertile
> ground for alliances, trade, vassals, betrayals and narratives."*

Today every overlap is a winner and a stripe. That paints every pair of neighbours as at war. Three relations, one
function `relationOf(a, b, character)`, read by the map, the hover and the GM:

| relation | when | the map |
|---|---|---|
| **ally** | standing > 0 · the band carries one of the power's people (Mara Wells, the Elder Panel) · two characters of one player (Silas and Loki) | fill to the stronger; the weaker keeps **its own border, dashed**, *"· ally"* |
| **neutral** (the default) | anything not ally or rival | fill to the stronger; the weaker keeps **its own border, dotted**, *"· neutral"* |
| **rival** | they **clashed**: standing < 0 · blood either way (`lost`/`lostToYou` > 0, `holdLost`) · a hold taken (`holdsTaken`) · a raid of theirs on your hold · authored `rivals` between two powers | stripes within 15%, as B2 draws them now |

- The inner border is drawn only for a power **seated in view**. A neighbour whose claim reaches in from off the map is
  the hover's to tell, otherwise the valley carries five nested borders (measured: Radiant and Harmonic both reach in).
- Each power's own claim mask is already computed by the walk; keep it on the result (`own[id]`) instead of folding it
  away.
- ⚑ **The relation moves, and the map shows it moving.** The first raid turns the Castellany's dotted line into
  stripes. That is Erik's *"fertile ground"*: the map is where a player sees an alliance, a vassal or a betrayal happen.
  (Vassals, trade and betrayal as verbs are not in this order; the relation function is where they will land.)

Canvas: panels 1 and 4 of *"The Fellowship's ground"* show the same valley, neutral and then after a clash.

## R4.4 · The reach curve ⬜ ERIK

On B2's curve (`1.2 + 0.32·√heads`) a 20-head council holds about **7½ days** of ground. On that curve the Fellowship
holds three quarters of the valley, 10 days out, so it does not look like *"their local areas"*. Proposed:
**`radius° = 0.225 · heads^0.61`** (floor 10 for authored powers, none for a hold):

| | as built | proposed |
|---|---|---|
| Castellany (24), valley share | 30% | 7% |
| Elder Panel (20) | 13% | 3% |
| Harmonic Council (140), Echo Vale | 6.8% | 5.7% |
| Masters (140) / Hollow Court (150) / Gralloch (114), Unspooling | 8.9 / 8.3 / 8.0% | 7.4 / 7.2 / 6.1% |

The great powers keep 76–90% of their ground; small powers become local; growth with the army is steeper (√ → ^0.61),
which is Erik's *"grow with army size"*. One curve for every power and every realm. If Erik keeps B2's curve, R4.2 still
holds and the Fellowship simply reaches further.

## Done when

- Bleeding a power in a fixture shrinks its ground on the next paint; breaking it removes it; taking its hold moves the
  anchor to the player; a held gate anchors whoever holds it.
- A fixture character with a band and three holds draws a realm whose seat reaches with the whole band, whose holds reach
  with their own hands, and whose ground **grows with eyes and runs out along its roads**; emptying the watch shrinks it.
- Two allied powers on one seat draw one fill and two borders (dashed); two neutral neighbours draw one fill and a dotted
  border; a recorded clash turns the pair to stripes on the next paint.
- Both shows the nanite dots.
- ⚠️ **Fixture worlds, not the live saves** (§364, and the population-coupled gates of this month).

— Aevi, PO
