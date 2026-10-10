// borncontract.js — SNG-250 §4: THE UNIVERSAL BORN-WHOLE GATE.
//
// One mechanism, every type. SNG-250 §5 is explicit that this is ONE principle applied uniformly, not
// seven per-type features: "adding a type means declaring its contract", not writing new gate code. So
// there is exactly one checker here and it is keyed entirely by data — the consumer map
// (content/packs/core/rules/consumer_required_subfields.json, CONTENT.consumerContract). A type this
// module has never heard of is gated the moment it appears in that file, and no type gets a branch.
//
// The map answers two different questions, and this module keeps them separate because SNG-250 does:
//   • `topLevel`  → WHOLE.    Does every field a real consumer READS carry a value at birth?
//   • `concrete`  → CONCRETE. Is that value a thing the rules can ACT on, or a word that reads well?
// A record can be perfectly whole and still hollow — an ability with `functions: ["channel"]` has the
// field, engages nothing, and is the exact failure §3 names. Wholeness alone never catches that.
//
// SEVERITY IS THE POLICY, and it is the map's own (see its `howTheSweepUsesThis`): CRASH = a consumer
// throws or the record silently ceases to exist → reject; EMPTY = renders broken → repair; DEGRADED =
// works but hollow → warn. Deliberately NOT re-invented here. SNG-250 OQ3 (Erik) asks whether to tier
// the gate BY TYPE as well — hard-gate monster/skill/quest, warn-repair item/npc. That is his call and
// is unmade, so it is not encoded: when he rules, it becomes a per-type policy field in the map, read
// here, still no new code path.
//
// PURITY: no imports, no I/O, no CONTENT reference. The contract doc and any vocabularies are INJECTED,
// which is what lets the same function gate the browser's generation path and the Node CI sweep over
// authored content — SNG-250 §4's "authored and generated content held to the same completeness bar"
// is only true if it is literally the same function. (The CCODE-16 lesson: a derived-state gate must
// live in the ONE applier every write path calls, or the paths drift.)
//
// This module NEVER strips or rewrites anything. It reports. Repair and rejection are the caller's, so
// the SNG-250 guard "the gate removes hollowness, never richness" cannot be violated from in here.

/** Severity rank — higher is worse. Unknown severities sort as DEGRADED (warn), never as fatal:
 *  a typo in the map must not silently start rejecting content. */
const RANK = { DEGRADED: 1, EMPTY: 2, CRASH: 3 };
const rankOf = s => RANK[String(s || "").toUpperCase()] || RANK.DEGRADED;
/** CCODE-87 — does a conditional contract field apply to THIS record?
 *
 *  Grammar, entire: `<field> == <value>` or `<field> != <value>`, plus `|` for alternatives on the value
 *  ("kind == weapon|armor"). Anything else returns false and the field is skipped, because a clause the gate
 *  cannot read must not be able to condemn a record it was never about. */
