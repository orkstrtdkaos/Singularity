// tests/taunt_wiring.mjs — CCODE-306. THE TAUNT REACHES THE PICK, AND THE BLOW LANDS WHERE IT SHOULD.
//
// ⛔ WHAT THIS GUARDS. `chooseTarget` has implemented a taunt override since CCODE-256, complete with a
// design rationale about why it outranks concealment. `resolveProvoke` has produced `taunted` since the
// same ticket. ⚠️ THE TWO WERE NEVER CONNECTED: the produced value was spread into a RECEIPT and the
// consumer was called without the argument. Both halves green, live path using neither.
//
// ⛔ AND A SECOND TRAP UNDERNEATH IT. `resolveProvoke` defaults its taunter to the literal string
// "player"; `chooseTarget` matches on `a.id === targetId`; a real save's player id is `char-…`. So even
// after wiring, the default could never have matched once. CCODE-261 names this exact trap two hundred
// lines above the call site — ASK THE FLAG, NEVER THE WORD — and it was waiting here the whole time.
//
// ⚠️ THIS IS A WIRING GATE, NOT A MODULE GATE. Testing `chooseTarget(taunt)` and `resolveProvoke` apart
// passes today and passed before the fix. The assertion that matters runs a REAL ROUND and asks where the
// blow landed.

import { battleRound, standingTaunt } from "../engine/skill_battle.js";
import { chooseTarget } from "../engine/targeting.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rj = (r) => JSON.parse(readFileSync(join(root, r), "utf8"));

let pass = 0; const fails = [];
const check = (name, ok, detail = "") => {
  if (ok) { pass++; console.log(`ok    ${name}`); }
  else { fails.push(name); console.log(`FAIL  ${name}${detail ? "\n      " + detail : ""}`); }
};

const rng = () => 0.5;
const sheet = (o = {}) => ({ attributes: { physical: 3, mental: 3, social: 3, practical: 3 }, energy: 100, health: 30, skills: [], ...o });

/* ══ ① THE HELPER — lapse is honoured, and an old save has no taunt ══════════════════════════════════ */
check("§1: a state with no taunt yields none (every save predating this)", standingTaunt({ round: 3 }) === null);
check("§1: a live taunt is returned", standingTaunt({ round: 3, taunted: { targetId: "char-x", until: 5 } })?.targetId === "char-x");
// ⛔ NON-VACUITY: the lapse must actually lapse, or "it expires" is a comment rather than a rule.
check("§1: a lapsed taunt is gone — a taunt that held forever removes the decision",
  standingTaunt({ round: 5, taunted: { targetId: "char-x", until: 5 } }) === null);

/* ══ ② THE CONSUMER — a taunt outranks the policy ════════════════════════════════════════════════════ */
const allies = [
    // ⛔ THE PLAYER IS DELIBERATELY THE TOUGHEST HERE. With everyone equal, "weakest" picked the player
  // anyway and the no-taunt case proved nothing — a non-vacuity floor that was itself vacuous.
  { id: "char-me", name: "You", isPlayer: true, present: true, sheet: sheet({ health: 40 }) },
  { id: "ally-1", name: "Bristle", present: true, sheet: sheet({ health: 8 }) },
  // ⛔ QUILL IS THE BIGGEST THREAT ON PURPOSE. The default policy is `threat`, which picks the hardest
  // hitter — and with the PLAYER as that pick, a taunt onto the player changes NOTHING OBSERVABLE and the
  // gate proves nothing. The mechanic is only visible when the taunt pulls the blow OFF someone else.
  { id: "ally-2", name: "Quill", present: true, sheet: sheet({ health: 8, attributes: { physical: 9, mental: 9, social: 9, practical: 9 }, level: 9 }) },
];
// ⚠️ TAUNT SOMEONE THE POLICY DID NOT PICK. My first version taunted whoever "weakest" already chose,
// so the two cases were identical and the no-taunt row proved nothing — a non-vacuity floor that was
// itself vacuous. (`weakest` also NEEDS knowledge tier 1 and silently degrades to `threat` without it.)
const untainted = chooseTarget(allies, { policy: "threat", rng });
const taunted = chooseTarget(allies, { policy: "threat", rng, taunt: { targetId: "ally-1" } });
check("§2: the two cases differ — the taunt changes the pick (non-vacuity)",
  untainted?.target?.id !== taunted?.target?.id, `both picked ${untainted?.target?.id}`);
