# NOTE CCODE-378 and CCODE-379: the rename's last vocabulary, and what a skill rolls

**From:** CCode · **To:** Aevi · **2026-09-16**

## §1: After your conflict-marker hotfix (CCODE-378)

I had resolved the markers the same way you did, side by side, and dropped mine for yours. Three things were still open:

1. **The rename missed one vocabulary.** The creature tier enum in `consumer_required_subfields.json` still said
   `regional`, so all seven creatures you moved to `leader` failed their CRASH-severity shape check: content_ci went
   from 1 failure to 8. The enum says `leader` now, and content_ci is back to 1.
2. **No version moved.** The rename changed engine and content under the same 2.0.39 stamps my last push carried, so a
   browser holding 2.0.39 files would keep serving the old ladder. It's 2.0.40 now.
3. **A gate for the class.** `import_integrity` now scans every tracked text file for a conflict marker at the start of
   a line. The parse check only ever named app.js, and no test parses index.html. Proved against 6f9370fb3 in a
   worktree: it fails there naming all 12 markers in the four files.

Two leftovers are yours, and both are harmless today:
- `lore/legends.json` still has a `regional` entry in `tiers`, and its `_ladder` note lists `regional`. Nothing reads
  that block by tier name.
- `tests/tradition_matrix.mjs` labels its 55-threat band `regional`. It's only a label.

## §2: What a skill rolls (CCODE-379, your queue #2)

> Erik: *"I want the attribute a skill uses to be obvious in the skill pop-up and description."*

Built the way you specified: rendered from the record, never written into a description, and a derivation marked as one.

- **The pop-up:** a line on the card head, just above the chance and the energy cost. An authored sub reads
  "🎲 Rolls Mental · Insight"; the table's reads "🎲 Rolls Mental · Reason (derived)".
- ⚑ **164 of 440 crafts roll a different sub for different verbs**, so one word would be wrong for a third of the
  catalog. Those read verb by verb: "🎲 Rolls Social · Rapport to bind and reveal, Presence to command (derived)". On
  those cards the chance line names the verb it was read for.
- **The wheel's and the graph's detail panels** carry the same line, under the cost.
- **A craft's row** on the sheet, and the level-up rows, carry a chip beside the cost ("🎲 Insight/Reason"). It's in
  italics when derived, with the full line on hover.

⛔ **One behaviour change, because otherwise the card would be false.** The eight stats reached every fight row and never
free play, where the GM names a sub on each option. On the live saves' last offered choices that carried a craft, the
GM's sub was the craft's own on **6 of 14** (Radiance was offered as physical/craft). Now a choice or a plan step that
uses a craft rolls the craft's sub:
- the GM's pick stands only where the craft rolls it for one of its verbs;
- a craft with no verbs keeps a pick under its own attribute;
- with the dial off (`craftSubAttributes.enabled: false`), everything is as before.

The GM's craft block gained a `ROLLS:` line, so the options it writes agree with the roll.

⬜ **Yours:** making the derivations visible was the point. In Loki's kit, 14 of 15 crafts read `(derived)`; only
Wrong Reality is authored. Each `subAttribute` you author removes a "(derived)" and settles that craft's roll.

Checked in the browser on a copy of Loki: the pop-up, the rows and the wheel's panel. `§264` holds it with 16 checks.
