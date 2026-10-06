// engine/opening.js — SNG-680. THE OPENING FILM, AS DATA AND ARITHMETIC.
//
// ✅ ERIK: *"We should have some sort of opening cinematic or equivalent. Something that tells the story of
// the Earth at the AI singularity event … and how you are one of many — pushing on and being pushed by …
// the Arcs of Exesa."*
//
// ⛔ EVERY WORD IS CONTENT. ✅ Aevi: *"Every string in `lines`, `after`, `title`, `begin`, `coda` and
// `controls` is player-facing (§29.7). DON'T INLINE ANY OF THEM IN CODE; read them from the file, so I can
// rewrite the film without a code change."* So this module reads her script and computes only two things a
// script cannot: how long a shot holds, and what the coda's four substitutions resolve to on this save.
//
// ⚠️ PURE. No DOM, no canvas, no fetch — which is what lets the pacing and the coda be gated without a
// browser, and it is the half of the film that can be wrong in a way nobody would see by watching once.

/* ⛔ THE REEL IS FLAT, BECAUSE A PLAYER MOVES THROUGH SHOTS AND NOT THROUGH MOVEMENTS. The movements are
 *  how the script is WRITTEN and how the progress track is DRAWN; they are not a second axis to step along.
 *  ⛑ Each shot carries its movement's id and name, so the progress track needs no second lookup and cannot
 *  disagree with the shot it is showing. */
export function openingReel(content) {
  const doc = content?.opening || null;
  if (!doc) return null;
  const shots = [];
  for (const mv of (doc.movements || [])) {
    for (const s of (mv.shots || [])) {
      if (!s?.id) continue;
      shots.push({ ...s, movement: mv.id || null, movementName: mv.name || null });
    }
  }
  return {
    shots,
    movements: (doc.movements || []).map((m) => ({ id: m.id, name: m.name, shots: (m.shots || []).length })),
    title: doc.title || null,
    begin: doc.begin || null,
    controls: doc.controls || {},
    pacing: doc.pacing || {},
    visuals: doc.visuals || {},
    coda: doc.coda || null,
  };
}

/* ⛔ HOW LONG A SHOT HOLDS. ✅ Aevi: *"A shot lasts `secondsBase` + words × `secondsPerWord` unless it names
 *  `seconds`."* ⛑ The words counted are the ones a player READS — `lines` and `after` — so a long line holds
 *  longer by arithmetic rather than by anyone tuning a list of numbers. The dials are hers, in `pacing`. */
export function shotSeconds(shot, pacing = {}) {
  if (shot && Number.isFinite(Number(shot.seconds))) return Math.max(0.2, Number(shot.seconds));
  const base = Number.isFinite(Number(pacing.secondsBase)) ? Number(pacing.secondsBase) : 1.6;
  const per = Number.isFinite(Number(pacing.secondsPerWord)) ? Number(pacing.secondsPerWord) : 0.28;
  const text = [...(shot?.lines || []), ...(shot?.after || [])].join(" ");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return Math.max(0.2, base + words * per);
}

/* ⛑ THERE IS NO `reelSeconds` HERE, AND THAT IS THE WIRING AUDIT'S RULE, NOT AN OVERSIGHT. A whole-film
 *  total is asked by a gate and by a report and by nothing in play, which makes it an export reachable only
 *  from a test — the exact shape of the eight built-and-unreached capabilities that ratchet exists for. It
 *  was also not a RULE: the rule is `shotSeconds`, and a sum over it is a sum. Both callers do their own.
 */

