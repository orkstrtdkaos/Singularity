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

/* ═════ SNG-641 §2 · C14 — THE MARKS: CONFIRM THE LINE, NEVER THE HAND ═════
 *
 * ⛑ AEVI'S PRINCIPLE, and the lore's bar: *"You detect a run of decisions that are all individually reasonable
 * and cumulatively impossible."* So found ALONE, every mark has an ordinary explanation — a guild's sun-mark, old
 * coin, a lodger, a lullaby. The player's own COLLECTING is what makes them mean something.
 *
 * ⛔ AND THE SOVEREIGN IS NEVER NAMED HERE. `sovereignGM` is the seal: it is what lets the engine know two marks
 * are the same hand, and it is never in a line a player reads. The name comes only from somebody who knows — an
 * anti-Sovereign (R41c), a Precursor, or the thing itself when it arrives (`learnSovereign`).
 *
 * ⚠️ AND IT CLOSES A READER OPENED ONE COMMIT EARLIER: `arcReading`'s `onceLineKnown` had its input handed in as
 * `false`, because the confirmation lives here.
 */

/** What this save has seen, as `{ markId: [{ at, regionId, powerId, day }, …] }`. PURE. */
export function marksSeenOf(character) {
  const m = character?.marksSeen;
  return (m && typeof m === "object" && !Array.isArray(m)) ? m : {};
}

/** ⛑ RECORDING ONE. Returns the sighting, or null when this save has already seen this mark in this place —
 *  "never one already seen" is Aevi's rule, and it is per PLACE, because seeing the same mark somewhere else is
 *  exactly the discovery. MUTATES. */
export function seeMark(character, markId, { at = null, regionId = null, powerId = null, day = null } = {}) {
  const id = String(markId || "");
  if (!character || !id) return null;
  if (!character.marksSeen || typeof character.marksSeen !== "object" || Array.isArray(character.marksSeen)) character.marksSeen = {};
  const list = Array.isArray(character.marksSeen[id]) ? character.marksSeen[id] : (character.marksSeen[id] = []);
  if (list.some(s => s && String(s.at || "") === String(at || ""))) return null;
  const sighting = { at: at || null, regionId: regionId || null, powerId: powerId || null, day: Number(day) || null };
  list.push(sighting);
  return sighting;
}

/** ⛔ WHAT THE COLLECTING ADDS UP TO, per power, on the authored thresholds.
 *
 *  ⚠️ COUNTED BY MARK, NOT BY SIGHTING. Seeing the hollow coin in four towns on one power's road is ONE mark
 *  four times over — a pattern about that mark, not four marks about that power — and counting sightings would
 *  confirm a line off a single discovery repeated. The lore's bar is a RUN of different reasonable things.
 *
 *  ⛑ `sameHand` is the other axis: ONE mark seen through two different powers in two different regions, which is
 *  the "200 miles apart, and nobody here has heard of the other place" reading. It needs no threshold per power.
 *
 *  Returns `{ byPower: { id: { marks, confirmed, pattern } }, sameHand: [{ markId, regions, powers }] }`. PURE. */
export function markStanding(character, { marks = null, thresholds = null } = {}) {
  const seen = marksSeenOf(character);
  const all = Array.isArray(marks) ? marks : (Array.isArray(marks?.marks) ? marks.marks : []);
  const byId = new Map(all.filter(m => m && m.id).map(m => [String(m.id), m]));
  const th = thresholds || marks?.thresholds || {};
  const patternAt = Math.max(1, Number(th.pattern) || 2);
  const confirmAt = Math.max(patternAt, Number(th.lineConfirmed) || 3);
  const regionsAt = Math.max(2, Number(th.sameHandRegions) || 2);
  const byPower = {};
  const sameHand = [];
  for (const [markId, sightings] of Object.entries(seen)) {
    if (!byId.has(markId) || !Array.isArray(sightings)) continue;
    const powers = new Set(), regions = new Set();
    for (const s of sightings) {
      if (s?.powerId) {
        powers.add(String(s.powerId));
        const p = (byPower[String(s.powerId)] = byPower[String(s.powerId)] || { marks: new Set(), regions: new Set() });
        p.marks.add(markId);
        if (s.regionId) p.regions.add(String(s.regionId));
      }
      if (s?.regionId) regions.add(String(s.regionId));
    }
    if (powers.size >= 2 && regions.size >= regionsAt) sameHand.push({ markId, regions: [...regions], powers: [...powers] });
  }
  const out = {};
  for (const [id, p] of Object.entries(byPower)) {
    const n = p.marks.size;
    out[id] = { marks: n, regions: [...p.regions], seen: [...p.marks],
      pattern: n >= patternAt, confirmed: n >= confirmAt };
  }
  return { byPower: out, sameHand, thresholds: { pattern: patternAt, lineConfirmed: confirmAt, sameHandRegions: regionsAt } };
}

/** ⛔ WHICH POWERS THIS SAVE HAS CONFIRMED AS LINES, and to WHAT — the id a caller needs to unlock `onceLineKnown`
 *  on the right arc. ⛑ The Sovereign is named to the ENGINE and never to the player: this returns an arc id, and
 *  it is `arcReading` that decides whether the save may read the naming layer at all. PURE. */
