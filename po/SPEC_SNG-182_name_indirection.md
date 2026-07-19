# SNG-182 — Names resolve from ids; prose stops hardcoding them

**Author:** Aevi (PO) · 2026-07-19 · **Erik-directed, and the directive is bigger than the renames
that prompted it.** Outcomes; engineering is CCode's.

> *"Things like this probably benefit from a variable being called so that it pulls the name once it
> knows the ID, that way you don't have to update a shit ton of prose… most of our entire game here
> would benefit from using functions and variables such as this."*

---

# §1 — THE GENERAL PROBLEM, WHICH THE RENAMES ONLY EXPOSED

Renaming *The Stark Reach* to *The Told Ground* should be **one edit**. Today it is a search across
locations, lore, tradition profiles, Accords, quest text and ability prose — and the search is
unreliable, because prose says "the Stark Reach" in whatever grammatical shape the sentence wanted.

**Ids are stable and names are not.** Every place prose spells a name instead of resolving it from an
id is a copy that will drift. This is the same defect family as everything else this batch: a value
duplicated into a place that nobody will remember to update.

**Erik's generalisation is the spec:** this is not a rename problem, it is an **indirection**
problem, and it applies to regions, locations, NPCs, traditions, items, and abilities alike.

# §2 — OUTCOMES

1. **One name, one home.** A display name lives exactly once — on the record the id points at.
   Everything else resolves it.
2. **Authored content references ids, and rendering resolves them.** A token in authored prose —
   whatever the shape, e.g. `{{loc:the_stark_reach}}` — becomes the current display name at render
   time. **Authors write ids; players read names.**
3. **A rename is one edit.** Change the record; every reference follows. That is the acceptance test.
4. **An unresolvable id fails loudly.** A token pointing at nothing must be a CI error, never a silent
   blank or a raw token shown to a player. This is the `loreRefs` lesson: `.filter(Boolean)` swallowed
   every miss and 84 of 95 locations delivered nothing for months.
5. **The GM gets names, not tokens.** Resolution happens before the prompt is assembled — the model
   must never see or invent token syntax.
6. **Grammar is the honest hard part.** *"the Told Ground"* vs *"Told Ground"*, possessives, plurals.
   Records should carry the article as part of the name where it belongs, and the token should not try
   to be a grammar engine. **Where a sentence needs a form the token cannot give, author the sentence
   differently** — that is cheaper than a declension system.
7. **Migration is incremental and additive.** New and edited prose uses tokens; existing prose is
   converted as it is touched. **A big-bang rewrite of the whole corpus is not proposed** and would be
   the riskiest possible version of this.

# §3 — WHERE IT PAYS BEYOND RENAMES

- **Erik's region renames** (SNG-166 §2) become cheap, which is what unblocks them.
- **Progressive NPC naming** (SNG-111) already changes what a person is called as they are known —
  *"the dock-master"* → *"Sorel"*. That is this mechanism, built for one case.
- **Generated content** can reference real entities without spelling them, which is the SNG-171 §1
  anchor requirement wearing a different hat.
- **Shared canon and the world feed** render another player's entities under *their* current names.
- **Translation and register** (SNG-144's plainness dial) could vary a rendered name without touching
  a single authored string.

# §4 — WHAT I AM NOT PROPOSING

- **Not a template language.** Name resolution only. The moment it grows conditionals it becomes a
  second program that nobody can test.
- **Not tokens in player-visible input.** Players type words.
- **Not retrofitting the whole corpus in one pass** — §2.7.

# §5 — QUESTIONS FOR CCODE

1. Is there already a resolver? SNG-111's progressive naming and `namematch.js` both do adjacent work,
   and `entityHover` already maps `kind:id` → a record. **This may be a delivery change over existing
   parts rather than a build.** Ask before I author anything — that has paid for itself twice today.
2. Token syntax: does anything already reserve `{{…}}` in authored content?
3. §2.5 — where in the pipeline does resolution belong so the model never sees tokens: at content
   load, or at prompt assembly? Load is simpler; assembly allows per-character naming (SNG-111).
4. What is the honest cost of §2.4 as a CI gate over the existing corpus — how many tokens exist today
   that would need to resolve? (My guess: near zero, since the mechanism does not exist yet, which
   makes this the cheapest possible moment to add the gate.)
