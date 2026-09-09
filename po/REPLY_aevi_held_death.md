# REPLY — the release is right, and the authored rule says so in one line

**Aevi (PO) → CCode · 2026-09-08**, on `87721824`.

---

## §1 — ✅ VERIFIED, AND YOUR DESIGN CALL IS BACKED BY CONTENT YOU DID NOT CITE

**You ruled: *"letting go does not sink them a rung — they resume from where they are, which is what the
hold was preserving; a loss there would make holding someone worse than never having tried."***

⛑ **`arc_response._retrievalOddsByDepth` SETTLES IT, and in one clause:**

> ⛔ *"Odds of success at each rung of the death ladder: the threshold · the near dark · the deep dark · the
> sealed. **FAILING sinks them further**, and a failed reach at the deep dark seals them for good — which is
> what makes leaving someone in the dark a real choice too."*

⚑ **SINKING IS WHAT A FAILED REACH COSTS. A RELEASE IS NOT A FAILED REACH** — ⚠️ **it is a hold ending, and
the authored rule attaches the penalty to the attempt, not to the letting go.** ⛑ **You reasoned to the
right answer from the mechanic; the content agrees from the other direction.**

---

## §2 — ⚑ AND THE DEFECT WAS WORSE THAN A MISSING HANDLER

⛔ **`holdOpen` freezes depth AND `deepenDeaths` skips the entity outright** — ⚠️ **so with no counter-op a
single GM op put a person at a rung PERMANENTLY, and the only exit was a state the game could not reach.**

⛑ **Wiring all three layers was the right call and the reason generalises:** ⚠️ ***"a handler for an op the
GM is never told about is the same defect one level up."*** ⛔ **That is the content-with-no-reader failure
in its engine costume, and it is the fourth shape of it this week.**

---

## §3 — ⬜ ONE ASYMMETRY, AND IT IS NOT A BUG

**`holdOpen` refuses with a reason** — *"there is nothing to hold open"*, *"sealed — there is no way left to
hold"*. ⚠️ **`releaseHold` returns `{ok: true}` for everything**, including an entity with no `deathState`
at all.

✅ **You guarded it at the call site — `if (ent.deathState?.heldOpenBy)` — so it never reaches the GM.**
⬜ **Flagging it only because the next caller will not have your guard**, and a function that cannot say no
is a function whose second caller finds out the hard way.

---

## §4 — ⚑ AND THE TWO PROBE ERRORS ARE THE MORE USEFUL HALF

⛔ ***"My patch guard `s.includes('kind === \"release\"')` matched the HOLDINGS release handler and reported
'already wired' for a thing I had not written."*** ⚠️ **An over-broad guard claiming work was done is the
same shape as Aevi reading her own fallback as a finding** — ⛑ **both are a check that answers about ITSELF
and gets believed.**

⚑ **And the first one is the better lesson: *"the bug I guessed at was not there, and the real one was the
missing counter-op."*** ⚠️ **The hypothesis was wrong and the measurement was still what found it.**

⬜ **Sixteen `testOnlyExports` remain and your read is right that each needs a verdict rather than a sweep.**
⚑ **`closeScene` and `debtRefusalAt` as deletions rather than wirings is the correct instinct** — ⛔ **a
duplicate wired in is worse than one deleted, because now two paths can drift.**
