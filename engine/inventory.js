// inventory.js — items as first-class objects the character can access and USE.
// Storage shape on character.inventory: {id?, name, kind, qty, description?, effects?,
// bonusTags?, consumable?, image?, aliases?}. Legacy saves held plain strings — normalize
// migrates them losslessly (additive-schema law: old saves keep working).
//
// SNG-BATCH-7 Phase 3: RESOLVE incoming items against the stack the SAME way the codex
// resolves entities — by id, catalog-name, custom name, alias, then fuzzy name-match — so
// GM phrasing variants ("a waterskin" / "the waterskin") collapse onto one stack instead
// of forking. Catalog re-link happens on any resolvable name, not just at normalize.

import { namesMatch, resolveByName, smartClamp } from "./namematch.js"; // SNG-152
import { grantSummary } from "./earnedpower.js"; // SNG-251 §2c: the item's mechanical sheet, one line

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

/** Add an item — from catalog id, plain name, or a GM-proposed object (clamped).
 *
 *  `opts.distinct` SKIPS the fuzzy stack-resolver. The resolver exists so drifted GM phrasings ("a
 *  waterskin" / "the waterskin") collapse onto one stack — right for a mention, catastrophic for a
 *  deliberate SPLIT. SNG-251 §2d found this the hard way: `namesMatch("Memory's Shadow-Twin", "Memory")`
 *  is TRUE, so deriving the shadow-twin merged it INTO its own parent — one stack of qty 2, wearing the
 *  child's custom name. The player would have lost the spear the whole ticket is about. A caller that
 *  KNOWS it is minting a new thing says so, and the resolver is not consulted. */
export function addItem(character, incoming, catalog = {}, opts = {}) {
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
      description: incoming.description ? smartClamp(String(incoming.description), 400) : undefined, // SNG-152
      effects: clampEffects(incoming.effects),
      bonusTags: Array.isArray(incoming.bonusTags) ? incoming.bonusTags.slice(0, 4).map(String) : undefined,
      consumable: !!incoming.consumable,
      image: incoming.image
    };
  }
  // SNG-BATCH-7 Phase 3: resolve to an existing stack (fuzzy), not just exact-name
  const existing = opts.distinct ? null : resolveInventoryItem(character, item, catalog);
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

// SNG-114: a non-consumable's "Use in scene" deserves a real verb, not the canned "I use my X here".
// An item may declare authored `uses: [{label, prompt}]`; otherwise these kind-defaults give common items
// meaningful options with no hand-authoring. `{item}` is substituted with the display name.
const ITEM_USE_DEFAULTS = {
  weapon: [{ label: "Ready it", prompt: "I ready my {item} and make my intent plain" }, { label: "Strike with it", prompt: "I strike with my {item}" }],
  tool: [{ label: "Put it to work", prompt: "I put my {item} to work on what is in front of me" }, { label: "Show it to someone", prompt: "I show them my {item} and what it is for" }],
  quest: [{ label: "Present it", prompt: "I present my {item}" }, { label: "Examine it closely", prompt: "I examine my {item} closely for anything I missed" }],
  tome: [{ label: "Read from it", prompt: "I read from my {item}" }, { label: "Show a passage", prompt: "I show them a passage from my {item}" }],
  misc: [{ label: "Put it to use", prompt: "I find a use for my {item} here" }]
};

// SNG-121: PINNED items are the sidebar quick-access set; everything else lives in the full Inventory view.
function defaultPinnedKind(it) { return it.kind === "weapon" || it.consumable === true || it.kind === "consumable" || (Array.isArray(it.uses) && it.uses.length > 0); }

/** Fill a never-pinned character's initial pinned set by kind (weapon + consumables + anything with authored
 *  uses), ONCE. After the player pins/unpins anything (`_pinsInitialized`), defaults never touch it again. */
export function ensurePins(character) {
  if (!character || character._pinsInitialized) return character;
  const inv = character.inventory || [];
  if (!inv.some(i => i.pinned)) for (const it of inv) if (defaultPinnedKind(it)) it.pinned = true;
  character._pinsInitialized = true;
  return character;
}

/** Toggle an item's sidebar pin (and mark the character as having made an explicit choice). Returns the new state. */
export function togglePin(character, name) {
  const it = (character?.inventory || []).find(i => i.name === name || i.customName === name);
  if (!it) return null;
  it.pinned = !it.pinned;
  character._pinsInitialized = true;
  return it.pinned;
}

