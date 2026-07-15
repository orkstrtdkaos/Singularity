# SPEC — SNG-103: Feed the GM effective energy cost, not base
## Aevi (PO) · 2026-07-14 · authored to spec · **awaiting CCode ROUND 2**

> **One line.** `abilitiesForGM` prints each ability's **base** `energyCost` into the ABILITY LAW block, never the character's **effective** cost after level+rank discounts. The GM is handed 6 for an ability the sheet correctly charges 3 for, sees a "mismatch," and repeatedly flags correct data as a Repair-tool error. Feed it the effective cost instead.

> **Verified against HEAD `v1.8.60`.** Discovered from live play (Silas Weir, Palework rank 2 at Millbrook): GM's ability-law block said "Reading the Rot (6 energy, was 6)"; the panel said 3; the GM offered a Repair-tool "fix." **The energy formula is correct. The panel is correct. The prompt is fed the wrong number.**

---

## THE BUG, ROOT-CAUSED AT ORIGIN

**`engine/progression.js abilitiesForGM()`** builds the ABILITY LAW block. Line of interest:

```js
lines.push(`### ${ab.name} — rank ${owned.level}... (${ab.energyCost} energy)` + ...)
```

It interpolates **`ab.energyCost`** — the raw base from the ability JSON — with **no character-specific discount**. So the GM literally reads `### Palework — rank 2 "Reading the Rot" (6 energy)` and has no idea the character pays less.

Meanwhile the **panel** and every actual spend run through **`effectiveEnergyCost(abilityDef, character, rules)`** (same file), which applies:
- **level discount:** `⌊(level−1)/2⌋ × energyEfficiencyPerTwoLevels` (=1)
- **rank discount:** `(rank−1) × rankEnergyDiscount` (=1)
- **floor:** `⌈base × minEnergyCostFraction⌉` (=0.5)

**Worked example (Silas, verified):** base 6 − 2 (level 5) − 1 (rank 2) = 3, floor ⌈3⌉=3 → **3**. Panel shows 3. Formula is correct.

**The failure:** the GM is told 6, sees the sheet's 3, and — following rule 2 ("the ABILITY LAW block defines exactly what each ability CAN do... treat those as physics") — treats its own stale number as authoritative and the correct sheet as the error. It fires on **every leveled character using any discounted ability**. Silas at L5 discounts *every* ability by ≥2, so it fires constantly.

**The danger this false flag invites (why it's worth fixing, not cosmetic):** the GM's suggested remedy is the Repair tool. If a player "repairs" the **base** cost down to 3 to match the panel, that is the *actual* data corruption — it pins the ability to the floor at every level and rank and breaks the discount curve for every lower-level caster. **A false flag on correct data invites a real break.** Nothing in the current data is wrong; only the GM's input is.

---

## THE FIX

Feed `effectiveEnergyCost` into the block instead of `ab.energyCost`. The function is already imported into `app.js` and already lives in `progression.js` alongside `abilitiesForGM` — it's a drop-in, with one signature thread.

**1. `engine/progression.js` — `abilitiesForGM` gains `rules` and uses the effective cost:**
```js
// signature: add rules (defaulted, so the change is safe if a caller lags)
function abilitiesForGM(character, catalog, branchForks = null, rules = {}) {
  ...
  const eff = effectiveEnergyCost(ab, character, rules);
  lines.push(`### ${ab.name} — rank ${owned.level}...  (${eff} energy)` + ...)
}
```

**2. `app.js` — thread `CONTENT.rules` at all three call sites** (L2333, L3016, L4481). Every one already passes `CONTENT.branchForks`, so `CONTENT.rules` is in scope at each — a two-token add:
```js
abilityLawDetail: abilitiesForGM(character, fullCatalog(), CONTENT.branchForks, CONTENT.rules),
```

That's the whole change. No formula edit, no data edit, no new field.

### Optional polish (author's recommendation: include it)
Show the GM **both** numbers so it understands the discount is real and never re-flags it:
```
### Palework — rank 2 "Reading the Rot" (3 energy — base 6, discounted by level+rank)
```
This makes the ability-law block self-explaining: the GM sees the effective cost it must honor AND that the lower number is correct-by-design, killing the false-flag reflex at the source rather than just feeding a different single number. Costs a few tokens per owned ability; worth it — the whole bug was the GM not knowing the discount existed.

---

## VERIFICATION
- `node --check` both files.
- Unit: `abilitiesForGM(silas, catalog, forks, rules)` for Palework rank 2 emits `(3 energy...)`, not `(6 energy)`.
- Regression: a level-1 rank-1 character still reads base (no discount) — e.g. `(6 energy)` — so the block is unchanged where no discount applies.
- Browser leg (Erik): in live play, the GM's ABILITY LAW block should now match the panel, and the spurious Repair-tool suggestion should stop.

## NON-GOALS / GUARDS
- **Do NOT edit `ab.energyCost` in any ability file.** The base is correct; it is meant to be the pre-discount number. Editing it to match the panel is the corruption this spec exists to prevent.
- **Do NOT touch `effectiveEnergyCost`.** The formula is verified correct.
- The per-choice `energyCost` the GM *emits* in the REPLY FORMAT is unrelated and unchanged; this spec only concerns what the GM is *shown* about owned abilities.

## OPEN QUESTIONS FOR CCODE ROUND 2
1. Any other GM-block builder that prints `ab.energyCost` raw (e.g. an inventory/consumable path)? Grep `energyCost` across the `*ForGM` builders and fix any sibling instance in the same pass.
2. Confirm `CONTENT.rules` is the exact object `effectiveEnergyCost` expects (`rules.leveling.*`) — it is at the call sites I read, but verify against the `rules` param shape used elsewhere in `progression.js`.
