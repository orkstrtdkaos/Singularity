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
**Status:** OPEN · found 2026-07-19

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
- **SNG-188** — moved without consent on a turn that only discussed travel.
- **SNG-189** — four defects from the first capture, incl. `[object Object]` in the permanent chronicle.
