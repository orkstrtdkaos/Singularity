// ⛔ CCODE-448 — THE ORDER OF BATTLE: A TURN BY STANCE. Erik reviewed the Fell Pell prototype (rounds 1–6) and asked for what it showed:
// "I don't see the party or the legion tabs nor the other updates from the prototype yet. I would prioritize those."
//
// ⚑ ONE MODEL, THREE READERS — the Party tab, the band's turn on the Bands tab, and the Legion tab — and the fight turn that the GM tells:
//  · A STANCE (cautious / balanced / aggressive) is a set of weights over what a side does: read, guard, mend, strike, move, break.
//  · A BAND'S TURN IS ALLOCATED, NOT ITS BEST PERSON. Everyone acts once; the stance cuts the turn into slots (`slotsFor`), and each person
//    takes the slot where they are best RELATIVE TO EVERYONE ELSE — an optimal assignment (`hungarian`), with a small nudge toward the role
//    they hold in the band. Hands (a contingent) are alike, so they split across what they do by the same weights; no assignment needed.
//  · AN ALLY'S CRAFT THIS ROUND is the one whose outcomes are worth most, weighed by their stance, and a PREFERRED craft (★) half again —
//    like the player's own boost.
//  · Every number is the game's own roll: `jobCraftsOf` (successChance at the opposition, the crit dials, the five outcomes), the same
//    dice the Jobs tab uses. The stance weights are the prototype's, which Erik reviewed; `rules.stances` wins when Aevi authors it.
import { jobCraftsOf, oddsWorth } from "./jobs.js";

const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

export const FIGHT_FAMILIES = ["HARM", "PROTECT", "RESTORE", "KNOW", "MOVE", "SHAPE"];
export const STANCE_NAMES = ["cautious", "balanced", "aggressive"];
export const FAMILY_WORDS = { HARM: "strike", PROTECT: "guard", RESTORE: "mend", KNOW: "read the ground", MOVE: "move fast", SHAPE: "build and break" };
export const FAMILY_LANDS = { HARM: "blows land", PROTECT: "guards hold", RESTORE: "wounds mended", KNOW: "reads true", MOVE: "moves made", SHAPE: "works done" };
export const DEGREE_WORDS = { crit_success: "strong success", success: "success", partial: "partial", failure: "failure", crit_failure: "critical failure" };

export const STANCE_DEFAULTS = {
  _standIn: "the prototype's weights, reviewed by Erik in rounds 3–6 — rules.stances wins when authored",
  cautious: { say: "reads and guards before it strikes", w: { KNOW: 3, PROTECT: 3, RESTORE: 2, HARM: 1, MOVE: 1, SHAPE: 0.5 } },
  balanced: { say: "does a little of everything", w: { HARM: 2, PROTECT: 2, KNOW: 2, RESTORE: 1.5, MOVE: 1, SHAPE: 1 } },
  aggressive: { say: "strikes and breaks first", w: { HARM: 4, SHAPE: 2, MOVE: 2, PROTECT: 1, KNOW: 1, RESTORE: 0.5 } },
};

/** The stances in force: the stand-ins, with any authored `rules.stances` laid over them stance by stance. Pure. */
export function stanceTable(authored = null) {
  const out = {};
  for (const s of STANCE_NAMES) out[s] = { ...STANCE_DEFAULTS[s], w: { ...STANCE_DEFAULTS[s].w } };
  for (const [k, v] of Object.entries(authored && typeof authored === "object" ? authored : {})) {
    if (!STANCE_NAMES.includes(k) || !v || typeof v !== "object") continue;
    out[k] = { ...out[k], ...v, w: { ...out[k].w, ...(v.w || {}) } };
  }
  return out;
}
/** A valid stance name — anything else is "balanced". Pure. */
export function stanceOf(x) { return STANCE_NAMES.includes(String(x)) ? String(x) : "balanced"; }

/** How much of a set of outcome odds lands: a success or better counts whole, a partial half. Pure. */
export function landsOf(odds) { return odds ? num(odds.crit_success) + num(odds.success) + 0.5 * num(odds.partial) : 0; }

