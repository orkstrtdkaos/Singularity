// npcs.js — NPC permanence. Every person the character meets — authored in content
// packs OR invented by the GM mid-scene — gets a durable registry entry: who they
// are, where you met, what has passed between you, what they've experienced, what
// they can do. The GM proposes typed npcUpdates; the engine applies them clamped.
// The registry is fed back every turn so people stay THE SAME PEOPLE.
// (Offscreen NPC evolution — them growing while you're away — is world-tick work, v0.4.)

import { slugify } from "./quests.js";
import { smartClamp, normName } from "./namematch.js"; // SNG-152: model prose clamps on a word boundary, never mid-word
import { isMinorSubject } from "./art.js";
import { applyCodexUpdates } from "./codex.js"; // SNG-199 §5: meeting someone MUST write the codex — direct, never injected
import { recordDeed, renownHeardAt } from "./reputation.js";   // CCODE-85: an NPC keeps a record the same way the player does
import { personName, mintedWants, nameOf } from "./names.js";   // SNG-431 §1: the ONE namer — the GM path is one of the three that calls it

/** SNG-190 §2: a generateRequest:npc in the SAME turn as an op:"meet" for that person is ONE person.
 *  Both ops are mandatory by the contract (rule 14 + the generateRequest rule) and nothing reconciled
 *  them, so Silas's mother was minted twice — a stub `silas-mother` from the meet AND `Hesta Vorn` from
 *  the generation — at the campaign's most load-bearing moment. This re-homes the freshly generated
 *  record onto the MET id so two ids never survive: the meet made the stub, the generation gives it a
 *  face and a real name, and every op that already referenced the met id keeps working. Matches by the
 *  request hint NAMING the met person (the model references who it just met). Mutates character; returns
 *  the id the record now lives under (the met id when merged, else its own). Pure but for that mutation. */
export function reconcileGeneratedNpcWithMeet(character, npcUpdates, req, rec) {
  if (!rec?.id || !character?.npcRegistry) return rec?.id;
  const hint = normName(`${req?.hint || ""} ${req?.name || ""}`);
  // CCODE-24: applyNpcUpdates stored the meet stub under slugify(u.npcId) (defensive — the model deviates from
  // the kebab contract). Look it up the SAME way, or a non-kebab npcId (Uppercase/underscore/space) misses the
  // stub and the same person double-mints (the SNG-190 recurrence). kebab ids slugify to themselves — no change.
  const meet = (npcUpdates || []).find(u => u?.op === "meet" && u.npcId && u.name
    && character.npcRegistry[slugify(u.npcId)] && !character.npcRegistry[slugify(u.npcId)]._filledFromGenerate
    && (() => { const n = normName(u.name); return n.length > 2 && hint.includes(n); })());
  if (!meet) return rec.id;
  const metId = slugify(meet.npcId);
  if (canonNpcId(metId) === canonNpcId(rec.id)) return rec.id;
  const oldId = rec.id;
  if (character.generated?.npc) { delete character.generated.npc[oldId]; }   // drop the second id generate() persisted
  rec.id = metId;
  if (character.generated?.npc) character.generated.npc[rec.id] = rec;       // re-home under the met id
  const stub = character.npcRegistry[metId];
  stub.name = rec.name; stub._filledFromGenerate = true; stub._mergedFrom = oldId; // the stub becomes the person
  for (const k of ["domains", "domainsSource", "people", "peopleSource", "appearance", "gender", "role"]) if (rec[k] != null && stub[k] == null) stub[k] = rec[k];
  return rec.id;
}

// SNG-333 — DUNBAR'S NUMBER. Erik: "150 known relationships." It was 40, and 40 is not a social circle;
// it is the number of people you meet in a long afternoon. The cap is now the one number anthropology
// actually offers for "people you can hold a relationship with", which is a far better answer than a
// round number picked to bound an array.
export const REGISTRY_CAP = 150; // SNG-199/205: shared with the reconcile registry-backfill — one cap, one home
const CAPS = { registry: REGISTRY_CAP, history: 10, knownFacts: 8, skills: 6 };

export function kinFact(n) {
  if (!n || !n.kin) return null;
  const who = n.name || n.id;
  if (!who) return null;
  const rel = String(n.relationship || n.role || "").trim();
  if (n.kin === "sworn") return `${who} is sworn to you — a bond you both chose.`;
  return rel ? `${who} is family — ${rel}.` : `${who} is family.`;
}

/** SNG-333 — WHO GOES WHEN THE CIRCLE IS FULL.
 *
 *  Erik's rule, exactly: insertion order by default, and meeting someone again protects them. So the
 *  candidate is the LEAST-MET person, oldest-first among equals — which means everyone you met once is
 *  spent before anyone you met twice, and a person you keep running into is effectively permanent.
 *
 *  ⛔ KIN ARE NEVER CANDIDATES. Erik: "ones that tie to people should be saved as facts — like my
 *  player's mother, or Pell's father." Someone who is somebody's family is not an acquaintance the
 *  circle can afford to forget, whatever the arithmetic says. Returns null when everyone is protected,
 *  and the caller then refuses the newcomer rather than dropping a relative.
 *
 *  Pure over the registry. */
/** SNG-334 — THE SENTENCE A KIN TIE IS WORTH, or null if this person is not kin.
 *
 *  Erik's examples are the shape: "my player's mother", "Pell's father". A relation is a fact ABOUT THE
 *  WORLD, not a warmth score — it stays true when the score cools, when they leave, and after they die.
 *  The caller pins it (`facts.pinFact`), which is what makes it survive both the fact budget and the
 *  Dunbar circle.
 *
 *  ⛔ IT READS ONLY WHAT IS RECORDED and invents no relation — if the GM never said HOW they are kin, the
 *  fact says they are kin and nothing more. Naming someone's mother when the fiction only said "family"
 *  would be the engine writing canon, which is the one thing it must not do. */
export function evictionCandidate(reg = {}) {
  const rows = Object.values(reg).filter(n => n && n.id && !n.kin && !n.isKin);
  if (!rows.length) return null;
  rows.sort((a, b) => {
    const am = Number(a.met) || 0, bm = Number(b.met) || 0;
    if (am !== bm) return am - bm;                                   // least-met first
    return (a.firstMet?.day ?? 0) - (b.firstMet?.day ?? 0);          // then oldest-known first
  });
  return rows[0].id;
}

// SNG-108: relationship KIND + arc, orthogonal to the −10..+10 score. The score is INTENSITY; the
// bondType is the NATURE of the bond; a romantic bond additionally carries a growth STAGE tended by
// play (courting → together → committed → partner). Stage is set by GM op on a real relational beat,
// never auto-inferred, never leaping past what the score supports, and never romantic for a minor.
export const BOND_TYPES = ["platonic", "mentor", "student", "rival", "family", "romantic", "sworn"];
export const ROMANTIC_STAGES = ["courting", "together", "committed", "partner"];
const DEFAULT_STAGE_FLOORS = { courting: 2, together: 4, committed: 6, partner: 8 };

/** Fuzzy-find an existing person before ever creating a new one — the GM refers
 *  to the same human as "davan", "davan-channel-worker", or "Davan" across turns. */
