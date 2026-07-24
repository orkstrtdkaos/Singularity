# SNG-227 — energy is a resource again (the level discount stops running away)

**CCode · 2026-07-23 · v1.8.240 (`811b972a`) · suite + wiring-audit green · curve modelled, clean boot.**
`status: complete_pending_review`

Your ask: *"I never rest because I level up (full energy) before I need to. Ease off the discount of
higher-level skills, especially fresh ones — they should get cheaper through USE. Braids: higher power, higher
cost, but less than running the parts separately."*

## Root cause (verified)
The **character-level** discount was **-1 per TWO levels**, so a base-8 skill hit its floor (4) by **L10** and
stayed there forever. Cost flatlined while energy income kept rising — *"I never rest."* At low levels the
discount was small and you *did* run out (correct); the bug was the high-level collapse.

## The fix (all ratified with you)
- **§3a — flatten to -1 per TEN levels.** `rules.leveling.energyEfficiencyPerTenLevels` (renamed from
  `PerTwoLevels`; it was read in exactly one place). The curve, base-8 **fresh** skill:

  | level | 1 | 5 | 10 | 15 | 20 |
  |---|---|---|---|---|---|
  | **OLD** | 8 | 6 | **4** | 4 | 4 | ← floored by L10, flatlines |
  | **NEW** | 8 | 8 | 8 | 7 | 7 | ← never bottoms from level alone |

- **§3c — a fresh skill BITES; mastery earns it down.** No new mechanic — flattening §3a makes the *existing*
  rank discount visible. At L10: rank 1/2/3 = **8 / 7 / 6**. A just-learned craft is expensive; grinding it
  toward the floor is where the discount now comes from.
- **§3b — floor unchanged at 50% of base** (your call). Now a destination you *earn* via level+rank, not a
  place you're dumped at L10 (base-8 → 4 only at, e.g., L40 rank 3).
- **§3d — braids cost a premium.** A braid's base = **priciest parent + ceil(cheaper / 2)** — always >
  the priciest part (the power premium), always < running both sequentially (the braid's efficiency). 8+10→14,
  10+10→15, 6+8→11. Computed at MINT from parent *base* costs (stable — doesn't drift as parents level), then
  runs through §3a/b/c like any craft. **This also gives SNG-226 the cost it needed** — a freshly-discovered
  braid (Marrow's Wings) lands *expensive* at rank 1 and masters down. `buildBraidDef` and the SNG-226
  discovery fallback both use it.
- **§4 — all knobs are JSON-tunable** (`energyEfficiencyPerTenLevels`, `minEnergyCostFraction`,
  `braidCheaperParentFraction`), threaded from `CONTENT.rules`. The next balance pass is a config edit.

## ROUND 2 — answered
- **Q1:** renamed the key — single reader, safe.
- **Q2:** braid cost **stored at mint** from parent base costs (stable, doesn't drift).
- **Q3:** the *math* is verified (below + smoke); the **feel** is your Tier-3 — the tunable knobs let you dial
  the curve after playing.
- **Q4 (higher BASE for higher-tier crafts, separate from the braid premium):** not done — it's a **content**
  lever (a tier→base band, or per-craft base costs) that's Aevi's lane. Flag if you want it; the braid premium
  already makes *combinations* cost more, and §3a/§3c already make high-level solo crafts cost near base.

## Expected feel (your Tier-3 to confirm)
- **Energy is a resource all game.** A hard scene draws the pool down; resting matters; the level-up refill is
  a *relief*, not a trivializer.
- **Mastery is felt** — a fresh skill is dear, grinding it to rank 3 visibly cheapens it toward the 50% floor.
- **Braids cost what they're worth** — a premium action that still beats running the parts one at a time.
- **Discoveries land expensive** — Marrow's Wings is a costly, powerful new craft you then master down.

## Honest bound
Tier-1 (Node suite: the /10 curve, fresh-bites, no floor-dump, mastery-cheapens, the 50% floor holds, the
braid premium >priciest/<sum and tunable, both mint sites use the rule) + the curve modelled above from the
real `effectiveEnergyCost`. The *feel* — does energy read as a resource now on a full play session — is yours
to confirm; the knobs are JSON so a second pass is a dial, not a rebuild.

*— CCode. The runaway was one divisor: halving the cost every two levels dumped every skill at its floor by
mid-game, so energy stopped mattering. Now the character level barely moves it, and MASTERY is what earns the
discount — a fresh craft bites, a practiced one eases, a braid costs its power, and the floor is a thing you
reach, not a thing you're handed. Rest should matter again.*
