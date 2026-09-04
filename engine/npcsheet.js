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

import { abilityTier } from "./skilltree.js";
const num = (v, d = 0) => (v == null || v === "" || !Number.isFinite(Number(v)) ? d : Number(v));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** ⛔ HOW ESTABLISHED IS THIS PERSON? Derived from what the world has actually recorded, never invented:
 *  how often they have been met, how long they have been known, and whether they carry a role that implies
 *  standing. ⚠️ A STRANGER IS LEVEL 1 AND THAT IS CORRECT — the level is a claim about what the story has
 *  shown, not a courtesy. */
/** ⛔ CCODE-309 / ERIK 2026-08-29: "the npc cap is garbage cruft — the world arcs move mainly from npcs
 *  who have climbed the ladder... after or around lvl 100 a character and/or npc will either ASCEND or FALL
 *  ACROSS THE VEIL. They will go to join the primary conflict. The World's Mythicals are those high near
 *  level 100 npcs."
 *
 *  ⛔ THE CRUFT WAS NOT THE NUMBER 20, IT WAS THE INPUTS. Every term in this function measured the PLAYER'S
 *  RELATIONSHIP with the NPC — how often you met them, how long you have known them, your standing. So an
 *  NPC's power in the world was a function of the player's address book, and **a world-moving Mythical the
 *  player has never met was LEVEL 1**. The cap of 20 was only the visible half of that.
 *
 *  ✅ SO AN AUTHORED LEVEL IS WHAT THEY ARE, AND THE RELATIONSHIP TERMS BECOME GROWTH ON TOP OF IT. Erik:
 *  "they get killed and injured and they need to grow too." An unauthored entry behaves EXACTLY as before —
 *  reader before field, so nothing moves until content says so.
 *
 *  ⚠️ AND THE CEILING IS NOW CANON RATHER THAN AN ARBITRARY WALL. 100 is where the Veil is crossed, so a
 *  clamp at 100 means "as far as anyone goes on THIS side" instead of "as far as we bothered to model". */
export function derivedLevel(entry, { day = null, cfg = {}, authored = null } = {}) {
  const met = num(entry?.met, 1);
  const known = day != null && entry?.firstMet?.day != null
    ? Math.max(0, num(day, 0) - num(entry.firstMet.day, 0)) : 0;
  const perMeet = num(cfg.levelPerMeetings, 4);       // a level per N meetings
  const perSeason = num(cfg.levelPerDaysKnown, 96);   // and a level per season of acquaintance
  const fromDeeds = Math.floor(met / Math.max(1, perMeet));
  const fromTime = Math.floor(known / Math.max(1, perSeason));
  const standing = Math.max(0, Math.round(num(entry?.standing, 0) / Math.max(1, num(cfg.levelPerStanding, 25))));
  const growth = fromDeeds + fromTime + standing;

  // ⛔ AEVI'S CORRECTION, AND SHE IS RIGHT: "do not replace it with 100 — a Mythical is NEAR 100 and the
  // number is a CONSEQUENCE of the ladder, not a cap on it. If a bound is needed for arithmetic safety,
  // put it in CONTENT with a reason." ⚠️ MY FIRST FIX CLAMPED TO 100 IN CODE — the same shape Erik has
  // ruled against four times, a default acting as a ceiling. The bound now comes from
  // `resolution.npcStanding` and sits at 200, deliberately ABOVE the crossing so it can never be read as
  // the cap it replaces. ⛔ 100 IS A DOOR, NOT A CEILING.
  const bound = Math.max(1, num(cfg.safetyBound, 200));

  // ⛔ WHAT THEY ARE, BEFORE THE PLAYER HAS ANYTHING TO DO WITH IT. An authored level wins; otherwise the
  // FLOOR of their tier on the canon ladder (mythic…riffraff — `arc_response.attentionByTier`, SNG-280).
  // ⚠️ `entry` is read as well as `authored` because this codebase passes both a merged record and a
  // separate authored one, and reading only one is how `persistUntilHealed` missed all six of its objects.
  //
  // ⛔ THERE IS DELIBERATELY NO CODE DEFAULT FOR `tierFloor`. If the content dial does not reach here a
  // mythic NPC quietly stays a nobody — so a built-in map would MASK a broken thread instead of exposing
  // it, and `wiring_audit` would report the dial as unread while the engine looked fine.
  const floors = cfg.tierFloor || null;
  const tier = String(authored?.tier ?? entry?.tier ?? "").toLowerCase();
  const base = num(authored?.level ?? entry?.level, 0)
    || (floors ? num(floors[tier], 0) : 0)
    || 1;

  // ⚠️ AND TIER IS A THING THAT MOVES. Erik: "they grow in tier." A floor is where a rung STARTS, not
  // where its people stay — growth carries them up and eventually across into the next rung.
  return clamp(base + growth, 1, bound);
}

