// progression.js — character growth with numbers you can point at.
//   SUB-ATTRIBUTES: physical→strength/agility, mental→reason/insight,
//     social→presence/rapport, practical→craft/wits. Rolls target the sub.
//   LEVELING: each level banks a sub-attribute point (you place it) and a skill
//     point (rank up an ability or learn a new one), plus attunement/reserves.
//   DISCOVERIES: intentionally novel or combined ability use is riskier — harder
//     roll, wider crit-fail band, engine-applied backlash on crit failure — but a
//     critical success mints a permanent named technique with a standing bonus.

import { slugify } from "./quests.js";
import { meetsLearnGate, meetsRank3Gate, atCapacity, skillPointCost, rankExpression, forkPending } from "./skilltree.js";
import { domainAccess, traditionOf, isFolkTradition, antipodeOf } from "./traditions.js";
import { standingWithPeople } from "./reputation.js";
import { trainerFor } from "./company.js";
import { smartClamp } from "./namematch.js"; // SNG-152

// Practiced enough for `targetRank`? Inlined (not imported from practice.js) to avoid a circular
// import — practice.js already imports discoveryKey from here. Mirrors practice.js practiceRankReady.
function practicedForRank(character, abilityId, targetRank, rules) {
  const need = rules.leveling?.useRankThreshold?.[String(targetRank)] ?? rules.practice?.useRankThreshold?.[String(targetRank)];
  if (!need) return false;
  return (character.practice?.uses?.[abilityId] || 0) >= need;
}

export const SUB_OF = {
  strength: "physical", agility: "physical",
  reason: "mental", insight: "mental",
  presence: "social", rapport: "social",
  craft: "practical", wits: "practical"
};
export const SUBS = Object.keys(SUB_OF);

export const SUB_DESC = {
  strength: "Force and endurance — breaking, lifting, carrying, holding on",
  agility: "Speed and balance — climbing, dodging, sneaking, slipping past",
  reason: "Logic and analysis — puzzles, mechanisms, deduction, planning details",
  insight: "Perception and intuition — noticing things, reading people, sensing wrongness",
  presence: "Command and inspiration — leading, being heeded, holding a room",
  rapport: "Charm and empathy — befriending, soothing, negotiating, fitting in",
  craft: "Making and fixing — tools, repairs, precise handwork, quality judgment",
  wits: "Improvisation and survival — quick thinking, reacting, making do"
};

/** Migrate a character to sub-attributes (both subs start at the parent value). */
export function ensureSubAttributes(character) {
  if (character.subAttributes) return character;
  character.subAttributes = {};
  for (const [sub, parent] of Object.entries(SUB_OF)) {
    character.subAttributes[sub] = character.attributes?.[parent] ?? 2;
  }
  character.pendingSubPoints = character.pendingSubPoints || 0;
  character.skillPoints = character.skillPoints || 0;
  character.discoveries = character.discoveries || [];
  return character;
}

/** Keep the parent attributes as the derived average of their subs (back-compat + display). */
export function syncParentAttributes(character) {
  for (const parent of ["physical", "mental", "social", "practical"]) {
    const subs = SUBS.filter(s => SUB_OF[s] === parent).map(s => character.subAttributes[s]);
    character.attributes[parent] = Math.round(subs.reduce((a, b) => a + b, 0) / subs.length);
  }
  return character;
}

/** Level-up: bank growth choices instead of auto-spending them. Returns messages. */
export function applyLevelUps(character, rules) {
  const per = rules.leveling?.xpPerLevel ?? 100;
  const msgs = [];
  while (character.xp >= character.level * per) {
    character.level++;
    character.attunement = (character.attunement || 0) + 1;
    character.maxHealth += 5; character.maxEnergy += 5;
    character.health = character.maxHealth; character.energy = character.maxEnergy;
    character.pendingSubPoints = (character.pendingSubPoints || 0) + (rules.leveling?.subPointPerLevel ?? 1);
    character.skillPoints = (character.skillPoints || 0) + (rules.leveling?.skillPointPerLevel ?? 1);
    msgs.push(`Level ${character.level}: +1 attunement, +5 reserves, and growth to choose — a sub-attribute point and a skill point.`);
  }
  return msgs;
}

/** One-time retro grant for characters who leveled before banked growth existed
 *  (v0.7.0). Grants (level-1) sub and skill points, once, flagged. */
export function retroLevelGrants(character, rules) {
  if (character.grantsVersion >= 1) return false;
  character.grantsVersion = 1;
  const owed = Math.max(0, (character.level || 1) - 1);
  if (owed > 0) {
    character.pendingSubPoints = (character.pendingSubPoints || 0) + owed * (rules.leveling?.subPointPerLevel ?? 1);
    character.skillPoints = (character.skillPoints || 0) + owed * (rules.leveling?.skillPointPerLevel ?? 1);
  }
  return owed > 0;
}

// ---------- SNG-101b: by-right native grants (a character's PRIMARY tradition starter kit) ----------

/** The native-basic ability ids a character is granted BY RIGHT of their primary tradition: the
 *  tradition's anchors (always) + Tier-II basics matching their build lean (highest of mental /
 *  physical / practical / social, filling from the mental caster-spine when the lean pool is thin),
 *  capped at rules.grantCap. Data-driven from `rules.traditionNativeGrants` (SNG-101b content). The
 *  PRIMARY tradition is authoritative via `domains.primary` (SNG-094), with a legacy fallback. Pure. */
