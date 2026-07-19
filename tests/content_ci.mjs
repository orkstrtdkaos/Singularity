// content_ci.mjs — SNG-BATCH-10 Phase 4 / SNG-040/064: the content integrity gate.
// The manifest bug ran the live game on SIX locations for weeks, silently — a load whitelist
// out of sync with the files on disk, and a provides.* key (quests) the loader never read. This
// FAILS THE BUILD on that whole class of bug so content can never silently not-exist again.
//
// Run: node tests/content_ci.mjs   (exit 1 on any violation)

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validate } from "../engine/genschema.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rj = rel => JSON.parse(readFileSync(join(root, rel), "utf8"));

let failures = 0;
const fail = msg => { console.log("FAIL  " + msg); failures++; };
const ok = msg => console.log("ok    " + msg);
const check = (label, cond, detail = "") => cond ? ok(label) : fail(label + (detail ? " — " + detail : ""));

// The provides.* keys each pack's loader (engine/state.js) actually READS. A manifest key not in
// this set is content the engine cannot see — exactly what bit quests. Keep in sync with state.js.
const HANDLED = {
  core: new Set(["spectrums", "rules", "abilities", "items"]),
  valley: new Set(["locations", "npcs", "events", "companions", "lore", "encounters", "items", "quests"]),
};

const PACKS = [
  { key: "core", dir: "content/packs/core", manifest: "content/packs/core/manifest.json" },
  { key: "valley", dir: "content/packs/valley", manifest: "content/packs/valley/manifest.json" },
];

// Subdirs that are PURELY manifest-driven (every .json must be listed). SNG-092: core/rules and
// core/abilities are now whitelists too — every rules + abilities file is in provides.* and the loader
// reads ONLY through the manifest (no hardcoded paths, no positional rules[0]). This is the check that
// was missing: it used to cover the VALLEY manifest only, so an unlisted core rules or ability file
// (attribute_gates jumping to rules[0]; 4 reach_* files never loading) sailed straight through.
const STRICT_DIRS = { core: ["rules", "abilities"], valley: ["locations", "npcs", "events", "companions", "encounters", "items", "lore"] };

for (const pack of PACKS) {
  const m = rj(pack.manifest);
  const provides = m.provides || {};

  // (1) every provides.* key is one the loader handles
  for (const key of Object.keys(provides)) {
    check(`[${pack.key}] provides.${key} is a key the loader reads`, HANDLED[pack.key].has(key),
      "the loader never reads it — this content silently does not load (see quests, SNG-065)");
  }

  // (2) every manifest path points to a file that exists
  const listed = {};
  for (const [key, val] of Object.entries(provides)) {
    const paths = Array.isArray(val) ? val : [val];
    listed[key] = new Set();
    for (const p of paths) {
      const abs = `${pack.dir}/${p}`;
      check(`[${pack.key}] manifest ${key} → ${p} exists`, existsSync(join(root, abs)), "manifest path with no file");
      listed[key].add(p.split("/").pop());
    }
  }

  // (3) every file in a strictly-manifest-driven dir is listed (no silent unlisted content)
  for (const sub of (STRICT_DIRS[pack.key] || [])) {
    const dirAbs = join(root, pack.dir, sub);
    if (!existsSync(dirAbs)) continue;
    const onDisk = readdirSync(dirAbs).filter(f => f.endsWith(".json") || f.endsWith(".md"));
    // the manifest key for a subdir is the plural (locations/npcs/…); lore/items match by dir name
    const key = Object.keys(provides).find(k => (Array.isArray(provides[k]) ? provides[k] : [provides[k]]).some(p => String(p).startsWith(sub + "/")));
    const listedSet = key ? listed[key] : new Set();
    for (const f of onDisk) check(`[${pack.key}] ${sub}/${f} is listed in the manifest`, listedSet.has(f), "on disk but not a manifest whitelist entry (SNG-064)");
  }
}

