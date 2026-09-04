// encounters.js — typed multi-round structures: duels, challenges, puzzles.
// SNG-002. Encounters CONSUME the d100 resolution (the app rolls via resolve.js
// exactly as for any action); this module only maps receipts onto encounter
// state through data-driven tables. Design law 1 holds absolutely: the GM
// narrates round receipts and proposes choices — it never advances state.
// Incapacitation, never engine-imposed death.

import { battleRound, opponentPolicy } from "./skill_battle.js";
import { targetableAllies, alliesOf } from "./combatants.js";
import { commandSlots, bringForward, theatresOf, overmatchOf, answersOvermatch, scaleRank } from "./melee.js";   // CCODE-274: how many you lead is earned; who comes forward is chosen
import { currentStage } from "./evolution.js";   // CCODE-265: an earned item stage can lift a companion's canStrike:false   // CCODE-253: who a foe may aim at — DERIVED here, per this seam's own rule
import { encounterKind } from "./encounterFrame.js"; // SNG-247: which bounded thing this is — it picks the exit rule
import { smartClamp } from "./namematch.js"; // SNG-152

// ---------- lifecycle ----------

export function startEncounter(def, { oppSheet = null } = {}) {
  const base = { schemaVersion: 1, encounterId: def.id, type: def.type, status: "active", round: 1, log: [] };
  if (def.type === "duel") {
    // SNG-098: when the app hands us a synthesized/authored opponent SHEET, this duel runs as a two-sided
    // SKILL BATTLE (momentum + attrition + fog); without a sheet it stays the classic single-margins duel.
    // SNG-263 r4 GAP1: an AUTHORED health still wins; otherwise take the sheet's THREAT-SCALED health rather
    // than whatever the def happened to carry. Until now a synthesised foe had no health rule at all, so
    // everything unauthored fell to a flat 5 — an epic and a rat were equally durable, which is why no amount
    // of damage tuning could make a legendary fight feel different from a rat's.
    if (oppSheet) return { ...base, opponentHealth: def.opponent.health ?? oppSheet.health ?? 5, tactic: null, mode: "skill_battle", opponentSheet: oppSheet, momentum: 0, opponentEnergy: oppSheet.energy ?? 40 };
    return { ...base, opponentHealth: def.opponent.health, tactic: null };
  }
  if (def.type === "challenge") return { ...base, stageIndex: 0, stagesDone: [] };
  if (def.type === "puzzle") {
    // SNG-247 Tier 3: a puzzle given a STATIC sheet runs the contest engine — the turn structure, priced moves,
    // persistent effects and items all apply to working a sealed thing. Its hint state rides ALONG rather than
    // being replaced: puzzleHints/puzzleUnlocks are pure over the def, so understanding still accumulates and
    // still renders. Without a sheet it stays the classic attempt path, so an authored puzzle is never stranded.
    const p = { ...base, attempts: 0, hintsRevealed: 0, solved: false };
    if (oppSheet) return { ...p, mode: "skill_battle", opponentSheet: oppSheet, momentum: 0,
      opponentHealth: def.opponent?.health ?? 5, opponentEnergy: oppSheet.energy ?? 60 };
    return p;
  }
  return null;
}

/** Difficulty the encounter adds to the player's roll this round. */
export function encounterDifficulty(state, def, rules, action = {}) {
  if (state.type === "duel") {
    const comp = state.complication ? 5 : 0;
    if (action.flee) return (def.opponent.fleeDifficulty ?? 15) + comp;
    return Math.round((def.opponent.threat ?? 30) * (rules.encounters?.duel?.threatToDifficulty ?? 0.3)) + comp;
  }
  if (state.type === "challenge") return def.stages[state.stageIndex]?.difficulty ?? 15;
  if (state.type === "puzzle") return def.difficulty ?? 15;
  return 0;
}

// ---------- duel ----------

/** Apply one duel round from a resolution receipt. Returns { state, deltas, events, ended, outcome }. */
export function duelRound(state, def, resolution, rules, opts = {}) {
  const cfg = rules.encounters?.duel || {};
  const s = { ...state, round: state.round + 1 };
  if (s.complication) s.complication = null; // one round of pressure, then it clears
  const deltas = { health: 0, energy: -(cfg.energyPerRound ?? 3) };
  const events = [];
  let ended = false, outcome = null;

  if (opts.yield) {
    s.status = "ended"; ended = true; outcome = "yielded";
    events.push("You yield.");
  } else if (opts.flee) {
    if (["crit_success", "success", "partial"].includes(resolution.degree)) {
      s.status = "ended"; ended = true; outcome = "fled";
      events.push("You break away clean.");
    } else {
      const freeHit = cfg.fleeFailFreeHit ?? 1;
      deltas.health -= freeHit * (cfg.playerHealthPerHit ?? 4);
      events.push("The escape fails — you take a hit breaking off.");
    }
  } else {
    const m = cfg.margins?.[resolution.degree] || { opponent: 0, player: 0 };
    if (m.opponent) {
      s.opponentHealth = Math.max(0, s.opponentHealth + m.opponent);
      events.push(`You land ${-m.opponent} hit${m.opponent < -1 ? "s" : ""}.`);
    }
    if (m.player) {
      deltas.health += m.player * (cfg.playerHealthPerHit ?? 4);
      events.push(`You take ${-m.player} hit${m.player < -1 ? "s" : ""}.`);
    }
    if (s.opponentHealth <= 0) {
      s.status = "ended"; ended = true; outcome = "opponent_fell";
      events.push(`${def.opponent.name} goes down.`);
    } else if (s.opponentHealth <= (def.opponent.yieldAt ?? 0)) {
      s.status = "ended"; ended = true; outcome = "opponent_yielded";
      events.push(`${def.opponent.name} yields.`);
    }
  }
  s.log = [...state.log, `r${state.round}: ${resolution.degree}${opts.flee ? " (flee)" : ""}${opts.yield ? " (yield)" : ""} → ${events.join(" ")}`].slice(-12);
  return { state: s, deltas, events, ended, outcome };
}

