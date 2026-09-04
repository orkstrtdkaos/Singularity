// scripts/duel_pell_vs_veth.mjs — po/DUEL_pell_vs_veth.md: Aevi ruled this duel by hand; this runs it through the REAL
// resolver (battleRound) with the live sheets, seeded, so the two readings can disagree on the record.
// Run: node scripts/duel_pell_vs_veth.mjs   (deterministic; seed 7 for the scripted rounds, 2000 seeds for the batch)
//
// ⛔ DUEL §C.1–C.5, BUILT (v1.9.344): the live seam (`skillBattleRound`) now puts the craft def under both declarations via
// `enrichDecl`, the player's `tier` is the craft's tier with the owned `rank` beside it, a round charges the craft's own
// energy cost, an authored soak becomes the layers the damage block reads, and the player seat carries level and a body.
// This runner mirrors that seam exactly so it measures the fight play actually runs — and keeps the pre-fix shape as a
// labelled comparison, because the difference IS the finding.
import { loadContentHeadless } from "../tests/headless_content.mjs";
import * as NS from "../engine/npcsheet.js";
import { battleRound, synthesizeOpponentSheet, opponentPolicy } from "../engine/skill_battle.js";
import { enrichDecl } from "../engine/encounters.js";
import { mulberry32 } from "../tests/lib/fightharness.mjs";

const C = await loadContentHeadless();
const cfg = C.rules.npcStanding, sb = C.skillBattle.engine, steps = C.intensity.steps, rules = C.rules;
const pellRec = C.npcs.pell, vethRec = C.npcs["veth-ondra"];

// ── the two sheets, exactly as play builds them ──
const sheetOf = (rec) => NS.sheetFor(rec, { cfg });
const kitOf = (rec) => NS.battleSkillsFor(rec, { catalog: C.abilities, cfg }).skills;
const pellSheet = sheetOf(pellRec), vethSheet = sheetOf(vethRec);
const pellKit = kitOf(pellRec), vethKit = kitOf(vethRec);
console.log("=== SHEETS (engine, npcsheet.sheetFor with resolution.npcStanding)");
for (const [n, s, k] of [["Pell", pellSheet, pellKit], ["Veth", vethSheet, vethKit]])
  console.log(n, "L" + s.level, "health", s.health, "energy", s.energy, "soak", s.soak, "attrs", JSON.stringify(s.attributes), "leans", JSON.stringify(s.leans), "| moves", k.length);

// PLAYER seat = what encounters.js passes since §C.5: attributes, subAttributes, energy, level, health, soak.
const playerSeat = (s) => ({ attributes: s.attributes, subAttributes: s.subAttributes, alignment: {}, skills: {}, energy: s.energy,
  level: s.level, soak: s.soak, health: s.health, maxHealth: s.maxHealth });
// OPPONENT seat = personOpponent → synthesizeOpponentSheet (authored override branch)
const oppSeat = (s, k) => synthesizeOpponentSheet({ name: s.name, attributes: s.attributes, health: s.health, energy: s.energy, soak: s.soak, skills: k, tacticTags: [], threat: Math.max(10, Math.round(s.level * 2)) }, sb);

const findMove = (kit, id, fn) => kit.find(m => m.id === id && (!fn || m.function === fn)) || kit.find(m => m.id === id);
// LIVE = the seam as built; PREFIX = the bare declaration play used to send (tier = owned rank, no def, no cost)
let LIVE = true;
const decl = (kit, rec, id, fn, intensity) => {
  const m = findMove(kit, id, fn); if (!m) throw new Error("no move " + id + "/" + fn);
  const owned = m.rank ?? 1;
  if (!LIVE) return { function: m.function, tier: owned, rank: owned, attribute: m.attribute, intensity, name: m.name, id };
  return enrichDecl({ function: m.function, tier: m.tier, rank: owned, attribute: m.attribute, intensity, name: m.name, id, energyCost: m.energyCost ?? null }, C.abilities);
};
const enrichOpp = (od) => LIVE ? enrichDecl(od, C.abilities) : od;

