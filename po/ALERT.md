# PIPELINE ALERT — Singularity

> **This file carries CURRENT STATUS ONLY.** History lives in `po/results/*` and the graph. *(Per SNG-071: the old 115KB append-only ALERT is archived at `po/archive/ALERT_20260712.md`. Aevi kept appending to it all session and made it a wall CCode had to excavate. That is the sediment problem, and this is the fix.)*

**HEAD:** v1.8.29 · **Authoritative spec:** `SYSTEM_SPEC.md` v2.0 (`round-2-complete`) · **Active build spec:** `po/SNG_UPDATE_v1.9.0.md`
**Process:** SNG-071 two-round cycle. Aevi authors ROUND 1 → **CCode substrate-verifies (ROUND 2)** → Aevi amends + promotes → CCode builds → `complete_pending_review` → **only Aevi closes.**

---

## ✅ SHIPPED (awaiting Erik's leg / Aevi close)

| | Ship | Notes |
|---|---|---|
| **SNG-BATCH-10** | v1.8.22–25 | Domain gates **engine-enforced** (antipode CLOSED) · starting locations · structured quests + the missing loader · **Content CI** — *which caught `provides.items` (19 defs incl. the Waystaff) never loading, on day one.* |
| **SYSTEM_SPEC v2.0 ROUND 2 + `effects[]`** | v1.8.26 | Quest outcomes now apply machine-readable deltas. *"Veilwright: lowered" is applied as **−1** instead of silently dropped.* **BOUNDARY-1 CLOSED.** |
| **SNG-056** | ✔ | Location-header desync |
| **SNG-074** | ✔ | Dev off-switch — Erik has a clean player view again |
| **SNG-075** | ✔ | **Encounters now fire in narrative play** (bound to narrative time, not map buttons) |
| **SNG-076** | v1.8.32 | Authored prose renders in FULL (was cut mid-word); model output clamps on a word boundary. |
| **SNG-070** | v1.8.30 | **GM corrections — the game self-heals.** A bounded `stateOps` (repair, not wish): fix a wrong field/domain/entity/quest/location, engine-refuses any advance, every change logged. |
| **SNG-052** | ✔ | Adult-gate checkbox persistence |
| **SNG-067/068/069 (P1)** | v1.8.33 | The commit boundary — creation no longer commits before confirm. Prologue: abilities reconcile vs CONFIRMED domains (grandfather + primary-grant), background is CHOSEN (categorized), sidebar shows only met companions. |
| **SNG-077** | v1.8.34 | Gambit hint no longer constant — the GM declares `gambitApt`; the engine decides show (dismissal sticks + cooldown). |
| **SNG-066** | v1.8.35 | In-game ⚑ Feedback — one tap; version/screen/character/location/last-turn/errors auto-attach; append-only to `po/feedback/`, queued if sync off. |
| **SNG-080** | v1.8.36 | The world must PUSH — quiet-turn pacing (escalating, register/danger-aware, tightens a live quest thread); danger graduated + findable on the map. |
| **SNG-073** | v1.8.38 | **The Skill Wheel** — the skill tree IS the great circle: tiers radiate inward, folk at centre, precursor outside, cross-pole braids as diameters, antipode struck through. |
| **SNG-081** | v1.8.39 | **The GM keeps the player's words.** Scene history is a dialogue now, not the GM's monologue — the deepest continuity bug, fixed. |
| **SNG-082** | v1.8.40 | World map: pan/zoom/fit/centre-on-me + real data-driven terrain (region hulls, palettes, Axis-Gate spine roads, deliberately-wrong regions). |
| **SNG-083** | v1.8.41 | "Show what you know" — the map is an intelligence board: met people solid, heard-of threads (Fendt, the Edge District, news) dimmed where they live; empty state. |

---

