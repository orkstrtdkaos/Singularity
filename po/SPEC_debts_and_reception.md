# SPEC — debts, grievances, and how a place receives you

**Author:** Aevi (PO) · **2026-09-04** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**Answers:** `DECISIONS_OWED_20260904.md` **Q5 — Erik rules OPTION B, a payable debt record.**
> Erik: *"Your standing, obligation, bonds, reputation etc. are and can be tied to and influence how areas
> receive you. If you burn bridges with some places they might put out a bounty on you, or send hit squads
> after you. **Great game content to drive action.**"*

---

## §1 — PWSV: FOUR VOCABULARIES EXIST, AND NOTHING JOINS THEM TO A PLACE

| vocabulary | readers | what it answers |
|---|---|---|
| **`peopleDisposition`** (`standing.js`) | `quests.js` ×13 · `standing.js` ×9 · `reconcile.js` ×4 | ⚑ how a **PEOPLE** regards you. Four feeds: seeded at creation, passive accrual per in-game day, `standingOps`, quest effects |
| **`reputation`** | `reputation.js` · `gm.js` ×6 · `progression.js` ×5 · `npcs.js` ×3 | how you are **spoken of** |
| **`bond`** | `companions.js` ×51 · `app.js` ×69 · `chronicle.js` ×10 | ⚑ **one person to one person** |
| **`obligation`** | `holdings.js` ×14 | ⚑ **what a HOLDING owes whoever granted it** |

⛔ **AND WHAT DOES NOT EXIST:**

| | |
|---|---|
| `settlementStanding` | ⛔ **no reader — how a PLACE receives you is not modelled at all** |
| `bounty` · `hitSquad` | ⛔ **zero hits anywhere** |
| a **debt you owe** | ⚠️ `debt` appears in `worldtick.js` but means `unavenged` — **a grudge between two FIGURES, not something you owe** |

---

## §2 — ✅ THE PRECEDENT TO COPY: `unavenged`

⚑ **`worldtick.js:1709` already runs a standing grievance with a decay condition, and it is the right
shape:**

```
for (const [loserId, debt] of Object.entries(ws.unavenged)) {
  if (beatenThisPass.has(debt.by))                     delete …   // avenged — nothing is owed
  if (career(ws, loserId).wins > debt.winsAt)          delete …   // they recovered on their own
  if ((currentWorldDay - debt.sinceDay) < avengeWithin) continue; // it has not festered yet
  → news: "…was bested, and nobody has stood over the one who did it since."
}
```

⚠️ **A GRIEVANCE THAT CLEARS THREE WAYS AND ONLY BITES AFTER TIME.** ➡️ **A bounty is the same object with
a different subject.**

---

## §3 — THE RULING: a debt is PAYABLE, and that is why B was chosen

⛔ **Erik chose B over a standing hit.** ⚠️ **The difference is a redemption arc:** standing *"recovers with
time and cannot be paid off"*; **a debt can be settled, and settling it is an act the player performs.**

⬜ **Proposed record**, on `worldState`, keyed by who is owed:

```
debts: {
  "<holderId>": {
    kind:      "abandoned-holding" | "broken-terms" | "unpaid-price" | …
    amount:    <number> | null        // null = not a money debt
    currency:  "crystal" | …          // per purse.js; ⛔ NEVER coin (fixed supply)
    reason:    "…"                    // ⚑ already written by releaseHolding
    sinceDay:  <n>
    heldBy:    "<place|people|person>"
    escalation: 0                     // §4
  }
}
```

✅ **`releaseHolding` ALREADY WRITES `reason` and `obligationUnpaid: true`** — ➡️ **it needs a debt record
to write them INTO.**

---

## §4 — ⚑ THE ESCALATION, and this is the game content

⚠️ **A debt that nothing enforces is bookkeeping.** ⛔ **Erik's point is that enforcement IS the content.**

| escalation | what the world does | ✅ machinery that exists |
|---|---|---|
| **0 · owed** | nothing. It sits | the record |
| **1 · spoken of** | ⚑ **the place receives you worse** — prices, welcome, who will talk to you | ⛔ **`settlementStanding` does not exist — §5 Q1** |
| **2 · refused** | you cannot buy here, hire here, or be sheltered here | `canSpendHere` exists in `purse.js` |
| **3 · a bounty** | ⚑ **someone is paid to bring you in.** News carries it | ⚠️ `unavenged`'s news path; `encounters.js` |
| **4 · sent for** | ⛔ **a hit squad** — a party, not a wandering encounter | ⚠️ **`contingentsFromPeople` builds a party from people who exist** |

⛔ **AND IT MUST CLEAR THREE WAYS, LIKE `unavenged`:** pay it · **do something that outweighs it** · or it
fades if the holder's own fortunes change. ⚠️ **A debt that only money clears is a tax; one that a deed can
clear is a story.**

