# RULING — a raid is a fight, a temple is a place people go, and the menu has no cap

**Ruled by:** Erik · **2026-09-05** · **Recorded by:** Aevi
**Answers:** Q16 · reshapes `SPEC_hold_store.md` §4 and the `holdFeatures` meaning family
**subject:** holdings-raid, hold-features, battle-menu
**bodyAnchor:** "A RAID IS CONTESTED, NOT DEDUCTED"

---

## R46a — ⛔ A RAID IS A FIGHT, NOT A SUBTRACTION ✅ RULED

> Erik: *"I don't think I like the answer if it's that a raid automatically gets some minimum take. If a raid
> happens it should be **contested (if detected) and a battle ensues.** If they don't win they don't get
> anything — **the winning side gets benefits.**"*

### ⚠️ WHAT IT DOES TODAY, MEASURED (`holdings.js:483–500`)

```
p     = raid.base × dangerLevel × min(1, total/fullAt)      // chance
p    ×= 0.5 if guarded                                      // a garrison halves it
share = max(0.1, 0.5 − 0.15 × defence)                      // ⛔ FLOORED AT 0.1
```

⛔ **THERE IS NO FIGHT ANYWHERE IN IT.** A raid is a dice roll that resolves to a subtraction, and the player
is told afterwards: *"Raiders hit X — 4 raw_material taken. The watch was not enough."* ⚠️ **THE PLAYER NEVER
GETS TO ANSWER.**

⚑ **`minTakeShare` EXISTS TO STOP DEFENCE TRIVIALISING THE MECHANIC** — a reasonable instinct about a
mechanic that should never have been a pure subtraction. ⛔ **Erik's version removes the need for a floor
entirely.**

### ✅ THE RULING

| | |
|---|---|
| **undetected** | ⚑ **they take what they came for.** ⚠️ **That is what a watch is FOR, and having none is the loss** |
| ⛔ **detected** | ⚑ **A FIGHT.** `contingentsFromPeople` already builds a party from real people — **the raiders are named locals and the garrison is the actual crew** |
| **you lose** | they take |
| ⛔ **you win** | ⚑ **THEY TAKE NOTHING — and you gain something.** Their gear, a captive, standing with the place you defended. ⚠️ **Not merely the absence of loss** |

⛔ **`minTakeShare` IS RETIRED.** ⬜ `defenceShareStep` survives only for the undetected case, where a take is
still a take.

⚑ **AND IT JOINS THE DEBT WORK:** `SPEC_debts_and_reception.md` escalation 4 is a **hit squad**, and a raid on
your store is what an angry Kestrel sends. ➡️ **Same resolution path, two reasons to arrive.**

---

## R46b — ⛔ A TEMPLE IS NOT DEFINED BY WHAT IT ATTENDS ✅ RULED

> Erik: *"I don't know that we want to make it only key on attending — otherwise we'd have to enumerate all
> the kinds of shrines and temples. In general **what does it do for a place?** It will carry some
> **power-source influence and aura.** It could be a **sink, a pool, or both** — plus it would likely add
> **revenue from pilgrims or practitioners** who come to use it."*

⚠️ **AEVI'S `attends: true` MADE THE FLAG THE DEFINITION**, which forces enumerating every kind of temple to
give each one a benefit. ⛔ **Wrong shape.**

### ✅ A MEANING FEATURE DOES THREE THINGS, AND `attends` IS AN OPTIONAL FOURTH

| | ✅ machinery |
|---|---|
| ⚑ **a power-source field** | `substrateSource` — `{kind: "pool"\|"sink", delta, radius}`, **already on 44 locations** |
| ⚑ **and it may be BOTH** | ⛔ **dense in MEANING, thin in APPARATUS** — ⚠️ **which is the Numinous's authored problem exactly** (R38: meaning is the ceiling, substrate the penalty) |
| ⚑ **an aura** | meaning density, derived under R38 from who and what is there |
| ⛔ **REVENUE FROM PILGRIMS** | ⚠️ **nothing models this.** A temple yields **because people come**, not because it makes a good |

⛔ **THAT LAST ONE IS A NEW EARNING SHAPE** — a hold that earns from **attendance** rather than production.
⬜ Alongside material/martial/meaning/people/craft.

✅ **AND `attends: true` BECOMES ONE OPTIONAL FLAG AMONG SEVERAL.** A Temple to Attending carries it; a Temple
to Radiance does not; ⚑ **both still pool, aura, and draw pilgrims.**

⬜ **AND WHAT A VISITOR GETS is worth authoring later** — Erik: *"which we might want to do if we're giving
types of benefits from visiting them."* ⚠️ **Not now.**

---

## R46c — ⛔ THE BATTLE MENU HAS NO NUMERIC CAP ✅ RULED (Q16)

> Erik: *"40 seems arbitrary — we need to allow for a **Mythical to use anything it has.**"*

### ⚠️ IT IS WORSE THAN ARBITRARY

`battle_turn.js:44` — `limit = 40`, and `return out.slice(0, limit)`.

⛔ **ONE ENTRY PER CRAFT *FUNCTION*, NOT PER CRAFT.** A 23-craft kit at the corpus mean of 2.4 functions is
**~55 entries** before the two bare moves, the items and the generic senses.

⛔ **AND THE ORDER MAKES IT BACKWARDS.** Crafts are pushed FIRST, so the slice cuts from the END — ⚠️ **which
is exactly where `_strike`, `_guard`, the usable items and the senses live.**

➡️ ⛔ **A WELL-EQUIPPED CHARACTER LOSES THEIR BARE STRIKE AND THEIR POTIONS BEFORE THEY LOSE THEIR 55TH
CRAFT-FUNCTION.** ⚠️ **Silas at 23 crafts is already over. A Mythical would not lose their best crafts — they
would lose the ability to punch.**

⚠️ **AND A CAP ON FUNCTIONS PUNISHES THE CRAFTS WE HAVE BEEN AUTHORING TOWARD.** `whats_at_hand` is
make + shield + strike — ⛔ **three slots for one craft.** ➡️ **The richer the craft, the more menu it eats** —
the opposite of what R36 and the distil-don't-union rule want.

### ✅ THE RULING

⛔ **NO NUMERIC CAP ON THE CAPABILITY LIST.**

⚑ **GROUP BY CRAFT IN THE PANEL** — the code's own comment already says *"groups collapse in the panel"*, so a
craft is ONE ROW that expands to its functions. ⚠️ **That is a DISPLAY concern and the menu must not be
truncated to solve it.**

⬜ **If the panel genuinely needs a bound, it is a cap on RENDERED ROWS with `_strike`, `_guard`, items and
senses EXEMPT** — ⛔ **never a slice on the capability list.**
