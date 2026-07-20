# RUNNING FIXES — the accumulating work order

**Owner:** Aevi (PO) · opened 2026-07-19 · **LIVE — appended to over time, run when Erik says.**

Erik drops findings here as they surface; I append them with evidence and a verified cause. This is
**not** a spec to be read once — it is a queue that grows. Nothing here is started until Erik calls it.

**Entry rules, so this stays useful rather than becoming a pile:**
- Every entry names **where** (file:line where known), **what** (the observed symptom), and **why**
  (the verified cause) — never a symptom alone.
- **Verified** and **suspected** are marked differently. A suspected cause is a lead, not a finding.
- Anything large enough to need its own outcomes + invariants gets **promoted to its own SNG spec**
  and left here as a one-line pointer.
- Entries are struck through and dated when they land, not deleted — the record is the point.

---

# A · ENGINE — small, verified, no spec needed

### A1 · `timeOps.hoursPassed` clamps silently at 72h
**Where:** `app.js:3213` — `Math.max(0.25, Math.min(72, …))`
**What:** a declared duration longer than three days is silently reduced. A four-day journey is not
expressible in one turn and nothing reports the truncation.
**Why:** verified — the clamp has no logging and no feedback to the model.
**Fix:** either lift the ceiling or log the truncation. A silent ceiling on a declared duration is
how the fiction and the world clock got four days apart (SNG-189 §2).
**Status:** ✅ ~~LANDED 2026-07-19~~ — SNG-190 §5b (v1.8.163): ceiling raised to 168h (7 days) so a
montage journey is expressible, and any remaining truncation is recorded on the save (`_timeClampNote`),
never silent. The two-clocks reconciliation stays as C1 (Erik's ruling).

### A2 · Scene closed with a live thread in the same object
**Where:** the gm-narrate capture, Cairnhold, 2026-07-19
**What:** `sceneEnded: true` emitted alongside its own `threads: ["Pell has not met Silas's mother —
the introduction is moments away"]`. Rule: *do not end a scene while a question is hanging.*
**Why:** suspected — the close rule and the thread list are far apart in the prompt and nothing
cross-checks them. **Not yet measured.**
**Fix candidate:** the engine can see both fields; a close arriving with unresolved threads is
mechanically detectable and could be refused or flagged rather than argued about in prose.
**Status:** OPEN · found 2026-07-19

### A3 · `intentTags` over-broad on non-romantic beats
**Where:** same capture — *"Turn to Pell first — a word before the introduction"* tagged `romantic`.
**What:** a word before meeting his mother tags as romantic. These accrue play-style tendencies
(SNG-113), so the profile skews quietly.
**Why:** suspected — the tag vocabulary lists `romantic · flirt · woo · seduce` together, and any
address to a partner may be pulling the whole cluster.
**Status:** OPEN · low priority · found 2026-07-19

### A4 · Prose counts inside content files are unguarded claims
**Where:** `content/packs/core/rules/traditions.json` (corrected 2026-07-19), and any sibling
**What:** the file claimed *"16 have abilities today; 8 are authored stubs owing trees."* All 24 carry
trees (233 abilities). It had been false for some time.
**Why:** **verified** — unlike the SYSTEM_SPEC header, which `wiring_audit.mjs` machine-gates, a count
written in prose inside a content file has no guard at all.
**Fix:** SNG-183 L4 should treat prose counts in rules files the way the header is treated — gate it
or don't state it.
**Status:** the one instance is fixed; **the class is not.** · found 2026-07-19


### A5 · The GM DENIES REAL PLACES — "not in my context" is spoken as "not in the world" ⚠
**Where:** `gm_registry.js:125` — `isKnown: env.app.isPlaceKnown || null`; `gm.js:216`
**What:** Erik asked the GM to travel to **The Blocklands**. It replied that the Blocklands *"isn't a
named location in the Valley of Echoes as the world is currently established"* and listed the valley
settlements instead. **`content/packs/valley/locations/the_blocklands.json` exists**, is in the
manifest, and has two inbound connections.
**Why:** **verified.** `recallForGM` matches a place when its name appears in the player's words — and
*"Travel to the Blocklands"* does contain it. But recall is gated by `isPlaceKnown`, so it returns
only places **this character has been**. Silas has never been there, so `recalledDetail` came back
empty, the RECALLED block was never pushed, and the GM answered from the only place-knowledge it
had: the **lore**, which describes the Valley basin. The Blocklands is in `manifest_domain`, not the
Valley. **The GM listed exactly what it was shown and was right about its context and wrong about the
world.**
**The design is deliberate and the failure is at its edge.** SNG-176 correctly scoped the GM to HERE
for scene purposes. But 95 locations exist and the GM's horizon is *current location + region +
visited*. Asked about anywhere else it does not say "I don't know" — **it says the place is not real.**
**Fix (outcomes):**
1. **A place NAMED BY THE PLAYER should resolve against the full atlas, not the visited set.** Whether
   the character KNOWS of a place is a different question from whether it EXISTS, and the two are
   currently collapsed.
2. **The GM needs a way to say "that is real and you do not know the way"** — which is a far better
   answer than a denial, and is usually the true one.
3. **Absence from context must never render as absence from the world.** Same shape as the firing
   panel's false zeros (SNG-190 §3): *a missing measurement presented as a finding.*
**Status:** ✅ ~~LANDED 2026-07-19~~ (CCode, v1.8.164) — a place the player NAMES now resolves against
the full atlas in two tiers: KNOWN (with detail, ranked first) and REAL-BUT-ROUTE-UNKNOWN (existence
only). recallForGM renders the far tier under "these EXIST, the way is unknown, never deny them"; the
gm.js RECALLED header now says "you are UNAWARE of it" for a name in neither tier, never "not placed
yet." Refines SNG-176 (no KNOWLEDGE of unheard-of places) without undoing it (a non-atlas name stays
unfindable). Reproduced-symptom test on the literal Blocklands capture.

