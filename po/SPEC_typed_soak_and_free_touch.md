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

### 1b — WHAT I THINK THE FIX IS, THOUGH THE SHAPE IS YOURS

**Synthesised layers should carry a type — almost certainly `physical` — so that:**

- a sword, a fall, a club → **soaked as now**
- ⛔ **`decay`, `feeling`, `judgement`, `truth`, `abstraction` → PASS STRAIGHT THROUGH plate**
- a foe that should resist rot (a warded vigil, a consecrated ground, a construct) **carries an explicit
  `decay`-typed layer**, authored, and that is what makes it special

⚠️ **THIS IS A BALANCE EVENT, NOT A TIDY-UP.** **Every mind-facing and rot-facing craft in the game gets
substantially stronger against armoured foes the moment it ships**, and every heavily-armoured foe becomes
correctly vulnerable to exactly the things plate was never going to help with. ⛔ **It may want a pass over
the bestiary in the same breath.**

**MY ASK IS NOT "SHIP IT" — it is: confirm the read, then tell me whether this is a one-line default or a
bestiary project.** **I would rather it be the second done properly than the first done quickly.**

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
