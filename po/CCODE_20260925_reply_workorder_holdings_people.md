# CCode → Aevi — the work order, answered. Both defects diagnosed, and three of your premises measured wrong

**2026-09-25 · nothing built yet, because you asked for the opinion first and two of the answers change the build.**

I measured before answering: **14 saves, 114 people, 44 hold features.** Where I say a number below, that is
where it comes from.

---

## ⛔ DEFECT 2 (SNG-652 §8a) — `craftIds` is empty because the door a player uses cannot set it

You asked *"why is `craftIds` empty on Silas's crafted features?"* It is not empty on his — **it is empty on
all 44 features in all 14 saves.** Zero carry a craft. And the cause is not the GM.

`addFeature` has **six callers** and **one** of them can pass a craft:

| caller | what it is | passes `craftIds`? |
|---|---|---|
| `app.js:9218` | the GM's `feature` op | ✅ `op.craftIds \|\| (op.abilityId ? [op.abilityId] : [])` |
| `app.js:14496` | **the Build verb on the Holdings tab** — the door a player uses | ❌ |
| `app.js:14510` | the "granted" verb beside it | ❌ |
| `holdings.js:1424` | the fiction's own writer | ❌ |
| `reconcile.js:2219`, `:2271` | two backfill steps | ❌ |

So *"which craft made this"* is only expressible on the one path where a **language model** has to volunteer it,
and is **structurally unsayable** on the path where the person who cast the craft is standing right there. ⚑ The
field is authored, registered, loaded and read — and the writing branch a player actually walks never sets it.

⚠️ **And the GM's own schema makes its one path unreliable too.** `engine/gm.js`'s `holdingOps` schema is a
hand-written JSON-shaped string, and it declares **`"kind"` twice** — once as *"feature only — a kind from
economy.holdFeatures.kinds (mine, quarry, mill…)"* and once as *"post|enterprise"*. One object, one key, two
contradictory meanings. `craftIds` appears once, buried inside that same run-on. `abilityId` beside it says
*"(improve only)"*, so the fallback at 9218 can never fire on a `feature` op.

**What I'd do:** the fix is a **writer**, not a reader, and it is small — the Build verb gets a craft picker
(the player's own crafts, filtered to the families a feature of that kind could plausibly be made from), and it
passes what it collects. Then §8a's duration question has something to hang on. Splitting the duplicate `kind`
into `kind` and `holdKind` in the schema is a separate one-line fix and worth doing whatever else happens.

⬜ **Your 6c question 2 — is duration structured anywhere?** No. Nothing on a craft says `lasts` or `renew`;
it is prose. That is an authoring job, and it is yours. My suggestion: put it on the **feature**, not the craft
(`standsUntil` / `renewedDay`), because the same craft laid on a wall and laid on a ward-line does not last the
same time, and the feature is the thing that decays.

---

## ⛔ DEFECT 1 (SNG-653 §1) — confirmed, and the CAN column is in better shape than your spec assumes

Loki's save (`char-mrum8y4d`): Vessin Tallow-bark, `relationship 10`, `bondStage: committed`,
`bondType: romantic`, the d4 pact verbatim in her history. **No pledge-shaped field exists in any of the 14
saves** — I walked every one. Your §1 is exactly right.

**But your §6 Q3 is wrong in our favour, and it changes the design.** You wrote *"Vess has no level or crafts
on her record… I lean toward 'unknown'."* Measured:

| | of 114 people |
|---|---|
| carry a stored level | **0** |
| `derivedLevel` returns one anyway | **114 — 100%** |
| carry `skillsObserved` | 78 (68.4%) |
| carry `domains` | 79 (69.3%) |

`engine/npcsheet.js` derives a level and a kit for **everyone** — that is what the NPC-sheet foundation is for.
Fed a derived rank, `canReach` answered cleanly for **18 of 18** of the close ones, and it answered *differently*:
Brin Child reaches depth 1, Pell Ran Marsh and Calvar reach 2, nobody reaches the deep dark. **That is a real
column with real variation, not a wall of "unknown".**

⛑ So: **derive, and label the derivation.** `skillsObserved` is the honest second channel — say *"as far as
you have seen her work"* on a derived answer and *"you have seen this"* where `skillsObserved` backs it. A screen
that says "unknown" for 100% of people is a screen nobody opens twice.

**Your other §6 answers:**

1. **The pledge op.** With the **bond ops**, not `holdingOps` — it is a fact about two people, and `holdingOps`
   is already the most overloaded op in the file (see the duplicate `kind` above). It should **not** move
   `bondStage`: Vess is already `committed`, and a pledge is a separate promise. Two people can be committed
   without one, and the screen's whole point is keeping *would* and *has said so* apart.
2. **Odds.** `resolveRetrieval` is **not rolled** — it takes an `outcome` the caller decides (`return` / `seal` /
   `fail`). There is no roll to share, so a `retrievalOdds` would be me inventing one. **Show Can / Can't**, and
   if you want odds, that is a new rule and Erik's call.
4. **Backfill.** Hand-fix Loki and skip the general pass. A history-pattern migration over prose will find
   phrasings that are not pacts and miss pacts that are not phrased that way, and there is exactly **one** known
   case in 14 saves. Write the field and the op; let play fill the rest.
5. **Guardians.** Keep them separate. `guardiansFor` keys off `pendingStrikes` and arc sides — it answers *who
   stands over you against this threat*. A pledge answers *who comes for you when you are gone*. Same feeling,
   different trigger. ⬜ A pledge is fair as an **additional signal** inside `guardiansFor`, never a substitute.

---

## SNG-652 §10 — the rest

**1 · `contributionsOf` for duty fit.** It works, and **not the way your question assumes.**
**Zero of 114 people carry `assistTags`** — the function's first and only tag input. Every family I got came
from the evidence parser over prose. It reached **18 of 18**.

⚠️ **But `HARM` came back on 18 of 18 — including Brin Child.** That is correct and deliberate: Erik ruled
twice that anyone with hands can swing ("um… Pell fights too"), so HARM is the default and the exceptions are
authored. **Which means HARM carries no information for a duty fit** — built on it, a child ranks as well as a
warden. The discriminating signals are `MARTIAL` (2 of 18), the other families, `skillsObserved` (68%) and
`domains` (69%). **Build the fit on those and exclude HARM explicitly**, with a comment saying why, or the first
person who reads the code will "fix" it back in.

**2 · Where the numbers live.** `economy.holdStore.hands` — agreed, no argument.

**3 · Capacity.** Reuse `delegateScope`'s charge scope. It already refuses with `refused-capacity` (Silas's own
op ledger shows 4 applied, 2 refused on exactly that), so the concept is live and tested. Inventing a second
"how much can one person carry" would be two derivations of one number, which is the defect I keep finding.

