# TWO POLISH PASSES — the encounters, and the interface

**Aevi (PO) · 2026-09-05.** ⬜ **Measured. Erik: *"I haven't done one in a LONG time so I'm not sure how good
they are… then we need to take a pass at the UI… and ensuring those basic default skills are gone. Silas
still has them."***

---

## §1 — ⛔ THE BASIC DEFAULT SKILLS: RULED GONE

**Silas carries `brace` and `strike_basic` on his sheet.** They come from
`martial_paths.baselineDefense.kit` — four crafts (`brace · strike_basic · break_away · raise_alarm`)
granted free at creation, authored 2026-07-07 on a principle:

> ⚑ *"No character is helpless. Every character gets a BASELINE DEFENSE KIT free at creation — **not a class,
> a floor**: the universal animal competence of protecting yourself. Small numbers, always available, never
> gated."*

⛔ **R47 IS THE SAME PRINCIPLE, DONE BETTER.** ⚠️ **The free floor gives every T1 craft a zero-cost form that
keeps its native reach and loses its force** — so a character at zero energy still has **their own
tradition**, rather than four generic verbs nobody chose.

➡️ **The baseline kit is now a SECOND answer to a solved question**, and it is the worse one: ⛔ **generic
where the floor is characterful, granted where the floor is earned, and on the sheet where the floor is
underneath it.**

### ⬜ THE BUILD

| | |
|---|---|
| **1** | **stop granting `baselineDefense.kit` at creation** |
| **2** | ⚠️ **keep the four crafts in the CATALOGUE** — `unraveling_blow` braids from `strike_basic`, so removing the definition breaks a recipe |
| **3** | ⛔ **existing sheets carry them.** ⬜ **Erik's save — a removal, not a migration** |
| **4** | ⚑ **and check the FLOOR actually covers what the kit did** — `shield · strike · move · reveal` are all on the free-floor verb list, ⚠️ **but `move` and `reveal` should be confirmed against real T1 crafts before the kit goes** |

⬜ **AND THE PRINCIPLE SHOULD BE REWRITTEN, NOT DELETED.** *"No character is helpless"* is still true; **it
is now true because of the floor.**

---

## §2 — ⛔ THE ENCOUNTERS: NINETEEN, AND THEY PREDATE EVERY RULE THIS WEEK

### 2a · the numbers are the old scale

| | |
|---|---|
| **duel opponents** | ⛔ **`health: 3–7`** |
| **what an NPC is worth today** | ⚑ **`30 + 5 × level`** (Q1, v1.9.347) |
| **threat** | 26–45, on a different scale entirely |

⚠️ **A duel opponent at `health: 5` against the death save, pressure, and a party of three is not a fight —
it is a formality.** ⛔ **The Pell–Veth census took 7.4 rounds against 99 health.** ➡️ **These end in one.**

### 2b · ⛔ ZERO OF NINETEEN KNOW ABOUT A PARTY

**Measured: no encounter file mentions `party`, `allies`, `fold`, or `contributions`.** ⚠️ Two mention a
companion in prose only.

**Every one is written for one person against one opponent** — ⛔ **which was true when they were written
and is not true now.** ⚑ **R36 makes a party member fight from their own sheet; the party seat shipped
yesterday; `contributionsOf` reads a kit.** ⬜ **None of that reaches an encounter.**

### 2c · ⬜ WHAT AN ENCOUNTER NEEDS, AND MOST OF IT IS SMALL

| ⬜ | |
|---|---|
| ⛔ **pools on the live scale** | **the single biggest fix, and it is arithmetic** |
| ⚑ **a party clause** | *what changes when there are three of you.* ⚠️ **Kestrin reading ONE stance is a different encounter when three people walk out** |
| **who the opponent targets** | `targeting.js` hunts RESTORE — ⬜ **an encounter should be able to say who it goes for and why** |
| **fold expectations** | ⚠️ what a folded companion does here, and what it costs when they go down |
| **`lethal` vs the death save** | ⛔ **`lethal: false` on eight coliseum bouts predates R35.** ⬜ **Does a formal bout offer a death save at all?** ⚠️ **It should not, and nothing says so** |
| **the three `stakes` and two `stages` fields** | ⬜ only 3 of 19 carry stakes — **the rest end without saying what was won** |

⚑ **AND THE COLISEUM EIGHT ARE THE BEST STRUCTURE WE HAVE**, one per contribution family — HARM · INFLUENCE
· KNOW · MOVE · PROTECT · RESTORE · SHAPE · SUSTAIN. ⚠️ **They were built to prove every family can win a
fight.** ⛔ **Under R36 that is now a PARTY question, not a solo one, and they are the natural place to show
it.**

---

## §3 — ⬜ THE INTERFACE PASS

⚠️ **Aevi has not measured this and will not pretend to** — Erik is the only one who plays it. ⬜ **What is
known to be owed, from this week's rulings:**

| | |
|---|---|
| ⛔ **the two stale antipode readers** | `app.js:11015` renders **"braid material only — you cannot cast this"** for a rule R9/R16 retired. ⚠️ **A live string telling a player they cannot do something they can** |
| ⛔ **the battle menu** | R46c: **no numeric cap; group by craft so one craft is one row that expands to its verbs.** ⚠️ **`.slice(0, 40)` cut from the END, where the bare moves and items live** |
| **the free floor's surface** | ⬜ **does a player SEE the zero-cost floor on the menu?** ⚑ It is prepended below r1 by design — *"a free floor listed AFTER the paid tiers reads as a footnote"* |
| **the Holdings tab** | ⚠️ built fast this week — features, keeper, crew, garrison, transfer. ⬜ **worth a look now that all of it exists at once** |
| ⛔ **the news digest** | ✅ bounded and scrolling now, ⬜ **but Erik should confirm it reads right after a real absence** |
| **the rank-up celebration** | ⬜ **R44 is ruled and unbuilt** — silver for r2, full plus an image for r3 |

⬜ **AND THE ONE THING AEVI WOULD ASK FOR:** ⚑ **a player should be able to see, on one screen, what their
party members actually contribute.** ⚠️ **The seat shipped yesterday and there is nowhere to look at it.**

---

## §4 — ⬜ SUGGESTED ORDER

| # | | why |
|---|---|---|
| **1** | ⛔ **encounter pools to the live scale** | **arithmetic, and everything else about an encounter is unmeasurable until fights last more than a round** |
| **2** | **retire the baseline kit** | ⚠️ small, ruled, and it is on Erik's sheet now |
| **3** | **the two stale UI strings** | ⛔ **a player is being told something false today** |
| **4** | **the battle menu regroup** (R46c) | ruled, and it interacts with 2 |
| **5** | ⬜ **the party clause on the coliseum eight** | ⚑ **content, mine** — the natural place to show what R36 changed |