---

# B · CONTENT — mine to author, queued

### B1 · Ten pole traditions still have no authored teacher
14 of 24 covered by the 2026-07-19 pass (22 teachers). The remaining ten have no one who teaches them.
**Status:** OPEN · mine

### B2 · Zero bastions authored
SNG-180 made them expressible (a people's hold in country that disagrees with them). Nothing uses it.
**Held deliberately** until world positions settle in play — a bastion is defined by disagreeing with
its surroundings, so it wants stable surroundings first.
**Status:** HELD · mine

### B3 · `questSeeds` — 42 NPCs, none authored
CCode derives them from `wants` with a down-only ratchet. **Ask before authoring** — writing them by
hand may duplicate a working mechanism.
**Status:** BLOCKED on one question to CCode · mine

---

# C · AWAITING ERIK'S RULING

### C1 · The two clocks (SNG-189 §2)
Does a long in-fiction journey advance a character-local day count, or does the shared calendar need
an in-fiction component? **Both clocks are currently correct and they disagree**, and the GM resolves
the contradiction by writing invented day-numbers into durable facts.

### C2 · `threnodist` and `verist` — band centre 0.50, classified natural
Every other natural tradition sits 0.18–0.36. These two may be right (feeling and truth-telling are
not thin-ground crafts the way growing and fighting are) or may be a gap. **Flagged, not changed.**

---

# D · PROMOTED TO THEIR OWN SPECS — pointers only

- **SNG-185** — registry-only people have no domains. *Upstream of both outcomes Erik reported.*
- **SNG-186** — the dev-mode workbench. §2f shipped and already earning its keep.
- **SNG-187** — the 15.30s cold load. 252 files fetched sequentially, zero `Promise.all`.
- **SNG-188** — moved without consent on a turn that only discussed travel. ✅ ~~LANDED 2026-07-19~~ (v1.8.165).
- **SNG-189** — four defects from the first capture, incl. `[object Object]` in the permanent chronicle.
