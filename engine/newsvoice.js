// newsvoice.js — SNG-433: the clash news, in Aevi's authored voice instead of four hardcoded sentences.
//
// ⛔ THE THREE QUESTIONS ERIK ASKED OF THE NEWS, AND AEVI'S ANSWER TO EACH. "Is it coherent? Interesting?
// Obvious why it's news?" — no, no and no. The engine's four lines were:
//
//     "The Choirmaster Who Would Not Return — The Choirmaster Who Would Not Return withdraws to lick
//      their wounds."          ⛔ THE FULL NAME TWICE, because the template was `${w} bested ${l} — ${l}…`
//     "Overseer Grael of the Edge District a daughter who thinks he is a clerk"     ⛔ NOT A SENTENCE
//
// Three fixes, all hers, all content: SHORT FORM ON SECOND MENTION · the RELATIONSHIP names why it is news
// (`rivals` is authored on 58 of 66 figures and has been read by nothing since SNG-208) · and the four
// outcomes carry four different CONSEQUENCES, where "withdraws to lick their wounds" read the same whether
// the loser was out eight days or had lost a war.
//
// ⚠️ THIS FILE HOLDS THE RULES, NOT THE WORDS. Every sentence a player reads comes from
// `rules/news_templates.json`. What is here is the four decisions the prose cannot make for itself: which
// variant, how a name shortens, whether a fragment is a verb or a noun, and when to drop a slot rather than
// print into it. PURE — no I/O, no rng, no clock.
//
// ⛔ AND NO RAW ID EVER REACHES A PLAYER. Aevi: *"`{place}` IS A DISPLAY NAME, NEVER AN ID, and when null
// the whole ' at {place}' is dropped rather than printing 'at null'. This is the 'the the_ceaseless' fault
// again."* Two separate defences, because they fail differently: `newsVoiceOf().place()` RESOLVES ids to
// display names, and `fillTemplate` REFUSES anything still id-shaped when it arrives. The first is the
// wiring; the second is what catches a caller that skipped it.

/** Words a name may not end on, and words a short form stops before. ⚠️ Aevi's rule after testing her
 *  FIRST rule on the real 66: *"'part before the comma, else last two words' produced 'Morvane of the' —
 *  IT CUT MID-PHRASE."* The stopword list is the fix; the tail list is the belt to its braces. */
