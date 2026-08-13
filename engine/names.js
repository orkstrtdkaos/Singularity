// names.js — SNG-182. One name, one home. Everything else resolves it.
//
// Erik: "a variable being called so that it pulls the name once it knows the ID, that way you don't
// have to update a shit ton of prose… most of our entire game here would benefit from using
// functions and variables such as this."
//
// The renames exposed it; the defect is general. IDS ARE STABLE AND NAMES ARE NOT, and every place
// prose spells a name instead of resolving it is a copy that will drift. Measured before building:
// **57 ad-hoc "look the record up by id, take .name, fall back to the id" sites** across app.js and
// engine/ — 52 of them for traditions alone, and the region lookup written out twice verbatim. There
// was no resolver; there were fifty-seven of them.
//
// ANSWERING THE PO'S Q3 — resolution belongs at RENDER/ASSEMBLY, not at content load. Load is
// simpler, but SNG-111's progressive naming is PER-CHARACTER: the same NPC id is "the dock-master"
// to someone who has not learned the name and "Sorel" to someone who has. Baking a name at load
// throws that away permanently. Assembly also happens to be exactly where §2.5 needs it — the model
// is handed resolved names and never sees a token.
//
// NOT a template language (§4). Name resolution only. The moment it grows conditionals it becomes a
// second program nobody can test.

const KINDS = ["loc", "region", "npc", "tradition", "item", "ability"];

/** Where each kind's records live in the CONTENT bag, and how to read a name off one. Kept as data
 *  so adding a kind is a row, not a branch. */
const SOURCES = {
  loc: (c) => c?.locations || {},
  region: (c) => Object.fromEntries((c?.regions || []).map(r => [r.regionId || r.id, r])),
  npc: (c) => c?.npcs || {},
  tradition: (c) => c?.traditionIndex?.byId || {},
  item: (c) => c?.items || {},
  ability: (c) => c?.abilities || {}
};

/** The display name for one id. Returns null when the id resolves to nothing — the caller decides
 *  whether that is a loud failure (authored prose) or a quiet fallback (a generated reference). */
export function nameOf(kind, id, content = {}, opts = {}) {
  if (!KINDS.includes(kind) || !id) return null;
  const rec = SOURCES[kind](content)[id];
  if (!rec) return null;
  // SNG-111: a per-character override — what THIS character calls them, if they have learned it.
  // This is why resolution cannot happen at load time.
  const known = opts.character?.npcRegistry?.[id];
  if (kind === "npc" && known && !known.nameUnknown && known.name) return known.name;
  return rec.name || rec.label || null;
}

const TOKEN = /\{\{\s*(\w+)\s*:\s*([\w.-]+)\s*\}\}/g;

/** Replace every `{{kind:id}}` token in a string with the current display name.
 *
 *  An unresolvable token is the `loreRefs` lesson applied in advance: `.filter(Boolean)` swallowed
 *  every miss there and 84 of 95 locations delivered nothing for months. So a miss is NEVER silently
 *  blanked and NEVER shown raw to a player — it is reported to `onMissing` (CI fails on it) and, at
 *  runtime, degrades to the id in a readable form so the sentence still means something.
 */
export function renderNames(text, content = {}, opts = {}) {
  if (typeof text !== "string" || !text.includes("{{")) return text;
  const onMissing = typeof opts.onMissing === "function" ? opts.onMissing : null;
  return text.replace(TOKEN, (raw, kind, id) => {
    const name = nameOf(kind, id, content, opts);
    if (name) return name;
    if (onMissing) onMissing({ kind, id, raw });
    // readable degradation — never the raw token, never an empty hole
    return String(id).replace(/_/g, " ");
  });
}

/** Every token in a string, for CI and for tooling. Pure. */
export function tokensIn(text) {
  const out = [];
  if (typeof text !== "string") return out;
  for (const m of text.matchAll(TOKEN)) out.push({ kind: m[1], id: m[2], raw: m[0] });
  return out;
}

