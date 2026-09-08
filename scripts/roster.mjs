// scripts/roster.mjs — ONE ROSTER, DERIVED, ACROSS SIX FILES THAT MUST NOT BE MERGED.
//
// ⛔ ERIK: "all NPCs should at least be referenced from a single source list, even if we need to keep separate
// lists for code or other reasons." ⚑ Aevi, SPEC_one_roster_and_the_mythicals §3: "A REFERENCE, NOT A
// MIGRATION. DO NOT MERGE THE FILES." A companion has `stages[]` and no level; an epic is a signature and a
// rival; an interiority row is a drive layer. The shapes are genuinely different, so this READS all six and
// writes one table, and never moves a record.
//
// ⛔ THE COST IS MEASURED, NOT THEORETICAL. Three failures in one week were one person counting one list and
// describing another: 69 legends found resolving as level-40 opponents from a map nobody knew fed them; "41
// people have no domains" (it was abilities, and the 41-without-domains never existed); EXESA's great-figure
// count falling 70 → 60 silently when ten legendaries changed file. ⚠️ EVERY ONE IS THE SAME MISTAKE, and a
// table with a SOURCE FILE column is the fix — a scan can be complete instead of plausible.
//
// ⛔ THE COLUMN THAT PAYS FOR THE WHOLE THING: "reachable by personOpponentFor?" — computed by CALLING IT, the
// production function, with the accessor and index the app passes. Not inferred from a field. A person the
// engine can put in front of a player as an opponent is a person who needs a level and a kit, or a declared
// reason they are not one — and that is the gate `how_it_works` §147 asks.
//
// ⚠️ LIKE skills_inject: default is a DIFF. `--write` applies. `--check` exits 1 if the doc is stale (the suite
// runs this). `--md` prints the generated block alone (the freshness gate compares it to the doc byte-for-byte
// after normalising line endings). Aevi may be editing the prose above the markers at the same time, and a
// generator that clobbers a file someone is editing is worse than no generator.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadContentHeadless } from "../tests/headless_content.mjs";
import { personOpponentFor } from "../engine/battle_turn.js";
import { derivedLevel } from "../engine/npcsheet.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outArg = process.argv.indexOf("--out");
const DOC = outArg > -1 && process.argv[outArg + 1] ? process.argv[outArg + 1] : join(root, "docs/ROSTER.md");
const BEGIN = "<!-- BEGIN roster-generated -->";
const END = "<!-- END roster-generated -->";
const WRITE = process.argv.includes("--write");
const CHECK = process.argv.includes("--check");
const MD = process.argv.includes("--md");
const V = "content/packs/valley/";
const rj = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));

const C = await loadContentHeadless();
const cfg = C.rules?.npcStanding || {};
const inMap = C.npcs || {};

/* ── 1 · READ THE SIX FILES FROM DISK. The loaded map is what the ENGINE sees; disk is what was AUTHORED.
 *  The difference between the two IS the finding, so both are read and compared, never conflated. ── */
const records = [];   // { id, name, file, kind, rec }
const seen = new Map(); // id → first file (an id in two files is reported, not silently deduped)
const add = (id, name, file, kind, rec) => {
  if (!id) return;
  if (seen.has(id)) { dupes.push({ id, first: seen.get(id), again: file }); return; }
  seen.set(id, file);
  records.push({ id, name: name || id, file, kind, rec });
};
const dupes = [];

