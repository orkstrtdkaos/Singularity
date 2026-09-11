// scripts/damage_sweep.mjs — SPEC_damage_make_it_vary §2: ONE HARNESS, ANY DIAL, THE NUMBER THAT MATTERS.
//
// Erik: "Spec it for code to vary." · "I want to tune the battle inputs to have them resolve better."
//
// Runs REAL fights on the production path (battleSkillsForCharacter → declFromSelection → playTurn — the same
// loop `encounter_matrix.mjs` uses, so its 87% is reproducible here) with one dial moved through a range, and
// reports, per variant:
//   · ends%        — the number that matters. FINDING_matrix_rerun: win% == ends% in 12 of 17; 87% hit the cap
//   · win%, capped%, stalled%, mean rounds, and HOW the ended fights ended (health / break / player down)
//   · mean damage per landed hit BY TIER, and the branch that made each hit (dice / flat, with the reason)
//     and the POPULATION it came from (§6: authored dice / ladder dice) — so a dial says which crafts it moved
//   · the same fight from the FOE's side — its hits on the player, their mean, health the player lost
//
// USAGE
//   node scripts/damage_sweep.mjs                                   baseline, everything shipped
//   node scripts/damage_sweep.mjs --vary damage.perMarginPoint --range 0.06,0.2,0.35
//   node scripts/damage_sweep.mjs --vary craftMechanics.tierLadder.5.dice.plus --range 8,12,16
//   node scripts/damage_sweep.mjs --vary momentum.pressure.breakAtMax --range 0,6,8,10
//   node scripts/damage_sweep.mjs --vary maxRounds --range 14,20,30        (the harness cap, not an engine dial)
//   --set a.b=1,c.d=2   apply fixed dials under every variant (to combine)
//   --fights N          samples per craft × encounter (default 5)      --all   the whole craft menu, not the panel
//   --encounter <id>    one encounter                                   --level L --hp H   the sweeper's body
//   --json <path>       write the report
//   --match peer|+10    the player's level relative to each foe (foe level = threat × 0.5); --body npc|sweeper
//   --policy greedy     play like a person: best sense, best harm craft, weave, surge, finisher, a weapon
//   --domain Death|all  the kit is one domain's traditions (+ baseline); --levels 5,20,50,100 synthesizes peers
//   --foes people       fight the authored roster at their level with their real kits
//   --foe greedy        the foe weaves and surges too (default: the game's opponentPolicy)
//   --kit bought|all    a level-L person's purchases (tier bands, skill points, ranks) — default under greedy
//
// DIAL PATHS: `craftMechanics.…` and `npcStanding.…` read rules.* (the ladder, family defaults, rankDeltas; the foe's health pool);
// `maxRounds` is this harness's cap; everything else is `skillBattle.engine.…` (damage, momentum.pressure, …).
// A dial that does not exist at that path is an error, not a silent no-op — the failure this project keeps finding.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadContentHeadless } from "../tests/headless_content.mjs";
import { battleSkillsForCharacter, declFromSelection, playTurn } from "../engine/battle_turn.js";
import { startEncounter, contestSheetFor } from "../engine/encounters.js";
import { synthesizeDuelDef } from "../engine/random_encounters.js";
import { finishOdds } from "../engine/skill_battle.js";
import { mechanicFor } from "../engine/craftmechanics.js";
import { personOpponentFor } from "../engine/battle_turn.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const flag = (k, d = null) => argv.includes(k) ? argv[argv.indexOf(k) + 1] : d;
const VARY = flag("--vary");
const RANGE = VARY ? String(flag("--range", "")).split(",").filter(Boolean).map(parseVal) : [null];
const SET = String(flag("--set", "")).split(",").filter(Boolean).map(kv => { const [k, v] = kv.split("="); return [k, parseVal(v)]; });
const FIGHTS = Number(flag("--fights", 5));
const ONLY = flag("--encounter");
const ALL = argv.includes("--all");
const LEVEL = Number(flag("--level", 12)), HP = Number(flag("--hp", 80));
const OUT = flag("--json");
// ⛔ ERIK 2026-09-11: "fights should be 10 rounds ± 5 when fighting something at or within a level or 2 of you —
// across the board. If you are 10 levels higher in a 1-1 fight it should be very trivial. Breaking for a win
// should be 30% to 15% of the time." `--match` sets the player's level RELATIVE TO EACH FOE; `--body npc`
// builds the player by the foe's own formula so a peer fight is symmetric by construction.
const MATCH = flag("--match");                 // "peer" | "+10" | "-3" …  (null = fixed --level)
const BODY = flag("--body", MATCH ? "npc" : "sweeper");
const TARGET = { lo: 5, hi: 15, breakLo: 0.15, breakHi: 0.30 };
// ⛔ ERIK 2026-09-11: "real people try for every advantage and want to hit as hard as they can."
const POLICY = flag("--policy", "panel");          // "panel" (one craft a round, standard) | "greedy" (a person)
const DOMAIN = flag("--domain");                   // a domain name, or "all" to run every domain in turn
const LEVELS = flag("--levels") ? String(flag("--levels")).split(",").map(Number).filter(Number.isFinite) : null;
const FOES = flag("--foes", LEVELS ? "synth" : "encounters");   // "encounters" | "synth" | "people"
const RESERVE = Number(flag("--reserve", 0.2));
const FOE_POLICY = flag("--foe", "policy");        // "policy" (the game's opponentPolicy) | "greedy" (weave + surge like a person)
const KIT = flag("--kit", POLICY === "greedy" ? "bought" : "all");   // "bought": a level-L person's purchases | "all": everything
const DEBUG = argv.includes("--debug");
const NO_FINISHER = argv.includes("--no-finisher");   // a person who never attempts the insta-kill, for comparison
// ⛔ R35: a LETHAL-rung craft rolls the death save on every landed hit — the engine's, not this harness's. `--no-lethal`
// buys a kit without lethal/atrocity crafts, so an ATTRITION fight can be measured beside a killing one.
const NO_LETHAL = argv.includes("--no-lethal");    // the share of max energy a person keeps back before surging / weaving
let MAX_ROUNDS = 14;                       // the matrix's cap — "a fight longer than this is the finding"
const STALL_AT = 4;
function parseVal(v) { if (v === "null") return null; if (v === "true") return true; if (v === "false") return false; const n = Number(v); return Number.isFinite(n) && v !== "" ? n : v; }

