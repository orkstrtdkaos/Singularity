// reconcile.js — SNG-022. As engine + content-types evolve, existing characters and
// content must be brought up to current: a save from before a feature existed gains
// what it's owed on next login; content authored before a schema field gets it on load.
// Generalizes backfill.js's discipline (versioned, idempotent, one-time, principled)
// into a registry of MIGRATION STEPS run by a single reconcile(entity, kind) pass.
//
// Laws (from the spec, non-negotiable):
//  - IDEMPOTENT: per-entity reconcileVersion gate; running twice changes nothing.
//  - NEVER removes or downgrades; additive only.
//  - DERIVES from durable state, never fabricates history.
//  - Player-facing GRANTS that change power are OFFERED (offers[]), not auto-imposed;
//    purely-additive initializations stay silent.
// backfill.js remains the XP/bonds/practice credit pass (extend, don't replace) —
// reconcile is the umbrella for everything schema/feature-shaped that came after.

import { addHolding, addFeature, setGarrison } from "./holdings.js";        // R49: the forge the fiction built; step 44: the features and the gate
import { canRaiseBand, raiseBand } from "./melee.js";   // R49: the fellowship the fiction already named
import { worldPosForGenerated } from "./worldmap.js";
import { grantMartialKit, retiredBaselineIds } from "./martial.js";
import { applyLadderGrants } from "./ladder.js";
import { credit } from "./purse.js";   // R48: the purse has ONE door in, and it records an origin
import { mergeCodexTopics, ensureCodex, applyCodexUpdates, foldTopicsByIdPrefix } from "./codex.js";   // step 43: the named fold
import { mergeRecovery, mergeReceiptLine } from "./recovery.js";   // step 41: the Settings door's merge, run where every copy passes
import { SNAPSHOTS } from "./recovery_snapshots.js";              // step 41: the overwritten branch, as a diff
import { dedupeQuests, normalizeProse } from "./quests.js";
import { dedupeInventory } from "./inventory.js";
import { inferDomains } from "./traditions.js";
import { fallbackPersonalArc } from "./personalArc.js";
import { seedStandingAtCreation } from "./standing.js";
import { namesMatch } from "./namematch.js";
import { affiliationOf, regionHomeTradition, buildPeopleVocab } from "./affiliation.js";
import { defaultSchoolsForDomains } from "./substrate.js"; // SNG-193b §3.2: seed a school per practised domain on old saves
import { mintableBraidsFor, buildBraidDef, mintBraid } from "./braids.js"; // SNG-196: mint the braids a character already earned
import { findExistingNpc, prettifyNpcName, REGISTRY_CAP } from "./npcs.js"; // SNG-199/205: registry + codex backfill
import { bondOf, companionCodexUpdate, companionStageCount } from "./companions.js"; // SNG-200: stage + codex backfill
import { isCoercedObjectArtefact, isDescriptiveNotName } from "./state.js"; // SNG-329: the artefact detector, shared with the mint that now refuses it
import { startingSkills } from "./inventory.js"; // SNG-339b: the training an existing character came with

/* ═══ R27 (ERIK 2026-09-02) — A RENAME TARGET MAY BE CONDITIONED, AND ON TWO DIFFERENT THINGS.
 *
 * ⛔ `to` WAS A STRING AND ONE ENTRY NEEDED IT NOT TO BE. `soma` carried `"second_wind + perfect_motion"`
 * — a plain string naming two crafts, which `known[to]` could never resolve, so the entry parsed, was
 * silently skipped, and read as a migration. ⚠️ THE `+` WAS DOCUMENTATION WEARING A MECHANISM'S CLOTHES.
 *
 * ⚠️ TWO CONDITIONED FORMS, AND THEY CONDITION ON DIFFERENT THINGS — this is R27's whole point:
 *   · `{ byRank: { "1": [...], "2": [...], "3": [...] } }`  — what the holder ACTUALLY HAD
 *   · `{ bySect: { "syllogist": "...", ... }, default: "..." }` — which variant of a split craft is theirs
 *
 * ⛔ `soma` SPLIT BY RANK, NOT BY SECT, AND THE REVERT LOG SAYS SO: "OUTLAST (… Soma r1–r2) and EXECUTE
 * (… Soma r3)". A rank-2 holder never had the strike; granting `perfect_motion` hands them something
 * unearned. A rank-3 holder had both halves, and taking one is a loss they did not choose.
 *
 * ⚠️ THE RESULTING RANKS LIVE IN THE CONTENT, NOT HERE. A target may be a bare id (keep the rank you
 * held) or `{ id, rank }`. ⛔ THE SPLIT RANKS ARE AN INFERENCE — that a soma-3 holder finished
 * second_wind's two ranks and is beginning perfect_motion — SO THEY ARE WRITTEN WHERE A HUMAN CAN SEE
 * AND CHANGE THEM, not buried in engine arithmetic where the inference would be invisible.
 *
 * ⛔ ALL-OR-NOTHING. If any named target is missing from the catalogue the whole entry is skipped:
 * a HALF-migrated split is worse than an unmigrated one, because it looks finished. */
function renameTargets(spec, entry, character, known) {
  const to = spec?.to;
  if (!to) return null;
  const held = Number(entry?.level) || 1;
  let raw = null;
  if (typeof to === "string") raw = [to];
  else if (to.byRank) raw = to.byRank[String(held)] || null;
  else if (to.bySect) {
    // ⚠️ PRIMARY, THEN SECONDARY, THEN TERTIARY, THEN `default`. A character holds three sects and the
    // craft came from one of them; nearest-to-the-player wins, and `default` is what keeps a craft that
    // no variant claims. ⬜ AEVI: this order is mine, not ruled — no content uses `bySect` yet.
    const d = character?.domains || {};
    raw = [d.primary, d.secondary, d.tertiary].map(x => to.bySect[x]).find(Boolean) || to.default || null;
    if (raw && !Array.isArray(raw)) raw = [raw];
  }
  if (!raw) return null;
  const out = (Array.isArray(raw) ? raw : [raw]).map(t =>
    typeof t === "string" ? { id: t, rank: null } : { id: t?.id, rank: Number(t?.rank) || null });
  if (!out.length || out.some(t => !t.id || !known[t.id])) return null;   // ⛔ no target, no rewrite
  return out;
}
// ---------- character migration steps (extensible registry) ----------
// Each step: { version, id, playerFacing, apply(entity, ctx) → { notes?, offers?, warnings? } }.
// Steps self-check preconditions and are order-independent; version numbers only gate
// "has this entity seen this step yet" via entity.reconcileVersion.

