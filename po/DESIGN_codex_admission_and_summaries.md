# DESIGN — summarise, merge, and stop admitting what should never have been a topic

**Aevi (PO) · 2026-09-06** · ✅ **Status:** `built` — v1.9.394/395, §113–§119

⛑ **CLOSED 2026-09-06, in the order the design asked for.** ✅ **Admission test · summaries · alias feeding · the `kind` correction · the sweep last.** ⛔ **AND CCODE FOUND WHAT THE DESIGN MISSED: the tidy was SLICING over-cap topics to the floor — Mara Wells cut from 43 facts to 24.** ⚠️ **Aevi measured 'four subjects at the ceiling, accepting nothing more' and read a CEILING where there was a KNIFE.** ✅ 144 facts recovered across three saves. ⚑ **AND THE §2 FOLD WAS AEVI'S OWN FAULT, CORRECTLY DIAGNOSED:** she wrote 'seven `edge-district-*` topics are one place' and called it a LABEL prefix when it is an ID prefix pointing at a place labelled something else. ⛔ **No standing id-prefix rule exists — reconcile 43 names the parent for the one save that has the family**, because a standing rule would have to GUESS a parent and guessing is how a fold becomes a deletion.
**Supersedes the §3 of `SPEC_codex_summaries_and_merging.md`, which described the shape and not the rule.**
> CCode: *"your codex is full — 60 of 60, four subjects at the 24-fact ceiling, 26 topics holding a single
> fact. It needs her summarise-and-merge design rather than a dial from me — **the merging machinery and
> aliases already exist, but nothing feeds them**."*

---

## §1 — ⛔ I MEASURED THE 26, AND THE DIAGNOSIS CHANGES

**My spec assumed the singles were DUPLICATES the merger missed. They are not.** ⚠️ **Most of them are
things that should never have been topics at all.**

| what they actually are | examples |
|---|---|
| ⛔ **A BEAT WITH A TITLE** | `rabbit-structural-seam` · `millbrook-north-wood-boar` · `grael-runner` · `the-person-with-a-list` |
| ⛔ **A FACT ABOUT A PLACE, FILED AS A PLACE** | ⚑ **SEVEN `edge-district-*` topics — four of them single-fact:** `-contacts` · `-approach` · `-route` · `-outer-settlement` · `-interference`, beside `-huginn-building` (12) and `-document-roll` (4) |
| **a genuine new subject** | `dav-cutter`, `bette-harrow` — ✅ **correct, and they will grow** |

⚑ **AND THE MERGER CANNOT FIX THE FIRST TWO CLASSES, WHICH IS WHY IT DID NOT.** ⛔ **`suggestMerges`
compares topics that might be THE SAME THING.** ⚠️ *The Seam in the Returned Animal* is not the same thing
as anything — **it is a fact about a rabbit, and it needed a home rather than a merge.**

➡️ ⛔ **THE DEFECT IS ADMISSION, NOT TIDYING.**

---

## §2 — ⛔ RULE ONE: A TOPIC IS A SUBJECT THAT WILL BE MENTIONED AGAIN

**The GM's own rule 17 already says it** — *"A CODEX TOPIC IS A SUBJECT THAT ACCUMULATES FACTS, NOT A
HEADLINE FOR THIS BEAT"* — ⚠️ **and it is being ignored 26 times.**

⬜ **The admission test, at `applyCodexUpdates`:**

| ⛔ REFUSE a new topic when | ⚑ instead |
|---|---|
| ⚠️ **an `entityId` is present and a topic already carries it** | **add the fact there.** ⛔ Five topics currently disagree with their own entity |
| ⚑ **the label starts with an existing topic's label** | ⛔ **`edge-district-*` — SEVEN TOPICS, ONE PLACE.** Add the fact to the place and make the rest an alias |
| **the label reads like a sentence about a beat** | ⚠️ rule 17's own test: *"a topic label should read like the NAME OF A THING, never like a sentence about it"* |
| ⛔ **the codex is FULL and the fact has a home** | ⚑ **a full codex should never evict a growing subject to admit a headline** |

⛔ **AND WHEN IT REFUSES, THE FACT IS NOT LOST — IT LANDS ON THE NEAREST REAL SUBJECT.** ⚠️ **A refused
topic that drops its fact is worse than the mess.**

---

## §3 — ⚑ RULE TWO: FACTS COLLAPSE, AND THE SUMMARY IS WHAT IS READ

