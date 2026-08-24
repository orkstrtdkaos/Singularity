#!/usr/bin/env node
// ⛔ CCODE-238 — IS EACH EFFECT ACTUALLY WIRED? MEASURED BY BEHAVIOUR, NEVER BY GREP.
//
// `mechanic_effects.json` keeps 22 engine effects with a `wired: true|false` flag each. ⚠️ THE FLAGS ARE
// DEMONSTRABLY WRONG IN AT LEAST ONE DIRECTION: `HEAL` is marked `wired: false`, and CCODE-237 showed it
// rolls its authored dice and moves the sheet. Nobody knows which of the other 21 are stale.
//
// ⛔ AND A GREP CANNOT ANSWER THIS. `foothills` was the lesson three days ago: the rule was live, the
// caller passed null, every gate stayed green, and every grep for "foothill" found plenty. A symbol
// existing in engine/ proves nothing about whether play reaches it.
//
// ⚠️ SO THE ONLY EVIDENCE THIS FILE ACCEPTS IS AN OBSERVED CHANGE IN OUTPUT. For each effect: run the
// engine twice — once with the field the effect `reads`, once without — and see whether the result moves.
// A difference proves the whole chain (field → reader → caller). No difference proves nothing is reading
// it. Anything this harness cannot construct honestly reports UNPROBED, which is not the same as unwired
// and is never counted as either.

globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); } };
const { loadContentHeadless } = await import("../tests/headless_content.mjs");
const C = await loadContentHeadless();
const SB = await import("../engine/skill_battle.js");
const CM = await import("../engine/craftmechanics.js");
const { readFileSync } = await import("node:fs");

const DOC = JSON.parse(readFileSync("content/packs/core/rules/mechanic_effects.json", "utf8"));
const EFFECTS = DOC.effects || {};

const sheet = (name, extra = {}) => ({
  name, level: 5, health: 20, maxHealth: 20, energy: 40, maxEnergy: 40,
  attributes: { physical: 5, mental: 4, social: 3, practical: 3 },
  subAttributes: {}, alignment: {}, skills: [], abilities: [], tacticTags: [], ...extra,
});
const baseState = (extra = {}) => ({
  momentum: 0, round: 1, playerEnergy: 40, opponentEnergy: 40, opponentHealth: 20,
  effects: [], pressure: { player: 0, opponent: 0 }, ...extra,
});

/** One round, with whatever declaration and sheets the probe wants. Deterministic rng. */
function round({ playerDecl, oppDecl = null, player = null, opp = null, state = null, phase = undefined }) {
  return SB.battleRound({
    playerDecl,
    oppDecl: oppDecl || { name: "Swing", function: "strike", intensity: "standard", tier: 1 },
    playerSheet: player || sheet("you"), oppSheet: opp || sheet("them"),
    state: state || baseState(), phase,
    // ⛔ `.engine`, NOT the whole document. The real caller passes `CONTENT.skillBattle.engine` and every
    // probe here passed one level too high — so `sb.persistentEffects` and `sb.senseStep` read undefined
    // and the engine fell back to defaults. Verdicts that showed a DIFFERENCE were still real (a difference
    // proves something was read); a verdict of INERT taken under a mis-shaped config was worthless, and I
    // had already published one.
    rules: C.rules, sb: C.skillBattle?.engine || C.skillBattle, rng: () => 0.5, kind: "fight",
  });
}

const craftWith = (pred) => Object.values(C.abilities).find(pred) || null;
const declFor = (ab, fn) => ({ ...ab, name: ab.name, function: fn, intensity: "standard", tier: ab.levelReq || 1, rank: 1 });

/** ⚠️ A PROBE RETURNS EVIDENCE, NOT A VERDICT. `with` and `without` are two engine outputs; the harness
 *  decides. A probe that cannot build its case says so and is not counted. */
