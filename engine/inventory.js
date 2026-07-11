// inventory.js — items as first-class objects the character can access and USE.
// Storage shape on character.inventory: {id?, name, kind, qty, description?, effects?,
// bonusTags?, consumable?, image?, aliases?}. Legacy saves held plain strings — normalize
// migrates them losslessly (additive-schema law: old saves keep working).
//
// SNG-BATCH-7 Phase 3: RESOLVE incoming items against the stack the SAME way the codex
// resolves entities — by id, catalog-name, custom name, alias, then fuzzy name-match — so
// GM phrasing variants ("a waterskin" / "the waterskin") collapse onto one stack instead
// of forking. Catalog re-link happens on any resolvable name, not just at normalize.

import { namesMatch, resolveByName } from "./namematch.js";

/** Find the existing stack an incoming item belongs to (id → name/custom/alias → fuzzy). */
export function resolveInventoryItem(character, incoming, catalog = {}) {
  const inv = character.inventory || [];
  const id = typeof incoming === "object" ? (incoming.id || null) : null;
  if (id) { const byId = inv.find(m => m.id === id); if (byId) return byId; }
  const name = typeof incoming === "string" ? incoming : (incoming?.name || "");
  if (!name) return null;
  // exact name / custom name first (cheap, precise)
  const exact = inv.find(m => m.name.toLowerCase() === name.toLowerCase() || (m.customName || "").toLowerCase() === name.toLowerCase());
  if (exact) return exact;
  // then fuzzy against name + customName + aliases (drifted phrasings)
  return resolveByName(name, inv, {
    getLabel: m => m.name,
    getAliases: m => [m.customName, ...(m.aliases || [])].filter(Boolean)
  });
}

function recordItemAlias(it, name) {
  if (!name || name.toLowerCase() === it.name.toLowerCase()) return;
  it.aliases = it.aliases || [];
  if (!it.aliases.some(a => a.toLowerCase() === name.toLowerCase())) it.aliases = [...it.aliases, String(name).slice(0, 60)].slice(-4);
}

/** Normalize a character's inventory in place: strings → item objects,
 *  known names re-linked to the catalog so they regain effects/bonuses. */
export function normalizeInventory(character, catalog = {}) {
  const byName = {};
  for (const it of Object.values(catalog)) byName[it.name.toLowerCase()] = it;
  character.inventory = (character.inventory || []).map(entry => {
    if (typeof entry !== "string") return entry;
    const cat = byName[entry.toLowerCase()];
    return cat ? fromCatalog(cat) : { id: null, name: entry, kind: "misc", qty: 1 };
  });
  // merge duplicate stacks of the same name
  const merged = [];
  for (const it of character.inventory) {
    const existing = merged.find(m => m.name.toLowerCase() === it.name.toLowerCase());
    if (existing) existing.qty += it.qty || 1;
    else merged.push({ ...it, qty: it.qty || 1 });
  }
  character.inventory = merged;
  return character;
}

export function fromCatalog(catItem, qty = 1) {
  const { id, name, kind, description, effects, bonusTags, consumable, image } = catItem;
  return { id, name, kind, qty, description, effects, bonusTags, consumable, image };
}

/** Add an item — from catalog id, plain name, or a GM-proposed object (clamped). */
export function addItem(character, incoming, catalog = {}) {
  let item;
  if (typeof incoming === "string") {
    const cat = catalog[incoming] || Object.values(catalog).find(c => c.name.toLowerCase() === incoming.toLowerCase());
    item = cat ? fromCatalog(cat) : { id: null, name: incoming.slice(0, 60), kind: "misc", qty: 1 };
  } else {
    item = {
      id: catalog[incoming.id] ? incoming.id : null,
      name: String(incoming.name || "curious object").slice(0, 60),
      kind: ["weapon", "tool", "consumable", "quest", "misc"].includes(incoming.kind) ? incoming.kind : "misc",
      qty: Math.max(1, Math.min(10, incoming.qty | 0 || 1)),
      description: incoming.description ? String(incoming.description).slice(0, 300) : undefined,
      effects: clampEffects(incoming.effects),
      bonusTags: Array.isArray(incoming.bonusTags) ? incoming.bonusTags.slice(0, 4).map(String) : undefined,
      consumable: !!incoming.consumable,
      image: incoming.image
    };
  }
  // SNG-BATCH-7 Phase 3: resolve to an existing stack (fuzzy), not just exact-name
  const existing = resolveInventoryItem(character, item, catalog);
  if (existing) {
    existing.qty += item.qty;
    recordItemAlias(existing, item.name); // remember the drifted phrasing
    if (!existing.id && item.id) Object.assign(existing, fromCatalog(catalog[item.id] || item, existing.qty)); // late catalog re-link
    return existing;
  }
  if (character.inventory.length < 30) character.inventory.push(item);
  return item;
}

/** SNG-BATCH-7 Phase 3 reconcile: collapse duplicate stacks a pre-resolver save forked
 *  (fuzzy name/custom/alias match), summing quantities + catalog-relinking. Idempotent.
 *  Returns [{into, absorbed, qty}]. */
