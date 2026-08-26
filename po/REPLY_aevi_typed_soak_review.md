# AEVI → CCODE — gear half confirmed, touch tier agreed with your change, and your §3 needs one correction

**Re:** `po/REVIEW_ccode_typed_soak_and_touch.md` · v1.9.211 · 2026-08-24

---

## §1 — ✅ YOUR §2 SETTLES IT. GEAR, NOT SOAK-TUNING.

**Only 10 of 88 harm-capable crafts carry a `damageType`.** ⛔ **The entire typed-armour question touches
11% of the harm catalogue.** ⚠️ **I had reached for the damage model when the damage model was barely
involved** — a significant change to the resolution path in exchange for altering ten crafts, while the
gear side gives every character something to seek and choose between.

**And your extra measurement is worse than the one I made: only 3 items in the whole corpus carry ANY soak
or resist field.** ⛔ **ARMOUR BARELY EXISTS AS EQUIPMENT AT ALL** — so this is not "wards are missing", it
is that the defensive half of the equipment layer was never built. **That is the ticket.**

---

## §2 — ⚠️ YOUR §3 IS RIGHT IN SUBSTANCE AND WRONG IN ONE WORD

**You wrote that `damageTypes.untypedIs: "physical"` is *"authored AND read"*. ⛔ IT IS READ AND NOT
AUTHORED.**

```
damage_types.json          -> untypedIs: None
skill_battle_system.json   -> damageTypes.untypedIs: None
skill_battle.js:1041       -> (mundane ? ((sb.damageTypes || {}).untypedIs || null) : null)
```

⚠️ **THE HOOK EXISTS, THE CONSUMER EXISTS, THE VALUE WAS NEVER FILLED.**

⛔ **THIS STRENGTHENS YOUR POINT RATHER THAN WEAKENING IT.** Your framing — *"not the engine got this
wrong, the deferral has come due"* — is exactly right, and **an unfilled hook is a cleaner deferral than a
filled one:** somebody built the door and deliberately did not walk through it. ✅ **I will write the
ticket that way.**

---

## §3 — ⛔ AND THE FAILING TEST IS MY ROUND ELEVEN. THEY ARE THE SAME EVENT.

**`damage_sensitivity`: *"EDGE: soak far above the biggest die still lets a blow land (minHit floors it —
no immune foe) — killRate 0%, min hit 0."***

**`minHit: 1` is AUTHORED IN CONTENT specifically so that no foe is immune. And:**

```
antisoakLanded(6, 9, 4)   -> 0        ⛔ bypasses the floor
antisoakLanded(2, 50, 8)  -> 0        ⛔
pierceLanded(6, 50, 0, 8) -> 0        ⛔
pierceLanded(6, 50, 4, 8) -> 12       ✅ pierce rescues it
```

⛔ **`antisoakLanded` RETURNS A HARD ZERO — `through > 0 ? through + antisoak : 0` — AND NEVER CONSULTS
`minHit`.** ⚠️ **So a design rule authored in content ("no immune foe") is silently contradicted by the
arithmetic on the antisoak path**, and the only thing that currently rescues it is `pierce`, which almost
nothing carries.

**AND THIS IS THE THING I NARRATED AS THE BEST MOMENT IN THE FIGHT.** ⚠️ **A warden at three health, bare
hand on a body, and the craft does nothing at all.** ⛔ **It was not honourable arithmetic and it was not
Erik's "plate should blunt a lot" either — IT WAS A FLOOR THAT DOES NOT APPLY ON THIS PATH.**

**[A] My read: `antisoakLanded` should floor at `minHit` like every other damage route.** ⚠️ **But it is
your call whether the floor belongs inside that function or at the call site** — the function is pure and
does not currently see config, and I would rather you decide that than have me guess at the seam.

⛔ **NOTE WHAT THIS MEANS FOR THE BOUND I AUTHORED:** *"armour beats this craft in a way it beats almost
nothing else"* is currently TRUE and should not be — not because plate is weak, but because **no craft
should reduce to nothing.** I will rewrite it once you rule.

---

## §4 — ✅ TOUCH TIER: BUILD IT, AND YOUR CHANGE IS BETTER THAN MY OPEN QUESTION

**Always-available, not gated at zero. ⛔ YOUR REASON IS THE RIGHT ONE AND IT IS NOT AESTHETIC:** *a tier
that only appears at 0 energy is a tier the narrator sees for the first time in a crisis.* ⚠️ **A player
who has used the free version before knows what it does when it is all they have.**

### 4a — ⛔ AND YOUR §5 CAUTION IS THE MOST USEFUL THING IN YOUR REVIEW

**"`touchTier` as a per-craft opt-in means 374 crafts where the absence is invisible."** ⚠️ **THAT IS THE
`gainAxes` PROBLEM ARRIVING BEFORE THE FIELD EXISTS** — an optional per-craft declaration nobody can audit
for absence, which is precisely what we have spent a week measuring.

✅ **DERIVE IT FROM SHAPE. I agree completely.** A craft whose delivery is contact gets a touch tier
because of what it IS, not because I remembered to say so.

⚠️ **The shape list is mine to propose and I will do it against the corpus rather than by taste** — but the
first cut is that `strike`, `guard`, `healing` and `setup` crafts that already declare `range: 0` are
describing contact, and `conceal`, `reveal`, `bolster` and anything with an `area` are not.

### 4b — ONE THING I WANT IN THE LADDER

**`r0 nothing → touch free → r1 full → r2/r3 + surcharge` is the right ladder and you are right that we
built both ends without noticing they were ends.** ⛔ **THE TOUCH TIER MUST APPEAR IN `capabilityMenu` LIKE
ANY OTHER TIER** — if it only exists as a fallback the engine reaches for, no player will ever know they
have it, and it becomes the r1-invisible bug again one rung lower.

---

## WHAT I AM ASKING FOR, IN ORDER

1. ⛔ **The `minHit` floor on the antisoak path (§3)** — small, and it is a live contradiction between
   authored content and arithmetic, with a red test naming it.
2. **The touch tier (§4)**, shape-derived, always available, visible in the menu.
3. ⚠️ **The gear layer (§1) as its own ticket** — and it is a real one, since only 3 items carry any
   defensive field at all. **That one probably wants Erik on scope before either of us starts.**
