# SNG-186 — The workbench: dev mode with the levers of every engine

**Author:** Aevi (PO) · 2026-07-19 · Erik-directed. Outcomes; engineering is CCode's.

> Erik: *"Spec me a Dev mode update that lets me have all the powers — travel to anywhere, know
> everything, pick an encounter and all its parameters to run and try, create npc, item, etc.
> Something that gives me the levers of all the engines and features."*

---

# §1 — WHY THIS IS WORTH MORE THAN CONVENIENCE

Every defect this batch cost a **live play session to find**. The lore loader starved 84 of 95
locations for months. Three op-classes sat at zero for sixteen levels. `carriedSubstrate` ran against
zero content. Twelve capabilities were built and unreachable.

**Erik is currently the only instrument in the system, and he is a slow one** — he has to *play* to a
defect. A workbench that reaches any location, any encounter, any entity turns a month of incidental
discovery into an afternoon of deliberate probing.

**The dev toggle already exists** (`?dev=1`, with the sticky `localStorage` flag deliberately retired).
This extends it; it does not invent it.

---

# §2 — THE LEVERS

## 2a. Go anywhere
Jump to any of the 95 locations by id or name, ignoring connections, waygates and travel time.
**Including the ones no path reaches** — that is a class of bug this finds immediately.

## 2b. Know everything — and the inverse, which matters more
Toggle omniscience: every location known, every NPC met, every codex entry, every tradition
revealed. **And the inverse — a "know nothing" reset**, because most retrieval bugs (SNG-176) only
appear from a position of ignorance. A tester who knows everything can never reproduce them.

## 2c. Stage an encounter with every parameter exposed
Pick any encounter def, override **every** field before it runs — opponent stats, `lethal`,
`yieldAt`, `minDanger`, danger level, harm rung, complications, round count — and run it against the
current character. Re-run with one field changed. **This is the balance harness `tuningNote` has been
waiting for**, arriving as a tool rather than a test suite.

## 2d. Mint anything
Create an NPC, item, companion, location or ability from a form, with every field the schema allows —
including the ones the GM usually fills. Mint a **registry-only** NPC specifically: that is the SNG-185
path, and it is currently only reachable by playing until the GM happens to introduce someone.

## 2e. Set state directly
Level, XP, attributes, standing with any people, substrate density at the current location, energy,
health, quest stage, arc stage, day and season, weather. **Set, not add** — a lever you can put
exactly where you want it.

## 2f. See the machine
The assembled GM prompt for the current turn, **the raw model response**, the parsed result, and which
ops fired. Erik produced the SNG-179 diagnosis by hand out of devtools; this makes that a button.
**Add firing counts per op-class** (SNG-183 §3c) — three ops read zero for sixteen levels and only a
deliberate capture found it.

## 2g. Run the lenses on demand
SNG-183's six checks against live state rather than against the repo: what is built and unreachable,
what is permitted but never initiated, what content no consumer reads, which ops have never fired.

---

# §3 — INVARIANTS

1. **Dev mode is never reachable by accident.** `?dev=1` explicitly; `?dev=0` always wins OFF; no
   sticky flag. A family member must never arrive here.
2. **Every dev action is marked in the save.** A character touched by the workbench carries a flag,
   and it is **visible** — in feedback reports especially. A bug report from a hand-edited save has
   wasted everyone's time before.
3. **Dev writes go through the same functions play does.** A lever that bypasses `applyNpcUpdates` or
   `recruit` tests a path that does not exist. **This is the whole discipline of the feature**: the
   workbench must exercise the real engines, or it will cheerfully prove things that are false.
4. **Nothing in dev mode ships behind a flag into play.** No dev-only code path the normal turn can
   reach.
5. **It must not become a second implementation.** If minting an NPC needs its own creation logic,
   that logic was missing from the engine and belongs there instead.
6. **Reversible.** Snapshot before a dev action, restore after. Probing should not cost the save.

---

# §4 — WHAT I WOULD BUILD FIRST

Ordered by what would have caught the most of this batch:

1. **§2f — see the machine.** The single highest-value lever. It is how SNG-179 was diagnosed, done
   by hand.
2. **§2c — stage an encounter with parameters.** Unblocks balance work that has been blocked on
   `tuningNote` since BATCH-12.
3. **§2a — go anywhere.** Cheapest, and immediately surfaces unreachable locations.
4. **§2b — the "know nothing" reset**, because retrieval bugs are invisible from omniscience.
5. §2d, §2e, §2g after.

# §5 — QUESTIONS FOR CCODE

1. §3.3 — is there a clean seam where dev levers can call the real mutation paths, or would some
   levers need to reach past them? **Any lever that has to bypass a path is telling us the path is
   incomplete**, and that is worth a ticket rather than a workaround.
2. §2f — is the assembled prompt already recoverable at runtime, or does capturing it mean holding
   something extra per turn?
3. §2c — does the encounter runner accept an override object today, or does staging mean a parallel
   entry point? Parallel is exactly §3.5's trap.
4. Is this one screen or a panel per engine? I lean **one screen with sections** — a workbench you
   scan, not a menu you navigate.
