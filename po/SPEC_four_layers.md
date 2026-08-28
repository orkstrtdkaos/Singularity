# SPEC — SOURCE · METHOD · TYPE · OPERATION: four layers, and two of my types were never types

**Aevi → CCode for review · 2026-08-24 · Erik: *"let's take a step back and look at these logically. IS
VITALITY A DAMAGE TYPE OR AN AXIS? WHERE DOES CREATION AND DESTRUCTION FIT? Let's get clarity on Source,
Method, and Family/type."***

⛔ **HE FOUND A MISSING LAYER. Both his questions are answered by it, and it deletes two types I minted.**

---

## §1 — THE FOUR LAYERS

| layer | the question | examples | already exists? |
|---|---|---|---|
| **SOURCE** | what powers it | metaphysical · ordered/wild nanite · precursor · veil | ✅ `power_sources.json` |
| **METHOD** | how it is shaped and delivered | psionics · song · blade · working · prayer · lattice-craft | ⚠️ **implicit in `shape` + tradition; never named** |
| **TYPE** (in a FAMILY) | ⛔ **what lands, and what a ward answers** | physics→`force` · vital→`decay` | ✅ `damage_families.json` v2 |
| ⛔ **OPERATION** | ⛔ **WHAT IS DONE WITH IT** | damage · heal · **drain** · **unmake** · **make** · sustain | ⚠️ **half-exists as verbs — see §4** |

---

## §2 — ⛔ `vitality`: A TYPE. THE CONSERVATION IS AN OPERATION.

**I had two things packed into one word.**

- **`vitality` AS A TYPE** = raw life-force. Taken out it harms; put in it mends. **Belongs in `vital`
  beside `decay` (rot) and `living` (growth turned against).**
- ⛔ **THE CONSERVATION — *harm to one becomes healing for another* — IS AN OPERATION. Call it `drain`.**

**So `draw_down` decomposes:** metaphysical SOURCE · touch-working METHOD · `vitality` TYPE · `drain`
OPERATION.

⚠️ **AND THIS FIXES A REAL RESOLUTION BUG IN MY OLD MODEL: a ward answering `vitality` should stop the harm
REGARDLESS of whether the wielder was going to be mended by it.** ⛔ **With conservation baked into the
type, it could not express that.**

**AND `drain` GENERALISES OFF DEATH ENTIRELY** — a Blazeborn drains `heat`, and `borrowed_hour`
(hourkeeper) **literally drains `temporal` from nearby plants.** **One operation, any type.**

---

## §3 — ⛔ CREATION AND DESTRUCTION ARE OPERATIONS, WHICH IS WHY THEY NEVER FIT AS TYPES

**Unmake a WALL → physics. Unmake a PERSON → vital. Unmake an ARGUMENT → intrinsic.**

⛔ **THE UNMAKER'S `unmake` IS ONE VERB APPLIED ACROSS ALL FOUR FAMILIES, and what lands depends entirely
on what they pointed it at.**

⚠️ **THIS EXPLAINS A MEASUREMENT THAT HAS BOTHERED ME ALL WEEK: 26 unmaker + wright crafts, a whole reach,
ENTIRELY UNTYPED.** ⛔ **They are operations in search of a target, not a damage flavour.** **I minted
`unmaking` and `shaping` as types; no craft ever used them, and now I know why.**

**Same for `make`: a Wright shaping stone is physics, shaping flesh is vital.**

---

## §4 — ⚠️ WHERE I NEED YOUR READ, BECAUSE THE LAYER MAY ALREADY HALF-EXIST

**`shape` and `functions` are both carrying pieces of this, and I cannot tell from the content which was
intended:**

| | count | reads as |
|---|---|---|
| `shape: damage` / `healing` / `make` / `sustain` / `retrieval` | 38 / 25 / 5 / 4 / 1 | ⛔ **OPERATIONS** |
| `shape: strike` / `guard` / `hobble` / `reveal` / `conceal` | 25 / 36 / 21 / 15 / 8 | ⚠️ **METHODS or effect-shapes** |
| verbs `break` 52 · `make` 47 · `heal` 33 · `mend` 21 · `restore` 24 | | ⛔ **OPERATIONS AGAIN** |

⛔ **SO `shape` IS DOING TWO JOBS AND THE VERB VOCABULARY IS DOING A THIRD.** ⚠️ **`shape: damage` and
`shape: strike` are not the same KIND of statement, and `familyDefaults` is keyed on both.**

**MY QUESTIONS, AND THEY ARE YOURS BECAUSE YOU OWN THE RESOLUTION PATH:**

1. ⛔ **Is `operation` a new field, or is it recoverable from `functions`?** ⚠️ **`break`/`make`/`heal` are
   already there at 52/47/33 — a derived reader may beat a new field, and this project has spent a month
   deleting fields with one consumer.**
2. **If `drain` becomes an operation, does `vitality` stop being special?** ⛔ **I think yes, and that is
   the test of the model: `vitality` should resolve exactly like `decay` once conservation moves out.**
3. ⚠️ **Does `shape` need splitting**, or is the two-jobs thing load-bearing and I should leave it alone?
   **I have no view worth defending here.**
4. ⛔ **What breaks if `unmaking`/`shaping` stay deleted?** **Nothing uses them, but `damage_families.json`
   v1 shipped with them and I want the removal confirmed rather than assumed.**

---

## §5 — WHAT I AM NOT ASKING FOR

⛔ **No new vocabulary until you have read this.** ⚠️ **I have minted two types this week that turned out to
be operations, and one (`cold`) that turned out to belong to nobody. The pattern is that I mint at the
layer I happen to be working in.** **A fourth layer is exactly the thing to get reviewed before it is
built.**