// (3b) SNG-089 — THE notFor LAW + harm-rung validity. A `notFor` may constrain HOW an ability serves
// a need; it may NEVER forbid the need itself. An ability tagged FIGHT whose notFor forbids harm/
// fighting outright is the palework-boar bug (the GM reads the prose, so the prose wins). Patterns are
// CONSERVATIVE — clear need-negations only, never degree-caps ("does not slay/smite" = a legal cap) —
// so a legitimate cap can never false-fail the build. And a harmRung, when set, must be a real rung.
{
  const HARM_RUNGS = new Set(["lethal", "damaging", "incapacitating", "none"]);
  // "forbid the need" phrasings that are ILLEGAL on a FIGHT-tagged craft (not degree-caps):
  const forbidsHarm = nf => {
    const s = String(nf || "").toLowerCase();
    return /\bcannot\s+(be\s+used\s+to\s+)?(fight|harm|hurt|injure|damage)\b/.test(s)
      || /\b(cannot|will\s+not|does\s+not)\s+(be\s+used\s+)?(on|against)\s+(the\s+)?living\b/.test(s)
      || /\bforce\s+(the\s+living|.{0,15}?)\bto\s+die\b/.test(s)
      || /\b(cannot|does\s+not)\s+help\s+you\s+(escape|flee|get\s+away)\b/.test(s);
  };
  const abFiles = (rj("content/packs/core/manifest.json").provides?.abilities) || [];
  let total = 0;
  for (const rel of abFiles) {
    let doc; try { doc = rj(`content/packs/core/${rel}`); } catch { continue; }
    const abs = Array.isArray(doc) ? doc : Array.isArray(doc.abilities) ? doc.abilities : [doc];
    for (const a of abs) {
      if (!a || !a.id) continue;
      total++;
      const cts = (a.challengeTypes || []).map(String);
      if (cts.includes("FIGHT")) {
        check(`ability "${a.id}" FIGHT + notFor obeys the notFor LAW`, !forbidsHarm(a.notFor),
          `notFor forbids the NEED, not just the HOW: "${String(a.notFor || "").slice(0, 80)}" — a FIGHT craft may cap HOW it harms, never forbid harm itself (SNG-089)`);
      }
      if (a.harmRung != null) {
        check(`ability "${a.id}" harmRung "${a.harmRung}" is a real rung`, HARM_RUNGS.has(a.harmRung),
          "must be lethal | damaging | incapacitating | none");
      }
    }
  }
  ok(`the notFor LAW checked ${total} abilities across ${abFiles.length} files`);
}

// (3e) ability-arch v2 — schema shape for the new fields. Validates WHERE PRESENT (the classification
// pass tags content incrementally), warns on the legacy spend path, and REPORTS the ability count so
// the §7 header is script-generated, never hand-set (both Aevi's 137 and CCode's 233 were wrong; 247).
{
  const warn = msg => console.log("warn  " + msg);
  const abFiles = (rj("content/packs/core/manifest.json").provides?.abilities) || [];
  let count = 0, tagged = 0, native = 0, combination = 0, spendCount = 0;
  for (const rel of abFiles) {
    let doc; try { doc = rj(`content/packs/core/${rel}`); } catch { continue; }
    const abs = Array.isArray(doc) ? doc : Array.isArray(doc.abilities) ? doc.abilities : [doc];
    for (const a of abs) {
      if (!a || !a.id) continue;
      count++;
      if (a.nativeOrCombination != null) {
        tagged++;
        check(`ability "${a.id}" nativeOrCombination is native|combination`,
          a.nativeOrCombination === "native" || a.nativeOrCombination === "combination",
          `got "${a.nativeOrCombination}"`);
        if (a.nativeOrCombination === "combination") {
          combination++;
          // Two combination subtypes: AXIS-TOUCH (a primary tradition reaching an adjacent axis — carries
          // combinationAxis + unlockCondition) and cross-pole BRAID (spans an axis rather than touching one;
          // axes≈0, no combinationAxis — the braid system owns its unlock). Both are `combination` so SNG-101
          // foreclosure exempts them. Validate the axis-touch PAIR is consistent; a braid needs neither field.
          if (a.combinationAxis != null || a.unlockCondition != null) {
            check(`axis-touch combination "${a.id}" names a combinationAxis`, typeof a.combinationAxis === "string" && a.combinationAxis.length > 0,
              "a combination that declares an unlockCondition must also name the axis it touches (schema)");
            check(`axis-touch combination "${a.id}" carries an unlockCondition object`, a.unlockCondition && typeof a.unlockCondition === "object",
              "post-creation unlock needs {type, description}");
          }
        } else native++;
      }
      if (a.rankProgression === "spend") { spendCount++; warn(`ability "${a.id}" uses rankProgression:"spend" — legacy; depth is through use now`); }
    }
  }
  check("no ability carries the legacy rankProgression:\"spend\"", spendCount === 0, `${spendCount} still on the spend path`);
  ok(`ability-arch v2: ${count} ability entries (§7 header count) — ${tagged} classified (${native} native / ${combination} combination), ${count - tagged} awaiting the classification pass`);
}