/** SNG-098: ONE round of a skill-battle-typed duel. The player declares {function,tier,attribute,intensity};
 *  the engine picks the opponent's move (opponentPolicy) and resolves BOTH rolls (battleRound), then maps the
 *  contest onto the same duel lifecycle: the momentum meter filling / a crushing blow / exhaustion ENDS it,
 *  mapping to the familiar outcomes (opponent_fell/opponent_yielded/yielded/fled/player_overcome/stalemate).
 *  yield & flee reuse the classic exits. The returned `opponent` receipt is the TRUE round — the caller gates
 *  its display with senseOpponent (fog). Never advances beyond a resolution the engine actually computed. */
/** ⛔ DUEL_pell_vs_veth §C.1 — THE CRAFT NEVER REACHED A LIVE ROUND. `sbDeclare` and `sbDeclFromSel` build a bare
 *  `{function, tier, attribute, intensity, name, rank, id}`; `battleSkillsFor` builds the same for a person. Every
 *  reader in the damage block — `mechanicFor` for the dice, `authoredBlock` for imposes / pierce / penetration /
 *  the per-rank harmRung — reads the DECLARATION, and found nothing: family-default dice by tier, no impositions,
 *  pierce 0, for every craft in every fight. ⚠️ The gates were green because every test spreads the def under
 *  the decl (`playerDecl: { ...gs, function, tier, rank }`). This is that contract, applied once, at the one
 *  seam both sides pass through. The declaration's own fields win over the def's, so a chosen rank, intensity
 *  or effective energy cost is never overwritten by the catalogue; `functions` is dropped because a decl names
 *  ONE function and the plural would shadow it in `resolvedDamageType`. A decl with no `id`, or an id the
 *  catalogue does not carry (`_strike`, `_guard`, an item move), comes back untouched. */
export function enrichDecl(decl, abilities) {
  if (!decl || !abilities) return decl;
  const id = decl.id || decl.abilityId || null;
  const def = id ? abilities[id] : null;
  if (!def) return decl;
  const { functions: _fns, ...body } = def;
  const out = { ...body, ...decl, abilityId: def.id };
  if (decl.woven) out.woven = enrichDecl(decl.woven, abilities);
  return out;
}

