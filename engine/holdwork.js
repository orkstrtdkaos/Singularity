// ⛔ CCODE-450 — STANDING WORK AT A HOLD. The Fell Pell prototype's Holds tab (rounds 5–6), which Erik asked for: "the other updates from the
// prototype… I would prioritize those." People with no job, put to what a hold needs; each good day — their best craft for the work landing —
// banks toward something that lasts, or keeps the place better while they are at it. They stay at the hold and are nobody else's meanwhile.
//
// ⚑ A LEAF, ON PURPOSE: `holdings.js` reads `workMods` (who joins the watch, what the yields and the upkeep are while someone works) and
// `jobs.js` reads `workAt` (who is busy), so this file imports nothing. The dice and the condition step are handed in by the tick.
//
// ⚠️ ONLY THE KINDS WHOSE EFFECT IS WIRED ARE OFFERED. The prototype lists twelve; scouting (a threat seen a day sooner), crafting (its
// quality is capped by the facility's LEVEL — the next slice) and teaching (a use of the teacher's craft for the others) wait on a decision,
// and a row on screen that does nothing would be a claim about a mechanism that does not exist.
// ⚠️ THE NUMBERS ARE THE PROTOTYPE'S (Erik reviewed them); `rules.holdWork` wins when authored.

export const WORK_KINDS = {
  forage: { label: "Foraging", needs: ["SUSTAIN", "KNOW"], per: 1, what: "each good day brings in a unit of raw material" },
  hunt: { label: "Hunting", needs: ["HARM", "KNOW"], per: 2, what: "living stock every two good days, and the danger around the hold eases while it is hunted" },
  train: { label: "Training", needs: ["HARM", "PROTECT"], per: 10, what: "every ten good days lifts the hands raised here one step of quality" },
  mend: { label: "Mending the place", needs: ["SHAPE", "RESTORE"], per: 8, what: "every eight good days, the hold's condition rises a step" },
  guard: { label: "Guarding", needs: ["PROTECT", "HARM"], per: 0, what: "they stand the watch, and meet what comes at the hold" },
  patrol: { label: "Patrolling", needs: ["MOVE", "PROTECT", "KNOW"], per: 0, what: "they walk the bounds — the hold has eyes on the road while they do" },
  tend: { label: "Tending", needs: ["SUSTAIN", "RESTORE"], per: 0, what: "the hold's yields are a quarter more while it is tended" },
  keep: { label: "Keeping the accounts", needs: ["KNOW", "INFLUENCE"], per: 0, what: "the hold's upkeep is a tenth less while its accounts are kept" },
};
export const WORK_DEFAULTS = { tendYield: 1.25, keptUpkeep: 0.9, huntEase: 1, trainCap: 3, daysPerPass: 3 };

/** The kinds and dials in force: the prototype's, with an authored `rules.holdWork` laid over them. Pure. */
export function workTable(authored = null) {
  const a = authored && typeof authored === "object" ? authored : {};
  const kinds = {};
  for (const [k, v] of Object.entries(WORK_KINDS)) kinds[k] = { ...v, ...(a.kinds?.[k] || {}) };
  return { kinds, dials: { ...WORK_DEFAULTS, ...(a.dials || {}) } };
}

const arr = (v) => (Array.isArray(v) ? v : []);
export function workOf(holding) { return holding?.work && typeof holding.work === "object" ? holding.work : {}; }
/** Everyone put to work at a hold, as [kind, id] pairs. Pure. */
export function workersAt(holding) { return Object.entries(workOf(holding)).flatMap(([k, ids]) => arr(ids).map(id => [k, String(id)])); }

/** WHO IS BUSY: the hold and the work someone is put to, or null. A unit is `unit:<band>:<index>`, as the Jobs tab names hands. Pure. */
export function workAt(character, id) {
  const key = String(id || "");
  if (!key) return null;
  for (const h of arr(character?.holdings)) for (const [kind, ids] of Object.entries(workOf(h))) if (arr(ids).map(String).includes(key)) return { holdId: h.id, holdName: h.name || h.id, kind };
  return null;
}

/** WHAT THE WORK DOES WHILE IT IS DONE — read by the hold's own readers (`watchOf`, `upkeepFor`, the yields, the raid's danger). Pure. */
export function workMods(holding, { table = null } = {}) {
  const T = table || workTable();
  const w = workOf(holding);
  const any = (k) => arr(w[k]).length > 0;
  return {
    watch: [...arr(w.guard), ...arr(w.patrol)].map(String),
    yieldMult: any("tend") ? Number(T.dials.tendYield) || 1 : 1,
    upkeepMult: any("keep") ? Number(T.dials.keptUpkeep) || 1 : 1,
    dangerEase: any("hunt") ? Number(T.dials.huntEase) || 0 : 0,
  };
}

