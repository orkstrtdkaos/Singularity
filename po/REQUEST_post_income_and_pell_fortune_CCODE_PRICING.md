# PRICED — WHAT A POST ACTUALLY EARNS, AND WHAT PELL'S FORGE IS WORTH

**CCode → Aevi + Erik · 2026-09-05 · v1.9.363.**
⚑ **Every number below came out of the engine, not out of my head** — `tickStore` and `sellStore` were run
against a hold of each shape and the receipts are the table. ⬜ **Nothing is written into any save.**

---

## §1 — ⛔ AEVI'S CORRECTION IS RIGHT, AND THE ENGINE ALREADY AGREED WITH HER

> *"Kind does not decide income. What it DOES decides income."*

⚑ **This is already true in the code as of v1.9.360 and I mis-stated it in R48.** `yieldsFor` walks a hold's
FEATURES and adds each material one's goods beside the hold's own kind, and `pilgrimIncome` pays a meaning
feature's alms. ⛔ **`defaultYield.post: null` only says a BARE post produces nothing — it was never a
ceiling on a post.** ⚠️ **My R48 §2a read the dial and not the feature walk, and priced the Threshold Post at
zero because of it.**

### THE MEASUREMENT, PER PASS (72 world hours = 3 days)

| a post that is… | units | sold | ⛔ **the keep** | net |
|---|---|---|---|---|
| **bare** | 0 | 0 | **0** | **0** ✅ my original claim survives, for the bare case only |
| **+ a mine**, `strained` | 2 | 8 | 0 | **+8** |
| **+ a mine**, `holding` | 4 | 16 | 0 | **+16** |
| **+ a mine**, `thriving` | 8 | 32 | 0 | ⚑ **+32** |
| **+ a temple** (alms, on top of the above) | — | — | — | **+4 to +12**, see below |

⛔ **AND HERE IS THE THING THAT MAKES A POST WORTH HOLDING, WHICH NEITHER OF US NOTICED: `upkeepByKind.post`
IS ZERO.** ⚠️ **A mine at an ENTERPRISE nets +18 a pass because it pays a keep of 14. The same mine at a
POST nets +32, because a post pays nothing.** ⚑ **A post with something built on it is the most profitable
shape in the game**, and the "posts earn nothing" reading had that exactly backwards.

### THE ALMS, MEASURED — `pilgrims × perPilgrim × (1 + meaning)`

| feature | at meaning 0 | 0.5 | 1.0 | 2.0 |
|---|---|---|---|---|
| **a shrine** | 2 | 3 | 4 | 6 |
| **a temple** | 4 | 6 | **8** | 12 |
| **a temple + a shrine** | 6 | 9 | 12 | 18 |

⚠️ **The meaning term is the PLACE's, not the feature's** — a temple where nothing has happened pays 4, and
the same temple on ground the world holds sacred pays double. ⚑ **That is R38b working as ruled.**

---

## §2 — ⬜ R48 §2a, RE-RUN. THE ARREARS ARE NOT 44 CRYSTAL. THEY ARE UP TO 704.

**22 passes (world day 67), the Threshold Post as Erik describes it — *"it also has a mine and a temple."***

| assumption | per pass | × 22 passes |
|---|---|---|
| ⛔ **R48's original read** (a post earns nothing) | 0 | **0** |
| **a mine, at `strained`** (its condition today) | +8 | **176** |
| **a mine, at `holding`** (its condition before the keeper bug) | +16 | ⚑ **352** |
| ⚑ **a mine, at `thriving`** (what 22 passes under a constant keeper reaches) | +32 | ⚑ **704** |
| **+ a temple's alms at meaning 1.0** | +8 | **+176** |
| | | ⚑ **up to 880 crystal, from ONE hold** |

⛔ **MY R48 NUMBER WAS WRONG BY MORE THAN AN ORDER OF MAGNITUDE, AND IT WAS WRONG IN THE DIRECTION THAT
MATTERED** — it told Erik the holds owed him almost nothing when they owe him the largest single figure on
the page.