export function confirmedLines(character, { marks = null, thresholds = null, npcs = {} } = {}) {
  const st = markStanding(character, { marks, thresholds });
  const all = Array.isArray(marks) ? marks : (Array.isArray(marks?.marks) ? marks.marks : []);
  const byId = new Map(all.filter(m => m && m.id).map(m => [String(m.id), m]));
  const out = [];
  for (const [powerId, row] of Object.entries(st.byPower)) {
    if (!row.confirmed) continue;
    // whose line is it? the marks seen on it agree, because no mark belongs to two Sovereigns
    const who = [...new Set(row.seen.map(id => byId.get(id)?.sovereignGM).filter(Boolean))];
    for (const sovereignId of who) {
      const rec = npcs?.[sovereignId] || null;
      out.push({ powerId, sovereignId, arcId: rec?.forms?.arcId || null, marks: row.marks });
    }
  }
  return out;
}

/** ⛑ WHAT THE GM MAY SAY, and nothing more. One line per step, from the authored `gmLines`, with `{power}` filled.
 *  ⛔ NOTHING HERE NAMES A SOVEREIGN. The confirmed line says something beyond this power is being fed — that is
 *  the lore's *"Confirm an AGENT"*, and the hand stays unnamed. PURE. */
export function markLinesFor(character, { marks = null, thresholds = null, nameOfPower = null } = {}) {
  const st = markStanding(character, { marks, thresholds });
  const lines = (marks?.gmLines && typeof marks.gmLines === "object") ? marks.gmLines : {};
  const name = (id) => (typeof nameOfPower === "function" ? nameOfPower(id) : null) || String(id).replace(/^power_/, "").replace(/_/g, " ");
  const out = [];
  for (const [powerId, row] of Object.entries(st.byPower)) {
    const key = row.confirmed ? "lineConfirmed" : row.pattern ? "pattern" : null;
    if (!key || !lines[key]) continue;
    out.push({ powerId, step: key, text: String(lines[key]).replace(/\{power\}/g, name(powerId)) });
  }
  for (const s of st.sameHand) {
    if (lines.sameHand) out.push({ markId: s.markId, step: "sameHand", text: String(lines.sameHand), regions: s.regions });
  }
  return out;
}

/** ⛔ WHICH MARK MAY BE PLACED HERE, and at most one. A mark belongs where its own `nearIds` put it — a place, a
 *  power, or a region it names — and never one this save has already seen IN THIS PLACE.
 *  ⚠️ `rng` is injected so a scene is reproducible; a null return is the common answer and must stay cheap. PURE
 *  apart from nothing — it chooses, it does not record. `seeMark` records. */
export function markForHere(character, { at = null, regionId = null, powers = [], marks = null, rng = Math.random } = {}) {
  const all = Array.isArray(marks) ? marks : (Array.isArray(marks?.marks) ? marks.marks : []);
  if (!all.length || !at) return null;
  const here = new Set([String(at), ...(regionId ? [String(regionId)] : []), ...powers.map(p => String(p?.id || p))]);
  const seen = marksSeenOf(character);
  const fits = all.filter(m => {
    if (!m?.id || !Array.isArray(m.nearIds)) return false;
    if (!m.nearIds.some(x => here.has(String(x)))) return false;
    return !(Array.isArray(seen[m.id]) && seen[m.id].some(s => String(s?.at || "") === String(at)));
  });
  if (!fits.length) return null;
  const pick = fits[Math.min(fits.length - 1, Math.floor((Number(rng()) || 0) * fits.length))];
  // ⛑ WHOSE LINE, for the engine's bookkeeping only. A caller that puts `sovereignGM` in front of a player has
  // broken the one rule this whole feature rests on, so the mark is handed over with the SEAL kept separate.
  return { id: pick.id, kind: pick.kind || null, mark: pick.mark || null, ordinaryReading: pick.ordinaryReading || null,
    at, regionId: regionId || null, sealed: { sovereignGM: pick.sovereignGM || null } };
}

/* ═════ SNG-641 §1 · C13 (CORRECTED) — A BROKEN LINE IS A DEED AGAINST THE ARC ═════
 *
 * ⛔ SNG-640 §5's first version lowered a fed-state counter each time a supply-line power broke, and Aevi replaced
 * it because it contradicts Erik's R40b.2: *"A Sovereign's supply state is DERIVED from its arc's stage, not the
 * other way round."* So THERE IS NO NEW COUNTER. Breaking, taking or turning a supply-line power pushes that
 * Sovereign's arc BACK, and the supply state follows the stage — which is also what makes R41's arrival work,
 * since `sovereignFormFor` reads the stage and nothing else.
 *
 * ⛑ AND IT IS THE SAME DOOR A QUEST USES: `quests.js`'s `arc_stage` op writes `worldState.arcStages[id].push` with
 * this sign convention. A deed against an arc is the same kind of thing, so it moves the world the same way rather
 * than through a second mechanism nobody else reads.
 *
 * ⚠️ `feedsGM` ON A POWER IS NOT AN AGENT FLAG and does not break R40b.4 — a thieves' guild can carry a Sovereign's
 * freight without one member knowing. It is GM-only and never shown to the player; nothing here surfaces it.
 */

/** Which Sovereigns a power feeds, from its own `feedsGM`. Tolerant of the two shapes content uses — a list of
 *  `{ sovereign, through }`, or a bare id. ⛑ `temptedGM` is deliberately NOT read: being tempted is not feeding.
 *  PURE. */
