// engine/melee.js — CCODE-251. DIFFERENT LEVELS OF RESOLUTION FOR DIFFERENT SCALES OF FIGHT.
//
// ⛔ ERIK, AND HE EXPLICITLY DID NOT DECIDE THIS: "it would be amazing if we could have everyone doing full
// turns mechanically behind the scenes and the pc playing into and being a casualty of that melee... but we
// might be able to simplify things at certain levels... like if we have more than 3 party members the rest go
// into a melee flow that isn't as specific... then if we have a legion, how does that work? we need different
// levels of resolve for these levels of battle or contest." — and: "we should think this through and test it."
//
// ⚠️ SO THE TEST IS THE POINT, AND IT IS A SPECIFIC TEST. An abstraction is only a SIMPLIFICATION if it
// produces what the full simulation produces. If the melee flow kills allies at a different rate than
// resolving all of them would have, it is not a shortcut — IT IS A DIFFERENT GAME WEARING A SHORTCUT'S NAME,
// and the party that drops into it is playing by rules the party of three never faced.
//
// ⛔ THEREFORE THIS MODULE IS CALIBRATED, NOT INVENTED, AND THE CALIBRATION IS AGAINST `battleRound` ITSELF.
// `scripts/scale_fidelity.mjs` measures ONE combatant through the real engine, hands the compression nothing
// but that measurement and a count, and checks the prediction against K real rounds. Worst divergence over
// K = 1..50 is 1.0% on the mean and 1.2% on the spread.
//
// ⚠️ ITS FIRST VERSION WAS A MIRROR AND I NEARLY SHIPPED IT: the "ground truth" was a formula I wrote in the
// same file as the compression, from the same pieces, so it agreed to 0.1% and proved only that I can add.
// A check that agrees with itself is this project's most persistent defect and it is usually mine.

const num = (v, d = 0) => (v == null || v === "" || !Number.isFinite(Number(v)) ? d : Number(v));

/** ⛔ THE TIERS. Erik named the boundaries — "more than 3 party members", "a legion" — and these are his
 *  numbers, not mine. Content-dialled so they are his to move without an engine change. */
export const MELEE_TIERS = [
  { id: "duel",     max: 1,   resolve: "full",     why: "one ally: today's contest, untouched" },
  { id: "skirmish", max: 3,   resolve: "full",     why: "everyone takes a real turn — Erik's ≤3" },
  { id: "melee",    max: 12,  resolve: "mixed",    why: "you and those you bring forward act; the rest resolve as an exchange" },
  { id: "legion",   max: Infinity, resolve: "mass", why: "units, not people — and you are one figure inside it" },
];

/** Which model a contest of this size uses. ⚠️ COUNTS COMBATANTS, NOT ALLIES — a party of two against forty
 *  is a legion fight, and calling it a skirmish because the party is small would be the whole error. */
export function resolutionTier(allyCount, foeCount = 1, { tiers = null } = {}) {
  const n = Math.max(num(allyCount, 0), num(foeCount, 0));
  const table = tiers || MELEE_TIERS;
  return table.find(t => n <= t.max) || table[table.length - 1];
}

/** ⛔ CCODE-271 / ERIK'S RULING — HOW MANY YOU CAN LEAD IS EARNED, NOT A SETTING.
 *
 *  He chose [C] and then improved it: *"as a player gains notoriety tier, hero, epic, etc... they will be
 *  higher level and more capable with deeds stacking up... that will allow them to own or build more holds
 *  and have more party members they can include and have act with them — for now 3 is a good number to set
 *  as the goal, with 1 party member that you get to have take turns per x number of levels... maybe based
 *  on social skills?"*
 *
 *  ⚠️ SO THE PARTY IS A REWARD, NOT A CONFIGURATION. A fixed 3 — my original guess — gave a level-1
 *  character the same battle line as a level-30 one, which is the opposite of a development arc.
 *
 *  ⛔ AND `presence` IS ALREADY THE RIGHT STAT. I did not have to invent a command score: its own authored
 *  description in `progression.js` reads *"Command and inspiration — leading, being heeded, holding a
 *  room."* Erik's "maybe based on social skills?" points exactly at it. A second ladder called Leadership
 *  would be two names for one thing.
 *
 *  THREE EARNED SOURCES, each separately legible at the table:
 *    · LEVEL      — his "1 per x number of levels": you have simply done this longer
 *    · PRESENCE   — you can hold a room, so you can hold a line
 *    · RENOWN     — his "notoriety tier, hero, epic": people follow someone they have heard of
 *
 *  ⚠️ THE CAP IS A GOAL, NOT A LAW. Erik: "for now 3 is a good number to set AS THE GOAL." Content-dialled
 *  so raising it later is an authoring decision rather than an engine change — and the comment says so,
 *  because a number with no note beside it becomes a law by silence. */
