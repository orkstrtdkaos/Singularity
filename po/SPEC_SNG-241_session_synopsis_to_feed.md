# SPEC — SNG-241: Session synopsis to the feed — a little narrative of the character's story
## Aevi (PO) · 2026-07-25 · Brooklyn-requested (an addition to SNG-168 §2 the World Feed)

> **Brooklyn:** "I'd like to be able to send a session synopsis — with key details — to the feed. Like a little
> narrative on the story of the character."

## §1 — Great news: almost everything for this ALREADY EXISTS
This is a small, clean ADDITION connecting two built systems, not a new build. Verified at origin:
- **The narrative generator exists.** `engine/chronicle.js buildChroniclePrompt` already writes exactly what
  Brooklyn describes: a "story so far" for one character — *warm, grounded second person, ONE paragraph 60-110
  words, a portrait of who this person has BECOME through their deeds and bonds, concrete not grand, invent
  nothing.* That IS "a little narrative on the story of the character."
- **Sessions are already segmented.** `chronicle.js sessionLog` (SNG-128) breaks play into sessions with the
  deeds/content that fell in each span — so "THIS session's" material is already derivable.
- **The feed exists and is typed.** `engine/feed.js buildFeedPost` takes a `kind` field ("player" = a shared
  turn, "world" = a world-tick). A new `kind: "synopsis"` is the natural extension point.
- **Rating lens + consent already flow through the feed** (SNG-168 §2) — a synopsis inherits them for free.
So: take the SESSION's deeds (sessionLog) → run the chronicle-prompt machinery SCOPED to that session → post
the resulting paragraph to the feed as a synopsis. Three existing parts, one new seam.

## §2 — The feature
### §2a — a SESSION-SCOPED synopsis (new)
`buildChroniclePrompt` today summarizes the character's WHOLE arc ("story so far"). Brooklyn wants THIS
SESSION's story — a narrative of what happened THIS play-session. Add a session-scoped variant:
- **Input:** the current session's deeds/bonds-changed/quest-progress from `sessionLog` (the latest session
  span), NOT the whole-life deed list. So the synopsis is "what your character did and became THIS session."
- **Prompt:** reuse buildChroniclePrompt's voice (warm second person, one paragraph, concrete, invent-nothing)
  but framed as "the story of this session" — a beginning/middle/where-it-left-off narrative arc, not a
  whole-life portrait. Brooklyn's "key details" = the session's real deeds, named people, the places, the
  turning point.
- **Length:** one tight paragraph by default (like the chronicle), with an option for a slightly longer
  "chapter" (2-3 paragraphs) since a session can hold more than a life-portrait glance. Poster's choice.

### §2b — post it to the feed (the new kind)
- A control — on the session boundary (when a session ends, per `endSession`) OR a "post my session" button in
  the feed/chronicle view — generates the session synopsis and lets the player REVIEW + TRIM it, then posts to
  the feed as `kind: "synopsis"`.
- **The poster edits before posting.** Same as SNG-168's turn-post — the value is in the CHOOSING and shaping.
  The generated narrative is a draft the player can trim/adjust, never auto-posted.
- **The feed shows:** poster's character, the session's world-date span, the synopsis narrative, and (optional)
  a representative image — the imagePrompt from the session's best turn, if one was generated (reuse SNG-168's
  image-attach).
- **Rating lens + consent** — inherited from the feed. A synopsis from an R session is lensed for a family
  viewer exactly as a turn-post is; opt-in per post even when chronicle-sharing is on.

### §2c — key details, structured (Brooklyn's "with key details")
Beyond the narrative paragraph, optionally surface a few structured "key details" the poster can include:
level reached, a major deed or two, a bond formed/changed, a quest advanced/completed, the place. These are
pulled from the session's real state (sessionLog + majorDeeds scoped to the span) — factual, not invented —
and shown as a compact caption under the narrative. Poster picks which to include.

## §3 — Why this fits (and why it's small)
Brooklyn ASKED FOR the World Feed originally (SNG-168 §2); this is the natural next want — not just posting a
single turn, but posting the STORY of a session. It reuses the chronicle voice (already loved), the session
segmentation (already built), and the feed+consent+lens (already shipped). The only NEW work is: a
session-scoped chronicle prompt, a `kind:"synopsis"` feed post, and the review-and-trim UI. It makes the feed a
SCRAPBOOK OF STORIES, not just moments — which is exactly the family-legacy value the whole Eivi/feed direction
is for.

## OWNERSHIP
- CCode: §2a the session-scoped chronicle variant (buildSessionSynopsisPrompt, reusing buildChroniclePrompt's
  voice + sessionLog's span); §2b the `kind:"synopsis"` feed post + the review/trim/post UI; §2c the structured
  key-details caption. All extends existing modules (chronicle.js, feed.js) — no new subsystem.
- Aevi: the synopsis PROMPT voice — I'll author the session-scoped prompt text (the "story of this session"
  framing) so it reads as narrative, not a deed-list, matching the chronicle's warmth. Content/voice, my lane.
- Erik: confirm the surface (post at session-end automatically-offered, vs a button in the feed view, vs both)
  and whether the longer "chapter" option is wanted or one-paragraph-only.

## GUARDS
- **Poster shapes it, never auto-posted** — the synopsis is a DRAFT the player reviews and trims before it hits
  the feed (SNG-168's choosing-is-the-value principle). Nothing about a session auto-broadcasts.
- **Invent nothing** — the synopsis uses ONLY the session's real deeds/bonds/places (buildChroniclePrompt's
  hard rule carries over). It's a narrative of what ACTUALLY happened, never embellished fiction.
- **Rating lens + consent inherited** — a synopsis is a feed post; it gets the same per-post opt-in and the
  same family-viewer lensing as any turn-post. Never a bypass. A minor's feed never gets an unlensed R synopsis.
- **Session-scoped, not life-scoped** — this is THIS session's story (sessionLog span), distinct from the
  whole-arc chronicle. Don't collapse them; the chronicle is "who you are," the synopsis is "what happened this
  time."
- **Never canon** — a feed post (turn or synopsis) is NEVER game canon (SNG-168 §2's rule). A synopsis is a
  shared story, not a state change; it reads the world, never writes it.

## OPEN QUESTIONS
1. (Erik) Surface: offer the synopsis automatically at session-end (endSession fires), a button in the
   feed/chronicle view, or both? Lean: offered at session-end (the natural "want to share this session?" beat) +
   available as a button later.
2. (CCode) Does `sessionLog` cleanly expose the LATEST session's span (deeds + bonds-changed + quests-advanced),
   or does the session-scoped synopsis need a small helper to gather "what changed this session"? Lean: a
   sessionDelta helper over sessionLog if not already clean.
3. (Erik/Aevi) One paragraph (matching the chronicle) or the optional 2-3 paragraph "chapter"? Lean: one by
   default, chapter as an opt-in for a big session.
4. (CCode) Image: reuse the best imagePrompt-bearing turn from the session as the synopsis image, or let the
   poster pick from the session's generated images? Lean: default to the most recent/most-salient, poster can swap.
