// legends.js — SNG-042: the world's great figures. A world feels large when greatness passes
// through it — heroes witnessed, villains scaling from riffraff to arc. Rides BATCH-9 (the
// generate path + weight/recurrence + codex). Pure + headless-testable: the ENGINE detects the
// beat, tiers the figure, and GOVERNS the rarity; the GM narrates the appearance.
//
//   1. Power-tier spectrum — legendary/epic → regional/notable → local/riffraff, on hero AND
//      villain alignment. tierBirthWeight makes a legendary figure born strong so the BATCH-9
//      weight system keeps them real + recurring by default.
//   2. Roster — hand-authored anchors (legends.json) loaded as high-weight reusable canon;
//      mid/low tiers generate in-grain via the BATCH-9 path at the requested tier.
//   3. Dramatic-beat deployment ("legend surfacing") — RARE, governed: a doomed rescue, a
//      witnessed set-piece, a passing legend's advice, a villain's escalating shadow.
//   4. Threading — legends recur as high-weight codex entities (handled by weight + codex).
//   5. Governors — rare, power-appropriate (tier scales to arc), rating-aware.

import { smartClamp } from "./namematch.js"; // SNG-208 wiring: legendsForGM clamps authored prose to the GM

/** Birth-weight floor per power tier — legendary sits high so the weight system treats it as
 *  durable, recurring canon (the measure others are held against). */
// SNG-269 (Erik ratified) — THE RUNGS SPREAD OUT AT THE TOP.
//
// The old table put legendary at 50 and epic at 45 — a gap of FIVE across the two most important rungs in the
// world, which made them mechanically the same figure with different words. The tier-gap mechanics in
// `worldtick` (how many a victor cuts down, how badly) read exactly this difference, so they had nothing to
// read: a legend meeting an epic resolved as a coin-flip between peers. Gaps now GROW toward the top, so
// being a legend means something a rung below cannot buy with numbers.
//
// ⚠️ `regional` is ALIASED to `heroic`, never deleted — `encounterFrame.js:109` branches on the literal
// string, and authored content still carries it. Both names must land on the same rung forever.
export const LEGEND_TIER_WEIGHT = { mythic: 72, legendary: 50, epic: 34, heroic: 22, leader: 16, notable: 10, riffraff: 3 };
export function tierBirthWeight(tier) { return LEGEND_TIER_WEIGHT[tier] ?? 5; }

/** The four deployment beats a great figure lands on. */
export const LEGEND_BEATS = ["doomed_rescue", "witness_power", "passing_advice", "villain_escalation"];
const HERO_BEATS = new Set(["doomed_rescue", "witness_power", "passing_advice"]);
const VILLAIN_BEATS = new Set(["villain_escalation", "witness_power"]);

/** Load the authored legends file into a runtime roster: each figure normalized to an NPC-shaped
 *  record (reusable canon, resolvable by name via SNG-019) carrying a `legend` tag with its tier,
 *  alignment, presence pattern, and signature. Pure. Returns { roster, beats, tiers }. */
export function loadLegends(file = {}) {
  const roster = (file.figures || []).map(f => {
    const { presencePattern, signature, threading, ...rest } = f;
    return {
      ...rest,
      legend: {
        tier: f.tier || "leader",
        alignment: f.alignment || "hero",
        presencePattern: presencePattern || { beats: [], rarity: "rare" },
        signature: signature || "",
        threading: threading || "",
        weight: tierBirthWeight(f.tier)
      }
    };
  });
  return { roster, beats: file.deploymentBeats || {}, tiers: file.tiers || {} };
}

/** The power tier appropriate to a character's arc (level). Low arc meets regional/riffraff
 *  powers; a legendary figure is earned by a developed character. Villains scale the same. */
