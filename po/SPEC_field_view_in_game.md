# SPEC — the field view, in the game

**Author:** Aevi (PO) · **2026-09-09** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**subject:** ui, substrate · **prototype:** `exesa_field.html` (live, real data)
> Erik: *"The prototype is really really good — we should find out **how to incorporate it into the
> library/lore and the map.**"*

---

## §1 — ⛔ THE ONE THING THAT MUST CHANGE: THE PROTOTYPE SHOWS THE WHOLE WORLD

**`exesa_field.html` renders all 39 regions, all 44 anchors, all 26 waygates, all 164 roads.** ⚑ **That is
right for a TUNING TOOL and wrong for the game.**

⚠️ **`worldmap.js:110` already gates the map:** `known: visits > 0`. ⛑ **And the Library filters
`gm`/`secret`/`hidden` from every render.** ⛔ **Both gates exist and the prototype respects neither.**

⬜ **SO THE IN-GAME VIEW IS THE SAME RENDERER WITH A KNOWLEDGE MASK, AND THE MASK IS THE FEATURE:**

| ⚑ what the player sees | |
|---|---|
| **visited regions** | ⛑ **the field, in full** |
| ⚠️ **adjacent to visited** | ⛔ **the field, BLURRED AND DIMMED** — you can see there is something over there |
| **everywhere else** | ⛔ **nothing. Not dark — ABSENT** |
| ⚑ **an anchor** | ⚠️ **only if the place is known.** A crystal well you have not found is not on your map |
| **a waygate** | ⛑ already `known`-gated by the map — reuse it |

⛑ **AND THE UNKNOWN IS WORTH MORE THAN THE KNOWN HERE: a player who can see the field bloom at the edge of
what they have walked has a REASON TO GO**, and that is the whole loop.

---

## §2 — ⬜ WHERE IT GOES: THREE SURFACES, ONE RENDERER

### ⚑ 1 · THE MAP — a field layer, toggled

**`renderMap` → `renderMapWorld` is a GRID OF REGION CELLS, not a globe.** ⚠️ **Do not replace it.** ⛑ **The
field is a LAYER on the existing map**, the same way `drift` and `coast` are toggles in the prototype.

⬜ **Per-cell, not per-pixel:** ⚑ **each region cell tinted by the dominant source there, with the mix as
its colour** — ⛔ **so a Gearlands cell reads yellow, the Quickwood green, and a contested edge reads as the
blend.** ⚠️ **It is the same additive model, sampled at 39 points instead of 41,472.**

### ⚑ 2 · THE LIBRARY — the globe, as a page

**`LIBRARY_INDEX` already takes `kind: "md"` entries.** ⬜ **Add `kind: "field"`** — ⚠️ **one entry under
*The World*, rendering the globe with the knowledge mask on.**

⛑ **AND IT BELONGS THERE RATHER THAN IN THE MAP because the Library is where a player goes to UNDERSTAND
rather than to TRAVEL.** ⛔ **The map answers *"where do I go"*. The field view answers *"why is my craft
weak here"*.**

### ⚑ 3 · THE GROUND CARD — the number, at the point of decision

⚠️ **`SPEC_ground_card_everywhere` is the other half and it is unbuilt.** ⛑ **The field view shows a player
the SHAPE; the ground card gives them the NUMBER for one craft where they stand.** ⛔ **Neither is
sufficient alone** — a heatmap without a number is decoration, a number without a map is a mystery.

---

## §3 — ⚑ WHAT THE PROTOTYPE ALREADY PROVES, SO NOBODY REBUILDS IT

| ✅ working, on real data | |
|---|---|
| **the blended field** | ⛑ **the asset's own vote formula `w = 1/((d²+6)^1.6)`, BLENDED instead of winner-take-all** — ⚠️ same weights, different question, and it is why the edges bleed |
| **additive colour** | crystal blue · ordered nanite yellow · veil red · wild nanite green · meaning purple |
| ⛑ **two nanite grids** | ⛔ **ordered and wild are SEPARATE SOURCES** — 65 crafts and 45 crafts |
| ⚑ **wild is patchy** | *"scattered thin along the old routes and gone feral IN PATCHES"* |
| ⚑ **drift** | ⛔ **a COLLAR where the circuit is still kept; a FILLED bloom where it stopped; nothing where the ground is clear** |
| **meaning** | ⚠️ **derived per R38a from tags, tier, community, SIZE and TRAFFIC — and the roads carry it** |
| **veil** | ⛑ mirror of the lattice, **plus a lift at the 15 authored thin places** |
| **arc sliders** | ⚠️ **live, and the probe follows them** |

⛔ **AND ONE THING IN IT IS WRONG AND MUST NOT BE COPIED:** ⚠️ **the arc shift is applied per-source. See
`AEVI_20260909_handoff` §0 — ONE SHIFT, ON THE GROUND, READ BY ALL.**

---

## §4 — ⬜ AND THE HONEST LIMITS TO CARRY OVER

| ⚠️ | |
|---|---|
| **the `kind → size` table is Aevi's** | ⛔ **there is NO population field in the corpus.** `city 1.0, town 0.7, hermitage 0.1` are guesses and should become authored content |
| **the drift rings are PROPOSED** | ⚑ reasoned from *"the reprocessing never stopped… on a schedule somebody still keeps"*, but not authored |
| **the arc→source effects are Aevi's** | ⬜ **the table Erik should overrule first** |
| ⛑ **and the tuning tool should stay** | ⚠️ **`exesa_field.html` unmasked is how the bands get turned.** ⛔ **Do not fold it into the game build — it is a DIFFERENT TOOL for a different person** |

---

## §5 — ROUND 2 QUESTIONS

1. ⛔ **Does the globe belong in the Library at all, or only the map layer?** ⚑ **Aevi: BOTH, because they
   answer different questions** — ⚠️ but the Library one is the bigger build and could wait.
2. ⚠️ **How is "adjacent to visited" computed?** ⛑ **`connections` is the obvious edge set** — ⬜ and 164
   road edges already exist between placed locations.
3. ⬜ **Does seeing the field count as knowing a place?** ⛔ **Aevi's read: NO.** ⚠️ **Seeing a bloom on the
   horizon is not having been there** — and the codex should not mint an entry from it.
4. ⚑ **Should arc stages be visible to the player at all?** ⛔ **Aevi's read: the STAGE is not, the GROUND
   is.** ⚠️ **A player should feel the world change and have to work out why** — *"deathsense here 78%, and
   it was 84% last season"* is the honest surface, and the arc name is the GM's.
