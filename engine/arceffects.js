// engine/arceffects.js — SNG-273: a stage CHANGES THE WORLD, not a sentence.
//
// Erik: *"stage 2 of the Bleed is in effect, so what?"* Aevi's finding was that a stage carried only
// `publicFace` and `pressureOnAdvance`, both NARRATION — so the entire world-simulation chain, 66 figures and
// their attention and contests and casualties, resolved into a number that changed a sentence. This is the
// module that makes an advanced arc something a player FEELS.
//
// ⚠️ THE DESIGN RULE, RECORDED WITH THE CONTENT: a stage changes THE WORLD'S BEHAVIOUR, never taxes the
// player's sheet. A flat −1 to rolls is a punishment and reads as one. Grammar-work costing double in the
// Bleed is a WORLD — the player can route around it, pay it deliberately, or go somewhere else. Everything
// here is a property of a place or a craft or a road, never a debuff on a character.
//
// AND NOT EVERY STAGE IS DECAY. `what_wakes_beneath` LOWERS precursor craft cost — the lattice is loud and
// answers readily — and the storm lowers figurist and numinous cost. Some people want these arcs to advance.
// A model that only ever made things worse would make every arc a misery meter.
//
// Pure. Reads content + world state, returns numbers and lines. Writes nothing.

/** Every effect in force right now, tagged with the arc and stage it came from.
 *  `stageOf` is injected (worldtick owns `arcStageNow`) so this module stays free of the world-tick. */
export function activeArcEffects(content, character, stageOf) {
  const out = [];
  for (const arc of (content?.greaterArcs || [])) {
    let stage = null;
    try { stage = stageOf ? stageOf(arc.id) : (arc.currentStage ?? 1); } catch { stage = null; }
    if (stage == null) continue;
    const def = (arc.stages || []).find(s => s.stage === stage);
    for (const e of (def?.effects || [])) {
      out.push({ ...e, arcId: arc.id, arcName: arc.name, stage, stageName: def.name || `Stage ${stage}` });
    }
  }
  return out;
}

const CROSS = "__crossDomain__";

/** SNG-273 — WHAT THIS CRAFT COSTS RIGHT NOW, and WHY, in words the player can be told at the point of use.
 *
 *  Erik's requirement is the sharp one: *a player should never have to visit a tab to learn why something got
 *  harder.* So this returns the reason alongside the multiplier, and the caller prints it on the receipt.
 *
 *  `match.traditions` accepts `"*"`, a tradition id, or the sentinel `__crossDomain__` — which is why the
 *  poles-pull effect is thematically exact and mechanically tiny: the world pulling apart makes BORROWING
 *  FROM ANOTHER PEOPLE harder, and that is one flag the engine already computes. */
export function craftCostFactor(effects, { tradition = null, crossDomain = false } = {}) {
  let mult = 1;
  const reasons = [];
  for (const e of effects || []) {
    if (e.kind !== "craftCost") continue;
    const want = e.match?.traditions || ["*"];
    const hit = want.includes("*")
      || (want.includes(CROSS) && crossDomain)
      || (tradition && want.includes(tradition));
    if (!hit) continue;
    const m = Number(e.mult);
    if (!Number.isFinite(m) || m <= 0) continue;
    mult *= m;
    // The ARC is the reason a player can act on — "the Bleed", not "a craftCost effect".
    reasons.push({ arcName: e.arcName, stageName: e.stageName, mult: m, why: e.why || null, cheaper: m < 1 });
  }
  return { mult, reasons };
}

/** A short phrase for the roll receipt: "+4, the Bleed" / "−2, what wakes beneath". Returns null when the
 *  world is not touching this craft, so a quiet world adds nothing to the line. */
export function craftCostNote(baseCost, effects, ctx) {
  const { mult, reasons } = craftCostFactor(effects, ctx);
  if (mult === 1 || !reasons.length) return null;
  const adjusted = Math.max(1, Math.round(baseCost * mult));
  const delta = adjusted - baseCost;
  if (!delta) return null;
  const who = reasons.map(r => r.arcName).join(" + ");
  return { adjusted, delta, text: `${delta > 0 ? "+" : ""}${delta}, ${who}`, reasons };
}

