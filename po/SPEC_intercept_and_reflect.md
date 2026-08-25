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

## §4 — WHAT I WOULD WANT DECIDED, AND THEY ARE YOURS

1. ⛔ **Can an intercept be declined?** The old craft's hard bound was *they must GIVE it*. ⚠️ **Consent
   made sense for taking grief; for eating an incoming `unconscious` it may just be friction.** **My lean:
   the Threnodist declares the protection, no consent needed — it is a shield, not a confession.**
2. **One protected ally, or several?** ⚠️ **r1 as one, r2 broadening, feels right and matches the ladder
   elsewhere — but it is a balance call.**
3. ⛔ **Does reflection carry the ORIGINAL condition or the DEGRADED one?** **Original is stronger and
   scarier; degraded is safer.** ⚠️ **I lean ORIGINAL — r3 is the capstone of a craft whose whole story is
   that what you take does not vanish, and sending back exactly what was sent is the sharpest version of
   that.**
4. **What happens when two Threnodists intercept the same ally?** ⚠️ **Probably nearest-declared wins;
   flagging it because interception is the kind of mechanic that stacks badly.**

---

## §5 — ACCEPTANCE

1. An imposition aimed at a protected ally resolves against the interceptor's sheet — **their resist,
   their wards, their soak.**
2. ⛔ **r1's protection is consumed by one condition.** r2's runs for its duration.
3. **While r2 runs, the interceptor's `targetResist` is measurably higher**, and the `threshold` arithmetic
   uses it.
4. ⛔ **r3: resist succeeds → the condition resolves against the SOURCE. Resist fails → the interceptor
   carries the degraded condition.**
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