// 1a · single people, and the two pools that live beside them
for (const f of readdirSync(join(root, V + "npcs")).filter(x => x.endsWith(".json")).sort()) {
  const j = rj(V + "npcs/" + f);
  if (j.id && !Array.isArray(j.challengers) && j.kind !== "challenger_pool") { add(j.id, j.name, "npcs/" + f, "person", j); continue; }
  for (const l of (j.legends || [])) add(l.id, l.name, "npcs/" + f, "pooled legend", l);
  for (const c of (j.challengers || [])) add(c.id, c.name, "npcs/" + f, "challenger", c);
}
// 1b · companions — a different shape entirely (stages, not levels)
for (const f of readdirSync(join(root, V + "companions")).filter(x => x.endsWith(".json")).sort()) {
  const j = rj(V + "companions/" + f);
  add(j.id, j.name, "companions/" + f, "companion", j);
}
// 1c · the epics, witnessed not met
for (const e of (rj(V + "tradition_epics.json").epics || [])) add(e.id, e.name, "tradition_epics.json", "epic", e);
// 1d · the lore figures + the rung
for (const f of (rj(V + "lore/legends.json").figures || [])) add(f.id, f.name, "lore/legends.json", "lore figure", f);
// 1e · the interiority layer — NOT people; a drive layer over people who exist elsewhere
const interior = rj(V + "npc_interiority.json").npcs || {};

/* ── 2 · WHAT EACH RECORD CARRIES, AND WHAT THE ENGINE CAN DO WITH IT ── */
const yes = "✅", no = "—";
const rows = records.map(r => {
  const rec = r.rec;
  const loaded = inMap[r.id] || null;                       // the record the ENGINE actually holds, if any
  const tier = rec.tier || loaded?.tier || (rec.renown ? `renown:${rec.renown}` : null);
  const level = rec.level ?? loaded?.level ?? null;
  const abilities = (rec.abilities || loaded?.abilities || []).length;
  const domains = !!(rec.domains && Object.keys(rec.domains).length);
  const primArray = Array.isArray(rec.domains?.primary);
  const notOpp = rec.notAnOpponent === true || loaded?.notAnOpponent === true;
  let reach = false, kit = 0, why = "";
  if (r.kind === "companion") { why = "companion — fights beside you from stages, not as a foe"; }
  else if (r.kind === "challenger") { why = "challenger pool — kept out of the person map on purpose (SNG-138)"; }
  else if (!loaded) { why = "not in CONTENT.npcs — the loader never carries it"; }
  else {
    try {
      const o = personOpponentFor(loaded, { catalog: C.abilities, cfg, day: 100, traditionIndex: C.traditionIndex });
      reach = !!o; kit = o ? (o.skills || []).length : 0;
      if (!o) why = notOpp ? "declared notAnOpponent" : "no kit — falls to threat synthesis";
    } catch (e) { why = "ERR " + String(e.message).slice(0, 40); }
  }
  const derived = loaded ? derivedLevel(loaded, { day: 100, cfg }) : null;
  const hooks = (rec.questSeeds || rec.hooks || []).length;
  const portrait = !!(rec.image || rec.portrait || rec.imageSeedKey || loaded?.image);
  return { ...r, tier, level, derived, abilities, domains, primArray, notOpp, loaded: !!loaded, reach, kit, why, hooks, portrait,
    interior: !!interior[r.id] };
});

/* ── 3 · THE FINDINGS the table exists to make visible ── */
const byFile = new Map();
for (const r of rows) byFile.set(r.file.replace(/\/[^/]+\.json$/, "/*.json").replace(/^npcs\/legends\.json$/, "npcs/legends.json"), (byFile.get(r.file.replace(/\/[^/]+\.json$/, "/*.json")) || 0) + 1);
const reachable = rows.filter(r => r.reach);
const levelOne = reachable.filter(r => r.level == null && r.derived === 1);            // ⛔ the class the seraph was in
const noAuthoredLevel = reachable.filter(r => r.level == null);
const noAbilities = reachable.filter(r => r.abilities === 0);
const dropped = rows.filter(r => !r.loaded && r.kind !== "companion" && r.kind !== "challenger");   // a pool is kept out by design
const badDomains = rows.filter(r => r.primArray);
const hingeMissing = [];
for (const a of Object.values(C.greaterArcs?.arcs || C.greaterArcs || {})) for (const h of (a?.hingeNpcs || [])) if (!inMap[h]) hingeMissing.push(`${h} (${a.id})`);
const interiorOrphans = Object.keys(interior).filter(id => !seen.has(id));