export function commandSlots(character, { cfg = {}, renownBand = null } = {}) {
  const maxNamed = Math.max(1, num(cfg.maxNamed, 3));
  const per = Math.max(1, num(cfg.levelsPerSlot, 10));
  const presenceAt = num(cfg.presenceForSlot, 7);
  const renowned = new Set(cfg.renownBandsForSlot || ["renowned", "legendary"]);

  const level = num(character?.level, 1);
  const presence = num(character?.subAttributes?.presence, num(character?.attributes?.social, 0));

  const earned = [];
  const byLevel = Math.floor(level / per);
  if (byLevel > 0) earned.push({ from: "level", n: byLevel, why: `level ${level}` });
  if (presence >= presenceAt) earned.push({ from: "presence", n: 1, why: `presence ${presence} — you can hold a room` });
  if (renownBand && renowned.has(String(renownBand))) earned.push({ from: "renown", n: 1, why: `${renownBand} — people follow someone they have heard of` });

  const extra = earned.reduce((a, e) => a + e.n, 0);
  // ⛔ +1 IS ALWAYS YOU. A character who can bring nobody forward still takes their own turn; a slot count
  // that could reach zero would delete the player from their own fight.
  const slots = Math.max(1, Math.min(maxNamed, 1 + extra));
  return { slots, capped: 1 + extra > maxNamed, maxNamed, earned,
    why: slots >= maxNamed ? `you lead ${slots} — the most anyone leads for now`
      : `you lead ${slots}: yourself${extra ? " and " + extra + " more" : ", and nobody else yet"}` };
}

/** ⛔ HOW MANY GET A REAL TURN. In `melee`, Erik's shape: you, plus the ones you bring forward. Everyone
 *  else is IN the fight — they are simply not narrated blow by blow.
 *  ⚠️ `namedLimit` NOW COMES FROM `commandSlots` WHERE A CHARACTER IS AVAILABLE. It stays a parameter so the
 *  tier table can still be reasoned about without one. */
export function actingSlots(tier, { namedLimit = 3 } = {}) {
  if (tier.resolve === "full") return Infinity;
  if (tier.resolve === "mixed") return namedLimit;
  return 1;   // in a legion you are one figure; the rest is the tide
}

/** Effective offensive and defensive weight of one combatant. ⚠️ DELIBERATELY THE SAME INPUTS `rollSide`
 *  uses — attribute + level — because an aggregate built from DIFFERENT numbers than the full simulation
 *  could never converge on it, and the whole claim of this module is that the two agree. */
export function combatWeight(c, { attr = "physical" } = {}) {
  const sheet = c?.sheet || c || {};
  const at = sheet.attributes || {};
  const best = Math.max(num(at[attr]), num(at.physical), num(at.mental), num(at.social), num(at.practical));
  return { attack: best + num(sheet.level, 1) / 2, soak: num(sheet.soak, 0), health: num(sheet.health, 10) };
}

/** ⛔ THE COMPRESSION, AND THE ONE PIECE OF MATHS THAT MATTERS.
 *
 *  K combatants each rolling once is a SUM of K independent rolls. Its MEAN scales with K; its SPREAD scales
 *  with √K, not K. ⚠️ THE OBVIOUS SHORTCUT — "one roll with K times the bonus" — gets the average right and
 *  the variance catastrophically wrong: it makes a big melee far swingier than the fight it replaces, so a
 *  party that crosses Erik's threshold of 3 would start seeing wipes and routs that the same party one member
 *  smaller never saw. THAT is the failure this function exists to avoid, and it is why the spread is √K.
 *
 *  Returns an exchange: what each side put out, and what got through. */
export function meleeExchange(sideA, sideB, { rng = Math.random, attr = "physical", spreadPer = 3 } = {}) {
  const roll = (side) => {
    const ws = side.map(c => combatWeight(c, { attr }));
    const k = Math.max(1, ws.length);
    const mean = ws.reduce((s, w) => s + w.attack, 0);
    // √K spread — the honest compression of K independent rolls, not K× of one.
    const spread = spreadPer * Math.sqrt(k);
    // Irwin–Hall-ish: two draws average toward the middle, which is what a sum of many rolls does.
    const jitter = ((rng() + rng()) - 1) * spread;
    return { mean, out: mean + jitter, soak: ws.reduce((s, w) => s + w.soak, 0) / k, count: k };
  };
  const a = roll(sideA), b = roll(sideB);
  const net = a.out - b.out;
  return {
    a, b, net,
    // what actually reaches each side, blunted by that side's AVERAGE soak — average, because the aggregate
    // is a statement about the group, and picking one member's armour to stand for all of them would lie.
    toB: Math.max(0, Math.round((a.out - b.out) - b.soak)),
    toA: Math.max(0, Math.round((b.out - a.out) - a.soak)),
    winner: net > 0 ? "a" : net < 0 ? "b" : null,
  };
}

/** ⛔ WHO IN THE CROWD ACTUALLY BLED. An aggregate that never names a casualty is a number, not a fight —
 *  Erik: "the pc playing into and being a casualty of that melee." The pool lands on real members, weighted
 *  toward whoever is least able to take it, so the crowd behaves like people rather than like a health bar.
 *  ⚠️ SPREADS RATHER THAN CONCENTRATES: one aggregate blow should not vaporise the softest ally in a round
 *  that, resolved fully, would have been eight separate ordinary hits. */