export function nativeGrantIdsFor(character, rules) {
  const primary = character?.domains?.primary || character?.nativeTradition || character?.origin;
  const table = rules?.traditionNativeGrants?.[primary];
  if (!table) return [];
  const cap = rules?.grantCap ?? 5;
  const attrs = character?.attributes || {};
  let leanKey = "mental", best = -Infinity;
  for (const k of ["mental", "physical", "practical", "social"]) { const v = attrs[k] ?? 0; if (v > best) { best = v; leanKey = k; } }
  const out = [];
  const push = id => { if (id && !out.includes(id)) out.push(id); };
  for (const a of table.anchors || []) push(a);                 // anchors: always, by right
  for (const a of (table.byLean?.[leanKey] || [])) push(a);     // lean-matched basics
  if (out.length < cap) for (const a of (table.byLean?.mental || [])) { if (out.length >= cap) break; push(a); } // fill from the caster spine
  return out.slice(0, cap);
}

/** Grant any MISSING primary-tradition native basics at rank 1. Law 14: only ADDS — never lowers an
 *  owned rank (an already-earned basic keeps its rank), never removes. Idempotent. Returns granted ids. */
export function applyNativeGrants(character, rules) {
  character.abilities = character.abilities || [];
  const owned = new Set(character.abilities.map(a => a.abilityId));
  const granted = [];
  for (const id of nativeGrantIdsFor(character, rules)) {
    if (!owned.has(id)) { character.abilities.push({ abilityId: id, level: 1, native: true }); owned.add(id); granted.push(id); }
  }
  return granted;
}

/** One-time retro: backfill missing primary-tradition native basics for existing characters. Versioned
 *  via a DISTINCT flag (`nativeGrantsVersion`) so it never collides with `retroLevelGrants`' grantsVersion
 *  (Q3). Law-14-safe (adds only, rank 1); idempotent (a second call grants nothing). Returns granted ids. */
export function retroNativeGrants(character, rules) {
  if ((character.nativeGrantsVersion || 0) >= 1) return [];
  const granted = applyNativeGrants(character, rules);
  character.nativeGrantsVersion = 1;
  return granted;
}

/** SNG-131: seed a substrate-keeper origin's INNATE access base. A `origin.innatePrecursor[]` seeds the
 *  fabricated-substrate keepers (seraphic/abyssal) into `precursorAccess`; `origin.innateLivingCurrent[]`
 *  seeds the living-substrate keeper (rootkin) into `livingCurrentAccess`; `origin.braidAffinity.discount`
 *  stamps the center's braid discount. NOT a grant — it opens ACCESS (the ability still costs a level + a
 *  point to learn, then grows normally); the innate floor + earned growth Erik ruled. Each seeded id is
 *  VALIDATED against the catalog's powerSystem so a mis-authored id can never create a false access.
 *  Idempotent (adds only what's missing) and Law-14-safe. Returns the newly-seeded ability ids. */
export function seedInnateSubstrate(character, originRecord = {}, catalog = {}) {
  character.precursorAccess = character.precursorAccess || [];
  character.livingCurrentAccess = character.livingCurrentAccess || [];
  character.wildCurrentAccess = character.wildCurrentAccess || [];
  const seeded = [];
  const seed = (ids, list, sys) => {
    for (const id of ids || []) {
      if (catalog[id]?.powerSystem === sys && !list.includes(id)) { list.push(id); seeded.push(id); }
    }
  };
  seed(originRecord.innatePrecursor, character.precursorAccess, "precursor");
  seed(originRecord.innateLivingCurrent, character.livingCurrentAccess, "living_current");
  seed(originRecord.wildCurrent, character.wildCurrentAccess, "wild_current"); // SNG-140: the Wild Half (churnfolk/abyssal)
  character.braidDiscount = originRecord.braidAffinity?.discount || 0; // derived; harmless to restamp
  return seeded;
}

/** SNG-227 §3a/§3c: practiced power costs less, but the CHARACTER-LEVEL discount no longer runs away — it is
 *  -1 per TEN levels (was per two), so a skill never bottoms to the floor from level alone (L20 base-8 = 7,
 *  not 4). The FLOOR is now a destination you EARN through the rank discount (-1 per ability rank, from
 *  practice), floored at half the base. So a freshly-learned skill starts near BASE (expensive, §3c) and
 *  audibly cheapens as you master it — energy stays a real resource all game. All three knobs live in
 *  rules.leveling (§4, tunable — rebalance is a JSON edit). */
export function effectiveEnergyCost(abilityDef, character, rules) {
  const base = abilityDef?.energyCost ?? rules.energy?.defaultActionCost ?? 5;
  const lv = rules.leveling || {};
  const owned = (character.abilities || []).find(a => a.abilityId === abilityDef?.id);
  const levelDiscount = Math.floor(((character.level || 1) - 1) / 10) * (lv.energyEfficiencyPerTenLevels ?? 1);
  const rankDiscount = Math.max(0, (owned?.level ?? 1) - 1) * (lv.rankEnergyDiscount ?? 1);
  const floor = Math.max(1, Math.ceil(base * (lv.minEnergyCostFraction ?? 0.5)));
  return Math.max(floor, base - levelDiscount - rankDiscount);
}

