// craft_crit.mjs — CCODE-76 / SNG-258 §3b: can a craft author what ITS critical looks like?
//
// Aevi wrote `riding_order` with a soft bound that is not a restriction at all: "A HEARTBEAT'S WINDOW — miss
// it and YOU HAVE ONLY MADE CHAOS." That is an authored CONSEQUENCE, specific to that craft, and until now the
// engine had nowhere to put it. The second-roll crit model already had a per-craft dial; what it could not hear
// was the SENTENCE.
//
// This is a GATE file, not a report. Every assertion below is a structural fact — a shape resolves or it does
// not, a cap holds or it does not, a sentence reaches the narrator or it is lost. None of it is tuning.
//
// The one thing measured rather than asserted is HOW MUCH a craft-authored dial moves the outcome, printed so
// Erik can see whether the cap is set somewhere sane before he ever turns it in play.
//
// Run: node tests/craft_crit.mjs

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { critFor, mechanicFor, rollOperative, rollMagnitude, spreadFactor } from "../engine/craftmechanics.js";
import { critProfile, resolveAction, successChance } from "../engine/resolve.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rj = rel => JSON.parse(readFileSync(join(root, rel), "utf8"));
const RULES = rj("content/packs/core/rules/resolution.json");
const CM = rj("content/packs/core/rules/craft_mechanics.json");
const CAP = RULES.crit.perCraftCap;

let failures = 0;
const ok = m => console.log("ok    " + m);
const fail = m => { console.log("FAIL  " + m); failures++; };
const check = (label, cond, detail = "") => cond ? ok(label) : fail(label + (detail ? " — " + detail : ""));

console.log("CRAFT-AUTHORED CRITICALS — CCODE-76 / SNG-258 §3b\n");

// ── critFor: what the author is allowed to say ──────────────────────────────────────────────────────────
{
  const objForm = critFor({ mechanic: { crit: { failure: { text: "the window closes and you have only made chaos", chance: 4 } } } }, { cap: CAP });
  check("the object form resolves both halves", objForm?.failure?.text?.startsWith("the window") && objForm.failure.chance === 4);

  // The shorthand an author reaches for first. Rejecting it would make the object form the only door, and the
  // sentence is the point — the number is optional.
  const strForm = critFor({ mechanic: { crit: { failure: "you have only made chaos" } } }, { cap: CAP });
  check("a bare string is accepted as prose with no dial", strForm?.failure?.text === "you have only made chaos" && !strForm.failure.chance);

  // TEXT WITHOUT A CHANCE IS THE COMMON CASE, and must not be treated as empty. Most crafts want to say what
  // their disaster looks like without claiming it happens more often.
  const textOnly = critFor({ crit: { success: { text: "the shape holds past the moment it should have" } } }, { cap: CAP });
  check("prose with no chance still resolves (saying what it looks like ≠ claiming it happens more)", !!textOnly?.success?.text);

  // A CRAFT BIASES THE DIAL, IT DOES NOT OWN IT. Expertise is what crit is for (§3b: mastery triumphs harder
  // and fails softer); authoring must not be able to out-shout it.
  const greedy = critFor({ crit: { failure: { text: "catastrophe", chance: 80 } } }, { cap: CAP });
  check(`an over-reaching authored dial is clamped to the cap (${CAP}), with the ask recorded`,
    greedy.failure.chance === CAP && greedy.failure.asked === 80, JSON.stringify(greedy));
  const negative = critFor({ crit: { failure: { text: "it fails gently", chance: -80 } } }, { cap: CAP });
  check("the clamp is symmetric — a craft may also make itself SAFER, by no more than the cap",
    negative.failure.chance === -CAP);

  check("no crit block resolves to null (an absent field is absent, not an empty one)", critFor({ mechanic: {} }, { cap: CAP }) === null);
  check("critFor is total over its contract — no ability, no cfg, no throw",
    critFor(null) === null && critFor(undefined, {}) === null && critFor({ crit: null }) === null);
  // A cap of 0 must leave the prose intact and only silence the number: that is exactly what turning the dev
  // dial to 0 means, and it would be a trap if it also deleted the authored sentence.
  const silenced = critFor({ crit: { failure: { text: "chaos", chance: 9 } } }, { cap: 0 });
  check("cap 0 keeps the sentence and drops only the dial (what the dev dial at 0 must mean)",
    silenced?.failure?.text === "chaos" && !silenced.failure.chance);
}

