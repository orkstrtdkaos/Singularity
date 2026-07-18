// narration_voice.js — SNG-155. The narration reads aloud, for family play at a table.
//
// §1 THE FREE HALF, FIRST. The default voice is usually the WORST one installed: platforms ship
// high-quality voices that getVoices() already exposes but does not prefer. Heimrún's picker takes
// the first LANGUAGE match (correct for Old Norse consonant clusters, wrong for sounding human) —
// which on most devices lands on the oldest formant voice present. Ranking on quality markers
// instead costs nothing: no key, no network, no latency.
//
// §3b THE SPEAKABLE PROJECTION. Read-aloud speaks the NARRATION, not the interface. Choices,
// energy costs, dice math and receipts are UI and must never be spoken. That projection is defined
// here as a function of the turn object — not a regex over the DOM at speak-time, which would
// re-derive it differently every render and break the moment the markup changes.
//
// Tier 0 (silent) is always available: no speechSynthesis, no key, no voices → play continues and
// nothing errors (Law 5).

/** Quality markers, best first. These are the substrings platforms actually use:
 *  macOS/iOS Enhanced + Premium, Chrome's Google voices, Edge's Microsoft "Online (Natural)"
 *  neural voices, Apple's Siri voices. Ranked, not filtered — a device with none of them still
 *  gets a sensible pick. */
const QUALITY_MARKERS = [
  { re: /\bnatural\b/i, score: 60 },
  { re: /\bneural\b/i, score: 58 },
  { re: /\bpremium\b/i, score: 50 },
  { re: /\benhanced\b/i, score: 45 },
  { re: /\bsiri\b/i, score: 42 },
  { re: /\bonline\b/i, score: 38 },
  { re: /\bgoogle\b/i, score: 30 },
  { re: /\bmicrosoft\b/i, score: 12 }
];
// Known-poor legacy formant voices — the ones that make it sound like a machine.
const LEGACY_MARKERS = [/\balbert\b/i, /\bzarvox\b/i, /\bbad news\b/i, /\bbells\b/i, /\bboing\b/i,
  /\bbubbles\b/i, /\bcellos\b/i, /\bjunior\b/i, /\bralph\b/i, /\bfred\b/i, /\bkathy\b/i, /\bprincess\b/i,
  /\btrinoids\b/i, /\bwhisper\b/i, /\bwobble\b/i, /\borganfont\b/i, /\bsuperstar\b/i];

/** PURE. Score one voice. Higher is better. Language match is a tie-breaker BELOW quality —
 *  the opposite of Heimrún's ordering, and the whole point of §1. */
export function voiceScore(voice, { lang = "en" } = {}) {
  if (!voice) return -Infinity;
  const name = String(voice.name || "");
  let score = 0;
  for (const m of QUALITY_MARKERS) if (m.re.test(name)) { score += m.score; break; }
  if (LEGACY_MARKERS.some(re => re.test(name))) score -= 40;
  const vl = String(voice.lang || "").toLowerCase();
  const want = String(lang || "").toLowerCase();
  if (vl === want) score += 12;
  else if (vl.split("-")[0] === want.split("-")[0]) score += 8;
  // A WRONG-LANGUAGE VOICE IS DISQUALIFYING, not merely penalised. A Japanese "Premium Natural"
  // outscored a plain en-US voice on quality markers alone and would have read the narration in
  // a ja-JP accent — worse than any formant voice. Quality ranks WITHIN a language, never across.
  else score -= 200;
  if (voice.localService === false) score += 4; // network voices are usually the newer ones
  if (voice.default) score += 1;                // only ever a tie-break
  return score;
}

/** PURE. All usable voices, BEST FIRST — this is the order the picker UI shows, so the good ones
 *  are what a player sees (spec §1: "ship the ranked list worst-last"). */
export function rankVoices(voices, opts = {}) {
  return [...(voices || [])]
    .filter(v => v && v.name)
    .map(v => ({ voice: v, score: voiceScore(v, opts) }))
    .sort((a, b) => b.score - a.score || String(a.voice.name).localeCompare(String(b.voice.name)))
    .map(x => x.voice);
}

