# CCODE-416 — the travel bugs, and the gate cluster in content

**CCode · 2026-09-18 · for Aevi (content) and Erik (one ruling to confirm).**

> Erik: *"The made gate is next to the Whistling woman post, and it connects to the hub at the crossing, just like all other gates.
> It CAN also be used to travel directly to other gates, and if you're really good, can take you to any location you want (any
> waygate can do that). fixe the travel bugs."*

## What was wrong — measured on Silas's save, through the load path

| trip | before | after |
|---|---|---|
| Whistling Woman Post → the Crossing | 33.9 days on foot | **1.5 days, through the Made Gate** |
| the Crossing → Whistling Woman Post | 208.3 days | **1.5 days** |
| Millbrook → Threshold Post | 202.6 days | **3.1 days, through the Pale March waygate** |
| Whistling Woman Post → Millbrook | 87.3 days | **0.4 days** |
| roads that run one way after a load | 5 | **0** |

**Two causes.**

1. ⛔ **Content wins an id clash at load, and the content copies were stale.** SNG-396 promoted these places from the saves with a
   ROOM's inherited position (`worldPosInherited`), and the save that holds Erik's 09-06 ruling (reconcile 45 and 47) lost to them:
   - **the Made Gate** stood at the Crossing's own coordinates, with a road to it, and no `networkCapable`;
   - **the Pale March waygate** stood at Cairnhold's coordinates and **carried no `waygate` at all** — the gate Erik walked out of was
     a plain place to every save, his own included (reconcile 47 had made it a gate in his save; content overrode it);
   - **the fork on the Ashwarden March road** and **Stillwater's Trouble** stood at Cairnhold's too.
2. ⛔ **A road back to a grown place is an edit to an authored neighbour**, and the next load reads that neighbour fresh from
   content. So after a reload a grown place could be walked out of and never walked to. `twoWayRoads` now runs on every load,
   right after the grown places land.

## What I changed in your files — ⚑ please look

All four keep your prose; each carries `_placedBy` (the save's own marker) and a `worldPosNote` saying why.

| file | change |
|---|---|
| `gen_the_made_gate.json` | position (20.40, 251.95) · `regionId: valley` · `networkCapable: true` · road to Stillwater's Trouble **instead of** the Crossing · `parentId: null` (was the Crossing) — top-level, so the region map draws it beside the Whistling Woman; under Millbrook it would hide in Millbrook's sub-places · `communityId: valley.millbrook` (was `center.crossing`) |
| `the_crossing.json` | the road to the Made Gate removed — the gate is how the two meet |
| `gen_waygate.json` | **`waygate: true`, tier 2, `waygateDefaultTo: the_crossing`, `networkCapable`, the `waygate` tag** · name **"The Pale March Waygate"** and the descriptionSeed from reconcile 47 (your copy had the mint placeholder) · position (20.20, 251.63) · `communityId: valley.millbrook` |
| `gen_ashwarden_march_road.json` | position (20.24, 251.72) · `parentId: millbrook` (was Cairnhold, 160 days off) · `communityId: valley.millbrook` |
| `gen_stillwater_s_trouble.json` | position (20.277, 251.809) · road to the Made Gate added · `communityId: valley.millbrook` |

And one gate of mine moved: **`content_ci` SNG-387 now counts no sites.** SNG-398 puts a site within a day of its parent, so at
region scale it is its parent's position again — the same reason inherited positions were already out. Measured both ways: sites
counted, the valley's max is 5.75 (three untouched places — the_mountain_pass, disputed_zone_fringe, archive_hollow — flagged);
sites out, 2.84. ⚠️ **The valley is eight places, so 2.84 is close to the 3× line** — one more settlement by Millbrook could trip it.

And one thing on screen: **the region's ground map now names places through a declutter rule.** Placed where Erik put them,
seven names within a quarter-day of Millbrook printed as one smear. A name that would land on another now yields — where you
stand first, then gates, settlements, sites — and the one that stays says how many it covers (*"Whistling Woman Post +8"*).
The places themselves are all still drawn.

⚠️ **One knock-on, measured by `npc_pipeline`:** the fork, the waygate and the hollow moved from `the_palelands` (which has a home
tradition) to `valley` (which has none in `regions`), so `readDomains`' region rung misses them — **58 → 61 of 143 locations** fall
through it now. In play it costs nothing I can find: `affiliationAt`, which mints a grown person's domains, reads the substrate's
region map and answers `mason` at all four, exactly as it does at Millbrook.

## ⬜ Four things that are yours

1. ⚠️ **Two things are called Stillwater's Trouble.** The HOLD is the Raven's Home reconstruction, at `the_old_warden_post`, two
   miles from Cairnhold. The PLACE `gen-stillwater-s-trouble` — the hollow Silas sealed, by the Left Branch approach — Erik's 09-06
   ruling puts a couple of hours from the fork by Millbrook. But `the_old_warden_post.supersedes` lists `gen-stillwater-s-trouble`,
   so every save aliases the hollow onto Raven's Home, 160 days away. I moved the hollow's position and **left the supersedes list
   alone**: which one Stillwater's Trouble is, is a canon call. Travelling to the hold today goes through the Made Gate and Cairnhold's
   gate: 10 days from the Whistling Woman.
2. ⚑ **The Made Gate's descriptionSeed says "cut at the Crossing"**, and the ruling puts its mouth on the March, leading TO the
   Crossing. The GM reads that line. A suggestion, yours to word: *"cut on the March by a wright who tends endings, and it opens on
   the Crossing"*.
3. ⚑ **The Pale March waygate has a road to the Ent Grove** that is now a 91-day walk (it was 248). Reconcile 47 gave Erik's copy
   just the fork and Millbrook. The grove's own position is still inherited from `ent_deepwood`, which is where the length comes from.
4. ⚑ **Thirteen places still carry an inherited position.** No gate among them now (§297 holds that), but any of them that is a
   place of its own rather than a room will route wrong the same way. The list: the Cogitarium's two rooms, the Disputed Zone's
   far side, left-branch entrance and lower chamber, the Hub's north-gate street and registry office, Mara Wells' store, the
   Quickwood margin, the Ent Grove, the passage below the Unlit Deep, the Watershed Road, and the Low Lamp Inn.

## Erik — one to confirm

The positions above are the ones your 09-06 ruling put in Silas's save: the whole cluster a quarter-day from **Millbrook** — the Made
Gate beside the Whistling Woman, as you said today. **If the March is meant to be out by Cairnhold instead**, where Raven's Home is,
say so and the cluster moves in one step.

## Next, from the same message

- **Your crit-failure dials** (base 12, −1 a rank) land next, as their own ship.
- **"If you're really good, any location you want"** — any waygate aimed at any place you know, above a wayfaring bar. Gate to gate
  already works (§297 routes through it); aiming at a place with no gate is new, and comes after the dials.
- **Switching a legion's commander**, then the jobs build.
