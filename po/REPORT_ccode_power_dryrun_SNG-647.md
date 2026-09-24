<!-- status: report for Aevi — SNG-647 §3 dry run, nothing written to content -->
# REPORT: the power generator, dry-run over the fifteen empty regions (CCODE-489)

**CCode · 2026-09-24 · v2.6.0** · generator `scripts/powergen.mjs` · report `node scripts/power_dryrun.mjs`
**Nothing was written to content.** §359 gates that: the module imports no writer, and the content it is handed
is byte-identical after a run over every empty region.

> **Aevi (SNG-647 §3):** *"where it does well, the dry run becomes the seed and the rules are right; where it
> doesn't, the rules get fixed, not the output."*

Taking you at your word, this leads with the **rules I think are wrong or missing**, and every proposal in the
appendix carries the rule that placed it. **31 powers proposed across the 15 regions.** Not one number in the
generator is mine — every weight, tag, threshold and range is read from `rules.powers`, and a rule that is
absent skips its step rather than falling back to something I invented.

---

## ⛔ 1 · There is no priority between kinds, so the ORDER OF THE KEYS IN THE JSON decides

This is the one I would fix first. **`the_unlanded` in the Open Reach is tagged both `cult` and `dangerous`.**
`outlaw_band` is declared before `order` in `rules.powers.kinds`, so the gang takes the holy site and **no order
is proposed in that region at all** — the only one of the eight pole regions where the `cult` locus does not
become an order.

A JSON key order is not a design decision, and it currently outranks one. Two ways out, both yours:

- **a `priority` per kind** — an order outranks a band at a site both could hold; or
- **specificity wins** — `order` matched `sacred+cult` (two tags) where `outlaw_band` matched `dangerous` (one),
  so the better match takes the seat. I prefer this one: it needs no new number and it reads as a reason.

## ⛔ 2 · One seat, one power — a rule you have been applying and never wrote down

**All 29 authored powers have 29 distinct seats.** The generator, following only the rules that exist, seated a
band, an order *and* a sovereignty in the same building (The Leaden Deep). Across the eight pole regions: 8 seats
holding more than one power.

I did **not** assume it. `seatsAreExclusive` is the dial's name, the reader is already in and gated, and with it
authored `true` the same 24 proposals land across 24 distinct seats instead of 13. Absent, today's behaviour
stands and this report shows the stacking honestly. Yours to author.

## ⚠️ 3 · The tempers come out harder than the world you authored

| | cruel | hard | fair | kind |
|---|---|---|---|---|
| **your 29 authored** | 24% | 31% | 28% | 17% |
| **the generator's 31** | 19% | **55%** | 19% | **6%** |

The cause is in the weights, not the draw: **`guild` is `{hard: 0.6, cruel: 0.2, fair: 0.2}` and `outlaw_band` is
`{cruel: 0.35, hard: 0.5, fair: 0.15}` — neither has a `kind` weight at all.** That is 14 of the 31 proposals
which can never come out kind, and both lean hard. The four even-split kinds give `kind` one in four, so the
corpus lands at 6%.

Worth knowing it is not obviously wrong — a thieves' guild that is *kind* wants writing — but if the target is
your own distribution, `guild` and `outlaw_band` need a small `kind` weight, or the other kinds need more.

## ⚠️ 4 · `sovereignty` has no `perRegionMax`, and needs no tag

`guild` and `outlaw_crown` are capped at one per region; `sovereignty` is not, and it is the one kind with no
`placeAtTags` — so it can sit anywhere and be proposed repeatedly. It reached **8 of the 15 regions** here (one
each, held down only by `density`). In your authored corpus, 12 regions have a sovereignty and exactly one has
two. If one-per-region is the rule, it wants saying; if two is allowed, that is worth knowing too.

## ⚠️ 5 · `sovereignty.forms` includes `"none"`

It came out twice as `form: none`, which reads like a missing value rather than a form of government. If a
sovereignty can genuinely have no form, a different word would make the report legible; if it cannot, drop it
from the list.

---

## ✅ What the rules got right

