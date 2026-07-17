# Results — Story evolves + hover-detail everywhere + relationship paragraph + CG setting (SNG-134)

Date: 2026-07-16 · HEAD `5a80b66` · **v1.8.94** · full suite green · browser-verified. Status: **shipped, complete_pending_review.**

Four refinements from Erik's character-screen + settings screenshots. (Config defaults + Erik's `contentGenerator` flags were Aevi-direct writes, already at origin; this covers the four that needed building.)

## Part 1 — the story EVOLVES (not the frozen creation seed)
- **Character-header Story** now shows the SNG-109 **lived "story so far" paragraph** (`character.chronicleCache.text`) once it exists — the creation seed is the *first line*, superseded as deeds accrue, not frozen forever. A new character still shows the seed (correct); after play + a chronicle write, the header reflects the lived story.
- **"The arc"** section shows the **SNG-133 personal-arc** premise + **current stage** (from the taken quest-copy's `stageIndex`, else "a thread waiting to be pulled"), instead of the static aim + domain-shape.

## Part 2 — ONE hover/tap detail everywhere (the consistency ask)
- New pure **`engine/entityDetail.js`**: `skillDetail` (rank + next-rank progress + effective cost with base + function families + ripe-for-mastery), `npcDetail` (bond label + role + last-seen place + latest beat), `itemDetail` (qty + pinned + in-scene uses). Pure formatters — the app gathers the live values and passes them in.
- A single **`data-entity="kind:id"`** delegated handler (alongside the SNG-104/106/118 popovers) → **`entityHover()`** resolves the live values → the shared **`showPopoverText`** popover. **Same entity → same detail by construction** (pure formatter), no matter the render site.
- Wired at **NPC names** (chronicle Relationships + the sidebar "who's here" — the same person, two sites) and the **sidebar skill row**; items keep their existing `itemCard` click-to-expand (the same detail affordance). The `.entity-hover` affordance (dotted underline) signals it's tappable; taps work on phones.

## Part 3 — relationship summary paragraph
- **`relationshipsParagraph(character)`** (template — deterministic, no latency) reads the bonds into prose: *"You travel closest to Pell, partner · devoted; … a widening circle — Aldric, Mara — call you ally; and Vex would sooner see you fall."* Rendered above the chronicle Relationships list. Empty when there are no bonds (a new character gets no phantom social life). Evolves as bonds change.

## Part 4 — the content-generator SETTING
- A per-profile toggle in Settings — *"My play authors the world — what I create through play more readily becomes shared canon"* — reads/writes `profile.contentGenerator` (persisted via `saveProfile`). The engine weight boost is already SNG-132's (`birthWeightOf` × the flag); this adds the visible control.

## ROUND-2 answers
1. **One source, two views:** the header shows the SNG-109 lived paragraph (a full "story so far"); the arc section shows the SNG-133 arc's premise + stage. Both supersede the frozen seed; they share the same bio+play root without duplicating text.
2. **Popover generality:** `showPopoverText` is text-only (it `esc()`s its payload); the entity detail is plain text (multi-line), so it reuses the existing popover as-is — no HTML variant needed.
3. **Relationship paragraph:** template-first (deterministic, no latency), as recommended; an LLM weave stays an optional future enhancement.

## Guards honored
- **Seed is the first line, not the whole story** — never lost (shown until the lived story is written), never frozen (superseded by the SNG-109 paragraph).
- **One hover source** — a single `entityDetail` formatter + one delegated handler; no per-surface tooltip forks.
- **Paragraphs evolve** — `relationshipsParagraph` is re-derived each render from live bonds; the header story rides the SNG-109 `majorStateHash` cache invalidation.

## Verification
- **7 smoke tests:** `skillDetail` (rank/next/effective+base/family, unlearned, ripe); `npcDetail` (bond label + role + last-seen + latest beat); `itemDetail` (qty/pinned/uses); **the same entity → identical detail** (consistency, by construction); `relationshipsParagraph` (partner/allies/foe prose; empty when none). Full `npm test` green.
- **Browser-runtime, served module:** the formatters produce consistent detail ("Pell — partner · devoted"), the relationship prose reads right, empty-when-none holds. 4/4. Boot-clean on 8233; `data-entity` markers served for skill + npc.
- The on-screen *feel* (tapping a name/skill → the popover; the header story updating after play; the arc showing its stage) is a template over the verified formatters + the existing popover — eyeball in a keyed session.

## Files
`engine/entityDetail.js` (new — skillDetail/npcDetail/itemDetail/relationshipsParagraph) · `app.js` (entityHover dispatcher + data-entity handler + wiring at npc/skill sites; header story→lived paragraph; arc→personalArc stage; relationships paragraph render; Settings contentGenerator toggle; chronicle bonds carry id) · `style.css` (.entity-hover) · `tests/smoke.mjs` · `index.html`.
