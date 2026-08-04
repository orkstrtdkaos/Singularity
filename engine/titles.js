// engine/titles.js — SNG-287: a name that comes from the MATERIAL, not from a menu.
//
// Aevi (the Tether pattern): a title is `pattern + slots`, and every slot is filled from a real record —
// never invented. *"Whom the Ashwardens Named"* says nothing about what you did and everything about who is
// talking; *"Warden of the Medicine Road"* is only true if there is a road you actually guarded.
//
// ⚠️ THE RULE THAT KEEPS THEM HONEST, AND IT IS THE WHOLE MODULE: a pattern may only be used if EVERY slot it
// asks for can be filled from the record. No arc moved means no {ARC} title. A title that reaches for a slot
// with no source is not a flattering title, it is a FALSE one — the same discipline as BOUNDARY-1, where
// prose alone is not a consequence.
//
// So `titleFor` returns null far more often than it returns a name, and that is correct. A world where
// everyone has an epithet has no epithets.
//
// ⛔ DIRECTIVE SNG-280. Where a pattern has two faces — Thornwake's Mercy and Thornwake's Knife — the one that
// lands is decided by the SIGN OF THE RECORDED DEEDS, which is a description of what someone is known for,
// not a verdict on it. The Maw gets a name as readily as the Rootkin; it is simply a different noun.
//
// Pure. Reads a bearer + world state + authored patterns; writes nothing.

/** Slot resolvers. Each returns a string, or NULL when the record cannot fill it — and null is what makes the
 *  whole pattern unavailable. Keyed by slot name so content can add a pattern without touching this file,
 *  and so an UNRESOLVABLE slot is a visible, enumerable fact (see `unfillableSlots`). */
export const SLOT_SOURCES = {
  // The community a bearer's deeds concentrate in. The most-recorded place, not the most recent.
  PLACE: (ctx) => {
    const counts = {};
    for (const d of ctx.deeds) if (d.communityId) counts[d.communityId] = (counts[d.communityId] || 0) + 1;
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (!top || top[1] < 2) return null;            // one deed in a place is not a place you are OF
    return prettyPlace(top[0]);
  },
  // The arc they were there for the turning of. Requires a recorded stage-move, which is the point.
  ARC: (ctx) => {
    const counts = {};
    for (const d of ctx.deedLog) if (d.by === "stageMoved" && d.arcId) counts[d.arcId] = (counts[d.arcId] || 0) + 1;
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? (ctx.arcNames?.[top[0]] || null) : null;
  },
  // The people who named them — the bearer's own tradition. The domain-scope pattern.
  PEOPLE: (ctx) => ctx.tradition ? (ctx.traditionNames?.[ctx.tradition] || null) : null,
  // How many. Only ever a real count, and only worth saying above one.
  COUNT: (ctx) => (ctx.count > 1 ? numberWord(ctx.count) : null),
  // SNG-294: the hardest thing they ever put down. Recorded at the clash, by rung rather than recency.
  FOE: (ctx) => ctx.bestFoe?.name || null,
  // ⛔ SNG-294 — NOT A CRAFT ID, AND AEVI IS RIGHT ABOUT WHY. Deeds carry TAGS, not craft ids, and that is
  // correct: a tag is what the WORLD noticed, a craft id is what the ENGINE resolved. Threading craft ids
  // into reputation would make a deed an engine artifact instead of a social record, and this whole system
  // works because deeds are what people SAW. "The Grey Hand" was never a craft id — it is an epithet drawn
  // from how the work LOOKED, which is exactly what a tag already is.
  TAG: (ctx) => {
    const counts = {};
    for (const d of ctx.deeds) for (const t of (d.tags || [])) counts[t] = (counts[t] || 0) + 1;
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (!top || top[1] < 3) return null;          // a habit, not a one-off
    return ctx.tagEpithets?.[top[0]] || null;     // and only if the world has a word for it
  },
  // Which face of a two-faced pattern the record earns.
  ROLE: (ctx) => {
    const total = ctx.deeds.reduce((a, d) => a + Math.abs(Number(d.weight) || 0), 0);
    if (total < 4) return null;                     // too thin a record to be known for anything
    const neg = ctx.deeds.reduce((a, d) => a + (Number(d.weight) < 0 ? Math.abs(Number(d.weight)) : 0), 0);
    const share = neg / total;
    if (share >= 0.6) return ctx.roleWords?.hard || "Knife";
    if (share <= 0.2) return ctx.roleWords?.soft || "Mercy";
    return null;                                    // a mixed record does not resolve to one word
  },
};

/** ⚠️ SLOTS THE SPEC ASKS FOR THAT NOTHING CAN FILL YET. Named rather than silently absent, the same way
 *  `EFFECT_CONSUMERS` names the effect kind with no consumer. A pattern using one of these is simply never
 *  chosen, and this is why. */
export const UNFILLABLE_SLOTS = {
  // SNG-294, all three ruled on. {FOE} built (one line at the clash). {CRAFT} re-sourced to {TAG} rather
  // than built, because a tag is what the world noticed and a craft id is what the engine resolved.
  // {ROAD} is the one that stays: "the Medicine Road" was fiction the data cannot support — THE WORLD HAS
  // LOCATIONS, NOT NAMED ROUTES — so the pattern ships as "Warden of {PLACE}" and {ROAD} waits for routes to
  // become things, which the economy and the travel-cost effects both want anyway.
  ROAD: "the world has locations, not named routes — ships as Warden of {PLACE} until routes exist",
};

