// ⛔ SNG-663 §2c ASKS FOR THIS BEFORE ANYTHING SHIPS: *"does any power or save hold a gate location today? If so,
// name them before this ships, so the keepers don't arrive on day one without anybody having chosen it."*
//
// ⛑ Three ways a gate can be held, and all three are asked:
//   · a POWER whose `holds[]` sits at a gate, or whose `seat` is one;
//   · a PLAYER's holding at a gate location;
//   · a player's holding that CARRIES a waygate as a feature (the Made Gate is exactly this, and §2c's own
//     exception — it was permitted, and does not count as holding a Lattice gate).
// Nothing is written.
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const C = await loadContentHeadless();
const locations = C.locations || {};
const powers = Array.isArray(C.powers) ? C.powers : Object.values(C.powers || {});

// ⚠️ A GATE IS A PLACE WITH THE WAYGATE TAG OR FLAG — asked both ways, because content carries it both ways.
const isGate = (l) => !!l && (l.waygate === true || l.waygate || (Array.isArray(l.tags) && l.tags.some(t => /waygate/i.test(String(t)))));
const gates = Object.entries(locations).filter(([, l]) => isGate(l)).map(([id, l]) => ({ id, name: l.name || id, region: l.regionId || null, kind: l.kind || null }));
const gateIds = new Set(gates.map(g => g.id));

console.log(`\n── gates, and who stands on them ──\n`);
console.log(`${gates.length} location(s) carry a waygate.\n`);

const held = [];
for (const p of powers) {
  const at = [p.seat, ...((p.holds || []).map(h => h && h.at)), ...(Array.isArray(p.reach) ? [] : [])].filter(Boolean);
  for (const id of at) if (gateIds.has(id)) held.push({ who: p.name || p.id, id: p.id, at: id, how: p.seat === id ? "its seat" : "a hold" });
}
console.log(`POWERS HOLDING A GATE: ${held.length}`);
for (const h of held) console.log(`  ${h.who} (${h.id}) — ${h.how} at ${locations[h.at]?.name || h.at}`);

// ── the saves ──
const root = join(process.cwd(), "characters");
const saves = [];
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (f.endsWith(".json")) { try { const j = JSON.parse(readFileSync(p, "utf8")); if (j && j.id && j.name && Array.isArray(j.holdings)) saves.push(j); } catch { /* not a save */ } } } };
try { walk(root); } catch { /* no characters dir */ }
const seen = new Set();
const playerHeld = [];
for (const s of saves) {
  if (seen.has(s.id)) continue; seen.add(s.id);
  for (const h of (s.holdings || [])) {
    if (!h) continue;
    const atGate = h.locationId && gateIds.has(h.locationId);
    const feats = (h.features || []).map(f => String(f?.kind || f || "")).filter(k => /waygate|gate/i.test(k));
    if (atGate || feats.length) playerHeld.push({ who: s.name, hold: h.name || h.id, at: h.locationId || "(nowhere)", atGate, feats });
  }
}
console.log(`\nPLAYER HOLDINGS AT OR CARRYING A GATE: ${playerHeld.length}`);
for (const h of playerHeld) console.log(`  ${h.who}: ${h.hold} at ${locations[h.at]?.name || h.at}${h.atGate ? " — ON a gate location" : ""}${h.feats.length ? ` — carries ${h.feats.join(", ")}` : ""}`);

console.log(`\n⛑ §2c's exception: the Made Gate was permitted and does not count as holding a Lattice gate.`);
console.log(`⚠️ Anything else named above would draw the keepers on the first tick after §2c ships.`);
