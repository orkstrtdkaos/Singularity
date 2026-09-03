# SPEC — ground is read from the wrong field, `body` as floor, and per-rank sources

**Author:** Aevi (PO) · **2026-09-02** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2 before any content moves**
**Blocks:** `SPEC_meaning_density.md`

---

## §0 — ⛔ THE PRIMARY FINDING: A CRAFT'S OWN `powerSystem` IS NEVER CONSULTED FOR GROUND

> Erik: *"I'm concerned that you say the craft's powerSystem isn't read at all — it's what the craft itself
> is supposed to use and should be gauged against the power sources and strengths available WHERE the
> player is currently located. The sourceBands are likely an older concept of how a player from a certain
> tradition wants the energy, not the per-craft system."*

✅ **VERIFIED. He is right, and it is live.**

**`substrate.js` → `craftSource(ability, …)`, line 2:**
```js
const tid = ability?.tradition;        // ⛔ NOT ability.powerSystem
```

**The whole chain:**
```
ability.tradition → power_sources.json byTradition[t].primary → sourceBands[source].band
                  → bandFactor(band, density) → chancePenalty = round((1 − factor) × 30)
```

⛔ **`engine/substrate.js` reads `powerSystem` ZERO times.** ⚠️ **The band is a claim about what a TRADITION
draws on. A craft's own declaration of what IT draws on is ignored.**

### ⛔ 55 OF 419 CRAFTS DISAGREE WITH THE TRADITION THEIR GROUND IS TAKEN FROM

| n | craft says | grounded as | bands |
|---|---|---|---|
| 12 | `combination` | `ordered_nanite` 0.9±0.2 | ⚠️ combination is unbanded |
| 11 | `combination` | `wild_nanite` 0.32±0.2 | ⚠️ unbanded |
| 8 | `precursor` 0.9±0.2 | `ordered_nanite` 0.9±0.2 | ✅ same band — harmless |
| 8 | `metaphysical` 0.15±0.22 | `wild_nanite` 0.32±0.2 | ⚠️ overlap 0.12–0.37 |
| **6** | `metaphysical` 0.15±0.22 | `ordered_nanite` 0.9±0.2 | ⛔ **DISJOINT — full inversion** |
| **5** | `metaphysical` 0.15±0.22 | `precursor` 0.9±0.2 | ⛔ **DISJOINT** |
| **2** | `veil` 0.1±0.2 | `precursor` 0.9±0.2 | ⛔ **DISJOINT** |
| **2** | `ordered_nanite` 0.9±0.2 | `metaphysical` 0.15±0.22 | ⛔ **DISJOINT** |
| **1** | `precursor` 0.9±0.2 | `metaphysical` 0.15±0.22 | ⛔ **DISJOINT** |

⛔ **16 crafts are grounded against a band with NO OVERLAP AT ALL** — the ground they want and the ground
they are scored on are mutually exclusive:
`proof_halls` · `stonewise` · `old_roads` · `boundary_stone` · `carrying_call` · `keen_appraisal` ·
`wayfinding` · `tinkers_hand` · `rivercraft` · `quiet_step` · `glasswork` · **`uttered_name`** ·
**`swallowed_word`** · `kept_vigil` · `borrowed_certainty` · `honest_price`

### ⚠️ WORKED EXAMPLE — `uttered_name`, a veil craft grounded as precursor

Veil wants **0.00–0.30**. Precursor wants **0.70–1.00**. Standing at density **0.15 — the craft's perfect
ground:**

| | |
|---|---|
| what the craft declares | 0.15 is inside 0.00–0.30 → **factor 1.00, no penalty** |
| what the engine computes | `x = 0.15 / 0.70 = 0.214`; `0.214^1.15` → **factor ≈ 0.175** |
| ⛔ result | **below `gateBelow: 0.18` — THE CRAFT IS OFF** |