// (3c) SNG-090 — every location must resolve an effective substrate density (per-location override or
// its region's density in the_substrate.json). A place with no density can't compute the substrate
// factor — a silent hole in the second difficulty map.
{
  const sub = rj("content/packs/core/rules/the_substrate.json");
  const D = sub.substrateDensity || {};
  const locDir = "content/packs/valley/locations";
  const files = readdirSync(join(root, locDir)).filter(f => f.endsWith(".json"));
  const noDensity = [];
  for (const f of files) {
    const l = rj(`${locDir}/${f}`);
    const region = l.regionId || l.region;
    if (typeof l.substrateDensity !== "number" && !(region in D)) noDensity.push(l.id || f);
  }
  check("every location resolves a substrate density", noDensity.length === 0,
    `${noDensity.length} with no density (region not in the_substrate.json): ${noDensity.slice(0, 8).join(", ")}`);
}

// (3c-ii) BATCH-13 — every loreRef must RESOLVE to a loaded lore file.
// This check exists because its absence hid the worst content bug of the batch: state.js keyed the
// 24 .json lore files WITH their extension while every loreRef asked for the bare stem, and
// loreForLocation dropped the misses with .filter(Boolean). 3 of 14 refs resolved and 84 of 95
// locations delivered ZERO lore to the GM — for as long as the loader has existed. A reference that
// fails silently is indistinguishable from one that works, so the fix is not just the loader: it is
// making the failure loud. Same shape as the encounter-seed guard, which found 10 dead seeds.
{
  const loreDir = "content/packs/valley/lore";
  const stems = new Set(readdirSync(join(root, loreDir)).filter(f => /\.(md|json)$/.test(f)).map(f => f.replace(/\.(md|json)$/, "")));
  const locDir = "content/packs/valley/locations";
  const files = readdirSync(join(root, locDir)).filter(f => f.endsWith(".json"));
  const missing = new Map();
  let instances = 0, blind = 0;
  for (const f of files) {
    const l = rj(`${locDir}/${f}`);
    const refs = l.loreRefs || [];
    const bad = refs.filter(r => !stems.has(r));
    for (const r of bad) missing.set(r, (missing.get(r) || 0) + 1);
    instances += bad.length;
    if (refs.length && bad.length === refs.length) blind++;
  }
  const named = [...missing.entries()].sort((a, b) => b[1] - a[1]).map(([r, n]) => `${r} (${n} locations)`);
  check("every location delivers at least one resolvable lore file to the GM", blind === 0,
    `${blind} location(s) reference only lore that does not resolve — they run lore-blind`);
  // The dangling refs themselves are CONTENT (PO's lane): author the file, or drop the ref.
  // Named every run so the gap is a number rather than a silence.
  // The 5 dangling refs are CONTENT (PO's lane) and none has a cheap fix — see below. Ratcheted
  // rather than hard-failed so the suite stays green and a SIXTH still fails the build, and named
  // every run so the gap is a number rather than a silence.
  //
  // `traditions` (69 locations) deserves its own note, because the obvious fix is wrong: the file
  // exists at content/packs/core/rules/traditions.json, and loading it into the lore map would take
  // those locations from ~2,700 to ~13,000 prompt tokens. `tradition_profiles.json` is no cheaper
  // (~11,700). The ref wants a per-tradition SLICE or it wants dropping — not a file.
  const KNOWN_DANGLING = ["traditions", "reach_body_mind", "reach_violence_peace", "domain_detail_and_connections", "precursor_glimpse"];
  const unexpected = [...missing.keys()].filter(r => !KNOWN_DANGLING.includes(r));
  if (missing.size) console.log(`note  ${missing.size} known-dangling loreRef(s) across ${instances} location references: ${named.join(" · ")}`);
  check("no NEW unresolved loreRef", unexpected.length === 0,
    `${unexpected.length} new dangling ref(s) — author the file or drop the ref: ${unexpected.join(", ")}`);
}

