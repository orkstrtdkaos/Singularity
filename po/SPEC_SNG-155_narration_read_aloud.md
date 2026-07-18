# SNG-155 — The narration reads aloud

| | |
|---|---|
| **Status** | `ROUND 1 — awaiting CCode ROUND 2` |
| **Author** | Aevi (PO) · 2026-07-18 |
| **Direction** | Erik: *"I want the narrative to be able to be read aloud. You can reuse the Heimrún concept if you want — but it would be great to get some higher quality voices than the machine sounding defaults."* |
| **Use case** | **Family play.** This is a single-player-and-family tabletop RPG (§1). Read-aloud is the GM speaking at a table with the girls present — not an accessibility afterthought, the primary mode it should be built for. |

---

## §0 · PRE-WORK SCOPE VERIFICATION (Law 11)

- **Singularity has no TTS today.** No `speechSynthesis`, no utterance, no audio path in `app.js`, `engine/*`, or `index.html`.
- **Heimrún's implementation** (`ErikIAm/heimrun/app.js:264-291`) is Web Speech API: `pickVoice()` → `SpeechSynthesisUtterance` → `speak()`, with `ttsVoice` / `ttsRate` (0.92) / `ttsPitch` persisted in settings, and `cancel()` before each utterance.
- **Its picker optimizes for LANGUAGE, not quality** — `en-GB` first, then `de-DE`, *"they handle Old Norse consonant clusters better than en-US."* Correct for Heimrún. It is also the reason it sounds machine-made: it takes the first voice matching a language, and on most platforms that is the oldest formant voice installed.

---

## §1 · Why it sounds machine-made, and the free half of the fix

**The default voice is usually the worst one installed.** Platforms ship high-quality voices that `getVoices()` already exposes but does not prefer: macOS/iOS carry *Enhanced* and *Premium* variants, Chrome exposes *Google* voices, Edge exposes *Microsoft … Online (Natural)* neural voices. A picker that **ranks by quality markers** rather than taking the first language match is a large improvement for **zero cost, zero key, and no network**.

Rank on the voice name and flags — `Natural` · `Neural` · `Online` · `Enhanced` · `Premium` · `Google` · `Siri` — then fall back to language match, then to `voices[0]`. Ship the ranked list in the picker UI **worst-last**, so the good ones are what a player sees first.

**This should be built and heard before anything is keyed.** It may be most of what Erik wanted, and it costs nothing.

---

## §2 · The paid half — a voice provider, not a vendor

Same shape as the Aevi App's model router: a thin abstraction, providers behind it, graceful degradation at every step.

| Tier | Provider | Cost | Notes |
|---|---|---|---|
| **0** | text only | — | Always available. TTS never gates play (Law 5). |
| **1** | Web Speech, quality-ranked (§1) | free | **Default.** Offline, no key, no latency. |
| **2** | cloud TTS, player-supplied key | ~cents per session | Markedly better. Opt-in. |

**Precedent exists for the key handling:** Law 8 already puts the Anthropic key and GitHub PAT in `localStorage` only, never committed. A TTS key rides the same rule — **and CCode should confirm no key can reach a committed file or a log, because this adds a third secret to a surface that has already had one leak** (`SECRET-COMMIT-GUARD`, 2026-06-20).

**Latency is the design constraint, not quality.** The player has already waited for the GM. A read-aloud that adds a second wait will be turned off. So: **speak the first paragraph while the rest is still generating.** Chunk on sentence boundaries, queue, play in order. Web Speech is instant and needs none of this; cloud TTS is unusable without it.

---

## §3 · Read-aloud is a prose constraint, not only an output channel

This is the part that is easy to miss and is worth more than the voice quality.

**Text written to be read silently is not text written to be spoken.** At a table, with kids listening:

- parenthetical asides collapse — the ear cannot hold them
- stacked em-dashes turn into a sentence with no shape
- dialogue needs attribution the ear can follow (*"said Pell,"* not a bare quoted line)
- numbers, stat blocks, and UI receipts **should not be spoken at all**

So read-aloud wants two things beyond an audio player:

**3a · A `readAloud` GM_CONTEXT row (§23, Law 16).** Tell the model this session is being spoken at a table. It is a live prose signal, and the machinery to carry it now exists — the registry landed in BATCH-11. **This rides on SNG-144's per-profile narration dials** (Plainness / Bluntness, awaiting build) rather than inventing a second style system.

**3b · A speakable projection of the turn.** The narration is prose; the choices, receipts, energy costs, and dice math are interface. Read-aloud speaks the **narration and dialogue only**. That projection has to be a defined thing, not a regex over the DOM at speak-time.

**And SNG-152 becomes audible.** *"Named the s"* is a rendering annoyance on screen. Spoken aloud at a table it is a sentence that stops mid-word — the failure gets louder, literally. **152 should land before this is demonstrated to anyone.**

---

## §4 · The reachability chain (Law 16)

| Link | Value |
|---|---|
| **ENGINE** | `engine/narration_voice.js` — provider abstraction, quality-ranked picker, chunker |
| **CONSUMER** | the play surface, on narration render |
| **REGISTERED** | `GM_CONTEXT` row `readAloud` — the prose signal of §3a |
| **REACHABLE** | a speak control on the turn + per-profile voice settings |
| **CONTRACTED** | SYSTEM_SPEC §16 (Imagery) gains a sibling, or a new §16b |

---

## §5 · Verification (close on the symptom — §21)

**Erik reads a turn aloud to the girls.** Not a code read, and not a solo test — the use case is the table.

- default voice is audibly better than Heimrún's current pick on the same device
- narration begins speaking within ~1s of landing, cloud tier included
- choices, energy costs, and receipts are **not** spoken
- pause / resume / skip work mid-turn, and a new turn cancels the old utterance cleanly
- with no key and no `speechSynthesis`, play continues silently and nothing errors
- a truncated sentence does not occur (post-152)

---

## §6 · Questions for CCode — ROUND 2

1. **Which cloud provider?** Cost, latency, and streaming support are the axes. The player supplies the key either way. PO has no preference; CCode's call on integration cost.
2. **Where do voice settings live?** Per-profile, alongside SNG-144's narration dials, or device-local like Heimrún's? **Per-profile seems right for family play** — each daughter's own voice — but that is a data-model question.
3. **Is the speakable projection derivable?** Does the turn object already separate narration from receipts, or does §3b need a new field on the GM contract?
4. **Chunking boundaries.** Sentence-level is the obvious unit; does it break on dialogue or on the em-dash-heavy register the game actually writes in?
5. **Caching.** Cloud audio for a re-read turn — cache per turn id, or regenerate? Affects both cost and the chronicle re-read path.
6. **Secret surface.** Confirm a third key cannot reach a committed file, a log, or a results artifact.

---

## §7 · Sequencing

**§1 alone, first.** The quality-ranked picker is small, free, and may satisfy the ask outright. Hear it before building tier 2. Then §3a/3b (the prose signal and the speakable projection), which improve the read-aloud regardless of which voice speaks it. Cloud TTS last — it is the most work, the only cost, and the least certain to be needed.

**Gated behind SNG-152**, because a mid-word cut is far worse spoken than seen.

---

*— Aevi (PO), ROUND 1. Heimrún's `speak()` is directly reusable; its voice picker is the part to replace, and the reason is that it was tuned for Old Norse rather than for sounding human.*
