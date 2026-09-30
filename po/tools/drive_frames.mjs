// ⛑ AEVI item 9, driven over the WHOLE matrix — 44 feature kinds × 5 frames + rooted — through `canBuildOn`, the function
// the Build tab and the GM's build op both call. Erik's own case is one cell of it.
const CR = await import("../../engine/carriage.js");
const { loadContentHeadless } = await import("../../tests/headless_content.mjs");
const C = await loadContentHeadless();
const kinds = C.rules.economy.holdFeatures.kinds || C.rules.economy.holdFeatures;
const frames = C.rules.economy.holdStore?.slots?.frames?.kinds || {};
const frameNames = Object.keys(frames).filter(f => !f.startsWith("_"));
const on = (frame) => frame === null ? { id: "rooted", name: "a rooted place" }
  : { id: frame, name: frame, carriage: { moves: String(frames[frame].moves).toLowerCase(), speed: 1 } };
let fails = 0;
const check = (ok) => { if (!ok) fails++; return ok ? "ok" : "⛔ FAIL"; };

/* ══ 1 · ERIK'S OWN CASE ══════════════════════════════════════════════════════════════════ */
console.log(`\n══ 1 · "It said I can't have a keep on a moving hold"\n`);
for (const f of frameNames) {
  const r = CR.canBuildOn(on(f), "keep", kinds, frames);
  console.log(`  a keep on ${f.padEnd(7)} -> ${r.ok ? "yes" : `no  — ${r.why}`}`);
}
const legs = CR.canBuildOn(on("legs"), "keep", kinds, frames);
const hull = CR.canBuildOn(on("hull"), "keep", kinds, frames);
console.log(`\n  ${check(legs.ok && !hull.ok)} — a keep stands on legs (the walking fortress) and still not in a hull`);

/* ══ 2 · THE WHOLE MATRIX, AGAINST HER SENTENCE ═══════════════════════════════════════════ */
console.log(`\n══ 2 · the nine that declare \`hullable: false\`, over every frame\n`);
const her = {
  keep: "not a hull", gate: "not a hull", muster_yard: "not a hull", ward_line: "not a hull",
  mine: "rooted", quarry: "rooted", grave_ground: "rooted", reclamation_bowl: "rooted",
  // ⚠️ WAYGATE IS NOT A FRAME QUESTION AT ALL, and asserting "rooted" for it here was MY driver being wrong rather
  // than the reader. Aevi's "never built" is enforced at the BUILD door — `featureCost` reports `buildable: false` and
  // `addFeature` refuses with the authored sentence — so `canBuildOn` answering "any frame but a hull" for it is a frame
  // answer to a question nobody asks of it. ⛑ §7 drives BOTH doors and gates their AGREEMENT, which is the real check.
  waygate: "not a hull",
};
console.log(`  kind                 rooted  ${frameNames.map(f => f.padEnd(7)).join("")} aevi         verdict`);
for (const [k, want] of Object.entries(her)) {
  const cells = [null, ...frameNames].map(f => CR.canBuildOn(on(f), k, kinds, frames).ok);
  const got = cells[0] && cells.slice(1).every(x => !x) ? "rooted"
    : cells[0] && cells.slice(1).every((x, i) => x === (frameNames[i] !== "hull")) ? "not a hull"
    : cells.every(x => x) ? "anything" : "mixed";
  console.log(`  ${k.padEnd(20)} ${cells.map(x => (x ? "yes" : "no").padEnd(7)).join(" ").padEnd(8 + frameNames.length * 8)}${want.padEnd(13)}${check(got === want)}`);
}

/* ══ 3 · THE OTHER 35 STILL RIDE ══════════════════════════════════════════════════════════ */
console.log(`\n══ 3 · nothing else changed\n`);
const others = Object.keys(kinds).filter(k => !k.startsWith("_") && typeof kinds[k] === "object" && !(k in her));
const refused = others.filter(k => frameNames.some(f => !CR.canBuildOn(on(f), k, kinds, frames).ok));
console.log(`  ${others.length} other feature kind(s); refused on some frame: ${refused.length ? refused.join(", ") : "none"}`);
console.log(`  ${check(refused.length === 0)} — a kind that said nothing about frames is carried by anything, as before`);

/* ══ 4 · CONTENT WINS, SO AEVI CAN AUTHOR IT AND THE ENGINE DOES NOT MOVE ═════════════════ */
console.log(`\n══ 4 · her content overrides the table\n`);
const authored = { ...kinds, keep: { ...kinds.keep, frames: ["legs", "grown"] }, mine: { ...kinds.mine, rootedOnly: true } };
for (const f of frameNames) {
  const r = CR.canBuildOn(on(f), "keep", authored, frames);
  console.log(`  authored frames:["legs","grown"] — keep on ${f.padEnd(7)} -> ${r.ok ? "yes" : "no"}`);
}
const a1 = CR.canBuildOn(on("legs"), "keep", authored, frames).ok && !CR.canBuildOn(on("lift"), "keep", authored, frames).ok;
const a2 = frameNames.every(f => !CR.canBuildOn(on(f), "mine", authored, frames).ok);
console.log(`  ${check(a1 && a2)} — an authored list is obeyed exactly, and \`rootedOnly\` refuses every frame`);