/** Put someone to a kind of work at a hold — refused if the kind is not offered or they are already at work somewhere. Mutates. */
export function assignWork(character, holdId, kind, id, { table = null } = {}) {
  const T = table || workTable();
  const h = arr(character?.holdings).find(x => x && String(x.id) === String(holdId));
  if (!h) return { ok: false, why: "no such holding" };
  if (!T.kinds[kind]) return { ok: false, why: "that is not work this hold offers" };
  const busy = workAt(character, id);
  if (busy) return { ok: false, why: `already ${String(T.kinds[busy.kind]?.label || busy.kind).toLowerCase()} at ${busy.holdName}` };
  // a keeper, a guard on a garrison and a crew hand already have their post
  const posted = arr(character?.holdings).find(x => x && (String(x.steward || "") === String(id) || arr(x.garrison).map(String).includes(String(id)) || arr(x.crew).map(String).includes(String(id))));
  if (posted) return { ok: false, why: `already posted at ${posted.name || "a hold"} — a keeper, a guard or a hand has their post` };
  h.work = { ...workOf(h), [kind]: [...arr(workOf(h)[kind]).map(String), String(id)] };
  return { ok: true };
}

/** Take someone off the work. Mutates. */
export function unassignWork(character, holdId, kind, id) {
  const h = arr(character?.holdings).find(x => x && String(x.id) === String(holdId));
  if (!h) return { ok: false, why: "no such holding" };
  const rest = arr(workOf(h)[kind]).map(String).filter(x => x !== String(id));
  const next = { ...workOf(h) };
  if (rest.length) next[kind] = rest; else delete next[kind];
  if (Object.keys(next).length) h.work = next; else delete h.work;
  return { ok: true };
}

/** ⛔ ONE PASS OF STANDING WORK. `goodDayOf(id, kind)` is the chance a day of that work lands for them (a partial half), `headsOf(id)` how
 *  many hands they are (a person 1, a contingent its n). Each worker rolls each day of the pass; their good days bank per kind, and a banked
 *  threshold pays what lasts: raw material, living stock, a step of the hands' quality, a step of condition (`mend`, returned for the tick to
 *  apply through `advanceHolding`). → { said: [..], mend, goodDays: { kind: n } }. Mutates the hold, and `character.bands` for training. */
export function tickWork(character, holding, { goodDayOf, headsOf = () => 1, rng = Math.random, table = null } = {}) {
  const T = table || workTable();
  const out = { said: [], mend: 0, goodDays: {} };
  const where = holding?.name || "your hold";
  const bank = { ...(holding?.workBank || {}) };
  for (const [kind, ids] of Object.entries(workOf(holding))) {
    const K = T.kinds[kind];
    if (!K || !arr(ids).length) continue;
    let good = 0;
    for (const id of arr(ids)) {
      const p = Math.max(0, Math.min(1, Number(goodDayOf?.(id, kind)) || 0));
      const heads = Math.max(1, Math.floor(Number(headsOf(id)) || 1));
      for (let d = 0; d < (Number(T.dials.daysPerPass) || 3) * heads; d++) if (rng() < p) good++;
    }
    out.goodDays[kind] = good;
    if (!(K.per > 0)) continue;   // work that pays while it is done, not by what it banks
    bank[kind] = (Number(bank[kind]) || 0) + good;
    const times = Math.floor(bank[kind] / K.per);
    if (!times) continue;
    bank[kind] -= times * K.per;
    holding.store = holding.store && typeof holding.store === "object" ? holding.store : {};
    if (kind === "forage") { holding.store.raw_material = (Number(holding.store.raw_material) || 0) + times; out.said.push(`Foraging at ${where} brought in ${times} raw material.`); }
    else if (kind === "hunt") { holding.store.living_stock = (Number(holding.store.living_stock) || 0) + times; out.said.push(`Hunting at ${where} brought in ${times} living stock.`); }
    else if (kind === "mend") { out.mend += times; out.said.push(`The work of mending ${where} shows — its condition rises.`); }
    else if (kind === "train") {
      let lifted = 0;
      for (let t = 0; t < times; t++) {
        // the hands raised HERE, the least trained first, never past the cap
        const pool = arr(character?.bands).flatMap(b => arr(b?.contingents).map((c, i) => ({ b, c, i })))
          .filter(x => x.c && !x.c.npcId && String(x.c.from || "") === String(holding.id) && Number(x.c.n) > 0 && (Number(x.c.quality) || 1) < (Number(T.dials.trainCap) || 3))
          .sort((a, b) => (Number(a.c.quality) || 1) - (Number(b.c.quality) || 1));
        const x = pool[0];
        if (!x) break;
        x.b.contingents[x.i] = { ...x.c, quality: (Number(x.c.quality) || 1) + 1 };
        lifted++;
      }
      if (lifted) out.said.push(`Training at ${where} has lifted the hands raised there a step.`);
      else bank[kind] = Math.min(bank[kind] + times * K.per, K.per);   // nobody to lift: the practice waits, it does not pile up past one step
    }
  }
  if (Object.keys(bank).some(k => bank[k] > 0)) holding.workBank = Object.fromEntries(Object.entries(bank).filter(([, v]) => v > 0));
  else delete holding.workBank;
  return out;
}

/** The GM's line about a hold's standing work: " — at work: Dara Holt foraging, 12 spears training". Pure. */
export function workSaid(holding, { nameOf = (id) => id, table = null } = {}) {
  const T = table || workTable();
  const parts = workersAt(holding).map(([k, id]) => `${nameOf(id)} ${String(T.kinds[k]?.label || k).toLowerCase()}`);
  return parts.length ? ` — at work: ${parts.join(", ")}` : "";
}
