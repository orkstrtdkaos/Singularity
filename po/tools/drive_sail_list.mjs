// ⛑ ERIK 2026-09-29: *"What happened to my options to sail the standing annex to various locations? It should show
// places by region and distance."* This renders the dropdown he will actually get, with the same readers the card uses.
import { readFileSync } from "node:fs";
const CA = await import("../../engine/carriage.js");
const WM = await import("../../engine/worldmap.js");
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const C = await loadContentHeadless();

const ch = JSON.parse(readFileSync("characters/player-s9z9u1/char-mrum8y4d.json", "utf8"));
const h = ch.holdings[0];
const everywhere = { ...(C.locations || {}), ...(ch.generated?.location || {}) };
const at = everywhere[h.locationId];

const holdPlaces = new Set((ch.holdings || []).map(x => x?.locationId).filter(Boolean));
const myName = String(h.name || "").trim().toLowerCase();
const isSelf = (id) => id === h.locationId || holdPlaces.has(id)
  || (!!myName && String(everywhere[id]?.name || "").trim().toLowerCase() === myName);
const isTransit = (l) => String(l?._mintedAs || "").toLowerCase() === "transit"
  || (Array.isArray(l?.tags) && l.tags.some(x => String(x).toLowerCase() === "transitional"));

const all = Object.keys(everywhere);
const near = all.filter(id => id && !isSelf(id) && !isTransit(everywhere[id]));
console.log(`\n${h.name} lies at ${at?.name}. Places in the world: ${all.length}`);
console.log(`  struck as a road/passage (the minter's own \`_mintedAs: "transit"\`): ${all.filter(id => isTransit(everywhere[id])).map(id => everywhere[id].name).join(", ")}`);
console.log(`  struck as herself or another of your holds: ${all.filter(id => isSelf(id)).map(id => everywhere[id]?.name || id).join(", ")}`);
console.log(`  left to sail to: ${near.length}\n`);

const gate = (id) => CA.canSail(ch, h, id, { locations: everywhere, npcs: ch.npcRegistry,
  cfg: C.rules?.economy?.carriage, routeDays: WM.walkingDays(at, everywhere[id]) });
const rows = near.map(id => ({ id, g: gate(id), region: everywhere[id]?.regionId || null }))
  .sort((a, b) => (a.g.ok === b.g.ok ? 0 : a.g.ok ? -1 : 1) || ((a.g.days ?? Infinity) - (b.g.days ?? Infinity)));
const byRegion = new Map();
for (const r of rows) { const k = r.region || "_nowhere"; if (!byRegion.has(k)) byRegion.set(k, []); byRegion.get(k).push(r); }
const ordered = [...byRegion.entries()].sort((a, b) => Math.min(...a[1].map(r => r.g.days ?? Infinity)) - Math.min(...b[1].map(r => r.g.days ?? Infinity)));

console.log("THE DROPDOWN HE WILL SEE (first 4 regions, first 4 places each):\n");
for (const [region, list] of ordered.slice(0, 4)) {
  console.log(`  ── ${String(region).replace(/_/g, " ")}`);
  for (const { id, g } of list.slice(0, 4)) {
    const d = g.ok && g.days != null ? (g.days < 1 ? "under a day" : Math.round(g.days) + " days") : "";
    console.log(`     ${String(everywhere[id]?.name || id).slice(0, 34).padEnd(36)}${g.ok ? d : "⛔ " + g.why}`);
  }
  if (list.length > 4) console.log(`     … and ${list.length - 4} more`);
}
console.log(`\n  ${ordered.length} region(s) · ${rows.filter(r => r.g.ok).length} reachable · ${rows.filter(r => !r.g.ok).length} shown with the reason she cannot`);
