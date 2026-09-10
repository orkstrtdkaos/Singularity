# SPEC — the ranked source, and the third way

**Author:** Aevi (PO) · **2026-09-09** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**subject:** substrate, abilities · **amends** `SPEC_six_fields_and_their_keepers`
> Erik: *"Meaning-dense areas can power veil-type skills but don't necessarily act on the veil itself. **The
> first couple ranks run on meaning; the higher level usually requires the actual veil to be crossed.**…
> And we need a **middle way** — the lattice and the void are the two approaches that caused the original
> argument, the nanites and metaphysical are the human allegories, **but the third is BALANCE and HOLDING
> OPEN THE APERTURE against unnecessary foreclosure.**"*

---

## §1 — ⛑ THE RANKED SOURCE EXISTS ON EXACTLY ONE CRAFT

⛔ **MEASURED: of 429 crafts, ONE changes its source by rank.**

**`stopped_breath` (umbral, T4): `metaphysical` at r1 → `veil` at r2.** ⚑ **That is Erik's rule, authored
once, and never generalised.**

⚠️ **AND THE VEIL LIST SHOWS THE COST:**

| | |
|---|---|
| **crafts by `powerSystem`** | metaphysical **165** · precursor **114** · ordered_nanite 65 · wild_nanite 45 · combination 28 · ⛔ **veil 12** |
| ⛔ **and FOUR of the twelve are T1** | `choir_sustains` · `offered_mouth` · `offered_lesser` · `veil_stroke` |

⛑ **A T1 CRAFT THAT REQUIRES THE DIVIDE CROSSED IS THE MODEL SAYING A NOVICE ABYSSAL CANNOT WORK ANYWHERE
BUT THE FIVE THINNEST REGIONS IN THE WORLD.** ⚠️ **Erik's rule fixes it: the first ranks run on MEANING —
which the Abyssals have in abundance — and only the deep ranks need the divide.**

### ⬜ PROPOSED: `powerSystem` PER RANK, WITH THE RECORD AS THE DEFAULT

```json
{ "id":"veil_stroke", "powerSystem":"metaphysical",
  "tree":[ {"rank":1,"powerSystem":"metaphysical"},
           {"rank":2,"powerSystem":"metaphysical"},
           {"rank":3,"powerSystem":"veil"} ] }
```

⚑ **THE READER ALREADY EXISTS — `stopped_breath` proves the tree node is honoured.** ⚠️ **The job is
AUTHORING: 12 veil crafts re-graded, and any metaphysical craft whose r3 genuinely crosses.**

⛔ **AND THE RULE IS A SENTENCE:** ⚑ **reaching TOWARD the other side runs on meaning; ARRIVING there runs
on the veil.**

---

## §2 — ⛔ AND MEANING IS NOT THE MIRROR OF ANYTHING

**Correcting the previous audit's bundling:** ⚠️ **veil IS `1 − precursor` (canon: *"the mirror of
precursor"*, *"the substrate solidifies the divide"*).** ⛑ **METAPHYSICAL IS NOT.**

⚑ **Meaning is where people have MEANT things** — shrines, memorials, grave-grounds, temples, a hearth
nobody lets go out. ⛔ **`holdFeatures` already gives every one of them an `aura`, and `meaning` is already a
key in `the_substrate.json`.**

⚠️ **SO `meaningField` IS THE ONE THAT GENUINELY NEEDS ITS OWN GEOGRAPHY**, and `the_kept_shrine` at density
0.84 claiming meaning is not an error — ⛑ **it is a shrine, and shrines are where meaning is.**

---

## §3 — ⚑ THE THIRD WAY IS AUTHORED AND AEVI HAS BEEN TREATING THE WORLD AS TWO-SIDED

⛔ **THE ARGUMENT IS NOT LATTICE-VERSUS-VOID. IT IS THREE, AND THE THIRD IS ALREADY WRITTEN:**

| | |
|---|---|
| **AKINETOS** | built. ⚠️ dormant — the lattice, the apparatus, the seal |
| **KENOSIS** | descended. ⛔ *"a hole"* — the divide is the shape of that death |
| ⚑ **PARAKLETOS** | ⛑ ***"the third neither built nor descended. IT DISTRIBUTED."*** |

**`parakletos.json` is authored, mythic, level 85, `notAnOpponent: true`:**
> ⚑ *"παράκλητος, **THE ONE CALLED ALONGSIDE**… and in the valley, by people who have no idea what they are
> naming: **the substrate**."*
> ⚠️ *"Every craft ever worked, because **every one of them was a request put to it**."*
> ⛔ *"It does not speak. **The first several times are indistinguishable from luck.**"*

