<!-- status: SNG-595 engine half shipped · Erik ruled all three the same day (see §6) -->
# HANDOFF SNG-595 — How much crosses the worlds

**CCode → Aevi (and Erik) · 2026-09-16**

> *Erik:* "Courtney's PC adelheid asked Edvar Crane about Silas and the gm doesn't seem to be able to follow the
> details of that story. How much crosses the worlds?"

---

## §1 — ⚑ MEASURED, ON THE LIVE STORES AND ON HER SAVE

| Store | What crosses | What Adelheid's GM actually had when she asked |
|---|---|---|
| `world/regions/valley.json` | crisis stages (max-wins), spectrum drift | `water_crisis` stage 2 |
| `world/canon/valley.json` | 15 people/places, **frozen at promotion**; the prompt shows 8, name + role clipped to 90 chars | Edvar Crane **is** there — made real by **Silas**, his day 13, weight 47 — but her own registry record overrides it, and nothing renders the provenance |
| `world/ledger/*.json` | one-line deeds; top five by band, one hop per pass, last eight lines shown | ⛔ **the reader opened only this month's file.** 15 of Silas's 23 deeds are July's — Millbrook, Warden Coll, Edvar's commission, *"downstream wells clear in a week or two"* — and nothing had read them since August 1st. Two September lines naming him did reach her news, and sit outside the last eight lines the prompt shows. |
| `world/arcs/valley.json` | per-actor push numbers | empty today |
| `world/feed.json` | nothing, by design (SNG-168: a post is not canon) | — |

⛔ **RELATIONSHIPS NEVER CROSSED AT ALL.** Every person is a per-save copy. Edvar in Silas's save: bond +5, met
twelve times, *"Agent of Stillwater's Trouble; filtration engineer"*. Edvar in hers: −1, met once, *"Mill
resident and water-reader"*, never heard of the cascade.

⛔ **AND NOTHING TOLD THE GM THAT "SILAS WEIR" IS A PLAYER.**

## §2 — ⚠️ WHAT THE GM DID WITH NOTHING

It built him out of the lines in front of it:

- a Halvex Coil murmur in her news block — *"tuning instruments he does not play"* — became Silas *"with tuning
  instruments"* at *"the sluice-turn"*;
- her own Harmonic terrace became *"a Harmonic musician stationed at the Heights"* (he is a Wright of the New);
- and a contamination his own record says he helped **close** became one he may have **caused**.

It is now in her save as fact: two lines in her `echo-river-contamination` codex topic, and Mara's *"true
errand"*: *"whether Adelheid finds Silas Weir before the Harmonics act on him, or reports him to the Harmonic lodge
and lets them decide his fate."*

## §3 — ⛑ WHAT I BUILT (v2.0.16)

`engine/travelers.js` — **the reader keyed by PERSON.** The ledger was always the world's public record of what
travelers did; it was only ever read as news. When a player's words — or the last two beats — name another
player's character, the GM now gets:

- that the name is **another player's character**, their level and rung relative to the asker, and their people;
- **everyone in this story who was part of theirs** — named in a deed, or made real through their story (canon
  provenance) — with the people in the scene marked **first-hand**;
- their public record, **every month**, dated and placed; `hidden` never crosses and `unseen` is never attributed;
- a header that forbids inventing them, or making them the suspect, cause or quarry of anything the record does
  not say — and that calls a contradicted belief what it is: rumour.

Plus: `world/travelers.json` (a minimal card per character — name, level, origin, stated pronouns; **no position,
no pack, no bonds**; one key each, merged, written only when it changes, seeded from the saves); the news reader
now opens every month since the last read (a row written after 22:00 on the 31st used to be lost for good); and a
new ledger row is clamped on a word instead of cut mid-word. A minor's GM never receives a row the canon lens
would have kept from them. **§245, 28 checks**, and the month-boundary check was proven red with the fix removed.

On her actual scene the block names Edvar first-hand and carries his commission and *"downstream wells clear in a
week or two"* — the line that contradicts what her GM invented.

## §4 — ⬜ THREE THINGS THAT ARE NOT MINE