// ── critProfile: the dial reaches the math, and says whose it is ────────────────────────────────────────
const baseCtx = { rules: RULES, action: {}, character: {} };
const plain = critProfile(baseCtx);
{
  const withCraft = critProfile({ ...baseCtx, action: { craftCrit: [{ name: "riding order", failure: { chance: 6 } }] } });
  check("an authored dial moves crit-failure", withCraft.failChance === plain.failChance + 6,
    `${plain.failChance} → ${withCraft.failChance}`);
  check("the popup can say WHOSE it is — the component is labelled with the craft's name",
    withCraft.failComponents.some(c => c.label === "riding order"), JSON.stringify(withCraft.failComponents));

  // A COMBO TAKES THE STRONGEST, NEVER THE SUM — the same rule deriveMechanic uses for braids, for the same
  // reason: braiding three crafts must not out-crit any of them.
  const combo = critProfile({ ...baseCtx, action: { craftCrit: [
    { name: "a", failure: { chance: 3 } }, { name: "b", failure: { chance: 7 } }, { name: "c", failure: { chance: 5 } }] } });
  check("a combo takes the STRONGEST contributor, never the sum (3+7+5 would be 15)",
    combo.failChance === plain.failChance + 7, `${combo.failChance} vs plain ${plain.failChance}`);
  check("and it names the craft that actually contributed", combo.failComponents.some(c => c.label === "b"));

  // A NEGATIVE AUTHORED DIAL MUST NOT REACH ZERO. "This craft fails softer" turning into "this craft cannot
  // fail" is the same defect the minChance floor was added for — it must not come back through a new door.
  const safe = critProfile({ ...baseCtx, action: { craftCrit: [{ name: "sure thing", failure: { chance: -CAP } }] } });
  check("catastrophe stays possible — an authored safety dial still floors at rules.crit.minChance",
    safe.failChance >= (RULES.crit.minChance ?? 1), `failChance ${safe.failChance}`);

  check("an action with no craftCrit is byte-for-byte what it was before this change",
    JSON.stringify(critProfile({ ...baseCtx, action: { craftCrit: [] } })) === JSON.stringify(plain));
}

// ── resolveAction: the sentence rides on the receipt, and ONLY when the crit lands ──────────────────────
{
  const TEXT = "the window closes and you have only made chaos";
  const PC = { attributes: { practical: 4, spiritual: 4, social: 4, mental: 4 }, skills: {} };
  const ctx = { rules: RULES, character: PC, location: null,
    action: { label: "reforge the falling arch", craftCrit: [{ name: "riding order", failure: { text: TEXT, chance: CAP } }] } };
  // Two rng draws per resolve: the outcome roll, then the crit roll. A pair that FAILS then CRITS.
  const seq = vals => { let i = 0; return () => vals[i++ % vals.length]; };
  const critFailed = resolveAction(ctx, seq([0.99, 0.001]));
  check("a critical failure carries the craft's own sentence to the narrator",
    critFailed.degree === "crit_failure" && critFailed.critText === TEXT, `${critFailed.degree} / ${critFailed.critText}`);

  const ordinaryFail = resolveAction(ctx, seq([0.99, 0.999]));
  check("an ORDINARY failure carries no critText — the field is absent, not an empty string that reads like content",
    ordinaryFail.degree === "failure" && !("critText" in ordinaryFail), JSON.stringify(ordinaryFail.critText));

  // Wrong-side text must not leak: a craft that only authored its failure has nothing to say about triumph.
  const critWon = resolveAction({ ...ctx, action: { ...ctx.action, abilityLevel: 9 } }, seq([0.001, 0.001]));
  check("a critical SUCCESS on a craft that only authored its failure carries no text (no wrong-side leak)",
    critWon.degree === "crit_success" && !critWon.critText, `${critWon.degree} / ${critWon.critText}`);

  check("resolveAction survives a malformed craftCrit rather than throwing mid-turn",
    (() => { try { resolveAction({ ...ctx, action: { craftCrit: "nonsense" } }, seq([0.5, 0.5])); return true; } catch { return false; } })());
}

