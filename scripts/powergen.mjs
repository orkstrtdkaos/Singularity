// ⛔ SNG-634 §7 / SNG-647 §3 — WHO WOULD COME TO HOLD GROUND NOBODY HOLDS.
//
// Aevi's ask, in Erik's words: *"You might need to author more powers… the world is very big and you don't have
// enough to fill it yet… or alternatively, have CCode exercise the generative engine to see how those powers
// would get generated as if in play."* She authored the anchors the Sovereign story needs and handed the rest
// here — and set the terms: *"where it does well, the dry run becomes the seed and the rules are right; where it
// doesn't, the rules get fixed, not the output."*
//
// ⛔ SO EVERY DECISION THIS MODULE MAKES NAMES THE RULE THAT MADE IT. `why` on each proposal is not a comment,
// it is the output: a report of powers is worth little, and a report of which authored rule placed each one is
// what lets her fix the rules instead of the names. There is not one number in here that I chose — every weight,
// tag, threshold and range is read from `rules.powers`, and a rule that is absent silently skips its step rather
// than falling back to something I invented.
//
// ⚠️ PURE, AND IT WRITES NOTHING. It proposes; a caller decides. `scripts/power_dryrun.mjs` prints the proposals
// and touches no content, which is what she asked for. The day this mints in play, the same function answers.
//
// ⛔ AND IT LIVES IN `scripts/`, NOT `engine/`, ON PURPOSE. I put it in `engine/` first and the wiring audit was
// right to refuse it: "a NEW export reachable only from a test — it passes CI and CANNOT FIRE IN PLAY. Wire it or
// delete it." Both would have been wrong here. Wiring it to mint would decide, on my own, that the world starts
// growing powers before Aevi has reviewed the rules — and her terms are the opposite: "where it does well, THE DRY
// RUN BECOMES THE SEED and the rules are right; where it doesn't, the rules get fixed." Deleting it would throw
// away the thing she asked for. ⛑ So today this is a REPORTING TOOL and sits with the other reporting tools; it
// moves to `engine/` in the same commit as the caller that mints from it, which is a reviewed step of its own.
// A module's home is a claim about who calls it, and that claim should be true.
// ⚑ AND IT IS NOT A NAMER. Naming is authorship (SNG-430) — `names.js` owns it, and this hands back a `leaderTier`
// and a `kind` so a mint can ask for a name of the right shape. Nothing here composes prose.

import { walkingDays } from "../engine/worldmap.js";

const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