/** CUT n ACTIONS INTO SLOTS BY WEIGHT — largest remainder, ties to the heavier family. Pure. */
export function slotsFor(n, weights = {}) {
  const fams = Object.keys(weights).filter(f => num(weights[f]) > 0);
  const total = fams.reduce((a, f) => a + num(weights[f]), 0);
  const out = Object.fromEntries(fams.map(f => [f, 0]));
  if (!(n > 0) || !total) return out;
  const exact = fams.map(f => ({ f, x: n * num(weights[f]) / total }));
  for (const e of exact) out[e.f] = Math.floor(e.x);
  let left = n - Object.values(out).reduce((a, b) => a + b, 0);
  exact.sort((a, b) => (b.x - Math.floor(b.x)) - (a.x - Math.floor(a.x)) || num(weights[b.f]) - num(weights[a.f]));
  for (const e of exact) { if (left <= 0) break; out[e.f]++; left--; }
  return out;
}

/** THE ASSIGNMENT: a square cost matrix → row → column, minimising the total (the classic O(n³)). Pure. */
export function hungarian(cost) {
  const n = cost.length;
  if (!n) return [];
  const u = Array(n + 1).fill(0), v = Array(n + 1).fill(0), p = Array(n + 1).fill(0), way = Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = Array(n + 1).fill(Infinity), used = Array(n + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity, j1 = 0;
      for (let j = 1; j <= n; j++) if (!used[j]) {
        const cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
        if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
        if (minv[j] < delta) { delta = minv[j]; j1 = j; }
      }
      for (let j = 0; j <= n; j++) { if (used[j]) { u[p[j]] += delta; v[j] -= delta; } else minv[j] -= delta; }
      j0 = j1;
    } while (p[j0] !== 0);
    do { const j1 = way[j0]; p[j0] = p[j1]; j0 = j1; } while (j0);
  }
  const ans = Array(n).fill(-1);
  for (let j = 1; j <= n; j++) if (p[j]) ans[p[j] - 1] = j - 1;
  return ans;
}

/** A person's fighting crafts at this opposition, each with its odds and what it is worth. Pure over the person given. */
function fightCraftsOf(person, { rules = {}, fnIndex = null, opposed = 0 } = {}) {
  return jobCraftsOf(person, { rules, fnIndex, opposed }).filter(c => FIGHT_FAMILIES.includes(c.family))
    .map(c => ({ ...c, w: oddsWorth(c.odds, rules) }));
}
const bestIn = (crafts, family) => crafts.filter(c => c.family === family).reduce((b, c) => (!b || c.w > b.w ? c : b), null);

/** ⛔ ONE TURN OF A BAND, BY STANCE. `members` are job-shaped people (`jobPersonFor`) and hands (`jobUnitFor`, `isUnit` with `n`).
 *  People: the stance cuts their turn into slots and each takes the slot they are best at relative to the rest; `roleOf(id)` may name the
 *  families their band role is for, worth a small nudge. Hands: their `n` heads split across the families they do, by the same weights.
 *  → { stance, slots, rows: { FAMILY: [{ id, name, n, craft, chance, odds, role }] }, of: { id: FAMILY }, expected: { FAMILY: lands } }. Pure. */
export function allocateTurn(members = [], { stance = "balanced", table = null, rules = {}, fnIndex = null, opposed = 0, roleOf = null } = {}) {
  const T = table || stanceTable(rules?.stances || null);
  const st = stanceOf(stance);
  const w = T[st].w;
  const people = (members || []).filter(m => m && !m.isUnit);
  const hands = (members || []).filter(m => m && m.isUnit && num(m.n) > 0);
  const rows = {}, of = {}, expected = {};
  const add = (f, e) => { (rows[f] ||= []).push(e); expected[f] = num(expected[f]) + landsOf(e.odds) * (e.n || 1); };
  const slots = slotsFor(people.length, w);
  const cols = Object.entries(slots).flatMap(([f, k]) => Array(k).fill(f));
  if (people.length && cols.length === people.length) {
    const crafts = people.map(p => fightCraftsOf(p, { rules, fnIndex, opposed }));
    const value = (i, f) => {
      const b = bestIn(crafts[i], f);
      const role = typeof roleOf === "function" && (roleOf(people[i].id) || []).includes(f);
      return (b ? b.w : -60) + (role ? 5 : 0);
    };
    const pick = hungarian(people.map((_, i) => cols.map(f => 200 - value(i, f))));
    people.forEach((p, i) => {
      const f = cols[pick[i]];
      const b = bestIn(crafts[i], f);
      of[p.id] = f;
      add(f, { id: p.id, name: p.short || p.name || p.id, n: 1, craft: b ? b.name : null, chance: b ? b.chance : null, odds: b ? b.odds : null,
        role: typeof roleOf === "function" && (roleOf(p.id) || []).includes(f) });
    });
  }
  for (const u of hands) {
    const can = (u.does || []).filter(f => FIGHT_FAMILIES.includes(f) && num(w[f]) > 0);
    if (!can.length) continue;
    const split = slotsFor(num(u.n), Object.fromEntries(can.map(f => [f, w[f]])));
    const crafts = fightCraftsOf(u, { rules, fnIndex, opposed });
    for (const [f, k] of Object.entries(split)) {
      if (!k) continue;
      const b = bestIn(crafts, f);
      add(f, { id: u.id, name: u.label || u.short || u.name || u.id, n: k, unit: true, craft: b ? b.name : null, chance: b ? b.chance : null, odds: b ? b.odds : null, role: false });
    }
    of[u.id] = Object.entries(split).filter(([, k]) => k > 0).map(([f]) => f).join("+");
  }
  for (const f of Object.keys(expected)) expected[f] = Math.round(expected[f] * 10) / 10;
  return { stance: st, slots, rows, of, expected };
}

