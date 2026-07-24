// encounterFrame.js — SNG-230 Phase 1: the ENCOUNTER FRAME model (the shape contract).
//
// Erik: "Make encounters OBVIOUS. If a fight, a chase, a puzzle — anything with structured movement — the game
// makes it obvious. Once you hit an encounter you either FLEE it, DEFEAT it, or FAIL it."
//
// This is the PURE model behind that grammar. Given an encounter (its def + live state, and optionally the
// source table entry), it produces the KIND-THEMED frame descriptor the UI renders: the title, the stated WIN
// CONDITION, the meter's meaning, and the THREE EXITS (defeat / flee / fail) — each with what it MEANS and, where
// the player can choose it, the engine action the UI wires it to. One frame, themed by KIND; the three exits are
// ALWAYS described (the grammar is the point — §Guard).
//
// It is the CONTRACT both the render (Erik's visual — a full takeover like skill_battle, or a compact banner)
// and the content (Aevi's per-kind copy + new PUZZLE/STANDOFF kinds) build against. Pure over its inputs — no
// DOM, no globals, no engine calls. The UI reads the descriptor and wires each exit's `action` to the EXISTING
// encounter round path ([data-encact]: stage/attempt → defeat; abandon/walkAway → flee; yield → fail).
//
// The FIGHT kind (a duel in mode:"skill_battle") is ALREADY framed by renderSkillBattle — the reference the spec
// says to GENERALIZE, not re-tune. frameModel describes fight too (so §6 chaining has one grammar), but the fight
// keeps its own richer panel; this model drives the kinds that had NO frame (chase / hazard / puzzle).
//
// SPEC CORRECTIONS baked in (verified against the code, 2026-07-24): the staged builder is
// `synthesizeChallengeDef` (there is no `buildStagedDef`); challenge state is {stageIndex, stagesDone[]}; the
// perilous-triage constant is random_encounters.PERILOUS.

// One frame, themed per KIND. Aevi owns the richer COPY (titles / verbs / meter labels) and the new kinds; this
// default set makes the frame legible before she authors per-kind framing. `win` is the stated win-condition —
// "what resolving it MEANS" (§2.2), never a mystery.
export const FRAME_KINDS = {
  fight:    { icon: "⚔", title: "A Hostile Meeting", win: "Defeat the thing — or drive it off.",           meterLabel: "Momentum" },
  chase:    { icon: "🏃", title: "The Chase",   win: "Catch them — or shake free and get away.",       meterLabel: "Ground gained" },
  hazard:   { icon: "⚠", title: "Hard Ground",       win: "Cross it — reach the far side.",                  meterLabel: "Progress across" },
  puzzle:   { icon: "🧩", title: "The Sealed Thing", win: "Solve it — find the way through.",           meterLabel: "Insight" },
  standoff: { icon: "🗣", title: "A Standoff",  win: "Win the exchange — bend their resolve.",          meterLabel: "Their resolve" },
};

// THE FRAME IS A LEGIBILITY LAYER, NOT A CLOSED MINI-GAME (Erik, 2026-07-24). The bounded thing and its three
// exits are surfaced for CLARITY — but the real interaction stays what it always was: the GM offers options AND
// the player can describe ANY move in the freefield, which is resolved AGAINST the current stage (a freeform
// action runs through the same round path as the exit buttons — the buttons are just shortcuts) and the GM
// narrates the outcome and the next step. This cue rides on every frame so that never reads as buttons-only.
export const FRAME_FREEFORM_CUE = "Or describe your own move below — the exits are shortcuts; the GM resolves whatever you try, against the stage.";

// SNG-230 §6a: FRAMES CHAIN. An exit is not always an END — for some kinds it TRANSITIONS into another frame,
// its own three exits, its own stages. Fleeing a FIGHT doesn't teleport you away; it turns the encounter into a
// CHASE (win the chase → you got away; fail it → back to the fight, or fail). "The transition graph is the
// system." Authored as DATA so a new kind declares its own chains. null/absent = that exit just ends.
export const FRAME_TRANSITIONS = {
  fight: { flee: "chase" },   // break from a fight → you're being chased
  chase: { fail: "fight" },   // caught → you have to fight (or fail outright if position was lost)
};

/** SNG-230 §6a: what a given exit does from a given kind — the next frame KIND to transition INTO, or null when
 *  the exit simply ends the encounter (its normal outcome). Pure. */