const CONTENT = await loadContentHeadless();
const clone = (o) => JSON.parse(JSON.stringify(o));

/** Set a dotted path on the cloned config. ⛔ THE PATH MUST ALREADY EXIST (or be a new key on an existing
 *  object): a typo'd dial silently doing nothing is exactly the class of failure the sweep exists to catch. */
function applyDial(cfg, path, value) {
  if (path === "maxRounds") { MAX_ROUNDS = Number(value); return "harness"; }
  const parts = path.split(".");
  let root_, label;
  if (parts[0] === "craftMechanics" || parts[0] === "npcStanding") { root_ = cfg.rules[parts[0]]; label = `rules.${parts[0]}`; parts.shift(); }
  else { root_ = cfg.sb; label = "skillBattle.engine"; }
  let o = root_;
  for (let i = 0; i < parts.length - 1; i++) {
    if (o == null || typeof o !== "object" || !(parts[i] in o)) throw new Error(`dial path not found: ${label}.${path} (at "${parts[i]}")`);
    o = o[parts[i]];
  }
  const leaf = parts[parts.length - 1];
  if (o == null || typeof o !== "object") throw new Error(`dial path not found: ${label}.${path}`);
  o[leaf] = value;
  return label;
}

function makeRng(seed) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return (s % 100000) / 100000; }; }
const hash = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

/** The matrix's sweeper: a capable mid character who owns every craft. `--level` and `--hp` move the body. */
/** The player's body at `level`, by the FOE'S OWN FORMULA: pool from npcStanding, attributes from the synthesis
 *  curve at threat = level × 2. Symmetric by construction — the only asymmetry left in a peer fight is the craft. */
function npcBody(level, cfg) {
  const st = cfg.rules.npcStanding || {}, syn = cfg.sb.opponentSheetSynthesis || {};
  const threat = level * 2;
  const curve = (v, knee) => (v <= knee ? v : knee + Math.pow(v - knee, syn.aboveKneeExponent ?? 0.75));
  const attr = Math.max(syn.attributeFloor ?? 2, Math.round(curve(threat * (syn.threatToAttribute ?? 0.08), syn.attributeKnee ?? 6)));
  const hp = Math.max(1, Math.round((Number(st.healthBase) || 30) + level * (Number(st.healthPerLevel) || 5)));
  const en = Math.max(1, Math.round((Number(st.energyBase) || 100) + level * (Number(st.energyPerLevel) || 5)));
  return { level, attr, hp, en };
}
const DOMAIN_OF = CONTENT.traditionIndex?.domainOfTrad || {};
const DOMAINS = [...new Set(Object.values(DOMAIN_OF))].sort();
/** The crafts a person OF THIS DOMAIN would hold: its traditions' crafts plus the tradition-less baseline. */
function kitFor(domain) {
  const ids = Object.values(catalog).filter(a => !domain || domain === "all" || !a.tradition || DOMAIN_OF[a.tradition] === domain).map(a => a.id);
  return ids.map(id => ({ abilityId: id, level: 2 }));
}
let KIT_DOMAIN = DOMAIN && DOMAIN !== "all" ? DOMAIN : null;
const LEV = CONTENT.rules?.leveling || {};
const SKCAP = CONTENT.skillCapacity || CONTENT.rules?.skillCapacity || {};
/** The highest tier a level-L person may LEARN: `leveling.tierUnlockBands` — T2 at 8, T3 at 21, T4 at 35, T5 at 48. */
function topTierAt(level) {
  const bands = LEV.tierUnlockBands || {};
  let top = 1;
  for (const [t, b] of Object.entries(bands)) if (Number(b?.start) <= level) top = Math.max(top, Number(t));
  return top;
}
function rankAt(level) {
  const req = LEV.rankLevelReq || {}; let r = 1;
  for (const [rk, L] of Object.entries(req)) if (level >= Number(L)) r = Math.max(r, Number(rk));
  return Math.min(r, Number(LEV.maxAbilityRank) || 3);
}
const priceOf = (a) => { const t = Math.max(1, Number(a?.tier ?? a?.levelReq) || 1); const tb = SKCAP.tierPrice; return Array.isArray(tb) ? (Number(tb[t - 1]) || t) : (tb && typeof tb === "object") ? (Number(tb[String(t)]) || t) : t; };
/** ⛔ WHAT A PERSON OF LEVEL L IN THIS DOMAIN WOULD HOLD, having spent their points to hit as hard as they can:
 *  harm crafts by expected damage first, then one read, one conceal, one guard, then more harm — inside the
 *  tier band and the skill-point budget the rules give a level-L character. */