/** SNG-105: energy a given recovery restores for THIS character — scaled with the pool so a night's
 *  rest is always ~the same FRACTION of maxEnergy, not a flat amount that shrinks as the pool grows.
 *  `max(flat base, round(fraction × maxEnergy))` — the flat base is a floor, so low levels never get
 *  worse than today; scaling only ever adds. Fractions live in rules.recoveryFractions (tunable). */
export function recoveryEnergy(kind, character, rules) {
  const entry = rules?.recovery?.[kind];
  const base = typeof entry === "number" ? entry : (entry?.energy || 0);
  const frac = rules?.recoveryFractions?.[kind] ?? 0;
  return Math.max(base, Math.round(frac * (character?.maxEnergy || 100)));
}

export function spendSubPoint(character, sub, rules) {
  const cap = rules.leveling?.subAttributeCap ?? 6;
  if (!SUBS.includes(sub) || (character.pendingSubPoints || 0) < 1) return false;
  if (character.subAttributes[sub] >= cap) return false;
  character.subAttributes[sub]++;
  character.pendingSubPoints--;
  syncParentAttributes(character);
  return true;
}

/** Rank up an owned ability (1 skill point, or FREE via practice). Level-gated. */
export function rankUpAbility(character, abilityId, rules, opts = {}) {
  const owned = character.abilities.find(a => a.abilityId === abilityId);
  if (!owned) return { ok: false, why: "not known" };
  const max = rules.leveling?.maxAbilityRank ?? 3;
  if (owned.level >= max) return { ok: false, why: "already mastered" };
  const req = rules.leveling?.rankLevelReq?.[String(owned.level + 1)] ?? 1;
  if (character.level < req) return { ok: false, why: `requires level ${req}` };
  if (owned.level + 1 >= 3 && opts.attributeGates) {
    const g = meetsRank3Gate(character, abilityId, opts.attributeGates);
    if (!g.ok) return { ok: false, why: g.why };
  }
  // SNG-BATCH-5: affordability last — cross-class abilities cost 2x (opts.catalog resolves the class)
  const ab = (opts.catalog || {})[abilityId];
  const cost = opts.viaPractice ? 0 : skillPointCost(ab, character, opts.skillCapacity);
  if (!opts.viaPractice && (character.skillPoints || 0) < cost) return { ok: false, why: cost > 1 ? `costs ${cost} points (cross-class)` : "no points" };
  owned.level++;
  if (!opts.viaPractice) character.skillPoints -= cost;
  return { ok: true, newRank: owned.level, viaPractice: !!opts.viaPractice, cost };
}

// ---------- ability-arch v2: depth is EARNED, not bought ----------

/** Rank 2 (Practiced) lands AUTOMATICALLY the moment an ability has been used enough (and the level
 *  bar is met) — no skill point, no player click. Call after recordUse(). Returns the abilityIds that
 *  advanced this call, so the caller can toast them. Rank 3 is never automatic (see markDefiningMoment):
 *  it is a defining moment the GM marks. A pending branch fork blocks the auto-advance — a fork is a
 *  permanent A-xor-B choice (Law 9), so the player must pick it; the fork chooser then advances. */
export function autoAdvancePracticedRanks(character, rules, opts = {}) {
  const advanced = [];
  for (const owned of character.abilities || []) {
    if (owned.level !== 1) continue;                       // only rank 1 → 2 is automatic
    if (!practicedForRank(character, owned.abilityId, 2, rules)) continue;
    const req = rules.leveling?.rankLevelReq?.["2"] ?? 1;
    if ((character.level || 1) < req) continue;            // the level bar still holds
    if (isForeclosedNative(character, owned.abilityId, opts.catalog, opts.traditionIndex)) continue; // SNG-101: a foreclosed native does not deepen by ordinary means
    if (opts.branchForks && forkPending(character, owned.abilityId, 2, opts.branchForks)) continue;
    owned.level = 2;
    advanced.push(owned.abilityId);
  }
  return advanced;
}

/** Rank 3 (Mastered) — the defining moment. GM-driven only (the markDefiningMoment op), never
 *  automatic. The engine guards it so mastery can never be handed to an unpracticed craft: the
 *  ability must be at rank 2, practiced to the rank-3 use threshold, past its rank3Min attribute gate,
 *  and past the level bar. The GM narrates the breakthrough; the engine decides whether it lands. */
export function markDefiningMoment(character, abilityId, rules, opts = {}) {
  const owned = (character.abilities || []).find(a => a.abilityId === abilityId);
  if (!owned) return { ok: false, why: "not known" };
  const max = rules.leveling?.maxAbilityRank ?? 3;
  if (owned.level >= max) return { ok: false, why: "already mastered" };
  if (owned.level < 2) return { ok: false, why: "not yet practiced — rank 2 comes first" };
  if (isForeclosedNative(character, abilityId, opts.catalog, opts.traditionIndex)) return { ok: false, why: "foreclosed — you chose the other end of this axis; only a braid crosses it now" }; // SNG-101
  if (!practicedForRank(character, abilityId, owned.level + 1, rules)) return { ok: false, why: "not practiced enough for mastery yet" };
  const req = rules.leveling?.rankLevelReq?.[String(owned.level + 1)] ?? 1;
  if ((character.level || 1) < req) return { ok: false, why: `requires level ${req}` };
  if (opts.attributeGates) {
    const g = meetsRank3Gate(character, abilityId, opts.attributeGates);
    if (!g.ok) return { ok: false, why: g.why };
  }
  if (opts.branchForks && forkPending(character, abilityId, owned.level + 1, opts.branchForks)) {
    return { ok: false, why: "fork", forkPending: true }; // caller resolves the fork, then re-calls
  }
  owned.level++;
  return { ok: true, newRank: owned.level };
}

