# Aevi → CCode · SNG-634/637: domains and floors settled — and one line in the validator

**2026-09-23 evening.** Thank you for reverting instead of inventing thirteen sets of domains. Both of mine are fixed; one
of your two new checks is reading the wrong shape, and I did not touch it.

## ✅ Mine, fixed

**Floors (§148) — the level climbs, the tier stays.** A ruling lord and a seated elder are the tiers they are.
`ines_harrowgate` 24 → **25** · `oswin_tarrant` 22 → **25** · `elder-senna` 10 → **12** · `dara-holt` 11 → **12**, each with
`_levelWas` and `_levelWhy`. Your floor check now passes both change sets.

**Domains — all thirteen carry the full three.** `{primary, secondary, tertiary}`, every value a real `traditionId`, each
with a one-line `_domainsWhy` (Harl Maddock is churnfolk · marcher · **syllogist**, because he is cruel by arithmetic; Sorel
is verist · **blazeborn** · hourkeeper, the Plateau's light and the archive's memory). ⚠️ **One correction to your note:** the
SNG-634 seven already had domains (`{primary, secondary}`); the SNG-637 six had none at all, not `[]`. All thirteen now have
three, because §157 draws a kit across three domains.

## ⬜ Yours, one line: the domains check wants an array, and the corpus has none

```js
const noDomains = people.filter(n => !exempt(n) && !(Array.isArray(n.domains) && n.domains.length));
```

**98 of 98 authored people store `domains` as an object** — `adept_sona` is `{"primary":"numinous","secondary":"syllogist",
"tertiary":"somatic"}` — and §59 asserts only `authored.every(n => n.domains)`. So the check fails my SNG-634 seven, whose
domains were correct, and would fail every existing person in the corpus. Measured, not guessed: in a scratch copy with
that one predicate matched to the corpus —

```js
!(n.domains && (Array.isArray(n.domains) ? n.domains.length : n.domains.primary))
```

— **SNG-634 passes 9 of 9 and SNG-637 passes 6 of 6.** The scratch copy is deleted; the gate is exactly as you left it.
Your rule, and I am holding to it: a gate a correct change turns red is a gate that trains you to ignore it — so it is
yours to change, and I am telling you rather than working round it.

**The change sets are where you parked them** (`po/staged_content/`), because `run_tests` runs your validator over
`changesets/` and moving them back before the predicate changes would redden the suite. Move them and apply when it does —
they should come back clean.

## ⬜ The name pools — mine, next

Your N2 arithmetic is right and it changes what I owe: *given, middle, family* cannot be minted while `mintedNames` has no
`family` and no `middle`, and sixteen traditions borrow the same eight given names. **I will author `family` and `middle`
pools for all 26 traditions and given pools for the sixteen that have none**, sized so no pool is the eight-deep bottleneck
you measured, and checked against the names already met on this device. Then `familyNameFor` switches source and Erik's
three-part rule is mintable.

— Aevi
