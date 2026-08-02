# SPEC — SNG-259b: reset the level→power-tier bands (the "legendary at 7" fix)
## Aevi (PO) · 2026-08-02 · Erik: "reset the levels we're calling master/heroic/epic/legendary — not 7 anymore"

## The defect (verified)
`engine/legends.js:51 tierForArc(level)` is the canonical level→power-tier mapping, and it is BOTH stale AND
underbuilt:
```
tierForArc: level>=7 → legendary; level>=4 → regional; else → riffraff
```
Two problems: (1) **legendary at level 7 is absurdly low** now — it was set against a much shorter economy; (2)
it only has **3 bands and skips notable + epic entirely**, even though the tier SPECTRUM
(`tierRank`, `LEGEND_TIER_WEIGHT`) defines all five. So a level-7 character is called a "legendary" figure while
the game's real breakpoints (capstones at 10, the earnedpower high-water at 30) sit far above.

## The real level economy (grounded, from resolution.json + earnedpower.js)
- xp = level × 100; +1 skill point + 1 sub-point per level; sub-attributes cap 20.
- ability rank 2 opens at **L3**, rank 3 at **L5**; the highest craft tier (levelReq 5) opens at **L5**.
- **CAPSTONE threshold = L10** (`capstoneStanding.capstoneThreshold`).
- `earnedpower.js:73`: **L30+** is a special high-water mark (a second daily evolution) — the game's own signal
  for "a truly developed character."
- the sim samples L5 / L12 / L20 as low / mid / deep.

## Proposed 5-tier reset (grounded in the breakpoints — Erik tunes the exact cuts)
Mapped to the engine's existing five-tier spectrum (riffraff/notable/regional/epic/legendary), aligned to where
the economy ACTUALLY gates power:
| tier | level band | why here |
|---|---|---|
| riffraff | L1–4 | learning the craft; pre rank-3, pre top-tier |
| notable | L5–9 | rank 3 + highest craft tier unlocked; a real practitioner, not yet capstoned |
| regional | L10–17 | capstone threshold reached — a power in their region |
| epic | L18–29 | deep, multi-capstone, approaching the L30 mark |
| legendary | L30+ | the earnedpower high-water mark — a true legend |

This makes "legendary" mean what it should (a L30 figure, not a L7 one), uses all five bands, and every cut sits
on a real economy breakpoint rather than a round number.

## THE NAMING QUESTION (Erik's to settle — half the fix)
Erik named FOUR tiers — **master / heroic / epic / legendary** — but the engine spectrum has FIVE, named
**riffraff / notable / regional / epic / legendary**. These don't line up, and the words matter (they're what the
player sees). Two ways to reconcile:
- **Option A — keep the engine's five names**, just fix the level cuts (above). "master/heroic" were informal;
  the canonical spectrum stays riffraff→legendary. Simplest; no rename ripple.
- **Option B — rename toward Erik's words.** If "heroic" and "master" are the intended player-facing names, the
  spectrum could become e.g. novice/adept/master/heroic/legendary (dropping the villain-flavored riffraff/
  regional for hero-flavored master/heroic). This is a bigger change — the tier names thread through legends.js,
  the weight table, the GM prompt, the codex — so it's a rename pass, not a constant tweak.
NOTE the sim's OWN bands (roll_sensitivity/tradition_matrix use unopposed/riffraff/notable/regional/epic) must
stay ALIGNED to whatever we pick, and SNG-259 is ADDING heroic+legendary bands to those tools — so this naming
call and the SNG-259 endgame bands should be decided TOGETHER (they're the same spectrum, one for adversary
difficulty, one for character tier).

## What's whose
- **Erik:** (1) the level cuts (proposal above, tune freely); (2) the NAMING — Option A (fix cuts, keep names) or
  Option B (rename to master/heroic/…, a bigger pass); (3) does "heroic" sit between epic and legendary as a 6th
  band, or replace one? These are design/flavor calls only Erik makes.
- **Aevi:** once Erik picks names + cuts, author the tierForArc rewrite (all 5-6 bands, real thresholds) + any
  rename across the content/prompt layer, and reconcile with the SNG-259 sim bands so adversary-difficulty and
  character-tier use ONE spectrum.
- **CCode:** the engine side — tierForArc using the new bands, and the SNG-259 sim tools carrying the same
  spectrum. (These land together — same names, same cuts, adversary + character.)

## Sequencing
This pairs with SNG-259 (model the endgame) — the endgame sim NEEDS the corrected legendary threshold to place
its bands, and the reset NEEDS the sim to confirm the new bands play right. Decide naming + cuts, then author
tierForArc + the sim bands in one coherent pass, then measure.
