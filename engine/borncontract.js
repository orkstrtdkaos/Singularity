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
const worstOf = list => list.reduce((w, x) => (rankOf(x.severity) > rankOf(w) ? String(x.severity).toUpperCase() : w), null);

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
 *    verdict                       // "clean" | "thin" | "reject"
 *  } */
export function checkBorn(entity, type, contract, opts = {}) {
  const spec = contractFor(contract, type);
  const out = { type: String(type || ""), gated: !!spec, missing: [], vague: [], worst: null, verdict: "clean" };
  if (!spec || !entity || typeof entity !== "object") return out;
  const vocabs = opts.vocabs || {};

  for (const f of (spec.topLevel || [])) {
    if (f.optional) continue;                       // a field the contract marks optional is not a hole
    if (hasValue(entity[f.field])) continue;
    out.missing.push({ field: f.field, severity: String(f.severity || "DEGRADED").toUpperCase(), read: f.read || "", note: f.note || "" });
  }
  for (const r of (spec.concrete || [])) {
    let ok = true;
    try { ok = evalRule(r, entity, spec, vocabs); } catch { ok = true; }  // a broken rule never fails content
    if (ok) continue;
    out.vague.push({ id: r.id || r.rule || "concrete", field: r.field || null, severity: String(r.severity || "DEGRADED").toUpperCase(), why: r.why || "" });
  }

  out.worst = worstOf([...out.missing, ...out.vague]);
  out.verdict = out.worst === "CRASH" ? "reject" : out.worst ? "thin" : "clean";
  return out;
}

/** The fields a caller should try to REGENERATE — SNG-250 §4's "repair (regenerate the thin field/stage)
 *  or reject". Deduped, wholeness first (a field that is absent must be filled before it can be judged
 *  concrete). Callers that cannot repair should reject on `verdict === "reject"` and persist-with-a-mark
 *  on "thin"; the choice is theirs, not this module's. */
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