console.log("\n=== Veth as the OPPONENT seat (personOpponent → synthesizeOpponentSheet): soak vs soakLayers");
{ const o = oppSeat(vethSheet, vethKit); console.log("authored soak", vethSheet.soak, "→ oppSheet.soak", o.soak, "| soakLayers", JSON.stringify(o.soakLayers)); }

function runScript(seed, { log = true } = {}) {
  const rng = mulberry32(seed);
  const pS = playerSeat(pellSheet), oS = oppSeat(vethSheet, vethKit);
  let state = { round: 1, momentum: 0, playerEnergy: pellSheet.energy, opponentEnergy: oS.energy, effects: [], pressure: { player: 0, opponent: 0 }, opponentHealth: oS.health };
  let pellHP = pellSheet.health;
  // Aevi's six rounds, as declared, where each kit actually carries the craft
  const script = [
    [["soul_stare", "hinder", "conserve"], ["stonewise", "reveal", "conserve"]],
    [["grey_hand", "hinder", "standard"], ["plain_weight", "strike", "surge"]],
    [["hastened_grey", "strike", "surge"], ["keystone_blow", "break", "standard"]],
    [["the_cut_thread", "strike", "standard"], ["plain_weight", "strike", "surge"]],
    [["deathless", "resist", "surge"], ["sound_repair", "mend", "standard"]],
    [["wither", "break", "standard"], ["keystone_blow", "break", "standard"]],
  ];
  const trail = [];
  for (let i = 0; i < 40; i++) {
    const s = script[i];
    const pd = s ? decl(pellKit, pellRec, s[1][0], s[1][1], s[1][2])
      : (() => { const harm = pellKit.filter(m => ["strike", "break"].includes(m.function)); const m = harm[Math.floor(rng() * harm.length)]; return decl(pellKit, pellRec, m.id, m.function, "standard"); })();
    const od = s ? decl(vethKit, vethRec, s[0][0], s[0][1], s[0][2]) : enrichOpp(opponentPolicy(oS, state, null, sb));
    const before = state.momentum;
    const rr = battleRound({ playerDecl: pd, oppDecl: od, playerSheet: { ...pS, health: pellHP }, oppSheet: oS, state, rules, sb, steps, rng, phase: "action", tickEffects: true });
    if (rr.damage?.side === "player") pellHP -= rr.damage.amount || 0;
    if (rr.healing?.side === "player") pellHP = Math.min(pellSheet.maxHealth, pellHP + (rr.healing.amount || 0));
    if (rr.pressureEvent?.side === "player") pellHP -= rr.pressureEvent.healthLoss ?? 3;
    const P = rr.player, O = rr.opponent;
    const row = {
      rd: i + 1, veth: `${od.name} r${od.rank ?? "?"} ${od.intensity}`, pell: `${pd.name} r${pd.rank} ${pd.intensity}`,
      vethRoll: O ? `${O.roll}/${O.chance} m${Math.round(O.margin)} ${O.degree}` : "?", pellRoll: P ? `${P.roll}/${P.chance} m${Math.round(P.margin)} ${P.degree}` : "?",
      winner: rr.roundWinner, mom: `${before}→${Math.round(rr.state.momentum * 10) / 10}`, en: `V${rr.state.opponentEnergy} P${rr.state.playerEnergy}`,
      dmg: rr.damage ? `${rr.damage.side} -${rr.damage.amount} by ${rr.damage.by}${rr.damage.rolled != null ? ` (rolled ${rr.damage.rolled}, soak ${rr.damage.soak})` : ""}${rr.damage.damageType ? " " + rr.damage.damageType : ""}` : "",
      heal: rr.healing ? `${rr.healing.side} +${rr.healing.amount} by ${rr.healing.by}` : "",
      imposed: rr.imposed ? (rr.imposed.refused ? `refused: ${rr.imposed.refused}` : `${rr.imposed.side} ${rr.imposed.condition}${rr.imposed.resisted ? " (resisted→degraded)" : ""} by ${rr.imposed.by}`) : "",
      pressure: rr.pressureEvent ? `${rr.pressureEvent.side} driven back (${rr.pressureEvent.pressure})` : "",
      hp: `V${rr.state.opponentHealth} P${pellHP}`, resolved: rr.resolved || (pellHP <= 0 ? "opponent (Pell down)" : ""),
    };
    trail.push(row);
    if (log) console.log(JSON.stringify(row));
    state = rr.state;
    if (rr.resolved || pellHP <= 0) break;
  }
  return trail;
}

