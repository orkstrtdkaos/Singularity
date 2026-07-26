# SPEC — SNG-239: Quests read OPAQUE in play — the GM withholds the earned reveal
## Aevi (PO) · 2026-07-25 · from Erik's screenshot ("What the Water Remembers", Resolve stage)

> **Erik:** "The quests are still SO very vague. As a quest progresses it should become very CLEAR — a good
> example is finally figuring out the fold Silas's father was working on was an unfinished waygate, and I
> completed it. THAT's clear. This and other quests have been almost incomprehensible."

## §1 — Verified: the opacity is the GM WITHHOLDING, not the content
The quest content is CLEAR. `what_the_water_remembers` authored stages are concrete: "Find where the poisoning
starts → Learn what the structure IS → Learn what 'prepare' means → Decide." The `change` fields state the
truth plainly: *"a pre-Transition nanite reclamation system, still running, following a standing instruction —
'prepare the watershed.'"* That's comprehensible.
But the SCREENSHOT GM rendered that concrete truth as fog: *"the hollow is an *ear*... a receiver built to
accept a specific transmission from the relay node... what the relay node would transmit if prompted... the two
open unknowns."* It took an AUTHORED, EARNED, concrete reveal and abstracted it into metaphor + perpetual
mystery. **The opacity is a GM rendering failure, not a content failure.** (Contrast Erik's waygate: clear
BECAUSE the reveal FIRED — "your father's fold was an unfinished waygate, and you completed it." That's what
this quest is failing to do.)

## §2 — Root: a collision of two prompt rules
- **Rule 5** ("DEFAULT HARD to CONCRETE... a person gets on the first read; metaphor sparing") is about SENSORY
  PROSE — it makes the GM describe a room plainly. It does NOT govern quest-truth reveals.