export function skillBattleRound(state, def, playerDecl, { character, rules, sb, steps, seenTendency = null, rng = Math.random, flee = false, yield: doYield = false, fleeResolution = null,
  // CCODE-45: the TURN options must be ACCEPTED here and FORWARDED below. This wrapper hand-builds its call to
  // battleRound, so an option it does not name is silently dropped — which is exactly how the sense step ran as a
  // normal action round the first time (the SECOND time this seam has bitten; see seam_battle_round_options).
  // CCODE-253: the companion/NPC DEFS, so `targetableAllies` can resolve a roster stored as ids. ⚠️ ACCEPTED
  // AND FORWARDED — the failure this seam keeps repeating is an option accepted at the top and dropped below,
  // or (my version) used below and never accepted at all.
  content = null,
  phase = "action", tickEffects = true, setupBonus = 0 } = {}) {
  const cfg = rules.encounters?.duel || {};
  // SNG-247 Tier 3: a PUZZLE promoted onto the contest engine has no `opponent` block — the thing itself is the
  // other side. Normalized once, here, so every `def.opponent.name` below reads "the sealed door" instead of
  // throwing. One line at the door beats guarding five call sites inside.
  if (!def.opponent) def = { ...def, opponent: { name: def.name || "the thing", health: 5, yieldAt: 0 } };
  if (doYield) return { state: { ...state, status: "ended" }, ended: true, outcome: "yielded", deltas: { health: 0, energy: 0 }, events: ["You yield the contest."], player: null, opponent: null };
  if (flee) { // break away — reuse the classic flee check on an injected resolution
    const clean = fleeResolution && ["crit_success", "success", "partial"].includes(fleeResolution.degree);
    if (clean) return { state: { ...state, status: "ended" }, ended: true, outcome: "fled", deltas: { health: 0, energy: 0 }, events: ["You break away clean."], player: null, opponent: null };
    return { state, ended: false, outcome: null, deltas: { health: -(cfg.fleeFailFreeHit ?? 1) * (cfg.playerHealthPerHit ?? 4), energy: 0 }, events: ["The escape fails — you take a hit breaking off."], player: null, opponent: null };
  }
  const oppSheet = state.opponentSheet;
  // ⛔ DUEL_pell_vs_veth §C.1 — the def under BOTH declarations, here, where both pass. See `enrichDecl`.
  const abilities = content?.abilities || null;
  playerDecl = enrichDecl(playerDecl, abilities);
  const oppDecl = enrichDecl(opponentPolicy(oppSheet, state, seenTendency, sb), abilities);
  const before = character.energy ?? 0;
  // ⛔ CCODE-253 — DERIVED HERE, NEVER PASSED IN, because this wrapper's own comment (three lines down)
  // records that it has silently eaten a forwarded option TWICE. I made it three: CCODE-250 gave
  // `battleRound` an `allies` seat and no caller filled it, so `chooseTarget` returned null on every round
  // in the game and the whole targeting mechanism was unreachable from play while its gates stayed green.
  // ⚠️ A companion who cannot fight is still TARGETABLE — that is `targetableAllies`, not `actingAllies`,
  // and the difference is the entire reason interception is worth having.
  // ⛔ CCODE-274 — THE CHARACTER'S OWN REGISTRY MUST BE IN THE LOOKUP. Company members like Pell and Veth
  // live in `character.npcRegistry`, NOT in content — they were met in play. Passing only `content.npcs`
  // resolved none of them, so the whole party came back as raw ids ("pell", "veth-ondra") and every
  // name-derived read — leans, martial-by-occupation, the receipt — was working from nothing.
  // ⚠️ CONTENT FIRST, REGISTRY SECOND: what the player has actually learned about someone beats the
  // authored stub, which is the same precedence `sheetFor` already uses for an authored sheet.
  const npcLookup = { ...(content?.npcs || {}), ...(character?.npcRegistry || {}) };
  // ⛔ THE FULL ROSTER, not the targetable slice — `alliesOf` includes the withdrawn, and `targetableAllies`
  // is exactly the filter that removes them. Deriving the party split from the filtered list made the
  // `withdrawn` array on the receipt permanently empty: a list that can never populate.
  const partyAll = alliesOf(character, {
    companions: content?.companions || {}, npcs: npcLookup, company: character?.company || null,
    stageOf: (itemId) => { try { return currentStage(itemId, character, content?.items || {})?.stage ?? null; } catch { return null; } } });
  const partyPresent = targetableAllies(character, {
    companions: content?.companions || {}, npcs: npcLookup, company: character?.company || null,
    // ⛔ CCODE-265 — THE WORLD'S ANSWER TO "what stage is that item at". Without it a companion whose
    // `canStrike: false` is liftable by an earned item can never actually lift it in a real fight, and the
    // override would be a field with a reader and no caller — this project's signature defect, one level up.
    stageOf: (itemId) => { try { return currentStage(itemId, character, content?.items || {})?.stage ?? null; } catch { return null; } } });
  // ⛔ CCODE-274 — THE FORWARD/FOLDED SPLIT, DERIVED HERE. How many you can lead is EARNED
  // (`commandSlots`: level + presence + renown, capped at Erik's goal of 3), and WHICH of them come forward
  // is the player's pick, carried on the encounter state so a swap persists between rounds.
  // ⚠️ DERIVED, NEVER PASSED IN — this wrapper's own rule, after it silently ate a forwarded option three
  // times. The character already knows their level, their presence and who they chose.
  const lead = commandSlots(character, { cfg: rules?.melee || {}, renownBand: state.renownBand || null });

  // ⛔ CCODE-277 / ERIK — WHAT SCALES ARE IN PLAY, AND WHETHER THIS IS A CONTEST AT ALL.
  // "every encounter could have 1, some or all of the types of battle... 1 v army isn't a contest, but the
  // encounter scenario would drive the details."
  // ⚠️ THE SCENARIO DECIDES. `theatres` is authored on the encounter; an unauthored one derives a single
  // theatre from the headcount, so every existing encounter behaves exactly as it does today.
  const yourScale = partyPresent.length > 3 ? "unit" : partyPresent.length > 1 ? "party" : "individual";
  const openTheatres = theatresOf(def, { round: state.round || 1,
    allyCount: partyPresent.length, foeCount: 1 }).filter(t => t.open !== false);
  // ⛔ THE HEAVIEST OPEN THEATRE IS THE ONE THAT DECIDES. A duel inside a legion battle is still a legion
  // battle you are standing in — the duel is the part you PLAY, and the legion is the part that can kill
  // you regardless of how the duel goes.
  const heaviest = openTheatres.reduce((w, t) => (scaleRank(t.scale) > scaleRank(w?.scale || "individual") ? t : w), null);
  const over = heaviest ? overmatchOf(yourScale, heaviest.scale, { cfg: rules?.melee || {} }) : null;
  // ⚠️ WHAT THE CHARACTER IS HOLDING THAT COULD ANSWER IT — Erik's two, read from what they actually have
  // rather than assumed. `scaleAnswer` is unauthored on every craft today, so this finds nothing until
  // content says otherwise: reader before field, and the wall stays real in the meantime.
  const answer = over?.overmatched ? answersOvermatch(over, {
    powers: (character.abilities || []).map(a => content?.abilities?.[a.abilityId]).filter(Boolean),
    ground: state.preparedGround || [] }) : null;
  const split = partyAll.length > 1
    ? bringForward(partyAll, { chosen: state.broughtForward || null, slots: lead.slots })
    : null;
  const r = battleRound({
    playerDecl, oppDecl,
    // ⚠️ THE FOLDED FIGHT WITHOUT BEING NARRATED. Erik: "you only have so much focus."
    folded: split ? split.folded : null,
    // one ally means "just you", and `chooseTarget` returns the lone-target case — byte-identical to before.
    allies: partyPresent.length > 1 ? partyPresent : null,
    protections: state.protections || null,
    // ⛔ CCODE-315 — THE CLASS TABLE, so a craft that requires a SELF has something to be answered by.
    // ⚠️ Passed rather than looked up inside the round: `battleRound` has no content handle, and giving it
    // one for this would be a bigger seam than the rule is worth.
    creatureClasses: content?.bestiary?.classes || null,
    // ⛔ CCODE-316 — WHO THE MENDING IS FOR. Erik: "the intent is to be able to heal anyone you want."
    healTarget: state.healTarget || null,
    // ⛔ DUEL_pell_vs_veth §C.5 — THE PLAYER SEAT CARRIED NO LEVEL AND NO SOAK. `scaling.perLevel × wielder.level`
    // was 0 for the player every time, and `defenderSheet.soak` read undefined — the PC's armour never soaked a blow
    // in a fight. Level and health come from the character; `soak` reads a field nothing writes yet (reader before
    // field — an armour writer lands on it the day one exists), so it is 0 today and byte-identical.
    playerSheet: { attributes: character.attributes || {}, subAttributes: character.subAttributes || {}, alignment: character.alignment || {}, skills: character.skills || {}, energy: before,
      level: Number(character.level) || 1, health: character.health, maxHealth: character.maxHealth, soak: Math.max(0, Number(character.soak) || 0) },
    // CCODE-35: `effects` must ride BOTH ways — into the round (they modify this roll) and back out onto the
    // encounter state (they persist). This hand-built state object is the seam where they would silently drop.
    // CCODE-35/38: `effects` and `pressure` must ride BOTH ways — into the round (they modify this roll / carry the
    // count) and back out onto the encounter state. This hand-built state object is the seam where they'd drop.
    oppSheet, state: { momentum: state.momentum || 0, round: state.round, playerEnergy: before, opponentEnergy: state.opponentEnergy ?? oppSheet.energy,
      // CCODE-51: health rides BOTH ways, like effects and pressure before it — the same seam, the fourth time.
      opponentHealth: state.opponentHealth ?? def.opponent?.health ?? null, effects: state.effects || [], pressure: state.pressure || { player: 0, opponent: 0 },
      // ⛔ CCODE-255 — THE FIFTH VALUE TO RIDE BOTH WAYS THROUGH THIS SEAM (effects, pressure, health, then
      // this). How well the foe read YOUR side is EARNED in the sense step and SPENT in the action step, so
      // it has to come back in on the very next call or the read it just made is forgotten before it is used.
      // ⚠️ `?? null` IS LOAD-BEARING: null means "no read has happened", which the round treats as PERFECT
      // knowledge — today's behaviour, and what keeps every non-adopting caller unchanged.
      foeReadTier: state.foeReadTier ?? null }, rules, sb, steps, rng,
    phase, tickEffects, setupBonus,
    // SNG-247: DERIVED here, never passed in. This wrapper has now silently eaten a forwarded option twice
    // (CCODE-35 `effects`, CCODE-45 `phase`) — a value the wrapper computes from what it already holds cannot be
    // dropped on the way in. `encounterKind(def)` is the same function the frame uses, so the exit rule and the
    // border colour can never disagree about what kind of thing you are in.
    kind: encounterKind(def) || "fight"
  });
  // CCODE-38: remember the foe's last verb so opponentPolicy's anti-repetition term has something to read —
  // without this write the "don't be a metronome" penalty never fires and the variety fix is inert.
  const senseOnly = phase === "sense" && sb?.turn?.senseMovesMomentum !== true; // CCODE-45: a sense is part of the turn, not a round of its own
  // CCODE-48 (Erik): a ROUND is a TURN, not a step. Sense never advanced it; now action/bonus only advance it on
  // the step that ENDS the turn (the same signal that ticks effects), so "round 3" means three turns, not six steps.
  const s = { ...state, round: state.round + ((senseOnly || !tickEffects) ? 0 : 1), momentum: r.state.momentum, opponentEnergy: r.state.opponentEnergy, opponentHealth: r.state.opponentHealth ?? state.opponentHealth, effects: r.state.effects || [], pressure: r.state.pressure || { player: 0, opponent: 0 }, spent: r.state.spent || { player: false, opponent: false }, lastOppFn: oppDecl.function,
    // ⛔ CCODE-255: and back out, so the action step of this turn spends the read the sense step just earned.
    foeReadTier: r.foeReadTier ?? state.foeReadTier ?? null,
    // ⛔ CCODE-277 — THE SCALES RIDE ON STATE, NOT ONLY ON THE RECEIPT. The panel renders from the ENCOUNTER
    // STATE; a value that exists only on the round's return is invisible to it, which is the seam that has
    // eaten a value five times in this file and would have eaten this one too — the banner would have been
    // written, correct, and blank.
    theatres: openTheatres.map(t => ({ scale: t.scale, who: t.who, why: t.why || null })),
    yourScale,
    ...(over?.overmatched ? { overmatch: { ...over, answer } } : { overmatch: null }),
    ...(over?.hard ? { outweighed: over } : { outweighed: null }) };
  // SNG-247 Tier 3 (Erik's per-kind weighting: "a puzzle's sense step is the whole game — insight IS the meter"):
  // on a sealed thing, WINNING THE READ buys a layer of understanding. That is what makes a puzzle play differently
  // from a fight on the same engine rather than being a reskin of it — and it keeps the hint ladder the authored
  // puzzles already carry, instead of replacing it with a second progress mechanic.
  const senseBoughtALayer = phase === "sense" && state.hintsRevealed != null && r.player?.margin > (r.opponent?.margin ?? 0);
  if (senseBoughtALayer) s.hintsRevealed = Math.min((def.hintTiers || []).length || Infinity, (state.hintsRevealed || 0) + 1);
  // ⛔ CCODE-277 — "NO ROLL WINS THIS" HAS TO BE TRUE, NOT A LABEL. Erik: "1 v army isn't a contest."
  // A banner saying so above a round that resolves normally would let a player beat an army by rolling
  // well, which is the thing he ruled out — and it is exactly how a warning becomes decoration.
  // ⚠️ SO AN UNANSWERED OVERMATCH FLOORS WHAT YOU LAND ON IT. Not zero: you can still hurt something, you
  // simply cannot BEAT it, and zeroing the number would read as a bug rather than as a wall.
  // ⛔ AND IT IS LIFTED THE MOMENT IT IS ANSWERED — a big enough power or prepared ground makes the fight a
  // fight again. That is the whole point: the answer is to change the situation, never to roll harder.
  if (over?.overmatched && answer && !answer.answered && r.damage?.side === "opponent") {
    const keep = Math.max(0, Number(rules?.melee?.overmatchedDamageKept ?? 0.15));
    const was = Number(r.damage.amount) || 0;
    r.damage = { ...r.damage, amount: Math.max(0, Math.round(was * keep)), overmatched: { was, kept: keep,
      why: over.why } };
  }
  const deltas = { health: 0, energy: r.state.playerEnergy - before }; // the player's own energy attrition (<= 0)
  const events = []; let ended = false, outcome = null;
  if (senseBoughtALayer && s.hintsRevealed > (state.hintsRevealed || 0)) events.push("A layer gives — you understand it better than you did.");
  // SNG-247 (AEVI-247-AUTHOR): a STATIC antagonist gets Aevi's degree VOICE — "a piece gives — you feel the thing
  // loosen toward you" rather than a foe's win/loss line. Her whole ruling for this kind is that a sealed thing
  // YIELDS to being understood and never fights, so the round has to say that in its own register. Wired here
  // rather than merged as content-with-no-reader: an authored voice nothing prints is the inert class again.
  if (r.opponent?.static) {
    const band = { crit_success: "crit", success: "success", partial: "partial", failure: "failure", crit_failure: "failure" }[r.opponent.degree];
    const line = sb?.staticAntagonist?.degreeVoice?.[band];
    if (line) events.push(line);
  }
  // SNG-247 Tier 2a: the ENDING is per-kind too. A standoff does not "break" and a chase does not "fall", and —
  // the part that matters mechanically — losing a standoff must not cost BLOOD. `outcomes.losingCostsHealth:
  // false` is the ruling that a contest of wills cannot hurt you; being pressed until someone draws is a MORPH
  // into a fight, a different mechanic entirely. Outcome CODES are unchanged so the XP map and every downstream
  // reader keep working; only the prose and the toll are kind-shaped.
  const kOut = ((sb?.kinds || {})[encounterKind(def) || "fight"] || {}).outcomes || {};
  const say = (t, fb) => (t ? String(t).replace(/\{them\}/g, def.opponent.name) : fb);
  if (r.resolved === "player") {
    s.status = "ended"; ended = true;
    // CCODE-51: a foe that is DOWN has fallen; one driven off by pressure while still standing has yielded. The old
    // line asked only "does this def have a yieldAt", so every contest reported "yields" — including one you won by
    // putting them down, which is why Erik could not find the kill.
    const hpLeft = s.opponentHealth;
    outcome = (hpLeft != null && hpLeft <= 0 && (def.opponent.yieldAt ?? 0) <= 0) ? "opponent_fell"
      : (hpLeft != null && hpLeft <= 0) ? "opponent_yielded"
      : (def.opponent.yieldAt ?? 0) > 0 ? "opponent_yielded" : "opponent_fell";
    events.push(say(outcome === "opponent_yielded" ? kOut.opponentYields : kOut.opponentBreaks,
      `You prevail — ${def.opponent.name} ${outcome === "opponent_yielded" ? "yields" : "breaks"}.`));
  }
  else if (r.resolved === "opponent") {
    s.status = "ended"; ended = true; outcome = "player_overcome";
    if (kOut.losingCostsHealth !== false) deltas.health -= (cfg.playerHealthPerHit ?? 4);
    events.push(say(kOut.playerOvercome, `${def.opponent.name} overwhelms you.`));
  }
  else if (r.resolved === "stalemate") { s.status = "ended"; ended = true; outcome = "stalemate"; events.push("Both of you are spent — it ends unresolved."); }
  else events.push(r.roundWinner === "player" ? "You press the advantage." : r.roundWinner === "opponent" ? "You give ground." : "Neither gains an inch.");
  // CCODE-39: running dry is a STATE the player must be told about — their crafts stopped answering, and yielding
  // (or an energy item) is now a CHOICE in front of them rather than an ending the engine imposed.
  // CCODE-51: a landed blow is EVENT-VISIBLE. A hit the player cannot see is the same failure as a modifier they
  // cannot see — "the strike didn't seem to land" was true, and also unreported when it did.
  if (r.damage) {
    const hpLeft = s.opponentHealth, of = def.opponent?.health;
    if (r.damage.side === "opponent") events.push(`Your ${r.damage.by} LANDS — ${def.opponent.name} takes ${r.damage.amount}${of ? ` (${Math.max(0, hpLeft)}/${of} left)` : ""}.`);
    else { deltas.health -= r.damage.amount; events.push(`${def.opponent.name}'s ${r.damage.by} LANDS on you — ${r.damage.amount} taken.`); }
  }
  // ⛔ CCODE-237 (Aevi's §0) — A HEAL REACHES A SHEET. `battleRound` has computed `healing` since CCODE-207
  // and read the authored dice correctly the whole time — `dawn_surgery` rolls its 3d4 and reports 12 —
  // and NOTHING CONSUMED IT. `deltas.health` started at 0 and the heal never entered it, so 57 healing
  // crafts mended nobody. Exactly the shape of `imposed`, one file over, found the same way.
  //
  // ⚠️ THE SIGN IS THE POINT AND IT IS THE MIRROR OF THE DAMAGE BLOCK ABOVE: a heal on the PLAYER raises
  // `deltas.health`; a heal on the OPPONENT raises their pool. Getting that backwards would make every
  // mending craft a weapon, which is the one failure a healing branch must not have.
  if (r.healing && r.healing.amount > 0) {
    if (r.healing.side === "player") {
      deltas.health += r.healing.amount;
      events.push(`Your ${r.healing.by} MENDS — ${r.healing.amount} back.`);
    } else {
      const cap = def.opponent?.health ?? null;
      s.opponentHealth = cap == null ? (s.opponentHealth ?? 0) + r.healing.amount
        : Math.min(cap, (s.opponentHealth ?? cap) + r.healing.amount);
      events.push(`${def.opponent.name}'s ${r.healing.by} MENDS — ${r.healing.amount} back.`);
    }
  }
  if (r.degraded?.player) events.push("You are spent — your crafts will not answer. Steel and wit still will.");
  if (r.degraded?.opponent) events.push(`${def.opponent.name} is spent — swinging on will alone now.`);
  // CCODE-38: a PRESSURE event — the meter filled, so someone was driven back hard. Real attrition, not an ending.
  // SNG-247: what a tick COSTS and what it is CALLED are both per-kind content now — a chase takes your wind, a
  // standoff your composure, a fight your blood. The player's energy loss rides in deltas alongside the health.
  if (r.pressureEvent) {
    // The label is a per-side CLAUSE, not one phrase bent into two slots — "they open the gap" and "you lose
    // ground" are not the same sentence with the subject swapped. `{them}` interpolates the other side's name.
    const pl = r.pressureEvent.label || {};
    const say = (s, fallback) => (s ? String(s).replace(/\{them\}/g, def.opponent.name) : fallback);
    if (r.pressureEvent.side === "player") {
      deltas.health -= r.pressureEvent.healthLoss || 0;
      deltas.energy -= r.pressureEvent.energyLoss || 0;
      events.push(say(pl.player, `${def.opponent.name} drives you back hard — you give ground but you are still standing.`));
    } else {
      events.push(say(pl.opponent, `You drive ${def.opponent.name} back hard — they are shaken, but not done.`));
    }
  }
  s.log = [...(state.log || []), `r${state.round}: ${playerDecl.function} vs ${oppDecl.function} → momentum ${Math.round(s.momentum)}${outcome ? " — " + outcome : ""}`].slice(-12);
  return { state: s, player: r.player, opponent: r.opponent, oppDecl, ended, outcome, deltas, events, roundWinner: r.roundWinner, effects: r.effects || [], landed: r.landed || [], pressure: r.pressure, pressureEvent: r.pressureEvent, spent: r.spent, degraded: r.degraded, setupBonus: r.setupBonus, bonusEarned: r.bonusEarned, senseTier: r.senseTier, senseResist: r.senseResist, damage: r.damage,
    // ⛔ CCODE-228 — THE FIFTH THROUGH EIGHTH THING THIS SEAM HAS EATEN. The comment above this wrapper already
    // names `effects`, `pressure`, `phase` and `health` as values it silently dropped. `imposed`, `inflicted`,
    // `opened` and `deniedAct` were the next four: `battleRound` computes an imposition on EVERY round, and
    // because this hand-built return did not list it, Aevi's 14 imposing crafts landed on nobody and
    // `character.conditions` was never written by anything, anywhere.
    // ⚠️ THE LIST IS NOT THE FIX — a hand-kept list is what failed eight times. The fix is the gate below it
    // in smoke.mjs, which DERIVES the key set from what `battleRound` actually returns and fails on any key
    // this wrapper drops. A ninth omission now goes red instead of shipping green.
    imposed: r.imposed, inflicted: r.inflicted, opened: r.opened, deniedAct: r.deniedAct,
    // ⚠️ AND TWO MORE THE DERIVED GATE FOUND THAT I DID NOT KNOW ABOUT: the contested sense slot's
    // `senseGap` and `senseBonus` (CCODE-211/213) were dropped here too. Ten values, not eight — which is
    // the argument for deriving the expectation instead of extending a list by hand each time.
    senseGap: r.senseGap, senseBonus: r.senseBonus,
    // ⚠️ AND THE ELEVENTH. `foeReadTier` (CCODE-255) is how well the foe read YOUR side, and it is the one
    // value here that must also RIDE FORWARD onto state — it is earned in the sense step and spent in the
    // action step of the same turn, so a wrapper that merely reports it has still dropped it.
    foeReadTier: r.foeReadTier,
    // ⛔ THE UI OWES THE PICKING AND THE ENGINE OWES A STABLE ANSWER TO "who is forward". Erik: "this needs
    // to be a UI pick." Without this on the receipt there is nothing for that control to bind to.
    // ⛔ THE SCALES ON THE RECEIPT, so the UI can say what this actually is before the player commits.
    ...(openTheatres.length ? { theatres: openTheatres.map(t => ({ scale: t.scale, who: t.who, why: t.why || null })),
      yourScale, ...(over?.overmatched ? { overmatch: { ...over, answer } } : over?.hard ? { outweighed: over } : {}) } : {}),
    ...(split ? { party: { forward: split.forward.map(a => ({ id: a.id, name: a.name })),
      folded: split.folded.map(a => ({ id: a.id, name: a.name })),
      withdrawn: split.withdrawn.map(a => ({ id: a.id, name: a.name, manner: a.withdrawal?.manner || null })),
      slots: lead.slots, capped: lead.capped, why: split.why } } : {}),
    // ⚠️ AND THE CCODE-228 GATE CAUGHT THESE TWO ON ITS FIRST OUTING — `unsettled` and `cooled` are the
    // provoke/soothe results, added minutes earlier, and the wrapper dropped them exactly the way it has
    // dropped ten values before. The derived gate went red the same run. That is the whole argument for
    // deriving it rather than maintaining this list by hand.
    unsettled: r.unsettled, cooled: r.cooled,
    healing: r.healing };
}

