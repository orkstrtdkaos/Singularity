#!/usr/bin/env node
// ⛔ CCODE-241 — NEAR-DUPLICATE TERMS. Erik: "keep an eye out for new terms that might be variations that
// should be merged... temp soak sounds like soak to me."
//
// ⚠️ HE WAS RIGHT TO ASK AND THE ANSWER WAS NOT A MERGE. `SOAK` is subtracted from a landed hit;
// `TEMP_SOAK` lands a persistent effect that enters the ROLL as a contestMod and never touches the damage
// line. They are not two names for one thing — they are two things, and one of them is named after the
// other. That is worse than a duplicate, because a duplicate wastes a word and a misnomer teaches a model.
//
// ⛔ SO THIS SWEEP REPORTS CANDIDATES, NEVER VERDICTS. Two terms sharing a stem is a REASON TO LOOK. What
// they actually do is the only thing that decides, and no string comparison can see it.

import { readFileSync, readdirSync } from "node:fs";

const rj = (p) => JSON.parse(readFileSync(p, "utf8"));

// ── the vocabularies in play ────────────────────────────────────────────────
const effects = Object.keys(rj("content/packs/core/rules/mechanic_effects.json").effects || {});
const cm = rj("content/packs/core/rules/craft_mechanics.json");
const verbs = new Set();
for (const f of Object.values(cm.families || {})) for (const v of (f.verbs || [])) verbs.add(v);
for (const v of Object.keys(cm.verbOverrides || {})) verbs.add(v);
const shapes = new Set();
for (const f of Object.values(cm.families || {})) if (f.shape) shapes.add(f.shape);
for (const o of Object.values(cm.verbOverrides || {})) if (o.shape) shapes.add(o.shape);

// mechanic field names actually authored across the corpus
const fields = new Map();
for (const f of readdirSync("content/packs/core/abilities").filter(x => x.endsWith(".json"))) {
  for (const a of (rj(`content/packs/core/abilities/${f}`).abilities || [])) {
    const bump = (k) => fields.set(k, (fields.get(k) || 0) + 1);
    for (const k of Object.keys(a.mechanic || {})) if (!k.startsWith("_")) bump(k);
    for (const r of (a.tree || [])) {
      for (const k of Object.keys(r || {})) if (!k.startsWith("_") && !["rank", "name", "grants", "cannot"].includes(k)) bump(k);
      for (const k of Object.keys(r?.mechanic || {})) if (!k.startsWith("_")) bump(k);
    }
  }
}

const sbe = rj("content/packs/core/rules/skill_battle_system.json").engine || {};
const fxKinds = [...new Set(Object.values(sbe.persistentEffects?.byFunction || {}).map(d => d.kind))];

// ── the comparison. ⚠️ STEM-BASED, not fuzzy: a shared stem is a real signal, and edit distance
// over short technical words produces noise nobody reads. ──────────────────
const norm = (s) => String(s).toLowerCase().replace(/[_\-\s]/g, "");
const stems = (s) => {
  const n = norm(s);
  const out = new Set([n]);
  for (const p of ["temp", "sub", "pre", "re", "un", "anti", "self", "own"]) if (n.startsWith(p) && n.length > p.length + 2) out.add(n.slice(p.length));
  for (const q of ["s", "ed", "ing", "type", "types", "rank", "imposed", "functions", "fn"]) if (n.endsWith(q) && n.length > q.length + 2) out.add(n.slice(0, -q.length));
  return out;
};

const universe = [
  ...effects.map(t => ({ t, from: "effect" })),
  ...[...verbs].map(t => ({ t, from: "verb" })),
  ...[...shapes].map(t => ({ t, from: "shape" })),
  ...[...fields.keys()].map(t => ({ t, from: `field ×${fields.get(t)}` })),
  ...fxKinds.map(t => ({ t, from: "effect-kind" })),
];

