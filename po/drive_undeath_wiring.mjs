// po/drive_undeath_wiring.mjs — §48's three readers, driven THROUGH the production functions.
//
// ⛑ TWO OF MY OWN MEASUREMENTS LIED IN THIS FILE BEFORE IT SETTLED, both the logged kinds:
//  1. A NUMBER PROVEN BESIDE THE PATH IT HAS TO HOLD ON IS NOT PROVEN. My first §48.7 check computed
//     `pct − penalty` outside `retrievalOdds` and reached 0%; the real function returned 5%, because
//     `floor` is 5. That is why the toll is a GATE in death.js and not just a minus.
//  2. I ASKED THE ORDERING QUESTION AT THE ONE CASE THAT COULD NOT ANSWER IT. A threshold death reached by
//     a rank-3 warden at bond 10 stacks to a raw 122%, so it still pays at six prior raisings — I read that
//     as "the ordering does not hold" when it closes at seven, and at THREE in the deep dark. So the sweep
//     below runs four reachers and prints where each one closes, rather than asserting one favourite case.
//  3. And `rng: () => 0.5` drove a FAILING craft, so no effect landed and I read the empty list as a wiring
//     defect. A harness artefact that reads exactly like a defect is what driving is supposed to catch.
import { loadContentHeadless } from "../tests/headless_content.mjs";
import * as U from "../engine/undeath.js";
import { retrievalOdds } from "../engine/death.js";
import { summonSheetFor } from "../engine/npcsheet.js";
import { battleRound, affinityOf } from "../engine/skill_battle.js";

const C = await loadContentHeadless();
const rules = C.rules || {};
const sb = C.skillBattle?.engine || null;   // ⚠️ NOT `rules.skillBattleSystem` — my first driver passed null here
const line = (s) => console.log(s);

line("\n══════ §48 · THE THREE READERS, THROUGH THE REAL PATHS ══════");

/* ---- 1 · §48.7 through retrievalOdds itself ---- */
line("\n── 1 · §48.7 · retrievalOdds(), not a hand-computed copy of it ──");
line("  the road back, per prior raising (X = closed at any odds)");
const cases = [
  ["threshold · r3 · bond 10", 0, 3, 10],
  ["threshold · r1 · no bond", 0, 1, 0],
  ["near dark · r2 · bond 5", 1, 2, 5],
  ["deep dark · r3 · bond 10", 2, 3, 10],
];
let closesWorst = -1;
for (const [label, depth, rank, bond] of cases) {
  const row = [];
  for (let n = 0; n <= 9; n++) {
    const dead = { status: "dead", priorRaisings: n, deathState: { diedDay: 0, bodyStatus: "intact", sealed: false, depthOverride: depth } };
    const o = retrievalOdds(dead, { rank, currentDay: 0, rules, bond });
    row.push(o.exhausted ? "X" : String(o.pct));
  }
  const at = row.indexOf("X");
  if (at > closesWorst) closesWorst = at;
  line(`  ${label.padEnd(26)}${row.map((s) => s.padStart(4)).join("")}   closes at ${at < 0 ? ">9" : at}`);
}
line(`\n  ⛔ ERIK'S CONSEQUENCE, at the point the WORST case closes (${closesWorst} prior raisings):`);
const shut = retrievalOdds({ status: "dead", priorRaisings: closesWorst, deathState: { diedDay: 0, bodyStatus: "intact", sealed: false, depthOverride: 0 } }, { rank: 3, currentDay: 0, rules, bond: 10 });
const open = U.raiseOdds({ priorRaisings: closesWorst }, { rank: 1, rules });
line(`     back to living ${shut.pct}% (${shut.exhausted ? "⛔ CLOSED" : "open"}) · continuing in undeath ${open.pct}% (${open.open ? "✅ OPEN" : "closed"})`);
line(`     ${shut.pct === 0 && open.open ? "✅ a hero nobody could afford to bring back properly CAN still be made to continue" : "⛔ THE ORDERING DOES NOT HOLD"}`);
line(`  ⚠️ and the DEEP DARK closes first (at 3), which is §48.7's own sentence: a hero four centuries dead.`);

