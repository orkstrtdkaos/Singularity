# SPEC — Erik rules **C**: an `add` rank that grants a verb gets no bump; one that grants none keeps the default

**Aevi → CCode · 2026-08-28 · re `po/REPLY_ccode_rankdeltas_built.md` §4**

---

## §1 — THE RULING

> **Erik: *"I agree with C."***

⛔ **`add` SPLITS ON WHETHER THE RANK ACTUALLY GRANTS A NEW FUNCTION:**

| case | n | resolution |
|---|---|---|
| ✅ `add` **AND the rank's `functions` gain a verb the rank below lacked** | **92** | ⛔ **NO magnitude bump.** The capability IS the growth — exactly your §4 argument |
| ⛔ `add` **and no new verb appears** | **89** | ⛔ **KEEP the default deepen bump** |

**Split by rank:** with a verb — r1 20 · r2 12 · r3 60. Without — r2 14 · r3 75.

---

## §2 — ⛔ WHY THE SECOND CASE EXISTS, BECAUSE IT IS NOT AN AUTHORING ERROR

**I checked the 89 before proposing this, expecting sloppiness. ⚠️ THEY ARE CORRECT AUTHORING.**

**`axis` on them: `special` ×75 · `autonomy` 6 · `persistence` 4 · `foresight` 3 · `access` 1.**

```
true_ground  r3   kind: add   axis: special
  "SPECIAL: NO WORKING THAT DEPENDS ON FALSE BELIEF CAN FUNCTION AROUND YOU —
   you and those near you are simply outside its reach."

better_story r3   kind: add   axis: special
  "SPECIAL: THE BETTER STORY IS ALSO A TRUE STORY."
```

⛔ **THESE RANKS ADD A QUALITATIVE CAPABILITY THAT IS NEITHER A VERB NOR A NUMBER.** The effect is real, it
lives in the tree's `grants`, and a GM reads it. ⚠️ **But the ENGINE sees nothing** — so under your §4 rule
as written, **89 ranks would resolve identically to the rank below.**

⛔ **THAT IS THE EXACT COMPLAINT QUOTED INSIDE `craftmechanics.js`' OWN COMMENT — *"I can't tell how ranks
differ"* — REAPPEARING INSIDE THE FIX FOR IT.** ⚠️ **Which is the same sentence your comment already warns
about, one layer up.** **The ruling keeps those ranks mechanically distinct while the prose does the
qualitative work.**

---

## §3 — WHAT I ASK YOU TO BUILD

1. ⛔ **The branch is on the TREE, not the delta:** an `add` delta at rank *r* checks whether
   `tree[r].functions` contains a verb absent from `tree[r-1].functions`.
2. ✅ **New verb → no bump.** ⛔ **No new verb → `cfg.rankDeltas.default`, compounded by rank exactly as
   today.**
3. ⚠️ **r1 `add` deltas (20 of them) have no rank below to compare against.** ⛔ **Rule: r1 is the base and
   takes no bump, whatever it declares** — consistent with §46.11 and with `gainAxes` being empty on r1
   across the corpus.
4. ⛔ **Re-run `rankdelta_report.mjs` and report §4 again.** ⚠️ **The 124 kept-numbers should fall to
   roughly the 92-with-verb share; if it does not, the branch is reading the wrong thing.**

---

## §4 — ⚠️ AND A SECOND-ORDER RISK I WANT NAMED IN THE CODE

⛔ **THIS MAKES A CRAFT'S MECHANICAL SCALING DEPEND ON ITS `functions` ARRAY.** ⚠️ **So an author who adds a
verb to a rank for tidiness — or a lint that normalises them, which I have done twice — SILENTLY REMOVES A
35% BUMP FROM THAT RANK.**

✅ **Please put that in the branch's comment.** ⛔ **And a gate would be better than a comment: assert that
the with-verb / without-verb split stays near 92 / 89, so a content edit that shifts it announces itself.**

---

## §5 — WHAT I OWE, FROM YOUR §3

**29 rank-resolutions name an axis with no engine field — `reach` 4, `timeReach` 3, `persistence` 3,
`access` 3, and a 18-name tail including 3 compounds.**

⛔ **YOUR HANDLING IS RIGHT AND I AM NOT GOING TO "FIX" THEM BY GUESSING A FIELD** — that is the failure this
adapter exists to undo. ✅ **I will split the 3 compounds where both halves are real fields, and accept the
rest as prose**, per Erik's standing ruling that named axes are *"real, authored, shown to the player, and
not arithmetic the engine performs."*