function boughtKit(domain, level, cfg) {
  const top = topTierAt(level), rank = rankAt(level), budget = (Number(LEV.skillPointPerLevel) || 2) * Math.max(1, level);
  const pool = Object.values(catalog).filter(a => (!domain || domain === "all" || !a.tradition || DOMAIN_OF[a.tradition] === domain) && Math.max(1, Number(a.tier ?? a.levelReq) || 1) <= top
    && !(NO_LETHAL && (a.harmRung === "lethal" || a.harmRung === "atrocity")));
  const ev = (a) => { const v = (a.functions || []).find(f => HARM_FNS.has(f)); if (!v) return 0; const m = mechanicFor(a, { verb: v, tier: Number(a.tier ?? a.levelReq) || 1, rank, intensity: "standard", cfg: cfg.rules.craftMechanics || {} }); const f = m?.fields || {}; return f.dice ? ((Number(f.dice.n) || 1) * ((Number(f.dice.d) || 6) + 1) / 2 + (Number(f.plus) || 0)) * (Number(f.mult) || 1) : 0; };
  const harm = pool.filter(a => ev(a) > 0).sort((x, y) => ev(y) - ev(x));
  const reads = pool.filter(a => (a.functions || []).some(f => SENSE_FNS.has(f))).sort((x, y) => (Number(y.tier) || 1) - (Number(x.tier) || 1));
  const hides = pool.filter(a => (a.functions || []).some(f => f === "conceal" || f === "deceive")).sort((x, y) => (Number(y.tier) || 1) - (Number(x.tier) || 1));
  const guards = pool.filter(a => (a.functions || []).some(f => f === "shield" || f === "ward" || f === "resist")).sort((x, y) => (Number(y.tier) || 1) - (Number(x.tier) || 1));
  const chosen = []; let left = budget; const take = (a) => { if (!a || chosen.some(c => c.id === a.id)) return; const pr = priceOf(a); if (pr <= left) { chosen.push(a); left -= pr; } };
  take(harm[0]); take(harm[1]); take(reads[0]); take(hides[0]); take(guards[0]);
  for (const a of harm.slice(2)) { if (left <= 0) break; take(a); }
  return { abilities: chosen.map(a => ({ abilityId: a.id, level: rank })), top, rank, budget, spent: budget - left, n: chosen.length };
}
function makeSweeper(catalog, body = null) {
  const bought = (KIT === "bought" && body) ? boughtKit(KIT_DOMAIN, body.level, CFG_NOW) : null;
  const abilities = bought ? bought.abilities : kitFor(KIT_DOMAIN);
  if (bought) LAST_KIT = bought;
  // ⚑ A PERSON CARRIES A WEAPON. One blade: +4 to strike (`items.wieldBonusPerItem`), the way a real inventory does.
  const inventory = POLICY === "greedy" ? [{ name: "a good blade", kind: "weapon", bonusTags: ["blade", "melee"], qty: 1 }] : [];
  if (body) return {
    id: "sim-sweeper", name: "The Sweeper", level: body.level,
    attributes: { practical: body.attr, physical: body.attr, mental: body.attr, social: body.attr },
    subAttributes: {}, alignment: {}, health: body.hp, maxHealth: body.hp, energy: body.en, maxEnergy: body.en,
    abilities, inventory, codex: { schemaVersion: 1, topics: {} },
  };
  return {
    id: "sim-sweeper", name: "The Sweeper", level: LEVEL,
    attributes: { practical: 5, physical: 5, mental: 5, social: 5 },
    subAttributes: { wits: 5, reason: 5, insight: 5, strength: 5, grace: 5, vitality: 5, presence: 5, will: 5 },
    alignment: {}, health: HP, maxHealth: HP, energy: 200, maxEnergy: 200,
    abilities, inventory, codex: { schemaVersion: 1, topics: {} },
  };
}

const catalog = CONTENT.abilities || {};
const HARM = new Set(CONTENT.skillBattle.engine.damage?.harmFunctions || ["strike", "break"]);
let runnable;
if (FOES === "synth") {
  // ⛔ THE WHOLE LEVEL RANGE. A duel foe is synthesized from threat, and level = threat × 0.5, so threat 2L is a
  // level-L foe with the pool, attribute and tier the engine's own curves give it. The default kit (strike +
  // shield) is what a synthesized foe carries in play unless a tactic tag says otherwise.
  runnable = (LEVELS || [10, 20, 30, 50, 75, 100]).map(L => {
    const def = synthesizeDuelDef({ id: `synth_L${L}`, flavor: "fight", seed: "", opponent: { name: `a level-${L} foe`, threat: 2 * L, tacticTags: [] } });
    // ⚠️ `synthesizeDuelDef` writes a small legacy `health` (3 + threat/15) and the sheet honours an explicit health
    // over the standing pool — so a "level-20 foe" arrived with 6 hp. The pool is the standing rule's to set.
    delete def.opponent.health; delete def.opponent.yieldAt; delete def.opponent.yieldAtFraction; delete def.yieldAt;
    return [`synth_L${L}`, def];
  });
} else if (FOES === "people") {
  // ⚑ THE AUTHORED ROSTER AT THEIR OWN LEVEL, WITH THEIR OWN KITS — the realest foe the game has. `personOpponentFor`
  // is the live path; a person declared not-an-opponent is skipped, as in play.
  const cfg = CONTENT.rules?.npcStanding || {};
  const want = new Set(LEVELS || []);
  runnable = [];
  for (const [id, rec] of Object.entries(CONTENT.npcs || {})) {
    const po = personOpponentFor(rec, { catalog, cfg, traditionIndex: CONTENT.traditionIndex });
    if (!po) continue;
    if (want.size && ![...want].some(L => Math.abs(po.level - L) <= 2)) continue;
    const def = synthesizeDuelDef({ id: `person_${id}`, flavor: "fight", seed: "", opponent: { name: po.name, threat: Math.max(10, po.level * 2), tacticTags: rec.tacticTags || [] } });
    def.opponent = { ...def.opponent, attributes: po.attributes, subAttributes: po.subAttributes, health: po.health, energy: po.energy, soak: po.soak, level: po.level, skills: po.skills, tacticTags: po.tacticTags, _person: id };
    def.yieldAt = def.opponent.yieldAt = 0; delete def.opponent.yieldAtFraction;
    runnable.push([`person_${id}`, def]);
  }
  runnable.sort((a, b) => (a[1].opponent.level || 0) - (b[1].opponent.level || 0));
} else {
  runnable = Object.entries(CONTENT.encounters || {}).filter(([id, e]) => e && e.type && (!ONLY || id === ONLY) && contestSheetFor(e, { content: CONTENT }));
}
if (!runnable.length) { console.error("no runnable encounter"); process.exit(1); }

