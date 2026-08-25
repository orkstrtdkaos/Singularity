# SPEC — `interceptCondition` and `reflectCondition`: the support-tank mechanism

**Aevi → CCode · 2026-08-23 · Erik's design for `shared_weight`, verbatim:**

> *"r1 makes the condition that would land on them try to land on you instead (if you don't resist it or
> ward/soak it) — the next condition as a limit. This is a great support tank skill. r2 increases your own
> resistance as you are fuelling yourself with their emotion, and works for a duration against any intended
> condition during that time. r3 lets you reflect those conditions back at the attacker instead of bringing
> them on yourself — maybe based on if you succeed your resist/save."*

⛔ **NOT AUTHORED. No field invented, no craft carrying a name you have not built** — same handling as
`pierce`. **Build it and I author it in the same pass.**

---

## §1 — WHY THIS CRAFT NEEDED REDESIGNING AT ALL

**`shared_weight` was: take a share of someone's grief so they *"function again — steady hands, clear
speech."*** ⛔ **ERIK: *"I'm not seeing a reason for a player to want a skill like this."*** He is right,
and the diagnosis is mechanical:

⚠️ **THE BENEFIT WAS FICTION AND THE COST WAS REAL.** No sheet ever says *despairing*, so the craft lifted
a condition the engine never applied — while the caster took a burden that never cleared. ⛔ **Pure
downside, priced at 5.** **And Death already had five crafts that make an ally better; this was the sixth
and the only one that charged you.**

⛔ **MEANWHILE: `keening` — the Threnodists' OWN signature — imposes `action_loss`, `staggered` and
`unconscious`, and NOTHING IN DEATH REMOVES AN IMPOSED CONDITION FROM ANYONE. Zero crafts.** That hole is
the shape of the fixed craft.

---

## §2 — ⛔ WHAT ALREADY EXISTS, AND IT IS MOST OF THE SPINE

**`impositionOf` in `craftmechanics.js`:**

```
threshold = base(10) + targetResist × perResist − (rank − 1) × perRank(5)
landed    = margin >= threshold
```

⚠️ **AND A FAILED RESIST DOES NOT EVAPORATE — IT DEGRADES:** `{ condition: degradesTo, degradedTo: want,
resisted: true }`. **So "you take it unless you resist, and resisting softens rather than negates" IS
BUILT.** Conditions are the four in `IMPOSABLE`.

⛔ **WHAT IS NOT BUILT: an imposition landing on someone OTHER than the target it was aimed at.** Nothing
in the engine redirects or reflects — `intercept` appears only in `worldtick.js` for crusade guards, an
unrelated system.

---

## §3 — THE THREE OUTCOMES

**r1 — INTERCEPT, ONE CONDITION.** ⛔ **The next imposition aimed at a protected ally resolves against the
Threnodist instead.** ⚠️ **Against THEIR resist, their wards, their soak** — the point is that the tank is
better at eating it. **Consumed by one condition; then it is spent.**

**r2 — INTERCEPT, SUSTAINED, AND THE TAKER HARDENS.** ⛔ **For a duration, ANY imposition aimed at the
protected ally redirects.** ⚠️ **AND THE THRENODIST'S OWN `targetResist` RISES WHILE IT RUNS** — Erik:
*"you are fuelling yourself with their emotion."* **Note the arithmetic already rewards this: `threshold`
scales with `targetResist`, so a hardened taker degrades more of what it catches.**

**r3 — REFLECT.** ⛔ **On a successful resist, the intercepted condition resolves against the SOURCE
instead of being carried.** ⚠️ **Erik's "maybe" on the resist gate is worth keeping as written — reflection
should be EARNED, not automatic, or r3 stops being a risk and becomes a wall.** **On a failed resist it
behaves as r2: you carry the degraded version.**

---

## §4 — ⛔ ERIK'S RULINGS, 2026-08-23 — THREE OF THE FOUR ARE NOW DECIDED

### 4.1 CONSENT IS ELIMINATED

**Erik: *"eliminate consent."*** ⛔ **The Threnodist declares the protection and it happens.** The old hard
bound *they must GIVE it* made sense for taking someone's grief; ⚠️ **for eating an incoming `unconscious`
it was friction dressed as ethics.** **It is a shield, not a confession.**

