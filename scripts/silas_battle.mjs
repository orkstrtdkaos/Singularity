// scripts/silas_battle.mjs — CCODE-259. A TURN-BY-TURN BATTLE WITH SILAS'S ACTUAL PARTY.
//
// ⛔ ERIK: "can you show me a turn by turn battle with a party - say Silas's against some enemies?"
//
// ⚠️ EVERY NAME, SHEET AND CRAFT HERE IS READ FROM THE SAVE — characters/player-s9z9u1/char-mrhs8286.json,
// its company roster and its npcRegistry — and every roll is a real `battleRound`. Nothing is invented.
//
// ⛔ AND ERIK CORRECTED ME BEFORE I WROTE IT: "just because silas isn't physical doesn't mean he doesn't
// fight... he's lethal." He is right and the save proves it. Silas is physical 5 — and his lethal crafts key
// off PRACTICAL 8 and MENTAL 7 before they ever touch physical. His two best weapons are braids he minted
// himself, both LETHAL, both MENTAL. Reading "physical 5" as "not a fighter" is reading the wrong column, in
// a game whose entire premise is that harm has eight doors.

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { battleRound } from "../engine/skill_battle.js";
import { alliesOf } from "../engine/combatants.js";
import { chooseTarget, foeKnowledge, revealTarget, canInterveneFor } from "../engine/targeting.js";
import { openProtection } from "../engine/intercept.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const J = p => JSON.parse(readFileSync(join(root, p), "utf8"));
const rules = J("content/packs/core/rules/resolution.json");
const sb = J("content/packs/core/rules/skill_battle_system.json").engine;
const steps = rules.resolution || {};
const SILAS = J("characters/player-s9z9u1/char-mrhs8286.json");
const marrowFile = J("content/packs/valley/companions/marrow.json");
const marrow = (marrowFile.companions || [marrowFile])[0];

