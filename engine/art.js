// art.js — images for characters, locations, items, NPCs, and big moments. Two sources,
// one seam:
//   1. Static files: any record with an `image` field (path under the repo, or URL).
//   2. Generation: for records WITHOUT an image, a pluggable provider builds one
//      from the record's own description. Provider: Pollinations (free, keyless,
//      URL-based — works straight from the browser; images are cached by URL so a
//      subject always looks the same).
// Setting: singularity.artMode = "off" | "static" | "generate" (default "static").
//
// SNG-035 (imagery pipeline): ONE path — assemble a prompt → run it through THE FLOORS
// (rating ceiling + absolute minor-protection, the same discipline as generated TEXT) →
// build the endpoint URL → persist-once on the record (born-with-image; never re-assembled)
// → display + drop into the character's gallery. Pure + headless-testable up to the URL.

import { RATING_LEVEL } from "./playerprofile.js";
import { smartClamp } from "./namematch.js";   // SNG-435: the scene banner clamps GM prose, and a cut word becomes drawn detail

// ⚠️ CCODE-174: EXPORTED, because it is part of every prompt and was invisible. It is appended at URL-build
// time, AFTER the prompt that gets stored — so the details panel was showing the player a prompt that was
// not the whole prompt. "Let me see the prompt that generated the image" has to mean all of it.
//
// ⛔ CCODE-179, ERIK'S RULING: "I like to keep the house style but make sure that house style is variable
// based on the tradition they're from." The old constant locked a PALETTE — "muted earth tones with teal
// and gold accents" — onto every image in the game, which fought the 26 authored tradition palettes for
// control of the same slot. An Umbral rendered in teal and gold is not an Umbral.
// ⚠️ The MEDIUM stays constant, because that is what makes the game look like one game; only the palette,
// light and mood move, because that is what makes a people look like themselves. The tradition file's own
// usage note asks for exactly this: "this is the STYLE wrapper so the whole tradition coheres."
export const IMAGE_STYLE_MEDIUM = "digital painting, atmospheric concept art, painterly, no text, no watermark";
export const IMAGE_STYLE_HOUSE = "muted earth tones with teal and gold accents";

/** CCODE-179. The style wrapper for a picture: the constant medium, plus this people's own palette, light
 *  and mood when the tradition is known, and the house palette when it is not. Each borrowed clause is
 *  clamped — an aesthetic is authored prose and the style is a wrapper, not the subject. PURE. */
/** ⛔ SNG-435 §C3 — AN AUTHORED MARKER WAS GOING STRAIGHT INTO THE GENERATOR. Wiring the `powerSystems`
 *  aesthetics surfaced it immediately: every valley-craft ability was minting with
 *
 *      "…, ⛔ MUTED EARTH, ordinary daylight…, ⚠️ THE ABSENCE OF SPECTACLE IS THE POINT. Wayfinding…"
 *
 *  ⚠️ AN IMAGE PROMPT IS READ BY SOMETHING THAT DRAWS WHATEVER IT IS GIVEN, so SNG-433's rule — no ⛔ or ⚠️
 *  in a string a player reads — applies here at least as hard, and "THE ABSENCE OF SPECTACLE IS THE POINT"
 *  is SNG-195's A6 writerly class exactly: an instruction the model cannot evaluate, spending weight to say
 *  nothing. ⛔ The CONTENT fix is Aevi's; this is the consumer refusing to pass it on.
 *
 *  ⚠️ AND `plainForArt` IS THE WRONG TOOL HERE, WHICH IS WHY THIS IS ITS OWN THREE LINES. It strips a
 *  marker-headed aside TO THE END OF THE SENTENCE — correct when the marker heads an aside, and destructive
 *  here, where the marker heads the CONTENT: it turns "⛔ MUTED EARTH — wool, leather, wet rope, iron" into
 *  "NO emissive colour AT all", throwing away the palette and keeping the instruction. A style field needs
 *  the marker and the shout removed and the substance kept. */
function styleClause(v) {
  return String(v || "")
    .replace(/[⛔⚠️]+/gu, " ")                                     // the marker itself, wherever it sits
    .replace(/\b[A-Z]{2,}(?:\s+[A-Z]{2,})+\b/g, m => m.toLowerCase())   // a shouted run is emphasis, not a colour
    .split(/\s*[—–]\s*/)[0]                                        // the lead clause; the rest is authoring note
    .replace(/\s{2,}/g, " ").trim().replace(/[,.\s]+$/, "");
}

export function houseStyleFor(aesthetic = null) {
  // ⚠️ `smartClamp`, NOT `.slice` — a hard cut left "the boundary between them is the su" in a live
  // prompt, and a generator draws a dangling fragment as detail. Same lesson as the scene banner an hour ago.
  const bits = [aesthetic?.palette, aesthetic?.light, aesthetic?.mood]
    .filter(Boolean).map(v => smartClamp(styleClause(v), 70)).filter(Boolean);
  return bits.length ? [IMAGE_STYLE_MEDIUM, ...bits].join(", ") : `${IMAGE_STYLE_MEDIUM}, ${IMAGE_STYLE_HOUSE}`;
}

export const IMAGE_STYLE = houseStyleFor(null);   // the default, for anything with no tradition to speak for it

// CCODE-193 §2: module-private. It was exported and imported by app.js, which never used it — the
// "live code, needless public surface" third of the importedNeverCalled list. Nothing outside reads it.
const ART_MODES = ["off", "static", "generate"];

export function getArtMode() {
  const m = localStorage.getItem("singularity.artMode");
  return ART_MODES.includes(m) ? m : "generate";
}
export function setArtMode(m) { if (ART_MODES.includes(m)) localStorage.setItem("singularity.artMode", m); }

/** Is image GENERATION on (the "generate" mode)? The on-switch for the whole pipeline. */
export function imagesEnabled() { return getArtMode() === "generate"; }

/** Deterministic seed from a string so the same subject regenerates the same image. */
function seedFrom(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 100000;
}

function pollinationsURL(prompt, { width = 1024, height = 320, seed = 42, style = IMAGE_STYLE } = {}) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ", " + style)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
}

/** ⛔ CCODE-193 §2 — EVERY MINT PASSES THROUGH HERE, so "every image" means every image.
 *
 *  §1 put the composer behind `ensureImage`, which is four of the six places a URL is built. The other two
 *  — the scene banner and the item study — derive their URL at render time and store nothing, so they got
 *  no composition at all. A coverage claim with two holes in it is the thing this project keeps finding a
 *  ticket later, so: one helper, and a path added tomorrow is covered by using it.
 *
 *  It does two things a bare `imageURLFor` cannot:
 *  • ASKS whether this exact picture has already been composed, and hands back the composed one — which is
 *    what makes a derive-at-render path STICK. Without it the banner would flip to the composed picture and
 *    back to the raw one on the next render, forever.
 *  • ANNOUNCES a genuinely new mint, so the composition can happen behind the picture the player already has.
 *
 *  ⚠️ `raw` IS THE PRE-FLOOR LINE and `safe` is what the URL is built from. Compose before the floors,
 *  never after — the oldest law in this pipeline. */
function mintURL(kind, { raw, safe, seed, record = null, field = null, ratingLevel = 2, isMinor = false, aesthetic = null }) {
  const url = imageURLFor(kind, safe, seed, { aesthetic });
  if (!url) return url;
  const already = _composedFor ? _composedFor(url) : null;
  if (already) return already;
  if (_onMinted) {
    try { _onMinted({ record, field, kind, raw, ratingLevel, isMinor, seedKey: seed, aesthetic, url }); }
    catch { /* a composition is a grace on top of a picture that already exists — never a blocker */ }
  }
  return url;
}

/** CCODE-193: called with every freshly minted picture — never with one `ensureImage` already had, because
 *  persist-once returns before the mint. The engine stays free of the network: the app installs the listener
 *  that composes, and the resolver that says a composition is already known. */
let _onMinted = null;
let _composedFor = null;
export function onImageMinted(fn) { _onMinted = typeof fn === "function" ? fn : null; }
export function onComposedLookup(fn) { _composedFor = typeof fn === "function" ? fn : null; }

