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

const STYLE = "digital painting, atmospheric concept art, muted earth tones with teal and gold accents, painterly, no text, no watermark";

export const ART_MODES = ["off", "static", "generate"];

export function getArtMode() {
  const m = localStorage.getItem("singularity.artMode");
  return ART_MODES.includes(m) ? m : "static";
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
  if (item.image) return item.image;
  if (mode !== "generate") return null;
  const safe = sanitizeImagePrompt(assembleImagePrompt("item", item), { ratingLevel });
  return imageURLFor("item", safe, item.name);
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
export function sanitizeImagePrompt(prompt, { ratingLevel = 2, isMinor = false } = {}) {
  let p = String(prompt || "");
  // always-prohibited regardless of ceiling
  p = p.replace(SEXUAL_MARKERS, " ");
  // above-ceiling scrubs
  if (ratingLevel < RATING_LEVEL["R"]) p = p.replace(GRAPHIC_VIOLENCE_MARKERS, " "); // gore only ever above R
  if (isMinor) {
    // absolute minor-protection: no romance, no sexualization, no graphic violence — at ANY ceiling
    p = p.replace(ROMANTIC_MARKERS, " ").replace(GRAPHIC_VIOLENCE_MARKERS, " ");
  }
  p = p.replace(/\s{2,}/g, " ").trim();
  const level = Math.max(0, Math.min(4, isMinor ? Math.min(ratingLevel, RATING_LEVEL["PG"]) : ratingLevel));
  const tone = isMinor ? "child, age-appropriate, wholesome, fully clothed, non-sexual, innocent" : CEILING_TONE[level];
  return [p, tone, SAFETY_TAIL].filter(Boolean).join(", ");
}

// ---------- SNG-035: prompt assembly (pure) ----------

const IMG_SIZES = {
  character: { width: 512, height: 640 },
  npc:       { width: 512, height: 640 },
  location:  { width: 1024, height: 320 },
  item:      { width: 400, height: 400 },
  moment:    { width: 1024, height: 512 }
};

/** The descriptive core of a character portrait: appearance + origin + gear + current arc. */
export function characterPromptSeed(character = {}) {
  const bits = ["character portrait"];
  if (character.appearance) bits.push(String(character.appearance).slice(0, 200));
  if (character.name) bits.push(`named ${character.name}`);
  if (character.origin) bits.push(`a ${String(character.origin).replace(/[-_]/g, " ")}`);
  if (character.background) bits.push(String(character.background).replace(/[-_]/g, " "));
  const gear = (character.inventory || []).map(i => i.name || i.itemId).filter(Boolean).slice(0, 3);
  if (gear.length) bits.push(`carrying ${gear.join(", ")}`);
  const arc = character.bio?.motivation || character.currentAim;
  if (arc) bits.push(String(arc).slice(0, 120));
  return bits.join(", ");
}

/** Assemble the raw (pre-floors) descriptive prompt for a subject of a given kind. Pure. */
export function assembleImagePrompt(kind, subject = {}, ctx = {}) {
  if (kind === "character") return characterPromptSeed(subject);
  if (kind === "npc") return `character portrait, ${subject.name || "a figure"}, ${subject.role || ""}. ${subject.appearance || subject.voiceHints || ""}`.trim();
  if (kind === "location") return `${subject.name || "a place"}: ${(subject.descriptionSeed || subject.encounterFlavor || "").slice(0, 300)}`;
  if (kind === "item") return `single item on plain dark background, ${subject.name}: ${subject.description || subject.kind || ""}`;
  if (kind === "moment") return String(subject.prompt || subject).slice(0, 300);
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
export function ensureImage(record, kind, { ratingLevel = 2, isMinor = null, seedKey = null, field = null, force = false } = {}) {
  if (!record) return null;
  const key = field || (kind === "character" ? "portrait" : "image");
  if (!force && record[key]) return record[key];
  if (!imagesEnabled()) return record[key] || null;
  const minor = isMinor == null ? isMinorSubject(record) : !!isMinor;
  const raw = assembleImagePrompt(kind, record);
  const safe = sanitizeImagePrompt(raw, { ratingLevel, isMinor: minor });
  const url = imageURLFor(kind, safe, seedKey || record.id || record.name || raw);
  record[key] = url;
  return url;
}

// ---------- SNG-035: the character gallery / Saga ----------

const GALLERY_CAP = 48;

export function ensureGallery(character) {
  if (character && !Array.isArray(character.gallery)) character.gallery = [];
  return character;
}

/** Add an image to the character's gallery (dedup by url, newest-first, capped). Pure-ish
 *  (mutates the character). Returns the gallery. */
export function addGalleryImage(character, { kind, prompt = "", url, caption = "", worldDay = null }) {
  ensureGallery(character);
  if (!url) return character.gallery;
  if (character.gallery.some(g => g.url === url)) return character.gallery;
  character.gallery.unshift({ kind, prompt: String(prompt).slice(0, 200), url, caption: String(caption).slice(0, 120), worldDay, at: nowStamp() });
  character.gallery = character.gallery.slice(0, GALLERY_CAP);
  return character.gallery;
}

/** A timestamp that degrades gracefully where Date is stubbed out (tests). */
function nowStamp() { try { return new Date().toISOString(); } catch { return null; } }
