# SPEC — SNG-227: Energy economy rebalance — the level discount runs away, braids cost too little
## Aevi (PO) · 2026-07-22 · verified at origin · Erik-directed, decisions ratified

> **Erik:** "I never have to rest because I level up (full health/energy) before I need to. At lower levels I
> ran out. Ease off the energy discount of higher-level skills, especially freshly-learned ones. They should
> decrease in cost as usage increases (to floor). And make the per-tier discount -1 per 10 levels (to floor).
> Braids: higher tier, more capable, more expensive, but less than running the parts sequentially — there
> should be a cost to higher power."

## §1 — Verified: WHY Erik never rests (the runaway is the CHARACTER-level discount)
`effectiveEnergyCost` (progression.js:166): `cost = max(floor, base - levelDiscount - rankDiscount)` where
- **`levelDiscount = floor((charLevel-1)/2) * 1`** — **-1 every 2 CHARACTER levels.** At L20 = **-10.**
- `rankDiscount = (abilityRank-1) * 1` — -1 per rank of the SKILL (earned through use).
- `floor = ceil(base * 0.5)` — 50% of base.

Modeled (base-8 skill): L1 costs 8, **L10 already hits the floor of 4, and stays 4 forever.** The
character-level discount alone drives everything to the floor by mid-game — so energy INCOME keeps rising
(bigger pool + level-up refill) while per-action COST flatlined at the floor. That's exactly "I never rest."
At low levels the discount is small, cost is near base, and Erik DID run out — correct and intended; the bug
is the high-level collapse.

## §2 — Two of Erik's asks are ONE fix (and one already exists)
- **"decrease in cost as usage increases (to floor)"** — this is the **rankDiscount, which ALREADY EXISTS**
  (-1 per skill-rank, ranks earned by practice). Erik isn't feeling it because the level discount swamps it —
  everything's at the floor before rank matters. **Flattening the level discount MAKES THE EXISTING
  USAGE-DISCOUNT VISIBLE** — a fresh skill starts expensive and audibly gets cheaper as you master it. His
  two asks collapse into one change.
- **"per-tier discount -1 per 10 levels (to floor)"** — change `levelDiscount` divisor from **/2 to /10**.

## §3 — THE FIX (ratified with Erik)
### §3a — Flatten the character-level discount: -1 per 10 levels (was -1 per 2)
`levelDiscount = floor((charLevel-1)/10) * (lv.energyEfficiencyPerTenLevels ?? 1)`. Modeled (base 8): L1=8,
L5=8, L10=8, L15=7, L20=7 — **never bottoms to the floor from character level alone.** The runaway is gone;
energy stays a real resource across the whole game.

### §3b — Floor stays at 50% of base (Erik's call — UNCHANGED)
`floor = ceil(base * 0.5)`. With §3a, the floor is now a destination you EARN through the rank discount (use
+ mastery), not a place you're dumped at L10. A fully-mastered skill still costs half its base — mastery makes
it cheaper, never free.

### §3c — Freshly-learned = full price; earns down through use (the rank discount, now visible)
No new mechanic — §3a makes the EXISTING rankDiscount matter. A just-learned skill (rank 1) has NO rank
discount and a tiny level discount → near base cost = expensive, as Erik wants. As it ranks up through
practice, -1/rank walks it toward the floor. **"Especially if we just learned them" is satisfied for free
once the level discount stops pre-discounting everything.**

### §3d — Braids/discoveries cost MORE than the priciest parent (Erik's call)
A braid's BASE cost = **priciest parent + ceil(cheaper parent / 2)**. Always > the priciest parent (the
higher-power premium Erik wants), always < running both sequentially (the efficiency of the braid). Modeled:
8+10 → braid base 14 (> 10, < 18, saves 4); 10+10 → 15; 6+8 → 11. Then the braid's own base runs through
§3a/b/c like any skill — so a freshly-DISCOVERED braid (SNG-226) is EXPENSIVE at rank 1 and earns down to its
own 50% floor through use. **This also sets the cost SNG-226 needs** — a discovered braid gets a real,
appropriately-premium cost, not a cheap default. Marrow's Wings (the-attended-end + the_shadow_work) gets
priciest-parent + half-the-other, and starts costly.

## §4 — Make it all tunable (no code edits to rebalance)
Move the knobs to `rules.leveling`: `energyEfficiencyPerTenLevels` (§3a), `minEnergyCostFraction` (floor,
§3b, already there), and a braid-cost rule/constant (§3d). So the next balance pass (Erik's or Aevi's) is a
JSON edit, not a code hunt — the same lesson as SNG-127's tunable rates.

## §5 — Expected feel after
- **Energy is a resource again all game.** At L20 skills cost near base (7-8), not the floor (4) — a hard
  scene draws the pool down, resting matters, the level-up refill is a relief not a trivializer.
- **Mastery is felt.** A fresh skill is expensive; grinding it to rank 3 visibly cheapens it (-2 to -3) toward
  the 50% floor. The usage-discount Erik asked for now DOES something.
- **Braids cost what they're worth.** A braid is a premium action (more than either parent) that still beats
  running the parts one at a time — power has a price, efficiency is the reward for the combination.
- **Discoveries land expensive.** Marrow's Wings arrives as a costly, powerful new craft you then master down
  — the reward is the capability, not a cheap one.

## OWNERSHIP
CCode — engine (effectiveEnergyCost §3a divisor; braid-base-cost rule §3d at the braid/discovery mint site,
ties SNG-226; move knobs to rules §4). No content. Aevi: if we want per-tier BASE cost bands (a tier-5 craft
has a higher base than a tier-1) as a separate lever, Aevi can author that as content — flag if wanted (Erik
mentioned "higher power skills" which may also want higher BASE, not just the braid premium).

## GUARDS
- **Don't touch the floor** (Erik's call) — 50% of base stays; §3a is the only curve change.
- **Freshly-learned must bite** — verify a just-learned skill costs near base, not pre-discounted; that's the
  whole point.
- **Braid > priciest parent, always** — the rule must never produce a braid cheaper than either parent (that
  would make braids strictly better and free — the opposite of "a cost to higher power").
- **Tunable, so this is iterable** — Erik will want to feel-test the new curve (Tier-3, his browser-leg);
  make the knobs JSON so a second pass is a config edit.

## OPEN QUESTIONS — CCODE ROUND 2
1. §3a — confirm `energyEfficiencyPerTwoLevels` is only read in this one site (so changing the divisor doesn't
   break another consumer). Rename to `PerTenLevels` or keep the key and change the divisor?
2. §3d — braid base cost computed at MINT (stored on the braid ability) or derived live from current parent
   costs? Stored-at-mint is stabler (parent costs change with level; a braid's base shouldn't drift). Lean
   stored-at-mint.
3. §5/Erik feel-test — this is a Tier-3 (does energy FEEL like a resource now?) confirm on Erik's end; the
   math is verifiable but the feel isn't. The tunable knobs (§4) let him dial it after playing.
4. Higher BASE for higher-tier crafts (separate from the braid premium)? Erik said "higher power skills" —
   does a tier-5 solo craft also want a higher base cost, or is base already tier-scaled in content? (Audit
   the ability base costs; Aevi can author a tier→base band if not.)