/** ⛔ SNG-590 — THIS RETURNED "legendary" FOR EVERY LEVEL FROM 7 TO 100.
 *
 *  ⚑ ERIK FOUND IT IN PLAY: "It makes me suspicious that I'm finding so many legendaries right now… I have
 *  to ask how likely that is." Measured: at level 7 and above, as likely as the engine could make it. The
 *  candidate filter allows one rung ABOVE the arc tier as "a glimpse of the legendary" — and at `legendary`
 *  the ceiling exceeded the whole roster, so every figure qualified and the sort took the strongest. Forced
 *  across all four beat types it deployed 3 legendary + 1 epic and ZERO heroic, while heroic was the largest
 *  group on the roster. A level-7 character met exactly the figures a level-61 one did.
 *
 *  ⚠️ AND SNG-260 §B SAID SO IN ADVANCE — "The old tierForArc (legendary at L7) assumed a short game" — with
 *  the band layer assigned to me and never built. These three hardcoded cuts were what stood in for it.
 *
 *  ⛑ SEVEN RUNGS NOW, AUTHORED (Aevi + Erik, `rules/power_bands.json`): one vocabulary, one rung per tier, a
 *  band per rung, contiguous 1–100. The engine reasons in `band`; the tier name is what a person is called.
 *  `DEFAULT_RUNGS` is the fallback for a caller with no content — and §240 holds it against the file, so the
 *  two cannot drift the way a second copy of a table always eventually does. */
export const DEFAULT_RUNGS = [
  { band: 0, tier: "riffraff", levels: [1, 4] },
  { band: 1, tier: "notable", levels: [5, 11] },
  { band: 2, tier: "leader", levels: [12, 24] },
  { band: 3, tier: "heroic", levels: [25, 39] },
  { band: 4, tier: "epic", levels: [40, 59] },
  { band: 5, tier: "legendary", levels: [60, 84] },
  { band: 6, tier: "mythic", levels: [85, 100] },
];

/** The rungs in force: the authored table when a caller has content, else the defaults. */
export function rungsFrom(bands) {
  const rows = Array.isArray(bands?.bands) ? bands.bands : Array.isArray(bands) ? bands : null;
  return (rows && rows.length) ? rows : DEFAULT_RUNGS;
}

/** What a character of this level IS — the rung's own name. */
export function tierForArc(level = 1, bands = null) {
  const rungs = rungsFrom(bands);
  const L = Number(level) || 1;
  for (const r of rungs) if (L >= r.levels[0] && L <= r.levels[1]) return r.tier;
  // ⚠️ ABOVE THE TOP RUNG IS THE TOP RUNG, never a fall-through to the bottom: a level-120 character is not
  // riffraff, and the table's ceiling is a ceiling rather than an edge to walk off.
  return rungs[rungs.length - 1]?.tier || "riffraff";
}

/** Which alignment fits a beat: villain_escalation is the menace ladder; the rest are heroic
 *  (a witnessed set-piece can be either — default hero unless asked for a villain). */
function alignmentForBeat(beatType, prefer = null) {
  if (prefer) return prefer;
  return beatType === "villain_escalation" ? "villain" : "hero";
}

/** Decide whether — and which — great figure surfaces on this beat. RARE + governed:
 *   • cooldown: at least `minGapDays` world-days since the last deploy (governor.lastDeployDay);
 *   • rarity: a base roll (rng) that keeps even a qualifying beat mostly quiet;
 *   • power-appropriate: the tier scales to the character's arc; an epic villain never shows for
 *     a tavern scuffle;
 *   • an authored anchor whose presencePattern names this beat is preferred (alignment-matched,
 *     rarity-weighted); otherwise a generate-at-tier is signalled for a fresh mid/low figure.
 *  Pure (rng injected). Returns { deploy:false } or
 *  { deploy:true, beatType, alignment, tier, figure?|generate:true, birthWeight }. */
export function legendSurfacing({ beatType, roster = [], governor = {}, arcLevel = 1, worldDay = 0, prefer = null, minGapDays = 6, baseRate = 0.5, rng = Math.random, bands = null } = {}) {
  if (!beatType || !LEGEND_BEATS.includes(beatType)) return { deploy: false };
  // cooldown: greatness stays rare
  const last = governor.lastDeployDay;
  if (last != null && worldDay - last < minGapDays) return { deploy: false };
  // rarity roll — even an apt beat mostly passes quietly
  if (rng() > baseRate) return { deploy: false };

  const alignment = alignmentForBeat(beatType, prefer);
  const tier = tierForArc(arcLevel, bands);
  const allowedBeats = alignment === "villain" ? VILLAIN_BEATS : HERO_BEATS;
  if (!allowedBeats.has(beatType)) return { deploy: false };

  // prefer an authored anchor for this beat + alignment (rarity-weighted, arc-appropriate tier)
  const candidates = roster.filter(r =>
    r.legend?.alignment === alignment &&
    (r.legend?.presencePattern?.beats || []).includes(beatType) &&
    // ⛑ AND NOW THE "+1 GLIMPSE" IS ONE RUNG OF SEVEN rather than a ceiling above the whole roster.
    tierRank(r.legend?.tier, bands) <= tierRank(tier, bands) + 1 // an anchor may exceed the arc tier by one (a glimpse of the legendary)
  );
  if (candidates.length) {
    // deterministic pick weighted toward the strongest apt figure, varied by worldDay
    const sorted = candidates.sort((a, b) => tierRank(b.legend.tier, bands) - tierRank(a.legend.tier, bands));
    const figure = sorted[worldDay % sorted.length] || sorted[0];
    return { deploy: true, beatType, alignment, tier: figure.legend.tier, figure, birthWeight: figure.legend.weight };
  }
  // no apt anchor → generate a fresh figure at the arc-appropriate tier
  return { deploy: true, beatType, alignment, tier, generate: true, birthWeight: tierBirthWeight(tier) };
}

