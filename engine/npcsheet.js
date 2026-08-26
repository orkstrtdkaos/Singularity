// engine/npcsheet.js — CCODE-248. AN NPC WITH A CHARACTER SHEET, AND A WAY TO GROW ONE.
//
// ⛔ ERIK: "as the NPC grows they should gain levels and skills just like the PC. Use Pell as an example.
// She was the town blacksmith but has grown significantly and is Silas' wife. She has ironsense (which
// gets overdone because she needs a more robust way to gain crafts)."
//
// ⚠️ I LOOKED FOR PELL BEFORE BUILDING AND SHE IS NOT AUTHORED CONTENT. She exists in
// `npc_interiority.json` (drives, wants) and in the save's `npcRegistry` — and `ironsense` is not in the
// ability catalogue either. ⛔ SO THE CASE ERIK NAMED IS AN EMERGENT NPC, and the answer cannot be "author
// a sheet for her": nobody authored her in the first place.
//
// ⛔ WHY IRONSENSE GETS OVERDONE, MECHANICALLY. The registry tracks `skillsObserved` — a capped bag of
// FREE-TEXT STRINGS, whatever the narrator has seen her do. Nothing turns those into a kit, so the model
// has one remembered thing to reach for and reaches for it every time. ⚠️ THE REPETITION IS NOT A
// NARRATION PROBLEM. It is a character with one item on her sheet.
//
// ⛔ SO THIS FILE DOES TWO THINGS AND NEITHER INVENTS A PERSON:
//   1. DERIVES a sheet from what the world already knows about them — role, standing, what has been seen.
//   2. GROWS it, so a blacksmith who becomes a smith-of-note has more to draw on than one remembered verb.
//
// ⚠️ AND AN AUTHORED SHEET ALWAYS WINS. Aevi's 111 named people should get real sheets over time; where one
// exists it is the truth and this file fills nothing in. Derivation is for the ones nobody wrote down.

const num = (v, d = 0) => (v == null || v === "" || !Number.isFinite(Number(v)) ? d : Number(v));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** ⛔ HOW ESTABLISHED IS THIS PERSON? Derived from what the world has actually recorded, never invented:
 *  how often they have been met, how long they have been known, and whether they carry a role that implies
 *  standing. ⚠️ A STRANGER IS LEVEL 1 AND THAT IS CORRECT — the level is a claim about what the story has
 *  shown, not a courtesy. */
export function derivedLevel(entry, { day = null, cfg = {} } = {}) {
  const met = num(entry?.met, 1);
  const known = day != null && entry?.firstMet?.day != null
    ? Math.max(0, num(day, 0) - num(entry.firstMet.day, 0)) : 0;
  const perMeet = num(cfg.levelPerMeetings, 4);       // a level per N meetings
  const perSeason = num(cfg.levelPerDaysKnown, 96);   // and a level per season of acquaintance
  const fromDeeds = Math.floor(met / Math.max(1, perMeet));
  const fromTime = Math.floor(known / Math.max(1, perSeason));
  const standing = Math.max(0, Math.round(num(entry?.standing, 0) / Math.max(1, num(cfg.levelPerStanding, 25))));
  return clamp(1 + fromDeeds + fromTime + standing, 1, num(cfg.levelCap, 20));
}

/** ⚠️ THE SPINE THEY BRING. An NPC's attributes lean toward what their ROLE implies — a smith is
 *  practical and physical, a scholar mental — with the rest filling in modestly. ⛔ THE LEAN IS CONTENT,
 *  not a table in here: `roleAttributes` is injectable and these defaults are a floor. */
export const DEFAULT_ROLE_LEAN = {
  // what they ARE — the occupational role, from the world
  practical: ["smith", "blacksmith", "wright", "crafter", "mason", "cook", "farmer", "trader", "keeper"],
  physical: ["guard", "soldier", "hunter", "reaver", "warden", "carter", "miner", "ally"],
  // ⛔ AND WHAT THEY ARE TO YOU — the COMPANY roles, which my first version left out entirely, so Veth's
  // teaching half vanished and only "warden" counted. Erik: "she's supposed to be a teacher, but she's
  // also a warden." Both are true; both belong here.
  mental: ["scholar", "archivist", "physician", "syllogist", "reader", "cartographer", "trainer", "teacher"],
  social: ["innkeeper", "liaison", "envoy", "singer", "priest", "bargainer", "steward", "partner", "companion"],
};

/** ⛔ CCODE-248b — ROLES ARE PLURAL AND SO IS THE LEAN. Erik: "Veth… she's supposed to be a teacher, but
 *  she's also a warden, so she would likely be valuable in a fight too. The NPCs aren't one dimensional."
 *
 *  ⚠️ MY FIRST VERSION RETURNED ONE ATTRIBUTE FROM THE FIRST MATCHING WORD — which is one-dimensional in
 *  the exact way he is correcting. A teacher-and-warden got whichever word the map happened to hit first,
 *  and the other half of her vanished.
 *
 *  ⛔ TWO KINDS OF ROLE FEED THIS AND THEY ARE ORTHOGONAL:
 *    · the OCCUPATIONAL role — what they ARE. "warden of the palelands", "blacksmith", "archivist".
 *    · the COMPANY roles — what they are TO YOU. trainer, ally, liaison, partner (engine/company.js).
 *  Veth is a `trainer` on the roster AND a warden in the world; both are true and both should count. */
