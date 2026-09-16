// scripts/backfill_answered_crises.mjs — CCODE-354: put the endings that already happened on the shared record.
//
// ⛔ WHY. Until CCODE-354 no world-tier ending was recorded anywhere but the resolver's own quest, and nothing could mark a
// crisis answered at all. Silas ended What the Water Remembers ("redirected", The Instruction Rewritten) on world-day 26;
// fifty world-days later every save and `world/regions/valley.json` still read `water_crisis` at First Sickness, and
// Courtney's Adelheid was replaying the crisis from its opening. The effects of that ending already ran in Silas's game and
// will never run again — so the record has to be written once, from what his save says happened.
//
// ⛑ THROUGH THE ENGINE'S OWN DOORS: `recordQuestOutcome` and `resolveEvent`, the functions a live resolution calls.
//
// ⚠️ WHICH ENDINGS CLOSE WHICH CRISIS IS NAMED HERE, NOT DERIVED — no outcome authored an `event_resolve` effect before
// this ticket, because the effect did not exist. The one pairing below is Erik's ruling (2026-09-16: "the water coming down
// the watershed IS clean now"), read against Aevi's own board for `redirected` ("the Echo River is clearing"). Authoring
// `event_resolve` on the outcomes that end a crisis is content's, and once it is, this table is history.
//
//   node scripts/backfill_answered_crises.mjs          write the region file
//   node scripts/backfill_answered_crises.mjs --check  print what would change, write nothing

import { readdirSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { recordQuestOutcome, resolveEvent, actorOf, questKey, mergeEventStages, mergeQuestOutcomes } from "../engine/worldevents.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const REGION = join(root, "world/regions/valley.json");
const check = process.argv.includes("--check");

const CLOSES = [
  { questId: "what_the_water_remembers", outcomes: ["redirected"], eventId: "water_crisis" },
];

const quests = JSON.parse(readFileSync(join(root, "content/packs/valley/quests.json"), "utf8"));
const worldTier = new Set((Array.isArray(quests) ? quests : quests.quests || []).filter(q => q?.tier === "world").map(q => questKey(q.id)));

// every save's world-tier endings, newest save per character
const saves = new Map();
for (const pk of readdirSync(join(root, "characters"))) {
  let files = [];
  try { files = readdirSync(join(root, "characters", pk)).filter(f => f.endsWith(".json")); } catch { continue; }
  for (const f of files) {
    let c; try { c = JSON.parse(readFileSync(join(root, "characters", pk, f), "utf8")); } catch { continue; }
    const prev = saves.get(c.id);
    if (!prev || (Number(c.updatedAt) || 0) > (Number(prev.updatedAt) || 0)) saves.set(c.id, c);
  }
}

const ws = { eventStages: {}, questOutcomes: {} };
const changes = [];
const endings = [];
for (const c of saves.values()) {
  for (const q of c.quests || []) {
    if (q?.status !== "resolved" || !q.outcomeId) continue;
    if (q.tier !== "world" && !worldTier.has(questKey(q.id))) continue;
    endings.push({ c, q });
  }
}
endings.sort((a, b) => (Number(a.q.resolvedWorldDay) || 0) - (Number(b.q.resolvedWorldDay) || 0));
for (const { c, q } of endings) {
  const by = actorOf(c);
  recordQuestOutcome(ws, q.id, { outcome: q.outcomeId, outcomeName: q.outcomeName || null, by, worldDay: q.resolvedWorldDay ?? null });
  changes.push(`quest ${questKey(q.id)} → ${q.outcomeId} by ${by.name} on world-day ${q.resolvedWorldDay ?? "?"}`);
  for (const rule of CLOSES) {
    if (questKey(rule.questId) !== questKey(q.id) || !rule.outcomes.includes(q.outcomeId)) continue;
    resolveEvent(ws, rule.eventId, { outcome: q.outcomeId, outcomeName: q.outcomeName || null, questId: q.id, by, worldDay: q.resolvedWorldDay ?? null });
    changes.push(`event ${rule.eventId} ANSWERED by ${by.name} (${q.outcomeName || q.outcomeId})`);
  }
}

const region = JSON.parse(readFileSync(REGION, "utf8"));
// ⚠️ the resolution must not REPLACE the live stage record — it is merged, so a stage the store already holds keeps its
// clock, and a second run changes nothing
for (const [id, st] of Object.entries(ws.eventStages)) {
  const live = region.eventStages?.[id];
  if (live) ws.eventStages[id] = { ...live, rev: Math.max(Number(live.rev) || 0, Number(st.rev) || 0), atWorldDay: st.atWorldDay, by: st.by, resolved: live.resolved || st.resolved };
}
const { merged } = mergeEventStages(region.eventStages || {}, ws.eventStages);
const outcomes = mergeQuestOutcomes(region.questOutcomes || {}, ws.questOutcomes);
const next = { ...region, eventStages: merged, questOutcomes: outcomes };
next.activeEvents = (region.activeEvents || []).map(e => ({ ...e, stage: merged[e.eventId]?.stage ?? e.stage }));
const before = JSON.stringify(region), after = JSON.stringify(next);
console.log(changes.length ? changes.join("\n") : "no world-tier endings found");
if (before === after) { console.log("region file already carries all of it — no changes"); process.exit(0); }
if (check) { console.log("(--check: nothing written)"); process.exit(0); }
writeFileSync(REGION + ".tmp", JSON.stringify(next, null, 2) + "\n", "utf8");
renameSync(REGION + ".tmp", REGION);
console.log("wrote world/regions/valley.json");
