// live_gm_suite.mjs — THE ONE-CLICK LIVE GM SUITE. Real Anthropic calls; costs real money.
//
// Erik: "if you used my pat to run the live_gm, what would the most valuable runs be?"
//
// This file is the answer, built so HE runs it and I read the report — his key never leaves his machine
// and he owns the spend. Each scenario targets something that CANNOT be verified any other way, ordered by
// value-per-call. Everything a headless sim can check is already checked; what remains is the one boundary
// no simulation reaches: whether a real model, under the real ~12k-token constitution with its 114 MUST
// directives, actually EMITS the shapes the engine now reads.
//
// WHY THESE FIVE, and why in this order:
//  1 OP-SHAPE ROUND-TRIP — I changed the GM contract this session (`grants` on itemUpdates, the new
//    `deriveItem` op, `functions` on newAbility). NOTHING has ever confirmed a model can produce them.
//    If the model cannot, those features are built and dead, and no unit test would ever say so.
//  2 THE HARD DIRECTIVE FIRES — SNG-251 §2a exists because `itemUpdates` was dropping under saturation.
//    The fix is an engine-enforced HARD directive. Whether a hard directive actually survives the load is
//    the entire premise, and it is unproven.
//  3 THE GATE vs REAL OUTPUT — growth_sim measures the born-whole gate's fragility on synthetic knockouts.
//    This measures its REJECT RATE on genuine model output, which is the number that decides whether the
//    world grows or quietly stops.
//  4 THE ENCOUNTER-OFFER BOUNDARY — playthrough_sim localised the biggest known break here by elimination
//    and said outright that a headless sim cannot drive it. This drives it.
//  5 KIND-NATIVE VOICE — does a standoff narrate as a contest of will (nobody bleeding), or as a fight
//    wearing a label? SNG-247/252's whole premise, checkable only in prose.
//
// SETUP (one time):  set ANTHROPIC_API_KEY, or drop the key in .claude/anthropic_key (gitignored)
// RUN:               npm run live            (all five)
//                    npm run live -- --only=ops        (just one; each is independently runnable)
// OUTPUT:            tests/live_report.json + tests/live_report.md — hand me the .md
//
// Every scenario is a SEPARATE call, so a failure is localised and a partial run is still useful.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const store = new Map();
globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const load = p => JSON.parse(readFileSync(join(root, p), "utf8"));

// key: env var, or a gitignored file, so "one click" is true after a one-time setup
const keyFile = join(root, ".claude/anthropic_key");
const KEY = process.env.ANTHROPIC_API_KEY || (existsSync(keyFile) ? readFileSync(keyFile, "utf8").trim() : "");
if (!KEY) {
  console.error("No API key. Either:  set ANTHROPIC_API_KEY=sk-...   or put the key in .claude/anthropic_key (gitignored)");
  process.exit(1);
}
localStorage.setItem("singularity.anthropicKey", KEY);

const { gmTurn } = await import("../engine/gm.js");
const { checkBorn } = await import("../engine/borncontract.js");

const rules = load("content/packs/core/rules/resolution.json");
const location = load("content/packs/valley/locations/millbrook.json");
const lore = readFileSync(join(root, "content/packs/valley/lore/valley_primer.md"), "utf8");
const contract = load("content/packs/core/rules/consumer_required_subfields.json");
const VERBS = Object.values(load("content/packs/core/rules/function_vocabulary.json").families || {})
  .flatMap(l => (Array.isArray(l) ? l : []).map(v => (typeof v === "string" ? v : v?.verb))).filter(Boolean);
const vocabs = { "function_vocabulary.verbs": VERBS };

