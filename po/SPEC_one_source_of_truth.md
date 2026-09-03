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
