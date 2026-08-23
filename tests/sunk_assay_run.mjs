// tests/sunk_assay_run.mjs — SNG-522 · PLAY THE ROOMS. Aevi: "the Sunk Assay has never been run.
// Everything in it is individually gated — and his own finding is that individually gated isn't the same
// as met. If there's a cheap way to play one round of the Warden fight and print the receipt, I'd rather
// have that than another gate."
//
// ⛔ SO THIS IS A REPORT, NOT A GATE. It plays real rounds with real crafts from the loaded catalogue and
// prints what actually came out. Nothing in here asserts; the point is to SEE the interaction, because a
// gate can only fail the thing it was written to imagine.
//
// ⚠️ AND IT USES AUTHORED CONTENT BY ID WHEREVER IT CAN. A harness built on synthetic fixtures would prove
// the arithmetic and miss exactly what this exists to find: whether the authored data reaches it.
//
// Run:  node tests/sunk_assay_run.mjs

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); } };
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { loadContentHeadless } = await import("./headless_content.mjs");
const SB = await import("../engine/skill_battle.js");
const CM = await import("../engine/craftmechanics.js");
const EN = await import("../engine/encounters.js");

const C = await loadContentHeadless();
const rules = C.rules || {};
const sb = rules.skillBattle || C.skillBattle || {};
const steps = C.resolutionSteps || rules.resolution || {};
const cm = C.craftMechanics || {};
const A = C.abilities || {};

const findings = [];
const note = (level, what) => { findings.push(`${level}: ${what}`); console.log(`      ⛔ ${what}`); };
const rule = (t) => console.log(`\n${"─".repeat(78)}\n${t}\n${"─".repeat(78)}`);
const craft = (id, over = {}) => {
  const a = A[id];
  if (!a) { note("setup", `craft \`${id}\` is not in the catalogue — the room cannot be built from it`); return null; }
  // ⛔ AN ABILITY IS NOT A DECLARATION. A catalogue record has `functions` (plural, and often several);
  // a declaration has ONE `function`, and every branch in skill_battle keys off it. Spreading the record
  // and forgetting to pick left the Warden with `function: undefined`, which reads as harmless, unreadable
  // AND - since CCODE-213 - as having done NOTHING at all. Whoever authors the Warden for real will hit
  // this exact seam, so it is named here rather than quietly handled.
  const fn = over.function || (a.functions || [])[0];
  if (!fn) note("setup", `craft \`${id}\` declares no function - nothing in a round can key off it`);
  return { ...a, function: fn, name: a.name || id, tier: a.levelReq || 1, attribute: a.attribute || "practical",
           intensity: "standard", rank: 1, ...over };
};

// ─────────────────────────────────────────────────────────────────────────────
rule("LEVEL 2 · THE FLOODED ASSAY — a heal against the grey damp");

// the crafts Aevi authored ongoingHarm onto, and the healer that is meant to answer them
const greyId = "hastened_grey", healId = "physicians_tome";
const grey = A[greyId], tome = A[healId];
console.log(`  the harm : ${grey ? grey.name : "(missing)"} — ongoingHarm authored on ${grey ? (grey.tree || []).filter(r => r.ongoingHarm || r.mechanic?.ongoingHarm).length : 0} rank(s)`);
console.log(`  the heal : ${tome ? tome.name : "(missing)"} — ${JSON.stringify(tome?.mechanic?.dice ?? null)}`);

// ⚠️ WHERE IS THE AUTHORED HARM, AND CAN THE HEALER SEE IT? This is the join the whole level rests on.
const greyRank = (grey?.tree || []).find(r => r.ongoingHarm || r.mechanic?.ongoingHarm);
const authored = greyRank?.ongoingHarm || greyRank?.mechanic?.ongoingHarm || null;
console.log(`  authored shape at ${greyId} r${greyRank?.rank}: ${JSON.stringify(authored)}`);

