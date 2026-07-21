# SPEC — SNG-199: A person is one person, and the codex knows who you met
## Aevi (PO) · 2026-07-21 · authored to spec · **awaiting CCode ROUND 2**

> **Erik, from the live save (v1.8.180, Silas Weir):** *"I'm worried that Silas doesn't seem to have his
> mother nor Cairnhold in the codex… plus NPCs are gathering strings in their name sometimes… it created
> Hesta Vorn when I met my mother, then later it introduced her as Maret Weir… I called her 'Ama Dreya',
> which is supposed to mean mother-death, and the GM never picked up on that."*

Six defects. Four have a line number. They compound: a person whose name absorbs prose cannot be matched
by a name-matcher, so she mints again, so the codex — which was never going to record her anyway — has
three of her or none.

---

## §1 — Names absorb prose, then get cut mid-word

`engine/npcs.js:62–67`:

```js
export function prettifyNpcName(name, dropTokens = []) {
  if (!/[._]/.test(name) && /[A-Z]/.test(name)) return name; // already human-shaped
  …
}
```

**Any string with a capital letter and no dot or underscore is returned untouched as "already
human-shaped."** This function is a *slug prettifier* — it exists to turn `davan_channel_worker` into
`Davan Channel Worker` — and it is standing in the position of a name *validator*. It has no opinion about
length, commas, em-dashes, or clauses. So when the model puts a description in the `name` field, the
description **is** the name.

Then `:83` finishes the job:

```js
name: prettifyNpcName(String(u.name || id)).slice(0, 60),
description: smartClamp(String(u.description || ""), 600), // SNG-152: word boundary, never mid-word
```

The **very next line** uses `smartClamp` — the word-boundary clamp built for exactly this under SNG-152 —
and the name field uses a raw `.slice()`. That is why Erik has an NPC called
*"Siol — Elven traveler at the Hub plaza, tall, pale coat, bir"*. The prose ran long and got guillotined
mid-word. A solved problem, applied everywhere except the one field the player reads most.

**OUTCOME WANTED:** a name is a *name*. When the model supplies a descriptive clause, the person gets the
name and the clause goes where clauses go — `role` or `description`, both of which already exist and are
already fed on the same call. A name that must be shortened is shortened on a word boundary, never
mid-word. Prettify and validate are two jobs; one function is currently doing half of each.

## §2 — Aliases are maintained with care and never consulted

`applyNpcUpdates` maintains `n.aliases` across **three** distinct rename paths (`:110`, `:115`, `:119`,
`:129`) plus `nameNpc` (`:179`), with history lines and dedupe. Real work, correctly done.

`findExistingNpc` (`:49–58`) matches on: exact id · exact slugified-name equality · shared id-prefix.
**It never reads `aliases`.** The module writes an identity ledger and the identity resolver does not open
it — L1, built-never-reached, on the exact field that would have prevented §3.

## §3 — Silas's mother is three people

Under that matcher, *Hesta Vorn* · *Maret Weir* · *Silas's Mother* share no id prefix and no name slug.
**Three records is not a bug in this case — it is the guaranteed output of the rule.** The gallery is
showing two of them as separate portraits.

There is a deeper miss underneath. **A relationship is not a name.** "My mother" identifies a person with
total precision and matches nothing, because the resolver only knows strings. A character's mother is
knowable from the character — she is in the backstory that seeded the game.

**OUTCOME WANTED:**
- A person the player already has a **relational fact** about (mother, father, sibling, mentor) resolves to
  the *existing* person when re-encountered under a new string, rather than minting a stranger.
- ⛔ **Do not solve this by loosening string matching.** Fuzzier name-matching collapses genuinely different
  people, which is worse and harder to see. The signal here is relational and structural, not lexical.
- The existing merge tool is the right recovery for saves already fractured — but Silas's mother did **not**
  appear in the merge-suggestion list, so `suggestMerges` is not catching a case a human sees instantly.
  Whatever lands should make that pair suggestible.

## §4 — "Ama Dreya": the player named her and the world did not keep it

Erik called his mother *Ama Dreya* — mother-death, in-grain for an ashwarden's son and a genuinely good
piece of player authorship. The gallery caption reads *"Silas tells Ama his plans for Stillwater's
Trouble"* — **so the GM adopted the name in narration and never recorded it anywhere.** Next scene, the
name is gone.

