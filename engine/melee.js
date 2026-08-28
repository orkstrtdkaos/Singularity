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

/** ⛔ CCODE-272 / ERIK — WHO FILLS THE SLOTS IS A PLAYER CHOICE, AND IT IS SWAPPABLE.
 *
 *  *"Named companions folded into the aggregate still feel like people... it's just that you only have so
 *  much focus... if you want to have them be turn by turned you just swap them out with someone else — so
 *  this needs to be a UI pick."*
 *
 *  ⛔ THAT ANSWERS THE QUESTION NO SIMULATION COULD. I asked whether folding Veth into the aggregate makes
 *  her feel like equipment; the answer is that it does not, BECAUSE THE FOLD IS REVERSIBLE AND CHOSEN. A
 *  companion who is not narrated this round is one you decided not to bring forward, which is a statement
 *  about your attention rather than about her.
 *
 *  ⚠️ SO THE ENGINE OWES A STABLE, HONEST ANSWER TO "who is forward", and the UI owes the picking. This
 *  returns both halves: who acts, and who is present-but-not-narrated — because the second list is the one
 *  a player needs to see to know what they gave up.
 *
 *  `chosen` is the player's pick, in order. ⛔ INVALID PICKS ARE DROPPED, NOT HONOURED: someone who has
 *  withdrawn, gone down, or is not on the roster cannot be brought forward, and silently keeping them would
 *  spend a slot on nobody. */