// (3c-iii) SNG-167 §2 — an NPC with a WANT and no questSeeds is a content gap with a number.
// A location can start an arc and a person cannot: prompt rule 10 weaves the LOCATION's questSeeds
// and nothing does the same for anyone you meet, which is backwards — the memorable arcs start with
// someone. The engine now falls back to the want as the premise (SNG-167 §2 "derive, do not just
// author"), so this is a RATCHET on the authoring backlog rather than a failure: it names how many
// people are still relying on the fallback, and fails only if the number grows.
{
  const npcDir = "content/packs/valley/npcs";
  let files = [];
  try { files = readdirSync(join(root, npcDir)).filter(f => f.endsWith(".json")); } catch { }
  let withWant = 0, withSeeds = 0, gap = [];
  for (const f of files) {
    const j = rj(`${npcDir}/${f}`);
    const recs = Array.isArray(j?.challengers) ? j.challengers : (j?.roster || [j]);
    for (const n of recs) {
      if (!n || !n.id) continue;
      const want = n.want || (Array.isArray(n.wants) ? n.wants[0] : n.wants);
      const seeds = (n.questSeeds || []).length;
      if (seeds) withSeeds++;
      if (want) { withWant++; if (!seeds) gap.push(n.id); }
    }
  }
  console.log(`note  SNG-167 §2: ${withSeeds} NPC(s) carry authored questSeeds; ${gap.length} have a WANT and rely on the derived fallback`);
  const CEILING = 45;   // the measured backlog at the time this shipped — may only go DOWN
  check("no NEW want-without-seed NPC (SNG-167 §2 backlog ratchet)", gap.length <= CEILING,
    `${gap.length} exceeds the ${CEILING} recorded when this check shipped — author seeds, or re-baseline deliberately`);
}

// (3c-iv) SNG-166 §1 — no location may carry a DEFAULTED address.
// ROUND 2 §6.1: "the seed guard caught 10 dead encounter seeds because it checked that a reference
// RESOLVES. regionSource deserves the same — because if the fix is implemented as 'derive, else
// default', the default will come back." It came back once already: `stubEntity` hardcoded "valley"
// and all 6 generated locations in the live save were filed there, the Crossing included. Making
// the absence of a default enforceable is what stops this being re-fixed in three months.
{
  const genSrc = readFileSync(join(root, "engine/generate.js"), "utf8");
  check("SNG-166: generation carries no hardcoded region default",
    !/context\.regionId \|\| "valley"/.test(genSrc) && !/regionSource: "default"/.test(genSrc),
    "a 'derive, else default' fallback silently addresses every generated place to one region");

  // Authored content must still resolve — a location with no region cannot compute substrate,
  // and unresolved is only legitimate for a place minted mid-play with nothing to go on.
  const locDir = "content/packs/valley/locations";
  const files = readdirSync(join(root, locDir)).filter(f => f.endsWith(".json"));
  const homeless = files.map(f => rj(`${locDir}/${f}`)).filter(l => !l.regionId && !l.region);
  check("SNG-166: every AUTHORED location has a real address", homeless.length === 0,
    `${homeless.length} authored location(s) carry no regionId: ${homeless.map(l => l.id).slice(0, 6).join(", ")}`);
}

