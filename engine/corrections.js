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
import { smartClamp, namesMatch } from "./namematch.js"; // SNG-152 (missed in the first sweep — see below)
import { BOND_TYPES, ROMANTIC_STAGES, applyNpcUpdates, findExistingNpc } from "./npcs.js"; // SNG-207/213: register + correct reuse the registry helpers
import { addItem } from "./inventory.js"; // SNG-207 §2: grant-story-conferred-item

const CORRECTABLE_FIELDS = new Set(["background", "origin", "nativeTradition", "form"]);
const DOMAIN_SLOTS = new Set(["primary", "secondary", "tertiary"]);
const VITALS = new Set(["health", "energy", "maxHealth", "maxEnergy"]);
const clampN = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(v))));
// fields a correction may NEVER touch — these ADVANCE, they don't repair.
const FORBIDDEN_FIELDS = new Set(["xp", "level", "skillPoints", "attunement", "health", "energy", "abilities", "inventory", "subAttributes", "attributes", "pendingSubPoints"]);

// SNG-213: the general repair's per-kind correctable-field whitelist — any WRONG *descriptive* field. Numeric
// / earned / clamped fields (rank, attribute, vital, relationship, xp/level) are DELIBERATELY absent: they
// keep their specialized clamped ops (correctAbilityRank/correctAttribute/correctVital/correctBond) so
// generalization never becomes a power leak (§GUARD clamps survive). Editable text only.
const CORRECTABLE_ENTITY_FIELDS = {
  player: new Set(["background", "origin", "nativeTradition", "form"]),
  npc: new Set(["name", "role", "description", "status", "gender", "pronouns"]),
  location: new Set(["name", "description"]),
  quest: new Set(["title", "name", "premise", "giver"]),
  item: new Set(["name", "description"]),
  codex: new Set(["label", "summary"]),
};
const NPC_STATUSES = new Set(["active", "injured", "missing", "departed", "dead"]);

export function ensureCorrections(character) { if (!character.corrections) character.corrections = []; return character.corrections; } // registry:internal

function log(character, entry, ctx) {
  ensureCorrections(character);
  character.corrections.push({ ...entry, worldDay: ctx.worldDay ?? null, at: ctx.nowISO || null });
}

/** SNG-207 §4/Q1: does the FICTION'S OWN RECORD show a trace of `needle` (an item/person the story is said
 *  to have conferred/established)? Checks the durable established-facts ledger (SNG-205 signal) + the
 *  chronicle beats + this turn's GM narration (ctx.traceText) — never the player's own request. This is what
 *  makes "the story gave it to me" CHECKABLE, not just assertable: a grant/register with no trace anywhere in
 *  the fiction is a wish, and refused. Case-insensitive substring / subjectId match; needs ≥3 chars. Pure. */
function hasFictionTrace(character, needle, ctx = {}) {
  const n = String(needle || "").toLowerCase().trim();
  if (n.length < 3) return false;
  const hit = s => String(s || "").toLowerCase().includes(n);
  if ((character.establishedFacts || []).some(f => hit(f.text) || String(f.subjectId || "").toLowerCase() === n)) return true;
  if ((character.chronicle || []).some(c => hit(typeof c === "string" ? c : (c?.text || c?.summary || c?.outcome || "")))) return true;
  if (hit(ctx.traceText)) return true;
  return false;
}