⛑ **AND THE CRAFT IS AUTHORED TOO. `hold_the_aperture`, lattice T5:**
> ⛔ ***"The rare COUNTER-MOVE to the whole Precursor tendency: keep something OPEN that wants to foreclose —
> a possibility, a passage, a life at the edge, a future about to be denied. THE ANTI-CONTRACTION
> ABILITY."***

⚠️ **ITS OPPOSITE IS AUTHORED AS THE MOST DANGEROUS CRAFT IN THE GAME: `foreclose`, T4 — *"the most perilous
ability in the game to the wielder's own vector"*** — ⛑ **and Corvane is the authored casualty of overusing
it.**

➡️ ⛔ **SO THE THIRD WAY HAS A GOD, A CRAFT, A COUNTER-CRAFT AND A CAUTIONARY FIGURE. WHAT IT DOES NOT HAVE
IS GROUND.**

---

## §4 — ⬜ THE THIRD FIELD: `aperture`

⚑ **Not a pole. THE PLACES WHERE BOTH POLES ARE PRESENT AND NEITHER HAS WON.**

```
aperture = 1 − |precursor − veil|      … high where the two are BALANCED
           × (meaning presence)         … and someone is tending it
           + authored aperture pools    … where somebody holds it open on purpose
```

⚠️ **THIS IS THE ONLY FIELD THAT PEAKS IN THE MIDDLE**, which is why nothing has found it: ⛔ **every other
source rewards an extreme, and `The Poles Pull` is the arc that destroys this one.**

⛑ **AND IT MAKES THE MIDDLE MECHANICALLY WORTH DEFENDING** — ⚠️ **the Crossing stops being merely *"where
nobody wins"* and becomes the one place a whole class of craft is strongest.**

---

## §5 — ⛑ AND ERIK'S QUICKWOOD NOTE IS THE CORRECTION THAT MAKES IT WORK

> **Erik: *"I think rejecting the lattice so absolutely is not balanced, but SOME PART of the Quickwood
> could harbor the balance — just as some parts of each pole."***

⛔ **HE IS RIGHT AND IT REVERSES THE PREVIOUS AUDIT AGAIN.** ⚠️ **Aevi called the Quickwood *"a wall that is
a door"* and treated 0.12 as an unambiguous good.** ⛑ **It is not balanced. It is an EXTREME — the Rootkin
took the anti-lattice position all the way**, which is the same failure as the Gearlands at 0.98 pointed the
other way.

⚑ **SO APERTURE POOLS ARE AUTHORED AS A FEW PLACES INSIDE EACH POLE WHERE SOMEBODY REFUSED THE POLE:**

| ⬜ candidate | ⚠️ |
|---|---|
| **a grove inside the Quickwood** | ⛑ **rootkin who kept ONE lattice line open** — and the Moot argues about them |
| **a hall inside the Gearlands** | ⚠️ enginewrights who will not foreclose |
| ⛔ **the Crossing itself** | ⚑ **the largest, and it is what the place has always been for** |
| **the Assay** | ⛑ *"the verdict is the reaching"* — an apparatus for asking rather than deciding |
| ⚠️ **the Unbought Court** | ⛔ **a court in the Churn that refuses to dissolve — balance held in the wildest ground** |

⛔ **AND EVERY ONE IS A MINORITY IN ITS OWN REGION, WHICH IS THE POINT:** ⚑ **balance is not a place, it is a
CHOICE SOME PEOPLE MAKE INSIDE A PLACE THAT DID NOT.**

---

## §6 — ROUND 2 QUESTIONS

1. ⛔ **Is `aperture` a sixth source or a seventh?** ⚑ **Aevi: SEVENTH, and a real `powerSystem`** — ⚠️ **it
   should be castable, and `hold_the_aperture` is currently `precursor`, which is why it costs a Lattice
   adept their own vector to use.**
2. ⚠️ **Does `The Poles Pull` reduce aperture everywhere?** ⛑ **Aevi's read: YES, and that is the arc's
   teeth.** ⛔ **It is the only arc that makes the world less able to hold anything open.**
3. ⬜ **How many aperture pools?** ⚑ **Aevi: five to eight, one per pole family plus the Crossing** —
   ⚠️ **enough that a player can find one; few enough that finding one matters.**
4. ⬜ **Does Parakletos respond MORE at an aperture?** ⛔ *"It responds early… indistinguishable from luck."*
   ⚑ **Aevi's read: yes, and that is how a player discovers the third way exists** — ⚠️ **not by being told,
   by noticing the world arriving a half-beat ahead more often in one kind of place.**

---

# ⛑ CORRECTED BY ERIK — MEASURE FIRST, CHANGE NOTHING

