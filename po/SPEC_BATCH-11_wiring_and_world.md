# BATCH-11 — The Wiring Contract, and four systems built on it

| | |
|---|---|
| **Status** | `ROUND 1 — awaiting CCode ROUND 2 substrate verification` |
| **Author** | Aevi (PO) · 2026-07-18 |
| **Direction** | Erik (PM), this session: multiplayer top-to-bottom review · Council of Mavens as a world body · the Coliseum as a way of life · waygates · intent verification for costly acts · *"I want this to be robust and lasting so we can lean on it in the future."* |
| **Governs** | SNG-145 · 146 · 147 · 148 · 149 · 150, and a patch to `SYSTEM_SPEC.md` (new §23 + Law 16) |
| **Reading order** | §0 pre-work → §1 the contract (everything else depends on it) → the five system specs → §7 CCode questions |

---

## §0 · PRE-WORK SCOPE VERIFICATION (Law 11)

Measured at HEAD `0ef3440`, this session, by direct read — not remembered.

| Claim | Measured | Path |
|---|---|---|
| Engine modules | **49** | `engine/*.js` |
| Abilities | **285** | `content/packs/**/abilities/*.json` |
| Locations / regions | **92 / 25** | `content/packs/*/locations/`, `core/rules/regions.json` |
| Shared scene files | **17** | `world/scenes/` |
| Engine exports with no external reference | **31 / 508** | mechanical sweep |
| `challengeTypes` distinct string values | **45** | across all abilities |
| `challengeTypes` / `challengeProfile` **runtime consumers** | **0** | exhaustive grep of `engine/`, `app.js`, `index.html` |
| Abilities missing `harmRung` | **140 / 285** | — |
| Abilities claiming combat in metadata with no offensive instruction in any rank `grants` | **71** | negation-aware scan |
| `party.js` scene write path | `pushOwnedFile` | `engine/party.js` |
| `pushMergedFile` (read-merge-write-retry) | exported, **unused by `party.js`** | `engine/sync.js` |
| GM prompt assembly | **implicit**, from ≥12 builders at **3 call sites** | `app.js:2600, 3474, 5297` |

**⚠️ SYSTEM_SPEC is drifted.** Its header certifies `38 engine modules / 137 abilities` verified at v1.8.26; HEAD has **49 / 285**. Per the document's own authoring rule, reported here. Any spec built on those header counts inherits a false premise.

**⚠️ Two PO claims retracted this session.** (1) *"Only 2 of 24 traditions fight by hitting things"* — deployed as design guidance; it is an observation about verb vocabulary and does not describe the world Erik wants. Retracted by PM correction. (2) *"skill\_battle / company / harmRung are implemented but the GM was never told"* — **false**. All three reach the model through builder functions (`abilitiesForGM` at `progression.js:610` injects `HARM:` into `abilityLawDetail`). The original check grepped `gm.js` only. Retracted by self-audit. Both errors share one shape — a partial surface treated as the whole surface — and **that shape is the reason §1 exists.**

---

## §1 · SYSTEM_SPEC PATCH — Law 16 + new §23, The Wiring Contract

### The problem, stated from evidence

Every capability we have shipped unreachable had a clean module, a documented API, a real consumer, and no declared path to the player's hands. `challengeTypes` is the extreme case: **45 distinct values, authored across 285 abilities, CI-validated, and read by nothing at runtime.** It passes every gate we own.

The root cause is structural, not attentional. The GM context is assembled **implicitly** in `app.js` from at least twelve engine builders at three call sites. Nothing enumerates it. Neither the PO nor CCode can answer *"does the model know about X?"* without reading `app.js` end to end — so both of us infer, and inference drops intent. The PO retraction in §0 is a live demonstration: the PO guessed wrong about her own game, in the direction of believing a working feature was broken.

Law 10 already solved this one layer down — the loader is a whitelist, and content outside the manifest fails the build. §23 applies the same medicine one layer up.

### Law 16 (proposed — PM ratification required)

> **16. EVERY CAPABILITY DECLARES THE PATH BY WHICH A PLAYER REACHES IT.**
> The GM context is a **declared registry**, not an emergent assembly. A capability ships complete when its whole chain is stated: engine → consumer → registered → reachable → contracted. Registration is what makes a capability real to the model, and the build verifies the registry against the code.
> *(Learned: `challengeTypes` — 45 values across 285 abilities, schema-valid, CI-green, and read by nothing. And the PO, auditing her own engine, could not tell which capabilities reached the GM without reading `app.js` line by line.)*

