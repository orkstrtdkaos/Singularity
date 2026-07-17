// functions.js — SNG-124: the FUNCTION FAMILIES as a first-class, legible axis over the skill system.
// SNG-092 authored `function_vocabulary.json` — 8 families, 24 verbs — and every ability carries a
// `functions: [verb…]` array, but nothing SURFACED which of the 8 a kit covers or lacks. This inverts
// the vocabulary (verb→family), measures a character's coverage, and recommends skills that fill the
// gaps / suit the build. Pure.
//
// NOTE (spec↔data reconciliation): the spec named the families HARM/RESTORE/CONTROL/MAKE/KNOW/HIDE/
// WARD/EMPOWER, but the AUTHORED data groups the same 24 verbs as HARM/RESTORE/PROTECT/KNOW/SHAPE/
// INFLUENCE/MOVE/SUSTAIN. The content is canon — this reads the real families so an ability's `functions`
// verbs always map correctly.

import { traditionOf } from "./traditions.js";

/** Invert `function_vocabulary.json` → { families:[names], verbToFamily:{verb:family}, byFamily:{family:[verbs]} }.
 *  Tolerant of the authored shape (families → array of {verb,…} OR array of verb strings). Pure. */
export function buildFunctionIndex(vocab = {}) {
  const fams = vocab?.families || {};
  const families = Object.keys(fams);
  const verbToFamily = {}, byFamily = {};
  for (const fam of families) {
    const list = Array.isArray(fams[fam]) ? fams[fam] : [];
    byFamily[fam] = list.map(v => (typeof v === "string" ? v : v?.verb)).filter(Boolean);
    for (const verb of byFamily[fam]) verbToFamily[verb] = fam;
  }
  return { families, verbToFamily, byFamily };
}

/** The family of a single verb (or null). */
export function familyOfVerb(verb, index) { return index?.verbToFamily?.[String(verb)] || null; }

/** The set of families an ability engages, from its `functions` verb array. Returns string[] (deduped). */
export function familiesOfAbility(ability, index) {
  const verbs = Array.isArray(ability?.functions) ? ability.functions : [];
  return [...new Set(verbs.map(v => familyOfVerb(v, index)).filter(Boolean))];
}

/** SNG-124: which of the 8 families a character's KIT covers vs lacks. Reads each owned ability's
 *  `functions` (resolved through the catalog). Returns { byFamily:{fam:count}, covered:[fam], missing:[fam] }. */
export function functionCoverage(character, catalog = {}, index) {
  const families = index?.families || [];
  const byFamily = Object.fromEntries(families.map(f => [f, 0]));
  for (const owned of character?.abilities || []) {
    const ab = catalog[owned.abilityId];
    for (const fam of familiesOfAbility(ab, index)) if (fam in byFamily) byFamily[fam]++;
  }
  const covered = families.filter(f => byFamily[f] > 0);
  const missing = families.filter(f => byFamily[f] === 0);
  return { byFamily, covered, missing };
}

// SNG-124: a light hint from a play-style tendency to the function family it leans toward — used only to
// nudge "suits how you play" recommendations; never a hard rule.
const TENDENCY_FAMILY = {
  strategic: "KNOW", cerebral: "KNOW", cautious: "PROTECT", physical: "HARM", risky: "HARM",
  ruthless: "HARM", social: "INFLUENCE", carousing: "INFLUENCE", generous: "RESTORE"
};

/** SNG-124: recommend 2–max learnable skills, scored on GAP (fills a missing family — highest value),
 *  CLASS (a primary-domain native by-right basic), STYLE (its family suits the player's top tendency),
 *  and ASPIRATION (ripe → ready + free). Pure over the supplied learnable RECORDS + signals.
 *  `opts`: { fnIndex, traditionIndex, primary, ripe:Set<id>, tendencies:{id:score}, effectiveCost:fn, max }. */
export function recommendSkills(character, learnable = [], opts = {}) {
  const { fnIndex, traditionIndex = null, primary = character?.domains?.primary || null, ripe = new Set(), tendencies = character?.tendencies || {}, effectiveCost = null, max = 4 } = opts;
  const coverage = functionCoverage(character, opts.catalog || {}, fnIndex);
  const missing = new Set(coverage.missing);
  const topTendencies = Object.entries(tendencies).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);
  const styleFamilies = new Set(topTendencies.map(t => TENDENCY_FAMILY[t]).filter(Boolean));

  const scored = learnable.filter(ab => ab && ab.id).map(ab => {
    const fams = familiesOfAbility(ab, fnIndex);
    const trad = traditionIndex ? traditionOf(ab, traditionIndex) : null;
    const isPrimaryNative = !!primary && trad === primary && ab.nativeOrCombination === "native";
    const fillsGap = fams.some(f => missing.has(f));
    const gapFamily = fams.find(f => missing.has(f)) || null;
    const suitsStyle = fams.some(f => styleFamilies.has(f));
    const isRipe = ripe.has(ab.id);
    let score = 0;
    if (isRipe) score += 4;         // practiced toward + free to learn
    if (fillsGap) score += 3;        // the highest-value axis (spec): a balanced kit
    if (isPrimaryNative) score += 2; // your people's by-right basics
    if (suitsStyle) score += 1;      // how you play
    const why = isRipe ? "ready to learn — you've practiced toward it"
      : fillsGap ? `fills your ${gapFamily} gap`
      : isPrimaryNative ? `your ${prettyTrad(trad)} by-right basic`
      : suitsStyle ? "suits how you play"
      : "a craft within your reach";
    return { abilityId: ab.id, name: ab.name || ab.id, families: fams, why, score, cost: effectiveCost ? effectiveCost(ab) : (ab.energyCost ?? null) };
  }).filter(s => s.score > 0);

  scored.sort((a, b) => b.score - a.score || (a.cost ?? 99) - (b.cost ?? 99));
  return scored.slice(0, Math.max(0, max));
}

function prettyTrad(t) { return String(t || "").replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }

// SNG-124: the 8-family display system — a stable color + glyph per family (added as CSS `.fn-fam-*`
// classes; this map is the single source the badges/wheel read). Function ≠ tradition, its own palette.
export const FUNCTION_FAMILIES = ["HARM", "RESTORE", "PROTECT", "KNOW", "SHAPE", "INFLUENCE", "MOVE", "SUSTAIN"];
export const FAMILY_GLYPH = { HARM: "⚔", RESTORE: "✚", PROTECT: "⛨", KNOW: "◉", SHAPE: "✦", INFLUENCE: "⛓", MOVE: "➤", SUSTAIN: "∞" };
// SNG-124 Phase B: the family colors as raw values (for SVG fills on the wheel — the CSS classes cover DOM).
export const FAMILY_COLOR = { HARM: "#e58a7a", RESTORE: "#8fc06e", PROTECT: "#e0b25a", KNOW: "#6fb0d8", SHAPE: "#d99a5a", INFLUENCE: "#b48fd0", MOVE: "#5fc0b6", SUSTAIN: "#9aa2ad" };
/** The CSS class suffix for a family (lower-case) — `.fn-fam-harm`, etc. */
export function familyClass(family) { return `fn-fam-${String(family || "").toLowerCase()}`; }
