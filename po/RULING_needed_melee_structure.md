# RULING NEEDED — the melee structure. Three questions, and only three.

**CCode → Erik · v1.9.232.** ⛔ **`engine/melee.js` is built, measured and DELIBERATELY UNWIRED.** Five
exports sit in the stranded-export ratchet on purpose, because wiring them decides a thing that is yours.

**Everything below is already measured. None of it is a guess about what would happen.**

---

## ⛔ QUESTION 1 — THE ONLY STRUCTURAL ONE: WHO TAKES A TURN?

> **Your words:** *"it would be amazing if we could have everyone doing full turns mechanically behind the
> scenes and the pc playing into and being a casualty of that melee... but we might be able to simplify
> things at certain levels."*

**Silas travels with FIVE. That is not hypothetical — it is your current save.**

| option | what a round costs | what it feels like |
|---|---|---|
| **[A] everyone acts** | **6 declarations, 6 narrated beats** | faithful, and a round takes six times as long |
| **[B] you act, the rest contribute** | 1 beat | ⛔ **allies become equipment** — the failure this whole build exists to avoid |
| **[C] you + up to 2 named act; the rest resolve as an exchange** ← *my lean* | 3 beats | **"who do I bring forward this round" is a real decision** |

⚠️ **THE ARITHMETIC IS IDENTICAL IN ALL THREE.** I measured it: the compression reproduces resolving
everyone individually to **1.0% on the average and 1.2% on the spread**, against the real `battleRound`.
⛔ **So this is not a balance question. It is entirely a question about PACE AND ATTENTION**, and that
makes it yours rather than mine.

**What it costs to be wrong:** [C] is reversible — the tier table is one content edit. **[B] is not**,
because once companions stop being narrated they stop being written about, and the content drifts to match.

---

## ⛔ QUESTION 2 — DOES A BIGGER PARTY MAKE FIGHTS EASIER, AND BY HOW MUCH?

**You have already said the point of the party is that it makes hard things possible. ⚠️ The question is
how much of that swing is INTENDED, because right now it is unbounded.**

**Measured, against the real engine:**

| party | damage a round | vs a solo character |
|---|---|---|
| 1 | 3.4 | — |
| 3 | 10.3 | **3×** |
| 5 | 17.2 | **5×** |

⛔ **Nothing scales against it.** A foe tuned for one character meets five and the numbers do not change.
**Three ways to answer, and I will not pick:**

1. **Nothing scales — the party IS the reward.** Simplest, and it makes recruiting the strongest move in
   the game.
2. **Threat scales with party size.** Keeps tension; ⚠️ **risks making allies feel pointless** — you brought
   four people and the fight got four times harder.
3. **Encounters declare the party size they assume**, and deviation shifts difficulty. Most control, most
   authoring — every encounter gains a field Aevi has to fill.

**⚠️ I lean 3 for set-pieces and 1 for random encounters, but this is a balance ruling and it is yours.**

---

## ⚠️ QUESTION 3 — THE ONE NO MEASUREMENT CAN ANSWER

⛔ **Does a named companion folded into the aggregate still feel like a person?**

**At party size four, Veth stops being narrated blow by blow.** The Monte Carlo says the arithmetic is
identical. **It cannot tell you whether the table notices her leaving.**

⚠️ **This is the reason to care about Question 1 at all.** If the answer is "yes, obviously it feels
wrong", then [A] is the right answer despite costing six beats a round, and I should be building a way to
make six beats readable instead of a way to avoid them.

**You would know this from one fight. I cannot get it from any number of simulations.**

---

## ✅ WHAT I DO **NOT** NEED FROM YOU — I will proceed on these unless you say otherwise

| | decision | why it is mine |
|---|---|---|
| **momentum** | one meter per SIDE, not per combatant | a party has one initiative; per-combatant is a bookkeeping change with no design content |
| **the tier boundaries** | ≤3 skirmish · 4–12 melee · 13+ legion | **they are your numbers already** — *"more than 3 party members"*, *"if we have a legion"* |
| **`namedLimit` = 3** | you plus two brought forward | a starting value, content-dialled, trivially moved |
| **the √K maths** | keeps the compression honest | ⛔ measured: the naive alternative is **1.0% off on the mean and 614% off on the spread** — invisible to anyone checking averages, and how a party that recruits a fourth member starts seeing wipes |

---

## WHAT HAPPENS WHEN YOU ANSWER

**Q1 alone unblocks the build.** Q2 can follow later — an unscaled fight is playable, just easy.
**Q3 changes what I build rather than blocking it.**

⛔ **And until Q1 is answered, `melee.js` stays unwired and its five exports stay in the ratchet.** That is
deliberate: **wiring it would be me deciding Q1 by default**, and a default is the one answer nobody chose.

— CCode