function batch(label) {
  let w = 0, byH = 0, byP = 0, cap = 0, rs = 0, lp = [], lv = [], spentP = 0, spentV = 0, imposedN = 0;
  for (let seed = 1; seed <= 2000; seed++) {
    const rng = mulberry32(seed);
    const pS = playerSeat(pellSheet), oS = oppSeat(vethSheet, vethKit);
    let state = { round: 1, momentum: 0, playerEnergy: pellSheet.energy, opponentEnergy: oS.energy, effects: [], pressure: { player: 0, opponent: 0 }, opponentHealth: oS.health };
    let hp = pellSheet.health, rounds = 0, done = null;
    const pool = pellKit.filter(m => ["strike", "break", "shield", "ward"].includes(m.function));
    for (let i = 0; i < 60; i++) {
      const m = pool[Math.floor(rng() * pool.length)];
      const pd = decl(pellKit, pellRec, m.id, m.function, "standard");
      const od = enrichOpp(opponentPolicy(oS, state, null, sb));
      const rr = battleRound({ playerDecl: pd, oppDecl: od, playerSheet: { ...pS, health: hp }, oppSheet: oS, state, rules, sb, steps, rng });
      if (rr.damage?.side === "player") { hp -= rr.damage.amount; lv.push(rr.damage.amount); }
      if (rr.damage?.side === "opponent") lp.push(rr.damage.amount);
      if (rr.imposed && !rr.imposed.refused) imposedN++;
      if (rr.pressureEvent?.side === "player") hp -= rr.pressureEvent.healthLoss ?? 3;
      state = rr.state; rounds++;
      if (rr.resolved || hp <= 0) { done = rr.resolved === "player" && hp > 0 ? (state.opponentHealth <= 0 ? "health" : "pressure") : "pell down"; break; }
    }
    if (done === "health") { w++; byH++; } else if (done === "pressure") { w++; byP++; } else if (!done) cap++;
    rs += rounds; if (state.playerEnergy <= 0) spentP++; if (state.opponentEnergy <= 0) spentV++;
  }
  const mean = a => a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : "-";
  console.log(`${label}: Pell wins ${(w / 20).toFixed(1)}% (by health ${byH}, by pressure ${byP}) · cap ${cap} · mean rounds ${(rs / 2000).toFixed(1)} · Pell's landed hit mean ${mean(lp)} · Veth's ${mean(lv)} · impositions ${imposedN} · Pell spent-out in ${spentP}, Veth in ${spentV}`);
}

console.log("\n=== LIVE SEAM (as built): Aevi's six rounds as declared, then engine policy to resolution (seed 7) ===");
const t7 = runScript(7);
console.log("ended:", t7[t7.length - 1].resolved || "cap", "after", t7.length, "rounds");
console.log("\n=== LIVE SEAM: 2000 seeded duels, engine policy both sides ===");
batch("LIVE");

LIVE = false;
console.log("\n=== BEFORE THE FIX (bare declaration, tier = owned rank, flat 5 energy): the same six rounds (seed 7) ===");
const t7b = runScript(7, { log: false });
console.log("ended:", t7b[t7b.length - 1].resolved || "cap", "after", t7b.length, "rounds");
batch("BEFORE");
