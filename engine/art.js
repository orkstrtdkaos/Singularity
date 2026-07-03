// art.js — images for locations, items, NPCs. Two sources, one seam:
//   1. Static files: any record with an `image` field (path under the repo, or URL).
//   2. Generation: for records WITHOUT an image, a pluggable provider builds one
//      from the record's own description. v0.2 provider: Pollinations (free,
//      keyless, URL-based — works straight from the browser; images are cached
//      by URL so a location always looks the same).
// Setting: singularity.artMode = "off" | "static" | "generate" (default "static").

const STYLE = "digital painting, atmospheric concept art, muted earth tones with teal and gold accents, painterly, no text, no watermark";

export const ART_MODES = ["off", "static", "generate"];

export function getArtMode() {
  const m = localStorage.getItem("singularity.artMode");
  return ART_MODES.includes(m) ? m : "static";
}
export function setArtMode(m) { if (ART_MODES.includes(m)) localStorage.setItem("singularity.artMode", m); }

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
export function locationImage(location) {
  const mode = getArtMode();
  if (mode === "off") return null;
  if (location.image) return location.image;
  if (mode !== "generate") return null;
  const prompt = `${location.name}: ${location.descriptionSeed.slice(0, 300)}`;
  return pollinationsURL(prompt, { width: 1024, height: 320, seed: seedFrom(location.id) });
}

/** Image URL for an item (examine view), or null. */
export function itemImage(item) {
  const mode = getArtMode();
  if (mode === "off") return null;
  if (item.image) return item.image;
  if (mode !== "generate") return null;
  const prompt = `single item on plain dark background, ${item.name}: ${item.description || item.kind}`;
  return pollinationsURL(prompt, { width: 400, height: 400, seed: seedFrom(item.name) });
}

/** Image URL for an NPC portrait, or null. */
export function npcImage(npc) {
  const mode = getArtMode();
  if (mode === "off") return null;
  if (npc.image) return npc.image;
  if (mode !== "generate") return null;
  const prompt = `character portrait, ${npc.name}, ${npc.role}. ${npc.voiceHints || ""}`;
  return pollinationsURL(prompt, { width: 400, height: 500, seed: seedFrom(npc.id) });
}