export function frameTransition(kind, exitRole) {
  return FRAME_TRANSITIONS[kind]?.[exitRole] || null;
}

/** SNG-230 §6a (behavior): fleeing a fight becomes a CHASE — build the chase encounter def from the fight, so
 *  breaking off is a real playable sequence with stakes, not a teleport. Carries `_chainedFrom` so a caught
 *  chase (abandon) knows which fight to drop back into. The chase is a normal `challenge` (its stages drive the
 *  existing round path; the freefield + GM narrate it like any encounter). Pure — the app persists it + starts
 *  it. The opponent rides along as the pursuer. */
export function chaseFromFight(fightDef) {
  const oppName = fightDef?.opponent?.name || fightDef?.name || "your foe";
  return {
    schemaVersion: 1,
    id: `chase-${fightDef?.id || "fight"}`,
    type: "challenge",
    flavor: "chase",
    name: `The Chase — ${oppName}`,
    setup: `You break off — ${oppName} gives chase across the broken country. Lose them, or be run down.`,
    fromRandom: true,
    danger: [fightDef?.danger, fightDef?.minDanger].find(d => Number.isFinite(d)) ?? null,
    // the fight to fall back into if caught (the def stays in customEncounters; the pursuer's name for narration)
    _chainedFrom: { kind: "fight", fightDefId: fightDef?.id || null, opponentName: oppName },
    stages: [
      { name: "Break line of sight", attribute: "physical", subAttribute: "agility", axes: {}, difficulty: 8, failureCost: { health: 2, energy: 4, hours: 0 } },
      { name: "A burst through the broken country", attribute: "physical", subAttribute: "agility", axes: {}, difficulty: 12, failureCost: { health: 2, energy: 4, hours: 0 } },
      { name: "Lose them — or be run down", attribute: "physical", subAttribute: "wits", axes: {}, difficulty: 16, failureCost: { health: 3, energy: 4, hours: 0 } },
    ],
  };
}

// ---------- SNG-230 §6b/§7a: a SKILL can COLLAPSE or MORPH the frame ----------
// Some crafts don't grind the meter — they try to END the encounter in ONE beat (Cut the Thread, a transit
// craft slipping a chase, a KNOW craft cracking a puzzle). This is NOT an auto-win: it resolves along the
// resolver's degree bands, and a foe too great can't be one-beat-ended (you fight the stages). All pure.

const DEGREE_RANK = { crit_failure: 0, failure: 1, partial: 2, success: 3, crit_success: 4 };

/** §6c / OQ6 + Erik (easier vs weaker foes): how EASILY a foe collapses — the degree AT OR ABOVE which a
 *  finisher ends it in one beat. A riffraff drops on a solid hit (`success`); a notable needs a clean crit; the
 *  great ones (epic/regional/danger-4) never collapse (null) — you fight them through. Tier first, then danger.
 *  Pure over the def's size signal. */
export function collapseFloor(def) {
  const tier = def?.tier || null;
  if (tier === "epic" || tier === "regional") return null;
  if (tier === "riffraff") return "success";
  if (tier === "notable") return "crit_success";
  const danger = [def?.danger, def?.minDanger, def?.dangerLevel].find(d => Number.isFinite(d));
  if (Number.isFinite(danger)) return danger >= 4 ? null : danger >= 2 ? "crit_success" : "success";
  return "crit_success"; // unknown → conservative (a clean crit only)
}

/** §6c: can this frame be ENDED in one beat AT ALL (by a good enough finisher)? A foe with no collapse floor
 *  (epic/regional/danger-4) never can — surfaced so the frame can say "too great to end in one stroke". Pure. */
export function frameCollapsible(def) {
  return collapseFloor(def) !== null;
}

/** §6c: which crafts can ATTEMPT a collapse — FAMILY-driven (no per-ability list; per the P1 correction there is
 *  no FINISH family, so a HARM craft is the finisher). A HARM craft tries to END a fight/hazard in one decisive
 *  blow; a MOVE/transit craft tries to slip a CHASE into an instant escape; a KNOW craft tries to crack a PUZZLE
 *  outright. Returns the collapse mode for (families, kind), or null. Pure. */
