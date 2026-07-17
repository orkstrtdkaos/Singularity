// entityDetail.js — SNG-134 Part 2: ONE source of the hover/tap detail for the three things that recur
// everywhere — a SKILL, an NPC NAME, an ITEM. Every render site calls the same formatter so the detail
// reads identically no matter where the entity appears (the whole point: consistency). Pure — the app
// gathers the live values (catalog, rank progress, effective cost) and passes them in; these format them.

import { relationshipLabel, relationshipBand } from "./npcs.js";
import { itemUses } from "./inventory.js";

/** A skill's detail block. `opts`: {tradition, tier, owned, level, maxRank, effCost, baseCost, families[],
 *  rankText, ripe}. Returns plain text (for the shared popover). Pure. */
export function skillDetail(ab = {}, opts = {}) {
  const lines = [];
  lines.push(`${ab.name || ab.id || "a craft"}${opts.tradition ? ` — ${opts.tradition}` : ""}${opts.tier ? ` · Tier ${opts.tier}` : ""}`);
  lines.push(opts.owned ? `Rank ${opts.level || 1}/${opts.maxRank || 3}` : "Not yet learned");
  if (opts.rankText) lines.push(opts.rankText);
  if (opts.ripe) lines.push("✦ ripe for mastery — a defining moment could raise it");
  if (opts.effCost != null) lines.push(`⚡ ${opts.effCost} energy to use${opts.baseCost != null && opts.baseCost !== opts.effCost ? ` (base ${opts.baseCost})` : ""}`);
  if ((opts.families || []).length) lines.push(`Function: ${opts.families.join(" · ")}`);
  if (ab.description) lines.push(String(ab.description).slice(0, 160));
  if (ab.notFor) lines.push(`Cannot: ${String(ab.notFor).slice(0, 120)}`);
  return lines.filter(Boolean).join("\n");
}

/** An NPC's detail block — current relationship, standing, last seen, where known from. `opts`: {locations}.
 *  Reads the registry entry (bond, status, history, firstMet/lastSeen). Pure. */
export function npcDetail(n = {}, opts = {}) {
  const locName = id => opts.locations?.[id]?.name || null;
  const lines = [];
  lines.push(`${n.name || n.id || "someone"} — ${relationshipLabel(n)}`);
  if (n.role) lines.push(String(n.role).slice(0, 120));
  const statusNote = n.statusNote || (n.status && n.status !== "active" ? n.status : null);
  if (statusNote) lines.push(statusNote);
  const seen = locName(n.lastSeen?.locationId) || locName(n.firstMet?.locationId);
  if (seen) lines.push(`${n.lastSeen ? "Last seen" : "Met"}: ${seen}`);
  const lastHistory = Array.isArray(n.history) && n.history.length ? n.history[n.history.length - 1] : null;
  if (lastHistory) lines.push(String(lastHistory).replace(/^\[[^\]]*\]\s*/, "").slice(0, 140));
  return lines.filter(Boolean).join("\n");
}

/** An item's detail block — what it is, qty, pinned, its in-scene uses. Pure. */
export function itemDetail(it = {}) {
  const name = it.customName || it.name || "an item";
  const lines = [];
  lines.push(`${name}${it.qty > 1 ? ` ×${it.qty}` : ""}${it.customName && it.name && it.customName !== it.name ? ` (${it.name})` : ""}`);
  if (it.description) lines.push(String(it.description).slice(0, 160));
  if (it.pinned) lines.push("📌 pinned to the sidebar quick-access set");
  const uses = itemUses(it).map(u => u.label);
  if (uses.length) lines.push(`Use in scene: ${uses.join(" · ")}`);
  return lines.filter(Boolean).join("\n");
}

/** SNG-134 Part 3: the bonds read into PROSE (template — deterministic, no latency), grouped by depth.
 *  Evolves as bonds change (a caller re-derives it). Pure over the npc registry. Returns a paragraph or "". */
export function relationshipsParagraph(character) {
  const reg = character?.npcRegistry || {};
  const bonded = Object.values(reg)
    .filter(n => n.name && ((n.bondType && n.bondType !== "platonic") || Math.abs(n.relationship || 0) >= 3))
    .sort((a, b) => Math.abs(b.relationship || 0) - Math.abs(a.relationship || 0));
  if (!bonded.length) return "";
  const partner = bonded.find(n => n.bondType === "romantic" && (n.bondStage === "partner" || n.bondStage === "committed"));
  const close = bonded.filter(n => relationshipBand(n.relationship || 0) === "devoted" && n !== partner).slice(0, 2);
  const allies = bonded.filter(n => n !== partner && !close.includes(n) && (n.relationship || 0) > 0).slice(0, 5);
  const foes = bonded.filter(n => (n.relationship || 0) <= -4);

  const parts = [];
  if (partner) parts.push(`You travel closest to ${partner.name}, ${relationshipLabel(partner)}`);
  if (close.length) parts.push(`${partner ? "and " : "Closest to you are "}${andList(close.map(n => n.name))}${close.length === 1 ? "'s" : "'"} loyalty runs deep`);
  if (allies.length) parts.push(`a widening circle — ${andList(allies.map(n => n.name))} — call you ally`);
  if (foes.length) parts.push(`and ${andList(foes.map(n => n.name))} would sooner see you fall`);
  let out = parts.join("; ").replace(/;([^;]*)$/, "$1"); // last joiner reads cleaner without the semicolon
  return out ? out.charAt(0).toUpperCase() + out.slice(1) + "." : "";
}

function andList(names = []) {
  const a = names.filter(Boolean);
  if (a.length <= 1) return a[0] || "";
  if (a.length === 2) return `${a[0]} and ${a[1]}`;
  return `${a.slice(0, -1).join(", ")}, and ${a[a.length - 1]}`;
}