Stated as a requirement rather than a prohibition, per PM direction on positive framing.

### §23 — The Wiring Contract

**23.1 The reachability chain.** Every capability carries five links. It is *done* when all five hold — not when the code works.

| # | Link | Means | Verified by |
|---|---|---|---|
| 1 | **ENGINE** | the module and its exports exist | import graph |
| 2 | **CONSUMER** | something calls it | reference sweep |
| 3 | **REGISTERED** | it is declared in the GM Context Registry, so the model may propose it | registry ↔ code diff |
| 4 | **REACHABLE** | a player can trigger it — a UI control, or a GM offer | registry `reachedBy` |
| 5 | **CONTRACTED** | SYSTEM_SPEC describes it | spec cross-ref |

Links 1–2 are what we build and already check. **Links 3–4 are where intent is dropped, and nothing checks them today.**

**23.2 The GM Context Registry.** `engine/gm_registry.js` — one declared table, the single source of truth for what the model is told:

```js
export const GM_CONTEXT = [
  { key: "abilityLawDetail", builder: "progression.abilitiesForGM",
    carries: ["abilities","ranks","energy","harmRung"],
    reachedBy: "always", spec: "§7" },
  { key: "partyBlock",       builder: "party.partyBlockForGM",
    carries: ["co-present players","their last beats"],
    reachedBy: "shared-scene", spec: "§18" },
  // …one row per contributor. Adding a builder without a row fails the build.
];
```

`app.js` assembles the GM context **by iterating this registry**, never by hand-listing keys at three call sites. That single change turns "what does the GM know" from an archaeology problem into a file you read.

