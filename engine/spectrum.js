// spectrum.js — ⛔ CCODE-436: THE TWELVE AXES, AND THE ONE DOOR INTO A CHARACTER'S FINGERPRINT.
//
// Aevi, SNG-633: "THE TWELVE IS A GEOMETRY, NOT A COUNT. world_node_atlas.axisOrder is twelve ordered slots and axisVector is derived
// from them on every location." A thirteenth key on a character's `alignment` is not an axis — it is an inert number that every
// reader still reads: the roll's self-fit is a cosine over the UNION of both maps' keys, so a phantom axis dilutes every roll and
// decides one whose action carries only the phantom; and the GM is shown the whole fingerprint each beat, which teaches it the
// phantom is real.
//
// ⚑ MEASURED 2026-09-19: 13 of 16 saves carried `alignment.spectrumId` — the GM schema's placeholder (`"axes": {"spectrumId": 0.4}`),
// returned literally on its choices and drifted into by every one the player took — and three more carried `spectrum` and `value`.
// The intent parser had refused the key since CCODE-433; the choices, a minted craft and a gambit's steps never asked.

/** ⛔ THE PLACEHOLDER-SHAPED KEYS THE MODEL HAS WRITTEN AS IF THEY WERE AXES — never an axis id, whatever list is in force. */
export const PLACEHOLDER_AXES = ["spectrumId", "spectrum", "value"];

/** The legal axis ids, from the content's own list. [] when there is none (a context with no content), and then only the
 *  placeholders are refused. Pure. */
export function spectrumIdsOf(content) {
  const list = content?.spectrums?.spectrums;
  return Array.isArray(list) ? list.map(s => s && s.id).filter(Boolean).map(String) : [];
}

/** ⛔ CLEAN A MAP OF AXES. A key must be a spectrum id (when the list is known) and never a placeholder; a value must be a NUMBER —
 *  `typeof`, not `Number()`, because Number(null) is 0 and Number(true) is 1, and an absent value is not a zero. Clamped to −1..1,
 *  at most `max` of them. → { axes, dropped: [{ key, value, why }] } — a drop is returned so the caller can make it audible. Pure. */
export function cleanAxes(raw, ids = [], { max = 6 } = {}) {
  const axes = {}, dropped = [];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { axes, dropped };
  const legal = new Set((ids || []).map(String));
  for (const [k, v] of Object.entries(raw).slice(0, Math.max(0, max))) {
    const key = String(k);
    const n = typeof v === "number" ? v : (typeof v === "string" && v.trim() !== "" ? Number(v) : NaN);
    if (!Number.isFinite(n)) { dropped.push({ key, value: String(v).slice(0, 40), why: "not a number" }); continue; }
    if (PLACEHOLDER_AXES.includes(key) || (legal.size && !legal.has(key))) { dropped.push({ key, value: n, why: "not a spectrum id" }); continue; }
    axes[key] = Math.max(-1, Math.min(1, n));
  }
  return { axes, dropped };
}

/** ⛔ THE ONE DOOR INTO A CHARACTER'S FINGERPRINT. Two writers drift it: what the character DID pulls it `weight` of the way toward
 *  the action's axes (`mode: "toward"`), and a precursor craft's peril moves it a fixed `step` along the sign of each of the craft's
 *  axes (`mode: "peril"`). Both wrote any key they were handed. Only a clean axis is written now. Mutates; → the axes written. */
export function driftAlignment(character, raw, { ids = [], mode = "toward", weight = 0.05, step = 0.05 } = {}) {
  if (!character) return {};
  const { axes } = cleanAxes(raw, ids, { max: 12 });
  const al = character.alignment && typeof character.alignment === "object" ? character.alignment : (character.alignment = {});
  const wrote = {};
  for (const [ax, v] of Object.entries(axes)) {
    const cur = typeof al[ax] === "number" && Number.isFinite(al[ax]) ? al[ax] : 0;
    const next = mode === "peril" ? cur + Math.sign(v) * step : cur * (1 - weight) + v * weight;
    wrote[ax] = al[ax] = Math.max(-1, Math.min(1, next));
  }
  return wrote;
}

/** ⛔ A FINGERPRINT OFF THE ATLAS IS SET ASIDE, NEVER ERASED — Aevi's SNG-633 rule for content ("every value is preserved in a
 *  _retiredAxes note so nothing is lost if they are ever made real"), kept for a character: a key that is not one of the twelve moves
 *  to `_retiredAxes`, value and all. With no list in force, only the placeholders move. Mutates; → the keys moved. */
export function retireOffAtlasAxes(character, ids = []) {
  const al = character?.alignment;
  if (!al || typeof al !== "object") return [];
  const legal = new Set((ids || []).map(String));
  const moved = [];
  for (const k of Object.keys(al)) {
    if (!PLACEHOLDER_AXES.includes(k) && (!legal.size || legal.has(k))) continue;
    character._retiredAxes = { ...(character._retiredAxes || {}), [k]: al[k] };
    delete al[k];
    moved.push(k);
  }
  return moved;
}
