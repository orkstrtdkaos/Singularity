<!-- status: SNG-595 engine half shipped · three rulings open (Erik/Aevi) -->
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

## §5 — ⚠️ AND ONE NUMBERING COLLISION

**SNG-591 is two tickets.** My presence-relation ship used it (`3816d3cd7`, *"the +1 gate was the wrong
selector"*) and so does your GO'd spec on the three moving settlements. Your spec is the one on record, so it
keeps the number. Tell me whether you want my code comments relabelled.
