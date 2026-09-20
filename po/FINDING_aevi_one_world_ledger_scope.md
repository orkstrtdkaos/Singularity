# FINDING — The one-world ledger is finished. Sister Vreni is below its bar.

**Aevi · 2026-09-20 · for CCode.** Erik: *"Loki moved to the wayhouse… the person I met isn't Sister Ven­ri. I was
hoping we had worked out that scene details get saved to the world state that every GM has access to. did we not
finish that one world ledger work?"*

⛑ **It is finished, it is live, and it works. It carries a specific list, and an ordinary named NPC is not on it.**

---

## ⛑ §1 — WHAT IS ACTUALLY SHARED (measured, not recalled)

| store | state |
|---|---|
| `world/canon/valley.json` | ⛑ **116 KB — 15 promoted entities + 6 variants, across TWO players**, with `looks` keyed by `lookKey` |
| `world/people/valley.json` | `people` **3 promoted legends** · `fates` **42** · ⚠️ `lives` **0** |
| `world/ledger/2026-07|08|09.json` | ⛑ **a live cross-player ledger, by month** |
| `world/travelers.json` | ⚑ every character and **where they are** — Adelheid at Millbrook since world-day 80 |
| `world/feed.json` · `arcs/` · `holds/` · `regions/` | all live, all written today |

`engine/fates.js:9` — *"ONE RECORD PER LEGEND… and ONE RULE that every client folds the same way."*
⚑ **The architecture Erik is asking about was built and it runs.**

---

## ⛔ §2 — AND SISTER VRENI IS IN NONE OF IT. ZERO HITS.

I grepped every file under `world/` for `vreni` and `venri`. **Not one match, in any store.**

⛑ **Because the shared layer carries LEGENDS, ARCS, FATES, CANON ENTITIES and WHERE PEOPLE ARE — it does not carry
ordinary named NPCs.** `world/people` holds Bram the Scarred, Ganna the Edgeholder, Sera Voight the Ashvow:
**promoted legends.** ⚠️ **Sister Vreni is a quest giver at a small house of healing. She never crossed the
promotion bar, so nothing about her — not her manner, not the patient, not even the spelling of her name — is
visible to any other instance.**

⛔ **So Loki's GM did the only thing available to it: with no record, it invented one.** ⚑ **That is not a GM fault
and not a missing feature. It is a THRESHOLD, and she is under it.**

⚠️ **The GM's own explanation to Erik understated what it has.** *"Each character runs in their own instance and I
only see the game-state I'm handed"* is true of the SHEET and wrong about the world: `sharedCanonLooks`,
`canonForViewer` and the fates fold are all handed to it. ⛑ **It has a shared world. It just had nothing in it
about her.**

---

## ⚑ §3 — WHAT I RECOMMEND

⛔ **A QUEST GIVER SHOULD AUTO-PROMOTE TO SHARED CANON.** A named NPC a player has had a **four-stage relationship**
with is exactly what "matters to the world" means, and it is a far better signal than legend-tier. ⛑ **Vreni,
Mara Wells, Keeper Ilma and Edvar at the mill are all in this class and all invisible.**

⬜ **Two more, cheap and separate:**

- ⚠️ **`lives` is 0 entries.** The publish-a-life path exists and nothing has ever used it. ⛑ **That is the natural
  home for "who this person is" as against "what became of them", and it is the field that would have carried
  Vreni.** **Is it unwired, or just unused?**
- ⛔ **`world/scenes/` last wrote 2026-09-07 — thirteen days ago — while `travelers.json` updated TODAY.**
  ⚠️ **Scene capture looks like it stopped.** Erik's complaint was *"the scene isn't the one that Courtney just
  played"* — **if scenes were still being written, that is exactly the store that would have answered it.**
  **I have not diagnosed this and it may be the whole of his question.**

⬜ **And the name:** content says `sister_vreni`; **Erik and Loki's GM both say "Venri".** ⚠️ **When nothing about
a person is shared, the spelling drifts too — a small symptom of the same gap, and a good canary once she is
promoted.**

---

## §4 — ⛑ CCODE-457b RE-RUN: A3 AND A6 CLEARED

I re-ran the acceptance against your rewrite. ⚠️ **I called the old API first and got nonsense — my error, the
shape changed correctly.** Properly:

| | |
|---|---|
| ⛑ **A3 PASSES** | `loadSources` → **44 sources, 44 named, 44 stated.** Archive Hollow present. **`The Axis Gate`, `strength 0.16`, `radius 0.09`, `kind: "crystal well"` derived from sign.** The probe can name the place again. |
| ⛑ **A6 PASSES** | `sampleWindow` is a method on the field; point-first evaluation, a window is many points |
| ⚑ **and you took the revision** | `TERRAIN_FEATURE_FLOOR_DEG = 0.25` is in the module as a constant — **the location tier cannot try to draw landform that is not there** |
| ⛑ | `PROBE_REACH = { waygate: 6, anchor: 9, place: 26 }` — exesa's reaches, kept |

⬜ **One gap left on A3, and it is small:** `state` reads `regions[regionId].state` through a WORD→letter map, but
**the only region-state data I can find is `terrain.fields.nanByRegion`, which is integers 0/1/2 across 39
regions.** With no word-form model supplied, **all 44 sources come back `c` and the authored 20·12·12 split is
lost** — the same information the bake drops. ⚠️ **Either the app supplies a word-form model I cannot see, or the
integer form needs mapping.**

⛔ **And I cannot answer that from production, because NOTHING CALLS `loadSources` OR `fieldDataFrom` YET** — the
only references are inside `field.js` itself. ⚑ **The module is built and unread. That is the seventh instance of
the family you have named six times this week, and I would rather flag it now than find it.**

— Aevi
