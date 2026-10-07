// engine/films.js — SNG-680 + SNG-681. EVERY FILM IN THE GAME, AS DATA AND ARITHMETIC.
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
import { degBetween } from "./localdetail.mjs";   // the coda's nearest-place rung: one great-circle rule, not a second

export function filmReel(doc) {
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
    // ✅ SNG-681: a film carries its own name and its unlock; the opening carries neither and is not
    // listed, because ✅ *"it is there from the start"* is not a rule a film has to declare.
    id: doc.id || null,
    name: doc.name || null,
    unlock: doc.unlock || null,
  };
}

/** The opening and the nine, in one list — the only place that knows the opening is a film too. */
export function allFilms(content) {
  const out = [];
  if (content?.opening) out.push(content.opening);
  for (const f of (Array.isArray(content?.films) ? content.films : [])) if (f?.id) out.push(f);
  return out;
}

/* ═════ SNG-681 F3 · WHEN A FILM CAN BE WATCHED ═════
 * ✅ ERIK: *"a film appears when the character first meets that people."* ✅ AEVI: *"`unlock.always` … in the
 * Library from the start … `unlock.traditions`: the first time the character meets a person whose primary
 * tradition is in the list … `unlock.places`: the first time the character is at any listed place … Watched
 * or not, the films never gate anything."*
 * ⛑ PER CHARACTER, because they are about what THIS person has met — unlike `seenOpening`, which is about
 * the world and sits on the profile. The two are different questions and they live in different places.
 * ⚠️ AND AN UNLOCK IS A DAY, NOT A BOOLEAN: `filmsUnlocked[id] = worldDay` says when, so the Library can
 * sort by what is new and a news line can say "today" without a second record.
 */
export function filmUnlockedBy(film, character, { npcs = {} } = {}) {
  const un = film?.unlock || null;
  if (!un) return null;                                   // the opening: no rule to meet
  if (un.always) return { how: "always" };
  const met = character?.npcRegistry || {};
  for (const want of (un.traditions || [])) {
    for (const id of Object.keys(met)) {
      // ⛑ the SAVE's own record first, then the authored one: a grown person is met the same way, and the
      // registry entry is what the roster actually holds.
      const who = met[id] || null;
      const trad = who?.domains?.primary || npcs[id]?.domains?.primary || null;
      if (trad && trad === want) return { how: "met", tradition: want, who: id };
    }
  }
  const here = character?.currentLocationId || null;
  const been = character?.placeMemory || {};
  for (const want of (un.places || [])) {
    if (here === want || been[want]) return { how: "stood", place: want };
  }
  return null;
}

/** Record what is newly open. Returns the ids that opened THIS call, so a caller can offer them once. */
export function noteFilmUnlocks(character, content, { worldDay = null, npcs = null } = {}) {
  if (!character) return [];
  const people = npcs || content?.npcs || {};
  character.filmsUnlocked = character.filmsUnlocked && typeof character.filmsUnlocked === "object" ? character.filmsUnlocked : {};
  const opened = [];
  for (const film of allFilms(content)) {
    if (!film.unlock || character.filmsUnlocked[film.id] != null) continue;
    if (!filmUnlockedBy(film, character, { npcs: people })) continue;
    character.filmsUnlocked[film.id] = Number.isFinite(Number(worldDay)) ? Number(worldDay) : 0;
    opened.push(film.id);
  }
  return opened;
}

/** Every film this character may watch, newest unlock first — what the Library lists. */
export function filmsFor(character, content) {
  const out = [];
  for (const film of allFilms(content)) {
    const open = !film.unlock || character?.filmsUnlocked?.[film.id] != null
      || !!(film.unlock?.always);
    if (open) out.push({ id: film.id || "opening", name: film.name || null, film, since: character?.filmsUnlocked?.[film.id] ?? null });
  }
  return out;
}

