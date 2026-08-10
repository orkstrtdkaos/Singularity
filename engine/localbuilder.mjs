// engine/localbuilder.mjs — SNG-404 §2 step 2. THE PROSE STEP, AS A BUILDER AND NOT A REGEX.
//
// Aevi: "⛔ THE LOCATION'S OWN PROSE. Millbrook's seed says 'the village well and the river dock are the
// two centres of daily life.' That is a layout instruction that sat unread. ⚠️ A BUILDER STEP, NOT A
// REGEX — the water-word audit stands as the warning: a regex over prose finds words, not facts."
//
// ⛔ SO THIS MODULE DOES NOT READ PROSE. It assembles a question, hands it to the model, validates what
// comes back, and then throws the geometry away and re-derives it: the model proposes WHAT a place has
// and WHY, and `localdetail.placeSite` decides WHERE from the measured gradients. That split is the
// whole design — a model asked for bearings would invent them, and a model asked what a mill town
// contains is answering from the text in front of it.
//
// ⚠️ THE MEASURED FRAME GOES IN THE PROMPT AS FACTS, not as instructions. The model is told the river
// lies at 156° and 0.27° away, that the relief is 0.041, and where the roads run — so it can say "the
// dock needs water" rather than guess a compass point. Every number in the prompt is measured from the
// world, so a proposal can be checked against the ground it claims.

import { measureGradients, usableGradients, placeSite, SITE_BASES } from "./localdetail.mjs";

/** The one question, assembled from measured facts. Pure and inspectable — a prompt that cannot be
 *  read back is a prompt nobody can review. */
export function buildLayoutPrompt(loc, { gradients, tradition = null, maxSites = 8 } = {}) {
  const g = gradients || {};
  const usable = usableGradients(g);
  const lines = [];
  lines.push(`PLACE: ${loc.name || loc.id}`);
  if (loc.tier) lines.push(`TIER: ${loc.tier}`);
  lines.push(`ITS OWN TEXT: ${String(loc.descriptionSeed || "").slice(0, 900)}`);
  if (Array.isArray(loc.tags) && loc.tags.length) lines.push(`TAGS: ${loc.tags.join(", ")}`);
  if (tradition?.name) lines.push(`PEOPLE: ${tradition.name}${tradition.aesthetic ? ` — ${String(tradition.aesthetic).slice(0, 240)}` : ""}`);
  lines.push("");
  lines.push("WHAT THE WORLD MEASURES AROUND IT (facts, not suggestions):");
  lines.push(usable.river
    ? `- the nearest water lies ${usable.river.distanceDeg}° away, bearing ${usable.river.bearing}°`
    : `- NO usable water: the nearest is ${g.riverDistanceDeg == null ? "unknown" : g.riverDistanceDeg + "°"} away, too far to build on`);
  lines.push(usable.uphill
    ? `- the ground rises toward bearing ${usable.uphill.bearing}° (relief ${usable.uphill.relief})`
    : `- the ground is FLAT here (relief ${g.relief ?? "unknown"}) — there is no meaningful uphill`);
  lines.push(usable.roads.length
    ? `- roads leave toward: ${usable.roads.map((r) => `${r.to} (${r.bearing}°)`).join(", ")}`
    : "- no roads leave this place");
  lines.push("");
  lines.push(`Name up to ${maxSites} places INSIDE this settlement that its own text or its people imply.`);
  lines.push("For each, give the ONE thing that decides where it sits, as `basis`, from exactly this list:");
  lines.push(`  ${SITE_BASES.join(" · ")}`);
  lines.push("  centre = what the place is organised around · river = needs water · uphill = needs height or drainage");
  lines.push("  anti-uphill = wants the flat · road = opens onto a road · anti-road = wants to be away from them");
  lines.push("  between = sits on the walk between two others · tradition = its people's plan decides");
  lines.push("  prose = the text states where it is · inferred = you are reasoning from the trade, not the text");
  lines.push("");
  lines.push("⛔ RULES:");
  lines.push("- Do NOT give bearings or distances. Where it sits is computed from the measurements above.");
  lines.push("- If the ground cannot support a place, DO NOT NAME IT. A town with three well-reasoned places");
  lines.push("  beats a town with eight invented ones. Fewer is the correct answer when the ground is poor.");
  lines.push("- `why` must cite the text or the measurement it comes from. A place you cannot justify is decoration.");
  lines.push("");
  lines.push("⚠️ If a basis is `road`, you MUST say WHICH road with `toward`: one of the ids listed above.");
  lines.push("⚠️ If a basis is `between`, you MUST name the two with `betweenIds` — ids of sites you also return.");
  lines.push("  Measured on eight hand-authored layouts, these two are the only bases that cannot be placed");
  lines.push("  without a referent: everything else is decided by the ground alone.");
  lines.push("");
  lines.push('Return JSON: {"radiusMetres": <350-900>, "sites": [{"id","name","basis","why","toward"?,"betweenIds"?}]}');
  return lines.join("\n");
}