// ---------- SNG-435 §A: a 200 IS NOT PROOF OF AN IMAGE ----------
//
// ⛔ AEVI MEASURED THIS AND IT IS THE WORST BUG IN THE PIPELINE. `image.pollinations.ai` answers a
// rate-limited request with **HTTP 200 and a zero-byte body**, and Cloudflare caches that under the
// canonical URL as `public, max-age=31536000, immutable` — ONE YEAR. The poisoned response carries
// `x-cache: HIT` and is byte-identical in headers to a healthy hit. Her numbers, one prompt, three requests:
//
//     canonical URL              0 bytes
//     canonical URL + &_cb=…     24,050 bytes
//     same prompt, seed 39650    25,786 bytes
//
// ⚠️ THE PROMPT IS FINE. THE URL IS BURNED. And this file's two best properties are what make that
// permanent: `mintURL` is deterministic and `ensureImage` is persist-once, so the record holds the burned
// address forever and every later read returns the same empty body. It cannot self-heal.
//
// ⛔ SO: ABSENT BEATS POISONED. A URL that has been PROVEN empty is not persisted and not kept — a record
// with no image re-mints on the next open; a record holding a burned URL never recovers.
//
// ⚠️ PROVEN, NOT SUSPECTED. A fetch that throws — offline, a dead wifi hop, a cancelled navigation — says
// NOTHING about the bytes, and must leave the save exactly as it found it. Deleting a player's gallery
// because their train went into a tunnel would be a far worse bug than the one being fixed.

/** Smallest response that can be a real picture. Aevi's floor, with margin: the smallest healthy image she
 *  measured was ~18 KB, and the poisoned ones are 0. */
export const IMAGE_MIN_BYTES = 1000;

/** SNG-435 §A2 — THE RETRY MUST NOT BE THE SAME URL. Re-requesting the canonical address re-reads the
 *  poisoned cache entry; the buster is the whole fix, because it changes the cache key. The URL that comes
 *  back with real bytes is the one that gets persisted — ugly, and correct: the canonical one is burned for
 *  a year and cannot be un-burned.
 *  ⚠️ `stamp` is injected rather than read from the clock so this stays pure and testable. */
export function bustedURL(url, attempt = 1, stamp = 0) {
  const u = String(url || "");
  if (!u) return u;
  const clean = u.replace(/([?&])_cb=[^&]*(&|$)/g, (m, p1, p2) => (p2 ? p1 : "")).replace(/[?&]$/, "");
  return `${clean}${clean.includes("?") ? "&" : "?"}_cb=${stamp}_${Math.max(1, attempt | 0)}`;
}

/** Does this URL carry a cache-buster? ⚠️ A busted URL is a healed one, not a broken one — it is what a
 *  record SHOULD hold after a poisoned mint, so nothing may treat it as suspect. */
export function isBustedURL(url) { return /[?&]_cb=/.test(String(url || "")); }

/** ⛔ SNG-435 §C3 — WHICH PALETTE A THING IS DRAWN IN, resolved ONCE for six call sites.
 *
 *  Aevi swept the abilities and found something better than the gap I reported: **55 abilities carry a
 *  `tradition` that is not a people at all.** `harmonic`, `radiant_folk`, `precursor`, `valley_craft`,
 *  `cross_pole_braid` — in every case the value is the ability's own POWER SYSTEM, and authoring five
 *  `traditions` entries would have invented five peoples the world does not have. That is the SNG-432 error
 *  exactly, where `harmonic_radiant` turned out to be a disposition pair.
 *
 *  ⚠️ AND THE POWER-SYSTEM AXIS IS THE RIGHT ONE ANYWAY, in her words: *a tradition supplies CULTURE; a
 *  power system supplies PHYSICS.* What a harmonic craft LOOKS like comes from sound, not from a people.
 *
 *  Order: the authored people first (321 abilities), then the physics (55). A `reach_*` power system is a
 *  runtime-minted braid and resolves to the one `braid` entry — which composes the two parent palettes
 *  rather than being authored per braid, because braids are minted in play and cannot be enumerated.
 *
 *  ⛔ ONE RESOLVER, because six sites were each doing `aesthetics[trad] || null` by hand and the day a
 *  second axis appeared, all six were wrong together. Returns null when nothing is authored — the caller
 *  falls back to the house palette, and `loadContent` says out loud who is falling. PURE. */
export function aestheticFor(subject, doc) {
  const trad = subject?.tradition || null;
  const ps = subject?.powerSystem || null;
  const byTrad = doc?.traditions || doc || {};
  const bySystem = doc?.powerSystems || {};
  // ⛔ SNG-531 / CCODE-218 — A BODY IS NOT A PEOPLE AND NOT A POWER SOURCE. Aevi opened a third
  // namespace for form kits, and she is right that it is a third thing: an Ent's branch-club looks like an
  // ENT, which is neither the tradition it was taught by nor the physics it runs on. ⚠️ FIRST, because a
  // body is the most specific claim of the three - what a thing is made of beats who taught it.
  const byForm = doc?.forms || {};
  const fk = subject?.aestheticKey || null;
  if (fk && byForm[fk]) return byForm[fk];
  if (trad && byTrad[trad]) return byTrad[trad];
  if (ps && bySystem[ps]) return bySystem[ps];
  // ⚠️ AND A POWER SYSTEM WEARING THE `tradition` FIELD STILL RESOLVES. §C3's own finding was that
  // `harmonic` / `radiant_folk` / `precursor` / `valley_craft` / `cross_pole_braid` are POWER SYSTEMS
  // carried in the tradition slot. Aevi swept them; `sling_and_stone` was missed, and it alone held the
  // coverage ratchet red. Rather than chase each instance, the resolver now accepts the field the content
  // actually carries — a craft that names a real palette gets it, whichever slot the name sits in.
  if (trad && bySystem[trad]) return bySystem[trad];
  // ⚠️ A BRAID BY ANY OF ITS NAMES. `reach_*` routed here because a FILENAME was standing in for a power
  // system; once CCODE-217 let the ability's own value win, those three crafts became `combination` and
  // would have lost their picture to a rename. A combination craft IS a cross-pole braid - so it paints
  // like one, and the `reach_` route stays for anything still carrying the old shape.
  if (ps && (/^reach_/.test(ps) || ps === "combination" || ps === "cross_pole_braid") && bySystem.braid) return bySystem.braid;
  return null;
}

/** SNG-435 §A1/§A2 — WHAT TO DO ABOUT A RESPONSE, as a pure decision so the rule can be tested rather than
 *  trusted. The I/O lives in the app; the policy lives here.
 *
 *  ⛔ THREE VERDICTS, NOT TWO, AND THE THIRD IS THE ONE THAT PROTECTS THE PLAYER. `unknown` — the request
 *  never completed: offline, a dead hop, a cancelled navigation — is not evidence about the bytes, and must
 *  never delete anything. Deleting a gallery because a train went into a tunnel would be a worse bug than
 *  the one this fixes, and it is the obvious way to write this wrong.
 *
 *  @returns "keep" (it is a real picture) · "retry" (proven empty, buster left) · "forget" (proven empty,
 *           out of retries — absent beats poisoned) · "leave" (we cannot tell; change nothing) */
export function mintAction(verdict, attempt = 0, maxRetries = 2) {
  if (verdict === "ok") return "keep";
  if (verdict === "empty") return attempt >= maxRetries ? "forget" : "retry";
  return "leave";
}

/** SNG-435 §A1 — FORGET a URL that has been proven empty, wherever the save holds it. Sibling of
 *  `swapImageUrl`, and deliberately a different function: a swap replaces one picture with another, this
 *  removes a picture that does not exist so the next open mints a new one. Returns how many it dropped.
 *
 *  ⛔ IT DELETES RATHER THAN NULLS. A `null` in `record.image` is falsy, so persist-once re-mints — but a
 *  `null` in a gallery row is a tile with no picture, which is the visible half of the same bug. Object
 *  keys are deleted; array members holding the URL (or an object whose `.url` is it) are spliced out. */
export function forgetImageUrl(root, url, seen = new Set()) {
  if (!root || typeof root !== "object" || !url || seen.has(root)) return 0;
  seen.add(root);
  let n = 0;
  if (Array.isArray(root)) {
    for (let i = root.length - 1; i >= 0; i--) {
      const v = root[i];
      if (v === url || (v && typeof v === "object" && v.url === url)) { root.splice(i, 1); n++; }
      else if (v && typeof v === "object") n += forgetImageUrl(v, url, seen);
    }
    return n;
  }
  for (const k of Object.keys(root)) {
    const v = root[k];
    if (v === url) { delete root[k]; n++; }
    else if (v && typeof v === "object") n += forgetImageUrl(v, url, seen);
  }
  return n;
}

/** Image URL for a location banner, or null if art is off / nothing available. */
// CCODE-193 §2: module-private. `sceneImage` is its only caller; app.js imported it and never
// called it, and smoke imported it and never used it. The capability stays, the needless surface goes.
function locationImage(location, { ratingLevel = 2 } = {}) {
  const mode = getArtMode();
  if (mode === "off") return null;
  if (location.image) return location.image;
  if (mode !== "generate") return null;
  const raw = assembleImagePrompt("location", location);
  return mintURL("location", { raw, safe: sanitizeImagePrompt(raw, { ratingLevel }), seed: location.id, ratingLevel });
}

