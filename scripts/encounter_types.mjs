// scripts/encounter_types.mjs — CCODE-262. DO THE NON-DUEL ENCOUNTERS ACTUALLY WORK?
//
// ⛔ ERIK: "Proceed with other challenge types to verify they work as intended. fix what needs it."
//
// ⚠️ EVERY FIX THIS WEEK CAME OUT OF THE DUEL PATH — targeting, the sense reveal, interception, the seat.
// `challenge` and `puzzle` share `startEncounter`, the receipt seam and the ops door with it, and NOTHING
// has driven them since. This runs every authored one of each type to a conclusion and reports what breaks.
//
// ⛔ AND IT ASSERTS ON EACH ONE RATHER THAN JUST PRINTING. A script that runs a thing and prints numbers
// tells you it did not crash. The question is whether the thing does what its own content says it does.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as EN from "../engine/encounters.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const J = p => JSON.parse(readFileSync(join(root, p), "utf8"));
const rules = J("content/packs/core/rules/resolution.json");

// ── collect every authored encounter, whatever its type ──────────────────────
const found = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const fp = join(d, f);
    if (statSync(fp).isDirectory()) walk(fp);
    else if (f.endsWith(".json")) {
      try {
        const j = JSON.parse(readFileSync(fp, "utf8"));
        const arr = j.encounters || j.items || (Array.isArray(j) ? j : [j]);
        for (const e of arr) if (e && e.type) found.push({ def: e, file: fp.replace(root, "").replace(/\\/g, "/") });
      } catch { /* not an encounter file */ }
    }
  }
})(join(root, "content"));

const W = 96;
const line = (c = "─") => console.log("  " + c.repeat(W));
const say = (s = "") => console.log("  " + s);
let problems = [];
const flag = (id, what) => { problems.push({ id, what }); say("       ⛔ " + what); };