/** SNG-003 access rule: own tradition at face value; valley folk take any system
 *  natively (their flexibility); harmonic/radiant may cross-train into
 *  valley_craft at +crossTraditionLevelPenalty levelReq; the OTHER civilization's
 *  tradition stays closed. Returns effective levelReq, or null if forbidden. */
export function effectiveLevelReq(ab, character, rules) {
  if (!ab) return null;
  const sys = ab.powerSystem, origin = character.origin;
  const base = ab.levelReq || 1;
  if (sys === "learned") return base; // GM-granted, already personal
  if (sys === "precursor") {
    // SNG-011: the Precursor tier is never offered at creation or ordinary
    // level-up — access is unlocked per-ability in fiction (remnant, quest,
    // Old Roads mastery, a teacher). See character.precursorAccess.
    // SNG-131: a substrate-keeper origin (seraphic/abyssal) is SEEDED an innate precursor base at
    // creation, so its `address_sense`/`latticespeak` sit in precursorAccess by right of being what
    // they are — then grow like any skill (level + point). Everyone else still earns it in fiction.
    return (character.precursorAccess || []).includes(ab.id) ? base : null;
  }
  if (sys === "living_current") {
    // SNG-131: the LIVING-substrate parallel — the green current, innate to the life-keepers (rootkin),
    // seeded into livingCurrentAccess at creation. Locked for everyone else exactly like precursor is;
    // access is per-ability (the innate base), then grown by the normal level/point path.
    return (character.livingCurrentAccess || []).includes(ab.id) ? base : null;
  }
  if (sys === "wild_current") {
    // SNG-140: the TANGLED substrate — both currents wild, innate to the Wild Half (churnfolk/abyssal),
    // seeded into wildCurrentAccess at creation. Same per-ability innate-access gate as precursor/living;
    // deeper wild craft opens via unlockSubstrate (SNG-141). The wildness is in the RESOLVER, not the gate.
    return (character.wildCurrentAccess || []).includes(ab.id) ? base : null;
  }
  if (origin === "valley") return base;
  if (sys === origin) return base;
  if (sys === "valley_craft") return base + (rules?.leveling?.crossTraditionLevelPenalty ?? 1);
  return null; // harmonic <-> radiant: closed
}

/** SNG-BATCH-10 Phase 1: the domain gate — enforced in the ENGINE, not just the picker.
 *  Reads the great-circle geometry via domainAccess (traditions.json). Only applies once a
 *  character has crystallized/picked domains; legacy (no domains) stays open. Braid combinations
 *  and artifact grants never route through learnAbility, so those crossings are unaffected. */
export function domainGateFor(ab, character, traditionIndex) { // registry:internal
  // SNG-089: an Accord craft is FREELY ACCESSED — ungated by origin/domain/ring-distance. It still
  // costs a point (base 1); the tuition is the journey to the waygate, not a domain gate.
  if (ab?.accord) return { allowed: true, penalty: 1, band: "accord" };
  if (!traditionIndex || !character?.domains?.primary) return { allowed: true, penalty: 1, band: "open" };
  return domainAccess(ab, ab?.levelReq || 1, character.domains, traditionIndex, domainOpts(character));
}

// ---------- SNG-101: domain promotion (raise a domain's ceiling; foreclose its antipode) ----------

/** Ranks earned in a people (sum of owned ability levels of that tradition). */
function inDomainRanks(character, traditionId, catalog, index) {
  let n = 0;
  for (const o of character.abilities || []) { const ab = catalog?.[o.abilityId]; if (ab && traditionOf(ab, index) === traditionId) n += o.level || 0; }
  return n;
}

/** SNG-101: is a chosen domain eligible for promotion up one station? domainKey ∈ {tertiary, secondary}.
 *  Reads the SNG-100b standing bar + the `promotion` thresholds. Returns {eligible, to, trad, missing[]}.
 *  Never mutates. `opts.catalog` + `opts.traditionIndex` needed for the in-domain-rank / ceiling checks. */
