// world_drive_audit.mjs — CCODE-92: does the world actually drive the story, and can we PROVE it?
//
// Erik: "the NPCs and world ticks are supposed to drive the story sometimes... can we put a clear statement
// with references into the spec that details exactly how that works? similar to the success roll calculation
// table."
//
// The success-roll table is trustworthy because every row names a real term the resolver adds. This does the
// same for the world's own agency — but it GENERATES the table from the code rather than describing it, so
// the spec can never claim a path the engine does not have. That distinction is the whole point: the reason
// `passing_advice` could sit dead for weeks is that nothing anywhere stated the complete set of ways the
// world acts on its own, so a missing one looked exactly like a rare one.
//
// A WORLD-DRIVEN PATH is a thing that reaches the narrator WITHOUT the player asking for it. Each needs three
// links, and the gate below fails if any is broken:
//   TRIGGER  — the condition that makes it fire (`reachedBy` on the registry entry)
//   BUILDER  — the function that assembles it  (`builder`)
//   CONSUMER — the GM prompt section that carries it into the context (gm.js must name the key)
// A path missing its CONSUMER is built every turn and thrown away. A path missing its TRIGGER is the
// CCODE-90 shape: real machinery nothing can ever select.
//
// Run: npm run world-drive   (--md prints the spec table)

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = rel => readFileSync(join(root, rel), "utf8");
const REG = read("engine/gm_registry.js");
const GM = read("engine/gm.js");
const APP = read("app.js");
const ALL = REG + "\n" + GM + "\n" + APP;

// CCODE-93 (Erik: "add which test/audit verified each and what the latest result was, on what date and
// version of the test"). A verification with no provenance is a rumour: bump AUDIT_VERSION whenever the
// METHOD changes, so a stamped row in the spec can be trusted to mean what it said when it was written.
export const AUDIT_VERSION = "1.1.0";   // 1.0.0 wiring only · 1.1.0 adds observed-in-play footprints

let failures = 0;
const ok = m => console.log("ok    " + m);
const fail = m => { console.log("FAIL  " + m); failures++; };
const check = (l, c, d = "") => c ? ok(l) : fail(l + (d ? " — " + d : ""));

// THE WORLD-DRIVEN SET. Named explicitly rather than pattern-matched: which paths count as the world acting
// on its own is a DESIGN claim, and a claim should be written down where someone can disagree with it.
const WORLD_DRIVEN = {
  worldPressureDetail: "the world's own pressure — what is building whether or not you engage it",
  worldArcsDetail: "world arcs advancing on their own clock",
  latentArcsDetail: "arcs not yet surfaced, ripening",
  livingWorldDetail: "the living world — what other people's play has made true here",
  newsDetail: "news travelling between communities",
  npcErrandsDetail: "NPCs who want something from you, unprompted",
  wakesDetail: "the wake of what you did — consequences arriving later",
  legendDetail: "a great figure surfacing at an apt beat (CCODE-90)",
  legendsPursuableDetail: "great figures you could reach",
  seasonalDetail: "the season acting on the world",
  anomalyDetail: "the world noticing its own inconsistency",
  encounterOfferDetail: "the world offering an encounter",
  emergenceDetail: "practice ripening into new power",
  perilNote: "peril the world has put in front of you",
  assignmentsDetail: "standing obligations coming due",
  teacherOfferDetail: "a teacher offering, unasked",
  offerDetail: "an offer the world makes",
};

// pull each registry entry's declared fields
function entryFor(key) {
  const i = REG.indexOf(`key: "${key}"`);
  if (i < 0) return null;
  const seg = REG.slice(i, i + 900);
  const grab = (name) => (seg.match(new RegExp(`${name}: "([^"]+)"`)) || [])[1] || null;
  return { key, builder: grab("builder"), reachedBy: grab("reachedBy"), spec: grab("spec"),
    carries: (seg.match(/carries: \[([^\]]*)\]/) || [])[1] || "" };
}

console.log("HOW THE WORLD DRIVES THE STORY — every path, verified (CCODE-92)\n");
const rows = [];
for (const [key, what] of Object.entries(WORLD_DRIVEN)) {
  const e = entryFor(key);
  if (!e) { fail(`${key}: declared world-driven but has NO registry entry`); continue; }
  // CONSUMER: gm.js must name the key to fold it into the prompt. Built and never carried is the same as
  // never built, except more expensive.
  const consumed = GM.includes(key);
  rows.push({ ...e, what, consumed });
}

console.log("  key                       trigger                        builder                            → GM?");
for (const r of rows) {
  console.log(`  ${r.key.padEnd(24)}  ${String(r.reachedBy || "—").slice(0, 28).padEnd(28)}  ${String(r.builder || "—").padEnd(32)}  ${r.consumed ? "yes" : "NO"}`);
}
console.log("");

check("every world-driven path has a REGISTRY ENTRY (a named builder, not an ad-hoc call)",
  rows.length === Object.keys(WORLD_DRIVEN).length);
check("every world-driven path names its TRIGGER — what makes it fire",
  rows.every(r => r.reachedBy), rows.filter(r => !r.reachedBy).map(r => r.key).join(", "));
check("every world-driven path names its BUILDER",
  rows.every(r => r.builder), rows.filter(r => !r.builder).map(r => r.key).join(", "));
check("every world-driven path is CONSUMED by the GM prompt — built and thrown away is worse than not built",
  rows.every(r => r.consumed), rows.filter(r => !r.consumed).map(r => r.key).join(", "));