/* ═════ O3 · THE CODA'S THREE SUBSTITUTIONS ═════
 * ✅ AEVI: *"Take the nearest arc with a hinge, front or connection at or near that place, then fall back to
 * the nearest world-scale arc."* + *"Never the water by default."*
 *
 * ⛔ STEP ONE OF THAT LADDER HAS NO DATA, AND I MEASURED THE WHOLE SHAPE BEFORE SAYING SO. Across all ten
 * arcs there are 38 stages, and the fields they carry are exactly: `stage`, `name`, `publicFace`,
 * `pressureOnAdvance`, `effects`, `onceLineKnown`, `onceNamed`. There is no `fronts`, no `hingeNpcs`, no
 * `connections` — so "a hinge, front or connection at or near that place" cannot be asked of this content at
 * all, and 0 of the 38 stages mentions any of the 158 location ids. 0 of 10 arcs carries a `regions` list
 * either, and `arcReachesRegion` answers TRUE for every world and cosmic arc by its own rule (*"a world arc
 * is everywhere regardless"*), so "the NEAREST world-scale arc" has no derivation among the six of them.
 *
 * ⛑ SO THE LADDER IS HERS, WITH THE READERS IN PLACE FOR THE DAY THE DATA EXISTS: a stage that names this
 * place or its region → an arc scoped to this region → what the content prefers for the opening → the
 * world-scale arcs in authored order. ⚠️ That last rung is a declaration order acting as a priority rule,
 * which is a defect this project has logged by name — so it is REPORTED in the result as `arcBy` rather than
 * hidden. Her cut's sample (the Long Petition's Favours face, for Millbrook) is one authored line away:
 * `coda.arcPreference: ["arc_the_long_petition"]`. Until then the fallback lands on The Poles Pull, which is
 * the first world arc in the file — and never on the water, which is second, though only by that accident,
 * which is the other reason to author the preference.
 *
 * @param reaches (arc, regionId) => boolean — injected, so this module imports no arc logic
 */
export function codaArc(content, { startId = null, locations = {}, reaches = null } = {}) {
  const arcs = Array.isArray(content?.greaterArcs) ? content.greaterArcs.filter(Boolean) : [];
  if (!arcs.length) return null;
  const loc = startId ? locations[startId] : null;
  const regionId = loc ? (loc.regionId || loc.region || null) : null;
  const reach = typeof reaches === "function" ? reaches : () => true;
  const stageOf = (a) => {
    const n = Number(a.currentStage);
    const want = Number.isFinite(n) ? n : 1;
    return (a.stages || []).find((s) => Number(s.stage) === want) || (a.stages || [])[0] || null;
  };
  const faceOf = (a) => {
    const st = stageOf(a);
    // ⛔ ONLY `publicFace`. ✅ Aevi: *"never `onceLineKnown` or `onceNamed`: the character knows nothing yet."*
    const face = st?.publicFace;
    return face ? { arc: a, stage: st, face: String(face) } : null;
  };
  /* 1 · A STAGE THAT NAMES THIS PLACE OR ITS REGION — her "at or near that place", asked of the only thing
   * a stage could carry it in. ⛑ An id match on the stage's own strings, not a word match: `millbrook` is an
   * id, and `JSON.stringify` of the stage is where a `fronts` or `hingeNpcs` list would appear if one were
   * ever authored, so this rung starts working the day she writes one and costs nothing while she has not. */
  const names = (a, id) => {
    if (!id) return false;
    const needle = `"${id}"`;
    return (a.stages || []).some((s) => { try { return JSON.stringify(s).includes(needle); } catch { return false; } });
  };
  for (const a of arcs) { if (names(a, startId) || names(a, regionId)) { const f = faceOf(a); if (f) return { ...f, arcBy: "named by a stage" }; } }
  // 2 · an arc SCOPED to this region, through the engine's own reader
  const scoped = (a) => Array.isArray(a.regions) && a.regions.length > 0;
  for (const a of arcs.filter(scoped)) { if (reach(a, regionId)) { const f = faceOf(a); if (f) return { ...f, arcBy: "region" }; } }
  // 3 · what the content prefers for the opening, if it says
  const prefIds = [
    ...(Array.isArray(content?.opening?.coda?.arcPreference) ? content.opening.coda.arcPreference : []),
    ...arcs.filter((a) => a.openingPreference).map((a) => a.id),
  ];
  for (const id of prefIds) {
    const a = arcs.find((x) => x.id === id);
    const f = a ? faceOf(a) : null;
    if (f) return { ...f, arcBy: "authored preference" };
  }
  // 4 · the world-scale arcs in authored order, and the label SAYS that is all it is
  const world = arcs.filter((a) => String(a.scale || "").toLowerCase() === "world");
  for (const a of world) { const f = faceOf(a); if (f) return { ...f, arcBy: "authored order (nothing chose)" }; }
  for (const a of arcs) { const f = faceOf(a); if (f) return { ...f, arcBy: "authored order (nothing chose)" }; }
  return null;
}