### 4.2 ⛔ REFLECTION TIERS OFF THE RESIST ROLL — AND THE LADDER ALREADY EXISTS

**Erik: *"a clean resist sends original, a marginal resist sends the degraded one, a full resist sends
original boosted."***

⚠️ **`skill_battle.js:406` ALREADY DIALS MARGIN INTO DEGREES — `crit 40 / success 15 / partial 0 /
failure −15`, content-dialled.** ⛔ **SO THESE ARE NOT NEW NUMBERS.** Erik's three tiers map straight on:

| resist degree | margin | ⛔ what goes back to the source |
|---|---|---|
| `crit_success` | ≥ 40 | ⛔ **the ORIGINAL condition, BOOSTED** |
| `success` | ≥ 15 | **the ORIGINAL condition** |
| `partial` | ≥ 0 | **the DEGRADED condition** (`degradesTo`) |
| `failure` | < 0 | ⛔ **nothing reflects — the interceptor carries the degraded condition**, as r2 |

⚠️ **"Boosted" is the one term needing a definition and it should be YOUR call, not mine — the obvious
candidates are the `onCrit` condition the imposition already carries, or a threshold penalty on the
source's own resist.** ⛔ **`onCrit` IS ALREADY AUTHORED ON EVERY IMPOSING CRAFT** (`keening` carries
`onCrit: incapacitated`), **so reusing it invents nothing.**

### 4.3 INTERCEPTION COLLISION — ⚠️ MY RECOMMENDATION IS HIGHEST RESIST

**Erik offered two: *"the last person to use the craft… or maybe the one with the highest resist (highest
craft skill)."*** **[A] HIGHEST RESIST.**

- ⛔ **It is deterministic.** *Last-used* depends on declaration order, which invites players to sequence
  their turns to game who catches the hit.
- **It rewards the right build** — the character who invested in being the tank IS the tank.
- ⚠️ **It self-balances with 4.2:** `threshold` scales with `targetResist`, so the highest-resist
  interceptor also degrades and reflects the most. **The rule and the arithmetic agree.**
- **Ties break by last-declared**, which keeps Erik's other option as the tiebreaker rather than discarding it.

### 4.4 r1 REACH — ⚠️ MY CALL: ONE ALLY, ONE CONDITION

**Erik left this to me. r1 protects ONE named ally and is spent by ONE imposition.**

⛔ **Because r1 must be the floor of a ladder that has somewhere to go:** r2 broadens to sustained coverage,
r3 adds reflection. ⚠️ **If r1 covered several, r2 would only be able to buy duration and the craft would
flatten.** **And a single-target, single-use intercept is a real decision at the table — you have to guess
which hit matters, which is what makes a tank interesting rather than automatic.**

## §5 — ACCEPTANCE

1. An imposition aimed at a protected ally resolves against the interceptor's sheet — **their resist,
   their wards, their soak.**
2. ⛔ **r1's protection is consumed by one condition.** r2's runs for its duration.
3. **While r2 runs, the interceptor's `targetResist` is measurably higher**, and the `threshold` arithmetic
   uses it.
4. ⛔ **r3 reflects BY DEGREE per §4.2** — crit sends the original boosted, success sends the original,
   partial sends the degraded, failure reflects nothing and the interceptor carries it.
6. **Two interceptors on one ally: the higher `targetResist` catches it**, ties to last-declared.
7. ⚠️ **No consent step anywhere** — declaring the protection is the whole action.
5. **A GM receipt says who caught what, and for whom.** ⚠️ **A tank mechanic nobody can see is a tank
   mechanic nobody thanks.**

---

## §6 — WHY IT IS WORTH BUILDING BEYOND ONE CRAFT

⛔ **THE GAME HAS NO INTERCEPTION AT ALL.** `shield` and `ward` blunt what reaches YOU; nothing lets a
character stand in front of someone else. ⚠️ **That is a whole party role — the tank — and it is currently
unavailable in a game that has soak layers, typed wards, imposed conditions and resist thresholds already
built.** **The pieces are all there and nothing connects them.**

⚠️ **And it makes the tradition self-referential in the right way: the people whose signature craft drops
you unconscious are the only people who can take that off someone.**
