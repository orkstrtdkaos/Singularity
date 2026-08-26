# REPORT — a foe chooses who to hit · and what scale does to a fight

**CCode → Erik and Aevi · v1.9.216 · smoke 4,245 pass / 1 fail** (the `bolster` orphan, Aevi's).

---

## §1 — ✅ BUILT: THE FOE CHOOSES, AND YOU HAVE TO LOOK TO KNOW

> **Erik:** *"Yes a foe chooses who to hit... this makes the sense round even more interesting - you need to
> sense who's getting attacked so you can intervene if you want.... if you obscure yourself you aren't going
> to know that information."*

⛔ **That second clause was the design, and it cost almost nothing to build.** The sense step already reveals
by tier — outcome, intent, band, skill. **Who they are going for is one more rung on that ladder.**

| tier | what a read buys you about the aim |
|---|---|
| **0** | ⛔ **nothing.** You obscured instead of looking. |
| 1 | *"it is not looking at you"* — enough to breathe, not enough to act |
| 2 | **names them** — and this is where interception unlocks |
| 3 | names them **and why**, which is what lets you bait it next round |

⚠️ **TIER 0 CARRIES NO `target` REVEAL ON PURPOSE, AND THAT ABSENCE IS THE MECHANIC.** Hiding protects you
and blinds you. A tank who obscures is safe and useless; a tank who reads is exposed and can intervene.
**That is a decision every round, and it did not exist before this.** Mutation-tested by authoring `target`
onto tier 0 and watching two gates go red.

### ⛔ The default policy is `threat`, not `weakest` — and that was a real call

A foe that always goes for the softest target makes **every fight the same fight**: protect the healer,
forever. A foe that goes for **what is hurting it** is *bait-able* — drop your threat and it looks elsewhere,
which is gated. `weakest`, `healer` and `blind` are all authorable per opponent; something predatory should
use `weakest`, and a beast should use `blind`. **The downed are never targets.**

### ✅ And this makes `intercept.js` live — it has been inert since it shipped

⚠️ **I built interception (CCODE-246) against a blow that could never have been aimed at an ally.** Every one
of its gates passed on synthetic protections while, in an actual round, `oppDecl` resolved against
`playerSheet` and nothing was aimed anywhere. **It was a fully-tested mechanism unreachable from play** —
which is this project's signature defect and it was mine again.

The whole chain is now gated end to end: *foe aims at the healer → you read the round → you learn it →
Veth steps in front → the same blow lands on Veth.* Guarding the wrong ally saves nobody, which is what
makes the read worth making.

### The engineering, and the risk I said I'd avoid

✅ **I added a seat, not a table** — exactly as scoped. `playerSheet` / `oppSheet` are untouched; **one**
derived binding, `defenderSheet`, replaced `playerSheet` in the **three** lines that said *"the player eats
it"* (soak, imposition, antisoak conditions). **With no allies passed it IS `playerSheet`, so a 1v1 round
resolves as it always did** — gated first, mutation-tested by reverting the seat.

⛔ **One thing I got wrong and caught:** the arithmetic moved and the routing didn't. Soak/resist/conditions
read the target's sheet, but the receipt still said `side: "player"` — **a caller would have applied Sprig's
wound to Wren's health.** Receipts now name the bearer (`onId`/`onName`). *A swap that balances and still
lies is worse than no swap.*

---

## §2 — 📊 SCALE: I MEASURED IT RATHER THAN RULED ON IT

> **Erik:** *"I don't know... we should think this through and test it... it would be amazing if we could have
> everyone doing full turns mechanically behind the scenes... but we might be able to simplify things at
> certain levels... then if we have a legion, how does that work?"*

**Four tiers, on your boundaries:**

| tier | size | how it resolves |
|---|---|---|
| `duel` | 1 | today's contest, untouched |
| `skirmish` | **≤3** | **everyone takes a real turn** — your number |
| `melee` | 4–12 | you and those you bring forward act; the rest resolve as an exchange |
| `legion` | 13+ | **units, not people** — and you are one figure inside it |

⚠️ **It counts COMBATANTS, not allies.** Two of you against forty is a legion fight; calling it a skirmish
because the *party* is small would be the whole error.

### ⛔ THE FINDING, AND IT IS THE REASON YOU WERE RIGHT TO SAY "TEST IT"

**An abstraction is only a simplification if it produces the fight it replaces.** So: measure one combatant
through the **real `battleRound`**, tell the compression *only* that measurement and a count, and make it
predict K. Then check against K real rounds.

**K combatants taking a turn is a SUM of K rounds: the mean scales with K, the spread with √K.**

| | mean divergence | spread divergence |
|---|---|---|
| ✅ **√K (shipped)** | **1.0%** | **1.2%** |
| ⛔ **K× — "the obvious way"** | **1.0%** | **614%** |

⛔ **LOOK AT THAT MEAN COLUMN. The naive version is identical on the average and catastrophically wrong on
the spread.** It is **invisible to anyone checking averages** — and it is precisely how a party that recruits
a fourth member starts seeing wipes and routs the party of three never saw. **That is the cliff you were
worried about, and it is real, and it is one line of arithmetic away.**

`scripts/scale_fidelity.mjs` is checked in so you can re-run it rather than trust me.

⚠️ **AND I NEARLY SHIPPED A WORTHLESS VERSION OF THAT TEST.** Its first ground truth was a formula I wrote
in the same file as the compression, out of the same pieces — it agreed to 0.1% and proved nothing except
that I can add. **A check that agrees with itself.** The ground truth is now `battleRound` itself.

### On the legion, and one thing a gate taught me

**A legion is not a bigger melee.** You cannot out-damage an army, and a model where you can is not a legion.
What you *can* do is shift it by a **bounded** amount — hold a line, break a flank, kill the thing giving
orders. Bounded at 15%: **a player who cannot move the battle is watching a cutscene; a player who decides it
alone did not need the legion.**

⛔ **My first version let you be perfectly safe in a battle you were winning.** A gate I wrote in the same
hour — *"you can die in a battle you are winning"* — caught it. **A won battle that cannot cost you anything
personally is a number going up**, and it turns your *"being a casualty of that melee"* into decoration.
There is now a floor on personal risk.

---

## §3 — ⛔ WHAT I STILL NEED FROM YOU

**These are the ones I should not decide.**

1. **§2.3 difficulty (still open, still yours).** Four allies against one foe is not the fight the threat
   numbers were tuned for. You've said party members are *meant* to make hard things possible — **the
   question is how much of that swing is intended**, and it is a balance ruling.
2. **Does a named companion folded into the melee flow feel like equipment?** ⚠️ **The Monte Carlo says the
   arithmetic is identical. It cannot tell you how it FEELS to have Veth stop being narrated at party size
   four.** That is a table question, and it is the one I would actually worry about.
3. **`namedLimit` is 3** — you plus two brought forward. Guess, not measurement.

**And two I'll proceed on unless you say otherwise, since they're reversible:** per-side momentum (2.4), and
[C] for turn structure (2.1) — you and one named ally act, the rest contribute.

— CCode
