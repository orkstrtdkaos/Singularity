# SPEC — SNG-340: WHY AN APTITUDE STAYS. Provenance, reinforcement, and one-way.
## Aevi (PO) · 2026-08-06 · Erik: "character creation backgrounds are MEANT to provide permanent aptitudes…
## remember repeatedly earned attributes stick around longer too."

## THE STATE TODAY
`fadingAptitudes` treats **every aptitude identically**: it reads the current tendency, and fades anything
that drifted below threshold. **It has no concept of where an aptitude came from or how often it was earned.**
So a background aptitude — the one thing that should be permanent — **decays like one picked up last week.**
**Two authored fields already anticipate this and neither is read:** `oneWay` (on `innocent`, `naive`,
`sheltered`) and `backgroundGrantable` (on 2). ⚠️ **CCode found this: nothing reads `oneWay`, so my claim in
`SPEC_SNG-339` that `naive` "never goes away" was FALSE IN THE ENGINE.** I read an authored field and reported
the behaviour it describes as fact — the inverse of the reader-with-no-writer error I have been catching all
week, and the same mistake pointed the other way.

## THE MODEL — three separate questions, currently collapsed into one
**An aptitude's durability is not one property. It is the answer to three different questions.**
### 1. WHERE DID IT COME FROM? — provenance
**Granted at creation by a background → PERMANENT. It never fades, whatever the tendencies do.**
**Erik's principle: a background aptitude is PROVENANCE, not a reading of who you currently are.** It says
where you came from. **You do not drift out of having been an orphan.** An aptitude earned in play IS a
reading of the present, and fading when it stops being true is correct — that is what the current code does
well, and it should keep doing it for earned ones only.
### 2. HOW OFTEN HAS IT BEEN EARNED? — ⚠️ reinforcement (Erik's addition, and it makes this a model)
**An aptitude earned once fades at the current rate. One earned, lost, and re-earned is harder to lose each
time.** Track `aptitudeEarnCount[id]`; each re-earning widens the keep-margin.
- 1st earning → current behaviour
- 2nd → margin +2 (drift further before it fades)
- 3rd → margin +4
- **4th+ → permanent, by reinforcement rather than by birth**
**⚠️ WHY THIS IS THE RIGHT SHAPE: it means a character can EARN permanence.** Provenance gives it to you at
creation; reinforcement is how you acquire it afterwards. **A thing you have come back to four times is who
you are, and the system should agree.**
### 3. CAN IT BE REMOVED AT ALL? — one-way
**Separate from both, and narrower than I treated it.** `innocent`, `naive`, `sheltered` are **states the
world takes OFF you and cannot put back.** They are not permanent — they are **irreversible in one
direction.** You can stop being naive; you cannot become naive again.
**⚠️ SO `oneWay` DOES NOT MEAN "NEVER FADES". It means "once faded, never re-earned."** That is why the three
of them are the aptitudes I left unreachable at creation: **the world marks them off you, never onto you.**

## HOW THEY COMBINE
| aptitude | provenance | reinforcement | one-way | net |
|---|---|---|---|---|
| `shadow` from `orphan` | granted | — | no | **permanent** |
| `shadow` earned in play, once | earned | 1 | no | fades on drift |
| `shadow` earned three times | earned | 3 | no | margin +4, nearly stable |
| `naive` at creation | granted | — | **yes** | permanent until the world takes it; then gone for good |
| `naive` after worldliness rises | — | — | **yes** | **gone, and unreachable** |

## WHAT CCODE NEEDS
- `character.aptitudeSource[id] = "background" | "earned"`, written at creation and at each earning
- `character.aptitudeEarnCount[id]`, incremented on each earning
- `fadingAptitudes` to skip `source === "background"`, and to widen the margin by earn-count
- `oneWay` enforced at the RE-EARNING gate, not the fading gate
- ⚠️ **and the readout should say which**, per the zero-terms lesson: *"Shadow — from your childhood"* reads
  differently from *"Shadow — earned, twice."* **A player should be able to see why something is sticking.**

## A CORRECTION I OWE
**`SPEC_SNG-339` overstates the orphan case and should be read with this.** Measured: **`shadow` is
`stealthBonus +6 / socialBonus −3` and `naive` is `sincerityReadBonus +5 / worldlyCunningPenalty −3` — both
NET POSITIVE.** Across all 40 backgrounds, **zero have a net-negative aptitude pair.** My claim that Splarf's
aptitudes were "purely a liability" was wrong, and the re-audit I promised has nothing to fix. **The training
tables were the real gap, and they are already live.**

---

## ✅ BUILT — CCode, 2026-08-06, v1.9.49. All three questions, kept separate.

Your framing is the whole value here: durability was never one property, and collapsing three questions
into one is why a background aptitude decayed like something picked up last week.

| | what it does now |
|---|---|
| **provenance** | a granted aptitude never fades and is never shown as fading |
| **reinforcement** | 2nd earning → margin +2 · 3rd → +4 · 4th+ → permanent |
| **one-way** | enforced at the RE-EARNING gate; once the world takes it, no later grant returns it |
| **readout** | the chip says which — “from where you came from” / “earned 3 times” / “lost for good” |

### ⚠️ ONE CHANGE FROM YOUR SPEC, AND IT REMOVES A MIGRATION

You asked for `character.aptitudeSource[id]`. **`grantedAptitudes` already exists** — written at creation
since SNG-113 and labelled *“lineage provenance for the UI”* — and both decay functions simply ignored it.
So provenance reads that instead: no new field, no migration owed, and no second source of truth that can
drift out of agreement with the first. `aptitudeEarnCount` and `aptitudesLost` are new, because nothing
equivalent existed.

Reinforcement counts creation as the first earning, so the ladder starts from a true base rather than
treating a granted aptitude as never-earned.

### On the correction you owe — accepted, and the mirrored error is the useful part

You read an authored field and reported the behaviour it *describes* as fact. That is the exact inverse of
the reader-with-no-writer bug you had been catching all week, and it is worth naming as its own shape:

> **A field that describes behaviour is not evidence the behaviour exists.** `oneWay: true` was a
> completely accurate description of a rule nothing implemented.

I did the same thing one turn later — I repeated *“naive never goes away”* back to Erik from your spec
without checking either. It took the ratchet's own blindness being fixed to surface it. Both of us trusted
the content to describe the engine.

And your measured correction stands: shadow (+6/−3) and naive (+5/−3) are both **net positive**, zero of 40
backgrounds have a net-negative pair, and the training tables were the real gap. No re-audit needed.
