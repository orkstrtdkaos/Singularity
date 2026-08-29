// scripts/rankdelta_report.mjs — CCODE-289. BEFORE AND AFTER, ACROSS EVERY RANKED CRAFT.
//
// ⛔ AEVI: "A BEFORE/AFTER REPORT ACROSS ALL 284 BEFORE IT SHIPS. Two-thirds changing kind is a real
// balance event even though every value was deliberately authored. The report is the ruling's evidence,
// not a formality."
//
// ⚠️ SO THIS RESOLVES EVERY RANKED CRAFT TWICE — once the way the engine did before the adapter, once the
// way it does now — and prints every field that moved. ⛔ IT IS NOT A TEST. It changes nothing and asserts
// nothing; it exists so a person can look at a balance change before agreeing to it.

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rj = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));
const cfg = rj("content/packs/core/rules/craft_mechanics.json");
const { mechanicFor, rankDeltaFor, EXTENDABLE } = await import("../engine/craftmechanics.js");

const abilities = [];
for (const f of readdirSync(join(root, "content/packs/core/abilities")).filter(x => x.endsWith(".json")))
  for (const a of (rj(`content/packs/core/abilities/${f}`).abilities || [])) abilities.push(a);

const W = 108;
const line = (c = "─") => console.log("  " + c.repeat(W));
const say = (s = "") => console.log("  " + s);

console.log("");
line("═");
console.log("  CCODE-289 — THE RANK-DELTA ADAPTER: BEFORE / AFTER");
line("═");

/** ⛔ THE ENGINE AS IT WAS: the authored root list is invisible, so every ranked craft takes the default. */
const before = (a, rank) => {
  const steps = Math.max(0, rank - 1);
  const d = cfg.rankDeltas?.default;
  return steps > 0 && d ? { kind: d.kind, mult: Math.pow(Number(d.mult) || 1.35, steps), source: "default" } : null;
};

const ranked = abilities.filter(a => Array.isArray(a.rankDeltas) && a.rankDeltas.length);
const kinds = { before: {}, after: {} };
let moved = 0, same = 0;
const unmapped = {}, extended = {}, samples = [];

for (const a of ranked) {
  for (const rank of [2, 3]) {
    const b = before(a, rank), n = rankDeltaFor(a, rank, { cfg });
    if (!b && !n) continue;
    kinds.before[b?.kind || "none"] = (kinds.before[b?.kind || "none"] || 0) + 1;
    kinds.after[n?.kind || "none"] = (kinds.after[n?.kind || "none"] || 0) + 1;
    if (n?.unmapped) unmapped[n.unmapped] = (unmapped[n.unmapped] || 0) + 1;
    for (const d of (n?.dimensions || [])) extended[d] = (extended[d] || 0) + 1;

    // ⚠️ THE NUMBERS THAT ACTUALLY REACH PLAY, not the delta object — resolve the whole mechanic both ways.
    const mAfter = mechanicFor(a, { rank, cfg });
    if (!mAfter) continue;
    const changedKind = (b?.kind || null) !== (n?.kind || null);
    if (changedKind) {
      moved++;
      if (samples.length < 12 && n?.kind === "extend" && n?.dimensions?.length)
        samples.push(`${a.id} r${rank}: ${b?.kind} → extend ${n.dimensions.join("+")} ×${n.mult.toFixed(2)}`);
    } else same++;
  }
}

say();
line();
say("① WHAT CHANGED — kind, across every ranked craft at r2 and r3");
line();
say();
say("   BEFORE: " + Object.entries(kinds.before).map(([k, v]) => `${k} ${v}`).join(" · "));
say("   AFTER : " + Object.entries(kinds.after).map(([k, v]) => `${k} ${v}`).join(" · "));
say();
say(`   ⛔ ${moved} rank-resolutions changed KIND · ${same} unchanged`);
say();
say("   ⚠️ THE MAGNITUDE DID NOT CHANGE FOR `deepen`. An authored delta carries no `mult` (0 of 495), so");
say("      the amount still comes from the dial, compounded by rank exactly as before. AUTHORING OVERRULES");
say("      THE KIND, NOT THE AMOUNT — otherwise 129 deepen crafts would have scaled by 1.0 and got WORSE.");

say();
line();
say("② WHAT `extend` NOW GROWS — the third of the corpus that was silently inert");
line();
say();
for (const [d, n] of Object.entries(extended).sort((a, b) => b[1] - a[1]))
  say(`   ${d.padEnd(12)}${String(n).padStart(4)} rank-resolutions now extend it`);
say();
for (const s of samples) say("   " + s);

say();
line();
say("③ ⛔ AND WHAT EXTENDS NOTHING — narrative axes, reported rather than guessed at");
line();
say();
const un = Object.entries(unmapped).sort((a, b) => b[1] - a[1]);
for (const [k, n] of un) say(`   ${k.padEnd(24)}${String(n).padStart(4)}   no engine field — extends nothing`);
say();
say(`   ${un.reduce((a, x) => a + x[1], 0)} rank-resolutions name an axis with no field behind it.`);
say("   ⚠️ THESE ARE PROSE AND MUST STAY PROSE. Guessing a field for `persistence` would invent a mechanic");
say("      nobody authored — the failure this whole adapter exists to undo, committed in the fix for it.");
say(`   ⛔ Aevi owns these: split the compounds, or accept them as flavour. ${un.length} distinct names.`);

/* ══ ④ THE BIGGEST SINGLE EFFECT, AND MY FIRST DRAFT OF THIS REPORT BURIED IT IN A KIND TALLY ══ */
say();
line();
say("④ ⛔ THE PART THAT NEEDS A RULING: `add` RANKS STOP GETTING A MAGNITUDE BUMP");
line();
say();
let addNerf = 0; const nerfSamples = [];
for (const a of ranked) {
  for (const rank of [2, 3]) {
    const n = rankDeltaFor(a, rank, { cfg });
    if (n?.kind !== "add") continue;
    // resolve the operative field both ways — the honest measure is the NUMBER, not the label
    const mNow = mechanicFor(a, { rank, cfg });
    if (!mNow) continue;
    const op = mNow.operative;
    const val = mNow.fields?.[op];
    if (!Number.isFinite(val)) continue;
    const wouldHave = Math.round(val * Math.pow(Number(cfg.rankDeltas?.default?.mult) || 1.35, rank - 1));
    if (wouldHave !== val) {
      addNerf++;
      if (nerfSamples.length < 8) nerfSamples.push(`${a.id} r${rank}: ${op} stays ${val} (was becoming ${wouldHave})`);
    }
  }
}
say(`   ⛔ ${addNerf} rank-resolutions keep a number that was previously multiplied by the default.`);
say();
for (const s of nerfSamples) say("   " + s);
say();
say("   ⚠️ THIS IS A REAL NERF AND IT IS ALSO WHAT ERIK RULED. `add` means ADD A FUNCTION (the cfg's own");
say("      note), so a rank whose author said it grants a NEW THING should not ALSO silently grow the old");
say("      one by 35%. The player still gets the new capability — it lives in the tree's `grants`.");
say("   ⛔ BUT IT IS THE LARGEST EFFECT OF THIS CHANGE AND IT MUST NOT ARRIVE AS A SURPRISE.");
say("      If it should keep the bump, `add` needs an engine branch and that is a second ruling.");

console.log("");
line("═");
say("THIS REPORT IS THE RULING'S EVIDENCE. Nothing here asserts; a person decides whether to accept it.");
line("═");
console.log("");
