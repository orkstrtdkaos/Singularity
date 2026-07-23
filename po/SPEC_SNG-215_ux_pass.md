# SPEC — SNG-215: The play-screen UX pass (four surfaces)
## Aevi (PO) · 2026-07-22 · Erik-directed product direction

> Four UX asks from Erik, all front-end (app.js, the render layer). Product-direction spec — the WHAT and
> WHY; CCode owns the HOW inside app.js. Design language grounds in THIS world (a rune/craft RPG): crafts are
> tools, items are physical objects in a bag, traits are lore + mechanics together — not generic dashboard
> patterns.

---

## §A — Skill-boost affordance + sidebar grouping
Two related changes to the ability sidebar.

### A1 — Player-set skill BOOST (a nudge, not an override)
> Erik: *"let the user choose skills to boost for narrative options — something on the sidebar that indicates
> you want to use the skill more. Not an override, just a boost."*

- **What:** a per-craft toggle/marker in the sidebar — the player flags a craft they WANT to use more. This
  feeds the SNG-214 abilityId suggestion as a WEIGHT: a boosted craft is preferred (when it fits) in the
  choices the GM pre-fills. It is a thumb on the scale, NOT a filter — an un-boosted craft still gets
  suggested when it's the fitting tool; the fiction is never forced.
- **Why:** pairs exactly with SNG-214. That spec stops the GM defaulting to Order-Sense by structuring
  variety; THIS gives the player a voice in that structure — "I'm trying to lean into Wither right now,
  surface it when it fits." The player expresses aspiration directly instead of only through declared-goal
  text. It's the player-facing half of the diversity fix.
- **Mechanic:** a `boostedCrafts: [abilityId]` on the character; the GM context surfaces it; SNG-214's
  suggestion rule adds a preference weight for boosted crafts. Depends on SNG-214 landing (the suggestion
  structure this boost feeds into).
- **Guard:** boost ≠ override. It raises the odds a craft is SUGGESTED when apt; it never forces a craft into
  an ill-fitting beat, never guarantees it appears, never changes rolls. A "boost" that overrode fit would
  make every turn about that craft — the opposite of the diversity we're chasing.

### A2 — Group the sidebar crafts by FUNCTION
> Erik: *"the skills in the sidebar could probably be cleaned up — group them by function, for example."*

- **What:** replace the flat craft list with crafts grouped by FUNCTION FAMILY (the 8 function families the
  world already defines — the KNOW/HARM/WARD/MOVE/MAKE/MEND/SWAY/REACH-style families each tradition
  expresses). A player scanning for "what can I use to WARD here" finds the warding crafts together.
- **Why:** the sidebar in Erik's screenshot is a long undifferentiated scroll (Deathsense, Palework, Wither,
  Grey Hand, Grey Road, Kept Breath…). Grouping by function makes the kit legible at a glance and reinforces
  the game's own conceptual spine (functions, not a flat inventory of spells). It also makes A1 (boosting)
  and SNG-214 (diversity) READABLE — you can see you've boosted three KNOW crafts and no HARM craft.
- **Mechanic:** each craft already maps to a function family (the 24-verb vocabulary / function-family data).
  Group the render by that field; collapsible groups; show the boosted marker (A1) inline.
- **Guard:** grouping is a VIEW, not a re-sort of truth — don't lose rank/energy/practice info; each craft
  still shows its rank, cost, and practice progress within its group.

---

## §B — Inventory: from list to BAG
> Erik: *"the inventory needs a big UI cleanup. Poorly laid out, not nice for quick info. Less of a list,
> more of a bag layout — tiny images for each item next to a short description, then a more detailed popup
> with a larger image when clicked."*

- **What:** replace the inventory list with a BAG grid — each item a small tile (tiny image + short name/desc),
  tap/click opens a DETAIL POPUP (larger image + full description + mechanics: kind, uses, equip state, any
  growth/evolution progress for story items). Quick-scan grid; depth on demand.
- **Why:** matches how a player actually uses inventory — glance to see WHAT you have, click to see DETAILS
  of one thing. A list is bad at both (verbose for scanning, shallow for detail). A bag is the item's own
  world — physical objects you rifle through — which is the right metaphor for a craft-RPG.
