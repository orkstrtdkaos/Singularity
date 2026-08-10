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
import { structuredQuestRecord } from "../engine/quests.js";
import { checkBorn, describeBorn, contractedTypes } from "../engine/borncontract.js";
import { critFor } from "../engine/craftmechanics.js";
import { openAccessFor } from "../engine/progression.js";   // SNG-261 B: run the real opener, not a re-description of it   // CCODE-76: run the REAL resolver, don't re-describe the schema

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
  valley: new Set(["locations", "npcs", "events", "companions", "lore", "encounters", "items", "quests", "tradition_arcs", "npc_quests", "bestiary", "tradition_motivations", "npc_interiority"]),
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
const STRICT_DIRS = { core: ["rules", "abilities"], valley: ["locations", "npcs", "events", "companions", "encounters", "items", "lore", "tradition_arcs"] };

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

// (3c-vii) SNG-172 AUDIT — power source classification must AGREE with the substrate band centre.
// Erik: "band centres already encode source." A tradition classified `natural` in power_sources.json
// works BELOW the lattice — it should have a LOW band centre; a `lattice` tradition needs density and
// should have a HIGH one. This reads power_sources.json (which had NO engine consumer — an L4 orphan
// the ENGINE_MAP lens found), so the audit itself is now that file's reader. It is a cheap check that
// catches the umbral-shaped hole (umbral had NO band at all — neutral at every density, benefiting
// nowhere) without driving an inverted curve, which is the expensive path under tuningNote.
{
  let ps, sub;
  try { ps = rj("content/packs/core/rules/power_sources.json"); sub = rj("content/packs/core/rules/the_substrate.json"); } catch { ps = sub = null; }
  if (ps && sub) {
    const bands = sub.substrateBand || {};
    const byT = ps.byTradition || {};
    // Erik's two flagged-not-changed disagreements: natural-classified, banded 0.50.
    const KNOWN_DISAGREE = new Set(["threnodist", "verist"]);
    const noBand = [], wrongSide = [];
    for (const [t, c] of Object.entries(byT)) {
      const b = bands[t];
      const primary = c && c.primary;
      // ⛔ A STATED `density: null` IS AN ANSWER, NOT A HOLE — and reading it as one is the SAME trap as
      // `material: null` in SOURCE_BAND, one level up. The umbral case this gate was written for had NO
      // entry at all: nobody had decided, so it was neutral everywhere by omission. `god_named` and
      // `bargainers` DECLARE `density: null` with Erik's reason attached — "their own people carry a store
      // of nanites, so a bearer is strongest among them: power that travels with a POPULATION rather than
      // sitting in terrain." That is a fact about the world, deliberately authored, and a tradition that
      // does not sit in terrain must not be failed for having no terrain band.
      // ⚠️ THE REASON IS REQUIRED. `density: null` with no `why` is still an omission wearing an
      // answer's clothes, and that is exactly what this gate exists to catch.
      const declinesTerrain = c && c.density === null && typeof c.why === "string" && c.why.length > 20;
      if (!b || typeof b.center !== "number") {
        if (primary && primary !== "combination" && !declinesTerrain) noBand.push(t);
        continue;
      }
      if (KNOWN_DISAGREE.has(t)) continue;
      // natural works in thin ground (low centre); lattice needs dense (high centre). wild/combination
      // are mixed sources and deliberately unconstrained.
      if (primary === "natural" && b.center > 0.45) wrongSide.push(`${t} natural but centre ${b.center}`);
      if (primary === "lattice" && b.center < 0.55) wrongSide.push(`${t} lattice but centre ${b.center}`);
    }
    check("every power-classified tradition has a substrate band, or DECLARES it has none and why", noBand.length === 0,
      `${noBand.length} classified but band-less with no stated reason — neutral at every density by omission: ${noBand.join(", ")}`);
    check("power classification and band centre agree (natural low, lattice high)", wrongSide.length === 0,
      `${wrongSide.length} disagree beyond the known threnodist/verist pair: ${wrongSide.join(" · ")}`);
    if (KNOWN_DISAGREE.size) console.log(`note  SNG-172: ${[...KNOWN_DISAGREE].join(", ")} are natural-classified but banded 0.50 — flagged, not changed (Erik's call)`);
  }
}

// (3c-vii-b) SNG-384 — THE POWER-SOURCE MAP, VALIDATED WHILE IT IS BEING AUTHORED. Erik and Aevi are
// laying out the world map of power sources right now; the field went from 26 sources to 44 in a day.
// This is their feedback loop, not a verdict on their work — every constant below is DERIVED FROM THEIR
// OWN CONTENT rather than chosen by me.
//
// ⛔ THE FAILURE MODE IS DOCUMENTED IN THE CONTENT ITSELF, in every entry's `radiusNote`: "Larger radii
// blanket a whole region (a source at ~55% strength everywhere inside it) and renormalization cancels the
// field flat — the failure CCode measured and reverted." A flat field is the one outcome that looks fine
// per-entry and is worthless in aggregate, so it is checked in aggregate.
{
  let locs = [];
  try { locs = readdirSync(join(root, "content/packs/valley/locations")).filter(f => f.endsWith(".json")).map(f => rj(`content/packs/valley/locations/${f}`)); } catch { }
  const flat = [];
  for (const d of locs) for (const l of (d.locations ? Object.values(d.locations) : [d])) if (l && typeof l === "object") flat.push(l);
  const withSrc = flat.filter(l => l.substrateSource != null);
  const objs = withSrc.filter(l => typeof l.substrateSource === "object");

  // ⚠️ SHAPE FIRST, AND THE BARE-STRING CASE IS REAL: `the_old_warden_post` authors
  // `substrateSource: "thin-unreached"`. `groundHere` ignores it rather than coercing (guessing a delta
  // would be inventing a bastion), so it is a source that silently is not one. Ratcheted, not failed — it
  // predates this check and is Aevi's to convert or remove.
  const malformed = withSrc.filter(l => typeof l.substrateSource !== "object").map(l => l.id || l.name);
  // ⚠️ CONSTANT, DOUBLE-QUOTED NAMES. All four of these shipped as template literals and the 272
  // guard reported every one as MISSING — it scans for check("…") literals, so a name built at runtime
  // cannot be found and reads exactly like a deleted gate. This is the second day running I have done
  // it, and there is a comment in smoke.mjs three lines above that guard saying not to. The numbers
  // belong in the DETAIL argument, where they are useful and cannot break a lookup.
  check("SNG-384: a substrateSource is an OBJECT, not a bare string",
    malformed.length <= 1, `${malformed.length} malformed: ${malformed.join(", ")} — ignored by the resolver, so it is a bastion that is not one`);

  const bad = [];
  for (const l of objs) {
    const s2 = l.substrateSource, who = l.id || l.name;
    if (!["pool", "sink"].includes(s2.kind)) bad.push(`${who}: kind "${s2.kind}"`);
    else if (s2.kind === "pool" && !(s2.delta > 0)) bad.push(`${who}: pool with delta ${s2.delta}`);
    else if (s2.kind === "sink" && !(s2.delta < 0)) bad.push(`${who}: sink with delta ${s2.delta}`);
    if (typeof s2.radiusWorld !== "number" || !(s2.radiusWorld > 0)) bad.push(`${who}: no usable radiusWorld`);
    if (!s2.reason) bad.push(`${who}: no reason — the reason is what the player is shown`);
    if (!l.worldPos) bad.push(`${who}: no worldPos, so the source cannot be placed at all`);
  }
  check("SNG-384: every authored source is well-formed — kind, sign, radius, reason, a place to stand",
    bad.length === 0, bad.slice(0, 8).join(" · "));

  // ⛔ `radius` IS LEGACY MAP UNITS AND `radiusWorld` IS WHAT MECHANICS READ — the content says so in
  // every entry. Editing one and not the other leaves the mechanic silently on the stale number, which is
  // the quietest possible way to author a source that does not do what its author thinks.
  // ⚠️ THE RATIO IS DERIVED, NOT DECREED: all 43 existing sources agree at exactly 0.0006.
  const pairs = objs.filter(l => typeof l.substrateSource.radius === "number");
  const drift = pairs.filter(l => Math.abs(l.substrateSource.radiusWorld - l.substrateSource.radius * 0.0006) > 1e-6)
    .map(l => `${l.id || l.name} (radius ${l.substrateSource.radius} → expected ${(l.substrateSource.radius * 0.0006).toFixed(4)}, has ${l.substrateSource.radiusWorld})`);
  check("SNG-384: radius and radiusWorld agree — editing one and not the other leaves mechanics on the stale number",
    drift.length === 0, drift.slice(0, 6).join(" · "));

  // ⚠️ A CATASTROPHE GUARD, NOT A TUNING PIN. The documented failure is the field going FLAT (~55%
  // everywhere). Today's spread is sd 0.275 across 118 locations; the floor is set well below that so it
  // catches the collapse and never argues with ordinary authoring.
  // ⛔ THE FIRST VERSION OF THIS GUARD COULD NOT FIRE, AND I ONLY FOUND OUT BY TRYING TO MAKE IT.
  // It measured the standard deviation of resolved DENSITY and asserted the field had not gone flat. But
  // density is dominated by the region baseline and a source is a perturbation on top: inflating every
  // radius TWENTYFOLD moved sd from 0.275 to 0.255, so the check passed through the exact catastrophe it
  // was written for. A gate that survives its own failure mode is decoration.
  //
  // ⚠️ THE DOCUMENTED FAILURE IS THAT A SOURCE STOPS BEING LOCAL — "larger radii blanket a whole
  // region (a source at ~55% strength everywhere inside it)". So measure THAT, per source, on the sphere:
  // what share of placed locations falls inside each source's own radius. Today the widest covers 3%.
  // Inflating radii walks it 3% → 9% → 14% → 22% → 100%, so a 25% ceiling has eight-fold headroom
  // for ordinary authoring and still catches a blanket — and it NAMES the source, which an aggregate
  // number never could.
  let coverage = [];
  try {
    const wm = await import("../engine/worldmap.js");
    const placed = flat.filter(l => wm.worldVector(l));
    const ang = (a, b) => {
      const va = wm.worldVector(a), vb = wm.worldVector(b);
      return Math.acos(Math.max(-1, Math.min(1, va.x * vb.x + va.y * vb.y + va.z * vb.z)));
    };
    if (placed.length > 20) {
      coverage = objs.filter(l => wm.worldVector(l)).map(sv => {
        const r = sv.substrateSource.radiusWorld;
        const n = placed.filter(l => ang(sv, l) <= r).length;
        return { id: sv.id || sv.name, pct: n / placed.length, n };
      }).sort((a, b) => b.pct - a.pct);
    }
  } catch (e) { console.log(`note  SNG-384: coverage check skipped (${e.message})`); }
  if (coverage.length) {
    const blankets = coverage.filter(c => c.pct > 0.25);
    check("SNG-384: no source BLANKETS the world",
      blankets.length === 0,
      // the widest coverage rides in the detail so the NAME stays a stable identifier
      (blankets.length ? "" : `widest covers ${(coverage[0].pct * 100).toFixed(0)}% of placed locations`) +
      `${blankets.map(b => `${b.id} reaches ${(b.pct * 100).toFixed(0)}%`).join(" · ")} — a source that touches most of the world is a baseline, not a bastion, and renormalization cancels it flat`);
  }
  console.log(`note  SNG-384: ${objs.length} authored source(s) — ${objs.filter(l => l.substrateSource.kind === "pool").length} pools, ${objs.filter(l => l.substrateSource.kind === "sink").length} sinks`);
}

