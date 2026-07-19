# ROUND 2 — BATCH-12 · SNG-166 · 167 · 168 · 169 · 170

| | |
|---|---|
| **Author** | CCode · 2026-07-19 |
| **Reviewed at** | HEAD `5e5c7a3c`, working tree clean |
| **Status** | review only — nothing built |
| **Method** | every load-bearing claim re-measured. Where a number differs it is stated with the reason. Per your correction, every proposed BUILD was first searched for as an EXISTING capability. |

---

## §0 · The headline: the GM has been lore-blind, and it is one line

`engine/state.js:130`

```js
const name = path.split("/").pop().replace(".md", "");
```

It strips **only `.md`**. The manifest lists **24 `.json` lore files and 3 `.md`**, so 24 of 27 are keyed as `the_twelve_reaches.json` while every location's `loreRefs` asks for `the_twelve_reaches`. `loreForLocation` does a plain `loreMap[ref]` and `.filter(Boolean)` — so the miss is **silent**.

| | today | after a correct extension strip |
|---|---|---|
| distinct refs that resolve | **3 of 14** | **9 of 14** |
| locations delivering **zero** lore to the GM | **84 of 95** | **0 of 95** |

`the_twelve_reaches` is referenced by **80 of 95 locations** and has never once reached the model. Neither has `traditions` (69).

**This reframes SNG-167 §1.** The spec reads the symptom correctly — the GM could not answer about the Crossroads — and then diagnoses an *authoring* gap (opt-in `loreRefs`, missing region files). The actual first-order cause is a loader bug. §1's authoring work is still worth doing, but it is second-order, and shipping it without this fix would have improved nothing.

**Two things the naive one-line fix does not handle**, both worth building in the same pass:

1. **5 refs are dangling regardless of extension** — no such file exists under any name: `traditions` (69 locations), `reach_body_mind` (3), `reach_violence_peace` (3), `domain_detail_and_connections` (2), `precursor_glimpse` (2). `traditions` is the big one: it lives at `content/packs/core/rules/traditions.json` and loads into `CONTENT.traditions`, a **different object** that is never passed to `loreForLocation`.
2. **`fetchText` on a `.json` file hands the model raw JSON.** After the fix the mean location injects **~11,500 chars (~2,900 tokens)** of lore, worst case `dw_the_burnscar` at **~23,600 chars (~5,900 tokens)**. It rides the cached world tier so the marginal per-turn cost is small, but raw JSON is a poor prompt payload. **Fix the key AND render JSON lore to prose** — otherwise you trade a silent miss for a silent bloat.

**Recommend this as the next ship, ahead of everything else in these six specs.** It is small, it is measured, and it is upstream of SNG-167 §1, SNG-166's world-knowledge, and every "the GM doesn't seem to know…" report.

---

## §1 · Substrate — the math, per §9b

You handed me the math. Here is the model, tested against all six invariants before any engine edit.

### The distance basis — the proposal's own two halves, reconciled

REV3's shipped model used `exp(−distance / radius)` on **coordinates**. §3 of the same document rejects coordinates as a driver, *with evidence I re-confirmed*: `ent_deepwood` and `the_lampless_market` still share exactly `(40,300)`, sit in **different regions**, and are **not connected** — Euclidean distance 0 means one's pool would bleed fully into the other.

**The synthesis: shortest path over CONNECTIONS, each edge weighted by coordinate distance.** §4 was right that connections are the correct topology; coordinates are still fine as an edge *weight*. This keeps all 26 authored `radius` values meaningful in the units they were written in, while travel adjacency decides what reaches what.

The graph supports it cleanly — I checked before relying on it: **95 locations, 239 edge refs, 0 dangling, 0 asymmetric, 0 isolated, exactly 1 connected component.** Median edge 85 coord units, so `radius: 160` gives ≈0.59 falloff per median hop.

```
delta_s(t) = (strength_s − ambient[region_of_s]) · exp(−pathDist(s,t) / radius_s)
raw(t)     = ambient[region_of_t] + max(pool deltas) − max(sink deltas)
             compact support: nothing past radius × 2.5
then: per-region renormalisation applied ONLY to locations a source actually touched
```

### Why renormalise, and why only the touched

Invariants 2 and 3 pull against each other. Shifting a whole region restores its mean (2) but moves places no source reaches, so nothing sits at pure ambient (3). Correcting **only the touched set** satisfies both: untouched ground stays exactly ambient, and the places that rose or fell carry the whole correction.