/* ═════ SNG-681 F2 · THE NAME CARD'S SEAL ═════
 * ✅ AEVI: *"`speaker_istvane.title` is 'Speaker of the Hollow Court', and 'the Hollow Court' is an
 * `onceNamed` reveal in the Long Petition. The card must not show that title until the save knows the name.
 * Gate it the way arc stages gate `onceNamed`."*
 *
 * ⛔ SO THE SEAL IS COMPUTED FROM THE ARCS, NOT FROM A LIST OF NAMES. A proper name that appears in an arc's
 * SEALED layers (`onceNamed`, `onceLineKnown`) and in no `publicFace` anywhere is a name the public does not
 * have; a title containing one is withheld until that arc is named for this save.
 * ⚠️ AND I MEASURED IT AGAINST HER GROUND TRUTH BEFORE BUILDING IT, because the first rule I tried was
 * wrong in both directions. Content-word n-grams (the shape `content_ci` uses for restated secrets) sealed
 * TWO of the eighteen titles at a run of 2 — Istvane, and "Who Left No Shadow Standing" against the Glare's
 * lowercase "left no shadow" — and ZERO at a run of 3. Capitalised phrases seal exactly one: his. The three
 * sealed names in the whole corpus are the Hollow King, the Hollow Court and the Wild Half, all the Long
 * Petition's, which is what she said.
 * ⛑ Conservative where it is uncertain: the ONLY thing withheld is the title. The name is never withheld,
 * because the film names the person out loud and a card with no name is not a card.
 */