export function findExistingNpc(reg, id, name = "") {
  if (reg[id]) return reg[id];
  const nameNorm = slugify(name);
  for (const n of Object.values(reg)) {
    if (nameNorm && slugify(n.name) === nameNorm) return n;
    // SNG-199: this module MAINTAINS `aliases` across five write sites (a renamed or re-revealed person
    // keeps their prior names) — but the matcher never READ them, so a person met again under a name the
    // registry already knew as an alias forked a second record. Match the alias ledger that was being
    // written all along. Exact slug-match only (an explicit prior name), never a lexical loosening.
    if (nameNorm && (n.aliases || []).some(a => slugify(a) === nameNorm)) return n;
    // CCODE-20: a registry entry can LACK an `id` — a quest/hunt-effect giver stub (quests.js writes
    // {name, questState} with no id). findExistingNpc runs on EVERY npcUpdate, so one id-less stub threw
    // `n.id.split(...)` and aborted the whole meet — poisoning every SUBSEQUENT person too (no name ever
    // stuck: the GM re-introduced the same character under a fresh name each turn). An id-less entry can't
    // match by id-prefix anyway (its name was already tried above), so guard both sides and skip it here.
    if (!n.id || !id) continue;
    // CCODE-24: bridge the `_` ↔ `-` id-convention gap. A quest/hunt-effect giver stub keys the registry by the
    // RAW content id (keeper_ilma — quests.js deliberately never slugifies content ids); a MEET keys by
    // slugify (keeper-ilma). Without a normalized compare the same person forks into two registry entries
    // (verified live in a real save), and the ally/questState marker strands on the orphan. Treat `_`≡`-`.
    if (canonNpcId(n.id) === canonNpcId(id)) return n;
    const a = n.id.split("-")[0], b = id.split("-")[0];
    if (a === b && (n.id.startsWith(id) || id.startsWith(n.id) || a === id || b === n.id)) return n;
  }
  return null;
}

// CCODE-24: the ONE canonical form for comparing NPC ids across the `_` (content-id) and `-` (slugify)
// conventions — so the registry write paths (applyNpcUpdates slugify, quest-effect raw underscore,
// reconcileGeneratedNpcWithMeet raw npcId) can never fork the same person by keying differently. Module-local:
// the reads normalize; the write sites keep their own convention (quests.js deliberately keeps content ids).
const canonNpcId = x => String(x || "").toLowerCase().replace(/_/g, "-");

/** Names that are really ids ("davan_channel_worker", "millbrook.elder_woman")
 *  become readable ("Davan Channel Worker", "Elder Woman"). */
export function prettifyNpcName(name, dropTokens = []) {
  let raw = String(name || "").trim();
  // SNG-199: a descriptive CLAUSE is not a name. "Siol — Elven traveler at the Hub plaza, tall, pale
  // coat, bir" reached the name field and this function — a slug-prettifier standing where a VALIDATOR
  // should be — passed it straight through because it had a capital and no ._ , then a raw slice cut it
  // mid-word. A name is a few words, not a sentence: when the input carries a clause break (comma,
  // semicolon, a spaced dash) or runs long, keep only the leading name segment, and always clamp on a
  // word boundary (smartClamp), never a raw mid-word cut.
  if (/[,;]|\s[—–-]\s/.test(raw) || raw.split(/\s+/).length > 5) {
    raw = raw.split(/\s*[,;]\s*|\s+[—–-]\s+/)[0].split(/\s+/).slice(0, 4).join(" ").trim();
  }
  if (!/[._]/.test(raw) && /[A-Z]/.test(raw)) return smartClamp(raw, 60); // already human-shaped
  const words = raw.split(/[._\-\s]+/).filter(w => w && !dropTokens.includes(w.toLowerCase()));
  if (!words.length) return smartClamp(raw, 60);
  return smartClamp(words.map(w => w[0].toUpperCase() + w.slice(1)).join(" "), 60);
}

/** ⛔ R24 (ERIK 2026-09-01) — THE ROMANCE GATE. "You can't romance until you know the sex… If there is no
 *  sex it's not romanceable."
 *
 *  ⚠️ ABSENCE IS A HARD EXCLUSION, NOT A MISSING VALUE TO BE FILLED IN LATER. That is the whole safety
 *  property: a companion who is a constellation of motes has no sex, and is therefore non-romanceable
 *  with nothing authored to exclude them. ⛔ The gate NEVER infers one (SNG-143) and never falls back to
 *  `gender` — gender is how a person presents, it is player-correctable, and correcting a RENDERING must
 *  not quietly change who may be romanced.
 *
 *  Three things must all hold, and each answers a different question:
 *    `sex`             — is there one at all? (R24)
 *    `romanceEligible` — has the person been opted IN? (Aevi's authoring; absent ⇒ no)
 *    not a minor       — the existing `_gen.romanceEligible === false` marker (generate.js:450)
 *
 *  Returns { ok, why } so a refusal can be shown rather than a person silently vanishing from a list. */
