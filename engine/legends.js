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
export const LEGEND_TIER_WEIGHT = { legendary: 50, epic: 45, regional: 16, notable: 10, riffraff: 3 };
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
        tier: f.tier || "regional",
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
export function tierForArc(level = 1) {
  if (level >= 7) return "legendary";
  if (level >= 4) return "regional";
  return "riffraff";
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
export function legendSurfacing({ beatType, roster = [], governor = {}, arcLevel = 1, worldDay = 0, prefer = null, minGapDays = 6, baseRate = 0.5, rng = Math.random } = {}) {
  if (!beatType || !LEGEND_BEATS.includes(beatType)) return { deploy: false };
  // cooldown: greatness stays rare
  const last = governor.lastDeployDay;
  if (last != null && worldDay - last < minGapDays) return { deploy: false };
  // rarity roll — even an apt beat mostly passes quietly
  if (rng() > baseRate) return { deploy: false };

  const alignment = alignmentForBeat(beatType, prefer);
  const tier = tierForArc(arcLevel);
  const allowedBeats = alignment === "villain" ? VILLAIN_BEATS : HERO_BEATS;
  if (!allowedBeats.has(beatType)) return { deploy: false };

  // prefer an authored anchor for this beat + alignment (rarity-weighted, arc-appropriate tier)
  const candidates = roster.filter(r =>
    r.legend?.alignment === alignment &&
    (r.legend?.presencePattern?.beats || []).includes(beatType) &&
    tierRank(r.legend?.tier) <= tierRank(tier) + 1 // an anchor may exceed the arc tier by one (a glimpse of the legendary)
  );
  if (candidates.length) {
    // deterministic pick weighted toward the strongest apt figure, varied by worldDay
    const sorted = candidates.sort((a, b) => tierRank(b.legend.tier) - tierRank(a.legend.tier));
    const figure = sorted[worldDay % sorted.length] || sorted[0];
    return { deploy: true, beatType, alignment, tier: figure.legend.tier, figure, birthWeight: figure.legend.weight };
  }
  // no apt anchor → generate a fresh figure at the arc-appropriate tier
  return { deploy: true, beatType, alignment, tier, generate: true, birthWeight: tierBirthWeight(tier) };
}

function tierRank(tier) { return { riffraff: 0, notable: 1, regional: 2, epic: 3, legendary: 4 }[tier] ?? 1; }

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
  const practiced = opts.practiced instanceof Set ? opts.practiced : new Set();
  const dead = opts.deadIds instanceof Set ? opts.deadIds : new Set();
  const here = character?.currentLocationId;
  const teachers = [], forces = [];
  for (const f of roster) {
    if (dead.has(f.id)) continue;
    const atHome = !!(here && f.homeLocation && f.homeLocation === here);
    if (f.tradition && practiced.has(f.tradition) && teachers.length < 4) {
      const role = f.role || (f.alignment === "villain" ? "dark master" : "master");
      teachers.push(`- ${f.name} — the legendary ${role} of the ${f.tradition} craft${f.signature ? `: ${clampSig(f.signature)}` : ""}${atHome ? " — and a presence HERE" : ""}. Seeking them is the deep-teacher arc (SNG-203 Finding beat); the pursuit is the quest, woven in the fiction, never a menu.`);
    } else if (atHome && forces.length < 3) {
      forces.push(`- ${f.name}${f.role ? ` (${f.role})` : ""} — ${f.alignment === "villain" ? "a great adversary" : "a great figure"} whose presence touches this place. They want: ${clampSig(f.wants) || "their own ends"}. Aiding or opposing that want is a quest waiting — offer it in the fiction.`);
    }
  }
  if (!teachers.length && !forces.length) return null;
  const parts = [];
  if (teachers.length) parts.push(`LEGENDARY TEACHERS you could seek — the craft this character practices has great masters out there; pursuing one is an arc with the deepest teaching at its end (do not force it; offer the possibility when the fiction reaches for it):\n${teachers.join("\n")}`);
  if (forces.length) parts.push(`GREAT FIGURES near you — a want you could aid or oppose, the seed of a quest (in the fiction, never a list):\n${forces.join("\n")}`);
  return parts.join("\n\n");
}
