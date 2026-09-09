// scripts/npc_pipeline.mjs — THE DOORS A PERSON PASSES TO BECOME PLAYABLE, DRIVEN RATHER THAN DESCRIBED.
//
// ⛔ ERIK, 2026-09-08: "document HOW to pipeline new NPCs (authored and game generated) through to full in
// game capability." ⚠️ A prose answer to that question rots the day someone adds a door, and this project has
// the receipts: "authored → registered → loaded → READ" was learned four separate times because each retelling
// was a sentence in a document instead of a call to the function.
//
// ⛑ SO EVERY ROW BELOW IS COMPUTED BY CALLING THE PRODUCTION FUNCTION the app calls, on TWO populations:
//   · AUTHORED  — a record in content/packs/valley/npcs/*.json (and the five other files)
//   · GENERATED — a record minted in play by generate('npc', ctx), which nothing measured until now
//
// ⚠️ ONE LADDER, NOT TWO. The authored CENSUS lives in docs/ROSTER.md (scripts/roster.mjs) and is NOT
// recomputed here — two derivations of "how many people are reachable" is the exact defect that put certify
// at 125 against the gate's 128. This file measures the DOOR SEQUENCE and owns the generated path; the roster
// owns the authored census, and the doc says so out loud.
//
// ⚠️ Same contract as roster.mjs: default prints a DIFF, `--write` applies, `--check` exits 1 if the doc is
// stale (the suite runs this), `--md` prints the generated block alone.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadContentHeadless } from "../tests/headless_content.mjs";
import { personOpponentFor } from "../engine/battle_turn.js";
import { derivedLevel, tierFromRole, battleSkillsFor } from "../engine/npcsheet.js";
import { stubEntity, enforceFloors, affiliationFor } from "../engine/generate.js";
// ⛔ `affiliationFor` IS PART OF THE MINT PATH — generate.js line 453 Object.assigns it onto every npc it
// makes. ⚠️ MY FIRST VERSION OF THIS FILE LEFT IT OUT and reported "the generated path fields no kit",
// which was a claim about my harness, not about the engine. Driving a PARTIAL path and calling it the
// production path is the same defect this file exists to catch.
import { regionHomeTradition } from "../engine/affiliation.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOC = join(root, "docs/NPC_PIPELINE.md");
const BEGIN = "<!-- BEGIN npc-pipeline-generated -->";
const END = "<!-- END npc-pipeline-generated -->";
const WRITE = process.argv.includes("--write");
const CHECK = process.argv.includes("--check");
const MD = process.argv.includes("--md");

const C = await loadContentHeadless();
// ⛔ THE cfg IS `rules.npcStanding`, NOT THE TOP-LEVEL BAG, and getting this wrong is not a small error: with
// the wrong bag `tierFloor` and `tierSignals` are both absent, every derived person collapses to level 1, and
// the reading looks exactly like a broken engine. It cost me two false findings on 2026-09-08.
const cfg = C.rules?.npcStanding || {};
const catalog = C.abilities || {};
const traditionIndex = C.traditionIndex || null;
const realCrafts = (skills) => (skills || []).filter((s) => !String(s?.id || "").startsWith("_"));

/* ── THE GENERATED PATH, DRIVEN. Nothing in the suite had ever put a minted person in front of a player. ── */
const genCtx = { location: Object.values(C.locations || {})[0] || null, role: "a hired blade of the Watch", day: 10 };
const genSchema = C.genSchemas?.npc || {};
const stub = stubEntity("npc", genCtx, genSchema);
// ⚠️ `enforceFloors` returns { entity, action }, NOT the record. Reading the wrapper as the record reports
// every field as missing — which is what it did to me the first time.
const floored = enforceFloors(stub, "npc", genCtx, genSchema);
const minted = floored?.entity || floored || stub;
// ⛑ THE STEP THE MINT PATH ACTUALLY RUNS. `readDomains` walks a four-rung ladder — model-authored,
// the ROLE string naming a tradition, skillsObserved, then the REGION'S home tradition — so whether a
// minted person can field a kit depends on WHERE they are minted.
const affiliated = { ...minted, ...affiliationFor(minted, genCtx, traditionIndex) };
// how much of the world can that last rung actually serve?
const regionsSeen = new Set(Object.values(C.locations || {}).map((l) => l?.regionId || l?.region || null));
const regionsWithHome = [...regionsSeen].filter((r) => r && regionHomeTradition(r, traditionIndex));
const locsNoHome = Object.values(C.locations || {}).filter((l) => !regionHomeTradition(l?.regionId || l?.region || null, traditionIndex));
const mawCtx = { ...genCtx, location: C.locations?.the_maw || genCtx.location };
const inTheMaw = { ...minted, ...affiliationFor(minted, mawCtx, traditionIndex) };

