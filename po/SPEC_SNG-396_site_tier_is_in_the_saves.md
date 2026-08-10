# SNG-396 — ⛔ THE SITE TIER ALREADY EXISTS. It is in the saves, and it was never placed.

**Author:** Aevi (PO) · **Date:** 2026-08-09 · **Erik:** *"read my saves to find out what places belong
where… most of them you authored but they might be wrongly located since they were never placed correctly"*
**Supersedes the authoring plan in SNG-392 §5 and SNG-398 §5.**

---

## §1 — WHAT THE SAVES CONTAIN

**16 generated place records across 5 players and 14 characters.** Every one carries the same seed
sentence, which says exactly what happened:

> *"A place the road led to — X. **The fiction brought you here before the map knew its name.**"*

⛔ **These are the site tier. Play authored it, one room at a time, and content never learned.**

**The Cogitarium alone has two:** `gen-cogitarium-entrance-hall` and `gen-cogitarium-third-terrace`.
Also present: the Low Lamp Inn, Mara Wells Store, the Ent Grove, the Ossian Office, the North Gate
District Street, the Passage Below the Unlit Deep, the Ashwarden March Road, the Quickwood Margin.

## §1a — ⛔ AND ONE OF THEM IS CANON NOBODY WROTE DOWN

```
gen-the-made-gate — "The Made Gate"
"The first waygate MADE rather than reached-for — cut at the Crossing by a wright who tends endings"
```

⚠️ **A player made a waygate.** SNG-148 established 26 gates as found infrastructure. **This is the 27th
and it is the first that was built** — by an Ashwarden, at the Crossing. **That is a world event sitting in
a save file, and the world map does not know it happened.**

---

## §2 — ⛔ ERIK'S SECOND HALF: THEY ARE WRONGLY LOCATED

| field | state |
|---|---|
| `worldPos` | ⛔ **null on all 16** |
| `parentId` | set on **3 of 16** |
| `tier` | ⛔ **null on all 16** |

**And the region assignments are visibly wrong:**

- ⛔ `gen-cogitarium-entrance-hall` → `somatic_reaches` · `gen-cogitarium-third-terrace` → **`valley`**.
  **Two rooms of the same building, filed in regions on opposite sides of the world.**
- `gen-the-ent-grove` → `valley`. **The Ents are in `manifest_domain`.**
- `gen-north-gate-registry-ossian-office` → `the_center` ✅, but `gen-center` → `valley` ⛔
- **9 of 16 default to `valley`**, which is the fallback, not a placement.

⚠️ **This is the SAME failure as `the_hollowing` and Raven's Home, at a different tier: the fiction is
right and the placement was never done.**

---

## §3 — WHAT I NEED FROM CCODE

⛔ **Do NOT auto-promote these.** They need review; several are duplicates or scene-dressing
(`gen-object-object` is a bug artifact, not a place).

1. **An extractor**: scan all character saves, emit every generated place with its id, name,
   `descriptionSeed`, observed `parentId`, observed `placeEdges`, visit count and `placeMemory` notes,
   to `po/staged_content/generated_places.json` **for my review**. Same handoff as the hierarchy.
   ⚠️ **Include the memory notes — they are the only record of what these places ARE.**
2. **A gate**: ⛔ **a generated place that has been visited more than once and is not in content is a
   REPORTABLE BACKLOG ITEM, not an error.** The census names them; it should not go red for their
   existing. **Play is supposed to outrun content. Content is not supposed to forget.**
3. ⚠️ **`gen-object-object` is a defect** — a place id built from `[object Object]`, visited 4 times,
   with real memory notes attached. **Find where a place object is being stringified into an id.**

---

## §4 — WHAT I WILL DO

**Promote the real ones to content, placed properly:**

- **Parent from the fiction, not the graph.** The Cogitarium's entrance hall belongs to `the_cogitarium`
  because it says so in its name — ⛔ **this is precisely the signal SNG-398 showed the topology could not
  give me.**
- **`worldPos` from the parent**, since a room is at its building's coordinates.
- **`localMap` authored per settlement**, which is what I was originally going to invent — **except now I
  am placing rooms that already exist in play rather than inventing rooms that do not.**
- **`tier: site`, `parentId` set** — and these will pass the distance gate SNG-398 asked for, because a
  room really is at its building.

⛔ **AND THE MADE GATE GOES TO CANON SEPARATELY.** A player-built waygate is a world event, not a site. It
needs a `waygate` flag, a tier, and a line in the lore — **the network is no longer purely inherited.**

---

## §5 — What this changes about SNG-398

I said the site tier might have to be **authored from nothing**. ⛔ **It does not. It was authored in play
and never collected.** The 65 topology-derived "sites" are still wrong and still need re-deriving — but the
real tier is 16 places deep already and every one has a description, memory notes, and a reason to exist.

⚠️ **Erik was right that the saves know. I should have read them before proposing to invent.**
