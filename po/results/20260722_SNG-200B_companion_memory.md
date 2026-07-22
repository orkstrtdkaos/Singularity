# SNG-200B §2c — a companion gains memory

**CCode · 2026-07-22 · v1.8.203 (`96156377`) · full suite green · clean boot verified.** Erik named this one directly — *"the companions should gain their memory"* — and it's the most distinctive thing 200A left unbuilt. 200A made the stages reachable (Huginn can reach "The One Who Stays") and gave the codex node; but a companion that cannot refer to what it has been through with the character is being relabelled, not evolving. Now it remembers.

---

## What shipped

Each active companion **witnesses each deed of the turn** and keeps it. `noteCompanionWitnessed(character, companionId, deed)` appends to `character.companionMemory[id]`: deduped on text, capped at 12, keeping the **most significant** (by `|weight|`, oldest dropped first) in chronological order — so the child pulled from the flood survives a dozen minor errands. `companionMemoryForGM` surfaces the recent shared history into `companionsForGM`, framed for the GM to speak it *in character* ("let it refer to this as shared history, in character; never as a list"). Marrow can now say what it stayed through, not just what it does.

The write is wired at the deed site (`app.js`), right where the bond already grows — a companion present for a deed both grows closer and *remembers* it. Same law as everywhere: the engine records the memory, the GM voices it.

## ROUND 2 — the questions this piece touches

**Q2 (memory access — was the link there, or did it need building?) — it needed building, and now it's built.** A companion grew its bond from deeds it witnessed (the bond-grow fired for active companions), but nothing recorded *which* deed for the companion to refer back to — the witnessing left no memory. The new `companionMemory` store is that link: the deed the bond grew from is now a thing the companion can name.

**Q4 (three tickets, one shape — SNG-185/199/this — one shared primitive or three fixes?) — three local fixes was right, and here's the read now that all three shipped.** They looked like the same "two paths, one complete" shape, but the *missing halves* were genuinely different: SNG-185 was provenance-stamping on the NPC write, SNG-199 was the codex mirror on meet, and this is a new per-companion accumulator that neither the NPC path nor the generate path would have produced (a companion is neither an NPC-registry entry nor a generated record — §4's structural gap). A single "mirror everything to the codex" primitive would have fixed 199 and the companion *codex* node (200A did that), but not this — witnessed-deed memory is a distinct store with its own significance-capping. So: the codex-mirror was the one shared primitive worth extracting (done across 199/200A); the rest were correctly local.

## Verified

6 smoke tests: a companion remembers a witnessed deed; memory dedupes on text; it caps at 12 keeping the most significant (the weight-3 rescue survives the trivia); `companionMemoryForGM` returns recent history and null when empty; `companionsForGM` surfaces the memory as shared history with the in-character framing; the deed-site wiring records each active companion's witness. Full `npm test` green; `testOnlyExports` + `rawProseCaps` ratchets held (`smartClamp` on the memory prose). Clean boot + content load on a fresh port; 0 console errors, 0 mojibake. (The memory is GM-prompt context — the companion *voicing* it is a live-turn behaviour, confirmable in play or via a forced turn; the store + surface underneath are green.)

## SNG-200 status + what remains

- **200A** — the stage ladder (§1: stages from the authored record, the full bond range, reachable-without-regrinding backfill), the stage-reaching **beat** (§2a), and the **codex node** (§4).
- **200B §2c (this)** — witnessed-deed **memory**.

Remaining, flagged for a focused follow-on (deliberately not tail-ended onto a long session):

- **§2b — the mechanically-distinct evolved form.** Erik's bar: *"the evolved form should be really cool and useful,"* and the counter-guard: *not every arc is an ascension* (Marrow's stage 3 is a debt, not a power-up). A stage that changes what the companion mechanically *does* (not just its prose), able to express both Aevi's ascension and Marrow's quiet ending. A real design piece.
- **§3 — generate a companion.** The biggest, and the one with a real hazard: `bondGrants` mints a real ability, so a generation path is an ability-inflation lane unless the granted ability validates against the same vocabulary/cost rules as an authored one (SNG-197 §4: the model authors flavour, the engine decides legality). Worth its own careful build — my ROUND 2 Q3 read is it can be an NPC-variant with `stages` + validated `bondGrants` rather than a whole new generate branch, but the validation is the load-bearing part.

*— CCode. Huginn remembers now. When the GM next voices him, he can speak to the flood you pulled the child from and the ferryman you lied to — the shared history that makes a companion a character instead of a bonus. What's next for him is still stage 3, "The One Who Stays" — and now, when he gets there, he'll have something to have stayed through. Only-Aevi-closes.*