export function appliesTo(clause, entity) {
  const m = String(clause || "").match(/^\s*([A-Za-z_][\w.]*)\s*(==|!=)\s*(.+?)\s*$/);
  if (!m) return false;
  const [, path, op, rhs] = m;
  const actual = path.split(".").reduce((o, k) => (o == null ? o : o[k]), entity);
  const wanted = rhs.split("|").map(s => s.trim().replace(/^["']|["']$/g, ""));
  const hit = wanted.some(w => String(actual) === w);
  return op === "==" ? hit : !hit;
}

/** Worst severity in a list, or null when the list is EMPTY.
 *
 *  The "no findings" seed must rank BELOW every real severity, which is why it is a number here and
 *  not `null` fed back through rankOf. It was: `reduce((w,x) => rankOf(x.severity) > rankOf(w) ? … : w, null)`
 *  — and rankOf(null) falls back to DEGRADED(1), so a DEGRADED finding was never `> ` the seed and
 *  `worst` stayed null. Every DEGRADED-only record therefore reported verdict "clean". The CI sweep hid
 *  it by reading `missing`/`vague` directly, but the live item path branches on `verdict !== "clean"`,
 *  so thin items were being waved through in exactly the case the gate exists for. */
function worstOf(list) {
  let best = 0, label = null;
  for (const x of list) { const r = rankOf(x?.severity); if (r > best) { best = r; label = String(x.severity || "DEGRADED").toUpperCase(); } }
  return label;
}

/** The map's presence test, kept identical to the CI sweep's: null/undefined, a blank string and an
 *  empty array are all ABSENT. `false` and `0` are PRESENT — they are real values a consumer reads
 *  (an item's `consumable: false` is an answer, not a hole). */
export function hasValue(v) {
  if (v == null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

/** Resolve a type name to its contract. `ability` is an alias for `skill` (the engine calls the same
 *  records both — abilities[] in the catalog, "skill" in the player-facing vocabulary), so a caller
 *  may pass either and reach the one contract rather than silently getting no gate at all. */
export function contractFor(contract, type) {
  const types = contract?.contentTypes || {};
  const t = String(type || "");
  if (types[t]) return types[t];
  for (const [key, spec] of Object.entries(types)) if (spec?.alsoKnownAs === t) return spec;
  return null;
}

/** Every type the injected contract can gate. Data, not a constant — this is what makes a newly
 *  declared type gated without a code change. */
export function contractedTypes(contract) {
  return Object.keys(contract?.contentTypes || {});
}

/** Normalize a `concrete` block to a rule ARRAY.
 *
 *  This file has TWO authors with different instincts and both shapes are reasonable, so the gate
 *  accepts both rather than making one of them wrong (CCODE-55: I wrote an array of rule objects;
 *  Aevi wrote a field -> rule MAP for the arc contract, which is terser and reads better for simple
 *  cases). The map form accepts either a bare rule name (`"pressure": "someNumeric"`) or an object
 *  (`"tendency": {"rule": "enum", "source": "..."}`), and the field key becomes `field`.
 *
 *  This is not politeness — it is the reason the gate crashed. A `for…of` over her object threw
 *  TypeError inside checkBorn, which generate() calls on every arc mint, so a contract edit alone
 *  would have taken down generation in play. A contract is CONTENT and content varies; the gate has
 *  to be total over it. */
function concreteRules(spec) {
  const c = spec?.concrete;
  if (!c) return [];
  if (Array.isArray(c)) return c;
  if (typeof c !== "object") return [];
  return Object.entries(c).map(([field, v]) =>
    typeof v === "string" ? { id: `${field}-${v}`, rule: v, field }
      : { id: v?.id || `${field}-${v?.rule || "concrete"}`, field, ...v });
}

// ---------- the concrete rules ----------
// Each returns true when the value IS concrete. Every rule is machine-checkable and traceable to a real
// read or a real clamp in HEAD — none of them encodes a judgement about prose. The semantic half of §3
// ("wants the forge her brother left" vs "wants respect") is Aevi's lane and is not decidable here.

const isNum = v => typeof v === "number" && Number.isFinite(v);
/** A numeric value that actually DOES something — 0 is a real number and a null effect. usableCombatItems
 *  (inventory.js:300) requires `restores > 0` for exactly this reason, so 0 fails here too. */
const someNumeric = (obj, keys) => !!obj && typeof obj === "object" && (keys || []).some(k => isNum(Number(obj[k])) && Number(obj[k]) !== 0);

function evalRule(rule, entity, spec, vocabs) {
  const field = rule.field;
  const value = field ? entity?.[field] : undefined;
  switch (String(rule.rule || "")) {
    case "nonEmptyArray":
      return Array.isArray(value) && value.length > 0;
    case "nonEmptyString":
      return typeof value === "string" && value.trim().length > 0;
    case "enum": {
      // Values may sit on the rule OR on the field spec (where they also document the field). Either way
      // this is a closed vocabulary the engine already resolves against.
      const fieldSpec = (spec?.topLevel || []).find(f => f.field === field);
      const allowed = rule.values || fieldSpec?.enum || [];
      return allowed.length ? allowed.includes(value) : hasValue(value);
    }
    case "everyInVocab": {
      // Non-empty AND every member resolvable. The emptiness half matters: familiesOfAbility
      // (functions.js:34) .filter(Boolean)s unresolvable verbs away, so an off-vocab verb is not an
      // error — it is silently dropped, and a rule that only checked membership of an empty array
      // would pass the very record the rule exists to catch.
      if (!Array.isArray(value) || !value.length) return false;
      const vocab = vocabs?.[rule.vocab];
      if (!Array.isArray(vocab) || !vocab.length) return true;   // vocab not supplied → cannot judge; never fail closed on a missing input
      const set = new Set(vocab.map(v => String(v).toUpperCase()));
      return value.every(v => set.has(String(v).toUpperCase()));
    }
    case "numberInRange": {
      const n = Number(value);
      if (!isNum(n)) return false;
      if (rule.min != null && n < rule.min) return false;
      if (rule.max != null && n > rule.max) return false;
      return true;
    }
    case "someNumeric":
      return someNumeric(value, rule.keys);
    case "anyOf":
      return (rule.anyOf || []).some(sub => evalRule(sub, entity, spec, vocabs));
    case "impliesSomeNumeric":
      // Conditional: only bites when the condition field is truthy (a consumable must spend to
      // something; gear need not). Lets one contract cover two mechanically different shapes of a type.
      if (!entity?.[rule.whenField]) return true;
      return someNumeric(value, rule.keys);
    default:
      return true;   // an unknown rule kind is inert, never a failure — the map may outrun this engine
  }
}

// ---------- the gate ----------

/** checkBorn(entity, type, contract, opts) — is this record born WHOLE and CONCRETE?
 *
 *  Pure. Returns a report; changes nothing. Never throws — a malformed entity, a missing contract or a
 *  garbled rule all degrade to "nothing to say" rather than taking down a turn (generate.js's standing
 *  invariant: generation NEVER halts a turn).
 *
 *  opts: { vocabs: { "function_vocabulary.families": ["HARM", ...] } }
 *
 *  Returns {
 *    type, gated,                  // gated=false when no contract exists for this type
 *    missing: [{field, severity, read, note}],      // §3 WHOLE failures
 *    vague:   [{id, field, severity, why}],         // §3 CONCRETE failures
 *    worst,                        // "CRASH" | "EMPTY" | "DEGRADED" | null
 *    tier,                         // §7a "hard" | "soft" — from the contract's gateTier (default soft)
 *    verdict                       // "clean" | "thin" | "reject"
 *  } */
export function checkBorn(entity, type, contract, opts = {}) {
  const spec = contractFor(contract, type);
  const out = { type: String(type || ""), gated: !!spec, missing: [], vague: [], worst: null, verdict: "clean" };
  if (!spec || !entity || typeof entity !== "object") return out;
  const vocabs = opts.vocabs || {};

  // TOTAL over the contract, by construction. The contract is CONTENT — two authors edit it and its
  // shapes vary — so nothing a contract file can contain may throw here. It once did: a `concrete`
  // block authored as an object rather than an array threw TypeError out of the for…of, and
  // generate() calls this on every mint, so a pure content edit would have taken down generation in
  // play. Guarding only the rule EVALUATION was not enough; the iteration itself has to be safe.
  try {
    for (const f of (Array.isArray(spec.topLevel) ? spec.topLevel : [])) {
      if (!f || f.optional) continue;               // a field the contract marks optional is not a hole
      // CCODE-87: a field may apply to only ONE KIND of the type. A weapon owes a `damageType`; a whetstone
      // does not, and a gate that says otherwise is crying wolf on a whetstone — which teaches people to
      // ignore it, the SNG-250 lesson. `appliesTo: "kind == weapon"` is deliberately a TINY grammar rather
      // than an expression evaluated at runtime: a contract file is content, and content must never be able
      // to run code inside a gate that every mint passes through. An unparseable clause applies to nothing,
      // so a typo silences one field instead of failing every record of its type.
      if (f.appliesTo && !appliesTo(f.appliesTo, entity)) continue;
      if (hasValue(entity[f.field])) continue;
      out.missing.push({ field: f.field, severity: String(f.severity || "DEGRADED").toUpperCase(), read: f.read || "", note: f.note || "" });
    }
    // SNG-250 §3 SEMANTIC layer (Aevi's vagueMarkers, CCODE-55 OQ4). The machine rules above ask
    // "is the value the right SHAPE"; this asks "is it just an abstraction" — "wants respect" vs
    // "wants the forge her brother left". Doc-level `common` markers apply to every type; `byType`
    // markers are per type+field. Always DEGRADED (a warn), per her note: never a hard reject alone.
    //
    // Deliberately CONSERVATIVE — it fires only when the value IS the abstraction, after stripping
    // leading articles/infinitives, never on a value that merely CONTAINS one. "wants respect" is
    // flagged; "wants the respect of the forge-guild she was cast out of" is not. Measured over the
    // authored corpus before shipping: a semantic rule that flags real content is the worst kind,
    // because it cannot be checked mechanically and so nobody can tell the false alarms from the real
    // ones. Tightening the bar costs recall; a rule people learn to ignore costs everything.
    const vm = contract?.vagueMarkers;
    if (vm) {
      const strip = s => String(s).toLowerCase().trim().replace(/^(to\s+|a\s+|an\s+|the\s+)+/, "").replace(/[.!?,;:]+$/, "").trim();
      const byField = vm.byType?.[out.type] || vm.byType?.[spec.alsoKnownAs] || {};
      const common = Array.isArray(vm.common) ? vm.common.map(strip) : [];
      for (const [field, markers] of Object.entries(byField)) {
        const raw = entity[field];
        if (!hasValue(raw)) continue;                       // absence is the WHOLE half's business, not this
        const list = Array.isArray(markers) ? markers.map(strip) : [];
        const bad = new Set([...list, ...common]);
        const values = (Array.isArray(raw) ? raw : [raw]).filter(v => typeof v === "string");
        if (values.length && values.every(v => bad.has(strip(v)))) {
          out.vague.push({ id: `vague-${field}`, field, severity: "DEGRADED",
            why: `every value of "${field}" is a bare abstraction with no concrete anchor (SNG-250 §3 semantic layer, Aevi's vagueMarkers) — e.g. "${values[0]}"` });
        }
      }
    }

    for (const r of concreteRules(spec)) {
      let ok = true;
      try { ok = evalRule(r, entity, spec, vocabs); } catch { ok = true; }  // a broken rule never fails content
      if (ok) continue;
      out.vague.push({ id: r.id || r.rule || "concrete", field: r.field || null, severity: String(r.severity || "DEGRADED").toUpperCase(), why: r.why || "" });
    }
  } catch { /* a contract shape this engine cannot read gates NOTHING — never a crash, never a false reject */ }

  // SNG-250 §7a (Erik's ruling, 2026-08-01): TIER THE GATE BY TYPE — "yes, but light". The gate already
  // tiers by FIELD severity, so this is one more field read by the same logic, not a second mechanism:
  //   HARD  (creature / skill / quest / encounter — hollowness BREAKS play): an EMPTY escalates to REJECT.
  //         An un-fightable monster or a skill that resolves to nothing is worse than no monster and no
  //         skill; better to mint nothing than to put a broken thing in the world.
  //   SOFT  (item / npc / location / arc — thin DEGRADES but still plays): EMPTY stays repair/warn, so a
  //         slightly thin item still reaches the player's hands rather than vanishing.
  // CRASH always rejects and DEGRADED always warns, in both tiers — the tier only moves EMPTY. Unknown or
  // absent gateTier means SOFT: a type whose tier nobody has set must not start silently rejecting.
  out.tier = String(spec.gateTier || "soft").toLowerCase() === "hard" ? "hard" : "soft";
  out.worst = worstOf([...out.missing, ...out.vague]);
  const rejects = out.worst === "CRASH" || (out.tier === "hard" && out.worst === "EMPTY");
  out.verdict = rejects ? "reject" : out.worst ? "thin" : "clean";
  return out;
}

/** The fields a caller should try to REGENERATE — SNG-250 §4's "repair (regenerate the thin field/stage)
 *  or reject". Deduped, wholeness first (a field that is absent must be filled before it can be judged
 *  concrete). Callers that cannot repair should reject on `verdict === "reject"` and persist-with-a-mark
 *  on "thin"; the choice is theirs, not this module's. */
/* ═════ G1 · FINISHING, WHICH HAPPENS BEFORE JUDGING ═════
 *
 * ✅ ERIK, 2026-10-04: *"Make sure the generation engines create fully formed objects."* and *"The world is
 * generative so it always needs a way to grow and change."* Aevi reads the second as the reason for the first.
 *
 * ⛔ G0 WAS A LIVE DEFECT. `generate("location")` ran `checkBorn` last and returned null on any CRASH, and the
 * location contract marks `worldPos` and `axisVector` as CRASH — while NOTHING inside `generate()` supplied
 * either. Reproduced headless with a fully filled response: `NULL — rejects: worldPos:CRASH, axisVector:CRASH`.
 * Every generateRequest for a place came back empty, so the GM could not grow one.
 *
 * ⚠️ "BORN WHOLE" MEANS WHOLE AT BIRTH, AND BIRTH IS NOT OVER UNTIL THE ENGINE HAS FINISHED STAMPING — which
 * is what `generate.js:548` already said in its own words and the code did not do. So the finisher runs first
 * and the gate judges the record the world will actually receive.
 *
 * ⛑ IT DERIVES, IT NEVER INVENTS. Everything here is read off the world the place is being born into — its
 * parent, its neighbours, its own spectrum — and the one formula that is not inheritance (`axisVector`) is the
 * rule measured against all of content: the spectrum's values at their index in `world_node_atlas.axisOrder`,
 * which reproduces 106 of 118 shipped vectors byte-for-byte. The other 12 are hand-authored and deliberately
 * differ, so this is the DEFAULT for a place that has none, never a claim the twelve are wrong. */

/** The disposition vector: the spectrum's values, placed at their index in the atlas's axis order. */
export function axisVectorFrom(spectrum, axisOrder) {
  const order = Array.isArray(axisOrder) ? axisOrder : [];
  if (!order.length) return null;
  return order.map((a) => Number(spectrum?.[a]) || 0);
}

/** ⛔ STAMP WHAT THE ENGINE CAN WORK OUT, so the model is only ever asked for prose.
 *  ⚠️ A FIELD THE RECORD ALREADY CARRIES IS NEVER OVERWRITTEN: the generator may have been handed a real
 *  answer, and a finisher that clobbers one is a finisher that quietly throws away what play decided.
 *
 *  `ctx` gives it the world: `{ locations, axisOrder, loreIds, parentId }`. All optional — with none of it a
 *  record comes back unchanged rather than wrong. */
export function finishBorn(type, record, ctx = {}) {
  if (!record || typeof record !== "object") return record;
  if (type === "location") return finishLocation(record, ctx);
  if (type === "npc") return finishPerson(record, ctx);
  return record;
}

/* ═════ CCODE-725 · A PERSON'S FOUR DIALS, DERIVED WHEN THE MODEL GIVES NONE ═════
 * ✅ AEVI, G (2026-10-09): *"`personality` (the four dials): derive it from the person's own vector and tradition, deterministically,
 * when the model gives none … The derived personality is the fallback when the answer is truncated."* ⚠️ MEASURED by G3: a fully
 * written person came back "thin" — `personality: DEGRADED`, read by the GM's NPC block, "absent = agreeable furniture".
 * ⛑ THE VECTOR is the person's spectrum; where it is silent on an axis, their tradition's disposition speaks for it at half and a
 * quarter weight (primary, secondary pole). Each dial leans on the axes that mean it — warmth on feeling, peace, life and light;
 * trust on truth, order and the angelic; candour on truth and the concrete; patience on order, peace, time and reason — from a
 * middling 0.4, with a small sway by the person's own id so two people of one tradition are not one temper. Dials in −1..1 (the
 * schema's range), to the nearest 0.05. The same person always derives the same four. */
const DIAL_AXES = {
  warmth:   [["emotional_logical", -0.3], ["violence_peace", 0.25], ["death_life", 0.2], ["dark_light", 0.15], ["demonic_angelic", 0.1]],
  trust:    [["falsehood_truth", 0.35], ["chaos_order", 0.3], ["demonic_angelic", 0.2], ["dark_light", 0.15]],
  candor:   [["falsehood_truth", 0.6], ["concrete_abstract", -0.25], ["body_mind", -0.15]],
  patience: [["chaos_order", 0.3], ["violence_peace", 0.3], ["space_time", 0.2], ["emotional_logical", 0.2]],
};
export function personalityFrom(spectrum, { tradition = null, spectrums = null, id = "" } = {}) {
  const v = {};
  for (const [axis, val] of Object.entries(spectrum && typeof spectrum === "object" ? spectrum : {})) if (Number.isFinite(Number(val))) v[axis] = Number(val);
  // the tradition's disposition, on the axes the person's own vector is silent about
  const poleAxis = (pole) => {
    for (const a of spectrums?.spectrums || []) { if (a.negPole === pole) return [a.id, -1]; if (a.posPole === pole) return [a.id, 1]; }
    return null;
  };
  for (const [slot, w] of [["primary", 0.5], ["secondary", 0.25]]) {
    const pa = tradition?.disposition?.[slot] ? poleAxis(String(tradition.disposition[slot])) : null;
    if (pa && v[pa[0]] === undefined) v[pa[0]] = pa[1] * w;
  }
  let h = 2166136261;
  for (let i = 0; i < String(id).length; i++) { h ^= String(id).charCodeAt(i); h = Math.imul(h, 16777619); }
  const out = {};
  let k = 0;
  for (const [dial, axes] of Object.entries(DIAL_AXES)) {
    let s = 0;
    for (const [axis, w] of axes) s += (v[axis] || 0) * w;
    const sway = id ? ((((h >>> (k * 7)) & 0x3f) / 63) - 0.5) * 0.2 : 0;   // ±0.1, the person's own
    out[dial] = Math.round(Math.max(-1, Math.min(1, 0.4 + s * 0.6 + sway)) * 20) / 20;
    k++;
  }
  return out;
}

function finishPerson(rec, ctx) {
  // ⛑ only on the LAST pass (`generate()` finishes twice: before repair, and once the affiliation has named their tradition) — a
  // field the record carries is never overwritten, so deriving on the first pass would have spoken before the tradition could
  if (ctx.last === false) return rec;
  const has = rec.personality && typeof rec.personality === "object" && Object.keys(rec.personality).length;
  if (has) return rec;
  const tid = typeof rec.domains?.primary === "string" ? rec.domains.primary : Array.isArray(rec.domains?.primary) ? rec.domains.primary[0] : null;
  const tradition = tid ? (ctx.traditionIndex?.byId?.[tid] || null) : null;
  return { ...rec, personality: personalityFrom(rec.spectrum, { tradition, spectrums: ctx.spectrums || null, id: rec.id || rec.name || "" }) };
}

/** ✅ AEVI, G: *"A truncated place's empty `descriptionSeed`: the finisher writes a plain sentence from its kind, region and parent,
 *  such as 'A shrine on the road out of Kindlerow.' No place ships without one."* ⛑ What it is, by its own record — its kind, a made
 *  gate, the kind its name says, else its role or tier — and where: inside its parent, else on the road out of the first place its
 *  roads reach, else in its region. Plain and true, and marked (`_seedDerived`) because it is a floor and not the place's character:
 *  SNG-582 retired a boilerplate sentence for exactly that reason, and a place the player comes back to still earns its own
 *  (`unearnedDepth` counts a derived one as owed, and the enrichment may replace it). */
const NAME_KIND = /\b(shrine|temple|chapel|mill|ford|bridge|inn|hall|tower|keep|market|yard|camp|well|cistern|dock|landing|quarry|mine|grove|orchard|farm|ruin|cave|gate|pass|crossing|post|stair|archive|forge|smithy|store|shop)\b/i;
export function placeSentence(rec, { locations = {}, regionName = null } = {}) {
  const nameKind = String(rec?.name || "").match(NAME_KIND)?.[1]?.toLowerCase() || null;
  const noun = rec?.kind ? String(rec.kind).replace(/_/g, " ")
    : rec?.waygate || rec?.role === "gate" ? "waygate"
    : nameKind ? nameKind
    : rec?.role === "waypoint" ? "stopping place"
    : rec?.tier === "site" ? "place" : "settlement";
  const par = rec?.parentId ? locations[rec.parentId] : null;
  const road = !par && Array.isArray(rec?.connections) ? rec.connections.map((id) => locations[id]).find((l) => l?.name) : null;
  const region = !par && !road && rec?.regionId ? (typeof regionName === "function" ? regionName(rec.regionId) : null) : null;
  const where = par?.name ? ` in ${par.name}` : road?.name ? ` on the road out of ${road.name}` : region ? ` in ${region}` : "";
  return `${/^[aeiou]/i.test(noun) ? "An" : "A"} ${noun}${where}.`;
}

function finishLocation(rec, ctx) {
  const locations = ctx.locations || {};
  const get = (id) => (id === rec.id ? rec : locations[id]);
  const out = { ...rec };

  // ---- the address: a parent first, then the first connection that is actually somewhere ----
  // ⛑ CCODE-715: unless the caller says the place is NOT inside anywhere (`adoptParent: false`) — the door every minter goes through
  // finishes a transit place too, and a road's destination ("the pass") is a day down the road, not a room of the place you left
  if (!out.parentId && ctx.adoptParent !== false) {
    // ⛔ A PLACE MADE IN PLAY IS MADE WHERE THE PLAYER IS STANDING. ✅ AEVI's negative case: *"a response that
    // cannot be placed comes back as a STUB THAT IS STILL WHOLE, never a null — a thin-but-present record
    // beats a hole in the world."* A truncated answer has no connections to walk, and `hereId` is the one
    // true thing the engine knows about it: the scene it was invented in.
    const cand = ctx.parentId
      || (Array.isArray(out.connections) ? out.connections.find((id) => locations[id]) : null)
      || (locations[ctx.hereId] ? ctx.hereId : null);
    if (cand && cand !== out.id) out.parentId = cand;
  }
  const par = out.parentId ? locations[out.parentId] : null;
  /* ⛑ CCODE-715 · WHAT A PLACE INHERITS, IT INHERITS FROM WHERE IT WAS MADE. Its parent when it has one; otherwise the first place its
   * roads reach — a place made off a road shares its neighbour's disposition, danger, field and lore, where an empty spectrum would
   * give it a vector of zeros and a danger of 1 wherever it stood. Its POSITION still comes only from a parent (or the walk below). */
  const near = par || (Array.isArray(out.connections) ? out.connections.map((id) => locations[id]).find(Boolean) : null) || null;
  if (!out.regionId && !out.region) {
    const from = par || (Array.isArray(out.connections) ? out.connections.map((id) => locations[id]).find((l) => l?.regionId || l?.region) : null);
    if (from) out.regionId = from.regionId || from.region;
  }

  // ---- where it IS. ⛑ inherited, never invented: a room is at its building's coordinates ----
  if (!out.worldPos || !Number.isFinite(Number(out.worldPos.colatitude))) {
    if (par?.worldPos && Number.isFinite(Number(par.worldPos.colatitude))) {
      out.worldPos = { ...par.worldPos };
    } else if (typeof ctx.worldPosFor === "function") {
      // ⛑ the walk-up through parents and connections, which `worldmap` already owns
      const wp = ctx.worldPosFor(out.id, get);
      if (wp && Number.isFinite(Number(wp.colatitude))) out.worldPos = wp;
    }
  }

  // ---- what it IS. The spectrum is the place's disposition; the vector is that spectrum, ordered ----
  if (!out.spectrum || !Object.keys(out.spectrum).length) out.spectrum = near?.spectrum ? { ...near.spectrum } : {};
  if (!Array.isArray(out.axisVector) || !out.axisVector.length) {
    const v = axisVectorFrom(out.spectrum, ctx.axisOrder);
    if (v) {
      out.axisVector = v;
      // ⛑ SNG-180 is the ruling; it belongs HERE and not in the note. §262 counts ticket numbers in string
      // literals and ratchets them down, because a ticket number in DATA is one step from a player reading it.
      out.axisVectorNote = "Derived from the spectrum against world_node_atlas.axisOrder. Disposition — what this place IS. Distinct from where it is.";
    }
  }
  // ⚠️ `poleIntensity` IS AN OBJECT, pole → 0..1, and my first cut tested it with `Number.isFinite` — which
  // is NaN for every object — so it OVERWROTE a perfectly good one with the number 0.5 and broke an existing
  // test that had been passing for months. The finisher's own comment says a field the record already carries
  // is never overwritten; a numeric test on a non-numeric field is how that promise gets broken quietly.
  // ⛑ THE DERIVATION IS RECONCILE'S, LIFTED RATHER THAN REWRITTEN (v-step "derive poleIntensity from
  // spectrum", verified there against archive_hollow, dw_the_moot and millbrook): each axis contributes to its
  // POSITIVE pole when the value is positive and its negative pole when it is not.
  if (!out.poleIntensity || typeof out.poleIntensity !== "object" || !Object.keys(out.poleIntensity).length) {
    const byId = {};
    for (const a of ctx.spectrums?.spectrums || []) byId[a.id] = a;
    const pi = {};
    for (const [axis, v] of Object.entries(out.spectrum || {})) {
      if (!v) continue;
      const a = byId[axis];
      const neg = a?.negPole ?? axis.split("_")[0];
      const pos = a?.posPole ?? axis.split("_").slice(1).join("_");
      pi[v > 0 ? pos : neg] = Math.round(Math.abs(v) * 100) / 100;
    }
    if (Object.keys(pi).length) out.poleIntensity = pi;
    else if (near?.poleIntensity && typeof near.poleIntensity === "object") out.poleIntensity = { ...near.poleIntensity };
  }

  // ---- the rest the engine knows, each inherited from the place it is being born beside ----
  // ⛑ A PLACE WITH A PARENT IS A SITE. That is what a parent means — somewhere inside somewhere else.
  if (!out.tier) out.tier = out.parentId ? "site" : "settlement";
  // ⛑ ABSENT, not "fails my idea of its type" — these two really are numbers, but the test is presence
  if (out.dangerLevel == null) out.dangerLevel = Number.isFinite(Number(near?.dangerLevel)) ? near.dangerLevel : 1;
  if (out.substrateDensity == null) {
    out.substrateDensity = Number.isFinite(Number(near?.substrateDensity)) ? near.substrateDensity : 0.5;
  }
  if (!out.people && par?.people) out.people = par.people;   // a place's people are its PARENT's, never a neighbour's
  // ✅ G1: *"role"* — what the place is FOR on a route: a made gate is a gate, a place made on the way (`transitional`) a waypoint.
  // The two roles the 183 places carry; a place with neither is a settlement or a site by its tier, and says nothing more.
  if (!out.role) {
    if (out.waygate) out.role = "gate";
    else if ((Array.isArray(out.tags) ? out.tags : []).includes("transitional")) out.role = "waypoint";
  }
  // ⚠️ ONLY LORE THAT RESOLVES. A generated `loreRef` points at lore the generator imagined; carrying it
  // forward makes the place lore-BLIND, which is worse than referencing none.
  const loreIds = ctx.loreIds instanceof Set ? ctx.loreIds : null;
  const inherited = [...(Array.isArray(out.loreRefs) ? out.loreRefs : []), ...(Array.isArray(near?.loreRefs) ? near.loreRefs : [])];
  out.loreRefs = loreIds ? [...new Set(inherited.filter((r) => loreIds.has(String(r))))] : [...new Set(inherited)];
  // ⛑ the generator writes encounterFlavor as a LIST of lines; a record holds one string
  if (Array.isArray(out.encounterFlavor)) out.encounterFlavor = out.encounterFlavor.join(" ");
  // ✅ AEVI, G (CCODE-725): no place ships without a sentence — on the last pass, once its address is known
  if (ctx.last !== false && !String(out.descriptionSeed || "").trim()) {
    out.descriptionSeed = placeSentence(out, { locations, regionName: ctx.regionName || null });
    out._seedDerived = true;
  }
  if (!out.map) out.map = par?.map ? { ...par.map } : { x: 0, y: 0 };

  // ✅ AEVI: *"Connections are reciprocal. The neighbour gets the road too."* ⚠️ A ONE-WAY DOOR is how a
  // player walks somewhere they can never walk back from — the promotion audit found twelve of them.
  out.connections = [...new Set((Array.isArray(out.connections) ? out.connections : []).filter(Boolean))];
  if (out.parentId && !out.connections.includes(out.parentId)) out.connections.push(out.parentId);
  if (ctx.openReciprocal !== false) {
    for (const id of out.connections) {
      const nb = locations[id];
      if (!nb || nb === rec) continue;
      if (!Array.isArray(nb.connections)) continue;
      if (!nb.connections.includes(out.id)) nb.connections.push(out.id);
    }
  }
  return out;
}

export function repairTargets(report) {
  const seen = new Set(), out = [];
  for (const m of (report?.missing || [])) if (m.field && !seen.has(m.field)) { seen.add(m.field); out.push(m.field); }
  for (const v of (report?.vague || [])) if (v.field && !seen.has(v.field)) { seen.add(v.field); out.push(v.field); }
  return out;
}

/** A one-line, human-readable verdict for a receipt, a CI line or a `_gen` stamp. */
export function describeBorn(report) {
  if (!report?.gated) return `${report?.type || "?"}: no contract (ungated)`;
  if (report.verdict === "clean") return `${report.type}: born whole`;
  const parts = [];
  if (report.missing.length) parts.push(`missing ${report.missing.map(m => m.field).join(", ")}`);
  if (report.vague.length) parts.push(`not concrete: ${report.vague.map(v => v.id).join(", ")}`);
  return `${report.type}: ${report.verdict.toUpperCase()} — ${parts.join("; ")}`;
}
