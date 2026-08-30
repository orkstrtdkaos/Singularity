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

/* ══════════ REPORT ══════════ */
console.log("\n" + "═".repeat(96));
console.log(`  ${pass} ok · ${fails.length} FAILURE(S) · ${gaps.length} GAP(S) CLOSED`);
if (fails.length) { console.log("\n  ⛔ THE DOC AND THE ENGINE DISAGREE:"); fails.forEach(f => console.log("     " + f)); }
if (gaps.length) { console.log("\n  ⛔ A §10 GAP HAS BEEN FIXED — UPDATE docs/HOW_IT_WORKS.md:"); gaps.forEach(f => console.log("     " + f)); }
console.log("═".repeat(96) + "\n");
process.exitCode = (fails.length || gaps.length) ? 1 : 0;
