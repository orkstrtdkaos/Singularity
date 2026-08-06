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
  moment:    { width: 1024, height: 512 },
  beast:     { width: 640, height: 512 } // CCODE-31: a creature study — wider than a portrait, a thing that comes AT you
};

/** SNG-053: the physical FORM of a subject — its species/lineage/embodiment, in words. This LEADS
 *  every character/NPC prompt so a non-human form (an Ent, a construct, a beast-kin) actually
 *  renders non-human, instead of the literal "character portrait" prefix biasing the model to a
 *  plain human. Explicit form/lineage/appearance wins; otherwise a neutral human default (human is
 *  a stated value, never the unspoken assumption). */
export function formOf(subject = {}) { // registry:internal
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
export function npcPromptSeed(npc = {}, character = {}) {
  const lead = String(npc.appearance || npc.form || formOf(npc) || npc.description || npc.role || npc.name || "a person").slice(0, 200);
  const bits = [`${lead}, character portrait`];
  if (npc.name) bits.push(`named ${npc.name}`);
  if (npc.gender || npc.pronouns) bits.push(String(npc.gender || npc.pronouns).slice(0, 40)); // SNG-143: state gender explicitly so the generator can't default (the Pell-rendered-male fix)
  if (npc.role) bits.push(String(npc.role).slice(0, 100));
  const label = [npc.bondStage, npc.bondType].filter(Boolean).join(" ").trim();
  if (label) bits.push(`${label} to ${character.name || "the traveler"}`);
  if (npc.voiceHints) bits.push(String(npc.voiceHints).slice(0, 100));
  return bits.join(", ");
}

/** Assemble the raw (pre-floors) descriptive prompt for a subject of a given kind. Pure. */
export function assembleImagePrompt(kind, subject = {}, ctx = {}) {
  if (kind === "character") return characterPromptSeed(subject, ctx);
  if (kind === "npc") return npcPromptSeed(subject, ctx.character || {}); // SNG-136: richer seed w/ bond-to-player
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
  const safe = sanitizeImagePrompt(raw, { ratingLevel, isMinor: minor }); // THE FLOORS run AFTER every addition
  const url = imageURLFor(kind, safe, seedKey || record.id || record.name || raw);
  record[key] = url;
  return url;
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
export function addGalleryImage(character, { kind, prompt = "", url, caption = "", worldDay = null }) {
  ensureGallery(character);
  if (!url) return character.gallery;
  if (character.gallery.some(g => g.url === url)) return character.gallery;
  character.gallery.unshift({ kind, prompt: String(prompt).slice(0, 200), url, caption: String(caption).slice(0, 120), worldDay, at: nowStamp() });
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
