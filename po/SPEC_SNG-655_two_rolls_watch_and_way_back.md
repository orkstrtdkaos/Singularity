<!-- status: SNG-655 — Aevi (PO) · RULED by Erik 2026-09-25 ("i told him to build the watch role and the resurrection one too, but to check with you on how... i agree with a watch vs stealth contest. all that sounds good") -->
# SPEC SNG-655: two rolls — the watch, and the way back

**Aevi (PO) · 2026-09-25** · for CCode to build.

**Both of these were refused by CCode, correctly, because neither roll existed:**
- CCODE-502: the watch has no detection roll.
- SNG-653: a retrieval is decided by its caller.

Erik has now ruled both into being. This spec is the *how*. Every number is a dial; Erik turns them.

**The shared principle** (the same one SNG-653 and CCODE-500 held): **one function, read by the screen and by the
resolver.** The number a player is shown is the number that is rolled, and no second derivation exists anywhere.

---

## §1 — THE WATCH: a contest, `seen = watch ÷ (watch + stealth)`

**Erik's original ask:** *"a success % against a similar level theft or raid detection event... that lets the PC
know how many allocated to a watch and how much it benefits."*

**Ruled today:** *"i agree with a watch vs stealth contest."*

### What `watch` sums

| source | weight |
|---|---|
| the **captain** (one named person on watch; highest hand wins the seat by default) | their SNG-652 §2 hand at the **watch** duty, **× 1.0** |
| each **other named watcher** | their watch hand **× 0.5** |
| each **plain hand** on watch (a contingent head, CCODE-450) | **0.3** each |
| **features** | tower 2 · watch 1 · sentries 1 · ward_line 1, each × `featureLevel`, and **not while lapsed or disrupted** (SNG-652 §8a) |
| a **shadow ward** on a barrier layer | +1 against **theft** only |

⚠️ **Until SNG-652 §2's hands are built,** a named person's watch hand is `tierWeight(level)`. Their evidence families
still add: `know` or `protect` counts the full weight, anything else counts half. **HARM is excluded,** per the §2
ruling (everyone has it).

### What `stealth` sums (the other side)

- **The party:** the raiders' level-weighted count of people whose families include **move**, **deceive** or
  **hide**. When the party has an owner (SNG-634 C1, `raidersFrom(power)`), it's the power's own people; otherwise
  it's the anonymous party at the hold's danger level.
  - ✅ **BUILT · 2026-09-25 (CCODE-509)**, and it needed a change to `powers.js` first, because *"the power's own
    people"* had no population: `raidersFrom` returned CONTINGENTS — `{n, quality, what}`, where `what` is authored
    prose and nothing person-shaped. ⚠️ I tried this repo's own prose reader on those 33 contingents and
    `contributionsOf(…{evidence:true})` returned `["HARM"]` for **all 33** — its default — so a reader over them
    would have scored identically forever. ⛑ **All 29 powers name a `leader` and all 29 ids resolve**, derived
    levels 12–66, so the leader now rides at the core of a raid and the stealth side reads their record through the
    same `dutyHand` the watch uses. The anonymous bulk keeps the authored word. ⚠️ Their combat quality is their
    **rung** (3–6), never their level (12–66), and whether they take the field at all is `raid.leaderFights` — **off**,
    because a leader in the clash takes a hold's win rate from 50.4% to 18.1% at the tipping point.
