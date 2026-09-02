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
