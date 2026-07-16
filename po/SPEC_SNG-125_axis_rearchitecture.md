# SPEC — SNG-125: Axis re-architecture — secondary bound to primary (adjacent), tertiary freed
## Aevi (PO) · 2026-07-16 · authored to spec · **awaiting Erik's two rulings + CCode ROUND 2**

> **Erik's design correction ("I made a wrong move when we first laid it out"):** the three domains are currently three FREE picks with no binding between them — which throws away the great circle's geometry. New model: **primary** forecloses its antipode (unchanged); **secondary must be ADJACENT to primary** (bound to the core, forecloses its own antipode's high tiers as now); **tertiary is freed** — chosen anywhere, no longer bound to secondary. Result: a character with a *center of gravity* (primary + kin secondary) plus one *wildcard* reach (tertiary anywhere). Concentrated core, one wild thread — a shape that reads as a real person.

> **Verified at HEAD `v1.8.82`.** `domainAccess` (traditions.js) + `domainCircleSVG` (app.js L1127): primary/secondary/tertiary are each **freely selectable, anywhere on the circle, with no adjacency binding between any of them.** Caps 5/3/2; primary's + secondary's antipodes `closed`; **tertiary's antipode is NOT closed** (asymmetry already present). **There is no secondary↔tertiary binding in the code today** — so this spec *adds* a primary→secondary adjacency constraint and confirms tertiary as free (which it already effectively is). An `adjacent`/`kin` band ALREADY EXISTS in the gate (L3543 "kin of your primary (no capstones)") — the constraint should reuse that kin definition, not invent a new distance.

> **Aside RESOLVED (Erik's "primary unchangeable in the builder"):** not a bug. Primary is **seeded by origin** (L1806 "origin SEEDS the circle — a pole-people's native tradition pre-fills the primary") + shaped by the prologue (`crystallizeDomains`, L2252). Primary = who your people made you, inherited not picked — coherent with the framework (origin → native tradition). **Recommend leaving it fixed.** Flagged for Erik to confirm; if he wants primary re-pickable, that's a separate small change.

## THE MODEL CHANGE
| Domain | Current | New |
|---|---|---|
| **Primary** | free pick (seeded by origin); antipode closed+foreclosed; cap 5 | **unchanged** |
| **Secondary** | free pick anywhere; antipode closed; cap 3 | **must be ADJACENT/kin to primary**; antipode closed (high tiers foreclosed) as now; cap 3 |
| **Tertiary** | free pick anywhere; cap 2; antipode NOT closed | **free anywhere (unchanged mechanics)** — explicitly no longer conceptually bound to secondary |

The one real change is the **primary→secondary adjacency constraint** at selection time (and its display on the circle). Tertiary already behaves as "free"; the spec just makes that canonical and severs any lingering secondary-binding language.

## ⚖ TWO RULINGS ERIK OWES (flagged, not pre-decided)
1. **How adjacent is "adjacent"?** On the 24-tradition ring: immediate neighbor (±1 → only 2 choices, very tight) or the existing **kin band** (±small arc, ~4–6 choices)? **Recommend: reuse the existing `adjacent`/`kin` band** already in `domainAccess` — one coherent notion, sensible breadth, and it's already defined + displayed. Erik picks the arc width.
2. **Existing characters (grandfather).** Silas = primary ashwarden, secondary cogitant, tertiary figurist. If cogitant isn't kin-adjacent to ashwarden under the new rule, this would make his build illegal. **The constraint must apply to NEW selection only; existing domain picks stay valid (Law-14: never invalidate owned ground).** Recommend building it grandfathered regardless; Erik confirms.

## ENGINE / UI SURFACES
| Module | Change |
|---|---|
| `engine/traditions.js` | An `isKinAdjacent(primary, candidate, index, arc)` helper (reuse the kin/adjacent band definition); `domainAccess` unchanged in gating math (caps/foreclosure stay) — the change is at *selection*, not access. |
| `app.js` `domainCircleSVG` (L1127) selection | When choosing **secondary**, only kin-adjacent-to-primary nodes are `selectable`; non-adjacent nodes show as unavailable-for-secondary with a reason ("secondary must be kin to your primary"). **Tertiary** selection: freely selectable (minus closed/foreclosed/already-taken). |
| `app.js` creation/prologue (`crystallizeDomains`, L2252) | If the prologue-derived secondary isn't kin-adjacent, snap it to the nearest kin tradition or prompt — never auto-produce an illegal build. |
| `engine/*` (validation) | A `domainsLegal(character, index)` check (grandfather-tolerant): new builds enforce adjacency; loaded characters with legacy non-adjacent secondaries are flagged legal (grandfathered), not broken. |
| `tests/*` | New build: secondary selectable only among primary's kin; a non-adjacent secondary pick is refused with a reason; tertiary selectable anywhere legal; **a legacy character with a non-adjacent secondary loads and plays (grandfathered)**; promotion/foreclosure math unchanged. |

## GUARDS
- **Grandfather absolute** — no existing character's domains become illegal or lose access. The constraint gates NEW selection only.
- **Access math unchanged** — caps (5/3/2), foreclosure, promotion, acquisition all behave exactly as now; this is a *selection* constraint, not an access rewrite. (Keeps the SNG-101/102 shipped work intact.)
- **Reuse the existing kin band** — don't mint a second adjacency notion; the circle already has one.
- **Primary stays origin-seeded** (unless Erik rules otherwise) — the adjacency is measured from that inherited primary.

## OPEN QUESTIONS — ERIK (design) then CCODE (build)
1. **[ERIK]** Adjacency arc width — immediate ±1, or the existing kin band? (Recommend kin band.)
2. **[ERIK]** Confirm primary stays origin-seeded/fixed (recommend yes), or make it re-pickable at build.
3. **[ERIK]** Does tertiary keep its current "antipode NOT closed" asymmetry, or should freeing it come with closing its antipode too (symmetry with secondary)? *(This is the one genuinely open mechanical question — freeing tertiary conceptually might argue for either; your call on whether a free tertiary still leaves its far pole open.)*
4. **[CCODE]** Confirm the kin/adjacent band helper is reusable for a selection constraint (it's currently an access-band label — needs to answer "is X kin-adjacent to primary?" cleanly).
