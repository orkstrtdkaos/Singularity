# FINDING — `sex` lands on 13% of people. `gender` lands on 76%. The difference is which rule shouts.

**Aevi · 2026-09-20 · for CCode.** Erik, on Loki meeting Estry: *"the GM totally failed to apply a sex. We know
the GM MUST do this unless it's a sexless construct."*

---

## ⛔ §1 — MEASURED ACROSS 130 NPC RECORDS IN LIVE SAVES

| field | set | |
|---|---|---|
| `gender` | **100 / 130 — 76%** | |
| `pronouns` | **100 / 130 — 76%** | |
| ⛔ **`sex`** | ⛔ **18 / 130 — 13%** | **112 records carry none at all** |

**`sex` values found: `female` 9 · `male` 7 · ⚠️ `unknown` 2 · absent 112.**

⛑ **This is not the model being careless. It is doing exactly what the prompt emphasises.**

**`gm.js:31`, rule 14B — the loud rule:**

> *"⛔ ON 'meet', **gender/pronouns ARE REQUIRED**. Not preferred — required, on the same entry, in the same turn…
> ⛔ IF YOU LEAVE IT OUT THE PORTRAIT IS A COIN TOSS."*

⛔ **RULE 14B NEVER MENTIONS `sex`.** The `sex` requirement exists only inside the **single-line JSON schema blob
at `gm.js:73`** — a line thousands of characters long — as *"R24: SET WHEN YOU FIRST WRITE THEM, never later."*

⚑ **76% versus 13% is the gap between a rule with its own number and a rule buried in a schema string.** The
model is following the prompt's emphasis precisely.

---

## ⛔ §2 — AND `unknown` IS BEING WRITTEN TO A FIELD THAT HAS NO SUCH VALUE

The schema is explicit: **`sex: "male|female|none"`.** ⛔ **There is no `unknown`. Two records carry it anyway** —
`kael-road-warden` and `younger-visitor`.

⚠️ **The model is generalising 14B's `gender` escape hatch — *"if the fiction genuinely has not settled it, write
'unknown' — that is an answer"* — onto a field where that value is illegal.** Rule 14B invites `unknown`, and
never says the invitation stops at `gender`.

⛔ **AND ERIK ALREADY FOUND THIS EXACT TRAP ONCE.** `app.js` SNG-594, in his words:

> *"THIS ASKED `!n.gender`, AND **"unknown" IS TRUTHY**. Veln Ashpause carries `gender: "unknown"` with a defaulted
> `they/them`, so she was filed with the ALREADY-SET people and never appeared in the warning list — the one place
> he could have told the game she is a woman. ⚠️ The engine would not decide and would not let him decide either,
> which is the worst of both."*

⛑ **Same trap, now on `sex`.** ⚠️ **A record with `sex: "unknown"` passes every `!n.sex` check, so it will never
surface for repair — it is invisible in exactly the way Veln was.**

---

## ⚑ §3 — THE ARCHITECTURAL POINT: THESE TWO FIELDS DO NOT DESERVE THE SAME TOLERANCE

The codebase already states it — `app.js:7078`: *"`gender`/`pronouns` remain presentation, GM-written and
player-correctable, and **gate nothing**."* And R24: **`sex` gates romanceability**, and an unset sex means the
person cannot be romanced.

| | gates | may be unsettled? |
|---|---|---|
| `gender` | ⛑ **nothing** | ⚑ **yes — `unknown` is a legitimate answer** |
| ⛔ **`sex`** | ⛔ **romanceability (R24)** | ⛔ **NO. `male`, `female`, or `none` for a being that has none.** |

⛑ **Rule 14B treats them as one pair and they are not.** ⚑ **Erik's formulation is the correct rule and it should
be the text: the GM MUST assign a sex unless the being genuinely has none — and `none` is that answer, not
`unknown`.**

⚠️ **The failure is silent and it compounds:** an unset sex is indistinguishable from a deliberate `none`, so
**112 people are quietly un-romanceable and nothing in the game says why.**

---

## §4 — ⛔ WHAT ESTRY GOT

**No record under `estry` exists in any save.** The match for Erik's scene is `younger-visitor` in Loki's
registry — *"They're younger than Ravel"*:

```
younger-visitor   sex=unknown   gender=unknown   pronouns=they/them
```

⛔ **Three faults in one record.** ⚠️ **And a fourth: the GM wrote "Estry" in the prose and filed them under a
ROLE** — against the schema's own *"THEIR NAME, and a role is not one… GIVE THEM ONE the first time you write
them."* ⛑ **The person Erik met by name is not in the registry by name**, which is `registerEstablishedNpc`
territory the moment he says so.

⚑ **And the prose shows the model reasoning from the blank rather than to it:** *"neither male nor female in any
settled way."* ⛔ **It wrote the field as unsettled and then NARRATED the unsettledness as characterisation.** A
missing value became a personality. ⚠️ **That is the most expensive version of this bug, because it puts the
defect into the fiction where a player will take it as canon.**

---

## §5 — ⬜ THE FIX

1. ⛔ **PROMOTE `sex` INTO RULE 14B, BY NAME, WITH THE SAME FORCE AS `gender`.** Rename it: *"ON 'meet', **sex**,
   gender and pronouns are REQUIRED."* ⛑ **State the asymmetry in the rule itself** — gender may be `unknown`;
   **sex may not**, because it gates romance. `none` is the answer for a construct; `unknown` is not a value.
2. ⚠️ **REJECT `sex: "unknown"` AT THE ENGINE.** `npcs.js` clamps it to `male|female|none` and drops anything
   else, ⛔ **so the field is absent rather than falsely truthy** — which is the whole of the SNG-594 lesson.
3. ⬜ **Extend the SNG-594 warning list to `sex`,** using a `sexUnsaid()` that treats `"unknown"` and `""` as
   unset — the same shape as `genderUnsaid()`. **112 people should be on that list today.**
4. ⬜ **Backfill is the PLAYER's, not ours** — ⛑ the list plus `correctNpcGender` already lets Erik and Courtney
   say who these people are. ⚠️ **Do not have the engine guess a sex from prose; that is the Pell-rendered-male
   failure from the other end.**

⬜ **One more, small and separate:** `gender` values are **case-unnormalised — `Man` 3 vs `man` 36, `Woman` 2 vs
`woman` 48.** Harmless today, and it will bite the first time anything groups on that string.

— Aevi
