# BRIEF — party combat: what is built, what it needs from you

**CCode → Aevi · v1.9.218 · at Erik's request.** ⚠️ **The short version: I built four readers and content has
turned on almost none of them. This document is mostly a list of fields waiting for an author.**

---

## §1 — WHAT CHANGED, IN ONE PARAGRAPH

**Until this week a contest was two sheets and two declarations. Every blow came to the player because
`oppDecl` resolved against `playerSheet` and there was nowhere else for it to go.** ⛔ **Now a foe chooses
whom to hit** — and *knowing who it chose* is a rung on the sense ladder you already author, so a character
who **obscures instead of reading cannot see the blow going for their healer, and therefore cannot step in
front of it.**

**That trade is Erik's, verbatim, and it is the whole design:**

> *"you need to sense who's getting attacked so you can intervene if you want.... if you obscure yourself you
> aren't going to know that information."*

---

## §2 — ⛔ THE AUTHORING SURFACE, MEASURED THIS MORNING

**Every row is a field the engine reads TODAY, with a working default, waiting for content to turn it on.**

| field | where it lives | authored now | what it does |
|---|---|---|---|
| **`targetPolicy`** | an opponent / encounter | ⛔ **0 of 23** | how this foe picks its mark |
| **`combatant: true`** | a companion | ⛔ **0 of 9** | may this entity *act*, not merely be present |
| **`downedEffect`** | a companion / NPC | ⛔ **0 of 9** | what the party loses when they go down |
| `canStrike: false` · `incorporeal: true` | any entity | ⛔ **0** | opts an entity OUT of dealing harm |
| `senseVisibility[n].reveals` | `skill_battle_system.json` | ✅ **done** — I added `target` at tiers 1/2/3 | |
| `targetReveal.namedAtTier` / `reasonAtTier` | `skill_battle_system.json` | ✅ **done** (2 / 3) | how good a read must be to name them |
| `heroSwingCap` · `legionVariance` · `legionFloorRisk` | rules | ⛔ **0** | the legion dials — **do not author yet, see §5** |

⚠️ **`targetPolicy` is the one I would start with, and it is nine words per foe.**

### The four policies, and why the default is what it is

| policy | picks | right for |
|---|---|---|
| **`threat`** ← default | whoever is hurting it most | ⛔ **anything that has fought before** |
| `weakest` | the softest target | something predatory or cruel |
| `healer` | whoever is keeping the others up | something that has fought a *party* before |
| `blind` | nobody in particular | a beast, a rockfall, a thing without intent |

⛔ **I made `threat` the default deliberately and I want you to push on it.** A foe that always goes for the
softest target turns every fight into *protect the healer, forever*. A foe that goes for **what is hurting
it** is **bait-able** — and being bait-able is what makes it a decision rather than a tax.

⚠️ **BUT THAT MEANS `weakest` AND `healer` ARE CHARACTERISATION, NOT DIFFICULTY.** A thing that goes for the
healer is *saying something about itself*. **That is your call, not a tuning knob**, and I would rather you
authored twelve of them meaningfully than that I defaulted eighty.

---

## §3 — ⛔ THE ONE THAT MATTERS MOST: NINE COMPANIONS, NONE OF THEM CAN ACT

**Aevi, Bristle, Coil, Ember, Hush, Marrow, Quill, Sprig, Tal.**

**Today every one of them is TARGETABLE and none of them can ACT**, because `combatant` is unauthored and
**absent means no** — which I chose on purpose, since a wrong default puts a healer in a duel.

⚠️ **AND ERIK HAS ALREADY OVERRULED THE QUESTION I BUILT THIS FOR.** I asked *"should companions fight?"* and
he said:

> *"the answer to should they be allowed to fight in battles is YES - as they are able. Obviously some of them
> are more geared toward that than others… however, they support, heal, distract, etc… so they literally are
> part of the fights anyway."*

**So the field is not a yes/no gate on fighting. It is a question about each one's nature**, and six of the
nine say in their own bond grants that they cannot fight — **which is exactly why they need protecting, and
exactly what makes interception worth having.**

### ⛔ `downedEffect` is the one nobody has thought about, and Erik asked for it explicitly

> *"for each we would need to determine what happens when they're are taken out, like anything else."*

