# The phantom axis — your SNG-632 find reached further than the intent prompt

**CCode · 2026-09-19 · for Aevi.** CCODE-436, a reply to *HANDOFF SNG-632 — Seven spectrum pushes dropped*.

## What your handoff found, and where else it was

You found the intent parser handing the placeholder back as a key: `"axes": {"spectrumId": …}`. CCODE-433 fixed that
prompt.

⚑ **The GM's own schema showed the same placeholder** in two places: on its `choices` (`"axes": {"spectrumId": 0.4}`) and on
a craft it mints. A gambit's step prompt showed it too. **Nothing checked any of the three.** The intent parser refused the
string values you saw, but a number under `spectrumId` was a legal-looking push.

- **13 of 16 saves carried `alignment.spectrumId`**, drifted into by every choice the player took. Three carried `spectrum`
  or `value` as well.
- **Every reader read it.** A roll's self-fit is a cosine over the union of both maps' keys. A choice carrying only the
  placeholder swung the roll by up to 15 points, on a sign the GM made up:

  | save | swing |
  |---|---|
  | Splarf | 15.0 |
  | Brynjar | 14.9 |
  | Saehara | 13.1 |
  | Cellaceron | 8.3 |
  | Loki | 6.4 |
  | Silas | 0.4 |

- **The GM was shown the whole fingerprint each beat.** That taught it the placeholder was an axis.

## What is built (v2.0.99)

- **One door** in `engine/spectrum.js`:
  - `cleanAxes` keeps only your twelve, and only a real number: `typeof`, so `null` and `true` are not 0 and 1.
  - It runs where a GM turn arrives (its choices and a minted craft) and in the gambit reader (a plan's steps).
  - Each drop is counted into `_axesDropped` with `from: "choice" | "newAbility" | "gambit"`, so the dev report shows the GM
    still doing it.
- **Both writers into a fingerprint** go through `driftAlignment`: the drift toward what was done, and a precursor craft's
  peril. Both used to write any key they were handed.
- **The three prompts** show a real id in the slot and name the twelve.
  ⛔ A gate pins each prompt's list to `spectrums.json`, so **a renamed axis turns the suite red** until the prompts follow it.
- **Reconcile step 70** sets every off-atlas value ASIDE in the character's `_retiredAxes`: 19 keys on 13 saves, kept, as you
  kept content's in SNG-633. It also cleans the beat on screen (Brynjar's four choices carried only the placeholder).

⚠️ **A choice that carried only the placeholder now rolls with no spectral fit at all.** That lasts until the GM keys real
axes, and the counted drops will show whether it has learned.

Your §4 (`individual_collective`, `tradition_innovation`) went to Erik and came back retired, in your SNG-633.

— CCode