export function feedsOf(power) {
  const raw = power?.feedsGM;
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  const out = [];
  for (const f of list) {
    const id = typeof f === "string" ? f : (f?.sovereign || f?.id || null);
    if (id) out.push({ sovereignId: String(id), through: (typeof f === "object" && f?.through) ? String(f.through) : null });
  }
  return out;
}

/** ⛔ THE DEED. `kind` is what was done to them — "broken" | "taken" | "turned" | "leaderSlain" — and each is worth
 *  a step of push against the arc that Sovereign's arrival rides on.
 *
 *  ⚠️ NEGATIVE, because `arcStageNow` adds the push to the authored base and a starved hunger is a hunger whose arc
 *  RECEDES. A positive number here would have fed the thing by hurting it.
 *
 *  ⛑ THE WEIGHTS ARE A DIAL, not a table in code (`rules.sovereigns.deedPush`), and the defaults are the smallest
 *  thing that can be felt: breaking a line outright is worth more than taking one of its holds, because a hold can
 *  be retaken and a broken power is finished until something puts it back.
 *
 *  Returns the pushes it recorded, `[{ sovereignId, arcId, delta, push }]`, or []. MUTATES `character.worldState`. */
export function deedAgainstSupply(character, power, { kind = "broken", npcs = {}, day = null, cfg = null } = {}) {
  const feeds = feedsOf(power);
  if (!character || !feeds.length) return [];
  const w = (cfg && typeof cfg === "object" ? cfg : {});
  const weight = (() => {
    const said = Number(w[kind]);
    if (Number.isFinite(said)) return said;
    return kind === "broken" ? 1 : kind === "leaderSlain" ? 1 : 0.5;   // taken / turned: half a step
  })();
  if (!(weight > 0)) return [];
  // \u26d1 THE BAG IS MADE ONLY WHEN SOMETHING IS WRITTEN. Creating it up front dirtied the save on every deed
  // against a power whose Sovereign has no arc \u2014 nothing happened and the save looked changed anyway.
  const bag = () => {
    character.worldState = character.worldState || {};
    character.worldState.arcStages = character.worldState.arcStages || {};
    return character.worldState.arcStages;
  };
  const out = [];
  for (const f of feeds) {
    const arcId = npcs?.[f.sovereignId]?.forms?.arcId || null;
    // ⛔ NO ARC, NO DEED. A Sovereign with no arc has nothing for the deed to act on — which is exactly the hole
    // SNG-642 §1 found in Lucifer before an arc was authored for the Light seat, and saying nothing is the honest
    // answer rather than pushing some other arc that happens to be nearby.
    if (!arcId) continue;
    const stages = bag();
    const prev = stages[arcId] || {};
    const push = (Number.isFinite(prev.push) ? prev.push : 0) - weight;
    stages[arcId] = { ...prev, push, sinceDay: Number(day) || prev.sinceDay || null,
      byDeed: { kind, powerId: power?.id || null, day: Number(day) || null } };
    out.push({ sovereignId: f.sovereignId, arcId, delta: -weight, push });
  }
  return out;
}

/** ⛑ WHAT THE PLAYER IS TOLD, and it names the POWER and what was done to it — never what it was feeding. A line
 *  that said "you have starved the Hollow King" would hand over the one thing §2 spends the whole feature
 *  withholding. ⚠️ Returns null when nothing moved, so a caller cannot print an empty sentence. PURE. */
export function supplyDeedLine(pushes, power, { kind = "broken" } = {}) {
  if (!Array.isArray(pushes) || !pushes.length) return null;
  const name = power?.name || power?.id || "them";
  const what = kind === "broken" ? `${name} are finished`
    : kind === "leaderSlain" ? `the one who led ${name} is dead`
    : kind === "turned" ? `${name} answer to you now`
    : `${name} have lost ground`;
  return `${what} — and something that was being carried through them is not being carried any more.`;
}

/* ═════ SNG-641 §6 · ITEM 3b — A MINTED POWER MAY BECOME A LINE, AND ONLY ONE PER SOVEREIGN PER REGION ═════
 *
 * ⛔ NOT RULED, AND SHIPPED OFF. Aevi's work order calls this row RULED; her own spec §7.4 lists it under "RULINGS
 * I NEED", and the staged `generatorRule._status` reads "proposal — Erik §7.4". The spec and the data agree, so the
 * rule exists and `arcResponse.supplyLineRule.on` is false until Erik says otherwise. A broadening of how much of
 * the world feeds a Sovereign is not a default I get to pick.
 *
 * ⛑ WHAT IT IS: when the generator mints a power in a region, the power is matched against the three hungers —
 * being seen (arenas, boards, heralds, orders that inform), petition (outlaw crowns wanting a grant, lordships with
 * a contested claim, guilds that take tribute), bodies (guilds that fence or smuggle, orders leaning to Mind).
 *
 * ⚠️ AND THE ORDER OF THE TWO GUARDS IS THE WHOLE OF R40b.2. The arc's stage must ALREADY be at least 1 before a
 * line may grow from it — "the lines grow from the arc, not the arc from the lines". A rule that let a new line
 * raise the stage would be the counter Erik's ruling forbids, wearing a different coat.
 */

