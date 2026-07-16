# SPEC — SNG-123: Reduce malformed-GM-reply rate + tighten op salvage
## Aevi (PO) · 2026-07-16 · authored to spec · **awaiting CCode ROUND 2 · LOW priority (recovery already works)**

> **One line.** The "state updates were lost" note fires when the GM returns malformed/truncated JSON and the retry also fails. The recovery is already graceful (salvage narration + 20 op types, preserve scene, self-clear). This ticket only aims to make the malformed reply *rarer* and salvage *more* when it happens — it is NOT a bug fix, the failure path is sound.

> **Verified at HEAD `v1.8.81`.** `gm.js` L340–380: on unparseable reply → one retry ("emit the SAME turn again as valid JSON") → if that fails, `salvageNarration` + `salvageOps` (20+ op types) + `fallbackTurn` (keeps prior scene) → `_opNote` tells the player, self-clears next turn. Robust. The only loss is the ops that couldn't be salvaged from a truncated reply.

## OPTIONAL HARDENING (each independent, all low-risk)
1. **Shrink the reply surface on retry.** The retry re-requests the whole turn. Instead, on retry request a **minimal** turn (narration + choices + only the critical ops) to reduce truncation odds — a smaller reply is less likely to hit the token wall that caused the truncation.
2. **Raise the salvage hit-rate for `characterDeltas` / `moveTo`.** These are the ops that hurt most to lose (HP/energy changes, location moves). Give the salvage regex a targeted pass for these two even when the surrounding JSON is broken, so a lost beat rarely loses *movement* or *vitals*.
3. **Count + surface the rate.** Log degraded-turn frequency (already have `degraded`/`opsLost` flags) so if a particular context length or op pattern correlates with truncation, it's visible. If the rate is high after a long session, that points at context-window pressure → a compaction pass, not a parser fix.

## GUARDS
- **Don't touch the recovery path's gracefulness** — it works; this only reduces how often it's needed and how much is lost.
- Minimal-retry must still be a COMPLETE valid turn (narration + choices), just leaner.

## OPEN QUESTIONS — CCODE ROUND 2
1. What's the actual malformed-reply rate in a long session — is this worth doing, or is it rare enough to leave as-is? (Instrument first via #3, decide after.)
2. Does truncation correlate with context length (long scenes)? If yes, the real fix is turn-history compaction, not the parser.
