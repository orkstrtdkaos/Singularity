// tests/how_it_works.mjs — CCODE-285. THE DOC IS A SPECIFICATION, SO RUN IT.
//
// ⛔ ERIK: "use this to collaborate and start to make sense of everything and close the loopholes… make
// more tests for things to find out how stuff is supposed to work and find the gaps to close."
//
// ⚠️ `docs/HOW_IT_WORKS.md` says what the game DOES, in present tense, and marks every claim BUILT or
// PROPOSED. That makes it executable. This harness asserts each BUILT claim against the live engine and
// asserts each PROPOSED claim is NOT yet live — a TWO-WAY RATCHET:
//
//   ⛔ a BUILT claim that stops being true          -> the engine regressed, or the doc lies
//   ⛔ a PROPOSED claim that quietly becomes true   -> someone shipped it and did not update the doc
//
// **That second direction is the one this project keeps losing.** Four times this week a field was
// authored, registered and loaded while the thing that should read it looked elsewhere; a doc drifting
// from the engine is the same failure wearing prose.
//
// ⚠️ AND THE GAPS IN §10 ARE ASSERTED AS CURRENTLY-TRUE. When one is fixed, its check goes RED and the
// doc must be edited. A known gap that silently closes is a doc that silently rots.

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rd = (p) => readFileSync(join(root, p), "utf8");
const rj = (p) => JSON.parse(rd(p));

let pass = 0; const fails = [], gaps = [];
function check(name, ok, detail = "") {
  if (ok) { pass++; console.log(`ok    ${name}`); }
  else { fails.push(name); console.log(`FAIL  ${name}${detail ? "\n      " + detail : ""}`); }
}
/** ⛔ A GAP IS NOT A FAILURE — it is a claim the doc makes ABOUT being unfinished. It goes red when FIXED,
 *  which is the signal to update §10. Reported separately so a green suite is not confused with a done one. */
function gap(name, stillOpen, detail = "") {
  if (stillOpen) { pass++; console.log(`gap   ${name} — still open, as §10 says`); }
  else { gaps.push(name); console.log(`GAP-CLOSED  ${name} — ⛔ FIXED. UPDATE docs/HOW_IT_WORKS.md §10.${detail ? "\n      " + detail : ""}`); }
}

const doc = rd("docs/HOW_IT_WORKS.md");
const abilities = [];
for (const f of readdirSync(join(root, "content/packs/core/abilities")).filter(x => x.endsWith(".json"))) {
  for (const a of (rj(`content/packs/core/abilities/${f}`).abilities || [])) abilities.push({ ...a, _file: f });
}
const cm = rj("content/packs/core/rules/craft_mechanics.json");
const fam = rj("content/packs/core/rules/damage_families.json");

console.log("");
console.log("═".repeat(96));
console.log("  CCODE-285 — docs/HOW_IT_WORKS.md, EXECUTED");
console.log("═".repeat(96));

/* ══════════ §0 — THE DOC ITSELF ══════════ */
// ⛔ NON-VACUITY FIRST. Every check below is scoped by the doc; an empty or renamed doc would pass
// everything by having claimed nothing. This is the floor.
console.log("\n── §0 · the doc is present and makes claims ──");
check("§0: the doc exists and is substantial", doc.length > 4000, `${doc.length} chars`);
check("§0: it marks claims BUILT and PROPOSED", /PROPOSED/.test(doc) && /BUILT/.test(doc));
check("§0: it carries a verified-at version, and that version is the live one",
  new RegExp(rd("app.js").match(/APP_VERSION = "([\d.]+)"/)[1].replace(/\./g, "\\.")).test(doc),
  `doc must name v${rd("app.js").match(/APP_VERSION = "([\d.]+)"/)[1]}`);
check("§0: the craft count it states matches the corpus",
  new RegExp(`${abilities.length} crafts`).test(doc), `corpus has ${abilities.length}`);

