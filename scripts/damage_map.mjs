// scripts/damage_map.mjs — CCODE-280 / AEVI's SPEC_damage_type_system.
//
// ⛔ ERIK: "it has become obvious that we need a damage type structured system. Let's do this right instead
// of DISCOVERING IT PIECEMEAL. Warding would flow from it too."
//
// ⚠️ AEVI ASKS ERIK FIVE QUESTIONS AND THREE OF THEM ARE MEASURABLE RATHER THAN ARGUABLE. Her §4.1 —
// "should the mix be DERIVED (my strong lean) or AUTHORED per tradition?" — does not need an argument if
// the derivation can be run and looked at. So this runs it.
//
// ⛔ AND IT DOES NOT AUTHOR ANYTHING. The map is printed, not stored: a derived value with a stored copy is
// the failure this project keeps finding, and Erik already ruled that way for power-source mixes ("it's
// calculated and acts as a guide").

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "content/packs/core/abilities");
const all = [];
for (const f of readdirSync(dir).filter(x => x.endsWith(".json"))) {
  const j = JSON.parse(readFileSync(join(dir, f), "utf8"));
  for (const a of (j.abilities || j.items || [])) all.push(a);
}

const WOUNDS = new Set(["damaging", "lethal"]);
const STOPS = new Set(["incapacitating"]);
const rungsOf = (a) => [a.harmRung, ...(a.tree || []).map(t => t.harmRung)].filter(Boolean).map(String);
const wounds = (a) => rungsOf(a).some(r => WOUNDS.has(r));
const stops = (a) => rungsOf(a).some(r => STOPS.has(r));
const typeOf = (a) => a.damageType || a.mechanic?.damageType
  || (a.tree || []).map(t => t.damageType || t.mechanic?.damageType).find(Boolean) || null;

const W = 96;
const line = (c = "─") => console.log("  " + c.repeat(W));
const say = (s = "") => console.log("  " + s);

console.log("");
line("═");
console.log("  CCODE-280 — THE DAMAGE-TYPE MAP, DERIVED. Nothing here is stored.");
line("═");

// ═══ ① HOW BIG IS THE JOB, REALLY ═══
say();
line();
say("① THE SIZE OF THE JOB IS A DESIGN QUESTION, NOT A COUNT");
line();
const wounding = all.filter(wounds), stopping = all.filter(a => stops(a) && !wounds(a));
say();
say("  crafts that WOUND (damaging / lethal)            " + String(wounding.length).padStart(4));
say("  crafts that STOP without wounding (incapacitating) " + String(stopping.length).padStart(2));
say("  ⛔ union                                          " + String(wounding.length + stopping.length).padStart(4));
say();
say("  ⚠️ AEVI'S SPEC SAYS 113 AND NO DEFINITION I CAN CONSTRUCT PRODUCES IT — wounding alone is " + wounding.length + ",");
say("     the union is " + (wounding.length + stopping.length) + ". The gap is not arithmetic, it is a RULING nobody has made:");
say();
say("  ⛔ DOES A CRAFT THAT STOPS WITHOUT WOUNDING HAVE A DAMAGE TYPE AT ALL?");
say("     `progression.js` glosses incapacitating as \"STOPS a threat; it does not wound it — bind, hold,");
say("     turn aside, unmake the footing; NEVER a cut or a break\". ⚠️ A binding may not need a damage type;");
say("     it may need a RESIST type, which is a different axis and a different ward.");
say("     " + stopping.length + " CRAFTS HANG ON THAT ANSWER — a third of the corpus, either in the job or out of it.");

// ═══ ② THE DERIVED MIX ═══
const byTrad = {};
for (const a of all) {
  if (!wounds(a) && !stops(a)) continue;
  const t = a.tradition || "?";
  const rec = byTrad[t] || (byTrad[t] = { n: 0, types: {} });
  rec.n++;
  const d = typeOf(a);
  if (d) rec.types[d] = (rec.types[d] || 0) + 1;
}

/** ⛔ HER §3b, IMPLEMENTED: signature / secondary / reach, derived from what the crafts actually say.
 *  ⚠️ THE THRESHOLDS ARE THE ONLY INVENTED PART, and they are stated rather than hidden: the most-used type
 *  is the SIGNATURE, anything at half its weight or more is SECONDARY, the rest is REACH. */
function mixOf(rec) {
  const es = Object.entries(rec.types).sort((a, b) => b[1] - a[1]);
  if (!es.length) return null;
  const top = es[0][1];
  return {
    signature: es[0][0],
    secondary: es.slice(1).filter(([, n]) => n >= top / 2).map(([k]) => k),
    reach: es.slice(1).filter(([, n]) => n < top / 2).map(([k]) => k),
  };
}