⛔ **A veil craft standing on exactly the ground it wants is switched off, because the engine asked its
tradition instead of the craft.**

### ⚠️ WORKED EXAMPLE — the crossbow

`levelled_crossbow` (marcher) inherits metaphysical `0.15±0.22` → wants 0.00–0.37. In machine-thick country
at **0.85**: `1 − 1.6 × (0.85 − 0.37) = 0.232` → **chancePenalty = −23 points of hit chance.**

⚠️ *"You can hand one to a farmer and they can do it too"* — **and it gets 23 points worse near a Precursor
site.** ✅ Under `body` (`band: null`) → factor 1, penalty 0.

### ⬜ THE FIX, and it is one line

```js
const declared = ability?.powerSystem;                 // what the CRAFT draws on
const tid = ability?.tradition;                        // its lineage
// prefer the craft's own declaration; fall through to the tradition when absent
```

✅ **And it makes §4's per-rank source nearly free**, because `tree[]` would carry `powerSystem` exactly as
it already carries `harmRung` and `backlashRung`.

⚠️ **`combination` (23 crafts) is unbanded** — ⬜ falling through to tradition may be the RIGHT answer there,
or `combination` may need a band derived from its mix. **CCode's call.**

---

## §1 — ⛔ TWO FURTHER CORRECTIONS TO AEVI'S OWN FRAMING

**She proposed adding `body` as a fifth source and giving 39 crafts `powerSystem: "body"`. Both halves
were wrong.**

**1 · `body` ALREADY EXISTS**, authored in `the_substrate.json` → `sourceBands.sources`:

> `body` — ⚑ **`band: null`, `floor: true`** — *"never at a loss anywhere, but never peaks (a floor, not a
> spike)."*

⚠️ **It is not a source with a ground preference. It is a FLOOR** — which is exactly *"it asks nothing of
anything"* expressed mechanically. ⛔ **Nothing needs adding. It needs USING.**

**2 · `powerSystem` DOES NOT DECIDE GROUND — ⚠️ AND PER §0 THAT IS THE DEFECT, NOT THE DESIGN.**
The chain today is:

```
tradition → power_sources.json byTradition[t].primary → sourceBands.sources[source].band
```

➡️ **So a `marcher`/`somatic` fix lands in `power_sources.json`** — ⚠️ **but §0 supersedes the reasoning: the resolver SHOULD read the craft's field, and once it does, `powerSystem` on the craft becomes the primary lever after all.**

---

## §2 — THE ACTUAL DEFECT

| tradition | `primary` | mix | band it inherits |
|---|---|---|---|
| **marcher** (26 crafts) | ⛔ `metaphysical` | `{metaphysical: 1.0}` | `{0.15, 0.22}` — *thin, still ground* |
| **somatic** (13 crafts) | ⛔ `metaphysical` | `{metaphysical: 1.0}` | same |

⛔ **A CROSSBOW CURRENTLY PREFERS THIN GROUND.** `drawn_bow` — *"put an arrow through someone at a hundred
and twenty paces."* `levelled_crossbow` — *"you can hand one to a farmer and they can do it too."*
⚠️ **And under `meaningDensity` it would also want a shrine.**

**The lore file's own heading contradicts its list:** *"The four things power can be"* — and then numbers
**five**, #5 being *"Body and technique — trained flesh, breath, hand, and years. **It asks nothing of
anything.**"* ➡️ **The 08-23 four-source ruling took the heading and dropped the item.**

### ✅ Erik's simplification, and why the data supports it

> *"I'm leaning toward not including body as a source. We already have strength and agility attributes that
> power most of the hit and damage of these skills. Ki is more metaphysical — the body's ability to project
> the metaphysical, so that can stay."*

✅ **`somatic` is 12 of 13 `physical`; `marcher` 15 of 26.** ⚠️ **The `attribute` field is independent of
source, so a `physical` craft rolls off strength and agility either way.** ⛔ **A body SOURCE would be a
second mechanism for work the attribute already does** — which is why `body` is a **floor** and not a band.

