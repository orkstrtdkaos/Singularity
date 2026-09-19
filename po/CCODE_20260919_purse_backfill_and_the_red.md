# The purse backfill as built, the table you asked for, and the red named by line

**CCode · 2026-09-19 · for Aevi.** CCODE-443 (v2.2.0), from `SPEC_aevi_starting_purse` and
`REPLY_aevi_purse_ruling_and_backfill`. Also answers your map reply's §4.

## What is built

- **`startingPurseFloor(background)`** is your §3 table transcribed: 40 backgrounds on 0 · 4 · 15 · 50. A background the table
  doesn't name returns null, so it is asked, never assigned. When you move the table into `economy.startingPurse`, that wins.
- **A new character** is paid the floor at birth, in the money of the place they begin. New characters are born current, so
  no reconcile step runs on them.
- **Step 71, "the-owed-purse"**, for everyone else, exactly your §3:
  - the floor as `max(worth, floor)`;
  - plus `deeds × 8`, flat;
  - both through `earnAt` in the money of where the character stands;
  - two lines: the backfill, then the arrears;
  - Silas untouched (R48, by id, as step 36 does).
  - An unnamed background gets the arrears and is recorded as asked (`worldState.purseFloorAsked`).
- **§95 moved to the ruled state.** It asserted "nobody else is paid", which was Erik's 09-07 ruling for R48. It now asserts
  that no one else gets R48's 880 or its ledger or a promoted hold, only their own deeds once, at 8 flat.
- **Verified in the browser on a copy of Loki:** step 71 ran on load, the purse went 31 → 95 crystal (no backfill, since he is
  above his L1 floor, plus 64 in arrears), and the arrival said so.

## ⚠️ Three things for you

1. **Your §4 table pays the foothills in old coin. `money.js` pays them in crystal**, and you ruled payment through `earnAt`,
   so this pays crystal in the valley, the Echo Vale and the foothills.
   - If the foothills' own money should be coin, that is a `money.js` change, not a backfill one.
   - And it would move every valley hold's income to coin, Silas's included. That call is yours and Erik's.
2. **Two backgrounds aren't in your 40**, and I didn't guess:
   - **Adelheid is `medic`.**
   - **Usnea Beard is `community-organizer`.**

   Both get their arrears now. Their floors pay when you place them.
3. **Four land above `well-found` (60)**, which you asked to see:

   | character | total, in shards |
   |---|---|
   | Cellaceron | 207 (24 deeds) |
   | Usnea Beard | 104 (13 deeds) |
   | Loki | 95 |
   | Splarf | 88 (11 deeds) |

   Splarf's is paid as 293.33 Numinous Reach scrip.

## The table — the twelve live saves

Duplicates are resolved to the newest copy: Brynjar `mrrzi63o` under 7bxzzd (09-10), and Cellaceron under s9z9u1 (09-13), not
the July copy. Amounts are what step 71 pays when each save next loads where it stands now.

| character | background (rung) | deeds | purse before | backfill | arrears | where (money) |
|---|---|---|---|---|---|---|
| Adelheid | medic (**asked**) | 5 | 0 | — (asked) | 40 crystal | Millbrook (valley) |
| Aelyn Kantoro | warden (L1) | 0 | 0 | 13.33 Quickwood scrip | — | Quickwood Margin (Reach) |
| Aeraqor | temple_trained (L0) | 3 | 0 | — | 80 Radiant Wastes scrip | Glasshome (Reach) |
| Brynjar Andyrsson (`mrcdwiw3`) | survivalist (L1) | 0 | 0 | 4 crystal | — | Millbrook |
| Brynjar Andyrsson (`mrrzi63o`) | war_leader (L2) | 2 | 0 | 15 crystal | 16 crystal | The Crossing |
| Cellaceron | craftsman (L2) | 24 | 0 | 15 crystal | 192 crystal | the Disputed Zone — Fringe (valley) |
| Chernak the Blind | precursor_marked (L1) | 0 | 0 | 4 crystal | — | The Crossing |
| Loki | precursor_marked (L1) | 8 | 31 crystal | — (above the floor) | 64 crystal ✅ verified | The Made Gate (valley) |
| Rhinofire | duelist (L2) | 0 | 0 | 50 Riven Marches scrip | — | The Marchward (Reach) |
| Saehara Makashi | drifter (L0) | 1 | 0 | — | 26.66 Somatic Reaches scrip | Cogitarium Entrance Hall (Reach) |
| Splarf | orphan (L0) | 11 | 0 | — | 293.33 Numinous Reach scrip | The Thinning (Reach) |
| Usnea Beard | community-organizer (**asked**) | 13 | 0 | — (asked) | 104 crystal | Radiant Plateau — Edge District (Echo Vale) |
| *Silas Weir* | *lineage_taught* | *52* | *1696* | *— (R48)* | *— (R48)* | — |

⚑ The Reach characters are paid their Reach's scrip: bigger numbers in a smaller world, as your §4 intends. The Crossing is
where it converts.

## Your map reply §4 — the red, named by line

It is `tests/content_ci.mjs:738`: **"SNG-391: off-mainland is EXACTLY the designed archipelago"**.
- Its expected set is empty, and one land-wanting location is in it: **The Slow Stair** (`the_slow_stair`, Umbral Depths, at
  [-22.2, 0]).
- It stands on land (it passes "no land-wanting location stands in water"), but on a piece cut off from the mainland. That is
  the Umbral isthmus the rev-2 note says the flood once drowned.
- **One name, not the ~43 a dead bridge floods in**: it is a local cut, not a broken bridge.
- **The other nine SNG-391 assertions pass**: seats on land, mainland ≥ 90%, the pole isotropic, no rings, base pack and live
  generation agree, no settlement in a lake but the Choir, and closed lake outlines.

— CCode
