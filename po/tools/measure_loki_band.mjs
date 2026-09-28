// ⛔ ERIK, IN PLAY 2026-09-28: "Loki has now made it back to the standing annex with his entire crew… he still has no
// band. How can i get the game to give him a band? It's minted in the narration — do I need to add it manually?"
//
// ⛑ ASK THE ENGINE, not the narration. `canRaiseBand` is the gate, `raiseBand` is the act, and CCODE-510 already moved
// the gate from the NAMING to the WIELDING for this exact player — so the question is which of the two doors is shut and
// why. Nothing is written here.
import { readFileSync } from "node:fs";
const M = await import("../../engine/melee.js");
const CO = await import("../../engine/company.js");
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const C = await loadContentHeadless();

const ch = JSON.parse(readFileSync("characters/player-s9z9u1/char-mrum8y4d.json", "utf8"));
const cfg = C.rules?.martial || {};
console.log(`\n── ${ch.name}, level ${ch.level ?? "?"}, at ${ch.currentLocationId}`);
console.log(`   bands on the save: ${JSON.stringify((ch.bands || []).map(b => ({ id: b.id, name: b.name, count: b.count })))}`);

const can = M.canRaiseBand(ch, { cfg });
console.log(`\n1 · CAN HE RAISE ONE? ${can.ready ? "YES" : "⛔ NO"} — ${can.why}`);
console.log(`   he leads ${can.slots} (commandSlots) and holds ${can.holdings} standing holding(s)`);
console.log(`   the dials: bandAtSlots ${cfg.bandAtSlots ?? "(unset)"}, bandAtHoldings ${cfg.bandAtHoldings ?? "(unset)"}`);

const slots = M.commandSlots(ch, { cfg });
console.log(`\n2 · WHERE THOSE SLOTS COME FROM: ${JSON.stringify(slots)}`);
const roster = CO.companyRoster(ch, { rules: C.rules });
const active = CO.activeCompany(ch);
console.log(`   his company: ${active.length} active — ${active.map(c => c.name || c.npcId || c.id).join(", ")}`);
console.log(`   holdings: ${(ch.holdings || []).map(h => `${h.name} (${h.condition})`).join(", ") || "none"}`);

// ── 3 · is the band already named in the fiction, and where did that name land?
const all = JSON.stringify(ch);
for (const probe of ["Churn-Revel", "Revellers", "Fellowship", "band"]) {
  const n = (all.match(new RegExp(probe, "g")) || []).length;
  if (n) console.log(`   the word "${probe}" appears ${n}× in the save`);
}
console.log(`\n3 · WHAT WOULD HAPPEN IF HE RAISED ONE NOW (on a clone):`);
const clone = JSON.parse(JSON.stringify(ch));
const r = M.raiseBand(clone, { id: "test-band", name: "A Test Band", count: 20, quality: 1, day: 1 });
console.log(`   raiseBand → ${JSON.stringify(r)?.slice(0, 260)}`);
if (clone.bands?.length) {
  const ready = M.bandReady ? M.bandReady(clone, clone.bands[0], { cfg }) : null;
  console.log(`   bandReady → ${JSON.stringify(ready)?.slice(0, 300)}`);
}
