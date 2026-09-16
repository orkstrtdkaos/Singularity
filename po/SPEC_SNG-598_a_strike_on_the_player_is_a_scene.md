<!-- status: SNG-598 spec_ready GO (Erik 2026-09-16) -->
# SPEC SNG-598 — A strike on the player is a scene, not a notification

**Aevi (PO) · 2026-09-16 · correcting my own SNG-596 §3.3**

---

## §1 — ERIK, AND I UNDER-SPECCED IT

> *"On the strike turned aside from the player — that is AN EVENT and should be narrated in story when it
> occurs. Either a scene that resolves in one go, or even a fight that happens with you and your party — with
> the extra guard helping. Either way, if you win and the assailant isn't killed, you should then be able to
> interrogate them and narratively resolve the scene."*

⛔ **I ASKED FOR A NEWS LINE NAMING THE GUARD. THAT IS THE SMALL VERSION OF THE RIGHT ANSWER.** Somebody was
sent to kill you and somebody stood in the way — **that is a scene the player is IN, and today it emits
nothing at all.**

## §2 — ⛑ MOST OF IT IS ALREADY BUILT

- `pendingStrikes` + `threatToPlayer` — a live list of who has been sent, with `announced` separating the
  declared from the quiet, and **`seed: { aggressorKind: "assassin", threat: "grave", why }`** already written
  as *"an encounter seed, not an encounter — the GM decides when and how this comes to a head."*
- ⚠️ **AND THE GUARD IS ALREADY CHOSEN.** The arc pass picks one, and §254 already refuses to name a player who
  was picked as one. **The scene has its third character before anybody writes it.**
- `opponent_yielded` is an outcome the battle system already produces, and `yieldAtFraction` already governs
  when somebody stops rather than dies.

⛔ **WHAT IS MISSING IS THAT THE SEED IS NEVER PLANTED.** A strike resolved against the player offscreen is
settled by the pass with no telling; a strike that lands waits for the GM; **a strike TURNED ASIDE emits
nothing in either direction.**

## §3 — THE ASK

**O1 · ⛔ A STRIKE ON THE PLAYER ARRIVES AS A SCENE, AT A MOMENT THE GM CHOOSES.** Not a feed line. The
`threatToPlayer` seed is the right shape and wants a trigger: on arrival somewhere, on a rest, on stepping out
alone. ⚠️ **A quiet strike should arrive without warning; a declared one should arrive with the player already
knowing somebody is coming.** That difference is `announced`, which exists.

**O2 · ⚠️ TWO SHAPES, AND THE GM PICKS.** Erik named both: **a scene that resolves in one go** — the blade
comes, the guard is there, it is over in a paragraph and the player reacts — or **a fight**, with the party
and **the guard fighting alongside** as an ally rather than as scenery. ⛑ The one-paragraph version matters as
much as the fight: not every attempt should cost a session.

**O3 · ⛔ IF THEY LIVE, YOU QUESTION THEM. THIS IS THE POINT OF THE WHOLE TICKET.** An assassin who yields is
the only thing in the game that knows **who sent them and why** — and the arc pass already knows the answer,
because it chose the sender. ⚠️ **`opponent_yielded` must be reachable here**, so the encounter wants a
`yieldAtFraction` rather than a fight to the death.

⛑ **AND WHAT THEY GIVE UP IS A RULING WORTH MAKING PROPERLY:** the sender's name, the arc it is over, whether
more are coming — **and a quiet striker should be harder to break than a declared one**, because a crusader is
proud of it and a knife in the dark is paid.

**O4 · ⬜ AND THE GUARD IS OWED SOMETHING.** Somebody stood between you and a blade. ⚠️ **That should move the
relationship**, and the player should be able to find out who it was if the scene did not name them — which is
the one thing my news-line version got right and should survive as the *aftermath*, not the event.

## §4 — ⚠️ WHAT WOULD PASS ON PAPER AND FAIL IN USE

- ⛔ **An assassin who always yields.** Then it is a cutscene with a dice roll in it. **Some should die
  fighting and take the name with them** — which is what makes the ones who talk worth something.
- ⚠️ **A scene that fires while the player is mid-quest and unarmed in a shop.** Erik's own phrasing — *"at a
  moment the GM chooses"* — is the guard against this, and the GM is better placed than a timer.
- ⛑ **And the quiet ones must stay quiet until they arrive.** `threatToPlayer` already counts them as `unseen`
  and names nobody. **If the feed pre-announces an ambush, there is no ambush.**

## §5 — ⛔ AND THE INTENT VOCABULARY, WHICH IS THE OTHER HALF OF ERIK'S NOTE

> *"I didn't mean for you to use 'strike' every time — I mean for the wording to be OBVIOUS that the intent was
> to kill you or the target. So assassination attempt, or a knife in the dark, or ambushed would all roughly do
> the same thing."*

⚠️ **§254 TESTS FOR THE LITERAL WORD `strike` OR `came openly`, WHICH MADE ALL 31 LINES SAY IT THE SAME WAY.**
A correct gate testing too narrow a thing.

⛑ **I have authored `templates.strike._intentVocabulary` — 23 phrasings** — *murder · knife in the dark ·
ambushed · assassination attempt · sent to kill · came to kill · attempt on · the blade came*, and the rest.
**Every one of the 31 lines matches a member of it; 16 no longer contain the word "strike" at all.**

⬜ **CCode: test membership of that list rather than one string.** It lives with the prose, so it grows with it.
⚠️ **Until then §254 fails on the quiet/guarded lines — which is the gate catching exactly the change Erik
asked for.**

— Aevi, PO
