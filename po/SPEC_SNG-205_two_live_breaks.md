# SPEC — SNG-205: Two live-play breaks — the unregistered companion, and the dials that don't reach the page
## Aevi (PO) · 2026-07-21 · authored to spec · **awaiting CCode ROUND 2 · both diagnosed at origin against live saves**

> **Erik, 2026-07-21:**
> (1) *"My character Cellaceron still doesn't show Teva as a known person — even though I'm questing with her.
> Seems like a break in the pipeline?"*
> (2) *"My new Loki character is trying to romance an NPC, but the GM narration is nearly impossible to get
> to describe her in any sort of sexual way — and I've bumped the encounters to maximum and see no
> difference. The levels I have (R+, Blunt text, maximum encounter rate) don't seem to do anything."*

Both diagnosed against the live saves at origin. Both are the batch's recurring shape — **a fact is written
and the reader never fires** — but in two different spots, and one has a third distinct sub-bug.

---

## §1 — TEVA: quest-central everywhere, registered nowhere (Cellaceron, `char-mr4ejo8c`)

**Verified in the live save.** "Teva" appears **169 times** across the character file — in `establishedFacts`
(a keyed record `{id:"teva", subjectId:"teva", ...}` — she is a first-class established person), `codex` (39),
`quests` (12 — she is in the active quest text), `activeScene` (65), `deeds`, `placeMemory`, `chronicleCache`,
and even `form`/`portrait` (*"protects the attractive sonic warden apprentice Teva"*). She is as
story-present as an NPC can be.

**She is not in `npcRegistry`.** The 12 registry entries do not include her. Her name appears "in" the
registry only inside a *deed string about Maren* — never as her own keyed entry.

**The reader:** `knownPeopleAt` (`engine/npcs.js:196`) builds "known people" by iterating
`character.npcRegistry` **only**. Nothing else. So a person who is in `establishedFacts`, `codex`, and the
active quest but not in `npcRegistry` is, to the "known people" surface, **not known** — regardless of how
central she is to the story.

**Root cause — the write is op-gated and the op never fired.** `npcRegistry` gets a person only when the GM
emits a `meet` op whose name-hint matches (`reconcileGeneratedNpcWithMeet`, `:22`). Teva entered Cellaceron's
story through narration and established-facts, and **no `meet` op ever fired for her** — so she skipped the
one write the known-people reader depends on. This is **exactly SNG-199 §5** (the codex/registry write that
never happens when you meet someone through the story rather than through an explicit op), now caught live on
a different surface. It is L2: *permission-isn't-initiative* — the GM was permitted to register her and never
took the initiative, and nothing downstream forced it.

**OUTCOME WANTED:**
- **A person the game demonstrably knows is in the registry.** If someone is a `subjectId` in
  `establishedFacts`, or named in an active quest's party/text, or the subject of chronicle/deeds, they are
  **known** — the registry should not be able to disagree with the established facts. Whether the fix is a
  reconcile pass that back-fills the registry from `establishedFacts`+quest subjects, or the read widening
  to union those sources, is CCode's call — but the two must stop disagreeing.
- **Existing saves recover.** Cellaceron has this live now; Teva should appear as known on next load, without
  Erik replaying anything. Same backfill discipline as the braid/companion-stage recoveries this batch.
- ⚠️ **Do not fix by registering everyone the GM merely mentions.** The bar is *established* (a keyed
  established-fact subject, a quest party member, a chronicle subject) — not every name spoken once. The
  registry cap (40) and the "known ≠ mentioned" line both hold. This is the same guard as SNG-199's caps.

**Note this is the read-side twin of SNG-199's write-side finding.** SNG-199 fixes the write (`npcs.js`
never calls `applyCodexUpdates`); this fixes the case where the write was *skipped* and the reader has no
fallback. Worth deciding together — same seam, same session.

## §2 — THE DIALS DON'T REACH THE PAGE (Loki, `char-mrum8y4d`)

This is three distinct things wearing one complaint. Separating them is the whole diagnosis.

### §2a — R+ and Bluntness ARE built, and their live effect was never verifiable
`SNG-144` (v1.8.104, shipped) built exactly the two dials Erik is using: **Plainness** and **Bluntness**,
per-profile, composed into `ratingLineForGM` → `ratingDetail` → the GM system prompt. The R+ register
(`romance_guidance.md` v2, Erik-ratified) is explicit that R+ *"is defined by its permission, not its
prohibition… The full charged register is yours. Take all of it… stopping short of the line is the error."*
So the intended behavior is precisely what Loki wants.

**But SNG-144's own verification names the gap:** *"Not headless-reachable: the GM actually writing plainer /
more committed prose in a live scene — a prompt-register behavior."* Everything **around** the dial is
verified — the directive assembles, the rating cap holds, the UI saves. The one thing never verified is
**whether the assembled directive actually changes the model's live narration.** Loki is the first real report
that it may not be landing. That makes this a **browser-leg/live-prompt verification**, and it is Erik's leg
to walk — but the spec below gives CCode the specific things to check first, because a directive that is
present-but-ineffective usually has a locatable cause.

