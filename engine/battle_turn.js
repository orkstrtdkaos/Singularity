// battle_turn.js — THE ONE PATH A SKILL BATTLE TAKES, in play and in a harness.
//
// ⛔ ERIK 2026-09-05: "I want our test harnesses to simulate the real game as much as possible so we can get it right."
//
// Before this module, the TURN lived in app.js — the menu (`playerBattleSkills`), the declaration (`sbDeclFromSel`), the
// rank resolution, the guards, the three-phase resolve (sense → action → bonus), the apply (health, energy, seals,
// conditions, practice, items) and the end (XP, the incapacitation table) — tangled with the DOM and the GM calls. The
// harnesses could not reach it, so they rebuilt a SIMPLER fight beside it: `battleRound` called directly with a hand-built
// seat, no sense step, no items, no guards, no conditions, no incapacitation table. ⚠️ THE SUITE BUILT THE INPUT PRODUCTION
// OMITTED (docs/PIPELINE.md rule 4), and two defects lived in the gap:
//
//   1. `escalateToFight` handed a PERSON to `synthesizeDuelDef`, which rebuilds `opponent` from scratch — name, a threat, a
//      3–8 health — and dropped the sheet on the floor. A named person fought as a threat-curve body with a handful of
//      health while the gate (§51) read the SOURCE of the call and saw the person being passed. `duelFromTarget` keeps the
//      body on the def.
//   2. A skill-battle knockout never reached the incapacitation table — `endEncounter` was called from the classic path
//      only, so `sbEnd` cleared the fight and narrated "you fall" with no gear taken, no days lost, no death, no XP.
//      `endBattle` is that table, and `sbEnd` calls it.
//
// Every function here is PURE over its inputs except the character/state it is handed to mutate, takes its content as
// arguments, and touches no DOM. app.js calls these; `tests/lib/realgame.mjs` calls these. One path.

import { skillBattleRound, startEncounter, checkIncapacitation, isLethalEncounter } from "./encounters.js";
import { synthesizeOpponentSheet } from "./skill_battle.js";
import { synthesizeDuelDef } from "./random_encounters.js";
import { encounterKind, frameCollapsible, collapseMode, collapseResult, collapseFloor, wardAgainst, wardBroken, swingDegree } from "./encounterFrame.js";
import { abilityTier } from "./skilltree.js";
import { effectiveEnergyCost, autoAdvancePracticedRanks, SUB_OF } from "./progression.js";
import { capabilityMenu, resolveTier, offersFreeTouch } from "./capabilities.js";
import { usableCombatItems, wieldBonusFor, consumeItem, removeItem } from "./inventory.js";
import { recordUse } from "./practice.js";
import { applyCondition } from "./conditions.js";
import { protectionFromCraft, tickProtections } from "./intercept.js";
import { authoredBlock } from "./craftmechanics.js";
import { smartClamp } from "./namematch.js";
import { slugify } from "./quests.js";
import { sheetFor as personSheetFor, battleSkillsFor } from "./npcsheet.js";
import { incapacitationOutcome, playerDeathState } from "./incapacitation.js";
import { enterDeathState } from "./death.js";
import { activeCompanions, growBond } from "./companions.js";

/** The player's battle menu — one entry per craft FUNCTION, then the two bare moves, the usable items, the generic senses.
 *  `catalog` is the merged catalog (content + the character's own crafts). Was `playerBattleSkills()` in app.js. */
