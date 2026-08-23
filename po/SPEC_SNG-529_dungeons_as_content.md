# SPEC SNG-529 — Dungeons as content: wire the Sunk Assay, and template the kind

**Author:** Aevi (PO) · **Date:** 2026-08-23 · **For:** CCode
**Two halves.** §1–§4 wire ONE dungeon. §5–§8 make the KIND spawnable, so a GM can raise one when a player
finds a hole in the ground.

---

## §0 — ⛔ THE FINDING THAT PROMPTED THIS

**Erik asked whether the Sunk Assay is playable in game. It is not.** ⚠️ **I verified rather than
assumed:**

| exists | ⛔ missing |
|---|---|
| `encounters/sunk_assay_intake.json` | **no location record — the Assay is not a PLACE** |
| `encounters/sunk_assay_warden.json` | **Greyhearth's `connections` do not reach it** |
| `items/sunk_assay.json` | **its `questSeeds` and `encounterSeeds` are both `[]`** |
| `tests/sunk_assay_run.mjs` | ⛔ **AMARANTH DOES NOT EXIST AS A LOCATION** — I authored it into `foothills.json` and never made the place |

⛔ **I WROTE "PLACEMENT: UNDER GREYHEARTH'S RIVER, REACHABLE FROM BOTH BANKS" AND NEVER AUTHORED THE
REACHABILITY.** ⚠️ **Same shape as the 27 invisible files and the 27 blocks one level below the reader:
correct content at an address nothing traverses.** It runs in a harness because you built one; it is not
in the world.

---

## §1 — AMARANTH · a new location

**Sister town across the river from Greyhearth.** Full schema per `valley/locations/`.

| field | value |
|---|---|
| `id` | `amaranth` |
| `regionId` | `foothill_greyhearth` ⚠️ **same region — one foothill, two towns** |
| `communityId` | `amaranth` |
| `tier` · `role` | `settlement` · `waypoint` |
| `tags` | `settlement` · `foothill` · `ritual` |
| `connections` | `greyhearth` ⛔ **only. One bridge.** |
| `dangerLevel` | **3** (Greyhearth is 1) |
| `spectrum` | `death_life: -0.5` · `emotional_logical: -0.3` · `mechanical_spiritual: 0.35` |
| `worldPos` | ⚠️ **Greyhearth's, +1 longitude — across a river, not across a country** |
| `foothillOf` | `ashwarden` · `threnodist` · `wright` |
| `substrateSource` | `pool`, delta **0.3**, radius 60 — ⛔ **three times Greyhearth's, and that is the whole difference between the banks** |

**`descriptionSeed`:** *Amaranth — purple and deep green, gold thread, bone worked into regalia rather than
buried. The Grave-Callers and the ritualists, who take the tradition's central claim seriously enough to
act on it: not furtively and not in cellars, but in procession, in season, with music. Greyhearth finds
this tasteless. Amaranth finds Greyhearth cowardly. Most people in both simply have a way they prefer to
work.*

⚠️ **The name is `ἀμάραντος` — unfading, `a-` + `marainein`, to wither. ⛔ ITS ROOT IS THE NEGATION OF AN
ASHWARDEN CRAFT.**

---

## §2 — THE SUNK ASSAY · a `site` under both towns

| field | value |
|---|---|
| `id` | `the_sunk_assay` |
| `tier` · `role` | `site` · `gate` |
| `parentId` | `greyhearth` |
| `connections` | `greyhearth` · `amaranth` ⛔ **both banks reach it. That is the fiction and the map should say so** |
| `dangerLevel` | **5** |
| `tags` | `dungeon` · `precursor` · `submerged` · `multilevel` |
| `worldPos` | Greyhearth's, ⛔ **`depth: 1`** — the field exists and nothing uses it |

**`encounterSeeds`:**
```
{ encounterId: "sunk_assay_intake", hint: "Someone is already down there, and they got here first" }
{ encounterId: "sunk_assay_warden", hint: "Something below is still doing its job" }
```

**`questSeeds`** — ⛔ **both towns hire, with incompatible instructions and no villain:**
- *Greyhearth will pay for the assay ledgers and would rather the works stayed shut.*
- *Amaranth will pay more, and wants it opened — it was left running for a reason.*
- *The year's dead are carried over the bridge and back. One year, something came back that was not carried over.*

---

## §3 — GREYHEARTH · three edits

**`connections`** += `amaranth`, `the_sunk_assay`
**`encounterSeeds`** — the intake, hinted from the grey bank's side
**`questSeeds`** — the ledgers, and ⚠️ **a grey-bank funeral and an Amaranth procession for the same body,
on the same day, arranged by the same family without friction**

---

## §4 — THE LEVELS · how a multi-level site is expressed

⛔ **I DO NOT KNOW THE ANSWER AND WILL NOT GUESS.** Four levels, each with its own hazards, opponents and
clock. **Three shapes I can see:**

1. **Four `site` locations with `parentId: the_sunk_assay`** — reuses the tier system exactly, each level
   is a place, `connections` chain them. ⚠️ **My preference** — a level IS a place.
2. **One location, four encounter seeds** — lighter, ⛔ **but Level 2's rising-water clock and Level 4's
   project belong to a level, not to an encounter.**
3. **Something you already have for interiors** that I have not found.

