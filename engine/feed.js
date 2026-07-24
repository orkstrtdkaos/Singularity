// feed.js — SNG-168 §2: the WORLD FEED. A scrapbook of turns players CHOSE to share with the family — a
// moment they loved, with its image. The value is the CHOOSING (Erik): never an auto-log of every turn (noise
// + a privacy hole), only deliberate posts.
//
// ⛔ THE LOAD-BEARING GUARD: a feed post is NOT CANON. It never hydrates into another player's CONTENT — that
// is the separate shared-canon path (canon.js), with its own reconciliation. The feed is a read-only surface:
// posts are appended to one shared file and rendered, lensed, on the family reader's side. Keeping these apart
// is the whole reason §2 was specced beside shared-canon — they LOOK mergeable and are not.
//
// Rides the EXISTING family-sync substrate: one global shared file (like world/canon/valley.json), merge-safe
// appends via pushMergedFile, and the SAME rating-lens shared canon uses (lensDecision) applied at READ time,
// so a post from an R-rated session never lands unfiltered in a family member's feed. Pure over its inputs.

import { lensDecision } from "./canon.js";
import { ratingLevel, isMinorProfile } from "./playerprofile.js";
import { smartClamp } from "./namematch.js";

export const FEED_PATH = "world/feed.json"; // one shared file (sync is global — one valley = the family group)
const FEED_CAP = 200;        // the shared file keeps the most recent N posts (scrapbook, not an archive)
const POST_MAX_CHARS = 6000; // a whole turn's narration fits — the words are never cut off (a runaway is still bounded)

/** SNG-168 §2: build a feed POST from a turn the player chose to share. Carries the narration (or a
 *  poster-trimmed excerpt), the turn's image, the world-date, and the provenance + RATING needed to lens it on
 *  the family reader's side (stamped from the poster's ceiling, mirroring how canon records stamp their rating).
 *  `kind`: "player" (a shared turn) or "world" (a world-tick of consequence). Pure — `at` is passed in (the
 *  caller supplies Date.now()). Returns null when there's nothing to post. */
export function buildFeedPost({ turn, character, playerKey = null, worldDay = null, worldDateLabel = "", rating = null, excerpt = null, image = null, at = 0, kind = "player" } = {}) {
  if (!turn || !character) return null;
  const text = smartClamp(String(excerpt || turn.narration || turn.text || "").trim(), POST_MAX_CHARS);
  if (!text) return null;
  return {
    id: `post-${character.id}-${Number(at || 0).toString(36)}`,           // stable + idempotent (one turn → one post)
    kind,
    playerKey: playerKey || character.playerKey || null,
    characterId: character.id || null,
    characterName: character.name || "someone",
    location: turn.scene?.setting || character.currentLocationId || null,
    worldDay, worldDateLabel,
    rating,                                                                // the poster's ceiling at post time — the lens key
    narration: text,
    image: image || turn.momentArt || turn.image || null, // caller may pass the best image (gallery fallback); else the turn's own
    postedAt: at
  };
}

/** SNG-168 §2: the merge callback body for pushMergedFile — append a post to the shared feed, idempotent (a
 *  re-post of the same turn is a no-op) and capped to the most recent FEED_CAP. Concurrent writers never clobber
 *  because pushMergedFile re-runs this against the freshly-read remote each attempt. Pure. */
export function appendFeedPost(remote, post, { cap = FEED_CAP } = {}) {
  const store = (remote && Array.isArray(remote.posts)) ? remote : { schemaVersion: 1, posts: [] };
  if (!post || !post.id) return store;
  if (store.posts.some(p => p && p.id === post.id)) return store;         // already posted — don't duplicate
  store.posts = [...store.posts, post].slice(-cap);
  return store;
}

/** SNG-168 §2: the family reader's view — reverse-chron, RATING-LENSED. A post above the viewer's ceiling is
 *  handled exactly as shared canon: "filter" (sexual / minor-gore, no in-ceiling analog) → HIDDEN entirely;
 *  "adapt" (violence/dread) → a softened stub with the image withheld (the poster's image was rendered at THEIR
 *  ceiling, so it's not shown to a lower-ceiling viewer); "show" → full. So a post never leaks content above the
 *  reader's rating. Pure over the store + the viewer's profile. */
export function feedForViewer(store, profile, { cap = 60 } = {}) {
  const posts = (store && Array.isArray(store.posts)) ? store.posts : [];
  const viewerLevel = ratingLevel(profile);
  const viewerIsMinor = isMinorProfile(profile);
  const out = [];
  for (const p of [...posts].reverse()) {
    if (!p || !p.id) continue;
    const decision = lensDecision(p.rating, viewerLevel, p.narration || "", { viewerIsMinor });
    if (decision === "filter") continue;                                  // no analog at the viewer's ceiling → gone
    if (decision === "adapt") out.push({ ...p, lensed: true, narration: "⌁ A charged moment from an intenser scene — softened for your rating.", image: null });
    else out.push({ ...p, lensed: false });
    if (out.length >= cap) break;
  }
  return out;
}