## ✅ SNG-081 SHIPPED v1.8.39 — the GM keeps the player's words (scene history is a dialogue now)
```js
// app.js:2211 — the ONLY thing pushed to turn history
sceneTurns.push({ summary: turn.sceneSummary, narration: turn.narration || "" });
```
**The turn record stores ONLY the GM's own summary + narration. The player's input is NEVER stored.** The "conversation history" the GM receives is **a MONOLOGUE OF ITS OWN PROSE.** The player's words reach it for **exactly one turn** (`exactWords`, in the uncached tail) — and if that turn's narration doesn't catch the nuance, **it is gone forever.**
**Erik's romantic overtures were not refused — the GM was BLIND to them.** Its reply (*"none have been played yet"*) was **TRUE from its view of history.** It only ever sees what it said.
**⚠️ THIS IS NOT A ROMANCE BUG. It is a total-continuity bug.** Every nuance the player puts in their own words dies after one turn: **a promise · a name · a tone · a joke · a threat · a plan · a flirtation · a stated intention.** The GM can only see the parts of the player it happened to echo back. **This is almost certainly the root cause of the general "the GM doesn't respond to what I actually do" feeling** — and it silently breaks Design Law 4 (permanence) and the GM's own rule 13, because **the player's half of the scene has no permanence at all.**
**Fix:** store `{ player: exactWords ?? label, summary, narration }` · render history as a **real DIALOGUE** (`YOU: … / GM: …`) · **keep the player's words in FULL** — if anything is clamped, clamp the GM's side, **never the player's** (ties SNG-076) · persist in the save so a reload doesn't lose the player's half · audit every `recentTurns` call-site (1976, 2571, 3042, 3509 — they all inherit this).
**⚠️ SNG-012 REGRESSION — ERIK REPORTED THIS ON 2026-07-06 AND IT WAS NEVER FIXED.** Aevi specced it as **SNG-012, HOTFIX, "do FIRST"** — and specced only HALF of it: *"raw text must reach the narration GM verbatim"* covers the **current turn** (`exactWords` — SHIPPED, 2 refs). **It never specced that the player's words must persist in turn HISTORY** (0 refs at HEAD). **A perfect build of SNG-012 would still have left this bug — the SPEC was the defect.** SNG-012 also has **no results file: never closed, never verified.**
**This is the SECOND time in two days that CCode built Aevi's spec exactly and the bug survived** (the first: SNG-043 → SNG-077). **Aevi verified the fix SHIPPED and never verified the BUG WAS GONE.** New standing rule in SYSTEM_SPEC §21: **CLOSE ON THE SYMPTOM, NOT ON THE SHIP** — no item closes until Aevi reproduces the original report and confirms it no longer reproduces.

*The world remembers everything — facts, codex, places, chronicle, shared canon across characters — and forgets the player. It has been listening to itself the entire time.*

