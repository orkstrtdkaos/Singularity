// tests/world_presets.mjs — SNG-305: what kind of world does each setting make?
//
// Erik: *"what do worlds do now through a long sim? I would expect there to be different results in a
// distribution… so we probably want to sim and do some variation to come up with what settings to use for
// what kind of world behavior."*
//
// Every existing report answers "what happens at the numbers we have." This one answers the two questions
// that actually decide the dials:
//
//   A. SENSITIVITY — which dials MOVE world behaviour, and which are decorative? One dial at a time, three
//      values each, everything else held at the authored value. A dial whose three rows are identical is not
//      a dial; it is a number the engine reads and nothing depends on.
//   B. PRESETS — whole configurations, run as a population, reported as a DISTRIBUTION. Mean is the least
//      interesting number here: Erik's question is whether worlds at the same settings come out DIFFERENT
//      from each other, so spread and per-arc divergence are the headline.
//
// ⛔ A REPORT. It writes nothing, gates nothing, and names no setting "correct" — the presets below are
// candidate CHARACTERS ("a quiet valley", "a bloody one"), not recommendations. Which world Erik wants to
// live in is his call; this only says what each one does.
//
// ⚠️ REAL DAYS. World time is wall-clock-derived (`absoluteWorldDay`), not `character.clock.day`. Stepping by
// hours simulates 1/24th of the labelled span and reports the stillness as a finding. Done that, twice.
//
// Run: node tests/world_presets.mjs [sensitivity|presets|both] [worldsPerConfig] [worldDays]

import { loadContentHeadless } from "./headless_content.mjs";

const MODE = (process.argv[2] || "both").toLowerCase();
const WORLDS = Number(process.argv[3]) || 5;
const DAYS = Number(process.argv[4]) || 1460;      // ~4 world years
const DAY_MS = 24 * 3600000;
const STEP = 7;

const CONTENT = await loadContentHeadless();
const { advanceGeneratedOffscreen, initWorldState } = await import("../engine/worldtick.js");

const ROSTER = (CONTENT.legends?.roster || []).filter(f => f?.id);
const BASE = CONTENT.rules?.arcResponse || {};
const LADDER = ["riffraff", "notable", "heroic", "epic", "legendary", "mythic"];
const rungOf = t => LADDER.indexOf(t === "regional" ? "heroic" : t);

function seeded(seed) { let s = seed >>> 0; return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; }

/** Patch the dials without cloning the whole content bag (which is large and read-only here). One level of
 *  nesting is enough for `holding` / `strikes`, and doing it explicitly beats a generic deep-merge that would
 *  quietly succeed on a key that does not exist. */
function contentWith(patch = {}) {
  const arcResponse = { ...BASE };
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === "object" && !Array.isArray(v)) arcResponse[k] = { ...(BASE[k] || {}), ...v };
    else arcResponse[k] = v;
  }
  // ⚠️ FAIL LOUDLY ON A KEY NOBODY READS. A sweep that silently sets a misspelled dial reports "this dial
  // does nothing" — which is true, and completely misleading. This is the PromisedButUnread family showing
  // up in a measuring tool, where it is at its most dangerous because the output looks like a finding.
  for (const k of Object.keys(patch)) {
    if (!(k in BASE)) throw new Error(`world_presets: dial "${k}" is not in rules.arcResponse — nothing reads it`);
    const v = patch[k];
    if (v && typeof v === "object") for (const sub of Object.keys(v)) {
      if (!(sub in (BASE[k] || {}))) throw new Error(`world_presets: dial "${k}.${sub}" is not authored — nothing reads it`);
    }
  }
  return { ...CONTENT, rules: { ...CONTENT.rules, arcResponse } };
}