export function romanceable(person) {
  if (!person) return { ok: false, why: "no one" };
  const sex = person.sex == null ? null : String(person.sex).trim().toLowerCase();
  if (!sex) return { ok: false, why: "their sex was never set — R24 excludes rather than guesses" };
  if (sex === "none") return { ok: false, why: "they have no sex; this is an answer, not a blank" };
  // ⚠️ THE MINOR MARKER IS ALREADY WRITTEN AT GENERATION and is a REFUSAL, never a permission —
  // `_gen.romanceEligible === false` means minor. Its absence says nothing either way.
  if (person._gen && person._gen.romanceEligible === false) return { ok: false, why: "not an adult" };
  if (person.romanceEligible !== true) return { ok: false, why: "not open to romance" };
  return { ok: true, why: null };
}
export function applyNpcUpdates(character, updates = [], ctx = {}) {
  character.npcRegistry = character.npcRegistry || {};
  const reg = character.npcRegistry;
  for (const u of (updates || []).slice(0, 5)) {
    const id = u.npcId ? slugify(u.npcId) : slugify(u.name || "");
    if (!id) continue;
    let n = findExistingNpc(reg, id, u.name || "");
    if (!n) {
      // only a "meet" may create a person; updates for unknown people are dropped
      // (this is what let the legacy path spawn duplicate id-named entries)
      if (u.op && u.op !== "meet") continue;
      // SNG-333 — ⛔ EVICT, DO NOT REFUSE. This used to `continue`, so once you knew 40 people you could
      // never meet anyone again — the comment said "keep the people who matter" while the actual rule was
      // insertion order, which is not the same thing and is not what anybody wants.
      //
      // Erik's rule: insertion order as the DEFAULT, but a second meeting protects you. So the person who
      // goes is the least-met, oldest-first among equals — and anyone you have met more than once outlives
      // everyone you met exactly once. ⛔ KIN ARE NEVER EVICTED: a tie is saved as a FACT (SNG-334) and the
      // person it names is not a passing acquaintance.
      if (Object.keys(reg).length >= CAPS.registry) {
        const goner = evictionCandidate(reg);
        if (!goner) continue;                  // everyone left is protected — refuse rather than drop kin
        delete reg[goner];
      }
      // ⛔ SNG-431 §1 — THE GM PATH GOES THROUGH THE NAMER. It wrote whatever the model put in the field,
      // and the model writes disclaimers: "Boy (name unknown)", "Unknown farmer", "Unknown (east bank
      // traveler)". `prettifyNpcName` is a slug-prettifier standing where a validator should be — it passes
      // those straight through because they have a capital and no `._`.
      //
      // ⚠️ AND AN UNNAMED PERSON IS LEGITIMATE (Aevi). So this does NOT invent a name — inventing one for
      // someone the fiction deliberately left anonymous is worse than the disclaimer. It keeps the
      // DESCRIPTIVE words as a label and sets `nameUnknown`, which `nameOf` in names.js has read since
      // SNG-111 and which nothing has ever written: a reader with no writer, closed here. `setNpcName`
      // still overwrites the label the moment the player learns the real name.
      const first = personName({ proposed: prettifyNpcName(String(u.name || id)), role: u.role, max: 60 });
      n = reg[id] = {
        id,
        name: first.name,
        nameUnknown: first.nameUnknown || undefined,
        role: String(u.role || "").slice(0, 100),
        description: smartClamp(String(u.description || ""), 600), // SNG-152: model prose — word boundary, generous
        firstMet: { locationId: ctx.locationId || null, day: ctx.day ?? null },
        relationship: 0,
        history: [],
        knownFacts: [],
        skillsObserved: [],
        status: "active",
        // ⛔ R24 (ERIK 2026-09-01) — SEX IS SET AT GENERATION, AND IT IS NOT `gender`.
        //   "You can't romance until you know the sex, so rather than leave sex runtime determined it
        //   needs to be SET upon PC/NPC generation. If there is no sex it's not romanceable."
        //
        // ⚠️ TWO FIELDS, TWO JOBS, AND THEY MUST NOT COLLAPSE INTO ONE:
        //   `sex`     — set once, here, at mint. CANONICAL. The romance gate reads this and nothing else.
        //   `gender`/`pronouns` — how a person presents and is addressed. The GM writes them, the player
        //   corrects them (correctNpcGender), and they gate NOTHING.
        //
        // ✅ Keeping them apart is what lets a person present differently from how they were generated,
        // and it means correcting a RENDERING never silently changes who may be romanced.
        // ⛔ NEVER INFERRED (SNG-143). Absent stays absent — and absent is a HARD EXCLUSION, which is the
        // right value for a being that HAS no sex, not an omission waiting to be filled in.
        sex: u.sex ? String(u.sex).slice(0, 40) : null,
        gender: u.gender ? String(u.gender).slice(0, 40) : null,       // SNG-143: sex/gender is explicit DATA, captured the first time they appear (never inferred at render)
        pronouns: u.pronouns ? String(u.pronouns).slice(0, 40) : null
      };
      // SNG-199 §5: meeting a person WRITES THE CODEX — the one mandatory mirror. Before this, the
      // codex was populated only by the GM volunteering codexUpdates (L2 permission-isn't-initiative),
      // so it reliably recorded what people did while the player was AWAY and unreliably recorded that
      // they MET them. Direct call, not injected — an optional dep a caller forgets is this bug reborn.
      // Once per person (create only, not every update); resolveTopic dedupes; the 60-topic cap holds
      // inside applyCodexUpdates. GM codexUpdates stay the channel for everything INTERESTING; this is
      // the floor for everything factual.
      try {
        applyCodexUpdates(character, [{ entityId: id, label: n.name, kind: "person", fact: n.role || "met in play" }], { day: ctx.day ?? null });
      } catch { /* the codex is a mirror — never let it break the meet */ }
    }
    // updates are additive/evolving — never silently rewrite identity
    // SNG-431 §1: the same namer on the fill-in-a-blank path. A second writer spelling its own rule is how
    // the create path and the update path drift apart.
    if (u.name && !n.name) {
      const late = personName({ proposed: String(u.name), role: u.role || n.role, max: 60 });
      n.name = late.name;
      if (late.nameUnknown) n.nameUnknown = true;
    }
    if (u.role) n.role = String(u.role).slice(0, 100);
    if (u.description && !n.description) n.description = smartClamp(String(u.description), 600); // SNG-152
    if (u.gender && !n.gender) n.gender = String(u.gender).slice(0, 40);       // SNG-143: fill it the first time the GM records it
    if (u.pronouns && !n.pronouns) n.pronouns = String(u.pronouns).slice(0, 40);
    if (u.revealName) {
      const newName = prettifyNpcName(String(u.revealName).slice(0, 60));
      const curTokens = new Set(String(n.name || "").toLowerCase().split(/\s+/).filter(Boolean));
      const newTokens = String(newName || "").toLowerCase().split(/\s+/).filter(Boolean);
      // SNG-111: a fuller name that CONTAINS the known one ("Pell Marsh" when we know "Pell") is a surname
      // EXTENSION — compose it, don't shunt it to aliases and lose the composition.
      const isExtension = n.nameRevealed && newName && newName !== n.name && curTokens.size && newTokens.length > curTokens.size && [...curTokens].every(t => newTokens.includes(t));
      if (!n.nameRevealed && newName && newName !== n.name) {
        n.aliases = [...(n.aliases || []), n.name].slice(-4);
        n.history = [...n.history, `[d${ctx.day ?? "?"}] Their name is revealed: ${newName} (was known as "${n.name}")`].slice(-CAPS.history);
        n.name = newName;
        n.nameRevealed = true;
        delete n.nameUnknown;   // SNG-431: the label was standing in for a name they now have
      } else if (isExtension) {
        n.aliases = [...new Set([...(n.aliases || []), n.name])].slice(-4); // keep the given name for match continuity
        n.history = [...n.history, `[d${ctx.day ?? "?"}] You learn more of their name — ${newName}`].slice(-CAPS.history);
        n.name = newName;
      } else if (n.nameRevealed && newName && newName !== n.name && !(n.aliases || []).includes(newName)) {
        n.aliases = [...(n.aliases || []), newName].slice(-4); // a genuinely different later name → alias
      }
    }
    // SNG-111: learn MORE of a known name — append only the new token(s) ("Pell" + "Marsh" → "Pell Marsh").
    // Idempotent (learning "Marsh" twice doesn't double it); keeps the given name as an alias.
    if (u.nameExtend && n.name) {
      const have = new Set(String(n.name).toLowerCase().split(/\s+/).filter(Boolean));
      const add = prettifyNpcName(String(u.nameExtend).slice(0, 60)).split(/\s+/).filter(t => t && !have.has(t.toLowerCase()));
      if (add.length) {
        const composed = `${n.name} ${add.join(" ")}`.slice(0, 60).trim();
        n.aliases = [...new Set([...(n.aliases || []), n.name])].slice(-4);
        n.history = [...n.history, `[d${ctx.day ?? "?"}] You learn more of their name: ${add.join(" ")} — ${composed}`].slice(-CAPS.history);
        n.name = composed;
        n.nameRevealed = true;
      }
    }
    if (u.note) n.history = [...n.history, `[d${ctx.day ?? "?"}] ${smartClamp(String(u.note), 300)}`].slice(-CAPS.history); // SNG-152: high-cardinality (many NPCs x notes, all in the prompt) — 300, not 600
    if (u.learned) {
      const facts = Array.isArray(u.learned) ? u.learned : [u.learned];
      for (const f of facts.slice(0, 3)) {
        const fact = smartClamp(String(f), 200); // SNG-152
        if (!n.knownFacts.includes(fact)) n.knownFacts = [...n.knownFacts, fact].slice(-CAPS.knownFacts);
      }
    }
    if (u.skillsObserved) {
      const skills = Array.isArray(u.skillsObserved) ? u.skillsObserved : [u.skillsObserved];
      for (const s of skills.slice(0, 3)) {
        const skill = String(s).slice(0, 60);
        if (!n.skillsObserved.includes(skill)) n.skillsObserved = [...n.skillsObserved, skill].slice(-CAPS.skills);
      }
    }
    if (typeof u.relationshipDelta === "number") {
      n.relationship = Math.max(-10, Math.min(10, n.relationship + Math.max(-2, Math.min(2, u.relationshipDelta))));
    }
    // ⛔ PROPOSAL_delegate_tiers v2 §4 — MY PEOPLE'S PEOPLE (Erik: "Veth knew him and vouched for him, so that should
    // count too"). A vouch is an ACT in a scene, never derived: someone KNOWN, with standing of their own, says so.
    // ⚠️ Transitive ONCE — a person who was themselves vouched for cannot pass it on, or everyone is trusted through
    // two hops. It sits BESIDE relationship (Aevi §6.1) and it is theirs to lose (holdings.voucherPays).
    if (u.vouchedBy) {
      const vid = slugify(String(u.vouchedBy));
      const v = vid && vid !== n.id ? findExistingNpc(reg, vid, "") : null;
      const dl = ctx.rules?.economy?.holdStore?.delegates || {};
      const min = Number.isFinite(Number(dl.vouchMinStanding)) ? Number(dl.vouchMinStanding) : 6;
      if (v && v.id !== n.id && !v.vouchedBy && (Number(v.relationship) || 0) >= min && n.vouchedBy !== v.id) {
        n.vouchedBy = v.id; n.vouchedDay = ctx.day ?? null;
        n.history = [...n.history, `[d${ctx.day ?? "?"}] ${v.name || v.id} vouched for them — their word carries, and it is theirs to lose.`].slice(-CAPS.history);
      }
    }
    // SNG-108: bond KIND + romantic STAGE — applied AFTER the score so the stage floor sees the fresh value.
    if (u.bondType || u.bondStage) {
      advanceBond(n, { bondType: u.bondType, bondStage: u.bondStage }, ctx.rules, ctx.day);
      // SNG-334 — ⛔ AND A TIE TO A PERSON BECOMES A PINNED FACT, HERE, at the one place a bond changes.
      // Erik: "ones that tie to people should be saved as facts — like my player's mother, or Pell's
      // father." Pinned means it outlives the fact budget AND the Dunbar circle: the two things that
      // would otherwise quietly lose it.
      const kf = kinFact(n);
      if (kf) pinFact(character, kf, { day: ctx.day ?? null, subjectId: n.id });
    }
    if (u.status && ["active", "injured", "missing", "dead", "departed"].includes(u.status)) n.status = u.status;
    if (u.statusNote) n.statusNote = smartClamp(String(u.statusNote), 240); // SNG-152
    // CCODE-85 (Erik: "NPCs should have deeds too"). reputation.js was never character-specific — every
    // function in it reads only `X.deeds` — but nothing ever passed it an NPC and nothing read one back, so
    // the whole reputation machine pointed at exactly one person in the world. This is the writer.
    // Deliberately the SAME recordDeed the player uses: one ledger shape, or the two drift and an NPC's
    // record stops being comparable to yours, which is the entire point of a ladder with faces on it.
    if (u.deed && u.deed.description) {
      recordDeed(n, {
        description: smartClamp(String(u.deed.description), 240),   // prose — clamp on a word boundary, never mid-word
        weight: u.deed.weight | 0,
        tags: (u.deed.tags || []).slice(0, 4).map(t => String(t).slice(0, 32)), // prose-cap-ok — a tag is an identifier ("valor"), not prose
        communityId: u.deed.communityId ?? ctx.communityId ?? null,
        locationId: u.deed.locationId ?? ctx.locationId ?? null,
      });
      if ((n.deeds || []).length > 40) n.deeds = n.deeds.slice(-40);   // bounded like every other NPC list
    }
    // SNG-185: STAMP AFFILIATION HERE. This is the second mint path — anyone the GM meets in play —
    // and until now it stamped nothing, so registry-only people (Veth, the Crossing Ent) carried no
    // domains and could neither teach nor be credited. Same helper generate.js uses, so the two mints
    // can no longer disagree. Runs after role/skillsObserved are populated (its evidence), only fills
    // what is missing, and assigns nothing the record cannot support.
    if (ctx.affiliate && (!n.domains || !n.people)) {
      // SNG-231 §2: affiliation is ENRICHMENT — it derives domains/people from role/region for a fresh person.
      // It must NEVER break the meet (the person is already registered above): a throw here is what aborted
      // applyTurn on a fresh NPC, losing every later op incl. the newEncounter that starts a duel. Best-effort now.
      try {
        const a = ctx.affiliate(n);
        if (a.domains && !n.domains) { n.domains = a.domains; n.domainsSource = a.domainsSource; }
        if (a.people && !n.people) { n.people = a.people; n.peopleSource = a.peopleSource; }
      } catch (err) { if (typeof console !== "undefined") console.warn("[npcUpdates] affiliation enrichment failed (person still registered):", err?.message); }
    }
    n.lastSeen = { locationId: ctx.locationId || null, day: ctx.day ?? null };
    // SNG-333 — ⚠️ COUNT THE MEETINGS. Erik: "if you interface with the NPCs then it should count those
    // interactions and keep the ones you meet more than once from dropping off." This is the only new
    // field, and it is written at the one place every interaction already passes through.
    n.met = (Number(n.met) || 0) + 1;
  }
  return character.npcRegistry;
}

