# THINKING — tomes, ceilings, and replacing the antipode wall with a price

**CCode → Erik, cc Aevi · 2026-09-01 · v1.9.288 · measured, not built**

> Erik: *"Tomes and other artifacts of kind would Teach you a skill — maybe requiring skill points to use.
> I think I want to bump the slot ceilings to tier 3 for tertiary and 4 for secondary domains. I also want
> to remove the prohibition that domain slots bring to the antipole… I'm thinking of a balance system
> instead… the more you lean light the harder it is to learn dark. But in theory, if a player learns both
> ends of the axis evenly… they could be a true cross-pole character."*

✅ **The headline: the machine you are describing already exists.** You are not asking for a new system —
you are asking to change what feeds an existing one. That makes this far smaller than it sounds.

---

## §1 — ✅ THE BALANCE SYSTEM IS A CHANGE OF INPUT, NOT A CHANGE OF MACHINE

**What prices a craft today** (`skilltree.js:219`, the one site):

```
cost = tierPrice[tier] × penalty
```

`tierPrice` is linear 1–5 (verified live — ⚠️ I had a compressed ladder in my head and it was wrong).
`penalty` comes from `domainAccess`, and today it is **a function of ring geometry alone**:

| band | penalty | what sets it |
|---|---|---|
| primary / secondary / tertiary / acquired | **1** | you chose it |
| adjacent (kin to primary) | 1 | one ring step |
| far (≤4 steps) | 2 | geometry |
| very far (5+ steps) | 3 | geometry |
| **antipode** | 2–3 | geometry — ⛔ **plus `castable: false`** |

⛔ **So the antipode is ALREADY priced the ordinary way.** CCODE-339 left exactly one thing behind:
`castable: false`. Your ask is to delete that flag and make `penalty` **a function of the character
instead of the map.**

### The formula

Lean on an axis, from depth `inDomainRanks()` already computes:

```
lean    = clamp0( (depthHome − depthAnti) / (depthHome + depthAnti) )    → 1 pure, 0 balanced
penalty = 1 + K × lean
```

✅ **At K = 1 the numbers land on ground the game already stands on:** a fully-leaned character pays **×2**
for the antipode — *exactly* the `crossClass` multiplier ratified 2026-07-06. Nothing new to learn; the far
pole simply feels like a second class. A balanced character pays **×1** — parity, which is the whole point
of *"a true cross-pole character."*

### ✅ The property that makes it good: the tax DECAYS as you commit

A Light specialist (20 home ranks) taking up Dark, buying tier-III crafts:

| craft # | antipode depth | lean | ×penalty | cost | running |
|---|---|---|---|---|---|
| 1 | 0 | 1.00 | 2.00 | **6** | 6 |
| 2 | 2 | 0.82 | 1.82 | 6 | 12 |
| 4 | 6 | 0.54 | 1.54 | 5 | 22 |
| 6 | 10 | 0.33 | 1.33 | 4 | 31 |
| 8 | 14 | 0.18 | 1.18 | **4** | 39 |

⚠️ **The barrier is to DABBLING, not to crossing.** That is the correct shape and it falls straight out of
your own sentence. The dilettante pays double forever; the convert pays double once.

### ✅ And the cross-pole build is reachable

Alternating home/antipode for 40 crafts: **144 pts vs 120 all-at-home — a 1.20× premium** (K=1), final lean
0.04. ✅ **Payable.** The cost is breadth foregone, not a wall.

---

## §2 — ⛔ THE ONE REAL FLAW: LEAN MEASURED IN RANKS CAN BE FARMED

**Ranks land free through use** (`gm.js` §19B). So lean — if measured in ranks — is farmable:

| path to three tier-V Dark crafts | cost |
|---|---|
| honest — buy them at full lean | **29 pts** |
| ⛔ farmed — buy one tier-I decoy (2 pts), grind it to rank 5 in play, *then* buy | **25 pts** |

⚠️ **14% saved, and the cheapest decoy is always the right opening move.** That is the tell of an exploit.
⬜ **Not fatal** — grinding to rank 5 is real play. But it is a gradient, and gradients get found.

### ⬜ THE FORK — what should measure lean?

| | measure | resists the decoy? | rewards |
|---|---|---|---|
| **A** | ranks held | ⛔ no | play |
| **B** | points *spent* per pole | ✅ yes (free ranks never register) | commitment |
| **C** | **crafts at rank 2+ per pole** | ✅ yes (one decoy ≠ breadth) | ✅ **studied practice** |

✅ **My recommendation is C.** It is *already computed* for the promotion road, a single decoy barely moves
it (1 craft → lean 0.82), and it means the same thing everywhere: **"how much of this pole have you
actually leaned on."** ⚠️ **B is the safest and the dullest** — it prices your wallet, not your character.

---

## §3 — ⚠️ THE CEILING BUMP, MEASURED (29 traditions, 414 crafts)

| slot | now → proposed | mean crafts reachable | % of a tradition's book |
|---|---|---|---|
| tertiary | 2 → **3** | 9.1 → 11.4 (+2.3) | 64% → 80% |
| secondary | 3 → **4** | 11.4 → 13.1 (+1.7) | 80% → **92%** |
| primary | 5 (unchanged) | 14.3 | 100% |

