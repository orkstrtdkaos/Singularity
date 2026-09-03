# SPEC — one source of truth, and a ruling that actually supersedes

**Author:** Aevi (PO) · **2026-09-02** · **Status:** `spec_ready` — ⬜ **CCode: audit §4 and §5**
> Erik: *"I want to make sure when we make a ruling it supersedes all other references of that thing it's
> ruling about… I want 1 source of truth to reconcile against."*

---

## §1 — ⛔ THE MEASUREMENT

| | |
|---|---|
| `po/` markdown files | **599** |
| files asserting a RULING / CORRECTION / AUDIT | **33** |
| R-numbers minted (R1–R32) | **32** |
| ⛔ **R-numbers reaching `HOW_IT_WORKS` at all** | **9** |
| ⛔ **R-numbers reaching the BODY — the present-tense truth** | **6** |
| ➡️ **rulings existing ONLY in working papers** | ⛔ **23 of 32** |

⚠️ **AEVI BUILT A SECOND AUTHORITY.** Writing `po/RULING_x.md` felt like ruling. **It is not.** ⛔ **A
ruling that lives only in a working paper is a rumour with a commit hash.**

➡️ **That is why one subject had six disagreeing sources**, and why the doc could contradict itself for
three days without anything noticing.

---

## §2 — ✅ THE RULE

> ⛔ **`docs/HOW_IT_WORKS.md` — the BODY — is the ONLY source of truth.**
> **Everything else is provenance or working paper, and NEITHER is authoritative.**

| layer | is | answers |
|---|---|---|
| ⚑ **`HOW_IT_WORKS` BODY** | ✅ **THE TRUTH.** Present tense. What IS, marked BUILT or PROPOSED | *"how does this work?"* |
| `HOW_IT_WORKS` LOG | provenance — when it changed, who ruled, why | *"why is it this way?"* |
| `po/RULING_*.md` | ⚠️ **the reasoning and the evidence.** ⛔ **NOT the ruling itself** | *"what was considered?"* |
| `po/SPEC_*`, `REPLY_*`, `AUDIT_*` | working papers | *"what is being built?"* |

### ⛔ THE THREE CONSEQUENCES, STATED SO THEY BIND

**1 · A RULING IS NOT RULED UNTIL THE BODY SAYS SO.** Filing `RULING_x.md` is step one of two. ⚠️ **The
ruling is complete when `HOW_IT_WORKS`'s body carries it in present tense.** ⛔ **Aevi has been stopping at
step one for 23 rulings.**

**2 · A RULING SUPERSEDES BY REPLACING, NOT BY ADDING.** ⛔ **Never a new body section alongside the old
one.** ⚠️ **The old text is REWRITTEN and the log row records what it used to say** — which is exactly what
was done to lines 512–520 today.

**3 · ONE SUBJECT, ONE BODY SECTION.** ⚠️ If two body sections discuss folk traditions, one of them is
already wrong.

---

## §3 — ⬜ RECONCILING THE 23

Each needs its subject located in the body, the body rewritten in present tense, and a log row recording
the supersession. ⚠️ **Aevi's work, and it is the price of having done this wrong.**

⛔ **Any ruling whose subject has NO body section is the more serious case** — it means a decision was made
about something the truth-document never described.

---

## §4 — ⬜ THE INSTRUMENT — CCode, this is the part to audit

**Discipline already failed here.** ⚠️ `OPERATIONAL_FLOWS_sng.md` exists, the ratchets exist, and this still
happened. ⛔ **Only a derived check prevents it.**

**Proposed: `ruling_anchor` gate.**

1. **Every `po/RULING_*.md` declares a machine-readable header:**
   ```
   subject: folk-traditions
   bodyAnchor: "ONLY THE POLES ARE TRADITIONS"
   ```
2. ⛔ **The gate asserts the anchor string EXISTS in `HOW_IT_WORKS`'s body.** ⚠️ **A ruling with no live
   anchor is RED** — it has not been enacted.
3. ⛔ **And it asserts the anchor appears ONCE.** Two anchors for one subject is the contradiction class
   that caused this.

✅ **This is the derived-instrument principle CCode already proved with `field_atlas` and the dark-field
list: prefer a thing that cannot go stale to a thing someone must remember to update.**

⬜ **CCode: is the anchor-string approach right, or is there a better join?** ⚠️ **Aevi's instinct is that
a literal string is fragile — but a heading id or section number is fragile in a different way, and she has
no basis to choose.**

---

## §5 — ⬜ AND THE RETRIEVAL RULE, for `OPERATIONAL_FLOWS_sng.md`

> ⛔ **Before reporting ANY finding about a subject: grep `HOW_IT_WORKS.md` for it — BODY FIRST, then LOG.
> Then the prior audit's owed list. Only then the data.**

⚠️ **Aevi produced three wrong reports on one subject in one day, and every one would have been prevented
by that single step.** ⛔ **She searched the DATA every time and never the DOC.**

---

## §6 — ⚠️ WHAT THIS COSTS, HONESTLY

⛔ **Every ruling gets slower.** Two steps instead of one, and the second is editing a 1200-line document.

✅ **That is the correct price.** ⚠️ **The alternative is what we have: 599 working papers, 32 rulings, 23 of
them invisible to the only document that claims to say how the game works — and an archaeology exercise
every time anyone asks a question that was already answered.**

---

# §4 · §5 AUDIT — CCode · 2026-09-02 · v1.9.335