export function battleSkillsForCharacter(character, { catalog = {}, rules = {}, sb = null, limit = null } = {}) {
  const out = [];
  for (const a of character?.abilities || []) {
    const def = catalog[a.abilityId];
    const fns = def?.functions || [];
    if (!fns.length) continue;
    for (const fn of fns) {
      out.push({ id: a.abilityId, function: fn, tier: abilityTier(def), rank: a.level ?? 1, attribute: def.attribute || "practical", name: def.name || a.abilityId,
        energyCost: effectiveEnergyCost(def, character, rules), mechanic: def.mechanic || null,
        ...(() => { // ⚠️ `??`, NOT `||` — CCODE-245: a genuine rank 0 must reach the module
          const menu = capabilityMenu(def, a.level ?? 1, { cfg: rules?.energy });
          return menu.tiers.length > 1
            ? { tiers: menu.tiers.map(t => ({ rank: t.rank, does: smartClamp(t.does, 160), cost: t.cost })) }
            : {}; })() });
    }
  }
  // ✅ R47: the universal fallbacks are RETIRED for anyone whose own crafts carry a free touch — "he should just rely on
  // the zero-cost fallbacks of his T1 skills as we designed". They remain for the bare sheet, which is what they were for.
  if (!offersFreeTouch((character?.abilities || []).map(a => catalog[a?.abilityId]).filter(Boolean), { cfg: rules?.energy })) {
    out.push({ id: "_strike", function: "strike", tier: 1, attribute: "physical", name: "A plain strike" });
    out.push({ id: "_guard", function: "shield", tier: 1, attribute: "physical", name: "Raise a guard" });
  }
  const icfg = sb?.items || {};
  for (const u of usableCombatItems(character, icfg)) {
    out.push({ id: `_item_${slugify(u.item.name)}`, itemMove: u,
      function: u.mode === "throw" ? (icfg.throwFunction || "strike") : (icfg.drinkFunction || "restore"),
      tier: u.mode === "throw" ? (icfg.throwTier || 2) : 1, attribute: "practical",
      name: u.label, finds: null, itemNote: u.note });
  }
  for (const g of (sb?.senseStep?.genericSenses || [])) {
    out.push({ id: `_sense_${g.sub}`, function: "reveal", tier: 1, attribute: SUB_OF?.[g.sub] || "mental",
      subAttribute: g.sub, name: g.name, finds: g.finds, generic: true });
  }
  // ✅ R46c (Erik, Q16): NO CAP. A 23-craft kit lost its bare moves, its items and its senses off the end of 40 slots — a
  // menu that silently drops what the player owns is worse than a long menu. The panel groups by CRAFT so the ROW count
  // falls instead, and any bound a caller still wants is its own and exempts the fallbacks.
  return Number.isFinite(limit) && limit > 0 ? out.slice(0, limit) : out;
}

/** The declaration a step's selection makes: the first craft leads, a second is WOVEN in (CCODE-37). Was `sbDeclFromSel`. */
export function declFromSelection(sel, skills, intensity, { character, sb = null } = {}) {
  const picked = (sel || []).map(i => (typeof i === "number" ? skills[i] : i)).filter(Boolean);
  if (!picked.length) return null;
  const lead = picked[0];
  const d = { function: lead.function, tier: lead.tier || 1, rank: lead.rank ?? lead.tier ?? 1, attribute: lead.attribute || "practical",
              intensity, name: lead.name, id: lead.id, energyCost: lead.energyCost ?? null };
  if (picked[1]) d.woven = { function: picked[1].function, tier: picked[1].tier || 1, rank: picked[1].rank ?? picked[1].tier ?? 1, name: picked[1].name, id: picked[1].id, energyCost: picked[1].energyCost ?? null };
  const wield = wieldBonusFor(character, d.function, sb?.items || {});
  if (wield) d.wield = wield;
  if (lead.itemMove) { d.itemMove = lead.itemMove; d.name = lead.name; }
  return d;
}

/** The rank a declaration actually resolves at — what is OWNED bounds what is WANTED (CCODE-245). Was inline in `sbDeclare`. */
export function resolveDeclRank(decl, { character, catalog = {} } = {}) {
  const cdef = decl?.id ? catalog[decl.id] : null;
  if (!cdef || !decl) return decl;
  const ownedRank = (character?.abilities || []).find(a => a.abilityId === decl.id)?.level ?? (decl.rank ?? 1);
  const want = Number(decl.rank) || ownedRank || 1;
  const v = resolveTier(cdef, want, ownedRank);
  const out = { ...decl, rank: v.ok ? v.rank : (v.rank || 1) };
  if (!v.ok && v.overreach) out.rankNote = v.why;
  else if (v.ok && v.rank !== want) out.rankNote = `resolved at rank ${v.rank}`;
  return out;
}