/** Scene-level banner: in generate mode, the image follows the SCENE — a cottage
 *  interior, a dock at dusk — built from the scene anchor's own setting text
 *  (seeded by it, so the same scene keeps the same image across re-renders).
 *  Falls back to the location banner otherwise. */
export function sceneImage(location, sceneState, { ratingLevel = 2 } = {}) {
  const mode = getArtMode();
  if (mode === "generate" && sceneState?.setting) {
    // ⚠️ SNG-435: `smartClamp`, NOT `.slice`. The setting is GM prose and this is an IMAGE prompt — a cut
    // mid-word leaves a fragment the generator draws as detail, which is the whole reason `battleprompt`
    // trims to whole clauses. The ratchet saw this the moment CCODE-193 lifted it onto its own line; it had
    // been slicing model prose in place for as long as the scene banner has existed.
    const raw = `${location.name} — ${smartClamp(sceneState.setting, 280)}`;
    return mintURL("location", { raw, safe: sanitizeImagePrompt(raw, { ratingLevel }), seed: sceneState.setting, ratingLevel });
  }
  return locationImage(location, { ratingLevel });
}

/** Image URL for an item (examine view), or null. */
export function itemImage(item, { ratingLevel = 2 } = {}) {
  const mode = getArtMode();
  if (mode === "off") return null;
  // SNG-251 §2b: an EVOLVED item must not keep showing its old picture. `imageDirty` is set by
  // applyItemUpdates only when the change was a real evolution (a grant, a stage, a materially rewritten
  // description) — never a small edit — so a pinned URL minted before the runes were bound is bypassed
  // rather than trusted. This was half of what Erik reported: the spear grew runes, the art did not.
  if (item.image && !item.imageDirty) return item.image;
  if (mode !== "generate") return item.image || null;   // no generator running: the old picture beats none
  const raw = assembleImagePrompt("item", item);
  // `imageStamp` increments on every evolution, so it BUSTS the cache key — the new stage gets a genuinely
  // new image instead of the memoised one keyed on the (unchanged) item name.
  const seed = item.imageStamp ? `${item.name}#${item.imageStamp}` : item.name;
  return mintURL("item", { raw, safe: sanitizeImagePrompt(raw, { ratingLevel }), seed, ratingLevel });
}

// ⛔ CCODE-193 §2 — `npcImage` DELETED. SNG-169 found it as dead capability ("imported and never
// invoked", the 11th of that batch) and it stayed on the books for eleven tickets after. `ensureImage(npc,
// "npc")` supersedes it completely — persist-once, the likeness vote, the floors, and now the composition
// — so what was left was a SECOND way to mint an NPC picture that would silently skip all four. Two paths
// to one answer is how the sentence and the picture came to disagree in SNG-431. Same shape, so it goes.

// ---------- SNG-035: THE FLOORS FOR IMAGES (rating ceiling + absolute minor-protection) ----------
// Every image prompt routes through here before it ever reaches the endpoint — the same
// non-negotiable the text generator enforces (generate.js enforceFloors), applied to pixels:
// no image sexualizes a minor, and no image exceeds the viewer's content ceiling. Pure.

const SEXUAL_MARKERS = /\b(sexual|erotic|nude|naked|nudity|seduc\w*|lust\w*|carnal|aroused|fondl\w*|sensual|lingerie|underwear|topless|provocative|suggestive|fetish)\b/gi;
const ROMANTIC_MARKERS = /\b(romantic|romance|kiss\w*|embrac\w*|lover|passion\w*|intimate)\b/gi;
const GRAPHIC_VIOLENCE_MARKERS = /\b(gore|gory|blood(y|ied|bath)?|disembowel\w*|mutilat\w*|eviscerat\w*|dismember\w*|torture|flay\w*|decapitat\w*|corpse|entrails)\b/gi;

// Per-ceiling tone modifier appended to the prompt (index by numeric RATING_LEVEL).
// ⛔ CCODE-182 — A CEILING SAYS WHAT IS ALLOWED, NOT WHAT IT LOOKS LIKE. Erik, on Dawn Surgery: "I can't
// get an image this full of light and clarity — this is a Radiant based skill!" His prompt read "Bright
// lights to see and work every detail… focused light: clean cuts, sight into the wound" and then the
// engine appended "dark, intense, cinematic, mature dramatic tone" — because that was the R+ tone, applied
// to every image whatever it was of. A rating is a LIMIT, and the upper ones limit almost nothing, so they
// should contribute almost nothing. Mood belongs to the subject, its people's palette, and its kind.
// ⚠️ The LOW ceilings still speak, because they are the ones actually excluding something.
const CEILING_TONE = [
  "wholesome, gentle, family-friendly, no violence, no gore",          // 0 G
  "adventurous, mild, no gore",                                        // 1 PG
  "mild peril, no gore",                                               // 2 PG-13
  "",                                                                  // 3 R   — nothing excluded worth naming
  ""                                                                   // 4 R+  — the subject decides how it looks
];
const SAFETY_TAIL = "tasteful, non-explicit, no nudity, original character not a real person, no copyrighted characters, no text, no watermark, no signature";
// ⛔ ERIK'S RULING (CCODE-176): "The safety tail is not needed at all - remove it… right now it just eats up
// image prompt context." He is right that it was mostly not safety: "no copyrighted characters, no text, no
// watermark, no signature" is hygiene the house style already covers, and a blanket "non-explicit, no
// nudity" on EVERY prompt duplicates the job the content ceiling already does per-rating. 180 characters of
// constant text was outweighing a 150-character description on every image in the game.
// ⚠️ THE CONSTANT IS KEPT — but only so `bareImagePrompt` can still strip it off prompts stored while it
// was in use. It is no longer appended to anything.
// ⛔ MINOR-PROTECTION STAYS, AND STAYS ABSOLUTE. Erik: "I wouldn't want to eliminate any NEEDED
// minor-protection… if so, keep it short and to the point to make it effective." Short IS more effective —
// six words the generator cannot average away, rather than a paragraph it dilutes.
const MINOR_TONE = "a child, fully clothed, non-sexual, wholesome";

// ⛔ CCODE-182 — THE STRIP MUST KNOW EVERY TONE THE FLOORS HAVE EVER APPENDED, not only the ones they
// append today. Changing the wording (R+ "dark, intense, cinematic, mature dramatic tone" → nothing;
// PG-13 losing its leading "dramatic,") instantly made every prompt STORED under the old wording
// un-strippable — so re-sanitising one would keep the dead tone AND add the new one, which is the
// double-append bug returning through a different door. Erik's own gallery is full of these.
// ⚠️ Retired strings are kept forever. They cost a few bytes and they are the only way a picture minted
// last week can still have its description read back cleanly.
const RETIRED_TONES = [
  "dark, intense, cinematic, mature dramatic tone",
  "dark, intense, dramatic",
  "dramatic, mild peril, no gore",
  "child, age-appropriate, wholesome, fully clothed, non-sexual, innocent"
];

// CCODE-176, Erik: "The ceiling tone needs to shift wording depending on the image/scene. a fight might be
// bloody, gory - a sex scene might be sensual or erotic… if we don't shift the wording at all it all starts
// to look the exact same." So the tone is now rating × KIND, and the kind half is what stops a battle, a
// portrait and a place all arriving in the same register.
const KIND_TONE = {
  battle:   "action, epic fantasy, dramatic motion, weight and impact",
  death:    "still, final, hushed, the aftermath rather than the blow",
  beast:    "ominous, predatory, seen a moment too late",
  location: "wide establishing shot, atmospheric, no figures in the foreground",
  moment:   "cinematic still, a held beat",
  item:     "clean even light, plain ground, the object alone"
};

// CCODE-174: everything the floors can APPEND, so a later pass can take its own output back off before
// working. ⚠️ The tail is matched from its stable head to its stable end rather than by exact string,
// because a prompt that has already been double-sanitised carries a CORRUPTED copy ("no ," where "no
// nudity" was) and that copy has to come off too or it stays in the picture's description forever.
const SAFETY_TAIL_RE = /,?\s*tasteful,\s*non-explicit,[\s\S]*?no signature/gi;
const escRe174 = t => String(t).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// ⛔ FILTER THE EMPTIES, AND THIS IS NOT DEFENSIVE PADDING. CCODE-182 set the R and R+ tones to "" so a
// high ceiling stops imposing a mood — which put an EMPTY ALTERNATIVE into this alternation. `(?:a|b|)`
// matches at every position, so `,?\s*(?:…|)` matched every run of whitespace and the strip deleted every
// space in the prompt: "Surgery using Light as a scalpel" came out "SurgeryusingLightasascalpel".
// ⚠️ Caught only because the verification PRINTED the real output instead of asserting a boolean about it.
const TONE_RE = new RegExp(",?\\s*(?:" + [...CEILING_TONE, MINOR_TONE, ...RETIRED_TONES, ...Object.values(KIND_TONE)].filter(Boolean).map(escRe174).join("|") + ")", "gi");

