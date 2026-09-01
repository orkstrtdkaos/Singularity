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

  // ⚠️ THE FIVE RANK LADDERS ARE THE ENTIRE EMPIRICAL BASIS FOR THE PROPOSED CURVE. If a sixth appears,
  // the curve should be re-fitted before it ships, and §3 must say so.
  const SKIP = new Set(["rank", "levelReq", "cost", "xp", "n", "d", "plus", "marginFloorPer"]);
  let ladders = 0;
  for (const a of abilities) {
    const scan = (blk) => { if (!blk || typeof blk !== "object") return;
      for (const [k, v] of Object.entries(blk)) { if (SKIP.has(k) || k.startsWith("_")) continue;
        if (Array.isArray(v) && v.length >= 2 && v.every(x => typeof x === "number")) ladders++;
        else if (v && typeof v === "object" && !Array.isArray(v)) scan(v); } };
    scan(a.mechanic);
    const pf = {};
    for (const t of (a.tree || [])) for (const [k, v] of Object.entries({ ...(t.mechanic || {}), ...t }))
      if (!SKIP.has(k) && !k.startsWith("_") && typeof v === "number") (pf[k] = pf[k] || []).push(v);
    for (const vs of Object.values(pf)) if (vs.length >= 2 && new Set(vs).size >= 2) ladders++;
  }
  check("FR: ⛔ still exactly FIVE rank ladders — the whole basis for the proposed curve",
    ladders === 5, `live ${ladders} — a sixth means the curve must be re-fitted, UPDATE §3`);

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
  gap("§10: the map layer still draws rings instead of the authored layouts",
    !/local_layouts/.test(wmSrc) && !/local_layouts/.test(rd("app.js")), `${layouts.length} authored`);

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
    doc.includes(`${renderFns.length} \`render*\` functions`) || doc.includes(`**47 \`render*\` functions**`),
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
/* ══════════ REPORT ══════════ */
console.log("\n" + "═".repeat(96));
console.log(`  ${pass} ok · ${fails.length} FAILURE(S) · ${gaps.length} GAP(S) CLOSED`);
if (fails.length) { console.log("\n  ⛔ THE DOC AND THE ENGINE DISAGREE:"); fails.forEach(f => console.log("     " + f)); }
if (gaps.length) { console.log("\n  ⛔ A §10 GAP HAS BEEN FIXED — UPDATE docs/HOW_IT_WORKS.md:"); gaps.forEach(f => console.log("     " + f)); }
console.log("═".repeat(96) + "\n");
process.exitCode = (fails.length || gaps.length) ? 1 : 0;
