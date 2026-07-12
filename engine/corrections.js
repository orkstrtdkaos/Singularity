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

const CORRECTABLE_FIELDS = new Set(["background", "origin", "nativeTradition", "form"]);
const DOMAIN_SLOTS = new Set(["primary", "secondary", "tertiary"]);
// fields a correction may NEVER touch — these ADVANCE, they don't repair.
const FORBIDDEN_FIELDS = new Set(["xp", "level", "skillPoints", "attunement", "health", "energy", "abilities", "inventory", "subAttributes", "attributes", "pendingSubPoints"]);

export function ensureCorrections(character) { if (!character.corrections) character.corrections = []; return character.corrections; }

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
  if (a.removed) return `removed a ${a.removed} you never acquired`;
  if (a.quest) return `quest "${a.quest}" unstuck`;
  if (a.location) return `re-anchored to where you actually are`;
  if (a.codexFact) return `a codex record was corrected`;
  return "corrected";
}
