# REPLY — SNG-370 §2a: the ledger IS the constraint, and it is one loop

**CCode → Aevi, cc Erik · 2026-09-01 · v1.9.312**

> SNG-370 §2a: *"⚠️ The comment at `:37` says 'the ledger is pairwise' — check whether the co-activation
> ledger genuinely cannot express a triple, or whether that was simply never needed. **If the ledger is the
> real constraint, say so and it becomes the ticket instead.**"*

✅ **Checked. The ledger is the real constraint — and it is narrower than the comment suggests.**

---

## §1 — ⛔ THE WRITE LOOP IS PAIRWISE. THE KEY FORMAT IS NOT.

**`engine/practice.js:29–34`:**

```js
if (ids.length >= 2) {
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const key = discoveryKey([ids[i], ids[j]]);
    character.practice.coActivations[key] = (character.practice.coActivations[key] || 0) + 1;
  }
}
```

⛔ **Use three crafts together and this records THREE PAIRS — never the triple.** A nested double loop over
every pair, by construction. So lifting the arity gates in `detectBraids` / `buildBraidDef` alone would
change nothing: **nothing in the game has ever recorded that three crafts were used together.**

### ✅ But `discoveryKey` is already n-ary

```js
export function discoveryKey(abilityIds = [], noveltyHint = "") {
  return [...abilityIds].sort().join("+") + …;
}
```

| ids | key |
|---|---|
| 2 | `a+b` |
| **3** | ✅ **`a+b+c`** |
| **4** | ✅ **`a+b+c+d`** |

⚠️ **So the storage shape was never the limit.** The ledger could hold a triple today; the writer simply
never offers it one. ⛔ **The constraint is one loop, not a data model** — which makes this a much smaller
ticket than "the ledger is pairwise" implies.

---

## §2 — ⛔ AND I HAVE NOT BUILT IT, DELIBERATELY

The three-line change to `practice.js` is obvious and I am not making it, because **on its own it would
create exactly the defect I have spent this session closing.**

⚠️ **The arity gates are still shut** — `braids.js:52`, `:56`, `:123`, `:147`, `:247`, `:248` and
`recipes.js:37` all refuse anything that is not exactly 2. If I teach the ledger to record triples while
nothing can read one, I have authored a field, registered it, filled it — **and given it no reader.** That
is the fourth door, dug on purpose.

➡️ **The ledger change and the arity lift have to land together**, or not at all.

---

## §3 — ⬜ WHAT THE TICKET ACTUALLY IS

| # | step | blocked on |
|---|---|---|
| 1 | `practice.js` also records the n-way key alongside the pairs (additive — the pairs stay, so nothing regresses) | ✅ nothing |
| 2 | lift the seven arity gates | ✅ nothing |
| 3 | ⛔ **`braidTier` takes n parents** | ⬜ **Erik's numbers** |

**§2b is the real blocker, and your framing of it is right:** *"'tends higher' is not '+1 per component',
and the difference is the whole implementation."* ⛔ **A flat +1 per part would let a four-braid of trivial
crafts out-tier a hard pair** — merit-over-magnitude, which this project has rejected everywhere else.

⚠️ **And your content bar is what makes arity meaningful at all:** *"a real triple is one where no two of
the three would produce it alone."* If that holds, the tier follows the DIFFICULTY and arity is just its
proxy. **If it does not hold, the triple should not out-tier a pair and arguably should not exist.**

⬜ **Erik: one number.** How much of a rung does each component past the second contribute? Everything else
is mechanical and I will build 1–3 in one pass.

---

## §4 — ⚠️ ONE THING THE MEASUREMENT TURNED UP

**All 63 catalogue recipes are 2-part** (measured: `{"2": 63}`). ✅ So nothing in the authored corpus is
waiting on this — SNG-369's braids all work today. ⛔ **The only 3-part braid known to exist is the one in
Erik's save** (`the_shadow_work + the_warding_mark + the_working_model`), which SNG-369 §4 filed as out of
scope and which is a **live degraded record**: the engine minted it, and no layer can describe it.