/** THE PANEL: one harm craft per (tier × population) — authored dice, ladder dice — plus the bare strike, so a
 *  dial's effect on each population is visible in a run that finishes in minutes. `--all` sweeps the menu. */
function craftPanel(menu) {
  if (ALL) return menu;
  const rows = menu.filter(s => HARM.has(s.function));
  const pick = new Map();
  for (const s of rows) {
    const def = catalog[s.id];
    const blk = def?.mechanic?.[s.function] || def?.mechanic || null;
    const pop = s.id === "_strike" ? "bare" : (blk?.dice ? "authored" : "ladder");
    const key = `${s.tier || 1}:${pop}`;
    if (!pick.has(key)) pick.set(key, { ...s, _pop: pop });
  }
  return [...pick.values()].sort((a, b) => (a.tier || 1) - (b.tier || 1) || a._pop.localeCompare(b._pop));
}

let CFG_NOW = null, LAST_KIT = null;
const HARM_FNS = new Set(CONTENT.skillBattle.engine.damage?.harmFunctions || ["strike", "break"]);
const SENSE_FNS = new Set(CONTENT.skillBattle.engine.senseStep?.senseFunctions || ["reveal", "foresee", "track"]);
/** What a craft is worth to a person who wants to hit as hard as they can: its dice mean at this tier and rank. */
function expectedHit(row, cfg) {
  const def = catalog[row.id];
  const m = mechanicFor(def || null, { verb: row.function, tier: row.tier, rank: row.rank || 1, intensity: "standard", cfg: cfg.rules.craftMechanics || {} });
  const f = m?.fields || {};
  if (f.dice) return (Number(f.dice.n) || 1) * ((Number(f.dice.d) || 6) + 1) / 2 + (Number(f.plus) || 0) * (Number(f.mult) || 1);
  return 1 + (row.tier || 1) * 0.5;
}
const costOf = (decl, cfg) => Math.round((Number.isFinite(Number(decl?.energyCost)) ? Number(decl.energyCost) : (cfg.rules.energy?.defaultActionCost ?? 5))
  * ((cfg.steps[decl.intensity] || cfg.steps.standard || {}).energyMult ?? 1) * (decl.woven ? (cfg.sb?.weave?.energyMultiplier ?? 1.8) : 1));
/** ⛔ A TURN THE WAY A PERSON PLAYS IT. Best read first; then the hardest hit they can afford, woven and surged
 *  when the energy is there; a finisher when the odds favour it; the bonus action if the read earned one. */
/** ⛔ THE FOE PLAYS LIKE A PERSON TOO: the hardest hit in its kit, woven with the next, surged when energy allows.
 *  It has no sense step and no inventory in the engine — said in the report rather than invented here. */
function greedyFoe(cfg) {
  return (oppSheet, state, seenTendency, sb, phase) => {
    if (oppSheet?.static) return null;
    const rows = (oppSheet?.skills || []).filter(r => HARM_FNS.has(r.function));
    if (!rows.length) return null;
    const evOf = (r) => { const m = mechanicFor(r.abilityId ? catalog[r.abilityId] : null, { verb: r.function, tier: r.tier || 1, rank: r.rank || 1, intensity: "standard", cfg: cfg.rules.craftMechanics || {} }); const f = m?.fields || {}; return f.dice ? ((Number(f.dice.n) || 1) * ((Number(f.dice.d) || 6) + 1) / 2 + (Number(f.plus) || 0)) * (Number(f.mult) || 1) : (r.tier || 1); };
    const sorted = [...rows].sort((a, b) => evOf(b) - evOf(a));
    const lead = sorted[0], second = sorted.find(r => r !== lead && r.function !== lead.function) || sorted[1] || null;
    const energy = state?.opponentEnergy ?? oppSheet?.energy ?? 0, reserve = (oppSheet?.maxEnergy || oppSheet?.energy || 100) * RESERVE;
    const mk = (intensity, woven) => ({ ...lead, intensity, attribute: lead.attribute || "practical", ...(woven ? { woven: { ...second } } : {}) });
    for (const [intensity, woven] of [["surge", !!second], ["standard", !!second], ["surge", false], ["standard", false]]) {
      const d = mk(intensity, woven); if (energy - costOf(d, cfg) >= reserve) return d;
    }
    return mk("conserve", false);
  };
}
function greedyTurn(c, def, menu, cfg, state, learn = null) {
  const energy = c.energy ?? 0, reserve = (c.maxEnergy || 100) * RESERVE;
  const harm = menu.filter(r => HARM_FNS.has(r.function) && !r.itemMove).map(r => ({ r, ev: expectedHit(r, cfg) })).sort((a, b) => b.ev - a.ev);
  if (!harm.length) return null;
  const senses = menu.filter(r => SENSE_FNS.has(r.function) && !r.itemMove).sort((a, b) => (b.tier || 1) - (a.tier || 1) || (String(a.id).startsWith("_sense_") ? 1 : -1));
  // ⚑ A PERSON WHO IS OUT-READ STOPS READING. A failed read hands the foe the setup bonus (battleRound gives the
  // opponent −setupBonus), so reading every turn against a foe who resists better is worse than not looking.
  // Read on the first turn; keep reading only while the reads have paid on average.
  const worthReading = !learn || learn.reads === 0 || (learn.setupSum / learn.reads) > 0;
  const sense = (senses.length && worthReading) ? declFromSelection([senses[0]], menu, "standard", { character: c, sb: cfg.sb }) : null;
  const afterSense = energy - (sense ? costOf(sense, cfg) : 0);
  const lead = harm[0].r, second = harm.find(h => h.r.id !== lead.id && h.r.function !== lead.function)?.r || harm[1]?.r || null;
  const build = (sel, intensity) => declFromSelection(sel, menu, intensity, { character: c, sb: cfg.sb });
  // the ladder of wants: woven+surge → woven → surge → standard → conserve, the first the reserve allows
  const wants = [];
  if (second) wants.push([[lead, second], "surge"], [[lead, second], "standard"]);
  wants.push([[lead], "surge"], [[lead], "standard"], [[lead], "conserve"]);
  let action = null;
  for (const [sel, intensity] of wants) { const d = build(sel, intensity); if (d && afterSense - costOf(d, cfg) >= (intensity === "conserve" ? 0 : reserve)) { action = d; break; } }
  if (!action) action = build([lead], "conserve");
  // finisher: attempt when the odds say so, the way the panel offers it
  let finisher = false;
  try { const o = finishOdds({ skill: lead, def, oppSheet: state?.opponentSheet, state, sb: cfg.sb }); finisher = !NO_FINISHER && !!o && (Number(o.pct ?? 0) >= 50); } catch { finisher = false; }
  const bonus = build([lead], "standard");
  return { sense, action, bonus, finisher, intensity: action.intensity, woven: !!action.woven };
}

