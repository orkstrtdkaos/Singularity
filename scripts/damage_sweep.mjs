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
//   --foe-kit bought    a synthesized foe becomes a PERSON of its level: a bought kit from one domain, real crafts with a source
//   --foe-hides         a foe holding an author-OBSCURE craft spends its sense step hiding (the conceal result a read meets)
//   --ground sample|<id>|none   a real place per fight (seeded) — both sides' crafts stand on its ground (Erik 2026-09-11:
//                       "the ground must reach a fight"); greedy players weigh each craft's hit by its chance to land there
//   --sense greedy|always|never  the read measured against skipping it (greedy: read while reads pay)
//   ⚠️ A FAIR PEER is `--domain all --foe-kit bought --foe-hides --ground sample`: one domain per side. Without `--domain`
//   the player buys from EVERY domain and always holds a craft at full ground, which reads as a 91–100% peer win.
//
// DIAL PATHS: `craftMechanics.…` and `npcStanding.…` read rules.* (the ladder, family defaults, rankDeltas; the foe's health pool);
// `maxRounds` is this harness's cap; everything else is `skillBattle.engine.…` (damage, momentum.pressure, …).
// A dial that does not exist at that path is an error, not a silent no-op — the failure this project keeps finding.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadContentHeadless } from "../tests/headless_content.mjs";
import { battleSkillsForCharacter, declFromSelection, playTurn } from "../engine/battle_turn.js";
import { startEncounter, contestSheetFor, foeOwnMove } from "../engine/encounters.js";
import { npcGear } from "../engine/npcsheet.js";
import { pcBodyAt } from "../engine/progression.js";
import { synthesizeDuelDef } from "../engine/random_encounters.js";
import { groundForDecl } from "../engine/substrate.js";
import { pDiffExceeds } from "../engine/skill_battle.js";
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
const GROUND = flag("--ground", "none");        // "none" (no place — the old measure) | "sample" (a real place per fight, seeded) | a location id
const SENSE = flag("--sense", "greedy");        // "greedy" (read while reads pay) | "always" | "never" — the read measured against skipping it
const FOE_HIDES = argv.includes("--foe-hides");  // a foe holding an OBSCURE craft spends its sense step hiding (the conceal result)
const FOE_KIT = flag("--foe-kit", "synth");     // "synth" (the synthesized rows) | "bought" (a person of the foe's level with real crafts)
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
/** ✅ ERIK 2026-09-11: "the player should have a player's growth." The engine's own `pcBodyAt`, the sub points spent on the
 *  attribute the kit's harm crafts roll with, then the read's — a person builds toward what they hit with. */
