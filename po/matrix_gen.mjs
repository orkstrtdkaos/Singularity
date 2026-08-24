// po/matrix_gen.mjs — THE MATRIX IS DERIVED, NEVER STORED.
//
// ⛔ WHY THIS EXISTS. `po/MATRIX_death.md` was hand-maintained. By 2026-08-23 it printed `attribute` and
// reach-ids in the source column, twelve BOUND-NOT-AUTHORED that were already authored, and it could not
// see two crafts at all. I then planned a whole audit against it. §37.1 says MEASURE THE CORPUS, NOT YOUR
// OWN WORK — a hand-kept matrix IS your own work wearing the corpus's clothes.
//
// ⚠️ IT MERGES `first_gift_template` THE WAY THE LOADER DOES. That is not a nicety: `deathsense` and
// `the_true_feeling` were invisible to the old generator precisely because it read the FILES and the
// template merges at LOAD. Reading files and calling it the corpus is the same error one level down.
//
// ⛔ AND IT PRINTS THE NEW CAPABILITY VOCABULARY. The 2026-08-16 table (`skill | L | sect | dice | e |
// shape | tags | r1..r3`) predates typed damage, wards, crits, `imposes`, `ongoingHarm`, antisoak and
// tempo. A matrix that cannot show what a craft DOES cannot be audited against.
//
// usage:  node po/matrix_gen.mjs death|mind|body|<traditionId,...>  [--out po/MATRIX_x.md]

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const R = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));

// ⛔ MEMBERSHIP IS DERIVED, NOT HARDCODED. Mind and Body are defined by the explicit `skills` lists in
// their schools files (25 and 22), NOT by tradition id — grouping by tradition returned 39 and 50 and I
// nearly shipped both. Death has no schools file yet, so it falls back to its two tradition ids.
const TRADITION_GROUPS = { death: ["ashwarden", "threnodist"] };

function membersOf(groupKey) {
  const named = namedGroups();
  const ids = new Set();
  for (const [, v] of Object.entries(named))
    if (v.file === groupKey) v.skills.forEach(id => ids.add(id));
  if (ids.size) return { kind: "ids", ids };
  const tids = TRADITION_GROUPS[groupKey] || groupKey.split(",");
  return { kind: "traditions", tids };
}

/** ⛔ LOADER PARITY. `engine/state.js` fills only ABSENT fields and MERGES `mechanic`. Anything else here
 *  would report a corpus that does not exist at runtime. */
function loadAbilities() {
  const tplDoc = R("content/packs/core/rules/first_gift_template.json");
  const cohort = new Set(tplDoc.cohort || []);
  const T = tplDoc.template || {};
  const out = [];
  const dir = path.join(ROOT, "content/packs/core/abilities");
  for (const f of fs.readdirSync(dir).filter(x => x.endsWith(".json"))) {
    const doc = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    for (const a of doc.abilities || []) {
      const e = { ...a, _file: f };
      if (cohort.has(a.id)) {
        for (const [k, v] of Object.entries(T)) {
          if (k === "mechanic") e.mechanic = { ...v, ...(a.mechanic || {}) };
          else if (e[k] === undefined || e[k] === null) e[k] = v;
        }
        e._fromTemplate = true;
      }
      out.push(e);
    }
  }
  return out;
}

/** school id per ability, from `traditionSchools[tid].schools[].abilities` when present. */
function schoolIndex() {
  const idx = {};
  try {
    const ts = R("content/packs/core/rules/schools.json").traditionSchools || {};
    for (const [tid, row] of Object.entries(ts))
      for (const s of row.schools || [])
        for (const id of s.abilities || []) idx[id] = { id: s.id, name: s.name, tid };
  } catch { /* absent is fine — the column just blanks */ }
  return idx;
}

/** the named groupings (Psionics/Deduction/Material/…) when a tradition has them. */
function namedGroups() {
  const g = {};
  for (const f of ["mind_schools.json", "body_schools.json"]) {
    try {
      const doc = R("content/packs/core/rules/" + f);
      for (const [name, row] of Object.entries(doc.schools || {}))
        if (!name.startsWith("_")) g[name] = { what: row._what || "", skills: row.skills || [], file: f.replace("_schools.json", "") };
    } catch { /* fine */ }
  }
  return g;
}

const HARM = { lethal: "leth", damaging: "dmg", incapacitating: "incap", none: "—" };
const esc = s => String(s ?? "").replace(/\|/g, "\\|");

