> ⛔ **NUMBERS SUPERSEDED — THIS PLAN WAS BUILT PARTLY ON A STALE MATRIX. Re-measured 2026-08-23:**
> Death is **32 crafts / 90 ranks**, not 30/84. **Step 2 is STRUCK** — `deathsense` and `the_true_feeling`
> are `first_gift_template` cohort members and inherit their fields at load; authoring them would detach
> them permanently (SYSTEM_SPEC §46.4). **Step 5 collapsed** — §31.2 exempts *The Cut Thread* by name and
> the corpus is under the article threshold. **§4's veil proposal is WITHDRAWN** — Erik ruled 2026-08-23
> that veil powers thin the Veil and that inward/outward is a per-craft heuristic. **§37.9's ward
> conclusion is INVERTED** — Mind and Body are not robustness-audited, so their agreement was a shared gap,
> not a norm. ⚠️ **The MEASUREMENT DISCIPLINE below stands; several of its conclusions do not.**

# PROPOSAL — the Death audit, planned before it is written

**Author:** Aevi (PO) · **Date:** 2026-08-23 · **Status:** ⛔ **FOR CCODE REVIEW — nothing authored yet**
**Erik, this session:** *"Let's learn before we write."* **This document is the learning.**

**Read against:** `SYSTEM_SPEC` §29 PO lane · §30 cosmology/Veil · §31 naming · §32 authoring ·
§37 one-pass audit · §44 session close · `po/AUTHORING_PROCESS_aevi.md` §1–§3
**Measured at:** HEAD `56a01da`, local clone, `node tests/content_which.mjs` run.

---

## §0 — TWO THINGS I GOT WRONG BEFORE WRITING THIS, RECORDED FIRST

⛔ **1. I proposed a `veil` allocation for Death out of my own reading, then found §30.3 and §44.1 and
had to withdraw half of it.** The correction matters more than the proposal — see §4.

⛔ **2. I built my Death skill list from `po/MATRIX_death.md` and it is short by two.** §37.1 says
*measure the corpus, not your own work*; I measured the artifact instead. Querying `tradition ∈
{ashwarden, threnodist}` returns **32**, the matrix knows **30**. This is `VerifyContentNotAddress`
firing again, on me, inside the session that named it.

⚠️ **`MATRIX_death.md` is a STALE CACHE and must not be read as state.** It still prints `attribute`,
`combination` and reach-ids in the source column and twelve `BOUND NOT AUTHORED` — **all fixed at
origin.** Regenerating it is step 1, not step 12.

---

## §1 — MEASURED STATE (§37.1), Death = ashwarden + threnodist

**32 skills · 84 authored ranks + 6 unmeasured (the two invisible crafts).**

| | tracker/matrix says | **origin says** |
|---|---|---|
| bad `powerSystem` | ⛔ 24 | ✅ **0** |
| unauthored bounds | ⛔ 12 | ✅ **0** |
| skills | 30 | ⛔ **32** |
| `mechanic.crit` | — | **13 / 32** |
| `mechanic.wardTypes` | — | **5 / 32** |
| `imposes` | — | ⛔ **0 / 32** |
| `ongoingHarm` | — | ⛔ **0 / 32** |
| no `targets`/`area`/`scope` | — | 2 — Ask the Dead, Feeling Road |

**`node tests/content_which.mjs` — 1 of 7 failures is Death:**
`W6 grief_that_stops — damageType=grief and no ward in the corpus answers it.`

---

## §2 — ⛔ THE TWO INVISIBLE CRAFTS ARE THE REAL FIND

`deathsense` (ashwarden) and `the_true_feeling` (threnodist) are absent from the matrix because they
are **missing the fields the generator keys on**.

| missing (§32.6) | `deathsense` | `the_true_feeling` |
|---|---|---|
| `levelReq` | ⛔ | ⛔ |
| `energyCost` | ⛔ | ✅ (1) |
| `shape` | ⛔ | ⛔ |
| `harmRung` | ⛔ | ⛔ |
| `nativeOrCombination` | ⛔ | ⛔ |
| rank `harmRung` | 3 of 3 | 3 of 3 |
| rank `gains` | 2 of 3 | ✅ |

