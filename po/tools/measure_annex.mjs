// ⛔ ERIK, IN PLAY 2026-09-28, on Loki's Standing Annex: "I can't assign people to standing work… and I can't figure out
// how to expand the annex. Plus, even though it's thriving I have lost my income."
//
// ⛑ Three questions, asked of the engine rather than the screen. Nothing is written.
import { readFileSync } from "node:fs";
const H = await import("../../engine/holdings.js");
const W = await import("../../engine/worldtick.js");
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const C = await loadContentHeadless();
const econ = C.rules.economy;
const cfg = { ...econ.holdStore, features: econ.holdFeatures };
const ch = JSON.parse(readFileSync("characters/player-s9z9u1/char-mrum8y4d.json", "utf8"));
const h = (ch.holdings || []).find(x => /Annex/i.test(x.name || ""));
const people = { ...(C.npcs || {}), ...(ch.npcRegistry || {}) };
const nameOf = (id) => people[id]?.name || id;

console.log(`\n── ${h.name} — ${h.condition}, kind ${h.kind}, at ${h.locationId}`);
console.log(`   store: ${JSON.stringify(h.store)}   route: ${JSON.stringify(h.route) || "none"}`);
console.log(`   crew: ${(h.crew || []).map(nameOf).join(", ") || "none"}`);
console.log(`   steward/keeper: ${nameOf(h.steward)}`);
console.log(`   features: ${(h.features || []).map(f => `${f.name || f.kind}${f.level ? ` L${f.level}` : ""}${f.building ? " (building)" : ""}`).join(", ") || "none"}`);
console.log(`   work already assigned: ${JSON.stringify(h.work || h.standingWork || null)}`);

/* ── 1 · WHY CAN'T HE ASSIGN STANDING WORK? ─────────────────────────────────────────────── */
console.log(`\n1 · STANDING WORK — who is even eligible?`);
const table = C.rules?.holdWork || null;
console.log(`   the work table: ${table ? Object.keys(table.kinds || table).length + " kind(s) authored" : "⛔ NONE"}`);
// the panel's own population: "people with no job"
const roles = {};
for (const id of (h.crew || [])) roles[id] = "crew";
if (h.steward) roles[h.steward] = "keeper";
for (const w of (h.watch || [])) roles[w] = "watch";
for (const [k, v] of Object.entries(h.assignments || h.work || {})) if (typeof v === "string") roles[v] = `work:${k}`;
const atHold = new Set([...(h.crew || []), ...(h.watch || []), h.steward].filter(Boolean));
console.log(`   people at the hold (${atHold.size}): ${[...atHold].map(id => `${nameOf(id)} [${roles[id] || "no job"}]`).join(", ")}`);
const jobless = [...atHold].filter(id => !roles[id]);
console.log(`   WITH NO JOB: ${jobless.length ? jobless.map(nameOf).join(", ") : "⛔ NOBODY — every hand already has a role"}`);
console.log(`   ⛑ the panel says "People with no job, put to what the hold needs" — so with nobody jobless it can`);
console.log(`      list six kinds of work and offer no way to start any of them. That is the screen Erik is looking at.`);

/* ── 2 · HOW DOES HE EXPAND IT? ─────────────────────────────────────────────────────────── */
console.log(`\n2 · EXPANDING — what can be raised or added here?`);
(h.features || []).forEach((f, i) => {
  let q = null; try { q = H.raiseQuote(h, i, cfg); } catch (e) { q = { ok: false, why: e.message }; }
  console.log(`   raise "${f.name || f.kind}" → ${q?.ok === false ? `⛔ ${q.why}` : JSON.stringify({ level: q?.level, goods: q?.goods, effect: q?.effect, ok: q?.ok })}`);
});
try {
  const kinds = H.featureKinds ? H.featureKinds(cfg) : {};
  const buildable = Object.entries(kinds).filter(([k, d]) => d && !(h.features || []).some(f => f.kind === k));
  console.log(`   feature kinds authored: ${Object.keys(kinds).length}; not yet on this hold: ${buildable.length}`);
  if (H.buildQuote) {
    for (const [k] of buildable.slice(0, 6)) {
      let b = null; try { b = H.buildQuote(h, k, cfg); } catch (e) { b = { ok: false, why: e.message }; }
      console.log(`     build ${k} → ${b?.ok === false ? `⛔ ${b.why}` : JSON.stringify(b?.goods || b)}`);
    }
  } else console.log(`     ⛔ no buildQuote export — adding a NEW feature may have no engine door`);
} catch (e) { console.log(`   ⛔ ${e.message}`); }

/* ── 3 · WHY IS A THRIVING HOLD LOSING MONEY? ───────────────────────────────────────────── */
console.log(`\n3 · INCOME — the card says "0 in, 24 out". Where does each half come from?`);
try {
  const up = H.upkeepFor ? H.upkeepFor(h, cfg) : null;
  console.log(`   upkeepFor → ${JSON.stringify(up)}`);
} catch (e) { console.log(`   upkeepFor ⛔ ${e.message}`); }
try {
  const yld = H.producesPerPass ? H.producesPerPass(h, cfg, {}) : null;
  console.log(`   producesPerPass → ${JSON.stringify(yld)}`);
} catch (e) { console.log(`   producesPerPass ⛔ ${e.message}`); }
try {
  const share = H.sellShareFor ? H.sellShareFor(h, cfg) : null;
  console.log(`   sellShareFor → ${JSON.stringify(share)}  (what the keeper sells each pass)`);
} catch (e) { console.log(`   sellShareFor ⛔ ${e.message}`); }
console.log(`   ⛔ a standing route HOLDS the stock back for the cart (SNG-654) — route set? ${h.route ? "YES → that is why nothing is sold here" : "no"}`);
console.log(`   stock policy: ${JSON.stringify(h.stock || null)}`);
