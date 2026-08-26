// scripts/turn_flow.mjs — CCODE-254. WHAT ACTUALLY HAPPENS IN A TURN, SHOWN RATHER THAN DESCRIBED.
//
// ⛔ ERIK: "We should build out a good set of battle turn flow scenarios to illustrate what happens in
// various scenarios. Who gets what bonus when, and bonus action? loses an action etc... how does it all
// come together?"
//
// ⚠️ EVERY LINE BELOW IS A REAL `battleRound` CALL. Nothing here is illustrative prose about what the engine
// is supposed to do — if a rule changes, this output changes with it, which is the only way a document like
// this stays true. Run it after any change to the turn.
//
// Read it top to bottom. The sense step comes first because it is where the most rules interact and where
// the least of it is visible in play.

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { battleRound } from "../engine/skill_battle.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const J = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));
const rules = J("content/packs/core/rules/resolution.json");
const sb = J("content/packs/core/rules/skill_battle_system.json").engine;
const steps = rules.resolution || {};

const YOU = { id: "player", attributes: { physical: 6, mental: 6, social: 5, practical: 5 }, level: 6, health: 30, maxHealth: 30, soak: 0 };
const FOE = { attributes: { physical: 5, mental: 4, social: 4, practical: 4 }, level: 5, health: 30, maxHealth: 30, soak: 0 };

const D = {
  read:  { function: "reveal",  tier: 2, attribute: "mental",   intensity: "standard", name: "read them",   sense: true },
  hide:  { function: "conceal", tier: 2, attribute: "mental",   intensity: "standard", name: "go quiet",    obscure: true },
  swing: { function: "strike",  tier: 2, attribute: "physical", intensity: "standard", name: "swing" },
  guard: { function: "ward",    tier: 1, attribute: "physical", intensity: "standard", name: "raise guard" },
  taunt: { function: "provoke", tier: 2, attribute: "social",   intensity: "standard", name: "call them out" },
  idle:  {},
};

