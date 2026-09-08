// engine/sovereign.js — R41: A SOVEREIGN ARRIVES TWICE, AND THE SHAPE IS ONE RECORD WITH TWO FORMS.
//
// ⛔ ERIK (R41a): "arrive (weaker) at a certain arc stage, then be final form for the last arc stage."
// ⚑ AEVI (WORK ORDER §4): "One record with a `diminished` variant, or two records — CCode's call on the shape;
// Aevi's on the content."
//
// ⛔ THE CALL IS ONE RECORD. Two records would give one being two ids, and every id-keyed system — the codex,
// the registry, `hingeNpcs`, `rivals`, the anti-Sovereigns who KNOW (R41c) — would have to be taught that
// two ids are one person. Identity is the thing R41 is about: the same being, diminished by having arrived.
// So the record stays one, and it carries `forms`:
//
//   "forms": {
//     "diminished": { "atStage": 3, "level": 45, "abilities": [...]?, "note": "…" },   // the weakened arrival
//     "final":      { "atStage": 4, "level": 85, "abilities": [...]?, "note": "…" }    // final form, last stage
//   }
//
// ⚠️ READER BEFORE FIELD. Nobody authors `forms` yet — Aevi authors the Sovereigns and Erik fills the seats
// slowly. With no `forms` block a record resolves exactly as it always did (the authored level, else the tier
// floor). The moment a form is authored it is honoured, and nothing in here changes when that happens.
//
// ⛔ THE STAGE IS THREADED IN, NEVER READ HERE. `worldtick.arcStageNow` owns the live stage of an arc (pushes,
// rounding, the 2A back-compat) and `arceffects.js` already takes it as an injected `stageOf` for exactly this
// reason. This module gets a `stageOf(arcId)` callback and stays free of the world-tick.
//
// ⚑ WHICH ARC? The record's own: `forms.arcId`, else `arcAffinity.arcId` (the field every epic already
// carries). A Sovereign with no arc has no arrival, and resolves as its plain record — which is the honest
// answer for a being that, per the lore, "never comes" until something starves it.

const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

/** Which authored form is in force for this record at the arc's current stage, or null for "no forms". PURE.
 *  Returns { form, level, abilities, note, arcId, stage } — `level` and `abilities` are undefined when the form
 *  does not author them, so a caller spreads only what was said. */
export function sovereignFormFor(rec, { stageOf = null, stage = null } = {}) {
  const forms = rec?.forms;
  if (!forms || typeof forms !== "object") return null;
  const arcId = forms.arcId || rec?.arcAffinity?.arcId || null;
  let at = stage;
  if (at == null && arcId && typeof stageOf === "function") { try { at = stageOf(arcId); } catch { at = null; } }
  if (at == null) return { form: null, arcId, stage: null, why: arcId ? "arc stage unknown" : "no arc to arrive on" };
  const s = num(at, 0);
  // ⛔ FINAL WINS WHERE BOTH APPLY. A stage at or past `final.atStage` is the final form; at or past
  // `diminished.atStage` is the weakened arrival; before either, the Sovereign has not come.
  const fin = forms.final, dim = forms.diminished;
  const pick = (fin && s >= num(fin.atStage, Infinity)) ? ["final", fin]
    : (dim && s >= num(dim.atStage, Infinity)) ? ["diminished", dim]
    : null;
  if (!pick) return { form: null, arcId, stage: s, why: "not yet arrived" };
  const [form, def] = pick;
  return {
    form, arcId, stage: s,
    ...(def.level != null ? { level: Math.max(1, num(def.level, 1)) } : {}),
    ...(Array.isArray(def.abilities) && def.abilities.length ? { abilities: def.abilities } : {}),
    note: def.note || null,
  };
}

/** ⚠️ WHAT THE PLAYER IS TOLD, in one line — the arrival IS the event (R41a), so the form must be legible. */
export function sovereignFormLine(rec, form) {
  if (!form?.form) return null;
  const name = rec?.name || rec?.id || "it";
  return form.form === "final"
    ? `${name} stands in FINAL FORM — this is the last stage, and there is no weaker version behind it.`
    : `${name} has ARRIVED DIMINISHED — arriving is diminishment; it can be fought, and it can be lost to survivably.`;
}
