# RULING — `meaningDensity` is derived, and metaphysical reads two grounds

**Ruled by:** Erik · **2026-09-04** · **Recorded by:** Aevi
**Answers:** `DECISIONS_OWED_20260904.md` **Q7** · unblocks `SPEC_meaning_density.md`
**subject:** meaning-density
**bodyAnchor:** "MEANING SETS THE CEILING, SUBSTRATE SETS THE PENALTY"

---

## R38a — `meaningDensity` is DERIVED, never stored ✅ RULED

⛔ **CCode measured it as an ORPHAN:** no engine reader, no body section — `scripts/subject.mjs
meaning-density` finds it only in a spec.

✅ **Derivation is cheap and the signals are already authored:**

| signal | on |
|---|---|
| `tags: sacred` | ⚑ **42 of 135 locations** |
| `tags: locus` · `cult` · `home` | 18 · 18 · 20 |
| `tier` — settlement / region / site | 135 |
| `communityId` | 134 |
| `npcsPresent` | who is actually there |

⛔ **AND THE PROJECT ALREADY FORBIDS THE ALTERNATIVE.** `foothills.json`: *"a stored copy of a derived value
is the failure that produced this ticket. **DO NOT RE-ADD THEM**"* — ⚠️ **and then every row stored one.**
➡️ **Derived, computed on demand, never written to a location.**

⚠️ **AND IT IS DYNAMIC, per Erik 2026-09-02:** *"people living somewhere carries meaning."* ⛔ **A place
gains meaning as people live there and LOSES IT WHEN THEY LEAVE** — which is why the Wends' `unspooling` and
Saba's road are mechanical rather than sentimental.

---

## R38b — ⛔ MEANING SETS THE CEILING, SUBSTRATE SETS THE PENALTY ✅ RULED

**Erik chose shape 1 of three.**

⚠️ **Metaphysical is the ONLY source that reads two grounds, and they pull against each other:**

| ground | asks | answers |
|---|---|---|
| ⚑ **meaning density** | **how much is there to work with** | the CEILING — what the craft can reach |
| ⚑ **substrate density** | **how cleanly you can reach it** | the PENALTY — apparatus in the way |

```
metaphysical effect ≈ f(meaningDensity)   capped
                    − g(substrateDensity) penalty for apparatus
```

⛔ **REJECTED — shape 2, meaning REPLACES substrate.** Simplest, one number. ⚠️ **But it deletes the
Numinous's whole problem**, and that problem is authored.

⛔ **REJECTED — shape 3, they MULTIPLY** (`meaning × (1 − apparatus)`). ⚠️ Elegant and brutal: **a place with
both would be worse than a place with neither.** Too punishing.

### ✅ WHY SHAPE 1 IS RIGHT: IT RESOLVES A THREE-WAY CANON CONTRADICTION FOR FREE

**Three authored statements about the Numinous could not all be true:**

| | |
|---|---|
| **A** | metaphysical *"wants thin ground"* — band `{0.15, 0.22}` |
| **B** | the Numinous are *"helpless where the lattice is gone"* |
| **C** | they are metaphysical 0.7 and their region reads **0.82 — dense** |

➡️ ⚑ **UNDER R38b ALL THREE HOLD.** They live at 0.82 **because that is where the MEANING is**, and are
permanently slightly obstructed by the ground they must stand on to reach it.

⚠️ **AND THEIR OWN CRAFTS SAID SO ALL ALONG:** `numen_sense` reads *"where **MEANING** runs dense"*;
`thin_place` reads *"where **SIGNIFICANCE** runs dense."* ⛔ **Nobody was reading the word.**

### ⚑ AND IT GIVES THE TRADITION SOMETHING TO SEEK

**Thin ground with high meaning is RARE and worth finding** — an abandoned shrine, a battlefield nobody
tends, a holy place the lattice never reached. ➡️ ⚠️ **A Numinous character now has a reason to travel that
no other tradition has.**

---

## ⬜ FOR CCODE

1. **Where does the derivation live** — a function beside `substrateDensity`, computed per location on
   demand?
2. ⛔ **The two-ground read is a RESOLUTION CHANGE.** ⚠️ Every other source reads one number; ⬜ **can
   `groundCardFor` carry a second term, or does the card shape have to change?**
3. **Weights.** ⬜ Aevi has no basis for how `sacred` weighs against `tier` against population.
   ⚠️ **A first pass can be crude — the SHAPE is what was ruled.**
4. ⬜ **Does anything else want meaning?** ⚠️ **`the_gathering` starves where endings are attended, and R29
   made attending the mechanism** — a well-attended place plausibly carries meaning too.
5. ⚠️ **Does the ceiling apply to all metaphysical crafts, or only those that reach for significance?**
   ⛔ `ki_wield` is metaphysical and is a body craft; ⬜ **a shrine should probably not make someone punch
   harder.**

---

## ✅ CCODE ROUND 2 — 2026-09-04 · BUILT v1.9.348 · gated `§69`

1. **Where it lives:** `substrate.meaningDensity(location, { present, data })` beside `locationDensity`, plus
   `peoplePresentAt` for the dynamic half and `meaningCeiling` for the shape. Never written to a location.
2. **The card carries a second term** — no shape change: `groundCardFor` returns `meaning`, `ceiling`, `meaningBound` for a
   source in `meaning.appliesTo`, and the craft's `factor` is `min(ceiling, band factor)`. And since Q3 made the ROLL this
   card, the two-ground read reaches the roll for free.
3. **Weights (crude, yours to turn — `the_substrate.meaning`):** base 0.1 · sacred 0.35 · locus 0.2 · cult 0.15 · home 0.1 ·
   settlement 0.15 / region 0.1 / site 0.05 · a community 0.1 · 0.04 per person present (cap 0.2) · `ceilingFloor` 0.35.
   Choirheight 0.75 → ceiling 84%; a fringe 0.20 → ceiling 48%.
4. **Does anything else want meaning?** Not wired. `the_gathering`'s attendance (R29) is the natural next signal — an
   attended ending could raise a place's meaning for a season. ⬜ Logged.
5. **All metaphysical crafts, or only those that reach for significance?** All, by default — and a craft opts out with
   `mechanic.meaning: "none"` (reader before field). ⬜ `ki_wield` and the other body crafts under a metaphysical source
   are yours to tag; until then a shrine does, in fact, let someone punch harder.
