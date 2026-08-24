#!/usr/bin/env node
// ⛔ CCODE-230 — THE GAIN-AXIS WORKLIST. Aevi's §1, built to her split: GATE the fact, REPORT the guess.
//
// Two findings, deliberately NOT given equal standing:
//   · ranks at r2+ that declare NO gain axis  — a FACT. no interpretation. gated as a ratchet.
//   · grants prose naming an axis the declaration does not — a REGEX OVER PROSE. report only, forever.
//
// ⚠️ WHY THE SECOND MUST NEVER GATE, in Aevi's words: "a regex gate teaches the author to satisfy the
// regex… and when prose says SCOPE and the axes say `targets`, THE PROSE MAY BE THE THING THAT IS WRONG.
// A gate pushes me to change the declaration to match loose wording — it would launder sloppy prose into
// mechanical truth, and it would go green doing it."
//
// ⛔ THE DECLARED UNIT IS IN THE HEADER, because we have now produced different numbers for the same thing
// three times in two days and the fix was the unit every time. This counts RANKS (not crafts) at rank ≥ 2,
// over the LOADED CATALOGUE (not the files) — 177 loaded vs 227 on disk, and the 50-rank gap is entirely
// `first_gift_template` supplying `gainAxes` to its cohort at load. §42.2: the catalogue is what runs.
import { writeFileSync } from "node:fs";

globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); } };
const { loadContentHeadless } = await import("../tests/headless_content.mjs");
const { traditionOf } = await import("../engine/traditions.js");
const C = await loadContentHeadless();

// ⚠️ THE VOCABULARY IS EVIDENCE, NOT A VERDICT. Each pattern is a reason to LOOK at a rank, never a claim
// about it. Kept narrow on purpose: a wider net produces a longer list nobody trusts.
const VOCAB = {
  range:    /\b(a region|at a distance|far off|leagues|across the|as a beacon|from anywhere)\b/i,
  duration: /\b(over time|for (hours|days)|track .{0,20}over|keeps working|lingers|a whole history)\b/i,
  targets:  /\b(someone else|another person|protect (a|an|someone)|a second person)\b/i,
  scope:    /\b(a whole|everyone|all of the|the entire)\b/i,
  quality:  /\b(what it is (actually )?for|the cause|what would turn it|its shape)\b/i,
  autonomy: /\b(without you|acts on its own|unattended|by itself)\b/i,
};

const undeclared = [], prose = [];
for (const a of Object.values(C.abilities)) {
  const trad = traditionOf(a, C.traditionIndex) || "—";
  const hasDeltas = !!(a.rankDeltas || (a.tree || []).some(r => r.rankDeltas));
  for (const r of (a.tree || [])) {
    if (Number(r.rank) < 2) continue;
    const axes = (r.gainAxes || []).map(x => String(x).toLowerCase());
    if (!axes.length) undeclared.push({ id: a.id, name: a.name, rank: r.rank, trad, hasDeltas, grants: String(r.grants || "") });
    for (const [ax, re] of Object.entries(VOCAB)) {
      if (re.test(String(r.grants || "")) && !axes.includes(ax)) {
        prose.push({ id: a.id, name: a.name, rank: r.rank, trad, says: ax, declares: axes.join("/") || "—", grants: String(r.grants || "") });
        break;
      }
    }
  }
}
const byTrad = (rows) => { const m = {}; for (const r of rows) m[r.trad] = (m[r.trad] || 0) + 1;
  return Object.entries(m).sort((a, b) => b[1] - a[1]); };
const mech = undeclared.filter(r => r.hasDeltas), judge = undeclared.filter(r => !r.hasDeltas);

const md = `# Gain-axis worklist — generated, do not hand-keep

⛔ **UNIT: RANKS (not crafts), at rank ≥ 2, over the LOADED CATALOGUE (not the files).**
On disk the first number reads **227**; after \`first_gift_template\` merges at load it is **${undeclared.length}**.
The 50-rank gap is the template supplying \`gainAxes\` to its cohort — the same file-vs-loader trap as CCODE-229.

| | n |
|---|---|
| ⛔ **ranks declaring NO gain axis** (gated, ratchet) | **${undeclared.length}** |
| ⚠️ prose names an axis the declaration doesn't (report only) | **${prose.length}** |

---

## §1 — ⛔ NO GAIN AXIS DECLARED (${undeclared.length} ranks) — the gated fact

**Split by \`rankDeltas\`, as asked — the flag is printed and the split falls out, not guessed:**

| | n | why |
|---|---|---|
| ✅ **craft HAS \`rankDeltas\`** | **${mech.length}** | the axis is often recoverable from what actually changed — near-mechanical |
| ⚠️ **no delta** | **${judge.length}** | genuine judgement — slow |

**By tradition:** ${byTrad(undeclared).map(([t, n]) => `${t} ${n}`).join(" · ")}

### ✅ Near-mechanical — \`rankDeltas\` present (${mech.length})

| craft | r | tradition | grants |
|---|---|---|---|
${mech.slice(0, 120).map(r => `| \`${r.id}\` | ${r.rank} | ${r.trad} | ${r.grants.slice(0, 90).replace(/\|/g, "\|")} |`).join("\n")}
${mech.length > 120 ? `\n_…and ${mech.length - 120} more._\n` : ""}
### ⚠️ Judgement — no delta to read (${judge.length})

| craft | r | tradition | grants |
|---|---|---|---|
${judge.slice(0, 60).map(r => `| \`${r.id}\` | ${r.rank} | ${r.trad} | ${r.grants.slice(0, 90).replace(/\|/g, "\|")} |`).join("\n")}
${judge.length > 60 ? `\n_…and ${judge.length - 60} more._\n` : ""}
---

## §2 — ⚠️ PROSE vs DECLARATION (${prose.length}) — **REPORT ONLY. THIS IS NOT A GATE AND MUST NOT BECOME ONE.**

⛔ **Every row here is a REASON TO LOOK, never a defect.** A regex over prose finds words, not facts.
⚠️ **And when the two disagree, the PROSE may be the thing that is wrong** — a gate here would push the
declaration to match loose wording and launder sloppy prose into mechanical truth, going green as it did.

| craft | r | tradition | prose suggests | declares | grants |
|---|---|---|---|---|---|
${prose.slice(0, 80).map(r => `| \`${r.id}\` | ${r.rank} | ${r.trad} | **${r.says}** | ${r.declares} | ${r.grants.slice(0, 80).replace(/\|/g, "\|")} |`).join("\n")}
${prose.length > 80 ? `\n_…and ${prose.length - 80} more._\n` : ""}
---

_Generated by \`scripts/axis_worklist.mjs\`. Regenerate rather than editing._
`;
writeFileSync("po/WORKLIST_gain_axes.md", md);
console.log(`undeclared ranks: ${undeclared.length}  (rankDeltas ${mech.length} / judgement ${judge.length})`);
console.log(`prose-vs-declaration (report only): ${prose.length}`);
console.log("wrote po/WORKLIST_gain_axes.md");