// play it: a subject carrying the harm the craft says it inflicts
// ⚠️ ASK THE ENGINE, NOT THE JSON. The first run of this harness read the authored block directly and
// reported "no magnitude" - true of the JSON and false of the game, because the amount is DERIVED from the
// craft's own magnitude or dice. A harness that reads content the way the engine does not is a harness that
// reports its own parsing.
const derived = CM.ongoingHarmOf(grey, greyRank?.rank || 1);
const subjectHarm = derived && derived.magnitude > 0 ? [derived] : [];
console.log(`  the engine derives     : ${JSON.stringify(derived)}`);
if (!subjectHarm.length || !subjectHarm[0].magnitude) {
  note("L2", `\`${greyId}\`'s ongoingHarm carries no magnitude the healer can subtract — authored shape is ${JSON.stringify(authored)}`);
}
const rng = () => 0.5;
const clean = CM.resolveHeal(tome, { cfg: cm, rng, rank: 2 });
const soaked = CM.resolveHeal(tome, { cfg: cm, rng, rank: 2, ongoingHarm: subjectHarm });
const staunch = CM.resolveHeal(tome, { cfg: cm, rng, rank: 2, ongoingHarm: subjectHarm, staunch: true });
console.log(`\n  RECEIPT — mending someone who is not bleeding`);
console.log(`    rolled ${clean.rolled} · healed ${clean.healed}`);
console.log(`  RECEIPT — mending someone the grey has hold of`);
console.log(`    rolled ${soaked.rolled} · the wound keeps opening (-${soaked.soaked}) · healed ${soaked.healed}`);
console.log(`  RECEIPT — stopping the grey first, then mending`);
console.log(`    rolled ${staunch.rolled} · spent ${staunch.staunched} ending ${staunch.ended.join(", ") || "nothing"} · healed ${staunch.healed}`);
if (soaked.soaked === 0 && subjectHarm.length) note("L2", "the authored harm did not reduce the heal — the join from craft to subject does not exist");
if (soaked.healed === clean.healed) note("L2", "healing a bleeding subject came out identical to healing a clean one — the level's whole lesson is inert");

// ⛔ AND THE JOIN ITSELF: does anything put an imposer's ongoingHarm ONTO a target?
const sbSrc = readFileSync(join(root, "engine/skill_battle.js"), "utf8");
if (!/ongoingHarm/.test(sbSrc)) {
  note("L2", "`ongoingHarm` appears nowhere in skill_battle.js — a craft that inflicts it cannot put it on anyone. The healer reads a condition nothing applies.");
}

// ─────────────────────────────────────────────────────────────────────────────
rule("LEVEL 3 · THE WARDEN — it reads you, it imposes, and it does not want you dead");

const wardenSkill = craft("keystone_blow", { rank: 2 }) || craft("plain_weight", { rank: 2 });
const wardenRead = { function: "reveal", tier: 3, attribute: "mental", intensity: "standard", name: "it measures you" };
const warden = {
  name: "The Warden", threat: 60, level: 10,
  attributes: { practical: 7, physical: 7, mental: 6, social: 3 },
  energy: 120, health: 90, maxHealth: 90,
  skills: [wardenSkill, wardenRead].filter(Boolean),
  // ⚠️ typed layers, which is the one path that works today (craft wardTypes are not read — §39.5)
  soakLayers: [{ rank: 1, value: 5, type: "physical" }, { rank: 2, value: 4, type: "precursor" }],
  antisoak: 0
};
const pc = { name: "the party's edge", level: 7, health: 44, maxHealth: 44,
  attributes: { physical: 6, practical: 5, mental: 4, social: 4 }, soak: 2 };

const strike = craft("ki_wield", { rank: 2 }) || { function: "strike", tier: 4, attribute: "physical", intensity: "standard", name: "a hard blow" };
const st = { momentum: 0, round: 1, playerEnergy: 100, opponentEnergy: 120, effects: [], pressure: { player: 0, opponent: 0 } };

// the SENSE step first — the Warden reads, which is the thing nothing else in the game does
const senseRound = SB.battleRound({ playerDecl: { function: "shield", tier: 2, attribute: "physical", intensity: "conserve", name: "brace" },
  oppDecl: wardenRead, playerSheet: pc, oppSheet: warden, state: st, rules, sb, steps, rng, phase: "sense" });
console.log(`  RECEIPT — the sense step`);
console.log(`    it measures you · your sense tier ${senseRound.senseTier} · bonus ${JSON.stringify(senseRound.bonusEarned)}`);
console.log(`    senseBonus: ${JSON.stringify(senseRound.senseBonus ?? null)}`);

// the ACTION step — a blow into layered typed soak, and whatever the Warden imposes
const hit = SB.battleRound({ playerDecl: strike, oppDecl: wardenSkill || { function: "strike", tier: 3, attribute: "practical", intensity: "standard", name: "it presses" },
  playerSheet: pc, oppSheet: warden, state: { ...st, round: 2 }, rules, sb, steps, rng });
