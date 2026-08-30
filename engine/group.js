// engine/group.js — CCODE-307. A GROUP IS A CAPABILITY SET, NOT A POOL OF HITPOINTS.
//
// ⛔ ERIK'S DESIGN, via `po/SPEC_group_aggregation.md`: "A player is generally capable — wards, healing,
// damage types, senses, ALL THE THINGS. A party is generally all the things, but even more gaps covered. A
// band is even more so, IF IT HAS HEROES IN IT. But if it's a military unit it's a bit different… Our job
// is to AGGREGATE THE GROUPINGS so you have group stats/abilities that can be put up against another
// group's — with attrition the group LOSES CAPABILITY THROUGH LOSS OF INDIVIDUALS AND THROUGH LOSS OF
// COHESION."
//
// ⚠️ THIS SUPERSEDES THE CASUALTY-POOL QUESTION RATHER THAN ANSWERING IT, and Aevi is right that it does.
// My four tuning questions assumed a folded party is a pool of hitpoints. It is not:
//
//     losing the only healer      → a CLIFF. Coverage goes to zero and no remaining bodies replace it.
//     losing one of six spears    → a SLOPE. Depth drops; coverage is untouched.
//
// ⛔ A POOL CANNOT EXPRESS THAT DIFFERENCE, AND IT IS THE WHOLE DIFFERENCE.
//
// ══ THE VOCABULARY IS NEVER ENUMERATED HERE ══════════════════════════════════════════════════════════
// ⛔ AEVI'S §6, WHICH IS ERIK'S CONSTRAINT: "the capability vocabulary must be DERIVED, never enumerated…
// a group model with a fixed set of five capabilities is a model that breaks the day a tradition is
// audited and a sixth appears." So NOTHING in this file names a family. Coverage is the union of whatever
// `contributionsOf` returns, and if the corpus grows a seventh family this file needs no edit.
//
// ⚠️ AND ONE CORRECTION TO THE SPEC, MEASURED: §6 says `contributionsOf` "already derives from
// `tagFamilies`… rather than a hardcoded list — keep that." IT DERIVES FROM A PARAMETER NOTHING SUPPLIES.
// Every live call passes `opts` without `tagFamilies`, so `DEFAULT_TAG_FAMILIES` — a hardcoded map of six
// — is always what runs. The only writer in the repo is one line of `smoke.mjs`. ⛔ A READER WITH A
// TEST-ONLY WRITER IS NOT A DERIVED VOCABULARY; it is a hardcoded one with a seam. That seam is worth
// keeping and worth FILLING, and this file threads `opts` through untouched so filling it reaches here too.

import { contributionsOf, isDowned } from "./combatants.js";

const num = (v, d = 0) => (v == null || v === "" || !Number.isFinite(Number(v)) ? d : Number(v));

/** ⚠️ HOW MUCH OF WHAT IT HAS CAN A GROUP ACTUALLY BRING. Structure sets the ceiling: a drilled unit
 *  fights as one, a scratch band does not. ⛔ DEFAULTS TO 1.0 — A NO-OP — so every existing caller sees
 *  exactly today's behaviour until content declares a structure. Reader before field, again. */
// ⚠️ NOT EXPORTED. `wiring_audit` flagged this and `cohesionOf` as reachable only from a test, and the
// audit's own header warns that its `registry:internal` marker must NEVER be used to make a number go
// down. It would have applied cleanly here and been the wrong thing: the marker HIDES an unreachable
// export, where narrowing the surface REMOVES it. Only `groupCapability` needs these.
const STRUCTURE_COHESION = Object.freeze({
  drilled: 1.0,     // a military unit — the reason a legion is not just a big band
  ordered: 0.9,     // a standing company, a temple guard
  band: 0.8,        // heroes who choose to travel together
  scratch: 0.65,    // strangers in the same fight
});

/**
 * The live capability of a group, and what it has lost.
 *
 * ⛔ MEMBERS MAY BE PEOPLE **OR** GROUPS. Aevi's §5.2: "a unit is a group of groups; the function should
 * not care which rung it is on." A member carrying `.capability` is folded in as a sub-group, so a legion
 * built from cohorts built from squads aggregates with the same call at every rung.
 *
 * @returns {{coverage:string[], depth:Object, sole:string[], cohesion:number, standing:number,
 *            down:number, lost:Array, lostCoverage:string[], members:number}}
 */
