# SPEC — the codex should read like a book, not a log

**Author:** Aevi (PO) · **2026-09-05** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**subject:** codex
> Erik: *"We need to improve how things land in the codex — right now it makes quite a mess. After a while
> the known facts entries should get **summarized into a few sentences or paragraphs** — the known facts
> should **collapse to a details section that isn't really meant to be read by a player**. And we need to do
> a much better job of **allocating, and merging people, places, things** together. We should use
> **nicknames, aliases**, etc."*

---

## §1 — MEASURED ON SILAS'S SAVE

| | |
|---|---|
| **topics** | ⛔ **60 — the cap is 60.** ⚠️ **It is FULL, so the next real subject evicts something** |
| **facts** | ⚑ **323** |
| **the biggest** | ⛔ **24 facts each on `the-water-crisis`, `pell`, `millbrook`, `calvar`** — and 24 is `factsPerPrimary`, the ceiling |
| ⚠️ **single-fact topics** | ⛔ **26 of 60 — nearly half the codex is one line that will never grow** |

### ⛔ FOUR FAULTS, ALL VISIBLE IN ONE SCREEN

**1 · A PERSON IS A WALL OF 24 LINES.** Pell's entry opens:
> *"[d3] Pell's father told her he had been a clerk… [d3] Named the shape of her father in Calvar's room…
> [d3] Under Huginn's witness, Memory received Calvar's three-year private refusal…"*

⚠️ **Every one is a real thing that happened. Nobody will read twenty-four of them.**

**2 · ⛔ THE TOPIC ID AND THE ENTITY DISAGREE — five live cases:**

| topic | actually about |
|---|---|
| `the-edge-district-ledger` | ⛔ **`mara-wells`** — a person filed as an event |
| `ashwarden-thread` | **`veth-stillwater-ondra`** |
| `edge-district-huginn-building` | `radiant-plateau-edge` |
| `vash-the-lens-grinder` | `vash` |
| `leth-archive-complaint` | `leth` |

⚠️ **A player looking up Mara finds a topic called *the Edge District Ledger*.**

**3 · ⛔ `millbrook` IS `kind: "event"`.** It is a village.

**4 · ⚠️ AND THE KINDS ARE SKEWED:** 19 person · 17 mystery · 9 lore · 8 place · 6 event · **1 faction.**
⛔ **A world with eleven arcs and a Choir has one faction topic.**

---

## §2 — ✅ WHAT ALREADY EXISTS, WHICH IS MORE THAN EXPECTED

⛔ **This is a policy and wiring gap, not a missing system.**

| built | |
|---|---|
| ⚑ **`aliases`** | on every topic, `aliasesPerTopic: 8`, and `resolveTopic` already matches an incoming name against them |
| ⚑ **merging** | `mergeInto` · `mergeCodexTopics` · `suggestMerges` · `undoLastMerge` |
| ⚑ **adjudication** | `buildMergeAdjudicationPrompt` + `applyMergeVerdicts` — ⚠️ **an LLM already decides hard pairs** |
| ⚑ **`notSame`** | the player's refusals are respected and cascade. **Three are recorded** |
| ⚑ **standing tidy** | `mergeCodexTopics` runs on every turn at `app.js:3156` |

⛔ **AND YET 26 SINGLE-FACT TOPICS AND FIVE MISFILED ONES SURVIVED IT.** ⚠️ **So the merger is running and
not catching this class** — ⬜ **which is the first thing to measure.**

---

## §3 — ⬜ WHAT TO BUILD

### 3a · ⛔ A TOPIC IS A SUMMARY, AND THE FACTS ARE THE APPARATUS

> Erik: *"summarized into a few sentences or paragraphs — the known facts should collapse to a details
> section **that isn't really meant to be read by a player**."*

⬜ **Add `summary` to a topic. It is what the player reads.** ⚠️ **The `facts` array becomes a collapsed
*Details* section — the receipts, kept because they are true and because the summary is derived from
them.**

