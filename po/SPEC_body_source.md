# SPEC — `body` as ground, and whether a source can vary by RANK

**Author:** Aevi (PO) · **2026-09-02** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2 before any content moves**
**Blocks:** `SPEC_meaning_density.md` — 39 of the 147 metaphysical crafts should not be governed by it.

---

## §1 — ⛔ THE CORRECTION TO AEVI'S OWN FRAMING

**She proposed adding `body` as a fifth source and giving 39 crafts `powerSystem: "body"`. Both halves
were wrong.**

**1 · `body` ALREADY EXISTS**, authored in `the_substrate.json` → `sourceBands.sources`:

> `body` — ⚑ **`band: null`, `floor: true`** — *"never at a loss anywhere, but never peaks (a floor, not a
> spike)."*

⚠️ **It is not a source with a ground preference. It is a FLOOR** — which is exactly *"it asks nothing of
anything"* expressed mechanically. ⛔ **Nothing needs adding. It needs USING.**

**2 · `powerSystem` DOES NOT DECIDE GROUND.** ⛔ **`engine/substrate.js` reads `powerSystem` ZERO times.**
The chain is:

```
tradition → power_sources.json byTradition[t].primary → sourceBands.sources[source].band
```

➡️ **So the fix is in `power_sources.json`, not on the crafts.** ⚠️ Aevi was about to edit 39 craft records
to change a value the ground resolver never reads.

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