function pcFor(level, abilities) {
  const counts = {};
  for (const a of (abilities || [])) { const ab = (CONTENT.abilities || {})[a.abilityId]; if (ab && (ab.functions || []).some(f => f === "strike" || f === "break")) counts[ab.attribute || "physical"] = (counts[ab.attribute || "physical"] || 0) + 1; }
  const lead = Object.entries(counts).sort((x, y) => y[1] - x[1])[0]?.[0] || "physical";
  // ✅ the eight stats: the sub points go first to the SUBS those harm crafts roll, most-used first, as a person's do
  const subs = {};
  for (const a of (abilities || [])) { const ab = (CONTENT.abilities || {})[a.abilityId]; for (const f of (ab?.functions || [])) if ((f === "strike" || f === "break") && ab.subAttributeByFunction?.[f]) subs[ab.subAttributeByFunction[f]] = (subs[ab.subAttributeByFunction[f]] || 0) + 1; }
  const focusSubs = Object.entries(subs).sort((x, y) => y[1] - x[1]).map(([s]) => s);
  return pcBodyAt(level, { rules: CONTENT.rules, focusParents: [lead, lead === "mental" ? "practical" : "mental"], focusSubs });
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
  // ✅ ERIK 2026-09-11: THREE DOMAINS, "just like PCs" — the primary to the level's top tier, and two more as the
  // secondary (to T3) and tertiary (to T2), the caps `domainAccess` gives a PC. ⚠️ Which two is a harness choice
  // (the next two in a fixed cycle); a real PC chooses them.
  const di = DOMAINS.indexOf(domain), D2 = di >= 0 ? DOMAINS[(di + 1) % DOMAINS.length] : null, D3 = di >= 0 ? DOMAINS[(di + 2) % DOMAINS.length] : null;
  const capOf = (a) => { if (!domain || domain === "all" || !a.tradition) return top; const d = DOMAIN_OF[a.tradition]; return d === domain ? top : d === D2 ? Math.min(top, 3) : d === D3 ? Math.min(top, 2) : 0; };
  const pool = Object.values(catalog).filter(a => Math.max(1, Number(a.tier ?? a.levelReq) || 1) <= capOf(a)
    && !(NO_LETHAL && (a.harmRung === "lethal" || a.harmRung === "atrocity")));
  const ev = (a) => { const v = (a.functions || []).find(f => HARM_FNS.has(f)); if (!v) return 0; const m = mechanicFor(a, { verb: v, tier: Number(a.tier ?? a.levelReq) || 1, rank, intensity: "standard", cfg: cfg.rules.craftMechanics || {} }); const f = m?.fields || {}; return f.dice ? ((Number(f.dice.n) || 1) * ((Number(f.dice.d) || 6) + 1) / 2 + (Number(f.plus) || 0)) * (Number(f.mult) || 1) : 0; };
  const harm = pool.filter(a => ev(a) > 0).sort((x, y) => ev(y) - ev(x));
  const reads = pool.filter(a => (a.functions || []).some(f => SENSE_FNS.has(f))).sort((x, y) => (Number(y.tier) || 1) - (Number(x.tier) || 1));
  const hides = pool.filter(a => a.obscure === true || (a.functions || []).some(f => f === "conceal" || f === "deceive")).sort((x, y) => (y.obscure === true) - (x.obscure === true) || (Number(y.tier) || 1) - (Number(x.tier) || 1));
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
  // ✅ Erik 2026-09-11: the PC grows like a PC — `pcBodyAt`, not the threat curve a synthesized foe is built on
  const pc = body ? pcFor(body.level, abilities) : null;
  if (body) return {
    id: "sim-sweeper", name: "The Sweeper", level: body.level,
    attributes: pc.attributes,
    subAttributes: pc.subAttributes, alignment: {}, health: pc.maxHealth, maxHealth: pc.maxHealth, energy: pc.maxEnergy, maxEnergy: pc.maxEnergy,
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
const GROUND_LOCS = Object.values(CONTENT.locations || {}).filter(l => l && l.id).sort((a, b) => String(a.id).localeCompare(String(b.id)));
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
    const po = personOpponentFor(rec, { catalog, cfg, traditionIndex: CONTENT.traditionIndex, items: CONTENT.items || {}, leveling: LEV });
    if (!po) continue;
    if (want.size && ![...want].some(L => Math.abs(po.level - L) <= 2)) continue;
    const def = synthesizeDuelDef({ id: `person_${id}`, flavor: "fight", seed: "", opponent: { name: po.name, threat: Math.max(10, po.level * 2), tacticTags: rec.tacticTags || [] } });
    def.opponent = { ...def.opponent, attributes: po.attributes, subAttributes: po.subAttributes, health: po.health, energy: po.energy, soak: po.soak, level: po.level, skills: po.skills, tacticTags: po.tacticTags, _person: id, inventory: po.inventory, _audit: auditPerson(rec, po) };
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

/** ⛔ ERIK 2026-09-11 (Q4): "Authored NPCs can break the standard rules... We need to know who the worst offenders are, as this
 *  may not have been intentional." A person's AUTHORED crafts against the rules a PC of the same level plays by: the tier
 *  bands, the rank ladder, the skill-point budget. Drawn crafts (kitFor) follow the rules by construction; this reads
 *  only what somebody wrote down. */
function auditPerson(rec, po) {
  const L = Number(po?.level) || 1, top = topTierAt(L), rk = rankAt(L), budget = (Number(LEV.skillPointPerLevel) || 2) * Math.max(1, L);
  const auth = (Array.isArray(rec?.abilities) ? rec.abilities : []).map(a => ({ id: a?.abilityId || a, rank: Number(a?.level) || 1 })).map(x => ({ ...x, ab: catalog[x.id] })).filter(x => x.ab);
  const tierOf = (ab) => Math.max(1, Number(ab.tier ?? ab.levelReq) || 1);
  const overTier = auth.filter(x => tierOf(x.ab) > top), overRank = auth.filter(x => x.rank > rk);
  const spent = auth.reduce((s, x) => s + priceOf(x.ab), 0);
  return { id: rec?.id, name: rec?.name || rec?.id, level: L, authored: auth.length, top, rankCap: rk, heldTop: auth.length ? Math.max(...auth.map(x => tierOf(x.ab))) : 0,
    overTier: overTier.map(x => `${x.id} T${tierOf(x.ab)}`), overRank: overRank.map(x => `${x.id} r${x.rank}`), spent, budget, overBudget: spent - budget,
    gear: (po?.inventory || []).map(i => i.name) };
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
/** ⚑ A PERSON READS THE GROUND. The card tells them what a craft is worth here, so they weigh a hit by its chance to land:
 *  a penalty p on your roll means beating the other side by p, P(d2 − d1 > p) against an even P at 0. Cached per fight. */
const LAND0 = pDiffExceeds(0);
const landOn = (pen) => pDiffExceeds(pen) / LAND0;
function groundPen(row, where, holder = null) {
  if (!where?.location || !row) return 0;
  const k = (holder ? "p:" : "f:") + (row.abilityId || row.id);
  const m = (where._pen ||= new Map());
  if (m.has(k)) return m.get(k);
  const g = groundForDecl({ ...row, abilityId: row.abilityId || row.id }, holder, { content: CONTENT, location: where.location });
  const v = g ? g.chancePenalty : 0; m.set(k, v); return v;
}
function greedyFoe(cfg, where = null) {
  return (oppSheet, state, seenTendency, sb, phase) => {
    if (oppSheet?.static) return null;
    // ⚑ THE SENSE STEP AND THE DRINK ARE THE ENGINE'S OWN FOE MOVES NOW (`foeOwnMove`: it reads you, or hides from a
    // reader, and drinks when low) — the production path, not a harness copy of it. `--foe-hides` is kept for old
    // command lines and does nothing the engine does not already do.
    if (phase === "sense") return null;
    { const own = foeOwnMove(oppSheet, state, sb, phase, catalog); if (own) return own; }
    const rows = (oppSheet?.skills || []).filter(r => HARM_FNS.has(r.function));
    if (!rows.length) return null;
    const evOf = (r) => { const m = mechanicFor(r.abilityId ? catalog[r.abilityId] : null, { verb: r.function, tier: r.tier || 1, rank: r.rank || 1, intensity: "standard", cfg: cfg.rules.craftMechanics || {} }); const f = m?.fields || {}; return f.dice ? ((Number(f.dice.n) || 1) * ((Number(f.dice.d) || 6) + 1) / 2 + (Number(f.plus) || 0)) * (Number(f.mult) || 1) : (r.tier || 1); };
    const sorted = [...rows].sort((a, b) => evOf(b) * landOn(groundPen(b, where)) - evOf(a) * landOn(groundPen(a, where)));
    const lead = sorted[0], second = sorted.find(r => r !== lead && r.function !== lead.function) || sorted[1] || null;
    const energy = state?.opponentEnergy ?? oppSheet?.energy ?? 0, reserve = (oppSheet?.maxEnergy || oppSheet?.energy || 100) * RESERVE;
    const mk = (intensity, woven) => ({ ...lead, intensity, attribute: lead.attribute || "practical", ...(woven ? { woven: { ...second } } : {}) });
    for (const [intensity, woven] of [["surge", !!second], ["standard", !!second], ["surge", false], ["standard", false]]) {
      const d = mk(intensity, woven); if (energy - costOf(d, cfg) >= reserve) return d;
    }
    return mk("conserve", false);
  };
}
function greedyTurn(c, def, menu, cfg, state, learn = null, where = null) {
  const energy = c.energy ?? 0, reserve = (c.maxEnergy || 100) * RESERVE;
  const harm = menu.filter(r => HARM_FNS.has(r.function) && !r.itemMove).map(r => ({ r, ev: expectedHit(r, cfg) * landOn(groundPen(r, where, c)) })).sort((a, b) => b.ev - a.ev);
  if (!harm.length) return null;
  const senses = menu.filter(r => SENSE_FNS.has(r.function) && !r.itemMove).sort((a, b) => groundPen(a, where, c) - groundPen(b, where, c) || (b.tier || 1) - (a.tier || 1) || (String(a.id).startsWith("_sense_") ? 1 : -1));
  // ⚑ A PERSON WHO IS OUT-READ STOPS READING. A failed read hands the foe the setup bonus (battleRound gives the
  // opponent −setupBonus), so reading every turn against a foe who resists better is worse than not looking.
  // Read on the first turn; keep reading only while the reads have paid on average.
  // ⚑ THE SENSE STEP PLAYED LIKE A PERSON. Read first; once the foe has shown what it does in the step, HIDE if you hold a craft
  // that can (hide against hide pays nobody, and a hide against its read is a contest you can win), else keep READING — never
  // skip: a foe that hides from someone doing nothing is paid a bonus action for it (CCODE-213, mirrored).
  const hideRow = menu.find(r => !r.itemMove && catalog[r.id]?.obscure === true) || null;
  const seenFoe = !!learn && ((learn.foeHid || 0) + (learn.foeRead || 0)) > 0;
  const senseIsHide = SENSE === "greedy" && seenFoe && !!hideRow;
  const sense = SENSE === "never" ? null
    : senseIsHide ? declFromSelection([hideRow], menu, "standard", { character: c, sb: cfg.sb })
    : senses.length ? declFromSelection([senses[0]], menu, "standard", { character: c, sb: cfg.sb }) : null;
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
  return { sense, senseIsHide, action, bonus, finisher, intensity: action.intensity, woven: !!action.woven };
}

/** One bout on the production path, with THIS variant's config. */
function fight(cfg, encId, def, skill, seed, menu) {
  // ⚑ `--foe-kit bought`: a synthesized foe of level L becomes a PERSON of level L — a bought kit (the same purchase rules
  // as yours) from a domain picked by level, in the row shape `battleSkillsFor` builds. Built once per def.
  if (FOE_KIT === "bought" && def.opponent && !def.opponent._kitDomain && /^synth_L/.test(String(encId))) {
    const L = Math.max(1, Math.round((Number(def.opponent.threat) || 20) / 2));
    const dom = DOMAINS[(L * 7) % DOMAINS.length];
    const kit = boughtKit(dom, L, cfg);
    // ⛔ 2026-09-11: these rows were built by hand — ONE row per craft (its first verb), no sub — while the player and every person in
    // the game get every verb, each with the sub it rolls (`battleSkillsFor`). Once bodies built toward the sub each verb rolls, the
    // gap tilted a fair peer toward the player: the foe's body sharpened subs its rows could not use. The game's shape, now.
    def.opponent.skills = kit.abilities.map(k => catalog[k.abilityId]).filter(Boolean).flatMap(a => (a.functions?.length ? a.functions : ["strike"]).map(fn => {
      const sub = a.subAttributeByFunction?.[fn];
      return { id: a.id, abilityId: a.id, function: fn, tier: Math.max(1, Number(a.tier ?? a.levelReq) || 1), rank: kit.rank,
        attribute: a.attribute || "practical", ...(sub ? { subAttribute: sub } : {}), name: a.name || a.id }; }));
    def.opponent.inventory = npcGear({}, { items: CONTENT.items || {}, cfg: CONTENT.rules?.npcStanding || {} });   // a person carries a person's gear
    // …and its BODY is a person's too — the same player rules (`pcBodyAt`), soak from what it wears (a default loadout wears nothing)
    { const fpc = pcFor(L, kit.abilities); Object.assign(def.opponent, { attributes: fpc.attributes, subAttributes: fpc.subAttributes, health: fpc.maxHealth, energy: fpc.maxEnergy, soak: 0 }); }
    def.opponent._kitDomain = dom;
  }
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
  // ✅ THE GROUND (Erik 2026-09-11: "the ground must reach a fight"). A real place per fight, picked from the seed so a
  // variant and its baseline stand on the same ground. "none" is the old measure: no place, no ground term.
  const pickLoc = () => { const k = [...String(seed)].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0, 7); return GROUND_LOCS[k % GROUND_LOCS.length]; };
  const where = GROUND === "none" ? null : { location: GROUND === "sample" ? pickLoc() : (CONTENT.locations?.[GROUND] || null) };
  // ⚠️ THE MENU IS THE CHARACTER'S OWN — a domain kit, a weapon — built here because the body was.
  const myMenu = POLICY === "greedy" ? battleSkillsForCharacter(c, { catalog, rules: cfg.rules, sb: cfg.sb }) : menu;
  let decl = POLICY === "greedy" ? null : declFromSelection([skill], menu, "standard", { character: c, sb: cfg.sb });
  if (POLICY !== "greedy" && !decl) return { error: "no declaration" };
  const pol = { surges: 0, weaves: 0, senses: 0, setup: 0, finishers: 0, turns: 0 };
  const learn = { reads: 0, setupSum: 0 };
  const foePolicy = FOE_POLICY === "greedy" ? greedyFoe(cfg, where) : null;
  const t = { rounds: 0, ended: false, outcome: null, stalled: false, hits: [], foeHits: [], hpStart: c.health, breaks: 0, pressureAt: null, gP: [], gO: [], gSide: {} };
  let sinceChange = 0, fxCount = 0, hpCount = c.health, oppHp0 = c.activeEncounter.state.opponentHealth ?? 0;
  try {
    while (t.rounds < MAX_ROUNDS && !t.ended) {
      const before = c.activeEncounter.state.opponentHealth ?? 0;
      let turnArgs = { action: decl, intensity: "standard" };
      if (POLICY === "greedy") {
        const g = greedyTurn(c, def, myMenu, cfg, c.activeEncounter.state, learn, where);
        if (!g) return { error: "no harm craft in kit" };
        decl = g.action; pol.turns++; if (g.intensity === "surge") pol.surges++; if (g.woven) pol.weaves++; if (g.sense) pol.senses++; if (g.finisher) pol.finishers++;
        turnArgs = { sense: g.sense, senseIsHide: !!g.senseIsHide, action: g.action, bonus: g.bonus, intensity: g.intensity, finisher: g.finisher };
      }
      const played = playTurn(c, def, { ...turnArgs, content: CONTENT, rules: cfg.rules, sb: cfg.sb, steps: cfg.steps, rng, day: 100, catalog, party: null, foePolicy, ground: where });
      if (POLICY === "greedy") { const sb0 = Number(played.turn?.setupBonus) || 0; pol.setup += sb0; if (turnArgs.sense && !turnArgs.senseIsHide) { learn.reads++; learn.setupSum += sb0; (pol.readSetups ||= []).push(sb0); pol.readBonus = (pol.readBonus || 0) + (played.turn?.bonusEarned ? 1 : 0); pol.readCost = (pol.readCost || 0) + costOf(turnArgs.sense, cfg); } }
      if (DEBUG && t.rounds <= 2) {
        const d = played.rr?.damage, a = turnArgs.action;
        console.log(`    [debug ${encId} r${t.rounds}] kit: ${(c.abilities || []).slice(0, 6).map(x => x.abilityId + "@" + x.level).join(" ")}${(c.abilities || []).length > 6 ? " …" : ""}`);
        console.log(`    [debug] you: ${a?.id} ${a?.function} T${a?.tier} r${a?.rank} ${a?.intensity}${a?.woven ? " ⋈ " + a.woven.id : ""}${a?.wield ? " wield+" + a.wield.value : ""} · sense ${turnArgs.sense?.id || "-"} setup ${played.turn?.setupBonus} · foe: ${played.rr?.oppDecl?.name} T${played.rr?.oppDecl?.tier} ${played.rr?.oppDecl?.intensity}${played.rr?.oppDecl?.woven ? " ⋈" : ""}`);
        if (d) console.log(`    [debug] damage → ${d.side}: amount ${d.amount} rolled ${d.rolled ?? "-"} soaked ${d.soaked ?? 0} path ${d.path}/${d.population || "-"} by ${d.by} · margins you ${played.rr?.player?.margin} them ${played.rr?.opponent?.margin}${played.rr?.deathSave ? ` · DEATH SAVE on ${played.rr.deathSave.on}: ${played.rr.deathSave.kill ? "KILL" : "held"} (${played.rr.deathSave.rung || "-"})` : ""}`);
      }
      t.rounds++;
      const rr = played.rr;
      for (const rec of played.receipts || []) { if (rec.label !== "sense") continue; if (rec.rr?.oppDecl?.obscure === true) learn.foeHid = (learn.foeHid || 0) + 1; else if (SENSE_FNS.has(rec.rr?.oppDecl?.function)) learn.foeRead = (learn.foeRead || 0) + 1; }
      for (const rec of played.receipts || []) { if (rec.label === "their bonus") t.foeBonus = (t.foeBonus || 0) + 1; if (rec.label === "bonus") t.myBonus = (t.myBonus || 0) + 1;
        if (rec.label === "sense" && Number.isFinite(rec.rr?.foeSetup)) { t.foeReads = (t.foeReads || 0) + 1; t.foeSetupSum = (t.foeSetupSum || 0) + rec.rr.foeSetup; } }
      for (const rec of played.receipts || []) { const g = rec.rr?.ground; if (!g) continue; if (g.player) { t.gP.push(g.player.chancePenalty); t.gSide[g.player.side] = (t.gSide[g.player.side] || 0) + 1; } if (g.opponent) t.gO.push(g.opponent.chancePenalty); }
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
      { const b = r.rounds <= 3 ? "1–3" : r.rounds <= 6 ? "4–6" : r.rounds <= 9 ? "7–9" : r.rounds <= 12 ? "10–12" : "13+";
        const H = ((agg.byLen ||= {})[b] ||= { n: 0, won: 0, brk: 0 }); H.n++; if (r.won) H.won++; if (r.how === "break") H.brk++; }
      { const Q = (agg.dia ||= { turns: 0, foeBonus: 0, myBonus: 0, foeReads: 0, foeSetup: 0 }); Q.turns += r.rounds || 0; Q.foeBonus += r.foeBonus || 0; Q.myBonus += r.myBonus || 0; Q.foeReads += r.foeReads || 0; Q.foeSetup += r.foeSetupSum || 0; }
      if (r.pol?.readSetups) { const Q = (agg.reads ||= { setups: [], bonus: 0, cost: 0, n: 0 }); Q.setups.push(...r.pol.readSetups); Q.bonus += r.pol.readBonus || 0; Q.cost += r.pol.readCost || 0; Q.n += r.pol.readSetups.length; }
      if (GROUND !== "none") { const G = (agg.ground ||= { you: [], foe: [], side: {}, bySide: {} }); G.you.push(...r.gP); G.foe.push(...r.gO); for (const [k, n] of Object.entries(r.gSide)) G.side[k] = (G.side[k] || 0) + n;
        const lead = Object.entries(r.gSide).sort((x, y) => y[1] - x[1])[0]?.[0] || "ungrounded"; const B = (G.bySide[lead] ||= { n: 0, won: 0, rounds: [] }); B.n++; if (r.won) B.won++; B.rounds.push(r.rounds); }
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
  if (a.dia) console.log(`      BONUS ACTIONS per turn: yours ${(a.dia.myBonus / Math.max(1, a.dia.turns)).toFixed(2)} · the foe's ${(a.dia.foeBonus / Math.max(1, a.dia.turns)).toFixed(2)} · the foe read you on ${(100 * a.dia.foeReads / Math.max(1, a.dia.turns)).toFixed(0)}% of turns, its setup mean ${(a.dia.foeSetup / Math.max(1, a.dia.foeReads)).toFixed(1)}`);
  if (a.reads) { const S2 = [...a.reads.setups].sort((x, y) => x - y); const at = (f) => S2[Math.min(S2.length - 1, Math.floor(f * S2.length))] ?? 0; const pos = S2.filter(x => x > 0).length, neg = S2.filter(x => x < 0).length;
    console.log(`      THE READ (${SENSE}): ${a.reads.n} reads · setup mean ${mean(S2).toFixed(1)} · p10 ${at(0.1)} · p50 ${at(0.5)} · p90 ${at(0.9)} · paid ${pct(pos, S2.length)} · cost you ${pct(neg, S2.length)} · bonus action ${pct(a.reads.bonus, a.reads.n)} · energy/read ${(a.reads.cost / Math.max(1, a.reads.n)).toFixed(1)}`); }
  if (a.ground) { const G = a.ground;
    console.log(`      THE GROUND: your craft ${G.you.length} grounded rolls, penalty mean ${mean(G.you).toFixed(1)} · the foe ${G.foe.length}, mean ${mean(G.foe).toFixed(1)} · your side: ${Object.entries(G.side).sort((x, y) => y[1] - x[1]).map(([k, n]) => k + " " + n).join(" · ")}`);
    console.log(`        by where you mostly stood: ` + Object.entries(G.bySide).sort((x, y) => y[1].n - x[1].n).map(([k, B]) => { const s3 = [...B.rounds].sort((x, y) => x - y); return `${k} ${B.n} fights · win ${pct(B.won, B.n)} · p50 ${s3[Math.floor(0.5 * s3.length)] ?? "-"}r`; }).join("  |  ")); }
  if (a.byLen) console.log(`      BY FIGHT LENGTH (rounds: fights · win · break share of wins): ` + ["1–3", "4–6", "7–9", "10–12", "13+"].filter(k => a.byLen[k])
    .map(k => { const H = a.byLen[k]; return `${k}: ${H.n} · win ${pct(H.won, H.n)} · break ${pct(H.brk, H.won)}`; }).join("  |  "));
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
if (FOES === "people" && variants.length) {
  const v0 = variants[0]; const byEnc = Object.fromEntries(v0.agg.byEnc.map(e => [e.encId, e]));
  const rows = runnable.map(([encId, def]) => ({ ...(def.opponent._audit || {}), e: byEnc[encId] })).filter(r => r.id);
  const score = (r) => r.overTier.length * 10 + Math.max(0, r.overBudget) + r.overRank.length * 3;
  rows.sort((a, b) => score(b) - score(a) || (b.e ? b.e.won / Math.max(1, b.e.fights) : 0) - (a.e ? a.e.won / Math.max(1, a.e.fights) : 0));
  console.log(`\n═══ RULES AUDIT — ${rows.length} authored people against the rules a PC of their level plays by ═══`);
  console.log("    person                     L  · authored · top T held (PC max) · over the tier band · rank over · points (PC budget) · you win vs them");
  for (const r of rows) console.log(`    ${String(r.name).slice(0, 26).padEnd(26)} ${String(r.level).padStart(3)} · ${String(r.authored).padStart(8)} · T${r.heldTop} (T${r.top})${r.heldTop > r.top ? " ⛔" : "   "}        · ${String(r.overTier.length).padStart(2)} ${r.overTier.slice(0, 3).join(", ")}${r.overTier.length > 3 ? " …" : ""} · ${r.overRank.length} · ${r.spent} (${r.budget})${r.overBudget > 0 ? " +" + r.overBudget : ""} · ${r.e ? pct(r.e.won, r.e.fights) : "—"}`);
  if (OUT) writeFileSync(join(root, OUT.replace(/[.]json$/, "_audit.json")), JSON.stringify(rows.map(r => ({ ...r, e: r.e ? { fights: r.e.fights, won: r.e.won } : null })), null, 1));
}
if (OUT) { writeFileSync(join(root, OUT), JSON.stringify({ at: new Date().toISOString(), vary: VARY, set: SET, fights: FIGHTS, level: LEVEL, hp: HP, variants: variants.map(v => ({ ...v, agg: { ...v.agg, hits: undefined, foeHits: undefined } })) }, null, 1)); console.log(`\nwrote ${OUT}`); }