export function bringForward(allies = [], { chosen = null, slots = 1 } = {}) {
  const live = (allies || []).filter(a => a && a.present !== false && !a.downed);
  const n = Math.max(1, num(slots, 1));
  const byId = new Map(live.map(a => [a.id, a]));
  const out = [];
  // ⚠️ THE PLAYER IS ALWAYS FORWARD AND DOES NOT SPEND A PICK. They are the one whose attention this models.
  const you = live.find(a => a.isPlayer || a.kind === "player");
  if (you) out.push(you);
  for (const id of (chosen || [])) {
    if (out.length >= n) break;
    const a = byId.get(id);
    if (a && !out.includes(a)) out.push(a);
  }
  // ⛔ FILL FROM THOSE WHO CAN ACT, not from the roster order. An unfilled slot handed to someone who cannot
  // swing is a slot wasted on a beat that will say "they do nothing".
  if (out.length < n) {
    for (const a of live) {
      if (out.length >= n) break;
      if (!out.includes(a) && a.canAct !== false) out.push(a);
    }
  }
  const forward = out.slice(0, n);
  const folded = live.filter(a => !forward.includes(a));
  const withdrawn = (allies || []).filter(a => a && a.present === false);
  return {
    forward, folded, withdrawn,
    // ⚠️ NAMED, because "two others are helping" is a number and "Veth and Pell are in it" is a party.
    why: folded.length
      ? `${forward.map(a => a.name).join(", ")} act; ${folded.map(a => a.name).join(", ")} are in the melee`
      : `${forward.map(a => a.name).join(", ")} act`,
  };
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

/** ⛔ CCODE-279 — AND WHAT THE MENDERS ARE FOR. `bandGaps` named `lossesArePermanent` and nothing acted on
 *  it, which would have made one of the three consequences a label — the defect this whole session has been
 *  about, committed inside the fix for it.
 *
 *  ⚠️ A BAND WITH RESTORE GETS PEOPLE BACK BETWEEN CLASHES. Not all of them, and never past the number it
 *  started with: these are the walking wounded returning to the line, not resurrection. A band without
 *  menders keeps exactly what it has left, forever, which is the whole reason to spend four places on them.
 *
 *  ⛔ AND RECOVERY IS CAPPED BY WHO IS DOING THE MENDING. Four menders cannot put a hundred back on their
 *  feet, so the rate scales with the RESTORE contingent rather than with the band — otherwise a token
 *  healer would heal an army and composition would stop mattering again one layer down. */
export function recoverBand(band, { days = 1, cfg = {} } = {}) {
  if (!band || band.condition === "broken") {
    return { band, back: 0, why: band?.condition === "broken" ? "they are broken — nobody is coming back to this" : "nothing to recover" };
  }
  const cs = contingentsOf(band);
  const menders = cs.filter(c => c.does.includes("RESTORE")).reduce((a, c) => a + c.n, 0);
  if (!menders) return { band, back: 0, why: "nobody mends them — what this cost, it cost for good" };
  const lost = Math.max(0, num(band.losses, 0));
  if (!lost) return { band, back: 0, why: "nobody to bring back" };
  const per = Math.max(0, num(cfg.recoveredPerMenderPerDay, 0.5));
  const back = Math.min(lost, Math.floor(menders * per * Math.max(0, num(days, 1))));
  if (back <= 0) return { band, back: 0, why: "too few hands, too little time" };
  // ⚠️ THEY COME BACK TO THE CONTINGENTS THEY LEFT, proportionally — a band does not recover as an
  // undifferentiated pool, and putting them all back in the spears would quietly reshape it every campaign.
  const total = Math.max(1, cs.reduce((a, x) => a + x.n, 0));
  const healed = cs.map(c => ({ ...c, n: c.n + Math.round(back * (c.n / total)) }));
  const head = healed.reduce((a, c) => a + c.n, 0);
  const hurt = head ? (lost - back) / (head + (lost - back)) : 0;
  return {
    band: { ...band, losses: lost - back, count: head, condition:
        hurt > num(cfg.wornAt, 0.25) ? "worn" : (lost - back) > 0 ? "blooded" : "fresh",
      ...(band.contingents ? { contingents: healed } : {}) },
    back, why: `${back} come back to the line — ${menders} mending`,
  };
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
  // ⛔ CCODE-278 — `ratio - 1` WAS ASYMMETRIC AND IT MADE EVERY OUTNUMBERED BAND ROUT INSTANTLY. It is
  // bounded below at −1 and unbounded above, so DEFEAT SATURATED TWICE AS FAST AS VICTORY: outnumbered 2:1
  // gave −0.50, outnumbering 2:1 gave +1.00. A band at 2:3 odds — not even a scale gap, just worse numbers —
  // read as −0.33 and routed on contact.
  // ⚠️ FOUND BY PLAYING IT, not by reading it: forty of the Stillwater Watch met sixty and broke in four
  // clashes without ever having a bad round.
  // ⛔ `(us − them) / (us + them)` IS SYMMETRIC AND BOUNDED [−1, 1]. 40 v 60 now reads "giving ground";
  // 20 v 60 still routs. The outcome bands did not need touching — they were never the problem.
  const edge = (us - them) / Math.max(1, us + them);
  const tide = edge + swing + (luck - 0.5) * num(cfg.legionVariance, 0.3);
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

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════
// CCODE-275 / ERIK — AN ENCOUNTER CONTAINS SCALES; IT IS NOT AT ONE.
//
// ⛔ "every encounter could have 1, some or all of the types of battle... even if you're in the middle of
// your army you might have to duel an assassin... so 1 v army isn't a contest, but the encounter scenario
// would drive the details. my party vs guards on a castle wall might be a fair fight... but if they open
// the gates to let a unit of cavalry charge it turns lopsided fast, unless I use some majorly big powers or
// prepared ground traps."
//
// ⚠️ THAT CORRECTS `resolutionTier`, WHICH PICKS ONE TIER FROM A HEADCOUNT. A headcount cannot know that the
// assassin reaching you is a DUEL happening inside a LEGION battle — and the duel is the part you play.
// THE SCENARIO DECIDES, and the scenario is authored.
//
// ⛔ AND THE SECOND HALF IS THE MORE IMPORTANT ONE: 1 v army IS NOT A CONTEST. Not a hard roll — not a roll.
// The answer to being overmatched is not better dice, it is CHANGING THE SITUATION: a big enough power, or
// ground you prepared. That is the same shape as `trivializes` (SNG-230 §7c, "the right kit VOIDS a
// challenge's premise") pointed the other way — there, kit makes a hard thing easy; here, preparation makes
// an impossible thing contestable.
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════

/** The scales, smallest first. ⚠️ THESE ARE THE SAME RUNGS AS `MELEE_TIERS` and must stay so — two ladders
 *  for one idea is how a system grows two names for one thing. */
export const SCALES = ["individual", "party", "unit", "legion"];
export function scaleRank(s) { const i = SCALES.indexOf(String(s)); return i < 0 ? 0 : i; }

/** ⛔ WHAT SCALES ARE IN PLAY. Authored on the encounter — `theatres: [{ scale, who, opensOn }]` — because
 *  Erik's whole point is that the SCENARIO drives it. Falls back to a single theatre derived from the
 *  headcount, so every existing encounter behaves exactly as it does today.
 *  ⚠️ `opensOn` IS THE CAVALRY. A theatre that opens partway through is how "they open the gates" becomes a
 *  mechanic rather than narration — the fight was fair, and then it was not. */
export function theatresOf(def, { round = 1, allyCount = 1, foeCount = 1 } = {}) {
  const authored = def?.theatres;
  if (!Array.isArray(authored) || !authored.length) {
    return [{ scale: resolutionTier(allyCount, foeCount).id === "legion" ? "legion"
      : resolutionTier(allyCount, foeCount).id === "melee" ? "party" : "individual",
      who: def?.opponent?.name || "them", derived: true, open: true }];
  }
  return authored.map(t => ({
    scale: String(t.scale || "individual"), who: t.who || def?.opponent?.name || "them",
    opensOn: num(t.opensOn, 1),
    open: num(round, 1) >= num(t.opensOn, 1),
    why: t.why || null,
  }));
}

/** ⛔ IS THIS A CONTEST AT ALL? Erik: "1 v army isn't a contest."
 *
 *  ⚠️ A GAP OF ONE IS A HARD FIGHT AND STAYS A ROLL — a party against a unit is lopsided, not hopeless, and
 *  making it unwinnable would delete the fights people actually want to have. TWO OR MORE is the wall.
 *
 *  ⛔ AND THIS RETURNS A SITUATION, NOT A MODIFIER. The whole ruling is that you do not out-roll an army;
 *  handing back "-40 to your chance" would be the same mistake in a politer form. */
export function overmatchOf(yours, theirs, { cfg = {} } = {}) {
  const gap = scaleRank(theirs) - scaleRank(yours);
  const wallAt = Math.max(1, num(cfg.overmatchGap, 2));
  if (gap < 1) return { overmatched: false, gap, why: "an even meeting, or you have the weight" };
  if (gap < wallAt) return { overmatched: false, gap, hard: true,
    why: `they outweigh you — this is a hard fight, not an impossible one` };
  return { overmatched: true, gap,
    why: `${theirs} against ${yours} is not a contest — no roll wins this`,
    // ⚠️ NAMED HERE so the refusal arrives WITH its answers. A wall with no door on it is a cutscene.
    answers: ["a power big enough to change the ground", "ground you prepared before they came", "not being there"] };
}

/** ⛔ WHAT MAKES AN OVERMATCH CONTESTABLE AGAIN — Erik's two, and only his two.
 *
 *  ⚠️ MIRRORS `trivializes` DELIBERATELY: it reads what the character HAS against what the situation ASKS,
 *  and answers with a state rather than a number. A third route invented here would be me adding a way to
 *  beat an army that Erik did not name.
 *
 *  `powers` — craft ids or magnitudes big enough to answer a scale. `ground` — prepared-ground keys
 *  (traps, a chokepoint, a fortification) laid BEFORE this. */
export function answersOvermatch(overmatch, { powers = [], ground = [], cfg = {} } = {}) {
  if (!overmatch?.overmatched) return { answered: true, by: null, why: "there is nothing to answer" };
  const need = Math.max(1, num(overmatch.gap, 2));
  const bigEnough = (powers || []).filter(p => num(p?.scaleAnswer, num(p?.magnitude, 0)) >= need);
  const prepared = (ground || []).filter(Boolean);
  if (bigEnough.length) {
    return { answered: true, by: "power", using: bigEnough.map(p => p.id || p.name || "a working"),
      why: `${bigEnough[0].name || bigEnough[0].id} is big enough to change what this is` };
  }
  if (prepared.length) {
    return { answered: true, by: "ground", using: prepared.map(g => g.id || g.name || String(g)),
      why: `the ground was prepared — ${prepared.map(g => g.name || g.id || g).join(", ")}` };
  }
  return { answered: false,
    why: `nothing you are holding answers ${overmatch.gap} scales of difference`,
    // ⛔ AND THE HONEST THIRD OPTION IS ALWAYS THERE. Erik's list, verbatim, ends with not being there.
    remaining: "leave, or be swept up in it" };
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════
// CCODE-278 / ERIK — A BAND: THE THING THAT MAKES THE UNIT RUNG REAL.
//
// ⛔ "around when you're hitting the named npc party member cap you're likely to have enough of a following
// to have a band or unit that would operate in the simplified sense... that allows for you to go into
// larger battles and operate against other units... nearing end game you'll have multiple units and legions
// and armies."
//
// ⚠️ IT LIVES HERE AND NOT IN `holdings.js`, AND I CHECKED BEFORE DECIDING. A holding is a PLACE — it has a
// `locationId`, a steward, an obligation, and a condition that drifts between thriving and failing. A band
// MOVES and its failure mode is casualties. Forcing them into one record would have made `locationId`
// meaningless on half the rows, which is the opposite of the reason holdings has one record for two kinds.
//
// ⛔ AND IT LIVES IN THIS FILE RATHER THAN A NEW ONE BECAUSE `legionClash` IS ITS ONLY CONSUMER. Two modules
// that only talk to each other are one module with a seam in it — and I built a duplicate death ladder this
// week by reaching for a new file before looking.
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════

/** ⚠️ CONDITION MOVES BOTH WAYS, like a holding's — a band that has been through something is not simply
 *  smaller, it is DIFFERENT, and a one-way counter would make every campaign a slow bleed. */
export const BAND_CONDITIONS = ["fresh", "blooded", "worn", "broken"];

/** ⛔ CAN YOU EVEN RAISE ONE? The same three sources as `commandSlots`, deliberately — Erik tied the band to
 *  the same arc as the named-companion cap, and a second ladder would let a character command a unit while
 *  being unable to lead three people.
 *  ⚠️ AND A HOLDING COUNTS. "you'll own or build more holds" — a post is where a following comes from. */
export function canRaiseBand(character, { cfg = {}, renownBand = null } = {}) {
  const lead = commandSlots(character, { cfg, renownBand });
  const holds = (character?.holdings || []).filter(h => h && h.condition !== "failed").length;
  const need = Math.max(1, num(cfg.bandAtSlots, 3));
  const ready = lead.slots >= need || holds >= Math.max(1, num(cfg.bandAtHoldings, 2));
  return { ready, slots: lead.slots, holdings: holds,
    why: ready
      ? (lead.slots >= need ? "you lead enough people that others follow them" : "your holdings can raise a following")
      : `you lead ${lead.slots} and hold ${holds} — not yet a following` };
}

/** Raise one. ⚠️ A BAND IS `{count, quality}` PLUS PROVENANCE, because that is exactly what `legionClash`
 *  consumes — the record and the resolver were designed against each other rather than bolted together. */
export function raiseBand(character, { id, name = null, count = 20, quality = 1, from = null, day = 0 } = {}) {
  if (!id) return { ok: false, why: "a band needs a name to be called by" };
  const list = character.bands || (character.bands = []);
  if (list.some(b => b.id === id)) return { ok: false, why: `${name || id} is already yours` };
  const band = { id, name: name || id, count: Math.max(1, num(count, 20)),
    quality: Math.max(1, num(quality, 1)), from, condition: "fresh", raisedDay: num(day, 0), losses: 0 };
  list.push(band);
  return { ok: true, band };
}

/** ⛔ CCODE-279 / ERIK — A BAND IS NOT A NUMBER. "Band's should have something that measures their
 *  capability better than raw numbers... what threat level do they add up to - are they mixed units so they
 *  can attack ranged and ward and heal, or are they all cavalry? How can we structure this to give it some
 *  logical complexity while maintaining simplicity?"
 *
 *  ⚠️ THE ANSWER IS THAT BOTH VOCABULARIES ALREADY EXIST AND I DID NOT HAVE TO INVENT EITHER.
 *    · WHAT THEY CAN DO → `contributionsOf`'s families (HARM · MARTIAL · PROTECT · RESTORE · KNOW · …), the
 *      same words a companion is described with. A band and a companion answer the same question.
 *    · WHAT THEY ADD UP TO → `threatBand`, the game's existing RELATIVE ladder. "What threat level" is
 *      already a question this game answers; answering it a second way here would be two ladders.
 *
 *  ⛔ SO THE COMPLEXITY IS ONE FIELD: `contingents`. A band is groups of people who each do something.
 *  Simple to author, and it produces the three consequences below with no further machinery.
 *
 *  ⚠️ A FLAT `{count, quality}` BAND STILL WORKS — it reads as a single martial contingent, so nothing
 *  authored before this changes. */
export function contingentsOf(band) {
  const list = band?.contingents;
  if (Array.isArray(list) && list.length) {
    return list.map(c => ({ n: Math.max(0, num(c?.n, 0)), quality: Math.max(0, num(c?.quality, 1)),
      does: (c?.does || ["MARTIAL"]).map(String), what: c?.what || null }));
  }
  return [{ n: Math.max(0, num(band?.count, 0)), quality: Math.max(0, num(band?.quality, 1)),
    does: ["HARM", "MARTIAL"], what: band?.name || null }];
}

/** ⛔ WHAT A BAND CAN DO — the union of its contingents. A band of all cavalry answers exactly one
 *  question, and that is a REAL WEAKNESS rather than a flavour note: see `bandGaps`. */
export function bandCan(band) {
  const out = new Set();
  for (const c of contingentsOf(band)) if (c.n > 0) for (const d of c.does) out.add(d);
  return [...out];
}

/** ⚠️ WHAT THEY ARE WORTH. Count × quality across the contingents, times the condition multiplier — a
 *  worn band is the same people, slower and warier, so condition multiplies rather than subtracting. */
export function bandStrength(band, { cfg = {} } = {}) {
  const mult = { fresh: 1, blooded: num(cfg.bloodedMult, 0.9), worn: num(cfg.wornMult, 0.7), broken: num(cfg.brokenMult, 0.3) };
  const m = num(mult[String(band?.condition || "fresh")], 1);
  const cs = contingentsOf(band);
  const count = cs.reduce((a, c) => a + c.n, 0);
  const raw = cs.reduce((a, c) => a + c.n * c.quality, 0);
  return { count, quality: count ? (raw / count) * m : 0, effective: Math.round(raw * m),
    can: bandCan(band), contingents: cs.length };
}

/** ⛔ WHAT THEY ADD UP TO, IN THE GAME'S OWN UNITS. `threatBand` is relative by construction — the same
 *  company is a real fight at level 5 and beneath notice at level 20 — so a band's threat is read AGAINST
 *  someone. ⚠️ THAT IS THE POINT: "what threat level do they add up to" has no absolute answer, and
 *  inventing one here would be a second ladder disagreeing with the first.
 *
 *  ⚠️ SQUARE ROOT, for the same reason the melee compression uses one: doubling a body of people does not
 *  double what it can do to ONE CHARACTER — it doubles what it can do to another body of people. A linear
 *  read would make a hundred militia strictly more dangerous to a hero than any single foe. */
export function bandThreat(band, { cfg = {} } = {}) {
  const st = bandStrength(band, { cfg });
  return { power: Math.round(Math.sqrt(Math.max(0, st.effective)) * num(cfg.bandThreatScale, 6)),
    effective: st.effective, can: st.can };
}

/** ⛔ WHAT THEY CANNOT DO, AND WHAT IT COSTS — the consequence that earns the extra field. Erik: "are they
 *  mixed units so they can attack ranged and ward and heal, or are they all cavalry?"
 *
 *  ⚠️ THREE GAPS, EACH WITH ONE CONSEQUENCE, AND NO MORE THAN THAT. A wargame's worth of unit types would
 *  buy detail nobody reads; three answerable questions buy a decision about who to recruit.
 *    · no RESTORE → losses do not come back between clashes. You bleed permanently.
 *    · no PROTECT → the same tide takes more of them.
 *    · no KNOW    → nobody reads the ground, so they meet what comes as it comes. */
export function bandGaps(band, { cfg = {} } = {}) {
  const can = new Set(bandCan(band));
  const gaps = [];
  if (!can.has("RESTORE")) gaps.push({ missing: "RESTORE", effect: "lossesArePermanent",
    why: "nobody mends them — what this costs, it costs for good" });
  if (!can.has("PROTECT")) gaps.push({ missing: "PROTECT", effect: "lossMultiplier",
    value: num(cfg.unwardedLossMult, 1.4), why: "nothing shields them — the same tide takes more of them" });
  if (!can.has("KNOW")) gaps.push({ missing: "KNOW", effect: "blindToTheField",
    why: "nobody is reading the ground — they meet what comes as it comes" });
  return gaps;
}

/** ⚠️ WHAT A CLASH COSTS THEM. Erik's tide decides the battle; this decides what it did to the people who
 *  fought it. ⛔ AND A BAND CAN BREAK WITHOUT BEING DESTROYED — that is the difference between a unit and a
 *  health bar, and it is the state a commander actually has to manage. */
export function bloodBand(band, tide, { cfg = {} } = {}) {
  if (!band) return { band, lost: 0 };
  const t = num(tide, 0);
  // ⛔ CCODE-279 — READ THE COUNT FROM THE CONTINGENTS, NOT FROM A TOP-LEVEL FIELD A COMPOSED BAND DOES NOT
  // HAVE. My first version kept `num(band.count, 0)` here, so a band described by contingents had a count of
  // ZERO: it lost nobody and was BROKEN on contact, every time. New representation, consumer still reading
  // the old field — the same defect as every other one this week, and it would have read as "bands are
  // fragile" rather than as a bug.
  const head = contingentsOf(band).reduce((a, c) => a + c.n, 0);
  // ⛔ CCODE-279 — AN UNWARDED BAND LOSES MORE FOR THE SAME TIDE. This is the consequence that makes
  // composition a decision rather than a description: a band of pure cavalry hits hard and bleeds hard.
  const gaps = bandGaps(band, { cfg });
  const unwarded = gaps.find(g => g.effect === "lossMultiplier");
  const rate = Math.max(0, num(cfg.lossPerTide, 0.12)) * (unwarded ? num(unwarded.value, 1.4) : 1);
  // losing costs more than winning, and a rout costs most
  const share = t >= 0 ? rate * (1 - Math.min(0.8, t)) : rate * (1 + Math.min(2, -t) * 1.5);
  const lost = Math.min(head, Math.round(head * share));
  const left = Math.max(0, head - lost);
  // ⚠️ `hurt` IS CUMULATIVE — losses so far against everyone who has ever stood in this band. A band that
  // has bled twice is closer to breaking than one taking its first losses, which is what makes a campaign
  // different from a series of unrelated fights.
  const hurt = head ? (num(band.losses, 0) + lost) / (head + num(band.losses, 0)) : 0;
  const condition = left === 0 ? "broken"
    : hurt > num(cfg.brokenAt, 0.5) ? "broken"
    : hurt > num(cfg.wornAt, 0.25) ? "worn"
    : lost > 0 || band.condition !== "fresh" ? "blooded" : "fresh";
  // ⚠️ AND THE LOSSES COME OFF THE CONTINGENTS, proportionally — a band that loses forty people has lost
  // forty SOMEBODIES, and taking them off a top-level count would let a band keep its menders forever while
  // its spears evaporated.
  const cs = contingentsOf(band);
  const total = Math.max(1, cs.reduce((a, x) => a + x.n, 0));
  const bled = cs.map(c => ({ ...c, n: Math.max(0, c.n - Math.round(lost * (c.n / total))) }));
  return { band: { ...band, count: left, losses: num(band.losses, 0) + lost, condition,
      ...(band.contingents ? { contingents: bled } : {}) },
    lost, condition, gaps, broke: condition === "broken" && band.condition !== "broken",
    why: lost === 0 ? `${band.name} comes through it whole`
      : condition === "broken" ? `${band.name} breaks — ${lost} lost and the rest will not hold`
      : `${band.name} loses ${lost}` };
}