export function groupCapability(members = [], opts = {}) {
  const { structure = null, leaderIds = [], cohesionFloor = 0.15 } = opts;
  const depth = Object.create(null);      // family → how many standing members supply it
  const everDepth = Object.create(null);  // family → how many supplied it BEFORE casualties
  const lost = [];
  let standing = 0, down = 0, leadersDown = 0;

  const bump = (bag, fam, n = 1) => { bag[fam] = (bag[fam] || 0) + n; };

  for (const m of (members || [])) {
    if (!m) continue;
    // ⚠️ ABSENT IS NOT DOWNED. `present === false` means they are not in this fight at all (CCODE-272), so
    // they are neither capability nor casualty — counting them as losses would make withdrawing look like
    // being cut down, and the two mean opposite things.
    if (m.present === false) continue;

    const sub = m.capability || (m.members ? groupCapability(m.members, opts) : null);
    if (sub) {
      // ⛔ A SUB-GROUP CONTRIBUTES ITS DEPTH, NOT ONE VOTE. Folding a 40-strong cohort in as a single
      // "member" is how an aggregate stops matching the fight it replaces.
      for (const [f, n] of Object.entries(sub.depth || {})) bump(depth, f, n);
      for (const [f, n] of Object.entries(sub.everDepth || sub.depth || {})) bump(everDepth, f, n);
      standing += num(sub.standing, 0);
      down += num(sub.down, 0);
      for (const l of (sub.lost || [])) lost.push(l);
      continue;
    }

    const fams = contributionsOf(m.record || m, opts);
    for (const f of fams) bump(everDepth, f);
    if (isDowned(m)) {
      down++;
      lost.push({ id: m.id, name: m.name, contributions: fams });
      if (leaderIds.includes(m.id)) leadersDown++;
    } else {
      standing++;
      for (const f of fams) bump(depth, f);
    }
  }

  const coverage = Object.keys(depth).filter(f => depth[f] > 0);
  // ⛔ THE CLIFF EDGE, NAMED BEFORE IT IS FALLEN OFF. A family held by exactly ONE standing member is one
  // casualty away from leaving the group entirely. ⚠️ This is the number a player should be able to SEE:
  // the nine authored `downedEffect`s are all written as exactly this and nobody called it that.
  const sole = coverage.filter(f => depth[f] === 1);
  const lostCoverage = Object.keys(everDepth).filter(f => !depth[f]);

  return {
    coverage, depth, everDepth, sole, lostCoverage, lost,
    standing, down, members: standing + down,
    cohesion: cohesionOf({ structure, standing, down, leadersDown, lostCoverage, floor: cohesionFloor }),
  };
}

/**
 * ⛔ COHESION IS A SECOND, SEPARATE STAT. Coverage says what a group CAN do; cohesion says how much of it
 * they can actually bring. ⚠️ "A group at low cohesion still HAS its coverage and cannot use it — which is
 * what a rout is, and the game has no way to express one today."
 *
 * Three degradations, and they are deliberately not the same size (Aevi's §3c):
 *   attrition        — gradual. The line thins.
 *   a leader down    — sharp. The line wavers.
 *   coverage lost    — sharp. Something the group relied on stopped answering.
 */
function cohesionOf({ structure = null, standing = 0, down = 0, leadersDown = 0, lostCoverage = [], floor = 0.15 } = {}) {
  const total = standing + down;
  // ⚠️ AN EMPTY GROUP HAS NO COHESION RATHER THAN PERFECT COHESION. 0/0 = NaN, and a NaN multiplier
  // silently zeroes whatever it touches — the shape that makes a mechanic look "off" instead of broken.
  if (total <= 0) return 0;
  const base = num(STRUCTURE_COHESION[String(structure || "")], 1.0);
  const attrition = down / total;                                   // 0 … 1, gradual
  const leaderHit = Math.min(0.5, num(leadersDown, 0) * 0.25);      // sharp, and capped
  const coverageHit = Math.min(0.4, (lostCoverage || []).length * 0.15);
  const raw = base * (1 - attrition) * (1 - leaderHit) * (1 - coverageHit);
  // ⛔ A FLOOR, NOT A ZERO. A group that has not been wiped can still do SOMETHING, and a cohesion of 0
  // would make every downstream multiplier erase the group entirely — which is not a rout, it is deletion.
  return standing > 0 ? Math.max(floor, round3(raw)) : 0;
}

