// imageprompt.js — CCODE-190: the composer. One sentence, from parts code selected.
//
// ⛔ ERIK, AFTER SEEING THE NUMBERS: "wire it. Do this for every image because i think it will be hugely
// valuable." The deterministic builders can SELECT the right fields; they cannot COMPOSE. Measured across
// 269 real fights built by `battleprompt.js` — a file written specifically to replace a string join:
//
//     median 14 comma clauses · 268 of 269 with eight or more · 248 of 269 repeating a word
//
//     "The Borne Bargain — reposition, sovereign abyssal, horned, dressed better than anyone expects,
//      closes a bargain that hollows someone, sovereign, bargain-marks lighting as they take, locked
//      against, investigator verist, nothing concealed, says the true thing no one wanted said, …"
//
// That is Aevi's original finding — *"a list with a conjunction in it"* — reappearing inside the fix for
// it, after two rounds of tightening the clamps. Four long authored fields per figure and one sentence of
// budget is a compression problem, and a third round of hand-tuning would have been the same move again.
//
// ⚠️ WHAT THIS IS NOT. It does not choose WHICH fields go in, or what the picture is about — the
// deterministic builder still owns that, and stays pure and tested. This takes the parts it selected and
// writes them as one line. Selection is the game's judgement; compression is the model's.
//
// ⛔ AND AEVI'S STABILITY RULE IS UNTOUCHED: *"Cache on victimId|killerId|abilityId|worldDay — same fight,
// same picture, forever. A re-rolling battle quietly says it was a different fight."* The composed line is
// cached against the deterministic prompt's own text, so a subject is composed ONCE, ever, and every later
// open reads it back. Determinism is a property of the cache, not of the composer — non-determinism never
// reaches the player.
//
// ⛔ AND IT NEVER BLOCKS A PICTURE. No key, no network, a refusal, a bad shape, a slow call — every path
// returns the deterministic prompt unchanged. This is the project's own law (a hiccup never blocks play)
// applied to a call that sits in front of an image the player is waiting on.

import { callClaude } from "./claude.js";
import { smartClamp } from "./namematch.js";

/** How long a composed line may be. Aevi's rule is that SHORT IS THE REQUIREMENT — *"a long prompt averages
 *  into a generic picture, which is what the Thornmother card is already showing"* — and the deterministic
 *  builders already cap around 400. The composer is asked for less than it is given, which is the point. */
// ⚠️ MODULE-LOCAL, NOT EXPORTED. Exported and imported-but-never-invoked, it trips the
// importedNeverCalled ratchet — a constant cannot be "called", so an exported one that only ever gets
// read looks identical to a dead export. The cap is enforced here and asserted behaviourally.
const COMPOSED_MAX = 240;

/** ⛔ CCODE-191 (Erik, on the first real results): "seems like you'll really need to start with the two
 *  figures if you want to get them both in."
 *
 *  He is right, and the pictures proved it: BOTH fights came back as ONE person. The composer was told it
 *  was compressing "a list of visual details" and had no idea two people were in the list, so it fused
 *  them — Neth's grey wool robes wearing the Choirmaster's mid-blow palm, in one body. That is
 *  `buildBattlePrompt`'s own design ("two figures in ONE relation") undone by the thing meant to serve it.
 *
 *  ⚠️ SUBJECT COUNT IS NOT A DETAIL, IT IS THE FRAME. An image model decides how many bodies to draw in
 *  the first few words, so the count has to lead — not appear as a subordinate clause ("opponent locked
 *  rigid") a third of the way in, which is what it produced and what got ignored.
 *
 *  ⚠️ AND ERIK'S SECOND HALF IS ALSO RIGHT — "not sure how effective it'll be though." Two distinct
 *  subjects is a known weak spot for image generators; leading with the count improves the odds, it does
 *  not guarantee two bodies. This is the best lever available at the prompt layer, honestly labelled. */
const SYSTEM_TWO = [
  "You compress details about TWO FIGHTING FIGURES into ONE image-generation prompt.",
  "",
  "RULES",
  "- Open with the two figures. The FIRST WORDS must establish that there are two people, e.g.",
  "  \"Two figures — a X, and a Y —\". An image generator decides how many bodies to draw from the",
  "  opening, so the count cannot appear later as a clause.",
  "- Keep each figure's details attached to THAT figure. Never merge one's clothing with the other's",
  "  motion. If you cannot tell whose a detail is, drop it rather than give it to the wrong body.",
  "- Then say what passes BETWEEN them: who acts, who receives, and how it ends.",
  "- One line. No preamble, no quotes, no explanation. Output the prompt and nothing else.",
  `- Under ${COMPOSED_MAX} characters.`,
  "- Keep concrete visual detail: materials, light, posture, motion. Drop repetition, mechanics, and",
  "  category words. Do NOT invent detail that is not in the input.",
  "- Write it as a phrase a painter could work from, not as a sentence about a painting.",
].join("\n");

/** ⚠️ NO `effort`, NO `thinking`. Both error or are ignored on Haiku 4.5, and neither is wanted for a
 *  compression: there is nothing to reason about, only something to say more tightly. */