/** SNG-431 §1 — THE REPAIRS, APPLIED. Bumping this re-runs them; leave it alone unless the content changes. */
export const NAME_REPAIR_VERSION = 1;

/** Apply the authored name repairs to a save that was written before the namer existed.
 *
 *  Two blocks in `rules/minted_names.json`, both Aevi's: `repairRegistry` for the three npcRegistry entries
 *  that carried a DESCRIPTION in the `name` field ("Unknown farmer" → Hessa Orm), and `repair` for the
 *  minted figures whose name field held an epithet ("the one who outlived Cinder Vael, the Wright Who Would
 *  Not Stop" → Sera Voight the Ashvow).
 *
 *  ⚠️ NEVER OVER A NAME PLAY HAS SINCE CHANGED — a repair that fires over the player's world is a worse bug
 *  than the one it fixes. Three separate things hold that, and it is worth being exact about which does the
 *  work, because I first wrote a gate on the wrong one and it stayed green with the guard deleted:
 *
 *    · `was ===` on the authored record — the load-bearing one. It refuses any figure whose name is not
 *      still the exact string the repair was written about, so a renamed figure is out of scope by identity.
 *    · `nameRevealed` on a registry entry — the player learned this name; nothing may overwrite it.
 *    · `nameRepairVersion` — ⚠️ A COST GUARD, NOT A CORRECTNESS ONE. It stops the walk re-running on every
 *      load. The two checks above already make the walk idempotent, so removing this changes no outcome.
 *
 *  Returns what it changed; pure but for the character it is handed.
 */
export function repairUnnamedPeople(character, pools = null, content = {}) {
  if (!character || !pools) return [];
  if ((character.nameRepairVersion || 0) >= NAME_REPAIR_VERSION) return [];
  const fixed = [];
  for (const [id, rec] of Object.entries(pools.repairRegistry || {})) {
    const n = character.npcRegistry?.[id];
    if (!n || !rec?.name || n.nameRevealed || n.name === rec.name) continue;
    fixed.push({ id, was: n.name, now: rec.name, kind: "npc" });
    n.aliases = [...new Set([...(n.aliases || []), n.name].filter(Boolean))].slice(-4);
    n.name = rec.name;
    n.nameRevealed = true;      // authored, so no later reveal may overwrite it
    delete n.nameUnknown;
  }
  const figures = character.worldState?.mintedFigures || [];
  const taken = figures.map(f => f?.name).filter(Boolean)
    .concat((content?.legends?.roster || []).map(f => f?.name).filter(Boolean));
  // ⚠️ NAMES, NOT IDS, IN PROSE ALREADY STORED. Every legacy `origin` reads "of the the_ceaseless; …" — a raw
  // id AND a double article, and it is on a player's screen today. Any snake_case token in there is the
  // machine talking; resolve the ones content knows and leave the rest alone rather than guessing.
  // ⚠️ AND AN ID CONTENT CANNOT RESOLVE STILL MAY NOT BE SHOWN RAW — `renderNames` already holds that rule
  // ("NEVER shown raw to a player — degrades to the id in a readable form"), and a save can name a place
  // this build no longer ships. So a miss is humanised rather than left as machine text.
  const deIdify = (text) => String(text || "").replace(/\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/g, (id) => {
    const n = nameOf("loc", id, content) || nameOf("region", id, content) || nameOf("tradition", id, content) || nameOf("npc", id, content);
    if (n) return n;
    return id.replace(/_/g, " ").replace(/\b\w/g, (c, i) => (i === 0 && /^the /.test(id.replace(/_/g, " ")) ? c : c.toUpperCase()));
  }).replace(/\bthe\s+[Tt]he\b/g, "the");
  for (const f of figures) {
    if (!f) continue;
    // ⛔ `minted-1` IS NOT A UNIQUE ID. It is the first figure minted in EVERY world, and matching on it
    // alone applied Aevi's record — written about the figure who outlived Cinder Vael — to a different
    // player's figure who outlived Saehara, rewriting their origin with someone else's. `was` is the
    // identity check, and a repair with no `was` is refused rather than guessed at.
    const cand = pools.repair?.[f.id];
    const rec = cand?.was && cand.was === f.name ? cand : null;
    const before = f.name;
    if (rec?.name && f.name !== rec.name) {
      if (!f.epithet && f.name) f.epithet = f.name;   // the old name WAS the epithet — keep it where it belongs
      f.name = rec.name;
      if (rec.epithet) f.epithet = rec.epithet;
      if (rec.wants) f.wants = rec.wants;
      if (rec.origin) f.origin = rec.origin;
      f.provisional = false;
    } else if (f.provisional) {
      // ⛔ NO AUTHORED REPAIR FOR THIS ONE — and Aevi's gate is "no roster figure still provisional after a
      // tick", which a save full of legacy figures fails whatever the new mints do. So they get exactly what
      // the namer would have given them at mint: a name in their own grain, from the same pools.
      const m = personName({ pools, tradition: f.tradition || null, originKind: f.originKind || "_default", taken });
      if (m.minted) {
        if (!f.epithet && f.name) f.epithet = f.name;
        f.name = m.name;
        f.provisional = false;
        taken.push(m.name);
      }
    }
    // ⛔ AND `wants` HELD THE ORIGIN on every figure minted before today, repaired whether or not they were
    // renamed — the field is read straight into the GM's world block.
    if (f.origin && f.wants === f.origin) f.wants = mintedWants(f.originKind, pools) || f.wants;
    if (f.origin) f.origin = deIdify(f.origin);
    if (f.wants) f.wants = deIdify(f.wants);
    if (f.epithet) f.epithet = deIdify(f.epithet);
    if (f.name !== before) fixed.push({ id: f.id, was: before, now: f.name, kind: "figure" });
  }
  character.nameRepairVersion = NAME_REPAIR_VERSION;
  return fixed;
}