/** ⛔ THE CAPABILITY CELL — what this craft can actually DO, which the old table had no column for. */
function mechCell(a) {
  const m = a.mechanic || {};
  const bits = [];
  if (m.crit) bits.push("**crit**");
  if (m.soak) bits.push(`soak ${m.soak}`);
  if (m.antisoakImposed || a._antisoak) bits.push("antisoak");
  if (m.evasion) bits.push(`evade ${m.evasion}`);
  if (m.push) bits.push("push");
  if (m.area) bits.push("area");
  if (m.penetration) bits.push("pierce");
  return bits.join(" · ") || "—";
}

/** flags carried on RANKS — CCode's correction: `imposes` lives on the rank, which is what rank means. */
function rankFlags(t) {
  const f = [];
  if (t.imposes) {
    const im = t.imposes;
    const label = typeof im === "string" ? im
      : [im.condition, im.onCrit ? `crit→${im.onCrit}` : null, im.resist ? `resist ${im.resist}` : null]
          .filter(Boolean).join(" · ");
    f.push(`imposes ${label}`);
  }
  if (t.ongoingHarm) f.push("ongoing");
  if (t.persistUntilHealed) f.push("persists");
  if (t.antisoakImposed) f.push("antisoak");
  return f.length ? ` ⟨${f.join(" · ")}⟩` : "";
}

function rankCell(t) {
  if (!t) return "—";
  const verbs = (t.functions || []).length ? " +" + t.functions.join(", +") : " —";
  const axes = (t.gainAxes || []).length ? ` · *${t.gainAxes.join(", ")}*` : "";
  return `**${esc(t.name)}**${esc(verbs)}${axes}${rankFlags(t)}`;
}

function tagCell(a) {
  const tg = [];
  if (a.sense) tg.push("sense");
  if (a.obscure) tg.push("obscure");
  if (a.gated) tg.push("gated");
  if (a.backlash) tg.push("backlash");
  if (a.upkeep) tg.push("upkeep");
  if (a.peril) tg.push("peril");
  if (a.wildVariance) tg.push("wild");
  if (a._fromTemplate) tg.push("*first-gift*");
  return tg.join(" ") || "";
}

function row(a, sIdx) {
  const m = a.mechanic || {};
  // ⚠️ `sect` is the PEOPLE the craft descends from, abbreviated — cog/syl/fig — not the school id.
  const sect = (a.tradition || "").slice(0, 3);
  // ⚠️ `dice` is {n,d}, not a string — printing it raw gave `[object Object]` in the first run.
  const dice = m.dice && typeof m.dice === "object" ? `${m.dice.n}d${m.dice.d}${m.plus ? `+${m.plus}` : ""}`
             : m.dice ? String(m.dice) : (m.magnitude != null ? `mag ${m.magnitude}` : "—");
  const ward = (m.wardTypes || []).join(", ") || "—";
  const cells = [
    `**${esc(a.name)}**`, a.levelReq ?? "—", sect, dice, a.energyCost ?? "—",
    esc(a.shape || "—"), HARM[a.harmRung] || `⛔${a.harmRung}`, esc(m.damageType || "—"),
    esc(ward), mechCell(a), tagCell(a),
    ...[0, 1, 2].map(i => rankCell((a.tree || [])[i])),
  ];
  return "| " + cells.join(" | ") + " |";
}

const HEAD = "| skill | L | sect | dice | e | shape | harm | dmgType | ward | mechanics | tags | r1 | r2 | r3 |";
const SEP  = "|" + "---|".repeat(15);

function gaps(list) {
  const g = { crit: [], ward: [], imposes: [], ongoing: [], noDamageType: [] };
  for (const a of list) {
    const m = a.mechanic || {};
    if (!m.crit) g.crit.push(a.name);
    if (!(m.wardTypes || []).length) g.ward.push(a.name);
    if (!(a.tree || []).some(t => t.imposes)) g.imposes.push(a.name);
    if (!(a.tree || []).some(t => t.ongoingHarm)) g.ongoing.push(a.name);
    if (m.dice && !m.damageType) g.noDamageType.push(a.name);
  }
  return g;
}