/** Player incapacitation check (app calls after applying deltas). */
export function checkIncapacitation(character) {
  // ⛔ CCODE-208 / SNG-500 §2: health is not the only road down. A craft may IMPOSE unconsciousness
  // (`craftmechanics.resolveImposition`), and a check that only reads health would let someone Keening put
  // on the floor keep taking turns — the state existing is not the same as the state being consulted.
  // ⚠️ IMPOSED, NEVER FATAL. A craft can put you here; what happens to you here is the incapacitation
  // table's call, weighed against the aggressor's kind. See §40.
  if (character?.health <= 0) return "incapacitated";
  const c = String(character?.condition || "").toLowerCase();
  if (c === "unconscious" || c === "incapacitated") return "incapacitated";
  return null;
}

// ---------- challenge ----------

export function challengeStage(state, def, resolution, rules, opts = {}) {
  const cfg = rules.encounters?.challenge || {};
  const stage = def.stages[state.stageIndex];
  const s = { ...state, round: state.round + 1 };
  const deltas = { health: 0, energy: 0 };
  const events = [];
  let ended = false, outcome = null, hours = 0;

  if (opts.abandon) {
    s.status = "ended"; ended = true; outcome = "abandoned";
    events.push("You back off the attempt.");
  } else {
    const cost = { ...(cfg.defaultFailureCost || {}), ...(stage?.failureCost || {}) };
    const applyCost = (mult = 1) => {
      deltas.health -= (cost.health || 0) * mult;
      deltas.energy -= (cost.energy || 0) * mult;
      hours += (cost.hours || 0) * mult;
    };
    if (["crit_success", "success"].includes(resolution.degree)) {
      s.stagesDone = [...state.stagesDone, stage.name];
      s.stageIndex = state.stageIndex + 1;
      events.push(`Stage clear: ${stage.name}.`);
    } else if (resolution.degree === "partial") {
      applyCost(1);
      s.stagesDone = [...state.stagesDone, stage.name];
      s.stageIndex = state.stageIndex + 1;
      events.push(`Stage clear at a cost: ${stage.name}.`);
    } else {
      applyCost(resolution.degree === "crit_failure" ? (cfg.critFailureMultiplier ?? 2) : 1);
      events.push(`Stage holds you back: ${stage.name} — it costs you, but you can try again.`);
    }
    if (s.stageIndex >= def.stages.length) {
      s.status = "ended"; ended = true; outcome = "completed";
      events.push("The way is beaten.");
    }
  }
  s.log = [...state.log, `r${state.round}: ${resolution?.degree ?? "abandon"} @ ${stage?.name ?? "-"} → ${events.join(" ")}`].slice(-12);
  return { state: s, deltas, events, ended, outcome, hours };
}

