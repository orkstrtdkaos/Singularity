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


---

# SNG-258 (round 2) — Erik's follow-ups. GOALS-FIRST (CCode owns the how)
Erik's instruction: **state the goal, not the mechanism. Identify what must be TRUE; let CCode design the
implementation.** These are outcomes to achieve, not code to write.

## §3b — tier AND practice widen the PARTIAL band, not just success (goal)
GOAL: a higher-tier craft, and a more-practiced one (§2 use), should not only succeed more — they should **fail
more gracefully.** When a master's roll misses the success line, it should land in PARTIAL more often than a
novice's would. Right now the partial band is a flat 15 for everyone. Make expertise buy a **wider partial band**
(a near-miss becomes "you got some of it" rather than a clean failure). This is the other half of §3 (tier) and
§2 (practice): expertise = reaches further AND degrades softer. CCode decides how tier/use map to band width;
the GOAL is that mastery visibly softens failure.

## §4b — the roll popup: character NAME, and spectral-fit that explains ITSELF (goal)
Two fixes to the §4 popup:
1. GOAL: the popup addresses the **character by NAME**, not "your" ("Silas's practical 4" not "your practical").
   Second-person is for the GM's prose; the math readout is about the character.
2. GOAL: **spectral fit must explain what alignment IS and why this character fits or doesn't.** Today "spectral
   fit −8" is opaque. It must read like: "{name} leans {toward-order, concrete}; this craft pulls {toward-chaos}
   → poor fit −8." AND the popup should say, in plain language, WHERE that alignment came from, because it's
   currently unclear even to the player (see the finding below).

### FINDING for Erik (answering "what does alignment mean — my skills or my domain?")
Verified in the engine: **alignment is neither your skills nor exactly your domain.** It's a vector of your
positions on the world's philosophical SPECTRUMS (order↔chaos, light↔dark, concrete↔abstract, etc.), set at
CHARACTER CREATION. Spectral fit is a directional match (cosine) between YOUR lean and the CRAFT's lean. Two
honest gaps the popup work exposes:
  - the character→tradition→alignment link is LOOSE (traditions carry a `disposition` primary/secondary pole, not
    a clean alignment vector, so a character's alignment isn't cleanly inherited from their people);
  - **alignment never DRIFTS** — doing chaos-work all day doesn't make you more chaos-aligned.
