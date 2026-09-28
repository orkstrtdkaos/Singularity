// ⛔ BUG_aevi_20260928_party_dead_doors — MEASURED ON LOKI'S LIVE SAVE BEFORE ANYTHING IS CHANGED.
//
// Erik, in play: *"some buttons don't work — such as let them hang back, or keep out of it… Also, when I try to add my
// other allies to my party, it says they refuse. Is that because they are not next to me?"*
//
// Aevi's two readings to confirm: (1) `holdBack` is written and nothing reads it, so the label never flips and the
// ally never leaves the line; (2) `recruit()` still refuses at `companyPlaces` whenever a ladder is passed, silently,
// and location is checked nowhere on that path. ⚠️ She asked for the cap to be measured on his save rather than
// assumed: `activeCompany` against `companyPlaces`.
//
// Nothing is written.
import { readFileSync, readdirSync } from "node:fs";

const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const CO = await import("../../engine/company.js");
const CB = await import("../../engine/combatants.js");
const LD = await import("../../engine/ladder.js");

const C = await loadContentHeadless();
const ladder = C.rules?.subAttributeLadder || null;

const saves = [];
for (const dir of readdirSync(new URL("../../characters", import.meta.url))) {
  let files = []; try { files = readdirSync(new URL(`../../characters/${dir}`, import.meta.url)); } catch { continue; }
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    try { saves.push({ dir, f, c: JSON.parse(readFileSync(new URL(`../../characters/${dir}/${f}`, import.meta.url), "utf8")) }); } catch { /* skip */ }
  }
}
saves.sort((a, b) => String(b.c.updatedAt || "").localeCompare(String(a.c.updatedAt || "")));

console.log(`\n══ the two party doors, measured on the live saves ══\n`);

console.log(`── 1 · the cap Erik is hitting ──`);
console.log(`   ⚠️ \`recruit()\` refuses when \`activeCompany >= companyPlaces\` AND a ladder is passed — and all four`);
console.log(`      production callers pass one. Location is not read anywhere on that path.\n`);
for (const { c } of saves) {
  const active = CO.activeCompany(c);
  if (!active.length && !(c.company || []).length) continue;
  const places = ladder ? LD.companyPlaces(ladder, c) : null;
  const fwd = CO.forwardCompany(c, { ladder });
  const over = places != null && active.length >= places;
  console.log(`   ${String(c.name).padEnd(18)} company ${String(active.length).padStart(2)} active / ${String((c.company || []).length).padStart(2)} ever`
    + `   places ${String(places).padStart(2)}   forward ${fwd.forward.length}   alongside ${fwd.alongside.length}`
    + (over ? `   ⛔ AT THE CAP — every new join is refused, silently` : ""));
  if (over) {
    console.log(`      rapport ${c.subAttributes?.rapport ?? "?"} · level ${c.level ?? "?"} · "${fwd.why}"`);
    console.log(`      travelling with: ${active.map(m => c.npcRegistry?.[m.npcId]?.name || m.npcId).join(", ")}`);
  }
}

console.log(`\n── 2 · \`holdBack\`: a write with no reader ──`);
console.log(`   ⚠️ The card's label and the fight both read \`present === false\`; the button writes`);
console.log(`      \`allyOrders[id].holdBack\`, and nothing turns one into the other.\n`);
for (const { c } of saves) {
  const orders = c.allyOrders || {};
  const held = Object.entries(orders).filter(([, o]) => o && o.holdBack);
  const allies = CB.alliesOf(c, { companions: C.companions || {}, npcs: C.npcs || {}, rules: C.rules, catalog: C.abilities || null });
  const notPresent = allies.filter(a => a && a.present === false);
  if (!held.length && !Object.keys(orders).length) continue;
  console.log(`   ${String(c.name).padEnd(18)} allyOrders ${String(Object.keys(orders).length).padStart(2)} rows · holdBack set on ${held.length}`
    + `   · allies not present: ${notPresent.length}`);
  for (const [id] of held) {
    const a = allies.find(x => String(x.id) === String(id));
    console.log(`      ⛔ ${(c.npcRegistry?.[id]?.name || id).padEnd(22)} holdBack=true, and the roster says present=${a ? a.present : "(not in the roster)"}`);
  }
}
const anyHeld = saves.some(({ c }) => Object.values(c.allyOrders || {}).some(o => o && o.holdBack));
if (!anyHeld) console.log(`   ⬜ nobody's save carries \`holdBack\` yet — the button was clicked and the write did not survive, or`);
if (!anyHeld) console.log(`      it was clicked on a session that was never saved. Either way there is no reader to find.`);

console.log(`\n── 3 · who the picker offers, and what happens ──`);
const loki = saves.find(s => /loki/i.test(String(s.c.name)));
if (loki) {
  const c = JSON.parse(JSON.stringify(loki.c));
  const reg = c.npcRegistry || {};
  const offered = Object.values(reg).filter(n => n && CO.isRecruitable(n) && !CO.activeCompany(c).some(m => m.npcId === n.id));
  console.log(`   Loki: ${offered.length} people the picker would offer (isRecruitable, not already in the company)`);
  let refused = 0;
  for (const n of offered.slice(0, 8)) {
    const probe = JSON.parse(JSON.stringify(c));
    const got = CO.recruit(probe, n.id, { roles: ["ally"], day: 30, ladder });
    if (got === null) refused++;
    console.log(`      ${String(n.name || n.id).padEnd(24)} bond ${String(n.relationship ?? "-").padStart(3)}  → ${got === null ? "⛔ null  → the alert says \"They will not come.\"" : "joins"}`);
  }
  console.log(`   ⛔ ${refused} of the first ${Math.min(8, offered.length)} are refused by the CAP and the player is told the person refused HIM.`);
}
