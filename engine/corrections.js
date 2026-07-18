// corrections.js — SNG-070: the game self-heals. A bounded `stateOps` the GM proposes and the
// engine validates + applies to the ASKING PLAYER'S OWN save. REPAIR, NOT WISH:
//   ALLOWED — fix data that is WRONG: a field never chosen (background/origin/form), a domain the
//     game GUESSED, an entity never acquired (companion/quest/codex/npc), a stuck quest, a desynced
//     location pointer, a bad codex fact.
//   REFUSED — anything that ADVANCES: xp, levels, items, abilities outside the domain gates. Power
//     comes from play; the engine simply has no op that grants it, and refuses field-corrections
//     that would.
// Every correction is LOGGED (from → to, why, world-day) to character.corrections — append-only,
// reviewable, reversible. Bounded to this save; never touches shared canon or the rating floors.
// Pure over `character` (ctx supplies content for validation); never throws.

import { SUBS, syncParentAttributes } from "./progression.js";
import { isMinorSubject } from "./art.js";
import { BOND_TYPES, ROMANTIC_STAGES } from "./npcs.js";

const CORRECTABLE_FIELDS = new Set(["background", "origin", "nativeTradition", "form"]);
const DOMAIN_SLOTS = new Set(["primary", "secondary", "tertiary"]);
const VITALS = new Set(["health", "energy", "maxHealth", "maxEnergy"]);
const clampN = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(v))));
// fields a correction may NEVER touch — these ADVANCE, they don't repair.
const FORBIDDEN_FIELDS = new Set(["xp", "level", "skillPoints", "attunement", "health", "energy", "abilities", "inventory", "subAttributes", "attributes", "pendingSubPoints"]);

export function ensureCorrections(character) { if (!character.corrections) character.corrections = []; return character.corrections; } // registry:internal

function log(character, entry, ctx) {
  ensureCorrections(character);
  character.corrections.push({ ...entry, worldDay: ctx.worldDay ?? null, at: ctx.nowISO || null });
}

