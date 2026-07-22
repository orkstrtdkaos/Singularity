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

import { mergeCodexTopics, ensureCodex, applyCodexUpdates } from "./codex.js";
import { dedupeQuests } from "./quests.js";
import { dedupeInventory } from "./inventory.js";
import { inferDomains } from "./traditions.js";
import { fallbackPersonalArc } from "./personalArc.js";
import { seedStandingAtCreation } from "./standing.js";
import { namesMatch } from "./namematch.js";
import { affiliationOf, regionHomeTradition, buildPeopleVocab } from "./affiliation.js";
import { defaultSchoolsForDomains } from "./substrate.js"; // SNG-193b §3.2: seed a school per practised domain on old saves
import { mintableBraidsFor, buildBraidDef, mintBraid } from "./braids.js"; // SNG-196: mint the braids a character already earned
import { findExistingNpc, prettifyNpcName, REGISTRY_CAP } from "./npcs.js"; // SNG-199/205: registry + codex backfill

// ---------- character migration steps (extensible registry) ----------
// Each step: { version, id, playerFacing, apply(entity, ctx) → { notes?, offers?, warnings? } }.
// Steps self-check preconditions and are order-independent; version numbers only gate
// "has this entity seen this step yet" via entity.reconcileVersion.

export const CHARACTER_STEPS = [
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
  }
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
  for (const step of registry) {
    top = Math.max(top, step.version);
    if (step.version <= seen) continue;
    let r = {};
    try { r = step.apply(entity, ctx) || {}; }
    catch (err) { out.warnings.push(`${step.id}: ${err.message}`); continue; } // a broken step never blocks load
    if (r.notes?.length || r.offers?.length) {
      out.applied.push(step.id);
      if (r.notes) out.notes.push(...r.notes);
      if (r.offers) out.offers.push(...r.offers); // GRANTS: surfaced, never auto-imposed
      if (step.playerFacing) out.playerFacing = true;
    }
    if (r.warnings) out.warnings.push(...r.warnings);
  }
  entity.reconcileVersion = top;
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
