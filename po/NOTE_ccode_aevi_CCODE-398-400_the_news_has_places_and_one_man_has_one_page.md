# CCODE-398 → 400 — the news has places, a stamper stopped lying about drift, and one man has one page

From: CCode (engine) · To: Aevi (PO) · 2026-09-17 · v2.0.60 → **v2.0.62**

Three ships, and two of them touch things you author. The parts that are yours to decide are marked **⬜ YOURS**.

---

## 1 · CCODE-398 — every kind of news carries its place

Erik asked for this alongside CCODE-367: *"we might want a revamp pass on the world news soon."*

**Measured first**, by driving both news passes headlessly over the 16 saves on this device:

| pass | items | carried a place | the reader could speak to |
|---|---|---|---|
| `runWorldTick` | 94 | **0** | 0 |
| `advanceGeneratedOffscreen` | 147 | 82 | 70 |
| **after the pass** | 249 | **173** | **116** |

The place was there to be had every time. The deed-spread model **computes** the community word reached, printed it into
the sentence — *"As far as cairnhold: …"* — and threw the fact away.

**What changed.** The writers carry what they know (the deed hop its community and region; the vacancy murmurs and
ambient beats the figure and arc they name; a cross-character line the ledger's own place), and `stampNews` derives the
rest from the record a line already names, through one shared bag at all seven stamping sites.

### ⬜ YOURS — an arc has no place of its own

Measured: **all six greater arcs carry no region, no location, and no place-bearing field of any kind.** The branch I
inherited read `arc.regions`, which nothing has — it was dead the day it shipped.

What they *do* carry is `hingeNpcs`, and 19 of those 20 resolve to a real home, so a line about an arc is now placed at
**the hinge person nearest the player** — the arc crosses "all Reaches", so the useful truth is the hinge they would
feel it through. It works, but it is a derivation standing in for a fact.

- If you would rather an arc state its own ground, author `regions: [...]` on the greater arcs and the placement will
  prefer it (a writer's own place always beats a derivation).
- `aevi_the_watcher` is the one hinge NPC with no `homeLocation`. Deliberate, or an omission?

### ⬜ YOURS — an id is not a place until the content bag agrees

8 of the roster's 84 `homeLocation` values name locations that **do not exist** — `millbrook_south_lane`,
`low_lamp_inn_valley` — and two figures carry a *location* id in a `region` field. The engine now validates every
derived id against the bag and places nothing rather than writing an id the reader cannot resolve. The 8 bad homes are
grown records pointing at rooms nobody authored; if any of those names ought to *become* places, that is yours.

### One thing to know if you add a news writer

`newsNearness` reads **`locationId`** for a measured distance. A `communityId` or `regionId` now also counts, but as a
coarse tier that claims **no distance** — because `valley.millbrook` holds Archive Hollow nine days from the square, and
that is the exact bug CCODE-367's own comment says it fixed. So: carry a `locationId` where you know one, and the chip
will say *"near · 1.6 days"*; carry a community or region and it will say *"your community"* / *"your region"* and
nothing more.

---

## 2 · CCODE-399b — a stamper's `--check` was failing on the line endings git chose

This one bit me while pushing, and it can bite you: **`sizes_inject --check` and `skills_inject --check` reported drift
on a table whose every number was right.** They compared whole files with `===` while writing LF into a doc git checks
out as CRLF on Windows — so the check went red the moment somebody else committed the file (the rebase re-checks it out)
and never in CI, whose checkout is LF. The diagnostic underneath printed no drifted row, because there was none.

Both now compare content and preserve the file's own endings. If you ever see one of these claim drift and list nothing,
that was this.

### ⬜ YOURS — `docs/SKILLS.md` is stale

`skills_inject --check` has been saying so since before this branch: *14 domains · 24 poles · 1 lineage pending R33 ·
432 crafts placed · **9 crafts carry no tradition and are not listed***. I did not regenerate it — it is your doc, and
the nine untraditioned crafts look like a content question rather than a stamping one.

---

## 3 · CCODE-400 — a first name the context settles, and one man one page

Erik: *"When the GM narrates first name only, but the context tells you who it is fully, there should still be an
underline."*

**Measured:** 1,184 people sit in the click index across the saves and **1,160 are known by a multi-word name** — so a
narrator writing *Halvex* or *Vessin* writes a name the index does not hold. 334 now gain their first name.

A link is a claim that a word **is** somebody, so three classes of first word are refused — and the measurement found
all three, rather than my guessing at them:

- an **honorific** is stepped over: *Sister Alder* and *Overseer Grael* link as **Alder** and **Grael**;
- a name **opening with an article** is an epithet with no name inside it: *the Starless One* offers nothing, and
  *Seeker of the Lost Chord* has no given name either;
- a **lowercase** word is not a name: *Unknown (east bank traveler)* would have handed a link to the word *east*.

People only — a place is not called by its first word (*Harmonic Heights — Lower Terrace* is not *Harmonic*), and
neither is a codex topic (*Ring-Form Residue at Eastern Intake*).

### ⬜ YOURS — the naming shape decides whether a first name can ever link

Your `Name, Who Did The Thing` figures work perfectly (*Neth*, *Maren*, *Halcyon*, *Rethe* all link). The `The X One`
form never will, by design. That is a choice about how a narrator can refer to somebody, so it is worth knowing you are
making it when you name them.

### Halvex was three records

A `mystery` page labelled "Halvex" with **ten** facts anchored to nothing; `halvex_coil` "Halvex Coil, the Rewriter" in
the content pool — the legend; and `churn-revel-orchestrator` "Halvex Coil" in the registry — the man Loki has met ten
times, with **four**. Most of what he knew sat on the page that could not point at him.

The chain, and every link of it was already here: `resolveTopic` never looked an entity up for a `mystery`, so no
`entityId` was set; `kindFromEntity` needs one, so the kind stayed `mystery`; and `compatibleKinds` then made that — *as
its own note says* — a permanent barrier to tidying. `namesMatch("Halvex", "Halvex Coil")` was always true.

The standing load-time sweep now binds a page whose label **is** somebody's name or their given name, your kind repair
corrects `mystery` → `person`, and the merger folds the pair. On Loki's save: **one page, 14 facts**, keyed to the man,
carrying both names. Idempotent, and no reconcile step needed.

It binds only on an exact name, never `namesMatch`'s containment — a label is usually a phrase, and *"The Long Bough"*
would have bound itself to *"Vessin of the Long Bough"*, filing a mystery about a place under a person.

### And the two Vessins are two people

Worth stating plainly because your step 63 raised it and left it open: `vessin-of-the-long-bough` (a courier-scout the
world generated, never met) and `traveler-woman` "Vessin Tallow-bark" (met fourteen times, Loki's partner) share a given
name, a home region, and nothing else. **They are not merged, and nothing here merges them.** The first name resolves to
the one he knows, because acquaintance is what his own sentences mean by *Vessin*; where a player has met both people
sharing a first name, there is no link at all.

---

## What I would value your ruling on

1. Should a greater arc carry its own `regions`, or is the nearest-hinge derivation the right answer for a thing that
   crosses every Reach?
2. The 8 `homeLocation` values naming rooms nobody authored — cruft, or places that should exist?
3. `aevi_the_watcher` with no home: deliberate?
4. `docs/SKILLS.md` and its 9 untraditioned crafts.

— CCode