const prettyPlace = (communityId) => {
  const leaf = String(communityId).split(".").pop() || "";
  return leaf.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

const WORDS = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
const numberWord = (n) => WORDS[n] || String(n);

/** Build the context every resolver reads, once. */
function contextFor(bearer, opts = {}) {
  const { ws = {}, arcNames = {}, traditionNames = {}, roleWords = null } = opts;
  const id = bearer?.id;
  const t = ws.figureTenure?.[id] || {};
  const c = ws.figureCareer?.[id] || {};
  return {
    deeds: Array.isArray(bearer?.deeds) ? bearer.deeds : [],
    deedLog: Array.isArray(t.deedLog) ? t.deedLog : [],
    tradition: bearer?.tradition || null,
    bestFoe: c.bestFoe || null,
    tagEpithets: opts.tagEpithets || {},
    count: Number(c.retrieved) || 0,
    arcNames, traditionNames, roleWords,
  };
}

/** Try every authored pattern in order; return the first whose slots ALL resolve.
 *  Returns { title, pattern, slots } or null. */
export function titleFor(bearer, opts = {}) {
  const patterns = opts.patterns || [];
  const ctx = contextFor(bearer, opts);
  for (const p of patterns) {
    const text = p?.pattern;
    if (typeof text !== "string") continue;
    const wanted = [...text.matchAll(/\{([A-Z]+)\}/g)].map(m => m[1]);
    if (!wanted.length) continue;
    // ⚠️ A pattern asking for a slot nothing can fill is skipped, not guessed at.
    if (wanted.some(s => !SLOT_SOURCES[s])) continue;
    const filled = {};
    let ok = true;
    for (const s of wanted) {
      const v = SLOT_SOURCES[s]({ ...ctx, roleWords: p.roleWords || ctx.roleWords });
      if (!v) { ok = false; break; }
      filled[s] = v;
    }
    if (!ok) continue;
    return {
      title: text.replace(/\{([A-Z]+)\}/g, (_, s) => filled[s]),
      pattern: p.id || text,
      slots: filled,
    };
  }
  return null;
}

/** SNG-294 — STARVED BY ORDER. A pattern can be perfectly fillable and still never fire, because an earlier
 *  pattern resolves first for every record that would have reached it. `Whom {PEOPLE} Named` needs only a
 *  tradition, which nearly every figure has, so anything below it is effectively unreachable.
 *
 *  ⚠️ MY FIRST VERSION MEASURED THE WRONG THING. It probed with a record that filled EVERY slot, on which
 *  the first pattern always wins — so it reported six of seven starved, which is true of any first-match
 *  list and tells you nothing. The question is not "does something earlier win on a rich record" but "is
 *  there ANY record that reaches this pattern": fill only its OWN slots and see whether it survives.
 *
 *  ⚠️ AND IT IS STILL A HEURISTIC, NOT A PROOF. It probes ONE record shape per pattern. `warden_of_place`
 *  comes back flagged, and yet a mixed-weight record demonstrably produces "Warden of Thornwake" — because
 *  `{PLACE}'s {ROLE}` declines a record it cannot call one thing, and the next pattern gets its turn. So
 *  this reports patterns whose reachability DEPENDS ON ORDER, not patterns that can never fire. Reading it
 *  as the latter would be the third time in one build that I measured something adjacent to the question.
 *
 *  Order is AUTHORSHIP — Aevi's to set, and she set it before {TAG} and {FOE} had sources — so this reports
 *  rather than reorders. */
export function orderSensitivePatterns(patterns = []) {
  const slotsOf = (p) => [...String(p?.pattern || "").matchAll(/\{([A-Z]+)\}/g)].map(m => m[1]);
  // A record carrying ONLY what this pattern asks for. Anything it does not need is left empty, so an
  // earlier pattern can only claim it by needing a strict subset of the same slots.
  const probeFor = (want) => ({
    deeds: want.includes("PLACE") || want.includes("ROLE") || want.includes("TAG")
      ? [{ communityId: "v.town", weight: 3, tags: ["raise"] }, { communityId: "v.town", weight: 3, tags: ["raise"] },
         { communityId: "v.town", weight: 3, tags: ["raise"] }] : [],
    deedLog: want.includes("ARC") ? [{ by: "stageMoved", arcId: "a1" }] : [],
    tradition: want.includes("PEOPLE") ? "t1" : null,
    count: want.includes("COUNT") ? 3 : 0,
    bestFoe: want.includes("FOE") ? { name: "the Wyrm", band: 4 } : null,
    arcNames: { a1: "the Arc" }, traditionNames: { t1: "the People" }, tagEpithets: { raise: "Raiser" },
  });
  const fills = (p, rec) => {
    const w = slotsOf(p);
    return w.length > 0 && w.every(s => SLOT_SOURCES[s] && SLOT_SOURCES[s]({ ...rec, roleWords: p.roleWords }));
  };
  const out = [];
  for (let i = 0; i < patterns.length; i++) {
    const p = patterns[i], want = slotsOf(p);
    if (!want.length || want.some(s => !SLOT_SOURCES[s])) continue;   // unfillable is a different report
    const rec = probeFor(want);
    if (!fills(p, rec)) continue;
    if (patterns.slice(0, i).some(q => fills(q, rec))) {
      out.push({ id: p.id || p.pattern, why: "every record that reaches it is claimed by an earlier pattern" });
    }
  }
  return out;
}
/** Which authored patterns can never be chosen, and why. A report for the author, not a runtime path. */
export function unusablePatterns(patterns = []) {
  const out = [];
  for (const p of patterns) {
    const wanted = [...String(p?.pattern || "").matchAll(/\{([A-Z]+)\}/g)].map(m => m[1]);
    const dead = wanted.filter(s => !SLOT_SOURCES[s]);
    if (dead.length) out.push({ id: p.id || p.pattern, slots: dead, why: dead.map(s => UNFILLABLE_SLOTS[s] || "no resolver").join("; ") });
  }
  return out;
}
