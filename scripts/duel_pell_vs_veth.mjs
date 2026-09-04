// scripts/duel_pell_vs_veth.mjs — po/DUEL_pell_vs_veth.md: Aevi ruled this duel by hand; this runs it through the REAL
// resolver (battleRound) with the live sheets, seeded, so the two readings can disagree on the record.
// Run: node scripts/duel_pell_vs_veth.mjs   (deterministic; seed 7 for the scripted rounds, 2000 seeds for the batch)
import { loadContentHeadless } from "../tests/headless_content.mjs";
import * as NS from "../engine/npcsheet.js";
import { battleRound, synthesizeOpponentSheet, opponentPolicy } from "../engine/skill_battle.js";
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

// PLAYER seat = what encounters.js passes (attributes, subAttributes, alignment, skills, energy) — no level, no health, no soak ride in play.
// We add health so the harness can apply damage, and we test BOTH the play shape and a "full" shape for scaling/soak.
const playerSeat = (s, full) => ({ attributes: s.attributes, subAttributes: s.subAttributes, alignment: {}, skills: {}, energy: s.energy,
  ...(full ? { level: s.level, soak: s.soak, health: s.health, maxHealth: s.maxHealth } : {}) });
// OPPONENT seat = personOpponent → synthesizeOpponentSheet (authored override branch)
const oppSeat = (s, k) => synthesizeOpponentSheet({ name: s.name, attributes: s.attributes, health: s.health, energy: s.energy, soak: s.soak, skills: k, tacticTags: [], threat: Math.max(10, Math.round(s.level * 2)) }, sb);

const findMove = (kit, id, fn) => kit.find(m => m.id === id && (!fn || m.function === fn)) || kit.find(m => m.id === id);
let ENRICH = false;   // spread the craft DEF under the decl — the contract the smoke tests use; play does NOT
const decl = (kit, rec, id, fn, intensity, { asPlayer = false } = {}) => {
  const m = findMove(kit, id, fn); if (!m) throw new Error("no move " + id + "/" + fn);
  const owned = (rec.abilities || []).find(a => a.abilityId === id)?.level || 1;
  // ⚠️ IN PLAY the player's decl carries tier = OWNED RANK (playerBattleSkills: `tier: a.level`), the NPC's carries the CRAFT tier.
  const d = { function: m.function, tier: asPlayer ? owned : m.tier, rank: owned, attribute: m.attribute, intensity, name: m.name, id };
  return ENRICH ? { ...(C.abilities[id] || {}), ...d, functions: undefined } : d;
};
const enrichOpp = (od) => ENRICH && od?.id && C.abilities[od.id] ? { ...C.abilities[od.id], ...od, functions: undefined } : od;

console.log("\n=== Veth as the OPPONENT seat (personOpponent → synthesizeOpponentSheet): soak vs soakLayers");
{ const o = oppSeat(vethSheet, vethKit); console.log("authored soak", vethSheet.soak, "→ oppSheet.soak", o.soak, "| soakLayers", JSON.stringify(o.soakLayers), "(the damage block prefers layers when present)"); }