// Six rungs, and `regional` shares `heroic`'s. An unknown tier lands at the FLOOR, not the middle: a figure
// whose tier nobody wrote should not out-rank an authored notable by accident.
/** ⛔ SNG-590 — THIS GAVE `heroic` AND `regional` THE SAME RUNG (2), one word from each of the two old
 *  vocabularies flattened into one ladder — so a "regional" threat and a "heroic" one compared as equals and
 *  neither could ever be the other's "+1". ⛑ Rank is the BAND now, one rung per tier, read from the same
 *  table `tierForArc` reads. ⚑ `mythic` has a home instead of a rename out from under 5 authored NPCs. */
export function tierRank(tier, bands = null) {
  const r = rungsFrom(bands).find(x => x.tier === tier);
  return r ? Number(r.band) || 0 : 0;
}

/** The GM directive for a surfaced legend — names the beat + figure + register, RATING-AWARE
 *  (a legend's brutality respects the ceiling). Pure. */
export function legendDeploymentForGM(deployment, { ratingPreset = "PG-13" } = {}) {
  if (!deployment?.deploy) return null;
  const BEAT_DIR = {
    doomed_rescue: "an overwhelming, doomed moment — a HERO of great power intervenes and shields the character; relief, and the felt size of the gap between their power and yours",
    witness_power: "a set-piece where the character WITNESSES a great figure's power at full scale — scale-setting, you see what the best can do",
    passing_advice: "a mundane crossing where a passing legend leaves ONE true thing — advice, a name, a warning, a task — then moves on",
    villain_escalation: "the shadow of a great VILLAIN reaches the character — riffraff or a lieutenant, escalating toward the epic figure who is not yet here"
  };
  const who = deployment.figure
    ? `${deployment.figure.name} (${deployment.figure.legend.tier} ${deployment.figure.legend.alignment}). Signature: ${deployment.figure.legend.signature}`
    : `a ${deployment.tier} ${deployment.alignment} the world grows for this moment`;
  return `## A GREAT FIGURE (SNG-042 — deploy RARELY + in-grain; the engine chose this beat, you narrate it). BEAT: ${BEAT_DIR[deployment.beatType]}. FIGURE: ${who}. Keep their power legible and EARNED, never a deus ex machina that steals the player's agency — they witness, are aided, or are warned; the choice stays theirs. Respect the ${ratingPreset} ceiling in any violence.`;
}

const clampSig = s => smartClamp(String(s || "").replace(/\s+/g, " ").trim(), 220);
/** The legends the character has a REASON to reach — so the great figures are PURSUABLE, not just ambient
 *  (SNG-208 made them act offstage; this makes them things the player can seek). A legend whose `tradition`
 *  the character PRACTICES is the legendary deep-teacher of that craft — the SNG-203 Finding-beat target;
 *  a legend whose `homeLocation` is HERE is a present force whose `want` is a quest waiting. Dead legends
 *  (SNG-208 §3b) are gone. `opts.practiced` (Set of traditions) + `opts.deadIds` (Set) are supplied by the
 *  caller so this stays a pure read with no cross-module import. Caps per group to avoid a dump. Pure. */