console.log(`\n  RECEIPT — the exchange`);
console.log(`    winner: ${hit.roundWinner}`);
console.log(`    damage: ${JSON.stringify(hit.damage ?? null)}`);
console.log(`    imposed: ${JSON.stringify(hit.imposed ?? null)}`);
// ⚠️ TWO FINDINGS, NOT ONE. This was `!damage && !imposed`, so the moment the damage started landing
// the report went quiet about the imposition that still was not - a compound condition hiding half of what
// it was watching. The same shape as a gate that passes for the wrong reason, in a harness.
if (!hit.damage) note("L3", "the exchange produced no damage — the Warden cannot press");
if (!hit.imposed) note("L3", "the Warden landed a blow and imposed NOTHING — it is a damage-dealer, not a thing that finishes an assay");
if (hit.damage && !hit.damage.soak) note("L3", "the Warden's authored soak layers did not reduce the blow — typed layers are not reaching the walk");

// ⛔ THE CUT THREAD. A construct has no thread — and the engine should refuse it structurally.
const shears = { ...(craft("last_gift") || {}), mechanic: { imposes: { condition: "slain" } }, name: "A Cut Thread, Kept" };
const cut = CM.resolveImposition(shears, { cfg: cm, margin: 999 });
console.log(`\n  RECEIPT — the shears, used on a construct`);
console.log(`    ${cut.ok ? "⛔ IT WORKED — a craft killed something" : "refused: " + cut.why}`);
if (cut.ok) note("L3", "a craft imposed death — the §40 boundary is not holding");

// and incapacitation: the Warden is trying to FINISH THE ASSAY, not to kill
console.log(`    an imposed unconscious reads as: ${EN.checkIncapacitation({ health: 30, condition: "unconscious" })}`);
console.log(`    a 'slain' condition reads as:    ${EN.checkIncapacitation({ health: 30, condition: "slain" })} (never a shortcut past the table)`);

// ─────────────────────────────────────────────────────────────────────────────
rule("LEVEL 4 · THE ASSAY ITSELF — open a project, bank ticks, come back");
const PJ = await import("../engine/projects.js");
const pcfg = cm.projects || {};
const assayCraft = A.built_system || A.sound_read;
if (!assayCraft) note("L4", "no project craft in the catalogue - nothing to open the assay with");
else {
  const open = PJ.openProject({ name: "the party" }, assayCraft, { day: 40, name: "The Assay Itself", cfg: pcfg });
  if (!open.ok) note("L4", "the assay could not be opened: " + open.why);
  else {
    const pr = open.project;
    console.log("  RECEIPT - opening the assay");
    console.log("    " + pr.name + " \u00b7 " + pr.threshold + " days of work \u00b7 banked " + pr.banked);
    PJ.tickProject(pr, { days: 3, hands: 4, cfg: pcfg });
    console.log("  RECEIPT - three days, four hands, then they leave");
    console.log("    " + JSON.stringify(PJ.projectProgress(pr)));
    PJ.interruptProject(pr, "the water rose and they went out");
    const wasted = PJ.tickProject(pr, { days: 30, cfg: pcfg });
    console.log("  RECEIPT - thirty days away");
    console.log("    " + wasted.why + " \u00b7 still banked " + pr.banked);
    PJ.resumeProject(pr);
    PJ.sabotageProject(pr, 2, "the Grave-Callers");
    PJ.inheritProject(pr, "Teva");
    const fin = PJ.tickProject(pr, { days: 20, hands: 2, cfg: pcfg });
    console.log("  RECEIPT - they come back, find it set back, and hand it on");
    console.log("    " + JSON.stringify(PJ.projectProgress(pr)));
    if (!fin.done) note("L4", "the assay never finished - the threshold cannot be reached");
    // the thing the level is FOR: it could not have been done in the scene it was opened in
    const impatient = PJ.openProject({ name: "impatient" }, assayCraft, { day: 0, cfg: pcfg }).project;
    const oneDay = PJ.tickProject(impatient, { days: 1, hands: 8, cfg: pcfg });
    if (oneDay.done) note("L4", "a project finished in ONE DAY with eight hands - it resolves in a scene, which is the feature's opposite");
    else console.log("  \u2705 one day, eight hands: banked " + impatient.banked + "/" + impatient.threshold + " - they have to come back");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
rule("WHAT THE ROOMS SAID");
if (!findings.length) console.log("  every room played. Nothing to report — which would be the first time.");
else findings.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
console.log(`\n${findings.length} finding(s). This is a REPORT — it asserts nothing and fails nothing.\n`);
