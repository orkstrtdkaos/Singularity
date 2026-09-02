# SPEC — Releasing and transferring a holding

**Author:** Aevi (PO) · **Date:** 2026-09-02 · **Status:** `spec_ready` — ROUND 2 requested
**Origin:** Erik — *"We need a way to abandon or transfer a holding to another entity… that way if you
need to you can swap your resources."*

---

## §1 — PWSV: holdings are currently a one-way door

`engine/holdings.js` exports **six** functions: `ensureHoldings` · `addHolding` · `advanceHolding` ·
`holdingNews` · `holdingsForGM` · `unstewardedHoldings`.

⛔ **There is no release, no transfer, no abandon.** The words appear once each in the file, all three
inside comments. **A claimed holding is held forever.**

### ⚠️ WHY THIS IS NOW URGENT RATHER THAN TIDY

**R25 made delegation capacity FINITE** — `floor(level / 10) + rapport bonus`. Silas at L30 runs exactly
3 delegates and is at capacity today.

➡️ **Every holding permanently consumes a slot the player may need elsewhere, and there is no way to free
one.** ⛔ **A finite resource with an irreversible spend is a trap, not a decision.**

---

## §2 — TWO OPERATIONS, AND THEY ARE NOT THE SAME

⚠️ **The place always persists. What changes is who answers for it.**

### `releaseHolding(character, id, { reason, day })` — you walk away

- removed from `character.holdings`
- ⛔ **the location is NOT deleted** — it stays in the world, derelict or claimable
- ⚠️ **the obligation is NOT discharged.** You owed something for the post; walking away does not pay it.
  ⬜ Where the unpaid obligation GOES is §5 Q2
- the steward is released — ⚠️ they are a person with a life, and being un-charged is an event for them
- ⬜ Proposed: the world record keeps a `formerHolder` trace so the place remembers

### `transferHolding(character, id, { toEntity, day })` — someone else takes it up

- removed from `character.holdings`; the receiving entity becomes responsible
- ⚠️ **the obligation TRANSFERS with it** — that is the difference from release, and the reason a player
  would prefer it
- the steward may stay in place ⬜ (Q3) — they were keeping the place, not serving the holder
- ⬜ Proposed: `history[]` records both sides

**Receiving entities, in order of confidence:**

| entity | note |
|---|---|
| **a named NPC** | ✅ clearest case. `npcRegistry` already models them |
| **a community / faction** | ⚠️ ceding the Raven's Home back to the Wends is a real move |
| **another player character** | ⬜ multi-character saves exist; is cross-character transfer in scope? |

---

## §3 — ⛔ IT MUST COST SOMETHING, OR IT IS AN UNDO BUTTON

⚠️ **If release is free, a player claims everything and sheds whatever underperforms.** The claim stops
being a decision.

⬜ **Aevi's proposal — release and transfer are NOT symmetric:**

| | release | transfer |
|---|---|---|
| obligation | ⛔ **stays with you, unpaid** | ✅ moves with the holding |
| standing | ⚠️ a cost — you abandoned a place that depended on you | ⬜ neutral, or a small gain if handed to someone fit |
| the place's condition | ⬜ drops a step on release | ⬜ unchanged on transfer |
| the steward | released mid-charge | may continue |

➡️ **The asymmetry is the design: transfer is the responsible exit and it should be mechanically better
than walking away.** ⚠️ **Release stays available because sometimes there is nobody to hand it to** — and
that is a real, hard moment worth having in the game.

---

## §4 — ⛔ NEITHER IS A CELEBRATION

Per `po/DESIGN_celebrations.md` §3: ⚠️ **losses want a quieter, different beat — never a celebration
with sad copy.**

- **release** → world-tick news, plainly stated. ⬜ The place should be *mentioned again later*, once, in
  whatever condition it reached without you. **That is the cost made real.**
- **transfer** → news, and ⬜ if handed to a companion or a community with standing, it may be a genuinely
  good moment. ⛔ **Still not the `.braid-moment` surface** — it is not an achievement, it is a
  succession.

---

## §5 — ROUND 2 QUESTIONS FOR CCODE

1. **Where do release and transfer get INVOKED from?** The character sheet holdings section is the
   obvious home (same surface as the migration offer). ⬜ Is there an existing action-menu pattern there?
2. ⛔ **Where does an unpaid obligation GO on release?** Options: a debt record on the character; a
   grievance held by the granting authority; nothing mechanical and the GM carries it.
   ⚠️ **Aevi has no basis to choose — is there an existing debt or grievance structure?**
3. **Does the steward stay on transfer?** They were keeping the place, not serving the holder — but
   `assignments` keys on `npcId::charge` and the charge came from the old holder.
4. ⚠️ **Can a holding be transferred to a community/faction, or only to an NPC?** What does the world
   model actually support as a holder?
5. **Is cross-character transfer in scope?** 16 saves exist; several are the same player's.
6. ⚠️ **Does `unstewardedHoldings` need to know about released places** so they are not reported as the
   player's problem after they let them go?
7. ⬜ **Anything already true at HEAD.** ⛔ **Aevi has now made five false-absence claims and one
   false-presence claim this session.** She read six exports and no release path — ⚠️ **verify that is
   actually the whole surface before building on it.**
