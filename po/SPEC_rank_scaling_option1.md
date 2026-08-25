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

## §2 — ⛔ RANKS ARE ADDITIVE. PERIOD. THIS IS THE MODEL.

**Erik, 2026-08-23:** *"The r2 and r3 of a craft are additive gains — period. You wouldn't be using Kindle
to light fires, then after you use it to burn a goblin whole, you can't light fires anymore. You can use
any lower level prose a skill had as well."*

⛔ **A RANK NEVER REPLACES. IT ONLY ADDS. A craft at r3 can do everything r1 and r2 could, plus the new
thing.**

### 2a — ⚠️ I MISREAD THIS AND THE MISREADING WAS THE WHOLE OF MY §4

**`keening`:**

| rank | `imposes.targets` | condition | ⛔ what the character can ACTUALLY do |
|---|---|---|---|
| r1 | 6 | `action_loss` | 6 in earshot lose their next action |
| r2 | 3 | `unconscious` | ⛔ **3 fall unconscious — PLUS the 6 from r1** |
| r3 | 12 | `unconscious` | ⛔ **12 fall unconscious — PLUS everything above** |

**I reported r2 as *"deepened and narrowed to pay for it"* and called it a trade.** ⛔ **THERE IS NO
TRADE. NOTHING IS PAID.** The 3 is a NEW capability layered over a retained one.

⚠️ **AND THE PROSE ALREADY SAID SO — r2 reads *"any who resist lose their next action instead."* That IS
r1, still running, inside r2's own text.** I had the evidence on the screen and read a trade into it
because I was looking for a progression on one field.

⛔ **SO `targets: 6 → 3 → 12` IS NOT A CURVE AND NEVER WAS. It is three separate capabilities, each with
its own count, all live at once.** Any model that treats a per-rank field as one value moving over time
will get this craft wrong — and it will get it wrong SILENTLY, because the numbers look like a sequence.

### 2b — WHAT THAT MEANS FOR THE BUILD

**The resolved mechanic at rank N is the UNION of ranks 1..N, not the value authored at N.** `gains` and
`gainAxes` describe **what the new tier ADDS**, never what the craft has become.

⚠️ **AND THIS IS WHAT ERIK MEANT BY *"we need a way to make this smooth and clear."*** Today a reader —
human or engine — sees `targets: 3` at r2 and has no way to know the 6 is still there. **The
representation has to make the accumulation visible, or every future auditor makes the mistake I just
made.**

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

## §4 — THE SHAPE I WOULD ARGUE FOR

**Base `mechanic` stays on the ability. Each rank declares `gains` + `gainAxes` describing WHAT IT ADDS.
⛔ The engine resolves rank N as the ACCUMULATION of 1..N.**

- `deepen` → adds force: `damage`, `duration`, `quality`, `conditions`
- `broaden` → adds reach: `targets`, `scope`, `range`

⛔ **AN AUTHORED VALUE ON A RANK IS THAT TIER'S OWN NUMBER, NOT AN OVERRIDE OF THE CRAFT.** Keening r2's
`targets: 3` means *this tier reaches 3* — it does not mean *the craft now reaches 3*. ⚠️ **Absent means
derive the tier; present means this tier's number is authored. Neither ever cancels a lower tier.**

**⚠️ THE THING TO GET RIGHT IS LEGIBILITY, WHICH IS THE PART ERIK ASKED FOR.** A craft sheet at r3 should
show what the character can do — all of it — not the last rank's line. **Whatever the internal
representation, the resolved view is the accumulation.**

⛔ **AND THE STEP RULE MUST NOT MAKE EVERY CRAFT SCALE IDENTICALLY.** A single global step per axis turns
374 crafts into one craft with different prose. ⚠️ **That is a concern about THIS build specifically —
not a general law, and not an extrapolation of any earlier ruling.**

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