const baseCharacter = {
  schemaVersion: 1, id: "live-test", playerKey: "test", name: "Silas", origin: "valley", background: "craftsman",
  level: 12, xp: 0, attributes: { physical: 5, mental: 5, social: 4, practical: 5 },
  skills: {}, abilities: [{ abilityId: "sonic_resonance", level: 2 }],
  alignment: {}, attunement: 3, health: 40, maxHealth: 40, energy: 100, maxEnergy: 100,
  inventory: [
    { name: "Assembled Mid-Weight Spear", customName: "Memory", kind: "weapon", qty: 1,
      description: "A seasoned ash shaft, mid-weight iron tip road-lashed at the socket throat. Plain, and well kept." },
    { name: "Belt Knife", kind: "weapon", qty: 1, description: "A plain working blade." }
  ],
  deeds: [], relationships: {}, chronicle: [], currentLocationId: "millbrook"
};
const inventoryDetail = "Memory (their name for: Assembled Mid-Weight Spear) (weapon — a seasoned ash shaft, mid-weight iron tip); Belt Knife (weapon — a plain working blade)";

const only = (process.argv.find(a => a.startsWith("--only=")) || "").split("=")[1] || null;
const report = { at: new Date().toISOString(), scenarios: [] };
const say = m => console.log(m);

/** Run one scenario, capture everything, never let one failure stop the rest. */
async function scenario(id, title, why, run) {
  if (only && only !== id) return;
  say(`\n─── ${id}: ${title}`);
  const entry = { id, title, why, checks: [], raw: null, error: null };
  try {
    const out = await run((label, pass, detail) => { entry.checks.push({ label, pass, detail: detail || null }); say(`   ${pass ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`); });
    entry.raw = out || null;
  } catch (e) { entry.error = String(e?.message || e); say(`   ERROR ${entry.error}`); }
  report.scenarios.push(entry);
}

// ============================================================ 1. OP-SHAPE ROUND-TRIP
await scenario("ops", "Can the model EMIT the ops I added this session?",
  "grants / deriveItem / newAbility.functions are new contract shapes. Nothing has ever confirmed a real model produces them — if it cannot, those features are built and dead.",
  async (check) => {
    const r = await gmTurn({
      character: baseCharacter, location, rules, lore, region: {}, resolution: null,
      recentTurns: [], timeLabel: "Day 14, dawn (early-spring)", inventoryDetail,
      itemEvolveDetail: `The player has just done real WORK upon "Memory" — an item they are carrying — in their own words. This is an evolution beat: you MUST emit \`itemUpdates\` for it THIS TURN. Update its description to what it has become, say what it now LOOKS like (\`imagePrompt\`), and — the fiction genuinely earned power (a rune actually bound) — state that power EXPLICITLY as \`grants\`, each naming what it does and what it explicitly cannot do. This item can take on new power today; the engine will clamp it to what is reasonable at L12 / craft rank 2 and refuse anything past 3 grants. If the work SPLIT it into a second thing the player can call separately, emit \`deriveItem\` — a derived item is a PEER with its own grants, never a weaker echo.`,
      playerInput: "I seat the last rune-thread into the spear's fuller at Pell's forge and speak the binding word over it, then split a shadow-twin of it off to carry at distance."
    });
    if (!r.ok) { check("gmTurn returned ok", false, r.error); return r; }
    const t = r.turn;
    const iu = t.itemUpdates || [];
    check("emitted itemUpdates at all (the SNG-251 §2a hard directive landed)", iu.length > 0);
    check("named the right item", iu.some(u => /memory|spear/i.test(u.name || u.customName || "")), JSON.stringify(iu.map(u => u.name)));
    check("evolved the DESCRIPTION", iu.some(u => (u.description || "").length > 40));
    check("supplied an imagePrompt so the art can re-mint (SNG-251 §2b)", iu.some(u => (u.imagePrompt || "").length > 10));
    const grants = iu.flatMap(u => u.grants || []);
    check("emitted GRANTS — earned power recorded as mechanics (SNG-251 §2c)", grants.length > 0, JSON.stringify(grants).slice(0, 300));
    check("every grant states what it DOES", grants.length > 0 && grants.every(g => (g.effect || "").length > 5));
    check("every grant states its own BOUND (clamp) — explicit power with no stated limit is power creep", grants.length > 0 && grants.every(g => (g.clamp || "").length > 3));
    check("emitted deriveItem for the split (SNG-251 §2d)", !!t.deriveItem, JSON.stringify(t.deriveItem || null).slice(0, 250));
    return { turn: t };
  });