// ── the measured part: how much is the cap actually worth? (a REPORT — Erik owns the number) ────────────
{
  const rate = (dial, trials = 40000) => {
    let s = 0, k = 1;
    const rng = () => { k = (k * 1103515245 + 12345) & 0x7fffffff; return k / 0x7fffffff; };
    for (let i = 0; i < trials; i++) {
      const r = resolveAction({ rules: RULES, character: { attributes: { practical: 4 }, skills: {} }, action: { attribute: "practical", craftCrit: dial ? [{ name: "x", failure: { chance: dial } }] : [] } }, rng);
      if (r.degree === "crit_failure") s++;
    }
    return (s / trials) * 100;
  };
  const off = rate(0), on = rate(CAP);
  console.log(`\n      WHAT THE CAP IS WORTH, measured on an unskilled caster (a REPORT — the number is Erik's):`);
  console.log(`      crit-failure with no authored dial ....... ${off.toFixed(2)}% of all attempts`);
  console.log(`      with a craft at the full cap (+${CAP}) ....... ${on.toFixed(2)}%  (${(on / Math.max(off, 0.01)).toFixed(1)}x)`);
  console.log(`      Turn rules.crit.perCraftCap in the Machine tab to change how loud authoring may be; 0 makes`);
  console.log(`      authored crits prose-only — the sentence still reaches the narrator, the dial does not move.`);
  check("the cap is worth something (a dial nobody can feel is a dial nobody will author to)", on > off);
}


// == CCODE-77 -- VARIANCE: A WIDER BAND, NOT A BIGGER NUMBER ===============================================
// Aevi, authoring churnfolk: "churnfolk crafts want a WIDENED OUTCOME BAND, not a bigger number - you don't
// choose HOW it breaks, only that it does." She authored `variance` 3-8 and reported the engine had no
// concept of it. True, and worse: outside damage/healing nothing was rolled at all, so `the_long_odds`
// (variance 8, "a cascade of lucky breaks no one could plan") delivered the identical number every cast.
console.log("\nVARIANCE - CCODE-77 (Aevi's churnfolk finding)\n");

const seeded = () => { let s = 7; return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; };
const sample = (craft, n = 40000) => {
  const verb = (craft.functions || [])[0];
  const m = mechanicFor({ functions: craft.functions, levelReq: craft.tier, mechanic: craft.mechanic }, { verb, tier: craft.tier, cfg: CM });
  const rng = seeded(), out = [];
  for (let i = 0; i < n; i++) { const r = rollOperative(m, rng, { cfg: CM }); if (r && r.value != null) out.push(r.value); }
  if (!out.length) return null;
  out.sort((a, b) => a - b);
  return { dim: m.operative, p5: out[Math.floor(n * 0.05)], p95: out[Math.floor(n * 0.95)],
    mean: out.reduce((a, b) => a + b, 0) / out.length };
};

