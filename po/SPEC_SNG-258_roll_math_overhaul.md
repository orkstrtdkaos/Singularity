# SPEC — SNG-258: the roll-math overhaul (curve, use-tracking, transparency, substrate, gear, standing effects)
## Aevi (PO) · 2026-08-02 · Erik's roll-math review

Erik reviewed the roll table and raised nine threads. This spec captures all nine, grounded in the REAL
constants (resolution.json baseChance) and a sensitivity analysis. Several are TUNING (Erik's dials), several are
new MECHANICS (design), and a cluster is TRANSPARENCY (a roll-math popup). Grouped by kind.

## The sensitivity analysis that frames the tuning three (§1-3)
Current baseChance: attributeMultiplier 20, softCap 4, perPointBeyond 5, skillBonus 10, abilityLevelBonus 5.
Points each term contributes:
- **Attribute: ×20 to cap 4 = 80 pts from attribute ALONE.** attr3=60, attr4=80, attr6=90.
- Tier/ability rank: ×5 → T3 = +15.
- Skill: ×10 flat → skill3 = +30.
Typical stacks: novice-coherent attr3+T1 = 65; competent attr4+T2 = **90 (already ceiling-ish)**; master
attr6+T3+skill3 = 135 → clamps to 95. **THE FINDING: the attribute term is so dominant that once attr hits 4-5,
tier/skill/gear pile against the 95 ceiling and are WASTED.** That is why base hits 80-90 trivially, and why the
other terms feel like they don't matter — they mathematically don't, above attr 4.

### §1 — the attribute curve (Erik: "too easy to boost base to 80-90 — more logarithmic?")
CORRECTION worth stating: a PURE log curve makes it WORSE (log would give attr3→100). The real problem isn't the
SHAPE, it's the WEIGHT — attribute at ×20 eats the whole 0-95 range by level 4. The fix: **lower the multiplier
so attribute is ~50-60% of a strong chance, not 100%, leaving room for tier/skill/gear/matchup to matter.**
Options (Erik's dial): (a) multiplier 20→12-14 (attr4 = 48-56, leaving ~40 for everything else); (b) a gentler
curve that's concave but not log — e.g. diminishing steps 18/16/14/12 per point so early points help most and
attribute never alone-caps. Lean: (a) is simpler and testable; do the sensitivity sweep and SEE where the field
lands. GOAL: a maxed attribute should be a STRONG base (~55-65), not a solved one (80+).

### §2 — skill trained level should reward USE, not just acquisition (Erik)
Today skillBonus is ×10 FLAT — a skill you just learned and one you've used 500 times roll identically. Add a
**use-count that grows the skill's effective level with practice**: each use nudges a `uses` counter; the skill
bonus scales on a curve of uses (fast early, plateauing), so "something you do all the time" earns a real edge
over "something you just obtained." Design: skillLevel_effective = base + f(uses), f concave (e.g.
floor(log2(1+uses)) capped). Ties to §7 aptitude decay (same "earned-through-repetition" family). This is the
mechanic that makes a PRACTICED craft feel practiced.

### §3 — tier × ability bonus: too flat, want it more meaningful without overweighting (Erik)
Today ×5/rank = a flat +15 at T3, "big just because." Erik wants tier to be MORE powerful but not to overweight
everything. The tension: a higher-tier craft SHOULD be stronger, but a flat additive gets swamped-then-wasted
(above attr4 it's clamped away). Design: make tier's value CONDITIONAL/scaling rather than flat — e.g. tier
raises the CEILING or the crit band for that craft (a T3 craft can crit-succeed on a wider band, or push past the
95 cap slightly) rather than adding flat points that clamp. So T3 isn't "+15 to a number already at 95" — it's
"this craft can reach further / fail less / crit more." That makes tier matter WHERE the flat bonus currently
dies. Sensitivity sweep needed.

### §SENSITIVITY (Erik: "can we do a sensitivity analysis on all these?") — YES, as a tool
Build `tests/roll_sensitivity.mjs`: sweep each constant across a range, report where the field's win-rate and
spread land, so §1-3 are tuned on DATA not vibes. Same discipline as tradition_matrix. This runs BEFORE any
constant changes ship. (CCode.)

## The transparency cluster — one roll-math popup (§4, and threaded through §5-8)
### §4 — the roll-math popup / hover (Erik: "overall need")
Every term in the roll is ALREADY a named, self-summing line (SNG-106 - the engine builds them; app just isn't
showing them richly). Build a **hover/popup on any roll that shows the full breakdown** — every component with
its value AND its REASON:
- **spectral fit** must say exactly WHY you are/aren't a fit ("your alignment leans order; this craft is
  chaos-aligned → −8") — not just a number. Shown on the roll AND when browsing learnable skills.
- **aptitudes** that fired must be named ("physical aptitude +4").
- shown on skills you CAN LEARN (preview the chance before committing) and fed to the SUGGESTION ENGINE (it
  should weight suggestions by the real computed fit, incl. spectral/substrate/aptitude — see §5,§6,§8).

## The mechanic-additions cluster (§5-8)
### §5 — aptitudes: a counter so decay SLOWS each time you re-earn it (Erik)
Aptitudes are earned bonuses. Add an **earn-counter**: each time you re-earn an aptitude, its decay rate
DECREASES — so a thing you've earned many times becomes near-permanent, a thing earned once fades. (Same
earned-through-repetition family as §2 skill-use.) The popup (§4) names which aptitudes gave bonuses.

### §6 — substrate: transparency + IDEAL POINTS, not always-a-penalty (Erik)
Today substrate is only ever a PENALTY (substratePenalty). Erik: some crafts PREFER a certain substrate level or
a wild/structured MIX; extra substrate can give a BONUS or a bigger penalty depending on the craft. Design:
- each craft gets an **ideal substrate band** (a level and/or a wild↔structured mix it wants);
- being IN the band = bonus, OUTSIDE = penalty scaled by distance, and some crafts WANT more (a chaos-craft loves
  wild substrate; an order-craft loves structured).
- **Transparency BEFORE you try**: show the substrate fit for the current location on the skill, like spectral
  fit. Feeds the suggestion engine. Turns substrate from a flat tax into a real terrain-reading choice.

### §7 — wielding gear: obvious WHICH gear helps + an equip-for-skill link (Erik)
Today wield.value is a named line but it's not obvious the gear is helping or WHICH gear. Add:
- gear carries an **`equipFunction` / usedWith** tag telling the engine which skills it augments;
- the roll popup shows "wielding {gear} +N" prominently, and the gear UI shows which skills it boosts.
So a dagger vs an axe is a visible, deliberate choice, and the engine KNOWS your gear is the tool for the craft.

### §8 — standing effects: apply OUTSIDE encounters + persist per the prose (Erik)
Today standing effects are an in-encounter, round-based mechanic (CCODE-35). Erik: let them be applied OUTSIDE an
encounter and PERSIST as the skill prose describes (a ward that lasts the day, a blessing that holds until
broken). Then IN encounters they're turn-based OR persist-until-broken. Design: an effect carries a
**duration model** — {scope: encounter|world, expiry: turns|until-broken|until-time}. A world-scope effect
applied out of combat rides into the next encounter as a standing contestMod. This is the biggest mechanic add;
it makes buffs/wards real between fights.

### §9 — transparent crit bands (Erik)
Today critSuccessMax 5 / critFailMin 96 / partialBand 15 are invisible. Show them: the roll popup names "crit
success ≤5, crit fail ≥96, partial within 15 over" — and where a craft/tier/wild WIDENS the crit band (§3, wild
crafts), show the widened band. So the player sees their real swing, not just the pass line.

## Grouping for build order (my recommendation)
1. **§SENSITIVITY tool first** (CCode) — nothing tunes until we can see the curve. Cheap, unblocks §1-3.
2. **§4 roll-math popup** (CCode + Aevi copy) — pure transparency, high value, no balance risk; makes every other
   change legible. Threads §5/§6/§8/§9 reasons into it.
3. **§1-3 curve/skill-use/tier** (Erik dials via the sensitivity tool) — the balance heart; tune on data.
4. **§6 substrate ideal-points + §7 gear equip-link + §5 aptitude counter** — mechanic adds, each moderate.
5. **§8 standing-effects-persist** — biggest add, do last, own ticket.

## What's whose
- **Aevi:** the roll-table INTO the system spec (below/now); the popup COPY (spectral-fit reasons, substrate-fit
  language, per-term explanations); the substrate ideal-band CONTENT per craft-family; aptitude/skill-use curve
  SHAPES (design, Erik tunes magnitudes).
- **CCode:** the sensitivity tool; the popup wiring (the terms already exist per SNG-106); the mechanic engine
  work (§5 counter, §6 ideal-band eval, §7 equip-link, §8 duration model, §9 band display).
- **Erik:** the tuning dials (§1 multiplier/curve, §2 use-curve rate, §3 how tier scales) — on the sensitivity
  data; the §8 persistence model (how long is "until broken"?).
