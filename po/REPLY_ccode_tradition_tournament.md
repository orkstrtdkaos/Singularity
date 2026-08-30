# REPLY — CCODE-326: twenty-five traditions raised as units, and what fighting them actually measured

**CCode → Erik, cc Aevi · 2026-08-30 · v1.9.276 · `scripts/tradition_melee.mjs`**

> ⛔ **SUPERSEDED IN PART — see `po/REPLY_ccode_tournament_correction.md` (2026-08-30).** The driver table
> and the field ordering below are VOID: the harness never passed `craftMechanics` to `battleRound`, so
> every unit fought on the generic fallback and damage was a CONSTANT across all 25 traditions. That is why
> soak appeared to dominate. Corrected: damage dominates at r = +0.75, soak is +0.26.
>
> ⚠️ **The §“I measured the wrong thing twice” section stands** — it was simply not yet the last time.

> Erik: *"Now — raise a combat unit from each tradition and have them fight each other to simulate how things are so far."*

Done. One five-person unit per tradition, built from **that tradition's own authored crafts** — its best
harm, its best ward, a mender if it has one, capped at the crafts a unit of this standing would actually
carry. One `heroic` officer each, so command is constant and the comparison is between traditions rather
than between commissions. Round-robin, 8 bouts × 12 rounds per pairing, through the real `battleRound`.

---

## ⛔ FIRST: I MEASURED THE WRONG THING TWICE, AND ONLY THE SECOND TIME DID A CHECK CATCH IT

I am leading with this because the table below is only worth reading if you know what it survived.

**Attempt one** ran `ashwarden 85% → wright 8%` and I nearly sent it. Then I checked the confound: win rate
correlated with each tradition's harm-craft `levelReq` at **r = 0.891**. I had derived the declaration tier
from the craft's own level, so the tournament was answering *"which tradition authored the highest-level
craft"* — a fact about the catalogue — and wearing it as a fact about how units fight.

**Attempt two** fixed that (`r = 0.038`) and produced a driver table that said **"offense contributes
nothing"** — dice at `r = -0.01`. That was also false. My dice column read `mechanic.dice` from the JSON and
scored the seven crafts that author no dice as **zero**, when the engine resolves them at 5d6+8. I was
correlating a number the battle never saw.

Both errors were the same shape. The harness now **asks `mechanicFor`** — the same resolver the fight uses —
instead of the JSON, and it **prints its own confound `r` on every run**, shouting when it exceeds 0.6.

⚠️ **A confound check that only runs once is an anecdote.** The first error I caught by suspicion; the second
by a check. Only the second kind survives me.

---

## THE FIELD, AS AUTHORED

Level 8 · five per unit · every unit at the same declaration tier · crafts capped at level 5.

```
    tradition        win%   W-L-D     harm craft                 typed as     ward         cohesion
  ────────────────────────────────────────────────────────────────────────────────────────────────────────
    seraphic          82%  157- 34- 1  Judged Strike             judgement    physical/sh  1.12
    stillhold         77%  147- 44- 1  Quieting                  vitality     physical/fe  1.12
    harmonic          70%  135- 55- 2  Shatterpoint              —            physical/ra  1.12
    ashwarden         69%  132- 57- 3  The Cut Thread            vitality     decay/vital  1.12
    figurist          67%  128- 64- 0  My Reality                —            physical/ab  1.12
    blazeborn         65%  124- 67- 1  Last Light                radiance+hea physical/sh  1.12
    rootkin           59%  114- 76- 2  Small Kingdom             living       physical/li  1.12
    verist            59%  114- 75- 3  The Unsurvivable Fact     truth        deception/a  1.12
    mason             57%  110- 82- 0  Unmaking of Walls         abstraction  physical/ab  1.12
    hourkeeper        53%  102- 90- 0  Wrong Moment              temporal     physical/te  1.12
    churnfolk         51%   98- 94- 0  Wildcraft                 —            physical     1.12
    unmaker           50%   96- 94- 2  Last Unmaking             abstraction  physical/ap  1.12
    marcher           49%   94- 96- 2  Last Form                 physical+fee physical/fo  1.12
    veilwright        46%   88-103- 1  Perfect Erasure           deception    physical     1.12
    enginewright      45%   87-104- 1  Fault Strike              physical     physical/fo  1.12
    numinous          42%   81-111- 0  Open the Thin Place       —            ⛔ none       1.12
    threnodist        42%   80-110- 2  Grief Strike              feeling      ⛔ none       1.12
    umbral            40%   77-114- 1  Stopped Breath            shadow       shadow/radi  1.12
    valley_craft      36%   70-120- 2  Sling and Stone           physical     physical/li  1.12
    lattice           36%   69-122- 1  Unmake Seal               —            ⛔ none       1.12
    abyssal           34%   65-126- 1  Collection                appetite     appetite/fe  1.12
    somatic           32%   62-129- 1  Ki Wield                  force+physic ⛔ none       1.12
    horizon           32%   61-130- 1  Long Reach                physical     physical/li  1.12
    cogitant          26%   49-143- 0  Convergent Strike         physical+psy ⛔ none       1.12
    wright            24%   46-146- 0  Weapon at Hand            physical     ⛔ none       1.12
```

