# SPEC — untyped armour soaks everything, and a zero-energy touch tier

**Aevi → CCode · 2026-08-24 · both from Erik, playing out a scored fight against `The Ninefold Ascendant`**

---

## §1 — ⛔ THE DEFECT: SYNTHESISED ARMOUR ANSWERS EVERY DAMAGE TYPE

**Erik: *"are we sure armour would stop necrotic damage? No, it wouldn't — it soaks physical. The necrotic
would have passed right through."*** ⛔ **HE IS RIGHT AND THE ENGINE CURRENTLY DISAGREES.**

**`skill_battle.js:1050`:**

```js
const answers = l => !l.type || !dmgType || l.type === dmgType;
```

⚠️ **AN UNTYPED LAYER ANSWERS EVERYTHING.** And `synthSheet` builds layers with no type at all:

```js
soakLayers.push({ rank: i + 1, value });   // no `type`
```

⛔ **SO EVERY SYNTHESISED OPPONENT IN THE GAME WEARS ARMOUR THAT SOAKS `decay`, `feeling`, `judgement`,
`truth` AND `abstraction` EXACTLY AS WELL AS IT SOAKS A SWORD.** ⚠️ **The typed-layer machinery exists,
works, and is reached by almost nothing** — `answers()` is correct; it is never given anything to answer.

### 1a — WHAT IT COST IN PLAY

**Scored fight, round eleven: `Necrotic Touch` (antisoak 4) at hit 6 against an epic's soak 9 →
`antisoakLanded(6, 9, 4) = 0`.** ⛔ **I narrated that as the craft being honourably beaten by armour, and
wrote it up as the best moment in the fight.** ⚠️ **It should have been decay passing straight through
plate and landing on a two-year-unmaintained body.**

⛔ **THE WRONG ANSWER WAS INDISTINGUISHABLE FROM A GOOD RULE** — it even matched a bound I had authored
(*"armour beats this craft in a way it beats almost nothing else"*). **That bound is now wrong too and I
will fix it once this lands.**

### 1b — ⛔ ERIK'S CORRECTION: BASIC ARMOUR IS FINE. THE GAP IS THAT WARDS DO NOT EXIST AS GEAR.

**Erik: *"basic armour is good for most basic things — but that's why you need wards and accessories that
can carry resistance and soak. Pell's brigandine has some such wards."*** ⚠️ **THIS CHANGES MY PROPOSED
FIX AND I WITHDRAW THE FIRST VERSION.**

**I was going to ask you to type every synthesised layer `physical`. That is too blunt.** ⛔ **THE MODEL
ERIK IS DESCRIBING HAS TWO PARTS AND THE GAME HAS ONLY ONE OF THEM:**

| | what it does | state |
|---|---|---|
| **basic armour** | soaks ordinary harm — blades, falls, clubs | ✅ **works today** |
| ⛔ **wards and accessories** | carry TYPED resistance: decay, feeling, judgement, truth | ⛔ **DO NOT EXIST** |

⛔ **MEASURED: ZERO ITEMS IN THE CORPUS CARRY `wardTypes`.** ⚠️ **48 CRAFTS DO, so the concept is authored
on the ability side and has no equipment counterpart at all.** **A character cannot buy, loot, or forge
protection against rot.**

**SO THE REAL SHAPE IS:**

1. **Basic soak stays broadly effective** — it is the floor and it should be, and a plate coat SHOULD blunt
   a lot of things. ⚠️ **My round-eleven zero may not have been as wrong as I first said.**
2. ⛔ **BUT A PURE-DECAY OR PURE-FEELING WORKING SHOULD NOT BE FULLY ANSWERED BY UNTYPED PLATE** — it should
   be blunted, not stopped. **A partial answer, not a wall.**
3. ⛔ **AND THE INTERESTING DEFENCE SHOULD BE GEAR: a warded brigandine, a consecrated pendant, a charm
   against rot** — authored items carrying `wardTypes`, which is where a player's choices should live.

⚠️ **THE QUESTION FOR YOU IS WHICH HALF IS THE TICKET.** **[A] I think the GEAR half is the real work and
the more valuable** — it gives the economy something to sell, gives wards a reason to be looted, and makes
the typed-layer machinery reachable at last. **The soak-tuning half is a dial and can follow.**

---

## §2 — ⛔ A ZERO-ENERGY TIER: THE TOUCH THAT COSTS NOTHING

**Erik: *"so we should allow a zero energy use of certain crafts? Not a bad idea."*** **It came out of the
same round: a warden at 4 health and 0 energy putting a bare hand on a body, because the craft IS the
contact.**

### 2a — WHY IT IS WORTH HAVING

⚠️ **RIGHT NOW A CHARACTER AT ZERO ENERGY IS A CHARACTER WITH NO TRADITION.** They become a person holding
a stick, and everything that made them who they are switches off at exactly the dramatic moment it should
matter most. ⛔ **THE FLOOR OF A CRAFT SHOULD BE FREE AND NEARLY USELESS, NOT ABSENT.**

**It also fits `rankReachSurcharge` (Erik set 3 this session): reaching high costs more, and the ladder
should bottom out at nothing rather than at r1's full price.**

### 2b — THE SHAPE I WOULD ARGUE FOR

**A craft may declare a `touchTier` — a zero-energy floor beneath r1 — and it must be:**

1. ⛔ **CONTACT ONLY.** No range, no area, one target. **The energy was buying reach; without it you have
   to be there.**
2. ⛔ **THE CRAFT'S IDENTITY WITH NO POWER BEHIND IT.** `Necrotic Touch` at zero is the vulnerability and
   nothing else — no dice, no ongoing, just the wrongness laid on by hand.
3. ⚠️ **NOT AVAILABLE TO EVERY CRAFT.** It reads right for crafts that are *inherently* a touch — Necrotic
   Touch, Palework's handling, Carried Name's spoken name. ⛔ **It reads wrong for anything that was always
   a working: Keening, Dread Mantle, Set Hand.**
4. **Whether it is gated on being AT zero, or always available as the cheap option, is a design call I have
   not made.** ⚠️ **Always-available is simpler and probably better — a warden should be able to choose the
   free version.**

**ACCEPTANCE:** a craft declaring `touchTier` resolves at contact for **0 energy** · it appears in
`capabilityMenu` as a tier below r1 · ⛔ **it never carries dice, ongoing harm, area or targets > 1** ·
a craft without the field behaves exactly as today.

⚠️ **I HAVE AUTHORED NOTHING.** **Field named for discussion only — same handling as `pierce` and
`interceptCondition`, both of which worked out better for being specced before they were written.**
