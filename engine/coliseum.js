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

/* ═════ Y · THE BENCH — WHO FIGHTS AT THE CROSSING, AND WHERE THEY ARE FROM ═════
 *
 * ✅ ERIK, 2026-10-04: *"every reach and distinct people should have at least one gladiator, if not a whole
 * bench. The coliseum is central in the culture here."*
 *
 * ⛑ THE CONTENT IS AEVI'S (SNG-669) AND THIS IS ONLY THE READER. `challengerPools.coliseum_bench` carries ten
 * heads — each reach's existing champion by `npcId` — and thirty-two contenders and novices. Measured: all 38
 * regions covered, and the pool beside it (`saehara_challengers`, an arc's) carries no `reach` at all, so a
 * reach-keyed reader excludes it without needing to know its name. */

/** ⛔ THE BENCH BY REACH. Pure. Heads and challengers grouped by where they are from, so "our Haldor fights at
 *  the Crossing" is a thing the GM can say ANYWHERE in that reach, not only at the sand. */
export function benchAt(content, { reach = null } = {}) {
  const pools = content?.challengerPools;
  const by = {};
  const push = (where, slot, row) => {
    const k = String(where || "").trim();
    if (!k) return;                        // ⛑ no reach, not a bench member — that is what keeps other pools out
    (by[k] = by[k] || { reach: k, heads: [], challengers: [] })[slot].push(row);
  };
  for (const pool of Object.values(pools && typeof pools === "object" ? pools : {})) {
    if (pool?.kind !== "challenger_pool") continue;
    for (const h of pool.heads || []) push(h?.reach, "heads", h);
    for (const c of pool.challengers || []) push(c?.reach, "challengers", c);
  }
  return reach ? (by[reach] || { reach, heads: [], challengers: [] }) : by;
}

/** ⚠️ WEIGHTED BY THE ORDER THEY ARE LISTED IN. Aevi's Y2: the blind-grid four come from `families`
 *  *"(weighted, the fourth drawn from all eight, exactly as `drawAxis` does for a competitor)"* — but a bench
 *  member has a flat list where a player has ability ranks, so there is no weight in the data.
 *  ⛑ MY READING, AND IT IS A READING: the first family listed is the one they are known for, so it is
 *  likeliest. Two families weight 2:1, three weight 3:2:1. Equal weights were the other option and would make
 *  "weighted" mean nothing. Asked in po/CCODE_20261004_the_bench.md.
 *
 *  ⛔ THE REST OF THE RULE IS `drawAxis`'s, UNCHANGED, and deliberately so: three from what they practise, the
 *  fourth from all eight including families they have never trained. A specialist does not become harder to
 *  read; they become more exposed. */
export function benchAxis(member, { rng = Math.random, slots = 4, fromPractice = 3 } = {}) {
  const fams = (member?.families || []).filter((f) => FUNCTION_FAMILIES.includes(f));
  const weights = {};
  fams.forEach((f, i) => { weights[f] = fams.length - i; });
  const out = [], taken = new Set();
  const practised = { ...weights };
  for (let i = 0; i < Math.min(fromPractice, slots); i++) {
    const fam = drawWeighted(practised, rng);
    if (!fam) break;
    delete practised[fam];
    taken.add(fam);
    out.push({ family: fam, from: "practice", weight: weights[fam] });
  }
  while (out.length < slots) {
    const open = FUNCTION_FAMILIES.filter((f) => !taken.has(f));
    if (!open.length) break;
    const fam = open[Math.floor(rng() * open.length)];
    taken.add(fam);
    out.push({ family: fam, from: weights[fam] ? "wild (also practised)" : "wild", weight: weights[fam] || 0 });
  }
  return out;
}

/** ⛔ A BOUT FROM THE BENCH — by reach, by people, by rank, in any combination. Returns the challenger and the
 *  four they bring, so the caller can hand it straight to the grid.
 *  ⛑ A HEAD IS NOT OFFERED HERE. Aevi: *"Heads keep their authored encounters."* They are a reach's champion
 *  and they have a written fight; drawing one as a random bout would throw that away. */
export function benchBout(content, { reach = null, people = null, rank = null, rng = Math.random, exclude = [] } = {}) {
  const all = Object.values(benchAt(content)).flatMap((r) => r.challengers);
  const skip = new Set(exclude);
  const pool = all.filter((c) =>
    !skip.has(c.id)
    && (!reach || c.reach === reach)
    && (!people || String(c.people || "").toLowerCase() === String(people).toLowerCase())
    && (!rank || String(c.rank || "").toLowerCase() === String(rank).toLowerCase()));
  if (!pool.length) return null;
  const pick = pool[Math.floor(rng() * pool.length)];
  return { challenger: pick, axis: benchAxis(pick, { rng }), reach: pick.reach, people: pick.people || null };
}