/** ⛔ THE MODEL PROPOSES; THE MEASUREMENTS PLACE. Everything geometric is re-derived here, so a
 *  hallucinated bearing cannot reach content — there is nowhere for it to enter. */
export function placeProposal(proposal, loc, gradients) {
  const usable = usableGradients(gradients);
  const radiusMetres = Math.max(150, Math.min(2000, Number(proposal?.radiusMetres) || 420));
  const out = [], dropped = [];
  const placedSoFar = [];
  let roadIdx = 0, figIdx = 0;
  for (const raw of (proposal?.sites || [])) {
    const basis = SITE_BASES.includes(raw?.basis) ? raw.basis : null;
    if (!basis) { dropped.push({ name: raw?.name || "(unnamed)", reason: `basis "${raw?.basis}" is not in the vocabulary` }); continue; }
    // resolve `betweenIds` against what this proposal has already placed, so "between" means between
    // two REAL sites of this settlement rather than whatever happened to be placed last
    const namedPair = Array.isArray(raw.betweenIds)
      ? raw.betweenIds.map((bid) => placedSoFar.find((q) => q.id === bid || q.name === bid))
        .filter(Boolean).map((q) => ({ bearing: q.localMap.bearing, metres: q.localMap.metres }))
      : null;
    const opts = { radiusMetres, index: basis === "road" ? roadIdx : figIdx,
      between: placedSoFar.slice(-2).map((p) => ({ bearing: p.localMap.bearing, metres: p.localMap.metres })),
      traditionFigure: proposal.traditionFigure || null };
    const at = placeSite({ basis, localMap: raw.localMap, why: raw.why, toward: raw.toward,
      betweenPlaced: namedPair && namedPair.length >= 2 ? namedPair : null }, usable, opts);
    if (!at) {
      // ⚠️ HER FOURTH BRANCH, ENFORCED: nothing licensed it, so it does not ship. This is the case that
      // keeps a dock out of a town with no river.
      dropped.push({ name: raw?.name || "(unnamed)", reason: `nothing on this ground answers "${basis}"` });
      continue;
    }
    if (basis === "road") roadIdx++; else figIdx++;
    const site = {
      id: raw.id || null, name: raw.name || raw.id || "(unnamed)", basis,
      localMap: { bearing: at.bearing, metres: at.metres, ...(at.level != null ? { level: at.level } : {}) },
      // ⛔ TWO REASONS, KEPT SEPARATE: what the model argued from the text, and what the geometry did.
      // Collapsing them would let a confident sentence stand in for a measurement.
      why: raw.why || null,
      placedBecause: at.why,
    };
    out.push(site); placedSoFar.push(site);
  }
  return { radiusMetres, sites: out, dropped };
}

/** The whole step for one settlement: measure, ask, place. `ask` is injected so the deterministic half
 *  is testable without a key and the model is never reached from a test. */
export async function detailSettlement(loc, { locations, hydrology, terrainFn, tradition, ask, maxSites = 8 } = {}) {
  const gradients = measureGradients(loc, { locations, hydrology, terrainFn });
  if (!gradients) return null;
  const prompt = buildLayoutPrompt(loc, { gradients, tradition, maxSites });
  if (typeof ask !== "function") return { gradients, prompt, proposal: null, result: null };
  const proposal = await ask(prompt);
  return { gradients, prompt, proposal, result: placeProposal(proposal, loc, gradients) };
}