/* ══════════ §1 — WHAT A CRAFT IS ══════════ */
console.log("\n── §1 · a craft, its ranks, its cost ──");
{
  const { reachCost } = await import("../engine/capabilities.js");
  // "energyCost, plus +3 per rank of reach above rank 1 — a rank-1 use of an e4 craft costs 4 and a
  // rank-3 use costs 10."  ⛔ THE DOC STATES THE ARITHMETIC, SO ASSERT THE ARITHMETIC.
  //
  // ⚠️ AND ASSERT IT AGAINST THE CFG THE GAME ACTUALLY PASSES. My first draft handed `craft_mechanics.json`,
  // read a surcharge of `undefined`, and was one commit away from reporting "the entire rank-reach cost
  // mechanic is inert" — about a system that works. `app.js:12131` passes `CONTENT.rules.energy`, and the
  // dial lives at `resolution.json -> energy.rankReachSurcharge`. ⛔ A HARNESS THAT BUILDS ITS OWN CONFIG
  // TESTS ITS OWN CONFIG. Take the object the caller takes.
  const energy = rj("content/packs/core/rules/resolution.json").energy || {};
  const e4 = { id: "probe", energyCost: 4 };
  const cfg = energy;
  const r1 = reachCost(e4, 1, { cfg }), r2 = reachCost(e4, 2, { cfg }), r3 = reachCost(e4, 3, { cfg });
  check("§1: the surcharge is AUTHORED, not hardcoded", Number(energy.rankReachSurcharge) === 3,
    `resolution.json energy.rankReachSurcharge = ${energy.rankReachSurcharge}`);
  check("§1: a rank-1 use of an e4 craft costs 4", r1 === 4, `got ${r1}`);
  check("§1: …a rank-2 use costs 7", r2 === 7, `got ${r2}`);
  check("§1: …and a rank-3 use costs 10 (+3 per rank of reach)", r3 === 10, `got ${r3}`);
  // ⛔ AND THE WIRING, WHICH IS THE HALF A UNIT TEST CANNOT SEE: the menu the player reads must be built
  // with that same config object, or the arithmetic above is true only inside this file.
  check("§1: the capability menu is built with the ENERGY config, so the surcharge reaches play",
    /capabilityMenu\([^)]*cfg:\s*CONTENT\.rules\?\.energy/.test(rd("app.js")));

  // "There are no other costs… The single exception is an extreme capstone."
  const CAPSTONES = new Set(["the_cut_thread", "last_lament"]);
  const drains = abilities.filter(a => JSON.stringify(a).match(/"drainsPool"|"emptiesPool"|"wholePool"/));
  check("§1: only the two named capstones claim the whole pool",
    drains.every(a => CAPSTONES.has(a.id)), drains.map(a => a.id).join(", ") || "(none author the flag)");

  // ⛔ "RANKS ARE ADDITIVE. Rank 3 can do everything ranks 1 and 2 could."
  const { capabilityMenu } = await import("../engine/capabilities.js");
  const multi = abilities.filter(a => (a.tree || []).length >= 3);
  const shrank = multi.filter(a => {
    const at1 = capabilityMenu(a, 1, { cfg }), at3 = capabilityMenu(a, 3, { cfg });
    const n = (m) => (Array.isArray(m) ? m.length : (m?.tiers || []).length);
    return n(at3) < n(at1);
  });
  check("§1: ranks are ADDITIVE — owning rank 3 never offers FEWER tiers than owning rank 1",
    shrank.length === 0, shrank.slice(0, 4).map(a => a.id).join(", "));
}

