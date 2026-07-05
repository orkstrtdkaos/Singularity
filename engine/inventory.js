// inventory.js — items as first-class objects the character can access and USE.
// Storage shape on character.inventory: {id?, name, kind, qty, description?, effects?,
// bonusTags?, consumable?, image?}. Legacy saves held plain strings — normalize
// migrates them losslessly (additive-schema law: old saves keep working).

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
  const existing = character.inventory.find(m => m.name.toLowerCase() === item.name.toLowerCase());
  if (existing) existing.qty += item.qty;
  else if (character.inventory.length < 30) character.inventory.push(item);
  return item;
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

/** Equipment bonus for an action: +N per owned item whose bonusTags intersect the
 *  action's intent tags (capped). Data-driven from rules.baseChance.equipmentBonus. */
export function equipmentBonus(character, actionTags = [], rules) {
  const per = rules.baseChance.equipmentBonus ?? 5;
  const cap = rules.baseChance.equipmentBonusCap ?? 10;
  let bonus = 0;
  const helpers = [];
  for (const item of character.inventory || []) {
    if ((item.bonusTags || []).some(t => actionTags.includes(t))) {
      bonus += per;
      helpers.push(item.name);
    }
  }
  return { bonus: Math.min(cap, bonus), helpers };
}

/** One-line inventory summary for the GM prompt. */
export function inventoryForGM(character) {
  if (!character.inventory?.length) return "empty-handed";
  return character.inventory.map(i =>
    `${i.customName ? `${i.customName} (their name for: ${i.name})` : i.name}${i.qty > 1 ? ` x${i.qty}` : ""} (${i.kind}${i.consumable ? ", consumable" : ""}${i.description ? ` — ${i.description}` : ""})`
  ).join("; ");
}
