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
export function regionHomeTradition(regionId, traditionIndex) {
  if (!regionId || !traditionIndex?.byId) return null;
  const t = Object.values(traditionIndex.byId).find(x => x?.region === regionId);
  return t?.traditionId || null;
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