**There is no default that is not a lie.** ⚠️ If a companion who lends you a craft goes down, does the craft
go with them? If a companion who *is* your light source falls, does it go dark? **The engine cannot guess
this and I will not invent nine answers.** *Nine sentences from you and this becomes real.*

---

## §4 — WHAT IS BUILT AND REACHABLE, SO YOU CAN AUTHOR AGAINST IT

✅ **A foe picks a target, and the blow's soak / resist / conditions all read THAT ENTITY'S sheet.**
✅ **The receipt names who it landed on**, so a wound has an owner.
✅ **A successful read reveals the aim**; an obscure forfeits it.
✅ **Interception fires** — `intercept.js` had been inert since the day it shipped, because nothing had ever
been aimed at anyone but the player.
✅ **Reachable from an actual encounter**, not only from a test. ⛔ *It was not, until this morning — see §6.*

---

## §5 — ⚠️ WHAT IS BUILT AND **NOT** REACHABLE, ON PURPOSE

**`engine/melee.js` — all five exports are test-only and I am leaving them that way.**

It answers *"what happens above three party members, and what happens with a legion"* — **and Erik has not
ruled on turn structure yet.** ⛔ **Wiring it into play before he decides would be me deciding it.**

**Do not author `heroSwingCap`, `legionVariance` or `legionFloorRisk` yet.** *A dial on an unwired module is
a control with nothing on the other end.*

**What I CAN tell you, because it is measured:** the compression is **arithmetically identical** to resolving
everyone individually — 1.0% on the average, 1.2% on the spread, against the real `battleRound`. ⚠️ **The
naive version of the same shortcut is also 1.0% on the average and 614% on the spread** — *invisible to
anyone checking averages, and it would have made big parties wildly swingier without moving a single number
anyone looks at.*

---

## §6 — ⛔ TWO THINGS I GOT WRONG THIS WEEK, BECAUSE THEY ARE BOTH YOUR FAILURE MODES TOO

**1 · I shipped the seat and no caller sat in it.** `battleRound` gained an `allies` parameter, twenty gates
went green, and **neither `encounters.js` nor `worldtick.js` ever passed it** — so `chooseTarget` returned
null on every round in the real game. **Every gate passed because every gate called `battleRound` directly.**
*Built, tested, unreachable — the thing we have both been hunting all month.*

**⚠️ AND HOW I MISSED IT IS THE PART WORTH STEALING:** `wiring_audit`'s `testOnlyExports` ratchet went
**27 → 31**. I ran the audit, saw *"4 failures, same as baseline"*, and moved on. ⛔ **The ratchet was ALREADY
RED, so the failure COUNT never moved while its VALUE got worse.** *A red check absorbs regressions silently.
Read the number, not the count.*

**2 · I broke your craft-lint rule in the act of reviewing your craft-lint spec.** I measured `harmRung`
against `light/moderate/severe/mortal` — invented on the spot. Going to find the real authority is what
uncovered **`braids.js` ranking harm on `restraint`/`wounding`/`atrocity`, three words no craft has ever
used**, so `damaging` and `incapacitating` sorted *below* `none` and seven braids minted as *"harms nothing"*
while a parent wounded.

⛔ **And SNG-196 asserted that behaviour and was green for as long as it was wrong** — the fixture authored
`"wounding"`, the assertion expected `"wounding"`, the engine ranked `"wounding"`. **Your 663, with a
different name on it.** *Mine was in the engine rather than in a draft.*

---

## §7 — WHAT I WOULD LIKE FROM YOU, IN ORDER

1. ⛔ **`combatant` and `downedEffect` on the nine companions.** *The single highest-value authoring in this
   whole area, and it is eighteen short answers.*
2. **`targetPolicy` on the foes that deserve a non-default one.** ⚠️ **Most should stay `threat`** — a
   deviation should mean something.
3. ⚠️ **Push back on my default.** If you think `weakest` is the honest default for wild things and `threat`
   only for trained ones, **say so** — it is one line and it is a characterisation call, which makes it yours.
4. **Tell me what a foe should know.** Right now a foe picks with perfect information about your party.
   ⛔ **It probably should not.** *Should a foe have to read you, the way you read it?* **I have not built
   that and I think it might be the better version of the whole mechanic.**

---

**Open and NOT mine:** party-size difficulty (Erik), turn structure above three (Erik), and whether a named
companion folded into the melee flow *feels* like equipment — **which no amount of measurement will answer.**

— CCode
