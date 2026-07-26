# SNG-241 — session synopsis to the family feed

**CCode · 2026-07-26 · v1.8.282 (`bba35903`) · npm test exit 0 (2497 PASS).** Brooklyn's ask, built by connecting three already-shipped systems.

## What was already there (so this was small)
- `chronicle.js buildSessionPrompt` — the chronicle voice, already scoped to ONE session's real deeds/people/places.
- `chronicle.js sessionLog` — cleanly exposes each session's span (deeds, placesMinted, peopleMet, canonPromoted). **OQ2 answered: no new sessionDelta helper needed.**
- The chronicle view already generates + caches a per-session recap (`ensureSessionRecap` → `raw.recap`).
- `feed.js buildFeedPost` (typed `kind`) + rating-lens + consent (SNG-168 §2).

## What I built
- **§2a — the chapter option:** extended `buildSessionPrompt` with `ctx.chapter` → 2–3 short paragraphs for a big session; the tight one-paragraph recap stays the default. (OQ3 lean: built as opt-in.)
- **§2b — the `kind:"synopsis"` post + review UI:** a **"📮 Post this session to the feed"** button on any session that has a recap opens `renderSessionSynopsisReview` — the poster **trims the story** (a textarea), toggles the **chapter length** (regenerates), edits the **key details**, then posts via `buildFeedPost({ kind:"synopsis", excerpt, caption, image })` → `pushMergedFile`. **Never auto-posted** (SNG-168's choosing-is-the-value). Rating lens + consent inherit from the feed; a lensed/adapted post **drops the caption too** (family-safety — a caption could reveal an intenser session's details).
- **§2c — key details:** `sessionKeyDetails()` builds a factual caption from the session's real state (level + top-2 deeds by weight + people met + places found + what became canon) — poster edits before posting. Never invented.
- **The feed render:** a synopsis shows a **"📖 Session"** label + the caption under the story; `buildFeedPost` gained a `caption` field, carried through `feedForViewer` (dropped on adapt).

**Verified behaviorally:** a synopsis post carries `kind:"synopsis"` + the caption; a lensed post drops the caption; `chapter:true` produces the 2–3 paragraph prompt while the default stays one paragraph.

## Owed
- **Aevi:** the session-prompt voice polish (§2a) — the "story of this session" framing (I reused the existing recap prompt; you own the warmth).
- **Erik (OQ1):** the surface. I built the **chronicle session button** (reliable, and where recaps already live). If you also want it **auto-offered at session-end** (`endSession` fires), that's a small add — say the word. **OQ3:** chapter is built as an opt-in (default one paragraph) — confirm that's the want.
- **Guards honored:** poster shapes it (never auto), invent-nothing (real session state only), lens + consent inherited, session-scoped (distinct from the life chronicle), never canon (a feed post never hydrates into CONTENT).

*— CCode. The feed becomes a scrapbook of stories, not just moments. status: complete_pending_review.*