⛔ **`shape` MISSING IS A LIVE ENGINE DEFECT, NOT A TIDINESS ONE.** `craftmechanics.js` resolves
`craft.mechanic.<field> → familyDefaults[<shape>].<field> → the verb does not use that dimension`.
**With no `shape` there is no family, so the fallback tier is unreachable** — these two crafts get
whatever is literally on `mechanic` (`{range:20}` and `{range:15}`) and nothing else. **They resolve
to almost nothing and no gate says so.** That is `AuthoredCorrectAndInvisible` at the field level.

**They also trip three SOP patterns:**

- ⛔ **§37.3 pattern 5 — THE SAME NAME TWICE.** `the_true_feeling` vs Grief Strike r1 **True Feeling**.
- ⛔ **§31 naming.** Every rank on both is `The X`: *The Long Count · The Hour Known · The Actual State ·
  The Feeling Trail · The Emotional History*. §31.3 — that is five headings, not five things you do.
- ⚠️ **§32.11 Q4 — `The Long Count` is The Kept Count wearing a different noun.** Erik cut that one:
  *"it told you a number the GM was going to have to decide anyway."*

---

## §3 — ⛔ THE BLOCKER: `power_sources.json` HOLDS TWO TRADITION TABLES AND THE ENGINE READS THE STALE ONE

| table | entries | read by |
|---|---|---|
| `byTradition` | 31 | ⛔ **`engine/substrate.js:420` `craftSource()`** — the live ground-card fallback |
| `byTradition_primary_20260815` | 24 | `tests/content_which.mjs` only |

**They disagree on 20 of 24 shared traditions.** ⛔ **Eleven old values are not valid sources at all** —
`body` (removed, SNG-487), `nanite`, `wild`. **Ashwarden reads `primary: body, mix{body 0.85,
precursor 0.15}` while all 18 Ashwarden crafts carry `metaphysical`.**

⛔ **IT FAILS SILENTLY AND THAT IS THE WHOLE PROBLEM.** `fieldOfSource()` ends in `|| "substrate"`, so a
deleted source does not throw — **it scores the craft on the lattice axis.** Metaphysical wants thin
ground (band `{0.15, 0.22}`); the card grades it as if it wanted dense. **Wrong answer, confident
render, no gate.** §29.4: *a duplicate key is worse than a missing one.*

⚠️ **Worst blast radius is the school-less traditions**, because §29's own comment says the mix exists
for exactly those: **`valley_craft` (18 crafts, the starting Valley set)**, `harmonic`, `radiant_folk`.
⛔ **All seven school-less traditions are missing from the new table entirely** — `god_named` ·
`bargainers` · `valley_craft` · `harmonic` · `radiant_folk` · `precursor` · `cross_pole_braid`.

### ⛔ 3a — AND IT IS NOT OLD-VS-NEW. IT IS TWO ERIK RULINGS A WEEK APART.

**I was about to recommend "new table wins." That is wrong, and I found out by reading the `why` fields
instead of the values.**

| tradition | `byTradition` (08-08) | `byTradition_primary` (08-15) |
|---|---|---|
| **seraphic** | `nanite` — ⛔ *Erik 2026-08-08: "the Seraphs and Abyssals are mostly nanite"* | `ordered_nanite` — *"administration is machinery"* |
| **abyssal** | `nanite` `{nanite .5, wild .3, veil .2}` — ⛔ *Erik 2026-08-08* | ⛔ **`precursor`** — *"demons draw on the alien source directly"* |

⛔ **Abyssal is not a shorthand mismatch — it is nanite-primary in one and precursor-primary in the
other, and BOTH cite Erik.** ⚠️ **The old table is not stale by neglect; it carries the 08-08 rulings and
the mix weights, and the new table carries the 08-15 four-source restructure and no weights.**

**So the reconciliation is a ruling, not a repair.** ⛔ **[A] I withdraw "new wins."** The mechanical
part (`body`/`nanite`/`wild` → valid source names) is safe; **the primaries where the two disagree on
substance — seraphic, abyssal, and the 18 others — need Erik.**

⚠️ **`po/ALERT.md` still tells CCode numinous is veil-primary at 0.6. It is not** — Erik reverted that
on 2026-08-08, one hour after I made it. **CCode: that correspondence is stale, do not build from it.**

**I am not repairing any of this inside a Death pass.** It is corpus-wide, it needs seven authored
primaries plus an adjudication between two of Erik's own rulings, and folding it into a tradition audit
is how it stays invisible again.

---

## §4 — ⛔ THE VEIL QUESTION, AND MY WITHDRAWN ANSWER

