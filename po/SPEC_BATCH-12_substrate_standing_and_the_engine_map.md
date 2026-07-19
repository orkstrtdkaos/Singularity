# BATCH-12 — Substrate geography, standing, teaching, and the engine map

**Author:** Aevi (PO) · 2026-07-18 · Erik-directed · **for CCode ROUND 2**

Five specs. §5 is the one that makes the other four safe to build, and it is the reason this is a
batch rather than four tickets.

---

# §0 — State of the world, measured at HEAD

Every claim below was read from code, not inferred.

| system | built | actually reachable |
|---|---|---|
| `standingWithPeople` (per-tradition standing) | reputation.js:47, banded, displayed at app.js:5104 | **read path complete; the only WRITE is a structured-quest effect** |
| origin/homeland standing | — | **does not exist.** No seeding anywhere |
| company liaison | `liaisonFactions`, `liaisonMultiplierFor` | **multiplies quest-awarded standing only.** A teacher in your party generates nothing on their own |
| teacher gate | `markTeacher` → `character.teachers[tid]`, `trainerFor` → progression.js:439 | gates unlocks. **Never teaches anything** |
| per-location substrate | `substrate.js:95` reads `location.substrateDensity` FIRST | **zero locations carry it** |
| item ↔ substrate | — | **does not exist**. `bonusTags` exists and is the right vehicle |

**Erik's screenshot is explained:** 46 world-effect, 14 places called into being, 2 now canon — and
*"not yet known anywhere,"* because `peopleDisposition` is only ever written by a structured quest
resolving with a `people` delta, and he has not resolved one. The display is correct. The world has
simply never told it anything.

---

# §1 — SUBSTRATE GEOGRAPHY (three tiers, and it POOLS)

## 1a. New physics: substrate pools where the Transition never took

Erik's directive, and it is a genuine addition to `the_substrate.json`, not a re-statement:

> **The nanite substrate varies by geography and TENDS TO POOL in places that never made the
> transition.**

This gives density a *cause* instead of a table. Density is not scattered — it **drains toward
untransitioned ground and collects there.** Consequences the fiction already half-states:

- The Quickwood is thin (0.12) **because the Rootkin completed the Transition** — the lattice left.
  `whyTheQuickwoodIsEMPTY` in canon already says this; pooling explains where it *went*.
- The Gearlands and Deep Works are dense (0.98) because the machinery never stopped running.
- Pooling implies **local anomalies are normal**: a sealed vault, a drowned district, a shrine nobody
  decommissioned will hold substrate above its surroundings *even in thin country*. That is the
  mechanic that makes exploration mean something.

## 1b. Three tiers, resolved by fallback (extends the existing chain)

```
site.substrateDensity          ← a shrine, a vault, an embassy, a room
  ↳ location.substrateDensity  ← a Seraph city as a local bastion
     ↳ region density          ← the existing 25-value table
```

`substrate.js:locationDensity` already does the last two. **Add the site tier above it and keep the
same "first defined wins" shape.** Erik's own examples, authorable on day one:

- a **Seraphic city** in ordinary country → location bastion, +0.2 over its region
- an **Ent embassy** inside a dense city → site *suppression*, well below its host
- a **shrine** → either direction, and which one is a fact worth discovering

## 1c. Region borders are currently a CLIFF — fix the structure, not the numbers

Measured: `the_quickwood_eaves` → `ent_deepwood` is **0.12 → 0.90 in one move.** Mean cross-region
step 0.287. Under AMENDMENT_1's band model both directions hurt, so this is a mechanical cliff with
no narrative warning.

**Coordinate interpolation was tested and REJECTED** (full working in
`po/PROPOSAL_substrate_border_blend.md`): inverse-distance over region centroids drags `the_blaze`
from 0.86 to 0.34 and `disputed_zone_fringe` from 0.40 to 0.90. It smears interiors and destroys
regional identity. Two causes — map coordinates are placed for legibility not distance (proof:
`ent_deepwood` and `the_lampless_market` share the exact point `(40,300)`), and euclidean nearness
is not travel adjacency.

**Use the connection graph, validate with coordinates.**
`d_loc = d_region + α·(mean(d of cross-region neighbours) − d_region)`, α a single named constant.
Interiors untouched by construction: 60 of 95 unchanged, 35 gain an override, worst cliff 0.78→0.35,
mean 0.287→0.170. The 35 it touches are the locations already tagged `border`/`liminal` — the tag
and the number stop disagreeing.

Coordinates get a real job: **a CI check that two locations which blend into each other are
plausibly near on the map.** Validation, not derivation.