export function promotionEligible(character, domainKey, rules, opts = {}) {
  const trad = character?.domains?.[domainKey];
  const to = domainKey === "tertiary" ? "secondary" : domainKey === "secondary" ? "primary" : null;
  if (!trad || !to) return { eligible: false, to: null, trad: null, missing: ["not a promotable domain"] };
  const p = (rules?.promotion || {})[domainKey === "tertiary" ? "tertiaryToSecondary" : "secondaryToPrimary"] || {};
  const missing = [];
  const { score } = standingWithPeople(character, trad, rules);
  if (score < (p.minReputation ?? 8)) missing.push(`deeper standing with this people (${score}/${p.minReputation ?? 8})`);
  if ((p.requiresTeacher ?? true)) { const t = character?.teachers?.[trad]; if (!(t && t.met && t.willing)) missing.push("a willing teacher of this people"); }
  if (p.minInDomainRanks && inDomainRanks(character, trad, opts.catalog, opts.traditionIndex) < p.minInDomainRanks)
    missing.push(`more of their craft practiced (${inDomainRanks(character, trad, opts.catalog, opts.traditionIndex)}/${p.minInDomainRanks} ranks)`);
  if (p.requiresRegionStanding) { const total = Object.values(character?.regionsKnown || {}).reduce((a, b) => a + b, 0); if (total < (p.minRegionTurns ?? 12)) missing.push("more time spent among their people (region presence)"); }
  if (p.requiresCeilingExhausted && opts.catalog && opts.traditionIndex) {
    const owned = (character.abilities || []).filter(o => { const ab = opts.catalog[o.abilityId]; return ab && traditionOf(ab, opts.traditionIndex) === trad && (ab.levelReq || 1) >= 3; });
    if (!owned.length || owned.some(o => o.level < 2)) missing.push("their Tier-III craft mastered to rank 2 (you've not yet exhausted what secondary allows)");
  }
  return { eligible: missing.length === 0, to, trad, missing };
}

/** SNG-101: apply a promotion. Raises the domain's ceiling and forecloses its antipode. Additive only —
 *  never lowers a ceiling, never strips an ability (Law 14; throws if it would). Callers must have
 *  confirmed via the UI (Law 9) and checked promotionEligible; `opts.force` skips the eligibility re-check
 *  for tests. `opts.traditionIndex` is required to resolve the antipode. */
export function promote(character, domainKey, rules, opts = {}) {
  const trad = character?.domains?.[domainKey];
  const to = domainKey === "tertiary" ? "secondary" : domainKey === "secondary" ? "primary" : null;
  if (!trad || !to) return { ok: false, why: "not a promotable domain" };
  if (!opts.force) { const e = promotionEligible(character, domainKey, rules, opts); if (!e.eligible) return { ok: false, why: e.missing.join("; ") }; }
  const newCeiling = to === "primary" ? 5 : 3;
  character.domainCeilings = character.domainCeilings || {};
  const cur = character.domainCeilings[trad] ?? (domainKey === "tertiary" ? 2 : 3);
  if (newCeiling < cur) throw new Error("SNG-101 Law 14: promotion must never lower a ceiling");
  character.domainCeilings[trad] = Math.max(cur, newCeiling);
  // foreclose the antipode (directional — closes new native learning/ranking; owned ground & braids stay)
  const anti = opts.traditionIndex ? antipodeOf(trad, opts.traditionIndex) : null;
  let foreclosedAntipode = null;
  if (anti) { character.foreclosed = character.foreclosed || []; if (!character.foreclosed.includes(anti)) { character.foreclosed.push(anti); foreclosedAntipode = anti; } }
  return { ok: true, trad, to, newCeiling, foreclosedAntipode };
}

// ---------- SNG-102: domain acquisition (join a new people mid-play, at Tier I) ----------

/** SNG-102: may the character acquire this new tradition as a domain? Every gate must clear: not
 *  already held, not foreclosed, not the closed antipode of primary/secondary, and the SNG-100b
 *  standing bar (willing teacher or tome + reputation ≥ acquisitionThreshold). Pure. {ok, reason}. */
export function acquirable(character, traditionId, rules, opts = {}) {
  const idx = opts.traditionIndex;
  if (!traditionId || !idx?.byId?.[traditionId]) return { ok: false, reason: "not a real people of the circle" };
  const d = character?.domains || {};
  if ([d.primary, d.secondary, d.tertiary, ...(character?.domainsAcquired || [])].includes(traditionId)) return { ok: false, reason: "already a domain you hold" };
  if ((character?.foreclosed || []).includes(traditionId)) return { ok: false, reason: "foreclosed — the far pole of an axis you've chosen; only a braid crosses it" };
  if (traditionId === antipodeOf(d.primary, idx) || (d.secondary && traditionId === antipodeOf(d.secondary, idx)))
    return { ok: false, reason: "the far pole of your own axis — closed-opposite holds; the braid is the only road" };
  const a = rules?.acquisition || {};
  const { score } = standingWithPeople(character, traditionId, rules);
  if (score < (a.minReputation ?? 8)) return { ok: false, reason: `deeper standing with this people (${score}/${a.minReputation ?? 8})` };
  if (a.requiresTeacherOrTome ?? true) {
    const t = character?.teachers?.[traditionId];
    const tome = (character?.tomes || []).includes(traditionId);
    if (!((t && t.met && t.willing) || tome)) return { ok: false, reason: "a willing teacher of this people, or their tome" };
  }
  return { ok: true };
}

/** SNG-102: join a people as a new domain. Enters at Tier I; forecloses the acquired people's antipode
 *  (the same directional foreclosure as promotion). Additive only — pushes a string, sets a ceiling,
 *  appends a foreclosure. Never removes. `opts.force` skips the acquirable re-check (tests/committed UI). */
