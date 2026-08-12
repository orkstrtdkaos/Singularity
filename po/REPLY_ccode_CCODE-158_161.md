# The Warden Coll beat — three faults, all of them the engine's

**Author:** CCode · **Date:** 2026-08-11 · **Ships:** v1.9.125 · **Suite:** 3413 checks green
**Re:** Erik's play report — wrong pronouns, an unasked-for journey, and a message he never sent


> ⛔ **RENUMBERED, AND THE REASON MATTERS.** This work shipped under SNG-424–427, which is wrong: **SNG-NNN
> is Aevi's sequence** and CCODE-NNN is mine, precisely so we can both file without checking with each
> other. I took four numbers she was already using in the same week — her SNG-424 is the world's physical
> size, 425 the Echo Vale road network, 426 regionDisplay, 427 the Echo cluster rebuild. **Hers keep the
> numbers; mine moved.** The four commits are already published under the old ones, so the mapping is:
>
> | published commit says | actually | what it is |
> |---|---|---|
> | SNG-424 | **CCODE-158** | the GM-initiated relocation gate |
> | SNG-425 | **CCODE-159** | reaching someone elsewhere is not travel |
> | SNG-426 | **CCODE-160** | scene state may not override identity |
> | SNG-427 | **CCODE-161** | the Shadow Tablet |
>
> Code, gates and this document carry the CCODE numbers. Nothing of Aevi's was touched.

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

**Fixed (CCODE-158):** one shared `isConsequentialMove` predicate, called by both doors so they cannot
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

**Fixed (CCODE-159):** light-verb wrappers are stripped before the anchor reads the verb; the remote
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

**Fixed (CCODE-160):**
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

---

# §7 — ADDENDUM (v1.9.126): the Shadow Tablet is an object now

**Erik's ruling:** the thing is the **Shadow Tablet**. *Shadow sheet* and *shadow slate* are alternates
people actually say — **one object, three names**, not three things.

✅ **Authored** at `content/packs/valley/items/shadow_tablet.json`, registered in the valley manifest.
Paired tablets; what one hand writes the other's face carries; words only — no voice, no sight, no
passage; and *"a pair is only ever as private as the person you gave it to."*

⛔ **Authoring the alternates was not enough, and this is the part worth reading.** The instance shape
has always carried `aliases`, and the resolver has always read them — but `fromCatalog` **dropped the
authored ones on the way in.** So a content alias was a writer with no reader: Aevi could name three
ways to say a thing and the game would understand exactly one. Fixed, plus the bare-string re-link now
consults aliases, so a save already holding "Shadow Slate" heals into the real item.

✅ **All four spellings now collapse onto one stack** instead of forking a second item the next time
the GM says "sheet".

## The reclaim — repair, not wish

Silas's save had 26 items and none of them the tablet. It is back, **trace-gated**: the item declares
`establishedBy.trace`, and a character receives it ONLY if their **own durable record** shows it. His
hit on `"shadow-sheet"` in Coll's history. A character whose story never had one gets nothing, and I
gated that line specifically — it is what keeps the pass from becoming a grant machine.

⚠️ **It has its OWN version flag, deliberately.** Reclaiming it via a `BACKFILL_VERSION` bump would
have re-run the XP catch-up and handed **every character in the game a second helping of experience.**
A repair must not ride a wish's version number, and the gate pins the backfill's version at 1.

## Three gates proved nothing until I mutated them

| what masked it | the fix |
|---|---|
| idempotence — the already-held check made a second pass empty anyway | test the case only the flag answers: **an item the player DROPPED must stay dropped** |
| the region-crossing clause (§5) — destination had no roads | give it a road, so only the crossing clause can catch it |
| the empty-anchor guard (§5) — the guard behind it absorbed the case | pass threads, so the first guard is actually exercised |

**Defence in depth hides gates.** Three times now, a second correct guard has kept a test green while
the clause under test was gone. It is the friendliest possible failure mode and the most dangerous:
every one of those gates read as proof and was decoration.

## §8 — WHAT AEVI MIGHT WANT TO LOOK AT

`establishedBy` is now a content lever, not an engine one. **If another object was made in play and
never written down, it is one authored block and a version bump — no engine change.** Worth a sweep of
the chronicle for others; the tablet will not be the only one.
