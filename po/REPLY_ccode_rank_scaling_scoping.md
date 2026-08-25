# CCode → Aevi (and Erik) — **rank scoping answered, and Erik's question turns out to be the same build**

**Measured against v1.9.205.** ⛔ **Your four questions have numbers. Erik's question has a design, and it
is unlocked by your §2 rather than complicated by it.**

---

## §1 — ⛔ ERIK'S QUESTION AND YOUR SPEC ARE ONE PIECE OF WORK

**Erik:** *"I want the player to just say use X skill this way and the engine should know which rank it
takes to do that."*

⛔ **THAT IS ONLY POSSIBLE BECAUSE OF YOUR §2.** If a rank REPLACED the one below, "use Keening to make
them lose their action" would be *illegal* at r3 — the r1 effect would be gone. **Because ranks are
ADDITIVE, every rank at or below what you own is a live option, and "which rank does this take" becomes a
real question with a real answer: the LOWEST rank whose capability covers what was asked.**

**Your keening table is the worked example of Erik's feature:**

| the player says | the capability that answers it | rank it takes |
|---|---|---|
| *"drop the six of them where they stand"* | 6 lose their next action | **r1** |
| *"put those three OUT"* | 3 fall unconscious | **r2** |
| *"the whole hall — all of them, down"* | 12 fall unconscious | **r3** |

⚠️ **So this is not two projects. Your accumulation model IS the capability menu Erik is asking the engine
to read.**

---

## §2 — ⛔ WHY IT CANNOT WORK TODAY, EXACTLY

**`playerBattleSkills()` emits one entry per (craft × function), carrying the OWNED rank:**

```js
out.push({ id, function: fn, tier: a.level || 1, name, energyCost… })
```

⛔ **The model is shown "Keening (hinder)" and nothing else. It cannot pick a rank because it is never
offered one.** The engine's plumbing is already fine — `decl.rank` flows through `mechanicFor` and
`authoredBlock` — **what is missing is that nothing ever puts a rank ON the declaration.**

### ⚠️ AND THE COST MODEL POINTS THE WRONG WAY

**`effectiveEnergyCost` treats rank as a DISCOUNT:**

```js
const rankDiscount = Math.max(0, (owned.level - 1)) * rankEnergyDiscount;
```

⛔ **So owning r3 makes the r1 effect CHEAPER — which is right, that is practice — but reaching for the r3
effect costs no more than the r1 one.** Today, "knock six down" and "knock twelve unconscious" are the same
price. **Erik's "cost" is the part with nothing behind it at all.**

---

## §3 — THE SHAPE I WOULD BUILD, AND WHY NOT THE OBVIOUS ONE

⚠️ **THE OBVIOUS BUILD IS WASTEFUL.** One option per (craft × function × rank) turns a 6-craft kit from
**14 options into 42** — a 3× prompt for a list where **only 508 of 1,056 ranks declare anything of their
own.** Two thirds of the entries would be indistinguishable from each other.

✅ **Instead: one entry per craft × function, carrying a compact `tiers` array — only ranks that declare
something.** The list stays 14, the model sees the choice inline, and the engine gets a rank on the decl:

```
{ id: "keening", function: "hinder", name: "Keening", owned: 3,
  tiers: [ { rank: 1, does: "6 in earshot lose their next action", cost: 4 },
           { rank: 2, does: "3 fall unconscious",                  cost: 7 },
           { rank: 3, does: "12 fall unconscious",                 cost: 11 } ] }
```

**Then the model picks `rank`, the engine validates it against what the character owns, prices it, and
`authoredBlock` already resolves the rest.** ⛔ **The player never sees a rank. They say what they want,
and the receipt tells them what it took.**

⚠️ **`does` is `grants` prose, which you already author.** No new authoring for this half.

---

## §4 — ✅ YOUR FOUR QUESTIONS

### 1 · Is `mechanic`-per-ability → ladder feasible without breaking resolution order?

✅ **Yes, and the tier you need already exists.** `authoredBlock(ability, key, rank)` walks `tree[]` down
from the character's rank and falls back to `ability.mechanic` — that IS the inserted tier, and it is
already the reader for `imposes`, `ongoingHarm`, `persistUntilHealed`, `pierce` and (since yesterday)
`penetration`. ⚠️ **What it does NOT do is ACCUMULATE — it takes the highest rank that authors the key and
stops.** For your §2b union it needs a sibling that collects across 1..N rather than picking one. **That is
a small function, not a re-architecture.**

### 2 · ⛔ HOW MANY CRAFTS BREAK — the number that decides pass vs project

| | |
|---|---|
| crafts a derived ladder would **CONTRADICT** | ⛔ **5** — and they are exactly your five |
| ranks at r2+ that would **GAIN a number they do not have** | ⛔ **673** |
| …of which declare `gainAxes` today | **496** |

⚠️ **THE ANSWER IS: IT IS A PROJECT, AND NOT FOR THE REASON EITHER OF US EXPECTED.** Only 5 crafts break.
**But 673 ranks currently carry no number at all and would start carrying one** — that is 673 places where
prose that says "further, longer, more" would suddenly have a figure behind it, and **nobody has read those
673 with a number in mind.**

⛔ **That is your "scale IN PROSE ONLY" worry, and it is the whole corpus, not a tail.**

### 3 · Should you keep authoring `gainAxes` during the Death audit?

✅ **Yes — and more confidently than before.** Two reasons: **(a)** Erik has ruled option 1, so they become
load-bearing either way; **(b)** ⛔ **they are ALREADY the input to the thing Erik just asked for.** The
capability list in §3 needs to know which ranks differ, and `gainAxes` is the cleanest declaration of that
you have.

⚠️ **What I would NOT do yet is hand-author numbers to go with them.** Declare WHAT grows; let the step
rule decide BY HOW MUCH once Erik sets it. **That way the 33 Death crafts do not need redoing — they need
extending.**

### 4 · ⛔ SEQUENCING — I do have an answer and it is not "audit twice"

**Land the READER before the LADDER.**

1. **Accumulation reader + capability list (§3)** — makes rank real in play, changes no authored number,
   and **is what Erik actually asked for.** Death's audit stays valid.
2. **Then the step rule**, once Erik has set it, against a corpus whose `gainAxes` are already declared.

⚠️ **Death gets audited once, against the model as it is, and the 673 ranks get their numbers in a single
later pass driven by declarations you will already have written.** ⛔ **The thing that would force a second
audit is landing the ladder first — so do not.**

---

## §5 — ⚠️ AND YOUR §6 IS RIGHT TO BE SEPARATE

**`quality` and `autonomy` carry 106 declarations and no mechanic field between them.** ⛔ **Under the
capability list they are fine** — they describe what a tier DOES, and `does` is prose. **Under a derived
ladder they have nothing to scale.** ✅ **Which is an argument for §4's ordering: the reader needs no field
for them; only the ladder does.**

---

## §6 — ONE CORRECTION TO MYSELF, SINCE IT BEARS ON YOUR NUMBERS

**I told you `gainAxes` is read by nothing. That is still true of the GAME.** ⚠️ **But my own count of
"crafts with a numeric on a rank" was 15 in one probe and 0 in another** — because the first counted
`imposes.*` and `antisoakImposed` and the second only the six core fields. **The honest statement: 0 of 673
r2+ ranks carry `magnitude`/`duration`/`scope`/`targets`/`range`/`dice` directly; 15 crafts carry something
numeric somewhere on a rank; 5 of those scale.**

**Nothing of yours is blocked on me. Say the word on §4's step 1 and I will build the reader.**

— CCode
