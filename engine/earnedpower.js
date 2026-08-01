// earnedpower.js — SNG-251 §2c + §4: THE EARNED-POWER ECONOMY.
//
// Erik bound rune-threads into a spear in-fiction and the spear never changed. The deepest reason was not
// that the GM forgot the op (SNG-251 §1.1) — it is that `itemUpdates` was FORBIDDEN to grant power at all
// (gm.js:88, "it does NOT grant new power"). So the one thing that would have made his evolution "explicit
// about what that translates to in game mechanics" was the thing the tool was denied. Real story-generated
// power had nowhere to be recorded.
//
// §2c replaces the blanket ban with a rule: **no UNEARNED power; earned power is explicit, and clamped.**
// This module is the clamp. It answers three questions and nothing else:
//   1. HOW MUCH may this character's item hold?      → grantCeiling(character, craftRank)
//   2. MAY it evolve right now?                      → evolutionBudget(character, worldDay)
//   3. IS this proposed grant within bounds?         → sanitizeGrant(raw, ceiling)
//
// Erik's §4 ruling shapes all three, and the shape is his, not mine:
//   • "Power scales to the player's level + craft/skill… the clamp ceiling is a FUNCTION of level + the
//     relevant craft/ability rank, not a flat cap." — so evolution is a PAYOFF for building crafting and
//     skills, which is the point: a master smith's binding should outrun a novice's.
//   • "Always available, but RATE-LIMITED: ~1 evolution attempt per day, capped by level/ability." — so it
//     cannot be farmed. No ten-runes-in-an-afternoon.
//
// PURE: no imports, no I/O, no CONTENT. Everything is passed in, so the economy is headless-testable and
// the same numbers govern the GM's path and the player's own "evolve this item" action — one economy, not
// two (the CCODE-16 shared-applier lesson).
//
// What this module deliberately does NOT do: judge whether the FICTION earned it. That is a reading of the
// story, not a computation — the concreteness cite is carried on the op and shown to the player, and Aevi
// owns the prompt guidance for when the GM may award one. The engine bounds the size; the fiction earns it.

import { smartClamp } from "./namematch.js";   // SNG-152: prose is clamped on a word boundary, never mid-word

/** A grant is a MECHANICAL SHEET ENTRY, not a number: what it is, where it came from, what it does, and —
 *  load-bearing — what it explicitly cannot do. Aevi's Memory worked example is the reference shape, and
 *  `clamp` is the field that keeps "explicit" from becoming "unbounded": every grant states its own limit
 *  ("a read, not a strike"; "holds ONE read"; "never an instakill"). */
const GRANT_FIELDS = ["id", "name", "from", "effect", "band", "clamp"];

/** Hard structural ceilings — the backstop under the scaled ones below, so a malformed level or rank can
 *  never open the gate wider than the game's own limits. */
const MAX_GRANTS_EVER = 6;
const MAX_DERIVED_PER_ITEM = 2;

/** How much earned power may this item hold, for THIS character?
 *
 *  `level` is who you are; `craftRank` is what you've actually built in the relevant craft (the ability
 *  rank behind the binding). Both count, per Erik's ruling — a high level with no craft, or a deep craft at
 *  low level, each earns less than the two together.
 *
 *  Returns { maxGrants, effectCap, band } — `band` is the human phrase the item and the GM both quote, so
 *  the player can see the ceiling they are working against rather than discovering it by being refused. */
export function grantCeiling(character = {}, craftRank = 0) {
  const level = Math.max(1, Number(character?.level) || 1);
  const rank = Math.max(0, Math.min(3, Number(craftRank) || 0));
  // 1 base + 1 per full 10 levels + 1 per craft rank above the first. Silas at L29 with a rank-3 craft
  // reaches 5, and Memory's authored worked example carries 4 — the reference fits with room, which is the
  // check that matters: the economy must not retroactively make Aevi's own exemplar illegal.
  const maxGrants = Math.min(MAX_GRANTS_EVER, 1 + Math.floor(level / 10) + Math.max(0, rank - 1));
  // The one numeric lever a grant can move (clampEffects bounds it again at write time; this is the
  // per-character ceiling UNDER that hard bound, so a low-level character cannot reach the global cap).
  const effectCap = Math.max(2, Math.min(15, Math.round(level / 3) + rank * 2));
  return { maxGrants, effectCap, band: `reasonable @ L${level}${rank ? ` / craft rank ${rank}` : ""}`, level, rank };
}

/** May this item evolve right now? Erik: "~1 evolution attempt per day, capped by level/ability."
 *
 *  Counted PER ITEM per absolute world-day — evolving the spear does not use up the day for the sword,
 *  because the rate limit exists to stop one item being farmed, not to make the player choose which of
 *  their possessions is allowed to have a story today.
 *
 *  Returns { canEvolve, used, cap, nextDay, why }. */
