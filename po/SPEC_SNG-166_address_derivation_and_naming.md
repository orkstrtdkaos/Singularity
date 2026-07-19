# SNG-166 — Address derivation, region naming, and how names are made

**Author:** Aevi (PO) · 2026-07-18 · Erik-directed from live play + two map screenshots
**Numbering:** minted after checking `po/` at HEAD (highest allocated was 165), per the ratified scheme.

Three defects, one theme: **the world names and places things without a system, so it drifts toward
whatever the model finds easy.**

---

# §1 — ADDRESS DERIVATION (the bug Erik is standing in)

## The symptom

Erik is at **"Ashwarden March Road"** and it renders inside *The Valley of Echoes*. It should be at
the waygate in the **Pale March**. The name says Ashwarden; the address says Valley.

## Root cause — `engine/generate.js:70`

```js
const region = loc.regionId || context.regionId || "valley";
```

A generated location takes **whatever region the player is standing in**, and when that fails,
**silently defaults to `"valley"`**. There is no derivation step. Nothing reads the place's own
content to work out where it belongs.

Two failures in one line:
1. **Inheritance is wrong by default.** Things generated *while travelling toward* somewhere belong at
   the destination or the border, not at the origin.
2. **`|| "valley"` is a silent catch-all.** Every un-addressed place in the world lands in the starting
   region. That is why the Valley holds **16 places** while every other region holds 3–6 (screenshot 2).
   The Valley is not big; it is the drain.

## The fix — derive, then verify, never default

On generation, resolve region in this order, first hit wins:

1. **Explicit** — the generation request named a region.
2. **Named-entity derivation** — the place's own name/description references a people, tradition,
   settlement, or landmark with a known home. *"Ashwarden March Road"* contains `ashwarden` →
   `the_palelands`. This is the step that does not exist and is the one Erik is asking for.
3. **Connection inheritance** — the region of the location it was generated *from*, when that place
   is interior to a region.
4. **Coordinate containment** — the region whose member locations' hull contains the new map point.
5. **NO DEFAULT.** If 1–4 all fail, the place is *unaddressed*: flag it, surface it to the GM as
   needing placement, and do not silently assign it. A wrong address is worse than a known-missing one.

**Migration:** every existing generated location re-runs derivation once. Expect the Valley's 16 to
fall substantially — and each move is auditable because the rule that fired is recorded.

**Record the reason.** Store `regionSource: "explicit" | "named-entity" | "connection" | "coordinate"`
on the location. When a place is in the wrong Reach, we then know *why* rather than guessing.

## Also: roads and waygates specifically

Erik's case is a **road**, and a road is a special shape — it *connects* two regions and belongs to
the border, not to either interior. A generated way/road/pass/crossing whose name or description
names a destination should sit at the seam and carry both regions in `connections`. The waygate at
Cairnhold is its Palelands anchor.

---

# §2 — REGION NAMES: seven Reaches is too many

## Measured

25 regions. **"Reach" appears in 7 names** — Somatic Reaches, Numinous, Veiled, Stark, Pattern, Open,
Kept. **"March" appears in 2** — Hollow March, Riven Marches.

The deeper problem: **"Reach" is also the category noun.** Canon says *"the twelve Reaches"*
(`loreRefs: the_twelve_reaches`) — it means *a region of this world*, the way "county" does. Using it
inside 7 proper names makes the category and the name the same word, so the map reads as a list of
variations rather than a set of places.

## Rule

**"Reach" stays as the category. Most regions get a proper name that is not the category.** Erik: *"a
couple duplicates are ok… but this is too much."* Target: **at most 2** regions carrying `Reach` in
the proper name, at most 1 carrying `March` (the Riven Marches, whose name is load-bearing — it is a
frontier and *march* means frontier).

## Proposed renames — PM ratification required, NOT applied

Style aligned to what each region actually is:

| current | proposed | why |
|---|---|---|
| The Kept Reach | **The Kept Hours** | clock-country, archives, the Slow Hour. The name should say *time*, not *place* |
| The Open Reach | **The Long Horizon** | endless roads, a settlement that MOVES; horizon is already its word |
| The Pattern Reach | **Cloudform** *or* **The Figurate** | its city is Cloudform and its terrain will not hold a shape |
| The Stark Reach | **The Told Ground** | its great feature is a field of standing stones, each one a sentence. Perfect and already canon |
| The Veiled Reach | **The Mirrorlands** | the map is lying there; mirrors are its whole idiom |
| The Numinous Reach | *(keep)* | one of the two survivors — "numinous" is doing real work |
| The Somatic Reaches | *(keep)* | the other survivor; plural, and body/mind as architecture |
| The Palelands / The Hollow March | **The Palelands** (drop the alias) | the dual name is half the March problem and the Palelands stands alone |

**Migration cost is real and must be priced before ratifying:** region ids stay stable (`the_kept_reach`
etc. are internal), so this is a *display-name* change plus prose references in locations, tradition
profiles, lore files, and the Accords. Ids must NOT change — that would break saves, `regionsKnown`,
and substrate keys.

---

# §3 — NPC NAMES: there is no name system at all

## Measured