const PROBES = {
  DAMAGE: () => {
    const ab = craftWith(a => a.mechanic?.dice && (a.functions || []).includes("strike"));
    if (!ab) return { unprobed: "no strike craft with authored dice" };
    const hi = round({ playerDecl: { ...declFor(ab, "strike"), mechanic: { ...ab.mechanic, dice: { n: 8, d: 6 } } } });
    const lo = round({ playerDecl: { ...declFor(ab, "strike"), mechanic: { ...ab.mechanic, dice: { n: 1, d: 2 } } } });
    return { with: hi.damage?.amount ?? null, without: lo.damage?.amount ?? null, probe: `${ab.id}: 8d6 vs 1d2` };
  },
  HEAL: () => {
    const ab = craftWith(a => a.mechanic?.dice && (a.functions || []).some(f => ["heal", "mend", "restore"].includes(f)));
    if (!ab) return { unprobed: "no healing craft with authored dice" };
    const fn = (ab.functions || []).find(f => ["heal", "mend", "restore"].includes(f));
    const hi = round({ playerDecl: { ...declFor(ab, fn), mechanic: { ...ab.mechanic, dice: { n: 8, d: 6 } } } });
    const lo = round({ playerDecl: { ...declFor(ab, fn), mechanic: { ...ab.mechanic, dice: { n: 1, d: 2 } } } });
    return { with: hi.healing?.amount ?? null, without: lo.healing?.amount ?? null, probe: `${ab.id}: 8d6 vs 1d2` };
  },
  // ⚠️ THESE TWO NEEDED A REAL DAMAGING DECLARATION. My first version used a bare `function: "strike"`
  // with no mechanic, which lands NO damage at all — so both sides came back `null` and the harness read
  // "no difference" as INERT. That is a probe failing and being reported as a finding, which is the exact
  // error this file exists to avoid. A probe whose BASELINE is null proves nothing about the variable.
  SOAK: () => {
    const ab = craftWith(a => a.mechanic?.dice && (a.functions || []).includes("strike"));
    if (!ab) return { unprobed: "no strike craft with authored dice" };
    const d = { ...declFor(ab, "strike"), mechanic: { ...ab.mechanic, dice: { n: 6, d: 6 } } };
    const hit = (soak) => round({ playerDecl: d, opp: sheet("them", { soak }) }).damage?.amount ?? null;
    const a0 = hit(0), a6 = hit(8);
    if (a0 == null) return { unprobed: "baseline strike landed no damage — probe cannot isolate soak" };
    return { with: a0, without: a6, probe: `${ab.id} 6d6 into soak 0 vs 8` };
  },
  ANTISOAK: () => {
    const ab = craftWith(a => a.mechanic?.dice && (a.functions || []).includes("strike"));
    if (!ab) return { unprobed: "no strike craft with authored dice" };
    const d = { ...declFor(ab, "strike"), mechanic: { ...ab.mechanic, dice: { n: 6, d: 6 } } };
    // ⚠️ THIS PROBE WAS WRONG TWICE AND BOTH ARE INSTRUCTIVE. First a bare decl landed no damage at all;
    // then it put antisoak in `conditions`, which the round genuinely did not read — and the harness was
    // about to report the MECHANIC as inert when the mechanic was fine and the BRIDGE was missing.
    // CCODE-238 built that bridge. The probe now tests the condition path, because that is the one a craft
    // actually produces.
    const hit = (conds) => round({ playerDecl: d, opp: sheet("them", { soak: 4, conditions: conds }) }).damage?.amount ?? null;
    const open = hit([{ id: "opened", kind: "antisoak", magnitude: 5 }]), shut = hit([]);
    if (shut == null) return { unprobed: "baseline strike landed no damage — probe cannot isolate antisoak" };
    return { with: open, without: shut, probe: `${ab.id} into antisoak 5 vs none` };
  },
  // ⛔ THE SENSE CLUSTER — and it took FOUR probe attempts to test it honestly. In order, my failures:
  // no craft behind the verb · testing `sense`/`obscure`, which NO craft in the game carries (the real
  // verbs are `reveal` and `conceal`/`deceive`) · reading one field instead of the surface · and finally
  // handing the opponent an EMPTY KIT, when `senseResistOf` reads their kit for a conceal craft.
  // ⚠️ EVERY ONE OF THOSE WOULD HAVE PRINTED "INERT" ABOUT A MECHANISM THAT WORKS.
  SENSE_SLOT: () => {
    const rev = craftWith(a => (a.functions || []).includes("reveal"));
    if (!rev) return { unprobed: "no craft carries `reveal`" };
    const look = (oppSkills) => round({ playerDecl: declFor(rev, "reveal"),
      opp: sheet("them", { skills: oppSkills }), phase: "sense" });   // ⚠️ the phase, omitted the first time
    const bare = look([]), hid = look([{ name: "a hiding craft", function: "conceal", tier: 5 }]);
    return { with: JSON.stringify({ resist: hid.senseResist?.value, from: hid.senseResist?.from, setup: hid.setupBonus }),
      without: JSON.stringify({ resist: bare.senseResist?.value, from: bare.senseResist?.from, setup: bare.setupBonus }),
      probe: "a reader against a kit WITH a conceal craft vs without" };
  },
  CONCEAL: () => {
    const rev = craftWith(a => (a.functions || []).includes("reveal"));
    const con = craftWith(a => (a.functions || []).includes("conceal"));
    if (!rev || !con) return { unprobed: "need a reveal craft and a conceal craft" };
    const idle = { name: "Wait", function: "strike", intensity: "standard", tier: 1 };
    const a = round({ playerDecl: declFor(rev, "reveal"), oppDecl: idle, phase: "sense" });
    const b = round({ playerDecl: declFor(rev, "reveal"), oppDecl: declFor(con, "conceal"), phase: "sense" });
    return { with: JSON.stringify(b.senseTier), without: JSON.stringify(a.senseTier),
      probe: `${con.id} DECLARED against a reader (tier drops)` };
  },
  REVEAL: () => {
    const rev = craftWith(a => (a.functions || []).includes("reveal"));
    if (!rev) return { unprobed: "no craft carries `reveal`" };
    const r = round({ playerDecl: declFor(rev, "reveal"), phase: "sense" });
    return { with: JSON.stringify({ tier: r.senseTier, setup: r.setupBonus }), without: "null",
      probe: `${rev.id} declared as a read` };
  },
  // ⛔ THESE TWO ARE MINE, AND ONE OF THEM IS THE ANSWER NOBODY WANTS. `conditions.js` and `projects.js`
  // were both shipped green with every export reachable only from a test; conditions got wired, projects
  // did not. The probe reports what is true rather than what I would like.
  PERSIST_UNTIL_HEALED: async () => {
    const CD = await import("../engine/conditions.js");
    const ch = { conditions: [{ id: "gash", name: "Gash", persistUntilHealed: true }, { id: "winded", name: "Winded" }] };
    const r = CD.clearOnRest(ch, { kind: "sleep" });
    return { with: JSON.stringify({ persisted: r.persisted.map(c => c.id), cleared: r.cleared.map(c => c.id) }),
      without: '{"persisted":[],"cleared":["gash","winded"]}',
      probe: "a night's rest against a persist-until-healed wound" };
  },
  PROJECT_TICKS: async () => {
    const PR = await import("../engine/projects.js");
    const app = readFileSync("app.js", "utf8");
    // ⚠️ THE RULE WORKS AND NOTHING CALLS IT — so the honest answer is INERT, not WIRED. Testing
    // `advanceProject` directly would prove the function and say nothing about the game, which is the
    // `foothills` error exactly. The caller is the claim.
    if (!/engine\/projects\.js/.test(app)) {
      return { with: null, without: null,
        probe: "projects.js is imported by NOTHING in app.js — the rule runs, the game never calls it" };
    }
    const pc = Object.values(C.abilities).find(a => PR.isProjectCraft(a));
    if (!pc) return { unprobed: "no craft in the corpus is a project craft" };
    const p0 = PR.openProject({ projects: [], name: "t" }, pc, { day: 0 }).project;
    const before = PR.projectProgress(p0).fraction;
    PR.tickProject(p0, { days: 3, hands: 1 });
    return { with: PR.projectProgress(p0).fraction, without: before, probe: "3 days of work on a threshold-10 project" };
  },
  // ⛔ A THIRD CATEGORY, AND IT IS NOT A DODGE. Seven effects declare `reads: "—"` — no content field at
  // all. There is nothing for the engine to consume and nothing for an author to write, so "inert" is the
  // wrong word: inert means built and unreached. These were never built. Naming that separately is the
  // difference between a worklist and a shrug.
  TEMP_SOAK: () => {
    const ab = craftWith(a => a.mechanic?.soak != null && (a.functions || []).length);
    if (!ab) return { unprobed: "no craft authors mechanic.soak" };
    const hi = round({ playerDecl: { ...declFor(ab, (ab.functions || [])[0]), mechanic: { ...ab.mechanic, soak: 20 } } });
    const lo = round({ playerDecl: { ...declFor(ab, (ab.functions || [])[0]), mechanic: { ...ab.mechanic, soak: 0 } } });
    return { with: JSON.stringify((hi.effects || []).filter(e => /soak|guard|ward/i.test(JSON.stringify(e)))),
      without: JSON.stringify((lo.effects || []).filter(e => /soak|guard|ward/i.test(JSON.stringify(e)))),
      probe: `${ab.id} declaring soak 20 vs 0 (30 crafts author it)` };
  },
  UNCONSCIOUS: async () => {
    const EN = await import("../engine/encounters.js");
    const alive = EN.checkIncapacitation({ health: 12, maxHealth: 20, energy: 20 });
    const down = EN.checkIncapacitation({ health: 0, maxHealth: 20, energy: 0 });
    return { with: JSON.stringify(down), without: JSON.stringify(alive), probe: "a sheet at 0 health vs 12" };
  },
  // ⚠️ TEMPO'S SOURCE FILE DOES NOT LOAD. `tempo.json` is one of the thirteen registered-but-unread rules,
  // so there is no bank to read and no probe can be honest about the mechanism until it loads. That is a
  // different problem from an unbuilt effect and it is named as its own thing.
  TEMPO: () => ({ unprobed: "reads a tempo bank from tempo.json, which is registered and never loaded" }),
  DENY_READ: () => {
    // ⛔ THE FIELD IS ON THE ABILITY, and 16 crafts carry it — `ability.obscure`, never a rank (checked).
    const ab = craftWith(a => a.obscure != null);
    if (!ab) return { unprobed: "no craft authors `obscure`" };
    const rev = craftWith(a => (a.functions || []).includes("reveal"));
    if (!rev) return { unprobed: "no reader craft to deny" };
    const a = round({ playerDecl: declFor(rev, "reveal"), oppDecl: { name: "Wait", function: "strike", intensity: "standard", tier: 1 }, phase: "sense" });
    const b = round({ playerDecl: declFor(rev, "reveal"), oppDecl: declFor(ab, (ab.functions || [])[0]), phase: "sense" });
    return { with: JSON.stringify({ tier: b.senseTier, gap: b.senseGap }), without: JSON.stringify({ tier: a.senseTier, gap: a.senseGap }),
      probe: `${ab.id} (authors \`obscure\`) declared against a reader` };
  },
  ACTION_LOSS: () => {
    const ab = craftWith(a => (a.tree || []).some(r => /action_loss/.test(JSON.stringify(r?.imposes || ""))));
    if (!ab) return { unprobed: "no craft imposes action_loss" };
    const r = round({ playerDecl: declFor(ab, (ab.functions || [])[0]) });
    return { with: JSON.stringify(r.imposed ?? null), without: "null", probe: `${ab.id} imposes action_loss` };
  },
  VULNERABLE: () => {
    const ab = craftWith(a => (a.tree || []).some(r => r?.antisoakImposed != null));
    if (!ab) return { unprobed: "no craft authors antisoakImposed" };
    const r = round({ playerDecl: declFor(ab, (ab.functions || [])[0]) });
    return { with: JSON.stringify(r.opened ?? null), without: "null", probe: `${ab.id} authors antisoakImposed` };
  },
  // ⚠️ UNPROBED RATHER THAN INERT. `bonusEarned` came back null on a plain round, which tells me my
  // setup never earned a bonus — not that the tempo slot is dead. Distinguishing those needs a contested
  // sense step with a known winner, and I would rather say "I did not test this" than guess.
  TEMPO: () => ({ unprobed: "needs a contested sense step with a known winner — not yet constructed" }),
};