// ---------- puzzle ----------

/** Hints unlock through the sense filter: attunement tier gates how much you're told. */
export function puzzleHints(def, senseTier) {
  return (def.hintTiers || []).slice(0, Math.max(0, Math.min(senseTier, (def.hintTiers || []).length)));
}

/** A codex-known topic can open a solution path (reduced difficulty choice). */
export function puzzleUnlocks(def, character) {
  const topics = character.codex?.topics || {};
  return (def.codexUnlocks || []).filter(u => topics[u.topic]);
}

export function puzzleAttempt(state, def, resolution, rules, opts = {}) {
  const cfg = rules.encounters?.puzzle || {};
  const s = { ...state, round: state.round + 1, attempts: state.attempts + 1 };
  const deltas = { health: 0, energy: -(cfg.attemptEnergy ?? 4) };
  const events = [];
  let ended = false, outcome = null;
  const hours = cfg.attemptHours ?? 1;

  if (opts.walkAway) {
    s.status = "ended"; ended = true; outcome = "walked_away"; s.attempts = state.attempts;
    events.push("You leave it unsolved — for now.");
  } else if (["crit_success", "success"].includes(resolution.degree)) {
    s.status = "ended"; s.solved = true; ended = true; outcome = "solved";
    events.push("It gives — the mechanism yields its answer.");
  } else if (resolution.degree === "partial") {
    s.hintsRevealed = Math.min((def.hintTiers || []).length, state.hintsRevealed + 1);
    events.push("Not solved — but you understand it better now.");
  } else {
    events.push("The attempt teaches you only what doesn't work.");
  }
  s.log = [...state.log, `r${state.round}: ${resolution?.degree ?? "walk"} (attempt ${s.attempts}) → ${events.join(" ")}`].slice(-12);
  return { state: s, deltas, events, ended, outcome, hours: opts.walkAway ? 0 : hours };
}