/** CCODE-311: the guard a declaration buys (`interceptDamage` / `interceptCondition`), dispatched on the authored block. */
export function guardBlockFor(decl, { catalog = {} } = {}) {
  const ab = decl && decl.id ? catalog[decl.id] : null;
  if (!ab) return null;
  const rank = Math.max(1, Number(decl.rank) || 1);
  const dmg = authoredBlock(ab, "interceptDamage", rank);
  const cond = authoredBlock(ab, "interceptCondition", rank);
  return (dmg || cond) ? { ability: ab, rank, spec: dmg || cond } : null;
}

/** Open the guards a declaration buys, persisted on the ENCOUNTER state so they outlive the round. Was `sbOpenGuards`. */
export function openGuards(character, encState, decl, { catalog = {} } = {}) {
  const g = guardBlockFor(decl, { catalog });
  if (!g || !encState) return 0;
  const me = character?.id || "player";
  const room = Math.max(1, Number(g.spec?.allies) || 1);
  const picked = (encState.guardPick || []).slice(0, room);
  if (!picked.length) return 0;
  const list = Array.isArray(encState.protections) ? encState.protections : [];
  let opened = 0;
  for (const allyId of picked) {
    const prot = protectionFromCraft(g.ability, g.rank, { protectorId: me, allyId, authoredBlock });
    if (!prot) continue;
    const at = list.findIndex(x => x && x.protectorId === me && x.allyId === allyId);
    if (at >= 0) list[at] = prot; else list.push(prot);
    opened++;
  }
  encState.protections = list;
  return opened;
}

/** What a resolved round does to the CHARACTER — health, energy, the seal, an imposed condition, practice, a drunk or thrown
 *  item — and the write-through of the encounter state. Was the tail of `sbDeclare` and `applyRR` in `sbExecuteTurn`.
 *  Returns { advances, beats } — the rank advances practice earned, and the plain lines a narrator or a log can carry. */
export function applyRoundToCharacter(character, rr, decl, { catalog = {}, rules = {}, branchForks = null, traditionIndex = null, day = null, defId = null } = {}) {
  const beats = [];
  character.health = Math.max(0, Math.min(character.maxHealth, character.health + (rr.deltas?.health || 0)));
  character.energy = Math.max(0, character.energy + (rr.deltas?.energy || 0));
  if (rr.sealed) character.craftSealedUntilRest = true;   // R35: a kill's seal outlives the fight
  if (rr.imposed && !rr.imposed.refused) {
    const cond = { id: rr.imposed.condition, name: rr.imposed.name || rr.imposed.condition,
      persistUntilHealed: !!rr.imposed.persistUntilHealed, sinceDay: character.clock?.day ?? null };
    if (rr.imposed.side === "player") applyCondition(character, cond);
    else if (rr.state) rr.state.opponentConditions = [...(rr.state.opponentConditions || []).filter(c => c.id !== cond.id), cond];
  }
  if (rr.state) character.activeEncounter = { defId: defId ?? character.activeEncounter?.defId ?? null, state: rr.state };
  const advances = [];
  const ids = [decl?.id, decl?.woven?.id].filter(x => x && !String(x).startsWith("_")); // _strike/_guard/_item aren't crafts
  if (ids.length) {
    recordUse(character, ids, { day });
    advances.push(...autoAdvancePracticedRanks(character, rules, { branchForks, catalog, traditionIndex }));
  }
  if (decl?.itemMove) {
    const it = decl.itemMove.item, nm = it.customName || it.name;
    if (decl.itemMove.mode === "drink") {
      const g = decl.itemMove.restores || {};
      if (g.energy) character.energy = Math.max(0, Math.min(character.maxEnergy ?? 100, character.energy + g.energy));
      if (g.health) character.health = Math.max(0, Math.min(character.maxHealth, character.health + g.health));
      beats.push(`You drank ${nm} — ${[g.energy ? `+${g.energy} energy` : "", g.health ? `+${g.health} hp` : ""].filter(Boolean).join(", ")}.`);
    } else beats.push(`You threw ${nm} at them.`);
    try { consumeItem(character, it.customName || it.name); } catch { removeItem(character, it.name, 1); }
  }
  return { advances, beats };
}

