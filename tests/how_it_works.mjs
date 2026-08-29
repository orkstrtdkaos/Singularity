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
  check("FR: ⛔ `rankDeltas` is still authored at the ROOT and read at `mechanic` - still ZERO match",
    rdRoot > 200 && rdMech === 0,
    `root ${rdRoot} - mechanic ${rdMech} - if mechanic is now non-zero the adapter shipped, UPDATE §2`);
  check("FR: the reference records the rankDeltas disconnection with its counts",
    new RegExp(`${rdRoot}`).test(fr) && new RegExp(`${rdTotal}`).test(fr), `${rdRoot} crafts, ${rdTotal} deltas`);

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
  // ⚠️ NAMED `verbFamilyMembers`, NOT `knownVerbs`: `craftmechanics.js` EXPORTS a `knownVerbs`, and a local
  // of the same name in a test file moved that export from orphan to TEST-ONLY, inflating the ratchet by
  // one. A name collision faking a reader - the thing FIELD_REFERENCE §1 documents, committed here.
  const verbFamilyMembers = new Set(Object.keys(VERB_FAMILIES).length
    ? Object.values(VERB_FAMILIES).flat() : []);
  const usedVerbs = new Set();
  for (const a of abilities) for (const v of (a.functions || [])) usedVerbs.add(v);
  const unmechanised = ["persuade", "bolster"].filter(v => usedVerbs.has(v) && !verbFamilyMembers.has(v));
  gap("§10: `persuade` and `bolster` are still unmechanised",
    unmechanised.length > 0, `unmechanised: ${unmechanised.join(", ") || "(none)"}`);

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
  gap("§10: `mechanic.soak` reaches `fields.soak` and NOTHING DOWNSTREAM SPENDS IT",
    !/fields\.soak|mech\w*\.fields\?\.soak/.test(rd("engine/skill_battle.js")),
    `${soakCrafts.length} crafts author it; the value carries (${lo}/${hi}) and the damage path never names it`);

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