{
  // THE MEAN MUST NOT MOVE. This is the whole design constraint: a chaotic craft is a GAMBLE, not a buff.
  // Let variance raise the average and "wild" quietly becomes "strong" - the same confusion that made
  // wild_current's crit dials worth separating from its power in the first place.
  let worst = 0, worstAt = "";
  for (const v of [0, 2, 4, 6, 8]) {
    const m = { operative: "magnitude", fields: { magnitude: 12, variance: v } };
    const rng = seeded(); let sum = 0; const N = 60000;
    for (let i = 0; i < N; i++) sum += rollOperative(m, rng, { cfg: CM }).value;
    const drift = Math.abs(sum / N - 12) / 12;
    if (drift > worst) { worst = drift; worstAt = "variance " + v; }
  }
  check(`variance preserves the MEAN - a wild craft is a gamble, not a buff (worst drift ${(worst * 100).toFixed(1)}% at ${worstAt})`,
    worst < 0.03, `${(worst * 100).toFixed(1)}% drift`);

  // THE BAND MUST ACTUALLY WIDEN, monotonically. A dial nobody can feel is a dial nobody will author to.
  const spreads = [0, 2, 4, 6, 8].map(v => {
    const m = { operative: "magnitude", fields: { magnitude: 12, variance: v } };
    const rng = seeded(), out = [];
    for (let i = 0; i < 40000; i++) out.push(rollOperative(m, rng, { cfg: CM }).value);
    out.sort((a, b) => a - b);
    return { v, spread: out[Math.floor(40000 * 0.95)] - out[Math.floor(40000 * 0.05)] };
  });
  console.log("      one craft at magnitude 12, swept across authored variance:");
  for (const s of spreads) console.log(`      variance ${s.v} .... p5-p95 band width ${s.spread}`);
  check("the band widens monotonically with authored variance",
    spreads.every((s, i) => i === 0 || s.spread >= spreads[i - 1].spread), JSON.stringify(spreads));
  check("variance 0 is EXACTLY today's behaviour - the authored number, every time (no catalog-wide re-roll)",
    spreads[0].spread === 0);

  // BIGGER MAX, NOT JUST WORSE MIN. The first draft clipped the widened roll at the UNWIDENED dice ceiling,
  // which would have delivered only the downside - a wilder craft that is simply a worse one.
  const dice = { dice: { n: 2, d: 6 }, plus: 0 };
  const hi = f => { const rng = seeded(); let mx = 0; for (let i = 0; i < 40000; i++) mx = Math.max(mx, rollMagnitude(f, rng, { cfg: CM })); return mx; };
  const plainMax = hi(dice), wildMax = hi({ ...dice, variance: 6 });
  check(`a widened craft can roll HIGHER than its unwidened ceiling (2d6 max ${plainMax} -> ${wildMax})`,
    wildMax > plainMax, `${plainMax} vs ${wildMax}`);

  check("spreadFactor is total and neutral by default", spreadFactor(0) === 1 && spreadFactor(null) === 1 && spreadFactor(undefined, {}) === 1);
  check("the dev dial at 0 makes variance inert - churnfolk resolve exactly like lattice",
    rollOperative({ operative: "magnitude", fields: { magnitude: 12, variance: 8 } }, seeded(), { cfg: { variance: { perPoint: 0 } } }).value === 12);
}

// -- the two traditions side by side: the REPORT Aevi asked for -------------------------------------------
{
  const rows = [];
  for (const file of ["churnfolk", "lattice"]) {
    for (const c of rj(`po/staged_content/${file}_mechanics.json`).crafts) {
      const s = sample(c);
      if (s) rows.push({ file, id: c.id, tier: c.tier, v: c.mechanic?.variance ?? null, ...s });
    }
  }
  console.log("\n      CHURNFOLK vs LATTICE - the same shapes, different bands (a REPORT; the numbers are Aevi's and Erik's)");
  console.log("      craft                 tier  var  dimension     p5    mean     p95    band");
  for (const r of rows) console.log(`      ${r.id.slice(0, 20).padEnd(20)}  T-${r.tier}   ${String(r.v ?? "-").padStart(2)}  ${String(r.dim).padEnd(10)} ${String(r.p5).padStart(5)}  ${r.mean.toFixed(1).padStart(6)}  ${String(r.p95).padStart(6)}  ${String(r.p95 - r.p5).padStart(6)}`);

  const wild = rows.filter(r => r.v), tame = rows.filter(r => !r.v);
  check("every craft that AUTHORED variance now has a band (it had none before - this is the finding closed)",
    wild.every(r => r.p95 > r.p5), wild.filter(r => r.p95 <= r.p5).map(r => r.id).join(", "));
  check("a craft that authored NO variance is still exactly deterministic (lattice did not become wild)",
    tame.filter(r => r.dim !== "damage" && r.dim !== "healing").every(r => r.p95 === r.p5),
    tame.filter(r => r.p95 !== r.p5).map(r => `${r.id} ${r.p5}-${r.p95}`).join(", "));
}