/** Walk any authored structure and collect its tokens with a path, so a CI failure can say WHERE. */
export function collectTokens(value, path = "") {
  const out = [];
  if (typeof value === "string") { for (const t of tokensIn(value)) out.push({ ...t, path }); return out; }
  if (Array.isArray(value)) { value.forEach((v, i) => out.push(...collectTokens(v, `${path}[${i}]`))); return out; }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) out.push(...collectTokens(v, path ? `${path}.${k}` : k));
  }
  return out;
}

/** Resolve every string in a structure. Used at prompt assembly so the model is handed names and
 *  never token syntax (§2.5), and by any render surface that shows authored prose. */
export function renderNamesDeep(value, content = {}, opts = {}) {
  if (typeof value === "string") return renderNames(value, content, opts);
  if (Array.isArray(value)) return value.map(v => renderNamesDeep(v, content, opts));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = renderNamesDeep(v, content, opts);
    return out;
  }
  return value;
}

export const NAME_KINDS = KINDS;

// ─────────────────────────────────────────────────────────────────────────────
// SNG-431 §1 — ONE NAMER.
//
// Aevi's finding, and it is the whole ticket: *"there is no point in the system where a person gets a
// name."* Three paths mint people and each has its own defensible fallback:
//
//   GM narration → npcRegistry   writes whatever the model put in the field   → "Boy (name unknown)"
//   mintFigure   (worldtick.js)  writes an EPITHET, sets provisional:true      → "the one who outlived
//                                                                                Cinder Vael, the Wright
//                                                                                Who Would Not Stop"
//   backfill.js                  does not name at all
//
// ⚠️ EACH FALLBACK IS RIGHT ON ITS OWN. `mintFigure`'s comment is correct — *"the engine mints the slot
// and the story; naming is authorship"* — and an unnamed person is a legitimate thing for the GM to
// narrate. ⛔ THE GAP IS THAT NOTHING EVER CAME BACK TO AUTHOR, and `worldtick.js` does not import this
// file. So the ask is not three better fallbacks; it is one function all three call.
//
// This is that function. It answers exactly one question — *what goes in the `name` field* — and it has
// three answers, in order:
//   1. The fiction named them. Keep it.
//   2. The WORLD is minting them and pools exist. Draw a name in grain.
//   3. Nobody named them and nothing can. Then the field must not PRETEND to hold a name: keep the
//      descriptive words as a label and set `nameUnknown`, which `nameOf` above already reads and which
//      nothing has ever written. (A reader with no writer — the fourth door, again.)

/** ⛔ THE PLACEHOLDER SHAPE, ONE DEFINITION. This regex is Aevi's gate verbatim, and the writer below and
 *  the test that polices it import the SAME constant — a gate spelling out its own copy of the rule is a
 *  gate that stays green while the writer drifts. */
export const PLACEHOLDER_NAME = /unknown|unnamed|placeholder|\(name/i;

/** ⛔ A NAME THAT LONG IS A SENTENCE (Aevi). Applies to what the ENGINE mints — authored names are
 *  authorship, and three of them are longer on purpose. */
export const MINTED_NAME_MAX = 40;

/** The engine's `originKind` vocabulary is not quite the pools' — `vacancy_filled` is the worldtick key,
 *  `vacancy` is the authored one. Mapped here rather than renamed at either end: `vacancy_filled` is also
 *  the key into `personalVerbsByOrigin`, so renaming it would silently empty that pool. */
export const ORIGIN_KIND_ALIAS = { vacancy_filled: "vacancy" };

/** True when this string is a disclaimer wearing a name field. */
export function isPlaceholderName(s) {
  const t = String(s || "").trim();
  return !t || PLACEHOLDER_NAME.test(t);
}

/** A resolved name as a person would SAY it mid-sentence. Aevi: *"a double article on a raw id, and the id
 *  is shown to a player… must not prepend 'the' to a name that already has one."*
 *
 *  ⚠️ SO IT PREPENDS NOTHING. Names in this world carry their own article or refuse one — "The Ceaseless"
 *  has one, "Millbrook" does not — and a template that supplies the article gets exactly one of the two
 *  wrong. It only lower-cases the leading "The", because "of the Ceaseless" is the authored line and "of
 *  The Ceaseless" is a title dropped into a sentence. `nameOf` is the id half of the same fix. */
export function asSpoken(name) {
  const s = String(name || "").trim();
  if (!s) return "";
  return /^The\s/.test(s) ? `the ${s.slice(4)}` : s;
}

/** What is left of a placeholder once the disclaimer is removed: "Boy (name unknown)" → "Boy",
 *  "Unknown farmer" → "Farmer", "Unknown (east bank traveler)" → "East bank traveler". Falls back to the
 *  role, and only then to a word. Never title-cases past the first letter — this is a LABEL for a person
 *  whose name is unknown, not a name, and "The Boy Sweeping The Cookhouse" is neither. */
function descriptorLabel(raw, role, max) {
  let s = String(raw || "");
  s = s.replace(/\([^)]*\b(?:unknown|unnamed|placeholder)\b[^)]*\)/gi, " "); // a parenthetical that IS the disclaimer
  s = s.replace(/[()[\]]/g, " ");                                            // any bracket left is punctuation
  s = s.replace(/\b(?:name\s+)?(?:unknown|unnamed|placeholder)\b/gi, " ");
  s = s.replace(/\s+/g, " ").replace(/^[\s,;:—–-]+|[\s,;:—–-]+$/g, "").trim();
  const label = s || String(role || "").trim();
  if (!label) return "Someone";
  return (label.charAt(0).toUpperCase() + label.slice(1)).slice(0, max);
}

