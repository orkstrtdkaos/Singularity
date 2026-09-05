// tests/lib/realgame.mjs — A FIGHT THE WAY THE GAME PLAYS IT, headless.
//
// ⛔ ERIK 2026-09-05: "I want our test harnesses to simulate the real game as much as possible so we can get it right."
//
// `fightharness.oneFight` and the duel runner called `battleRound` directly with a hand-built seat: no sense step, no
// bonus action, no items, no guards, no conditions, no incapacitation table, no XP — and a person as the opponent was
// hand-assembled rather than taken through `escalateToFight`. Two defects lived in that gap (engine/battle_turn.js).
//
// This harness drives THE SAME FUNCTIONS app.js drives, in the same order: `duelFromTarget` to start the fight the way a
// player's violence starts it, `battleSkillsForCharacter` for the menu the panel would show, `declFromSelection` for the
// declaration a click would make, `playTurn` twice per turn (the sense, then the action and the bonus it may have earned —
// the app's two calls), `endBattle` for XP and the incapacitation table. A policy stands in for the player's hand; it is a
// documented stand-in, not a claim about how players play.
import { battleSkillsForCharacter, declFromSelection, duelFromTarget, playTurn, endBattle } from "../../engine/battle_turn.js";
import { sheetFor, battleSkillsFor } from "../../engine/npcsheet.js";
import { mulberry32 } from "./fightharness.mjs";

/** A CHARACTER built from a person's record — the shape `finish()` in app.js creates, with the person's sheet in it.
 *  Their kit becomes `abilities[]` at the ranks the sheet gives them, so the menu, the ranks and the death save's tier term
 *  read them the way they read a player. */
export function characterFromPerson(rec, { catalog = {}, cfg = {}, day = 1, id = null } = {}) {
  const sheet = sheetFor(rec, { day, cfg });
  const { skills } = battleSkillsFor(rec, { catalog, day, cfg });
  const seen = new Map();
  for (const m of skills) if (m?.id && catalog[m.id] && !seen.has(m.id)) seen.set(m.id, Math.max(1, Number(m.rank) || 1));
  return {
    schemaVersion: 1, id: id || `pc-${rec.id || "person"}`, name: sheet.name || rec.name, origin: null, background: null,
    level: sheet.level, xp: 0,
    attributes: { ...(sheet.attributes || {}) }, subAttributes: { ...(sheet.subAttributes || {}) }, skills: {},
    abilities: [...seen].map(([abilityId, level]) => ({ abilityId, level })),
    alignment: {}, attunement: 1,
    maxHealth: sheet.maxHealth ?? sheet.health, health: sheet.health, maxEnergy: sheet.maxEnergy ?? sheet.energy, energy: sheet.energy,
    soak: sheet.soak || 0,
    inventory: [], purse: { crystal: 0 }, deeds: [], relationships: {}, chronicle: [], conditions: [],
    currentLocationId: rec.homeLocation || null, activeScene: null, clock: { day, hour: 8 },
    companions: [], companionNames: {}, quests: [], npcRegistry: {}, placeMemory: {}, customEncounters: {}, worldState: {},
    domains: null, schools: {},
  };
}

/** The stand-in hand. Sense on the first turn and every fourth; press with the sharpest affordable harm craft, surge when
 *  well ahead, guard when badly behind, drink when spent and there is something to drink. Deterministic under `rng`. */