export function dedupeInventory(character, catalog = {}) {
  const inv = character.inventory || [];
  const merged = [];
  let changed = true;
  while (changed) {
    changed = false;
    outer:
    for (let i = 0; i < inv.length; i++) {
      for (let j = i + 1; j < inv.length; j++) {
        const a = inv[i], b = inv[j];
        const match = (a.id && a.id === b.id) || namesMatch(a.name, b.name) ||
          (a.aliases || []).some(x => namesMatch(x, b.name)) || (b.aliases || []).some(x => namesMatch(x, a.name));
        if (!match) continue;
        // primary: cataloged beats uncataloged, then larger stack
        const [p, s] = ((a.id ? 1 : 0) * 100 + a.qty) >= ((b.id ? 1 : 0) * 100 + b.qty) ? [a, b] : [b, a];
        p.qty += s.qty;
        recordItemAlias(p, s.name);
        if (s.customName && !p.customName) p.customName = s.customName;
        if (!p.id && s.id) Object.assign(p, fromCatalog(catalog[s.id] || s, p.qty));
        inv.splice(inv.indexOf(s), 1);
        merged.push({ into: p.name, absorbed: s.name, qty: p.qty });
        changed = true;
        break outer;
      }
    }
  }
  return merged;
}

/** Player names an item (agency, no GM involvement). Original name kept as subtitle. */
export function nameItem(character, originalName, customName) {
  const it = findItem(character, originalName);
  if (!it) return false;
  it.customName = String(customName).slice(0, 40).trim() || undefined;
  return true;
}

export function findItem(character, name) {
  const q = String(name).toLowerCase();
  return (character.inventory || []).find(m => m.name.toLowerCase() === q || (m.customName || "").toLowerCase() === q) || null;
}

export function displayName(item) {
  return item.customName ? `${item.customName}` : item.name;
}

export function removeItem(character, name, qty = 1) {
  const idx = character.inventory.findIndex(m => m.name.toLowerCase() === String(name).toLowerCase() || (m.customName || "").toLowerCase() === String(name).toLowerCase());
  if (idx === -1) return false;
  character.inventory[idx].qty -= qty;
  if (character.inventory[idx].qty <= 0) character.inventory.splice(idx, 1);
  return true;
}

function clampEffects(fx) {
  if (!fx || typeof fx !== "object") return undefined;
  const out = {};
  if (fx.health) out.health = Math.max(-10, Math.min(15, fx.health | 0));
  if (fx.energy) out.energy = Math.max(-10, Math.min(25, fx.energy | 0));
  return Object.keys(out).length ? out : undefined;
}

/** Consume a consumable: apply its effects, decrement stack. Returns applied deltas or null. */
export function consumeItem(character, name) {
  const item = findItem(character, name);
  if (!item || !item.consumable) return null;
  const fx = item.effects || {};
  if (fx.health) character.health = Math.max(0, Math.min(character.maxHealth, character.health + fx.health));
  if (fx.energy) character.energy = Math.max(0, Math.min(character.maxEnergy, character.energy + fx.energy));
  removeItem(character, name, 1);
  return fx;
}

/** Equipment bonus for an action: the BEST-matching item's bonus, not a sum over every
 *  broadly-tagged item in the bag (SNG-044 — the right tool helps; a bag of tools does not help
 *  more). Only the top `equipmentBonusTopN` contributors (default 1) count; the total cap stays
 *  a backstop. `helpers` names which item(s) actually aided, so the roll receipt can say so.
 *  Data-driven from rules.baseChance. */
export function equipmentBonus(character, actionTags = [], rules) {
  const per = rules.baseChance.equipmentBonus ?? 5;
  const cap = rules.baseChance.equipmentBonusCap ?? 10;
  const topN = Math.max(1, rules.baseChance.equipmentBonusTopN ?? 1);
  const contributors = [];
  for (const item of character.inventory || []) {
    if ((item.bonusTags || []).some(t => actionTags.includes(t))) {
      const b = per + (item.evoStage ? (item.evoStage - 1) * (rules.baseChance.evoStageStep ?? 2) : 0);
      contributors.push({ b, name: item.evoStageName || item.name });
    }
  }
  contributors.sort((a, z) => z.b - a.b);               // best tool first
  const chosen = contributors.slice(0, topN);            // only the best (or top-N), never the pile
  const bonus = Math.min(cap, chosen.reduce((s, c) => s + c.b, 0));
  return { bonus, helpers: chosen.map(c => c.name) };
}

/** One-line inventory summary for the GM prompt. */
export function inventoryForGM(character) {
  if (!character.inventory?.length) return "empty-handed";
  return character.inventory.map(i =>
    `${i.customName ? `${i.customName} (their name for: ${i.name})` : i.name}${i.qty > 1 ? ` x${i.qty}` : ""} (${i.kind}${i.consumable ? ", consumable" : ""}${i.description ? ` — ${i.description}` : ""})`
  ).join("; ");
}