export function sealedNames(content) {
  const out = new Map();
  const pub = new Set();
  const namesIn = (text) => {
    const found = new Set();
    for (const m of String(text || "").matchAll(/(?<![.!?]\s|^)\b((?:[A-Z][a-z'’]+)(?:\s+(?:of|the|and)?\s*[A-Z][a-z'’]+)+)/g)) found.add(m[1].trim());
    return found;
  };
  for (const arc of (content?.greaterArcs || [])) for (const s of (arc?.stages || [])) {
    for (const n of namesIn(s?.publicFace)) pub.add(n);
  }
  for (const arc of (content?.greaterArcs || [])) for (const s of (arc?.stages || [])) {
    for (const key of ["onceNamed", "onceLineKnown"]) {
      for (const n of namesIn(s?.[key])) if (!pub.has(n) && !out.has(n)) out.set(n, arc.id);
    }
  }
  /* ══ ERIK'S RULING, 2026-10-06 (SNG-682): THE NAME IS PUBLIC; WHAT STANDS BEHIND IT IS NOT ══
   * ✅ AEVI: *"the names in the world guide and the player's guide are public … What stays sealed is what
   * stands behind a name, not the name. 'The Hollow King' is public. That he is the power the Long Petition
   * feeds is not. So the title seal should subtract every name a public record carries, along with its court,
   * from the sealed set. Istvane's 'Speaker of the Hollow Court' then shows."*
   * ⛑ "Along with its court" is the machine-readable half: a sealed phrase that shares a proper word with a
   * public record's own name belongs to that public thing — the Hollow Court is the Hollow King's. So the
   * subtraction is by shared proper word, with the handful of words that are not names of anything left out.
   * ⚠️ `onceNamed` still gates the arc's LINE. This only governs whether a NAME may be shown on a card; the
   * sentence that connects that name to the arc is sealed exactly as it was. */
  const COMMON = new Set(["The", "Of", "A", "An", "And", "Who", "Would", "Not", "Her", "His", "First", "Great", "Old", "Last"]);
  const publicWords = new Set();
  for (const n of Object.values(content?.npcs || {})) {
    if (String(n?.nameKnown || "") !== "world") continue;
    for (const field of [n.name, n.fullName, n.title, ...(Array.isArray(n.aliases) ? n.aliases : [])]) {
      for (const word of String(field || "").split(/[^A-Za-z'’]+/)) {
        if (word && /^[A-Z]/.test(word) && !COMMON.has(word)) publicWords.add(word);
      }
    }
  }
  for (const name of [...out.keys()]) {
    const words = name.split(/\s+/).filter((w) => /^[A-Z]/.test(w) && !COMMON.has(w));
    if (words.length && words.some((w) => publicWords.has(w))) out.delete(name);
  }
  return out;
}

/** The title a name card may show — or null, which is a card with a name and no title.
 *  @param arcNamed (arcId) => boolean — injected, so this module imports no sovereign logic */
export function cardTitle(npc, { content = null, arcNamed = null, sealed = null } = {}) {
  const title = npc?.title ? String(npc.title) : null;
  if (!title) return null;
  const map = sealed || sealedNames(content);
  for (const [name, arcId] of map) {
    if (!title.includes(name)) continue;
    const known = typeof arcNamed === "function" ? !!arcNamed(arcId) : false;
    if (!known) return null;
  }
  return title;
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

/* ═════ G · CONTINUITY: THE ONE ARCHITECTURAL CHANGE ═════
 * ✅ AEVI (frame by frame, G): *"Every shot is painted from nothing, from (visual, u). So at EVERY CUT these all
 * pop on or off at once: the net, the poles, the lights, the radius, the ground and the palette … a BASE of
 * continuous parameters; a target table V[visual] that lists only what that shot changes; every frame,
 * cur[k] += (target[k] − cur[k]) · (1 − 0.18^dt); every layer drawn whenever its weight is above 0.01, at that
 * weight. The net THINS through `swarm` instead of vanishing. The ring FADES through `lights_out`."*
 * ⛔ THE TABLE LIVES HERE, BESIDE `shotSeconds`, BECAUSE IT IS PURE AND A GATE CAN WALK IT: every visual token the
 * content writes has a row, or the painter would draw the bare globe in silence for it. Subjects (`place`,
 * `figure`, `traditions`, `source`, `arc`) stay on the shot; only AMOUNTS live here.
 * ⛑ `world` is the Earth→Exesa cross (0 Earth, 1 Exesa) and `shrunk` the old size → the small world; both are
 * positions in the reel rather than rows — `filmTargets` reads them off where the shot sits relative to the
 * `shrink` shot, so a rewrite that moves the shrink stays right. */
/* ✅ AEVI, THE 35 AGAIN (G2): `night` is HOW DEEP THE SHADOW IS — 1 is the sun's full terminator, 0 a world lit whole —
 * eased per shot, so an Earth shot keeps 30–60% of its colour on the dark side and the lights still read. `dark` is
 * what `night` used to mean: the lights-out darkening of the whole world (`lights_out`, `natural`, `standing_up`).
 * `cut` is the cutaway (G1), faded over the globe at the globe's own radius instead of cut to and back. */
export const FILM_BASE = Object.freeze({
  polar: 0, shrunk: 1, world: 1, outline: 0, lights: 0, night: 1, dark: 0, grey: 0, dim: 0, cut: 0,
  net: 0, runaway: 0, swarm: 0, order: 0, works: 0, drain: 0,
  poles: 0, pull: 0, middle: 0, natural: 0, standing: 0, lattice: 0, veil: 0, pause: 0,
  arcs: 0, many: 0, you: 0, title: 0,
});
export const FILM_TARGETS = Object.freeze({
  // ✅ G1 (the 35 again): the pops are ROWS — the net thins under the swarm (1 → 0.8), the pull and the grey carry
  // into `middle_closes`, the ring and the pull fade through `lights_out`, the cutaway is a weight, and the others
  // stay lit through `you` ("you are one of them"). ✅ G2: `night` per shot. ✅ G3: the outline is the shrink's.
  earth:           { lights: 1, night: 0.55 },
  network:         { lights: 1, net: 1 },
  network_runaway: { lights: 0.8, net: 1, runaway: 1, night: 0.7 },
  swarm:           { lights: 0.8, net: 1, swarm: 1 },
  swarm_ordered:   { lights: 0.8, net: 0.8, swarm: 1, order: 1 },
  workings:        { lights: 0.8, works: 1, night: 0.45 },
  drain:           { lights: 0.5, works: 1, drain: 1, grey: 1, night: 0.4 },
  bores:           { cut: 1 },
  shrink:          { outline: 1 },
  name_wears:      { outline: 0.6 },
  meaning_fades:   { works: 1, grey: 1 },
  poles_ignite:    { polar: 1, poles: 1 },
  poles_pull:      { polar: 1, poles: 1, pull: 1 },
  middle_closes:   { polar: 1, poles: 1, middle: 1, pull: 1.25, grey: 1 },
  lights_out:      { dark: 1, poles: 0.2, pull: 0.3 },
  bores_capped:    { cut: 1 },
  natural:         { dark: 1, natural: 1, night: 0.5 },
  standing_up:     { dark: 1, standing: 1 },
  lattice:         { dim: 1, lattice: 1 },
  veil:            { dim: 1, lattice: 1, veil: 1 },
  pause:           { dim: 1, lattice: 1, veil: 1, pause: 1 },
  arcs:            { arcs: 1 },
  many:            { arcs: 1, many: 1 },
  you:             { arcs: 1, many: 1, you: 1 },
  title:           { lights: 0.3, title: 1 },
  zoom_to_start:   { },
  nearest_arc:     { arcs: 1 },
  globe:           { },
  ring:            { polar: 1 },
  axis:            { polar: 1 },
  place:           { },
  region:          { },
  figure:          { },
  source:          { },
  arc:             { arcs: 1 },
});
/** The targets for one shot: the table's row over the base, with the world's size and palette read off the reel. */
export function filmTargets(visual, { index = 0, shrinkAt = -1 } = {}) {
  const row = FILM_TARGETS[String(visual || "")] || null;
  const t = { ...FILM_BASE, ...(row || {}) };
  const after = shrinkAt < 0 ? true : index >= shrinkAt;
  t.shrunk = after ? 1 : 0;
  t.world = after ? 1 : 0;
  return t;
}
/** One step of the easing: `cur` toward `target` over `dtSeconds`, Aevi's 0.18 — 82% of the gap closes in a
 *  second, 97% in two. Under reduced motion the frame IS the target. Pure; returns a new object. */
export function filmEase(cur, target, dtSeconds, { reduced = false, rate = 0.18 } = {}) {
  const k = reduced ? 1 : 1 - Math.pow(rate, Math.max(0, Math.min(1, Number(dtSeconds) || 0)));
  const out = {};
  for (const key of Object.keys(target)) {
    const a = Number(cur?.[key] ?? target[key]), b = Number(target[key]);
    const v = a + (b - a) * k;
    out[key] = Math.abs(b - v) < 0.004 ? b : v;
  }
  return out;
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
  /* 2b · ✅ AEVI (2026-10-06): *"the coda reads an arc's `places` nearest-first before preference."* An arc that
   * names a place a day's walk from the start is the story the player is about to walk into, and that beats
   * what the file prefers in the abstract. Three arcs carry `places` today (block_bleed, green_schism, the
   * widening); the rung costs nothing for the rest. The distance is the great circle in degrees, so the
   * label can say how far. */
  // ⛑ WITHIN THE REGION'S OWN FRAME (26°, the span the coda shows), or it is not "near": the first run of this rung
  // chose the Widening for a start 29° — 750 miles — from the nearest place it names, over the world arcs the
  // coda is for, which is what §G4 caught. A world arc stays the answer until a named place is actually close.
  const CODA_NEAR_DEG = 26;
  if (loc?.worldPos) {
    const from = [Number(loc.worldPos.colatitude) - 90, Number(loc.worldPos.longitude)];
    const near = arcs.map((a) => {
      let best = Infinity;
      for (const pid of (Array.isArray(a.places) ? a.places : [])) {
        const l = locations[pid];
        if (!l?.worldPos) continue;
        const d = degBetween(from, [Number(l.worldPos.colatitude) - 90, Number(l.worldPos.longitude)]);
        if (d < best) best = d;
      }
      return { a, d: best };
    }).filter((x) => Number.isFinite(x.d) && x.d <= CODA_NEAR_DEG).sort((x, y) => x.d - y.d);
    for (const { a, d } of near) { const f = faceOf(a); if (f) return { ...f, arcBy: `nearest named place (${Math.round(d)}° off)` }; }
  }
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
export function openingReel(content) { return filmReel(content?.opening || null); }

export function shouldAutoplayOpening(profile, content) {
  if (!content?.opening) return false;
  if (!profile) return true;
  return !profile.seenOpening;
}