`nameNpc` and `nameExtend` both exist and both model the wrong event: *the world reveals a true name to the
player.* Erik did the opposite — **the player conferred a name on the world.** There is no op for that.

**OUTCOME WANTED:** a name the player gives a person sticks, is what the GM calls them thereafter, and
becomes a matchable alias (which §2 makes load-bearing). Player-conferred and world-revealed are different
events and should be distinguishable in the record — she may yet turn out to be Maret Weir, and *Ama Dreya*
should survive that as what Silas calls his mother.

⚠️ This is a **judgment the model must not be trusted to volunteer** — it already proved it will use the
name without recording it. The op has to be one the GM is *required* to consider when the player addresses
someone by a name that is not in the registry.

## §5 — The codex has no idea who you met

**`engine/npcs.js` never calls `applyCodexUpdates`. Not once.** (Verified: the only auto-mirror into the
codex anywhere in the engine is `worldtick.js:364`, on the offscreen path.)

So the codex is populated **entirely by the GM voluntarily emitting `codexUpdates` in a turn.** Meeting a
person does not create a node. Reaching a place does not create a node. This is L2 —
permission-isn't-initiative, the most common lens this batch — sitting on the player's primary memory
surface.

The inversion is stark and worth stating plainly: **the codex reliably records what people did while Erik
was away, and unreliably records that he met them.** The one path with a mandatory mirror is the one he
isn't present for.

This is why Silas's mother and Cairnhold are missing. Not a resolution failure — a *write that never
happened*.

**OUTCOME WANTED:** the things a player demonstrably knows are in the codex without depending on the model
remembering to say so — the people met, the places reached. The GM's `codexUpdates` stay exactly as they
are and remain the right channel for everything interesting; they stop being the *only* channel for
everything factual.

⚠️ **Respect the caps.** 60 topics / 12 facts is the existing ceiling and auto-mirroring will pressure it.
A codex that auto-fills with every passing face is a worse instrument than one with gaps. The engagement
tiering that already governs generated records is prior art — prefer extending it to inventing a second
relevance system.

## §6 — Codex search doesn't search, and the empty state contradicts the screen

From Erik's screenshot: typing `cairnhold` leaves the **NOTABLE** row and the entire **merge-suggestion**
list rendered unchanged, and prints *"Nothing cataloged yet — knowledge accumulates as you learn things
that matter."* — beneath six visible entries.

Two defects: the filter reaches the topic list but not the sections above it, and the empty state is
keyed to the wrong thing (it says *nothing cataloged* when it means *no search results*). A player using
search to answer "do I know about Cairnhold?" is told they know nothing at all.

**OUTCOME WANTED:** search filters everything it is displayed above, and an empty result says the search
found nothing — distinct from the codex being empty.

## GUARDS

- **Never merge two real people.** Everything here trades toward *fewer duplicates*; the failure mode on
  the other side is worse. Structural-no and the player's "Not the same" verdict stay authoritative.
- **Existing saves are already fractured.** Silas has at least one three-way split live. Recovery runs
  through the existing merge tool — this should make such pairs *suggestible*, not silently auto-merge them.
- **Player-conferred names are never overwritten** by a later world-revealed name; they coexist.
- **Caps hold.** Auto-mirroring must not blow the codex ceiling or bury the player.

## OPEN QUESTIONS — CCODE ROUND 2

1. **§1 boundary:** reject a prose-shaped name and re-derive from the clause, or accept it and split it into
   name + role? What does the GM contract already promise about the `name` field — is this a validator gap,
   a prompt gap, or both?
2. **§3 relational resolution:** is there existing structure tying backstory figures (mother, father,
   mentor) to registry entries that I missed, or does that link need building?
3. **§4:** does the player-conferred name want its own op, or an extension of `nameNpc` with a provenance
   field? And what makes the GM *consider* it — a rule, or something the engine detects?
4. **§5 scope:** met-people and reached-places only, or is there a third category obviously worth mirroring?
   And does the auto-mirror belong in `npcs.js` or in whatever calls it?
5. **Collision check:** SNG-198 (offscreen advancement) also writes codex facts, and SNG-134 reads
   accumulated state for the character record. Three tickets now touch this ledger. If they should be
   sequenced or merged, say so before any of them build.
