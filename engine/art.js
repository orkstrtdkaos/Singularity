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

// ⚠️ CCODE-174: EXPORTED, because it is part of every prompt and was invisible. It is appended at URL-build
// time, AFTER the prompt that gets stored — so the details panel was showing the player a prompt that was
// not the whole prompt. "Let me see the prompt that generated the image" has to mean all of it.
export const IMAGE_STYLE = "digital painting, atmospheric concept art, muted earth tones with teal and gold accents, painterly, no text, no watermark";
const STYLE = IMAGE_STYLE;

export const ART_MODES = ["off", "static", "generate"];

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

function pollinationsURL(prompt, { width = 1024, height = 320, seed = 42 } = {}) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ", " + STYLE)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
}

/** Image URL for a location banner, or null if art is off / nothing available. */
export function locationImage(location, { ratingLevel = 2 } = {}) {
  const mode = getArtMode();
  if (mode === "off") return null;
  if (location.image) return location.image;
  if (mode !== "generate") return null;
  const safe = sanitizeImagePrompt(assembleImagePrompt("location", location), { ratingLevel });
  return imageURLFor("location", safe, location.id);
}

/** Scene-level banner: in generate mode, the image follows the SCENE — a cottage
 *  interior, a dock at dusk — built from the scene anchor's own setting text
 *  (seeded by it, so the same scene keeps the same image across re-renders).
 *  Falls back to the location banner otherwise. */
export function sceneImage(location, sceneState, { ratingLevel = 2 } = {}) {
  const mode = getArtMode();
  if (mode === "generate" && sceneState?.setting) {
    const safe = sanitizeImagePrompt(`${location.name} — ${sceneState.setting.slice(0, 280)}`, { ratingLevel });
    return imageURLFor("location", safe, sceneState.setting);
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
  const safe = sanitizeImagePrompt(assembleImagePrompt("item", item), { ratingLevel });
  // `imageStamp` increments on every evolution, so it BUSTS the cache key — the new stage gets a genuinely
  // new image instead of the memoised one keyed on the (unchanged) item name.
  const seed = item.imageStamp ? `${item.name}#${item.imageStamp}` : item.name;
  return imageURLFor("item", safe, seed);
}

/** Image URL for an NPC portrait, or null. */
export function npcImage(npc) {
  const mode = getArtMode();
  if (mode === "off") return null;
  if (npc.image) return npc.image;
  if (mode !== "generate") return null;
  const prompt = assembleImagePrompt("npc", npc);
  return imageURLFor("npc", sanitizeImagePrompt(prompt, { ratingLevel: 2, isMinor: isMinorSubject(npc) }), npc.id);
}

// ---------- SNG-035: THE FLOORS FOR IMAGES (rating ceiling + absolute minor-protection) ----------
// Every image prompt routes through here before it ever reaches the endpoint — the same
// non-negotiable the text generator enforces (generate.js enforceFloors), applied to pixels:
// no image sexualizes a minor, and no image exceeds the viewer's content ceiling. Pure.

const SEXUAL_MARKERS = /\b(sexual|erotic|nude|naked|nudity|seduc\w*|lust\w*|carnal|aroused|fondl\w*|sensual|lingerie|underwear|topless|provocative|suggestive|fetish)\b/gi;
const ROMANTIC_MARKERS = /\b(romantic|romance|kiss\w*|embrac\w*|lover|passion\w*|intimate)\b/gi;
const GRAPHIC_VIOLENCE_MARKERS = /\b(gore|gory|blood(y|ied|bath)?|disembowel\w*|mutilat\w*|eviscerat\w*|dismember\w*|torture|flay\w*|decapitat\w*|corpse|entrails)\b/gi;

// Per-ceiling tone modifier appended to the prompt (index by numeric RATING_LEVEL).
const CEILING_TONE = [
  "wholesome, gentle, family-friendly, no violence, no gore",          // 0 G
  "adventurous, mild, no gore",                                        // 1 PG
  "dramatic, mild peril, no gore",                                     // 2 PG-13
  "dark, intense, dramatic",                                           // 3 R
  "dark, intense, cinematic, mature dramatic tone"                     // 4 R+
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
const TONE_RE = new RegExp(",?\\s*(?:" + [...CEILING_TONE, MINOR_TONE].map(escRe174).join("|") + ")", "gi");

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
  p = p.replace(/\s{2,}/g, " ").replace(/\s+,/g, ",").replace(/,(\s*,)+/g, ",").replace(/(^[\s,]+|[\s,]+$)/g, "").trim();
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
export function imageURLFor(kind, safePrompt, seedKey = "") {
  const size = IMG_SIZES[kind] || IMG_SIZES.moment;
  return pollinationsURL(safePrompt, { ...size, seed: seedFrom(String(seedKey) || safePrompt) });
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
  const url = imageURLFor(kind, safe, seedKey || likenessSeed(promptOpts.keeps || []) || record.id || record.name || raw);
  record[key] = url;
  return url;
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
const FRAMING_CLAUSE = /^(?:character portrait|named .+|a person|single item on plain dark background|a dangerous creature.*|rendered in the aesthetic of .+|.*portrait)$/i;

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
  return { url: imageURLFor(kind, safe, nextKey), seedKey: nextKey, prompt: safe };
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