/** ⛔ WHO IS ON THE CARD TODAY, for the GM. ⚠️ IT SAYS WHERE THEY ARE FROM, because that is the whole point of
 *  the bench: Erik asked for *"every reach and distinct people"*, and a card that does not say which reach a
 *  fighter carries is a list of names.
 *  ⛑ `here` is the reach the player is standing in; its own bench is called out separately so the GM can
 *  mention it away from the Crossing — *"our Haldor fights at the Crossing."* */
export function benchForGM(content, { here = null, npcs = null, day = 0, card = 3 } = {}) {
  const by = benchAt(content);
  const reaches = Object.keys(by);
  if (!reaches.length) return null;
  const all = reaches.flatMap((r) => by[r].challengers);
  if (!all.length) return null;
  // ⛑ ROTATED BY THE DAY, NOT ROLLED — the same rule `verbForPass` uses, so the card is reproducible and a
  // fighter works their way round rather than appearing five days running by luck.
  const n = Math.max(1, Math.min(card, all.length));
  const today = [];
  for (let i = 0; i < n; i++) today.push(all[(Math.abs(Math.round(day)) * n + i) % all.length]);
  const nameOf = (id) => (npcs && npcs[id]?.name) || id;
  const say = (c) => `${c.name} — ${c.rank || "fighter"} of ${c.reach}${c.people ? `, ${c.people}` : ""}${c.record ? ` (${c.record})` : ""}`;
  const mine = here && by[here] ? by[here] : null;
  return {
    note: "A HOUSE OF THE CROSSING, not a side-show: every reach keeps fighters here, and a reach's own bench is "
      + "something its people talk about at home. Heads are that reach's champion and have their own encounters; "
      + "the contenders and novices below are who can be matched today.",
    onTheCard: today.map((c) => ({ id: c.id, name: c.name, reach: c.reach, people: c.people || null,
      rank: c.rank || null, style: c.style || null, say: say(c) })),
    fromHere: mine ? {
      reach: here,
      champion: (mine.heads || []).map((h) => ({ npcId: h.npcId, name: nameOf(h.npcId), cell: h.cell || null })),
      fighters: (mine.challengers || []).map((c) => ({ id: c.id, name: c.name, rank: c.rank || null, say: say(c) })),
    } : null,
    reaches: reaches.length,
  };
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

/** SNG-149 / CCODE-89d — THE SECOND GRID. Erik: "this is just Stile's challenges in the Blue Adept books."
 *
 *  That is the Game on Proton, and it names the shape exactly: the first grid picks the CATEGORY and a second
 *  4x4 inside it picks the actual contest. Aevi specced the same thing — "the first grid asks what KIND of
 *  person you are; the second asks WHO YOU SPECIFICALLY HAVE BEEN" — and it is the half that turns a category
 *  into a particular afternoon on the sand.
 *
 *  So the second axis is drawn from BIOGRAPHY, not from craft: your origin, your background, the roles people
 *  have known you in, and the deeds that travelled. Same blind rule, same refusal to let anyone pick their own
 *  ground — `resolvePick` takes this axis unchanged, because a grid is a grid.
 *
 *  Returns four entries, or fewer when a character genuinely has less history — a person with no record has a
 *  short second axis, and that is a true thing about them rather than a gap to pad. */
export function drawBackgroundAxis(bearer, { rng = Math.random, slots = 4 } = {}) {
  const seen = new Set(), pool = [];
  const add = (label, what, from) => {
    const key = String(label || "").trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key); pool.push({ family: label, what, from });
  };
  add(bearer?.origin, "where you are from", "origin");
  add(bearer?.background, "what was done to you", "background");
  for (const r of (bearer?.rolesKnownFor || [])) add(r, "how people have known you", "role");
  // Deeds that TRAVELLED are the ones an opponent could have heard — the same `spread` test standing uses, so
  // the second grid cannot know something the world does not.
  for (const d of (bearer?.deeds || [])) if ((d?.spread || []).length) add(d.description, "what you are known to have done", "deed");
  const out = [];
  const bag = pool.slice();
  while (out.length < slots && bag.length) out.push(...bag.splice(Math.floor(rng() * bag.length), 1));
  return out;
}