// -- CCODE-77b: the operative dimension must EXIST, or tier scales nothing --------------------------------
// Found while measuring the above: `families.KNOW.operative` was "setup", a dimension the setup SHAPE does
// not carry, so the tier ladder scaled a field that did not exist and a T-V reveal resolved identically to a
// T-I - across the largest family in the catalog. content_ci now gates the CONFIG; this gates the BEHAVIOUR.
{
  const grew = [];
  for (const [fam, def] of Object.entries(CM.families || {})) {
    const verb = (def.verbs || [])[0];
    if (!verb) continue;
    const at = t => mechanicFor({ functions: [verb], levelReq: t }, { verb, tier: t, cfg: CM });
    const lo = at(1), hi = at(5);
    const val = m => m.fields.dice ? m.fields.dice.n * m.fields.dice.d + (m.fields.plus || 0) : m.fields[m.operative];
    grew.push({ fam, verb, operative: lo.operative, lo: val(lo), hi: val(hi) });
  }
  console.log("\n      DOES TIER DO ANYTHING? every family, T-I vs T-V on its own operative dimension");
  for (const g of grew) console.log(`      ${g.fam.padEnd(10)} ${String(g.verb).padEnd(9)} ${String(g.operative).padEnd(10)} T-I ${String(g.lo).padStart(4)}  ->  T-V ${String(g.hi).padStart(4)}${Number(g.hi) > Number(g.lo) ? "" : "   <- FLAT"}`);
  check("CCODE-77b: a T-V craft out-scales a T-I in EVERY family (KNOW was flat at every tier)",
    grew.every(g => Number(g.hi) > Number(g.lo)), grew.filter(g => !(Number(g.hi) > Number(g.lo))).map(g => `${g.fam} flat at ${g.lo}`).join(", "));
}


// == SNG-258 4/4b -- WHAT THE ROLL-MATH POPUP READS =========================================================
// The popup is DOM, so it cannot be exercised here -- but what it reads is a CONTRACT on the resolver's
// return, and that contract is the part that breaks silently. The gm.js RESOLUTION block already proved the
// shape of this failure: a whitelist that only carries the fields someone remembered to add. If resolveAction
// stops returning any of these, the popup renders a shorter, confident, WRONG account of the math and nothing
// anywhere fails. So the keys are asserted by name.
{
  const PC = { attributes: { practical: 5, spiritual: 5, social: 5, mental: 5 }, skills: {} };
  const ctx = { rules: RULES, character: PC, location: null,
    action: { label: "a cut", attribute: "practical", abilityLevel: 3 } };
  const seq = vals => { let i = 0; return () => vals[i++ % vals.length]; };
  const r = resolveAction(ctx, seq([0.5, 0.5]));

  check("popup contract: the receipt carries the crit PROFILE, not just the outcome",
    !!r.crit && Number.isFinite(r.crit.successChance) && Number.isFinite(r.crit.failChance),
    JSON.stringify(r.crit));
  check("popup contract: both dials carry their NAMED components (4b asks 'and why', not just a number)",
    Array.isArray(r.crit.successComponents) && Array.isArray(r.crit.failComponents)
    && r.crit.successComponents.every(c => typeof c.label === "string" && Number.isFinite(c.value)));
  check("popup contract: the components SUM to the dial, or the clamp is disclosed (same self-summing rule as the chance)",
    [["success", r.crit.successComponents, r.crit.successChance, r.crit.successClampedFrom],
     ["fail", r.crit.failComponents, r.crit.failChance, r.crit.failClampedFrom]]
      .every(([, comps, total, from]) => comps.reduce((a, c) => a + c.value, 0) === (from ?? total)));
  check("popup contract: the SECOND ROLL itself is on the receipt (so the popup can say what actually happened)",
    "critRoll" in r);

  // A PARTIAL takes no second roll. The popup says so explicitly, and that line is only honest if critRoll is
  // genuinely null rather than a number the player would go looking for.
  // Computed, not guessed: a roll of chance+1 is the first value inside the partial band. An `if (degree ===
  // "partial")` around this check would SKIP SILENTLY the day the chance math moves — which is the one day it
  // matters — so the partial is CONSTRUCTED rather than hoped for, and the construction is asserted too.
  const chance = successChance(ctx);
  const partial = resolveAction(ctx, seq([chance / 100, 0.001]));
  check("popup contract: a PARTIAL reports critRoll null, so 'not eligible to crit' is a true statement",
    partial.degree === "partial" && partial.critRoll === null,
    `built a ${partial.degree} (roll ${partial.roll} vs chance ${chance}) — the partial band moved`);
}


console.log(failures === 0 ? "\nCraft character (crit + variance): all checks passed." : `\nCraft character: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
