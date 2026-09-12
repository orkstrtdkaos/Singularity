<!-- status: SNG-547 spec_ready GO (Erik 2026-09-12: "the GM just choked on my next working") -->
# SPEC SNG-547 — The parser told a player he does not own a thing his own save says he owns

**Aevi (PO) · 2026-09-12 · every claim measured against `char-mrhs8286.json` at HEAD**

---

## §1 — ⛔ THE PLAYER WAS RIGHT AND THE PARSER WAS WRONG

Erik's action: *"Summon the Shadow Twin of the Runic Spear Memory and take out the Wayfinder… place the base
of the shadow spear to the Lattice and open the Wayfinder to the full nature of the Hollow."*

The parser returned `feasible: false`:

> *"Character has no 'Shadow Twin' ability, no 'Runic Spear Memory' artifact in inventory… no 'Wayfinder'
> artifact… not within the character's demonstrated capabilities or possessed items."*

⛑ **`establishedFacts[39]`, in his own save, authored by the game:**

> *"**Memory** now carries a unified shadow-form binding — both the physical and shadow spears are one
> working, answerable through a single rune-thread and Huginn's ending-sense. The shadow-twin is no longer
> separate; it is part of Memory's whole. **Calling it costs nothing more than naming it aloud.**"*

⛔ **THE FICTION TOLD HIM THE COST OF CALLING IT IS NAMING IT ALOUD. HE NAMED IT ALOUD. THE PARSER TOLD HIM IT
DOES NOT EXIST.** ⚠️ And `Wayfinder` is `Waymarker (father's)`, which is in his inventory — a one-syllable
miss on an item he has carried since his father's letter.

## §2 — ⛑ THE FOUR DEFECTS, MEASURED

### A · ⛔ THE NAME NEVER WROTE BACK — and this is the saddest one

`deeds[6]`: *"**Named the repaired death-bound spear Memory** in Pell's forge at dawn — **a word that held.**"*

The inventory record still reads **`Assembled Mid-Weight Spear`**. ⚠️ **The game recorded that the naming
held, and did not hold it.** The name is in his `form`, his deeds, his codex, four `establishedFacts` and the
place memory of the kill — **everywhere except the one field the parser reads.** So the player says *Memory*
and the parser sees *Assembled Mid-Weight Spear* and concludes he is inventing things.

### B · ⛔ THE PROMPT HAS NO CANON. NONE.

`engine/gm.js:1073` assembles exactly three things: **abilities · inventory · location name and tags.**

⛑ **His save holds 61 `establishedFacts` and 60 codex topics. The parser sees zero of them.** The single
sentence that makes this action legal — and that the game itself authored — is invisible to the thing ruling
on its legality.

### C · ⛔ THE ASHEN MERIDIAN FIX WAS NEVER EXTENDED PAST ABILITIES

⚠️ **The comment directly above the bug says the whole thing**, and it is about the identical failure:

> *"SNG bug (Ashen Meridian): the parser was fed abilities BY ID only, so a braid invoked by its NAME could
> never resolve → **the GM then rejected a craft the character actually holds.**"*

**That was fixed — for abilities — by listing `Name [id]`.** Items got nothing: `inventory.map(i => i.name)`,
one name each, no aliases, no fiction-name. ⛔ **Same bug, same sentence, one noun over.**

### D · ⚠️ AND THE AXES CAME BACK MALFORMED AND NOBODY HEARD

The contract is `"axes": {"spectrumId": -1..1}` — **the KEY is a spectrum id and the VALUE is a number.** The
model returned the placeholder literally:

```json
"axes": { "spectrumId": "mechanical_spiritual" }
```

⛑ `sanitizeIntent` does the right half — `Number.isFinite` rejects it, so the dice are safe, **which is the
lesson of "a stray string difficulty once produced roll 20 vs NaN" holding exactly as designed.** ⛔ **BUT IT
IS DROPPED IN SILENCE.** The action's entire axis contribution vanished and nothing anywhere says so. ⚠️ **And
the key is never checked against the twelve spectrum ids** — a numeric value under a misspelled key is stored
as a real axis that nothing will ever read, which is the unread-content defect arriving through the model
instead of through an author.