// ---------- GM integration ----------

/** Receipt block the GM narrates from — both sides' state, never editable by it. */
export function encounterReceiptForGM(state, def, resolution, roundResult) {
  const head = `ENCOUNTER — ${def.name} (${state.type}), round ${state.round}${state.status === "ended" ? " — ENDED: " + (roundResult?.outcome || "") : ""}`;
  let sides = "";
  // CCODE-53 (Erik: "this is a sealed door right? not a stranger with feet"). THIS LINE was the cause. It handed
  // the GM `Opponent: The Sealed Door — 5/5 hits. Opponent style: …` — a combatant with a hit track and a fighting
  // style — so the GM narrated a person: planted feet, a warding stance, a half-step back, "the two of you stand
  // in the cold mud." It did exactly what it was told. The receipt is per-KIND now, and for an unopposed thing it
  // opens by saying what the thing is NOT, because that is the instruction the GM was missing.
  const kind = encounterKind(def) || "fight";
  if (state.type === "duel" || state.mode === "skill_battle") {
    const who = def.opponent?.name || def.name || "it";
    const hp = state.opponentHealth != null && def.opponent?.health
      ? ` — ${Math.max(0, state.opponentHealth)}/${def.opponent.health}` : "";
    if (kind === "puzzle") {
      sides = `THE SEALED THING: ${who}${hp} of its resistance left. Understanding gained: ${state.hintsRevealed ?? 0} of ${(def.hintTiers || []).length} layers.
IT IS NOT A PERSON. It has no stance, no footing, no face, no intent, and it does not attack — it RESISTS, the same way, every time. Narrate the character working it: what they try, what the thing gives, what it withholds. Never give it a body, a gaze, or a reaction to being looked at.`;
    } else if (kind === "chase") {
      sides = `THE PURSUIT: ${who}${hp} of their wind left. This is GROUND and BREATH, not blades — narrate distance, footing, lungs, the route. Nobody is trading blows.`;
    } else if (kind === "standoff") {
      sides = `THE STANDOFF: ${who}${hp} of their certainty left. This is a contest of WILL — narrate what is said, what is held back, what shifts behind the eyes. NOBODY IS HURT: no weapon lands and no blood is drawn unless this becomes a fight.`;
    } else {
      sides = `Opponent: ${who}${hp} hits${state.tactic ? `, current tactic: ${state.tactic}` : ""}. Opponent style: ${(def.opponent?.tacticTags || []).join(", ")}.`;
    }
  }
  // CCODE-53: the CLASSIC-path lines only fire when the kind-shaped receipt above did NOT produce one. Otherwise a
  // puzzle on the contest engine had its "it is not a person" instruction silently overwritten by the old attempts
  // line — which is this same bug, one layer deeper, and is why the first fix didn't take.
  if (!sides && state.type === "challenge") sides = `Progress: ${state.stagesDone.length}/${def.stages.length} stages (next: ${def.stages[state.stageIndex]?.name || "done"}).`;
  if (!sides && state.type === "puzzle") sides = `Attempts: ${state.attempts}. Understanding gained: ${state.hintsRevealed} of ${(def.hintTiers || []).length} layers.`;
  const events = roundResult?.events?.length ? `This round: ${roundResult.events.join(" ")}` : "";
  // SNG-230 §6b/§7a: a FINISHER attempt — narrate the one-beat COLLAPSE, or the botched finisher MORPH (it
  // hardens; the thing knows you tried). The mechanical state already moved; this only shapes the narration.
  const fin = resolution?.collapse;
  const finLine = !fin ? "" : fin.result === "collapse"
    ? `\nFINISHER LANDED: ${fin.craft || "a decisive craft"} ended this in ONE beat — narrate a single decisive ${fin.mode === "escape" ? "escape (you slip away clean)" : fin.mode === "solve" ? "solving stroke (it opens at once)" : "finishing stroke, fast and hard"}.`
    : fin.result === "warded" // §7b: a ward FORBADE the instant-end — the strike landed but the one-beat kill was structurally off the table
    ? `\nFINISHER WARDED: ${fin.craft || "the finisher"} struck true, but ${fin.ward || "a ward"} FORBADE the instant-end — the one-beat kill simply did not happen (it is not that it resisted; it could not apply). It may have done ordinary harm, but you must beat it down the hard way.`
    : `\nFINISHER WHIFFED: ${fin.craft || "the finisher"} tried to END this and MISSED — narrate the encounter HARDENING (it knows you tried to finish it; you're exposed${fin.result === "morph_bad" ? ", badly — a dangerous opening left wide" : ""}). It is NOT over.`;
  // §7c: the player's KIT VOIDED the challenge's premise — it was never their obstacle. A narrated walk-around.
  const tv = resolution?.trivialize;
  const tvLine = !tv ? "" : `\nPREMISE VOIDED: ${tv.craft || "the character's kit"} makes ${tv.premise ? `"${tv.premise}"` : "this obstacle"} a non-issue — narrate a ${tv.mode === "opposed" ? "decisive bypass earned against real resistance" : "frictionless walk-around (their kit makes nothing of it)"}, then it is done. Do NOT grind the stages.`;
  return `${head}\n${sides}\n${events}${finLine}${tvLine}\nNarrate this receipt exactly — do not move health, stages, or hints yourself. Offer choices that fit the encounter (attack/press/defend, flee/yield/abandon where sensible, ability and item uses).`;
}

