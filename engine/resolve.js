// resolve.js — deterministic d100 action resolution. The model NEVER rolls; this does.
// Pure functions only: no I/O, no globals, fully testable in Node.

/** Cosine-ish alignment between two spectrum vectors (sparse maps of axis -> [-1,1]).
 *  Returns [-1, 1]: how much the character's fingerprint agrees with the action's demands. */
export function spectrumAlignment(a = {}, b = {}) {
  const axes = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0, magA = 0, magB = 0;
  for (const ax of axes) {
    const va = a[ax] || 0, vb = b[ax] || 0;
    dot += va * vb; magA += va * va; magB += vb * vb;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/** Compute true success chance for an action. Everything is data-driven from rules JSON.
 *  action: { attribute, skillId?, axes?, abilityLevel?, difficulty (0-100 penalty), planned? }
 *  aptitudeMods: flat map merged from the player's aptitudes (see playerprofile.js). */
/** SNG-346 — THE ONE PLACE A DIFFICULTY IS NORMALIZED. Four doors read this field (the intent sanitizer,
 *  two prompt contracts, and gambit's step validator) and they disagreed, which is how a five-band scale
 *  would have shipped working in one path and silently flattened in three.
 *
 *  ⛔ THE LEGACY NUMBERS MAP ONTO THE NEW SCALE EXACTLY, WHICH IS WHY THIS IS SAFE: the old vocabulary
 *  (0 routine / 15 hard / 30 very hard) IS the negative half of Erik's symmetric scale (normal 0 / hard −15 /
 *  very hard −30). Erik's design does not move any band that already existed — it ADDS the positive half
 *  nobody could express. So every in-flight turn and every save keeps its exact meaning.
 *
 *  ⚠️ A NUMBER THAT IS NOT ON THE LADDER STAYS A NUMBER. An encounter's threat (35) is an OPPOSED term,
 *  not a band, and must not be rounded onto the ladder — the two are different things that happen to share
 *  a field. */
export const DIFFICULTY_BANDS = ["very_easy", "easy", "normal", "hard", "very_hard"];
const LEGACY_TO_BAND = { 0: "normal", 15: "hard", 30: "very_hard" };

export function normalizeDifficulty(raw) {
  if (typeof raw === "string") {
    const k = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
    if (DIFFICULTY_BANDS.includes(k)) return k;
    const n = Number(raw);                                   // "15" — a number that arrived as text
    if (Number.isFinite(n) && n in LEGACY_TO_BAND) return LEGACY_TO_BAND[n];
    if (Number.isFinite(n)) return Math.max(0, Math.min(70, Math.round(n)));
    console.warn(`[resolve] unknown difficulty "${raw}" — treating as normal`);
    return "normal";
  }
  const n = Number(raw);
  if (!Number.isFinite(n)) return "normal";
  if (n in LEGACY_TO_BAND) return LEGACY_TO_BAND[n];          // the old three-band vocabulary, unchanged in meaning
  return Math.max(0, Math.min(70, Math.round(n)));            // an opposed threat — stays a penalty
}

export function successChance(ctx) {
  const { character, action, location, rules, aptitudeMods = {}, equipmentBonus = 0, skillBonus = 0, substratePenalty = 0 } = ctx;
  const bc = rules.baseChance;
  // SNG-106: retain every component so the breakdown popup shows the REAL math, never a re-derivation.
  // `add` is the single accumulation site — every term goes through it, so sum(components) === chance
  // (before clamp) by construction. Attached to the passed ctx (ctx._breakdown); return value unchanged.
  const components = [];
  let chance = 0;
  const add = (label, value) => { if (value) components.push({ label, value }); chance += value; };
  // SNG-339 §4 — ⚠️ A ZERO TERM IS DROPPED BY `add`, AND THAT IS PART OF HOW TWO OF THEM HID THIS LONG.
  // Aevi: "if a character has no skill and no gear, the breakdown should say so rather than silently omitting
  // two lines." A missing line reads as "this does not apply to me"; an explicit zero reads as "you could
  // have had something here, and you have nothing." That difference is the whole diagnosis she did by hand.
  const addAlways = (label, value) => { components.push({ label, value, zero: !value }); chance += value; };

  // Sub-attributes (strength/agility, reason/insight, presence/rapport, craft/wits)
  // are the real target when present; the parent attribute is the fallback.
  const attrLevel = (action.subAttribute && character.subAttributes?.[action.subAttribute])
    || character.attributes[action.attribute] || 1;
  const soft = bc.attributeSoftCap ?? 4;
  const attrName = action.subAttribute || action.attribute || "attribute";
  // ⛔ SNG-356 — THE AUTHORED LADDER REPLACES THE SOFT-CAP FORMULA, and this line moves every success
  // chance in the game. Erik: "specify what each point up to 20 gets you so we can better control the
  // impact and the player can see it exactly." The bend that used to sit at rank 4 — computed, invisible,
  // and (SNG-354) in the wrong phase, since rank 4 is the TOP of early game rather than the start of
  // mastery — now sits at rank 6 and is AUTHORED, so Erik retunes it without a build.
  //
  // ⚠️ SHIPPED ON THE HARNESS'S EVIDENCE, NOT ON ANYONE'S SAY-SO. Aevi gated this column on SNG-357 by her
  // own file's note — "a flat +10 on success chance from mid-game onward is a large change and I do not
  // know that it is right" — with the failure condition stated in advance: if the +10 pushes mid-game
  // characters toward the 95% ceiling, lower the per-rank values rather than abandon the bend. Measured
  // against Silas's real spread (4,5,7,7,9,7,9,6) at level 29, ZERO of 8 subs reach the ceiling on normal
  // work. The stated failure mode does not occur, so the column ships.
  //
  // The formula remains as the FALLBACK, because a missing ladder must degrade to the old behaviour rather
  // than to zero — a resolver that silently returns nothing is the SNG-342 emergence regression again.
  const ladderRoll = rules.subAttributeLadder?.rollCumulative;
  if (ladderRoll) {
    const capped = Math.max(1, Math.min(20, Math.round(attrLevel)));
    const fromLadder = Number(ladderRoll[String(capped)]);
    // Past the authored top the ladder simply stops; keep paying the last per-rank step rather than
    // flat-lining, so a character beyond rank 20 is not silently frozen.
    const beyond = Math.max(0, Math.round(attrLevel) - 20) * Number(rules.subAttributeLadder.rollPerRank?.["20"] ?? 0);
    add(`${attrName} ${attrLevel}`, (Number.isFinite(fromLadder) ? fromLadder : 0) + beyond);
  } else {
    // full value through the soft cap (competence), diminishing beyond (mastery)
    add(`${attrName} ${attrLevel}`, Math.min(attrLevel, soft) * bc.attributeMultiplier);
    if (attrLevel > soft) add(`${attrName} mastery (beyond ${soft})`, Math.max(0, attrLevel - soft) * (bc.attributePerPointBeyond ?? 5));
  }

  // SNG-339 — ⚠️ THE OLD SKILL TERM COULD NEVER FIRE. It keyed on `action.skillId`, which NOTHING writes,
  // against `character.skills`, which nothing writes either, using a vocabulary that was never defined. Not
  // dormant — unreachable, and it has been quietly costing every character up to 10 points a rank since
  // the file was written. The legacy read is kept for any save that somehow carries one.
  if (action.skillId && character.skills?.[action.skillId]) add(`skill: ${action.skillId}`, character.skills[action.skillId] * bc.skillBonus);
  // Training now keys on the ACTION TAGS the game already uses for equipment, computed by inventory.skillBonus.
  addAlways("training", skillBonus);
  if (action.abilityLevel) add(`ability rank ${action.abilityLevel}`, action.abilityLevel * bc.abilityLevelBonus);

  // Spectrum modifiers: who-you-are vs what-you're-doing, and does the place help? Clamped as a TOTAL —
  // so when the clamp doesn't bite, show the two named contributions; when it does, show the clamped sum.
  const sm = rules.spectrumModifier;
  const selfFit = spectrumAlignment(character.alignment, action.axes) * sm.alignmentWeight;
  const placeFit = spectrumAlignment(location?.spectrum, action.axes) * sm.locationWeight;
  const spectralClamped = Math.max(sm.minTotal, Math.min(sm.maxTotal, selfFit + placeFit));
  if (spectralClamped === selfFit + placeFit) { add("spectral fit (you)", selfFit); add("spectral fit (place)", placeFit); }
  else add("spectral fit (clamped)", spectralClamped);

  // Player-aptitude modifiers (bonuses AND penalties — the human shapes the character)
  if (action.planned && aptitudeMods.plannedActionBonus) add("planned action", aptitudeMods.plannedActionBonus);
  if (action.attribute === "physical" && aptitudeMods.physicalBonus) add("physical aptitude", aptitudeMods.physicalBonus);
  if (action.attribute === "mental" && aptitudeMods.mentalBonus) add("mental aptitude", aptitudeMods.mentalBonus);
  if (action.attribute === "social") {
    if (aptitudeMods.socialBonus) add("social aptitude", aptitudeMods.socialBonus);
    if (action.tags?.includes("rapport") && aptitudeMods.rapportBonus) add("rapport", aptitudeMods.rapportBonus);
    if (action.tags?.includes("finesse") && aptitudeMods.socialFinessePenalty) add("social finesse (penalty)", aptitudeMods.socialFinessePenalty);
  }
  if (action.tags?.includes("discipline") && aptitudeMods.disciplinePenalty) add("discipline (penalty)", aptitudeMods.disciplinePenalty);

  // SNG-113: the expanded roster's SITUATIONAL mods — each fires only in its own context (intent tags /
  // novelty / going it alone), as its own named, self-summing line. A bonus-and-cost aptitude expresses its
  // edge only where it applies (shadow helps when you sneak, not when you speak). No consumer, no lie.
  {
    const am = aptitudeMods, tg = action.tags || [], hasTag = (...ts) => ts.some(t => tg.includes(t));
    const TAG_MODS = [
      ["defenseBonus", ["defend", "guard", "block", "brace", "careful"], "defense"],
      ["stealthBonus", ["scout", "sneak", "hide", "stealth"], "stealth"],
      ["deceiveBonus", ["deceive", "lie", "feint", "bluff", "trick"], "deception"],
      ["intimidateBonus", ["threaten", "intimidate", "coerce", "menace"], "intimidation"],
      ["deEscalationBonus", ["comfort", "negotiate", "calm", "deescalate", "soothe"], "de-escalation"],
      ["sustainedActionBonus", ["sustain", "ritual", "patient", "endure", "persist"], "the long game"],
      ["craftBonus", ["craft", "forge", "repair", "make", "build", "mend"], "craft"],
      ["allyActionBonus", ["help", "aid", "protect", "support", "rally", "assist"], "in service of another"],
      ["flirtationBonus", ["romantic", "flirt", "woo", "seduce", "charm"], "charm"],       // rating-ceiling-bounded: a social/rapport edge, never a content unlock
      ["sincerityReadBonus", ["sincere", "earnest", "plead", "confess", "comfort"], "sincerity"],
      ["trustedBonus", ["persuade", "ask", "request", "appeal", "plead", "negotiate"], "you are trusted"],
      ["alignedTraditionBonus", ["aligned", "devout", "tradition", "devote", "pray"], "aligned tradition"]
    ];
    for (const [key, ts, label] of TAG_MODS) if (am[key] && hasTag(...ts)) add(label, am[key]);
    if (am.gravitasPenalty && hasTag("command", "order", "formal", "authority", "decree", "lead")) add("gravitas (penalty)", am.gravitasPenalty);
    if (am.composurePenalty && hasTag("risky", "reckless", "surge", "pressure", "panic")) add("composure (penalty)", am.composurePenalty);
    if (am.burstPenalty && hasTag("burst", "allout", "reckless", "surge")) add("burst (penalty)", am.burstPenalty);
    if (am.improvisationPenalty && action.novel) add("improvisation (penalty)", am.improvisationPenalty);
    if (am.crossPolePenalty && action.novel && hasTag("cross", "opposed", "antipode")) add("cross-pole (penalty)", am.crossPolePenalty);
    if (am.worldlyCunningPenalty && hasTag("deceive", "lie", "threaten", "intimidate", "coerce", "steal", "extort", "scheme", "menace")) add("worldly cunning (penalty)", am.worldlyCunningPenalty);
    if (am.chargedSituationPenalty && hasTag("attack", "brawl", "kill", "romantic", "seduce", "threaten", "menace")) add("charged moment (penalty)", am.chargedSituationPenalty);
    if (am.soloPenalty && !hasTag("help", "aid", "protect", "support", "rally", "assist")) add("acting alone (penalty)", am.soloPenalty);
  }

  // Equipment: the right tool in your pack helps (computed by inventory.equipmentBonus)
  addAlways("equipment", equipmentBonus);

  // Novel/combined ability use is harder — unless it's a technique the character already DISCOVERED.
  if (action.discoveryBonus) add("discovered technique", action.discoveryBonus);
  else if (action.novel) add("novel use (surcharge)", -(rules.novel?.difficultySurcharge ?? 15));

  // SNG-090: the substrate penalty — a SEPARATE, already-clamped environmental term (never folded into spectral).
  if (substratePenalty) add("substrate (the lattice here)", -substratePenalty);

  // SNG-098: skill-battle contest terms — matchup edge (reveal beats conceal), intensity (Surge/Conserve).
  // Each enters as its OWN named, self-summing line (SNG-106 honesty), so the tier-3 fog view shows the
  // opponent's real math. Absent outside a skill battle.
  for (const m of ctx.contestMods || []) add(m.label, m.value);

  // Exhaustion: at zero energy everything is harder — body and field both spent
  if ((character.energy ?? 1) <= 0) add("exhausted", -(rules.energy?.exhaustedPenalty ?? 10));

  // Difficulty — the OPPOSED term lives here (an encounter's threat becomes difficulty). Name its source
  // when the caller passes one (SNG-106): "the raider (threat 35)" instead of an anonymous "difficulty".
  // ⛔ SNG-346 — TWO KINDS OF DIFFICULTY, AND THEY ARE NOT THE SAME THING.
  //
  //   A BAND is the task's own character ("easy", "hard") on Erik's symmetric scale, and it can HELP:
  //   very easy +30 · easy +15 · normal 0 · hard −15 · very hard −30. Aevi's insight is that "easy becomes
  //   a BONUS rather than the absence of a penalty" — a flat base lifts every band equally, so easy and
  //   hard stay 15 apart however high you push it. Widening the spread was the actual fix.
  //
  //   A NUMBER is an OPPOSED term — an encounter's threat, an opponent who rolled. It is always a penalty
  //   and always keeps its source name ("the raider (threat 35)"), and it is NOT on the band ladder.
  //
  // ⚠️ BOTH ARE LIVE AT ONCE. A hard task against a real opponent is band + threat, so they accumulate as
  // SEPARATE named lines rather than one blended number — the breakdown must say WHY, and "difficulty −50"
  // teaches the player nothing about which half they could have changed.
  const bands = rules.difficultyBands || {};
  const bandKey = typeof action.difficulty === "string" ? action.difficulty.trim().toLowerCase().replace(/[\s-]+/g, "_") : null;
  if (bandKey) {
    // ⛔ AN UNKNOWN BAND IS NEVER SILENTLY ZERO. The GM emits this field; a typo or a band nobody defined
    // would otherwise read as "normal" and look exactly like a correct call. Loud, and treated as normal.
    if (!(bandKey in bands)) console.warn(`[resolve] unknown difficulty band "${action.difficulty}" — treating as normal; known:`, Object.keys(bands).filter(k => !k.startsWith("_")).join(", "));
    else if (bands[bandKey]) add(bandKey.replace(/_/g, " "), bands[bandKey]);
  }
  // The opposed/legacy numeric term. Still a PENALTY by sign convention, unchanged for every existing save.
  const diff = bandKey ? 0 : (Number(action.difficulty) || 0);
  if (diff) add(action.difficultySource || "difficulty", -diff);
  // A band and an opponent can both apply: `opposedDifficulty` carries the threat when `difficulty` is a band.
  const opposed = Number(action.opposedDifficulty) || 0;
  if (opposed) add(action.difficultySource || "opposed", -opposed);

  // hard guard: malformed inputs must never reach the dice as NaN
  if (!Number.isFinite(chance)) {
    console.warn("[resolve] non-finite chance from action:", action.label);
    chance = 50;
  }
  const rounded = Math.round(chance);
  const total = Math.max(rules.d100.floorChance, Math.min(rules.d100.ceilingChance, rounded));
  // CCODE-30: carry the two facts the breakdown popup needs to read PLAINLY — which line is the BASE (the
  // attribute/sub-attribute the action draws on, so the player learns "insight is my base here"), and whether
  // an actual OPPONENT rolled (difficultySource) vs. the difficulty being the task's own inherent hardness.
  ctx._breakdown = { components, total, clampedFrom: total !== rounded ? rounded : null, base: attrName, opposed: action.difficultySource || null };
  return total;
}

/** SNG-258 §3b — THE CRIT DIALS. Crits are a SECOND roll, not a position on the first.
 *
 *  WHY THIS SHAPE. Crits used to be bands on the first roll: 1-5 crit-success, 96+ crit-failure. The
 *  sensitivity tool found the defect that kills — a master sits at chance 95 while crit-failure starts at
 *  96, so there is NO ROOM between their success line and the crit-fail line. A master's miss was never a
 *  partial; it was always a critical failure, and widening the partial band moved them 0.0% at every width.
 *  Expertise made failure MORE binary, the exact inverse of what it should do.
 *
 *  Moving crits to their own roll unbinds them from the first roll's position entirely. A pinned master can
 *  now crit-succeed, and their crit-FAILURE rate can be lowered independently — mastery reaches further AND
 *  degrades softer, without needing to drag the master off the ceiling to do it. It also gives the clamped
 *  points somewhere to go: reserve capacity that this encounter did not need can feed the crit dial instead
 *  of vanishing.
 *
 *  Returns both dials AND their named reasons, in the same shape successChance uses, because §9 asks the
 *  popup to say "your crit-success X% / crit-failure Y% — and why". A dial the player cannot see the
 *  reasons for is the opaque-spectral-fit problem again.
 *
 *  `ctx.critMods` is the hook §7 (gear) and §10 (field effects) will feed — same shape as contestMods, so
 *  those tickets add a source without another pass through this function. */
export function critProfile(ctx) {
  const { rules, action = {}, character = {}, aptitudeMods = {} } = ctx;
  const c = rules.crit || {};
  const lo = c.minChance ?? 0, hi = c.maxChance ?? 60;
  const sc = [], fc = [];
  let s = 0, f = 0;
  const addS = (label, v) => { if (v) { sc.push({ label, value: v }); s += v; } };
  const addF = (label, v) => { if (v) { fc.push({ label, value: v }); f += v; } };

  addS("base", c.baseSuccessChance ?? 5);
  addF("base", c.baseFailChance ?? 5);

  // EXPERTISE — the whole point. Rank and practice push crit-success UP and crit-failure DOWN, on separate
  // constants so Erik can tune "triumphs harder" and "fails softer" independently rather than as one dial.
  const rank = Number(action.abilityLevel) || 0;
  if (rank) {
    addS(`ability rank ${rank}`, rank * (c.perAbilityRankSuccess ?? 3));
    addF(`ability rank ${rank}`, rank * (c.perAbilityRankFail ?? -2));
  }
  const skill = action.skillId ? (Number(character.skills?.[action.skillId]) || 0) : 0;
  if (skill) {
    addS(`practice: ${action.skillId}`, skill * (c.perSkillLevelSuccess ?? 2));
    addF(`practice: ${action.skillId}`, skill * (c.perSkillLevelFail ?? -1));
  }

  // SNG-140: a WILD-current craft channels both substrates untamed — it amplifies BOTH tails, upside-forward.
  // "Joyous, generous, and lethally unreliable." READ FROM rules.wild, not copied into rules.crit: the first
  // draft of this function duplicated these two numbers into the new block, which silently orphaned SNG-140's
  // authored dial — the registered-but-unread failure this codebase gates hardest against, and one no audit
  // here covers for rule constants. The mechanism changed from widening a band to raising a dial; the values
  // and their home did not.
  if (action.wildVariance) {
    addS("wild current", rules.wild?.critSuccessWiden ?? 6);
    addF("wild current", rules.wild?.critFailWiden ?? 3);
  }
  // Novel use is volatile: reach exceeding grasp can HURT. Same dial as before (rules.novel.critFailWiden),
  // still cancelled by a technique the character actually discovered.
  if (action.novel && !action.discoveryBonus) addF("novel use", rules.novel?.critFailWiden ?? 3);

  // CCODE-76 — WHAT THIS CRAFT'S CRITICAL LOOKS LIKE, authored on the craft (see craftmechanics.critFor).
  // A combo takes the STRONGEST contributing craft per side, never the sum — same rule deriveMechanic uses for
  // braids, and for the same reason: braiding three crafts must not out-crit any of them.
  const cc = Array.isArray(action.craftCrit) ? action.craftCrit : (action.craftCrit ? [action.craftCrit] : []);
  const strongest = key => cc.map(x => ({ n: x?.name, v: Number(x?.[key]?.chance) || 0 }))
    .filter(x => x.v).sort((a, b) => Math.abs(b.v) - Math.abs(a.v))[0];
  const cs = strongest("success"), cf = strongest("failure");
  if (cs) addS(cs.n ? `${cs.n}` : "this craft", cs.v);
  if (cf) addF(cf.n ? `${cf.n}` : "this craft", cf.v);

  // The existing aptitude keys keep their meaning, so no authored aptitude is orphaned by this change.
  addS("aptitude", aptitudeMods.critSuccessBonus || 0);
  addF("aptitude", aptitudeMods.critFailPenalty || 0);

  for (const m of ctx.critMods || []) {
    if (m.success) addS(m.label, m.success);
    if (m.fail) addF(m.label, m.fail);
  }

  const clamp = v => Math.max(lo, Math.min(hi, Math.round(v)));
  return { successChance: clamp(s), failChance: clamp(f),
    successComponents: sc, failComponents: fc,
    successClampedFrom: clamp(s) !== Math.round(s) ? Math.round(s) : null,
    failClampedFrom: clamp(f) !== Math.round(f) ? Math.round(f) : null };
}

/** Roll and grade an action. Returns the full receipt so narration and telemetry both have everything.
 *  rng injectable for tests. Degrees: crit_success | success | partial | failure | crit_failure */
export function resolveAction(ctx, rng = Math.random) {
  const { rules } = ctx;
  const chance = successChance(ctx);
  const roll = Math.floor(rng() * 100) + 1;
  const d = rules.d100;

  // The first roll decides only how well it went. It no longer decides whether it was CRITICAL.
  let degree = roll <= chance ? "success" : roll <= chance + d.partialBand ? "partial" : "failure";

  // The second roll. A PARTIAL takes no crit roll on purpose — it is already the soft middle outcome, and
  // "a critical partial" is not a thing the narration or the receipt line has any meaning for.
  const crit = critProfile(ctx);
  let critRoll = null;
  if (degree === "success" || degree === "failure") {
    critRoll = Math.floor(rng() * 100) + 1;
    const dial = degree === "success" ? crit.successChance : crit.failChance;
    if (critRoll <= dial) degree = degree === "success" ? "crit_success" : "crit_failure";
  }

  // CCODE-76: when a crit LANDS, hand the narrator the craft's own sentence for it. A dial the GM has to
  // invent the consequence for is the generic-default problem again — `riding_order` already says what its
  // disaster is, and this is the one moment that line is for. Absent authoring, absent field: the narrator
  // improvises exactly as before rather than receiving an empty string that reads like content.
  const cc = ctx.action?.craftCrit;
  const said = side => (Array.isArray(cc) ? cc : (cc ? [cc] : []))
    .map(x => x?.[side]?.text).find(Boolean) || null;
  const critText = degree === "crit_success" ? said("success") : degree === "crit_failure" ? said("failure") : null;

  // SNG-106: carry the retained component breakdown onto the receipt so the popup shows the real math.
  return { roll, chance, degree, action: ctx.action, breakdown: ctx._breakdown || null, critRoll, crit,
    ...(critText ? { critText } : {}) };
}

/** Apply energy cost for an action/ability use. Returns new energy (never below 0). */
export function applyEnergyCost(character, cost, rules) {
  const c = cost ?? rules.energy.defaultActionCost;
  return Math.max(0, (character.energy ?? rules.energy.max) - c);
}