/** One bout on the production path, with THIS variant's config. */
function fight(cfg, encId, def, skill, seed, menu) {
  const oppSheet = contestSheetFor(def, { sb: cfg.sb, content: { ...CONTENT, rules: cfg.rules } });
  let body = null;
  if (MATCH && Number.isFinite(Number(oppSheet?.level))) {
    const foeL = Number(oppSheet.level);
    const lvl = MATCH === "peer" ? foeL : Math.max(1, foeL + Number(MATCH));
    body = BODY === "npc" ? npcBody(lvl, cfg) : { level: lvl, attr: 5, hp: HP, en: 200 };
  }
  CFG_NOW = cfg;
  const c = makeSweeper(catalog, body);
  c.activeEncounter = { defId: def.id, state: startEncounter(def, { oppSheet }) };
  const rng = makeRng(seed);
  // ⚠️ THE MENU IS THE CHARACTER'S OWN — a domain kit, a weapon — built here because the body was.
  const myMenu = POLICY === "greedy" ? battleSkillsForCharacter(c, { catalog, rules: cfg.rules, sb: cfg.sb }) : menu;
  let decl = POLICY === "greedy" ? null : declFromSelection([skill], menu, "standard", { character: c, sb: cfg.sb });
  if (POLICY !== "greedy" && !decl) return { error: "no declaration" };
  const pol = { surges: 0, weaves: 0, senses: 0, setup: 0, finishers: 0, turns: 0 };
  const learn = { reads: 0, setupSum: 0 };
  const foePolicy = FOE_POLICY === "greedy" ? greedyFoe(cfg) : null;
  const t = { rounds: 0, ended: false, outcome: null, stalled: false, hits: [], foeHits: [], hpStart: c.health, breaks: 0, pressureAt: null };
  let sinceChange = 0, fxCount = 0, hpCount = c.health, oppHp0 = c.activeEncounter.state.opponentHealth ?? 0;
  try {
    while (t.rounds < MAX_ROUNDS && !t.ended) {
      const before = c.activeEncounter.state.opponentHealth ?? 0;
      let turnArgs = { action: decl, intensity: "standard" };
      if (POLICY === "greedy") {
        const g = greedyTurn(c, def, myMenu, cfg, c.activeEncounter.state, learn);
        if (!g) return { error: "no harm craft in kit" };
        decl = g.action; pol.turns++; if (g.intensity === "surge") pol.surges++; if (g.woven) pol.weaves++; if (g.sense) pol.senses++; if (g.finisher) pol.finishers++;
        turnArgs = { sense: g.sense, action: g.action, bonus: g.bonus, intensity: g.intensity, finisher: g.finisher };
      }
      const played = playTurn(c, def, { ...turnArgs, content: CONTENT, rules: cfg.rules, sb: cfg.sb, steps: cfg.steps, rng, day: 100, catalog, party: null, foePolicy });
      if (POLICY === "greedy") { const sb0 = Number(played.turn?.setupBonus) || 0; pol.setup += sb0; if (turnArgs.sense) { learn.reads++; learn.setupSum += sb0; } }
      if (DEBUG && t.rounds <= 2) {
        const d = played.rr?.damage, a = turnArgs.action;
        console.log(`    [debug ${encId} r${t.rounds}] kit: ${(c.abilities || []).slice(0, 6).map(x => x.abilityId + "@" + x.level).join(" ")}${(c.abilities || []).length > 6 ? " …" : ""}`);
        console.log(`    [debug] you: ${a?.id} ${a?.function} T${a?.tier} r${a?.rank} ${a?.intensity}${a?.woven ? " ⋈ " + a.woven.id : ""}${a?.wield ? " wield+" + a.wield.value : ""} · sense ${turnArgs.sense?.id || "-"} setup ${played.turn?.setupBonus} · foe: ${played.rr?.oppDecl?.name} T${played.rr?.oppDecl?.tier} ${played.rr?.oppDecl?.intensity}${played.rr?.oppDecl?.woven ? " ⋈" : ""}`);
        if (d) console.log(`    [debug] damage → ${d.side}: amount ${d.amount} rolled ${d.rolled ?? "-"} soaked ${d.soaked ?? 0} path ${d.path}/${d.population || "-"} by ${d.by} · margins you ${played.rr?.player?.margin} them ${played.rr?.opponent?.margin}${played.rr?.deathSave ? ` · DEATH SAVE on ${played.rr.deathSave.on}: ${played.rr.deathSave.kill ? "KILL" : "held"} (${played.rr.deathSave.rung || "-"})` : ""}`);
      }
      t.rounds++;
      const rr = played.rr;
      const d = rr?.damage;
      if (d && d.side === "opponent") t.hits.push({ amount: d.amount, tier: decl.tier || 1, path: d.path || null, why: d.pathWhy || null, pop: d.population || null });
      if (d && d.side === "player") t.foeHits.push({ amount: d.amount, tier: rr?.oppDecl?.tier || 1, path: d.path || null, why: d.pathWhy || null, verb: rr?.oppDecl?.function });
      if (rr?.pressureEvent?.side === "opponent") t.breaks++;
      if (rr?.deathSave?.kill && rr.deathSave.on === "opponent") t.finisherKill = true;
      if (rr?.state?.breakAt && t.pressureAt == null) t.pressureAt = rr.state.breakAt.opponent;
      if (rr?.ended) { t.ended = true; t.outcome = rr.outcome || "ended"; }
      if ((c.health ?? 0) <= 0) { t.ended = true; t.outcome = t.outcome || "player_down"; }
      const moved = (c.activeEncounter.state.opponentHealth ?? 0) !== before || (rr?.state?.effects || []).length !== fxCount || (c.health ?? 0) !== hpCount;
      fxCount = (rr?.state?.effects || []).length; hpCount = c.health ?? 0;
      sinceChange = moved ? 0 : sinceChange + 1;
      if (sinceChange >= STALL_AT) { t.stalled = true; break; }
    }
  } catch (err) { return { error: String(err?.message || err).slice(0, 160) }; }
  const st = c.activeEncounter.state;
  return { ...t, won: /yield|fell|overcome|solved|fled/.test(String(t.outcome || "")),
    how: !t.ended ? "cap" : /player_down|incapac/.test(String(t.outcome)) ? "player-down" : t.finisherKill ? "finisher" : (st?.opponentHealth ?? 1) <= 0 ? "health" : (st?.pressure?.opponent ?? 0) >= (st?.breakAt?.opponent ?? Infinity) ? "break" : t.outcome,
    hpLost: t.hpStart - (c.health ?? 0), oppHp0, oppHpLeft: st?.opponentHealth ?? null, foeLevel: oppSheet?.level ?? null, foeHealth: oppSheet?.health ?? null, playerLevel: c.level, playerHp: c.maxHealth, craftTier: decl?.tier || 1, pol, energyLeft: c.energy ?? 0 };
}