/** GM encounter ops: narrative-flavor only, clamped. */
export function sanitizeEncounterOps(ops, def, state) {
  const out = [];
  for (const o of (Array.isArray(ops) ? ops : []).slice(0, 2)) {
    if (o?.op === "complication" && o.text && !state?.complicationUsed) {
      out.push({ op: "complication", text: smartClamp(String(o.text), 160) }); // SNG-152
      continue;
    }
    if (o?.op === "tactic" && o.tag && def?.opponent) {
      const tag = String(o.tag).slice(0, 40);
      if ((def.opponent.tacticTags || []).includes(tag) || (def.opponent.tacticTags || []).length === 0) {
        out.push({ op: "tactic", tag });
      }
    }
  }
  return out;
}

export function applyEncounterOps(state, ops) {
  for (const o of ops) {
    if (o.op === "tactic") state.tactic = o.tag;
    if (o.op === "complication") { state.complication = o.text; state.complicationUsed = true; }
  }
  return state;
}

/** GM-invented duel (rule 18 amended): engine-clamped stat block, duels only. */
export function sanitizeNewEncounter(raw) {
  if (!raw || raw.type !== "duel" || !raw.name || !raw.opponent?.name) return null;
  const o = raw.opponent;
  return { schemaVersion: 1, id: "gm-" + String(raw.id || raw.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30),
    type: "duel", name: String(raw.name).slice(0, 60), setup: smartClamp(String(raw.setup || ""), 400), // SNG-152: GM-invented setup is MODEL prose (pack-authored setups never pass here)
    // ⛔ CCODE-262 — `flavor` WAS DROPPED HERE AND THAT MADE ONE WHOLE FRAME UNREACHABLE. A duel's FLAVOR is
    // what decides its kind (`encounterKind`: blades → fight, ground → chase, resolve → standoff), and this
    // constructor never carried it — so every GM-minted encounter was a `fight` by omission.
    // ⚠️ THE STANDOFF FRAME HAS A TITLE, A WIN CONDITION, A METER LABEL AND AN EXIT RULE IN `collapseMode`,
    // AND NOTHING IN THE GAME COULD EVER PRODUCE ONE. `chase` is minted by `chaseFromFight`, so it survived
    // this gap by having a second door; `standoff` had only this one, and it was closed.
    // ⛔ WHITELISTED, NEVER PASSED THROUGH. An unknown flavor from model output would silently become a kind
    // with no exit rule, which is worse than being a fight.
    ...(["standoff", "chase"].includes(String(raw.flavor || "")) ? { flavor: String(raw.flavor) } : {}),
    lethal: !!raw.lethal,
    opponent: { name: String(o.name).slice(0, 60), health: Math.max(2, Math.min(8, o.health | 0 || 4)),
      threat: Math.max(10, Math.min(70, o.threat | 0 || 35)), yieldAt: Math.max(0, Math.min(3, o.yieldAt | 0)),
      fleeDifficulty: Math.max(0, Math.min(30, o.fleeDifficulty | 0 || 15)),
      tacticTags: (Array.isArray(o.tacticTags) ? o.tacticTags : []).slice(0, 4).map(t => String(t).slice(0, 30)),
      // SNG-098: optional AUTHORED skill sheet — a set-piece opponent can carry real, tradition-specific
      // skills; absent, the engine synthesizes a modest sheet from threat + tacticTags. Clamped.
      ...(Array.isArray(o.skills) && o.skills.length ? { skills: o.skills.slice(0, 5).map(s => ({
        function: String(s.function || "strike").slice(0, 20), name: String(s.name || s.function || "a skill").slice(0, 40),
        tier: Math.max(1, Math.min(5, s.tier | 0 || 1)), attribute: String(s.attribute || "practical").slice(0, 12) })) } : {}) } };
}

