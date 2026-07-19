# SNG-171 — Arcs that name real things, and credit for what already happened

**Author:** Aevi (PO) · 2026-07-18 · Erik-directed from live play
**Form:** outcomes and invariants. The engineering is CCode's — and most of the engines exist.

---

# §1 — WHY "THE DOOR THAT CLOSED BEHIND" IS UNREADABLE

Erik: *"This quest is almost incomprehensible it's so vague… we need these quests to HAVE a concrete
ARC to follow with real narrative anchors and choices along the way that have IMPACTS."*

He is generous about the cause (*"I didn't give you anything to work from"*). The bio is not the cause.
Two structural facts are.

## 1a. A stage has nowhere to put a place, a person, or a thing

`engine/personalArc.js:sanitizePersonalArc` — a stage is:

```js
{ id: `s${i+1}`, objective: String(...).slice(0, 200) }
```

**Free prose and nothing else.** No `locationId`, no `npcId`, no item, no anchor of any kind. So
*"the thin place speaks in the grammar of his craft"* is not the model writing badly — **it cannot
name where, because there is no field for where.** An arc physically cannot reference the world it
is set in.

## 1b. Choosing a route does nothing

Same file:

```js
outcomes: Object.keys(routes).map(k => ({ id: k, name: titleize(k), effects: [] }))
```

**`effects: []` — empty by construction.** Erik's *"choices that have IMPACTS"* is not
under-tuned; it is unimplemented. Author / Unwrite / Read read as three flavours of the same nothing
because mechanically they are.

## 1c. Outcomes wanted

1. **Every stage names at least one real thing** — an existing location, a known NPC, a faction, or a
   concrete object — carried as a resolvable id, not only as prose. If a stage cannot be anchored, it
   is not ready to show the player.
2. **Anchors come from the world that exists.** The arc author should be handed real candidates —
   places this character knows, people they have met, their own items — and bind to them. Inventing
   a place that is not on the map is the failure.
3. **Every route outcome carries real effects.** `engine/quests.js` already applies structured effects
   including `{people, delta}` standing changes — **reuse that vocabulary.** A route that ends an arc
   must move something: standing, an item, a relationship, world state.
4. **Choices differ in consequence, not only in tone.** Author, Unwrite and Read should leave the
   character in measurably different positions.
5. **A thin bio yields a modest, concrete arc — never an abstract one.** Abstraction is the current
   failure mode; the correct response to sparse input is a *smaller* hook about *real* things.
6. **Stages surface in play.** An anchored stage can be raised when the player is at that place or
   with that person — which is what makes an arc feel like gravity instead of a panel.

---

# §2 — CREDIT FOR WHAT ALREADY HAPPENED

Erik: *"I met the ENT at the Crossing and introduced myself — we had a great connection moment and I
made a ward gift for it. That should have increased my standing… the opening screen says they don't
know me. You might need to read through every character's chronicle to provide appropriate credit
for standing, skill use, etc. I think we have an engine for this."*

**There is an engine, and Erik is pointing at the right one.**

## 2a. What exists

`engine/reconcile.js` — versioned migration steps gated by `entity.reconcileVersion`, so a save from
before a feature existed gains what it is owed on next login. Two precedents already do exactly this
shape: **v7 `personal-arc-backfill`** and **v8 `standing-seed-backfill`** (CCode, BATCH-12 §3b).

## 2b. Why v8 does not fix Erik's case

**v8 seeds standing from who a character IS** — `domains.primary` and kin. Erik's Ent bond is what he
**DID**. No step credits history, so a level-16 character with a real relationship, a gift given, and
a connection moment is still a stranger to that people.

## 2c. Outcomes wanted — a history-credit reconcile step

1. **A character's standing reflects their play, not only their origin.** After the step, someone who
   has befriended a people's members, done their work, and carried their craft is **known** to them.
2. **Credit is derived from what the save already records** — NPC relationships and bond types, deeds,
   items made and given, places lived in, codex facts. **Nothing is fabricated**: if the history does
   not evidence it, no credit.
3. **Idempotent, and it can only be run once per version** — v8's property, which is what makes reuse
   of the creation path safe. Re-running must never inflate.
4. **Conservative on ambiguity.** Where a bond's people is unclear, credit nothing and say nothing —
   a wrong attribution is worse than a missing one.
5. **Player-facing and legible.** Like v7 and v8, it should *tell* the player in-fiction what caught up
   with them, naming the people and roughly why.
6. **Same rule as live accrual.** Whatever SNG-167 §3 does going forward, this step is that rule run
   over history — one rule, two entry points, so a backfilled character and a freshly-played one
   cannot end up on different ladders.
7. **Skill and craft use too**, per Erik — the practice ledger already records use; anything else the
   save evidences and the current rules would have credited should be credited.

## 2d. ⚠️ A data question Erik's example exposes — needs a ruling, not a guess

**Which people does a bond with an Ent credit?** Erik expects **Rootkin**. The Ents are authored under
the **manifest-domain / ent** tradition — `rootbound_vaskar`, `walker_elder_thren`, `young_ent_lissome`
all sit at `domain.deepwood`, not with the Rootkin.

Both readings are defensible: the Ents are life-pole kin to the Rootkin, or they are their own people
on the great circle. **This must be authored data, not inferred at credit-time** — otherwise the
backfill will make a silent decision about world structure and bake it into every save at once.

The general form of the question: **every NPC needs an unambiguous people-affiliation for standing to
work at all.** That is a content gap in my lane once Erik rules.

---

# §3 — Acceptance

1. A newly generated personal arc names at least one real location or known person per stage.
2. Its route outcomes carry non-empty effects, and the routes differ in consequence.
3. After the reconcile step, Erik's character is **known** to the people he has actually worked with.
4. Re-running the step changes nothing.
5. No credit appears that the character's recorded history does not support.

# §4 — Questions for CCode ROUND 2

1. §1a — anchors on the stage record, or a parallel `anchors[]` so old arcs stay valid? I have no
   preference; the invariant is that a stage resolves to something real.
2. §2c — is the chronicle the right source, or are `deeds` + `npcs` + the practice ledger already
   richer and better-structured? Erik said "chronicle"; I suspect the structured records are the
   better read and the chronicle is the human-readable shadow of them.
3. §2c.3 — v8 is idempotent because it only writes empty slots. History-credit is additive, so it
   needs a different guarantee. Version-gating alone is probably enough; confirm.
4. Does anything else in the save deserve the same treatment while we are here — abilities earned,
   places known, legends met?
