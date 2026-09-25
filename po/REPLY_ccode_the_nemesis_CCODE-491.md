<!-- status: SNG-648 built and shipped — five findings need Aevi's word, one of them the test case -->
# REPLY: CCode → Aevi, Erik — the nemesis (CCODE-491, v2.6.1, shipped)

**CCode · 2026-09-24** · `engine/nemesis.js` · `nemesisDetail` in `gm_registry` · the offscreen-death refusal at
**both** doors · reconcile step 82 · `rules.nemesis` landed in the same commit as its reader, as your staged file
asked.

Erik: *"I want you to make sure the game engine and GM know to do this."* Both halves are in. §360 gates it with
fourteen assertions.

## What it does

`nemesisCandidates` scores every eligible figure on the five signals a score can judge, keeps your `shortlist` of
3 with their reasons, and hands them to one model call with the personal arc. That call picks, binds the legend
with one of your four authored relations, and writes `character.nemesis`. `applyNemesisChoice` **refuses** a figure
that was not on the shortlist and a relation that is not authored — a model that invents either has invented an
opponent.

**The GM block** gives who, why in plain words, where and in what state, what they want, the legend tie, and your
pacing line — *the nemesis acts on its own clock* — which `pacing.js` has been saying for months with nobody to
point at. It marks an unmet nemesis so the name is never used before the fiction gives it.

**The offscreen protection is at both doors**, through one predicate: `worldtick.applyEpicClashOutcome` for this
world's own clash, and `fates.adoptFates` for another world's. The second is the one you actually caught — the
Scouring Hand dying on world day 76 at the Deep Lantern's hands — and a bound nemesis now comes out of it
**wounded**, never dead. A figure who is not the nemesis still dies. Both directions gated.

---

## ⛔ Five findings, and the first is your test case

### 1 · Silas: the engine picks Morvane, not Cinder Vael — and your rule says review the scoring

Cinder **is** on the shortlist. She scores **4 of 16**; Morvane scores **7**. You counted four signals for her and
the engine can award one. Two precise causes:

- **`seatStakes` cannot be earned at all** (−2). She is the Building challenger, and no loaded arc carries a
  claimant or a seat: 6 greater arcs, none of them. SNG-642 and SNG-644 are still staged. The signal reports that
  rather than scoring zero, and it starts firing the moment you land them — proved in the gate with a fixture arc.
- **`wantsTheirGround` is a PROXIMITY test, and she is not close** (−3). `groundWithinDays: 12`; the Ceaseless sit
  **108 to 262 walking days** from Silas's five holdings. Your reason for her was *"the Ceaseless build over
  anything not given"* — which is a fact about **what they are**, not about how far away they are.

**Relax that one dial to 400 and Cinder ties Morvane at 7 and wins the tiebreak.** So: is "wants your ground"
about distance or about intent? If intent, the signal should read the power's verbs and its temper and drop the
distance — a nemesis being far away is often the whole point of them. Your call; I have not touched the dial.

### 2 · The kin signal is worse than "no tag", and you were right to ask

There **is** a `kin` field — on **one** of Silas's 39 known people — and it holds `"sworn"`, which is a bond and
not a kinship, on somebody with no recorded place. **`silas-mother` carries no kin field at all**; her kinship is
in her `role` prose: *"Mother — lives at the cairn-line house on Cairnhold's center lane"*.

So the signal as specified would fire on the wrong person and never on the right one. It reports the population
and scores nothing. **It may not read prose to find a mother**, because it would one day find somebody else's —
so this one needs a field before it can work. A `kin: "mother" | "father" | "sibling" | "child"` on the registry
entry would do it, and the reader is already written to use it.

### 3 · A character with no ground and no company gets nobody

Four of the six signals are about **property or people** — holdings, stewards, company, kin. So an unlanded
character can only be matched by `mirror`, and that needs a villain of their own people.

**Nine of the sixteen saves here have no holdings and get no shortlist at all.** Erik asked that *every* character
gets a nemesis. The gap is a signal that reads something a new character already has: their people, their
origin's `whyHere`, the arc's own premise, or the region they started in. Yours to rule what it should be.

### 4 · `personalArc.legend` is a slug that resolves to nothing

Your §1 called it *"free text bound to nothing"*. It is worse: on Silas's save it is **`the-finished-thing`**, a
slug that resolves to no legend record and no npc — while **`legendNpc`** beside it holds the real
`{name, role}`. Free text is honest about being text; a slug looks like a reference. The prompt is given the
`legendNpc`'s own words and told the slug is a label.

### 5 · The choice is a model call, so reconcile can only stake the shortlist

Your §3.5 asks a reconcile step to run the choice. A step runs on load, synchronously, with no key and no network
— and the one signal a score cannot judge (*does the figure answer the arc?*) is exactly what the call is for. A
step that "chose" would be binding a nemesis by score alone and calling it a judgement.

So the pure half is step 82 and `app.maybeChooseNemesis` does the rest off the play loop, the same seam the codex
summariser uses. **Seven of sixteen saves have a shortlist staked; a character whose shortlist is staked has a
nemesis the moment they next play.**

---

## Smaller things worth knowing

- `signature` is on **0 of 56** eligible figures — your `arcResonance` note names it, so the prompt uses `role`
  and `wants`, which are on 56 of 56.
- `alignment` is on **30 of 56**, so `excludeAlignments: ["hero"]` cannot bar the other 26, and `mirror`'s
  villain requirement narrows it to 10. Reported per-figure as unreadable rather than silently skipped.
- `status` is on **2 of 56**, so "not dead" is read from `worldState.epicStatus`, which is where a world actually
  records it and what `presence.js` already reads.

Nothing here writes to content. `character.nemesis` is the whole of the feature's state.

v2.6.1. 3,653 assertions · 31 suites · zero failures · no baseline red.
