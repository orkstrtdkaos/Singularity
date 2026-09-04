# SPEC — what a holding can PROVIDE: the exhaustive attribute list

**Author:** Aevi (PO) · **2026-09-02** · **Status:** `design_open` — ⬜ **exhaustive list first; magnitudes
and size-tiers are a SECOND pass, per Erik**
> Erik: *"What can a holding provide? Local power source fields and aura, income, resources, defensible
> ability, power projection over an area, homes and jobs for people, training, crafting, etc. Let's get an
> exhaustive list going — including what the game currently looks for or will be looking for — as well as
> what we might want it to include."*

---

## §1 — WHAT A HOLDING CARRIES TODAY

`engine/holdings.js`:
```
{ id, kind: "post"|"enterprise", name, locationId, steward,
  obligation, condition, claimedDay, lastMovedWorldCount, history[] }
```

⛔ **NOT ONE FIELD DESCRIBES WHAT IT PROVIDES.** It records **who keeps it and how it is faring** — nothing
about what having it is FOR.

---

## §2 — ✅ ALREADY AUTHORED ON PLACES, AND A HOLDING SHOULD INHERIT OR MODIFY IT

⚠️ **A holding sits ON a location, and locations are richly authored. Most of the list already exists one
layer down.**

| a place already carries | on | a holding would |
|---|---|---|
| ⚑ **`substrateSource`** — `{kind: "pool"\|"sink", delta, radius, radiusWorld, reason}` | **44 of 135** — 29 pools, 14 sinks | ⛔ **THIS IS ERIK'S "LOCAL POWER SOURCE FIELD AND AURA", ALREADY BUILT.** A hold could DEEPEN a pool or CREATE one |
| `poleIntensity` · `axisVector` | 135 | the axis character a hold projects |
| `dangerLevel` | 127 | ⚠️ **a hold should LOWER it in its radius** — that is "defensible" |
| ⚑ **`waygate` · `waygateTier`** | **27** | ⛔ **power projection, already modelled as travel** |
| `communityId` | 134 | the people — homes and jobs attach here |
| `npcsPresent` | 35 | who is stationed |
| `tier` — settlement · region · site | 135 | ⚠️ **the natural size ladder for pass two** |
| `connections` | 135 | reach: what a hold's writ can follow |

➡️ ⛔ **THE DESIGN RULE THIS SUGGESTS: A HOLDING IS A MODIFIER ON A PLACE, NOT A NEW OBJECT.** ⚠️ It changes
what the location already does, which means most of the machinery is a delta rather than a system.

---

## §3 — THE EXHAUSTIVE LIST

### 3a · ⚑ MATERIAL — things that go in a purse or a store

| provides | notes | reader |
|---|---|---|
| **income** | in one of the five currencies | ⚠️ `purse.js` exists; ⛔ **`coin` may never be minted** |
| **resource yield** | ⛔ **KINDS, not money** — ore, timber, stone, cloth, food, worked goods | `economy.js` `regionDemand(…, goods)` |
| **stores** | what is held on site vs banked | ⬜ new |
| ⚠️ **upkeep — a NEGATIVE** | wages, food, repair, garrison | ⛔ **the field that makes a hold a decision** |
| **trade access** | a market where `priceOf` improves, or a currency accepted here | `canSpendHere` exists |

### 3b · ⚑ MARTIAL

| provides | notes |
|---|---|
| **defensible position** | ⚠️ a fight AT the hold starts advantaged |
| ⛔ **danger reduction in a radius** | `dangerLevel` already on 127 places — **a hold should lower it** |
| **garrison capacity** | how many can be stationed. ⚠️ **ties to R25 delegation and `contingentsFromPeople`** |
| **muster point** | where a band forms; ⬜ `bandThreat` already exists |
| **safe harbor** | ⚠️ rest, recovery, `woundedUntilDay` running faster |
| **power projection** | ⛔ **a radius in which your writ runs** — Erik's phrase, and the thing R25's `presence` milestones already reach for |

### 3c · ⚑ SUBSTRATE AND MEANING — *the interesting ones*

| provides | notes |
|---|---|
| ⛔ **substrate field** — deepen a pool, dig a sink | ⚠️ **already the authored shape** `{kind, delta, radius}`. **A hold that RAISES density helps precursor and nanite craft and HURTS veil and metaphysical** |
| ⛔ **meaning density** | ⚠️ **`SPEC_meaning_density.md`** — a shrine, a temple, people living somewhere. **A hold IS people living somewhere** |
| **aura** | ⚠️ companions already carry `substrateAura` (Aevi 0.2, Coil 0.14) — ⬜ **a hold is a stationary aura** |
| **ward** | standing protection against a named harm class |
| ⬜ **attending capacity** | ⚠️ **R29 + `the_gathering`: a hold with wardens ATTENDS the endings in its reach and starves what feeds on them** |

### 3d · ⚑ PEOPLE

| provides | notes |
|---|---|
| **homes** | population capacity; ⚠️ ties to `communityId` |
| **jobs** | ⛔ **what converts population into yield** |
| **training** | ⚠️ **`schools.json` + `mind_schools` + `body_schools` ALREADY EXIST** — a hold could host one |
| ⛔ **teaching a specific craft** | ⚠️ **R33's `learnedAt` IS THIS FIELD.** *"Hardline teaches the Edge; it does not own it"* — **a hold is a `learnedAt`** |
| **recruitment** | where companions and delegates can be found or hired |
| **delegate seat** | ⚠️ a place a steward can be assigned FROM; ties to R25 capacity |