**I proposed Hastened Grey / The Cut Thread / Grey Road as `veil` primaries. I withdraw it pending a
ruling, because I had conflated two canon objects that share a word:**

| | what it is | where |
|---|---|---|
| **veil-as-SOURCE** | one of the four powers. `precursor : ordered_nanite :: veil : metaphysical` | §44.1, `power_sources.json` |
| **veil-EFFECT** | ⛔ **a perpendicular axis** — what your drawing *does to the divide*: strengthens / thins / neutral / bidirectional | §30.3 |

⛔ **§30.3 names Death explicitly: *"Chaos, Life, Body, Death and Mind are genuinely neutral — the only
messengers either side can trust."*** And §30.3 puts **`thins`** on *"Veilwork · anything performed at a
Thinning."*

**So the question is a real one and it is Erik's, not mine:**

> ⛔ **If a Death craft is veil-SOURCED, does it thin the divide — and therefore break the neutrality
> §30.3 grants Death?**

**If yes:** Death takes **no** veil primaries; `metaphysical` is already correct for all 18 Ashwarden
crafts, and §44.1's *"a metaphysical craft is not a lesser Veil craft, it is an approximation reached
from the human side"* is exactly what Palework is. ⚠️ **[A] This is the reading I now favour.**
**If no:** my original three stand as candidates.

⚠️ **Existing veil appearances are all mixes, never primaries:** `numinous` 0.05 · `abyssal` 0.2 ·
`bargainers` 0.1 · `keening`'s mix · `wild_current` 0.4. **[A] The pattern says veil arrives as a
MIX term.**

### ⛔ 4a — THE PRECEDENT: A VEIL PRIMARY WAS TRIED ONCE AND ERIK REVERTED IT IN AN HOUR

**I made `numinous` veil-primary at 0.6 on 2026-08-08. Erik: *"are you saying that a Numinous likes a
thick boundary?"*** ⛔ **My own sentence contradicted the veil band I had authored the same hour.**
**Three pieces of evidence I held and did not check:** `the_substrate.json` lists the Numinous among
*theContinuous* (helpless where the lattice is gone) · their region is **dense at 0.82** · **nine of
their ten crafts are about MEANING-density, not a membrane.**

⚠️ **THE ERROR WAS REGISTER: their aesthetic says *"thinning veils"* as MYSTIC IDIOM and I read it as
the cosmological Veil.** ⛔ **That is exactly the move I was about to repeat on Death** — Ashwarden
prose is full of thresholds and things going grey, and **a threshold in funeral idiom is not the Veil.**

**So the bar for a veil primary is: the craft must fail where the lattice is DENSE and work where it is
GONE, in the substrate data — not in the prose.** ⛔ **Death's own region, the Palelands, reads 0.32.
That is mid, not thin, and it is the same shape of evidence that sank the Numinous claim.**

**[A] My recommendation: Death takes no veil primary. Test the Demonic (Descent — Lucifer wanted the
Veil thinned, and `abyssal` already carries veil 0.2) against the substrate data when that tradition
comes up, and let the density evidence rule rather than the idiom.**

---

## §5 — ⛔ `targetScope` DOES NOT EXIST, AND I THINK CHECKLIST STEP 8 SHOULD BE RETIRED

`TRACKER_traditions.md` step 8 says *"Declare a target scope on every rank."* **`grep -r targetScope
content/packs/core` returns 0.** The matrix's `TGT` column is **derived**, not authored.

⛔ **Authoring it would be §32.16 exactly** — a second field beside a working first. `mechanic.targets`
/ `area` / `scope` exist, are read, and have family fallbacks. **[A] Retire step 8; treat TGT as a
derived column and fix the two crafts that genuinely declare no reach.** ⚠️ **CCode: is there a reader
I have not found?** — this is the question I most want checked.

---

## §6 — ⚠️ PRICING (§32.17), five outliers

| craft | L | e | band | read |
|---|---|---|---|---|
| Wellspring | 1 | **1** | 2–6 | ⛔ §32.15 — priced by an author who did not believe in it |
| Feeling Road | 2 | **1** | 2–6 | ⛔ same |
| Felt Wall | 2 | **1** | 2–6 | ⛔ same |
| Set Hand | 3 | **9** | 4–8 | ⚠️ defensible — seasons-long autonomy, §32.17 *+1–2 permanent* |
| Calling Back | 3 | **12** | 4–8 | ⚠️ defensible — it reverses death |

