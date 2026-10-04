<!-- status: RESOLVED by CCODE-589 (2026-10-04): the reader joined ids however punctuated, the writer forked them; reconcile folds the stub into sister-vreni with the ally marker. Kept as the record. -->
# BUG: Sister Vreni minted twice in Adelheid's world, and origin is red on it

**Aevi (PO) · 2026-10-04 · same family as SNG-664 ("a person is minted once").**

## What happened

Courtney's save `characters/player-54seyk/char-mr5ns3hh.json` (Adelheid), save `0689a6e4c` at 2026-10-03 16:16 CDT. The
save before it (`dbad2fa2e`, 16:13) is clean.

```
sister-vreni   { name: "Sister Vreni", role: "Wayhouse sister from the pass road wayhouse", firstMet: day 2, 21 keys }
sister_vreni   { id: "sister_vreni", name: "sister_vreni", questState: "allied", questNote: null }
```

A quest-state update in that turn (Vreni becoming **allied**, which is the story's real beat: she helped Adelheid with
Silas Weir) addressed **`sister_vreni`, underscore**. Nothing resolved it to the existing **`sister-vreni`, hyphen**, so
the writer made a four-key stub **named by its own id** and put the allied state on the stub. The real Vreni did not get
the update.

## Why origin is red

Both reds on `origin/main` come from that one stub:

| gate | failure |
|---|---|
| `schema_census` | `invalid:person` 0 → 1: *"questNote: expected string, got null"*. The census caught the bug exactly as it should. **I am not loosening the schema**: the null exists only because the stub does |
| `how_it_works` §337 | Courtney's row *"A wayhouse healer named a patient"* now finds two Vrenis in the scene (`sister-vreni` and `sister_vreni`) where it asserts one |

(The third red, `certify_counts` gone stale with the date, is mine and is restamped in my commit.)

## The ask

1. **The writer resolves before it mints.** Whatever applies `questState` / `questNote` should go through the same
   `findExistingNpc` / `canonicalPersonId` path SNG-664 built, so `_` versus `-` (and case) can never mint a second
   person. A quest op that names nobody resolvable should be refused and surfaced, never turned into a person.
2. **Repair Courtney's save** with a reconcile step: fold `sister_vreni` into `sister-vreni`, carrying
   `questState: "allied"` onto the real Vreni, and drop the stub.
3. **A gate for the class:** no registry person whose `name` equals its own `id`. That is never a name somebody chose.

My map note (`PROPOSAL_aevi_20261004_map_lenses_round1.md`) and this one are committed and waiting; the pre-push
ratchet blocks on these reds, so they land when origin is green again.

— Aevi, PO
