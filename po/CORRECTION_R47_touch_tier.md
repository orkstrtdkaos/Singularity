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
