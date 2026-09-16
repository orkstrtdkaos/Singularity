// engine/companionlives.js — SNG-597 §3 (CCODE-372): A COMPANION WHO IS ALSO A FIGURE OF THE WORLD.
//
// ⛔ ERIK 2026-09-16: "Plus she didn't mention it to Silas — now that she's in his party. We likely need to deconflict NPCs from world
// arcs if they're travelling with a PC." — and then: "Go with Aevi's suggestion on Marrow." Aevi's suggestion: "Do not take the arc
// away from her. Take the silence away."
//
// ⚑ MEASURED: Marrow travels with Silas (sworn, bond 10), and the legend `maren_ossitide` acts in the world — and nothing connects the
// two. No content field links the companion record to the legend; Silas's own save does, by what it knows her as: "Maren (Marrow)
// Ossitide", aliases "Marrow", "Maren Ossitide".
//
// ⛑ THIS MODULE ONLY ANSWERS "WHO IN THIS COMPANY IS ALSO A FIGURE OF THE WORLD". An authored link wins (`legendId` on the companion,
// or `companionId` on the legend); otherwise a name the save knows the companion by that IS the figure's own name, epithet aside —
// equality, never a guess. What they may do while they travel, and how it reaches the player, lives in `worldtick`.
//
// ⚠️ PURE.

import { normName } from "./namematch.js";
import { activeCompany } from "./company.js";

// "Maren Ossitide, Who Buried the Drowned Year" and "Maren (Marrow) Ossitide" are both "maren ossitide"
const baseName = (s) => normName(String(s || "").split(",")[0].replace(/\([^)]*\)/g, " "));

/** The figures travelling in this character's company: [{ npcId, companionName, figureId, figureName, basis }]. */
export function boundFigures(character, { content = {}, roster = [] } = {}) {
  const out = [];
  const seen = new Set();
  const figures = (roster || []).filter(f => f?.id);
  for (const m of activeCompany(character)) {
    const npcId = m?.npcId;
    if (!npcId) continue;
    const authored = content?.companions?.[npcId] || content?.npcs?.[npcId] || null;
    const reg = character?.npcRegistry?.[npcId] || null;
    let fig = null, basis = null;
    const linked = authored?.legendId || authored?.figureId || null;
    if (linked) fig = figures.find(f => f.id === linked) || null;
    if (!fig) fig = figures.find(f => f.companionId === npcId) || null;
    if (fig) basis = "authored";
    else {
      const known = [reg?.name, ...(Array.isArray(reg?.aliases) ? reg.aliases : [])].map(baseName).filter(n => n.length >= 4);
      fig = known.length ? (figures.find(f => f.name && known.includes(baseName(f.name))) || null) : null;
      if (fig) basis = "known-as";
    }
    if (!fig || seen.has(fig.id)) continue;
    seen.add(fig.id);
    out.push({ npcId, companionName: authored?.name || reg?.name || npcId, figureId: fig.id, figureName: fig.name || fig.id, basis });
  }
  return out;
}
