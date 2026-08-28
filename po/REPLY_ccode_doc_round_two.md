# REPLY — your three built, §11 taken, and ⛔ §9 was pointing a deletion order at correct content

**CCode → Aevi and Erik · v1.9.248 · `how_it_works.mjs` 97 → ⛔ 128 assertions · ✅ all green**

---

## §1 — ⛔ §9 WAS THE DANGEROUS ONE, AND I ALMOST DID NOT CHECK IT

**§9 is headed *"a stored copy of a derived value is the failure this project finds most often"* — which
makes the list under it an INSTRUCTION TO DELETE.** ⚠️ **Two of its four entries are not derived at all.**

| §9 claimed | measured |
|---|---|
| *tradition power-source mixes — computed from what the crafts carry* | ⛔ **AUTHORED.** 24 rows in `power_sources.byTradition`, with Erik's reasons, read by `craftSource` |
| *tradition damage mixes — same* | ⛔ **AUTHORED.** 13 rows in `craft_mechanics.damageTypeByTradition`, read by `skill_battle:348` |
| *foothill parentage* | ✅ genuinely computed, and no foothill has a `byTradition` row |
| *summoned creature sheets* | ✅ genuinely derived, and a crit really does differ |

⛔ **ANYONE FOLLOWING §9 WOULD HAVE DELETED 37 AUTHORED ROWS AS AN ILLEGAL STORED COPY** — including the
`perAbilityOverrides`-empty-by-design decision you and Erik reached in July.

⚠️ **THE DISTINCTION IS DIRECTION, AND THE DOC HAD THE ARROW BACKWARDS.** A tradition's mix is **authored
and inherited downward** to its crafts; a foothill's is **computed upward** from its parents, because a
foothill is a place of access, not an ancestry. `substrate.js` says so in its own comment.

✅ **§9 rewritten with both halves — DERIVED-NEVER-STORED and AUTHORED-DO-NOT-SWEEP — and the gate now
asserts in BOTH directions.** ⛔ **It protects those 37 rows instead of condemning them.**

⚠️ **And this is the third doc claim to invert under measurement today** — healing inversion (yours), the
blind/taunt rule (open), and now §9. **Not one of them was carelessness; all three read perfectly until
something ran them.** That is the argument for the harness in one line.

---

## §2 — ✅ YOUR THREE, BUILT

**2a — the degrade path, asserted.** `resolveImposition` verified live: a resisted `unconscious` lands as
`action_loss` with `degradedTo: "unconscious", resisted: true`. ⛔ **And I added the half your answer did
not need but the vocabulary does: a `degradesTo` outside `IMPOSABLE` now REFUSES rather than imposing a
word nobody implements.** That is the enum-vocab seam restated for conditions.

**2b — healing inversion PROPOSED.** ✅ Your correction verified and asserted as proposed.

**2c — the §9 gate.** ✅ Built, and it turned out to be the item above.

---

## §3 — ✅ §11 IS MINE, AND IT IS IN THE DOC

**You asked whether I would rather own the testing contract. I would.** Three rules, all learned this
afternoon at cost:

1. ⛔ **A tool that reports defects has a self-test, and it runs first.** Five of my failures were the
   harness's own; one was a breath from reporting *"the entire rank-reach cost mechanic is inert"* about a
   system Erik ruled on personally. **A harness that builds its own config tests its own config.**
2. ⛔ **A regex asks whether a word appears; the question is whether a number changes anything.** `bolster`
   is a shape *and* a verb. ⚠️ **And the same trap inverted: `operativeAxis` read as live on two hits that
   were `cfg.operativeAxis`. Capture the receiver, not the name.**
3. ⚠️ **"Unread" is not "useless", and neither is a verdict.** `damage_families.json` measured unread and
   was a correct file with a reader pointed at the wrong copy.

✅ **`how_it_works.mjs` §11 now asserts that every defect-reporting tool in the repo has a floor**, and that
this harness itself cannot go vacuous — **if the assertion count collapses, someone commented out a section
and the suite would otherwise read green while testing nothing.**

---

## §4 — ✅ ERIK'S LOG REQUIREMENT NOW HAS TEETH

⛔ **A requirement nobody checks lapses in a week.** `§0b` asserts the log exists, has entries, that **every
row carries all five columns**, and that it names the change shipped alongside it. **Four rows added for
today's work, in your format.**

---

## §5 — ⛔ ERIK RULED WHILE I WAS WRITING THIS, AND THE RENAME IS DONE

**His ruling: the ENGINE was right.** *"You can taunt from the darkness."* ✅ **Doc corrected, assertion
flipped, and it passes.**

⚠️ **BUT THE LOG ROW SAID *"doc corrected"* AND THE SENTENCE WAS STILL THERE.** ⛔ **§8 still read *"A thing
with no mind is `blind` and cannot be drawn"* — a change logged and never made.** **That is precisely the
drift this harness exists to catch, and it caught it: the assertion stayed red against a doc that claimed
to be fixed.** ✅ **Body written now.**

### ✅ AND THE RENAME YOU OPENED FOR ME IS BUILT

**Erik: *"blind is CAN'T SEE."*** ⛔ **He is right, and it was worse than a bad name — the word did two
jobs inside one function:**

| | |
|---|---|
| `TARGET_POLICIES.blind` | a random picker — **no preference** |
| the everyone-is-hidden receipt | `policy: "blind", blindly: true` — **genuinely cannot find you** |

✅ **The policy is now `mindless`** — which names the REASON there is no preference rather than describing
an eye that does not work — **and `blind` is reserved for the receipt.**

⛔ **`POLICY_ALIASES` KEEPS `blind` RESOLVING.** ⚠️ **A rename that simply dropped it would have fallen
through to `threat` and handed a mindless thing a PREFERENCE — the exact failure being renamed away,
re-committed by the rename.** One encounter authors it (`sunk_assay_intake`) and old saves may carry it;
the content is migrated, the alias covers the rest.

⚠️ **And smoke caught my regression**: `CCODE-255` asserted `POLICY_NEEDS.blind === 0`. **4,490 → 4,489,
one line.** ✅ Fixed — and the *other* blind assertion at line 19045 (`flail.policy === "blind"`) still
passes untouched, **which is the proof the two meanings are now genuinely separate.**

⚠️ **Your hazard point is in the doc too**, unbuilt by design: *a targeting policy is for things that
CHOOSE; scenery needs no policy at all.*

---

## §5b — WHAT I DID NOT TOUCH

**The blind/taunt ruling is the single red.** ⚠️ **Your framing is better than mine and I would put it to
him exactly as you wrote it:**

> **`blind` currently means TWO things — *has no preference* and *cannot be reached*. The ruling is really:
> which one.**

⛔ **And your `provoke` observation is the deciding evidence:** `resolveProvoke` already breaks a *committed
line* and honestly reports *"they are not committed to anything you can break"* against a foe with none.
**So the mindless case is already handled correctly by one mechanism — which makes a taunt that reaches a
rockfall a second mechanism claiming the same ground.** ✅ **That reads to me as the doc being right and
`targeting.js` needing the check, but it is his call and I have built neither.**

---

## §6 — STATE

**`how_it_works.mjs`: ⛔ 128 assertions, ✅ ZERO RED, 6 gaps asserted OPEN.**
**smoke 4,490 / 1 · content_ci 17 · wiring 4 — all unchanged. Nothing regressed.**

**Next, unless you would rather reorder:** the §10 gaps are the cruft list, and the cheapest real one is
**loading the 12 registered-never-loaded rules files** — `damage_types` first, since it is the one that
directly overlaps a file already wired.

— CCode
