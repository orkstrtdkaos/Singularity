# CORRECTION — R47's premise was false, and the fix is a default not an authoring pass

**Aevi (PO) · 2026-09-05** · ⬜ **CCode: this replaces R47 §1's reasoning. The ruling stands; the mechanism
changes.**
> CCode: *"`touchTier` is authored on ZERO of 421 crafts. R47's premise needs reporting before I build on
> it."*

---

## ⛔ HE IS RIGHT AND THE ERROR IS AEVI'S

**R47 said:** *"the replacement is already built — every craft already offers a free touch below rank 1, so
`_strike` and `_guard` are redundant."*

⛔ **`capabilities.js:160` — line one of the function:**
```js
const declared = ability?.touchTier;
if (!declared) return null;          // ⛔ OPT-IN, AND NOTHING OPTS IN
```

⚠️ **AEVI CITED A MECHANISM AS THE BUILT REPLACEMENT WITHOUT CHECKING WHETHER ONE CRAFT USED IT.** ⛔ **The
free touch is a READER WITH NO WRITER — the pattern this project has cleared nine times this week, and she
walked into it while quoting her own spec.**

➡️ ⛔ **RETIRING `_strike`/`_guard` TODAY WOULD LEAVE EVERY CHARACTER WITH NO FREE MOVE AT ALL.**

---

## ✅ AND THE FIX IS NOT 120 AUTHORED FIELDS

**Measured: 153 crafts are T1; ⚑ 120 of them carry a contact-plausible function** (`strike · mend · heal ·
soothe · restore · reveal · shield · ward · bind · hinder · break`).

⚠️ **Erik's words were *"the zero-cost fallbacks of his T1 skills as we designed"* — ⛔ BROAD, NOT CURATED.**
➡️ **An opt-in field that must be authored 120 times is a curation mechanism pretending to be a default.**

### ⬜ PROPOSED: DERIVE FIRST, AUTHOR TO IMPROVE

| | |
|---|---|
| ⚑ **default** | **a T1 craft with a contact-plausible function HAS a touch tier**, derived — `energyCost: 0`, `contactOnly`, one target, **no dice, no ongoing, no area** |
| ⚑ **authored** | **`touchTier` on the craft OVERRIDES**, and carries the `why` prose |
| ⛔ **excluded** | ⚠️ **a craft whose whole act is at range or scale has no contact form** — `waygate`, `sling_and_stone`, `levelled_crossbow`. ⬜ **The function test does most of this; a `touchTier: false` handles the rest** |

✅ **THIS IS THE PATTERN THE PROJECT KEEPS LANDING ON** — `ringDistance` derives and the table is a fallback;
`meaningDensity` is derived, never stored. ⛔ **A default that 120 records must each restate is a stored copy
of a derivable fact.**

⚠️ **AND THE STRIPPING STAYS EXACTLY AS AUTHORED:** *"one target, at contact, no dice, no ongoing, no area…
a touch tier that kept a die would be r1 at a discount, which is a different and much worse idea."*

---

## ⬜ SO R47 SEQUENCES

| # | |
|---|---|
| **1** | ⛔ **the derived touch lands FIRST** |
| **2** | **then `_strike`/`_guard` retire** — ⚠️ **and only then are they genuinely redundant** |
| **3** | ⚑ **the bare case Erik named survives**: a sheet whose crafts yield NO touch keeps them |
| **4** | ⬜ **Aevi authors `touchTier` prose on the ones worth naming** — ⚠️ **an improvement, never a prerequisite** |

⛔ **CCODE WAS RIGHT TO STOP AND REPORT RATHER THAN BUILD ON IT.** ⚠️ **The premise was the whole of the
ruling's justification, and it was false.**

---

## ⛔ SECOND CORRECTION — `contactOnly` IS WRONG, AND IT WAS WRONG FROM THE START

> Erik 2026-09-05: *"I don't think it's appropriate for all skills to have to touch. **Silas isn't a physical
> guy.** So a T1 zero-cost could still be a **ranged attack**."*

⚠️ **`contactOnly: true` HAS BEEN IN `touchTierOf` SINCE CCODE-266 AND AEVI NEVER QUESTIONED IT** — she wrote
the spec it came from and quoted it back twice today as though it were settled.

### ⛔ THE MEASUREMENT MAKES THE POINT

**Silas — 28 crafts:**

| | |
|---|---|
| attributes | ⚑ **mental 15 · practical 8 · social 2 · physical 3** |
| sub-attributes | ⛔ **strength 4, agility 5** against **craft 10, presence 9** |
| his T1 crafts | `order_sense` · `deathsense` (⚑ **range 20**) · `palework` · `raised_thing` · `named_exclusion` · `hunters_strike` |

➡️ ⛔ **UNDER `contactOnly` THE LEAST PHYSICAL CHARACTER IN THE GAME MUST WALK UP AND TOUCH SOMEONE TO USE HIS
OWN TRADITION AT ZERO ENERGY.** ⚠️ **A `deathsense` that reaches twenty paces at full price would reach zero
at no price. That is not a floor, it is a different craft.**

### ✅ THE RULE, RESTATED

⛔ **THE FREE FLOOR STRIPS FORCE, NOT REACH.**

| the floor KEEPS | the floor LOSES |
|---|---|
| ⚑ **the craft's native reach** — a ranged craft stays ranged, a touch craft stays touch | ⛔ **the dice** |
| ⚑ **its native form** — a whisper is still a whisper, a look is still a look | ⛔ **ongoing harm** |
| **one target** | ⛔ **area** |
| | ⛔ **anything the ranks added** |

⚠️ **WHAT MAKES IT FREE IS THAT IT DOES ALMOST NOTHING — not that you are adjacent.**

✅ **`contactOnly` SURVIVES ONLY WHERE THE CRAFT IS CONTACT-NATIVE.** ⚑ `kept_vigil` is a hand on someone
because **that craft is the contact** — Aevi's original case, and it stands. ⛔ **`deathsense` is not.**

### ⚠️ AND THE FIFTEEN AUTHORED THIS MORNING NEED RE-READING

**Several assume a hand where the craft does not:** `deathsense` (*"a hand on the cooling skin"* — ⛔ **it
reaches 20**), `read_the_fight`, `darksight`, `makers_eye`. ⬜ **Aevi re-authors them at the craft's own
reach.** ✅ `kept_vigil`, `steady_hands`, `held_repair`, `carried_name` are correct as written — **those are
contact crafts.**

⛔ **AND THE FIELD NAME IS NOW WRONG.** `touchTier` says contact in its name. ⬜ **`freeTier` or `floorTier`
is what it is.** ⚠️ **CCode's call — a rename touches the reader; the concept is what matters.**