/* ══════════ §2 — HOW A RANK RESOLVES ══════════ */
console.log("\n── §2 · resolution order, gainAxes, and what is only PROPOSED ──");
{
  const NINE = ["range", "duration", "damage", "scope", "targets", "quality", "autonomy", "conditions", "tempo"];
  const nine = new Set(NINE);
  for (const ax of NINE) check(`§2: the doc names '${ax}' as a gain axis`, new RegExp(`\`${ax}\``).test(doc));

  let vals = 0, out = [];
  for (const a of abilities) for (const t of (a.tree || [])) for (const g of (t.gainAxes || [])) {
    vals++; if (!nine.has(g)) out.push(`${a.id} r${t.rank}: ${g}`);
  }
  check("§2: the corpus actually uses gainAxes (non-vacuity)", vals > 500, `${vals} values`);
  check("§2: every gainAxes value is one of the nine", out.length === 0, out.slice(0, 5).join(" · "));

  // ⛔ BUILT: gainAxes decides which ranks appear in the menu, read for PRESENCE not content.
  const { tierDeclaresSomething } = await import("../engine/capabilities.js");
  check("§2 BUILT: a rank declaring a gainAxis is DISTINCT",
    tierDeclaresSomething({ rank: 2, gainAxes: ["range"] }, [{ rank: 1 }]) === true);
  check("§2 BUILT: a rank declaring nothing is NOT distinct",
    tierDeclaresSomething({ rank: 2, gainAxes: [] }, [{ rank: 1 }]) === false);
  // ⚠️ PRESENCE, NOT CONTENT — two different axes must read identically, or the doc is wrong to say so.
  check("§2 BUILT: it is read for PRESENCE — which axis it is changes nothing",
    tierDeclaresSomething({ rank: 2, gainAxes: ["range"] }, [{ rank: 1 }])
    === tierDeclaresSomething({ rank: 2, gainAxes: ["tempo"] }, [{ rank: 1 }]));

  // ⛔ PROPOSED: derivation. Assert it is NOT live — if someone builds it, this goes red and the doc must move.
  const cmSrc = rd("engine/craftmechanics.js");
  gap("§2 PROPOSED: rank derivation from gainAxes is not built",
    !/deriveFromGainAxes|derivedFromAxis|gainAxes/.test(cmSrc));
  check("§2: the doc marks derivation PROPOSED, not built", /PROPOSED.*deriv|deriv.*PROPOSED/is.test(doc));
  check("§2: the doc states the proposed curve as +50% / +33%", /\+50%.*\+33%/s.test(doc));
  check("§2: …and gates it on KIND — magnitude, ordinal, index", /MAGNITUDE/.test(doc) && /ORDINAL/.test(doc) && /INDEX/.test(doc));
  check("§2: …and refuses tempo", /`tempo` never derives/.test(doc));
}

/* ══════════ §3 — DAMAGE ══════════ */
console.log("\n── §3 · families, mixes, and healing ──");
{
  const DT = await import("../engine/damagetypes.js");
  const F = fam.families;
  const DOC_FAMILIES = {
    physics: ["physical", "force", "spatial", "temporal", "radiance", "shadow"],
    elemental: ["heat", "cold", "lightning", "corrosive"],
    vital: ["decay", "living", "vitality"],
    intrinsic: ["feeling", "appetite", "judgement", "psychic", "abstraction", "truth", "deception"],
  };
  for (const [name, types] of Object.entries(DOC_FAMILIES)) {
    const actual = (F[name]?.types || []).slice().sort();
    check(`§3: family '${name}' holds exactly what the doc lists`,
      JSON.stringify(actual) === JSON.stringify(types.slice().sort()),
      `doc ${types.join(",")} | file ${actual.join(",")}`);
    for (const t of types) check(`§3: '${t}' resolves to family '${name}'`, DT.familyOf(t, F) === name);
  }
  // ⚠️ "Elemental types are SIBLINGS, not opposites."
  check("§3: elemental types are siblings — none has an opposite",
    DOC_FAMILIES.elemental.every(t => DT.oppositeOf(t, F) === null));
  // ⛔ "A craft deals a MIX… The word people use for an effect is the mix."
  const blast = DT.damageMixOf({ damageMix: [{ type: "physical", share: 1 }, { type: "psychic", share: 1 }] });
  check("§3: a mix normalises, so authored shares cannot inflate a blow",
    Math.abs(blast.reduce((a, p) => a + p.share, 0) - 1) < 1e-9);
  check("§3: a single damageType reads as a mix of one",
    DT.damageMixOf({ damageType: "cold" }).length === 1);
  // ⛔ "HEALING IS NOT A TYPE."
  const allTypes = Object.values(F).flatMap(x => x.types || []);
  check("§3: healing is NOT among the damage types", !allTypes.includes("healing"));
  const healTyped = abilities.filter(a => a.damageType === "healing" || a.mechanic?.damageType === "healing");
  check("§3: …and no craft authors it as one", healTyped.length === 0, healTyped.map(a => a.id).join(", "));
}