/** Apply a bounded set of GM correction ops. Returns { applied:[], refused:[], notes:[] }. */
export function applyStateOps(character, ops = [], ctx = {}) {
  const applied = [], refused = [];
  const backgrounds = ctx.backgrounds || [];
  const idx = ctx.traditionIndex;
  const locations = ctx.locations || {};
  for (const op of (ops || []).slice(0, 6)) {
    if (!op || !op.op) continue;
    const why = String(op.why || "a correction").slice(0, 200);
    switch (op.op) {
      case "correctField": {
        const field = op.field;
        if (FORBIDDEN_FIELDS.has(field) || !CORRECTABLE_FIELDS.has(field)) { refused.push({ op, reason: `"${field}" is not a repairable field — that would change what you EARNED, not what was mis-set` }); break; }
        if (field === "background" && backgrounds.length && !backgrounds.some(b => b.id === op.to)) { refused.push({ op, reason: `"${op.to}" is not a real background` }); break; }
        if ((field === "origin" || field === "nativeTradition") && idx && op.to && !idx.byId?.[op.to] && !/^(valleyfolk|harmonic|radiant_plateau|valley)$/.test(String(op.to))) { refused.push({ op, reason: `"${op.to}" is not a real people` }); break; }
        const from = character[field] ?? null;
        character[field] = field === "form" ? String(op.to ?? "").slice(0, 300) : String(op.to ?? "").slice(0, 60);
        log(character, { kind: "field", field, from, to: character[field], why }, ctx);
        applied.push({ field, from, to: character[field] });
        break;
      }
      case "correctDomain": {
        // re-choose a domain the game GUESSED. Does NOT grant/remove abilities — held ones are
        // grandfathered; the corrected domains gate only FUTURE learning (SNG-055).
        if (!DOMAIN_SLOTS.has(op.slot)) { refused.push({ op, reason: "domain slot must be primary/secondary/tertiary" }); break; }
        if (idx && op.to && !idx.byId?.[op.to]) { refused.push({ op, reason: `"${op.to}" is not a real tradition` }); break; }
        character.domains = character.domains || { primary: null, secondary: null, tertiary: null };
        const from = character.domains[op.slot] ?? null;
        character.domains[op.slot] = op.to || null;
        log(character, { kind: "domain", field: op.slot, from, to: character.domains[op.slot], why }, ctx);
        applied.push({ domain: op.slot, from, to: character.domains[op.slot] });
        break;
      }
      case "removeEntity": {
        const id = op.id; let removed = false;
        if (op.kind === "companion") { const before = (character.companions || []).length; character.companions = (character.companions || []).filter(c => c !== id && c?.id !== id); if (character.companionNames) delete character.companionNames[id]; removed = character.companions.length !== before; }
        else if (op.kind === "quest") { const before = (character.quests || []).length; character.quests = (character.quests || []).filter(q => q.id !== id); removed = character.quests.length !== before; }
        else if (op.kind === "codex") { if (character.codex?.topics?.[id]) { delete character.codex.topics[id]; removed = true; } }
        else if (op.kind === "npc") { if (character.npcRegistry?.[id]) { delete character.npcRegistry[id]; removed = true; } }
        else if (op.kind === "ability") {
          // SNG-070: STRIP an ability the character should never have had (the Silas case: Blazeborn
          // work off an Ashwarden). Removal is a REPAIR — it never grants; grandfathering is the
          // player's choice, not an engine default. Also drop any fork/aspiration tied to it.
          const before = (character.abilities || []).length;
          character.abilities = (character.abilities || []).filter(a => a.abilityId !== id);
          if (character.forkChoices) delete character.forkChoices[id];
          if (character.customAbilities) delete character.customAbilities[id];
          removed = character.abilities.length !== before;
        }
        else { refused.push({ op, reason: "removable kinds are ability/companion/quest/codex/npc" }); break; }
        if (removed) { log(character, { kind: "remove", entity: op.kind, id, why }, ctx); applied.push({ removed: op.kind, id }); }
        else refused.push({ op, reason: `no ${op.kind} "${id}" to remove` });
        break;
      }
      case "unstickQuest": {
        const q = (character.quests || []).find(x => x.id === op.questId);
        if (!q) { refused.push({ op, reason: `no quest "${op.questId}"` }); break; }
        const from = { status: q.status, stageIndex: q.stageIndex };
        if (op.toStatus && ["active", "available", "resolved", "failed"].includes(op.toStatus)) q.status = op.toStatus;
        if (q.structured && op.toStage != null && Array.isArray(q.stages)) { const si = q.stages.findIndex(s => s.id === op.toStage); if (si >= 0) q.stageIndex = si; }
        log(character, { kind: "quest", id: q.id, from, to: { status: q.status, stageIndex: q.stageIndex }, why }, ctx);
        applied.push({ quest: q.id, to: { status: q.status, stageIndex: q.stageIndex } });
        break;
      }
      case "reanchorLocation": {
        const dest = typeof ctx.resolveLocationId === "function" ? ctx.resolveLocationId(op.to, locations) : (locations[op.to] ? op.to : null);
        if (!dest) { refused.push({ op, reason: `no location "${op.to}"` }); break; }
        const from = character.currentLocationId;
        character.currentLocationId = dest;
        log(character, { kind: "location", from, to: dest, why }, ctx);
        applied.push({ location: dest });
        break;
      }
      case "fixCodexFact": {
        const t = character.codex?.topics?.[op.topicId];
        if (!t) { refused.push({ op, reason: `no codex topic "${op.topicId}"` }); break; }
        const from = t.summary ?? t.description ?? null;
        t.summary = String(op.text ?? "").slice(0, 400);
        log(character, { kind: "codexFact", id: op.topicId, from, to: t.summary, why }, ctx);
        applied.push({ codexFact: op.topicId });
        break;
      }
      // SNG-137: correct an ability's RANK that was set wrong. REPAIR-not-wish — it only LOWERS (a rank
      // higher than practice earned); it can never raise a rank (that's play, not a fix).
      case "correctAbilityRank": {
        const a = (character.abilities || []).find(x => x.abilityId === op.id);
        if (!a) { refused.push({ op, reason: `no ability "${op.id}"` }); break; }
        const want = clampN(op.to, 1, 3);
        if (!(want < a.level)) { refused.push({ op, reason: "a rank correction may only LOWER a wrongly-set rank — power is earned through play" }); break; }
        const from = a.level; a.level = want;
        log(character, { kind: "abilityRank", id: op.id, from, to: a.level, why }, ctx);
        applied.push({ abilityRank: op.id, from, to: a.level });
        break;
      }
      // SNG-137: correct a relationship state/stage that's wrong. Minor-safety absolute (never sets romantic
      // on a minor). Bounded: known bond kinds/stages; relationship clamped.
      case "correctBond": {
        const n = character.npcRegistry?.[op.id];
        if (!n) { refused.push({ op, reason: `no known person "${op.id}"` }); break; }
        if (op.bondType === "romantic" && isMinorSubject(n)) { refused.push({ op, reason: "a romantic bond can never be set on a minor" }); break; }
        const from = { bondType: n.bondType, bondStage: n.bondStage, relationship: n.relationship };
        let did = false;
        if (op.bondType != null && (op.bondType === "" || BOND_TYPES.includes(op.bondType))) { n.bondType = op.bondType || null; if (op.bondType !== "romantic") n.bondStage = null; did = true; }
        if (op.bondStage != null && (op.bondStage === "" || ROMANTIC_STAGES.includes(op.bondStage)) && n.bondType === "romantic") { n.bondStage = op.bondStage || null; did = true; }
        if (Number.isFinite(Number(op.relationship))) { n.relationship = clampN(op.relationship, -10, 10); did = true; }
        if (!did) { refused.push({ op, reason: "no valid bond field to correct" }); break; }
        log(character, { kind: "bond", id: op.id, from, to: { bondType: n.bondType, bondStage: n.bondStage, relationship: n.relationship }, why }, ctx);
        applied.push({ bond: op.id });
        break;
      }
      // SNG-137: fix a desynced vital (health/energy over max, or a wrong max). REPAIR-not-wish — current
      // health/energy may only be LOWERED (raising them is rest/recovery, earned through play); a MAX may be
      // corrected either way (a structural fix), and the pair re-clamps to stay coherent.
      case "correctVital": {
        if (!VITALS.has(op.vital) || !Number.isFinite(Number(op.to))) { refused.push({ op, reason: "vital must be health/energy/maxHealth/maxEnergy with a number" }); break; }
        const isMax = op.vital.startsWith("max");
        const from = character[op.vital];
        const to = clampN(op.to, isMax ? 1 : 0, isMax ? 999 : Math.max(character[op.vital === "health" ? "maxHealth" : "maxEnergy"] || 999, 0));
        if (!isMax && Number.isFinite(from) && to >= from) { refused.push({ op, reason: "a vital correction may only LOWER a desynced value — recovery is earned through play" }); break; }
        character[op.vital] = to;
        if (character.health > character.maxHealth) character.health = character.maxHealth; // keep the pair coherent
        if (character.energy > character.maxEnergy) character.energy = character.maxEnergy;
        log(character, { kind: "vital", field: op.vital, from, to: character[op.vital], why }, ctx);
        applied.push({ vital: op.vital, to: character[op.vital] });
        break;
      }
      // SNG-137: correct a mis-set attribute. REPAIR-not-wish — only LOWERS a wrongly-high sub; parents rederive.
      case "correctAttribute": {
        if (!SUBS.includes(op.sub)) { refused.push({ op, reason: "attribute must be a sub-attribute (strength/agility/…)" }); break; }
        character.subAttributes = character.subAttributes || {};
        const cur = Number(character.subAttributes[op.sub]) || 1;
        const want = clampN(op.to, 1, cur);
        if (!(want < cur)) { refused.push({ op, reason: "an attribute correction may only LOWER a mis-set value — growth is earned" }); break; }
        character.subAttributes[op.sub] = want;
        try { syncParentAttributes(character); } catch { /* parents rederive best-effort */ }
        log(character, { kind: "attribute", field: op.sub, from: cur, to: want, why }, ctx);
        applied.push({ attribute: op.sub, from: cur, to: want });
        break;
      }
      // SNG-137: merge two registry entries for ONE person (a dedup repair). Folds `fromId` into `intoId`.
      case "mergeEntity": {
        const reg = character.npcRegistry || {};
        const from = reg[op.fromId], into = reg[op.intoId];
        if (!from || !into || op.fromId === op.intoId) { refused.push({ op, reason: "mergeEntity needs two distinct known people (fromId → intoId)" }); break; }
        into.history = [...(into.history || []), ...(from.history || [])].slice(-24);
        into.knownFacts = [...new Set([...(into.knownFacts || []), ...(from.knownFacts || [])])].slice(-24);
        into.skillsObserved = [...new Set([...(into.skillsObserved || []), ...(from.skillsObserved || [])])].slice(-24);
        into.relationship = Math.max(into.relationship || 0, from.relationship || 0);
        into.aliases = [...new Set([...(into.aliases || []), from.name].filter(Boolean))];
        delete reg[op.fromId];
        log(character, { kind: "merge", id: op.fromId, into: op.intoId, why }, ctx);
        applied.push({ merged: op.fromId, into: op.intoId });
        break;
      }
      // SNG-143: correct a known person's sex/gender + pronouns (the Pell-rendered-male fix, player-side).
      // Free-string + inclusive; never guessed. Clears a baked portrait so it re-mints with the right gender.
      case "correctNpcGender": {
        const n = character.npcRegistry?.[op.id];
        if (!n) { refused.push({ op, reason: `no known person "${op.id}"` }); break; }
        if (op.gender == null && op.pronouns == null) { refused.push({ op, reason: "correctNpcGender needs a gender and/or pronouns" }); break; }
        const from = { gender: n.gender, pronouns: n.pronouns };
        if (op.gender != null) n.gender = String(op.gender).slice(0, 40) || null;
        if (op.pronouns != null) n.pronouns = String(op.pronouns).slice(0, 40) || null;
        if (n.image) { delete n.image; delete n._portraitTier; } // re-mint the portrait with the corrected gender
        log(character, { kind: "gender", id: op.id, from, to: { gender: n.gender, pronouns: n.pronouns }, why }, ctx);
        applied.push({ npcGender: op.id });
        break;
      }
      case "refuse": {
        // the GM declined an advance in fiction — record it so the ledger shows the ask was made.
        refused.push({ op, reason: op.what ? `declined: ${String(op.what).slice(0, 80)}` : "declined an advance" });
        break;
      }
      default: refused.push({ op, reason: `unknown correction "${op.op}"` });
    }
  }
  return { applied, refused };
}

