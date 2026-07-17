# SPEC — SNG-128: The World-Authorship Chronicle — shareable session log + canon-provenance meta-data
## Aevi (PO) · 2026-07-16 · authored to spec · **awaiting CCode ROUND 2**

> **Brooklyn's ask (via Erik):** a shareable session chronicle she and others can read; and the meta-data of **how much of what each player has experienced is prewritten canon vs novel/generative content they made through play, and how much of what they've done is persisting in the world.** She intuited that her actions are world-affecting — and the engine already agrees with her; it just never shows it.

> **Verified at HEAD `v1.8.82` — this is SURFACING, not inventing. The engine already computes all three of Brooklyn's questions:**
> - **Authored vs generated** is tracked at every point: `known: { authored: CONTENT.npcs/locations, generated: character.generated }`; every minted record carries `_gen: true` + `_mintedAs` provenance. The game always knows which is which.
> - **Persistence into the world** is the whole `canon.js` engine (BATCH-9 Phase 3): a player-generated entity whose engagement weight crosses the threshold gets **nominated → promoted into SHARED canon the whole world reads**; one that collides with authored canon fires a realness-weighted **opposed roll** and, if it loses, drops to a **VARIANT/rumor tier that still persists and can be contested later.** That IS "how much of what I did is persisting" — already computed, per entity, with a tier.
> - **Attention invested** — `recordAttention`/`noteGeneratedAttention` accrues interact/revisit/fact signals per generated entity (the engagement weight that drives promotion). That's "how much you've poured into the world you made."
> **What's missing:** a per-SESSION log, and the reader-facing SURFACE that turns this machinery into something Brooklyn can read and share. The character Chronicle (SNG-109) is per-character story-so-far; this is the session journal + the authorship meta-data laid over it.

## PART 1 — Shareable session chronicle
- **Session boundaries + log.** Mark session start/end (a session = a play span; boundary on a long gap or explicit "end session"). Each session records: date, character, a generated **"what happened" paragraph** (reuse the SNG-109 chronicle-paragraph machinery, scoped to the session's beats), major deeds done, places discovered/minted, people met, encounters faced, canon promoted.
- **A readable Chronicle view** — a scrollable log of sessions, newest first, each expandable to its summary. This is Brooklyn's "summary available for the sessions she's done."
- **Shareable.** A session (or the whole chronicle) can be exported/shared as read-only — Erik and others read *her* chronicle. Respect the rating lens: a reader sees the chronicle at/below their own ceiling (the shared-canon lens already does exactly this — reuse it). Shared canon she created that others have seen is already cross-player visible.

## PART 2 — The authorship meta-data (the cool part Brooklyn wants)
A per-character (and per-session) **"World Authorship" readout**:
- **Canon vs. Novel ratio.** Of the places/people/threads this character has engaged: how many are **authored** (the prewritten spine) vs **novel** (minted through their play). Counted directly from `CONTENT.*` (authored) vs `character.generated.*` (novel). "You have walked 14 authored places and *called 6 new ones into being.*"
- **Persistence tally.** Of this character's novel content: how much has **persisted** — promoted to shared canon (the whole world now reads it), how much sits as **personal** (real to them, not yet shared), how much lost a contradiction and lives on as **rumor/variant**. Read straight from the canon store tiers. "Of the 6 places you made, 2 are now shared-world canon; 1 is a rumor others may yet confirm."
- **World-effect score.** A headline number — how much of the shared world bears this player's fingerprint (promoted entities × their canonical weight). **This is Brooklyn's intuition made literal: a measure of how world-affecting she actually is.** She was right; show her the number.
- **Attention map.** The generated entities she's invested the most attention in (the ones closest to promotion) — "what you're making real right now."

## PART 3 — Across the family (Erik's "know how much everyone has experienced")
- A **cross-character comparison** (Erik/PM view): for each player's character, their canon-vs-novel ratio, persistence tally, and world-effect score — so Erik can see how much of the shared valley each family member has authored. The shared-canon store already aggregates across players; this reads it per-contributor.
- Whose promoted canon the others are now encountering (Brooklyn's minted place that Brayden later walks into) — the family co-authoring one world, made visible.

## ENGINE / UI SURFACES
| Module | Change |
|---|---|
| `engine/chronicle.js` (SNG-109) | `sessionLog(character)` (session boundaries + per-session summary via the existing paragraph machinery); `authorshipStats(character, content)` → {authoredCount, novelCount, persistedTiers, worldEffect, topAttention}. Pure over `character.generated` + `CONTENT.*` + the canon store. |
| `engine/canon.js` | Expose per-contributor persistence read: `contributionsBy(character, store)` → promoted/variant/personal counts + weight. (The store already keys records; add the read.) |
| `app.js` | The Chronicle view: session log (expandable), the Authorship readout (ratio · persistence · world-effect · attention map), and (PM/family) the cross-character comparison. Export/share a read-only chronicle, rating-lensed. |
| `content`/profile | Session-boundary marker on the save; a `sharedChronicle` opt-in flag (a player chooses to make their chronicle readable by the family). |
| `tests/*` | Session boundaries split correctly; authored vs novel counted right against a known character; a promoted entity shows as persisted-shared, a lost-contradiction as rumor; world-effect rises when an entity promotes; a reader sees another's chronicle only at/below their rating; cross-character view aggregates per contributor. |

## GUARDS
- **Reuse the rating lens** — a shared chronicle is read at/below the reader's ceiling (the canon lens already does this; don't build a second filter). Brooklyn at R+ sharing to a reader set lower gets filtered cleanly.
- **Read-only sharing** — a shared chronicle is a view, never a way to edit another's world.
- **Privacy is opt-in** — a chronicle is private until the player chooses to share it; the cross-family view only shows characters whose players opted in (or, for a PM/family game, per the family's setting).
- **Counts are honest** — authored vs novel is read from the real provenance flags (`_gen`), never estimated; persistence from the real canon tiers, never faked. (The whole point is a true measure.)

## OPEN QUESTIONS — CCODE ROUND 2
1. Session boundary: explicit "end session" control, a real-time gap threshold, or both? (Recommend both — explicit end + auto-close on a long gap.)
2. Does the canon store already tag each record with its contributing character/player, so `contributionsBy` can attribute per person? If not, add a `contributedBy` stamp at nomination time.
3. World-effect score formula — promoted-count, or promoted × canonical weight (so a heavily-real entity counts more)? (Recommend weighted — it matches the realness model.)
4. The paragraph machinery (SNG-109) is per-character story-so-far — confirm it can be scoped to a session's beat-range for the per-session summary, or does session logging need its own lighter summarizer?