⬜ **RAVEN'S HOME IS NOT PRICED HERE.** Its record carries **no features at all**, and Erik's *"all kinds of
things being built"* has never reached the data. ➡️ **Aevi: the features are the input; name them and the
number falls out.** ⚠️ **I will not invent a mine to make an arithmetic work.**

### ⚑ SO R48'S RECOMMENDATION CHANGES

⛔ **I no longer recommend option B alone.** ⚠️ **B was right when the holds were worth 44 crystal; it is not
right when they are worth several hundred.** ⬜ **The honest settlement is now:**

| | |
|---|---|
| **the deed ledger** (35 deeds × 8) | **280** |
| **the Threshold Post's mine**, at `holding` for 22 passes | **352** |
| **its temple's alms**, at meaning 1.0 | **176** |
| ⬜ **Raven's Home** | **— awaiting its features** |
| | ⚑ **808 crystal, before Raven's Home** |

⚠️ **And the 2d correction still stands and is now worth more:** both holds should be **`thriving`**, which
is not coin but doubles everything above from here on.

---

## §3 — ⛔ THE TWO NEW SHAPES AEVI ASKED FOR: SERVICE AND SUBSIDY

⚑ **Both are the same mechanism as pilgrims, pointed at a different reason people pay.** ⬜ **Neither is
built; both are small, and I will build them on a word.**

| | what it is | the dial | ⚠️ what makes it honest |
|---|---|---|---|
| ⬜ **SERVICE** | *"the message network work that the points it connects pay for"* | **per connection, per pass** | ⛔ **it must count REAL connections** — the waygate/route edges the post actually carries. A number typed onto a hold is a stipend wearing a service's name |
| ⬜ **SUBSIDY** | *"the locally connected areas might subsidize it"* | **per connected community × how much safer** | ⚠️ **the "safer" term already exists** — a garrison, a wall, sentries, the watch. **A post that keeps no watch is subsidised by nobody**, and that is the rule that stops it being free money |

⛔ **THE DESIGN RULE I WOULD HOLD BOTH TO: A POST EARNS FOR WHAT IT CONNECTS AND WHAT IT PROTECTS, AND BOTH
ARE COUNTABLE.** ⚠️ **The moment either becomes a flat figure per post, we have built the stipend I argued
against in R48 §2b and given it a better name.**

---

## §4 — ⚑ PELL'S FORGE — THE NUMBER, OFF THE ENTERPRISE TABLE

**Pell Ran Marsh · level 27 · Master smith of Millbrook · met at Millbrook on day 1.**

⛔ **HER LEVEL DECIDES THE CEILING, AND SHE IS ABOVE THE LINE.** `tierFloor` puts level 27 at **heroic**
(floor 25), and `ceilingByKeeperTier` lets a regional keeper or better bring a hold to **`thriving`**. ⚑ **A
master smith keeping her own forge reaches the top rung and stays there.** ⚠️ **That is not a favour — a
`notable` keeper would cap at `holding` and earn +2 a pass, which is the difference her craft makes.**

### PER PASS, AT MILLBROOK

| condition | units | sold at Millbrook | keep | net |
|---|---|---|---|---|
| **failing** | 0 | 0 | 14 | **−14** |
| **strained** | 2 | 8 | 14 | **−6** |
| **holding** | 4 | 16 | 14 | **+2** |
| ⚑ **thriving** (hers) | 8 | 32 | 14 | ⚑ **+18** |

⚠️ **AND APPRENTICES ARE THE REAL LEVER** (`handsYieldBonus` 0.25, `maxHands` 3):

| extra hands | units | net |
|---|---|---|
| 0 | 8 | **+18** |
| 1 | 10 | **+26** |
| 2 | 12 | **+34** |
| ⚑ **3** | 14 | ⚑ **+42** |

### ⬜ THE FORTUNE, BY SPAN — ERIK PICKS THE ROW

| span | passes | at +18 (alone) | at +34 (two apprentices) |
|---|---|---|---|
| **since Silas met her** (world day 67) | 22 | **396** | **748** |
| **one valley year** (96 days) | 32 | **576** | **1,088** |
| **three years** | 96 | **1,728** | **3,264** |
| **five years** | 160 | ⚑ **2,880** | ⚑ **5,440** |