function build(groupKey) {
  const sel = membersOf(groupKey);
  const all = loadAbilities();
  const sIdx = schoolIndex();
  const named = namedGroups();
  const list = all.filter(a => sel.kind === "ids" ? sel.ids.has(a.id) : sel.tids.includes(a.tradition)).sort((x, y) => (x.levelReq || 0) - (y.levelReq || 0) || x.name.localeCompare(y.name));
  const ranks = list.reduce((n, a) => n + (a.tree || []).length, 0);
  const L = [];
  L.push(`# MATRIX — ${groupKey.toUpperCase()}`, "");
  L.push(`⛔ **GENERATED by \`po/matrix_gen.mjs\` — DO NOT HAND-EDIT.** Regenerate instead. A hand-kept`);
  L.push(`matrix is your own work wearing the corpus's clothes, and the last one drifted far enough to plan`);
  L.push(`an audit against numbers that were not true (§37.1).`, "");
  L.push(`**${list.length} crafts · ${ranks} ranks · ${sel.kind === "ids" ? `membership from \`${groupKey}_schools.json\`` : `traditions: ${sel.tids.join(", ")}`}** · generated ${new Date().toISOString().slice(0, 10)}`, "");
  L.push(`⚠️ \`first_gift_template\` is merged as the LOADER merges it — absent fields only, \`mechanic\` shallow-merged.`);
  L.push(`Crafts marked *first-gift* inherit \`levelReq\`/\`energyCost\`/\`shape\`/\`harmRung\` and are NOT missing them.`, "");
  L.push(`**Rank cells:** \`name +verbs · *gainAxes* ⟨rank flags⟩\`. \`imposes\`/\`ongoingHarm\` sit on the RANK.`, "");

  const grouped = Object.entries(named).filter(([, v]) => v.skills.some(id => list.some(a => a.id === id)));
  const missing = sel.kind === "ids" ? [...sel.ids].filter(id => !list.some(a => a.id === id)) : [];
  if (grouped.length) {
    for (const [name, v] of grouped) {
      const members = list.filter(a => v.skills.includes(a.id));
      if (!members.length) continue;
      L.push(`### ${name} — ${members.length}`, "", `*${v.what}*`, "", HEAD, SEP, ...members.map(a => row(a, sIdx)), "");
    }
    const ungrouped = list.filter(a => !grouped.some(([, v]) => v.skills.includes(a.id)));
    if (ungrouped.length) L.push(`### Ungrouped — ${ungrouped.length}`, "", HEAD, SEP, ...ungrouped.map(a => row(a, sIdx)), "");
  } else {
    L.push(HEAD, SEP, ...list.map(a => row(a, sIdx)), "");
  }

  if (missing.length) L.push(`⛔ **NAMED IN THE SCHOOLS FILE BUT ABSENT FROM THE CORPUS (${missing.length}):** \`${missing.join("`, `")}\`` , "");
  const g = gaps(list);
  L.push("---", "", "## Gaps, measured", "");
  L.push("| gap | n | crafts |", "|---|---|---|");
  const fmt = v => v.length ? (v.length > 8 ? v.slice(0, 8).join(", ") + `, +${v.length - 8} more` : v.join(", ")) : "—";
  L.push(`| no \`mechanic.crit\` | ${g.crit.length} | ${esc(fmt(g.crit))} |`);
  L.push(`| no \`wardTypes\` | ${g.ward.length} | ${esc(fmt(g.ward))} |`);
  L.push(`| no \`imposes\` on any rank | ${g.imposes.length} | ${esc(fmt(g.imposes))} |`);
  L.push(`| no \`ongoingHarm\` on any rank | ${g.ongoing.length} | ${esc(fmt(g.ongoing))} |`);
  L.push(`| ⛔ rolls dice, no \`damageType\` | ${g.noDamageType.length} | ${esc(fmt(g.noDamageType))} |`);
  L.push("", `**social verbs present:** ${[...new Set(list.flatMap(a => (a.tree || []).flatMap(t => t.functions || [])))].filter(v => ["bargain", "provoke", "soothe", "persuade"].includes(v)).join(", ") || "⛔ none"}`);
  return L.join("\n") + "\n";
}

const arg = process.argv[2];
if (!arg) { console.error("usage: node po/matrix_gen.mjs death|mind|body|<tid,...> [--out FILE]"); process.exit(2); }
const md = build(arg);
const oi = process.argv.indexOf("--out");
if (oi > -1 && process.argv[oi + 1]) { fs.writeFileSync(path.join(ROOT, process.argv[oi + 1]), md); console.log("wrote", process.argv[oi + 1]); }
else console.log(md);