**A character's home shelf: 34.8 → 38.8 crafts — an 11% widening.** ✅ Modest.

### ⛔ But look at what it does to the specialist

**Crafts only your PRIMARY can reach: 2.9 → 1.2.** ⛔ **The primary's exclusive territory drops to 42% of
what it was**, and tier V is all that remains — only **35 crafts in the entire game**.

⬜ **I do not think that sinks it**, because of something you may have forgotten you already built:

✅ **Tier IV–V are behind the SNG-100b capstone standing bar** — a willing teacher *plus* earned reputation
with that people. So raising secondary to 4 does **not** hand out tier IV. It makes tier IV *possible*,
still subject to standing. ✅ **The ceiling stops being the wall and standing becomes the wall** — which is
the better wall, because the world moves it and the player can earn it.

⛔ **THIS IS LOAD-BEARING, AND IT IS CURRENTLY KEYED TO THE WRONG FIELD — see §5.**

---

## §4 — ⬜ THE FIVE SITES THAT STILL ENFORCE THE PROHIBITION

Removing it is not one line. CCODE-339 updated `domainAccess` and nothing else:

| # | site | what it does | verdict |
|---|---|---|---|
| 1 | `traditions.js:259` | `castable: false` on the antipode band | ⬜ **delete** — this is the prohibition |
| 2 | `app.js:4062` | action menu filters `castable !== false` | ✅ needs no change; #1 frees it |
| 3 | `progression.js:447-450` | ⛔ `promote()` **writes** `character.foreclosed` | ⬜ **stop writing it** |
| 4 | `progression.js:487-489` | `joinPeople()` writes it too | ⬜ same — ⚠️ **but see below** |
| 5 | `progression.js:282` + `:300` | `isForeclosedNative` blocks learn **and** rank | ⬜ **remove or keep for legacy saves** |
| 6 | `progression.js:465-466` | `acquirable` refuses the antipode outright | ⬜ **your call — §6** |

⚠️ **`joinPeople()` is never called from `app.js`.** Only `promote()` is (`app.js:14500`). ⛔ **The
join-a-people road is authored and unwired** — the fourth door again. Worth knowing before we build on it.

⚠️ **Existing saves may carry `character.foreclosed`.** If we stop writing it we should also stop reading
it, or old characters keep a restriction new ones never get.

---

## §5 — ⛔ A BLOCKER I FOUND WHILE SCOPING THIS: CCODE-340 IS INCOMPLETE

I decoupled `tier` from `levelReq` for **price** and **dice**. ⛔ **Seven readers still treat `levelReq` as
the tier**, and two of them are gates, not decoration:

| site | reads | consequence once a craft's tier ≠ levelReq |
|---|---|---|
| ⛔ `progression.js:572` | `ab.levelReq >= capstoneTier` | ⛔ **the capstone standing bar fires on the wrong crafts** |
| ⛔ `wheelgeom.js:166` | `ability.levelReq > 1` | creation offers the wrong crafts |
| `skilltree.js:109`, `app.js:210 / 9329 / 10137 / 10479` | `tierOf(ab.levelReq)` | ⚠️ **the tier badge shows the wrong number** |

⛔ **§3's whole safety argument rests on `progression.js:572`.** If secondary rises to tier IV while that
line reads `levelReq`, then any craft Aevi authors as *tier V, levelReq 2* walks past the standing bar into
a secondary domain. ✅ **Latent today** — all 414 crafts still have `tier === levelReq`, so nothing is
broken yet. ⛔ **It becomes live the first time Aevi re-levels one craft.**

⬜ **Recommendation: fix the seven readers BEFORE the ceiling bump lands.** Small, mechanical, and it is the
difference between the bump being safe and being a hole.

---

## §6 — ⬜ TOMES, AND WHAT I STILL NEED FROM YOU

> *"Tomes and other artifacts of kind would Teach you a skill — maybe requiring skill points to use."*

✅ **"Requiring skill points to use" is the right instinct** and it resolves the §2 farm neatly: a tome that
*grants* a craft outright would inject antipode depth for free and crater the lean. **A tome that grants
ACCESS, still paid for in points, cannot be farmed.**

⚠️ **Today `character.tomes` has a reader (`progression.js:472`) and no writer anywhere** — engine, app or
content. So the tome road is currently unreachable in both senses.

⬜ **Open questions, in the order they block work:**

1. **Which lean measure — A, B, or C?** (§2) I recommend **C**. Everything else waits on this.
2. **K = 1 or 2?** K=1 caps the antipode at ×2, the number the game already uses. I recommend **1**.
3. **Does the lean penalty STACK with `crossClass` ×2?** ⛔ Unstacked, a full-lean cross-class tier-V is
   **30 points — 45% of a level-30 career.** I recommend **a cap of ×3 on the combined multiplier.**
4. **Should a balanced character pay ×1, or is there a floor?** ×1 means the antipode is as cheap as home.
   That is literally what you described; I want it confirmed, not assumed.
5. **`acquirable`'s antipode refusal (§4 #6)** — *joining a people* is a different commitment from
   *learning a craft*. ⬜ Keep the refusal, or does balance open that door too?
6. **Is an artifact distinct from a tome, or a tome with better prose?** If the latter, one mechanism
   covers both.

⛔ **Nothing above is built.** You said think it through with you, so I measured and stopped.
