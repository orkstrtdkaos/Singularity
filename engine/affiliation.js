// affiliation.js — SNG-185. ONE place that answers "what kind of being is this, and what do they
// practise," so the two mint paths can never disagree again.
//
// §5.1, answered: generate.js (SNG-177) stamped generated NPCs with domains + provenance; the GM
// meet-path in npcs.js stamped nothing. Two mints minting by different rules is how registry-only
// people ended up domainless while generated ones were affiliated. Both now call THIS. There is no
// second implementation to drift.
//
// ⛔ ERIK'S RULING (SNG-174) IS THE STRUCTURE: kind is what you ARE, domains are what you PRACTISE,
// and they are matched against SEPARATE vocabularies and NEVER against each other. A role naming a
// PEOPLE ("the ancient Ent") is not a tradition — a naive matcher that treats every capitalised word
// as a craft mis-assigns every Ent, dwarf and seraph, which is the exact Crossing-Ent case that
// started this. `readPeople` matches the people vocabulary; `readDomains` matches the tradition
// vocabulary; they share no code path.

import { normName } from "./namematch.js";

// whole word only — "wright" must not match "playwright", "mason" must not match "stonemason".
const wholeWord = (needle, hay) => needle.length > 2 && new RegExp(`(^| )${needle.replace(/\s+/g, " ")}( |$)`).test(hay);

/** The KIND a record explicitly names, from its own text. Read, never invented — an unnamed person
 *  stays peopleless (SNG-177 §2.4: kind is the one field that must stay absent rather than guessed).
 *  Reading "Ent" from a role that SAYS "Ent" is reading, not inventing; defaulting to "human" or
 *  inferring from where they were met is the inventing the rule forbids. `peopleVocab` is a Set of
 *  known people-words (already lowercased). */
export function readPeople(record, peopleVocab) {
  const explicit = record?.people && String(record.people).trim().toLowerCase();
  if (explicit) return { people: explicit, peopleSource: "generated" };   // the model stated it
  if (!(peopleVocab instanceof Set) || !peopleVocab.size) return {};
  const text = normName([record?.role, record?.name, record?.description].filter(Boolean).join(" "));
  for (const p of peopleVocab) if (wholeWord(p, text)) return { people: p, peopleSource: "role" };
  return {};
}

/** The DOMAINS a record practises, strongest evidence first — and the order is deliberate (§3):
 *    0. model-authored           → "generated"  (the model said so)
 *    1. the ROLE string          → "role"       (the tradition is written on them; a person is met
 *                                                 where the story put them, not where their craft lives)
 *    2. skillsObserved / learned → "observed"   (what they actually DID is what they practise)
 *    3. region home              → "derived"    (the weakest — matches generate.js's fallback,
 *                                                 credits at HALF weight per SNG-177)
 *  Matched ONLY against the tradition vocabulary, whole-word, and validated against the index, so a
 *  people-word can never be read as a craft and a common-English tradition id (`mason`, `wright`,
 *  `horizon`) can never false-match inside another word. */
export function readDomains(record, { traditionIndex = null, regionHome = null } = {}) {
  const byId = traditionIndex?.byId || null;
  const valid = t => !!t && (!byId || !!byId[t]);

  const raw = record?.domains;
  if (raw && typeof raw === "object") {
    const keep = {};
    for (const slot of ["primary", "secondary", "tertiary"]) {
      const v = raw[slot];
      if (Array.isArray(v)) { const ok = v.filter(valid); if (ok.length) keep[slot] = ok.length === 1 ? ok[0] : ok; }
      else if (valid(v)) keep[slot] = v;
    }
    if (keep.primary) return { domains: keep, domainsSource: "generated" };
  }
  if (!byId) return {};

  const traditions = Object.values(byId).filter(t => t?.traditionId);
  const matchIn = (text) => {
    const t = normName(text);
    if (!t) return null;
    for (const trad of traditions) {
      const tid = String(trad.traditionId).toLowerCase();
      const nm = String(trad.name || "").toLowerCase().replace(/^the\s+/, "").replace(/s$/, "");
      if (wholeWord(tid, t) || (nm.length > 3 && wholeWord(nm, t))) return trad.traditionId;
    }
    return null;
  };

  const fromRole = matchIn(record?.role);
  if (fromRole) return { domains: { primary: fromRole }, domainsSource: "role" };

  const observed = [...(record?.skillsObserved || []), ...(record?.learned || [])].join(" ");
  const fromObs = matchIn(observed);
  if (fromObs) return { domains: { primary: fromObs }, domainsSource: "observed" };

  if (valid(regionHome)) return { domains: { primary: regionHome }, domainsSource: "derived" };
  return {};
}

