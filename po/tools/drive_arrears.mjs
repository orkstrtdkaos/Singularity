// ⛑ AEVI item 12, driven through the PRODUCTION path on Loki's real save — nothing written back.
// Her gate is §3: "arrears go down as well as up, and a hold that earns more than its keep clears them."
//
// ⚠️ MY FIRST VERSION OF THIS FILE INVENTED THE FIELD IT TESTED FOR. It read and wrote `character.currencies`, which no
// save has — the purse is `character.purse` — so it printed "purse 0" beside a payment that succeeded, and its
// empty-purse case ran on a FULL purse and "failed" the engine for doing the right thing. The fixture was wrong twice
// over. ⛑ And the "nothing stored" row took in 32 all the same, because a hold YIELDS and then sells in one pass: to
// get below the line you raise the KEEP (watch hands cost keep), you don't empty the shed.
import { readFileSync, readdirSync } from "node:fs";
const H = await import("../../engine/holdings.js");
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const C = await loadContentHeadless();
const cfg = { ...C.rules.economy.holdStore, features: C.rules.economy.holdFeatures };

const saves = [];
for (const d of readdirSync("characters")) {
  let fs2; try { fs2 = readdirSync(`characters/${d}`); } catch { continue; }
  for (const f of fs2) if (f.endsWith(".json")) { try { saves.push(JSON.parse(readFileSync(`characters/${d}/${f}`, "utf8"))); } catch {} }
}
const pick = (n) => JSON.parse(JSON.stringify(saves.filter(s => s.name === n).sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")))[0]));
const purseSaid = (ch) => { const p = ch.purse || {}; return Object.entries(p).filter(([k, v]) => k !== "scrip" && Number(v) > 0).map(([k, v]) => `${v} ${k}`).concat(Object.entries(p.scrip || {}).filter(([, v]) => Number(v) > 0).map(([r, v]) => `${v} scrip (${r})`)).join(", ") || "empty"; };
let fails = 0;
const check = (ok, said) => { if (!ok) fails++; return ok ? "ok" : "⛔ FAIL"; };

/* ══ 1 · THE DOOR EXISTS AND THE DEBT GOES DOWN ═══════════════════════════════════════════ */
console.log(`\n══ 1 · the button, on the hold Erik was looking at\n`);
const loki = pick("Loki");
const annex = loki.holdings.find(h => Number(h.arrears) > 0) || loki.holdings[0];
const rid = C.locations?.[annex.locationId]?.regionId || null;
console.log(`  ${annex.name} at ${C.locations?.[annex.locationId]?.name || annex.locationId} (${rid})`);
console.log(`  owes ${annex.arrears || 0}, reasons on record: ${(annex.arrearsWhy || []).length}`);
console.log(`  says: ${H.arrearsSaid(annex)}`);
console.log(`  purse before: ${purseSaid(loki)}`);
const paid = H.payArrears(loki, annex, { regionId: rid, economy: C.rules.economy });
console.log(`  "Pay it now" -> ok=${paid.ok} paid=${paid.paid} left=${paid.left} · ${paid.note || paid.why}`);
console.log(`  purse after : ${purseSaid(loki)}`);
console.log(`  owes now: ${annex.arrears || 0} · says: ${H.arrearsSaid(annex) ?? "(nothing owed)"}`);
console.log(`  ${check(!annex.arrears && paid.ok, "")} — the debt went DOWN, which nothing in the engine could do before`);

/* ══ 2 · AN EMPTY PURSE REFUSES, AND SAYS SO ══════════════════════════════════════════════ */
console.log(`\n══ 2 · the same button with nothing in the purse\n`);
const broke = pick("Loki");
const bh = broke.holdings.find(h => h.id === annex.id) || broke.holdings[0];
bh.arrears = 4; broke.purse = { crystal: 0, scrip: {} };
const r2 = H.payArrears(broke, bh, { regionId: rid, economy: C.rules.economy });
console.log(`  -> ok=${r2.ok} · "${r2.why || r2.note}"`);
console.log(`  owes still ${bh.arrears} · ${check(!r2.ok && bh.arrears === 4, "")} — refused, and the debt is untouched`);

/* ══ 3 · AEVI'S GATE, SWEPT ACROSS THE TIPPING POINT ══════════════════════════════════════ */
console.log(`\n══ 3 · the tick, either side of "earns more than its keep"\n`);
const run = (owed, watch) => {
  const ch = pick("Loki");
  const h = ch.holdings.find(x => x.id === annex.id) || ch.holdings[0];
  h.arrears = owed; delete h.arrearsWhy;
  h.store = { ...(h.store || {}), ore: 6 };
  h.steward = h.steward || (h.crew || [])[0] || null;
  // ⛑ WATCH HANDS RAISE THE KEEP (`garrisonUpkeepPerHand`), which is how this crosses the line in a way a hold really can
  h.garrison = Array.from({ length: watch }, (_, i) => `hand_${i}`);
  ch.purse = { crystal: 9999, scrip: {} };            // the purse is not the question in this section
  const st = H.tickStore(ch, h, { cfg, economy: C.rules.economy, regionId: rid, dangerLevel: 0,
    rng: () => 0.99, day: 500, people: ch.npcRegistry || {}, locations: C.locations || {},
    rules: C.rules, powers: C.powers || [] });
  const took = (Number(st.keeperSold?.crystal) || 0) + (Number(st.pilgrims) || 0) + (Number(st.relay?.crystal) || 0);
  const fee = st.marketFee?.paid ? Number(st.marketFee.fee) || 0 : 0;
  return { owed, took, keep: Number(st.upkeep) || 0, fee, paid: st.arrearsPaid?.crystal || 0, left: Number(h.arrears) || 0, short: st.short || 0, h, st };
};
console.log(`  watch  tookIn  keep  stall  surplus  paidDown  stillOwes  verdict`);
for (const watch of [0, 2, 4, 6, 8, 10, 14]) {
  const r = run(6, watch);
  const surplus = r.took - r.keep - r.fee;
  // ⛔ THE RULE, BOTH WAYS: a surplus pays what it can and no more; no surplus pays nothing.
  const want = Math.max(0, Math.min(6, surplus));
  console.log(`  ${String(watch).padEnd(7)}${String(r.took).padEnd(8)}${String(r.keep).padEnd(6)}${String(r.fee).padEnd(7)}${String(surplus).padEnd(9)}${String(r.paid).padEnd(10)}${String(r.left).padEnd(11)}${check(r.paid === want, "")}`);
}
const clear = run(1, 0);
console.log(`\n  a debt smaller than the surplus clears outright: owed 1 -> ${clear.left === 0 ? "clear" : `still ${clear.left}`} ${check(clear.left === 0, "")}`);
const big = run(400, 0);
console.log(`  a debt larger than the surplus comes DOWN, not refused: owed 400 -> ${big.left} left, ${big.paid} paid ${check(big.paid > 0 && big.left > 0 && big.left < 400, "")}`);

/* ══ 4 · IT CANNOT GO UP AND DOWN IN THE SAME BREATH ══════════════════════════════════════ */
console.log(`\n══ 4 · a pass that could not pay its keep does not also pay the debt\n`);
const ch4 = pick("Loki");
const h4 = ch4.holdings.find(x => x.id === annex.id) || ch4.holdings[0];
h4.arrears = 6; delete h4.arrearsWhy; h4.store = {}; h4.steward = null; h4.crew = []; h4.garrison = ["a", "b", "c", "d"];
ch4.purse = { crystal: 0, scrip: {} };
const st4 = H.tickStore(ch4, h4, { cfg, economy: C.rules.economy, regionId: rid, dangerLevel: 0, rng: () => 0.99,
  day: 512, people: ch4.npcRegistry || {}, locations: C.locations || {}, rules: C.rules, powers: C.powers || [] });
console.log(`  short of its keep: ${st4.short ? `yes (${st4.short})` : "no"} · paid against the debt: ${st4.arrearsPaid?.crystal || 0} · owes ${h4.arrears || 0}`);
console.log(`  and it now says: ${H.arrearsSaid(h4)}`);
console.log(`  ${check(!st4.arrearsPaid && Number(h4.arrears) > 6, "")} — the debt GREW with a reason and nothing was paid against it (no treadmill)`);

/* ══ 5 · THE NEWS SAYS BOTH THINGS ════════════════════════════════════════════════════════ */
console.log(`\n══ 5 · what the player is told\n`);
const paidRun = run(6, 0);
for (const l of H.storeNews(paidRun.h, paidRun.st)) console.log(`  paid a pass: ${l}`);
console.log("");
const shortRun = (() => { const ch = pick("Loki"); const h = ch.holdings.find(x => x.id === annex.id) || ch.holdings[0];
  h.arrears = 6; delete h.arrearsWhy; h.store = {}; h.steward = null; h.crew = []; h.garrison = ["a","b","c","d"];
  ch.purse = { crystal: 0, scrip: {} };
  const st = H.tickStore(ch, h, { cfg, economy: C.rules.economy, regionId: rid, dangerLevel: 0, rng: () => 0.99, day: 512,
    people: ch.npcRegistry || {}, locations: C.locations || {}, rules: C.rules, powers: C.powers || [] });
  return { h, st }; })();
for (const l of H.storeNews(shortRun.h, shortRun.st)) console.log(`  short a pass: ${l}`);
const saidPaid664 = H.storeNews(paidRun.h, paidRun.st).some(l => /toward what it owed/.test(l));
console.log(`
  ${check(saidPaid664, "")} — the pass that paid SAYS it paid`);

console.log(`\n${fails ? `⛔ ${fails} check(s) FAILED` : "✅ every check passed"}\n`);
process.exit(fails ? 1 : 0);