// (3c-vii-c) SNG-387 §1a — `worldPos` IS THE SOLE POSITIONING AUTHORITY, AND `map.x/y` IS A RENDER
// LAYOUT. Aevi: "a RENDER LAYOUT, never a geography. Nothing may read it for position, distance, bearing,
// adjacency or containment." ⚠️ DEMOTED, NOT DELETED — she reversed her own call after measuring:
// the schematic predicts the substrate field BETTER than the projection does (0.228 against 0.130), so it
// stays as the base for the SNG-386 wash while saying nothing true about where anywhere is.
{
  let locs387 = [];
  try {
    locs387 = readdirSync(join(root, "content/packs/valley/locations")).filter(f => f.endsWith(".json"))
      .map(f => rj(`content/packs/valley/locations/${f}`))
      .flatMap(d => (d.locations ? Object.values(d.locations) : [d])).filter(l => l && l.id);
  } catch { }

  // ⛔ ONE CONSUMER ONLY. `autoMapPositions` turns the layout into screen coordinates; anything else
  // reading `map.x` is treating a schematic as a map of the world, which is the whole defect.
  const readers = [];
  for (const f of [...readdirSync(join(root, "engine")).filter(x => x.endsWith(".js")).map(x => `engine/${x}`), "app.js"]) {
    if (f === "engine/worldmap.js") continue;                       // the renderer's own layout function
    const src = readFileSync(join(root, f), "utf8");   // content_ci has no read() helper; rj() is JSON-only
    const code = src.split(String.fromCharCode(10))
      .map(l => { const i = l.search(/(^|[^:"'`])\/\//); return i === -1 ? l : l.slice(0, i); }).join(String.fromCharCode(10));
    // ⚠️ MINTING A LAYOUT POSITION FOR A NEW PLACE IS NOT READING ONE FOR GEOGRAPHY. app.js assigns
    // `map` to generated locations so they can be drawn; that is renderer work wearing app.js's clothes.
    if (/map\.[xy]/.test(code) && !/coordForGenerated|existingMaps|existing\[/.test(code)) readers.push(f);
  }
  check("SNG-387: `map.x/y` is read only by the renderer — worldPos is the sole positioning authority",
    readers.length === 0, `${readers.join(", ")} read the render layout for position`);

  // ⛔ THE COHERENCE GATE, AND ITS FIRST TWO FORMS COULD NOT DISCRIMINATE. Aevi asked for map-space
  // nearest-neighbour rank order to agree with geodesic rank order; measured, mean overlap is 0.257 with
  // 20 locations at ZERO, because the schematic is a schematic — that gate fires on everything.
  // ⚠️ AND ABSOLUTE DISTANCE-TO-REGION FIRES ON EXACTLY THE CASE SHE SAID NOT TO: the ten worst are
  // all `the_foothills`, the waypoint ring that spans all longitudes BY DESIGN.
  // ✅ What discriminates is being an OUTLIER WITHIN YOUR OWN REGION — median distance to your peers over
  // your region's own median. Scale-free, so a spread ring is judged against its own spread. Today: median
  // 1.00, 90th percentile 1.57, max 2.37 (`the_slow_stair`). The Hollowing, the case that prompted all of
  // this, sits at 1.27 now that the split has landed.
  const outliers = (() => {
    // ⛔ AN INHERITED POSITION IS NOT AN INDEPENDENT SAMPLE. SNG-396 promoted 17 places play authored,
    // each at its parent's exact coordinates because a room is at its building. Counting them here put
    // distance-0 pairs into the spread statistic, dragged every region median DOWN, and pushed FOUR
    // untouched locations — archive_hollow, kestrels_roost, sunken_choir, the_slow_stair — over the 3×
    // line without any of them moving. ⚠️ Measured both ways before believing it: with the duplicates,
    // four outliers; without, zero. The ruler moved, not the places. Same insight as the terrain seed
    // rule one file over — a co-located record adds no observation, and averaging it in is how a
    // statistic quietly stops describing the thing it is named for.
    const placed = locs387.filter(l => l.worldPos && Number.isFinite(l.worldPos.colatitude) && Number.isFinite(l.worldPos.longitude)
      && !l.worldPosInherited);
    const vec = (l) => {
      const th = l.worldPos.colatitude * Math.PI / 180, ph = l.worldPos.longitude * Math.PI / 180;
      return { x: Math.sin(th) * Math.cos(ph), y: Math.sin(th) * Math.sin(ph), z: Math.cos(th) };
    };
    const geo = (a, b) => { const A = vec(a), B = vec(b); return Math.acos(Math.max(-1, Math.min(1, A.x * B.x + A.y * B.y + A.z * B.z))); };
    const byR = {};
    for (const l of placed) (byR[l.regionId || l.region] ||= []).push(l);
    const bad = [];
    for (const m of Object.values(byR)) {
      if (m.length < 4) continue;                                   // too few peers for "typical" to mean anything
      const medOf = (l) => { const d = m.filter(x => x !== l).map(x => geo(l, x)).sort((a, b) => a - b); return d[Math.floor(d.length / 2)]; };
      const meds = m.map(l => ({ id: l.id, v: medOf(l) }));
      const vs = meds.map(x => x.v).sort((a, b) => a - b);
      const regionMed = vs[Math.floor(vs.length / 2)];
      if (!(regionMed > 0)) continue;
      for (const x of meds) if (x.v / regionMed > 3) bad.push(`${x.id} sits ${(x.v / regionMed).toFixed(1)}x its region's typical spread`);
    }
    return bad;
  })();
  check("SNG-387: no location is stranded far from its own region — the Hollowing case, gated",
    outliers.length === 0, outliers.slice(0, 6).join(" · "));
}

// (3c-vii-d) SNG-391 — THE WORLD PIPELINE GATES. Aevi's §4 table: "each from a bug that actually
// happened". ONE regeneration feeds all of them — the build is ~8s and buying seven gates with it is the
// cheapest verification in this file per unit of confidence. ⚠️ Three of her ten cannot run yet:
// lake containment and polygon sanity gate HYDROLOGY AND VECTORS, which were not delivered (the generator
// makes type+elevation only), and patch coverage gates the staged-refinement viewer, which is §6 behaviour
// this app's dependency-free globe does not have. Named here so their absence is a fact, not a gap.
{
  const GW = await import("../scripts/world/generate_world.mjs");
  const canon = GW.loadCanon();

  // ⛔ SEED DRIFT — genparams.pts proved to be a byte-exact derivation of canon worldPos (118/118), so
  // the pipeline derives seeds itself and this gate fails if the cache and canon ever disagree.
  const seedBad = GW.verifySeeds(canon);
  check("SNG-391: genparams seeds are the canon derivation — a moved worldPos without a rebuild fails here",
    seedBad.length === 0, seedBad.slice(0, 4).join(" · "));

  const built = GW.buildWorld(canon);
  const disk = readFileSync(join(root, "content/packs/core/world/terrain.json"), "utf8");

  // 1 · DETERMINISM — regenerate → byte-identical. "Silent drift" is the bug; a diff is the information.
  check("SNG-391: determinism — the regenerated world is byte-identical to the shipped asset",
    JSON.stringify(GW.serialise(built, canon)) === disk);

  const EW = 720, EH = 360;
  const landAt = (lat, lon) => {
    const fx = Math.min(EW - 1, Math.floor((((lon + 180) % 360 + 360) % 360) / 360 * EW));
    const fy = Math.min(EH - 1, Math.floor((90 - lat) / 180 * EH));
    const t = built.type[fy * EW + fx];
    return t === 1 || t === 2;
  };

  // 2 · STRANDED — "happened 3×": a land-wanting location in water.
  const stranded = canon.gp.landwant.filter((p) => !landAt(p[0], p[1]));
  check("SNG-391: no land-wanting location stands in water", stranded.length === 0,
    stranded.slice(0, 5).map((p) => "[" + p + "]").join(" · "));

  // 3 · SEATS — "happened 2×": a region jump target in the ocean. Medoid-over-on-land makes it
  // impossible by construction; the gate also demands NO region lost its seat entirely.
  const seatBad = Object.entries(built.seats).filter(([, v]) => !landAt(v[0], v[1]));
  const regions = new Set(canon.seeds.map((s) => s.region));
  const seatless = [...regions].filter((r) => r && !built.seats[r]);
  check("SNG-391: every region seat is on land, and no region lost its seat", seatBad.length === 0 && seatless.length === 0,
    [...seatBad.map(([k]) => k + " in water"), ...seatless.map((r) => r + " seatless")].join(" · "));

  // 4 · CONNECTIVITY — "4 marooned": every land-wanting location on the Crossing's mainland.
  const comp = new Int32Array(EW * EH).fill(-1);
  const cross = canon.seeds.find((s) => s.id === "the_crossing");
  const idxOf = (lat, lon) => Math.min(EH - 1, Math.floor((90 - lat) / 180 * EH)) * EW
    + Math.min(EW - 1, Math.floor((((lon + 180) % 360 + 360) % 360) / 360 * EW));
  const start = idxOf(cross.lat, cross.lon);
  const stack = [start]; comp[start] = 1;
  while (stack.length) {
    const i = stack.pop(); const y = Math.floor(i / EW), x = i % EW;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const yy = y + dy; if (yy < 0 || yy >= EH) continue;
      const xx = ((x + dx) % EW + EW) % EW; const j = yy * EW + xx;
      if (comp[j] === -1 && (built.type[j] === 1 || built.type[j] === 2)) { comp[j] = 1; stack.push(j); }
    }
  }
  // ⚠️ REV 2 EMPTIED THE CENSUS, AND THE HISTORY IS THE LESSON. Rev 1 shipped `thr 1.30`, my census
  // found 11 marooned, and Aevi's reply confirmed the world I measured was one she had already corrected
  // locally and not re-shipped — her own §1 failure mode, inside the handoff about it. At `thr 0.85` the
  // Umbral cluster reconnects (the carving cuts inlets, not an archipelago; the flood drowned the isthmus)
  // and 104 of 104 land-wanting locations stand on ONE mainland. The census FORM stays — Aevi: "census-
  // not-sentence beats the binary in the spec" — with an empty expected set: anyone appearing here is
  // marooned by a REGRESSION, and a dead bridge floods this list with ~43 names at once.
  const marooned = canon.gp.landwant.filter((p) => comp[idxOf(p[0], p[1])] !== 1);
  check("SNG-391: off-mainland is EXACTLY the designed archipelago — a dead bridge floods this census",
    marooned.length === 0, marooned.slice(0, 8).map((p) => "[" + p + "]").join(" · "));
  let mainCells = 0, landCells = 0;
  for (let i = 0; i < comp.length; i++) { if (built.type[i] === 1 || built.type[i] === 2) { landCells++; if (comp[i] === 1) mainCells++; } }
  check("SNG-391: the mainland carries ≥90% of all land", mainCells / landCells >= 0.9,
    (mainCells / landCells * 100).toFixed(1) + "%");

  // 5 · ISOTROPY at the pole — "the starburst". The Crossing IS the map's south pole, so this is the
  // one place in the world where anisotropy would sit in the player's face. Tangential vs radial
  // roughness per degree of arc; her measured healthy range is 0.67–0.76, the gate allows < 1.5.
  const { makeTerrain } = await import("../scripts/world/terrain.mjs");
  const T391 = makeTerrain(canon.gp, null);
  const ringLat = -89.5, ringArc = 360 * Math.sin(0.5 * Math.PI / 180);
  let tang = 0, prevT = null;
  for (let k = 0; k <= 100; k++) { const v = T391(-180 + k * 3.6, ringLat).raw; if (prevT !== null) tang += Math.abs(v - prevT); prevT = v; }
  tang /= ringArc;
  let rad = 0, prevR = null;
  for (let k = 0; k <= 100; k++) { const v = T391(0, -89.9 + k * 0.019).raw; if (prevR !== null) rad += Math.abs(v - prevR); prevR = v; }
  rad /= 1.9;
  const iso = rad > 0 ? tang / rad : 1;
  check("SNG-391: noise at the pole is isotropic — the starburst cannot return", iso < 1.5, "ratio " + iso.toFixed(2));

  // 6 · RIPPLE — "concentric rings": direction changes along a radial transect, per 100 samples.
  let flips = 0, prev = null, dPrev = 0, samples = 0;
  for (let k = 0; k <= 300; k++) {
    const v = T391(37, -90 + k * 0.1).raw; samples++;
    if (prev !== null) { const d = v - prev; if (dPrev !== 0 && Math.sign(d) !== Math.sign(dPrev) && d !== 0) flips++; if (d !== 0) dPrev = d; }
    prev = v;
  }
  const per100 = flips / samples * 100;
  check("SNG-391: no concentric rings — radial direction-changes under the measured ceiling", per100 < 26, per100.toFixed(1) + "/100");

  // 7 · BASE vs LIVE — "the seam, 2.44%": the 480 pack against direct generation at the same points.
  let agree = 0, tot = 0;
  for (let y = 0; y < 240; y += 3) for (let x = 0; x < 480; x += 3) {
    const lon = -180 + ((x + 0.5) / 480) * 360, lat = 90 - ((y + 0.5) / 240) * 180;
    tot++; if ((built.c0[y * 480 + x] & 3) === T391(lon, lat).type) agree++;
  }
  check("SNG-391: the base pack and live generation agree — the seam stays closed", agree / tot >= 0.98,
    (agree / tot * 100).toFixed(2) + "% agreement");

  // ⛔ THE TWO GATES HYDROLOGY FEEDS, runnable now that rebuild.py's §3 steps 4–6 are ported.
  // LAKE CONTAINMENT — "4 settlements underwater": only the Sunken Choir, authored as a flooded
  // amphitheatre, may stand inside a lake. Read from the packed c0 water bits, i.e. the shipped truth.
  const inLake = [];
  for (const s2 of canon.seeds) {
    const cx = Math.min(479, Math.floor((((s2.lon + 180) % 360 + 360) % 360) / 360 * 480));
    const cy = Math.min(239, Math.floor((90 - s2.lat) / 180 * 240));
    if (((built.c0[cy * 480 + cx] >> 4) & 3) === 2 && s2.id !== "sunken_choir") inLake.push(s2.id);
  }
  check("SNG-391: no settlement stands in a lake but the Sunken Choir, which is authored as flooded",
    inLake.length === 0, inLake.join(" · "));
  // POLYGON SANITY — "13 slashed marshes": every emitted outline closed and compact. buildv filters at
  // 12; the gate re-verifies the EMITTED vectors so a filter regression cannot pass silently.
  const compactOf = (q) => {
    let per = 0, A = 0;
    for (let k = 0; k < q.length; k++) { const a = q[(k - 1 + q.length) % q.length], b = q[k];
      per += Math.hypot(b[0] - a[0], b[1] - a[1]); A += a[1] * b[0] - b[1] * a[0]; }
    return per * per / Math.max(1e-6, Math.abs(A) / 2) / (4 * Math.PI);
  };
  const badPoly = [...(built.hydrology.lakes || []), ...(built.hydrology.marsh || [])]
    .map(compactOf).filter((c) => c > 12);
  check("SNG-391: every lake and marsh outline is closed and compact — no slashed polygons",
    badPoly.length === 0, badPoly.length + " over compactness 12");
    // ⚠️ GRAFTED INTO THE SNG-391 BLOCK, deliberately: these gates need `canon` and `built`, and this
  // is the FOURTH time a new gate block reached for a neighbour's block-scoped consts. Sharing the one
  // regeneration is also the cheap thing — a second buildWorld in CI would double the world's cost.
// (3c-vii-e) SNG-393 rev 3 — NAMES SURVIVE A REBUILD BY POLAR SIGNATURE. Erik's key, Aevi's
// measurement: signature drift median 0.50° across a rebuild against 5.3° town-anchor distance —
// "precision beats stability when the drift is smaller than the error you are trying to avoid."

  const RA = await import("../scripts/world/reanchor.mjs");
  const pnDisk = rj("content/packs/core/world/placenames.json");
  const seedPos393 = {}; for (const s2 of canon.seeds) seedPos393[s2.id] = { lat: s2.lat, lon: s2.lon };
  const res = RA.resolvePlaceNames(pnDisk, built.hydrology, { seedPos: seedPos393 });

  // ⛔ THE CENSUS, NOT A PASS/FAIL: seven names cannot bind in the ORDER-FREE decomposition, and the
  // diagnosis says why — the Choirwater's best town-match is the 110° main stem at 46.3° with margin
  // 0.2°, i.e. her stream was absorbed as a tributary. Binding on numbers like that is the exact thing
  // the spec forbids: "a river named for Millbrook quietly attaching to another water is worse than an
  // unnamed river." The seven are Aevi's to re-anchor or rename; a name leaving this list is her fix
  // landing, and a name JOINING it is a regression this gate reports by name.
  // ⚠️ Aevi's f4aec367 shrank this census the designed way: the Millfen became the Milljaw and binds
  // its southern fragment by signature; the Upper Mire names the northern one. The Choirwater was
  // RENAMED (the Drowned Reach) but not re-anchored, so it stays here until she sites it.
  const KNOWN_UNRESOLVED = new Set(["the_greenwater", "the_axewater"]);
  const unexpected = res.placeNames.unresolved.filter((u) => !KNOWN_UNRESOLVED.has(u.id));
  check("SNG-393: every name binds by signature, or sits in the KNOWN census with its diagnosis",
    unexpected.length === 0, unexpected.map((u) => u.name + " (" + u.reason + ")").join(" · "));
  check("SNG-393: the load-bearing names resolve — the Echo, the Stiltfen, the Echofen",
    ["the_echo"].every((id) => res.placeNames.rivers.some((r) => r.id === id && r.resolved))
    && ["the_stiltfen", "the_echofen"].every((id) => res.placeNames.fens.some((f) => f.id === id && f.resolved)));
  // ⚠️ THE FALLBACK CENSUS — this was a binary ("no name leans on the fallback") and the binary was
  // TRUE FOR A ROTTEN REASON: it held only while the write-back kept overwriting authored addresses
  // with exact machine copies. SNG-394 withdrew the write-back and restored the two authored centroids
  // it had destroyed, and this gate went red the same minute — correctly. The Marchfen and the Stairfen
  // are authored ~10° from any surviving polygon (their wetland complex broke up) and rebind only
  // through their towns; that is a standing condition Aevi's renames will clear, and this census holds
  // the list so a THIRD name sliding onto the fallback is reported by name, not absorbed.
  const KNOWN_FALLBACK = new Set(["the_greenmarch_fen", "the_stairfen"]);
  const onFallback = [...res.placeNames.rivers, ...res.placeNames.fens].filter((r) => r.via !== "signature");
  const unexpectedFb = onFallback.filter((r) => !KNOWN_FALLBACK.has(r.id));
  check("SNG-393: no name leans on the town fallback beyond the KNOWN census (Marchfen, Stairfen — merged complex, renames pending)",
    unexpectedFb.length === 0, unexpectedFb.map((r) => r.name + " via " + r.via).join(" · "));
  check("SNG-393: every signature match is unambiguous — margin ≥ 2° against the runner-up",
    [...res.placeNames.rivers, ...res.placeNames.fens].every((r) => r.margin >= 2));
  // ⛔ PROVE THE GATE CAN GO RED: shift one resolved river's address 10° and it must land unresolved,
  // not quietly bind to the nearest water — the acceptance threshold genuinely rejects.
  const perturbed = JSON.parse(JSON.stringify(pnDisk));
  const target = perturbed.rivers.find((r) => res.placeNames.rivers.some((x) => x.id === r.id));
  target.head = [target.head[0] + 10, target.head[1]]; target.mouth = [target.mouth[0] + 10, target.mouth[1]];
  delete target.nearHead; delete target.nearMouth;             // and no town to rescue it
  const res2 = RA.resolvePlaceNames(perturbed, built.hydrology, { seedPos: seedPos393 });
  check("SNG-393: a signature moved 10° lands UNRESOLVED — never quietly bound to the nearest water",
    res2.placeNames.unresolved.some((u) => u.id === target.id));

  // ── SNG-394 §1 — ONE NAME PER FEATURE. Neither of us gated this and the shipped asset carried
  // 8 fen bindings on 6 polygons. The collision census reports BOTH names — "silently dropping one
  // loses a place" — and never picks a winner: two names on one polygon is either a merged feature
  // (Aevi renames) or a pool defect (mine). Provenance mattered here: the Stiltfen + Terrace Fen pair
  // was authored identical in her own 0c040d85; the Marchfen + Stairfen pair was DISTINCT authored
  // ~10° apart and my write-back collapsed them — one collision hers, one manufactured by the machine.
  const collisions = (rows, key) => {
    const by = new Map();
    for (const r of rows) { if (!by.has(r[key])) by.set(r[key], []); by.get(r[key]).push(r.name); }
    return [...by.values()].filter((g) => g.length > 1).map((g) => g.sort().join(" + ")).sort();
  };
  const riverCollide = collisions(res.placeNames.rivers, "pathIndex");
  // ⛔ THE RIVER COLLISION IS NOT A DATA ERROR — IT IS FICTION THE SCHEMA CANNOT HOLD, and that is a
  // better finding than a bug. Aevi resited the Drowned Reach (née Choirwater) onto "the 129.6° main
  // stem" because the flood took that water; the 129.6° main stem IS the Echo. Two names on one river
  // is exactly right when one of them names a REACH — the lower stretch of a river is a place with its
  // own name in every real geography — and `placeNames` has no way to say so: one name, one pathIndex,
  // whole river. ⚠️ So the census pins it rather than forcing a winner, and the missing concept is
  // reported to her (po/REPLY_ccode_SNG-396_398_applied.md §3) instead of being papered over by
  // renaming a river nobody wanted renamed.
  const KNOWN_RIVER_COLLISIONS = ["The Drowned Reach + The Echo"];
  check("SNG-394: river names collide only where a REACH shares its river — the known census, both names kept",
    JSON.stringify(riverCollide) === JSON.stringify(KNOWN_RIVER_COLLISIONS),
    "expected [" + KNOWN_RIVER_COLLISIONS.join(" | ") + "] got [" + riverCollide.join(" | ") + "]");
  // ⚠️ f4aec367 cleared the Stiltfen pair — and MINTED a new one: the Terrace Fen was re-sited to the
  // byte-identical centroid of the Plateau Fen ([-74.13, 55]), the same copy-paste class as the pair it
  // fixed. Reported in po/REPLY_ccode_SNG-394b_census.md; pinned here so it cannot silently multiply.
  // ⚠️ THE CENSUS TRACKS HER WORK, WHICH IS THE POINT OF A CENSUS: her resite cleared the Terrace/
  // Plateau pair she minted last round and moved the Quiet Fen onto the Milljaw's polygon, so the list
  // turns over rather than shrinking monotonically. Marchfen + Stairfen persist pending her split call.
  const KNOWN_FEN_COLLISIONS = ["The Marchfen + The Stairfen", "The Milljaw + The Quiet Fen"];
  const fenCollide = collisions(res.placeNames.fens, "polyIndex");
  check("SNG-394: fen collisions match the KNOWN census exactly — both names reported, neither dropped, Aevi decides",
    JSON.stringify(fenCollide) === JSON.stringify(KNOWN_FEN_COLLISIONS),
    "expected [" + KNOWN_FEN_COLLISIONS.join(" | ") + "] got [" + fenCollide.join(" | ") + "]");
  // ⛔ THE RED, OBSERVED IN-SUITE: give two rivers one address and the detector must see one feature
  // wearing two names. The river side passes today, which is exactly when to prove it can fail.
  const twin = JSON.parse(JSON.stringify(pnDisk));
  const [ra, rb] = twin.rivers.filter((r) => res.placeNames.rivers.some((x) => x.id === r.id && x.via === "signature"));
  rb.head = [...ra.head]; rb.mouth = [...ra.mouth];
  const resTwin = RA.resolvePlaceNames(twin, built.hydrology, { seedPos: seedPos393 });
  const twinCollide = collisions(resTwin.placeNames.rivers, "pathIndex");
  check("SNG-394: …and the detector FIRES — two rivers given one address surface as a named pair",
    twinCollide.length === 1 && twinCollide[0].includes(ra.name) && twinCollide[0].includes(rb.name),
    "got [" + twinCollide.join(" | ") + "]");

    // ── SNG-392 §1 — THE HIERARCHY IS APPLIED AND THE LOCAL SCHEMA IS ARMED ──
  // Aevi corrected the staged derivation (091dad1a); I applied it to content — late, and the lateness was
  // mine: her corrections sat staged for a day while §1 said the schema was "the only thing blocking ME".
  {
    const allLocs = Object.values(canon.locs);
    const tiers = allLocs.reduce((a, l) => (a[l.tier] = (a[l.tier] || 0) + 1, a), {});
    // ⚠️ THE CENSUS MOVED BECAUSE THE WORLD DID, AND THAT IS THE GATE WORKING. SNG-398 retiered all
    // 65 topology-derived "sites" to settlement (they were satellites, not rooms) and SNG-396 repopulated
    // the tier with 14 places PLAY authored — real interiors with fiction-derived parents. 25/28/65
    // became 25/96/14, and every number here is a ratified decision rather than a measurement of drift.
    check("SNG-392/398/396: the hierarchy matches the RATIFIED census — 25 regions, 96 settlements, 14 authored-in-play sites",
      tiers.region === 25 && tiers.settlement === 96 && tiers.site === 14, JSON.stringify(tiers));
    const ids = new Set(allLocs.map((l) => l.id));
    const badParent = allLocs.filter((l) => l.parentId !== null && !ids.has(l.parentId));
    check("SNG-392: every parentId resolves and every site HAS a parent",
      badParent.length === 0 && allLocs.filter((l) => l.tier === "site" && !l.parentId).length === 0,
      badParent.map((l) => l.id).join(" · "));
    check("SNG-392: roles stay in the ratified vocabulary — gate and waypoint, nothing invented",
      allLocs.every((l) => !l.role || ["gate", "waypoint"].includes(l.role)));
    // ⚠️ THE LOCAL SCHEMA, VALIDATED THE DAY SHE AUTHORS IT — armed now, vacuous until then, exactly
    // like the SNG-384 source validator was for the bastions. Erik's no-cap ruling means NO magnitude
    // check lives here: kind/sign coherence, a positive radius, and a REASON are the whole contract.
    const badLocal = [];
    for (const l of allLocs) {
      if (l.localMap && (l.tier !== "site" || !Number.isFinite(l.localMap.x) || !Number.isFinite(l.localMap.y)))
        badLocal.push(l.id + ": localMap malformed or on a non-site");
      for (const src of l.localSources || []) {
        if (!["pool", "sink"].includes(src.kind)) badLocal.push(l.id + ": kind " + src.kind);
        else if (src.kind === "pool" && !(src.delta > 0)) badLocal.push(l.id + ": pool with delta " + src.delta);
        else if (src.kind === "sink" && !(src.delta < 0)) badLocal.push(l.id + ": sink with delta " + src.delta);
        if (!(Number(src.radiusLocal) > 0)) badLocal.push(l.id + ": no radiusLocal");
        if (!src.reason) badLocal.push(l.id + ": no reason — the receipt is what a defender is shown");
        if (src.field && !["substrate", "nanite"].includes(src.field)) badLocal.push(l.id + ": field " + src.field);
      }
    }
    check("SNG-392: every authored local source is well-formed — kind, sign, radius, reason, a known axis",
      badLocal.length === 0, badLocal.slice(0, 6).join(" · "));

    // ── SNG-398 — THE DISTANCE GATE the derivation never had. "A site is a place inside a
    // settlement… somewhere you walk to in an afternoon." The topology derivation filed Millbrook
    // (88 days out) as a room of Echo River Crossing because a hamlet at the end of one road is
    // topologically identical to a room off a courtyard. Aevi ratified it; the one line that showed
    // the error is this line. ⚠️ Census-pinned to today's data — every one of the 65 is beyond the
    // cut (re-derivation staged at po/staged_content/hierarchy_rederived_SNG-398.json: ZERO survive);
    // her ratification shrinks the census to empty in the same commit that retiers them.
    const { walkingDays: wd398 } = await import("../engine/worldmap.js");
    const SITE_MAX_DAYS_398 = 1;
    const farSites = allLocs.filter((l) => {
      if (l.tier !== "site") return false;
      const p = l.parentId ? canon.locs[l.parentId] : null;
      const d = p ? wd398(l, p) : null;
      return d == null || d > SITE_MAX_DAYS_398;
    }).map((l) => l.id).sort();
    check("SNG-398: no site sits beyond ONE DAY of its parent — the census is EMPTY now that the ratification landed",
      farSites.length === 0, farSites.join(" · "));
    // ⛔ SNG-409 §6 — AN INHERITED POSITION IS A CACHED POSITION, AND CANON MOVES. SNG-407 relocated
    // eleven locations; four promoted rooms had copied their parent's coordinates at promotion time and
    // stayed behind when the parent left, which the distance gate above caught as two stranded sites.
    // ⚠️ Aevi's §6 says it in general terms — "anything caching a distance is stale" — and a room's
    // position is exactly that. This holds the invariant directly so the next move heals by rebuild
    // rather than by someone noticing.
    const strandedRooms = allLocs.filter((l) => {
      if (!l.worldPosInherited || !l.worldPos) return false;
      let anc = l.parentId, hops = 0;
      while (anc && canon.locs[anc]?.worldPosInherited && hops++ < 4) anc = canon.locs[anc].parentId;
      const p = canon.locs[anc];
      if (!p?.worldPos) return false;
      return Math.abs(p.worldPos.colatitude - l.worldPos.colatitude) > 1e-9
        || Math.abs(p.worldPos.longitude - l.worldPos.longitude) > 1e-9;
    }).map((l) => l.id);
    check("SNG-409 §6: every inherited position still MATCHES its parent — a room does not stay behind when its building moves",
      strandedRooms.length === 0, strandedRooms.join(" · "));
    // ⛔ THE RED IS PROVED BY CONSTRUCTION, AND MY FIRST FORM OF IT WAS A DESIGN ERROR WORTH KEEPING
    // ON THE RECORD: I asserted `farSites.length === 65` — today's broken data — as the proof the gate
    // could fire. That inverts the moment the data is FIXED: Aevi's ratification would have turned my
    // red-proof red for the crime of succeeding. A gate must never depend on the defect it guards
    // against persisting. So: build a site whose parent is a hemisphere away and require the detector
    // to name it, which holds whatever the content does.
    const farProbe = { id: "probe", tier: "site", parentId: "probe-parent",
      worldPos: { colatitude: 10, longitude: 0, depth: 0 } };
    const farParent = { id: "probe-parent", worldPos: { colatitude: 170, longitude: 180, depth: 0 } };
    check("SNG-398: …and the detector FIRES on a planted far site — red observed by construction, not by leaving the bug in place",
      wd398(farProbe, farParent) > 1);

    // ── SNG-396 — PLAY OUTRAN CONTENT AND CONTENT MUST NOT FORGET. The saves hold generated
    // places with real memory notes; a visited-more-than-once place absent from content is a
    // REPORTABLE BACKLOG ITEM, never an error — so the backlog is a printed census, and the GATE
    // asserts only that the extractor cannot forget: the known backlog stays present with its
    // evidence, and the SNG-329 artifact stays LABELLED as an artifact rather than laundered.
    const { extractGeneratedPlaces } = await import("../scripts/extract_generated_places.mjs");
    const gp396 = extractGeneratedPlaces();
    const backlog = gp396.places.filter((p) => p.visits > 1 && !p.artifact && !canon.locs[p.id]);
    console.log(`note  SNG-396 backlog: ${backlog.length} generated place(s) visited >1 and not in content — ${backlog.map((p) => p.id).join(", ") || "none"}`);
    const KNOWN_BACKLOG_396 = ["gen-ashwarden-march-road", "gen-north-gate-registry-ossian-office", "gen-stillwater-s-trouble", "gen-waygate"];
    const forgotten = KNOWN_BACKLOG_396.filter((id) => !gp396.places.some((p) => p.id === id && p.visits > 1 && (p.notes.length || p.descriptionSeed)));
    check("SNG-396: the extractor cannot FORGET — every known backlog place surfaces with its evidence (seed or memory notes)",
      forgotten.length === 0, forgotten.join(" · "));
    check("SNG-396: gen-object-object stays LABELLED as the SNG-329 artifact — reviewed as residue, never laundered into a place",
      gp396.places.some((p) => p.id === "gen-object-object" && !!p.artifact));
    check("SNG-396: the Made Gate is captured — a player-built waygate is a world event sitting in a save, and the census holds it",
      gp396.places.some((p) => p.id === "gen-the-made-gate" && p.visits >= 1));
  }
  // ══ SNG-404 §2 step 2 — THE PROSE STEP, AS A BUILDER AND NOT A REGEX.
  // Aevi: "A BUILDER STEP, NOT A REGEX — the water-word audit stands as the warning: a regex over prose
  // finds words, not facts." So the module never reads prose: it assembles a question, and the model's
  // answer is stripped of geometry before it lands. The model proposes WHAT and WHY; the measurements
  // decide WHERE, which means a hallucinated bearing has nowhere to enter.
  {
    const LB = await import("../engine/localbuilder.mjs");
    const LD404 = await import("../engine/localdetail.mjs");
    const TG404b = await import("../scripts/world/terrain.mjs");
    const layouts404 = rj("content/packs/core/world/local_layouts.json");
    const fT = TG404b.makeTerrain(canon.gp, null);
    const ids = Object.keys(layouts404).filter((k) => !k.startsWith("_"));

    // ⛔ THE PROMPT CARRIES MEASURED FACTS, NOT INSTRUCTIONS — and it must never ask for a bearing,
    // because a model asked for one will give one and it will be invented.
    const mb = canon.locs.millbrook;
    const g = LD404.measureGradients(mb, { locations: canon.locs, hydrology: built.hydrology, terrainFn: fT });
    const prompt = LB.buildLayoutPrompt(mb, { gradients: g });
    check("SNG-404 §2: the prompt states the MEASURED ground and forbids the model to invent geometry",
      /measures around it/i.test(prompt) && /Do NOT give bearings/i.test(prompt)
      && prompt.includes(String(g.uphillBearing)) && LD404.SITE_BASES.every((b) => prompt.includes(b)));

    // ⛔ REPLAYED THROUGH HER OWN CORPUS, PER BASIS. Feeding her authored `basis` values back through the
    // placer, every basis that names a UNIQUE DIRECTION reproduces her hand-authored bearing exactly —
    // and every basis needing a REFERENT misses, because her data records which road only in the `why`
    // prose. ⚠️ That is a data-shape finding, not a bug: `road` is 14 of her 33 placements.
    const byBasis = {};
    for (const id of ids) {
      const loc = canon.locs[id]; if (!loc) continue;
      const gg = LD404.measureGradients(loc, { locations: canon.locs, hydrology: built.hydrology, terrainFn: fT });
      const res = LB.placeProposal({ radiusMetres: layouts404[id].radiusMetres || 420, sites: layouts404[id].sites }, loc, gg);
      for (const st of res.sites) {
        const hers = (layouts404[id].sites || []).find((x) => x.id === st.id || x.name === st.name);
        if (!hers?.localMap) continue;
        const d = Math.abs(((hers.localMap.bearing - st.localMap.bearing + 540) % 360) - 180);
        (byBasis[st.basis] = byBasis[st.basis] || []).push(d);
      }
    }
    const medOf = (b) => { const a = (byBasis[b] || []).slice().sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : null; };
    const selfPlacing = ["uphill", "prose", "inferred", "anti-uphill"];
    check("SNG-404 §2: the placer reproduces Aevi's hand-authored bearings for every basis the GROUND alone decides",
      selfPlacing.every((b) => medOf(b) !== null && medOf(b) <= 2),
      selfPlacing.map((b) => `${b} ${medOf(b)}°`).join(", "));
    // ⚠️ AND THE CONVERSE IS ASSERTED, because it is the finding: a referent-needing basis CANNOT be
    // placed from the corpus as it stands. If this ever passes, `toward` has been authored and the
    // reproduction gate above should grow to cover `road` too.
    check("SNG-404 §2: …and a referent-needing basis CANNOT be reproduced without one — the corpus records `which road` only in prose",
      medOf("road") !== null && medOf("road") > 20,
      `road median ${medOf("road")}° across ${(byBasis.road || []).length} placements`);

    // ⛔ A REFERENT, WHEN GIVEN, IS OBEYED — which is what makes the authoring ask worth making.
    const roads = { river: null, uphill: null, roads: [{ to: "a", bearing: -88 }, { to: "b", bearing: 91 }, { to: "c", bearing: 12 }] };
    const named = LD404.placeSite({ basis: "road", toward: "c" }, roads, {});
    const guessed = LD404.placeSite({ basis: "road" }, roads, {});
    check("SNG-404 §2: a `toward` referent is obeyed, and its absence is REPORTED as a guess rather than hidden",
      named.bearing === 12 && /road to c/.test(named.why) && /is a guess/.test(guessed.why));

    // ⚠️ HER §4, ENFORCED END-TO-END: a proposal the ground cannot support is DROPPED with a reason,
    // never shipped as decoration. The Kindlerow case, driven through the whole builder path.
    const dry = LD404.measureGradients(canon.locs.kindlerow, { locations: canon.locs, hydrology: built.hydrology, terrainFn: fT });
    const out = LB.placeProposal({ sites: [{ id: "x", name: "A Dock", basis: "river", why: "invented" },
      { id: "y", name: "The Forge", basis: "uphill", why: "the slope" }] }, canon.locs.kindlerow, dry);
    check("SNG-404 §2: a proposal the ground cannot support is DROPPED with a reason — no dock in a town with no river",
      out.sites.length === 1 && out.dropped.length === 1 && /river/.test(out.dropped[0].reason));
    check("SNG-404 §2: …and everything that DOES ship carries both reasons — what the text argued and what the geometry did",
      out.sites.every((st) => st.why && st.placedBecause));
  }

  // ══ SNG-409 §5 — A CONTESTED AREA LOOKS LIKE AN AREA.
  // "No location in this world has a boundary — all 135 are points, including the 25 marked
  // `tier: region`. A contested territory currently looks like a village."
  {
    const WGA = await import("../engine/worldglobe.js");
    const zone = rj("content/packs/core/world/areas.json").disputed_zone;

    // ⛔ HER LOAD-BEARING CONSTRAINT: "membership must be COMPUTED, not read from `parentId`."
    const computed = WGA.areaMembers(zone, canon.locs);
    const byGraph = Object.values(canon.locs).filter((l) => l.parentId === "disputed_zone_fringe").map((l) => l.id).sort();
    const graphOnly = byGraph.filter((id) => !computed.includes(id));
    const bandOnly = computed.filter((id) => !byGraph.includes(id));
    check("SNG-409 §5: zone membership is COMPUTED — the graph and the band are genuinely different sets",
      computed.length > 3 && (graphOnly.length > 0 || bandOnly.length > 0),
      `in the graph but not the band: ${graphOnly.join(", ") || "none"}; in the band but not the graph: ${bandOnly.join(", ") || "none"}`);

    // ⛔ HER OWN CORRECTION, HELD AS A GATE: "ELLIPSE, NOT EQUIDISTANCE. My first formula tested only
    // whether the two fields were comparably distant, AND THAT IS NOT BETWEENNESS. The Great Coliseum is
    // exactly equidistant from both powers" — and sits far off to the side. The equidistance test admits
    // it; the ellipse must not.
    const col = canon.locs.the_great_coliseum;
    check("SNG-409 §5: the ellipse rejects the equidistant-but-distant case — equidistance is not betweenness",
      !!col && WGA.areaFieldAt(zone, col.worldPos.longitude, col.worldPos.colatitude - 90) === 0);

    // ⚠️ AND IT IS A BAND, NOT A POLYGON. Her acceptance: "done when the zone reads as a band with NO
    // CLEAN EDGE — the fiction says shimmer-vortices wander." A field with intermediate values has no
    // boundary to point at; an outline would assert a precision the world denies.
    const along = [];
    for (let i = 0; i <= 20; i++) along.push(WGA.areaFieldAt(zone, 78 + i * 2.2, -68.5));
    const soft = new Set(along.filter((v) => v > 0.02 && v < 0.98)).size;
    check("SNG-409 §5: …and it fades rather than ending — a band with no clean edge, as the fiction asks",
      soft >= 5 && along[0] > 0.9 && along[along.length - 1] === 0,
      `${soft} intermediate values across the transect`);
  }

  // ══ SNG-409 §3 — THE THREE NETWORKS ARE VISIBLY INDEPENDENT.
  // Aevi: "This is not decoration — it is a measured argument. Waygates are only 1.1× closer to
  // substrate sources than chance. ⛔ Precursors laid the lines, someone else built the gates, and
  // people walk neither. That is why `wake_the_line` exists as a craft — you only rouse a road nobody
  // has been using. The map is the only place a player can see it."
  {
    const WGN = await import("../engine/worldglobe.js");
    const tN = WGN.decodeTerrain(rj("content/packs/core/world/terrain.json"));
    const pre = rj("content/packs/core/world/precursor_lines.json");
    const view = { yaw: 20, pitch: -52, r: 900, cx: 350, cy: 270 };

    // ⛔ THE CRAFT IS THE GATE. `old_roads` is "sense, follow, and safely approach Precursor traces";
    // a player without it must see roads and gates and NO lines, which is the fiction rather than a
    // rendering preference.
    const without = WGN.networkPaths(tN, view, { locations: canon.locs, precursor: pre, showPrecursor: false });
    const withIt = WGN.networkPaths(tN, view, { locations: canon.locs, precursor: pre, showPrecursor: true });
    check("SNG-409 §3: the buried lines are visible ONLY to a character who can sense them — old_roads is the gate",
      without.precursor.length === 0 && withIt.precursor.length > 5,
      `${without.precursor.length} without the craft, ${withIt.precursor.length} with it`);
    check("SNG-409 §3: …and the roads draw for everyone, derived from the graph a player actually walks",
      without.roads.length > 50 && without.roads.every((r) => r.length > 1));

    // ⚠️ HER RENDERING NOTE IS A FACT ABOUT THE WORLD, NOT A STYLE: the spans run UNDER the ground, so
    // they project at a radius inside the sphere and the limb occludes them sooner than the surface.
    const flat = { yaw: 0, pitch: 0, r: 300, cx: 0, cy: 0 };
    const onSurface = WGN.project(10, 10, flat), buried = WGN.project(10, 10, flat, 0.985);
    check("SNG-409 §3: …and a precursor span runs BELOW the surface, not painted on it",
      Math.hypot(buried.x, buried.y) < Math.hypot(onSurface.x, onSurface.y));

    // ⛔ THE INDEPENDENCE ITSELF, RE-MEASURED HERE RATHER THAN QUOTED. She caught her own first null as
    // biased — a network BUILT FROM locations guarantees locations sit near it — so the honest question
    // is whether the GATES sit closer to the lines than the general run of places does. They do not.
    const nodes = pre.nodes.map((n) => [n.lat, n.lon]);
    const nearestSpanDeg = (lat, lon) => {
      let best = Infinity;
      for (const n of nodes) {
        const d = Math.acos(Math.max(-1, Math.min(1,
          Math.sin(lat * Math.PI / 180) * Math.sin(n[0] * Math.PI / 180) +
          Math.cos(lat * Math.PI / 180) * Math.cos(n[0] * Math.PI / 180) * Math.cos((lon - n[1]) * Math.PI / 180)))) * 180 / Math.PI;
        if (d < best) best = d;
      }
      return best;
    };
    const med = (xs) => { const a = xs.slice().sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; };
    const placed = Object.values(canon.locs).filter((l) => l.worldPos && !l.worldPosInherited);
    const gateD = med(placed.filter((l) => l.waygate).map((l) => nearestSpanDeg(l.worldPos.colatitude - 90, l.worldPos.longitude)));
    const allD = med(placed.map((l) => nearestSpanDeg(l.worldPos.colatitude - 90, l.worldPos.longitude)));
    check("SNG-409 §3: the networks really are INDEPENDENT — the gates sit no closer to the buried lines than places in general",
      gateD >= allD, `waygates median ${gateD.toFixed(2)}° vs all locations ${allD.toFixed(2)}°`);
  }

  // ══ SNG-409 §1 — NANITE AND DENSITY RESOLVE AS YOU ZOOM.
  // Aevi: "Type, nanite and biome are baked at 480 × 240 — roughly ten cells across the screen at a 5°
  // view. ⛔ The map is a picture that gets bigger, not a world that resolves." Terrain needed a
  // generator because it is a noise field; these two did not — they are a weighted vote over region
  // seeds, a closed form the browser can evaluate anywhere. The asset ships the vote's INPUTS (~7KB).
  {
    const WGF = await import("../engine/worldglobe.js");
    const tF = WGF.decodeTerrain(rj("content/packs/core/world/terrain.json"));
    check("SNG-409 §1: the vote's inputs ship with the asset — voters, regions and sources, not a finer bake",
      !!tF.fields && tF.fields.voters.length > 100 && Object.keys(tF.fields.nanByRegion).length > 20
      && tF.fields.sources.length > 20);

    // ⛔ HER LOAD-BEARING CONSTRAINT: "whatever produces the detail must agree with the baked layers, or
    // the base and the detail draw different worlds. I hit that as a visible seam and measured it at
    // 2.44% disagreement." ⚠️ Evaluating the SAME expression over the SAME numbers cannot disagree —
    // but "cannot" is a claim about code, and code changes, so it is measured at the cell centres where
    // the bake is authoritative.
    let nOk = 0, nTot = 0, dErr = 0, dMax = 0, dTot = 0;
    for (let y = 3; y < tF.h; y += 17) for (let x = 3; x < tF.w; x += 13) {
      const lon = -180 + ((x + 0.5) / tF.w) * 360, lat = 90 - ((y + 0.5) / tF.h) * 180;
      const baked = WGF.sampleAt(tF, lon, lat);
      if (baked.type === 0 || baked.type === 3) continue;
      const r = WGF.regionVoteAt(tF, lon, lat);
      nTot++; if (WGF.naniteAt(tF, lon, lat, r) === baked.nanite) nOk++;
      const e = Math.abs(WGF.densityAt(tF, lon, lat, r) - baked.density);
      dErr += e; dMax = Math.max(dMax, e); dTot++;
    }
    check("SNG-409 §1: the evaluated nanite AGREES with the bake at every cell centre — no seam to measure",
      nTot > 100 && nOk === nTot, `${nOk} of ${nTot}`);
    // ⚠️ the bake stores density in 6 bits, so its own step is 1/63 ≈ 0.0159: agreeing to better than
    // half a step is agreement to the precision the baked layer can express at all.
    check("SNG-409 §1: …and the evaluated density agrees to finer than the bake's own quantisation step",
      dTot > 100 && (dErr / dTot) < (1 / 63) / 2 && dMax < (1 / 63),
      `mean ${(dErr / dTot).toFixed(4)}, max ${dMax.toFixed(4)}, bake step ${(1 / 63).toFixed(4)}`);

    // ⛔ AND IT ACTUALLY RESOLVES — her acceptance test is that a close view reveals what a wide one could
    // not contain. Measured across 4° through the strongest authored source: the bake can express TWO
    // values over that ground, the evaluation expresses hundreds.
    const src = tF.fields.sources.slice().sort((a, b) => Math.abs(b[2]) - Math.abs(a[2]))[0];
    const baked = new Set(), evaled = new Set();
    for (let i = 0; i < 600; i++) {
      const lon = src[1] - 2 + 4 * (i / 599), lat = src[0];
      const b = WGF.sampleAt(tF, lon, lat);
      if (b.type === 0) continue;
      baked.add(b.density.toFixed(4));
      evaled.add(WGF.densityAt(tF, lon, lat).toFixed(4));
    }
    check("SNG-409 §1: …and it RESOLVES — the same ground carries far more tone evaluated than baked",
      evaled.size > baked.size * 10,
      `${baked.size} baked values vs ${evaled.size} evaluated across 4° through the strongest source`);
  }

  // ══ SNG-409 §4 — A POLE NEVER READS AS A TOWN.
  // Aevi: "`tier` is SIZE, `role` is FUNCTION, `kind` is SHAPE… a waygate and a village are both
  // `tier: settlement`; they should never share an icon." And the reason it is not decoration:
  // "⛔ Twelve locations are `pole` — the Blaze, the Scouring, the Numen, the Unfallen. They are pure
  // extremities of an axis, not settlements, and a settlement icon would LIE about the most dangerous
  // places in the world."
  {
    const MI = await import("../engine/mapicons.mjs");
    const kindDoc = rj("content/packs/core/world/location_kinds.json");
    const kindRows = kindDoc.kinds || kindDoc;
    const authored = [...new Set(Object.entries(kindRows).filter(([id]) => !id.startsWith("_"))
      .map(([, v]) => (typeof v === "string" ? v : v && v.kind)).filter(Boolean))];

    // ⛔ EXHAUSTIVE, NOT DEFAULTED. A kind with no glyph must FAIL rather than fall through to a dot —
    // a silent default is exactly how a pole ends up looking like a village.
    const unmapped = authored.filter((k) => !MI.KIND_GLYPH[k]);
    check("SNG-409 §4: every authored kind has a glyph — an unmapped kind fails rather than drawing as a dot",
      unmapped.length === 0 && authored.length >= 30, "no glyph for: " + unmapped.join(", "));

    // ⚠️ SHE OFFERED TO COLLAPSE THE VOCABULARY IF IT WAS TOO FINE TO DRAW. It should NOT be collapsed —
    // it feeds narration as well as the map — so 34 authored kinds map onto fewer drawable glyphs and
    // the MAPPING is the thing that is written down. This holds that shape: a real reduction, without
    // the source losing distinctions the prose still wants.
    check("SNG-409 §4: …and the 34 kinds reduce to a drawable set without collapsing the authored vocabulary",
      MI.ALL_GLYPHS.length < authored.length && MI.ALL_GLYPHS.length >= 12,
      `${authored.length} kinds → ${MI.ALL_GLYPHS.length} glyphs`);

    // ⛔ THE PRECEDENCE, WHICH IS NOT ALPHABETICAL: pole outranks everything, and a waygate outranks the
    // tier it sits on because stepping through it is what changes a player's route.
    check("SNG-409 §4: a POLE is never drawn as a settlement — even one flagged as a waygate",
      MI.glyphFor({ k: "pole" }) === "pole" && MI.glyphFor({ k: "pole", wg: 1 }) === "pole");
    check("SNG-409 §4: …and a waygate outranks whatever it was cut into",
      MI.glyphFor({ k: "city", wg: 1 }) === "waygate" && MI.glyphFor({ k: "city" }) === "city");

    // ⛔ HER ACCEPTANCE TEST, MEASURED ON PIXELS: "done when a waygate, a village, an underplace and a
    // pole are distinguishable at a glance." Distinguishable is not a matter of opinion — render each
    // to a small offscreen grid and require the silhouettes to differ substantially from one another.
    const SZ = 22;
    const raster = (glyph) => {
      const cells = new Uint8Array(SZ * SZ);
      // a minimal 2D-context stand-in: every path op rasterises to the cells it touches, which is all a
      // silhouette comparison needs and keeps this dependency-free in node.
      let cx = 0, cy = 0;
      const mark = (x, y) => {
        const gx = Math.round(x), gy = Math.round(y);
        if (gx >= 0 && gy >= 0 && gx < SZ && gy < SZ) cells[gy * SZ + gx] = 1;
      };
      const line = (x0, y0, x1, y1) => {
        const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2));
        for (let i = 0; i <= n; i++) mark(x0 + (x1 - x0) * (i / n), y0 + (y1 - y0) * (i / n));
      };
      const ctx = {
        save() {}, restore() {}, beginPath() { }, closePath() { }, fill() { }, stroke() { },
        moveTo(x, y) { cx = x; cy = y; }, lineTo(x, y) { line(cx, cy, x, y); cx = x; cy = y; },
        arc(x, y, r, a0, a1) { for (let a = a0; a <= a1 + 0.05; a += 0.15) mark(x + Math.cos(a) * r, y + Math.sin(a) * r); cx = x; cy = y; },
        ellipse(x, y, rx, ry) { for (let a = 0; a < Math.PI * 2; a += 0.15) mark(x + Math.cos(a) * rx, y + Math.sin(a) * ry); },
        quadraticCurveTo(qx, qy, x, y) { line(cx, cy, x, y); cx = x; cy = y; },
        rect(x, y, w, h) { line(x, y, x + w, y); line(x + w, y, x + w, y + h); line(x + w, y + h, x, y + h); line(x, y + h, x, y); },
        set lineWidth(v) {}, set strokeStyle(v) {}, set fillStyle(v) {}, set globalAlpha(v) {},
        set lineJoin(v) {}, set lineCap(v) {}, set font(v) {}, set textAlign(v) {},
      };
      MI.drawGlyph(ctx, glyph, SZ / 2, SZ / 2, 7, {});
      return cells;
    };
    const four = ["waygate", "village", "cave", "pole"];
    const grids = four.map(raster);
    let worstSimilarity = 0, worstPair = "";
    for (let i = 0; i < grids.length; i++) for (let j = i + 1; j < grids.length; j++) {
      let same = 0, union = 0;
      for (let c = 0; c < SZ * SZ; c++) {
        if (grids[i][c] || grids[j][c]) union++;
        if (grids[i][c] && grids[j][c]) same++;
      }
      const sim = union ? same / union : 1;
      if (sim > worstSimilarity) { worstSimilarity = sim; worstPair = four[i] + "/" + four[j]; }
    }
    check("SNG-409 §4: a waygate, a village, an underplace and a pole are DISTINGUISHABLE — measured on the drawn pixels",
      grids.every((g) => g.some((v) => v)) && worstSimilarity < 0.45,
      `most-similar pair ${worstPair} overlaps ${(100 * worstSimilarity).toFixed(0)}%`);

    // and every glyph must actually put ink down — an unimplemented case that silently draws nothing
    // is the same failure as an unmapped kind, one layer along
    const blank = MI.ALL_GLYPHS.filter((g) => !raster(g).some((v) => v));
    check("SNG-409 §4: …and every glyph in the set actually draws something",
      blank.length === 0, "blank: " + blank.join(", "));
  }

  // ══ SNG-404 — THE LOCAL DETAILING ENGINE, MEASURED AGAINST THE EIGHT AUTHORED LAYOUTS.
  // Aevi built a corpus specifically to be argued with — four Valley towns that agreed on a rule set and
  // four contrast towns chosen to break it, which they did in four different ways. These gates hold the
  // engine to HER measurements, because an engine that cannot reproduce the corpus it was derived from
  // is not a generalisation of it.
  {
    const LD = await import("../engine/localdetail.mjs");
    const TG404 = await import("../scripts/world/terrain.mjs");
    const layouts = rj("content/packs/core/world/local_layouts.json");
    const fT404 = TG404.makeTerrain(canon.gp, null);
    const ids404 = Object.keys(layouts).filter((k) => !k.startsWith("_"));

    // ⛔ THE HANDSHAKE. Her `_measured` blocks were taken against the same world; if my numbers drift
    // from hers, every placement built on them is drifting too and nobody would see it.
    const drift = [];
    for (const id of ids404) {
      const loc = canon.locs[id]; if (!loc) { drift.push(id + ": not in content"); continue; }
      const hers = layouts[id]._measured || {};
      const mine = LD.measureGradients(loc, { locations: canon.locs, hydrology: built.hydrology, terrainFn: fT404 });
      if (hers.riverDistanceDeg != null && Math.abs(hers.riverDistanceDeg - mine.riverDistanceDeg) > 0.02)
        drift.push(`${id}: river ${hers.riverDistanceDeg} vs ${mine.riverDistanceDeg}`);
      // ⚠️ compared MODULO 360 — she writes 0..360 and this module writes -180..180, so her 210 and my
      // -150 are the same direction. Comparing the numerals would fail on a difference of notation.
      if (hers.uphillBearing != null) {
        const d = Math.abs(((hers.uphillBearing - mine.uphillBearing + 540) % 360) - 180);
        if (d > 2) drift.push(`${id}: uphill ${hers.uphillBearing} vs ${mine.uphillBearing}`);
      }
    }
    check("SNG-404: the engine reproduces Aevi's own measurements across all eight authored layouts",
      drift.length === 0, drift.join(" · "));

    // ⛔ THE THRESHOLD SEPARATES HER CORPUS — asserted as SHAPE, never as the value. Erik and Aevi own
    // the number; what a gate may hold is that whatever it is, Greywater's flat ground stays out and
    // every town she DID place on a measured slope stays in.
    const reliefOf = {};
    for (const id of ids404) {
      const loc = canon.locs[id]; if (!loc) continue;
      reliefOf[id] = LD.measureGradients(loc, { locations: canon.locs, hydrology: built.hydrology, terrainFn: fT404 }).relief;
    }
    // ⛔ GROUND TRUTH IS HER `basis` FIELD, NOT MY READING OF HER BEARINGS. I inferred which layouts used
    // the slope by matching site bearings against the measured uphill; she then shipped `basis` on all 38
    // sites (db13ac4d) for exactly that reason — "the relief threshold could not be tuned from bearings
    // because noise-uphill coincides with real bearings." ⚠️ My inference happened to agree on all eight,
    // which is luck worth not relying on: the gate reads her field now.
    const usedUphill = ids404.filter((id) => (layouts[id].sites || []).some((x) => x.basis === "uphill"));
    const noUphill = ids404.filter((id) => !usedUphill.includes(id));
    // ⛔ THE CUT IS NECESSARY, NOT SUFFICIENT — and the first form of this gate hid that by hand-listing
    // `flatGround = ["greywater_stilts"]`, the single town that fitted. That is encoding the conclusion
    // instead of testing it, and reading her `basis` field instead of my own shortlist turned it red
    // immediately: the Service Ways (0.048) and the Figure Works (0.268) also place nothing uphill, and
    // both are well ABOVE any cut that admits echo at 0.022.
    // ⚠️ They decline for reasons that are not an absent slope — one is a tunnel network measured in
    // depth, the other lays its sites on the tradition's figure. So availability is not usage, and the
    // gate asserts only what the cut is actually for: it must never block a placement she MADE.
    check("SNG-404: the relief cut never blocks a slope placement Aevi actually made",
      usedUphill.length >= 4 && usedUphill.every((id) => reliefOf[id] >= LD.RELIEF_USABLE),
      `cut ${LD.RELIEF_USABLE}; used uphill: ` + usedUphill.map((k) => k + " " + reliefOf[k]).join(", "));
    check("SNG-404: …and the one town she called NOISE stays below it",
      reliefOf.greywater_stilts < LD.RELIEF_USABLE, `greywater ${reliefOf.greywater_stilts}`);
    // ⛔ THE CORRECTED MODEL, GATED: a usable slope does NOT imply a slope placement. If this ever goes
    // green-by-emptiness — every town above the cut using uphill — the single-dial model would be back
    // and this gate is where that shows up.
    check("SNG-404: a usable slope does NOT imply a slope placement — the SITE selects the gradient, not the relief",
      noUphill.some((id) => reliefOf[id] >= LD.RELIEF_USABLE),
      "towns with a usable slope that place nothing on it: " + noUphill.filter((id) => reliefOf[id] >= LD.RELIEF_USABLE).join(", "));

    // ⛔ HER §4: A PLACEMENT THAT CANNOT CITE ITS SOURCE IS DECORATION. Never a bare position.
    const frame404 = { river: { bearing: 156, distanceDeg: 0.27 }, uphill: { bearing: 210, relief: 0.041 },
      roads: [{ to: "a", bearing: -88 }, { to: "b", bearing: 91 }] };
    const placed = LD.SITE_BASES.map((basis) => LD.placeSite({ basis, localMap: { bearing: 33, metres: 120 }, why: "from the seed" },
      frame404, { radiusMetres: 420, between: [{ bearing: 0, metres: 0 }, { bearing: 135, metres: 320 }],
        traditionFigure: { name: "Figurist", points: 3 } }));
    check("SNG-404: every placement the engine emits CITES its source — a bearing with no reason is decoration",
      placed.every((r) => r === null || (typeof r.why === "string" && r.why.length > 10)));

    // ⛔ AND IT REFUSES TO INVENT. The Kindlerow case is the whole argument: no water within 9°, and its
    // forge dug a cistern rather than pretend to a river. A generator that answers "water" on a dry
    // frame would have produced a dock in a town whose fiction is that it has none.
    const dry = { river: null, uphill: null, roads: [{ to: "x", bearing: 10 }] };
    check("SNG-404: …and on ground that has no river and no slope it returns NOTHING rather than a plausible lie",
      LD.placeSite({ basis: "river" }, dry, {}) === null && LD.placeSite({ basis: "uphill" }, dry, {}) === null);

    // ⛔ EVERY BASIS SHE AUTHORS MUST BE ONE THE ENGINE CAN PLACE. Her vocabulary is the one with 38
    // worked examples behind it, so it is the contract; mine was six invented words and two of hers had
    // no branch at all (`anti-uphill`, `between`). If she coins a new basis this names it rather than
    // letting the engine quietly drop those sites.
    const authoredBases = [...new Set(ids404.flatMap((id) => (layouts[id].sites || []).map((x) => x.basis).filter(Boolean)))];
    const unplaceable = authoredBases.filter((b) => !LD.SITE_BASES.includes(b));
    check("SNG-404: every `basis` in the corpus is one the engine can place — her vocabulary is the contract",
      unplaceable.length === 0, "no branch for: " + unplaceable.join(", "));

    // ⚠️ THE FIGURE WORKS IS THE INDEPENDENT CHECK: she authored it at 0 / 120 / 240 because a figure has
    // points, not because the ground said anything. The engine reaches the same three bearings from the
    // tradition branch alone, which is the corpus validating the generalisation rather than me asserting it.
    const fig = [0, 1, 2].map((i) => LD.placeSite({ basis: "tradition" }, dry, { traditionFigure: { name: "Figurist", points: 3 }, index: i }).bearing);
    const authored = (layouts.the_figure_works.sites || []).map((x) => x.localMap.bearing);
    check("SNG-404: the tradition branch reproduces the Figure Works' authored layout — 0/120/240 from the figure alone",
      fig.every((b) => authored.some((a) => Math.abs(((a - b + 540) % 360) - 180) < 1)),
      `engine ${fig.join("/")} vs authored ${authored.join("/")}`);

    // metres are the unit her schema specifies, so the conversion is worth holding exactly
    const wp404 = { colatitude: 24, longitude: -155, depth: 0 };
    const east = LD.localToWorld(wp404, { bearing: 90, metres: 300 });
    const km = LD.degBetween([wp404.colatitude - 90, wp404.longitude], [east.colatitude - 90, east.longitude]) * 111.32;
    check("SNG-404: 300 metres on a bearing lands 300 metres away — the local frame converts in METRES, as specced",
      Math.abs(km - 0.3) < 0.01, `${km.toFixed(3)} km`);
    // ⚠️ LEVEL IS THE SERVICE WAYS' WHOLE POINT: the Cogitarium's two rooms share a footprint and only
    // depth tells them apart, so it must survive the conversion rather than be flattened into it.
    const down = LD.localToWorld(wp404, { bearing: 0, metres: 200, level: -4 });
    check("SNG-404: …and `level` survives the conversion — two rooms of one building are not the same place",
      down.depth === -4);
  }

  console.log(`note  SNG-391: hydrology — ${built.hydrology.rivers.length} rivers, ${built.hydrology.lakes.length} lakes, ${built.hydrology.marsh.length} marshes; authored water ${built.authoredWaterPresent ? "APPLIED" : "⚠️ ABSENT (waterauth.json not yet in the repo — derived hydrology only)"}`);
}

// (3c-viii) SNG-183 L4 for RULES FILES — Erik: "registered-but-unloaded should not pass, and that gap
// is what found this." A rules file registered in the manifest that the LOADER never reads is dead
// exactly as an uncalled function is (power_sources was such a file until the audit above read it).
// A file's OWN `kind` is the signal: design/reference kinds (design_canon, world_structure, …) are
// meant to be unloaded; `kind: "rules"` claims to be operational and MUST have a consumer — the
// loader, or a CI check. Ratcheted so an existing authoring-reference (quest_structure) is named
// rather than reclassified by me, and a NEW unloaded operational rules file fails the build.
{
  const man = rj("content/packs/core/manifest.json");
  const rules = (man.provides && man.provides.rules) || [];
  const state = readFileSync(join(root, "engine/state.js"), "utf8");
  const loaderNames = [...state.matchAll(/(?:loadRule|rulePath)\(\s*["']([^"']+)["']/g)].map(m => m[1]);
  // what the test corpus reads by filename (this file included — it makes power_sources non-orphan)
  const testCorpus = readdirSync(join(root, "tests")).filter(f => /\.(mjs|js)$/.test(f)).map(f => readFileSync(join(root, "tests", f), "utf8")).join("\n");
  const loaded = (r) => loaderNames.some(n => r.includes(n));
  const ciRead = (r) => testCorpus.includes(r.split("/").pop());
  const orphanOperational = [];
  for (const r of rules) {
    let doc; try { doc = rj(`content/packs/core/${r}`); } catch { continue; }
    if (doc.kind !== "rules") continue;                       // reference/design kinds are meant to be unloaded
    if (loaded(r) || ciRead(r)) continue;                     // has a real consumer
    orphanOperational.push(r.split("/").pop());
  }
  // ⛔ SNG-342 — A COUNT IS NOT A CLASSIFICATION. This was `KNOWN_ORPHAN_RULES = 1` and reported ONE
  // orphan while ten registered files went unfetched — because the loop above skips any file whose own
  // `kind` isn't "rules", and `kind` is free text the author typed. Nine files opted out of this gate by
  // declaring `emergence`, `world_structure`, `social_mechanic_spec`. Aevi: "reference doc and forgotten
  // wiring are indistinguishable from outside." They were indistinguishable from INSIDE too: the escape
  // hatch was a string with no controlled vocabulary behind it.
  //
  // Now every registered rules file the loader does not fetch must be NAMED in rules_classification.json
  // with a reason. Silence is no longer a passing answer, and a new file cannot opt out by inventing a kind.
  const CLASS = rj("content/packs/core/rules_classification.json");
  const declared = new Map();
  for (const [bucket, entries] of Object.entries(CLASS)) {
    if (bucket === "schemaVersion" || bucket === "id" || bucket === "note") continue;
    for (const [name, reason] of Object.entries(entries)) {
      if (name === "_note") continue;
      declared.set(name, { bucket, reason });
    }
  }
  const undeclared = [], thin = [];
  for (const r of rules) {
    const name = r.split("/").pop().replace(/\.json$/, "");
    if (loaded(r) || ciRead(r)) continue;                     // has a real consumer
    const d = declared.get(name);
    if (!d) { undeclared.push(name); continue; }
    if (typeof d.reason !== "string" || d.reason.length < 40) thin.push(name);
  }
  for (const u of undeclared) console.log(`      registered, unfetched, UNDECLARED: ${u}`);
  check("every registered rules file is fetched, or DECLARED with a reason (SNG-342)", undeclared.length === 0,
    `${undeclared.length} registered but read by nobody and named nowhere: ${undeclared.join(", ")} — wire it, or classify it in rules_classification.json`);
  check("…and each declaration carries a REASON, not just a name (SNG-342)", thin.length === 0,
    `${thin.join(", ")} declared with no substantive reason`);
  // The gaps stay LOUD. runtime_unwired is content with no consumer — a real debt, reported every run so
  // it cannot settle into the background the way these ten did.
  // ⛔ SNG-344 — `kind` IS A CLOSED VOCABULARY, because it was never merely descriptive. The orphan loop
  // above branches on it, so authoring an ACCURATE new word (`emergence`, `social_mechanic_spec`) silently
  // exempted that file from the check. Aevi: "a field I treated as a label was load-bearing for a gate, and
  // my accuracy in naming a thing is exactly what removed it from the check — in a content-driven engine
  // there is no such thing as a purely descriptive field." An unknown value now FAILS rather than exempts.
  {
    const VOCAB = new Set(Object.keys(CLASS.kind_vocabulary || {}).filter(k => k !== "_note"));
    const unknown = [];
    for (const r of rules) {
      let doc; try { doc = rj(`content/packs/core/${r}`); } catch { continue; }
      if (doc.kind && !VOCAB.has(doc.kind)) unknown.push(`${r.split("/").pop()} declares kind="${doc.kind}"`);
    }
    for (const u of unknown) console.log(`      unknown kind (a new word changes gate behaviour): ${u}`);
    check("`kind` is a CLOSED vocabulary — a new value fails rather than silently exempting (SNG-344)",
      VOCAB.size > 0 && unknown.length === 0,
      `${unknown.join(" · ")} — add it to kind_vocabulary in rules_classification.json with a one-line meaning`);
  }

  // ⛔ SNG-344d — THE CROSSWALK IS BIDIRECTIONAL, SO THE CHECK MUST BE. Aevi built pointers both ways
  // (braid.mechanicalRecipe → recipe.id, and recipe.braidKey → braid) and asserted ONE of them at write
  // time. Within ten minutes she renamed two recipes and the braid table went stale — she caught and fixed
  // that direction; the REVERSE link kept the pre-rename names (`the_counted_end.braidName` still said "The
  // Counted End" while the braid displayed "Pale Reckoning") because nothing looked that way. Same bug,
  // third occurrence, invisible only because the assertion had a direction.
  //
  // ⚠️ AND THESE RUN IN THE SUITE, not in the authoring tool. A write-time assertion protects the author
  // who runs it; it cannot protect the file from anyone else, and it does not re-run when the OTHER file
  // changes — which is precisely how a pointer between two files goes stale.
  {
    const braidFile = JSON.parse(readFileSync(join(root, "world/braid_recipes.json"), "utf8"));
    const braids = braidFile.recipes || {};
    const combo = rj("content/packs/core/rules/combination_recipes.json");
    const byId = new Map((combo.recipes || []).map(r => [r.id, r]));
    const sortPair = (a) => [...(a || [])].sort().join("+");

    const dangling = [], disagree = [], revDisagree = [], keyDisagree = [];
    for (const [key, b] of Object.entries(braids)) {
      if (!b.mechanicalRecipe) continue;
      const m = byId.get(b.mechanicalRecipe);
      if (!m) { dangling.push(`${key} → ${b.mechanicalRecipe}`); continue; }
      // forward: a braid displays its mechanical recipe's CURRENT name (Aevi's rule, now enforced here)
      if (b.name !== m.name) disagree.push(`${key}: braid says "${b.name}", mechanics say "${m.name}"`);
      // the pointer must also point at the recipe for the SAME PARTS — a name match is not a parts match
      if (sortPair(m.parts) !== sortPair(key.split("+"))) keyDisagree.push(`${key} → ${m.id} (parts ${sortPair(m.parts)})`);
    }
    for (const r of combo.recipes || []) {
      if (!r.braidKey) continue;
      const b = braids[r.braidKey];
      if (!b) { dangling.push(`${r.id} → braid ${r.braidKey}`); continue; }
      if (r.braidName !== b.name) revDisagree.push(`${r.id}.braidName="${r.braidName}" but braid displays "${b.name}"`);
    }
    for (const d of [...dangling, ...disagree, ...revDisagree, ...keyDisagree]) console.log(`      crosswalk: ${d}`);
    check("344d: every crosswalk pointer RESOLVES — neither file names a record the other lacks",
      dangling.length === 0, dangling.join(" · "));
    check("344d: a braid displays its mechanical recipe's CURRENT name (forward link agrees)",
      disagree.length === 0, disagree.join(" · "));
    check("344d: …and the recipe's braidName matches the braid — THE REVERSE LINK IS CHECKED TOO",
      revDisagree.length === 0, revDisagree.join(" · "));
    check("344d: a pointer links records for the SAME PARTS, not merely the same name",
      keyDisagree.length === 0, keyDisagree.join(" · "));

    // ⚠️ alsoKnownAs is a LIST. It was authored as a comma-joined STRING on three braids and absent on
    // four — so `.map()` throws, `.length` counts characters, and de-duplication (which Aevi's own fix
    // depends on) is not well-defined. A folk name containing a comma would silently split into two.
    const akaShape = [], akaSelf = [], dupNames = [];
    const seenName = new Map();
    for (const [key, b] of Object.entries(braids)) {
      if ("alsoKnownAs" in b && !Array.isArray(b.alsoKnownAs)) akaShape.push(`${key} (${typeof b.alsoKnownAs})`);
      if (Array.isArray(b.alsoKnownAs) && b.alsoKnownAs.includes(b.name)) akaSelf.push(`${key}: "${b.name}" is an alias of itself`);
      if (seenName.has(b.name)) dupNames.push(`"${b.name}" on ${seenName.get(b.name)} and ${key}`);
      seenName.set(b.name, key);
    }
    check("344d: alsoKnownAs is an ARRAY wherever present — never a comma-joined string",
      akaShape.length === 0, akaShape.join(" · "));
    check("344d: no name is listed as an alias of itself", akaSelf.length === 0, akaSelf.join(" · "));
    check("344d: no two braids share a display name", dupNames.length === 0, dupNames.join(" · "));

    // ⛔ RATCHET, NOT A GATE — the two duplicate mechanical names Aevi's assertion found are NOT hers and
    // which one keeps the name is Erik's content call. Recorded so it cannot GROW while he decides; a gate
    // would force me to resolve a question that is not mine.
    const names = new Map();
    for (const r of combo.recipes || []) { if (!r.name) continue; names.set(r.name, (names.get(r.name) || 0) + 1); }
    const dupMech = [...names].filter(([, n]) => n > 1).map(([k]) => k);
    const KNOWN_DUP_MECH = 2;   // "The Harbored Flame", "The Meaning-Engine" — awaiting Erik (SNG-344b)
    if (dupMech.length) console.log(`note  SNG-344b: ${dupMech.length} mechanical name(s) on two recipes each, awaiting Erik's call: ${dupMech.join(", ")}`);
    check("344d: duplicate mechanical names do not GROW past the pair awaiting Erik's call",
      dupMech.length <= KNOWN_DUP_MECH, `${dupMech.length} exceeds the ${KNOWN_DUP_MECH} recorded: ${dupMech.join(", ")}`);
  }

  const gaps = Object.keys(CLASS.runtime_unwired || {}).filter(k => k !== "_note");
  if (gaps.length) console.log(`note  SNG-342: ${gaps.length} runtime file(s) authored but unconsumed (declared, not resolved): ${gaps.join(", ")}`);
  if (orphanOperational.length) console.log(`note  SNG-183 L4: operational-kind orphans: ${orphanOperational.join(", ")}`);
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

// ---------- SNG-238 §5b: the CONTENT-SHAPE SWEEP — catch "authored-but-under-shaped" content ----------
// The class (from the string-stages bug): content authored to a shape a CONSUMER can't fully render — a
// sub-field the consumer reads is absent or wrong-typed, so it renders empty/partial. It passes JSON validity
// and even schema `required`, but breaks at the read. This sweeps the class across ALL structured quests,
// driven by the REAL normalizer (structuredQuestRecord — the exact transform the game applies before the
// render reads) + the real consumer-read fields. Because it checks the NORMALIZED output, a field-name the
// normalizer bridges (content `name` → record `title`, outcome `text` → `summary` fallback) is NOT a false
// positive — only a field that reaches the render EMPTY is. Reports EVERY offender (§5b: completeness, not
// first-fail — the variant a one-quest patch misses). The consumer-required set is grown by incident, seam-
// ledger style; Aevi owns the authoritative list (§5d). Ties SNG-232 (a producer wrote a shape a consumer
// can't consume) generalized from one declared seam to a sweep.
{
  // consumer-read fields on the NORMALIZED quest record (verified from the render + engine reads, 2026-07-25)
  const REQ = { self: ["title"], stages: ["id", "objective", "condition"], outcomes: ["name", "summary"] };
  const S = v => typeof v === "string" && v.trim().length > 0;
  const questDefs = [];
  // every structured-quest source the loader concatenates (state.js: valley.provides.quests)
  const qMain = "content/packs/valley/quests.json";
  if (existsSync(join(root, qMain))) { const d = rj(qMain); for (const q of (Array.isArray(d) ? d : d.quests || [])) questDefs.push([qMain, q]); }
  const qDir = join(root, "content/packs/valley/quests");
  if (existsSync(qDir)) for (const f of readdirSync(qDir).filter(x => x.endsWith(".json"))) { const d = rj(`content/packs/valley/quests/${f}`); for (const q of (Array.isArray(d) ? d : d.quests || (d && d.id ? [d] : []))) questDefs.push([`quests/${f}`, q]); }
  let swept = 0;
  for (const [src, def] of questDefs) {
    if (!def || (!def.stages && !def.outcomes)) continue; // structured quests only (flat GM quests have no stages)
    swept++;
    let rec; try { rec = structuredQuestRecord(def); } catch (e) { check(`[shape] quest "${def.id}" (${src}) normalizes without throwing`, false, String(e.message)); continue; }
    const bad = [];
    for (const f of REQ.self) if (!S(rec[f])) bad.push(`quest.${f}`);
    (rec.stages || []).forEach((s, i) => { for (const f of REQ.stages) if (!S(s[f])) bad.push(`stage[${i}].${f}${typeof def.stages?.[i] === "string" ? " (STRING stage — must be an object)" : ""}`); });
    (rec.outcomes || []).forEach((o, i) => { for (const f of REQ.outcomes) if (!S(o[f])) bad.push(`outcome[${i}].${f}`); });
    check(`[shape] quest "${def.id}" renders fully — every consumer-read field survives normalization`, bad.length === 0,
      `${src}: renders empty at ${bad.join(", ")} — the SNG-238 §5b "authored-but-under-shaped" class; the field a consumer reads must be authored (or normalizer-derived)`);
  }
  ok(`SNG-238 §5b: content-shape sweep — ${swept} structured quests checked against consumer-read fields (title / stage id+objective+condition / outcome name+summary)`);

  // --- SNG-238 §5b (all content types), DRIVEN BY Aevi's consumer-required-subfield map (§5d) ---
  // CCODE-55 (SNG-250 §4): the map was PROMOTED out of po/staged_content into
  // content/packs/core/rules/consumer_required_subfields.json and registered in the core manifest, so it is
  // ONE source for both halves of the contract — this CI sweep over AUTHORED content, and the birth gate over
  // GENERATED content in the browser. While it lived under po/ only this half could reach it (the browser
  // cannot fetch po/), which is why SNG-250's "the consumer map is the source of truth" had no runtime teeth.
  // npc/location/creature load
  // close to raw, so check raw fields. CRASH (a consumer THROWS on absence) FAILS the build; EMPTY/DEGRADED
  // WARN for these types until the map is reconciled with runtime (the map lists location.description but the
  // field is `descriptionSeed`; dangerLevel is runtime-floored per SNG-225) — probe-verified every CRASH field
  // is present today, so this adds real protection without red-gating. Quests above use the NORMALIZER (it
  // bridges name→title, text→summary, and drops stage.title), so their check is the normalized-output one, not
  // the map's raw quest fields. The map grows by incident; the sweep picks up new fields automatically.
  {
    // CCODE-55: the map is now REGISTERED content, so its absence is a build failure, not a silent skip.
    // A missing map used to disable this whole sweep with a green run (the SNG-064 class: unlisted content
    // silently does not exist). It must also be reachable the way the ENGINE reaches it — through the core
    // manifest's provides.rules — or the browser half loads nothing while CI stays green.
    const MAP_PATH = "content/packs/core/rules/consumer_required_subfields.json";
    check("CCODE-55: the consumer map is promoted to registered content (one source for CI + generation)",
      existsSync(join(root, MAP_PATH)), `${MAP_PATH} is missing — the born-whole contract has no source`);
    check("CCODE-55: the consumer map is registered in the core manifest provides.rules (state.js loadRule finds it)",
      (rj("content/packs/core/manifest.json").provides?.rules || []).some(r => r.includes("consumer_required_subfields")),
      "unregistered = the engine never fetches it (SNG-064: the manifest is a WHITELIST), so the generation half of the gate is dead while this sweep stays green");
    const mapDoc = existsSync(join(root, MAP_PATH)) ? rj(MAP_PATH) : null;
    const CT = mapDoc?.contentTypes || {};
    const warnShape = m => console.log("warn  " + m);
    const has = v => v != null && !(typeof v === "string" && !v.trim()) && !(Array.isArray(v) && !v.length);
    const loadDir = (dir, key, keep) => { const out = []; const abs = join(root, dir); if (!existsSync(abs)) return out; for (const f of readdirSync(abs).filter(x => x.endsWith(".json"))) { const d = rj(`${dir}/${f}`); const arr = Array.isArray(d) ? d : (d[key] || (d && d.id ? [d] : [])); for (const x of arr) if (keep(x)) out.push(x); } return out; };
    // CCODE-55 (SNG-250 §4): this sweep now runs THE SAME FUNCTION the generation path runs —
    // engine/borncontract.js checkBorn — over authored content. SNG-250 §4 requires "authored and
    // generated content held to the same completeness bar", and that is only true if it is literally
    // one function; two implementations of one contract drift (the CCODE-16 lesson). The severity
    // policy is unchanged and still the map's own: CRASH fails the build, EMPTY/DEGRADED warn. What
    // is NEW is the `concrete` half — a record can carry every field and still be hollow, which
    // presence-checking alone can never catch.
    // Built EXACTLY as functions.js:20-24 builds its index: an ability's `functions` holds VERBS, and the
    // 8 families are what those verbs resolve TO. Comparing verbs against family names would fail all 285.
    const VOCABS = { "function_vocabulary.verbs": Object.values(rj("content/packs/core/rules/function_vocabulary.json").families || {})
      .flatMap(l => (Array.isArray(l) ? l : []).map(v => (typeof v === "string" ? v : v?.verb))).filter(Boolean) };
    const sweepType = (label, items, spec) => {
      if (!spec || !items.length) return;
      let crashBad = 0, softBad = 0;
      for (const it of items) {
        const rep = checkBorn(it, label, mapDoc, { vocabs: VOCABS });
        for (const m of rep.missing) {
          if (m.severity === "CRASH") { check(`[shape:${label}] "${it.id || "?"}" has CRASH-required "${m.field}"`, false, `${m.read || ""} — a consumer THROWS on its absence (SNG-238 §5b, map-driven)`); crashBad++; }
          else { softBad++; if (softBad <= 3) warnShape(`[shape:${label}] "${it.id || "?"}" missing ${m.severity} "${m.field}" — ${m.note || m.read || "hollow"} (warn: map field may need runtime reconcile)`); }
        }
        for (const v of rep.vague) {
          if (v.severity === "CRASH") { check(`[shape:${label}] "${it.id || "?"}" is CONCRETE at "${v.id}"`, false, `${v.why} (SNG-250 §3 concreteness, map-driven)`); crashBad++; }
          else { softBad++; if (softBad <= 3) warnShape(`[shape:${label}] "${it.id || "?"}" not concrete: ${v.id} — ${v.why}`); }
        }
      }
      ok(`SNG-238 §5b / SNG-250 §3: ${label} sweep vs consumer map — ${items.length} checked (${crashBad} CRASH-fail, ${softBad} EMPTY/DEGRADED warn)`);
    };
    sweepType("npc", loadDir("content/packs/valley/npcs", "npcs", n => n && n.id && !n.challengers && !Array.isArray(n.pool)), CT.npc);
    sweepType("location", loadDir("content/packs/valley/locations", "locations", l => l && l.id), CT.location);
    sweepType("creature", (mapDoc && existsSync(join(root, "content/packs/valley/bestiary.json"))) ? (rj("content/packs/valley/bestiary.json").roster || []) : [], CT.creature);
    // CCODE-55: the two types SNG-250 §3 added. Items fold core + valley exactly as state.js:136/139 does
    // (valley OVERLAYS core by id), so the sweep sees the same catalog the engine serves.
    const itemCatalog = {};
    for (const p of (rj("content/packs/core/manifest.json").provides?.items || [])) for (const it of (rj(`content/packs/core/${p}`).items || [])) if (it?.id) itemCatalog[it.id] = it;
    for (const p of (rj("content/packs/valley/manifest.json").provides?.items || [])) { const f = join(root, `content/packs/valley/${p}`); if (existsSync(f)) for (const it of (rj(`content/packs/valley/${p}`).items || [])) if (it?.id) itemCatalog[it.id] = it; }
    sweepType("item", Object.values(itemCatalog), CT.item);
    const abilityCatalog = [];
    for (const p of (rj("content/packs/core/manifest.json").provides?.abilities || [])) for (const a of (rj(`content/packs/core/${p}`).abilities || [])) if (a?.id) abilityCatalog.push(a);
    sweepType("skill", abilityCatalog, CT.skill);
    // CCODE-55/Aevi: arc is a LIVE generator; SNG-250 §3 now gives it a contract, so it must be swept too
    // (else the "declared but never swept" guard trips). The arcs corpus is the greater-arcs file, which is
    // also the few-shot the arc generator imitates — so sweeping it holds generation to the contract one
    // step upstream. (Aevi and I each added this sweep concurrently; hers is kept, the duplicate removed.)
    sweepType("arc", (existsSync(join(root, "content/packs/valley/lore/greater_arcs.json")) ? (rj("content/packs/valley/lore/greater_arcs.json").arcs || []) : []), CT.arc);

    // CCODE-55 (SNG-250 §3): a companion's `bondGrants` becomes a REAL ABILITY through sanitizeNewAbility,
    // so it is a generated skill and answers to the skill contract. sanitizeNewAbility defaults levelReq /
    // energyCost / notFor, but it can only pass through `functions` the content supplies — so that one field
    // is the whole gap, and it is checked directly rather than by sweeping partial defs against every field.
    // Warn, not fail: the engine half (CCODE-55) had never read `functions` off a bondGrant until now, so
    // the content was authored against a contract that did not yet exist. Aevi assigns the verbs.
    {
      const grants = [];
      for (const p of (rj("content/packs/valley/manifest.json").provides?.companions || [])) {
        const d = rj(`content/packs/valley/${p}`); const g = d.bondGrants || d.companion?.bondGrants;
        if (g) grants.push([p.split("/").pop(), g]);
      }
      const hollow = grants.filter(([, g]) => !Array.isArray(g.functions) || !g.functions.length);
      if (hollow.length) warnShape(`[shape:skill] ${hollow.length}/${grants.length} companion bondGrants have no "functions" — the granted ability engages NO family (invisible to functionCoverage/recommendSkills/wield): ${hollow.map(([f, g]) => `${f}:${g.name}`).join(", ")}`);
      ok(`SNG-250 §3: companion bondGrants checked for a resolvable function family — ${grants.length} grants (${hollow.length} hollow)`);
    }

    // ORPHANED CONTENT, one level down (SNG-253/254, twice in two days). A rules file can have a nested block
    // the engine reads (`skill_battle_system.engine.*`) and content authored to the SAME key at the TOP level,
    // where nothing looks. It passes every existing check — the file loads, the JSON is valid, the content is
    // right there — and the feature is dead. Aevi hit it with the SNG-254 matchup edges (caught and fixed) and
    // again with the SNG-253 kind archetypes (found by the tradition matrix showing standoff opponents still
    // striking). A key that appears BOTH at the top level and inside the block the engine reads is the
    // signature, and it is cheap to detect.
    {
      // Documentary keys are EXPECTED at both levels — a doc has a `note` and so does its engine block, and
      // that is annotation, not orphaned content. Only keys that carry DATA can be dead.
      const ANNOTATION = new Set(["note", "_notes", "schemaVersion", "id", "kind", "redesignNote", "whenItTriggers"]);
      const sbsDoc = rj("content/packs/core/rules/skill_battle_system.json");
      const inner = Object.keys(sbsDoc.engine || {});
      const shadowed = Object.keys(sbsDoc).filter(k => k !== "engine" && !ANNOTATION.has(k) && inner.includes(k));
      check("CCODE-55: no rules key is ORPHANED at the top level while the engine reads it under .engine",
        shadowed.length === 0,
        `${shadowed.join(", ")} exists BOTH at the top level and inside .engine — the engine reads .engine, so the top-level copy is dead content that looks authored`);
    }

    // CCODE-55 (the SNG-064 lesson, applied to the LOADER): a core rules file can be manifest-registered and
    // read by NOTHING — it passes every existing check (the file exists, it is whitelisted) and is still dead
    // content. It happened twice in one day: encounter_move_hints/encounter_ribbon_copy, and Aevi's
    // earned_power_guidance, which was registered and would have clamped grants by the numbers while its whole
    // voice layer never reached the GM. Every registered rule must be named in a state.js loadRule call.
    {
      // A RATCHET, not a wall. 12 rules files were already registered-but-unloaded when this check was
      // written — several read like DESIGN references (challenge_design, gambit_design, skill_utility_audit)
      // that may not belong in provides.rules at all, and that is Aevi's call to make, not a build failure to
      // impose. So the existing set is baselined and warned; anything NEW fails. The list may only go DOWN.
      // ⛔ SNG-356a — TWO GATES WERE ASKING ONE QUESTION AND KEEPING SEPARATE ANSWERS. This hand-listed
      // set predates SNG-342's `rules_classification.json`, which was built to be THE place an unwired file
      // is named with a reason. When Aevi registered `sub_attribute_ladder`, declaring it there satisfied
      // one gate and left this one red on the same fact — and worse, the hand-list had gone STALE in the
      // other direction: it still names `martial_paths`, which SNG-345 wired hours ago.
      //
      // ⚠️ A BASELINE THAT MUST BE EDITED IN TWO PLACES DRIFTS IN ONE. Now derived: everything the
      // declaration names as unwired, whatever bucket it sits in. One file to edit, one answer, and a file
      // that gets wired drops off both gates the moment it is reclassified.
      const CLASS55 = rj("content/packs/core/rules_classification.json");
      const KNOWN_UNLOADED = new Set(Object.entries(CLASS55)
        .filter(([k]) => !["schemaVersion", "id", "note", "kind_vocabulary"].includes(k))
        .flatMap(([, entries]) => Object.keys(entries).filter(n => n !== "_note")));
      const stateSrc = readFileSync(join(root, "engine/state.js"), "utf8");
      // Matched the way `rulePath` ACTUALLY resolves — by SUBSTRING, not exact stem. `loadRule("emergence")`
      // loads `rules/emergence_recipes.json`, and an exact-stem check called that file dead when it is loaded
      // every boot. The check has to mirror the loader it is auditing, or it invents gaps.
      const loadRuleNames = [...stateSrc.matchAll(/loadRule\("([^"]+)"/g)].map(m => m[1]);
      const unread = (rj("content/packs/core/manifest.json").provides?.rules || [])
        .map(p => p.replace(/^rules\//, "").replace(/\.json$/, ""))
        // resolution is the fatal base rules (fetched by path, not loadRule); the rest resolve through rulePath
        .filter(stem => stem !== "resolution" && !loadRuleNames.some(n => stem.includes(n)));
      const fresh = unread.filter(s => !KNOWN_UNLOADED.has(s));
      const fixed = [...KNOWN_UNLOADED].filter(s => !unread.includes(s));
      // Aevi ruled on these (manifest `_notes.rulesDeregistered`): they stay REGISTERED, because SNG-064 requires
      // any file on disk in rules/ to be whitelisted — deregistering in place would make them on-disk-but-not-
      // whitelisted, which is worse. Her follow-on (her call, not this ticket) is to move the pure design docs
      // out of rules/ entirely. ONE correction to her note: it says the data files "load via dedicated modules
      // (recipes.js etc)" — they do not. Nothing in engine/ or app.js reads power_sources, combination_recipes,
      // martial_paths, cross_axis_modifiers or pole_signatures at all; the only two that LOOK referenced
      // (peoples_of_kind in affiliation.js, quest_structure in quests.js) are mentioned in COMMENTS, not fetched.
      // That does not change her ruling — they still stay registered — but the reason is "unused", not "loaded
      // elsewhere", and the distinction matters if anyone later wonders whether they can be deleted.
      if (unread.length) warnShape(`[loader] ${unread.length} registered core rule(s) are loaded by NOTHING (baselined, Aevi-ruled): ${unread.join(", ")}`);
      check("CCODE-55: no NEWLY registered core rule is left unloaded (registered ≠ read)",
        fresh.length === 0, `registered but never loaded: ${fresh.join(", ")} — the file exists, is whitelisted, and reaches nothing (earned_power_guidance was exactly this: the numbers would clamp while its whole voice layer never reached the GM)`);
      if (fixed.length) ok(`CCODE-55: ${fixed.length} previously-unloaded rule(s) now reach the engine — shrink KNOWN_UNLOADED: ${fixed.join(", ")}`);
    }

    // CCODE-55 (the SNG-064 lesson, applied to the contract itself): a type can be DECLARED in the map and
    // never actually swept — the contract would read as enforced while nothing checked it. Every contracted
    // type must be wired to a real corpus here, or this fails and names the one that isn't.
    const SWEPT = new Set(["quest", "npc", "location", "creature", "item", "skill", "arc"]);
    const unswept = contractedTypes(mapDoc).filter(t => !SWEPT.has(t));
    check("CCODE-55: every type declared in the consumer map is actually SWEPT by this CI (no declared-but-unchecked contract)",
      unswept.length === 0, `declared but never swept: ${unswept.join(", ")} — add its corpus to the sweep or the contract is decorative`);
  }

  // SNG-238 §5c (the "never again" proof, anti-theater — the SNG-232 discipline): the sweep must BITE, or a
  // green run above proves nothing. Construct a def WITH the class (a STRING stage + a bare outcome) and confirm
  // it's flagged; a well-shaped def passes clean. NOTE (spec_boundary): there is NO quest GENERATOR today — the
  // generator makes only npc/location/arc (engine/state.js genSchemas) — so §5c's "born-whole for generated
  // quests / add image to the quest gen template" has no target yet. When a quest generator lands, its `required`
  // set MUST be these consumer-read fields (the same contract this sweep enforces on authored content). Flagged.
  {
    const issuesOf = def => { const r = structuredQuestRecord(def); const bad = [];
      if (!S(r.title)) bad.push("title");
      (r.stages || []).forEach(s => { for (const f of REQ.stages) if (!S(s[f])) bad.push(`stage.${f}`); });
      (r.outcomes || []).forEach(o => { for (const f of REQ.outcomes) if (!S(o[f])) bad.push(`outcome.${f}`); });
      return bad; };
    const badDef = { id: "selftest-bad", name: "Self-test", stages: ["go to the tree and look"], outcomes: [{ id: "unnamed" }] }; // STRING stage + summary-less outcome = the class
    const goodDef = { id: "selftest-good", name: "Self-test", stages: [{ id: "s1", objective: "Go to the tree-line", condition: "you reach the tree-line" }], outcomes: [{ id: "done", name: "Done", summary: "It ends." }] };
    check("SNG-238 §5c: the shape sweep BITES — a string-stage / summary-less quest IS flagged (anti-theater)", issuesOf(badDef).length > 0, "the sweep missed a known-bad def — it would pass broken content, proving nothing");
    check("SNG-238 §5c: a well-shaped quest passes the sweep clean (no false-flag)", issuesOf(goodDef).length === 0, "the sweep false-flagged a valid quest: " + issuesOf(goodDef).join(", "));
  }
}


// ---------- SNG-261 §B: INNATE-ACCESS REACHABILITY (Aevi's guard) ----------
// The precursor system was fully designed, fully wired, and never once fired. The cause was not a broken
// mechanism: `backgrounds.precursor_marked` has named `address_sense` since the day it was authored, Loki has
// carried that background the whole time, and `seedInnateSubstrate` was only ever CALLED with an ORIGIN
// record. The key was unreachable, so the door never opened for anyone.
//
// Aevi's ask, verbatim: "(a) baseline that every innate-access id exists with matching powerSystem,
// (b) REACHABILITY - a record carrying an innate-access key must be reachable by a seeder call for that
// record type; (b) would have caught precursor the day it was authored."
{
  const ACCESS_KEYS = { innatePrecursor: "precursor", innateLivingCurrent: "living_current", wildCurrent: "wild_current" };
  // Which resolver the app must pass for each rules file that can carry an innate-access key. A NEW record
  // type carrying one must be added here AND passed to the seeder - that pairing IS the guard.
  const SEEDED_FROM = { "origins.json": "originRecord", "backgrounds.json": "backgroundById" };
  const catalog = {};
  for (const f of readdirSync(join(root, "content/packs/core/abilities")).filter(x => x.endsWith(".json"))) {
    const pk = rj(`content/packs/core/abilities/${f}`);
    for (const a of (pk.abilities || [])) catalog[a.id] = { ...a, powerSystem: a.powerSystem || pk.powerSystem };
  }
  const appSrc = readFileSync(join(root, "app.js"), "utf8");
  const seedCalls = appSrc.match(/seedInnateSubstrate\([\s\S]*?\);/g) || [];

  const carriers = [];
  for (const f of readdirSync(join(root, "content/packs/core/rules")).filter(x => x.endsWith(".json"))) {
    let doc; try { doc = rj(`content/packs/core/rules/${f}`); } catch { continue; }
    const walk = (node, id) => {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) { for (const v of node) walk(v, (v && v.id) || id); return; }
      for (const k of Object.keys(ACCESS_KEYS)) if (Array.isArray(node[k]) && node[k].length) carriers.push({ file: f, recordId: node.id || id || "(unnamed)", key: k, ids: node[k] });
      for (const v of Object.values(node)) if (v && typeof v === "object") walk(v, node.id || id);
    };
    walk(doc, null);
  }

  const badIds = carriers.flatMap(c => c.ids
    .filter(id => (catalog[id] || {}).powerSystem !== ACCESS_KEYS[c.key])
    .map(id => `${c.file}:${c.recordId}.${c.key} -> ${id} (${catalog[id] ? "powerSystem " + catalog[id].powerSystem : "no such ability"})`));
  check("SNG-261 B(a): every innate-access id exists with the matching powerSystem", badIds.length === 0, badIds.join("; "));

  const unreachable = [...new Set(carriers.map(c => c.file))].filter(file => {
    const resolver = SEEDED_FROM[file];
    return !resolver || !seedCalls.some(call => call.includes(resolver));
  });
  check("SNG-261 B(b): every record type carrying an innate-access key is REACHABLE by a seeder call",
    unreachable.length === 0,
    `${unreachable.join(", ")} carries innate access that NO seedInnateSubstrate call can read - the precursor class: authored, valid, unreachable`);

  const stripped = seedCalls.map(c => c.split("backgroundById").join("xx"));
  const wouldCatch = [...new Set(carriers.map(c => c.file))].some(file =>
    SEEDED_FROM[file] && !stripped.some(call => call.includes(SEEDED_FROM[file])));
  check("SNG-261 B(b): the reachability guard can FAIL (remove the background resolver and it fires)",
    wouldCatch, "the guard cannot detect an unreachable carrier - it would pass the very bug it exists for");
}


// ---------- SNG-263 §5: THE CRAFT-MECHANICS COMPLETENESS HARNESS ----------
// Erik: "every function described needs a matching game mechanic that can be verified." The measured start
// state: 285 crafts, 24 verbs, and only strike/break did anything - heal on 31 crafts healed nothing, ward on
// 23 warded nothing, reveal on 114 did nothing. Two different questions, and they need different gates:
//
//   (1) SHAPE COVERAGE - does every verb the catalog uses resolve to an implemented effect-shape? This is
//       ABSOLUTE. A verb with no shape is a craft that describes a capability the engine cannot perform, and
//       that is the bug this ticket exists to end. It must be zero, today and forever.
//   (2) AUTHORED MAGNITUDES - how many crafts still inherit their family's defaults instead of declaring
//       their own numbers? This is a RATCHET, because the answer today is "all 285" by design: the fallback
//       chain is what lets Aevi author the catalog tradition by tradition instead of in one pass. It may
//       only go DOWN, so the catalog can fill in and can never drift back.
{
  const cm = rj("content/packs/core/rules/craft_mechanics.json");
  const crafts = [];
  for (const f of readdirSync(join(root, "content/packs/core/abilities")).filter(x => x.endsWith(".json"))) {
    const pk = rj(`content/packs/core/abilities/${f}`);
    for (const a of (pk.abilities || [])) crafts.push({ ...a, powerSystem: a.powerSystem || pk.powerSystem });
  }
  const shaped = new Set();
  for (const fam of Object.values(cm.families || {})) for (const v of (fam.verbs || [])) shaped.add(v);
  for (const v of Object.keys(cm.verbOverrides || {})) shaped.add(v);

  const used = new Set();
  for (const c of crafts) for (const v of (c.functions || [])) used.add(v);
  const orphanVerbs = [...used].filter(v => !shaped.has(v));
  check("SNG-263 §1: every verb the catalog uses resolves to an implemented effect-shape (no craft describes what the engine cannot do)",
    orphanVerbs.length === 0, `unmechanised verbs: ${orphanVerbs.join(", ")}`);

  // every shape named by a family must have defaults, or the fallback chain has a hole
  const shapes = new Set([...Object.values(cm.families || {}).map(f => f.shape),
                          ...Object.values(cm.verbOverrides || {}).map(o => o.shape)]);
  const shapesWithoutDefaults = [...shapes].filter(s => !cm.familyDefaults?.[s]);
  check("SNG-263 §2: every effect-shape has family defaults (an unauthored craft still resolves to real numbers)",
    shapesWithoutDefaults.length === 0, `shapes with no defaults: ${shapesWithoutDefaults.join(", ")}`);

  // the tier ladder must reach T-V and be monotonic - the catalog has 28 crafts at levelReq 4 and 26 at 5
  const ladder = cm.tierLadder || {};
  const mults = [1,2,3,4,5].map(t => Number(ladder[String(t)]?.mult));
  check("SNG-263 §8: the tier ladder reaches T-V and never steps down",
    mults.every(Number.isFinite) && mults.every((m, i) => i === 0 || m > mults[i-1]),
    `mults: ${mults.join(", ")}`);
  // SNG-263 r4: the DICE ladder is what damage/healing actually read, and Erik's ruler is specific about its
  // shape - T-II a clean double, T-III past linear. A ladder that satisfies `mult` but not this would look
  // right in the config and play wrong at the table.
  const dice = [1,2,3,4,5].map(t => ladder[String(t)]?.dice);
  check("SNG-263 r4 §8: the DICE ladder reaches T-V and its die count never steps down",
    dice.every(x => x && Number.isFinite(Number(x.nMult))) && dice.every((x, i) => i === 0 || Number(x.nMult) >= Number(dice[i-1].nMult)),
    `nMult: ${dice.map(x => x && x.nMult).join(", ")}`);
  {
    // mean of nDm+plus = n*(d+1)/2 + plus, so the ruler can be checked in closed form rather than simulated
    const base = cm.familyDefaults?.damage?.dice || { n: 1, d: 6 };
    const meanAt = t => { const dl = ladder[String(t)]?.dice || { nMult: 1, plus: 0 };
      return Number(base.n) * Number(dl.nMult) * (Number(base.d) + 1) / 2 + Number(dl.plus || 0); };
    const m1 = meanAt(1), m2 = meanAt(2), m3 = meanAt(3);
    check("SNG-263 r4 §8: T-II is about DOUBLE a T-I (Erik: 'twice the damage on its axis')",
      m2 >= m1 * 1.8 && m2 <= m1 * 2.2, `T-I mean ${m1}, T-II mean ${m2}`);
    check("SNG-263 r4 §8: T-III EXCEEDS linear (Erik: 'not linear — a real step up')",
      m3 > m1 * 3, `T-I ${m1}, T-III ${m3}, linear would be ${m1 * 3}`);
  }
  {
    // Erik's anchor, checked against the foe the engine actually synthesizes rather than a remembered 5
    const sbSyn = rj("content/packs/core/rules/skill_battle_system.json").engine?.opponentSheetSynthesis || {};
    const curve = (v, knee) => (v <= knee ? v : knee + Math.pow(v - knee, sbSyn.aboveKneeExponent ?? 0.75));
    const peerHealth = Math.max(sbSyn.healthFloor ?? 3,
      Math.round((sbSyn.healthBase ?? 4) + curve(22 * (sbSyn.threatToHealth ?? 0.09), sbSyn.healthKnee ?? 12)));
    const b = cm.familyDefaults?.damage?.dice || { n: 1, d: 6 };
    const maxT1 = Number(b.n) * Number(b.d) + Number(cm.familyDefaults?.damage?.plus || 0);
    // Erik's anchor was set when a riffraff had 5 health and damage ran on the old generic formula. Now that
    // health scales and damage is dice, the anchor and the TIER LADDER pull against each other: for a T-I max
    // to one-shot a peer, riffraff health must sit at or below that max — and at that health everything dies
    // in one or two rounds, which compresses T-III's advantage to ~1.2x and fails Aevi's first criterion.
    // REPORTED, not gated: it is a genuine design tension between two of Erik's own statements, and picking
    // one silently would be this file making a balance decision it has no business making.
    if (maxT1 >= peerHealth) {
      ok(`SNG-263 §7: a T-I strike's MAXIMUM can one-shot a peer riffraff (Erik's anchor) — max ${maxT1} vs ${peerHealth} health`);
    } else {
      console.log(`note  SNG-263 §7 TENSION — a T-I max is ${maxT1}; a peer riffraff now has ${peerHealth} health, so it cannot one-shot.`);
      console.log(`      Erik's anchor ("a T-I max can kill a T-I beast") was set at 5 health on the old flat formula. Holding it`);
      console.log(`      now means riffraff health <= ${maxT1}, and at that health T-III's advantage compresses to ~1.2x, failing`);
      console.log(`      Aevi's "T-III clearly better". The two cannot both hold at these dice. ERIK'S CALL — and both sides are`);
      console.log(`      live dials in the Machine tab (craft T-I dice/die size, foe health base/per-threat).`);
    }
  }
  {
    // Aevi's pilot corrected this check as much as it corrected the schema. The first version failed a craft
    // for declaring an axis outside a closed list — and her 12 crafts named 18 axes, ten of them ones I had
    // not imagined. The vocabulary is OPEN now, so the question is no longer "is this axis legal" but "if
    // this axis is one the ENGINE computes, does it carry a number?" A named axis with prose is correct
    // content, not a violation; a mechanical axis with no number is a promise the engine cannot keep.
    const mech = new Set(cm.operativeAxis?.mechanical || []);
    check("SNG-263 r4: the MECHANICAL axis subset is declared (the dimensions the engine can actually compute)",
      mech.size >= 5 && mech.has("damage") && mech.has("duration"),
      `mechanical axes: ${[...mech].join(", ")}`);
    const emptyMechanical = [];
    for (const c of crafts) {
      for (const [verb, m] of Object.entries(c.mechanic || {})) {
        const axes = Array.isArray(m?.axis) ? m.axis : (m?.axis ? [m.axis] : []);
        for (const a of axes) {
          if (!mech.has(a)) continue;                       // a named axis carries prose, and that is fine
          const val = m[a] ?? (a === "damage" || a === "healing" ? m.dice : undefined);
          if (val == null) emptyMechanical.push(`${c.id}.${verb}.${a}`);
        }
      }
    }
    check("SNG-263 r4: every MECHANICAL axis a craft claims carries a number the engine can act on",
      emptyMechanical.length === 0, `claimed but empty: ${emptyMechanical.slice(0, 8).join(", ")}`);
  }
  check("SNG-263 §8: T-IV and T-V are flagged SPECIAL (they buy a KIND of ability, not a bigger number)",
    ladder["4"]?.special === true && ladder["5"]?.special === true);

  const authoredCrafts = crafts.filter(c => c.mechanic && Object.keys(c.mechanic).length).length;
  const unauthored = crafts.length - authoredCrafts;
  console.log(`note  SNG-263 authoring progress: ${authoredCrafts}/${crafts.length} crafts declare their own mechanic (${unauthored} still inherit family defaults)`);
  // CCODE-104: Aevi finished the catalog. This ratchet opened at 285 — every craft in the game inheriting
  // its family defaults — and it is now ZERO. Tightened to 0 so the achievement is HELD: a craft added
  // without its own mechanics now fails the build instead of quietly restarting the climb.
  const CRAFTS_UNAUTHORED_BASELINE = 0;
  check(`SNG-263 §5 ratchet: crafts still inheriting family defaults = ${unauthored} (baseline ${CRAFTS_UNAUTHORED_BASELINE}) — may only go DOWN`,
    unauthored <= CRAFTS_UNAUTHORED_BASELINE,
    "a craft LOST its authored mechanic — the catalog may only fill in, never empty out");
}


// ---------- SNG-264: ContradictedByItsOwnTag (Aevi's class) ----------
// Aevi, naming it: "content that argues with its own mechanical field, a sibling to PromisedButUnread."
// PromisedButUnread is content nothing reads; this is content that reads FINE and disagrees with itself —
// the prose says one thing, the mechanical tag says another, and whichever the engine happens to consult
// wins silently.
//
// The rule is deliberately NARROW, because a sweep that flags correct content teaches people to ignore it
// (the SNG-250 lesson). It fires only on a BLANKET denial of the very harm the craft's own harmRung asserts:
//   · "cannot un-hurt" is an UNDO verb, not a denial — the_edge is not a contradiction;
//   · "cannot kill the healthy" is SCOPED — a lethal craft with a named exception is coherent (palework);
//   · harmRung `damaging` + "not lethal" is COHERENT — damaging is not lethal (sonic_resonance).
// Those three exclusions are why this reports one craft rather than five.
{
  const DENY = {
    lethal: /\b(?:not|never|cannot|can't|does not|doesn't)\s+(?:be\s+)?(?:lethal|kill|deadly|slay)\b/i,
    damaging: /\b(?:not|never|cannot|can't|does not|doesn't)\s+(?:be\s+)?(?:damag\w*|wound|harm|injure|hurt)\b/i,
  };
  const SCOPED = /\b(?:kill|harm|wound|damage|hurt)s?\s+(?:the|a|an)\s+\w+/i;
  const UNDO = /\bun-(?:hurt|wound|harm|kill|do)\b/i;
  const asText = v => Array.isArray(v) ? v.filter(x => typeof x === "string").join(" | ") : (typeof v === "string" ? v : "");
  const contradicted = [];
  for (const f of readdirSync(join(root, "content/packs/core/abilities")).filter(x => x.endsWith(".json"))) {
    for (const c of (rj(`content/packs/core/abilities/${f}`).abilities || [])) {
      const rx = DENY[c.harmRung];
      if (!rx) continue;
      const fields = [["notFor", asText(c.notFor)], ...((c.tree || []).map((t, i) => [`tree[${i}].cannot`, asText(t && t.cannot)]))];
      for (const [where, text] of fields) {
        if (!text) continue;
        const m = text.match(rx);
        if (!m) continue;
        const after = text.slice(m.index, m.index + 60);
        if (UNDO.test(after) || SCOPED.test(after)) continue;
        contradicted.push(`${c.id} (harmRung:${c.harmRung}, ${where})`);
        break;
      }
    }
  }
  if (contradicted.length) console.log(`note  SNG-264 ContradictedByItsOwnTag: ${contradicted.join(", ")}`);
  const CONTRADICTED_BASELINE = 1;   // `wither` — tagged damaging, its own notFor says it cannot wound a body
  check(`SNG-264: crafts whose text denies the harm their own harmRung asserts = ${contradicted.length} (baseline ${CONTRADICTED_BASELINE}) — may only go DOWN`,
    contradicted.length <= CONTRADICTED_BASELINE,
    `a craft now argues with its own harm tag — fix the tag or the prose, never leave them disagreeing: ${contradicted.join(", ")}`);
}

// ---------- CCODE-76: an authored `crit` block must actually REACH critFor ----------
// The new field is exactly the shape PromisedButUnread keeps arriving in: an author writes what their craft's
// disaster looks like, spells the key slightly differently, and the sentence is never seen again. So the check
// runs the REAL resolver rather than re-describing the schema — if critFor returns nothing for a craft that
// wrote a crit block, the field reached no reader, and that is a fact, not a preference.
{
  const orphaned = [], capped = [];
  const cap = rj("content/packs/core/rules/resolution.json").crit?.perCraftCap ?? 10;
  for (const f of readdirSync(join(root, "content/packs/core/abilities")).filter(x => x.endsWith(".json"))) {
    for (const c of (rj(`content/packs/core/abilities/${f}`).abilities || [])) {
      const src = c.mechanic?.crit || c.crit;
      if (!src) continue;
      const got = critFor(c, { cap });
      if (!got) { orphaned.push(c.id); continue; }
      for (const side of ["success", "failure"]) if (got[side]?.asked != null) capped.push(`${c.id}.${side} asked ${got[side].asked}, capped to ${got[side].chance}`);
    }
  }
  if (capped.length) console.log(`note  CCODE-76: ${capped.length} authored crit dial(s) clamped by rules.crit.perCraftCap=${cap} — ${capped.join("; ")}`);
  check(`CCODE-76: every authored craft \`crit\` block resolves through critFor (none is write-only)`,
    orphaned.length === 0,
    `these crafts authored a crit block the engine cannot read — check the key names (\`text\`/\`chance\` under \`success\`/\`failure\`): ${orphaned.join(", ")}`);
}

// ---------- CCODE-77: every family's OPERATIVE dimension must be a field its shape actually carries ----------
// PromisedButUnread one level up, inside the config itself. `families.KNOW.operative` was "setup" while
// `familyDefaults.setup` carries only {magnitude, duration} — so the tier ladder, which scales the OPERATIVE
// dimension and nothing else, scaled a field that did not exist. Every reveal/foresee/track craft in the
// catalog (the largest family) resolved a T-V identically to a T-I. Nothing threw, nothing warned; the
// pointer simply pointed nowhere.
//
// This is a GATE, not a report: "the dimension a craft grows on does not exist" is a fact, and no design
// intent can want it. WHICH dimension a family should grow on is Aevi's and Erik's — that it resolves is mine.
{
  const CM = rj("content/packs/core/rules/craft_mechanics.json");
  const carries = (shape, dim) => dim in shape || (!!shape.dice && (dim === "damage" || dim === "healing"));
  const dangling = [];
  for (const [fam, def] of Object.entries(CM.families || {})) {
    const shape = CM.familyDefaults?.[def.shape];
    if (!def.operative || !shape) continue;
    if (!carries(shape, def.operative)) dangling.push(`${fam}.operative="${def.operative}" but familyDefaults.${def.shape} carries {${Object.keys(shape).filter(k => !/^(note|operativeNote)$/.test(k)).join(", ")}}`);
  }
  for (const [verb, ov] of Object.entries(CM.verbOverrides || {})) {
    const shape = CM.familyDefaults?.[ov.shape];
    if (!ov.operative || !shape) continue;
    if (!carries(shape, ov.operative)) dangling.push(`verbOverrides.${verb}.operative="${ov.operative}" not in familyDefaults.${ov.shape}`);
  }
  check("CCODE-77: every family's operative dimension is a field its shape actually carries (else the tier ladder scales nothing)",
    dangling.length === 0, dangling.join(" · "));
}

// ---------- SNG-261 B: `opensAccess` must actually OPEN something ----------
// SNG-011 says precursor access is unlocked "only when the fiction earns it - a live remnant answers, a quest
// concludes, OLD ROADS MASTERY, a teacher". Every one of those routes ran through the GM emitting
// unlockPrecursor, and that op has never once fired. `opensAccess` is the deterministic route: master the
// craft whose own rank-3 text describes touching Precursor work and the door opens because you did the thing.
//
// The declaration is the exact PromisedButUnread shape again - name a craft that does not exist, or one of
// the wrong powerSystem, and openAccessFor correctly opens NOTHING, silently. So it is checked here, against
// the real catalog, by running the real function.
{
  const CAT = {};
  for (const f of readdirSync(join(root, "content/packs/core/abilities")).filter(x => x.endsWith(".json")))
    for (const a of (rj(`content/packs/core/abilities/${f}`).abilities || [])) CAT[a.id] = a;

  const declared = [], broken = [];
  for (const a of Object.values(CAT)) {
    for (const t of (a.tree || [])) {
      if (!t?.opensAccess) continue;
      const d = t.opensAccess;
      const ids = typeof d === "string" ? [] : (d.abilityIds || []);
      declared.push(`${a.id} r${t.rank} -> ${ids.join(",") || "(no abilityIds)"}`);
      if (!ids.length) { broken.push(`${a.id} r${t.rank}: opensAccess names no abilityIds, so it opens nothing`); continue; }
      for (const id of ids) {
        if (!CAT[id]) broken.push(`${a.id} r${t.rank}: names "${id}", which is not a craft in the catalog`);
        else if (CAT[id].powerSystem !== (typeof d === "string" ? d : d.system))
          broken.push(`${a.id} r${t.rank}: "${id}" is powerSystem ${CAT[id].powerSystem}, not ${typeof d === "string" ? d : d.system}`);
      }
      // and prove it end-to-end through the REAL function, on a fresh character
      const who = {};
      const opened = openAccessFor(who, a.id, t.rank, CAT);
      if (!opened.length) broken.push(`${a.id} r${t.rank}: openAccessFor opened NOTHING for a fresh character`);
    }
  }
  if (declared.length) console.log(`note  SNG-261 B: ${declared.length} mastery door(s) declared - ${declared.join(" | ")}`);
  check("SNG-261 B: every `opensAccess` declaration opens a real craft of the system it names",
    broken.length === 0, broken.join(" \u00b7 "));
  // The route existed on paper and had never fired. It must not silently go back to zero.
  check("SNG-261 B: the deterministic mastery route is WIRED (at least one craft opens a door)",
    declared.length > 0, "no craft declares opensAccess - precursor access is back to the GM op that has never fired");
}

// ---------- CCODE-83b: an AFFINITY must name a type something can actually PRODUCE ----------
// PromisedButUnread in one more shape: a creature was authored `physical: immune` while NOTHING in the
// catalog dealt a `physical` kind, so the immunity was unreachable and the fight it exists to shape would
// silently never happen. The fix was to make untyped harm physical; this GATE is what stops the next
// unreachable type shipping quietly.
{
  const CMx = rj("content/packs/core/rules/craft_mechanics.json");
  const SBE = rj("content/packs/core/rules/skill_battle_system.json").engine;
  const produced = new Set([
    ...Object.entries(CMx.damageTypeByTradition || {}).filter(([k]) => k !== "note").map(([, v]) => v),
    ...Object.entries(CMx.damageTypeByCraft || {}).filter(([k]) => k !== "note").map(([, v]) => v),
    ...(SBE.damageTypes?.untypedIs ? [SBE.damageTypes.untypedIs] : []),
  ].filter(v => typeof v === "string"));
  const legal = new Set(SBE.damageTypes?.affinities || []);
  const unreachable = [], illegal = [];
  for (const c of (rj("content/packs/valley/bestiary.json").roster || [])) {
    for (const [type, verdict] of Object.entries(c.affinity || {})) {
      if (!produced.has(type)) unreachable.push(`${c.id}.${type}`);
      if (!legal.has(verdict)) illegal.push(`${c.id}.${type}=${verdict}`);
    }
  }
  check("CCODE-83b: every authored affinity names a damage type something can PRODUCE (else it can never fire)",
    unreachable.length === 0, `nothing in the catalog deals these kinds: ${unreachable.join(", ")}`);
  check("CCODE-83b: every affinity verdict is one the engine implements",
    illegal.length === 0, illegal.join(", "));
}

console.log(failures === 0 ? "\nContent CI: all checks passed." : `\nContent CI: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
