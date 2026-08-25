# SPEC — r0, the unlearned state: Erik's question, and the answer is yes

**Aevi → CCode · 2026-08-23 · Erik:** *"When you choose to learn a skill, r1 should gain you all the r1
stuff. Do we need an r0 that is an empty state to compare against?"*

⛔ **YES — AND NOT MAINLY FOR THE MENU BUG. `ownedRank: 0` IS CURRENTLY INDISTINGUISHABLE FROM r1, AND THE
ENGINE GRANTS THE CRAFT.**

---

## §1 — ⛔ THE FINDING THAT DECIDES IT

**`capabilities.js:55` and `:99` — `const owned = Math.max(1, num(ownedRank, 1));`**

```
capabilityMenu(kept_breath, 0)      -> tiers [1]        ⛔ a craft nobody has learned offers r1
resolveTier(kept_breath, want 1, owns 0) -> { ok: true } ⛔ AND THE ENGINE SAYS YES
```

⚠️ **THE FLOOR IS ONE, SO "DOES NOT HAVE IT" AND "HAS IT AT r1" ARE THE SAME VALUE.** ⛔ **This is the
absent-vs-explicit trap we have hit four times this week** — `mix: null`, `wired: false`, `band: null`,
`gainAxes: []` — **except here the collapsed state is a PERMISSION.**

**I have not traced whether a caller ever passes 0 in practice. ⚠️ THAT IS EXACTLY WHY IT SHOULD NOT BE
REPRESENTABLE AS r1** — it is safe until the one caller that does.

---

## §2 — WHY r0 IS THE RIGHT SHAPE AND NOT JUST A GUARD

**I could have asked for `if (rank <= 1) return true;` and closed the menu defect in one line. ⛔ ERIK'S
QUESTION IS BETTER AND HERE IS WHY.**

**The additive model says: THE CRAFT AT RANK N IS THE ACCUMULATION OF 1..N.** ⚠️ **An accumulation needs an
identity element — a base case to fold from.** **r0 is that element, and with it every tier obeys ONE
rule:**

> **tier N adds over the accumulation of everything below it.**

- **r1 adds over r0, which is empty — so r1 declares EVERYTHING, which is why "learning it gains you all
  the r1 stuff" is true by construction rather than by exception.**
- r2 adds over r1. r3 adds over r1+r2. **Unchanged.**

⛔ **THE CURRENT `tierDeclaresSomething` FAILS ON r1 BECAUSE IT COMPARES AGAINST A TIER THAT DOES NOT
EXIST AND FINDS NOTHING.** ⚠️ **With r0 the same function is CORRECT AS WRITTEN — r1's soak 5 is
genuinely new against an empty baseline.** **A special case says "r1 is weird." r0 says the rule was
always right and the base case was missing.**

---

## §3 — WHAT r0 IS, CONCRETELY

⚠️ **NOT AUTHORED CONTENT. No craft gets a rank-0 node** — 374 empty tree entries would be the worst
possible outcome of a good idea.

**r0 is a VALUE OF `ownedRank`, meaning NOT LEARNED, with the engine treating it as the empty capability:**

| | |
|---|---|
| `capabilityMenu(craft, 0)` | ⛔ **empty — no tiers, and that is correct** |
| `resolveTier(craft, want 1, owns 0)` | ⛔ **`ok: false` — "you have not learned this"** |
| the accumulation at r0 | **nothing — the identity element** |
| `tierDeclaresSomething(r1)` | ✅ **true, because r1 declares everything r0 does not** |

⚠️ **AND r1's numbers KEEP LIVING ON `ability.mechanic`** — no data migration, no 374-craft rewrite. **The
comparison changes; the content does not.**

---

## §4 — ACCEPTANCE

1. ⛔ `capabilityMenu(craft, 0)` returns **no tiers**, and `resolveTier(craft, 1, 0)` returns
   **`ok: false`** with a reason naming that the craft is not learned.
2. ⛔ `capabilityMenu(kept_breath, 3)` lists **r1, r2 and r3** — corpus-wide, crafts carrying r1 in the
   menu go from **103 of 374 to 374 of 374**.
3. **`distinct` still filters r2+ that are pure prose.** ⚠️ **Your 508-of-1,056 measurement is not wrong
   and I am not asking you to abandon the filter** — only r1 was ever misclassified.
4. ⚠️ **A caller that passes no rank must not silently become r1.** **Whether the default is 0 or 1 is
   yours — but the two must be distinguishable.**

---

## §5 — ⛔ THE ONE THING I WOULD CHECK BEFORE BUILDING

**Something, somewhere, may currently rely on the `Math.max(1, …)` floor** — a character sheet that lists
unlearned crafts, an NPC synthesised without ranks, a generator defaulting a field. ⚠️ **Changing 0 from
"grants r1" to "grants nothing" is a permission change, and permission changes fail in the direction of
"the thing the player could do yesterday is gone."**

**I would want that traced before the flip, and I cannot trace it — I do not know the callers.**

⛔ **AND IF YOU FIND CALLERS THAT PASS 0 MEANING "r1", SAY SO — that is a different ticket and a worse one,
because it means somewhere in the codebase 0 already means learned.**
