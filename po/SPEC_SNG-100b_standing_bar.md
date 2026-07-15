# SPEC — SNG-100b: The Standing Bar
## Aevi (PO) · 2026-07-14 · authored to spec · **awaiting CCode ROUND 2**

> **One line.** Build the per-people standing primitive that domain promotion (SNG-101) and acquisition (SNG-102) gate on — a per-tradition standing score, a durable "teacher met and willing" flag, and a region-presence record. **This also wires the `accessGates` capstone bar (SNG-049/050) the game already claims to have but never enforced.**

> **Why this exists.** CCode's SNG-101/102 review found — and Aevi verified at HEAD `bb36b5a` — that the standing bar both specs "reuse verbatim" **is content only.** `domainAccess` enforces station/ceiling/closed-opposite and nothing else. The `accessGates` capstone rule (*"rank IV–V requires deep standing — teacher + reputation — greatness is taught, not bought"*) is fiction in a JSON file; no code reads it. And its inputs are missing or wrong-shaped. This ticket builds the floor. **Nothing above it can stand until it exists.**

---

## THE GAP, VERIFIED AT HEAD

- **Per-people reputation doesn't exist as a score.** `reputation.js standingWith(character, communityId)` is per-**settlement/community**, computed from `character.deeds`. A "people" (a tradition/pole) is not a community. `peopleDisposition[traditionId]` holds small quest-driven integers and **feeds display only** — no gate reads it.
- **"Teacher met and willing" is not persisted.** There is no flag anywhere recording that a character has met a teacher of a given people who would train them.
- **Region standing is not stored.** Only current location exists; there's no record of "has spent time among people X."
- **`accessGates` is unenforced.** The capstone comment in `progression.js` (L230) says "capstone rule" over code that implements station/ceiling/closed-opposite only. SNG-049/050 shipped the *fiction*, never the *gate*.

---

## WHAT THIS BUILDS

### 1. Per-people standing score — `standingWithPeople(character, traditionId, rules)`
A tradition-scoped standing, distinct from settlement reputation. Two honest options for the source, CCode to choose at ROUND 2 based on what's cheapest against the live data:

- **(a) Derive from deeds, re-tagged by people.** `deeds` already carry `tags` and `communityId`. If deeds can be associated with a *people* (many communities belong to a tradition's sphere), `standingWithPeople` sums deed weight scoped to that people — the same shape as `standingWith`, different grouping. Preferred if the community→people mapping exists or is cheap.
- **(b) Promote `peopleDisposition` to a real score.** It already accumulates per-tradition integers from quests. Formalize its scale, add reputation bands, and make it the standing source. Preferred if deeds don't map cleanly to peoples.

Either way the **output contract is fixed:** `{ score, band }`, per `traditionId`, persisted or deterministically derivable, readable by a gate. SNG-101/102 thresholds are expressed in this score's units — so this spec must ship the units, not invent them downstream.

### 2. Durable teacher flag — `character.teachers: { [traditionId]: { met, willing, npcId } }`
Set when the character encounters an NPC who is a teacher of a people and a relationship threshold is met (GM-surfaced or quest-driven). **Durable** — persists across sessions; the gate reads state, not the current turn. A GM op `markTeacher{traditionId, npcId, willing}` (whitelisted, sanitized) lets the fiction set it; the engine never invents a teacher.

### 3. Region-presence record — `character.regionsKnown: { [regionId]: turnsPresent }`
A light accumulator incremented on `worldtick`/location while the character is in a region tied to a people. Enough to answer "has this character genuinely spent time among people X." Cheap; rides existing location tracking.

### 4. Wire the capstone bar — `meetsStandingBar(character, traditionId, tier, rules)`
The function SNG-049/050 always implied. Reads the three primitives above and returns whether the character clears the standing required for a given tier of a people:
- Tier IV–V of any pole-tradition requires `standingWithPeople ≥ capstoneThreshold` **and** a willing teacher. *(This closes the existing unwired gap — once built, `domainAccess`/`learnAbility` can enforce the capstone rule the content already describes.)*
- SNG-101 promotion and SNG-102 acquisition read the same function with their own thresholds.

**One standing bar, three consumers** (capstone learning, promotion, acquisition). Build it once, correctly.

---

## ENGINE SURFACES

| Module | Change |
|---|---|
| `reputation.js` | `standingWithPeople(character, traditionId, rules) → {score, band}` — option (a) or (b) per CCode. |
| `state.js` | Seed `character.teachers = {}` and `character.regionsKnown = {}` on load if absent. Additive, `reconcileVersion`-gated. |
| `worldtick.js` / location | Increment `regionsKnown[regionId]` while present in a people's region. |
| `gm.js` | `markTeacher` op (whitelist + sanitizer clamped to `{traditionId, npcId, willing}`). Engine sets the flag only from this op or a quest reward — never inferred. |
| `progression.js` | `meetsStandingBar(character, traditionId, tier, rules)`; **wire it into `learnAbility` for the Tier IV–V capstone gate** — closing SNG-049/050's gap. |
| `traditions.json` | `capstoneStanding` thresholds block (the bar the fiction already promises). |
| `tests/content_ci.mjs` | Validate the thresholds block; assert `standingWithPeople` returns the fixed contract for a known people. |

---

## NON-GOALS / GUARDS
- **This is the floor, not the feature.** It ships standing, teacher, region primitives + the capstone wiring. Promotion/acquisition are SNG-101/102.
- **No inferred teachers.** The teacher flag is set by op or quest, never guessed from proximity — otherwise standing becomes buyable-by-loitering, the opposite of "taught, not bought."
- **Additive only.** New fields default-empty; a legacy save with none behaves exactly as today (standing bar simply unmet until earned).
- **Fixed output contract.** `standingWithPeople` returns `{score, band}` regardless of source (a/b), so SNG-101/102 don't care which was chosen.

## OPEN QUESTIONS FOR CCODE ROUND 2
1. Source for `standingWithPeople` — is there a cheap community→people mapping (favoring deed-derivation, option a), or is `peopleDisposition` the better base (option b)? Your call against the live data.
2. Is there an existing region model (`regions.json` + a location→region resolver) that `regionsKnown` can key against, or does region need defining first?
3. Does any current op-handler pattern fit `markTeacher`, or is it a fresh whitelist entry?