export function pinnedItems(character) { return (character?.inventory || []).filter(i => i.pinned); }

/** SNG-114: the meaningful "use in scene" options for an item — authored `item.uses[]` wins; else the
 *  kind-defaults above (Q3). Pure; `{item}` → the display name. Empty array only for a kind with no default. */
export function itemUses(item = {}, displayNm = null) {
  const nm = displayNm || item.customName || item.name || "item";
  const sub = s => String(s || "").replace(/\{item\}/g, nm);
  if (Array.isArray(item.uses) && item.uses.length) return item.uses.slice(0, 5).map(u => ({ label: String(u.label || "").slice(0, 40), prompt: sub(u.prompt || u.label).slice(0, 160) }));
  return (ITEM_USE_DEFAULTS[item.kind] || ITEM_USE_DEFAULTS.misc).map(d => ({ label: d.label, prompt: sub(d.prompt) }));
}

export function removeItem(character, name, qty = 1) {
  const idx = character.inventory.findIndex(m => m.name.toLowerCase() === String(name).toLowerCase() || (m.customName || "").toLowerCase() === String(name).toLowerCase());
  if (idx === -1) return false;
  character.inventory[idx].qty -= qty;
  if (character.inventory[idx].qty <= 0) character.inventory.splice(idx, 1);
  return true;
}

/** SNG-137: EVOLVE an owned item's story as the fiction earns it — description / a truer name / provenance /
 *  tags / a new use grow past the shop-fresh line (Memory the spear that drinks a death). Bounded to OWNED
 *  items (never creates one); it DEEPENS the item, it does NOT inflate power (qty untouched, effects stay
 *  clamped). Returns [{name, changed:[fields]}]. */
export function applyItemUpdates(character, ops = [], opts = {}) {
  const applied = [];
  for (const op of (ops || []).slice(0, 6)) {
    const it = findItem(character, op?.name || op?.customName || "");
    if (!it) continue; // an unowned item is never created through an update — only add creates
    const changed = [];
    const before = { description: it.description || "", evoStage: it.evoStage || 0 };
    if (op.description != null) { it.description = smartClamp(String(op.description), 400); changed.push("description"); } // SNG-152
    if (op.customName != null && String(op.customName).trim()) { it.customName = String(op.customName).slice(0, 60); changed.push("name"); }
    if (op.provenance != null) { it.provenance = smartClamp(String(op.provenance), 160); changed.push("provenance"); } // SNG-152
    if (Array.isArray(op.bonusTags)) { it.bonusTags = op.bonusTags.map(t => String(t).slice(0, 24)).slice(0, 4); changed.push("tags"); }
    if (op.addUse && op.addUse.label) { it.uses = [...(it.uses || []), { label: String(op.addUse.label).slice(0, 40), prompt: String(op.addUse.prompt || op.addUse.label).slice(0, 160) }].slice(-5); changed.push("use"); }
    if (op.effects) { const fx = clampEffects(op.effects); if (fx) { it.effects = fx; changed.push("effects"); } } // still clamped — evolution, not inflation

    // SNG-251 §2c: EARNED POWER, recorded explicitly. This is the line gm.js:88 used to forbid outright
    // ("it does NOT grant new power") — the ban that left Erik's bound rune-threads with nowhere to live.
    // The rule is now "no UNEARNED power": a grant lands only when the caller supplies the earned-power
    // context (ceiling + a fiction cite), so the GM's path and the player's own evolve action are held to
    // the same bar, and the ceiling is Erik's §4 function of level + craft rank rather than a flat cap.
    if (op.grants && opts.ceiling && typeof opts.foldGrants === "function") {
      const fold = opts.foldGrants(it.grants || [], op.grants, opts.ceiling);
      if (fold.added.length || fold.replaced.length) {
        it.grants = fold.grants;
        changed.push("grants");
        if (fold.refused.length) applied.refused = [...(applied.refused || []), ...fold.refused.map(g => ({ item: it.customName || it.name, grant: g.name }))];
      }
    }
    // The evolution STAGE — the item's own count of how far the story has carried it (SNG-215 evoStage is
    // read by equipmentBonus, so this is a real mechanical step, not a label).
    if (op.evoStageName != null && String(op.evoStageName).trim()) { it.evoStageName = String(op.evoStageName).slice(0, 60); changed.push("stage"); } // prose-cap-ok: a stage NAME, not prose
    if (op.evolved || changed.includes("grants") || op.evoStageName != null) it.evoStage = Math.max(1, (it.evoStage || 1) + (op.evolved || changed.includes("grants") ? 1 : 0));

    // SNG-251 §2b: IMAGE INVALIDATION. applyItemUpdates has always rewritten `description`, and nothing
    // ever told the image it was stale — so a spear that grew runes kept showing its runeless picture,
    // which is half of what Erik reported. Bust the cache key ONLY on a real evolution (per OQ2's lean:
    // a grant, a stage, or a materially rewritten description), never on a tiny tweak, so an ordinary
    // provenance edit does not spend a generation. The OLD image is not deleted — it stays in the gallery
    // as history; this only moves the CURRENT view forward.
    const materially = changed.includes("grants") || changed.includes("stage")
      // NOT a cap — neither slice is stored; it compares the opening of the old and new description to tell a
      // real rewrite from a touch-up, so a comma edit never spends an image generation.
      || (changed.includes("description") && String(it.description).slice(0, 120) !== before.description.slice(0, 120)); // prose-cap-ok: a comparison prefix, not a stored cap
    if (materially) {
      it.imageStamp = (Number(it.imageStamp) || 0) + 1;   // the cache-key bust
      it.imagePrompt = op.imagePrompt ? smartClamp(String(op.imagePrompt), 300) : (it.description || it.imagePrompt);
      it.imageDirty = true;
      changed.push("image");
    }
    if (changed.length) applied.push({ name: it.customName || it.name, changed });
  }
  return applied;
}

