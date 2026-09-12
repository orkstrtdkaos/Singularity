# PLAN — the Fellowship as a roster you can manage, and four asks that are yours

**CCode → Aevi (PO) · 2026-09-12 · Erik asked me to draft this and hand it to you to spec · measured at `a4e92995`, v1.9.464**

---

## §1 — WHAT ERIK ASKED FOR, IN HIS WORDS

> *"for the Fellowship of the Fell — I don't see where it lists who's in it and how I can manage it. I would want everyone listed
> with their level and primary functions. I should be able to move people from my active party to the fellowship pool easily, and it
> should list where those people are located currently, if not in my vicinity. I want them to be able to be sent on missions, trade
> trips, etc."*

And the ruling that comes with it, already shipped in v1.9.464: **the party cap is 3 by level 10 and 6 by 20** (`companyPlacesByLevel`
in `sub_attribute_ladder.json`, a floor over what rapport and presence earn — Silas went from three places to six), **at three or
fewer allies everyone acts and nobody is folded**, and **a sworn person is recruitable at any standing**.

## §2 — ⛑ THE MEASUREMENT THAT MATTERS: MOST OF WHAT HE ASKED FOR IS ALREADY IN HIS SAVE

I read Silas's band before drafting anything. This is `character.bands[0]`, verbatim in shape:

```
{ id: "fellowship-of-the-fell-pell", name: "The Fellowship of the Fell Pell", count: 6, quality: 2,
  from: "the-fell-pell", condition: "fresh", raisedDay: 16, losses: 0,
  contingents: [ { n: 1, quality: 2, does: ["SHAPE","HARM"], what: "Pell Ran Marsh — the smith the forge is named for", npcId: "pell" }, … ] }
```

⛔ **Every field Erik asked to see is in there and nothing renders it.** `does` is the primary functions. `npcId` links the person, so
level and standing come from the registry. `what` is the line he wants read. And `melee.js:unitComposition(band)` — bodies, withSkills,
simpleSoldiers, families, named — is **the reader for exactly his list, and it is one of the seven remaining test-only exports**: a
function that answers his question, reachable only from a test. That is this project's signature defect one more time, and it means
**the roster panel is a render, not a feature build.**

**What is also already built:** `engine/assignments.js` (`addAssignment`, `advanceAssignment`, `assignmentsForGM`) sends a named person
off with a charge and ticks it in the world; `delegationCapacity` says how many may be out at once (`floor(level/10)` — Silas: 3);
`engine/presence.js` computes where someone is and `walkingDays` how far; `company.js` moves people in and out (`recruit`,
`partCompany`, `activeCompany`, `formerCompany`).

## §3 — THE PLAN, IN FOUR PIECES (mine unless marked)

**1 · The Fellowship panel — a render of what exists.** One row per contingent: the name (`what`, or the registry's name for `npcId`),
**level** (registry), **primary functions** (`does`, as words — SHAPE, HARM, KNOW, PROTECT, RESTORE), quality, and **where they are**:
their place, and `walkingDays` from you when it is not your place ("*four days east, at the Crossing*"). Band-level line from
`unitComposition`: bodies, how many carry a skill, which families the band can field. ⛑ *No new content needed.*

**2 · One pool, two states.** Erik's "move people from my active party to the fellowship pool easily" needs the pool to be a thing.
My proposal: **the pool is everyone who has thrown in with you and is not at your side** — `formerCompany` (parted, not gone), the
band's contingents, and anyone sworn. The party is the ≤6 in `company`. The control is one button per person each way; the cap refuses
with its reason (it already does). ⚠️ **A person in the pool is not idle** — they are somewhere, which is what piece 1 shows.

**3 · Missions and trade trips — `assignments` widened.** Today an assignment is a charge given to a person, ticked by the world. A
mission needs three more things: **a destination** (a place id, so travel time is real), **a kind** (escort · trade · carry word ·
watch · seek), and **an outcome that returns** — goods, coin, news, a debt, a loss. The engine has the ticking and the capacity; what
it lacks is the kinds and their outcome tables. ⛔ **That is the half I want you to spec** (§4.1).

**4 · The band's own reader, wired.** `unitComposition` stops being test-only; `bandStrength`, `bandThreat` and `recoverBand` already
have callers. The panel and the GM's band block read the same function.

## §4 — WHAT I AM ASKING YOU TO SPEC

1. ⛔ **Mission kinds and their outcomes.** Five to seven kinds, each with: what it needs (a person with which family, how long, what
   it costs), what it returns on each degree, and what the world does with the result. ⚠️ **The outcome must be able to be bad** — a
   trade trip that loses the goods, an escort that comes back short — or sending someone is free and therefore meaningless.
2. **Who may be sent.** Sworn is now consent to travel *with* you; is it consent to be sent *away*? Erik's ruling covers the party, not
   the errand. My read: the same floor, and a person refuses a charge their record argues against (a warden will not run contraband).
3. **What the Fellowship IS in the fiction** — `count: 6, quality: 2, condition: "fresh"` is a unit; Pell is a person inside it.
   Erik moves between "my band" and "my party" freely. **Does a contingent of one named person sit in both, or does joining the party
   pull them out of the band?** This is the one question I cannot answer from the data, and every control in §3.2 depends on it.
4. **The words.** Panel labels, the refusal lines, and what a returning mission says. Mine read like an engineer's when I write them.

## §5 — FOUR OTHER ASKS ERIK GAVE ME FOR YOU

1. ⛔ **A pass over holdings: "making sure every feature has a benefit and things you add have an effect."** His words. I can measure
   the reach for you before you start — say the word and you get a table of every feature kind against the engine function that reads
   it, the way §182 did for craft fields. My guess from having just been in that code: the features are read for *yield* and for the
   *raid* and little else, and several are decoration.
2. **Five damage types the corpus uses that the enum does not admit** — `force` (4 crafts), `psychic` (2), `radiance` (2), `spatial`
   (2), `corrosive` (1). `damage_types.json` is gated now (B2/§185) with those five named as a census: **widen the enum or retype the
   eleven crafts**, and a sixth new type fails the gate.
3. **`mechanic_effects.json`'s `wired` flags are stale in eight places** — six are effects the file calls unwired that were built after
   it was written (TEMPO, REVEAL, CONCEAL, SUMMON, PERSIST_UNTIL_HEALED, PROJECT_TICKS) and two it calls wired that the engine never
   names (TEMP_SOAK, SENSE_SLOT — those two are mine to build or to rename). content_ci prints the list every run.
4. **Two small stale things the new B2 gates report:** `energy_costs.json`'s own `n` counts are a stored copy of a derived number and
   are five-for-five out of date (T1 says 118, the corpus has 166) — restamp or drop them; and **all nine companions' bond grants are
   stubs** against `companion_template`'s own rule that a grant carries the full ability schema.

## §6 — AND THE ONE ERIK RULED THAT CHANGES YOUR GEOGRAPHY WORK

> *"I don't see a reason to regenerate the world… just track the changes over time to make sure the diffs are intentional."*

So the six red geography gates are **not a rebuild any more**. `terrain.json` was last built on 2026-08-10 and about thirty content
files have moved since, your two new ports among them. I am turning the determinism gate into a **drift census** — it will name what
changed and hold the world to *intentional* diffs rather than to byte-identity. The river-name gates (SNG-393/394) stay content
decisions of yours; the census will stop them being reported as a broken build.

— CCode
