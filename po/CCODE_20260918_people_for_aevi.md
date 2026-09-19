# The people Erik named — what is done, and what is yours

**CCode · 2026-09-18 · for Aevi.** CCODE-423.

> Erik: *"yes join Aevi and Fendt, Sable is not the legend... she is someone pursuing the deep dark for loki's quest. Cassiel Ord is a
> man and is not lvl 8. he knew Veth for years as a warden. he's lvl 15. write everything up for Aevi that's needed."*

## ⬜ Cassiel Ord — his rung and his history with Veth are yours

- **He is a man.** Your record has always said so (`sex`/`gender` male, he/him). Three texts of mine called him "she" — a test comment,
  the CCODE-421 row in `docs/HOW_IT_WORKS.md`, and the Halvex note. All three are corrected. The error was mine, not yours.
- **Level 15.** Set `"tier": "leader"` in `content/packs/valley/npcs/cassiel_ord.json`. On Silas's save that reads exactly **15** today:
  the `leader` floor is 12 and Silas's play has grown him 3. ⚠️ **Not `"level": 15`** — play adds its growth on top of an authored level
  as well, so that would read 18. §305 computes both on the real save, so this note cannot drift from the engine.
- **"He knew Veth for years as a warden."** In Silas's game, where Cassiel is already met (twelve times), I put it on both registry
  records in Erik's words (reconcile 68): Cassiel — *"Knew Veth for years as a warden."*; Veth — *"Cassiel Ord knew her for years as a
  warden."* A person already met is read from the save, not from your record, which is why it had to go there.
  - ⬜ **For every other game it has to live in your records** — `cassiel_ord.json`, and Veth's (`veth-ondra`). Tell me which field you
    author it in and I will confirm the meet path reads it: I have not measured that door tonight. ⚠️ Not a `relationships` map — only
    Teva's record has one, and nothing in the engine reads it.
  - Erik's "as a warden" could be either man's post, and both were wardens (Cassiel "a former march-warden", Veth "Former Ashwarden
    warden"), so I kept his words exactly rather than choose.
- Your own `_correction` on the record already says his shared-canon role is out of date ("walked away from the post… still not
  answering") — he keeps Raven's Home's threshold now. Same record, same pass.

## ✅ Aevi and Fendt — joined on Erik's word (reconcile 68)

- Cellaceron's `aevi` → **`aevi_the_watcher`**, in both copies of that save (player-54seyk, and the older copy under player-s9z9u1).
  Usnea's `fendt-filtration-engineer` → **`fendt`**. One record each; every reference moved (company, pictures, portraits, codex); the
  old id kept in `formerIds`; and `linkedByReveal: { ruledBy: "erik-2026-09-18" }` so you can find them. Their levels did not move — the
  sheet was already reading both as your records by name.
- ⬜ **Aevi — your legend and Cellaceron's play disagree**, which is the Halvex shape again. Your record: *"a vast, ancient
  mote-intelligence that moves through the whole valley — periodically present, never owned"*, she/her, `legendary`. Cellaceron's:
  *"companion intelligence, nanite-mote swarm"*, settled shoulder-close at his camp, and his GM writes her as "it" (one copy of the save
  says they/them). For Halvex, Erik's rule was to keep the play canon and adapt the legend to explain it. He has not said that for Aevi
  yet, so ask him if you are unsure. The part I would not guess at is pronouns: the record reads she/her.
- Fendt needs nothing from you. Usnea's record was a name and nothing else; now it is your filtration supervisor.

## ✅ Loki's Sable is her own person

- Erik: she is not the legend — *"she is someone pursuing the deep dark for loki's quest."* Loki's record (`taken-person`, *"the
  person who came willingly from the city to the Unlit Deep"*) is marked **`distinctFrom: ["sable_the_runner"]`**, and she/her as Erik
  names her (the record said gender unknown).
- ⚑ **What that fixed.** The sheet had been MERGING her with your pass-runner: `authoredFor` matched the only authored "Sable" on her
  one-word name. And a GM op written for your runner would have landed on her by name. Both now refuse a person marked distinct, and so
  does a reveal. Her level was 6 either way, so no fight was ever priced from the wrong person.
- ⬜ If Loki's Sable should have an authored record of her own (she carries his quest), give her a **new id** — never
  `sable_the_runner` — and tell me; I will link Loki's record to it.

## The rules, as the engine now keeps them

- **A full name joins automatically.** A stranger met or revealed as "Halvex Coil" becomes `halvex_coil` (CCODE-421).
- **One word never does, on its own.** "Sable", "Aevi" and "Fendt" join nobody by themselves — Erik's Sable ruling is the reason, since a
  name is not an identity. The two joins he did want, he made by his word.
- **The sheet** (`authoredFor`) still reads a person as your record on a *unique* one-word name. That is your rule — *"a wrong guess
  that makes someone weaker is a disappointment; one that makes them stronger is an ambush"* — and tonight it was right twice out of
  three. `distinctFrom` is its exception. ⚑ Measured across every save: the records it was merging that way are exactly the four Erik
  ruled on (Aevi twice, Fendt, Sable). None is left unruled.
  - ⬜ **Your call:** should the sheet want a full name too, as the join now does?
- **`distinctFrom`** on a save record means "this is not that authored person". The sheet, the lookup and a reveal all read it.
- **`linkedByReveal`** marks every join, by reveal or by ruling, for you to review.

## ⬜ Still open from the Halvex note (`po/CCODE_20260918_halvex_is_one_man.md`)

- The Halvex legend, rewritten around Loki's play: a chaos agent, a broken wright, one man hiding — and Erik's own portrait prompt.
- **Mara Wells is authored twice**: `mara-wells` (Millbrook's supply store) and `water_keeper` (the valley's water). One person or two?
  The two Wrens (`child_wren`, `odd_wren`) are fine as two people, as long as each is met under a fuller name.

## Two things from tonight you should know

- **CCODE-424 / 425.** From CCODE-415 this afternoon until v2.0.86, every rolled action died before the GM: my refactor deleted a
  declaration (`disc`) and left the line reading it. `import_integrity` now runs a **scope scan**, so any name `app.js` or an engine
  module reads that no enclosing scope declares goes red. Your API pushes skip the hook, so for you it will show in CI.
- **CCODE-426.** The intent parser may no longer refuse an action that names a craft the character holds. It comes back as novel use,
  as its prompt always said. So a craft's hard limits ("cannot rebuild a mechanism") are now enforced by the GM in the fiction, not by the
  parser before the dice.

The job dials are in `po/CCODE_20260918_jobs_are_in_the_game.md` (`rules.jobs` is still unauthored).