export function collapseMode(families, kind) {
  const fam = new Set(Array.isArray(families) ? families : []);
  if (kind === "chase" && fam.has("MOVE")) return "escape";
  if (kind === "puzzle" && fam.has("KNOW")) return "solve";
  if ((kind === "fight" || kind === "hazard" || kind === "standoff") && fam.has("HARM")) return "finish";
  return null;
}

/** §7a (Erik: mitigated below a finish): the finisher resolves ALONG the resolver's degree bands, against the
 *  foe's collapse `floor`. At/above the floor → COLLAPSE (instant end). BELOW it, the finisher is MITIGATED —
 *  a hard/partial hit that advances but doesn't end; a whiff MORPHS (the botch hardens it / backfires). A foe
 *  with no floor (too great) never collapses, however clean the strike. `floor` comes from collapseFloor(def) —
 *  weaker foes have a lower floor, so a good-but-not-crit roll can still drop them. Returns one of:
 *  "collapse" | "hard" | "partial" | "morph" | "morph_bad". Pure. */
export function collapseResult(degree, { floor = "crit_success" } = {}) {
  const r = DEGREE_RANK[degree] ?? DEGREE_RANK.partial;
  if (floor && r >= DEGREE_RANK[floor]) return "collapse";
  if (degree === "crit_success" || degree === "success") return "hard";
  if (degree === "partial") return "partial";
  if (degree === "failure") return "morph";
  return "morph_bad"; // crit_failure
}

/** §6b in the SKILL-BATTLE meter (Erik: a good roll can end a fight too): map a battle round's momentum SWING
 *  (delta, vs meterMax) to a pseudo-degree, so a decisive finisher blow reads as crit/success and a glancing
 *  one as partial/failure — then collapseResult(floor) decides. Keeps the ordinary meter untouched (§89): this
 *  only ever ENDS a fight EARLY on a strong finisher against a collapsible foe; lesser swings run the meter. */
export function swingDegree(delta, meterMax) {
  const f = meterMax > 0 ? (delta || 0) / meterMax : 0;
  if (f >= 0.6) return "crit_success";
  if (f >= 0.35) return "success";
  if (f >= 0.15) return "partial";
  return "failure";
}

// ---------- SNG-230 §7b/§7c: the frame READS the situation — wards GATE what's possible, the KIT can VOID a premise ----------
// The same encounter is a trivial walk-around for one character, a graded fight for another, and an impossible
// wall for a third (warded against their one trick). Both are CONTENT-DRIVEN (Aevi authors the ward/premise
// fields); absent them, these are no-ops. All pure.

/** §7b: does a WARD on the target FORBID a collapse mechanic OUTRIGHT (a gate, not a modifier)? A target declares
 *  `wards: [{ denies:[modes|"instant_end"|"collapse"], breakDC, name }]` — a Death-Ward denies "finish", a
 *  mind-ward denies "sway", a movement-ward denies "escape". Returns {denied, breakDC, name}; when denied the
 *  collapse is OFF THE TABLE unless the roll DEMOLISHES the ward (wardBroken). Absent a ward → not denied. Pure. */
export function wardAgainst(def, mode) {
  const wards = def?.wards || (def?.ward ? [def.ward] : []);
  for (const w of wards) {
    const d = w?.denies || [];
    if (d.includes(mode) || d.includes("instant_end") || d.includes("collapse")) {
      return { denied: true, breakDC: Number.isFinite(w.breakDC) ? w.breakDC : Infinity, name: w.name || null };
    }
  }
  return { denied: false, breakDC: 0, name: null };
}

/** §7b: a denying ward BREAKS only under a DEMOLISHING roll — a crit_success whose margin exceeds the ward's
 *  breakDC. Anything less and the instant-end simply does not happen (the finisher may still do ordinary damage
 *  per §7a, but the collapse mechanic is unavailable). Pure. */
export function wardBroken(degree, margin, breakDC) {
  return degree === "crit_success" && (margin ?? 0) >= (breakDC ?? Infinity);
}

/** §7c: does the player's KIT void this challenge's PREMISE — making it trivial? A challenge declares
 *  `trivializedBy: [families]` (families that remove its obstacle — a MOVE/fly craft voids a climb) + an optional
 *  `resistDC` (a hardness above which even the voiding kit must ROLL, opposed, instead of walking around it).
 *  Returns "trivial" (premise voided + soft → bypass, NO roll, a narrated walk-around), "opposed" (voided but the
 *  challenge RESISTS → an opposed roll), or null (the kit doesn't void it → normal stages). Absent the content →
 *  null. Pure. */