/* ---- 2 · a raised body, minted through summonSheetFor ---- */
line("\n── 2 · §48.5 · summonSheetFor() — is what a player raises undead to the arithmetic? ──");
const abil = C.abilities || {};
const setHand = Object.values(abil).find((a) => a.id === "set_hand");
const show = (label, sheet) => {
  const v = affinityOf(sheet, "vitality", sb), d = affinityOf(sheet, "decay", sb), c = affinityOf(sheet, "cold", sb);
  line(`  ${label.padEnd(46)} vitality=${String(v || "—").padEnd(10)} decay=${String(d || "—").padEnd(10)} cold=${String(c || "—").padEnd(7)} ${sheet.undead ? "⛔ undead" : ""}`);
};
show("set_hand as authored today", summonSheetFor(setHand, 5, { rank: 1, cfg: rules }));
show("…with summon.raises authored (Aevi's one word)", summonSheetFor({ ...setHand, summon: { ...setHand.summon, raises: true } }, 5, { rank: 1, cfg: rules }));
const wight = (C.bestiary?.roster || []).find((r) => r.id === "barrow_wight");
show("…raising an authored barrow_wight as the entry", summonSheetFor(setHand, 5, { rank: 1, cfg: rules, entry: wight }));
line(`  ⚠️ crafts declaring a raising today: ${Object.values(abil).filter((a) => a.summon?.raises === true || a.summon?.undead === true).length} of ${Object.values(abil).filter((a) => a.summon).length} summons.`);
line("     ⛔ So this door reaches ZERO crafts until `set_hand` and `given_errand` declare it. That word is Aevi's.");

/* ---- 3 · wornBenefits through battleRound ---- */
line("\n── 3 · §48.4 · battleRound() — does `deathless` actually grant what it authors? ──");
const deathless = Object.values(abil).find((a) => a.id === "deathless");
line(`  authored at r2: ${JSON.stringify(U.wornAffinityFor(deathless, 2).affinity)}`);
const mk = (n) => ({ id: n, name: n, level: 5, health: 40, maxHealth: 40, energy: 20, soak: 2,
  attributes: { might: 3, grace: 3, wits: 3, presence: 3 }, affinity: { cold: "vulnerable" } });
// ⛑ 0.1 LANDS IT. 0.5 FAILED THE CRAFT, and a craft that fails leaves nothing standing — correctly.
const r1 = battleRound({
  playerDecl: { function: "sustain", name: deathless.name, id: deathless.id, rank: 2, tier: 3, intensity: "standard", mechanic: deathless.mechanic },
  oppDecl: { function: "strike", name: "a blow", rank: 1, tier: 1, damageType: "cold" },
  playerSheet: mk("warden"), oppSheet: mk("foe"),
  state: { effects: [], momentum: 0, playerEnergy: 20, opponentEnergy: 20 }, rules, sb, rng: () => 0.1 });
const worn = (r1.effects || []).filter((fx) => fx.affinity);
line(`  round 1 — ${r1.player?.degree} · effects standing: ${(r1.effects || []).map((f) => f.label || f.kind).join(", ") || "none"}`);
line(`            carrying an affinity grant: ${worn.length ? JSON.stringify(worn.map((f) => ({ label: f.label, side: f.side, affinity: f.affinity }))) : "⛔ NONE — the grant did not ride onto the effect"}`);
const folded = U.withWornAffinity(mk("warden"), r1.effects || [], "player");
line(`  round 2 — her sheet now reads cold=${affinityOf(folded, "cold", sb)} decay=${affinityOf(folded, "decay", sb)}`);
line(`            ${affinityOf(folded, "cold", sb) === "immune" ? "✅ the worn grant WINS over her own `cold: vulnerable` — which is why she cast it" : "⛔ the grant did not reach the sheet"}`);
line(`            ${affinityOf(folded, "vitality", sb) ? "⛔ a mending now burns her — Erik struck that penalty" : "✅ no `vitality: vulnerable` on the wearer — Erik: \"STOP THE NEGATIVE ASPECTS OF HEROIC SKILLS!!\""}`);
line(`  ⛑ and with no mantle standing, `.concat(U.withWornAffinity(mk("w"), [], "player") === undefined ? "" : "the fold returns the sheet untouched — a fight with no worn craft in it pays nothing."));
line("");
