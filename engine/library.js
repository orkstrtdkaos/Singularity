// engine/library.js — THE LIBRARY'S INDEX AND RENDERERS, out of app.js so the gate can run the production path.
//
// ✅ SNG-538 §4 (Aevi 2026-09-11; Erik GO 2026-09-11: "not only are they out of date, but they are riddled with all caps notes and other
// phrasing that is not meant for a player finished product audience"): renderLibrary rendered fifteen documents through esc() and never
// through playerText() — 788 authoring glyphs reached the player — and LIB_SKIP filtered a NAMED list while 57 `_`-prefixed build notes,
// carrying no name it knew, were served as lore under headings ("_parentsMirrored_20260830 — ⛔ PARENTS MIRRORED FROM foothills.json…").
// Both doors are here: every string the Library shows passes playerText (the door every craft surface has had since SNG-165), and a
// `_`-prefixed key is private, as it is everywhere else in this repo. The capitals are content and Aevi's. Pure string builders, no DOM —
// §181 renders every LIBRARY_INDEX document through exactly these functions and asserts that no glyph and no private key reaches the page.
import { playerText } from "./namematch.js";
import { ringOrder, antipodeOf } from "./traditions.js";   // §184: the great circle's own reads
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const LIBRARY_INDEX = [
  { cat: "The World", entries: [
    { id: "exesa", label: "Exesa \u2014 the world, entire", path: "docs/EXESA.md", kind: "md" },
    { id: "guide", label: "A Player's Guide", path: "docs/PLAYERS_GUIDE.md", kind: "md" },
  ] },
  { cat: "What You Can Be", entries: [
    { id: "vocations", label: "The Eight Vocations", path: "docs/VOCATIONS.md", kind: "md" },
    { id: "archetypes", label: "Archetypes, domain by domain", path: "docs/ARCHETYPES.md", kind: "md" },
  ] },
  { cat: "Peoples & Traditions", entries: [
    { id: "great_circle", label: "The Great Circle", kind: "circle" },
    { id: "reaches", label: "The Twelve Reaches", path: "content/packs/valley/lore/the_twelve_reaches.json", kind: "json" },
  ] },
  { cat: "Cosmology", entries: [
    { id: "framing", label: "The Shape of the World", path: "content/packs/valley/lore/world_framing.json", kind: "json" },
    { id: "coordinate", label: "The Coordinate World & the Center", path: "content/packs/valley/lore/the_coordinate_world.json", kind: "json" },
    { id: "poles", label: "Pole & Intensity", path: "content/packs/valley/lore/the_pole_intensity_model.json", kind: "json" },
  ] },
  { cat: "The Valley", entries: [
    { id: "primer", label: "A Valley Primer", path: "content/packs/valley/lore/valley_primer.md", kind: "md" },
    { id: "precursors", label: "The Precursors", path: "content/packs/valley/lore/precursors.md", kind: "md" },
  ] },
  { cat: "Powers & Crafts", entries: [
    { id: "traditions", label: "The Traditions", path: "content/packs/valley/lore/tradition_profiles.json", kind: "json" },
    { id: "powers", label: "The Power Systems", path: "content/packs/valley/lore/power_systems.md", kind: "md" },
    { id: "roles", label: "Universal Roles", path: "content/packs/valley/lore/universal_roles.json", kind: "json" },
    { id: "game", label: "The Game & the Coin", path: "content/packs/valley/lore/the_game_and_coin.json", kind: "json" },
    { id: "arcs", label: "Greater Arcs", path: "content/packs/valley/lore/greater_arcs.json", kind: "json" },
  ] },
];