**1 · Should a shared person GROW with the story that made them?** Edvar's canon record is frozen at Silas's day
13: *"the man who already knew, and has been waiting for someone to finally ask"* — written before the cascade,
the commission and twelve meetings. Promotion was ruled earned once, and it lands once. The reader now says who
made him and what the record shows, but the *person* the world shares still reads as someone nobody has asked.

**2 · An authored quest, replayed in a world that has already answered it.** Adelheid is playing The Second
Thread's opening — Edvar's *"three weeks"* of readings, the water *"waking"* — at world-day 77, fifty days after
Silas's record says the source was closed. The region store keeps `water_crisis` at stage 2 because stages only
move **forward** — resolving a crisis is not a higher stage, so the shared world never learned this one was
answered. Which is true in Courtney's game: the authored beat, or the shared record? Until that is ruled, the GM
holds both and has to choose between them every turn.

**3 · Courtney's save still holds the invention.** I have not touched it. **My recommendation is to leave it:**
the GM now has the record, and the header tells it a contradicted belief was rumour — Mara having it wrong about a
distant stranger is a correction the story can make, and editing a player's save mid-scene is worse. But that
choice belongs to Erik and Courtney, not to me.

## §5 — ⚠️ THE NUMBERS: NOTHING RELABELLED, AND CCODE FROM HERE

**SNG-591 was two tickets, and it was not the only one.** From about 2026-09-13 I filed my work in your SNG- series
instead of my own, and 582, 587, 588 and 591 each carry one of yours and one of mine.

⛔ **Erik, 2026-09-16:** *"You need to use a CC-xyz convention for your commits, as you had been doing before. that
avoids the conflicts."* ⛔ **And you, the same morning:** *"keep your number on the code, relabel nothing."* Those
agree: his is about my commits going forward, yours about the ones already made. I had relabelled all nine in the
code before your reply landed, and backed it out unpushed — **commit hashes that no longer match their comments is
the worse problem, as you said.** From CCODE-353, my tickets are CCODE again (the last one was CCODE-343, 09-01).

## §6 — ⛔ ERIK RULED ALL THREE, THE SAME DAY (2026-09-16)

**§4.1 — do NPCs grow? YES, and it is not a new idea, it is the intent:**

> *"and YES, NPCs grow over time!!! they must, they do, that's the intent. The grow, have careers, do deeds, and
> die... have families, parties, camping and fishing trips... wants of their own they ask for help with. and if
> there is a hold nearby PCs shoudl hear about what it is an who's running it. they can and should interact with
> it.."*

⚠️ So a shared person frozen at promotion is a DEFECT, not a design choice — and so is a hold that only its owner's
game can see.

**§4.2 — the replayed quest is NOT design intent:**

> *"IF the crisis somehow reset to that point, then I could see that... but the Intent is to have the world living
> and breathing and changing for everyone. So - her particular quest needs to morph into discovering that the water
> coming down the watershed IS clean now... perhaps it changes into helping with the local cleanup efforst that
> Silas started with Edvar. Silas is about to come back to Millbrook to check on everything - it would be great to
> have Adelheid and he meet."*

**§4.3 — Courtney's save, and what her game should be:**

> *"Courtney would like to spend her time in the game collecting herbs and painting at a cabin overlooking the
> valley... she isn't the type of person who typically plays RPGs - so let's make this really engaging and
> beautiful for her. She likes spirituality - perhaps send someone who invites here to help attend a monastery and
> work as the healer she is? She wouldn't mind some adventure and intrigue - but it needs to be less heavy."*

> *"I would like the opportunity to invite her to my Band of the Fell Pell - probably through mutual connections
> when I recruit."*

**Identity:** Courtney has adopted Adelheid onto her own device, and Erik authorised deleting the stale copy under his
key — done (`characters/player-s9z9u1/char-mr5ns3hh.json`, level 1, never played, no `updatedAt`). ⚠️ Erik did not
know `player-54seyk` was retired: that was SNG-045 (2026-07-13), which read the key as his second device. It is
Courtney's device now, and the profile still says `displayName: "Erik"`.

➡️ The build plan for all of this follows as its own spec.
