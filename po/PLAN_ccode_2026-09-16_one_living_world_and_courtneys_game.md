<!-- status: shared lives under way — CCODE-380 (canon identity), 381 (a legend's fate), 382 (who is around today), 383 (a hold nearby), 384 (shared people) shipped · content asks for Aevi in §4 -->
# PLAN — One living world, and Courtney's game

**CCode → Aevi and Erik · 2026-09-16**

Erik's rulings this morning are quoted in full in `HANDOFF_ccode_aevi_SNG-595` §6. In one line each:

- **The world changes for everyone.** Adelheid replaying a crisis Silas closed is *"NOT design intent"*; her quest
  *"needs to morph into discovering that the water coming down the watershed IS clean now… helping with the local
  cleanup efforts that Silas started with Edvar."*
- **NPCs grow** — *"they must, they do… careers, do deeds, and die… families, parties, camping and fishing trips…
  wants of their own they ask for help with"* — and **a hold nearby is known** (what it is, who runs it) and can be used.
- **Courtney's game** — herbs, painting at a cabin overlooking the valley, spirituality, a monastery where she works as
  the healer she is, adventure and intrigue that is *"less heavy"*; *"let's make this really engaging and beautiful for her."*
- **Silas and Adelheid should meet** when he comes back to Millbrook, and Erik wants to **invite her into his band**
  *"through mutual connections when I recruit."*
- **Who's playing** is chosen on the load screen, every time. Export/Import go to Settings; the Library moves to the top
  as the way into the lore and world pages; the title banner comes to the other screens.
- **Backlog:** ONE source of truth for every kind of thing (§3).

---

## §1 — SHIPPED TODAY

| Ticket | What |
|---|---|
| SNG-595 (with Aevi) | the reader keyed by PERSON: another player's character named in play reaches the GM with their public record |
| CCODE-353 | the stale Adelheid under Erik's key deleted; my tickets are CCODE again |
| **CCODE-354** | **a crisis another traveler answered reads as answered, for everyone.** Latest-wins merge that carries WHO (Aevi's ruling); an answer beats any question; the region write is a merge; a world-tier quest ending is a shared record; `priorOutcomeBoards` read at last; `event_resolve` exists; Silas's day-26 answer backfilled. Adelheid's GM now reads *"The Water Crisis — ANSWERED on world-day 26, by Silas Weir — another traveler"* with Aevi's `_theWorldNow`, and for three beats is told to let the story reveal it and to call what she heard rumour. |
| **CCODE-355** | **who is playing is chosen, not assumed.** Courtney's tablet had been writing Erik's profile (his R+, blunt, eventful settings); `player-54seyk` is Courtney's again (PG-13, calm, lyrical, restrained, and her wishes). A picker on every load; the roster shows one player's characters; Export/Import in Settings; the Library at the top; the banner on every screen, showing what that screen is about. |
| **CCODE-356** | **the place is a title, and the ground says its numbers** (Erik: "this area needs a cleanup"). The most specific place as a heading, never twice; the standing beside it with a popup that says what it does — and that it moves no dice or prices, held by a gate; the four sources on their own line with the percentage the roll uses. |
| **CCODE-357** | **an invitation comes to the door, and a painting is a painting.** A quest bound to a character brings its giver to find them, once (`invitationPressures`) — the door Aevi's monastery quest walks through. A GM op `imageMedium`: a picture the character MADE is drawn in its own medium and kept as her artwork. Adelheid's arc routes stop reading "[object Object]". |
| **CCODE-358** | **the nanite says both numbers** — ordered and wild, each with its word and percentage (Millbrook read "strong 100%" while ordered crafts there answered at 53%). And the doc size table stopped flipping on a carriage return. |
| **CCODE-359** | **another traveler is here.** The card carries `where` (community, town, place, the world-day they came), refreshed while they play; a GM row and a quiet line on the play screen say another player's character is in this same town; a shared scene carries its town, so Silas in the square finds the scene Adelheid opened at Mara Wells' Store. The town took three measured tries — the parent chain climbed to "The Disputed Zone" and then "Echo River Crossing"; a community is named for its town. |
| **CCODE-360** | **an invitation carried by someone you both know.** Silas picks a traveler and a carrier from his band on the Bands tab; `world/invitations.json`, one merged record per sender, addressee and band. It reaches Adelheid only where HER save knows the carrier — on the real saves, Mara Wells is the one of the Fellowship's six she knows. She gets a one-tap Accept / Decline on the play screen, and her GM lets Mara bring it up (or send a note). The answer comes home on Silas's tick as word from elsewhere. |
| CCODE-361 | Aevi's Kindly Rest and Painter's Shelf had raised two counts inside suites that were already red; the census was ratified, the Kindly Rest got an explicit `parentId: null`, and the prose place counts were fixed. |
| **CCODE-362 / 365** | **the banner's pictures travel, in the right half, brighter** (Erik: "unrecognizable because of the aspect ratio" → "limit them to the right half… brighter across the board"). |
| CCODE-363 | Sister Vreni's `vocation: "healer"` → ATTENDANT, from the game's own vocabulary ("an ATTENDANT mends"). |
| **CCODE-364 / 366 / 368** | **a strike is news: who came, how, who stood in the way, what it cost.** Authored flavour only (fighting style, tradition, signature power); Aevi's 31 lines are live. A crusade is known; a quiet strike that lands leaves no name, in the words, the ids or the tab (Erik: "let the flavor of the striker guide"). A strike turned aside from the player is news naming the guard (Aevi). |
| **CCODE-366** | anyone Silas has met can carry an invitation (Erik meant Edvar Crane, who is not on the Fellowship's roster). |
| **CCODE-367** | **near news stands out** — near first, with a chip, and kept for the GM — **and a community is not a town**: `valley.millbrook` holds Archive Hollow nine days off, so "here" is now decided by walking distance, for news and for travelers alike. |
| **CCODE-369** | **a home is a place that is yours** (Erik: "a home is a different type than a hold… to start with it's a location"): a ⌂ door in the place header, a Home line with "Go home", and a GM row. No decay, keeper or raid. |

⚠️ **Every device must reload (now v2.0.31).** A tab still running the old code overwrites the region file on its next tick
and would drop the answer until a new client pushes it back.

## §2 — NEXT, IN ORDER

**CCODE-355 — who's playing** *(shipped — see §1)*
- ⛔ **Measured: Courtney's game has been running on ERIK's profile.** Every `save: Adelheid` is followed a second later by
  `profile: player-s9z9u1` — so her GM plays under his R+, blunt, eventful settings, and the two devices overwrite each
  other's profile. `player-54seyk` was retired into Erik's key by SNG-045 on 2026-07-13, which read it as his second
  device; the remote `retired`/`redirectTo` fields are read by nothing, and a device-local redirect decides.
- Profile selection on every load; the roster shows the chosen player's characters; an explicit choice beats a stale
  redirect. `player-54seyk` becomes **Courtney's** profile.
- Export/Import → Settings; the Library → the top, as the entry to lore and world; the banner on the other screens.
- **"What I want from this game"** in Settings, read by the GM every turn — the home for *herbs, painting, a cabin,
  healing, spirituality, lighter adventure* that today has no field at all.

**A gentle game has the engine it needs** *(invitation + painting + routes shipped as CCODE-357; the cabin is below)*
- ✅ **A HOME (the cabin): RULED and shipped as CCODE-369.** Erik: *"a home is a different type than a hold... but it could BECOME a hold. to start with it's a location."* The Painter's Shelf can be Adelheid's home the day she stands in it.
- Painting that makes a picture: a gallery image in watercolor for her, not the house "digital painting, atmospheric
  concept art" style that every image is forced into today.
- A directed arrival that carries an invitation (the pressure queue already stages "they arrive now"; nothing aims it).
- The personal arc's register for a gentle player (it is always "mythic, tragic-or-heroic") and the `[object Object]`
  routes saved on hers.

**Travelers meet** *(shipped as CCODE-359)*. Where a traveler was last seen (settlement + world-day) on their card; open scenes
indexed by settlement rather than exact site (Adelheid stands at `gen-mara-wells-store`, Silas would arrive at
`millbrook`); a quiet "Adelheid is in Millbrook — join" banner; a GM row saying another traveler is here and is not the
GM's to voice.

**An invitation carried by a mutual acquaintance** *(shipped as CCODE-360)*. `world/invitations.json`, one key per invite, merged.
Silas sends word through someone both of them know — **Mara Wells** (his 8, her 4) or **Edvar Crane** (his 5, her −1).
Two things changed from this plan while building, both deliberately:
- ⚠️ **A traveler who joins is NOT a contingent.** Contingents are what `bandStrength`, `bandThreat` and every clash
  count, so a `characterId` contingent would have put Courtney's character on Erik's dice. She stands on the band as a
  *traveler* beside the contingents — on his roster and his GM's, never in a number.
- ⚠️ **Silence is not an answer, and nothing expires.** Nothing happens without her yes; an unanswered invitation simply
  stays open. The carrier must be in the band (Edvar is not in the Fellowship, so today Mara is the road).

**SNG-596** *(shipped: CCODE-364, 366, 368 — see §1)*.

**NEXT — SNG-597** (the kin selector that compares `dir` and prefers who cared most; a figure in a PC's party surfaces her
world-arc business), **then** the skill card (attribute + sub-attribute) and the purse band beside its number.

**⬜ BACKLOG, from Erik's answers today:**
- **Accomplices in a strike:** later. Aevi thinks they aren't worth it (three proper nouns is the most a line can carry);
  that's Erik's call when it comes up.
- **A revamp pass on the world news, "soon":** give every kind of news its place. Only 4 of 20 items carry one on
  Adelheid's save, so near-news can only mark what the engine already placed. Also the five joins in Aevi's strike lines
  (po/REPLY_ccode_SNG-596b).
- **A home becoming a hold:** the upgrade path from CCODE-369's location to a holding.
- **Recruiting into a band:** nothing in play adds a person to a band's roster. Edvar works beside Silas in the story and
  isn't on the Fellowship's list.
- **The world tab and an unseen striker:** Erik's "without a trace" hides the striker there; Aevi would keep them on the
  tab as the player's own intelligence. One line either way.

**THEN — shared lives.** Measured: EVERY part of an NPC's growth is per-save — status, rank, career, deeds,
wants, deaths, minted people, holds. `minted-1` is three different people in three saves; `the_undefeated` is active,
wounded, wounded and stopped; `presentToday` seeds on the character, so two players in one place on one day meet different
people. The architecture, staged: a `world/people` fact log (per-key union, a person's state a fold over their facts);
a tick seeded by region + world-day so two clients simulating one day write identical facts; the registry split into what
is RELATIVE to a player (bond, times met, what they know) and what is TRUE of the person; canon as identity only — and
**canon promotion currently contests itself** (6 entities "overtook" their own id, including Edvar); `world/holds` with a
`holdsNearForGM` row; and `pushMergedFile`'s read moved off the contents API before a shared file crosses 1MB.

**Shared lives, as built so far:**
- ✅ **CCODE-380 — a grown record is never its own rival.** The app hydrates a character's own grown people and places into
  the pool promotion scanned as AUTHORED, so a record met itself at weight 100: 33 of Silas's 35 grown records and all 8 of
  Loki's. Four places and Bryn Callowell had gone to the variants pile on 09-11/12; the repair put them back, counted.
- ✅ **CCODE-381 — a legend's fate is the world's.** `world/people/valley.json` holds one fate per authored legend, folded by
  one rule every client applies (the earliest death; a death over anything but a later return; otherwise the latest event,
  the heavier on a tie). The tick adopts before its pass and publishes after; a save's first read is silent.
- ✅ **CCODE-382 — who is around today is the town's.** Seeded by the settlement and the world-day, not the character (Silas and
  Adelheid in one square had met different people on 58 of 60 days); and nobody the world or the player's record holds dead
  (a buried legend had been offered as "around today" 20 times in 400 days).
- ✅ **CCODE-383 — a hold nearby is known.** Each holding is published as the road knows it (`world/holds/valley.json`: what it
  is, where, who runs it, whether it thrives, what it has; never its store or debts), and another traveler's GM hears of any
  within two walking days, with a quiet line on the play screen. Adelheid in Millbrook now hears of the Fell Pell.
- ✅ **CCODE-384 — the people the world makes are shared** (Erik: *"Yes people could be shared"*). A person minted from an event
  takes an id derived from it (one survivor and one successor per death, one taker per empty arc per fourteen days), joins
  every world's roster through `world/people/valley.json`, and their fate folds like a legend's. The five legacy people moved
  onto ids of their own world.
- ⬜ **Next:** the registry split (what is relative to a player against what is true of the person); trading with another
  player's hold; the >1MB read.

## §3 — ⬜ BACKLOG (Erik): ONE SOURCE OF TRUTH FOR EVERY KIND OF THING

> *"It should all be added to and pulled from a single source — viewable as a codex, and the popups, etc... as you learn
> who a person is, but the TRUTH needs to be known and documented somewhere."*

Person, creature, object, place, quest — one record each; the codex and the popups are VIEWS of it, revealed by what the
character has learned. Measured today, from his screenshot of "While you were away":
- ⛔ every fight line renders its whole sentence inside the "see the fight" `<button>`, and the linker skips text inside
  buttons — so no name in a fight line can ever link (*The Starless One*, *Ateph of the First Flame*, *Harrow*);
- ⚠️ `knownIndex` has sources for figures, arcs, codex topics, titles and met people, and **none for places, creatures or
  objects** — *Grovehome*, *Pressureholt* and *Harmonic Heights — Lower Terrace* can never be asked about.

## §4 — AEVI: THE CONTENT THE ENGINE ABOVE WILL READ

1. **`water_crisis`** — a `resolutions` block keyed by outcome, each with a player-facing `summary` of the aftermath (the
   river clearing, the cleanup crews, the fisher families who fell ill at First Sickness mending). `event_resolve` on the
   outcomes of What the Water Remembers that end the crisis. `the_reclamation_site` as a location (SNG-552 O5).
   *The engine reads `resolutions[outcome].summary` first and falls back to your `_theWorldNow`.*
2. **For Courtney** — a monastery or house of healing within a day or two of Millbrook (nothing authored is one; the
   nearest spiritual place is The Quiet House at 22 walking days, the Mercy-House at 121); the gentle healer who comes to
   invite her; a quest bound to Adelheid (`boundToCharacter`) for that invitation, with light intrigue and no gore; a
   cabin on the Harmonic Heights terraces overlooking the valley. She is a Swiss herbalist who makes remedies and paints in
   watercolor; her aspiration is `chord_of_mending`.
3. **Her rumour** — her GM invented a manhunt: Mara's "true errand" is to find Silas before the Harmonics act on him. The
   engine now tells her GM the water is clean and that what she heard was rumour; an authored beat where Mara or Edvar
   corrects it kindly would land better than an improvised one.
4. **The meeting** — Silas coming back to Millbrook to check on the work he started with Edvar, where a healer is welcome.
