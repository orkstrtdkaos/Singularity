// encounters.js — typed multi-round structures: duels, challenges, puzzles.
// SNG-002. Encounters CONSUME the d100 resolution (the app rolls via resolve.js
// exactly as for any action); this module only maps receipts onto encounter
// state through data-driven tables. Design law 1 holds absolutely: the GM
// narrates round receipts and proposes choices — it never advances state.
// Incapacitation, never engine-imposed death.

// ---------- lifecycle ----------

export function startEncounter(def) {
  const base = { schemaVersion: 1, encounterId: def.id, type: def.type, status: "active", round: 1, log: [] };
  if (def.type === "duel") return { ...base, opponentHealth: def.opponent.health, tactic: null };
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
  return `${head}\n${sides}\n${events}\nNarrate this receipt exactly — do not move health, stages, or hints yourself. Offer choices that fit the encounter (attack/press/defend, flee/yield/abandon where sensible, ability and item uses).`;
}

/** GM encounter ops: narrative-flavor only, clamped. */
export function sanitizeEncounterOps(ops, def, state) {
  const out = [];
  for (const o of (Array.isArray(ops) ? ops : []).slice(0, 2)) {
    if (o?.op === "complication" && o.text && !state?.complicationUsed) {
      out.push({ op: "complication", text: String(o.text).slice(0, 120) });
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
    type: "duel", name: String(raw.name).slice(0, 60), setup: String(raw.setup || "").slice(0, 300),
    lethal: !!raw.lethal,
    opponent: { name: String(o.name).slice(0, 60), health: Math.max(2, Math.min(8, o.health | 0 || 4)),
      threat: Math.max(10, Math.min(70, o.threat | 0 || 35)), yieldAt: Math.max(0, Math.min(3, o.yieldAt | 0)),
      fleeDifficulty: Math.max(0, Math.min(30, o.fleeDifficulty | 0 || 15)),
      tacticTags: (Array.isArray(o.tacticTags) ? o.tacticTags : []).slice(0, 4).map(t => String(t).slice(0, 30)) } };
}