This is also what makes the untuned falloff safe to ship against `tuningNote`: **the scales change the shape *within* a region and can no longer move the regional calibration at all.**

### Invariant results

| # | invariant | result |
|---|---|---|
| 1 | pools rise, sinks fall | **25 of 26** — one violation, and it is content (below) |
| 2 | regional calibration holds | **drift 0.0000, worst 0.0000** — exact, by construction *(REV3's withdrawn run: 0.059)* |
| 3 | distance matters and ends | **10 locations sit at exact ambient**; 69 of 95 carry real local variation |
| 4 | composes with carried | via existing `effectiveDensity` — no second system *(see §2)* |
| 5 | never silent | **already ~3/4 built** *(see §2)* |
| 6 | every location resolves | **95 of 95**; runtime-minted places fall back to region ambient via the existing `locationDensity` |

**Cliffs, measured across connected cross-region pairs:** mean `0.287 → 0.286`, worst `0.780 → 0.791`. Essentially neutral, where REV3 honestly reported `0.287 → 0.312` getting worse. Renormalisation is the reason. My baseline of 0.287 reproduces yours exactly, which is a useful cross-check: **your cliff metric was sound even though the per-location numbers were not.**

### Two content bugs the model exposed

1. **`the_service_ways` is a `pool` with `strength: 0.96` in a region whose ambient is `0.98`.** By the model's own definition (`strength` = density at the source) a pool below ambient **is a sink**. This is the surviving residue of the second error you banked.
2. **`the_gearlands` ambient is `0.98`, leaving 0.02 of headroom.** That is why `the_great_engine` (a pool at `strength: 1.0`) is the single invariant-1 violation — a saturated region cannot express a pool. Either the ambient or the strength wants adjusting; **your call, it is content.**

Both are cheap CI checks: *a pool's strength must exceed its region's ambient; a sink's must fall below it.* That check would have caught your banked error automatically.

### Where it goes

`locations` is assembled in one loop at `engine/state.js:99-103`. A precompute pass right after it writes `substrateDensity` onto each in-memory location — **the hook `locationDensity` already reads first**. Zero change to `locationDensity`, zero change to any call site, authored files untouched. That is the simplest thing that satisfies the invariants.

---

## §2 · The already-exists audit

Your correction was the right instinct, and it generalises further than the one case. **Six of these specs' proposed builds already exist**, in whole or in part.

| spec says | reality |
|---|---|
| SNG-166 §1.2: a `tradition → home region` map **"does not exist"**; §5 Q1 asks whether to author one | **All 24 traditions already carry a `region` field** in `content/packs/core/rules/traditions.json` — including `ashwarden → the_palelands`, the spec's own worked example. Loaded as `CONTENT.traditionIndex`. Authored, shipped, and unused by generation. |
| SNG-168 §1c: place cards with travel, as a build | **Built** — `app.js:3954-3991`: name, `isKnown` gating, danger chip, known people, image, notes, sub-places, waygate routing, the travel button (`app.js:3980` → `travelTo` at `:3707`), **and** the honest "not directly reachable" line at `:3982`. Only `encounterSeeds` is missing from it. |
| SNG-169 §2c: items in the sidebar already use the shared popup | **Half wrong, in the spec's favour.** `data-entity="item:` appears **nowhere**. But `entityHover`'s item branch (`app.js:94`) and `itemDetail` (`engine/entityDetail.js:41-50`) are **fully written and unreached** — a **12th** built-never-reached, one HTML attribute from live. |
| SNG-169 §2b: tapping the thumb opens a lightbox | **Built** — `openLightbox` `app.js:359`, delegated on `img[data-lightbox]` at `:396`, Esc/backdrop/arrows and CSS all present. One attribute. |
| SNG-169 §3a: generate an NPC portrait and persist it | **Built** — `ensureBondPortraits` (`app.js:1440-1453`) writes `n.image`; mint-time path `app.js:1576` → `generate.js:313`. The real gap is narrower than stated: **no render site anywhere displays an NPC image.** |
| BATCH-12 §2: item↔substrate "does not exist" | **`carriedSubstrate` is built and running** (`substrate.js:77`), called every ability action at `app.js:3121`. As your ALERT already says. |
| BATCH-12 §1e: visibility "still unbuilt" | **Receipt, GM line and map chip all exist** — roll breakdown `app.js:6333`, hard-gate aside `:3179`, `pendingSubstrateNote` → `substrateDetail` (`gm_registry.js:152`), lattice chip beside the danger chip `:3966`. Only the **whole-map density overlay** and **naming a carried cause** are missing. |
| BATCH-12 §1d: `content_ci` *gains* a density check | **Already built** — `tests/content_ci.mjs:150-165`. |

**The one that matters most for BATCH-12 §2:** `carriedSubstrate` is running against **zero content**. `substrateCharge` appears on **0 of 30 items**; `substrateAura` on **0 of 9 companions** — including **the Waystaff and Aevi, both named in the function's own docstring as the exemplars.** The mechanism has been complete and inert. That is a content pass, not a build.

**And the blocker for suppressors is exactly one clamp:** `carriedSubstrate` guards `c > 0` / `a > 0` and floors with `Math.max(0, …)`, so a `substrateCharge: -0.15` ward is silently discarded twice over. Allowing negatives is a small, contained change — but it must land with a receipt that names the cause (invariant 5), because a ward that quietly halves your craft is precisely the "cruellest possible bug".

---

## §3 · Corrections to spec claims

Sorted by whether they change a decision.

**Changes a decision:**

- **SNG-167 §1a's conclusion is wrong.** *"80 of 95 reference `the_twelve_reaches`… those two files ARE the world model as far as the GM is concerned."* The counts are right; the GM sees **neither**. See §0.
- **SNG-166 §1: `generate.js:70` is mis-scoped.** The `|| "valley"` default is real and confirmed verbatim, but it sits inside **`stubEntity`** — the last-resort path for model output that could not be repaired, not the general generation path. Worth knowing before pricing the fix.
- **SNG-167 §1c.1's proposed `reach_<regionId>` rule matches zero of three** as authored: the files are `reach_riven_marches` / `reach_somatic` / `reach_unspooling`; the region ids are `riven_marches` / `somatic_reaches` / `the_unspooling`. The rule needs a mapping or a rename.
- **SNG-168 §1a: the wiring cannot simply be called on the other two tiers.** `wireSkillGraphViewport` dereferences `document.getElementById("gz-in").onclick` with no null guard (`app.js:4472-4474`), and only the region tier renders that control block. World and location tiers would throw.
- **SNG-167 §4: two live tasks have no `MODEL_MAP` entry** — `describe-build` (`gm.js:525`) and `gambit-extract` (`gm.js:539`) silently fall through to Sonnet. And `MIN_CACHE_TOKENS` differs per model (Haiku 4096 vs Sonnet 2048), so **moving `gm-narrate` to Haiku changes the prompt-cache tier layout, not just a model string.** That makes §4 a build, not purely a policy change.

**Worth recording, changes nothing:**

- SNG-167 §2: **43 files / 47 NPC records**, not 42. `wants` on 45 of 47 (not `want`); `hooks` on 6, not 1. `questSeeds` on **0** — confirmed.
- SNG-167 §1a: **27 lore files**, not 24. Orphans are exactly **18**, and every file the spec names is in that list.
- SNG-167 §2: `greater_arcs.json` is "unreferenced" only by `loreRefs`; it **is** loaded (`state.js:151`) and consumed (`worldtick.js:207`, `app.js:1538`, Library `app.js:5364`).
- SNG-167 §4: `chronicle-compress` is **also** already on Haiku — two tasks, not one. It also has **no call site**; it is dead.
- SNG-170 §2: **41 of 43 NPC files** carry `appearance` at HEAD (41 of 53 entities). The 12 bare entities are inside `legends.json` and `saehara_challengers.json`.
- SNG-170 §1b: SNG-164 added **16 defs, 14 of them duels**, not 15 duels. The 15th duel (`zone_raider_duel`) predates it and carries **no `lethal` field at all** — `false` by coercion, not by authoring.
- SNG-168: **every line number in the spec is 15–45 low** — it was measured against an earlier commit.
- SNG-166 §3 correction: **43 files / 47 records**, 40 distinct first tokens. Exactly one Mara — confirmed.

---

## §4 · Answers to the open questions

**SNG-167 §3a — does Coliseum standing ride `standingOps`?** It rides it *unchanged*, and more of the substrate exists than the spec credits: `coliseum_grid.json` (389 lines, 36 cells), **8 authored champion encounters**, `the_redline` as the §3c regional venue, and `engine/encounters.js` already resolving **yield** outcomes (`opponent_yielded` `:75`/`:108`, `yieldAt` on every champion). `engine/standing.js` shipped this morning. **The only missing edge is encounter-outcome → standing.**

Two obstacles to the conduct derivation you adopted:
1. **There is no harm-rung in encounters** — zero hits for `rung` in `encounters.js`. Conduct can be derived from outcome and yield today; harm-rung needs building first or dropping from the formula.
2. **Champion traditions are prose, not data.** All 8 name a people in `opponent.name` ("Kestrin of the Riven Marches") and **none carries a structured `traditionId`.** Standing-with-the-opponent's-people cannot be derived until that field exists — a small content pass.

Also worth knowing: a prestige-duel path already awards deeds band-scaled on **win and loss** (`app.js:6108-6117`), gated on `def._challengeBand`, which the coliseum encounters do not set. That is closer to §3a's "a clean loss earns more than a graceless win" than anything new.

**BATCH-12 §4 — teachers must teach.** Confirmed: `markTeacher` writes `{met, willing, npcId}` and **every** consumer is a gate, never a grant. No path calls `learnAbility` on account of a teacher. But three pieces of the answer already exist: `combinationsAvailableFor` (`skilltree.js:131`) already answers *"what does tradition T open for this character"*; `skillGraphModel` already computes `allowed/locked/reachable`; and `app.js:4653-4655` already builds a candidate list **from `Object.keys(character.teachers)`**. §4 is a projection over built machinery plus **one missing `teacherDetail` row in the GM registry** — teachers appear in none of the 47 rows.

**SNG-168 §1.3 — is the shared `graphView` leak real?** **Yes.** One module-level variable (`app.js:4428`), reset on explicit back/fit buttons but **not** on the two entry paths that matter — `sgBtn.onclick` (`:4742`) and `mapBtn.onclick` (`:6605`). Zoom the map, open the wheel, inherit the transform.

**SNG-169 §5.1 — are thumb and expanded the same URL?** **Yes** — `IMG_SIZES[kind]` is fixed per kind and the seed is derived from the id, so both requests are byte-identical and the browser cache serves the second. **§5.2 — does it persist?** **Yes**, `art.js:244` mutates the live character subtree.

**SNG-170 — the per-profile pattern to copy.** `plainness`/`bluntness` are plain unvalidated properties (`app.js:890-898`). `rating` is the only **validated** per-profile setting (`playerprofile.js:45-95`). A stakes dial that can raise lethality should follow `rating`'s validated shape, not `plainness`'s. Note **art mode is device state, not per-profile** — don't use it as the model.

---

## §5 · Recommended order

1. **The lore loader** (§0) — one line plus a JSON-to-prose renderer plus the 5 dangling refs. Upstream of everything; smallest thing with the largest effect in these six specs.
2. **Substrate field resolution** (§1) — the math is done and measured; it is a precompute pass at `state.js:103` and the two content bugs are yours.
3. **`substrateCharge` / `substrateAura` content** — the engine has been waiting on content, not the reverse. Start with the Waystaff and Aevi, which the docstring already promises.
4. **The one-attribute wins** — `data-entity="item:…"` and `data-lightbox` on the item thumb (SNG-169 §2b/§2c). Two attributes, two features, one of them a 12th built-never-reached.
5. **SNG-167 §3 Coliseum** — after a `traditionId` lands on the 8 champions.
6. **SNG-168 viewport** — needs the null-guard fix first; pinch and the world/location viewport groups are genuinely unbuilt.

---

## §6 · spec_boundaries

1. **The substrate falloff scales remain untuned** per `tuningNote`. Renormalisation makes them *safe* — they can no longer move regional calibration — but the within-region shape is still eyeballed. SNG-078's harness stands.
2. **`the_service_ways` and `the_gearlands` headroom** are content calls, not engineering. I have not touched them.
3. **The lore JSON-to-prose renderer** is a design choice I have not made — selecting sub-objects vs rendering whole. Flagging the ~2,900-token mean cost so it is chosen rather than inherited.
4. **Harm-rung** does not exist in encounters. §3a's conduct formula needs it built or dropped; I have not assumed which.

---

*— CCode. Nothing built. The one-line bug in §0 is the one I would read first.*
