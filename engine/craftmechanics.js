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

/** CCODE-81 — INTENSITY CAN BE REFUSED BY RANK, not only by craft (Aevi, `draw_down`).
 *
 *  REFUSED has been a VALUE since the_last_light ("cannot be half-given"), but the test for it was
 *  `/^refused$/i` on the whole trimmed string — so it matched the bare word and NOTHING ELSE. Aevi authored
 *  `surge: "REFUSED at r3 — 'there is no partial version of this rank'"`, which is unmistakably a refusal and
 *  did not match, so `draw_down` surged freely at exactly the rank its own text forbids. The marker was there;
 *  the reader was too narrow.
 *
 *  `draw_down` is also the first craft where intensity availability changes BY RANK rather than being a
 *  property of the whole craft — it conserves and surges normally at r1/r2. So refusal is now rank-aware:
 *
 *   · `{ refused: true }` or `"REFUSED"`            — the whole craft refuses it, at every rank (unchanged);
 *   · `{ refusedFromRank: 3, note }` or `"REFUSED at r3 — ..."` — refused at that rank AND ABOVE.
 *
 *  The string form is read as a MARKER, not as prose: it must START with REFUSED, and the rank is taken only
 *  from an `at r3` / `at rank 3` immediately after it. That is deliberately not prose-mining — extending a
 *  value the engine already treats as structural is a different thing from inferring meaning from a sentence,
 *  and the staged checker reports every string it reads this way so an author can see what it concluded.
 *
 *  "AND ABOVE" is the reading of a max-rank craft's refusal; if Aevi means a rank to refuse in isolation,
 *  that is `refusedAtRanks: [3]` and this is where it would go. */
export function refusalOf(authoredIntensity, rank = 1) {
  if (authoredIntensity && typeof authoredIntensity === "object") {
    const from = num(authoredIntensity.refusedFromRank, null);
    if (from != null) return { refused: num(rank, 1) >= from, fromRank: from, marker: "refusedFromRank" };
    return { refused: !!authoredIntensity.refused, marker: authoredIntensity.refused ? "refused" : null };
  }
  if (typeof authoredIntensity !== "string") return { refused: false, marker: null };
  const s = authoredIntensity.trim();
  if (!/^refused\b/i.test(s)) return { refused: false, marker: null };
  const m = s.slice(0, 24).match(/\bat\s+r(?:ank)?\s*(\d+)/i);
  if (!m) return { refused: true, marker: "REFUSED" };
  const from = Number(m[1]);
  return { refused: num(rank, 1) >= from, fromRank: from, marker: `REFUSED at r${from}` };
}

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

  // A tier past the authored ladder must clamp to the TOP rung, never fall back to tier 1. The old
  // `|| tierLadder["1"]` did exactly that, so a T-VI craft — which generation, a braid, or simply authoring
  // beyond the current ladder can mint — resolved to 1d6 and was WEAKER THAN A TIER-I. Found by the edge-case
  // battery on its first run, which is the argument for having one.
  const rungs = Object.keys(cfg.tierLadder || {}).filter(k => /^\d+$/.test(k)).map(Number).sort((a, b) => a - b);
  const want = num(tier ?? ability?.levelReq, 1);
  const t = String(rungs.length ? Math.min(Math.max(want, rungs[0]), rungs[rungs.length - 1]) : want);
  const rung = cfg.tierLadder?.[t] || { mult: 1, special: false };
  // REFUSED is a VALUE, not an omission (Aevi's the_last_light "cannot be half-given"). A blanket x0.5/x2
  // would invent a conserved capstone the fiction forbids, so a refusal is carried through to the caller and
  // never silently replaced by the baseline.
  const authoredIntensity = authored?.intensity?.[intensity];
  const refusal = refusalOf(authoredIntensity, rank);
  const refused = refusal.refused;
  const iCfg = refused ? { mult: 1 }
    : ((authoredIntensity && typeof authoredIntensity === "object") ? authoredIntensity : null)
      || cfg.intensity?.[intensity] || { mult: 1 };
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
  // SNG-263 r4: a craft declares its own OPERATIVE AXES, redirecting tier scaling off its family's default —
  // "a craft doubles on ITS axis, not all axes" is Erik's rule and this is where it becomes real.
  //
  // Aevi's blazeborn pilot corrected the shape twice over: `axis` is an ARRAY (a craft has several), and the
  // vocabulary is OPEN — her 12 crafts named 18 axes, ten of which I had never imagined (perceptionDepth,
  // upkeepRelief, bindStrength, witnesses…), and only 4 of 12 carried damage at all. So: take the first axis
  // that is both declared AND in the MECHANICAL subset the engine can compute. Everything else is a NAMED
  // axis — real, authored, shown to the player, scaled in the craft's own prose rather than by arithmetic.
  // There is no number the engine could meaningfully apply to "perceptionDepth", and pretending otherwise
  // would be the same lie as a heal that healed nothing.
  // A guard craft may author `magnitude` or `soak` — Aevi's resonant_shield authors both. Mirror whichever
  // is missing so a ward resolves the same either way; the catalog's field naming should never decide
  // whether a ward works, and the earlier staged traditions predate the ranked-guard shape.
  if (sh.shape === "guard") {
    if (fields.soak == null && Number.isFinite(fields.magnitude)) fields.soak = fields.magnitude;
    if (fields.magnitude == null && Number.isFinite(fields.soak)) fields.magnitude = fields.soak;
  }
  const mechAxes = new Set(cfg.operativeAxis?.mechanical || []);
  const declaredAxes = Array.isArray(authored?.axis) ? authored.axis : (authored?.axis ? [authored.axis] : []);
  const declaredAxis = declaredAxes.find(a => mechAxes.has(a) && (fields[a] != null || a === "damage" || a === "healing"));
  const op = (declaredAxis && (fields[declaredAxis] != null || declaredAxis === "damage" || declaredAxis === "healing"))
    ? declaredAxis : sh.operative;
  const scale = num(rung.mult, 1) * num(iCfg.mult, 1)
    * (rDelta && rDelta.kind === "deepen" ? num(rDelta.mult, 1) : 1);

  const scaleField = k => { if (Number.isFinite(fields[k])) fields[k] = Math.max(1, Math.round(fields[k] * scale)); };
  // Does the dice block come from the CRAFT or from the family default? That decides whether the tier
  // ladder applies. Aevi's radiant pass settled it: she authored `2d6` on a T-II craft, noting "T-II = 2d6
  // per the locked tierLadder" — i.e. the FINAL dice for that tier. The engine multiplied AGAIN, and every
  // authored damage craft came out double to triple its intent (2d6 -> 4d6, 3d4+3 -> 9d4+6).
  // Her reading is the right one and it matches the whole resolution order: AUTHORED WINS. The ladder is
  // there to give an UNAUTHORED craft tier-appropriate dice; applying it on top of a number an author has
  // already tiered is double-counting, and it silently doubles a whole tradition.
  const diceAuthored = !!authored?.dice;
  if ((op === "damage" || op === "healing") && fields.dice) {
    // DICE, not a band. The die COUNT climbs with tier and `plus` supplies the non-linearity Erik asked for
    // at T-III ("exceed a straight doubling-again"), which integer dice alone cannot express. Intensity and a
    // deepen-rank scale the ROLLED TOTAL via `mult` rather than minting fractional dice — 1.5d6 is not a
    // thing a player can be shown, and the popup has to be able to say the craft's dice out loud.
    const dl = diceAuthored ? { nMult: 1, plus: 0 } : (rung.dice || { nMult: 1, plus: 0 });
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
    refusedIntensity: refused,
    ...(refusal.fromRank ? { refusedFromRank: refusal.fromRank } : {}),
    ...(refusal.marker ? { refusalMarker: refusal.marker } : {}),
    // the craft's OWN words for this intensity — what §4's popup must show before the player commits
    intensityNote: (typeof authoredIntensity === "string" ? authoredIntensity : authoredIntensity?.note) || null,
    // declared, real, and NOT arithmetic the engine performs — the popup names them, the engine doesn't fake them
    namedAxes: declaredAxes.filter(a => !mechAxes.has(a)),
    fields
  };
}