/** One world, run forward. Returns the outcome vector. */
async function runWorld(content, seed) {
  const rng = seeded(seed);
  const character = { name: `W${seed}`, level: 6, clock: { day: 1 }, actionCount: 0,
    npcRegistry: {}, quests: [], abilities: [], deeds: [], worldState: initWorldState(1) };
  delete character.worldState.lastTickWorldDay;
  const stub = async ({ entities }) => ({ developments: entities.map(e => ({ entityId: e.id, note: "the world turned", outcome: "progress" })) });

  const startTier = new Map(ROSTER.map(f => [f.id, f.tier || f.legend?.tier || null]));
  let strikes = 0, guarded = 0, struckDead = 0, crusades = 0, holdPeak = 0, contestPasses = 0, duels = 0;
  // ⚠️ ACCUMULATED PER PASS, like `strikes`. `ws.arcChallenges` is overwritten every pass, so reading it
  // once at the end reports the LAST pass — which is almost always zero. I did exactly that and the sweep
  // printed "0.0 challenges" beside a mythic count that was visibly falling with the rate.
  let challenges = 0, challengeDeaths = 0;
  const t0 = Date.now();
  for (let d = 0; d < DAYS; d += STEP) {
    await advanceGeneratedOffscreen({ character, content, evolveFn: stub, rng, now: t0 + d * DAY_MS });
    const w = character.worldState;
    for (const s of w?.arcStrikes || []) {
      strikes++;
      if (s.outcome === "guarded") guarded++;
      if (s.outcome === "killed") struckDead++;
      if (s.kind === "crusade") crusades++;
    }
    for (const held of Object.values(w?.careHeld || {}))
      for (const n of Object.values(held)) if (n > holdPeak) holdPeak = n;
    for (const o of Object.values(w?.arcContests || {})) { duels += o.duels || 0; if (o.duels) contestPasses++; }
    for (const c of w?.arcChallenges || []) { challenges++; if (c.outcome === "killed") challengeDeaths++; }
  }

  const w = character.worldState;
  const status = w?.epicStatus || {};
  const dead = Object.values(status).filter(s => s?.status === "dead").length;
  const tenure = w?.figureTenure || {};
  let rises = 0, falls = 0, mythics = 0;
  for (const [id, t] of Object.entries(tenure)) {
    if (t.tier === "mythic") mythics++;
    if (!startTier.has(id)) continue;
    const from = rungOf(startTier.get(id)), to = rungOf(t.tier);
    if (from >= 0 && to > from) rises++;
    if (from >= 0 && to >= 0 && to < from) falls++;
  }
  // ⚠️ ERIK'S METRIC IS "IN PLAY", NOT "EVER REACHED". A mythic who was killed two world-years ago is not
  // holding a seat at the top of the valley, and counting them was overstating the crowding. And his target
  // is stated in TRADITIONS — "maybe 1/4 the traditions should have a mythical in play at any given time" —
  // which is a different and better question than a headcount: it asks whether the top is SHARED OUT.
  const minted = (w?.mintedFigures || []).length || Object.keys(tenure).filter(id => !startTier.has(id)).length;
  const byId = new Map([...ROSTER, ...(w?.mintedFigures || [])].filter(f => f?.id).map(f => [f.id, f]));
  const alive = id => (w?.epicStatus?.[id]?.status || "active") !== "dead";
  const livingMythicIds = Object.entries(tenure).filter(([id, t]) => t.tier === "mythic" && alive(id)).map(([id]) => id);
  const livingMythics = livingMythicIds.length;
  const mythicTraditions = new Set(livingMythicIds
    .map(id => byId.get(id)?.tradition || byId.get(id)?.legend?.tradition).filter(Boolean)).size;
  const allTraditions = new Set(ROSTER.map(f => f.tradition || f.legend?.tradition).filter(Boolean)).size;
  const push = w?.arcNetPush || {};
  const arcs = Object.keys(push).sort();
  return {
    dead, minted, net: minted - dead, rises, falls, mythics, strikes, guarded, struckDead, crusades,
    holdPeak, duels, contestPasses, livingMythics, mythicTraditions, allTraditions, challenges, challengeDeaths,
    push, arcs,
    travel: arcs.length ? arcs.reduce((s, a) => s + Math.abs(Number(push[a]) || 0), 0) / arcs.length : 0,
  };
}

async function runConfig(label, patch, worlds = WORLDS) {
  const content = contentWith(patch);
  const out = [];
  for (let i = 0; i < worlds; i++) out.push(await runWorld(content, 20000 + i * 7919));
  return { label, patch, runs: out };
}

// ── summarising ───────────────────────────────────────────────────────────────────────────────────────────
const mean = a => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
const sd = a => { const m = mean(a); return a.length < 2 ? 0 : Math.sqrt(mean(a.map(x => (x - m) ** 2))); };
const col = (runs, k) => runs.map(r => r[k]);
const fmt = (runs, k, d = 1) => {
  const v = col(runs, k);
  return `${mean(v).toFixed(d)}`.padStart(6) + ` ±${sd(v).toFixed(d)}`.padEnd(7);
};

