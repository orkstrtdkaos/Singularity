# SNG-218 §2 — the LLM "next crafts" suggestion (Aevi's prompt, reviewed + augmented + wired)

**CCode · 2026-07-23 · v1.8.214 (`0bf2b088`) · 9 new tests green · live-verified.** Erik's ask — *"a genuinely rationalized LLM suggestion of next skills at the top"* — is wired, reading the character's real play-fingerprint. Aevi authored the prompt frame (SPEC_SNG-218b); I reviewed it against the engine, corrected its input paths, and completed the signal set — the proposal→augment→ratify loop she invited.

---

## Input-path corrections (verify-the-PO's-premises — 4 of them were off)

Aevi authored from a save-inspection, a partial view. Before wiring, I checked every path she named against the engine. Four didn't resolve — corrected:

| Aevi's draft path | Reality (verified) |
|---|---|
| `character.playStyle.tendencies` | **`character.tendencies`** — the STYLE lives directly on the character (playerprofile.js:3) |
| `character.playStyle.aptitudes` | **`character.aptitudes`** (same) |
| `boostedCrafts` (SNG-215 A1) | **does not exist** — SNG-215 A1 wasn't built; handled as absent, exactly as she allowed |
| `.schoolAffinity` "in code" | real, but it's **content data** on ability defs (19 abilities carry it), not an engine field |

Confirmed-correct as she said: `character.practice.aspirations` (`[{abilityId, progress}]` — Silas: hunters_strike 2/10, pattern_sense 0/10), `character.practice.uses` (per-craft counts), `character.schools` (adopted school per domain).

## Augmentation — what I added, and what I left out (per your note-back ask)

**Added: SCHOOL FIT (the gap you flagged).** The prompt now carries `ADOPTED SCHOOLS` (the method the character trains each domain by — e.g. `ashwarden→ash_plain`) and each reachable craft's `schoolAffinity`, with a prompt line telling the model to favour a craft trained the *same way* the character already trains (same discipline, deepened) and to note when a pick would mean a different method. This is real content data (19 abilities), so it's a live signal, not a guess.

**Left out — and why (so you can ratify the final input contract):**
- **Teachers → NOT a new input.** I checked the engine: teacher-availability only matters at the *capstone standing bar*, and that's already inside the §1 `reachable` pool (`meetsStandingBar` accepts a durable `teachers[trad]` OR a present company trainer). So a craft a teacher unlocks is *already* in the reachable set the suggestion picks from — adding a separate "teacher" signal would double-count. Your teacher question answered from the engine: no new input needed; it's baked into reachable.
- **`coActivations` (braid synergy), emergence readiness, precursor/substrate access, cross-pole braid eligibility — deferred.** Each is a real signal, but folding all of them in would bloat the payload past the point of diminishing returns for a first ship, and braid/emergence picks are a different UX (they're not single-craft learns). The `fit: "synergy"` tag exists in your schema, so the frame supports them when we add them. Flagging as a scoped follow-on rather than half-wiring them now. Your call whether any is worth a v2.

## The wiring (the guardrail is the load-bearing part)

`suggestNextCrafts` (gm.js, mirrors `suggestBuild`; takes an injectable `callJSON` for tests). In `renderLevelUp`: the **instant heuristic** renders into `#lvl-suggest`, an **async non-blocking** call upgrades it to reasoned picks (id · why · fit), and on **any** failure the heuristic stands — never an empty top (your §2 fallback). **The guardrail, twice:** both the heuristic and the LLM pool read `reachableNow` — `learnable` filtered through the §1 `canLearnAbility` gate — so neither can offer a standing-locked craft; and the render **hard-filters** the model's returned ids against that set, so a stray pick can never render a Learn button on an unlearnable craft (the exact SNG-218 root bug, closed on both the input and the output side). This also fixed a residual: the old heuristic read the raw level+domain `learnable` and *could* have suggested a standing-locked craft — it now reads `reachableNow` too.

## Verified

9 smoke tests via an injected fake (the SNG-198/204/208 pattern): the prompt is reachable-only; it carries the declared aspirations (real path), the play-style tendencies + aptitudes + use counts, and the school-fit augmentation; it routes to the `suggest-next-crafts` task; a model pick outside the reachable set is filtered out; the render reads `reachableNow` for both surfaces and falls back on failure. Full chain green, ratchets held (`suggestNextCrafts` consumed by app.js, no orphan). **Live** (fresh port, v1.8.214): the Level-Up modal renders the heuristic suggestion instantly (4 rows, 39 learn buttons bound), and the keyless async LLM call **fails gracefully** — the heuristic stands, 0 console errors.

## Honest bound

The reasoned picks themselves (the model's rationale, grounded in Silas's real kit) need an API key to see live — that's Erik's Tier-3 confirm. What's proven: the prompt carries the right signals from the right paths, the reachable-only guardrail holds on both ends, and the fallback never leaves the top empty. The moment a key is present, the top of the modal becomes the reasoned suggestion Erik asked for.

## Ratify request (the loop's last step)

The final input contract is: owned+ranks · domains · **character.tendencies** · **character.aptitudes** · **character.practice.aspirations** · **character.practice.uses** · **character.schools + craft schoolAffinity** · the §1 reachable pool · skillPoints · level. Aevi: fold these corrected paths + the school signal into the canonical prompt, and rule on whether teachers-are-already-in-reachable and the deferred coActivations/emergence signals are settled or want a v2.

*— CCode. You wrote the reasoning; I pointed it at the real signals and gave it the one thing the engine knew that you couldn't see from a save — the school the character trains by. The guardrail holds on both ends: it can't be *asked* to suggest an unlearnable craft, and it can't *return* one. §3 puts these picks on the wheel next.*
