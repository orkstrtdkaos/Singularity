# SPEC — `pierce`: an AMOUNT that bypasses soak, distinct from `penetration`

**Aevi → CCode · 2026-08-23 · Erik's design ruling, verbatim:**

> *"On Pierce — we should provide a pierce value (the amount that bypasses the soak) along with the normal
> skill based damage. That way a necrosoak would stop the r2 if it was higher than the skill damage, but it
> wouldn't stop the pierce damage from r3, and would therefore activate the antisoak."*

⛔ **NOT AUTHORED YET. No craft carries `pierce` and I have not added one** — a field with no reader is the
thing we have both spent two days removing. **Build it and I will author it in the same pass.**

---

## §1 — WHAT EXISTS, MEASURED

**`penetration` is a RANK, not an amount.** `skill_battle.js:1020` —

```js
const soak = layers ? layers.filter(l => answers(l) && (l.rank||1) >  pen).reduce(...)
                    : Math.max(0, Number(targetSheet?.soak) || 0);
const cutThrough =   layers ? layers.filter(l => answers(l) && (l.rank||1) <= pen).reduce(...) : 0;
```

**It cuts every layer whose rank is at or below its value; layers above it still soak.** ⚠️ **I first
reported that it was ignored against flat soak — that was WRONG and I withdraw it.** `soakLayers` are
synthesized for every opponent from `rankAt [0,3,6]`, and line 73 falls back to the synthesized set even
for hand-authored sheets. **I read the ternary without tracing where `layers` came from.**

**Authored use today: exactly one craft — `radiant_lance`, `penetration: 2`.**

---

## §2 — ⛔ WHY THE RANK VERSION IS NOT ENOUGH HERE

**`antisoakLanded(hit, soak, antisoak)` returns 0 when nothing gets through. So a craft whose whole
identity is a VULNERABILITY has its identity switched off by sufficient armour.**

**Worked, against a rank-3 decay-typed ward with `penetration: 2`:**

| | result |
|---|---|
| the ward's layer is rank 3, pen is 2 | **not cut** |
| hit 6 vs that soak 8 | **0 through** |
| antisoak 8 | ⛔ **never fires** |

⚠️ **THE CRAFT DOES NOTHING, AND THE MOST INTERESTING PART OF IT — the antisoak — IS THE PART THAT
VANISHES.** Erik's version fixes exactly this.

---

## §3 — THE OUTCOME WANTED

**Damage resolves in two portions:**

1. **SOAKABLE** — normal skill damage, through soak as today (typed layers answer their type, affinities apply).
2. ⛔ **PIERCE — a flat AMOUNT that bypasses soak entirely and always lands.**

**Then `antisoakLanded` sees a non-zero `through`, so the vulnerability applies.**

⚠️ **The two are ADDITIVE, not alternatives** — Erik: *"the pierce damage… plus any unsoaked damage."*

**Worked example, the one Erik described:**

| | r2 (no pierce) | r3 (`pierce 4`) |
|---|---|---|
| hit 6 vs decay-ward soak 8 | 0 through → **antisoak 0 → total 0** | 0 soakable + **4 pierce** → antisoak 8 → **total 12** |
| hit 10 vs soak 8 | 2 through → antisoak 6 → **8** | 2 + 4 pierce = 6 → antisoak 8 → **14** |

⛔ **AND THE COUNTER-PLAY BECOMES REAL:** a decay ward that outvalues the skill damage SHUTS r2 DOWN
COMPLETELY, and merely blunts r3. **That is a defence worth authoring and a capstone worth reaching.**

---

## §4 — ACCEPTANCE

1. A craft carrying `pierce: N` lands **at least N**, whatever the soak, including against a typed layer
   that answers its damage type.
2. ⛔ **The antisoak fires whenever `pierce > 0`** — this is the whole point.
3. `pierce` and `penetration` **coexist and do not overwrite each other**; a craft may carry either, both,
   or neither. ⚠️ **`radiant_lance` must resolve exactly as it does today.**
4. **Affinity still applies first** — `immune` beats pierce. ⚠️ **Your call, but I think immune should
   still mean immune; otherwise `pierce` is a universal answer and nothing in the bestiary is safe.**
5. The GM receipt distinguishes the two portions, so a player can see why armour did not help.

---

## §5 — WHERE I WILL AUTHOR IT

**`hastened_grey` / Necrotic Strike r3** — currently `penetration: 2`, which I will replace or supplement
with a `pierce` value once the reader exists. ⚠️ **The craft's r2/r3 prose already describes your version**
(*"damage lands past armour no matter how much of it there is — and then the antisoak amplifies what
landed"*), so it is currently prose ahead of mechanism and I would rather close that than leave it.

⛔ **Nothing else. One craft, one field, until it proves out.**
