// coliseum.js — SNG-149 / CCODE-89: the Great Coliseum's BLIND GRID.
//
// Aevi authored the whole design (content/packs/core/rules/coliseum_grid.json, Law 15) and it sat as a design
// doc nothing read, with three champion encounters already written against it. This is the body.
//
// THE RULE, in her words: "Neither competitor picks their own ground: each brings FOUR function families drawn
// from what they actually practise, and then EACH CHOOSES FROM THE OTHER'S FOUR. You name which of your
// opponent's strengths you will take them on at; they name which of yours they will take you at; both picks
// are blind and simultaneous, and the intersection is the contest."
//
// WHY IT IS BUILT THIS WAY, which is the part worth protecting: "Under a blind grid a champion must be
// COMPLETE — you cannot take a title on your strongest cell because you will be pulled into your weakest."
// Every rule below exists to stop a specialist steering toward their best ground, so any change that makes the
// grid kinder to a narrow competitor is breaking the mechanic rather than tuning it.
//
// Pure: no I/O, no globals, rng injected — so a title match is reproducible and PvP is symmetric.

import { FUNCTION_FAMILIES, familiesOfAbility } from "./functions.js";

/** A weighted draw without replacement. Returns the picked key, or null when the bag is empty. */
function drawWeighted(weights, rng) {
  const entries = Object.entries(weights).filter(([, w]) => w > 0);
  if (!entries.length) return null;
  const total = entries.reduce((a, [, w]) => a + w, 0);
  let roll = rng() * total;
  for (const [k, w] of entries) { roll -= w; if (roll <= 0) return k; }
  return entries[entries.length - 1][0];
}

/** SNG-149 — THE FOUR SLOTS A COMPETITOR BRINGS.
 *
 *  Three are drawn from the families they actually practise, WEIGHTED by ability rank; the fourth is drawn at
 *  random from all eight, "including families you have never trained".
 *
 *  Weighted and not sorted, which Aevi is explicit about: "your deepest family is likeliest but not
 *  guaranteed, and a family you have touched once can come up." Sorting would hand a champion a predictable
 *  axis and let them prepare exactly four answers.
 *
 *  A competitor who practises fewer than three families exhausts their pool and takes the remaining slots at
 *  random from the eight — "THIS IS THE POINT. A specialist does not become harder to read; they become more
 *  exposed." So a narrow kit is not protected here, it is punished, deliberately.
 *
 *  Returns four family names with their provenance, so a receipt can say WHY each column is there. */
export function drawAxis(character, { catalog = {}, index = null, rng = Math.random, slots = 4, fromPractice = 3 } = {}) {
  const weights = {};
  for (const owned of (character?.abilities || [])) {
    const ab = catalog[owned?.abilityId];
    if (!ab) continue;
    const rank = Math.max(1, Number(owned.level) || 1);
    for (const fam of familiesOfAbility(ab, index)) weights[fam] = (weights[fam] || 0) + rank;
  }
  const out = [];
  const taken = new Set();
  const practised = { ...weights };
  for (let i = 0; i < Math.min(fromPractice, slots); i++) {
    const fam = drawWeighted(practised, rng);
    if (!fam) break;                       // the pool is exhausted — the remaining slots go wild below
    delete practised[fam];
    taken.add(fam);
    out.push({ family: fam, from: "practice", weight: weights[fam] });
  }
  // every remaining slot — the mandated wildcard, plus whatever a narrow competitor could not fill
  while (out.length < slots) {
    const open = FUNCTION_FAMILIES.filter(f => !taken.has(f));
    if (!open.length) break;
    const fam = open[Math.floor(rng() * open.length)];
    taken.add(fam);
    out.push({ family: fam, from: weights[fam] ? "wild (also practised)" : "wild", weight: weights[fam] || 0 });
  }
  return out;
}

/** The cell two families meet in. The pair is UNORDERED — HARM vs RESTORE and RESTORE vs HARM are the same
 *  contest — and a family against itself is a legal cell (both competitors' best is the same thing). */
export function cellFor(famA, famB, grid) {
  const want = [famA, famB].filter(Boolean);
  if (want.length < 2) return null;
  return (grid?.cells || []).find(c => {
    const f = c.families || [];
    return f.length === want.length && want.every(w => f.includes(w)) && f.every(x => want.includes(x));
  }) || null;
}

/** SNG-149 — THE PICK. A names one family from B's four; B names one from A's four; blind and simultaneous.
 *
 *  "Picking from your own axis would let a champion steer toward their best cell, which is what the blind grid
 *  exists to prevent." So a pick that names a family NOT on the opponent's axis is refused rather than
 *  silently coerced — a coerced pick would hand back exactly the steering the rule forbids, and it would do it
 *  invisibly. Returns `{ ok:false, why }` so a caller can re-ask.
 *
 *  The two picks give the two families of the cell; when both competitors name the same family, the contest is
 *  that family against itself, which the grid authors as a legal cell. */
