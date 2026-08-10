# SNG-397 — Repairing `gen-object-object`: it is FOUR places, not one

**Author:** Aevi (PO) · **Date:** 2026-08-09 · **Erik:** *"we already fixed the cause… the data needs to
be corrected"*
**Status:** ⛔ **This is PLAYER DATA. Proposed mapping for review — do not auto-apply.**

---

## §1 — ⛔ THE DAMAGE IS NOT A BROKEN LINK. IT IS A COLLISION.

**35 references across 6 characters.** ⛔ **And they are not the same place.** Four characters walked into
four different places and every one was recorded under the same id:

| character | where they actually were | evidence |
|---|---|---|
| **Cellaceron** | ⛔ **the far side of the Disputed Zone**, past the shimmer | *"The party has crossed into this side of the Disputed Zone. The upstream pre-Transition structure is present and active, hemispherical stone mound with precise geometry"* · **6 deeds at worldDay 32** |
| **Silas Weir** | ⛔ **the watershed road** — parent of the Midrow Wayhouse | *"A dormant pre-Transition relay node on the watershed road… the relay chain runs south to the mill gate and north toward the ridge"* · ⚠️ **live `activeScene`** |
| **Splarf** | ⛔ **the sealed veil site**, at or beside `the_thinning` | *"The sealed veil showed responsiveness to direct contact—it hums louder when touched"* · 1 deed at worldDay 37 |
| **Aelyn Kantoro** | world news only, no personal visit | 3 shared `worldState.news` entries |

⚠️ **So the codex, the deeds and the NPC sightings are CROSS-CONTAMINATED.** `codex.topics
.gen-object-object` in two different characters describes two different places. **Cevaine was "first met"
here and so was Pell, in places 90 walking days apart.**

## §1a — The engine recorded its own failure and nobody read it

```json
"midrow-wayhouse": { "parentId": "gen-object-object", "parentUnresolved": "valley" }
```

⛔ **`parentUnresolved` is the fallback admitting it fell back.** ⚠️ **That field is a ready-made gate: any
record carrying `parentUnresolved` is a place whose parent was guessed. Nothing was watching it.**

---

## §2 — PROPOSED MAPPING. ⚠️ My confidence differs per row; treat the last as unresolved.

| character | new id | name | confidence |
|---|---|---|---|
| Cellaceron | `gen-disputed-zone-far-side` | The Far Side | ⛔ **high** — the note names the crossing and the structure |
| Silas Weir | `gen-watershed-road` | The Watershed Road | ⛔ **high** — it is the stated parent of the Midrow Wayhouse, between the mill gate and the ridge |
| Splarf | `gen-the-sealed-veil` | The Sealed Veil | ⚠️ **medium** — may simply be `the_thinning` itself; **Erik's call whether the veil is a place or a feature of one** |
| `worldState.news` ×3 | — | — | ⚠️ **shared across characters; map per-character, not globally** |

⛔ **Do not merge them into one id to "clean it up."** That would be the collision made permanent.

---

## §3 — WHAT I NEED FROM CCODE

1. **A migration, staged not applied**: emit `po/staged_content/objobj_repair.json` listing every one of
   the 35 references with its file, JSON path, current value and proposed replacement. ⚠️ **I want to read
   35 lines before anyone writes to a save.**
2. **Per-character mapping.** ⛔ **The same string means a different place in different files.** A global
   find-and-replace is the one thing that must not happen here.
3. **A gate on `parentUnresolved`**: report any place record carrying it. **It is currently 1 and that one
   is this bug** — so it ships with its red already observed.
4. ⚠️ **Confirm the id-stringification fix covers `subPlaces` too.** The wayhouse got a `parentId` of
   `gen-object-object`, which means the corruption propagated one level down.

---

## §4 — AFTER THE REPAIR

These four become real content under SNG-396: placed, parented from the fiction, `worldPos` inherited
from parent. ⛔ **The Watershed Road in particular is load-bearing** — it carries a relay chain *"south to
the mill gate and north toward the ridge"*, which is **Precursor infrastructure a player found in play**
and belongs with the Made Gate in the same canon pass.

⚠️ **And I want the deed record preserved through the migration.** Six of Cellaceron's deeds are attached
to this id at worldDay 32; deeds drive reputation and spread. **A repair that drops them silently costs a
player their history.**