export function legendsForGM(character, content, opts = {}) {
  const roster = content?.legends?.roster || [];
  if (!roster.length) return null;
  // the table the whole ladder reads; a caller with no content falls to DEFAULT_RUNGS
  const bands = opts.bands || content?.rules?.powerBands || null;
  const practiced = opts.practiced instanceof Set ? opts.practiced : new Set();
  const dead = opts.deadIds instanceof Set ? opts.deadIds : new Set();
  const here = character?.currentLocationId;
  // ⛔ SNG-590 — THIS PUT UP TO SEVEN PROPER NOUNS IN EVERY PROMPT, gated only by practised tradition: no
  // level, no tier, no cooldown. ⚑ For Silas the four teachers were literally Sister Alder, HALVEX COIL,
  // Overseer Grael and MAREN OSSITIDE — the two figures Erik then met. As he put it: "we should really
  // balance what names the gm has all the time."
  //
  // ⛑ AEVI'S RULING (SNG-590 §3), and her reason is the diagnosis itself — "a name in the context is a name
  // the model can reach for. Seven proper nouns per prompt, every prompt, filtered only by tradition, is not
  // an aspiration layer — it is a hand of cards." So: THE CHARACTER'S BAND AND ONE ABOVE, and at most ONE
  // from that band above. That is the "+1 glimpse" the source has always promised and never delivered.
  //
  // ⚠️ AND THE REACH STAYS LEGIBLE, which is the rider she attached and the half that matters: "A level-7
  // character being shown Halvex Coil is fine. Being shown him as REACHABLE is the bug." A figure from the
  // band above is marked as far off, in the line the GM reads.
  const myBand = tierRank(tierForArc(character?.level || 1, bands), bands);
  const bandOf = (f) => tierRank(f?.legend?.tier || f?.tier, bands);
  let glimpses = 0;
  const teachers = [];
  for (const f of roster) {
    if (dead.has(f.id)) continue;
    const fb = bandOf(f);
    // ⛔ ABOVE THE GLIMPSE IS OUT OF SIGHT ENTIRELY — not shown dimmer, not shown at all. A name the model
    // cannot see is a name it cannot hand out.
    if (fb > myBand + 1) continue;
    const beyond = fb > myBand;
    if (beyond) { if (glimpses >= 1) continue; glimpses++; }
    const atHome = !!(here && f.homeLocation && f.homeLocation === here);
    if (f.tradition && practiced.has(f.tradition) && teachers.length < 4) {
      const role = f.role || (f.alignment === "villain" ? "dark master" : "master");
      teachers.push(`- ${f.name} — the legendary ${role} of the ${f.tradition} craft${f.signature ? `: ${clampSig(f.signature)}` : ""}${atHome ? " — and a presence HERE" : ""}${beyond ? " — ⛔ FAR BEYOND THIS CHARACTER: a rumour, a road that would take an arc to walk, never someone who simply turns up" : ""}. Seeking them is the deep-teacher arc (SNG-203 Finding beat); the pursuit is the quest, woven in the fiction, never a menu.`);
    }
  }
  if (!teachers.length) return null;
  const parts = [];
  if (teachers.length) parts.push(`LEGENDARY TEACHERS you could seek — the craft this character practices has great masters out there; pursuing one is an arc with the deepest teaching at its end (do not force it; offer the possibility when the fiction reaches for it):\n${teachers.join("\n")}`);
  // ⛔ SNG-591 (Erik) — THE "GREAT FIGURES NEAR YOU" HALF IS GONE, and he is right about why: "if a player is
  // at notable, the far beyond is Regional and they get 1 name… but there are SO many more that are far beyond
  // that it's a waste."
  //
  // ⚑ A ONE-RUNG GATE PICKING ONE NAME OUT OF A WHOLE RUNG IS ARBITRARY. It was defensible when the only thing
  // above you was a legend and the point was a glimpse; with seven rungs the thing above a notable is merely
  // the next rung, and there are dozens of them.
  //
  // ⛑ AND `presence.js` ALREADY ANSWERS THE QUESTION PROPERLY: who is near, weighted by reach over distance,
  // what they are DOING, and — SNG-591 — what a meeting across those two rungs IS. This was a second, worse
  // answer to the same question: `homeLocation === here` only, no cadence, no distance, no relation. ⚠️ Two
  // readers of one question, and this one could not see how far away anybody was.
  //
  // ⬜ WHAT STAYS IS THE PURSUIT — a legendary TEACHER of a craft you practise is a road you choose to walk,
  // which is a different thing from who is in the market today.
  return parts.join("\n\n");
}