### 3e · ⚑ CRAFT AND WORK

| provides | notes |
|---|---|
| **crafting facility** | forge, lens-works, still, scriptorium — ⚠️ **gates which items can be MADE** |
| **repair** | restore condition on gear |
| **storage** | what can be kept safely |
| **research** | ⬜ progress toward something not yet known |
| ⛔ **item quality ceiling** | ⚠️ a better forge makes better work — **ties to the 42 items carrying `worth`** |

### 3f · ⚑ STANDING AND STORY

| provides | notes |
|---|---|
| **reputation** | with a community, a tradition, a Reach |
| **information** | ⚠️ what reaches you because you hold this place — **`figureCareer` news** |
| **arc leverage** | ⛔ **a hold in an arc's region gives you a way to push it** |
| ⬜ **legitimacy** | ⚠️ **the Hollow King's whole hunger.** A hold that means you need not petition |
| **obligation — a NEGATIVE** | ⚠️ already a field: what the hold owes whoever granted it |

---

## §4 — ⚠️ THE FOUR THAT ARE NOT NUMBERS, AND MUST NOT BE MADE INTO NUMBERS

⛔ Erik's own list: *"income, defensible position, power projection, safe harbor, economy"* — **only the
first is a number.**

| | why it resists a number |
|---|---|
| **reach** | a road that stays open. ⚠️ You cannot bank it and you would pay for it |
| **safe harbor** | somewhere to be un-hunted |
| **legitimacy** | ⚠️ **you need not ask** |
| **attending** | ⛔ **the endings in your radius are witnessed** — R29 |

➡️ ⚑ **AND THE REAL DECISION FALLS OUT: WHICH HOLDS PAY FOR THE ONES THAT DO NOT.** The mine funds the
watchtower. **That is the economy of a domain, and it is a better game than a coin counter.**

---

## §5 — ⬜ PASS TWO, NOT NOW

Per Erik: *"after that we'll think about how much a holding of a certain size/level can provide — how many
types, what magnitudes."*

⚠️ **What pass two must answer:**
1. **How many attribute types may one hold carry**, by size — ⬜ `tier` (settlement · region · site) is the
   authored ladder already
2. **Magnitude per type**, and whether it scales with `condition` — ⚑ **it should: a `thriving` mine yields
   more than a `strained` one, and `advanceHolding` already moves that**
3. **What upkeep each type costs** — ⛔ **a garrison is not free and neither is a scriptorium**
4. ⚠️ **Which types REQUIRE a steward** and which run unattended — ⛔ **R25's `presence` 14/18 already rules
   what an unstewarded hold can reach**
5. ⬜ **Can a hold gain types over time**, and is that a build or a growth?

⛔ **AND THE HARD CONSTRAINT: a hold must be reportable in a SENTENCE.** *"The mine is running; the
watchtower is eating it."* ⚠️ **Erik's standing preference is plain language, never a spreadsheet.**

---

# ROUND 2 — CCode · 2026-09-04 · v1.9.346 — the list is right; here is what is measured under it

✅ **§2's design rule is the finding, and I agree with it:** a holding is a MODIFIER on a place. Every delta the list
reaches for is already a field with a reader one layer down. Measured on the live corpus:

| §2 claim | measured | reader today |
|---|---|---|
| `substrateSource` on 44 — 29 pools, 14 sinks | ✅ 44 · 29 · 14 — ⚠️ **the 44th has no `kind`: `the_old_warden_post`**, Cassiel's post, the one holding-adjacent place in the game. Aevi's | `substrate.js` resolves the field from it; `carriedSubstrate` / `substrateAura` are the moving version |
| `dangerLevel` on 127 | ✅ 127 | 15 reads in `app.js` (`escalateToFight`'s threat, the frame), 3 engine files |
| `waygate` on 27 | ✅ 27 | 9 engine files, 35 app reads — the best-wired of all of these |
| `communityId` on 134 | ✅ 134 | ids on places, not records (§R2.5 of the transfer spec) |
| `npcsPresent` on 35 | ⚠️ **35 carry the key; 10 are non-empty** | `sheetsForGM` reads who is present |
| `tier` 96 · 25 · 14 | ✅ | the size ladder for pass two, as you say |
| `learnedAt` is "teaching a specific craft" | ✅ **43 crafts carry it** — a hold as a `learnedAt` is one string on the craft | `craftsOf`/access read it; no reader yet says *this PLACE teaches* |

⚠️ **Every reader §3 names exists** (`canSpendHere`, `regionDemand`, `contingentsFromPeople`, `bandThreat`,
`woundedUntilDay`, `substrateAura`, the schools). ⛔ **None of them reads a holding.** That is the whole gap and it is one
shape: a holding record has no `provides` at all, and the location readers do not know a holding sits on their place.

**So the first build is not any single attribute — it is the JOIN:** `holdingsAt(locationId)` and a `provides` block on
the record, with the location readers asking it. ⬜ **Which attributes, how many, how big — pass two, Erik's (RULINGS
OWED Q14).** What I would build before that, because it needs no number: the join, the reporting sentence
(*"the mine is running; the watchtower is eating it"* reads straight off `condition` + a `provides` list), and
`substrateSource` as the first delta — it is authored, read, and the only one that changes a fight (a raised density
helps precursor and nanite crafts and hurts veil and metaphysical, exactly as you say).
