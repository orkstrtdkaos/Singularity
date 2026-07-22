# SPEC — SNG-207: The GM is ultimately capable — ask it to fix anything, it can
## Aevi (PO) · 2026-07-21 · authored to spec · **awaiting CCode ROUND 2**

> **Erik's direction, 2026-07-21:** *"Upgrade the GM's ability to do everything. If I ASK the GM to fix my
> location, known people, inventory, quest status, ANYTHING — it should be able to. It can use its own
> judgment about fairness and check character knowledge, but it should BE ABLE to use all the levers and
> generativity. It often sends the user to the character-fix screen, which it sometimes makes up can fix the
> issue. I want it to be ultimately capable."*

The machinery for most of this **already exists** and the GM already proposes it — SNG-070/137 built
GM-invoked `stateOps` (repair-not-wish) and the "acknowledge means emit" contract. What Erik is describing is
the **next generation**: close the coverage gaps, kill the fix-screen deflection, and let the GM reach for
the full lever-set (repair *and* generativity) on any player request — bounded by fairness and character
knowledge, which is the GM's judgment to exercise, not a wall the engine puts in front of it.

This is a **structure/prompt-contract spec** (CCode's build). My part is the capability map and the fairness
doctrine that governs the new reach.

---

## §0 — ERIK'S RULING (2026-07-21): fair GM FIRST, god-mode SECOND

Erik confirmed both surfaces are wanted, and **sequenced them**: the **capable-and-fair in-fiction GM is
Phase 1 and builds now**; the **author/dev god-mode is Phase 2 and is explicitly deferred** to a later
ticket (SNG-207b). This whole spec below is Phase 1. The god-mode is out of scope here except for the one
guard it imposes on Phase 1: the fair-GM's grant ops must be built so that a future no-fairness author lever
is a *separate surface calling different entry points*, not a flag that loosens these ops. Build the fair
grant path clean; do not leave a `skipFairness` seam in it for Phase 2 to flip — Phase 2 gets its own door.

---

## §1 — WHAT EXISTS TODAY (verified at origin)

The GM already has three lever-sets:

1. **`stateOps`** (`corrections.js`, SNG-070/137) — 12 GM-proposed repair ops: `correctField`,
   `correctDomain`, `removeEntity`, `unstickQuest`, `reanchorLocation`, `fixCodexFact`,
   `correctAbilityRank`, `correctBond`, `correctVital`, `correctAttribute`, `mergeEntity`,
   `correctNpcGender`. **The GM proposes; the engine validates + applies to the asking player's own save.**
2. **`generate`** (`generate.js`) — `npc`, `location`, `arc` (and the SNG-203/204 types once built): the GM
   authors new world content in-grain.
3. **Turn ops** — `npcUpdates` (incl. `meet`), `placeUpdates`, `questUpdates`, `itemUpdates` (SNG-137),
   `codexUpdates`, the 24-verb play vocabulary.

So the GM is **already partly capable** and already self-heals. Erik's complaint is not "it has no levers" —
it's that **the levers don't cover everything he asks, and when they don't, the GM deflects to a screen
instead of doing the thing.** Three distinct gaps produce that.

## §2 — GAP A: coverage holes — asks with no op

`stateOps` is **repair-not-wish**, and correctly refuses advancement (xp/level/power). But between "repair a
wrong value" and "grant power" sits a large space of legitimate player asks that have **no op at all**, so
the GM can only narrate around them or deflect. Known holes, several found live this session:

- **"I met her, why isn't she known?"** — no op to register an established-but-unregistered NPC (SNG-205 §1,
  Teva). `meet` exists but is the thing that *didn't fire*; there is no *"register this established person
  now"* repair.
- **"Add X to my inventory that I clearly earned/was given"** — `itemUpdates` evolves an *owned* item; there
  is no op to grant an item the story clearly conferred but the engine never recorded. This is the inventory
  case Erik names, and it sits right on the repair/wish line — see §4.
- **"This quest should be at stage 3, I did the thing"** — `unstickQuest` unsticks; SNG-162 advances from
  play; but a GM-judged "you completed this offscreen/in-narration and the tracker missed it" advance is
  thinner than it should be.
- **"Fix my location"** — `reanchorLocation` exists, but only repoints; "put me where the story actually left
  me, generating the place if it isn't a node yet" blends repair + generate and neither op does both.

**OUTCOME WANTED:** the coverage becomes *complete* — for every category Erik named (location, known people,
inventory, quest status, and the long tail), there is an op the GM can emit to make the fix real. Where an
ask falls between repair and generate, the GM can **compose** them (register-then-fill, reanchor-then-
generate). The test: **the GM should never have to say "I can't do that here" for a legitimate state fix** —
its only reasons to decline are fairness and character-knowledge (§4), never missing machinery.

## §3 — GAP B: the fix-screen deflection, and the hallucination inside it

Erik: *"It often sends the user to the character-fix screen, which it sometimes makes up can fix the issue."*
Two bugs:

- **The deflection itself is usually wrong.** The GM *can* emit the stateOp directly (SNG-137's "acknowledge
  means emit, same turn"). Sending the player to a screen to do what the GM could do in-turn is a failure of
  the contract that already exists — the GM is under-using its own capability.
- **The hallucinated capability is worse.** The GM telling the player *"go to the fix screen and correct X"*
  when the fix screen has **no control for X** sends them to a dead end and erodes trust in every direction
  the game points them. The GM does not have a reliable model of what the Repair panel can and cannot do, so
  it invents one.

**OUTCOME WANTED:**
- **Default to acting, not deflecting.** If the GM can emit an op for the ask, it emits it — the fix screen
  is the *fallback* for the rare thing the GM genuinely cannot do in-turn, never the first answer.
- **The GM must know what the fix screen actually does.** If it ever refers the player to the Repair panel,
  the reference must be to a control that exists. The panel's real capability list belongs in the GM's
  context (a short authored manifest of what the panel can do), so the GM can neither hallucinate a control
  nor deflect to a missing one. ⛔ **No invented UI.** A referral to a nonexistent control is the same class
  of bug as a hallucinated rule.

## §4 — THE DOCTRINE: capability is broad, fairness is the GM's to judge

Erik's framing is exact: *"its own judgment about fairness and check character knowledge."* The bound on
"ultimately capable" is **not a shrunken op list** — it is the GM *exercising judgment*, which requires the
capability to be present so the judgment is real.

- **Repair is free.** Fixing a wrong value (a mis-set field, a desynced pointer, an unregistered established
  person, a stuck quest) is always available — no fairness question, the game got it wrong.
- **Grant-what-the-story-conferred is GM-judged, and now possible.** An item the narrative clearly gave, an
  NPC clearly met, a quest clearly completed in play — the GM checks *did the story actually confer this?*
  and if yes, emits the op. This is the space SNG-070 walled off as "wish" — but Erik is right that some of
  it is repair wearing wish's clothes: **if the fiction already granted it, recording it is repair, not
  inflation.** The line moves from "the engine forbids the category" to "the GM judges whether the fiction
  earned it."
- **Pure advancement stays earned.** "Give me 500xp / level me / hand me an item I never encountered" remains
  refused — but the GM refuses it *by judgment* ("the story didn't give you that"), with the capability
  present, rather than the engine refusing it for lack of an op. ⛔ The minor-safety and rating floors are
  **not** GM-judgment — they remain absolute engine floors, never subject to the fairness call.
- **Character knowledge gates fixes too.** A player asking to "know" a fact/person/place the character has no
  in-fiction access to is not a repair — the GM checks knowledge and declines in-fiction. (This is also the
  SNG-199/205 registry principle from the other side: known means *established for this character*.)

**Everything the GM does stays LOGGED and reversible** (the SNG-070 `character.corrections` append-only
ledger) — "ultimately capable" does not mean "unaccountable." A generous GM that leaves a clean audit trail
is the goal; broad power + full logging is how it stays fair.

## §5 — THE PROMPT CONTRACT (the actual lever)

SNG-137 proved the fix is mostly **prompt-contract**, not new machinery. The generation of that:

- **"You can fix this" replaces "go fix this."** The stateOps rule becomes: *when a player asks you to
  correct their state and the fiction supports it, emit the op THIS turn. Do not refer them to a screen for
  anything you can do yourself.*
- **The full capability is named in-context** — the GM sees its complete op vocabulary (stateOps + generate
  + turn ops) with a one-line "use when" for each, so it reaches for the right lever instead of the nearest
  narratable dodge. This is the SNG-195 prompt-review discipline applied to capability: **if the GM has an
  op and doesn't know it, that's the same failure as not having it.**
- **The fairness/knowledge check is explicit and is the GM's** — the prompt tells the GM to judge (did the
  story confer this? does the character know this?) rather than to defer. Judgment named as the GM's job is
  what makes broad capability safe.
- **"Acknowledge means emit" (SNG-137) is extended** from repairs to the whole capability: if the GM's prose
  says it fixed/granted/registered something, the matching op fires the same turn. Prose without op remains
  the worst outcome.

## §6 — DELIVERABLES

**Mine (this spec + the doctrine/manifest content):**
1. This spec — the capability map, the fairness doctrine, the "act don't deflect" contract.
2. **The Repair-panel capability manifest** — the short authored list of what the fix screen actually does,
   for the GM's context, so it can neither hallucinate nor mis-deflect. (I author it from `corrections.js`'s
   real op set.)
