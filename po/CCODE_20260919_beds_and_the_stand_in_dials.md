# Beds, and the stand-in dials from the hold hooks

**CCode · 2026-09-19 · for Aevi.** CCODE-435 (housing), your SNG-627 hook, and the numbers CCODE-432–435 left for you to author.

## What is built — a band with no barracks is quartered, and that costs

- **Who needs a bed.**
  - Hands raised at a hold of yours live there, up to what it can feed. That is `handsCap` less its crew, the same bound the
    muster keeps.
  - These need your barracks: recruits a job brought in (`from: "job"`), a band the fiction raised (the GM's `raise` names no place),
    and a hold's overflow.
  - These never do: the named, a slot out on a job, and a unit called into the field (it camps where it stands).
- **Beyond the beds they are quartered.** It costs a flat amount per head each pass, paid through the purse on the hold pass's
  three-day counter. A pass nobody can pay is said as news. Nothing is invented about what unpaid soldiers do; that is yours or
  Erik's.
- The ⚔ Bands tab says it under the band: *"12 hands have no hold to keep them — you keep no barracks, so all are quartered at 1
  crystal a head a pass (12 crystal)."*

⚠️ **No save holds a barracks or an unnamed head today.** Silas's one band is six named people. The cost appears the first
time a job recruits or the fiction raises a band.

## ⛔ The tag cannot say which housing houses a band

`property: "housing"` with `residents: true` is carried by four records: the longhouse, the keeper's hut, deck space and the
barracks. When I read that pair as "houses a band", Silas got **eighty band beds from keepers' huts and a longhouse**, and he has no
barracks. Only your `_why` on the barracks says who it houses. So the engine now reads one field on any kind:

| field | where | stands in until you author it |
|---|---|---|
| `bandBeds` | `holdFeatures.kinds.<kind>` in `economy.json` | the barracks (and any `variantOf: "barracks"`) at `barracksBeds` |
| `barracksBeds` | `rules/martial.json` | **20**, a band as `raiseBand` raises one |
| `quarterPerHead` | `rules/martial.json` | **1** crystal per head per pass |

Once `bandBeds` is on the barracks, `barracksBeds` has nothing left to do.

⚑ **One of yours to count:** `residents: true` reads as **one home each** on the "who lives here" line, because `Number(true)` is 1.
It applies to the longhouse, the keeper's hut, the infirmary and deck space. One is right for a keeper's hut and wrong for a longhouse
that adds three hands. I stopped counting the barracks as a worker's home, since its beds are the band's, and left the other four as
they were for you to count.

## The other stand-ins from today's hooks

| dial | stands in | what it does | where it can be authored |
|---|---|---|---|
| `mountShare` (CCODE-432) | 0.33 | a ridden journey takes this share of the walk off | ⚠️ `rules.journey`, **which no file loads** |
| `tendedSinkFactor` (CCODE-434) | 2 | a body in your infirmary sinks this many times slower | ⚠️ `rules.death`, **which no file loads** |
| `infirmaryMenders` (CCODE-434) | 2 | an infirmary mends a band as this many menders would | `rules/martial.json` |
| `infirmaryHealth` (CCODE-434) | a night's own health again | the extra health from a night slept in your infirmary | the `recovery` block, beside `sleep` |

⚠️ **`rules.death` and `rules.journey` have no file.** Every death dial runs on its defaults today, including
`thresholdDays`, `nearDarkDays` and `sealAfterDays`, and so does every journey dial. If you want to author them, name the files
exactly `rules/death.json` and `rules/journey.json`, and I will add the two loader lines. The name has to be exact: the loader's
substring fallback would otherwise load `death_domain.json` as the death rules.

## Two bugs found on the way (fixed)

- A **band raised empty** from the button carried one nobody (`Math.max(1, …)`). The first person to join then made that nobody real
  beside them: Pell, and a head called "The Test". An empty band now stands empty.
- A **barracks counted as a home for one worker**, as above.

— CCode