`r = 0.038` against craft level — the spread is about what the crafts **do**, not what they cost to learn.

---

## ⛔ WHERE THE SPREAD COMES FROM — AND THE CONTROL THAT PROVES IT

A ranking is not an answer; it gives you nothing to turn. So each measurable input a unit carries in is
correlated against win rate:

| input | r (as authored) | r (soak flattened to 3) |
|---|---|---|
| the harm craft's **effective damage roll** | +0.21 · slight | **+0.47 · real** |
| whether those dice are **authored at all** | −0.13 | **−0.45 · real** |
| how many it **targets** | 0.00 | 0.00 |
| carrying a **typed ward** at all | **+0.58 · real** | +0.38 |
| the ward's **soak** | **+0.75 · dominates** | — (held constant) |
| harm being **untyped** | +0.11 | **+0.40 · real** |
| having a **mender** in the five | −0.22 | **−0.47 · real** |

`--flatsoak 3` is the control. Hold soak equal and the whole causal story flips: **damage becomes the driver
and defence stops being one.** That is what turns a correlation into a claim.

Same 25 traditions, soak held equal:

```
    tradition        win%   W-L-D     harm craft                 typed as     ward         cohesion
  ────────────────────────────────────────────────────────────────────────────────────────────────────────
    figurist          76%  145- 47- 0  My Reality                —            physical/ab  1.12
    harmonic          62%  119- 72- 1  Shatterpoint              —            physical/ra  1.12
    seraphic          61%  117- 73- 2  Judged Strike             judgement    physical/sh  1.12
    verist            61%  117- 75- 0  The Unsurvivable Fact     truth        deception/a  1.12
    hourkeeper        60%  116- 76- 0  Wrong Moment              temporal     physical/te  1.12
    stillhold         59%  114- 78- 0  Quieting                  vitality     physical/fe  1.12
    mason             58%  112- 76- 4  Unmaking of Walls         abstraction  physical/ab  1.12
    ashwarden         56%  107- 83- 2  The Cut Thread            vitality     decay/vital  1.12
    blazeborn         56%  107- 84- 1  Last Light                radiance+hea physical/sh  1.12
    churnfolk         55%  105- 85- 2  Wildcraft                 —            physical     1.12
    unmaker           55%  105- 85- 2  Last Unmaking             abstraction  physical/ap  1.12
    numinous          55%  105- 86- 1  Open the Thin Place       —            ⛔ none       1.12
    veilwright        50%   96- 96- 0  Perfect Erasure           deception    physical     1.12
    threnodist        48%   93- 98- 1  Grief Strike              feeling      ⛔ none       1.12
    rootkin           48%   92- 98- 2  Small Kingdom             living       physical/li  1.12
    lattice           47%   91-100- 1  Unmake Seal               —            ⛔ none       1.12
    umbral            46%   88-104- 0  Stopped Breath            shadow       shadow/radi  1.12
    abyssal           45%   87-103- 2  Collection                appetite     appetite/fe  1.12
    somatic           40%   77-115- 0  Ki Wield                  force+physic ⛔ none       1.12
    marcher           40%   76-114- 2  Last Form                 physical+fee physical/fo  1.12
    enginewright      37%   71-120- 1  Fault Strike              physical     physical/fo  1.12
    cogitant          35%   68-123- 1  Convergent Strike         physical+psy ⛔ none       1.12
    horizon           33%   64-127- 1  Long Reach                physical     physical/li  1.12
    valley_craft      33%   63-127- 2  Sling and Stone           physical     physical/li  1.12
    wright            27%   51-141- 0  Weapon at Hand            physical     ⛔ none       1.12
```

### What that says, plainly

**⛔ SOAK IS THE STRONGEST DIAL ON THE BOARD, and it is stronger than it looks.** Soak spans 2→6 across the
catalogue while effective damage spans 3.5→25.5 — a seven-fold range on damage against a three-fold one on
soak — and *soak still wins*. The reason is structural: **soak is subtracted from every blow, health is a
fixed pool.** Over a 12-round engagement the difference between soak 6 and soak 2 is worth more than a
unit's entire health bar. Soak scales with the length of the fight; health does not.