/** ⛔ WHETHER A MINTED POWER MAY BECOME A SUPPLY LINE, and whose. Returns `{ ok, sovereignId, why }` — and `ok:
 *  false` with a reason is the common answer, which a caller should be able to log without guessing.
 *
 *  `stageOf` is injected (worldtick owns the live stage) so this module stays free of the world-tick, exactly as
 *  `sovereignFormFor` does. `linesInRegion` is the caller's count of lines already in this region, per Sovereign.
 *  PURE. */
export function mayBecomeALine(power, { regionId = null, rule = null, stageOf = null, npcs = {}, linesInRegion = null } = {}) {
  const r = (rule && typeof rule === "object") ? rule : null;
  // ⚠️ NO TICKET REFERENCE IN THE STRING. §262 ratchets those down because nine of them had reached a player, and a
  // `why` a caller may log is a string like any other. The spec is named in the comment, where it belongs.
  if (!r || r.on !== true) return { ok: false, why: "the supply-line rule is off until it is ruled on" };
  if (!power || !regionId) return { ok: false, why: "no power, or no region to place it in" };
  // ⛑ A power that already feeds somebody is not a candidate — it IS one.
  if (feedsOf(power).length) return { ok: false, why: "it already carries somebody's freight" };
  const hungers = (r.hungers && typeof r.hungers === "object") ? r.hungers : {};
  const kind = String(power.kind || "").toLowerCase();
  const verbs = new Set((Array.isArray(power.verbs) ? power.verbs : []).map(v => String(v).toLowerCase()));
  const tags = new Set([...(Array.isArray(power.tags) ? power.tags : []), ...(Array.isArray(power.form) ? power.form : [])]
    .map(x => String(x).toLowerCase()));
  const cap = Math.max(1, Number(r.capPerSovereignPerRegion) || 1);
  const need = Number.isFinite(Number(r.requiresArcStageAtLeast)) ? Number(r.requiresArcStageAtLeast) : 1;
  // \u26d4 SCORED, NOT FIRST-WINS. Looping in declaration order handed a fence-and-smuggle guild to LUCIFER, because
  // `lucifer.kinds` lists "guild" and lucifer is declared first \u2014 the second time in this project a JSON key order
  // silently became a priority rule. \u26d1 A VERB is strong evidence (fencing is a specific thing to do), a TAG is
  // strong (an arena is an arena), a KIND is weak (a guild can be anything).
  const scored = [];
  for (const [sovereignId, want] of Object.entries(hungers)) {
    const kindHit = (want.kinds || []).map(String).map(s => s.toLowerCase()).includes(kind);
    const verbHit = (want.verbs || []).some(v => verbs.has(String(v).toLowerCase()));
    const tagHit = (want.tags || []).some(x => tags.has(String(x).toLowerCase()));
    if (!kindHit && !verbHit && !tagHit) continue;
    scored.push({ sovereignId, want, score: (verbHit ? 2 : 0) + (tagHit ? 2 : 0) + (kindHit ? 1 : 0) });
  }
  scored.sort((a, b) => b.score - a.score);
  // \u26a0\ufe0f A GENUINE TIE IS REFUSED, not tossed for. Two hungers with equal claim on one power is a content question
  // \u2014 Aevi's to answer by making one of the two more specific \u2014 and a coin toss would make the same world mint
  // different lines on different runs, which is exactly what `verbForPass` rotates rather than rolls to avoid.
  if (scored.length > 1 && scored[0].score === scored[1].score) {
    return { ok: false, why: `it matches ${scored.length} hungers equally (${scored.map(s => s.sovereignId).join(", ")}) \u2014 one of them needs to be more specific` };
  }
  for (const { sovereignId, want } of scored) {
    // ⛔ THE CAP, BEFORE THE STAGE, because a region that is already full is a cheaper no.
    const already = Number(linesInRegion?.[sovereignId]) || 0;
    if (already >= cap) return { ok: false, sovereignId, why: `this region already has ${already} line for them (cap ${cap})` };
    // ⛔ AND THE STAGE MUST ALREADY HAVE MOVED. R40b.2: the lines grow from the arc, never the arc from the lines.
    const arcId = npcs?.[sovereignId]?.forms?.arcId || null;
    if (!arcId) return { ok: false, sovereignId, why: "that Sovereign has no arc for a line to grow from" };
    const stage = (() => { try { return Number(stageOf ? stageOf(arcId) : null); } catch { return null; } })();
    if (!Number.isFinite(stage)) return { ok: false, sovereignId, why: "the arc's stage could not be read" };
    if (stage < need) return { ok: false, sovereignId, why: `${arcId} is at stage ${stage}, and a line needs ${need}` };
    return { ok: true, sovereignId, arcId, why: `it matches their hunger and ${arcId} has reached stage ${stage}` };
  }
  return { ok: false, why: "it matches no hunger" };
}

/** ⛑ HOW MANY LINES A REGION ALREADY HAS, per Sovereign — the count `mayBecomeALine` needs for its cap, derived
 *  from the powers themselves rather than stored anywhere. PURE. */
export function linesInRegion(powers, regionId, { locations = {} } = {}) {
  const want = String(regionId || "");
  const out = {};
  if (!want) return out;
  for (const p of (Array.isArray(powers) ? powers : Object.values(powers || {}))) {
    const feeds = feedsOf(p);
    if (!feeds.length) continue;
    // ⚠️ A POWER'S REGION IS ITS REACH'S, not a field it carries: `reach` is place ids, and the places know
    // their region. A power reaching two regions counts in both, which is correct — the cap is per region.
    const regions = new Set((Array.isArray(p.reach) ? p.reach : []).map(id => locations?.[id]?.regionId).filter(Boolean));
    if (!regions.has(want)) continue;
    for (const f of feeds) out[f.sovereignId] = (out[f.sovereignId] || 0) + 1;
  }
  return out;
}