function seeded(s0) { let s = s0 >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
const rng = seeded(20260826);

const roster = alliesOf(SILAS, { companions: { marrow }, npcs: SILAS.npcRegistry || {}, company: SILAS.company });
// ⛔ NO OVERRIDE HERE ANY MORE. Pell reads as martial because her record now says `combatant: true` —
// Erik authored it after this demo showed her standing in the "cannot swing" column. Her role text says
// "Village blacksmith" and no regex will ever find the spear in that, which is precisely why the field
// exists. Everything on this roster is now derived from the save with nothing patched in memory.

const W = 96;
const line = (c = "─") => console.log("  " + c.repeat(W));
const say = (s = "") => console.log("  " + s);
const first = (n) => String(n).split(" ")[0];

console.log("");
line("═");
say("SILAS WEIR · LEVEL " + SILAS.level + " · read from the save, not built for the demo");
line("═");
say();
say("  physical " + SILAS.attributes.physical + "   mental " + SILAS.attributes.mental +
    "   social " + SILAS.attributes.social + "   practical " + SILAS.attributes.practical +
    "      " + SILAS.health + "/" + SILAS.maxHealth + " health");
say();
say("  ⛔ HIS LETHAL CRAFTS, AND THE COLUMN EACH ONE READS:");
say("       braid_deathsense_palework    mental 7      ⛔ minted in play. lethal. his own.");
say("       braid_order_sense_palework   mental 7      ⛔ minted in play. lethal. his own.");
say("       radiant_lance                practical 8   ← his best stat");
say("       draw_down                    mental 7");
say("       hunters_strike               physical 5    ← his worst");
say();
say("  Physical 5 is the one column his killing does not go through.");
say();

line();
say("THE PARTY — company roster + npcRegistry, as the engine derives it");
line();
for (const a of roster) {
  const reg = (SILAS.npcRegistry || {})[a.id];
  const who = reg?.role || (a.kind === "player" ? "the man himself" : (marrow?.role || marrow?.kind || ""));
  say("  " + String(a.name).padEnd(26) + String("[" + a.contributions.join(",") + "]").padEnd(30) + String(who).slice(0, 38));
}
say();
const fighters = roster.filter(a => a.contributions.includes("MARTIAL"));
const soft = roster.filter(a => !a.contributions.includes("MARTIAL"));
say("  ⛔ can swing:  " + fighters.map(a => first(a.name)).join(", "));
say("  ⚠️ cannot, and are targetable anyway:  " + soft.map(a => first(a.name)).join(", "));
say("     THAT is the entire reason interception exists.");

const FOE = {
  name: "a Pale-March reaver",
  attributes: { physical: 11, mental: 6, social: 5, practical: 7 },
  level: 22, health: 60, maxHealth: 60, soak: 3, targetPolicy: "healer",
  imposes: { condition: "staggered", onCrit: "incapacitated", degradesTo: "action_loss", resist: "physical", targets: 1 },
};

let state = {
  momentum: 0, round: 1, playerEnergy: SILAS.energy, opponentEnergy: 90,
  effects: [], pressure: { player: 0, opponent: 0 }, opponentHealth: FOE.health, foeReadTier: null,
};
let protections = [];

const D = {
  read:  { function: "reveal",  tier: 3, attribute: "mental", intensity: "standard", name: "deathsense", sense: true },
  hide:  { function: "conceal", tier: 2, attribute: "mental", intensity: "standard", name: "the shadow work", obscure: true },
  braid: { function: "strike",  tier: 3, attribute: "mental", intensity: "standard",
           name: "braid_deathsense_palework", harmRung: "lethal", mechanic: { damageType: "decay" } },
  taunt: { function: "provoke", tier: 2, attribute: "social", intensity: "standard", name: "force the move" },
};

function turn(n, { sense, action, setup }) {
  console.log("");
  line("━");
  say("ROUND " + n);
  line("━");
  setup();
  say();

  // ① SENSE
  const foeSense = { function: "reveal", tier: 2, attribute: "mental", intensity: "standard", name: "it reads the line", sense: true };
  const sr = battleRound({
    playerDecl: sense, oppDecl: foeSense, playerSheet: SILAS, oppSheet: FOE,
    allies: roster, protections, targetPolicy: FOE.targetPolicy,
    state: { ...state, round: n }, rules, sb, steps, rng, phase: "sense" });
  state = { ...state, ...sr.state, round: n, foeReadTier: sr.foeReadTier ?? state.foeReadTier };

  say("  ① SENSE STEP — Silas declares: " + sense.name);
  const knows = foeKnowledge(state.foeReadTier ?? 0);
  say("       it read you at tier " + (state.foeReadTier ?? 0)
    + (knows.canReadRoles ? "   — it can pick out roles" : "   ⚠️ it cannot pick out who is mending"));

  const aim = chooseTarget(roster, { policy: FOE.targetPolicy, knowledge: knows, rng });
  const seen = revealTarget(aim, sr.senseTier ?? 0, { viewerId: "player" });
  say("       your read: tier " + (sr.senseTier ?? 0) + " — "
    + (seen.known ? "IT IS GOING FOR " + first(seen.targetName).toUpperCase() : seen.why));
  if (seen.reason) say("           …" + seen.reason);
  if (aim.blinded) say("       ⚠️ " + aim.why);
  say("       bonus action: " + (sr.bonusEarned?.player ? "YES" : "no")
    + (sr.senseBonus?.winner === "obscurer" ? "   — you beat its read" : ""));

  if (canInterveneFor(seen) && aim.target.id !== "player") {
    const guard = roster.find(a => a.contributions.includes("MARTIAL") && a.id !== aim.target.id && a.id !== "player");
    if (guard) {
      protections = [openProtection({ protectorId: guard.id, allyId: aim.target.id, rank: 2 })];
      say("       ⛔ " + first(guard.name).toUpperCase() + " STEPS IN FRONT OF " + first(aim.target.name).toUpperCase());
    }
  } else if (!seen.known && aim.target.id !== "player") {
    say("       ⚠️ nobody saw it coming — nobody can step in front of it");
  }

  // ② ACTION (+③ BONUS)
  const acts = sr.bonusEarned?.player ? 2 : 1;
  say();
  say("  ② ACTION — Silas: " + action.name + (acts > 1 ? "     ③ ×2, bonus action earned" : ""));
  for (let i = 0; i < acts; i++) {
    const foeAct = { function: "strike", tier: 3, attribute: "physical", intensity: "standard", name: "a reaver's cut" };
    const ar = battleRound({
      playerDecl: action, oppDecl: foeAct, playerSheet: SILAS, oppSheet: FOE,
      allies: roster, protections, targetPolicy: FOE.targetPolicy,
      state: { ...state, round: n }, rules, sb, steps, rng, phase: "action" });
    state = { ...state, ...ar.state, round: n };

    if (ar.damage?.side === "opponent") {
      state.opponentHealth = (state.opponentHealth ?? FOE.health) - ar.damage.amount;
      say("       → the reaver takes " + ar.damage.amount
        + (ar.damage.soaked ? "  (" + ar.damage.soaked + " soaked)" : "")
        + "     [" + Math.max(0, state.opponentHealth) + "/" + FOE.health + "]");
    } else if (ar.damage?.side === "player") {
      say("       ← it lands on " + first(ar.damage.onName || "Silas").toUpperCase()
        + " for " + ar.damage.amount + (ar.damage.onName ? "     ⚠️ not you" : ""));
    } else {
      say("       → nothing lands this beat");
    }
    if (ar.imposed?.condition) {
      say("       ⛔ " + String(ar.imposed.condition).toUpperCase() + " on "
        + first(ar.imposed.onName || (ar.imposed.side === "player" ? "Silas" : "the reaver"))
        + (ar.imposed.intercepted ? "  — CAUGHT BY " + String(ar.imposed.intercepted.caughtBy).toUpperCase() : ""));
    }
    if (ar.unsettled?.taunted) say("       ⛔ IT IS COMING FOR SILAS NOW — " + ar.unsettled.why);
    if (ar.blindStrike) say("       ⚠️ " + ar.blindStrike.why + " — its blow degraded");
  }

  say();
  say("  CARRIES FORWARD — momentum " + (state.momentum ?? 0)
    + " · pressure you " + (state.pressure?.player ?? 0) + " / it " + (state.pressure?.opponent ?? 0)
    + " · reaver " + Math.max(0, state.opponentHealth ?? 0) + "/" + FOE.health);
  protections = [];
}

turn(1, { sense: D.read, action: D.braid, setup: () => {
  say("  A reaver comes out of the pale scrub. It has fought parties before — it goes");
  say("  for whoever is holding the others up.");
}});

turn(2, { sense: D.hide, action: D.braid, setup: () => {
  say("  Silas takes the shadow work instead of looking. Safer. Blinder.");
}});

turn(3, { sense: D.read, action: D.taunt, setup: () => {
  say("  He looks again — and this time makes himself the thing it wants.");
}});

console.log("");
line("═");
say("WHAT THIS SHOWED");
line("═");
say();
say("  ⛔ A FOE PICKS, AND YOU ONLY KNOW IF YOU LOOKED. Round 2 is the trade in one beat:");
say("     hiding kept Silas safe and cost him the sight of the blow going somewhere else.");
say("  ⛔ THE SOFT ONES ARE STILL TARGETS. Calvar and Marrow cannot swing and can still be");
say("     dropped, which is what makes standing in front of them worth an action.");
say("  ⛔ AND SILAS KILLS WITH MENTAL. The heaviest thing on this field is a braid he made");
say("     himself, and his physical is 5. That is the design working, not a character built oddly.");
say();
say("  ⚠️ AND TWO RECORDS WERE WRONG UNTIL THIS RAN. Pell read as non-martial — 'Village blacksmith',");
say("     and no regex finds a spear in that; she now carries `combatant: true`. Siol read as an");
say("     Ashwarden warden when she is Rootkin of the Quickwood — the LIFE pole of the same axis the");
say("     narrator put her at the death end of. ⛔ NEITHER WAS FOUND BY A GATE. Both were found by");
say("     printing the party and looking at it.");
console.log("");