export function resolvePick({ axisA, axisB, pickA, pickB, grid }) {
  const famsA = (axisA || []).map(s => s.family || s);
  const famsB = (axisB || []).map(s => s.family || s);
  if (!famsB.includes(pickA)) return { ok: false, why: `A named ${pickA}, which is not on B's axis — you may only pick from your OPPONENT's four` };
  if (!famsA.includes(pickB)) return { ok: false, why: `B named ${pickB}, which is not on A's axis — you may only pick from your OPPONENT's four` };
  const cell = cellFor(pickA, pickB, grid);
  if (!cell) return { ok: false, why: `no authored cell for ${pickA} × ${pickB}` };
  // ERIK'S CORRECTION, and it matters: THE TWO PICKS COMBINE INTO ONE MATCHUP. It is NOT that you fight
  // with one family while they fight with the other — the pair NAMES a single contest that both competitors
  // are in, and the cell defines it: "the influencer must talk the harmer out of the contest, on the sand,
  // in front of the crowd," judged by ONE criterion for both. Two separate grounds would be two fights.
  //
  // What the picks decide is which SEAT each competitor takes in that one contest. A picked from B's axis, so
  // the family A named is one B brought — B sits in it. B's pick puts A in the other. Neither ever chose
  // their own seat, which is the rule; but they are seats at the same table, not separate tables.
  return {
    ok: true, cell,
    matchup: { families: cell.families, contest: cell.contest, judged: cell.judged || null },
    seats: { a: pickB, b: pickA },
    reading: { aClaims: pickA, bClaims: pickB },
  };
}

/** What a pick SAYS, for the receipt — "the pick is a public read of your opponent" (Aevi).
 *  Take their deepest family and you are claiming you can beat them at what they are known for; take their
 *  wildcard and you are saying they are hollow outside their specialty. Both are arguments, and the grid is
 *  more interesting when the player can see which one they just made. */
export function readOfPick(pick, opponentAxis) {
  const slot = (opponentAxis || []).find(s => (s.family || s) === pick);
  if (!slot) return null;
  const practised = (opponentAxis || []).filter(s => s.from === "practice");
  const deepest = practised.slice().sort((a, b) => (b.weight || 0) - (a.weight || 0))[0];
  if (slot.from !== "practice") return { pick, kind: "wildcard", says: "you are calling them hollow outside their specialty" };
  if (deepest && slot.family === deepest.family) return { pick, kind: "deepest", says: "you are claiming you can beat them at the thing they are known for" };
  return { pick, kind: "middle", says: "you are aiming between their best and their blindest" };
}

/** SNG-149 / CCODE-89b — THE CHAMPION'S PICK. Deterministic ENGINE policy, never GM invention.
 *
 *  The pick has to be made by the engine for the same reason `opponentPolicy` exists: the narrator must not be
 *  the one deciding the mechanical ground, or a champion's read of you becomes whatever prose felt good this
 *  turn. It also has to be made BLIND — computed without seeing the player's pick — which is why it takes the
 *  player's AXIS and never their choice.
 *
 *  Aevi frames the pick as an argument: "Take their deepest family and you are claiming you can beat them at
 *  the thing they are known for. Take their wildcard and you are saying they are hollow outside their
 *  specialty." So a champion's policy is a CHARACTER TRAIT rather than an optimisation:
 *
 *   · `probing`  — take the wildcard. Most champions. Find the hole and stand in it.
 *   · `proving`  — take the deepest. A champion out to prove something takes you at your best.
 *   · `canny`    — take the middle: not their showpiece, not the obvious gap.
 *
 *  Ties and absent slots fall back to the wildcard, and the reason is returned so the receipt can say what
 *  argument the champion just made about you — which is the whole texture of the moment. */
export function championPick(playerAxis, { stance = "probing", rng = Math.random } = {}) {
  const slots = (playerAxis || []).filter(Boolean);
  if (!slots.length) return null;
  const practised = slots.filter(s => s.from === "practice");
  const wild = slots.filter(s => s.from !== "practice");
  const byDepth = practised.slice().sort((a, b) => (b.weight || 0) - (a.weight || 0));
  let chosen = null, why = "";
  if (stance === "proving" && byDepth.length) {
    chosen = byDepth[0]; why = "they are taking you at the thing you are known for";
  } else if (stance === "canny" && byDepth.length > 1) {
    chosen = byDepth[Math.floor(byDepth.length / 2)]; why = "they are aiming between your showpiece and your gap";
  } else if (wild.length) {
    chosen = wild[Math.floor(rng() * wild.length)]; why = "they are calling you hollow outside your specialty";
  } else {
    chosen = byDepth[byDepth.length - 1] || slots[0]; why = "they are taking the shallowest ground you brought";
  }
  return { family: chosen.family, stance, why };
}
