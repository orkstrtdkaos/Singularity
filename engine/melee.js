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
/** ⛔ SNG-588 (Erik, in play) — "clicking 'bring forward' on vessin doesn't appear to do anything" and
 *  "I didn't see any actions from the folded party." ⚑ THOSE ARE ONE DEFECT, AND IT IS THE FIFTH TWO-READERS
 *  BUG THIS WEEK: the panel computed the forward/folded split ONE way and the engine that resolves the round
 *  computed it ANOTHER.
 *
 *  ⚠️ MEASURED ON HIS SAVE. Loki is level 7 with presence 4, so `commandSlots` gives him ONE slot — himself.
 *  The panel called `bringForward(all, { slots: 1 })`, which puts the player in the only slot and can never
 *  admit anyone else, so every pip was inert and Vessin and Cy both drew as folded. ⛑ MEANWHILE THE ENGINE
 *  ASKED A DIFFERENT QUESTION: two allies present is a `skirmish`, `actingSlots` returns Infinity, and
 *  EVERYONE WAS ALREADY FORWARD — which is Erik's own ruling of 2026-09-12, "3 or fewer combatants in your
 *  party means everyone acts and no one is folded."
 *
 *  ⛔ SO THE PANEL WAS CONTRADICTING HIS RULING ON SCREEN, and the missing fold contributions were not
 *  missing at all: nobody was folded, so there was nothing to contribute. Both halves of what he saw follow
 *  from the two readers, and neither is visible if you only read one of them.
 *
 *  ⛑ THIS IS THE ONE COMPUTATION. `encounters.js` resolves the round from it and the panel draws from it, so
 *  the picture and the fight can no longer disagree. Pure; `lead` and the present count are injected. */
export function lineSplit(allies = [], { chosen = null, lead = null, presentCount = null } = {}) {
  const all = allies || [];
  const named = Math.max(1, num(lead?.slots, 1));
  const present = Number.isFinite(Number(presentCount))
    ? Number(presentCount)
    : all.filter(a => a && a.present !== false && !a.isPlayer && a.kind !== "player").length;
  const t = actingSlots(resolutionTier(present, 1), { namedLimit: named });
  const slots = t === Infinity ? Infinity : Math.min(named, t);
  const split = bringForward(all, { chosen, slots });
  // ⚑ AND THE PANEL NEEDS TO SAY *WHY* THE PIPS CANNOT MOVE, which is a different fact from who is forward:
  // at a full-resolve tier everyone acts and the pick is moot; below it, the pick is real but bounded by the
  // slots you lead. ⚠️ `lead.why` has said "yourself, and nobody else yet" since CCODE-276 and nothing
  // rendered it — an authored explanation with no reader, next to a control nobody could work.
  return { ...split, slots, everyoneActs: t === Infinity, namedLimit: named,
    why: t === Infinity
      ? "everyone acts — a party this size leaves nobody folded"
      : (lead?.why || `you lead ${slots}`) };
}

