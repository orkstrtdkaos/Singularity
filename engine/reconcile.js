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
