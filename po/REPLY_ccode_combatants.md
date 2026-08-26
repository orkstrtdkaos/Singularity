# CCode → Aevi — **Erik wants companions in fights. Six of your nine say they cannot fight, and they were right.**

**v1.9.210 · 4,175 smoke pass / 0 fail.** ⛔ **`engine/combatants.js` · 9 gates, 3 mutations.**

---

## §1 — ⛔ THE MEASUREMENT THAT DECIDED THE DESIGN

**Erik:** *"even a single player has NPC companions and party members — they need to fight with you and
need protection."*

**I measured your nine before building anything:**

| companion | says it cannot fight | assistTags |
|---|---|---|
| **aevi** | ⛔ yes — *"cannot fight, cannot lift"* | investigate, analyze, study, comfort |
| **coil** · **ember** · **hush** · **marrow** · **sprig** | ⛔ yes | mend · navigate · conceal · deathsense · heal |
| **bristle** | no | track, **guard**, intimidate, sense-danger |
| **quill** · **tal** | no | study · craft, carry, talk |

⛔ **SIX OF NINE. Making everyone a combatant would have contradicted six authored records** — and I would
have done it, because Erik's sentence reads that way until you look at the content.

---

## §2 — ✅ SO PRESENCE AND PARTICIPATION ARE SEPARATE, AND THE SECOND HALF OF HIS SENTENCE IS THE REAL ASK

| | |
|---|---|
| **PRESENT** | in the scene, therefore **TARGETABLE**. ⚠️ Keening drops everyone in earshot — including the healer who never swung at anyone. |
| **PARTICIPATING** | declares and rolls |

⛔ **A COMPANION WHO CANNOT FIGHT NEEDS PROTECTING MORE, NOT LESS**, because they have no answer of their
own. **That is what interception is for**, and it means your six non-combatants are not a limitation on the
feature — **they are its subject.**

```
keening aimed at Sprig (a healer who cannot fight)
   → the character standing in front catches it
   → Sprig is untouched
```

⚠️ **Erik's two clauses turned out to be one feature and one authoring question**, and the authoring
question is §3.

---

## §3 — ⛔ WHAT I NEED FROM YOU, AND IT IS ONE FIELD

**`canAct` reads an authored `combatant: true`. ⚠️ NOTHING AUTHORS IT YET, so today every companion is
present-and-defenceless — including `bristle`, who tracks, guards and intimidates and is plainly the one
you would mark.**

⛔ **I DID NOT INFER IT FROM PROSE.** *"Cannot fight"* lives in `bondGrants.description`, and **a regex over
prose finds words, not facts** — your warning, and the water-word audit stands behind it. **A gate asserts
the module contains no prose reading at all**, so nobody can quietly add one later.

**Absent defaults to NO**, because the documented majority cannot fight and **a wrong default puts a healer
in a duel.**

⚠️ **My read, and it is only a read:** `bristle` is `combatant: true`; `quill` and `tal` are probably not —
they carry, study and talk. **Your call entirely, and one line each.**

---

## §4 — ⚠️ AND A PRESENCE SHEET IS DELIBERATELY NOT A FIGHTER'S STATLINE

**Enough to RESIST with, a health pool, and no skills at all.** ⛔ **Giving a non-combatant a combat
statline would invent exactly the thing the content refuses** — and it is the kind of quiet invention that
would show up three weeks later as "why does the healer have a sword".

**A companion of a level-9 character resists better than one travelling with a novice**, which is the only
scaling in there and the only one I could justify without a ruling.

---

## §5 — WHERE THIS LEAVES THE INTERCEPTION BUILD

| | |
|---|---|
| `intercept.js` | ✅ built, gated, reading your authored `shared_weight` |
| `combatants.js` | ✅ built — there is now something to protect |
| ⛔ **the call site in the round** | ⚠️ **still open**, and it is bigger than either module |

**`battleRound` is strictly two-sided.** Giving it a party is a real change and **Erik has now answered the
design question that was blocking it** — allies are present, some act. ⛔ **That is the next build and I
would want it scoped before I start**, because it touches turn order, targeting and the receipt.

**Nothing of yours is with me. One field, whenever you like.**

— CCode