// GM-only / meta keys never shown to the player.
export const LIB_SKIP = /^(schemaVersion|id|kind|note|designNote|buildPlan|buildNeeds.*|owed|migration|status|version|packId)$/i;
// ⛔ SPLIT, AND THE `i` FLAG IS THE REASON. `gm[_A-Z]` was written to catch camelCase `gmHint` and
// snake `gm_hint` — and under /i the `[A-Z]` also matches lowercase, so it matched the letters "gme"
// INSIDE ORDINARY WORDS. ⚠️ MEASURED: judgment, augment, fragment, segment and pigment were all being
// stripped from the player's Library, and `judgment` is a real field in `tradition_profiles.json`, which
// the Library serves — so a tradition's judgment never reached a reader.
// ⛑ The gm branch is now CASE-SENSITIVE (its whole point was the capital); everything else keeps /i.
const LIB_SECRET_GM = /(^|[^a-zA-Z])gm(_|[A-Z])/;
// ⛔ AND THREE NAMED OUTRIGHT, because no PATTERN catches them and the accident above was doing it.
// `whatHealingMustDo`, `segments` and `fragments` are GM material — `scripts/gm_companion.mjs` collects all
// three into the GM's book — and only `segments`/`fragments` were ever hidden here, by matching the letters
// "gme". ⚠️ `whatHealingMustDo` was never hidden at all. ⛑ A smoke gate now holds the two lists together:
// every key the GM book COLLECTS must be a key the Library STRIPS, so this can never drift again.
const LIB_SECRET_NAMED = /^(whatHealingMustDo|segments|fragments)$/;
const LIB_SECRET = /(gmeyes|eyes.?only|secret|hidden|hook|mandate|internal|_pat|token|guidance)/i;
export function libSkipKey(k) { return /^_/.test(k) || LIB_SKIP.test(k) || LIB_SECRET_GM.test(k) || LIB_SECRET_NAMED.test(k) || LIB_SECRET.test(k); }
export function libPretty(k) { return String(k).replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, c => c.toUpperCase()); }

/** ✅ §184 (2026-09-12): THE GREAT CIRCLE'S PROSE — the peoples, their poles, what each civilization is, and the Valley's folk crafts.
 *  ⛔ THE ONE LIBRARY SURFACE §181 COULD NOT SEE. Its index entry has no `path` (it is drawn, not fetched), so the gate that renders
 *  every document could not render it, and this text went to the page through `esc()` alone — the same door SNG-538 §4.1 closed
 *  everywhere else. A gate that silently skips what it cannot address reports the coverage it wishes it had.
 *  Pure: the SVG and the tradition-label helper stay with the page; `label` names a tradition (app.js's `traditionLabel`).
 *  Every string passes `playerText`. Returns { rows, folk } as HTML fragments. */
export function circleRows(index, { folk = [], label = (id) => String(id) } = {}) {
  const pt = (s) => esc(playerText(String(s ?? "")));
  const rows = ringOrder(index).map(t => {
    const tr = index?.byId?.[t];
    if (!tr) return "";
    const st = (index?.stations || []).find(s => s.traditionId === t);
    return `<div class="lore-entry"><h4 class="lore-h">${pt(tr.name || t)}${tr.craft ? ` <span class="hint">— ${pt(tr.craft)}</span>` : ""}</h4>
      <div class="lore-field"><span class="lore-key">Pole:</span> ${pt(st?.pole || tr.pole || "?")} · <span class="lore-key">Across the ring:</span> ${pt(label(antipodeOf(t, index)))}</div>
      ${tr.civilization ? `<p class="lore-p">${pt(tr.civilization)}</p>` : ""}${tr.aesthetic ? `<p class="lore-p"><em>${pt(tr.aesthetic)}</em></p>` : ""}</div>`;
  }).join("");
  const folkRows = (Array.isArray(folk) ? folk : []).map(f =>
    `<div class="lore-field"><span class="lore-key">${pt(f?.name || f?.traditionId)}:</span> ${pt(f?.aesthetic || "a Valley folk-craft, open to all")}</div>`).join("");
  return { rows, folk: folkRows };
}

