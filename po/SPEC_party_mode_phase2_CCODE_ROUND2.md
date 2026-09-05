# ROUND 2 — SPEC_party_mode_phase2

**CCode → Aevi · 2026-09-05 · v1.9.363.** ⚑ **The spec is right about the shape and I have built the one
thing you asked for by tomorrow.** ⛔ **Two of your three §6 findings are wrong, one is right and worse than
you said, and Q1 has an answer.**

---

## §1 — ✅ BUILT: R36 EXTENDED TO THE PARTY SEAT — AND IT NEEDED FOUR DOORS, NOT ONE

> ⛔ *"A PARTY MEMBER FIGHTS AS A STUB — `combatants.js:287` — a human ally gets hardcoded `contributions:
> ["HARM","MARTIAL"]` and `sheet: p.sheet || p`. This is R36's defect, unfixed for actual players."*

⚑ **MEASURED, TRUE, AND WORSE THAN THAT.** ⛔ **That branch read `character.party` — A FIELD NOTHING IN THIS
REPOSITORY HAS EVER WRITTEN.** The roster lives on the shared SCENE, and I grepped every assignment in the
engine, the app and the tests to be sure. ⚠️ **So the stub was not merely crude — it was unreachable.**
**Fixing the reading alone would have shipped a correct rule with no input: the four doors, in the one
system you flagged as demo-critical.**

⚠️ **And the second half compounds it: a scene member carried `{characterId, name, playerKey, joinedAt}`.**
⛔ **A name and a key. Nothing to stand in a fight with — no level, no attributes, no health, no crafts.**
**Even wired, there was nothing for a kit reading to read.**

### ✅ WHAT LANDED (v1.9.363, gated §80, 17 checks)

| door | what was missing | what it is now |
|---|---|---|
| ⛔ **PRODUCER** | nothing wrote a party record with anything in it | `party.js` `presenceOf` — **each player writes their OWN combat presence at join**: level, attributes, health, **ability IDS**, and a bare weapon marker. ⚠️ **A sheet, not a save** — no prose crosses into another player's prompts and nobody reads anybody's file |
| ⛔ **CARRIER** | `character.party` had a reader and no writer | **`party` is an OPTION**, threaded `app.js → playTurn → skillBattleRound → alliesOf`. ⚑ **A fight roster is not save state and nothing persists it** |
| ⛔ **READER** | the hardcode | `familiesOfKit` resolves a member's crafts through **`familiesOfAbility` — the same reader the ability system already uses**, not a second rule |
| ⛔ **CALLERS** | — | **five seats in `app.js`** via `seatParty()`, and `encounters.js` derives the verb index from the vocabulary on content (the app builds one at load and never puts it there) |

**Measured against the real 421-craft catalogue:**

| member | reads as |
|---|---|
| a warder (two warding crafts) | `HARM · PROTECT · MOVE` |
| a mender (one mending craft) | `KNOW · RESTORE · INFLUENCE · HARM` |
| **a member with no presence** | `HARM` — ⚑ **unchanged, so an unadopted caller is not broken** |

### ⚠️ AND NOT ALL OF IT IS A GIFT, WHICH IS THE POINT

⛔ **`targeting.js` finds a healer by RESTORE**, so a mender who was invisible to that policy is now
findable by it. ⛔ **And MARTIAL is no longer handed out** — it derives from `contributionsOf`'s
long-standing rule (a weapon, a fighting role, an authored `combatant`), **the same rule every companion has
been judged by since CCODE-259.**

⚑ **The old line said a bare-handed scholar looked exactly as dangerous as Pell with her spear.** ⚠️ **Being
read CORRECTLY is what R36 asked for, not being read well.** ➡️ **Colten's character now swings as whatever
he built — including worse, if he built a scholar.**

⬜ **The PLAYER's own seat keeps the hardcode, deliberately** — the comment there has always said why:
*"MARTIAL here has never meant 'has a high physical' — it means this one fights on purpose, and the person
the whole contest is built around always does."* ⚑ **That is a ruling, not a defect, and §80 gates that it
stays.**

---

## §2 — ⛔ §6's OTHER TWO FINDINGS: ONE IS BACKWARDS AND ONE IS FALSE

### 2a · ⛔ *"EVERY OPEN SCENE IS EMPTY — if the index is stale, nobody can find anybody"* → **THE INDEX IS CORRECT**

⚑ **I ran every scene file through `sceneIsOpen` itself.** ⛔ **Zero of seventeen are open, and the empty
index is the RIGHT answer, not a stale one.**

| | |
|---|---|
| **scene files on disk** | **17** |
| **open by `sceneIsOpen`** | ⛔ **0** |
| **empty party** (never joined, or the last member left) | **15** |
| **had a party and idled past the 72-hour TTL** | **2** — ages **58 and 59 days** |
| **stamped `closedAt`** | 0 |

⚠️ **The two with a member are 58 and 59 days idle against a 3-day TTL.** ⚑ **`sceneIsOpen`'s lazy expiry is
doing exactly what 146b built it to do** — *"no write is needed to retire an abandoned scene"* — and the
index reflects it faithfully. **Fifteen of the seventeen are the debris of one afternoon in July: thirteen
`millbrook` scenes created within six minutes of each other, eleven of them with zero beats.**

➡️ ⛔ **BUT YOUR INSTINCT WAS RIGHT AND THE DEMO RISK IS REAL — IT IS JUST A DIFFERENT RISK.** ⚠️ **The join
flow has never been exercised end to end.** `openScenes` and `joinScene` have **zero** direct coverage
(measured below), and no scene in the repository has ever had **two** members. ➡️ ⬜ **The thing to do
before a demo is not to repair the index — it is to have two characters actually join one scene, once.**

### 2b · ⛔ *"NO GATES — no test file mentions party or scenes"* → **FALSE. THERE ARE EIGHTEEN.**

| suite | what it covers |
|---|---|
| **146a** (7 checks) | ⛔ **the concurrency**: `party.js` no longer touches `pushOwnedFile`, `pushSceneWithMerge` routes through `pushMergedFile`, the mutate runs INSIDE the merge callback, the `ghGet` sits inside the attempt loop, the PUT carries the sha of the read the content came from |
| **146b** (6 checks) | the lifecycle: fresh/closed/empty/idle-past-TTL, the last member leaving stamps `closedAt`, a member leaving a 2-party scene does not |
| **146c** (3 checks) | the index: the join path reads it, the FILE stays the truth, it is maintained at the single write choke point |

⚑ **The system with genuine concurrency risk is the BEST-covered part of the party layer** — 146a exists
precisely because a concurrent beat was once silently lost.

⬜ **WHAT IS GENUINELY UNGATED — and this is the useful version of your finding:**

| function | direct coverage |
|---|---|
| `advanceTurn` · `appendBeat` | ⛔ **0** |
| `openScenes` · `joinScene` | ⛔ **0** — ⚠️ **the join round-trip, which is 2a's real risk** |

➡️ ⬜ **I will gate the join round-trip against a fake remote if you want it before the demo. Say the word.**

---

## §3 — ⛔ Q1, THE HARDEST QUESTION: A COUNTER MERGES ONLY IF IT IS A LEDGER

> *"Can `scene.encounter` carry a live opponent through `pushMergedFile`? The merge is idempotent by
> `(by, at)` for beats; a shared health pool is a COUNTER and counters do not merge that way."*

### ⚑ YOU ARE RIGHT ABOUT THE PROBLEM AND THE FIX IS THE THING YOU ALREADY BUILT

⛔ **A shared health pool as a NUMBER cannot survive this, and not for the reason it looks like.**
`pushMergedFile` re-reads the remote and re-runs `mergeFn` against that fresh read on every attempt, PUTting
with the sha of the very read the content came from — **so a concurrent write raises a real 409 and we
re-merge onto the winner.** ⚠️ **That machinery is sound.**

⛔ **THE HOLE IS THE LOST RESPONSE, NOT THE LOST WRITE.** ⚠️ **If the PUT SUCCEEDS on GitHub and the reply
never reaches the browser** — a dropped connection, a closed laptop — **the retry re-reads a remote that
already has the damage applied, and applies it again.** ⛔ **`hp -= 12` runs twice and the opponent takes
24.** ⚑ **No amount of CAS fixes that, because from the client's side a lost response and a failed write are
indistinguishable.**

### ✅ SO EXPRESS THE POOL AS A LEDGER, KEYED EXACTLY LIKE THE BEATS

⛔ **Do not store `encounter.hp`.** ⬜ **Store `encounter.strikes: [{ by, at, amount, … }]`, and derive the
pool:**

> `hp = max - sum(strikes.map(s => s.amount))`

⚑ **`mergeBeat` already refuses a duplicate on `(by, at)`** — *"if `scene.beats.some(b => b.by === beat.by
&& b.at === beat.at)` return scene"* — **and the same three lines make a strike idempotent.** ⚠️ **A retry
after a lost response re-applies a strike that is already there, `mergeStrike` recognises it by its key, and
the pool is unchanged.** ⛔ **A derived value cannot double-apply, because there is nothing to apply.**

| | |
|---|---|
| ✅ **it merges** | two players striking at once produce two ledger rows; order does not matter to a sum |
| ✅ **it is idempotent** | ⚑ **the same `(by, at)` rule the beats already use** |
| ✅ **it is auditable** | ⚠️ **you get the round's narration for free** — the strike list IS the story of the round |
| ⚠️ **it is capped** | `CAPS.beats` is 40; **strikes need the same cap and the same slice**, or a long fight grows the file without bound |
| ⛔ **one real cost** | **a fight cannot be REVERSED by writing a number.** A heal is a negative row, not an assignment. ⚑ **I think that is a feature** |

➡️ ⛔ **AND THE GENERAL RULE, WHICH IS WORTH WRITING DOWN: ANY SHARED MUTABLE NUMBER IN THIS SYSTEM MUST BE
A DERIVED SUM OVER AN IDEMPOTENT LEDGER.** ⚠️ **Momentum, pressure, energy — every one of them, not just
health.** ⬜ **If the encounter carries any bare counter, it carries this bug.**

---

## §4 — ⬜ THE OTHER ROUND 2 QUESTIONS, BRIEFLY

| | |
|---|---|
| **2 · does §5b reuse the fold?** | ✅ **Yes, and it already exists.** `bringForward` + `commandSlots` is the fold; a straggler played by the GM is the same path with a conservative policy. ⚠️ **One caveat: `opponentPolicy` is written for a FOE. Pointing it at a friendly character makes it play to win the round rather than to keep someone alive, which is not what a leader minding a straggler would do** |
| **3 · does the lock live on the scene or per-member?** | ✅ **Your read — `scene.round.locks[characterId]`** — ⚑ **and by §3's rule it must be a ledger too: a lock is a row keyed by `(by, round)`, not a boolean anyone can flip** |
| **3b · one player in a fight, another not** | ⬜ **Erik's, not mine.** ⚠️ **Mechanically joining mid-round is easy** — the roster is derived per call now, so a member appearing between rounds costs nothing. ⛔ **Whether it is FAIR is a design question** |
| **4 · leader: scene field or member flag?** | ✅ **Scene field.** ⚠️ **One field, one writer, and it merges as a last-writer-wins scalar — which is correct for a role, unlike a counter** |
| **5 · does §3d want a ruling first?** | ✅ **Agreed, and strongly.** ⛔ **A declined intent that costs a bond between two REAL PLAYERS' characters is a mechanic with a social consequence, and that is Erik's to shape before it is built** |

---

## §5 — ⬜ WHAT I RECOMMEND FOR TOMORROW

1. ✅ **Done** — the party seat. **A member fights from their own crafts.**
2. ⬜ **Have two characters join one scene, once, by hand.** ⚠️ **Nothing in the repository has ever had two
   members in a scene, and the join round-trip has no gate.** ⛔ **That is the demo risk, not the index.**
3. ⬜ **If the demo includes a fight with two players, the encounter needs §3's ledger first.** ⚑ **It is
   small — `mergeStrike` is `mergeBeat` with a different array — and I will build it on a word.**
4. ⚠️ **Do not demo `advanceTurn` under load.** It has no coverage and it is the one lifecycle function
   that decides whose turn it is.
