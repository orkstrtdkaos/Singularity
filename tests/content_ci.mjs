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
      // Every pole tradition must HAVE a band — the umbral hole was "no band → neutral everywhere".
      if (!b || typeof b.center !== "number") { if (primary && primary !== "combination") noBand.push(t); continue; }
      if (KNOWN_DISAGREE.has(t)) continue;
      // natural works in thin ground (low centre); lattice needs dense (high centre). wild/combination
      // are mixed sources and deliberately unconstrained.
      if (primary === "natural" && b.center > 0.45) wrongSide.push(`${t} natural but centre ${b.center}`);
      if (primary === "lattice" && b.center < 0.55) wrongSide.push(`${t} lattice but centre ${b.center}`);
    }
    check("every power-classified tradition has a substrate band (no umbral-shaped hole)", noBand.length === 0,
      `${noBand.length} classified but band-less — neutral at every density: ${noBand.join(", ")}`);
    check("power classification and band centre agree (natural low, lattice high)", wrongSide.length === 0,
      `${wrongSide.length} disagree beyond the known threnodist/verist pair: ${wrongSide.join(" · ")}`);
    if (KNOWN_DISAGREE.size) console.log(`note  SNG-172: ${[...KNOWN_DISAGREE].join(", ")} are natural-classified but banded 0.50 — flagged, not changed (Erik's call)`);
  }
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
  const KNOWN_ORPHAN_RULES = 1;   // quest_structure.json — authoring guidance, not engine-consumed (Aevi's to reclassify)
  if (orphanOperational.length) console.log(`note  SNG-183 L4: ${orphanOperational.length} operational rules file(s) registered but read by neither loader nor CI: ${orphanOperational.join(", ")}`);
  check("no NEW operational rules file is registered-but-unread (SNG-183 L4)", orphanOperational.length <= KNOWN_ORPHAN_RULES,
    `${orphanOperational.length} exceeds the ${KNOWN_ORPHAN_RULES} recorded — wire it into the loader, give it a CI reader, or mark its kind as a design reference`);
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
      const KNOWN_UNLOADED = new Set(["challenge_design", "coliseum_grid", "combination_recipes", "cross_axis_modifiers",
        "gambit_design", "martial_paths", "peoples_of_kind", "pole_signatures", "power_sources",
        "quest_structure", "skill_utility_audit"]);
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
  check("SNG-263 §8: T-IV and T-V are flagged SPECIAL (they buy a KIND of ability, not a bigger number)",
    ladder["4"]?.special === true && ladder["5"]?.special === true);

  const authoredCrafts = crafts.filter(c => c.mechanic && Object.keys(c.mechanic).length).length;
  const unauthored = crafts.length - authoredCrafts;
  console.log(`note  SNG-263 authoring progress: ${authoredCrafts}/${crafts.length} crafts declare their own mechanic (${unauthored} still inherit family defaults)`);
  const CRAFTS_UNAUTHORED_BASELINE = 285;
  check(`SNG-263 §5 ratchet: crafts still inheriting family defaults = ${unauthored} (baseline ${CRAFTS_UNAUTHORED_BASELINE}) — may only go DOWN`,
    unauthored <= CRAFTS_UNAUTHORED_BASELINE,
    "a craft LOST its authored mechanic — the catalog may only fill in, never empty out");
}

console.log(failures === 0 ? "\nContent CI: all checks passed." : `\nContent CI: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
