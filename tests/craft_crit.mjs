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
import { critFor } from "../engine/craftmechanics.js";
import { critProfile, resolveAction } from "../engine/resolve.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rj = rel => JSON.parse(readFileSync(join(root, rel), "utf8"));
const RULES = rj("content/packs/core/rules/resolution.json");
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

console.log(failures === 0 ? "\nCraft criticals: all checks passed." : `\nCraft criticals: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
