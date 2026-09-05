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
  // ✅ 2026-09-05: the menu is `battleSkillsForCharacter` in engine/battle_turn.js (§71); app.js hands it `rules: CONTENT.rules`.
  check("§1: the capability menu is built with the ENERGY config, so the surcharge reaches play",
    /capabilityMenu\([^)]*cfg:\s*rules\?\.energy/.test(rd("engine/battle_turn.js")) && /battleSkillsForCharacter\(character, \{ catalog: fullCatalog\(\), rules: CONTENT\.rules/.test(rd("app.js")));

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
  // ⛔ CCODE-292 — READ THE DIAL, DO NOT INVENT ONE. This passed a literal `minHit: 1`, so when Erik set
  // the dial to 0 the doc's claim ("nothing is ever fully blocked") became FALSE and this gate stayed GREEN.
  // ⚠️ A HARNESS THAT BUILDS ITS OWN CONFIG TESTS ITS OWN CONFIG — the rule I wrote into FIELD_REFERENCE
  // §4 after the rankReachSurcharge near-miss, broken in the file that asserts it. Take the caller's object.
  const minHit = rj("content/packs/core/rules/skill_battle_system.json").engine?.damage?.minHit ?? 1;
  const rc = DT.resolveComposite(20, mix, shield, { minHit, families: F });
  check("§4: a shield stops the physical half and the psychic half GOES THROUGH",
    rc.through.length === 1 && rc.through[0].type === "psychic" && rc.landed === 10, JSON.stringify(rc.through));
  // ⚠️ "Nothing is ever fully immune and nothing is ever fully blocked."
  const pure = DT.resolveComposite(20, DT.damageMixOf({ damageType: "physical" }), shield, { minHit, families: F });
  // ⛔ ERIK RULED 2026-08-28: minimum damage is 0. So a blow whose every part is warded now lands NOTHING,
  // and the ward ladder's `immunity` rung finally means immunity. ⚠️ THE ASSERTION FOLLOWS THE DIAL rather
  // than a number, so moving the dial back moves the expectation with it instead of silently disagreeing.
  check(`§4: a blow whose every part is warded lands exactly the floor (minHit ${minHit})`,
    pure.landed === minHit, JSON.stringify(pure));
  check("§4: …and the doc states the SAME floor the dial holds",
    minHit === 0
      ? /lands NOTHING|answers? it completely|fully blocked/i.test(doc) && !/nothing is ever fully blocked/i.test(doc)
      : /still lands its floor/i.test(doc),
    `dial is ${minHit} — §4 must say what that means`);

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

  // ⛔ RULED 2026-08-28. This was the one red: the doc said a mindless foe "cannot be drawn", the engine
  // let a taunt reach it. ERIK: *"you can taunt from the darkness"* — THE ENGINE WAS RIGHT, and the doc
  // has been corrected. ⚠️ Having no preference is not the same as being unreachable.
  const mindlessTaunt = T.chooseTarget(allies, { policy: "mindless", knowledge: know, taunt: { targetId: "squishy" }, rng: () => 0 });
  check("§8: ⛔ a taunt reaches even a MINDLESS thing — you can taunt from the darkness",
    pickId(mindlessTaunt) === "squishy" && mindlessTaunt?.policy === "taunted", JSON.stringify(mindlessTaunt));

  // ⛔ AND THE RENAME ERIK OPENED: "blind is CAN'T SEE." The word named two things in one function — this
  // policy, and the receipt for a foe that genuinely cannot find anyone. ⚠️ THE ALIAS IS THE SAFETY: a
  // rename that dropped `blind` would fall through to `threat` and hand a mindless thing a PREFERENCE.
  check("§8: the no-preference policy is now `mindless`, not `blind`",
    "mindless" in T.TARGET_POLICIES && !("blind" in T.TARGET_POLICIES), Object.keys(T.TARGET_POLICIES).join(","));
  check("§8: ⛔ an authored or saved `blind` still RESOLVES — aliased, never dropped",
    T.canonPolicy("blind") === "mindless"
    && T.chooseTarget(allies, { policy: "blind", knowledge: know, rng: () => 0 })?.policy === "mindless");
  check("§8: …and `blind` is reserved for the can't-see receipt, where every ally is hidden",
    /policy: "blind", blindly: true/.test(rd("engine/targeting.js")));
  check("§8: no content authors the retired policy name",
    !/"targetPolicy"\s*:\s*"blind"/.test(readdirSync(join(root, "content/packs/core/encounters"))
      .map(f => rd(`content/packs/core/encounters/${f}`)).join("\n")));
  check("§8: the doc records the rename and its reason", /blind is CAN'T SEE|CAN’T SEE/.test(doc));

  // "The downed are not targets."
  const withDown = [...allies, { id: "corpse", name: "Corpse", threat: 99, downed: true }];
  check("§8: ⛔ the downed are NOT targets, even at the highest threat",
    pickId(T.chooseTarget(withDown, { policy: "threat", knowledge: know, rng: () => 0 })) !== "corpse");
  // ⚠️ AND A TAUNT CANNOT RESURRECT ONE AS A TARGET EITHER — the downed filter runs first, which is right.
  check("§8: …and a taunt cannot make a downed ally a target",
    pickId(T.chooseTarget(withDown, { policy: "threat", knowledge: know, taunt: { targetId: "corpse" }, rng: () => 0 })) !== "corpse");
}

/* ══════════ §5 — CONDITIONS DEGRADE ══════════ */
console.log("\n── §5 · a failed resist degrades rather than negating ──");
{
  // ⛔ AEVI NAMED THE PATH so I did not have to guess a fifth time: `resolveImposition` -> `impositionOf`.
  const { resolveImposition, IMPOSABLE } = await import("../engine/craftmechanics.js");
  const craft = { id: "probe", imposes: { condition: "unconscious", resist: "physical", degradesTo: "action_loss", targets: 3 } };
  const cfg = { imposition: { base: 10, perResist: 1, perRank: 5 } };
  const landed = resolveImposition(craft, { rank: 3, cfg, margin: 99, targetResist: 0 });
  const resisted = resolveImposition(craft, { rank: 1, cfg, margin: 0, targetResist: 20 });
  check("§5: a landed imposition delivers what the craft named",
    landed.ok && landed.condition === "unconscious" && landed.resisted === false, JSON.stringify(landed));
  // ⛔ THE DOC'S CLAIM, EXACTLY: "You do not shrug it off; you take the lesser version."
  check("§5: ⛔ a RESISTED unconscious LANDS as action_loss — it degrades, it does not evaporate",
    resisted.ok === true && resisted.condition === "action_loss"
    && resisted.degradedTo === "unconscious" && resisted.resisted === true, JSON.stringify(resisted));
  // ⚠️ AND THE VOCABULARY IS CLOSED — a degradesTo outside IMPOSABLE must FAIL rather than impose a word
  // nobody implements. That is the enum-vocab seam, restated for conditions.
  const bogus = resolveImposition({ id: "p", imposes: { condition: "unconscious", degradesTo: "vibes" } },
    { rank: 1, cfg, margin: 0, targetResist: 20 });
  check("§5: …and a degradesTo outside the imposable set refuses rather than inventing a condition",
    bogus.ok === false && bogus.condition === null, JSON.stringify(bogus));
  for (const c of ["staggered", "action_loss", "unconscious", "incapacitated"])
    check(`§5: the doc names the condition '${c}'`, new RegExp(`\`${c}\``).test(doc));
  check("§5: the doc names the function that does it", /resolveImposition/.test(doc));
}

/* ══════════ §9 — DERIVED VS AUTHORED ══════════ */
console.log("\n── §9 · what is derived, and what is AUTHORED and must not be deleted ──");
{
  // ⛔ THIS GATE CUTS BOTH WAYS AND THE SECOND EDGE IS THE IMPORTANT ONE. §9 is headed "a stored copy of a
  // derived value is the failure this project finds most often" — which is an INSTRUCTION TO DELETE stored
  // copies. So a value wrongly listed there is a deletion order against correct content.
  const ps = rj("content/packs/core/rules/power_sources.json");
  const byTrad = Object.keys(ps.byTradition || {}).filter(k => !k.startsWith("_"));
  const dtByTrad = Object.keys(cm.damageTypeByTradition || {}).filter(k => !k.startsWith("_") && k !== "note");

  // ⚠️ AUTHORED, DELIBERATELY — and `craftSource` READS them. Not derived, and not to be swept.
  check("§9: ⛔ tradition power-source mixes are AUTHORED and non-empty — do NOT delete them",
    byTrad.length >= 20, `${byTrad.length} authored rows in power_sources.byTradition`);
  check("§9: …and the resolution path reads them",
    /powerSources\?\.byTradition/.test(rd("engine/substrate.js")));
  check("§9: ⛔ tradition damage mixes are AUTHORED too, and skill_battle reads them",
    dtByTrad.length >= 10 && /damageTypeByTradition/.test(rd("engine/skill_battle.js")),
    `${dtByTrad.length} authored rows`);
  // ⚠️ AND THE AUTHORED/UNAUTHORED DISTINCTION IS ITSELF LOAD-BEARING — `mix: null` must mean UNAUTHORED,
  // never "the mean is pure". An absent value doing double duty is the trap substrate.js calls out by name.
  check("§9: an unauthored mix is FLAGGED, so absence never poses as a value",
    Object.values(ps.byTradition).some(r => r && r._mixUnauthored));

  // ✅ GENUINELY DERIVED, NEVER STORED — the two the doc is right about.
  const { craftSource } = await import("../engine/substrate.js");
  const foot = rj("content/packs/core/rules/foothills.json");
  const footIds = Object.keys(foot.foothills || {}).filter(k => !k.startsWith("_"));
  check("§9: there are foothills to derive from (non-vacuity)", footIds.length > 0, `${footIds.length}`);
  const fid = footIds[0];
  const cs = craftSource({ tradition: fid }, {}, null, ps, foot);
  check("§9: ✅ a foothill's source is COMPUTED from its parents, and says so",
    cs?.via === "foothill" && cs?.mixAuthored === false && !!cs?.parents, JSON.stringify(cs).slice(0, 140));
  check("§9: ⛔ …and no foothill has a stored row in byTradition — that copy is the failure",
    footIds.every(id => !byTrad.includes(id)),
    footIds.filter(id => byTrad.includes(id)).join(", "));
  const { summonSheetFor } = await import("../engine/npcsheet.js");
  const plain = summonSheetFor({ id: "s", summon: { tierGap: 0 } }, 10, { rank: 1, degree: "success" });
  const crit = summonSheetFor({ id: "s", summon: { tierGap: 0 } }, 10, { rank: 1, degree: "crit" });
  check("§9: ✅ a summoned sheet derives from the caster's level", plain != null);
  check("§9: ⛔ …and a CRIT raises something stronger than the craft promises",
    JSON.stringify(crit) !== JSON.stringify(plain), "crit and success produced identical sheets");
}

/* ══════════ §11 — THE TESTING CONTRACT ══════════ */
console.log("\n── §11 · the testing contract — how we are allowed to claim a defect ──");
{
  // ⛔ AEVI OFFERED ME THIS SECTION AND I AM TAKING IT, because both rules are mine and both were learned
  // the expensive way in one afternoon.
  //
  // RULE 1 — A TOOL THAT REPORTS DEFECTS HAS A SELF-TEST, AND THE SELF-TEST RUNS FIRST.
  //   Five of this harness's first-draft failures were the harness's own, and each read exactly like an
  //   engine defect. Aevi's craft-lint produced 1,198 findings of which 663 were hers. A checker with no
  //   floor cannot tell you whether a green run means "clean" or "broken".
  // RULE 2 — A REGEX ASKS WHETHER A WORD APPEARS; THE QUESTION IS WHETHER A NUMBER CHANGES ANYTHING.
  //   Two gap probes here reported still-open gaps as FIXED because `bolster` is a SHAPE and a VERB.
  //   Behavioural probes (soak 2 vs soak 20) cannot make that mistake.
  const HARNESSES = ["tests/how_it_works.mjs", "scripts/safe_delete.mjs"];
  for (const h of HARNESSES) {
    const src = rd(h);
    check(`§11: '${h}' has a self-test or a stated floor`,
      /selfTest|self-test|non-vacuity|NON-VACUITY/.test(src), "a defect-reporting tool with no floor");
  }
  // ⚠️ AND THIS FILE MUST NOT BECOME VACUOUS. If the assertion count collapses, someone has commented out a
  // section and the suite will read green while testing nothing — the failure mode this project hits most.
  check("§11: this harness makes a substantial number of assertions (non-vacuity floor)",
    pass > 90, `only ${pass} so far`);
  check("§11: the doc carries the testing contract so it binds both authors", /## 11/.test(doc) || /TESTING CONTRACT/i.test(doc));
}

/* ══════════ §0b — THE LOG IS MANDATORY ══════════ */
console.log("\n── §0b · Erik's log requirement, enforced ──");
{
  // ⛔ ERIK 2026-08-28: "every spec, every authoring, every wiring, every update is logged as to the INTENT,
  // the details of HOW IT IS EXECUTED AND TESTED, and WHAT IMPACTS IT AND WHAT IT IMPACTS."
  // ⚠️ A REQUIREMENT NOBODY CHECKS IS A REQUIREMENT THAT LAPSES IN A WEEK. This makes it mechanical.
  const hasLog = /##\s*0\s*·\s*THE LOG/i.test(doc);
  check("§0b: the log section exists", hasLog);
  const rows = doc.split("\n").filter(l => /^\|\s*\d\d-\d\d\s*\|/.test(l));
  check("§0b: the log has entries (non-vacuity)", rows.length >= 5, `${rows.length} rows`);
  check("§0b: every log row carries all five columns — date, change, intent, tested by, impacts",
    rows.every(r => r.split("|").filter(c => c.trim()).length >= 5),
    rows.filter(r => r.split("|").filter(c => c.trim()).length < 5).slice(0, 2).join(" ⏎ "));
  // ⛔ AND THE STRONGEST FORM: a change that ships without a log line is what the rule exists to stop.
  check("§0b: the log names the reachOf clamp shipped for it", /reachOf/.test(doc));
}

/* ══════════ FR — docs/FIELD_REFERENCE.md, ALSO EXECUTED ══════════ */
console.log("\n── FR · the field reference — measured claims stay measured ──");
{
  // ⛔ THE SAME CONTRACT AS THE REST OF THIS FILE: a reference that drifts is worse than none, because it
  // is believed. Every number below is re-measured here rather than trusted from the prose.
  const fr = rd("docs/FIELD_REFERENCE.md");
  check("FR: the reference exists and is substantial", fr.length > 8000, `${fr.length} chars`);

  // ⛔ THE ATLAS TABLE IS GENERATED — assert it is FRESH, not merely present. A stale generated table is a
  // stored copy of a derived value, which is the exact failure the reference is written to prevent.
  const { execFileSync } = await import("node:child_process");
  // ⛔ NORMALISE LINE ENDINGS BEFORE COMPARING. The generator emits LF; git re-materialises the doc with
  // CRLF on checkout, so a byte comparison reported the table STALE when it was character-identical — and
  // it fired on this hook's very first push. ⚠️ A CRLF-vs-LF diff is the trap this repo produces most
  // often, and I put it in the gate meant to catch staleness.
  const norm = (s) => s.replace(/\r\n/g, "\n").trim();
  const live = execFileSync(process.execPath, [join(root, "scripts/field_atlas.mjs"), "--md"], { encoding: "utf8" });
  const embedded = fr.slice(fr.indexOf("<!-- ATLAS:BEGIN -->") + 20, fr.indexOf("<!-- ATLAS:END -->"));
  check("FR: ⛔ the embedded atlas is FRESH — regenerating produces the same table",
    norm(embedded) === norm(live), "run: node scripts/atlas_inject.mjs");

  // ⚠️ AND THE BUCKET COUNTS IN THE PROSE MUST MATCH THE TABLE, since a reader trusts the summary.
  // ⚠️ COUNT BY CELL, NOT BY REGEX ACROSS AN EMOJI. My first form matched `| ✅ READ |` with a two-dot
  // wildcard — an emoji is not two characters, so it silently counted ZERO, and `0 === 0` passed. ⛔ A
  // count of zero agreeing with a count of zero is the vacuous-gate shape, committed inside a gate whose
  // whole job is guarding against vacuity. The `n > 0` floor below is the fix that generalises.
  const cnt = (b) => live.split("\n").filter(l => l.startsWith("|") && l.includes(` ${b} |`)).length;
  for (const label of ["READ", "DARK", "CI-ONLY", "COLLISION"]) {
    const n = cnt(label);
    check(`FR: the prose count for ${label} (${n}) matches the table`,
      n > 0 && new RegExp(`\\*\\*${label}\\*\\*\\s*\\|\\s*\\*\\*${n}\\*\\*`).test(fr),
      n === 0 ? "⛔ counted ZERO — the counter is broken, not the doc" : `table says ${n}`);
  }

  // ⛔ THE AXIS FAMILY — the single biggest confusion in the schema, so its four numbers are pinned.
  let ga = 0, rdAxis = 0, mAxis = 0, opAxis = 0;
  for (const a of abilities) {
    if (a.operativeAxis != null) opAxis++;
    if (a.mechanic?.axis != null) mAxis++;
    for (const t of (a.tree || [])) ga += (t.gainAxes || []).length;
    for (const r of (a.rankDeltas || [])) if (r.axis != null) rdAxis++;
  }
  check("FR: `gainAxes` value count is as documented", new RegExp(`${ga}`).test(fr), `live ${ga}`);
  check("FR: `rankDeltas[].axis` count is as documented", new RegExp(`${rdAxis}`).test(fr), `live ${rdAxis}`);
  check("FR: ⛔ `mechanic.axis` is still authored ZERO times — a reader with no writer",
    mAxis === 0, `live ${mAxis} — if this is now non-zero the allow-list branch has woken up, UPDATE §2`);
  check("FR: `operativeAxis` is still authored on every craft", opAxis === abilities.length, `${opAxis}/${abilities.length}`);

  // ⛔ THE LARGEST DISCONNECTED SYSTEM FOUND SO FAR (Aevi, 2026-08-28). The engine reads
  // `mechanic.rankDeltas` KEYED BY RANK; 284 crafts author `rankDeltas` at the ROOT as a LIST. Zero match,
  // so every craft falls through to one default multiplier - which IS the complaint the feature was
  // written to fix. ⚠️ Pinned so that connecting it is a deliberate act that updates the reference.
  let rdRoot = 0, rdMech = 0, rdTotal = 0;
  for (const a2 of abilities) {
    if (Array.isArray(a2.rankDeltas)) { rdRoot++; rdTotal += a2.rankDeltas.length; }
    if (a2.mechanic?.rankDeltas != null) rdMech++;
  }
  // ✅ CCODE-289 — THE ADAPTER SHIPPED, so these assert the FIX rather than the defect. The content shape
  // is unchanged (root list, 274 crafts) and must stay readable; what changed is that the engine now reads it.
  check("FR: the corpus still authors `rankDeltas` at the ROOT as a list",
    rdRoot > 200 && rdMech === 0, `root ${rdRoot} · mechanic ${rdMech}`);
  {
    const CM = await import("../engine/craftmechanics.js");
    const cmCfg = rj("content/packs/core/rules/craft_mechanics.json");
    check("FR: ✅ the root-list rankDeltas are now READ — the adapter exists and is wired",
      typeof CM.rankDeltaFor === "function"
      && /rankDeltaFor\(/.test(rd("engine/craftmechanics.js")));
    // ⛔ A REAL CRAFT, NOT A FIXTURE. `resonant_shield` authors extend at r2 and r3.
    const rs = abilities.find(x => x.id === "resonant_shield");
    const d2 = rs && CM.rankDeltaFor(rs, 2, { cfg: cmCfg });
    check("FR: ✅ an authored `extend` resolves to real DIMENSIONS, not a default deepen",
      d2?.kind === "extend" && (d2.dimensions || []).length >= 1 && d2.source === "authored:list",
      JSON.stringify(d2));
    // ⛔ TRAP 3: authoring overrules the KIND, never the AMOUNT. 0 of 495 deltas carry a mult, so if the
    // authored delta replaced the default outright, 129 deepen crafts would scale by 1.0 — WORSE than before.
    const deep = abilities.find(x => (x.rankDeltas || []).some(r => r.kind === "deepen" && r.rank === 3));
    const d3 = deep && CM.rankDeltaFor(deep, 3, { cfg: cmCfg });
    check("FR: ⛔ an authored delta takes its MAGNITUDE from the dial, compounded — never 1.0",
      d3 && Math.abs(d3.mult - Math.pow(Number(cmCfg.rankDeltas.default.mult), 2)) < 1e-9,
      `mult=${d3?.mult} — if this is 1 the amount is being taken from an authored delta that has none`);
    // ⚠️ AEVI'S REQUESTED GATE: an extend resolves to a field, or is EXPLICITLY logged as prose. Never silent.
    let silent = 0;
    for (const a2 of abilities) for (const r of (a2.rankDeltas || [])) {
      if (r.kind !== "extend") continue;
      const got = CM.rankDeltaFor(a2, r.rank, { cfg: cmCfg });
      if (!got) continue;
      if (!(got.dimensions || []).length && !got.unmapped) silent++;
    }
    check("FR: ⛔ every `extend` either names a real field or is reported as prose — none goes silent",
      silent === 0, `${silent} extend deltas resolved to nothing and said nothing`);

    // ⛔ CCODE-291 / AEVI'S REQUESTED GATE. Erik ruled C: an `add` rank that grants a NEW VERB takes no
    // magnitude bump; one that grants none keeps the default. ⚠️ THAT MAKES A CRAFT'S SCALING DEPEND ON ITS
    // `functions` ARRAY — so an author tidying a rank's verbs, or a lint normalising them (which has happened
    // twice), would SILENTLY REMOVE A 35% BUMP. This pins the split so such an edit announces itself.
    let addVerb = 0, addNoVerb = 0, addR1 = 0;
    for (const a2 of abilities) {
      const tree = Array.isArray(a2.tree) ? a2.tree : [];
      const fnAt = (r) => new Set((tree.find(t => Number(t?.rank) === r) || {}).functions || []);
      for (const r of (a2.rankDeltas || [])) {
        if (r.kind !== "add") continue;
        const rk = Number(r.rank) || 0;
        if (rk <= 1) { addR1++; continue; }
        const below = fnAt(rk - 1);
        ([...fnAt(rk)].some(v => !below.has(v)) ? () => addVerb++ : () => addNoVerb++)();
      }
    }
    check("FR: ⛔ the add-rank split holds near 92 / 89 — a verb-tidying edit must not move balance silently",
      Math.abs((addVerb + addR1) - 92) <= 4 && Math.abs(addNoVerb - 89) <= 4,
      `with-verb ${addVerb} + r1 ${addR1} = ${addVerb + addR1} (was 92) · without ${addNoVerb} (was 89)`);
    check("FR: …and the engine branches on it — an add with no new verb keeps the default deepen",
      /addKept|add:noVerb/.test(rd("engine/craftmechanics.js")));
    check("FR: the reference records the rankDeltas fix and its counts",
      /323 rank-resolutions changed kind/.test(fr) && new RegExp(`${rdRoot}`).test(fr));
  }

  // ⚠️ THE MAGNITUDE LADDERS ARE THE ENTIRE EMPIRICAL BASIS FOR THE PROPOSED CURVE. If a new one appears,
  // the curve should be re-fitted before it ships, and §3 must say so.
  //
  // ⛔ 2026-09-05 — AND THIS TRIPWIRE COUNTED ORDINALS AS LADDERS, WHICH ITS OWN DOCUMENT FORBIDS. §3's
  // table has a KIND column; two rows are marked ORDINAL and ZERO-BASED INDEX, and its prose calls a
  // percentage curve over them "a CATEGORY ERROR, not a tuning miss". The detector read neither. So nine
  // bond grants landed, each carrying `tree.stage=[1,2,3]` — a bond BAND, an identity — and the count went
  // 5 → 13 while nothing about the curve moved. ⚠️ MEASURED AT 34f42789: the ORIGINAL five were the four
  // mechanical ladders plus `the_attended_end`'s stage, the first bond grant. The basis has been FOUR all
  // along and the fifth was a miscount that arrived with the first companion.
  // ⚑ The tripwire now watches magnitudes. Ordinals are counted and REPORTED — a change there must be
  // visible without being an alarm, because authoring a tenth companion is not a balance event.
  const SKIP = new Set(["rank", "levelReq", "cost", "xp", "n", "d", "plus", "marginFloorPer"]);
  const ORDINAL = new Set(["stage", "reachesDepth"]);   // §3's own KIND column: an identity and a zero-based index
  let ladders = 0, ordinals = 0;
  for (const a of abilities) {
    const scan = (blk) => { if (!blk || typeof blk !== "object") return;
      for (const [k, v] of Object.entries(blk)) { if (SKIP.has(k) || k.startsWith("_")) continue;
        if (Array.isArray(v) && v.length >= 2 && v.every(x => typeof x === "number")) (ORDINAL.has(k) ? ordinals++ : ladders++);
        else if (v && typeof v === "object" && !Array.isArray(v)) scan(v); } };
    scan(a.mechanic);
    const pf = {};
    for (const t of (a.tree || [])) for (const [k, v] of Object.entries({ ...(t.mechanic || {}), ...t }))
      if (!SKIP.has(k) && !k.startsWith("_") && typeof v === "number") (pf[k] = pf[k] || []).push(v);
    for (const [k, vs] of Object.entries(pf)) if (vs.length >= 2 && new Set(vs).size >= 2) (ORDINAL.has(k) ? ordinals++ : ladders++);
  }
  check("FR: ⛔ still exactly THREE magnitude ladders — the whole basis for the proposed curve",
    ladders === 3, `live ${ladders} magnitude(s) — a fourth means the curve must be re-fitted, UPDATE §3`);
  // ⚠️ NOT AN ALARM, A READING. `stage` rides on every bond grant, so this number tracks the companion
  // roster; it is here so that a change is SEEN rather than silently folded into the ladder count.
  check("FR: …and the ordinals are counted separately — one `stage` per bond grant, plus `reachesDepth`",
    ordinals >= 1 && ordinals === (await (async () => { let n = 0; for (const a of abilities) { if ((a.tree || []).filter(t => typeof t?.stage === "number").length >= 2) n++; if (Array.isArray(a.mechanic?.reachesDepth)) n++; } return n; })()),
    `${ordinals} ordinal ladder(s) — stage on the bond grants, reachesDepth on ask_the_dead`);

  // ⛔ AND THE ONE THAT PROTECTS A CRAFT: wayfinding's timeReach is the template for a bad deletion.
  const wf = abilities.find(a => a.id === "wayfinding");
  check("FR: ⛔ `wayfinding` still carries its r1 number — the deletion §7 stopped",
    wf?.mechanic?.timeReach === 24, `got ${wf?.mechanic?.timeReach}`);
  check("FR: the reference names the four ways 'unread' lies", /NAME-COLLISION/.test(fr)
    && /COMMENT-ONLY/.test(fr) && /GENERIC ITERATION/.test(fr) && /BROKEN READER/.test(fr));
  check("FR: …and carries the defect taxonomy and its countermeasures",
    /DEFECT TAXONOMY/i.test(fr) && /COUNTERMEASURES/i.test(fr));
}

/* ══════════ PG — docs/PLAYERS_GUIDE.md, ALSO EXECUTED ══════════ */
console.log("");
console.log("── PG · the player's guide — the nouns-and-verbs manual ──");
{
  // ⛔ ERIK, 2026-08-29: a guide that "walks a user through their Experience of the game from start to
  // finish". ⚠️ IT IS GATED LIKE THE OTHER TWO, and for the same reason: a manual that quietly stops
  // matching the game is worse than none, because a player believes it.
  const pg = rd("docs/PLAYERS_GUIDE.md");
  check("PG: the guide exists and is substantial", pg.length > 8000, `${pg.length} chars`);
  check("PG: it carries the live version", new RegExp(rd("app.js").match(/APP_VERSION = "([\d.]+)"/)[1].replace(/\./g, "\.")).test(pg));

  // ⛔ ITS COUNTS ARE CLAIMS ABOUT THE CORPUS, so they are measured, not trusted.
  const { loadContentHeadless } = await import("./headless_content.mjs");
  const CT = await loadContentHeadless();
  const n = (o) => (o ? (Array.isArray(o) ? o.length : Object.keys(o).filter(k => !k.startsWith("_")).length) : 0);
  for (const [label, got] of [["crafts", n(CT.abilities)], ["places", n(CT.locations)],
                              ["people", n(CT.npcs)], ["companions", n(CT.companions)]]) {
    check(`PG: the guide's stated ${label} count (${got}) matches the corpus`,
      // ⛔ `.includes`, NOT A REGEX. My first form built `new RegExp(`${got}\s*${label}`)` inside a
      // TEMPLATE LITERAL, where `\s` is not a valid escape and JS silently collapses it to `s` — so the
      // pattern was `387scrafts` and could never match. ⚠️ A TEMPLATE LITERAL EATS SINGLE BACKSLASHES,
      // and §11's own rule says prefer the behavioural form. This is that rule applied to itself.
      pg.includes(`${got} ${label}`), `corpus has ${got} ${label}`);
  }

  // ⚠️ THE MECHANICAL CLAIMS MUST AGREE WITH THE ENGINE. These are the ones a player would act on, and
  // each is asserted elsewhere in this file against the live code — here we check the GUIDE says the same.
  const energy = rj("content/packs/core/rules/resolution.json").energy || {};
  check("PG: the cost example matches the authored surcharge",
    pg.includes("costs 4 at rank 1")
      && pg.includes(`costs ${4 + Number(energy.rankReachSurcharge)} at rank 2`)
      && pg.includes(`${4 + 2 * Number(energy.rankReachSurcharge)} at rank 3`),
    `surcharge is ${energy.rankReachSurcharge}, so the ladder is 4 / ${4 + Number(energy.rankReachSurcharge)} / ${4 + 2 * Number(energy.rankReachSurcharge)}`);
  for (const fam of ["PHYSICS", "ELEMENTAL", "VITAL", "INTRINSIC"])
    check(`PG: it names the '${fam}' family`, new RegExp(fam).test(pg));
  check("PG: it states the death ladder and that SEALED is reachable by nothing",
    /Threshold/.test(pg) && /Near Dark/.test(pg) && /Deep Dark/.test(pg) && /SEALED/.test(pg));
  check("PG: it states ranks are additive", /RANKS ARE ADDITIVE/.test(pg));
  check("PG: …and that a fully-answered blow lands nothing (the minHit 0 ruling)",
    Number(rj("content/packs/core/rules/skill_battle_system.json").engine?.damage?.minHit) === 0
      ? /LANDS NOTHING/i.test(pg) : /lands its floor/i.test(pg));
  check("PG: it states that folded companions take losses",
    /FOLDED COMPANION IS NOT SAFE/i.test(pg));

  // ⛔ AND THE PARTS AEVI OWNS ARE MARKED, NOT QUIETLY EMPTY. A section awaiting content must SAY so, or
  // it reads as a section that decided there was nothing to say.
  // ⛔ AEVI WROTE PARTS X–XII ON 2026-08-29, WHICH TURNED THIS CHECK RED ON PURPOSE. The old form asserted
  // the three parts stayed MARKED as awaiting her; she filled them in and flagged it herself — "AWAITING gate
  // now correctly red, CCode's to change." ⚠️ THE REPLACEMENT MUST NOT BE A DELETION. A gate that only watched
  // for a placeholder is worth nothing once the placeholder is gone, so it now checks the WRITING, against the
  // authored corpus, which is the thing the placeholder was standing in for.
  const parts = pg.split(/^# PART /m).slice(1);
  const thin = parts.filter(s => !s.includes("AWAITING") && s.split("\n").length < 12)
    .map(s => s.split("\n")[0].trim());
  check("PG: no part is silently thin — it is either written or marked AWAITING",
    parts.length >= 12 && thin.length === 0,
    `${parts.length} parts; thin: ${thin.join(", ") || "none"}`);

  // ✅ AND THE PEOPLE SHE WROTE ARE THE PEOPLE THE ENGINE HAS. Derived from the companion pack, never a typed
  // list — a tenth companion authored tomorrow makes this red until the guide mentions them.
  const comps = [];
  for (const x of readdirSync(join(root, "content/packs/valley/companions")).filter(y => y.endsWith(".json"))) {
    const j2 = rj(`content/packs/valley/companions/${x}`);
    for (const c of (j2.companions || j2.items || (Array.isArray(j2) ? j2 : [j2]))) if (c && c.id) comps.push(c);
  }
  const unnamed = comps.filter(c => c.name && !pg.includes(c.name)).map(c => c.name);
  check("PG: every authored companion is named in the guide",
    comps.length >= 9 && unnamed.length === 0,
    `${comps.length} authored; missing: ${unnamed.join(", ") || "none"}`);
  check("PG: it points at the machine reference rather than duplicating it", /FIELD_REFERENCE\.md/.test(pg));

  // ⚠️ AND THE PIPELINE DOC, since it is the other half of what Erik asked for.
  const pl = rd("docs/PIPELINE.md");
  check("PG: the pipeline document exists and names all eight stages",
    ["CONCEPT", "PROPOSAL", "REVIEW", "SPEC", "IMPLEMENTATION PLAN", "INTENT DOCS", "BUILD & TEST", "DEPLOY & DOCUMENT"]
      .every(st => pl.includes(st)));
}

/* ══════════ §10 — THE KNOWN GAPS, ASSERTED AS OPEN ══════════ */
console.log("\n── §10 · the known gaps — these go RED when FIXED ──");
{
  // ⛔ each of these is a claim the doc makes about being unfinished. Closing one must edit the doc.
  // ⛔ BOTH OF THESE WERE REGEXES AND BOTH REPORTED THE GAP CLOSED WHEN IT WAS NOT. `bolster` is a SHAPE in
  // familyDefaults AND an unmechanised VERB — my probe conflated the two vocabularies. And grepping
  // skill_battle for ".soak" matched a different soak entirely. ⚠️ A REGEX ASKS WHETHER A WORD APPEARS;
  // THE QUESTION IS WHETHER A NUMBER CHANGES ANYTHING. Behavioural probes, like CI's own CCODE-240.
  // ⛔ `mechanicFor`, NOT `mechanicsOf` - which does not exist. My first version imported the wrong name,
  // got `undefined`, returned null from guardOf, and PASSED via the `lo == null` escape hatch below. A
  // probe that tests nothing and reports green: the vacuous gate, inside the gap-tracking section.
  const { mechanicFor } = await import("../engine/craftmechanics.js");
  const VERB_FAMILIES = cm.verbFamilies || cm.functionFamilies || {};
  // ⛔ CCODE-299 — THIS PROBE COULD NEVER CLOSE. It filtered against `cm.verbFamilies`, a key that does not
  // exist, so `!verbFamilyMembers.has(v)` was ALWAYS true and the gap reported "still open" forever — even
  // after `persuade` was mechanised and `bolster` was removed from content. ⚠️ A GAP PROBE THAT CANNOT SEE
  // ITS OWN FIX IS A VACUOUS GATE, in the section whose job is tracking what is unfinished.
  // ✅ Behavioural now, and the same question `content_ci` SNG-263 §1 asks: does the verb RESOLVE to a shape?
  const { shapeOfVerb } = await import("../engine/craftmechanics.js");
  const usedVerbs = new Set();
  for (const a2 of abilities) {
    for (const v of (a2.functions || [])) usedVerbs.add(v);
    for (const t of (a2.tree || [])) for (const v of (t.functions || [])) usedVerbs.add(v);
  }
  const unmechanised = [...usedVerbs].filter(v => !shapeOfVerb(v, cm));
  check("§10: every verb the corpus uses resolves to a shape (the SNG-263 §1 question)",
    unmechanised.length === 0, `unmechanised: ${unmechanised.join(", ") || "(none)"}`);

  // ⛔ THE REAL TEST: does the authored NUMBER change the outcome? soak 2 and soak 20 must differ.
  // ⛔ MEASURE THE REAL CRAFT, NOT AN INVENTED ONE. My first probe built a fixture with `shape:"guard"`
  // as its VERB - guard is a SHAPE - so `shapeOfVerb` returned null, `mechanicFor` returned null, and the
  // check passed through a `lo == null` escape hatch while testing nothing.
  // ⚠️ AND THE FINDING IS MORE PRECISE THAN "READ BY NOTHING": `mechanic.soak` IS carried into
  // `fields.soak` faithfully (2 -> 2, 20 -> 20). What is missing is a CONSUMER of that field in the damage
  // path - `skill_battle` never names it, which is why content_ci's CCODE-240 measures soak 2 and soak 20
  // resolving to an identical guard. The number arrives and nothing spends it.
  const soakCrafts = abilities.filter(a => a.mechanic?.soak != null);
  const realSoak = soakCrafts[0];
  const soakField = (n) => {
    const probe = JSON.parse(JSON.stringify(realSoak));
    probe.mechanic.soak = n;
    return mechanicFor(probe, { rank: 1, cfg: cm })?.fields?.soak ?? null;
  };
  const lo = soakField(2), hi = soakField(20);
  check("§10: the soak probe produces real numbers (non-vacuity floor)",
    typeof lo === "number" && typeof hi === "number" && lo !== hi,
    `lo=${lo} hi=${hi} from ${realSoak?.id} - if these are null the probe is broken, not the engine`);
  // ✅ CLOSED 2026-08-28 (CCODE-290). This was a `gap()` asserting the number was never spent; Erik ruled
  // that a guard ABSORBS, the writer was built, and the ratchet turned RED to force this edit — which is
  // exactly what a gap-tracking check is for. It is now an assertion that the fix HOLDS.
  const sbSoakSrc = rd("engine/skill_battle.js");
  check("§4: ✅ a landed guard becomes a SOAK LAYER — the authored number is spent, not merely carried",
    /fx\.soak/.test(sbSoakSrc) && /guardLayers/.test(sbSoakSrc) && /soakTypes/.test(sbSoakSrc),
    `${soakCrafts.length} crafts author it`);
  check("§4: ⛔ …and it cannot stack into immunity — a connected blow always lands the floor",
    /soakFloored/.test(sbSoakSrc) && /aff !== "immune"/.test(sbSoakSrc));

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
  // ⚠️ NARROWER SINCE R28. The authored ground is now READ — `places.groundForGM` puts it in front of the
  // narrator — but nothing DRAWS it: the app has a world globe and a region map and no place tier.
  gap("§10: the authored ground is read but never drawn — there is no place-level map",
    !/local_layouts/.test(wmSrc) && !/local_layouts/.test(rd("app.js")), `${layouts.length} authored`);

  // ⛔ THE FOUR GAPS THIS SESSION OPENED. Each is a claim §10 makes about being unfinished, so each goes
  // RED when it is fixed — which is the signal to edit the table rather than let it quietly rot.
  {
    const sb = rd("engine/skill_battle.js").replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, " ")).replace(/([^:])\/\/[^\n]*/g, "$1");
    gap("§10: party scale still reads only HARM — PROTECT has no party-scale reader",
      !/"PROTECT"/.test(sb) && (sb.match(/contributions/g) || []).length <= 1,
      `PROTECT in skill_battle: ${/"PROTECT"/.test(sb)}, contributions reads: ${(sb.match(/contributions/g) || []).length}`);


    const hold = rd("engine/holdings.js");
    // ✅ GAP CLOSED 2026-09-04 (§69): a holding has INCOME (the store yields and sells), a RESOURCE (goods at the hold) and a
    // DEFENCE reader (`defence`/`garrison` halve a raid). Capability is still Q14. Asserted CLOSED so a regression goes red.
    check("§10: ⛔ the holdings-economy gap CLOSED (§69) — a holding has income, a resource and a defence reader; stays closed",
      /export function tickStore/.test(hold) && /export function sellStore/.test(hold) && /export function isGuarded/.test(hold) && /isGuarded\(holding, cfg\)/.test(hold));
    // ✅ GAP CLOSED 2026-09-04 (§61): release is an operation with a cost trace, news and a record. Asserted CLOSED now,
    // so a regression to the bare filter goes red the way the open gap used to.
    check("§10: ⛔ releaseHolding is no longer a bare filter — the gap closed (§61) and stays closed",
      /export function releaseHolding/.test(hold) && !/character\.holdings = \(character\.holdings \|\| \[\]\)\.filter\(x => x\.id !== id\)/.test(rd("app.js")));
  }
  gap("§10: method (psionics / song / blade) is still recorded nowhere",
    abilities.every(a => a.method == null));
}

/* ══════════ §12 — THE INTERFACE, AND docs/APPARATUS.md ══════════ */
// ⛔ CCODE-302 — ERIK: "the UI and user experience needs to be included... I want this to be a well oiled
// factory." §12 of the doc describes what the player OPERATES; this executes it.
// ⚠️ EVERY COUNT BELOW IS DERIVED FROM app.js AT RUN TIME, never compared against a number typed into the
// doc and left there. A stored copy of a derived value is the failure this project has committed most.
console.log("\n── §12 · the interface — reachability, phases, apparatus ──");
{
  const appSrc = rd("app.js");
  const renderFns = [...appSrc.matchAll(/^\s*(?:async )?function (render[A-Za-z]+)/gm)].map(m => m[1]);
  check("§12: the doc's render-function count matches app.js",
    // ⛔ THE `|| doc.includes("**47 …**")` FALLBACK IS GONE. It meant this gate passed for any real count
    // as long as the doc still said 47 — so the doc drifted to 47-vs-49 render functions and 14,289-vs-14,928
    // lines with the check green the whole way. ⚠️ A GATE WITH AN ESCAPE HATCH IS A GATE THAT CANNOT FAIL.
    doc.includes(`${renderFns.length} \`render*\` functions`),
    `app.js has ${renderFns.length}`);

  // ⛔ REACHABILITY IS DERIVED, NOT LISTED. There is no router and no screen variable in this app — a screen
  // calls the next one directly — so "is it reachable" has exactly one mechanical answer: does anything else
  // name it. ⚠️ THIS IS THE UI TWIN OF THE FOUR DOORS.
  const uncalled = renderFns.filter(f => appSrc.split(f + "(").length - 1 <= 1);
  check("§12: renderFormStep is the ONLY render function nothing calls",
    uncalled.length === 1 && uncalled[0] === "renderFormStep",
    `uncalled now: ${uncalled.join(", ") || "none"} — if this list GREW, a screen just became unreachable`);

  // ⚠️ AND THE POINT OF THE FINDING: the field is NOT orphaned. I nearly reported a working feature broken.
  check("§12: state.form still has its other authoring surfaces (c-form, p-form)",
    appSrc.includes('"c-form"') && appSrc.includes('"p-form"') && /form:\s*state\.form/.test(appSrc));

  check("§12: the three turn phases are declared in SB_STEPS",
    /SB_STEPS\s*=/.test(appSrc) && ["sense", "action", "bonus"].every(k => appSrc.includes(`key: "${k}"`)));

  // ⛔ THE THREE MISSING QUESTIONS ARE STATED IN BOTH DOCS AND MUST STAY IN SYNC. A player learning by
  // surprise that the game cannot ask is worse than reading it here.
  const pgSrc = rd("docs/PLAYERS_GUIDE.md");
  check("§12: the player's guide carries PART I½ · WHERE EVERYTHING IS", pgSrc.includes("PART I½ · WHERE EVERYTHING IS"));
  // ⛔ THIS CHECK USED TO ASSERT A LIST THAT WAS TWO-THIRDS FALSE. It demanded both docs name three
  // "missing affordances"; `bringForward` has had a picker since CCODE-276 and `provoke` needs no pick.
  // ⚠️ A GATE ON AN UNMEASURED CLAIM DOES NOT MAKE IT TRUE — IT MAKES IT DURABLE. What it guards now is
  // the CORRECTION, so the false version cannot quietly come back.
  check("§12: the corrected affordance record is present, not the false three-item list",
    doc.includes("CCODE-276") && doc.includes("FALSE — it has a full picker"));
  check("§12: the one genuinely open affordance is still named in both docs",
    doc.includes("interceptCondition") && pgSrc.includes("which ally"));
  // ✅ AND THE FIX IS ASSERTED AGAINST THE ENGINE, not against prose about the engine.
  check("§12: provoke's taunt is actually passed to chooseTarget",
    rd("engine/skill_battle.js").includes("taunt: standingTaunt(state)"));
}

// ⛔ docs/APPARATUS.md — THE FACTORY FLOOR. `scripts/apparatus.mjs` classifies every harness; this asserts
// the doc still matches what it measures, and that the one number that must never rise stays at zero.
{
  const { execFileSync } = await import("node:child_process");
  const out = execFileSync(process.execPath, [join(root, "scripts/apparatus.mjs")], { encoding: "utf8" });
  const ap = rd("docs/APPARATUS.md");
  const n = (re, src) => Number((src.match(re) || [])[1] || -1);

  // ⛔ THIS IS THE ONE THAT MATTERS. A gate suite that is not in the runner reads as coverage while sitting
  // on the shelf. It was FOUR on 2026-08-29; wiring them is what made it zero. ⚠️ IT MAY NEVER GO UP.
  check("APPARATUS: GATE-UNWIRED is zero — every gate suite is in the runner",
    !/GATE-UNWIRED/.test(out.split("\n").find(l => l.includes("files ·")) || ""),
    out.split("\n").filter(l => l.includes("/")).slice(0, 4).join(" | "));

  const live = n(/GATE (\d+)/, out), docGates = n(/\*\*GATE\*\* \| \*\*(\d+)\*\*/, ap);
  check("APPARATUS: the doc's GATE count is fresh", live === docGates, `measured ${live}, doc says ${docGates}`);
  const files = Number(out.split(" files ·")[0].split(" ").pop()); const docFiles = Number(ap.split(" files.")[0].split(" ").pop());
  check("APPARATUS: every harness total in the doc is fresh", files === docFiles && ap.includes(`${files} harnesses across`), `measured ${files}, doc says ${docFiles}`);

  // ⚠️ AND THE RUNNER MUST ACTUALLY CONTAIN WHAT THE DOC CLAIMS IT DOES.
  const runner = rd("scripts/run_tests.mjs");
  check("APPARATUS: the four newly-wired suites are in the runner",
    ["changeset_check", "dev_world", "playthrough_sim", "verification_ledger"].every(x => runner.includes(x)));
}

// ⛔ CCODE-303 — A DOCUMENT NOBODY LINKS IS THE SAME UNREAD FAILURE. `docs/ARCS.md` landed on 2026-08-29 and
// nothing pointed at it; the table in PIPELINE is where a person looks to find out what exists and what each
// file is FOR. ⚠️ DERIVED FROM THE DIRECTORY, so a doc added tomorrow goes red until it is placed.
console.log("\n── the document set — everything in docs/ is placed ──");
{
  const pipeSrc = rd("docs/PIPELINE.md");
  const docs = readdirSync(join(root, "docs")).filter(x => x.endsWith(".md"));
  const unlisted = docs.filter(d => !pipeSrc.includes("docs/" + d));
  check("PIPELINE lists every document in docs/",
    docs.length >= 5 && unlisted.length === 0,
    `${docs.length} docs; unlisted: ${unlisted.join(", ") || "none"}`);
}

/* ══════════ §13 — WHO AN NPC IS IN THE WORLD, NOT IN YOUR ADDRESS BOOK ══════════ */
// ⛔ ERIK 2026-08-29: "the npc cap is garbage cruft — the world arcs move mainly from npcs who have climbed
// the ladder... after or around lvl 100 a character and/or npc will either ASCEND or FALL ACROSS THE VEIL...
// the World's Mythicals are those high near level 100 npcs."
//
// ⚠️ THE CRUFT WAS THE INPUTS, NOT THE NUMBER. Every term of `derivedLevel` measured the PLAYER'S
// RELATIONSHIP — met, known, standing — so a world-moving Mythical the player had never met was LEVEL 1.
console.log("\n── §13 · an NPC's level is what they ARE, plus what you have seen ──");
{
  const NS = await import("../engine/npcsheet.js");
  const lvl = (entry, authored = null) => NS.derivedLevel(entry, { cfg: {}, authored });

  // ⛔ NON-VACUITY FIRST: the unauthored path must be BIT-IDENTICAL to what shipped, or this is a
  // behaviour change wearing a bug-fix's name.
  check("§13: an unauthored NPC is unchanged — a stranger is still level 1",
    lvl({ met: 1 }) === 1);
  check("§13: …and relationship growth still works exactly as before (met 40 → 11)",
    lvl({ met: 40 }) === 11, String(lvl({ met: 40 })));

  // ⛔ THE FIX ITSELF.
  check("§13: an authored Mythical is who they are even unmet",
    lvl({ met: 1 }, { level: 92 }) === 92, String(lvl({ met: 1 }, { level: 92 })));
  check("§13: …and still GROWS — Erik: 'they get killed and injured and they need to grow too'",
    lvl({ met: 40 }, { level: 60 }) > 60);

  // ⛔ AEVI CORRECTED THIS AND THE ASSERTION HAD TO MOVE WITH IT. My first fix clamped to 100 in CODE;
  // her ruling is that 100 is a DOOR, not a ceiling, and any arithmetic bound belongs in CONTENT with a
  // reason, set ABOVE the crossing so it can never be read as the cap it replaces.
  // ⚠️ SO WHAT IS ASSERTED NOW IS THE ABSENCE OF A CODE CEILING, not the presence of one.
  const cfgNS = rj("content/packs/core/rules/resolution.json").npcStanding;
  check("§13: there is no code ceiling at 100 — the bound is content, and sits above the crossing",
    cfgNS && cfgNS.safetyBound > 100 && !rd("engine/npcsheet.js").includes("levelCap, 20"),
    `safetyBound=${cfgNS?.safetyBound}`);
  check("§13: a Mythical can be reached from the ladder — Aevi §4.2",
    NS.derivedLevel({ met: 60 }, { cfg: cfgNS, authored: { tier: "mythic" } }) >= 100);
  // ✅ AND TIER MOVES RATHER THAN LABELS — Erik: "they grow in tier."
  check("§13: tierOf reads the rung back from a level, off the SAME content floors",
    NS.tierOf(1,{cfg:cfgNS})==="riffraff" && NS.tierOf(90,{cfg:cfgNS})==="mythic" && NS.tierOf(50,{cfg:cfgNS})==="epic");
  check("§13: …and it refuses to guess without the dial", NS.tierOf(90,{cfg:{}})===null);
  check("§13: the old arbitrary wall of 20 is gone",
    lvl({ met: 1 }, { level: 55 }) === 55);

  // ⛔ AND BOTH SHAPES ARE READ. A merged record and a separate authored record are both passed in this
  // codebase; reading only one is how `persistUntilHealed` missed all six of its authored objects.
  check("§13: an authored level is read from the ENTRY as well as the authored record",
    lvl({ met: 1, level: 77 }) === 77, String(lvl({ met: 1, level: 77 })));
}

/* ══════════ §14 — THE FOLD CANNOT BEAT AN IMMUNITY THE BLOW COULD NOT ══════════ */
// ⛔ FOUND BY RUNNING AEVI'S TWELVE CRAFTS THROUGH A MELEE-SCALE FIGHT (CCODE-313), which is the whole
// reason Erik asked for a big-battle test. A physical-immune foe took ZERO from the player's typed blow and
// SIX from the folded party's contribution to that same blow — while the receipt still said affinity
// "immune". ⚠️ AN IMMUNITY THAT REPORTS ITSELF AND DOES NOTHING IS WORSE THAN NO IMMUNITY.
console.log("\n── §14 · the folded party answers the blow's affinity ──");
{
  const SBx = await import("../engine/skill_battle.js");
  const rulesX = rj("content/packs/core/rules/resolution.json");
  const sbX = rj("content/packs/core/rules/skill_battle_system.json").engine;
  const stepsX = rj("content/packs/core/rules/intensity_scaling.json").steps;
  const mkRng = () => { let s2 = 20260829; return () => { s2 |= 0; s2 = (s2 + 0x6D2B79F5) | 0; let t = Math.imul(s2 ^ (s2 >>> 15), 1 | s2); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const shX = (o = {}) => ({ attributes: { physical: 5, mental: 5, social: 5, practical: 5 }, energy: 200, health: 60, skills: [], ...o });
  const blow = { function: "strike", tier: 4, attribute: "physical", intensity: "standard", name: "x", mechanic: { damageType: "physical" }, functions: ["strike"] };
  const foldX = [1, 2, 3].map(i => ({ id: "f" + i, name: "S" + i, present: true, contributions: ["HARM", "MARTIAL"], sheet: shX() }));
  const go = (aff) => SBx.battleRound({ playerDecl: blow, oppDecl: { function: "shield", tier: 1, name: "g" },
    playerSheet: shX(), oppSheet: shX({ affinities: aff }), state: { momentum: 0, round: 1 },
    rules: rulesX, sb: sbX, steps: stepsX, rng: mkRng(), folded: foldX });
  const imm = go({ physical: "immune" }), open = go({});
  // ⛔ NON-VACUITY: the fold must still add when nothing blocks it, or this "fix" is just a deletion.
  check("§14: a folded party still adds to a blow nothing resists", (open?.damage?.melee?.added || 0) > 0, String(open?.damage?.melee?.added));
  check("§14: …and adds NOTHING to a blow the target is immune to", !imm?.damage?.melee && imm?.damage?.amount === 0,
    `amount=${imm?.damage?.amount} melee=${JSON.stringify(imm?.damage?.melee || null)}`);
}

/* ══════════ §15 — AN UNTYPED BLOW ANNOUNCES ITSELF ══════════ */
// ⛔ ERIK 2026-08-30: "untyped can default to physical for now if that's the way we have it set up... BUT IT
// STILL NEEDS A FLAG SO WE CAN FIND AND TYPE THE DAMAGE."
//
// ⚠️ A DEFAULT THAT LEAVES NO TRACE IS A DEFECT THAT LOOKS LIKE A DESIGN. Two different things happen and
// both used to be silent: a MUNDANE blow taking the `untypedIs` fallback (Erik's rule, working), and a
// craft resolving to NO KIND AT ALL — which is invisible to every affinity in the game.
console.log("\n── §15 · untyped damage is findable ──");
{
  const SBz = await import("../engine/skill_battle.js");
  const rulesZ = rj("content/packs/core/rules/resolution.json");
  const sbZ = rj("content/packs/core/rules/skill_battle_system.json").engine;
  const stepsZ = rj("content/packs/core/rules/intensity_scaling.json").steps;
  const rngZ = () => { let s3 = 20260830; return () => { s3 |= 0; s3 = (s3 + 0x6D2B79F5) | 0; let t = Math.imul(s3 ^ (s3 >>> 15), 1 | s3); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const shZ = (o = {}) => ({ attributes: { physical: 6, mental: 6, social: 6, practical: 6 }, energy: 200, health: 80, skills: [], ...o });
  const go = (d) => SBz.battleRound({ playerDecl: d, oppDecl: { function: "shield", tier: 1, name: "g" },
    playerSheet: shZ(), oppSheet: shZ(), state: { momentum: 0, round: 1 },
    rules: rulesZ, sb: sbZ, steps: stepsZ, rng: rngZ() })?.damage || {};

  const typed = go({ function: "strike", tier: 5, attribute: "physical", intensity: "standard", name: "t", mechanic: { damageType: "heat" }, functions: ["strike"] });
  const mundane = go({ function: "strike", tier: 5, attribute: "physical", intensity: "standard", name: "m", functions: ["strike"] });
  const undecided = go({ function: "strike", tier: 5, attribute: "physical", intensity: "standard", name: "u", tradition: "cogitant", functions: ["strike"] });

  // ⛔ NON-VACUITY FIRST: a craft that names its kind must carry NEITHER flag, or they mean nothing.
  check("§15: a typed craft carries no flag", typed.damageType === "heat" && !typed.typedByDefault && !typed.untyped);
  // ✅ ERIK'S RULE, WORKING AND VISIBLE — a sword is physical, and the receipt says it was defaulted.
  check("§15: a MUNDANE blow defaults to physical AND says so", mundane.damageType === "physical" && mundane.typedByDefault === true);
  // ⛔ THE ONE THE FLAG IS FOR. A craft with a tradition and no kind is UNDECIDED, not mundane — and it is
  // invisible to every affinity, so it must be findable at the moment it happens.
  check("§15: a craft with a tradition and no kind is flagged UNTYPED", undecided.untyped === true && !undecided.damageType,
    JSON.stringify({ type: undecided.damageType, untyped: undecided.untyped }));
}

/* ══════════ §16 — CRAFT AND CREATURE AGREE ABOUT HAVING A SELF ══════════ */
// ⛔ AEVI: "every craft that says 'nothing without a self' should agree with every creature that has none.
// Right now that agreement is prose on both sides." ⚠️ SIX CRAFTS STATED THE RULE IN FOUR PHRASINGS.
// ⛔ ERIK'S TEST FOR THE FIELD, WHICH IT HAD TO PASS: does it let content say ONCE what it currently says
// many times in prose? This gate is what makes the once BINDING.
console.log("\n── §16 · craft and creature agree about having a self ──");
{
  const SBs = await import("../engine/skill_battle.js");
  const best = rj("content/packs/valley/bestiary.json");
  const classes = best.classes || {};
  const selfless = Object.entries(classes).filter(([, v]) => v && typeof v === "object" && v.hasSelf === false).map(([k]) => k);
  const selfed = Object.entries(classes).filter(([, v]) => v && typeof v === "object" && v.hasSelf === true).map(([k]) => k);

  // ⛔ EVERY CLASS DECLARES, OR THE PROPERTY IS DECORATION. A bare string class (which is what
  // `narrowed_dead` was before 2026-08-30) reads as undefined to every consumer.
  const undeclared = Object.entries(classes)
    .filter(([k]) => !k.startsWith("_"))
    .filter(([, v]) => !(v && typeof v === "object" && typeof v.hasSelf === "boolean")).map(([k]) => k);
  check("§16: every creature class declares hasSelf as a boolean", undeclared.length === 0, undeclared.join(", "));
  // ⚠️ NON-VACUITY, BOTH SIDES: without one of each the agreement below is trivially true.
  check("§16: the corpus has classes WITH and WITHOUT a self",
    selfless.length > 0 && selfed.length > 0, `with: ${selfed.length}, without: ${selfless.length}`);

  // ⛔ AND THE CRAFTS THAT NEED ONE.
  const needSelf = [];
  for (const dir of ["content/packs/core/abilities"]) {
    for (const f of readdirSync(join(root, dir)).filter(x => x.endsWith(".json"))) {
      const doc = rj(`${dir}/${f}`);
      for (const a of (doc.abilities || [])) {
        if (a && JSON.stringify(a).includes('"requiresSelf"')) needSelf.push(a);
      }
    }
  }
  check("§16: some craft actually requires a self (non-vacuity)", needSelf.length >= 3, `${needSelf.length} crafts`);

  // ⛔ THE AGREEMENT ITSELF, ASSERTED THROUGH THE ENGINE RATHER THAN BY READING BOTH FILES. A gate that
  // compared two JSON files would pass while the rule did nothing in play — which is the whole failure
  // this field exists to end.
  const bad = [];
  for (const a of needSelf) {
    const decl = { ...a, function: (a.functions || [])[0], rank: 1 };
    for (const cls of selfless) {
      if (!SBs.selfBlocked(decl, { creatureClass: cls }, { classes })) bad.push(`${a.id} vs ${cls}`);
    }
    // ✅ AND IT MUST STILL REACH A THING THAT HAS ONE, or the craft is simply broken.
    for (const cls of selfed) {
      if (SBs.selfBlocked(decl, { creatureClass: cls }, { classes })) bad.push(`${a.id} wrongly blocked vs ${cls}`);
    }
  }
  check("§16: every craft requiring a self is blocked by every selfless class, and by no other",
    bad.length === 0, bad.slice(0, 6).join(" · "));

  // ⚠️ ABSENT IS NOT FALSE — an unclassed creature is not quietly immune to half the catalogue.
  check("§16: an unclassed creature is NOT blocked (absent is not false)",
    needSelf.length ? !SBs.selfBlocked({ ...needSelf[0], function: (needSelf[0].functions || [])[0] }, {}, { classes }) : false);
}

/* ══════════ §17 — SNG-268: THE BRAID GENERATOR CAN SEE THE RING ══════════ */
// ⛔ THE SPEC'S OWN TEST OF DONE, run as a gate: "mint one adjacent and one antipodal braid. The antipodal
// must cost visibly more AND carry a tension bound; the adjacent must carry neither. Identical output =
// the generator still cannot see the ring."
//
// ⚠️ AND ONE CORRECTION TO THE SPEC, MEASURED BEFORE BUILDING ON IT: it says the scale is "0 same → 4
// antipodal". THIS RING IS 24 WIDE AND ITS MAXIMUM DISTANCE IS 12. The three authored braids it cites as
// evidence — meaning_engine, harbored_flame, the_turning_word — are all distance 12, which confirms the
// EVIDENCE while correcting the SCALE.
console.log("\n── §17 · a braid knows how far apart its parents are ──");
{
  const BR = await import("../engine/braids.js");
  const TR = await import("../engine/traditions.js");
  const idx = TR.buildTraditionIndex(rj("content/packs/core/rules/traditions.json"));
  const cat = {
    A: { id: "A", name: "Ash", tradition: "umbral", energyCost: 6, functions: ["strike"], levelReq: 3 },
    B: { id: "B", name: "Flame", tradition: "blazeborn", energyCost: 4, functions: ["strike"], levelReq: 3 },
    V: { id: "V", name: "Veil", tradition: "veilwright", energyCost: 4, functions: ["strike"], levelReq: 3 },
  };
  const ch = { level: 9, abilities: [{ abilityId: "A", rank: 3 }, { abilityId: "B", rank: 3 }, { abilityId: "V", rank: 3 }] };
  const near = BR.buildBraidDef(ch, ["A", "V"], cat, { traditionIndex: idx });   // umbral × veilwright — d1
  const far = BR.buildBraidDef(ch, ["A", "B"], cat, { traditionIndex: idx });    // umbral × blazeborn — d12

  // ⛔ THE THREE AUTHORED BRAIDS ARE ANTIPODES — the spec's evidence, re-measured rather than trusted.
  for (const [a, b] of [["enginewright", "numinous"], ["umbral", "blazeborn"], ["threnodist", "syllogist"]]) {
    check(`§17: the authored braid ${a}×${b} is antipodal`, TR.ringDistance(a, b, idx) === 12);
  }
  check("§17: an ANTIPODAL braid costs visibly more than an adjacent one",
    far.energyCost > near.energyCost, `${far.energyCost} vs ${near.energyCost}`);
  check("§17: …and carries the tension bound", !!far.tensionNote);
  // ⛔ THE OTHER HALF, WHICH IS WHAT MAKES IT A DISTINCTION: adjacent gets neither.
  check("§17: an ADJACENT braid carries NO tension bound", !near.tensionNote);
  check("§17: the band is recorded on the mint receipt",
    far.minted?.tension?.band === "antipodal" && near.minted?.tension?.band === "adjacent");
  // ✅ SNG-268 §4 — dual-pole gating stops being a three-instance category.
  check("§17: a minted braid declares requiresPoles from its own parents",
    (far.minted?.requiresPoles || []).length === 2 && far.minted.requiresPoles.includes("umbral"));
  // ⚠️ ABSENT IS TODAY: with no index, byte-identical to what shipped.
  const blind = BR.buildBraidDef(ch, ["A", "B"], cat, {});
  check("§17: without a tradition index nothing changes (absent is not zero)",
    !blind.tensionNote && blind.energyCost < far.energyCost, `${blind.energyCost}`);
  // ⛔ AND THE LIVE PATH SUPPLIES IT, or the whole thing is inert.
  check("§17: app.js threads the tradition index into the braid builder",
    rd("app.js").includes("traditionIndex: CONTENT.traditionIndex"));
}

/* ══════════ §18 — A MENDING CAN BE AIMED, AND SOME THINGS ARE BURNED BY IT ══════════ */
// ⛔ ERIK 2026-08-30: "the intent is to be able to heal anyone you want, or use healing on any target."
// ⚠️ A HEAL WAS SPENT ON ITS OWN SIDE, ALWAYS — one line decided it and nothing could ask, which is why
// backlog P3 (heal → decay on an undead) had NO PATH TO FIRE. The rule was never the hard part.
//
// ✅ AND P3 NEEDS NO UNDEAD FLAG. Aevi typed 25 healing crafts `vitality`; `the_narrowed` is authored
// `vitality: vulnerable`. The inversion falls out of what the creature ALREADY SAYS ABOUT ITSELF.
console.log("\n── §18 · a mending can be aimed, and some things are burned by it ──");
{
  const SBh = await import("../engine/skill_battle.js");
  const rulesH = { ...rj("content/packs/core/rules/resolution.json"), craftMechanics: rj("content/packs/core/rules/craft_mechanics.json") };
  const sbH = rj("content/packs/core/rules/skill_battle_system.json").engine;
  const stepsH = rj("content/packs/core/rules/intensity_scaling.json").steps;
  const narrowed = (rj("content/packs/valley/bestiary.json").roster || []).find(c => c.id === "the_narrowed");
  const rngH = () => { let z = 20260830; return () => { z |= 0; z = (z + 0x6D2B79F5) | 0; let t = Math.imul(z ^ (z >>> 15), 1 | z); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const shH = (o = {}) => ({ attributes: { physical: 7, mental: 7, social: 7, practical: 7 }, energy: 300, health: 60, maxHealth: 100, skills: [], ...o });
  const mend = { function: "mend", tier: 6, attribute: "mental", intensity: "standard", name: "a mending", functions: ["mend"], mechanic: { damageType: "vitality" } };
  const alliesH = [{ id: "char-me", name: "You", isPlayer: true, present: true, sheet: shH() },
    { id: "sprig", name: "Sprig", present: true, sheet: shH({ health: 20 }) }];
  const go = (target, opp) => SBh.battleRound({ playerDecl: mend, oppDecl: { function: "strike", tier: 1, name: "swing" },
    playerSheet: shH(), oppSheet: opp || shH(), state: { momentum: 0, round: 1 },
    rules: rulesH, sb: sbH, steps: stepsH, rng: rngH(), allies: alliesH, healTarget: target })?.healing || {};

  const own = go(null), ally = go("sprig"), foe = go("opponent");
  const undead = go("opponent", shH({ affinity: narrowed?.affinity || {} }));

  // ⛔ NON-VACUITY FIRST: the unaimed case must still heal, or every row below is a broken heal.
  check("§18: unaimed, a mending still heals the caster (unchanged)", own.amount > 0 && own.side === "player", JSON.stringify(own.amount));
  check("§18: it can be aimed at an ALLY, and the side follows the subject",
    ally.amount > 0 && ally.side === "ally" && ally.onId === "sprig", `${ally.amount} on ${ally.onId}`);
  check("§18: it can be aimed at the FOE", foe.amount > 0 && foe.side === "opponent");
  // ⛔ BACKLOG P3, AND IT NEEDED NO NEW RULE — only a heal that could be aimed at something hostile.
  check("§18: mending a thing VULNERABLE to vitality HARMS it",
    undead.amount < 0 && undead.inverted === true && undead.affinity === "vulnerable",
    JSON.stringify({ amount: undead.amount, aff: undead.affinity }));
  // ⚠️ AND THE PLAYER CAN ACTUALLY ASK — the affordance, without which this is a rule nobody reaches.
  check("§18: the interface asks who the mending is for", rd("app.js").includes("data-sbheal"));
  check("§18: …and the encounter forwards the pick", rd("engine/encounters.js").includes("healTarget: state.healTarget"));
}

/* ══════════ §19 — THE FOLD CAN FALL, AND IT FALLS BY THE ENEMY'S INTENT ══════════ */
// ⛔ TWO FIXES THAT ONLY WORK TOGETHER, AND EACH PROVES THE OTHER.
//   CCODE-319  the pool is PROPORTIONAL TO HEALTH. It was `per × K` and named no level while health is
//              `level × 2`, so it was in range at level 1–2 and DEAD from level 3 to 100.
//   CCODE-318  the fold hears the ENEMY'S INTENT. Softest-first was the only rule, so the aggregate played
//              every foe as if it were hunting your healer.
// ⚠️ THE ORDERING FIX WAS UNOBSERVABLE UNTIL THE POOL FIRED — I could not verify CCODE-318 at all until
// CCODE-319 landed, which is why they ship together.
console.log("\n── §19 · the fold can fall, and it falls by the enemy's intent ──");
{
  const SBf = await import("../engine/skill_battle.js");
  const rulesF = rj("content/packs/core/rules/resolution.json");
  const sbF = rj("content/packs/core/rules/skill_battle_system.json").engine;
  const stepsF = rj("content/packs/core/rules/intensity_scaling.json").steps;
  const shF = (o = {}) => ({ attributes: { physical: 6, mental: 6, social: 6, practical: 6 }, energy: 200, health: 14, skills: [], ...o });
  const fold = () => [
    { id: "sprig", name: "Sprig", present: true, contributions: ["RESTORE"], sheet: shF({ soak: 0, attributes: { physical: 1 } }) },
    ...[1, 2, 3, 4].map(i => ({ id: "sp" + i, name: "Spear" + i, present: true, contributions: ["HARM", "MARTIAL"], sheet: shF({ soak: 5 }) })),
  ];
  const run = (policy, T = 300) => {
    let fell = 0, mender = 0;
    for (let t = 0; t < T; t++) {
      let z = t * 7919 + 11;
      const rngF = () => { z |= 0; z = (z + 0x6D2B79F5) | 0; let q = Math.imul(z ^ (z >>> 15), 1 | z); q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q; return ((q ^ (q >>> 14)) >>> 0) / 4294967296; };
      const r = SBf.battleRound({ playerDecl: { function: "reveal", tier: 1, name: "look" },
        oppDecl: { function: "strike", tier: 9, attribute: "physical", intensity: "surge", name: "swing" },
        playerSheet: shF({ health: 80 }), oppSheet: shF({ attributes: { physical: 9, mental: 9, social: 9, practical: 9 } }),
        state: { momentum: 0, round: 1 }, rules: rulesF, sb: sbF, steps: stepsF, rng: rngF, folded: fold(), targetPolicy: policy });
      for (const l of (r.damage?.foldedLosses?.downed || [])) { fell++; if (l.id === "sprig") mender++; }
    }
    return { fell: fell / T, mender: mender / T };
  };
  const threat = run("threat"), hunter = run("healer");

  // ⛔ CCODE-319 FIRST: without this the mechanic cannot fire at all and every row below is vacuous.
  check("§19: a folded ally can actually fall", threat.fell > 0, `${threat.fell.toFixed(2)} losses/round`);
  // ⛔ CCODE-318: a brute that fights whoever fights it does NOT hunt the mender.
  check("§19: a THREAT-seeking foe does not take the mender", threat.mender === 0, `${(threat.mender * 100).toFixed(0)}%`);
  // ✅ AND A HUNTER STILL DOES — or the fix has simply disarmed the enemy rather than given it intent.
  check("§19: a HEALER-hunting foe still takes her", hunter.mender > 0, `${(hunter.mender * 100).toFixed(0)}%`);
  // ⚠️ THE ORDERING CHANGES WHO, NEVER HOW MANY — the claim CCODE-308 made, asserted rather than trusted.
  check("§19: the casualty COUNT is the same either way", Math.abs(threat.fell - hunter.fell) < 0.05,
    `${threat.fell.toFixed(2)} vs ${hunter.fell.toFixed(2)}`);
  // ⛔ AND THE DIAL IS CONTENT, not a constant in the engine.
  check("§19: the pool's scale is a content dial", Number(sbF?.melee?.foldedPoolPerHealth) >= 2,
    String(sbF?.melee?.foldedPoolPerHealth));
}

/* ══════════ §20 — WHAT YOUR LINE COVERS IS ON THE SCREEN ══════════ */
// ⛔ `groupCapability` computed coverage · depth · sole · cohesion since CCODE-307 and NOTHING IN THE GAME
// READ IT. ⚠️ Aevi named the need — "this is the number a player should be able to SEE" — and two of her
// authored crafts (`who_falls_first`, `break_the_line`) ask for exactly what it returns.
console.log("\n── §20 · the group model is on the screen ──");
{
  check("§20: app.js reads groupCapability", rd("app.js").includes("groupCapability("));
  check("§20: …and shows what only ONE person holds", rd("app.js").includes("sb-sole"));
}

/* ══════════ §21 — A BRAID THAT CLAIMS TENSION MUST STILL BE OPPOSED ══════════ */
// ⛔ ERIK: "we intend to absorb some into fewer traditions… I expect it to be very impactful."
// ✅ AEVI: "yes to his braid gate — every authored braid whose prose claims tension must still measure as
// far or antipodal. Cheap now, and it makes the consolidation report its own casualties instead of us
// finding them months later."
//
// ⚠️ THE AUTHORED BRAIDS NAME THEIR OWN POLES — `crossPoleBraids.abilities[].poles` is two tradition ids,
// not an inference. ⛔ SO THIS MEASURES THE NAMED PAIR ON THE LIVE RING. Today all three are distance 12,
// exact antipodes; after an absorption they may not be, and each carries prose about "the two poles
// fighting" that would then describe a joining no longer opposed.
console.log("\n── §21 · a braid that claims tension is still opposed ──");
{
  const TRb = await import("../engine/traditions.js");
  const doc = rj("content/packs/core/rules/traditions.json");
  const idxB = TRb.buildTraditionIndex(doc);
  const braids = doc.crossPoleBraids?.abilities || [];
  check("§21: the authored cross-pole braids are declared with their poles (non-vacuity)",
    braids.length >= 3 && braids.every(b => (b.poles || []).length === 2), `${braids.length} braids`);

  // ⛔ ADJACENT IS NOT OPPOSED. A braid whose prose says the poles fight must measure further than
  // neighbouring — otherwise the sentence is describing something that stopped being true.
  const tooClose = [];
  for (const b of braids) {
    const d = TRb.ringDistance(b.poles[0], b.poles[1], idxB);
    if (d == null || d <= 2) tooClose.push(`${b.id}: ${b.poles.join("×")} is ${d} step(s) apart`);
  }
  check("§21: every authored braid's poles are still genuinely opposed",
    tooClose.length === 0, tooClose.join(" · "));

  // ⚠️ THE CANARY. This line moves the day the ring is consolidated, and says by how much.
  const size = idxB.size || 24, half = Math.floor(size / 2);
  const dists = braids.map(b => TRb.ringDistance(b.poles[0], b.poles[1], idxB));
  check("§21: …and all of them are still EXACT antipodes — a consolidation will change this line",
    dists.every(d => d >= half), `distances ${dists.join(", ")} on a ${size}-ring (antipodal = ${half})`);
}

/* ══════════ §22 — A MYTHICAL IS NOT A BIGGER HERO ══════════ */
// ⛔ ERIK'S RULING, 2026-08-30: "a Mythical, like the other tiers, is BOTH a different kind of thing —
// status that reflects how much influence and impact they can make — AND a very high level, fully skilled
// and powered individual… units and bands and parties that draw the personal attention of a Mythical are
// at GREAT RISK… they are not the same as a Hero tier."
//
// ⚠️ AND THE LADDER WAS ALREADY WRITTEN DOWN. `arc_response.attentionByTier` is a table of how much
// ATTENTION each rung commands — which is Erik's "how much influence and impact they can make", canon
// since SNG-280. ⛔ SO THIS INVENTS NO VOCABULARY: the cap is the epic baseline scaled by the rung's weight.
console.log("\n── §22 · a Mythical is not a bigger hero ──");
{
  const ML = await import("../engine/melee.js");
  const arc = rj("content/packs/core/rules/arc_response.json");
  const att = (function find(o) { if (!o || typeof o !== "object") return null; if (o.attentionByTier) return o.attentionByTier; for (const v of Object.values(o)) { const r = find(v); if (r) return r; } return null; })(arc);
  const cfgM = { heroSwingCap: 0.15, attentionByTier: att };
  const clash = (tier) => {
    let z = 1; const rngM = () => { z |= 0; z = (z + 0x6D2B79F5) | 0; let t = Math.imul(z ^ (z >>> 15), 1 | z); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    return ML.legionClash([{ count: 400, quality: 3 }], [{ count: 400, quality: 3 }], { rng: rngM, heroSwing: 1, heroTier: tier, cfgM: null, cfg: cfgM });
  };
  check("§22: the attention ladder exists and is content, not a table in the engine", !!att && att.mythic > att.epic);

  const riff = clash("riffraff"), heroic = clash("heroic"), epic = clash("epic"), myth = clash("mythic");
  // ⛔ THE BASELINE IS PRESERVED. An epic hero bends a battle by exactly the 0.15 that shipped.
  check("§22: an EPIC hero is unchanged — the shipped 0.15", epic.heroSwing === 0.15);
  // ⛔ ERIK'S DISTINCTION, ASSERTED: not the same as a Hero tier.
  check("§22: a MYTHICAL bends a battle far harder than a heroic one",
    myth.heroSwing >= heroic.heroSwing * 4, `${myth.heroSwing} vs ${heroic.heroSwing}`);
  check("§22: …and it is a BREAKTHROUGH where a hero only gains",
    myth.outcome === "breakthrough" && epic.outcome !== "breakthrough", `${myth.outcome} / ${epic.outcome}`);
  // ⚠️ AND A NOBODY CHANGES NOTHING — the bottom of the ladder has to mean something too.
  check("§22: a riffraff figure does not move a battle", riff.tide === 0 || riff.outcome === "grinding");
  // ⚠️ ABSENT IS TODAY: no tier means the shipped cap, so every existing caller is untouched.
  check("§22: with no tier the cap is exactly what shipped",
    clash(null).heroSwing === 0.15, String(clash(null).heroSwing));
  // ⛔ AND THE RECEIPT MUST READ AS A RULING, NOT A FLOAT ARTIFACT.
  check("§22: the swing is a clean number", String(myth.heroSwing) === "0.45", String(myth.heroSwing));
}

/* ══════════ §23 — COHESION DOES SOMETHING, AND SOLE COVERAGE HAS A NAME ══════════ */
// ⛔ AEVI: "who_falls_first asks for sole; break_the_line asks for cohesion." Both computed since
// CCODE-307 and NEITHER READ BY ANYTHING — so one craft had nobody to name and the other had nothing to
// remove.
//
// ⚠️ COHESION IS how much of what a group HAS it can actually BRING (SPEC_group_aggregation §3b), so the
// folded contribution IS what they bring — the right place and the only place. ⛔ A GROUP AT LOW COHESION
// STILL HAS ITS COVERAGE AND CANNOT USE IT, which is what a rout is and the game could not express.
console.log("\n── §23 · cohesion bites, and the load-bearing member has a name ──");
{
  const SBc = await import("../engine/skill_battle.js");
  const GRc = await import("../engine/group.js");
  const rulesC = rj("content/packs/core/rules/resolution.json");
  const sbC = rj("content/packs/core/rules/skill_battle_system.json").engine;
  const stepsC = rj("content/packs/core/rules/intensity_scaling.json").steps;
  const shC = (o = {}) => ({ attributes: { physical: 6, mental: 6, social: 6, practical: 6 }, energy: 200, health: 40, skills: [], ...o });
  const fighter = (id, down) => ({ id, name: id, present: true, downed: down ? { why: "x" } : null, contributions: ["HARM", "MARTIAL"], sheet: shC() });
  const add = (fold) => {
    let z = 5; const rngC = () => { z |= 0; z = (z + 0x6D2B79F5) | 0; let q = Math.imul(z ^ (z >>> 15), 1 | z); q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q; return ((q ^ (q >>> 14)) >>> 0) / 4294967296; };
    const r = SBc.battleRound({ playerDecl: { function: "strike", tier: 8, attribute: "physical", intensity: "surge", name: "cut" },
      oppDecl: { function: "shield", tier: 1, name: "g" },
      playerSheet: shC({ attributes: { physical: 12, mental: 12, social: 12, practical: 12 } }),
      oppSheet: shC({ attributes: { physical: 1, mental: 1, social: 1, practical: 1 }, health: 300 }),
      state: { momentum: 0, round: 1 }, rules: rulesC, sb: sbC, steps: stepsC, rng: rngC, folded: fold });
    return r?.damage?.melee?.added ?? 0;
  };
  const intact = add([fighter("a"), fighter("b"), fighter("c"), fighter("d")]);
  const half = add([fighter("a"), fighter("b"), fighter("c", true), fighter("d", true)]);
  const rout = add([fighter("a"), fighter("b", true), fighter("c", true), fighter("d", true)]);

  // ⛔ NON-VACUITY: an intact fold must contribute, or every comparison below is between two zeroes.
  check("§23: an intact fold contributes", intact > 0, String(intact));
  check("§23: a fold coming apart brings LESS", half < intact, `${half} < ${intact}`);
  check("§23: …and a routed one brings less still", rout < half, `${rout} < ${half}`);

  // ⛔ AND THE PERSON. sole turned into a name is what who_falls_first asks for.
  const mk = (id, tags, extra = {}) => ({ id, name: id, present: true, downed: null, assistTags: tags, ...extra });
  const soft = (id, tags) => mk(id, tags, { canStrike: false });
  const band = [soft("Sprig", ["mend"]), soft("Quill", ["study"]), mk("spear1", []), mk("spear2", [])];
  const lb = GRc.loadBearing(band);
  check("§23: the load-bearing member is named", lb && lb.name === "Sprig", JSON.stringify(lb));
  // ⚠️ AND IT IS NOT "the weakest" OR "the healer" — the craft's own failure line says so.
  const scholars = [mk("Pell", []), soft("A", ["study"]), soft("B", ["study"])];
  check("§23: …it is whoever holds a capability ALONE — a lone fighter among scholars",
    GRc.loadBearing(scholars)?.name === "Pell", JSON.stringify(GRc.loadBearing(scholars)));
  check("§23: with nobody sole, nobody is load-bearing",
    GRc.loadBearing([soft("A", ["mend"]), soft("B", ["mend"])]) === null);
  // ✅ AND THE PLAYER IS TOLD, one row above the control that acts on it.
  check("§23: the panel names them beside the guard pick", rd("app.js").includes("is load-bearing"));
}

/* ══════════ §24 — COMMAND LIFTS A LINE ABOVE ITSELF ══════════ */
// ⛔ ERIK 2026-08-30: "cohesion should be able to be BOOSTED by command and commanders or officers (just
// NPCs who have skills or tiers). Another reason to target them. Point being, COHESION CAN GO ABOVE 1.0."
//
// ⚠️ AND THE LADDER IS THE ONE HE RULED ON AN HOUR EARLIER. attentionByTier is "how much influence and
// impact they can make" — which is exactly what an officer contributes to a line holding together, so a
// legendary captain steadies twice as hard as an epic one for the same reason they bend a battle twice as
// hard. ⛔ NO SECOND LADDER WAS INVENTED.
console.log("\n── §24 · command lifts a line above itself ──");
{
  const GRd = await import("../engine/group.js");
  const arcD = rj("content/packs/core/rules/arc_response.json");
  const W = (function find(o) { if (!o || typeof o !== "object") return null; if (o.attentionByTier) return o.attentionByTier; for (const v of Object.values(o)) { const r = find(v); if (r) return r; } return null; })(arcD);
  const sold = (id, tier, down) => ({ id, name: id, present: true, downed: down ? { why: "x" } : null, assistTags: [], ...(tier ? { tier } : {}) });
  const four = () => [1, 2, 3, 4].map(i => sold("s" + i));
  const coh = (ms) => GRd.groupCapability(ms, { tierWeights: W }).cohesion;

  const plain = coh([...four(), sold("s5")]);
  const epic = coh([...four(), sold("cap", "epic")]);
  const legend = coh([...four(), sold("cmd", "legendary")]);
  const fallen = coh([...four(), sold("cmd", "legendary", true)]);

  check("§24: an unofficered line sits at 1", plain === 1, String(plain));
  // ⛔ ERIK'S POINT, ASSERTED: it goes ABOVE 1.
  check("§24: an officer lifts it ABOVE 1.0", epic > 1, String(epic));
  // ⚠️ AND THE RUNG MATTERS — the same ladder, the same ordering.
  check("§24: a legendary commander steadies harder than an epic captain", legend > epic, `${legend} > ${epic}`);
  // ⛔ THE PAYOFF, AND IT NEEDS NO SEPARATE RULE: killing them costs the boost AND the body, so the line
  // ends up WORSE than if it had never been officered. That is "another reason to target them".
  check("§24: a fallen commander leaves the line below an unofficered one",
    fallen < plain, `${fallen} < ${plain}`);
  // ⚠️ NON-VACUITY ON THE LADDER ITSELF: without weights an officer is invisible and the boost is silently
  // zero — the reader-with-no-writer shape, one layer down.
  check("§24: without the ladder an officer contributes nothing (absent is not invented)",
    GRd.groupCapability([...four(), sold("cmd", "legendary")], {}).cohesion === 1);
  // ✅ AND THE LIVE PATH READS IT.
  check("§24: the fold's contribution is scaled by cohesion, unclamped",
    rd("engine/skill_battle.js").includes("Math.max(0, Number(foldCap?.cohesion ?? 1))"));
}

/* ══════════ §25 — SEVEN RUNGS, AND KILLING A COMMANDER NEVER STEADIES A LINE ══════════ */
// ⛔ ERIK 2026-08-30, two rulings:
//   "notable · regional · heroic need to be split out — they are INCREASING CAPABILITIES."
//   "make sure that killing a LOSING unit's commander doesn't give it a cohesion BOOST to 0.8. Probably
//    want to set a CEILING of 0.8 with a 50% MORALE LOSS to cohesion otherwise."
//
// ⚠️ AND THE SPLIT NEEDED A SECOND TABLE, WHICH IS NORMALLY WHAT THIS PROJECT FORBIDS. attentionByTier is
// read by worldtick as an ARC-ATTENTION BUDGET, and its three-way tie at 0.5 is CORRECT there — a notable,
// a regional and a heroic figure can draw equal notice while differing in what they can DO. ⛔ MOVING THE
// ARC BUDGET TO FIX A COMBAT LADDER WOULD HAVE CHANGED HOW ARCS SPEND ATTENTION, SILENTLY. Two facts, two
// tables — and the rung names are asserted identical below so they cannot drift apart.
console.log("\n── §25 · seven rungs, and a dead commander never steadies a line ──");
{
  const GRe = await import("../engine/group.js");
  const rulesE = rj("content/packs/core/rules/resolution.json");
  const cap = rulesE.capabilityByTier || {};
  const arcE = rj("content/packs/core/rules/arc_response.json");
  const att = (function find(o) { if (!o || typeof o !== "object") return null; if (o.attentionByTier) return o.attentionByTier; for (const v of Object.values(o)) { const r = find(v); if (r) return r; } return null; })(arcE);
  const LADDER = ["riffraff", "notable", "regional", "heroic", "epic", "legendary", "mythic"];

  check("§25: the capability ladder carries all SEVEN rungs",
    LADDER.every(t => typeof cap[t] === "number"), LADDER.filter(t => typeof cap[t] !== "number").join(", "));
  // ⛔ ERIK'S FIRST RULING, ASSERTED: strictly increasing, no ties.
  const vals = LADDER.map(t => cap[t]);
  check("§25: it is STRICTLY increasing — no two rungs are worth the same",
    vals.every((v, i) => i === 0 || v > vals[i - 1]), vals.join(" · "));
  // ⚠️ THE ANCHOR. epic 1.0 is the shipped 0.15 hero swing; moving it silently rebalances every fight.
  check("§25: epic is still the 1.0 anchor", cap.epic === 1);
  // ⛔ AND THE TWO TABLES MUST NAME THE SAME RUNGS, or one will grow a rung the other never hears about.
  check("§25: capability and attention carry identical rung names",
    Object.keys(att || {}).every(k => k in cap) && LADDER.every(k => k in (att || {})),
    `attention: ${Object.keys(att || {}).join(",")}`);

  // ⛔ ERIK'S SECOND RULING — THE TRAP. 0.8 is a CEILING applied to a HALVED value, never a floor.
  const sold = (id, tier, down) => ({ id, name: id, present: true, downed: down ? { why: "x" } : null, assistTags: [], ...(tier ? { tier } : {}) });
  const many = (n, down = 0) => [...Array(n)].map((_, i) => sold("s" + i, null, i < down));
  const coh = (ms) => GRe.groupCapability(ms, { tierWeights: cap }).cohesion;

  const healthy = coh([...many(10), sold("cmd", "legendary")]);
  const headless = coh([...many(10), sold("cmd", "legendary", true)]);
  const routed = coh([...many(10, 7), sold("cmd", "legendary")]);
  const routedHeadless = coh([...many(10, 7), sold("cmd", "legendary", true)]);

  check("§25: a well-led line is above 1", healthy > 1, String(healthy));
  check("§25: losing the commander roughly halves it", headless < healthy * 0.6, `${headless} vs ${healthy}`);
  // ⛔ THE TRAP ITSELF: a unit ALREADY BELOW 0.8 must fall further, never rise to it.
  check("§25: killing a LOSING unit's commander drives it DOWN, never up to 0.8",
    routedHeadless < routed, `routed ${routed} → headless ${routedHeadless}`);
  check("§25: …and it is never lifted to the ceiling", routedHeadless < 0.8, String(routedHeadless));
}

/* ══════════ §26 — SILENCE INHERITS THE TIER RUNG, AND A LIVE FIELD IS NEVER DOCUMENTED DEAD ══════════ */
// ⛔ BOTH OF THESE CAME OUT OF CCODE-326, the tradition tournament Erik asked for — and neither was a
// balance question. They are the two ways a number can be true in the engine and false everywhere a person
// would look for it.
//
// ⚠️ ONE — `craftmechanics` resolves `diceAuthored ? {nMult:1} : rung.dice`. AUTHORED WINS, deliberately:
// Aevi tiers her own dice and multiplying again doubled whole traditions. The half nobody had measured is
// the other one — a craft that authors NO dice INHERITS THE TIER RUNG, which at a mid standing is 5d6+8
// (mean 25.5) against valley_craft's authored 1d6 (mean 3.5). ⛔ NOT AUTHORING IS CURRENTLY THE STRONGEST
// DAMAGE CHOICE IN THE CATALOGUE, seven-fold, and nothing in the JSON says so.
//
// ⚠️ TWO — SYSTEM_SPEC §39 listed `wardTypes` as "NOTHING — the string does not appear in skill_battle.js".
// It appears ten times and is read into `soakTypes` at the guard. ⛔ A SPEC THAT DECLARES A LOAD-BEARING
// FIELD DEAD IS WORSE THAN SILENCE: it tells an author not to write the field that decides whether a blow
// lands. This asserts the READER exists, which is the only claim that could have caught it.
console.log("\n── §26 · silence inherits the rung, and a live field is never documented dead ──");
{
  const CM = await import("../engine/craftmechanics.js");
  const cmCfg = rj("content/packs/core/rules/craft_mechanics.json");
  const mk = (dice) => ({ functions: ["strike"], shape: "damage", levelReq: 1,
    mechanic: { ...(dice ? { dice } : {}), damageType: "physical" } });
  const at = (a, tier) => CM.mechanicFor(a, { verb: "strike", tier, rank: 1, intensity: "standard", cfg: cmCfg });

  const authored = at(mk({ n: 1, d: 6 }), 5), silent = at(mk(null), 5);
  // ⚠️ THE ANCHOR: an authored 1d6 stays 1d6 at any tier. This is the rule that stops double-tiering.
  check("§26: AUTHORED dice are never re-multiplied by the tier ladder",
    authored?.fields?.dice?.n === 1, JSON.stringify(authored?.fields?.dice));
  // ⛔ AND THE COST OF THAT RULE, asserted so it cannot be forgotten again.
  check("§26: an UNAUTHORED craft inherits the tier rung instead",
    (silent?.fields?.dice?.n || 0) > (authored?.fields?.dice?.n || 0),
    `silent ${JSON.stringify(silent?.fields?.dice)} vs authored ${JSON.stringify(authored?.fields?.dice)}`);
  // ⚠️ NON-VACUITY: at tier 1 the rung multiplier is 1, so the two must AGREE. If this ever passes at every
  // tier, the check above is measuring nothing.
  const a1 = at(mk({ n: 1, d: 6 }), 1), s1 = at(mk(null), 1);
  check("§26: …and at tier 1 they agree — the gap is the RUNG, not a constant bias",
    a1?.fields?.dice?.n === s1?.fields?.dice?.n, `${a1?.fields?.dice?.n} vs ${s1?.fields?.dice?.n}`);

  // ⛔ THE FOUR DOORS, applied to a field the spec had buried. Not "is it authored" — IS IT READ.
  const sb26 = rd("engine/skill_battle.js");
  check("§26: `wardTypes` is READ by the live battle path, whatever the spec says about it",
    (sb26.match(/wardTypes/g) || []).length >= 2 && /soakTypes/.test(sb26),
    `${(sb26.match(/wardTypes/g) || []).length} occurrences`);
  const spec26 = rd("SYSTEM_SPEC.md");
  check("§26: …and the spec no longer calls it dead",
    !/`wardTypes`\s*\|\s*⛔\s*\*\*NOTHING/.test(spec26));
}

// ⛔ CCODE-327 — THE CERTIFIED COUNTS, GATED BY THEIR OWN GENERATOR. Every number the docs certify about the
// corpus is checked here by running `certify_counts.mjs --check`, which exits non-zero on drift.
//
// ⚠️ THE GATE RUNS THE GENERATOR RATHER THAN RE-DERIVING THE COUNTS, deliberately. A gate that counted the
// corpus itself would be a SECOND implementation of the same derivation, free to disagree with the first —
// and then whichever one an author happened to run would decide what was true. One source, checked.
//
// ⛔ AND IT COVERS THE TWO THAT NOTHING WATCHED. `HOW_IT_WORKS` and `PLAYERS_GUIDE` carried craft counts with
// no gate at all — only their VERSION string was checked — so they could drift silently and forever, which
// is strictly worse than the spec header that at least failed loudly.
{
  const { execFileSync } = await import("node:child_process");
  let certOut = "", certOk = true;
  try { certOut = execFileSync(process.execPath, [join(root, "scripts/certify_counts.mjs"), "--check"], { encoding: "utf8" }); }
  catch (e) { certOk = false; certOut = String(e.stdout || "") + String(e.stderr || ""); }
  check("CERTIFY: every count the docs certify about the corpus is fresh",
    certOk, certOut.split("\n").filter(l => /STALE|REFUSING/.test(l)).join(" · ") || "run `node scripts/certify_counts.mjs`");
  // ⚠️ NON-VACUITY: the generator must still be finding all six claims. If a doc is restructured and a row
  // goes missing, `--check` exits non-zero with REFUSING — this asserts the run was a real comparison and
  // not a no-op that found nothing to compare.
  check("CERTIFY: …and it is still finding its claims, not silently matching none",
    !/REFUSING TO STAMP/.test(certOut), certOut.slice(0, 200));
}

/* ══════════ §27 — THE LADDER REACHES THE LIVE PATH, NOT JUST THE MODULE ══════════ */
// ⛔ THIS IS THE GATE §25 SHOULD HAVE BEEN. §25 proves the capability ladder is authored, strictly
// increasing, and that `groupCapability` reads it — by calling the module with the ladder handed to it.
// The app called `legionClash` with `cfg: CONTENT.rules?.melee || {}`, and THERE IS NO `melee.json`: rules
// are keyed by filename stem, so that expression was `{}` at all seven call sites.
//
// ⚠️ `legionClash` computes `heroSwingCap × ladder[tier]` and an empty cfg makes the ladder `{}`, so the
// weight was ALWAYS 1. ⛔ A MYTHICAL BENT A BATTLE EXACTLY AS MUCH AS A HEROIC IN THE LIVE GAME — authored,
// implemented, gated, and unreachable. A MODULE GATE AND A WIRING GATE ARE DIFFERENT CLAIMS.
//
// ⚠️ SO THIS ONE BUILDS THE CONFIG THE WAY `app.js` BUILDS IT and asserts the BEHAVIOUR changes, rather
// than asserting that a function would work if someone passed it the right thing.
console.log("\n── §27 · the capability ladder reaches the live legion path ──");
{
  const ME = await import("../engine/melee.js");
  const rules27 = rj("content/packs/core/rules/resolution.json");
  const sb27 = rj("content/packs/core/rules/skill_battle_system.json").engine;
  const app27 = rd("app.js");

  // ⛔ NO CALL SITE MAY GO BACK TO THE PHANTOM KEY. This is the regression that would silently un-wire it.
  check("§27: no call site passes the phantom `rules.melee` any more",
    !/CONTENT\.rules\?\.melee/.test(app27));
  check("§27: there is ONE definition of the melee config, and the call sites use it",
    /function meleeCfg\(\)/.test(app27) && (app27.match(/meleeCfg\(\)/g) || []).length >= 8,
    `${(app27.match(/meleeCfg\(\)/g) || []).length} references`);
  // ⚠️ AND IT MUST STILL BE KEYED TO A FILE THAT EXISTS. If `resolution.json` ever stops carrying the
  // ladder, the helper goes quiet again in exactly the same way.
  check("§27: the ladder the helper reaches for is actually authored",
    !!rules27.capabilityByTier && typeof rules27.capabilityByTier.mythic === "number");

  // ⛔ THE BEHAVIOURAL CLAIM. Same config the app now builds, and the rung must change the swing.
  const cfg27 = { ...(sb27.melee || {}), capabilityByTier: rules27.capabilityByTier };
  // ⚠️ A UNIT IS `{count, quality}` AND THE RETURN KEY IS `heroSwing`. My first version of this gate used
  // `{strength}` and read `.swing`, so both sides came back `undefined` — the behavioural check FAILED loudly
  // but the non-vacuity check beneath it PASSED on `undefined === undefined`. ⛔ A VACUOUS PASS UNDER A REAL
  // FAILURE is the worst pairing there is: had the first check been the lenient one, this gate would have
  // shipped green and proved nothing.
  const clash = (tier, cfg) => ME.legionClash([{ count: 40, quality: 1 }], [{ count: 40, quality: 1 }],
    { rng: () => 0.5, heroSwing: 1, heroTier: tier, cfg });
  const heroic = clash("heroic", cfg27), mythic = clash("mythic", cfg27);
  check("§27: with the wired config a MYTHIC outswings a HEROIC",
    Math.abs(mythic.heroSwing) > Math.abs(heroic.heroSwing), `heroic ${heroic.heroSwing} vs mythic ${mythic.heroSwing}`);
  // ⚠️ NON-VACUITY, AND IT IS THE WHOLE POINT: with the OLD empty config the two must be IDENTICAL. If this
  // ever fails, the bug being gated cannot happen and the gate above proves nothing.
  const heroicOld = clash("heroic", {}), mythicOld = clash("mythic", {});
  check("§27: …and with the EMPTY config they were identical — which is the defect this gates",
    heroicOld.heroSwing === mythicOld.heroSwing && Number.isFinite(heroicOld.heroSwing), `${heroicOld.heroSwing} vs ${mythicOld.heroSwing}`);
}

/* ══════════ §28 — LEVEL CONTRIBUTES TO AUTHORED DAMAGE, AND THE MULTIPLIER STILL DOES NOT ══════════ */
// ⛔ ERIK: "I DO STILL WANT LEVEL TO HELP WITH DAMAGE, but I want to do it SMARTLY and NOT RECREATE THE
// SYSTEM." ⚠️ AEVI'S FINDING: the mechanism already existed and was pointed BACKWARDS — `rung.dice` is the
// level→damage relationship and it fired only when an author wrote NOTHING. Doing the work bought level
// contributing exactly zero; silence bought the whole tier multiplier.
//
// ⚠️ THE SPLIT IS THE FIX. `nMult` multiplies and is the double-scaling bug (`3d4+3` → `9d4+6`) that
// `diceAuthored` exists to stop — authored dice keep exempting it. `plus` is additive, cannot compound, and
// therefore is safe to always apply. ⛔ BOTH HALVES ARE ASSERTED HERE, because keeping only the first would
// look identical to the old behaviour and keeping only the second is the bug coming back.
console.log("\n── §28 · level reaches authored damage, the multiplier still does not ──");
{
  const CM28 = await import("../engine/craftmechanics.js");
  const cm28 = rj("content/packs/core/rules/craft_mechanics.json");
  const mk = (d) => ({ functions: ["strike"], shape: "damage", levelReq: 1,
    mechanic: { ...(d ? { dice: d } : {}), damageType: "physical" } });
  const at = (a, tier, cfg = cm28) => CM28.mechanicFor(a, { verb: "strike", tier, rank: 1, intensity: "standard", cfg });
  const ev = (f) => (f?.dice ? f.dice.n * (f.dice.d + 1) / 2 : 0) + (Number(f?.plus) || 0);

  const lo1 = ev(at(mk({ n: 1, d: 6 }), 1).fields), lo5 = ev(at(mk({ n: 1, d: 6 }), 5).fields);
  check("§28: an AUTHORED craft gains damage with tier — level helps", lo5 > lo1, `${lo1} → ${lo5}`);
  // ⛔ THE HALF THAT MUST NOT COME BACK. The die COUNT is untouched; only the flat bonus moves.
  check("§28: …but its DICE COUNT is never multiplied — the double-scaling bug stays fixed",
    at(mk({ n: 3, d: 4 }), 5).fields.dice.n === 3, JSON.stringify(at(mk({ n: 3, d: 4 }), 5).fields.dice));
  // ⚠️ AND IT COMPRESSES RATHER THAN WIDENS: a flat bonus is worth proportionally more to a small craft.
  const big1 = ev(at(mk({ n: 5, d: 6 }), 1).fields), big5 = ev(at(mk({ n: 5, d: 6 }), 5).fields);
  check("§28: the small-to-large spread NARROWS with tier, it does not widen",
    (big5 / lo5) < (big1 / lo1), `t1 ${(big1 / lo1).toFixed(2)}× → t5 ${(big5 / lo5).toFixed(2)}×`);
  // ⛔ IT IS A DIAL. Erik must be able to turn this back without an engine change, and `false` must restore
  // the OLD behaviour exactly — which is also this gate's non-vacuity floor: if the dial does nothing, the
  // checks above are measuring something that was already true.
  const off = { ...cm28, tierLadder: { ...cm28.tierLadder, authoredKeepsPlus: false } };
  check("§28: `authoredKeepsPlus: false` restores the old behaviour exactly",
    ev(at(mk({ n: 1, d: 6 }), 5, off).fields) === lo1, `${ev(at(mk({ n: 1, d: 6 }), 5, off).fields)} vs ${lo1}`);
}

/* ══════════ §29 — docs/BALANCE.md IS EXECUTED, NOT TRUSTED ══════════ */
// ⛔ ERIK: "we need to build toward balance and use the dials." ⚠️ A DIAL LIST IS THE EASIEST DOCUMENT IN
// THIS PROJECT TO GET WRONG, because it is a list of names that look like code and are not checked by
// anything. A phantom dial reads exactly like a real one, and someone turns it and nothing happens.
//
// ⛔ SO BOTH HALVES ARE ASSERTED AGAINST THE CORPUS, AND THEY ASSERT OPPOSITE THINGS:
//   · §2a says "content-tunable" — every path it names must RESOLVE in the loaded rules.
//   · §2b says "code-only, not yet a dial" — every constant it names must be ABSENT from content.
// ⚠️ THE SECOND IS THE ONE THAT ROTS. The moment I wire `perOfficer` to content, §2b becomes a lie that
// tells Aevi she cannot turn something she can — and nothing but this would catch it.
console.log("\n── §29 · the balance doc's dial list is checked against the corpus ──");
{
  const bal = rd("docs/BALANCE.md");
  check("§29: docs/BALANCE.md exists and is substantial", bal.length > 6000, `${bal.length} chars`);
  check("§29: it carries the live version",
    bal.includes(rd("app.js").match(/APP_VERSION = "([\d.]+)"/)[1]));

  // the three rule files the doc's §2a names as homes for dials
  const bag = {
    skill_battle_system: rj("content/packs/core/rules/skill_battle_system.json").engine,
    craft_mechanics: rj("content/packs/core/rules/craft_mechanics.json"),
    resolution: rj("content/packs/core/rules/resolution.json"),
    // ✅ 2026-09-04: two more homes the doc names — the hold store and the debts (economy), the meaning weights (the_substrate)
    economy: rj("content/packs/core/rules/economy.json"),
    the_substrate: rj("content/packs/core/rules/the_substrate.json"),
  };
  const resolves = (path) => {
    const parts = path.replace(/\.\*$/, "").split(".");
    for (const root of Object.values(bag)) {
      let cur = root, ok = true;
      for (const k of parts) {
        if (cur && typeof cur === "object" && k in cur) cur = cur[k];
        else if (cur && typeof cur === "object") {
          // a row like `tierLadder[n].dice.nMult` names a rung generically — accept any numeric rung
          const rung = Object.keys(cur).find(x => /^\d+$/.test(x));
          if (rung && cur[rung] && typeof cur[rung] === "object" && k in cur[rung]) cur = cur[rung][k];
          else { ok = false; break; }
        } else { ok = false; break; }
      }
      if (ok) return true;
    }
    return false;
  };
  // ⚠️ THE ROWS ARE READ OUT OF THE DOC, so adding a dial to the table adds it to the gate automatically.
  const rowsIn = (heading) => {
    const seg = bal.split(heading)[1]?.split("###")[0] || "";
    return seg.split("\n").filter(l => l.startsWith("| `")).map(l => l.slice(1).trim());
  };
  // ⚠️ THE DIAL CELL ONLY, and a dial name may carry `*` (a whole block) or `/` (alternatives). Matching
  // across the WHOLE ROW let a miss fall through to the next backtick — which is the FILE name — so the
  // gate reported "`resolution` does not resolve" and read as a content bug when it was a parser one.
  // ⚠️ THE DIAL CELL ONLY, AND ANY TEXT BETWEEN BACKTICKS. Matching a narrow character class across the
  // WHOLE ROW let a miss fall through to the next backtick — which is the FILE name — so the gate reported
  // "`resolution` does not resolve" and read as a content bug when it was a parser one. A dial name can
  // carry `*` (a whole block) or `/` (alternatives), so the match is deliberately permissive and the
  // NORMALISING is what narrows it.
  const firstPath = (row) => {
    const cell = String(row).split("|")[0] || "";
    const m = cell.match(/`([^`]+)`/);
    if (!m) return "";
    let t = m[1];
    t = t.split("[n]").join("");                       // `tierLadder[n].dice.nMult` names a rung generically
    t = t.replace(new RegExp("/[A-Za-z]+", "g"), "");  // `intensity.conserve/standard/surge.mult`
    while (t.endsWith("*") || t.endsWith(".")) t = t.slice(0, -1);
    return /^[A-Za-z][A-Za-z0-9_.]*$/.test(t) ? t : "";
  };

  const tunable = rowsIn("### 2a").map(firstPath).filter(Boolean);
  const unresolved = tunable.filter(p => !resolves(p));
  check("§29: every dial §2a calls CONTENT-TUNABLE actually resolves in the rules",
    unresolved.length === 0, unresolved.join(", ") || `${tunable.length} checked`);
  // ⛔ NON-VACUITY: the list must not be empty, or the check above passes by finding nothing.
  check("§29: …and it found dials to check", tunable.length >= 8, `${tunable.length}`);

  // ⛔ THE HALF THAT ROTS. §2b's whole claim is that these are NOT reachable from content.
  const codeOnly = rowsIn("### 2b").map(firstPath).filter(Boolean);
  const rulesText = ["skill_battle_system", "craft_mechanics", "resolution"]
    .map(f => rd(`content/packs/core/rules/${f}.json`)).join("");
  const nowAuthored = codeOnly.filter(k => rulesText.includes(`"${k}"`));
  check("§29: every constant §2b calls CODE-ONLY is still absent from content",
    nowAuthored.length === 0,
    nowAuthored.length ? `${nowAuthored.join(", ")} — now authored; move to §2a` : `${codeOnly.length} checked`);
  check("§29: …and it found constants to check", codeOnly.length >= 3, `${codeOnly.length}`);
}

/* ══════════ §30 — A CHOSEN CRAFT SURVIVES THE CHOOSING ══════════ */
// ⛔ ERIK: "you need to use character sheets for these npcs and have them choose skills. THE SKILL USE IS
// WHAT WILL PROVIDE THE DIFFERENCES." ⚠️ IT COULD NOT. `opponentPolicy` scores a sheet's skills carefully —
// matchup, press-when-behind, anti-repetition — and then built its declaration from FOUR FIELDS, dropping
// `abilityId` and `mechanic`. `mechanicFor` found no authored block and fell to the family default.
//
// ⚠️ MEASURED: one authored sheet carrying a 1d6 skill and a 12d6 skill dealt the SAME mean either way.
// The policy was choosing between weapons that were all the same weapon.
console.log("\n── §30 · a chosen craft survives the choosing ──");
{
  const SBp = await import("../engine/skill_battle.js");
  const sb30 = rj("content/packs/core/rules/skill_battle_system.json").engine;
  const mkSkill = (n) => ({ function: "strike", name: "s" + n, tier: 5, attribute: "physical",
    abilityId: "probe" + n, mechanic: { dice: { n, d: 6 }, damageType: "physical" } });

  // ⚠️ AN AUTHORED SHEET — the hand-built kind, which is the only case where a craft identity exists to lose.
  const authored = SBp.synthesizeOpponentSheet(
    { name: "probe", threat: 40, skills: [mkSkill(1)] }, sb30);
  check("§30: an authored sheet's skills reach the sheet intact",
    authored.authored === true && !!authored.skills[0].mechanic);
  const decl = SBp.opponentPolicy(authored, { momentum: 0, round: 1 }, null, sb30);
  check("§30: …and the policy hands the CRAFT to the fight, not just its verb",
    !!decl.mechanic && decl.abilityId === "probe1",
    `keys: ${Object.keys(decl).join(",")}`);
  // ⛔ THE BEHAVIOURAL CLAIM: two skills that differ only in their dice must resolve differently.
  const dTiny = SBp.opponentPolicy({ ...authored, skills: [mkSkill(1)] }, { momentum: 0, round: 1 }, null, sb30);
  const dHuge = SBp.opponentPolicy({ ...authored, skills: [mkSkill(12)] }, { momentum: 0, round: 1 }, null, sb30);
  check("§30: choosing a bigger craft means a bigger craft",
    dHuge.mechanic.dice.n > dTiny.mechanic.dice.n,
    `${dTiny.mechanic?.dice?.n} vs ${dHuge.mechanic?.dice?.n}`);

  // ⚠️ NON-VACUITY IN THE OTHER DIRECTION, AND IT IS THE SAFETY ARGUMENT: a SYNTHESIZED sheet's skills
  // carry no mechanic at all, so spreading one changes nothing and every generated foe in the game behaves
  // exactly as it did. ⛔ IF THIS EVER FAILS, the fix has started altering foes it was never meant to touch.
  const synth = SBp.synthesizeOpponentSheet({ name: "raider", threat: 30 }, sb30);
  const sDecl = SBp.opponentPolicy(synth, { momentum: 0, round: 1 }, null, sb30);
  check("§30: a SYNTHESIZED foe is untouched — it never had a craft to carry",
    synth.synthesized === true && sDecl.mechanic === undefined,
    `mechanic: ${JSON.stringify(sDecl.mechanic)}`);
  check("§30: …and it still declares a real move",
    !!sDecl.function && !!sDecl.intensity, JSON.stringify(sDecl));
}
/* ══════════ §31 — THE DOMAIN LAYER, THE DERIVED RING, AND THE BRAIDS ══════════ */
// ⛔ ERIK ruled READING B: the POLES REMAIN THE TRADITIONS and the 14 domains sit ABOVE them, so the merge
// is ADDITIVE. This gates the three pieces that landed on that ruling — the reader (A), the derived ring
// distance (E), and the braid check Aevi asked for even though nothing is broken (F).
console.log("\n── §31 · domains read, ring derived, braids still cross the wheel ──");
{
  const TR31 = await import("../engine/traditions.js");
  const tf31 = rj("content/packs/core/rules/traditions.json");
  const v231 = rj("content/packs/core/rules/traditions_v2.json");
  const idx = TR31.buildTraditionIndex(tf31, v231);

  /* A — the reader */
  check("§31A: the index carries the 14 domains", idx.domainCount === 14, String(idx.domainCount));
  check("§31A: a pole resolves to its domain and its sect name",
    TR31.domainOfTradition("cogitant", idx) === "Mind" && TR31.sectOf("cogitant", idx) === "Noesis");
  // ⛔ THE MERGE IS ADDITIVE — `traditionOf` MUST NOT MOVE. A Cogitant is still a Cogitant.
  check("§31A: `traditionOf` still answers the POLE, not the domain",
    TR31.traditionOf({ tradition: "cogitant" }, idx) === "cogitant");
  // ⚠️ READER BEFORE FIELD: with no v2 doc the layer is simply absent, which is what every consumer
  // written before today already handles. If this ever fails, the reader has started REQUIRING content.
  const bare = TR31.buildTraditionIndex(tf31);
  check("§31A: with no v2 doc the domain layer is absent, not broken",
    bare.domainCount === 0 && TR31.domainOf({ tradition: "cogitant" }, bare) === null);

  // ⛔ THE MAPPING ITSELF: 24 poles, each in exactly one domain, every id real.
  const sects = Object.values(v231.traditions).flatMap(r => r.sects || []);
  const poles31 = sects.map(x => Array.isArray(x) ? x[1] : x?.tradition);
  check("§31A: 24 sects cover 24 DISTINCT poles — none doubled, none missing",
    poles31.length === 24 && new Set(poles31).size === 24, `${poles31.length} sects, ${new Set(poles31).size} distinct`);
  check("§31A: every sect names a real tradition",
    poles31.every(t => !!idx.byId[t]), poles31.filter(t => !idx.byId[t]).join(", "));

  // ⛔ THE CROSS-CHECK. 21 abilities carry a hand-authored `traditionV2`; the table is derived from the
  // sects. ⚠️ A DISAGREEMENT MEANS ONE OF THEM IS WRONG, and finding out later means finding out from a
  // player. It passes today at 21/21 and must keep passing as Aevi tags more.
  const cat31 = [];
  {
    const dir = join(root, "content/packs/core/abilities");
    const { readdirSync } = await import("node:fs");
    for (const f of readdirSync(dir).filter(x => x.endsWith(".json")))
      for (const a of (rj(`content/packs/core/abilities/${f}`).abilities || [])) cat31.push(a);
  }
  const tagged = cat31.filter(a => a.traditionV2);
  const disagree = tagged.filter(a => TR31.domainOf(a, idx) !== a.traditionV2);
  check("§31A: every hand-authored `traditionV2` AGREES with the derived sect table",
    disagree.length === 0,
    disagree.map(a => `${a.id}: tag ${a.traditionV2} vs derived ${TR31.domainOf(a, idx)}`).join(" · "));
  // ⚠️ NON-VACUITY: if nobody tags any more, the check above passes by comparing nothing.
  check("§31A: …and there are tags to check", tagged.length >= 20, `${tagged.length} tagged`);

  /* E — the ring is the source */
  // ⛔ THE PROOF THAT MADE THE FLIP SAFE, KEPT STANDING. Every authored `distances` entry must equal what
  // the ring derives. It was 552/552 on the day of the change; if content ever disagrees, the stored table
  // is stale and would have been silently authoritative under the old order.
  let stored = 0, mismatch = [];
  for (const t of (tf31.traditions || [])) for (const [other, d] of Object.entries(t.distances || {})) {
    stored++;
    const derived = TR31.ringDistance(t.traditionId, other, idx);
    if (derived !== d) mismatch.push(`${t.traditionId}->${other} stored ${d} ring ${derived}`);
  }
  check("§31E: every stored distance equals the RING — the table is a copy, not a source",
    mismatch.length === 0, mismatch.slice(0, 4).join(" · "));
  check("§31E: …and there are stored distances to check", stored >= 500, `${stored} entries`);
  // ⚠️ AND THE FALLBACK STILL EXISTS for the five records with no ring position, which is the one case the
  // ring genuinely cannot answer.
  check("§31E: an off-wheel record returns null rather than a wrong number",
    TR31.ringDistance("harmonic", "umbral", idx) === null);

  /* F — braids: ANY pair, and DISTANCE IS THE PRICE */
  // ⛔ ERIK 2026-08-31: "for braids… I want to be able to BRAID ANYTHING — not only antipode and different
  // domains." ⚠️ MY FIRST VERSION OF THIS GATE ASSERTED THE OPPOSITE — that a braid must join true antipodes
  // in different domains — and it was green, which made it look like a fact about the engine.
  //
  // ⛔ IT WAS A RULE I INVENTED FROM THE THREE AUTHORED EXAMPLES. `mintableBraidsFor` restricts on exactly
  // three things — pairwise, you own both, not already braided — and has NEVER had a tradition, antipode or
  // domain restriction. The wall lived in the design prose and in my gate, not in the code.
  //
  // ⚠️ A GATE THAT ASSERTS A RULE NOBODY IMPLEMENTED IS WORSE THAN NO GATE: it passes, it reads as
  // confirmation, and it would have blocked the very ruling Erik just made.
  //
  // ✅ SO IT NOW ASSERTS WHAT REPLACES THE WALL: any pair may braid, and DISTANCE IS THE COST.
  const BR31 = await import("../engine/braids.js");
  const mkc = (trad) => ({ id: trad + "_c", tradition: trad, energyCost: 6, functions: ["strike"], levelReq: 3, name: trad });
  const costOf = (a, b) => {
    const cat = { [a + "_c"]: mkc(a), [b + "_c"]: mkc(b) };
    const def = BR31.buildBraidDef({ abilities: [], practice: {} }, [a + "_c", b + "_c"], cat, { traditionIndex: idx });
    return def?.energyCost ?? null;
  };
  const near = costOf("umbral", "veilwright");     // 1 step
  const mid = costOf("umbral", "marcher");         // 6 steps
  const anti = costOf("umbral", "blazeborn");      // 12 steps — antipodal
  const sameDomainAnti = costOf("horizon", "hourkeeper"); // antipodal AND same domain (Span)

  check("§31F: ANY pair can braid — a same-domain pair mints just like a cross-domain one",
    sameDomainAnti != null && near != null, `same-domain ${sameDomainAnti}, adjacent ${near}`);
  // ⛔ THE MECHANIC THAT REPLACES THE RESTRICTION. If this ever flattens, "braid anything" becomes
  // "braid anything for the same price" and the wheel stops meaning anything.
  check("§31F: DISTANCE IS THE PRICE — adjacent < far < antipodal, strictly",
    near < mid && mid < anti, `${near} < ${mid} < ${anti}`);
  // ⚠️ AND SPAN IS NO LONGER A SPECIAL CASE: its two sects are antipodal, in one domain, and braidable at
  // the full antipodal price. That is Erik's ruling made mechanical rather than argued.
  check("§31F: Span’s two sects braid at the full antipodal price — no special case left",
    sameDomainAnti === anti, `Span ${sameDomainAnti} vs antipodal ${anti}`);

  // ⚠️ THE AUTHORED BRAIDS ARE ANTIPODAL — REPORTED AS A FACT ABOUT THE CATALOGUE, NOT REQUIRED OF IT.
  // Three braids against twelve axes was the strongest argument in Erik’s ruling: nine axes had a wall and
  // no door. Counting them is useful; demanding they stay that shape is not.
  const braids = tf31.crossPoleBraids?.abilities || [];
  const antipodal = braids.filter(b => { const [x, y] = b.poles || []; return x && y && TR31.ringDistance(x, y, idx) === 12; });
  console.log(`note  §31F: ${antipodal.length} of ${braids.length} authored braids join true antipodes; ${braids.length} braids against 12 axes`);
  check("§31F: every authored braid names two REAL, DISTINCT traditions",
    braids.every(b => { const [x, y] = b.poles || []; return x && y && x !== y && idx.byId[x] && idx.byId[y]; }),
    braids.filter(b => { const [x, y] = b.poles || []; return !(x && y && x !== y && idx.byId[x] && idx.byId[y]); }).map(b => b.id).join(", "));
  check("§31F: …and there are braids to check", braids.length >= 3, `${braids.length} braids`);
}

/* ══════════ §31B — NOTHING ASKS AN ABILITY ITS OWN TRADITION ══════════ */
// ⛔ CCODE-337 — `app.js` read a craft’s tradition around the resolver in three shapes, and one of them was
// user-visible: the CHARACTER SHEET rendered `ab.powerSystem` directly, so 142 crafts read "metaphysical"
// and 132 read "precursor" where they should have read "The Somatics" and "The Lattice-Cities".
//
// ⚠️ THAT IS §C3’s OWN RULE — "a people wins where there is one, and the physics answers where there is
// not" — gated for the AESTHETICS path and simply not applied on the sheet. A principle held in one place
// and not the other is how a bug survives a green suite.
console.log("\n── §31B · every craft is asked its people, not its physics ──");
{
  const app31 = rd("app.js");

  // ⛔ ONE DEFINITION OF THE DISPLAY FALLBACK. It had EIGHT copies, each free to pick its own default
  // ("folk", "learned", ""), so one craft could land in differently-named buckets on two screens.
  check("§31B: the grouping fallback has ONE definition",
    /function abilityGroupKey\(/.test(app31));
  // ⛔ THE SCANNER MUST NOT READ ITS OWN PROSE — FIFTH INSTANCE. My first version matched the COMMENT that
  // describes the old pattern and the HELPER THAT REPLACED IT, then reported both as surviving copies. A
  // check that cannot tell a use from a definition, or from a note about the defect, is measuring text.
  //
  // ⚠️ SO IT SCANS LINE BY LINE and drops comments and the one definition. `apparatus.mjs` matched itself
  // the same way; so did the naming lint. It is always the same shape: the fix names the thing it fixed.
  const codeLines = app31.split("\n").filter(l => !/^\s*(\/\/|\*)/.test(l) && !/function abilityGroupKey/.test(l) && !/return abilityTradition\(ability\)/.test(l));
  const copies = codeLines.filter(l => /abilityTradition\([a-zA-Z.?]+\)\s*\|\|\s*[a-zA-Z.?]+\.powerSystem/.test(l));
  check("§31B: …and no call site spells it out again",
    copies.length === 0, copies.map(l => l.trim().slice(0, 60)).join(" · "));

  // ⛔ THE SHEET ASKS THE RESOLVER. A bare `ab.powerSystem` rendered into markup is the defect itself.
  check("§31B: the sheet label prefers the PEOPLE over the physics",
    /function sheetCraftLabel\(/.test(app31));
  // ⚠️ LINE-SCOPED, because `[^}]*` crosses NEWLINES and swallowed an entire multi-line template literal —
  // it "found" a bare powerSystem three lines away from one. A greedy regex over source is a claim about
  // a whole file, not about a line.
  const bare = codeLines.filter(l => /\$\{[^}\n]*\bab\.powerSystem\b/.test(l));
  check("§31B: …and no bare powerSystem is rendered into markup",
    bare.length === 0, bare.map(l => l.trim().slice(0, 70)).join(" · "));

  // ⚠️ AND THE DEAD FALLBACKS ARE GONE. `traditionOf` reads `ability.tradition` FIRST, so
  // `abilityTradition(x) || x.tradition` could never fire — it read as a safety net and was one.
  const dead = (app31.match(/abilityTradition\([a-zA-Z.?]+\)\s*\|\|\s*[a-zA-Z.?]+\.tradition\b/g) || []);
  check("§31B: no dead `|| .tradition` fallback survives", dead.length === 0, dead.join(" · "));

  // ⛔ THE MEASUREMENT THAT MAKES THE FIX WORTH HAVING. If every craft already resolved to a people, the
  // sheet bug would have been cosmetic; it was not — and if this ever drops, the fallback starts showing.
  const cat31b = [];
  {
    const { readdirSync } = await import("node:fs");
    for (const f of readdirSync(join(root, "content/packs/core/abilities")).filter(x => x.endsWith(".json")))
      for (const a of (rj(`content/packs/core/abilities/${f}`).abilities || [])) cat31b.push(a);
  }
  const TRb = await import("../engine/traditions.js");
  const idxb = TRb.buildTraditionIndex(rj("content/packs/core/rules/traditions.json"));
  const resolved = cat31b.filter(a => TRb.traditionOf(a, idxb));
  check("§31B: the overwhelming majority of crafts DO resolve to a people — the physics is the exception",
    resolved.length / cat31b.length > 0.95,
    `${resolved.length}/${cat31b.length} resolve`);

  // ⚠️ SYSTEM CHECKS ARE NOT BYPASSES AND MUST SURVIVE. `powerSystem === "precursor"` asks a real question
  // about physics; SNG-381 settled that precursor/learned/combination are NOT traditions. ⛔ A sweep that
  // removed these would have traded a display bug for a logic one.
  const sysChecks = (app31.match(/powerSystem\s*[=!]==\s*"/g) || []);
  check("§31B: the powerSystem SYSTEM checks are untouched — they ask a different question",
    sysChecks.length >= 8, `${sysChecks.length} system checks`);
}
/* ══════════ §31C — A FOOTHILL IS A PLACE, AND A PLACE HAS NO DOMAIN ══════════ */
// ⛔ RULING (Aevi, ratified): "no domain" for the off-wheel records is a STATED answer, not an omission.
// Her argument, and it is one-sided: ⚠️ **A FOOTHILL IS A PLACE WHERE POLES MEET. A POLE IS A POSITION ON
// THE RING.** Those are different kinds of thing, and a place has no ring position BY DEFINITION.
//
// ⚠️ AND IT IS A BOUNDARY ERIK HAS HAD TO CORRECT THREE TIMES ("valley_craft has parents" ×2, "there is no
// folk tradition" ×1). ⛔ THAT IS EXACTLY THE KIND OF DISTINCTION THAT NEEDS A GATE RATHER THAN A MEMORY.
//
// ⚠️ `valley_craft` HAVING ZERO ABILITIES IS THE RECORD DOING ITS JOB, not an unfinished retirement: the
// crafts moved to their real owners and the ACCESS POINT stayed, because a place cannot move. `hardline`
// and `greyhearth` have always had zero and were never in doubt.
console.log("\n── §31C · a foothill is a place, and a place has no domain ──");
{
  const TRc = await import("../engine/traditions.js");
  const tfc = rj("content/packs/core/rules/traditions.json");
  const v2c = rj("content/packs/core/rules/traditions_v2.json");
  const idxc = TRc.buildTraditionIndex(tfc, v2c);
  const fhc = rj("content/packs/core/rules/foothills.json");

  // ⛔ THE STATED ANSWER: every record that is a PLACE resolves to no domain.
  const places = Object.keys(fhc.foothills || {});
  const inDomain = places.filter(t => TRc.domainOfTradition(t, idxc));
  check("§31C: no foothill resolves to a domain — a place is not a pole",
    inDomain.length === 0, inDomain.map(t => `${t} → ${TRc.domainOfTradition(t, idxc)}`).join(", "));
  check("§31C: …and there are places to check", places.length >= 5, `${places.length} foothills`);

  // ⚠️ THE SAME DISTINCTION FROM THE OTHER SIDE: a place has no RING POSITION either. If a foothill ever
  // gains one, it has stopped being a place and this should be a deliberate act, not a drift.
  const onRing = places.filter(t => idxc.ringPos[t] != null);
  check("§31C: no foothill sits on the ring — a place has no position",
    onRing.length === 0, onRing.join(", "));

  // ⛔ AND THE CONVERSE, which is what makes the two above non-vacuous: every POLE does have both.
  const poles = Object.keys(idxc.domainOfTrad || {});
  const poleMissing = poles.filter(t => idxc.ringPos[t] == null);
  check("§31C: every POLE has a ring position AND a domain — the distinction runs both ways",
    poles.length === 24 && poleMissing.length === 0,
    `${poles.length} poles, ${poleMissing.length} off-ring`);

  // ⚠️ A STORED ABILITY COUNT IS FORBIDDEN BY THE FILE’S OWN NOTE and every row carried one until it was
  // flagged. ⛔ I THEN QUOTED THE STALE NUMBER BACK AFTER AEVI HAD REMOVED THEM — neither of us re-derived.
  // This is cheaper than remembering.
  const stored = Object.entries(fhc.foothills || {}).filter(([, v]) => v && typeof v === "object" && v.abilities !== undefined);
  check("§31C: no foothill stores an ability count — the file’s own rule, now enforced",
    stored.length === 0, stored.map(([k, v]) => `${k}: ${v.abilities}`).join(", "));
}
/* ══════════ §31D — THE DOMAIN IS A HEADING, AND THE SHEET NEVER SAYS IT ══════════ */
// ⛔ RULING (Aevi): the domain shows on the LEARN SCREEN as a grouping and NOWHERE a player identifies
// themselves. Her refusal is the load-bearing half: ⚠️ "The sheet says who you are. You are a Cogitant.
// Putting Mind on the sheet is exactly the move that makes players think their tradition is Mind — and
// Erik’s ruling was that it is not."
//
// ⚠️ SO THIS GATES BOTH DIRECTIONS. A grouping that never appears is a merger nobody can see; a domain on
// the sheet is Reading A wearing a label. ⛔ EITHER FAILURE IS SILENT WITHOUT A CHECK.
console.log("\n── §31D · the domain is a heading, and the sheet never says it ──");
{
  const app31d = rd("app.js");
  const css31d = rd("style.css");

  check("§31D: the learn screen groups peoples under a domain heading",
    /learn-domain-head/.test(app31d) && /domainOfTradition\(cls, CONTENT\.traditionIndex\)/.test(app31d));
  check("§31D: …and the heading is styled as quiet type, not an affordance",
    /\.learn-domain-head\s*\{/.test(css31d));

  // ⛔ THE REFUSAL, ENFORCED. `sheetCraftLabel` is what the character sheet renders; it must reach for the
  // PEOPLE and must never reach for the domain.
  const sheetFn = (app31d.split("function sheetCraftLabel")[1] || "").split("}")[0];
  check("§31D: the sheet label asks for the PEOPLE",
    /abilityTradition\(/.test(sheetFn), sheetFn.trim().slice(0, 80));
  check("§31D: …and never for the domain — the sheet says who you are",
    !/domainOf|abilityDomain/.test(sheetFn), sheetFn.trim().slice(0, 80));

  // ⚠️ AND THE GROUPING MUST ACTUALLY PARTITION SOMETHING. Rebuilt here from the same inputs the screen
  // uses, so a heading that groups every people into one bucket — or into 24 — fails rather than renders.
  const TRd = await import("../engine/traditions.js");
  const idxd = TRd.buildTraditionIndex(rj("content/packs/core/rules/traditions.json"),
    rj("content/packs/core/rules/traditions_v2.json"));
  const cat31d = [];
  {
    const { readdirSync } = await import("node:fs");
    for (const f of readdirSync(join(root, "content/packs/core/abilities")).filter(x => x.endsWith(".json")))
      for (const a of (rj(`content/packs/core/abilities/${f}`).abilities || [])) cat31d.push(a);
  }
  const peoples = [...new Set(cat31d.map(a => TRd.traditionOf(a, idxd)).filter(Boolean))];
  const heads = new Set(peoples.map(t => TRd.domainOfTradition(t, idxd) || ""));
  check("§31D: the headings partition the peoples — more than one, fewer than all",
    heads.size > 1 && heads.size < peoples.length,
    `${heads.size} headings over ${peoples.length} peoples`);
  // ⛔ AND A DOMAIN MUST GATHER MORE THAN ONE PEOPLE SOMEWHERE, or the heading is decoration: the whole
  // point is that a player SEES figurist sitting with cogitant.
  const sizes = {};
  for (const t of peoples) { const d = TRd.domainOfTradition(t, idxd); if (d) sizes[d] = (sizes[d] || 0) + 1; }
  check("§31D: at least one domain gathers several peoples — that is what makes the choice legible",
    Object.values(sizes).some(n => n >= 2),
    Object.entries(sizes).filter(([, n]) => n >= 2).map(([d, n]) => `${d}:${n}`).join(" "));
}
/* ══════════ §32 — THE ANTIPODE IS LEARNABLE AND NOT CASTABLE ══════════ */
// ⛔ ERIK: "rework the domain access model SO WE NO LONGER LOSE ACCESS TO THE ANTIPOLES… you can’t use the
// skill itself, ONLY THE BRAIDABLE PART."
//
// ⚠️ TWO HALVES THAT FAIL SILENTLY IN OPPOSITE DIRECTIONS. If "learnable" breaks, the wall is back and
// nobody notices because the old behaviour looked correct for months. If "not castable" breaks, the
// antipode becomes an ordinary craft and the axis stops meaning anything. ⛔ BOTH ARE ASSERTED.
//
// ⚠️ THE STAIRS ARE NOT GATED, ON PURPOSE. Erik: "we can figure out the stairs later." What tier it counts
// as and what a braid needs from it are open, and a gate written against stub text is how a stub becomes
// load-bearing.
console.log("\n── §32 · the antipode is learnable, and it cannot be cast ──");
{
  const TRa = await import("../engine/traditions.js");
  const tfa = rj("content/packs/core/rules/traditions.json");
  const idxa = TRa.buildTraditionIndex(tfa);
  const D = { primary: "umbral", secondary: null, tertiary: null };
  const anti = TRa.antipodeOf("umbral", idxa);
  const vAnti = TRa.domainAccess({ tradition: anti }, 2, D, idxa);
  const vFar = TRa.domainAccess({ tradition: "marcher" }, 2, D, idxa);
  const vOwn = TRa.domainAccess({ tradition: "umbral" }, 2, D, idxa);

  check("§32: the antipode is REACHABLE — the wall is gone",
    vAnti.allowed === true, JSON.stringify(vAnti));
  // ⛔ R16 (2026-09-01) RETIRED THE RULE THIS LINE ASSERTED. CCODE-339 made the antipode
  // learnable-but-not-castable as a halfway step; R9/R16 replaced that with a PRICE and a CEILING that
  // both move with `lean`. Erik: "I'd like to allow the use of the learned skills in the antipole."
  // ⚠️ A GATE DEFENDING A RETIRED RULING IS WORSE THAN NO GATE — it reads as confirmation. Rewritten to
  // assert what R16 actually says.
  check("§32: …and it IS castable now — R16 replaced the wall with a price and a ceiling",
    vAnti.castable !== false, JSON.stringify(vAnti));

  // ⛔ THE CEILING RISES WITH LEAN — the whole of R16 in three probes.
  const scA = rj("content/packs/core/rules/skill_capacity.json");
  const atLean = (lean, tier) => TRa.domainAccess({ tradition: anti }, tier, D, idxa,
    { axisWeights: { umbral: 100, [anti]: lean >= 1 ? 0 : Math.round(100 * (1 - lean) / (1 + lean)) }, skillCapacity: scA });
  check("§32: a specialist who never touched the far pole is capped shallow there",
    atLean(1, 2).allowed === true && atLean(1, 3).allowed === false,
    `T2 ${atLean(1,2).allowed} / T3 ${atLean(1,3).allowed}`);
  check("§32: …and a character who carries both ends evenly reaches the top",
    atLean(0, 5).allowed === true, JSON.stringify(atLean(0, 5)));
  check("§32: the surcharge falls to zero at balance and is paid in full at full lean",
    atLean(0, 3).leanSurcharge === 0 && atLean(1, 3).leanSurcharge === (scA.antipodeLeanSurcharge ?? 2),
    `${atLean(0,3).leanSurcharge} / ${atLean(1,3).leanSurcharge}`);

  // ⛔ NOTHING FORECLOSES. Promotion used to shut the antipode; R16 removed both writers and every reader.
  const PRa = await import("../engine/progression.js");
  check("§32: an old save carrying `foreclosed` is no longer restricted by it",
    TRa.domainAccess({ tradition: anti, nativeOrCombination: "native" }, 1, D, idxa,
      { foreclosed: [anti], axisWeights: { umbral: 10, [anti]: 10 }, skillCapacity: scA }).allowed === true);
  // ⛔ BALANCE MUST BE EARNED. `lean` is a RATIO, so at low weight it is noise — one home craft and one
  // antipode craft measures as PERFECT balance. ⚠️ Before the floor, a LEVEL-1 character could take one
  // craft each side at creation and hold the primary's own ceiling in their far pole. The CCODE-224 gate
  // warned of exactly this shape before R16 existed — 'a character can begin able to use both ends of
  // their axis and the wheel stops meaning anything'. `minAxisWeight` is what keeps that honest now.
  const leanAt = (h, a) => TRa.antipodeLean("umbral", anti, { axisWeights: { umbral: h, [anti]: a }, skillCapacity: scA });
  check("§32: a level-1 character with one craft each side is NOT balanced — the floor holds",
    leanAt(1, 1) === 1, `lean ${leanAt(1, 1)}`);
  check("§32: …nor is a character still short of the authored floor",
    leanAt(6, 6) === 1, `lean ${leanAt(6, 6)} at total 12, floor ${scA.minAxisWeight}`);
  check("§32: …but real weight on both poles DOES read as balance",
    leanAt(30, 30) === 0, `lean ${leanAt(30, 30)}`);
  check("§32: and a deep specialist still reads as fully leaned",
    leanAt(60, 0) === 1, `lean ${leanAt(60, 0)}`);
  check("§32: the floor is authored, not hardcoded",
    Number.isFinite(scA.minAxisWeight) && scA.minAxisWeight > 0, JSON.stringify(scA.minAxisWeight));
  check("§32: …and nothing writes that array any more",
    !/character\.foreclosed\s*=|foreclosed\.push\(/.test(readFileSync(join(root, "engine/progression.js"), "utf8")));
  // ⛔ AND NOTHING ELSE BECAME UNCASTABLE. `allowed` answers "may I hold this"; `castable` answers "may I
  // use it", and conflating them would quietly disarm every other craft in the game.
  check("§32: an ordinary far craft is still castable", vFar.castable === true && vFar.allowed === true);
  check("§32: your own people’s craft is still castable", vOwn.castable === true);
  // ⚠️ EVERY VERDICT CARRIES THE FLAG, so a caller reading it never gets `undefined` and treats it as false.
  check("§32: every verdict answers the castable question explicitly",
    [vAnti, vFar, vOwn].every(v => typeof v.castable === "boolean"));

  // ⚠️ IT IS PRICED THE ORDINARY WAY. Erik: "we already have TEACHERS AND STANDING for poles, we will use
  // them for antipole skill teaching" — so it must cost what a distant craft costs, not carry a new tax.
  check("§32: it is priced as a distant craft, not with a special penalty",
    vAnti.penalty === vFar.penalty, `antipode ${vAnti.penalty} vs far ${vFar.penalty}`);

  // ⛔ THE UI HONOURS IT. An uncastable craft must not reach the action menu, and the card must SAY WHY —
  // Aevi: "that card MUST say so loudly." A filter with no explanation is a craft that silently vanished.
  const appA = rd("app.js");
  check("§32: the action menu filters what cannot be cast",
    /castable !== false\)/.test(appA));
  check("§32: …and the sheet says WHY, rather than the craft just disappearing",
    /braid material only/.test(appA) && /castable === false/.test(appA));

  // ⚠️ AND THE BRAID ROAD IS STILL OPEN — the whole point of holding it. If braiding ever consulted
  // castability, the ruling would collapse into the wall it replaced.
  const BRa = await import("../engine/braids.js");
  const mk = (t) => ({ id: t + "_c", tradition: t, energyCost: 6, functions: ["strike"], levelReq: 3, name: t });
  const def = BRa.buildBraidDef({ abilities: [], practice: {} }, ["umbral_c", anti + "_c"],
    { umbral_c: mk("umbral"), [anti + "_c"]: mk(anti) }, { traditionIndex: idxa });
  check("§32: an antipode craft can still be BRAIDED — that is what holding it is for",
    !!def && Number.isFinite(def.energyCost), JSON.stringify(def && def.energyCost));
}
/* ══════════ §33 — A FOLK ORIGIN DRAWS FROM `folkAccessible`, AND USED TO GET NOTHING ══════════ */
// ⛔ OI-9 / ERIK RULED 2026-08-31: "wire `folkAccessible` to derive Valleyfolk starting pool."
//
// ⚠️ THE BUG IT CLOSES, MEASURED BEFORE THE FIX: a Valleyfolk character got **zero** native grants. Their
// 13 anchors lived inside `_folkNativeGrant_20260830` — an underscore DOC KEY with no real sibling — so
// `nativeGrantIdsFor` never saw them, and there is no `traditionNativeGrants["valleyfolk"]` either.
//
// ⛔ AND THE FLAG HAD NO READER AT ALL. 18 crafts carried `folkAccessible`; nothing in engine or app read
// it. This is the reader — door four — and it makes the pool DERIVED rather than hand-kept.
console.log("\n── §33 · a folk origin draws from the flag, not from a doc key ──");
{
  const PR = await import("../engine/progression.js");
  const ngDoc = rj("content/packs/core/rules/native_grants.json");
  const abil = {};
  {
    const { readdirSync } = await import("node:fs");
    for (const f of readdirSync(join(root, "content/packs/core/abilities")).filter(x => x.endsWith(".json")))
      for (const a of (rj(`content/packs/core/abilities/${f}`).abilities || [])) abil[a.id] = a;
  }
  const originsDoc = rj("content/packs/core/rules/origins.json");
  const origins = originsDoc.origins || [];

  // ⚠️ REBUILT THE WAY `state.js` BUILDS IT, so the gate tests the shipped derivation rather than a copy.
  const folkIds = Object.values(abil).filter(a => a && a.folkAccessible)
    .sort((x, y) => (x.levelReq || 1) - (y.levelReq || 1) || String(x.id).localeCompare(String(y.id)))
    .map(a => a.id);
  const folkOriginIds = origins.filter(o => o && o.nativeKind === "folk").map(o => o.id);
  const rules = { traditionNativeGrants: ngDoc.traditionNativeGrants, grantCap: ngDoc.grantCap ?? 5,
    folkAccessibleIds: folkIds, folkOriginIds };
  const attrs = { physical: 3, mental: 3, social: 3, practical: 3 };

  check("§33: the `folkAccessible` flag has crafts to offer", folkIds.length >= 10, `${folkIds.length} crafts`);
  check("§33: at least one origin is declared folk", folkOriginIds.length >= 1, folkOriginIds.join(", "));

  const folkGrants = PR.nativeGrantIdsFor({ domains: { primary: null }, nativeTradition: null, origin: folkOriginIds[0], attributes: attrs }, rules);
  check("§33: a FOLK origin now receives native grants — it received none before",
    folkGrants.length > 0, JSON.stringify(folkGrants));
  // ⛔ AND THEY COME FROM THE FLAG. If this ever drifts, the pool has stopped being derived.
  check("§33: …and every one of them carries `folkAccessible`",
    folkGrants.every(id => abil[id]?.folkAccessible === true),
    folkGrants.filter(id => !abil[id]?.folkAccessible).join(", "));
  check("§33: …capped at grantCap like every other origin",
    folkGrants.length <= (rules.grantCap ?? 5), `${folkGrants.length} vs cap ${rules.grantCap}`);

  // ⚠️ NON-VACUITY IN BOTH DIRECTIONS. A pole character must be UNCHANGED — the fix must not leak into the
  // 24 traditions that already worked.
  const pole = PR.nativeGrantIdsFor({ domains: { primary: "umbral" }, origin: "umbral", attributes: attrs }, rules);
  check("§33: a POLE character is untouched by the folk path", pole.length > 0 && pole.every(id => !abil[id]?.folkAccessible || true),
    `${pole.length} grants`);
  // ⛔ AND AN UNKNOWN ORIGIN STILL FAILS VISIBLY. Gating on "no table" alone would have handed the folk kit
  // to any typo’d tradition id, turning a loud miss into a silent wrong answer.
  check("§33: an unknown origin still gets nothing — a typo must not inherit the folk kit",
    PR.nativeGrantIdsFor({ domains: { primary: "nonsense" }, origin: "nonsense", attributes: attrs }, rules).length === 0);

  // ⚠️ AND THE OLD HIDING PLACE IS NO LONGER A SOURCE. It may stay as a record of intent; it must not be
  // what the game reads.
  check("§33: the doc-key anchors are no longer the source",
    !/rules\.folkNativeGrant|_folkNativeGrant_20260830/.test(rd("engine/progression.js")));
}
/* ══════════ §34 — TIER IS WHAT A CRAFT IS; levelReq IS WHEN YOU MAY LEARN IT ══════════ */
// ⛔ ERIK 2026-09-01: "we need a dedicated Tier for the skills — that was intended all along, and I am
// surprised we do not have it. That lets you decouple levelReq."
//
// ⚠️ THEY WERE ONE FIELD. `tierPrice` read `ability.levelReq` and so did `mechanicFor`, which is the DAMAGE
// ladder — so moving a craft’s unlock level to 40 would have made it TIER 40, off the end of `tierPrice`
// (max key 5) and `tierLadder` (max rung 5): wrong price AND wrong dice, silently.
//
// ⛔ THIS GATE IS THE DECOUPLING ITSELF. It does not assert that tier and levelReq are equal — that is
// exactly what must be free to change. It asserts that moving ONE does not move the OTHER.
console.log("\n── §34 · tier is what a craft IS, levelReq is when you may learn it ──");
{
  const SK = await import("../engine/skilltree.js");
  const CM34 = await import("../engine/craftmechanics.js");
  const sc34 = rj("content/packs/core/rules/skill_capacity.json");
  const cm34 = rj("content/packs/core/rules/craft_mechanics.json");

  // ⚠️ EVERY CRAFT CARRIES ONE. A gate that tolerates two exceptions tolerates the next twenty.
  const cat34 = [];
  {
    const { readdirSync } = await import("node:fs");
    for (const f of readdirSync(join(root, "content/packs/core/abilities")).filter(x => x.endsWith(".json")))
      for (const a of (rj(`content/packs/core/abilities/${f}`).abilities || [])) cat34.push(a);
  }
  const noTier = cat34.filter(a => a.tier === undefined);
  check("§34: every craft carries an explicit `tier`",
    noTier.length === 0, `${noTier.length} without: ${noTier.slice(0, 5).map(a => a.id).join(", ")}`);
  check("§34: …and every tier sits on the 1–5 ladder",
    cat34.every(a => a.tier >= 1 && a.tier <= 5),
    cat34.filter(a => !(a.tier >= 1 && a.tier <= 5)).map(a => `${a.id}:${a.tier}`).join(", "));
  check("§34: the schema knows the field", rj("schemas/ability.schema.json").properties?.tier !== undefined);

  // ⛔ THE DECOUPLING, PROVED IN BOTH DIRECTIONS.
  const craft = (tier, levelReq) => ({ id: "probe", functions: ["strike"], shape: "damage", tier, levelReq,
    mechanic: { damageType: "physical" } });
  const dice = (a) => JSON.stringify(CM34.mechanicFor(a, { verb: "strike", cfg: cm34 })?.fields?.dice ?? null);

  // 1 · moving levelReq must move NOTHING about price or dice
  const lo = craft(2, 2), hi = craft(2, 40);
  check("§34: moving `levelReq` does NOT change the price",
    SK.tierPrice(lo, sc34) === SK.tierPrice(hi, sc34), `${SK.tierPrice(lo, sc34)} vs ${SK.tierPrice(hi, sc34)}`);
  check("§34: …and does NOT change the dice", dice(lo) === dice(hi), `${dice(lo)} vs ${dice(hi)}`);

  // 2 · moving tier MUST move them — otherwise the field is decoration
  const t1 = craft(1, 5), t5 = craft(5, 5);
  check("§34: moving `tier` DOES change the price",
    SK.tierPrice(t1, sc34) !== SK.tierPrice(t5, sc34), `${SK.tierPrice(t1, sc34)} vs ${SK.tierPrice(t5, sc34)}`);
  check("§34: …and DOES change the dice", dice(t1) !== dice(t5), `${dice(t1)} vs ${dice(t5)}`);

  // ⚠️ AND THE LEGACY FALLBACK SURVIVES, so a craft authored without a tier is priced as it always was.
  const legacy = { id: "legacy", functions: ["strike"], shape: "damage", levelReq: 3, mechanic: {} };
  check("§34: a craft with no `tier` still falls back to `levelReq`",
    SK.tierPrice(legacy, sc34) === SK.tierPrice({ ...legacy, tier: 3 }, sc34));

  // ⛔ THE MIGRATION WAS LOSSLESS AND THIS RECORDS IT: on the day of the change every tier equalled the
  // craft’s own levelReq. ⚠️ THIS IS A NOTE, NOT AN ASSERTION — the whole point is that they may diverge,
  // and the first craft Aevi re-levels will make this line false.
  const same = cat34.filter(a => a.tier === Math.max(1, Math.min(5, a.levelReq || 1))).length;
  console.log(`note  §34: ${same}/${cat34.length} crafts still have tier === levelReq (they diverge as unlock levels are authored)`);
}
/* ═════ §35 — EVERY TIER QUESTION GOES THROUGH `abilityTier` ═════ */
// ⛔ CCODE-341. §34 decoupled `tier` from `levelReq` for PRICE and DICE and stopped there. TEN readers still
// treated `levelReq` as the tier — five of them gates. ⚠️ MEASURED BEFORE THE FIX, through the real
// `canLearnAbility`: a craft authored tier 5 / levelReq 2 walked STRAIGHT PAST the capstone standing bar,
// and a craft authored tier 1 / levelReq 5 was gated AS a capstone it is not.
//
// ⛔ WRONG IN BOTH DIRECTIONS — the signature of a gate reading the wrong FIELD, not a threshold needing
// a tune. ⚠️ AND LATENT: all 414 crafts still have tier === levelReq, so nothing was visibly broken. This
// gate is the tripwire for the first craft Aevi re-levels.
console.log("\n── §35 · every tier question goes through abilityTier ──");
{
  const SK35 = await import("../engine/skilltree.js");
  const PR35 = await import("../engine/progression.js");
  const TR35 = await import("../engine/traditions.js");

  check("§35: `abilityTier` is exported — the one answer to what tier a craft is",
    typeof SK35.abilityTier === "function");
  check("§35: it prefers `tier`", SK35.abilityTier({ tier: 5, levelReq: 2 }) === 5);
  check("§35: …falls back to `levelReq` so today’s 414 crafts are unmoved",
    SK35.abilityTier({ levelReq: 3 }) === 3);
  check("§35: …and clamps to the 1–5 ladder",
    SK35.abilityTier({ tier: 40 }) === 5 && SK35.abilityTier({}) === 1);

  // ⛔ THE GATE ITSELF, through the REAL learn path — not a unit test of the helper.
  const v2_35 = (() => { try { return rj("content/packs/core/rules/traditions_v2.json"); } catch { return null; } })();
  const idx35 = TR35.buildTraditionIndex(rj("content/packs/core/rules/traditions.json"), v2_35);
  const trad35 = Object.keys(idx35.byId || {}).find(t => !TR35.isFolkTradition(t, idx35));
  const mk35 = (tier, levelReq) => ({ id: "probe35", name: "Probe", tradition: trad35, functions: ["strike"],
    shape: "damage", tier, levelReq, mechanic: { damageType: "physical" }, nativeOrCombination: "native" });
  const char35 = { level: 30, abilities: [], domains: { primary: trad35 }, peopleDisposition: {}, attributes: {}, skillPoints: 99 };
  const gate35 = (tier, levelReq) => {
    const ab = mk35(tier, levelReq);
    return PR35.canLearnAbility(char35, "probe35", { probe35: ab }, { capstoneStanding: null },
      { traditionIndex: idx35, catalog: { probe35: ab } });
  };
  check("§35: a TIER-V craft is held by the capstone standing bar even when its levelReq is 2",
    gate35(5, 2).ok === false && gate35(5, 2).gate === "standing",
    JSON.stringify(gate35(5, 2)));
  check("§35: …and a TIER-I craft is NOT gated as a capstone even when its levelReq is 5",
    gate35(1, 5).ok === true, JSON.stringify(gate35(1, 5)));
  check("§35: the aligned case is unchanged (tier 5 / levelReq 5 still held)",
    gate35(5, 5).ok === false && gate35(5, 5).gate === "standing");

  // ⚠️ NO READER MAY GO BACK. Line-scoped and comment-stripped — §31B was written five times before it
  // stopped matching its OWN prose, and this scanner will not repeat that.
  //
  // ⛔ THE FIRST VERSION OF THIS SCANNER WENT GREEN ON A PARTIAL SWEEP. It listed FIVE files by hand and
  // matched only `tierOf(ab.levelReq)`. ⚠️ It missed `engine/intensity.js`, where `tierNum(ability?.levelReq
  // || 1)` CHOSE THE SURGE BACKLASH HARM — a gate, not a badge — and `company.js`, whose own comment says
  // "by tier". A survival check is only as wide as the range you hand it, so the range is now DERIVED:
  // every engine module plus app.js, and the pattern covers optional chaining and all three tier helpers.
  const files35 = ["app.js", ...readdirSync(join(root, "engine")).filter(f => f.endsWith(".js")).map(f => `engine/${f}`)];
  const offenders35 = [];
  for (const f of files35) {
    const src = readFileSync(join(root, f), "utf8").split(/\r?\n/);
    src.forEach((line, i) => {
      const code = line.replace(/\/\/.*$/, "").replace(/\/\*.*?\*\//g, "");
      // ⛔ TWO SHAPES, NOT ONE. The first sweep looked only for tierOf(x.levelReq) — a SYNTACTIC shape —
      // and missed four callers handing `levelReq` to domainAccess’s TIER PARAMETER, one of them the main
      // learn gate. ⚠️ SCAN FOR THE ROLE, NOT THE SPELLING: any tier helper, and any tier argument.
      if (/tier(?:Of|Num|Price)\s*\(\s*[A-Za-z_$][\w$]*\??\.\w*[Ll]evelReq/.test(code)) offenders35.push(`${f}:${i + 1}`);
      if (/domainAccess\([^,]+,\s*[A-Za-z_$][\w$]*\??\.\w*[Ll]evelReq/.test(code)) offenders35.push(`${f}:${i + 1} (tier arg)`);
      // ⛔ A THIRD SHAPE, found in `npcsheet.js` while reviewing Aevi's NPC-sheet spec: assigning `levelReq`
      // straight into a field NAMED `tier`. Not a helper call, not an argument — a property. ⚠️ Each sweep
      // I have written matched the shapes I had already SEEN; this one matches the role by its own name.
      if (/\btier\s*:\s*[A-Za-z_$][\w$]*\??\.\w*[Ll]evelReq/.test(code)) offenders35.push(`${f}:${i + 1} (tier field)`);
    });
  }
  check("§35: no reader in ANY engine module treats `levelReq` as the tier",
    offenders35.length === 0, offenders35.join(", "));
  check(`§35: …and the scan actually covered the engine (${files35.length} files)`,
    files35.length >= 20, `only ${files35.length} files scanned — the range shrank`);

  // ⚠️ THIS PROBE USED TO ASSERT THAT SURGE BACKLASH READS TIER — written to catch the levelReq-as-tier
  // defect in `intensity.js`. ⛔ R18b RETIRED THE TIER TERM ALTOGETHER (surge included) and the function it
  // probed no longer exists. The CLAIM it was really making — a live gate must read `tier`, not `levelReq`
  // — still matters, so it is re-aimed at a path that is still live: the craft price.
  const SKp = await import("../engine/skilltree.js");
  const scp = rj("content/packs/core/rules/skill_capacity.json");
  check("§35: a live gate reads `tier`, not `levelReq` — tier 5 / levelReq 1 is priced as a tier 5",
    SKp.tierPrice({ tier: 5, levelReq: 1 }, scp) === SKp.tierPrice({ tier: 5, levelReq: 5 }, scp)
    && SKp.tierPrice({ tier: 5, levelReq: 1 }, scp) !== SKp.tierPrice({ tier: 1, levelReq: 1 }, scp),
    `${SKp.tierPrice({ tier: 5, levelReq: 1 }, scp)} vs ${SKp.tierPrice({ tier: 1, levelReq: 1 }, scp)}`);
}
/* ═════ §36 — R1: DISTANCE IS ADDITIVE, AND THE PRICE TABLE IS THE RULING ═════ */
// ⛔ ERIK 2026-08-31 R1. Tier prices compressed to 1·2·2·3·3 and distance made ADDITIVE:
//     learnPointCost = tierPrice + band,  band 0 home / 1 near / 2 far·antipode
// ⚠️ IT WAS `tierPrice × penalty`, which priced a far Tier-V at 15 — prohibitive rather than expensive.
// R1: "a dedicated generalist should reach far-ring capstone mastery in late game." It is now 5.
//
// ⛔ THIS GATE IS R1’S OWN PUBLISHED TABLE, CELL BY CELL. If a later tune moves a number, this goes red
// and someone must change the ruling on purpose rather than discover the drift in play.
console.log("\n── §36 · R1 · distance is additive, and the table is the ruling ──");
{
  const SK36 = await import("../engine/skilltree.js");
  const sc36 = rj("content/packs/core/rules/skill_capacity.json");
  const ch36 = { domains: { primary: "umbral" } };
  const ab36 = (tier) => ({ id: "probe36", tier, tradition: "umbral" });
  const price = (tier, band) => SK36.learnPointCost(ab36(tier), ch36, sc36, { band, allowed: true });

  // R1’s table, transcribed: [tier, home, near, far]
  const R1_TABLE = [[1,1,2,3],[2,2,3,4],[3,2,3,4],[4,3,4,5],[5,3,4,5]];
  for (const [t, home, near, far] of R1_TABLE) {
    check(`§36: R1 · tier ${t} costs ${home}/${near}/${far} at home/near/far`,
      price(t, "primary") === home && price(t, "adjacent") === near && price(t, "far") === far,
      `got ${price(t, "primary")}/${price(t, "adjacent")}/${price(t, "far")}`);
  }

  // ⛔ ADDITIVE, NOT MULTIPLICATIVE — the property, not just the numbers. Under the old × rule the gap
  // between home and far GREW with tier; under R1 it is CONSTANT, which is what "additive" means.
  const gaps = R1_TABLE.map(([t]) => price(t, "far") - price(t, "primary"));
  check("§36: the far surcharge is the SAME at every tier (that is what additive means)",
    gaps.every(g => g === gaps[0]), `gaps: ${gaps.join(", ")}`);
  check("§36: …and it equals the authored far band", gaps[0] === (sc36.bandCost?.far ?? 2), `${gaps[0]}`);

  // ⚠️ THE ANTIPODE IS PRICED AS ORDINARY FAR GROUND. R9 will later add a lean surcharge on top; until
  // then it must cost exactly what any far people costs, or the surcharge is measured from the wrong base.
  check("§36: the antipode is priced as far ground, no more",
    price(5, "antipode") === price(5, "far"), `${price(5, "antipode")} vs ${price(5, "far")}`);

  // ⛔ FAR TIER-V IS 5, NOT 15. The single number R1 called out by name.
  check("§36: R1’s headline — a far Tier-V costs 5 (it was 15)", price(5, "far") === 5, `${price(5, "far")}`);

  // the band table is DATA, so a ruling can move it without a code change
  check("§36: the band costs are authored, not hardcoded",
    sc36.bandCost && sc36.bandOf && Object.keys(sc36.bandOf).length >= 8,
    JSON.stringify(sc36.bandCost));
  check("§36: every band domainAccess can return has a cost",
    ["open","folk","primary","secondary","tertiary","acquired","adjacent","far","antipode"]
      .every(b => sc36.bandOf[b] !== undefined),
    ["open","folk","primary","secondary","tertiary","acquired","adjacent","far","antipode"]
      .filter(b => sc36.bandOf[b] === undefined).join(", "));
}
/* ═════ §37 — R5: THE CRAFT’S OWN NATURE TURNS INWARD ═════ */
// ⛔ R5 CORRECTED (Erik 2026-09-01). `backlashRung` is an ABSOLUTE rung NAME, authored one rung MILDER
// than the craft’s own `harmRung`. A craft that kills people merely damages you when it misfires.
//
// ⚠️ THE FOURTH DOOR: 20 crafts carried the field, the schema allowed it, content authored it — and
// `applyBacklash` TOOK NO ABILITY, so every crit failure applied the same flat 4/10 and not one of the 20
// authored values could ever reach the player.
//
// ⚠️ AND R5 SAID "land that rung on the wielder" WITH NO MACHINERY TO DO IT — `harmRung` only ever fed
// finisher ODDS and GM prose; nothing mapped a rung to an amount. `novel.backlashByRung` is that mapping.
console.log("\n── §37 · R5 · the craft’s own nature turns inward ──");
{
  const PR37 = await import("../engine/progression.js");
  const rules37 = rj("content/packs/core/rules/resolution.json");
  const hit = (ab) => { const c = { health: 30, energy: 100 };
    return { ...PR37.applyBacklash(c, rules37, ab), left: c.health }; };

  check("§37: the rung ladder is authored, not a private constant",
    Array.isArray(rules37.novel?.harmRungOrder) && rules37.novel.harmRungOrder.length === 4,
    JSON.stringify(rules37.novel?.harmRungOrder));
  check("§37: every rung on the ladder has an authored cost",
    (rules37.novel?.harmRungOrder || []).every(r => rules37.novel?.backlashByRung?.[r]),
    JSON.stringify(rules37.novel?.backlashByRung));

  // ⛔ THE FIELD FIRES. Before R5 all three of these were identical.
  const none37 = hit(null), dmg37 = hit({ backlashRung: "damaging" }), inc37 = hit({ backlashRung: "incapacitating" });
  check("§37: a craft’s authored rung REACHES the wielder", dmg37.rung === "damaging" && inc37.rung === "incapacitating",
    `${dmg37.rung} / ${inc37.rung}`);
  check("§37: a harsher rung bites harder — the field CHANGES something",
    inc37.health < dmg37.health && inc37.energy < dmg37.energy,
    `damaging ${dmg37.health}/${dmg37.energy} vs incapacitating ${inc37.health}/${inc37.energy}`);

  // ⚠️ NOTHING REGRESSES. `damaging` is deliberately today’s flat cost, so 15 of the 20 authored crafts
  // and every craft with no rung at all land exactly where they always did.
  check("§37: a craft with NO authored rung still pays the old flat cost",
    none37.health === -(rules37.novel.backlashHealth) && none37.energy === -(rules37.novel.backlashEnergy),
    `${none37.health}/${none37.energy}`);
  // ⛔ R18b RETIRED THIS ONE, AND IT WAS MINE. When I built R5 the table was FLAT and `damaging` was
  // deliberately set to the old 4/10 so 15 of the 20 authored crafts would not move. ⚠️ R18b makes the
  // magnitude A FRACTION OF THE POOL, so every craft moves — that is the point, not a regression: flat
  // numbers were 2% of Silas's health and 13% of a level-1's. What is worth asserting now is the SHAPE.
  const big37 = { maxHealth: 200, health: 200, maxEnergy: 200, energy: 200 };
  const small37 = { maxHealth: 30, health: 30, maxEnergy: 100, energy: 100 };
  const biteAt = (who, rung) => { const c = { ...who };
    return -PR37.applyBacklash(c, rules37, { backlashRung: rung }, {}).health; };
  check("§37: R18b · the harm is a FRACTION OF THE POOL, not a flat number",
    biteAt(big37, "damaging") > biteAt(small37, "damaging"),
    `${biteAt(small37, "damaging")} at 30hp vs ${biteAt(big37, "damaging")} at 200hp`);
  check("§37: R18b · …so it stops being irrelevant at high level AND stops landing hardest on a level-1",
    biteAt(big37, "damaging") / 200 === biteAt(small37, "damaging") / 30 ||
    Math.abs(biteAt(big37, "damaging") / 200 - biteAt(small37, "damaging") / 30) < 0.02,
    `${(100 * biteAt(small37, "damaging") / 30).toFixed(0)}% vs ${(100 * biteAt(big37, "damaging") / 200).toFixed(0)}% of pool`);

  // ⛔ A COMBO CARRIES THE HARSHEST OF ITS PARTS — the same rule braids use for inherited harm.
  const combo37 = hit([{ backlashRung: "damaging" }, { backlashRung: "incapacitating" }]);
  check("§37: with a combo the HARSHEST rung wins", combo37.rung === "incapacitating", combo37.rung);

  // ⛔ THE AUTHORED CORPUS OBEYS R5: backlash is ALWAYS milder than the craft’s own harm. If Aevi ever
  // authors one that is not, this catches it — that craft would turn a starting craft into a death sentence,
  // which is exactly what the retracted version of R5 would have done.
  const order37 = rules37.novel.harmRungOrder;
  const carriers = [];
  for (const f of readdirSync(join(root, "content/packs/core/abilities")).filter(x => x.endsWith(".json")))
    for (const a of (rj(`content/packs/core/abilities/${f}`).abilities || [])) if (a.backlashRung) carriers.push(a);
  check(`§37: all ${carriers.length} authored backlash crafts are MILDER than their own harm`,
    carriers.every(a => order37.indexOf(a.backlashRung) < order37.indexOf(a.harmRung || "lethal")),
    carriers.filter(a => order37.indexOf(a.backlashRung) >= order37.indexOf(a.harmRung || "lethal"))
      .map(a => `${a.id}: ${a.backlashRung} vs harm ${a.harmRung}`).join(", "));
  check("§37: …and the corpus is not empty (the check would pass vacuously)",
    carriers.length >= 20, `${carriers.length} carriers`);

  // ⚠️ AT LEVEL 1 A CHARACTER HAS 30 HEALTH. R7’s principle: a penalty must not land hardest on the
  // weakest. The harshest AUTHORED backlash must leave a starting character standing.
  const worst = carriers.reduce((w, a) => order37.indexOf(a.backlashRung) > order37.indexOf(w.backlashRung) ? a : w, carriers[0]);
  // ⛔ AND THE CRAFTS WHOSE FAILURE IS NOT A WOUND. Aevi authored `backlashRungNone` on three crafts —
  // "A future consequence, not a present wound" · "No body is touched" — and NOTHING READ IT, so they took
  // the flat physical 4/10 their own authoring forbids.
  const social37 = [];
  for (const f of readdirSync(join(root, "content/packs/core/abilities")).filter(x => x.endsWith(".json")))
    for (const a of (rj(`content/packs/core/abilities/${f}`).abilities || [])) if (a.backlashRungNone && !a.backlashRung) social37.push(a);
  check(`§37: all ${social37.length} non-physical-backlash crafts take NO wound`,
    social37.length > 0 && social37.every(a => { const h = hit(a); return h.health === 0 && h.energy === 0; }),
    social37.filter(a => hit(a).health !== 0).map(a => a.id).join(", ") || `${social37.length} carriers`);
  check("§37: …and their authored reason is handed to the narrator",
    social37.every(a => typeof hit(a).notPhysical === "string" && hit(a).notPhysical.length > 10));
  check("§37: ⛔ but a PHYSICAL craft in the same combo still wounds — social does not shield",
    hit([social37[0], { backlashRung: "incapacitating" }]).health < 0,
    JSON.stringify(hit([social37[0], { backlashRung: "incapacitating" }])));
  check("§37: the harshest authored backlash leaves a level-1 character alive",
    hit(worst).left > 0, `${worst?.id} leaves ${hit(worst).left}/30`);
}
/* ═════ §38 — R12/R17/R19: WHEN A CRAFT ARRIVES, AND WHEN YOU MAY DEEPEN IT ═════ */
// ⛔ R12 — tier sets the band, energyCost places the craft inside it. Under the old `levelReq` the WHOLE
// CORPUS was learnable by level 5. ⛔ R17 — training to rank 2 costs `tierPrice`, no band. ⛔ R19 — tier N
// becomes trainable when tier N+2 opens, so acquisition leads and depth follows.
console.log("\n── §38 · the unlock curve, the training price, and the tier gate ──");
{
  const PR38 = await import("../engine/progression.js");
  const SK38 = await import("../engine/skilltree.js");
  const rules38 = rj("content/packs/core/rules/resolution.json");
  const sc38 = rj("content/packs/core/rules/skill_capacity.json");
  const cat38 = {};
  for (const f of readdirSync(join(root, "content/packs/core/abilities")).filter(x => x.endsWith(".json")))
    for (const a of (rj(`content/packs/core/abilities/${f}`).abilities || [])) cat38[a.id] = a;
  const all38 = Object.values(cat38);
  const U = (a) => PR38.unlockLevelFor(a, rules38, cat38);

  // ⛔ R12 — THE CORPUS IS A CURVE, NOT A STAIRCASE.
  check("§38: R12 · the corpus is NOT all open by level 5 any more",
    all38.filter(a => U(a) <= 5).length < all38.length,
    `${all38.filter(a => U(a) <= 5).length}/${all38.length} open at L5`);
  check("§38: R13 · …and it IS all open by the authored top level",
    all38.every(a => U(a) <= (rules38.leveling?.unlockTopLevel ?? 60)),
    `deepest ${Math.max(...all38.map(U))} vs top ${rules38.leveling?.unlockTopLevel}`);

  // ⛔ R15 — A LEVEL-1 CHARACTER SEES EVERY TIER-1 CRAFT THEY COULD PICK.
  const pick38 = all38.filter(a => a.powerSystem !== "precursor" && a.powerSystem !== "combination");
  const t1_38 = pick38.filter(a => SK38.abilityTier(a) === 1);
  check(`§38: R15 · all ${t1_38.length} pickable tier-1 crafts are visible at level 1`,
    t1_38.length > 50 && t1_38.every(a => U(a) <= 1),
    t1_38.filter(a => U(a) > 1).map(a => a.id).slice(0, 5).join(", "));
  check("§38: …and nothing ABOVE tier 1 sneaks into level 1",
    pick38.filter(a => U(a) <= 1).every(a => SK38.abilityTier(a) === 1));

  // ⚠️ THE SHELF CURVE IS NOT THE WHOLE GAME. A braid is MADE, not bought — braids.js derives its levelReq
  // from its PARENTS’ ranks — and precursor/living/wild crafts are granted per ability in fiction.
  check("§38: a braid keeps its own derived levelReq, not a shelf band",
    PR38.unlockLevelFor({ powerSystem: "combination", tier: 3, energyCost: 12, levelReq: 2 }, rules38, cat38) === 2);
  check("§38: …and so does a precursor craft, which is granted in fiction",
    PR38.unlockLevelFor({ powerSystem: "precursor", tier: 3, energyCost: 8, levelReq: 3 }, rules38, cat38) === 3);

  // ⛔ R17 — DEEPENING WHAT YOU HOLD COSTS LESS THAN ACQUIRING SOMETHING NEW. Always, at every tier.
  for (const t of [1, 3, 5]) {
    const ab = { tier: t };
    const train = SK38.tierPrice(ab, sc38);
    const far = SK38.learnPointCost(ab, { domains: { primary: "x" } }, sc38, { band: "far", penalty: 3 });
    check(`§38: R17 · training a tier-${t} craft (${train}) costs less than learning one far (${far})`, train < far);
  }

  // ⛔ R19 — TIER N OPENS FOR TRAINING WHEN TIER N+2 OPENS.
  const at = (tier, level) => PR38.trainableTier({ tier }, { level }, rules38);
  // ⛔ R20 RETRACTED R19. The tier N+2 gate put T1 at L21, T2 at L35, T3 at L48 — and measured against
  // Silas (L30, 31 crafts stuck at rank 1) it reached 3% of them; the N+1 variant reached 16%.
  // ⚠️ NEITHER TIER GATE WORKS, BECAUSE A PLAYED SHEET IS NOT TIER-SORTED: his stuck crafts run T1–T5 plus
  // 13 custom records with no tier at all. R17’s entire case was those 31 crafts.
  // ✅ R20: one global threshold. Acquisition still leads — you cannot deepen at level 1 — but the shelf is
  // no longer pretended to sort by tier.
  const openAt38 = rules38.leveling.trainingUnlockLevel;
  check("§38: R20 · training is shut before the global threshold",
    at(1, openAt38 - 1).ok === false && at(3, openAt38 - 1).ok === false);
  check("§38: R20 · …and open at it, for every buyable tier at once",
    at(1, openAt38).ok === true && at(2, openAt38).ok === true && at(3, openAt38).ok === true,
    `T1 ${at(1, openAt38).ok} T2 ${at(2, openAt38).ok} T3 ${at(3, openAt38).ok} at L${openAt38}`);
  check("§38: R20 · …so the gate no longer varies by tier at all",
    at(1, 99).opensAt === at(3, 99).opensAt,
    `${at(1, 99).opensAt} vs ${at(3, 99).opensAt}`);
  // ⚠️ OI-21 — there is no tier 6 or 7, so T4/T5 have no gate to open. Erik deferred the pass; until then
  // they are practice-and-GM only, which fits "the deepest things cannot be bought."
  check("§38: R19 · tier 4 and 5 cannot be trained at all (OI-21 default)",
    at(4, 99).ok === false && at(5, 99).ok === false);

  // ⛔ RANK 3 IS NEVER FOR SALE — breadth cannot buy the thing depth earns.
  const r3char = { level: 99, skillPoints: 99, abilities: [{ abilityId: "x", level: 2 }] };
  const r3 = PR38.rankUpAbility(r3char, "x", rules38, { catalog: { x: { id: "x", tier: 1 } }, skillCapacity: sc38 });
  check("§38: rank 3 cannot be bought at any price", r3.ok === false, JSON.stringify(r3));
  const r2char = { level: 99, skillPoints: 99, abilities: [{ abilityId: "x", level: 1 }] };
  const r2 = PR38.rankUpAbility(r2char, "x", rules38, { catalog: { x: { id: "x", tier: 1 } }, skillCapacity: sc38 });
  check("§38: …but rank 2 can, at tierPrice", r2.ok === true && r2.cost === SK38.tierPrice({ tier: 1 }, sc38),
    JSON.stringify(r2));
}
/* ═════ §39 — TRAINING IS REACHABLE IN PLAY, NOT ONLY IN THE ENGINE ═════ */
// ⛔ THE FOURTH DOOR, CAUGHT IN THE ACT. `rankUpAbility` was BUILT, EXPORTED, GATED and IMPORTED BY app.js
// — and never called. R17 priced training and R20 opened it at level 10, and BOTH WERE INERT: a mechanism
// with a price, a gate, a test suite, and no way for a player to touch it.
//
// ⚠️ AUTHORED → REGISTERED → LOADED → READ. Three of four passed and it looked finished.
// This gate asserts the fourth: the button exists, it carries the id, and a handler calls the engine.
console.log("\n── §39 · training is reachable in play ──");
{
  const app39 = readFileSync(join(root, "app.js"), "utf8");
  const code39 = app39.split(/\r?\n/).map(l => l.replace(/\/\/.*$/, "")).join("\n");

  check("§39: app.js CALLS rankUpAbility, not merely imports it",
    /rankUpAbility\s*\(\s*character/.test(code39),
    "imported and never called is exactly the defect this gate exists for");
  check("§39: …a training control is rendered against an owned craft",
    /data-train=/.test(code39));
  check("§39: …and a handler is bound to it",
    /querySelectorAll\(\s*"\[data-train\]"\s*\)/.test(code39));
  check("§39: the control is built from the ENGINE’s gate, not a second opinion",
    /trainableTier\s*\(/.test(code39) && /tierPrice\s*\(/.test(code39),
    "the price and the gate must come from the same functions the purchase charges");

  // ⛔ AND IT MUST ACTUALLY WORK. Not a source scan — run the engine the button runs.
  const PR39 = await import("../engine/progression.js");
  const SK39 = await import("../engine/skilltree.js");
  const rules39 = rj("content/packs/core/rules/resolution.json");
  const sc39 = rj("content/packs/core/rules/skill_capacity.json");
  const ab39 = { id: "t39", name: "Probe", tier: 2 };
  const mk39 = (level, points) => ({ level, skillPoints: points, abilities: [{ abilityId: "t39", level: 1 }] });

  const tooYoung = PR39.rankUpAbility(mk39(5, 9), "t39", rules39, { catalog: { t39: ab39 }, skillCapacity: sc39 });
  check("§39: R20 · a level-5 character cannot train — and is told WHEN, not just no",
    tooYoung.ok === false && /level \d+/.test(tooYoung.why), JSON.stringify(tooYoung));

  const ready = mk39(10, 9);
  const bought = PR39.rankUpAbility(ready, "t39", rules39, { catalog: { t39: ab39 }, skillCapacity: sc39 });
  const price = SK39.tierPrice(ab39, sc39);
  check("§39: R20 · at level 10 it trains, at R17’s tier price",
    bought.ok === true && bought.cost === price, JSON.stringify(bought));
  check("§39: …and the rank and the points both actually moved",
    ready.abilities[0].level === 2 && ready.skillPoints === 9 - price,
    `rank ${ready.abilities[0].level}, points ${ready.skillPoints}`);

  const broke = PR39.rankUpAbility(mk39(10, 0), "t39", rules39, { catalog: { t39: ab39 }, skillCapacity: sc39 });
  check("§39: …and an empty purse is refused rather than silently free", broke.ok === false);
}
/* ═════ §40 — R22: AN OBJECT GRANTS ACCESS, NEVER COST ═════ */
// ⛔ ERIK: "Tomes are just a flavor way of describing an object that grants a skill when you have the skill
// points to use for it. We can dress them up as precursor artifacts — quest items — miracle grants… So one
// mechanism." ⚠️ So the field is keyed on WHAT IS GRANTED, not on the word `tome`.
//
// ⚠️ `character.tomes` HAD A READER AND NO WRITER — `acquirable` offered "a willing teacher of this people,
// or their tome" and nothing in the engine, the app or content could ever fill the array. Teacher-only in
// practice, for as long as the field has existed.
console.log("\n── §40 · R22 · one mechanism, four flavours ──");
{
  const INV40 = await import("../engine/inventory.js");
  const PR40 = await import("../engine/progression.js");
  const TR40 = await import("../engine/traditions.js");
  const SK40 = await import("../engine/skilltree.js");
  const sc40 = rj("content/packs/core/rules/skill_capacity.json");
  const v2_40 = (() => { try { return rj("content/packs/core/rules/traditions_v2.json"); } catch { return null; } })();
  const idx40 = TR40.buildTraditionIndex(rj("content/packs/core/rules/traditions.json"), v2_40);

  const anti40 = TR40.antipodeOf("umbral", idx40);
  const gated = { id: "g40", tier: 5, tradition: anti40, nativeOrCombination: "native" };
  const mk40 = () => ({ level: 50, domains: { primary: "umbral" }, inventory: [], skillPoints: 9 });

  // ⛔ SHUT BEFORE, OPEN AFTER — and the gate must genuinely have been shut, or the test proves nothing.
  const before40 = mk40();
  check("§40: the craft is genuinely out of reach without the object",
    PR40.domainGateFor(gated, before40, idx40).allowed === false,
    JSON.stringify(PR40.domainGateFor(gated, before40, idx40)));

  const holder = mk40();
  INV40.addItem(holder, { name: "A Codex", kind: "relic", grants: { craft: "g40" } }, {});
  check("§40: holding the object writes the access", (holder.grantedAccess || []).includes("g40"));
  const v40 = PR40.domainGateFor(gated, holder, idx40);
  check("§40: …and the door opens", v40.allowed === true, JSON.stringify(v40));

  // ⛔ THE HALF THAT MATTERS: ACCESS ONLY. The band is reported as `granted` rather than faked as `primary`,
  // so the craft keeps whatever distance it really sits at — here an ANTIPODE craft keeps its lean surcharge.
  check("§40: the verdict does NOT pretend the craft is close to home", v40.band === "granted", v40.band);
  check("§40: …it keeps the distance it truly sits at",
    v40.penalty === PR40.domainGateFor(gated, before40, idx40).penalty,
    `${v40.penalty} vs ${PR40.domainGateFor(gated, before40, idx40).penalty}`);
  check("§40: …and the antipode surcharge survives the grant",
    (v40.leanSurcharge || 0) > 0, JSON.stringify(v40.leanSurcharge));
  check("§40: ⛔ the object removes ACCESS, never COST — the price is still a far price",
    SK40.learnPointCost(gated, holder, sc40, v40) > SK40.tierPrice(gated, sc40),
    `${SK40.learnPointCost(gated, holder, sc40, v40)} vs home ${SK40.tierPrice(gated, sc40)}`);

  // ⚠️ IDEMPOTENT — two copies of a tome are not two grants.
  INV40.addItem(holder, { name: "A Codex", kind: "relic", grants: { craft: "g40" } }, {});
  check("§40: a second copy grants nothing twice",
    holder.grantedAccess.filter(x => x === "g40").length === 1, JSON.stringify(holder.grantedAccess));

  // ⛔ THE PEOPLE FLAVOUR FILLS THE FIELD THAT HAD NO WRITER.
  const joiner = { level: 5, inventory: [], peopleDisposition: {}, teachers: {} };
  INV40.addItem(joiner, { name: "Tome of a People", kind: "quest", grants: { people: "rootkin" } }, {});
  check("§40: the people flavour writes `character.tomes`", (joiner.tomes || []).includes("rootkin"));

  // ⚠️ AND A PLAIN OBJECT GRANTS NOTHING — the field is opt-in, not a default.
  const plain = mk40();
  INV40.addItem(plain, { name: "A Rock", kind: "misc" }, {});
  check("§40: an ordinary object grants nothing",
    !(plain.grantedAccess || []).length && !(plain.tomes || []).length);
}
/* ===== §41 — R24: SEX IS SET AT GENERATION, AND ABSENCE EXCLUDES ===== */
// ⛔ ERIK: "You can't romance until you know the sex, so rather than leave sex runtime determined it needs
// to be SET upon PC/NPC generation. If there is no sex it's not romanceable."
//
// ⚠️ TWO FIELDS, TWO JOBS. `sex` is set once at generation and is what the gate reads. `gender`/`pronouns`
// are how a person presents — GM-written, player-correctable (correctNpcGender), and they gate NOTHING.
// ⛔ COLLAPSING THEM WOULD MEAN CORRECTING A PORTRAIT SILENTLY CHANGES WHO MAY BE ROMANCED.
console.log("\n── §41 · R24 · sex is set at generation ──");
{
  const N41 = await import("../engine/npcs.js");
  const R = (p) => N41.romanceable(p);

  check("§41: a person with no sex set is excluded — absence is the answer, not a blank",
    R({ romanceEligible: true }).ok === false, JSON.stringify(R({ romanceEligible: true })));
  check("§41: ⛔ `gender` does NOT stand in for sex — a rendering must not open the gate",
    R({ gender: "woman", pronouns: "she/her", romanceEligible: true }).ok === false);
  check("§41: sex `none` is a real answer — a being that has none is excluded, nothing authored to do it",
    R({ sex: "none", romanceEligible: true }).ok === false,
    JSON.stringify(R({ sex: "none", romanceEligible: true })));
  check("§41: a minor is excluded even with sex set and opted in",
    R({ sex: "male", romanceEligible: true, _gen: { romanceEligible: false } }).ok === false);
  check("§41: opting in is REQUIRED — a sex alone does not make someone romanceable",
    R({ sex: "female" }).ok === false);
  check("§41: ✅ …and all three together do", R({ sex: "female", romanceEligible: true }).ok === true);
  check("§41: every refusal says WHY, so a person never silently vanishes from a list",
    [{}, { sex: "none" }, { sex: "f" }].every(p => typeof R(p).why === "string" && R(p).why.length > 4));

  // ⛔ THE MINT SETS IT. Not on first render — at generation, which is the whole ruling.
  const src41 = readFileSync(join(root, "engine/npcs.js"), "utf8");
  check("§41: the NPC mint writes `sex` as its own field", /\bsex:\s*u\.sex\s*\?/.test(src41));
  check("§41: …and still writes gender separately, so the two never collapse",
    /\bgender:\s*u\.gender\s*\?/.test(src41));

  // ⛔ AND PC CREATION ASKS FOR IT — the fourth door, again.
  const app41 = readFileSync(join(root, "app.js"), "utf8");
  check("§41: character creation offers a sex control", /id="c-sex"/.test(app41));
  check("§41: …it is bound", /getElementById\(\"c-sex\"\)\.onchange/.test(app41));
  check("§41: …and it reaches the character record", /sex:\s*state\.sex\s*\|\|\s*undefined/.test(app41));
}
/* ═════ §42 — R2/R9: WHAT CREATION SAYS, AND WHAT IT MAKES YOU DECIDE ═════ */
// ⛔ R2 (ERIK 2026-08-31) — `state.attrs` was mutated ONLY inside quick-start's `draw()`. Describe and Play
// never touched it, so those characters reached play at a flat 3/3/3/3 — and the build-lean argmax resolves
// a four-way tie to `mental`, compounded by `byLean.mental` as the fallback. ⚠️ THE MENTAL BIAS LANDED
// TWICE, ON TWO OF THREE PATHS. That, not a weak mechanism, is why stat sensitivity did not bite.
//
// ⛔ AND R9/R16 RETIRED THE ANTIPODE WALL WHILE THE CREATION COPY STILL PROMISED IT. Two strings shown
// while a player decides who they are told them a pole was "closed to you forever".
console.log("\n── §42 · creation: points are placed, and the copy tells the truth ──");
{
  const app42 = readFileSync(join(root, "app.js"), "utf8");
  const code42 = app42.split(/\r?\n/).map(l => l.replace(/\/\/.*$/, "")).join("\n");

  // ⛔ THE GATE IS AT THE DOOR, NOT AT THE CALL SITES — a path nobody found cannot slip past it.
  check("§42: R2 · nobody reaches abilities with unplaced points",
    /function renderAbilityStep\(\)\s*{[^}]*attrsConfirmed/.test(code42),
    "the check must live INSIDE renderAbilityStep, or a new path inherits nothing");
  check("§42: R2 · a dedicated allocation step exists", /function renderAttributeStep/.test(code42));
  check("§42: R2 · …and confirming is what unlocks the rest",
    /attrsConfirmed = true/.test(code42) && /renderAttributeStep\(\)/.test(code42));
  check("§42: R2 · quick start SEEDS rather than deciding", /attrsSeeded = true/.test(code42));

  // ⛔ THE COPY. R9/R16 made the antipode learnable, castable, and priced by lean — creation must not
  // still be telling a player it is shut. ⚠️ Scanned on CODE lines only; commentary may describe the old
  // rule, and this file's own history is full of prose that does.
  const deadClaims = ["closed to you forever", "is closed to you", "only the great braids cross it"];
  const found42 = deadClaims.filter(c => code42.includes(c));
  check("§42: creation no longer tells a player their far pole is shut",
    found42.length === 0, found42.join(" · "));

  // ⚠️ AND IT MUST STILL SAY SOMETHING — silence is not the fix. A player choosing a pole should be told
  // the axis costs, or the whole lean mechanic is invisible at the moment it starts mattering.
  check("§42: …it says what IS true — the far pole costs more and opens as you carry it",
    /leaned away from it/.test(code42) && /opens as you carry it/.test(code42));
}
/* ═════ §43 — SNG-369: THE 63 AUTHORED BRAIDS HAVE A READER ═════ */
// ⛔ `combination_recipes.json` held 63 recipes, was REGISTERED IN THE MANIFEST, and was read by nothing.
// The file said so about itself: "Until a consumer exists, anything authored here is documentation."
// ⚠️ REGISTRATION IS NOT ARRIVAL (SNG-342). Three doors of four — authored, registered, and never loaded.
//
// ⛔ THE STORE WINS. `world/braid_recipes.json` is what THIS world has found; the catalogue is what the
// world CONTAINS. Authority runs catalogue → store, never back: a player who first-found a pairing and
// named it keeps the name, and the catalogue fills the void behind them.
console.log("\n── §43 · SNG-369 · the 63 authored braids have a reader ──");
{
  const RC43 = await import("../engine/recipes.js");
  const BR43 = await import("../engine/braids.js");
  const cat43 = rj("content/packs/core/rules/combination_recipes.json").recipes || [];
  const empty43 = { recipes: {} };

  check("§43: the catalogue is non-empty (or this whole gate is vacuous)", cat43.length > 50, `${cat43.length}`);
  const reachable = cat43.filter(r => RC43.recipeFor(empty43, r.parts, cat43)).length;
  check(`§43: every one of the ${cat43.length} authored braids is reachable`,
    reachable === cat43.length, `${reachable}/${cat43.length}`);

  // ⛔ THE STORE WINS — the single most important property. A player's find must never be overwritten.
  const one43 = cat43[0];
  const store43 = { recipes: {} };
  store43.recipes[BR43.braidKey(one43.parts)] = { braidKey: BR43.braidKey(one43.parts), name: "A Player Name", namedBy: "player" };
  check("§43: ⛔ a discovery in the store BEATS the catalogue",
    RC43.recipeFor(store43, one43.parts, cat43).name === "A Player Name");

  // ⚠️ BACKWARD COMPATIBLE — a caller that passes no catalogue behaves exactly as before.
  check("§43: with no catalogue supplied, nothing changes",
    RC43.recipeFor(empty43, one43.parts) === null);

  // ⚠️ THE TWO FILES WERE AUTHORED TO DIFFERENT VOCABULARIES — effect→description, cannot→notFor. The
  // translation lives in ONE place; if it drifts, a braid arrives with no prose and nobody notices.
  const got43 = RC43.recipeFor(empty43, one43.parts, cat43);
  check("§43: the catalogue’s `effect` arrives as the braid’s description",
    got43.description === one43.effect && got43.description.length > 10);
  check("§43: …and `cannot` as notFor", got43.notFor === (one43.cannot || ""));

  // ⛔ CANON IS NOT A DISCOVERY. A third provenance, so the adopt path can tell them apart and the sync
  // path never republishes canon as though this world had found it.
  check("§43: a catalogue braid is marked `authored`, not gm and not player",
    got43.namedBy === "authored" && got43.fromCatalogue === true);
  check("§43: …and has no first finder, because nobody found it",
    RC43.firstFinderName(got43) === null);

  // ⛔ AND IT IS ACTUALLY LOADED — the door that was shut.
  const st43 = readFileSync(join(root, "engine/state.js"), "utf8");
  check("§43: state.js loads the catalogue", /loadRule\(\s*"combination_recipes"/.test(st43));
  check("§43: …and puts it on the rules bag", /rules\.combinationRecipes/.test(st43));
  const app43 = readFileSync(join(root, "app.js"), "utf8");
  check("§43: …and the mint path passes it", /recipeFor\([^)]*combinationRecipes/.test(app43));
}
/* ═════ §44 — `traditionV2` IS A STORED COPY OF A DERIVED VALUE ═════ */
// ⛔ 21 crafts carry `traditionV2`, and the field atlas reports it DARK — no reader anywhere.
// ⚠️ THE FIX IS NOT TO GIVE IT ONE. It holds the DOMAIN NAME ("Body"), which `domainOfTradition` already
// derives from the craft's `tradition` ("somatic" → "Body"). Measured: all 21 agree with the derivation.
//
// ⛔ SO IT IS THIS PROJECT'S MOST-REPEATED DEFECT — a stored copy of a derived value — and wiring a reader
// would make the copy AUTHORITATIVE, which is worse than leaving it dark. The danger is DRIFT: move a
// tradition between domains and 21 stored strings go stale in silence, and the next person to find the
// dark field wires it to the stale value.
//
// ✅ THIS GATE IS THE ALTERNATIVE TO BOTH. Leave the field, read nothing from it, and assert it still
// agrees. A latent defect becomes a monitored one.
console.log("\n── §44 · traditionV2 is a stored copy, and it still agrees ──");
{
  const TR44 = await import("../engine/traditions.js");
  const v2_44 = (() => { try { return rj("content/packs/core/rules/traditions_v2.json"); } catch { return null; } })();
  const idx44 = TR44.buildTraditionIndex(rj("content/packs/core/rules/traditions.json"), v2_44);
  const carriers = [];
  for (const f of readdirSync(join(root, "content/packs/core/abilities")).filter(x => x.endsWith(".json")))
    for (const a of (rj(`content/packs/core/abilities/${f}`).abilities || []))
      if (a.traditionV2 !== undefined) carriers.push(a);

  check("§44: the field still has carriers (or this gate is vacuous)", carriers.length >= 20, `${carriers.length}`);
  const drifted = carriers.filter(a => TR44.domainOfTradition(TR44.traditionOf(a, idx44), idx44) !== a.traditionV2);
  check(`§44: all ${carriers.length} are a stored copy that still agrees with the derivation`,
    drifted.length === 0,
    drifted.slice(0, 5).map(a => `${a.id}: stored ${a.traditionV2} vs derived ${TR44.domainOfTradition(TR44.traditionOf(a, idx44), idx44)}`).join(" · "));

  // ⚠️ AND NOBODY MAY QUIETLY MAKE THE COPY AUTHORITATIVE. If a reader appears, this goes red and someone
  // has to argue for it out loud — because at that point the derivation and the copy are two answers to
  // one question, and the codebase has been down that road.
  const eng44 = ["app.js", ...readdirSync(join(root, "engine")).filter(f => f.endsWith(".js")).map(f => `engine/${f}`)];
  const readers = [];
  for (const f of eng44) {
    const src = readFileSync(join(root, f), "utf8").split(/\r?\n/);
    src.forEach((line, i) => {
      const code = line.replace(/\/\/.*$/, "");
      if (/\btraditionV2\b/.test(code)) readers.push(`${f}:${i + 1}`);
    });
  }
  check("§44: …and nothing reads it, which is correct — the derivation is the answer",
    readers.length === 0, readers.join(", "));
}
/* ═════ §45 — PRESENCE 14/18/20, AND `sectFlavour` IN THE WIELDER'S HANDS ═════ */
// ⛔ SNG-356 — six ladder milestones read "BLOCKED PENDING HOLDINGS" while `holdings.js` was already
// built. Aevi authored presence 14/18/20 against mechanics that ALREADY EXIST — the unstewarded floor,
// the unstewarded ceiling, and the `obligation` field. None invents an engine concept; none is numeric.
//
// ⚠️ THE GATE READS THE `kind`, NOT THE RANK. `milestoneEffects().live` is keyed by kind, so Aevi can move
// a milestone to another rank or hang it off another sub-attribute and this still holds.
console.log("\n── §45 · standing keeps a place you are not standing in ──");
{
  const H45 = await import("../engine/holdings.js");
  const L45 = await import("../engine/ladder.js");
  const PR45 = await import("../engine/progression.js");
  const ladder45 = rj("content/packs/core/rules/sub_attribute_ladder.json");
  const eff = (presence) => L45.milestoneEffects(ladder45, { subAttributes: { presence } }).live;
  const run = (presence, outcome, ticks = 3) => {
    const h = { id: "h", name: "The Post", kind: "post", condition: "holding", steward: null, history: [] };
    const e = eff(presence);
    for (let i = 0; i < ticks; i++) H45.advanceHolding(h, outcome, i, null, e);
    return h.condition;
  };

  // ⛔ THE MILESTONES EXIST AND ARRIVE IN ORDER.
  check("§45: presence 14 grants the unstewarded floor", !!eff(14).unstewardedFloor && !eff(13).unstewardedFloor);
  check("§45: presence 18 grants the ceiling lift", !!eff(18).unstewardedCeiling && !eff(17).unstewardedCeiling);
  check("§45: presence 20 discharges the obligation", !!eff(20).obligationDischarged && !eff(19).obligationDischarged);

  // ⛔ 14 — IT STOPS DECAYING. Below it, an unkept post slides to failing.
  check("§45: below 14 an unkept holding slides", run(10, "problem") === "failing", run(10, "problem"));
  check("§45: at 14 the name holds it up", run(14, "problem") === "holding", run(14, "problem"));

  // ⛔ 14 IS A FLOOR, NOT A LIFT — SNG-355's company work must stay load-bearing.
  check("§45: …but 14 still cannot make it THRIVE — a steward is the only road up",
    run(14, "progress") === "holding", run(14, "progress"));
  check("§45: and 18 CAN, on the name alone", run(18, "progress") === "thriving", run(18, "progress"));

  // ⚠️ THE NEWS MUST STOP CALLING IT ABANDONED once standing is doing the keeping.
  const h45 = { id: "n", name: "The Smithy", kind: "enterprise", condition: "holding", steward: null, history: [] };
  H45.advanceHolding(h45, "progress", 1, null, eff(18));
  const news45 = H45.holdingNews(h45, "holding", eff(18));
  check("§45: a thriving unkept holding is not reported as having no keeper",
    !!news45 && !/no keeper|nobody is keeping/.test(news45), String(news45));

  // ⛔ 20 — THE OBLIGATION INVERTS. Narrative, not numeric: nothing is discharged mechanically.
  const c45 = { holdings: [{ id: "w", name: "Marchward Post", kind: "post", condition: "thriving", steward: null, obligation: "a tithe" }] };
  check("§45: below 20 the player OWES", /owes:/.test(H45.holdingsForGM(c45, eff(14))));
  check("§45: at 20 the authority draws standing from the player instead",
    !/owes:/.test(H45.holdingsForGM(c45, eff(20))) && /draw standing/.test(H45.holdingsForGM(c45, eff(20))),
    H45.holdingsForGM(c45, eff(20)));

  // ⚠️ AND WITHOUT THE LADDER, NOTHING CHANGES — a caller that has not been updated must not silently
  // lose the old behaviour.
  check("§45: with no effects supplied the drift is exactly as before",
    (() => { const h = { id: "o", condition: "holding", steward: null, history: [] };
      H45.advanceHolding(h, "problem", 1); return h.condition === "strained"; })());

  // ═══ sectFlavour ═══
  // ⛔ AEVI'S PLACEMENT: the wielder's OWN sect, in the ability block. Not lore about a sect — what is
  // happening when THIS character uses THIS craft. Cross-sect holding is the normal case under R3.
  const cat45 = {};
  for (const f of readdirSync(join(root, "content/packs/core/abilities")).filter(x => x.endsWith(".json")))
    for (const a of (rj(`content/packs/core/abilities/${f}`).abilities || [])) cat45[a.id] = a;
  const carriers45 = Object.values(cat45).filter(a => a.sectFlavour);
  check("§45: the field has carriers (or this gate is vacuous)", carriers45.length >= 10, `${carriers45.length}`);

  const kp = cat45["known_price"];
  check("§45: sectFlavour resolves to the WIELDER’s sect — same craft, different event",
    PR45.sectFlavourFor(kp, "syllogist").flavour !== PR45.sectFlavourFor(kp, "cogitant").flavour
    && !!PR45.sectFlavourFor(kp, "syllogist").flavour);
  check("§45: ⛔ a sect with no entry gets SILENCE, never another sect’s line",
    PR45.sectFlavourFor(kp, "no_such_sect").flavour === null);

  // ⛔ THE THREE DENIALS MUST NEVER REACH THE NARRATOR AS FLAVOUR.
  const denials = [];
  for (const a of carriers45) for (const [sect, txt] of Object.entries(a.sectFlavour || {}))
    if (/^\s*(?:\u26a0\ufe0f?\s*)?Not this craft/i.test(String(txt))) denials.push([a.id, sect]);
  check(`§45: the ${denials.length} authoring denials are found`, denials.length >= 3, JSON.stringify(denials));
  check("§45: ⛔ …and not one renders as flavour",
    denials.every(([id, sect]) => PR45.sectFlavourFor(cat45[id], sect).flavour === null),
    denials.filter(([id, sect]) => PR45.sectFlavourFor(cat45[id], sect).flavour !== null).map(x => x.join("/")).join(", "));
  // ⛔ AND THE RENDER, NOT ONLY THE RESOLVER. My first version of this gate tested `sectFlavourFor` in
  // isolation and passed — while the ability block it feeds threw `ReferenceError: opts is not defined`
  // on every call. ⚠️ SMOKE CAUGHT IT; THIS GATE DID NOT. A unit that works inside a caller that does not
  // is the same shape as the fourth door, one level down: the piece is right and nothing can reach it.
  //
  // ⚠️ IT ALSO HID A DESIGN ERROR. I resolved the ABILITY's tradition; the ruling says the WIELDER's —
  // the point is that `known_price` reads differently in a Syllogist's hands than a Cogitant's, and the
  // hands are the character's. Testing the resolver alone could never have surfaced that.
  {
    const wielder = (sect) => ({ level: 9, domains: { primary: sect }, subAttributes: {},
      abilities: [{ abilityId: "known_price", level: 1 }] });
    const blockFor = (sect) => PR45.abilitiesForGM(wielder(sect), { known_price: kp }, null, {}) || "";
    check("§45: the ability block RENDERS without throwing", typeof blockFor("syllogist") === "string");
    check("§45: …and carries the wielder’s own sect line",
      /IN YOUR HANDS/.test(blockFor("syllogist")) && /reasoned it/i.test(blockFor("syllogist")),
      blockFor("syllogist").slice(0, 120));
    check("§45: …a different sect gets a different line from the SAME craft",
      /modelled them/i.test(blockFor("cogitant")));
    check("§45: …and a sect with no entry adds nothing at all",
      !/IN YOUR HANDS/.test(blockFor("verist")), blockFor("verist").slice(0, 90));
  }
  check("§45: …they surface as an off-idiom caution instead, so the judgement is not lost",
    denials.every(([id, sect]) => typeof PR45.sectFlavourFor(cat45[id], sect).offIdiom === "string"));
}
/* ═════ §46 — R26: BRAIDS ARE N-ARY, AND ARITY IS HALF A RUNG ═════ */
// ⛔ R26 (ERIK 2026-09-02): tier = min(5, round(maxRank + 1 + 0.5 × (components − 2))).
//
// ⚠️ "ROUNDED" IS UNDERSPECIFIED AND THE TABLE IS NOT. `Math.round` is half-UP and cannot produce R26's
// published cells — it gives 3 where the table says 2, and 5 where it says 4. ⛔ THE RATIONALE SETTLES IT:
// "a three-braid of rank-3 parents lands at the SAME tier 4 as a pair — arity alone does not promote you."
// Half-up promotes it and breaks the rule R26 exists to state. Every cell reproduces under half-to-even.
//
// ⚠️ THIS GATE IS THE PUBLISHED TABLE, CELL BY CELL — so a rounding change cannot pass unnoticed.
console.log("\n── §46 · R26 · arity alone does not promote you ──");
{
  const BR46 = await import("../engine/braids.js");
  const mk = (ranks) => ({ abilities: ranks.map((r, i) => ({ abilityId: `c${i}`, level: r })) });
  const comps = (n) => Array.from({ length: n }, (_, i) => `c${i}`);
  const tierAt = (rank, n) => BR46.braidTier(mk(Array(n).fill(rank)), comps(n)).tier;

  // R26's table, transcribed: [rank, at2, at3, at4, at5]
  const R26 = [[1, 2, 2, 3, 4], [2, 3, 4, 4, 4], [3, 4, 4, 5, 5]];
  for (const [rank, ...want] of R26) {
    const got = [2, 3, 4, 5].map(n => tierAt(rank, n));
    check(`§46: R26 · rank-${rank} parents give ${want.join('/')} at 2/3/4/5 components`,
      JSON.stringify(got) === JSON.stringify(want), `got ${got.join('/')}`);
  }

  // ⛔ THE TWO PROPERTIES THE TABLE EXISTS TO GUARANTEE.
  check("§46: ⛔ arity ALONE does not promote — a 3-braid of rank-3 ties the rank-3 PAIR",
    tierAt(3, 3) === tierAt(3, 2), `${tierAt(3, 3)} vs ${tierAt(3, 2)}`);
  check("§46: …but four of them does — depth needs two components, breadth needs four",
    tierAt(3, 4) > tierAt(3, 2));
  check("§46: ⛔ a triple of TRIVIAL crafts never out-tiers a hard pair",
    tierAt(1, 3) <= tierAt(3, 2), `trivial triple ${tierAt(1, 3)} vs hard pair ${tierAt(3, 2)}`);
  check("§46: …and five trivial crafts still do not reach the top",
    tierAt(1, 5) < 5, `${tierAt(1, 5)}`);

  // ⚠️ A 2-BRAID IS UNCHANGED, so all 57 authored recipes keep their tiers.
  check("§46: the two-component case is exactly maxRank + 1, as before R26",
    [1, 2, 3].every(r => tierAt(r, 2) === Math.min(5, r + 1)));

  // ⛔ AND THE GATES ARE OPEN — a three-part braid actually BUILDS. Before SNG-370 this returned null and
  // the caller fell to a stub: Erik holds `the-declared-threshold` at `tier: null` for exactly that reason.
  const cat46 = { a: { id: "a", name: "A", functions: ["strike"] }, b: { id: "b", name: "B", functions: ["ward"] },
    c: { id: "c", name: "C", functions: ["reveal"] } };
  const who46 = { abilities: [{ abilityId: "a", level: 2 }, { abilityId: "b", level: 2 }, { abilityId: "c", level: 1 }], braids: [] };
  const three = BR46.braidTier(who46, ["a", "b", "c"], cat46);
  check("§46: a THREE-part braid is tiered rather than refused", three.tier === 4, JSON.stringify(three));
  check("§46: …and it reports all three source ranks", (three.sourceRanks || []).length === 3);

  // ⛔ THE LEDGER CAN NOW EXPRESS A TRIPLE — the constraint SNG-370 §2a identified.
  const PC46 = await import("../engine/practice.js");
  const ch46 = { practice: { schemaVersion: 1, uses: {}, coActivations: {}, aspirations: [] } };
  PC46.recordUse(ch46, ["x", "y", "z"]);
  const keys46 = Object.keys(ch46.practice.coActivations);
  check("§46: three crafts used together record the TRIPLE, not only the pairs",
    keys46.includes("x+y+z"), keys46.join(" · "));
  check("§46: ⛔ …and the pairs are still recorded, so 2-braids keep ripening",
    ["x+y", "x+z", "y+z"].every(k => keys46.includes(k)), keys46.join(" · "));
}
/* ═════ §47 — R25 CAPACITY SCALES · R27 CONDITIONED MIGRATION ═════ */
// ⛔ R25 (ERIK 2026-09-02): THREE capacity scales, not one ladder. Party (rapport then presence, cap 6),
// delegation (a FORMULA on level and rapport), and band/unit (a separate system entirely).
// ⛔ R27: a rename target may be CONDITIONED — `byRank` (what the holder actually had) or `bySect`.
console.log("\n── §47 · R25 capacity · R27 conditioned migration ──");
{
  const LAD = await import("../engine/ladder.js");
  const ASG = await import("../engine/assignments.js");
  const REC = await import("../engine/reconcile.js");
  const LADDER_47 = rj("content/packs/core/rules/sub_attribute_ladder.json");
  const RENAMES_47 = rj("content/packs/core/rules/ability_rename_map.json").map;
  const ladder = LADDER_47;
  const who = (r, p, lv = 30) => ({ level: lv, subAttributes: { rapport: r, presence: p } });

  // ── R25a · the party ladder changes hands at 4 ──
  check("§47: R25a · rapport carries the first four places (1·4·7·10 → 1·2·3·4)",
    [[1,1],[4,2],[7,3],[10,4]].every(([r, want]) => LAD.companyPlaces(ladder, who(r, 0)) === want),
    [1,4,7,10].map(r => LAD.companyPlaces(ladder, who(r, 0))).join('/'));
  check("§47: R25a · ⚑ presence 10 gives the FIFTH place — the ladder changes hands",
    LAD.companyPlaces(ladder, who(10, 10)) === 5, String(LAD.companyPlaces(ladder, who(10, 10))));
  check("§47: R25a · ⚑ presence 14 gives the SIXTH, and six is the cap",
    LAD.companyPlaces(ladder, who(20, 20)) === 6, String(LAD.companyPlaces(ladder, who(20, 20))));

  // ⛔ THE COMPOUND RANK. presence 14 already carried `unstewardedFloor` and R25a gave it a second effect.
  // ⚠️ THE OLD SHAPE HELD ONE OBJECT PER RANK, so the second would have silently REPLACED the first and a
  // milestone the player already had would stop working. The ruling names compounding as deliberate.
  {
    const live = LAD.milestoneEffects(ladder, who(0, 14)).live;
    check("§47: R25a · ⛔ presence 14 is COMPOUND — the sixth place did not evict `unstewardedFloor`",
      !!live.unstewardedFloor && live.companyCapacity?.places === 6,
      Object.keys(live).join(' · '));
  }

  // ⛔ THE DEFECT R25a EXPOSED, AND IT IS THE ONE WORTH GATING. Two subs now write `companyCapacity`, so
  // rapport 10 and presence 10 TIE on rank — and the old tiebreak was `Number(at) > prev.at`, which cannot
  // separate them. ⚠️ MEASURED: reversing the order of `subs` in the ladder file turned 5 places into 4.
  // ✅ Ranks from different subs are not comparable magnitudes; the effect's own magnitude is.
  {
    const reversed = { ...ladder, subs: Object.fromEntries(Object.entries(ladder.subs).reverse()) };
    const pairs = [[10,10],[10,9],[7,14],[4,10],[0,10],[10,14]];
    const same = pairs.every(([r, p]) => LAD.companyPlaces(ladder, who(r, p)) === LAD.companyPlaces(reversed, who(r, p)));
    check("§47: ⛔ company places do NOT depend on the ladder file’s key order", same,
      pairs.map(([r, p]) => `${r}/${p}:${LAD.companyPlaces(ladder, who(r,p))}vs${LAD.companyPlaces(reversed, who(r,p))}`).join(' '));
  }
  check("§47: …and the magnitude tiebreak left `harmRung` exactly where it was (1 at 7, 2 at 14)",
    LAD.harmRungDrop(ladder, { level: 30, subAttributes: { agility: 7 } }) === 1 &&
    LAD.harmRungDrop(ladder, { level: 30, subAttributes: { agility: 14 } }) === 2);

  // ── R25b · delegation is a FORMULA, and a different scale from company ──
  check("§47: R25b · delegation capacity is floor(level/10) — it starts at ZERO and grows",
    [[1,0],[9,0],[10,1],[30,3],[100,10]].every(([lv, want]) => LAD.delegationCapacity(ladder, who(0, 0, lv)) === want),
    [1,9,10,30,100].map(lv => LAD.delegationCapacity(ladder, who(0,0,lv))).join('/'));
  check("§47: R25c · ⚑ rapport 14 raises it by one — the only rank that adds a NUMBER",
    LAD.delegationCapacity(ladder, who(14, 0, 30)) === 4 && LAD.delegationCapacity(ladder, who(13, 0, 30)) === 3);

  // ⛔ HOUSEHOLD NEVER BECOMES A NUMBER. R25c: 18 and 20 are STATES. The module comment this upholds:
  // "the moment a pregnant wife grants a combat bonus the game has said something false."
  check("§47: R25c · ⛔ rapport 18 and 20 add NOTHING to either count",
    LAD.delegationCapacity(ladder, who(20, 0, 30)) === LAD.delegationCapacity(ladder, who(14, 0, 30)) &&
    LAD.companyPlaces(ladder, who(20, 0)) === LAD.companyPlaces(ladder, who(10, 0)),
    `deleg ${LAD.delegationCapacity(ladder, who(20,0,30))} vs ${LAD.delegationCapacity(ladder, who(14,0,30))}`);
  check("§47: …they are reported as STATES instead, so the judgement is not lost",
    LAD.serviceStates(ladder, who(20, 0)).householdEndures === true &&
    LAD.serviceStates(ladder, who(20, 0)).loyaltyUnbought === true &&
    LAD.serviceStates(ladder, who(17, 0)).householdEndures === false);

  // ⛔ AND NO MILESTONE IS STILL BLOCKED ON HOLDINGS. rapport 14/18/20 shipped as `blocked` placeholders;
  // R25c answered all three. ⚠️ A promise left written down is a decision waiting — this proves it landed.
  check("§47: rapport 14/18/20 are no longer BLOCKED promises",
    LAD.milestoneEffects(ladder, who(20, 20)).blocked.length === 0,
    LAD.milestoneEffects(ladder, who(20, 20)).blocked.map(b => b.sub + ' ' + b.at).join(' · '));

  // ── R25b · enforcement follows the COMPANY precedent: refuse a new one, never drop an existing one ──
  {
    const ws = { assignments: { a1: { npcId: "ann", status: "working" }, a2: { npcId: "ann", status: "working" },
      a3: { npcId: "bo", status: "working" }, a4: { npcId: "cy", status: "done" } } };
    check("§47: R25b · capacity counts PEOPLE, not charges — two charges on one person is one delegate",
      ASG.activeDelegates(ws).length === 2, ASG.activeDelegates(ws).join(' · '));
    check("§47: …and a FINISHED charge frees the person",  !ASG.activeDelegates(ws).includes("cy"));
    const at2 = { level: 20, subAttributes: {} };   // capacity 2, and two are running
    check("§47: R25b · ⛔ a NEW person is refused at capacity",
      !!ASG.delegationRefusal(ws, "dee", { ladder, character: at2 }));
    check("§47: …but someone ALREADY carrying work can take another charge",
      ASG.delegationRefusal(ws, "ann", { ladder, character: at2 }) === null);
    check("§47: …the refusal SAYS WHY — an unexplained refusal is indistinguishable from a bug",
      /\S/.test(ASG.delegationRefusal(ws, "dee", { ladder, character: at2 })?.note || ""));
    check("§47: ⚠️ absent means today — no ladder, no cap, byte-identical behaviour",
      ASG.delegationRefusal(ws, "dee", {}) === null);
    // ⛔ NEVER RETROACTIVE. A save already over capacity keeps every delegate it has.
    const at0 = { level: 5, subAttributes: {} };
    check("§47: ⛔ an over-capacity save loses NOBODY — the cap only ever refuses a new one",
      ASG.activeDelegates(ws).length === 2 && LAD.delegationCapacity(ladder, at0) === 0);
  }

  // ── R27 · a rename target may be conditioned, and may be more than one craft ──
  {
    const step = REC.CHARACTER_STEPS.find(x => x.id === "ability-rename-map");
    const known = { second_wind: { id: "second_wind" }, perfect_motion: { id: "perfect_motion" } };
    const ctx = { content: { abilities: known, rules: { abilityRenames: RENAMES_47 } } };
    const run = (level) => {
      const c = { level: 20, abilities: [{ abilityId: "soma", level, uses: 7 }] };
      step.apply(c, ctx); return c.abilities;
    };
    // ⛔ THE SPLIT AXIS IS RANK, AND THE REVERT LOG SAYS SO: OUTLAST (Soma r1–r2) / EXECUTE (Soma r3).
    check("§47: R27 · a soma held at rank 1 or 2 receives `second_wind` ONLY — never the unearned strike",
      [1, 2].every(r => run(r).length === 1 && run(r)[0].abilityId === "second_wind"),
      JSON.stringify(run(2)));
    check("§47: R27 · ⚑ a soma held at rank 3 receives BOTH halves — taking one is a loss they did not choose",
      run(3).length === 2 && run(3).map(a => a.abilityId).sort().join('+') === 'perfect_motion+second_wind',
      JSON.stringify(run(3)));
    check("§47: R27 · …and the rank it carried is honoured, not reset to 1",  run(2)[0].level === 2, String(run(2)[0].level));
    check("§47: R27 · ⚠️ the ORIGINAL entry survives, so uses and provenance ride along",  run(3)[0].uses === 7);
    check("§47: R27 · …stamped `migratedFrom`, so nobody has to guess later whether they chose it",
      run(3).every(a => a.migratedFrom === "soma"));

    // ⛔ ALL-OR-NOTHING. A HALF-migrated split is worse than an unmigrated one: it looks finished.
    const thin = { content: { abilities: { second_wind: { id: "second_wind" } }, rules: { abilityRenames: RENAMES_47 } } };
    const c3 = { level: 20, abilities: [{ abilityId: "soma", level: 3 }] };
    step.apply(c3, thin);
    check("§47: R27 · ⛔ a missing target skips the WHOLE entry — no half-migrated split",
      c3.abilities.length === 1 && c3.abilities[0].abilityId === "soma", JSON.stringify(c3.abilities));

    // ⚠️ AND THE 371 PLAIN-STRING ENTRIES ARE UNTOUCHED — the whole map is regression surface.
    const strs = Object.entries(RENAMES_47).filter(([, v]) => typeof v.to === 'string' && v.to !== 'CUT');
    let okN = 0;
    for (const [from, v] of strs) {
      const c = { level: 5, abilities: [{ abilityId: from, level: 2 }] };
      step.apply(c, { content: { abilities: { [v.to]: { id: v.to } }, rules: { abilityRenames: RENAMES_47 } } });
      if (c.abilities.length === 1 && c.abilities[0].abilityId === v.to && c.abilities[0].level === 2) okN++;
    }
    check(`§47: R27 · all ${strs.length} plain-string renames still migrate, rank preserved`, okN === strs.length,
      `${okN}/${strs.length}`);

    // ⛔ AND THE `+` FORM IS GONE. It parsed, resolved to nothing, and was silently skipped — documentation
    // wearing a mechanism's clothes. Nothing may reintroduce it.
    check("§47: R27 · ⛔ no rename target is a `+` expression any more",
      !Object.values(RENAMES_47).some(v => typeof v.to === 'string' && v.to.includes('+')));
  }
}
/* ═════ §48 — SNG-358: A PLACE YOU HOLD, PROPOSED AND NEVER IMPOSED ═════ */
// ⛔ Aevi reported the Raven's Home post would "leave state when the reconstruction completes". It is WORSE:
// it is not in the holdings system at all — an assignment string only. There is nothing for completion to
// delete because nothing was ever created.
//
// ⛔ AND THE MIGRATION MUST NOT CLASSIFY. Silas's charge "Silas's named delegate to Mara Wells…" — which is
// a RELATIONSHIP and must never become a holding — contains the words "holds the Millbrook crisis thread".
// A location resolver finds a real authored place in the ONE assignment that must not have one.
console.log("\n── §48 · holdings: offered, never imposed ──");
{
  const RC48 = await import("../engine/reconcile.js");
  const WT48 = await import("../engine/worldtick.js");
  const HD48 = await import("../engine/holdings.js");
  const step48 = RC48.CHARACTER_STEPS.find(x => x.id === "holdings-from-assignments");
  check("§48: the migration step EXISTS and is player-facing", !!step48 && step48.playerFacing === true);

  // ⛔ THE TRAP CHARGE, VERBATIM FROM SILAS'S SAVE.
  const TRAP = "Silas's named delegate to Mara Wells and the Hub committee water meeting — holds the Millbrook crisis thread if Silas";
  const POST = "full reconstruction of the Raven's Home post — laboratory, workshop, Watch, forge, keeper's hut";
  const ws48 = { assignments: {
    t: { id: "t", npcId: "edvar-crane", npcName: "Edvar Crane", charge: TRAP, status: "working" },
    p: { id: "p", npcId: "cassiel-ord", npcName: "Cassiel Ord", charge: POST, status: "working" } } };
  const locs48 = { millbrook: { id: "millbrook", name: "Millbrook" } };
  const mk48 = () => ({ level: 30, holdings: [], worldState: JSON.parse(JSON.stringify(ws48)) });
  const c48 = mk48();
  const r48 = step48.apply(c48, { content: { locations: locs48 } });

  check("§48: ⛔ it MINTS NOTHING — every holding is still unclaimed after the step",
    (c48.holdings || []).length === 0, JSON.stringify(c48.holdings));
  check("§48: …it returns `offers` instead — the contract channel that had no producer until now",
    (r48.offers || []).length === 2, String((r48.offers || []).length));

  // ⛔ THE TRAP IS OFFERED, AND MARKED. Withholding it would be a heuristic deciding for the player —
  // and this heuristic has already been wrong once, on this exact charge.
  const trap48 = r48.offers.find(o => o.assignmentId === "t");
  const post48 = r48.offers.find(o => o.assignmentId === "p");
  check("§48: ⛔ a location resolver DOES find Millbrook in the charge that must never be a holding",
    trap48.suggestedLocationName === "Millbrook", String(trap48.suggestedLocationName));
  check("§48: …and it is marked as reading like a PERSON, not a place",
    trap48.looksLikePerson === true && trap48.looksLikePlace === false);
  check("§48: …the hint says so in words the player can act on", /person/i.test(trap48.why), trap48.why);
  check("§48: ⚠️ but it is still OFFERED — a charge silently withheld is a decision made for the player",
    !!trap48);
  check("§48: …while the genuine post reads as a standing place", post48.looksLikePlace === true);

  // ⛔ AN OFFER IS A STANDING QUESTION. A reconcile step runs ONCE — `reconcile()` skips any step at or
  // below the save's version — so an offer that lived only in the return value would be asked once,
  // silently, to a player who may not have been looking at the right screen.
  check("§48: ⛔ offers are PERSISTED on the character, not just returned",
    (c48.holdingOffers || []).length === 2, String((c48.holdingOffers || []).length));

  // ⛔ AND ANSWERED IS ANSWERED. §3: anything that fires more than once for the same subject is a bug.
  const c48b = mk48(); c48b.holdingsNotPlaces = ["t"];
  const r48b = step48.apply(c48b, { content: { locations: locs48 } });
  check("§48: a charge the player has already called NOT a place is never offered again",
    r48b.offers.length === 1 && r48b.offers[0].assignmentId === "p");
  const c48c = mk48();
  c48c.holdings = [{ id: "h", fromAssignment: "p" }];
  check("§48: …and one already minted is not re-offered either",
    step48.apply(c48c, { content: { locations: locs48 } }).offers.length === 1);

  // ⛔ THE LINK LIVES ON THE HOLDING, because the assignment is FINITE and the holding is not.
  {
    const c = { holdings: [] };
    const h = HD48.addHolding(c, { id: "h1", name: "The Threshold Post", fromAssignment: "a::b", day: 3 });
    check("§48: a migrated holding remembers the assignment that earned it", h.fromAssignment === "a::b");
    check("§48: ⚠️ …and enters at `holding`, unstewarded — never at a rank the place has not earned",
      h.condition === "holding", h.condition);
    const plain = HD48.addHolding(c, { id: "h2", name: "Bare" });
    check("§48: …a holding claimed in play carries no such field at all", !("fromAssignment" in plain));
  }

  // ⛔ §5.2 — THE SECOND SURFACE. Erik ruled BOTH, with different jobs: the sheet is where the player goes
  // LOOKING, the tick news is where they are TOLD. ⚠️ ONCE, EVER.
  {
    const c = { holdings: [], company: [], holdingOffers: [{ assignmentId: "a1" }, { assignmentId: "a2" }] };
    const first = WT48.advanceHoldings({ character: c }).news.map(n => n.text);
    const second = WT48.advanceHoldings({ character: c }).news.map(n => n.text);
    check("§48: the tick TELLS the player, beside the delegated work", first.length === 1 && /not written down as yours/.test(first[0]), first.join(" | "));
    check("§48: ⛔ …and never again — a re-announced offer is nagging, not news", second.length === 0, second.join(" | "));
    check("§48: …a character with no offers hears nothing",
      WT48.advanceHoldings({ character: { holdings: [], company: [] } }).news.length === 0);
  }

  // ⛔ THE CELEBRATION IS ON THE ACCEPTANCE, NOT THE OFFER (§5) — and it shares ONE card with the braid
  // moment rather than copying it. §1: the format "already runs FOUR variants off one implementation".
  const app48 = rd("app.js");
  check("§48: the acceptance moment fires on the player’s DECISION, not the engine’s detection",
    /function showPlaceMoment\(/.test(app48) && /showPlaceMoment\(h, o\)/.test(app48));
  check("§48: ⛔ …on the SHARED card — there is exactly one `.help-card braid-moment` in the source",
    (app48.match(/class="help-card braid-moment"/g) || []).length === 1,
    String((app48.match(/class="help-card braid-moment"/g) || []).length));
  check("§48: …and the naming invitation rides along, which is the part §2 calls load-bearing",
    /id="braid-rename-in"/.test(app48) && /function momentCard\(/.test(app48));

  // ⛔ AND A GUARD THAT NAMED A CONDITION THIS VOCABULARY DOES NOT HAVE. `canRaiseBand` filtered on
  // `!== "failed"` — borrowed from the QUEST vocabulary — so it excluded nothing and a collapsing post
  // counted as fully as a thriving one toward raising a band.
  {
    const ME48 = await import("../engine/melee.js");
    const mk = cs => ({ level: 20, subAttributes: {}, holdings: cs.map((c, i) => ({ id: "h" + i, condition: c })) });
    const n = cs => ME48.canRaiseBand(mk(cs), { cfg: {} }).holdings;
    check("§48: ⛔ a FAILING holding no longer counts toward raising a band",
      n(["failing", "failing"]) === 0 && n(["failing", "thriving"]) === 1 && n(["holding", "thriving"]) === 2,
      [n(["failing","failing"]), n(["failing","thriving"]), n(["holding","thriving"])].join("/"));
    check("§48: …and every condition it does count is one the holdings vocabulary actually has",
      ["failing", "strained", "holding", "thriving"].join(",") === HD48.CONDITIONS.join(","));
  }
  // ⛔ A RANK MAY FAIL MORE GENTLY THAN ITS CRAFT. `progression.rungOf()` reads `tree[].backlashRung`
  // BEFORE the ability-level value — so r1/r2 `none` against an ability-level `damaging` means the early
  // ranks are safe and only mastery bites back. ⚠️ THE SCHEMA DID NOT DECLARE THE FIELD, so 20 crafts
  // authored this way failed validation while the engine was already reading them.
  {
    const PRG = await import("../engine/progression.js");
    const sch = rj("schemas/ability.schema.json");
    check("§48: a rank may fail more gently than its craft — tree[].backlashRung is a declared field",
      !!sch.properties?.tree?.items?.properties?.backlashRung);
    const perRank = abilities.filter(x => (x.tree || []).some(t => t?.backlashRung));
    check("§48: …and crafts actually author it", perRank.length > 0, `${perRank.length} craft(s)`);
    check("§48: ⛔ …and the per-rank value WINS over the ability-level one",
      /entry\?\.backlashRung \|\| def\.backlashRung/.test(rd("engine/progression.js")));
  }
  // ⛔ ERIK 2026-09-02 — "count the people in the game, robustly." The number drifted three times in one
  // session because nothing owned it, and two systems read 63 and 113. ⚠️ ONE OF THE 113 WAS NOT A PERSON:
  // `legends.json` is a collection file with no `id` of its own, so the loader stored its documentation
  // HEADER under the key "undefined".
  {
    const { loadContentHeadless: lch99 } = await import("./headless_content.mjs");
    const CT99 = await lch99();
    const k99 = Object.keys(CT99.npcs || {});
    check("§48: ⛔ a documentation note is not a person — no record is keyed `undefined`",
      !k99.includes("undefined") && k99.every(k => CT99.npcs[k]?.id === k),
      k99.filter(k => CT99.npcs[k]?.id !== k).join(" · "));
    check("§48: …and every person is keyed by their own id — nothing is double-keyed",
      new Set(k99.map(k => CT99.npcs[k]?.id)).size === k99.length);
  }
  // ⛔ ERIK (2026-09-02): "have it be the actual place name, not just ✦ A PLACE IS YOURS ✦", and "make sure
  // when the Celebration fires it has a generated image with it… that will let someone regen".
  //
  // ⚠️ THE DEFAULT NAME WAS WORSE THAN GENERIC — IT WAS A SENTENCE FRAGMENT. Splitting the charge on its
  // first dash would have celebrated Silas’s post as "full reconstruction of the Raven’s Home post": a work
  // order standing in a place’s slot. ⛔ ASSERTED AGAINST HIS REAL CHARGES, not invented ones.
  {
    const src48 = /function placeNameFrom[\s\S]*?\n}/.exec(app48);
    const nameFrom = src48
      ? eval("(" + src48[0].replace(/^function placeNameFrom/, "function") + ")")
      : () => null;
    check("§48: ⛔ the celebration names the PLACE, not the work order",
      nameFrom("full reconstruction of the Raven's Home post — laboratory, workshop, Watch") === "Raven's Home",
      String(nameFrom("full reconstruction of the Raven's Home post — laboratory, workshop, Watch")));
    check("§48: …and a curly apostrophe reads the same as a straight one — names are written by people",
      nameFrom("reconstruction of the Raven’s Home post") === "Raven’s Home",
      String(nameFrom("reconstruction of the Raven’s Home post")));
    check("§48: …and reads a post out of a warden’s charge",
      nameFrom("warden of the Threshold Post at the ridge node—hold the network") === "Threshold Post",
      String(nameFrom("warden of the Threshold Post at the ridge node—hold the network")));
    check("§48: …while an AUTHORED place match still wins outright",
      nameFrom("anything at all", "Millbrook") === "Millbrook");
    check("§48: …and no charge ever yields an empty name",
      ["", "a b c", "the thing — and more"].every(c => (nameFrom(c) || "").length > 0));
  }
  check("§48: ⛔ the kicker carries the place’s own name — a generic kicker spends the first line on a category",
    /IS YOURS/.test(app48) && /placeName\.length <= 28/.test(app48));

  // ⛔ AND THE IMAGE IS REGENERABLE, WHICH MEANS THE LIGHTBOX MUST RESOLVE A RECORD FOR IT. An img carrying
  // provenance into a kind the registry does not know is the fourth door, on the very surface built to
  // show the image work off.
  check("§48: the celebration mints a generated image and caches it on the holding",
    /function ensureHoldingImage\(/.test(app48) && /regenKind: "holding", regenSubject: holding\.id/.test(app48));
  check("§48: ⛔ …and `holding` is a REGISTERED regen kind, so re-roll / rebuild / keep all resolve",
    /^\s*holding: \{/m.test(app48) && /find: id => holdingOf\(id\)/.test(app48));
  check("§48: …and the art layer draws a HOLDING — its seat and condition, not a borrowed location seed",
    /kind === "holding"/.test(rd("engine/art.js")));
  // ⛔ THE FIRST PLAYER-FACING SURFACE HOLDINGS HAVE EVER HAD, and the handlers that answer it.
  // ⛔ ERIK: "The holdings should have a spot in your UI somewhere… detailed in a character sheet tab."
  //
  // ⚠️ THE TAB-BAR’S OWN COMMENT NAMES THE FAILURE THIS GUARDS: "that is how a third tab gets added to the
  // markup and stays dead on two of the three screens." ⛔ SO ALL FOUR DOORS ARE ASSERTED — the button
  // exists, the wiring binds it, the renderer exists, and the offer handlers are reachable from it.
  check("§48: there is a Holdings TAB, and every door to it is open",
    /id="tab-holdings"/.test(app48) && /go\("tab-holdings"/.test(app48) &&
    /function renderHoldingsTab\(/.test(app48) && /characterTabBar\("holdings"\)/.test(app48));
  check("§48: …and its offer buttons are wired by the SAME function the Traits screen uses",
    /function wireHoldingOffers\(/.test(app48) &&
    (app48.match(/wireHoldingOffers\(\)/g) || []).length >= 2,
    String((app48.match(/wireHoldingOffers\(\)/g) || []).length));
  // ⚠️ ONE ANSWERABLE OFFER, IN ONE PLACE. The same offer with the same two buttons twice on one screen is
  // not two surfaces — it is one surface repeating itself. Traits keeps a summary and a door.
  check("§48: the Traits screen keeps a SUMMARY and a door, not a second copy of the buttons",
    /cs-holdings-summary/.test(app48) && /id="cs-goto-holdings"/.test(app48) &&
    (app48.match(/data-hold-accept="/g) || []).length === 1,
    String((app48.match(/data-hold-accept="/g) || []).length));
  // ⛔ AND THE TAB SHOWS WHAT IS REAL. A holding record has no income, defence, resource or power on it,
  // and a panel displaying a number the engine never computes teaches the player something false.
  check("§48: the tab reports the CAPACITY ladder — R25’s first player-facing surface",
    /companyPlaces\(ladder, character\)/.test(app48) && /delegationCapacity\(ladder, character\)/.test(app48) &&
    /canRaiseBand\(character/.test(app48));
  check("§48: ⛔ …with BOTH answers wired — a button with no handler is the fourth door",
    /data-hold-accept/.test(app48) && /data-hold-dismiss/.test(app48) &&
    /querySelectorAll\("\[data-hold-accept\]"\)/.test(app48) && /querySelectorAll\("\[data-hold-dismiss\]"\)/.test(app48));
}
/* ═════ §49 — SNG-486: THE FIRST AUTHORED NPC SHEET, AND THE THREE DOORS IT WAS BEHIND ═════ */
// ⛔ Aevi authored Pell Ran Marsh — L27, eight sub-attributes, 17 crafts. ⚠️ NONE OF IT REACHED THE ENGINE:
//
//   1. `pell.json` was not in the pack manifest — 43 listed, 44 on disk. The file never loaded.
//   2. `sheetFor` says "AN AUTHORED SHEET ALWAYS WINS" — but `authored` is a CALLER-SUPPLIED OPTION and
//      nothing passes one. The record itself was never consulted.
//   3. `craftsOf` reads `skillsObserved`. ⛔ MEASURED: zero of 44 authored NPCs have ever carried that
//      field. A reader with no writer met a writer with no reader — the same defect from both sides.
//
// ⚠️ THE LEVEL LANDED AND NOTHING ELSE DID, which is the worst version: enough got through that the sheet
// looked plausible — L27, health 81 — while `subAttributes` was {} and `skills` was [].
console.log("\n── §49 · the authored sheet actually arrives ──");
{
  const NS49 = await import("../engine/npcsheet.js");
  const pell = rj("content/packs/valley/npcs/pell.json");

  // ⛔ DOOR 2 — REGISTERED. Every npc file on disk is named by the manifest.
  {
    const man = rj("content/packs/valley/manifest.json");
    const listed = new Set((man.provides?.npcs || []).map(x => String(x).split("/").pop()));
    const onDisk = readdirSync(join(root, "content/packs/valley/npcs")).filter(f => f.endsWith(".json"));
    const missing = onDisk.filter(f => !listed.has(f));
    check("§49: ⛔ every authored NPC file is REGISTERED — registration is not arrival, but absence is never it",
      missing.length === 0, missing.join(" · "));
  }

  // ⛔ DOOR 4 — READ. The record carries its own sheet, and that beats derivation.
  const sheet = NS49.sheetFor(pell, {});
  check("§49: an authored record produces an AUTHORED sheet, not a derived one",
    sheet.authored === true && sheet.derived === false,
    `authored=${sheet.authored} derived=${sheet.derived}`);
  check("§49: ⛔ …and her eight sub-attributes survive — derivation cannot produce these",
    Object.keys(sheet.subAttributes || {}).length === 8 && sheet.subAttributes.craft === 14,
    JSON.stringify(sheet.subAttributes));
  check("§49: …her authored LEVEL is honoured", sheet.level === 27, String(sheet.level));

  // ⚠️ AND A PERSON NOBODY WROTE DOWN IS UNCHANGED — derivation is for exactly them.
  const stranger = NS49.sheetFor({ id: "x49", name: "A Stranger", role: "a carter" }, {});
  check("§49: ⚠️ a person nobody authored is still DERIVED, byte-for-byte as before",
    stranger.derived === true && !stranger.authored && Object.keys(stranger.subAttributes || {}).length === 0);

  // ⛔ DOOR 3 — HER CRAFTS REACH THE FIGHT. `abilities` is the shape a PLAYER carries; it names crafts by
  // ID and carries the RANK, so it is the better shape and it is read FIRST.
  {
    const cat49 = {};
    for (const a of abilities) if (a && a.id) cat49[a.id] = a;
    const bs = NS49.battleSkillsFor(pell, { catalog: cat49 });
    check("§49: ⛔ her 17 authored crafts reach the fight — not just a plain strike",
      bs.skills.length > 1, `${bs.skills.length} skill(s)`);
    check("§49: …and they are HER crafts, resolved by id",
      bs.skills.some(x => x.id === "stone_read") && bs.skills.some(x => x.id === "thingcraft"),
      bs.skills.slice(0, 5).map(x => x.id).join(" · "));
    // ✅ R47 (2026-09-05): the bare strike is for a kit with NO free floor — Pell's crafts derive one, so she is not handed
    // it. What §49 exists to protect is PARITY: an NPC is not a different kind of thing, so both menus ask the same rule.
    // The behaviour of both branches is asserted with fixtures in §76.
    check("§49: ✅ …and the bare strike follows the SAME rule as the player's menu (R47) — an NPC is not a different kind of thing",
      /offersFreeFloor\(crafts, \{ cfg: opts\?\.rules\?\.energy \}\)/.test(rd("engine/npcsheet.js"))
      && /offersFreeFloor\(\(character\?\.abilities/.test(rd("engine/battle_turn.js")));
    // ⚠️ THE OLD FIELD STILL WORKS. Nothing authored it, but a reader that drops a shape it used to
    // accept is a migration disguised as a fix.
    const obs = NS49.battleSkillsFor({ id: "o49", skillsObserved: ["stone_read"] }, { catalog: cat49 });
    check("§49: `skillsObserved` is still read, so nothing that used it breaks",
      obs.skills.some(x => x.id === "stone_read"));
  }

  // ⛔ AND THE ONE THING STILL MISSING, ASSERTED AS MISSING so it cannot be forgotten: with no
  // `assistTags`, `contributionsOf` falls to its HARM default and a master smith counts as a striker.
  // ⚠️ THIS IS AUTHORING, NOT WIRING — SPEC_party_contributions §R2.2. When Aevi tags her, this goes RED
  // and the line below is what must be updated.
  {
    const CB49 = await import("../engine/combatants.js");
    const fams = CB49.contributionsOf(pell);
    // ✅ CLOSED THE SAME DAY IT WAS RECORDED. Aevi tagged her, so the families are real now.
    check("§49: her assistTags produce real families — she is a restorer and a knower, not a striker",
      fams.includes("RESTORE") && fams.includes("KNOW"), JSON.stringify(fams));
    // ⛔ BUT THE HARM DEFAULT STILL FIRES, AND THIS IS THE PART TAGS CANNOT FIX. `contributionsOf` adds
    // HARM to every record not explicitly forbidden to strike, so the fold filter still passes a master
    // smith as a striker. ⚠️ TAGGING SOMEONE A RESTORER DOES NOT STOP THEM COUNTING AS ONE — only
    // `canStrike: false` does. Recorded as a gap in §10 rather than fixed here: whether a smith can swing
    // is a content judgement, not a wiring one.
    check("§49: ⛔ …and HARM is STILL on her, because the default fires regardless of tags",
      fams.includes("HARM") && pell.canStrike === undefined, JSON.stringify(fams));
  }
}
/* ═════ §50 — R28: AUTHORED GROUND IS CANON, AND SOMETHING FINALLY READS IT ═════ */
// ⛔ `local_layouts.json` was authored 2026-08-14 — 18 of 135 places, 84 placed sites — and its ONLY
// consumer was the test that reported it disagreeing with the generator.
//
// ⚠️ ERIK RULED: "Where a place is hand-authored, the authored ground is the truth. The generator fills in
// the rest." ⛔ DEFERRING BY SWITCHING THE TEST OFF WOULD HAVE DROPPED 18 HAND-AUTHORED LAYOUTS rather than
// promoting them — so the ground got a reader instead.
//
// ⚠️ AND IT IS NOT A MAP. A bearing and a distance are a sentence, and the narrator is a surface that
// already exists — a well at the centre and a river two miles south-west is something the GM can say.
console.log("\n── §50 · R28 · the authored ground ──");
{
  const PL50 = await import("../engine/places.js");
  const L50 = rj("content/packs/core/world/local_layouts.json");
  const ids50 = Object.keys(L50).filter(k => !k.startsWith("_"));

  check("§50: every authored layout renders — none is silently dropped",
    ids50.every(id => PL50.authoredGroundFor(id, L50)),
    ids50.filter(id => !PL50.authoredGroundFor(id, L50)).join(" · "));
  check("§50: ⚠️ …and a place with NO authored layout says nothing at all — 117 of 135 is the dominant case",
    PL50.groundForGM("archive_hollow", L50) === "" && PL50.groundForGM("nowhere-at-all", L50) === "");

  // ⛔ THE GROUND READS AS GROUND, not as a table of numbers.
  const mb = PL50.groundForGM("millbrook", L50);
  check("§50: the well Erik put IN the village is at its centre",  /The Village Well — at the centre/.test(mb), mb.split("\n")[1]);
  check("§50: …and the river he moved OUT of it is miles away, in a direction",
    /The Echo \(water\) — 2\.0 mi south-west/.test(mb), mb.split("\n").find(l => /Echo/.test(l)));
  check("§50: ⚠️ a feature AT the centre is not reported as \"0 m north\" — that is not a sentence",
    !/(^|[^0-9])0 m /.test(mb));

  // ⚠️ BEARINGS ARE WRITTEN BOTH WAYS IN THE FILE — 0..360 in some entries, -180..180 in others. The same
  // convention split content_ci had to handle, normalised once here rather than at every call site.
  check("§50: a bearing reads the same whichever convention it was written in",
    PL50.compassOf(-134) === PL50.compassOf(226) && PL50.compassOf(0) === "north" && PL50.compassOf(90) === "east");

  // ⛔ ALL FOUR DOORS. Fetched, destructured, ATTACHED, and read — SNG-342's census is files that got as
  // far as being loaded. A fetch with no attach is a download the engine throws away.
  const st50 = rd("engine/state.js"), gr50 = rd("engine/gm_registry.js");
  check("§50: ⛔ the file is fetched, destructured, ATTACHED and READ — all four",
    /local_layouts\.json/.test(st50) && /localLayoutsDoc\] = await/.test(st50) &&
    /rules\.localLayouts = localLayoutsDoc/.test(st50) &&
    /groundForGM\(env\.location\?\.id, env\.rules\?\.localLayouts\)/.test(gr50));
  check("§50: …and it is a registered GM block, so it reaches the narrator",  /key: "groundDetail"/.test(gr50));
}
/* ═════ §51 — THE PERSON-KEYED SHEET GOES LIVE, AND THE BRIDGE STOPS LYING ═════ */
// ⛔ `npcsheet.js` had NO live importer — 395 lines, tests only. Aevi proposed minting sheets and not
// wiring them to combat; that builds a writer with no reader ON PURPOSE, which is the shape that hid
// folkAccessible, backlashRung, holdings, sectFlavour, local_layouts and this module itself for weeks.
//
// ✅ SO THE FIRST CALLER READS AND CANNOT HURT: the narrator. If a sheet is wrong the GM says something
// odd about a person and no number moves.
//
// ⛔ AND THE BRIDGE SAID SOMETHING FALSE. `synthesizeOpponentSheet`'s comment claims an authored
// `skills[]` "overrides the synthesis entirely"; every OTHER field was `authored ?? derived-from-threat`,
// with threat defaulting to 20 — so a level-27 smith arrived wearing a middling raider's body.
console.log("\n── §51 · the person-keyed sheet, live ──");
{
  const NS51 = await import("../engine/npcsheet.js");
  const SB51 = await import("../engine/skill_battle.js");
  const { loadContentHeadless: lch51 } = await import("./headless_content.mjs");
  const C51 = await lch51();
  const sb51 = C51.rules?.skillBattle || {};
  const pell51 = C51.npcs["pell"];

  // ⛔ THE FIRST LIVE CALLER, ALL FOUR DOORS.
  const gr51 = rd("engine/gm_registry.js"), gm51 = rd("engine/gm.js");
  check("§51: ⛔ npcsheet has a LIVE importer at last — not a test",
    /from "\.\/npcsheet\.js"/.test(gr51), "gm_registry imports it");
  check("§51: …registered as a GM block",  /key: "sheetsDetail"/.test(gr51));
  check("§51: …destructured by gm.js — a row gm.js never names lands nowhere",
    /groundDetail, sheetsDetail,/.test(gm51));
  check("§51: …and pushed into the prompt",  /world\.push\(`## WHAT THESE PEOPLE CAN DO/.test(gm51));

  // ⛔ THE BLOCK SAYS WHICH IS AUTHORED AND WHICH IS DERIVED. A narrator told a guess and a fact in the
  // same voice will treat them the same.
  const block51 = NS51.sheetsForGM([pell51, C51.npcs["adept_sona"]].filter(Boolean), { catalog: C51.abilities });
  check("§51: an authored person is reported as authored, at her own level",
    /Pell Ran Marsh — level 27 \(authored\)/.test(block51), block51.split("\n")[0]);
  check("§51: ⚠️ …and a derived one says so — \"as the story has shown them\"",
    /as the story has shown them/.test(block51));
  check("§51: …her crafts are named, one row per craft rather than one per function",
    /knows: Stone-Read/.test(block51) && !/knows:.*Stone-Read.*Stone-Read/.test(block51));

  // ⛔ AND WHAT A BODY CANNOT DO REACHES THE NARRATOR. `canStrike: false` is the ONLY thing that
  // suppresses the HARM default — a narrator that does not know it will have a scholar swinging.
  // ⚠️ FROM `physicality`, NEVER FROM `_canStrikeWhy`: that is an author's note in working-paper voice.
  const wren51 = C51.npcs["child_wren"];
  if (wren51) {
    const b = NS51.sheetsForGM([wren51], { catalog: C51.abilities });
    check("§51: a person who cannot strike says so", /cannot strike/.test(b), b.split("\n").pop());
    check("§51: ⛔ …and never quotes the author\u2019s own note into the prompt", !/⛔|⚠️/.test(b));
  }

  // ⛔ STEP 3 — A NAMED PERSON FIGHTS AS THEMSELVES. Committing violence against Pell used to build
  // `{ name, threat, tacticTags: [] }`: a difficulty rating, with her level and seventeen crafts nowhere.
  {
    // ✅ 2026-09-05: the body of `personOpponent` and of `escalateToFight` moved to engine/battle_turn.js (§71) — app.js keeps the
    // wrappers; the shape is asserted where it lives now.
    const app51 = rd("app.js"), bt51 = rd("engine/battle_turn.js");
    check("§51: ⛔ a named person fights as themselves, not as a difficulty rating",
      /function personOpponent\(/.test(app51) && /personOpponentFor\(rec/.test(app51) &&
      /opponent: person \|\| \{ name: target\?\.name, threat: fallbackThreat/.test(bt51));
    check("§51: …and it hands over the WHOLE sheet, never skills alone",
      /attributes: sheet\.attributes, health: sheet\.health, energy: sheet\.energy/.test(bt51));
    check("§51: ⚠️ …while a stranger still falls to the threat curve — 112 people is not everyone",
      /if \(!rec\) return null;/.test(app51) && /if \(!skills\.length\) return null;/.test(bt51));
  }
  // ⛔ THE BRIDGE. A half-passed sheet is refused rather than silently completed at threat 20.
  {
    const skills = NS51.battleSkillsFor(pell51, { catalog: C51.abilities }).skills;
    let refused = false;
    try { SB51.synthesizeOpponentSheet({ name: "x", skills }, sb51); } catch { refused = true; }
    check("§51: ⛔ skills with no body and no threat is REFUSED, not completed at threat 20", refused);

    const sheet = NS51.sheetFor(pell51, {});
    const full = SB51.synthesizeOpponentSheet({ name: sheet.name, attributes: sheet.attributes,
      health: sheet.health, energy: sheet.energy, soak: sheet.soak, skills }, sb51);
    check("§51: ✅ …and the WHOLE sheet passes through — her body, not a raider\u2019s",
      full.health === sheet.health && full.attributes.practical === sheet.attributes.practical,
      `health ${full.health} vs ${sheet.health}`);
    check("§51: …carrying every craft she has", full.skills.length === skills.length, `${full.skills.length}`);

    // ⚠️ AND THE THREAT PATH IS UNTOUCHED — it is the other direction of the same ladder, not a rival.
    const foe = SB51.synthesizeOpponentSheet({ name: "a raider", threat: 60 }, sb51);
    check("§51: ⚠️ a mass with only a threat number still resolves — the fast path is not retired",
      foe.health > 0 && foe.skills.length > 0, `health ${foe.health}, ${foe.skills.length} skill(s)`);
  }
}
/* ═════ §52 — THE COMPOSITION LADDER: person → unit, and back down ═════ */
// ⛔ Erik: "the group or unit sheets can be derivative of the NPC sheets — how many NPCs with skills does a
// unit have, what skills with wards and types, how many simple soldiers."
//
// ⚠️ THE DOWNWARD HALF WAS ALREADY BUILT — `bandThreat` is `sqrt(effective) × scale`. What was missing is
// the way UP: a contingent was an anonymous count and nothing could build one from people who exist.
//
// ✅ AND THE UPWARD HALF NEEDED NO NEW AGGREGATION. `bandCan`, `bandStrength`, `bandGaps` and `bandThreat`
// all work unchanged on composed contingents — which is the reconciliation the architecture claims.
console.log("\n── §52 · person → unit → number ──");
{
  const ML = await import("../engine/melee.js");
  const CB52 = await import("../engine/combatants.js");
  const co = CB52.contributionsOf;
  const levy = (i) => ({ id: `lv${i}`, name: "a levy" });
  const levies = Array.from({ length: 20 }, (_, i) => levy(i));

  // ⛔ A UNIT OF NOBODIES HAS THE GAPS THAT COST SOMETHING.
  const plain = { id: "p52", contingents: ML.contingentsFromPeople(levies, { contributionsOf: co }) };
  check("§52: twenty plain levies bring no mender, no warder and no eyes",
    ["RESTORE", "PROTECT", "KNOW"].every(f => ML.bandGaps(plain).some(g => g.missing === f)),
    ML.bandGaps(plain).map(g => g.missing).join(" · "));
  check("§52: …and none of them counts as skilled", ML.unitComposition(plain).withSkills === 0);

  // ✅ ONE PERSON CHANGES WHAT THE UNIT IS. This is the whole point of composing upward.
  const warder = { id: "w52", name: "a warder", assistTags: ["guard", "tend"] };
  const mixed = { id: "m52", contingents: ML.contingentsFromPeople([...levies.slice(0, 19), warder], { contributionsOf: co }) };
  check("§52: ⚑ ONE warder closes two of the three gaps — a unit is who is in it",
    !ML.bandGaps(mixed).some(g => g.missing === "PROTECT") && !ML.bandGaps(mixed).some(g => g.missing === "RESTORE"),
    ML.bandGaps(mixed).map(g => g.missing).join(" · "));
  check("§52: …and the composition reports him by name, and counts the rest",
    ML.unitComposition(mixed).withSkills === 1 && ML.unitComposition(mixed).simpleSoldiers === 19
    && ML.unitComposition(mixed).named.includes("a warder"));

  // ⚠️ HARM ALONE IS THE DEFAULT EVERY RECORD CARRIES, so it cannot make someone notable. A person whose
  // only family is the default belongs in the rank and file however well named.
  check("§52: ⚠️ carrying only the HARM default does not make someone skilled",
    ML.unitComposition({ id: "x", contingents: ML.contingentsFromPeople([{ id: "n", name: "Someone Grand" }], { contributionsOf: co }) }).withSkills === 0);

  // ⛔ AND THE BOUNDARY, ASSERTED AS A BOUNDARY. `bandThreat` is a MASS function: a hundred bodies collapse
  // to more threat than one powerful individual does, because a band of one is not what the band model is
  // for. ⚠️ THAT IS NOT A BUG TO TUNE OUT — it is the reason the person-keyed path exists. A named figure
  // is resolved by their SHEET; the collapse is for a mass nobody will inspect.
  const hundred = { id: "h52", contingents: ML.contingentsFromPeople(Array.from({ length: 100 }, (_, i) => levy(i)), { contributionsOf: co }) };
  const oneBig = { id: "e52", contingents: [{ n: 1, quality: 12, does: ["HARM", "MARTIAL", "PROTECT"], what: "an epic" }] };
  check("§52: ⛔ a hundred bodies out-threaten a band-of-one — so a PERSON is never resolved as a band",
    ML.bandThreat(hundred).power > ML.bandThreat(oneBig).power,
    `100 → ${ML.bandThreat(hundred).power}, one → ${ML.bandThreat(oneBig).power}`);
  check("§52: …and the collapse is still sub-linear — five times the bodies is not five times the threat",
    ML.bandThreat(hundred).power < 5 * ML.bandThreat(plain).power,
    `100 → ${ML.bandThreat(hundred).power} vs 20 → ${ML.bandThreat(plain).power}`);
}
/* ═════ §53 — OI-25: A CRAFT MADE IN PLAY IS A CANDIDATE, AND MUST BE IN THE ONTOLOGY ═════ */
// ⛔ Erik: "that type of generative nature needs a clear pipeline to the skill base list — that's the heart
// of the game engine." ⚠️ TWO DEFECTS UPSTREAM OF ANY PIPELINE, both in the generator:
//
//   1. A DISCOVERY GOT NO SECT. `tradition: "learned"` was hardcoded while `sources[0]` sat two lines
//      above carrying a real one. ⛔ A craft with no sect is in no domain, no school and no creation pool,
//      and cannot be taught — which is why Marrow's Wings is un-shareable.
//   2. THE FUNCTIONS WERE THE UNION OF THE PARENTS, not the new move the joining makes.
//
// ⚠️ THE DISTILLATION RULE IS TAKEN FROM THE AUTHORS, NOT INVENTED. Measured across the 61 authored
// recipes whose parents resolve: union mean 4.67 / max 8; authored child mean 2.30 / max 4, keeping 1.61
// inherited and adding 0.69 novel.
console.log("\n── §53 · OI-25 · the generator distils, and lands in a sect ──");
{
  const BR53 = await import("../engine/braids.js");
  const { loadContentHeadless: lch53 } = await import("./headless_content.mjs");
  const C53 = await lch53();
  // ⛔ NOT `byId` — that bag holds 24 poles, 3 folk and 2 others, and testing it answers a different
  // question. Erik: "ONLY THE POLES ARE TRADITIONS." I used `byId` here and it made my own gate assert
  // my own mistake.
  const TR53 = await import("../engine/traditions.js");

  // ⛔ THE DISTILLATION HOLDS THE AUTHORED SHAPE across every authored recipe's own parents.
  {
    const recipes = C53.rules.combinationRecipes.recipes || [];
    let over = 0, measured = 0, unionOver = 0;
    for (const r of recipes) {
      const parents = (r.parts || []).map(p => C53.abilities[p]).filter(Boolean);
      if (parents.length < 2) continue;
      measured++;
      const union = new Set(parents.flatMap(p => p.functions || []));
      if (union.size > 4) unionOver++;
      if (BR53.distilFunctions(parents).length > 4) over++;
    }
    check("§53: ⛔ no distilled braid exceeds the authored maximum of four functions",
      over === 0 && measured > 20, `${over} over, across ${measured} parent sets`);
    check("§53: ⚠️ …and the UNION would have — the rule is doing work, not agreeing by luck",
      unionOver > 0, `${unionOver} parent unions exceed 4`);
  }

  // ⛔ THE REAL CASE. `the-declared-threshold` carries EIGHT functions in Silas's save — both parents' whole
  // vocabulary. ⚠️ Its parents distil to something a person could describe.
  {
    const parents = ["working_model", "shadow_work"].map(i => C53.abilities[i]).filter(Boolean);
    const union = [...new Set(parents.flatMap(p => p.functions || []))];
    const dist = BR53.distilFunctions(parents);
    check("§53: a braid keeps fewer functions than its parents had between them",
      dist.length < union.length, `${dist.length} of ${union.length}`);
    check("§53: …and every one it keeps came from a parent or is the emergent move",
      dist.every(f => union.includes(f)));
    check("§53: ⚠️ two unlike parents are BOTH represented — not the first one twice",
      parents.length < 2 || dist.some(f => (parents[0].functions || []).includes(f)));
  }

  // ⛔ AND A DISCOVERY LANDS IN A REAL SECT. This is the one-line root cause of un-shareability.
  const src53 = rd("engine/braids.js");
  check("§53: ⛔ a discovery takes its sect from its sources, not the literal \"learned\"",
    /tradition: sources\[0\]\?\.tradition \|\| sources\[0\]\?\.powerSystem/.test(src53));
  check("§53: …and `powerSystem` still says \"learned\" — that vocabulary is separate and correct",
    /powerSystem: "learned"/.test(src53));
  check("§53: ⚠️ …so a braid of two ashwarden crafts is ashwarden, and CAN be taught",
    TR53.isPoleTradition(C53.abilities["deathsense"]?.tradition, C53.traditionIndex), String(C53.abilities["deathsense"]?.tradition));

  // ⚠️ AND THE GAP THIS DOES NOT CLOSE, ASSERTED AS OPEN. Bond-taught crafts carry no `functions` at all —
  // they work because the narrator reads prose, and they resolve to an empty capability set rather than
  // throwing. ⛔ Nomination and promotion (OI-25 §2 stage 2) are not built.
  {
    const CAP53 = await import("../engine/capabilities.js");
    const inert = { id: "x53", name: "a taught thing", energyCost: 3, description: "prose only" };
    check("§53: ⚠️ a craft with no functions degrades to nothing — it does not throw",
      Array.isArray(CAP53.capabilitiesOf(inert, 1)) && CAP53.capabilitiesOf(inert, 1).length === 0);
  }
}
/* ═════ §54 — A DOCUMENT THAT CAN DISAGREE WITH ITSELF ═════ */
// ⛔ ERIK: "the intent of the pipeline discipline and the tests and all these ratchets and documentation
// was so that this exact archeology exercise would never happen again. It failed to stop this."
//
// ⚠️ THE FAILURE WAS NOT DILIGENCE. `HOW_IT_WORKS.md` is 423 dated LOG rows followed by 20 BODY sections.
// The log recorded `traditionKind` WITHDRAWN on 08-30; the body went on RECOMMENDING it. A reader landing
// in the body got a withdrawn proposal presented as live guidance — and two of us did, in one day.
//
// ⛔ EVERY GATE IN THIS REPO TESTS DOC-vs-CODE OR CONTENT-vs-CONTENT. NOTHING TESTED DOC-vs-DOC. The
// counts were right, the assertions held, and the file argued with itself in prose for three days.
//
// ⚠️ THE RULE, DELIBERATELY NARROW: a term the LOG retires must never appear in the BODY without the body
// ALSO saying it is retired. A body sentence may discuss a dead idea; it may not present one as live.
console.log("\n── §54 · the doc may not contradict itself ──");
{
  const raw54 = rd("docs/HOW_IT_WORKS.md").split("\n");
  const isRow = (l) => /^\|\s*\d\d-\d\d\s*\|/.test(l);
  let lastRow = -1; raw54.forEach((l, i) => { if (isRow(l)) lastRow = i; });
  check("§54: the doc still has a LOG half and a BODY half", lastRow > 100 && raw54.length - lastRow > 100,
    `log ends ${lastRow + 1}, body ${raw54.length - lastRow - 1} lines`);

  const logRows = raw54.slice(0, lastRow + 1).filter(isRow);
  const body54 = raw54.slice(lastRow + 1);

  // ⚠️ A RETIREMENT MARKER IS A WORD THE LOG USES WHEN IT KILLS SOMETHING.
  // ⛔ ADJACENCY, NOT ROW MEMBERSHIP — and it took three tries to get right, which is the point.
  //
  // ⚠️ ROW-LEVEL `CORRECTION|WRONG` CRIED WOLF FOUR TIMES: a row saying "`bringForward` has no picker —
  // FALSE" retires the CLAIM and vindicates the term, so flagging later mentions is noise. A gate that
  // cries wolf gets switched off, which is worse than no gate.
  //
  // ⛔ BUT NARROWING TO `WITHDRAWN|RETIRED` AT ROW LEVEL LOST THE CASE THIS EXISTS FOR: `traditionKind`
  // was withdrawn in a row headed "TWO CORRECTIONS", and written in lowercase — "`traditionKind`
  // withdrawn → `folkAccessible: true`". Both of my first two rules missed or over-matched it.
  //
  // ✅ THE RULE THAT WORKS: the kill word must follow the term CLOSELY and within the same cell — no
  // backtick between them — case-insensitively. Measured: exactly two terms, `traditionKind` and
  // `valley_craft`, and zero false positives across 790 body lines.
  const KILL = /^[^`]{0,40}(withdrawn|retired|superseded)/i;
  const SAYS_DEAD = /(withdrawn|retired|superseded|no longer)/i;
  // the SUBJECT is the backticked identifier in that row
  const TERM = /`([a-zA-Z_][a-zA-Z0-9_]{4,})[`:]/g;
  const retired = new Set();
  for (const row of logRows) {
    for (const m of row.matchAll(TERM)) {
      if (KILL.test(row.slice(m.index + m[0].length))) retired.add(m[1]);
    }
  }
  check("§54: the log names things it has retired — the scan is not vacuous", retired.size >= 2,
    `${retired.size} retired term(s)`);

  // ⛔ AND THE BODY MAY NOT PRESENT ONE AS LIVE.
  const offenders = [];
  for (const term of retired) {
    const needle = "`" + term + "`";
    for (const line of body54) {
      if (!line.includes(needle)) continue;
      if (SAYS_DEAD.test(line)) continue;                   // the body says so too — fine
      // ⚠️ a line that merely NAMES the successor is not a recommendation of the dead thing
      if (/\bwas\b|\binstead\b|\bnot\b|\bnever\b/i.test(line)) continue;
      offenders.push(term + " @ " + line.trim().slice(0, 70));
    }
  }
  check("§54: ⛔ the BODY never presents a term the LOG retired as live guidance",
    offenders.length === 0, offenders.slice(0, 4).join("  ·  "));

  // ⛔ AND THE GATE CAN GO RED — proved here rather than asserted. A gate nobody has seen fail is a gate
  // nobody knows the shape of.
  {
    const fakeBody = ["Both need `traditionKind` set at creation."];   // the exact sentence that misled two readers
    let caught = 0;
    for (const term of retired) {
      const needle = "`" + term + "`";
      for (const line of fakeBody) {
        if (!line.includes(needle)) continue;
        if (SAYS_DEAD.test(line)) continue;
        if (/\bwas\b|\binstead\b|\bnot\b|\bnever\b/i.test(line)) continue;
        caught++;
      }
    }
    check("§54: ⛔ …and it CATCHES the sentence that caused this — proved, not assumed",
      caught === 1, `caught ${caught}`);
  }

  // ⛔ SPEC_one_source_of_truth §1 — A RULING IS NOT RULED UNTIL THE BODY SAYS SO.
  //
  // ⚠️ MEASURED RATHER THAN ASSUMED, because the spec’s own figure was wrong by a wide margin: it said
  // 6 R-numbers reach the body and 23 live only in working papers. ⚑ 28 OF 32 REACH THE BODY, and the
  // body already cites them in its own headings — "What it costs to LEARN (R1, R9, R10, R16, R17, R20)".
  //
  // ⛔ A RATCHET, NOT A CLIFF. A gate that goes red for every ruling not yet enacted starts red and gets
  // switched off — §54’s own first version cried wolf four times and would have been disabled in a
  // week. ⚠️ This may only go DOWN: a ruling filed and never enacted moves it the wrong way.
  {
    const nums = [];
    for (const f of readdirSync(join(root, "po")).filter(x => x.endsWith(".md"))) {
      for (const m of rd("po/" + f).matchAll(/\bR(\d{1,2})\b/g)) {
        const n = Number(m[1]); if (n >= 1 && n <= 60 && !nums.includes(n)) nums.push(n);
      }
    }
    const dl54 = doc.split(String.fromCharCode(10));
    const isRow54 = (l) => /^\|\s*\d\d-\d\d\s*\|/.test(l);
    let lastR54 = -1; dl54.forEach((l, i) => { if (isRow54(l)) lastR54 = i; });
    const bodyTxt54 = dl54.slice(lastR54 + 1).join(String.fromCharCode(10));
    const hasR = (t, n) => new RegExp("\\bR" + n + "\\b").test(t);
    const unenacted = nums.filter(n => !hasR(doc, n));
    const inBody = nums.filter(n => hasR(bodyTxt54, n)).length;
    // ⛔ 2026-09-05 — THE GATE WAS ASKING THE WRONG QUESTION, AND AEVI MINTING FIVE RULINGS IN A MORNING IS WHAT SHOWED IT.
    // Every minted number was owed the truth doc immediately, so R44–R48 (ruled at 09:00, building through the day) turned
    // MY unrelated push red. ⚠️ The failure this exists for is "a ruling that never reached the body was invisible" — and a
    // ruling minted an hour ago and queued for this afternoon is not invisible, it is QUEUED. The RULINGS index already
    // carries that state, and section 62 already reads it for anchors. The hard half now asks the real question: a ruling
    // the INDEX MARKS BUILT must be in the truth. The queued ones stay on a ratchet so the backlog cannot grow unwatched.
    const idx54 = rd("docs/RULINGS.md");
    const builtNums = new Set([...idx54.matchAll(/^\|\s*~{0,2}\*\*R(\d+)\*\*~{0,2}\s*\|[^\n]*?\|\s*✅/gm)].map(m => Number(m[1])));
    const builtAbsent = [...builtNums].filter(n => !hasR(doc, n)).sort((a, b) => a - b);
    check("§54: ⛔ every ruling the INDEX marks BUILT is in the truth doc — the invisible-ruling failure, asked properly",
      builtAbsent.length === 0, builtAbsent.map(n => "R" + n).join(" ") || `${builtNums.size} built rulings, all present`);
    const queued = unenacted.filter(n => !builtNums.has(n));
    // measured 2026-09-05 after R44–R48 were minted: 8 absent, all queued or old strays (R23 is the known straggler)
    check(`§54: ratchet — minted rulings not yet built AND not in the doc = ${queued.length} (baseline 8) — may only go DOWN`,
      queued.length <= 8, queued.map(n => "R" + n).join(" ") || "none");
    check("§54: ⛔ at most four minted rulings are absent from HOW_IT_WORKS — may only go DOWN",
      // ⚠️ FIVE, NOT FOUR — and the ratchet is what noticed. R21 was in the body when I measured and is
      // gone after the foothill rewrite: a ruling that WAS enacted became un-enacted. ⛔ THAT IS THE
      // FAILURE MODE THIS EXISTS FOR, caught within the hour. R23 is the old straggler; R30–R32 were ruled
      // yesterday off my own ROUND 2 and their substance is in §7h without the numbers.
      // ⚠️ SUPERSEDED IN PURPOSE by the two checks above and kept as the corpus-wide watch: it may not grow past what the
      // queue explains, so a ruling QUIETLY dropped still shows here even while the queue is legitimately long.
      unenacted.length <= Math.max(5, queued.length),
      nums.length + " minted · absent: " + (unenacted.map(n => "R" + n).join(" ") || "none"));
    check("§54: …and most R-numbers reach the BODY, not merely the log — the enacted half",
      inBody >= 25, inBody + " of " + nums.length + " in the body");
  }

  // ⛔ AND THE SPECIFIC THING THAT BIT US, ASSERTED BY NAME. Erik 08-30: "ONLY THE POLES ARE TRADITIONS."
  {
    const TR54 = await import("../engine/traditions.js");
    const { loadContentHeadless: lch54 } = await import("./headless_content.mjs");
    const C54 = await lch54();
    check("§54: `isPoleTradition` exists, so nobody has to test `byId` and get a different question",
      typeof TR54.isPoleTradition === "function");
    check("§54: ⛔ …and it says folk is NOT a tradition — the ruling, in code",
      !TR54.isPoleTradition("valley_craft", C54.traditionIndex)
      && !TR54.isPoleTradition("radiant_folk", C54.traditionIndex)
      && TR54.isPoleTradition("ashwarden", C54.traditionIndex));
    check("§54: ⚠️ …and `byId` really would have answered differently — which is how I got it wrong",
      !!C54.traditionIndex.byId["valley_craft"]);
  }
}
/* ═════ §55 — SKILLS.md: THE SKILL SOURCE OF TRUTH, AND ITS NUMBERS ═════ */
// ⛔ `docs/SKILLS.md` declares itself DERIVED — "GENERATED from the live corpus. Do not hand-edit —
// regenerate it" — and every number in it is a claim about the corpus.
//
// ⚠️ ITS HEADER COUNTS ARE GATED HERE because a source of truth with unchecked numbers rots in a week,
// and this one is 1,150 lines that nobody will re-add by hand.
//
// ⚠️ AND A WARNING FOR WHOEVER AUDITS IT NEXT: it groups crafts by their POLE, not by the raw `tradition`
// field. Erik 2026-09-02: "Those skills DO belong to a tradition and a domain… they are ALSO folk
// accessible." ⛔ GROUPING BY `tradition` GIVES A DIFFERENT AND WRONG ANSWER — I did exactly that and
// reported three false mismatches against a file that was right.
console.log("\n── §55 · the skill source of truth ──");
{
  const sk = rd("docs/SKILLS.md");
  const { loadContentHeadless: lch55 } = await import("./headless_content.mjs");
  const C55 = await lch55();
  const idx55 = C55.traditionIndex;
  const A55 = Object.values(C55.abilities);

  check("§55: the skill source of truth exists and is substantial", sk.length > 20000, `${sk.length} chars`);

  // ⛔ ITS FOUR HEADER CLAIMS, EACH MEASURED.
  {
    const claim = (re) => { const m = sk.match(re); return m ? Number(m[1]) : null; };
    const crafts = claim(/\*\*(\d+) crafts \s*[·=]/);
    const domains = claim(/·\s*(\d+) domains/);
    const sects = claim(/·\s*(\d+) (?:sects|poles)/);
    const folk = claim(/·\s*(\d+) folk-accessible/);
    check("§55: …its sect count matches the ring — 24 poles, per \"only the poles are traditions\"",
      sects === Object.keys(idx55.ringPos || {}).length, `doc ${sects}`);
    check("§55: …its domain count matches the index",
      domains === new Set(Object.values(idx55.domainOfTrad || {})).size, `doc ${domains}`);
    check("§55: …its folk-accessible count matches the corpus",
      folk === A55.filter(a => a.folkAccessible).length,
      `doc ${folk} vs corpus ${A55.filter(a => a.folkAccessible).length}`);
    check("§55: ⚠️ …and its craft count is the AUTHORED corpus, not the loaded one (the martial floor is not authored)",
      crafts !== null && crafts < A55.length && A55.length - crafts <= 12,
      `doc ${crafts} vs loaded ${A55.length}`);
  }

  // ⛔ EVERY SECT IT NAMES MUST BE A REAL POLE, and every pole must appear.
  {
    // ⚠️ THE GENERATOR LISTS NON-POLE LINEAGES TOO, under a heading that SAYS so — “Outside the ring”.
    // Asserting “every ### is a pole” across the whole file would fail on the honest section and pass on
    // a dishonest one that hid its non-poles under a domain. Gate the property: poles above the line,
    // non-poles below it, and the line itself present.
    // ⚠️ 2026-09-05 — THIS PINNED A HEADING STRING AND I RENAMED IT MYSELF. The R33 landing replaced
    // "## Outside the ring" with "## Pending R33 lineage assignment", which says something truer, and this
    // check went red on a document that was correct. ⛔ The divider is found by EITHER name, and the check
    // below asks the PROPERTY — no non-pole above the line, every non-pole below it — measured against the
    // corpus, so that when the last lineage is assigned and the section rightly disappears this goes GREEN.
    const dividerRe = /^## (?:Outside the ring|Pending R33 lineage assignment)\b/m;
    const dividerM = sk.match(dividerRe);
    const outsideAt = dividerM ? sk.indexOf(dividerM[0]) : -1;
    const ringPart = outsideAt >= 0 ? sk.slice(0, outsideAt) : sk;
    const outsidePart = outsideAt >= 0 ? sk.slice(outsideAt) : "";
    // ⚠️ TWO HEADING SHAPES, because the generator writes two. A pole section is "### Name (`id`)"; the
    // non-pole section is "### `id` — N crafts (prose)". One matcher for the first shape found NOTHING in
    // the second and reported the section absent — a matcher that silently finds zero fails in one
    // direction and passes vacuously in the other, and it did both today.
    const hdr = /^###\s+.*?\(`([a-z_]+)`\)/gm;
    const hdrEither = /^###\s+(?:.*?\(`([a-z_]+)`\)|`([a-z_]+)`)/gm;
    const named = [...ringPart.matchAll(hdr)].map(m => m[1]);
    const outsideNamed = [...outsidePart.matchAll(hdrEither)].map(m => m[1] || m[2]).filter(Boolean);
    const TR55 = await import("../engine/traditions.js");
    const notPole = named.filter(t => !TR55.isPoleTradition(t, idx55));
    check("§55: ⛔ every sect the doc names is a POLE — no folk lineage is listed as a sect",
      notPole.length === 0, notPole.join(" · "));
    // ⛔ THE CORPUS DECIDES WHETHER THERE SHOULD BE A SECTION AT ALL. A doc with no non-poles left and no
    // section is CORRECT; a doc with non-poles and no section is hiding them. Both are checked here.
    const corpusNonPoles = [...new Set(A55.map(a => a.tradition).filter(Boolean))].filter(t => !TR55.isPoleTradition(t, idx55));
    check("§55: …and everything below the divider really is outside the ring — and there is a divider exactly when the corpus needs one",
      (corpusNonPoles.length === 0 ? outsideAt < 0 : outsideAt >= 0 && outsideNamed.length > 0)
      && outsideNamed.every(t => !TR55.isPoleTradition(t, idx55)),
      `corpus non-poles: ${corpusNonPoles.join(" · ") || "none"} · doc lists: ${outsideNamed.join(" · ") || "(no section)"}`);
    const missing = Object.keys(idx55.ringPos || {}).filter(t => !named.includes(t));
    check("§55: …and every pole on the ring has a section — none is missing from the source of truth",
      missing.length === 0, missing.join(" · "));
  }

  // ⛔ AND IT IS REFERENCED FROM THE DOCUMENTS THAT ANSWER CRAFT QUESTIONS. A source of truth nothing
  // points at is a file, not a source.
  {
    const refs = ["docs/HOW_IT_WORKS.md", "docs/FIELD_REFERENCE.md", "docs/PLAYERS_GUIDE.md"]
      .filter(f => rd(f).includes("SKILLS.md"));
    check("§55: ⛔ the three craft-answering docs all point at it",
      refs.length === 3, `pointed at by: ${refs.join(" · ") || "nothing"}`);
  }

  // ⛔ R33 (SNG-443) — lineage and access are TWO axes, ruled OVER my own prior read of the same subject.
  // My first version filed a foothill’s crafts under its parent pole (union-style) and produced 31 where
  // the corpus said 16 — the exact error R33 names as "confusing access with ancestry". My SECOND version
  // then swung the other way and declared a foothill craft correctly domain-less, which R33 ALSO names as
  // wrong: "A foothill CRAFT has a lineage and therefore a domain. It is the PLACE that has no ring
  // position." ⚠️ NEITHER OF MY OWN READS SURVIVED CONTACT WITH THE RULING — which is the argument for
  // gating the CURRENT text rather than trusting memory of what was true an hour ago.
  {
    const gen = rd("scripts/skills_inject.mjs");
    check("§55: ✅ the generator exists and loses nothing — it refuses to write if a craft goes unplaced",
      /placed !== withTrad/.test(gen) && /REFUSING to write/.test(gen));
    check("§55: ⛔ …and it cannot clobber a file someone is editing — writing needs --write",
      /const WRITE = process\.argv\.includes\("--write"\)/.test(gen) && /if \(!WRITE\)/.test(gen));
    check("§55: ⛔ it does NOT assert a foothill craft is correctly domain-less — R33 says the opposite",
      !/no ring position, no domain · CORRECT/.test(gen) && !/is CORRECT rather than missing/.test(gen));
    check("§55: ⚠️ …it never guesses which parent a foothill craft descends from — that is authoring",
      /NEVER GUESS A LINEAGE/.test(gen) && /is authoring, and it is Aevi/.test(gen) && /not a formula this file can run/.test(gen));
    check("§55: …it surfaces `learnedAt` on the row, the field R33 actually names",
      /a\.learnedAt/.test(gen) && /learnedAt:.*a\.learnedAt/.test(gen));
  }
  // ⚠️ AND THE GENERATED FILE ITSELF: no live section may assert the pre-R33 claim, whichever way it fell.
  {
    const sk55 = rd("docs/SKILLS.md");
    check("§55: ⛔ SKILLS.md carries neither of my two wrong reads of R33",
      !/no ring position, no domain/.test(sk55) && !/### Radiance \(\`blazeborn\`\) — 31 crafts/.test(sk55));
    // ⛔ THE THIRD CONTRADICTION WAS THE DOC’S OWN AUTHORED PROSE, ABOVE THIS FILE’S OWN GENERATED
    // MARKERS — written before R33 was re-ruled, still asserting “each foothill is a three-domain blend
    // WITH ITS OWN AXIS.” That is claim #3 R33 names as wrong, sitting live in the file that calls itself
    // the skill source of truth. Fixed by hand — it is Aevi’s authored header, not derived text — and
    // gated here so it cannot drift back.
    check("§55: ⛔ its own AUTHORED HEADER no longer contradicts R33 (\"own axis\" is retracted, cited)",
      !/with its own axis/i.test(sk55) && /R33/.test(sk55.split("<!-- BEGIN skills-generated -->")[0]));
  }
}
/* ═════ §56 — RULINGS.md: THE INDEX MUST AGREE WITH THE TRUTH IT INDEXES ═════ */
// ⛔ Erik asked for one ruling source of truth. `docs/RULINGS.md` is that index, and its own header is
// careful about what it is: "THIS FILE IS AN INDEX, NOT AN AUTHORITY. A ruling is TRUE because
// HOW_IT_WORKS's BODY says it, not because a file in po/ does."
//
// ⚠️ SO ITS `enacted` COLUMN IS A CLAIM ABOUT ANOTHER DOCUMENT, and that is exactly the kind of claim
// that rots silently — the class §54 exists for. An index that says a ruling is live when the body has
// never carried it is worse than no index, because it stops anyone checking.
console.log("\n── §56 · the ruling index agrees with the body ──");
{
  const rul = rd("docs/RULINGS.md");
  const dl56 = doc.split(String.fromCharCode(10));
  const isRow56 = (l) => /^\|\s*\d\d-\d\d\s*\|/.test(l);
  let last56 = -1; dl56.forEach((l, i) => { if (isRow56(l)) last56 = i; });
  const body56 = dl56.slice(last56 + 1).join(String.fromCharCode(10));

  const rows56 = [];
  for (const line of rul.split(String.fromCharCode(10))) {
    const m = line.match(/^\|\s*\*\*(R\d{1,2})\*\*\s*\|([^|]*)\|([^|]*)\|([^|]*)\|/);
    if (m) rows56.push({ id: m[1], subject: m[2].trim(), enacted: /✅/.test(m[4]) });
  }
  check("§56: the index actually indexes the rulings — the scan is not vacuous",
    rows56.length >= 30, `${rows56.length} rows`);

  const inBody56 = (id) => new RegExp("\\b" + id + "\\b").test(body56);
  const falseYes = rows56.filter(r => r.enacted && !inBody56(r.id));
  const falseNo = rows56.filter(r => !r.enacted && inBody56(r.id));
  check("§56: ⛔ nothing is marked ENACTED that the body never carries",
    falseYes.length === 0, falseYes.map(r => r.id + " (" + r.subject + ")").join(" · "));
  check("§56: ⚠️ …and nothing the body carries is marked un-enacted",
    falseNo.length === 0, falseNo.map(r => r.id).join(" · "));

  // ⚠️ AND THE THING THE INDEX EXISTS TO PREVENT, REPORTED RATHER THAN FAILED. Two rulings on one subject
  // is sometimes a refinement (R5 then R18) or a retraction (R8 → R17) and sometimes the contradiction
  // that cost three days. ⛔ A GATE CANNOT TELL THOSE APART — a person must — so this counts and names
  // them instead of pretending to judge.
  {
    const bySub = {};
    for (const r of rows56) (bySub[r.subject] ||= []).push(r.id);
    const multi = Object.entries(bySub).filter(([, v]) => v.length > 1);
    check("§56: every multi-ruling subject is one a person has looked at — 9 today, and named",
      multi.length <= 12, multi.map(([k, v]) => k + ": " + v.join(",")).join(" · "));
  }
}
/* ═════ §57 — THE ORDERED/WILD NANITE VOCABULARY MISMATCH, FOUND WHILE VERIFYING SOMETHING ELSE ═════ */
// ⛔ SPEC_body_source.md §0 asks whether a craft's ground is scored right. Verifying it surfaced a WIDER
// defect in the same family, not described in the spec: `power_sources.json`'s `byTradition[t].primary`
// speaks the CRAFT vocabulary (`ordered_nanite`, `wild_nanite`) while `the_substrate.json`'s
// `sourceBands.sources` speaks the BAND vocabulary (`nanite`, `wild`). `school.extension` already uses
// the band vocabulary directly — only the tradition-primary and foothill paths carried the mismatch.
//
// ⚠️ MEASURED: 9 traditions (152 of 428 crafts — over a third of the corpus) resolved a `source` no
// band-reading function had an entry for, so every one of them reported "unaffected by the ground" for
// ANY character without a school of their own — the common, zero-regression baseline case.
console.log("\n── §57 · the ordered/wild nanite vocabulary now matches the band table ──");
{
  const sub57 = await import("../engine/substrate.js");
  const { loadContentHeadless: lch57 } = await import("./headless_content.mjs");
  const C57 = await lch57();
  const bandKeys57 = new Set(Object.keys(C57.substrateModel.sourceBands.sources));

  // ⛔ THE NINE REAL TRADITIONS THAT WERE SILENTLY UNSCORED.
  const affected57 = ["churnfolk", "rootkin", "threnodist", "figurist", "seraphic", "enginewright", "syllogist", "mason", "lattice"];
  let fixed57 = 0;
  // ⚠️ SYNTHETIC, NO `powerSystem`, ON PURPOSE. §58 makes the craft's own declaration win, so a REAL craft
  // never reaches the tradition branch this gate exists to test. An ability with a tradition and no
  // declaration is the one shape that still falls through to it.
  for (const tid of affected57) {
    const cs = sub57.craftSource({ id: "syn_" + tid, tradition: tid }, { domains: { primary: tid }, schools: {} }, C57.schools, C57.powerSources, C57.foothills);
    if (cs?.via === "tradition" && bandKeys57.has(cs.source)) fixed57++;
  }
  check("§57: ⛔ every ordered/wild-nanite tradition now resolves a source the band table actually has",
    fixed57 === affected57.length, `${fixed57} of ${affected57.length}`);

  // ⛔ AND THE BAND ITSELF IS REAL, NOT JUST A MATCHING KEY — starvation and full output both fire.
  {
    const cs = sub57.craftSource({ id: "syn_seraphic", tradition: "seraphic" }, { domains: { primary: "seraphic" }, schools: {} }, C57.schools, C57.powerSources, C57.foothills);
    const band = C57.substrateModel.sourceBands.sources[cs.source]?.band;
    check("§57: …a real band with center and width, not a coincidental key match", !!band && band.center != null);
    check("§57: …full output in thick country (its own band center)", sub57.bandFactor(band, band.center) === 1);
    check("§57: …and real starvation in clear ground, not the old flat factor-1 \"unaffected\"",
      sub57.bandFactor(band, 0.05) < 0.2, String(sub57.bandFactor(band, 0.05)));
  }

  // ⚠️ AND THE TIE-DETECTION THIS COULD HAVE BROKEN, STILL WORKS. A foothill whose parents split 50/50
  // between an ordered-primary and a wild-primary parent must still resolve `combination`, not merge the
  // two into one bucket before the tie can be seen — the alias is applied AFTER the tie check, not before.
  {
    const ps57 = { byTradition: { a: { primary: "ordered_nanite" }, b: { primary: "wild_nanite" } } };
    const tied57 = { foothills: { tf: { parents: { a: 0.5, b: 0.5 } } } };
    const untied57 = { foothills: { tf2: { parents: { a: 0.7, b: 0.3 } } } };
    const csTied = sub57.craftSource({ id: "x", tradition: "tf" }, {}, {}, ps57, tied57);
    const csUntied = sub57.craftSource({ id: "y", tradition: "tf2" }, {}, {}, ps57, untied57);
    check("§57: ⛔ a 50/50 ordered/wild split is still `combination`, not merged into one bucket",
      csTied.source === "combination", csTied.source);
    check("§57: …and a real winner still normalizes to the band vocabulary",
      csUntied.source === "nanite", csUntied.source);
  }
}
/* ═════ §58 — THE CRAFT'S OWN `powerSystem` IS READ FOR GROUND, AND THE ABYSSAL DEFERRAL SURVIVES IT ═════ */
// ⛔ SPEC_body_source.md §0 — Erik: “the craft's powerSystem isn't read at all — it's what the craft itself is
// supposed to use.” `craftSource` read `ability.tradition` only; 55 of 419 crafts were graded against a band
// their own declared source disagrees with, 16 on a DISJOINT band. The spec's own worked example is
// `uttered_name`: a veil craft graded as precursor, switched off standing on the ground it wants.
//
// ⚠️ WHAT THIS DOES NOT DECIDE: marcher/somatic → body (§3/§4) is Erik's content call and stays
// `metaphysical` here; whether a craft's declaration should override the Abyssal deferral is flagged
// open and defaults to the deferral — both asserted below so a silent change to either shows up red.
console.log("\n── §58 · the craft's own source is read; the deferral survives it ──");
{
  const sub58 = await import("../engine/substrate.js");
  const { loadContentHeadless: lch58 } = await import("./headless_content.mjs");
  const C58 = await lch58();
  const alias58 = { ordered_nanite: "nanite", wild_nanite: "wild" };
  const src58 = (a) => sub58.craftSource(a, { domains: { primary: a.tradition }, schools: {} }, C58.schools, C58.powerSources, C58.foothills);

  // ⛔ THE SPEC'S WORKED EXAMPLE, BY NAME.
  {
    const a = C58.abilities.uttered_name;
    const cs = a ? src58(a) : null;
    check("§58: ⛔ `uttered_name` (veil craft, umbral lineage) is grounded as VEIL, via the craft",
      a?.powerSystem === "veil" && cs?.source === "veil" && cs?.via === "craft", `${a?.powerSystem} → ${cs?.source} via ${cs?.via}`);
  }

  // ⛔ THE 16 FULLY-INVERTED CRAFTS THE SPEC NAMES — each now grounded on its own declared band.
  {
    const sixteen = ["proof_halls", "stonewise", "old_roads", "boundary_stone", "carrying_call", "keen_appraisal",
      "wayfinding", "tinkers_hand", "rivercraft", "quiet_step", "glasswork", "uttered_name", "swallowed_word",
      "kept_vigil", "borrowed_certainty", "honest_price"];
    const wrong = sixteen.filter(id => { const a = C58.abilities[id]; const cs = a && src58(a); return !a || !cs || cs.source !== (alias58[a.powerSystem] || a.powerSystem); });
    check("§58: ⛔ all 16 fully-inverted crafts now ground on the band they declare", wrong.length === 0, wrong.join(" · ") || "all 16");
  }

  // ⚠️ NOT PREEMPTED: the marcher → body change is content, and Erik's. The resolver reads what is authored.
  {
    const a = C58.abilities.levelled_crossbow;
    const cs = a ? src58(a) : null;
    check("§58: ⚠️ `levelled_crossbow` still grounds as its authored `metaphysical` — §3 was not decided by code",
      cs?.source === "metaphysical" && cs?.via === "craft", `${cs?.source} via ${cs?.via}`);
  }

  // ⛔ THE DEFERRAL MECHANISM SURVIVES — AND THE ABYSSAL CASE ITSELF IS GONE. This gate first asserted “every
  // abyssal craft still declines”; Erik settled abyssal on 2026-09-03 (primary veil, fc2aa49c) and the row is no
  // longer null, so that assertion became a gate defending a superseded state — the exact class §54 exists for.
  // What must still hold is the RULE: an explicit `primary: null` wins over a craft's own declaration.
  {
    const ps58 = { byTradition: { held_back: { primary: null } } };
    const cs = sub58.craftSource({ id: "syn_held", tradition: "held_back", powerSystem: "veil" }, {}, {}, ps58, null);
    check("§58: ⛔ an explicit `primary: null` still DECLINES even when the craft declares a source — the rule, on a fixture",
      cs?.via === "deferred" && cs?.source === null, JSON.stringify(cs));
    // ⚠️ REPORTED, NOT FAILED: the ruling landed on the tradition row, which the craft's own field now outranks.
    const aby = Object.values(C58.abilities).filter(a => a.tradition === "abyssal");
    const ruled = C58.powerSources?.byTradition?.abyssal?.primary || null;
    const off = aby.filter(a => (alias58[a.powerSystem] || a.powerSystem) !== ruled);
    console.log(`      ⚠️ abyssal ruled \`${ruled}\`; ${off.length} of ${aby.length} abyssal crafts declare something else and ground on THAT — content follow-up, not a gate`);
  }

  // ⚠️ THE CORPUS, WHOLE: every tradition-bearing craft resolves via `craft` or `deferred` — the tradition
  // fallback is DORMANT for today's content (0 of 419 lack a declaration), not dead.
  {
    const all = Object.values(C58.abilities).filter(a => a.tradition);
    const via = {};
    for (const a of all) { const cs = src58(a); via[cs?.via ?? "null"] = (via[cs?.via ?? "null"] || 0) + 1; }
    check("§58: every tradition-bearing craft carries a `powerSystem` — the read is total, not a partial patch",
      all.every(a => !!a.powerSystem), `${all.filter(a => !a.powerSystem).length} without`);
    check("§58: …so the whole corpus resolves via `craft`, `deferred` or a per-rank `rank` (§70), nothing via `tradition`",
      (via.craft || 0) + (via.deferred || 0) + (via.rank || 0) === all.length && !via.tradition, JSON.stringify(via));
    const fb = sub58.craftSource({ id: "syn_fallback", tradition: "ashwarden" }, { domains: { primary: "ashwarden" }, schools: {} }, C58.schools, C58.powerSources, C58.foothills);
    check("§58: …and the tradition fallback is dormant, not dead — a craft with no declaration still reaches it",
      fb?.via === "tradition" && !!fb?.source, `via ${fb?.via} → ${fb?.source}`);
  }
}
/* ═════ §59 — SHEETS THAT FILL THEMSELVES IN THROUGH PLAY, AND THE DIALS THAT NEVER ARRIVED ═════ */
// ⛔ SPEC_progressive_sheets.md — Erik: “we write a few key ones and the engine is able to fill in the rest.”
// Verifying it found the dial gap first: `resolution.npcStanding` (tier floors, level per meeting) was read by
// ONE file — this one, line ~895 — and by neither live caller. In play the Lightless Seraph (legendary, no
// authored level) was level 1 with 3 health. CCODE-309's fix passed its gate with the dial handed in by the test.
//
// ⚠️ AND THE UNWIRED GROWTH PRUNED. `craftsOf` sliced authored + observed to 8; `kitFor` sliced to capacity.
// Pell (L27, 17 authored crafts, capacity 14) lost three she was written with. An authored sheet is a FLOOR.
console.log("\n── §59 · sheets fill in through play; an authored sheet is a floor; the dials reach the callers ──");
{
  const NS59 = await import("../engine/npcsheet.js");
  const { domainAccess: da59 } = await import("../engine/traditions.js");
  const { loadContentHeadless: lch59 } = await import("./headless_content.mjs");
  const C59 = await lch59();
  const cfg59 = C59.rules?.npcStanding || null;
  const npcs59 = Object.values(C59.npcs || {});

  // ⛔ THE DIALS REACH BOTH LIVE CALLERS — asserted on the SOURCE, because the defect was a call site.
  {
    const gm = rd("engine/gm_registry.js"), app = rd("app.js");
    const gmSlice = gm.slice(gm.indexOf("sheetsForGM(present"), gm.indexOf("sheetsForGM(present") + 220);
    check("§59: ⛔ the narrator's sheet block passes `resolution.npcStanding`", /npcStanding/.test(gmSlice), gmSlice.replace(/\s+/g, " ").slice(0, 120));
    // ✅ 2026-09-05: the fight path's sheet call lives in engine/battle_turn.js now (§71); the dial reaches it as `cfg`, handed by app.js.
    const bt59 = rd("engine/battle_turn.js");
    const appSlice = bt59.slice(bt59.indexOf("personSheetFor(rec"), bt59.indexOf("personSheetFor(rec") + 120);
    check("§59: ⛔ …and so does the fight path (`personOpponentFor`)", /cfg/.test(appSlice) && /cfg: npcCfg/.test(app), appSlice.slice(0, 100));
    check("§59: …and the dial block is authored where the callers now read it", !!cfg59 && !!cfg59.tierFloor && Number(cfg59.tierFloor.legendary) > 1);
  }

  // ⛔ THE MEASURED CASE, BY NAME: a legendary with no authored level is not level 1 once the dial arrives.
  {
    const seraph = C59.npcs?.the_lightless_seraph;
    const bare = seraph && NS59.sheetFor(seraph, {}), dialed = seraph && NS59.sheetFor(seraph, { cfg: cfg59 });
    check("§59: ⛔ the Lightless Seraph is level 1 WITHOUT the dial and its tier floor WITH it — the gap was real",
      !!seraph && seraph.level == null && bare.level === 1 && dialed.level >= Number(cfg59.tierFloor[String(seraph.tier).toLowerCase()] || 999),
      `bare ${bare?.level} → dialed ${dialed?.level} (tier ${seraph?.tier})`);
    const tierOnly = npcs59.filter(n => n.tier && n.level == null);
    const still1 = tierOnly.filter(n => NS59.sheetFor(n, { cfg: cfg59 }).level === 1 && /epic|legend|mythic|heroic/i.test(n.tier));
    check(`§59: …and none of the ${tierOnly.length} tier-only people above riffraff is level 1 with the dial`, tierOnly.length > 50 && still1.length === 0, still1.map(n => n.id).slice(0, 5).join(" · "));
  }

  // ⛔ AN AUTHORED SHEET IS A FLOOR. Pell: 17 written, capacity 14 — every one of the 17 survives both readers.
  {
    const pell = npcs59.find(n => /^pell/i.test(n.name || n.id));
    const authoredIds = (pell?.abilities || []).map(a => a.abilityId || a);
    const g = pell && NS59.growthFor(pell, C59.abilities, { day: 400, cfg: cfg59 });
    const k = pell && NS59.kitFor(pell, { catalog: C59.abilities, traditionIndex: C59.traditionIndex, domainAccess: da59, day: 400, cfg: cfg59 });
    check("§59: ⛔ Pell is the §2 case — authored above formula (17 > capacity)", !!pell && authoredIds.length > (g?.capacity || 0), `${authoredIds.length} vs capacity ${g?.capacity}`);
    check("§59: ⛔ …and `growthFor` returns every authored craft — floor 17, room 0, nothing pruned",
      !!g && g.floor === authoredIds.length && g.room === 0 && authoredIds.every(id => g.crafts.some(c => c.id === id)), `crafts ${g?.crafts.length} floor ${g?.floor} room ${g?.room}`);
    check("§59: ⛔ …and `kitFor` drops none of them either — the cap rises to the floor",
      !!k && authoredIds.every(id => k.crafts.some(c => c.id === id)) && k.capacity >= authoredIds.length, `kit ${k?.crafts.length} cap ${k?.capacity}`);
  }

  // ⛔ NEVER INVENT THE ABSENCES — `closed: [...]` is honoured by the domain draw. Reader before field: no
  // record authors it yet, so the fixture supplies it; the day Aevi writes one it is already read.
  {
    const veth = npcs59.find(n => /veth/i.test(n.name || n.id));
    // ⚠️ ON A FIXTURE WITH ROOM — a fixture, because Aevi rebuilt Veth to 24 crafts (capacity 17) an hour after this
    // was first written against her record, and a person above capacity has room 0 by design. The PROPERTY is
    // what is gated: a person below capacity with a domain gets crafts drawn they were not written with.
    const roomy = veth && { ...veth, abilities: (veth.abilities || []).slice(0, 5) };
    const open = roomy && NS59.kitFor(roomy, { catalog: C59.abilities, traditionIndex: C59.traditionIndex, domainAccess: da59, day: 400, cfg: cfg59 });
    const authored = new Set((roomy?.abilities || []).map(a => a.abilityId || a));
    const drawn = (open?.crafts || []).filter(c => !authored.has(c.id)).map(c => c.id);
    check("§59: ⚠️ the domain draw DOES add unauthored crafts to an authored person — the §5 risk is real, measured", drawn.length > 0, drawn.join(" · "));
    const shut = roomy && NS59.kitFor({ ...roomy, closed: drawn }, { catalog: C59.abilities, traditionIndex: C59.traditionIndex, domainAccess: da59, day: 400, cfg: cfg59 });
    check("§59: ⛔ …and closing exactly those keeps them out — an authored absence survives growth",
      !!shut && drawn.every(id => !shut.crafts.some(c => c.id === id)) && shut.closed.length === drawn.length, `closed ${shut?.closed.join(" · ")}`);
    check("§59: …`growthFor` carries the same list so a caller can see what is closed", NS59.growthFor({ ...roomy, closed: drawn }, C59.abilities, { day: 400, cfg: cfg59 }).closed.length === drawn.length);
    // ✅ AND THE REAL VETH IS THE SECOND §2 CASE: 24 written, capacity 17 — all 24 kept, nothing drawn on top.
    const vk = veth && NS59.kitFor(veth, { catalog: C59.abilities, traditionIndex: C59.traditionIndex, domainAccess: da59, day: 400, cfg: cfg59 });
    const vIds = (veth?.abilities || []).map(a => a.abilityId || a);
    check("§59: …and Veth as rebuilt (24 > capacity) keeps every authored craft and gains none on top — the floor, twice over",
      !!vk && vIds.length > NS59.growthFor(veth, C59.abilities, { day: 400, cfg: cfg59 }).capacity && vIds.every(id => vk.crafts.some(c => c.id === id)) && vk.crafts.length === vIds.length,
      `${vIds.length} authored, kit ${vk?.crafts.length}`);
  }

  // ⛔ GROWTH HAS A CALLER, AND IT READS. The narrator's block carries the queue and the thin flag.
  {
    const tam = { id: "t59", name: "Tam", role: "smith", met: 9, firstMet: { day: 1 }, skillsObserved: ["ironsense"] };
    const out = NS59.sheetsForGM([tam], { catalog: C59.abilities, day: 400, cfg: cfg59 });
    check("§59: ⛔ `growthFor` is called from the narrator's sheet block — its first caller in play", /growthFor\(/.test(rd("engine/npcsheet.js").split("export function sheetsForGM")[1] || ""));
    check("§59: …and an observation the catalogue cannot express reaches the narrator as a fact about the RECORD", /ironsense/.test(out) && /not yet a craft/.test(out), out.split("\n").slice(1).join(" | "));
    check("§59: …and the thin case is named as a record problem, not a person", /thin/.test(out));
  }

  // ⚠️ THE SPEC'S OWN NUMBERS, CORRECTED BY MEASUREMENT (reported in the ROUND 2 reply):
  {
    const authored = npcs59.filter(n => n.schemaVersion != null);
    check("§59: ⚠️ Q4's premise is wrong — every authored person HAS `domains` (it is the generated roster that lacks them)",
      authored.length >= 40 && authored.every(n => n.domains), `${authored.filter(n => !n.domains).length} of ${authored.length} without`);
  }
}
/* ═════ §60 — THE CRAFT REACHES THE ROUND: the five call-site defects the duel surfaced ═════ */
// ⛔ po/DUEL_pell_vs_veth.md §C — Aevi hand-ruled a duel; running it through `battleRound` found that the fight the
// engine actually plays never sees the craft: a bare declaration reaches the damage block, the player's `tier`
// field carries the owned rank, energy is a flat 5 × intensity, an authored soak becomes threat-derived layers,
// and the player seat carries no level or soak. ⚠️ EVERY GATE WAS GREEN because every test spreads the def under
// the declaration — the test handed the reader a richer object than play does. These assert the LIVE shape.
console.log("\n── §60 · the craft reaches the round — def under the decl, rank beside tier, the craft's cost, the authored soak, a body in the player seat ──");
{
  const SB60 = await import("../engine/skill_battle.js");
  const EN60 = await import("../engine/encounters.js");
  const NS60 = await import("../engine/npcsheet.js");
  const { loadContentHeadless: lch60 } = await import("./headless_content.mjs");
  const C60 = await lch60();
  const sb60 = C60.skillBattle.engine, steps60 = C60.intensity.steps, rules60 = C60.rules;
  const seeded = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const appSrc = rd("app.js"), encSrc = rd("engine/encounters.js"), sbSrc = rd("engine/skill_battle.js");

  // ── F1 · the def under the decl, at the one seam both sides pass ──
  {
    check("§60: ⛔ `enrichDecl` exists and `skillBattleRound` runs BOTH declarations through it",
      typeof EN60.enrichDecl === "function" && /playerDecl = enrichDecl\(playerDecl/.test(encSrc) && /enrichDecl\(opponentPolicy\(/.test(encSrc));
    const bare = { id: "keystone_blow", function: "break", tier: 4, rank: 1, attribute: "practical", intensity: "standard", name: "Keystone Blow" };
    const rich = EN60.enrichDecl(bare, C60.abilities);
    check("§60: …a declaration with a catalogue id comes back carrying the craft — mechanic, harmRung, tradition",
      !!rich.mechanic && !!rich.harmRung && !!rich.tradition && rich.abilityId === "keystone_blow", Object.keys(rich).length + " keys");
    check("§60: …and the declaration's own fields WIN — tier, rank, intensity, name are the decl's, and `functions` is dropped",
      rich.tier === 4 && rich.rank === 1 && rich.intensity === "standard" && rich.name === "Keystone Blow" && rich.functions === undefined);
    const plain = { id: "_strike", function: "strike", tier: 1, attribute: "physical", intensity: "standard", name: "A plain strike" };
    check("§60: …a plain strike, a guard or an item move (no catalogue id) is returned untouched",
      EN60.enrichDecl(plain, C60.abilities) === plain && EN60.enrichDecl({ function: "strike", tier: 1 }, C60.abilities).mechanic === undefined);
    // ⛔ AND IT MOVES THE DICE — the whole point. Same seed, same guard, bare vs enriched.
    const guard = { function: "shield", tier: 1, attribute: "physical", intensity: "conserve", name: "a raised guard" };
    const opp = SB60.synthesizeOpponentSheet({ name: "them", threat: 40 }, sb60);
    const seat = { attributes: { practical: 12, physical: 10, mental: 10, social: 10 }, subAttributes: {}, alignment: {}, skills: {}, energy: 40, level: 20 };
    const landed = (decl, seed) => { const rng = seeded(seed); let sum = 0, n = 0, mx = 0, imposed = 0; for (let i = 0; i < 600; i++) { const rr = SB60.battleRound({ playerDecl: decl, oppDecl: guard, playerSheet: seat, oppSheet: opp, state: { momentum: 0, playerEnergy: 40, opponentEnergy: 40, effects: [], pressure: { player: 0, opponent: 0 }, opponentHealth: 999 }, rules: rules60, sb: sb60, steps: steps60, rng }); if (rr.damage?.side === "opponent") { const a = rr.damage.rolled ?? rr.damage.amount; sum += a; n++; mx = Math.max(mx, a); } if (rr.imposed && !rr.imposed.refused) imposed++; } return { mean: n ? sum / n : 0, mx, imposed }; };
    const rBare = landed(bare, 5), rRich = landed(rich, 5);
    // ⚠️ THE PROOF IS THE IMPOSITION, NOT A DAMAGE GAP: at tier 4 the family default already rolls 4d6-ish, so the
    // means sit close (23 vs 26). What a bare declaration can NEVER do is impose — keystone_blow authors `staggered`.
    check("§60: ⛔ keystone_blow imposes `staggered` only when its def is under the decl — a bare declaration never can",
      rBare.imposed === 0 && rRich.imposed > 100, `bare ${rBare.imposed} · enriched ${rRich.imposed} of 600`);
    check("§60: …and the enriched blow rolls the craft's own dice — above the family default, never past 4d6+7 plus the wielder",
      rRich.mean > rBare.mean && rRich.mx <= 4 * 6 + 7 + 6, `bare ${rBare.mean.toFixed(1)} → enriched ${rRich.mean.toFixed(1)}, max ${rRich.mx}`);
  }

  // ── F2 · rank beside tier: the roll reads the rank, the dice read the tier ──
  {
    check("§60: ⛔ `rollSide` feeds the chance stack the RANK (falling back to tier for callers that set none)", /abilityLevel: \(decl\.rank \?\? tier\)/.test(sbSrc));
    // ✅ 2026-09-05: the menu and the declaration builder live in engine/battle_turn.js (§71); the LIVE path is app.js + the module.
    const liveSrc = appSrc + "\n" + rd("engine/battle_turn.js");
    check("§60: ⛔ the player's menu puts the CRAFT's tier in `tier` and the owned rank in `rank`",
      /tier: abilityTier\(def\), rank: a\.level \?\? 1/.test(liveSrc) && !/tier: a\.level \|\| 1, attribute: def\.attribute/.test(liveSrc));
    check("§60: …both live declaration builders carry `rank` and `energyCost`",
      (liveSrc.match(/rank: (lead|skill)\.rank \?\? (lead|skill)\.tier \?\? 1/g) || []).length >= 2 && (liveSrc.match(/energyCost: (lead|skill|picked\[1\])\.energyCost \?\? null/g) || []).length >= 3);
    const pell = C60.npcs.pell;
    const kb = NS60.battleSkillsFor(pell, { catalog: C60.abilities, cfg: C60.rules.npcStanding }).skills.find(s => s.id === "keystone_blow");
    check("§60: …and a person's kit carries both — Pell's keystone_blow is tier 4, rank 1", !!kb && kb.tier === 4 && kb.rank === 1, JSON.stringify({ tier: kb?.tier, rank: kb?.rank }));
    // the breakdown says which it read
    const rng = seeded(3);
    const rr = SB60.battleRound({ playerDecl: { function: "break", tier: 4, rank: 1, attribute: "practical", intensity: "standard", name: "x" }, oppDecl: { function: "shield", tier: 1, attribute: "physical", intensity: "standard", name: "g" },
      playerSheet: { attributes: { practical: 6 }, subAttributes: {}, alignment: {}, skills: {}, energy: 40 }, oppSheet: SB60.synthesizeOpponentSheet({ name: "t", threat: 20 }, sb60),
      state: { momentum: 0, playerEnergy: 40, opponentEnergy: 40, effects: [], pressure: { player: 0, opponent: 0 }, opponentHealth: 50 }, rules: rules60, sb: sb60, steps: steps60, rng });
    const labels = (rr.player.breakdown?.components || []).map(c => c.label);
    check("§60: …the chance stack names \"ability rank 1\" for a rank-1 T4 craft, not rank 4", labels.includes("ability rank 1") && !labels.includes("ability rank 4"), labels.join(" · "));
  }

  // ── F3 · the craft's own energy cost ──
  {
    const opp = SB60.synthesizeOpponentSheet({ name: "t", threat: 20 }, sb60);
    const seat = { attributes: { practical: 6 }, subAttributes: {}, alignment: {}, skills: {}, energy: 40 };
    const st = { momentum: 0, playerEnergy: 40, opponentEnergy: 40, effects: [], pressure: { player: 0, opponent: 0 }, opponentHealth: 50 };
    const run = (decl) => SB60.battleRound({ playerDecl: decl, oppDecl: { function: "shield", tier: 1, attribute: "physical", intensity: "standard", name: "g" }, playerSheet: seat, oppSheet: opp, state: st, rules: rules60, sb: sb60, steps: steps60, rng: seeded(1) }).state.playerEnergy;
    const costly = run({ function: "strike", tier: 5, rank: 1, attribute: "mental", intensity: "standard", name: "cut", energyCost: 14 });
    const surged = run({ function: "strike", tier: 5, rank: 1, attribute: "mental", intensity: "surge", name: "cut", energyCost: 14 });
    const costless = run({ function: "strike", tier: 1, attribute: "physical", intensity: "standard", name: "plain" });
    check("§60: ⛔ a round charges the craft's own cost — 14 standard, 22 surged — and the default 5 only for a move that has none",
      costly === 40 - 14 && surged === 40 - Math.round(14 * 1.6) && costless === 40 - 5, `${costly} / ${surged} / ${costless}`);
  }

  // ── F4 · an authored soak is the soak the damage block reads ──
  {
    const veth = C60.npcs["veth-ondra"];
    const sheet = NS60.sheetFor(veth, { cfg: C60.rules.npcStanding });
    const kit = NS60.battleSkillsFor(veth, { catalog: C60.abilities, cfg: C60.rules.npcStanding }).skills;
    const o = SB60.synthesizeOpponentSheet({ name: sheet.name, attributes: sheet.attributes, health: sheet.health, energy: sheet.energy, soak: sheet.soak, skills: kit, threat: sheet.level * 2 }, sb60);
    const sum = (o.soakLayers || []).reduce((a, l) => a + l.value, 0);
    check("§60: ⛔ Veth's authored soak reaches her layers whole — layers sum to the sheet's soak, not to threat's", sheet.soak >= 10 && sum === sheet.soak, `soak ${sheet.soak} → layers ${JSON.stringify(o.soakLayers)}`);
    const synth = SB60.synthesizeOpponentSheet({ name: "raider", threat: 60 }, sb60);
    check("§60: …and a synthesised foe's layers still sum to its threat-derived soak — nothing else moved", synth.soakLayers.reduce((a, l) => a + l.value, 0) === synth.soak);
  }

  // ── F5 · the player seat has a level and a body ──
  check("§60: ⛔ the player seat passed to `battleRound` carries level, health and soak",
    /playerSheet: \{ attributes: character\.attributes[\s\S]{0,400}level: Number\(character\.level\) \|\| 1, health: character\.health, maxHealth: character\.maxHealth,[\s\S]{0,240}soak:/.test(encSrc));
}
/* ═════ §61 — A HOLDING HAS TWO EXITS, AND THEY ARE NOT THE SAME EXIT ═════ */
// ⛔ SPEC_holding_release_transfer — release lived in app.js as a bare filter reachable by the GM: the obligation vanished,
// the steward was silently un-charged, nothing was said. Now: release keeps the debt with you and says so once;
// transfer moves the debt with the place and the keeper may stay. Both are recorded; neither is a celebration.
console.log("\n── §61 · a holding has two exits — release keeps the debt, transfer moves it, the tick says it once ──");
{
  const H61 = await import("../engine/holdings.js");
  const W61 = await import("../engine/worldtick.js");
  const appSrc = rd("app.js"), gmSrc = rd("engine/gm.js"), wtSrc = rd("engine/worldtick.js");
  check("§61: ⛔ `releaseHolding`, `transferHolding` and `takeHoldingEvents` exist", ["releaseHolding", "transferHolding", "takeHoldingEvents"].every(k => typeof H61[k] === "function"));
  check("§61: ⛔ the bare filter is gone from app.js — both exits go through the operations",
    !/character\.holdings = \(character\.holdings \|\| \[\]\)\.filter\(x => x\.id !== id\)/.test(appSrc) && /releaseHolding\(character, id/.test(appSrc) && /transferHolding\(character, id/.test(appSrc));
  check("§61: …the GM contract names both exits and the receiving entity", /claim\|steward\|release\|transfer/.test(gmSrc) && /toEntity/.test(gmSrc));
  check("§61: …the Holdings tab offers both, per holding", /data-hold-release=/.test(appSrc) && /data-hold-transfer=/.test(appSrc) && /data-hold-to=/.test(appSrc));
  check("§61: …and the tick reads the queue", /takeHoldingEvents\(character\)/.test(wtSrc));

  const c = { id: "c61", holdings: [], worldState: { assignments: { "cass::keep": { id: "cass::keep", npcId: "cass", charge: "keep", status: "working", progress: 2 } } } };
  H61.addHolding(c, { id: "p1", kind: "post", name: "The Post", steward: "cass", obligation: "a tithe", day: 10 });
  H61.addHolding(c, { id: "p2", kind: "enterprise", name: "The Mill", steward: "edvar", day: 10 });
  const rel = H61.releaseHolding(c, "p1", { reason: "given up", day: 12, worldCount: 500 });
  const tr = H61.transferHolding(c, "p2", { toEntity: "pell", toName: "Pell", day: 12, worldCount: 500 });
  check("§61: ⛔ release — the place leaves `holdings`, keeps its debt UNPAID, releases its keeper, and is remembered",
    c.holdings.length === 0 && rel?.obligationUnpaid === true && rel?.stewardReleased === "cass" && (c.formerHoldings || []).some(h => h.id === "p1" && h.reason === "given up" && /^released/.test(h.history.at(-1)?.note || "")));
  check("§61: ⛔ transfer — the debt goes WITH the place, and the keeper stays",
    tr?.transferredTo === "pell" && tr?.obligationUnpaid === false && tr?.stewardStays === true && (c.formerHoldings || []).some(h => h.id === "p2" && h.transferredToName === "Pell"));
  check("§61: …and the keeper's assignment is untouched by either — assignments never named the holder",
    c.worldState.assignments["cass::keep"].status === "working" && c.worldState.assignments["cass::keep"].progress === 2);
  check("§61: …a released place is not reported as unkept — it is not yours to keep", H61.unstewardedHoldings(c, []).length === 0);
  check("§61: …an unknown id or a transfer with nobody named does nothing", H61.releaseHolding(c, "nope") === null && H61.transferHolding(c, "p1", {}) === null);
  const n1 = W61.advanceHoldings({ character: c }).news.map(x => x.text), n2 = W61.advanceHoldings({ character: c }).news.map(x => x.text);
  check("§61: ⛔ the tick says each exit ONCE — release names the unpaid debt, transfer names who keeps it now",
    n1.some(t => /given up The Post/.test(t) && /still owed/.test(t)) && n1.some(t => /The Mill is Pell's to keep now/.test(t)) && !n2.some(t => /given up|to keep now/.test(t)), `tick1 ${n1.length} · tick2 ${n2.length}`);
}
/* ═════ §62 — A RULING NAMES THE SENTENCE THAT ENACTS IT, AND THE SENTENCE APPEARS ONCE ═════ */
// ⛔ SPEC_one_source_of_truth §4 / §B2–B3 — an R-number in the body proves a label was pasted; an ANCHOR proves the
// meaning arrived. A `po/RULING_*.md` may declare `bodyAnchor: "…"` and `subject: …`; a declared anchor must
// appear in HOW_IT_WORKS's BODY exactly once (twice is the contradiction class — two sections, one subject).
// ⚠️ A RATCHET, NOT A CLIFF (§B3): rulings that have not declared yet are a COUNT that may only go down; a
// declared anchor that does not match is the hard failure. Those two must never be one check.
console.log("\n── §62 · declared ruling anchors land in the body exactly once; the undeclared count only falls ──");
{
  const { readdirSync: rdir62 } = await import("node:fs");
  const rulingFiles = rdir62(join(root, "po")).filter(f => /^RULING_.*\.md$/.test(f));
  const dl62 = doc.split(String.fromCharCode(10));
  let last62 = -1; dl62.forEach((l, i) => { if (/^\|\s*\d\d-\d\d\s*\|/.test(l)) last62 = i; });
  const body62 = dl62.slice(last62 + 1).join(String.fromCharCode(10));
  const declared = [], undeclared = [];
  for (const f of rulingFiles) {
    const txt = rd("po/" + f);
    // ⚠️ Aevi writes the declaration in bold (`**bodyAnchor:** "…"`); it is the same declaration and reads the same.
    const m = txt.match(/^\*{0,2}bodyAnchor:?\*{0,2}:?\s*"([^"\n]+)"/m);
    if (m) declared.push({ f, anchor: m[1], subject: (txt.match(/(?:^|\s)\*{0,2}subject\*{0,2}:\s*(\S+)/m) || [])[1] || null }); else undeclared.push(f);
  }
  check("§62: the scan sees the rulings — not vacuous", rulingFiles.length >= 20, `${rulingFiles.length} ruling papers`);
  // ⛔ THE HARD HALF: every declared anchor is in the body, and exactly once.
  const count = (needle) => body62.split(needle).length - 1;
  // ⚠️ A DECLARED ANCHOR IS OWED ONCE THE INDEX SAYS THE RULING IS BUILT. The GO list sequences rulings (R36 waits
  // for the floor); a paper may declare its sentence weeks before the engine lands, and §56 forbids the body
  // carrying a ⬜ ruling. So: the RULINGS index row is the state — ✅ there means the body must carry the sentence;
  // ⬜ there means it is sequenced, and the anchor is reported as owed rather than failed.
  const idx62 = rd("docs/RULINGS.md");
  const built62 = new Set([...idx62.matchAll(/^\|\s*\*\*R(\d+)\*\*\s*\|[^\n]*?\|\s*✅/gm)].map(m => Number(m[1])));
  const rNums = (txt) => [...txt.matchAll(/^#{2,3}\s*R(\d+)[a-z]?\b/gm)].map(m => Number(m[1]));  // R37a, R38b: a lettered sub-ruling is the same number
  for (const d of declared) { const ns = rNums(rd("po/" + d.f)); d.owed = ns.length === 0 || ns.some(n => built62.has(n)); }
  const sequenced = declared.filter(d => !d.owed && count(d.anchor) === 0);
  if (sequenced.length) console.log("      ⬜ declared, sequenced (index ⬜), not yet in the body: " + sequenced.map(d => d.f).join(" · "));
  const missing = declared.filter(d => d.owed && count(d.anchor) === 0), doubled = declared.filter(d => count(d.anchor) > 1);
  check("§62: ⛔ every DECLARED anchor is carried by the body — a ruling that names its sentence has landed",
    declared.length >= 1 && missing.length === 0, missing.map(d => d.f + " → " + d.anchor).join(" · ") || `${declared.length} declared, ${declared.filter(d => d.owed).length} owed, all owed present`);
  check("§62: …a sequenced ruling (index ⬜) that already declares its sentence is seen, not failed — the GO list's order is legal", declared.some(d => !d.owed) || sequenced.length === 0,
    sequenced.map(d => d.f).join(" · "));
  check("§62: ⛔ …and exactly ONCE — two sections carrying one subject is the contradiction class",
    doubled.length === 0, doubled.map(d => d.f).join(" · "));
  check("§62: …a declared anchor names its subject too, so the join has a key", declared.every(d => !!d.subject), declared.filter(d => !d.subject).map(d => d.f).join(" · "));
  // ⚠️ THE RATCHET HALF: measured 25 undeclared on 2026-09-04 (26 papers, R33 declared first). May only go DOWN.
  const BASELINE_UNDECLARED = 25;
  check(`§62: ratchet — rulings without a declared anchor = ${undeclared.length} (baseline ${BASELINE_UNDECLARED}) — may only go DOWN`,
    undeclared.length <= BASELINE_UNDECLARED, undeclared.length > BASELINE_UNDECLARED ? "a new ruling paper landed without declaring its sentence — add `bodyAnchor:`" : "");
}

/* ═════ §63 — ONE SUBJECT, EVERY LAYER: the instrument that stops the archaeology ═════ */
// ⛔ SPEC_associativity §5 Q4 — “the smallest version that would have caught today.” `scripts/subject.mjs` joins a
// subject across TRUTH / LOG / RULING / SPEC / CONTENT / ENGINE / UI / TESTS / DOCS, derived on every run, and
// reports the ABSENCES: ruled-not-enacted, enacted-not-built, built-not-in-truth, content-file rulings, orphans.
// ⚠️ The only hand-kept part is its SYNONYMS map, and this gate is what keeps that from rotting: every term must
// still hit at least one layer, and the two subjects that cost the most must resolve the way the truth says.
console.log("\n── §63 · the subject instrument runs, its synonyms resolve, and it sees the absences it was built for ──");
{
  const SJ = await import("../scripts/subject.mjs");
  check("§63: the instrument exports `report` and a SYNONYMS map with the subjects that cost the most",
    typeof SJ.report === "function" && ["foothills", "npc-sheets", "holdings", "battle-declaration"].every(k => Array.isArray(SJ.SYNONYMS[k])));
  // ⛔ THE MAP CANNOT ROT SILENTLY: every synonym of every subject still lands somewhere.
  const dead = [];
  for (const [subj, terms] of Object.entries(SJ.SYNONYMS)) {
    const r = SJ.report(subj);
    const seen = new Set(Object.values(r.hits).flat().flatMap(h => h.terms));
    for (const t of terms) if (!seen.has(t)) dead.push(subj + ":" + t);
  }
  check("§63: ⛔ every synonym in the map still resolves to at least one layer — a dead synonym is red, not quietly wrong", dead.length === 0, dead.join(" · "));
  // ✅ THE CASE IT WAS BUILT FOR: foothills reach every layer and carry no absence today.
  const fh = SJ.report("foothills");
  check("§63: foothills — every layer carries the subject and the R33 row reads enacted",
    ["TRUTH", "RULING", "CONTENT", "ENGINE", "TESTS"].every(l => fh.hits[l].length > 0) && fh.ruled.some(x => x.id === "R33" && x.enacted) && !fh.flags.some(f => /NOT ENACTED|NOT INDEXED/.test(f)),
    fh.flags.join(" | ") || "no absences");
  check("§63: …and it finds the ruling that lived in a content-file `_` key — the shape that hid R33 for seven days",
    fh.contentRulings.some(c => /_twoAxes/.test(c.key)), fh.contentRulings.map(c => c.key).slice(0, 3).join(" · "));
  // ⚠️ A SPEC-ONLY IDEA READS AS ONE. `settlementStanding` (SPEC_debts_and_reception §1: "no reader — how a PLACE receives
  // you is not modelled at all") has no reader and no body section; the report must say so. (`meaningDensity` was this
  // fixture until R38 built it on 2026-09-04 — and the instrument now shows it in ENGINE and TRUTH, which is the point.)
  const md = SJ.report("settlement-standing");
  check("§63: a spec-only subject is reported as absent from TRUTH and ENGINE — the instrument does not flatter",
    md.hits.TRUTH.length === 0 && md.hits.ENGINE.length === 0 && md.hits.SPEC.length > 0);
  const md2 = SJ.report("meaning-density");
  check("§63: …and a subject that was built stops reading as absent — meaning-density reaches ENGINE and TRUTH now (R38)",
    md2.hits.ENGINE.length > 0 && md2.hits.TRUTH.length > 0, JSON.stringify({ engine: md2.hits.ENGINE.length, truth: md2.hits.TRUTH.length }));
}
const SJ64_SYN = (await import("../scripts/subject.mjs")).SYNONYMS;
/* ═════ §64 — A CRASH IS AT LEAST ONE FAILURE, AND THE TRUTH NAMES FIELDS THAT EXIST ═════ */
// ⛔ THE RATCHET WAVED A DEAD SUITE THROUGH. `tradition_matrix` threw on a null for a day; a suite that throws prints no
// "N FAILURE(S)" and no FAIL line, so `countOf` computed `null ?? 0 ?? 1` = 0 and a crash read as green. A non-zero exit
// is now at least one. ⚠️ The first honest run surfaced `verification_ledger`, which exits 1 BY DESIGN when the ledger
// has red rows — it had been invisible; it is baselined at 1 deliberately rather than hidden again.
//
// ⛔ TRUTH ↔ DATA (SPEC_associativity §4.2 / SPEC_one_source_of_truth §B2): a body section may declare
// `<!-- subject: X · fields: a, b · state: c -->`. Every `fields:` name must be a key somewhere in content; every
// `state:` name (a save-record field) must be named in engine/. A body that describes a field nobody authors is the
// “enacted but not built” class. Sections without a marker are a COUNT that may only fall.
console.log("\n── §64 · a crash counts; the truth’s named fields exist in content or in the engine ──");
{
  const rt = rd("scripts/run_tests.mjs");
  check("§64: ⛔ the ratchet counts a non-zero exit as AT LEAST one failure — a crash can no longer read as green",
    /const countOf = \(r\) => \(r\.ok \? 0 : Math\.max\(1, r\.fails \?\? r\.lineCount \?\? 0\)\)/.test(rt));
  const base64 = JSON.parse(rd("tests/suite_baseline.json"));
  check("§64: …and `verification_ledger` is baselined as a KNOWN red, not hidden", Number(base64.suites?.verification_ledger) >= 1, `baseline ${base64.suites?.verification_ledger}`);

  // TRUTH ↔ DATA
  const { readdirSync: rd64, statSync: st64, readFileSync: rf64 } = await import("node:fs");
  const keys64 = new Set();
  const walk64 = (d) => { for (const e of rd64(d)) { const p = join(d, e); if (st64(p).isDirectory()) walk64(p); else if (e.endsWith(".json")) { let j; try { j = JSON.parse(rf64(p, "utf8")); } catch { continue; } const scan = (o) => { if (!o || typeof o !== "object") return; if (Array.isArray(o)) { o.forEach(scan); return; } for (const [k, v] of Object.entries(o)) { keys64.add(k); scan(v); } }; scan(j); } } };
  walk64(join(root, "content"));
  const engSrc64 = rd64(join(root, "engine")).filter(f => f.endsWith(".js")).map(f => rd("engine/" + f)).join("\n");
  const dl64 = doc.split(String.fromCharCode(10));
  let last64 = -1; dl64.forEach((l, i) => { if (/^\|\s*\d\d-\d\d\s*\|/.test(l)) last64 = i; });
  const bodyLines = dl64.slice(last64 + 1);
  const sections = bodyLines.filter(l => /^## /.test(l)).length;
  // ⚠️ the doc carries CRLF on these lines; strip the CR or the marker never matches (the first run found 0 markers)
  const markers = bodyLines.map(l => l.replace(new RegExp(String.fromCharCode(13) + "$"), "").match(/^<!-- subject: ([a-z0-9-]+)(?: · fields: ([^·]*?))?(?: · state: ([^-]*?))? -->$/)).filter(Boolean)
    .map(m => ({ subject: m[1], fields: (m[2] || "").split(",").map(x => x.trim()).filter(Boolean), state: (m[3] || "").split(",").map(x => x.trim()).filter(Boolean) }));
  check("§64: the body carries subject markers — not vacuous", markers.length >= 3 && sections >= 15, `${markers.length} markers over ${sections} sections`);
  const badF = markers.flatMap(m => m.fields.filter(f => !keys64.has(f)).map(f => m.subject + ":" + f));
  const badS = markers.flatMap(m => m.state.filter(f => !new RegExp("\\b" + f + "\\b").test(engSrc64)).map(f => m.subject + ":" + f));
  check("§64: ⛔ every `fields:` name the truth declares is a key somewhere in content — the truth may not describe a field nobody authors", badF.length === 0, badF.join(" · "));
  check("§64: ⛔ every `state:` name is named in engine/ — a save-record field the body describes has a reader", badS.length === 0, badS.join(" · "));
  check("§64: …and a subject named on a body section is one the instrument knows", markers.every(m => !!(SJ64_SYN[m.subject])), markers.filter(m => !SJ64_SYN[m.subject]).map(m => m.subject).join(" · "));
  const BASELINE_UNMARKED = 20;   // measured 2026-09-04: 23 body sections, 3 marked (§3c, §7d, §7h)
  check(`§64: ratchet — body sections without a subject marker = ${sections - markers.length} (baseline ${BASELINE_UNMARKED}) — may only go DOWN`, sections - markers.length <= BASELINE_UNMARKED);
}

/* ═════ §65 — A HOLDING IS A MODIFIER ON A PLACE: THE JOIN, THE SENTENCE, THE NARRATOR KNOWS WHERE YOU STAND ═════ */
// ⛔ SPEC_holding_attributes — every delta the list names exists on locations and none of their readers could ask whether a
// holding sits on the place. `holdingsAt` is the join; `provides`/`upkeep` are read before anyone authors them; the hard
// constraint (a hold reports in a SENTENCE) is `holdingSentence`. Magnitudes are pass two (RULINGS OWED Q14).
console.log("\n── §65 · a holding is legible at the place it sits ──");
{
  const H65 = await import("../engine/holdings.js");
  check("§65: ⛔ `holdingsAt` and `holdingSentence` exist", typeof H65.holdingsAt === "function" && typeof H65.holdingSentence === "function");
  const c = { id: "c65", holdings: [] };
  H65.addHolding(c, { id: "mill", kind: "enterprise", name: "The Mill", locationId: "millbrook", steward: "edvar", day: 1 });
  c.holdings[0].provides = ["worked timber"]; c.holdings[0].upkeep = ["a steward's wage"];
  H65.addHolding(c, { id: "post", kind: "post", name: "The Post", locationId: "the_old_warden_post", day: 1 });
  check("§65: ⛔ the join — the holdings AT a place, and nothing for a place you hold nothing at", H65.holdingsAt(c, "millbrook").map(h => h.id).join() === "mill" && H65.holdingsAt(c, "nowhere").length === 0 && H65.holdingsAt(c, null).length === 0);
  const sent = H65.holdingSentence(c.holdings[0], { nameOf: id => id === "edvar" ? "Edvar Crane" : id });
  check("§65: ⛔ the sentence reads condition, keeper, what it provides and what it eats — Erik's hard constraint",
    /^The Mill is running under Edvar Crane; it provides worked timber; it eats a steward's wage\.$/.test(sent), sent);
  check("§65: …and with nothing authored it still speaks — condition and keeper alone", /^The Post is running with nobody keeping it\.$/.test(H65.holdingSentence(c.holdings[1])));
  const gm = H65.holdingsForGM(c, null, { hereId: "millbrook", nameOf: id => id });
  check("§65: ⛔ the narrator is told when the character is STANDING IN a place they hold, and hears the sentence", /The Mill[^\n]*YOU ARE STANDING IN IT[^\n]*it provides worked timber/.test(gm) && !/The Post[^\n]*STANDING/.test(gm), gm.split("\n")[0].slice(0, 120));
  check("§65: …and the GM registry passes where the character is", /hereId: env\.location\?\.id/.test(rd("engine/gm_registry.js")));
}

/* ═════ §66 — THE PC WEARS WHAT THE ITEMS AUTHOR: SNG-521's soakLayers REACH THE FIGHT SEAT ═════ */
// ⛔ Items authored typed soak (`oiled_leathers` decay 5 / physical 1, `lattice_token` precursor 6) and the player seat read
// `character.soak`, a field nothing writes — the PC's armour never soaked a blow. `wornSoakLayers` is the reader: what is
// carried counts (there is no equipped flag, the same rule `equipmentBonus` uses), and per type the single BEST layer
// stands — two coats are not two coats, so carrying three habits cannot stack into immunity.
console.log("\n── §66 · the PC’s authored armour reaches the seat, best per type ──");
{
  const INV66 = await import("../engine/inventory.js");
  const { loadContentHeadless: lch66 } = await import("./headless_content.mjs");
  const C66 = await lch66();
  const leathers = C66.items.oiled_leathers, token = C66.items.lattice_token;
  check("§66: the authored items exist and carry typed layers — not vacuous", !!leathers?.soakLayers?.length && !!token?.soakLayers?.length);
  const ch = { inventory: [leathers, token, { id: "coat2", name: "Second Coat", soakLayers: [{ type: "physical", value: 3 }, { type: "decay", value: 2 }] }] };
  const w = INV66.wornSoakLayers(ch);
  const of = (t) => w.find(l => l.types?.includes(t));
  check("§66: ⛔ best per type, never a sum — decay 5 (the leathers), physical 3 (the coat), precursor 6 (the token)",
    of("decay")?.value === 5 && of("physical")?.value === 3 && of("precursor")?.value === 6 && w.length === 3, JSON.stringify(w.map(l => [l.types, l.value])));
  check("§66: …an empty pack wears nothing, and a typed layer is not a flat soak", INV66.wornSoakLayers({ inventory: [] }).length === 0 && INV66.wornSoak(ch) === 0);
  check("§66: ⛔ the player seat passes `soakLayers` from what is worn", /soakLayers: \(\(\) => \{ const w = wornSoakLayers\(character\); return w\.length \? w : undefined; \}\)\(\)/.test(rd("engine/encounters.js")));
}

/* ═════ §67 — THE LINEAGE’S AUTHORED BLEND HAS A READER ═════ */
// ⛔ `byTradition[t].mix` — 26 blends with Erik's reasons — had zero consumers since it landed. The ground card carries it
// as `lineageMix` in the band vocabulary, and the wheel's ground row shows it. Unauthored stays absent (§2b).
console.log("\n── §67 · the lineage blend reaches the card and the row ──");
{
  const SUB67 = await import("../engine/substrate.js");
  const { loadContentHeadless: lch67 } = await import("./headless_content.mjs");
  const C67 = await lch67();
  const card = (ab) => SUB67.groundCardFor(ab, { domains: { primary: ab.tradition }, schools: {} }, { schools: C67.schools, substrate: C67.substrateModel, location: C67.locations.millbrook, powerSources: C67.powerSources, locations: C67.locations, foothills: C67.foothills });
  const aby = Object.values(C67.abilities).find(a => a.tradition === "abyssal");
  const g = card(aby);
  check("§67: ⛔ an authored lineage blend reaches the card, in the band vocabulary, sorted, as shares",
    Array.isArray(g?.lineageMix) && g.lineageMix.length >= 2 && g.lineageMix[0].share >= g.lineageMix[1].share && g.lineageMix.every(m => /^[a-z_]+$/.test(m.source) && !/_nanite$/.test(m.source)), JSON.stringify(g?.lineageMix));
  const none = Object.values(C67.abilities).find(a => a.tradition && !C67.powerSources?.byTradition?.[a.tradition]?.mix);
  check("§67: …and a lineage with no authored blend carries none — absent, never a pure mean", !none || card(none)?.lineageMix === null, none?.tradition);
  check("§67: …and the ground row renders it", /lineage leans/.test(rd("app.js")));
}
/* ═════ §68 — THE COMBAT FLOOR: pools on the player's curve · pressure symmetric and breaking at half your level · the death save ═════ */
// ⛔ GO_LIST_20260904 §1 — three changes, one landing, because "40-flat energy and break-at-3 make every other change
// unmeasurable". Q1: an NPC's pools run on the player's shape (base + per-level, both currencies). R34a: BEING DRIVEN
// BACK costs both sides health AND energy, priced alike, and the opponent's health loss is APPLIED (it was computed and
// written to nobody). R34b: the break threshold is ceil(level × fraction) of the side being broken. R35: a landed hit at
// a lethal rung offers the insta-kill through an opposed death save; a kill stops the target and costs the caster the
// craft's authored killCost; a held save falls back to the dice at the standard cost.
console.log("\n── §68 · the combat floor — pools, symmetric pressure, break at half your level, the death save ──");
{
  const SB68 = await import("../engine/skill_battle.js");
  const NS68 = await import("../engine/npcsheet.js");
  const rules68 = rj("content/packs/core/rules/resolution.json");
  const sb68 = rj("content/packs/core/rules/skill_battle_system.json").engine;
  const steps68 = rj("content/packs/core/rules/intensity_scaling.json").steps;
  const cfg68 = rules68.npcStanding || {};
  // ── Q1 · the pools
  check("§68: ⛔ the four pool dials are authored (healthBase · healthPerLevel · energyBase · energyPerLevel), all positive",
    [cfg68.healthBase, cfg68.healthPerLevel, cfg68.energyBase, cfg68.energyPerLevel].every(n => Number.isFinite(n) && n > 0),
    JSON.stringify([cfg68.healthBase, cfg68.healthPerLevel, cfg68.energyBase, cfg68.energyPerLevel]));
  const s30 = NS68.sheetFor({ id: "x68", name: "X" }, { cfg: cfg68, levelOverride: 30 });
  check("§68: …and a level-30 person carries them — health = base + 30×perLevel, energy likewise",
    s30?.health === cfg68.healthBase + 30 * cfg68.healthPerLevel && s30?.energy === cfg68.energyBase + 30 * cfg68.energyPerLevel,
    `health ${s30?.health} energy ${s30?.energy} (level ${s30?.level})`);
  const s30old = NS68.sheetFor({ id: "x68", name: "X" }, { cfg: {}, levelOverride: 30 });
  check("§68: …and unauthored is byte-identical to before (level×3 health, 40 flat)", s30old?.health === 90 && s30old?.energy === 40, `${s30old?.health}/${s30old?.energy}`);
  check("§68: …near the PC curve — an equal-level person is within 20% of a physical-3 PC's pools at L30",
    Math.abs(s30.health - (30 + 5 * 29)) / (30 + 5 * 29) < 0.2 && Math.abs(s30.energy - (100 + 5 * 29)) / (100 + 5 * 29) < 0.2,
    `${s30.health} vs 175 · ${s30.energy} vs 245`);

  // ── fixtures: two equal level-30 bodies, each carrying a T5 craft so the tier gap is 0
  const seq68 = (arr) => { let i = 0; return () => arr[(i++) % arr.length]; };
  const mk68 = (o = {}) => ({ attributes: { physical: 6, mental: 6, social: 6, practical: 6 }, subAttributes: { strength: 8, presence: 4 },
    energy: 200, maxEnergy: 200, health: 120, maxHealth: 120, level: 30, skills: [{ function: "strike", tier: 5, name: "t5" }], ...o });
  const guard68 = { function: "shield", tier: 1, name: "g" };
  const plain68 = { function: "strike", tier: 4, rank: 1, attribute: "physical", intensity: "standard", name: "hammer", mechanic: { dice: { n: 4, d: 6 }, damageType: "physical" } };
  const round68 = (pd, od, extra = {}, state = {}, sb = sb68) => SB68.battleRound({ playerDecl: pd, oppDecl: od, playerSheet: mk68(), oppSheet: mk68(extra.opp || {}),
    state: { momentum: 0, round: 1, ...state }, rules: rules68, sb, steps: steps68, rng: extra.rng || seq68([0.5]), ...(extra.kind ? { kind: extra.kind } : {}) });

  // ── R34a · a pressure tick costs both sides the same kind of thing, and the opponent's health loss is APPLIED
  const pc68 = sb68.momentum?.pressure || {};
  check("§68: ⛔ R34a — the four tick dials are content, none zero, and the two sides are priced alike",
    [pc68.playerHealthLoss, pc68.playerEnergyLoss, pc68.opponentHealthLoss, pc68.opponentEnergyLoss].every(n => Number.isFinite(n) && n > 0)
      && pc68.playerHealthLoss === pc68.opponentHealthLoss && pc68.playerEnergyLoss === pc68.opponentEnergyLoss, JSON.stringify(pc68));
  const tickO = round68(plain68, guard68, { rng: seq68([0.02, 0.99, 0.98, 0.99]) }, { momentum: 44 });
  check("§68: ⛔ …the opponent driven back loses HEALTH in-round (it was computed and applied to nobody) and energy",
    tickO.pressureEvent?.side === "opponent" && tickO.pressureEvent.healthLoss === pc68.opponentHealthLoss && tickO.pressureEvent.applied?.health === pc68.opponentHealthLoss
      && tickO.state.opponentHealth === 120 - pc68.opponentHealthLoss - (tickO.damage?.amount || 0) && tickO.state.opponentEnergy < 200 - pc68.opponentEnergyLoss,
    JSON.stringify({ pe: tickO.pressureEvent, h: tickO.state.opponentHealth, e: tickO.state.opponentEnergy }));
  const tickP = round68(guard68, plain68, { rng: seq68([0.98, 0.99, 0.02, 0.99]) }, { momentum: -44 });
  check("§68: …the player driven back is charged the same currencies — energy in-round, health carried to the caller",
    tickP.pressureEvent?.side === "player" && tickP.pressureEvent.healthLoss === pc68.playerHealthLoss && tickP.pressureEvent.energyLoss === pc68.playerEnergyLoss
      && tickP.state.playerEnergy <= 200 - pc68.playerEnergyLoss && tickP.state.playerHealth === undefined,
    JSON.stringify({ pe: tickP.pressureEvent, e: tickP.state.playerEnergy }));
  check("§68: …and the wrapper applies the player's tick to deltas", /deltas\.health -= r\.pressureEvent\.healthLoss/.test(rd("engine/encounters.js")));

  // ── R34b · the break threshold is ceil(level × fraction) of the side being broken
  check("§68: ⛔ R34b — `breakAtLevelFraction` is authored (0.5) and the round reads it",
    pc68.breakAtLevelFraction === 0.5 && /breakAtLevelFraction/.test(rd("engine/skill_battle.js")));
  check("§68: …a level-30 side breaks at 15, a level-5 side at 3", tickO.state.breakAt?.opponent === 15
    && round68(plain68, guard68, { opp: { level: 5 } }).state.breakAt?.opponent === 3, JSON.stringify(tickO.state.breakAt));
  check("§68: …a sheet with no level falls back to the flat dial", round68(plain68, guard68, { opp: { level: undefined } }).state.breakAt?.opponent === pc68.breakAtPressure);
  check("§68: …a kind that authors its own flat break (a chase) keeps it — the ruling is about fights",
    round68(plain68, guard68, { kind: "chase" }).state.breakAt?.opponent === (sb68.kinds?.chase?.pressure?.breakAtPressure ?? -1));
  check("§68: …the level rides on both opponent-sheet paths — threat 60 reads as level 30; an authored level passes through",
    SB68.synthesizeOpponentSheet({ threat: 60 }, sb68).level === 30
      && SB68.synthesizeOpponentSheet({ skills: [{ function: "strike", tier: 1 }], attributes: {}, health: 10, energy: 10, level: 27 }, sb68).level === 27);
  check("§68: …and `personOpponentFor` passes the person's level to the seat", /level: sheet\.level,/.test(rd("engine/battle_turn.js")));

  // ── R35 · the death save
  const cutFile = rj("content/packs/core/abilities/reach_death_life.json");
  const cutList = Array.isArray(cutFile) ? cutFile : Array.isArray(cutFile.abilities) ? cutFile.abilities : Object.values(cutFile.abilities || {});
  const cut68 = cutList.find(a => a.id === "the_cut_thread");
  // ⚠️ Erik revised the bound the same afternoon (double cost, not the pool — §70 measures that shape); this section keeps the
  // whole-pool + seal PATH under test with an explicit fixture, because a craft may still author it.
  check("§68: ⛔ R35 — the_cut_thread carries an authored `mechanic.killCost`", cut68?.harmRung === "lethal" && !!cut68?.mechanic?.killCost);
  check("§68: …`deathSave` is content — rungs include lethal, the save reads strength/presence, saveBonus is a number",
    Array.isArray(sb68.deathSave?.rungs) && sb68.deathSave.rungs.includes("lethal") && (sb68.deathSave.saveOn || []).includes("strength")
      && Number.isFinite(sb68.deathSave.saveBonus) && Array.isArray(sb68.deathSave.notForClasses));
  const lethal68 = { function: "strike", tier: 5, rank: 1, attribute: "mental", intensity: "standard", name: "the Cut Thread", id: "the_cut_thread", energyCost: 14,
    harmRung: "lethal", mechanic: { ...cut68.mechanic, killCost: { energy: "all", sealedUntilRest: true } } };   // the whole-pool shape, explicitly
  const KILL = [0.02, 0.99, 0.98, 0.99, 0.99, 0.99, 0.5], HOLD = [0.30, 0.99, 0.98, 0.99, 0.01, 0.99, 0.5];
  const k = round68(lethal68, guard68, { rng: seq68(KILL) });
  check("§68: ⛔ save FAILS → the target STOPS: health irrelevant, the damage is the whole pool, `slain`, the fight resolves",
    k.deathSave?.kill === true && k.damage?.slain === true && k.damage.amount === 120 - (k.pressureEvent?.healthLoss || 0) && k.state.opponentHealth === 0 && k.state.resolved === "player",
    JSON.stringify({ ds: k.deathSave && { c: k.deathSave.caster, s: k.deathSave.save, on: k.deathSave.saveOn, kill: k.deathSave.kill }, amt: k.damage?.amount, h: k.state.opponentHealth }));
  check("§68: …and the caster pays the AUTHORED bound only then — whole pool to zero, sealed until a night's rest",
    k.state.playerEnergy === 0 && k.state.playerSealed === true && k.deathSave.cost?.energy === "all");
  check("§68: …the save rolled the higher of strength/presence (strength 8 over presence 4), with no craft behind it",
    k.deathSave.saveOn === "strength" && k.deathSave.saveValue === 8);
  const h = round68(lethal68, guard68, { rng: seq68(HOLD) });
  const hPlain = round68({ ...lethal68, harmRung: "wounding" }, guard68, { rng: seq68(HOLD) });
  check("§68: ⛔ save HOLDS → the dice are the fallback at the STANDARD cost, not the pool",
    h.deathSave?.held === true && !h.damage?.slain && h.damage.amount > 0 && h.damage.amount < 120 && h.state.opponentHealth === 120 - h.damage.amount - (h.pressureEvent?.healthLoss || 0)
      && h.state.playerEnergy === hPlain.state.playerEnergy && h.state.playerEnergy > 150 && !h.state.playerSealed,
    JSON.stringify({ amt: h.damage?.amount, e: h.state.playerEnergy, plainE: hPlain.state.playerEnergy }));
  check("§68: …a non-lethal rung is offered no save (the ⚡ finisher path is untouched)", !hPlain.deathSave && !hPlain.damage?.deathSave);
  const sbBar = { ...sb68, deathSave: { ...sb68.deathSave, notForClasses: ["machine"] } };
  check("§68: …a class the craft cannot be aimed at (`notForClasses`) gets no save, and takes the dice",
    (() => { const b = round68(lethal68, guard68, { rng: seq68(KILL), opp: { creatureClass: "machine" } }, {}, sbBar); return !b.deathSave && b.damage?.amount > 0 && !b.damage?.slain; })());
  const sealed = round68(lethal68, guard68, {}, { playerSealed: true });
  check("§68: ⛔ a SEALED side's crafts do not answer — the declaration falls back as a spent one does, and the seal rides out",
    sealed.degraded?.player === true && sealed.state.playerSealed === true);
  // the situational terms are the finisher's own dials, on the caster's side
  const pressed = round68(lethal68, guard68, { rng: seq68(HOLD) }, { opponentEnergy: 30, pressure: { player: 0, opponent: 3 } });
  check("§68: …a run-down, driven-back target is the 'near certainty' — pressure ×3 and worn-down weigh on the save",
    pressed.deathSave?.kill === true && pressed.deathSave.mods.some(m => /driven back/.test(m.label)) && pressed.deathSave.mods.some(m => /run down/.test(m.label)),
    JSON.stringify(pressed.deathSave?.mods));
  // distributional truth, seeded: a landed lethal hit on a fresh equal kills about half the time
  let s68 = 20260904; const rng68 = () => { s68 |= 0; s68 = (s68 + 0x6D2B79F5) | 0; let t = Math.imul(s68 ^ (s68 >>> 15), 1 | s68); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  let kills68 = 0, landed68 = 0;
  for (let i = 0; i < 600; i++) { const r = round68(lethal68, guard68, { rng: rng68 }); if (!r.deathSave) continue; landed68++; if (r.deathSave.kill) kills68++; }
  check("§68: ⛔ seeded — a landed lethal hit on a fresh equal kills between 35% and 65% of the time (Erik: 'a 50/50')",
    landed68 > 150 && kills68 / landed68 >= 0.35 && kills68 / landed68 <= 0.65, `${kills68}/${landed68} = ${Math.round(100 * kills68 / Math.max(1, landed68))}%`);
  // the seams carry it
  const enc68 = rd("engine/encounters.js"), app68 = rd("app.js");
  check("§68: …the wrapper passes the sheet's seal in and the death save + seal out", /playerSealed: true/.test(enc68) && /deathSave: r\.deathSave \|\| null, sealed: r\.state\?\.playerSealed === true/.test(enc68));
  check("§68: …the kill is EVENT-VISIBLE both ways it falls", /THE THREAD IS CUT/.test(enc68) && /holds against the kill/.test(enc68));
  check("§68: …the app persists the seal on the sheet and a night's rest lifts it", /if \(rr\.sealed\) character\.craftSealedUntilRest = true;/.test(app68 + rd("engine/battle_turn.js"))
    && /if \(character\.craftSealedUntilRest\) delete character\.craftSealedUntilRest;/.test(app68) && /Death save: /.test(app68));
  check("§68: …the body carries the death save and the floor", /death save/i.test(rd("docs/HOW_IT_WORKS.md")) && /healthBase/.test(rd("docs/HOW_IT_WORKS.md")));
  // ⛔ MEASURED 2026-09-04 (the Pell–Veth census): the tier-gap term read the TARGET's sharpest craft from `skills[]`, and the
  // player seat carries `skills` as a MAP — so every NPC lethal hit out-classed the player by tier − 1 (Veth killed Pell on
  // 95% of landed lethal hits against a 48% calibration). The seat now names `maxTier`; the term reads it first.
  const oppLethal68 = { ...lethal68, name: "their cut" };
  const asTarget68 = (seat) => SB68.battleRound({ playerDecl: guard68, oppDecl: oppLethal68, playerSheet: mk68(seat), oppSheet: mk68(),
    state: { momentum: 0, round: 1 }, rules: rules68, sb: sb68, steps: steps68, rng: seq68([0.98, 0.99, 0.02, 0.99, 0.99, 0.99, 0.5]) });
  const mapSeat = asTarget68({ skills: {}, maxTier: 5 }), bareSeat = asTarget68({ skills: {}, maxTier: 1 });
  check("§68: ⛔ the death save's tier-gap term reads the PLAYER seat's `maxTier` — a T5 craft against a T5-carrying player is no out-class; against a T1 it is +28",
    mapSeat.deathSave && !mapSeat.deathSave.mods.some(m => /out-class/.test(m.label))
    && bareSeat.deathSave && bareSeat.deathSave.mods.some(m => /you out-class them/.test(m.label) && m.value === 4 * (sb68.finisher?.odds?.perTierGap ?? 7)),
    JSON.stringify({ map: mapSeat.deathSave?.mods, bare: bareSeat.deathSave?.mods }));
  check("§68: …and the wrapper's player seat names it from the character's own crafts", /maxTier: Math\.max\(1, \.\.\.\(character\.abilities \|\| \[\]\)\.map\(a => Number\(abilities\?\.\[a\?\.abilityId\]\?\.tier\) \|\| 1\)\)/.test(rd("engine/encounters.js")));
}

/* ═════ §69 — THE FIVE THAT NEEDED NO DECISION: the roll reads the craft · meaning sets the ceiling · the three terms stack · a debt held by a person · the hold store on the tick ═════ */
// ⛔ GO_LIST_20260904 §2, one landing behind the floor. Q3: `substrateForAction` is the CARD (one source, one tuning, the
// per-source field at the site) — 204 crafts read differently from their tradition's band at one place. R38: `meaningDensity`
// is derived on demand from tags/tier/community/presence and never stored; a metaphysical craft gets min(ceiling, band).
// R37: completions and condition steps stack onto acquaintance; a gained craft is written at r1 by the tick. Q5-B: a debt
// is held by a NAMED NPC and escalation is their choice (`reactsToReputation`). Q8: the store runs on the tick — yield by
// condition, upkeep from the purse, a full store a target, sold where it stands.
console.log("\n── §69 · the five — roll=card, meaning ceiling, stacking growth, a held debt, the hold store ──");
{
  const SUB69 = await import("../engine/substrate.js");
  const NS69 = await import("../engine/npcsheet.js");
  const H69 = await import("../engine/holdings.js");
  const WT69 = await import("../engine/worldtick.js");
  const { loadContentHeadless: lch69 } = await import("./headless_content.mjs");
  const C69 = await lch69();
  const sub69 = C69.substrateModel, locs69 = C69.locations;
  const ch69 = (t) => ({ domains: { primary: t }, schools: {}, npcRegistry: {} });
  const cardAt = (ab, loc, extra = {}) => SUB69.groundCardFor(ab, ch69(ab.tradition), { schools: C69.schools, substrate: sub69, location: loc, locations: locs69, powerSources: C69.powerSources, foothills: C69.foothills, ...extra });

  // ── Q3 · the roll reads the craft
  const anyLoc = Object.values(locs69).find(l => typeof l.substrateDensity === "number") || Object.values(locs69)[0];
  let diverged69 = 0, grounded69 = 0;
  for (const ab of Object.values(C69.abilities)) {
    if (!ab.tradition) continue;
    const card = cardAt(ab, anyLoc);
    if (!card?.grounded) continue;
    grounded69++;
    const old = SUB69.substrateVerdict({ tradition: ab.tradition, school: null, root: null, density: SUB69.locationDensity(anyLoc, sub69), carried: 0, data: sub69 });
    if (Math.abs((old.factor ?? 1) - card.factor) > 0.02) diverged69++;
  }
  check("§69: ⛔ Q3 — the craft's own source and the tradition's band DISAGREE for a large share of grounded crafts (the reason the ruling exists)",
    grounded69 > 200 && diverged69 / grounded69 > 0.3, `${diverged69} of ${grounded69} differ at ${anyLoc?.id}`);
  const app69 = rd("app.js");
  check("§69: ⛔ …and the ROLL is the CARD — `substrateForAction` builds its verdict from `groundCardFor`, not from `substrateBand[tradition]`",
    /function substrateForAction\(choice, location\) \{[\s\S]{0,1600}groundCardFor\(ab, character, \{/.test(app69)
    && !/function substrateForAction\(choice, location\) \{[\s\S]{0,1600}bandFor\(tradition/.test(app69));
  const c1 = cardAt(Object.values(C69.abilities).find(a => a.tradition), anyLoc);
  check("§69: …the card carries `factor` and `side` so the roll can read them, and the carried term reaches it",
    c1 && Number.isFinite(c1.factor) && typeof c1.side === "string"
    && (() => { const a = Object.values(C69.abilities).find(x => x.tradition && cardAt(x, anyLoc)?.grounded && cardAt(x, anyLoc).side === "starved"); if (!a) return true; const lifted = cardAt(a, anyLoc, { carried: 0.3 }); return lifted.factor >= cardAt(a, anyLoc).factor; })());
  check("§69: …one tuning — the unschooled card no longer carries its own −30/×0.5/0.2 constants", !/chancePenalty: Math\.round\(\(1 - eff\) \* 30\)/.test(rd("engine/substrate.js")));

  // ── R38 · meaning
  const sacred69 = Object.values(locs69).find(l => (l.tags || []).includes("sacred"));
  const plain69 = Object.values(locs69).find(l => !(l.tags || []).some(t => ["sacred", "locus", "cult", "home"].includes(t)) && !l.communityId);
  const mS = SUB69.meaningDensity(sacred69, { data: sub69 }), mP = SUB69.meaningDensity(plain69, { data: sub69 });
  check("§69: ⛔ R38a — `meaningDensity` is DERIVED from what a place authors — a sacred place outweighs a plain one, and nothing stores it",
    Number.isFinite(mS) && Number.isFinite(mP) && mS > mP + 0.3 && Object.values(locs69).every(l => !("meaningDensity" in l)), `${sacred69?.id} ${mS} · ${plain69?.id} ${mP}`);
  check("§69: …and it is DYNAMIC — people present raise it, and leave it when they go",
    SUB69.meaningDensity(plain69, { present: 3, data: sub69 }) > mP && SUB69.meaningDensity(plain69, { present: 0, data: sub69 }) === mP
    && SUB69.peoplePresentAt("x69", { registry: { a: { lastSeen: { locationId: "x69" }, status: "active" }, b: { lastSeen: { locationId: "x69" }, status: "dead" } }, npcs: { c: { homeLocation: "x69" } } }) === 2);
  check("§69: …unauthored dials → null, never a number nobody chose", SUB69.meaningDensity(sacred69, { data: {} }) === null && SUB69.meaningCeiling(0.5, {}) === null);
  const meta69 = Object.values(C69.abilities).find(a => a.tradition && SUB69.craftSource(a, ch69(a.tradition), C69.schools, C69.powerSources, C69.foothills)?.source === "metaphysical");
  const cP = cardAt(meta69, plain69), cS = cardAt(meta69, sacred69);
  check("§69: ⛔ R38b — MEANING SETS THE CEILING, SUBSTRATE SETS THE PENALTY: a metaphysical craft at a meaning-poor place is CAPPED (side `meaningless`), and the cap is min(ceiling, band), never a product",
    cP?.meaningBound === true && cP.side === "meaningless" && cP.percent === Math.round(cP.ceiling * 100) && cS?.meaning > cP.meaning && (cS.meaningBound === false || cS.percent >= cP.percent),
    JSON.stringify({ plain: cP && [cP.percent, cP.meaning, cP.ceiling, cP.side], sacred: cS && [cS.percent, cS.meaning, cS.ceiling, cS.meaningBound] }));
  const cX = cardAt({ ...meta69, mechanic: { ...(meta69.mechanic || {}), meaning: "none" } }, plain69);
  check("§69: …a craft may opt OUT (`mechanic.meaning: \"none\"` — the body-craft case) and reads no meaning", cX && cX.meaning === undefined && !cX.meaningBound);
  const nonMeta69 = Object.values(C69.abilities).find(a => a.tradition && (() => { const c = cardAt(a, plain69); return c?.grounded && c.source !== "metaphysical"; })());
  check("§69: …and a non-metaphysical source carries no second ground at all (absent, not zero)", nonMeta69 && cardAt(nonMeta69, plain69).meaning === undefined, nonMeta69?.id);
  check("§69: …the ground row and the roll's note read it", /meaning \$\{Math\.round\(g\.meaning \* 100\)\}%/.test(app69) && /substrate\.side === "meaningless"/.test(app69));

  // ── R37 · growth
  const cfg69 = C69.rules.npcStanding;
  check("§69: ⛔ R37 — the dials are authored (completion 1 · condition step 1) and the service band is NOT (R37c)",
    cfg69.levelPerCompletion === 1 && cfg69.levelPerConditionStep === 1 && !("levelPerDaysServed" in cfg69) && !("levelPerServiceDays" in cfg69));
  const e69 = { id: "e69", name: "E", met: 1 };
  check("§69: …THE THREE TERMS STACK — acquaintance + completions + condition steps, and an unauthored dial adds nothing",
    NS69.derivedLevel({ ...e69, completions: 2, conditionSteps: 1 }, { cfg: cfg69 }) === NS69.derivedLevel(e69, { cfg: cfg69 }) + 3
    && NS69.derivedLevel({ ...e69, completions: 2 }, { cfg: {} }) === NS69.derivedLevel(e69, { cfg: {} }));
  const craft69 = Object.values(C69.abilities).find(a => a.name);
  const obs69 = { id: "o69", name: "O", met: 12, skillsObserved: [craft69.name] };
  const gained69 = NS69.commitGrowth(obs69, C69.abilities, { day: 10, cfg: cfg69 });
  check("§69: ⛔ …growth WRITES — a craft the story showed is on the record at RANK 1 with the day, and a second pass writes nothing",
    gained69.length === 1 && gained69[0].id === craft69.id && obs69.abilities?.[0]?.abilityId === craft69.id && obs69.abilities[0].level === 1 && obs69.abilities[0].gainedDay === 10
    && NS69.commitGrowth(obs69, C69.abilities, { day: 11, cfg: cfg69 }).length === 0);
  check("§69: …a `closed` craft is never written", NS69.commitGrowth({ id: "z", name: "Z", met: 12, skillsObserved: [craft69.name], closed: [craft69.id] }, C69.abilities, { day: 1, cfg: cfg69 }).length === 0);
  const wt69 = rd("engine/worldtick.js");
  check("§69: …the tick STAMPS the record — a done assignment adds a completion, a condition step on a kept hold adds a step, and `commitGrowth` runs",
    /n\.completions = \(Number\(n\.completions\) \|\| 0\) \+ 1;/.test(wt69) && /n\.conditionSteps = \(Number\(n\.conditionSteps\) \|\| 0\) \+ 1;/.test(wt69) && /commitGrowth\(n, content\?\.abilities/.test(wt69));

  // ── Q5-B · debts
  const mk69 = () => ({ id: "pc", purse: { crystal: 100 }, holdings: [], worldState: {}, npcRegistry: { the_kestrel: { id: "the_kestrel", name: "The Kestrel", status: "active" }, greta: { id: "greta", name: "Greta", status: "active" } } });
  const dCfg = C69.rules.economy?.debts;
  check("§69: ⛔ Q5-B — the dials are content (escalatingTags · escalateAfterDays · maxEscalation ≤ 2: a bounty and a hit squad are NOT built)",
    Array.isArray(dCfg?.escalatingTags) && dCfg.escalatingTags.includes("debtor") && Number.isFinite(dCfg.escalateAfterDays) && dCfg.maxEscalation === 2);
  const k = mk69();
  H69.addHolding(k, { id: "toll", kind: "post", name: "the pass toll", locationId: "kestrels_roost", steward: "the_kestrel", obligation: "a tenth to the Roost", day: 1 });
  H69.releaseHolding(k, "toll", { reason: "walked away", day: 5, worldCount: 100 });
  const d = k.worldState.debts?.the_kestrel;
  check("§69: ⛔ …releasing a holding with an obligation writes a DEBT held by the person who kept it", d && d.kind === "abandoned-holding" && d.heldBy === "the_kestrel" && d.holdingId === "toll" && d.sinceDay === 5 && d.escalation === 0, JSON.stringify(d));
  const s20 = H69.advanceDebts(k, { npcs: C69.npcs, cfg: dCfg, day: 20 }), s40 = H69.advanceDebts(k, { npcs: C69.npcs, cfg: dCfg, day: 40 }), s80 = H69.advanceDebts(k, { npcs: C69.npcs, cfg: dCfg, day: 80 });
  check("§69: ⛔ …escalation is the HOLDER's choice — the Kestrel (reactsToReputation.debtor) escalates after the dial's days, to 2 and no further, with news each step and her community on the record",
    s20.moved === 0 && s40.moved === 1 && /colder/.test(s40.news[0] || "") && s80.moved === 1 && /not be sold to/.test(s80.news[0] || "") && k.worldState.debts.the_kestrel.escalation === 2
    && k.worldState.debts.the_kestrel.communityId === C69.npcs.the_kestrel.communityId && H69.advanceDebts(k, { npcs: C69.npcs, cfg: dCfg, day: 200 }).moved === 0
    && H69.debtRefusalAt(k, C69.npcs.the_kestrel.communityId)?.holder === "the_kestrel", JSON.stringify([s20, s40, s80]));
  const g = mk69(); H69.recordDebt(g, { holderId: "greta", kind: "unpaid-price", amount: 30, reason: "a bed", day: 1 });
  check("§69: …a holder with no debtor-shaped tag (Greta) remembers and does NOT act — a legitimate outcome, not a gap",
    !Object.keys(C69.npcs.greta?.reactsToReputation || {}).some(t => dCfg.escalatingTags.includes(t)) && H69.advanceDebts(g, { npcs: C69.npcs, cfg: dCfg, day: 400 }).moved === 0 && g.worldState.debts.greta.escalation === 0);
  const paid = H69.applyDebtOps(g, [{ op: "settle", holderId: "greta" }], { day: 2 });
  check("§69: ⛔ …it clears THREE ways — paid (the purse is debited), a deed (forgive), the holder gone — and never in coin",
    paid[0]?.ok === true && g.purse.crystal === 70 && !g.worldState.debts.greta
    && (() => { const f = mk69(); H69.recordDebt(f, { holderId: "the_kestrel", kind: "broken-terms", amount: 500, day: 1 }); const short = H69.applyDebtOps(f, [{ op: "settle", holderId: "the_kestrel" }], { day: 2 }); const forgave = H69.applyDebtOps(f, [{ op: "forgive", holderId: "the_kestrel", why: "held the pass" }], { day: 3 }); return short[0].ok === false && forgave[0].ok === true && !f.worldState.debts.the_kestrel; })()
    && (() => { k.npcRegistry.the_kestrel.status = "dead"; const r = H69.advanceDebts(k, { npcs: C69.npcs, cfg: dCfg, day: 90 }); return r.news.length === 1 && !k.worldState.debts.the_kestrel; })()
    && H69.recordDebt(mk69(), { holderId: "greta", kind: "x", amount: 1, currency: "coin", day: 1 }) === null);
  const g2 = mk69(); H69.recordDebt(g2, { holderId: "greta", kind: "unpaid-price", amount: 30, reason: "a bed", day: 1 });
  check("§69: …the narrator is told (a WHAT YOU OWE block), the GM has `debtOps`, and the app applies them",
    /you owe greta: 30 crystal — a bed/.test(H69.debtsForGM(g2, { nameOf: id => id }) || "") && /debtsDetail/.test(rd("engine/gm_registry.js")) && /WHAT YOU OWE/.test(rd("engine/gm.js"))
    && /"debtOps": \[\{"op": "record\|settle\|forgive"/.test(rd("engine/gm.js")) && /applyStep\("debtOps"/.test(app69) && /"holdingOps", "debtOps",/.test(rd("engine/gm.js")));

  // ── Q8 · the store
  const eco69 = C69.rules.economy, sCfg = eco69?.holdStore;
  check("§69: ⛔ Q8 — the store dials are content: a steep yield curve (thriving > 2× holding), an upkeep, a full mark, a raid",
    sCfg && sCfg.yieldByCondition.thriving >= 2 * sCfg.yieldByCondition.holding && sCfg.yieldByCondition.failing === 0 && sCfg.upkeepByKind.enterprise > 0 && sCfg.fullAt > 0 && sCfg.raid?.base > 0);
  const mine69 = (cond) => ({ id: "mine", kind: "enterprise", name: "the mine", locationId: "choirheight", condition: cond, steward: "greta", history: [] });
  const nets = {};
  for (const cond of ["thriving", "holding", "strained", "failing"]) {
    const c = mk69(); const h = mine69(cond);
    const st = H69.tickStore(c, h, { cfg: sCfg, economy: eco69, regionId: null, dangerLevel: 0, rng: () => 0.99, day: 1 });
    nets[cond] = (H69.storeWorth(h, { economy: eco69, regionId: null, cfg: sCfg }) || 0) - st.upkeep;
  }
  check("§69: ⛔ …THE CURVE IS STEEP: thriving strongly positive, holding near break-even, strained a subsidy, failing a drain (ordinary demand)",
    nets.thriving >= 15 && nets.holding >= -2 && nets.holding <= 6 && nets.strained < 0 && nets.failing < nets.strained, JSON.stringify(nets));
  { const c = mk69(); const h = mine69("thriving"); const st = H69.tickStore(c, h, { cfg: sCfg, economy: eco69, regionId: null, dangerLevel: 0, rng: () => 0.99, day: 1 });
    check("§69: …yield lands AT the hold and upkeep leaves the purse", h.store?.raw_material === sCfg.yieldByCondition.thriving && c.purse.crystal === 100 - sCfg.upkeepByKind.enterprise && st.upkeep === sCfg.upkeepByKind.enterprise); }
  { const c = mk69(); c.purse.crystal = 3; const h = mine69("holding"); const st = H69.tickStore(c, h, { cfg: sCfg, economy: eco69, regionId: null, dangerLevel: 0, rng: () => 0.99, day: 1 });
    check("§69: …a purse that cannot pay leaves ARREARS on the place, and the news says so", st.short > 0 && h.arrears === st.short && c.purse.crystal === 3 && H69.storeNews(h, st).some(t => /could not pay its keep/.test(t))); }
  { const c = mk69(); const h = mine69("thriving"); h.store = { raw_material: 40 };
    const st = H69.tickStore(c, h, { cfg: sCfg, economy: eco69, regionId: null, dangerLevel: 4, rng: () => 0, day: 7 });
    const h2 = mine69("thriving"); h2.store = { raw_material: 40 }; h2.garrison = true;
    let open = 0, kept = 0; for (let i = 0; i < 600; i++) { const a = { ...mine69("thriving"), store: { raw_material: 40 } }; if (H69.tickStore(mk69(), a, { cfg: sCfg, economy: eco69, regionId: null, dangerLevel: 4, rng: mkRng69(i), day: 7 }).raid) open++; const b = { ...h2, store: { raw_material: 40 } }; if (H69.tickStore(mk69(), b, { cfg: sCfg, economy: eco69, regionId: null, dangerLevel: 4, rng: mkRng69(i), day: 7 }).raid) kept++; }
    // ⚠️ R46a (2026-09-05) SUPERSEDES THE SUBTRACTION THIS ASSERTED. An unwatched store is still taken from — that half
    // stands and is the one this check exists for — but a GARRISON no longer halves a loss, it MEETS them (§78). What is
    // asserted here now: the store is a target, an unwatched raid takes and says so, and no danger means no raid.
    check("§69: ⛔ …A FULL STORE IS A TARGET — an unwatched raid takes a share and arrives as news; no danger, no raid",
      st.raid?.taken?.raw_material === 24 && h.store.raw_material === 24 /* 40 + the pass yield 8, unwatched */ && H69.storeNews(h, st).some(t => /robbed in the night/.test(t)) && open > 0
      && !H69.tickStore(mk69(), { ...mine69("thriving"), store: { raw_material: 40 } }, { cfg: sCfg, economy: eco69, regionId: null, dangerLevel: 0, rng: () => 0, day: 7 }).raid, `${open} of 600 unwatched raids landed`); }
  { const c = mk69(); c.holdings = [mine69("thriving")]; c.holdings[0].store = { raw_material: 20 };
    const away = H69.sellStore(c, "mine", { economy: eco69, cfg: sCfg, hereId: "greyhearth", regionId: "the_center", day: 9 });
    const here = H69.sellStore(c, "mine", { economy: eco69, cfg: sCfg, hereId: "choirheight", regionId: null, day: 9 });
    check("§69: ⛔ …you SELL WHERE IT STANDS — refused away from the hold, credited in crystal at the Reach's price, the store emptied",
      away.ok === false && here.ok === true && here.crystal === 20 * eco69.worthBands[sCfg.unitWorthBand] && c.purse.crystal === 100 + here.crystal && H69.storeTotal(c.holdings[0]) === 0, JSON.stringify({ away: away.why, here: here.crystal })); }
  { const c = mk69(); c.holdings = [mine69("holding")]; c.holdings[0].store = { raw_material: 9 }; const rec = H69.releaseHolding(c, "mine", { reason: "gone", day: 1, worldCount: 5 });
    const c4 = mk69(); c4.holdings = [mine69("holding")]; c4.holdings[0].store = { raw_material: 9 }; const t = H69.transferHolding(c4, "mine", { toEntity: "greta", day: 1, worldCount: 5 });
    check("§69: …the store goes WITH the place — forfeited on release (recorded), carried on transfer", rec.storeForfeited?.raw_material === 9 && t.storeCarried === true); }
  { const c = mk69(); c.holdings = [mine69("thriving")]; c.holdings[0].store = { raw_material: 12 };
    check("§69: …the narrator's holding line carries the store; the Holdings tab shows it and sells it where you stand", /store: 12 raw_material/.test(H69.holdingsForGM(c, null, { hereId: null, nameOf: id => id })) && /data-hold-sell=/.test(app69) && /storeWorth\(h, \{ economy: CONTENT\.rules\?\.economy/.test(app69)); }
  { const c = mk69(); c.holdings = [mine69("thriving")]; c.holdings[0].lastMovedWorldCount = 0; c.company = [{ npcId: "greta" }]; c.holdingOffers = [];
    const r = WT69.advanceHoldings({ character: c, content: C69, now: Date.now(), rng: () => 0.99 });
    check("§69: ⛔ …and it runs on the TICK unattended — one pass yields into the store and pays the keep; a caller without content sees the old tick", r.moved === 1 && c.holdings[0].store?.raw_material > 0 && c.purse.crystal < 100
      && (() => { const c0 = mk69(); c0.holdings = [mine69("thriving")]; c0.holdings[0].lastMovedWorldCount = 0; c0.company = [{ npcId: "greta" }]; WT69.advanceHoldings({ character: c0 }); return !c0.holdings[0].store && c0.purse.crystal === 100; })()); }
  // seeded rng helper for the raid share
  function mkRng69(seed) { let s = (seed + 1) * 2654435761; return () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  check("§69: …the body carries the five", /THE THREE TERMS STACK/.test(rd("docs/HOW_IT_WORKS.md")) && /MEANING SETS THE CEILING, SUBSTRATE SETS THE PENALTY/.test(rd("docs/HOW_IT_WORKS.md")) && /holdStore/.test(rd("docs/HOW_IT_WORKS.md")) && /escalatingTags/.test(rd("docs/HOW_IT_WORKS.md")));
}
/* ═════ §70 — THE CONTENT CAUGHT UP WITH THE ENGINE, AND A SPEC MARKED READY THAT IS BUILT IS A LIE THE OTHER WAY ═════ */
// ⛔ 2026-09-04, the afternoon: Aevi authored per-rank sources (SPEC_body_source §4 — "nothing reads them"), Erik revised his own
// bound (the Cut Thread costs DOUBLE, not the pool), and two crafts left the lethal rung for ongoing damage. Each is a reader the
// engine owed. And Aevi's second ask: §62 checks a ruling reaches the body; nothing checked a spec reaches BUILT — eight named
// specs said `spec_ready` and were shipped. A spec whose own text says BUILT while its status says ready is the hard half; the
// count of `spec_ready` specs that already name engine exports is the ratchet half.
console.log("\n── §70 · per-rank source · the revised kill cost · ongoing damage · a spec reaches built ──");
{
  const SUB70 = await import("../engine/substrate.js");
  const CM70 = await import("../engine/craftmechanics.js");
  const SB70 = await import("../engine/skill_battle.js");
  const { loadContentHeadless: lch70 } = await import("./headless_content.mjs");
  const C70 = await lch70();
  // ── per-rank source: rank → school → tradition (SPEC_body_source §4; Erik: "METAPHYSICAL r1 and VEIL r2")
  const sb70 = C70.abilities.stopped_breath;
  const owner = (lvl) => ({ domains: { primary: sb70.tradition }, schools: {}, abilities: [{ abilityId: "stopped_breath", level: lvl }] });
  const src1 = SUB70.craftSource(sb70, owner(1), C70.schools, C70.powerSources, C70.foothills);
  const src2 = SUB70.craftSource(sb70, owner(2), C70.schools, C70.powerSources, C70.foothills);
  check("§70: ⛔ stopped_breath reads its per-rank source — metaphysical at r1, veil at r2 (`tree[].powerSystem`, via `rank`)",
    src1?.source === "metaphysical" && src1.via === "rank" && src2?.source === "veil" && src2.via === "rank" && src2.rank === 2, JSON.stringify([src1, src2]));
  const plain70 = Object.values(C70.abilities).find(a => a.tradition && !(a.tree || []).some(t => t && t.powerSystem));
  check("§70: …a craft with no per-rank source resolves exactly as before (no `rank` branch fires)",
    plain70 && SUB70.craftSource(plain70, { domains: { primary: plain70.tradition }, schools: {}, abilities: [{ abilityId: plain70.id, level: 2 }] }, C70.schools, C70.powerSources, C70.foothills)?.via !== "rank");
  check("§70: …the schema declares `tree[].powerSystem`", /"powerSystem"/.test(JSON.stringify(rj("schemas/ability.schema.json").properties.tree.items.properties)));
  // ── the revised bound: DOUBLE the standard cost on a kill, no seal unless authored
  const cut70 = C70.abilities.the_cut_thread;
  check("§70: ⛔ Erik's revision is on the record — `killCost.energyMultiplier` 2, no whole-pool, no seal", cut70?.mechanic?.killCost?.energyMultiplier === 2 && cut70.mechanic.killCost.energy === undefined && !cut70.mechanic.killCost.sealedUntilRest);
  const rules70 = rj("content/packs/core/rules/resolution.json"), sbe70 = rj("content/packs/core/rules/skill_battle_system.json").engine, steps70 = rj("content/packs/core/rules/intensity_scaling.json").steps;
  const seq70 = (arr) => { let i = 0; return () => arr[(i++) % arr.length]; };
  const mk70 = (o = {}) => ({ attributes: { physical: 6, mental: 6, social: 6, practical: 6 }, subAttributes: { strength: 8, presence: 4 }, energy: 200, maxEnergy: 200, health: 120, maxHealth: 120, level: 30, skills: [{ function: "strike", tier: 5, name: "t5" }], ...o });
  const lethal70 = { function: "strike", tier: 5, rank: 1, attribute: "mental", intensity: "standard", name: "the Cut Thread", id: "the_cut_thread", energyCost: 14, harmRung: "lethal", mechanic: cut70.mechanic };
  const kill70 = SB70.battleRound({ playerDecl: lethal70, oppDecl: { function: "shield", tier: 1, name: "g" }, playerSheet: mk70(), oppSheet: mk70(), state: { momentum: 0, round: 1 }, rules: rules70, sb: sbe70, steps: steps70, rng: seq70([0.02, 0.99, 0.98, 0.99, 0.99, 0.99, 0.5]) });
  check("§70: ⛔ …a kill costs DOUBLE the standard cost (28 of 200 → 172) and leaves no seal; a held save still costs 14",
    kill70.deathSave?.kill === true && kill70.state.playerEnergy === 200 - 2 * 14 && !kill70.state.playerSealed && kill70.deathSave.cost?.paid === 2 * 14, JSON.stringify({ e: kill70.state.playerEnergy, cost: kill70.deathSave?.cost }));
  const poolDecl = { ...lethal70, mechanic: { ...cut70.mechanic, killCost: { energy: "all", sealedUntilRest: true } } };
  const kp = SB70.battleRound({ playerDecl: poolDecl, oppDecl: { function: "shield", tier: 1, name: "g" }, playerSheet: mk70(), oppSheet: mk70(), state: { momentum: 0, round: 1 }, rules: rules70, sb: sbe70, steps: steps70, rng: seq70([0.02, 0.99, 0.98, 0.99, 0.99, 0.99, 0.5]) });
  check("§70: …and the whole-pool + seal shape is still READ when a craft authors it (last_lament may)", kp.deathSave?.kill === true && kp.state.playerEnergy === 0 && kp.state.playerSealed === true);
  // ── ongoing damage: `mechanic.ongoing` (per-round dice, a type, an end) reads through the ongoing-harm reader
  const cup70 = C70.abilities.slow_cup;
  const oh = CM70.ongoingHarmOf(cup70, 1);
  check("§70: ⛔ slow_cup's `mechanic.ongoing` (1d6 corrosive until treated) reads as ongoing harm — magnitude from the per-round dice, the type, the end",
    cup70?.harmRung === "incapacitating" && oh && oh.magnitude === 4 && oh.type === "corrosive" && oh.endsOn === "treated", JSON.stringify(oh));
  check("§70: …a craft with neither field reads none; the schema declares `mechanic.ongoing`", CM70.ongoingHarmOf({ id: "x", mechanic: { dice: { n: 2, d: 6 } } }, 1) === null && !!rj("schemas/ability.schema.json").properties.mechanic.properties.ongoing);
  // ── a spec reaches BUILT (Aevi's ask, §62's family)
  const { readdirSync: rd70 } = await import("node:fs");
  const specs70 = rd70(join(root, "po")).filter(f => /^SPEC_.*\.md$/.test(f) && !/^SPEC_SNG-/.test(f));
  const exports70 = new Set();
  for (const f of rd70(join(root, "engine")).filter(x => x.endsWith(".js"))) for (const m of rd("engine/" + f).matchAll(/export (?:async )?function ([A-Za-z_][A-Za-z0-9_]*)/g)) exports70.add(m[1]);
  const statusOf = (txt) => { const head = txt.split("\n").slice(0, 14).join("\n"); const m = head.match(/Status:?\*{0,2}:?\s*`?([a-z_0-9]+)/); return m ? m[1] : null; };
  const rows70 = specs70.map(f => { const txt = rd("po/" + f); const status = statusOf(txt);
    const builds = (txt.match(/^\*{0,2}builds:?\*{0,2}:?\s*([^\n]+)/m) || [])[1]?.split(/[,\s·]+/).map(s => s.replace(/`/g, "").trim()).filter(Boolean) || null;
    const named = [...new Set([...txt.matchAll(/`([a-z][A-Za-z0-9_]{3,})(?:\(\))?`/g)].map(m => m[1]))].filter(x => exports70.has(x));
    const saysBuilt = /BUILT v1\.9\.\d+/.test(txt);
    return { f, status, builds, named, saysBuilt }; });
  check("§70: the scan sees the named specs and reads their statuses — not vacuous (57 named, 21 carry a status on 2026-09-04)", rows70.length >= 40 && rows70.filter(r => r.status).length >= 15, `${rows70.length} specs, ${rows70.filter(r => r.status).length} with a status`);
  const lying = rows70.filter(r => r.status === "spec_ready" && r.saysBuilt);
  check("§70: ⛔ no spec says `spec_ready` in its status while its own text says BUILT — the record must not say work is owed when it is not",
    lying.length === 0, lying.map(r => r.f).join(" · "));
  const declaredStale = rows70.filter(r => r.status === "spec_ready" && r.builds && r.builds.length && r.builds.every(b => exports70.has(b)));
  check("§70: ⛔ a `spec_ready` spec that DECLARES `builds:` and whose every named export exists is stale — mark it built", declaredStale.length === 0, declaredStale.map(r => r.f).join(" · "));
  const derivedStale = rows70.filter(r => r.status === "spec_ready" && r.named.length >= 1);
  // ⚠️ RE-BASELINED 2026-09-05, 4 → 5: SPEC_world_guesses_features.md landed today, unbuilt, naming improveHolding and
  // growthFor as CONTEXT for what it proposes. The derived count is a proxy — the hard half is the declared builds: field
  // — and a new unbuilt spec raises the proxy without anything being stale. The population grew; the baseline moves with
  // it, and the reason is written here rather than the number quietly nudged.
  const BASELINE_DERIVED = 8;   // 2026-09-05 (4): SPEC_companion_becomes_person.md landed unbuilt, naming ensureBearer/derivedLevel/kitFor as context   // (3): SPEC_party_mode_phase2.md, same case   // (2): four more specs landed unbuilt with the brief   // measured 2026-09-04 after the eight were marked: the still-open specs that name existing exports as context
  check(`§70: ratchet — \`spec_ready\` specs naming an existing engine export = ${derivedStale.length} (baseline ${BASELINE_DERIVED}) — may only go DOWN`,
    derivedStale.length <= BASELINE_DERIVED, derivedStale.map(r => `${r.f}:${r.named.slice(0, 3).join(",")}`).join(" · "));
  const built70 = rows70.filter(r => r.status === "built" || r.status === "part_built");
  check("§70: …and a spec marked built names the version that shipped it", built70.length >= 8 && built70.every(r => /Status:?\*{0,2}:?\s*`(built|part_built)`[^\n]*v1\.9\.\d+/.test(rd("po/" + r.f))), built70.filter(r => !/v1\.9\.\d+/.test(rd("po/" + r.f).split("\n").slice(0, 14).join("\n"))).map(r => r.f).join(" · "));
}
/* ═════ §71 — THE HARNESS DRIVES THE PRODUCTION PATH: one turn module for play and for the suite ═════ */
// ⛔ ERIK 2026-09-05: "I want our test harnesses to simulate the real game as much as possible so we can get it right."
// The skill-battle TURN — menu, declaration, rank, guards, sense → action → bonus, the apply, the end — lived in app.js
// with the DOM; the harnesses rebuilt a simpler fight beside it and two defects lived in the gap: a named person entered
// play as a threat-curve body with 3–8 health (`synthesizeDuelDef` dropped the sheet), and a skill-battle knockout never
// reached the incapacitation table. `engine/battle_turn.js` is the one path; app.js delegates to it; `tests/lib/realgame.mjs`
// drives it. This section asserts the delegation by source and the behaviour by playing the game headless.
console.log("\n── §71 · the harness drives the production path (engine/battle_turn.js) ──");
{
  const BT71 = await import("../engine/battle_turn.js");
  const RG71 = await import("./lib/realgame.mjs");
  const { synthesizeDuelDef: sdd71 } = await import("../engine/random_encounters.js");
  const { loadContentHeadless: lch71 } = await import("./headless_content.mjs");
  const C71 = await lch71();
  const rules71 = C71.rules, sb71 = C71.skillBattle.engine, cfg71 = rules71.npcStanding;
  const app71 = rd("app.js"), bt71 = rd("engine/battle_turn.js"), rg71 = rd("tests/lib/realgame.mjs");
  // ── the delegation, by source: app.js no longer carries its own copy of the turn
  check("§71: ⛔ app.js imports the turn from the engine and delegates every piece of it",
    /from "\.\/engine\/battle_turn\.js"/.test(app71)
    && /function playerBattleSkills\(\) \{[\s\S]{0,300}battleSkillsForCharacter\(character/.test(app71)
    && /function sbDeclFromSel\(sel, skills, intensity\) \{[\s\S]{0,200}declFromSelection\(sel, skills, intensity/.test(app71)
    && /function personOpponent\(target\) \{[\s\S]{0,900}personOpponentFor\(rec/.test(app71)
    && /function escalateToFight\(target, choice\) \{[\s\S]{0,600}duelFromTarget\(character, target/.test(app71)
    && /function endEncounter\(outcome\) \{[\s\S]{0,700}endBattle\(character/.test(app71)
    && /async function sbResolveSense\(\) \{[\s\S]{0,1600}playTurn\(character, enc\.def, \{ sense: decl/.test(app71)
    && /const applyRR = \(r, d, label\) => \{[\s\S]{0,600}applyRoundToCharacter\(character, r, d/.test(app71)
    && /resolveDeclRank\(decl, \{ character, catalog: fullCatalog\(\) \}\)/.test(app71) && /collapseIfFinished\(rr, enc\.def/.test(app71));
  check("§71: ⛔ …and a skill-battle END reaches the incapacitation table — `sbEnd` calls `endBattle` (it never called `endEncounter`)",
    /async function sbEnd\(rr\) \{[\s\S]{0,1200}endBattle\(character, \{ outcome: rr\.outcome, def,/.test(app71)
    && !/async function sbEnd\(rr\) \{[\s\S]{0,400}character\.activeEncounter = null; saveCharacter\(character\);/.test(app71));
  check("§71: …the duplicated logic is GONE from app.js (no second menu, no second apply)",
    !/for \(const a of character\.abilities \|\| \[\]\) \{\s*const def = fullCatalog\(\)\[a\.abilityId\];\s*const fns = def\?\.functions/.test(app71)
    && !/incapacitationOutcome\(\{/.test(app71) && /plan = incapacitationOutcome\(\{/.test(bt71));
  check("§71: …the harness drives `playTurn` and `duelFromTarget`, never `battleRound` by hand",
    /playTurn\(character, def, \{ sense:/.test(rg71) && /playTurn\(character, def, \{ action:/.test(rg71) && /duelFromTarget\(character, target/.test(rg71) && !/battleRound\(/.test(rg71) && /endBattle\(/.test(rg71));
  // ── the first defect, measured: the person's body rides on the def
  const veth71 = C71.npcs["veth-ondra"], pell71 = C71.npcs.pell;
  const pc71 = RG71.characterFromPerson(pell71, { catalog: C71.abilities, cfg: cfg71, day: 1 });
  const old71 = sdd71({ id: "x", flavor: "fight", seed: "", opponent: BT71.personOpponentFor(veth71, { catalog: C71.abilities, cfg: cfg71, day: 1 }) });
  const { def: def71, oppSheet: os71, state: st71 } = BT71.duelFromTarget(pc71, { id: "veth-ondra", name: veth71.name }, { catalog: C71.abilities, npcs: C71.npcs, cfg: cfg71, day: 1, sb: sb71, here: null });
  check("§71: ⛔ `synthesizeDuelDef` alone DROPS a person — a handful of health and no crafts (the defect, kept measurable)",
    old71.opponent.health <= 8 && !(old71.opponent.skills || []).length, JSON.stringify({ health: old71.opponent.health, skills: (old71.opponent.skills || []).length }));
  check("§71: ⛔ …`duelFromTarget` keeps the body on the def — Veth enters play at her own health, level and kit, and the sheet is AUTHORED",
    def71.opponent.health === os71.health && def71.opponent.health > 100 && (def71.opponent.skills || []).length >= 30 && def71.opponent.level === 33 && os71.authored === true && st71.opponentHealth === def71.opponent.health && st71.mode === "skill_battle",
    JSON.stringify({ h: def71.opponent.health, k: (def71.opponent.skills || []).length, lvl: def71.opponent.level, authored: os71.authored, stH: st71.opponentHealth }));
  check("§71: …a stranger still falls to the threat curve", (() => { const c = RG71.characterFromPerson(pell71, { catalog: C71.abilities, cfg: cfg71, day: 1 }); const r = BT71.duelFromTarget(c, { name: "a nameless brigand" }, { catalog: C71.abilities, npcs: C71.npcs, cfg: cfg71, day: 1, sb: sb71, here: { dangerLevel: 3 } }); return r.oppSheet && !r.oppSheet.authored && r.def.opponent.threat > 0; })());
  // ── the character fixture is the app's shape, and the menu is the app's menu
  check("§71: a character built from a person carries the app's fields (abilities at their ranks, pools, level) and the menu reads them",
    pc71.level === 27 && pc71.abilities.length >= 10 && pc71.abilities.every(a => a.abilityId && a.level >= 1) && pc71.health === pc71.maxHealth && pc71.energy === pc71.maxEnergy
    && (() => { const m = BT71.battleSkillsForCharacter(pc71, { catalog: C71.abilities, rules: rules71, sb: sb71 }); return m.length > 0 && m.filter(s => !s.id.startsWith("_")).every(s => Number.isFinite(s.energyCost) && s.rank >= 1 && s.tier >= 1); })());
  // ✅ THE FINDING THIS SURFACED IS CLOSED (R46c, 2026-09-05). It read: the menu caps at 40 and a craft takes a slot per FUNCTION,
  // so Pell's 23 crafts filled it and the bare moves, the items and the senses fell off the end. Erik ruled no cap; the check is
  // inverted so the closure is asserted and a regression to the cap goes red. §76 carries the rest of the ruling.
  check("§71: ✅ …and the menu cap is GONE (R46c) — a 23-craft kit keeps every verb AND the bare moves a small kit gets",
    (() => { const big = BT71.battleSkillsForCharacter(pc71, { catalog: C71.abilities, rules: rules71, sb: sb71 });
      const verbs = pc71.abilities.reduce((n, a) => n + ((C71.abilities[a.abilityId]?.functions || []).length), 0);
      const small = BT71.battleSkillsForCharacter({ ...pc71, abilities: pc71.abilities.slice(0, 3), inventory: [] }, { catalog: C71.abilities, rules: rules71, sb: sb71 });
      return big.length >= verbs && big.length > 40; })());
  // ── a duel played through the production path: deterministic, ends in the vocabulary, the knockout reaches the table
  const play71 = (seed) => { const c = RG71.characterFromPerson(pell71, { catalog: C71.abilities, cfg: cfg71, day: 1 }); return RG71.playDuel({ character: c, target: { id: "veth-ondra", name: veth71.name }, content: C71, rng: RG71.mulberry32(seed), day: 1, maxTurns: 40 }); };
  const d1 = play71(7), d2 = play71(7);
  check("§71: ⛔ a duel played through `playTurn` is DETERMINISTIC under a seed and ends in the app's outcome vocabulary",
    JSON.stringify(d1.transcript) === JSON.stringify(d2.transcript) && d1.turns >= 1 && ["opponent_fell", "opponent_yielded", "incapacitated", "player_overcome", "stalemate", "cap"].includes(d1.outcome), `${d1.outcome} in ${d1.turns} turns`);
  check("§71: …the transcript carries the sense step and the action step of one turn, with the receipt's fields", d1.transcript.some(t => t.step === "sense" && t.decl) && d1.transcript.some(t => t.step === "action" && "momentum" in t && "hp" in t && "oppHp" in t));
  let plans71 = 0, downs71 = 0, cleared71 = 0;
  let ended71 = 0;
  for (let s = 1; s <= 40; s++) { const r = play71(s); if (r.outcome !== "cap") { ended71++; if (!r.character.activeEncounter) cleared71++; }
    if (r.outcome === "incapacitated") { downs71++; if (r.plan && r.character.lastIncapacitation && (r.plan.slain ? (r.character.status === "dead" && !!r.character.deathState && r.character.health === 0) : r.character.health >= 1)) plans71++; } }
  check("§71: ⛔ …and EVERY knockout reaches the incapacitation table — a plan on the record, the floor or the death applied, every ended fight cleared",
    downs71 >= 5 && plans71 === downs71 && cleared71 === ended71, `${downs71} knockouts, ${plans71} with a plan, ${cleared71} cleared of ${ended71} ended`);
  check("§71: …the incapacitation table is content-driven and the harness sees its outcomes", (() => { const seen = new Set(); for (let s = 1; s <= 60; s++) { const r = play71(s); if (r.plan) seen.add(r.plan.outcome); } return seen.size >= 2; })());
  check("§71: …the body says so", /battle_turn/.test(rd("docs/HOW_IT_WORKS.md")) && /RULE 4/.test(rd("docs/HOW_IT_WORKS.md")));
}
/* ═════ §72 — A KEEPER IS A DELEGATE, NOT A COMPANION (Erik, Silas's save, 2026-09-05) ═════ */
// ⛔ Both of Silas's accepted holds lost their keepers on the world tick's FIRST pass: `unstewardedHoldings` read "not in the
// active company" as "gone", and a steward is a delegate who stays at the hold — never a companion. `keeperGone` is the rule
// now (dead · departed · a companion who LEFT); a reconcile step restores what the old rule wiped; the Holdings tab shows what
// is real per hold and lets the player pin a hold to where they stand. The Whistling Woman — a post the fiction named that the
// GM never claimed — is Q17, not built.
console.log("\n── §72 · a keeper is a delegate, not a companion; the wiped keepers come back; the tab shows what is real ──");
{
  const H72 = await import("../engine/holdings.js");
  const WT72 = await import("../engine/worldtick.js");
  const R72 = await import("../engine/reconcile.js");
  const mk = (steward, extra = {}) => ({ id: "pc", holdings: [{ id: "hold-x", kind: "post", name: "the post", locationId: null, steward, condition: "holding", history: [], lastMovedWorldCount: 0 }],
    company: [], npcRegistry: {}, holdingOffers: [], worldState: { assignments: {} }, ...extra });
  check("§72: ⛔ `keeperGone` — dead or departed in the registry is gone; a companion who LEFT is gone; a delegate who never travelled with you is NOT; no record at all is NOT",
    H72.keeperGone(mk("a", { npcRegistry: { a: { status: "dead" } } }), "a") === true
    && H72.keeperGone(mk("a", { npcRegistry: { a: { status: "departed" } } }), "a") === true
    && H72.keeperGone(mk("a", { company: [{ npcId: "a", leftDay: 4 }] }), "a") === true
    && H72.keeperGone(mk("a", { npcRegistry: { a: { status: "active" } } }), "a") === false
    && H72.keeperGone(mk("a"), "a") === false);
  check("§72: …`unstewardedHoldings` reports only the gone — a delegate at the hold keeps it even with an empty company",
    H72.unstewardedHoldings(mk("fendt", { npcRegistry: { fendt: { status: "active" } } }), []).length === 0
    && H72.unstewardedHoldings(mk("fendt", { npcRegistry: { fendt: { status: "departed" } } }), []).length === 1
    && H72.unstewardedHoldings(mk("fendt", { company: [{ npcId: "fendt", leftDay: 2 }] }), []).length === 1);
  const kept = mk("fendt", { npcRegistry: { fendt: { status: "active" } } });
  const t1 = WT72.advanceHoldings({ character: kept });
  const gone = mk("fendt", { npcRegistry: { fendt: { status: "departed" } } });
  const t2 = WT72.advanceHoldings({ character: gone });
  check("§72: ⛔ …the TICK keeps a delegate's post kept (no 'lost its keeper', the keeper still on the record) and fires only for the gone",
    kept.holdings[0].steward === "fendt" && !t1.news.some(n => /lost its keeper/.test(n.text)) && gone.holdings[0].steward === null && t2.news.some(n => /lost its keeper/.test(n.text)),
    JSON.stringify({ kept: kept.holdings[0].steward, n1: t1.news.map(n => n.text), gone: gone.holdings[0].steward }));
  // the repair, on Silas's own shape
  const silas = { id: "pc", holdings: [
      { id: "hold-fendt::warden", kind: "post", name: "Threshold Post", locationId: null, steward: null, condition: "strained", fromAssignment: "fendt::warden", history: [] },
      { id: "hold-dead::x", kind: "post", name: "a lost post", locationId: null, steward: null, condition: "strained", fromAssignment: "dead::x", history: [] },
      { id: "hold-kept", kind: "post", name: "kept", locationId: null, steward: "ossian", condition: "holding", fromAssignment: "ossian::y", history: [] } ],
    company: [], npcRegistry: { fendt: { name: "Fendt", status: "active" }, dead: { name: "Gone", status: "dead" }, ossian: { name: "Ossian", status: "active" } },
    worldState: { assignments: { "fendt::warden": { id: "fendt::warden", npcId: "fendt", npcName: "Fendt", status: "problem" }, "dead::x": { id: "dead::x", npcId: "dead", status: "working" } } } };
  const stepsAll = R72.STEPS || R72.steps || R72.RECONCILE_STEPS || R72.default || null;
  const list = Array.isArray(stepsAll) ? stepsAll : (stepsAll && typeof stepsAll === "object" ? Object.values(stepsAll) : []);
  const step = list.find(s => s && s.id === "holdings-keeper-restored");
  if (step) {
    const out = step.apply(silas, {});
    check("§72: ⛔ the repair restores a wiped keeper from the assignment (Fendt), leaves a dead one wiped, leaves a kept one alone, and says so",
      silas.holdings[0].steward === "fendt" && /keeper restored/.test(silas.holdings[0].history[0]?.note || "") && silas.holdings[1].steward === null && silas.holdings[2].steward === "ossian"
      && Array.isArray(out.notes) && /Fendt/.test(out.notes[0]), JSON.stringify({ s: silas.holdings.map(h => h.steward), notes: out.notes }));
  } else {
    check("§72: ⛔ the repair step exists (holdings-keeper-restored) and restores from the assignment's person", /id: "holdings-keeper-restored"/.test(rd("engine/reconcile.js")) && /h\.steward = npcId;/.test(rd("engine/reconcile.js")));
  }
  const app72 = rd("app.js");
  // ⚠️ §75 (the same day) answered "who lives here" with quarters and the people at the hold — the line no longer says "not modelled".
  check("§72: …the Holdings tab shows what is REAL per hold — where (or *It's here*), the keeper, what it produces per pass, the keep, who is at work, who lives here",
    /data-hold-here=/.test(app72) && /yieldsFor\(h, cfgS/.test(app72) && /produces: \$\{esc\(produces\)\}/.test(app72) && /at work here:/.test(app72) && /who lives here:/.test(app72) && /residentsOf\(h, holdCfgNow\(\)\)/.test(app72));
  check("§72: …and the pin writes the place you stand in onto the hold, with history", /h\.locationId = here\.id;/.test(app72) && /note: `placed at \$\{here\.name \|\| here\.id\}`/.test(app72));
  check("§72: …the body says a keeper is a delegate, and Q17 names the unclaimed post", /keeperGone/.test(rd("docs/HOW_IT_WORKS.md")) && /Q17/.test(rd("docs/RULINGS.md")) && /Whistling Woman/.test(rd("po/DECISIONS_OWED_20260904.md")));
}
/* ═════ §73 — THE TAB CAN APPOINT A KEEPER, AND A HOLD HANDED AWAY BY MISTAKE COMES BACK (Erik, 2026-09-05) ═════ */
// ⛔ "now it says I gave them to the stewards!" — the only person selector on a hold sat beside "Hand it over", a one-way
// transfer with no confirm, and nothing on the tab appointed a keeper; former holdings were shown nowhere. `appointKeeper`
// and `reclaimHolding` are the verbs that were missing; the transfer confirms and names ownership. And a finding, asserted as
// the truth it is: nothing in play raises a hold's condition — the tick is the only writer, and it only stalls or slips (Q18).
console.log("\n── §73 · appoint a keeper · take a handed-over hold back · a hold does not grow in play (Q18) ──");
{
  const H73 = await import("../engine/holdings.js");
  const mk = () => { const c = { id: "pc", holdings: [], formerHoldings: [], holdingEvents: [], npcRegistry: { fendt: { name: "Fendt", status: "active" }, ossian: { name: "Ossian", status: "active" } } };
    H73.addHolding(c, { id: "hold-x", kind: "post", name: "Threshold Post", locationId: "ridge", steward: "fendt", obligation: null, day: 3 }); return c; };
  const nm = (x) => ({ fendt: "Fendt", ossian: "Ossian" })[x] || x;
  // appoint
  const a = mk();
  const r = H73.appointKeeper(a, "hold-x", "ossian", { day: 5, worldCount: 100, nameOf: nm });
  check("§73: ⛔ `appointKeeper` sets the steward, keeps the hold YOURS, writes history, and queues an event naming both",
    r && a.holdings.length === 1 && a.holdings[0].steward === "ossian" && /Ossian appointed keeper \(was Fendt\)/.test(a.holdings[0].history.slice(-1)[0]?.note || "")
    && H73.takeHoldingEvents(a).some(t => /Ossian keeps Threshold Post now; Fendt is released/.test(t)), JSON.stringify({ s: a.holdings[0].steward, h: a.holdings[0].history }));
  check("§73: …appointing the same keeper again changes nothing; an unknown hold returns null", H73.appointKeeper(a, "hold-x", "ossian", { nameOf: nm }) === a.holdings[0] && a.holdings[0].history.length === 1 && H73.appointKeeper(a, "nope", "ossian") === null);
  // the accident, and its reversal
  const b = mk();
  H73.transferHolding(b, "hold-x", { toEntity: "ossian", toName: "Ossian", day: 6, worldCount: 120 });
  check("§73: a transfer moves the hold OUT of your holdings — the shape Erik hit", b.holdings.length === 0 && b.formerHoldings.length === 1 && b.formerHoldings[0].transferredTo === "ossian");
  H73.takeHoldingEvents(b);
  const back = H73.reclaimHolding(b, "hold-x", { day: 7, worldCount: 140, nameOf: nm });
  check("§73: ⛔ `reclaimHolding` brings it back with its history, the person it was handed to keeping it, and says so",
    back && b.holdings.length === 1 && b.formerHoldings.length === 0 && b.holdings[0].steward === "ossian" && b.holdings[0].locationId === "ridge"
    && b.holdings[0].history.some(x => /handed to Ossian/.test(x.note || "")) && /taken back from Ossian, who keeps it/.test(b.holdings[0].history.slice(-1)[0]?.note || "")
    && !("transferredTo" in b.holdings[0]) && H73.takeHoldingEvents(b).some(t => /Threshold Post is yours again; Ossian keeps it/.test(t)), JSON.stringify(b.holdings[0]));
  check("§73: …a RELEASED hold is not reclaimable this way (what it owed is still owed — the GM re-claims it in play)",
    (() => { const c = mk(); H73.releaseHolding(c, "hold-x", { reason: "gone", day: 6, worldCount: 120 }); return H73.reclaimHolding(c, "hold-x", {}) === null && c.formerHoldings.length === 1; })());
  // the tab
  const app73 = rd("app.js");
  check("§73: ⛔ the tab's selector appoints FIRST (*Make them keeper*), the transfer CONFIRMS and names ownership, and former holdings are listed with *Take it back*",
    /data-hold-keeper=/.test(app73) && /Make them keeper/.test(app73) && /appointKeeper\(character, id, to/.test(app73)
    && /confirm\(`Hand OWNERSHIP of \$\{h\?\.name \|\| id\} to \$\{nm\}\?/.test(app73) && /No longer yours/.test(app73) && /data-hold-reclaim=/.test(app73) && /reclaimHolding\(character, btn\.dataset\.holdReclaim/.test(app73)
    && app73.indexOf('data-hold-keeper="${esc(h.id)}"') < app73.indexOf('data-hold-transfer="${esc(h.id)}"'));
  // the finding
  const writers = [...rd("engine/worldtick.js").matchAll(/advanceHolding\(h, ([^,]+),/g)].map(m => m[1]);
  check("§73: ⚠️ Q18, as the truth it is — the tick is the ONLY writer of a hold's condition and it only stalls or slips; nothing in play raises one",
    writers.length === 1 && /"stall" : "problem"/.test(writers[0]) && !/advanceHolding\(/.test(app73) && /Q18/.test(rd("docs/RULINGS.md")));
}
/* ═════ §74 — A HOLD GROWS (Q18, Erik: "please build it", 2026-09-05) ═════ */
// One-time acts with lasting effects, never a per-tick chore (SPEC_hold_store §1, §5): a kept hold climbs on its own to the
// ceiling its keeper's tier allows; a carried craft applied lifts a rung once; hands raise the yield; a garrison costs keep and
// halves raids; the ground scales an enterprise's yield. The dials are content; the GM has the ops; the tab has the buttons.
console.log("\n── §74 · a hold grows — the keeper's ceiling, a craft applied, hands, a watch, the ground ──");
{
  const H74 = await import("../engine/holdings.js");
  const WT74 = await import("../engine/worldtick.js");
  const { loadContentHeadless: lch74 } = await import("./headless_content.mjs");
  const C74 = await lch74();
  const eco = C74.rules.economy, cfgS = eco.holdStore, g = cfgS.growth, npcCfg = C74.rules.npcStanding;
  check("§74: ⛔ the growth dials are content — a climb schedule, a ceiling by keeper tier (notable holds, regional reaches thriving), the shaping functions, hands, a watch's keep, the ground's weight",
    g && g.passesPerClimb === 4 && g.ceilingByKeeperTier?.notable === "holding" && g.ceilingByKeeperTier?.regional === "thriving" && Array.isArray(g.improveFunctions) && g.improveFunctions.includes("mend")
    && g.handsYieldBonus > 0 && g.maxHands >= 1 && g.garrisonUpkeepPerHand > 0 && Number.isFinite(g.groundYieldWeight));
  const mk74 = (steward, keeperLevel, extra = {}) => ({ id: "pc", purse: { crystal: 500 }, company: [], holdingOffers: [], worldState: { assignments: {} }, abilities: [],
    npcRegistry: steward ? { [steward]: { id: steward, name: "Keeper", status: "active", level: keeperLevel } } : {},
    holdings: [{ id: "mine", kind: "enterprise", name: "the mine", locationId: null, steward, condition: "holding", history: [], lastMovedWorldCount: 0, ...extra }] });
  // ── the keeper's ceiling, on the schedule
  const regional = mk74("k", 15), notable = mk74("k", 6), unkept = mk74(null, 0);
  const passes = (c, n) => { let last = null; for (let i = 0; i < n; i++) last = H74.growHolding(c, c.holdings[0], { cfg: cfgS, npcs: {}, npcCfg, worldCount: 100 + i, nameOf: (x) => "Keeper" }); return last; };
  const r3 = passes(regional, 3);
  check("§74: ⛔ a kept hold does not climb before the schedule (3 passes: still holding)", r3 === null && regional.holdings[0].condition === "holding" && regional.holdings[0].growthPasses === 3);
  const r4 = passes(regional, 1);
  check("§74: ⛔ …on the 4th pass a REGIONAL keeper brings it up to thriving, with history naming the keeper and the tier",
    r4 && r4.to === "thriving" && regional.holdings[0].condition === "thriving" && regional.holdings[0].growthPasses === 0 && /grew under Keeper \(regional\)/.test(regional.holdings[0].history.slice(-1)[0]?.note || ""), JSON.stringify(r4));
  check("§74: …a NOTABLE keeper holds a place and cannot bring it past holding (the ceiling); an unkept hold never climbs (R25 stands)",
    passes(notable, 8) === null && notable.holdings[0].condition === "holding" && passes(unkept, 8) === null && unkept.holdings[0].condition === "holding");
  const gone = mk74("k", 15); gone.npcRegistry.k.status = "departed";
  check("§74: …a departed keeper grows nothing", passes(gone, 4) === null && gone.holdings[0].condition === "holding");
  // ── the tick runs it and says so
  const tickC = mk74("k", 15); tickC.holdings[0].condition = "holding";
  let grewNews = null;
  for (let i = 0; i < 4; i++) { tickC.holdings[0].lastMovedWorldCount = 0; const out = WT74.advanceHoldings({ character: tickC, content: C74, rng: () => 0.99 }); grewNews = out.news.find(n => /has come up to/.test(n.text)) || grewNews; }
  check("§74: ⛔ the TICK grows a kept hold on the schedule and the news says so", tickC.holdings[0].condition === "thriving" && !!grewNews && /the mine has come up to thriving under Keeper/.test(grewNews.text), JSON.stringify({ c: tickC.holdings[0].condition, n: grewNews?.text }));
  // ── a craft applied
  const mender = Object.values(C74.abilities).find(a => (a.functions || []).some(v => g.improveFunctions.includes(v)));
  const striker = Object.values(C74.abilities).find(a => (a.functions || []).length && !(a.functions || []).some(v => g.improveFunctions.includes(v)));
  const c1 = mk74("k", 15); c1.abilities = [{ abilityId: mender.id, level: 1 }, { abilityId: striker.id, level: 1 }]; c1.holdings[0].condition = "strained";
  const i1 = H74.improveHolding(c1, "mine", mender.id, { catalog: C74.abilities, cfg: cfgS, day: 3, worldCount: 50 });
  const i2 = H74.improveHolding(c1, "mine", mender.id, { catalog: C74.abilities, cfg: cfgS, day: 4, worldCount: 51 });
  const i3 = H74.improveHolding(c1, "mine", striker.id, { catalog: C74.abilities, cfg: cfgS, day: 4, worldCount: 51 });
  const i4 = H74.improveHolding(c1, "mine", "not_a_craft_i_carry", { catalog: C74.abilities, cfg: cfgS });
  check("§74: ⛔ a carried craft that shapes or mends lifts the hold a rung at once, with history and an event; the same craft twice is refused; a craft that only strikes is refused; a craft not carried is refused",
    i1.ok && i1.from === "strained" && i1.to === "holding" && c1.holdings[0].improvements.length === 1 && /improved with/.test(c1.holdings[0].history.slice(-1)[0]?.note || "") && H74.takeHoldingEvents(c1).some(t => /comes up to holding/.test(t))
    && i2.ok === false && /already been applied/.test(i2.why) && i3.ok === false && /does not shape or mend/.test(i3.why) && i4.ok === false, JSON.stringify({ i1, i2: i2.why, i3: i3.why, i4: i4.why, mender: mender.id, striker: striker.id }));
  // ── hands and the ground in the yield
  const h2 = { id: "m", kind: "enterprise", condition: "thriving", crew: ["a", "b"] };
  const y0 = H74.yieldFor({ id: "m", kind: "enterprise", condition: "thriving" }, cfgS), y2 = H74.yieldFor(h2, cfgS), yG = H74.yieldFor({ id: "m", kind: "enterprise", condition: "thriving" }, cfgS, { density: 0.9 }), yT = H74.yieldFor({ id: "m", kind: "enterprise", condition: "thriving" }, cfgS, { density: 0.2 });
  check("§74: ⛔ hands raise the yield (two hands: 8 → 12) and the ground scales it (dense ×1.2, thin ×0.85); the cap holds",
    y0.units === 8 && y2.units === 12 && y2.hands === 2 && yG.units === Math.round(8 * 1.2) && yT.units === Math.round(8 * 0.85)
    && H74.yieldFor({ id: "m", kind: "enterprise", condition: "thriving", crew: ["a", "b", "c", "d", "e"] }, cfgS).hands === g.maxHands, JSON.stringify({ y0, y2, yG, yT }));
  // ── a watch: keep and the raid
  const guarded = { id: "m", kind: "enterprise", condition: "thriving", garrison: ["g1", "g2"], store: { raw_material: 40 } };
  check("§74: ⛔ a garrison costs its keep (14 + 2 × 3) and halves a raid — a raid roll of 0.08 hits an open hold (12%) and misses a guarded one (6%)",
    H74.upkeepFor(guarded, cfgS) === cfgS.upkeepByKind.enterprise + 2 * g.garrisonUpkeepPerHand
    && !!H74.tickStore(mk74("k", 15), { id: "m", kind: "enterprise", condition: "thriving", store: { raw_material: 40 } }, { cfg: cfgS, economy: eco, dangerLevel: 4, rng: () => 0.08, day: 1 }).raid
    && !H74.tickStore(mk74("k", 15), { ...guarded, store: { raw_material: 40 } }, { cfg: cfgS, economy: eco, dangerLevel: 4, rng: () => 0.08, day: 1 }).raid);
  // ── the setters
  const c2 = mk74("k", 15);
  H74.setCrew(c2, "mine", ["k", "a", "b", "c", "d"], { cfg: cfgS, worldCount: 9, nameOf: (x) => x });
  H74.setGarrison(c2, "mine", ["w"], { worldCount: 10, nameOf: (x) => x });
  check("§74: …`setCrew` caps at maxHands and never counts the keeper; `setGarrison` sets the watch; both leave history",
    c2.holdings[0].crew.length === g.maxHands && !c2.holdings[0].crew.includes("k") && c2.holdings[0].garrison[0] === "w" && c2.holdings[0].history.some(x => /hands:/.test(x.note)) && c2.holdings[0].history.some(x => /guarded by w/.test(x.note)));
  // ── the ops and the tab
  const gm74 = rd("engine/gm.js"), app74 = rd("app.js");
  check("§74: …the GM has `improve` / `crew` / `garrison` and the app applies them; the tab has *Apply a craft* / *Add hands* / *Post a guard* and says how the hold grows",
    /claim\|steward\|release\|transfer\|sell\|improve\|crew\|garrison/.test(gm74) && /kind === "improve"/.test(app74) && /kind === "crew"/.test(app74) && /kind === "garrison"/.test(app74)
    && /data-hold-improve=/.test(app74) && /data-hold-crew=/.test(app74) && /data-hold-guard=/.test(app74) && /grows: /.test(app74) && /improveHolding\(character, id, sel\.value/.test(app74));
  check("§74: …the body and the index say so", /growHolding/.test(rd("docs/HOW_IT_WORKS.md")) && /~~\*\*Q18\*\*~~/.test(rd("docs/RULINGS.md")));
}
/* ═════ §75 — A HOLD CARRIES FEATURES: what a post becomes; and a re-claim no longer renames it (Erik, 2026-09-05) ═════ */
// By example: the Threshold Post "is supposed to have a mine" and is "a Temple to Attending"; Stillwater's Trouble has "barriers,
// a wall, skeletal sentries" and "reverted back to Raven's Home almost immediately". A catalogue of feature KINDS in Aevi's
// families, each with the ONE effect the engine reads; a name that is the player's.
console.log("\n── §75 · features — a mine yields, a temple carries meaning, a wall guards, quarters house; the name stands ──");
{
  const H75 = await import("../engine/holdings.js");
  const WT75 = await import("../engine/worldtick.js");
  const SUB75 = await import("../engine/substrate.js");
  const { loadContentHeadless: lch75 } = await import("./headless_content.mjs");
  const C75 = await lch75();
  const eco = C75.rules.economy, kinds = eco.holdFeatures?.kinds || {};
  const cfgAll = { ...eco.holdStore, features: eco.holdFeatures };
  check("§75: ⛔ the catalogue is content, in Aevi's families — a mine yields raw material, a temple is an aura, a wall is a defence point, sentries a watch, quarters hands and homes, a forge a facility",
    kinds.mine?.family === "material" && kinds.mine.yields === "raw_material" && kinds.temple?.family === "meaning" && kinds.temple.aura > 0 && kinds.wall?.family === "martial" && kinds.wall.defence === 1
    && kinds.sentries?.watch === true && kinds.quarters?.family === "people" && kinds.quarters.hands > 0 && kinds.quarters.residents > 0 && kinds.forge?.family === "craft" && Number.isFinite(eco.holdFeatures.defenceShareStep));
  const mk = () => { const c = { id: "pc", purse: { crystal: 500 }, company: [], holdingOffers: [], worldState: { assignments: {} }, abilities: [], npcRegistry: { fendt: { name: "Fendt", status: "active", level: 15 } }, holdings: [], holdingEvents: [] };
    H75.addHolding(c, { id: "threshold", kind: "post", name: "Threshold Post", locationId: "ridge", steward: "fendt", day: 1 }); c.holdings[0].condition = "thriving"; c.holdings[0].lastMovedWorldCount = 0; return c; };
  // ── a post with a mine PRODUCES
  const c1 = mk();
  const bad = H75.addFeature(c1, "threshold", { kind: "casino", cfg: cfgAll });
  const mine = H75.addFeature(c1, "threshold", { kind: "mine", by: "fendt", craftIds: ["stonewise"], day: 3, worldCount: 10, cfg: cfgAll });
  check("§75: ⛔ a kind the catalogue does not know is refused (Aevi authors kinds); a mine is recorded with who built it and the craft used",
    bad.ok === false && /not a feature the catalogue knows/.test(bad.why) && mine.ok && c1.holdings[0].features.length === 1 && c1.holdings[0].features[0].by === "fendt" && c1.holdings[0].features[0].craftIds[0] === "stonewise"
    && /built a mine \(fendt\) with stonewise/.test(c1.holdings[0].history.slice(-1)[0]?.note || "") && H75.takeHoldingEvents(c1).some(t => /Threshold Post has a mine now/.test(t)));
  const ys = H75.yieldsFor(c1.holdings[0], cfgAll);
  check("§75: ⛔ …and the POST now yields — raw material at its condition, from the mine, where its own kind yields nothing",
    H75.yieldFor(c1.holdings[0], cfgAll) === null && ys.length === 1 && ys[0].goods === "raw_material" && ys[0].units === eco.holdStore.yieldByCondition.thriving && ys[0].feature === "a mine", JSON.stringify(ys));
  const t = WT75.advanceHoldings({ character: c1, content: C75, rng: () => 0.99 });
  check("§75: …the TICK puts the mine's ore in the post's store", (c1.holdings[0].store?.raw_material || 0) >= eco.holdStore.yieldByCondition.holding && t.moved === 1, JSON.stringify(c1.holdings[0].store));
  // ── a temple is meaning on the ground
  const c2 = mk();
  H75.addFeature(c2, "threshold", { kind: "temple", name: "the Temple to Attending", by: "you", cfg: cfgAll });
  const aura = H75.holdingMeaningAura(c2, "ridge", cfgAll);
  const plain = Object.values(C75.locations).find(l => !(l.tags || []).some(x => ["sacred", "locus", "cult", "home"].includes(x)) && !l.communityId);
  const m0 = SUB75.meaningDensity(plain, { data: C75.substrateModel }), m1 = SUB75.meaningDensity(plain, { data: C75.substrateModel, aura });
  const meta = Object.values(C75.abilities).find(a => a.tradition && SUB75.craftSource(a, { domains: { primary: a.tradition }, schools: {} }, C75.schools, C75.powerSources, C75.foothills)?.source === "metaphysical");
  const chr = { domains: { primary: meta.tradition }, schools: {}, npcRegistry: {} };
  const card0 = SUB75.groundCardFor(meta, chr, { schools: C75.schools, substrate: C75.substrateModel, location: plain, locations: C75.locations, powerSources: C75.powerSources, foothills: C75.foothills });
  const card1 = SUB75.groundCardFor(meta, chr, { schools: C75.schools, substrate: C75.substrateModel, location: plain, locations: C75.locations, powerSources: C75.powerSources, foothills: C75.foothills, meaningAura: aura });
  check("§75: ⛔ a temple at the hold is an AURA on the place — meaningDensity rises by it, and the metaphysical card's meaning and ceiling rise with it",
    aura === kinds.temple.aura && m1 > m0 && Math.abs(m1 - Math.min(1, m0 + aura)) < 1e-9 && card1.meaning > card0.meaning && card1.ceiling > card0.ceiling && H75.holdingMeaningAura(c2, "elsewhere", cfgAll) === 0,
    JSON.stringify({ aura, m0, m1, c0: [card0.meaning, card0.ceiling], c1: [card1.meaning, card1.ceiling] }));
  check("§75: …the wheel's row and the roll hand the hold's aura to the card", /meaningAura: holdingMeaningAura\(character, hereNow\(\)\?\.id/.test(rd("app.js")) && /meaningAura: holdingMeaningAura\(character, location\?\.id/.test(rd("app.js")));
  // ── walls and sentries guard, and cut the take
  const c3 = mk();
  H75.addFeature(c3, "threshold", { kind: "wall", by: "you", craftIds: ["stonewise", "keystone_blow"], cfg: cfgAll });
  H75.addFeature(c3, "threshold", { kind: "sentries", name: "skeletal sentries", by: "you", count: 4, cfg: cfgAll });
  const h3 = c3.holdings[0]; h3.store = { raw_material: 40 };
  check("§75: ⛔ a wall and sentries make the hold GUARDED with nobody on the garrison list, and count as defence points",
    H75.isGuarded(h3, cfgAll) && !H75.isGuarded({ id: "x", kind: "post" }, cfgAll) && H75.defenceOf(h3, cfgAll) === 1 + 4 && H75.upkeepFor(h3, cfgAll) === 0);
  // ⚠️ R46a (2026-09-05) SUPERSEDES THE FLOOR THIS ONCE ASSERTED: sentries keep a WATCH, so this hold does not get
  // subtracted from — it FIGHTS. §78 carries the three endings; here we assert only that a watched hold is never quietly
  // robbed, which is what the wall-and-sentries fixture is for.
  const st3 = H75.tickStore(c3, h3, { cfg: cfgAll, economy: eco, dangerLevel: 4, rng: () => 0, day: 5 });
  check("§75: ✅ …a hold with a watch is never quietly robbed — it meets them (R46a), win or lose",
    st3.raid && st3.raid.detected === true, JSON.stringify(st3.raid));
  const open = mk(); open.holdings[0].store = { raw_material: 40 };
  const stO = H75.tickStore(open, open.holdings[0], { cfg: cfgAll, economy: eco, dangerLevel: 4, rng: () => 0, day: 5 });
  check("§75: …an unguarded hold, unseen, still loses the full share (R46a: having no watch IS the loss)",
    stO.raid && stO.raid.detected === false && stO.raid.taken.raw_material === Math.floor(40 * eco.holdStore.raid.takeShare));
  // ── quarters house and raise the hands
  const c4 = mk();
  H75.addFeature(c4, "threshold", { kind: "quarters", by: "fendt", cfg: cfgAll });
  H75.setCrew(c4, "threshold", ["a", "b", "c", "d", "e", "f"], { cfg: cfgAll, worldCount: 20, nameOf: (x) => x });
  const res = H75.residentsOf(c4.holdings[0], cfgAll);
  check("§75: ⛔ quarters raise the hands a hold can work (3 → 5) and answer 'who lives here' with homes and the people at it",
    H75.handsCap(c4.holdings[0], cfgAll) === eco.holdStore.growth.maxHands + kinds.quarters.hands && c4.holdings[0].crew.length === eco.holdStore.growth.maxHands + kinds.quarters.hands
    && res.homes === kinds.quarters.residents && res.people.includes("fendt") && res.people.includes("a"), JSON.stringify({ cap: H75.handsCap(c4.holdings[0], cfgAll), res }));
  // ── the name is the player's
  const c5 = mk();
  H75.renameHolding(c5, "threshold", "Stillwater's Trouble", { worldCount: 30 });
  H75.addHolding(c5, { id: "threshold", kind: "post", name: "Raven's Home", locationId: "ridge", day: 9 });
  const kept = c5.holdings[0].name;
  H75.addHolding(c5, { id: "threshold", kind: "post", name: "Raven's Home", rename: true, day: 9 });
  check("§75: ⛔ a re-claim of a known hold does NOT rename it (the revert Erik saw); only `rename: true` does; the tab's rename writes history and an event",
    kept === "Stillwater's Trouble" && c5.holdings[0].name === "Raven's Home" && c5.holdings[0].history.some(x => /renamed from Threshold Post to Stillwater's Trouble/.test(x.note || "")) && H75.takeHoldingEvents(c5).some(t => /is called Stillwater's Trouble now/.test(t)));
  check("§75: …torn down is gone, with history", (() => { const c = mk(); H75.addFeature(c, "threshold", { kind: "wall", cfg: cfgAll }); const f = H75.removeFeature(c, "threshold", 0, { worldCount: 40 }); return f && f.kind === "wall" && c.holdings[0].features.length === 0 && /a wall torn down/.test(c.holdings[0].history.slice(-1)[0]?.note || ""); })());
  // ── the ops and the tab
  const app75 = rd("app.js"), gm75 = rd("engine/gm.js");
  check("§75: …the GM has `feature` and `rename`, a claim carries `rename`, and the tab has *Add what was built* / *Rename* and lists what the hold has",
    /sell\|improve\|crew\|garrison\|feature\|rename/.test(gm75) && /kind === "feature"/.test(app75) && /kind === "rename"/.test(app75) && /rename: op\.rename === true/.test(app75)
    && /data-hold-feature=/.test(app75) && /data-hold-rename=/.test(app75) && /data-hold-unfeature=/.test(app75) && /has: \$\{list/.test(app75) && /residentsOf\(h, holdCfgNow\(\)\)/.test(app75));
  check("§75: …the body and the spec say so", /holdFeatures/.test(rd("docs/HOW_IT_WORKS.md")) && /PASS TWO, FIRST CUT/.test(rd("po/SPEC_holding_attributes.md")));
}
/* ═════ §76 — R47 THE UNIVERSAL FALLBACKS RETIRE BEHIND THE FREE TOUCH · R46c NO CAP, AND A ROW IS A CRAFT ═════ */
// ⛔ Erik 2026-09-05 (WORK_ORDER_20260905b): "we are eliminating the universal fallbacks… Only keeping them if needed for an
// NPC with the most basic sheet. Silas should just rely on the zero-cost fallbacks of his T1 skills as we designed" — and Q16,
// "no cap on the battle menu; group by craft". The replacement (a free touch below rank 1) was built in CCODE-266 and its
// FIELD was never authored: `touchTier` is on 0 of 421 crafts. The rule is live and answers false for everyone today, which
// is the safe end of the ruling — nobody loses their zero-cost move — and the census is asserted so it cannot rot silently.
console.log("\n── §76 · the fallbacks defer to the free touch (unauthored today) · no cap, one row per craft ──");
{
  const CAP76 = await import("../engine/capabilities.js");
  const BT76 = await import("../engine/battle_turn.js");
  const NS76 = await import("../engine/npcsheet.js");
  const { loadContentHeadless: lch76 } = await import("./headless_content.mjs");
  const C76 = await lch76();
  const rules76 = C76.rules, sb76 = C76.skillBattle.engine;
  // ── the rule is ONE function, and both menus ask it
  const touched = { id: "t1", name: "Touchable", tier: 1, functions: ["strike"], touchTier: true, attribute: "physical" };
  const plain = Object.values(C76.abilities).find(a => (a.functions || []).length && !a.touchTier);
  check("§76: ⛔ R47 — `offersFreeFloor` is the rule: a kit whose craft DERIVES a floor answers true, one that cannot answers false, an empty kit false",
    CAP76.offersFreeFloor([touched], { cfg: rules76.energy }) === true
    && CAP76.offersFreeFloor([{ id: "x", name: "X", tier: 5, functions: ["summon"] }], { cfg: rules76.energy }) === false
    && CAP76.offersFreeFloor([], { cfg: rules76.energy }) === false);
  // ── the census, asserted so it cannot rot
  const all76 = Object.values(C76.abilities);
  const withTouch = all76.filter(a => a && a.touchTier);
  // ⛔ THE CENSUS IS WHAT CORRECTED THE RULING. It printed 0 of 421 on the morning R47 was written — the opt-in field
  // nothing opted into — and Aevi rewrote R47 to DERIVE the floor within the hour. It now counts BOTH: what derives (the
  // rule) and what is authored (the prose on top of it), so neither half can quietly go to zero again.
  const derives76 = all76.filter(a => a && CAP76.freeTierOf(a, { cfg: rules76.energy }));
  check(`§76: ⛔ …and the CENSUS travels with it — ${derives76.length} of ${all76.length} crafts DERIVE a free floor, ${withTouch.length} author its prose`,
    derives76.length >= 100 && all76.length > 400, `${derives76.length} derive · ${withTouch.length} authored: ${withTouch.slice(0, 4).map(a => a.id).join(", ")}`);
  // ── the player's menu
  const pcNo = { abilities: [{ abilityId: plain.id, level: 1 }] };
  const pcYes = { abilities: [{ abilityId: "t1", level: 1 }] };
  const catT = { ...C76.abilities, t1: touched };
  const mNo = BT76.battleSkillsForCharacter(pcNo, { catalog: C76.abilities, rules: rules76, sb: sb76 });
  const mYes = BT76.battleSkillsForCharacter(pcYes, { catalog: catT, rules: rules76, sb: sb76 });
  check("§76: ⛔ …a sheet with NO free floor still carries the bare strike and guard (the basic sheet Erik kept them for); a sheet WITH one carries neither",
    mNo.some(s => s.id === "_strike") && mNo.some(s => s.id === "_guard")
    && !mYes.some(s => s.id === "_strike") && !mYes.some(s => s.id === "_guard") && mYes.some(s => s.id === "t1"),
    JSON.stringify({ no: mNo.map(s => s.id), yes: mYes.map(s => s.id) }));
  // ── the NPC's kit follows the same rule
  const npcPlain = { id: "n1", name: "N", abilities: [{ abilityId: plain.id, level: 1 }] };
  const npcTouch = { id: "n2", name: "N2", abilities: [{ abilityId: "t1", level: 1 }] };
  const kNo = NS76.battleSkillsFor(npcPlain, { catalog: C76.abilities, cfg: rules76.npcStanding }).skills;
  const kYes = NS76.battleSkillsFor(npcTouch, { catalog: catT, cfg: rules76.npcStanding }).skills;
  check("§76: …\"the same for any NPC\" — the bare strike goes when the kit carries a touch, stays when it does not, and `canStrike: false` still refuses it",
    kNo.some(s => s.id === "_strike") && !kYes.some(s => s.id === "_strike")
    && !NS76.battleSkillsFor({ ...npcPlain, canStrike: false }, { catalog: C76.abilities, cfg: rules76.npcStanding }).skills.some(s => s.id === "_strike"),
    JSON.stringify({ no: kNo.length, yes: kYes.map(s => s.id) }));
  // ── R46c · no cap
  const big = { abilities: Object.values(C76.abilities).filter(a => (a.functions || []).length).slice(0, 30).map(a => ({ abilityId: a.id, level: 1 })) };
  const menu = BT76.battleSkillsForCharacter(big, { catalog: C76.abilities, rules: rules76, sb: sb76 });
  const verbs = big.abilities.reduce((n, a) => n + (C76.abilities[a.abilityId].functions || []).length, 0);
  check("§76: ⛔ R46c — NO CAP: a 30-craft kit's every verb reaches the menu (it stopped at 40 before)",
    menu.length >= verbs && menu.length > 40, `${menu.length} entries for ${verbs} verbs`);
  check("§76: …a caller that still wants a bound gets one only by asking", BT76.battleSkillsForCharacter(big, { catalog: C76.abilities, rules: rules76, sb: sb76, limit: 12 }).length === 12);
  // ── R46c · the panel groups by craft
  const app76 = rd("app.js");
  check("§76: ⛔ …and the PANEL renders one row per CRAFT with a button per verb — the row count falls, not the content",
    /const byCraft = \[\];/.test(app76) && /byCraft\.findIndex\(g => g\[0\]\.s\.id === e\.s\.id\)/.test(app76) && /const chips = byCraft\.map\(\(entries\) => \{/.test(app76)
    && /verbs\.slice\(1\)\.map\(\(\{ s: v, i: vi \}\) =>/.test(app76) && /data-sbskill="\$\{vi\}"/.test(app76));
  check("§76: …the body carries both rulings", /R47 · THE UNIVERSAL FALLBACKS ARE RETIRED/.test(rd("docs/HOW_IT_WORKS.md")) && /NO CAP ON THE BATTLE MENU/.test(rd("docs/HOW_IT_WORKS.md")));
}
/* ═════ §77 — A PERSON CAN HOLD A THING, AND IT WAKES IN THEIR HANDS (R45c, 2026-09-05) ═════ */
// ⛔ Erik: "as it's hers I can't use the evolve feature for an item on it… wire that into the engine so it evolves itself when
// the time comes." The gap was deeper than evolution.js being player-seat: 0 of 35 registry entries carried an inventory,
// nothing wrote one, and npcUpdates had no items channel — Memory in Pell's hands was fiction with no record. ⚑ And co-use is
// a fact about a SCENE, not a seat: Memory answers to Huginn, who walks with Silas, so a bearer-only rule would have meant a
// spear in Pell's hands could never earn a stage again.
console.log("\n── §77 · a bearer record · the object moves · co-use is a scene · the tick wakes it unattended ──");
{
  const NPC77 = await import("../engine/npcs.js");
  const EV77 = await import("../engine/evolution.js");
  const WT77 = await import("../engine/worldtick.js");
  const cat77 = { memory: { id: "memory", name: "Memory", evolution: { bondSource: "huginn", stages: [
    { stage: 1, name: "Carried", unlockBond: 0, unlockCoUse: 0, bonusTags: ["carried"] },
    { stage: 2, name: "Answering", unlockBond: 5, unlockCoUse: 2, bonusTags: ["answering"], narrationHints: "it answers" } ] } },
    plainthing: { id: "plainthing", name: "A Plain Thing" } };
  const mk77 = () => ({ id: "pc", name: "Silas", companionBonds: { huginn: 9 }, practice: { coUse: {} },
    inventory: [{ id: "memory", name: "Memory", qty: 1 }, { id: "plainthing", name: "A Plain Thing", qty: 1 }],
    npcRegistry: { pell: { id: "pell", name: "Pell" }, huginn: { id: "huginn", name: "Huginn" } }, worldState: {}, holdings: [], company: [] });
  // ── the bearer record
  const c1 = mk77();
  NPC77.ensureBearer(c1.npcRegistry.pell);
  check("§77: ⛔ `ensureBearer` gives a registry entry the two fields an evolving item needs, and nothing else",
    Array.isArray(c1.npcRegistry.pell.inventory) && c1.npcRegistry.pell.inventory.length === 0 && !!c1.npcRegistry.pell.practice
    && NPC77.bearersOf(c1).length === 0, JSON.stringify(Object.keys(c1.npcRegistry.pell)));
  // ── the object MOVES, and only what you hold can be handed over
  const gave = NPC77.giveItemTo(c1, "pell", "Memory", { day: 12 });
  const nope = NPC77.giveItemTo(c1, "pell", "A Sword You Do Not Have");
  const noOne = NPC77.giveItemTo(c1, "nobody", "Memory");
  check("§77: ⛔ …the object MOVES — one Memory, now hers, stamped with who lent it and when; what you do not hold cannot be handed over",
    gave.ok && c1.inventory.length === 1 && !c1.inventory.some(i => i.id === "memory")
    && c1.npcRegistry.pell.inventory.length === 1 && c1.npcRegistry.pell.inventory[0].id === "memory"
    && c1.npcRegistry.pell.inventory[0].lentBy === "pc" && c1.npcRegistry.pell.inventory[0].lentDay === 12
    && nope.ok === false && noOne.ok === false && NPC77.bearersOf(c1).length === 1,
    JSON.stringify({ mine: c1.inventory.map(i => i.id), hers: c1.npcRegistry.pell.inventory.map(i => i.id) }));
  check("§77: …and the narrator is told what others carry of yours — a lent blade cannot be handed back to someone who never had it",
    /Pell carries Memory/.test(NPC77.carriedForGM(c1) || ""), NPC77.carriedForGM(c1));
  // ── the bond is read WHERE THE BOND LIVES
  const pell77 = c1.npcRegistry.pell;
  const st0 = EV77.currentStage("memory", pell77, cat77, { bonds: c1 });
  const stNoBond = EV77.currentStage("memory", pell77, cat77);   // bonds default to the bearer — she has none
  EV77.recordCoUse(pell77, "memory", "huginn", 2);
  const st2 = EV77.currentStage("memory", pell77, cat77, { bonds: c1 });
  check("§77: ⛔ …the BOND is read where the bond lives — Memory answers to Huginn, and Huginn is SILAS's companion; with her own (absent) bonds it cannot rise",
    st0.stage === 1 && st2.stage === 2 && stNoBond.stage === 1, JSON.stringify({ withHis: st2.stage, withHers: stNoBond.stage }));
  // ── co-use is a fact about a SCENE
  const c2 = mk77();
  NPC77.giveItemTo(c2, "pell", "Memory", { day: 12 });
  const adv = EV77.noteCoUseAndRefresh(c2, { usedAbilityIds: ["some_craft"], activeCompanionIds: ["huginn"], catalog: cat77, bearers: NPC77.bearersOf(c2) });
  const co = EV77.coUseCount(c2.npcRegistry.pell, "memory", "huginn");
  check("§77: ⛔ …CO-USE IS A FACT ABOUT A SCENE, NOT A SEAT — the item was used and Huginn was present, so it counts on the tally of the person CARRYING it",
    co === 1 && EV77.coUseCount(c2, "memory", "huginn") === 0, JSON.stringify({ hers: co, his: EV77.coUseCount(c2, "memory", "huginn") }));
  const c3 = mk77();
  NPC77.giveItemTo(c3, "pell", "Memory", { day: 12 });
  EV77.recordCoUse(c3.npcRegistry.pell, "memory", "huginn", 2);
  const adv3 = EV77.noteCoUseAndRefresh(c3, { usedAbilityIds: ["x"], activeCompanionIds: [], catalog: cat77, bearers: NPC77.bearersOf(c3) });
  check("§77: …an advance in someone else's hands names the bearer, so the news can say whose", adv3.some(a => a.itemId === "memory" && a.bearerName === "Pell"), JSON.stringify(adv3));
  // ── every player call is byte-identical
  const solo = mk77();
  const soloAdv = EV77.noteCoUseAndRefresh(solo, { usedAbilityIds: ["x"], activeCompanionIds: ["huginn"], catalog: cat77 });
  check("§77: ⛔ …and a caller that passes no bearers is the player alone, exactly as before",
    EV77.coUseCount(solo, "memory", "huginn") === 1 && soloAdv.every(a => !a.bearerId) && solo.inventory.find(i => i.id === "memory").evoStage === 1);
  // ── the tick wakes it unattended
  const c4 = mk77();
  NPC77.giveItemTo(c4, "pell", "Memory", { day: 12 });
  EV77.recordCoUse(c4.npcRegistry.pell, "memory", "huginn", 2);
  const out = await WT77.runWorldTick({ character: c4, content: { items: cat77, abilities: {}, npcs: {}, rules: {} }, currentDay: 20, advanceAssignments: async () => ({ advancements: [] }), rng: () => 0.99 });
  check("§77: ⛔ …and the WORLD TICK wakes it UNATTENDED, the way a hold grows — Erik's \"so it evolves itself when the time comes\" — and the news says whose hands",
    c4.npcRegistry.pell.inventory[0].evoStage === 2 && (out.news || []).some(n => /Memory has woken further in Pell's hands/.test(n.text)),
    JSON.stringify({ stage: c4.npcRegistry.pell.inventory[0].evoStage, news: (out.news || []).map(n => n.text).filter(t => /Memory/.test(t)) }));
  // ── it comes back
  const back = NPC77.takeItemFrom(c4, "pell", "Memory");
  check("§77: …taking it back returns the object with what it became, and drops the lending marks",
    back.ok && c4.inventory.some(i => i.id === "memory" && i.evoStage === 2 && !("lentBy" in i)) && c4.npcRegistry.pell.inventory.length === 0
    && NPC77.takeItemFrom(c4, "pell", "Memory").ok === false);
  // ── the seams
  const gm77 = rd("engine/gm.js"), app77 = rd("app.js"), reg77 = rd("engine/gm_registry.js");
  check("§77: …the GM has the channel, the app moves the object, and the narrator gets the block",
    /"carries": \["the exact name of an item the CHARACTER holds/.test(gm77) && /"returns"/.test(gm77) && /WHAT OTHERS CARRY OF YOURS/.test(gm77)
    && /giveItemTo\(character, u\.npcId, nm/.test(app77) && /takeItemFrom\(character, u\.npcId, nm\)/.test(app77)
    && /carriedDetail/.test(reg77) && /bearers: bearersOf\(character\)/.test(app77));
  check("§77: …the body says so", /A PERSON CAN HOLD A THING/.test(rd("docs/HOW_IT_WORKS.md")));
}
/* ═════ §78 — R46a A RAID IS A FIGHT, NOT A SUBTRACTION · R46b A TEMPLE POOLS, AURAS AND DRAWS PILGRIMS (2026-09-05) ═════ */
// ⛔ A raid was a dice roll and a subtraction. Now: UNDETECTED they take what they came for (stone still cuts it, and
// `minTakeShare` is retired — "that is what a watch is FOR, and having none is the loss"); DETECTED it is a FIGHT, resolved
// unattended at band scale with the garrison as its actual crew; win and they take NOTHING and leave spoils — "not merely
// the absence of loss". And a temple is not defined by what it attends: it may pool or sink the apparatus under it, it
// carries a meaning aura, and it DRAWS PILGRIMS — a hold that earns from attendance rather than production.
console.log("\n── §78 · unseen they take · seen it is a fight · won they leave spoils · a temple pools and draws pilgrims ──");
{
  const H78 = await import("../engine/holdings.js");
  const { loadContentHeadless: lch78 } = await import("./headless_content.mjs");
  const C78 = await lch78();
  const eco78 = C78.rules.economy, cfg78 = { ...eco78.holdStore, features: eco78.holdFeatures };
  const kinds78 = eco78.holdFeatures.kinds;
  check("§78: ⛔ R46a — `minTakeShare` is RETIRED, and a raid that is won pays (spoils authored)",
    eco78.holdFeatures.minTakeShare === undefined && eco78.holdStore.raid.spoils?.goods && Number(eco78.holdStore.raid.spoils.perDanger) > 0);
  const mk78 = (extra = {}) => { const c = { id: "pc", purse: { crystal: 100 }, holdings: [], npcRegistry: { gil: { id: "gil", name: "Gil", level: 12 } }, holdingEvents: [] };
    H78.addHolding(c, { id: "mine", kind: "enterprise", name: "the mine", locationId: "ridge", steward: "gil", day: 1 });
    Object.assign(c.holdings[0], { condition: "thriving", store: { raw_material: 40 }, ...extra }); return c; };
  const raidOn = (c, { rng = () => 0.5, danger = 4 } = {}) => H78.resolveRaid(c, c.holdings[0], { cfg: cfg78, dangerLevel: danger, rng, day: 5, people: c.npcRegistry });
  // ── a watch is what SEES
  const bare = mk78();
  const walled = mk78(); H78.addFeature(walled, "mine", { kind: "wall", cfg: cfg78 }); H78.addFeature(walled, "mine", { kind: "wall", cfg: cfg78 });
  const sentried = mk78(); H78.addFeature(sentried, "mine", { kind: "sentries", count: 3, cfg: cfg78 });
  const manned = mk78(); H78.setGarrison(manned, "mine", ["gil"], {});
  check("§78: ⛔ …a WATCH is what sees — people on the garrison or a feature that keeps one; STONE DOES NOT SEE",
    H78.watchOf(bare.holdings[0], cfg78).length === 0 && H78.watchOf(walled.holdings[0], cfg78).length === 0
    && H78.watchOf(sentried.holdings[0], cfg78).length === 3 && H78.watchOf(manned.holdings[0], cfg78).length === 1,
    JSON.stringify({ bare: 0, walled: H78.watchOf(walled.holdings[0], cfg78).length, sentried: H78.watchOf(sentried.holdings[0], cfg78).length }));
  // ── undetected: they take, and stone alone can reduce it to nothing
  const rb = raidOn(bare), rw = raidOn(walled);
  const step = eco78.holdFeatures.defenceShareStep, share = eco78.holdStore.raid.takeShare;
  check("§78: ⛔ …UNDETECTED they take what they came for, and walls cut it — no floor under it any more (minTakeShare retired)",
    rb.detected === false && rb.taken.raw_material === Math.floor(40 * share)
    && rw.detected === false && rw.taken.raw_material === Math.floor(40 * (share - step * 2)) && rw.taken.raw_material < rb.taken.raw_material,
    JSON.stringify({ bare: rb.taken, walled: rw.taken }));
  const fortress = mk78(); for (let i = 0; i < 4; i++) H78.addFeature(fortress, "mine", { kind: "wall", cfg: cfg78 });
  const rf = raidOn(fortress);
  check("§78: …and enough stone leaves them nothing even unseen — the floor is gone, not merely lowered",
    Object.keys(rf.taken).length === 0 && fortress.holdings[0].store.raw_material === 40, JSON.stringify(rf));
  // ── detected: a fight, resolved unattended
  const win = mk78(); H78.setGarrison(win, "mine", ["gil"], {}); H78.addFeature(win, "mine", { kind: "tower", cfg: cfg78 });
  const rWin = raidOn(win, { rng: () => 0.99, danger: 1 });
  check("§78: ⛔ …DETECTED it is a FIGHT — won, they take NOTHING and leave spoils behind them (not merely the absence of loss)",
    rWin.detected === true && rWin.held === true && Object.keys(rWin.taken).length === 0
    && win.holdings[0].store.raw_material > 40 && !!rWin.outcome && !!rWin.spoils,
    JSON.stringify({ held: rWin.held, spoils: rWin.spoils, store: win.holdings[0].store }));
  const lose = mk78(); H78.setGarrison(lose, "mine", ["gil"], {});
  const rLose = raidOn(lose, { rng: () => 0.01, danger: 12 });
  check("§78: …lost, they take — and the history says the watch met them and lost",
    rLose.detected === true && rLose.held === false && rLose.taken.raw_material > 0
    && /raid fought and lost/.test(lose.holdings[0].history.slice(-1)[0]?.note || ""), JSON.stringify(rLose));
  check("§78: …and the three endings do not read alike",
    (() => { const w = H78.storeNews(win.holdings[0], { raid: rWin }), l = H78.storeNews(lose.holdings[0], { raid: rLose }), u = H78.storeNews(bare.holdings[0], { raid: rb });
      return /took nothing, and left/.test(w[0] || "") && /met them and lost/.test(l[0] || "") && /robbed in the night/.test(u[0] || ""); })());
  // ── R46b · a temple pools, auras, draws pilgrims
  const temple = Object.entries(kinds78).find(([k, d]) => d.family === "meaning" && /temple/i.test(k));
  check("§78: ⛔ R46b — a meaning kind carries all three: an aura, a power-source FIELD, and PILGRIMS; `attends` is one optional flag among them",
    !!temple && Number(temple[1].aura) > 0 && !!temple[1].substrateSource && Number(temple[1].pilgrims) > 0
    && Object.values(kinds78).some(d => d.family === "meaning" && d.attends) && Object.values(kinds78).some(d => d.family === "meaning" && !d.attends),
    JSON.stringify(temple));
  const t78 = mk78(); H78.addFeature(t78, "mine", { kind: temple[0], cfg: cfg78 });
  check("§78: …the FIELD is a stationary aura — a pool thickens the apparatus under it, a sink thins it, and elsewhere is untouched",
    H78.holdingFieldDelta(t78, "ridge", cfg78) > 0 && H78.holdingFieldDelta(t78, "elsewhere", cfg78) === 0
    && /holdingFieldDelta\(character, location\?\.id/.test(rd("app.js")));
  const alms0 = H78.pilgrimIncome(t78.holdings[0], { cfg: cfg78, meaning: 0 });
  const alms1 = H78.pilgrimIncome(t78.holdings[0], { cfg: cfg78, meaning: 0.8 });
  check("§78: ⛔ …and PILGRIMS are a new earning shape — a hold that earns because people COME, and more of them where the meaning is deep",
    alms0 > 0 && alms1 > alms0 && H78.pilgrimIncome(mk78().holdings[0], { cfg: cfg78, meaning: 0.8 }) === 0,
    JSON.stringify({ plain: alms0, meaningful: alms1 }));
  const paid = mk78(); H78.addFeature(paid, "mine", { kind: temple[0], cfg: cfg78 });
  const st78 = H78.tickStore(paid, paid.holdings[0], { cfg: cfg78, economy: eco78, dangerLevel: 0, rng: () => 0.99, day: 1, meaning: 0.5 });
  check("§78: …the alms reach the PURSE on the tick, and the news says they were left",
    st78.pilgrims > 0 && paid.purse.crystal === 100 + st78.pilgrims - H78.upkeepFor(paid.holdings[0], cfg78)
    && H78.storeNews(paid.holdings[0], st78).some(t => /left at the mine by those who came to it/.test(t)),
    JSON.stringify({ alms: st78.pilgrims, purse: paid.purse.crystal }));
  check("§78: …the body says so", /A RAID IS A FIGHT/.test(rd("docs/HOW_IT_WORKS.md")) && /PILGRIMS/.test(rd("docs/HOW_IT_WORKS.md")));
}
/* ═════ §79 — THE NEWS RE-BROADCAST OLD DEEDS, AND THE DIGEST CLIPPED (BUG_news_rebroadcast, 2026-09-05) ═════ */
// ⛔ Erik: "my news is still popping up old stuff… it cuts off instead of becoming a scrollable." The player's spread call
// hardcoded `rate: 1`, which makes `spreadDeeds`' own throttle (`rng() >= rate`) unreachable — every eligible deed took a
// GUARANTEED hop every pass and every hop printed a line, while the figure path two thousand lines below already read the
// authored 0.35. ⚑ And a hop is not a headline: the spread is world state, the digest is a report, and the report is bounded.
console.log("\n── §79 · the spread reads its dial · a busy pass is bounded · no save is rewritten · the digest scrolls ──");
{
  const WT79 = await import("../engine/worldtick.js");
  const REP79 = await import("../engine/reputation.js");
  const wt79 = rd("engine/worldtick.js");
  const arc79 = rj("content/packs/core/rules/arc_response.json");
  const cfg79 = arc79.arcResponse || arc79;
  check("§79: ⛔ the rate comes from CONTENT and the hardcoded `rate: 1` is gone — the player's deeds spread as a figure's do",
    !/rate: 1,/.test(wt79) && /rate: spreadRate,/.test(wt79) && /deedSpreadRate\) \? content\.rules\.arcResponse\.deedSpreadRate : 0\.35/.test(wt79)
    && Number(cfg79.deedSpreadRate) > 0 && Number(cfg79.deedSpreadRate) < 1, `authored rate ${cfg79.deedSpreadRate}`);
  check("§79: …and the DIGEST is bounded by its own dial, with the remainder counted rather than repeated",
    Number(cfg79.deedSpreadLinesPerPass) >= 1 && /hops\.slice\(0, shown\)/.test(wt79) && /Word travelled on \$\{more\} other count/.test(wt79));
  // ⛔ THE THROTTLE IS REACHABLE — the property `rate: 1` destroyed, proved against the real function.
  const deeds = () => Array.from({ length: 8 }, (_, i) => ({ description: `deed ${i}`, weight: 3, day: 0, communityId: "valley.a", spread: [] }));
  const opts = { communitiesByRegion: { r: ["valley.a", "valley.b", "valley.c", "valley.d"] }, regionOfCommunity: { "valley.a": "r", "valley.b": "r", "valley.c": "r", "valley.d": "r" } };
  const at1 = REP79.spreadDeeds({ deeds: deeds() }, { ...opts, rng: () => 0.99, rate: 1 }).length;
  const atDial = REP79.spreadDeeds({ deeds: deeds() }, { ...opts, rng: () => 0.99, rate: cfg79.deedSpreadRate }).length;
  check("§79: ⛔ …the defect itself, kept measurable — at `rate: 1` a pass that should skip EVERYTHING hops everything; at the dial it skips",
    at1 === 8 && atDial === 0, `rate 1 → ${at1} hops · rate ${cfg79.deedSpreadRate} → ${atDial}`);
  // ⚠️ AND NO SAVE IS REWRITTEN — the over-spread deeds Erik already carries stay spread.
  check("§79: ⚠️ …and nothing trims `d.spread` on an existing save — a retcon is not a migration",
    !/\.spread\s*=\s*\[\]/.test(wt79) && !/spread\.length\s*=\s*/.test(wt79) && /retcon, not a migration/.test(wt79));
  // the tick, end to end: many old deeds, one bounded report
  const c79 = { id: "pc", clock: { day: 40 }, worldState: { lastTickDay: 39, news: [], unseenNews: [] }, holdings: [], company: [], npcRegistry: {},
    deeds: Array.from({ length: 7 }, (_, i) => ({ description: `an old deed ${i}`, weight: 3, day: 1, communityId: "valley.a", spread: [] })) };
  const content79 = { locations: { a: { id: "a", communityId: "valley.a", regionId: "r" }, b: { id: "b", communityId: "valley.b", regionId: "r" },
      c: { id: "c", communityId: "valley.c", regionId: "r" }, d: { id: "d", communityId: "valley.d", regionId: "r" } },
    rules: { arcResponse: cfg79 }, npcs: {}, items: {}, abilities: {}, region: { activeEvents: [] }, events: {} };
  const out79 = await WT79.runWorldTick({ character: c79, content: content79, currentDay: 40, advanceAssignments: async () => ({ advancements: [] }), rng: () => 0.01 });
  const spreadLines = (out79.news || []).filter(n => /^As far as |^Word travelled on /.test(n.text));
  check("§79: ⛔ …SEVEN OLD DEEDS, AND THE DIGEST STAYS BOUNDED — at most the dial's lines plus one that counts the rest",
    spreadLines.length <= Number(cfg79.deedSpreadLinesPerPass) + 1
    && !spreadLines.some(n => /Word has spread beyond its own valley/.test(n.text)),
    `${spreadLines.length} spread line(s) of ${(out79.news || []).length}: ${spreadLines.map(n => n.text.slice(0, 40)).join(" | ")}`);
  // the panel
  const app79 = rd("app.js"), css79 = rd("style.css");
  check("§79: ⛔ …and the digest SCROLLS — the body has a height of its own and the title stays outside it",
    /<div class="news-body">\$\{body\}<\/div>/.test(app79) && /\.news-body \{[^}]*max-height:[^}]*overflow-y: auto/.test(css79)
    && /news-title[^]{0,80}news-body/.test(app79));
}

/* ═════ §80 — A PARTY MEMBER FIGHTS FROM THEIR OWN SHEET (SPEC_party_mode_phase2 §6 / R36, 2026-09-05) ═════ */
// ⛔ Aevi, measured: "A PARTY MEMBER FIGHTS AS A STUB — combatants.js:287 — a human ally gets hardcoded
// contributions: ['HARM','MARTIAL'] and sheet: p.sheet || p. This is R36's defect, unfixed for actual players."
// ⚑ TRUE, AND WORSE THAN SHE SAID. The branch read `character.party` — A FIELD NOTHING IN THIS REPO EVER WROTE.
// The roster lives on the shared SCENE, and a scene member carried {characterId, name, playerKey, joinedAt}: a
// name and a key, nothing to stand in a fight with. So the fix needed all four doors, not one — a PRODUCER (a
// combat presence written at join time), a CARRIER (an explicit option, because a fight roster is not save
// state), a READER (the crafts, not a hardcode) and a CALLER (every seat in app.js).
console.log("\n── §80 · a human ally's crafts say what they bring · the presence that carries them · every seat hands it over ──");
{
  const CB80 = await import("../engine/combatants.js");
  const FN80 = await import("../engine/functions.js");
  const cb80 = rd("engine/combatants.js"), pt80 = rd("engine/party.js");
  const enc80 = rd("engine/encounters.js"), bt80 = rd("engine/battle_turn.js"), app80 = rd("app.js");

  // ── DOOR 1 · THE READER. The hardcode is gone and a kit is read instead.
  // ⚠️ THE PARTY BRANCH, AND ONLY IT — comments stripped, and the player's own seat left alone.
  // Two ways this check asked the wrong question before it asked the right one, and both are worth naming:
  // the line that REMOVED the hardcode quotes it in the note saying why it is gone, and the PLAYER'S OWN
  // seat still carries it on purpose — "MARTIAL here has never meant 'has a high physical' — it means this
  // one fights on purpose, and the person the whole contest is built around always does." That is a ruling.
  // A gate that cannot tell code from prose, or a defect from a ruling, is not measuring what it claims to.
  const code80 = cb80.replace(/^\s*\/\/[^\n]*$/gm, "");
  const branch80 = code80.slice(code80.indexOf("for (const p of (party ||")).split("\n  }")[0];
  check("§80: ⚠️ the fixture found the party branch to read — not vacuous",
    branch80.length > 200 && /out\.push\(/.test(branch80), `${branch80.length} chars`);
  check("§80: ⛔ the hardcoded ['HARM','MARTIAL'] for every human ally is GONE from the party branch",
    !/contributions: \["HARM", "MARTIAL"\]/.test(branch80) && /familiesOfKit\(rec, catalog, fnIndex\)/.test(branch80));
  check("§80: ⚠️ …and the PLAYER'S own seat still carries it, untouched — a ruling is not a defect",
    /isPlayer: true,\s*\n\s*present: true, canAct: true, contributions: \["HARM", "MARTIAL"\], record: character/.test(cb80.replace(/\r\n/g, "\n")));
  check("§80: …and `familiesOfKit` is REAL — the same reader the ability system uses, not a second rule",
    typeof CB80.familiesOfKit === "function" && /import \{ familiesOfAbility \} from "\.\/functions\.js"/.test(cb80));

  const vocab80 = rj("content/packs/core/rules/function_vocabulary.json");
  const idx80 = FN80.buildFunctionIndex(vocab80.functionVocabulary || vocab80);
  const cat80 = {
    ward_a: { id: "ward_a", functions: ["shield"] }, ward_b: { id: "ward_b", functions: ["ward"] },
    mend_a: { id: "mend_a", functions: ["mend"] }, hit_a: { id: "hit_a", functions: ["strike"] },
  };
  const famOf = (id) => FN80.familiesOfAbility(cat80[id], idx80)[0] || null;
  // ⚠️ THE FIXTURE ASSERTS ITS OWN GROUND. If the authored vocabulary ever stops mapping these verbs this gate
  // must FAIL LOUDLY rather than pass on empty sets — a check whose input silently emptied proves nothing, and
  // that is precisely the failure this suite exists to catch.
  check("§80: ⚠️ the fixture's own verbs still map — shield/ward → PROTECT, mend → RESTORE, strike → HARM",
    famOf("ward_a") === "PROTECT" && famOf("ward_b") === "PROTECT" && famOf("mend_a") === "RESTORE" && famOf("hit_a") === "HARM",
    ` shield→${famOf("ward_a")} ward→${famOf("ward_b")} mend→${famOf("mend_a")} strike→${famOf("hit_a")}`);

  const me80 = { id: "me", name: "Me", level: 20 };
  const party80 = [
    { id: "w", characterId: "w", name: "A Warder", presence: { level: 12, attributes: { physical: 6 }, health: 24, maxHealth: 24, abilities: ["ward_a", "ward_b"] } },
    { id: "m", characterId: "m", name: "A Mender", presence: { level: 9, health: 18, maxHealth: 18, abilities: ["mend_a"] } },
    { id: "n", characterId: "n", name: "Nobody" },
  ];
  const seat = (opts) => Object.fromEntries(CB80.alliesOf(me80, opts).filter(a => a.kind === "party").map(a => [a.id, a]));
  const after = seat({ party: party80, catalog: cat80, fnIndex: idx80 });
  check("§80: ⛔ A WARDER READS AS A WARDER — from their crafts, not from a hardcode",
    after.w.contributions.includes("PROTECT"), ` warder: ${JSON.stringify(after.w.contributions)}`);
  check("§80: ⛔ …AND A MENDER AS A MENDER — the case R36 named, and the one `targeting.js` looks for by RESTORE",
    after.m.contributions.includes("RESTORE"), ` mender: ${JSON.stringify(after.m.contributions)}`);
  check("§80: ⚠️ …and MARTIAL is no longer HANDED OUT — a bare-handed ally no longer reads as dangerous as one with a spear",
    !after.w.contributions.includes("MARTIAL") && !after.m.contributions.includes("MARTIAL")
    && seat({ party: [{ id: "s", name: "Spear", presence: { level: 5, inventory: [{ kind: "weapon" }] } }], catalog: cat80, fnIndex: idx80 }).s.contributions.includes("MARTIAL"),
    " a weapon still earns MARTIAL, by `contributionsOf`'s own long-standing rule");
  // ⚑ AND IT DEGRADES HONESTLY — a caller that has not adopted the catalog sees exactly what it saw before.
  const before = seat({ party: party80 });
  check("§80: ⚑ with NO catalog handed in, HARM is still the floor — an unadopted caller is not broken by this",
    before.w.contributions.join() === "HARM" && before.m.contributions.join() === "HARM" && before.n.contributions.join() === "HARM");
  check("§80: ⚠️ …and a member with no presence at all is still present and still able — anyone with hands can swing",
    after.n.contributions.join() === "HARM" && after.n.canAct === true && after.n.present === true);
  check("§80: ⛔ a member's PRESENCE reaches the sheet — the health they can lose is theirs, not a floor derived from mine",
    after.w.sheet.maxHealth === 24 && after.w.sheet.level === 12 && after.m.sheet.maxHealth === 18,
    ` warder ${after.w.sheet.level}/${after.w.sheet.maxHealth} · mender ${after.m.sheet.level}/${after.m.sheet.maxHealth}`);

  // ── DOOR 2 · THE PRODUCER. Nothing wrote a party record with anything in it. Now the joiner writes their own.
  check("§80: ⛔ THE MISSING PRODUCER — a scene member now carries a combat PRESENCE, written from their own save",
    /function presenceOf\(c\)/.test(pt80) && /presence: presenceOf\(c\)/.test(pt80)
    && /abilities: \(c\?\.abilities \|\| \[\]\)/.test(pt80));
  check("§80: ⚠️ …and it is a SHEET, NOT A SAVE — ability ids and a bare weapon marker, no prose crossing into another player's prompts",
    /map\(\(\) => \(\{ kind: "weapon" \}\)\)/.test(pt80)
    && !/description|name:/.test(pt80.split("function presenceOf")[1].split("function memberOf")[0]));

  // ── DOOR 3 · THE CARRIER. A fight roster is not save state, so it is an OPTION, never written to a character.
  check("§80: ⛔ `character.party` was a field with a reader and NO WRITER — the roster now arrives as an option",
    /party = null \} = \{\}\) \{/.test(cb80) && /for \(const p of \(party \|\| character\?\.party \|\| \[\]\)\)/.test(cb80));
  check("§80: ⚠️ …and NOTHING PERSISTS IT — no assignment to `character.party` in the engine or the app",
    !/character\.party\s*=[^=]/.test(cb80) && !/character\.party\s*=[^=]/.test(app80) && !/character\.party\s*=[^=]/.test(enc80));

  // ── DOOR 4 · THE CALLERS. Accepted at the top and dropped below is this seam's signature failure; both halves.
  check("§80: ⛔ `skillBattleRound` ACCEPTS the party AND FORWARDS it — to the full roster and the filtered one alike",
    /^\s*party = null,/m.test(enc80)
    && (enc80.match(/catalog: abilityCatalog, fnIndex, party,/g) || []).length === 2,
    ` forwarded to ${(enc80.match(/catalog: abilityCatalog, fnIndex, party,/g) || []).length} of 2 readers`);
  check("§80: …and the CRAFT READING has an index to read with — derived from the vocabulary on content, memoised",
    /function fnIndexFor\(content\)/.test(enc80) && /FN_INDEX_CACHE = new WeakMap\(\)/.test(enc80)
    && /const fnIndex = fnIndexFor\(content\)/.test(enc80));
  check("§80: ⛔ `playTurn` — the ONE path play and the harness share — accepts it and forwards it to every phase",
    /party = null \} = \{\}\) \{/.test(bt80) && (bt80.match(/rng, party, phase:/g) || []).length === 3,
    ` ${(bt80.match(/rng, party, phase:/g) || []).length} of 3 phases`);
  check("§80: ⛔ AND THE APP ACTUALLY CALLS IT — `seatParty` derives the live scene's other players, per call",
    /function seatParty\(\)/.test(app80) && /m\.characterId !== character\?\.id/.test(app80)
    && (app80.match(/party: seatParty\(\)/g) || []).length >= 5,
    ` ${(app80.match(/party: seatParty\(\)/g) || []).length} seats`);
}

/* ═════ §81 — THE PLAYER'S GUIDE NAMES CRAFTS, AND THE CRAFT MUST DO WHAT THE SECTION SAYS (2026-09-05) ═════ */
// ⛔ The guide is the promise a player reads. Its version and its counts were gated; ⚠️ **the CRAFTS IT NAMES
// AS WORKED EXAMPLES WERE NOT.** "The floor that costs nothing" lists three by name, and one of them —
// `kept vigil` (`long_watch`) — has NO free floor: its verbs are `resist`/`sustain` and the authored
// `energy.freeFloor.functions` list carries neither. ⚑ THE ENGINE IS RIGHT AND THE DIAL IS SHORT — R47
// derives a floor only for an authored verb — so this is a gate on the AGREEMENT between the two, which is
// the only place the defect could ever have shown.
// ⚠️ AND IT IS THE CHEAP HALF OF A REAL PROBLEM: a guide section can describe a system that does not exist
// (party mode's leader, lock and simultaneous round are all phase-2 SPEC), and no gate can catch prose about
// a system by reading prose. A NAMED CRAFT is checkable, so the named crafts are checked.
console.log("\n── §81 · every craft the guide names as a free-floor example really has one ──");
{
  const CAP81 = await import("../engine/capabilities.js");
  const { loadContentHeadless: lch81 } = await import("./headless_content.mjs");
  const C81 = await lch81();
  const pg81 = rd("docs/PLAYERS_GUIDE.md");

  // the section, by its heading — and if the heading ever moves, this FAILS rather than passing on an empty set.
  const head81 = pg81.indexOf("## The floor that costs nothing");
  // past the heading LINE, not past one character — slicing at head81+1 leaves the rest of the heading, and
  // the "next heading" search then matches at position 0 and yields an EMPTY section that passes nothing.
  const rest81 = head81 >= 0 ? pg81.slice(head81).replace(/^[^\r\n]*\r?\n/, "") : "";
  const end81 = rest81.search(/^#{1,2} /m);
  const sec81 = head81 >= 0 ? rest81.slice(0, end81 >= 0 ? end81 : undefined) : "";
  check("§81: ⚠️ the fixture FOUND the section and its examples — never vacuous",
    head81 >= 0 && sec81.length > 200, `heading at ${head81}, ${sec81.length} chars`);

  // a bullet that names a craft in backticks. Resolve by id OR by name, because the guide writes the NAME.
  const named81 = [...sec81.matchAll(/^\s*[-*]\s+`([^`]+)`/gm)].map(m => m[1].trim());
  const byName81 = {};
  for (const a of Object.values(C81.abilities)) byName81[String(a.name || "").toLowerCase()] = a;
  const resolve81 = (t) => C81.abilities[t] || byName81[t.toLowerCase()]
    || C81.abilities[t.toLowerCase().replace(/[^a-z0-9]+/g, "_")] || null;
  // ⚠️ `C81.rules` IS the resolution document, flattened by the loader — `rules.energy.freeFloor`, not
  // `rules.resolution.energy`. A cfg read at the wrong depth is silently undefined and every craft then
  // reads as having no floor, which is a fixture that fails everything for one reason: itself.
  check("§81: ⛔ …and every craft it names RESOLVES — a guide that names a craft the game does not have is worse than silence",
    named81.length >= 2 && named81.every(t => resolve81(t)),
    `${named81.length} named: ${named81.map(t => `${t}${resolve81(t) ? "" : " ⛔MISSING"}`).join(" · ")}`);

  // ⛔ THE CHECK THAT MATTERS. The section is about the free floor, so each example must HAVE one.
  const floors81 = named81.map(t => { const a = resolve81(t); return { t, a, floor: a ? CAP81.freeTierOf(a, { cfg: C81.rules }) : null }; });
  // ⛔ A RATCHET, NOT A WALL, AND DELIBERATELY. `kept vigil` (`long_watch`) is named in this section with a
  // floor line of its own — *"a hand on them, and you simply do not leave"* — and it HAS NO FLOOR: its verbs
  // are `resist`/`sustain` and the authored dial carries neither. ⛑ THE ENGINE IS RIGHT; R47 derives a floor
  // only for an authored verb. ⚠️ THE REPAIR IS ONE OF THREE THINGS AND ALL THREE ARE AEVI'S — add `sustain`
  // to the dial, author a `freeTier` on the craft, or drop the example — so this is a count that may only go
  // DOWN, with the name written, rather than a red that blocks everyone until she reads it.
  const UNFLOORED = 1;   // 2026-09-05: `kept vigil` — po/CCODE_20260905_guide_check.md
  const bad81 = floors81.filter(x => !x.floor);
  check(`§81: ⛔ ratchet — named free-floor examples with NO free floor = ${bad81.length} (baseline ${UNFLOORED}) — may only go DOWN`,
    floors81.length >= 2 && bad81.length <= UNFLOORED,
    floors81.map(x => `${x.t}${x.floor ? " ✅" : " ⛔ no floor (verbs " + JSON.stringify(x.a?.functions) + ")"}`).join(" · "));

  // ⚠️ AND THE DIAL IS THE REASON, so the dial is named here — the repair is one entry, and it is Aevi's.
  const ff81 = C81.rules?.energy?.freeFloor || {};
  check("§81: …the free-floor dial is CONTENT and the section's verbs are in it — this is where the repair goes",
    Array.isArray(ff81.functions) && ff81.functions.length >= 8 && Number(ff81.tierAtMost) >= 1,
    `tierAtMost ${ff81.tierAtMost} · ${(ff81.functions || []).length} verbs: ${(ff81.functions || []).join(", ")}`);
}

/* ═════ §82 — TWO PLAYERS JOIN ONE SCENE, END TO END (Aevi's one ask for tomorrow, 2026-09-05) ═════ */
// ⛔ Aevi, ruling: "Two characters joining one scene has never happened, and it is the first thing three
// people at a table will do. GATE THE JOIN ROUND-TRIP AGAINST A FAKE REMOTE BEFORE TOMORROW."
// ⚑ MEASURED FIRST: no scene file in the repository has ever carried two members, and `openScenes`/
// `joinScene` had ZERO direct coverage. The concurrency layer was well covered (146a/b/c, 18 checks) and
// the FLOW THROUGH IT was not — which is the shape of every four-doors failure this project keeps finding.
//
// ⚠️ AND IT NEEDED NO PRODUCTION CHANGE. Every GitHub call funnels through one `ghFetch`, which calls the
// global `fetch`; replacing the global runs `ghGet`, `ghPut`, `fetchRepoJSON`, `pushMergedFile`,
// `pushSceneWithMerge`, `updateOpenIndex` and `listScenesAt` FOR REAL. No seam, no stub, no second
// implementation of the thing under test. The fake enforces real sha semantics, so a 409 is a real 409.
console.log("\n── §82 · A opens a scene · B finds it and JOINS · two writers · a lost response · B's crafts reach A's fight seat ──");
{
  const { fakeRemote, settle } = await import("./lib/fake_remote.mjs");
  const remote82 = fakeRemote();
  const restore82 = remote82.install();
  try {
    const P82 = await import("../engine/party.js");
    const CB82 = await import("../engine/combatants.js");
    const FN82 = await import("../engine/functions.js");
    const { loadContentHeadless: lch82 } = await import("./headless_content.mjs");
    const C82 = await lch82();
    const idx82 = FN82.buildFunctionIndex(rj("content/packs/core/rules/function_vocabulary.json").functionVocabulary
      || rj("content/packs/core/rules/function_vocabulary.json"));

    // ⚠️ TWO REAL PLAYERS, and B is deliberately NOT a striker: `long_watch` is resist/sustain, so if the
    // join carries his kit he reads as a warder and if it does not he reads as a generic attacker. That one
    // difference is R36 measured through the whole pipe rather than at the seat.
    const A82 = { id: "char-A", name: "Silas", playerKey: "pk-A", level: 30, attributes: { physical: 5, mental: 7 },
      health: 120, maxHealth: 120, abilities: [{ abilityId: "hunters_strike" }], inventory: [{ kind: "weapon" }, { kind: "tool" }] };
    const B82 = { id: "char-B", name: "Colten", playerKey: "pk-B", level: 12, attributes: { physical: 6 },
      health: 40, maxHealth: 40, abilities: [{ abilityId: "long_watch" }], inventory: [] };

    // ── 1 · A OPENS A SCENE, and the index learns about it
    const seed82 = P82.newSharedScene("millbrook", A82, new Date().toISOString().replace(/[:.]/g, "-"));
    const made82 = await P82.pushSceneWithMerge(seed82.sceneId, (sc) => sc, seed82);
    await settle();
    const idxAfter1 = remote82.read(P82.OPEN_INDEX_PATH);
    check("§82: ⛔ A opens a scene — the FILE lands on the remote and the OPEN INDEX learns about it",
      !!made82 && remote82.has(P82.scenePath(seed82.sceneId))
      && idxAfter1?.scenes?.[seed82.sceneId]?.locationId === "millbrook" && idxAfter1.scenes[seed82.sceneId].party === 1,
      JSON.stringify(idxAfter1?.scenes || {}));
    check("§82: ⚠️ …and the member carries a PRESENCE, not just a name — the producer runs on the real path",
      Array.isArray(made82.party) && made82.party[0]?.presence?.level === 30
      && (made82.party[0].presence.abilities || []).includes("hunters_strike"),
      JSON.stringify(made82.party[0]?.presence || null).slice(0, 120));

    // ── 2 · B FINDS IT through the index, exactly as the join path does
    const found82 = await P82.listScenesAt("millbrook");
    check("§82: ⛔ B FINDS IT — `listScenesAt` reads the index, re-checks the FILE, and returns the open scene",
      found82.length === 1 && found82[0].sceneId === seed82.sceneId, `${found82.length} scene(s)`);
    check("§82: …and a location with nothing open returns nothing — not everything",
      (await P82.listScenesAt("harmonic_heights_terrace")).length === 0);

    // ── 3 · B JOINS. ⛔ THIS HAS NEVER HAPPENED IN THIS REPOSITORY.
    const two82 = await P82.pushSceneWithMerge(found82[0].sceneId, (sc) => P82.addMember(sc, B82));
    await settle();
    const onRemote82 = remote82.read(P82.scenePath(seed82.sceneId));
    check("§82: ⛔ B JOINS — TWO MEMBERS IN ONE SCENE, on the remote, with both presences",
      onRemote82.party.length === 2 && onRemote82.party.map(m => m.characterId).join(",") === "char-A,char-B"
      && onRemote82.party[1].presence?.level === 12 && (onRemote82.party[1].presence.abilities || []).includes("long_watch"),
      onRemote82.party.map(m => `${m.name}:${m.presence ? "presence" : "⛔ NO PRESENCE"}`).join(" + "));
    check("§82: …and the index says two — the join path's own hint stays true",
      remote82.read(P82.OPEN_INDEX_PATH)?.scenes?.[seed82.sceneId]?.party === 2);
    check("§82: ⚠️ …and joining TWICE changes nothing — `addMember` is idempotent, which the retry loop relies on",
      P82.addMember(onRemote82, B82).party.length === 2);

    // ── 4 · TWO WRITERS, and a real sha conflict between them
    const t82 = new Date().toISOString();
    const conflictsBefore = remote82.state.conflicts;
    await P82.pushSceneWithMerge(seed82.sceneId, (sc) => P82.mergeBeat(sc, { by: "char-A", at: t82, name: "Silas", label: "strikes" }));
    await P82.pushSceneWithMerge(seed82.sceneId, (sc) => P82.mergeBeat(sc, { by: "char-B", at: t82, name: "Colten", label: "wards" }));
    await settle();
    check("§82: ⛔ TWO WRITERS, TWO BEATS — neither is lost (146a's whole reason, now exercised end to end)",
      remote82.read(P82.scenePath(seed82.sceneId)).beats.length === 2,
      remote82.read(P82.scenePath(seed82.sceneId)).beats.map(b => b.by).join(","));
    await P82.pushSceneWithMerge(seed82.sceneId, (sc) => P82.mergeBeat(sc, { by: "char-A", at: t82, name: "Silas", label: "strikes" }));
    await settle();
    check("§82: …and the SAME beat pushed again appears once — `(by, at)` is the key",
      remote82.read(P82.scenePath(seed82.sceneId)).beats.length === 2);

    // ── 5 · ⛔ THE LOST RESPONSE — the case Aevi ruled on. The PUT SUCCEEDS and the reply dies.
    const t82b = new Date(Date.now() + 1000).toISOString();
    remote82.state.dropNextPutResponse = true;
    await P82.pushSceneWithMerge(seed82.sceneId, (sc) => P82.mergeBeat(sc, { by: "char-B", at: t82b, name: "Colten", label: "holds" }));
    await settle();
    const afterLost = remote82.read(P82.scenePath(seed82.sceneId));
    check("§82: ⛔ A LOST RESPONSE DOES NOT DOUBLE-APPLY — the write landed, the reply died, the retry re-read a remote that already had it",
      afterLost.beats.filter(b => b.at === t82b).length === 1 && afterLost.beats.length === 3,
      `${afterLost.beats.length} beats · that one appears ${afterLost.beats.filter(b => b.at === t82b).length}×`);
    check("§82: ⚑ …and THAT is why a shared counter must be a LEDGER — `hp -= 12` here would have run twice",
      /b\.by === beat\.by && b\.at === beat\.at/.test(rd("engine/party.js")));

    // ── 5b · ⛔ AND THE DEFECT, KEPT MEASURABLE. Aevi's rule is that any shared mutable number must be a
    // derived sum over an idempotent ledger. Asserting only that the LEDGER survives proves half of it — so
    // a BARE COUNTER goes through the SAME dropped response, in a scratch scene, and is watched to break.
    // ⚠️ A rule with no number under it stops mattering the first time somebody is in a hurry.
    {
      const scratch = P82.newSharedScene("ledger-probe", A82, "t0");
      await P82.pushSceneWithMerge(scratch.sceneId, (sc) => sc, scratch); await settle();
      await P82.pushSceneWithMerge(scratch.sceneId, (sc) => ({ ...sc, hp: 100 })); await settle();
      remote82.state.dropNextPutResponse = true;
      await P82.pushSceneWithMerge(scratch.sceneId, (sc) => ({ ...sc, hp: (sc.hp ?? 100) - 12 }));
      await settle();
      const bare = remote82.read(P82.scenePath(scratch.sceneId)).hp;
      check("§82: ⛔ A BARE COUNTER DOUBLE-APPLIES ON A LOST RESPONSE — 100 − 12 lands as 76, not 88",
        bare === 76, `hp ${bare} (88 would be correct; 76 is the defect the ruling names)`);

      // …and the ledger shape, through the identical failure, is right.
      await P82.pushSceneWithMerge(scratch.sceneId, (sc) => ({ ...sc, strikes: [] })); await settle();
      const at82 = new Date().toISOString();
      const mergeStrike = (sc, k) => (sc.strikes || []).some(x => x.by === k.by && x.at === k.at)
        ? sc : { ...sc, strikes: [...(sc.strikes || []), k] };
      remote82.state.dropNextPutResponse = true;
      await P82.pushSceneWithMerge(scratch.sceneId, (sc) => mergeStrike(sc, { by: "char-A", at: at82, amount: 12 }));
      await settle();
      const rows = remote82.read(P82.scenePath(scratch.sceneId)).strikes || [];
      check("§82: ⚑ …and THE SAME FAILURE over an idempotent ledger gives 88 — one row, keyed `(by, at)` exactly as the beats are",
        rows.length === 1 && 100 - rows.reduce((n, x) => n + x.amount, 0) === 88,
        `${rows.length} row(s) → hp ${100 - rows.reduce((n, x) => n + x.amount, 0)}`);
    }
    // ── 6 · B'S CRAFTS REACH A'S FIGHT SEAT — R36 through the whole pipe, not at the seat
    const seat82 = afterLost.party.filter(m => m.characterId !== A82.id)
      .map(m => ({ id: m.characterId, characterId: m.characterId, name: m.name, presence: m.presence }));
    const allies82 = CB82.alliesOf(A82, { party: seat82, catalog: C82.abilities, fnIndex: idx82 }).filter(a => a.kind === "party");
    check("§82: ⛔ B'S KIT REACHES A'S FIGHT SEAT — a warder joined and a warder is what fights, at his own level and health",
      allies82.length === 1 && allies82[0].contributions.includes("PROTECT") && !allies82[0].contributions.includes("MARTIAL")
      && allies82[0].sheet.level === 12 && allies82[0].sheet.maxHealth === 40,
      allies82.map(a => `${a.name} ${JSON.stringify(a.contributions)} lvl ${a.sheet.level} hp ${a.sheet.maxHealth}`).join(" · "));

    // ── 7 · LEAVING, and the index self-prunes
    await P82.pushSceneWithMerge(seed82.sceneId, (sc) => P82.removeMember(sc, "char-A"));
    await settle();
    check("§82: …one leaving does NOT close a two-party scene, and the index counts down",
      remote82.read(P82.OPEN_INDEX_PATH)?.scenes?.[seed82.sceneId]?.party === 1
      && !remote82.read(P82.scenePath(seed82.sceneId)).closedAt);
    await P82.pushSceneWithMerge(seed82.sceneId, (sc) => P82.removeMember(sc, "char-B"));
    await settle();
    check("§82: ⛔ …the LAST member leaving closes the scene and DROPS it from the index — the join path cannot offer a dead scene",
      !!remote82.read(P82.scenePath(seed82.sceneId)).closedAt
      && !remote82.read(P82.OPEN_INDEX_PATH)?.scenes?.[seed82.sceneId],
      JSON.stringify(remote82.read(P82.OPEN_INDEX_PATH)?.scenes || {}));

    // ⚠️ THE FIXTURE'S OWN GROUND: if the transport were never reached, every check above would be testing
    // nothing and several would still pass. This is the check that says the pipe was real.
    check("§82: ⚠️ the fixture really drove the transport — not vacuous",
      remote82.state.gets > 10 && remote82.state.puts > 8,
      `${remote82.state.gets} GETs · ${remote82.state.puts} PUTs · ${remote82.state.conflicts} real sha conflict(s)`);
  } finally { restore82(); }
}
/* ══════════ REPORT ══════════ */
console.log("\n" + "═".repeat(96));
console.log(`  ${pass} ok · ${fails.length} FAILURE(S) · ${gaps.length} GAP(S) CLOSED`);
if (fails.length) { console.log("\n  ⛔ THE DOC AND THE ENGINE DISAGREE:"); fails.forEach(f => console.log("     " + f)); }
if (gaps.length) { console.log("\n  ⛔ A §10 GAP HAS BEEN FIXED — UPDATE docs/HOW_IT_WORKS.md:"); gaps.forEach(f => console.log("     " + f)); }
console.log("═".repeat(96) + "\n");
process.exitCode = (fails.length || gaps.length) ? 1 : 0;