✅ **And ki is right to stay metaphysical.** `ki_wield` — *"draw the body's own force out **past the
skin**"* — is body reaching past matter, which is the lore's definition of metaphysical, not an exception
to it.

---

## §3 — ⬜ THE PROPOSED CHANGE (content, one file)

`power_sources.json` → `byTradition`:

| tradition | from | to |
|---|---|---|
| `marcher` | `metaphysical` | ⚑ **`body`** |
| `somatic` | `metaphysical` | ⚠️ **see §4 — it splits** |

⛔ **NOT the craft `powerSystem` fields.** They stay as they are; the resolver does not read them for ground.

⚠️ **Consequence, and it is the lore's own promise:** a marcher becomes **substrate-neutral** — never
starved, never spiked, effective in the Quickwood and in machine-thick country alike. *"Thin ground is
quiet ground: natural craft is at its best where the lattice is at its worst"* stops being flavour.

---

## §4 — ⛔ AND THIS IS WHERE ERIK'S RANK QUESTION BITES

> *"Check if it's feasible to have rank-based power sources. The basic Edge ranks are body based, but the
> r3 multistrike might want metaphysical."*

⚠️ **`somatic` cannot be answered per-tradition.** `ki_wield`, `ki_thorns` and `false_stance` are
metaphysical by Erik's own reading; `quick_hands` and `steady_hands` are technique. ⛔ **A per-tradition
`primary` is all-or-nothing and gets one of them wrong.**

### ✅ FEASIBILITY: YES, and narrowly

**The resolver already branches on something finer than tradition.** `substrate.js:249`:

```js
if (school?.extension) return { traditionId: tid, school, source: school.extension, via: "school" };
if (row?.primary)      return { traditionId: tid, source: row.primary, mix: row.mix, via: "tradition" };
```

➡️ **A rank branch is ONE MORE of the same shape**, and the precedent for reading a per-rank value is one
line — `intent.js:8`: `const entry = (ab.tree||[]).find(t => t.rank === level); return entry?.harmRung ?? ab.harmRung`.

✅ **`tree[]` already carries per-rank `harmRung`, `backlashRung`, `functions`, `grants`, `cannot`,
`gains`, `gainAxes`.** ⚑ **`source` is the same shape.**

**Resolution order would become:** `rank → school → tradition`, each falling through.

### ⚠️ THE ONE REAL COST

`craftSource()` currently takes `(character, traditionId)`. ⛔ **A rank branch needs `(ability, level)`
threaded to every call site.** ⬜ **CCode: how many call sites, and do they all have the ability in hand?**
⚠️ **That, not the tree field, is the whole cost.**

⛔ **AND `powerSystem` STAYS PER-CRAFT.** 51 reads across 16 files — art, access gating, grouping,
progression. **None of them wants a rank.** ✅ **Only the GROUND varies by rank, and ground does not read
`powerSystem` at all.**

---

## §5 — ROUND 2 QUESTIONS

1. ⛔ **How many `craftSource()` call sites**, and do they have the ability and level available?
2. **Is `body`'s `floor: true` actually honoured** in `bandFactor`? ⚠️ `band: null` returns factor 1 at
   line 180 — is that the same thing as a floor, or is the floor unimplemented?
3. ⬜ **Does anything else key off `byTradition[marcher].primary === "metaphysical"`** — art aesthetic,
   access, nexus scoring? ⚠️ **Changing it must not silently move something else.**
4. **Which somatic crafts split which way?** ⬜ Aevi's read: ki_wield · ki_thorns · false_stance stay
   metaphysical; quick_hands · steady_hands and the rest take body. ⚠️ **Erik's call, not measurement.**
5. ⚠️ **Marcher r3 multistrike** — Erik named it. ⬜ Is that a real craft id, and are there others where the
   top rank leaves technique behind?
