// authormode.js — SNG-207b: the AUTHOR GOD-MODE. Erik-as-author (not the in-fiction GM, not the character)
// sets anything directly on the save. This is the DELIBERATELY SEPARATE surface the SNG-207 §0 guard
// reserved: a distinct entry point (`applyAuthorOps`), NOT a `skipFairness` flag on the fair-GM stateOps.
//
// The line it crosses is FAIRNESS (earned-ness): it grants xp, levels, power items, abilities, and forces
// arc stages — everything the fair GM refuses because "the story didn't give you that." The line it NEVER
// crosses is SAFETY: minor-safety and content-rating are their own controls, not character state, so this
// module simply never exposes them — a god-mode that edits state is not a lever on who the game is safe for.
//
// Author-gated at the UI (dev mode only) and fully LOGGED: every edit lands in `character.authorEdits`
// (append-only, separate from the fair-GM `corrections` ledger) so even god-mode leaves an audit trail.
// Pure over `character` (ctx supplies content + rules for the level/arc math); never throws.

import { applyLevelUps } from "./progression.js";
import { addItem } from "./inventory.js";
import { smartClamp } from "./namematch.js";
import { resolveRetrieval } from "./death.js"; // SNG-209: the author enacts a return/seal on a death state

const clampN = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(v) || 0)));

function ensureAuthorEdits(character) { if (!character.authorEdits) character.authorEdits = []; return character.authorEdits; } // registry:internal

function logEdit(character, entry, ctx) {
  ensureAuthorEdits(character);
  character.authorEdits.push({ ...entry, at: ctx.nowISO || null, worldDay: ctx.worldDay ?? null });
}

/** The god-mode op vocabulary — the fields each op reads, for the panel + the prompt-free direct surface. */
export const AUTHOR_OPS = ["addXp", "setLevel", "setSkillPoints", "restoreVitals", "setVital", "grantAbility", "grantItem", "setArcStage", "resolveDeath", "reparentLocation"];

/** Apply a set of AUTHOR (god-mode) ops directly to the save. Returns { applied:[], refused:[] }.
 *  NO fairness, NO trace, NO earned-ness check — that is the whole point of this surface. Safety floors are
 *  untouched because state is not safety. ctx: { rules, items, abilities (catalog), greaterArcs, worldDay, nowISO }. */