/** A short human line for each applied correction — surfaced to the player as an aside. */
export function describeCorrection(a) {
  if (a.field) return `${a.field} corrected → ${a.to}`;
  if (a.domain) return `${a.domain} domain corrected → ${a.to || "—"}`;
  if (a.removed) return `removed ${a.removed === "ability" ? "an ability" : "a " + a.removed} you never acquired`;
  if (a.quest) return `quest "${a.quest}" unstuck`;
  if (a.location) return `re-anchored to where you actually are`;
  if (a.codexFact) return `a codex record was corrected`;
  if (a.abilityRank) return `a wrongly-set rank was corrected (${a.from}→${a.to})`;
  if (a.bond) return `a relationship was set right`;
  if (a.vital) return `${a.vital} was re-synced → ${a.to}`;
  if (a.attribute) return `a mis-set ${a.attribute} was corrected (${a.from}→${a.to})`;
  if (a.merged) return `two records for one person were merged`;
  if (a.npcGender) return `a person's gender was set right`;
  return "corrected";
}

const slug = s => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** SNG-137: a light consistency check — cheap, high-value likely errors surfaced so the GM (and the Repair
 *  panel) can CHOOSE to fix them. ADVISORY ONLY — never mutates. Returns [{kind, ...detail, note}]. Pure. */