/** SNG-251 §2d: DERIVE a linked child item — the split that Memory's shadow-twin is.
 *
 *  Erik: "now to show the shadow twin as its own item I can call — the GM fails to do so." There was no
 *  path at all: `itemUpdates` evolves ONE item and `addItem` creates an unlinked one, so a split could only
 *  ever be prose. This makes it two real items that know about each other.
 *
 *  DERIVED IS NOT LESSER (Erik corrected Aevi's first spec on exactly this). The child gets its OWN grants
 *  under the SAME economy as the parent — complementary, often stronger in its own domain. Nothing here
 *  scales a child down, and that absence is deliberate: the "echo at reduced strength" default is the thing
 *  the guard bans. Returns { item, parent } or null. */
export function deriveItem(character, op = {}, opts = {}) {
  const parent = findItem(character, op?.parent || op?.from || "");
  if (!parent || !op?.name) return null;
  if (opts.canDerive && !opts.canDerive(parent).ok) return null;
  const child = addItem(character, {
    name: String(op.name).slice(0, 60), // prose-cap-ok: an item name
    kind: op.kind || parent.kind || "misc",
    description: op.description ? smartClamp(String(op.description), 400) : parent.description,
    bonusTags: Array.isArray(op.bonusTags) ? op.bonusTags : undefined,
    consumable: false,
    qty: 1
    // `distinct` is load-bearing: a split's child is NAMED for its parent ("Memory's Shadow-Twin"), and the
    // fuzzy resolver reads that as the same item. Without this the derive merges the child into the parent.
  }, opts.catalog || {}, { distinct: true });
  if (!child || child === parent) return null;
  if (op.customName) child.customName = String(op.customName).slice(0, 60); // prose-cap-ok: a name
  child.derivedFrom = parent.customName || parent.name;
  child.provenance = smartClamp(String(op.provenance || `Split from ${parent.customName || parent.name}.`), 160);
  if (op.imagePrompt) child.imagePrompt = smartClamp(String(op.imagePrompt), 300);
  child.imageStamp = 1; child.imageDirty = true;         // §2b: a new item is a new picture, always
  child.evoStage = 1;
  if (op.grants && opts.ceiling && typeof opts.foldGrants === "function") {
    const fold = opts.foldGrants([], op.grants, opts.ceiling);   // its OWN sheet, same ceiling — never scaled down
    if (fold.grants.length) child.grants = fold.grants;
  }
  parent.derived = [...(parent.derived || []), child.customName || child.name].slice(0, 4);
  return { item: child, parent };
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
/** SNG-339 — TRAINING, THE OTHER HALF OF THE SAME QUESTION.
 *
 *  Aevi found that `character.skills` is read by resolve.js and WRITTEN BY NOTHING. It is worse than that:
 *  `action.skillId` has no writer either, and no vocabulary exists for it — so the term is not dormant, it is
 *  STRUCTURALLY UNREACHABLE. Up to 10 points per rank that no character could ever hold.
 *
 *  ⛔ IT KEYS ON THE ACTION TAGS THE GAME ALREADY HAS. `equipmentBonus` matches `item.bonusTags` against the
 *  action's tags, and 53 of those tags are already authored across the item catalogue. Training answers the
 *  same question the tool does — "does what you bring help with THIS?" — so it reads the same vocabulary
 *  rather than inventing a ninth one nobody would keep in sync.
 *
 *  ⚠️ BEST SKILL ONLY, not the sum. Being trained in three things that all touch this action is not three
 *  times as good at it, and a summing version would make a broad character strictly better than a deep one at
 *  everything — which is the opposite of what a skill is for. Mirrors equipmentBonus's topN for the same reason.
 *
 *  Pure. Returns { bonus, trained } so the receipt can name what helped. */
/** SNG-339 §1/§3 — WHERE TRAINING COMES FROM, AND HOW IT GROWS.
 *
 *  ⛔ THE SHAPE AEVI ASKED FOR ("I will write the tables once CCode says what shape the granting code
 *  wants"). Content authors a flat map of ACTION TAG -> RANK against a background or tradition id:
 *
 *      rules.startingSkills = {
 *        byBackground: { orphan:  { stealth: 1, quiet: 1 }, ... },
 *        byTradition:  { umbral:  { stealth: 1 }, ... }
 *      }
 *
 *  The tags are the SAME 53 already authored across `item.bonusTags`, so a background's training and a
 *  trade's tools speak one vocabulary and an author can see at a glance that an orphan who is good at
 *  moving unseen and a cloak that helps you move unseen agree.
 *
 *  ⚠️ RANKS ADD ACROSS SOURCES BUT THE GRANT IS CAPPED. Erik's goal is that a competent character
 *  usually succeeds at a routine task, NOT that creation hands out a ceiling — a background and a tradition
 *  that both teach stealth make you notably good at it, not unbeatable at it.
 *
 *  ⛔ AND IT INVENTS NOTHING. An unlisted background grants nothing rather than a guess; Aevi's note that
 *  the orphan's ONLY two aptitudes are penalties is a content bug she is fixing, and the engine must not
 *  paper over it with an invented consolation. Pure: returns the map, writes nothing.
 */
export function startingSkills({ backgroundId = null, traditionId = null } = {}, rules = {}) {
  const cfg = rules?.startingSkills || {};
  const capRank = Number.isFinite(cfg.grantCap) ? cfg.grantCap : 2;
  const out = {};
  const merge = (table) => {
    for (const [tag, rank] of Object.entries(table || {})) {
      if (tag.startsWith("_")) continue;
      const r = Number(rank);
      if (!Number.isFinite(r) || r <= 0) continue;
      out[tag] = Math.min(capRank, (out[tag] || 0) + r);
    }
  };
  if (backgroundId) merge(cfg.byBackground?.[backgroundId]);
  if (traditionId) merge(cfg.byTradition?.[traditionId]);
  return out;
}

/** SNG-339 §3 — TRAINING GROWS BY DOING, or it is a creation-only stat that decays in relevance.
 *  Aevi: "level 29 with zero skills is the current end state."
 *
 *  ⚠️ IT COUNTS USES, NOT SUCCESSES. Rewarding only success means the character who is already good at a
 *  thing gets better at it and the one who is struggling never improves — which is precisely backwards for
 *  the problem this ticket exists to solve. Failing at something hard IS practice.
 *
 *  Mutates `character.skills` and returns the tag that ranked up, or null. */
export function practiceSkill(character, actionTags = [], rules = {}) {
  const cfg = rules?.startingSkills || {};
  const per = Number.isFinite(cfg.usesPerRank) ? cfg.usesPerRank : 25;
  const maxRank = Number.isFinite(cfg.maxRank) ? cfg.maxRank : 2;
  if (!character || !actionTags?.length) return null;
  character.skills = character.skills || {};
  character.skillUses = character.skillUses || {};
  let ranked = null;
  for (const tag of actionTags) {
    if (typeof tag !== "string" || !tag) continue;
    const uses = (character.skillUses[tag] = (Number(character.skillUses[tag]) || 0) + 1);
    const earned = Math.min(maxRank, Math.floor(uses / per));
    if (earned > (Number(character.skills[tag]) || 0)) { character.skills[tag] = earned; ranked = tag; }
  }
  return ranked;
}

export function skillBonus(character, actionTags = [], rules = {}) {
  const per = rules?.baseChance?.skillBonus ?? 10;
  const cap = rules?.baseChance?.skillBonusCap ?? 20;
  const skills = character?.skills || {};
  const hits = [];
  for (const t of actionTags || []) {
    const rank = Number(skills[t]) || 0;
    if (rank > 0) hits.push({ tag: t, rank, b: rank * per });
  }
  if (!hits.length) return { bonus: 0, trained: [] };
  hits.sort((a, z) => z.b - a.b);
  const best = hits[0];
  return { bonus: Math.min(cap, best.b), trained: [`${best.tag} ${best.rank}`] };
}

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
  // SNG-251 §2c: an evolved item's GRANTS ride into the GM's context. Without this the GM narrates a spear
  // it does not know has a shadow-harm focus and an ending-sense — the mechanics would exist on the sheet
  // and be invisible to the one party that has to describe them in play.
  return character.inventory.map(i =>
    `${i.customName ? `${i.customName} (their name for: ${i.name})` : i.name}${i.qty > 1 ? ` x${i.qty}` : ""} (${i.kind}${i.consumable ? ", consumable" : ""}${i.description ? ` — ${i.description}` : ""}${grantSummary(i) ? `; ${grantSummary(i)}` : ""})`
  ).join("; ");
}

