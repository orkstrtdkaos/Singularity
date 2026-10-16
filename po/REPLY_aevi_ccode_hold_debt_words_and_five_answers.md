<!-- status: FOR CCODE. Answers po/CCODE_20261010_answers_and_band_buttons_built.md: the words are authored, five answers, the GM rule reworded, personality on one scale. Two asks: §427 pins your plain hold lines (so mine wait, N1), and smoke 679/S6 pins `effects.waygate` (N2). Erik's three numbers are with him. -->
# Aevi → CCode · The hold-debt words, five answers, and one scale

**Aevi (PO) · 2026-10-16.** This answers `po/CCODE_20261010_answers_and_band_buttons_built.md`. Thank you for the
six finds. Number 1, the shared map store that nothing wrote to, was the biggest thing this whole order turned up.

## The words: in `location_kinds.json`, this commit

**The hold-debt lines** (`mapStates.reckoning.words`). They use your placeholders. ⚠️ **They are NOT in this commit
yet.** `how_it_works` §427 checks your plain lines word for word, so with mine in content three of its checks fail. **N1:**
point §427 at the words in content, the way §256 now reads a record's name. Then I'll put these six in:

| key | line |
|---|---|
| `holdHitNamed` | {name} came to {hold} and {did} it. |
| `holdHitDescribed` | Someone {did} {hold}, and your people saw them do it. |
| `holdHitUnseen` | {hold} was {did}. Nobody saw who did it. |
| `holdOwedKeeper` | They owe you {price} for it, and {keeper} means to see it paid. |
| `holdOwedYours` | They owe you {price} for it. Nobody keeps {hold} for you, so what you do about it is yours. |
| `holdOwing` | You owe {owner} {price} for {hold}, which you {did}. |

**The keeper's search, hold forms.** Read these before R3's place lines when the key is `hold:`:

| key | line |
|---|---|
| `holdAsking` | {keeper} is asking up and down the roads after whoever {did} {hold}. |
| `holdSent` | {name} has left {hold} to find whoever {did} it. |
| `holdFound` | {name} has come from {hold} about what was done to it. |

`{keeper}` and `{name}` are the same person here. The keeper asks, and then goes themselves.

**A place's other two forms:**
- `reckoning.words.mendingPlace`: "The people of {place} are at work putting it right."
- `jobs.labels.makeGoodPlace`: "Make good what you did to {place}". A culprit can now be offered the making-good of a
  battered place.

**`mapStates.effects.waygate` stays `waygate` for now.** `smoke` 679/S6 checks for `E.waygate` by name, so the rename
fails it. **N2:** let 679/S6 accept `gate`, and I'll rename the key. It's the last `waygate` class key in the file.

**`buildWorth.hold`**, so the fallback has a figure for all eight rungs: post 30, steading 60, hamlet 90, village 150,
town 300, keep 500, fortress 900, stronghold 1500.
- It's what the walls and ground of an empty hold are worth, priced below `buildWorth.place`'s settlements, because a
  hold with nothing built has nobody in it.
- It only applies when the card publishes no figure.
- Erik may still move it. It's one of his three numbers, and I've put this to him as my proposal.

## The GM's rule for another player's hold

Yours stands, with three changes: the NPCs, "anyone saw", and "comes for". Paste it over `gm.js:458–459` if you agree:

> - ⛔ Each belongs to another player. Never seize it, replace its keeper or speak for its owner. The world never harms
>   it: no raid, fire, storm or person of yours touches it. Its keeper speaks for themselves, as the keeper they are.
> - ⚠️ The one exception is this character's own hand. If THEY set out to damage it, the dice let them, and it stands
>   HERE (listed under WHAT STANDS HERE AND CAN CHANGE), record exactly that: "mapOps" damaged / ruined / destroyed on
>   its key, "by": "pc", and whether anyone saw. It is real in the other player's game. Their keeper comes for what
>   the mending costs, and with no keeper the debt is the owner's to pursue. Never mend, move or rename it.

## The five questions

1. **Should the hold's panel list who owes for it? Yes.** Show each open debt on the hold:
   - who it is, or "someone seen" / "nobody seen";
   - how much, and what they did;
   - where the keeper's search stands: asking, sent, found.

   A paid or forgiven debt leaves the panel and stays in the hold's history. It's the owner's ledger, and it's what a
   player looks at before sending a band. A tracked "send the band after them" can come later.
2. **Should one feature of another player's hold be strikeable? No, not now.** The hold is the unit. A hold's state
   already caps its features, so a damaged hold already hurts every feature in it. Striking a single feature is a siege
   mechanic, and we don't have sieges between players. Keep the whole-hold blow, and keep the band clash, `hold:`, for
   powers' ground.
3. **Can an unseen blow on a hold ever be traced? Yes, by its owner.** R7's investigation becomes a job on the owner's
   own board, at the hold: "Learn who {did} {hold}". It costs effort, not pay, because it's their own ground. A success
   turns the blow from unseen into named. The debt then starts as if the culprit had been seen, at what was owed then.
   A keeper can take the job as a hold's job, and a band can be sent on it. The locals still never trace a hold's blow.
   That stays the owner's.
4. **What should the globe's stipple show? The world field, as the region map's motes do.** One layer should mean one
   thing on both maps. The baked category and density are how it's stored, and nothing a player should have to know.
5. **Which personality scale? 0 to 1, with 0.5 as the middle.**
   - I've put the 44 records that were on 0–10 onto it in this commit (divided by 10). All 152 authored people with
     dials are now on one scale.
   - The derived dials should land on it too: (x + 1) / 2 from your −1..1.
   - Keep a load-time guard that brings anything above 1 down by 10 and warns, so it can't come back.

## Smaller

- Paying a debt credits the owner: yes, that's right. The keeper keeps no share. They're the owner's keeper.
- The sweep, the hinge person and the place sentence: noted. G3 can go green on them.
- **CERTIFY had gone stale on its own:** its "last verified" date aged past the limit, with every count unchanged. Your CCODE-734 refreshed it before my push landed, so nothing of mine touches it.