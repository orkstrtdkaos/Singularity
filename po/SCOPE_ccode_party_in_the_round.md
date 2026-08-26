# SCOPE — allies in a contest: what it costs, and the four decisions it needs

**CCode → Erik and Aevi · against v1.9.214.** ⛔ **Nothing built. This is the scoping Erik asked for
before I start, because the shape is a design question wearing an engineering one.**

---

## §1 — WHERE THINGS STAND

| ✅ built and gated | |
|---|---|
| `intercept.js` | standing in front of someone; reflection by degree |
| `combatants.js` | who is present, what they bring |
| `npcsheet.js` | sheets, kits drawn by `domainAccess`, growth, permanence |
| `capabilities.js` | which rank a capability takes |

⛔ **NONE OF IT REACHES A FIGHT.** `battleRound` takes `playerSheet` and `oppSheet` — **two sheets, two
declarations** — and there is no third seat.

**The measurement that matters for cost:**

| | |
|---|---|
| `battleRound` | **534 lines**, and `skill_battle.js` is 1,278 |
| two-sided references inside it | **36** (`playerSheet` / `oppSheet` / `playerDecl` / `oppDecl`) |
| callers | **2** — `encounters.js` and `worldtick.js` |

⚠️ **36 is the honest number for "how two-sided is it", and it is smaller than I expected.** The core is
already kind-agnostic: two sheets, two rolls, a margin delta. **What is two-sided is the PLUMBING, not the
maths.**

---

## §2 — ⛔ THE FOUR DECISIONS, AND I WANT THEM BEFORE I TOUCH ANYTHING

### 2.1 — DOES EACH ALLY GET A TURN, OR DOES THE PARTY GET ONE?

| | |
|---|---|
| **[A] each ally takes a full turn** | sense → action → bonus, each. ⚠️ **A 4-ally party makes a round four times as long, and the narrator has to write four beats.** Faithful, and slow. |
| **[B] the party takes one turn** | you declare; allies CONTRIBUTE to it — a heal folded in, a distraction as a modifier. ⛔ **Keeps a round one beat long.** ⚠️ **And it makes allies feel like equipment rather than people, which is the failure this whole build exists to avoid.** |
| **[C] you and one ally act; the rest contribute** | the ally you name this round takes a real turn. **A choice every round, and the round stays two beats.** |

⛔ **I lean [C] and I am not confident.** It preserves "they are people who act" while bounding the cost,
**and it makes "who do I bring forward this round" a real decision** — which is the thing a party adds that
a bigger single character does not.

### 2.2 — ⛔ CAN THE FOE CHOOSE WHOM TO HIT?

**Today `oppDecl` resolves against `playerSheet` and there is no choosing.** ⚠️ **If allies are targetable
and the foe cannot pick, interception has nothing to intercept** — every hit already comes to you.

**This is the decision that makes `intercept.js` matter or not**, and it is the one I would answer first.

### 2.3 — ⚠️ WHAT HAPPENS TO DIFFICULTY?

⛔ **Four allies against one foe is not the fight the threat numbers were tuned for.** Options: the
opponent side gets numbers too · threat scales with party size · encounters declare a party size they
assume. **This is a balance ruling and it is Erik's.**

**Erik has already said the point of this is that party members make "the more difficult things in the game
much easier or even possible" — so some of that swing is INTENDED. The question is how much.**

### 2.4 — MOMENTUM AND PRESSURE: PER SIDE, OR PER COMBATANT?

**Both meters are currently `{player, opponent}`.** ⚠️ **Per-side is simpler and probably right** — a party
has one initiative — **but a downed ally should cost the side something**, and today nothing would.

---

## §3 — WHAT I WOULD BUILD, IN THE ORDER I WOULD BUILD IT

1. ⛔ **TARGET SELECTION FIRST (2.2).** One question — "who does this land on?" — answered inside the round.
   **Everything else depends on it, and interception is inert until it exists.** Small.
2. **ALLY TURNS (2.1), whichever shape wins.** ⚠️ **The kit is already there** — `battleSkillsFor` returns
   an NPC's options in the same shape `playerBattleSkills` returns yours, so an ally declaring is the same
   code path as you declaring.
3. **THE RECEIPT.** ⚠️ **A four-combatant round is four times the text and the current receipt is already
   dense.** This is a real design problem and not a small one.
4. **DIFFICULTY (2.3)**, once there is something to measure.

⛔ **I would NOT do them together.** Step 1 alone makes interception live and changes nothing else.

---

## §4 — ⚠️ THE RISK I WANT NAMED BEFORE I START

**`battleRound` is 534 lines carrying every rule this project has ratified for six months** — evasion,
antisoak, pierce, imposition, the sense contest, tempo, pressure, unmaking, degradation. ⛔ **A rewrite to
N-sided would put every one of those at risk at once**, and this month has shown me repeatedly that I break
things by touching what I do not need to.

✅ **SO I WOULD ADD A SEAT, NOT REBUILD THE TABLE.** `playerSheet` / `oppSheet` stay exactly as they are;
targeting decides WHICH sheet fills the second seat for a given resolution. **A 1v1 round then resolves
byte-identically to today, which is a gate I would write first and keep.**

⚠️ **That is the difference between "the party works" in a fortnight and "the contest engine is broken" in
a week.**

---

## §5 — WHAT I NEED

⛔ **2.2 is the blocking one.** *Can a foe choose to hit the healer?* **Yes or no changes what I build
first.**

**2.1 and 2.4 I can proceed on with my leanings ([C], per-side) if you would rather not rule now — they are
reversible. 2.3 is not something I should decide at all.**

— CCode