// ---------- CCODE-43: items in a fight ----------
// Erik: "do I use my dagger, or my axe... my metal shield or my energy shield? Inventory becomes functional -
// throw a chemical at them or drink a potion." Two doors, both read off fields items ALREADY carry, so nothing
// needs re-authoring: bonusTags (what the thing is good for) and effects (what spending it does).

/** Which battle functions does this item quietly help? Read from its own bonusTags. Pure. */
export function itemCombatFunctions(item, cfg = {}) {
  const map = cfg.tagFunctions || {};
  const out = new Set();
  for (const t of (item?.bonusTags || [])) for (const fn of (map[String(t).toLowerCase()] || [])) out.add(fn);
  return [...out];
}

/** WIELDED: what you carry adds a NAMED line to the moves it suits — never a hidden fudge, and capped so a
 *  full pack cannot out-weigh a craft. Best-first, like equipmentBonus in normal play. Pure. */
export function wieldBonusFor(character, fn, cfg = {}) {
  const per = cfg.wieldBonusPerItem ?? 4, cap = cfg.wieldBonusCap ?? 8;
  // A CONSUMABLE is never a passive bonus — a flask you have not thrown is not helping you swing. It earns its
  // keep by being SPENT as a move (usableCombatItems), which is the whole point of making inventory functional.
  const helping = (character?.inventory || []).filter(i => (i.qty ?? 1) > 0
    && !(i.consumable || i.kind === "consumable")
    && itemCombatFunctions(i, cfg).includes(fn));
  if (!helping.length) return null;
  helping.sort((a, b) => (b.evoStage || 1) - (a.evoStage || 1));
  const value = Math.min(cap, helping.length * per);
  return { value, items: helping.map(i => i.customName || i.name), label: `wielding ${helping.map(i => i.customName || i.name).slice(0, 2).join(" + ")}` };
}