- **The floor is `partySize × 0.5`,** so a big, loud raid is still *seen more easily* but never reads as zero.
  - ✅ **AMENDMENT · 2026-09-25 · `perHeadSeen: 0.35`** (Aevi: *"accepted, and the flaw was mine — record it as an
    amendment, not a deviation"*). ⚠️ **The line above states the rule and the arithmetic did the opposite.** Stealth
    SUMS over heads, so with size on one side only, a bigger party was *harder* to see: measured, the median raid a
    power sends is **36 heads** (min 7, max 104) — stealth 18 against a watch of 1–18, so an army walking up to the
    gate was missed nine times in ten. ⛑ `perHeadSeen` is the other half of the term — *36 people coming is also 36
    chances to be spotted* — and it is what makes the sentence above true. At `stealthFloor` (0.5) size cancels
    exactly; at **0** you get the unamended arithmetic, army and all. The median raid now reads **63%**.
- **Theft vs raid.** A **theft** is a small party (1–3) with doubled stealth weight: few, careful, quiet. A **raid** is
  the existing party. Both are rolled with the same function.

### Resolution

- **Once per raid or theft event,** before the fight: `rng() < seen`.
- **Seen:** today's path (the watch meets them, and the fight is the fight).
- **Unseen:** today's unseen path (they take their share).
- ⛔ **Nobody on watch and no watch features gives `seen = 0`.** That exactly reproduces today's rule where it applies,
  so no save's history is rewritten.

### The readout (SNG-652 §7)

- **"Theft seen: 71% · Raid seen: 84%"** is this function run against a party at the hold's own danger level. The
  label says so: *"against a same-strength theft / raid."*
- **The marginal line** is the function with and without a person: *"Add Cael: +6% raid seen."* It is **not** a
  first-watcher-is-everything shape any more; each watcher adds, and each adds a little less.

**Dials:** `holdStore.watch = { captainWeight: 1, watcherWeight: 0.5, plainHand: 0.3, features: {tower: 2, watch: 1,
sentries: 1, ward_line: 1}, stealthFloorPerHead: 0.5, theftStealthMult: 2, theftPartySize: [1, 3] }`.

---

## §2 — THE WAY BACK: one `retrievalOdds`, rolled by the engine for everyone

**Erik:** *"there are skills meant to be used for resurrection, so they have a pass/fail chance."*

**What's there today:**
- The **world tick** already rolls NPC retrievals: `retrievalOddsByDepth {0: .70, 1: .45, 2: .20, 3: 0}` + 0.05 ×
  tier rank, capped at .95, **inline in `worldtick.js`**.
- The **player path** (`deathOps` `retrieve`) takes `op.outcome` from the GM.

**Two derivations of one question, one of which is the narrator's opinion.** The fix is one pure function in
`death.js`, read by the world tick, the player path and the SNG-653 screen alike:

`retrievalOdds({ reacher, dead, depth, rank, intensity, bond, pledged, heldOpen, rules })`

| term | effect | why |
|---|---|---|
| **by depth** | threshold **.70** · near dark **.45** · deep dark **.20** · sealed **0** | the existing, measured table, moved into `rules.death` |
| **reach margin** | **+.10 per rung** that reach (rank + bond rungs, `canReach`) exceeds the depth | a rank-3 reaching the threshold is easier than a rank-1 at its limit |
| **surge** | reaches one rung further (as today), at **−.15** | the gamble has an upside and a price |
| **pledged** (SNG-653) | **+.10** | a promise made is a road already walked once |
| **held open** (`heldOpenBy`) | **+.10** | someone is keeping the way |
| **tier** | +.05 × tier rank | today's term, kept, for NPCs and PCs alike |
| **will** | `dead.deathState.willing === false` → **0**, honoured | unchanged; refusal outranks everything |
| **clamp** | **.05 – .95** | never certain, never hopeless while reachable |

**The rules around it don't move:**
- **Refused is not failed:** `canReach` still answers first and costs nothing.
- **A failure still sinks them a rung, and seals them at the deep dark:** `resolveRetrieval(…, "fail")`, unchanged.

### The player path

- The GM's `retrieve` op names the reacher, the craft and the intensity. **It no longer carries `outcome`.**
- The **engine rolls** `retrievalOdds` and applies `resolveRetrieval`. The GM narrates the result it's handed, the way
  every other rolled craft works.
- `authormode` keeps its explicit outcome (it's authoring, not play).

### The screen (SNG-653)

- Each depth shows the % from this function: *"Vessin · threshold 85% · near dark 55% · deep dark —"*.
- It replaces Can / Can't the moment this lands.
- Hovering shows the terms, the way a fight roll's breakdown does.

**Dials:** `rules.death.retrieval = { byDepth: {0: .70, 1: .45, 2: .20}, perRung: .10, surgePenalty: .15, pledge: .10,
heldOpen: .10, perTier: .05, floor: .05, ceiling: .95 }`.

---

## §3 — GATES I'D WANT

1. **The same number everywhere.** For a fixture reacher and dead, the world tick's odds, the player path's odds and
   the screen's number are **identical**, driven through each door.
2. **Today's behaviour survives where it should.** No watch at all gives seen = 0. An NPC retrieval with no pledge and
   no hold gives today's odds.
3. **The shape holds.** Adding a watcher never lowers `seen`, and each added watcher adds less than the one before.
4. **Refusal and willingness hold.** `willing: false` gives 0 whatever the bond, and a refused reach never rolls.

— Aevi, PO