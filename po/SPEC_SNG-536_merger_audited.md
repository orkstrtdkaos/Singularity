# SPEC SNG-536 — The 14-tradition merger, audited and completed

**Author:** Aevi (PO) · **Date:** 2026-08-23 · **For:** Erik's ruling, then CCode
**Proposal file:** `content/packs/core/rules/traditions_v2.json` — authored 2026-08-15, unmigrated since

---

## §1 — ⛔ THE PROPOSAL SURVIVES ITS OWN AUDIT

**Re-measured against everything ruled since it was written.**

**24 sect→source allocations. ⛔ ZERO MISMATCHES against the 2026-08-15 canon primaries.** ⚠️ **Including
the ones Erik overturned afterwards** — figurist is `wild_nanite` (*"abstract is a crazy impression, like a
wild dream"*), cogitant is `metaphysical`. **The proposal already said so.**

**That is the strongest thing I can say for it: it was written before the power-source audit and the audit
agreed with it.**

### Sizes, live

| tradition | n | sects |
|---|---|---|
| **Death** | 32 | ashwarden · threnodist |
| **Dark** | 29 | umbral · veilwright |
| **Mind** · **Breaking** · **Span** | 28 each | |
| **Light** | 25 | blazeborn · verist |
| **Body** · **Building** | 24 each | |
| **Order** | 22 | enginewright · lattice |
| **Demonic** | 19 | abyssal |
| **Life** | 15 | rootkin |
| **Chaos** | 14 | churnfolk |
| **Angelic** | 13 | seraphic |
| ⚠️ **Spirit** | **10** | numinous |

⛔ **Spirit at 10 against Death at 32 is the imbalance, and it is the one that matters** — Spirit carries
Parakletos, the Thinnings and the Veil contact point. **The most cosmologically loaded tradition has the
fewest crafts.**

---

## §2 — ⛔ 62 ABILITIES BELONG TO NO PROPOSED TRADITION

**And they sort into four groups, not one problem.**

### 2a · Foothills — 35 crafts, ⛔ AND THEY SHOULD NOT BE TRADITIONS

`harmonic` 15 · `radiant_folk` 14 · `god_named` 3 · `bargainers` 3

**All four have authored parent blends.** ⚠️ **A foothill is where a pole becomes purchasable** — it is not
a fifteenth tradition and folding it in would destroy the distinction. ⛔ **THEY STAY OUTSIDE THE FOURTEEN
AND KEEP `tradition: <foothill>`.**

**But the schema must say so.** ⚠️ **Today a foothill and a tradition look identical in an ability record**,
which is why they read as orphans. ⛔ **Proposal: `traditionKind: "pole" | "foothill" | "folk"`.**

### 2b · `valley_craft` — 18 crafts, ⛔ THE LARGEST ORPHAN AND NOT A FOOTHILL

**No parents authored. It is the FOLK COLLECTION** — what ordinary people do without a tradition's
apparatus.

⛔ **IT SHOULD NOT GAIN PARENTS.** ⚠️ **Its whole character is having none** — Erik ruled the same thing on
`body` as a source: *reaches for nothing, so nothing can be taken from it.* **`traditionKind: "folk"`, and
it stays.**

### 2c · `precursor` as a tradition — 6 crafts, ⛔ THIS IS A REAL DEFECT

`latticespeak` · `wake_the_line` · `foreclose` · `unmake_seal` · `hold_the_aperture` · `address_sense`

⛔ **`precursor` IS A POWER SOURCE, NOT A PEOPLE.** ⚠️ **Six crafts carry a source name in their `tradition`
field — the same category error I cleared from 321 `powerSystem` fields, running the other direction.**

**They read as `lattice` work:** *speak to the lattice · wake a line · close an aperture · unmake a seal ·
read the address layer.* ⛔ **RECOMMEND: `tradition: "lattice"`, which puts them in Order** — where
Latticework already is.

⚠️ **Erik should rule.** The alternative is that these are **nobody's** — Precursor works nobody living
was taught — which is a real and interesting answer and would need its own kind.

### 2d · `cross_pole_braid` — 3 crafts

`harbored_flame` · `turning_word` · `meaning_engine`. ⛔ **A braid has no single people by definition.**
**`traditionKind: "braid"`, and they stay outside.**

---

## §3 — ⛔ WHAT THE MERGER ACTUALLY COSTS

**The 24 poles do not disappear. They become SECTS.** ⚠️ **And that is the whole value:**

| | today | after |
|---|---|---|
| a craft's lineage | `tradition: cogitant` | `tradition: Mind`, `sect: cogitant` |
| ⛔ **what breaks** | — | **every reader of `tradition`** — CCode measured 52 sites |
| ⛔ **the ring** | 24 positions, p↔p+12 | **14, p↔p+7 — EVERY ANTIPODE MOVES** |

⛔ **CCODE'S WARNING STANDS AND I WOULD NOT WEAKEN IT:** *"a game-rule change wearing a rename."* **The
antipode is what decides which crafts are closed to whom.**

---

## §4 — MY RECOMMENDATION

**Migrate, and do it as one change set with the three-field shape:**

```
tradition: "Mind"          ← the fourteen
sect: "cogitant"           ← the twenty-four, preserved
traditionKind: "pole"      ← pole | foothill | folk | braid
```

⚠️ **`sect` IS THE PART THAT MAKES THIS SAFE.** Nothing is lost — `sectFlavour`, school derivation, the
foothill parent blends and every craft's actual lineage all still resolve. ⛔ **The 52 readers move from
`tradition` to `sect` where they mean lineage, and stay on `tradition` where they mean domain.**

**And I would do it AFTER Spirit is audited, not before.** ⚠️ **Spirit at 10 crafts is the tradition the
merger will expose hardest** — a 14-way ring with one position holding a third of another's content is a
balance problem the current 24-way ring hides.

---

## §5 — ⛔ WHAT I NEED RULED

1. **`precursor`-as-tradition, 6 crafts** — `lattice`, or a new kind for *nobody's*?
2. **`traditionKind`** — does the three-way distinction earn a field, or should foothills be inferred from
   `foothills.json`?
3. ⚠️ **Migration order** — audit the remaining traditions first, or migrate first and audit inside the new
   shape? **I lean audit-first, because a merge is easier to argue about when both halves are finished.**
4. ⛔ **Spirit at 10.** Audit it next and author into it, or accept the asymmetry?