export function acquireDomain(character, traditionId, rules, opts = {}) {
  if (!opts.force) { const a = acquirable(character, traditionId, rules, opts); if (!a.ok) return { ok: false, why: a.reason }; }
  character.domainsAcquired = character.domainsAcquired || [];
  if (!character.domainsAcquired.includes(traditionId)) character.domainsAcquired.push(traditionId);
  character.domainCeilings = character.domainCeilings || {};
  if (character.domainCeilings[traditionId] == null) character.domainCeilings[traditionId] = rules?.acquisition?.startingCeiling ?? 1;
  const anti = opts.traditionIndex ? antipodeOf(traditionId, opts.traditionIndex) : null;
  let foreclosedAntipode = null;
  if (anti) { character.foreclosed = character.foreclosed || []; if (!character.foreclosed.includes(anti)) { character.foreclosed.push(anti); foreclosedAntipode = anti; } }
  return { ok: true, traditionId, foreclosedAntipode };
}

/** SNG-101: the additive per-character access state domainAccess consults (all absent-tolerant). */
export function domainOpts(character) { // registry:internal
  return { foreclosed: character?.foreclosed, domainCeilings: character?.domainCeilings, domainsAcquired: character?.domainsAcquired };
}

/** SNG-101: is this OWNED ability a NATIVE of a foreclosed antipode (so it must not rank up by ordinary
 *  means)? Braids (nativeOrCombination === "combination") are exempt — the road across the axis. */
function isForeclosedNative(character, abilityId, catalog, index) {
  const set = character?.foreclosed;
  if (!set || !set.length || !catalog || !index) return false;
  const ab = catalog[abilityId];
  if (!ab || ab.nativeOrCombination === "combination") return false;
  const trad = traditionOf(ab, index);
  return !!(trad && set.includes(trad));
}

/** SNG-100b: the capstone standing bar the accessGates fiction (SNG-049/050) always described but no
 *  code enforced — "rank IV–V of a pole-tradition requires deep standing: a willing teacher + earned
 *  reputation with that people. Greatness is taught, not bought." Below the capstone tier there is no
 *  bar. SNG-101 promotion / SNG-102 acquisition reuse this with their own thresholds via opts
 *  (`force` applies the bar regardless of tier; `threshold`/`requiresTeacher` override the defaults).
 *  Returns {ok, why}. */
export function meetsStandingBar(character, traditionId, tier, rules, opts = {}) {
  const g = rules?.capstoneStanding || {};
  const T = Number(tier) || 1;
  if (!opts.force && T < (g.capstoneTier ?? 4)) return { ok: true }; // entry/mid tiers stand open
  if (!traditionId) return { ok: true };
  const threshold = opts.threshold ?? g.capstoneThreshold ?? 10;
  const requiresTeacher = opts.requiresTeacher ?? g.requiresTeacher ?? true;
  const { score } = standingWithPeople(character, traditionId, rules);
  if (score < threshold) return { ok: false, why: `deep standing with this people is not yet earned (standing ${score} of ${threshold})` };
  // SNG-126: a willing teacher can be the durable `teachers[trad]` (markTeacher, met-once) OR a TRAINER
  // travelling in your company right now (their presence sets the gate; part ways and it closes for tiers
  // not yet taken — Law 14 keeps what's already learned). One gate, two ways to satisfy it — no fork.
  const t = character?.teachers?.[traditionId];
  const companyTrainer = trainerFor(character).has(traditionId);
  if (requiresTeacher && !((t && t.met && t.willing) || companyTrainer)) return { ok: false, why: "greatness is taught, not bought — a willing teacher of this people is required for its capstones" };
  return { ok: true };
}

/** SNG-218 §1: THE SINGLE LEARN GATE. Run EVERY learn-gate term (access/level, domain, attribute, the
 *  capstone STANDING bar, capacity, affordability) and return {ok, why, gate?, cost, band, free} WITHOUT
 *  mutating. `learnAbility` performs this exact check before it writes, and the level-up UI reads it for
 *  the wheel's `reachable` flag and the Learn button — so suggestion, highlight and button can never
 *  disagree with the real gate again (the Cut-Thread bug: `reachable` checked level but not standing, so a
 *  standing-locked capstone read learnable). `gate` tags WHY it's blocked ('standing' → aspirational/"later",
 *  'capacity'/'cost'/'level'/'domain' → other) so the UI can render the reason without re-deriving it. */