const mean = (a) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const pct = (n, d) => d ? `${Math.round(100 * n / d)}%` : "—";

function runVariant(label, dials) {
  const cfg = { sb: clone(CONTENT.skillBattle.engine), rules: clone(CONTENT.rules), steps: clone(CONTENT.intensity.steps) };
  MAX_ROUNDS = 14;
  const applied = [];
  for (const [k, v] of [...SET, ...dials]) applied.push(`${applyDial(cfg, k, v)}.${k} = ${JSON.stringify(v)}`);
  const sweeper = makeSweeper(catalog);
  const menu = battleSkillsForCharacter(sweeper, { catalog, rules: cfg.rules, sb: cfg.sb });
  const panel = craftPanel(menu);
  const agg = { fights: 0, won: 0, ended: 0, capped: 0, stalled: 0, rounds: 0, how: {}, hits: [], foeHits: [], hpLost: 0, playerDown: 0, breakNeeded: [], breakGot: [], byEnc: [], roundsList: [], winRounds: [], breakWins: 0, playerLevels: [], winRoundsByTier: {}, fightsByTier: {} };
  for (const [encId, def] of runnable) {
    const e = { encId, fights: 0, won: 0, ended: 0, capped: 0, rounds: 0, foeLevel: null, foeHealth: null, breakAt: null, how: {} };
    const seats = POLICY === "greedy" ? [{ id: "_policy", tier: 0 }] : panel;
    const nFights = POLICY === "greedy" ? FIGHTS * Math.max(1, panel.length) : FIGHTS;   // the same fight count either way
    for (const skill of seats) for (let s = 0; s < nFights; s++) {
      const r = fight(cfg, encId, def, skill, hash(`${label}|${encId}|${skill.id}|${s}|${KIT_DOMAIN || "all"}`), menu);
      if (r.error) { e.error = r.error; continue; }
      e.fights++; agg.fights++; e.rounds += r.rounds; agg.rounds += r.rounds;
      if (r.won) { e.won++; agg.won++; }
      if (r.ended) { e.ended++; agg.ended++; } else if (!r.stalled) { e.capped++; agg.capped++; }
      if (r.stalled) agg.stalled++;
      e.how[r.how] = (e.how[r.how] || 0) + 1; agg.how[r.how] = (agg.how[r.how] || 0) + 1;
      agg.hits.push(...r.hits); agg.foeHits.push(...r.foeHits); agg.hpLost += r.hpLost;
      agg.roundsList.push(r.rounds); if (r.won) { agg.winRounds.push(r.rounds); if (r.how === "break") agg.breakWins++; (agg.winRoundsByTier[r.craftTier] ||= []).push(r.rounds); }
      (agg.fightsByTier[r.craftTier] ||= { n: 0, won: 0 }).n++; if (r.won) agg.fightsByTier[r.craftTier].won++;
      if (MATCH) { agg.playerLevels.push(r.playerLevel); (agg.playerHps ||= []).push(r.playerHp); }
      if (r.pol) { const P = (agg.pol ||= { turns: 0, surges: 0, weaves: 0, senses: 0, setup: 0, finishers: 0, energyLeft: 0, n: 0 }); for (const k of ["turns", "surges", "weaves", "senses", "setup", "finishers"]) P[k] += r.pol[k]; P.energyLeft += r.energyLeft; P.n++; }
      if (/player-down/.test(r.how)) agg.playerDown++;
      e.foeLevel = r.foeLevel; e.foeHealth = r.foeHealth; e.breakAt = r.pressureAt;
      if (r.pressureAt != null) agg.breakNeeded.push(r.pressureAt);
      if (r.foeLevel != null) agg.breakGot.push(r.breaks);
    }
    agg.byEnc.push(e);
  }
  const byTier = {}; for (const h of agg.hits) (byTier[h.tier] ||= []).push(h.amount);
  const paths = {}; for (const h of agg.hits) { const k = h.path === "flat" ? `flat:${h.why || "?"}` : `dice:${h.pop || "?"}`; paths[k] = (paths[k] || 0) + 1; }
  const foePaths = {}; for (const h of agg.foeHits) { const k = h.path === "flat" ? `flat:${h.why || "?"}` : `dice`; foePaths[k] = (foePaths[k] || 0) + 1; }
  return { label, applied, panel: panel.map(p => `${p.id}(T${p.tier || 1}${p._pop ? "," + p._pop : ""})`), agg, byTier, paths, foePaths };
}

