# The Warden Coll beat — three faults, all of them the engine's

**Author:** CCode · **Date:** 2026-08-11 · **Ships:** v1.9.125 · **Suite:** 3413 checks green
**Re:** Erik's play report — wrong pronouns, an unasked-for journey, and a message he never sent

---

## §0 — WHAT HAPPENED, IN ONE LINE EACH

Erik typed: *"Take the opportunity to update Warden Coll on the status of the Water crisis and new
warden stations."* He was sitting at the ridge Threshold Post. He meant to write to Coll on the
shadow-slate he made for him on day 13.

The beat instead: **moved him to the Edge District**, two regions away · **sent a message to Mara**
that he never asked for · and called **Warden Coll "her"**, twice.

⚠️ **Every fact needed to get this right was already in the prompt.** This was not context
starvation. All three are precedence and permission bugs, and all three are mine.

## §1 — THE TELEPORT: NOTHING CHECKED WHETHER HE ASKED TO GO

The `moveTo` contract told the model the header follows the fiction, and listed *"arriving at a new
location within the same scene"* as a case to emit it for. The applier honoured that literally.

⛔ **Every guard in those 37 lines was about WHERE — sub-place→parent, gate routing, object coercion,
resolve-or-mint. Not one was about WHETHER.**

The gate that exists for exactly this is `departureGateFor`, and its own comment reads *"the old
fail-OPEN here is exactly why Silas was relocated."* It guards the door where the PLAYER asks to
travel, before the GM is called. **There are two doors. SNG-188 fixed one.**

**Fixed (SNG-424):** one shared `isConsequentialMove` predicate, called by both doors so they cannot
drift again. A consequential move (region crossing, or a journey to a place you are not connected to)
that no player intent asked for is now **OFFERED, not imposed** — the character stays where they
stand, and the existing one-tap arrival affordance renders the road. That is SNG-188 §4.1's *"travel
is OFFERED, never imposed"* finally honoured on both doors.

Not refused: a sub-place, a waygate transit, an ordinary adjacent step, or any beat where the player
did intend to travel. The contract now also forbids the model from staging it in the first place.

## §2 — "WRITE TO COLL" HAD NO CATEGORY

The intent parser's travel rule had exactly two buckets: making a journey, or *talking about* one.
⛔ **Reaching someone who is elsewhere is neither** — and nothing in the parser knew the concept
existed, in a world with shadow-slates, a Hub relay, and a bird that carries mail.

The code belt behind it reads the GOVERNING verb, which is right ("go to Millbrook and tell her" is
travel). Erik's line opened **"Take the opportunity to…"** — so the governing verb was *take*, a
wrapper. And `update` was not in the verb list regardless; nor were write, send, message, brief,
report, or relay. **Twenty-one face-to-face verbs, no remote ones.**

**Fixed (SNG-425):** light-verb wrappers are stripped before the anchor reads the verb; the remote
half of the vocabulary is in; and a named CHANNEL (`isRemoteContact`) suppresses a travel destination
outright — unless the same words also name real travel, because "walk to the mill and send word to
Coll" genuinely goes to the mill.

## §3 — THE MARA MESSAGE, AND WHY IT WASN'T RANDOM

⚠️ **The shadow-slate is not an object in this game.** I checked the save: 26 inventory items, none
of them the slate. It exists only as prose inside two people's history strings — as *"shadow-slate
channel"* in Coll's, and *"shadow-sheet message"* in Mara's. Two names, two records, no object.

The parser is handed the inventory as the character's affordances. **The one input that could have
said "you can reach him from where you are sitting" was blank.** And the model's only retrievable
example of using the thing was in Mara's record — so it reproduced the nearest structured precedent
instead of the addressee Erik named.

⛔ **This is the writer-with-no-reader shape again.** An item made in play was never emitted as an
`itemUpdate`, so nothing downstream can see it. §2 stops the misclassification; the missing item is a
content repair, and `grantStoryItem` is trace-gated and will pass (the fiction record has it).

## §4 — THE PRONOUN, AND THE HALF THAT WAS WORSE

The sheet was right: KNOWN PEOPLE carried `[man, he/him — use these pronouns]`, in the prompt.

But the slip was written into `sceneState.setting` — **"Coll behind her desk"** — and that block is
served under `## CURRENT SCENE STATE (AUTHORITATIVE — do not contradict)`, **later in the prompt than
KNOWN PEOPLE**. So a one-off mistake was promoted ABOVE the fact that contradicts it and re-served
every turn. It would have stayed that way for as long as the scene ran.

⛔ **And of seventeen repair ops, not one could touch scene state.** The one block labelled
authoritative was the one block with no repair path.

**Fixed (SNG-426):**
- The block no longer claims authority over identity — it is authoritative about the SITUATION, and
  says plainly that names, pronouns, gender and role come from the record, which wins.
- The record's own pronouns are carried INSIDE the block, so the near instruction and the distant one
  agree instead of competing.
- `reconcileSceneIdentity` repairs the prose against the registry, on BOTH the write path (the save
  stops carrying the error) and the render path (**a save already wedged heals itself on the next
  turn** — Erik needs to do nothing).
- **Conservative by construction:** it repairs only when one registered person is named and no other
  appears in the same string, because "Coll behind her desk, Pell at the door" cannot be disambiguated.
  It declines they/them rather than mangle verb agreement. What it declines, the annotation still
  carries. It reports what it changed — a silent repair is an invisible bug.
- `correctSceneState` closes the missing repair path, and the GM is told to pair it with
  `reanchorLocation` — the header and the scene anchor are two records, and fixing one leaves the
  other lying.

## §5 — THE GATES, AND THEIR REDS

35 new checks. Every one was **observed red by mutation**, never by leaving the defect in:

| mutation | result |
|---|---|
| predicate reverted to "never consequential" | suite dies |
| each of its four clauses dropped individually | 1–4 gates red each |
| the `!askedToTravel` clause dropped from the applier | red |
| light-verb strip removed | red |
| remote verbs removed | red |
| scene repair's subject not passed | red |
| last-token-only name matching restored | red |
| empty scene anchor accepted | red |

⚠️ **Two of my gates proved nothing at first and I only found it by mutating.** The region-crossing
test used a destination with no connections, so the not-connected clause absorbed it; and the
empty-anchor test had no threads, so the guard behind it absorbed that. Both are now built so only the
clause under test can pass them. **A gate that stays green under the bug it names is worse than no
gate** — it is the same green light with nothing behind it.

## §6 — WHAT IS STILL OPEN, AND IT IS YOURS

⚠️ **The shadow-slate needs to exist as an object.** Right now it is prose in two NPC records under
two different names. Until it is an item, the parser cannot see it and neither can the player. Ask me
and I will grant it through the trace-gated path — but the NAME is a content call: is it the
shadow-slate, the shadow-sheet, or the shadow-tablet? Erik has called it all three, and Coll's copy
and Silas's copy should share whatever it is.

Everything else ships.