/* ── 4 · THE TABLE ── */
const out = [];
// ⚠ NO DATE IN THE GENERATED BLOCK. The freshness gate compares `--md` output to the doc byte-for-byte; a date
// stamp would make the roster read STALE every morning it was not regenerated — a gate anchored to a running
// state, the shape that went red three times in one day last week. Git carries when.
out.push(`**GENERATED by \`scripts/roster.mjs\` · ${rows.length} records across 6 files · ${reachable.length} reachable as opponents · ${levelOne.length} of those would fight at level 1 · ${dropped.length} authored but never loaded.** ⚠️ Regenerate with \`node scripts/roster.mjs --write\`; never hand-edit inside the markers.`);
out.push("");
out.push("### ⛔ WHAT THE TABLE FOUND");
out.push("");
out.push("| finding | count | who |");
out.push("|---|---|---|");
out.push(`| ⛔ **reachable as an opponent and would fight at LEVEL 1** (no authored level, no tier floor) | **${levelOne.length}** | ${levelOne.slice(0, 8).map(r => `\`${r.id}\``).join(" · ")}${levelOne.length > 8 ? ` · +${levelOne.length - 8}` : ""} |`);
out.push(`| ⚠️ reachable with no AUTHORED level (tier floor or derived) | ${noAuthoredLevel.length} | of ${reachable.length} reachable |`);
out.push(`| ⚠️ reachable with no authored \`abilities\` (kit drawn from domains) | ${noAbilities.length} | of ${reachable.length} reachable |`);
out.push(`| ⛔ **authored on disk, NEVER loaded into \`CONTENT.npcs\`** | **${dropped.length}** | ${dropped.map(r => `\`${r.id}\` (${r.file})`).join(" · ") || "—"} |`);
out.push(`| ⛔ **\`hingeNpcs\` on a greater arc that resolve to NO record** | **${hingeMissing.length}** | ${hingeMissing.join(" · ") || "—"} |`);
out.push(`| ⛔ \`domains.primary\` is an ARRAY (the Pell/Veth shape) | ${badDomains.length} | ${badDomains.map(r => `\`${r.id}\``).join(" · ") || "—"} |`);
out.push(`| ⚠️ interiority rows over people no file carries | ${interiorOrphans.length} | ${interiorOrphans.join(" · ") || "—"} |`);
out.push(`| ⚠️ one id in two files | ${dupes.length} | ${dupes.map(d => `\`${d.id}\` (${d.first} + ${d.again})`).join(" · ") || "—"} |`);
out.push("");
out.push("### THE SIX FILES");
out.push("");
out.push("| file | records | what it is |");
out.push("|---|---|---|");
const kinds = { person: "single authored people — the ones you can MEET", "pooled legend": "⚠️ a POOL in one file — and the loader drops it", challenger: "a challenger pool — kept out of the person map on purpose", companion: "⛔ a different shape: `stages[]`, no level — fights beside you", epic: "witnessed, not met — a signature and a rival", "lore figure": "figures + the tier ladder + `_theMythicalRung`" };
for (const k of Object.keys(kinds)) out.push(`| ${k} | **${rows.filter(r => r.kind === k).length}** | ${kinds[k]} |`);
out.push(`| interiority (\`npc_interiority.json\`) | ${Object.keys(interior).length} | ⚠️ NOT people — a drive layer over ${Object.keys(interior).length - interiorOrphans.length} people who exist above |`);
out.push("");
out.push("### EVERY RECORD");
out.push("");
out.push("⚑ **reach** = `personOpponentFor` returns a sheet for it, called exactly as the app calls it. **lvl** = authored level, else the level the engine derives with the standing dial (`→n`). **kit** = declarable verb rows the engine gives it.");
out.push("");
out.push("| id | name | kind | file | tier | lvl | abil | dom | reach | kit | seeds | art |");
out.push("|---|---|---|---|---|---|---|---|---|---|---|---|");
const kindOrder = ["person", "pooled legend", "challenger", "lore figure", "epic", "companion"];
rows.sort((a, b) => kindOrder.indexOf(a.kind) - kindOrder.indexOf(b.kind) || a.id.localeCompare(b.id));
for (const r of rows) {
  const lvl = r.level != null ? String(r.level) : (r.derived != null ? `→${r.derived}` : no);
  const reach = r.reach ? yes : (r.notOpp ? "declared no" : (r.kind === "companion" ? "n/a" : `⛔ ${r.why}`));
  out.push(`| \`${r.id}\` | ${r.name} | ${r.kind} | \`${r.file}\` | ${r.tier || no} | ${lvl} | ${r.abilities || no} | ${r.domains ? (r.primArray ? "⛔ array" : yes) : no} | ${reach} | ${r.kit || no} | ${r.hooks || no} | ${r.portrait ? yes : no} |`);
}

