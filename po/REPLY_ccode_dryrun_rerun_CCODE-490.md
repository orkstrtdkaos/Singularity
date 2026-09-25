<!-- status: re-run after Aevi's rulings — nothing written to content; three consequences of ruling 1 need her word -->
# REPLY: CCode → Aevi — the rulings are landed, and the re-run (CCODE-490)

**CCode · 2026-09-24 · v2.6.0** · `node scripts/power_dryrun.mjs` · nothing written to content

All seven values are in `content/packs/core/rules/powers.json`, landed in the same commit as the two gates, as you
asked. Both gates are moved: §359's *"one seat, one power is a rule that does not exist yet"* now asserts the
ruling instead of its absence, and the outlaw-crown fixture no longer stacks bands on one seat.

**And thank you for the CERTIFY correction.** You were right that it wasn't the ruling — those two docs were stale
on origin from my own CCODE-489 push, and I should have caught them.

## Your rulings, landed

| # | ruling | landed as |
|---|---|---|
| 1 | specificity wins | **code** — more matched tags takes the seat; a tie falls to the lower mean corpus frequency of the matched tags, counted from the places themselves so it moves when you tag more ground |
| 2 | one seat, one power | `seatsAreExclusive: true` |
| 3 | kind weights | `guild {hard .45, cruel .2, fair .2, kind .15}` · `outlaw_band {cruel .35, hard .4, fair .15, kind .1}` |
| 4 | one generated sovereignty, and a real legion | `kinds.sovereignty.perRegionMax: 1`, `heads [80, 400]` |
| 5 | `none` is not a form | dropped from `forms` |
| 6 | a government lives in the city | **code + value** — `seatPrefersTags: ["city","home"]`, a preference with a fallback |

## What the re-run shows

**✅ Ruling 6 is a clean win.** All eight sovereignties now sit in the cities you named, and nowhere else:

| region | seat | temper | heads | form |
|---|---|---|---|---|
| the Given Land | **Bedrock** | kind | 127 | specification |
| the Pattern Reach | **Cloudform** | hard | 183 | council |
| the Reasoned Hold | **the Axiom** | hard | 137 | court |
| the Kept Reach | **the Slow Hour** | hard | 130 | specification |
| the Stark Reach | **the Unblinking Stone** | fair | 311 | contest |
| the Feeling Coast | **Wellspring** | cruel | 241 | moot |
| the Veiled Reach | **the Hall of Mirrors** | fair | 181 | council |
| the Open Reach | **the Long Span** | cruel | 226 | court |

No legion of 22 anywhere; the smallest is 127. No `form: none`. No seat holds two powers.

**✅ Ruling 3 landed where you aimed.** Proposed **hard 34% · kind 24% · fair 24% · cruel 17%** against your
authored **31 / 17 / 28 / 24**. It was 55 / 6 before.

**✅ Every leader has a whole name from their own people's pools.** A sample: *Aldo Flagg the Weight* — whole name
**Aldo Edmund Flagg**, a mason; *Calla Scriven the Impossible Angle* — **Calla Ari Scriven**, a figurist;
*Aristide Formall the Argument* — **Aristide Prisca Formall**, a syllogist. The people is the origin whose
`homeRegion` is that region, and the origin kind is `vacancy` — a power that did not exist yesterday has a
founder, not a successor or a survivor, and `vacancy`'s tone is `plain`, which is how a founder's byname reads.

**✅ The cult sites go to the orders now, eight of eight** — that was ruling 1 doing exactly what you said.

---

## ⛔ But ruling 1 has three consequences, and they are yours to decide

Specificity is doing what you ruled. These are the knock-ons, measured, not opinions.

### a · The market towns lost their guilds — 7 of 7 → 0

A foothill town is tagged `settlement, foothill, market`. **`guild` matches `market` (18 places in the corpus);
`lordship` matches `foothill` (12).** One tag each, so the tie-break decides, and `foothill` is rarer — so a
lordship takes every single market town and your watch-item 2 inverted.

Only one guild survives in the whole run, at the Weighing Yard.

The tie-break is faithful to the words; I think the words want a look. Three ways out:

- **`market` is the more particular claim about a market town** — rarity across the corpus is a poor proxy for
  "what is this place *for*". A `seatPrefersTags` on `guild` of `["market"]` would settle it with a key that
  already exists and a reader that is already in.
- **give `guild` a second tag to match** — the towns carry `settlement` too, and `guild.placeAtTags` does not.
- **or accept lordships in the foothills** and let guilds live in the bigger trade places. That reads fine to me,
  but it is not what your watch-item wanted, so I am not choosing it for you.

### b · No outlaw band is proposed anywhere — so no crown can ever form, and every leader is heroic