/** ⚡ Finish it (SNG-230 §6b/§7a): a decisive finisher can COLLAPSE a collapsible encounter in one beat. Was inline in `sbDeclare`. */
export function collapseIfFinished(rr, def, { swingBefore = 0, family = null, sb = null, frameContent = {} } = {}) {
  if (!rr || rr.ended || !frameCollapsible(def)) return rr;
  const swing = (rr.state?.momentum ?? 0) - swingBefore;
  const meterMax = sb?.momentum?.meterMax ?? 10;
  const ward = wardAgainst(def, "finish", frameContent.wardDenials);
  const wardHolds = ward.denied && !wardBroken(swingDegree(swing, meterMax), swing, ward.breakDC);
  if (!wardHolds && collapseMode([family], "fight") === "finish" && swing > 0
      && collapseResult(swingDegree(swing, meterMax), { floor: collapseFloor(def, frameContent.collapseEligibility) }) === "collapse") {
    return { ...rr, ended: true, outcome: "opponent_fell", state: { ...rr.state, status: "ended" }, _collapse: true };
  }
  return rr;
}

/** A PERSON as a fight opponent: their whole sheet — attributes, health, energy, soak, level, kit. Was `personOpponent` in app.js. */
export function personOpponentFor(rec, { catalog = {}, cfg = {}, day = null } = {}) {
  if (!rec) return null;
  const sheet = personSheetFor(rec, { day, cfg });
  const { skills } = battleSkillsFor(rec, { catalog, day, cfg });
  if (!skills.length) return null;                       // nothing to fight with — let the threat path have them
  return {
    name: sheet.name, attributes: sheet.attributes, health: sheet.health, energy: sheet.energy,
    ...(sheet.subAttributes ? { subAttributes: sheet.subAttributes } : {}),
    level: sheet.level,
    soak: sheet.soak, skills, tacticTags: rec.tacticTags || [],
    threat: Math.max(10, Math.round(sheet.level * 2)),
    _person: rec.id || null,
  };
}

/** A fight against a target, started — what `escalateToFight` did, minus the DOM.
 *  ⛔ THE FIX: `synthesizeDuelDef` rebuilds `opponent` from a threat and a 3–8 health, and it DROPPED the person's sheet — a
 *  named person entered play as a threat-curve body. The person's body is put back on the def, so the opponent sheet is
 *  AUTHORED (their crafts, their health) and the encounter starts at their health, not a synthesized handful.
 *  Returns { def, oppSheet, state } and writes `character.customEncounters[def.id]` and `character.activeEncounter`. */
export function duelFromTarget(character, target, { catalog = {}, npcs = {}, cfg = {}, day = null, sb = null, here = null, lethal = false, threat = null } = {}) {
  const id = target?.id || target?.npcId || null, name = target?.name || null;
  const rec = (id && (character?.npcRegistry?.[id] || npcs?.[id]))
    || (name && (Object.values(character?.npcRegistry || {}).find(n => n?.name === name) || Object.values(npcs || {}).find(n => n?.name === name)))
    || null;
  const person = rec ? personOpponentFor(rec, { catalog, cfg, day }) : null;
  const fallbackThreat = Number(threat) || Number(target?.threat) || Math.max(20, Math.min(70, Math.round((Number(here?.dangerLevel) || 3) * 12)));
  const entry = { id: `harm-${slugify(target?.name || "foe")}-${(character?.activeEncounter?.state?.round || 0)}`,
    flavor: "fight", seed: `You have committed to violence against ${target?.name || "them"}.`,
    opponent: person || { name: target?.name, threat: fallbackThreat, tacticTags: [] } };
  const def = synthesizeDuelDef(entry);
  def.opponent.name = target?.name || def.opponent.name;
  if (person) {
    // the whole body rides on the def — the sheet is authored, the health is theirs
    def.opponent = { ...def.opponent, attributes: person.attributes, ...(person.subAttributes ? { subAttributes: person.subAttributes } : {}),
      health: person.health, energy: person.energy, soak: person.soak, level: person.level, skills: person.skills, tacticTags: person.tacticTags, _person: person._person };
    def.yieldAt = def.opponent.yieldAt = 0;   // a person fights to their own end, not to a synthesized fraction of 3–8
  }
  def.lethal = !!lethal;
  if (here?.dangerLevel != null) def.danger = here.dangerLevel;
  character.customEncounters = character.customEncounters || {};
  character.customEncounters[def.id] = def;
  const kind = (() => { try { return encounterKind(def); } catch { return null; } })();
  const oppSheet = sb ? synthesizeOpponentSheet(kind ? { ...def.opponent, encounterKind: kind } : def.opponent, sb) : null;
  const state = startEncounter(def, { oppSheet });
  character.activeEncounter = { defId: def.id, state };
  return { def, oppSheet, state };
}