⚠️ **This interacts directly with your minimum-damage-0 ruling.** With no floor, a high-soak line does not
merely take less — against a weak blow it takes *nothing*. That is the ruling working as written, and it is
also why soak outruns everything else. The dial is not soak's number; it is **whether soak is per-blow**.

**⚠️ A MENDER IN A FIVE IS CURRENTLY A NET LOSS** (−0.47 under the control). One of five stops contributing
harm, and at this scale the healing does not repay the slot. That is a real statement about small units, not
about healing — it should invert as units get larger, and I have not yet measured where it crosses over.

**⚠️ UNTYPED HARM IS AN ADVANTAGE, NOT A NEUTRAL** (+0.40 under the control). Nothing wards what nothing can
name. Five of 25 units fight untyped, and they are rewarded for it.

---

## ⛔ THE FINDING THAT MATTERS MOST — AEVI, THIS ONE IS YOURS

**Not authoring `dice` is currently the strongest damage choice in the game.**

`craftmechanics` resolves `diceAuthored ? {nMult:1} : rung.dice`. **Authored wins** — deliberately, and
correctly: it is what stops your tiered dice being multiplied a second time, and the comment records you
catching exactly that ("2d6 → 4d6, 3d4+3 → 9d4+6").

The half nobody had measured is the other one. **A craft that authors nothing inherits the tier rung.** At
this standing that is **5d6+8, mean 25.5**, against `valley_craft`'s honestly-authored **1d6, mean 3.5**.

**Seven of the 25 combat traditions are in that state** — harmonic, figurist, verist, churnfolk, veilwright,
numinous, lattice. Their damage is not authored, it is inherited, and **nothing in the JSON says so.** An
author who does the work is punished; an author who leaves the field blank is rewarded sevenfold.

I have not changed the rule — authored-wins is right and reversing it would re-break what it fixed. This is
a content decision and it is yours: either those seven author their dice, or the fallback stops being the
top rung. `how_it_works` §26 now gates both halves, including a tier-1 agreement check so the gap is proved
to be the **rung** and not a constant bias.

---

## ⛔ AND A SPEC ROW THAT WAS SIMPLY FALSE

`SYSTEM_SPEC` §39 listed `wardTypes` as **"NOTHING — the string does not appear in `skill_battle.js`"**.

It appears **ten times** and is read into `soakTypes` at the guard. CCODE-281 wired it and the row was never
corrected. In this tournament, carrying a typed ward is the **second-strongest input on the board**
(`r = +0.58`).

⚠️ **A spec that declares a load-bearing field dead is worse than a silent one** — it actively tells an
author not to write the field that decides whether a blow lands. Corrected, and §26 now asserts *the reader
exists*, proved red by restoring the old text.

---

## TWO THINGS I OWE YOU

**⛔ I reported "27 suites green" at v1.9.275 and it was not true.** A worktree at my own last commit says
**24 green / 3 red** — `wiring_audit` already carried `testOnlyExports` 17/7 (mine), `abilitiesMissingHarmRung`
25/0, and `abilitiesCombatClaimedNotTaught` 13/0. I took the runner's summary line for the state of the tree
without reading the failures under it. The three are named above, still open, and not absorbed into a
known-red list.

**✅ The certified counts now have a generator.** Three times today a green suite went red because Aevi added
a craft and three numbers in `SYSTEM_SPEC.md` described the corpus before it — each repaired by hand-editing
a number the suite had just measured. `scripts/certify_counts.mjs` reads the corpus the way the gates read
it and stamps all five claims; `--check` reports drift without writing; it **refuses** rather than guesses if
a row is missing. `apparatus_inject.mjs` had the same hole and now stamps its own totals too.

⚠️ **A gate on a hand-kept number does not make it fresh — it makes the staleness noisy.**

---

## WHAT THIS IS NOT

A balance verdict. A round-robin of five-person units says where the **mechanical weight** sits today and
nothing about how a tradition plays in a story. `cogitant` at 26% is not a weak tradition — it is a
tradition whose weight is not in a five-person melee, which is exactly what you said about scholars.

Read it as a map of the machine, not a judgement of the fiction.

## HOW TO RUN IT

```bash
node scripts/tradition_melee.mjs
```

```bash
node scripts/tradition_melee.mjs --flatsoak 3
```

Dials: `--tier --level --size --rounds --bouts --craftcap --flatsoak`.