/* ═════ SNG-642 §4–5 · C16 — THE ARTIFACTS THAT WORK, AND FEED ═════
 *
 * ✅ ERIK: *"If a PC finds one (or NPC) they can use it… but it would likely be helping feed the sovereign."*
 *
 * ⛑ EVERY USE IS A DEED TOWARD THE ARC, whoever uses it — and R40b.4 is why that is not an agent flag: agents push
 * as ordinary figures, and nothing here marks the user as one. Using an artifact makes you part of the supply line
 * WITHOUT KNOWING IT, which is the lore's "individually reasonable, cumulatively impossible" with the player's own
 * hand on it. ⛔ And it is the SAME push `deedAgainstSupply` uses, in the opposite direction: one field, one sign
 * convention, and starving and feeding are the same ledger read from two ends.
 */

/** Which artifacts a character is carrying — the ones whose `feeds` names an arc. PURE. */
export function artifactsHeld(character, { items = {} } = {}) {
  const inv = Array.isArray(character?.inventory) ? character.inventory : [];
  const out = [];
  for (const line of inv) {
    const def = (line?.id && items?.[line.id]) || null;
    if (def?.feeds?.arcId) out.push({ line, def });
  }
  return out;
}

/** ⛔ USING ONE IS A DEED FOR THE ARC. `+weight` where a broken line is `-weight`, because feeding and starving are
 *  one ledger. ⚠️ CREDITED TO THE USER and to nobody else: `by` rides on the record so the world tab can say whose
 *  hand it was, and an NPC's use counts exactly as a player's does (R40b.4).
 *  Returns `{ arcId, delta, push }` or null. MUTATES `character.worldState`. */
export function artifactUsed(character, def, { day = null, by = null, cfg = null, arcs = null } = {}) {
  const arcId = def?.feeds?.arcId || null;
  if (!character || !arcId) return null;
  // \u26d4 AND THE ARC HAS TO EXIST, the same rule `deedAgainstSupply` already keeps. The Unmet's two artifacts fed
  // `arc_the_widening` before it was authored, so the push landed on a phantom id \u2014 the write succeeded and meant
  // nothing, which is how a field with no target hides. \u26d1 `arcs` absent means the caller cannot check; then it
  // behaves as before rather than refusing work it has no grounds to refuse.
  if (Array.isArray(arcs) && arcs.length && !arcs.some(a => a && a.id === arcId)) return null;
  const said = Number((cfg && typeof cfg === "object") ? cfg.artifactUse : NaN);
  const weight = Number.isFinite(said) ? said : 0.25;   // ⛑ a quarter stage: a use is a small thing done often
  if (!(weight > 0)) return null;
  character.worldState = character.worldState || {};
  character.worldState.arcStages = character.worldState.arcStages || {};
  const prev = character.worldState.arcStages[arcId] || {};
  const push = (Number.isFinite(prev.push) ? prev.push : 0) + weight;
  character.worldState.arcStages[arcId] = { ...prev, push, sinceDay: Number(day) || prev.sinceDay || null,
    byArtifact: { id: def.id || null, by: by || null, day: Number(day) || null } };
  return { arcId, delta: weight, push };
}

/** ⛔ §5 — THE COST IS ENFORCED, NOT DESCRIBED. "The Ring blocks stealth and the Lantern cannot be dimmed."
 *
 *  ⚠️ A SENTENCE CANNOT BE ENFORCED, so an artifact whose cost bites carries `forbidTags`, and only the two Aevi
 *  named do. The refusal is SAID — the item's own `whatItCosts` is the reason the player reads — because a refusal
 *  nobody explains reads as a broken button, which is the note this project has written down three times.
 *
 *  ⛑ It is the same shape as `wardAgainst`: a thing you are carrying makes a mechanic UNAVAILABLE rather than
 *  harder, and the difference between "it failed" and "it could not apply" is the whole of what the player learns.
 *  Returns `{ forbidden, item, why }`. PURE. */
export function forbiddenByHeld(character, tags, { items = {} } = {}) {
  const want = new Set((Array.isArray(tags) ? tags : [tags]).filter(Boolean).map(x => String(x).toLowerCase()));
  if (!want.size) return { forbidden: false, item: null, why: null };
  const inv = Array.isArray(character?.inventory) ? character.inventory : [];
  for (const line of inv) {
    const def = (line?.id && items?.[line.id]) || null;
    const forbids = Array.isArray(def?.forbidTags) ? def.forbidTags : null;
    if (!forbids?.length) continue;
    if (!forbids.some(x => want.has(String(x).toLowerCase()))) continue;
    return { forbidden: true, item: { id: def.id, name: line.customName || def.name || def.id },
      why: def.whatItCosts || "what you are carrying will not allow it" };
  }
  return { forbidden: false, item: null, why: null };
}