/** CCODE-77 / Aevi's churnfolk finding — VARIANCE IS A WIDER BAND, NOT A BIGGER NUMBER.
 *
 *  Her words, authoring tradition 5: "churnfolk crafts want a WIDENED OUTCOME BAND, not a bigger number — you
 *  don't choose HOW it breaks, only that it does" · "generous and strong, but NEVER EXACTLY AS AIMED". She
 *  authored `variance` 3-8 across the roster and reported the engine had no concept of it. Measured, true —
 *  and worse than she said: outside damage and healing NOTHING is rolled at all, so `the_long_odds` (variance
 *  8, "a cascade of lucky breaks no one could plan") delivered exactly the same number every single cast. The
 *  craft whose identity is unreliability was the most deterministic thing in the catalog.
 *
 *  The transform is deliberately MEAN-PRESERVING, because that is precisely what she asked for: stretch the
 *  outcome away from its own mean, so the max goes up, the min goes down, and the average does not move. A
 *  chaotic craft must be a GAMBLE, not a buff — otherwise "wild" quietly becomes "strong", which is the exact
 *  confusion that made wild_current's crit dials worth separating in the first place.
 *
 *  Erik owns `perPoint` (it is a dev dial): how much one authored point of variance widens the band. */
export function spreadFactor(variance, cfg = {}) {
  const v = Math.max(0, num(variance, 0));
  if (!v) return 1;
  const c = (cfg && cfg.variance) || {};
  return 1 + v * num(c.perPoint, 0.09);
}

/** Stretch a value away from `mid` by `k`, so the spread grows and the mean does not move. */
function stretch(value, mid, k) { return mid + (value - mid) * k; }

