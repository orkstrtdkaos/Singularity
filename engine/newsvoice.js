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
import { walkingDays } from "./worldmap.js";   // CCODE-367: how near a piece of news happened

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

/** ⛔ SNG-596 — A STRIKE IS NEWS, AND SAYS IT WAS ONE. Erik, reading the world tab: "I see that certain people are being subject
 *  to Strikes — which is fantastic… but I don't see those surfacing in the news?"
 *
 *  ⚑ MEASURED ON THE LIVE SAVES, 14 strikes across 10: the 9 that LANDED were in the news all along — as a duel line ("The One
 *  With a Hundred Faces turned Halvex Coil, the Rewriter back at The Service Ways") that never says a strike happened, so nobody
 *  could find one; the 5 a GUARD turned aside produced nothing at all.
 *
 *  ⛔ AND THEN, ERIK AGAIN: "dont' just say 'came quietly' — try to get the flavor of who was sent included... was it an Umbral
 *  Assassin who used darkness, a radiant sniper, a marcher who tried a direct assault? how did they escape or win, did they have
 *  help, who and how?" ⛑ ALL OF IT IS ALREADY AUTHORED, and none of it was read here: 66 of 70 legends carry a `fightingStyle`
 *  written as "role, how" ("devourer, fighting from the dark they brought"; "builder, ending it with mass"), every tradition
 *  has its name, and the resolver already picks each side's signature power deterministically. So a strike says WHO came (a
 *  devourer of the Umbrals), HOW (their authored manner, and the power), who STOOD IN THE WAY and how, and what it cost: a quiet
 *  striker turned aside gets away but not unseen, which is exactly what exposure is. ⚠️ "Did they have help" is honest: the
 *  world sim sends a striker ALONE — the only help in a strike is the guard, and the line names them. Nothing is invented.
 *
 *  ⚠️ THE WORDS ARE AEVI'S ("say which shapes you are emitting and I will write the lines"). An authored
 *  `templates.strike.<quiet|crusade>.<killed|wounded|checked|stalemate|guarded|turned>` — a string or a list — wins; these are
 *  the engine's fallback until then. Slots: {S} {T} {G} sender, target, guard · {s} {t} {g} short forms · {sWho} {tWho} {gWho}
 *  ("a devourer of the Umbrals") · {sHow} {tHow} {gHow} (the authored manner) · {power} (the striker's) · {gPower} (the
 *  guard's) · {place} · {arc}. ⛑ A segment in [square brackets] is kept only when every slot inside it has a value, so a
 *  minted figure with no fighting style reads cleanly instead of printing an empty comma. `turned` is a strike turned aside
 *  with no guard the news may name. */