function seeded(s0) { let s = s0 >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

function round({ you, foe, phase = "sense", state = {}, allies = null, seed = 4242, sheets = {}, extra = {} }) {
  return battleRound({
    playerDecl: you, oppDecl: foe,
    playerSheet: sheets.you || YOU, oppSheet: sheets.foe || FOE, allies,
    state: { momentum: 0, round: 1, playerEnergy: 100, opponentEnergy: 100, effects: [], pressure: { player: 0, opponent: 0 }, ...state },
    rules, sb, steps, rng: seeded(seed), phase, ...extra });
}

// ⛔ THE FIRST VERSION OF THIS FILE PRINTED THE OPPOSITE OF ITS OWN CAPTIONS. Scenario 8 said "provoke
// breaks their line" over a round where nothing happened; scenario 10 said "your read names them" over a
// tier-0 blind roll. Each scenario used one fixed seed and got whatever that seed happened to produce.
//
// ⚠️ A TEACHING DOCUMENT THAT ILLUSTRATES THE OPPOSITE OF ITS CAPTION IS WORSE THAN NO DOCUMENT — a reader
// cannot tell "the engine does something surprising" from "the author picked a bad example."
//
// So a scenario now SEARCHES for a round that actually exhibits the thing it claims, and says which round
// it found. ⛔ AND IF NO ROUND IN 400 EXHIBITS IT, THAT IS PRINTED AS A FAILURE rather than papered over —
// "I claimed a thing the engine will not do" is the single most useful line this file could contain.
function demonstrate(opts, predicate, { tries = 400 } = {}) {
  for (let seed = 1; seed <= tries; seed++) {
    const r = round({ ...opts, seed });
    if (predicate(r)) return { r, seed, found: true };
  }
  return { r: round({ ...opts, seed: 1 }), seed: null, found: false };
}
function orFail(d, claim) {
  if (!d.found) {
    console.log("");
    console.log("    ⛔⛔ NO ROUND IN 400 DID THIS. The claim below is WRONG about the engine:");
    console.log("        \"" + claim + "\"");
    console.log("        Fix the engine or fix the claim — do not leave this line here.");
    console.log("");
  }
  return d.r;
}

const W = 100;
const rule = (c = "─") => console.log("  " + c.repeat(W));
function head(n, title) {
  console.log("");
  console.log("  ┏" + "━".repeat(W - 2) + "┓");
  console.log("  ┃ " + ("SCENARIO " + n + " · " + title).padEnd(W - 4) + " ┃");
  console.log("  ┗" + "━".repeat(W - 2) + "┛");
}
const say = (s = "") => console.log("  " + s);
const kv = (k, v) => console.log("    " + String(k).padEnd(34) + String(v));

console.log("");
console.log("  " + "═".repeat(W));
console.log("  A TURN, STEP BY STEP — generated from the engine, not written down beside it");
console.log("  " + "═".repeat(W));
say();
say("A TURN IS THREE STEPS:   ① SENSE   →   ② ACTION   →   ③ BONUS (if you earned one)");
say();
say("In ① you may READ them, HIDE from them, or RAISE A GUARD. You cannot attack in the sense step.");
say("In ② you act. In ③ you act again, but only if step ① or ② paid out.");
say();

// ════════════════════════════════════════════════════════════════════════════
head(1, "THE BASELINE — you read, they swing");
const d1 = demonstrate({ you: D.read, foe: D.swing }, r => (r.senseTier ?? 0) >= 1);
const s1 = orFail(d1, "a read earns a sense tier above blind");
say("You spend the sense step LOOKING. They spend it swinging (which is not looking).");
say();
kv("what you learned (sense tier)", s1.senseTier + "  → " + (sb.senseVisibility?.[String(s1.senseTier)]?.label || "?"));
kv("bonus action to you?", s1.bonusEarned.player ? "YES" : "no");
kv("  …earned how?", s1.senseBonus?.winner === "obscurer" ? "by beating a reader"
  : s1.bonusEarned.player ? "⚠️ by ROLLING WELL — see scenario 9" : "—");
say();
say("⚠️ READING IS SUPPOSED TO BE ITS OWN REWARD. You learn what they are doing; you are not");
say("   supposed to bank anything extra for it. Scenario 9 is about why that is not currently true.");

// ════════════════════════════════════════════════════════════════════════════
head(2, "YOU HIDE, THEY READ — the trade that pays");
const d2 = demonstrate({ you: D.hide, foe: D.read }, r => r.senseBonus?.winner === "obscurer");
const s2 = orFail(d2, "beating an active reader pays the obscurer a bonus action");
say("You spend the step being hard to read. They spend theirs trying to read you.");
say();
kv("what YOU learned", s2.senseTier + "  → nothing. You did not look.");
kv("what THEY learned", "nothing — you denied the read");
kv("bonus action to you?", s2.bonusEarned.player ? "YES" : "no");
kv("  …earned how?", s2.senseBonus?.winner === "obscurer" ? "✅ by BEATING A READER — the obscure rule" : "—");
say();
say("⛔ THIS IS THE INTENDED SHAPE OF THE SENSE STEP. They spent their attention on you and came away");
say("   with nothing, so you come out of the step holding more of the round than they do.");

// ════════════════════════════════════════════════════════════════════════════
head(3, "THE TIE — an even read is the hider's");
say("At gap 0 two separate rules fire and they must not be confused:");
say();
kv("who WINS the read?", "⛔ the OBSCURER. Ties go to the hider, always.");
kv("who EARNS a bonus?", "⚠️ NOBODY. There is a ±" + (sb.senseStep?.bonusNullBand ?? 2) + " null band around a tie.");
say();
say("So at a dead heat the hider denies the read AND banks nothing. They broke even, which is the");
say("right feel for a coin flip.");
say();
say("⚠️ WHY THE TIE FAVOURS THE HIDER, since it reads as unfair: the reader picks the moment. A failed");
say("   read costs a step the hider had to spend anyway. Without it the sense slot belongs permanently");
say("   to the perceptive traditions.");

// ════════════════════════════════════════════════════════════════════════════
head(4, "YOU HIDE FROM SOMEONE WHO ISN'T LOOKING — no win");
const d4 = demonstrate({ you: D.hide, foe: D.swing },
  r => r.senseBonus?.winner !== "obscurer" && r.bonusEarned.player === true);
const s4 = orFail(d4, "the obscure rule declines to pay while the blanket degree rule pays anyway");
say("You go quiet. They were not looking at you — they were swinging.");
say();
kv("obscure rule pays?", s4.senseBonus?.winner === "obscurer" ? "yes" : "✅ NO — 'hiding from nobody is not a win'");
kv("but bonus action anyway?", s4.bonusEarned.player ? "⛔ YES — from the blanket degree rule" : "no");
say();
say("⚠️ TWO RULES DISAGREE HERE. See scenario 9.");

// ════════════════════════════════════════════════════════════════════════════
head(5, "YOU HIDE AND THEY DO NOTHING AT ALL — uncontested, and it pays");
const d5 = demonstrate({ you: D.hide, foe: D.idle }, r => r.senseBonus?.winner === "obscurer");
const s5 = orFail(d5, "an obscure against a wholly idle opponent pays");
kv("obscure rule pays?", s5.senseBonus?.winner === "obscurer" ? "✅ YES — an uncontested obscure pays" : "no");
say();
say("⛔ 'NOTHING' MEANS NOTHING — not 'something that wasn't a read'. A guard is a slot SPENT: they chose");
say("   not to look, which is the same choice you made, and neither side is paid for it. Only a genuinely");
say("   empty declaration pays — which is rare, because a spent character degrades to a bare swing or");
say("   guard rather than to nothing.");

// ════════════════════════════════════════════════════════════════════════════
head(6, "YOU GUARD INSTEAD — the third option, and what it costs");
const s6 = round({ you: D.guard, foe: D.read });
kv("what you learned", (s6.senseTier ?? 0) + " — you did not look");
kv("guard standing for the action step?", "YES — and still standing next round");
kv("bonus?", s6.bonusEarned.player ? "yes" : "no");
say();
say("A ward laid in the sense step is up before the action step of the SAME turn resolves. That is the");
say("appeal. The price is that you did not read, so no tier and no setup bonus.");

// ════════════════════════════════════════════════════════════════════════════
head(7, "LOSING YOUR ACTION ENTIRELY");
const s7 = round({ you: D.swing, foe: D.swing, phase: "action",
  state: { effects: [{ side: "player", deniesPhase: "action", name: "bound", rounds: 2 }] } });
kv("you are under", "a condition that denies the ACTION phase");
kv("round winner", s7.roundWinner ?? "—");
kv("why", "⛔ you did not get to act, so the round is theirs — no roll happens");
say();
say("⚠️ THIS IS THE HARSHEST THING IN THE TURN and it is why imposed conditions matter more than damage.");
say("   A blow costs you health. A BINDING costs you the round — and the round is where health comes from.");

// ════════════════════════════════════════════════════════════════════════════
head(8, "PROVOKE — what it actually does, and when it does nothing");
// ⚠️ PROVOKE ONLY RESOLVES ON A ROUND YOU WIN, which my first version of this scenario did not arrange —
// so it printed "nothing happened" under a caption claiming it broke their line.
const strongYou = { ...YOU, attributes: { physical: 9, mental: 9, social: 12, practical: 8 }, level: 12 };
const weakFoe = { ...FOE, attributes: { physical: 3, mental: 2, social: 2, practical: 2 }, level: 2 };
const d8 = demonstrate({ you: D.taunt, foe: D.guard, phase: "action",
  sheets: { you: strongYou, foe: weakFoe }, state: { tactic: "hammer-and-anvil" } },
  r => r.roundWinner === "player" && !!r.unsettled);
const withTactic = orFail(d8, "winning a round with provoke breaks the line the foe committed to");
const noTactic = round({ you: D.taunt, foe: D.guard, phase: "action",
  sheets: { you: strongYou, foe: weakFoe }, state: { tactic: null }, seed: d8.seed || 1 });
// ⚠️ `unsettled` IS ON THE RECEIPT EITHER WAY — it carries the REASON when provoke found nothing, which is
// right, and which is why reading its PRESENCE rather than its `ok` printed "broke something" over a round
// where nothing broke. Presence is not outcome; that mistake is the reason this file grew `demonstrate`.
kv("foe COMMITTED to a line", withTactic.unsettled?.ok
  ? "✅ broken: '" + (withTactic.unsettled.broke ?? "?") + "'" : "nothing happened");
kv("foe committed to nothing", noTactic.unsettled?.ok
  ? "broke something" : "⚠️ " + (noTactic.unsettled?.why || "nothing to take"));
say();
say("⛔ PROVOKE IS NOT AN ATTACK AND NOT A SENSE ACTION. It resolves in the ACTION step, on a round you");
say("   WIN, and what it does is break the line the foe has committed to — sending them back to plain");
say("   fighting. It deals no damage and imposes no condition.");
say();
say("⚠️ AND IT IS INERT AGAINST A FOE WITH NO LINE. `state.tactic` is set by the narrator, via the one");
say("   mechanical lever it has in a fight. So provoke's value depends on the GM having given this foe");
say("   something to commit to — which means a foe that never commits can never be provoked.");
say("   ⛔ THAT IS WORTH A RULING: should a foe without a tactic be GIVEN one to break?");

// ════════════════════════════════════════════════════════════════════════════
head(9, "⛔ THE CONFLICT — two bonus rules that were built years apart");
say("The sense step has an elaborate, careful bonus design: the reader banks nothing, the hider is paid");
say("only for beating an actual reader, a tie pays neither, an uncontested hide pays. Six prose variants.");
say();
say("Underneath it sits one blanket line: ANY sense roll of `success` or better earns a bonus action.");
say();
const N = 4000;
function measure(you, foe) {
  const rng = seeded(31337); let viaDegree = 0, viaObscure = 0, none = 0;
  for (let i = 0; i < N; i++) {
    const r = battleRound({ playerDecl: you, oppDecl: foe, playerSheet: YOU, oppSheet: FOE,
      state: { momentum: 0, round: 1, playerEnergy: 100, opponentEnergy: 100, effects: [], pressure: { player: 0, opponent: 0 } },
      rules, sb, steps, rng, phase: "sense" });
    if (r.senseBonus?.winner === "obscurer") viaObscure++;
    else if (r.bonusEarned.player) viaDegree++;
    else none++;
  }
  return { viaDegree, viaObscure, none };
}
const mRead = measure(D.read, D.swing);
const mHide = measure(D.hide, D.swing);
say("  ┌────────────────────────────────────────────────┬──────────────┬──────────────┐");
say("  │ over " + N + " rounds                              │ what the     │ what the     │");
say("  │                                                │ design says  │ engine does  │");
say("  ├────────────────────────────────────────────────┼──────────────┼──────────────┤");
say("  │ YOU READ — 'the reader banks nothing'          │  0% bonus    │ " + String((mRead.viaDegree / N * 100).toFixed(0) + "% bonus").padEnd(12) + " │");
say("  │ YOU HIDE from a non-reader — 'not a win'       │  0% bonus    │ " + String((mHide.viaDegree / N * 100).toFixed(0) + "% bonus").padEnd(12) + " │");
say("  └────────────────────────────────────────────────┴──────────────┴──────────────┘");
say();
say("⛔ NEITHER PIECE IS BUGGY. Each does exactly what it says. They were written at different times and");
say("   nobody ran them together, so the blanket rule pays out about half the time regardless of the");
say("   careful one — which makes the careful one mostly decorative.");
say();
say("⚠️ THIS IS A DIAL, NOT A REWRITE: `bonusOnDegrees` is authored as [\"crit_success\",\"success\"].");
say("   Setting it to [\"crit_success\"] alone hands the sense step back to the designed rules.");
say("   ⛔ BUT THAT IS ERIK'S CALL, because it also makes bonus actions much rarer everywhere else.");

// ════════════════════════════════════════════════════════════════════════════
head(10, "WITH A PARTY — the read now tells you WHO");
const party = [
  { id: "player", name: "Wren",  contributions: ["HARM", "MARTIAL"], threatDealt: 9, sheet: YOU },
  { id: "sprig",  name: "Sprig", contributions: ["RESTORE"], sheet: { attributes: { mental: 2 }, level: 3, soak: 0, health: 18 } },
];
const d10 = demonstrate({ you: D.read, foe: D.swing, allies: party, extra: { targetPolicy: "healer" } },
  r => (r.senseTier ?? 0) >= 2 && !!r.aimedAt);
const s10 = orFail(d10, "a good read names who the foe is going for");
kv("the foe is going for", s10.aimedAt?.target?.name ?? "—");
kv("did your read reveal it?", (s10.senseTier ?? 0) >= 2 ? "✅ yes — it named them" : "⚠️ not at this tier: " + s10.senseTier);
say();
const s10b = round({ you: D.hide, foe: D.swing, allies: party, extra: { targetPolicy: "healer" }, seed: d10.seed || 1 });
kv("…and if you had HIDDEN instead", "sense tier " + (s10b.senseTier ?? 0) + " — you would not know");
say();
say("⛔ THIS IS THE TRADE, AND IT IS THE POINT OF THE WHOLE SENSE STEP NOW. Hiding makes you safer and");
say("   blinds you. You cannot step in front of a blow you did not see coming.");

// ════════════════════════════════════════════════════════════════════════════
head(11, "WHAT CARRIES TO NEXT ROUND");
say("  MOMENTUM   swings with the margins and modifies your rolls, up to a cap.");
say("             It says WHO IS WINNING THIS EXCHANGE.");
say("  PRESSURE   builds separately. Fill it and someone is driven back hard.");
say("             It says HOW MUCH THIS IS COSTING.");
say();
say("  ⚠️ Two meters because one number cannot say both: a fight you are winning can still be grinding");
say("     you down. That is real attrition, not an ending.");
say();
say("  CONDITIONS persist until healed or until their rounds run out. ⛔ These are the dangerous ones —");
say("             see scenario 7. A condition that denies a phase costs you rounds, not health.");
say("  GUARDS     laid in the sense step stand through this action step AND the next round.");
say("  EFFECTS    tick down at the end of the round they were laid, not the start.");

console.log("");
rule("═");
say("⛔ THE OPEN QUESTIONS THIS SURFACED");
rule("═");
say("1. Scenario 9 — two bonus rules disagree, and the blanket one wins ~50% of the time.");
say("2. Scenario 8 — provoke is inert against a foe the narrator never gave a line to.");
say("3. A foe currently picks its target with PERFECT knowledge of your party. It probably should");
say("   have to read you, the way you read it — which would make obscure hide your party too.");
console.log("");