console.log("");
line();
say("② THE MIX, DERIVED — her §3b run against the corpus as it stands today");
line();
say();
const typedTrads = Object.entries(byTrad).filter(([, v]) => Object.keys(v.types).length);
for (const [t, v] of typedTrads.sort((a, b) => b[1].n - a[1].n)) {
  const m = mixOf(v);
  say("  " + String(t).padEnd(14) + "signature " + String(m.signature).padEnd(12)
    + (m.secondary.length ? "secondary " + m.secondary.join(", ") : "")
    + (m.reach.length ? "   reach " + m.reach.join(", ") : ""));
}
say();
say("  ⛔ AND THIS IS THE ARGUMENT FOR DERIVING IT. " + typedTrads.length + " traditions have enough typed crafts to have a mix");
say("     at all; " + (Object.keys(byTrad).length - typedTrads.length) + " have none. An AUTHORED map would have to invent all " + (Object.keys(byTrad).length - typedTrads.length) + " now, before the");
say("     crafts exist to justify them — which is the piecemeal Erik is trying to stop, done in one sitting.");
say();
say("  ⚠️ A DERIVED MAP IS ALSO HONEST ABOUT BEING INCOMPLETE. Ashwarden reads signature `decay` because it");
say("     is the only tradition that has been audited. That is not a fact about Death; it is a fact about");
say("     whose homework is done, and a stored map would freeze it as though it were the former.");

// ═══ ③ THE TWO QUESTIONS I CAN ANSWER BY LOOKING ═══
console.log("");
line();
say("③ HER §4.4 AND §4.5, ANSWERED FROM THE CRAFTS RATHER THAN FROM OPINION");
line();
say();
const blaze = all.filter(a => a.tradition === "blazeborn" && (wounds(a) || stops(a)));
say("  §4.4 — IS THERE A FIRE TYPE, OR IS `light` DOING THAT JOB?  blazeborn has " + blaze.length + " harm crafts, 0 typed.");
for (const a of blaze.slice(0, 6)) {
  const prose = String(a.description || (a.tree || [])[0]?.grants || "").slice(0, 68);
  say("      " + String(a.id).padEnd(20) + prose);
}
const burnWords = blaze.filter(a => /burn|flame|fire|sear|scorch|char|ash/i.test(JSON.stringify(a)));
say("      ⛔ " + burnWords.length + " of " + blaze.length + " use burn/flame/fire/sear language in their own text.");
say("      ⚠️ `light` cannot carry that: radiant_folk's `light` craft is about ILLUMINATION and being seen.");
say("         Burning and shining are the same source and different harms.");
say();
const death = all.filter(a => a.tradition === "ashwarden");
const shadowish = death.filter(a => /shadow|dark|unlit|gloom|shade/i.test(JSON.stringify(a)));
say("  §4.5 — DEATH'S `shadow`: " + shadowish.length + " of " + death.length + " ashwarden crafts use shadow/dark language.");
for (const a of shadowish.slice(0, 5)) say("      " + a.id);
say("      ⚠️ BUT LANGUAGE IS NOT A TYPE. `kept_breath` and `calling_back` use the dark as a PLACE the");
say("         dead are, not as a thing they harm you with — and `ask_the_dead` does not harm at all.");
say("      ⛔ AND MY FIRST DRAFT CITED `the_shadow_work` HERE, which is a craft MINTED IN ERIK'S SAVE and");
say("         not in the corpus this script reads. Evidence has to come from the thing being measured.");
say("      ⛔ THE HONEST ANSWER IS THAT THE CRAFTS DO NOT SETTLE IT, and a regex over prose would invent one.");

console.log("");
line("═");
say("WHAT I WOULD BUILD, AND WHAT I WOULD NOT");
line("═");
say();
say("  ✅ BUILD: `damageAxes` as CONTENT — the axis table with polarity (life, growth, vitality, heat),");
say("     because a ward that answers an AXIS instead of a list is the whole payoff of her §3c.");
say("  ✅ BUILD: `traditionDamageMix()` as a DERIVED reader, exactly like the power-source mix.");
say("  ⛔ DO NOT BUILD: a stored per-tradition map. It would be a copy of a derived value, and it would");
say("     freeze one tradition's finished homework as though it were the design.");
say("  ⛔ DO NOT TYPE 118 CRAFTS IN A BATCH. Aevi is right: `draw_down` looked like decay and was vitality.");
console.log("");