/** SNG-012 Part C: player names an unnamed NPC directly (parallel to item naming).
 *  Sets display name on the stable id, records the old name as an alias, logs it. */
export function setNpcName(character, npcId, name, day = null) {
  const n = character.npcRegistry?.[npcId];
  if (!n) return false;
  const newName = prettifyNpcName(String(name).slice(0, 60));
  if (!newName || newName === n.name) return false;
  n.aliases = [...(n.aliases || []), n.name].slice(-4);
  n.history = [...n.history, `[d${day ?? "?"}] You know this person's name now: ${newName} (was "${n.name}")`].slice(-CAPS.history);
  n.name = newName;
  n.nameRevealed = true;
  delete n.nameUnknown;   // SNG-431: `nameOf` reads this flag — leaving it set would keep hiding the name we just learned
  return true;
}

/** Heuristic: does this registry entry read as name-unknown (a role/placeholder)? */
export function nameIsUnknown(n) {
  if (n.nameRevealed) return false;
  const name = (n.name || "").toLowerCase();
  return /unknown|unnamed|\bthe\b|warden|keeper|stranger|figure|man|woman|guard|clerk|scout|elder|apprentice|dock-?master/.test(name);
}

/** SNG-119: the people you know who belong to a PLACE — registry NPCs first-met/last-seen there, or whose
 *  authored home/community matches it. So a location's header shows who you'd actually find there (Pell under
 *  her community), not everyone you've ever met. Pure. */
export function knownPeopleAt(character, locId, { locations = {}, npcs = {} } = {}) {
  if (!locId) return [];
  const community = locations[locId]?.communityId || null;
  const out = [];
  for (const n of Object.values(character?.npcRegistry || {})) {
    const cat = npcs[n.id];
    const here = n.firstMet?.locationId === locId || n.lastSeen?.locationId === locId
      || cat?.homeLocation === locId || (community && cat?.communityId === community);
    if (here) out.push({ id: n.id, name: n.name, label: relationshipLabel(n), status: n.status, bondType: n.bondType || null });
  }
  return out;
}

export function relationshipBand(score) {
  if (score >= 7) return "devoted";
  if (score >= 4) return "ally";
  if (score >= 1) return "friendly";
  if (score <= -7) return "enemy";
  if (score <= -4) return "hostile";
  if (score <= -1) return "wary";
  return "neutral";
}

/** SNG-136: has this NPC crossed a HIGH bond milestone that earns a dedicated portrait? Returns the tier
 *  name (a person who MATTERS) or null. Romantic committed/partner, a sworn tie, or a devoted-band bond
 *  (score ≥ 7 — Pell). The higher milestones only, never every acquaintance. Pure. */
export function npcPortraitTier(n) {
  if (!n) return null;
  if (n.bondStage === "partner") return "partner";
  if (n.bondStage === "committed") return "committed";
  if (n.bondType === "sworn") return "sworn";
  if (relationshipBand(Number(n.relationship) || 0) === "devoted") return "devoted";
  return null;
}

/** SNG-108: set/advance an NPC bond's KIND (bondType) and — for a romantic bond — its STAGE, gated:
 *  romantic is REFUSED for a minor (same floor as art/romance); a stage may advance at most one step
 *  per beat and only if the relationship score meets that stage's floor (no leaping to "partner" at
 *  relationship 2). Additive + logged; never silently rewrites. Returns {changed, refused?}. */
export function advanceBond(n, { bondType, bondStage } = {}, rules = null, day = null) {
  if (!n) return { changed: false };
  const floors = rules?.bond?.stageFloors || DEFAULT_STAGE_FLOORS;
  let changed = false;
  if (bondType === "romantic" && isMinorSubject(n)) { // absolute minor-protection
    n.history = [...(n.history || []), `[d${day ?? "?"}] (a romantic turn was declined — protected)`].slice(-CAPS.history);
    return { changed: false, refused: "minor" };
  }
  if (bondType && BOND_TYPES.includes(bondType) && bondType !== n.bondType) {
    n.bondType = bondType; changed = true;
    n.history = [...(n.history || []), `[d${day ?? "?"}] Your bond becomes ${bondType}.`].slice(-CAPS.history);
    // SNG-334 — ⛔ A TIE TO A PERSON IS NOT AN ACQUAINTANCE. Erik: "ones that tie to people should be saved
    // as facts — like my player's mother, or Pell's father." `family` and `sworn` are the two bonds that
    // name a permanent relation rather than a degree of warmth, so they mark the person as KIN: unevictable
    // from the circle (SNG-333), and worth a pinned fact the GM is always told.
    //
    // ⚠️ NOTHING NEW IS TRACKED — Aevi's own rule for the ties system. `bondType` already existed and already
    // carried `family`. The tie was recorded all along; it simply meant nothing to anything.
    if (bondType === "family" || bondType === "sworn") n.kin = bondType;
  }
  if (bondStage && (n.bondType || bondType) === "romantic" && ROMANTIC_STAGES.includes(bondStage)) {
    const wantIdx = ROMANTIC_STAGES.indexOf(bondStage);
    const curIdx = n.bondStage ? ROMANTIC_STAGES.indexOf(n.bondStage) : -1;
    const cappedIdx = Math.min(wantIdx, curIdx + 1); // never leap past the next stage
    if (cappedIdx > curIdx) {
      const target = ROMANTIC_STAGES[cappedIdx];
      if ((n.relationship ?? 0) >= (floors[target] ?? 0)) { // score must support the stage
        n.bondStage = target; changed = true;
        n.history = [...(n.history || []), `[d${day ?? "?"}] Your bond deepens — ${target}.`].slice(-CAPS.history);
      }
    }
  }
  return { changed };
}

/** SNG-108: human label combining the bond's KIND, romantic STAGE, and score band — "committed
 *  partner · devoted", "rival · wary", or just the band for a plain acquaintance. */
export function relationshipLabel(n) {
  const band = relationshipBand(n?.relationship ?? 0);
  const type = n?.bondType && n.bondType !== "platonic" ? n.bondType : null;
  if (type === "romantic" && n.bondStage) {
    const word = { courting: "courting", together: "together", committed: "committed partner", partner: "partner" }[n.bondStage] || n.bondStage;
    return `${word} · ${band}`;
  }
  return type ? `${type} · ${band}` : band;
}

