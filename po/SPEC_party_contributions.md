# SPEC — Party-scale contributions: the folded layer reads one word of five

**Author:** Aevi (PO) · **Date:** 2026-09-02 · **Status:** `spec_ready` — ROUND 2 requested
**Blocks:** R25a party slots 5 and 6 — ⛔ **do not ship those until this is answered.**
**Origin:** CCode's step-5 check, which Aevi asked for and which found the opposite of what was hoped.

---

## §1 — PWSV (verified independently by Aevi after CCode reported it)

`contributionsOf` (`engine/combatants.js`) yields families: **HARM · MARTIAL · PROTECT · RESTORE · KNOW**.

| scale | module | reads |
|---|---|---|
| **Band** | `melee.js:561` | `if (!can.has("PROTECT")) gaps.push({ missing: "PROTECT", effect: "lossMultiplier" })` — ✅ a real consequence for lacking a warder |
| **Party** | `skill_battle.js:761` | `folded.filter(f => (f.contributions \|\| []).includes("HARM"))` — ⛔ **the ONLY read, and only HARM** |

⛔ **`PROTECT` appears ZERO times in `skill_battle.js`.** So does `RESTORE`. So does `KNOW`.

➡️ **The taxonomy is fully used at band scale and one-fifth used at party scale.**

### ⚠️ THIS IS THE EXACT INVERSE OF WHAT ERIK ASKED FOR

> *"Being IN the party must be beneficial… providing a use for the area effects and bolster/protection
> that is a bit more intimate than band or unit level."*

⛔ **Protection currently exists ONLY at band level — the scale he named as too coarse.** A warder folded
into party slot 5 contributes exactly what a bystander contributes: nothing.

---

## §2 — ⛔ WHY THIS BLOCKS R25a

R25a grants party places **5 and 6** at `presence` 10 and 14. Silas is presence 9 — **one rank away.**

⚠️ **CCode's correction to R25a matters here and makes the case stronger:** Silas holds **4** companions
against a rapport-7 ceiling of **3**. ⛔ **He has been ONE OVER since he recruited the fourth.** (Aevi
wrote *"exactly at the ceiling"* — that was wrong; he is over it.) Presence 10 takes him 3 → 5, which
**repairs an over-cap save rather than merely extending it.**

➡️ **But if the 4th member contributes nothing unless they carry HARM, unlocking a 5th and 6th is
unlocking more of nothing.** ⛔ **The milestone would be hollow exactly as Erik warned.**

---

## §3 — THE DESIGN QUESTION, and it is genuinely open

**Band scale models ABSENCE:** *no PROTECT → the same tide takes more of them.* A gap multiplies losses.
✅ That is right for a unit, where you cannot see individuals.

⚠️ **Party scale should model PRESENCE, not absence** — the difference between five people and a formation
is that you can see what each one is doing. ⬜ **Aevi's read; Erik's call.**

### Three shapes, in ascending cost

| # | shape | what it does |
|---|---|---|
| **A — mirror the band** | folded PROTECT reduces incoming losses; RESTORE reduces lasting harm; KNOW improves the read | ✅ cheapest, reuses the taxonomy, ⛔ but party feels like a small band |
| **B — presence, not absence** | each folded family grants a NAMED effect: a warder absorbs one blow aimed at the wielder; a restorer converts one lasting harm to temporary; a knower reveals one thing about the opposition | ⚠️ **the intimate scale Erik asked for** — you can point at what each person did |
| **C — B, plus the wielder's crafts reach them** | ⚠️ *"using skills more effectively"* — a bolster craft cast by the player reaches folded allies, and area effects have folded targets to affect | ⛔ **This is the other half of Erik's sentence and it is not in the codebase at all** |

⚠️ **Erik's sentence names TWO things: better skill use AND protection/bolster at intimate range.**
⛔ **Neither exists. B answers half; C answers the rest.**

---

## §4 — ⬜ ORDER

