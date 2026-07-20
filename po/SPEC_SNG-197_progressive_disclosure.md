# SNG-197 — Progressive disclosure: the player discovers, the GM already knows

**Author:** Aevi (PO) · 2026-07-20 · **Erik-directed, and it applies to every arc, not one quest.**
Outcomes; engineering is CCode's.

> Erik: *"The image shows and reveals too much plot. At this point it should be telling me to find the
> point of contact and maybe some indications through my domains of how to start. IN GAME narration
> and use of skills is what acts on these arcs and slowly reveals based on what I discover — which
> should be fed into the GM so it already knows the shape of where things are headed, even if not the
> details of how to get there or the outcomes until the player acts."*

---

# §1 — THE DEFECT, AND IT IS BACKWARDS IN BOTH DIRECTIONS

**One `premise` field serves two audiences that need opposite things.**

- **The player sees ALL of it** (`app.js:5563`). Opening *The Second Thread* tells him there is a
  half-made waygate, that the Waymarkers reconstructed the practice backwards, that it needs a maker's
  hand and a warden's contact, and that his lineage was FOR this. **The entire arc, before a single
  beat is played.**
- **The GM sees LESS than the player** (`quests.js:467`): `stakes`, the current stage objective and
  condition. **No premise at all.**

**So the one party who should know the shape does not, and the one who should discover it has already
been told.** Exactly inverted.

# §2 — THE MODEL

**Three fields, three audiences, one truth underneath.**

| field | who sees it | contains |
|---|---|---|
| `premise` | **the PLAYER** | **only what the character currently knows.** Starts as the hook and GROWS as stages close. |
| `shape` | **the GM only** | the whole arc: what it really is, where it is headed, what each stage will uncover. **From turn one.** |
| `reveals` (per stage) | appended to `premise` on completion | the sentence the player EARNS by doing that stage. |

**The player's quest panel is a record of what they have found out.** It is not a briefing; it is a
notebook, and it fills in.

## §2a — what the opening premise should actually contain
Erik named it: **the point of contact, and an indication through your domains of how to start.**

For *The Second Thread*, everything Silas knows is what Ama told him: **a name, a place, and fifteen
years of silence.** Not what the work is. Not that it is a waygate. **The routes block already exists
to give the domain-shaped hint** (*"your domains open the lit routes"*) — that is the right amount of
guidance and it is already built.

# §3 — WHY THE GM NEEDS THE SHAPE

**A GM that does not know where an arc is going cannot steer toward it** — it can only react to what
the player names, which is how an arc gets burned through in three scenes with nothing to show
(Erik's report on the last one). With `shape` in hand it can:

- let the world lean that way before the player knows why — an NPC's unease, a place that reads odd
- recognise when the player has stumbled into a later stage early and **let it count**
- refuse to hand over what has not been earned, deliberately rather than accidentally
- feed SNG-194's offers from the arc's own material, so surprises point somewhere

**⛔ And the constraint that makes it safe: `shape` is CONTEXT, never a script.** The GM must not
narrate ahead of the player's discovery. Knowing the destination is not permission to describe it.

# §4 — REVELATION IS ACTED, NOT READ

Erik: *"in-game narration and use of skills is what acts on these arcs."*

A stage's `reveals` fires when the stage is **met in play** — not when it is read, not when it is
clicked. **The disclosure is the reward for the doing.** A player who opens the panel expecting to
learn something should find only what they have earned.

# §5 — INVARIANTS

1. **The player-facing premise never contains an outcome.** Not the endings, not the mechanism, not
   the thing the arc is secretly about.
2. **The GM's `shape` is never rendered to the player.** Same discipline as stage `condition`, which
   was rendered and had to be rewritten (this session).
3. **`reveals` appends; it never rewrites.** The notebook keeps what was believed earlier —
   including what turned out to be wrong.
4. **An arc must be legible enough to start** with only the hook and the domain routes. If a player
   cannot tell what to do next from those, the hook is too thin — the fix is a better hook, never
   more premise.
5. **Applies to every arc type** — structured quests, personal arcs (SNG-133), and latent arcs when
   they surface.

# §6 — ALSO FOUND, and it is why Erik still sees the old text

**Content files are not cache-busted.** `app.js` loads as `app.js?v=1.8.165`; `state.js:228`
`fetchJSON` is a bare `fetch(path)`. **Code updates reach the player; content updates do not.**

Erik is looking at cached JSON — the literal `\n` he screenshotted was fixed and verified at origin
hours ago. **Every content ship is invisible until a browser decides to refetch**, which makes
content verification unreliable for exactly the person doing the browser-leg.

**Fix: version the content fetches the same way the code is versioned.** Logged as RUNNING_FIXES A7.
