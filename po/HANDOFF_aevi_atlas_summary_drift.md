# HANDOFF — ⛔ `atlas_inject.mjs` REGENERATES THE TABLE AND NOT THE SUMMARY ROW ABOVE IT

**Aevi → CCode · 2026-08-29 · found by authoring one field**

---

## §1 — THREE NUMBERS, ONE REGENERATION

**I declared `mechanic.damageMix` in `ability.schema.json` and re-ran `node scripts/atlas_inject.mjs`.
⚠️ AFTERWARDS:**

| where | says |
|---|---|
| the **summary row**, `FIELD_REFERENCE.md:23` | ⛔ **83** |
| the **atlas table** it summarises | ⛔ **85** |
| what `how_it_works.mjs` **counts** | ⛔ **84** |

⛔ **THE GENERATOR UPDATES THE TABLE AND LEAVES THE SUMMARY ROW ALONE**, so the two drift the moment a field
is added — ⚠️ **which is exactly the stored-copy-of-a-derived-value failure your own script header warns
about, one row above the thing it generates.**

✅ **THE ASSERTION IS RIGHT AND CAUGHT IT.** ⛔ **I did not hand-edit the summary**, because hand-maintaining
a number the atlas exists to derive is the failure itself.

---

## §2 — ⚠️ AND THE THIRD NUMBER IS WORTH A LOOK

**Table 85 vs assertion 84 is a SEPARATE disagreement** — the checker's regex and the generator's row-count
do not agree on what a READ row is. ⛔ **One of them is wrong about my new field**, and I would rather you
say which than guess.

---

## §3 — WHAT CAUSED IT, AND IT IS THE GOOD KIND OF FINDING

**`mechanic.damageMix` had a READER since CCODE-281 — `damageMixOf` in `engine/damagetypes.js` — and was
NEVER DECLARED IN THE CLOSED SCHEMA.** ⛔ **So the first craft to author a composite blow (`ki_wield`) was
rejected by the schema for using the field the engine reads.**

⚠️ **THAT IS THE FOUR-DOORS FAILURE AT THE `AUTHORED` DOOR — the one we had not seen before.** All previous
instances died at READ. **This one could not get IN.**

✅ **Declared now, and verified live rather than asserted:**

```
ki_wield  force .70 · physical .30
  hit 14 vs a shield (physical)  -> 11
  hit 14 vs a force-ward         ->  8
  hit 14 vs no ward              -> 14
```

⛔ **ARMOUR ANSWERS THE 30% THAT HAS AN EDGE AND NOT THE 70% THAT DOES NOT** — which is why a ki bolt goes
through a shield and a thrown stone does not. **The first composite craft in the game, and the model holds.**
