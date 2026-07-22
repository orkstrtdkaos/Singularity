# SNG-199 (both parts) + SNG-205 §1 — the codex knows who you met

**CCode · 2026-07-22 · v1.8.186 (`f6de7345`) + v1.8.187 (`ae07e3d0`) · suite green at both ships.** First full ticket under the new workflow: spec read as feature intent, implementation decisions mine, product calls surfaced to Erik only where genuinely his.

---

## The sequencing ruling you asked for (Q5, ALERT)

**SNG-199 + SNG-205 §1 built together as one seam (done); SNG-200 next; SNG-198 after; SNG-134's ledger touch folds into whichever it lands nearest.** Rationale: 199's write-fixes are upstream — 198's offscreen codex facts and 200's companion-codex mirror land on the surface 199 repairs, and Teva was the same fix from the read side. The braid arc (202) doesn't touch this ledger and stays independent.

## What shipped

**Part 1 (`f6de7345`) — the two pure functions:**
- **§1** `prettifyNpcName` now validates: a clause break (comma/semicolon/spaced-dash) or over-long input keeps only the leading name segment, always word-boundary clamped (`smartClamp`), never a raw mid-word cut. "Siol — Elven traveler at the Hub plaza, tall, pale coat, bir" → "Siol".
- **§2** `findExistingNpc` reads the `aliases` the module maintains at five write sites — exact slug match only (an explicit prior name, never a lexical loosening, per your ⛔).

**Part 2 (`ae07e3d0`) — the mirrors + the recovery:**
- **§5, answered Q4 with a design stance:** the mirror lives **inside the engine functions, direct import, never injected** — an optional dependency a caller forgets to pass is precisely how an L2 permission-isn't-initiative bug reincarnates. `applyNpcUpdates` writes the person's codex node when a meet CREATES them; `notePlaceVisit` writes the place node on FIRST arrival (display name threaded from all three app.js call sites). Create-only + `resolveTopic` dedupe + the 60-topic cap answer your §5 caps ⚠️ — no second relevance system invented. GM `codexUpdates` remain the channel for everything interesting; they stop being the only channel for everything factual.
- **SNG-205 §1 (Q1: back-fill, and one fix with 199 — both as you leaned):** reconcile **v15 `codex-knows-who-you-met`**. Teva's bar is **two independent signals** — a keyed `establishedFacts.subjectId` AND a person-kind codex topic — which is "established, never merely mentioned" made mechanical (a place-kind subject is refused; tested). `REGISTRY_CAP` single-sourced from npcs.js; `findExistingNpc` (aliases included) guards duplicates. **Cellaceron recovers Teva on next load, no replay.** The same step retro-mirrors existing registry people + walked places into the codex, so pre-mirror saves (Silas's Cairnhold) catch up once, idempotently.
- **§6:** codex search now filters the NOTABLE row and merge suggestions (they are entry lists too); the merge digest hides during search; an empty **result** reads "No entries match…" — distinct from an empty codex.

## Verified

13 new tests: meet-mirror fires on create only; first-arrival vs return-visit; the v15 step on a Teva-shaped fixture (recovers her, refuses the place-kind subject, retro-mirrors a registry person + a walked place, emits the player-facing note, second run adds nothing); §6 source assertions. Full suite green; boots clean at v1.8.187 on a fresh port; 0 mojibake in every touched file.

## Deferred — each wants its own design pass, flagging not dropping

- **§3 relational resolution** ("my mother" resolves structurally, not lexically) — needs the backstory-figure link (your Q2: I found no existing structure tying backstory figures to registry entries; it needs building). Includes making the Hesta/Maret/Silas's-Mother pair *suggestible* to `suggestMerges`.
- **§4 player-conferred names** (Ama Dreya) — wants a new op + a prompt-contract obligation (the GM must *consider* it when the player uses an unregistered name), which touches the gm.js contract; cleaner alongside §3 since both add structure to identity.

*— CCode. Meeting someone now writes the codex the way arriving somewhere now writes the codex: mandatorily. Erik's leg: load Cellaceron — Teva should appear as known, with the recovery note. Only-Aevi-closes.*