// ── run ──────────────────────────────────────────────────────────────────────
const rows = [];
for (const [name, def] of Object.entries(EFFECTS)) {
  const claimed = def?.wired === true;
  const probe = PROBES[name];
  // ⛔ THE FILE'S OWN `reads: "—"` IS THE ANSWER. No content field means nothing to consume and nothing to
  // author — UNBUILT, which is a worklist item, not the same as inert (built and unreached).
  if (!probe && String(def?.reads || "").trim() === "—") {
    rows.push({ name, claimed, verdict: "UNBUILT", detail: "declares no source field — nothing to read" });
    continue;
  }
  if (!probe) { rows.push({ name, claimed, verdict: "UNPROBED", detail: "no probe written" }); continue; }
  let ev;
  try { ev = await probe(); } catch (e) { ev = { unprobed: `probe threw: ${e.message.slice(0, 60)}` }; }
  if (ev.unprobed) { rows.push({ name, claimed, verdict: "UNPROBED", detail: ev.unprobed }); continue; }
  const moved = JSON.stringify(ev.with) !== JSON.stringify(ev.without)
    && ev.with !== null && ev.with !== "null";
  rows.push({ name, claimed, verdict: moved ? "WIRED" : "INERT",
    detail: `${ev.probe} → ${JSON.stringify(ev.with)} vs ${JSON.stringify(ev.without)}` });
}

