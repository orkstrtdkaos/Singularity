// craftmechanics.js — SNG-263: what a craft actually DOES.
//
// Erik: "every function described needs a matching game mechanic that can be verified."
//
// The audit that produced this file, verified before a line was written: 285 crafts carry `functions` and
// NOT ONE carries a field for damage, healing, duration, range, area, targets or rank. Of 24 verbs, only
// `strike` and `break` did anything — so `heal` on 31 crafts healed nothing, `ward` on 23 warded nothing,
// `bind` on 55 bound nothing, and `reveal`, the largest family at 114 crafts, did nothing at all. Damage
// itself was keyed off the FUNCTION FAMILY, so every strike-craft in the game hit for the same number and a
// Tier-V capstone differed from a Tier-I basic by a flat per-tier term.
//
// That is the PromisedButUnread class at catalog scale: the content describes a capability and the engine
// delivers a generic default. This module is the body.
//
// THE RESOLUTION ORDER, which is the whole design:
//     craft.mechanic.<field>  ->  familyDefaults[<shape>].<field>  ->  the verb does not use that dimension
// so an UNAUTHORED craft still works (it inherits its family's numbers) and an AUTHORED one is genuinely its
// own. That ordering is what lets Aevi fill 285 crafts incrementally instead of in one pass, and it is why
// the CI check is a ratchet rather than a wall.
//
// Pure: no I/O, no globals, rng injected. Every number comes from content.

/** The family a verb belongs to, honouring the explicit overrides. Two verbs sit in a family by VOCABULARY
 *  but behave differently in play — `hinder` is HARM but impedes rather than wounds (the engine's
 *  harmFunctions really is strike+break only), and `empower` is RESTORE but grants a standing bonus rather
 *  than restoring health. Encoding that in content beats a comment nobody reads. */
export function shapeOfVerb(verb, cfg = {}) {
  const ov = cfg.verbOverrides?.[verb];
  if (ov) return { shape: ov.shape, operative: ov.operative, family: familyOfVerb(verb, cfg), overridden: true };
  const family = familyOfVerb(verb, cfg);
  const fam = family && cfg.families?.[family];
  return fam ? { shape: fam.shape, operative: fam.operative, family, overridden: false } : null;
}

export function familyOfVerb(verb, cfg = {}) {
  for (const [name, f] of Object.entries(cfg.families || {})) if ((f.verbs || []).includes(verb)) return name;
  return null;
}

/** Every verb the config can resolve — the set the CI check measures the catalog against. */
export function knownVerbs(cfg = {}) {
  const out = new Set();
  for (const f of Object.values(cfg.families || {})) for (const v of (f.verbs || [])) out.add(v);
  for (const v of Object.keys(cfg.verbOverrides || {})) out.add(v);
  return out;
}

const num = (v, fb) => (Number.isFinite(Number(v)) ? Number(v) : fb);

/** THE RESOLVED MECHANIC for one craft using one of its verbs, at a tier / rank / intensity.
 *
 *  Returns `{ verb, shape, operative, authored, fields, special }` where `fields` carries only the
 *  dimensions this shape actually uses — a reveal has no `damage` key at all, rather than a damage of zero,
 *  because "this verb does not use that dimension" and "this verb does nothing" must not look alike.
 *
 *  The tier ladder is Erik's (§8): T-II doubles the OPERATIVE dimension, T-III beats a straight
 *  doubling-again, T-IV/V are flagged `special` because at the capstone rung a craft is meant to gain a
 *  KIND of ability rather than a bigger number. Scaling only the operative dimension is deliberate: a craft
 *  doubles on its own axis, not on all of them, or a tier-V ward would also somehow reach further. */