- **Layout (the direction, CCode executes):**
  - Grid of tiles, tiny item image + 1-line name. Pinned items (ensurePins/pinnedItems already exist) float
    to the top or get a marker.
  - Click → popup: larger image, full description, mechanics block (kind, uses remaining via itemUses,
    equipped state, and for growing/story items their evolution progress — the Unfinished-Spear-style
    gate/rank).
  - Story items that GROW get their progress shown in the detail popup (the item earning power through play,
    per SNG evolution — make that visible).
- **Mechanic:** inventory data + helpers already exist (normalizeInventory, displayName, itemUses,
  equipmentBonus, pinnedItems, itemDetail). This is a RENDER change over existing data + an image per item
  (image source: the item's own imagePrompt if it has one, or a kind-based placeholder — flag to Erik whether
  to generate item images or use kind-icons first).
- **Guard:** don't hide mechanics in the pursuit of pretty — the detail popup must show uses/kind/equip/growth
  plainly; a bag that looks nice but buries "how many uses left" fails the quick-info goal.

---

## §C — Merge Chronicle + Character Sheet (traits as lore + mechanics)
> Erik: *"the Chronicle and the main Character sheet need to be merged — there are fields that overlap
> purpose. Any background or other character trait should be in a clean layout with relevant information
> next to it or in a popup — telling the player not only the game-lore relevance but also the functional
> mechanics."*

- **What:** merge the two screens into ONE character view. De-duplicate the overlapping fields. Every trait
  (background, origin, tradition, form, aspirations, and the chronicle's history of who the character has
  BECOME) presented in a clean layout where each trait shows — inline or in a popup — BOTH its lore meaning
  AND its functional mechanics.
- **Why:** they overlap because they're the same thing from two angles — the character sheet is who you ARE
  (static traits), the chronicle is who you've BECOME (accrued history). Splitting them scatters a single
  question ("who is Silas?") across two screens with duplicated fields. Merged, the sheet becomes the whole
  character: traits + the story that shaped them, each trait legible in BOTH registers.
- **The trait-detail pattern (the heart of the ask):** every trait gets a two-register readout —
  - **LORE:** what this trait MEANS in the world (a background's story, a tradition's place in the great
    circle, an aspiration's fictional weight).
  - **MECHANICS:** what it DOES (a background's stat/skill implications, a tradition's domain access + which
    function families it grants, an aspiration's growth path, form's effects). Erik's explicit ask: tell the
    player the FUNCTIONAL mechanics, not just the flavor.
  - Present inline where short, popup where deep. The popup is the natural home for the full lore+mechanics
    of a trait the player taps.
- **Mechanic:** chronicle data (engine/chronicle.js — deeds, session log, authorship, the become-history)
  and character fields (background/origin/tradition/form/aspirations/abilities) both already exist; this is a
  unified RENDER + a trait→(lore, mechanics) lookup. That lookup is CONTENT I can author — a
  `trait_readouts` map giving each background/tradition/form/aspiration its lore blurb + mechanics summary,
  parallel to tradition_motivations.json. Flag: I author the readout content; CCode builds the merged view.
- **Guard:** merging must not LOSE the chronicle's distinct value — the become-history (scenes, deeds, how
  the character changed) is not the same as static traits; the merged view holds BOTH (who you are AND the
  record of becoming it), de-duplicating only the genuinely redundant fields.

---

## SEQUENCING / DEPENDENCIES
- **§A1 (boost)** depends on **SNG-214** (the suggestion structure it weights). Land 214 first, then A1.
- **§A2, §B, §C** are independent front-end passes — any order.
- **§C** wants a `trait_readouts` content file (Aevi authors) before or alongside the merged-view build.
- All four are app.js render work — CCode's lane. This spec is the product direction + the two content
  pieces Aevi owns (the trait_readouts map; the function-family grouping already exists as data).

## OPEN QUESTIONS — CCODE ROUND 2
1. **§B item images** — generate a portrait per item (imagePrompt, like NPCs/Aevi), or start with
   kind-based icons and add images later? (Icons ship faster; images are richer. Erik's call.)
2. **§C merge** — one scrolling view, or tabs-within-one-screen (Traits | Becoming)? The ask is "merged"; the
   question is whether merged = one surface or one screen with two clean sections.
3. **§A2 grouping** — is the function-family per craft already on the ability records the sidebar reads, or
   does the render need to join against the function-vocabulary data? (Determines if it's pure render or
   needs a data join.)
4. **§C trait_readouts** — confirm the trait set to cover (background, origin, tradition, form, aspirations —
   others?) so Aevi authors the complete lore+mechanics map.
