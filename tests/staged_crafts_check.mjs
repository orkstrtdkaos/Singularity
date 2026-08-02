// staged_crafts_check.mjs — SNG-263: does staged craft authoring actually RESOLVE through the engine?
//
// Aevi is authoring 27 traditions against the locked schema, one file at a time, staged before promotion.
// The gap this closes: `content_ci` sweeps the LIVE catalog, and staged files are by definition not live yet
// — so a whole tradition could be authored against a misremembered field name and nobody would know until
// promotion, which is the "author twice" failure the sequencing exists to prevent.
//
// This runs every staged *_mechanics*.json through the REAL `mechanicFor` and reports, per craft, what the
// engine actually resolved. It is a REPORT with a few gates: the numbers are Aevi's and Erik's, but "this
// craft resolves to nothing" or "this field name reaches no reader" are facts, and they fail.
//
// Run: node tests/staged_crafts_check.mjs

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mechanicFor, shapeOfVerb, critFor } from "../engine/craftmechanics.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rj = rel => JSON.parse(readFileSync(join(root, rel), "utf8"));
const CM = rj("content/packs/core/rules/craft_mechanics.json");
const CRIT_CAP = rj("content/packs/core/rules/resolution.json").crit?.perCraftCap ?? 10;

let failures = 0;
const ok = m => console.log("ok    " + m);
const fail = m => { console.log("FAIL  " + m); failures++; };
const check = (label, cond, detail = "") => cond ? ok(label) : fail(label + (detail ? " — " + detail : ""));
const pad = (v, n) => String(v).padStart(n);

const dir = "po/staged_content";
const files = existsSync(join(root, dir))
  ? readdirSync(join(root, dir)).filter(f => /mechanic/i.test(f) && f.endsWith(".json")) : [];

console.log("STAGED CRAFT AUTHORING — does it resolve through the engine? (SNG-263)\n");
if (!files.length) { console.log("      no staged craft files — nothing to check.\n"); }