/** Deterministic, so a dry run is reviewable: the same region reports the same proposals every time. */
function seeded(str) {
  let h = 2166136261;
  for (let i = 0; i < String(str).length; i++) { h ^= String(str).charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}

/** ⛑ A WEIGHTED DRAW OVER AUTHORED WEIGHTS. `kinds.<k>.tempers` is `{cruel: 0.35, hard: 0.5, fair: 0.15}` —
 *  Aevi's distribution per kind, and the reason a band is usually hard and an outlaw crown is usually worse. */
function pickWeighted(weights, roll) {
  const rows = Object.entries(weights || {}).filter(([, w]) => num(w) > 0);
  if (!rows.length) return null;
  const total = rows.reduce((n, [, w]) => n + num(w), 0);
  let x = roll * total;
  for (const [k, w] of rows) { x -= num(w); if (x <= 0) return k; }
  return rows[rows.length - 1][0];
}

const tagsOf = (loc) => (Array.isArray(loc?.tags) ? loc.tags : []).map(t => String(t).toLowerCase());
const placesIn = (regionId, locations) => Object.values(locations || {}).filter(l => l && l.regionId === regionId);

/** ⛔ HOW MANY POWERS A REGION SUPPORTS — `density`, and nothing else. `base + perDangerStep × danger`, capped at
 *  `maxPerRegion`, where the danger is the worst in the region: a quiet farming shelf carries one and a lawless
 *  march carries four. ⚑ THE COUNT FALLS OUT OF THE GROUND, which is the same rule `presence.js` follows for who
 *  is around today — a quota would put a crown in an empty fen. Returns the number and how it got there. */
export function densityFor(regionId, { content = null } = {}) {
  const d = content?.rules?.powers?.density;
  if (!d) return null;
  const places = placesIn(regionId, content?.locations);
  if (!places.length) return { supports: 0, danger: 0, why: "no place in this region" };
  const danger = Math.max(0, ...places.map(l => num(l.dangerLevel)));
  const raw = num(d.base) + num(d.perDangerStep) * danger;
  const supports = Math.max(0, Math.min(num(d.maxPerRegion, 99), Math.floor(raw)));
  return { supports, danger, raw,
    why: `density: base ${num(d.base)} + ${num(d.perDangerStep)}/danger × ${danger} = ${raw}${raw > num(d.maxPerRegion, 99) ? `, capped at maxPerRegion ${num(d.maxPerRegion)}` : ""} → ${supports}` };
}

/** ⛔ WHICH KINDS COULD SIT AT THIS PLACE, by `placeAtTags` and `minDanger` and `excludeTiers` — the three rules
 *  that are about the GROUND rather than about the power. Returns [{kind, matched, why}]. */
export function kindsAt(loc, { content = null } = {}) {
  const kinds = content?.rules?.powers?.kinds || {};
  const tags = new Set(tagsOf(loc));
  const danger = num(loc?.dangerLevel);
  const out = [];
  for (const [kind, k] of Object.entries(kinds)) {
    const want = (k.placeAtTags || []).map(t => String(t).toLowerCase());
    // ⚠️ A KIND WITH NO `placeAtTags` SITS ANYWHERE — that is `sovereignty`, and it is authored, not an omission:
    // a sovereignty is what governs a region, so the ground does not decide whether one can exist.
    const matched = want.length ? want.filter(t => tags.has(t)) : [];
    if (want.length && !matched.length) continue;
    if (k.minDanger != null && danger < num(k.minDanger)) continue;
    if (Array.isArray(k.excludeTiers) && k.excludeTiers.includes(String(loc?.tier || ""))) continue;
    out.push({ kind, matched,
      why: want.length ? `placeAtTags ${matched.join("+")} at ${loc.id}` : `${kind} needs no tag — it governs the region` });
  }
  return out;
}

/** The temper rule: a kind's own authored distribution. */
export function temperFor(kind, { content = null, roll = 0.5 } = {}) {
  const k = content?.rules?.powers?.kinds?.[kind];
  const t = pickWeighted(k?.tempers, roll);
  return t ? { temper: t, why: `kinds.${kind}.tempers ${JSON.stringify(k.tempers)}` } : null;
}

/** ⛔ AND THE RULES THAT ARE ABOUT THE NEIGHBOURS. Each returns a REASON TO REFUSE, or null to allow — so a
 *  refusal in the report always names the rule that refused, which is the half of a dry run worth reading. */
function neighbourRefusals(kind, temper, loc, { content, standing }) {
  const k = content?.rules?.powers?.kinds?.[kind] || {};
  const locs = content?.locations || {};
  const out = [];

  // ⛑ `notWithinDaysOfTemper` — an outlaw band does not set up a day from somebody fair, or two from somebody
  // kind. This is the rule that keeps the world's tempers from cancelling each other out on the same road.
  for (const [otherTemper, days] of Object.entries(k.notWithinDaysOfTemper || {})) {
    for (const p of standing) {
      if (String(p.temper) !== otherTemper) continue;
      const theirs = locs[p.seat];
      const d = theirs ? walkingDays(loc, theirs) : null;
      if (d != null && d <= num(days)) out.push(`notWithinDaysOfTemper.${otherTemper} ${days}d — ${p.name || p.id} is ${d.toFixed(1)}d away`);
    }
  }

  // ⛑ `formsWhenBandsInRegion` — an outlaw crown is not founded, it ACCRETES. It exists where enough bands
  // already do, which is why the Gralloch is a crown and a roadside gang is not.
  if (k.formsWhenBandsInRegion != null) {
    const bands = standing.filter(p => p.kind === "outlaw_band" && locs[p.seat]?.regionId === loc.regionId).length;
    if (bands < num(k.formsWhenBandsInRegion)) out.push(`formsWhenBandsInRegion ${k.formsWhenBandsInRegion} — only ${bands} band(s) here`);
  }
  return out;
}

/** ⛔ THE DRY RUN, PER REGION. Proposes what would come to hold ground here, each with the rule that placed it.
 *  ⚠️ EXISTING POWERS COUNT. A region Aevi has authored into is not empty, and both `density` and `perRegionMax`
 *  are about the region rather than about this pass — a generator that ignored what is already there would
 *  propose a second Grand Lattice.
 *  Returns { regionId, density, proposals[], refused[] }. PURE, and it writes nothing. */
export function proposePowers(regionId, { content = null, standing = null, seed = null } = {}) {
  const rules = content?.rules?.powers;
  if (!rules?.kinds) return { regionId, density: null, proposals: [], refused: [{ why: "rules.powers is not loaded" }] };
  const locs = content?.locations || {};
  const here = placesIn(regionId, locs);
  const density = densityFor(regionId, { content });
  const rng = seeded(seed ?? `powergen|${regionId}`);

  // the powers already standing anywhere in the world — their seats decide the neighbour rules
  const already = standing || (Array.isArray(content?.powers) ? content.powers : []);
  const mine = already.filter(p => locs[p.seat]?.regionId === regionId || (p.reach || []).some(r => locs[r]?.regionId === regionId));
  const perKindHere = (kind) => mine.filter(p => p.kind === kind).length;

  const proposals = [], refused = [];
  let room = Math.max(0, num(density?.supports) - mine.length);
  if (mine.length) refused.push({ why: `${mine.length} power(s) already reach this region — ${density?.supports} supported, ${room} place(s) left` });

  // ⛑ THE SEATS ARE TRIED IN A STABLE ORDER — a settlement before a site before the region itself, then by id.
  // A power seats where people are, and the region record is the last resort rather than the first match.
  const rank = (l) => (l.tier === "settlement" ? 0 : l.tier === "site" ? 1 : 2);
  const seats = [...here].sort((a, b) => rank(a) - rank(b) || String(a.id).localeCompare(String(b.id)));

  // ⬜ ONE SEAT, ONE POWER — A RULE THAT DOES NOT EXIST YET, AND THE READER IS HERE FOR WHEN IT DOES.
  // ⚠️ MEASURED ON AEVI'S OWN CORPUS: all 29 authored powers have 29 DISTINCT seats, not one shared. This
  // generator, following only the rules that exist, seated three at The Leaden Deep — a band, an order and a
  // sovereignty in the same building. That is a rule she has been applying and never had to write down.
  // ⛑ I am not inventing it: whether two powers may share a seat is a content decision, and `seatsAreExclusive`
  // on `rules.powers` is the dial's name. Absent, the behaviour is what it is today and the dry run reports the
  // stacking honestly; authored `true`, this refuses the second one and names the rule that refused it.
  const exclusiveSeats = rules.seatsAreExclusive === true;
  const seatTaken = new Set(already.filter(p => p.seat).map(p => p.seat));

  for (const loc of seats) {
    if (room <= 0) break;
    for (const cand of kindsAt(loc, { content })) {
      if (room <= 0) break;
      if (exclusiveSeats && seatTaken.has(loc.id)) {
        refused.push({ at: loc.id, kind: cand.kind, why: "seatsAreExclusive — a power already sits here" });
        break;
      }
      const k = rules.kinds[cand.kind];
      if (k.perRegionMax != null && perKindHere(cand.kind) + proposals.filter(p => p.kind === cand.kind).length >= num(k.perRegionMax)) {
        refused.push({ at: loc.id, kind: cand.kind, why: `perRegionMax ${k.perRegionMax} already met` });
        continue;
      }
      const t = temperFor(cand.kind, { content, roll: rng() });
      if (!t) { refused.push({ at: loc.id, kind: cand.kind, why: `kinds.${cand.kind}.tempers is empty` }); continue; }
      const stop = neighbourRefusals(cand.kind, t.temper, loc, { content, standing: [...already, ...proposals.map(p => ({ ...p, seat: p.seat })) ] });
      if (stop.length) { refused.push({ at: loc.id, kind: cand.kind, temper: t.temper, why: stop.join(" · ") }); continue; }

      const heads = Array.isArray(k.heads) ? Math.round(num(k.heads[0]) + rng() * (num(k.heads[1]) - num(k.heads[0]))) : null;
      const quality = Array.isArray(k.quality) ? Math.round(num(k.quality[0]) + rng() * (num(k.quality[1]) - num(k.quality[0]))) : null;
      const form = Array.isArray(k.forms) ? k.forms[Math.floor(rng() * k.forms.length)] : null;

      // ⛑ THE CELLS A GUILD KEEPS — `cellsAtTags` within `cellsWithinDays`, capped at `cellsMax`. A guild is not
      // one building; the Undercount's authored record is a seat and a set of rooms, and this is that rule.
      let cells = null;
      if (Array.isArray(k.cellsAtTags)) {
        const want = new Set(k.cellsAtTags.map(x => String(x).toLowerCase()));
        cells = Object.values(locs)
          .filter(l => l.id !== loc.id && tagsOf(l).some(tg => want.has(tg)))
          .map(l => ({ id: l.id, days: walkingDays(loc, l) }))
          .filter(x => x.days != null && x.days <= num(k.cellsWithinDays, 99))
          .sort((a, b) => a.days - b.days)
          .slice(0, num(k.cellsMax, 0));
      }

      // ⛑ A LORDSHIP DRAWS A RIVAL — `rivalWithinDays`, and `rivalOppositeTemperChance` decides whether the rival
      // is its opposite. Authored, not chosen here: it is why the Unshadowed and the Glass Assembly are a pair.
      let rival = null;
      if (k.rivalWithinDays != null) {
        const near = already.filter(p => { const d = locs[p.seat] ? walkingDays(loc, locs[p.seat]) : null; return d != null && d <= num(k.rivalWithinDays); });
        if (near.length) {
          const opposite = rng() < num(k.rivalOppositeTemperChance);
          const pick = (opposite ? near.filter(p => p.temper !== t.temper) : near)[0] || near[0];
          rival = { id: pick.id, opposite, why: `rivalWithinDays ${k.rivalWithinDays}d${opposite ? `, rivalOppositeTemperChance ${k.rivalOppositeTemperChance} hit` : ""}` };
        }
      }

      seatTaken.add(loc.id);
      proposals.push({
        kind: cand.kind, temper: t.temper, seat: loc.id, seatTier: loc.tier || null,
        scale: k.scale || null, heads, quality, form,
        leaderTier: k.leaderTier || null, holdKind: k.holdKind || null,
        verbs: [...(k.verbs || [])],
        liftsDanger: k.liftsDanger !== false,
        cells, rival,
        why: [cand.why, t.why, `heads ${JSON.stringify(k.heads)}`, `leaderTier ${k.leaderTier}`].filter(Boolean),
      });
      room--;
    }
  }
  return { regionId, density, proposals, refused };
}

/** ⬜ THE SUPPLY-LINE RULE (SNG-641 §6 / work order 3b) IS NOT IN HERE, AND SAYING SO BEATS PRETENDING.
 *  Aevi asks whether it "fires only where a hunger fits". It cannot fire at all yet: a supply line is a power
 *  feeding a SOVEREIGN'S HUNGER ARC, and the arcs land with work order item 2. ⛑ What this reports instead is
 *  the input that rule will need — which proposals sit in a region a Sovereign's line already reaches — so the
 *  day the arcs exist the question is answerable rather than re-asked. */
export function supplyLineReadiness(regionId, { content = null } = {}) {
  const arcs = content?.greaterArcs || content?.lore?.greaterArcs || null;
  const hungerArcs = Object.values(arcs || {}).filter(a => /hunger/i.test(String(a?.kind || a?.id || "")));
  const locs = content?.locations || {};
  const fed = (Array.isArray(content?.powers) ? content.powers : []).filter(p => p.feedsGM && locs[p.seat]?.regionId === regionId);
  return {
    regionId,
    hungerArcsLoaded: hungerArcs.length,
    linesAlreadyHere: fed.length,
    why: hungerArcs.length
      ? `${hungerArcs.length} hunger arc(s) loaded; the rule can be asked`
      : "no hunger arc is loaded — the rule has nothing to fit a power to (work order item 2 lands them)",
  };
}