**What CCode should verify before assuming the model is just resisting:**
1. **Is `ratingDetail` actually in the assembled prompt for Loki's turns?** The `gm_registry.js` builder
   (`:253`) gates it; confirm it is `reachedBy: always` and firing for this profile, not silently dropped.
2. **Is the profile's `bluntness` actually `blunt` and `rating.preset` actually `R+` at read time?** Erik set
   them in Settings; verify they persisted to `profile.rating` / `profile.bluntness` and are being read on
   the turn — not defaulted back to Balanced/PG-13 by a stale-profile path. (The adult-checkbox-not-
   persisting bug is a known prior shape — confirm `adultVerified` stuck.)
3. **Is the directive being placed where the model weights it?** A charged-register instruction buried
   mid-cache behind floors and refusals can be out-prioritized by the model's own caution. SNG-144 placed
   bluntness "right after the rating register and before the ABSOLUTE FLOORS" — verify the *floors* text
   isn't so heavily caution-worded that it neutralizes the permission that precedes it. This is the most
   likely real cause: **a permission and a prohibition in the same block, and the prohibition winning.**

⛔ **The R+ ceiling itself does NOT change.** The AUP line holds without exception (charged/sensual/explicit-
in-register, never graphic mechanical depiction). This ticket is about whether the *permitted* register
reaches the page, never about moving the line.

### §2b — "Encounter rate" is connected to nothing (the real bug in the trio)
**Verified: `encounterRate` / `encounterFrequency` / `encounterChance` return ZERO hits repo-wide.** Erik set
"encounters" to maximum and *"see no difference"* — because **there is no consumer.** Whatever that setting
writes, nothing in the engine reads it to change encounter frequency. This is not a tuning problem; it is an
**unwired control** — a dial in the UI with no wire to the engine, the same shape as the pre-SNG-144 register
dials before they were connected.

⚠️ **First, confirm what "encounters" even controls.** Erik may be reading it as "how often romantic/charged
scenes occur," while the setting (if it exists) may mean random-encounter combat frequency. **The label and
the intent may not match** — which is itself the bug if so. CCode: find the setting, find what it was meant
to drive, and either wire it or rename it to what it actually does. A maxed dial that changes nothing is
worse than no dial.

### §2c — the two get conflated, and shouldn't
Erik's instinct bundles R+/Blunt (§2a — built, maybe not landing) with encounter-rate (§2b — not wired) into
one *"none of it does anything."* They are different failures: one is a possibly-ineffective directive, one
is an absent wire. **Fixing 2b will not make romance scenes more charged; fixing 2a will not make them more
frequent.** If Erik wants *charged romance more often*, that is potentially a **third** control that may not
exist at all — worth asking him whether "encounter rate" was his proxy for "romantic-scene frequency,"
because if so the thing he actually wants has no dial yet.

## §3 — THE COMMON SHAPE (why these are one spec)
Both are *"the fact/config is written and the reader never fires"*:
- §1: the person is established, the **registry reader** has no path to her.
- §2a: the dial is set, the **model may not be reading** the directive it produces.
- §2b: the dial is set, **nothing reads it at all.**
This is the same L2 permission-isn't-initiative / L1 built-never-reached family the whole batch has been
closing (SNG-185, SNG-199, SNG-200's companion codex). ➡️ **Worth CCode's judgment on whether there is one
audit to run:** *for every player-set control and every established fact, is there a live reader that
consumes it?* An "unread-writes" audit would catch this class before a player does.

## GUARDS
- **Established ≠ mentioned** (§1) — back-fill the registry from established facts / quest subjects /
  chronicle subjects, not from every spoken name. Caps hold.
- **Existing saves recover** (§1) — Cellaceron sees Teva on next load, no replay.
- **The R+ ceiling and the AUP do not move** (§2a) — this is about the permitted register reaching the page,
  never about the line.
- **A dial that changes nothing is a bug** (§2b) — wire it or rename it; no silent no-ops.
- **Don't conflate frequency and register** (§2c) — they are different controls with different fixes.

## OPEN QUESTIONS — CCODE ROUND 2
1. §1: back-fill the registry from established/quest/chronicle subjects, or widen `knownPeopleAt` to union
   those sources at read time? (Back-fill fixes it once and everywhere it's read; read-union fixes only this
   surface. Lean back-fill.) And is this one fix with SNG-199, or two?
2. §2a: run the three checks — is `ratingDetail` firing for Loki's profile, do the settings persist to the
   read, and is the permission being neutralized by an adjacent floors block? Which of the three is it?
3. §2b: what does the "encounters" setting currently write, and what did it mean to drive? Wire or rename.
4. §2c for Erik (product question, not CCode): was "encounter rate" your proxy for "romantic/charged scenes
   more often"? If so, that control may not exist and is a separate ask.
5. The unread-writes audit (§3): worth running across all player-set controls and established facts, or
   case-by-case?
