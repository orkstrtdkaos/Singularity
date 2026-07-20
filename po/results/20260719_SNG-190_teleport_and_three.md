# SNG-190 — the teleport, and three more from one capture

| | |
|---|---|
| **Author** | CCode · 2026-07-19 |
| **Shipped** | five commits, v1.8.159 → v1.8.163. Full suite green by exit code at every ship. |
| **The panel found all of these.** | §3 was a defect in the See-the-Machine panel itself; the other four it surfaced. |

Three of the four are the engine contradicting itself — exactly as you said. Each shipped as its own verified commit.

---

## §1 · The teleport is dead — v1.8.159

Erik lifted his mother's garden latch and was hurled to The Crossing. Chain confirmed: the GM emitted `moveTo: "Silas's Mother's House — Kitchen"` (a sub-place, not an id) → `resolve()` returned nothing → Cairnhold contains a waygate → `routeGmMoveTo`'s unresolvable-from-gate branch sent him to the hub. Our contradiction (prompt: "moveTo any named place, it mints"; router: "never invent"), and the router silently won.

Three code fixes, layered, plus the prompt:

- **§1.3 (the one that alone would have prevented it):** a `moveTo` naming a known **sub-place resolves to its PARENT LOCATION**. `findSubPlaceParent` is checked FIRST; the kitchen is a sub-place of Cairnhold, so it lands in Cairnhold — where he already stood, so no move at all. (`parentId` is always a real location — `places.js` sets it to the location or a `resolveLocationId` id, never a sub-place.)
- **§1.1:** the waygate router is **not consulted at all** for a known sub-place, and now only claims a move whose destination is a **real gate** — the only honest evidence a gate was used.
- **§1.2:** unresolvable-from-a-gate **FAILS CLOSED** (`routeGmMoveTo` returns null) instead of routing to the hub. Same principle as SNG-188 §4.2 — where the engine knows least, it must not act drastically.
- **§1.4:** the prompt contradiction reconciled — the `moveTo` rule now says a sub-place (a room, a garden, a kitchen) is **not a destination**; record it with `subPlace`, don't move to it. Minting stays for genuinely separate new places (SNG-117 intact). The waygate block was already correctly scoped to "IF THE CHARACTER STEPS THROUGH."

**Reproduced-symptom test (§6):** the literal captured ref from a gate now returns null; the sub-place resolves to Cairnhold; the handler wires sub-place-before-router. The old test that asserted junk→hub is updated to the fail-closed contract.

---

## §2 · One person, one record — v1.8.162

Silas's mother was minted twice in one turn — a stub `silas-mother` from `op:"meet"` and `Hesta Vorn` from `generateRequest:npc`, both mandatory by the contract, nothing reconciling them.

`reconcileGeneratedNpcWithMeet` (new, in `npcs.js` — which owns npc identity) **re-homes the fresh record onto the met id**: the meet made the stub, the generation gives it a face and a real name, and every op that already referenced `silas-mother` keeps working. It matches the request to a meet by the **hint naming the met person** ("Silas's mother —…" contains the meet name "Silas's Mother"), drops the second id `generate()` persisted, and lets the stub become the person — name → Hesta Vorn, prior bond kept, generated craft folded in.

**Tested on the literal scenario:** re-homes to `silas-mother`, `hesta-vorn` gone, family bond kept, ashwarden craft gained — and an unrelated request ("a wandering tinker") does **not** falsely merge. You pointed at SNG-185's shared-mint idea; the natural home turned out to be `npcs.js`, the identity module, and it's a testable export now.

---

## §3 · The firing panel no longer reports false zeros — v1.8.160 ⚠ my own bug

Trust-critical, and mine from §2f this session. The panel read `NEVER FIRED (32)` — `npcUpdates 0`, `moveTo 0`… — directly above an exchange that emitted six of them. Cause: it read `_opLedger`, which `logOpOutcome` populates for `markTeacher` **alone**. 31 of 32 zeros meant "not measured," rendered as "never fired" — the exact false diagnosis the panel exists to prevent.

The fix distinguishes emission from instrumented outcome, **visibly**:
- **Emission** is now counted for **every** op, every turn, at one site in `runGM` (`_opEmitted`), with `_opTurns` as the denominator a zero needs.
- **Applied/rejected** stays instrumented for `markTeacher` only (shown ✓/✗); every other chip's number is emission alone, and the hover says so.
- The panel **folds this session's captures** so an op shown emitted in a card can never read as not-emitted above it.
- The caption is rewritten: with no turns, "a 0 here just means this character has not played; **it is not a finding**." The "never fired / unreachable" language is gone from the UI.

**Verified live** (fresh app.js v1.8.160): header "(0 GM turns observed)", the bucket labelled "not emitted (no turns yet) · 32", caption ends "it is not a finding." Four source guards lock it.

---

## §4 · Engine asides render, never raw asterisks — v1.8.161

On screen, read aloud at a table with children: `*✦ The world grows — **Hesta Vorn** is now a real presence in this place.*`. The narration renderer escaped each paragraph and did **not** process markdown, so the engine's own asides surfaced their markup.

`renderProseHtml` (new, in `narration_voice.js` — the **visual twin of `cleanForSpeech`**, which already strips the same markup for speech) escapes first, then converts inline emphasis to tags, and renders an aside-glyph paragraph as a distinct `.beat-aside`. No asterisk reaches the reader. **Unit-tested on the literal captured string:** renders `<strong>Hesta Vorn</strong>`, zero `*` in the output. TTS was already correct (`includeAside:false`).

---

## §5 · The SNG-189 carry-overs — v1.8.163

**§5a — `[object Object]` in the chronicle (DATA LOSS).** `chronicle.push(sceneSummary)` had no type check; an object the model returned where a string was asked went in raw and rendered as `[object Object]` — a scene lost. **Answering SNG-189 §5 Q2 (mine):** the chronicle push is the **only** raw-object write; `factUpdates.text` and `placeUpdates.note` already `String()`-coerce. So a targeted fix: `coerceSceneSummary` runs before any durable use (string stands → object's text field → narration clamp), and reconcile **v12** sweeps already-corrupted saves (recover the text field, else an honest marker). Idempotent.

**§5b — the silent time clamp.** The 72h (3-day) ceiling truncated the party's four-day walk to three and told the model nothing — that silence is how the fiction and the clock drifted apart. Raised to **168h (7 days)** so a montage journey is expressible, and a truncation is now **recorded** on the save (`_timeClampNote`), never silent.

**⚠️ STILL NEEDS YOUR RULING (SNG-189 §5 Q1):** the invented "World-day 23" in `statusNote`/`placeUpdates.note` is the GM adding in-fiction journey days to a shared calendar derived from **real** time. Whether a journey advances the shared calendar — or the calendar needs an in-fiction component — is the ruling. I did **not** strip the day-numbers: if journeys *do* advance it, "World-day 23" is correct and the engine's calendar is what's wrong. Flagged, not papered over.

**And SNG-189 §5 Q3 (settlement-vs-district):** SNG-190 §1.3/§1.4 partly answers it — a district/room within a settlement is now a sub-place (resolves to the parent, and the prompt says it's not a destination). The sharper "settlement vs district" content distinction, if you want it, is a small follow-up on top of what shipped.

---

## What was right (your §6)

The prose, the `subPlace.parent`, the proportionate `timeOps`, the caching (125 uncached against 11,419). The model is doing its job well; four of these — including the one in my own panel — were the engine contradicting itself. Definitive checks are your browser-legs: a scene that moves into a sub-place from a gate-town (§1), and a turn that meets-and-generates one person (§2).

*— CCode. The garden latch keeps him home now.*
