// ⛔ SNG-654 LEVER C — ERIK RULED A SPEED TABLE AND ONLY THE CARD READ IT.
// "on foot 1×, a stable 2×, a lizard-den 2.5×, by water with BOTH ENDS water-tagged 3×, a hired company 2×."
// `carriageFor` had exactly one caller: `routeValue`, which prices the comparison. `sendCaravan` stamped the RAW road
// onto the cart and `tickCaravans` walked that, rolling hazard per day on it. So every row quoted a journey at the ruled
// speed and every cart went on foot.
//
// ⚠️ AND THE RULE HAD NO POPULATION, which is why SNG-654 shipped green: all 6 holds in the world carry ×1 on foot, so
// card and cart agreed by coincidence. C1's hired companies are the table's first live entry.
//
// ⛑ THIS TOOL ASKS THE ENGINE, NOT A COPY OF IT. `sendCaravan` on a throwaway clone of the save is the number the game
// will walk; recomputing `routeBetween` here would be measuring my own arithmetic against itself, which is how a driver
// ends up printing back the record shape it just invented. Nothing is written to characters/.
import { readFileSync, readdirSync } from "node:fs";
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const CV = await import("../../engine/caravan.js");
const C = await loadContentHeadless();
const econ = C.rules.economy, cfg = { ...econ.holdStore, features: econ.holdFeatures };
const L = C.locations, CO = Object.values(C.tradeCompanies || {});

const saves = [];
for (const d of readdirSync("characters")) {
  let fs2; try { fs2 = readdirSync(`characters/${d}`); } catch { continue; }
  for (const f of fs2) if (f.endsWith(".json")) { try { saves.push(JSON.parse(readFileSync(`characters/${d}/${f}`, "utf8"))); } catch {} }
}
console.log("\nwhat the card quotes vs what the CART ACTUALLY WALKS (sendCaravan, on a clone):\n");
console.log("hold / row".padEnd(46) + "card".padStart(8) + "cart".padStart(8) + "  mult  means");
let n = 0, differ = 0, worst = null;
for (const ch of saves) for (const h of ch.holdings || []) {
  if (!h?.store || !Object.keys(h.store).length) continue;
  const reg = L[h.locationId]?.regionId || null;
  let ex; try { ex = CV.storeExits(ch, h, { cfg, economy: econ, locations: L, regionId: reg, powers: C.powers, rules: C.rules, companies: CO }); } catch { continue; }
  for (const r of ex.rows) {
    if (!r.value || !(r.value.roadDays > 0)) continue;
    const dest = String(r.id).split(":").pop();
    if (!L[dest]) continue;
    // ⛑ the engine's own answer, on a clone: the same door `runStandingRoutes` opens, with the same company record
    const clone = JSON.parse(JSON.stringify(ch));
    const ch2 = clone, h2 = (ch2.holdings || []).find(x => x.id === h.id);
    if (!h2) continue;
    h2.store = { ...(h2.store || {}), raw_material: Math.max(1, Number(h2.store?.raw_material) || 1) };
    const byCo = r.company ? { id: r.company.id, cut: r.company.cut, guards: r.company.guards, knowsGates: !!r.company.knowsGates } : null;
    const sent = CV.sendCaravan(ch2, { holdingId: h.id, toId: dest, carriers: byCo ? [] : (h2.crew || []).slice(0, 2),
      locations: L, cfg, day: 1000, traveller: ch2, company: byCo });
    if (!sent.ok) { console.log(`${`${h.name} / ${r.id}`.slice(0, 44).padEnd(46)}${String(r.value.roadDays).padStart(8)}  REFUSED: ${sent.why}`); continue; }
    n++;
    const card = r.value.roadDays, cart = sent.caravan.days, mult = r.value.speedMult;
    const gap = card > 0 ? cart / card : 1;
    if (Math.abs(gap - 1) > 0.02) differ++;
    if (!worst || Math.abs(gap - 1) > Math.abs((worst.gap || 1) - 1)) worst = { gap, who: `${h.name} → ${L[dest].name}`, card, cart, mult, label: r.value.speedLabel };
    console.log(`${`${h.name} / ${r.id}`.slice(0, 44).padEnd(46)}${String(card).padStart(8)}${String(cart).padStart(8)}  ×${String(mult).padEnd(4)} ${r.value.speedLabel}${Math.abs(gap - 1) > 0.02 ? `   ⛔ ×${gap.toFixed(2)}` : ""}`);
  }
}
console.log(`\n${differ} of ${n} priced rows disagree with the journey the cart walks.`);
if (worst && Math.abs(worst.gap - 1) > 0.02) console.log(`the worst: ${worst.who} — card ${worst.card} days, cart ${worst.cart} (×${worst.gap.toFixed(2)})`);
const mults = {};
for (const ch of saves) for (const h of ch.holdings || []) {
  const c = CV.carriageFor(ch, h, { toId: null, locations: L, cfg });
  mults[`×${c.mult} ${c.label}`] = (mults[`×${c.mult} ${c.label}`] || 0) + 1;
}
console.log(`\nhow the world's holds carry with their OWN people: ${Object.entries(mults).map(([k, v]) => `${k}: ${v}`).join("  ·  ")}`);
console.log(`so the ruled table's only live entry today is the hired company's ×2 — every other rung waits on content.`);