- **`guild` at the market towns: exactly one each, 7 of 7.** `placeAtTags: market` plus `perRegionMax: 1` does
  precisely what it says, and the density of 1 at danger 1 keeps a foothill town from carrying more.
- **`outlaw_crown` was never proposed, and that is correct.** `formsWhenBandsInRegion: 3` refused it everywhere
  — a crown accretes where bands already are, which is why the Gralloch is one and a roadside gang is not. Stand
  three bands in a region and it appears; §359 proves both directions.
- **`notWithinDaysOfTemper` fires.** Bands are kept off ground a fair or kind power already holds.
- **`rivalWithinDays` + `rivalOppositeTemperChance` works**, and produced the Kept Reach lordship's rivalry with
  the Long Choir and the Open Reach lordship's with the Schedule of Pressureholt — both at 30 days, the opposite
  temper hit once.
- **`cellsAtTags` / `cellsWithinDays` / `cellsMax`** placed guild cells: Plainstead's guild keeps a room in Stair
  Hollow, 10.8 days out.
- **`density` is the only thing deciding how many**, and it tracks: raise `base` and more arrive, drop
  `maxPerRegion` to one and every region gets one. Gated as tracking, not as a value.

## ⬜ 3 of your four watch-items answered; the fourth cannot be asked yet

1. *a pole region's pure-pole `cult` locus becomes an order* — **7 of 8. The eighth is finding §1.**
2. *the market towns get guilds, one per region* — **yes, 7 of 7, exactly one each.**
3. *the supply-line rule fires only where a hunger fits* — **it cannot fire at all: no hunger arc is loaded.** A
   supply line feeds a Sovereign's hunger arc and the arcs land with work-order item 2. Rather than let the rule
   pass vacuously on an empty set, `supplyLineReadiness` reports what is missing, so the day the arcs exist the
   question is answerable rather than re-asked.
4. *the tempers balanced or all hard* — **harder than yours. Finding §3.**

---

## If you want the seed

Say the word on §1 and §2 and I will re-run. With **specificity-wins** and **`seatsAreExclusive: true`** the
output changes materially — the pole regions get their orders and nothing shares a building — and that version
is the one I would offer as a seed rather than this one.

The generator is a **reporting tool** today and lives in `scripts/`, not `engine/`. The wiring audit was right to
refuse it as an engine module: an export reachable only from a test "passes CI and CANNOT FIRE IN PLAY". Wiring
it to mint would decide on my own that the world starts growing powers before you have reviewed the rules, which
is the opposite of your terms. It moves to `engine/` in the same commit as the caller that mints from it.

---

# Appendix — the run, verbatim