3. **The fairness/knowledge doctrine text** for the GM prompt — the "repair is free, grant is judged, advance
   is earned, floors are absolute" ladder, in the GM's voice.

**CCode's (structure/prompt/engine):**
1. Close the §2 coverage holes — the missing ops (register-established-NPC, grant-story-conferred-item,
   GM-advance-quest, reanchor+generate compose). Repair-not-wish becomes repair-plus-judged-grant, with the
   fairness call in the GM's hands and the floors still absolute in the engine.
2. The §5 prompt contract — capability named in-context, "act don't deflect," extended "acknowledge means
   emit," fix-screen-as-fallback-only.
3. Wire the §6.2 panel manifest into the GM context.
4. Keep every new op LOGGED + reversible in the existing `corrections` ledger.

## GUARDS
- **Repair is free; grant is judged; advance is earned; floors are absolute.** The four-rung ladder is the
  whole doctrine. Minor-safety + rating floors are engine floors, never GM-judgment.
- **Capability present, judgment exercised** — the bound on "do anything" is the GM judging fairness, which
  requires the levers to exist. Don't re-shrink the op list to enforce fairness; name the judgment instead.
- **Act, don't deflect** — the fix screen is the fallback for what the GM genuinely can't do in-turn, never
  the first answer. No referral to a control that doesn't exist.