## 1d. Schema + generation — the part that stops this decaying

**Erik's requirement: any NEW location receives its numbers on generation.** Otherwise this is true
today and false in a month.

- `substrateDensity` becomes an **optional but schema-known** field on location, and on the new site tier.
- `generate.js` / `backfill.js` must **compute and stamp** it for every generated place, from region +
  connections + any authored modifier. A generated location with no density is a CI failure, not a
  silent fallback.
- `content_ci` gains: every location resolves a density; no site exceeds `[0,1]`; every override has
  a one-line authored `substrateReason` so the number is never mysterious.

## 1e. It must be VISIBLE (SNG-090 ROUND 2 §54, still unbuilt)

That review called a silent success-chance penalty **"the cruellest possible bug."** Non-optional:
a **receipt line** (*"the lattice is thin here — your craft runs at a fraction"* / *"dense and hostile
to your green craft"*), a **GM context line** so narration matches mechanics, and the **map overlay**
— substrate beside danger, *"two difficulty maps, both personal."*

---

# §2 — ITEMS THAT SUPPRESS OR GATHER SUBSTRATE

## 2a. Schema

Items already carry `bonusTags` (evolution.js stamps them; `itemUpdates` evolves them). That is the
right vehicle — **do not invent a parallel system.** Add:

```json
"substrate": { "mode": "gather" | "suppress" | "store",
               "magnitude": 0.15,
               "radius": "self" | "party" | "site",
               "reason": "one line: why this object does this" }
```

and a matching **readable tag** in `bonusTags` — `substrate-gathering`, `substrate-suppressing`,
`lattice-warded` — so the GM *and the player* can see the effect without opening a stat block. Same
principle as player attribute tags, which is exactly what Erik asked for.

## 2b. Composition with the band model

`carried` already exists in canon and is correctly two-sided: *"it helps whoever is below their band
and HARMS whoever is above it."* Items compose into that same term — **never a separate multiplier**,
or we double-count against §1.

The design consequence is good: **a suppressor is a weapon.** Carrying an Ent-embassy ward into the
Gearlands protects a Rootkin and cripples an Enginewright. That is a real tactical object and it
falls out of the existing physics rather than being bolted on.

---

# §3 — STANDING: the system Erik can see is empty

## 3a. It belongs on the base character schema — PCs and NPCs alike

Erik: *"Every character and NPC (basic character schema) needs to track standing with each tradition
and any factions met."* Settlements already work (*"revered in Millbrook"*). Traditions do not.

`peopleDisposition` moves to the shared character shape so an NPC has one too. That is what makes
*"the Ashwardens regard you as kin and Marrow does not"* expressible.

## 3b. Seed it at creation — four sources, decreasing

Currently **nothing** seeds standing. A character who is Rootkin-born starts unknown to the Rootkin.

- **primary domain / homeland** — starts at `known`, the largest seed
- **secondary (kin domains)** — a real bonus
- **tertiary** — a bump
- **antipode of the primary** — optionally slightly negative; the great circle already defines it

## 3c. Passive accrual from the company — Erik's Calvar case

> *"Calvar has been in my party and hasn't taught me anything… he should be adding to my standing
> with the Radiants slowly over time just by being in my party — and sometimes more quickly if we
> are focusing on it."*

Today `liaisonFactions` only **multiplies** a quest-awarded delta. With no such quest, a teacher in
the party generates exactly zero. Add:

- **passive drip** per in-game period per company member with a tradition, small and uncapped-slow
- **focused gain** when the session's work is actually with that people — travel in their country,
  work at their behest, use of their craft
- **teacher bonus** on top: a bound teacher (`character.teachers[tid].willing`) drips faster

Erik currently holds a Radiant teacher (Calvar), a bound Ashwarden teacher, and Marrow. He should be
climbing with both the Radiants and the Pale March right now, and is at zero.

## 3d. Narrative and quest deltas

Structured-quest `people` effects already work — keep them. Add a GM verb for **narrative** standing
so an act that plainly helps or offends a people registers without a quest:

```json
"standingOps": [{ "people": "traditionId", "delta": ±1..±3, "why": "what was done" }]
```

Same discipline as SNG-162: **the model reports, the engine adjudicates and clamps.** Bands are
authored (`kin` 20 / `trusted` 10 / `known` 4 / `neutral` 0 / `wary` −4 / `estranged`), deltas stay
small, and a single act cannot jump a band.

## 3e. Factions, not just traditions

Erik said *"and any factions met in the world."* Traditions are one kind of standing-holder;
settlements are another; a Council, an Accord signatory, a company are others. **One shape** —
`{holderId, kind, score, band}` — so `standingWith` and `standingWithPeople` converge instead of
diverging further.

---

# §4 — TEACHERS MUST TEACH

`markTeacher` sets a flag and `trainerFor` gates an unlock. Nothing hands over a skill.

- A willing teacher **offers** abilities of their tradition the character can currently take — surfaced
  in the fiction by the GM, not buried in a panel (the SNG-162 lesson, applied again).
- A teacher **makes braids legible**: Erik's *"my teacher should make braids more obvious."* A teacher
  of tradition T should name available combinations involving T that the character can nearly reach.
- Teaching **costs the teacher's time** and should read as a relationship, not a shop.
- Teaching **accrues standing** with that people (§3c) — being taught is itself a bond.

**Erik's note that rank-3 mastery "works beautifully"** is the reason this matters: the ladder is
good, and nothing currently walks a player onto it except their own reading of a panel.

---

# §5 — THE ENGINE MAP (the meta-deliverable)

> *"We need to make sure we know what every Engine is and what it is connected to for what purposes.
> That way we get the full use of what we've made and any update impacts are understood before we
> even begin."*

CCode's reachability audit answered **"can this be reached?"** for 553 exports. This asks the two
questions after it: **"what is it FOR?"** and **"what breaks if I change it?"**

## 5a. Deliverable: `ENGINE_MAP.md`, generated, one row per module

| column | meaning |
|---|---|
| module | `engine/substrate.js` |
| purpose | one authored sentence — the only hand-written column |
| exports | count, and the public surface |
| depends on | modules it imports |
| depended on by | modules + app.js call sites |
| content it reads | `the_substrate.json`, `location.substrateDensity` … |
| GM verbs it serves | `unlockSubstrate` … |
| player-visible surface | receipt line, map overlay, or **NONE** |
| blast radius | count of downstream modules + content files |

**The `purpose` column is authored once and then guarded** — a module whose purpose nobody can state
in one sentence is a design smell, and that is a finding worth having.

**`player-visible surface: NONE` is the flag that matters.** It is how eight capabilities got built,
tested, and never reached — and it is a *different* question from reachability. `skill_battle` was
reachable-in-principle and invisible-in-practice for months.

## 5b. Make it a gate, not a document

A generated map rots. Per CCode's own §5 recommendation and the three guards already shipped:

- **new module ⇒ must declare a purpose line** or CI fails
- **new engine module with no content dependency AND no player-visible surface** ⇒ warn loudly
- **blast radius surfaces in the spec template**: any spec touching a module states its downstream
  count, so impact is known *before* work starts — which is exactly what Erik asked for

## 5c. Why this batch needs it first

§1 changes `substrate.js`, read by progression and resolution. §3 changes the character schema, read
by nearly everything. **Neither should start until the blast radius is written down.** That is the
whole argument for doing §5 first and it is Erik's argument, not mine.

---

# §6 — Sequencing (proposed; CCode to challenge)

1. **§5 ENGINE_MAP** — first, because it prices everything else.
2. **§3a–3c standing seeding + company accrual** — highest play value per unit work; Erik's screenshot
   is empty *today*, and the read path is already built.
3. **§4 teachers teach** — small once §3 exists, and directly answers a live complaint.
4. **§1b–1d substrate tiers + schema + generation** — the largest, and the one that most needs §5.
5. **§2 items** — depends on §1 composing correctly.
6. **§1e + §3 visibility** — receipts and overlay. **Not last in importance**; a hidden modifier is
   worse than no modifier, so this ships WITH each piece rather than after all of them.

# §7 — Open questions for CCode ROUND 2

1. §1c: is α as a single named constant acceptable given the SNG-078 tuning blocker, or does the
   cliff-fix wait? My read: the cliff is structural and α is the only eyeballed number, so it is the
   cheapest possible thing to retune later. Erik holds the blocker.
2. §3a: moving `peopleDisposition` onto the shared character shape — migration cost for existing
   saves? Erik and Brayden both have live characters.
3. §3c: what is the right clock for passive drip — per session, per in-game day, per scene? I do not
   have a strong view and the wrong choice is either invisible or runaway.
4. §5a: can `depended on by` and `blast radius` be generated reliably from imports alone, or does
   dynamic dispatch in app.js defeat it? If it is unreliable, say so — a blast radius nobody trusts is
   worse than none.
5. Does anything here collide with the `applyTurn` throw still outstanding?