Grep across `engine/` and `content/packs/` for `nameSeed`, `namePool`, `generateName`, `nameBank`,
name-style content: **nothing.** `generate.js` handles name **deduplication** (`resolveExisting`,
`namematch.js`) — it is good at not minting the same person twice — and gives **zero guidance on how a
name should be formed.**

So every NPC name is invented free-hand by the model. That is exactly why Erik keeps meeting **Mara**:
left unconstrained, a model returns to a small set of high-frequency fantasy names. This is not a
model defect; it is a missing content system.

## The fix — regional onomastics as authored content

New `content/packs/core/rules/naming.json`, one entry per region, each carrying:

- **phonology** — the sounds this people's names are built from, as guidance not a generator
  (Palelands: grey, flat vowels, hard stops — *Hallis, Oreth, Kestrin, Bren*)
- **structure** — given only? given + trade? given + place? patronymic? The Marches use forms; the
  Churn does not
- **exemplars** — 8–12 real names, which is what the model actually pattern-matches on
- **avoid** — an explicit list of the attractors: *Mara, Elara, Kael, Lyra, Sera, Thorne, Rhys*.
  Naming them is the single highest-value line in the file
- **surnames/epithets** — the Umbral take epithets, the Lattice take tier-numbers, the Rootkin take
  their grove

The GM prompt gains a short **NAMING** block sourced from the *current location's region*, so names
arrive in local style automatically.

## Guards, because this will drift back

- **Repetition ratchet.** Count distinct NPC given-names against total NPCs; fail if the top name
  exceeds a share threshold. Cheap, and it catches the exact "another Mara" symptom Erik reported.
- **Avoid-list check** in `content_ci`: no authored NPC uses a name on the avoid list.
- The dedup layer (`namesMatch`) already stops *duplicates*; this stops **monotony**, which is a
  different failure and currently unguarded.

---

# §4 — Why these three are one spec

All three are the same defect at different layers: **a generation step with no authored constraint
falls back to whatever is easiest** — the current region, the category noun, the most common name.
The fixes are the same shape too: *derive from content, record why, guard against drift.*

They also share a surface. §1's `regionSource` and §3's naming block are both things the GM should
see, and §2 changes what both of them display.

# §5 — Questions for CCode ROUND 2

1. §1.2 — is named-entity derivation better as a content map (`tradition → home region`, authored) or
   as a lookup over existing entity records? I lean authored map: small, legible, and it fails loudly.
2. §1.5 — where does an *unaddressed* location live until placed? A holding area, or does generation
   simply refuse and retry with a region hint?
3. §2 — cost of a display-name migration with stable ids. If it is large, Erik should hear the number
   before ratifying, not after.
4. §3 — the naming block per region adds prompt weight on every turn. Is it small enough to always
   carry, or does it belong in the same conditional slot as the waygate block?


---

## CORRECTION (Aevi, after CCode's verification pass)

**§3's evidence was thinner than I wrote it, and the guard I designed would not have caught the bug.**

I claimed the missing name system is *"exactly why Erik keeps meeting Mara."* Measured at HEAD: the
authored corpus is **41 NPCs, 35 distinct given names, one repeat (`wren`), and exactly one Mara.**
CCode measured Erik's live registry: **20 people, zero given-name repeats.** There is no measurable
repetition problem in either the corpus or the save.

What actually happened: I had two pieces of real evidence — Erik's live-play report, and a **verified**
structural absence (no `nameSeed`, no `namePool`, no naming content, confirmed by grep) — and fused
them into a causal claim I presented as measured. The absence is solid. The "keeps meeting Mara" is
Erik's observation **across characters and sessions**, which is a different and un-measured thing.

**This breaks the guard.** §3 proposed a repetition ratchet counting distinct given-names against
total NPCs. Per character, that reads GREEN — the repeats Erik is seeing are *across* devices and
saves. A guard that passes while the reported problem persists is worse than no guard, because it
converts an open question into false assurance.

**Corrected guard:** repetition must be counted **across the device** — all characters, all saves — not
within one. The avoid-list check and the authored-onomastics content are unaffected and remain the
substance of the fix.

**The argument for §3 survives on the absence alone.** A generation step with no authored constraint
will drift toward the model's attractors; that is true whether or not it has visibly happened yet.
But the spec should have said *"this will drift"* rather than *"this is why it drifted,"* and the
difference is exactly the failure mode this session has been cataloguing: **a number that looked like
a finding, asserted without measuring the baseline.** Fourth instance, and mine.

### Also corrected from the same pass

- **The Valley is 11 authored, not 16.** The 16 counts authored + generated from Erik's save — which
  *sharpens* §1 rather than weakening it: the gap between 11 and 16 is precisely the bug's footprint,
  because `|| "valley"` only fires on generation. It also gives the fix a prediction to be held to:
  **authored counts must not move at all.** Adopted as an acceptance criterion.
- **43 NPCs and 27 lore files** (CCode's count; mine read 41 from `npcs/*.json` — the delta is likely
  companions or challengers counted from another source, and CCode's is the wider net). Either way the
  orphaned-lore finding gets *worse*, not better: 27 files, still only 14 refs in use.