check("§2: a taunt takes the choice away entirely",
  taunted?.target?.id === "ally-1" && taunted.taunted === true);

/* ══ ③ THE WIRING — a real round writes a taunt with a REAL id ═══════════════════════════════════════ */
// ⚠️ THE REAL DIALS, not empty objects. My first pass passed {} and resolve.js threw on
// `attributeSoftCap` — a gate that cannot construct the world it tests is not testing it.
const rules = rj("content/packs/core/rules/resolution.json");
const sb = rj("content/packs/core/rules/skill_battle_system.json").engine;
const steps = rj("content/packs/core/rules/intensity_scaling.json").steps;
const provokeRound = battleRound({
  playerDecl: { function: "provoke", tier: 4, attribute: "social", intensity: "standard", name: "make yourself loud" },
  oppDecl: { function: "strike", tier: 1, attribute: "physical", intensity: "standard", name: "swing" },
  playerSheet: sheet(), oppSheet: sheet({ attributes: { physical: 1, mental: 1, social: 1, practical: 1 } }),
  state: { momentum: 0, round: 1 }, rules, sb, steps, rng, allies,
});
const st = provokeRound?.state || {};
check("§3: winning with provoke PERSISTS the taunt onto state, not just into a receipt",
  !!st.taunted?.targetId, `state.taunted = ${JSON.stringify(st.taunted || null)}`);
// ⛔ THE ID IS THE WHOLE POINT. "player" would author, load and resolve to nobody.
check("§3: it stores the REAL player id, never the word \"player\"",
  st.taunted?.targetId === "char-me", `got ${JSON.stringify(st.taunted?.targetId)}`);
check("§3: and it carries a lapse round", Number.isFinite(st.taunted?.until) && st.taunted.until > (st.round || 0));

/* ══ ④ THE PAYOFF — the next round's blow lands on the taunter ═══════════════════════════════════════ */
// ⚠️ THIS IS THE ASSERTION THE MODULE TESTS COULD NOT MAKE. It runs the round that FOLLOWS and asks who
// actually got hit — the only question that distinguishes a wired mechanic from two green halves.
//
// ⛔ AND THE OBSERVABLE HAD TO BE FOUND, NOT ASSUMED. My first version read `next.aimedAt`, which
// `battleRound` DOES NOT RETURN, so the check passed on `undefined` — a gate that could never fail,
// which is worse than no gate. `damage.onId` (skill_battle.js:1261) is set ONLY when a NON-PLAYER ally takes the blow
// (CCODE-250), so its ABSENCE is the signal that the taunt pulled the blow onto the player.
const nextRound = (state) => battleRound({
  playerDecl: { function: "reveal", tier: 1, attribute: "mental", intensity: "standard", name: "look" },
  oppDecl: { function: "strike", tier: 8, attribute: "physical", intensity: "surge", name: "swing hard" },
  playerSheet: sheet(), oppSheet: sheet({ attributes: { physical: 6, mental: 6, social: 6, practical: 6 } }),
  state, rules, sb, steps, rng, allies,
});
if (st.taunted?.targetId) {
  const withTaunt = nextRound({ ...st });
  // ⛔ THE NON-VACUITY TWIN: strip the taunt and the SAME round must hit an ally instead. Without this
  // row, "no onId" could just mean the opponent never won, and the gate would assert nothing at all.
  const noTaunt = nextRound({ ...st, taunted: null });
  const hitWith = withTaunt?.damage?.onId ?? null;
  const hitWithout = noTaunt?.damage?.onId ?? null;
  check("§4: WITHOUT a taunt the blow lands on an ally (non-vacuity — the round must actually resolve)",
    hitWithout !== null && hitWithout !== "char-me", `onId=${hitWithout}`);
  check("§4: WITH a taunt standing, that same blow no longer lands on the ally",
    hitWith === null, `onId=${hitWith} (expected none — the player took it)`);
}

console.log("\n" + "═".repeat(88));
console.log(`  ${pass} ok · ${fails.length} FAILURE(S)`);
if (fails.length) { console.log("\n  ⛔ THE TAUNT IS NOT WIRED:"); fails.forEach(f => console.log("     " + f)); }
console.log("═".repeat(88) + "\n");
process.exitCode = fails.length ? 1 : 0;