/** Travel between places, same shape. */
export function travelCostFactor(effects) {
  let mult = 1; const reasons = [];
  for (const e of effects || []) {
    if (e.kind !== "travelCost") continue;
    const m = Number(e.mult);
    if (!Number.isFinite(m) || m <= 0) continue;
    mult *= m; reasons.push({ arcName: e.arcName, why: e.why || null });
  }
  return { mult, reasons };
}

/** Encounter pool bias: which tags the world is pushing toward, and how hard. */
export function encounterBias(effects) {
  const tags = new Map();
  for (const e of effects || []) {
    if (e.kind !== "encounterBias") continue;
    const w = Number(e.weight) || 1;
    for (const t of (e.add || [])) tags.set(t, Math.max(tags.get(t) || 1, w));
  }
  return tags;
}

/** How the world's people are carrying themselves. Prose for the GM's NPC block, not a number. */
export function npcMoodLines(effects, { tradition = null } = {}) {
  const lines = [];
  for (const e of effects || []) {
    if (e.kind !== "npcMood") continue;
    const want = e.traditions || ["*"];
    if (!want.includes("*") && !(tradition && want.includes(tradition))) continue;
    lines.push(`${e.shift}${e.why ? ` — ${e.why}` : ""} (${e.arcName}, ${e.stageName})`);
  }
  return lines;
}

/** ⚠️ WHICH KINDS CAN ACTUALLY LAND. Aevi's spec says all five have an existing consumer; four do.
 *  There is NO pricing path anywhere in the engine — no module computes a price — so `priceShift` has
 *  nothing to shift, and its 11 authored effects are inert. They are kept, surfaced in words on the World
 *  tab, and named here rather than quietly dropped: an effect that cannot land must be visible as such, or
 *  the next person to read the content will believe the world is doing something it is not. */
export const EFFECT_CONSUMERS = {
  craftCost: "resolution cost path (app.js energy cost)",
  travelCost: "travelTo cost",
  encounterBias: "random_encounters pool weighting",
  npcMood: "gm.js NPC block",
  priceShift: null,   // ← no consumer exists; see above
};

/** SNG-273 visibility — the World tab's plain-words list of what the world is currently doing to you.
 *  Aevi's requirement was "in plain words", so this deliberately does not print multipliers. */
export function effectsInPlainWords(effects) {
  const say = (e) => {
    if (e.kind === "craftCost") {
      const what = (e.match?.traditions || []).includes(CROSS) ? "borrowing another people's craft"
        : (e.match?.traditions || ["*"]).includes("*") ? "every craft"
        : `${(e.match?.traditions || []).join(", ")} craft`;
      return Number(e.mult) < 1 ? `${what} comes easier` : `${what} costs more`;
    }
    if (e.kind === "travelCost") return Number(e.mult) < 1 ? "the roads are quicker than usual" : "the roads cost more than usual";
    if (e.kind === "encounterBias") return `you are more likely to meet: ${(e.add || []).join(", ")}`;
    if (e.kind === "npcMood") return `people are ${e.shift}`;
    if (e.kind === "priceShift") return `${e.goods} are ${Number(e.demandDelta) < 0 ? "harder to sell" : "wanted"}`;
    return null;
  };
  return (effects || []).map(e => {
    const t = say(e);
    // ⚠️ AN EFFECT THAT CANNOT LAND IS MARKED, NOT HIDDEN. `priceShift` is authored and inert because no
    // module in this engine computes a price. Showing it silently alongside the live ones would tell a
    // reader the world is doing something it is not — which is the exact failure this whole section exists
    // to end. `inert` lets the surface say "authored, not yet felt".
    return t ? { arcName: e.arcName, stageName: e.stageName, text: t, why: e.why || null, kind: e.kind,
                 inert: !EFFECT_CONSUMERS[e.kind] } : null;
  }).filter(Boolean);
}
