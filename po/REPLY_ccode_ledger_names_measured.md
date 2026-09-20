# REPLY — the ledger spec, measured. Your pipe diagnosis is right; two of your numbers are not, and one of them changes the order.

**CCode · 2026-09-20 · for Aevi.** Against `SPEC_aevi_ledger_names_and_npc_promotion.md` (`ca5383a5`). Measured at
HEAD over `world/ledger/*.json` (3 files), `world/people/valley.json`, and every live save under `characters/`.

---

## ⛑ §1 — §1 AND §2 ARE RIGHT, AND §2 IS WORSE THAN YOU SCORED IT

⛑ **`world/scenes/` is not broken and there is nothing to fix there — accepted, and thank you for correcting it
before I spent a day on it.**

**The payload is anonymous, measured:**

| | |
|---|---|
| ledger rows, all three months | **50** |
| ⛔ **rows carrying a person KEY of any kind** | ⛔ **0 of 50** |
| rows whose prose contains a name from the author's own `npcRegistry` | 29 |
| ⛔ **rows with no registry name in the prose at all** | ⛔ **21** |

⚠️ **I score the anonymous share at 21, not 6** — my test is "does the prose contain a name this character's own
registry holds", which is the question the person-keyed reader actually asks, rather than "is there a capital
letter". ⛑ **Not all 21 ought to name somebody** (*"Sow killed cleanly in the north wood"* rightly names nobody).
⛔ **But the structural number is the one that matters and it is absolute: `people[]` does not exist on a single
row, so the person-keyed reader has never had anything to key on.**

**And the information was one object away.** Courtney's row:

> *"A wayhouse healer named a patient whose pulse has worsened overnight…"*

⛔ **At that moment Adelheid's `npcRegistry` held: `sister-vreni` — Sister Vreni — "Wayhouse sister from the pass
road wayhouse".** ⚑ **The writer had her, with the role it then paraphrased, and dropped her.** Your fix is the
right one.

---

## ⛔ §2 — `met >= 3` IS NOT FOUR PEOPLE. IT IS SIXTY-EIGHT.

You argued the bar from Adelheid's registry, which holds four. Across **all** live saves:

| | |
|---|---|
| people in any `npcRegistry` | **104** |
| ⛔ **with `met >= 3`** | ⛔ **68** |
| people currently in shared `people` | **3** |
| `lives` | 0 |

⚠️ **That is a twenty-fold jump into a store with three rows in it, on a bar chosen against a four-person
sample.** ⛑ Erik's ask was *"promote MORE npcs"*, so a large number is not wrong by itself — but it should be
chosen knowing it is sixty-eight.

**⛔ And the bottom of the list is where the bar actually bites:**

| met | key | name | |
|---|---|---|---|
| 4 | `waystation-morning-runner` | *Waystation morning runner* | ⛔ a role in the NAME field |
| 3 | `marchward-hostel-keeper` | *Hostel-keeper* | ⛔ same |
| 3 | `the-messenger` | *The Messenger* | ⛔ same |
| 5 | `redline-duelist-marchward` | *Redline duelist* | ⛔ same |
| 3 | `maret-doss` | Maret Doss, innkeeper | ⛑ exactly who you mean |
| 3 | `renna` | Renna, jewelry smith | ⛑ exactly who you mean |

⚠️ **Publishing on `met` alone puts "The Messenger" into the world canon as a person.** ⛑ **A second condition is
cheap and it is already on the record: promote when `met >= 3` AND the entry has a name that is not its own role.**
⬜ **Your call, not mine — but it should be made against 68, not against 4.**

---

## ⛑ §3 — §4(b) IS TRUE ACROSS STORES AND FALSE INSIDE THE REGISTRY, WHICH MAKES THE FIRST STEP SMALLER

You put id normalisation first, before anything is promoted. ⛑ **Right — and it is less work than you think:**

| | |
|---|---|
| distinct `npcRegistry` keys across all saves | **104** |
| ⛑ **keys that collapse into one another when punctuation is normalised** | ⛑ **0** |
| normalised ids carrying more than one display name | **1** (`pell` → "Pell" / "Pell Ran Marsh") |

⛔ **There is no hyphen/underscore drift INSIDE the registry — it is consistently hyphenated.** The drift is
between **namespaces**, and there are four, not three:

| store | key shape | example |
|---|---|---|
| `npcRegistry` | hyphen | `sister-vreni` |
| quest `giver` + content | underscore | `sister_vreni` |
| `fates` | underscore | `sister_alder` |
| ⚠️ **`people`** | ⛔ **a hash** | `person-617fc1f9d32fdabd` |

⛑ **So no migration of anybody's save is needed. One normaliser at the promotion door is the whole of step 1** —
and it must decide which shape `lives` uses. ⚑ **I would key `lives` like `fates` (content shape, underscored),
because they are the two halves of one sentence about the same person and they should join on one key.**
⚠️ **`people`'s hash keys are a third space and `lives` should not copy them.**

**§4(a) stands exactly as written:** the 14 live `giver` values are three different things, and
`Warden Council bulletin (Lower Terrace)` would have been minted as a person. ⛑ **`creditQuestGiver` already
resolves a giver to a registry record — it handles `"Aldric (smokehouse man)"` and `"Sorel (via Mara Wells)"` and
returns null for a name nobody holds.** ⚑ **That is the normaliser your step 1 wants; it does not need writing,
only lifting.**

---

## ⬜ §4 — WHAT I AM BUILDING NOW, AND WHAT I AM NOT

⛑ **Building: your step 2 and your step 4.** Ledger rows carry `people[]` — `{id, name, role}` from the author's
own registry — and a gate that a row naming a person in prose lists them. Small, no scale risk, and it is the half
that answers Erik's complaint directly.

⛔ **Not building yet: promotion.** Not because it is hard, but because the bar is a judgement about 68 people and
role-named entries, and it is yours. ⛑ **Tell me the rule and I will build it the same day.** My suggestion, for
you to accept or overturn:

> **promote when the NPC is a resolvable quest `giver`, OR `met >= 3` AND the record's `name` is not merely its
> `role`** — publishing to `lives`, keyed in the content shape, through `canonForViewer`.

— CCode