// ============================================================ 2. newAbility.functions
await scenario("ability", "Does a GM-minted ability arrive with real function verbs?",
  "sanitizeNewAbility silently minted abilities with NO functions since v1.0.0 — invisible to coverage, recommendation and the wield machinery. I added `functions` to the op contract; this proves the model fills it from the closed 24-verb vocabulary.",
  async (check) => {
    const r = await gmTurn({
      character: baseCharacter, location, rules, lore, region: {}, resolution: null, recentTurns: [],
      timeLabel: "Day 15, midday", inventoryDetail,
      playerInput: "(Pell finishes teaching me the resonance-cut she promised — a wholly new craft, earned through the week's work at her forge. Grant it.)"
    });
    if (!r.ok) { check("gmTurn returned ok", false, r.error); return r; }
    const na = r.turn.newAbility;
    check("emitted newAbility", !!na, JSON.stringify(na || null).slice(0, 200));
    check("supplied a `functions` array", Array.isArray(na?.functions) && na.functions.length > 0, JSON.stringify(na?.functions));
    check("every verb is IN the closed vocabulary (an off-vocab verb is silently dropped and the craft engages nothing)",
      Array.isArray(na?.functions) && na.functions.every(v => VERBS.includes(String(v).toLowerCase())),
      `got ${JSON.stringify(na?.functions)}; vocab is ${VERBS.join(" ")}`);
    check("stated a notFor bound", !!na?.notFor);
    return { newAbility: na };
  });

// ============================================================ 3. THE GATE vs REAL OUTPUT
await scenario("gate", "Does the born-whole gate ACCEPT real model output?",
  "growth_sim measures fragility on synthetic knockouts. This measures the REJECT RATE on genuine generation — the number that decides whether the world grows or quietly stops.",
  async (check) => {
    const results = [];
    for (const [type, ask] of [["npc", "a person the player has just met at the mill"], ["location", "a place just beyond the mill the player is walking into"]]) {
      const r = await gmTurn({
        character: baseCharacter, location, rules, lore, region: {}, resolution: null, recentTurns: [],
        timeLabel: "Day 16, morning", inventoryDetail,
        playerInput: `(GENERATION TEST — emit a generateRequest for a ${type}: ${ask}. Give it everything a ${type} needs to be whole.)`
      });
      const req = (Array.isArray(r.turn?.generateRequest) ? r.turn.generateRequest : [r.turn?.generateRequest]).filter(Boolean)[0];
      results.push({ type, req: req || null });
    }
    check("the model emitted a generateRequest when asked", results.some(x => x.req), JSON.stringify(results).slice(0, 250));
    // The gate is exercised against the shapes we DID get; the value is the verdict distribution.
    for (const { type, req } of results) {
      if (!req) continue;
      const rep = checkBorn(req, type, contract, { vocabs });
      check(`a generated ${type} is not REJECTED by the gate`, rep.verdict !== "reject",
        `verdict=${rep.verdict} missing=${JSON.stringify(rep.missing.map(m => m.field))} vague=${JSON.stringify(rep.vague.map(v => v.id))}`);
    }
    return { results };
  });

