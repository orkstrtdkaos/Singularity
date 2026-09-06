# LANDING CONTENT WITHOUT BREAKING A GATE — the checklist

**CCode → Aevi · 2026-09-06 · at v1.9.387.**
⚑ **Erik: *"perhaps you can give her a document that details what she has to follow every time?"***

⛔ **EVERY ITEM HERE IS SOMETHING THAT ACTUALLY WENT RED TODAY.** Nothing is theoretical, nothing is
defensive, and where a gate was wrong rather than the content, this says so — three of the nine were mine.

---

## §0 — ⚑ **THE PROCEDURE IS AEVI'S OWN, AND IT IS BETTER THAN THE ONE I WROTE**

⛔ **She wrote this before I did** — `po/AEVI_20260906_procedural_fixes.md` §3 — **and it names three things
mine did not: the linter, `skills_inject`, and declaring the field in the schema.** ⚑ **So it is the spine
here rather than a second opinion beside it.** ⚠️ **Two competing checklists is worse than one.**

| # | after ANY content write, before saying it is done |
|---|---|
| **1** | ⚑ **`node po/craft_lint.mjs`** — ⚠️ **before touching the source of truth, not after** |
| **2** | ⛔ **ENACT IT: a BODY section rewritten in present tense + a LOG row.** ⚠️ *"A ruling that lives only in a working paper is a rumour with a commit hash."* `po/` is never authoritative |
| **3** | ⛔ **if the ruling declares a `bodyAnchor`, the body carries it VERBATIM, ON ONE LINE** — ⚠️ §62 matches per line, so a soft-wrapped anchor is not carried |
| **4** | ⚑ **new field? DECLARE IT IN THE SCHEMA.** ⚠️ The ability schema is CLOSED — 31 crafts failed validation until `mechanic.meaning` was declared |
| **5** | **regenerate what derives:** `skills_inject` · `atlas_inject` · `certify_counts` |
| **6** | ⚑ **run `content_ci` AND `how_it_works`, and READ THE FAILURES — not the count** |

⛔ **Her own note on step 6 is the sharpest line either of us wrote today:** *"I have been reporting '13
pre-existing' for three days without reading the list — and when Erik asked what they were, three of them
named ME."* ⚠️ **A count is not a reading.**

➡️ **Then the push hook runs `run_tests --ratchet` (~5 min) and lands it.** ⚑ Running it yourself first is
not faster — it is the same five minutes, earlier, where the output is easier to act on.

---
## §1 — ⛔ THE FOUR THAT BIT TODAY, AND WHAT EACH ONE MEANS

| what went red | why | ⚑ the fix |
|---|---|---|
| **`FR: the embedded atlas is FRESH`** ×3 | ⚠️ **`docs/FIELD_REFERENCE.md` embeds a generated table.** Any new field, any new `mechanic.*` key, any ability count — and the table is stale | `node scripts/atlas_inject.mjs` |
| **`CERTIFY: every count the docs certify is fresh`** ×4 | the docs state real counts — people, crafts, places — and you changed one | `node scripts/certify_counts.mjs` |
| **`§0b: every log row carries all five columns`** | ⛔ a `HOW_IT_WORKS` log row landed with **four** cells | date · change · intent · **tested by** · impacts. ⚠️ For unbuilt work, *"⬜ not yet — unbuilt"* is a real answer |
| **`content_ci: no NEW want-without-seed NPC`** | a person gained a `want` with no seed behind it — 47 → 48 | ⬜ **a backlog ratchet: it may only go DOWN.** Give the want a seed, or work one off elsewhere |

---

## §2 — ⚠️ THE SUBTLER ONE, AND IT IS THE ONE TO REMEMBER

> ⛔ **YOUR 31 `mechanic.meaning: "none"` OPT-OUTS DID NOT BREAK THE ENGINE. THEY BROKE TWO GATE FIXTURES
> THAT PICKED "ANY METAPHYSICAL CRAFT".**

⚑ **You found this yourself, and you were right that it was mine to fix.**

➡️ ⛔ **AND HER DIAGNOSIS WAS SHARPER THAN MY FIRST FIX.** I added `&& a.mechanic?.meaning !== "none"`, which
narrows the pool from 165 crafts to 134 — ⚠️ **and leaves it exactly as order-dependent as it was.** ⚑ Her
actual finding: *"the fixture is NON-DETERMINISTIC — it was always 'whichever craft happens to be first',
and my change moved which one that is."* ⛑ **Both now sort by id and take the first, which no authoring
change can move.**

⚠️ **THE SHAPE GENERALISES:** ⛔ **when you add an opt-out, a null, or an exception to a class of records,
some gate is picking a fixture from that class by `.find()`.** ⚑ It was true when written, and your
exception makes it false **silently**, because `.find()` still returns *something*.

⬜ **What to do: after any sweep that tags N records with an exception, run `how_it_works` and read the
failures for the word your exception uses.** ⚠️ If a gate fails on a FIXTURE rather than on a CLAIM, say so
and hand it to me — ⚑ **which is exactly what you did, and it was the fastest path.**

⛑ **And you were right not to touch `tests/how_it_works.mjs`.** *"A content author editing the gate that
judges her content is the shape this project has ruled against."*
---

## §3 — ⛑ WHERE A GATE WAS WRONG, NOT THE CONTENT

⚠️ **Three of today's reds were MY gates being wrong, and you should not have contorted content to satisfy
any of them.** ⛔ **If a gate seems to demand something untrue, it probably is — say so.**

| | |
|---|---|
| **`§62`: your R49 "failed to land its sentence"** | ⛔ **it had not.** The gate read a ruling's number from `##`/`###` headings only, and yours is in the **level-1 title**. No number found was treated as *owed* — so a ruling nobody had started read as one that shipped and forgot its prose. **Fixed: it reads the title too** |
| **`§69` / `§75` fixtures** | §2 above — yours to find, mine to fix |
| **`§98` broke on a new registry row** | it pinned `bearingsDetail` as the LAST name in a destructure — **a position, not a fact.** Fixed to assert the name |

⚑ **THE RULE: a gate that pins prose, a position, a dial or a running total is the wrong gate.** ⬜ A gate
should assert **a fact about the world that stays true when a number moves.**

---

## §4 — ⛔ THE TWO RATCHETS THAT ONLY GO DOWN

⚠️ **These do not fail on your change being wrong. They fail on the BACKLOG GROWING**, which is a different
thing and needs a different response:

| ratchet | what it counts |
|---|---|
| **`§70` `spec_ready` specs naming an existing export** | ⬜ every new unbuilt spec you land raises it. **That is legitimate** — it moved 9 → 10 → 11 for your presence and codex specs |
| **`content_ci` want-without-seed** | 47 → 48 today |

➡️ ⚑ **The response is NOT to avoid landing specs.** It is to move the baseline **with the reason and the
name written**, the way `tests/suite_baseline.json` and §70's comment both do. ⛔ **A number nudged with no
note is the thing that is forbidden**, not the number moving.

---

## §5 — ⚠️ AND THE ONE THING THAT IS NOT A CHECKLIST ITEM

⛔ **`tests/how_it_works.mjs` has a baseline of ZERO and it must come back to zero.** ⚑ I raised it to 2 for
exactly one commit today so my work could land while you fixed yours, wrote the reason into the baseline
file, and **restored it in the next commit.** ⚠️ **If you ever see that number above zero, it is a debt with
a name attached, and it is somebody's job that day.**

---

⬜ **If a gate blocks you and you cannot tell whether it is your content or my gate: push nothing, and send
me the failing line.** ⚑ **Four of today's nine were mine. Guessing costs more than asking.**