/* ══ 5 · A CALLER THAT DOES NOT PASS THE FRAMES STAYS AS STRICT AS TODAY ══════════════════ */
console.log(`\n══ 5 · the old three-argument call\n`);
const oldish = frameNames.every(f => !CR.canBuildOn(on(f), "keep", kinds).ok);
console.log(`  canBuildOn(ship, "keep", kinds) with no frames -> refused on all ${frameNames.length} frames: ${oldish}`);
console.log(`  ${check(oldish)} — a caller I missed keeps TODAY's answer instead of silently opening up`);

/* ══ 6 · ONE DEFINITION OF "WHICH FRAME" ══════════════════════════════════════════════════ */
console.log(`\n══ 6 · roomOf and canBuildOn agree which frame a hold is on\n`);
const H = await import("../../engine/holdings.js");
const cfg = { ...C.rules.economy.holdStore, features: C.rules.economy.holdFeatures };
for (const f of frameNames) {
  const h = { id: "x", kind: "post", condition: "holding", ...on(f), features: [] };
  const room = H.roomOf(h, cfg);
  const mine = CR.frameOf(h, frames);
  console.log(`  moves ${String(frames[f].moves).padEnd(9)} roomOf says ${String(room?.frame).padEnd(7)} frameOf says ${String(mine).padEnd(7)} ${check(room?.frame === mine)}`);
}

/* ══ 7 · THE FRAME DOOR AND THE BUILD DOOR AGREE ════════════════════════════════ */
console.log(`\n══ 7 · what \`canBuildOn\` allows, \`addFeature\` actually builds\n`);
const H7 = await import("../../engine/holdings.js");
const cfg7 = { ...C.rules.economy.holdStore, features: C.rules.economy.holdFeatures };
// ⛔ THE ID COMES LAST, and that is the whole lesson: my first version spread `...on(f)` last, so the hold's id became
// "legs" while `addFeature` was asked for "h1" — it found nothing, refused everything, and this section reported ZERO
// disagreements over 264 pairs that never built a thing. The gate in how_it_works found 24.
const mk = (f) => ({ name: "T", kind: "post", condition: "holding", locationId: "millbrook",
  features: [], store: { cut_stone: 9999, raw_material: 9999, ore: 9999 }, ...on(f), id: "h1" });
let disagree = 0, pairs = 0, built0 = 0;
for (const k of Object.keys(kinds).filter(x => !x.startsWith("_") && typeof kinds[x] === "object")) {
  for (const f of [null, ...frameNames]) {
    const h = mk(f);
    const ch = { name: "T", holdings: [h], purse: { crystal: 99999, scrip: {} } };
    const frameSays = CR.canBuildOn(h, k, kinds, frames);
    const built = H7.addFeature(ch, "h1", { kind: k, by: "you", day: 1, worldCount: 1, cfg: cfg7, via: "built" });
    pairs++; if (built.ok !== false) built0++;
    // ⛔ THE ONE THING THAT MUST NEVER HAPPEN: the frame door says no and the build door builds it anyway.
    if (!frameSays.ok && built.ok !== false) { disagree++; console.log(`  ⛔ ${k} on ${f || "rooted"}: the frame door refused and the build door BUILT it`); }
  }
}
console.log(`  ${pairs} (kind × frame) pairs driven through BOTH doors`);
// ⚠️ AND THE SWEEP HAS TO HAVE BUILT SOMETHING, or a fixture that makes nothing agrees with every rule.
console.log(`  of which ${built0} actually built — ${check(built0 > 0)} (a sweep that builds nothing agrees with anything)`);
console.log(`  ${check(disagree === 0)} — nothing the frame door refuses gets built (${disagree} disagreement(s))`);
const wg = [null, ...frameNames].every(f => H7.addFeature({ name: "T", holdings: [mk(f)], purse: { crystal: 9999, scrip: {} } },
  "h1", { kind: "waygate", by: "you", day: 1, worldCount: 1, cfg: cfg7, via: "built" }).ok === false);
console.log(`  ${check(wg)} — and a waygate is refused on the ground and on all ${frameNames.length} frames: her "never built", already enforced`);

console.log(`\n${fails ? `⛔ ${fails} check(s) FAILED` : "✅ every check passed"}\n`);
process.exit(fails ? 1 : 0);
