# PROPOSAL — what to add, ranked by what it would have caught THIS WEEK

**CCode → Erik and Aevi · v1.9.248**

⛔ **Every item below is justified by a specific failure from the last few days, not by general good
practice.** ⚠️ **Where I cannot name a failure it would have prevented, I say so and rank it lower.**

**The shape of the problem:** 98 engine modules · 14,257-line `app.js` · 43 test suites · 370 content
files · **873 commits in 14 days** across two agents and you. ⛔ **And zero CI, zero git hooks, zero type
checking.** The suite runs only when one of us remembers, and this week I forgot twice.

---

## ⛔ TIER 1 — THE FOUR THAT PAY IMMEDIATELY

### 1. ⛔ `schemas/ability.schema.json` — THE BIGGEST SINGLE GAP IN THE PROJECT

**There are ELEVEN schemas** — `arc`, `character`, `creature`, `item`, `location`, `npc`, `npc_quest`,
`player_profile`, `tradition_arc`, `world_arc_quest`, `ledger_event` — **and NOT ONE for crafts.**

⚠️ **The discipline already exists here. It simply does not cover the 378-item, 107-field type at the heart
of the game — which is precisely where all 19 dark fields live.**

**With `additionalProperties: false`, these become impossible to create by accident:**
`penetrationNote` · `awaitingEngine` · `theNames` · `companionTaught` — **notes and one-offs wearing field
names.** ⛔ **And it enforces *reader before field* MECHANICALLY: to author a new field you must first
declare it, which is a deliberate act someone reviews.**

⚠️ **What it CANNOT do: tell you a declared field is unread.** ✅ **Pair it with `field_atlas.mjs` — the
schema says "this field is legal", the atlas says "and something reads it."** Both, or neither is enough.

**Cost:** one file, plus a `content_ci` gate. **Half a day, and it closes the door the other 19 came
through.**

---

### 2. ⛔ `// @ts-check` + JSDoc — WOULD HAVE CAUGHT FIVE OF MY EIGHT FALSE FINDINGS, AT EDIT TIME

**No build step, no runtime cost, works on vanilla ES modules.** A `jsconfig.json` with `checkJs`, and
types expressed as JSDoc comments on the functions that already have comment blocks.

**What it would have caught this week, before anything ran:**

| my mistake | what the checker says |
|---|---|
| `deathDepth(entity, { currentDay })` | ⛔ `Argument of type '{currentDay:number}' is not assignable to 'number'` |
| `chooseTarget(...).id` | ⛔ `Property 'id' does not exist on type '{target,policy,why}'` |
| `TARGET_POLICIES.includes(...)` | ⛔ `Property 'includes' does not exist on an object type` |
| `mechanicsOf(...)` | ⛔ `has no exported member 'mechanicsOf'` — it is `mechanicFor` |
| passing `craft_mechanics` where `energy` was wanted | ✅ **caught, IF the two configs are named types** |

⛔ **That last one is the whole argument.** It nearly became *"the entire rank-reach cost mechanic is
inert"* — a false headline about a system you personally ruled on. ⚠️ **Two config objects with different
shapes and the same parameter name is exactly what a type system exists for.**

**Adoption is gradual:** turn it on, add `// @ts-check` to one module at a time, start with the ones whose
contracts have already bitten — `targeting.js`, `death.js`, `capabilities.js`, `craftmechanics.js`.

---

### 3. ⛔ CI ON PUSH — 873 COMMITS IN 14 DAYS AND NOTHING RUNS THE SUITE

**A GitHub Actions workflow running `npm test` on every push.** ⚠️ **Right now the only thing standing
between a broken push and the game is whether the agent doing it remembered.**

**This week I:**
- committed with smoke at 3 failures without checking
- shipped `CCODE-282` without bumping the version — **caught by a gate I only ran because I happened to**
- pushed a `po/` file that was never committed at all, which is what started this whole thread

⛔ **All three are things a machine notices for free and a person notices sometimes.**

---

### 4. ⚠️ A PRE-PUSH HOOK — the same checks, five seconds earlier

`.git/hooks/pre-push` running `node scripts/run_tests.mjs --quiet`. **CI catches it in a minute; a hook
catches it before it leaves the machine.** ⛔ **With two agents pushing to one branch, the difference
matters** — I had to rebase onto Aevi's work twice today, once with a conflict.

---

## ⚠️ TIER 2 — PROCESS, WHICH IS CHEAPER THAN TOOLING AND WE NEEDED IT MORE

### 5. ⛔ **NO NUMBER IN A SPEC WITHOUT THE SCRIPT THAT REPRODUCES IT**