/** PURE. The chosen voice: an explicit player pick wins; otherwise the best-ranked. Null when the
 *  device has no voices at all (tier 0). */
export function pickVoice(voices, { preferredName = null, lang = "en" } = {}) {
  const list = voices || [];
  if (preferredName) {
    const exact = list.find(v => v?.name === preferredName);
    if (exact) return exact;
  }
  return rankVoices(list, { lang })[0] || null;
}

// ---------- §3b the speakable projection ----------

/** Strip what the ear cannot use. Markdown emphasis, the engine's own ✦/▲ aside markers, and
 *  bracketed stage directions are INTERFACE, not narration. */
function cleanForSpeech(text) {
  return String(text || "")
    .replace(/\*+([^*]+)\*+/g, "$1")            // *emph* / **bold** → plain
    .replace(/[✦▲★◆◇⚖⏹◈🌍]\s*/g, "")           // engine aside glyphs, wherever they sit (not only line-start)
    .replace(/`{1,3}[^`]*`{1,3}/g, "")           // code/receipt spans
    .replace(/\((?:[^()]{0,80})\)/g, m => (/\b(hp|energy|xp|d100|rank|tier|\d)\b/i.test(m) ? "" : m)) // numeric parentheticals only
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** PURE. THE SPEAKABLE PROJECTION of a turn (spec §3b). Narration and dialogue only —
 *  never choices, never energy costs, never dice math, never receipts. Defined on the TURN
 *  OBJECT so it is stable regardless of how the play surface renders. */
export function speakableText(turn, { includeAside = false } = {}) {
  if (!turn) return "";
  const parts = [cleanForSpeech(turn.narration)];
  if (includeAside && turn.aside) parts.push(cleanForSpeech(turn.aside));
  return parts.filter(Boolean).join("\n\n").trim();
}

/** PURE. Split into utterance chunks on SENTENCE boundaries, so speech can start on the first
 *  chunk while the rest is still arriving (spec §2: latency is the design constraint). Keeps
 *  dialogue attached to its attribution — the game writes em-dash-heavy prose, and splitting on a
 *  dash would strand "said Pell" as its own utterance. */
export function chunkForSpeech(text, { maxChars = 240 } = {}) {
  const clean = String(text || "").trim();
  if (!clean) return [];
  const sentences = clean.match(/[^.!?…]+(?:[.!?…]+["'”’)]*|\n+|$)/g) || [clean];
  const out = [];
  let buf = "";
  for (const raw of sentences) {
    const s = raw.replace(/\s+/g, " ").trim();
    if (!s) continue;
    if (!buf) buf = s;
    else if ((buf + " " + s).length <= maxChars) buf += " " + s;
    else { out.push(buf); buf = s; }
  }
  if (buf) out.push(buf);
  return out;
}

// ---------- §3a the prose signal ----------

/** PURE. The GM_CONTEXT row's value. Read-aloud is a PROSE CONSTRAINT, not only an output
 *  channel: text written to be read silently is not text written to be spoken. Returns null when
 *  read-aloud is off, so the row costs nothing in a silent session. */
export function readAloudDirective(enabled) {
  if (!enabled) return null;
  return `THIS SESSION IS BEING READ ALOUD at a table, with children listening. Write prose for the EAR:
- One idea per sentence. The ear cannot hold a parenthetical aside or a stack of em-dashes — where you would use either, make a new sentence.
- Attribute dialogue so a listener can follow who is speaking ("said Pell," not a bare quoted line). Never two unattributed lines in a row.
- Name things plainly on first mention in a beat; a listener cannot glance back up the page.
- Numbers, costs, and mechanics are NOT spoken — keep them out of the narration entirely; the interface shows them.
This shapes the PROSE only. It changes nothing about what happens, and it never softens content — the rating and the floors are unaffected.`;
}