/** ⛔ CCODE-310 — THE RUNG A LEVEL LANDS IN, which is what makes tier something that MOVES rather than a
 *  label. Erik: "they get killed and injured and they need to grow too (which they do in tier)."
 *
 *  ⚠️ DERIVED FROM THE SAME CONTENT FLOORS `derivedLevel` USES, never a second table — two ladders that
 *  can disagree is the stored-copy-of-a-derived-value failure, committed twice in this project already.
 *  ⛔ RETURNS null WITHOUT THE DIAL, because guessing a rung is worse than admitting there is no ladder. */
export function tierOf(level, { cfg = {} } = {}) {
  const floors = cfg.tierFloor;
  if (!floors) return null;
  const lv = num(level, 1);
  let best = null, bestFloor = -Infinity;
  for (const [rung, floor] of Object.entries(floors)) {
    const f = num(floor, 0);
    if (lv >= f && f > bestFloor) { best = rung; bestFloor = f; }
  }
  return best;
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
export function sheetFor(entry, { day = null, cfg = {}, roleAttributes = null, authored = null, levelOverride = null } = {}) {
  if (authored) return { ...authored, id: entry?.id || authored.id, authored: true };
  // ⛔ SNG-486 — see sheetFrom: a record carrying its own sub-attributes IS an authored sheet.
  const own = entry?.subAttributes && Object.keys(entry.subAttributes).length;
  const sheet = sheetFrom(entry, { day, cfg, roleAttributes, levelOverride });
  return own ? { ...sheet, subAttributes: { ...entry.subAttributes }, authored: true, derived: false } : sheet;
}
/** ⛔ THE BODY OF THE SHEET, shared by the derived and the authored paths. ⚠️ SPLIT OUT RATHER THAN
 *  COPIED: an authored sheet differs from a derived one in WHAT IT KNOWS, not in how health, soak or
 *  energy are computed from a level — duplicating those would let the two drift. */
function sheetFrom(entry, { day = null, cfg = {}, roleAttributes = null, levelOverride = null } = {}) {

  // ⛔ CCODE-273 — THE ONE SEAM A SUMMON NEEDS. Aevi: "A SUMMON IS THAT WITH THE LEVEL COMING FROM SOMEWHERE
  // ELSE... replaces `derivedLevel(entry)` with `casterLevel + tierGap` and the rest of the function is
  // already correct." She is right — everything below this line (the base, the leans, the bonus) wants a
  // level and does not care where it came from.
  // ⚠️ `?? derivedLevel` RATHER THAN `||`: a legitimate override of 0 must not fall through to the derived
  // value, and levels are clamped to 1 below anyway.
  const level = levelOverride != null ? Math.max(1, num(levelOverride, 1)) : derivedLevel(entry, { day, cfg });
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
  // ⛔ SNG-486 — A READER WITH NO WRITER MET A WRITER WITH NO READER, AND THEY WERE THE SAME DEFECT.
  // `skillsObserved` is what this function has always read: names the PLAYER has seen someone use.
  // ⚠️ MEASURED ACROSS ALL 44 AUTHORED NPCs: nobody has ever authored it. Zero records carry the field.
  //
  // ⛔ AND AEVI'S FIRST AUTHORED SHEET (Pell, 17 crafts) USES `abilities` — the same shape a PLAYER
  // character carries, `{ abilityId, level }`. That is the better shape: it names crafts by ID rather
  // than by a string that has to be re-matched, and it carries the RANK. So both are read, and the
  // authored one is read FIRST — "an authored sheet always wins" is this file's own stated contract.
  const authoredIds = (entry?.abilities || []).map(a => String(a?.abilityId || a || "").toLowerCase().trim()).filter(Boolean);
  const seen = [...authoredIds, ...(entry?.skillsObserved || []).map(s => String(s).toLowerCase().trim()).filter(Boolean)];
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
  // ⛔ SPEC_progressive_sheets §2 — AN AUTHORED SHEET IS A FLOOR, NOT A CEILING. `limit` used to slice the
  // whole list, authored entries first, so Pell's 17 crafts came back as 8 here and 14 from `kitFor` — the
  // engine pruning a human's list to its own formula. The limit now bounds what is ADDED from observation;
  // what was written down is returned whole, and named, so a caller can keep it whole too.
  const authoredSet = new Set(authoredIds);
  const authored = matched.filter(m => authoredSet.has(String(m.id).toLowerCase()));
  const observed = matched.filter(m => !authoredSet.has(String(m.id).toLowerCase()));
  return { crafts: [...authored, ...observed.slice(0, Math.max(0, limit - authored.length))], unmatched,
    authored: authored.map(m => m.id) };
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
  const level = derivedLevel(entry, { day, cfg });
  const capacity = Math.max(1, Math.round(level / Math.max(1, num(cfg.craftsPerLevels, 2))));
  // ⛔ SPEC_progressive_sheets §2 — growth ADDS above an authored list and never prunes below it. The
  // default `limit: 8` here cut an authored 17 to 8; capacity bounds the observed additions, not the floor.
  const { crafts, unmatched, authored } = craftsOf(entry, catalog, { limit: capacity });
  return {
    level,
    crafts,
    capacity,
    // ⚠️ THE FLOOR IS WHAT A HUMAN WROTE; ROOM IS HOW MUCH THE STORY MAY STILL ADD. An authored sheet above
    // formula has room 0 and that is CORRECT, not an error — §2's Pell case (17 crafts, capacity 14).
    floor: authored.length,
    room: Math.max(0, capacity - crafts.length),
    // ⛔ §5 / Q5 — `closed: [...]` is an AUTHORED ABSENCE: this person will not learn these. Reader before
    // field: nobody authors it yet, and the moment someone does the kit honours it (see kitFor).
    closed: Array.isArray(entry?.closed) ? entry.closed.map(String) : [],
    // what the story has shown that the catalogue cannot yet express
    wantsAuthoring: unmatched,
    // ⚠️ NAMED SO IT IS ACTIONABLE: a person the story keeps showing doing one thing has one thing.
    thin: crafts.length <= 1 && (entry?.met || 0) > num(cfg.thinAfterMeetings, 3),
  };
}

// ══════════════════════════════════════════════════════════════════════════════════════════════════
// ⛔ CCODE-249 — THE SAME MECHANICS AS A PC. Erik: "I want NPCs using the same set of skills available to
// PCs — that's how they harm or restore… they use the same game mechanics. The roles part likely just sets
// which ones they have when met and which ones they learn as they grow."
//
// ⚠️ SO `contributions` WAS THE WRONG ABSTRACTION AND THIS REPLACES ITS JOB. An NPC does not "bring
// RESTORE" — an NPC KNOWS `chord_of_mending`, and mending is what that craft does. The families were a
// summary standing in for a kit, and a summary cannot be resolved in a round.
//
// ⛔ AND THE KIT IS DRAWN THE WAY A PC'S IS, by the same function. `domainAccess` decides what a place on
// the circle opens; `creationPool` is the creation screen asking that question. An NPC asking it too is not
// a parallel system — it is the SAME system with a different character in it.
//
// ⚠️ PERMANENCE IS ALREADY BUILT AND I ALMOST REBUILT IT. Erik: "likely only when you have interacted with
// them enough to make them permanent." `generate.js` has carried `TIER_SCHEMA` — fresh → established (3) →
// nominated (8) — since SNG-216, with each tier listing what it OWES. A sheet is the next thing an
// established person owes, and `unearnedDepth` will name anyone who lacks one.

/** ⛔ IS THIS PERSON PERMANENT ENOUGH TO HAVE A SHEET? ⚠️ A face in a crowd does not get one, and that is
 *  not stinginess — it is that a stranger with attributes is a stranger the engine has opinions about. */
export function isPermanent(entry, { at = 3 } = {}) {
  const tier = entry?._gen?.tier || null;
  if (tier === "established" || tier === "nominated") return true;
  // authored people are permanent by construction — somebody wrote them down
  if (entry?.authored === true || entry?.schemaVersion != null) return true;
  return num(entry?._gen?.engagementScore, num(entry?.met, 0)) >= num(at, 3);
}

/** ⛔ THE KIT — real catalogue crafts, drawn by the SAME rule a player's are.
 *
 *  Three sources, in the order Erik described:
 *    1. WHAT HAS BEEN SEEN — `skillsObserved` matched to real crafts. The story is the first authority.
 *    2. WHAT THEIR DOMAINS OPEN — the same `domainAccess` question the creation wheel asks.
 *    3. ⚠️ AND NOTHING ELSE. A craft nobody has seen them use and their domains do not open is a craft
 *       they do not have. The role SEEDS the domains; it does not hand out abilities directly.
 *
 *  ⛔ CAPPED BY LEVEL, exactly as a PC is. `skillCapacity` is the same table. */
export function kitFor(entry, { catalog = {}, traditionIndex = null, domainAccess = null,
  day = null, cfg = {}, capacity = null } = {}) {
  const level = derivedLevel(entry, { day, cfg });
  const formula = Math.max(1, num(capacity, Math.max(1, Math.round(level / Math.max(1, num(cfg.craftsPerLevels, 2))))));
  const seen = craftsOf(entry, catalog, { limit: formula });
  // ⛔ SPEC_progressive_sheets §2 — the cap is the formula OR the authored count, whichever is higher. Pell
  // is L27 with 17 crafts and a capacity of 14; the old `slice(0, cap)` dropped three she was written with.
  const cap = Math.max(formula, (seen.authored || []).length);
  const kit = [...seen.crafts];
  // ⛔ §5 — NEVER INVENT THE ABSENCES. An authored `closed` list is a fact about the person; the domain draw
  // below may not hand it back. (Veth has no bone_lance, set_hand or reaping_sickle, and those are her.)
  const closed = new Set((Array.isArray(entry?.closed) ? entry.closed : []).map(String));

  // what their place on the circle opens — the same question the creation screen asks
  const domains = entry?.domains || null;
  if (domains && typeof domainAccess === "function") {
    for (const ab of Object.values(catalog || {})) {
      if (kit.length >= cap) break;
      if (abilityTier(ab) > Math.max(1, Math.ceil(level / 5))) continue;
      if (kit.some(k => k.id === ab.id)) continue;
      if (closed.has(ab.id)) continue;
      let v = null;
      try { v = domainAccess(ab, abilityTier(ab), domains, traditionIndex); } catch { v = null; }
      // ⚠️ NEAR GROUND ONLY. An NPC reaches across the circle only where the story has SHOWN them doing it
      // — that is what `skillsObserved` is for. Filling a kit from the far side would invent a biography.
      if (v?.allowed && (v.band === "primary" || v.band === "adjacent" || v.band === "open")) kit.push(ab);
    }
  }
  return {
    level, capacity: cap, crafts: kit.slice(0, cap),
    fromStory: seen.crafts.map(c => c.id),
    wantsAuthoring: seen.unmatched,
    // ⛔ NAMED SO IT IS ACTIONABLE: a permanent person with no domains cannot draw a kit at all, and that
    // is a gap in the record rather than a person with no talents.
    needsDomains: !domains,
    floor: (seen.authored || []).length,
    closed: [...closed],
  };
}

/** ⛔ WHAT THIS PERSON CAN DO IN A ROUND — as verbs, read off their actual crafts. ⚠️ THIS IS THE HONEST
 *  REPLACEMENT FOR `contributions`: not a family summary, but the functions their kit really carries, which
 *  is the same thing `playerBattleSkills` reads off a PC. */
export function battleSkillsFor(entry, opts = {}) {
  const { crafts, level } = kitFor(entry, opts);
  const out = [];
  for (const ab of crafts) {
    for (const fn of (ab.functions || [])) {
      out.push({ id: ab.id, function: fn, name: ab.name || ab.id, tier: abilityTier(ab),   // CCODE-341d: a THIRD shape of the levelReq-as-tier defect — assigning it to a field NAMED tier
        attribute: ab.attribute || "practical", energyCost: ab.energyCost ?? null });
    }
  }
  // ⛔ AND THE PLAIN STRIKE, because the PC gets one and an NPC is not a different kind of thing. This is
  // the line that makes "Pell fights too" true without any authoring at all.
  if (entry?.canStrike !== false && entry?.incorporeal !== true) {
    out.push({ id: "_strike", function: "strike", name: "a plain strike", tier: 1, attribute: "physical" });
  }
  return { skills: out, level };
}

/** ⛔ CCODE-273 / AEVI's SPEC_summoned_sheets, WITH ERIK'S ADDITION — WHAT ARRIVES WHEN YOU SUMMON.
 *
 *  Erik: *"let's let CCode help with the summon stats. He worked on some NPC character sheets — this would
 *  be a LITE VERSION of that."* And Aevi, revising her own spec: *"`synthSheet` builds a FOE from a threat
 *  band. That is an opponent, and a summoned thing is not always an opponent — `raised_hand` sets a CREW
 *  THAT HAULS."*
 *
 *  ⚠️ SO IT IS `sheetFor` WITH THE LEVEL COMING FROM SOMEWHERE ELSE. Erik's rule: base it off the caster.
 *  ⛔ THE LITE PART, EXPLICITLY: no `craftsOf`, no `growthFor`, no `kitFor`, no `isPermanent`. A summoned
 *  thing has no growth arc, no inventory and no reputation — it arrives, it does a thing, it comes apart.
 *
 *  ⛔ AND THE GAP IS NOT FIXED — ERIK'S RULING. Aevi asked whether `driven_shade` rising −1 → 0 → +1 with
 *  rank was too much for a thing a player made. He said fine, *"but i would also tie it to how well you
 *  succeeded at the skill and if you crit."*
 *  ⚠️ THAT IS THE BETTER DESIGN AND IT CHANGES WHAT THE FIELD MEANS. An authored `tierGap` was a promise
 *  about the craft; now it is a FLOOR the roll can beat. A shade raised on a bare success is the shade the
 *  craft promises; one raised on a crit is worse than its maker — and that is a thing that HAPPENED at the
 *  table rather than a number sitting in a file. */
export function summonGap(ability, { rank = 1, degree = "success", cfg = {} } = {}) {
  const authored = ability?.summon?.tierGap ?? ability?.tierGap;
  // a per-rank ladder is authored as an array or an object keyed by rank; a bare number is flat
  let base = 0;
  if (Array.isArray(authored)) base = num(authored[Math.max(0, num(rank, 1) - 1)], num(authored[authored.length - 1], 0));
  else if (authored && typeof authored === "object") base = num(authored[String(num(rank, 1))], 0);
  else base = num(authored, 0);
  // ⚠️ THE ROLL MOVES IT, AND ONLY UPWARD FROM A CLEAN SUCCESS. A partial gives you less than the craft
  // promises; a crit gives you more. ⛔ FAILURE IS NOT MODELLED HERE — a failed summon summons nothing, and
  // returning a weak sheet for it would be the engine inventing a consolation prize.
  const byDegree = { crit_success: num(cfg.critGap, 1), success: 0, partial: num(cfg.partialGap, -1) };
  const shift = num(byDegree[String(degree)], 0);
  return { gap: base + shift, base, shift, degree,
    why: shift > 0 ? "a crit — it comes back stronger than the craft promises"
      : shift < 0 ? "a partial — it comes back thinner than it should"
      : "as the craft promises" };
}

/** ⛔ THE SHEET ITSELF. `sheetFor` unchanged underneath — this only decides the LEVEL and then stops.
 *  ⚠️ NO CRAFTS, NO GROWTH, NO KIT, NO PERMANENCE. Aevi listed those exclusions and they are the whole
 *  difference between a summon and a companion. */
export function summonSheetFor(ability, casterLevel, { rank = 1, degree = "success", cfg = {}, entry = null } = {}) {
  const g = summonGap(ability, { rank, degree, cfg });
  const level = Math.max(1, num(casterLevel, 1) + g.gap);
  const rec = { ...(entry || {}), id: entry?.id || ability?.id, name: entry?.name || ability?.name,
    role: entry?.role || ability?.summon?.role || "" };
  // `sheetFor` reads `leansOf` off the record, so a raised hand ends up physical and a driven shade
  // physical-and-mental without this function knowing either of those words.
  const sheet = sheetFor(rec, { cfg, levelOverride: level });
  return {
    ...sheet, level, summonedBy: ability?.id || null, gap: g,
    count: Math.max(1, num(ability?.summon?.count, 1)),
    duration: ability?.summon?.duration ?? null,
    contributions: ability?.summon?.contributions || null,
  };
}

/** ⛔ THE FIRST LIVE CALLER THIS MODULE HAS EVER HAD, and it is deliberately one that READS.
 *
 * ⚠️ AEVI PROPOSED MINTING A SHEET AND NOT WIRING IT TO COMBAT. That builds a writer with no reader on
 * purpose — the shape that hid `folkAccessible`, `backlashRung`, `holdings`, `sectFlavour`,
 * `local_layouts` and this very module for weeks. ⛔ A SHEET NOBODY READS IS NOT SAFE, IT IS INVISIBLE.
 *
 * ✅ SO THE FIRST CALLER IS THE NARRATOR. If a sheet is wrong here, the GM says something odd about a
 * person and NOTHING RESOLVES DIFFERENTLY — no damage, no roll, no state. That is what makes it the
 * cheapest possible place to be wrong in public, and 395 lines that have never run need exactly that
 * before anything mechanical depends on them.
 *
 * ⚠️ AUTHORED FIRST, DERIVED OTHERWISE, and the line says which — a narrator told a derived guess and an
 * authored fact in the same voice would treat them the same.
 */
export function sheetsForGM(people = [], { catalog = {}, day = null, cfg = {}, roleAttributes = null, maxCrafts = 4 } = {}) {
  const lines = [];
  for (const entry of people) {
    if (!entry?.id && !entry?.name) continue;
    const sheet = sheetFor(entry, { day, cfg, roleAttributes });
    const { skills } = battleSkillsFor(entry, { catalog, day, cfg });
    // ⚠️ ONE ROW PER CRAFT, NOT PER FUNCTION. `battleSkillsFor` emits an entry per function, so Pell's
    // 17 crafts arrive as 32 rows — useful to a resolver, unreadable in a prompt.
    const byCraft = new Map();
    for (const sk of skills) {
      if (sk.id === "_strike") continue;
      if (!byCraft.has(sk.id)) byCraft.set(sk.id, { name: sk.name, fns: [] });
      byCraft.get(sk.id).fns.push(sk.function);
    }
    const crafts = [...byCraft.values()].slice(0, maxCrafts)
      .map(c => `${c.name} (${c.fns.slice(0, 3).join("/")})`);
    const more = byCraft.size - crafts.length;
    // ⚠️ THE LINE SAYS WHICH. A tier-only person (the 70 on the legends roster) gets their level from an AUTHORED
    // tier floor, not from what the player has seen — telling the narrator otherwise would understate a legend.
    const how = sheet.authored ? "authored" : (entry?.tier && entry?.level == null ? "by their standing in the world" : "as the story has shown them");
    const lean = sheet.leans?.length ? `, ${sheet.leans.slice(0, 2).join(" then ")}` : "";
    lines.push(`- ${sheet.name} — level ${sheet.level} (${how})${lean}`);
    if (crafts.length) lines.push(`    knows: ${crafts.join(" · ")}${more > 0 ? ` and ${more} more` : ""}`);
    // ⛔ SPEC_progressive_sheets §1/§4 — `growthFor` had no caller in play; this is it, and it READS. What the
    // story has shown that the catalogue cannot express reaches the narrator as a fact about the RECORD,
    // which is the mechanical answer to “ironsense gets overdone”: the model stops reaching for one word
    // because the block says the word is all the record holds. Nothing resolves differently.
    const g = growthFor(entry, catalog, { day, cfg });
    if (g.wantsAuthoring.length) lines.push(`    seen doing, not yet a craft anyone can resolve: ${g.wantsAuthoring.slice(0, 3).join(" · ")}`);
    if (g.thin) lines.push(`    (the record is thin — one thing to reach for — not the person)`);
    // ⛔ WHAT THEY BRING, AND WHAT THEY CANNOT. `canStrike: false` is an authored fact about a body and
    // the only thing that suppresses the HARM default — a narrator that does not know it will have a
    // scholar swinging.
    // ⚠️ `_canStrikeWhy` IS AN AUTHOR'S NOTE, NOT NARRATOR VOICE — it is working-paper prose full of
    // markers and belongs to Aevi, not to a prompt. `physicality` is the sentence a narrator can use.
    if (entry.canStrike === false) lines.push(`    cannot strike${entry.physicality ? ` — ${String(entry.physicality).split(/(?<=[.!?])s/)[0]}` : " — an authored fact about this person, not a rule about their kind"}`);
  }
  return lines.join("\n");
}