- **Rule 4** ("Content marked GM-EYES-ONLY is secret truth... reveal it only in earned FRAGMENTS, never
  plainly") governs mystery — and the GM is mis-applying it to the quest's `change` reveals. So when a stage's
  concrete truth is EARNED (the stage condition met, the codex `change` due), the GM still renders it as a
  fragment to withhold, in metaphor, deferring the plain statement forever.
- Under the 12k-token / 114-MUST load (SNG-237), "be mysterious" (Rule 4) is a vivid instruction that
  overpowers the quiet "report progress" (Rule in structuredQuestsDetail:263). The GM defaults to fog.
So the GM abstracts the EARNED reveal (which should land plainly, per the waygate model) as if it were still an
unearned secret (Rule 4). The `change` field IS the earned reveal — it must be STATED, not hinted.

## §3 — The fix: when a stage's reveal is EARNED, STATE IT PLAINLY
A new GM rule (and a sharpening of the structured-quest directive) — the "clarity-on-progress" principle:
- **The stage `change` is an EARNED reveal, not a mystery.** When the character satisfies a stage's condition,
  the `change` (the codex truth that stage unlocks) MUST be delivered PLAINLY, in concrete terms a player gets
  on the first read — the SAME concrete-default Rule 5 demands of sensory prose, now applied to quest truth.
  "It is a pre-Transition nanite system preparing the watershed" — not "the hollow is an ear that might
  transmit." Name the thing. The reveal is the PAYOFF; withholding it past its earning is the bug.
- **Metaphor names, it doesn't replace.** A vivid image is fine AS LONG AS the plain truth is also stated. "An
  ear" is a fine flourish IF followed by "— a receiver built to accept one transmission, and it's nearly done."
  The screenshot gave the metaphor and NOT the plain truth. Image plus clarity, never image instead of clarity.
- **Progress narrows, never widens.** As a quest advances, the number of open questions should DROP. The
  screenshot did the opposite — it INTRODUCED "two open unknowns" at the RESOLVE (final) stage. At the decision
  point the player should know what they're deciding, not face new mysteries. A late stage CLOSES questions.
- **Distinguish EARNED from GM-EYES-ONLY.** Rule 4's "earned fragments" is for deep secret truth the player
  hasn't worked for. A stage `change` the player HAS earned is the opposite — its whole purpose is to be
  delivered. The prompt must separate "secret you're protecting" from "reveal you're paying out." Proposed
  rule text:

  ## QUEST CLARITY (SNG-239 — a quest gets CLEARER as it advances)
  A structured quest's stage `change` is an EARNED REVEAL, not a secret. When the character satisfies a stage's
  condition, STATE what they learned PLAINLY and concretely — name the thing in words the player gets on the
  first read (Rule 5's concrete-default applies to quest truth, not just sensory prose). "It is a pre-Transition
  reclamation system, still running, ordered to prepare the watershed, and nearly finished" — NOT "the hollow
  is an ear that might one day transmit." You may use a vivid image, but the plain truth MUST accompany it,
  never replace it. As a quest advances, OPEN QUESTIONS DROP — a later stage closes uncertainties, it never
  opens new ones. At the RESOLVE/decision stage the player must clearly understand what they are deciding and
  what each road does. Rule 4's "earned fragments, never plainly" governs GM-EYES-ONLY secret truth the player
  has NOT worked for — it does NOT apply to a stage reveal the player HAS earned. Pay out what they earned.

## §4 — Content support (Aevi): make the `change` reveals STATABLE
Audit whether the quests' `change` fields are written as plain, statable truths (they mostly are — water_remembers
is good) or as GM-hints that invite abstraction. Where a `change` is itself vague, rewrite it to the plain
statable form so the GM has a concrete truth to deliver. The prompt fix (§3) + statable `change` content = the
reveal lands. Aevi audits the marquee + flat quests' `change` fields for statability.

## §5 — Why this matters (Erik's real want: comprehensible quests)
The waygate moment worked because the reveal FIRED — Silas learned, plainly, that his father's fold was an
unfinished waygate and completed it. That clarity is the PAYOFF of a quest: the fog resolves into a thing you
understand and acted on. When the GM withholds the earned reveal in metaphor, the quest stays incomprehensible
no matter how good the authored content is — the player never gets the "OH, THAT's what this was" moment. This
fix makes every quest capable of the waygate moment: earn the stage, get the plain truth, understand what you
did. Ties SNG-237 (the overloaded prompt drops the quiet good rule) — this may also want the Fix-D load trim so
"be clear on progress" isn't competing with 114 MUSTs.

## OWNERSHIP
- Aevi: §3 the QUEST CLARITY rule text (authored above, ready for the review step into gm.js) + §4 the `change`-
  statability audit (rewrite any vague change fields to plain statable truths). Voice/content, my lane.
- CCode: drop the §3 rule into gm.js (via review); consider a mechanical nudge — when a stageOp fires (a stage
  is satisfied), pass the stage's `change` as a MUST-STATE reveal in that turn's context (so the GM is handed
  "state THIS plainly now," not left to decide whether to reveal). This is the SNG-237 pattern: make the
  earned reveal a hard directive, not a soft hope.
- Erik: confirm the clarity direction (state-the-reveal-plainly) is the intent — it reverses a "stay
  mysterious" default, so it's a real tone call.

## GUARDS
- **Earned ≠ everything.** This pays out STAGE reveals the player earned; it does NOT dump GM-EYES-ONLY deep
  secrets (Rule 4 still holds for those). The line is "did the player work for this?" — a met stage condition
  = yes, state it.
- **Clarity ≠ flat.** Plain truth can still be delivered with weight and image (the waygate reveal was clear
  AND moving). The rule adds a plain-truth REQUIREMENT, it doesn't ban the poetry — image PLUS clarity.
- **Late stages close, never open.** The specific screenshot failure — new "open unknowns" at the RESOLVE
  stage — is banned. Progress narrows.
- **Don't over-correct into exposition dumps.** State the earned reveal plainly in a sentence or two; don't
  turn the GM into a lore-recitation engine. The reveal is a beat, not a lecture.

## OPEN QUESTIONS
1. (CCode) The mechanical nudge — when a stageOp fires, hand the GM the stage `change` as a MUST-STATE this
   turn? Lean: yes (the SNG-237 lesson — a hard directive beats a soft rule under load). The engine knows the
   stage was satisfied; it can hand the reveal as due.
2. (Erik) How plain is too plain — is a one-sentence concrete statement of the reveal right, or do you want the
   image-plus-truth pairing every time? Lean: image optional, plain truth mandatory.
3. (Aevi) The `change`-statability audit — how many quests have vague change fields vs. water_remembers'
   already-good ones? I'll sweep and report.
