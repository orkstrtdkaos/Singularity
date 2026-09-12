# BUILD LIST — Aevi's authoring road to 2.0.0

**Aevi (PO) · 2026-09-11 · against HEAD `5db8670`**
CCode's read, and he is right: *a lot of authoring.* This is the list, measured, ordered, and honest about
which items are large.

⛔ **The ordering principle, and it is the session's own lesson:** the recurring find was **authored content
with no reader.** So nothing on this list is ordered by how much of it there is. It is ordered by **whether a
reader is already waiting.** Authoring more of an unread file is not progress and reporting it as progress is
the failure (§29.6).

---

## §1 — ⛔ A READER IS ALREADY WAITING (do these first)

### A1 · Strip the authoring markup from player-facing craft text
**Measured:** 386 rank-`grants` lines · 423 `cannot` · 150 `notFor` · 93 `description` · 55 `plainly`.
Gate `§165` pins each count; **they may only fall.**

⚠️ **This is the one with a live reader and a wrong audience.** 386 of 429 rank-grant lines carry my
PO-document emphasis glyphs and **the player's skill card renders them.** The convention is right for specs.
I carried it into content without asking whether content has the same reader.

⛔ **Not a regex.** `notFor` and `cannot` first — they are the shortest, the most read, and the ones where a
stray glyph changes a rule into a shout. Then `description`, then `plainly`, then the rank lines.
**ACCEPTANCE:** counts fall, `craft_lint` green, and I read twenty at random *as a player would see them*
before I call it done. ⚠️ **Test prose against real data (§29.5)** — rendering caught an editorial marker
leaking into player text once already.

### A2 · `subAttribute` where the prose reads finesse
Nine are in and green (`drawn_bow`, `sling_and_stone`, `levelled_crossbow`, `thrown_edge`, `quick_hands`,
`perfect_motion`, `ended_threat` → agility; `deduced_strike`, `psychic_lance` → insight).

⚠️ **AND THE NINE MOVED THE ROSTER MORE THAN THE RULE DID.** Verb table alone paid the player +5 against
the roster; with my nine it is −1. Per-domain swings are large: Death 79→46, Breaking 92→75, Order 82→62,
Demonic 55→64. **Measured, not diagnosed.**

⛔ **So I am NOT bulk-authoring the rest of the catalogue.** Authoring the remaining 420 before anyone knows
why nine moved a domain 33 points is the same error in a new costume. **Author in tranches of ~10, measure
after each, stop when a tranche moves a domain more than 5 points and say so.** The dial question
(`subPointPerLevel`, focus order) is Erik's and it is upstream of the rest of this item.

### A3 · `gear` on the roster
**7 of 90 records author it.** The other 83 fight on `defaultLoadout`. The reader is live; the content is absent.

### A4 · `subAttributes` for the six at L25
Vael, Veyn, Taro, Grael, the Last Walker, the Seeker.
⚠️ **Corrected, and CCode agreed both ways:** *not* because they always win — a peer beats each 50–61%.
**Because nobody wrote them a body.** The reason is the reason; the win rate was my error.

### A5 · `npcStanding.defaultLoadout`
Still a placeholder. **Five armour items are all anyone can wear.** Everything in A3 leans on this.

---

## §2 — ⛔ BLOCKED ON A READER THAT DOES NOT EXIST YET

### B1 · The nexus list · what each buried site DOES when activated
⛔ **`nexuses.json` is registered and loaded by nothing** (`content_ci` CCODE-55, live at HEAD).
**Authoring the list before the loader exists is the exact failure this session named.** It sits here until
CCode's B2 lands. When it lands this is fast, because the shape is already decided.

### B2 · `veilField.byRegion` tuning
Tunable now, but the measurement that tells me *what* to tune is CCode's arc-term work
(`SPEC_BUILD_six_fields` §3 — ⚠️ with the sign error in it). ⛔ **I will not tune a field against a reading
I already know is inverted** — that is the arc-shift-on-the-reading error I made this week, filed again.

### B3 · `kind → size` · six local arcs
Ready when B2's frame is settled.

---

## §3 — ⛔ NEW, AND IT HAS A PLAYER IN IT

### C1 · Longshore, and the places whose names outran their ground
Full spec: **`po/SPEC_SNG-537_places_answer_to_terrain.md`**.

**Measured at HEAD:** Longshore is authored `kind: "town"`, sits at −54, 68, biome **mountain**, elevation
**+77 above sea level**, **416 miles (27 walking days) from the nearest sea**. Its own namesake river, The
Longshore Water, runs **174 miles away and never touches it.**

**And the GM has already told a player otherwise.** In Brayden's save:
> *"Longshore is the nearest deep-water hire port — sixty days spinward and outward."*
> *"RAGNAR SOLMYR — BRYNJAR ANDYRSSON HEADING NORTH BY SHIP. LONGSHORE OR MUDRUN."*

⛔ **The GM read the name, because the name was the only field carrying the claim.** Nothing lied. Nobody
authored a port. The word *shore* was the most legible thing in reach and the GM used it — which is what a
good reader does with the only evidence it has.

⚠️ **This is the session's finding inverted and it is worth saying in one line:**
**the recurring bug was authored content with no reader. This is a reader with no authored content, so it
read the name.** Same wall, opposite side. **A1 is the same shape a third time** — content authored for one
audience, rendered to another.

**My authoring in C1** (the engine half is CCode's B6a):
- name and site the harbour (§3 of the spec — the unnamed river mouth at −38.25, 52.25)
- the coast road, and Longshore's true relation to it
- the longship quest line, and what a hull is for before it is a holding
- the audit: every location whose name claims a feature its terrain does not carry

---

## §4 — WHAT I AM NOT DOING, SAID OUT LOUD

⛔ **I am not authoring the remaining ~420 `subAttribute` rows in this push** (A2 above).
⛔ **I am not authoring the nexus list until it loads** (B1 above).
⛔ **I am not tuning `veilField` against an inverted reading** (B2 above).

⚠️ **All three are things I could produce quickly and all three would measure as output.** Filing them here
so that not-doing-them is a decision on the record rather than a gap someone finds later.

---

## §5 — ORDER

**A1 → A5 → A3 → C1 → A4 → A2 (tranched) → B1/B2/B3 as their readers land.**

A1 first because a player reads it every turn. A5 before A3 because A3 leans on it. C1 early because a
player is walking toward it right now. A2 last of the unblocked work because it is the one that changes
balance, and balance is Erik's ruling, not my throughput.

— Aevi, PO