/** CCODE-77 — ROLL THE DIMENSION THIS CRAFT IS ACTUALLY ABOUT, whatever shape it is.
 *
 *  `rollMagnitude` only ever rolled damage/healing, because only those carry dice. Every other shape resolved
 *  its operative dimension as a FLAT CONSTANT — a hobble's duration, a reposition's range — which is why
 *  variance had nothing to widen on eight of the ten churnfolk crafts. This rolls the operative dimension for
 *  ANY shape: dice when the craft has them, otherwise a band around the authored value whose width is the
 *  craft's variance.
 *
 *  A craft with NO variance returns its authored number unchanged, exactly as before. That is not a special
 *  case bolted on — it falls out of a spread factor of 1 — and it is what keeps this from re-rolling the
 *  entire catalog to introduce one tradition's mechanic.
 *
 *  Returns `{ value, base, spread, rolled }` so a receipt can say "18 (authored 14, wild)" rather than just
 *  handing back a number nobody can account for. */
export function rollOperative(m, rng = Math.random, { cfg = {}, marginGap = 0 } = {}) {
  if (!m) return null;
  const f = m.fields || {};
  const key = m.operative;
  const widen = spreadFactor(f.variance, cfg);
  if (f.dice && (key === "damage" || key === "healing")) {
    const value = rollMagnitude(f, rng, { marginGap, cfg });
    return { value, base: null, spread: widen, rolled: true, dimension: key };
  }
  const base = num(f[key], null);
  if (base == null) return { value: null, base: null, spread: widen, rolled: false, dimension: key };
  if (widen === 1) return { value: base, base, spread: 1, rolled: false, dimension: key };
  // A flat value becomes a band: triangular (two draws averaged) rather than uniform, so the authored number
  // stays the most likely outcome and the extremes stay extreme. Half-width is the stretch applied to the
  // value itself, which makes a bigger craft swing wider in absolute terms — a T-V wild cast should miss by
  // more than a T-I one, not by the same two points.
  const half = Math.max(1, Math.round(base * (widen - 1)));
  const tri = (rng() + rng()) / 2;                 // 0..1, centred on 0.5
  const value = Math.max(1, Math.round(base + (tri * 2 - 1) * half));
  return { value, base, spread: widen, rolled: true, dimension: key, band: [Math.max(1, base - half), base + half] };
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
export function rollMagnitude(fields = {}, rng = Math.random, { marginGap = 0, marginFloorPer = null, cfg = {} } = {}) {
  const perPoint = Number.isFinite(marginFloorPer) ? marginFloorPer : num(fields.marginFloorPer, 0.02);
  const widen = spreadFactor(fields.variance, cfg);
  // SNG-263 r4: DICE are the craft's own shape. Rolling n independent dice gives a bell rather than the flat
  // line a uniform band gave — which is what makes a big hit feel like a big hit rather than a coin flip, and
  // it retires the `weight` fudge the band needed to sit where Erik wanted it.
  if (fields.dice) {
    const n = Math.max(1, num(fields.dice.n, 1)), faces = Math.max(2, num(fields.dice.d, 6));
    let total = 0;
    for (let i = 0; i < n; i++) total += 1 + Math.floor(rng() * faces);
    total += num(fields.plus, 0);
    // CCODE-77: VARIANCE stretches the roll around its own mean. Applied BEFORE the margin floor so a decisive
    // exchange still clips a widened low roll rather than being widened itself — the floor is about the
    // exchange, the spread is about the craft.
    const mid = (n * (faces + 1)) / 2 + num(fields.plus, 0);
    if (widen !== 1) total = stretch(total, mid, widen);
    // a decisive exchange raises the FLOOR without ever exceeding what the dice could have given. When the
    // craft is WIDENED the ceiling widens with it — clipping at the unwidened maximum would silently delete
    // the "bigger max" half of variance and leave only "worse min", which is not a wilder craft, just a worse
    // one. The ceiling means "what THIS craft could have given", and variance changes that.
    const ceiling = widen === 1 ? n * faces + num(fields.plus, 0)
      : Math.round(stretch(n * faces + num(fields.plus, 0), mid, widen));
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

/** CCODE-76 / SNG-258 §3b — WHAT THIS CRAFT'S CRITICAL LOOKS LIKE, in the craft's own words.
 *
 *  Aevi authored `riding_order` with a soft bound that is not a bound at all: "A HEARTBEAT'S WINDOW — miss it
 *  and YOU HAVE ONLY MADE CHAOS." That is not "you fail"; it is a specific, authored consequence that belongs
 *  to THAT craft and no other. The second-roll crit model already had a per-craft dial waiting; what it had no
 *  way to hear was the SENTENCE. Without this the prose sits in `bounds` where the engine reads it as a
 *  restriction, and the one line that says what going critically wrong MEANS never reaches the receipt.
 *
 *  Two deliberate limits, both learned the hard way in this codebase:
 *   · a craft BIASES the dial, it does not own it. Its contribution is clamped to `rules.crit.perCraftCap` so
 *     "this one goes badly wrong" cannot author itself past expertise, which is the thing crit is FOR (§3b:
 *     mastery triumphs harder and fails softer). Author +80 and you get the cap, with the ask recorded.
 *   · text with no chance is legal and common — most crafts want to say what their disaster looks like without
 *     claiming it happens more often. `chance` is opt-in; `text` alone shifts nothing.
 *
 *  Returns `{ success:{text,chance}, failure:{text,chance} }` with absent halves omitted, or null.
 *  The cap comes from `cap`, or from `cfg.crit.perCraftCap` if you hand it the rules bag instead. */
export function critFor(ability, { cfg = {}, cap = null } = {}) {
  const src = ability?.mechanic?.crit || ability?.crit || null;
  if (!src) return null;
  const lim = num(cap, num(cfg.crit?.perCraftCap, 10));
  const side = key => {
    const raw = src[key];
    if (raw == null) return null;
    // "failure": "a sentence" is the shorthand an author reaches for first. Accept it rather than making the
    // object form the only door — the same tolerance `axis` gets for a bare string.
    const o = typeof raw === "string" ? { text: raw } : raw;
    const text = typeof o.text === "string" && o.text.trim() ? o.text.trim() : null;
    const asked = num(o.chance, 0);
    const chance = Math.max(-lim, Math.min(lim, asked));
    if (!text && !chance) return null;
    return { ...(text ? { text } : {}), ...(chance ? { chance } : {}), ...(chance !== asked ? { asked } : {}) };
  };
  const success = side("success"), failure = side("failure");
  return success || failure ? { ...(success ? { success } : {}), ...(failure ? { failure } : {}) } : null;
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

/** SNG-263 §9 — WHAT A MINTED CRAFT INHERITS.
 *
 *  The spec said braids, discoveries and generated crafts are "born mechanically empty". Measured, that is no
 *  longer true: the resolution order gives any record with `functions` + `levelReq` its family's numbers, so a
 *  minted braid already resolves to real dice at its own tier. What it is born WITHOUT is its parents'
 *  AUTHORED SPECIFICITY — and that is the actual gap. A braid of two crafts that read `perceptionDepth`
 *  resolved with no named axes at all, and a parent's per-intensity prose vanished. The braid was correct and
 *  characterless: exactly the generic default this ticket exists to end, arriving through the back door.
 *
 *  So this DERIVES rather than invents:
 *   · named axes are the UNION of the parents' — a braid keeps what its parents were about;
 *   · a mechanical field takes the STRONGER parent's value, mirroring braidBaseCost ("priciest parent");
 *   · a REFUSED intensity is CONTAGIOUS — if either parent cannot be half-given, neither can their braid;
 *   · `bounds`/`notFor` are deliberately NOT unioned. braids.js draws that boundary around the braid's own
 *     reach ("it is not either parent entire") and marks it never-delete; inheriting parental bounds would
 *     quietly widen a braid to the sum of its parents, which is the one thing that comment forbids.
 *
 *  Returns a `mechanic` block keyed by verb, or null when the parents carry nothing worth inheriting. */
export function deriveMechanic(sources = [], { verbs = null, cfg = null } = {}) {
  // A default parameter does NOT catch an explicit null, and every caller here threads a config that may
  // legitimately be absent (a minting path with no content loaded). Total over its contract, like the
  // born-whole gate: a config edit or a missing bag must never be able to throw inside a MINT.
  const conf = cfg || {};
  const parents = (sources || []).filter(Boolean);
  if (!parents.length) return null;
  const mechAxes = new Set(conf.operativeAxis?.mechanical || []);
  const wanted = verbs && verbs.length ? verbs : [...new Set(parents.flatMap(p => p.functions || []))];
  const out = {};
  for (const verb of wanted) {
    const blocks = parents
      .map(p => (p.mechanic?.[verb] || (p.mechanic && !Object.keys(p.mechanic).some(k => (p.functions || []).includes(k)) ? p.mechanic : null)))
      .filter(Boolean);
    if (!blocks.length) continue;
    const axes = [...new Set(blocks.flatMap(b => Array.isArray(b.axis) ? b.axis : (b.axis ? [b.axis] : [])))];
    const merged = {};
    if (axes.length) merged.axis = axes;
    // the stronger parent wins each mechanical field — never the sum, or a braid of two would outclass both
    for (const a of axes) {
      if (!mechAxes.has(a)) continue;
      const vals = blocks.map(b => b[a]).filter(v => Number.isFinite(Number(v))).map(Number);
      if (vals.length) merged[a] = Math.max(...vals);
    }
    const dice = blocks.map(b => b.dice).filter(Boolean);
    if (dice.length) {
      const best = dice.reduce((x, y) => ((num(y.n, 1) * num(y.d, 6)) > (num(x.n, 1) * num(x.d, 6)) ? y : x));
      merged.dice = { n: num(best.n, 1), d: num(best.d, 6) };
      const pluses = blocks.map(b => num(b.plus, 0));
      if (pluses.some(v => v)) merged.plus = Math.max(...pluses);
    }
    // a refusal is contagious; otherwise keep the first parent that actually said something
    const intensity = {};
    for (const mode of ["conserve", "standard", "surge"]) {
      const said = blocks.map(b => b.intensity?.[mode]).filter(v => v != null);
      if (!said.length) continue;
      // CCODE-81: the braid contagion reads refusal through the SAME function as mechanicFor. It had its own
      // narrower copy of the test, so a parent that refused "at r3" was contagious to nothing.
      const refused = said.find(v => refusalOf(v, 99).refused);
      intensity[mode] = refused || said[0];
    }
    if (Object.keys(intensity).length) merged.intensity = intensity;
    if (Object.keys(merged).length) out[verb] = merged;
  }
  return Object.keys(out).length ? out : null;
}

/** ⛔ SNG-500 §3 / SYSTEM_SPEC §41 — ANTISOAK IS A VULNERABILITY ON DAMAGE THAT ALREADY GOT PAST SOAK.
 *
 *  Erik's definition and his three worked examples, which ARE the test:
 *
 *      hit 10 · soak 8 · antisoak 6  ->  8    two got through, then the vulnerability applied
 *      hit  6 · soak 8 · antisoak 6  ->  0    ⛔ ALL OF IT WAS SOAKED BEFORE THE VULNERABILITY COULD ACT
 *      hit  2 · soak 0 · antisoak 6  ->  8    nothing to soak, so all two got through and took the +6
 *
 *  ⚠️ THE MIDDLE ONE IS THE DEFINITION. Antisoak AMPLIFIES a wound; it does not create one. A blow that
 *  never landed cannot be made worse — which is also why this is not soak reduction, and why it stacks with
 *  piercing rather than competing: a piercing strike ignores the soak AND then adds the antisoak.
 *
 *  Pure, and separated from the layer walk deliberately: the arithmetic is one line and the reason it is
 *  that line is three paragraphs, so it gets its own name and its own test. */
export function antisoakLanded(hit, soak = 0, antisoak = 0) {
  const through = Math.max(0, num(hit, 0) - Math.max(0, num(soak, 0)));
  return through > 0 ? through + Math.max(0, num(antisoak, 0)) : 0;
}

/** SNG-500 §1 / CCODE-207 — RESOLVE A HEAL. The largest inert block in the game: 25 healing crafts, every
 *  one of them carrying authored dice, and not one reader. `mechanicFor` had three call sites and healing
 *  reached none — so `physicians_tome`'s 2d4 and `sun_coax`'s 1d4 were prose with a number attached.
 *
 *  ⛔ A HEAL IS NOT A NEGATIVE HIT, and that is why this is its own function rather than a sign flip on the
 *  damage path. Aevi offered both shapes and left the choice to me; the damage path would have inherited
 *  crit, evasion and armour-soak and required three suppressions, each of which is a thing a later edit can
 *  quietly undo. Stated once, here, they are gated instead:
 *
 *    · NO CRIT.     A heal cannot crit into overhealing. `critFor` is never consulted on this path.
 *    · NO EVASION.  You do not dodge being mended. No evasion field is read.
 *    · SOAK, BUT ONLY BY ACTIVE ONGOING HARM — never by armour. Bleeding, hastened decay, rot, venom and
 *      sustained holds reduce a heal because the wound is still opening while you close it. Plate does not.
 *    · AND THE COUNTER-COUNTER: a heal may spend its whole value ENDING that harm instead of mending
 *      (`staunch`). `Physician's Tome r1` is written for exactly this — "the bleeding stopped".
 *
 *  ⚠️ RANK SCALING IS NOT REINVENTED HERE. It comes from `mechanicFor`, which already compounds tier,
 *  intensity and `rankDeltas` and is tested. Erik's ruling stands unchanged: HEALED IS HEALED — a rank buys
 *  a bigger QUANTITY, never a duration or a permanence.
 *
 *  ⚠️ THE TAPER IS A DIAL, NOT A JUDGEMENT. Aevi's bound: "healing the same subject repeatedly in one
 *  contest should return less each time, or a party with one healer never loses." The SHAPE is mine; the
 *  NUMBERS are Erik's, authored at `craft_mechanics.healing` so they can be turned without editing engine
 *  source — the thing that made 21 arc-response numbers unreachable for weeks.
 *
 *  `ongoingHarm` is a property of the SUBJECT, not of the healing craft: [{ id, magnitude }]. ⛔ NOTHING
 *  AUTHORS IT YET. `Hastened Grey` and `Sustained Regard r2` both claim it in prose and neither carries a
 *  field, so this reader is live and currently unfed — reported to Aevi with the shape it wants rather than
 *  invented on her behalf. A reader with no writer is a bug; a reader with a NAMED, REPORTED gap is a
 *  work order.
 *
 *  Returns { ok, why, rolled, tapered, soaked, staunched, ended[], healed, shape } — every intermediate
 *  kept, because a receipt that says only "healed 5" cannot explain why the 9 that was rolled became 5. */
/** ⛔ CCODE-214 — WHAT ONGOING HARM A CRAFT INFLICTS. Aevi authored eight of these and every one is
 *  `{ "type": "decay" }` or similar — the KIND, with no amount. That is not an omission on her side or a
 *  mistake on mine; we were answering different questions. Hers: *what kind of harm keeps running.* Mine:
 *  *how much does it take off a heal.*
 *
 *  ⚠️ SO THE AMOUNT IS DERIVED, NOT DEMANDED. A craft already says how hard it works — `mechanic.magnitude`
 *  is that field — and making her author a second number would be asking content to repeat itself. The
 *  TYPE carries through, because it is what a ward answers (§39.5) and the reason she typed them at all.
 *
 *  Returns `{ id, type, magnitude }` or null. */
export function ongoingHarmOf(ability, rank = 1) {
  const oh = authoredBlock(ability, "ongoingHarm", rank);
  if (!oh) return null;
  const m = authoredBlock(ability, "magnitude", rank);
  // ⚠️ AND A DICE CRAFT HAS NO `magnitude` — its size IS its dice. `sustained_regard` and `wither` both
  // derived 0 on the first run, which would have been an ongoing harm that took nothing off a heal: the
  // exact inertness this whole change exists to end, reintroduced one layer down. The dice MEAN is the
  // craft's own statement of how hard it works, so that is what carries.
  const dice = authoredBlock(ability, "dice", rank);
  const diceMean = dice ? Math.round((num(dice.n, 1) * (num(dice.d, 6) + 1)) / 2 + num(authoredBlock(ability, "plus", rank), 0)) : 0;
  const magnitude = Math.max(0, num(oh.magnitude ?? oh.value ?? m ?? ability?.mechanic?.magnitude, 0) || diceMean);
  return { id: oh.id || ability?.id || "ongoing", type: oh.type || null, magnitude };
}

export function resolveHeal(ability, {
  rank = 1, tier = null, intensity = "standard", cfg = {}, verb = null,
  rng = Math.random, marginGap = 0,
  ongoingHarm = [], staunch = false, priorHeals = 0
} = {}) {
  const v = verb || (ability?.functions || []).find(f => shapeOfVerb(f, cfg)?.shape === "healing") || (ability?.functions || [])[0];
  const m = mechanicFor(ability, { verb: v, tier: tier ?? ability?.levelReq, rank, intensity, cfg });
  if (!m || m.shape !== "healing") {
    return { ok: false, why: "not a healing craft", rolled: 0, tapered: 0, soaked: 0, staunched: 0, ended: [], healed: 0, shape: m?.shape ?? null };
  }
  // ⚠️ A REFUSED INTENSITY IS A VALUE. `the_last_light` "cannot be half-given"; carrying the refusal through
  // rather than quietly resolving the baseline is the same rule the damage path already keeps.
  if (m.refusedIntensity) {
    return { ok: false, why: m.refusalMarker || "this craft refuses that intensity", rolled: 0, tapered: 0, soaked: 0, staunched: 0, ended: [], healed: 0, shape: m.shape };
  }

  const rolled = rollMagnitude(m.fields, rng, { marginGap, marginFloorPer: m.fields.marginFloorPer, cfg });

  // the taper: each prior heal on this subject this contest returns less, never below a floor fraction.
  const dial = cfg.healing || {};
  const per = num(dial.taperPer, 0.25);
  const floorFrac = Math.min(1, Math.max(0, num(dial.taperFloor, 0.25)));
  const keep = Math.max(floorFrac, 1 - per * Math.max(0, num(priorHeals, 0)));
  const tapered = Math.max(rolled > 0 ? 1 : 0, Math.round(rolled * keep));

  // ⛔ ACTIVE ONGOING HARM IS THE ONLY THING THAT SOAKS A HEAL.
  const harm = (Array.isArray(ongoingHarm) ? ongoingHarm : [])
    .map(h => ({ id: h?.id ?? null, magnitude: Math.max(0, num(h?.magnitude, 0)) }))
    .filter(h => h.magnitude > 0);

  if (!staunch) {
    const soaked = Math.min(tapered, harm.reduce((t, h) => t + h.magnitude, 0));
    return { ok: true, why: null, rolled, tapered, soaked, staunched: 0, ended: [], healed: Math.max(0, tapered - soaked), shape: m.shape };
  }

  // staunching: buy the harm off, cheapest first, and mend with whatever is left. Cheapest-first is
  // deliberate — it ends the most conditions the roll can afford rather than the largest one, and a heal
  // that ends nothing at all is the failure this branch exists to avoid.
  let purse = tapered, staunched = 0;
  const ended = [];
  for (const h of [...harm].sort((a, b) => a.magnitude - b.magnitude)) {
    if (h.magnitude > purse) break;
    purse -= h.magnitude; staunched += h.magnitude; ended.push(h.id);
  }
  // whatever harm is STILL running keeps soaking the remainder — staunching some is not staunching all.
  const remainingHarm = harm.filter(h => !ended.includes(h.id)).reduce((t, h) => t + h.magnitude, 0);
  const soaked = Math.min(purse, remainingHarm);
  return { ok: true, why: null, rolled, tapered, soaked, staunched, ended, healed: Math.max(0, purse - soaked), shape: m.shape };
}

/** SNG-500 §2 / CCODE-208 — A CRAFT IMPOSES A CONDITION. `Keening` is authored and does nothing at any rank.
 *
 *  ⛔ AEVI'S CORRECTION IS THE DESIGN: Keening does not need a new state. `incapacitation.js` already owns
 *  what happens once someone is down, and `checkIncapacitation` already holds the end-state. What was
 *  missing was a way for a CRAFT to put someone there — so this is an entrance, not a new room.
 *
 *  ⛔ AND IT DEGRADES RATHER THAN WHIFFS. Her shape: "a resist that degrades to action-loss." A craft that
 *  wins the exchange and then does nothing because one roll went the other way is the same dead feeling as
 *  a heal that heals nothing — the resist changes WHAT lands, never WHETHER anything does.
 *
 *  ⛔ AND IT CAN NEVER IMPOSE DEATH. Erik's §40 ruling lets the Engine impose incapacitation and death when
 *  the SITUATION calls for it; a craft is not a situation. `slain` and `left_for_dead` are outcomes of the
 *  incapacitation table, reached after someone is already down and weighed against the aggressor's kind.
 *  A craft may put you on the floor. What happens to you there is not its call, and IMPOSABLE is the list
 *  that makes that structural rather than a comment.
 *
 *  Authored as `mechanic.imposes`:
 *      { "condition": "unconscious", "resist": "physical", "degradesTo": "action_loss", "targets": 3 }
 *
 *  ⚠️ NOTHING AUTHORS IT YET — reported to Aevi with Keening's three ranks spelled out from her own spec,
 *  rather than authored on her behalf. Same rule as `ongoingHarm` in §1: a reader with a named, reported
 *  gap is a work order; a reader with a silent one is a bug.
 *
 *  Returns { ok, condition, degradedTo, resisted, targets, threshold, why }. */
export const IMPOSABLE = ["action_loss", "staggered", "unconscious", "incapacitated"];

/** ⛔ CCODE-214 — AN AUTHORED BLOCK LIVES ON THE RANK FIRST, AND THE ABILITY SECOND.
 *
 *  Found by playing the Sunk Assay rather than by any gate: Aevi authored 19 `imposes` blocks and 8
 *  `ongoingHarm` blocks, every one of them on a RANK (`tree[].mechanic`), and both readers looked at
 *  `ability.mechanic`. **None of it fired.** Her shape is the right one — a craft's r1 and r3 impose
 *  different things, which is what rank MEANS — and mine was the assumption.
 *
 *  ⚠️ AND EVERY GATE PASSED, because my fixtures put the block where my reader looked. A gate written
 *  by the same hand as the reader tests the assumption, not the content. That is the fourth check this
 *  week that agreed with itself, and the first one no mutation would have caught — only running the
 *  actual authored data through it did. */
export function authoredBlock(ability, key, rank = 1) {
  // ⛔ AND IT WALKS DOWN, NEVER JUST AT. Found by playing the Warden at rank 2 with `imposes` authored on
  // rank 1: an exact-rank lookup returned nothing, so the craft STOPPED STAGGERING PEOPLE THE MOMENT ITS
  // WIELDER GOT BETTER AT IT. That is worse than never working - it is a capability that silently
  // disappears on rank-up, and no gate would have shown it because a gate picks the rank it tests.
  // A craft's r1 promise holds at r3 unless r3 says otherwise; the highest rank AT OR BELOW wins.
  const tree = (ability?.tree || []).filter(r => Number(r?.rank) <= Number(rank || 1))
    .sort((a, b) => Number(b.rank) - Number(a.rank));
  for (const t of tree) { const v = t?.[key] ?? t?.mechanic?.[key]; if (v != null) return v; }
  return ability?.mechanic?.[key] ?? ability?.[key] ?? null;
}

export function resolveImposition(ability, {
  rank = 1, cfg = {}, margin = 0, targetResist = 0, targets = null, degree = null
} = {}) {
  const spec = authoredBlock(ability, "imposes", rank);
  if (!spec) return { ok: false, condition: null, degradedTo: null, resisted: false, targets: 0, threshold: null, why: "this craft imposes nothing" };

  // ⛔ ESCALATE (Aevi's SNG-509 §4) — a crit makes the effect a DIFFERENT, BETTER effect, not a bigger
  // number. "Grey Hand: a weakening becomes an incapacitation · Keening: an action-loss becomes
  // unconsciousness." She named this as the shape she cared most about and the one most likely to be
  // unsupported; it is supported the moment a craft can impose at all, because escalation is just a
  // different argument to the same call.  is opt-in — a craft that does not name one crits as
  // prose, exactly as before.
  const escalated = degree === "crit_success" && spec.onCrit ? String(spec.onCrit).toLowerCase() : null;
  const want = escalated || String(spec.condition || "").toLowerCase();
  if (!IMPOSABLE.includes(want)) {
    // ⛔ A CRAFT CANNOT AUTHOR ITS WAY TO A KILL. Refused loudly rather than clamped quietly, because a
    // clamp would let `"condition": "slain"` sit in the catalogue looking like it worked.
    return { ok: false, condition: null, degradedTo: null, resisted: false, targets: 0, threshold: null,
      why: `"${spec.condition}" is not a condition a craft may impose (${IMPOSABLE.join(" | ")})` };
  }

  const dial = cfg.imposition || {};
  // the bar rises with what the subject brings and falls with the working's rank — a deeper rank is not a
  // bigger number here, it is a HARDER THING TO SHRUG OFF, which is what rank means everywhere else.
  const threshold = Math.max(0,
    num(dial.base, 10)
    + Math.max(0, num(targetResist, 0)) * num(dial.perResist, 1)
    - Math.max(0, num(rank, 1) - 1) * num(dial.perRank, 5));

  const cap = Math.max(1, num(spec.targets, 1));
  const reach = targets == null ? cap : Math.min(cap, Math.max(1, num(targets, 1)));
  const landed = num(margin, 0) >= threshold;
  const degradesTo = String(spec.degradesTo || "action_loss").toLowerCase();

  if (landed) return { ok: true, condition: want, degradedTo: null, resisted: false, targets: reach, threshold, why: null };
  // resisted — but the working still landed, so it degrades rather than evaporating.
  return IMPOSABLE.includes(degradesTo)
    ? { ok: true, condition: degradesTo, degradedTo: want, resisted: true, targets: reach, threshold, why: null }
    : { ok: false, condition: null, degradedTo: want, resisted: true, targets: 0, threshold,
        why: `"${spec.degradesTo}" is not a condition a craft may impose` };
}

// ══════════════════════════════════════════════════════════════════════════════════════════════════
// §6 — `provoke` and `soothe`. ⛔ NEITHER NEEDS A NEW FIELD, WHICH IS AEVI'S POINT: both already have a
// target in the engine, and the reason they were "unmechanised" is that nobody had connected the verb to
// the thing it obviously acts on.

/** ⛔ PROVOKE COSTS THE OPPONENT THEIR CHOSEN LINE. Erik: "cost the opponent a chosen action, making them
 *  revert to basic default." `state.tactic` IS that chosen line — set by the `tactic` op from the
 *  opponent's authored `tacticTags`, read by the prompt builder as "current tactic: press-in". Clearing it
 *  drops them to their default, which is exactly the described effect and requires no new state.
 *
 *  ⚠️ AND IT DOES NOTHING WHEN THERE IS NOTHING TO TAKE. Provoking a foe who has not committed to a line
 *  is not a partial success — there is no line to break, and saying so beats reporting a hollow win. */
export function resolveProvoke(state, { margin = 0 } = {}) {
  const had = state?.tactic || null;
  if (!(Number(margin) > 0)) return { ok: false, why: "they did not rise to it", tactic: had };
  if (!had) return { ok: false, nothingToTake: true, why: "they are not committed to anything you can break" };
  return { ok: true, broke: had, tactic: null,
    why: `they lose their line — ${had} abandoned, back to plain fighting` };
}

/** ⚠️ SOOTHE TAKES THE HEAT OUT — §31.5 — AND HEAT IS NOT DAMAGE. It drops MOMENTUM or lifts an imposed
 *  condition; it never touches a damage track, because "calmer" is not "unwounded" and a soothe that healed
 *  would be a second RESTORE verb wearing a social name.
 *
 *  ⛔ MOMENTUM IS PULLED TOWARD ZERO, NOT REVERSED. Taking the heat out of a fight the other side is
 *  winning does not hand you the advantage — it cools it. Overshooting into your own favour would make
 *  soothe an attack. */
export function resolveSoothe(state, { margin = 0, cfg = {}, conditions = [] } = {}) {
  if (!(Number(margin) > 0)) return { ok: false, why: "the heat stays in it" };
  const per = num(cfg?.soothe?.momentumPerMargin, 0.15);
  const cap = num(cfg?.soothe?.momentumCap, 4);
  const mom = num(state?.momentum, 0);
  const pull = Math.min(cap, Math.max(1, Math.round(Math.abs(Number(margin)) * per)));
  // toward zero from either side, and never past it
  const cooled = mom === 0 ? 0 : (mom > 0 ? Math.max(0, mom - pull) : Math.min(0, mom + pull));
  const lifted = (conditions || []).find(c => c && !c.persistUntilHealed) || null;
  if (mom === 0 && !lifted) return { ok: false, why: "there is no heat in it to take out" };
  return { ok: true, momentum: { before: mom, after: cooled, pulled: Math.abs(mom - cooled) },
    lifted: lifted ? (lifted.id || lifted.name) : null,
    // ⛔ STATED SO IT CANNOT DRIFT: a soothe that ever moved a damage track would be a RESTORE verb wearing
    // a social name, and §31.5 is explicit that it removes heat and not reasons.
    touchedDamage: false,
    why: lifted ? `the heat goes out of it and ${lifted.name || lifted.id} lifts` : "the heat goes out of it" };
}