export const STRIKE_FALLBACK = {
  quiet: {
    killed: "A strike[ over {arc}]: {S}[, {sWho},] came for {T}[ at {place}][, {sHow}][, with {power}] — and {t} is dead.",
    wounded: "A strike[ over {arc}]: {S}[, {sWho},] came for {T}[ at {place}][, {sHow}][, with {power}]. {t} lived, and is hurt.",
    checked: "A strike[ over {arc}]: {S}[, {sWho},] came for {T}[ at {place}][, {sHow}][, with {power}], and checked {t} — that work is held for now.",
    stalemate: "A strike[ over {arc}]: {S}[, {sWho},] came for {T}[ at {place}][, {sHow}] — and {t} stood[, {tHow}]. Neither broke.",
    guarded: "A strike[ over {arc}], turned aside: {S}[, {sWho},] came for {T}[, {sHow}] — and {G}[, {gWho},] stood in the way[, {gHow}][, with {gPower}]. {s} got away, but not unseen.",
    turned: "A strike[ over {arc}], turned aside: {S}[, {sWho},] came for {T}[, {sHow}], and did not reach them. {s} got away, but not unseen.",
  },
  // ⛔ CCODE-366 — Erik: "i'll let the flavor of the striker guide whether they let it be known or steal away without a trace."
  // A quiet strike that LANDS leaves no name (`strikeTraceOf`): the world knows the place, the manner and the power — never who.
  unseen: {
    killed: "A strike[ over {arc}]: someone came for {T}[ at {place}][, {sHow}][, with {power}] — and {t} is dead. Nobody saw who.",
    wounded: "A strike[ over {arc}]: someone came for {T}[ at {place}][, {sHow}][, with {power}]. {t} lived, and is hurt — and nobody saw who.",
    checked: "A strike[ over {arc}]: someone came for {T}[ at {place}][, {sHow}][, with {power}], checked {t}, and was gone without a trace.",
    stalemate: "A strike[ over {arc}]: someone came for {T}[ at {place}][, {sHow}] — and {t} stood[, {tHow}]. Whoever it was left no trace.",
  },
  crusade: {
    killed: "{S}[, {sWho},] came openly for {T}[ over {arc}][ at {place}][, {sHow}][, with {power}] — and {t} is dead.",
    wounded: "{S}[, {sWho},] came openly for {T}[ over {arc}][ at {place}][, {sHow}][, with {power}]. {t} lived, and is hurt.",
    checked: "{S}[, {sWho},] came openly for {T}[ over {arc}][ at {place}][, {sHow}][, with {power}], and held {t}.",
    stalemate: "{S}[, {sWho},] came openly for {T}[ over {arc}][ at {place}][, {sHow}] — and {t} stood[, {tHow}]. Neither broke.",
    guarded: "{S}[, {sWho},] came openly for {T}[ over {arc}][, {sHow}] — and {G}[, {gWho},] stood in the way[, {gHow}][, with {gPower}].",
    turned: "{S}[, {sWho},] came openly for {T}[ over {arc}][, {sHow}], and was turned aside.",
  },
};

/** ⛔ CCODE-367 — NEARBY NEWS STANDS OUT. Erik: "Nearby events should stand out more. we might want a revamp pass on the world news
 *  soon." ⚑ MEASURED: only 4 of Adelheid's 20 news items carry a place, and 1 of Silas's — nearness can only be said of what the
 *  engine placed, so the two murmurs that knew where they were and dropped it are placed too (the revamp is where the rest go).
 *  ⚠️ "NEAR" is a few days' walk (Millbrook to the Kindly Rest is 1.6, to Waystone 2) and "HERE" is under half a day's.
 *  ⛔ DISTANCE, NOT COMMUNITY — measured while building this: `valley.millbrook` holds Archive Hollow, NINE days from the square,
 *  and `domain.deepwood` spans twenty-three, so a community match called both "here". A shared community is trusted only where
 *  a place has no position to measure. Returns null when either end has no place. */
export const NEWS_NEAR_DAYS = 3;
export const NEWS_HERE_DAYS = 0.5;
export function newsNearness(item, { here = null, locations = {} } = {}) {
  const at = item?.locationId ? locations?.[item.locationId] : null;
  if (!at || !here) return null;
  const place = at.name || null;
  if (at.id === here.id) return { near: true, here: true, days: 0, place };
  const d = walkingDays(here, at);
  if (d == null) return (at.communityId && at.communityId === here.communityId) ? { near: true, here: true, days: null, place } : null;
  const days = Math.round(d * 10) / 10;
  return { near: d <= NEWS_NEAR_DAYS, here: d <= NEWS_HERE_DAYS, days, place };
}
/** Near first; otherwise exactly the order the world told it in. */
export function nearFirst(items, opts = {}) {
  return (items || []).map((n, i) => ({ n, i, near: newsNearness(n, opts)?.near ? 1 : 0 }))
    .sort((a, b) => b.near - a.near || a.i - b.i).map(x => x.n);
}

/** WHO SOMEONE IS AND HOW THEY FIGHT, from what is authored about them: `fightingStyle` is "role, how", and the tradition has a
 *  name. "a devourer of the Umbrals" / "fighting from the dark they brought". Either half may be empty; nothing is guessed. */
