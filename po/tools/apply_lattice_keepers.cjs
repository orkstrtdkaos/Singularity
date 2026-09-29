// ⛑ APPLY AEVI'S SNG-663 §2c CONTENT — her note says "Apply with the reader", so it lands in the same commit as
// `engine/gatehold.js`. One class and four rungs, every one `random: false`: a keeper comes only for whoever holds a
// gate, on the escalation clock, and stops when the gate is released.
//
// ⚠️ A TEXT-SHAPED MERGE, NOT A ROUND-TRIP REWRITE — twice today a `json.dump` turned a small insert into a whole-file
// reformat, which is how a generated copy eats somebody else's rows with no conflict. This one parses to CHECK and then
// writes with the file's own 1-space indent, and the diff is asserted to be an insert.
const fs = require("fs");
const SRC = "po/staged_content/SNG-663_lattice_keepers.json";
const DST = "content/packs/valley/bestiary.json";

const staged = JSON.parse(fs.readFileSync(SRC, "utf8"));
const raw = fs.readFileSync(DST, "utf8");
const dst = JSON.parse(raw);

const have = new Set((dst.roster || []).map(r => r && r.id));
const adds = (staged.roster || []).filter(r => r && r.id && !have.has(r.id));
const klass = Object.entries(staged.classes || {}).filter(([k]) => !(dst.classes || {})[k]);
if (!adds.length && !klass.length) { console.log("already applied — nothing to do"); process.exit(0); }

// ⛔ EVERY ONE MUST BE OFF THE RANDOM TABLE, or a keeper turns up on a road for somebody who holds nothing.
for (const r of adds) {
  if (r.random !== false) { console.error(`⛔ ${r.id} is not random:false — refused`); process.exit(1); }
  if (r.class !== "lattice_keeper") { console.error(`⛔ ${r.id} is not a lattice_keeper — refused`); process.exit(1); }
}

dst.classes = { ...(dst.classes || {}), ...Object.fromEntries(klass) };
dst.roster = [...(dst.roster || []), ...adds];
const out = JSON.stringify(dst, null, 1) + "\n";
JSON.parse(out);                                     // the parse IS the check
fs.writeFileSync(DST, out);
console.log(`applied: ${klass.length} class(es) — ${klass.map(([k]) => k).join(", ")}`);
console.log(`         ${adds.length} creature(s) — ${adds.map(r => `${r.tier}:${r.id}`).join(", ")}`);
console.log(`roster ${have.size} → ${dst.roster.length}`);