function runScript(seed, { fullPlayer = false, log = true } = {}) {
  const rng = mulberry32(seed);
  const pS = playerSeat(pellSheet, fullPlayer), oS = oppSeat(vethSheet, vethKit);
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
    const pd = s ? decl(pellKit, pellRec, s[1][0], s[1][1], s[1][2], { asPlayer: true })
      : (() => { const harm = pellKit.filter(m => ["strike", "break"].includes(m.function)); const m = harm[Math.floor(rng() * harm.length)]; return decl(pellKit, pellRec, m.id, m.function, "standard", { asPlayer: true }); })();
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
      winner: rr.roundWinner, mom: `${before}→${rr.state.momentum}`, en: `V${rr.state.opponentEnergy} P${rr.state.playerEnergy}`,
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

console.log("\n=== AEVI'S SIX ROUNDS AS DECLARED, THEN ENGINE POLICY TO RESOLUTION (seed 7, play shape: player decl tier = owned rank) ===");
const t7 = runScript(7);
console.log("ended:", t7[t7.length - 1].resolved || "cap", "after", t7.length, "rounds");

// ── the tier-vs-rank asymmetry, measured on one blow ──
console.log("\n=== keystone_blow damage: player-seat tier=owned rank(1) vs craft tier(4) — 3000 landed hits each ===");
for (const t of [1, 4]) {
  let sum = 0, n = 0; const rng = mulberry32(99);
  for (let i = 0; i < 3000; i++) {
    const pd = { function: "break", tier: t, rank: 1, attribute: "practical", intensity: "standard", name: "Keystone Blow", id: "keystone_blow" };
    const od = { function: "shield", tier: 1, attribute: "physical", intensity: "conserve", name: "a raised guard" };
    const rr = battleRound({ playerDecl: pd, oppDecl: od, playerSheet: playerSeat(pellSheet, true), oppSheet: oppSeat(vethSheet, vethKit), state: { momentum: 0, playerEnergy: 40, opponentEnergy: 40, effects: [], pressure: { player: 0, opponent: 0 }, opponentHealth: 99 }, rules, sb, steps, rng });
    if (rr.damage?.side === "opponent") { sum += rr.damage.amount; n++; }
  }
  console.log(`tier ${t}: mean landed ${(sum / n).toFixed(1)} over ${n} hits (of 3000 rounds)`);
}

// ── who actually wins: engine policy both sides, N seeds ──
console.log("\n=== 2000 seeded duels, engine policy both sides (Pell = player seat, random harm/guard; Veth = opponentPolicy) ===");
function runFree(seed, fullPlayer) {
  const rng = mulberry32(seed);
  const pS = playerSeat(pellSheet, fullPlayer), oS = oppSeat(vethSheet, vethKit);
  let state = { round: 1, momentum: 0, playerEnergy: pellSheet.energy, opponentEnergy: oS.energy, effects: [], pressure: { player: 0, opponent: 0 }, opponentHealth: oS.health };
  let hp = pellSheet.health, rounds = 0, landedP = [], landedV = [];
  const pool = pellKit.filter(m => ["strike", "break", "shield", "ward"].includes(m.function));
  for (let i = 0; i < 60; i++) {
    const m = pool[Math.floor(rng() * pool.length)];
    const pd = decl(pellKit, pellRec, m.id, m.function, "standard", { asPlayer: true });
    const od = enrichOpp(opponentPolicy(oS, state, null, sb));
    const rr = battleRound({ playerDecl: pd, oppDecl: od, playerSheet: { ...pS, health: hp }, oppSheet: oS, state, rules, sb, steps, rng });
    if (rr.damage?.side === "player") { hp -= rr.damage.amount; landedV.push(rr.damage.amount); }
    if (rr.damage?.side === "opponent") landedP.push(rr.damage.amount);
    if (rr.pressureEvent?.side === "player") hp -= rr.pressureEvent.healthLoss ?? 3;
    state = rr.state; rounds++;
    if (rr.resolved || hp <= 0) return { won: rr.resolved === "player" && hp > 0, by: rr.resolved === "player" ? (state.opponentHealth <= 0 ? "health" : "pressure") : "pell down", rounds, landedP, landedV, enP: state.playerEnergy, enV: state.opponentEnergy };
  }
  return { won: false, by: "cap", rounds, landedP, landedV, enP: state.playerEnergy, enV: state.opponentEnergy };
}
for (const full of [false, true]) {
  let w = 0, byH = 0, byP = 0, cap = 0, rs = 0, lp = [], lv = [], spentP = 0, spentV = 0;
  for (let s = 1; s <= 2000; s++) { const r = runFree(s, full); if (r.won) { w++; if (r.by === "health") byH++; else byP++; } if (r.by === "cap") cap++; rs += r.rounds; lp.push(...r.landedP); lv.push(...r.landedV); if (r.enP <= 0) spentP++; if (r.enV <= 0) spentV++; }
  const mean = a => a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : "-";
  console.log(`${full ? "FULL player seat (level/soak ride)" : "PLAY player seat (no level/soak)"}: Pell wins ${(w / 20).toFixed(1)}% (by health ${byH}, by pressure ${byP}) · cap ${cap} · mean rounds ${(rs / 2000).toFixed(1)} · Pell's landed hit mean ${mean(lp)} · Veth's ${mean(lv)} · Pell spent-out in ${spentP}, Veth in ${spentV}`);
}

// ── the chance stack, round 1, both sides (what actually enters the d100) ──
{
  const rng = mulberry32(7);
  const pd = decl(pellKit, pellRec, "stonewise", "reveal", "conserve", { asPlayer: true });
  const od = decl(vethKit, vethRec, "soul_stare", "hinder", "conserve");
  const rr = battleRound({ playerDecl: pd, oppDecl: od, playerSheet: playerSeat(pellSheet, false), oppSheet: oppSeat(vethSheet, vethKit), state: { momentum: 0, playerEnergy: 40, opponentEnergy: 40, effects: [], pressure: { player: 0, opponent: 0 }, opponentHealth: 99 }, rules, sb, steps, rng });
  const lines = (side) => (side.breakdown?.components || side.breakdown?.contestMods || []).map(c => `${c.label} ${c.value >= 0 ? "+" : ""}${c.value}`).join(" · ");
  console.log("\n=== ROUND-1 CHANCE STACKS (play shape)");
  console.log("Pell (stonewise r3 conserve):", lines(rr.player), "→ chance", rr.player.chance, "raw", rr.player.rawChance);
  console.log("Veth (soul_stare r2 conserve):", lines(rr.opponent), "→ chance", rr.opponent.chance, "raw", rr.opponent.rawChance);
}

// ── THE SAME DUEL WITH THE CRAFT DEF UNDER THE DECL (the contract the smoke tests use; play does not do this) ──
ENRICH = true;
console.log("\n=== ENRICHED: Aevi's six rounds with the craft def reaching the round (seed 7) ===");
const t7e = runScript(7);
console.log("ended:", t7e[t7e.length - 1].resolved || "cap", "after", t7e.length, "rounds");
console.log("\n=== ENRICHED: 2000 seeded duels, engine policy both sides ===");
for (const full of [false, true]) {
  let w = 0, byH = 0, byP = 0, cap = 0, rs = 0, lp = [], lv = [], spentP = 0, spentV = 0;
  for (let s = 1; s <= 2000; s++) { const r = runFree(s, full); if (r.won) { w++; if (r.by === "health") byH++; else byP++; } if (r.by === "cap") cap++; rs += r.rounds; lp.push(...r.landedP); lv.push(...r.landedV); if (r.enP <= 0) spentP++; if (r.enV <= 0) spentV++; }
  const mean = a => a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : "-";
  console.log(`${full ? "FULL player seat" : "PLAY player seat"}: Pell wins ${(w / 20).toFixed(1)}% (by health ${byH}, by pressure ${byP}) · cap ${cap} · mean rounds ${(rs / 2000).toFixed(1)} · Pell's landed hit mean ${mean(lp)} · Veth's ${mean(lv)} · Pell spent-out in ${spentP}, Veth in ${spentV}`);
}
