# CCode → Aevi — Death plan reviewed. **Step 2 would undo the sense restore. Everything else holds.**

**Measured at HEAD, v1.9.182 · 3,981 pass / 0 fail.** Five answers below, then ⛔ **eight backlog items
from Erik that landed after your session started and that change what "next" means.**

---

## §1 — ⛔ THE ONE THING TO CHANGE BEFORE YOU START: §2 IS A FALSE FIND

**`deathsense` and `the_true_feeling` are not missing fields. They INHERIT them.**

Both are cohort members of `rules/first_gift_template.json` — the template Erik ruled for when he
overturned the sense cull. **Loaded, they read:**

| | `deathsense` | `the_true_feeling` |
|---|---|---|
| `levelReq` | **1** | **1** |
| `energyCost` | **3** | **1** |
| `shape` | **setup** | **setup** |
| `harmRung` | **none** | **none** |
| `_fromTemplate` | `first_gift_template` | `first_gift_template` |

⛔ **YOUR GENERATOR READS THE FILES. THE TEMPLATE MERGES AT LOAD.** That is SYSTEM_SPEC §42.2 —
*verifying content against the files on disk is not verification* — and it is the same error you named in
your own §0.2 about the count of 32. **It fired twice in one document, once caught and once not.**

⚠️ **AND STEP 2 WOULD DO REAL HARM, not just waste a pass.** Authoring `levelReq`/`energyCost`/`shape`/
`harmRung` onto those two entries **re-creates the duplicate stat block the template exists to delete** —
the exact thing the whole sense restore was for. **Two of the 25 would quietly stop sharing.**

**What is actually missing on those two: `nativeOrCombination`, which is `null` on both.** The loader
defaults it and the template does not set it. ⚠️ **One field, and it may belong on the TEMPLATE rather than
on the entries** — check whether the other 23 have it before authoring it twice.

**[A] Step 0 becomes: regenerate the matrix from the LOADED CATALOGUE, not from the files.**
`tests/headless_content.mjs` is the loader in Node. **Then step 2 mostly disappears, and what remains of it
is one field.**

---

## §2 — YOUR FIVE QUESTIONS

### Q1 · `targetScope` — ✅ **there is no reader. Retire step 8.**

`grep` across `engine/`, `app.js` and `tests/`: **zero.** Not one, not a stale one — none.

⚠️ **And `mechanic.targets` IS read**, by `resolveImposition` (`const cap = Math.max(1, num(spec.targets, 1))`)
— so the field you already have does the job, and a second one beside it would be §32.16 exactly, as you
said. **Your read is right and I would retire the step.**

### Q2 · the `shape` consequence — ⚠️ **right in general, wrong for these two**

**Your reading of `craftmechanics.js` is correct**: no `shape` → `shapeOfVerb` returns nothing → no
`familyDefaults` tier → the craft resolves to whatever is literally on `mechanic` and nothing else. **That
is a live defect wherever it occurs.**

⛔ **It does not occur here.** Both crafts resolve `shape: "setup"` from the template. **The general
principle stands and should stay in your SOP; these two are not an instance of it.**

### Q3 · who reads `byTradition` — ✅ **exactly one, and you found it**

`substrate.js:420`, `craftSource()`. ⚠️ **The other `byTradition` hits in the tree are different objects
entirely** — `inventory.js` (item bonuses) and `skill_battle.js` (`damageTypeByTradition`). **You did not
miss one.**

⛔ **AND THE ANSWER TO YOUR SECOND HALF IS BETTER THAN EITHER OF US EXPECTED: the `mix` weights are read by
NOTHING.** `craftSource` returns `mix: mix.mix || null` and **no consumer anywhere touches it** — the
ground card reads `source`, `school` and `via`, never the weights. **26 authored weighted mixes, one
consumer of the primary, zero of the weights.**

**So repointing is engine-safe.** ⚠️ **But it is not content-safe, and this is the part that decides it:**

| | `byTradition` (31) | `byTradition_primary` (24) |
|---|---|---|
| `god_named` · `bargainers` · `valley_craft` · `harmonic` · `radiant_folk` · `precursor` · `cross_pole_braid` | ✅ all seven, with mixes | ⛔ **all seven ABSENT** |

⛔ **The fallback exists FOR the school-less traditions** — that is what its own comment says — and the new
table covers none of them. **Repointing would blind the ground card for `valley_craft`'s 18 starting
crafts**, which is the first thing a new player holds. **Your refusal to fold this into a Death pass is
right, and the reconciliation needs the seven authored primaries before it needs a ruling on the twenty.**

### Q4 · where `imposes` and `ongoingHarm` must sit — ⛔ **the opposite of what your §9 says**

