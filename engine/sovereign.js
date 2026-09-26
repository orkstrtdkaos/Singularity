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

/** ⛔ R41b §1 (Erik, 2026-09-08), RULED AND NOT TUNED: *"That would be STAGE 3 when they arrive diminished and
 *  attempt to push the arc back their way and work to eliminate the threats"* — with R41a's *"final form for
 *  the last arc stage"*. ⚠️ A record may still name its own `atStage` per arc; these are what a `forms` block
 *  that omits one falls to. Without them an authored Sovereign with no `atStage` would never arrive at all,
 *  which is the inert-by-omission shape this project keeps closing. */
export const RULED_STAGES = { diminished: 3, final: 4 };

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
  // ⚑ AN OMITTED `atStage` FALLS TO THE RULING (R41b §1), never to Infinity — an arrival that can never
  // trigger is content that exists and does nothing.
  const stageFor = (f, k) => num(f?.atStage, RULED_STAGES[k]);   // ⚠ not `at` — that name already holds the resolved stage
  const pick = (fin && s >= stageFor(fin, "final")) ? ["final", fin]
    : (dim && s >= stageFor(dim, "diminished")) ? ["diminished", dim]
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
    // ⚑ R41b §1: the arrival is not a cutscene. It lands with two jobs — push the arc its own way, and
    // eliminate the people opposing it — so a diminished Sovereign is an ACTIVE PARTY, not a boss waiting.
    : `${name} has ARRIVED DIMINISHED — arriving is diminishment; it can be fought, and it can be lost to`
      + ` survivably. It is here to push the arc back its own way and to end whoever is opposing it.`;
}

/* ═════ SNG-642 §2 · C15 — WHAT AN ARC'S STAGE SAYS, AND TO WHOM ═════
 *
 * ✅ ERIK: *"showing the arcs not as numbered stages only… if the Hollow King is fully Satiated the stage describes
 * Full Bargains… people might know that bargains are being made… without naming the Hollow King yet."*
 *
 * ⛑ THREE LAYERS, EACH UNLOCKING SEPARATELY, and that separation is the whole idea: the world can be visibly
 * going wrong long before anybody knows whose hunger it is.
 *   · `publicFace`     — everyone. What is happening, with nobody named.
 *   · `onceLineKnown`  — after marks confirm a supply line (SNG-641 §2). Names the POWER, never the Sovereign.
 *   · `onceNamed`      — only once the save knows the Sovereign's name. Names the hunger behind it.
 *
 * ⚠️ MEASURED BEFORE BUILDING: `onceLineKnown` and `onceNamed` are now authored on 12 stages and READ BY NOBODY,
 * and neither `knownSovereigns` nor `marksSeen` appears anywhere in engine/ or app.js. Every one of the 22 older
 * stages carries a `name` and a `publicFace`, so nothing below changes what an existing arc shows.
 */

/** ⛔ THE MASK. Erik ruled it: while the save does not know Lucifer, every line that would name him names
 *  Eosphor, the Dawn Seraph. ⛑ Applied to the TEXT at the last hop, because a mask that rewrote the record
 *  would have to be undone everywhere the record is read — and the one thing a mask must never do is leak.
 *  ⚠️ Word boundaries, so a line about "Luciferian" prose is not silently rewritten. PURE. */
export function maskedFor(text, { character = null, masks = null } = {}) {
  const t = String(text ?? "");
  if (!t) return t;
  const list = masks && typeof masks === "object" ? masks : null;
  if (!list) return t;
  let out = t;
  for (const [id, mask] of Object.entries(list)) {
    if (!mask?.name) continue;
    if (knowsSovereign(character, id)) continue;          // they know him; he wears no mask for them
    const real = String(mask.realName || id).replace(/_/g, " ");
    out = out.replace(new RegExp(`\\b${real.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}\\b`, "gi"), mask.name);
  }
  return out;
}

/** ⛑ THE MASKS THE WORLD IS WEARING, derived from whoever carries one rather than listed anywhere. A record's
 *  `mask` is `{ name, title, showsAs, tells }`; the real name is the record's own. PURE. */
export function masksFrom(npcs = {}) {
  const out = {};
  for (const [id, rec] of Object.entries(npcs || {})) {
    if (!rec?.mask?.name) continue;
    out[id] = { ...rec.mask, realName: rec.name || String(id).replace(/_/g, " ") };
  }
  return out;
}