/** ⛔ AN ALLY'S CRAFT THIS ROUND: the fighting craft whose outcomes are worth most, weighed by their stance, and a preferred craft (★) half
 *  again. Null when they have nothing to fight with. Pure. */
export function allyChoice(person, { stance = "balanced", prefer = [], table = null, rules = {}, fnIndex = null, opposed = 0 } = {}) {
  const T = table || stanceTable(rules?.stances || null);
  const w = T[stanceOf(stance)].w;
  const liked = new Set((prefer || []).map(String));
  let best = null;
  for (const c of fightCraftsOf(person, { rules, fnIndex, opposed })) {
    const s = c.w * num(w[c.family]) * (liked.has(String(c.id)) ? 1.5 : 1);
    if (!best || s > best.s) best = { ...c, s, preferred: liked.has(String(c.id)) };
  }
  return best;
}

/** Roll one set of outcome odds to a degree. Pure given `rng`. */
export function rollOdds(odds, rng = Math.random) {
  let x = rng();
  for (const k of ["crit_success", "success", "partial", "failure", "crit_failure"]) { x -= num(odds?.[k]); if (x <= 0) return k; }
  return "failure";
}

/** ⛔ THE PARTY'S ROUND: each ally rolls the craft their stance and preferences choose; the ones brought forward are told by name and
 *  craft, the rest are the line. `allies` are job-shaped people; `orders` is { id: { stance, prefer } }; `forward` the ids brought forward.
 *  → { forward: [act], folded: [act], directive } where an act is { id, name, craft, verb, family, degree, said }. Pure given `rng`. */
export function partyRound(allies = [], { orders = {}, forward = [], rng = Math.random, ...ctx } = {}) {
  const fwd = new Set((forward || []).map(String));
  const acts = [];
  for (const a of allies || []) {
    const o = orders?.[a.id] || {};
    const c = allyChoice(a, { ...ctx, stance: o.stance, prefer: o.prefer || [] });
    if (!c) continue;
    const degree = rollOdds(c.odds, rng);
    acts.push({ id: a.id, name: a.short || a.name || a.id, craft: c.name, verb: c.verb || null, family: c.family, degree, said: DEGREE_WORDS[degree] });
  }
  const f = acts.filter(x => fwd.has(String(x.id))), rest = acts.filter(x => !fwd.has(String(x.id)));
  return { forward: f, folded: rest, directive: partyDirective(f, rest) };
}

/** What the GM is handed for a party round — the outcomes decided, each named by craft; the GM tells them and does not change them. Pure. */
export function partyDirective(forward = [], folded = []) {
  if (!forward.length && !folded.length) return "";
  const line = (x) => `${x.name} uses ${x.craft}${x.verb ? ` (${x.verb})` : ""} — ${String(x.said || x.degree).toUpperCase()}`;
  return [`THE PARTY'S ROUND — the engine rolled each ally's craft; tell these, in this order:`,
    ...forward.map(x => `- ${line(x)}. Say what it does, by name.`),
    ...(folded.length ? [`- In the line, acting for themselves: ${folded.map(line).join("; ")}.`] : []),
    `The outcomes are decided; tell them, do not change them.`].join("\n");
}