/** ⚠️ THE QUESTION ERIK ACTUALLY ASKED. Not "what is the average world" — do worlds at the SAME settings come
 *  out different from each other? Per arc, the spread of where it landed across worlds, meaned. A number near
 *  zero means the settings determine the ending and the dice are decoration. */
function divergence(runs) {
  const arcs = runs[0]?.arcs || [];
  if (!arcs.length || runs.length < 2) return 0;
  return mean(arcs.map(a => sd(runs.map(r => Number(r.push[a]) || 0))));
}

function headerRow() {
  console.log(`    ${"configuration".padEnd(30)} ${"dead".padStart(6)}        ${"minted".padStart(6)}       ${"rises".padStart(6)}        ${"mythics".padStart(6)}      ${"strikes".padStart(6)}      ${"arc travel".padStart(6)}    divergence`);
}
function row(r) {
  console.log(`    ${r.label.padEnd(30)} ${fmt(r.runs, "dead")} ${fmt(r.runs, "minted")} ${fmt(r.runs, "rises")} ${fmt(r.runs, "mythics")} ${fmt(r.runs, "strikes", 0)} ${fmt(r.runs, "travel")} ${divergence(r.runs).toFixed(1).padStart(8)}`);
}

console.log(`WORLD PRESETS (SNG-305) — ${WORLDS} worlds per configuration, ${DAYS} world-days each\n`);
console.log(`  Every cell is  mean ±sd  ACROSS WORLDS at the same settings. The last column is the one Erik`);
console.log(`  asked for: how far apart the arcs END across worlds run with identical dials. Near zero means`);
console.log(`  the settings decide the ending and the dice are decoration.\n`);

const t0 = Date.now();

// ── A. SENSITIVITY ────────────────────────────────────────────────────────────────────────────────────────
if (MODE === "sensitivity" || MODE === "both") {
  const AXES = [
    ["casualtyRate", [0, 0.15, 0.4]],
    ["directEngagementRate", [0.15, 0.35, 0.7]],
    ["strikeRate", [0, 0.12, 0.35]],
    ["mintRate", [0, 0.5, 1]],
    ["retrievalRate", [0, 0.25, 0.6]],
    ["personalShare", [0, 0.4, 0.7]],
    ["holding", [{ perPass: 0 }, { perPass: 0.1 }, { perPass: 0.1, deedRepeats: true }]],
  ];
  console.log(`  A. SENSITIVITY — one dial at a time, everything else at the authored value.\n`);
  headerRow();
  const baseline = await runConfig("(authored baseline)", {});
  row(baseline);
  console.log("");
  for (const [dial, values] of AXES) {
    for (const v of values) {
      const label = typeof v === "object"
        ? `${dial} ${Object.entries(v).map(([k, x]) => `${k}=${x}`).join(",")}`
        : `${dial} = ${v}`;
      // ⚠️ DO NOT TRUNCATE A LABEL THAT CONTAINS THE VALUE. `label.slice(0, 26)` turned
      //    "directEngagementRate = 0.15" into "… = 0.1" — a report stating a configuration it did not run.
      row(await runConfig(label, { [dial]: v }));
    }
    console.log("");
  }
}