GOAL (design, Erik's call whether to build): consider making alignment (a) clearly DERIVED from
tradition/domain/choices at creation so the player knows what set it, and (b) optionally DRIFT toward what you
repeatedly do — so identity is earned by action, matching the game's "earned through repetition" theme (§2, §5).
Minimum: the popup must make the CURRENT alignment and its source legible. Whether it drifts is a bigger call.

## §10 — ENVIRONMENTAL EFFECTS MODIFIER: prepared ground, carried items, companion auras as one family (goal)
This is the big one and it generalises §7 (gear) + the companion bonus + standing effects (§8) into a single
principle Erik named directly.

GOAL: **the field of an encounter carries EFFECTS that are part of the contest, that can be established
beforehand, and that can be CONTESTED before or during the fight.** Concretely, all of these are the same kind of
thing — an *effect present in the situation* that modifies rolls:
- **Prepared ground** — e.g. Stillwater's Trouble, where the player has WARDED the place in advance. Those wards
  are in effect when a fight happens there. An attacker could work to **take out the wards BEFORE battling**, or
  choose to fight with them in effect. The defender's preparation is a real, contestable advantage.
- **Carried items** — an item's effect (like an aura) is present in the situation the same way a ward is, not
  just a to-hit bonus on one roll.
- **Companion auras** — already a bonus; it's the same family — a presence in the field.

GOAL (the unifying principle): there is an **environmental / situational effects layer** — a set of active
effects attached to the PLACE (and to carried items and companions present) that:
  1. apply to the relevant rolls as named, transparent modifiers (visible in the §4 popup: "Stillwater wards
     (yours) +N" / "enemy ward −N");
  2. can be **ESTABLISHED AHEAD of an encounter** (warding your ground, setting carried items, positioning
     companions) — ties directly to §8 (standing effects that persist outside encounters);
  3. can be **CONTESTED** — an opponent can act to remove/suppress a ward before or during the fight (a phase
     where you dismantle the defender's preparation), and the defender can maintain/replace it;
  4. are TRANSPARENT before you engage — you can SEE the field's effects (yours and theirs) before committing, so
     "do I take out the wards first, or fight through them?" is an informed choice.

CCode owns the HOW (is it one effects-list on the encounter state? does it reuse the standing-effects duration
model from §8? how does "attack the ward" resolve — as its own mini-contest against the ward's strength?). The
GOALS are: prepared ground is real and contestable; carried items and companion auras are the same family; it's
all transparent before and during; and preparation BEFORE a fight is a genuine strategic layer.

## Sequencing note (unchanged): sensitivity tool → popup (now incl. §4b) → curve/skill/tier (now incl. §3b
## partial band) → substrate/gear/aptitude → standing-effects §8 → environmental-effects §10 (built ON §8).
§10 sits naturally after §8 because prepared-ground-that-persists IS a standing effect attached to a place.


---

# §4c — ALIGNMENT DRIFTS (Erik: DECIDED yes). Goal-first.
Erik confirmed: alignment SHOULD drift toward what you repeatedly do. Identity is earned by action — the same
"earned through repetition" spine as §2 (skill-use) and §5 (aptitude counters). This resolves the §4b finding
that alignment was static.

GOAL: **who a character IS, on the world's spectrums, is shaped by what they repeatedly DO.** A character who
works chaos-craft after chaos-craft drifts chaos-ward; one who mends and tends drifts toward life/order. Over
time, your alignment comes to reflect your history, not just your creation choice. And because spectral fit reads
off alignment, drift has a real consequence: **the more you do a kind of work, the better you fit it** — a
virtuous loop that rewards commitment to a path, and makes a character's spectral identity legible from their
deeds.

## Design tensions CCode + Erik will navigate (named, not solved — CCode owns the how)
These are the real questions drift raises; I flag them so the implementation is deliberate:
1. **Rate.** Drift should be SLOW — a felt arc over many sessions, not a wobble that swings each fight. One
   strong-aligned action shouldn't move you much; a hundred should. (Same concave/earned shape as skill-use.)
2. **Anchor vs. free.** Does your TRADITION/creation alignment act as a home you drift AROUND (a gravity well you
   return toward), or can sustained action move you fully away from where you started? Lean (Erik's call): a home
   pull that can be OVERCOME by sustained contrary action — you can become something other than you were born,
   but it takes real, repeated doing. This keeps tradition meaningful while honoring earned change.
3. **Can it be pulled UNWANTED?** If an enemy or a place forces you to act against your grain repeatedly, should
   that drift you? Interesting (a curse that erodes who you are) but risky (griefing your own identity). Lean:
   only YOUR chosen actions drift you; forced/coerced actions don't — drift is self-authored. (Erik's call.)
4. **Legibility (ties to §4b popup).** The player should be able to SEE their alignment and its trajectory — "you
   have been leaning chaos-ward" — so drift is a visible arc they can steer, not a silent change. The popup that
   explains spectral fit (§4b) should also show WHERE alignment is heading.
5. **Fit consequence is the point.** Because fit reads off alignment, drift means a committed path literally gets
   easier (better fit) and an abandoned one harder — mechanical reinforcement of identity-through-action. That's
   the FEATURE, not a side effect; the reward for walking a path is that the path becomes yours.

GOAL restated for CCode: alignment moves, slowly, toward the character's repeated CHOSEN actions; tradition is a
home it can drift around and eventually leave under sustained contrary action; the movement is visible to the
player; and the payoff is that fit improves along the path you actually walk. HOW (the drift function, the rate,
the anchor strength, the storage) is CCode's to design. This is a meaningful character-identity system, so it
sequences LATE — after the roll-math core and §8/§10 — and likely wants its own ticket once the core lands.