/**
 * ⛔ CCODE-322 — WHO IS LOAD-BEARING. Aevi's `who_falls_first`: "NAME THE MEMBER OF A GROUP WHOSE LOSS
 * COSTS THEM MOST — and take a named advantage on acting against them."
 *
 * ⚠️ THAT IS `sole`, ALREADY COMPUTED, TURNED INTO A PERSON. A capability held by exactly one standing
 * member is one casualty from leaving the group entirely; the member holding the most of those is the one
 * whose loss costs most. ⛔ IT IS NOT "the weakest" AND IT IS NOT "the healer" — a spear who is the only
 * MARTIAL in a room of scholars is load-bearing, and the craft's own failure line knows it: "you name the
 * decoy, who is standing exactly where a mender would stand."
 *
 * ⚠️ TIES GO TO THE ONE WITH FEWER FAMILIES OVERALL, because a specialist holding one sole capability is
 * more fragile than a generalist holding the same one alongside three others.
 *
 * @returns {null | {id, name, holds: string[], why: string}}
 */
export function loadBearing(members = [], opts = {}) {
  const cap = groupCapability(members, opts);
  if (!cap.sole.length) return null;
  const standing = (members || []).filter(m => m && m.present !== false && !isDowned(m));
  let best = null;
  for (const m of standing) {
    const fams = contributionsOf(m.record || m, opts);
    const holds = fams.filter(f => cap.sole.includes(f));
    if (!holds.length) continue;
    if (!best || holds.length > best.holds.length
      || (holds.length === best.holds.length && fams.length < best.breadth)) {
      best = { id: m.id, name: m.name, holds, breadth: fams.length };
    }
  }
  if (!best) return null;
  return { id: best.id, name: best.name, holds: best.holds,
    why: best.holds.length === 1
      ? `nobody else here brings ${best.holds[0]}`
      : `nobody else here brings ${best.holds.slice(0, -1).join(", ")} or ${best.holds[best.holds.length - 1]}` };
}

/**
 * ⛔ GROUP AGAINST GROUP, READ AS COVERAGE RATHER THAN HEADCOUNT. Aevi's §5.4.
 *
 * ⚠️ THIS IS WHY A LEGION AND A BAND OF FIVE HEROES ARE NOT COMPARABLE BY SIZE. A unit is narrow and very
 * deep; a band is broad and thin. Resolving them by headcount says the legion wins every question, which
 * is exactly the fiction Erik says is wrong — a legion may have ZERO `KNOW` coverage.
 *
 * Returns per-family edges plus the two summary numbers. `unanswered` is the interesting one: what THEY
 * bring that WE cannot meet at all.
 */
export function groupMatchup(us, them) {
  const fams = [...new Set([...(us?.coverage || []), ...(them?.coverage || [])])].sort();
  const byFamily = {};
  for (const f of fams) {
    const a = num(us?.depth?.[f], 0) * num(us?.cohesion, 1);
    const b = num(them?.depth?.[f], 0) * num(them?.cohesion, 1);
    // ⚠️ THE SYMMETRIC EDGE THE REST OF THE ENGINE ALREADY USES — (us−them)/(us+them), bounded, and
    // undefined-free when both are zero.
    byFamily[f] = { us: round3(a), them: round3(b), edge: a + b > 0 ? round3((a - b) / (a + b)) : 0 };
  }
  const unanswered = fams.filter(f => !(us?.coverage || []).includes(f) && (them?.coverage || []).includes(f));
  const uncontested = fams.filter(f => (us?.coverage || []).includes(f) && !(them?.coverage || []).includes(f));
  const edges = fams.map(f => byFamily[f].edge);
  return {
    byFamily, unanswered, uncontested,
    // ⛔ THE OVERALL EDGE IS THE MEAN OF THE FAMILY EDGES, NOT A RATIO OF TOTALS. A ratio of totals lets
    // enormous MARTIAL depth pay for having no healer, which is the headcount answer wearing new clothes.
    edge: edges.length ? round3(edges.reduce((a, b) => a + b, 0) / edges.length) : 0,
  };
}

function round3(n) { return Math.round(num(n, 0) * 1000) / 1000; }