- **Everything logged + reversible** — broad power stays accountable via the SNG-070 ledger.
- **Character knowledge is a real gate** — "known/have/been-there" means established for THIS character;
  the GM checks the fiction, not just the request.
- **Prose without op is the worst outcome** (SNG-137, extended) — describing a fix without emitting it is
  the specific failure this whole line of work exists to kill.

## OPEN QUESTIONS — CCODE ROUND 2
1. **The grant/wish line (§4):** "the fiction conferred it" is a GM judgment — is a lightweight structured
   check wanted (the item/NPC/quest appears in `establishedFacts`/chronicle/active scene), so a grant-op
   validates against *some* trace rather than pure model say-so? That would make "the story gave it to me"
   checkable, not just assertable — and reuses the SNG-205 established-facts signal.
2. **Compose vs new ops (§2):** are register-then-fill and reanchor-then-generate better as new composite ops,
   or as the GM emitting two existing ops in sequence? Whichever keeps the fairness check in one place.
3. **Panel manifest freshness (§6.2):** authored list (mine, updated when ops change) vs generated from
   `corrections.js` at build time (never stale, but couples GM context to code)? Lean generated if cheap.
4. **Sequencing:** this rides on top of SNG-205 (the established-facts signal it reuses) and is prompt-heavy
   like SNG-195. Does it queue after the codex-ledger tickets, or is the prompt-contract half shippable
   independently while the new ops wait?
5. **Does "ultimately capable" want a dev/GM-god mode** distinct from the fair-play GM — a Machine-panel lever
   where Erik-as-author (not the character) can set anything, separate from the in-fiction GM whose grants
   are fairness-judged? The two are different surfaces; conflating them is how a fair GM becomes a cheat
   console. Flagging because Erik's "do ANYTHING" may mean both, and they should stay distinct.