/* ══════════ §4 — WARDS ══════════ */
console.log("\n── §4 · what a ward answers, and what gets through ──");
{
  const DT = await import("../engine/damagetypes.js");
  const F = fam.families, L = cm.wardLadder, B = cm.wardBreadth;
  const ward = (types, r) => DT.wardAnswer({ wardTypes: types }, r, { families: F, ladder: L, breadth: B });

  check("§4: depth is resist -> soak -> immunity",
    ward(["cold"], 1).depth === "resist" && ward(["cold"], 2).depth === "soak" && ward(["cold"], 3).depth === "immunity");
  // "An elemental ward stops heat and cold and lightning; a cold ward stops only cold."
  const el = ward(["elemental"], 3);
  check("§4: an elemental ward answers heat AND cold AND lightning",
    ["heat", "cold", "lightning"].every(t => el.answers.includes(t)), el.answers.join(","));
  check("§4: …and a cold ward answers ONLY cold",
    ward(["cold"], 3).answers.join(",") === "cold");
  // ⛔ PARTIAL WARDING IS THE POINT.
  const mix = DT.damageMixOf({ damageMix: [{ type: "physical", share: 1 }, { type: "psychic", share: 1 }] });
  const shield = ward(["physical"], 3);
  const rc = DT.resolveComposite(20, mix, shield, { minHit: 1, families: F });
  check("§4: a shield stops the physical half and the psychic half GOES THROUGH",
    rc.through.length === 1 && rc.through[0].type === "psychic" && rc.landed === 10, JSON.stringify(rc.through));
  // ⚠️ "Nothing is ever fully immune and nothing is ever fully blocked."
  const pure = DT.resolveComposite(20, DT.damageMixOf({ damageType: "physical" }), shield, { minHit: 1, families: F });
  check("§4: a blow whose every part is warded still lands its floor",
    pure.landed === 1 && pure.flooredBy === "minHit", JSON.stringify(pure));

  // "antisoak makes a wound worse but CANNOT create one… pierce guarantees the antisoak fires."
  const { pierceLanded } = await import("../engine/skill_battle.js");
  check("§4: antisoak cannot create a wound — a blow fully stopped by soak stays stopped",
    pierceLanded(6, 8, 0, 8, {}) === 0, `got ${pierceLanded(6, 8, 0, 8, {})}`);
  check("§4: …but it worsens one that lands",
    pierceLanded(10, 8, 0, 8, {}) > pierceLanded(10, 8, 0, 0, {}));
  check("§4: pierce lands regardless of armour, so it GUARANTEES the antisoak fires",
    pierceLanded(6, 8, 4, 8, {}) > 0, `got ${pierceLanded(6, 8, 4, 8, {})}`);
}

/* ══════════ §6 — DYING ══════════ */
console.log("\n── §6 · the death ladder ──");
{
  const D = await import("../engine/death.js");
  check("§6: rank 1 reaches the Threshold (0)", D.reachOf(1) === 0);
  check("§6: rank 2 reaches the Near Dark (1)", D.reachOf(2) === 1);
  check("§6: rank 3 reaches the Deep Dark (2)", D.reachOf(3) === 2);
  // ⛔ "SEALED — reachable by nothing, at any rank."
  check("§6: NOTHING reaches the sealed rung, at any rank or intensity",
    [1, 2, 3, 4, 9].every(r => D.reachOf(r) < 3 && D.reachOf(r, "surge") < 3));
  check("§6: a surge reaches one rung further, but never past the Deep Dark",
    D.reachOf(1, "surge") === 1 && D.reachOf(3, "surge") === 2);
  // ⛔ THE LADDER MOVES: a failed retrieval sinks them a rung.
  const mk = () => ({ id: "x", status: "dead", deathState: { diedDay: 1, bodyStatus: "intact", sealed: false, depthOverride: null } });
  // ⚠️ deathDepth is POSITIONAL (entity, currentDay, rules). My first draft passed an options
  // object, which made currentDay an object, rawDays NaN, and depth silently 2. The test failed and the
  // ENGINE WAS RIGHT — a harness bug that reads exactly like a defect is the thing this file exists to avoid.
  const sunk = mk(); const before = D.deathDepth(sunk, 2);
  D.resolveRetrieval(sunk, "fail", { currentDay: 2 });
  check("§6: a failed retrieval SINKS them a rung",
    D.deathDepth(sunk, 2) > before, `${before} -> ${D.deathDepth(sunk, 2)}`);
  // "Five traditions share one set of verbs."
  for (const v of ["retrieve", "sink", "seal", "hold", "slow"]) check(`§6: the doc names the verb '${v}'`, new RegExp(`\`${v}\``).test(doc));
  // ⛔ PROPOSED: undeath.
  gap("§6 PROPOSED: undeath (cocoon / narrowing / Afterling) is not built",
    !/cocoonStage|afterling|narrowing/i.test(rd("engine/death.js")));
}