export function canLearnAbility(character, abilityId, catalog, rules, opts = {}) {
  if ((character.abilities || []).some(a => a.abilityId === abilityId)) return { ok: false, why: "already known", gate: "owned" };
  const ab = catalog[abilityId];
  if (!ab) return { ok: false, why: "unknown ability", gate: "unknown" };
  // SNG-094: the DOMAIN gate (SNG-055) is authoritative for a character with domains — the legacy
  // effectiveLevelReq gates by `powerSystem === origin`, which returns null for every 24-tradition
  // ability whose powerSystem is an axis-file name (e.g. "reach_death_life"), so a native Ashwarden
  // could not learn their OWN people's craft at level-up. Here the domain gate decides access and the
  // ability's own levelReq is the level bar. Precursor keeps its per-ability fiction gate; accord open.
  const idx = opts.traditionIndex;
  // SNG-131: precursor AND living_current are per-ability innate-access systems (seeded by origin, then
  // grown) — both route to effectiveLevelReq's access gate, NOT the domain gate (else any rootkin-domain
  // character could learn the living current, defeating "innate to the people").
  const innateAccess = ab.powerSystem === "precursor" || ab.powerSystem === "living_current" || ab.powerSystem === "wild_current";
  const req = ab.accord ? (ab.levelReq || 1)
    : innateAccess ? effectiveLevelReq(ab, character, rules)
    : (character?.domains?.primary && idx) ? (domainGateFor(ab, character, idx).allowed ? (ab.levelReq || 1) : null)
    : effectiveLevelReq(ab, character, rules);
  if (req === null) return { ok: false, why: character?.domains?.primary ? "outside your domains" : "wrong tradition", gate: "domain" };
  if (character.level < req) return { ok: false, why: `requires level ${req}${req !== (ab.levelReq || 1) ? " (cross-training)" : ""}`, gate: "level" };
  // SNG-BATCH-10: the great-circle domain gate — antipode closed, tier caps, capstone rule.
  const verdict = domainGateFor(ab, character, opts.traditionIndex);
  if (!verdict.allowed) return { ok: false, why: verdict.reason || "outside your domains", gate: "domain" };
  if (opts.attributeGates) {
    const g = meetsLearnGate(character, abilityId, opts.attributeGates);
    if (!g.ok) return { ok: false, why: g.why, gate: "attribute" };
  }
  // SNG-100b: the capstone standing bar — Tier IV–V of a pole-tradition additionally requires deep
  // standing with that people (willing teacher + earned reputation). This finally ENFORCES the
  // accessGates capstone rule (SNG-049/050) that shipped as fiction only. Folk/learned/precursor and
  // sub-capstone tiers pass untouched; the domain gate above still owns antipode/tier/closed-opposite.
  if (idx && (ab.levelReq || 1) >= (rules?.capstoneStanding?.capstoneTier ?? 4)) {
    const trad = traditionOf(ab, idx);
    if (trad && !isFolkTradition(trad, idx)) {
      const bar = meetsStandingBar(character, trad, ab.levelReq || 1, rules);
      if (!bar.ok) return { ok: false, why: bar.why, gate: "standing" }; // aspirational — deepen standing to open it
    }
  }
  if (opts.skillCapacity && ab.powerSystem !== "learned" && atCapacity(character, opts.skillCapacity)) {
    return { ok: false, why: "at skill capacity — deepen an owned skill instead of learning a new one", gate: "capacity" };
  }
  // Affordability last. When domains are set, the ring-distance penalty is the cost multiplier
  // (supersedes the legacy home-class 2x); otherwise fall back to the legacy cross-class cost.
  // SNG-131: the center's braidAffinity — a cross-pole BRAID (a reach_* diameter-line) costs `braidDiscount`
  // less for valleyfolk (the one people who can braid the poles), floored at 1 (never free).
  const braidCut = (character.braidDiscount && String(ab.powerSystem || "").startsWith("reach_")) ? character.braidDiscount : 0;
  const cost = opts.free ? 0
    : Math.max(1, ((opts.traditionIndex && character?.domains?.primary) ? (verdict.penalty || 1) : skillPointCost(ab, character, opts.skillCapacity)) - braidCut);
  if (!opts.free && (character.skillPoints || 0) < cost) return { ok: false, why: cost > 1 ? `costs ${cost} points (${verdict.band === "far" ? "distant domain" : "cross-class"})` : "no points", gate: "cost", cost, band: verdict.band };
  return { ok: true, free: !!opts.free, cost, band: verdict.band };
}

/** Learn a new ability (1 skill point). Every gate lives in canLearnAbility (§1 single source); this
 *  runs it, and only on `ok` does it mutate — so a UI check and the real write can never diverge. */
export function learnAbility(character, abilityId, catalog, rules, opts = {}) {
  const check = canLearnAbility(character, abilityId, catalog, rules, opts);
  if (!check.ok) return check;
  character.abilities.push({ abilityId, level: 1 });
  if (!opts.free) character.skillPoints = (character.skillPoints || 0) - check.cost;
  return { ok: true, free: check.free, cost: check.cost, band: check.band };
}

// ---------- GM-generated abilities (earned in fiction, clamped by engine) ----------

/** Validate a GM-proposed new ability. Returns a safe def or null. */
export function sanitizeNewAbility(raw) {
  if (!raw || !raw.name || !raw.description) return null;
  const id = slugify(raw.id || raw.name);
  if (!id) return null;
  const axes = {};
  for (const [k, v] of Object.entries(raw.axes || {}).slice(0, 3)) {
    const n = Number(v);
    if (Number.isFinite(n)) axes[String(k)] = Math.max(-1, Math.min(1, n));
  }
  return {
    id,
    name: String(raw.name).slice(0, 60),
    description: smartClamp(String(raw.description), 400), // SNG-152
    energyCost: Math.max(4, Math.min(15, Number(raw.energyCost) || 8)),
    attribute: ["physical", "mental", "social", "practical"].includes(raw.attribute) ? raw.attribute : "practical",
    axes,
    notFor: raw.notFor ? smartClamp(String(raw.notFor), 240) : "Anything beyond its described envelope.", // SNG-152
    narrationHints: smartClamp(String(raw.description), 200), // SNG-152
    levelReq: 1,
    powerSystem: "learned",
    taughtBy: raw.taughtBy ? String(raw.taughtBy).slice(0, 60) : null,
    effectTags: []
  };
}

/** Grant a new ability the fiction earned. Capped: floor(level/2)+1 learned
 *  abilities total, no duplicates of anything known. */