export function figureFlavor(f, content) {
  const style = typeof f?.fightingStyle === "string" ? f.fightingStyle.trim() : "";
  const comma = style.indexOf(",");
  const role = comma > 0 ? style.slice(0, comma).trim() : "";
  const how = comma > 0 ? style.slice(comma + 1).trim().replace(/[.\s]+$/, "") : "";
  const trad = f?.tradition || f?.legend?.tradition || null;
  const tname = trad ? (content?.traditionIndex?.byId?.[trad]?.name || null) : null;
  const of = tname && !isIdShaped(tname) ? String(tname).trim().replace(/^The\s+/, "the ") : null;
  const who = role && of ? `${/^[aeiou]/i.test(role) ? "an" : "a"} ${role} of ${of}` : (of ? `of ${of}` : "");
  return { who, how };
}

/** Fill a strike template: [optional segments] first, then the slots, then the spacing a dropped segment leaves behind. */
function fillStrike(tpl, slots) {
  const val = (k) => { const v = slots[k]; return v == null ? "" : String(v).trim(); };
  let out = String(tpl || "")
    // an older authored shape without brackets still loses its phrase when the slot is empty
    // an authored line's own preposition goes with an empty place ("did not come back from {place}" → "did not come back")
    .replace(/ (?:at|from|in|near|by) \{place\}/g, (m) => (val("place") ? m : ""))
    .replace(/ over \{arc\}/g, (m) => (val("arc") ? m : ""))
    .replace(/\[([^\[\]]*)\]/g, (m, seg) => ([...seg.matchAll(/\{(\w+)\}/g)].every(x => val(x[1])) ? seg : ""));
  out = out.replace(/\{(\w+)\}/g, (m, k) => val(k));
  return out.replace(/\s{2,}/g, " ").replace(/\s+([,.;:])/g, "$1").trim();
}

export function strikeLine({ templates, strike = "quiet", outcome, sender, target, guard = null, place = null, arc = null,
                             power = null, guardPower = null, flavor = null, unseen = false } = {}) {
  const key = outcome === "guarded" ? (guard ? "guarded" : "turned") : OUTCOME_TEMPLATE_KEY[outcome];
  if (!key) return null;
  // a strike that landed and left no trace is told from the `unseen` shapes; a turned-aside one never is — the guard saw them
  const k = (unseen && outcome !== "guarded") ? "unseen" : strike === "crusade" ? "crusade" : "quiet";
  const poolOf = (x) => (Array.isArray(x) ? x : [x]).filter(t => typeof t === "string" && t.trim());
  let pool = poolOf(templates?.strike?.[k]?.[key]);
  // ⛔ CCODE-368 — AEVI'S QUIET LINES ALREADY TELL IT BOTH WAYS: most keep the striker in [optional segments] ("…by a quiet strike from
  // somebody who knew the work[ — {S}][, {sWho}]"), so with no name the same line reads unsigned. An unseen strike uses her
  // `unseen` lines if she writes them, else those quiet lines that name the striker ONLY inside a segment; a line that names them
  // outside one ("{S} and {T} met…") is kept for a known striker.
  if (k === "unseen" && !pool.length) pool = poolOf(templates?.strike?.quiet?.[key]).filter(t => !/\{(?:S|s|sWho)\}/.test(t.replace(/\[[^\[\]]*\]/g, "")));
  const tpl = pool.length ? pool[pickIndex(`${sender?.id}|${target?.id}|${outcome}|${k}`, pool.length)] : STRIKE_FALLBACK[k][key];
  const fl = (f) => (f && typeof flavor === "function" ? (flavor(f) || {}) : {});
  const sf = fl(sender), tf = fl(target), gf = guard ? fl(guard) : {};
  const S = k === "unseen" ? "" : (sender?.name || "someone"), T = target?.name || "someone", G = guard?.name || "";
  const noId = (x) => (x && !isIdShaped(x) ? String(x).trim() : "");
  return fillStrike(tpl, {
    S, T, G, s: S ? shortName(S) : "", t: shortName(T), g: G ? shortName(G) : "",
    sWho: k === "unseen" ? "" : sf.who, sHow: sf.how, tWho: tf.who, tHow: tf.how, gWho: gf.who, gHow: gf.how,
    power: noId(power), gPower: noId(guardPower), place: noId(place),
    // an arc's name mid-sentence: "over the Green Schism", never "over The Green Schism"
    arc: noId(arc).replace(/^The\s+/, "the "),
  });
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