/* ══════════ §7 — COMPANIONS ══════════ */
console.log("\n── §7 · everything participates ──");
{
  const C = await import("../engine/combatants.js");
  const cdir = "content/packs/valley/companions";
  const list = [];
  for (const f of readdirSync(join(root, cdir)).filter(x => x.endsWith(".json"))) {
    const j = rj(`${cdir}/${f}`);
    for (const c of (j.companions || j.items || (Array.isArray(j) ? j : [j]))) if (c && c.id) list.push(c);
  }
  check("§7: the companion roster is non-empty (non-vacuity)", list.length >= 9, `${list.length}`);
  const swingers = list.filter(c => (c.roles || []).includes("combatant") || c.combatant === true);
  const contributors = list.filter(c => C.contributionsOf(c).length > 0);
  // ⛔ "four of nine companions do not swing and ALL NINE contribute."
  check("§7: not every companion may swing — 'combatant' is a real distinction",
    swingers.length < list.length, `${swingers.length} of ${list.length} swing`);
  check("§7: ⛔ ALL companions contribute something",
    contributors.length === list.length,
    `${contributors.length} of ${list.length} — non-contributors: ${list.filter(c => !C.contributionsOf(c).length).map(c => c.id).join(", ")}`);
}

/* ══════════ §8 — TARGETING ══════════ */
console.log("\n── §8 · how a foe chooses ──");
{
  const T = await import("../engine/targeting.js");
  // ⚠️ THE REAL CONTRACT, not the one I assumed: `chooseTarget` returns {target, policy, why}; `knowledge`
  // comes from `foeKnowledge(tier)`; a taunt is `{targetId}`. My first draft guessed all three and produced
  // three failures that were mine, not the engine's — the same shape as the deathDepth slip above.
  // ⚠️ AND THE FIXTURE HAS TO SPEAK THE ENGINE'S LANGUAGE, WHICH MY FIRST ONE DID NOT: `weakest` sorts on
  // `resistOf` (the best of the four attributes), `healer` looks for a RESTORE **contribution**, and
  // `threat` scores `threatDealt` + MARTIAL/HARM. A fixture invented from the prose fails against a correct
  // engine and reads exactly like a defect — which is how a harness manufactures false findings.
  const allies = [
    { id: "tank", name: "Tank", threatDealt: 9, contributions: ["MARTIAL", "HARM"], sheet: { level: 8, attributes: { physical: 8 } } },
    { id: "squishy", name: "Squishy", threatDealt: 0, contributions: [], sheet: { level: 3, attributes: { physical: 2, mental: 2 } } },
    { id: "medic", name: "Medic", threatDealt: 1, contributions: ["RESTORE"], sheet: { level: 5, attributes: { mental: 5 } } },
  ];
  const know = T.foeKnowledge(3);
  const pickId = (r) => r?.target?.id ?? null;

  check("§8: the DEFAULT policy is threat", /Default is `threat`/.test(doc)
    && T.chooseTarget(allies, { knowledge: know, rng: () => 0 })?.policy === "threat");
  check("§8: threat picks whoever is hurting it most",
    pickId(T.chooseTarget(allies, { policy: "threat", knowledge: know, rng: () => 0 })) === "tank");
  // ⛔ POLICY_NEEDS ranks the policies by how good a look they need — the doc's "characterisation" claim.
  check("§8: the cruel policies need a better look than threat does",
    T.POLICY_NEEDS.threat === 0 && T.POLICY_NEEDS.weakest > T.POLICY_NEEDS.threat
    && T.POLICY_NEEDS.healer > T.POLICY_NEEDS.weakest, JSON.stringify(T.POLICY_NEEDS));
  check("§8: with a good enough look, weakest picks the frail one",
    pickId(T.chooseTarget(allies, { policy: "weakest", knowledge: know, rng: () => 0 })) === "squishy");
  check("§8: …and healer picks the one who is mending",
    pickId(T.chooseTarget(allies, { policy: "healer", knowledge: know, rng: () => 0 })) === "medic");
  // ⚠️ AND A FOE THAT CANNOT SEE WELL ENOUGH DEGRADES TO THREAT — not to random. That is the doc's
  // "a thing that goes for the healer is saying something about itself" read from the other side.
  const dim = T.chooseTarget(allies, { policy: "healer", knowledge: T.foeKnowledge(0), rng: () => 0 });
  check("§8: a foe that cannot read roles falls back to threat, not to chaos",
    dim?.policy === "threat" && dim?.blinded === "healer", JSON.stringify(dim));

  // ⛔ "a foe that goes for what is hurting it can be BAITED, and baiting is a decision."
  check("§8: ⛔ a threat-picker CAN BE BAITED — a taunt moves it",
    pickId(T.chooseTarget(allies, { policy: "threat", knowledge: know, taunt: { targetId: "squishy" }, rng: () => 0 })) === "squishy");

  // ⛔ THE ONE PLACE THE DOC AND THE ENGINE DISAGREE, AND BOTH HAVE A REASON.
  // DOC §8: "A thing with no mind is `blind` and cannot be drawn."
  // ENGINE (targeting.js:113): "A TAUNT TAKES THE CHOICE AWAY ENTIRELY, and it outranks concealment on
  //   purpose: you cannot demand something's attention and also be hidden from it."
  // ⚠️ The taunt short-circuits BEFORE the policy branch, so a blind foe IS drawn. Neither is obviously
  // wrong — Erik has said provoke should reach things without a line — but they cannot both be the rule.
  const blindTaunt = T.chooseTarget(allies, { policy: "blind", knowledge: know, taunt: { targetId: "squishy" }, rng: () => 0 });
  check("§8: ⛔ DOC vs ENGINE — a BLIND foe cannot be drawn by a taunt",
    pickId(blindTaunt) !== "squishy",
    `engine drew it to '${pickId(blindTaunt)}' via policy '${blindTaunt?.policy}'. `
    + `Either targeting.js must check mindlessness before the taunt, or §8 must stop claiming it. NEEDS A RULING.`);

  // "The downed are not targets."
  const withDown = [...allies, { id: "corpse", name: "Corpse", threat: 99, downed: true }];
  check("§8: ⛔ the downed are NOT targets, even at the highest threat",
    pickId(T.chooseTarget(withDown, { policy: "threat", knowledge: know, rng: () => 0 })) !== "corpse");
  // ⚠️ AND A TAUNT CANNOT RESURRECT ONE AS A TARGET EITHER — the downed filter runs first, which is right.
  check("§8: …and a taunt cannot make a downed ally a target",
    pickId(T.chooseTarget(withDown, { policy: "threat", knowledge: know, taunt: { targetId: "corpse" }, rng: () => 0 })) !== "corpse");
}

