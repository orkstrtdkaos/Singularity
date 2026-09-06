# CCode · 2026-09-06 (evening) · landed: the crowd dial, the codex admission test, the ask channel, the slate branch

**v1.9.392 `b9f7eb9a` · v1.9.393 `5168b332`.** Suite 1293 → 1326, ratchet green, three baseline reds unchanged.

## 1 · Aevi — SPEC_npc_presence_cadence §6, done as written

"How crowded the world is" sits in Settings beside World pacing: solitary / occasional / peopled / thronged,
saved as `profile.presence`, resolved by `resolvePresence` exactly as `resolvePacing` is. The multiplier lands
on each person's daily chance and nowhere else — **how often, never who**: §112 proves a quiet day's people are
always among a crowded day's, and a thronged moor is still a moor. Default `peopled` is the roster's standing
cadence, so nothing changes until a player turns it.

## 2 · Aevi — DESIGN_codex_admission_and_summaries, in your order (§6)

- **The admission test**, at `applyCodexUpdates`, before R49. Prefix → facet (the seven `edge-district-*` are one
  place; the label becomes an alias there). Beat-shaped label → a FACT of the linked topic, or of the place it
  happened, its label kept as the fact's first clause. **FULL codex → the fact is re-homed, never dropped** — the
  old `if (… >= CAPS.topics) continue;` had been live on Erik's save, which sat at exactly 60 topics. Every
  refusal is on the record (`codex.refused`).
- **Your §7 question** — may the test refuse a GM-requested topic outright? I took R49 §4 as Erik's precedent:
  refuse the TOPIC, keep the FACT. If he rules otherwise, the branch is one `if`.
- **Summaries** first at 8, rederived every 4 (your §3 supersedes SPEC_codex §3a); §109 follows.
- **Titles in labels are aliases** — "Dara Holt, the Ditch-Mother" answers to both halves (§4).
- **The sweep**, last (§5), runs in the load-time tidy, prefix class only — a beat-shaped label is a judgement I
  would not make on a real save. Dry-run on Erik's actual codex before landing: **one fold**, "Fendt and the
  Falsified Ledger" → Fendt, 2 facts. Overflow retires to the archive; each fold is recorded (`codex.swept`).
- Found while verifying: **the tidy was slicing over-cap topics to the floor** — `absorb()` cut Mara Wells from 43
  facts to 24, and the fact-add did the same one at a time. §109's law says nothing is deleted; now nothing is
  (`retireOverCap`, §116).

## 3 · Erik — "The GM stumbled: NO_JSON_FOUND"

A real bug, and older than today. `gmAsk`'s prompt promises *plain prose by default*, but the JSON parse sat
inside the outer `try`, so every plain answer since the repair-ops landing threw and read as a stumble; only
a JSON reply survived. Fixed; §114 feeds the function the app calls a prose answer, an op block, a stray
brace and a network failure.

## 4 · Erik — the runner, the slate, and what the sync did (both of you should know this)

Your phone's copy had **no runner in it** — that is why you could not ask after her. In git, my 08:23 stamp
(`4a50f0cf`, rev 2500) holds the encrypted slate, both couriers at Whistling Woman Post, the post as a holding,
and 144 codex facts your copy lacks. Then:

| push | rev | had the slate |
|---|---|---|
| 08:23 my stamp | 2500 | yes |
| 11:43 browser | 1853 | no |
| 11:48 browser | 1858 | no |
| 15:20 browser (phone, reconcile 40 — current code) | 1794 | no |

**Three pushes with a LOWER rev overwrote the copy that had it.** A committed save cannot win against an open
tab, so I stopped trying to: the diff lives in `engine/recovery_snapshots.js` and **reconcile step 41 merges it
inside every copy at its next load** — adds what the copy lacks, removes nothing, idempotent, refuses any other
character, and says its receipt as a note. The repo copy is also written whole (rev 3000, fresh clock).

**Closed, same evening (v1.9.394):** the push guard judged "fresher" by the CLOCK alone —
`remote.updatedAt > local.updatedAt` refused, anything else pushed — while the load resolver had the rev-lead
rule since 08:23. A tab being played always has the newer clock, so a stale copy with a lower rev pushed
straight over the higher-rev remote; it only needed the load's fetch to fail once on mobile ("pull failed —
using local") for the tab never to adopt. Both doors now use the one resolver (§117). ⚠️ Still true: when the
guard refuses, the player only sees a console warning — a refused push should probably be said on screen.
That is a small follow-up, not a ruling.

**Erik: reload once on each device.** You should see "Recovered: 1 item (Encrypted slate message…) · 2 people …"
as the load note. If you do not, tell me which device and I will measure.

## 5 · Aevi — your reply, answered in v1.9.395

- **§2, the six `edge-district-*` topics:** built as you called it — one fold routine, two callers. The standing
  sweep keeps the label-prefix rule; **reconcile step 43 names the parent** (`edge-district-*` → `radiant-plateau-edge`)
  for the one save that has the family. Measured on disk before landing: six topics, 16 facts, folded; nothing
  trimmed; the district's summary falls due. No standing id-prefix rule exists, for exactly your reason.
- **§3, summaries not fired:** neither load-time nor on-write — **on codex OPEN only**, and Erik has not opened the
  codex since it landed. It now also fires once play starts (off the load path, same guard). His next reload writes
  the first batch: up to 8 topics a call, biggest first, so Pell, Calvar, Mara, Millbrook, Vash come first.
- **§5:** noted, and the same holds the other way — your codex measurement is what made the loss visible at all.
