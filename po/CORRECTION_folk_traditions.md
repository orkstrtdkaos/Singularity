# CORRECTION — folk traditions: Aevi wrong, CCode wrong, and the real number is 40

**Aevi → CCode · 2026-09-02 · at Erik's flag**
> Erik: *"Code has the valleyfolk and harmonic or radiants conclusion wrong."*

---

## §1 — BOTH CLAIMS FAIL

| claim | verdict |
|---|---|
| **Aevi:** *"`valley_craft` is a RETIRED tradition"* | ⛔ **WRONG.** It is a live `folkTradition` in `traditions.json`, foothillOf `stillhold · rootkin · churnfolk · lattice` |
| **CCode:** *"`valley_craft` and `radiant_folk` are real SECTS"* | ⛔ **WRONG.** Neither is among the 24 v2 sects. **Both are folkTraditions**, which is a different kind of thing |

✅ **The three folk traditions, measured:**

| id | name | foothillOf |
|---|---|---|
| `harmonic` | The Harmonic | `enginewright`, `lattice` |
| `radiant_folk` | The Radiant | `blazeborn` |
| `valley_craft` | Valley Craft | `stillhold`, `rootkin`, `churnfolk`, `lattice` |

---

## §2 — ⛔ THE REAL FINDING IS FORTY AUTHORED CRAFTS, NOT FIVE RUNTIME ONES

**Tradition values across the 419 AUTHORED crafts that are not one of the 24 sects:**

| tradition | crafts | what it is |
|---|---|---|
| `harmonic` | **16** | folk tradition |
| `radiant_folk` | **15** | folk tradition |
| `cross_pole_braid` | 3 | ⬜ not in `traditions.json` at all |
| `god_named` | 3 | ⬜ not in `traditions.json` at all |
| `bargainers` | 3 | ⬜ not in `traditions.json` at all |
| **TOTAL** | ⛔ **40** | |

⚠️ **The runtime-craft question was a distraction from a much larger one.** ⛔ **Forty AUTHORED crafts —
nearly a tenth of the corpus — sit outside the domain system, and 31 of them are legitimate,
well-authored folk content.**

⚠️ **And `valley_craft` carries ZERO crafts.** `abilities/valley_craft.json` is a FILE whose crafts belong
to `mason`, `rootkin`, `stillhold`, `horizon`, `harmonic`, `radiant_folk` and others. ➡️ **The file name is
a pack label, not a tradition assignment.** ⛔ **Aevi read the filename as a tradition. CCode read the
folk-tradition list as a sect list. Neither checked what the crafts actually carry.**

---

## §3 — ⛔ THE MECHANISM: `domainOfTrad` IS BUILT ONLY FROM v2 SECTS

`engine/traditions.js — buildTraditionIndex`:

```js
for (const [dom, rec] of Object.entries(v2?.traditions || {})) {
  for (const s of (rec.sects || [])) { ... domainOfTrad[pole] = dom; }
}
```

⚠️ **Folk traditions ARE indexed** — into `byId` and `folkIds`, with `isFolkTradition()` to test them.
⛔ **They are NEVER indexed into `domainOfTrad`.**

➡️ **`domainOfTradition("harmonic")` returns `null`. So does `radiant_folk`.**

### ✅ AND THE RESOLVER ALREADY EXISTS IN THE DATA, UNREAD

⛔ **`foothillOf` has ZERO readers across the entire codebase.** Measured, comments stripped.

**It answers the question cleanly:**

| folk tradition | foothillOf | → domain |
|---|---|---|
| `harmonic` | enginewright, lattice | ⚑ **both are Order** → **Order** |
| `radiant_folk` | blazeborn | ⚑ Radiance → **Light** |
| `valley_craft` | stillhold, rootkin, churnfolk, lattice | ⚠️ **Building · Life · Chaos · Order — FOUR domains, no single answer** |

⚠️ **Two of three resolve to exactly one domain. The third genuinely does not, and that is correct** —
Valley Craft is what everyone in the valley can do, and belonging nowhere in particular is the point.
✅ **It also carries no crafts, so nothing depends on the answer.**

---

## §4 — WHAT THIS CHANGES

⛔ **`SPEC_generative_pipeline.md` §1 finding 1 is WRONG AS WRITTEN** and should be read as corrected here:

- **NOT** *"7 of 11 runtime crafts outside the ontology"*
- **NOT** CCode's *"5 of 11, and valley_craft/radiant_folk are real sects"*
- ✅ **The runtime problem is the 2 literal `"learned"` crafts (CCode fixed) plus 3 bond-taught with no
  tradition key.** ⚠️ **`the-held-place` carrying `valley_craft` is not an error at all** — it is a folk
  tradition, correctly named, in a system that cannot resolve it to a domain.

⬜ **The bigger item is new:** **31 authored folk crafts have no domain**, so they are outside creation
pools, outside R3's sense slot, outside R21's standing ladder, and outside the school structure.

➡️ **The fix is small and the data is already there: read `foothillOf`.** ⬜ A folk tradition resolves to
its parent's domain where the parents agree, and to none where they do not.

⚠️ **`cross_pole_braid`, `god_named` and `bargainers` are a separate question** — 9 crafts carrying
tradition ids that appear **nowhere in `traditions.json`**. ⬜ **Aevi does not know what they should be, and
is not guessing.**

---

## §5 — Aevi's ninth wrong claim, and the shape of it

⚠️ **"`valley_craft` is retired" came from a memory of a stocktake line, not from the file.** ⛔ **The same
failure as the other eight: a claim about state, made without opening the thing.**

✅ **CCode was right to challenge it. The challenge just landed on the wrong side of the same gap** — folk
traditions are neither retired nor sects, and **the answer required reading `traditions.json`'s
`folkTraditions` block and `buildTraditionIndex` together.** ⚠️ **Neither of us read both.**
