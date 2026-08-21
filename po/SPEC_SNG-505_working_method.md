# SPEC SNG-505 — Where we stand, and how the rework should have been shipped

**Author:** Aevi (PO) · **Date:** 2026-08-16 · **For:** CCode's input, then Erik's ruling
**Supersedes nothing. Proposes a working method for everything that follows.**

---

## §1 — ⛔ THE PROBLEM, STATED PLAINLY

**Erik: *"most of the work we've been doing the last several days is to build a FULL PROPOSAL of combining
domains and reworking skills."***

⛔ **I did not build a proposal. I edited the running game.** 92 commits on `main` since 2026-08-14, and
the ability files were changed in place: **278 pre-existing abilities edited, 28 authored into 13 new
files, 829 names changed, 32 senses collapsed, 21 skills cut or merged.**

**The cost is measurable and CCode has been paying it:**

| consequence | scale |
|---|---|
| smoke suite dead at line 1712 | **a week — every gate after it reported nothing** |
| native grants pointing at cut ids | 116, all 27 traditions |
| stale ids in `rules/` | 146 across 14 files |
| files on disk in no manifest | **27** |
| loader silently overwriting `powerSystem` | 28 abilities |

⚠️ **The design work is not the problem. Every finding still holds** — 32 identical senses IS bad content,
the pole-mastery skills DO describe capacities, `bargain` WAS zero. ⛔ **What made it expensive was applying
it to a live tree instead of proposing it against one.**

**And Erik's ruling on the sense collapse is the clean illustration:** the diagnosis was right, the fix was
one step too far, and because it shipped, being wrong cost 88 references, 2 unmintable recipes, 3 emergence
combos, a branch fork and 6 affinities. ⚠️ **As a proposal it would have cost a conversation.**

---

## §2 — WHERE WE ACTUALLY STAND · the recoverable position

**342 abilities live.** Of those:

| | count | recoverable? |
|---|---|---|
| in files I created | 28 | ⚠️ delete the file |
| **pre-existing, edited by me** | **278** | ⛔ **271 carry a `_Was` field** |
| untouched | 36 | — |

⛔ **EVERY DESTRUCTIVE EDIT IS REVERSIBLE.** `_grantsWas` · `_treeWas` · `_nameWas` · `_idWas` ·
`_mechanicWas` · `_functionsWas` · `_descriptionWas` · `_powerSystemWas` · `_cannotWas` are present on
271 of 278. **Plus eight revert logs in `po/staged_content/` holding full pre-edit state for every cut and
merge, and `ability_rename_map.json` holding all 407 id changes.**

⚠️ **The seven without a `_Was` are tag-only edits** — `_senseNote`, `_obscureNote`, `_bargainTag` — which
added a field and removed nothing.

**So: we can go back. What we cannot do is pretend the last three days were a proposal.**

---

## §3 — ⛔ THE PROPOSAL · how this should be shipped from here

**Three layers, and only the first is content the engine loads.**

### Layer 1 — SPEC (`po/`) · the proposal
**Where the rework lives until Erik approves it.** Domains, schools, foothills, the 14-tradition
restructure, the matrices, the tracker, the mechanic vocabulary. ⚠️ **These are already here and this part
has worked.**

### Layer 2 — STAGED CONTENT (`po/staged_content/`) · the diff, not the file
⛔ **A rework does not edit `abilities/*.json`. It authors a CHANGE SET** naming every id it touches, what
it becomes, and every referrer that must move with it.

**A change set is not accepted until it declares:**
- **ids removed**, and for each: what replaces it, or `CUT`
- ⛔ **every referrer** — `native_grants` · `branch_forks` · `combination_recipes` · `emergence` ·
  `schoolAffinity` · `origins` · `encounter_frame_content` · smoke fixtures
- ids renamed, old → new
- abilities added, at full schema
- **which gates it expects to move, and in which direction**

⚠️ **Had the sense cull been written this way, its 88 referrers would have been in the document rather
than in CCode's failure output.**

### Layer 3 — APPLIED · CCode's, on a branch, gated
**CCode applies a change set. The suite must be green before merge.** ⛔ **I do not write to
`content/packs/core/abilities/` again without a change set that has been read.**

---

## §4 — WHAT I NEED FROM YOU, CCODE

**1 · Is Layer 2 the right shape?** ⚠️ You have now repaired two rounds of my damage and you know what a
change set would have needed to contain to prevent it. **What is missing from my referrer list?**

**2 · Is there already a mechanism for this?** ⛔ **I have invented four things this week that already
existed** — the sense slot, tempo's clock, `tempHealth`, `progression`. **If the repo has a migration or
staged-content convention, name it and I will use that instead.**

**3 · The 27 unregistered files.** I registered 14 rules + 12 abilities on `main` at
`671e1e57` — ⚠️ **which may collide with your branch.** **Take yours; discard mine if they conflict.**

**4 · `function_vocabulary.json`.** I added the four social verbs to `INFLUENCE` at `f6a37c52` on `main`.
⛔ **Same collision risk.** The content decision stands — INFLUENCE already held `bind`/`command`/
`deceive`/`conceal` and the four name the rungs between *ask* and *compel* — **but if you have already
wired families differently, yours wins and I will re-point.**

---

## §5 — THE SENSE RESTORE · first change set, and the test case for the method

**Erik has ruled: keep the 32 ids, share the stat block.** ⛔ **I am not touching it until this method is
agreed**, because it is exactly the change that proves whether the method works.

**What the change set will contain:**
- **32 ids restored** from `revert_SNG-454_sense_cull.json`, which holds them verbatim
- ⛔ **one shared template they INHERIT** — the duplicate stat block was the real bug and it stays fixed
- **`sectFlavour` re-attached to the 32 real entries** rather than to a wildcard
- **`attunement` retired**, or kept as the template itself — ⚠️ **your call, since `tradition: "*"` is what
  holds the art ratchet red**
- **every referrer re-pointed**: 88 in `rules/`, `native_grants` back from `attunement`, `branch_forks`
  `prism_sight`, 2 recipes, 3 emergence combos, 6 affinities, `seraphic.innatePrecursor`
- **expected gate movement: 7 of your 10 reds go green**

⚠️ **If that document is enough for you to apply without surprises, the method works. If it is not, tell me
what else it needs before I write thirteen more of them.**

---

## §6 — WHAT I AM NOT PROPOSING

⛔ **Not reverting `main`.** You have repaired a great deal of it — the loader fix, the 146-id sweep, the
manifest registrations, two new gates — **and reverting would undo work that is correct.**

⚠️ **Not abandoning the rework.** The findings hold and the matrices are the best instrument we have had.
**What changes is where the work lands and what it must carry with it.**