export function evolutionBudget(item = {}, worldDay = null, character = {}) {
  const level = Math.max(1, Number(character?.level) || 1);
  const cap = level >= 30 ? 2 : 1;                       // "~1/day, capped by level" — a second at L30+
  const log = item?._evo?.byDay || {};
  const day = worldDay == null ? null : String(worldDay);
  const used = day == null ? 0 : (Number(log[day]) || 0);
  const canEvolve = day == null ? true : used < cap;     // an unknown day never blocks (never fail closed on a missing clock)
  return {
    canEvolve, used, cap, day,
    why: canEvolve ? null : `${item.customName || item.name || "this item"} has already taken on what it can hold today — an evolution is a deliberate act, about ${cap === 1 ? "once" : `${cap} times`} a day. It will take more tomorrow.`
  };
}

/** Stamp an evolution against the daily budget. Mutates `item._evo`; returns the updated budget. */
export function recordEvolution(item, worldDay = null) {
  if (!item || worldDay == null) return null;
  if (!item._evo || typeof item._evo !== "object") item._evo = {};
  if (!item._evo.byDay || typeof item._evo.byDay !== "object") item._evo.byDay = {};
  const day = String(worldDay);
  item._evo.byDay[day] = (Number(item._evo.byDay[day]) || 0) + 1;
  item._evo.lastDay = worldDay;
  // keep the ledger small — only the recent days matter for a per-day cap
  const days = Object.keys(item._evo.byDay).sort((a, b) => Number(a) - Number(b));
  if (days.length > 8) for (const d of days.slice(0, days.length - 8)) delete item._evo.byDay[d];
  return item._evo;
}

/** Clamp ONE proposed grant into a safe, explicit sheet entry, or null if it isn't one.
 *
 *  A grant with no `effect` is rejected outright: a named power that does not say what it does is exactly
 *  the hollow-flavour SNG-250 §3 bans, and it would put an unreadable line on the player's item sheet.
 *  A grant with no `clamp` gets the ceiling's own band as its stated bound rather than being dropped —
 *  better an explicit default limit than a power with no stated limit at all. */
export function sanitizeGrant(raw, ceiling = null) {
  if (!raw || typeof raw !== "object") return null;
  const name = String(raw.name || "").trim();
  const effect = String(raw.effect || "").trim();
  if (!name || !effect) return null;
  const slug = String(raw.id || name).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "").slice(0, 40);
  const out = {
    id: slug || "grant",
    name: name.slice(0, 60),                                    // prose-cap-ok: a label, not prose
    from: String(raw.from || "").slice(0, 120),                  // prose-cap-ok: a provenance label ("deathsense — rank 3")
    effect: smartClamp(effect, 400),                             // SNG-152: real prose, clamped on a boundary
    band: String(raw.band || ceiling?.band || "").slice(0, 80),  // prose-cap-ok: a generated band label
    clamp: smartClamp(raw.clamp ? String(raw.clamp) : (ceiling?.band ? `bounded to what is reasonable at ${ceiling.band}` : "bounded"), 200)
  };
  for (const k of Object.keys(out)) if (!GRANT_FIELDS.includes(k)) delete out[k];
  return out;
}

/** Fold a set of proposed grants onto an item's existing sheet, under the ceiling.
 *
 *  Same-id grants REPLACE (a rune-thread deepening is the same thread, not a second one) — which is also
 *  what stops a repeated evolution beat from stacking duplicates. New grants append until the ceiling is
 *  reached, and the ones that don't fit are RETURNED rather than silently dropped, so the caller can tell
 *  the player their item is full instead of leaving them wondering why the binding didn't take.
 *
 *  Returns { grants, added, replaced, refused }. Pure — does not mutate the item. */
export function foldGrants(existing = [], proposed = [], ceiling = null) {
  const cap = Math.max(0, Number(ceiling?.maxGrants) || 0);
  const grants = Array.isArray(existing) ? existing.map(g => ({ ...g })) : [];
  const added = [], replaced = [], refused = [];
  for (const raw of (Array.isArray(proposed) ? proposed : [proposed])) {
    const g = sanitizeGrant(raw, ceiling);
    if (!g) continue;
    const at = grants.findIndex(x => x.id === g.id);
    if (at >= 0) { grants[at] = g; replaced.push(g); continue; }   // deepening an existing thread
    if (grants.length >= cap) { refused.push(g); continue; }       // the item is full for this character
    grants.push(g); added.push(g);
  }
  return { grants, added, replaced, refused };
}

/** The one-line mechanical sheet the item shows and the GM quotes — Erik's "explicit about what that
 *  translates to in game mechanics", literally on the item. */
export function grantSummary(item = {}) {
  const gs = Array.isArray(item?.grants) ? item.grants : [];
  if (!gs.length) return "";
  return `grants: ${gs.map(g => g.name).join(" · ")}`;
}

/** May this item spawn another derived child? Derived items are real items with their own sheet, so they
 *  are bounded too — a split is a story beat, not a duplication engine. */
export function canDerive(item = {}) {
  const kids = Array.isArray(item?.derived) ? item.derived.length : 0;
  return { ok: kids < MAX_DERIVED_PER_ITEM, kids, cap: MAX_DERIVED_PER_ITEM };
}
