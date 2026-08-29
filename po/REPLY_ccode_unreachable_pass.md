# REPLY — ⛔ four capabilities wired, a flag that was stamped NEVER, and two that need a ruling before I touch them

**CCode → Erik and Aevi · v1.9.254 · `testOnlyExports` 26 → 20**

**I took my own biggest red: exports that pass CI and cannot fire in play. Four of them were features.
Two more are, and I have stopped at the point where building would be guessing.**

---

## §1 — ✅ PROJECTS: FOUR CAPABILITIES, ONE LINE FROM REACHABLE

`interruptProject` · `resumeProject` · `sabotageProject` · `inheritProject` — **built, exported, called by
nothing.** Not `app.js`, not another module, **not even inside `projects.js`.** The handler already looped
`turn.projectOps` and silently `continue`d on anything that was not `"open"`.

⛔ **AND CONTENT ALREADY DEPENDED ON THEM.** `craft_mechanics.json`: *"a threshold can be interrupted,
hurried by more hands, set back by sabotage, and inherited. **Sunk Assay L4 is built on all four.**"*

✅ **All three legs of the op triple wired** — the GM contract §18b, the op shape, the handler. Verified end
to end, and the history reads as narrative:

```
opened → interrupted: the roof fell in → resumed → set back 2 by Deni Cors → taken up by Warden Coll
```

⚠️ **Sabotage is BOUNDED by a new `sabotageMax` dial (4).** `sabotageProject` already clamps to what is
banked, but an unbounded op could wipe a long work on one hallucinated number — ⛔ **and a threshold that
can be erased at a stroke is a date wearing a threshold's name**, which is what SNG-522 §1 exists to avoid.

---

## §2 — ⛔ CONDITIONS: A FLAG STAMPED EXACTLY NEVER

**`skill_battle` wrote `persistUntilHealed: authoredBlock(decl, "persistUntilHealed", rank) === true`.**

⛔ **ALL SIX CRAFTS AUTHOR AN OBJECT THAT NAMES WHAT PERSISTS. NOT ONE AUTHORS `true`.**

```
sustained_regard {condition:"bleeding"}    grey_hand   {condition:"enfeeblement"} ×3
hastened_grey    {condition:"decay"}       grief_strike{condition:"vulnerability"}
```

**So the flag never landed — and `resolveSoothe`, which already honours `c.persistUntilHealed`, had
nothing to honour.**

✅ **`conditions.js` had the right readers all along.** `persistsUntilHealed()` accepts both shapes;
`persistedConditionName()` returns the name the object carries. **Both exported, both called by nothing —
a reader and a writer that never met.** Now wired, and the condition carries `persistedAs`, so *bleeding*
and *enfeeblement* stay different things to be carrying rather than collapsing into a boolean.

⚠️ **Third `=== true` against a richer authored shape this week**, after `isProjectCraft` vs
`projectTicks: "r3"`. **Aevi's object shape keeps winning and my comparisons keep assuming the boolean.**

---

## §3 — ⛔ INTERCEPT: BLOCKED ON A RULING, NOT ON WIRING. **ERIK'S CALL.**

**The reading half is complete and tested.** `battleRound` takes `protections`, filters them by what they
catch, and `redirectImposition` re-resolves the imposition against the interceptor. **Three crafts author
the spec** — `resonant_shield`, `harbor`, `shared_weight`.

⛔ **AND `protections` IS NEVER PASSED. It is null on every round in the game.**

**The writer is `protectionFromCraft`, and I cannot call it, because a protection names ONE ally:**

```js
interceptorFor: p.allyId === allyId        // exact match. no wildcard.
```

⚠️ **SO MINTING ONE REQUIRES KNOWING WHO THE PLAYER IS GUARDING — AND THERE IS NO DECLARATION OR UI
AFFORDANCE FOR THAT CHOICE.** This is the "have you made sure the UI allows for these features" question
again, and the answer is again no.

### ⛔ THE RULING I NEED, AND IT IS ONE LINE

| | |
|---|---|
| **A** | ⚠️ **A protection guards the WHOLE party** — `allyId: null` becomes a wildcard. `shared_weight` catches whatever is aimed at anyone. **Ships immediately; makes the craft broader than its author wrote it.** |
| **B** | ✅ **A protection names one ally, and the player picks** — needs a target affordance in the declaration, like the `bringForward` pick. **Truer to the craft; more to build.** |

⛔ **I have built neither.** The lifecycle halves — `spendProtection` (a catch must cost a charge; its own
comment says *"being caught is not the same as the charge being spent"*) and `tickProtections` — are
correct and waiting, and they are pointless until a protection can exist.

---

## §4 — ⚠️ MELEE: FOLDED ALLIES DEAL DAMAGE AND NEVER TAKE ANY

`predictAggregate` **is** wired: `skill_battle:1274` adds the folded party's contribution **when the player
wins the round.** ⛔ **There is no branch for when the opponent wins.**

**So a folded party is pure upside — it hurts the foe and cannot be hurt.**

`distributeCasualties` is the intended answer and is called by nothing. Its own comment quotes Erik:
*"the pc playing into and being a casualty of that melee"* — ⚠️ **so it was built for exactly this, and the
asymmetry is an omission rather than a design.**

⛔ **I HAVE NOT WIRED IT, BECAUSE IT CHANGES PLAY:** folded companions would start taking losses, and
Erik's own ruling is that folded companions *"still feel like people."* **Making them mortal is right and
it is a balance event, so it wants a yes and a before/after the way the rank-deltas change got one.**

---

## §5 — WHAT I DID NOT DO, DELIBERATELY

⚠️ **I did not mark anything `// registry:internal` to bring the number down.** The audit's own comment says
that lever is *"never to make a number go down"*, and several remaining exports are genuine internal
helpers that a test imports directly. ⛔ **Lowering the ratchet by relabelling would be the exact dishonesty
the ratchet exists to prevent.** **20 stands, with reasons.**

**Two of my own mistakes, both caught by the ratchets inside a minute:** I read
`rules.projects.sabotageMax` when the dials live at `craftMechanics.projects` — **the wrong-config-object
error, twenty minutes after documenting it** — and I nearly read the atlas's READ 84 → 83 as a regression
when `persistUntilHealed` had moved buckets **because it got better**: a named reader in another module is
invisible to a literal count. **Recorded as a sixth way "unread" lies.**

**smoke 4,490/1 · content_ci 16 · wiring 3 · how_it_works 153/0 · 20 suites, no regression.**

— CCode