const MECH = new Set(CM.operativeAxis?.mechanical || []);
const summary = [];
for (const f of files) {
  const doc = rj(`${dir}/${f}`);
  // CCODE-79: read EVERY staged shape. Aevi authored rootkin and ashwarden into ONE file as an antipode pair,
  // under `traditions: { rootkin: [...], ashwarden: [...] }`, rather than the flat `crafts` array the earlier
  // traditions used — a reasonable shape for a pair meant to be read together. This checker knew only the flat
  // one, found 0 crafts, and PASSED EVERY GATE VACUOUSLY: 22 newly authored crafts reported as "everything
  // resolves" without one of them being looked at. A checker that goes green on a file it cannot read is worse
  // than no checker, so the reader takes both nestings AND the gate below fails on a file it still can't read.
  const crafts = (doc.crafts || []).concat(
    Object.values(doc.traditions || {}).flatMap(t => Array.isArray(t) ? t : ((t && t.crafts) || [])));
  console.log(`      ${f}  —  ${crafts.length} craft${crafts.length === 1 ? "" : "s"}`);
  // A *mechanics* file that yields no crafts is either a shape this reader does not know or an empty pass.
  // Either way "0 crafts, all checks passed" is a lie, and it is the exact shape of failure this file exists
  // to prevent — so it is a FAILURE, not a note. Files that legitimately carry no crafts declare it.
  if (!crafts.length && !doc.roster && !doc.notACraftFile) {
    fail(`${f}: 0 crafts readable \u2014 this file's shape is not one this checker knows (expected \`crafts: []\` or \`traditions.<id>.crafts: []\`), so every gate below would pass VACUOUSLY`);
  }
  console.log("        craft                     tier  verbs                 resolved             named axes");
  const rows = [];
  for (const c of crafts) {
    const verbs = c.functions || [];
    // The engine reads `craft.mechanic`; author it anywhere else and it is prose the engine never sees.
    const probe = { functions: verbs, levelReq: c.tier, mechanic: c.mechanic ? (c.mechanic.dice || c.mechanic.axis || Object.keys(c.mechanic).some(k => verbs.includes(k)) ? c.mechanic : c.mechanic) : undefined };
    const perVerb = verbs.map(v => {
      const m = mechanicFor(probe, { verb: v, tier: c.tier, cfg: CM });
      return { v, m };
    });
    const unresolved = perVerb.filter(x => !x.m).map(x => x.v);
    const first = perVerb.find(x => x.m)?.m;
    const shown = first
      ? (first.fields.dice ? `${first.fields.dice.n}d${first.fields.dice.d}${first.fields.plus ? "+" + first.fields.plus : ""}`
        : Object.entries(first.fields).filter(([k, v]) => Number.isFinite(v)).map(([k, v]) => `${k} ${v}`).slice(0, 2).join(", ") || "—")
      : "NOTHING";
    const named = [...new Set(perVerb.flatMap(x => x.m?.namedAxes || []))];
    rows.push({ id: c.id, tier: c.tier, verbs, unresolved, shown, named, declared: c.operativeAxis || [] });
    console.log(`        ${String(c.id).slice(0, 24).padEnd(24)}  ${pad(c.tier, 4)}  ${verbs.join("/").slice(0, 20).padEnd(20)}  ${shown.padEnd(19)}  ${named.join(", ").slice(0, 28)}`);
  }
  // CCODE-76: a craft may author what ITS critical looks like ("miss it and you have only made chaos").
  // Surfaced here rather than gated: the field is new and OPTIONAL, so "nobody used it yet" is not a defect —
  // but an author who wrote one and spelled the key wrong needs to see that it resolved to nothing.
  const crits = crafts.map(c => ({ id: c.id, got: critFor(c, { cap: CRIT_CAP }), wrote: !!(c.mechanic?.crit || c.crit) })).filter(x => x.wrote);
  if (crits.length) {
    console.log(`        crit  ${crits.length} craft(s) authored their own critical:`);
    for (const x of crits) console.log(`              ${x.id}: ` + (x.got
      ? Object.entries(x.got).map(([side, v]) => `${side} ${v.chance ? (v.chance > 0 ? "+" : "") + v.chance : "prose only"}${v.asked != null ? ` (asked ${v.asked}, capped)` : ""}${v.text ? ` — "${String(v.text).slice(0, 46)}"` : ""}`).join(" · ")
      : "RESOLVED TO NOTHING — the engine cannot read this block; keys are text/chance under success/failure"));
    check(`${f}: every authored \`crit\` block resolves through critFor`,
      crits.every(x => x.got), crits.filter(x => !x.got).map(x => x.id).join(", "));
  }
  summary.push({ file: f, rows });

  // --- the gates: facts, not tuning ---
  const dead = rows.filter(r => r.unresolved.length);
  check(`${f}: every verb resolves to an implemented shape`,
    dead.length === 0, dead.map(r => `${r.id}:${r.unresolved.join(",")}`).join("; "));

  const nothing = rows.filter(r => r.shown === "NOTHING");
  check(`${f}: no craft resolves to NOTHING`, nothing.length === 0, nothing.map(r => r.id).join(", "));

  // a declared MECHANICAL axis that carries no number is a promise the engine cannot keep
  const emptyMech = [];
  for (const c of crafts) {
    for (const a of (c.operativeAxis || [])) {
      if (!MECH.has(a)) continue;
      const m = c.mechanic || {};
      const has = m[a] != null || ((a === "damage" || a === "healing") && m.dice);
      if (!has) emptyMech.push(`${c.id}.${a}`);
    }
  }
  // REPORTED, not gated. Staged content is work in progress by definition — a tradition mid-authoring must
  // not redden the build, or the check becomes something to route around. It fails at PROMOTION instead,
  // where content_ci already enforces the same rule on the live catalog. What it gives Aevi here is a precise
  // to-do list per file rather than a verdict.
  if (emptyMech.length) {
    console.log(`        note  ${emptyMech.length} declared MECHANICAL axis/axes carry no number yet — the engine cannot act on these:`);
    console.log(`              ${emptyMech.slice(0, 10).join(", ")}${emptyMech.length > 10 ? ` (+${emptyMech.length - 10} more)` : ""}`);
  } else ok(`${f}: every MECHANICAL axis declared carries a number`);

  // the engine reads craft.mechanic — anything else is prose it never sees
  const noMechanic = crafts.filter(c => !c.mechanic).map(c => c.id);
  if (noMechanic.length) {
    console.log(`        note  ${noMechanic.length} craft(s) carry no \`mechanic\` block, so they inherit family defaults: ${noMechanic.slice(0, 6).join(", ")}`);
  }
  console.log("");
}

// A cross-file observation worth surfacing while the catalog is early: the two staged traditions were
// authored against DIFFERENT shapes, because the pilot predates the lock.
if (summary.length > 1) {
  const shapes = summary.map(s => ({ file: s.file, withMechanic: s.rows.filter(r => r.shown !== "NOTHING").length, total: s.rows.length }));
  console.log("      CROSS-FILE: " + shapes.map(s => `${s.file.replace(/_mechanics.*/, "")} ${s.withMechanic}/${s.total} resolving`).join("  ·  "));
}

console.log(failures === 0
  ? "\nStaged crafts: everything resolves. (The table is a REPORT — what each craft's numbers SHOULD be is Aevi's and Erik's.)"
  : `\nStaged crafts: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
