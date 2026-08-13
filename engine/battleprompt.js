// battleprompt.js — SNG-400b: the battle image is a PROMPT BUILD, not a string join.
//
// ⛔ AEVI NAMED THE FAILURE AND IT IS THE WHOLE REASON THIS FILE EXISTS. Her first design authored
// `combatPresence` as HALF a prompt, to be concatenated with the other half. Composed, that gave:
//
//   "Neth, Who Has Buried More Than She Has Known — master, a cut-thread motion that ends rather than
//    wounds; the one who attends an ending unsent-for AGAINST Morvane of the Harvest Hand — reaper, a
//    cut-thread motion that ends rather than wounds; the one who ends what she deems finished"
//
// "That is a list with a conjunction in it. No amount of authoring fixes a join — the prose was never
// going to work because CONCATENATION IS NOT COMPOSITION."
//
// So this does not join the halves. It SELECTS from each figure and puts them in grammatical relation,
// and the relation is the picture: one person does a thing, the other falls, in a place.
//
// ⛔ AND THE POWER IS THE SUBJECT, NOT DECORATION. "A death by The Cut Thread and a death by sonic
// resonance are different pictures." So the power leads the prompt and the figures are reduced to what
// they LOOK like while it happens. A build that puts the two names first is the old list again with
// better manners.
//
// ⚠️ SHORT IS THE REQUIREMENT, NOT A NICETY — "a long prompt averages into a generic picture, which is
// what the Thornmother card is already showing." Every component is clamped, and the whole is capped.
//
// PURE. No I/O, no model call, no randomness — the same fight composes the same prompt forever, which is
// the other half of Aevi's rule: "a re-rolling battle quietly says it was a different fight."

import { smartClamp } from "./namematch.js";

// Budgeted so the WHOLE survives: 100 + 65 + 65 + 35 + ~50 + separators sits under `whole`. ⚠️ These are
// not decorative — a clamp applied to the assembled string instead of its parts truncates from the END,
// which silently ate the place and the outcome in my first version.
const CAP = { look: 58, motion: 60, power: 95, place: 35, act: 42, whole: 400 };

/** Trim to whole clauses that FIT, never mid-phrase. ⚠️ A hard character clamp ends a prompt on "hands
 *  stained to the wrist, a…", and a trailing fragment is worse than a shorter sentence: the generator
 *  draws the dangling article as detail. Take comma-clauses while they fit and stop. */
function clause(text, cap) {
  const s = String(text || "").trim().replace(/\s+/g, " ");
  if (!s) return "";
  const first = s.split(/\s+[—–]\s+|[.;]\s+/)[0];
  if (first.length <= cap) return first.replace(/[.,;]$/, "");
  const out = [];
  for (const part of first.split(/,\s*/)) {
    const next = out.length ? `${out.join(", ")}, ${part}` : part;
    if (next.length > cap) break;
    out.push(part);
  }
  // ⚠️ Nothing fit: one long comma-less clause. Take it WHOLE rather than mid-word — the whole-prompt cap
  // still bounds the result, and an intact phrase that runs a little long beats a dangling fragment.
  return (out.length ? out.join(", ") : first).replace(/[.,;]$/, "");
}

// ⛔ THE PREAMBLE IS WHERE THE INDIVIDUAL LIVES, AND I THREW IT AWAY FIRST. Every authored appearance opens
// "A figure of the ashwarden, master among them: grey wool worn thin at the knees, hands stained…" — and
// I assumed the body after the colon was the person. It is NOT: the BODY IS SHARED BY TRADITION, and the
// distinguishing token is the ROLE in the preamble. Stripping it made Neth and Morvane — Aevi's own
// example, the two people most likely to kill each other — compose as the identical picture.
// ⚠️ That is her §2a failure exactly ("a shared-category attribute cannot distinguish members of that
// category"), reappearing inside the fix for it, from the opposite direction. So: keep both, compressed.
const CATEGORY_PREAMBLE = /^a\s+figure\s+of\s+the\s+([^,:]{1,40}?)(?:\s*,\s*([^:]{1,40}?)\s+among\s+them)?\s*:\s*/i;

