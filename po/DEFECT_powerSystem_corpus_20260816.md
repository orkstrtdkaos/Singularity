# ⛔ CORPUS DEFECT — 295 abilities carry a `powerSystem` that is not a power source

**Filed:** 2026-08-16 · **Found while closing Body (SNG-487)**

---

## §1 — THE FINDING

**There are FOUR power sources.** `precursor` · `ordered_nanite` · `wild_nanite` · `metaphysical`.
Erik's allocation, 2026-08-15, exact coverage across all 24 wheel poles.

⛔ **295 of 340 abilities carry something else in `powerSystem`. ONLY 41 ARE CORRECT.**

| value | n | what it actually is |
|---|---|---|
| `attribute` | 70 | ⛔ **a FIELD NAME** |
| `reach_death_life`, `reach_dark_light`, `reach_violence_peace`, … | 174 | ⛔ **REACH IDS** — the axis a craft sits on, not what powers it |
| `wild_current`, `living_current` | 7 | pack ids |
| `valley_craft`, `harmonic`, `radiant` | 40 | ⛔ **TRADITIONS AND FOOTHILLS** — a people is not a power source |

⚠️ **`body` was a fifth value until today. It was ruled out on 2026-08-15 — absorbed into `metaphysical`
as innate Ki — and the definition stayed live in `power_sources.json` for a day afterwards. I reached for
it while fixing this exact defect.** ⛔ **A stale definition is an invitation; it has been removed.**

---

## §2 — WHY IT MATTERS

**1 · `aestheticFor` resolves `traditions[t]` then `powerSystems[ps]`.** ⛔ **295 abilities fall through
to the house palette** — precisely the silent fallback CCode flagged in Q7 as the risk of the taxonomy
swap. **It is already happening, at scale, for a different reason.**

**2 · The nexus and density model keys on power source.** `metaphysical` wants thin ground,
`precursor` wants dense, and the conversion fight between ordered and wild nanite is a live map mechanic.
⚠️ **An ability whose source reads `reach_death_life` cannot be scored by any of it.**

**3 · The four-source allocation is the spine of the cosmology** — the Veil axis, the Thinnings, who
strengthens and who thins. ⛔ **Three quarters of the corpus is not attached to it.**

---

## §3 — DISTRIBUTION

| tradition | abilities with a bad source |
|---|---|
| — | 49 |
| Dark | 28 |
| Death | 28 |
| Breaking | 26 |
| Span | 25 |
| Light | 23 |
| Building | 23 |
| Order | 20 |
| Demonic | 17 |
| Life | 14 |
| Chaos | 13 |
| Angelic | 12 |
| Mind | 11 |
| Spirit | 9 |
| Body | 1 |

---

## §4 — HOW TO FIX, AND WHY NOT IN BULK

**The mapping is mostly mechanical:** an ability's tradition has a primary source
(`byTradition_primary_20260815`), and most abilities take it. ⚠️ **But not all** — Body's split is the
worked example: **9 somatic crafts are `metaphysical` (ki), 9 mason crafts are `ordered_nanite` (worked
matter), and four are pure skill that still draw their tradition's current, more thinly.**

⛔ **A craft's source is a claim about HOW IT WORKS, and several will not take their tradition's default:**
a Wright's `Sound Repair` is worked matter, but a Wright's `Masterwork` may be precursor-assisted. **Those
are per-craft judgments.**

⚠️ **NUMBER CORRECTED AFTER FILING: my first count was 251 because I had left `valley_craft`, `harmonic` and `radiant` in the legal set. They are a Folk collection and two foothills — PEOPLES, NOT SOURCES — so they are part of the defect. The honest figure is 295 of 340, with 41 correct.**

**Recommend: fixed per tradition as each is audited**, alongside the 210 unauthored bounds. ⚠️ **Bulk-
assigning 251 sources I have not reasoned about would read as considered and not be** — the same call made
on the bounds, and the same reason.

**Body is done: 22 of 22 correct — and they are 41 minus the 19 elsewhere, which is why the corpus figure moves as each tradition closes.**