export const CHARACTER_STEPS = [
  {
    version: 31, id: "ability-rename-map", playerFacing: true,
    // ⛔ CCODE-294 — 22 ABILITY REFERENCES ACROSS 7 REAL SAVES POINT AT IDS THAT NO LONGER EXIST.
    // `ability_rename_map.json` holds 377 old→new mappings from the naming-SOP pass. It is registered,
    // whitelisted, 57 KB — and was NEVER LOADED and read by NOTHING, so every save written before that
    // rename carried ids the catalogue had stopped answering to.
    //
    // ⚠️ MEASURED, NOT ASSUMED: 142 ability references across 16 saves — 107 resolve in the catalogue,
    // 13 as GM-minted custom abilities, and 22 resolve ONLY through this map. Eleven of those 22 are on
    // one L30 character. ⛔ NOTHING WAS PERMANENTLY LOST; the map is the whole repair.
    //
    // ⛔ AND THE THREE RESOLUTION PATHS ARE WHY THIS TOOK MEASURING TWICE. An id may resolve in the
    // CATALOGUE, as a MINTED custom ability on the character, or as a runtime BRAID. My first pass knew
    // only the first and reported 6 abilities "lost" that were minted and perfectly fine. A migration
    // that rewrites an id it does not understand would DESTROY a minted ability, so this one only ever
    // touches an id the map explicitly names AND whose target exists.
    apply: (c, ctx) => {
      const map = ctx?.content?.rules?.abilityRenames || ctx?.rules?.abilityRenames || null;
      if (!map || !Array.isArray(c.abilities)) return {};
      const known = ctx?.content?.abilities || {};
      const renamed = [];
      for (const entry of c.abilities) {
        const id = typeof entry === "string" ? null : entry?.abilityId;
        if (!id) continue;
        if (known[id]) continue;                       // already resolves — never touch it
        // ⛔ R27 — A TARGET MAY BE CONDITIONED, AND MAY BE MORE THAN ONE CRAFT.
        const targets = renameTargets(map[id], entry, c, known);
        if (!targets) continue;                        // ⚠️ no target, no rewrite. A guess here loses a craft.
        // ⚠️ THE FIRST TARGET TAKES THE EXISTING ENTRY, so provenance, uses and any other field a craft has
        // accumulated ride along. ⛔ A fresh object would have silently discarded them.
        entry.abilityId = targets[0].id;
        if (targets[0].rank) entry.level = targets[0].rank;
        if (targets.length > 1) entry.migratedFrom = id;
        // ⛔ AND THE REST ARE MINTED. This is the half a split holder EARNED and the merge took.
        for (const t of targets.slice(1)) {
          if (c.abilities.some(a => a?.abilityId === t.id)) continue;   // already theirs — never double
          c.abilities.push({ abilityId: t.id, level: t.rank || Number(entry.level) || 1, migratedFrom: id });
        }
        renamed.push(`${id} → ${targets.map(t => t.id).join(" + ")}`);
      }
      if (!renamed.length) return {};
      return { notes: [`${renamed.length} of your craft${renamed.length === 1 ? "" : "s"} answered to an older name and ${renamed.length === 1 ? "has" : "have"} been reconnected.`],
               applied: renamed };
    }
  },
  {
    version: 1, id: "codex-entity-merge", playerFacing: true,
    // SNG-019's one-shot repair for pre-fragmented saves: collapse duplicate codex
    // topics into their primary nodes. High-confidence auto-merge only.
    apply: (c) => {
      if (!c.codex?.topics || Object.keys(c.codex.topics).length < 2) return {};
      const merged = mergeCodexTopics(c);
      return merged.length
        ? { notes: [`Your codex has gathered itself — ${merged.length} scattered entr${merged.length === 1 ? "y" : "ies"} merged under ${[...new Set(merged.map(m => m.into))].slice(0, 3).join(", ")}.`] }
        : {};
    }
  },
  {
    version: 2, id: "additive-fields", playerFacing: false,
    // The silent sweep: any additive schema field initializes to its safe default.
    // (migrate() also guards these on every load; this step makes the sweep versioned
    // and is where FUTURE field additions register instead of growing migrate().)
    apply: (c) => {
      const added = [];
      const ensure = (key, def) => { if (c[key] === undefined || c[key] === null) { c[key] = def; added.push(key); } };
      ensure("establishedFacts", []);
      ensure("precursorAccess", []);
      ensure("forkChoices", {});
      ensure("customAbilities", {});
      ensure("customEncounters", {});
      ensure("placeMemory", {});
      ensure("companions", []);
      ensure("companionNames", {}); // SNG-057
      ensure("discoveries", []);
      return added.length ? { notes: [`initialized: ${added.join(", ")}`] } : {};
    }
  },
  {
    version: 3, id: "seed-character-style", playerFacing: true,
    // SNG-BATCH-7 Phase 1: play-style moved profile → character. Seed each existing
    // character's tendencies/aptitudes from the player's CURRENT aggregate profile once,
    // so nothing earned is lost; then it diverges per-character. Derives from durable
    // state (the aggregate is what exists); only seeds a character that has no style yet.
    apply: (c, ctx) => {
      if (!c.tendencies) c.tendencies = {};
      if (!c.aptitudes) c.aptitudes = [];
      if (c.actionCount == null) c.actionCount = 0;
      const prof = ctx.profile;
      const hasStyle = Object.keys(c.tendencies).length > 0 || (c.actionCount || 0) > 0;
      if (!hasStyle && prof && Object.keys(prof.tendencies || {}).length) {
        c.tendencies = { ...prof.tendencies };
        c.aptitudes = [...(prof.aptitudes || [])];
        c.actionCount = prof.actionCount || 0;
        return { notes: ["your characters now carry their own play-style"] };
      }
      return {};
    }
  },
  {
    version: 4, id: "quest-inventory-resolve", playerFacing: false,
    // SNG-BATCH-7 Phase 3: repair state a pre-resolver save fragmented — collapse
    // duplicate quests (drifted titles) + duplicate item stacks (phrasing variants).
    // Silent (a repair): the quest log + inventory just render correctly afterward.
    apply: (c, ctx) => {
      const qm = dedupeQuests(c);
      const im = dedupeInventory(c, ctx.content?.items || {});
      const parts = [];
      if (qm.length) parts.push(`merged ${qm.length} duplicate quest(s)`);
      if (im.length) parts.push(`stacked ${im.length} duplicate item(s)`);
      return parts.length ? { notes: parts } : {};
    }
  },
  {
    version: 5, id: "infer-domains", playerFacing: true,
    // SNG-055/059: a character built before the great circle gets domains INFERRED from what they
    // already hold (most-held tradition → primary, etc.). Nobody loses an ability — already-owned
    // abilities rank freely regardless of domain (only LEARNING new ones is gated), so out-of-domain
    // holdings are grandfathered. Folk-only characters stay open (no domains).
    apply: (c, ctx) => {
      if (c.domains?.primary) return {};
      const idx = ctx.content?.traditionIndex;
      if (!idx) return {};
      const inf = inferDomains(c.abilities || [], ctx.content.abilities || {}, idx);
      if (!inf) return {};
      c.domains = inf;
      const nm = t => idx.byId?.[t]?.name || t;
      return { notes: [`Your place on the great circle is set (from what you've mastered): ${nm(inf.primary)}${inf.secondary ? " · " + nm(inf.secondary) : ""}${inf.tertiary ? " · " + nm(inf.tertiary) : ""}. Nothing you already hold is lost.`] };
    }
  },
  {
    version: 7, id: "personal-arc-backfill", playerFacing: true,
    // SNG-133 seeds a personal arc at CHARACTER CREATION and nowhere else — `finish()` is the only
    // caller of fallbackPersonalArc. A character created before that shipped therefore has no arc
    // and never will: nothing in the codebase can give one to an existing save. Silas Weir reached
    // LEVEL 16 with `personalArc: undefined`, and the SNG-146f fix earlier this session made the
    // "Take it on" button work for a quest that was never generated in the first place — the start
    // path was repaired above an empty slot.
    //
    // This is exactly what reconcile is for ("a save from before a feature existed gains what it is
    // owed on next login"). Seeds the same light fallback creation uses, from the bio the character
    // already has. app.js enriches it via the model afterwards, the same as at creation, so an old
    // character ends up with the arc a new one would have been born with.
    apply: (c) => {
      if (c.personalArc) return {};                       // already has one — idempotent
      if (!c.bio?.motivation && !c.bio?.story) return {};  // nothing to draw an arc FROM; never fabricate one
      const arc = fallbackPersonalArc(c);
      if (!arc || !arc.id) return {};
      c.personalArc = arc;
      c._personalArcNeedsEnrich = true;                   // app.js picks this up and enriches once
      return { notes: [`Your own thread has surfaced — *${arc.name}*. It's waiting in your quest log; take it up when you're ready.`] };
    }
  },
  {
    version: 8, id: "standing-seed-backfill", playerFacing: true,
    // BATCH-12 §3b. Standing at creation ships in the same batch as this step, so EVERY character
    // that exists today was born without it — including Erik's, who is level 16 and unknown to his
    // own people. Same shape as v7's personalArc backfill: a save from before a feature existed
    // gains what it is owed on next login.
    //
    // seedStandingAtCreation is idempotent by construction — it writes only peoples with no entry at
    // all — so a character whose play HAS moved a score keeps it, and re-running this can never
    // inflate anything. That property is what makes it safe to reuse the creation path here rather
    // than writing a second, subtly different one.
    apply: (c, ctx) => {
      if (!c.domains?.primary) return {};                       // nothing to seed FROM; never invent a people
      const r = seedStandingAtCreation(c, { traditionIndex: ctx.content?.traditionIndex || null, rules: ctx.content?.rules || {} });
      if (!r.count) return {};
      const nm = t => ctx.content?.traditionIndex?.byId?.[t]?.name || t;
      return { notes: [`Word of who you are has caught up with you: ${r.seeded.map(x => `the ${nm(x.people)} ${x.delta > 0 ? "know your name" : "do not"}`).join(", ")}.`] };
    }
  },
  {
    version: 9, id: "standing-history-credit", playerFacing: true,
    // SNG-171 §2. v8 seeds standing from who a character IS — origin and kin. This credits what they
    // DID. Erik reached level 16 with a sworn bond, a romantic partner and two bound teachers, and
    // the opening screen still said those peoples did not know him.
    //
    // THE ATTRIBUTION RULE IS ERIK'S SNG-174 RULING, AND IT IS WHY THIS COULD NOT BE GUESSED:
    // kind and disposition are INDEPENDENT. An NPC's `people` is what they ARE (ent, human,
    // precursor-construct); their `domains` are what they PRACTICE. Standing is held per TRADITION,
    // so a bond credits the domains — which is how a bond with an Ent credits the ROOTKIN, exactly
    // as Erik expected, while the Ent stays an ent. The three authored Ents came out with three
    // different dispositions, which is the ruling proving itself.
    //
    // Conservative by construction (§2c.4): only positive bonds count, only authored NPCs with
    // authored domains count, and a people whose attribution is unclear gets nothing and is not
    // mentioned. A wrong attribution is worse than a missing one. Nothing is fabricated — every
    // point traces to a relationship or a use-count already in the save.
    apply: (c, ctx) => {
      const npcs = ctx.content?.npcs || {};
      const idx = ctx.content?.traditionIndex || null;
      const credit = {}, why = {};
      const add = (tid, amount, reason) => {
        if (!tid || !amount) return;
        if (idx && idx.byId && !idx.byId[tid]) return;         // not a real tradition — credit nothing
        credit[tid] = (credit[tid] || 0) + amount;
        (why[tid] = why[tid] || new Set()).add(reason);
      };
      // (1) BONDS — the people whose craft your friends practice have heard of you.
      // SNG-177: a bond in play is almost always with a GENERATED NPC, so resolve against the
      // generated store as well as the authored one. Their ids DRIFT — the registry holds `dara-holt`
      // while the generated record is `dara-holt-the-ditch-mother` — so fall back to name matching,
      // which is what namematch exists for. Before this, 18 of Erik's 20 known people were invisible.
      const genStore = Object.values(c.generated?.npc || {});
      const resolve = (n) => npcs[n.id] || (c.generated?.npc || {})[n.id]
        || genStore.find(g => namesMatch(g.name || "", n.name || ""));
      for (const n of Object.values(c.npcRegistry || {})) {
        const rel = Number(n?.relationship) || 0;
        if (rel < 1) continue;                                  // only positive; enmity with one is not enmity with a people
        const rec = resolve(n);
        const dom = rec?.domains || n.domains;
        if (!dom) continue;                                     // unattributable — say nothing (§2c.4)
        let weight = rel >= 7 ? 3 : rel >= 4 ? 2 : 1;           // devoted / ally / friendly
        // A DERIVED domain means "someone of this country", not "someone who practises this". Fine as
        // a starting point for the GM; weak evidence for standing. Halved rather than refused.
        if ((rec?.domainsSource || n.domainsSource) === "derived") weight = weight / 2;
        const primaries = Array.isArray(dom.primary) ? dom.primary : [dom.primary];
        const share = weight / Math.max(1, primaries.length);   // an Epic NPC's several primaries split the credit
        for (const t of primaries) add(t, share, n.name || rec.name);
        if (dom.secondary) add(dom.secondary, weight / 2, n.name || rec.name);
        if (dom.tertiary) add(dom.tertiary, weight / 4, n.name || rec.name);
      }
      // (2) CRAFT — a people notices someone who works in their idiom. The practice ledger already
      // counts it; this is the same signal live accrual uses for a focused day.
      const uses = c.practice?.uses || {};
      const byTradition = {};
      for (const [abId, n] of Object.entries(uses)) {
        const ab = ctx.content?.abilities?.[abId];
        const t = ab?.tradition || (idx?.abilityToTradition?.[abId]) || ab?.powerSystem;
        if (t && n > 0) byTradition[t] = (byTradition[t] || 0) + n;
      }
      for (const [t, n] of Object.entries(byTradition)) {
        if (n >= 30) add(t, 2, "your own craft");
        else if (n >= 10) add(t, 1, "your own craft");
      }
      if (!Object.keys(credit).length) return {};

      // A backfill may bring a people to KNOWN or a little past it; it may never hand out `kin`.
      // Closeness of that order is play's to give, not a migration's.
      const BACKFILL_CAP = 6;
      c.peopleDisposition = c.peopleDisposition || {};
      // Idempotent by RECORD, not just by version gate. reconcileVersion already runs this once, but
      // "re-running must never inflate" (§2c.3) should be a property of the step, not of its caller —
      // a future re-baseline or a hand-run must be safe.
      c._standingHistoryCredit = c._standingHistoryCredit || {};
      const moved = [];
      for (const [tid, amount] of Object.entries(credit)) {
        const want = Math.min(Math.round(amount * 10) / 10, BACKFILL_CAP);
        const already = c._standingHistoryCredit[tid] || 0;
        const granted = Math.round((want - already) * 10) / 10;
        if (granted <= 0) continue;
        c.peopleDisposition[tid] = (c.peopleDisposition[tid] || 0) + granted;
        c._standingHistoryCredit[tid] = want;
        moved.push({ tid, granted, who: [...(why[tid] || [])].filter(Boolean).slice(0, 2) });
      }
      if (!moved.length) return {};
      moved.sort((a, b) => b.granted - a.granted);
      const nm = t => String(idx?.byId?.[t]?.name || t).replace(/^The\s+/i, "");   // the authored names already carry their article
      const top = moved.slice(0, 3).map(m => `the ${nm(m.tid)}${m.who.length ? ` (${m.who.join(", ")})` : ""}`);
      return { notes: [`What you have already done has caught up with you — ${top.join(", ")} count you differently now.`] };
    }
  },
  {
    version: 10, id: "generated-npc-affiliation", playerFacing: false,
    // SNG-177. Mint-time affiliation ships in this batch, so every generated NPC already in a save
    // was born without one — which is exactly why v9 could credit only 1 of Erik's 14 bonds.
    // Derived only: there is no model in a reconcile pass, so this can give the FLOOR (the tradition
    // whose home this NPC's region is) and nothing more. Marked `derived` so the credit path weighs
    // it as the weaker evidence it is, and so a later enrichment can tell it apart from a choice.
    // Silent — it changes no power and grants nothing on its own.
    apply: (c, ctx) => {
      const idx = ctx.content?.traditionIndex;
      const locations = ctx.content?.locations || {};
      if (!idx?.byId) return {};
      const homeTradition = (regionId) => Object.values(idx.byId).find(t => t?.region === regionId)?.traditionId || null;
      let n = 0;
      for (const rec of Object.values(c.generated?.npc || {})) {
        if (!rec || rec.domains) continue;
        const loc = locations[rec.homeLocation];
        const t = homeTradition(loc?.regionId || loc?.region);
        if (!t) continue;                                     // unknown country — invent nothing
        rec.domains = { primary: t };
        rec.domainsSource = "derived";
        n++;
      }
      return n ? { notes: [`affiliated ${n} generated NPC(s) from their home country`] } : {};
    }
  },
  {
    version: 11, id: "npc-affiliation-backfill", playerFacing: false,
    // SNG-185. The GM meet-path never stamped affiliation, so every registry-only NPC in an existing
    // save carries no domains — which is why the Ent credited nothing and Veth could not teach. The
    // engine now stamps on meet (npcs.js), but Veth and the Crossing Ent exist NOW and must not need
    // re-meeting. This runs the SAME helper over the registry: role string, then skillsObserved, then
    // region home (half-weight, marked derived), reading the people vocabulary the same way.
    //
    // Idempotent by construction — it only fills a record with no domains, so re-running changes
    // nothing (acceptance §5). Never invents a people (§2.4). Silent: it grants no power, it makes
    // existing bonds and teachers legible.
    apply: (c, ctx) => {
      const idx = ctx.content?.traditionIndex;
      const locations = ctx.content?.locations || {};
      if (!idx?.byId) return {};
      const peopleVocab = buildPeopleVocab({ npcs: ctx.content?.npcs || {} });
      let n = 0;
      for (const rec of Object.values(c.npcRegistry || {})) {
        if (!rec || rec.domains) continue;
        const region = locations[rec.lastSeen?.locationId || rec.firstMet?.locationId]?.regionId;
        const a = affiliationOf(rec, { traditionIndex: idx, peopleVocab, regionHome: regionHomeTradition(region, idx) });
        if (a.domains) { rec.domains = a.domains; rec.domainsSource = a.domainsSource; }
        if (a.people && !rec.people) { rec.people = a.people; rec.peopleSource = a.peopleSource; }
        if (a.domains) n++;
      }
      return n ? { notes: [`affiliated ${n} person(s) you already know — their crafts are legible now`] } : {};
    }
  },
  {
    version: 12, id: "chronicle-string-repair", playerFacing: true,
    // SNG-190 §5 / SNG-189 §1. A wrong-typed sceneSummary (an object the model returned where a string
    // was asked) was pushed RAW into the permanent chronicle and rendered "[object Object]" — a scene
    // of the story lost, unrecoverable. The live path now coerces before the push (app.js
    // coerceSceneSummary); this repairs saves ALREADY corrupted: an object entry yields its own text
    // field if it has one, else a plain honest marker rather than a glitch string. Idempotent — a
    // string entry is left exactly as it was.
    apply: (c) => {
      if (!Array.isArray(c.chronicle)) return {};
      let n = 0;
      c.chronicle = c.chronicle.map(e => {
        if (typeof e === "string") return e;
        n++;
        const inner = e && typeof e === "object" ? (e.text || e.summary || e.sceneSummary) : null;
        return (typeof inner === "string" && inner.trim()) ? inner : "(a scene whose summary was lost to a formatting error)";
      });
      return n ? { notes: [`repaired ${n} chronicle entr${n === 1 ? "y" : "ies"} that were not text`] } : {};
    }
  },
  {
    version: 13, id: "school-backfill", playerFacing: false,
    // SNG-193b §3.2 / §5 Q3. A character built before schools has no `schools` map. The band seam already
    // falls back to each tradition's pure/root school SILENTLY, so this changes no behaviour — it just
    // makes the field consistently present, so the GM's school block and a future adoptSchool have a base
    // to read and write. Defaults every practised domain to its pure/root school. Idempotent: a save that
    // already has a schools map is left untouched; a folk-only (no-domain) character gets an empty map.
    apply: (c, ctx) => {
      if (c.schools && typeof c.schools === "object") return {};
      c.schools = defaultSchoolsForDomains(c.domains, ctx.content?.schools);
      return {};
    }
  },
  {
    version: 14, id: "braid-backfill", playerFacing: true,
    // SNG-196. The generative core was unreachable: the co-activation ledger filled and NOTHING minted a
    // braid, because braids required an authored recipe and only 3 existed — none for the crafts people
    // play (Silas: 40 co-activations, 0 braids). This mints the braids a character has ALREADY EARNED —
    // every pairing co-activated past the threshold, both crafts still held — as full-schema abilities in
    // customAbilities. Idempotent: mintBraid skips a pairing already braided, so it never double-mints on
    // a later login. The rich tree/name is the model's job in play; the stub minted here is itself playable
    // and the player can rename + deepen it. GENERATIVE — no authored recipe required, which is the fix.
    apply: (c, ctx) => {
      const catalog = { ...(ctx.content?.abilities || {}), ...(c.customAbilities || {}) };
      const mintable = mintableBraidsFor(c, { catalog });
      const names = [];
      for (const m of mintable) {
        const def = buildBraidDef(c, m.components, catalog);
        if (def && mintBraid(c, def, { at: null })) names.push(def.name);
      }
      return names.length
        ? { notes: [`Braids you had already earned, made real (${names.length}): ${names.join(", ")}. A braid is a craft neither parent could do alone — rename it and deepen it in play.`] }
        : {};
    }
  },
  {
    version: 15, id: "codex-knows-who-you-met", playerFacing: true,
    // SNG-199 §5 + SNG-205 §1. Two recoveries for the same seam — "the fact is written and the reader
    // never fires" — on saves from before the mandatory mirrors existed:
    //  (a) TEVA: a person who is an established-fact SUBJECT with a person-kind codex node is demonstrably
    //      KNOWN — but knownPeopleAt reads only npcRegistry, and her registry write was op-gated on a
    //      `meet` that never fired (she entered through narration). Back-fill the registry from the two
    //      independent signals. Established ≠ mentioned: a keyed subjectId + a person codex topic, never
    //      every name spoken once. Registry cap holds.
    //  (b) THE CODEX MIRROR, retroactively: people already in the registry and places already walked get
    //      the codex node the new mirrors would have written (applyCodexUpdates dedupes via resolveTopic;
    //      the 60-topic cap holds inside it — people first, they are the load-bearing half).
    // Idempotent: version-gated AND by construction (existing records resolve, never duplicate).
    apply: (c, ctx) => {
      ensureCodex(c);
      const topics = c.codex.topics;
      const reg = c.npcRegistry = c.npcRegistry || {};
      // (a) registry back-fill from established facts × person-kind codex nodes
      const registered = [];
      for (const f of c.establishedFacts || []) {
        const sid = f.subjectId;
        if (!sid) continue;
        const t = topics[sid] || Object.values(topics).find(x => x.entityId === sid);
        if (!t || t.kind !== "person") continue;                      // both signals or nothing
        if (findExistingNpc(reg, sid, t.label || sid)) continue;      // already known (aliases included)
        if (Object.keys(reg).length >= REGISTRY_CAP) break;           // keep the people who matter
        reg[sid] = {
          id: sid, name: prettifyNpcName(String(t.label || sid)), role: "", description: "",
          firstMet: { locationId: null, day: f.day ?? t.createdDay ?? null }, relationship: 0,
          history: [`[d${f.day ?? "?"}] Known from what has passed between you.`],
          knownFacts: [], skillsObserved: [], status: "active", gender: null, pronouns: null,
          _backfilledFrom: "establishedFacts"
        };
        registered.push(reg[sid].name);
      }
      // (b) retro-mirror: registry people + walked places into the codex (one update per call —
      // applyCodexUpdates caps its batch at 4; per-entity calls keep every mirror counted)
      const before = Object.keys(topics).length;
      for (const n of Object.values(reg)) {
        try { applyCodexUpdates(c, [{ entityId: n.id, label: n.name, kind: "person", fact: n.role || "met in play" }], { day: n.firstMet?.day ?? null }); } catch { /* mirror only */ }
      }
      for (const [locId, p] of Object.entries(c.placeMemory || {})) {
        const label = ctx.content?.locations?.[locId]?.name || String(locId).replace(/[_-]+/g, " ").replace(/\b\w/g, ch => ch.toUpperCase());
        try { applyCodexUpdates(c, [{ entityId: locId, label: String(label).slice(0, 60), kind: "place", fact: "you have walked here" }], { day: p?.lastVisit ?? null }); } catch { /* mirror only */ }
      }
      const mirrored = Object.keys(topics).length - before;
      const notes = [];
      if (registered.length) notes.push(`People the story already established, now known: ${registered.join(", ")}.`);
      if (mirrored > 0) notes.push(`Your codex now records the people you've met and the places you've walked (${mirrored} added).`);
      return notes.length ? { notes } : {};
    }
  },
  {
    version: 16, id: "companion-stages-and-codex", playerFacing: true,
    // SNG-200 §1 + §4. Stage is now LIVE-DERIVED from bond against the companion's authored stages[] (not
    // a stored value), so a maxed bond reaches its true top stage the instant the ladder ships — Huginn at
    // bond 10 becomes stage 3 ("The One Who Stays") with no regrind. This step does the parts live
    // derivation can't: (a) give every current companion the codex node the new mirror writes going forward
    // (§4 — companions were in NEITHER the npc nor generated codex path), and (b) name, once, any companion
    // whose relationship has reached a stage the old two-stage cap kept hidden. Idempotent: codex dedupes;
    // the note fires once via the version gate. hooks never surface (§5). Never fabricates — reads the bond
    // the save already holds.
    apply: (c, ctx) => {
      const cat = ctx.content?.companions || {};
      const rules = ctx.content?.rules;
      const notes = [];
      for (const entry of c.companions || []) {
        const id = typeof entry === "string" ? entry : entry?.id;
        const def = cat[id];
        if (!def) continue;
        const name = c.companionNames?.[id] || def.name;
        const b = bondOf(c, id, rules, def.stages);
        try { applyCodexUpdates(c, [companionCodexUpdate({ ...def, name, id }, { stage: b.stage })], { day: null }); } catch { /* mirror only */ }
        // name a companion sitting at a stage beyond the old ceiling (stage ≥ 3, or its authored top when > 2)
        const top = companionStageCount(def.stages);
        if (b.stage >= 3 || (b.stage === top && top > 2)) {
          const st = (def.stages || []).find(x => x.stage === b.stage);
          if (st) notes.push(`${name} has grown into ${st.name}.`);
        }
      }
      return notes.length ? { notes: [`Your companions' stories can deepen further than they could: ${notes.join(" ")}`] } : {};
    }
  },
  {
    version: 17, id: "gen-tracking-object", playerFacing: false,
    // SNG-216. Older saves minted generated entities (notably transit locations, app.js) with `_gen: true` —
    // a boolean flag, not the tracking OBJECT every generate.js reader expects. The presence guard
    // `if (!g) return` passed on `true`, then the first WRITE (`g.engagementScore = …` in recordAttention)
    // threw "Cannot create property on boolean", aborting the whole turn's location commit mid-apply — the
    // real cause of the SNG-210 travel desync. generate.js's readers are now type-guarded (the urgent half),
    // so this can never crash again; this step heals the DATA so those entities re-enter the attention/tier
    // system instead of being permanently inert. Walks every generated record and, where `_gen` is not a
    // proper object, replaces it with a fresh default tracking object. Idempotent: only touches malformed
    // `_gen`; a real tracking object is left exactly as-is. Silent — no player-facing note (pure hygiene).
    apply: (c) => {
      const gen = c.generated;
      if (!gen || typeof gen !== "object") return {};
      let healed = 0;
      for (const type of ["npc", "location", "arc"]) {
        const pool = gen[type];
        if (!pool || typeof pool !== "object") continue;
        for (const rec of Object.values(pool)) {
          if (!rec || typeof rec !== "object") continue;
          if (rec._gen && typeof rec._gen === "object") continue; // already a proper tracking object
          rec._gen = {
            entityId: rec.id || null, type,
            birthWeight: 1, engagementScore: 0, tier: "fresh", rating: null,
            attentionHistory: [], createdDay: null,
            provenance: { healed: "sng-216-backfill" }
          };
          healed++;
        }
      }
      if (healed) console.log(`[reconcile] sng-216: healed ${healed} generated entit${healed === 1 ? "y" : "ies"} with a boolean/missing _gen → tracking object`);
      return {}; // silent hygiene — no player-facing note
    }
  },
  {
    version: 18, id: "quest-prose-escapes", playerFacing: false,
    // SNG-217. A model-authored structured quest (Silas's The Second Thread) stored paragraph breaks as the
    // literal two characters `\n` inside its JSON strings; the renderer showed them verbatim. The write path
    // now normalizes on store (structuredQuestRecord / applyQuestUpdates) and the render path renders the
    // markdown (`**bold**` + breaks) — this step heals quests ALREADY in the save. Normalizes literal
    // `\n`/`\t` → real breaks in every quest prose field. Idempotent: a real newline is never matched by the
    // literal-escape regex, so running twice is a no-op. Silent — pure text hygiene, no player-facing note.
    apply: (c) => {
      let healed = 0;
      const fix = (obj, key) => { if (!obj) return; const v = obj[key]; const n = normalizeProse(v); if (n !== v) { obj[key] = n; healed++; } };
      const fixArr = (obj, key) => { if (!obj || !Array.isArray(obj[key])) return; obj[key] = obj[key].map(x => { const n = normalizeProse(x); if (n !== x) healed++; return n; }); };
      for (const q of c.quests || []) {
        if (!q || typeof q !== "object") continue;
        fix(q, "premise"); fix(q, "stakes"); fix(q, "summary");
        fixArr(q, "progress");
        for (const s of q.stages || []) { fix(s, "objective"); fix(s, "condition"); fix(s, "change"); }
        for (const o of q.outcomes || []) { fix(o, "summary"); fixArr(o, "narration"); }
      }
      if (healed) console.log(`[reconcile] sng-217: normalized ${healed} quest prose field(s) that stored literal escape sequences`);
      return {}; // silent hygiene — no player-facing note
    }
  },
  {
    version: 19, id: "gen-location-promote", playerFacing: true,
    // SNG-221. The living world mints gen-locations (a named place the fiction reached before the map knew
    // it — "gen-stillwater-s-trouble"). Later a CANONICAL file is authored for that place ("the_old_warden_post":
    // the buildings, the layout, the rich description). Now the buildings live on the canonical id and the
    // PLAY-STATE (the wards seated, the claim, the visits) lives on the gen id, and nothing links them — one
    // place split across two ids. This promotes the gen-location to its canonical file: for every canonical
    // location that DECLARES `supersedes: [genId…]`, any of those gen ids present in this save has its
    // play-state MIGRATED onto the canonical id, and an alias is recorded so any lingering reference resolves.
    // GENERAL (§5): scans all canonical locations, not one Stillwater special-case. Canonical wins on
    // DESCRIPTION (the file's prose); the SAVE wins on STATE — the wards, claim and visits are CARRIED, never
    // blanked by the file's empty state fields (the one place the layers invert, §GUARD). Runs wherever the
    // gen id appears — currentLocationId, activeScene, placeMemory, knownPlaces, images — never a partial
    // migration that leaves a split-brain place. Idempotent: a gen id already aliased is skipped.
    apply: (c, ctx) => {
      const locs = ctx.content?.locations || {};
      c.locationAliases = c.locationAliases || {};
      let promoted = 0; let name = null;
      for (const [canonId, loc] of Object.entries(locs)) {
        for (const genId of (loc.supersedes || [])) {
          if (!genId || c.locationAliases[genId] === canonId) continue; // already promoted → no-op (idempotent)
          let moved = false;
          // placeMemory — the ward notes, the claim, the visits. Merge onto the canonical id; the SAVE's
          // recorded state wins (canonical placeMemory rarely exists — placeMemory is a save-only overlay).
          const gm = c.placeMemory?.[genId];
          if (gm) {
            c.placeMemory = c.placeMemory || {};
            const cm = c.placeMemory[canonId] || (c.placeMemory[canonId] = { visits: 0, notes: [], flags: {} });
            cm.visits = Math.max(cm.visits || 0, gm.visits || 0);
            for (const n of gm.notes || []) if (!(cm.notes || []).includes(n)) cm.notes = [...(cm.notes || []), n];
            cm.flags = { ...(cm.flags || {}), ...(gm.flags || {}) }; // save STATE wins on conflict
            if (gm.name && !cm.name) cm.name = gm.name;
            // §3c: structure the CLAIM/reactivation as a flag the engine + GM context can READ (not only prose).
            // The detailed ward text stays in notes (it narrates well); a future ward-mechanic fills `wards`.
            cm.claim = { ...(cm.claim || {}), reactivated: true, promotedFrom: genId, wards: cm.claim?.wards || [] };
            delete c.placeMemory[genId];
            moved = true;
          }
          // knownPlaces — keep the place known, under the real id (dedupe).
          if (Array.isArray(c.knownPlaces) && c.knownPlaces.includes(genId)) {
            c.knownPlaces = [...new Set(c.knownPlaces.map(p => (p === genId ? canonId : p)))];
            moved = true;
          }
          // the tracked location pointers (ties to SNG-210 — repoint wherever they sit at the gen id).
          if (c.currentLocationId === genId) { c.currentLocationId = canonId; moved = true; }
          if (c.activeScene && c.activeScene.locationId === genId) { c.activeScene.locationId = canonId; moved = true; }
          // images keyed to the gen id.
          if (c.locationImages && c.locationImages[genId] && !c.locationImages[canonId]) { c.locationImages[canonId] = c.locationImages[genId]; delete c.locationImages[genId]; moved = true; }
          // the generated pool record: mark it superseded for provenance (don't delete — a hard ref elsewhere
          // still resolves via the alias below; the canonical file now owns the description).
          const genRec = c.generated?.location?.[genId];
          if (genRec) { genRec.supersededBy = canonId; moved = true; }
          c.locationAliases[genId] = canonId; // the id bridge — belt-and-suspenders for any lingering gen-id ref
          if (moved) { promoted++; name = loc.name || canonId; }
        }
      }
      if (promoted) console.log(`[reconcile] sng-221: promoted ${promoted} gen-location(s) to their canonical file`);
      return promoted ? { notes: [`${name} is one place again — its buildings and the work you did there (the wards, the claim) are joined under its true name.`] } : {};
    }
  },
  {
    version: 6, id: "place-containment", playerFacing: true,
    // SNG-154 stage 4. Repair a save whose place hierarchy was scrambled before `parentId` existed.
    // Containment used to be inferred per-write from wherever the engine last believed the
    // character was standing, so rooms landed in the wrong building and a place promoted out of a
    // sub-place forgot what it was inside of. NOTHING IS DELETED: every sub-place keeps its record.
    //  (a) stamp parentId on every sub-place that lacks it (its current host — the status quo, now explicit)
    //  (b) a location that ALSO exists as someone's sub-place gains that parentId (the promotion link
    //      the Low Lamp Inn lost, which is why the map hash-gridded it across the world)
    //  (c) collapse truncation twins: two sub-places under ONE parent whose names are prefixes of
    //      each other (`upper-meadow` / `upper-meadow-north-of-millbrook-`) are one place recorded
    //      twice by the pre-SNG-152 40-char cut. Keep the longer name, union the notes.
    apply: (c) => {
      const pm = c.placeMemory || {};
      if (!Object.keys(pm).length) return {};
      let stamped = 0, linked = 0;
      const merged = [];
      for (const [locId, p] of Object.entries(pm)) {
        const subs = p?.subPlaces || {};
        for (const sp of Object.values(subs)) if (sp && !sp.parentId) { sp.parentId = locId; stamped++; }
        // (c) truncation twins, within this parent only
        const entries = Object.entries(subs).sort((a, b) => (b[1]?.name || "").length - (a[1]?.name || "").length);
        for (let i = 0; i < entries.length; i++) {
          const [keepSlug, keep] = entries[i];
          if (!subs[keepSlug]) continue;
          for (let j = i + 1; j < entries.length; j++) {
            const [dropSlug, drop] = entries[j];
            if (!subs[dropSlug] || dropSlug === keepSlug) continue;
            const a = String(keep?.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
            const b = String(drop?.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
            if (!a || !b || a === b || !a.startsWith(b) || b.length < 6) continue; // prefix-of, not merely similar
            if (drop?.note && !keep.note) keep.note = drop.note;
            keep.visited = keep.visited || drop.visited;
            keep.day = keep.day ?? drop.day;
            delete subs[dropSlug];
            merged.push(keep.name);
          }
        }
      }
      // (b) promoted-out-of-a-sub-place locations regain their parent
      for (const [, recs] of Object.entries(c.generated || {})) {
        for (const rec of Object.values(recs || {})) {
          if (!rec || rec.parentId || rec._gen?.type !== "location") continue;
          const slug = String(rec.id || "").toLowerCase();
          for (const [locId, p] of Object.entries(pm)) {
            if (locId === rec.id) continue;
            const subs = p?.subPlaces || {};
            const hit = subs[slug] || Object.values(subs).find(sp => String(sp?.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") === slug);
            if (hit) {
              rec.parentId = locId; rec._promotedFromSubPlace = true; linked++;
              // Relinking the parent is not enough on its own: `autoMapPositions` prefers a STORED
              // `map` coord over any anchor, so the hash-gridded coordinate the place was born with
              // would keep it across the map even once it knows its container. `map` is a DERIVED
              // CACHE of position, not the truth — so invalidate it and let it re-derive beside the
              // parent. (Caught in the browser: parentId was right and the Inn was still 416px away.)
              delete rec.map;
              break;
            }
          }
        }
      }
      if (!stamped && !linked && !merged.length) return {};
      const notes = [];
      if (linked) notes.push(linked === 1
        ? `The world remembered its shape — a place you made real now knows what it sits inside, and the map puts it there.`
        : `The world remembered its shape — ${linked} places you made real now know what they sit inside, and the map puts them there.`);
      if (merged.length) notes.push(`Merged ${merged.length} place${merged.length === 1 ? "" : "s"} that had been recorded twice under a cut-off name: ${[...new Set(merged)].slice(0, 3).join(", ")}.`);
      return notes.length ? { notes } : {};
    }
  },
  {
    version: 20, id: "npc-registry-id-backfill", playerFacing: false,
    // CCODE-20. A quest/hunt-effect giver stub (quests.js npc_state/ally) was written {name, questState}
    // with NO `id` field. findExistingNpc reads `n.id.split(...)` on EVERY npcUpdate, so ONE id-less stub
    // threw and aborted the whole meet — the character the GM just introduced never registered, so its name
    // never stuck ("the fourth or fifth name none of them sticking"). The writer now stamps id and
    // findExistingNpc guards a missing id; this heals the DATA in saves that already carry an id-less stub.
    // Idempotent: sets id from the registry KEY only where it's missing; a well-formed entry is untouched.
    apply: (c) => {
      const reg = c.npcRegistry;
      if (!reg || typeof reg !== "object") return {};
      let healed = 0;
      for (const [key, n] of Object.entries(reg)) {
        if (n && typeof n === "object" && !n.id) { n.id = key; healed++; }
      }
      if (healed) console.log(`[reconcile] ccode-20: stamped id on ${healed} id-less npcRegistry entr${healed === 1 ? "y" : "ies"} (were poisoning findExistingNpc → the name-won't-stick bug)`);
      return {}; // silent hygiene — no player-facing note
    }
  },
  {
    version: 21, id: "quest-route-outcome-shape", playerFacing: false,
    // CCODE-21 / SNG-232 seam. structuredQuestRecord now guarantees routes={trad:string} + named outcomes, but
    // existing saves carry a structured quest (Silas's "The Second Thread") whose `routes` is an ARRAY of
    // {id,note} — the ENDING text landed in the wrong field — and whose `outcomes` are id-only. So "How you
    // might go through it" rendered [object Object] and "Resolve" was blank. Heal in place: recover each
    // outcome's missing summary from a same-id routes[].note, name it from its id, then drop the malformed
    // array routes to {}. A well-formed quest is untouched. Idempotent.
    apply: (c) => {
      const titleize = s => String(s || "").replace(/[-_]+/g, " ").replace(/\b\w/g, ch => ch.toUpperCase()).trim();
      let healed = 0;
      for (const q of (c.quests || [])) {
        if (!q || !q.structured) continue;
        if (Array.isArray(q.routes)) {
          const byId = {};
          for (const r of q.routes) if (r && r.id) byId[r.id] = r.note || r.text || r.summary || "";
          for (const o of (q.outcomes || [])) {
            if (!o) continue;
            if (!o.summary && byId[o.id]) o.summary = byId[o.id]; // recover the ending text from the wrong field
            if (!o.name && o.id) o.name = titleize(o.id);
          }
          q.routes = {}; // an array is not a tradition→text map — drop it (it rendered as [object Object])
          healed++;
        } else {
          for (const o of (q.outcomes || [])) if (o && !o.name && o.id) o.name = titleize(o.id);
        }
      }
      if (healed) console.log(`[reconcile] ccode-21: healed ${healed} quest(s) with array-shaped routes → recovered endings, emptied the bad routes`);
      return {};
    }
  },
  {
    version: 22, id: "reopen-flat-completed-structured-quests", playerFacing: true,
    // SNG-204/235 bug (Silas's waygate): before the applyQuestUpdates fix, a GM `complete` op FLAT-completed a
    // structured quest (status "completed", no outcomeId) — bypassing the OUTCOME decision that is the sole path
    // firing effects/wakes/waygates. So the quest read done while its ending was never chosen and its
    // create_waygate/wake never fired. Recover: a structured quest marked "completed" with NO outcomeId and all
    // stages done is re-opened to its DECISION (status active + awaitingResolution) so the player resolves it
    // properly. Also refresh its outcomes' EFFECTS from the current def (a since-authored effect like SNG-235's
    // create_waygate was never copied onto the started instance). A legitimately resolved quest (has outcomeId)
    // is untouched. Idempotent (a re-opened quest has no outcomeId but IS active, so it won't re-trigger).
    apply: (c, ctx) => {
      const defsRaw = ctx?.content?.quests || [];
      const defById = {};
      for (const d of (Array.isArray(defsRaw) ? defsRaw : [])) if (d && d.id) defById[String(d.id).replace(/_/g, "-")] = d;
      let reopened = 0, refreshed = 0;
      for (const q of (c.quests || [])) {
        if (!q || !q.structured) continue;
        const allStagesDone = (q.completedStages || []).length >= (q.stages || []).length || (q.stageIndex || 0) >= (q.stages || []).length;
        if (q.status !== "completed" || q.outcomeId || !allStagesDone) continue;
        q.status = "active"; q.awaitingResolution = true; delete q.resolvedAt;
        reopened++;
        const def = defById[String(q.id).replace(/_/g, "-")];
        if (def && Array.isArray(def.outcomes)) {
          for (const o of (q.outcomes || [])) {
            const dOut = def.outcomes.find(x => x.id === o.id);
            if (dOut && Array.isArray(dOut.effects) && dOut.effects.length) { o.effects = dOut.effects; refreshed++; } // current authoring wins for an unresolved quest
          }
        }
      }
      if (reopened) console.log(`[reconcile] sng-204/235: re-opened ${reopened} flat-completed structured quest(s) to their decision (refreshed ${refreshed} outcome effect-set(s) from the current def)`);
      return {};
    }
  },
  {
    version: 23, id: "repair-coerced-object-locations", playerFacing: true,
    // SNG-329 — ⚠️ THE DAMAGE IS ALREADY ON DISK, so a forward fix is only two-thirds of the job.
    //
    // `moveTo.location` could arrive as an OBJECT; `String(ref)` turned it into the literal text
    // "[object Object]", slugified to `gen-object-object`, TITLE-CASED to "[Object Object]", and minted into
    // `character.generated.location` — a write that persists, survives reload, and feeds its own
    // `descriptionSeed` back to the GM as context. Found in play by Erik (Splarf), traced by Aevi.
    //
    // ⛔ THE TITLE-CASING IS WHY IT SURVIVED. "[Object Object]" is a well-formed string with capitals and
    // spaces — every "does it have a name" check in this codebase passes it, and it reads like a place.
    // Three saves carry it, two from characters older than that play session.
    //
    // ⛔ AND IT DROPS RATHER THAN RENAMES. A record whose name was never real has no true name to restore;
    // inventing one would put a place into someone's canon the fiction never named. Dropping returns the
    // save to the state it would have had if the mint had refused — which is what the mint now does. If the
    // player is standing in it, they are moved to the place it was minted FROM rather than stranded.
    apply: (character) => {
      const gen = character?.generated?.location;
      if (!gen || typeof gen !== "object") return {};
      // ⛔ THE NARROW CHECK, NOT THE MINT'S WIDE ONE. `isCoercedObjectName` also catches a MISSING name,
      // which is a different defect with a non-destructive fix — and using it here deleted a legitimate
      // fixture in the suite, which is exactly how I found out. A migration that deletes must be scoped to
      // the damage: only the `[object Object]` artefact was never a real place.
      const bad = Object.entries(gen).filter(([, rec]) => isCoercedObjectArtefact(rec?.name));
      if (!bad.length) return {};
      for (const [id, rec] of bad) {
        if (character.currentLocationId === id) {
          character.currentLocationId = (Array.isArray(rec?.connections) && rec.connections[0]) || character.startingLocation || null;
        }
        if (Array.isArray(character.knownPlaces)) character.knownPlaces = character.knownPlaces.filter(k => k !== id);
        delete gen[id];
      }
      console.log(`[reconcile] sng-329: dropped ${bad.length} location(s) minted from a coerced object — ${bad.map(([id]) => id).join(", ")}`);
      return { note: `Removed ${bad.length} place record(s) that were never really named.` };
    }
  },
  {
    version: 24, id: "restore-lost-place-edges", playerFacing: true,
    // SNG-330 — ⚠️ THE ROADS A PLAYER ALREADY WALKED, PUT BACK.
    //
    // `mintTransitLocation` wrote both edges but only one of them could persist: `new → here` lives on
    // `character.generated.location`, while `here → new` mutated AUTHORED content, which is shared and
    // never saved. On reload the return road was gone, and with it the Travel button — while the place
    // still showed on the map, still read as known, and the fiction still remembered going there.
    //
    // ⛔ THIS IS ADDITIVE AND DERIVED, WHICH IS WHAT LETS IT RUN AT ALL: every edge it writes is one the
    // save already asserts from the other side. It invents no road — it copies `new → here` back as
    // `here → new` into `placeEdges`, where it can survive. Reconcile's law is "derives from durable state,
    // never fabricates history", and the generated store IS the durable state here.
    apply: (character) => {
      const gen = character?.generated?.location;
      if (!gen || typeof gen !== "object") return {};
      character.placeEdges = character.placeEdges || {};
      let restored = 0;
      for (const [id, rec] of Object.entries(gen)) {
        for (const other of (Array.isArray(rec?.connections) ? rec.connections : [])) {
          if (!other || other === id) continue;
          const have = character.placeEdges[other] || [];
          if (have.includes(id)) continue;
          character.placeEdges[other] = [...have, id];
          restored++;
        }
      }
      if (!restored) return {};
      console.log(`[reconcile] sng-330: restored ${restored} return road(s) that could not persist`);
      return { notes: [`The way back from ${restored} place${restored === 1 ? "" : "s"} you found is on your map again.`] };
    }
  },
  {
    version: 25, id: "grant-starting-training", playerFacing: true,
    // SNG-339b — ⚠️ THE GRANT ONLY FIRED AT CREATION, AND EVERY EXISTING CHARACTER ALREADY EXISTS.
    //
    // Erik: "I'm ready for Splarf to stop failing everything now." Splarf is level 1 with `skills: {}` — the
    // tables Aevi authored are live and correct, and they reach nobody who was made before them. This is
    // precisely what reconcile is for, and the same shape as `personal-arc-backfill`: a save from before a
    // feature existed gains what it is owed on next login.
    //
    // ⛔ IT GRANTS ONLY WHAT CREATION WOULD HAVE, and never lowers an existing rank — a character who has
    // already practised something keeps the higher number. Deriving from `background` + `domains.primary`,
    // both of which the save already carries; nothing is invented and nothing is guessed.
    apply: (c, ctx) => {
      const rules = ctx?.content?.rules || ctx?.rules;
      if (!rules?.startingSkills) return {};                 // tables unauthored — grant nothing, say nothing
      const owed = startingSkills({ backgroundId: c.background, traditionId: c.domains?.primary }, rules);
      const tags = Object.keys(owed);
      if (!tags.length) return {};
      c.skills = c.skills || {};
      const gained = [];
      for (const [tag, rank] of Object.entries(owed)) {
        if ((Number(c.skills[tag]) || 0) >= rank) continue;  // never lower what play has already earned
        c.skills[tag] = rank;
        gained.push(`${tag} ${rank}`);
      }
      if (!gained.length) return {};
      console.log(`[reconcile] sng-339b: granted the training ${c.name || "this character"} came with — ${gained.join(", ")}`);
      return { notes: [`What you came from finally counts for something: ${gained.join(", ")}.`] };
    }
  },
  {
    version: 26, id: "flag-severed-quest-prose", playerFacing: true,
    // SNG-343 — ⚠️ SIX SEVERED STRINGS ARE ALREADY IN SPLARF'S SAVE, and they cannot be recovered: the cut
    // ran at STORE time, so the rest was never written down.
    //
    // ⛔ THE CHOICE MATTERS AND I AM NOT REGENERATING. Aevi named three options — regenerate the quest, mark
    // the fields incomplete, or leave them silently. Regenerating REWRITES CANON THE PLAYER HAS ALREADY READ
    // AND MAY HAVE ACTED ON, which is a worse harm than a broken sentence: the quest they are halfway
    // through would quietly become a different quest. Leaving it silent is the option she rightly called
    // worst. So it is MARKED — and marked in the direction of repair-through-play rather than a scar.
    //
    // ⚠️ THE FLAG IS FOR THE GM, NOT THE PLAYER. A visible "[truncated]" tells the player the game is broken
    // and leaves the sentence just as broken. Telling the GM the text was severed lets it finish the
    // thought naturally in the next beat, which is the only route back to a whole quest that exists.
    apply: (c) => {
      // Exactly 200 and ending mid-word is the signature of the old `slice(0, 200)`. Checking both
      // together avoids flagging a legitimately 200-character sentence that happens to end on a boundary.
      const severed = (t) => typeof t === "string" && t.length === 200 && !/[.!?"’”)\]]\s*$/.test(t);
      const hit = [];
      for (const q of c.quests || []) {
        for (const st of q.stages || []) if (severed(st.objective)) { st._severed = true; hit.push(`${q.id}/${st.id}`); }
        for (const [k, v] of Object.entries(q.routes || {})) if (severed(v)) {
          q._severedRoutes = [...new Set([...(q._severedRoutes || []), k])];
          hit.push(`${q.id}/route:${k}`);
        }
      }
      if (!hit.length) return {};
      console.log(`[reconcile] sng-343: flagged ${hit.length} quest string(s) severed by the old store-time cap — ${hit.join(", ")}`);
      return { notes: [`Some quest text was cut short by a storage fault and has been flagged — the telling will fill it back in.`] };
    }
  },
  {
    version: 27, id: "grant-baseline-defense", playerFacing: true,
    // SNG-345 — martial_paths' OWN engineNote asked for this step by name: "SNG-022 reconciliation grants
    // them to existing characters on login (your Ent gets its branch-club next login)." The content said
    // so on 2026-07-07 and nothing read it, which is why Splarf reached level 1 with no way to defend
    // itself that did not come out of a build.
    //
    // ⚠️ THE FLOOR IS NOT A REWARD, so it is granted unconditionally rather than offered: Aevi's line
    // is "not a class, a FLOOR — the universal animal competence of protecting yourself." Offering it would
    // make it a choice, and a floor you can decline is not a floor.
    apply: (c, ctx) => {
      // ⛔ READ FROM WHAT THE CALLER ACTUALLY PASSES. I wrote `ctx.rules.martialPaths` first; the character
      // ctx is `{ content, profile }` and carries no `rules`, so this step would have run on every login,
      // found undefined, returned silently, and gated green — the PromisedButUnread family, reintroduced
      // inside the commit closing it. Both paths accepted so a caller that DOES pass `rules` also works,
      // and the miss is now LOUD rather than a silent no-op.
      const martial = ctx?.rules?.martialPaths || ctx?.content?.rules?.martialPaths;
      // Warn only when a REAL ctx was passed and the rules are missing from it. Tests deliberately call
      // reconcile(x, "character", {}) with no ctx at all; warning there fires nine times a suite and trains
      // everyone to scroll past the one that matters.
      if (!martial) {
        if (ctx?.content || ctx?.rules) console.warn("[reconcile] sng-345: ctx carries no martialPaths — baseline kit NOT granted");
        return {};
      }
      const { granted, kit, why } = grantMartialKit(c, martial);
      if (!granted.length) return {};
      console.log(`[reconcile] sng-345: granted ${granted.length} baseline ability(ies)${kit ? ` + the ${kit} form kit` : ""} — ${why}: ${granted.join(", ")}`);
      return { notes: [kit
        ? `You have always known how to defend yourself — and your form has its own answers. (${granted.length} abilities, free.)`
        : `You have always known how to defend yourself: brace, strike, break away, call for help. (${granted.length} abilities, free.)`] };
    }
  },
  {
    version: 28, id: "flag-unnamed-generated-npcs", playerFacing: false,
    // SNG-347 — Erik has at least one of these live: "someone tending the waystation fire—shelter-keeper,
    // traveler", minted from the generateRequest HINT and announced in bold as a name.
    //
    // ⛔ NOT RENAMED, MARKED. Three options existed and only one is honest: inventing a name writes canon
    // the player never heard; deleting the NPC removes someone the fiction already met; marking them
    // unnamed lets the telling supply the name, which is the only route to a REAL one. Same reasoning as
    // SNG-343's severed prose — a flag to the GM beats both a fabrication and a scar.
    apply: (c) => {
      const hit = [];
      for (const rec of Object.values(c.generated?.npc || {})) {
        if (rec.nameProvisional) continue;
        if (!isDescriptiveNotName(rec.name)) continue;
        rec.nameProvisional = true;
        if (!rec.description) rec.description = rec.name;
        hit.push(rec.name);
      }
      if (!hit.length) return {};
      console.log(`[reconcile] sng-347: ${hit.length} generated NPC(s) carry a DESCRIPTION where a name belongs — marked unnamed, to be named in play: ${hit.join(" · ")}`);
      return {};
    }
  },
  {
    version: 29, id: "ladder-derived-grants", playerFacing: true,
    // SNG-356 — ERIK RULED THE LADDER RETROACTIVE, so every existing character is owed what its
    // sub-attributes have always been worth. The harness previewed this on the real saves before it ran
    // (SNG-357 §1c) rather than after — a migration you cannot inspect first is one you find out about
    // from a player, which is the SNG-343 lesson pointed forward.
    //
    // ⚠️ IDEMPOTENT BY HIGH-WATER MARK, not by the version gate alone: `ladderPaid[sub]` records the
    // rank each pool was paid to, so this pays the DIFFERENCE and a second pass grants nothing. That also
    // makes the ordinary case (a rank bought in play) the same code path as the retroactive one.
    apply: (c, ctx) => {
      const ladder = ctx?.rules?.subAttributeLadder || ctx?.content?.rules?.subAttributeLadder;
      if (!ladder) { if (ctx?.content || ctx?.rules) console.warn("[reconcile] sng-356: ctx carries no subAttributeLadder — derived grants NOT applied"); return {}; }
      const applied = applyLadderGrants(c, ladder);
      if (!applied.length) return {};
      const parts = applied.map(g => `${g.sub} ${g.to} → +${g.amount} ${g.field}`);
      console.log(`[reconcile] sng-356: ladder grants applied — ${parts.join(" · ")}`);
      return { notes: [`What you have grown into has caught up with you: ${applied.map(g => `+${g.amount} ${g.unit || g.field}`).join(", ")}.`] };
    }
  },
  {
    version: 32, id: "holdings-from-assignments", playerFacing: true,
    // ⛔ SNG-358 — A PLACE THE PLAYER HAS HELD FOR THIRTY LEVELS THAT THE HOLDINGS SYSTEM HAS NEVER
    // HEARD OF. Aevi reported that the Raven's Home post "will leave state when the reconstruction
    // completes". ⚠️ IT IS WORSE THAN THAT: it is not in the holdings system at all. It exists only as an
    // assignment string. There is nothing for completion to delete because nothing was ever created.
    //
    // ⛔ AND THIS STEP MINTS NOTHING. It returns `offers` — the channel the reconcile contract has
    // carried since it was written ("GRANTS: surfaced, never auto-imposed") and that no step had ever
    // produced. ⚠️ THE EVIDENCE FOR WHY IS IN SILAS'S OWN SAVE: the charge "Silas's named delegate to
    // Mara Wells and the Hub committee water meeting" — which is a RELATIONSHIP and must never become a
    // holding — contains the words "holds the Millbrook crisis thread". A location resolver finds a real
    // authored place in the ONE assignment that must not have one. ⛔ AUTO-MINTING WOULD CREATE A POST AT
    // MILLBROOK OUT OF A DELEGATION TO A PERSON.
    //
    // ⚠️ SO THIS CLASSIFIES NOTHING. Every assignment without a holding is offered for REVIEW, with a
    // hint about what it looks like; the player decides. ⛔ A HINT IS NOT A FILTER — the trap charge is
    // offered too, marked as reading like a person rather than a place, because a charge silently
    // withheld is a decision made on the player's behalf by a heuristic that has already been wrong once.
    //
    // ⚠️ A `done` ASSIGNMENT IS OFFERED TOO, AND IS THE MOST IMPORTANT CASE — a finished reconstruction
    // is exactly when the post should outlive the work that built it.
    apply: (c, ctx) => {
      const list = Object.values(c.worldState?.assignments || {});
      if (!list.length) return {};
      const already = new Set((c.holdings || []).map(h => h?.fromAssignment).filter(Boolean));
      // ⛔ AND ONE THE PLAYER HAS ALREADY SAID IS NOT A PLACE IS NEVER ASKED ABOUT AGAIN. A question that
      // keeps being asked after it has been answered is nagging, and DESIGN_celebrations §3 is explicit that
      // anything firing more than once for the same subject is a bug that feels like one.
      for (const id of c.holdingsNotPlaces || []) already.add(id);
      const locations = ctx.content?.locations || {};
      // ⚠️ LONGEST NAME FIRST, so "Raven's Home" is not shadowed by a shorter place whose name is a
      // substring of it. Measured: 1 of Silas's 4 charges resolves to a real place, and a second
      // resolves to one it must never be given.
      const places = Object.values(locations)
        .filter(l => l && l.name && String(l.name).length > 3)
        .sort((a, b) => String(b.name).length - String(a.name).length);
      // ⛔ THE ROLE AND STRUCTURE WORDS A POST IS DESCRIBED WITH. "warden of", "post", "keeper" describe a
      // STANDING somewhere; "delegate to", "committee", "meeting" describe a person you answer to.
      const placeWord = /\b(post|hall|forge|keep|watch|station|steading|holding|workshop|laboratory|warden|keeper|steward|garrison|outpost)\b/i;
      const personWord = /\b(delegate to|committee|meeting|liaison|envoy|emissary)\b/i;
      const offers = [];
      for (const a of list) {
        if (!a?.id || already.has(a.id)) continue;
        const charge = String(a.charge || "");
        if (!charge) continue;
        const hit = places.find(l => charge.toLowerCase().includes(String(l.name).toLowerCase()));
        const looksLikePlace = placeWord.test(charge);
        const looksLikePerson = personWord.test(charge);
        offers.push({
          kind: "holding", assignmentId: a.id, npcId: a.npcId || null, npcName: a.npcName || null,
          charge, status: a.status || "working",
          // ⚠️ A SUGGESTION, NEVER A DECISION. The player names it — that is the part of the format that
          // makes it land, and a place they have cared about for thirty levels should not arrive
          // pre-named by a substring match.
          suggestedLocationId: hit?.id || null, suggestedLocationName: hit?.name || null,
          looksLikePlace, looksLikePerson,
          why: looksLikePerson && !looksLikePlace
            ? "This reads like a person you delegated to rather than a place you hold — probably not a holding."
            : looksLikePlace
              ? "This reads like a standing post — a place that would outlast the work."
              : "Only you can say whether this is a place."
        });
      }
      if (!offers.length) return {};
      // ⛔ AND THEY ARE PERSISTED, BECAUSE A RECONCILE STEP RUNS EXACTLY ONCE. `reconcile()` skips any
      // step whose version is at or below the save's `reconcileVersion`, so an offer returned and not
      // acted on that same session would be gone FOREVER — the question would be asked once, silently,
      // to a player who may not have been looking at the right screen.
      // ⚠️ AN OFFER IS A STANDING QUESTION UNTIL IT IS ANSWERED. It lives on the character, not in the
      // return value, and only accepting or dismissing it removes it.
      c.holdingOffers = [...(c.holdingOffers || []).filter(o => !offers.some(n => n.assignmentId === o.assignmentId)), ...offers];
      const n = offers.length;
      return { offers, notes: [`${n} assignment${n === 1 ? "" : "s"} may describe a place you hold — review ${n === 1 ? "it" : "them"} in your holdings.`] };
    }
  },
  {
    version: 33, id: "holdings-keeper-restored", playerFacing: true,
    // ⛔ ERIK 2026-09-05 — "I assigned them… but I can't see who is assigned." Silas's two accepted holds lost their keepers
    // on the world tick's FIRST pass (world count 1612): `unstewardedHoldings` read "not in the active company" as "gone",
    // and a steward is a delegate who stays at the hold — never a companion. The rule is fixed (`keeperGone`); this puts
    // back what it wiped: a hold with no keeper that came from an assignment gets that assignment's person, when the
    // registry does not say dead or departed. History says it happened. Nothing else moves — the condition it slipped to
    // stays, because a pass DID go by unkept; the keeper is simply back at their post.
    apply: (c) => {
      const restored = [];
      for (const h of c.holdings || []) {
        if (!h || h.steward || !h.fromAssignment) continue;
        const a = c.worldState?.assignments?.[h.fromAssignment];
        const npcId = a?.npcId || String(h.fromAssignment).split("::")[0] || null;
        if (!npcId) continue;
        const status = String(c.npcRegistry?.[npcId]?.status || "").toLowerCase();
        if (status === "dead" || status === "departed") continue;
        h.steward = npcId;
        h.history = [...(h.history || []), { at: null, from: h.condition, to: h.condition, note: "keeper restored — the tick had wiped a delegate for not travelling with you" }].slice(-12);
        restored.push(c.npcRegistry?.[npcId]?.name || a?.npcName || npcId);
      }
      if (!restored.length) return {};
      return { notes: [`${restored.join(" and ")} ${restored.length === 1 ? "is" : "are"} back at ${restored.length === 1 ? "the post they keep" : "the posts they keep"} — the world had counted them gone for not travelling with you.`] };
    }
  },
  {
    version: 34, id: "baseline-kit-retired", playerFacing: true,
    // ⛔ ERIK 2026-09-05: "we should remove those basic granted skills from saves too. no one needs them anymore."
    // ⚑ R47's free floor replaced them: every T1 craft has a zero-cost form, so a drained character keeps their own
    // tradition instead of four generic verbs. ⚠️ MEASURED BEFORE REMOVING — at zero energy Silas had seven
    // zero-cost moves and none was from this kit: the four are verbless, so the battle menu skipped them and they
    // have never been playable. Removing them takes nothing away that was reaching him.
    // ⬜ A REMOVAL, NOT A MIGRATION: only entries the kit itself granted, only while the dial says retired, and a
    // craft the player has RANKED UP is left alone — that is theirs now, however it arrived.
    apply: (c, ctx) => {
      // the SAME path step 33's neighbour uses — `martialPaths`, not `martial`. A ctx key guessed rather than
      // copied is how a step silently does nothing.
      const ids = retiredBaselineIds(ctx?.rules?.martialPaths || ctx?.content?.rules?.martialPaths);
      if (!ids.length || !Array.isArray(c.abilities)) return {};
      const drop = new Set(ids);
      const removed = c.abilities.filter(a => a && drop.has(a.abilityId) && (Number(a.level) || 1) <= 1).map(a => a.abilityId);
      if (!removed.length) return {};
      c.abilities = c.abilities.filter(a => !(a && drop.has(a.abilityId) && (Number(a.level) || 1) <= 1));
      return { notes: [`The four basic moves are gone from your sheet — every craft you carry now has its own free form beneath rank one.`] };
    }
  },
  {
    version: 35, id: "r48-back-pay", playerFacing: true,
    // ⛔ R48 — SIXTY-SEVEN DAYS WITH NO INCOME PATH AT ALL, and that was never a tuning problem: the hold
    // store landed v1.9.354 and pilgrims v1.9.360, both AFTER the span in question. Every pass before that
    // produced nothing because nothing produced.
    // ⚑ ERIK RULED THE LARGER NUMBER — Aevi's 880: the Threshold Post at `thriving` for 22 passes (704) plus
    // its temple's alms at meaning 1.0 (176). ⚠️ The 35-deed ledger's 280 is NOT in this figure; it is a
    // separate line and Erik has not called for it.
    // ⚠️ AND THE 2d CORRECTION RIDES WITH IT, because the number is PREDICATED on it: both holds slipped to
    // `strained` only because `unstewardedHoldings` wiped their keepers (§72). Erik: "they should have only
    // grown." 22 passes under constant keepers reaches `thriving` and stays there.
    apply: (c, ctx) => {
      const notes = [];
      const cur = ctx?.rules?.economy?.holdStore?.upkeepCurrency || "crystal";
      const r = credit(c, cur, 880, { origin: "arrears" });
      if (!r?.ok) return {};
      notes.push(`880 ${cur} reaches your purse — arrears the world owed you for sixty-seven days it had no way to pay.`);
      // the two holds the keeper bug cost: restored to what constant keepers would have reached.
      const grown = [];
      for (const h of c.holdings || []) {
        if (!h || h.condition === "thriving") continue;
        h.history = [...(h.history || []), { at: null, from: h.condition, to: "thriving",
          note: "R48 §2d — restored: the tick had wiped its keeper, and a kept hold would have climbed" }].slice(-12);
        h.condition = "thriving";
        grown.push(h.name || h.id);
      }
      if (grown.length) notes.push(`${grown.join(" and ")} ${grown.length === 1 ? "is" : "are"} thriving — what they would have reached had the tick not taken their keepers.`);
      return { notes };
    }
  },
  {
    version: 36, id: "r48-deed-ledger", playerFacing: true,
    // ⛔ R48's SECOND LINE, ruled separately (Erik: "add the 280 deed ledger too"). ⚑ 35 deeds at 8 crystal —
    // two `useful` goods, what a valley pays for a service rendered — against a ledger that already exists.
    // ⚠️ IT NEEDS NO NEW MECHANISM: it is a one-time settlement against deeds the world already recorded.
    //
    // ⚑ AND IT COUNTS THE DEEDS ON THE SAVE rather than paying a stored 280. A number typed here would be a
    // copy of a derived value — this project's most-repeated defect — and a character with a different ledger
    // would be paid Silas's arrears. ⚠️ The RATE is the ruling; the COUNT is the character's own.
    apply: (c, ctx) => {
      const deeds = Array.isArray(c.deeds) ? c.deeds.length : 0;
      if (!deeds) return {};
      const perDeed = 8;
      const cur = ctx?.rules?.economy?.holdStore?.upkeepCurrency || "crystal";
      const owed = deeds * perDeed;
      const r = credit(c, cur, owed, { origin: "arrears" });
      if (!r?.ok) return {};
      return { notes: [`${owed} ${cur} for ${deeds} deed${deeds === 1 ? "" : "s"} on your record — a valley pays for a service rendered, and nobody had ever counted.`] };
    }
  },
  {
    version: 37, id: "place-generated-locations", playerFacing: false,
    // ⛔ FOURTEEN PLACES ON SILAS'S SAVE WERE NOWHERE, and one of them is the Whistling Woman Post — the
    // hold he spent four rounds getting granted and the ground he is standing on. A location with no
    // `worldPos` makes `geodesic` return null, which is the RIGHT answer to a missing position and the
    // wrong state for a world to be in: nothing can be routed to or from a place that is nowhere.
    //
    // ⚑ THE MINT PATH NOW PLACES NEW ONES, but a creation-path fix alone leaves these fourteen nowhere
    // forever — they were written before the fix existed. ⚠️ This is NOT a stored copy of a derived value:
    // `worldPos` is the authoritative field every one of the 135 authored locations already carries, and
    // this gives a generated place the same standing rather than caching a computation.
    //
    // ⚠️ It derives from `connections[0]` — the place this one was made off — and SKIPS any location it
    // cannot anchor. A place with no placed ancestor stays honestly unplaced.
    apply: (c, ctx) => {
      const gen = c?.generated?.location;
      if (!gen || typeof gen !== "object") return {};
      const authored = ctx?.content?.locations || {};
      const look = (k) => gen[k] || authored[k] || null;
      const placed = [];
      for (const [id, rec] of Object.entries(gen)) {
        if (!rec || typeof rec !== "object") continue;
        if (rec.worldPos && Number.isFinite(Number(rec.worldPos.colatitude))) continue;
        const pos = worldPosForGenerated(id, look);
        if (!pos) continue;
        rec.worldPos = { colatitude: pos.colatitude, longitude: pos.longitude, depth: pos.depth };
        if (authored[id]) authored[id].worldPos = rec.worldPos;   // the live session reads this copy
        placed.push(id);
      }
      return placed.length ? { warnings: [`placed ${placed.length} generated location(s) that had no worldPos: ${placed.join(", ")}`] } : {};
    }
  },
  {
    version: 38, id: "r49-fell-pell", playerFacing: true,
    // ⛔ THE FICTION BUILT ALL THREE OF THESE AND THE RECORD CAUGHT NONE OF THEM (Erik 2026-09-06).
    //
    // ⚑ 1 · A HOLD THAT IS NOWHERE. Two of three holdings carry `locationId: null`, and Raven's Home has an
    // authored place waiting for it — `the_old_warden_post`, whose name is literally "Raven's Home (the Old
    // Warden Post)". ⚠️ An unplaced hold cannot be routed to, cannot send a caravan, and does not appear on
    // the map. ⛑ The Threshold Post is deliberately NOT guessed: the fiction says "the ridge relay node" and
    // no location matches that, so it is reported rather than invented.
    //
    // ⚑ 2 · THE FELL PELL IS A FORGE AND A FORGE IS AN ENTERPRISE. 23 mentions in the save, named in play at
    // Millbrook, with the fellowship formally opened at it — "The forge named the Fell Pell; the fellowship
    // formally opened." A place the story built and the sheet never held.
    //
    // ⚑ 3 · AND THE FELLOWSHIP IS A BAND. `canRaiseBand` reads READY for this character — 3 command slots,
    // 3 holdings — and has done for some time, while `character.bands` stayed null because nothing surfaced
    // it. ⚠️ The contingents are the roles the FICTION assigned, in the engine's own eight families
    // (FUNCTION_FAMILIES), not a vocabulary I invented for them.
    apply: (c, ctx) => {
      const notes = [], warnings = [];
      const locs = ctx?.content?.locations || {};

      // ── 1 · put Raven's Home where the story put it
      const raven = (c.holdings || []).find(h => h && /raven/i.test(String(h.name || "")) && !h.locationId);
      if (raven && locs.the_old_warden_post) {
        raven.locationId = "the_old_warden_post";
        notes.push("Stillwater's Trouble is on the map at last — the Old Warden Post, where the story always had it.");   // ⚠️ NOT "Raven's Home": Erik called that name bogus and I carried it anyway
      }
      const stillNowhere = (c.holdings || []).filter(h => h && !h.locationId).map(h => h.name || h.id);
      if (stillNowhere.length) warnings.push(`holding(s) with no place, and none guessed: ${stillNowhere.join(", ")}`);

      // ── 2 · the forge, through addHolding so its shape is the engine's and not mine
      let forge = (c.holdings || []).find(h => h && /fell pell/i.test(String(h.name || "")));
      if (!forge && locs.millbrook) {
        forge = addHolding(c, { id: "the-fell-pell", kind: "enterprise", name: "The Fell Pell",
          locationId: "millbrook", steward: (c.npcRegistry || {}).pell ? "pell" : null,
          obligation: "the fellowship's work, and the road drainage it promised", day: c.clock?.day ?? null });
        if (forge) {
          forge.describedAs = "forge";
          forge.owner = "pell";   // SPEC_holdings_tempo §4: hers — kept by her, on his sheet, paying the household
          notes.push("The Fell Pell stands in your name — the forge the fellowship opened at, on the sheet where it belongs.");
        }
      }

      // ── 3 · the band the fiction already named
      const gate = canRaiseBand(c, { cfg: ctx?.rules?.martial || {}, renownBand: c.renownBand || null });
      const has = Array.isArray(c.bands) && c.bands.some(b => b && /fell pell/i.test(String(b.name || "")));
      if (gate.ready && !has) {
        // ⚠️ THE ROLES ARE THE FICTION'S OWN — "Calvar took the repair lead, Dara the logistics, Mara supply
        // and comms, Aldric the accounts; Fendt named to the fellowship" — mapped onto the engine's families.
        const roster = [
          ["pell", ["SHAPE", "HARM"], "Pell Ran Marsh — the smith the forge is named for"],
          ["calvar", ["SHAPE", "RESTORE"], "Calvar — repair lead"],
          ["dara-holt", ["MOVE", "SUSTAIN"], "Dara Holt, the Ditch-Mother — logistics"],
          ["mara-wells", ["KNOW", "SUSTAIN"], "Mara Wells — supply and comms"],
          ["aldric", ["KNOW"], "Aldric — accounts"],
          ["fendt", ["SHAPE", "KNOW"], "Fendt — filtration"],
        ].filter(([id]) => (c.npcRegistry || {})[id]);
        if (roster.length >= 3) {
          const r = raiseBand(c, { id: "fellowship-of-the-fell-pell", name: "The Fellowship of the Fell Pell",
            count: roster.length, quality: 2, from: "the-fell-pell", day: c.clock?.day ?? 0 });
          if (r?.ok) {
            // ⛔ CONTINGENTS ARE WHAT MAKES A BAND MORE THAN A NUMBER (CCODE-279) — groups of people who each
            // DO something. Flat `{count, quality}` still works; this says what they are actually for.
            r.band.contingents = roster.map(([id, does, what]) => ({
              n: 1, quality: 2, does, what, npcId: id,
            }));
            notes.push(`The Fellowship of the Fell Pell rides under your name — ${roster.length} named, and the first band you have ever raised. ${gate.why}.`);
          }
        } else warnings.push(`the Fell Pell fellowship is in the fiction but only ${roster.length} of its named people are on the registry`);
      }
      return { notes, warnings };
    }
  },
  {
    version: 39, id: "r49-heal-the-overwrite", playerFacing: true,
    // ⛔ A STALE TAB ATE A LEVEL, TWICE, AND EVERY FILE-SIDE RESTORE LOST THE RACE BACK. `resolveSaveConflict`
    // decided by wall clock, so a browser copy saved later — with FEWER writes behind it — won each time. The
    // guard is fixed (§102), but a client that never re-pulls still holds the old copy, and the one channel
    // that demonstrably reaches it is a reconcile step: step 38 landed on that very copy.
    //
    // ⚑ MEASURED BY DEED IDENTITY, THE LOST COPY IS A CLEAN SUPERSET — two deeds it holds that the stale one
    // lacks, and NONE the other way. So this heals rather than overwrites, and nothing played is at risk.
    // ⚠️ FLOORS, NEVER ASSIGNMENTS: `Math.max` on level and xp, and a deed added only when its `at` is absent.
    // A character who has since climbed past 31 keeps it; a second run changes nothing.
    apply: (c, ctx) => {
      const notes = [];
      // ⛔ THIS ONE IS PERSONAL, AND §95 CAUGHT ME NOT SAYING SO. R48 could be universal because it COUNTED
      // each character's own deeds; this restores TWO SPECIFIC DEEDS Silas played, and without an identity
      // guard it handed them — and their arrears — to every character who ever loads. That is the exact
      // defect §95 exists to prevent, in the step written next to it.
      if (c?.id !== "char-mrhs8286") return {};
      const LOST = { level: 31, xp: 3032 };
      const before = { level: Number(c.level) || 0, xp: Number(c.xp) || 0 };
      c.level = Math.max(before.level, LOST.level);
      c.xp = Math.max(before.xp, LOST.xp);

      const deeds = Array.isArray(c.deeds) ? c.deeds : (c.deeds = []);
      const seen = new Set(deeds.map(d => d && d.at).filter(Boolean));
      const RESTORED = [{"at":"2026-09-05T23:22:17.418Z","locationId":"gen-whistling-woman-post","communityId":null,"description":"Read a death-thread to find meaning—bridging two crafts to read a message written in the shape of a fragile life","tags":["insight","craft"],"weight":1,"spread":[],"day":16,"worldDay":67},{"at":"2026-09-06T00:27:44.201Z","locationId":"gen-whistling-woman-post","communityId":null,"description":"Refused to let a fractured courier slip past unanswered—read her death-thread to know what brought her, and held her steady through the breaking.","tags":["mercy","attending","clarity"],"weight":1,"spread":[],"day":16,"worldDay":68}];
      const added = RESTORED.filter(d => !seen.has(d.at));
      for (const d of added) deeds.push(d);

      // ⛑ AND THE LEDGER FOLLOWS THE DEEDS. R48 paid 8 a deed off the COUNT; two deeds arriving after that
      // settlement are two deeds it never counted, so they are paid at the same rate rather than left owed.
      if (added.length) {
        const cur = ctx?.rules?.economy?.holdStore?.upkeepCurrency || "crystal";
        const owed = added.length * 8;
        const r = credit(c, cur, owed, { origin: "arrears" });
        if (r?.ok) notes.push(`${added.length} deed${added.length === 1 ? "" : "s"} the record had lost are back on it, and ${owed} ${cur} with them.`);
      }
      if (c.level > before.level || c.xp > before.xp) {
        notes.push(`You are level ${c.level} again — ${c.xp} experience. A stale window had written an older you back over the real one; it will not happen again.`);
      }

      // ⛔ AND THE NAME ERIK ALREADY CORRECTED ONCE. He called "Raven's Home" bogus and named it Stillwater's
      // Trouble, and I carried the wrong one into a holding and a reconcile note anyway. His own history says
      // it: "Named and claimed the Raven's Home warden post as an Ashwarden base — Stillwater's Trouble".
      for (const h of (c.holdings || [])) {
        if (h && /raven'?s home/i.test(String(h.name || ""))) {
          h.name = "Stillwater's Trouble";
          notes.push("The warden post carries its right name now — Stillwater's Trouble.");
        }
      }
      return { notes };
    }
  },
  {
    version: 40, id: "codex-truncation-honest", playerFacing: false,
    // ⛔ A FRAGMENT MUST NOT STAND AS A WHOLE THOUGHT. Before SNG-152 fixed it, a 200-character clamp cut
    // codex facts mid-word with no mark. Measured on a real codex: 133 facts at exactly 205 characters and
    // 19 at 204, ALL on days 1-5, and none after — the clamp is long gone and the damage is permanent,
    // because the tail was never written down to recover.
    // ⚑ THIS MARKS, IT DOES NOT MEND. An ellipsis turns "the deathwork closing was p" from a sentence that
    // reads as badly written into a record that reads as CUT — the same honesty `geodesic` shows when it
    // returns null for a place with no position.
    // ⛑ CONSERVATIVE ON PURPOSE: a fact is only marked when it ends mid-word AND sits at the old boundary, so
    // a short note that simply has no full stop is left exactly as its author wrote it.
    apply: (c) => {
      const topics = c?.codex?.topics || c?.codex;
      if (!topics || typeof topics !== "object") return {};
      let marked = 0;
      for (const t of Object.values(topics)) {
        if (!t || !Array.isArray(t.facts)) continue;
        t.facts = t.facts.map((f) => {
          const str = String(f);
          if (str.length < 200 || str.length > 210) return f;      // not at the old clamp boundary
          const end = str.trimEnd();
          if (/[.!?…"')\]:;]$/.test(end)) return f;                 // it finished its sentence
          if (!/[A-Za-z]$/.test(end)) return f;                     // not a mid-word stop
          marked++;
          return end + "…";
        });
      }
      return marked ? { warnings: [`marked ${marked} codex fact(s) that a retired clamp cut mid-word — the text is unrecoverable, the record now says so`] } : {};
    }
  },
  {    version: 30, id: "restore-generated-teacher-roles", playerFacing: true,
    // SNG-355 §1c — ERIK'S SAVE NEEDS THIS AND CANNOT HEAL ITSELF. `recruit()` read `teaches` from the
    // AUTHORED catalog only, so a GENERATED NPC returned {} and the teacher role was dropped at the moment
    // of joining. He calls Veth-Ondra his teacher; his save says `teaches: null`.
    //
    // ⚠️ THE CURRICULUM MACHINERY WAS REAL AND REACHED NOTHING — curriculumFor, teachersForGM and
    // teacherOfferReady all read a field nothing ever populated for the people who actually travel with
    // you. Fixing recruit() stops the loss going forward; only this restores what was already lost.
    apply: (c) => {
      const reg = c.npcRegistry || {};
      const fixed = [];
      for (const m of c.company || []) {
        if (m.teaches || m.leftDay) continue;
        const t = reg[m.npcId]?.teaches;
        if (!t) continue;
        m.teaches = t;
        if (!m.roles.includes("trainer")) m.roles.push("trainer");
        fixed.push(`${reg[m.npcId]?.name || m.npcId} (${t})`);
      }
      if (!fixed.length) return {};
      console.log(`[reconcile] sng-355: restored ${fixed.length} teacher role(s) lost at recruit: ${fixed.join(", ")}`);
      return { notes: [`You remember who taught you: ${fixed.join(", ")}.`] };
    }
  },
  {
    version: 41, id: "slate-branch-restored", playerFacing: true,
    // ⛔ THE BRANCH THE SYNC OVERWROTE, MERGED BACK IN EVERY COPY. Measured in git: 4a50f0cf (rev 2500) held the
    // encrypted slate, both couriers at Whistling Woman Post and the post as a holding; browser pushes at 11:43,
    // 11:48 and 15:20 (revs 1853, 1858, 1794 — each LOWER) overwrote it, and Erik's phone asked the GM how the
    // runner was doing from a copy that had no runner. A committed save lost that race three times today;
    // this runs inside the tab. ⚑ mergeRecovery ADDS what the copy lacks and REMOVES nothing — idempotent by
    // version and by record, refuses any other character. The receipt is said out loud.
    apply: (c) => {
      const notes = [];
      for (const sn of SNAPSHOTS) {
        if (!sn || sn.forId !== c?.id) continue;
        const r = mergeRecovery(c, JSON.parse(JSON.stringify(sn.snap)));
        const line = mergeReceiptLine(r);
        if (!r.items.length && !r.people.length && !r.topics.length && !r.facts && !r.holdings.length && !r.quests.length && !r.bands.length) continue;
        console.log(`[reconcile] slate-branch-restored: ${line}`);
        notes.push(`${line} — the branch the sync overwrote on 2026-09-06, merged back; nothing you had since was removed.`);
      }
      return notes.length ? { notes } : {};
    }
  },
  {
    version: 42, id: "threshold-post-placed", playerFacing: true,
    // ⛔ A HOLDING WITH NO PLACE. The Threshold Post was claimed from an assignment (`locationId: null`) and step 38
    // deliberately did not guess where it stood. Erik asked; the save answers: Fendt — "built north of the mill gate
    // at the ridge relay node"; Mara — "the network's northern anchor"; the chronicle — from the Crossing's
    // east-side draw-well, "the midrow wayhouse, the mill gate, and something high on the ridge"; the deeds that
    // raised it are stamped at `the_crossing` — the HUB, and Erik confirms it: "I was at the crossing where all the waygates are
    // located (the hub)"; the small settlement the GM described was "Center", a Hub made twice. So: a day and a half outward on
    // the north-gate side, high on the ridge, overlooking the crossroads. The road north to the Whistling Woman is the gate.
    // Idempotent by record; Silas only.
    apply: (c) => {
      if (c?.id !== "char-mrhs8286") return {};
      const ID = "gen-threshold-post";
      c.generated = c.generated || {}; c.generated.location = c.generated.location || {};
      const notes = [];
      if (!c.generated.location[ID]) {
        c.generated.location[ID] = {
          id: ID, name: "Threshold Post", regionId: "the_center",
          descriptionSeed: "The ridge relay node north of the Crossing's mill gate — a sentinel post high on the moorland ridge, overlooking the settlement, the relay network's northern anchor. A warden post raised from blueprint into standing structure, a working mine of living iron beneath it, a death-warden temple at the sentinel. Three beacon stones cracked in the sentinel array; Fendt keeps it.",
          tags: ["ridge", "relay", "post", "moorland"], connections: ["the_crossing"], dangerLevel: 2,
          _gen: { type: "location", tier: "established", engagementScore: 4, birthWeight: 1, rating: null,
            attentionHistory: [{ kind: "revisit", day: 14 }, { kind: "revisit", day: 15 }], createdDay: 14,
            provenance: { locationId: "the_crossing", day: 14, hint: "the ridge relay node, north of the mill gate" }, lastAttentionDay: 15 },
          worldPos: { colatitude: 0.9, longitude: 30, depth: 0 },   // a day and a half outward, north-gate side (the registry sits at 19°)
        };
        notes.push("The Threshold Post is on the map: the ridge relay node a day and a half north of the Hub's gate, overlooking the crossroads.");
      }
      c.placeEdges = c.placeEdges || {};
      const cx = c.placeEdges.the_crossing = Array.isArray(c.placeEdges.the_crossing) ? c.placeEdges.the_crossing : [];
      if (!cx.includes(ID)) cx.push(ID);
      if (!Array.isArray(c.placeEdges[ID])) c.placeEdges[ID] = ["the_crossing"];
      const h = (c.holdings || []).find(x => x && !x.locationId && /threshold post/i.test(x.name || ""));
      if (h) { h.locationId = ID; notes.push("Fendt's post now knows where it stands."); }
      return notes.length ? { notes } : {};
    }
  },
  {
    version: 43, id: "edge-district-folded", playerFacing: true,
    // ⛔ AEVI (REPLY_admission_landing §2): the six `edge-district-*` topics survived the sweep because they share an
    // ID prefix, not a label prefix, and their parent is labelled "Huginn's Building — Edge District". A standing
    // id-prefix rule would have to guess a parent — "guessing is how a fold becomes a deletion" — so the parent
    // is NAMED here, once, for the one save that has the family. Same fold routine as the sweep; nothing trimmed.
    apply: (c) => {
      if (c?.id !== "char-mrhs8286") return {};
      const folded = foldTopicsByIdPrefix(c, "edge-district-", "radiant-plateau-edge");
      if (!folded.length) return {};
      console.log(`[reconcile] edge-district-folded: ${folded.join(", ")} → radiant-plateau-edge`);
      return { notes: [`${folded.length} Edge District hooks are filed under the district itself now — nothing was dropped, and the district's reading is due again.`] };
    }
  },
  {
    version: 44, id: "holds-features-and-the-made-gate", playerFacing: true,
    // ⛔ ERIK (po/ERIK_holds_features_and_the_made_gate.md, applied on his word 2026-09-06): all four holds carried ZERO
    // features while the fiction was written into their image prompts — "laboratory, workshop, Watch, forge, keeper's
    // hut — funded and staffed". And the Made Gate — a place Silas MADE, posted a watch over, set a guardian at — had
    // never been a hold. Through the engine's own doors (addHolding, setGarrison, addFeature with the catalogue), so
    // every event and history line a built thing gets, these get. Idempotent by record; Silas only. Needs the catalogue
    // in ctx.content — absent, it waits for a load that has one rather than minting kinds nothing can read.
    apply: (c, ctx = {}) => {
      if (c?.id !== "char-mrhs8286") return {};
      const hs = ctx.content?.rules?.economy?.holdStore;
      const cfg = hs ? { ...hs, features: ctx.content.rules.economy.holdFeatures || null } : null;
      if (!cfg?.features) return {};
      const notes = [];
      const has = (h, kind) => (h.features || []).some(f => f && f.kind === kind);
      const want = {
        "hold-cassiel-ord::full-reconstruction-of-the-raven-s-home-": [{ kind: "laboratory" }, { kind: "workshop", yields: "instruments" }, { kind: "watch" }, { kind: "forge" }, { kind: "keepers_hut" }, { kind: "ward_line" }],
        "hold-fendt::warden-of-the-threshold-post-at-the-ridg": [{ kind: "watch" }, { kind: "relay_station" }, { kind: "keepers_hut" }],
        "whistling-woman-post": [{ kind: "watch" }, { kind: "relay_station" }, { kind: "keepers_hut" }],
        "the-fell-pell": [{ kind: "forge" }, { kind: "smithy" }, { kind: "workshop", yields: "arms" }],
      };
      // §3 — the Made Gate, a hold: "he built the Whistling Woman to watch over it and raised Logana to guard it"
      if (!(c.holdings || []).some(h => h && h.id === "hold-made-gate")) {
        addHolding(c, { id: "hold-made-gate", kind: "post", name: "The Made Gate", locationId: "gen-the-made-gate", steward: null, day: 16 });
        const mg = (c.holdings || []).find(h => h && h.id === "hold-made-gate");
        if (mg) { mg.describedAs = "a gate that was made rather than found"; if (!mg.condition) mg.condition = "holding"; notes.push("The Made Gate is yours on the record now — kept by your name, guarded by Logana, watched from the Whistling Woman."); }
      }
      const mg = (c.holdings || []).find(h => h && h.id === "hold-made-gate");
      if (mg) {
        if (c.npcRegistry?.logana && !(mg.garrison || []).includes("logana")) setGarrison(c, "hold-made-gate", [...(mg.garrison || []), "logana"], { nameOf: (id) => c.npcRegistry?.[id]?.name || id });
        want["hold-made-gate"] = [{ kind: "gate" }, { kind: "ward_line" }];   // `waygate` is not a catalogue kind — Aevi's lane
      }
      let built = 0;
      for (const [id, feats] of Object.entries(want)) {
        const h = (c.holdings || []).find(x => x && x.id === id);
        if (!h) continue;
        for (const f of feats) if (!has(h, f.kind)) { const r = addFeature(c, id, { ...f, by: "you", day: 16, cfg }); if (r.ok) built++; }
      }
      const ww = (c.holdings || []).find(h => h && h.id === "whistling-woman-post");
      if (ww && mg && ww.watches !== "hold-made-gate") { ww.watches = "hold-made-gate"; notes.push("The Whistling Woman Post watches over the Made Gate — while it stands, the gate is raided less; lose it and the gate is exposed."); }
      if (built) notes.push(`${built} feature${built === 1 ? "" : "s"} the fiction already built are on your holds now — the record kept the picture and dropped the buildings.`);
      return notes.length ? { notes } : {};
    }
  },
  {
    version: 45, id: "gate-cluster-on-the-march", playerFacing: true,
    // ⛔ ERIK 2026-09-06: "A waygate is a huge deal… vast distances" and "the Whistling Woman Post was raised and built as a
    // watchpost for the gate — they need to be in the same local area." LOOKED UP: the Made Gate is a network gate whose
    // `waygateDefaultTo` is the Hub — it LEADS there, so its position is its MOUTH, and the mouth is at the Left Branch
    // approach by Stillwater's Trouble (Logana guards it; Deni walked through and arrived at the Hub). The placer had put
    // the gate beside the Hub, its clearing and the Whistling Woman by the Edge district forty days away, and step 42 had
    // put the ridge post by the Hub on the app's id stamp. All four move ONCE (a marker), edges follow, and the hold
    // carries what it keeps: a waygate. Silas only.
    apply: (c, ctx = {}) => {
      if (c?.id !== "char-mrhs8286") return {};
      const gl = c.generated?.location;
      if (!gl) return {};
      const MARK = "erik-2026-09-06-gate-cluster";
      const place = (id, pos, conns, prov = null) => {
        const r = gl[id];
        if (!r || r._placedBy === MARK) return false;
        r.worldPos = { ...pos, depth: 0 }; r.regionId = "valley"; r.connections = conns; r._placedBy = MARK;
        if (prov && r._gen) r._gen.provenance = { ...(r._gen.provenance || {}), locationId: prov };
        return true;
      };
      const moved = [];
      if (place("gen-the-made-gate", { colatitude: 20.40, longitude: 251.95 }, ["gen-left-branch-gate-clearing", "gen-stillwater-s-trouble"], "gen-stillwater-s-trouble")) moved.push("the Made Gate");
      if (place("gen-left-branch-gate-clearing", { colatitude: 20.44, longitude: 251.90 }, ["gen-the-made-gate", "gen-whistling-woman-post", "gen-stillwater-s-trouble"], "gen-the-made-gate")) moved.push("the gate clearing");
      if (place("gen-whistling-woman-post", { colatitude: 20.36, longitude: 252.10 }, ["gen-left-branch-gate-clearing", "gen-the-made-gate"], "gen-the-made-gate")) moved.push("the Whistling Woman Post");
      // (the ridge post was moved here once and moved back by step 47 — Erik: the Crossing IS the Hub; the road north is the gate)
      c.placeEdges = c.placeEdges || {};
      const link = (a, b) => { for (const [x, y] of [[a, b], [b, a]]) { const arr = Array.isArray(c.placeEdges[x]) ? c.placeEdges[x] : (c.placeEdges[x] = []); if (!arr.includes(y)) arr.push(y); } };
      link("gen-the-made-gate", "gen-left-branch-gate-clearing"); link("gen-the-made-gate", "gen-stillwater-s-trouble");
      link("gen-left-branch-gate-clearing", "gen-whistling-woman-post");
      // the guesses come out of the edges: the ridge post never stood by the Hub, the clearing never by the Edge
      if (Array.isArray(c.placeEdges["gen-left-branch-gate-clearing"])) c.placeEdges["gen-left-branch-gate-clearing"] = c.placeEdges["gen-left-branch-gate-clearing"].filter(x => x !== "radiant_plateau_edge");
      // ⛔ THE GATE JOINS THE NETWORK. waygate.js: a made gate is routed through only if it declares `networkCapable` —
      // SNG-243 §3 named the Made Gate "the player's first personal spoke" and the record never carried the opt-in, so
      // the gate Silas cut could carry nobody anywhere. Its own idempotence, apart from the move-marker.
      let joined = false;
      const mgLoc = gl["gen-the-made-gate"];
      if (mgLoc && mgLoc.waygate && !mgLoc.networkCapable) { mgLoc.networkCapable = true;   // SNG-243 §3: a made gate opts in
        joined = true; }
      // the hold carries what it keeps
      const hs = ctx.content?.rules?.economy?.holdStore;
      const cfg = hs ? { ...hs, features: ctx.content.rules.economy.holdFeatures || null } : null;
      const mg = (c.holdings || []).find(h => h && h.id === "hold-made-gate");
      let gateFeat = false;
      if (mg && cfg?.features && !(mg.features || []).some(f => f && f.kind === "waygate")) { const r = addFeature(c, "hold-made-gate", { kind: "waygate", by: "you", day: 14, cfg }); gateFeat = !!r.ok; }
      const notes = [];
      if (moved.length) notes.push(`On your word: ${moved.join(", ")} stand on the March now — the gate's mouth at the Left Branch approach by Stillwater's Trouble, the Whistling Woman beside it as its watch.`);
      if (gateFeat) notes.push("The Made Gate carries what it is: a waygate, made rather than found — one of a few in the world, and it leads to the Crossing.");
      if (joined) notes.push("And the gate you made is in the network now — it can be aimed at, and aimed from. It never was before.");
      return notes.length ? { notes } : {};
    }
  },
  {
    version: 46, id: "stale-hold-art-cleared", playerFacing: true,
    // ⛔ SPEC_holdings_screen §2 — a hold's picture is minted from a prompt that begins with its NAME, cached forever, and a
    // rename never touched it: Stillwater's Trouble carries art captioned "Raven's Home". renameHolding clears it from now
    // on; this clears what was already stale — any hold whose decodable prompt names something other than the hold. An
    // authored image (no prompt in the url) is never touched. The next read mints it fresh. Every character; idempotent.
    apply: (c) => {
      const cleared = [];
      for (const h of c?.holdings || []) {
        if (!h || typeof h.image !== "string" || !h.name) continue;
        const m = /\/prompt\/([^?]+)/.exec(h.image);
        if (!m) continue;
        let prompt = ""; try { prompt = decodeURIComponent(m[1]); } catch { continue; }
        if (prompt.startsWith(h.name + ":") || prompt.startsWith(h.name + " ")) continue;
        delete h.image;
        cleared.push(h.name);
      }
      if (!cleared.length) return {};
      return { notes: [`${cleared.join(", ")}: the picture was of an old name and is put away — it will be drawn again under the name it has now.`] };
    }
  },
  {
    version: 47, id: "hub-is-the-crossing", playerFacing: true,
    // ⛔ ERIK 2026-09-06: "The game created the Hub by mistake. I traveled through the waygate to the Crossing — it thought I
    // was still near Millbrook and mistakenly created the hub instead of acknowledging that I was at the crossing where all
    // the waygates are located (the hub)." MEASURED: `gen-center` "Center" is that mistake — five structural references and
    // nothing narrative. And: "SwT is not far from the waygate in the Pale March… we walked a couple hours to a fork" —
    // the March waygate was NOT a waygate to the engine (a transit mint, no flag) and stood a day from Stillwater's Trouble.
    // So: Center folds into the Hub; the Pale March waygate becomes the gate Erik walked out of, two hours from the fork,
    // the fork two hours from Stillwater's Trouble; the ridge post goes back north of the Hub's gate, where its deeds
    // were stamped, and its road to the Whistling Woman is withdrawn — that road is the gate Silas made. Silas only.
    apply: (c) => {
      if (c?.id !== "char-mrhs8286") return {};
      const gl = c.generated?.location;
      if (!gl) return {};
      const MARK = "erik-2026-09-06-hub-is-the-crossing";
      const notes = [];
      c.placeEdges = c.placeEdges || {};
      const link = (a, b) => { for (const [x, y] of [[a, b], [b, a]]) { const arr = Array.isArray(c.placeEdges[x]) ? c.placeEdges[x] : (c.placeEdges[x] = []); if (!arr.includes(y)) arr.push(y); } };
      const unlink = (a, b) => { for (const [x, y] of [[a, b], [b, a]]) if (Array.isArray(c.placeEdges[x])) c.placeEdges[x] = c.placeEdges[x].filter(z => z !== y); };
      // (a) Center → the Hub
      if (gl["gen-center"]) {
        delete gl["gen-center"];
        c.knownPlaces = [...new Set((c.knownPlaces || []).map(x => (x === "gen-center" ? "the_crossing" : x)))];
        for (const r of Object.values(gl)) if (r && Array.isArray(r.connections)) r.connections = r.connections.filter(x => x !== "gen-center");
        delete c.placeEdges["gen-center"];
        for (const k of Object.keys(c.placeEdges)) if (Array.isArray(c.placeEdges[k])) c.placeEdges[k] = c.placeEdges[k].filter(x => x !== "gen-center");
        notes.push("\"Center\" is gone from the map: it was the Hub, made twice when the gate carried you there and the game thought you were still by Millbrook. The Crossing is the Hub, where all the waygates are.");
      }
      // (b) the Pale March waygate is a gate, two hours from the fork; the fork two hours from Stillwater's Trouble
      const wg = gl["gen-waygate"];
      if (wg && wg._placedBy !== MARK) {
        Object.assign(wg, { name: "The Pale March Waygate", waygate: true, waygateTier: 2, networkCapable: true, waygateDefaultTo: "the_crossing",
          tags: [...new Set([...(wg.tags || []), "waygate"])],
          descriptionSeed: "The waygate the Hub's crossroads opens onto the Pale March. A couple of hours' walk to the fork in the road, and Stillwater's Trouble beyond it.",
          worldPos: { colatitude: 20.20, longitude: 251.63, depth: 0 }, connections: ["gen-ashwarden-march-road", "millbrook"], _placedBy: MARK });
        notes.push("The Pale March waygate is a gate to the engine now — it never was — and it stands where you walked out of it, two hours from the fork.");
      }
      const fork = gl["gen-ashwarden-march-road"];
      if (fork && fork._placedBy !== MARK) Object.assign(fork, { worldPos: { colatitude: 20.24, longitude: 251.72, depth: 0 }, _placedBy: MARK });
      link("gen-waygate", "gen-ashwarden-march-road"); link("gen-ashwarden-march-road", "gen-stillwater-s-trouble");
      // (c) the ridge post back north of the Hub's gate; its road to the Whistling Woman is the gate
      const tp = gl["gen-threshold-post"];
      if (tp && tp._placedBy !== MARK) {
        Object.assign(tp, { regionId: "the_center", worldPos: { colatitude: 0.9, longitude: 30, depth: 0 }, connections: ["the_crossing"], _placedBy: MARK });
        if (tp._gen) tp._gen.provenance = { ...(tp._gen.provenance || {}), locationId: "the_crossing" };
        const ww = gl["gen-whistling-woman-post"];
        if (ww && Array.isArray(ww.connections)) ww.connections = ww.connections.filter(x => x !== "gen-threshold-post");
        link("gen-threshold-post", "the_crossing"); unlink("gen-threshold-post", "echo_river_crossing"); unlink("gen-threshold-post", "gen-whistling-woman-post");
        notes.push("The Threshold Post stands where it was built: the ridge north of the Hub's gate, overlooking the crossroads. The road north to the Whistling Woman is the gate you made.");
      }
      return notes.length ? { notes } : {};
    }
  },
  // Future steps register here — e.g. innate-talent GRANT (offers[], when talent content
  // lands with SNG-017), Reach-tradition eligibility surfacing, universal-role tagging.
];

/** Highest registered step version for a kind — a freshly-created entity stamps this so
 *  no migration step (e.g. seed-from-aggregate) fires on something born current. */
export function topReconcileVersion(kind) {
  const reg = kind === "character" ? CHARACTER_STEPS : CONTENT_STEPS[kind] || [];
  return reg.reduce((m, s) => Math.max(m, s.version), 0);
}

// ---------- content migration steps (run on content-load, per kind) ----------

export const CONTENT_STEPS = {
  location: [
    {
      version: 1, id: "pole-intensity", playerFacing: false,
      // Any location with spectrum but no poleIntensity derives it: axis "neg_pos": v
      // → { pos: v } when v>0, { neg: |v| } when v<0. Matches the hand-authored shape
      // (verified against archive_hollow / dw_the_moot / millbrook). Uses spectrums.json
      // pole names when available; falls back to splitting the axis id.
      apply: (loc, ctx) => {
        if (loc.poleIntensity || !loc.spectrum) return {};
        const byId = {};
        for (const a of ctx.spectrums?.spectrums || []) byId[a.id] = a;
        const pi = {};
        for (const [axis, v] of Object.entries(loc.spectrum)) {
          if (!v) continue;
          const a = byId[axis];
          const neg = a?.negPole ?? axis.split("_")[0];
          const pos = a?.posPole ?? axis.split("_").slice(1).join("_");
          pi[v > 0 ? pos : neg] = Math.round(Math.abs(v) * 100) / 100;
        }
        if (!Object.keys(pi).length) return {};
        loc.poleIntensity = pi;
        return { notes: [`${loc.id}: derived poleIntensity from spectrum`] };
      }
    },
    {
      version: 2, id: "crossref-integrity", playerFacing: false,
      // Connections pointing at locations that aren't loaded get FLAGGED (never removed —
      // they may be content awaiting manifest registration).
      apply: (loc, ctx) => {
        const known = ctx.knownLocationIds;
        if (!known) return {};
        const dangling = (loc.connections || []).filter(id => !known.has(id));
        return dangling.length ? { warnings: [`${loc.id}: connections reference unloaded locations: ${dangling.join(", ")}`] } : {};
      }
    }
  ]
};

// ---------- the single pass ----------

/** Run every registered step whose version exceeds the entity's reconcileVersion.
 *  Returns { applied[], notes[], offers[], warnings[], playerFacing } and bumps the
 *  entity's reconcileVersion to the highest step version — the idempotence gate. */
export function reconcile(entity, kind, ctx = {}, steps = null) {
  const registry = steps || (kind === "character" ? CHARACTER_STEPS : CONTENT_STEPS[kind] || []);
  const seen = entity.reconcileVersion || 0;
  const out = { applied: [], notes: [], offers: [], warnings: [], playerFacing: false };
  let top = seen;
  // CCODE-23: a THROWN step must NOT advance reconcileVersion past itself, or the owed migration never retries
  // and its grant is lost permanently + silently (the warning is console-only). Stamp only BELOW the lowest
  // throw, so a step that failed on a transient (e.g. momentarily-partial CONTENT) runs again next load. Steps
  // are asserted order-independent + idempotent, so re-running the succeeded ones above it is safe.
  let lowestThrow = Infinity;
  for (const step of registry) {
    if (step.version <= seen) { top = Math.max(top, step.version); continue; } // already applied — safe to keep
    let r = {};
    try { r = step.apply(entity, ctx) || {}; }
    catch (err) { out.warnings.push(`${step.id}: ${err.message}`); lowestThrow = Math.min(lowestThrow, step.version); continue; } // a broken step never blocks load — and is never stamped as done
    top = Math.max(top, step.version);
    if (r.notes?.length || r.offers?.length) {
      out.applied.push(step.id);
      if (r.notes) out.notes.push(...r.notes);
      if (r.offers) out.offers.push(...r.offers); // GRANTS: surfaced, never auto-imposed
      if (step.playerFacing) out.playerFacing = true;
    }
    if (r.warnings) out.warnings.push(...r.warnings);
  }
  entity.reconcileVersion = Math.min(top, lowestThrow - 1);
  return out;
}

/** Content-load reconcile: bring every loaded record up to current. Mutates the
 *  in-memory CONTENT only (Pages content files are static — authored files get fixed
 *  upstream; this keeps the RUNTIME self-consistent either way). */
export function reconcileContent(content) {
  const summary = { applied: 0, notes: [], warnings: [] };
  const ctx = {
    spectrums: content.spectrums,
    knownLocationIds: new Set(Object.keys(content.locations || {}))
  };
  for (const loc of Object.values(content.locations || {})) {
    const r = reconcile(loc, "location", ctx);
    summary.applied += r.applied.length;
    summary.notes.push(...r.notes);
    summary.warnings.push(...r.warnings);
  }
  if (summary.notes.length) console.log(`[reconcile] content: ${summary.notes.length} derivations`, summary.notes);
  if (summary.warnings.length) console.warn(`[reconcile] content warnings:`, summary.warnings);
  return summary;
}