export function mechanicFor(ability, { verb, tier, rank = 1, intensity = "standard", cfg = {} } = {}) {
  const v = verb || (ability?.functions || [])[0];
  if (!v) return null;
  const sh = shapeOfVerb(v, cfg);
  if (!sh) return null;

  const authoredAll = ability?.mechanic || null;
  const authored = authoredAll?.[v] || authoredAll || null;      // per-verb block, or one block for the craft
  const base = { ...(cfg.familyDefaults?.[sh.shape] || {}) };
  delete base.note;
  const fields = { ...base };
  for (const [k, val] of Object.entries(authored || {})) {
    if (k === "intensity" || k === "rankDeltas" || k === "special" || k === "note") continue;
    fields[k] = val;
  }

  const t = String(num(tier ?? ability?.levelReq, 1));
  const rung = cfg.tierLadder?.[t] || cfg.tierLadder?.["1"] || { mult: 1, special: false };
  const iCfg = (authored?.intensity?.[intensity]) || cfg.intensity?.[intensity] || { mult: 1 };
  // An authored per-rank delta wins. Otherwise the default DEEPENS, and it must COMPOUND with rank or
  // rank 2 and rank 3 resolve identically — which is the exact complaint (§3, Erik: "I can't tell how ranks
  // differ") reappearing inside the fix for it.
  const authoredDelta = authored?.rankDeltas?.[String(rank)];
  const steps = Math.max(0, num(rank, 1) - 1);
  const rDelta = authoredDelta
    || (steps > 0 && cfg.rankDeltas?.default
      ? { ...cfg.rankDeltas.default, mult: Math.pow(num(cfg.rankDeltas.default.mult, 1.35), steps) }
      : null);

  // The operative dimension carries tier, intensity and a DEEPEN rank-delta. Everything else stays put.
  // SNG-263 r4: a craft may declare its own OPERATIVE AXIS, redirecting tier scaling onto a dimension other
  // than its family's default — a strike that widens rather than deepens takes axis:"area", and its tier
  // steps buy targets instead of dice. "A craft doubles on ITS axis, not all axes" is Erik's rule; this is
  // where it becomes real. An axis the shape carries no field for is ignored (and the CI flags it).
  const declaredAxis = authored?.axis;
  const op = (declaredAxis && (fields[declaredAxis] != null || declaredAxis === "damage" || declaredAxis === "healing"))
    ? declaredAxis : sh.operative;
  const scale = num(rung.mult, 1) * num(iCfg.mult, 1)
    * (rDelta && rDelta.kind === "deepen" ? num(rDelta.mult, 1) : 1);

  const scaleField = k => { if (Number.isFinite(fields[k])) fields[k] = Math.max(1, Math.round(fields[k] * scale)); };
  if ((op === "damage" || op === "healing") && fields.dice) {
    // DICE, not a band. The die COUNT climbs with tier and `plus` supplies the non-linearity Erik asked for
    // at T-III ("exceed a straight doubling-again"), which integer dice alone cannot express. Intensity and a
    // deepen-rank scale the ROLLED TOTAL via `mult` rather than minting fractional dice — 1.5d6 is not a
    // thing a player can be shown, and the popup has to be able to say the craft's dice out loud.
    const dl = rung.dice || { nMult: 1, plus: 0 };
    fields.dice = { n: Math.max(1, Math.round(num(fields.dice.n, 1) * num(dl.nMult, 1))), d: num(fields.dice.d, 6) };
    fields.plus = Math.round(num(fields.plus, 0) + num(dl.plus, 0));
    const soft = num(iCfg.mult, 1) * (rDelta && rDelta.kind === "deepen" ? num(rDelta.mult, 1) : 1);
    if (soft !== 1) fields.mult = Math.round(soft * 100) / 100;
  } else if (op === "damage" || op === "healing") {
    if (fields.min != null) fields.min = Math.max(1, Math.round(num(fields.min, 1) * scale));
    if (fields.max != null) fields.max = Math.max(fields.min ?? 1, Math.round(num(fields.max, 1) * scale));
  } else scaleField(op);

  // EXTEND rank-deltas grow a named non-operative dimension instead — Erik's third legal kind.
  if (rDelta && rDelta.kind === "extend" && rDelta.dimension && Number.isFinite(fields[rDelta.dimension])) {
    fields[rDelta.dimension] = Math.max(1, Math.round(fields[rDelta.dimension] * num(rDelta.mult, 1.35)));
  }

  return {
    verb: v, shape: sh.shape, operative: op, family: sh.family,
    authored: !!authored,
    special: !!rung.special || !!authored?.special,
    rankDelta: rDelta ? { kind: rDelta.kind, ...(rDelta.dimension ? { dimension: rDelta.dimension } : {}) } : null,
    intensityNote: authored?.intensity?.[intensity]?.note || null,
    fields
  };
}

