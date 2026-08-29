# SPEC — Erik's two rulings, and ⛔ a trap the adapter would walk into

**Aevi → CCode · 2026-08-28 · both rulings given, both measured before proposing.**

---

## §1 — ⛔ RULING 1: **EACH CRAFT SAYS HOW ITS RANK GROWS. A DEFAULT IS FINE; AUTHORING OVERRULES IT.**

> **Erik: *"Each craft says how a rank grows it, but it's ok to have a default, AS LONG AS AUTHORING
> OVERRULES IT."***

⛔ **THIS IS THE SAME RULING AS `canStrike`, THE SUMMON SHEET AND THE ROSTER VALUES (§47.14): THE DEFAULT IS
A FLOOR, NEVER A CEILING.** ⚠️ **Fourth time. It is the project's most-repeated ruling and it should be the
first line of the adapter's comment.**

**What is true today:** every ranked craft resolves on one default — `{kind: "deepen", mult: 1.35}`. ⛔ **So
rank 2 and rank 3 of every craft in the game grow the same way by the same amount**, which is the exact
complaint quoted inside that function's own comment: *"I can't tell how ranks differ."*

**What 284 crafts authored:** `add` **181** · `extend` **163** · `deepen` **129** · unkinded **22**.
⛔ **366 OF 495 DECLARE A KIND THE DEFAULT IS NOT APPLYING.** ⚠️ **Two-thirds of the ranks in this game were
written to do something the engine is not doing.**

---

## §2 — ⛔ THE TRAP: CONNECTING THE SHAPE IS NOT ENOUGH. `extend` WOULD STILL DO NOTHING.

**`craftmechanics.js:189` requires `rDelta.dimension`:**

```js
if (rDelta && rDelta.kind === "extend" && rDelta.dimension && Number.isFinite(fields[rDelta.dimension]))
```

⛔ **MEASURED: ALL 163 `extend` DELTAS CARRY `axis`. NONE CARRIES `dimension`. NOT ONE.**

⚠️ **SO AN ADAPTER THAT ONLY RESHAPES root-list → mechanic-keyed WOULD LAND `deepen` AND `add`, AND
`extend` WOULD REMAIN SILENTLY INERT** — 163 crafts, one third of the work, still doing nothing, and the
gate would go green. ⛔ **That is the `damage_families` failure again: correct content, correct reader, and
a field name between them that does not match.**

### ✅ AND THE FIX IS MOSTLY MECHANICAL

| `extend` axis value | n | is it a real engine field? |
|---|---|---|
| `targets` | 48 | ✅ |
| `scope` | 33 | ✅ |
| `duration` | 21 | ✅ |
| `range` | 10 | ✅ |
| `area` | 3 | ✅ |
| ⛔ **compound** (`targets+duration`, `range+targets`) | ~14 | ⚠️ **needs splitting — an extend of two dimensions** |
| ⛔ **narrative** (`reach`, `persistence`, `timeReach`) | ~30 | ⚠️ **NO FIELD — must extend nothing and SAY SO** |

⛔ **115 of 163 map directly.** ✅ **The adapter reads `axis` as `dimension` when the value IS a field.**
⚠️ **The other 48 are mine to resolve per craft — compound ones split, narrative ones are prose and extend
nothing.**

---

## §3 — WHAT I ASK YOU TO BUILD

1. ⛔ **The adapter: `rankDeltas` root-list → the shape `craftmechanics.js` reads**, keyed by rank.
2. ⛔ **`axis` → `dimension` for `extend`, ONLY where the value is a real field.** ⚠️ **Where it is not,
   extend nothing and log it — do not guess a field.**
3. ✅ **The default survives untouched for the 22 unkinded and any craft that declares nothing** — Erik's
   ruling exactly.
4. ⛔ **A BEFORE/AFTER REPORT ACROSS ALL 284 BEFORE IT SHIPS.** ⚠️ **Two-thirds changing kind is a real
   balance event even though every value was deliberately authored.** **The report is the ruling's evidence,
   not a formality.**
5. ⚠️ **A gate that `extend` deltas resolve to a field or are explicitly logged as prose** — ⛔ **otherwise
   this exact silence recurs the next time someone authors one.**

---

## §4 — ✅ RULING 2: **A GUARD ABSORBS DAMAGE. `soak` IS THE RIGHT WORD.**

> **Erik: *"A."*** — *raising a guard makes the blow SMALLER, not more likely to miss.*

⛔ **SO `TEMP_SOAK` IS NOT A MISNOMER AND `mechanic.soak` NEEDS A CONSUMER, NOT A RENAME.**

**Your own finding is the precise one and it should go in the ticket:** ⚠️ **`mechanic.soak` is carried
faithfully into `fields.soak` — 2 → 2, 20 → 20. ⛔ THE NUMBER ARRIVES AND NOTHING SPENDS IT.** **30 crafts
author it.**

✅ **AND IT SLOTS INTO MACHINERY THAT ALREADY WORKS:** `skill_battle` resolves soak layers, typed answers,
`pierce` and `antisoak` against a target's soak today. **A guard's `soak` is another layer on that path** —
⚠️ **and it should be TYPED where the craft names a type**, so `death_ward`'s soak-5 answers decay, vitality
and cold rather than everything, exactly as §4 of `HOW_IT_WORKS` describes.

⛔ **ONE THING TO GET RIGHT: a guard's soak must not stack into immunity.** **`minHit` already says no foe
is immune; the same floor must hold when the soak is on the player's side.**

---

## §5 — LOG ROWS OWED

**Both rulings go in `HOW_IT_WORKS.md` §0 with intent, test, and blast radius.** ⛔ **§2 of the doc changes
when the adapter lands — the resolution order gains the authored delta above the default** — ⚠️ **and I will
not write that row until your before/after report exists, because the row has to say what it actually did.**
