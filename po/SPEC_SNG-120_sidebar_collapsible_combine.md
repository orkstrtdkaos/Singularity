# SPEC — SNG-120: Collapsible sidebar + combine redundant sections
## Aevi (PO) · 2026-07-16 · authored to spec · **awaiting CCode ROUND 2**

> **One line.** The play sidebar has grown to ~12 stacked sections (four phone-screenshots tall). Make every section a **collapsible** with a remembered open/closed state, and **combine the sections that are duplicates or the same concept** — most importantly the two that show the same people twice.

> **Verified at HEAD `v1.8.81`.** The sidebar is a uniform run of `<section><h3>…</h3>…</section>` blocks in `renderPlay` (~L5220–5288): Attributes, Abilities, **People you know (L5224)**, Quests, Party, Companions, Items, **{place} — standing & who's here (L5272)**, Play-style, Map & Rest, Codex. A `<details>/<summary>` collapse idiom already exists in the file (8 uses) and an open-state tracker pattern already exists (`npcGroupsOpen`/`npcGroupsClosed`, L130/145) — **this reuses both, invents neither.**

## THE COMBINES (verified redundancies, not just preference)
1. **"People you know" (L5224) ⟂ "{place} — standing & who's here" (L5272) show the SAME people twice.** SNG-119 added the richer place-scoped list (names + standing bands + scoped to the current place); the older bare "People you know → Millbrook (8)" list at L5224 was never removed. **The L5224 section is a stale leftover — fold it into the SNG-119 section and delete it.** (Screenshots 3 & 4: "Millbrook (8)" and then the same 8 people with bands.) This is the highest-value combine — it's a genuine duplication.
2. **Party + Companions → one "Company" section.** Both are "who travels with you": Party = other players (sync), Companions = NPCs (Huginn). One section, two groups. Collapses to nothing when solo + no companions.
3. **Attributes + Abilities** stay separate (different acts — one you set, one you play) but both collapse.

## THE COLLAPSIBLE MODEL
- Each `<section>` becomes collapsible: clickable `<h3>` header with a ▸/▾ affordance, body hidden when collapsed. Reuse the existing `<details>/<summary>` idiom OR the `npcGroups` open-set pattern (recommend the open-set: it already persists across renders and matches the NPC-group behavior the player already knows).
- **Per-section open/closed state persisted** (like `npcGroupsOpen`) so choices stick across turns and reloads.
- **Sensible defaults** (open unless noted):
  - Open: **Abilities** (the active surface), **{place} standing & who's here**, **Items**.
  - Collapsed by default: **Attributes** (set-once, rarely re-read), **Play-style** (chips are a glance; noise when idle), **Map & Rest**, **Codex & Library**, **Company** when solo, **Quests** when empty ("the valley will provide" doesn't need to occupy a screen).
- A collapsed section still shows a **one-line summary in its header** where cheap (e.g. "Company (2)", "Items (18)", "Millbrook · revered") so a glance answers without expanding.

## ENGINE / UI SURFACES
| Module | Change |
|---|---|
| `app.js` (renderPlay ~L5220–5288) | Wrap each section in a collapsible; delete the stale L5224 "People you know" (fold into L5272); merge Party+Companions into "Company"; header summaries; default open/closed map. |
| `app.js` (state) | A `sidebarSectionsCollapsed` set (mirror `npcGroupsClosed`) persisted on the character/profile; toggle handler delegated like the existing group toggles. |
| `style.css` | Collapsible `<h3>` affordance (▸/▾), collapsed-body hide, header-summary styling; keep the section rhythm. |
| `tests/*` | Each section toggles + persists; the L5224 duplicate is gone (people shown once); Party+Companions render as one Company section; solo+no-companions hides Company; collapsed headers show their summary counts. |

## GUARDS
- **No information lost** — combining folds the duplicate into the richer view; collapsing hides, never deletes; every datum is one click away.
- **The duplicate people-list must be GONE, shown once** — a test asserts a given NPC appears in exactly one sidebar section.
- **Defaults serve play** — the surfaces you touch mid-scene (abilities, who's here, items) default open; reference/config (attributes, codex, map) default collapsed.
- Phone-first: collapsed defaults keep the initial scroll short; the header summaries mean you rarely need to expand.

## OPEN QUESTIONS — CCODE ROUND 2
1. Persist section state on the character save or on the profile (cross-character)? Recommend **profile** — it's a UI preference, not character data.
2. Does the existing `<details>` idiom persist open-state across `renderPlay` re-renders, or does only the `npcGroups` open-set survive a re-render? (Determines which mechanism to standardize on — recommend the open-set for consistency.)
3. Any section that must always be visible (never collapsible) — e.g. the vitals/health-energy bars? Recommend vitals stay pinned above the collapsibles.