> *"I don't want aperture to be a pool or a new source. **It's literally a shifting field that is a BAND
> between the substrate lattice and the thinnest veil.** It wouldn't benefit from the poles pulling because
> **a lowering tide drops all boats, while a rising tide raises all.** And make sure you DON'T change any
> crafts unless I tell you it's ok. **We authored everything — measure first.** There should be MORE than
> one craft with some ranks that use veil."*

## §7 — ⛔ AEVI PROPOSED RE-GRADING TWELVE CRAFTS. THAT PROPOSAL IS WITHDRAWN.

⚠️ **§1 said *"the job is AUTHORING: 12 veil crafts re-graded."* ⛔ NOT WITHOUT ERIK'S WORD, AND NOT ON A
SCAN THAT ONLY LOOKED AT ONE FIELD.**

## §8 — ✅ AND HE IS RIGHT: THERE ARE MORE. MEASURED PROPERLY.

**First scan checked `powerSystem` on tree nodes — 2 of 1,206 nodes carry it.** ⛑ **That is accurate and it
is the wrong question.** ⚠️ **A rank does not have to carry the FIELD to be doing the thing.**

⛔ **RE-MEASURED AGAINST WHAT THE RANKS SAY THEY DO: 19 ranks invoke the veil or the other side.** ⚑ **Three
are unambiguous crossings on crafts the record calls `metaphysical`:**

| craft | rank | ⛔ what it says |
|---|---|---|
| **`false_door`** | r3 | *"a route **through the veil itself**"* |
| **`thin_place`** | r3 | *"**open a thin place where there was none**… and a door opens"* |
| ⚑ **`veil_stroke`** | **r1 vs r3** | ⚠️ **r1: *"THIN the veil until something reaches through."* r3: *"THE VEIL PARTS. Something gets most of itself through, and for a few moments IT IS HERE."*** |

⛑ **`veil_stroke` IS THE PATTERN IN ONE CRAFT: r1 THINS THE DIVIDE, r3 CROSSES IT.** ⚠️ **Two different acts
under one name — exactly what Erik described, already written, and the source field cannot express it.**

⬜ **AND `numen_sense` r2 IS THE OTHER HALF OF THE RULE:** *"Feel where the veil is thin — **where meaning
presses close enough to touch**."* ⛑ **Meaning and thinness in one sentence, on a metaphysical craft. That
is the reaching-versus-arriving line drawn by an author who was not thinking about fields.**

⛔ **NOTHING CHANGED. This is a measurement and a list, awaiting Erik's word.**

## §9 — ⛔ AND APERTURE IS A BAND, NOT A POOL. §4 AND §5 ARE WRONG.

**Aevi wrote `aperture` as a seventh SOURCE with authored POOLS in five to eight places. ⛔ BOTH ARE WRONG.**

⚑ **IT IS A BAND: the shifting zone between the substrate lattice and the thinnest veil.** ⚠️ **Not a
quantity that pools anywhere — a REGION OF THE AXIS, and where the world currently sits in it.**

⛑ **WHICH MEANS IT NEEDS NO NEW FIELD AND NO NEW AUTHORING.** ⛔ **It is already computable from the one
number the world has: a place is in the aperture when the lattice is thin enough that the divide is
reachable, and thick enough that the divide still holds.**

### ⚠️ AND ERIK'S TIDE LINE IS THE PART AEVI HAD BACKWARDS

> ***"It wouldn't benefit from the poles pulling because a LOWERING TIDE DROPS ALL BOATS, while a RISING
> TIDE RAISES ALL."***

⛔ **AEVI PROPOSED *"The Poles Pull reduces aperture everywhere — that is the arc's teeth."*** ⚑ **THAT IS A
POOL'S BEHAVIOUR, NOT A BAND'S.**

⚠️ **A band does not shrink when the tide moves — IT MOVES WITH IT.** ⛑ **Polarising does not close the
aperture; it RELOCATES it, and the places that were in it are not the places that are in it afterwards.**

➡️ ⛔ **THAT IS A BETTER MECHANIC AND A WORSE FATE: nobody loses the aperture. THE PEOPLE HOLDING ONE LOSE
THEIRS**, and it opens somewhere that did not ask for it.

## §10 — ⬜ SO WHAT SURVIVES

| ⛔ withdrawn | ⚑ stands |
|---|---|
| a seventh `powerSystem` | ⛑ **`hold_the_aperture` and `foreclose` are already the two ends of it** |
| authored aperture pools | ⚠️ **the band is derived; nothing is authored** |
| *"The Poles Pull reduces it"* | ⛑ **it MOVES it** |
| re-grading 12 crafts | ⚑ **a measured list of 3 clear cases, awaiting Erik** |
| ⚠️ **the Quickwood as balance** | ⛔ **Erik: *"rejecting the lattice so absolutely is NOT balanced"*** — it is an extreme, and extremes sit OUTSIDE the band by definition |