const STOP_BEFORE = /^(of|who|that|whose|whom)$/i;
const NEVER_END_ON = /^(a|an|the|and|or|of|with|in|at|on|to|for|by|from)$/i;
const bare = (w) => String(w || "").replace(/[^A-Za-z']/g, "");

/** SNG-433 §2.1 — THE SHORT FORM, for the second mention. The corpus has three name shapes (9 with a comma,
 *  18 beginning "The", 3 plain) and one rule has to take all three:
 *
 *    1. a comma → everything before it.          "Neth, Who Has Buried…"        → "Neth"
 *    2. else → up to the first of/who/that.      "The Hollow King of the Wild Half" → "The Hollow King"
 *                                                "Morvane of the Harvest Hand"  → "Morvane"
 *    3. never end on an article or preposition — that is the whole "Morvane of the" class of bug.
 *    4. under 4 characters, or unchanged → THE FULL NAME. Some names do not shorten ("The Raw Chord",
 *       "The Starless One") and Aevi's ruling is that this is fine.
 *
 *  ⚠️ Measured across the shipped roster of 73: 0 cut on a stopword, 32 do not shorten. */
export function shortName(full) {
  const s = String(full || "").trim().replace(/\s+/g, " ");
  if (!s) return "";
  let cut;
  if (s.includes(",")) {
    cut = s.slice(0, s.indexOf(",")).trim();
  } else {
    const out = [];
    for (const w of s.split(" ")) { if (STOP_BEFORE.test(bare(w))) break; out.push(w); }
    cut = out.join(" ");
  }
  while (cut && NEVER_END_ON.test(bare(cut.split(" ").pop()))) cut = cut.split(" ").slice(0, -1).join(" ");
  return (!cut || cut.length < 4 || cut === s) ? s : cut;
}

/** SNG-433 §1 — WHY IT IS NEWS. *"A fight between rivals is not the same event as a fight between strangers,
 *  and the news must not report them in the same sentence."* `rivals` holds ids; MUTUAL is both directions. */
export function relationshipOf(a, b) {
  const aid = a?.id, bid = b?.id;
  if (!aid || !bid) return "stranger";
  const aKnows = (a?.rivals || []).includes(bid);
  const bKnows = (b?.rivals || []).includes(aid);
  return aKnows && bKnows ? "mutual" : (aKnows || bKnows) ? "rival" : "stranger";
}

/** ⛔ THE ENGINE SAYS "stopped"; THE AUTHOR WROTE "checked". Two vocabularies for one outcome, and an
 *  unmapped lookup returns undefined and falls silently back to the hardcoded sentence — which is the whole
 *  failure mode this ticket exists to end. The map is explicit and gated: every outcome the engine can
 *  produce must name a block the authored file actually has. */
export const OUTCOME_TEMPLATE_KEY = { killed: "killed", wounded: "wounded", stopped: "checked", stalemate: "stalemate" };

/** ⛔ AN ID IS NOT A PLACE. "at the_ceaseless" is the machine talking in a sentence a player reads, and it
 *  has shipped before. A lower-case token with underscores and no spaces is an id; refuse it. */
const LOOKS_LIKE_ID = /^[a-z0-9]+(?:_[a-z0-9]+)+$/;
export const isIdShaped = (s) => LOOKS_LIKE_ID.test(String(s || "").trim());

/** Fill one authored template. A missing `place` removes the whole " at {place}" phrase rather than leaving
 *  "at null"; a missing `power` empties the slot (callers choose a non-`_power` variant instead). */
export function fillTemplate(tpl, { W = "", L = "", place = null, power = null, frag = "" } = {}) {
  let s = String(tpl || "");
  if (!s) return "";
  const p = place && !isIdShaped(place) ? String(place).trim() : null;
  if (!p) s = s.replace(/ at \{place\}/g, "").replace(/ from \{place\}/g, "");
  return s
    .replace(/\{W\}/g, W)
    .replace(/\{L\}/g, L)
    .replace(/\{w\}/g, shortName(W))
    .replace(/\{l\}/g, shortName(L))
    .replace(/\{place\}/g, p || "")
    .replace(/\{power\}/g, power || "")
    .replace(/\{frag\}/g, String(frag || "").trim().replace(/[.\s]+$/, ""))
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** A stable 0..n-1 draw from a key. ⚠️ NOT `rng()`. A news line is re-read, and a fight is re-opened from
 *  it — the same event must say the same words every time, which is the same rule that makes `signatureOf`
 *  a hash rather than a roll. */
export function pickIndex(key, n) {
  const s = String(key || "");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return n > 0 ? (h >>> 0) % n : 0;
}

/** SNG-433 §3 — ONE CLASH LINE, from the authored templates. Returns null when there is nothing authored to
 *  render with, so the caller can fall back rather than print an empty string.
 *
 *  ⚠️ THE POWER IS A DETAIL THE TELLER HAPPENED TO KNOW, NOT A STAT LINE. Aevi asks for the `_power` variant
 *  *"roughly one time in three"* when an ability exists — deterministically, per fight. */
export function clashLine({ templates, outcome, winner, loser, place = null, power = null } = {}) {
  const key = OUTCOME_TEMPLATE_KEY[outcome];
  const block = key ? templates?.[key] : null;
  if (!block) return null;
  const variant = relationshipOf(winner, loser);
  const usePower = !!power && block._power && pickIndex(`${winner?.id}|${loser?.id}|${outcome}`, 3) === 0;
  const tpl = usePower ? block._power : (block[variant] || block.stranger);
  if (!tpl) return null;
  return fillTemplate(tpl, { W: winner?.name || "someone", L: loser?.name || "someone", place, power });
}

/** SNG-433 §2.2 — WHICH GRAMMAR THE FRAGMENT IS.
 *
 *  ⛔ AEVI'S SHAPE TEST IS RIGHT AND HER FIELD HINT IS BACKWARDS, AND THE CONTENT SAYS SO. Her `_when` for
 *  the verb form reads *"ends in 's' on the first word, OR IS IN `personalVerbs`"* — but measured across the
 *  shipped roster, `personalVerbs` is 219 fragments and **0 of them are verbs**: "going where she is needed
 *  and arriving late", "not forgiving herself for the last one". The verbs live in `offscreenVerbs`
 *  (197 of 217), which this news site does not read. Implementing the field half of her rule would have sent
 *  all 219 gerunds down the verb path and produced "Sister Alder going where she is needed" — the exact
 *  sentence this ticket is fixing. So the SHAPE decides, and only the shape.
 *
 *  ⚠️ AND IN DOUBT, NOUN. *"'{W} is spoken of: {frag}' is grammatical for BOTH shapes, and a slightly stiff
 *  sentence beats a broken one."* */
export function fragmentForm(frag) {
  const s = String(frag || "").trim();
  if (!s) return "nounForm";
  if (/^(a|an|the)\b/i.test(s)) return "nounForm";        // an article can only open a noun phrase
  const first = bare(s.split(/\s+/)[0]);
  return (/s$/i.test(first) && !/ss$/i.test(first)) ? "verbForm" : "nounForm";
}

/** SNG-433 §3.4 — the offscreen personal beat, as a sentence. The shipped line was `${name} ${fragment}`,
 *  which is Aevi's "Overseer Grael of the Edge District a daughter who thinks he is a clerk" verbatim. */
export function fragmentLine({ templates, name, frag, place = null } = {}) {
  const form = fragmentForm(frag);
  const block = templates?.[form] || templates?.nounForm;
  if (!block?.template) return null;
  const p = place && !isIdShaped(place) ? place : null;
  const useAlt = !!(p && block.alt) && pickIndex(`${name}|${frag}`, 3) === 0;
  return fillTemplate(useAlt ? block.alt : block.template, { W: name || "Someone", place: p, frag });
}

/** The bag the world tick reads: the authored templates, plus the two lookups that turn an id into
 *  something a player may see. Memoised per content bag — it is loaded once and shared, and four clash
 *  sites rebuilding it per fight is the same waste `abilityIndexOf` avoids.
 *
 *  ⛔ ONE RESOLVER, NOT FOUR. Four call sites resolve clashes, and three of them were missing fields for
 *  exactly as long as there were three copies of the answer. */
const _voice = new WeakMap();
export function newsVoiceOf(content) {
  if (!content || typeof content !== "object") return { templates: null, fragments: null, place: () => null, power: () => null };
  const hit = _voice.get(content);
  if (hit) return hit;
  const doc = content.rules?.newsTemplates || null;
  const v = {
    templates: doc?.templates || null,
    fragments: doc?.fragments || null,
    // ⛔ DISPLAY NAME OR NOTHING. A location the pack does not have resolves to null and the phrase is
    // dropped — never to the id, which is what "at the_ceaseless" was.
    place: (id) => {
      const n = id ? (content.locations?.[id]?.name || null) : null;
      return n && !isIdShaped(n) ? n : null;
    },
    // The ability's NAME, not its description: `{power}` sits in four grammatical frames in the authored
    // templates ("with {power}", "— {power}.", "— {power} —", "{power} was not enough") and only a noun
    // phrase works in all four. A description is a sentence and breaks three of them.
    power: (id) => (id ? (content.abilities?.[id]?.name || null) : null),
  };
  _voice.set(content, v);
  return v;
}