/* ══════════ §10 — THE KNOWN GAPS, ASSERTED AS OPEN ══════════ */
console.log("\n── §10 · the known gaps — these go RED when FIXED ──");
{
  // ⛔ each of these is a claim the doc makes about being unfinished. Closing one must edit the doc.
  // ⛔ BOTH OF THESE WERE REGEXES AND BOTH REPORTED THE GAP CLOSED WHEN IT WAS NOT. `bolster` is a SHAPE in
  // familyDefaults AND an unmechanised VERB — my probe conflated the two vocabularies. And grepping
  // skill_battle for ".soak" matched a different soak entirely. ⚠️ A REGEX ASKS WHETHER A WORD APPEARS;
  // THE QUESTION IS WHETHER A NUMBER CHANGES ANYTHING. Behavioural probes, like CI's own CCODE-240.
  const { mechanicsOf } = await import("../engine/craftmechanics.js");
  const VERB_FAMILIES = cm.verbFamilies || cm.functionFamilies || {};
  const knownVerbs = new Set(Object.keys(VERB_FAMILIES).length
    ? Object.values(VERB_FAMILIES).flat() : []);
  const usedVerbs = new Set();
  for (const a of abilities) for (const v of (a.functions || [])) usedVerbs.add(v);
  const unmechanised = ["persuade", "bolster"].filter(v => usedVerbs.has(v) && !knownVerbs.has(v));
  gap("§10: `persuade` and `bolster` are still unmechanised",
    unmechanised.length > 0, `unmechanised: ${unmechanised.join(", ") || "(none)"}`);

  // ⛔ THE REAL TEST: does the authored NUMBER change the outcome? soak 2 and soak 20 must differ.
  const soakCrafts = abilities.filter(a => a.mechanic?.soak != null);
  const guardOf = (soak) => {
    const probe = { id: "probe", shape: "guard", functions: ["guard"], mechanic: { soak, magnitude: soak } };
    const m = mechanicsOf ? mechanicsOf(probe, { cfg: cm }) : null;
    return m?.fields?.soak ?? m?.fields?.magnitude ?? null;
  };
  const lo = guardOf(2), hi = guardOf(20);
  gap("§10: `mechanic.soak` is still read by nothing",
    lo === hi || lo == null, `soak 2 -> ${lo} · soak 20 -> ${hi} · ${soakCrafts.length} crafts author it`);

  const stSrc = rd("engine/state.js");
  const DARK = ["damage_types", "tempo", "the_veil", "nexuses", "death_domain", "healing_intent",
                "power_cosmology", "energy_costs", "companion_template", "mechanic_effects"];
  const stillDark = DARK.filter(f => !new RegExp(`rules\\.${f.replace(/_(\w)/g, (_, c) => c.toUpperCase())}\\s*=`).test(stSrc));
  gap("§10: the registered-never-loaded rules files are still dark",
    stillDark.length > 0, `${stillDark.length} of ${DARK.length} still unloaded`);

  let deltaAxis = 0, mechAxis = 0;
  for (const a of abilities) {
    for (const r of (a.rankDeltas || [])) if (r.axis != null) deltaAxis++;
    if (a.mechanic?.axis != null) mechAxis++;
  }
  gap("§10: rankDeltas[].axis has no reader and mechanic.axis has no writer",
    deltaAxis > 0 && mechAxis === 0, `rankDeltas ${deltaAxis} · mechanic ${mechAxis}`);

  const layouts = Object.keys(rj("content/packs/core/world/local_layouts.json")).filter(k => !k.startsWith("_"));
  const wmSrc = rd("engine/worldmap.js");
  gap("§10: the map layer still draws rings instead of the authored layouts",
    !/local_layouts/.test(wmSrc) && !/local_layouts/.test(rd("app.js")), `${layouts.length} authored`);

  gap("§10: method (psionics / song / blade) is still recorded nowhere",
    abilities.every(a => a.method == null));
}

/* ══════════ REPORT ══════════ */
console.log("\n" + "═".repeat(96));
console.log(`  ${pass} ok · ${fails.length} FAILURE(S) · ${gaps.length} GAP(S) CLOSED`);
if (fails.length) { console.log("\n  ⛔ THE DOC AND THE ENGINE DISAGREE:"); fails.forEach(f => console.log("     " + f)); }
if (gaps.length) { console.log("\n  ⛔ A §10 GAP HAS BEEN FIXED — UPDATE docs/HOW_IT_WORKS.md:"); gaps.forEach(f => console.log("     " + f)); }
console.log("═".repeat(96) + "\n");
process.exitCode = (fails.length || gaps.length) ? 1 : 0;