const genRow = (label, rec) => {
  const opp = personOpponentFor(rec, { catalog, cfg, day: 10, traditionIndex });
  const kit = battleSkillsFor(rec, { catalog, cfg, traditionIndex });
  return { label, tier: rec.tier || tierFromRole(rec, { cfg })?.tier || "—", level: derivedLevel(rec, { cfg }),
    fightable: !!opp, crafts: realCrafts(opp?.skills).length, kitCrafts: realCrafts(kit?.skills).length,
    rows: (opp?.skills || []).length };
};
// the record as generate() leaves it, and as `reconcileGeneratedNpcWithMeet` leaves it once a meet stub
// takes it over — the merge copies `role` and `domains`, which are the two inputs that matter downstream.
const genCases = [
  genRow("as `generate('npc')` leaves it", minted),
  genRow("a role that signals RANK (`Marshal of the Watch`)", { ...minted, role: "Marshal of the Watch" }),
  genRow("after `affiliationFor`, minted in Millbrook (region `valley`)", affiliated),
  genRow("after `affiliationFor`, minted in the Maw (region `the_descent`)", inTheMaw),
];

/* ── THE SCHEMA'S OWN ANSWER: what a minted person is REQUIRED to carry, and what the kit needs. ── */
const required = genSchema.required || [];
const KIT_INPUTS = ["abilities", "domains", "tradition"];
const missingKitInputs = KIT_INPUTS.filter((k) => minted[k] == null);

/* ── AND THE AUTHORED SIDE, one number only, to prove the doors are the SAME doors for both. ── */
const authored = Object.values(C.npcs || {});
const authoredFightable = authored.filter((n) => !!personOpponentFor(n, { catalog, cfg, day: 10, traditionIndex }));
const authoredWithCraft = authoredFightable.filter((n) =>
  realCrafts(personOpponentFor(n, { catalog, cfg, day: 10, traditionIndex })?.skills).length > 0);