/** PURE. A prompt with the floors' own appended tone + safety tail removed — the DESCRIPTION, as written.
 *  Used to make `sanitizeImagePrompt` idempotent, and to keep the likeness vote counting what a picture
 *  actually shows instead of the boilerplate every prompt ends with. */
export function bareImagePrompt(prompt) {
  let p = String(prompt || "");
  for (let i = 0; i < 4; i++) {
    const before = p;
    p = p.replace(SAFETY_TAIL_RE, "").replace(TONE_RE, "");
    p = p.replace(/\s*,(\s*,)+/g, ",").replace(/\s{2,}/g, " ").replace(/^[\s,]+|[\s,]+$/g, "").trim();
    if (p === before) break;
  }
  return p;
}

/** Does this subject read as a minor? A record-level flag (isMinor / _gen.romanceEligible===false)
 *  or a child descriptor. Conservative — an image only goes child-safe when it clearly should. */
export function isMinorSubject(subject = {}) {
  if (subject.isMinor === true) return true;
  if (subject._gen && subject._gen.romanceEligible === false) return true;
  const age = Number(subject.age);
  if (Number.isFinite(age)) return age < 18;
  const text = [subject.role, subject.appearance, subject.name, subject.voiceHints].filter(Boolean).join(" ");
  return /\b(child|children|kid|kids|toddler|infant|baby|boy|girl|adolescent|teenaged?|teens?|underage|minor|youngster|little one)\b/i.test(text)
    && !/\b(adult|grown|elder|old(er)?|woman|man|men|veteran|matron|patriarch|widow|widower|aged)\b/i.test(text);
}

/** ⛔ CCODE-189 — AUTHOR-DIRECTED TEXT IS REACHING THE IMAGE MODEL.
 *
 *  Measured on a live world: 35 of 385 abilities and 8 of 70 appearances carry `⛔`/`⚠️` markers or
 *  Aevi's SHOUTING emphasis, and all of it goes into the picture. A real battle prompt built today opens:
 *
 *    "The Borne Bargain — reposition, ⚠️ ABYSSAL FLIGHT, AND YOU DO NOT DO IT, sovereign abyssal, HORNED…"
 *
 *  That first clause is a note from the author to the next author. It is not in the picture; it is ABOUT
 *  the picture. This is the same class Erik already caught once ("what's all this stuff getting injected
 *  into my image prompt?") arriving from the other direction — not appended by the engine, but authored
 *  INTO the content the engine reads.
 *
 *  ⚠️ AND IT IS DE-SHOUTED, NOT DELETED. "HORNED, dressed better than anyone expects" and "PART-MACHINE"
 *  are Aevi emphasising a REAL VISUAL FEATURE — the caps are for a human reading the file. Dropping the
 *  word would lose the horns. Only a clause that a marker actually HEADS is removed, because that is the
 *  shape of an aside; everything else is lowered to ordinary prose and kept.
 *
 *  Runs on every prompt, not only the battle one: the same appearances feed portraits and the whois card. */