/** A fresh turn record — sense → action → bonus. */
export function freshTurn() {
  return { phase: "sense", sel: { sense: [], action: [], bonus: [] }, text: { sense: "", action: "", bonus: "" }, setupBonus: 0, bonusEarned: false, senseDone: false, senseLine: "" };
}

/** ONE TURN, the way the app plays it (CCODE-45: sense → action → bonus). `sense`/`action`/`bonus` are declarations from
 *  `declFromSelection` (null to skip; a bonus resolves only if the sense EARNED one). Applies every round to the character,
 *  checks incapacitation after each, collapses on a finisher when asked. Returns the last round's receipt with `ended`,
 *  `outcome`, the beats, and the turn record. Was `sbResolveSense` + `sbExecuteTurn`, minus the narration. */
export function playTurn(character, def, { sense = null, action = null, bonus = null, intensity = "standard", content = null, rules = {}, sb = null, steps = null,
  rng = Math.random, day = null, seenTendency = null, finisher = false, family = null, frameContent = {}, catalog = {}, turnState = null } = {}) {
  const turn = freshTurn();
  // the app resolves the sense in one call and the action later; the read it earned rides in as `turnState`
  if (turnState) { turn.setupBonus = Number(turnState.setupBonus) || 0; turn.bonusEarned = !!turnState.bonusEarned; turn.senseDone = !!turnState.senseDone; }
  const beats = [], receipts = [];
  const state = () => character.activeEncounter?.state;
  const apply = (rr, decl, label) => {
    const r = applyRoundToCharacter(character, rr, decl, { catalog, rules, branchForks: content?.branchForks, traditionIndex: content?.traditionIndex, day, defId: def.id });
    beats.push(...r.beats);
    receipts.push({ label, decl, rr });
    if (state()) { state().lastOppReceipt = rr.opponent || null; state().lastReadWasSense = label === "sense"; if (label !== "sense") state().senseTierEarned = null; }
    return r;
  };
  let last = null, lastFn = seenTendency;
  if (sense) {
    const sd = resolveDeclRank(sense, { character, catalog });
    const rr = skillBattleRound(state(), def, sd, { character, content, rules, sb, steps, seenTendency: lastFn, rng, phase: "sense", tickEffects: false });
    character.energy = Math.max(0, character.energy + (rr.deltas?.energy || 0));
    character.activeEncounter = { defId: def.id, state: rr.state };
    turn.senseDone = true; turn.setupBonus = rr.setupBonus || 0; turn.bonusEarned = !!rr.bonusEarned?.player;
    turn.senseLine = `You read with ${sd.name}${sd.woven ? ` ⋈ ${sd.woven.name}` : ""} — ${(rr.player?.degree || "").replace("_", " ")}.`;
    if (state()) { state().lastOppReceipt = rr.opponent || null; state().lastReadWasSense = true; state().senseTierEarned = rr.senseTier ?? null; state().senseResist = rr.senseResist || null; }
    receipts.push({ label: "sense", decl: sd, rr });
    beats.push(turn.senseLine);
    last = rr;
  }
  turn.phase = "action";
  if (!action) return { rr: last, ended: false, outcome: null, beats, receipts, turn };
  const ad = resolveDeclRank(action, { character, catalog });
  const st = state();
  if (openGuards(character, st, ad, { catalog })) st.guardPick = [];
  const swingBefore = st?.momentum ?? 0;
  let rr = skillBattleRound(st, def, ad, { character, content, rules, sb, steps, seenTendency: lastFn, rng, phase: "action", tickEffects: !(turn.bonusEarned && bonus), setupBonus: turn.setupBonus || 0 });
  if (finisher) rr = collapseIfFinished(rr, def, { swingBefore, family, sb, frameContent });
  lastFn = ad.function;
  if (Array.isArray(st?.protections) && st.protections.length) rr.state.protections = tickProtections(st.protections);
  apply(rr, ad, "action");
  let ended = rr.ended, outcome = rr.outcome || null, endRR = rr;
  if (!ended && checkIncapacitation(character)) { ended = true; outcome = "incapacitated"; }
  if (!ended && turn.bonusEarned && bonus) {
    const bd = resolveDeclRank(bonus, { character, catalog });
    const br = skillBattleRound(state(), def, bd, { character, content, rules, sb, steps, seenTendency: lastFn, rng, phase: "bonus", tickEffects: true });
    apply(br, bd, "bonus");
    ended = br.ended; outcome = br.outcome || null; endRR = br;
    if (!ended && checkIncapacitation(character)) { ended = true; outcome = "incapacitated"; }
  }
  if (state()) state().turn = freshTurn();
  return { rr: endRR, ended, outcome, beats, receipts, turn, lastPlayerFn: lastFn };
}