/** Generic lore → readable HTML. Walks objects/arrays into headings + prose; filters GM fields. */
export function loreToHtml(value, depth = 0) {
  if (value == null) return "";
  if (typeof value === "string") return `<p class="lore-p">${esc(playerText(value))}</p>`;
  if (typeof value === "number" || typeof value === "boolean") return `<p class="lore-p">${esc(playerText(String(value)))}</p>`;
  if (Array.isArray(value)) {
    if (!value.length) return "";
    if (value.every(v => typeof v === "string")) return `<ul class="lore-list">${value.map(v => `<li>${esc(playerText(v))}</li>`).join("")}</ul>`;
    return value.map(v => {
      if (v && typeof v === "object") {
        const title = v.name || v.title || v.label || v.people || v.craft || v.role || v.id;
        return `<div class="lore-entry">${title ? `<h4 class="lore-h">${esc(playerText(libPretty(title)))}</h4>` : ""}${loreToHtml(stripTitle(v), depth + 1)}</div>`;
      }
      return loreToHtml(v, depth + 1);
    }).join("");
  }
  if (typeof value === "object") {
    return Object.entries(value).filter(([k]) => !libSkipKey(k)).map(([k, v]) => {
      const H = depth <= 0 ? "h3" : "h4";
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean")
        return `<div class="lore-field"><span class="lore-key">${esc(libPretty(k))}:</span> ${esc(playerText(String(v)))}</div>`;
      const inner = loreToHtml(v, depth + 1);
      return inner ? `<div class="lore-section"><${H} class="lore-h">${esc(libPretty(k))}</${H}>${inner}</div>` : "";
    }).join("");
  }
  return "";
}
export function stripTitle(o) { const c = { ...o }; for (const k of ["name", "title", "label"]) delete c[k]; return c; }

/** Inline markdown emphasis on already-escaped text: **bold**, *italic* / _italic_. */
export function libInline(escaped) {
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(/\b_([^_\n]+)_\b/g, "<em>$1</em>");
}

/** Minimal markdown → HTML for the .md lore (headings, lists, paragraphs, inline emphasis). */
export function libMdToHtml(md) {
  const lines = String(md || "").split(/\r?\n/);
  let html = "", inList = false, inTable = false, tableHeadDone = false;
  const closeList = () => { if (inList) { html += "</ul>"; inList = false; } };
  const closeTable = () => { if (inTable) { html += tableHeadDone ? "</tbody></table>" : "</tr></thead></table>"; inTable = false; tableHeadDone = false; } };
  const ln = s => libInline(esc(playerText(s)));   // SNG-538 §4.1: the same door every craft surface has had since SNG-165
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^#{3,}\s/.test(line)) { closeList(); closeTable(); html += `<h4 class="lore-h">${ln(line.replace(/^#+\s/, ""))}</h4>`; }
    else if (/^##\s/.test(line)) { closeList(); closeTable(); html += `<h3 class="lore-h">${ln(line.replace(/^#+\s/, ""))}</h3>`; }
    else if (/^#\s/.test(line)) { closeList(); closeTable(); html += `<h2 class="lore-h">${ln(line.replace(/^#+\s/, ""))}</h2>`; }
    else if (/^\s*\|.*\|\s*$/.test(line)) {
      // SNG-061 (2026-09-08): TABLES. EXESA.md and VOCATIONS.md are table-heavy and the reader rendered
      // every row as a paragraph of raw pipes. A separator row (|---|---|) closes the header.
      closeList();
      if (/^\s*\|[\s:|-]+\|\s*$/.test(line)) { if (inTable && !tableHeadDone) { html += "</tr></thead><tbody>"; tableHeadDone = true; } continue; }
      const cells = line.trim().replace(/^\||\|$/g, "").split("|").map(c => ln(c.trim()));
      if (!inTable) { html += "<table class='lore-table'><thead><tr>"; inTable = true; tableHeadDone = false; }
      else if (!tableHeadDone) { html += "</tr><tr>"; }
      else { html += "<tr>"; }
      const tag = tableHeadDone ? "td" : "th";
      html += cells.map(c => `<${tag}>${c}</${tag}>`).join("");
      if (tableHeadDone) html += "</tr>";
      continue;
    }
    else if (/^[-*]\s/.test(line)) { closeTable(); if (!inList) { html += "<ul class='lore-list'>"; inList = true; } html += `<li>${ln(line.replace(/^[-*]\s/, ""))}</li>`; }
    else if (!line.trim()) { closeList(); closeTable(); }
    else { closeList(); closeTable(); html += `<p class="lore-p">${ln(line)}</p>`; }
  }
  closeList(); closeTable();
  return html;
}