/** ⛑ §5 — AND HOLDING ONE COUNTS AS HAVING SEEN ITS MARK. A player who learned the lidless ring recognises the
 *  Lidless Ring, and the reverse: the ring in your hand is the mark, whether or not you were told so.
 *  ⚠️ Recorded at the place the artifact was FOUND when that is known, because a mark is a sighting somewhere.
 *  Returns the ids newly learned. MUTATES. */
export function marksFromHeld(character, { items = {}, at = null, day = null } = {}) {
  const out = [];
  for (const { line, def } of artifactsHeld(character, { items })) {
    if (!def.markId) continue;
    const where = at || line.foundAt || def._foundAtId || "in your own hands";
    if (seeMark(character, def.markId, { at: where, day })) out.push(def.markId);
  }
  return out;
}

/* ═════ SNG-644 · C18 — A SEAT HELD BY THE SAVIOR SIDE ═════
 *
 * ✅ ERIK: *"Just because a seat is filled doesn't mean they keep it."*
 *
 * ⛑ AEVI'S RULE: a claimant finishing — the lore's *"a villain you fail to stop is a promotion"* — cannot promote
 * them into a held seat WHILE THE HOLDER STANDS. Slay, turn or break the holder and the seat opens, to whichever
 * challenger did it. The open seat (Chaos / Order) is promoted by a finish alone.
 *
 * ⚠️ AND THERE IS NO PROMOTION PATH IN THE ENGINE YET. "A villain you fail to stop is a promotion" has its
 * arithmetic — a `spectrum` value at ±0.95, with four figures standing at the end of one — and nothing that acts on
 * it. So a free-standing `mayFinishInto` predicate would be a reader with no caller, which the wiring audit refuses
 * and rightly. ⛔ INSTEAD THE ANSWER CARRIES THE GUARD: `openTo` is EMPTY while the holder stands, so a promotion
 * path cannot be written that forgets to ask. The GM block consumes it today.
 *
 * ⛑ AND WHETHER THE HOLDER STANDS IS DERIVED, never stored: `worldState.epicStatus` already records a figure's
 * status, and a second copy on a seat is a second answer to one question — which is how the sell-share drifted from
 * its own projection an hour after I wrote it.
 */

/** ⛔ WHERE THE SEVEN SEATS STAND, for this save. Per axis: who holds it, whether they still stand, who is reaching
 *  for it, and WHO IT IS OPEN TO — which is the guard, expressed as the answer rather than as a separate question a
 *  caller could forget to ask.
 *
 *  A holder is REMOVED when the save's `epicStatus` says dead, turned or broken. ⚠️ "Turned" is on the list because
 *  Aevi's rule names it: a holder who has been turned is no longer in the way, and she is not dead.
 *
 *  Returns `[{ axis, holder, holderStands, why, challengers, openTo, kind }]`. PURE. */
export function seatState(character, { seats = null, npcs = {} } = {}) {
  const doc = seats && typeof seats === "object" ? seats : {};
  const ws = character?.worldState || {};
  const statusOf = (id) => {
    const st = ws.epicStatus?.[String(id)] || null;
    const s = String(st?.status || "").toLowerCase();
    if (s === "dead") return "slain";
    if (s === "turned") return "turned";
    if (st?.broken === true || s === "broken") return "broken";
    return null;
  };
  const out = [];
  for (const seat of (Array.isArray(doc.heldSeats) ? doc.heldSeats : [])) {
    const gone = seat.holder ? statusOf(seat.holder) : null;
    const stands = !gone;
    // ⛑ AND ONLY THE CHALLENGER WHO DID IT. Aevi: "the seat opens to whichever challenger did it" — so the ledger's
    // own record of who removed the holder decides, and a seat that opened by other means opens to nobody.
    const by = ws.epicStatus?.[String(seat.holder)]?.killedBy || ws.epicStatus?.[String(seat.holder)]?.turnedBy || null;
    const challengers = (Array.isArray(seat.challengers) ? seat.challengers : []).map(String);
    const openTo = stands ? [] : challengers.filter(c => !by || c === String(by));
    out.push({ axis: seat.axis || null, kind: "held", holder: seat.holder || null,
      holderName: npcs?.[seat.holder]?.name || seat.holder || null,
      holderStands: stands, why: stands ? (seat.holdsBy || "she is in the way") : `she was ${gone}`,
      knows: seat.knows || null, challengers, openTo,
      openedBy: stands ? null : (by ? String(by) : null) });
  }
  for (const seat of (Array.isArray(doc.openSeats) ? doc.openSeats : [])) {
    const claimants = (Array.isArray(seat.claimants) ? seat.claimants : []).map(String);
    // ⛔ NOBODY IS IN THE WAY, so a finish alone takes it — which is why the lore calls this the most dangerous seat.
    out.push({ axis: seat.axis || null, kind: "open", holder: null, holderName: null, holderStands: false,
      why: seat.note || "nobody holds it", knows: null, challengers: claimants, openTo: claimants, openedBy: null });
  }
  return out;
}

/** ⛑ WHAT THE GM IS TOLD ABOUT THE SEATS, and it is GM-only — nothing here reaches a player. ⛔ A HOLDER DOES NOT
 *  KNOW SHE HOLDS A SEAT: Aevi's line is exact, "what she is holding back — not that it is a seat", so the block says
 *  so rather than leaving a narrator to have her explain her own cosmic function. PURE. */
