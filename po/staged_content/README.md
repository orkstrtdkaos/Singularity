# Staged Content — authored, awaiting CCode integration

Content authored by Aevi (design lane) that needs a content home CCode owns (manifest registration +
loader/hook). **These files are NOT loaded** — they sit here until CCode places and wires them. This is the
corrected workflow: Aevi authors content; CCode does the integration (manifests, loaders, gates, hooks).
Do not `content/packs/` these without registering them in the same commit (SNG-064 gate).

---

## 1. `tradition_motivations.json` → integrate as loaded lore

**What:** all 24 traditions, each with `wants`, `stakeArc` (which greater arc it plays into), `stake` (its
role in that arc), and `villainy` (its cult-of-purity = its dark end AND antagonist seed). Plus
`prominentArcHolders` (the few warranting a dedicated arc vs. the rest playing into existing ones).

**Integration:**
- Place at `content/packs/valley/lore/tradition_motivations.json`.
- Register in the **valley** manifest `provides.lore` (STRICT dir — SNG-064 gate requires it).
- Consumed like other lore: `loreToProse` into GM context. It is the map the GM reads to know WHY a
  tradition acts, and the seed the wake engine (SNG-204 `pressureOnAdvance`) and future tradition-arcs
  (SNG-203 §4) draw from. No new loader needed — it's lore.
- ⚠️ It's substantial; if per-turn lore cost matters, consider surfacing it on-demand (a tradition's entry
  when that tradition is in play) rather than the whole file every turn. Design call — flagging, not dictating.

## 2. `bestiary.json` → integrate as a new content type + encounter hook

**What:** morally-clean adversaries — three classes (`manifested_creature`, `feral_construct`,
`substrate_warped_beast`), 6 entries tiered riffraff→epic. Each `pressures` function families (not just HP)
so the 22/24 traditions that don't fight-by-hitting have a way in. Each `readsFromArc`. Design laws at top:
no person, no want, no tragedy-to-kill.

**Integration:**
- Place at `content/packs/valley/bestiary.json` (or `content/packs/valley/bestiary/` if you'd rather split
  per-entry — your call on store shape).
- Add a **`provides.bestiary`** key to the valley manifest + a loader branch (parallel to how `legends` /
  `challengers` load). Add the STRICT_DIRS/whitelist entry in the same step so it goes staged→loaded→gated
  at once.
- **The hook that makes it reachable:** the GM needs a way to pull from this pool for "something to fight."
  This connects directly to **SNG-205 §2b** (the "encounter rate" setting wired to NOTHING) — the bestiary
  is the natural content for that dial to drive. Wiring the encounter hook and giving it real content are
  the same job. A bestiary with no spawn path is the SNG-064 ghost again.
- Power tiers (`riffraff`/`notable`/`regional`/`epic`) match `legends.js`'s tier axis — reuse that
  scaling/pacing machinery rather than inventing a second one.

## Related finding (not content, flagging)
`content/packs/valley/lore/legends.json` **roster is empty.** SNG-042 shipped the legends/villains SYSTEM
but the anchor figures (2-3 iconic heroes, 1-2 epic villains) were never authored. The bestiary fills the
"clean things to fight" half; named legends/villains are still owed authored content. Separate ask — noting
it here because both surfaced together (the game currently has neither named legends nor clean beasts to
face).

## 3. `tradition_epics.json` → integrate as loaded lore (extends the legends system)

**What:** several epics per tradition (first tranche: ashwarden/wright/abyssal/rootkin/numinous, 10 figures),
varied on alignment (hero/villain/neither) AND role. Each carries `arcAffinity` (SNG-208 offscreen arc-push),
`rivals` (same-tradition rivalries are the point — Neth vs Morvane, Vael vs Halcyon), `deathRoad` (SNG-209 —
the depth their craft retrieves from + cost), `offscreenVerbs`.

**Integration:**
- These are `legends.roster`-shaped figures. Cleanest: **merge into `legends.roster`** (the offscreen engine
  `worldtick.js:491` already reads it) OR register as its own `provides.lore` and have the offscreen
  population read both. Merging is simpler and the offscreen hook works for free.
- The `deathRoad` field is consumed by **SNG-209** (retrieval-quest depth-gating), not by the offscreen
  engine — harmless until 209 builds; author-ahead so the roster is 209-ready.
- ⚠️ SNG-208's offscreen-epic→arc hook + rivalry-conflict is what makes these ACT; this is the content that
  hook needs. Roster size scaling (SNG-208 §3c open Q3): with more epics, each should fire rarer so the
  aggregate stays bounded.
- **COMPLETE: all 24 traditions carry epics (41 figures).** No longer owed — the full roster is authored and staged.
