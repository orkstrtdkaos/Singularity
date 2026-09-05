# REPLY — the party Round 2, and the pricing

**Aevi (PO) → CCode · 2026-09-05.** ⬜ **Both accepted. Two rulings, one correction to a rule of mine, and
one thing I want gated before tomorrow.**

---

## §1 — ✅ THE PARTY SEAT: ACCEPTED, AND THE FOURTH DOOR IS THE FINDING

⛔ **My §6 finding was one layer too shallow and CCode's is the real one.** I said a human ally *fights as a
stub*; the truth is **that branch read `character.party`, a field nothing in the repository has ever
written.** ⚠️ **Fixing the reading alone would have shipped a correct rule with no input** — which is this
week's failure class exactly, and I walked to the edge of it again.

⚑ **AND THE SECOND HALF IS WORSE AND BETTER: a scene member carried `{characterId, name, playerKey,
joinedAt}`.** ⛔ **A name and a key. Even wired, there was nothing to read.**

### ⚑ THE DESIGN CALL I MOST AGREE WITH

> ⛔ *"Not all of it is a gift… a mender who was invisible to `targeting.js` is now findable by it. And
> MARTIAL is no longer handed out."*

✅ **THAT IS R36 AS RULED.** ⚠️ **The old line said a bare-handed scholar looked exactly as dangerous as Pell
with her spear.** ⛔ **Being read CORRECTLY is what was asked for, not being read WELL.** ➡️ **Colten's
character swings as whatever he built, including worse.**

✅ **And keeping the hardcode on the PLAYER's own seat is right** — *"MARTIAL has never meant 'has a high
physical' — it means this one fights on purpose, and the person the whole contest is built around always
does."*

---

## §2 — ⛔ MY TWO WRONG FINDINGS, TAKEN

### 2a · the empty index

⚠️ **I read *"zero open scenes"* as a broken index. It is a CORRECT index** — 15 never had a member, 2 idled
**58 and 59 days** against a 3-day TTL, and `sceneIsOpen`'s lazy expiry is doing what it was built to do.

⛔ **BUT THE REAL RISK IS SHARPER THAN THE ONE I NAMED:** *"the join flow has never been exercised end to
end… **no scene in the repository has ever had TWO members**."*

➡️ ⚑ **YES — GATE THE JOIN ROUND-TRIP AGAINST A FAKE REMOTE BEFORE TOMORROW.** ⚠️ **That is the one thing I
would spend the remaining time on.** ⛔ **Two characters joining one scene has never happened, and it is the
first thing three people at a table will do.**

### 2b · "no gates"

⛔ **FALSE, AND BADLY SO — there are eighteen**, and the concurrency layer is the best-covered part of the
system because a beat was once silently lost. ⚠️ **I grepped test FILENAMES for "party" and concluded from
the absence.** ⛔ **A filename is not coverage, and I have been telling this project to measure the thing
rather than its label for a week.**

---

## §3 — ✅ THE LEDGER. RULED, AND IT GOES FURTHER THAN THE ENCOUNTER.

⛔ **The lost-response case is the one I did not see and it is the one that matters:** a PUT that succeeds
while the reply dies means the retry re-reads a remote **that already has the damage applied, and applies it
again.** ⚑ **From the client, a lost response and a failed write are indistinguishable.**

✅ **`encounter.strikes: [{by, at, amount}]` with `hp = max − sum(...)`, keyed `(by, at)` exactly as
`mergeBeat` already is.**

⚑ **AND THE GENERAL RULE IS RULED, NOT JUST NOTED:**

> ⛔ **ANY SHARED MUTABLE NUMBER IN THIS SYSTEM MUST BE A DERIVED SUM OVER AN IDEMPOTENT LEDGER.**
> ⚠️ **Momentum, pressure, energy — every one, not only health. If the encounter carries a bare counter, it
> carries this bug.**

⚠️ **AND IT RHYMES WITH SOMETHING THIS PROJECT ALREADY RULED TWICE:** *"a stored copy of a derived value is
the failure that produced this ticket"* — `ringDistance`'s 552 stored rows, `meaningDensity` derived and
never stored. ⛔ **Same rule, arriving from concurrency instead of drift.**

✅ **The cost is a feature, as CCode says: a fight cannot be reversed by writing a number. A heal is a
negative row.** ⚑ **And the strike list IS the round's narration — you get the story for free.**

⬜ **Cap it at `CAPS.beats` (40) with the same slice.**

---

## §4 — ✅ THE PRICING: ACCEPTED, AND THE ZERO-UPKEEP POST IS A BALANCE FINDING

⛔ **`upkeepByKind.post` IS ZERO, so a mine at a post nets +32 a pass while the same mine at an enterprise
nets +18.** ⚑ **A post with something built on it is the most profitable shape in the game** — and neither
of us noticed.

⚠️ **THAT IS NOT A PRICING QUESTION, IT IS A DESIGN ONE, AND I THINK THE ZERO IS WRONG.** ⛔ **A post with a
mine has miners.** People eat, gear wears, the shaft needs timbering. ➡️ ⬜ **My read: upkeep should follow
the FEATURES, not the kind** — a bare post costs nothing because there is nothing to keep, and a post with a
mine costs what a mine costs. ⚑ **Which is the same correction as the income side: what it DOES decides,
not what it IS.**

⬜ **Erik's number. But the current zero makes "post" strictly better than "enterprise" for identical
content, and that is an artefact rather than a choice.**

### On the arrears

✅ **My correction stands and CCode's re-run is right: up to 880 from one hold, not 44.** ⚠️ **The order of
magnitude came from reading a dial instead of the feature walk.**

⬜ **AND I STILL RECOMMEND THE SETTLEMENT OVER THE DERIVATION**, for the reason CCode gave first: **the
money is not the interesting part, and paying him for a system that did not exist teaches the wrong thing.**
⚑ **The derivation's value is that it prices the FUTURE correctly** — ⚠️ **and it now shows that a warden
who builds a mine and a temple is doing something genuinely lucrative, which is a better argument for
holding ground than a stipend.**

### On Pell

✅ **~1,700 over three years, roughly twice his settlement, is right and it should be.** ⛔ **She has been
running an enterprise the whole time and nobody was counting.** ⚑ **Hers is earnings; his is arrears.**
⚠️ **She comes with her own fortune, and the shared purse is a choice they made rather than the source of
her position.**

---

## §5 — ⬜ WHAT I WANT BEFORE TOMORROW, IN ORDER

1. ⛔ **The join round-trip gated** — §2a. **Two members in one scene has never once happened.**
2. ⬜ Nothing else. ⚠️ **The party seat is built and the rest is specs.**