export function seatsForGM(character, { seats = null, npcs = {}, claims = null } = {}) {
  const rows = seatState(character, { seats, npcs });
  if (!rows.length) return "";
  const name = (id) => npcs?.[id]?.name || String(id || "").replace(/_/g, " ");
  // ⛔ SNG-663 §1 — AND WHO HAS FINISHED. A claimant whose arc has ended is the most dangerous thing on the map,
  // and a narrator who does not know it will write the week as though nothing happened.
  const ws663 = character?.worldState || {};
  const pressOn = (axis) => ws663.seatPress?.[axis] || null;
  const takenOn = (axis) => ws663.seatsTaken?.[axis] || null;
  const lines = rows.map(r => {
    if (r.kind === "open") {
      const seatedO = takenOn(r.axis);
      return `${r.axis}: ${seatedO ? `${name(seatedO.by)} HAS TAKEN IT${seatedO.day != null ? ` (day ${seatedO.day})` : ""} — their power's lines feed this hunger now.` : `NOBODY HOLDS IT. ${r.why}`} `
        + `Reaching for it: ${r.challengers.map(name).join(", ") || "nobody"}.${seatedO ? " A second finisher presses whoever sits there." : " A finish alone takes this one."}`;
    }
    const p = pressOn(r.axis), seated = takenOn(r.axis);
    const finished = (claims || []).filter(c => c && c.axis === r.axis && c.finished);
    const tail = seated ? ` ⛔ ${name(seated.by)} HAS TAKEN THIS SEAT${seated.day != null ? ` (day ${seated.day})` : ""} — their power's lines feed this hunger now.`
      : p ? ` ⛔ ${name(p.by)} HAS FINISHED and is PRESSING${p.target ? ` against ${name(p.target)}` : ""}: ${p.why || "they reached the end of their arc and found the way blocked"}. Play them as arrived, not as coming.`
      : finished.length ? ` ⚠️ ${finished.map(c => name(c.claimant)).join(", ")} stands at the end of their arc.` : "";
    return (r.holderStands
      ? `${r.axis}: ${name(r.holder)} IS IN THE WAY — ${r.why} ⛔ She does NOT know it is a seat; she knows ${r.knows || "what she is holding back"}. `
        + `Reaching past her: ${r.challengers.map(name).join(", ")}. While she stands, none of them can finish into it, however far along they are.`
      : `${r.axis}: ${name(r.holder)} IS GONE — ${r.why}. The seat is open to ${r.openTo.map(name).join(", ") || "nobody, because it was not a challenger who removed her"}.`) + tail;
  });
  return lines.join("\n");
}

/* ═════ SNG-663 §1 · THE PROMOTION PATH — A VILLAIN YOU FAIL TO STOP IS A PROMOTION ═════
 *
 * ✅ ERIK 2026-09-26, on the gap CCODE-541 reported: *"Yes."*
 *
 * ⛑ AEVI'S ORDER, RULED AS WRITTEN: an arc reaching its end has a consequence · the consequence reads `openTo` · the
 * world says so without naming the Sovereign.
 *
 * ⚠️ AND THE TRIGGER IS THE ARC CLOCK THAT EXISTS, not the spectrum. `arcStageNow` is base + this actor's push +
 * everyone else's + the epics' (`epicArcPushes`, fed by `applyEpicArcPush` from a figure's own `arcAffinity`),
 * clamped to the arc's stages. An arc has ENDED when that stands at its last stage — and "unresisted" is not a
 * separate test, it is what the sum already means: on `arc_what_wakes_beneath` Morvane leans +1×3 and Neth −1×2.
 * The claimant drives the arc; the holder resists it. That IS "a holder is in the way", authored, today.
 *
 * ⛔ THREE OF THE FIVE CLAIMANTS CANNOT FINISH, AND THE READER SAYS SO. Measured: every LEGENDARY claimant —
 * `thornmother_sealed`, `the_scouring_hand`, `the_still_lattice` — carries no `arcAffinity` and no `wantArcId`, so
 * there is no arc of theirs to end. The open Chaos / Order seat has one claimant and it is one of the three. That is
 * a content gap and it is Aevi's; what this must not do is invent an arc to make the rule look alive. */

/** ⛔ WHERE EVERY CLAIMANT STANDS WITH THE SEAT THEY REACH FOR. One row per claimant per seat:
 *  `act` is `"takes"` · `"presses"` · `"waiting"` · `"cannot"` · `"seated"`, and `why` says it in words.
 *
 *  ⛑ PURE, and the arc clock stays where it lives: `stageOf(arcId)` and `totalOf(arcId)` are handed in by the tick,
 *  which owns `arcStageNow`. A caller with neither gets `act: "waiting"` and a reason, never a guess. */