```

══ POWER DRY RUN ─ 29 powers authored, 23 of 38 regions held ══
   15 region(s) asked. Nothing is written.

── the_given_land ─ density: base 1 + 0.5/danger × 4 = 3 → 3
     outlaw_band   fair   at The Leaden Deep (settlement)  unit/17 heads q2  leader: notable
        verbs: toll, raid, extort, tribute
        placed by: placeAtTags dangerous at the_leaden_deep  ·  kinds.outlaw_band.tempers {"cruel":0.35,"hard":0.5,"fair":0.15}  ·  heads [12,45]  ·  leaderTier notable
     order         hard   at The Leaden Deep (settlement)  unit/86 heads q2  leader: heroic
        verbs: protect, patrol, levy, recruit, expand, feud
        placed by: placeAtTags sacred+cult at the_leaden_deep  ·  kinds.order.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,120]  ·  leaderTier heroic
     sovereignty   hard   at The Leaden Deep (settlement)  legion/361 heads q1 · form court  leader: heroic
        verbs: tax, patrol, protect, expand, inform, levy
        placed by: sovereignty needs no tag — it governs the region  ·  kinds.sovereignty.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,400]  ·  leaderTier heroic

── the_pattern_reach ─ density: base 1 + 0.5/danger × 5 = 3.5 → 3
     sovereignty   hard   at The Figure-Works (settlement)  legion/142 heads q3 · form council  leader: heroic
        verbs: tax, patrol, protect, expand, inform, levy
        placed by: sovereignty needs no tag — it governs the region  ·  kinds.sovereignty.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,400]  ·  leaderTier heroic
     outlaw_band   hard   at The Untethered (settlement)  unit/37 heads q2  leader: notable
        verbs: toll, raid, extort, tribute
        placed by: placeAtTags dangerous at the_untethered  ·  kinds.outlaw_band.tempers {"cruel":0.35,"hard":0.5,"fair":0.15}  ·  heads [12,45]  ·  leaderTier notable
     order         fair   at The Untethered (settlement)  unit/47 heads q3  leader: heroic
        verbs: protect, patrol, levy, recruit, expand, feud
        placed by: placeAtTags sacred+cult at the_untethered  ·  kinds.order.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,120]  ·  leaderTier heroic

── the_reasoned_hold ─ density: base 1 + 0.5/danger × 5 = 3.5 → 3
     outlaw_band   cruel  at The Bloodless Hold (settlement)  unit/18 heads q1  leader: notable
        verbs: toll, raid, extort, tribute
        placed by: placeAtTags dangerous at the_bloodless_hold  ·  kinds.outlaw_band.tempers {"cruel":0.35,"hard":0.5,"fair":0.15}  ·  heads [12,45]  ·  leaderTier notable
     order         hard   at The Bloodless Hold (settlement)  unit/25 heads q2  leader: heroic
        verbs: protect, patrol, levy, recruit, expand, feud
        placed by: placeAtTags sacred+cult at the_bloodless_hold  ·  kinds.order.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,120]  ·  leaderTier heroic
     sovereignty   hard   at The Bloodless Hold (settlement)  legion/22 heads q3 · form none  leader: heroic
        verbs: tax, patrol, protect, expand, inform, levy
        placed by: sovereignty needs no tag — it governs the region  ·  kinds.sovereignty.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,400]  ·  leaderTier heroic

── the_kept_reach ─ density: base 1 + 0.5/danger × 5 = 3.5 → 3
     lordship      hard   at The Drawn Hour (settlement)  unit/34 heads q3  leader: heroic
        verbs: tax, toll, levy, protect, patrol, recruit, expand, feud
        placed by: placeAtTags outpost at the_drawn_hour  ·  kinds.lordship.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [24,90]  ·  leaderTier heroic
        rival: power_long_choir — rivalWithinDays 30d
     sovereignty   fair   at The Drawn Hour (settlement)  legion/188 heads q3 · form order  leader: heroic
        verbs: tax, patrol, protect, expand, inform, levy
        placed by: sovereignty needs no tag — it governs the region  ·  kinds.sovereignty.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,400]  ·  leaderTier heroic
     order         hard   at The Forward Archive (settlement)  unit/24 heads q2  leader: heroic
        verbs: protect, patrol, levy, recruit, expand, feud
        placed by: placeAtTags sacred at the_forward_archive  ·  kinds.order.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,120]  ·  leaderTier heroic

── the_stark_reach ─ density: base 1 + 0.5/danger × 5 = 3.5 → 3
     outlaw_band   hard   at The Flensing (settlement)  unit/36 heads q1  leader: notable
        verbs: toll, raid, extort, tribute
        placed by: placeAtTags dangerous at the_flensing  ·  kinds.outlaw_band.tempers {"cruel":0.35,"hard":0.5,"fair":0.15}  ·  heads [12,45]  ·  leaderTier notable
     order         hard   at The Flensing (settlement)  unit/112 heads q3  leader: heroic
        verbs: protect, patrol, levy, recruit, expand, feud
        placed by: placeAtTags sacred+cult at the_flensing  ·  kinds.order.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,120]  ·  leaderTier heroic
     sovereignty   hard   at The Flensing (settlement)  legion/374 heads q2 · form none  leader: heroic
        verbs: tax, patrol, protect, expand, inform, levy
        placed by: sovereignty needs no tag — it governs the region  ·  kinds.sovereignty.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,400]  ·  leaderTier heroic

── the_feeling_coast ─ density: base 1 + 0.5/danger × 5 = 3.5 → 3
     order         cruel  at The Grief-House (settlement)  unit/70 heads q3  leader: heroic
        verbs: protect, patrol, levy, recruit, expand, feud
        placed by: placeAtTags sacred at the_grief_house  ·  kinds.order.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,120]  ·  leaderTier heroic
     sovereignty   fair   at The Grief-House (settlement)  legion/336 heads q3 · form moot  leader: heroic
        verbs: tax, patrol, protect, expand, inform, levy
        placed by: sovereignty needs no tag — it governs the region  ·  kinds.sovereignty.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,400]  ·  leaderTier heroic
     outlaw_band   hard   at The Wellspring Deep (settlement)  unit/19 heads q2  leader: notable
        verbs: toll, raid, extort, tribute
        placed by: placeAtTags dangerous at the_wellspring_deep  ·  kinds.outlaw_band.tempers {"cruel":0.35,"hard":0.5,"fair":0.15}  ·  heads [12,45]  ·  leaderTier notable

── the_veiled_reach ─ density: base 1 + 0.5/danger × 5 = 3.5 → 3
     sovereignty   fair   at The Kindly Court (settlement)  legion/140 heads q3 · form council  leader: heroic
        verbs: tax, patrol, protect, expand, inform, levy
        placed by: sovereignty needs no tag — it governs the region  ·  kinds.sovereignty.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,400]  ·  leaderTier heroic
     outlaw_band   cruel  at The Last Mask (settlement)  unit/26 heads q2  leader: notable
        verbs: toll, raid, extort, tribute
        placed by: placeAtTags dangerous at the_last_mask  ·  kinds.outlaw_band.tempers {"cruel":0.35,"hard":0.5,"fair":0.15}  ·  heads [12,45]  ·  leaderTier notable
     order         kind   at The Last Mask (settlement)  unit/65 heads q2  leader: heroic
        verbs: protect, patrol, levy, recruit, expand, feud
        placed by: placeAtTags sacred+cult at the_last_mask  ·  kinds.order.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,120]  ·  leaderTier heroic

── the_open_reach ─ density: base 1 + 0.5/danger × 4 = 3 → 3
     lordship      cruel  at The Measured Engine (settlement)  unit/54 heads q2  leader: heroic
        verbs: tax, toll, levy, protect, patrol, recruit, expand, feud
        placed by: placeAtTags outpost at the_measured_engine  ·  kinds.lordship.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [24,90]  ·  leaderTier heroic
        rival: power_pressureholt_schedule — rivalWithinDays 30d, rivalOppositeTemperChance 0.5 hit
     sovereignty   kind   at The Measured Engine (settlement)  legion/272 heads q2 · form specification  leader: heroic
        verbs: tax, patrol, protect, expand, inform, levy
        placed by: sovereignty needs no tag — it governs the region  ·  kinds.sovereignty.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,400]  ·  leaderTier heroic
     outlaw_band   hard   at The Unlanded (settlement)  unit/29 heads q1  leader: notable
        verbs: toll, raid, extort, tribute
        placed by: placeAtTags dangerous at the_unlanded  ·  kinds.outlaw_band.tempers {"cruel":0.35,"hard":0.5,"fair":0.15}  ·  heads [12,45]  ·  leaderTier notable

── foothill_gearsflat ─ density: base 1 + 0.5/danger × 1 = 1.5 → 1
     guild         fair   at Gearsflat (settlement)  unit/37 heads q1  leader: heroic
        verbs: steal, fence, smuggle, extort, inform
        placed by: placeAtTags market at gearsflat  ·  kinds.guild.tempers {"hard":0.6,"cruel":0.2,"fair":0.2}  ·  heads [20,60]  ·  leaderTier heroic

── foothill_greenmarch ─ density: base 1 + 0.5/danger × 1 = 1.5 → 1
     guild         hard   at Greenmarch (settlement)  unit/39 heads q2  leader: heroic
        verbs: steal, fence, smuggle, extort, inform
        placed by: placeAtTags market at greenmarch  ·  kinds.guild.tempers {"hard":0.6,"cruel":0.2,"fair":0.2}  ·  heads [20,60]  ·  leaderTier heroic

── foothill_greyhearth ─ density: base 1 + 0.5/danger × 1 = 1.5 → 1
     guild         cruel  at Greyhearth (settlement)  unit/50 heads q2  leader: heroic
        verbs: steal, fence, smuggle, extort, inform
        placed by: placeAtTags market at greyhearth  ·  kinds.guild.tempers {"hard":0.6,"cruel":0.2,"fair":0.2}  ·  heads [20,60]  ·  leaderTier heroic
        cells: The Worn Yard (8.6d), Hardline (11.6d)

── foothill_kindlerow ─ density: base 1 + 0.5/danger × 1 = 1.5 → 1
     guild         cruel  at Kindlerow (settlement)  unit/31 heads q1  leader: heroic
        verbs: steal, fence, smuggle, extort, inform
        placed by: placeAtTags market at kindlerow  ·  kinds.guild.tempers {"hard":0.6,"cruel":0.2,"fair":0.2}  ·  heads [20,60]  ·  leaderTier heroic

── foothill_longshore ─ density: base 1 + 0.5/danger × 1 = 1.5 → 1
     guild         hard   at Longshore (settlement)  unit/26 heads q1  leader: heroic
        verbs: steal, fence, smuggle, extort, inform
        placed by: placeAtTags market at longshore  ·  kinds.guild.tempers {"hard":0.6,"cruel":0.2,"fair":0.2}  ·  heads [20,60]  ·  leaderTier heroic

── foothill_plainstead ─ density: base 1 + 0.5/danger × 1 = 1.5 → 1
     guild         hard   at Plainstead (settlement)  unit/20 heads q1  leader: heroic
        verbs: steal, fence, smuggle, extort, inform
        placed by: placeAtTags market at plainstead  ·  kinds.guild.tempers {"hard":0.6,"cruel":0.2,"fair":0.2}  ·  heads [20,60]  ·  leaderTier heroic
        cells: Stair Hollow (10.8d)

── foothill_thinwater ─ density: base 1 + 0.5/danger × 1 = 1.5 → 1
     guild         hard   at Thinwater (settlement)  unit/33 heads q2  leader: heroic
        verbs: steal, fence, smuggle, extort, inform
        placed by: placeAtTags market at thinwater  ·  kinds.guild.tempers {"hard":0.6,"cruel":0.2,"fair":0.2}  ·  heads [20,60]  ·  leaderTier heroic

══ WHAT SHE ASKED ME TO WATCH FOR ══

1 · a pole region's pure-pole `cult` locus becomes an order
    8 region(s) carry a `cult` tag; 7 order(s) proposed there — PARTLY
    the_given_land: outlaw_band/order/sovereignty · the_pattern_reach: sovereignty/outlaw_band/order · the_reasoned_hold: outlaw_band/order/sovereignty · the_kept_reach: lordship/sovereignty/order · the_stark_reach: outlaw_band/order/sovereignty · the_feeling_coast: order/sovereignty/outlaw_band · the_veiled_reach: sovereignty/outlaw_band/order · the_open_reach: lordship/sovereignty/outlaw_band

2 · the market foothill towns get guilds, and only one per region
    7 market town(s): gearsflat=1 greenmarch=1 greyhearth=1 kindlerow=1 longshore=1 plainstead=1 thinwater=1
    every one has exactly one: YES · any with more than one: no

3 · the supply-line rule fires only where a hunger fits
    no hunger arc is loaded — the rule has nothing to fit a power to (work order item 2 lands them)

4 · the tempers come out balanced, or all hard
    proposed: hard 17 (55%) · fair 6 (19%) · cruel 6 (19%) · kind 2 (6%)
    authored: hard 9 (31%) · fair 8 (28%) · cruel 7 (24%) · kind 5 (17%)

══ TOTAL ─ 31 power(s) proposed across 15 region(s) ══
   kinds:   sovereignty 8 · outlaw_band 7 · order 7 · guild 7 · lordship 2
   leaders: heroic 24 · notable 7
   ⛑ nothing written. Review the RULES against this, not the names.

```