/** SNG-322 — THE BAND DECIDES, NOT A HAND-SET FLAG. Aevi's threat ladder (`rules.threat`) carries `lethal`
 *  and `warn` per band, and it was authored onto 62 encounters — while nothing in the engine read
 *  `rules.threat` at all, so `def.lethal` was still hand-set on exactly 2 defs. That is CCODE-52's whole
 *  point and it was the sixth writer/reader miss of the week.
 *
 *  ⚠️ `def.threat` IS A BAND ID (a string), NOT `def.opponent.threat` (a 10–70 difficulty number). Two
 *  different things share the word; this reads only the band ladder and never the number.
 *
 *  ⛔ AND THE BAND DOES NOT SAY WHETHER YOU CAN DIE. Aevi's own guard, kept here because it is the thing a
 *  reader will get wrong: you can die in ANY band. The band says how likely you are to LOSE; `aggressorKind`
 *  says what happens when you do. A `trivial` assassin will still finish you. */
export function threatBandOf(def, rules = {}) {
  const id = typeof def?.threat === "string" ? def.threat : null;
  if (!id) return null;
  return (rules?.threat?.bands || []).find(b => b?.id === id) || null;
}

/** Is this encounter one the player must be WARNED about and allowed to decline?
 *  `def.lethal` still wins when set — an author may always mark a specific thing — but the band is what
 *  decides it at scale. */
export function isLethalEncounter(def, rules = {}) {
  if (def?.lethal === true) return true;
  const band = threatBandOf(def, rules);
  return !!(band && (band.lethal === true || band.warn === true));
}

/** SNG-002b (ratified): a lethal encounter is always OFFERED, never imposed.
 *  Clamps a GM choice list: any choice starting a lethal encounter is marked,
 *  never trivial, and a guaranteed decline choice is appended if missing. */
export function lethalOfferClamp(choices, catalog = {}, rules = {}) {
  const out = [...(choices || [])];
  let lethalOffered = false;
  for (const c of out) {
    const def = c?.encounterId ? catalog[c.encounterId] : null;
    if (def && isLethalEncounter(def, rules)) {
      lethalOffered = true;
      c.trivial = false; // entry must be an explicit, informed choice
      // ⚠️ THE WARNING IS ABOUT ODDS, NOT ABOUT DEATH — Aevi's line, and the band names carry it. Saying
      // "lethal stakes" on `grave` while `fair` says nothing implies the even match cannot kill you, which
      // is false and is exactly the misreading her rewrite was for. So the label names the BAND.
      const band = threatBandOf(def, rules);
      const say = band?.name ? band.name.toLowerCase() : "lethal stakes";
      if (!/lethal|deadly|kill|weaker|even match|stronger|beyond/i.test(c.label || "")) c.label = `⚠ ${c.label} (${say})`;
    }
  }
  const hasDecline = out.some(c => !c.encounterId && /decline|refuse|back away|walk away|leave|avoid/i.test(c.label || ""));
  if (lethalOffered && !hasDecline) {
    out.push({ label: "Decline — back away from this", attribute: "practical", subAttribute: "wits", axes: {}, difficulty: 0, intentTags: ["careful", "retreat"], trivial: true });
  }
  return out;
}