export function trivializes(def, kitFamilies) {
  const by = def?.trivializedBy || [];
  if (!by.length) return null;
  const kit = new Set(Array.isArray(kitFamilies) ? kitFamilies : []);
  if (!by.some(f => kit.has(f))) return null;
  return (Number.isFinite(def?.resistDC) && def.resistDC > 0) ? "opposed" : "trivial";
}

/** Which frame KIND an encounter is. def.type is the structural truth (duel/challenge/puzzle); flavor themes the
 *  challenge kinds (chase vs. hazard). Returns null for an encounter that gets no frame. Pure. */
export function encounterKind(def, entry = null) {
  const type = def?.type || null;
  const flavor = def?.flavor || entry?.flavor || null;
  if (type === "duel") return "fight";
  if (type === "puzzle") return "puzzle";
  if (type === "standoff") return "standoff";
  if (type === "challenge") {
    if (flavor === "chase") return "chase";
    if (flavor === "dangerous") return "hazard";
    return "hazard"; // a generic challenge reads as hard ground
  }
  return null;
}

// NOTE (later phase): promoting the 27 PERILOUS narrative encounters (dangerous/theft/chase/fight) into framed
// kinds — the `shouldFrame(entry)` triage over random_encounters.PERILOUS — lands when narrative-promotion is
// built (it needs an activeEncounter to frame, which those rows don't yet mint). Phase 1 frames the encounters
// that ALREADY carry structured state (duel / challenge / puzzle); frameModel returns null for the rest.

/** The meter — how far through the bounded thing you are (0..100) + its label. Per kind, read from the LIVE
 *  state. challenge (chase/hazard): stages cleared / total. puzzle: solved-or-not. fight: momentum (skill_battle
 *  owns its own; exposed here only for the shared grammar). Tolerant of missing state. Pure. */
function frameMeter(kind, def, state) {
  const total = def?.stages?.length || 0;
  if (kind === "chase" || kind === "hazard") {
    const done = (state?.stagesDone?.length ?? state?.stageIndex ?? 0);
    return { pct: total ? Math.round((Math.min(done, total) / total) * 100) : 0, label: FRAME_KINDS[kind].meterLabel, done, total };
  }
  if (kind === "puzzle") {
    return { pct: state?.solved ? 100 : 0, label: FRAME_KINDS.puzzle.meterLabel, done: state?.hintsRevealed || 0, total: null };
  }
  if (kind === "standoff") {
    const done = (state?.stagesDone?.length ?? state?.stageIndex ?? 0);
    return { pct: total ? Math.round((Math.min(done, total) / total) * 100) : 0, label: FRAME_KINDS.standoff.meterLabel, done, total };
  }
  // fight — momentum runs -meterMax..+meterMax; normalize to 0..100 for the shared grammar (skill_battle draws its own)
  const mm = def?.momentum?.meterMax ?? 10;
  return { pct: Math.round((((state?.momentum ?? 0) + mm) / (2 * mm)) * 100), label: FRAME_KINDS.fight.meterLabel };
}

/** THE THREE EXITS — always described (the grammar §2.3). Each carries its ROLE, what it MEANS, and — where the
 *  player can CHOOSE it — the engine `action` the UI wires to the existing [data-encact] path. DEFEAT is the path
 *  through (attempt the current stage / strike). FLEE breaks away at a cost (abandon / turn back / walk away).
 *  FAIL for a FIGHT is a chooseable Yield; for the other kinds it is the OUTCOME of losing the stages (reached,
 *  not clicked) — so it has no button, and its stakes are surfaced instead (a frame with no visible fail is a
 *  formality; here fail is legible as what losing costs). Pure. */