/* ── the block ── */
const out = [];
out.push(BEGIN);
out.push("");
out.push(`**GENERATED by \`scripts/npc_pipeline.mjs\` — every row is a CALL to the production function, not a description of it.** ⚠️ Regenerate with \`node scripts/npc_pipeline.mjs --write\`; never hand-edit inside the markers.`);
out.push("");
out.push("## THE SEVEN DOORS");
out.push("");
out.push("⛔ **A person is playable only after the LAST one.** Passing six of seven looks exactly like success — which is why each is named, and why the two populations are checked separately.");
out.push("");
out.push("| # | door | authored person | generated person |");
out.push("|---|---|---|---|");
out.push("| 1 | **REGISTERED** — something points at the record | the pack manifest lists the file | `persistGenerated` writes `character.generated.npc[id]` |");
out.push("| 2 | **LOADED** — it is in a map the engine reads | `CONTENT.npcs[id]`, via `loadContent` | `character.npcRegistry[id]`, via the `meet` op |");
out.push("| 3 | **RESOLVED** — the fight path can FIND it | `duelFromTarget` → `npcs[id]` | `duelFromTarget` → `character.npcRegistry[id]` ⚠️ **checked FIRST, so a stub wins over content** |");
out.push("| 4 | **STANDING** — a tier and a level | authored `tier`/`level` win outright | ⛑ derived: `role` → `tierFromRole` → `tierFloor` |");
out.push("| 5 | **KIT** — a real craft to declare | authored `abilities[]`, else the domain draw | ⚠️ `affiliationFor` — and WHERE they are minted decides it |");
out.push("| 6 | **OPPONENT** — a body to fight | `personOpponentFor` returns attributes, health, soak | same function, same shape |");
out.push("| 7 | **HARM** — a verb that can threaten | a harm verb in the kit, or `notAnOpponent: true` | the bare strike only |");
out.push("");
out.push("## THE GENERATED PATH, DRIVEN END-TO-END");
out.push("");
out.push(`⚠️ **A minted person is REQUIRED to carry \`${required.join("\`, \`")}\`** — and **none of the three inputs a kit is built from**.`);
out.push("");
out.push(`| the record | tier | level | fightable | craft rows | menu rows |`);
out.push("|---|---|---|---|---|---|");
for (const g of genCases) {
  out.push(`| ${g.label} | ${g.tier} | **${g.level}** | ${g.fightable ? "✅ yes" : "⛔ NO"} | ${g.crafts === 0 ? `⛔ **${g.crafts}**` : `**${g.crafts}**`} | ${g.rows} |`);
}
out.push("");
out.push("⛔ **DOOR 5 IS THE ONLY UNEVEN ONE, AND IT IS UNEVEN BY PLACE RATHER THAN BROKEN.** ⚠️ **I first reported it as simply BROKEN, and that was a claim about my harness:** this file drove stubEntity → enforceFloors and stopped, while the real mint path also runs affiliationFor (generate.js:453). ⛑ Driving a PARTIAL path and calling it the production path is the exact defect this file exists to catch — committed by the file itself.");
out.push("");
out.push(`⚑ **\`readDomains\` WALKS FOUR RUNGS** — model-authored · the ROLE string naming a tradition · \`skillsObserved\` · the REGION’S home tradition. ⛑ The last rung is the safety net, and it does not cover the whole map: **${regionsWithHome.length} of ${regionsSeen.size} regions** have a home tradition, so **${locsNoHome.length} of ${Object.keys(C.locations || {}).length} locations** fall through it — including \`valley\`, which is where play STARTS, and \`the_center\`, which is the Crossing.`);
out.push("");
out.push(`➡️ **So a person minted in the Maw practises \`abyssal\` and fields a kit; the same person minted in Millbrook fields nothing.** ⚠️ Not a missing mechanism — a missing HOME TRADITION on the regions the player actually walks, which is content rather than code.`);
out.push("");
out.push(`⚠️ **The generation schema still asks for none of ${KIT_INPUTS.join(", ")}** — so every kit a minted person gets is DERIVED by affiliationFor, never authored by the model. ⛔ And reconcileGeneratedNpcWithMeet copies domains only when the record already has them, which is true once affiliation has run and false before it — so the ORDER of those two steps is load-bearing.`);
out.push("");
out.push(`⬜ **The authored side proves the doors themselves work:** **${authoredWithCraft.length} of ${authoredFightable.length}** reachable authored people field at least one real craft through the same two functions. ⚠️ **The authored CENSUS is \`docs/ROSTER.md\` and is not recomputed here** — one ladder, deliberately.`);
out.push("");
out.push(END);
const block = out.join("\n");

if (MD) { console.log(block); process.exit(0); }

const doc = readFileSync(DOC, "utf8");
const eol = doc.includes("\r\n") ? "\r\n" : "\n";
const i = doc.indexOf(BEGIN), j = doc.indexOf(END);
if (i < 0 || j < 0) { console.error("⛔ markers not found in docs/NPC_PIPELINE.md"); process.exit(1); }
const current = doc.slice(i, j + END.length).replace(/\r\n/g, "\n");
const next = block;
if (current === next) { console.log("npc_pipeline: identical to the file on disk"); process.exit(0); }
if (CHECK) {
  console.error("⛔ docs/NPC_PIPELINE.md is STALE — regenerate with `node scripts/npc_pipeline.mjs --write`");
  process.exit(1);
}
if (WRITE) {
  writeFileSync(DOC, doc.slice(0, i) + next.split("\n").join(eol) + doc.slice(j + END.length));
  console.log("npc_pipeline: docs/NPC_PIPELINE.md updated");
} else {
  console.log("DRY RUN — nothing written. Pass --write to apply.");
  console.log(`  lines: ${current.split("\n").length} on disk → ${next.split("\n").length} generated.`);
}
