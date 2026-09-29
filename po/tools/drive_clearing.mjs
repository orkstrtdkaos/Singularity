// ⛑ SNG-666 §3 — Aevi's own gate: *"Loki's Annex (post on legs, 2/2) can start 'Build out the legs' today and, when it
// lands, build a third feature."* Driven on a clone of his real save; nothing writes to characters/.
import { readFileSync } from "node:fs";
const H = await import("../../engine/holdings.js");
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const C = await loadContentHeadless();
const cfg = { ...C.rules.economy.holdStore, features: C.rules.economy.holdFeatures };

const ch = JSON.parse(readFileSync("characters/player-s9z9u1/char-mrum8y4d.json", "utf8"));
const h = ch.holdings[0];
const room0 = H.roomOf(h, cfg);
console.log(`\n── ${h.name}: ${room0.rung} on ${room0.frame} · ${room0.used} of ${room0.slots} · bound by the ${room0.boundBy}`);
console.log(`   a build today: ${(() => { try { const r = H.addFeature(ch, h.id, { kind: "mine", via: "built", cfg }); return r.ok ? "⛔ ALLOWED" : r.why; } catch (e) { return e.message; } })()}`);

const q = H.clearingQuote(h, cfg);
console.log(`\n1 · THE WAY OUT — "${q.label}": ${Object.entries(q.goods).map(([g, n]) => `${n} ${g}`).join(" + ")}, ~${q.passes} passes at ${q.atHands} hands`);
console.log(`   ${q.said}`);
console.log(`   ⬜ authored by Aevi? ${q.authored ? "yes" : "no — this is CCode's reading of her §2.5 starting shape"}`);

h.store = { ...(h.store || {}), raw_material: 30 };
const started = H.startClearing(ch, h, { budget: "open", cfg, day: 100 });
console.log(`\n2 · STARTING IT → ok=${started.ok} ${started.why || started.said}`);
console.log(`   the store paid: ${JSON.stringify(h.store)}`);

console.log(`\n3 · THE WORK — nobody at it is no progress, which is what keeps a rung EARNED:`);
let none = H.clearingTick(ch, h, { cfg, hands: 0 });
console.log(`   with 0 hands: ${none?.stalled ? "stalled, no progress" : "⛔ progressed"} (progress ${h.clearing?.progress ?? "—"})`);
for (let p = 1; p <= 6 && h.clearing; p++) {
  const r = H.clearingTick(ch, h, { cfg, hands: 2 });
  console.log(`   pass ${p} with 2 hands: ${r?.cleared ? `⛑ ${r.note}` : `${Math.round((h.clearing?.progress || 0) * 100)}%`}`);
}

const room1 = H.roomOf(h, cfg);
console.log(`\n4 · AFTER — ${room1.used} of ${room1.slots}${h.frameRaised ? ` (the legs carry ${h.frameRaised} more)` : ""} · spotsCleared ${h.spotsCleared || 0}`);
const built = (() => { try { return H.addFeature(ch, h.id, { kind: "mine", via: "built", cfg }); } catch (e) { return { ok: false, why: e.message }; } })();
console.log(`   a build now: ${built.ok ? "⛑ ALLOWED — the third feature can go up" : "⛔ " + built.why}`);
console.log(`   promotion offered? ${JSON.stringify(H.promotionOffer(h, cfg, { worldCount: 1e9 }))}`);

/* ⛑ 5 · AND THE STEP AEVI'S §3 GATE DOES NOT MENTION: raising the legs makes the FRAME stop binding, and then the
   RUNG does — which is exactly when `promotionOffer` starts offering. Her own §2.2 specifies that step; her §3 gate
   reads as though the build follows the frame directly. Driven here so the report says which it is. */
const promo = H.promoteHolding(ch, h.id, cfg, { worldCount: 1e9 });
console.log(`
5 · TAKING THE OFFERED PROMOTION → ok=${promo.ok} ${promo.why || `it is a ${promo.rung} now, ${promo.more} more room`}`);
const room2 = H.roomOf(h, cfg);
console.log(`   room now ${room2.used} of ${room2.slots} (${room2.rung} on ${room2.frame}, bound by the ${room2.boundBy})`);
const built2 = (() => { try { return H.addFeature(ch, h.id, { kind: "mine", via: "built", cfg }); } catch (e) { return { ok: false, why: e.message }; } })();
console.log(`   a build now: ${built2.ok ? "⛑ ALLOWED — the third feature goes up" : "⛔ " + built2.why}`);