⚠️ **If (1), the four are `the_intake` · `the_flooded_assay` · `the_wardens_floor` · `the_assay_itself`,
each `depth: 1–4`, chained, and only the first connects upward.**

---

## §5 — ⛔ THE TEMPLATE · `dungeon_template.json`

**Erik: *"make sure that every piece needed to seed and spawn new dungeons is templates. The GM needs to be
able to make these when a player finds one in the wilds or city or wherever."***

⚠️ **This is the `companion_template` finding again:** the Sunk Assay is one hand-authored example, and one
example is not a shape. ⛔ **A GM raising a dungeon in play needs to know what to fill in, not to read four
levels and infer.**

### 5a · What a dungeon IS, structurally

| piece | required | derived from |
|---|---|---|
| **a site location** | ✅ | the existing location schema — nothing new |
| **a parent** | ✅ | ⚠️ **a dungeon hangs off a place someone lives.** Who benefits, who is frightened |
| **1–4 levels** | ✅ | ⛔ **each level makes a DIFFERENT set of mechanics load-bearing** — that is the whole design rule |
| **an opposing party** | ✅ | authored opponent sheets. ⛔ **AT LEAST ONE MUST READ**, or the sense slot is dead on that floor |
| **typed hazards** | ⚠️ | `damageType` + optional `ongoingHarm` |
| **the answers, as objects** | ⚠️ | ⛔ **findable IN the dungeon.** A party must not need to have brought the right tradition |
| **a clock, or not** | — | a standing effect with an escalating value |
| **a project floor** | — | ⛔ **only if you want the party to have to come back** |
| **artifacts** | ⚠️ | ⛔ **each one should WIRE A SYSTEM**, not grant a number |
| **two employers** | — | ⚠️ **the Sunk Assay's best feature: incompatible instructions, no villain** |

### 5b · ⛔ THE DESIGN LAWS, and these are the part worth templating

1. ⛔ **EVERY LEVEL EXERCISES A DIFFERENT SET.** L1 sense/social, L2 hazards/healing, L3 the fight, L4 the
   project. **A dungeon of four fights is one level, four times.**
2. ⛔ **THREE SOLUTIONS, AND THE LEVEL MUST NOT REWARD ONE.** Fight, trade, slip. **Each path costs
   something the others keep.**
3. ⛔ **AT LEAST ONE OPPONENT PER FLOOR MUST DECLARE `reveal`** — otherwise the party can only read, and
   readers bank nothing. ⚠️ **You found this: *obscure's strength is exactly how often opponents look.***
4. ⚠️ **THE ANSWERS ARE IN THE ROOM.** Typed hazards answered by findable objects.
5. ⛔ **THE GAPS ARE THE LESSONS.** The Warden answers four types and not seven; the leathers are `decay` 5
   and `physical` 1. **Say what a thing does not stop.**
6. ⚠️ **WINNABLE MISSING ANY ONE ROLE.** No level requires a tradition; every level rewards one differently.
7. ⛔ **A PROJECT FLOOR MEANS RE-ENTRY.** *One day with eight hands banks 2 of 12.*

### 5c · What the GM must supply when raising one in play

**Minimum viable dungeon — five answers:**
1. **What is it, and who built it?** ⚠️ the Sunk Assay is *a place built to test material*, which makes its
   own logic "everything here measures what walks into it"
2. **Who is already inside?** ⛔ at least one of them reads
3. **What is the hazard, and what answers it?**
4. **What is at the bottom, and does it want anything?** ⚠️ **the Warden is not trying to kill anyone**
5. **Who is paying, and is anyone else paying differently?**

---

## §6 — SPAWN SOURCES · where a dungeon comes from

⛔ **A GM must be able to raise one at the moment a player finds it, not in advance.**

| found in | parent | shape |
|---|---|---|
| **wilderness** | nearest `settlement` or `site` | precursor works · a barrow · something under a slide |
| **a city** | the district | cellars · a sealed stack · works under the street |
| **on a journey** | ⚠️ the leg itself | ⛔ *a place the road led to* — `gen_ashwarden_march_road` already does this |
| **under a known place** | that place | ⛔ **`depth`, which exists and nothing uses** |

⚠️ **`worldPos.depth` is authored on every location and used by nothing.** ⛔ **A DUNGEON IS THE OBVIOUS
CONSUMER** and it would let the map show what is under a place without a second coordinate system.

---

## §7 — WHAT I NEED FROM YOU

1. ⛔ **§4 — how does a multi-level site express its levels?** My preference is four `site` records chained
   by `connections`, but **you know what the traversal code can walk.**
2. ⚠️ **Does a location's `encounterSeeds` reach the encounter files I authored**, or is there a
   registration step between them?
3. ⛔ **Is `worldPos.depth` read anywhere?** If not, a dungeon is the reason to start.
4. **Where should `dungeon_template.json` live** — `core/rules/`, beside `companion_template`? ⚠️ **And
   should it be a template or a GENERATOR, given the GM raises these mid-scene?**

---

## §8 — WHAT I WILL AUTHOR ONCE YOU RULE

**Amaranth · the Sunk Assay site · four level records · Greyhearth's three edits ·
`dungeon_template.json` · and a second worked example** — ⚠️ **because one example is not a shape, and I
have made that mistake twice this month.**