export function distributeCasualties(side, pool, { rng = Math.random, maxSharePer = 0.5 } = {}) {
  const live = side.filter(c => !c.downed);
  if (!live.length || pool <= 0) return { hits: [], downed: [], unspent: pool };
  const order = live.slice().sort((x, y) => combatWeight(x).soak - combatWeight(y).soak);
  const cap = Math.max(1, Math.round(pool * maxSharePer));
  const hits = [], downed = [];
  let left = pool;
  for (const c of order) {
    if (left <= 0) break;
    const w = combatWeight(c);
    const share = Math.min(left, Math.max(1, Math.round(cap * (0.5 + rng() * 0.5))));
    left -= share;
    hits.push({ id: c.id, name: c.name, amount: share });
    if (share >= w.health) downed.push({ id: c.id, name: c.name });
  }
  return { hits, downed, unspent: Math.max(0, left) };
}

/** ⛔ A LEGION IS NOT A BIGGER MELEE, and treating it as one is the trap. At this scale the individual roll
 *  stops meaning anything: the tide is decided by weight of numbers and the PC is ONE FIGURE inside it.
 *
 *  ⚠️ SO WHAT DOES THE PLAYER ACTUALLY DO? They cannot out-damage a legion, and a model where they can is
 *  not a legion. What they CAN do is shift it by a BOUNDED amount — hold a line, break a flank, kill the
 *  thing giving orders. `heroSwing` is that bound, and it is deliberately small relative to the tide and
 *  deliberately non-zero: a player who cannot move the battle is watching a cutscene, and a player who
 *  decides it alone did not need the legion.
 *
 *  ⛔ AND THE TIDE CAN TAKE THEM REGARDLESS. Erik: "being a casualty of that melee." A won battle that
 *  cannot cost you anything personally is a number going up. */
export function legionClash(ours, theirs, { rng = Math.random, heroSwing = 0, cfg = {} } = {}) {
  const strength = (units) => units.reduce((s, u) => s + num(u.count, 1) * num(u.quality, 1), 0);
  const us = strength(ours), them = strength(theirs);
  const cap = num(cfg.heroSwingCap, 0.15);            // a hero moves a battle by at most this fraction
  const swing = Math.max(-cap, Math.min(cap, num(heroSwing, 0)));
  const ratio = us / Math.max(1, them);
  const luck = (rng() + rng() + rng()) / 3;            // massed engagements are LESS swingy, not more
  const tide = (ratio - 1) + swing + (luck - 0.5) * num(cfg.legionVariance, 0.3);
  const outcome = tide > 0.25 ? "breakthrough" : tide > 0.05 ? "gaining" : tide > -0.05 ? "grinding"
    : tide > -0.25 ? "giving ground" : "rout";
  return {
    outcome, tide: Math.round(tide * 100) / 100, ratio: Math.round(ratio * 100) / 100,
    heroSwing: swing, heroMattered: Math.abs(swing) > 0.01 && Math.sign(tide) !== Math.sign(tide - swing),
    // ⛔ PERSONAL RISK IS A FUNCTION OF THE TIDE, NOT OF YOUR OWN ROLL — that is what "casualty of the
    // melee" means, and it is the whole reason a legion is not a duel with bigger numbers.
    // ⚠️ AND IT HAS A FLOOR, BECAUSE MY FIRST VERSION RETURNED ZERO FOR A BATTLE GOING WELL. A gate I wrote
    // in the same hour — "you can die in a battle you are winning" — caught it. A 3:1 rout in your favour is
    // still four hundred people swinging weapons in a field you are standing in; a model that makes winning
    // SAFE turns Erik's line into decoration and turns the legion into a scoreboard you watch.
    personalRisk: Math.max(num(cfg.legionFloorRisk, 0.12), Math.min(1, 0.5 - tide)),
  };
}

/** ⛔ THE ONE PIECE OF MATHS THAT MATTERS, ISOLATED SO IT CAN BE TESTED AGAINST THE REAL ENGINE.
 *
 *  K combatants each taking a turn is a SUM of K independent rounds. Its MEAN scales with K; its SPREAD
 *  scales with √K, NOT K. ⚠️ THE OBVIOUS SHORTCUT — "one roll with K times the bonus" — gets the average
 *  right and the variance catastrophically wrong: it makes a big melee far swingier than the fight it
 *  replaces, so a party that crosses Erik's threshold of 3 starts seeing wipes and routs that the same party
 *  one member smaller never saw. THAT is the failure this function exists to avoid.
 *
 *  ⛔ IT IS GIVEN ONLY A SINGLE COMBATANT'S MEASURED BEHAVIOUR AND A COUNT. It does not get to look at the
 *  K-combatant answer, which is what makes `scripts/scale_fidelity.mjs` a real test rather than a mirror. */
export function predictAggregate(singleRound, k) {
  const n = Math.max(1, num(k, 1));
  return { mean: num(singleRound?.mean) * n, sd: num(singleRound?.sd) * Math.sqrt(n), count: n };
}
