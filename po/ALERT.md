# PO Alert — Singularity

**Status:** active — SNG-009 hotfix (field bugs, Erik live play 2026-07-04). SNG-004+008 queued behind it.

---

## Task SNG-009 — Op-loss on parse fallback + naming gaps (HOTFIX, do first)

**Root observation (Erik screenshot):** GM structured reply failed → "plain narration mode this turn" → ALL ops silently dropped (questUpdates, NPC name reveal, item naming) while narration advanced the fiction. State fell behind story. Three symptoms, one likely cause + two genuine gaps:

**Fix 1 — never silently drop ops (core).** On structured-parse failure: (a) ONE automatic retry — re-send with a terse "reply was invalid JSON, emit the same turn as valid JSON only" system nudge before falling back; (b) if fallback still triggers, salvage ops best-effort from the malformed text (regex-extract recognizable op arrays; apply only ones that clamp-validate); (c) surface it — the fallback notice should say ops were lost/salvaged; (d) log dropped-op turns to a small `state.opLossLog` so a later turn can re-emit (GM context gains one line: "PREVIOUS TURN OPS LOST — restate any quest/npc/place updates that occurred").

**Fix 2 — NPC identity reveal.** `npcUpdates` must support name reveal/refinement: op `{id, revealName}` — engine updates display name, keeps id stable, ledger notes the reveal ("the Tuning-warden is Maren"). Clamped: reveal only for NPCs currently in scene, once (subsequent renames need `aliasAdd` not replace). GM contract sentence: when the fiction reveals a known-but-unnamed person's name, emit revealName.

**Fix 3 — player naming of items.** Named items are player agency, not GM ops: inventory examine panel gains "Name it" (custom name stored as `customName`, original catalog name retained as subtitle; GM context shows "Waystaff (resonance-crystal translator staff)"). No GM involvement needed. Cap 40 chars, ledger-safe.

**Fix 4 — quest completion audit for Erik's live character (data repair).** Ship a one-time `repair` path or console-invokable function that re-evaluates quest objective state against chronicle/ledger; document in results how Erik clears The Apprentice Who Followed a Frequency (one click or one pasted line, per non-programmer default).

**Guardrails:** ops remain typed+clamped (salvage never applies anything that wouldn't validate); design law 1 intact; additive schema (`customName`, `opLossLog`); smoke: retry-then-success path, salvage-partial path, revealName clamp, customName render + GM context line.

**Verify:** forced-malformed reply → retry recovers ops (smoke); forced double-failure → notice names op loss + log entry + next-turn GM restate line present (smoke); Maren-class reveal live-checkable; Erik renames staff in UI and GM's next narration uses "Waystaff"; Erik's stuck quest cleared (browser-leg).

**Ship spec updates:** §7 (revealName sentence + op-loss restate line), §8 gotcha (parse-fallback op behavior), §3 if module touched.

---

## Task SNG-004 — Origins & backgrounds as content (+ SNG-008 weave) (QUEUED — next build)

**Goal (one session):** origins/backgrounds move from app.js to content packs with mechanical hooks; new origins land including unusual-embodiment; first SNG-008 content (rune shrine, Council of Mavens NPCs) rides the wave.
**In:** `content/packs/*/origins/*.json` + `backgrounds/*.json` (spectrum tilt, power-system access incl. crossTradition exceptions, background skill grants, creation copy); loader + creation UI from content; migrate 3 existing origins byte-equivalent in effect; new origins: mountain-pass folk, Disputed Zone survivor, Archive-born, **unusual embodiment** (ENT precedent — its own hooks, GM guidance line in rule set); backgrounds +6; **SNG-008 seed:** one rune-caster NPC + shrine location (casting = daily omen: small spectrum-axis nudge; rune table data-driven, seeded from Heimrún canon — Aevi supplies `runes.json` before build), Council of Mavens as 3 petitionable NPCs (domain + bias each). Smoke: content-loaded origins match legacy behavior, new origins gate correctly, omen nudge clamped.
**Out:** external Heimrún app linkage (later); framework lore layer beyond what the shrine/mavens carry implicitly; any resolution/contract change (Erik ratifies).
**Verify:** legacy character loads unchanged; new origin creates and plays; omen applies once per day and clamps; mavens give conflicting counsel on one seeded question.
**Ship spec updates:** §3 (loader), §4 (origin hooks), §6 (omen), §9.

---

*Task ledger between Aevi (PO) and Claude Code build sessions. Template/flow: `SYSTEM_SPEC.md` §10. Results → `po/results/`. Only Aevi closes. Queue: `po/BACKLOG.md`.*