function print(v) {
  const a = v.agg;
  console.log(`\n═══ ${v.label} ═══${v.applied.length ? "\n    " + v.applied.join("\n    ") : "   (everything shipped)"}`);
  console.log(`    ${a.fights} fights · ${runnable.length} encounters × ${v.panel.length} crafts × ${FIGHTS} samples · cap ${MAX_ROUNDS} rounds`);
  console.log(`    ENDS ${pct(a.ended, a.fights)}   win ${pct(a.won, a.fights)}   capped ${pct(a.capped, a.fights)}   stalled ${pct(a.stalled, a.fights)}   mean rounds ${(a.rounds / Math.max(1, a.fights)).toFixed(1)}`);
  console.log(`    how it ended: ${Object.entries(a.how).sort((x, y) => y[1] - x[1]).map(([k, n]) => `${k} ${pct(n, a.fights)}`).join(" · ")}`);
  // ⛔ ERIK'S THREE TARGETS, scored. Rounds are the ENDED fights' rounds (a capped fight has no length yet);
  // break is a share of WINS; "trivial" is read off win% and rounds in a +N match.
  const ended = a.roundsList.filter((_, i) => true);
  const q = (arr, f) => { if (!arr.length) return 0; const s2 = [...arr].sort((x, y) => x - y); return s2[Math.min(s2.length - 1, Math.floor(f * s2.length))]; };
  const inBand = a.winRounds.filter(r => r >= TARGET.lo && r <= TARGET.hi).length;
  const breakShare = a.won ? a.breakWins / a.won : 0;
  const lvlNote = MATCH ? ` · player L${q(a.playerLevels, 0.5)} (${MATCH}${BODY === "npc" ? ", foe's own body formula" : ", sweeper body"})` : "";
  console.log(`    TARGETS${lvlNote}`);
  console.log(`      rounds to a WIN: p10 ${q(a.winRounds, 0.1)} · p50 ${q(a.winRounds, 0.5)} · p90 ${q(a.winRounds, 0.9)} · inside ${TARGET.lo}–${TARGET.hi}: ${pct(inBand, a.winRounds.length)} of ${a.winRounds.length} wins   ${inBand / Math.max(1, a.winRounds.length) >= 0.8 ? "✅" : "❌"}`);
  console.log(`      break as a share of wins: ${(breakShare * 100).toFixed(0)}%   (target ${TARGET.breakLo * 100}–${TARGET.breakHi * 100}%)   ${breakShare >= TARGET.breakLo && breakShare <= TARGET.breakHi ? "✅" : "❌"}`);
  console.log(`      win ${pct(a.won, a.fights)} · you down ${pct(a.playerDown, a.fights)} · capped ${pct(a.capped, a.fights)}`);
  if (LAST_KIT) console.log(`      THE KIT (last fight): level ${LAST_KIT ? "" : ""}top tier T${LAST_KIT.top} · rank ${LAST_KIT.rank} · ${LAST_KIT.n} crafts for ${LAST_KIT.spent} of ${LAST_KIT.budget} points · foe brain: ${FOE_POLICY === "greedy" ? "greedy (weaves, surges; no sense step, no weapon — engine facts)" : "the game's opponentPolicy (never weaves, surges only when behind)"}`);
  if (a.pol) console.log(`      HOW YOU PLAYED (${POLICY}${KIT_DOMAIN ? ", kit: " + KIT_DOMAIN : ", kit: every domain"}): sensed ${pct(a.pol.senses, a.pol.turns)} of turns · mean setup bonus ${(a.pol.setup / Math.max(1, a.pol.senses)).toFixed(1)} · surged ${pct(a.pol.surges, a.pol.turns)} · wove ${pct(a.pol.weaves, a.pol.turns)} · finishers tried ${a.pol.finishers} · energy left ${(a.pol.energyLeft / Math.max(1, a.pol.n)).toFixed(0)} per fight`);
  // ⚠️ ACROSS THE BOARD MEANS PER TIER. levelReq == tier for every harm craft, so a level-6 player may hold a T5; the
  // tier spread (T1 ~5 a hit, T5 ~50) is real in play, and no pool or level dial closes it. Shown, not averaged away.
  console.log(`      by the craft's TIER — p50 rounds to a win · inside ${TARGET.lo}–${TARGET.hi} · win%:  ` + Object.keys(a.fightsByTier).sort().map(t => { const w = a.winRoundsByTier[t] || []; const ib = w.filter(r => r >= TARGET.lo && r <= TARGET.hi).length; return `T${t} ${q(w, 0.5)} · ${pct(ib, w.length)} · ${pct(a.fightsByTier[t].won, a.fightsByTier[t].n)}`; }).join("   "));
  const tiers = Object.keys(v.byTier).sort();
  console.log(`    YOUR hits: ${a.hits.length} landed · mean per tier  ${tiers.map(t => `T${t} ${mean(v.byTier[t]).toFixed(1)}`).join("  ")}`);
  console.log(`    path of your hits: ${Object.entries(v.paths).sort((x, y) => y[1] - x[1]).map(([k, n]) => `${k} ${pct(n, a.hits.length)}`).join(" · ") || "none"}`);
  console.log(`    FOE's hits on you: ${a.foeHits.length} landed · mean ${mean(a.foeHits.map(h => h.amount)).toFixed(1)} · you lost ${(a.hpLost / Math.max(1, a.fights)).toFixed(1)} hp per fight of ${MATCH ? Math.round(mean(a.playerHps || [HP])) : HP} · down ${pct(a.playerDown, a.fights)} · path ${Object.entries(v.foePaths).map(([k, n]) => `${k} ${pct(n, a.foeHits.length)}`).join(" · ") || "none"}`);
  console.log(`    BREAK exit: foes need ${a.breakNeeded.length ? mean(a.breakNeeded).toFixed(1) : "?"} pressure ticks; fights produced ${mean(a.breakGot).toFixed(2)} per fight, max ${a.breakGot.length ? Math.max(...a.breakGot) : 0}`);
  console.log(`    per encounter (foe L / hp / break-at → ends · win · how):`);
  for (const e of a.byEnc) console.log(`      ${e.encId.padEnd(26)} L${String(e.foeLevel ?? "?").padStart(2)} / ${String(e.foeHealth ?? "?").padStart(3)}hp / ${String(e.breakAt ?? "?").padStart(2)}  →  ends ${pct(e.ended, e.fights).padStart(4)} · win ${pct(e.won, e.fights).padStart(4)} · ${Object.entries(e.how).sort((x, y) => y[1] - x[1]).map(([k, n]) => `${k} ${n}`).join(", ")}${e.error ? `  ⚠️ ${e.error}` : ""}`);
}