// ── B. PRESETS ────────────────────────────────────────────────────────────────────────────────────────────
if (MODE === "presets" || MODE === "both") {
  // ⛔ THESE ARE CHARACTERS, NOT RECOMMENDATIONS. Each is a coherent guess at a KIND of valley; the point is
  // to show that the dials compose into recognisably different worlds, not to nominate a winner.
  const PRESETS = [
    ["as authored", {}],
    ["a quiet valley", { casualtyRate: 0.05, directEngagementRate: 0.2, strikeRate: 0.04, personalShare: 0.6 }],
    ["a bloody valley", { casualtyRate: 0.35, directEngagementRate: 0.6, strikeRate: 0.3, retrievalRate: 0.15 }],
    ["a valley of legends", { casualtyRate: 0.15, directEngagementRate: 0.5, holding: { deedRepeats: true }, retrievalRate: 0.5 }],
    ["a stubborn valley", { holding: { perPass: 0.2, cap: 1 }, directEngagementRate: 0.25, casualtyRate: 0.1 }],
    ["a churning valley", { mintRate: 1, casualtyRate: 0.3, retrievalRate: 0.05, vacancyStreakForMint: 4 }],
  ];
  console.log(`  B. PRESETS — whole configurations, as populations.\n`);
  headerRow();
  const results = [];
  for (const [label, patch] of PRESETS) { const r = await runConfig(label, patch); results.push(r); row(r); }

  console.log(`\n  WHAT EACH ONE IS, in the terms the dials are actually in:\n`);
  for (const r of results) {
    const runs = r.runs;
    const lost = mean(col(runs, "dead")), made = mean(col(runs, "minted"));
    const contested = mean(col(runs, "duels"));
    console.log(`    ${r.label}`);
    console.log(`      population ${made > lost ? "grows" : made < lost ? "shrinks" : "holds"} (${(made - lost).toFixed(1)} net) · ${contested.toFixed(0)} duels · ${mean(col(runs, "strikes")).toFixed(0)} strikes · ${mean(col(runs, "struckDead")).toFixed(1)} killed from behind`);
    console.log(`      ladder: ${mean(col(runs, "rises")).toFixed(1)} rises, ${mean(col(runs, "falls")).toFixed(1)} falls, ${mean(col(runs, "mythics")).toFixed(1)} reach mythic · longest hold ${mean(col(runs, "holdPeak")).toFixed(0)} passes`);
    console.log(`      worlds diverge by ${divergence(runs).toFixed(1)} on the average arc (arcs travel ${mean(col(runs, "travel")).toFixed(1)})\n`);
  }
}

// ── C. THE TARGET ───────────────────────────────────────────────────────────────────────
if (MODE === "target" || MODE === "both") {
  // Erik: "we should set a target population and tune toward it. maybe 1/4 the traditions should have a
  // mythical in play at any given time." ⚠️ THE ROSTER HAS 27 TRADITIONS, NOT 24 — the 24 poles of the ring
  // plus the folk crossings. Counting the target off the ring rather than off the actual roster would have
  // put it at 6.0 instead of 6.8, which is inside the noise here but is the sort of assumed constant that
  // stops being true the moment anyone authors a figure.
  const ALLT = new Set(ROSTER.map(f => f.tradition || f.legend?.tradition).filter(Boolean)).size;
  const BASE_TIERS = BASE.challenges?.challengeByTier || {};
  const scaled = (k) => {
    const out = {};
    for (const [t, v] of Object.entries(BASE_TIERS)) out[t] = Number((Number(v) * k).toFixed(4));
    return { challenges: { challengeByTier: out } };
  };
  console.log(`
  C. TUNING TO THE TARGET — "1/4 the traditions should have a mythic in play"
`);
  console.log(`    ${"challenge rate".padEnd(30)} ${"living mythics".padStart(14)}   ${"traditions with one".padStart(19)}   ${"challenges".padStart(10)} ${"died".padStart(7)} ${"dead".padStart(8)}`);
  for (const k of [0, 0.5, 1, 2, 4, 8]) {
    const r = await runConfig(`${k}× authored`, k === 1 ? {} : scaled(k));
    const lm = mean(col(r.runs, "livingMythics")), mt = mean(col(r.runs, "mythicTraditions"));
    const all = r.runs[0]?.allTraditions || 24;
    const hit = Math.abs(mt - all / 4) <= 1 ? "  ← on target" : "";
    console.log(`    ${r.label.padEnd(30)} ${lm.toFixed(1).padStart(8)} ±${sd(col(r.runs, "livingMythics")).toFixed(1).padEnd(4)} ${mt.toFixed(1).padStart(12)}/${all}${" ".padEnd(4)} ${mean(col(r.runs, "challenges")).toFixed(1).padStart(9)} ${mean(col(r.runs, "challengeDeaths")).toFixed(1).padStart(7)} ${mean(col(r.runs, "dead")).toFixed(1).padStart(8)}${hit}`);
  }
  console.log(`
    target is ${(ALLT / 4).toFixed(1)} of ${ALLT} traditions holding a living mythic (Erik's "1/4").`);
}

console.log(`  (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
console.log(`\n  ⛔ A REPORT — writes nothing, gates nothing, names no setting correct. Quote it WITH the date.`);