export function leansOf(entry, { roleAttributes = null } = {}) {
  const map = roleAttributes || DEFAULT_ROLE_LEAN;
  // every role string this person carries, from either system
  const text = [entry?.role, ...(entry?.roles || []), ...(entry?.titles || [])]
    .filter(Boolean).map(r => String(r).toLowerCase()).join(" · ");
  const out = [];
  for (const [attr, words] of Object.entries(map)) {
    if ((words || []).some(w => text.includes(w)) && !out.includes(attr)) out.push(attr);
  }
  return out;
}

/** The single strongest lean, kept for callers that want one. ⚠️ `leansOf` is the honest answer. */
export function leanOf(entry, opts = {}) {
  return leansOf(entry, opts)[0] || null;
}

/** ⛔ THE SHEET. Same shape a contest already takes, so an NPC can be a combatant without a second format.
 *  ⚠️ AN AUTHORED SHEET WINS OUTRIGHT — this fills in for people nobody has written down yet, and the
 *  moment Aevi authors one the derivation stops applying to them. */
export function sheetFor(entry, { day = null, cfg = {}, roleAttributes = null, authored = null } = {}) {
  if (authored) return { ...authored, id: entry?.id || authored.id, authored: true };
  const level = derivedLevel(entry, { day, cfg });
  const leans = leansOf(entry, { roleAttributes });
  const base = Math.max(1, Math.round(level / 2) + 1);
  const attributes = { physical: base, mental: base, social: base, practical: base };
  // ⛔ EVERY LEAN COUNTS, and a second one counts for less than the first — a teacher-and-warden is good at
  // both and best at neither. ⚠️ NOT a flat stack: someone with four roles is not superhuman in all four.
  const bonus = num(cfg.roleLeanBonus, 2);
  leans.forEach((attr, i) => { attributes[attr] = base + Math.max(1, Math.round(bonus / (i + 1))); });
  return {
    id: entry?.id || null,
    name: entry?.name || entry?.id || "someone",
    level,
    attributes,
    subAttributes: {},
    health: level * num(cfg.healthPerLevel, 3),
    maxHealth: level * num(cfg.healthPerLevel, 3),
    energy: num(cfg.energyBase, 40),
    maxEnergy: num(cfg.energyBase, 40),
    soak: Math.max(0, Math.round(level / 3)),
    skills: [],
    conditions: entry?.conditions || [],
    derived: true,
    lean: leans[0] || null,
    leans,
  };
}

/** ⛔ WHAT THEY CAN ACTUALLY DO — the answer to "ironsense gets overdone".
 *
 *  `skillsObserved` is free text: whatever the narrator has watched them do. This matches those strings
 *  against the real catalogue so a remembered verb becomes a CRAFT, and returns them as a kit.
 *
 *  ⚠️ MATCHED, NEVER INVENTED. A string that matches nothing stays a string — reported as `unmatched` so
 *  the gap is visible rather than silently dropped. ⛔ `ironsense` matches nothing in the catalogue today,
 *  which is precisely why Pell has one thing to reach for: the observation was recorded and never became
 *  a craft anyone could resolve. */
export function craftsOf(entry, catalog = {}, { limit = 8 } = {}) {
  const seen = (entry?.skillsObserved || []).map(s => String(s).toLowerCase().trim()).filter(Boolean);
  const byId = {}, byName = {};
  for (const [id, ab] of Object.entries(catalog || {})) {
    byId[String(id).toLowerCase()] = ab;
    if (ab?.name) byName[String(ab.name).toLowerCase()] = ab;
  }
  const matched = [], unmatched = [];
  for (const s of seen) {
    const key = s.replace(/[\s'’-]+/g, "_");
    const hit = byId[key] || byName[s] || byId[s] || null;
    if (hit) { if (!matched.some(m => m.id === hit.id)) matched.push(hit); }
    else unmatched.push(s);
  }
  return { crafts: matched.slice(0, limit), unmatched };
}

/** ⛔ GROWTH. Erik: "as the NPC grows they should gain levels and skills just like the PC."
 *
 *  ⚠️ THE HONEST VERSION OF THIS IS SMALL AND I AM NOT MAKING IT BIGGER. An NPC gains a craft when the
 *  story has shown them doing something new — that is what `skillsObserved` records — and the growth step
 *  is turning an observation into a kit entry once it matches something real.
 *
 *  ⛔ IT DOES NOT INVENT CRAFTS. An unmatched observation returns as a REQUEST — "this person has been seen
 *  doing something the catalogue cannot express" — which is a prompt to author, not licence to mint. That
 *  is the difference between growing a character and hallucinating one. */
export function growthFor(entry, catalog = {}, { day = null, cfg = {} } = {}) {
  const { crafts, unmatched } = craftsOf(entry, catalog);
  const level = derivedLevel(entry, { day, cfg });
  const capacity = Math.max(1, Math.round(level / Math.max(1, num(cfg.craftsPerLevels, 2))));
  return {
    level,
    crafts,
    capacity,
    // what the story has shown that the catalogue cannot yet express
    wantsAuthoring: unmatched,
    // ⚠️ NAMED SO IT IS ACTIONABLE: a person the story keeps showing doing one thing has one thing.
    thin: crafts.length <= 1 && (entry?.met || 0) > num(cfg.thinAfterMeetings, 3),
  };
}