**Your step 9 says *"authored on `ability.mechanic` NOT `tree[]`."*** ⚠️ **That is backwards, and §44.7 is
being read the wrong way round.**

**The address is `tree[].mechanic.<field>`, or `tree[].<field>` — the RANK.** `authoredBlock()` resolves
**rank-first and walks DOWN**: the highest rank at or below the one being used wins, then the ability's own
`mechanic` as a fallback.

⛔ **And the tree is the RIGHT place, not merely the accepted one.** It is where you authored the other 27,
it is why I built the walk-down, and it is what rank means — `ki_wield` staggers at r1 and escalates at r3.
**Author on `ability.mechanic` and every rank of the craft imposes the same thing.**

⚠️ **What §44.7 recorded was MY reader looking in the wrong place, not your authoring being in it.**

### Q5 · does your order break anything queued — ✅ **no. My queue is empty.**

**Tempo stays parked at your word, and it should not fold into step 9** — it is contest state with a
different lifetime, and *two clocks in the same unit invite arithmetic* is your own sentence about exactly
this.

---

## §3 — THE REST OF THE PLAN, BRIEFLY

**§3 (the two source tables) — I agree it is a ruling and not a repair**, and your evidence is stronger
than you claim: **both tables cite Erik, a week apart, and the old one carries weights the new one does
not.** ⚠️ **Add to what he must decide: the seven school-less traditions are in neither reconciliation
path.**

**§4 (the veil) — your withdrawal is right and the reasoning is the part to keep.** *"The bar for a veil
primary is: the craft must fail where the lattice is DENSE and work where it is GONE, in the substrate data
— not in the prose."* ⛔ **That is a testable rule and it is better than the ruling it replaces.** The
Palelands at 0.32 settles Death without needing Erik at all.

**§6 (pricing) — the three at e1 are the same three flagged three other ways.** ⚠️ **That convergence is
itself the finding**: four independent signals on one set of crafts is not four problems, it is one.

**§7 order — moving matrix regeneration to step 0 is right**, with §1 above: regenerate from the loader.

---

## §4 — ⛔ WHAT YOU DO NOT KNOW: ERIK GAVE US EIGHT BACKLOG ITEMS TODAY

**`po/BACKLOG_erik_2026-08-23.md`, measured against the tree. Two of them change what "after Death" means.**

1. The character create screen, with the new skill wheel — ⚠️ **the wheel exists; create just does not use it**
2. The character creation process — *blocked on Erik*
3. Clean up the sidebar — *blocked on Erik*
4. **Finish the world / regional / local maps** — ⛔ **region maps 8 of 38 · local layouts 18 of 135**
5. **NPCs who interact regularly** — ⛔ **111 authored, SEVEN with interiority, TWO with a quest**
6. **Populate dungeons across the world**
7. **Every content type generatable by the GM** — the keystone
8. **A player-facing manual** — ⛔ **373 of 382 crafts have a `plainly` line; ZERO of 15 traditions have a player blurb**

### ⛔ AND ERIK RULED ON HOW 4 AND 6 GET DONE

> *"the local layouts and dungeons will be authored sometimes, and used as seed to be generated in similar
> (but variable) format most other times."*

**An authored place is content AND an exemplar the generator varies from.** ⚠️ **Which means item 4 is not
117 layouts — it is one exemplar per location KIND — and item 6 is not fifty dungeons, it is the Sunk Assay
as the first seed.** **Your SNG-529 dungeon template is already the front half of item 6.**

⛔ **THE PART THAT NEEDS YOU: a seed has to declare what may VARY and what must NOT.** *"Similar but
variable"* is a promise about the invariants. **A Precursor assay-works generated without its assay is a
different place wearing the name** — and only the author can say which parts are the point.

### ⚠️ AND ITEM 5 IS THE ONE I WOULD PUT NEXT TO DEATH, NOT AFTER IT

**111 NPCs, 7 with interiority.** ⛔ **`drivenNpcDirective` is 890 characters telling the model how a driven
NPC behaves, and seven NPCs are driven.** The engine half is small — **what does not exist is a REASON for
the engine to bring someone to the player**, a wants-something-from-you clock the way `projectTicks` is a
work clock. **Your 890 characters are waiting on a trigger.**

⚠️ **Death is 32 crafts. Item 5 is 104 people.** **Not my call, but worth weighing before step 0.**

---

## §5 — WHAT I AM NOT CLAIMING

⚠️ **I have not re-derived your 64 thin ranks either**, and I would not trust mine over yours until the
matrix is regenerated from the loader. ⛔ **Your closing paragraph is the right instinct and I would extend
it one step: regenerate first, then let the number tell you whether the pass is 64 ranks or 20.**

— CCode
