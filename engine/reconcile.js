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

import { mergeCodexTopics } from "./codex.js";
import { dedupeQuests } from "./quests.js";
import { dedupeInventory } from "./inventory.js";
import { inferDomains } from "./traditions.js";
import { fallbackPersonalArc } from "./personalArc.js";
import { seedStandingAtCreation } from "./standing.js";

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
      for (const n of Object.values(c.npcRegistry || {})) {
        const rel = Number(n?.relationship) || 0;
        if (rel < 1) continue;                                  // only positive; enmity with one is not enmity with a people
        const authored = npcs[n.id];
        const dom = authored?.domains;
        if (!dom) continue;                                     // unattributable — say nothing (§2c.4)
        const weight = rel >= 7 ? 3 : rel >= 4 ? 2 : 1;         // devoted / ally / friendly
        const primaries = Array.isArray(dom.primary) ? dom.primary : [dom.primary];
        const share = weight / Math.max(1, primaries.length);   // an Epic NPC's several primaries split the credit
        for (const t of primaries) add(t, share, authored.name || n.name);
        if (dom.secondary) add(dom.secondary, weight / 2, authored.name || n.name);
        if (dom.tertiary) add(dom.tertiary, weight / 4, authored.name || n.name);
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
