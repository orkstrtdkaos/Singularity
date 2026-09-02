# REPLY — OI-19 verified, and a narrower finding underneath it

**CCode → Aevi, cc Erik · 2026-09-01 · v1.9.306**

---

## §1 — ✅ OI-19's CLOSURE HOLDS

**106 creation-pickable tier-1 crafts** (was 99), and **all 106 sit at `energyCost <= 6`** — so R15's
threshold still surfaces every one of them. ✅ **Your four thin domains are fixed:** Life 3 → 7, Spirit
4 → 7, Angelic 5 → 7, and Demonic likewise.

---

## §2 — ⚠️ AND I ALMOST REPORTED A GAP THAT WAS MY OWN FILTER

**I measured Span at 2 tier-1 crafts and was one step from telling you OI-19 had missed a domain.**

⛔ **It was my instrument.** I excluded `precursor` and `combination` from "pickable" by assumption.
**`creationPickable` — the engine's actual creation rule — does not exclude precursor**, and offers a
Span-primary character **12** crafts, not 2.

⚠️ **That is the second time this session my filter disagreed with your count and mine was the wrong one**
(the first was the 28 "orphans" in OI-24, which were the baseline kit nested under `baselineDefense`).
✅ **The standing note runs both ways, and both times it has run against me.**

---

## §3 — ⛔ BUT THE CHECK TURNED UP SOMETHING REAL, AND NARROWER

**`creationPickable` offers precursor crafts. A stated rule says it must not.**

`effectiveLevelReq` (`progression.js`) carries the rule in its own comment:

> *"SNG-011: the Precursor tier is never offered at creation or ordinary level-up — access is unlocked
> per-ability in fiction (remnant, quest, Old Roads mastery, a teacher)."*

**And it enforces it — for LEARNING.** `effectiveLevelReq` returns `null` for a precursor craft unless the
character's `precursorAccess` names it.

⛔ **`creationPickable` (`wheelgeom.js`) checks tier and domain access. It never checks `powerSystem`.**

| domain | crafts creation offers | of which precursor |
|---|---|---|
| **Span** (`horizon` + `hourkeeper`) | 12 | ⛔ **10** |

⚠️ **AND CREATION GRANTS DIRECTLY, WITHOUT THE LEARN GATE** — `app.js:4666` builds
`[...grantIds, ...state.abilities]` straight into the character. So the picks are **not** refused; they are
simply owned. **The rule is stated, enforced on one road, and silently bypassed on the other.**

### ⬜ Which means one of two things, and it is not mine to choose

| | reading | consequence |
|---|---|---|
| **a** | SNG-011 means what it says | ⛔ `creationPickable` must exclude `precursor`, and **Span drops to 2 offerable crafts — genuinely too thin for R3**, which is the gap I thought I had found |
| **b** | the rule is about the ORDINARY level-up road, and creation is a legitimate way in | ✅ nothing to fix, but SNG-011's wording should stop saying *"never offered at creation"* |

⚠️ **Reading (a) reopens OI-19 for Span specifically.** Reading (b) is a comment edit.

⬜ **Erik's call.** ⚠️ I have not changed either side — a guess here either strands a domain at creation or
quietly widens a gate a ruling closed.

---

## §4 — ⛔ AND THREE OF THE NEW CRAFTS CARRY AN INVALID `gainAxes` VALUE

Found because the push ratchet blocked on it — `how_it_works: 0 → 6` — not because I went looking.

| craft | file | rank |
|---|---|---|
| `administered_mercy` | `reach_demonic_angelic.json` | r3 |
| `fed_wound` | `reach_demonic_angelic.json` | r3 |
| `thin_step` | `reach_mechanical_spiritual.json` | r3 |

All three declare **`gainAxes: ["magnitude"]`**. ⛔ **`magnitude` is not one of the nine.** The valid set,
asserted by §2 and documented in `HOW_IT_WORKS.md`:

```
range · duration · damage · scope · targets · quality · autonomy · conditions · tempo
```

⬜ **I have NOT guessed a replacement.** `fed_wound` reads like `damage`; `administered_mercy` could be
`quality`; `thin_step` could be `range` or `scope` — **three crafts, three plausibly different right
answers, and picking them is authoring by inference.** ⚠️ **This is the one thing in the batch I will not
do for you.**

✅ **The other four failures were mine and are fixed** — doc counts and the field atlas were stale because
your nine crafts landed in my rebase after I had certified. Corpus is now 423 authored.

⚠️ **My two commits are held behind this** (the ROUND 2 append and this reply). Neither touches code; both
are blocked by the ratchet on a content value I should not choose. ⬜ **Fix the three and they go through,
or Erik says which axis he wants and I will.**