// (3c-v) SNG-182 §2.4 — every {{kind:id}} token in authored content must RESOLVE.
// "A token pointing at nothing must be a CI error, never a silent blank or a raw token shown to a
// player. This is the loreRefs lesson." There are ZERO tokens today, which makes this the cheapest
// possible moment to add the gate — it starts green and stays that way only if authors keep it so.
{
  const { collectTokens, nameOf } = await import("../engine/names.js");
  const content = {
    locations: {}, npcs: {}, items: {}, abilities: {},
    regions: (() => { try { const r = rj("content/packs/core/rules/regions.json"); return r.regions || r; } catch { return []; } })(),
    traditionIndex: (() => {
      try {
        const t = rj("content/packs/core/rules/traditions.json");
        const by = {};
        for (const x of [...(t.traditions || []), ...(t.folkTraditions || [])]) if (x.traditionId) by[x.traditionId] = x;
        return { byId: by };
      } catch { return { byId: {} }; }
    })()
  };
  for (const dir of ["content/packs/valley/locations", "content/packs/valley/npcs", "content/packs/valley/items", "content/packs/core/items"]) {
    let files = []; try { files = readdirSync(join(root, dir)).filter(f => f.endsWith(".json")); } catch { continue; }
    for (const f of files) {
      const j = rj(`${dir}/${f}`);
      const bag = dir.includes("locations") ? "locations" : dir.includes("npcs") ? "npcs" : "items";
      const recs = Array.isArray(j?.items) ? j.items : Array.isArray(j?.challengers) ? j.challengers : [j];
      for (const r of recs) if (r?.id) content[bag][r.id] = r;
    }
  }
  let scanned = 0;
  const broken = [];
  const walkDir = (dir) => {
    let entries = []; try { entries = readdirSync(join(root, dir), { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const rel = `${dir}/${e.name}`;
      if (e.isDirectory()) { if (!/assets/.test(rel)) walkDir(rel); continue; }
      if (!/\.(json|md)$/.test(e.name)) continue;
      let raw; try { raw = readFileSync(join(root, rel), "utf8"); } catch { continue; }
      if (!raw.includes("{{")) continue;
      let val; try { val = e.name.endsWith(".json") ? JSON.parse(raw) : raw; } catch { val = raw; }
      for (const t of collectTokens(val)) {
        scanned++;
        if (!nameOf(t.kind, t.id, content)) broken.push(`${rel} ${t.path ? `(${t.path}) ` : ""}${t.raw}`);
      }
    }
  };
  walkDir("content");
  console.log(`note  SNG-182: ${scanned} name token(s) in authored content`);
  check("every {{kind:id}} token in content resolves to a real record", broken.length === 0,
    `${broken.length} unresolvable: ${broken.slice(0, 5).join(" · ")}`);
}

// (3c-vi) SNG-183 L6 — a universal gate that encodes a LOCAL fact. Erik's line: "danger levels should
// be minimized only locally, not universally." A random encounter with a `minDanger` floor and
// location `tags` can be gated out of every location whose tags it names — re_toll_bandits at
// minDanger 3 could never appear on the road it is NAMED for (Erik lowered it to 2). This finds the
// same shape anywhere: an encounter that matches locations by tag but whose floor exceeds the danger
// of ALL of them is stranded. Content — the fix is a number Erik owns — so it is named, not failed.
{
  let re; try { re = rj("content/packs/valley/events/random_encounters.json"); } catch { re = null; }
  const arr = re ? (re.encounters || re.table || (Array.isArray(re) ? re : Object.values(re))) : [];
  const encs = (Array.isArray(arr) ? arr : []).filter(e => e && e.id);
  const locDir = "content/packs/valley/locations";
  let locs = [];
  try { locs = readdirSync(join(root, locDir)).filter(f => f.endsWith(".json")).map(f => rj(`${locDir}/${f}`)); } catch { }
  const stranded = [];
  for (const e of encs) {
    const tags = e.locationTags || e.tags || [];
    if (!tags.length || !(Number(e.minDanger) > 0)) continue;            // no local binding, or no floor
    const homes = locs.filter(l => (l.tags || []).some(t => tags.includes(t)));
    if (!homes.length) continue;                                          // matches nothing by tag — a different gap
    const reachable = homes.filter(l => (Number(l.dangerLevel) || 0) >= Number(e.minDanger));
    if (!reachable.length) stranded.push(`${e.id} (minDanger ${e.minDanger}, tags ${tags.join("/")}, its tag-homes cap at dl${Math.max(...homes.map(l => Number(l.dangerLevel) || 0))})`);
  }
  const KNOWN_L6 = 1;   // re_creature_chase at time of shipping — the only "wild" location is dl2
  if (stranded.length) console.log(`note  SNG-183 L6: ${stranded.length} encounter(s) gated out of every location matching their own tags: ${stranded.join(" · ")}`);
  check("no NEW encounter gated out of its own tag-homes (SNG-183 L6 ratchet)", stranded.length <= KNOWN_L6,
    `${stranded.length} exceeds the ${KNOWN_L6} recorded when this check shipped — lower the floor or raise a location's danger, per Erik's local-not-universal principle`);
}

// (3d) romance guidance — the doc pulled into the GM prompt on romantic intent must load and carry
// non-empty prose. A registered-but-empty (or missing) doc means the GM narrates romance blind.
{
  const listed = (rj("content/packs/core/manifest.json").provides?.rules || []).some(r => r.includes("romance_guidance"));
  check("romance_guidance.json is registered in the core manifest", listed, "not in provides.rules — loadRule would return the null fallback");
  if (listed) {
    const rg = rj("content/packs/core/rules/romance_guidance.json");
    check("romance_guidance carries non-empty guidance text", typeof rg.text === "string" && rg.text.length > 500,
      `text is ${typeof rg.text === "string" ? rg.text.length + " chars" : "missing"} — the GM would pull an empty doc`);
  }
}

// (3f) SNG-100b — the standing-bar config. peopleStandingBands (per-people reputation scale) + the
// capstoneStanding thresholds must exist and be shaped, or meetsStandingBar silently passes/fails.
{
  const r = rj("content/packs/core/rules/resolution.json");
  const bands = r.peopleStandingBands;
  check("peopleStandingBands is a non-empty {min,band}[] sorted high→low", Array.isArray(bands) && bands.length > 0
    && bands.every(b => typeof b.min === "number" && typeof b.band === "string")
    && bands.every((b, i) => i === 0 || bands[i - 1].min >= b.min),
    "standingWithPeople bands read top-down; a mis-sorted or malformed table mis-bands standing");
  const cs = r.capstoneStanding;
  check("capstoneStanding names capstoneTier + capstoneThreshold", cs && typeof cs.capstoneTier === "number" && typeof cs.capstoneThreshold === "number",
    "meetsStandingBar reads these — without them the capstone bar never bites (SNG-049/050 stays unwired)");
  // SNG-101: the promotion thresholds block. promotionEligible reads both sub-blocks.
  const pr = r.promotion;
  check("promotion names tertiaryToSecondary + secondaryToPrimary", pr && pr.tertiaryToSecondary && pr.secondaryToPrimary,
    "promotionEligible reads rules.promotion[...] — absent ⇒ promotion never surfaces");
  if (pr) check("promotion thresholds carry a minReputation", typeof pr.tertiaryToSecondary?.minReputation === "number" && typeof pr.secondaryToPrimary?.minReputation === "number",
    "the standing threshold must be a number in peopleDisposition units");
  // SNG-102: the acquisition block. acquirable reads minReputation + startingCeiling.
  const ac = r.acquisition;
  check("acquisition names minReputation + startingCeiling", ac && typeof ac.minReputation === "number" && typeof ac.startingCeiling === "number",
    "acquirable/acquireDomain read these — absent ⇒ acquisition never surfaces or enters at the wrong tier");
  if (ac) check("acquired domains start at Tier I", ac.startingCeiling === 1, "the pilgrimage is walked, not skipped — a joined people begins at Tier I");
}

// (4) location connectivity: dangling connections, one-way edges, unreachable locations
{
  const locDir = "content/packs/valley/locations";
  const files = readdirSync(join(root, locDir)).filter(f => f.endsWith(".json"));
  const locs = {};
  for (const f of files) { const l = rj(`${locDir}/${f}`); locs[l.id] = l; }
  const ids = new Set(Object.keys(locs));
  const edges = {};
  let dangling = 0, oneway = 0;
  for (const [id, l] of Object.entries(locs)) {
    edges[id] = (l.connections || []).filter(Boolean);
    for (const t of edges[id]) if (!ids.has(t)) { dangling++; if (dangling <= 5) fail(`dangling connection: ${id} → ${t} (no such location)`); }
  }
  for (const [id, tos] of Object.entries(edges)) for (const t of tos) {
    if (ids.has(t) && !(edges[t] || []).includes(id)) { oneway++; if (oneway <= 5) fail(`one-way edge: ${id} → ${t} but not back (a player who walks in is trapped)`); }
  }
  check("no dangling connections", dangling === 0, `${dangling} found`);
  check("no one-way edges", oneway === 0, `${oneway} found`);
  // reachability from the hub (The Crossing / the world center)
  const rootId = ids.has("the_crossing") ? "the_crossing" : ids.has("the_axis_gate") ? "the_axis_gate" : Object.keys(locs)[0];
  const seen = new Set([rootId]); const queue = [rootId];
  while (queue.length) { const n = queue.shift(); for (const t of edges[n] || []) if (ids.has(t) && !seen.has(t)) { seen.add(t); queue.push(t); } }
  const unreachable = [...ids].filter(id => !seen.has(id));
  check(`all ${ids.size} locations reachable from ${rootId}`, unreachable.length === 0, `${unreachable.length} unreachable: ${unreachable.slice(0, 8).join(", ")}`);
}

// (5) authored content validates against its derived schema (would have caught the poleIntensity bug)
{
  const locSchema = rj("schemas/location.schema.json");
  const npcSchema = rj("schemas/npc.schema.json");
  const arcSchema = rj("schemas/arc.schema.json");
  const runDir = (dir, schema, label, skip = () => false) => {
    let bad = 0, total = 0;
    for (const f of readdirSync(join(root, dir)).filter(n => n.endsWith(".json"))) {
      if (skip(f)) continue;
      const obj = rj(`${dir}/${f}`);
      if (obj && (obj.kind === "challenger_pool" || Array.isArray(obj.challengers))) continue; // a COLLECTION (SNG-138 pool), not a single entity
      total++;
      const r = validate(obj, schema);
      if (!r.valid) { bad++; if (bad <= 5) fail(`${label} schema: ${f} — ${(r.errors || []).join("; ")}`); }
    }
    check(`all ${total} ${label} validate against the schema`, bad === 0, `${bad} invalid`);
  };
  runDir("content/packs/valley/locations", locSchema, "locations");
  runDir("content/packs/valley/npcs", npcSchema, "NPCs", f => f === "legends.json");
  const arcsFile = "content/packs/valley/lore/greater_arcs.json";
  if (existsSync(join(root, arcsFile))) {
    const arcs = rj(arcsFile).arcs || [];
    let bad = 0; for (const a of arcs) { const r = validate(a, arcSchema); if (!r.valid) { bad++; if (bad <= 5) fail(`arc schema: ${a.id} — ${(r.errors || []).join("; ")}`); } }
    check(`all ${arcs.length} greater-arcs validate against the schema`, bad === 0, `${bad} invalid`);
  }
}

// (6) quest integrity (SNG-065 + BOUNDARY-1): real quests, resolvable giver/region, and every
// outcome carries machine-readable effects[] — prose alone is not a durable consequence.
{
  const qf = existsSync(join(root, "content/packs/valley/quests.json")) ? rj("content/packs/valley/quests.json") : { quests: [] };
  const defs = qf.quests || [];
  const npcIds = new Set(readdirSync(join(root, "content/packs/valley/npcs")).filter(f => f.endsWith(".json")).map(f => f.replace(".json", "")));
  const regionIds = [];
  for (const f of readdirSync(join(root, "content/packs/valley/locations")).filter(x => x.endsWith(".json"))) { const j = rj(`content/packs/valley/locations/${f}`); if (j.regionId && !regionIds.includes(j.regionId)) regionIds.push(j.regionId); }
  for (const q of defs) {
    check(`quest ${q.id} names its stakes + stages + outcomes (is a quest, not an errand)`, !!(q.stakes && (q.stages || []).length && (q.outcomes || []).length), "the schema's THE RULE");
    if (q.giver) check(`quest ${q.id} giver "${q.giver}" resolves to an authored NPC`, npcIds.has(q.giver), "no such npc file");
    if (q.region && regionIds.length) check(`quest ${q.id} region "${q.region}" is a real region`, regionIds.includes(q.region), "no location carries that regionId");
    for (const o of q.outcomes || []) {
      check(`quest ${q.id} outcome "${o.id}" carries machine-readable effects[]`, Array.isArray(o.effects) && o.effects.length > 0, "prose alone is not a consequence the engine can apply (BOUNDARY-1)");
      const durable = (o.effects || []).some(e => ["npc_state", "disposition", "codex_fact", "world_event", "location_state", "ally"].includes(e.type));
      check(`quest ${q.id} outcome "${o.id}" has at least one DURABLE, findable effect`, durable, "xp/quest_seed alone changes nothing you can go back and see");
    }
  }
}

// (SNG-101b) native-grant table — every granted ability id must be a REAL ability (a typo would grant a
// phantom at creation), grantCap sane, and every tradition key a real tradition. The grant is by-right;
// it must never reference an ability that doesn't exist.
{
  const ngPath = "content/packs/core/rules/native_grants.json";
  if (existsSync(join(root, ngPath))) {
    const ng = rj(ngPath);
    const abFiles = (rj("content/packs/core/manifest.json").provides?.abilities) || [];
    const allAbilityIds = new Set();
    const traditionsWithAbilities = new Set();
    for (const rel of abFiles) { let doc; try { doc = rj(`content/packs/core/${rel}`); } catch { continue; } const abs = Array.isArray(doc) ? doc : Array.isArray(doc.abilities) ? doc.abilities : [doc]; const ps = doc.powerSystem; for (const a of abs) { if (!a || !a.id) continue; allAbilityIds.add(a.id); const trad = a.tradition || a.powerSystem || ps; if (trad) traditionsWithAbilities.add(trad); } }
    check("SNG-101b: grantCap is a positive number", Number.isFinite(ng.grantCap) && ng.grantCap > 0, `got ${ng.grantCap}`);
    let checkedIds = 0;
    for (const [trad, def] of Object.entries(ng.traditionNativeGrants || {})) {
      check(`SNG-101b: native-grant tradition "${trad}" is a real tradition (has abilities)`, traditionsWithAbilities.has(trad), "no ability in the catalog carries this tradition/powerSystem");
      const ids = [...(def.anchors || []), ...Object.values(def.byLean || {}).flat()];
      for (const id of ids) { checkedIds++; check(`SNG-101b: native-grant "${trad}" → ability "${id}" exists`, allAbilityIds.has(id), "no such ability id in the catalog"); }
      check(`SNG-101b: native-grant tradition "${trad}" declares at least one anchor`, (def.anchors || []).length > 0, "a tradition with no anchor grants nothing by right");
    }
    ok(`SNG-101b: native-grant table validated — ${Object.keys(ng.traditionNativeGrants || {}).length} traditions, ${checkedIds} ability refs all real`);
  }
}

// (SNG-113) every aptitude mod key must have a CONSUMER — a mod with no reader is a lie (the SNG-103 lesson).
// Also: every earned aptitude declares a tendency + threshold; every inverse one a worldlinessCeiling + components.
{
  const res = rj("content/packs/core/rules/resolution.json");
  const aps = res.playerAptitudes || [];
  const consumerSrc = ["engine/resolve.js", "engine/sense.js", "engine/reputation.js"].map(f => existsSync(join(root, f)) ? readFileSync(join(root, f), "utf8") : "").join("\n");
  const keys = new Set();
  for (const a of aps) for (const k of Object.keys(a.mods || {})) keys.add(k);
  let checked = 0;
  for (const k of keys) { checked++; check(`SNG-113: aptitude mod "${k}" has a consumer (no inert mod)`, consumerSrc.includes(k), "no engine reader — a mod with no consumer is a lie (SNG-103)"); }
  for (const a of aps) {
    if (a.axis === "inverse") check(`SNG-113: inverse aptitude "${a.id}" declares a worldliness ceiling + components`, Number.isFinite(a.worldlinessCeiling) && (a.worldlinessComponents || []).length > 0, "an inverse aptitude needs the ceiling it decays up against");
    else check(`SNG-113: earned aptitude "${a.id}" declares a tendency + threshold`, !!a.tendency && Number.isFinite(a.threshold), "an earned aptitude needs a tendency + threshold");
  }
  ok(`SNG-113: ${aps.length} aptitudes validated — ${checked} distinct mod keys, all with consumers`);
}

console.log(failures === 0 ? "\nContent CI: all checks passed." : `\nContent CI: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