export function bringForward(allies = [], { chosen = null, slots = 1 } = {}) {
  const live = (allies || []).filter(a => a && a.present !== false && !a.downed);
  // §177: a full-resolve tier passes Infinity — everyone comes forward. num() reads a non-finite as absent and would have made it ONE,
  // folding everyone but one in exactly the fights where everyone acts; the §177 check caught it before it played.
  const n = slots === Infinity ? Infinity : Math.max(1, num(slots, 1));
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
export function distributeCasualties(side, pool, { rng = Math.random, maxSharePer = 0.5, order = null } = {}) {
  const live = side.filter(c => !c.downed);
  if (!live.length || pool <= 0) return { hits: [], downed: [], unspent: pool };
  // ⛔ CCODE-318 — WHO THE POOL REACHES, AND IT IS NO LONGER ALWAYS THE SOFTEST. Softest-first is a
  // sensible melee rule and it was the ONLY rule, so the aggregate played EVERY foe as if it were hunting
  // your healer. Measured in CCODE-308: against a brute that fights whoever fights it, the shortcut still
  // killed the mender 92% of the time while the fight it replaces killed her 0%.
  //
  // ⚠️ THE HOOK, NOT THE POLICY. `melee.js` stays a leaf module and knows nothing about targeting; the
  // caller supplies the ordering it is already using for the blow. ⚠️ ABSENT IS TODAY — with no `order`
  // the soak sort runs exactly as it always has.
  const ordered = typeof order === "function" ? (order(live) || live) : null;
  const queue = ordered && ordered.length ? ordered : live.slice().sort((x, y) => combatWeight(x).soak - combatWeight(y).soak);
  const cap = Math.max(1, Math.round(pool * maxSharePer));
  const hits = [], downed = [];
  let left = pool;
  for (const c of queue) {
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
export function legionClash(ours, theirs, { rng = Math.random, heroSwing = 0, heroTier = null, cfg = {} } = {}) {
  // ⛔ `count` OR `n` — AND THE ENGINE ONLY EVER SENT `n`. This read `u.count` alone, while
  // `contingentsFromPeople` returns `{n: 40, …}`, `bandStrength` returns `{n, …}` and the hold raid builds
  // `{n, quality}` raiders — so every contingent from a real band defaulted to a count of ONE.
  // ⚠️ MEASURED: forty against sixty and ONE against sixty both read tide 0.00. Identical.
  // ⚑ The tests never caught it because every one of them writes the contingents by hand and spells the
  // field `count`; every caller in the game spells it `n`. The model was validated on a path nothing takes.
  // ⛑ Accepting both repairs all three production callers at once and cannot break a caller that says `count`.
  const strength = (units) => units.reduce((s, u) => s + num(u.count ?? u.n, 1) * num(u.quality, 1), 0);
  const us = strength(ours), them = strength(theirs);
  // ⛔ CCODE-321 / ERIK 2026-08-30 — A MYTHICAL IS BOTH, AND THE RULING IS THAT BOTH IS THE ANSWER:
  // "a Mythical, like the other tiers, is both a DIFFERENT KIND OF THING (status that reflects how much
  // influence and impact they can make) as well as a very high level, fully skilled and powered
  // individual… units and bands and parties that draw the personal attention of a Mythical are at GREAT
  // RISK… they are not the same as a Hero tier."
  //
  // ⚠️ AND THE LADDER ALREADY EXISTS. `arc_response.attentionByTier` is literally a table of how much
  // ATTENTION each rung commands — mythic 3 · legendary 2 · epic 1 · heroic 0.5 · riffraff 0.25 — which is
  // Erik's "how much influence and impact they can make", already written down and already canon since
  // SNG-280. ⛔ SO THIS INVENTS NO VOCABULARY: the cap is the epic baseline scaled by the rung's own
  // weight. A Mythical bends a battle SIX TIMES what a Heroic does, which is the distinction he drew.
  //
  // ⚠️ ABSENT IS TODAY. No tier means weight 1, which is exactly the 0.15 that shipped — every existing
  // caller and every existing gate is untouched.
  const base = num(cfg.heroSwingCap, 0.15);
  // ⛔ CCODE-325 — THE CAPABILITY LADDER, NOT THE ATTENTION ONE. Erik: notable/regional/heroic “are
  // INCREASING CAPABILITIES” and they sat at an identical 0.5 in `attentionByTier`, which is read by
  // `worldtick` as an ARC BUDGET and is correct there. ⚠️ Two facts, two tables; `attentionByTier` remains
  // the fallback so a caller that has not adopted the split behaves exactly as it did.
  const ladder = cfg.capabilityByTier || cfg.attentionByTier || {};
  const weight = heroTier ? num(ladder[String(heroTier)], 1) : 1;
  // ⚠️ ROUNDED — 0.15 × 3 is 0.44999999999999996 in binary floating point, and a receipt that says that
  // about a Mythical reads as a bug rather than a ruling.
  const cap = Math.max(0, Math.round(base * weight * 1000) / 1000);
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
  // ⛔ THE GUARD USED TO READ `!== "failed"`, WHICH IS NOT IN THIS VOCABULARY. Holdings run on
  // `CONDITIONS = ["failing", "strained", "holding", "thriving"]`; "failed" is the QUEST vocabulary,
  // borrowed across. ⚠️ SO THE FILTER MATCHED NOTHING AND A COLLAPSING POST COUNTED AS FULLY AS A THRIVING
  // one — a string that looks like a guard and excludes nothing, which is how a vacuous check hides.
  // ⚠️ Inert today (no save holds anything yet) and wrong the moment one does.
  const holds = (character?.holdings || []).filter(h => h && h.condition !== "failing").length;
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
    // ⛔ `npcId` RIDES THROUGH. It is the difference between "one of quality 2 who shapes" and "Pell Ran Marsh", and the
    // normaliser used to drop it — so a band composed of real people read back as anonymous bodies to every consumer, the
    // Fellowship roster included. ⚠️ The combat maths does not read it and does not have to; identity is not a modifier.
    // ⛔ CCODE-404 — AND `from` RIDES THROUGH FOR THE SAME REASON `npcId` DOES, which my own first test of the muster caught: the
    // bound on raising hands at a place is that place's authored capacity, so the heads must remember where they were raised or the
    // bound can never be checked again. Dropping it here read every mustered head back as having come from nowhere.
    // ⛔ CCODE-409 — AND `kind`, `wards` AND `crafts` RIDE THROUGH, carried here BEFORE anything reads them rather than after a reader
    // found them missing: this normaliser dropped `npcId` once and `from` this morning, and each time every consumer read the unit
    // as if the field did not exist.
    return list.map(c => ({ n: Math.max(0, num(c?.n, 0)), quality: Math.max(0, num(c?.quality, 1)),
      does: (c?.does || ["MARTIAL"]).map(String), what: c?.what || null, npcId: c?.npcId || null, from: c?.from || null,
      kind: c?.kind ? String(c.kind) : null, wards: Array.isArray(c?.wards) ? c.wards.map(String) : [],
      crafts: Array.isArray(c?.crafts) ? c.crafts.map(String) : [] }));
  }
  return [{ n: Math.max(0, num(band?.count, 0)), quality: Math.max(0, num(band?.quality, 1)),
    does: ["HARM", "MARTIAL"], what: band?.name || null }];
}

/** ⛔ WHAT A BAND CAN DO — the union of its contingents. A band of all cavalry answers exactly one
 *  question, and that is a REAL WEAKNESS rather than a flavour note: see `bandGaps`. */
/** ⛔ SPEC_npc_sheet_architecture §4 — A UNIT IS COMPOSED OF ITS PEOPLE. Erik: "how many NPCs with skills
 *  does a unit have, what skills with wards and types, how many simple soldiers."
 *
 *  ⚠️ THE DOWNWARD HALF WAS ALREADY BUILT. `bandThreat` collapses a band to one number and is already
 *  sub-linear — `sqrt(effective) × scale` — so a hundred peasants never out-threaten an epic. ⛔ WHAT WAS
 *  MISSING IS THE WAY UP: a contingent was an anonymous count with declared families, and nothing could
 *  build one from people who actually exist.
 *
 *  ✅ SO THIS IS THE UPWARD DIRECTION, AND IT NEEDS NO NEW AGGREGATION. Each named person becomes a
 *  contingent of one carrying their REAL contribution families; everyone else folds into one anonymous
 *  block. `bandCan`, `bandStrength`, `bandGaps` and `bandThreat` then work unchanged — which is the
 *  reconciliation: the two sheet systems are the two directions of one ladder.
 *
 *  ⚠️ RESOLVERS ARE INJECTED because this file has no imports and should not gain any — `contributionsOf`
 *  lives in combatants.js and `sheetFor` in npcsheet.js, and a band does not need to know either module.
 *
 *  ⛔ QUALITY IS `1 + floor(level/10)`, DELIBERATELY FLAT. A level-27 smith is worth three soldiers, not
 *  twenty-seven: `bandStrength` multiplies quality by count, so anything steeper would let one named
 *  person out-weigh a company and make the unit layer a way to smuggle a hero into a headcount. */
export function contingentsFromPeople(people = [], { contributionsOf = null, levelOf = null } = {}) {
  const named = [], plain = [];
  for (const p of people) {
    if (!p) continue;
    const does = (contributionsOf ? contributionsOf(p) : (p.contributions || [])).filter(Boolean);
    // ⚠️ HARM ALONE IS THE DEFAULT EVERY RECORD CARRIES — it says nothing about them. Someone whose only
    // family is the default is a soldier, however named, and belongs in the anonymous block.
    const distinctive = does.filter(d => d !== "HARM");
    if (distinctive.length) named.push({ p, does });
    else plain.push(p);
  }
  const out = named.map(({ p, does }) => {
    const lvl = Math.max(1, Number(levelOf ? levelOf(p) : p.level) || 1);
    // ⚠️ AND THE OTHER DIRECTION STAMPS IT, so people → contingents → people is lossless rather than one-way.
    return { n: 1, quality: 1 + Math.floor(lvl / 10), does, what: p.name || p.id || "one of yours", npcId: p.id || null };
  });
  // ⛔ AND THE SIMPLE SOLDIERS ARE COUNTED, NOT DROPPED. Erik asked for the number explicitly, and a unit
  // that reports only its notables is a unit whose losses land on nobody.
  if (plain.length) out.push({ n: plain.length, quality: 1, does: ["HARM", "MARTIAL"], what: "rank and file" });
  return out;
}

/** ⚠️ WHAT A UNIT IS MADE OF, in the words Erik asked the question in. Reads the contingents rather than
 *  the people, so it describes a hand-authored band and a composed one identically. */
export function unitComposition(band) {
  const cs = contingentsOf(band);
  const skilled = cs.filter(c => c.n > 0 && c.does.some(d => d !== "HARM" && d !== "MARTIAL"));
  const bodies = cs.reduce((a, c) => a + c.n, 0);
  const families = {};
  for (const c of cs) if (c.n > 0) for (const d of c.does) families[d] = (families[d] || 0) + c.n;
  // ⛔ CCODE-409 — "the legion will have a combination of the things a band is built from. Wards skills etc." Kinds, wards and crafts
  // are unioned exactly as families are, and a LEGION reads its parts' through `resolvedUnit` like everything else — so a legion of a
  // shieldwall band and an archer band reports both kinds and every ward either brings, without a line of legion-specific code.
  const kinds = {};
  for (const c of cs) if (c.n > 0 && c.kind) kinds[c.kind] = (kinds[c.kind] || 0) + c.n;
  return {
    bodies,
    withSkills: skilled.reduce((a, c) => a + c.n, 0),
    simpleSoldiers: bodies - skilled.reduce((a, c) => a + c.n, 0),
    families,
    named: cs.filter(c => c.n === 1 && c.what).map(c => c.what),
    kinds,
    wards: [...new Set(cs.filter(c => c.n > 0).flatMap(c => c.wards || []))],
    crafts: [...new Set(cs.filter(c => c.n > 0).flatMap(c => c.crafts || []))],
  };
}

export function bandCan(band) {
  const out = new Set();
  for (const c of contingentsOf(band)) if (c.n > 0) for (const d of c.does) out.add(d);
  return [...out];
}

/** ⛔ CCODE-404 (Erik: "Recruiting into the band next please. I want to have a source of workers and guards as well as a way to raise
 *  geneal troops… on the way to having a legion.") — PUTTING SOMEBODY IN A UNIT.
 *
 *  ⚑ MEASURED FIRST, and almost all of it was already here: `raiseBand`, `contingentsOf`, `unitComposition`, `bandStrength`,
 *  `bandThreat`, `bandGaps`, `legionClash` and `bloodBand` are written and calibrated. What did not exist was any way for a PLAYER to
 *  put a person or a body of hands into one — `raiseBand` had exactly one caller, a GM op, and `contingentsOf`, `unitComposition` and
 *  `bandGaps` had NO caller outside the tests. Silas has commanded a band of six since day 16, with one gap costing him 1.4× losses,
 *  and no screen has ever said either thing.
 *
 *  ⚠️ IT WRITES CONTINGENTS, NEVER `count`. A flat `{count, quality}` band reads as one martial contingent by `contingentsOf`'s own
 *  fallback, so the first recruit into a flat band must MAKE that implicit contingent real before adding beside it — otherwise the
 *  people already in it vanish the moment somebody joins. ⛔ That is the whole reason this lives here rather than in the caller.
 *
 *  ⚠️ AND A PERSON IS ONE PERSON. `n` is forced to 1 for a named recruit, and the same `npcId` cannot stand in one unit twice;
 *  whether they stand in ANOTHER unit is the caller's question, because only the caller can see the other units. Pure. */
export function addContingent(band, spec = {}) {
  if (!band || typeof band !== "object") return { ok: false, why: "no such unit" };
  const npcId = spec.npcId ? String(spec.npcId) : null;
  const n = npcId ? 1 : Math.max(0, Math.round(num(spec.n, 0)));
  if (!n) return { ok: false, why: "nobody to add" };
  const quality = Math.max(1, Math.round(num(spec.quality, 1)));
  const wards = [...new Set((Array.isArray(spec.wards) ? spec.wards : []).map(String).filter(Boolean))];
  const crafts = [...new Set((Array.isArray(spec.crafts) ? spec.crafts : []).map(String).filter(Boolean))];
  // ⛔ CCODE-409 — A WARD IS PROTECTION, so a contingent that brings one PROTECTS: that is the whole mechanical meaning a ward has at
  // this scale, and it is what lifts `bandGaps`' unwarded 1.4× off a formation. ⚠️ Written into `does` explicitly rather than inferred
  // by every reader, so the stored contingent says what it does and no reader has to remember to look at `wards` as well.
  const does = [...new Set([...(Array.isArray(spec.does) ? spec.does : ["HARM", "MARTIAL"]).map(String), ...(wards.length ? ["PROTECT"] : [])].filter(Boolean))];
  if (!does.length) return { ok: false, why: "nothing they do" };
  // ⛔ THE IMPLICIT CONTINGENT IS MADE REAL FIRST — see the note above.
  if (!Array.isArray(band.contingents) || !band.contingents.length) {
    const had = Math.max(0, Math.round(num(band.count, 0)));
    band.contingents = had ? [{ n: had, quality: Math.max(1, Math.round(num(band.quality, 1))),
      does: ["HARM", "MARTIAL"], what: band.name || null }] : [];
  }
  if (npcId && band.contingents.some(c => c && c.npcId === npcId)) return { ok: false, why: "they already stand in it" };
  const c = { n, quality, does, ...(spec.what ? { what: String(spec.what).slice(0, 80) } : {}),
    ...(npcId ? { npcId } : {}), ...(spec.from ? { from: String(spec.from) } : {}),
    ...(spec.kind ? { kind: String(spec.kind).trim().slice(0, 32) } : {}),
    ...(wards.length ? { wards } : {}), ...(crafts.length ? { crafts } : {}) };
  band.contingents = [...band.contingents, c];
  // ⚠️ `count` IS THE STORED COPY OF A DERIVED VALUE, and `unitsOf` already prefers the derived head for exactly that reason. It is
  // kept in step here anyway, because `raiseBand` wrote it and an authored band may still carry it — a stale one would be read by
  // anything that has not been moved over yet.
  band.count = band.contingents.reduce((a, x) => a + Math.max(0, num(x?.n, 0)), 0);
  return { ok: true, band, contingent: c };
}

/** ⛔ CCODE-409 (Erik: "cavalry and archers... that type of thing... a dragon") — SAY WHAT A CONTINGENT IS. A kind is a LABEL over the
 *  parts, on his choice of the two shapes offered: `kind: "archers"` is bookkeeping, and everything mechanical comes from the families,
 *  wards and crafts it carries. So "archers" is HARM at reach because their crafts reach, and "cavalry" is MOVE and HARM because they
 *  carry both — never because of the word. ⚠️ Nothing here can make a contingent bigger or better: `n`, `quality`, `npcId` and `from`
 *  are not editable, because relabelling hands is a description and resizing them would be conjuring. Pure over the band. */
export function editContingent(band, index, patch = {}) {
  if (!band || !Array.isArray(band.contingents)) return { ok: false, why: "no such unit" };
  const i = Math.round(num(index, -1));
  const cur = band.contingents[i];
  if (!cur) return { ok: false, why: "no such contingent" };
  const next = { ...cur };
  if ("kind" in patch) { const k = String(patch.kind || "").trim().slice(0, 32); if (k) next.kind = k; else delete next.kind; }
  if (Array.isArray(patch.wards)) { const w = [...new Set(patch.wards.map(String).filter(Boolean))]; if (w.length) next.wards = w; else delete next.wards; }
  if (Array.isArray(patch.crafts)) { const k = [...new Set(patch.crafts.map(String).filter(Boolean))]; if (k.length) next.crafts = k; else delete next.crafts; }
  if (Array.isArray(patch.does)) next.does = [...new Set(patch.does.map(String).filter(Boolean))];
  if ((next.wards || []).length && !next.does.includes("PROTECT")) next.does = [...next.does, "PROTECT"];   // a ward is protection
  if (!next.does.length) return { ok: false, why: "they have to do something" };
  band.contingents = band.contingents.map((c, j) => (j === i ? next : c));
  return { ok: true, band, contingent: next };
}

/** ⛔ HOW MANY ANONYMOUS HEADS IN THIS UNIT WERE RAISED AT THAT PLACE. The bound on mustering is the place's own authored capacity, so
 *  the bound has to be checkable again later — which means the heads must remember where they came from. ⚠️ Named people are not
 *  counted: a person who works for you is not a head of capacity, they are a person who agreed. Pure. */
export function musteredFrom(band, holdingId) {
  if (!band || !holdingId) return 0;
  const want = String(holdingId);
  return contingentsOf(band).reduce((a, c) => a + (!c.npcId && String(c.from || "") === want ? Math.max(0, num(c.n, 0)) : 0), 0);
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

/* ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * CCODE-405 — THE LEGION. Erik's ruling, in his own words: "They keep their identity. And they gain a legion tag... which legion are
 * they in. Where is the legion located... is it camped or dispersed to forage in the region… Soldiers cost to call together for a
 * campaign or mission... but you should be able to build the legion (identify who and how many from where) without incurring the cost."
 *
 * ⛑ AND THE CONTAINER WAS ALREADY DECIDED, by `fellowship.js`'s own header on his 2026-09-12 ruling: "A legion is a UNIT WHOSE
 * CONTINGENTS ARE THE CONTINGENTS OF SEVERAL BANDS, with `formedFrom` naming them… I HAVE NOT BUILT THE FORMING." `unitsOf` has
 * carried `formedFrom` since, marked EMPTY TODAY. So a legion lives in `character.bands` beside the bands — it IS a unit — and
 * nothing needed a new home.
 *
 * ⛔ THE PARTS KEEP THEIR PEOPLE, WHICH IS WHAT "THEY KEEP THEIR IDENTITY" HAS TO MEAN MECHANICALLY. A legion owns NO contingents of
 * its own; its strength, make-up and gaps are RESOLVED from its parts at read time. That is not a stylistic choice:
 *   · two copies of one contingent would double-count every head in every clash;
 *   · and `bloodBand` is pure — it returns a new unit — so losses stored on a legion would never reach the bands that took them.
 * ⚠️ Therefore losses are apportioned to the PARTS (`bloodUnit`), and each part bleeds under ITS OWN gaps: a band with no shieldwall
 * loses more inside the legion than the one standing beside it, which is the composition decision surviving at the larger scale.
 *
 * ⛔ AND A UNIT ON PAPER IS NOT A UNIT IN THE FIELD. "Build the legion without incurring the cost" makes that a state, not a policy:
 * an uncalled unit is a plan — who and how many, from where — and it is nowhere, costs nothing and cannot be given a posture. Calling
 * it is the moment it becomes real, and the moment it is paid for.
 * ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */

/** ⚑ WHERE A CALLED UNIT STANDS. Erik: "is it camped or dispersed to forage in the region." Two postures, because he named two, and
 *  each is a real trade the engine can already express: concentrated and fed from the purse, or spread out and living off the ground. */
export const UNIT_POSTURES = ["camped", "dispersed"];

/** ⛔ CCODE-406 (Erik) — "Legions have commanders and unit captains. Those positions should grant bonuses... like a scaled up band."
 *  A band's leader is its CAPTAIN; a legion's is its COMMANDER. His words, and they are stored under his words so the GM narrates
 *  them correctly. `"player"` means the character themself, who is the commander of most things they raise.
 *
 *  ⛔ AND THE BONUS IS LEVEL-BASED ON HIS RULING: "Build level based for now and crafts can add to it later... or decrease it if
 *  opposing." ⚑ IT IS NOT A NEW LADDER: `contingentsFromPeople` already rates a person at `1 + floor(level/10)` — "DELIBERATELY FLAT.
 *  A level-27 smith is worth three soldiers, not twenty-seven" — so a leader's bonus is that same step without the base, which makes a
 *  level-35 captain +3 and a level-9 captain +0. ⚠️ Content-dialled (`leaderStep`), so it is Erik's to move without an engine change.
 *
 *  ⬜ THE SEAM HE NAMED, LEFT OPEN AND NOT FAKED: crafts add to this later, or subtract when the craft is an OPPOSING commander's.
 *  There is no parameter for it yet, because a parameter nothing fills is a reader with no writer and reads to the next author as a
 *  built system. When the commander line exists (`the_gathering`, `raise_banner`, `lead_the_line`, `command_field` — Aevi's request,
 *  still unauthored), the craft term is added HERE and every consumer below picks it up unchanged.
 *  ⚠️ AND OPPOSITION ALREADY BITES WITHOUT IT: both sides' bonuses ride in the strengths `legionClash` compares, so a commander facing
 *  a better commander is already worse off — what the crafts will add is a bonus that reaches ACROSS, not the fact of opposition. */
export const LEADER_ROLE = { legion: "commander", band: "captain" };
export function leaderOf(unit) {
  if (!unit) return null;
  const isLegion = Array.isArray(unit.formedFrom) && unit.formedFrom.length > 0;
  const id = isLegion ? unit.commander : unit.captain;
  return id ? { id: String(id), role: isLegion ? "commander" : "captain" } : null;
}

/** What that position is worth, from the leader's level alone. Returns 0 with no leader, no level, or no lookup — a bonus nobody can
 *  price is not a bonus. `levelOf` is INJECTED because this file has no imports and must not gain any. Pure. */
export function leaderBonusOf(unit, { levelOf = null, cfg = {} } = {}) {
  const who = leaderOf(unit);
  if (!who || typeof levelOf !== "function") return 0;
  const step = Math.max(1, num(cfg.leaderStep, 10));
  const lvl = num(levelOf(who.id), 0);
  const ladder = Math.max(0, Math.floor(lvl / step));
  // ⛔ AND A LEADER CAN AT MOST DOUBLE WHAT HE ALREADY HAS. ⚑ MEASURED BEFORE CAPPING IT: an uncapped ladder took a band of six at
  // quality 2 from 12 effective to 30 under a level-35 captain, and this file's own idiom for a LARGE effect is 1.4× (`unwardedLossMult`)
  // — so a 2.5× swing from one appointment was out of scale with everything around it, and a bigger swing than the shield wall.
  // ⚠️ THE CEILING IS THE UNIT'S OWN QUALITY, not a constant I picked: a commander makes the most of the troops he has and cannot make
  // raw hands into veterans. It scales with the unit, needs no invented number, and states as one sentence.
  // ⬜ The crafts Erik named are what will reach PAST this ceiling — which is what makes them worth authoring.
  const cs = contingentsOf(unit);
  const heads = cs.reduce((a, c) => a + Math.max(0, num(c.n, 0)), 0);
  const base = heads ? Math.floor(cs.reduce((a, c) => a + Math.max(0, num(c.n, 0)) * Math.max(0, num(c.quality, 1)), 0) / heads) : 1;
  return Math.max(0, Math.min(ladder, Math.max(1, base)));
}

/** The bands a unit is formed from, in the order it names them. ⚠️ A missing part is skipped rather than faked — a legion whose band
 *  was disbanded elsewhere is smaller, not broken. Pure. */
export function legionParts(bands, unit) {
  const from = Array.isArray(unit?.formedFrom) ? unit.formedFrom.map(String) : [];
  if (!from.length) return [];
  const by = new Map((bands || []).filter(b => b && b.id).map(b => [String(b.id), b]));
  return from.map(id => by.get(id)).filter(Boolean);
}

/** ⛔ A UNIT'S CONTINGENTS, RESOLVED: its own, plus every part's. This is the one reader every consumer of strength, threat,
 *  composition and gaps must go through for a legion, because the legion stores none of its own. Pure. */
export function resolvedContingents(bands, unit, { levelOf = null, cfg = {} } = {}) {
  // ⛔ CCODE-406 — THE LEADER'S BONUS RIDES IN THE CONTINGENTS' QUALITY, and that is deliberate: `bandStrength`, `bandThreat`,
  // `unitComposition` and `legionClash` all read contingents, so every one of them picks the bonus up without gaining a parameter
  // somebody can forget to pass. ⚠️ A bonus delivered as a new argument to four readers is four chances to ship it half-wired, which
  // is the defect this project finds most often (CCODE-402 was exactly that, one level up).
  const lift = (cs, by) => (by > 0 ? cs.map(c => ({ ...c, quality: Math.max(0, num(c.quality, 1)) + by })) : cs);
  const parts = legionParts(bands, unit);
  if (!parts.length) return lift(contingentsOf(unit), leaderBonusOf(unit, { levelOf, cfg }));
  // ⚑ "LIKE A SCALED UP BAND": each part is lifted by its OWN captain, and the whole formation again by the legion's commander — so a
  // legion of well-captained bands under a good commander is worth more than the same heads under nobody, at both scales.
  const commander = leaderBonusOf(unit, { levelOf, cfg });
  const own = Array.isArray(unit?.contingents) && unit.contingents.length ? contingentsOf(unit) : [];
  const fromParts = parts.flatMap(p => lift(contingentsOf(p), leaderBonusOf(p, { levelOf, cfg })));
  return lift([...own, ...fromParts], commander);
}

/** ⛔ A UNIT-SHAPED OBJECT CARRYING THE RESOLVED CONTINGENTS, so `bandStrength`, `bandThreat`, `unitComposition` and `bandGaps` read a
 *  legion without a single one of them changing — which is exactly what the design claimed and is worth holding it to. Pure. */
export function resolvedUnit(bands, unit, opts = {}) {
  return unit ? { ...unit, contingents: resolvedContingents(bands, unit, opts) } : unit;
}

/** ⛔ FORM ONE. The parts stay in `character.bands` and gain `inLegion` — Erik's "legion tag... which legion are they in" — and the
 *  legion is a unit with `formedFrom` and no contingents of its own.
 *  ⚠️ IT COSTS NOTHING AND IT IS NOWHERE, on his ruling: building the legion is identifying who and how many from where. A place and
 *  a posture arrive with the CALL. Refuses a band that already stands in another legion, and a legion of nothing. Pure over `bands`. */
export function formLegion(bands, { id, name = null, from = [], day = 0 } = {}) {
  const list = Array.isArray(bands) ? bands : [];
  if (!id) return { ok: false, why: "a legion needs a name to be called by" };
  if (list.some(b => b && String(b.id) === String(id))) return { ok: false, why: `${name || id} already stands` };
  const want = [...new Set((from || []).map(String))];
  const parts = want.map(w => list.find(b => b && String(b.id) === w)).filter(Boolean);
  if (parts.length < 2) return { ok: false, why: "a legion is formed from two or more bands" };
  const taken = parts.filter(p => p.inLegion);
  if (taken.length) return { ok: false, why: `${taken.map(p => p.name || p.id).join(" and ")} already stand${taken.length === 1 ? "s" : ""} in a legion` };
  const held = parts.filter(p => Array.isArray(p.formedFrom) && p.formedFrom.length);
  if (held.length) return { ok: false, why: "a legion cannot be formed from another legion" };
  const legion = { id: String(id), name: name || String(id), formedFrom: parts.map(p => String(p.id)),
    condition: "fresh", raisedDay: num(day, 0), losses: 0, posture: null, locationId: null, called: null };
  const next = list.map(b => (parts.includes(b) ? { ...b, inLegion: String(id) } : b));
  return { ok: true, bands: [...next, legion], legion };
}

/** ⛔ CCODE-406 — APPOINT ONE. ⚠️ A LEADER MUST BE SOMEBODY WHO IS ACTUALLY THERE: the player, or a person standing in the unit (for a
 *  legion, in any of its bands). A commander who is not with the formation is a bonus from nowhere, and `levelOf` would price a
 *  stranger. `null` clears the position. Pure over `bands`. */
export function setUnitLeader(bands, id, npcId) {
  const list = Array.isArray(bands) ? bands : [];
  const i = list.findIndex(b => b && String(b.id) === String(id));
  if (i < 0) return { ok: false, why: "no such unit" };
  const unit = list[i];
  const isLegion = Array.isArray(unit.formedFrom) && unit.formedFrom.length > 0;
  const field = isLegion ? "commander" : "captain";
  if (npcId == null) return { ok: true, unit: { ...unit, [field]: null }, bands: list.map((b, j) => (j === i ? { ...b, [field]: null } : b)) };
  const who = String(npcId);
  const standing = new Set(resolvedContingents(list, unit).map(c => c.npcId).filter(Boolean).map(String));
  if (who !== "player" && !standing.has(who)) return { ok: false, why: "a leader has to be one of the people standing in it" };
  const next = { ...unit, [field]: who };
  return { ok: true, unit: next, role: field, bands: list.map((b, j) => (j === i ? next : b)) };
}

/** ⛔ AND TAKING IT APART RELEASES THEM WHOLE — their people, their condition and their losses were never moved, so there is nothing
 *  to restore. That is the other half of "they keep their identity". Pure over `bands`. */
export function disbandLegion(bands, id) {
  const list = Array.isArray(bands) ? bands : [];
  const legion = list.find(b => b && String(b.id) === String(id) && Array.isArray(b.formedFrom) && b.formedFrom.length);
  if (!legion) return { ok: false, why: "no such legion" };
  const parts = new Set(legion.formedFrom.map(String));
  return { ok: true, why: `${legion.name} stands down — ${parts.size} bands, as they were`,
    bands: list.filter(b => b !== legion).map(b => (parts.has(String(b.id)) ? (({ inLegion, ...rest }) => rest)(b) : b)) };
}

/** ⛔ WHAT CALLING THEM COSTS. Erik: "Soldiers cost to call together for a campaign or mission." ⚠️ HE DID NOT GIVE A NUMBER, so this
 *  does not invent one: it reads `callCostPerHead` where a martial rule authors it, and otherwise falls back to the ALREADY AUTHORED
 *  `wagePerHand` (3) on the stated reason that a soldier called for a campaign is paid what a hand asked to come and work is paid.
 *  `authored` says which it used, so a screen can say so and Aevi can overrule it with one number. Pure. */
export function callCostOf(bands, unit, { cfg = {}, wagePerHand = null } = {}) {
  const heads = resolvedContingents(bands, unit).reduce((a, c) => a + Math.max(0, num(c.n, 0)), 0);
  const authored = Number.isFinite(Number(cfg.callCostPerHead));
  const perHead = authored ? Math.max(0, num(cfg.callCostPerHead, 0)) : Math.max(0, num(wagePerHand, 0));
  return { heads, perHead, total: heads * perHead, authored,
    why: authored ? "the martial rules set what a head costs to call"
      : "no martial rule sets this yet — a called head is paid what a working hand is paid" };
}

/** ⛔ CALL THEM TOGETHER: the moment a plan becomes a unit in the field. It takes a PLACE and a POSTURE because that is what being in
 *  the field means, and it refuses a posture the rules do not name. ⚠️ The cost is charged by the CALLER, which holds the purse — this
 *  records what was paid so the receipt is on the unit and not only in a log. Pure over `bands`. */
export function callUnit(bands, id, { day = 0, locationId = null, posture = "camped", paid = 0 } = {}) {
  const list = Array.isArray(bands) ? bands : [];
  const i = list.findIndex(b => b && String(b.id) === String(id));
  if (i < 0) return { ok: false, why: "no such unit" };
  if (list[i].called) return { ok: false, why: `${list[i].name || id} is already called` };
  if (!UNIT_POSTURES.includes(String(posture))) return { ok: false, why: `a unit is ${UNIT_POSTURES.join(" or ")}, not ${posture}` };
  const unit = { ...list[i], called: { day: num(day, 0), paid: Math.max(0, num(paid, 0)) },
    locationId: locationId ? String(locationId) : null, posture: String(posture) };
  return { ok: true, unit, bands: list.map((b, j) => (j === i ? unit : b)) };
}

/** Send them home: the plan survives, the place and the posture do not. Nothing is refunded — they were paid. Pure over `bands`. */
export function standDown(bands, id) {
  const list = Array.isArray(bands) ? bands : [];
  const i = list.findIndex(b => b && String(b.id) === String(id));
  if (i < 0) return { ok: false, why: "no such unit" };
  if (!list[i].called) return { ok: false, why: `${list[i].name || id} was never called` };
  const unit = { ...list[i], called: null, posture: null, locationId: null };
  return { ok: true, unit, bands: list.map((b, j) => (j === i ? unit : b)) };
}

/** ⚑ AND THE POSTURE, once it is in the field. Refuses one the rules do not name, and refuses a unit still on paper — a plan cannot
 *  be camped anywhere. Pure over `bands`. */
export function setUnitPosture(bands, id, posture) {
  const list = Array.isArray(bands) ? bands : [];
  const i = list.findIndex(b => b && String(b.id) === String(id));
  if (i < 0) return { ok: false, why: "no such unit" };
  if (!list[i].called) return { ok: false, why: "it has not been called together yet" };
  if (!UNIT_POSTURES.includes(String(posture))) return { ok: false, why: `a unit is ${UNIT_POSTURES.join(" or ")}, not ${posture}` };
  const unit = { ...list[i], posture: String(posture) };
  return { ok: true, unit, bands: list.map((b, j) => (j === i ? unit : b)) };
}

/** ⛔ WHAT A CLASH COSTS A UNIT, ROUTED TO WHOEVER ACTUALLY HAS THE PEOPLE. For a band it is `bloodBand`, unchanged.
 *
 *  ⛔ FOR A LEGION, ERIK RULED IT MID-BUILD AND CORRECTED ME: "a shield wall unit should be able to protect other units. Just like a
 *  band." My first cut handed the tide to each part separately, so each bled under ITS OWN gaps — which meant a shield wall band
 *  protected nobody but itself, and bringing one into a legion bought the legion nothing. ⚑ THE LEGION'S GAPS GOVERN: the loss rate is
 *  computed once from the RESOLVED unit, exactly as a band's is computed once from its contingents, so one part's PROTECT covers the
 *  whole formation and the 1.4× unwarded multiplier lifts off every band in it. A legion is a band one scale up, which is his phrase.
 *
 *  ⚠️ AND THE PARTS STILL KEEP THEIR IDENTITY, which is the earlier half of his ruling: the pooled loss is apportioned by head-count,
 *  and each band's own CONDITION is then read from its own cumulative losses. So a small band inside a big legion can be worn while
 *  the legion is merely blooded, and it carries that out of the campaign. The legion's condition is the worst of its parts.
 *  ⚠️ `bloodBand` is pure and returns a NEW unit, which is why losses must be written to the parts here rather than onto the legion:
 *  a legion that stored them would be the only record of people its bands still think they have. Pure over `bands`. */
export function bloodUnit(bands, id, tide, { cfg = {} } = {}) {
  const list = Array.isArray(bands) ? bands : [];
  const unit = list.find(b => b && String(b.id) === String(id));
  if (!unit) return { ok: false, why: "no such unit", bands: list };
  const parts = legionParts(list, unit);
  if (!parts.length) {
    const r = bloodBand(unit, tide, { cfg });
    return { ok: true, bands: list.map(b => (b === unit ? r.band : b)), lost: r.lost, results: [r], why: r.why };
  }
  // ⛔ ONE ROLL FOR THE FORMATION, under the formation's own gaps — this is the shield wall reaching the whole legion.
  const whole = bloodBand(resolvedUnit(list, unit), tide, { cfg });
  const lost = num(whole.lost, 0);
  const heads = parts.map(p => contingentsOf(p).reduce((a, c) => a + Math.max(0, num(c.n, 0)), 0));
  const total = Math.max(1, heads.reduce((a, n) => a + n, 0));
  const worst = ["fresh", "blooded", "worn", "broken"];
  const bled = parts.map((p, i) => {
    const share = Math.min(heads[i], Math.round(lost * (heads[i] / total)));
    const cs = contingentsOf(p);
    const inPart = Math.max(1, cs.reduce((a, c) => a + c.n, 0));
    const next = cs.map(c => ({ ...c, n: Math.max(0, c.n - Math.round(share * (c.n / inPart))) }));
    const left = next.reduce((a, c) => a + c.n, 0);
    const losses = num(p.losses, 0) + share;
    // ⚠️ ITS OWN CONDITION, FROM ITS OWN HISTORY — the part's identity is what it has been through, not what the legion averaged.
    const hurt = (heads[i] + num(p.losses, 0)) ? losses / (heads[i] + num(p.losses, 0)) : 0;
    const condition = left === 0 || hurt > num(cfg.brokenAt, 0.5) ? "broken"
      : hurt > num(cfg.wornAt, 0.25) ? "worn"
      : share > 0 || p.condition !== "fresh" ? "blooded" : "fresh";
    return { ...p, count: left, losses, condition, ...(p.contingents ? { contingents: next } : {}) };
  });
  const byId = new Map(bled.map(b => [String(b.id), b]));
  const condition = bled.reduce((w, b) => (worst.indexOf(b.condition) > worst.indexOf(w) ? b.condition : w), "fresh");
  const rolled = { ...unit, losses: num(unit.losses, 0) + lost, condition };
  return { ok: true, lost, results: [whole], condition, gaps: whole.gaps,
    bands: list.map(b => (byId.has(String(b.id)) ? byId.get(String(b.id)) : (b === unit ? rolled : b))),
    why: lost === 0 ? `${unit.name} comes through it whole` : `${unit.name} loses ${lost} across ${parts.length} bands` };
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