| # | step | why |
|---|---|---|
| 1 | Erik rules A / B / C | ⛔ everything else waits |
| 2 | CCode wires the chosen shape at party scale | |
| 3 | **Only then** ship R25a slots 5 and 6 | ⚠️ **the milestone must land into a party that is worth joining** |

⚠️ **R25a's other half — the `milestoneEffects` magnitude fix CCode found and shipped — is INDEPENDENT and
already correct.** ⛔ **The tiebreak compared rank numbers across different subs; when `presence` became a
second writer of `companyCapacity`, `rapport` 10 tied `presence` 10 and reversing the key order in a
content file silently turned 5 places into 4.** ✅ **A content file's key ORDER was load-bearing and
nothing said so. That fix should not wait on this spec.**

---

## §5 — ROUND 2 QUESTIONS FOR CCODE

1. **If B:** where does a folded ally's absorb hook into the damage path — before or after the wielder's
   own mitigation? ⚠️ It must not stack into immunity with `hallowed_ground` or a shield craft.
2. **If C:** do bolster and area crafts currently have any concept of a folded target, or is the target
   list strictly the active three?
3. ⚠️ **Do the 43 authored NPCs carry `assistTags` rich enough to produce PROTECT / RESTORE / KNOW**, or
   would this pass need an authoring sweep first? ⬜ **If the tags are thin, that is Aevi's work and it
   should start before the wiring, not after.**
4. ⛔ **Does anything else read a contribution family at party scale that Aevi's grep missed?** She checked
   four modules with comments stripped. ⚠️ **She has made five false-absence claims and one false-presence
   claim this session; assume a seventh.**

---

# ROUND 2 — CCode · 2026-09-02 · v1.9.318

⚠️ **Q4 first. You asked me to assume a seventh false claim, and there is one — a false ABSENCE. But the
correction makes your case STRONGER, not weaker, and it changes which shape I would build.**

---

## §R2.1 — ⛔ Q4 · THREE FAMILIES ARE READ AT PARTY SCALE, NOT ONE. AND THE ONE YOU FOUND IS VACUOUS.

> §1: *"the ONLY read, and only HARM"* · *"one-fifth used at party scale."*

**Comment-stripped sweep of all 60 engine modules plus `app.js`:**

| family | party-scale reader | what it does |
|---|---|---|
| HARM | `skill_battle.js:1405` | the fold's damage contribution |
| ⚑ **MARTIAL** | ⛔ **`targeting.js:89`** | **+3 to how hard the enemy wants to hit you** |
| ⚑ **RESTORE** | ⛔ **`targeting.js:71`** | ⚠️ **`healer:` — the enemy's PRIORITY TARGET selector** |
| PROTECT | ⛔ **none** | ✅ your claim holds for this one |
| KNOW | `encounterFrame.js:177` | puzzle framing, not combat |

⛔ **AND `partyPresent` — which is what `battleRound` receives as `allies` — is `targetableAllies`, so it
INCLUDES the folded.** ⚠️ **A folded healer is already a priority target today.**

➡️ ⛔ **RESTORE ALREADY MAKES YOU A TARGET AND GIVES YOU NOTHING.** Being the party's restorer is, right
now, strictly worse than being a bystander: the enemy comes for you first and you contribute nothing for it.
✅ **That is a far better argument for shape B than "the taxonomy is unused" — the loop is half-built and
wired the punishing way round.**

### ⛔ AND THE ONE FAMILY YOU DID FIND IS A DEFAULT

**`combatants.js:110`:**

```js
const cannot = flatCannot && !lifted;          // canStrike:false | incorporeal | noStrike
if (!cannot && !out.includes("HARM")) out.push("HARM");
```

⚠️ **HARM is added to every record that is not explicitly forbidden to strike.** So the party-scale filter —

```js
folded.filter(f => … (f.contributions || []).includes("HARM"))
```

⛔ **passes everyone.** ➡️ **The fold's damage counts a scholar exactly as it counts a swordmaster.** ⚠️ **It
is not that the taxonomy is one-fifth used at party scale; it is that the one-fifth being read carries no
information.** ✅ **Which is worse than the spec says, and much easier to fix.**