/** SNG-400b §3: how a figure READS in a picture — their look, and the motion their craft makes.
 *  ⛔ `fightingStyle` is an INPUT, not a fragment of the output (Aevi's §2 demotion of combatPresence):
 *  one short clause about the MOTION, used as a figure's verb-phrase, never pasted in whole beside a name. */
export function figureLook(fig) {
  fig = fig || {};
  const raw = String(fig.appearance || fig.imagePrompt || fig.form || "").trim();
  const m = raw.match(CATEGORY_PREAMBLE);
  const who = m ? [m[2], m[1]].filter(Boolean).join(" ") : "";   // "master ashwarden"
  const body = clause(m ? raw.slice(m[0].length) : raw, CAP.look);
  // ⛔ AND EVEN WITH THE ROLE KEPT, TWO OF FIVE RIVAL PAIRS STILL COMPOSED AS A MIRROR — same tradition,
  // same role, same shared body. Aevi hit this exact wall and named the exact way out: individuate from
  // `offscreenVerbs[0]`, "which is authored per person. 66 distinct." Measured on the shipped roster:
  // appearance-body is shared by tradition, role is 50 distinct, archetype 52 — and offscreenVerbs[0] is
  // 66 of 66. It is the only field on these people that can tell any two of them apart, so it is the one
  // that goes in the picture.
  const act = clause((fig.offscreenVerbs || [])[0] || (fig.personalVerbs || [])[0], CAP.act);
  const look = [who, body, act].filter(Boolean).join(", ");
  return { name: fig.name || "someone", look, motion: clause(fig.fightingStyle, CAP.motion), act };
}

/** SNG-400b §3: the power, as the SUBJECT of the image. Prefers a real ability (what was actually cast),
 *  falls back to the killer's own fighting style (an offscreen legend clash has no ability roll — the
 *  authored style IS the resolution the world models at that scale), and finally to a plain violence.
 *  ⚠️ `shape` and `effectTags` are what make one craft LOOK different from another, so they lead over
 *  the description, which is written for a reader rather than a painter. */
export function powerPhrase(ability = null, killer = {}) {
  killer = killer || {};   // a null killer reaches here only on the fallback path; never throw mid-build
  if (ability) {
    const shape = clause(ability.shape, 40);
    const tags = (ability.effectTags || []).slice(0, 2).join(", ");
    const desc = clause(ability.description || ability.effect, CAP.power);
    const named = [shape, tags, desc].filter(Boolean).join(", ");
    return smartClamp(`${ability.name}${named ? ` — ${named}` : ""}`, CAP.power);
  }
  const style = clause(killer.fightingStyle, CAP.power);
  return style || "a killing blow";
}

/** How deep the ending ran — SNG-400b §3's "the outcome". A depth-0 death is a body and a stillness; a
 *  deep one is the dark actually showing. It changes the picture, so it is in the prompt. */
function depthNote(depth) {
  const d = Number(depth);
  if (!Number.isFinite(d) || d <= 0) return "the moment of the ending, still and unmistakable";
  if (d === 1) return "the ending going deeper than a body — the light already leaving the air";
  return "an ending that reaches past the body, the dark itself opening behind them";
}

/** ⛔ SNG-431 §3 — WHAT THE FIGHT ENDED AS, IN THE PICTURE. The builder framed EVERY fight as a death
 *  ("standing over" / "falling") because a death was the only clash that could be opened. Aevi's point is
 *  that the other three are the ones Erik actually sees, and a stalemate drawn as a killing is a lie in the
 *  one place the player is looking. Two words per outcome, in the same slots, so the composition below is
 *  unchanged — power first, then the hand, then the one it fell on, then the ground. */