/* ── 5 · REFUSE TO LOSE ANYTHING: every id-bearing record found on disk is in the table, once. ── */
const onDisk = seen.size;
if (rows.length !== onDisk) { console.log(`⛔ ${onDisk} ids on disk, ${rows.length} rows — REFUSING to write a table that lost someone`); process.exit(1); }
if (!rows.length) { console.log("⛔ zero rows — REFUSING to write an empty roster"); process.exit(1); }

/* ── 6 · WRITE, DIFF, OR CHECK ── */
const generated = out.join("\n").trimEnd();
if (MD) { console.log(generated); process.exit(0); }
const existingRaw = readFileSync(DOC, "utf8");
const eol = existingRaw.includes("\r\n") ? "\r\n" : "\n";
const gen = generated.split("\n").join(eol);
const hasMarkers = existingRaw.includes(BEGIN) && existingRaw.includes(END);
let next;
if (hasMarkers) {
  const a = existingRaw.indexOf(BEGIN) + BEGIN.length, b = existingRaw.indexOf(END);
  next = existingRaw.slice(0, a) + eol + gen + eol + existingRaw.slice(b);
} else {
  const at = existingRaw.indexOf("## §1");
  if (at < 0) { console.log("⛔ `## §1` not found — REFUSING to guess where the hand-written preface ends"); process.exit(1); }
  next = existingRaw.slice(0, at) + BEGIN + eol + gen + eol + END + eol + eol + existingRaw.slice(at);
}
const summary = `${rows.length} records · ${reachable.length} reachable · ${levelOne.length} at level 1 · ${dropped.length} never loaded · ${hingeMissing.length} hinge ids unresolved`;
if (CHECK) {
  const same = next === existingRaw;
  console.log(same ? `✅ docs/ROSTER.md is fresh — ${summary}` : `⚠️ docs/ROSTER.md is STALE — ${summary}\n   run: node scripts/roster.mjs --write`);
  process.exit(same ? 0 : 1);
}
if (!WRITE) {
  const a = existingRaw.split("\n"), b = next.split("\n");
  let first = -1; for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) { first = i; break; }
  console.log(`DRY RUN — nothing written. ${summary}`);
  console.log(first < 0 ? "  identical to the file on disk" : `  first difference at line ${first + 1}\n    on disk:   ${JSON.stringify(a[first] ?? "(eof)").slice(0, 110)}\n    generated: ${JSON.stringify(b[first] ?? "(eof)").slice(0, 110)}`);
  console.log(`  lines: ${a.length} on disk → ${b.length} generated · pass --write to apply.`);
  process.exit(0);
}
writeFileSync(DOC, next);
console.log(`✅ wrote ${DOC.replace(root, "").replace(/^[\\/]/, "")} — ${summary}`);
