// ⛔ SNG-663 §1 / A4 — AEVI: *"These are new pushes on live arcs. Measure the four arcs over a simulated year before
// and after, and apply with the numbers. The storm is the one to watch (+3 +3 against -2)."*
//
// ⛑ A YEAR, DRIVEN THROUGH THE ENGINE'S OWN PUSH. `applyEpicArcPush` is what moves an arc — "every pass, for every
// figure" — so this drives it for every figure with an affinity on these arcs, once per pass, for 48 passes (a
// 144-day year), and reads `arcStageNow` the way the world map and the GM block read it.
//
// ⚠️ URGENCY, SHARE AND THE HOLDING STREAK ARE LEFT AT 1, deliberately: they multiply the RATE, never the CAP
// (`cur.push` saturates at ±EPIC_PUSH_CAP whatever the lean), so they change who gets there first and not where the
// arc lands. The race is reported as passes-to-saturation beside the destination.
//
// Nothing is written: the "after" world is a copy with the staged affinities applied in memory.
import { readFileSync } from "node:fs";
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const WT = await import("../../engine/worldtick.js");

const C = await loadContentHeadless();
const staged = JSON.parse(readFileSync(new URL("../staged_content/SNG-663_claimant_arcs.json", import.meta.url), "utf8"));
const PASSES = 48;                       // a 144-day year, at a pass of 72 hours

/** every figure that leans on an arc, in a given world of npc records */
const leansOn = (npcs, arcId) => Object.values(npcs)
  .filter(r => r && r.arcAffinity && r.arcAffinity.arcId === arcId && Number(r.arcAffinity.dir))
  .map(r => ({ id: r.id, name: r.name || r.id, tier: r.tier || "?", dir: Number(r.arcAffinity.dir), weight: Number(r.arcAffinity.weight) || 1 }));

/** drive a year and answer where the arc stands, and when each side stopped moving */
function year(npcs, arcId) {
  const character = { id: "sim", worldState: { epicArcPushes: {} } };
  const ws = character.worldState;
  const who = leansOn(npcs, arcId);
  const saturatedAt = {};
  for (let pass = 1; pass <= PASSES; pass++) {
    for (const f of who) {
      const before = ws.epicArcPushes[f.id]?.push ?? 0;
      WT.applyEpicArcPush(ws, npcs[f.id], pass * 3, 1);
      const after = ws.epicArcPushes[f.id]?.push ?? 0;
      if (saturatedAt[f.id] === undefined && after === before && pass > 1) saturatedAt[f.id] = pass - 1;
    }
  }
  return { stage: WT.arcStageNow(C, character, arcId), who, saturatedAt,
    net: Object.values(ws.epicArcPushes).filter(e => e.arcId === arcId).reduce((s, e) => s + e.push, 0) };
}

// the "after" world: the staged affinities on the npc records the game actually reads
const after = Object.fromEntries(Object.entries(C.npcs || {}).map(([id, r]) => [id, { ...r }]));

// ⛔ AND THE TEN MORE THE SHADOW GATE FOUND, measured the same way. Each carries an `arcAffinity` on its
// `tradition_epics` row that its npc file does not — and the npc file is what loads, so each pushes NOTHING today.
// "after" for these means: if those rows were brought onto the files the game reads. ⚠️ Two LIVE arcs move, which is
// exactly why this is a measurement to send and not a tidy-up to do.
const shadowed = (() => {
  const out = [];
  try {
    const epics = JSON.parse(readFileSync(new URL("../../content/packs/valley/tradition_epics.json", import.meta.url), "utf8")).epics || [];
    for (const row of epics) {
      if (!row?.id || !row.arcAffinity?.arcId) continue;
      let file = null;
      try { file = JSON.parse(readFileSync(new URL(`../../content/packs/valley/npcs/${row.id}.json`, import.meta.url), "utf8")); } catch { continue; }
      if (!file.arcAffinity) out.push({ id: row.id, name: row.name || row.id, aff: row.arcAffinity });
    }
  } catch { /* no epics file, no shadows */ }
  return out;
})();
if (shadowed.length) console.log(`⚠️ ${shadowed.length} more figures are shadowed the same way: ${shadowed.map(s => s.id).join(", ")}\n`);
for (const s of shadowed) if (after[s.id]) after[s.id] = { ...after[s.id], arcAffinity: { ...s.aff } };

const arcs = [...new Set([...staged.claimants.map(c => c.arcAffinity.arcId), ...shadowed.map(s => s.aff.arcId)])];
// ⛑ AND THE ARC THE HELD SEATS ALREADY TURN ON, for context — what wakes beneath is Morvane against Neth.
for (const extra of ["arc_what_wakes_beneath"]) if (!arcs.includes(extra)) arcs.push(extra);
for (const c of staged.claimants) {
  if (!after[c.id]) { console.log(`⚠️ ${c.id} is not in the npc map — the staged row would land nowhere`); continue; }
  after[c.id] = { ...after[c.id], arcAffinity: { ...c.arcAffinity }, wantArcId: c.wantArcId };
}

console.log(`\n── the claimant arcs over a simulated year (${PASSES} passes), before and after ──\n`);
for (const arcId of arcs) {
  const def = (C.greaterArcs || []).find(a => a && a.id === arcId);
  const total = (def?.stages || []).length, base = def?.currentStage ?? 1;
  const b = year(C.npcs || {}, arcId), a = year(after, arcId);
  const lastName = (def?.stages || [])[total - 1]?.name || `stage ${total}`;
  console.log(`${def?.name || arcId}  (${arcId})`);
  console.log(`  base ${base} of ${total} · last rung "${lastName}"`);
  console.log(`  BEFORE  stage ${b.stage}${b.stage >= total ? "  ← at its end" : ""}   net push ${Math.round(b.net * 10) / 10}   ${b.who.length} leaning`);
  console.log(`  AFTER   stage ${a.stage}${a.stage >= total ? "  ← at its end" : ""}   net push ${Math.round(a.net * 10) / 10}   ${a.who.length} leaning`);
  const added = a.who.filter(x => !b.who.some(y => y.id === x.id));
  const flipped = a.who.filter(x => b.who.some(y => y.id === x.id && y.dir !== x.dir));
  if (added.length) console.log(`  new     ${added.map(x => `${x.name} ${x.dir > 0 ? "+" : ""}${x.dir}×${x.weight} (${x.tier})`).join(" · ")}`);
  if (flipped.length) console.log(`  flipped ${flipped.map(x => `${x.name} → ${x.dir > 0 ? "+" : ""}${x.dir}`).join(" · ")}`);
  const race = a.who.map(x => `${x.name.split(",")[0]} ${x.dir > 0 ? "+" : "−"} saturates pass ${a.saturatedAt[x.id] ?? ">" + PASSES}`);
  console.log(`  the race: ${race.join(" · ")}`);
  console.log("");
}

console.log(`⚠️ Urgency, attention share and the holding streak multiply the RATE, never the cap — they decide who gets`);
console.log(`   there first, not where the arc lands. The destination above is where it lands.`);
