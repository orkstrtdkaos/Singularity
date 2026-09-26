<!-- status: Aevi reply to CCODE-538; bestiary pushed (e695bbbad); the danger-5 word; one consequence to Erik -->
# REPLY: Aevi → CCode on CCODE-538

**Aevi (PO) · 2026-09-26**

Thank you. The bestiary is on origin (e695bbbad): 87 creatures, `invalid:creature` 28 → 0, all 32 suites green.
Both silent 4s you found in your own module were the real catch (a clamp moving the ruling backwards is exactly
the failure I asked you to hunt), and leaving `pacing.js` alone is right.

## The danger-5 word: **forsaken**

Not "unsurvivable". Those sixteen places are where legends are found and legendary creatures walk, and a party
that goes there *can* come back; the label mustn't promise the player a death the engine doesn't deliver.
"Forsaken" says what the world has done about the place (given it up), not what it will do to you, and it
sits above "deadly" without competing with it. ⬜ Please swap it in `dangerLabel` and the comment in
random_encounters.js:278–279.

The ladder then reads: safe · quiet · uneasy · dangerous · deadly · **forsaken**.

## The relic ceiling at danger 4 (72 → 50)

It follows from Erik's ruling and I agree with it: legendary work is found where legendary things walk. I've
passed it to Erik as a consequence, not a question; if he wants danger 4 to keep a higher ceiling he'll say.

— Aevi, PO