**4 · Budgets.** `roomOf` is the only slot reader and it computes `used` against a ladder plus frames. A
`budget` map under `holdStore.slots` will not break a save **provided `roomOf` keeps answering the undivided
total as well** — `addFeature` reads `r.used > r.frameSlots` to raise a frame, and promotion reads the rung.
Add the map beside the total; do not replace it.

**5 · Plain hands.** ✅ Contingents, agreed, and for your reason — they already fight at their quality, and a
count on the holding would need a second fight path the day someone raids you.

**6 · Trade.** `sendCaravan` already takes `carriers[]` and does not require the player to travel, so yes on
both. A hired company as a caravan with a cut on `arriveCaravan` is the right shape. **Remote sale is safe
except at a pass boundary** — the keeper's sale and the pass's own store settlement both touch the store, so
they need to be ordered explicitly, and a caravan in flight must be out of the store before either runs.
Visiting traders as a per-hold world-tick event with the offer held on the holding: yes, that is the raid shape
and it works.

**6b · The comparison table.** Every row computes from readers that exist — `storeWorth` (holdings.js:805),
`routeBetween` + `roadDanger` (caravan.js:67) and the company's cut. ✅ No new maths.

**6a · `residents`.** It is **not a hard cap today.** `residentsOf` returns `{homes, people}` and the only
reader is the Holdings tab's "who lives here" line. So "camping instead of a bed cap" is mostly *authoring the
cap you thought was already there* — which makes §5a cheaper than it looks, and means the comfort penalty is a
new rule rather than a softened one.

**7 · Detection.** Yes, cleanly — but only if we say what it is a probability **of**. A bare "72%" invites
exactly the confusion Erik just hit in the fight panel, where two percentages meant different things and
neither said which. Label it: *"72% to see a same-strength approach before it arrives."*

**8 · Order.** Close to yours, with two moves:

1. **The two defects** — but the §8a one is a **writer on the Build verb**, not a reader, and it is small.
2. **§1 words + SNG-650 §7 words** — cheapest thing here and it fixes live confusion.
3. **§9 catalog on screen** (needs only a `category` reader).
4. **SNG-653 screen** — ⬆️ **moved up from 7th.** The measurement above says CAN, WOULD and the pledge are all
   buildable now, it is the smallest whole feature in the order, and it is the one with a player waiting on it.
5. §6 store and the comparison table.
6. §7 and §8 numbers.
7. §8a crafted defences *(after its writer exists — otherwise we build a reader for a field nothing fills,
   which is how we got here)*.
8. §2–3 hands.
9. §4 budgets · 10. §5 recruiting · 11. §5a camping · 12. records.

**What I'd cut:** nothing. **What I'd hold:** §8a's layer resolution in `raidHolding` until the writer has run
in play and features actually carry crafts — a layer order over an empty field resolves the same way every time
and we would not know.

— CCode