/* ⛔ THE REGION LINE, AND THE CROSSING IS ITS OWN CASE. ✅ Aevi: *"use `regionLineAtCrossing` if the start is
 *  at the Crossing. Otherwise use `regionLine`, with the region's display name and `{days}`, the great-circle
 *  days from the Crossing."*
 *  ⚠️ "AT THE CROSSING" IS COLATITUDE 0, NOT THE ID. The hub is the south pole of this world, and places sit
 *  AT it that are not it — the gate yard at 0.037°, the Hundred Markets at 0.29°. A test on `=== "the_crossing"`
 *  would read the line wrong for a character who starts in the yard, which is a real start. Within a tenth
 *  of a degree is the same spot at this scale (a degree is about 26 miles).
 *  @param daysFrom (aId, bId) => number|null — injected, so the great-circle rule has ONE definition
 */
export function codaRegionLine(content, { startId = null, locations = {}, regions = [], daysFrom = null } = {}) {
  const coda = content?.opening?.coda || null;
  if (!coda) return null;
  const loc = startId ? locations[startId] : null;
  const colat = Number(loc?.worldPos?.colatitude);
  if (Number.isFinite(colat) && Math.abs(colat) <= 0.1) return String(coda.regionLineAtCrossing || "");
  const regionId = loc ? (loc.regionId || loc.region || null) : null;
  const rName = (Array.isArray(regions) ? regions : []).find((r) => r.regionId === regionId)?.name
    || String(regionId || "").replace(/_/g, " ");
  let days = null;
  try { days = typeof daysFrom === "function" ? daysFrom("the_crossing", startId) : null; } catch { days = null; }
  const d = Number.isFinite(Number(days)) ? Math.round(Number(days)) : null;
  return String(coda.regionLine || "")
    .replace(/\{region\}/g, rName)
    .replace(/\{days\}/g, d == null ? "" : String(d));
}

/** The coda's four shots with their substitutions made. Pure; the caller injects the two readers. */
export function codaShots(content, { startId = null, locations = {}, regions = [], daysFrom = null, reaches = null } = {}) {
  const coda = content?.opening?.coda || null;
  if (!coda) return [];
  const place = (startId && locations[startId]?.name) || String(startId || "");
  const regionLine = codaRegionLine(content, { startId, locations, regions, daysFrom }) || "";
  const arc = codaArc(content, { startId, locations, reaches });
  const fill = (s) => String(s)
    .replace(/\{place\}/g, place)
    .replace(/\{regionLine\}/g, regionLine)
    .replace(/\{arcFace\}/g, arc?.face || "");
  return (coda.shots || []).map((s) => ({
    ...s,
    lines: (s.lines || []).map(fill),
    ...(s.after ? { after: (s.after || []).map(fill) } : {}),
    // ⛑ the trace rides along, so a caller can say WHY this arc and not another
    ...(s.visual === "nearest_arc" && arc ? { arcId: arc.arc.id, arcBy: arc.arcBy, arcStage: arc.stage?.name || null } : {}),
  })).filter((s) => (s.lines || []).some((l) => String(l).trim()));
}

/* ⛔ WHETHER IT PLAYS AT ALL. ✅ Aevi (G3): *"A fresh profile autoplays it on its first new character. A
 *  second new character goes straight to the door, which offers `watchAgain`."*
 *  ⛑ A PROFILE FIELD, not a character one: the film is about the world, so a player watches it once and not
 *  once per character. ⚠️ And it answers false with no script, because a film with no words is not a film
 *  somebody skipped. */
export function shouldAutoplayOpening(profile, content) {
  if (!content?.opening) return false;
  if (!profile) return true;
  return !profile.seenOpening;
}