const SYSTEM = [
  "You compress a list of visual details into ONE image-generation prompt.",
  "",
  "RULES",
  "- One line. No preamble, no quotes, no explanation. Output the prompt and nothing else.",
  `- Under ${COMPOSED_MAX} characters.`,
  "- Keep concrete visual detail: what is physically there, doing what, where. Colours, materials, light,",
  "  posture, motion. Those are the picture.",
  "- Drop repetition. If a word or idea appears twice, say it once.",
  "- Drop anything that is not visible: rules text, mechanics, costs, categories, names of systems.",
  "- Do NOT invent detail that is not in the input. If the input is thin, the prompt is short.",
  "- Keep proper names of people and places only where they carry a look; otherwise describe instead.",
  "- Write it as a phrase a painter could work from, not as a sentence about a painting.",
].join("\n");

/** A stable key for a composition. The deterministic prompt IS the input, so its own text is the identity:
 *  same parts in, same line out, forever — and a changed description re-composes exactly once. */
export function composeKey(deterministic, kind = "") {
  const s = `${kind}|${String(deterministic || "")}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return `cp${(h >>> 0).toString(36)}`;
}

/** ⛔ ONE SENTENCE, OR THE INPUT BACK. Never throws — a caller can always use what it gets.
 *
 *  @param deterministic the builder's own prompt: already selected, already floored, already correct
 *  @param cache         a plain object living on the character; composed lines are kept here by key
 *  @param kind          "battle" | "npc" | "location" | … — carried into the key, not into the prompt
 *  @returns { prompt, composed, key } — `composed` false means this is the deterministic line untouched
 */
export async function composeImagePrompt(deterministic, { cache = null, kind = "", subjects = 1, call = callClaude } = {}) {
  const base = String(deterministic || "").trim();
  // ⚠️ THE COUNT IS IN THE KEY. A fight composed as one figure before this fix must not be served from
  // cache as a two-figure fight, or the picture Erik already has would never be re-composed.
  const key = composeKey(base, `${kind}|${subjects >= 2 ? "2" : "1"}`);
  if (!base) return { prompt: base, composed: false, key };
  // ⚠️ THE CACHE IS CHECKED BEFORE ANYTHING ELSE, including the key check — a picture already composed must
  // never depend on the network again, or re-opening a saved fight could quietly change it.
  const hit = cache && cache[key];
  if (typeof hit === "string" && hit) return { prompt: hit, composed: true, key };
  // ⛔ SHORT ENOUGH ALREADY IS NOT A REASON TO SPEND A CALL. A one-clause prompt has nothing to compress,
  // and composing it would only add drift. Measured: this skips roughly the shortest tenth for free.
  if (base.length <= COMPOSED_MAX && (base.match(/,/g) || []).length < 6) {
    return { prompt: base, composed: false, key };
  }
  try {
    const two = subjects >= 2;
    const raw = await call([{ role: "user", content: base }], { task: "image-prompt", system: two ? SYSTEM_TWO : SYSTEM, maxTokens: 300 });
    const line = cleanComposed(raw, two);
    if (!line) return { prompt: base, composed: false, key };
    if (cache) cache[key] = line;
    return { prompt: line, composed: true, key };
  } catch (e) {
    // No key, offline, rate-limited, refused — the picture still gets drawn from what code built.
    console.warn("[imageprompt] compose skipped:", e?.message);
    return { prompt: base, composed: false, key };
  }
}

/** ⚠️ A MODEL ASKED FOR ONE LINE STILL SOMETIMES SAYS "Here's the prompt:". Strip the wrapper rather than
 *  trusting the instruction, and refuse anything that came back as prose ABOUT a prompt instead of one. */
export function cleanComposed(raw, twoFigures = false) {
  let s = String(raw || "").trim();
  s = s.replace(/^```[a-z]*\s*/i, "").replace(/\s*```$/, "");
  s = s.replace(/^(?:here(?:'s| is)[^:]*:|prompt:|image prompt:)\s*/i, "");
  s = s.replace(/^["'“”]+|["'“”]+$/g, "");
  s = s.split(/\r?\n/).map(x => x.trim()).filter(Boolean)[0] || "";
  s = s.replace(/\s+/g, " ").trim();
  // ⛔ A REFUSAL OR AN APOLOGY IS NOT A PROMPT. Returning one would put "I can't help with that" into an
  // image generator, which draws it.
  if (!s || s.length < 12) return "";
  if (/^(i (can'?t|cannot|won'?t|am unable)|sorry|as an ai|i'?m not able)/i.test(s)) return "";
  // ⛔ AND THE FRAME IS ENFORCED, NOT MERELY ASKED FOR. The model is instructed to lead with the count and
  // mostly will; when it does not, code puts it back rather than shipping a two-person fight as one body.
  // The division stays the same as everywhere else here: the model composes, code holds the invariant.
  if (twoFigures && !/^\s*(two|both|a pair)\b/i.test(s) && !/\b(two figures|both figures)\b/i.test(s)) {
    s = `Two figures — ${s.charAt(0).toLowerCase()}${s.slice(1)}`;
  }
  return smartClamp(s, COMPOSED_MAX);
}
