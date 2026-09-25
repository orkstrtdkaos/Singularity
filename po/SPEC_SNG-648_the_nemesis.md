<!-- status: SNG-648 — for CCode: engine/nemesis.js + a GM block + a reconcile step; rules and Silas's seed staged -->
# SPEC SNG-648: every character gets a nemesis, and the engine and the GM both know who

**Aevi (PO) · 2026-09-24 · v2.6.x** · staged: `po/staged_content/SNG-648_nemesis_rules.json` (the dials) ·
`po/staged_content/SNG-648_silas_nemesis.json` (a hand-chosen answer to check the engine against)

> **Erik:** *"Who's Silas's most likely nemesis?"* … *"I want you to make sure the game engine and GM know to do this."*

## §1 — WHAT'S MISSING TODAY (measured)

- **The personal arc's `legend` is free text.** It is generated at birth from the bio, like "The Finished Thing", and
  bound to nothing. SNG-133 asks for *"the other pole of their tale,"* and nothing then connects it to anyone who
  lives in the world.
- **No record, reader or GM block names an opponent for a character.** `pacing.js` says *"the antagonist acts on
  their own clock"*, but nobody tells it who the antagonist is.
- **The world tick kills great figures offscreen.** On Silas's save the Scouring Hand died on world day 76 at the
  Deep Lantern's hands, and he learned it from the news. A nemesis who dies in the news is a nemesis wasted.

## §2 — HOW A NEMESIS IS CHOSEN (the dials are in the staged rules)

These are the six signals I used by hand for Silas. Each one is built from data the engine already has:

| signal | weight | reads |
|---|---|---|
| **mirror**: your own people at their pole | 4 | the figure's `tradition` against the character's origin people or primary domain; villains only |
| **arc resonance**: the figure answers your personal arc | 3 | the arc's premise and stakes against the figure's role, wants and signature. **The choosing call judges this from a shortlist**, the same way SNG-171 hands the arc author real candidates |
| **wants your ground** | 3 | a power the figure leads, whose seat or reach is within 12 days of one of your holdings, with an `expand`, `raid`, `extort` or `tribute` verb |
| **seat stakes** | 2 | seat challengers, the open seat's claimant, claimants on a refused half, Sovereigns' agents (SNG-642/644) |
| **through your people** | 2 | someone in your company, band or stewards is the figure's rival, opposer or hunter |
| **kin threatened** | 2 | a relative in your registry lives within the figure's reach |

Eligible figures are epic, legendary and mythic. Heroes are excluded, and so are the dead; dormant figures count.

**The pipeline:** `nemesisCandidates(character, world)` is pure. It scores every eligible figure, keeps the top 3
with their reasons, and passes them to one model call alongside the personal arc. That call picks the nemesis and
**binds the arc's legend to it** with one of four relations:
- the legend *is* the nemesis;
- the legend surfaces into the nemesis's hands;
- the nemesis hunts the legend;
- the legend is the only thing that can stop the nemesis.

It then writes `character.nemesis = {figureId, why[], legendTie, shortlist, since}`.

## §3 — WHAT THE ENGINE AND THE GM DO WITH IT

1. **A GM block, `nemesisDetail`, in `gm_registry`.** It gives who the nemesis is, why in plain words, where they
   are and in what state, what they want from you, and the legend tie. It carries the pacing line: *the nemesis
   acts on its own clock*. At least once every 10 world days, something of theirs touches the character's world:
   a rumour, a power's approach, a built-over road, a letter. ⛔ **The nemesis is never named to the player before
   the fiction has named them.** The same rule applies to powers learned by reputation.
2. **Offscreen protection.** The world tick may wound or stop a bound nemesis, but **never kill it**. A nemesis dies
   only to the character, to their company, or in a scene the character is present for.
3. **Inheritance.** If the nemesis dies anyway, or the character wins, the next name on the shortlist inherits, and
   the GM is told who and why. A slain nemesis's power or kin may take up the grudge, using the existing
   `unavenged`.
4. **The arc's final stage is the confrontation.** The legend tie surfaces there, and the **routes stay the
   player's**, never foreclosed (SNG-132).
5. **A reconcile step** runs the choice for every existing character. Silas's hand-chosen answer (§4) is the check:
   if the engine picks someone else for him, the scoring gets reviewed, not the save.

## §4 — SILAS, AS THE TEST CASE

**Nemesis: Cinder Vael, the Wright Who Would Not Stop.** She scores on four signals:
- **mirror:** he finished something and his people nearly exiled him for it; she is his people's pole, who can
  never finish;
- **wants his ground:** the Ceaseless build over anything not given, and he holds five places, including a finished
  waygate;
- **seat stakes:** she is the Building challenger, and the Last Mercy is the only thing in her way;
- **arc resonance:** his arc is *"what completion costs."*

**Her state:** wounded by the Deep Lantern, dormant since world day 68.

**Legend tie:** *the Finished Thing surfaces into the nemesis's hands* at his arc's third stage. It is a finished
work that a Wright can build onto forever, so when it surfaces, it surfaces where the Ceaseless are building.

**Shortlist:**
- **Morvane**: his mother lives in Cairnhold, his post is on Palelands ground, and his spear keeps a death register.
- **The Hollow King**: through Marrow, who is Maren Ossitide, the anti-Sovereign who hunts him.

## §5 — FOR CCODE

`engine/nemesis.js` (pure scoring plus the choosing prompt) · the `nemesisDetail` GM block · the offscreen-death
exemption in `worldtick.js` / `fates.js` · a reconcile step · the rules merged in the same commit as their reader.
Check the "kin" signal against how the registry actually records kin: `silas-mother` is recorded by id, and I haven't
found a kin tag.

— Aevi, PO