/** ⛔ SNG-432: A POOL ENTRY IS EITHER A STRING OR `{text, tone}`. Aevi marked all 146 bynames dark/formal/
 *  plain, and this reader filtered on `typeof x === "string"` — so every byname pool read as EMPTY the
 *  moment her content landed and nobody could be named at all. ⚠️ The §1 gates caught it loudly (36 of 36
 *  figures provisional), which is the whole reason they exist. Both shapes are accepted: `given` is still
 *  strings, and a pool authored either way keeps working. */
const entriesOf = (p) => (Array.isArray(p) ? p : []).map(x =>
  typeof x === "string" ? { text: x.trim(), tone: null }
    : (x && typeof x.text === "string" ? { text: x.text.trim(), tone: x.tone || null } : null)
).filter(e => e && e.text);

const poolFor = (pools, group, key) => {
  const g = pools?.[group] || {};
  return entriesOf((key && g[key]) || g._default || []);
};

/** ⛔ SNG-432 — WHICH TONE AN ORIGIN REACHES FOR (Aevi). A survivor is named for what it cost; a successor
 *  holds an office now and the name is half a title; someone who stepped into a gap nobody planned gets
 *  whatever people started calling them. */
const ORIGIN_TONE = { casualty_survivor: "dark", faction_leaderless: "formal", vacancy: "plain" };

/** The want a figure of this origin carries. Aevi: *"`wants` MUST BE A WANT, NOT AN ORIGIN."* Today it
 *  holds the origin sentence, so a figure's stated desire reads "of the the_ceaseless; watched X called
 *  out, and outlived them" — while `origin` sits right there as its own field, already populated. */
export function mintedWants(originKind, pools) {
  const key = ORIGIN_KIND_ALIAS[originKind] || originKind || "_default";
  const w = pools?.wants || {};
  return w[key] || w._default || null;
}

/** Draw a name IN GRAIN from the authored pools: a given name from the figure's own tradition, and a
 *  byname built from that tradition's own craft-words.
 *
 *  ⛔ THE SHAPE IS ERIK'S, and Aevi got it wrong twice before he named it: NAME + THE + SHORT NOUN PHRASE.
 *  No verb, no "who", no clause. *Gandalf the White · Pell the Iron Hammer · Sera Voight the Ashvow.*
 *  THE TEST IS WHETHER IT CAN BE SHOUTED ACROSS A BATTLEFIELD.
 *
 *  Two-part first ("Sera the Ashvow"), which is `_howToUse` exactly. The three-part form — Erik's own
 *  "Silas Weir the Necro-Wright" — is the OVERFLOW, reached only once the two-part space for a tradition
 *  is spent, with the family name drawn from the `_default` given pool (Vail, Holt, Ravel, Dane read as
 *  surnames, and Aevi's own repair is that shape). So collisions ESCALATE rather than collide, and a world
 *  that runs long does not end up with two Sera the Ashvows.
 *
 *  Returns null when the pools cannot supply a name — the caller keeps whatever fallback it had. A namer
 *  that invents out of nothing is the same authorship gap one layer down.
 */