export function detectAnomalies(character, { rules = {} } = {}) {
  const out = [];
  const reg = character?.npcRegistry || {};
  // (1) duplicate people — two registry entries whose names collide (a split identity to merge)
  const bySlug = {};
  for (const [id, n] of Object.entries(reg)) { const k = slug(n?.name); if (!k) continue; (bySlug[k] = bySlug[k] || []).push(id); }
  for (const ids of Object.values(bySlug)) if (ids.length > 1) out.push({ kind: "dupNpc", fromId: ids[1], intoId: ids[0], note: `${reg[ids[0]].name} appears as ${ids.length} separate records` });
  // (2) an ability rank higher than practice earned (a rank set wrong)
  const thr = rules?.practice?.useRankThreshold || {};
  for (const a of character?.abilities || []) {
    const uses = character?.practice?.uses?.[a.abilityId] || 0;
    const need = Number(thr[String(a.level)]);
    if (a.level > 1 && Number.isFinite(need) && uses < need) {
      // highest rank the practice ACTUALLY supports — the one-click fix lowers to here, not blindly to level-1
      let suggestRank = 1;
      for (let r = a.level - 1; r >= 1; r--) { const rn = Number(thr[String(r)]); if (!Number.isFinite(rn) || uses >= rn) { suggestRank = r; break; } }
      out.push({ kind: "rankOverPractice", abilityId: a.abilityId, level: a.level, uses, need, suggestRank, note: `${a.abilityId} sits at rank ${a.level} but has only ${uses}/${need} practice for it` });
    }
  }
  // (3) a vital past its max (a desync)
  if ((character?.health ?? 0) > (character?.maxHealth ?? Infinity)) out.push({ kind: "vitalDesync", vital: "health", value: character.health, max: character.maxHealth, note: `health ${character.health} exceeds max ${character.maxHealth}` });
  if ((character?.energy ?? 0) > (character?.maxEnergy ?? Infinity)) out.push({ kind: "vitalDesync", vital: "energy", value: character.energy, max: character.maxEnergy, note: `energy ${character.energy} exceeds max ${character.maxEnergy}` });
  return out;
}

/** SNG-137: render the anomalies as a GM POSSIBLE ERROR block (advisory — the GM may emit the matching
 *  stateOp to repair). Empty string when clean. */
export function anomaliesForGM(anomalies = []) {
  if (!anomalies.length) return "";
  return anomalies.slice(0, 5).map(a => `- ${a.note}${a.kind === "dupNpc" ? ` → mergeEntity fromId:"${a.fromId}" intoId:"${a.intoId}"` : a.kind === "rankOverPractice" ? ` → correctAbilityRank id:"${a.abilityId}" to:${a.suggestRank ?? a.level - 1}` : a.kind === "vitalDesync" ? ` → correctVital vital:"${a.vital}" to:${a.max}` : ""}`).join("\n");
}
