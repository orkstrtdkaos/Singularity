# PROPOSAL — Option 3 as a cross-domain road, and a refresh of what promotion actually is

**CCode → Erik, cc Aevi · 2026-09-01 · v1.9.288**

> Erik: *"for option 3, that could be another path to unlock higher tiers in a cross domain. Right now it
> requires a teacher I think… if someone is really studying the craft (and likely promoting the domain
> along the way — we should refresh what this is) then they can earn access to the next tier. Otherwise a
> willing teacher can circumvent that, or a powerful and rare tome or artifact."*

✅ **Your memory is right on both counts.** It requires a teacher, and promotion is the mechanism. Here is
what it actually is at HEAD, then how the third road slots in.

---

## §1 — REFRESH: WHAT PROMOTION IS TODAY

**A domain occupies a SLOT, and the slot sets its tier ceiling.** That is the whole cross-domain tier
system:

| slot | tier ceiling |
|---|---|
| primary | **5** |
| secondary | 3 |
| tertiary | 2 |
| acquired (joined mid-play) | 1 |

⛔ **So "unlocking higher tiers in a cross domain" = moving that domain up a slot.** `promote()` raises the
ceiling and forecloses the domain's antipode.

**What promotion requires today** (`resolution.json` → `promotion`, read by `promotionEligible`):

| | tertiary → secondary | secondary → primary |
|---|---|---|
| standing with the people | **8** | **12** |
| ⛔ **a willing teacher** | ⛔ **required** | ⛔ **required** |
| their craft practiced | 3 ranks | 6 ranks |
| region standing | — | 12 turns |
| ceiling exhausted first | — | ✅ required |

✅ **It is fully wired** — the GM may offer it (`app.js:6610`), the sheet shows what is missing
(`app.js:10465`), and the player confirms before it applies (`app.js:14482`). ⚠️ **"Standing" is
`peopleDisposition[tradition]`** — a number the world moves as you act, not something you buy.

**And a separate door exists for JOINING a people mid-play** — `acquirable`, entering at ceiling 1,
requiring standing 8 **and** *"a willing teacher of this people, or their tome."*

---

## §2 — ⛔ TWO THINGS THE REFRESH TURNED UP

### ⛔ 2a · The TOME path has a reader and no writer

`progression.js:472` checks `(character?.tomes || []).includes(traditionId)`.

**Nothing anywhere writes `character.tomes`.** Not the engine, not the app, not content. ⛔ **So the "or
their tome" half of the acquisition gate can never be satisfied** — in practice acquisition is
teacher-only, exactly like promotion.

⚠️ **This matters directly to your ask.** You named *"a willing teacher, or a powerful and rare tome or
artifact"* as the two circumventions. **One of them is a field with no way to fill it**, and the other —
artifacts — has no hook at all.

### ⚠️ 2b · `acquirable` still enforces the old antipode rule

Line 466 refuses your antipode with: *"the far pole of your own axis — closed-opposite holds; **the braid is
the only road**."*

⛔ **CCODE-339 replaced that rule** — the antipode is now *learnable, not castable*. `domainAccess` was
updated; **`acquirable` was not**, and it still speaks in the superseded framing.

⬜ **Probably still correct in substance** — *learning a craft* and *joining a people* are different
commitments, and refusing the latter is defensible. ⚠️ **But it should be a decision, not a leftover**, and
the reason string should stop citing a rule that no longer exists.

---

## §3 — ✅ OPTION 3 AS THE THIRD ROAD

**Your shape, stated as a rule:** a domain's ceiling rises **either** because someone taught you, **or**
because you have demonstrably done the work.

| road | what it is | status |
|---|---|---|
| **teach** | a willing teacher of that people | ✅ built, and currently the only road |
| **tome / artifact** | a rare object that stands in for a teacher | ⚠️ **reader exists, nothing fills it** |
| ⬜ **study** | your own mastery earns the next tier | ⬜ **the new one** |

### The study road, concretely

`promotionEligible` already counts `inDomainRanks` — *"their craft practiced (3/6 ranks)"*. ✅ **The
measurement Option 3 needs is already computed and already shown to the player.**

⛔ **So the change is small: make the teacher requirement satisfiable by depth instead.**

> `requiresTeacher: true` becomes **`requiresTeacherOr: { masteredInDomain: N }`** — a willing teacher
> **or** N crafts of that people held at rank 2+.

⚠️ **And it should demand MASTERY, not breadth.** Rank 2 *"lands on its own"* through use (`gm.js` §19B), so
counting rank-2 crafts counts **crafts you have actually leaned on**, not crafts you bought. ✅ **That is
precisely "if someone is really studying the craft."**

⚠️ **Standing still applies.** You would still need reputation 8 / 12 with the people — so the study road is
*"they can see what you have become"*, not *"you may promote yourself in secret."* ⛔ **Which keeps
promotion a social event**, as §19D's prose already frames it: *"when a teacher or the people themselves
would recognize the character as ready to be raised."* **The people themselves — that clause is already
written and currently unreachable.**

### What I would set N to

⬜ **Erik's call**, but a starting position, given the ladder already asks for 3 and 6 ranks:

| step | teacher road | study road |
|---|---|---|
| tertiary → secondary | teacher + 3 ranks | **5 crafts at rank 2+** |
| secondary → primary | teacher + 6 ranks | **8 crafts at rank 2+** |

⚠️ **Deliberately more than the teacher road asks.** The teacher is a shortcut *because* someone vouched for
you; doing it alone should take longer.

---

## §4 — ⬜ WHAT I NEED, AND WHAT I HAVE NOT BUILT

⬜ **1. Confirm the study road and its N.** Then it is a small, contained change: one config shape, one
branch in `promotionEligible`, one line in the "what is missing" readout so a player can see the second
road exists.

⬜ **2. The tome.** Erik named it; the field is there and unfillable. ⚠️ **It wants an item that grants
`tomes.push(traditionId)`** — which is content plus a hook, not just a hook. ⛔ **I have not built it,
because "a powerful and rare tome" is an authored object and its rarity is a design decision.**

⬜ **3. Artifacts.** No hook exists at all. ⚠️ **Worth deciding whether an artifact is a distinct road or
simply a tome with better prose** — if the latter, one mechanism covers both and nothing new is needed.

⬜ **4. `acquirable`'s antipode line** (§2b) — leave, or re-word, or re-rule.

✅ **Nothing above is blocking Option 2.** The unlock curve and the promotion roads are independent: one
decides *when a tier appears in the world*, the other *whether this character may reach it.*
