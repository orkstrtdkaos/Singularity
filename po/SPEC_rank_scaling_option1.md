# SPEC — rank scaling: `gains` + `gainAxes` become mechanical (Erik's option 1)

**Aevi → CCode · 2026-08-23 · Erik: *"I lean option 1. That's why we're doing this work."***

⛔ **THIS IS A SCOPING REQUEST, NOT A BUILD ORDER.** It changes what a rank IS, and every craft I touch in
the Death audit is a craft that would need revisiting — **so I want your read before I fix another one.**

---

## §1 — THE RULING

**`gains` and `gainAxes` become the mechanism of rank progression, not a description of it.** 1,747
authored instances across 1,047 ranks — 730 `gainAxes` values, 1,017 `gains` declarations
(`broaden` 650 / `deepen` 367) — ⛔ **currently read by nothing.**

**Erik's reason matters for scoping: the audit is the preparation for this.** The reason it keeps coming
back is that **ranks already do their scaling in prose and by hand.** `Necrotic Strike` runs antisoak
4 → 6 → 8 because I typed three numbers on three ranks. **That is what a derived engine would generate.**

⚠️ **WE ARE CURRENTLY DOING BOTH — hand-authored numbers AND a declaration of what grew — with nothing
checking they agree.** §2 is what that costs.

---

## §2 — ⛔ THE PROOF CASE, FOUND WHILE MEASURING FOR THIS SPEC

**`keening`, a craft I had not yet audited:**

| rank | `gains` | `gainAxes` | `imposes.targets` | condition |
|---|---|---|---|---|
| r1 | `deepen` | — | **6** | `action_loss` |
| r2 | ⛔ `broaden` | ⛔ `targets, quality` | ⛔ **3** | `unconscious` |
| r3 | `broaden` | `scope, targets` | **12** | `unconscious` |

⛔ **r2 DECLARES `broaden` ON `targets` AND THE TARGETS GO 6 → 3.** The rank actually **deepened** — the
condition went from losing an action to falling unconscious — and **narrowed to pay for it.** The design
is good; **the declaration says the opposite of what happened.**

⚠️ **UNDER OPTION 1 THIS FAILS LOUDLY** — the engine derives more targets and collides with an authored 3.
**Today it disagrees with itself in silence and no gate can see it.** ⛔ **That is the argument for the
build, and it is one craft of 374.**

---

## §3 — ⛔ THERE IS NO CURVE IN THE CORPUS TO EXTRACT. THE STEP MUST BE AUTHORED AS A RULE.

**I tried to derive the scaling step empirically so you would not have to invent one. It is not there.**

**Only FIVE crafts scale a numeric field across ranks:**

| craft | field | values |
|---|---|---|
| Grief Strike | `antisoakImposed` | 3 → 5 → 8 |
| Necrotic Strike | `antisoakImposed` | 4 → 6 → 8 |
| Force the Move | `imposes.targets` | 1 → 4 → — |
| Grey Hand | `imposes.targets` | 1 → 1 → 3 |
| Keening | `imposes.targets` | 6 → 3 → 12 |

⛔ **Step ratios observed: 0.5 · 1.0 · 1.33 · 1.5 · 1.6 · 1.67 · 3.0 · 4.0 · 4.0.** Median 1.6 across nine
samples that contradict each other. ⚠️ **A median of that is a number, not a curve.**

**So the step is a DESIGN DECISION and it is Erik's, not something I can hand you from data.**

---

## §4 — THE SHAPE I WOULD ARGUE FOR, AND THE ONE THING IT MUST NOT DO

**Base `mechanic` stays on the ability. Each rank declares `gains` + `gainAxes`. The engine applies a step
per declared axis per rank.**

- `deepen` → force: `damage`, `duration`, `quality`, `conditions`
- `broaden` → reach: `targets`, `scope`, `range`

⛔ **AND AN AUTHORED VALUE ON THE RANK ALWAYS WINS.** Absent means *derive*; present means *I meant this*.
⚠️ **Keening r2's `targets: 3` is exactly why — a craft must be able to say "this rank costs breadth", and
a purely derived ladder cannot express a trade.**

⛔ **THE FAILURE THIS MUST AVOID IS THE ONE ERIK ALREADY KILLED ONCE.** In `bargain` he ruled that rank
scales **the size of the deal, not the discount** — because a uniform ladder makes every craft scale
identically and stops being characterful. ⚠️ **A single global step per axis would reintroduce exactly
that.** The step probably needs to vary by axis at minimum, and possibly by shape.

---

## §5 — WHAT I NEED FROM YOU BEFORE I AUDIT ANOTHER CRAFT

1. ⛔ **Is `mechanic`-per-ability → ladder feasible without breaking the resolution order?**
   `craftmechanics.js` resolves `craft.mechanic.<field> → familyDefaults[shape] → unused`, and **rank
   never enters it.** This inserts a tier.
2. **How many crafts break** if derived values replace hand-authored ones — i.e. how many currently carry
   per-rank numbers that a derived ladder would contradict? ⚠️ **I found five that scale; there may be many
   more that scale IN PROSE ONLY and would suddenly start scaling for real.** **That number decides whether
   this is a pass or a project.**
3. **Should I keep authoring `gainAxes` during the Death audit,** knowing they will become load-bearing?
   ⚠️ **I have been declaring them by hand and I would rather declare them KNOWING the rule than guess and
   redo 33 crafts.**
4. ⛔ **Sequencing.** If this lands mid-audit, Death gets audited twice. **If it lands after, Death is
   audited against a model that is about to change.** I do not have a good answer and it is a real cost
   either way.

---

## §6 — NOT IN SCOPE

**`quality` and `autonomy` have NO mechanic field between them and carry 106 declarations.** ⚠️ **Whatever
the step rule is, those two cannot be derived onto anything.** They want either a field, a mapping, or
explicit marking as narrative-only — **but that is a separate decision and folding it in would hide it.**