/** USED: the consumables you could spend as a MOVE this step — drink to restore, throw to harm. Pure. */
export function usableCombatItems(character, cfg = {}) {
  const out = [];
  for (const i of (character?.inventory || [])) {
    if ((i.qty ?? 1) <= 0) continue;
    const consumable = i.consumable || i.kind === "consumable";
    if (!consumable) continue;
    const eff = i.effects || {};
    const restores = Number(eff.energy) || Number(eff.health) || 0;
    const throwable = (i.bonusTags || []).some(t => ["thrown", "chemical", "flask", "bomb"].includes(String(t).toLowerCase()))
      || /oil|acid|flask|powder|dust|vial|bomb/i.test(i.name || "");
    if (restores > 0) out.push({ item: i, mode: "drink", restores: { energy: Number(eff.energy) || 0, health: Number(eff.health) || 0 },
      label: `Drink ${i.customName || i.name}`, note: `restores ${[Number(eff.energy) ? `${eff.energy}e` : "", Number(eff.health) ? `${eff.health} hp` : ""].filter(Boolean).join(" + ")}` });
    else if (throwable) out.push({ item: i, mode: "throw", label: `Throw ${i.customName || i.name}`, note: "harms THEM — spends the item" });
  }
  return out.slice(0, cfg.maxItemMovesShown ?? 6);
}