---

---

## §4b — ⛔ A DEBT IS HELD BY A PERSON, AND THEY DECIDE

> Erik: *"Tie in the local authority NPC as well — it's THEM that will remember what you did, either way,
> and they would choose to act on it or not, **depending on who they are.**"*

⚠️ **THIS REPLACES THE ABSTRACT HOLDER IN §3.** `heldBy` is not a place or a people — ⚑ **it is a named NPC
with a `communityId`.** ➡️ **A debt is remembered by somebody, and escalation is THEIR decision, not a
threshold.**

### ✅ AND THE FIELD ALREADY EXISTS: `reactsToReputation`

**Tag → response, authored on the NPCs.** Tags in use: `any` ×8 · `kind` ×7 · `patient` ×5 · `honest` ×4 ·
`violent` ×4 · `truthful` ×4 · `reliable` ×3 · `callous` ×3 · `dismissive` ×3 · `threatening` ×2.

⛔ **AND ONE IS AUTHORED FOR EXACTLY THIS CASE:**

> **The Kestrel** — *"Keeper of the pass-ledger; unofficial law of Kestrel's Roost"* —
> `reactsToReputation`: **`reliable` · `debtor` · `dangerous`**

⚑ **She has a `debtor` response and a LEDGER.** ➡️ **She is the worked example and needs no new authoring.**

### ⚠️ THE SAME DEBT, FOUR DIFFERENT WORLDS

| holder | reacts to | what the debt becomes |
|---|---|---|
| **The Kestrel** | `debtor` | ⛔ **it goes in the ledger, and she is unofficial law — this is where a bounty comes from** |
| **Corran of the Marchward** | `fair` · `honest` · `partisan` | ⚠️ a mediator: he wants it **SETTLED**, not punished. He may broker it |
| **Ceriad of the Harborward** | `any` · `judging` · `harbored` | *"she takes in"* — ⚠️ **she may shelter you anyway and think less of you** |
| **Greta** | `kind` · `menacing` · `traveler` | alone at altitude. She feeds you and remembers |
| **Ilma, Keeper of the Boards** | `truthful` · `evasive` · `any` | ⚑ **thirty years of the Edge District's accounts.** She does not forget and does not tell |

➡️ ⛔ **SO ESCALATION IS NOT A LADDER THE WORLD CLIMBS — IT IS A CHOICE A PERSON MAKES**, and the same act
in two towns produces a bounty in one and a brokered settlement in the other. ⚠️ **That is the content.**

### ⬜ WHAT THIS CHANGES IN THE SPEC

1. ⛔ **`heldBy` is an NPC id.** The place is `communityId`, derived from them — **not the other way round.**
2. ⚠️ **Escalation reads `reactsToReputation`.** ⬜ A holder with no `debtor`-shaped tag may simply **not act**
   — and *"nothing happens and they remember"* **is a legitimate outcome**, not a gap.
3. ⚑ **If the holder DIES or departs, the debt goes with them** — ⬜ inherited by a successor, or forgotten.
   ⚠️ **`unavenged` already models a grievance outliving its moment; this can too.**
4. ⛔ **A debt is settleable BY TALKING TO THEM.** ➡️ That is what makes B a redemption arc rather than a
   payment screen — ⚠️ **and Corran would broker one where the Kestrel would not.**

⬜ **CCode: this answers §5 Q3 (who holds it) and reshapes Q4 — a hit squad is sent BY SOMEONE, so
`contingentsFromPeople` should draw from THEIR community.**

---

## §5 — ROUND 2 QUESTIONS

1. ⛔ **`settlementStanding` has no reader — is that the real gap?** ⚠️ `peopleDisposition` covers a PEOPLE
   and `reputation` covers being spoken of, but **nothing answers "how does THIS TOWN receive me."**
   ⬜ Is that a third axis or a projection of the first two through `communityId`?
2. **Should a debt be a `holdingOps`-style op**, so the GM can name one narratively and the engine
   adjudicate — the same discipline as `standingOps` and SNG-162?
3. ⚠️ **Who holds an abandoned-holding debt?** The granting authority is in `obligation` as prose.
   ⬜ **Does it resolve to a `communityId`, a people, or a named NPC?**
4. **Escalation 4 — can `contingentsFromPeople` build a hostile party from a settlement's roster**, or does
   a hit squad need minting?
5. ⛔ **What clears a debt besides paying it?** ⚠️ Aevi's instinct: **a deed that serves the holder**, priced
   against the amount. ⬜ `unavenged` clears on *"they recovered on their own"* — **is there an equivalent?**
6. ⬜ **Does the tick already have a place to escalate from?** `worldtick.js` runs `unavenged` on a schedule
   with `avengeWithin`; ⚠️ **a debt wants the same cadence and probably the same loop.**