**7 bands → 0.** At a pole region's locus, `order` matches `sacred+cult` (two tags) and beats the band's
`dangerous` (one). With exclusive seats the band then gets no seat in any of the fifteen regions.

Two follow-ons worth seeing:

- `outlaw_crown` needs `formsWhenBandsInRegion: 3`, so **a generated world can never grow a crown** — the only
  path to one is your authoring.
- `outlaw_band` is the **only kind with a `notable` leader**. All 29 proposed leaders came out **heroic**. The
  generated world has no small fry in it at all.

### c · `order` has no `perRegionMax`, and it is now the most numerous kind

11 of 29, and **two in one region three times** (the Reasoned Hold, the Stark Reach, the Feeling Coast). You capped
sovereignty at one; orders now stack. Two rival temples in one country may be exactly right — the Unshadowed and
the Glass Assembly are a pair — but it is now the least-governed number in the set.

---

## The seed

Say the word on (a), and on (b) if you want bands back, and I will re-run and hand you the result as the seed.
As it stands the output has: pole orders at the cult sites ✅, sovereignties in the cities ✅, tempers near your
split ✅, **a guild in each market town ✗**, and **no outlaws at all**.

Watch-item 3 still waits on item 2's hunger arcs, as you said.

3,639 assertions · 31 suites · zero failures. No version bump: nothing here is player-visible yet — the
generator writes nothing, and the rule values are read only by it.

---

# Appendix — the run, verbatim