console.log(`DAMAGE SWEEP — ${runnable.length} encounter(s), production path (battleSkillsForCharacter → declFromSelection → playTurn)`);
const variants = [];
const domainsToRun = DOMAIN === "all" ? DOMAINS : [KIT_DOMAIN];
for (const dom of domainsToRun) {
  KIT_DOMAIN = dom;
  for (const val of RANGE) {
    const dials = VARY ? [[VARY, val]] : [];
    const label = (dom ? `[${dom}] ` : "") + (VARY ? `${VARY} = ${JSON.stringify(val)}` : "BASELINE");
    const v = runVariant(label, dials);
    print(v); variants.push(v);
  }
}
if (variants.length > 1) {
  console.log(`\n═══ SUMMARY — ${VARY} ═══`);
  console.log(`    ${"value".padEnd(10)} ${"ends".padStart(6)} ${"win".padStart(6)} ${"capped".padStart(7)} ${"rounds".padStart(7)} ${"p50 win".padStart(8)} ${"in 5–15".padStart(8)} ${"brk/win".padStart(8)} ${"your hit".padStart(9)} ${"foe hit".padStart(8)} ${"you down".padStart(9)}`);
  for (const v of variants) { const a = v.agg; const q2 = (arr) => { if (!arr.length) return 0; const s2 = [...arr].sort((x, y) => x - y); return s2[Math.floor(0.5 * s2.length)]; }; const inB = a.winRounds.filter(r => r >= TARGET.lo && r <= TARGET.hi).length; console.log(`    ${String(v.label.includes(" = ") ? v.label.split(" = ")[1] : v.label).padEnd(10)} ${pct(a.ended, a.fights).padStart(6)} ${pct(a.won, a.fights).padStart(6)} ${pct(a.capped, a.fights).padStart(7)} ${(a.rounds / Math.max(1, a.fights)).toFixed(1).padStart(7)} ${String(q2(a.winRounds)).padStart(8)} ${pct(inB, a.winRounds.length).padStart(8)} ${pct(a.breakWins, a.won).padStart(8)} ${mean(a.hits.map(h => h.amount)).toFixed(1).padStart(9)} ${mean(a.foeHits.map(h => h.amount)).toFixed(1).padStart(8)} ${pct(a.playerDown, a.fights).padStart(9)}`); }
}
if (OUT) { writeFileSync(join(root, OUT), JSON.stringify({ at: new Date().toISOString(), vary: VARY, set: SET, fights: FIGHTS, level: LEVEL, hp: HP, variants: variants.map(v => ({ ...v, agg: { ...v.agg, hits: undefined, foeHits: undefined } })) }, null, 1)); console.log(`\nwrote ${OUT}`); }
