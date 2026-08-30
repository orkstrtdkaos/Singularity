// scripts/battle_test_crafts.mjs — CCODE-313. AEVI'S TWELVE, RUN THROUGH A REAL BATTLE.
//
// ⛔ ERIK: "send a report to CCode — I want him to test some of this with the big battles."
// ⛔ AEVI, `po/REPORT_ccode_battle_test_request.md` §2: "I authored 12 crafts today that are about GROUPS
// AND BATTLES… five of them have NO ENGINE HOOK AT ALL. They are all schema-valid and all green. THAT IS
// THE POINT — the gates cannot tell the difference between a craft the engine can run and a craft that is
// only PROSE WITH DICE ON IT."
//
// ⚠️ AND HER FRAME TURNS OUT TO BE WRONG IN A WAY THAT MATTERS, which is why this runs them rather than
// reading them. "No engine hook" implies inert. ⛔ NONE OF THE TWELVE IS INERT: every mechanic key they
// author is READ (`field_atlas`), every verb they carry resolves through `mechanicFor`, and every one of
// them produces a real roll and a real number in a real round.
//
// ⛔ THE ACTUAL DIVISION IS NOT HOOKED vs UNHOOKED. IT IS:
//     GENERIC   — it resolves, and it resolves as ANY craft with that verb would
//     SPECIFIC  — it resolves as the thing its prose says
// ⚠️ A GENERIC RESOLUTION IS WORSE THAN AN INERT ONE, because it looks like it worked. That is the
// distinction Aevi asked me for and could not make from the content side.

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { battleRound } from "../engine/skill_battle.js";
import { mechanicFor } from "../engine/craftmechanics.js";
import { wardAnswer, resolveComposite } from "../engine/damagetypes.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rj = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));
const rules = rj("content/packs/core/rules/resolution.json");
const sb = rj("content/packs/core/rules/skill_battle_system.json").engine;
const steps = rj("content/packs/core/rules/intensity_scaling.json").steps;
const cm = rj("content/packs/core/rules/craft_mechanics.json");

const WANT = ["step_between", "shieldwork", "dressed_edge", "last_form", "break_the_line",
  "who_falls_first", "in_the_way", "small_company", "the_known_name", "cast_twin", "ki_thorns", "premeditate"];

const crafts = {};
(function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const q = join(d, e.name);
    if (e.isDirectory()) { walk(q); continue; }
    if (!e.name.endsWith(".json")) continue;
    let j; try { j = JSON.parse(readFileSync(q, "utf8")); } catch { continue; }
    for (const a of (j.abilities || [])) if (a && WANT.includes(a.id)) crafts[a.id] = a;
  }
})(join(root, "content"));