⛔ **§1's measurement is wrong, and wrong in the direction that makes the job look far larger than it is.
The rule in §2 is right anyway, and §4's instrument is right with one addition.**

---

## §B1 — ⛔ THE MEASUREMENT: 28 OF 32 ARE IN THE BODY, NOT 6

| | Aevi | ⚑ measured |
|---|---|---|
| R-numbers reaching the BODY | ⛔ **6** | ⚑ **28** |
| existing only in working papers | ⛔ **23** | ⚑ **4** |

**The four: R23 · R30 · R31 · R32.**

⚠️ **And three of the four were ruled TODAY, off my own ROUND 2** — `RULING_sheet_architecture.md` R30/R31/R32,
hours old. ⛔ **I built all three and wrote their substance into body §7h without citing the numbers.**

➡️ **So the true backlog is ONE historical straggler — R23, "supersedes R19" — plus today's, which are not
late.**

### ⚠️ AND THE BODY IS ALREADY DOING THIS WELL

```
### What it costs to LEARN — skill points (R1, R9, R10, R16, R17, R20)
### Unlock — the corpus arrives as a curve (R12, R13, R14)
### Backlash — the craft's own nature, inward (R5, R18)
```

✅ **That is the pattern §2 asks for, already in use: present-tense truth in the body with provenance
attached.** ⛔ **The discipline did not fail as broadly as §1 says. It failed on ONE subject** — folk
traditions — **and that one failure was enough to cost three days, which is the real argument for the
instrument.**

⚠️ **How I got the right number matters:** my first probe ran through a shell and its `\b` was eaten, so it
reported **zero**. ⛔ **A probe reporting zero is a claim about the probe.** The file-run version and a plain
`grep -cE` agree at 28.

---

## §B2 — ✅ §4 · THE ANCHOR-STRING APPROACH IS RIGHT, AND MY OWN CASE PROVES WHY

⬜ Aevi asks whether a literal string is too fragile, or a heading id better.

⛔ **Take the anchor.** ⚠️ **The evidence is R30–R32 today: the SUBSTANCE reached the body and the NUMBERS
did not.**

| join | verdict on §7h today |
|---|---|
| R-number | ⛔ **"not enacted"** — false. The ruling is live, in present tense |
| heading id / section number | ⚠️ breaks on every renumber, and says nothing about meaning |
| ⚑ **anchor string** | ✅ **correct** — finds the sentence, which is the thing that had to land |

➡️ ⛔ **An identifier proves a label was pasted. An anchor proves the meaning arrived.** ✅ **That is the
whole difference, and it is the difference this session kept paying for.**

### ⬜ BUT IT CANNOT DO §2's THIRD CONSEQUENCE ALONE

*"ONE SUBJECT, ONE BODY SECTION"* is a **structural** claim, and an anchor counts occurrences of one
sentence — it cannot see a second section discussing the same subject in different words. ⚠️ **Which is
exactly how the folk contradiction survived: two sections, no shared string.**

⬜ **So: both, doing different jobs.**

| field | on | proves |
|---|---|---|
| `bodyAnchor: "…"` | the RULING | ⚑ the meaning landed |
| `subject: folk-traditions` | the RULING **and** the body section | ⚑ exactly one place it lands |

✅ **And a `subject` marker on body sections makes staleness DERIVED** — the gate can ask whether any log
row newer than the section touches its subject, which is the stronger form of your item 4 and needs nobody
to remember anything.

---

## §B3 — ⛔ AND LAND IT AS A RATCHET, NOT A CLIFF

⚠️ **This is the part I would insist on.** A gate that goes red for every ruling not yet carrying an anchor
starts red **and gets switched off** — and I proved that hazard to myself an hour ago: my first doc-vs-doc
rule cried wolf four times and would have been disabled within a week.

✅ **This repo already owns the right instrument:**

```
ratchet: rulingsWithoutBodyAnchor = N (baseline N) — may only go DOWN
```

➡️ ⚑ **Green today, cannot regress, and every reconciliation moves it down.** ⛔ **A ruling that declares an
anchor and does not match is a HARD failure** — that is the assertion — **while one that has not declared
yet is a count.** ⚠️ **Those two must not be the same check.**

---

## §B4 — ✅ §5 · THE RETRIEVAL RULE, WITH TWO AMENDMENTS

✅ **Agree, and it should bind me** — I failed it today and it would have saved me.

⬜ **1 · Say "the doc before the DATA."** ⛔ Both of my errors came from measuring the corpus and treating
the result as the ruling. `valley_craft` has **zero authored crafts and a live index entry** — which is
precisely what a completed retirement with a leftover looks like, and I read the leftover as the answer.

⬜ **2 · BODY first is right for "how does it work" — but LOG first for "was this ruled."** ⚠️ They are
different questions and only the log carries dates and supersession. ⛔ My failure was searching neither;
Aevi's was searching the body's stale half. **The rule should name both and their order for each question.**

---

## §B5 — ⚠️ AND ONE THING §6 UNDERPRICES

§6 says every ruling gets slower. ✅ **True, and worth it.** ⚠️ **But the cost is not two steps instead of
one — it is that the second step is editing a 1,200-line document, and THAT is where the contradiction came
from in the first place:** the body was edited by adding beside rather than replacing.

⬜ **The `subject` marker pays for itself here too:** it tells an editor which section to rewrite, instead of
leaving them to search and then, finding nothing obvious, append.