/** SNG-263 §7 — DAMAGE IS ROLLED. Erik: "damage should be rolled btw", anchored to "a T-I strike at max
 *  damage should be able to KILL a T-I beast — but likely take 2-3 hits due to random distribution."
 *
 *  A flat uniform roll over 1..5 averages 3, which kills a 5-health beast in under two hits — too fast for
 *  the brief. `weight` bends the draw toward the low end (2 = squared), putting the mean near 2.7: the MAX
 *  still one-shots, the AVERAGE lands in 2-3, and the spread is wide enough to feel. The shape is a content
 *  dial, not a constant in here, because the band and the bend are Erik's to tune.
 *
 *  `marginGap` raises the FLOOR rather than adding a bonus — a decisive exchange cannot roll feeble, but it
 *  can never exceed the craft's own maximum. That keeps the engine's existing "a turned-aside blow does
 *  nothing" intent while making the ceiling mean what the craft says it means. */
export function rollMagnitude(fields = {}, rng = Math.random, { marginGap = 0, marginFloorPer = null } = {}) {
  const perPoint = Number.isFinite(marginFloorPer) ? marginFloorPer : num(fields.marginFloorPer, 0.02);
  // SNG-263 r4: DICE are the craft's own shape. Rolling n independent dice gives a bell rather than the flat
  // line a uniform band gave — which is what makes a big hit feel like a big hit rather than a coin flip, and
  // it retires the `weight` fudge the band needed to sit where Erik wanted it.
  if (fields.dice) {
    const n = Math.max(1, num(fields.dice.n, 1)), faces = Math.max(2, num(fields.dice.d, 6));
    let total = 0;
    for (let i = 0; i < n; i++) total += 1 + Math.floor(rng() * faces);
    total += num(fields.plus, 0);
    // a decisive exchange raises the FLOOR without ever exceeding what the dice could have given
    const ceiling = n * faces + num(fields.plus, 0);
    total = Math.min(ceiling, total + Math.round(Math.max(0, marginGap) * perPoint));
    return Math.max(1, Math.round(total * num(fields.mult, 1)));
  }
  const min = Math.max(0, num(fields.min, 1));
  const max = Math.max(min, num(fields.max, min));
  const floor = Math.min(max, min + Math.round(Math.max(0, marginGap) * perPoint));
  const span = max - floor;
  if (span <= 0) return max;
  const w = Math.max(0.1, num(fields.weight, 2));
  return floor + Math.round(Math.pow(rng(), w) * span);
}

/** Does this craft describe anything the engine cannot do? The §5 completeness question, per craft.
 *  Returns the verbs with no resolvable shape — the "narration only" set the overhaul exists to empty. */
export function unmechanisedVerbs(ability, cfg = {}) {
  return (ability?.functions || []).filter(v => !shapeOfVerb(v, cfg));
}

/** Which dimensions a craft still inherits rather than declaring. Not a failure — the fallback is the
 *  design — but it is the number Aevi's authoring drives down, so the CI ratchet needs it. */
export function authoredCoverage(ability, cfg = {}) {
  const verbs = (ability?.functions || []).filter(v => shapeOfVerb(v, cfg));
  if (!verbs.length) return { verbs: 0, authored: 0 };
  const m = ability?.mechanic || null;
  const authored = verbs.filter(v => m && (m[v] || (!Object.keys(cfg.families || {}).length ? false : Object.keys(m).some(k => k !== "note")))).length;
  return { verbs: verbs.length, authored: m ? authored : 0 };
}