export function plainForArt(text) {
  let s = String(text || "");
  // 1. A marker HEADS an aside, and the aside runs to the end of its SENTENCE — not to the em-dash. Aevi's
  //    shape is "⚠️ SHOUTED CLAIM — SHOUTED CONTINUATION. Real prose follows.", so stopping at the dash left
  //    "something carries YOU." glued to the front of a description. Measured on her own worst case.
  s = s.replace(/[⛔⚠️‼️]️?\s*[^.]*(?:\.|$)\s*/gu, " ");
  // 2. Any marker left is bare punctuation to a painter.
  s = s.replace(/[⛔⚠️‼️]️?/gu, " ");
  // 3. De-shout: 3+ capitals is emphasis for a human reading the file. Keep the words, lose the volume.
  s = s.replace(/\b[A-Z][A-Z'’\-]{2,}\b/g, (w) => (w === w.toUpperCase() ? w.toLowerCase() : w));
  return s.replace(/\s+/g, " ").replace(/\s+([,.;])/g, "$1").replace(/^[\s,;:—–-]+/, "").trim();
}

/** THE FLOORS, applied to a prompt STRING. Strips above-ceiling + always-prohibited content,
 *  then appends the ceiling tone + the absolute safety tail. A minor subject is forced
 *  child-safe (sexual/romantic/graphic-violence terms removed, wholesome tone imposed) at ANY
 *  ceiling — minor-protection is a hard scrub, never a softening. Pure. */
export function sanitizeImagePrompt(prompt, { ratingLevel = 2, isMinor = false, kind = null } = {}) {
  // ⛔ CCODE-174 — THE FLOORS MUST BE IDEMPOTENT, AND THEY WERE NOT. Erik, reading a prompt in the new
  // details panel, found the ceiling tone and the safety tail appended TWICE — and the first copy mangled:
  //
  //   "…tasteful, non-explicit, no , original character not a real person, … no signature,
  //     dark, intense, cinematic, mature dramatic tone, tasteful, non-explicit, no nudity, …"
  //
  // ⚠️ THE WORD "nudity" WAS EATEN OUT OF THE SAFETY TAIL BY THE SAFETY SCRUB. A stored prompt is an
  // ALREADY-SANITISED prompt, so re-running the floors over it ran SEXUAL_MARKERS across the tail this
  // function had itself written, turning "no nudity" into "no ". A second pass was corrupting the very
  // instruction it exists to add — the guard degrading itself each time a picture was redrawn.
  // Stripping its own previous output first makes running it twice identical to running it once.
  let p = bareImagePrompt(prompt);
  // ⛔ CCODE-178, ERIK'S RULING: "If you're scrubbing sensual and erotic at every rating you're failing.
  // Rating R and R+ specifically call for those in some scenes. You don't need to police this for the
  // model, it will reject renders that are too explicit."
  // He is right and the old line said so itself — "always-prohibited regardless of ceiling" made the
  // CEILING meaningless for the one axis it most exists to express. A rating the player sets and then
  // cannot use is not a rating. So this is a ceiling scrub now, exactly like gore: stripped below R,
  // available at R and R+, with the provider's own refusal as the backstop he correctly points at.
  // ⚠️ FOR A MINOR IT REMAINS UNCONDITIONAL — see below. That one is not a ceiling and never was.
  if (isMinor || ratingLevel < RATING_LEVEL["R"]) p = p.replace(SEXUAL_MARKERS, " ");
  // above-ceiling scrubs
  if (ratingLevel < RATING_LEVEL["R"]) p = p.replace(GRAPHIC_VIOLENCE_MARKERS, " "); // gore only ever above R
  if (isMinor) {
    // absolute minor-protection: no romance, no sexualization, no graphic violence — at ANY ceiling
    p = p.replace(ROMANTIC_MARKERS, " ").replace(GRAPHIC_VIOLENCE_MARKERS, " ");
  }
  // ⚠️ A SCRUB LEAVES A HOLE, AND THE HOLE IS VISIBLE. Removing a word from "a sensual, erotic encounter"
  // left "a , encounter" — a dangling comma the generator reads as an empty clause. Same junk class as the
  // "no ," Erik spotted in the safety tail; tidy the punctuation the removal orphaned.
  // ⛔ CCODE-191 — AND CLOSING THE SPACE IS NOT TIDYING IT. This turned "a , encounter" into "a, encounter":
  // the comma survives, and an article followed by a comma is the same empty clause with better spacing.
  // ⚠️ The gate written to catch exactly this carried a literal BACKSPACE where its `\b` belonged, so its
  // second assertion never ran and the bug it was written for shipped anyway. What is LEFT of an emptied
  // clause is dropped now, rather than punctuated.
  p = p.split(",")
    .map(part => part.replace(/\s{2,}/g, " ").trim())
    .filter(part => part && !/^(?:a|an|the|and|or|of|with|in|at|on)$/i.test(part))
    .join(", ")
    .replace(/\s{2,}/g, " ").replace(/\s+,/g, ",").replace(/,(\s*,)+/g, ",").replace(/(^[\s,]+|[\s,]+$)/g, "").trim();
  const level = Math.max(0, Math.min(4, isMinor ? Math.min(ratingLevel, RATING_LEVEL["PG"]) : ratingLevel));
  // ⛔ CCODE-178, ERIK AGAIN: "What do you mean the minor-protection is the whole tone? Let it just be
  // there where it is, not make every image about minors… or you risk ruining legit images."
  // He is right, and my version was worse than the one it replaced. Making the minor clause the ENTIRE tone
  // stripped the kind register and the ceiling from any picture with a child in it — so a child standing in
  // a battle got no battle, a child in a wide landscape got no landscape. It flattened the art to make a
  // point. ⚠️ And `isMinorSubject` is a HEURISTIC: one false positive on an adult and that person's every
  // image went bland, with nothing on screen to explain why.
  // ADDITIVE is both safer and stronger. The words are present and unmissable; the picture is still a
  // picture. The ceiling is already clamped to PG for a minor a line above, which is the real protection —
  // this clause is the explicit statement of it, not a replacement for having a scene at all.
  const tone = [CEILING_TONE[level], KIND_TONE[kind], isMinor ? MINOR_TONE : null].filter(Boolean).join(", ");
  return [p, tone].filter(Boolean).join(", ");
}

// ---------- SNG-035: prompt assembly (pure) ----------

const IMG_SIZES = {
  character: { width: 512, height: 640 },
  npc:       { width: 512, height: 640 },
  location:  { width: 1024, height: 320 },
  item:      { width: 400, height: 400 },
  moment:    { width: 1024, height: 512 },
  beast:     { width: 640, height: 512 }, // CCODE-31: a creature study — wider than a portrait, a thing that comes AT you
  // SNG-400b: a battle holds TWO figures and the ground between them, so it is the widest frame in the
  // game. A portrait crop of a fight shows one shoulder and no fight.
  battle:    { width: 1024, height: 512 },
  death:     { width: 768, height: 512 }  // §4 fallback: one figure, one ending — narrower, and it should be
};

/** SNG-053: the physical FORM of a subject — its species/lineage/embodiment, in words. This LEADS
 *  every character/NPC prompt so a non-human form (an Ent, a construct, a beast-kin) actually
 *  renders non-human, instead of the literal "character portrait" prefix biasing the model to a
 *  plain human. Explicit form/lineage/appearance wins; otherwise a neutral human default (human is
 *  a stated value, never the unspoken assumption). */
export function formOf(subject = {}) {
 // registry:internal
  const explicit = subject.form || subject.lineage || subject.appearance;
  if (explicit) return String(explicit).slice(0, 220);
  return "a person";
}

/** SNG-110: name a piece of gear in a portrait WITH ITS PROVENANCE — a player-named item reads as
 *  theirs, a grown/evolved item names its earned stage — so "the spear you forged and named" shows up
 *  as YOURS, not a generic "spear". The attention-makes-real thesis at the portrait layer. */
export function itemProvenancePhrase(item = {}) {
  if (!item) return "";
  const base = item.name || item.itemId || "";
  if (item.provenance) return `${item.customName || base} (${String(item.provenance).slice(0, 60)})`;
  if (item.customName) return `${item.customName}${item.evoStageName ? `, ${item.evoStageName}` : `, a ${base}`} of your own`;
  if (item.evoStageName && item.evoStageName !== base) return `${base} — ${item.evoStageName}`;
  return base;
}

/** The descriptive core of a character portrait: player-authored FORM/APPEARANCE leads (or a per-image
 *  override), then origin/culture + provenance-named gear + arc, and an OPT-IN companion in frame.
 *  opts: { appearanceOverride (one-off, not persisted), withCompanion: { name, appearance } }. */
export function characterPromptSeed(character = {}, opts = {}) {
  const lead = String(opts.appearanceOverride || character.appearance || formOf(character)).slice(0, 220);
  const bits = [`${lead}, full-body character portrait`];
  if (character.name) bits.push(`named ${character.name}`);
  if (character.origin) bits.push(`of the ${String(character.origin).replace(/[-_]/g, " ")}`);
  if (character.background) bits.push(String(character.background).replace(/[-_]/g, " "));
  const gear = (character.inventory || []).map(itemProvenancePhrase).filter(Boolean).slice(0, 3);
  if (gear.length) bits.push(`carrying ${gear.join(", ")}`);
  // SNG-136 P1: fold in the LIVED record — level-band, the latest major deed, the current arc stage — so a
  // regen shows who they've BECOME, not who they were at creation. Bounded to a few evocative clauses
  // (coherence + prompt length). Same source that feeds the SNG-134 lived header story.
  const lvl = Number(character.level) || 1;
  if (lvl >= 5) bits.push(lvl >= 12 ? "long-marked by a hard road, the years written on them" : lvl >= 8 ? "seasoned, bearing the marks of what they've done" : "no longer untested");
  const topDeed = (character.deeds || []).filter(d => d?.description && Math.abs(d.weight | 0) >= 2).sort((a, b) => Math.abs(b.weight | 0) - Math.abs(a.weight | 0))[0];
  if (topDeed) bits.push(String(topDeed.description).slice(0, 90));
  const pa = character.personalArc; const taken = pa && (character.quests || []).find(q => q.arcId === pa.arcId);
  const stage = taken && pa.stages ? pa.stages[taken.stageIndex] : null;
  if (stage?.objective) bits.push(`amid ${String(stage.objective).slice(0, 60)}`);
  const arc = character.bio?.motivation || character.currentAim;
  if (arc && !topDeed) bits.push(String(arc).slice(0, 120)); // seed motivation only until real deeds accrue
  const co = opts.withCompanion;
  if (co?.name) bits.push(`alongside ${co.name}${co.appearance ? `, ${String(co.appearance).slice(0, 140)}` : ""}`);
  return bits.join(", ");
}

/** SNG-136 P2: the portrait seed for an NPC who has crossed a bond milestone — built from their form/
 *  description + role + their relationship TO the player (a devoted partner, a sworn ally). Rating-lensed
 *  + minor-safe downstream (ensureImage runs the floors). Pure. */
export function npcPromptSeed(npc = {}, character = {}, ctx = {}) {
  // ⛔ SNG-367 — 33 OF 34 PORTRAITS LED WITH THE LITERAL "a person", AND THE CAUSE IS A FALLBACK THAT
  // NEVER RETURNS FALSY. `formOf()` returns "a person" when form/lineage/appearance are absent, and it sat
  // THIRD in this chain — so `description`, `role` and `name` were unreachable for anyone without an
  // authored form, which is almost everyone. Every figure rendered from the same two words, which is why
  // every figure rendered as the same woman.
  //
  // ⚠️ AND THE ORDER IS THE RULE, NOT A PREFERENCE. Aevi: "an authored form must win over the tradition
  // layer — that is what stops an Ent rendering human." So: what the author WROTE about this body first;
  // then what their PEOPLE look like (SNG-367's new `people` layer, authored for 26 traditions); then what
  // they DO; and only if all of that is empty, the anonymous default.
  const authored = npc.appearance || npc.form || npc.lineage || null;   // what someone wrote about THIS body
  const people = !authored && ctx.aesthetic?.people ? String(ctx.aesthetic.people) : null;
  const doing = npc.description || npc.role || null;
  const lead = String(authored || people || doing || npc.name || "a person").slice(0, 200);
  const bits = [`${lead}, character portrait`];
  if (npc.name) bits.push(`named ${npc.name}`);
  if (npc.gender || npc.pronouns) bits.push(String(npc.gender || npc.pronouns).slice(0, 40)); // SNG-143: state gender explicitly so the generator can't default (the Pell-rendered-male fix)
  if (npc.role) bits.push(String(npc.role).slice(0, 100));
  const label = [npc.bondStage, npc.bondType].filter(Boolean).join(" ").trim();
  if (label) bits.push(`${label} to ${character.name || "the traveler"}`);
  // ⚠️ When a form IS authored, the people layer does not vanish — it stops being the SUBJECT and
  // becomes the register. An Ent of the ashwardens is still an Ent, rendered grey and unhurried.
  if (authored && ctx.aesthetic?.people) bits.push(`of a people who read as: ${String(ctx.aesthetic.people).slice(0, 160)}`);
  if (npc.voiceHints) bits.push(String(npc.voiceHints).slice(0, 100));
  return bits.join(", ");
}

/** Assemble the raw (pre-floors) descriptive prompt for a subject of a given kind. Pure. */
export function assembleImagePrompt(kind, subject = {}, ctx = {}) {
  if (kind === "character") return characterPromptSeed(subject, ctx);
  if (kind === "npc") return npcPromptSeed(subject, ctx.character || {}, ctx); // SNG-136 richer seed; SNG-367 carries ctx.aesthetic through, the way the ability path already does
  if (kind === "location") return `${subject.name || "a place"}: ${(subject.descriptionSeed || subject.encounterFlavor || "").slice(0, 300)}`;
  // SNG-251 §2b: an evolved item may carry an authored `imagePrompt` naming what the story put ON it (the
  // seated rune-threads, the maker's mark); it wins over the plain description so the re-mint SHOWS the
  // change rather than re-drawing the same spear.
  if (kind === "item") return subject.imagePrompt
    ? `single item on plain dark background, ${subject.name}: ${subject.imagePrompt}`
    : `single item on plain dark background, ${subject.name}: ${subject.description || subject.kind || ""}`;
  // SNG-223: a craft's image — its authored description IS the prompt, grounded in its tradition's aesthetic.
  // SNG-223 Q4: when the per-tradition visual block is loaded (ctx.aesthetic = palette/materials/light/mood),
  // that CONCRETE style rides the prompt so a people's crafts share a look (Ashwarden = greys/ash; Wright =
  // scaffolds/half-built). Absent the doc, fall back to the bare tradition name — backward-safe.
  if (kind === "ability") {
    const desc = String(subject.description || subject.effect || "").slice(0, 260); // prose-cap-ok: an image PROMPT, not displayed prose (matches the sibling location/item/moment prompt caps)
    const tradName = subject.tradition ? String(subject.tradition).replace(/[-_]+/g, " ") : "";
    const a = ctx.aesthetic || null;
    const style = a
      ? ` — rendered in the aesthetic of the ${tradName} tradition: ${[a.palette, a.materials, a.light, a.mood].filter(Boolean).join("; ")}`
      : (tradName ? ` — rendered in the aesthetic of the ${tradName} tradition` : "");
    return `${subject.name || "a craft"}: ${desc}${style}`;
  }
  if (kind === "moment") return String(subject.prompt || subject).slice(0, 300);
  // CCODE-31: a beast/creature — its bestiary `look` IS the prompt (a hazard, not a person: no bond, no name-face).
  if (kind === "beast") return `a dangerous creature, ${subject.name || "a beast"}: ${String(subject.look || subject.description || subject.flavor || "").slice(0, 300)} — dark fantasy creature art, ominous, no text`; // prose-cap-ok: an image PROMPT, not displayed prose (matches the sibling ability/location/moment prompt caps)
  return String(subject.name || subject || "");
}

/** Build the endpoint URL for a floors-sanitized prompt at a kind's size, seeded stably. Pure. */
export function imageURLFor(kind, safePrompt, seedKey = "", { aesthetic = null } = {}) {
  const size = IMG_SIZES[kind] || IMG_SIZES.moment;
  // CCODE-179: the wrapper follows the PEOPLE when we know them; the medium never moves.
  return pollinationsURL(safePrompt, { ...size, seed: seedFrom(String(seedKey) || safePrompt), style: houseStyleFor(aesthetic) });
}

// ---------- SNG-035: persist-once (born-with-image) ----------

/** Persist-once image resolver: if the record already carries an image (authored path or a
 *  prior mint), return it; otherwise assemble → floors → URL, STORE it on the record, and
 *  return it. The record thereafter is born-with-image — the prompt is assembled exactly once
 *  and the URL rides the save/sync like any other field. `field` defaults per kind (character →
 *  portrait, everything else → image). ratingLevel = the viewing player's ceiling; isMinor is
 *  derived from the subject unless forced. Mutates + returns the URL (or null when art is off). */
export function ensureImage(record, kind, { ratingLevel = 2, isMinor = null, seedKey = null, field = null, force = false, promptOpts = {} } = {}) {
  if (!record) return null;
  const key = field || (kind === "character" ? "portrait" : "image");
  if (!force && record[key]) return record[key];
  if (!imagesEnabled()) return record[key] || null;
  const minor = isMinor == null ? isMinorSubject(record) : !!isMinor;
  const raw = assembleImagePrompt(kind, record, promptOpts); // SNG-110: one-off override / companion / provenance
  // CCODE-164: what the player has KEPT leads the prompt, and their most recent kept seed anchors the mint.
  // The floors still run after, so a liked look can never carry something past the ceiling.
  const looked = withLikeness(raw, promptOpts.keeps || []);
  const safe = sanitizeImagePrompt(looked, { ratingLevel, isMinor: minor, kind }); // THE FLOORS run AFTER every addition
  const usedSeed = seedKey || likenessSeed(promptOpts.keeps || []) || record.id || record.name || raw;
  const url = mintURL(kind, { raw: looked, safe, seed: usedSeed, record, field: key, ratingLevel, isMinor: minor,
                              aesthetic: promptOpts.aesthetic || null });
  record[key] = url;
  // ⛔ CCODE-193 — THE COMPOSER REACHES EVERY PICTURE, ONE BEAT LATE. Erik: "do this for every image
  // because i think it will be hugely valuable" — and it reached two paths out of fourteen, because
  // composing needs an `await` and most mints happen inside a synchronous template literal. His ruling:
  // "I'm ok with an uncomposed followed by a composed." `mintURL` is where that happens, for every path,
  // so nothing here has to remember to ask.
  return url;
}

/** CCODE-193 — REWRITE EVERY STORED COPY OF ONE IMAGE URL, and return how many changed.
 *
 *  ⛔ A SWAP IS NOT ONE ASSIGNMENT. `ensureImage` writes the URL onto the record, and then the CALLER
 *  writes it wherever it wants: `character.locationImages[id]`, a gallery row, an npc's own field, a
 *  battle cache. Chasing those by hand is a list that rots the next time a picture is added — the same
 *  shape as a stylesheet that names each kind. The URL is a long unique string carrying the prompt and the
 *  seed, so every copy of it means the same picture, and rewriting all of them is exactly right.
 *
 *  ⚠️ `seen` IS NOT AN OPTIMISATION. A save holds cycles (a companion pointing back at the character),
 *  and without it this walks forever on a real character rather than a fixture. PURE apart from the
 *  rewrite it is asked to make. */
export function swapImageUrl(root, oldUrl, newUrl, seen = new Set()) {
  if (!root || typeof root !== "object" || !oldUrl || !newUrl || oldUrl === newUrl || seen.has(root)) return 0;
  seen.add(root);
  let n = 0;
  for (const k of Object.keys(root)) {
    const v = root[k];
    if (v === oldUrl) { root[k] = newUrl; n++; }
    else if (v && typeof v === "object") n += swapImageUrl(v, oldUrl, newUrl, seen);
  }
  return n;
}



// ---------- CCODE-164: KEEP IS A VOTE ON THE LIKENESS, NOT A REPLACEMENT ----------
// ⛔ ERIK REDEFINED THIS AFTER PLAYING, AND HIS VERSION IS BETTER THAN THE SPEC'S. Aevi's §3 said "on
// accept: the chosen image becomes the subject's image" — a swap. He asked for something else:
//
//   "the keep button should be a highly weighted vote — basically I like the way one image came out so I
//    want to keep that look as the person in any future renderings. If I like two images I should be able
//    to keep both, or as many as I want, to help drive the look and feel of the person toward the prompt
//    that made those images."
//
// So a keep is EVIDENCE, and it accumulates. Which makes the mechanism obvious: the prompts that produced
// the kept pictures are the description he actually likes, and **the terms those prompts SHARE are the
// signal** — a term in two kept prompts is twice-endorsed, a term in one may be the part he tolerated.
// That is a vote in the literal sense, so it is counted like one.
//
// ⚠️ It steers EVERY future rendering of that subject, not just their portrait — which is the difference
// between "this is their picture" and "this is what they look like".

const LIKENESS_CAP = 240;      // the clause is an addition to a prompt that is already budgeted
const LIKENESS_KEEP_CAP = 8;   // more than a handful stops being a preference and becomes an average

// CCODE-175: the engine's OWN framing is boilerplate too. `bareImagePrompt` takes off the floors; these
// come from assembleImagePrompt and are on every portrait, so they would win a vote counted by agreement
// exactly as the safety tail did. A likeness is what makes this person look like THEMSELVES.
const FRAMING_CLAUSE = /^(?:character portrait|named .+|a person|single item on plain dark background|a dangerous creature.*|rendered in the aesthetic of .+|.*\bportrait\b)$/i;

/** PURE. The voted likeness clause: clauses ranked by HOW MANY kept prompts contain them, ties broken by
 *  first appearance so a single keep still reads in its own order. Returns "" when nothing is kept. */
export function likenessClause(keeps = [], cap = LIKENESS_CAP) {
  const votes = new Map(), order = new Map();
  // CCODE-175: THE PLAYER'S OWN WORDS COUNT DOUBLE. A clause they typed about why they kept a picture is
  // stronger evidence than a clause the engine assembled — they were looking at the image when they said it.
  keeps.forEach((k) => { for (const c of String(k?.note || "").split(/\s*,\s*/).map(x => x.trim()).filter(x => x.length > 2)) {
    const key = c.toLowerCase();
    votes.set(key, (votes.get(key) || 0) + 2);
    if (!order.has(key)) order.set(key, -1000);
  } });
  keeps.forEach((k, ki) => {
    const seen = new Set();
    // ⛔ CCODE-174: VOTE ON THE DESCRIPTION, NOT THE BOILERPLATE. A stored keep is a SANITISED prompt, so
    // every one of them ends with the same ceiling tone and safety tail — and this counts by AGREEMENT, so
    // the unanimous winners would have been "tasteful", "non-explicit", "no nudity" and the actual likeness
    // would have been pushed out by the very clauses every prompt shares. The vote would have measured the
    // floors instead of the face.
    bareImagePrompt(k?.prompt || "").split(/\s*,\s*/).map(s => s.trim())
      .filter(s => s.length > 2 && !FRAMING_CLAUSE.test(s)).forEach((c, ci) => {
      const key = c.toLowerCase();
      if (seen.has(key)) return;            // one prompt is one vote, however often it repeats itself
      seen.add(key);
      votes.set(key, (votes.get(key) || 0) + 1);
      if (!order.has(key)) order.set(key, ki * 1000 + ci);
    });
  });
  const ranked = [...votes.entries()]
    .sort((a, b) => b[1] - a[1] || order.get(a[0]) - order.get(b[0]))
    .map(([c]) => c);
  const out = [];
  for (const c of ranked) {
    const next = out.length ? `${out.join(", ")}, ${c}` : c;
    if (next.length > cap) break;
    out.push(c);
  }
  return out.join(", ");
}

/** PURE. Fold the voted likeness into a freshly-assembled prompt. ⚠️ It LEADS, because a diffusion prompt
 *  weights its opening most heavily and the whole point is that this is what the person looks like — the
 *  scene-specific half follows. Returns the prompt unchanged when nothing is kept. */
export function withLikeness(prompt, keeps = []) {
  const look = likenessClause(keeps);
  return look ? `${look}, ${prompt}` : String(prompt || "");
}

/** The kept SEED that carries the most votes — the strongest consistency lever a diffusion model has, and
 *  free. Used for a fresh mint of a subject that already has a liked look; a re-roll deliberately varies
 *  it (that is what re-rolling IS), so this never fights the Draw-again button. */
export function likenessSeed(keeps = []) {
  // ⚠️ The MOST RECENT KEEP THAT HAS ONE, not simply the most recent. A keep made from a gallery tile that
  // predates provenance carries no seed, and giving up on it would throw away the seeds of every earlier
  // keep — the newest vote silently disabling the anchor is not what "keep this look" means.
  for (let i = keeps.length - 1; i >= 0; i--) if (keeps[i]?.seedKey) return keeps[i].seedKey;
  return null;
}

/** Toggle a keep. Returns { keeps, kept } — `kept` is the state AFTER, so a caller can label its button.
 *  Deduped by url, capped, and REMOVING is the same button: a vote you can't withdraw is a trap. */
export function toggleKeep(store, key, { url, prompt, note = null, seedKey, at = null } = {}) {
  if (!store || !key || !url) return { keeps: [], kept: false };
  const rec = store[key] || (store[key] = { keeps: [] });
  const i = rec.keeps.findIndex(k => k.url === url);
  if (i >= 0) { rec.keeps.splice(i, 1); return { keeps: rec.keeps, kept: false }; }
  // CCODE-175: `note` is the player's OWN words about why they kept it. It rides SEPARATELY as well as
  // inside `prompt`, so a later pass can weight it above clauses the machine merely assembled.
  rec.keeps.push({ url, prompt: String(prompt || "").slice(0, 400), note: note ? String(note).slice(0, 200) : null, seedKey: seedKey || null, at }); // prose-cap-ok: a stored image PROMPT, never displayed prose
  if (rec.keeps.length > LIKENESS_KEEP_CAP) rec.keeps.shift();
  return { keeps: rec.keeps, kept: true };
}

// ---------- SNG-401: draw it again ----------

/** ⛔ SNG-401 §3 — THIS DOES NOT TOUCH THE RECORD, AND THAT IS THE WHOLE DESIGN. Aevi: "a regenerate that
 *  silently replaces a face the player had grown used to is worse than no button. The player asked for
 *  another try, not for the old one to be deleted." So this is the twin of `ensureImage` with the
 *  mutation removed: same prompt assembly, same FLOORS, a DIFFERENT seed — and it hands the result back
 *  for the player to look at beside the old one. Nothing is kept until `acceptImage` is called.
 *
 *  §2: this is the RE-ROLL — same prompt, new seed, "draw this again". It is not the rebuild (re-run a
 *  BUILDER for a new prompt), because a portrait has no builder: its prompt is assembled deterministically
 *  from the person's own record, so re-running it returns the same words. Kinds that DO have a builder can
 *  pass a fresh `promptOpts` and get the other button.
 *
 *  §4: the rating ceiling and minor-protection run here exactly as they do on a first mint. ⛔ A re-roll is
 *  not a way around the floors — it goes through the same one, which is why the sanitize call is inline
 *  rather than inherited from wherever the first image came from.
 *  Returns {url, seedKey, prompt} or null when art is off. Pure. */
/** ⛔ CCODE-198 — THE LINE A RE-ROLL WOULD DRAW FROM, before the floors and before the seed.
 *
 *  Erik: *"Let the user click regen if they want (that will use the prompt gen feature)."* It did not, for
 *  a RECORD-BACKED subject: `regenerateImage` re-derives its own prompt internally, so the composer at the
 *  call site only ever saw a re-describe or a prompt-only tile. Handing a composed line in as
 *  `promptOverride` was the door — but the override path deliberately SKIPS `withLikeness`, so composing
 *  the bare assembly would have silently thrown away every look the player had kept.
 *
 *  So this returns exactly what `regenerateImage` computes as `looked`: assembled, likeness folded in, and
 *  NOT yet floored. Compose that, hand it back as the override, and both rules hold — the vote survives,
 *  and the floors still run last on whatever the model returns. PURE. */
export function regenPromptFor(record, kind, { promptOpts = {} } = {}) {
  const raw = assembleImagePrompt(kind, record || {}, promptOpts);
  return withLikeness(raw, promptOpts.keeps || []);
}

export function regenerateImage(record, kind, { ratingLevel = 2, isMinor = null, seedKey = null, promptOpts = {}, attempt = 1, promptOverride = null } = {}) {
  if (!imagesEnabled()) return null;
  // §2 REBUILD, and the no-record case in one field. `promptOverride` is a prompt that did NOT come from
  // assembling this record: either the player re-describing it ("describe this differently" — the rebuild),
  // or a gallery tile whose subject has no live record to re-read (a moment, a creature). Absent it, the
  // prompt is RE-ASSEMBLED rather than reused, so an item that has evolved or a person who has been renamed
  // redraws from what is true now instead of from what was true when the first picture was made.
  if (!record && !promptOverride) return null;
  record = record || {};
  const base = String(seedKey || record.imageSeedKey || record.id || record.name || kind);
  // a distinct key per attempt — seedFrom is deterministic, so the SAME key would redraw the same face
  // and the button would look broken while behaving correctly.
  const nextKey = `${base.replace(/#r\d+$/, "")}#r${Math.max(1, attempt | 0)}`;
  const minor = isMinor == null ? isMinorSubject(record) : !!isMinor;
  const raw = promptOverride ? String(promptOverride).slice(0, 400) : assembleImagePrompt(kind, record, promptOpts); // prose-cap-ok: an image PROMPT (matches the sibling caps above)
  // CCODE-164: a RE-ROLL of a face they have kept stays that face — new seed, same likeness. ⚠️ NOT applied
  // to a REBUILD: "describe it differently" is the player overriding the look on purpose, and folding the
  // old votes back in would silently refuse the instruction.
  const looked = promptOverride ? raw : withLikeness(raw, promptOpts.keeps || []);
  const safe = sanitizeImagePrompt(looked, { ratingLevel, isMinor: minor, kind });
  // ⛔ CCODE-193 §2: THE RE-ROLL MINTS THE SAME WAY AS THE FIRST DRAW. A record-backed "Draw again"
  // derives its prompt in here, so the call site could not compose it without discarding the likeness
  // vote — which left the one picture the player is looking hardest at as the only uncomposed one.
  return { url: mintURL(kind, { raw: looked, safe, seed: nextKey, ratingLevel, isMinor: minor,
                                aesthetic: promptOpts.aesthetic || null }), seedKey: nextKey, prompt: safe };
}

/** SNG-401 §2: may this image be REBUILT (re-described), or only re-rolled? Aevi's rule — "an authored
 *  portrait has no builder; it has a prompt I wrote, and rebuilding it would mean discarding my
 *  authoring." An authored image is a path or URL that content shipped; a generated one came from the
 *  provider. So the discriminator is simply where the picture came from. Pure. */
export function isGeneratedImage(url) {
  return /image\.pollinations\.ai/i.test(String(url || ""));
}

/** SNG-401 §3: the player looked at both and chose one. NOW it becomes the subject's image, and the seed
 *  that produced it is remembered so the face stays stable from here on.
 *  ⚠️ It also PINS. The bond-milestone portrait pass re-mints with a new seed at every new tier, so
 *  without a pin a face the player deliberately chose would be silently replaced the next time the
 *  relationship deepened — the exact complaint this feature exists to answer. `character.portraitPinned`
 *  already establishes the rule for the player's own portrait; this is the same rule for everyone else.
 *  Returns true when it took. */
export function acceptImage(record, chosen = {}, { field = "image", pin = true } = {}) {
  if (!record || !chosen.url) return false;
  record[field] = chosen.url;
  if (chosen.seedKey) record.imageSeedKey = chosen.seedKey;
  if (pin) record.imagePinned = true;
  return true;
}

// ---------- SNG-035: the character gallery / Saga ----------

// SNG-332 — ⛔ NO CAP. Erik: "I want to remove the cap on images too — I don't want good ones dropping into
// thin air." He is right, and the reason it is SAFE is worth writing down rather than assumed:
//
// ⚠️ THE GALLERY STORES REMOTE URLS, NOT IMAGE BYTES. Measured across every save on disk: 125 entries,
// ZERO data-URIs, zero inline bytes. An entry is `{kind, prompt≤200, url, caption≤120, worldDay, at}` — a
// few hundred bytes of metadata. The cap of 240 was protecting on the order of 100KB, which is not a saving;
// it was a real loss bought with nothing.
//
// ⛔ AND THE HISTORY IS THE ARGUMENT. This cap has been WRONG TWICE: 48 silently dropped a player's older
// art (Erik: "I don't see the ones from before") and was raised to 240; 240 is the same bug with a larger
// number waiting for a longer game. A limit that keeps having to be raised is a limit that should not
// exist — the same lesson as `knownPlaces`, and the same shape: a cap on a RECORD, not on a log.
//
// `capGallery` is KEPT and still honours an explicit cap: it holds the smart-eviction rule (never the
// current portrait, transient beats first), which is what to reach for if a real storage ceiling ever
// arrives. It is simply no longer applied by default.
const GALLERY_CAP = Infinity;
// The transient kinds — a beat's snapshot — are the first to go when the gallery is genuinely full; the
// meaningful record (portraits, people, places, skills, beasts) persists as long as possible.
const TRANSIENT_KINDS = new Set(["moment", "scene"]);

/** CCODE-31: the display CATEGORY of a gallery image, for the gallery's filter tabs (Erik's ask). Pure over the
 *  entry. A self-portrait vs an NPC's portrait is told apart by the "Name — relationship" caption NPC portraits
 *  carry (app.js ensureBondPortraits). Skills = crafts + discoveries; places = locations; beasts = creatures. */
export function galleryCategory(g = {}) {
  const k = g.kind;
  if (k === "ability" || k === "discovery") return "skills";
  if (k === "location") return "places";
  if (k === "beast" || k === "creature") return "beasts";
  if (k === "npc") return "people";
  if (k === "portrait") return (g.caption && String(g.caption).includes(" — ")) ? "people" : "portraits";
  return "moments"; // moment / scene / quest / anything else — the beats worth a picture
}

/** SNG-335 — A FILENAME THE PLAYER WILL RECOGNISE SIX MONTHS FROM NOW.
 *
 *  Erik: "add an option to save an image locally — that would preserve it even if the url vanishes."
 *  Removing the gallery cap keeps the ENTRY forever, but an entry is a URL; only a file on disk survives
 *  the host expiring it.
 *
 *  ⚠️ THE NAME IS THE WHOLE VALUE OF A SAVED FILE. `image_47.png` in a downloads folder is indistinguishable
 *  from junk, so this builds it from the caption the player already read under the picture, and falls back to
 *  the kind rather than to nothing. Pure — the fetching is the app's. */
export function imageFileName(caption = "", kind = "image", ext = "png") {
  const base = String(caption || "").split(" — ")[0].trim() || String(kind || "image");
  const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
  return `singularity-${slug || "image"}.${ext}`;
}

/** The extension a URL implies, defaulting to png. Content-type wins when the caller has one. */
export function imageExtFor(url = "", contentType = "") {
  const fromType = /image\/(png|jpeg|jpg|webp|gif)/i.exec(String(contentType || ""));
  if (fromType) return fromType[1].toLowerCase() === "jpeg" ? "jpg" : fromType[1].toLowerCase();
  const fromUrl = /\.(png|jpe?g|webp|gif)(?:[?#]|$)/i.exec(String(url || ""));
  return fromUrl ? fromUrl[1].toLowerCase().replace("jpeg", "jpg") : "png";
}

export function ensureGallery(character) {
  if (character && !Array.isArray(character.gallery)) character.gallery = [];
  return character;
}

/** CCODE-31: enforce the cap WITHOUT losing the meaningful record. Never evicts `keepUrl` (the current
 *  portrait); drops the OLDEST transient beats (moment/scene) first, and only then the oldest of everything
 *  else. Preserves the newest-first order of the survivors. Pure over the array. */
export function capGallery(gallery, cap = GALLERY_CAP, keepUrl = null) {
  if (!Array.isArray(gallery) || gallery.length <= cap) return gallery;
  const over = gallery.length - cap;
  // eviction candidates, ordered worst-to-keep first: transient before meaningful, then oldest before newest
  // (the array is newest-first, so a HIGHER index is older). The kept portrait is never a candidate.
  const evictUrls = new Set(
    gallery.map((g, i) => ({ g, i }))
      .filter(x => x.g.url !== keepUrl)
      .sort((a, b) => {
        const at = TRANSIENT_KINDS.has(a.g.kind) ? 0 : 1, bt = TRANSIENT_KINDS.has(b.g.kind) ? 0 : 1;
        return at !== bt ? at - bt : b.i - a.i; // transient first, then oldest first
      })
      .slice(0, over)
      .map(x => x.g.url)
  );
  return gallery.filter(g => !evictUrls.has(g.url));
}

/** Add an image to the character's gallery (dedup by url, newest-first, capped). Pure-ish
 *  (mutates the character). Returns the gallery. */
/** SNG-401 §1: `subjectKind`/`subjectId` are the PROVENANCE — WHAT this picture is of. Aevi's obstacle:
 *  "by the time an image is on screen the app has forgotten what produced it: no kind, no prompt, no seed,
 *  no subject. A regenerate button on that data can only re-fetch the same URL." A gallery tile knew its
 *  own `kind` ("portrait") but never WHOSE, so nothing downstream could redraw the person. Optional and
 *  additive — an entry without it behaves exactly as before, and the caller falls back to the caption. */
export function addGalleryImage(character, { kind, prompt = "", url, caption = "", worldDay = null, subjectKind = null, subjectId = null }) {
  ensureGallery(character);
  if (!url) return character.gallery;
  if (character.gallery.some(g => g.url === url)) return character.gallery;
  character.gallery.unshift({ kind, prompt: String(prompt).slice(0, 200), url, caption: String(caption).slice(0, 120), worldDay, at: nowStamp(), ...(subjectId ? { subjectKind: subjectKind || kind, subjectId: String(subjectId).slice(0, 60) } : {}) });
  character.gallery = capGallery(character.gallery, GALLERY_CAP, character.portrait); // CCODE-31: smart eviction — never the portrait, transient first
  return character.gallery;
}

/** SNG-110: remove an image from the gallery by its url (the stable per-image key — dedup is by url).
 *  Returns { gallery, wasPortrait } — wasPortrait true when the removed image is the current primary
 *  portrait, so the caller can regenerate (a character is never left imageless). Pure (mutates). */
export function deleteGalleryImage(character, url) {
  ensureGallery(character);
  const wasPortrait = character.portrait === url;
  character.gallery = character.gallery.filter(g => g.url !== url);
  if (wasPortrait) character.portrait = null; // caller regenerates from the current seed
  return { gallery: character.gallery, wasPortrait };
}

/** A timestamp that degrades gracefully where Date is stubbed out (tests). */
function nowStamp() { try { return new Date().toISOString(); } catch { return null; } }