export function applyAuthorOps(character, ops = [], ctx = {}) {
  const applied = [], refused = [];
  const rules = ctx.rules || {};
  const per = rules.leveling?.xpPerLevel ?? 100;
  const note = op => smartClamp(String(op.note || "author edit"), 200); // author-typed label — word-boundary clamp
  for (const op of (ops || []).slice(0, 12)) {
    if (!op || !op.op) continue;
    switch (op.op) {
      case "addXp": {
        const amount = clampN(op.amount, -100000, 100000);
        character.xp = Math.max(0, (character.xp || 0) + amount);
        const msgs = applyLevelUps(character, rules); // level follows the game's own rule
        logEdit(character, { kind: "xp", amount, to: character.xp, leveled: msgs.length, note: note(op) }, ctx);
        applied.push({ addXp: amount, xp: character.xp, level: character.level });
        break;
      }
      case "setLevel": {
        const to = clampN(op.to, 1, 50);
        const from = character.level || 1;
        if (to > from) { character.xp = to * per - 1; applyLevelUps(character, rules); } // grants per-level rewards correctly, stops AT `to`
        else if (to < from) { character.level = to; character.xp = Math.min(character.xp || 0, to * per - 1); } // lowering: author's call, bare set
        logEdit(character, { kind: "level", from, to: character.level, note: note(op) }, ctx);
        applied.push({ setLevel: character.level });
        break;
      }
      case "setSkillPoints": {
        const to = clampN(op.to, 0, 999);
        const from = character.skillPoints || 0;
        character.skillPoints = to;
        logEdit(character, { kind: "skillPoints", from, to, note: note(op) }, ctx);
        applied.push({ setSkillPoints: to });
        break;
      }
      case "restoreVitals": {
        character.health = character.maxHealth; character.energy = character.maxEnergy;
        logEdit(character, { kind: "restore", note: note(op) }, ctx);
        applied.push({ restored: { health: character.health, energy: character.energy } });
        break;
      }
      case "setVital": {
        const vitals = new Set(["health", "energy", "maxHealth", "maxEnergy", "attunement"]);
        if (!vitals.has(op.vital)) { refused.push({ op, reason: `"${op.vital}" is not a vital` }); break; }
        const to = clampN(op.to, 0, 9999); // god-mode may RAISE (the fair correctVital may only lower)
        const from = character[op.vital] ?? 0;
        character[op.vital] = to;
        if (op.vital === "maxHealth" && character.health > to) character.health = to;
        if (op.vital === "maxEnergy" && character.energy > to) character.energy = to;
        logEdit(character, { kind: "vital", vital: op.vital, from, to, note: note(op) }, ctx);
        applied.push({ setVital: op.vital, to });
        break;
      }
      case "grantAbility": {
        const id = op.abilityId;
        const def = (ctx.abilities || {})[id];
        if (!def) { refused.push({ op, reason: `no ability "${id}" in the catalog` }); break; }
        character.abilities = character.abilities || [];
        if (character.abilities.some(a => a.abilityId === id)) { refused.push({ op, reason: `already knows "${id}"` }); break; }
        character.abilities.push({ abilityId: id, level: clampN(op.level ?? 1, 1, 5), authorGranted: true }); // bypasses domain gates — god-mode
        logEdit(character, { kind: "grantAbility", id, note: note(op) }, ctx);
        applied.push({ grantAbility: id });
        break;
      }
      case "grantItem": {
        const name = String(op.name || "").trim();
        if (!name) { refused.push({ op, reason: "need an item name" }); break; }
        character.inventory = character.inventory || [];
        // unlike the fair grantStoryItem, god-mode MAY grant a power item (effects/bonusTags ride through).
        const item = addItem(character, { name, kind: op.kind, description: op.description, effects: op.effects, bonusTags: op.bonusTags, qty: op.qty }, ctx.items || {});
        logEdit(character, { kind: "grantItem", name: item.name, note: note(op) }, ctx);
        applied.push({ grantItem: item.name });
        break;
      }
      case "setArcStage": {
        const arc = (ctx.greaterArcs || []).find(a => a.id === op.arcId);
        if (!arc) { refused.push({ op, reason: `no greater arc "${op.arcId}"` }); break; }
        const total = (arc.stages || []).length || 1;
        const target = clampN(op.stage, 1, total);
        const base = arc.currentStage ?? 1;
        character.worldState = character.worldState || {};
        character.worldState.arcStages = character.worldState.arcStages || {};
        const prev = character.worldState.arcStages[op.arcId] || {};
        // reuse the net-vector model: an author push that lands the canonical stage exactly on `target`.
        character.worldState.arcStages[op.arcId] = { ...prev, push: target - base, othersPush: 0, authorSet: true };
        logEdit(character, { kind: "arcStage", arcId: op.arcId, to: target, note: note(op) }, ctx);
        applied.push({ setArcStage: op.arcId, stage: target });
        break;
      }
      case "resolveDeath": {
        // SNG-209 §4/§5.5: the author moves a death STATE — RETURN a reachable figure (optionally CHANGED),
        // SEAL a death one-way, or FAIL an attempt (sinks deeper). Target is an epic status or a met NPC.
        const id = op.targetId;
        const target = character.worldState?.epicStatus?.[id] || character.npcRegistry?.[id];
        if (!target) { refused.push({ op, reason: `no dead figure "${id}" (epic status or npc registry)` }); break; }
        const outcome = op.outcome === "seal" ? "seal" : op.outcome === "fail" ? "fail" : "return";
        const res = resolveRetrieval(target, outcome, { currentDay: ctx.worldDay ?? null, changed: op.changed || null });
        if (!res.ok) { refused.push({ op, reason: res.why || "not in the death state" }); break; }
        logEdit(character, { kind: "resolveDeath", id, outcome, changed: op.changed || null, note: note(op) }, ctx);
        applied.push({ resolveDeath: id, outcome });
        break;
      }
      case "reparentLocation": {
        // CCODE-15: nest a stray gen-location under its true parent (or un-nest it) — the retroactive fix for
        // a transit-stub the mint left flat (Silas's Ent Grove → the crossroads). Only a GENERATED location
        // moves; canonical places are fixed geography. A falsy parentId clears the parent (back to top-level).
        const id = op.locationId, pid = op.parentId || null;
        const target = character.generated?.location?.[id];
        if (!target) { refused.push({ op, reason: `no generated location "${id}" (canonical places are fixed geography)` }); break; }
        if (pid === id) { refused.push({ op, reason: "a place cannot be its own parent" }); break; }
        if (pid) {
          const parent = (ctx.locations || {})[pid] || character.generated?.location?.[pid];
          if (!parent) { refused.push({ op, reason: `no location "${pid}" to nest under` }); break; }
          const prev = target.parentId || null;
          target.parentId = pid;
          const pregion = parent.regionId || parent.region; if (pregion) target.regionId = pregion; // a sub-place shares its parent's region
          logEdit(character, { kind: "reparentLocation", id, to: pid, from: prev, note: note(op) }, ctx);
          applied.push({ reparentLocation: id, parentId: pid });
        } else {
          const prev = target.parentId || null;
          delete target.parentId;
          logEdit(character, { kind: "reparentLocation", id, to: null, from: prev, note: note(op) }, ctx);
          applied.push({ reparentLocation: id, parentId: null });
        }
        break;
      }
      default: refused.push({ op, reason: `unknown author op "${op.op}"` });
    }
  }
  return { applied, refused };
}