| ⬜ | |
|---|---|
| **when it writes** | ⛔ **at a threshold, not every turn.** ⬜ **Aevi's read: at 6 facts, and re-summarised every 6 after** — so a topic is a paragraph long before it is a wall |
| **who writes it** | ⚑ **the same path as `buildMergeAdjudicationPrompt`** — an LLM call that already exists for a sibling job |
| ⛔ **and it is REDERIVED, never appended** | ⚠️ **a summary that grows by accretion is the log again with better margins** |
| **the facts stay** | ⛔ **they are the evidence.** ⚠️ **A summary the player cannot audit is a claim** |

⚑ **AND IT FIXES THE CAP PROBLEM SIDEWAYS:** at 24 facts a topic stops accepting new ones. ⬜ **A summarised
topic can retire its oldest facts INTO the summary and keep accepting** — ⛔ **which is what the 24-fact
ceiling is currently blocking on four of Silas's most important subjects.**

### 3b · ⚑ THE TOPIC ID SHOULD FOLLOW THE ENTITY, ALWAYS

⛔ **Five topics disagree with their own `entityId`.** ⚠️ **The GM's rule 17 already says to pass `entityId`
when a fact is about a known person or place** — and it does. ➡️ **The defect is that the TOPIC keeps the id
of whatever the first fact was called.**

⬜ **Proposed: when a topic carries an `entityId`, that IS its id.** ⚑ *The Edge District Ledger* becomes an
**alias on `mara-wells`**, not a topic beside it — ⚠️ **which is exactly what `aliases` is for and is not
being used for.**

### 3c · ⛔ NICKNAMES AND ALIASES ARE THE MERGE KEY, NOT A DISPLAY FIELD

> Erik: *"We should use nicknames, aliases, etc."*

⚠️ **`resolveTopic` already matches on aliases. What is missing is anything that FEEDS them:**

| source | ⬜ |
|---|---|
| ⚑ **an NPC's `aliases`** | the schema carries it; **the codex never reads it** |
| ⚑ **`revealName`** | ⛔ **when the tuning-warden turns out to be Maren, the old name should become an ALIAS** — the op exists and the codex is not told |
| ⚑ **a role that becomes a person** | *the water-keeper* → **Mara Wells.** ⛔ **BOTH EXIST AS SEPARATE TOPICS ON SILAS'S SAVE RIGHT NOW** — `water-keeper` carries 10 facts and `entityId: water-keeper` while its label reads *Mara Wells* |
| **titles** | *the Ditch-Mother*, *the Lens-Grinder* — ⚠️ **already in labels, never in aliases** |

### 3d · ⬜ AND MERGE PLACES AND THINGS, NOT JUST PEOPLE
⚠️ **`compatibleKinds` gates what may merge.** ⛔ **`millbrook` is `kind: event` and a place topic can never
merge with it** — ➡️ **so a wrong kind is not cosmetic, it is a permanent barrier to tidying.**
⬜ **A kind should be correctable, and correcting it should re-open the pair for merge.**

---

## §4 — ROUND 2 QUESTIONS

1. ⛔ **Why did 26 single-fact topics and five misfiled ones survive a merger that runs every turn?**
   ⚠️ **That is the measurement that decides whether 3b is a fix or a symptom.**
2. **Where does the summary call live?** ⬜ `buildMergeAdjudicationPrompt` is the model — ⚠️ **but that one is
   player-invoked and this should be automatic.**
3. ⬜ **Does a summarised topic still feed `codexForGM`?** ⛔ **It should feed the SUMMARY, not 24 facts** —
   ⚠️ **and that alone may be a meaningful prompt saving on every turn.**
4. ⚠️ **Is `topics: 60` the right cap once topics summarise?** ⛔ **It is full today.**
5. ⬜ **Should `notSame` also work at the ENTITY level?** ⚑ Two people with the same nickname is a real case,
   and the three recorded refusals are all person-person.