/** Apply a bounded set of GM correction ops. Returns { applied:[], refused:[], notes:[] }. */
export function applyStateOps(character, ops = [], ctx = {}) {
  const applied = [], refused = [];
  const backgrounds = ctx.backgrounds || [];
  const idx = ctx.traditionIndex;
  const locations = ctx.locations || {};
  for (const op of (ops || []).slice(0, 6)) {
    if (!op || !op.op) continue;
    // SNG-152 (late): this is MODEL PROSE and it reaches the player. corrections.js was in the
    // sweep table and never converted — the ten priority files were done and this one was left, so
    // a GM `why` still severed mid-word at exactly 200 chars. Erik saw it: "…is meta-play instructio".
    const why = smartClamp(String(op.why || "a correction"), 300);
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
        else if (op.kind === "item") { const before = (character.inventory || []).length; character.inventory = (character.inventory || []).filter(i => i.id !== id && i.name !== id && !namesMatch(i.name, String(id || ""))); removed = character.inventory.length !== before; } // SNG-213: the item-removal gap
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
        else { refused.push({ op, reason: "removable kinds are ability/companion/quest/codex/npc/item" }); break; }
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
        // SNG-162 §4: A REPAIR TOOL USED ROUTINELY IS A DEFECT REPORT THE GAME IS FILING AGAINST
        // ITSELF. Two players independently adopted this op as the normal way to finish a quest,
        // and we only learned that because Erik happened to mention it. Count it, so the next time
        // the primary path is decorative the game says so without needing a human to notice.
        character.telemetry = character.telemetry || {};
        character.telemetry.unstickQuestUses = (character.telemetry.unstickQuestUses || 0) + 1;
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
      // SNG-207 §2: register a person the FICTION clearly established but `meet` never fired for (the Teva
      // case). This is REPAIR — the story met them, the engine missed it — but a trace-check still guards
      // against inventing a person: the name must appear in the fiction's own record. Reuses the canonical
      // meet path (applyNpcUpdates), so the codex mirror (SNG-199) fires exactly as a real meet would.
      case "registerEstablishedNpc": {
        const name = String(op.name || "").trim();
        const npcId = op.npcId ? slug(op.npcId) : slug(name);
        if (!npcId || !name) { refused.push({ op, reason: "need a name to register an established person" }); break; }
        const existing = character.npcRegistry?.[npcId];
        if (existing && !existing._filledFromGenerate) { refused.push({ op, reason: `"${name}" is already known — nothing to register` }); break; }
        if (!hasFictionTrace(character, name, ctx)) { refused.push({ op, reason: `no trace of "${name}" in the story — register is for someone the fiction established, not a new person to invent` }); break; }
        applyNpcUpdates(character, [{ op: "meet", npcId, name, role: op.role, description: op.description, gender: op.gender, pronouns: op.pronouns }],
          { locationId: character.currentLocationId || null, day: ctx.worldDay ?? null });
        log(character, { kind: "registerNpc", id: npcId, name, why }, ctx);
        applied.push({ registeredNpc: npcId, name });
        break;
      }
      // SNG-207 §2/§4: record an item the NARRATIVE clearly conferred but the engine never wrote. This is the
      // GRANT rung — judged against a trace: the item must appear in the fiction's own record, else it is a
      // wish and refused. A story item is a NARRATIVE object (name + description only); mechanical power is
      // earned through play (items grow — SNG evolution), never granted here, so no effects/bonuses ride in.
      case "grantStoryItem": {
        const name = String(op.name || "").trim();
        if (!name) { refused.push({ op, reason: "need an item name" }); break; }
        if (!hasFictionTrace(character, name, ctx)) { refused.push({ op, reason: `the story didn't give you "${name}" — a grant records what the fiction conferred, not what you'd like to have` }); break; }
        character.inventory = character.inventory || [];
        const kind = ["quest", "tool", "consumable", "weapon", "misc"].includes(op.kind) ? op.kind : "misc";
        const item = addItem(character, { name, kind, description: op.description }, ctx.items || {}); // no effects/bonusTags — power is earned, not granted
        log(character, { kind: "grantItem", name: item.name, why }, ctx);
        applied.push({ grantedItem: item.name });
        break;
      }
      // SNG-207 §2: advance a structured quest the GM judges was completed in play but the tracker missed.
      // FORWARD-ONLY to a real stage (a backward move is unstickQuest's job); it catches the tracker up —
      // it never resolves the quest or hands out the outcome's rewards (those are earned at resolution).
      case "gmAdvanceQuest": {
        const q = (character.quests || []).find(x => x.id === op.questId);
        if (!q) { refused.push({ op, reason: `no quest "${op.questId}"` }); break; }
        if (!q.structured || !Array.isArray(q.stages)) { refused.push({ op, reason: "only a structured quest has stages to advance" }); break; }
        const si = q.stages.findIndex(s => s.id === op.toStage);
        if (si < 0) { refused.push({ op, reason: `no stage "${op.toStage}" in "${q.id}"` }); break; }
        const from = q.stageIndex || 0;
        if (si <= from) { refused.push({ op, reason: "gmAdvanceQuest only moves a quest FORWARD — a stuck/wrong state is unstickQuest's job" }); break; }
        q.stageIndex = si;
        q.progress = q.progress || [];
        for (let i = from; i < si; i++) { const ch = q.stages[i]?.change; if (ch && !q.progress.includes(ch)) q.progress.push(ch); } // the tracker catches up on the intervening changes
        log(character, { kind: "advanceQuest", id: q.id, from, to: si, why }, ctx);
        applied.push({ advancedQuest: q.id, toStage: op.toStage });
        break;
      }
      case "fixCodexFact": {
        const t = character.codex?.topics?.[op.topicId];
        if (!t) { refused.push({ op, reason: `no codex topic "${op.topicId}"` }); break; }
        const from = t.summary ?? t.description ?? null;
        t.summary = smartClamp(String(op.text ?? ""), 400); // SNG-152: a corrected codex fact is prose
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
      // SNG-213: THE GENERAL REPAIR — fix any WRONG descriptive field on any entity. {kind, id, field, to}.
      // Closes the coverage gaps (an NPC's name/role/description/status, a place's/quest's/item's/codex's
      // text, a player field) that had no op, so a willing GM no longer finds every fix refused. Still
      // repair-not-wish: only the whitelisted descriptive fields; numeric/earned fields keep their own clamped
      // ops. A repair is FREE (no trace needed — the game got a value wrong); the FICTION-conferred creates
      // go through registerEstablished/grantStoryItem, still trace-gated.
      case "correctEntityField": {
        const kind = op.kind, field = String(op.field || "");
        const allowed = CORRECTABLE_ENTITY_FIELDS[kind];
        if (!allowed) { refused.push({ op, reason: `"${kind}" is not a correctable entity kind` }); break; }
        if (!allowed.has(field)) { refused.push({ op, reason: `"${field}" is not a repairable field on a ${kind}${/rank|attribute|vital|xp|level|skill|relationship|bond/i.test(field) ? " — that's earned/clamped; use its own op (correctAbilityRank/correctAttribute/correctVital/correctBond) so it can only LOWER, never inflate" : ""}` }); break; }
        const to = op.to, id = op.id;
        let target = null;
        if (kind === "player") {
          if (field === "background" && backgrounds.length && !backgrounds.some(b => b.id === to)) { refused.push({ op, reason: `"${to}" is not a real background` }); break; }
          if ((field === "origin" || field === "nativeTradition") && idx && to && !idx.byId?.[to] && !/^(valleyfolk|harmonic|radiant_plateau|valley)$/.test(String(to))) { refused.push({ op, reason: `"${to}" is not a real people` }); break; }
          const from = character[field] ?? null;
          character[field] = field === "form" ? smartClamp(String(to ?? ""), 300) : smartClamp(String(to ?? ""), 60);
          target = { field, from, to: character[field] };
        } else if (kind === "npc") {
          const rec = character.npcRegistry?.[id] || findExistingNpc(character.npcRegistry || {}, slug(id || ""), String(to || ""));
          if (!rec) { refused.push({ op, reason: `no known person "${id}" — if the fiction established them but they're not on your list, use registerEstablishedNpc` }); break; }
          if (field === "status") { if (!NPC_STATUSES.has(to)) { refused.push({ op, reason: `status must be one of ${[...NPC_STATUSES].join("/")}` }); break; } rec.status = to; }
          else if (field === "name") { if (rec.name && rec.name !== rec.id) { rec.aliases = [...new Set([...(rec.aliases || []), rec.name])]; } rec.name = smartClamp(String(to), 60); if (rec.image) { delete rec.image; delete rec._portraitTier; } } // keep the old placeholder as an alias so refs resolve; re-mint the portrait
          else if (field === "gender" || field === "pronouns") { rec[field] = smartClamp(String(to), 40) || null; if (field === "gender" && rec.image) { delete rec.image; delete rec._portraitTier; } }
          else rec[field] = smartClamp(String(to), field === "description" ? 600 : 120);
          target = { field, id: rec.id, name: rec.name };
        } else if (kind === "location") {
          character.locationState = character.locationState || {};
          character.locationState[id] = { ...(character.locationState[id] || {}), [field]: smartClamp(String(to), field === "description" ? 600 : 120) };
          target = { field, id };
        } else if (kind === "quest") {
          const q = (character.quests || []).find(x => x.id === slug(String(id || "")) || x.title === id || x.id === id);
          if (!q) { refused.push({ op, reason: `no quest "${id}"` }); break; }
          q[field === "name" ? "title" : field] = smartClamp(String(to), 300);
          target = { field, id: q.id };
        } else if (kind === "item") {
          const it = (character.inventory || []).find(i => i.id === id || i.name === id || namesMatch(i.name, String(id || "")));
          if (!it) { refused.push({ op, reason: `no item "${id}" in your pack` }); break; }
          it[field] = smartClamp(String(to), field === "description" ? 400 : 60);
          target = { field, name: it.name };
        } else if (kind === "codex") {
          const t = character.codex?.topics?.[id];
          if (!t) { refused.push({ op, reason: `no codex topic "${id}"` }); break; }
          if (field === "label") t.label = smartClamp(String(to), 100); else t.summary = smartClamp(String(to), 400);
          target = { field, id };
        }
        log(character, { kind: "field", entity: kind, field, to: typeof to === "string" ? smartClamp(to, 120) : to, why }, ctx);
        applied.push({ correctedField: field, entity: kind, ...target });
        break;
      }
      case "refuse": {
        // the GM declined an advance in fiction — record it so the ledger shows the ask was made.
        refused.push({ op, reason: op.what ? `declined: ${smartClamp(String(op.what), 160)}` : "declined an advance" }); // SNG-152
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
  if (a.correctedField) return `${a.entity === "player" ? "your " : a.entity + "'s "}${a.field}${a.name ? ` (${a.name})` : ""} was set right`;
  if (a.registeredNpc) return `${a.name || "someone you'd met"} is now on your record of known people`;
  if (a.grantedItem) return `${a.grantedItem} was added to what you carry`;
  if (a.advancedQuest) return `a quest caught up to where the story left it`;
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
  // (4) SNG-162 §4: the repair path reporting on itself. Past a few uses, `unstickQuest` is no
  // longer repairing an edge case — it IS the interface, and the primary path is decorative.
  const unstickUses = character?.telemetry?.unstickQuestUses || 0;
  if (unstickUses > 3) out.push({ kind: "repairAsRoutine", uses: unstickUses,
    note: `quests have been unstuck by REPAIR ${unstickUses} times — the fiction should be advancing them via stageOps. If a quest's current stage has genuinely been satisfied in play, emit stageOps for it rather than leaving the player to repair it.` });
  return out;
}

/** SNG-137: render the anomalies as a GM POSSIBLE ERROR block (advisory — the GM may emit the matching
 *  stateOp to repair). Empty string when clean. */
/** SNG-207 §6.2: the AUTHORITATIVE Repair-panel capability, for the GM's context — so it can neither
 *  hallucinate a fix-screen control nor deflect to a missing one. Renders Aevi's authored manifest
 *  (content/packs/core/rules/repair_panel_manifest.json) verbatim as a prompt block. The governing rule:
 *  the GM PREFERS emitting the op itself in-turn; the panel is the player-facing fallback for the SAME ops,
 *  never a different capability, and never a control that isn't on this list. Returns null if unloaded. */
export function repairPanelForGM(manifest) {
  if (!manifest || !manifest.ops || typeof manifest.ops !== "object") return null;
  const ops = Object.entries(manifest.ops).map(([op, desc]) => `  • ${op} — ${desc}`).join("\n");
  const cannot = (manifest.cannotDoHere || []).map(c => `  • ${c}`).join("\n");
  return `THE REPAIR PANEL — its EXACT capability (${manifest.theRule || "these ops and no others"}).\n`
    + `Every fix below, YOU can emit in-turn (prefer that — ACT, don't deflect); the panel is the player-facing FALLBACK for the SAME ops, never a different power:\n${ops}\n`
    + (cannot ? `What the panel CANNOT do (do NOT send the player there for these):\n${cannot}\n` : "")
    + `⛔ Refer the player to the Repair panel ONLY for a control ON THIS LIST — never invent one, and never make it the first answer to something you can fix yourself this turn.`;
}

export function anomaliesForGM(anomalies = []) {
  if (!anomalies.length) return "";
  return anomalies.slice(0, 5).map(a => `- ${a.note}${a.kind === "dupNpc" ? ` → mergeEntity fromId:"${a.fromId}" intoId:"${a.intoId}"` : a.kind === "rankOverPractice" ? ` → correctAbilityRank id:"${a.abilityId}" to:${a.suggestRank ?? a.level - 1}` : a.kind === "vitalDesync" ? ` → correctVital vital:"${a.vital}" to:${a.max}` : ""}`).join("\n");
}