## 📜 SESSION_FINDINGS_20260707 RECOVERY (Erik pointed Aevi at it 2026-07-12) — **design canon was LOST and is now RESTORED to content**
**Two load-bearing designs were authored 2026-07-06, lived ONLY in `SPEC_BACKLOG.md`, and were destroyed by a backlog rewrite** (the number SNG-049 was then reused for something else). **Recovered and canonized where they survive:**
- **`content/packs/core/rules/gambit_design.json`** — **ERIK'S GAMBIT DEFINITION.** *A gambit is CONNECTED CHALLENGES forming a whole, each solvable MULTIPLE WAYS, PLANNED ACROSS before running. **The ELEMENTS define it, not the step count. FEWER STEPS ARE HARDER (less slack). A FALLBACK ADDS STEPS — the gambit GROWS mid-run.*** Live-validated (Commission House: the primary line failed on a 51 and the gambit survived on a stacked fallback at 79 — a single-path plan dies there). **+ the 3 proven shapes + the GM rule Erik flagged TWICE: HOLD THE PLAN-LEVEL VIEW AGAINST THE PUZZLE'S STEPWISE PULL** (the GM keeps collapsing 'declare plan → resolve within' into turn-by-turn 'now what?').
- **`content/packs/core/rules/challenge_design.json`** — the lost multi-mode design. **Erik's correction to a REAL BIAS: the gambit keystones (reframe/seam/question-the-clock) are HIS cognitive style, NOT universal rules.** Encoding them would hardcode one play style and silently punish players who think differently — *Brooklyn, Courtney and Clara do not think like Erik, and the game must not require them to.* Challenges PROVIDE ≥3 mode-paths (direct · subtle · social · rule-bending · attrition · preparation · knowledge) **+ an OPEN GENERATIVE SLOT** where an unenumerated approach is judged on its merits and REWARDED. **⛔ OBSERVED LIVE: the AI GM DRIFTS TOWARD THE CURRENT PLAYER'S COGNITIVE STYLE and quietly narrows their options — the GM prompt MUST actively offer the modes the player is NOT using.**
**⚠️ THIS SUPERSEDES SNG-077.** Aevi guessed at 'gambit-apt' twice while **Erik's definition already existed**: *gambit-apt = CONNECTED challenges, EACH with multiple solution paths, where planning ACROSS beats reacting one at a time.* Not 'multi-obstacle'. **CCode: use `gambit_design.json → gambitApt`.**
**🐛 THREE LIVE BUGS the audit exposed (verified at HEAD):**
1. **ENT GATING — `progression.js effectiveLevelReq` STILL hardcodes the valley/harmonic/radiant triangle** (lines ~127–144) while **`origins.json` now has 27 origins.** A non-valley origin **can never take resonant skills.** Two gating systems now coexist (this + SNG-055's ring). **Retire the hardcoded triangle; gate off `origins.json` + the ring.**
2. **`gambit.completionBonusXp` is NOT READ** (0 refs in gambit.js) — the engine hardcodes a literal instead of reading resolution.json.
3. **SNG-038 (simultaneous party turns) = 0 refs — and it is a REQUIREMENT, not a nice-to-have.** *The Silent Door puzzle CANNOT be expressed round-robin; the GM twice collapsed a called-for simultaneous 3-channel read.* **Priority-bump it.**

## ⛔ NEXT — BUILD IN THIS ORDER (Erik-directed; supersedes CCode's earlier queue)

### 1. ✅ SNG-076 SHIPPED v1.8.32 — authored prose renders in full; model output word-boundary-clamped
`quests.js` still holds `slice(0, 240)` / `slice(0, 200)`. **Quest stakes die at *"…and Ove…"*; the away-digest is cut at *"the district acco ("*.**
**The conceptual bug:** authored content is being clamped **as if it were untrusted model output**. It isn't. Quest premise/stakes/objectives/outcome-narration come from content packs — deliberate, finite, and meant to be read. **Authored content renders IN FULL; model output is clamped.** And every clamp is a raw `slice()` that cuts mid-word — even where clamping is right, **the cut is wrong** (word-boundary + real ellipsis + expandable, never destroyed). **The prose IS the game.**

### 2. ✅ SNG-070 SHIPPED v1.8.30–31 — GM corrections (stateOps), incl. ability-strip for the Silas case
**Erik's necromancer, Silas Weir, is stuck** with Blazeborn/Lattice/Numinous abilities and the wrong domains. **P1 (the commit boundary) only fixes creation going FORWARD — it cannot repair a character who already exists.** A GM correction is the *only* mechanism that can, and without it **every mis-created character is scrap** — unacceptable in a game his family is about to play.
*Scope: correct domains · re-derive abilities against them · fix background · **strip abilities the character should never have had**. Grandfathering an earned ability is the **player's choice**, not an engine default — Erik must be able to say "take the Blazeborn work off him; I am an Ashwarden" and be obeyed.* Bounded by **Law 14: a repair is not an advance** — no XP, no levels, no unearned power. Every correction **logged to the ledger**.
*(Silas is an Ashwarden — the death pole. His kit is authored and waiting: **Palework · Deathsense · Wither · Death-Ward**, and the braid **The Counted End**.)*

### 2b. ✅ SNG-077 SHIPPED v1.8.34 — GM declares gambitApt; heuristics dropped; dismissal sticks + cooldown
**SNG-043 Part A SHIPPED CORRECTLY — Aevi's SPEC was the bug.** `isGambitApt` is exactly as specced (`>=3 choices && (planTagged || threads>=3)`), but **both disjuncts fire on ordinary scenes**: `plan` is 1 of 10 generic approach tags (a *style*, not a structure), and `scene.threads` are **conversational** (*"a question hanging"*) — any decent social scene has three. **Aevi keyed the hint on style + texture instead of the gambit condition: multiple OBSTACLES that must be SEQUENCED.**
**Fix — stop guessing, let the GM say so:** add a GM field **`gambitApt: true`**, emitted ONLY for a genuine multi-obstacle objective where ordering the approach would matter (*"a rich conversation is NOT gambit-apt; a careful approach to a SINGLE obstacle is NOT gambit-apt; most turns, omit it"*). Then **`isGambitApt = turn.gambitApt === true`** — **drop `planTagged` and the thread-count entirely.** Law 1 holds: the GM proposes, the engine still decides (cooldown · dismissal · sanity check). **Make dismissal actually stick for the scene** + an N-turn cooldown. **Bias hard toward silence** — a hint shown too rarely costs a missed feature; one shown constantly costs the player's attention entirely, and Erik is already there.

### 3. ✅ P1 SHIPPED v1.8.33 — the commit boundary (SNG-067/068/069 were one defect; prologue path fixed)
`grep` at v1.8.23 showed **zero** commit-boundary functions. Draft → confirm → commit. Nothing writes to the character until the player says yes; everything stays re-choosable. `[CCODE: 16 'draft' refs at HEAD — is this partially shipped? confirm]`

### 4. ✅ SNG-066 SHIPPED v1.8.35 — feedback (auto-captured context: version · character · domains · location · last GM turn · console errors). Turns Erik's screenshot-archaeology into one-click reports.

### 5. ✅ SNG-073 SHIPPED v1.8.38 — The Skill Wheel (supersedes SNG-054 Ph2). The skill tree **becomes** the great circle: tiers radiate inward · folk crafts at the centre · precursor outside the ring · **cross-pole braids drawn as diameters through the centre** · **antipode dark and struck through.**

### 6. ✅ SNG-082 SHIPPED v1.8.40 — world map: pan/zoom + real terrain. *(Erik: "this is really awesome... but I can't move the map around or zoom in.")*
**Pan/zoom = 0 refs at HEAD** — the skill graph got it, the map didn't, and the map now holds **92 locations across 24 regions**. Wheel/pinch zoom · drag-pan · fit · reset · centre-on-me.
**Terrain content is AUTHORED and at origin:** `content/packs/core/rules/regions.json` — 25 regions with `terrain · elevation · palette · features · water · visualIdentity`. **Data-driven, NOT an authored image** — terrain derives from dispositional identity, so BATCH-9-generated locations inherit the right ground (an authored map picture would freeze a world that grows). Region hulls from `map.x/y` · **roads = `connections`, with the Axis Gate's twelve as the map's spine** · the Echo River and THE SEA as the great water landmarks · the Umbral Depths render BELOW the map.
**⚠️ Three regions must LOOK WRONG on purpose — do not clean them up, the failure IS the content:** the Pattern Reach *resists mapping* · the Veiled Reach's map *lies* · the Numinous Reach *loses confidence*. **And four borders are EXPANDING:** the Blaze, the Churn Edge, the Scouring, the Ceaseless.

### 6b. ✅ SNG-083 SHIPPED v1.8.41 — "Show what you know" (people + rumours, empty state). *(Erik: "I can't tell any difference.")*
It toggles an overlay sourced from **`npcRegistry`** — people **MET** — and **Silas has met nobody**, so it renders zero markers and **never says why**. Two defects: **(A) no empty state** (a toggle with no visible change is indistinguishable from a broken button). **(B) THE REAL BUG — it implements only half of SNG-046 Ph1**, which specced **discovered (solid) AND heard-of (dimmed)**. **Erik HAS heard of things** — his away-digest has been feeding him **Fendt**, **Grael's Edge District**, the **water crisis**, **Usnea's expedition**. **Those should already be sitting dimmed on his map.**
**Fix:** source the overlay from the **CODEX**, not `npcRegistry` · place heard-of entities at their resolvable location (the digest already tags *"(near millbrook)"*) · add the empty state · **cheap + high value: faint relationship edges** (Fendt → the Edge District → Grael — *the conspiracy he hasn't chased yet, made visible*) · rename to **"Show what you know"** — it's people *and* rumours.
*This turns the map from a travel tool into an intelligence board: the away-digest stops being flavour text and becomes something you can SEE.*

### 7. **SNG-058 — party leader.**

---

## 📌 SPEC CORRECTIONS — PROMOTED (Aevi accepts all four; the draft was wrong)
CCode's ROUND 2 caught Aevi in four places. **All accepted; `SYSTEM_SPEC.md` is authoritative as corrected.**
1. §4 novel bonus is **8**, not 3.
2. §11 **`item ops` and `stateOps` do not exist at HEAD** — items ride `characterDeltas.inventoryAdd/Remove`.
3. §3 `canon.js` and `sync.js` are **separate modules**.
4. **§9 — ⚠️ THIS IS A DESIGN GAP, NOT A TYPO. The spec claims a place's disposition pulls a character's spectrum over time. IT DOES NOT.** Character drift comes only from the *action's own* axes; `affinities.js` is a **per-roll bonus with no write-back**; there is **no decay routine**. **The location→character bridge is UNBUILT.** → **See "Erik's call" below. Do not build it until Erik rules.**

---

## ✅ SNG-080 SHIPPED v1.8.36 — **THE WORLD MUST PUSH** (Erik: *"I haven't gotten into ANY fights... I wanted more things to start happening"*)
**Diagnosed: Erik has never left the safest place in the world.** Millbrook is a farming village and **ZERO fight-capable encounters are eligible there** (the 8 that can fire: 3 beneficial · 2 benign · 2 beautiful · 1 theft). That is CORRECT for a village. **The defect is that the world is REACTIVE — it waits for him.** *(Also `millbrook.json` has NO `dangerLevel` field → floored to the gentlest tier. CI should require it.)*
**Fix — three pressures, all using systems that already exist:** (1) **THE VILLAIN ACTS ON A CLOCK.** Grael's thread is LIVE in Erik's world (Fendt, the ledger, the water crisis) and **nothing is firing it.** If Erik ignores it, Grael should WIN — another name on the board, the water worsens, and **it arrives at him.** *(The quest's own "you walked away" outcome already specifies this.)* (2) **THE WORLD REACHES HIM** — `worldtick` already has `impactsLocal`; a propagating consequence must sometimes surface as a **SCENE**, not a line in a digest. **Riffraff arrive. A messenger finds him. A body turns up.** (3) **QUEST HOOKS COME TO HIM** — `questSeeds` woven "when the scene needs drive" is too passive.
**THE PACING RULE (the actually-missing thing): track QUIET TURNS; after a threshold, THE WORLD ACTS** — rumor → someone with a problem → a hook that won't wait → something arriving. **The player must never have to ask the world to be interesting.** Pressure respects the place: *in Millbrook that's a frightened neighbour, not a bandit ambush.* **And make danger FINDABLE** — colour `dangerLevel` on the map; the Disputed Zone is on his doorstep and nothing has invited him in.

## ⭐ SNG-079 — **AXIAL MISALIGNMENT IS THE DIFFICULTY GATE** (Erik-designed)
*"Some regions are not really able to be explored until you are powerful enough to overcome the disadvantages due to axial misalignment."* **Half of this already exists** — spectral fit is ±25 and every location carries `poleIntensity` (0.05 at The Crossing → **0.98 at the Blaze / Unlit Deep / Grand Lattice**). **It just doesn't BITE**, because base chance is so inflated (SNG-078) that −25 barely dents it.
**The model:** misfit penalty scales with **`poleIntensity` × ring-distance from that place's pole** → **your ANTIPODE region is the hardest place in the world FOR YOU, and it's a different place for every character. The map becomes a PERSONAL difficulty map.** Widen the spectral band so it can gate · lower base chance + widen difficulty (SNG-078) or no gate can hold · **and when something is beyond you, SAY SO** — *"this place is against you in every way you are"* — a refusal that explains itself is a signpost; a silent 5% is a mystery.
**Why it's right:** *you don't unlock a region — you become able to survive it.* And you become able by growing, by **changing what you are** (the §9 drift question), or by **BRAIDING** — which makes the cross-pole braid the literal key to the far side of the world.

## 🚨 SNG-078 — **THE GAME CEILINGS OUT AT LEVEL 5** (Aevi, analytic from `resolution.json` @ HEAD)
| Difficulty | hits the 95% clamp at |
|---|---|
| Routine (0) | **level 2** |
| Hard (15) | **level 3** |
| Very hard (30) | **level 5** |

**Cause:** `attributeMultiplier: 20` vs `attributeSoftCap: 4` → **an attribute of 4 is 80% ON ITS OWN**, before skill (+10/pt), rank (+5), equipment (+10), companion (+10), spectral fit (+25). Difficulty tops out at **30**. A level-5 character with gear + companion + alignment sits at 95% on *very hard* with **~45 points of unused headroom**.
**And level 100 does not exist:** `subAttributeCap: 20` + `maxAbilityRank: 3` → **mechanical growth stops ~level 20.**
**Where tension DOES survive:** modifiers only — against-grain (−25), exhausted (−10), novel (−15) drop a 95 to 45. *The game is tense when you're misaligned, tired, or reaching past what you know — and a formality otherwise.*
**⛔ ERIK'S CALL. Aevi will NOT tune balance numbers unilaterally.** Levers: lower `attributeMultiplier` (20 → ~8-10) · widen/scale the difficulty band (0/15/30 is too narrow to bite) · scale challenge with level · make the soft cap bite harder.
**🔧 CCode: `tests/balance_sim.mjs`** — headless sim (the engine is pure), lvl 1 → true cap, reporting: chance distribution × difficulty × alignment · **energy economy** (recovery is ACTIVE-ONLY; `regenPerRest` is dead) · XP pacing (10,000 xp ≈ 2,000 actions for lvl 100) · **the +20 discovery bonus** (Erik parked it for exactly this) · domain-access economics · are the **cross-pole braids** actually attainable · encounter danger vs a character who auto-succeeds from level 5. **Run it under `npm test` as a regression gate** so nobody silently re-breaks the curve.

## 🎯 ERIK'S CALL (design, not a bug)
**Should a place CHANGE you?** The world's premise is that its physics *is* disposition — and standing a long time in the Redline, or the Cogitarium, or the Unlit Deep, *ought* to leave a mark. Today the place **taxes or favours a roll** and nothing more; it never shapes who you become. **The mechanic Aevi documented does not exist, and Aevi should not have claimed it did.** Building it is a real feature (a slow spectrum-pull toward a place's poles, with decay), and it would make "geography = disposition" true of *people*, not just terrain. **Erik decides whether that is a feature or a road not taken.**

---

## 📋 Owed
- **Aevi:** `po/OPERATIONAL_FLOWS.md` · thin regions (riven_marches / somatic_reaches / unspooling want ~6 locations) · retire `SPEC_BACKLOG.md` (180KB) as a primary surface.
- **CCode:** the §22 debt list it surfaced (slugify in the wrong module · worldtime MODE is per-player vs "one clock" · `newEncounter` stashes-not-activates · quest stage-conditions advance manually · `narration`↔`effects[]` drift has no linter · dead `regenPerRest` key · `parse_probe` can't reach `boot()`).
- **Erik:** preview-legs (`po/PREVIEW_LEGS.md`) · the §9 drift call above · GH Action for `npm test` (BOUNDARY-2: the CI is a local gate, and a gate that only fires when someone remembers to run it is weak against exactly the failure it exists to prevent).

## ✅ SNG-085 — REPAIR PANEL + GM "DO THE DOABLE PART" — SHIPPED v1.8.43 (complete_pending_review · Aevi closes)
**Built (`70f1b1f`, results `po/results/20260712_SNG-085.md`):** (B) a **🔧 Repair character** panel on the Character screen exposes `engine/corrections.js` DIRECTLY — domains · background/origin/form · strip an ability off the wrong pole · remove an unmet companion · unstick a quest. Same engine, same guardrails, same ledger; it cannot argue. Live-verified the Erik test (strip Prism Sight + primary→Ashwarden → abilities=[sonic_resonance], skillPoints untouched, both changes logged). (A) Root cause found: `[to the GM]`→`gmAsk` is **structurally stateless** (returns only text, never processes `stateOps`) — so it now POINTS repair asks to the panel; turn-path rule 63 gains DO-THE-PART-YOU-CAN. **Note:** Aevi's own hand-repair of Silas (`e02b9dd`) is exactly the workflow this replaces. **Open items after close:** panel omits `reanchorLocation`/`fixCodexFact`; log has no one-click undo yet (both cheap follow-ons).

<details><summary>original report</summary>
**SNG-070 IS BUILT AND CORRECT.** The prompt *explicitly* authorizes it: *"an ability they should never have had (e.g. derived from the WRONG domain at creation — **strip it with `removeEntity` kind `ability`**)"*, and **`correctDomain` works.** **The GM refused anyway.**
**(A) It conflated a STRIP with a SWAP.** Erik said *"the other two can be **replaced** by something else"* → the GM heard *grant*, and granting is correctly refused. **But stripping is allowed**, and the right loop is: **strip the wrong abilities → breadth capacity frees → the PLAYER re-picks with their own skill points.** That fully honours *power comes from play*. **→ GM RULE: DO THE PART YOU CAN, then say what you can't and what the player should do instead. A blanket refusal where a partial repair was available is worse than an over-eager fix.** *(It should have set primary → **ashwarden**, stripped Lightsense + Numen-Sense, KEPT Order-Sense as asked, and told him his point was free.)*
**(B) ⛔ THE REAL FIX — THERE IS NO UI TO REPAIR A CHARACTER.** **A player must not have to NEGOTIATE WITH A LANGUAGE MODEL to fix a bug the game gave them.** `engine/corrections.js` is sound, validated, logged, reversible. **Expose it directly** as a **Repair panel**: domains · background/origin/form · **strip abilities never chosen** · remove an unmet companion · unstick a quest. **Same engine, same guardrails, same ledger — the UI simply cannot ARGUE.** The GM path stays for in-fiction repairs; the UI path is for when the player just needs it fixed.
**Also: the meta-channel is the RIGHT place for a repair request.** Erik prefixes *"[to the GM]"* and the GM treats it as suspect. **Repair requests BELONG out-of-fiction** — welcome them there.
*Aevi: SNG-070's refused-list said 'abilities' while the widened scope said 're-derive abilities'. **My spec was contradictory and the GM took the conservative reading. Third time this cycle a correct build against my ambiguous spec produced a live bug.***
</details>

## ✅ SNG-086 — "DESCRIBE YOUR CHARACTER" (THE THIRD DOOR) — SHIPPED v1.8.44 (complete_pending_review · Aevi closes)
**Built (`e33c1b7`, results `po/results/20260712_SNG-086.md`).** Free text in → a placement on the great circle **with REASONS, the COST NAMED, and what it CLOSES said out loud.** `gm.js suggestBuild()` proposes poles + why + cost prose ONLY (handed real ids); `sanitizeSuggestedDomains` (Design Law 1) VALIDATES every id and the geometry itself (secondary ≠ primary/antipode; tertiary a ring-neighbour of secondary; closed poles excluded); the reveal computes each **"Closes X" antipode from the ring, not the model**, lights the chosen poles + **darkens the antipode** (the dashed axis), states the pole **closed forever**, names free folk crafts and what needs no domain. Confirm → the domain-filtered ability step; Adjust → the circle picker seeded with the suggestion. **Verified end-to-end** on the real code path (network stubbed): the necromancer input reproduced the inspiring exchange verbatim (Ashwarden/Cogitant/Figurist · closes Rootkin[life]/Somatic[body]/Mason · "slight of frame, the cost you already pay" · Hunter free · romantic not-a-domain). **The answer that was written by Aevi in chat is now given by the GAME.** Open after close: describe door uses the balanced default attribute spread (a follow-on could let the text shape it). *The door Brooklyn, Courtney and Clara actually want.*

## ✅ SNG-087 — CROSS-DEVICE DISCOVERY — SHIPPED v1.8.45 (complete_pending_review · Aevi closes)
**Built (`6a9eca9`, results `po/results/20260712_SNG-087.md`).** The last mile of BATCH-7 P2. `renderDiscover` → `ghList("players/")` + each `profile.json` → pick which player you are (auto-resolves the sole/name-matching one; **both duplicate "Erik" profiles surfaced clearly** so the pick is unambiguous). `renderDiscoverCharacters` → become that player → `ghList("characters/{key}/")` → **adopt & play from the repo**, with the **stale-overwrite guard in BOTH directions** (a newer local is never clobbered; conflicts preserved). Entry points: **auto-run once** on an empty roster + sync on · a **☁ Find my characters** roster button · **☁ Find me in the shared world** on the player-pick (fresh device, no local player). **Sync config is the only setup — no export/import.** Verified end-to-end (fresh device, GitHub API stubbed): both Eriks listed → picked s9z9u1 → Silas (repaired Ashwarden domains) + Rook shown from repo → adopted Silas → landed local, indexed, played, on the roster; guard proven (older remote did NOT clobber a newer local). **⚠️ Still owed (spec_boundary): SNG-045 Part A — the duplicate-Erik profiles are NOT merged at origin.** Discovery mitigates it (you pick the right Erik), but the clean fix is a destructive profile-merge I did not run unprompted — recommend Aevi authors the reconcile, or confirms CCode should build a backup-first guarded `mergePlayers(from→to)`.
*This is the feature Erik asked for in BATCH-7 and believed he had.*

## ✅ SNG-088 — THE GAMBIT BUILDER, FIXED FOUR WAYS + REORDER + AUTO-FILL — SHIPPED v1.8.46 (complete_pending_review · Aevi closes)
**Built (`5c895ef`, results `po/results/20260713_SNG-088.md`).** The mechanic the game is best at is usable again.
**(A)** `app.js:4076` gmAdvice now `smartClamp(600)` — word boundary + real ellipsis — with a **more/less** expander keeping the full text. *(Verified: 637-char advice → 600, cut on a word boundary, toggle shows.)* **Per §21, SNG-076 stays OPEN until Erik confirms no text is cut anywhere.**
**(B)** New **`gambitOps`** turn op: the GM OPENS the builder pre-filled with `{goal, steps[]}` instead of running the plan as one action; the recovered **HOLD THE PLAN-LEVEL VIEW** rule is in the GM contract from `gambit_design.json`; `applyTurn` validates → `renderPlay` opens it editable (Law 1); added to `salvageOps`. *Verified at parse+logic level (parseLooseJSON handles gambitOps payloads); the in-preview stub truncated the GM turn so a clean live drive of this one path is the Erik test.*
**(C)** `abandonGambit()` → a fresh blank draft (nothing carried); a **↺ Start over** control. *(Verified live: a filled 2-step plan clears to one blank step.)*
**(D)** Goal/step/fallback are full-width prose fields. *(Verified live.)*
**+ Erik-requested — REORDER:** ▲ up / ▼ down per step, a move invalidates the assessment. *(Verified live: STEP-A/STEP-B → swap → STEP-B/STEP-A, edits kept.)*
**+ Erik-requested — AUTO-FILL FROM THE CONVERSATION:** talked a plan through with the GM? Opening the builder pulls the goal + ordered steps (+ fallbacks) out of the recent dialogue via new `gm.js extractGambit()`, a **✦ Fill from our conversation** button, and auto-fill on open. *(Verified live end-to-end: 2-turn discussion → builder auto-filled goal + 3 steps + 2 fallbacks.)*
**⚠️ Separate pre-existing bug flagged:** the dev `enterPlanApt`/`ensureTestCharacter` leg throws `Cannot read properties of undefined (reading 'includes')` on a profile missing `charactersPlayed` — surfaces as a blocking alert(). Not SNG-088; worth its own small ticket.

## 🌍 SNG-089 / SNG-090 — A LARGE BODY OF CONTENT IS AUTHORED AND HAS NO ENGINE
*Erik and Aevi ran a full design session on the world's skills. **All of it is at origin and manifest-loadable. It is wiring, not authoring.***

**SNG-089 — harm rungs · the `notFor` LAW · the Accords · the 12 braids.**
**THE `notFor` LAW (now canon):** *a limit may constrain HOW an ability serves a need; it may NEVER forbid the need itself.* Palework was tagged **FIGHT** and its own prose said it *"does not force the living to die"* — **so a necromancer could not kill a boar.** The GM reads the prose, so the prose won. **`[CCODE: CI check — flag any ability whose challengeTypes include FIGHT while its notFor forbids harm.]`**
**HARM RUNGS** (`lethal|damaging|incapacitating|none`) — *"can fight" ≠ "can harm."* The Stillhold [peace] bind/shield/heal through a fight and wound **nothing** — **that is peace working, not a gap.** Feed the rung to the GM so it never invents a wound a craft cannot cause. **Only 2 of 24 traditions fight by hitting things.** **THE ACCORDS:** 7 crafts open to anyone — **freely ACCESSED, not free to learn** (you still spend the point; **the tuition is the JOURNEY**). **LIVING treaty — a suspension is a dated, propagating world-event.** **THE 12 BRAIDS** now all exist, with `harmRung` and `cultCondemns` — *both cults of an axis condemn the same braid for opposite reasons, and that disagreement IS the difference between a people and a cult.*

**⭐ SNG-090 — THE SUBSTRATE: THE SECOND DIFFICULTY MAP. ⚠️ ROUND 2 REQUIRED (touches the resolve chain).**
Already half-canon (`power_systems.md`: *"all power is nanite-mediated"*). **The missing piece (Erik): PEOPLES DIFFER IN HOW MUCH SUBSTRATE THEY NEED.** `substrateDependency` (per tradition) × `substrateDensity` (per place). **A high-dependency craft in a low-density place is not weakened — it is nearly OFF.**
**THE CONTINUOUS** (Seraphic, Lattice, Enginewrights, Blazeborn, Cogitants…) — **highest ceiling, helpless where the lattice is gone.** **THE RETURNED** (Rootkin, Marchers, Somatics, Masons, Ashwardens, Stillhold…) — **lower ceiling, work ANYWHERE.** ⛔ **A SERAPH IN THE QUICKWOOD RUNS AT 13%.**
**Emergent, not designed:** the **Quickwood dims its own people** (0.12 density; even Rootkin at 67%) — *they grew a country the lattice cannot get purchase in and paid a third of their power for it: it is a **FORTIFICATION***. The **Masons** are low-dependency **sitting on the densest ground in the world** — *they hold the supply and don't need it; the strongest position on the map, unnamed.* The **Blaze is burning its own supply.**
**⛔ CARRIED SUBSTRATE — the logistics layer, already in Erik's inventory:** **the Waystaff is a NANITE BATTERY** (*"three crystals charged, one shallow"*) and **Aevi is a living, mobile substrate source.** Charged reservoirs are the most valuable goods in the world. **An expedition into the Quickwood by a Continuous people is a LOGISTICS problem before a combat one.**
**AND TELL THE PLAYER** (SNG-084) — *"the lattice is thin here; your craft is running at a fraction."* **A silent 87% power loss is the cruellest possible bug.**

## 🔴 SNG-091 — THE GM WON'T OPEN A GAMBIT: two instructions strangle each other (Erik's leg, v1.8.46)
**SNG-088's WIRING IS CORRECT AND COMPLETE** — schema (gm.js:58) ✓ instruction (gm.js:63) ✓ handler (app.js:2433) ✓ salvageOps ✓. **The PROMPT is the bug, and it is AEVI'S.**
> **gm.js:63** — *emit `gambitOps` when the player wants to plan a multi-step approach **to a gambit-apt objective***
> **gm.js:62** — *`gambitApt`: **OMIT IT ALMOST ALWAYS** … Most turns: no gambitApt.*
**The GM checked aptness, concluded — as instructed — that almost nothing is apt, and declined to open the board. It obeyed both rules perfectly and did the wrong thing.**
**THE ERROR: Aevi chained the player's REQUEST to a heuristic built to suppress the game's unprompted SUGGESTION.**
> **`gambitApt` = the HINT. The game offering. Must be RARE.**
> **`gambitOps` = the PLAYER ASKING. Must be UNCONDITIONAL.**
> **⛔ When the player says "I want to plan this," THAT IS THE TRIGGER. Aptness is irrelevant — the player already decided.**
**Fix:** (1) **DECOUPLE** — rewrite gm.js:63: *"when the player asks to plan — **in any scene, apt or not** — emit gambitOps. **Do not judge whether the scene deserves a gambit; the player has already judged.**"* **Delete every 'gambit-apt objective' reference from the gambitOps instruction.** (2) **app.js:2433 `if (turn.gambitOps && !gambitDraft)` SILENTLY DROPS the request when a stale draft exists** (Erik's failed run left one) — **a dropped request is invisible and looks exactly like being ignored.** Merge or ask; never discard. (3) **`gambitApt` stays exactly as it is** — the heuristic is correct; it was only wrong as a GATE on the player's own request.
**✅ AUTO-FILL FROM CONVERSATION IS VERIFIED AND EXCELLENT** — Erik talked a plan through, hit ⚙ Plan, and got the goal + 3 ordered steps pulled verbatim from the conversation. Reorder, Start-over, full-width inputs all confirmed live.