/** ⛔ WHOSE ARC THIS IS, derived. The arcs carry `sovereignGM` prose and NO id; the link runs the other way, on
 *  each record's own `forms.arcId` — which is the field `formsFix` set. ⛑ Derived rather than authored twice: a
 *  `sovereignId` on the arc would be a second copy of a fact the record already states, and the two would drift.
 *  PURE. */
export function sovereignOfArc(arcId, npcs = {}) {
  const want = String(arcId || "");
  if (!want) return null;
  for (const [id, rec] of Object.entries(npcs || {})) {
    if (rec?.forms?.arcId === want) return id;
  }
  return null;
}

/** Whether this save knows a Sovereign by name. ⛑ ONE READER for a fact two things can write: an anti-Sovereign
 *  telling you (R41c), and the Sovereign arriving. PURE. */
export function knowsSovereign(character, sovereignId) {
  const id = String(sovereignId || "");
  if (!id) return false;
  const k = character?.knownSovereigns;
  if (Array.isArray(k)) return k.includes(id);
  if (k && typeof k === "object") return !!k[id];
  return false;
}

/** ⛑ AND THE WRITER, so the reader is not waiting on a field nobody sets. Returns true when this is the first
 *  time. MUTATES. */
export function learnSovereign(character, sovereignId, { day = null, how = null } = {}) {
  const id = String(sovereignId || "");
  if (!character || !id) return false;
  if (!character.knownSovereigns || typeof character.knownSovereigns !== "object" || Array.isArray(character.knownSovereigns)) {
    const was = Array.isArray(character.knownSovereigns) ? character.knownSovereigns : [];
    character.knownSovereigns = {};
    for (const x of was) character.knownSovereigns[String(x)] = true;   // an older save's array form is kept, not dropped
  }
  if (character.knownSovereigns[id]) return false;
  character.knownSovereigns[id] = { day: Number(day) || null, how: how ? String(how) : null };
  return true;
}

/** ⛔ WHAT THIS STAGE SAYS TO THIS CHARACTER. The stage's NAME and nothing numeric; then each layer that has
 *  unlocked, in order, with `{power}` filled in where a confirmed line has one.
 *
 *  ⚠️ `stage` IS AN INDEX INTO AUTHORED STAGES, NOT A LABEL. It is used to FIND the stage and never shown —
 *  C15's fifth point is that no stage number reaches the player, and the two `\`Stage ${n}\`` fallbacks in
 *  `arceffects.js` and `worldtick.js` are exactly how one would. PURE. */
export function arcReading(arc, { stage = null, lineKnown = false, named = false, power = null, character = null, masks = null } = {}) {
  const stages = Array.isArray(arc?.stages) ? arc.stages : [];
  if (!stages.length) return null;
  const want = Number.isFinite(Number(stage)) ? Number(stage) : Number(arc?.currentStage) || 1;
  const def = stages.find(s => Number(s?.stage) === want) || stages[Math.max(0, Math.min(stages.length - 1, want - 1))];
  if (!def) return null;
  const mask = (s) => maskedFor(s, { character, masks });
  const fill = (s) => String(s ?? "").replace(/\{power\}/g, power || "somebody with a claim on it");
  const lines = [];
  if (def.publicFace) lines.push({ layer: "publicFace", text: mask(fill(def.publicFace)) });
  // ⛔ `onceLineKnown` NEEDS A POWER TO NAME. Its authored text is written around `{power}`, and a line reading
  // "somebody with a claim on it is where the bargains are struck" is worse than no line at all.
  if (lineKnown && def.onceLineKnown && power) lines.push({ layer: "onceLineKnown", text: mask(fill(def.onceLineKnown)) });
  if (named && def.onceNamed) lines.push({ layer: "onceNamed", text: mask(fill(def.onceNamed)) });
  return { arcId: arc.id || null, arcName: arc.name || arc.id || null, stageName: def.name || null, lines,
    // ⛔ SEALED, AND NAMED AS SEALED so a caller cannot reach for it by accident. `sovereignGM` is the GM's, and
    // §2.5 says neither it nor `onceNamed` reaches the player before its unlock.
    gmOnly: { sovereignGM: arc.sovereignGM || null, tendency: arc.tendency || null,
      pressureOnAdvance: def.pressureOnAdvance || null } };
}
