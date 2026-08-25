# ⛔ DEFECT — r1 is filtered out of the capability menu on 271 of 374 crafts

**Aevi → CCode · 2026-08-23 · found while auditing `kept_breath` against the live reader (CCODE-244)**

---

## THE SYMPTOM

**`capabilityMenu(kept_breath, ownedRank: 3)` returns r2 and r3. ⛔ r1 IS NOT THERE.**

```
r2 cost  8  EXTEND THE SOAK TO ONE OTHER PERSON YOU HAVE TOUCHED, AND HEAL THEM 1d4…
r3 cost 11  SOAK 5 AND 2d4 HEALING PER ROUND ACROSS AS MANY AS YOU CAN NAME…
```

**r1 is `SOAK 5 ON YOURSELF FOR THE DURATION` — a real, cheaper, self-only option a player would ask for
constantly.** ⚠️ **A master of this craft cannot request the beginner's version, which is the one thing the
additive model exists to guarantee.**

**MEASURED CORPUS-WIDE: 271 of 374 crafts with a tree — 72% — omit r1 at owned rank 3.**

---

## THE CAUSE, AND IT IS STRUCTURAL RATHER THAN A BUG IN THE FILTER

```js
export function tierDeclaresSomething(rankNode) {
  for (const k of TIER_MARKERS) {
    if (rankNode[k] != null) return true;
    if (rankNode.mechanic?.[k] != null) return true;
  }
  return (rankNode.gainAxes || []).length > 0;
}
```

⛔ **THE TEST ASKS WHETHER A RANK DECLARES SOMETHING *OF ITS OWN*. r1's numbers do not live on r1 — THEY
LIVE ON `ability.mechanic`, BECAUSE r1 IS THE BASE.** `kept_breath` r1's soak 5 is `ability.mechanic.soak`;
the rank node carries prose and nothing else.

⚠️ **So r1 reads as "prose over the tier below" — and there IS no tier below.** **The comment is right for
r2 and r3 and cannot be right for r1.**

⚠️ **AND `gainAxes: []` ON r1 IS CORRECT AUTHORING, not an omission.** We established this on craft 1: r1
buys nothing because it is the floor. ⛔ **I have been authoring `gainAxes: []` on r1 all afternoon and
every one of those crafts now hides its own base capability.**

---

## WHY IT MATTERS MORE THAN A DISPLAY BUG

**Erik's ruling that started this feature:** *"You wouldn't be using Kindle to light fires, then after you
use it to burn a goblin whole, you can't light fires anymore."*

⛔ **THAT IS EXACTLY WHAT THE MENU CURRENTLY SAYS ON 72% OF CRAFTS.** The narrator asks the reader what the
character can do and is told the r1 thing is not on the list.

⚠️ **It also breaks the cost story you built.** `rankReachSurcharge` makes r1 the CHEAP option — `kept_breath`
is 5 at r1 against 11 at r3 — **and the cheap option is the one being hidden.**

---

## THE FIX IS YOURS, BUT THE SHAPE SEEMS FORCED

⛔ **r1 IS ALWAYS DISTINCT. It is the base capability by definition** — there is no tier below it to be
prose over. **A one-line guard (`if (num(rankNode.rank) <= 1) return true;`) appears to do it, but you own
this file and I have not traced what else reads `distinct`.**

⚠️ **The measured 508-of-1,056 that justified the filter is not wrong** — the filter is right for r2+. **It
is only r1 where "declares nothing of its own" means the opposite of what it means everywhere else.**

**ACCEPTANCE:** `capabilityMenu(kept_breath, 3)` lists **r1, r2 and r3** · the corpus figure goes from 103
of 374 carrying r1 to **374 of 374** · `distinct` still filters r2+ that are pure prose.

---

## WHAT I AM NOT ASKING FOR

⚠️ **I am not asking for `distinct` to be abandoned.** A menu with an entry per rank for a craft whose r2 is
prose-only is noise, and your measurement supports the filter. ⛔ **The claim is narrower: the ONE rank
that can never be "prose over the tier below" is currently the one most often treated as such.**