// ============================================================ 4. THE ENCOUNTER-OFFER BOUNDARY
await scenario("offer", "Does the GM OFFER a recognizable encounter it is handed?",
  "playthrough_sim localised the biggest known break here BY ELIMINATION and said a headless sim cannot drive it: rule 18 is a SOFT conditional competing with 114 MUSTs, so the offer drops under load. This is the only way to see it.",
  async (check) => {
    const r = await gmTurn({
      character: baseCharacter, location, rules, lore, region: {}, resolution: null, recentTurns: [],
      timeLabel: "Day 17, dusk", inventoryDetail,
      encounterOfferDetail: `The world has turned up a recognizable fight — "Rust-Choir Gnats". This is NOT ambient texture to fold into prose: it is a bounded encounter the player must be able to SEE and ENTER. You MUST, this beat, present it as a framed CHOICE carrying \`encounterId: "beast_rust_choir_gnats"\` (label it for what it is), beside a clear way to decline or avoid.`,
      playerInput: "I walk the river path back toward the mill."
    });
    if (!r.ok) { check("gmTurn returned ok", false, r.error); return r; }
    const choices = r.turn?.choices || [];
    check("offered a choice carrying the encounterId (the offer SURVIVED the prompt load)",
      choices.some(c => c.encounterId === "beast_rust_choir_gnats"),
      JSON.stringify(choices.map(c => ({ label: c.label, encounterId: c.encounterId }))).slice(0, 400));
    check("also gave a way to decline (SNG-002b: a hazard is a CHOICE, not a trap)", choices.length >= 2);
    check("named the creature rather than a generic threat (Erik's 'the aggressor' bug, in prose)",
      /gnat|rust|choir/i.test(r.turn?.narration || "") || choices.some(c => /gnat|rust|choir/i.test(c.label || "")));
    return { choices, narration: (r.turn?.narration || "").slice(0, 600) };
  });

// ============================================================ 5. KIND-NATIVE VOICE
await scenario("voice", "Does a STANDOFF narrate as a standoff, or as a fight in a hat?",
  "SNG-247/252's premise: the meter says 'their resolve' and the ribbon says it cannot hurt you. If the prose still trades blows, the kind is a label. Only readable in prose. (SNG-253 is scoped from exactly this gap.)",
  async (check) => {
    const r = await gmTurn({
      character: baseCharacter, location, rules, lore, region: {}, resolution: null, recentTurns: [],
      timeLabel: "Day 18, noon", inventoryDetail,
      encounterDetail: `THE STANDOFF: the keeper of the toll — 4/6 of their certainty left. This is a contest of WILL — narrate what is said, what is held back, what shifts behind the eyes. NOBODY IS HURT: no weapon lands and no blood is drawn unless this becomes a fight.\nRound 2. The player pressed their point and gained ground.`,
      playerInput: "I hold his eye and tell him plainly what the toll has cost the people upriver."
    });
    if (!r.ok) { check("gmTurn returned ok", false, r.error); return r; }
    const n = (r.turn?.narration || "").toLowerCase();
    check("nobody bleeds — no wound/blood/blade language in a contest of will",
      !/\b(blood|bleed|wound|stab|cut him|slash|blade bites)\b/.test(n), n.slice(0, 300));
    check("it reads as a contest of WILL (speech / resolve / holding language present)",
      /\b(say|said|word|eye|resolve|hold|silence|answer|voice)\b/.test(n));
    return { narration: r.turn?.narration || "" };
  });

// ---------- write the report ----------
const passes = report.scenarios.flatMap(s => s.checks).filter(c => c.pass).length;
const total = report.scenarios.flatMap(s => s.checks).length;
report.summary = { passes, total, errored: report.scenarios.filter(s => s.error).length };

writeFileSync(join(root, "tests/live_report.json"), JSON.stringify(report, null, 2));
const md = [`# Live GM suite — ${report.at}`, ``, `**${passes}/${total} checks passed.**`, ``,
  ...report.scenarios.flatMap(s => [
    `## ${s.id} — ${s.title}`, ``, `_${s.why}_`, ``,
    s.error ? `**ERROR:** ${s.error}` : s.checks.map(c => `- ${c.pass ? "✅" : "❌"} ${c.label}${c.detail ? `\n  - \`${String(c.detail).slice(0, 500)}\`` : ""}`).join("\n"),
    ``, s.raw ? `<details><summary>raw</summary>\n\n\`\`\`json\n${JSON.stringify(s.raw, null, 2).slice(0, 3000)}\n\`\`\`\n</details>` : "", ``
  ])].join("\n");
writeFileSync(join(root, "tests/live_report.md"), md);

say(`\n${"=".repeat(70)}\n${passes}/${total} checks passed across ${report.scenarios.length} scenario(s).`);
say(`Report written: tests/live_report.md  ← hand this to CCode\n`);
process.exit(0);   // never fail a build: this is an INVESTIGATION, and a red model answer is a finding, not a broken repo
