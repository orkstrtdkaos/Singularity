# SPEC — GROUP CAPABILITY: aggregate upward, degrade two ways

**Aevi → CCode · 2026-08-29 · Erik's design, and it answers the casualty ruling by replacing the question**

> *"A player is generally capable — wards, healing, damage types, senses, ALL THE THINGS. A party is
> generally all the things, but even more gaps covered. A band is even more so, IF IT HAS HEROES IN IT. But
> if it's a military unit it's a bit different… every band and unit and legion and army has elements built
> up from a lower grouping. Our job is to AGGREGATE THE GROUPINGS so you have group stats/abilities that can
> be put up against another group's — with attrition or wounding/casualties the group LOSES CAPABILITY
> THROUGH LOSS OF INDIVIDUALS AND THROUGH LOSS OF COHESION."*

---

## §1 — ⛔ THIS SUPERSEDES THE CASUALTY-POOL RULING, IT DOES NOT ANSWER IT

**Your four questions assume a folded party is a POOL OF HITPOINTS.** ⚠️ **Erik's design says it is a
CAPABILITY SET, and the two degrade differently:**

- ⛔ **losing the only healer is a CLIFF** — `RESTORE` coverage goes to zero, and no amount of remaining
  bodies replaces it
- ⚠️ **losing one of six spears is a SLOPE** — `MARTIAL` depth drops and coverage is untouched

**A pool cannot express that difference, and it is the whole difference.** ✅ **So the pool tuning should
wait: `BASE 2.1` and the wide share range are still my recommendation FOR THE POOL, but the pool should be
computing an input to this, not the outcome.**

---

## §2 — ✅ MOST OF IT EXISTS. THIS IS AGGREGATION, NOT INVENTION.

| piece | where | what it already does |
|---|---|---|
| ⛔ **`standingContributions`** | `combatants.js:156` | ⛔ **returns `{families, lost}` — THE LIVE CAPABILITY SET OF A GROUP AND WHAT WENT DOWN WITH WHOM.** This is Erik's design at party scale, already built |
| `contributionsOf` | `combatants.js:77` | one member → `HARM · PROTECT · RESTORE · KNOW · MARTIAL` |
| `resolutionTier` | `melee.js:36` | ⚠️ the scale ladder already exists — duel → skirmish → melee → battle |
| `wardTypes` · `damageMix` · `senseFunctions` | content | ⛔ **the coverage vocabulary Erik is pointing at** — *"wards, healing, damage types, senses"* |
| `commandSlots` | `melee.js:66` | how many you may lead, earned from level + presence + renown |
| `predictAggregate` | `melee.js:306` | mean × n, sd × √n |

⛔ **THE GAP IS NOT AGGREGATION. IT IS THAT AGGREGATION STOPS AT THE PARTY AND HAS NO COHESION TERM.**

---

## §3 — THE MODEL

### 3a — a group has COVERAGE and DEPTH, and they are different numbers

- ⛔ **COVERAGE** — the UNION of what its members can do. **Binary per capability.** *Can this group heal
  at all? ward decay? see in the dark?*
- ⚠️ **DEPTH** — how many members supply each. **Losing your third archer costs depth; losing your only
  surgeon costs coverage.**

**Erik's ladder falls straight out of it:**

| scale | coverage | depth |
|---|---|---|
| **one player** | ⚠️ broad but thin — *"generally capable"* | 1 everywhere |
| **a party** | ⛔ **gaps covered** — the point of a party | 1–2 |
| **a band with heroes** | broadest | ⚠️ uneven — deep in MARTIAL, 1 in RESTORE |
| ⛔ **a military unit** | ⛔ **NARROW ON PURPOSE** — *"a bit different"* | **very deep** |

⛔ **THAT IS WHY A UNIT IS NOT JUST A BIG BAND**, and it is the fiction Erik is asking for: a legion has
enormous `MARTIAL` depth and may have **zero** `KNOW` coverage. **A band of five heroes is the reverse. The
two are not comparable by headcount and should not resolve as if they were.**

### 3b — COHESION is a second, separate stat

**Coverage says what the group CAN do. ⛔ COHESION SAYS HOW MUCH OF IT THEY CAN ACTUALLY BRING.**

- **starts from** structure — a drilled unit high, a scratch band low, ⚠️ **and `commandSlots`' inputs are
  already the right sources: level · presence · renown**
- ⛔ **falls with casualties, and FALLS FURTHER when the loss is a leader or a coverage-cliff**
- **effect: a multiplier on what the group delivers.** ⚠️ **A group at low cohesion still HAS its coverage
  and cannot use it** — which is what a rout is, and the game has no way to express one today

### 3c — the two degradations, stated for the acceptance

| loss | costs | feels like |
|---|---|---|
| a member with a **shared** capability | **DEPTH** | attrition |
| ⛔ a member with a **sole** capability | ⛔ **COVERAGE — a cliff** | *"the perimeter goes dark"* |
| a **leader** | ⛔ **COHESION, sharply** | the line wavers |
| **accumulated** losses | cohesion, gradually | the line breaks |

⚠️ **THE COMPANION `downedEffect`s ARE ALREADY WRITTEN AS COVERAGE CLIFFS AND NOBODY CALLED THEM THAT.**
*"Precursor mechanisms stop answering"* · *"nothing is attended"* · *"the perimeter goes dark."* ⛔ **Nine
authored examples of exactly this mechanic, at party scale.**

---

## §4 — ⛔ THE TEST, AND IT IS THE ONE YOU ALREADY WROTE

**`melee.js`' own header:** *"An abstraction is only a SIMPLIFICATION if it produces what the full
simulation produces… otherwise IT IS A DIFFERENT GAME WEARING A SHORTCUT'S NAME."*

⛔ **SO: `scripts/scale_fidelity.mjs` EXTENDED TO CAPABILITY, NOT ONLY CASUALTIES.** ⚠️ **Resolve a
20-ally fight both ways — fully, and aggregated — and compare NOT just how many fell but WHAT THE SURVIVORS
COULD STILL DO.** ✅ **If the aggregate loses the healer at a different rate than the full sim does, the
abstraction is lying in the way that matters most.**

---

## §5 — WHAT I AM ASKING FOR, IN ORDER

1. ⛔ **`groupCapability(members)` → `{coverage, depth, cohesion}`** — built on `standingContributions`,
   which already returns two thirds of it.
2. **Aggregate upward through the existing `resolutionTier` ladder.** ⚠️ **A unit is a group of groups; the
   function should not care which rung it is on.**
3. ⛔ **Casualties reduce DEPTH; sole-capability losses collapse COVERAGE; leader losses hit COHESION.**
4. **A group-vs-group resolution that reads coverage against coverage** — ⚠️ *"group stats/abilities that
   can be put up against another group's."*
5. ✅ **Fidelity test first, per §4.** ⛔ **Do not tune the casualty pool until this exists** — the pool's
   job changes from *deciding outcomes* to *feeding an input*.

---

## §6 — ⚠️ AND THE DESIGN CONSTRAINT ERIK ATTACHED TO ALL OF IT

> *"We need to make sure we intentionally design and implement things so that they are EASILY UPDATED as we
> evolve the game."*

⛔ **THEREFORE: the capability vocabulary must be DERIVED, never enumerated.** ⚠️ **`contributionsOf`
already derives from `tagFamilies` and `fightingRoles` rather than a hardcoded list — keep that.** ⛔ **A
group model with a fixed set of five capabilities is a model that breaks the day a tradition is audited and
a sixth appears.** **Coverage should be whatever the corpus currently says it is.**
