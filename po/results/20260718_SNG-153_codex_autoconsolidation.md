# SNG-153 — the codex consolidates itself — SHIPPED

| | |
|---|---|
| **Task** | `po/SPEC_SNG-153_codex_autoconsolidation.md` |
| **Author** | CCode · 2026-07-18 · v1.8.117 |
| **Status** | `complete_pending_review` |
| **PM ruling honoured** | *"absorb can be reversible, but only if it doesn't cost anything."* Measured, then built — §1. |

---

## §1 · The blocking question: is `absorb` reversible?

**It was not, and it is now.** `absorb` was lossy in four ways: fact-cap truncation, link-cap truncation, a discarded `entityId` when the target already had one, and the source record deleted with its inbound link topology rewritten. "Re-split them" cannot recover any of that.

Per the PM ruling I measured before building. On Erik's real 58-topic codex: mean topic **1,165 bytes**, median 606. An exact undo receipt (the absorbed source + the target's pre-merge fields + the relinked ids) runs **~1.1KB measured**, capped at 10 merges — **~11KB against a 344KB character, about 3%.** That is inside "doesn't cost anything", and it is bounded by construction, which matters after SNG-157. So reversibility is real and exact, not best-effort: `undoLastMerge` restores the absorbed topic verbatim, rewinds the target's absorbed fields, and puts the rewritten links back — verified content-exact against a pre-merge snapshot.

**Auto-merge is only safe because it is undoable, so this gated everything else.**

---

## §2 · Answers to §4 ROUND 2

1. **Batching and cost.** One call per pass, never per pair — 18 surviving pairs on Erik's codex go in a single Sonnet request (~900 output tokens). Runs on **codex open**, never in the play loop, non-blocking, and at most once per session per queue-shape. **On model failure it degrades to exactly today's behaviour** — the player queue still renders; nothing is lost.
2. **When it runs.** Codex open. World-tick would spend tokens on a screen nobody is looking at; after-N-topics would fire mid-play.
3. **Is `absorb` reversible?** §1 — was no, now yes, measured.
4. **Kind correction.** Left out. "Edge District Contacts" being a group mis-kinded `person` is a separate concern from identity, and folding it in would let one verdict silently rewrite a topic's type. Worth its own small ticket.
5. **The `lore` wildcard.** Nothing depended on it. It was a **live bug** — `compatible()` is shared with the AUTO-merge tier, so a lore topic could be silently absorbed into a person on a name hit. Now `lore` merges only with `lore`.

---

## §3 · What shipped

**Gate 1 — structural NO, free, before any token.** Different non-null `entityId`s · an existing not-same verdict · incompatible kinds. On the live codex this refuses **«Pell» ↔ «Calvar»** (`pell ≠ calvar`) and **«Fendt» ↔ «Calvar»** (`event ≠ person`) — the exact pairs from the screenshot — at zero cost.

**The scorer, corrected.** A shared link is evidence of **relationship, not identity**; two people who know each other link to each other. Name overlap is now **necessary**, with link signals only reinforcing it (and bounded, so a dense arc can't inflate a score on its own).

**Gate 3 — the judge.** One batched call returns `same | different | unsure`. `same` merges with a receipt; `different` writes a permanent not-same verdict; **`unsure` is the only thing that reaches Erik.** Every verdict is **re-gated through gate 1** — a model "same" can never override structure (tested).

**Receipt, not a queue.** `mergeDigest` generalises the reconcile note that already read right, plus a one-tap **Undo the last merge**.

---

## §4 · Measured end-to-end on Erik's live codex

| | |
|---|---|
| Pairs after gate 1 + scorer fix | 18 |
| Auto-merged | 1 — *The Person With a List* → *The Actor With a List* |
| Recorded not-same (never asked again) | 14 |
| **Reaching Erik** | **3** (was 6, and those 6 included the provably-distinct pairs) |
| Undo log | 1 entry, **1,095 bytes** |
| Re-run | stable at 3 — rejected pairs stay rejected |

The 3 survivors are the *"Difficult Man — Pre-Transition Hydraulic Engineer"* cluster against Calvar/Fendt/Pell. That is **exactly the spec's success condition** — Calvar *is* described as a pre-Transition filtration engineer, so a careful reader would hesitate too. That is a question worth asking a human.

---

## §5 · Flag for the PO

The spec's §5 finding (`codex.js` mid-word cuts) was already fixed in SNG-152 — `codex.js:103` now uses `smartClamp`. No separate work needed.

*— CCode. Reversibility measured before it was built, per the PM ruling. Only Aevi closes.*
