# REPLY — the group model is built, and your §4 fidelity gate reads RED

**CCode → Aevi and Erik · v1.9.259 · `engine/group.js` · `scripts/group_fidelity.mjs` · 25 assertions**

**You were right that this supersedes the casualty ruling rather than answering it.** My four questions
assumed a folded party is a pool of hitpoints. ⛔ **It is a capability set, and the two degrade differently.**

---

## §1 — ✅ BUILT: `groupCapability(members)` → `{coverage, depth, sole, cohesion, lost}`

| | |
|---|---|
| **COVERAGE** | the union of what members bring — **binary per capability** |
| **DEPTH** | how many supply each |
| ⛔ **SOLE** | ⛔ **coverage held by exactly one standing member — named BEFORE it is lost** |
| **COHESION** | gradual with attrition · **sharp** for a leader or a coverage cliff |

✅ **`sole` is the number a player should see, and you spotted why: the nine authored `downedEffect`s are
already written as coverage cliffs** — *"the perimeter goes dark"* — **and nobody had called them that.**

✅ **AGGREGATION UPWARD WORKS AT EVERY RUNG** (§5.2). A member carrying `.capability` folds in as a
sub-group, so a legion of cohorts of squads uses the same call. ⚠️ **A sub-group contributes its DEPTH, not
one vote** — folding a 40-strong cohort in as a single "member" is exactly how an aggregate stops matching
the fight it replaces. **Two squads with a mender each are no longer one casualty from losing RESTORE, and
that falls out rather than being special-cased.**

⛔ **AND YOUR §8 CASE HOLDS: 40 soldiers vs 5 heroes does not read as total defeat.** The legion is deeper
in `HARM` and **cannot answer `KNOW` or `RESTORE` at all.**

---

## §2 — ✅ §6 IS MECHANICAL NOW, NOT A PROMISE

**Nothing in `group.js` names a capability family.** ⛔ **`tests/group_capability.mjs §5` invents a SEVENTH
family at run time and asserts it flows all the way through — coverage, depth and sole — with the module
untouched.** ✅ **Proven able to go red by hardcoding a five-family list.**

⚠️ **ONE CORRECTION TO YOUR §6, AND IT MATTERS FOR THE CONSTRAINT.** You wrote that `contributionsOf`
*"already derives from `tagFamilies`… rather than a hardcoded list — keep that."* ⛔ **It derives from a
parameter nothing supplies.** Every live call passes `opts` without it, so the hardcoded
`DEFAULT_TAG_FAMILIES` — six families — is always what runs. **The only writer in the repo is one line of
`smoke.mjs`.**

**A reader with a test-only writer is not a derived vocabulary; it is a hardcoded one with a seam.** ✅ The
seam is real and worth filling — **`group.js` threads `opts` through untouched, so the day content supplies
`tagFamilies` it reaches the group model for free.** ⬜ **Whether that vocabulary should be authored is
yours and Erik's.**

---

## §3 — ⛔ YOUR §4 GATE READS RED, AND THE REASON IS SHARPER THAN "IT DIVERGES"

`node scripts/group_fidelity.mjs`

**Ground truth is per-blow targeting through the real `chooseTarget` — not a formula I wrote.**

| foe policy | full sim loses RESTORE | ⛔ aggregate |
|---|---|---|
| `threat` — it fights whoever fights it | **0%** | **71%** |
| `weakest` — it is cruel | **100%** | **71%** |
| `healer` — it is hunting the mender | **100%** | **71%** |

⛔ **THE AGGREGATE IS A FIXED 71% NO MATTER WHAT THE FOE IS.** `distributeCasualties` sorts by soak
ascending; `chooseTarget` sorts by threat descending. ⚠️ **Those two rules disagree about exactly the people
who hold sole coverage** — a mender has no `MARTIAL` and no `HARM`, so the fight's own rule aims **away**
from her and the shortcut aims **at** her.

⚠️ **SO THE SHORTCUT IS NOT UNIFORMLY WRONG — IT IS PERMANENTLY PREDATORY.** It reproduces one kind of
enemy and applies that behaviour to every enemy.

✅ **AND THE FIX IS ONE SEAM, NOT A REWRITE: the aggregate should SHARE the targeting policy instead of
baking a second one in.** `distributeCasualties` already takes an ordering; the live path already takes a
policy as an argument. ⬜ **I have not made that change — it alters who dies in every large fight, and it
is Erik's call, not a refactor.**

---

## §4 — ⚠️ TWO ORDER ARTIFACTS IN MY OWN HARNESS, BOTH CAUGHT THE SAME WAY

**Both were found because a number came out at exactly 100%.**

1. My fixture passed raw records, and `scoreThreat` reads `a.contributions` — **so every member scored an
   identical `level/4`, the sort was stable, and "threat" returned whoever I listed first.** ⛔ **The
   harness reported the healer dying 100% of the time in the GROUND TRUTH and I nearly published it as
   evidence the full sim was the brutal one. It was my array order.**
2. Then the spears carried no weapon, so they had no `MARTIAL`, so they tied with the scout — **and the
   scout died every single time, for the same reason.**

⛔ **A GROUND TRUTH THAT DOES NOT BUILD ITS ACTORS THE WAY THE ENGINE DOES IS NOT A GROUND TRUTH** — the
warning `scale_fidelity.mjs` already carries about comparing a formula with itself, wearing a new costume.

---

## §5 — WHERE THAT LEAVES YOUR ORDERED LIST

| | ask | state |
|---|---|---|
| 1 | `groupCapability` | ✅ **built, 25 assertions, load-bearing ones proven red-able** |
| 2 | aggregate upward | ✅ **built — same call at every rung** |
| 3 | casualties → depth · sole → coverage · leader → cohesion | ✅ **built and distinguishable** |
| 4 | group-vs-group | ⚠️ **`groupMatchup` exists and reads coverage against coverage** — ⬜ **not wired into play** |
| 5 | fidelity test first | ⛔ **built, and it is RED** |

⛔ **AND I AM HONOURING §5.5: I HAVE NOT TUNED THE POOL.** *"Tuning a pool that destroys the wrong people
only calibrates how fast it does that"* — that is now measured rather than argued.

⬜ **ERIK'S CALL, AND IT IS ONE QUESTION NOW INSTEAD OF FOUR: should the aggregate share the live targeting
policy?** ✅ **If yes, the fidelity gate is how we will know it worked** — and the casualty-pool ruling
becomes a real question again, on top of an abstraction that no longer eats the healer first.

— CCode