/** Full affiliation — people + domains, provenance on each. The single entry point both mint paths
 *  call. Returns only the fields the record can actually support; assigns nothing it cannot. */
export function affiliationOf(record, opts = {}) {
  return { ...readPeople(record, opts.peopleVocab), ...readDomains(record, opts) };
}

/** The home tradition of a region, for the domain fallback — the same map generate.js used. Pure. */
export function regionHomeTradition(regionId, traditionIndex, regions = null) {
  if (!regionId) return null;
  // ⛑ THE REGION'S OWN FIELD WINS, and it is read FIRST because the old map cannot express what Aevi
  // needs: `traditions[].region` names ONE region per tradition, so twelve foothills cannot each claim
  // one. A region naming its home tradition is many-to-one and additive. ⚠️ Absent, everything below
  // answers exactly as it did before, so nothing that worked stops working.
  const own = regionRecord(regions, regionId)?.homeTradition;
  if (own && (!traditionIndex?.byId || traditionIndex.byId[own])) return own;
  if (!traditionIndex?.byId) return null;
  const t = Object.values(traditionIndex.byId).find(x => x?.region === regionId);
  return t?.traditionId || null;
}

/** A regions collection may arrive as a list or a map; both are read the same way. */
function regionRecord(regions, regionId) {
  if (!regions || !regionId) return null;
  const all = Array.isArray(regions) ? regions : Object.values(regions);
  return all.find(r => (r?.regionId || r?.id) === regionId) || null;
}

// ⛔ GREAT-CIRCLE DEGREES between two `worldPos` ({colatitude, longitude}). Spherical, not planar: the
// world wraps, and a longitude subtraction gave the Centre a 394° window the last time anyone forgot.
const toRad = (d) => (Number(d) * Math.PI) / 180;
const unitVec = (w) => {
  const th = toRad(w?.colatitude), ph = toRad(w?.longitude);
  if (!Number.isFinite(th) || !Number.isFinite(ph)) return null;
  return [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)];
};
export function degreesBetween(a, b) {
  const A = unitVec(a), B = unitVec(b);
  if (!A || !B) return null;
  const dot = Math.max(-1, Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
  return (Math.acos(dot) * 180) / Math.PI;
};

/** ⛔ ERIK 2026-09-09 — THE DISTANCE FALLBACK. A person minted where no tradition is at home takes the
 *  one from the NEAREST place that has one: *"the nearest foothills or poles (by distance) unless the
 *  story narratively gives them a hook."*
 *
 *  ⚠️ NEAREST **PLACE**, NOT NEAREST REGION CENTRE, and deliberately: regions carry no centre, and the
 *  honest question is "where is the closest ground that actually practises something" rather than the
 *  midpoint of a shape. Every location carries `worldPos`; 135 of 135.
 *
 *  ⛑ CAPPED, and the cap is a symptom: with twelve foothills holding no `homeTradition`, the median
 *  orphan sits 34.3° from its nearest anchor. Beyond the cap this returns null and the person simply has
 *  no domains — which is the honest answer, and better than importing a craft from a third of a world
 *  away. ⛔ NO CODE DEFAULT for the cap: absent, nothing is borrowed at all.
 *
 *  Returns { tradition, viaLocationId, degrees } or null. PURE. */
export function nearestHomeTradition(fromWorldPos, { locations = null, traditionIndex = null, regions = null, withinDeg = null } = {}) {
  const cap = Number(withinDeg);
  if (!fromWorldPos || !locations || !Number.isFinite(cap)) return null;
  let best = null;
  for (const loc of (Array.isArray(locations) ? locations : Object.values(locations))) {
    if (!loc?.worldPos) continue;
    const home = regionHomeTradition(loc.regionId || loc.region || null, traditionIndex, regions);
    if (!home) continue;
    const d = degreesBetween(fromWorldPos, loc.worldPos);
    if (d == null || d > cap) continue;
    if (!best || d < best.degrees) best = { tradition: home, viaLocationId: loc.id || null, degrees: d };
  }
  return best;
}

/** Build the people vocabulary from authored NPC `people` values plus any peoples_of_kind clusters.
 *  Lowercased, deduped. Extensible — a new authored people appears here automatically. */
export function buildPeopleVocab({ npcs = {}, peoplesOfKind = null } = {}) {
  const set = new Set();
  for (const n of Object.values(npcs)) if (n?.people) set.add(String(n.people).toLowerCase());
  const clusters = peoplesOfKind?.clusters;
  if (clusters && typeof clusters === "object") {
    for (const c of Object.values(clusters)) {
      const members = Array.isArray(c) ? c : (c?.peoples || c?.members || []);
      for (const m of members) if (typeof m === "string") set.add(m.toLowerCase());
    }
  }
  return set;
}
