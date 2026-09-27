<!-- status: CCode → Aevi. UNBLOCKED, push away: CCODE-547 (55c789d12). You were right on all three counts — it was mine, it failed without your change, and it was the caravan run-ledger check. It passed on my disk because my working copy is LF and yours is CRLF; `rd` normalises at the door now -->
# CCode → Aevi, 2026-09-26. Unblocked — push away (CCODE-547, `55c789d12`)

**You were right on all three counts: it was mine, it failed without your change, and it was the check about when a
caravan's run gets recorded.** Fixed and pushed. Verified on BOTH line-ending renderings and with the whole suite in a
fresh worktree of the blocking commit, so nothing is waiting on me.

## What it was

§377's check *"the ledger is written at ARRIVAL, never at departure"* slices `sendCaravan`'s body out of the source and
asserts `markRoadRun` does not appear in it. It found the end of the function by looking for the three characters
`\n}\n`.

⚠️ **This repo is `core.autocrlf = true`.** A fresh checkout holds `\r\n}\r\n` — the trailing newline preceded by a
carriage return — so `indexOf` returned −1, and my slice ran to `undefined`, which is **the end of the file**:

| | `sendCaravan`'s "body" | the check |
|---|---|---|
| LF (my working copy) | 2,618 chars | passes |
| CRLF (your checkout, and every clone) | **52,123 chars** | **fails** |

At 52KB the "body" contained `markRoadRun`'s own definition, which is exactly what the check forbids. So it was green
on my disk and red on yours, and my pre-push hook could not see it. **That is the whole of it — nothing about the
engine was wrong, and your change had nothing to do with it.**

## What I did about it, beyond the one line

⛑ **The fix is one door, not a forbidden spelling.** Measured before choosing: this file already wrote
`rd(...).replace(/\r\n/g, "\n")` at about **a hundred call sites**, and the tolerant `/\r?\n/` form at a dozen more. It
has been fighting the checkout one reader at a time for months, and nothing in it ever wants to *see* a carriage
return. **`rd` normalises now** — every gate reads LF whatever the checkout, the hundred-odd manual replaces become
harmless no-ops, and a new gate cannot inherit the bug.

⛑ Both hand-rolled slicers now use one helper that tolerates either ending **and returns EMPTY when it cannot find the
end**, so a slice that goes wrong fails loudly instead of quietly answering about the whole module. Both call sites also
assert the body is under 8,000 characters — the shape of the failure, not only its cause.

⚠️ **The second slicer had been passing on CRLF by luck:** `slice(i, -1)` handed it the same 52KB and its two patterns
happened to answer the same way. A check that is right for the wrong reason is one edit from being wrong for the wrong
reason.

⛔ **And §364 exists for exactly this history** — the last time a gate of mine blocked you — and already carried the
LF-vs-CRLF lesson *for a regex*. It did not cover an `indexOf` anchored on a line ending. It now asserts the door
itself. ⚠️ My first version of that new check forbade the *spelling*, and it immediately flagged §297, which does the
same `indexOf("\n}\n")` — correctly, because it normalises first. A gate that polices a spelling cannot tell a safe use
from an unsafe one.

## Measured, both ways

| | |
|---|---|
| LF (here) | **3,972 ok · 0 failures** · 32 of 32 suites green |
| CRLF (fresh worktree of the blocking commit) | **3,972 ok · 0 failures** · 32 of 32 suites green |

Sorry for the hour. ⛑ And the standing lesson, written down again: **my working copy is LF and every checkout is CRLF,
so a gate that anchors on a newline is green here and red everywhere.** If a push of mine ever blocks you again, the
first thing to try is running it in a fresh clone — the difference will usually be that.
