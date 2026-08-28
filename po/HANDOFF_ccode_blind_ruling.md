# HANDOFF — Erik ruled the blind/taunt red. ⛔ THE ENGINE WINS, AND THE WORD IS THE DEFECT.

**Aevi → CCode · 2026-08-28 · doc updated; your assertion still red because it asserts the OLD claim.**

---

## §1 — THE RULING, VERBATIM

> **Erik: *"You can taunt from the darkness… however, a rockfall isn't a foe — it's an obstacle or a hazard.
> Blind shouldn't mean cannot be reached… not sure why it means no preference either. BLIND IS CAN'T SEE."***

⛔ **THREE SEPARATE THINGS, AND ONLY THE THIRD IS A DEFECT.**

### 1a — ✅ THE TAUNT: YOUR ENGINE WAS RIGHT. THE DOC WAS WRONG.

**`targeting.js` short-circuits a taunt above the policy branch on the principle *"you cannot demand
something's attention and also be hidden from it."*** ⛔ **Erik: you CAN taunt from the darkness.**

✅ **§8 no longer claims a blind foe cannot be drawn. `targeting.js` NEEDS NO CHANGE.** ⚠️ **Your assertion
is hard-coded to the old claim, so it stays red until you update it — that is yours, not mine.**

### 1b — ✅ AND THE EXAMPLE WAS THE REAL ERROR: A HAZARD IS NOT A FOE

⛔ **I argued the case with a ROCKFALL and Erik removed the example rather than the rule.** ⚠️ **Targeting
policy is a question about things that CHOOSE. A rockfall does not choose and does not need a policy at
all** — it is a hazard, and hazards are a different kind of object.

**That is worth holding on to: the whole disagreement came from testing a targeting rule against something
that should never have had a target policy.**

### 1c — ⛔ THE DEFECT: `blind` IS A RANDOM PICKER WEARING THE WRONG WORD

```js
blind: (allies, { rng }) => allies[Math.floor(rng() * allies.length)] || null
```

⚠️ **AND YOUR OWN FILE ALREADY ARGUES AGAINST THE NAME, six lines down:**

> *"⛔ what a policy DEGRADES to when the foe cannot support it. **Not to `blind` — a foe that has been
> blinded is not a foe that has become random, it is a foe reduced to what it can still feel.**"*

⛔ **THE ENGINE KNOWS. THE NAME DOES NOT.** **`blind` is doing the job of *"has no preference / does not
choose"*, and Erik wants the word to mean *cannot see* — which is a genuinely different mechanic, and one
worth having later.**

---

## §2 — WHAT I WOULD ASK FOR, AND IT IS A RENAME NOT A BEHAVIOUR CHANGE

1. ⛔ **Rename the policy.** ⚠️ **My suggestion: `unchoosing`** — it says exactly what the function does and
   it is not a word we will want for anything else. **`indiscriminate` and `mindless` also work; `mindless`
   is narrower than the function (a construct is mindless, a berserker is not, and both pick at random).**
   **Your call — you own the file.**
2. ✅ **Behaviour unchanged.** Same random pick, same `POLICY_NEEDS: 0`, same degrade rules.
3. ⚠️ **One authored user to migrate: `set_hand_labour` in `sunk_assay_intake`, which I authored as `blind`
   with the note *"a set body does not choose a target."*** ⛔ **That note is right and the word was wrong —
   I will re-author it the moment you land the rename.**
4. ✅ **`blind` freed.** ⚠️ **Do NOT build a see/can't-see mechanic now** — it has no consumer and that is the
   thing we keep deleting. **Just stop the word meaning something else.**

---

## §3 — LOGGED

**Three rows added to `docs/HOW_IT_WORKS.md` §0**, per Erik's standing requirement: the taunt ruling
(engine right, doc corrected), the hazard-is-not-a-foe distinction, and the naming defect as **OPEN** with
its blast radius — `POLICY_NEEDS`, `set_hand_labour`, and any foe authored `blind`.

⚠️ **§8 of the doc now states all three.** ⛔ **The suite stays at one red until your assertion is updated to
the ruled behaviour — and I would rather it stay red than have me edit your test to make it green.**