export function applyNewAbility(character, def, rules) {
  if (!def) return { ok: false, why: "invalid" };
  character.customAbilities = character.customAbilities || {};
  const cap = Math.floor((character.level || 1) / 2) + 1;
  if (Object.keys(character.customAbilities).length >= cap) return { ok: false, why: "learned-ability cap for this level" };
  if (character.customAbilities[def.id] || (character.abilities || []).some(a => a.abilityId === def.id)) return { ok: false, why: "already known" };
  character.customAbilities[def.id] = def;
  character.abilities.push({ abilityId: def.id, level: 1 });
  return { ok: true };
}

// ---------- novel use & discoveries ----------

export function discoveryKey(abilityIds = [], noveltyHint = "") {
  return [...abilityIds].sort().join("+") + (noveltyHint ? ":" + slugify(noveltyHint).slice(0, 24) : "");
}

/** If the character already discovered this technique, return it (novelty is
 *  no longer novel — it's earned skill, with a standing bonus). */
export function knownDiscovery(character, abilityIds, noveltyHint = "") {
  const key = discoveryKey(abilityIds, noveltyHint);
  return (character.discoveries || []).find(d => d.key === key) ||
         (character.discoveries || []).find(d => d.abilities.length > 1 && d.abilities.slice().sort().join("+") === [...abilityIds].sort().join("+")) || null;
}

/** Record a freshly minted technique (only ever called after a validated
 *  crit-success on a novel/combo action). */
export function recordDiscovery(character, { name, description, abilityIds, noveltyHint, day }) {
  character.discoveries = character.discoveries || [];
  const key = discoveryKey(abilityIds, noveltyHint);
  if (character.discoveries.some(d => d.key === key)) return null;
  const d = {
    key,
    id: slugify(name),
    name: String(name).slice(0, 60),
    description: smartClamp(String(description || ""), 300), // SNG-152
    abilities: abilityIds,
    discoveredDay: day ?? null
  };
  character.discoveries.push(d);
  return d;
}

/** Engine-applied backlash for a crit-failed novel/combo attempt. Returns what happened. */
export function applyBacklash(character, rules) {
  const hp = rules.novel?.backlashHealth ?? 4;
  const en = rules.novel?.backlashEnergy ?? 10;
  character.health = Math.max(0, character.health - hp);
  character.energy = Math.max(0, character.energy - en);
  return { health: -hp, energy: -en };
}

/** Ability detail block for the GM: exactly what each rank grants, what it cannot
 *  do, what it's not for — plus earned techniques. This is the GM's law for powers. */
/** SNG-089: how a craft harms, in words the GM can narrate to. "Can fight" ≠ "can harm" — an
 *  incapacitating craft STOPS a threat without wounding it; a `none` craft (Stillhold peace-working)
 *  wounds nothing at all. Feeding this stops the GM inventing a wound a craft cannot cause. */
export function harmRungGloss(rung) { // registry:internal
  switch (rung) {
    case "lethal": return "this craft CAN end a life — in its own idiom (never a generic wound); narrate a real death when the fiction earns it";
    case "damaging": return "this craft WOUNDS but does not slay — a weakened thing is still a thing; it hurts, it does not kill";
    case "incapacitating": return "this craft STOPS a threat; it does not wound it — bind, hold, turn aside, unmake the footing; never a cut or a break";
    case "none": return "this craft HARMS NOTHING — it works through peace, making, or reading; NEVER invent a wound from it. If the foe cannot be turned this way, they run, borrow, or take up a weapon like anyone else";
    default: return String(rung);
  }
}

export function abilitiesForGM(character, catalog, branchForks = null, rules = {}) {
  const lines = [];
  for (const owned of character.abilities || []) {
    const ab = catalog[owned.abilityId];
    if (!ab) continue;
    // SNG-BATCH-5: a chosen fork path REPLACES the linear rank expression for the GM too
    const rank = (branchForks && rankExpression(character, ab, owned.level, branchForks)) || ab.tree?.find(t => t.rank === owned.level);
    // SNG-103: show the character's EFFECTIVE energy cost (level+rank discount), not the raw base — the GM
    // was fed the base and repeatedly "corrected" the correct discounted sheet. Show the base too when it
    // differs so the GM understands the lower number is by design and never re-flags it.
    const eff = effectiveEnergyCost(ab, character, rules);
    const energyStr = eff < ab.energyCost ? `${eff} energy — base ${ab.energyCost}, discounted by level+rank` : `${ab.energyCost} energy`;
    lines.push(`### ${ab.name} — rank ${owned.level}${rank ? ` "${rank.name}"${rank.forked ? " (specialized fork)" : ""}` : ""} (${energyStr})` +
      (rank ? `\nCAN: ${rank.grants}\nCANNOT (at this rank): ${rank.cannot}` : `\n${ab.description}`) +
      (ab.notFor ? `\nNOT FOR: ${ab.notFor}` : "") +
      (ab.harmRung ? `\nHARM: ${harmRungGloss(ab.harmRung)}` : ""));
  }
  for (const d of character.discoveries || []) {
    lines.push(`### ✦ Discovered technique: ${d.name}\n${d.description} (combines: ${d.abilities.join(" + ")}; earned through play — no novelty penalty, +bonus)`);
  }
  return lines.length ? lines.join("\n\n") : null;
}