**This is the one I would adopt first, ahead of anything on the tooling list.**

**Every number dispute this week cost a full round-trip, and there were four:**

| claim | reality |
|---|---|
| my *"73% of rank axes miss the allow-list"* | ⛔ artefact — I compared one field to another field's vocabulary |
| my *"the uphill bearings are INVERTED"* | ⛔ wrong — 13 of 16 disagreements are distance, and the 3 bearings are 15°/45°/150° |
| Aevi's *"30 ranks author a number"* vs my *"zero ladders"* | ⛔ **both wrong** — five ladders, and my scan hardcoded a field list |
| Aevi's *"18 unread fields"* | close — 19 dark + 1 collision, once questions stop counting as consumers |

✅ **A spec that ships with `node scripts/x.mjs` lets the other party RUN the claim instead of arguing
with it.** ⚠️ **`damage_map.mjs`, `rank_curve.mjs` and `field_atlas.mjs` all exist because a spec number
turned out to be unreproducible. Make that the default, not the remedy.**

### 6. ⚠️ SAVE-FIXTURE REGRESSION — your save is the only real one

**We renamed `blind` → `mindless` today and it needed an alias for exactly one authored encounter.**
⛔ **Nothing tests that a real save still loads after a vocabulary change.** ✅ **A golden-file test that
loads `characters/player-s9z9u1/*` and asserts no crash, no dropped ability, no lost craft** — cheap, and
it guards the one artefact in the project that cannot be regenerated.

### 7. ✅ EXTEND THE EXECUTABLE-DOC PATTERN — it is working

`HOW_IT_WORKS.md` + `FIELD_REFERENCE.md` are now 142 assertions. ⛔ **Two doc claims inverted under
measurement this week and a third was logged-but-never-written.** **The pattern earns its keep; the next
candidates are the GM contract and the encounter model.**

---

## ⚠️ TIER 3 — AGENTS AND MCP, WITH A CAVEAT I WANT ON THE RECORD

**You asked specifically, so here is my honest read rather than an enthusiastic one.**

### ⛔ THE CAVEAT FIRST: MORE AGENTS IS NOT THE BOTTLENECK

⚠️ **This project's constraint is NOT content-generation speed. It is engine–content CONNECTION.**
**Measured today: ~140 KB of registered-never-loaded rules, 19 dark fields, 495 unread axis values, 117
locations with no authored layout.** ⛔ **Content already outruns the engine by a wide margin. An agent
that authors faster makes the gap worse, not better.**

⚠️ **And the second risk is the one this whole week demonstrates: I produced roughly EIGHT confident false
findings in one day, each of which looked exactly like a real defect.** **An agent with less context and
no self-test will produce more, and they cost more to disprove than to make.**

### ✅ WHAT I WOULD ACTUALLY ADD

| | |
|---|---|
| ✅ **A narrow "four doors" reviewer** | runs `field_atlas`, `safe_delete`, `wiring_audit`, `how_it_works` and **summarises what CHANGED** — no free-form bug hunting. ⛔ **It reports what the scripts found; it does not have opinions.** |
| ✅ **A content-authoring agent scoped to ONE tradition at a time** | with the ability schema (item 1) as its contract, so it cannot mint a field |
| ⚠️ **A save-migration agent** | only once item 6 exists to check its work |

### ⛔ MCP: MOSTLY ALREADY COVERED

**Filesystem and git are already reachable through the shell.** ⚠️ **A memory server is largely superseded
by `FIELD_REFERENCE.md` — and the repo is the better place: versioned, diffable, and GATED.** ⛔ **Knowledge
in an agent's private store is knowledge nobody else can run.**

**The one I would consider: a browser/screenshot check for the map and capability-menu UI**, since those
are the two places where "authored but invisible" cannot be caught by reading source. ⚠️ **Low priority
until the map layer is wired at all.**

---

## ✅ WHAT I WOULD DO, IN ORDER

1. ⛔ **`ability.schema.json` with `additionalProperties: false`** — closes the door the 19 dark fields came through
2. ⛔ **`npm test` in GitHub Actions on push** — one file, catches what I forgot three times this week
3. ⛔ **Adopt "no spec number without a runnable script"** — free, and the highest-value item on the page
4. ✅ **`jsconfig.json` + `@ts-check` on the four contract-heavy modules**
5. ✅ **pre-push hook**
6. ✅ **save-fixture regression**

**1 through 3 are a day's work between us and they close the two classes that produced everything this
week: fields nobody reads, and numbers nobody can reproduce.**

— CCode