const pairs = [];
for (let i = 0; i < universe.length; i++) {
  for (let j = i + 1; j < universe.length; j++) {
    const A = universe[i], B = universe[j];
    if (norm(A.t) === norm(B.t) && A.from === B.from) continue;
    const sa = stems(A.t), sb2 = stems(B.t);
    let shared = null;
    for (const s of sa) if (sb2.has(s)) { shared = s; break; }
    if (!shared) continue;
    if (norm(A.t) === norm(B.t)) { pairs.push({ A, B, why: "IDENTICAL string in two vocabularies", shared }); continue; }
    pairs.push({ A, B, why: `share the stem "${shared}"`, shared });
  }
}

console.log("\n⛔ NEAR-DUPLICATE TERM SWEEP — candidates to LOOK AT, never verdicts\n");
if (!pairs.length) console.log("  (none found)");
for (const p of pairs) {
  console.log(`  ${p.A.t}  (${p.A.from})`);
  console.log(`  ${p.B.t}  (${p.B.from})`);
  console.log(`      ↳ ${p.why}\n`);
}
// ── ⛔ AND THE QUESTION UNDERNEATH: which authored fields does the engine actually READ? ──────────
//
// A near-duplicate matters most when one of the pair is dead. `mechanic.soak` is authored on 30 crafts and
// read by nothing (CCODE-240); its sibling `soakRank` is authored on 29 and IS read. That asymmetry is
// invisible to a name comparison and it is the thing worth acting on.
//
// ⚠️ A NAME APPEARING IN engine/ IS NOT PROOF IT IS READ — `foothills` taught that. This is a WEAKER
// signal, deliberately labelled: absence of the name is strong evidence of absence; presence is only a
// hint. The effect audit is where a claim gets proven.
{
  const engineSrc = readdirSync("engine")
    .filter(f => f.endsWith(".js") || f.endsWith(".mjs"))
    .map(f => readFileSync(`engine/${f}`, "utf8")).join("\n")
    // ⛔ COMMENTS STRIPPED. A scanner that reads its own prose has bitten this project four times, twice
    // in files I wrote, and once because a comment NAMED the key it was explaining the removal of.
    .replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

  const unread = [...fields.entries()]
    // ⚠️ `\b-b (a word boundary), NOT the escape that collapses to `. My first version went through a shell heredoc and the escape collapsed to a
    // literal BACKSPACE, so the regex matched nothing and this sweep announced that ALL 40 authored fields
    // were unread — `magnitude` and `dice` among them. A check that reports everything broken is the same
    // family of failure as one that reports nothing: it is not measuring. The self-check below catches it.
    .filter(([k]) => !new RegExp("\\b" + k + "\\b").test(engineSrc))
    .sort((a, b) => b[1] - a[1]);

  console.log("-".repeat(96));
  console.log("\n⛔ AUTHORED MECHANIC FIELDS WHOSE NAME APPEARS NOWHERE IN engine/ (comments stripped)\n");
  if (!unread.length) console.log("  (none — every authored field name is at least mentioned)");
  for (const [k, n] of unread) console.log(`  ${String(n).padStart(4)} crafts author  ${k}`);
  console.log(`\n  ${unread.length} of ${fields.size} authored field names are absent from the engine entirely.`);
  console.log("  ⚠️ Absence is strong evidence. PRESENCE proves nothing — see `mechanic.soak`, which appears");
  console.log("     in engine/ and is still read by nobody. Only the effect audit settles that.\n");
}

console.log("-".repeat(96));
console.log(`${universe.length} terms across effects, verbs, shapes, authored fields and effect kinds · ${pairs.length} candidate pair(s)`);
console.log(`
⚠️ A SHARED STEM IS A REASON TO LOOK, NOT A DUPLICATE. The first pair this sweep was written for —
   SOAK / TEMP_SOAK — turned out NOT to be a merge: one is subtracted from damage, the other is a roll
   modifier. The name is the bug, not the duplication. Only behaviour decides.
`);
