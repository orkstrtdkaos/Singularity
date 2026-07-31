// encounters.js — typed multi-round structures: duels, challenges, puzzles.
// SNG-002. Encounters CONSUME the d100 resolution (the app rolls via resolve.js
// exactly as for any action); this module only maps receipts onto encounter
// state through data-driven tables. Design law 1 holds absolutely: the GM
// narrates round receipts and proposes choices — it never advances state.
// Incapacitation, never engine-imposed death.

import { battleRound, opponentPolicy } from "./skill_battle.js";
import { smartClamp } from "./namematch.js"; // SNG-152

// ---------- lifecycle ----------

export function startEncounter(def, { oppSheet = null } = {}) {
  const base = { schemaVersion: 1, encounterId: def.id, type: def.type, status: "active", round: 1, log: [] };
  if (def.type === "duel") {
    // SNG-098: when the app hands us a synthesized/authored opponent SHEET, this duel runs as a two-sided
    // SKILL BATTLE (momentum + attrition + fog); without a sheet it stays the classic single-margins duel.
    if (oppSheet) return { ...base, opponentHealth: def.opponent.health, tactic: null, mode: "skill_battle", opponentSheet: oppSheet, momentum: 0, opponentEnergy: oppSheet.energy ?? 40 };
    return { ...base, opponentHealth: def.opponent.health, tactic: null };
  }
  if (def.type === "challenge") return { ...base, stageIndex: 0, stagesDone: [] };
  if (def.type === "puzzle") return { ...base, attempts: 0, hintsRevealed: 0, solved: false };
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
export function skillBattleRound(state, def, playerDecl, { character, rules, sb, steps, seenTendency = null, rng = Math.random, flee = false, yield: doYield = false, fleeResolution = null,
  // CCODE-45: the TURN options must be ACCEPTED here and FORWARDED below. This wrapper hand-builds its call to
  // battleRound, so an option it does not name is silently dropped — which is exactly how the sense step ran as a
  // normal action round the first time (the SECOND time this seam has bitten; see seam_battle_round_options).
  phase = "action", tickEffects = true, setupBonus = 0 } = {}) {
  const cfg = rules.encounters?.duel || {};
  if (doYield) return { state: { ...state, status: "ended" }, ended: true, outcome: "yielded", deltas: { health: 0, energy: 0 }, events: ["You yield the contest."], player: null, opponent: null };
  if (flee) { // break away — reuse the classic flee check on an injected resolution
    const clean = fleeResolution && ["crit_success", "success", "partial"].includes(fleeResolution.degree);
    if (clean) return { state: { ...state, status: "ended" }, ended: true, outcome: "fled", deltas: { health: 0, energy: 0 }, events: ["You break away clean."], player: null, opponent: null };
    return { state, ended: false, outcome: null, deltas: { health: -(cfg.fleeFailFreeHit ?? 1) * (cfg.playerHealthPerHit ?? 4), energy: 0 }, events: ["The escape fails — you take a hit breaking off."], player: null, opponent: null };
  }
  const oppSheet = state.opponentSheet;
  const oppDecl = opponentPolicy(oppSheet, state, seenTendency, sb);
  const before = character.energy ?? 0;
  const r = battleRound({
    playerDecl, oppDecl,
    playerSheet: { attributes: character.attributes || {}, subAttributes: character.subAttributes || {}, alignment: character.alignment || {}, skills: character.skills || {}, energy: before },
    // CCODE-35: `effects` must ride BOTH ways — into the round (they modify this roll) and back out onto the
    // encounter state (they persist). This hand-built state object is the seam where they would silently drop.
    // CCODE-35/38: `effects` and `pressure` must ride BOTH ways — into the round (they modify this roll / carry the
    // count) and back out onto the encounter state. This hand-built state object is the seam where they'd drop.
    oppSheet, state: { momentum: state.momentum || 0, round: state.round, playerEnergy: before, opponentEnergy: state.opponentEnergy ?? oppSheet.energy, effects: state.effects || [], pressure: state.pressure || { player: 0, opponent: 0 } }, rules, sb, steps, rng,
    phase, tickEffects, setupBonus
  });
  // CCODE-38: remember the foe's last verb so opponentPolicy's anti-repetition term has something to read —
  // without this write the "don't be a metronome" penalty never fires and the variety fix is inert.
  const senseOnly = phase === "sense" && sb?.turn?.senseMovesMomentum !== true; // CCODE-45: a sense is part of the turn, not a round of its own
  const s = { ...state, round: state.round + (senseOnly ? 0 : 1), momentum: r.state.momentum, opponentEnergy: r.state.opponentEnergy, effects: r.state.effects || [], pressure: r.state.pressure || { player: 0, opponent: 0 }, spent: r.state.spent || { player: false, opponent: false }, lastOppFn: oppDecl.function };
  const deltas = { health: 0, energy: r.state.playerEnergy - before }; // the player's own energy attrition (<= 0)
  const events = []; let ended = false, outcome = null;
  if (r.resolved === "player") { s.status = "ended"; ended = true; outcome = (def.opponent.yieldAt ?? 0) > 0 ? "opponent_yielded" : "opponent_fell"; events.push(`You prevail — ${def.opponent.name} ${outcome === "opponent_yielded" ? "yields" : "breaks"}.`); }
  else if (r.resolved === "opponent") { s.status = "ended"; ended = true; outcome = "player_overcome"; deltas.health -= (cfg.playerHealthPerHit ?? 4); events.push(`${def.opponent.name} overwhelms you.`); }
  else if (r.resolved === "stalemate") { s.status = "ended"; ended = true; outcome = "stalemate"; events.push("Both of you are spent — it ends unresolved."); }
  else events.push(r.roundWinner === "player" ? "You press the advantage." : r.roundWinner === "opponent" ? "You give ground." : "Neither gains an inch.");
  // CCODE-39: running dry is a STATE the player must be told about — their crafts stopped answering, and yielding
  // (or an energy item) is now a CHOICE in front of them rather than an ending the engine imposed.
  if (r.degraded?.player) events.push("You are spent — your crafts will not answer. Steel and wit still will.");
  if (r.degraded?.opponent) events.push(`${def.opponent.name} is spent — swinging on will alone now.`);
  // CCODE-38: a PRESSURE event — the meter filled, so someone was driven back hard. Real attrition, not an ending.
  if (r.pressureEvent) {
    if (r.pressureEvent.side === "player") {
      deltas.health -= r.pressureEvent.healthLoss || 0;
      events.push(`${def.opponent.name} drives you back hard — you give ground but you are still standing.`);
    } else {
      events.push(`You drive ${def.opponent.name} back hard — they are shaken, but not done.`);
    }
  }
  s.log = [...(state.log || []), `r${state.round}: ${playerDecl.function} vs ${oppDecl.function} → momentum ${Math.round(s.momentum)}${outcome ? " — " + outcome : ""}`].slice(-12);
  return { state: s, player: r.player, opponent: r.opponent, oppDecl, ended, outcome, deltas, events, roundWinner: r.roundWinner, effects: r.effects || [], landed: r.landed || [], pressure: r.pressure, pressureEvent: r.pressureEvent, spent: r.spent, degraded: r.degraded, setupBonus: r.setupBonus, bonusEarned: r.bonusEarned };
}

/** Player incapacitation check (app calls after applying deltas). */
export function checkIncapacitation(character) {
  return character.health <= 0 ? "incapacitated" : null;
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
  if (state.type === "duel") sides = `Opponent: ${def.opponent.name} — ${Math.max(0, state.opponentHealth)}/${def.opponent.health} hits${state.tactic ? `, current tactic: ${state.tactic}` : ""}. Opponent style: ${(def.opponent.tacticTags || []).join(", ")}.`;
  if (state.type === "challenge") sides = `Progress: ${state.stagesDone.length}/${def.stages.length} stages (next: ${def.stages[state.stageIndex]?.name || "done"}).`;
  if (state.type === "puzzle") sides = `Attempts: ${state.attempts}. Understanding gained: ${state.hintsRevealed} of ${(def.hintTiers || []).length} layers.`;
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

/** SNG-002b (ratified): a lethal encounter is always OFFERED, never imposed.
 *  Clamps a GM choice list: any choice starting a lethal encounter is marked,
 *  never trivial, and a guaranteed decline choice is appended if missing. */
export function lethalOfferClamp(choices, catalog = {}) {
  const out = [...(choices || [])];
  let lethalOffered = false;
  for (const c of out) {
    const def = c?.encounterId ? catalog[c.encounterId] : null;
    if (def?.lethal) {
      lethalOffered = true;
      c.trivial = false; // entry must be an explicit, informed choice
      if (!/lethal|deadly|kill/i.test(c.label || "")) c.label = `⚠ ${c.label} (lethal stakes)`;
    }
  }
  const hasDecline = out.some(c => !c.encounterId && /decline|refuse|back away|walk away|leave|avoid/i.test(c.label || ""));
  if (lethalOffered && !hasDecline) {
    out.push({ label: "Decline — back away from this", attribute: "practical", subAttribute: "wits", axes: {}, difficulty: 0, intentTags: ["careful", "retreat"], trivial: true });
  }
  return out;
}