**Calvar's last three facts, all at the ceiling:**
> *"[while away] A gap in the cloud cover last night gave Calvar an unusually clean read…"*
> *"[while away] A gap in the cloud cover this morning gave him the clearest read he has had in six days…"*
> *"[while away] A second instrument recorded a pressure differential…"*

⛔ **THREE FACTS THAT ARE ONE FACT: *Calvar is getting good reads and the numbers are moving.***

| ⬜ | |
|---|---|
| **`summary`** | ⚑ **a paragraph. It is what the player reads** |
| **`facts`** | ⛔ **a collapsed *Details* section — the receipts.** ⚠️ Erik: *"not really meant to be read by a player"* |
| **when** | ⚑ **at 8 facts, re-derived every 4 after.** ⛔ **Never appended — a summary that grows by accretion is the log again** |
| ⚑ **and it MAKES ROOM** | ⛔ **facts folded into a summary retire from the count** — ⚠️ **which is what unblocks the four subjects sitting at 24 and accepting nothing** |
| **who writes it** | ✅ **the `buildMergeAdjudicationPrompt` path — an LLM call that already exists for a sibling job** |

⚠️ **A `[while away]` fact is the clearest candidate to fold: it is world-tick texture, not something the
player learned by being there.**

---

## §4 — ⚑ RULE THREE: FEED THE ALIASES

⛔ **`resolveTopic` already matches incoming names against `aliases`. NOTHING WRITES THEM.** ⚠️ Four sources
exist and none is wired:

| source | ⬜ |
|---|---|
| ⚑ **an NPC's `aliases`** | the schema carries it; **the codex never reads it** |
| ⛔ **`revealName`** | ⚠️ **when the tuning-warden turns out to be Maren, the OLD NAME MUST BECOME AN ALIAS.** The op exists; the codex is not told |
| ⛔ **a role that became a person** | ⚑ **`water-keeper` (10 facts, label *"Mara Wells"*) AND `mara-wells` ARE TWO TOPICS ON THIS SAVE RIGHT NOW** |
| **titles in labels** | *the Ditch-Mother*, *the Lens-Grinder*, *the Seed Ledger* — ⚠️ already written, never harvested |

⚑ **AND ALIASES ARE WHY THE MERGE MACHINERY WILL START WORKING**: `suggestMerges` compares labels, and a
topic with no aliases presents one name to compare.

---

## §5 — ⬜ AND ONE CORRECTION THAT IS A PREREQUISITE

⛔ **`millbrook` is `kind: "event"`.** ⚠️ **`compatibleKinds` gates merging, so a place topic can NEVER merge
with it** — ➡️ **a wrong kind is not cosmetic, it is a permanent barrier to every future tidy.**

⬜ **A kind must be correctable, and correcting it must re-open the pair.**

---

## §6 — ⬜ ORDER, BECAUSE ONE OF THESE UNBLOCKS THE REST

| # | | why here |
|---|---|---|
| **1** | ⚑ **the admission test (§2)** | ⛔ **stops the bleeding.** Everything else is cleanup, and cleanup under a leak is a treadmill |
| **2** | ⚑ **summaries (§3)** | ⛔ **makes room** — the four at 24 start accepting again |
| **3** | **alias feeding (§4)** | ⚑ **then the existing merger starts finding pairs it could never see** |
| **4** | **the `kind` correction (§5)** | small, and it unblocks `millbrook` |
| **5** | ⬜ **a one-off sweep of the existing 26** | ⚠️ **LAST.** ⛔ **Do not sweep before §2, or the same 26 arrive again next week** |

---

## §7 — ⬜ WHAT I WANT ERIK TO RULE

1. ⛔ **May the admission test REFUSE a GM-requested topic outright?** ⚑ Aevi's read: **yes, and re-home the
   fact** — ⚠️ **but it is the GM being overruled by the engine, which this project has been careful about.**
2. ⚠️ **Do folded facts stay visible in Details, or retire entirely?** ⛔ **Aevi's read: STAY.** ⚑ **A summary
   the player cannot audit is a claim** — and the count that matters is the one against the ceiling, not the
   one on disk.
3. ⬜ **Is 60 still the right topic cap once topics summarise?** ⚑ **It is full today, and §2 alone may be
   enough** — ⚠️ **26 of the 60 should never have been admitted.**