const pad = (s, n) => String(s).padEnd(n);
console.log("\n⛔ EFFECT WIRING AUDIT — measured by behaviour, never by grep\n");
console.log(pad("EFFECT", 20) + pad("FILE SAYS", 12) + pad("MEASURED", 11) + "EVIDENCE");
console.log("-".repeat(110));
let stale = 0;
for (const r of rows) {
  const says = r.claimed ? "wired" : "not wired";
  const disagree = (r.verdict === "WIRED" || r.verdict === "INERT") && (r.verdict === "WIRED") !== r.claimed;
  if (disagree) stale++;
  console.log(pad(r.name, 20) + pad(says, 12) + pad(r.verdict + (disagree ? " ✗" : ""), 11) + String(r.detail).slice(0, 62));
}
const probed = rows.filter(r => r.verdict === "WIRED" || r.verdict === "INERT");
const unbuilt = rows.filter(r => r.verdict === "UNBUILT");
console.log("-".repeat(110));
console.log(`${rows.length} effects · ${probed.length} probed · ${unbuilt.length} unbuilt · ${rows.length - probed.length - unbuilt.length} unprobed`);
console.log(`${probed.filter(r => r.verdict === "WIRED").length} wired · ${probed.filter(r => r.verdict === "INERT").length} inert`);
console.log(`⛔ ${stale} of the file's \`wired\` flags DISAGREE with what the engine actually does.`);
console.log("\n⚠️ UNPROBED is not a verdict. It means this harness could not construct an honest test,");
console.log("   and those effects are counted as neither wired nor inert.\n");