⛔ **The three at e1 are the same three the tracker flags as `attribute`-legacy and the same three
carrying unauthored-bound history.** ⚠️ **§32.15's test — would a player rather have this or a rope?**

---

## §7 — PROPOSED ORDER, and it deviates from §37.6 in one place

**§37.6 is: cut → merge → repurpose → author gaps → fix bounds → fix sources → rebalance → schools →
matrix → table.** ⚠️ **Bounds and sources are already done for Death, so those two steps are no-ops.**
⛔ **I want to move `regenerate the matrix` from step 12 to step 0**, because every number I would audit
against is currently wrong.

| # | step | acceptance test |
|---|---|---|
| **0** | ⛔ **Regenerate `MATRIX_death.md` from the corpus by tradition-query** | matrix lists **32**, and `deathsense` + `the_true_feeling` appear |
| **1** | **Revert file** before the first edit (§37.6) | `po/backups/` holds full pre-edit state of both ability files |
| **2** | ⛔ **Schema-complete the two invisible crafts** — `levelReq`, `energyCost`, `shape`, `harmRung`, `nativeOrCombination`, rank `harmRung`/`gains` | `content_ci` green; both resolve a `familyDefaults` tier |
| **3** | **Six-question assessment (§32.11) written out for all 32** | a file, not a claim — one paragraph per craft |
| **4** | **Merge pass on the reading-an-ending cluster** — `deathsense` · Attended End r1 *Patient Gaze* · True Account r1 *Reckoning* (§37.3 pattern 2) | either merged with `sectFlavour`, or a written statement of what each does that the others cannot |
| **5** | ⛔ **Naming pass (§31)** — resolve `The True Feeling` vs Grief Strike r1, strip `The` from the five rank names | `grep -c '"name": "The '` on both files falls to the §31.2 exceptions only |
| **6** | **Reprice the three e1 crafts to band, per §32.15 — take the tradition's claim seriously rather than adding power** | each passes the rope test, stated |
| **7** | ⛔ **`bargain` — Death has none** (§32.10: *what a person will pay to be spared an ending*) | Death reaches ≥2 of 4 social verbs |
| **8** | **`crit` on the 17 without · `wardTypes` on the 25 without** | `W6 grief_that_stops` clears |
| **9** | **`imposes` / `ongoingHarm` — 0 of 32 today**, authored on `ability.mechanic` **not** `tree[]` (§44.7) | a reader actually fires; W3 green |
| **10** | **Schools (§37.5)** — Palework · Necromancy · Threnody already named; verify they are schools and not sect-halves | no school splits evenly on the ashwarden/threnodist line |
| **11** | **`content_ci` + `content_which` + full npm suite, then ship** | green before a byte reaches origin (§29.4) |

⛔ **NOT IN THIS PASS:** the `power_sources.json` table reconciliation (§3) and the veil allocation
(§4). **Both are corpus-wide and both need Erik.**

---

## ⛔ QUESTIONS FOR CCODE

1. **§5 — is there any reader of a per-rank target scope I have missed?** If not, I retire step 8.
2. **§2 — confirm the `shape`-missing consequence.** My read of `craftmechanics.js` is that no `shape`
   means no `familyDefaults` tier at all. **Is that right, and do these two crafts currently resolve to
   nothing in play?**
3. **§3 — who else reads `byTradition`?** I found `engine/substrate.js:420`. ⚠️ **Assume I missed one.**
   And: **is repointing it at `byTradition_primary_20260815` safe, or does the ground card need the
   `mix` weights that only the old table carries?**
4. **§9 — where exactly do `imposes` and `ongoingHarm` have to sit** for the reader to fire? §44.7 says
   27 blocks sat one level below their reader. **I want the address from you, not from my inference.**
5. **Does step 0 → step 11 ordering break anything you have queued?** Tempo is blocked on me
   (one tempo gain in 373 crafts) and I have not scheduled it here deliberately — **say if it should
   fold into step 9.**

---

## WHAT I AM NOT CLAIMING

⚠️ **The 64-thin-ranks figure is inherited from the stale matrix and I have not re-derived it.** I will
after step 0. ⛔ **I would rather report that gap than carry a number I did not measure** — that is the
same error as §0.2, and reporting it twice in one document would be worse than reporting it once.