/** SNG-108: a romantic bond at the party-adjacent stage — a companion by relationship, not recruitment. */
export function isPartnerAdjacent(n, rules = null) {
  return n?.bondType === "romantic" && n?.bondStage === (rules?.bond?.partyAdjacentStage || "partner");
}

/** Registry block for the GM: people relevant to this scene/location first, then
 *  the strongest other bonds. The GM must treat these as established fact. */
/** CCODE-85: one line naming what this person is known for, or "" for someone with no record. */
function renownLine(n, ctx = {}) {
  const r = renownHeardAt(n, ctx.communityId ?? null, ctx.rules || {});
  if (!r || !r.heardHere) return "";
  const forWhat = r.knownFor.length ? ` known for: ${r.knownFor.join(", ")}.` : "";
  const notable = (r.localNotable || []).length ? ` Talked about here: ${r.localNotable.join("; ")}.` : "";
  return ` ✦ RENOWN — people here know this person's record (${r.band}, ${r.deeds} deed${r.deeds === 1 ? "" : "s"}).${forWhat}${notable} Treat that reputation as something the room already carries; do not re-introduce them as a stranger.`;
}

export function npcRegistryForGM(character, { locationId = null, sceneNpcNames = [], interiority = null, communityId = null, rules = null } = {}) {
  const ctx = { communityId, rules };
  const reg = character.npcRegistry || {};
  // ⛔ CCODE-220 — THE KEY IS THE ID, SO AN ENTRY MISSING ONE BORROWS IT HERE. `driveOf` reads `n.id`, so
  // an id-less registry entry LOST ITS DRIVES SILENTLY - no directive, no drive line, nothing said. The
  // registry is keyed BY the id, so taking it from the key is the same fact by another road rather than a
  // guess. ⚠️ CCODE-20 already had to write a reconcile step to backfill missing ids, which is the
  // evidence that id-less entries happen; 115 of 115 live entries carry one today, and that is a migration
  // plus luck, not a guarantee.
  const all = Object.entries(reg).map(([key, n]) => (n && !n.id ? { ...n, id: key } : n)).filter(Boolean);
  if (!all.length) return null;
  const sceneNames = sceneNpcNames.map(s => s.toLowerCase());
  const relevant = all.filter(n =>
    n.lastSeen?.locationId === locationId || n.firstMet?.locationId === locationId ||
    sceneNames.some(s => s.includes(n.name.toLowerCase()) || n.name.toLowerCase().includes(s))
  );
  const rest = all.filter(n => !relevant.includes(n))
    .sort((a, b) => Math.abs(b.relationship) - Math.abs(a.relationship))
    .slice(0, Math.max(0, 12 - relevant.length));
  const pick = [...relevant, ...rest].slice(0, 12);
  if (!pick.length) return null;
  // SNG-152 + CCODE-07 (prompt budget): STORAGE is generous — the full description/notes are kept on
  // the save and stay reachable in the UI. The PROMPT is a bounded PROJECTION of that: this is the
  // largest single block in the GM context (measured ~20.7k chars on a real 18-NPC save), and it is
  // re-sent every turn, so the read boundary is where the bound belongs — not the write boundary,
  // which is what was silently severing text mid-word in the first place.
  const focus = new Set((sceneNpcNames || []).map(s => String(s).toLowerCase()));
  const inScene = n => focus.has(String(n.name).toLowerCase());
  // SNG-233 §2b: a key NPC's DRIVES (authored interiority, keyed by npc id) OR interiority captured on the
  // save (§2c). Rendered FROM here so an important person voices their own wants — not agreeable furniture.
  const interNpcs = interiority?.npcs || {};
  const driveOf = n => interNpcs[n.id] || (n.interiority && Object.keys(n.interiority).length ? n.interiority : null);
  let anyDriven = false;
  const block = pick.map(n => {
    // People actually present in the scene get the full budget; the rest are context, not cast.
    const wide = inScene(n);
    const desc = n.description ? smartClamp(n.description, wide ? 400 : 220) : "";
    const note = n.statusNote ? smartClamp(n.statusNote, wide ? 240 : 140) : "";
    const hist = n.history.slice(wide ? -4 : -2).map(h => smartClamp(h, wide ? 240 : 160));
    const facts = n.knownFacts.slice(wide ? -6 : -3).map(f => smartClamp(f, 160));
    const d = driveOf(n);
    let driveLine = "";
    if (d) {
      anyDriven = true;
      // Full drives for someone in the scene (they act this beat); a one-line summary for offstage context.
      driveLine = wide
        ? ` ⟡ DRIVEN — render them FROM this, not as an agreeable mirror: ${d.driveSummary || ""}` +
          (d.wants?.length ? ` WANTS (can pull against you): ${d.wants.join(" ")}` : "") +
          (d.fears?.length ? ` FEARS: ${d.fears.join(" ")}` : "") +
          (d.pushesBackWhen?.length ? ` PUSHES BACK WHEN: ${d.pushesBackWhen.join(" ")}` : "") +
          (d.emotionalRange ? ` RANGE: ${d.emotionalRange}` : "") +
          (d.acknowledgeTone ? ` TONE (earned approval; sharp when crossed): ${d.acknowledgeTone}` : "")
        : ` ⟡ DRIVEN: ${d.driveSummary || (d.wants || [])[0] || "has their own wants"}`;
    }
    return `- ${n.name}${n.role ? ` (${n.role})` : ""}${n.gender || n.pronouns ? ` [${[n.gender, n.pronouns].filter(Boolean).join(", ")} — use these pronouns]` : ""} — ${relationshipBand(n.relationship)} (${n.relationship}), status: ${n.status}.` +
      (n.bondType && n.bondType !== "platonic" ? ` BOND: ${relationshipLabel(n)} — established fact; honor the KIND of this relationship.` : "") +
      (desc ? ` ${desc}` : "") +
      (note ? ` CURRENT SITUATION: ${note}.` : "") +
      (n.skillsObserved.length ? ` Skills seen: ${n.skillsObserved.join(", ")}.` : "") +
      (facts.length ? ` What they know/have experienced: ${facts.join("; ")}.` : "") +
      (hist.length ? ` History with ${character.name}: ${hist.join(" | ")}` : "") +
      driveLine +
      // CCODE-85: WHAT THEY ARE KNOWN FOR. Erik's arena ask is that the ladder gets a face — an epic stops
      // being a threat number and becomes a person whose record you have been hearing about. Gated on the
      // deed having REACHED here (`spread`), so a legend stays local until news carries it and nobody is
      // famous in a village that never heard of them.
      renownLine(n, ctx);
  }).join("\n");
  // Append the directive ONLY when a driven NPC is actually in the block — it's the lever that makes drives fire.
  return anyDriven && interiority?.drivenNpcDirective ? `${block}\n\n${interiority.drivenNpcDirective}` : block;
}

/** Cleanup migration: merge duplicate registry entries (same person under
 *  different ids), and prettify names that are really ids. Community-id tokens
 *  (e.g. "millbrook") are dropped from prettified names. */
export function mergeDuplicateNpcs(character, dropTokens = []) {
  const reg = character.npcRegistry || {};
  const ids = Object.keys(reg);
  for (const id of ids) {
    const n = reg[id];
    if (!n) continue;
    for (const otherId of Object.keys(reg)) {
      if (otherId === id || !reg[otherId]) continue;
      const other = reg[otherId];
      const sameName = slugify(n.name) === slugify(other.name);
      const a = id.split(/[.-]/)[0], b = otherId.split(/[.-]/)[0];
      const tokenKin = a === b && (id.startsWith(otherId) || otherId.startsWith(id) || a === id || b === otherId);
      if (!sameName && !tokenKin) continue;
      // merge the shorter-history entry into the richer one
      const [keep, drop] = (n.history.length + n.knownFacts.length) >= (other.history.length + other.knownFacts.length) ? [n, other] : [other, n];
      keep.history = [...new Set([...drop.history, ...keep.history])].slice(-10);
      keep.knownFacts = [...new Set([...drop.knownFacts, ...keep.knownFacts])].slice(-8);
      keep.skillsObserved = [...new Set([...drop.skillsObserved, ...keep.skillsObserved])].slice(-6);
      keep.relationship = Math.abs(drop.relationship) > Math.abs(keep.relationship) ? drop.relationship : keep.relationship;
      if (!keep.role && drop.role) keep.role = drop.role;
      if (!keep.description && drop.description) keep.description = drop.description;
      delete reg[drop.id];
    }
  }
  for (const n of Object.values(reg)) n.name = prettifyNpcName(n.name, dropTokens);
  return character;
}