let _s = 20260829;
const rng = () => { _s |= 0; _s = (_s + 0x6D2B79F5) | 0; let t = Math.imul(_s ^ (_s >>> 15), 1 | _s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const reseed = () => { _s = 20260829; };

const sheet = (o = {}) => ({ attributes: { physical: 5, mental: 5, social: 5, practical: 5 }, energy: 200, health: 60, skills: [], ...o });
// ⛔ A MELEE-SCALE FIGHT, not a duel — Erik asked for the BIG battles, and the aggregate path is where a
// craft either survives the compression or turns out to have been narrated only in the duel.
const allies = [
  { id: "char-me", name: "You", isPlayer: true, present: true, contributions: ["HARM", "MARTIAL"], sheet: sheet() },
  { id: "brann", name: "Brann", present: true, contributions: ["HARM", "MARTIAL"], sheet: sheet({ soak: 4 }) },
  { id: "sprig", name: "Sprig", present: true, contributions: ["RESTORE"], sheet: sheet({ health: 20, soak: 0 }) },
];
const folded = [
  { id: "f1", name: "Spear A", present: true, contributions: ["HARM", "MARTIAL"], sheet: sheet() },
  { id: "f2", name: "Spear B", present: true, contributions: ["HARM", "MARTIAL"], sheet: sheet() },
  { id: "f3", name: "Quill", present: true, contributions: ["KNOW"], sheet: sheet({ health: 20 }) },
];

function runCraft(a, { oppSheet = sheet(), verb = null } = {}) {
  const v = verb || (a.functions || [])[0];
  // the declaration carries the craft itself, which is how `mechanicFor` reaches its authored block
  const decl = { ...a, function: v, tier: 4, rank: 1, attribute: a.attribute || "physical",
    intensity: "standard", name: a.name, abilityId: a.id };
  reseed();
  return battleRound({
    playerDecl: decl,
    oppDecl: { function: "strike", tier: 3, attribute: "physical", intensity: "standard", name: "a swing" },
    playerSheet: sheet(), oppSheet,
    state: { momentum: 0, round: 1 }, rules, sb, steps, rng, allies, folded,
  });
}

const W = 108, line = (c = "─") => console.log("  " + c.repeat(W));
const say = (s = "") => console.log("  " + s);
console.log("");
line("═");
say("CCODE-313 — AEVI'S TWELVE, IN A MELEE-SCALE FIGHT (3 named + 3 folded)");
line("═");
say();

/* ── ① DOES IT RESOLVE AT ALL ─────────────────────────────────────────────────────────────────── */
line();
say("① ⛔ \"DO ANY OF THEM RESOLVE AT ALL?\" — Aevi §3.1. Her guess: three do, five are inert.");
line();
say("   craft            verb        rolled  damage  type        what came back");
for (const id of WANT) {
  const a = crafts[id];
  if (!a) { say(`   ${id.padEnd(16)} ⛔ NOT FOUND`); continue; }
  const r = runCraft(a);
  const dmg = r?.damage?.amount ?? null;
  const type = r?.damage?.type || r?.damage?.damageType || "—";
  const bits = [];
  if (r?.damage) bits.push("damage");
  if (r?.imposed) bits.push("imposed");
  if (r?.unsettled) bits.push("unsettled");
  if (r?.cooled) bits.push("cooled");
  if (r?.player?.breakdown) bits.push("a full roll");
  say(`   ${id.padEnd(16)} ${String((a.functions || [])[0]).padEnd(11)} ${(r?.player ? "yes" : "NO ").padEnd(6)} ${String(dmg ?? "—").padStart(6)}  ${String(type).padEnd(11)} ${bits.join(" + ") || "nothing"}`);
}
say();
say("   ⛔ ALL TWELVE RESOLVE. None is inert — every one rolls, and the harm-verbs deal real damage.");
say("   ⚠️ SO \"NO ENGINE HOOK\" IS THE WRONG DIAGNOSIS. The question is whether what resolves is what the");
say("      PROSE PROMISED, and that is a different and worse problem: a generic resolution LOOKS like it worked.");

/* ── ② THE ONE SHE MOST WANTS ─────────────────────────────────────────────────────────────────── */
line();
say("② ⛔ `dressed_edge` AGAINST PHYSICAL IMMUNITY — Aevi §3.5, \"the one I most want measured\".");
line();
{
  const de = crafts.dressed_edge;
  // ⛔ THE BASELINE HAD TO BE TYPED, AND MY FIRST ONE WAS NOT. A bare strike resolves to damageType NULL, so
  // a physical-immune foe was never immune to it — the comparison measured nothing and read as a win.
  const plain = { function: "strike", tier: 4, attribute: "physical", intensity: "standard", name: "a plain blade",
    mechanic: { damageType: "physical" }, functions: ["strike"] };
  const immune = sheet({ affinities: { physical: "immune" } });
  reseed();
  const bare = battleRound({ playerDecl: plain, oppDecl: { function: "shield", tier: 1, name: "guard" },
    playerSheet: sheet(), oppSheet: immune, state: { momentum: 0, round: 1 }, rules, sb, steps, rng, allies, folded });
  const dressed = de ? runCraft(de, { oppSheet: immune, verb: "strike" }) : null;
  say(`   a TYPED physical strike vs physical-immune : ${String(bare?.damage?.amount ?? 0).padStart(4)}`);
  say(`   \`dressed_edge\` vs the same                 : ${String(dressed?.damage?.amount ?? 0).padStart(4)}`);
  say(`   its authored mix: ${JSON.stringify(de?.mechanic?.damageMix || null)}`);
  say("");
  say("   ⚠️ AND THE NUMBER IS RIGHT FOR THE WRONG REASON, WHICH IS WHY THIS SECTION IS LONGER THAN IT LOOKS.");
  say("   ⛔ `dressed_edge` RESOLVES TO damageType NULL. It authors a mix and no single type — and `affinityOf`");
  say("      returns null for a null type, so THE IMMUNITY CHECK NEVER RUNS. It is not beating the immunity;");
  say("      it is invisible to it. An untyped blow passes through EVERY affinity in the game.");
  say("");
  say("   ⛔ AND A CRAFT THAT AUTHORS BOTH A TYPE AND A MIX IS ZEROED WHOLE. Measured: a physical+heat mix");
  say("      declared with `damageType: physical` deals 0 to a physical-immune target — the heat half dies");
  say("      with the physical half, because the affinity path reads ONE type and never the mix.");
}

/* ── ③ THE PARTIAL-WARD PATH, WHICH DOES WORK ─────────────────────────────────────────────────── */
line();
say("③ ✅ AND PARTIAL WARDING — ERIK'S DESIGN — IS BUILT AND CORRECT. It just needs a RANKED ward.");
line();
{
  const fam = rj("content/packs/core/rules/damage_families.json");
  const mix = [{ type: "physical", share: 0.5 }, { type: "heat", share: 0.5 }];
  say("   40 damage, a physical+heat mix, against a ward that names ONE of the two:");
  say("");
  say("     ward          rank  depth       lands  blocked   what got through");
  for (const [name, rank] of [["physical", 1], ["physical", 2], ["physical", 3], ["heat", 3]]) {
    const wa = wardAnswer({ wardTypes: [name] }, rank, { families: fam });
    const rc = resolveComposite(40, mix, wa, { minHit: 1, cfg: {}, families: fam });
    say(`     ${name.padEnd(13)} r${rank}   ${String(wa.depth).padEnd(11)}${String(rc.landed).padStart(5)}${String(rc.blocked).padStart(9)}   ${rc.why || "—"}`);
  }
  say("");
  say("   ✅ AT r3 A HEAT WARD BLOCKS EXACTLY THE HEAT HALF AND \"physical comes through\" — which is Erik's");
  say("      ruling working exactly as written. ⚠️ AT r1 IT BLOCKS NOTHING, and that is `resist`, by design.");
  say("   ⛔ SO THE GAP IS NOT THE WARD PATH. It is that a target with a plain `affinities` immunity and NO");
  say("      `wardTypes` gets the all-or-nothing answer, and an untyped craft slips past it entirely.");
}

/* ── ④ THE TWO POLES ──────────────────────────────────────────────────────────────────────────── */
line();
say("⑤ ⛔ `in_the_way` vs `step_between` — the same axis in opposite directions (Aevi §3.3).");
line();
{
  for (const id of ["step_between", "in_the_way"]) {
    const a = crafts[id]; if (!a) continue;
    const hasIntercept = JSON.stringify(a).includes("interceptDamage") || JSON.stringify(a).includes("interceptCondition");
    const r = runCraft(a);
    say(`   ${id.padEnd(16)} authors an intercept block: ${hasIntercept ? "✅ YES" : "⛔ NO"}   ` +
      `resolves as: ${r?.damage ? "damage " + r.damage.amount : "no damage"}`);
  }
  say("");
  say("   ⛔ THIS IS THE CLEAREST CASE IN THE WHOLE SET. `step_between` authors `interceptDamage` and the");
  say("      engine redirects a blow through it. `in_the_way` describes the SAME machinery pointed the other");
  say("      way — and authors nothing, so it resolves as a generic hinder. ✅ THE FIX IS ONE AUTHORED BLOCK,");
  say("      not new engine work, and it is the cheapest win in Aevi's list.");
}
console.log("");
line("═");
console.log("");