function seeded(s0) { let s = s0 >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

/** a resolution of a given degree, the shape challengeStage/puzzleAttempt expect */
const res = (degree, margin) => ({ degree, margin, chance: 50, roll: 50 });

console.log("");
line("═");
console.log("  CCODE-262 — EVERY AUTHORED ENCOUNTER, DRIVEN TO A CONCLUSION");
line("═");
say();
const byType = {};
for (const { def } of found) byType[def.type] = (byType[def.type] || 0) + 1;
say("  found: " + Object.entries(byType).map(([k, v]) => v + " " + k).join(" · "));
say();

// ═══════════════════════════════════════════════════════════════════════════
line();
say("CHALLENGE — staged crossings. Each stage is a roll; the stages are the encounter.");
line();
for (const { def, file } of found.filter(f => f.def.type === "challenge")) {
  say();
  say("  " + def.id + "   (" + (def.stages || []).length + " stages)   " + file);
  const st0 = EN.startEncounter(def);
  if (!st0) { flag(def.id, "startEncounter returned nothing for a `challenge`"); continue; }
  if (st0.stageIndex !== 0) flag(def.id, "a fresh challenge does not start at stage 0");

  // ── drive it with successes: it must FINISH
  let st = st0, guard = 0, ended = null;
  while (guard++ < 20) {
    const r = EN.challengeStage(st, def, res("success", 12), rules, {});
    if (!r) { flag(def.id, "challengeStage returned nothing"); break; }
    st = r.state || st;
    if (r.ended) { ended = r; break; }
  }
  if (!ended) flag(def.id, "a challenge driven with " + guard + " successes never ends — no exit on the win path");
  else say("       ✅ succeeds in " + (st.stagesDone?.length ?? "?") + " stages → outcome \"" + (ended.outcome ?? "?") + "\"");

  // ── and it must be LOSABLE.
  // ⛔ MY FIRST VERSION OF THIS CHECK WAS WRONG AND SAID BOTH CHALLENGES WERE UNLOSABLE. It drove failures
  // and watched for `ended`, but a challenge HAS NO FAILURE EXIT BY DESIGN — the stage says "it costs you,
  // but you can try again". Loss is by ATTRITION, and my harness accumulated the deltas without ever
  // applying them to anybody, so nothing could ever run out. A test that never spends the currency it is
  // measuring will always report infinite money.
  // ⚠️ SO THE HONEST QUESTION IS: does grinding this thing actually kill you? Apply the deltas and see.
  let st2 = EN.startEncounter(def), g2 = 0, hp = 30, en = 100, died = false;
  while (g2++ < 60) {
    const r = EN.challengeStage(st2, def, res("failure", -14), rules, {});
    if (!r) break;
    st2 = r.state || st2;
    hp += (r.deltas?.health ?? 0);
    en += (r.deltas?.energy ?? 0);
    if (hp <= 0) { died = true; break; }
    if (r.ended) break;
  }
  if (died) say("       ✅ losable by attrition — " + g2 + " failed attempts put a 30-health character down");
  else flag(def.id, "grinding " + g2 + " failures costs no health (hp " + hp + ", en " + en + ") — it can be retried forever for free");

  // ⚠️ AND THE STAGE-BY-STAGE CHECK THAT MATTERS: a stage whose failure costs NO health is a free retry,
  // and the merge with `defaultFailureCost` hides that — a stage authoring `health: 0` explicitly overrides
  // the default to nothing, which reads identical in the file to a stage that simply omits it.
  for (const stg of (def.stages || [])) {
    const merged = { ...(rules.encounters?.challenge?.defaultFailureCost || {}), ...(stg.failureCost || {}) };
    if (!(Number(merged.health) > 0) && !(Number(merged.energy) > 0))
      flag(def.id, "stage \"" + stg.name + "\" costs nothing at all on failure — free retries");
  }
}

// ═══════════════════════════════════════════════════════════════════════════
console.log("");
line();
say("PUZZLE — sealed things. Insight rather than momentum; hints gated by sense tier.");
line();
for (const { def, file } of found.filter(f => f.def.type === "puzzle")) {
  say();
  say("  " + def.id + "   " + file);
  const st0 = EN.startEncounter(def);
  if (!st0) { flag(def.id, "startEncounter returned nothing for a `puzzle`"); continue; }

  // hints must be TIERED — a hint everyone gets is a description
  const h0 = EN.puzzleHints(def, 0), h3 = EN.puzzleHints(def, 3);
  const n0 = (h0 || []).length, n3 = (h3 || []).length;
  say("       hints at sense tier 0: " + n0 + "   ·   at tier 3: " + n3);
  if (n3 <= n0) flag(def.id, "a tier-3 read earns no more hints than a blind one (" + n0 + " vs " + n3 + ") — the sense step buys nothing here");

  // it must be solvable
  let st = st0, guard = 0, solved = null;
  while (guard++ < 20) {
    const r = EN.puzzleAttempt(st, def, res("success", 14), rules, {});
    if (!r) { flag(def.id, "puzzleAttempt returned nothing"); break; }
    st = r.state || st;
    if (r.ended) { solved = r; break; }
  }
  if (!solved) flag(def.id, "a puzzle driven with " + guard + " successes never ends — it cannot be solved");
  else say("       ✅ solves → outcome \"" + (solved.outcome ?? "?") + "\"");

  // and failing must do SOMETHING — a puzzle you can grind for free is a delay, not a challenge
  const fail = EN.puzzleAttempt(st0, def, res("failure", -16), rules, {});
  const cost = fail && fail.deltas && Object.values(fail.deltas).some(v => Number(v) !== 0);
  if (!cost) flag(def.id, "a FAILED attempt costs nothing (" + JSON.stringify(fail?.deltas ?? null) + ") — it can be brute-forced for free");
  else say("       ✅ a failed attempt costs " + JSON.stringify(fail.deltas));

  if (EN.puzzleUnlocks) {
    const u = EN.puzzleUnlocks(def, { abilities: [], inventory: [] });
    say("       unlocks with an empty character: " + JSON.stringify(u ?? null));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
console.log("");
line();
say("FRAME KINDS — every authored encounter must resolve to a frame, and the frame decides its exits");
line();
const frames = J("content/packs/core/rules/encounter_frame_kinds.json").frameKinds || {};
const frameIds = Array.isArray(frames) ? frames.map(f => f.id) : Object.keys(frames);
say();
say("  authored frames: " + frameIds.join(", "));
const EF = await import("../engine/encounterFrame.js");
const kinds = {};
for (const { def, file } of found) {
  const k = EF.encounterKind(def);
  kinds[k] = (kinds[k] || 0) + 1;
  if (!k) flag(def.id, "resolves to NO frame kind — the exit rule for it is undefined");
  else if (!frameIds.includes(k)) flag(def.id, "resolves to frame \"" + k + "\" which is not authored in encounter_frame_kinds.json");
}
say("  encounters per frame: " + Object.entries(kinds).map(([k, v]) => k + "×" + v).join(" · "));
// ⚠️ "USED BY NO AUTHORED ENCOUNTER" IS NOT "UNREACHABLE" — a kind can be MINTED at runtime, and two of
// these are. `chaseFromFight` makes a chase when you break off a fight; `sanitizeNewEncounter` can now mint a
// standoff from a GM `flavor`. ⛔ MY FIRST VERSION REPORTED BOTH AS DEAD and one of them was fine, so it
// checks the mint doors too rather than counting files.
const unused = frameIds.filter(f => !kinds[f]);
if (unused.length) {
  say();
  say("  ⚠️ no AUTHORED encounter uses: " + unused.join(", ") + " — so how is each one reached?");
  const EN2 = EN;
  const mintDoors = {
    chase: () => EF.encounterKind(EF.chaseFromFight({ id: "x", type: "duel", opponent: { name: "a foe" } })) === "chase",
    standoff: () => EF.encounterKind(EN2.sanitizeNewEncounter({ type: "duel", name: "a parley", flavor: "standoff",
      opponent: { name: "a captain", threat: 40, health: 5 } })) === "standoff",
  };
  for (const f of unused) {
    const door = mintDoors[f];
    if (!door) { flag(f, "frame \"" + f + "\" has no authored encounter AND no known mint door — unreachable"); continue; }
    let ok = false; try { ok = door(); } catch { ok = false; }
    if (ok) say("       ✅ " + f + " — minted at runtime, not authored. Reachable.");
    else flag(f, "frame \"" + f + "\" has a mint door that does NOT produce it — built, framed, unreachable");
  }
}

// ═══════════════════════════════════════════════════════════════════════════
console.log("");
line("═");
if (!problems.length) {
  say("✅ EVERY AUTHORED ENCOUNTER OF EVERY TYPE STARTS, RESOLVES, AND CAN BE LOST.");
} else {
  say("⛔ " + problems.length + " PROBLEM(S):");
  say();
  for (const p of problems) say("   " + p.id.padEnd(28) + p.what);
  process.exitCode = 1;
}
line("═");
console.log("");