/** SNG-143: one-time retro-backfill of NPC gender from the record's own narration (the Pell fix — she was
 *  rendered male because her gender lived only in prose, never as a field). Scans an NPC's text fields for
 *  gendered pronouns and stamps `gender`/`pronouns` ONLY when one gender clearly dominates — a record often
 *  mentions others (a female NPC's history names her male partner), so it requires a 2× margin, never a bare
 *  count, and leaves genuinely mixed/ambiguous records UNSET (never guesses). Clears a baked portrait `image`
 *  when it stamps, so the next SNG-136 mint regenerates with the gender in the seed. Never overwrites an
 *  already-set gender. Pure over the registry; returns the names it set. */
export function backfillNpcGender(character) {
  const reg = character?.npcRegistry || {};
  const stamped = [];
  for (const [id, n] of Object.entries(reg)) {
    if (!n || n.gender) continue; // never overwrite an explicit value
    const text = [n.description, n.role, ...(n.history || []), ...(n.knownFacts || []), ...(n.aliases || [])].filter(Boolean).join(" ");
    const f = (text.match(/\b(she|her|hers|herself)\b/gi) || []).length;
    const m = (text.match(/\b(he|him|his|himself)\b/gi) || []).length;
    let g = null, p = null;
    if (f >= 2 && f >= m * 2 + 1) { g = "woman"; p = "she/her"; }
    else if (m >= 2 && m >= f * 2 + 1) { g = "man"; p = "he/him"; }
    if (!g) continue; // ambiguous / mixed / thin — leave unset, never guess
    n.gender = g; if (!n.pronouns) n.pronouns = p;
    if (n.image) { delete n.image; delete n._portraitTier; } // the baked portrait had no gender term — re-mint it
    stamped.push(n.name || id);
  }
  return stamped;
}

/** One-time migration: fold the old shallow relationships map into the registry. */
export function migrateRelationships(character, npcCatalog = {}) {
  if (!character.relationships || character.npcRegistry) {
    character.npcRegistry = character.npcRegistry || {};
    return character;
  }
  character.npcRegistry = {};
  for (const [npcId, rel] of Object.entries(character.relationships)) {
    const cat = npcCatalog[npcId];
    character.npcRegistry[slugify(npcId)] = {
      id: slugify(npcId),
      name: cat?.name || npcId,
      role: cat?.role || "",
      description: "",
      firstMet: { locationId: cat?.homeLocation || null, day: null },
      relationship: Math.max(-10, Math.min(10, rel.score || 0)),
      history: (rel.notes || []).map(x => smartClamp(String(x), 300)).slice(-CAPS.history), // SNG-152
      knownFacts: [],
      skillsObserved: [],
      status: "active"
    };
  }
  return character;
}

/** SNG-167 §2: NPC-BORNE ARCS. A location can start an arc and a person cannot — prompt rule 10
 *  weaves the LOCATION's questSeeds and there is no equivalent for anyone you meet, which is
 *  backwards: the memorable arcs start with someone, not somewhere.
 *
 *  Measured: 0 of 47 authored NPC records carry `questSeeds`, while 45 carry `wants`. So the ROUND 2
 *  ruling was to DERIVE rather than only author — the want IS the arc premise, and "has a want and
 *  no seed" names the real gaps with a number instead of an aspiration.
 *
 *  Returns the seeds this scene could offer, authored ones first, with the want as the fallback
 *  premise. Pure; empty when nobody present carries either.
 */
export function npcQuestSeedsForGM(character, { npcs = {}, locationId = null, sceneNpcNames = [], limit = 3 } = {}) {
  const reg = character?.npcRegistry || {};
  const scene = sceneNpcNames.map(n => String(n).toLowerCase());
  const here = Object.values(reg).filter(n =>
    n?.lastSeen?.locationId === locationId || scene.some(s => s.includes(String(n.name || "").toLowerCase()) || String(n.name || "").toLowerCase().includes(s))
  );
  const out = [];
  for (const n of here) {
    const authored = npcs[n.id];
    const seeds = (authored?.questSeeds || []).filter(Boolean);
    if (seeds.length) {
      out.push({ npcId: n.id, name: n.name, seed: String(seeds[0]), source: "authored" });
      continue;
    }
    // The want is already the arc premise — SNG-167 §2's "derive, do not just author".
    const want = authored?.want || (Array.isArray(authored?.wants) ? authored.wants[0] : authored?.wants);
    if (want) out.push({ npcId: n.id, name: n.name, seed: String(want), source: "want" });
  }
  return out.slice(0, limit);
}

/** Render NPC-borne seeds for the prompt. Empty when nobody present offers one. */
export function npcQuestSeedBlock(character, opts = {}) {
  const seeds = npcQuestSeedsForGM(character, opts);
  if (!seeds.length) return "";
  return seeds.map(s => `- ${s.name}: ${s.seed}${s.source === "want" ? " (their own want — shape it into a concrete, named opportunity with stakes)" : ""}`).join("\n");
}

/** SNG-194 §5 Q1: present NPCs' FEARS — authored on 41 of 42 people and, until now, read ONLY in the
 *  generate path (never the turn prompt). It is the single richest source for a NON-hostile surprise:
 *  someone acting out of fear is doing something sympathetic, not attacking. Mirrors the presence test in
 *  npcQuestSeedsForGM. Returns [{npcId, name, fear}]; surfaced only inside a room-gated offer so it costs
 *  prompt weight only when it can be used. */
export function npcFearsForGM(character, { npcs = {}, locationId = null, sceneNpcNames = [], limit = 3 } = {}) {
  const reg = character?.npcRegistry || {};
  const scene = sceneNpcNames.map(n => String(n).toLowerCase());
  const here = Object.values(reg).filter(n =>
    n?.lastSeen?.locationId === locationId || scene.some(s => s.includes(String(n.name || "").toLowerCase()) || String(n.name || "").toLowerCase().includes(s))
  );
  const out = [];
  for (const n of here) {
    const authored = npcs[n.id];
    const fear = authored?.fear || (Array.isArray(authored?.fears) ? authored.fears[0] : authored?.fears);
    if (fear) out.push({ npcId: n.id, name: n.name, fear: String(fear) });
  }
  return out.slice(0, limit);
}

/** SNG-195 G2 — the reactsToReputation win. Present NPCs' authored REACTIONS to who the character is,
 *  the single largest orphan in the corpus (40 people, read by nothing until now). The keys are the
 *  author's OWN scheme — some by disposition shape (balanced/extreme/seeking), some by how the player has
 *  treated them (kind/threatening/honest) — so they are NOT a fixed taxonomy and the engine cannot pick
 *  one; surface the whole small map (3–6 words each) and let the GM, who has the character in hand, choose
 *  the reaction that fits. A reaction to the SHAPE of a character is a self-writing unprompted beat with
 *  attribution already built in (the `from` is the person's own read of you). Rides in the room-gated
 *  offer, so it costs prompt weight only when it can be used. */