```
══ POWER DRY RUN ─ 29 powers authored, 23 of 38 regions held ══
   15 region(s) asked. Nothing is written.

── the_given_land ─ density: base 1 + 0.5/danger × 4 = 3 → 3
     sovereignty   kind   at Bedrock (region)  legion/127 heads q3 · form specification  leader: heroic
        verbs: tax, patrol, protect, expand, inform, levy
        placed by: sovereignty needs no tag — it governs the region · seatPrefersTags city/home at bedrock  ·  kinds.sovereignty.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [80,400]  ·  leaderTier heroic
     order         hard   at The Leaden Deep (settlement)  unit/110 heads q2  leader: heroic
        verbs: protect, patrol, levy, recruit, expand, feud
        placed by: placeAtTags sacred+cult at the_leaden_deep  ·  kinds.order.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,120]  ·  leaderTier heroic
     guild         fair   at The Weighing Yard (settlement)  unit/56 heads q1  leader: heroic
        verbs: steal, fence, smuggle, extort, inform
        placed by: placeAtTags market at the_weighing_yard  ·  kinds.guild.tempers {"hard":0.45,"cruel":0.2,"fair":0.2,"kind":0.15}  ·  heads [20,60]  ·  leaderTier heroic

── the_pattern_reach ─ density: base 1 + 0.5/danger × 5 = 3.5 → 3
     sovereignty   hard   at Cloudform (region)  legion/183 heads q3 · form council  leader: heroic
        verbs: tax, patrol, protect, expand, inform, levy
        placed by: sovereignty needs no tag — it governs the region · seatPrefersTags city/home at cloudform  ·  kinds.sovereignty.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [80,400]  ·  leaderTier heroic
     order         kind   at The Untethered (settlement)  unit/84 heads q2  leader: heroic
        verbs: protect, patrol, levy, recruit, expand, feud
        placed by: placeAtTags sacred+cult at the_untethered  ·  kinds.order.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,120]  ·  leaderTier heroic

── the_reasoned_hold ─ density: base 1 + 0.5/danger × 5 = 3.5 → 3
     sovereignty   hard   at The Axiom (region)  legion/137 heads q1 · form court  leader: heroic
        verbs: tax, patrol, protect, expand, inform, levy
        placed by: sovereignty needs no tag — it governs the region · seatPrefersTags city/home at the_axiom  ·  kinds.sovereignty.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [80,400]  ·  leaderTier heroic
     order         hard   at The Bloodless Hold (settlement)  unit/21 heads q3  leader: heroic
        verbs: protect, patrol, levy, recruit, expand, feud
        placed by: placeAtTags sacred+cult at the_bloodless_hold  ·  kinds.order.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,120]  ·  leaderTier heroic
     order         cruel  at The Proof-Halls (settlement)  unit/49 heads q3  leader: heroic
        verbs: protect, patrol, levy, recruit, expand, feud
        placed by: placeAtTags sacred at the_proof_halls  ·  kinds.order.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,120]  ·  leaderTier heroic

── the_kept_reach ─ density: base 1 + 0.5/danger × 5 = 3.5 → 3
     sovereignty   hard   at The Slow Hour (region)  legion/130 heads q2 · form specification  leader: heroic
        verbs: tax, patrol, protect, expand, inform, levy
        placed by: sovereignty needs no tag — it governs the region · seatPrefersTags city/home at the_slow_hour  ·  kinds.sovereignty.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [80,400]  ·  leaderTier heroic
     lordship      hard   at The Drawn Hour (settlement)  unit/56 heads q2  leader: heroic
        verbs: tax, toll, levy, protect, patrol, recruit, expand, feud
        placed by: placeAtTags outpost at the_drawn_hour  ·  kinds.lordship.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [24,90]  ·  leaderTier heroic
        rival: power_long_choir — rivalWithinDays 30d, rivalOppositeTemperChance 0.5 hit
     order         kind   at The Forward Archive (settlement)  unit/67 heads q3  leader: heroic
        verbs: protect, patrol, levy, recruit, expand, feud
        placed by: placeAtTags sacred at the_forward_archive  ·  kinds.order.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,120]  ·  leaderTier heroic

── the_stark_reach ─ density: base 1 + 0.5/danger × 5 = 3.5 → 3
     sovereignty   fair   at The Unblinking Stone (region)  legion/311 heads q1 · form contest  leader: heroic
        verbs: tax, patrol, protect, expand, inform, levy
        placed by: sovereignty needs no tag — it governs the region · seatPrefersTags city/home at the_unblinking_stone  ·  kinds.sovereignty.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [80,400]  ·  leaderTier heroic
     order         hard   at The Flensing (settlement)  unit/113 heads q2  leader: heroic
        verbs: protect, patrol, levy, recruit, expand, feud
        placed by: placeAtTags sacred+cult at the_flensing  ·  kinds.order.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,120]  ·  leaderTier heroic
     order         hard   at The Told Ground (settlement)  unit/28 heads q2  leader: heroic
        verbs: protect, patrol, levy, recruit, expand, feud
        placed by: placeAtTags sacred at the_told_ground  ·  kinds.order.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,120]  ·  leaderTier heroic

── the_feeling_coast ─ density: base 1 + 0.5/danger × 5 = 3.5 → 3
     sovereignty   cruel  at Wellspring (region)  legion/241 heads q3 · form moot  leader: heroic
        verbs: tax, patrol, protect, expand, inform, levy
        placed by: sovereignty needs no tag — it governs the region · seatPrefersTags city/home at wellspring  ·  kinds.sovereignty.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [80,400]  ·  leaderTier heroic
     order         fair   at The Grief-House (settlement)  unit/42 heads q3  leader: heroic
        verbs: protect, patrol, levy, recruit, expand, feud
        placed by: placeAtTags sacred at the_grief_house  ·  kinds.order.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,120]  ·  leaderTier heroic
     order         kind   at The Wellspring Deep (settlement)  unit/37 heads q3  leader: heroic
        verbs: protect, patrol, levy, recruit, expand, feud
        placed by: placeAtTags sacred+cult at the_wellspring_deep  ·  kinds.order.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,120]  ·  leaderTier heroic

── the_veiled_reach ─ density: base 1 + 0.5/danger × 5 = 3.5 → 3
     sovereignty   fair   at The Hall of Mirrors (region)  legion/181 heads q3 · form council  leader: heroic
        verbs: tax, patrol, protect, expand, inform, levy
        placed by: sovereignty needs no tag — it governs the region · seatPrefersTags city/home at the_hall_of_mirrors  ·  kinds.sovereignty.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [80,400]  ·  leaderTier heroic
     order         fair   at The Last Mask (settlement)  unit/102 heads q2  leader: heroic
        verbs: protect, patrol, levy, recruit, expand, feud
        placed by: placeAtTags sacred+cult at the_last_mask  ·  kinds.order.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,120]  ·  leaderTier heroic

── the_open_reach ─ density: base 1 + 0.5/danger × 4 = 3 → 3
     sovereignty   cruel  at The Long Span (region)  legion/226 heads q2 · form court  leader: heroic
        verbs: tax, patrol, protect, expand, inform, levy
        placed by: sovereignty needs no tag — it governs the region · seatPrefersTags city/home at the_long_span  ·  kinds.sovereignty.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [80,400]  ·  leaderTier heroic
     lordship      kind   at The Measured Engine (settlement)  unit/64 heads q3  leader: heroic
        verbs: tax, toll, levy, protect, patrol, recruit, expand, feud
        placed by: placeAtTags outpost at the_measured_engine  ·  kinds.lordship.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [24,90]  ·  leaderTier heroic
        rival: power_pressureholt_schedule — rivalWithinDays 30d, rivalOppositeTemperChance 0.5 hit
     order         kind   at The Unlanded (settlement)  unit/101 heads q2  leader: heroic
        verbs: protect, patrol, levy, recruit, expand, feud
        placed by: placeAtTags cult at the_unlanded  ·  kinds.order.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [20,120]  ·  leaderTier heroic

── foothill_gearsflat ─ density: base 1 + 0.5/danger × 1 = 1.5 → 1
     lordship      kind   at Gearsflat (settlement)  unit/51 heads q2  leader: heroic
        verbs: tax, toll, levy, protect, patrol, recruit, expand, feud
        placed by: placeAtTags foothill at gearsflat  ·  kinds.lordship.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [24,90]  ·  leaderTier heroic
        rival: power_firstsight_barony — rivalWithinDays 30d, rivalOppositeTemperChance 0.5 hit

── foothill_greenmarch ─ density: base 1 + 0.5/danger × 1 = 1.5 → 1
     lordship      cruel  at Greenmarch (settlement)  unit/56 heads q3  leader: heroic
        verbs: tax, toll, levy, protect, patrol, recruit, expand, feud
        placed by: placeAtTags foothill at greenmarch  ·  kinds.lordship.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [24,90]  ·  leaderTier heroic

── foothill_greyhearth ─ density: base 1 + 0.5/danger × 1 = 1.5 → 1
     lordship      fair   at Greyhearth (settlement)  unit/74 heads q3  leader: heroic
        verbs: tax, toll, levy, protect, patrol, recruit, expand, feud
        placed by: placeAtTags foothill at greyhearth  ·  kinds.lordship.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [24,90]  ·  leaderTier heroic
        rival: power_keelmouth_slip — rivalWithinDays 30d

── foothill_kindlerow ─ density: base 1 + 0.5/danger × 1 = 1.5 → 1
     lordship      fair   at Kindlerow (settlement)  unit/41 heads q2  leader: heroic
        verbs: tax, toll, levy, protect, patrol, recruit, expand, feud
        placed by: placeAtTags foothill at kindlerow  ·  kinds.lordship.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [24,90]  ·  leaderTier heroic

── foothill_longshore ─ density: base 1 + 0.5/danger × 1 = 1.5 → 1
     lordship      cruel  at Longshore (settlement)  unit/34 heads q2  leader: heroic
        verbs: tax, toll, levy, protect, patrol, recruit, expand, feud
        placed by: placeAtTags foothill at longshore  ·  kinds.lordship.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [24,90]  ·  leaderTier heroic
        rival: power_switchback_tollmen — rivalWithinDays 30d, rivalOppositeTemperChance 0.5 hit

── foothill_plainstead ─ density: base 1 + 0.5/danger × 1 = 1.5 → 1
     lordship      hard   at Plainstead (settlement)  unit/24 heads q2  leader: heroic
        verbs: tax, toll, levy, protect, patrol, recruit, expand, feud
        placed by: placeAtTags foothill at plainstead  ·  kinds.lordship.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [24,90]  ·  leaderTier heroic

── foothill_thinwater ─ density: base 1 + 0.5/danger × 1 = 1.5 → 1
     lordship      hard   at Thinwater (settlement)  unit/45 heads q3  leader: heroic
        verbs: tax, toll, levy, protect, patrol, recruit, expand, feud
        placed by: placeAtTags foothill at thinwater  ·  kinds.lordship.tempers {"cruel":0.25,"hard":0.25,"fair":0.25,"kind":0.25}  ·  heads [24,90]  ·  leaderTier heroic

══ WHAT SHE ASKED ME TO WATCH FOR ══

1 · a pole region's pure-pole `cult` locus becomes an order
    8 region(s) carry a `cult` tag; 11 order(s) proposed there — YES, every one
    the_given_land: sovereignty/order/guild · the_pattern_reach: sovereignty/order · the_reasoned_hold: sovereignty/order/order · the_kept_reach: sovereignty/lordship/order · the_stark_reach: sovereignty/order/order · the_feeling_coast: sovereignty/order/order · the_veiled_reach: sovereignty/order · the_open_reach: sovereignty/lordship/order

2 · the market foothill towns get guilds, and only one per region
    7 market town(s): gearsflat=0 greenmarch=0 greyhearth=0 kindlerow=0 longshore=0 plainstead=0 thinwater=0
    every one has exactly one: NO · any with more than one: no

3 · the supply-line rule fires only where a hunger fits
    no hunger arc is loaded — the rule has nothing to fit a power to (work order item 2 lands them)

4 · the tempers come out balanced, or all hard
    proposed: hard 10 (34%) · kind 7 (24%) · fair 7 (24%) · cruel 5 (17%)
    authored: hard 9 (31%) · fair 8 (28%) · cruel 7 (24%) · kind 5 (17%)

══ TOTAL ─ 29 power(s) proposed across 15 region(s) ══
   kinds:   order 11 · lordship 9 · sovereignty 8 · guild 1
   leaders: heroic 29
   ⛑ nothing written. Review the RULES against this, not the names.

```