// A path whose trigger is "always" cannot be the CCODE-90 shape; one with a CONDITION must have that
// condition reachable. This reports rather than gates, because "reachable" is not decidable from source —
// but it names the set worth checking by hand, which is what nobody had before.
const conditional = rows.filter(r => r.reachedBy && r.reachedBy !== "always");
console.log(`\n  ${conditional.length} of ${rows.length} paths are CONDITIONAL — these are the ones that can silently never fire:`);
for (const r of conditional) console.log(`    ${r.key.padEnd(24)} fires when: ${r.reachedBy}`);

// ── OBSERVED IN REAL PLAY ───────────────────────────────────────────────────────────────────────────────
// Wiring is not firing. A path can be triggered, built and carried and still never actually happen, which is
// the difference between "the machinery exists" and "the world drives the story". These probes look for each
// path's FOOTPRINT in the real save files — actual play, not a simulation.
//
// ⚠️ READ THE LIMIT: a probe is a HEURISTIC for a footprint, not the path itself. "No footprint" means this
// probe found no evidence — it is a reason to look, never a proof the path is dead. Some are honest
// negatives (nobody in these saves has used a precursor craft, so `perilNote` SHOULD be absent). Saying
// "never fired" from this data would be exactly the overclaim this audit exists to prevent.
const PROBES = {
  seasonalDetail: c => !!c.clock,
  newsDetail: c => (c.worldState?.news || c.news || []).length > 0,
  livingWorldDetail: c => c.generated && Object.keys(c.generated).length > 0,
  offerDetail: c => (c._opEmitted?.offer || 0) > 0,
  legendDetail: c => c.legendGovernor?.lastDeployDay != null,
  emergenceDetail: c => (c._opEmitted?.newAbility || 0) > 0 || (c.discoveries || []).length > 0,
  encounterOfferDetail: c => (c._opEmitted?.newEncounter || 0) > 0,
  anomalyDetail: c => (c._opEmitted?.stateOps || 0) > 0,
  assignmentsDetail: c => (c.assignments || []).length > 0,
  wakesDetail: c => (c.wakes || []).length > 0,
  npcErrandsDetail: c => Object.values(c.npcRegistry || {}).some(n => n.errand || n.quest),
  worldArcsDetail: c => (c.worldState?.arcs || c.worldArcs || []).length > 0,
  perilNote: c => !!c.precursorAxes,
  teacherOfferDetail: c => (c._opEmitted?.markTeacher || 0) > 0,
  latentArcsDetail: c => (c.latentArcs || []).length > 0,
};
const OBSERVED = {};
let saves = 0, turns = 0, scanned = false;
try {
  for (const d of readdirSync(join(root, "characters"))) {
    for (const f of readdirSync(join(root, "characters", d))) {
      let c; try { c = JSON.parse(read(`characters/${d}/${f}`)); } catch { continue; }
      if (!(c.actionCount > 0)) continue;
      saves++; turns += c.actionCount; scanned = true;
      for (const [k, fn] of Object.entries(PROBES)) { try { if (fn(c)) OBSERVED[k] = (OBSERVED[k] || 0) + 1; } catch { /* a probe must never break the audit */ } }
    }
  }
} catch { /* no saves present (a clean checkout) — the wiring gates above still stand alone */ }

if (scanned) {
  console.log(`\n  OBSERVED IN REAL PLAY — ${saves} save(s), ${turns} turns:`);
  const dark = [];
  for (const r of rows) {
    if (!(r.key in PROBES)) { console.log(`    ${r.key.padEnd(24)} (no probe — not observable from a save file)`); continue; }
    const n = OBSERVED[r.key] || 0;
    r.observed = `${n}/${saves}`;
    console.log(`    ${r.key.padEnd(24)} ${String(n).padStart(2)}/${saves} saves show a footprint${n ? "" : "   ← NO FOOTPRINT"}`);
    if (!n) dark.push(r.key);
  }
  if (dark.length) {
    console.log(`\n  ${dark.length} path(s) with NO observed footprint in ${turns} turns of real play:`);
    console.log(`    ${dark.join(", ")}`);
    console.log("    Wired and verified above — but nothing in the saves shows them happening. Each is a QUESTION:");
    console.log("    a trigger too rare, a condition never met, or a probe too naive. Not a verdict.");
  }
}

if (process.argv.includes("--md")) {
  console.log("\n<!-- generated by tests/world_drive_audit.mjs — do not hand-edit -->");
  const stamp = new Date().toISOString().slice(0, 10);
  console.log(`<!-- verified by tests/world_drive_audit.mjs v${AUDIT_VERSION} on ${stamp} — ${saves} saves / ${turns} turns of real play -->`);
  console.log("| Path | What the world does | Trigger | Builder | Wired? | Seen in play | Spec |");
  console.log("|---|---|---|---|---|---|---|");
  for (const r of rows) console.log(`| \`${r.key}\` | ${r.what} | ${r.reachedBy} | \`${r.builder}\` | ${r.consumed ? "yes" : "NO"} | ${r.observed ? (r.observed.startsWith("0/") ? `**none** (${r.observed})` : r.observed) : "no probe"} | ${r.spec || "—"} |`);
}

console.log(failures === 0
  ? "\nWorld drive: every declared path is triggered, built and carried to the narrator."
  : `\nWorld drive: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