⚑ **MY RECOMMENDATION: THREE YEARS AT +18 → ≈1,700 CRYSTAL.** ⚠️ **Here is the reasoning, and it is not
about the number.** ⛔ **A master smith is not a person who started a forge last year.** Level 27 is deep in
a craft; Erik's own words are *"she was a master smith before Silas arrived."* **Three years is the shortest
span that makes the title true**, and +18 assumes she works it alone — which is the conservative read of a
shop nobody has authored apprentices into. ⬜ **If Erik wants her wealthier, apprentices are the honest way
to get there, and they are a thing that can then be taken from her.**

### ⛔ ONE MEASUREMENT THAT WILL SURPRISE YOU: WHERE THE FORGE STANDS COSTS HER MOST OF IT

**The same 8 units a pass, sold in different regions:**

| region | gross | net |
|---|---|---|
| ⛔ **the Unmade** | 5 | **−9** |
| **the Quickwood** | 16 | **+2** |
| ⚠️ **`valley` — Millbrook, hers** | **32** | **+18** |
| **the Crossing** | 64 | **+50** |
| ⚑ **the Gearlands · the Making** | **115** | ⚑ **+101** |

⛔ **MILLBROOK IS IN REGION `valley`, WHICH IS NOT IN THE DEMAND TABLE AT ALL**, so it falls back to
ordinary need and ordinary scarcity. ⚠️ **The Gearlands pay 3.6× for the same goods** (high need × scarce).
⚑ **And she cannot chase it: `sellStore` refuses away from the hold — *"you sell where it stands."*** ➡️
⬜ **AEVI: `valley` has no row in `economy.regions`. That is a real gap and it prices every valley
enterprise at the floor.** ⛔ **Not mine to author.**

⚠️ **A second finding while measuring: `defaultYield.enterprise` is `raw_material` for every enterprise, so
a FORGE currently produces ore rather than arms.** The catalogue has a `forge` and a `smithy` feature kind
already. ⬜ **A forge should yield `arms` — that is one field, and it is yours.** ⛔ **It does not change her
number at Millbrook** (both goods price identically where nothing is specially wanted) — **but it changes it
everywhere else**, and it is the difference between a smith and a mine.

---

## §5 — ⛔ WHAT SHE NEEDS BEFORE ANY OF THIS CAN BE WRITTEN

| | ⚠️ status |
|---|---|
| **her own purse** | ⛔ **an NPC cannot hold coin.** ✅ **The bearer record from R45c is the shape** — `ensureBearer` already gives a registry entry its own fields, and a purse is the same move. ⚑ **Small; I build it on a word** |
| **the forge as a holding**, `kind: enterprise`, `owner: pell_ran_marsh`, keeper herself | ⚑ **the worked example for `owner ≠ player`** that `SPEC_holdings_tempo_and_scale.md` §4 asks for. ⚠️ **Every holding function already takes the character whose holdings list it is on — an owner field is the smaller half; the reader that pays a NON-player owner is the real work** |
| **`payer` piping ongoing income to Silas** | ⬜ **exactly right, and it should be a POINTER, not a transfer** — her fortune stays hers, the flow is a choice they made and can unmake |

---

## §6 — ⬜ THE TWO NUMBERS TOGETHER, WHICH IS WHAT AEVI ASKED FOR

| | ⛔ **what it is** | amount |
|---|---|---|
| ⚑ **SILAS — arrears** | **the world owed him and had no way to pay** | **808** (280 deeds + 352 mine + 176 alms), **Raven's Home still to come** |
| ⚑ **PELL — earnings** | ⚠️ **she was never owed anything. She was WORKING, and nobody was counting** | **≈1,700** (three years, alone) |

⛔ **AND THE DIFFERENCE IS THE WHOLE POINT.** ⚠️ **Silas's figure is a repair — it exists because there was no
income path for a player at all until this week.** ⚑ **Pell's is not a repair. It is a ledger nobody had
opened, on an enterprise that was running the entire time.** ⬜ **She should be richer than him, and by
these numbers she is — roughly twice over.** ⚠️ **That is the correct outcome and it should not be tuned
away: he has spent sixty-seven days holding charges for free, and she has been selling iron.**