export function mintedName({ tradition = null, originKind = "_default", pools = null,
                             rng = Math.random, taken = [] } = {}) {
  const givens = poolFor(pools, "given", tradition);
  const bynames = poolFor(pools, "byname", tradition);
  if (!givens.length || !bynames.length) return null;
  const surnames = poolFor(pools, "given", "_default");
  const used = new Set((taken || []).map(n => String(n || "").trim().toLowerCase()).filter(Boolean));
  const fits = (s) => s.length <= MINTED_NAME_MAX && !used.has(s.toLowerCase());
  const key = ORIGIN_KIND_ALIAS[originKind] || originKind || "";
  const salt = String(key).length;
  const gi = Math.floor(rng() * givens.length) + salt;
  const bi = Math.floor(rng() * bynames.length) + salt;
  const si = Math.floor(rng() * surnames.length);
  // ⛔ SNG-432 — THE ORIGIN NOW SHARPENS THE BYNAME, because the tone is marked. It could not before: I said
  // position does not carry it and left the draw unsharpened rather than invent an ordering, and Aevi marked
  // all 146 entries dark/formal/plain in reply.
  //
  // ⚠️ PREFER, NOT REQUIRE — her rule, and the ordering IS the rule: the tone-matching entries of this
  // tradition come first, then the REST OF THE SAME TRADITION. "A tradition-correct name of the wrong tone
  // beats a generic one of the right tone every time: the tradition is who they are, the tone is only how
  // they came to it." Nothing falls through to `_default` while the tradition has any entry at all — and
  // some traditions have only one tone on purpose (churnfolk are all plain, and that is authored, not a gap).
  const rot = (arr, n) => arr.map((_, i) => arr[(((n % arr.length) + arr.length) % arr.length + i) % arr.length]);
  const wantTone = ORIGIN_TONE[key] || null;
  const pref = wantTone ? bynames.filter(b => b.tone === wantTone) : [];
  const rest = wantTone ? bynames.filter(b => b.tone !== wantTone) : bynames;
  const ordered = [...(pref.length ? rot(pref, bi) : []), ...(rest.length ? rot(rest, bi) : [])];
  for (const by of ordered) {
    for (let g = 0; g < givens.length; g++) {
      const first = givens[(gi + g) % givens.length].text;
      const cand = `${first} ${by.text}`;
      if (fits(cand)) return { name: cand, given: first, surname: null, byname: by.text, tone: by.tone };
    }
  }
  for (let s = 0; s < surnames.length; s++) {
    const fam = surnames[(si + s) % surnames.length].text;
    for (const by of ordered) {
      for (let g = 0; g < givens.length; g++) {
        const first = givens[(gi + g) % givens.length].text;
        if (first === fam) continue;
        const cand = `${first} ${fam} ${by.text}`;
        if (fits(cand)) return { name: cand, given: first, surname: fam, byname: by.text, tone: by.tone };
      }
    }
  }
  return null;   // genuinely exhausted
}

/** ⛔ THE ONE NAMER. Every path that creates a person calls this and takes what it returns.
 *
 *  @param proposed  what the caller already has, if anything — the GM's `name`, or null
 *  @param role      what they are; used only when nobody named them
 *  @param pools     `rules.mintedNames`. Absent, this never invents a name.
 *  @returns {{name:string, nameUnknown:boolean, minted:boolean, byname?:string}}
 */
export function personName({ proposed = "", role = "", pools = null, tradition = null,
                            originKind = "_default", rng = Math.random, taken = [], max = 60 } = {}) {
  const raw = String(proposed || "").trim();
  if (raw && !PLACEHOLDER_NAME.test(raw)) return { name: raw.slice(0, max), nameUnknown: false, minted: false };
  const m = pools ? mintedName({ tradition, originKind, pools, rng, taken }) : null;
  if (m) return { name: m.name, byname: m.byname, nameUnknown: false, minted: true };
  return { name: descriptorLabel(raw, role, max), nameUnknown: true, minted: false };
}