**23.3 The gate.** `tests/wiring_audit.mjs` (CCode's file — §21) joins `npm test`:

- registry ↔ assembly parity — a registered builder that never lands, or a landing builder never registered, **fails**
- every capability in SYSTEM_SPEC has a chain, and every link resolves
- orphan-export sweep (advisory — some exports are legitimately internal)
- the skill-integrity pass (§4)
- SYSTEM_SPEC count freshness — the drift in §0 must not recur silently

A working prototype exists and produced every finding in §0. It is **advisory until 23.2 lands**, because no static check can be exact while the assembly is implicit — which is the point.

**23.4 Authoring rule.** A spec is not promotable until it names, for each capability it introduces, the five links. Anything left blank is a declared gap, not an oversight.

---

## §2 · SNG-145 — Intent Confirmation for Costly Acts

**PM direction.** *"Sometimes the GM should ask if the player wants to kill the thing or just incapacitate it — or if a narrative is intended to leave an area via travel. Things that have time or world cost should somehow be verified for intent."*

**This is Law 9 extended into the play loop.** Law 9 (*nothing commits before the player confirms*) currently governs character creation only. Its logic — a multi-step choice accumulates in a draft, everything stays re-choosable, the player confirms, only then does state commit — applies identically to any in-play act with irreversible or world-scale cost.

### Verified premises

- **There is no general confirm primitive.** The `draft` occurrences in `app.js` are creation- and gambit-local UI state.
- **`offerPromotion` / `offerAcquisition` already exist** in the GM op contract (`gm.js:327`). SNG-145 **inherits that shape** rather than inventing one.
- **`harmRung` is already the kill/incapacitate spine** — `none · damaging · incapacitating · lethal` — read at `progression.js:610` into the GM's `HARM:` line. **140 of 285 abilities declare none**, so the gate is data-blocked on SNG-147 for half the corpus.
- **`moveTo` is contracted aggressively** — the GM is told it *MUST* emit it, because omitting it strands the player. The fix must not weaken that.

### Design — `offerIntent`

A new op, same family as the existing offers. The GM proposes; the engine holds the act in escrow; the player answers; only then does it commit.

```json
"offerIntent": {
  "kind": "harm" | "departure" | "irreversible",
  "act": "what is about to happen, in the fiction",
  "cost": "the time or world cost, stated plainly",
  "options": [ {"id":"incapacitate","label":"Put them down, not out"},
               {"id":"lethal","label":"End it"} ],
  "default": "incapacitate"
}
```

**Three triggers, and only three** — the gate must be rare or it becomes noise (the SNG-043/077 lesson: a hint that fires every turn is a hint nobody reads):

1. **`harm`** — the resolved act's `harmRung` is `lethal`, **and** the target is not already committed to death by the fiction. Not fired for `damaging`. Never fired twice for the same target in one encounter.
2. **`departure`** — a `moveTo` that leaves the current **region**, or carries `timeOps` above a threshold. In-location and intra-region movement never fires, so the always-emit discipline is untouched.
3. **`irreversible`** — a world-scale `ledgerEvent` with `impactsLocal: true`, i.e. a consequence that reaches another player.

**Defaults are lenient.** `default` is the *lower* harm rung and the *stay* option. A dropped confirmation, a closed tab, a timeout — all resolve to the gentler branch. The gate never kills by inaction.

**The floors are unaffected.** §17 floors are absolute and rating-independent; `offerIntent` never presents an option that crosses one.

### Chain

| Link | Value |
|---|---|
| ENGINE | `engine/intent.js` — pure escrow + resolution |
| CONSUMER | `app.js` `applyTurn` dispatch |
| REGISTERED | `GM_CONTEXT` row: `intentGate`, carries the three triggers |
| REACHABLE | inline choice card in the play surface |
| CONTRACTED | SYSTEM_SPEC §11 (GM Contract) + §23 |

### Verification (close on the symptom — §21)

Reproduce, don't re-read the diff: cast a `lethal` ability at a live NPC → gate appears, choose incapacitate → NPC survives and the chronicle records a sparing. Travel across a region boundary → gate appears with the time cost stated. Move within a location → **no gate**. Let a gate expire → the lenient branch resolves.

---

## §3 · SNG-146 — Multiplayer Hardening (phase 1)

**Fixes must land before phase 2.** Joint participation puts two players in one scene file trading acts through a writer that currently drops one of them.

### 146a — Law 7 violation, shared scenes *(FAIL)*

`pushSceneWithMerge` documents SHA-conflict merge-retry and does not perform it. It computes `next` from a scene read at T0, then calls `pushOwnedFile`, which does its own fresh `ghGet` immediately before writing. A concurrent write at T0.5 gives `pushOwnedFile` the *new* SHA, the PUT **succeeds**, and the other player's beat is gone. No conflict is raised, so the outer retry loop never fires and `mergeBeat`'s idempotency — applied to the stale scene — cannot help.

§18 contracts `pushMergedFile` for exactly this. **Fix:** route scene writes through it; `mutate` re-runs against the freshly-read remote on every attempt. The primitive already exists and is already correct.

**Verification:** two clients push a beat inside the same window; both beats survive. This is the acceptance test, not a code read.

### 146b — Scene lifecycle *(WARN, becomes FAIL as it grows)*

17 files, none ever closed. Add `closedAt` / `expiresAt`; a scene idle past a threshold closes; closed scenes archive out of the join path.

### 146c — Scene discovery *(WARN)*

`listScenesAt` lists the entire `world/scenes` directory, filters by prefix, then takes `.slice(-5)` — joinable scenes are silently dropped as the directory grows, and cost scales with all scenes ever created. Index the open scenes; the join path must not depend on directory size.

### 146d — `personalArc` reachability *(WARN — verify by hand)*

The only capability still flagged after the registry-aware sweep. Confirm whether it reaches the play-loop GM or only the generation path. **This is a CCode ROUND 2 question, not a PO assertion** — see §0.

### 146e — Phase 2, joint participation *(design only this batch)*

`setEncounterState` is explicitly *witnessed, not joined*. The Coliseum (§6) needs two players inside one contest. Scoped here, specced after 146a–c close green.

---

## §4 · SNG-147 — The Skill Integrity Pass (recurring)

**PM direction:** *"something we can run occasionally — keep it up to date."* So it is a **standing check in the audit suite**, not a one-time cleanup.

### 147a — `challengeTypes` has no reader *(FAIL, and the largest single finding)*

45 distinct values across 285 abilities, in two vocabularies — an uppercase canon (`FIGHT` 78, `SOCIAL` 55, `INVESTIGATE` 63…) and a lowercase sprawl (`combat` 19, `social` 28, `tactical` 24, plus `medical`, `magical`, `legal`, `morale`, `ranged`…). **No runtime consumer exists.** It is validated and inert.

Two honest paths, and this is a **PM/CCode decision, not a PO one**:
- **Wire it** — `challengeProfile` becomes a real resolution input, and the vocabulary collapses to the twelve-value canon.
- **Retire it** — delete the field; stop paying authoring cost for data nothing reads.

**Either is defensible. Doing neither is not** — a field with no reader teaches every future author that authoring it matters.

### 147b — `harmRung` completeness *(WARN → gate)*

140 of 285 declare none, against a canonical four-value ladder that **is** read (`progression.js:610`). SNG-145's harm gate cannot fire for those abilities. Backfill (PO/content lane), then make `harmRung` required and enum-checked. *(The enum is four words; the PO red-gated the suite on 2026-07-18 by inventing thirteen values for it. Machine-checked from here.)*

### 147c — Combat claimed but not taught *(FAIL — the PM's reported bug)*

**71 abilities** declare combat in metadata (`functions: [strike|break|hinder]`, `challengeTypes: [FIGHT|DUEL|DEFEND]`, or `challengeProfile ≥ 2`) while **no rank `grants` tells the GM how to use them that way.**

**Palework is the reported instance and the exemplar.** `functions: [strike, hinder, foresee]`, `FIGHT: 2`, and `notFor` explicitly concedes *"it EASES an end and it can BRING one."* But the GM receives `CAN: <grants>` / `CANNOT` / `NOT FOR` / `HARM` — and all three rank-grants describe easing, forensics, and stillness. Rank 1: *"cannot kill the healthy."* Rank 3: *"never raises, never forces."* Every rank states a refusal; none states the method. The permission to end lives only inside the limitations paragraph. **The model reads mercy as the identity and offense as a caveat, so the player can never land the blow the sheet promises.**

**Rule:** *if an ability can be used to fight, a rank `grants` says how — what it does, at what cost, with what tell.* Per the PM ruling, this explicitly includes striking with **power** — nanite-derived or wild — not only physically. Offense is not the property of two traditions; it is available across the circle in each tradition's idiom.

**Content lane (PO).** Rewrites `grants` on 71 abilities, Palework first. Authored locally, validator run, then shipped — per the standing authoring discipline.

### 147d — Standing audit

147a–c become permanent checks. A new ability that claims combat without teaching it, or omits `harmRung`, or uses a non-canon challenge type, fails the build.

---

## §5 · SNG-148 — Waygates

**PM ruling: both.** Gate-to-gate for the competent; everyone else is routed to the standard destination.

- **The network.** Waygates are content (Law 2) — a `waygate` flag on a location plus a `waygateTier`. **The Crossing is the default hub**, earned rather than decreed: it is already a region, and `the_great_coliseum.connections` already names `the_crossing`.
- **Competence is BOTH, and they compose.** *Knowledge* — the destination gate has been discovered by this character. *Skill* — a navigation-facing competence governs how far and how precisely they can aim. Discovery without skill reaches the hub; skill without discovery reaches the hub; **both** reaches the named gate. Everything else lands at the standard destination, which is a routing outcome and never a failure state.
- **Cost.** Transit carries time cost, so a cross-map jump is a `departure` trigger under SNG-145.
- **Why this shape.** It makes the Crossing the natural center of the world without a rule declaring it so, and it turns leaving your starting region into an early, legible goal.

**Chain:** engine `waygate.js` · consumer `worldmap.js` + travel dispatch · registered `waygateBlock` · reachable — map control + GM offer · contracted §9.

---

## §6 · SNG-149 — The Great Coliseum

**PM direction.** Not only spectacle — a way of life most peoples engage in, contest *and* skill challenge. The Blue Adept structure from Proton.

### The mechanism

Neither competitor picks the contest. A **4×4 grid**: one picks a row, the other a column, **blind and simultaneous**; the intersection is the contest. A second grid inside the cell narrows to the specific challenge the same way.

**PM ruling on axes — the categories are drawn from the competitors' own backgrounds.** Each fighter's history contributes categories that are *theirs*; the grid crosses them; the intersection belongs to neither. This is better than a fixed or randomly-pooled grid on three counts: every contest is personal to both parties, no champion can drill a memorized board, and the cell where your history meets a stranger's is dramatically the most interesting square on the grid.

`personalArc.arcSeed(character)` is the natural source — which would also make §3's flagged-unreachable module load-bearing. **CCode ROUND 2 must confirm `arcSeed` carries category-usable material** before this is promoted.

### Why it makes the Coliseum a way of life

Under a blind grid a champion must be **complete** — you cannot take a title on your strongest cell, because you will be pulled into your weakest. That gives every people a standing reason to develop every function family, in their own idiom, continuously. The lore already asks for this: *"where a Blazeborn and an Umbral can face each other and NOT annihilate each other, because here it is a game with rules and an audience, and both walk out."* **The grid is those rules.**

Skill challenges and combat are the same structure at different cells — which is what makes participation universal rather than martial.

**Design canon** (grid mechanics, category pools, the Coliseum's standing in the world) is authored to `content/packs/**` per **Law 15**, never to the backlog. `the_great_coliseum.json` already exists as the anchor.

**Depends on:** SNG-146e (two players in one contest).

---

## §7 · SNG-150 — The Council of Mavens

**PM direction.** The world council — a body left over from what the UN evolved into. A representative from most traditions, plus Epic Hero NPCs. PCs may eventually join. Appears in the larger quest arcs, and supplies smaller quests through message boards.

- **Composition.** One seat per tradition (most, not all — absences are political facts and quest seeds), plus Epic Hero NPCs. `legends.js` exists with an orphaned `LEGEND_BEATS` export; **CCode ROUND 2: is `legends.js` the Epic Hero layer, or a separate concern?** If it is, an orphan becomes a spine.
- **Seat.** At the Crossing — which puts the Council, the Coliseum, and the waygate hub in one place, and gives the world a center that three systems independently want.
- **Two quest surfaces.** *Standing* — the Council appears in the larger arcs as a body with interests. *Ambient* — message boards at Council-reached locations issue small commissions. The board is the delivery surface; `quests.js` already resolves structured quests with durable `effects[]`.
- **PC accession.** Long-arc, gated on renown. `reputation.js` already runs renown→band (SNG-138), so the ladder exists.
- **Council standing is not a reward for winning.** A body that only recognizes strength is a fight club with paperwork; the Coliseum is already the arena. Accession should read on breadth and consequence.

---

## §8 · QUESTIONS FOR CCODE — ROUND 2

Substrate verification requested before promotion. Where the PO has asserted rather than measured, it is marked.

1. **Registry feasibility (§1).** Can `app.js` assemble the GM context by iterating `GM_CONTEXT` at all three call sites (`2600 / 3474 / 5297`), or do they diverge enough to need distinct registry views? This is the load-bearing unknown for the whole batch.
2. **`challengeTypes` (§4a).** Confirm zero runtime consumers. Then: wire, or retire? CCode's call on cost; PM's on design.
3. **`personalArc` (§3d, §6).** Does it reach the play-loop GM? Does `arcSeed` carry material usable as contest categories?
4. **`legends.js` (§7).** Epic Hero layer, or unrelated? Is `LEGEND_BEATS` orphaned-dead or orphaned-pending?
5. **`offerIntent` (§2).** Does the existing `offer*` dispatch generalize, or does escrow need its own path? Where does a mid-turn player answer re-enter `applyTurn`?
6. **`moveTo` (§2).** Can a departure gate fire without weakening the always-emit contract at `gm.js:79`?
7. **`stateOps`.** Present in the op key list at `gm.js:327`; §22 records it as unbuilt. Retire from the contract, or build?
8. **Sequencing.** PO proposes §1 → SNG-146a–c → 147 → 148 → 146e → 149 → 150. Contest?

---

## §9 · SEQUENCING AND WHY

§1 first — it is the thing that stops us re-accumulating this, and every system below is a new capability that will need registering. Then 146a, because phase 2 and the Coliseum both put two players in one scene file, and the writer currently drops one of them silently; fixing that after would mean fixing it live under load. Then the skill pass, which unblocks SNG-145's harm gate on half the corpus. Waygates are near-standalone. The Coliseum needs joint participation. The Council needs the Coliseum's world-standing to mean something.

**Only Aevi closes, and only on the reproduced symptom — never on the ship report.**

*— Aevi (PO), ROUND 1. Every count in §0 measured at HEAD this session. Two PO claims retracted above; both are in the record rather than overwritten.*