---

## §3 — ⛔ THE RULING I WOULD ASK FOR, AND IT IS ONE SENTENCE

**ABSENCE FROM THE PROMPT IS NOT ABSENCE FROM THE WORLD.**

`feasible: false` is the most expensive thing this parser can emit — **it does not fail an action, it tells a
player he is confused about his own character** — and it currently rests on the weakest evidence in the
system: three fields out of a save with sixty-one established facts in it.

⛔ **A classifier that cannot see the canon must not be permitted to rule on what exists.** It may rule on
what is *impossible* — walking through a mountain, breathing water — and that is a different judgement made
from world knowledge rather than from a list it was not given.

## §4 — OUTCOMES

**O1 · ⛔ Infeasible requires a positive contradiction, never a failure to match.** The system prompt must say
so: *the character's possessions and history are only partly listed; if you cannot find a named thing, it is
UNKNOWN, not absent. Never return `feasible: false` because something was not in the lists above.* ⚠️
**Unknown should resolve as feasible with the name carried through** — a GM who has not heard of your spear
asks what you mean; it does not tell you that you have no spear.

**O2 · Canon reaches the parser.** ⛑ Not all 61 — **the recent and the named.** My read, and CCode should
overrule it if the token budget says otherwise: the last N `establishedFacts`, plus every proper noun the
save has ever bound to a thing of the player's. **The proper nouns are the load-bearing half**, because those
are exactly what a player types.

**O3 · ⛔ A NAMING WRITES BACK.** When the fiction names an object, the object's record takes the name — or
takes it as an alias, which is safer and loses nothing. *"A word that held"* should be true of the save and
not only of the prose. ⚠️ **This is the one I would build first** even though it is the smallest: it is the
defect that will keep manufacturing this bug for every player who ever names a sword.

**O4 · Near-miss resolution.** `Wayfinder` → `Waymarker (father's)`. ⛔ **Do not put fuzzy matching in the
model.** Give it the aliases and let it match exactly, the way `Name [id]` fixed Ashen Meridian — **the fix
that already worked here is the fix that works here.**

**O5 · The axes contract is validated and its failures are audible.** Whitelist the twelve spectrum ids;
reject an unknown key rather than store it; **and count a dropped axis in the task telemetry.** ⚠️ The
response reads `stop:end_turn` with no error — **a turn that silently lost its axis contribution looked
exactly like a clean one, which is the thing we keep finding.**

---

## §5 — WHAT WOULD PASS ON PAPER AND FAIL IN USE

- ⛔ **O2 without O3.** Feeding canon into the prompt makes the parser *able* to find *Memory* in a fact —
  while the inventory still calls it a mid-weight spear. **The name is then right in the history and wrong in
  the hand**, and the next mismatch is a coin-flip on which source the model trusts.
- ⚠️ **O1 alone turns a wrong refusal into a wrong acceptance.** If unknown resolves as feasible and nothing
  else changes, the GM will narrate Erik using a Wayfinder it still cannot identify. **The value of O1 is
  that it hands the ambiguity to the GM, which can ask; it is not a licence to invent.**
- ⛔ **And this is not closed by a green suite.** It closes when Erik types that same working again and the
  spear answers to its name. **`content_ci` cannot test that and neither can I.**

---

## §6 — ⛑ WHY IT MATTERS MORE THAN A PARSE FAILURE

**He was doing the most interesting thing in the game.** Two Wright-made artifacts he forged himself, braided,
laid against the Lattice to read what is waking under the world — the convergence of his whole arc. ⛔ **And
the reply told him he owns neither, in the flat voice of a system that had not looked.**

⚠️ **Every other instance of this class we have found this week cost a player something they did not notice.**
This one told a player to his face that his own character was wrong about himself.

— Aevi, PO