const OUTCOME_FRAME = {
  killed:    { hand: "standing over",  other: "falling" },
  wounded:   { hand: "driving back",   other: "reeling, hurt, still on their feet" },
  stopped:   { hand: "checking",       other: "held, giving no ground" },
  stalemate: { hand: "locked against", other: "neither of them breaking" },
};

/** SNG-400b §3 — THE BUILD. One short image prompt, composed rather than joined.
 *  `{ victim, killer, ability, place, depth }`; killer null → the single-figure fallback (§4: "not every
 *  death is a killing", and the world has no illness, so the real fallback is a death with no named
 *  killer). Returns { prompt, kind } — kind is "battle" or "death" so the caller can size it. PURE. */
export function buildBattlePrompt({ victim = {}, killer = null, ability = null, place = "", depth = 0, outcome = "killed" } = {}) {
  const v = figureLook(victim);
  const where = clause(place, CAP.place);
  // §4 FALLBACK — one figure. An authored deathImagePrompt is a whole scene already; do not compose over it.
  if (!killer) {
    const authored = clause(victim.deathImagePrompt, CAP.whole);
    const body = authored || `${v.name}, ${v.look || "fallen"} — ${depthNote(depth)}`;
    return { kind: "death", prompt: smartClamp(`${body}${where ? `, at ${where}` : ""}`, CAP.whole) };
  }
  const k = figureLook(killer);
  const power = powerPhrase(ability, killer);
  // ⚠️ DO NOT SAY THE MOTION TWICE. With no ability, `powerPhrase` IS the killer's fightingStyle — so
  // repeating it as their verb-phrase put the identical clause in the prompt twice, which is the join
  // failure this file exists to replace, reappearing inside the replacement.
  const motionSaidAlready = !!k.motion && power.includes(k.motion);
  const hand = [k.look || k.name, motionSaidAlready ? "" : k.motion].filter(Boolean).join(", ");
  // ⛔ THE ORDER IS THE DESIGN: power first (it is the subject), then the hand that made it, then the one
  // it fell on, then the ground. Two figures in ONE relation — not two descriptions with "AGAINST" between.
  const frame = OUTCOME_FRAME[outcome] || OUTCOME_FRAME.killed;
  const parts = [
    power,
    `${hand}, ${frame.hand}`,
    `${v.look || v.name}, ${frame.other}`,
    where ? `at ${where}` : "",
    // ⚠️ THE DEPTH NOTE IS ABOUT AN ENDING. Appending "the moment of the ending, still and unmistakable"
    // to a fight nobody died in is the same category error as the frame it sits beside.
    outcome === "killed" ? depthNote(depth) : ""
  ].filter(Boolean);
  // ⚠️ `kind` IS THE FRAME, NOT THE OUTCOME. `art.js` sizes on it — battle is 1024×512 wide, death is
  // 768×512 — so a new "clash" kind would silently fall to the default portrait crop, which is the exact
  // failure the wide frame was added to fix ("a portrait crop of a fight shows one shoulder").
  return { kind: "battle", prompt: smartClamp(parts.join(", ").replace(/\s+/g, " "), CAP.whole) };
}

/** ⚠️ SNG-400b §3: "Cache on victimId|killerId|abilityId|worldDay — same fight, same picture, forever. A
 *  re-rolling battle quietly says it was a different fight." This IS that key, and it is also the image
 *  seed, so the stability is a property of the composition rather than of remembering to pass a seed. */
export function battleKey({ victimId = null, killerId = null, abilityId = null, worldDay = null, outcome = null } = {}) {
  // ⚠️ SNG-431 §3 adds the OUTCOME. The same two figures meet more than once — checked in spring, killed
  // in autumn — and without it both fights share one cached picture, so the second shows the first.
  // Appended, not inserted: an existing key keeps its identity, so no shipped battle image is orphaned.
  const base = [victimId || "?", killerId || "-", abilityId || "-", worldDay ?? "?"].join("|");
  return (!outcome || outcome === "killed") ? base : `${base}|${outcome}`;
}