export function npcReactionsForGM(character, { npcs = {}, locationId = null, sceneNpcNames = [], limit = 3 } = {}) {
  const reg = character?.npcRegistry || {};
  const scene = sceneNpcNames.map(n => String(n).toLowerCase());
  const here = Object.values(reg).filter(n =>
    n?.lastSeen?.locationId === locationId || scene.some(s => s.includes(String(n.name || "").toLowerCase()) || String(n.name || "").toLowerCase().includes(s))
  );
  const out = [];
  for (const n of here) {
    const react = npcs[n.id]?.reactsToReputation;
    if (react && typeof react === "object") {
      const pairs = Object.entries(react).filter(([, v]) => v).slice(0, 4).map(([k, v]) => `${k} → ${v}`);
      if (pairs.length) out.push({ npcId: n.id, name: n.name, reactions: pairs.join("; ") });
    }
  }
  return out.slice(0, limit);
}

// ---------- CCODE-171: ONE PERSON, ONE IDENTITY, ONE FACE ----------
// ⛔ ERIK: "there are still too many duplicate NPCs and People and Scenes… how can we make sure that the
// NPC image and name actually point to the same name and image set? Cevaine AND Cevaine of the 7th Order."
//
// MEASURED before answering: on his own save, FIVE people wear two faces. Not because the merge machinery
// failed — registry duplicates are rare, one across every save — but because a person is recorded in THREE
// id namespaces and the image seed is taken from whichever one you happened to open:
//   · the registry npc id      `mara-wells`      → the portrait path
//   · the codex topic id       `water-keeper`    → the whois/codex card
//   · the authored content id                    → the roster
// Same woman, two seeds, two faces, and a look kept on one never reaches the other.
//
// ⚠️ IT MUST NOT OVER-MERGE, AND THAT IS THE HARD HALF. `namesMatch` folds "Grael's Runner" into "Grael" —
// a person and their errand-runner are not one person, and Erik has just been bitten by exactly this class
// when a merge put Cevaine-the-person inside Cevaine-the-lore. So this resolves by LINK first and by NAME
// only on equality after stripping a role-suffix and a title. Anything short of that stays separate.

const PERSON_TITLES = /^(?:overseer|warden|keeper|high|luminary|elder|master|mistress|lord|lady|ser|sir|captain|clerk|guard|scout|reverend|dame|councillor|magistrate|archivist|marshal|adept|champion|tender|maker|broker|mediator|the)\s+/i;

/** PURE-ish. The BARE name inside a codex label: "Leth — Edge District Archivist" → "Leth",
 *  "Dara Holt, the Ditch-Mother" → "Dara Holt", "Overseer Grael" → "Grael". A codex label is a name plus
 *  what they are; the identity is the name. */
export function bareName(label) {
  let s = String(label || "").split(/\s+[—–]\s+/)[0].split(/,\s+/)[0].trim();
  for (let i = 0; i < 2 && PERSON_TITLES.test(s); i++) s = s.replace(PERSON_TITLES, "").trim();
  // ⛔ THE EPITHET, WHICH IS ERIK'S OWN EXAMPLE: "Cevaine of the Seventh Measure" is Cevaine. A person's
  // by-name is part of what people CALL them, not part of who they are.
  // ⚠️ AND THE GUARD THAT MAKES IT SAFE: a POSSESSIVE is a relation to someone else, never an epithet of
  // them. "Grael's Runner" is a different man from Grael, and `namesMatch` — which would otherwise be the
  // obvious tool here — folds them together. That is why this is not namesMatch. Erik has just been bitten
  // by a wrong merge; the cost of over-folding a person is far higher than the cost of leaving two.
  if (!/['’]s\b/.test(s)) s = s.replace(/\s+of\s+(?:the\s+)?\S.*$/i, "").trim();
  return s;
}

/** CCODE-171. The ONE id that means this person, resolved from whatever handle you are holding.
 *  Order is confidence order: an explicit registry id, then a link, then an EXACT name after stripping the
 *  role and title. ⛔ Never a fuzzy match — see the note above; "Grael's Runner" must stay a different man.
 *  Returns a registry npc id, or null when this is not someone the player knows. */
export function canonicalPersonId(character, { npcId = null, entityId = null, label = null } = {}) {
  const reg = character?.npcRegistry || {};
  if (npcId && reg[npcId]) return npcId;
  if (entityId && reg[entityId]) return entityId;
  const want = normName(bareName(label));
  if (!want || want.length < 3) return null;
  // an exact name (or alias) match, after the label's role-suffix and title are removed
  for (const [id, n] of Object.entries(reg)) {
    if (!n?.name) continue;
    if (normName(bareName(n.name)) === want) return id;
    if ((n.aliases || []).some(a => normName(bareName(a)) === want)) return id;
  }
  return null;
}

/** CCODE-171. The image seed for a person, wherever they are being drawn. ⚠️ THIS IS THE WHOLE FIX: every
 *  surface asks the same question and gets the same answer, so the card, the portrait and a kept look all
 *  land on one face. Falls back to the caller's own handle for someone the registry does not know. */
export function personArtSeed(character, handles = {}) {
  const id = canonicalPersonId(character, handles);
  return `whois-${id || handles.entityId || handles.npcId || handles.topicId || normName(handles.label) || "someone"}`;
}

/* ═══ R45c — A PERSON CAN HOLD A THING (2026-09-05) ═══
 * ⛔ MEASURED on Silas's save: 0 of 35 registry entries carried an inventory, nothing in the engine ever wrote one, and
 * `npcUpdates` had no items channel — so "Silas lends Memory to Pell" was fiction with no record. ⚑ A registry entry is the
 * character-analogue and now carries the same two fields an evolving item needs: `inventory` and `practice`. The BOND stays
 * the player's (Memory answers to Huginn, and Huginn is Silas's companion), which is why `evolution.js` reads bonds
 * separately from the bearer. */
export function ensureBearer(entry) {
  if (!entry || typeof entry !== "object") return entry;
  if (!Array.isArray(entry.inventory)) entry.inventory = [];
  if (!entry.practice || typeof entry.practice !== "object") entry.practice = { schemaVersion: 1, uses: {}, coActivations: {}, coUse: {} };
  return entry;
}

/** Every person in the registry who is holding something — the bearers a scene's co-use and the tick's refresh walk. */
export function bearersOf(character) {
  return Object.values(character?.npcRegistry || {}).filter(n => n && Array.isArray(n.inventory) && n.inventory.length);
}

const sameItem = (it, name) => {
  const want = String(name || "").toLowerCase().trim();
  return String(it?.customName || it?.name || "").toLowerCase().trim() === want || String(it?.id || "").toLowerCase() === want;
};

/** Hand an item the character holds to a person. The OBJECT moves — there is one of it, and it is now hers. */
export function giveItemTo(character, npcId, itemName, { day = null } = {}) {
  const n = character?.npcRegistry?.[npcId];
  if (!n) return { ok: false, why: "you know nobody by that id" };
  const at = (character.inventory || []).findIndex(it => sameItem(it, itemName));
  if (at < 0) return { ok: false, why: `you are not carrying ${itemName}` };
  const [item] = character.inventory.splice(at, 1);
  ensureBearer(n);
  n.inventory.push({ ...item, lentBy: character.id || "you", lentDay: day });
  return { ok: true, item, to: npcId, name: n.name || npcId };
}

/** Take it back. `lentBy`/`lentDay` come off — it is yours again. */
export function takeItemFrom(character, npcId, itemName) {
  const n = character?.npcRegistry?.[npcId];
  if (!n || !Array.isArray(n.inventory)) return { ok: false, why: "they are carrying nothing of yours" };
  const at = n.inventory.findIndex(it => sameItem(it, itemName));
  if (at < 0) return { ok: false, why: `${n.name || npcId} is not carrying ${itemName}` };
  const [item] = n.inventory.splice(at, 1);
  const { lentBy, lentDay, ...clean } = item;
  character.inventory = [...(character.inventory || []), clean];
  return { ok: true, item: clean, from: npcId, name: n.name || npcId };
}

/** What each person is carrying, for the narrator — absent when nobody carries anything. */
export function carriedForGM(character) {
  const rows = bearersOf(character).map(n => `${n.name || n.id} carries ${n.inventory.map(i => i.customName || i.name).join(", ")}`);
  return rows.length ? rows.join("\n") : null;
}