/** THE END OF A BATTLE — XP, the companions' bond, the encounter cleared, and the INCAPACITATION TABLE when the player
 *  went down: who put you there decides what happens next (gear taken, days lost, or death into the same ladder every
 *  figure is on). Was `endEncounter` in app.js, which the skill-battle path NEVER CALLED. Returns { xp, plan }. */
export function endBattle(character, { outcome, def, rules = {}, content = null, catalog = {}, rng = Math.random, worldDay = null } = {}) {
  const encXp = rules?.encounters || {};
  const t = encXp[def?.type] || encXp.default || {};
  const xpMap = { opponent_fell: t.winXp, opponent_yielded: t.winXp, fled: t.fleeXp, yielded: t.yieldXp, completed: t.completeXp, abandoned: t.abandonXp, solved: t.solveXp, walked_away: t.walkAwayXp, incapacitated: 0 };
  const xp = Math.max(0, xpMap[outcome] ?? 0);
  character.xp = (Number(character.xp) || 0) + xp;
  const companions = activeCompanions(character, content?.companions || {});
  for (const c of companions) growBond(character, c.id, "encounter", rules, c.stages, { catalog, companions: content?.companions || {}, worldDay });
  character.activeEncounter = null;
  let plan = null;
  if (outcome === "incapacitated") {
    plan = incapacitationOutcome({ character, aggressor: def?.opponent || {}, encounter: { ...(def || {}), lethal: isLethalEncounter(def || {}, rules) }, companions, rules, rng });
    character.lastIncapacitation = { ...plan, day: character.clock?.day ?? null };
    if (plan.gearTaken?.length) {
      const gone = new Set(plan.gearTaken);
      character.inventory = (character.inventory || []).filter(i => !gone.has(i?.customName || i?.name));
    }
    if (plan.slain) {
      enterDeathState(character, playerDeathState(plan, { worldDay: worldDay ?? (character.clock?.day ?? 0) }));
      character.health = 0;
    } else {
      character.health = Math.max(1, character.health);
      character.energy = Math.max(5, character.energy);
      character.clock = character.clock || { day: 1 };
      character.clock.day = (character.clock.day || 1) + (plan.daysDown || 0);   // time passes while you are down
    }
  }
  return { xp, plan };
}
