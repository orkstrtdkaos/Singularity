<!-- status: FOR AEVI AND ERIK. Her four rulings: (1) done (CCODE-650); (2) (3) done (CCODE-655, with two map fixes found under them); (4) next. P1 measured: the seven epics already resolve, one name is `few`. Millbrook: the one-word flip travels with her branch. Pockets: which test? -->
# CCode → Aevi, Erik · the four rulings, P1, and the two branches

**CCode · 2026-10-07 · CCODE-650**

## The push blocker, first

Origin went red on Loki's play: a hold promoted today wrote `holding.rung` (the ladder rung it was promoted to), and
the local maps had been writing `character.localLayouts` since CCODE-639 without my declaring it. Both are declared
(CCODE-648); the census is 31/0 on the saves that broke it. That was mine twice over — the field was mine, and so was
the lesson from CCODE-640 the day before.

## Your four rulings

1. **The Mix/Strongest button is gone** (CCODE-650). It flipped `fieldCtl.mode`; `texture()`, the only reader of a
   mode, has no caller in play on any tier. §411's gate had asked whether the control *existed* and never whether
   anything read it — re-pointed. The engine keeps both modes for the day a lens reads them.
2. **The deliberately-wrong regions, on the ground** (CCODE-655). `REGION_LOOKS` in `engine/localmap.js` is one
   table the painter and the gate both read, your words as the hint under the region's title. The Pattern Reach: the
   drawn road lines drift up to 2.4 px by a seed taken when the map is opened — the Open Map button, or a change of
   region — never on a pan, a pick or a toggle, so nothing jumps under a tap. The Mirrorlands: one fake road per
   open, in the road's own style, between two places the road network does not join (from a lone place into the
   ground, to nowhere, when there is no such pair). The Numinous Reach: an elliptical fade to the stage's dark past
   the middle 60%. The Blaze, the Churn Edge, the Scouring and the Ceaseless: a dashed ring with twelve outward
   hatches. The routes, the marks and the clicks are untouched. Measured on Silas's save: the Mirrorlands' canvas
   differs between two opens by 837 px and Cloudform's by 2,489, the Radiant Wastes' (no look) by 0; the Numinous
   Reach's corners fade from the centre's 103 to 36–39; the Scouring's and the Churn Edge's rings are 94 and 81
   full-colour pixels in a perfect ring, the Ceaseless's 55 under its label.
3. **"?" — Erik's ruling** (CCODE-655). A place the character has not heard of is a "?" on the ground, still a mark
   and still tappable, and on its card; `routePlan`/`routeShort` no longer wait on `known`. Tapped at phone width in
   the Valley: "? — you have not heard of it", "Nothing is known of this place — a mark on the map, and a way there
   if the roads allow.", "Plan the journey (about 10.7 days)". One question I left as it is: the plan names the place
   in the quest line and the aside (the plan's own `destName`) — is laying the plan how one comes to hear of it?

## Found under ruling 2, fixed in the same commit

- **Roads drew in eight regions only.** The routed roads, the region's exits and their labels were nested inside
  `if (authoredMap)` with the named ground, and only eight regions have an authored map — 31 showed their places on
  bare ground (the Mirrorlands: 2 road-coloured pixels). Un-nested; the named ground and your ways keep the guard.
- **42 places in 14 regions never drew on their region map.** `regionExtent` computes a region's centre with atan2
  (−121° for the Making) while the places are stored 0–360 (236–246°), and `toScreen` is wrap-blind — every member
  landed a full turn off the canvas and was dropped. The computed centre now takes the members' convention and the
  base wraps a longitude into its frame before it samples or projects. The Making's five, Cloudform's four, the Kept
  Reach, the Stark Reach, the Lattice Cities, the Feeling Coast, the Ascent, the Manifest Domain and six Foothills
  draw now; the eight authored regions were saved by your 0–360 centres, except two of the Umbral Depths' six at
  357°, which the wrap carries in. A gate walks every region's members against its frame.
- **Not changed, for you to say:** the hint's "N places in this region" counts `regionTierNodes` (children folded
  into their parents) while the ground draws every placed member — the Making says "2 places" and draws five marks.
4. **`map.x/y` retires.** My half first, in one commit: `coordForGenerated` and its three mint sites, the schema's
   `map` dropping out of `required`, `borncontract`'s copy of a parent's `map`, the reconcile step's `delete rec.map`,
   the SNG-046 coord gates and content_ci's one-consumer gate (SNG-387). When that is on origin, strip the 163 and the
   schema property goes with your commit. I'll say when.

## P1 · the epics already resolve — no engine change

I measured before building. The legends roster hydrates into `CONTENT.npcs` at load, so a `figure` shot naming an
epic resolves today, and 681/G1 will take it. The seven, by id, with their homes:

| who | `figure` | home |
|---|---|---|
| Neth | `neth_the_stayed` | the_quiet_ground |
| the Deep Lantern | `the_deep_lantern` | the_underlight |
| Rethe | `the_cogitant_ninefold` | the_great_engine |
| Kesh Ardent | `the_edge_that_holds` | the_redline |
| Cinder Vael | `cinder_vael` | the_ceaseless |
| the Clockmother | `the_clockmother` | the_slow_hour |
| Seraphine | `the_unbending_witness` | the_unblinking_stone |

One catch: **the Clockmother's `nameKnown` is `few`**, and 681/G2 refuses a film naming anyone not `world`. Erik's
ruling made the fifteen guide names public; she was not on that list. Your call — `world` on her record, or no shot.
Author the shots and FL1 (the portraits) will reach them through the same resolution.

## The two branches

- **Millbrook (`aevi-mbriver`).** Both things you asked for are on origin already: §50 asks the ruling (a distance and
  a direction, never a number) and the river census is content (`ratified_name_census.json` → `riverCollisions`, the
  detector proved on a twin) since CCODE-635. What holds your branch is the *gap* I left beside §50 — it goes
  GAP-CLOSED the moment the Echo reads in metres. That is the one-word fix, and it has to travel with your content or
  it reddens origin today: in `tests/how_it_works.mjs` turn `gap("§50: Millbrook is not ON the river yet …` into
  `check(…)` with the condition inverted — `!/\bmi\b/.test(echoLine) && /\b\d+ m\b/.test(echoLine)` — in the same push.
  It is my test; you have my word to move it.
- **Pockets.** I cannot find a test holding it: the census moved to content on 2026-10-04 and the SNG-670 request is
  closed. Name the check and I'll move it the same way.

## The films

CCODE-649 is on origin with the notch, the sea sheen, the end card's Back and Escape, and G1–G3. The globe's size and
placement (C1) is next, then the Veil, the montage, the title card, F1/F2, then faces and landings.

— CCode
