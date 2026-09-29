// ⛑ SNG-663 §2c — WHO COULD HOLD A GATE, BEFORE ANY OF IT IS BUILT.
// Aevi measured 9 powers whose `holds` names a place carrying a waygate, and her own conclusion is the important half:
// **holding the GROUND around an open gate is not holding the GATE.** None of the nine does the act today, so nothing
// wakes on day one — which means the rule must be a FLAG AN ACT SETS, never something derived from `holds`, or the
// feature fires on nine powers the moment it ships.
//
// ⚠️ This asks the three population questions the build depends on: which places carry a gate, which of them a power
// holds, and whether any PLAYER's holding stands at one — including the Made Gate, which §2c.3 exempts because it was
// permitted. Nothing is written.
import { readFileSync, readdirSync } from "node:fs";
const WG = await import("../../engine/waygate.js");
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const C = await loadContentHeadless();
const L = C.locations;

const gates = Object.entries(L).filter(([, l]) => l && (l.waygate || l.hasWaygate || WG.isNetworkGate(l)));
console.log(`\n1 · THE GATES — ${gates.length} place(s) carry one:`);
for (const [id, l] of gates) console.log(`   ${id.padEnd(30)} ${String(l.name || "").padEnd(26)} region ${l.regionId || "—"}${l.madeBy || l.made ? "   ⛑ MADE" : ""}`);

console.log(`\n2 · POWERS WHOSE \`holds\` NAMES A GATE PLACE:`);
const gateIds = new Set(gates.map(([id]) => id));
let n = 0;
for (const p of (C.powers || [])) {
  const at = (p.holds || []).map(h => h?.at).filter(a => gateIds.has(a));
  if (!at.length) continue;
  n++;
  const yard = at.map(a => L[a]?.gateYardId ? `${a} → yard ${L[a].gateYardId}` : a);
  console.log(`   ${String(p.name).padEnd(30)} ${yard.join(", ")}   verbs: ${(p.verbs || []).join("/") || "—"}${p.cruel ? "  ⚠️ cruel" : ""}`);
}
console.log(`   ${n} power(s). ⛑ §2b moved the gate out from under the settlements that got a yard — those places no longer`);
console.log(`      carry the arch, so holding the town is not holding the gate there either.`);
console.log(`   ⛔ AND NOT ONE OF THEM HOLDS THE GATE ITSELF today: closing it, tolling it, or garrisoning the arch is an ACT.`);

console.log(`\n3 · PLAYERS' HOLDINGS STANDING AT A GATE:`);
let any = 0;
for (const d of readdirSync("characters")) {
  let fs2; try { fs2 = readdirSync(`characters/${d}`); } catch { continue; }
  for (const f of fs2) {
    if (!f.endsWith(".json")) continue;
    let ch; try { ch = JSON.parse(readFileSync(`characters/${d}/${f}`, "utf8")); } catch { continue; }
    for (const h of (ch.holdings || [])) {
      const here = L[h.locationId] || ch.generated?.location?.[h.locationId] || null;
      const isGate = here && (here.waygate || here.hasWaygate || (() => { try { return WG.isNetworkGate(here); } catch { return false; } })());
      if (!isGate) continue;
      any++;
      const made = !!(here.madeBy || here.made || /made/i.test(String(here.name || "")));
      console.log(`   ${ch.name} / ${h.name} at ${h.locationId} — ${here.name}${made ? "   ⛑ A MADE GATE: §2c.3 exempts it, it was permitted" : "   ⛔ AN INHERITED GATE"}`);
      console.log(`      garrison ${JSON.stringify(h.garrison || [])} · features ${(h.features || []).map(x => x.kind).join(", ") || "none"}`);
    }
  }
}
if (!any) console.log(`   none.`);
console.log(`\n⛑ So on day one the feature must wake NOBODY. That is the gate to build first: a flag an act sets.`);