export function frameExits(kind, def, state) {
  const stageName = def?.stages?.[state?.stageIndex ?? 0]?.name || null;
  const defeat = ({
    fight:    { label: "Strike",                    action: "strike",  means: "Defeat it." },
    chase:    { label: stageName || "Push the chase", action: "stage", means: "Catch or shake free — you get away clean." },
    hazard:   { label: stageName || "Push on",      action: "stage",   means: "Cross it — reach the far side." },
    puzzle:   { label: "Work it",                   action: "attempt", means: "Solve it — the way opens." },
    standoff: { label: stageName || "Press your point", action: "stage", means: "Win the exchange." },
  })[kind] || { label: "Press on", action: "stage", means: "Push through it." };
  const flee = ({
    fight:    { label: "Break away", action: "flee",     means: "Break off — but the thing may follow." },
    chase:    { label: "Give up the pursuit", action: "abandon", means: "Let them go." },
    hazard:   { label: "Turn back", action: "abandon",   means: "Back off the crossing — no toll, no progress." },
    puzzle:   { label: "Leave it", action: "walkAway",   means: "Walk away — it stays sealed." },
    standoff: { label: "Withdraw", action: "abandon",    means: "Break off the exchange." },
  })[kind] || { label: "Break away", action: "abandon", means: "Break off." };
  const fail = kind === "fight"
    ? { label: "Yield", action: "yield", means: "Give up — you're overcome." }
    : { label: null,    action: null,    means: "Lose the stages and it takes its toll." };
  const exits = [
    { role: "defeat", ...defeat },
    { role: "flee", ...flee },
    { role: "fail", ...fail },
  ];
  // SNG-230 §6a: surface where an exit CHAINS (frames chain — fleeing a fight becomes a chase; a caught chase
  // becomes a fight). The exit carries `chainTo` and its `means` names the next frame, so the player SEES the
  // chain before choosing it. This is the legibility half of §6a; the behavior wiring (actually starting the
  // chained encounter) is the next slice — the graph + this surface are what it builds on.
  for (const ex of exits) {
    const to = frameTransition(kind, ex.role);
    if (to) { ex.chainTo = to; ex.means = `${ex.means} → it becomes ${FRAME_KINDS[to]?.title || to}.`; }
  }
  return exits;
}

/** SNG-230 Phase 1b (Erik's OQ1 = size by tier): how BIG a frame presents — a full "takeover" card that takes
 *  the surface for the weighty ones (regional/epic tier, or danger ≥ 3, or a long multi-stage challenge), a
 *  compact inline "banner" for the small ones (a spooked animal, a pickpocket). "A takeover for a pickpocket is
 *  noise" — the weight fits the stakes. Reads whatever size signal the def carries (bestiary `tier`, a stamped
 *  `danger`/`minDanger`, else the stage count as a proxy). Pure; defaults to the lighter "banner". */
export function frameSize(def, state = {}) {
  const tier = def?.tier || null;
  if (tier === "regional" || tier === "epic") return "takeover";
  if (tier === "riffraff" || tier === "notable") return "banner";
  const danger = [def?.danger, def?.minDanger, def?.dangerLevel].find(d => Number.isFinite(d));
  if (Number.isFinite(danger)) return danger >= 3 ? "takeover" : "banner";
  const stages = def?.stages?.length || 0;   // no explicit signal: a long challenge reads as big, a short one small
  return stages >= 4 ? "takeover" : "banner";
}

/** The full frame descriptor the UI renders — the one object the render (Erik) and content (Aevi) build against.
 *  Returns null when the encounter isn't framed. Pure. */
export function frameModel(def, state = {}, entry = null) {
  const kind = encounterKind(def, entry);
  if (!kind) return null;
  const theme = FRAME_KINDS[kind];
  const staged = kind === "chase" || kind === "hazard" || kind === "standoff";
  return {
    kind,
    icon: theme.icon,
    title: def?.name || theme.title,
    winCondition: theme.win,
    meter: frameMeter(kind, def, state),
    exits: frameExits(kind, def, state),
    freeform: FRAME_FREEFORM_CUE, // the frame is a legibility layer — freeform play + the GM stay the real interaction
    // §6b/§7a: whether a decisive finisher could END this in one beat (a foe too great can't be) — surfaced so
    // the player knows the gamble is on the table. The actual collapse resolves along the degree bands.
    collapsible: frameCollapsible(def),
    // §7b: whether a WARD guards it (a finisher can't end it unless the ward shatters) — Aevi content; false absent one.
    warded: !!(def?.wards?.length || def?.ward),
    stage: staged
      ? { index: state?.stageIndex ?? 0, total: def?.stages?.length || 0, name: def?.stages?.[state?.stageIndex ?? 0]?.name || null }
      : null,
    // FAIL is a branch, not a wall (§Guard): what losing the current stage costs, surfaced so the stakes are legible.
    failStakes: def?.stages?.[state?.stageIndex ?? 0]?.failureCost || null,
  };
}