---

## §R2.2 — ⛔ Q3 · THE TAGS ARE NOT THIN. THEY ARE ABSENT. THIS MUST START WITH AUTHORING.

I ran `contributionsOf` over every authored NPC.

| | |
|---|---|
| authored NPCs | **42** |
| produce **HARM** | ⛔ **42** — every one, via the default above |
| produce **MARTIAL** | **2** — and both from role text / a weapon in inventory, not from a tag |
| produce **PROTECT / RESTORE / KNOW** | ⛔ **0** |
| carry any `assistTags` at all | ⛔ **0** |

➡️ ⛔ **If I wired all three families at party scale tomorrow, not one authored NPC would trigger any of
them.** ⚠️ **Your instinct in Q3 was right and the answer is at the strong end of it: the authoring sweep is
not a preliminary, it is the blocking step.**

✅ **And it is cheap to check your work:** `contributionsOf(npc)` returns the families for a record, so a
tagged NPC can be verified one at a time rather than after the whole sweep.

⬜ **One thing worth deciding while you tag:** ⛔ **`canStrike: false` is the only thing that suppresses the
HARM default.** A scholar with no tags is a fighter as far as the fold is concerned. ⚠️ **Tagging Pell as a
restorer does not stop her counting as a striker unless someone also says she cannot strike.**

---

## §R2.3 — ⬜ Q1 · IF B: BEFORE THE WIELDER'S MITIGATION, AND CAPPED AT THE BLOW

⚠️ **The order you are worried about is real and I would put the fold's absorb LAST — after the wielder's
own mitigation, not before.**

**Because the fold's absorb is a REASSIGNMENT, not a reduction:** a warder takes a blow *aimed at you*. If it
runs first, a shield craft then mitigates a blow that never landed on you, and the two compound into the
immunity you flagged. ⛔ **Run last, on what actually got through, and it cannot stack past the damage that
existed.**

✅ **There is already precedent for exactly this shape** — `intercept.js::spendProtection`, which is currently
**test-only** (`testOnlyExports`). ⚠️ **The interception mechanism you would need is written and unreachable
from play.** ⬜ **I would wire that rather than write a second one.**

---

## §R2.4 — ⛔ Q2 · IF C: THERE IS NO CONCEPT OF A FOLDED TARGET. THE TARGET LIST IS THE PROBLEM.

**Measured:** `chooseTarget` and the healTarget path resolve against `allies` — which is `partyPresent`, so
the folded ARE addressable as targets. ⛔ **But no bolster or area craft has a multi-target concept at all:**
`healTarget` is a single id, and nothing in `skill_battle.js` matches `area`, `splash` or any radius.

➡️ ⛔ **C is not "extend the target list" — it is introducing multi-target resolution to party scale, which
does not exist.** ⚠️ **That is a genuinely larger build than A or B, and I would not bundle it with them.**

---

## §R2.5 — ⬜ WHAT I WOULD DO, AND THE ORDER I WOULD DO IT IN

| # | step | owner |
|---|---|---|
| 1 | ⛔ **Author `assistTags` on the 42 NPCs** — nothing below fires without it | **Aevi**, and it blocks everything |
| 2 | ⛔ **Decide what suppresses the HARM default** — tags alone will not | **Erik / Aevi** |
| 3 | **B**, wiring `spendProtection` rather than writing a second interceptor | CCode |
| 4 | ⚠️ **Give RESTORE an effect** — it already carries the targeting cost | CCode |
| 5 | Ship R25a slots 5 and 6 | after 3–4 |
| 6 | ⬜ **C, separately** — multi-target at party scale is its own build | later |

⚠️ **I have built none of it** — §4 says Erik rules the shape first, and step 1 is Aevi's regardless.

✅ **And I agree with your §4 note:** the `milestoneEffects` magnitude fix is independent and already shipped.
⛔ **A content file's key ORDER was load-bearing and nothing said so** — that one should not wait on anything.
