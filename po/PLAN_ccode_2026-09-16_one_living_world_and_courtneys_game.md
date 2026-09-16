<!-- status: CCODE-353/354 shipped · CCODE-355 in progress · content asks for Aevi in §4 -->
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

⚠️ **Both devices must reload to v2.0.17.** A tab still running the old code overwrites the region file on its next tick
and would drop the answer until a new client pushes it back.

## §2 — NEXT, IN ORDER

**CCODE-355 — who's playing** *(in progress)*
- ⛔ **Measured: Courtney's game has been running on ERIK's profile.** Every `save: Adelheid` is followed a second later by
  `profile: player-s9z9u1` — so her GM plays under his R+, blunt, eventful settings, and the two devices overwrite each
  other's profile. `player-54seyk` was retired into Erik's key by SNG-045 on 2026-07-13, which read it as his second
  device; the remote `retired`/`redirectTo` fields are read by nothing, and a device-local redirect decides.
- Profile selection on every load; the roster shows the chosen player's characters; an explicit choice beats a stale
  redirect. `player-54seyk` becomes **Courtney's** profile.
- Export/Import → Settings; the Library → the top, as the entry to lore and world; the banner on the other screens.
- **"What I want from this game"** in Settings, read by the GM every turn — the home for *herbs, painting, a cabin,
  healing, spirituality, lighter adventure* that today has no field at all.

**CCODE-356 — a gentle game has the engine it needs**
- A holding that is a HOME (the cabin): rest, the view, a place to paint — today holdings are only `post`/`enterprise`.
- Painting that makes a picture: a gallery image in watercolor for her, not the house "digital painting, atmospheric
  concept art" style that every image is forced into today.
- A directed arrival that carries an invitation (the pressure queue already stages "they arrive now"; nothing aims it).
- The personal arc's register for a gentle player (it is always "mythic, tragic-or-heroic") and the `[object Object]`
  routes saved on hers.

**CCODE-357 — travelers meet.** Where a traveler was last seen (settlement + world-day) on their card; open scenes
indexed by settlement rather than exact site (Adelheid stands at `gen-mara-wells-store`, Silas would arrive at
`millbrook`); a quiet "Adelheid is in Millbrook — join" banner; a GM row saying another traveler is here and is not the
GM's to voice.

**CCODE-358 — an invitation carried by a mutual acquaintance.** `world/invitations.json`, one key per invite, merged.
Silas sends word through someone both of them know — **Mara Wells** (his 8, her 4) or **Edvar Crane** (his 5, her −1).
Courtney accepts or does not, and silence is no. The band's real name is **the Fellowship of the Fell Pell**; its six
contingents are all NPCs today and a contingent would carry a `characterId`.

**CCODE-359 onward — shared lives.** Measured: EVERY part of an NPC's growth is per-save — status, rank, career, deeds,
wants, deaths, minted people, holds. `minted-1` is three different people in three saves; `the_undefeated` is active,
wounded, wounded and stopped; `presentToday` seeds on the character, so two players in one place on one day meet different
people. The architecture, staged: a `world/people` fact log (per-key union, a person's state a fold over their facts);
a tick seeded by region + world-day so two clients simulating one day write identical facts; the registry split into what
is RELATIVE to a player (bond, times met, what they know) and what is TRUE of the person; canon as identity only — and
**canon promotion currently contests itself** (6 entities "overtook" their own id, including Edvar); `world/holds` with a
`holdsNearForGM` row; and `pushMergedFile`'s read moved off the contents API before a shared file crosses 1MB.

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
