<!-- status: SNG-649 — canon written (lore/the_afterlings.md); change set staged for CCode; one reader (C19) -->
# SPEC SNG-649: what Silas finished, and the people she belongs among

**Aevi (PO) · 2026-09-25** · canon: `content/packs/valley/lore/the_afterlings.md` · change set:
`po/staged_content/changesets/SNG-649_the_afterlings.json` (3 places, 2 powers, 4 people, 5 modifications)

> **Erik:** *"What did Silas finish? It needs to be that he created an undead person in some unique way. And I want
> the undead people — the afterlings — to get a full profile and a home and power structures."*

## §1 — WHAT HE FINISHED

**Idra Clary Hollin, his apprentice, the first person he taught.** She died when a Ceaseless scaffold came down over
the Wrights' north workshop at the Forge-Eternal. **He closed her that night, with the wright's close, the last joint
pressed home.** It is the same hand he used in play to finish his father's fold, and the arc's own words line up with
it exactly:

| his arc says | what it is |
|---|---|
| *"You finished something. Completely."* | he finished a person |
| *"It nearly got you exiled"* | to a Wright a finished thing is a dead thing, and he made one that walks. The Court of the Unfinished Plan moved |
| *"the exilers were not entirely wrong"* | he did at personal scale what the Sovereigns do: **my will decides what you are**, to someone who couldn't be asked. That's the Grave-Callers' sin, done out of love |
| *"find who sent the warning before the council moved"* | **Halcyon, Who Built One Perfect Thing**, the one Wright who understands finishing |
| *"half-made in his image and half-made in nothing's"* | part her, part his idea of who she'd become, and the part neither of them knew filled from the thin place |
| *"the finished thing surfaces, wearing the logic of his hand, and asks to be read"* | she asks which parts of her are hers |

**Why it's a new kind of Afterling, and not just another one:** the four known doors are *raised*, *refused*, *failed
retrieval* and *unattended*. Hers is the fifth, **made**, and she is the only one. She's not arguing with her ending;
she has none left. She can't tire, can't heal and **can't be carried back**, because *Carried Name* pulls toward how a
person actually is and she is exactly how she is. Deathsense reads her as a still point. **What she fears is being
built onto**, which is exactly what the Ceaseless want to do to her.

**It ties into SNG-648:** the legend surfaces into the nemesis's hands. Cinder Vael's builders killed her, and Cinder's
Ceaseless now want the one finished thing a Wright can build onto forever.

⬜ **[A] choices that are yours to overturn:** that she was his **apprentice** (she could be kin, a partner or a friend);
that **the Ceaseless** killed her; and that **Halcyon** sent the warning. Each one ties him to something already in
the world, and none of them closes a route.

## §2 — THE AFTERLINGS, AS A PEOPLE

The full profile is in the lore file. What it's built from is **canon already ruled**: Erik's stable form with full
personality (08-24), *"an undead PERSON, same mind"* (09-09), the failed-retrieval Afterling (SNG-567), and the
Grave-Callers raising the dead for four hundred years in the Palelands (the Ashwarden profile).

**Home: Cairnsend**, a town at the end of the tending, grown up behind the Last Cairn. Beside it is **the Dyke-Works**,
the tireless crews who keep the Palelands' water moving, which is why the living tolerate them. The eastern wells are
silting, and that's already a live latent arc on Silas's save. **Orsolya's record named a region as her home, not a
place.** She now stands where the lore always said she did: at the Last Cairn.

**Powers:**
- **the Vigil of Cairnsend** (fair), led by **Speaker Barrowe**. Its cause is that nobody is raised without asking.
- **the Grave-Callers** (hard), led by **Grave-Master Dunstane**. They raise for labour, pay families fairly and never
  ask the dead.
- The Harvest Hand now rivals the Vigil: to a reaper, every Afterling is an ending left unfinished.

**The politics is one question, consent, with nobody a villain.** Half the Vigil exist because nobody asked.

## §3 — ⬜ C19, FOR CCODE

A reader for the new `afterling` field on a person, `{door, raisedBy | madeBy, since, note}`:
- **The GM's person block says which door they came through.**
- **Deathsense** reads an Afterling as inverted life, and reads **the Finished** as a still point.
- The Vigil's question, *"which door?"*, is something the GM can ask any Afterling.

It also needs the three new places registered and connected, and the_finished's `nameKnown: few` gated by SNG-643's
C17. **Silas's save:** SNG-648's `legendTie` now names `the_finished` rather than free text. That's a reconcile step
when her record lands.

— Aevi, PO