export function seatClaims(character, { seats = null, npcs = {}, stageOf = null, totalOf = null } = {}) {
  const rows = seatState(character, { seats, npcs });
  const taken = character?.worldState?.seatsTaken || {};
  const nameOf = (id) => npcs?.[id]?.name || String(id || "").replace(/_/g, " ");
  const out = [];
  for (const r of rows) {
    const seated = taken[r.axis] || null;
    for (const id of (r.challengers || [])) {
      const rec = npcs?.[id] || null;
      const aff = rec?.arcAffinity || null;
      // ⚠️ `dir > 0` IS THE WHOLE OF "THEIR" ARC. A figure leaning the other way is RESISTING it, and a resister
      // finishing would be the arc ending against them — which is not a promotion, it is a defeat.
      const drives = !!(aff && aff.arcId && Number(aff.dir) > 0);
      const stage = drives && typeof stageOf === "function" ? Number(stageOf(aff.arcId)) : null;
      const total = drives && typeof totalOf === "function" ? Number(totalOf(aff.arcId)) : null;
      const finished = drives && Number.isFinite(stage) && Number.isFinite(total) && total > 0 && stage >= total;
      let act = "waiting", why = "";
      if (!drives) { act = "cannot"; why = "no arc of their own to finish — nothing of theirs can end"; }
      else if (!Number.isFinite(stage) || !Number.isFinite(total)) { act = "waiting"; why = "the arc clock was not handed over"; }
      else if (!finished) { act = "waiting"; why = `their arc stands at ${stage} of ${total}`; }
      else if (seated) {
        // ⛔ ONE PROMOTION PER SEAT, EVER. A second finisher presses whoever sits there, exactly as against a holder.
        act = seated.by === id ? "seated" : "presses";
        why = seated.by === id ? "they took it" : `${nameOf(seated.by)} sits there now`;
      }
      else if (r.kind === "open") { act = "takes"; why = "nobody is in the way"; }
      else if (r.holderStands) { act = "presses"; why = `${r.holderName || nameOf(r.holder)} is still in the way`; }
      else if ((r.openTo || []).includes(String(id))) { act = "takes"; why = "they removed the one who stood there"; }
      else { act = "presses"; why = "the seat opened to nobody — they press an empty chair they cannot sit in"; }
      out.push({ axis: r.axis, kind: r.kind, claimant: String(id), name: nameOf(id),
        arcId: aff?.arcId || null, stage, total, finished, act, why,
        holder: r.holder || null, holderName: r.holderName || null, holderStands: !!r.holderStands });
    }
  }
  return out;
}

/** ⛑ WHAT THE WORLD SAYS WHEN SOMEBODY FINISHES, and it NEVER NAMES THE SOVEREIGN — C17's rule, and the one thing
 *  a narrator would otherwise give away. The seat and the hunger are GM-eyes; what a player hears is that a figure
 *  has done the thing their arc was about, and that something is different because of it. PURE. */
export function finishNews(claim) {
  if (!claim) return null;
  const who = claim.name || claim.claimant;
  if (claim.act === "takes") {
    return `${who} has finished what they started. Something is fed that was not fed before, and the shape of things has changed to suit it.`;
  }
  if (claim.act === "presses") {
    return claim.holderStands
      ? `${who} has finished what they started — and found ${claim.holderName || "someone"} standing where they meant to arrive. Neither of them is going anywhere.`
      : `${who} has finished what they started, and it has bought them nothing. Whatever they reached for is not there to be had.`;
  }
  return null;
}

/** ⛔ AND THE ONE WRITER. A finish is written ONCE and never again: `seatsTaken[axis]` is the seat's whole history,
 *  and a claim already said is not said twice — a tick runs every pass, and news that repeats is news nobody reads.
 *
 *  ⚠️ THE PRESS IS RECORDED AS WHAT IT IS, and not as a crusade. Aevi's §1 says a pressing claimant makes the holder
 *  "a `crusade` foe from SNG-662, for free" — measured, that verb acts on POWERS through `foesOf` (`rivals[]` both
 *  ways), and NEITHER HOLDER LEADS A POWER: Neth and the Last Mercy are figures with no faction to be a foe of. Four
 *  of the five claimants do lead one, so the half of her clause that maps is the claimant's; the half that does not
 *  is the target's. ⛑ So the press is a figure-level standing target on the save, which the GM block reads — the
 *  same shape C18 used for the seats themselves — rather than a power-level war nobody ruled.
 *
 *  Returns the news to say, already filtered to what has not been said. MUTATES `character.worldState`. */
export function applySeatClaims(character, claims = [], { day = null } = {}) {
  if (!character || !Array.isArray(claims) || !claims.length) return [];
  const ws = character.worldState || (character.worldState = {});
  ws.seatsTaken = ws.seatsTaken && typeof ws.seatsTaken === "object" ? ws.seatsTaken : {};
  ws.seatPress = ws.seatPress && typeof ws.seatPress === "object" ? ws.seatPress : {};
  const said = new Set(Array.isArray(ws.seatsSaid) ? ws.seatsSaid : []);
  const out = [];
  for (const c of claims) {
    if (!c || !c.axis) continue;
    if (c.act === "takes" && !ws.seatsTaken[c.axis]) {
      ws.seatsTaken[c.axis] = { by: c.claimant, day, arcId: c.arcId || null, from: c.holder || null };
      // ⛑ AND THE PRESS ENDS WHERE THE SEAT IS TAKEN — they are not reaching for it any more.
      delete ws.seatPress[c.axis];
    } else if (c.act === "presses") {
      const cur = ws.seatPress[c.axis] || {};
      if (cur.by !== c.claimant || cur.target !== (c.holder || null)) {
        ws.seatPress[c.axis] = { by: c.claimant, target: c.holder || null, since: day, why: c.why };
      }
    }
    const key = `${c.axis}|${c.claimant}|${c.act}`;
    if ((c.act === "takes" || c.act === "presses") && !said.has(key)) {
      const line = finishNews(c);
      if (line) { out.push(line); said.add(key); }
    }
  }
  ws.seatsSaid = [...said].slice(-40);
  return out;
}