export function simplePlayerPolicy({ rng = Math.random, meterMax = 16 } = {}) {
  return (skills, { turnIndex, character, state }) => {
    const mom = state?.momentum ?? 0;
    const energy = character.energy ?? 0, maxE = character.maxEnergy ?? 100;
    const cost = (s) => Number(s.energyCost ?? (s.id?.startsWith("_") ? 0 : 5)) || 0;
    const harm = skills.filter(s => ["strike", "break"].includes(s.function) && !s.itemMove);
    const guards = skills.filter(s => ["shield", "ward"].includes(s.function) && !s.itemMove);
    const senses = skills.filter(s => s.function === "reveal");
    const drinks = skills.filter(s => s.itemMove && s.itemMove.mode === "drink");
    const affordable = (list) => list.filter(s => cost(s) <= energy);
    const best = (list) => { const a = affordable(list); if (!a.length) return null; const top = Math.max(...a.map(s => s.tier || 1)); const pool = a.filter(s => (s.tier || 1) === top); return pool[Math.floor(rng() * pool.length)]; };
    const sense = (turnIndex === 0 || turnIndex % 4 === 0) && senses.length ? senses[0] : null;
    let action;
    if (energy < maxE * 0.2 && drinks.length) action = drinks[0];
    else if (mom <= -meterMax / 2 && guards.length && turnIndex % 2 === 0) action = best(guards) || best(harm);
    else action = best(harm) || skills.find(s => s.id === "_strike");
    const bonus = mom < 0 ? (best(guards) || best(harm)) : (best(harm) || best(guards));
    const intensity = mom >= meterMax / 2 && energy > maxE * 0.4 ? "surge" : "standard";
    return { sense, action, bonus, intensity };
  };
}

/** One duel, the way the game plays it. Returns { outcome, turns, transcript, plan, character, def }. */
export function playDuel({ character, target, content, rng = Math.random, policy = null, maxTurns = 40, day = 1 } = {}) {
  const rules = content.rules, sb = content.skillBattle?.engine, steps = content.intensity?.steps, catalog = { ...(content.abilities || {}), ...(character.customAbilities || {}) };
  const pick = policy || simplePlayerPolicy({ rng, meterMax: sb?.momentum?.meterMax ?? 16 });
  const { def } = duelFromTarget(character, target, { catalog, npcs: content.npcs || {}, cfg: rules?.npcStanding || {}, day, sb, here: null, lethal: false });
  const transcript = [];
  let outcome = null, ended = false, turns = 0, lastFn = null;
  for (let t = 0; t < maxTurns && !ended; t++) {
    turns++;
    const skills = battleSkillsForCharacter(character, { catalog, rules, sb });
    const state = character.activeEncounter?.state;
    const choice = pick(skills, { turnIndex: t, character, state });
    const mk = (s) => (s ? declFromSelection([s], skills, choice.intensity || "standard", { character, sb }) : null);
    let turnState = null;
    if (choice.sense) {
      const r1 = playTurn(character, def, { sense: mk(choice.sense), content, rules, sb, steps, rng, day, seenTendency: lastFn, catalog });
      turnState = r1.turn;
      transcript.push({ turn: t + 1, step: "sense", decl: choice.sense.name, degree: r1.rr?.player?.degree || null, setupBonus: r1.turn.setupBonus, bonusEarned: r1.turn.bonusEarned });
    }
    const r2 = playTurn(character, def, { action: mk(choice.action), bonus: mk(choice.bonus), intensity: choice.intensity, content, rules, sb, steps, rng, day, seenTendency: lastFn, catalog, turnState });
    lastFn = r2.lastPlayerFn || lastFn;
    for (const rec of r2.receipts) {
      const rr = rec.rr;
      transcript.push({ turn: t + 1, step: rec.label, decl: rec.decl?.name, theirs: rr.oppDecl?.name || null, winner: rr.roundWinner || null,
        momentum: Math.round((rr.state?.momentum ?? 0) * 10) / 10, damage: rr.damage ? { side: rr.damage.side, amount: rr.damage.amount, by: rr.damage.by, slain: !!rr.damage.slain } : null,
        deathSave: rr.deathSave ? { by: rr.deathSave.by, kill: rr.deathSave.kill } : null, pressure: rr.pressureEvent ? { side: rr.pressureEvent.side } : null,
        hp: character.health, oppHp: rr.state?.opponentHealth ?? null, energy: character.energy });
    }
    ended = r2.ended; outcome = r2.outcome;
  }
  if (!ended) outcome = "cap";
  const end = ended ? endBattle(character, { outcome, def, rules, content, catalog, rng, worldDay: day }) : { xp: 0, plan: null };
  return { outcome, turns, transcript, plan: end.plan, xp: end.xp, character, def };
}

export { mulberry32 };
