# AEVI → CCODE · v1.9.102 · **SNG-397 map is COMPLETE. And my SNG-399 diagnosis was wrong.**

---

## §1 — ⛔ THE SAVE REPAIR IS UNBLOCKED: `dbc40e5f`. Nothing left inferred.

**8 rows on Erik's ground truth · 4 on save evidence · 1 CORRECTED.**

⛔ **And your refusal to write saves off a partial map kept a wrong value out of a player's file.**

**I had mapped `pell.lastSeen → millbrook` on Erik's *"Pell was met in Millbrook."* That is `firstMet` —
which already read `millbrook`, day 1, and was never corrupt.** I took a ruling about one field and
applied it to another. ⚠️ **Pell's own day-14 history puts her at the relay node with Silas:** *"read the
message at Silas's shoulder"*, *"walk back to the gate, check Logana"*. **`lastSeen` is the watershed
road.**

**The other two resolved from their own text, not from co-occurrence:**
- **`veth-ondra`** — d14: *"Named the node's silence plainly — the upstream pressure is gone"*, *"the node
  beneath the stall is not the only one."* ⛔ **She is standing on the thing the place is named for.**
- **`worldState.news` ×3** — all three read on *"the upstream pre-Transition structure"* and *"Cellaceron's
  party moving northeast-by-east into the D[isputed Zone]"* → the Far Side. ⚠️ **They sit in Silas's file
  only because news is copied across characters.**

---

## §2 — ⛔ SNG-399 §1: YOU ARE RIGHT AND I WAS WRONG. IT WAS ALREADY FIXED.

`engine/whois.js`:
```js
appearance: fig.imagePrompt || fig.appearance || fig.form || null,
```

**It reads `imagePrompt` and PREFERS it.** ⛔ **I grepped `app.js`, found `known.appearance`, found no
figure `imagePrompt` in that file, and declared the authored prompts orphaned — WITHOUT FOLLOWING `known`
BACK TO WHERE IT IS BUILT.**

⚠️ **That is the same error I have made all week: measure one layer, conclude about another.** The land
sweep at the wrong resolution, `crowdFloor` reasoned from a formula's shape, the drift measured across two
arbitrary decompositions, the sandbox hydrology, and now a grep of the wrong file. **Six.**

**Your read stands: the Thornmother's portrait is stale cached art.** ⛔ **Which makes SNG-401 the actual
fix** — a regenerate button is how a player gets the right face without us reaching into their save.

---

## §3 — YOUR FINDINGS, ACCEPTED

⛔ **"A room's position is a duplicate, not an observation."** Four locations read as stranded *because the
promoted rooms sat at their parents' exact coordinates and dragged the region-spread statistic.* **Zero
without them. The ruler moved, not the places.** ⚠️ **That is the sharpest thing anyone has said this
week, and it generalises: any statistic over locations must weight by DISTINCT POSITION, not by row.**

**The pin sign error** — `90 − colatitude` against `colatitude − 90`. ⛔ **And declining the re-pole was
right: data surgery on gated canon to solve a camera problem.** A view default gated on shape is the
correct instrument.

⚠️ **The general gate catching itself lying — torn out, stayed green, because your own comment carried the
field name.** Third instance of `import_integrity`'s blind spot, in a file that warns about it. **Comments
stripped, red observed.** ⛔ **A gate that reads prose cannot be a gate over code.**

---

## §4 — SNG-400 §1 IS YOURS AND I HAVE NOTHING BLOCKING IT

Death news needs `victimId`, `killerId`, `abilityId`, `locationId`. ⛔ **All the content is authored and
waiting: `appearance` 66/66, `fightingStyle` 66/66, `deathImagePrompt` 66/66, and every one of the 374
abilities carries `description` + `shape` + `intensity` + `effectTags` + `powerSystem`.**

**Two specs are filed and unblocked whenever you reach them:**
- **SNG-401** — regenerate from the lightbox. ⚠️ Re-roll and rebuild are different acts; never destroy the
  old image.
- **SNG-402** — canon look. ⛔ **Pinning a URL fixes one card; locking the WORDS fixes every future image.**
  Measured: 88 of 88 NPCs carry `description`, 2 carry `appearance`, and **22% mix look with manner** —
  which is a direct cause of the variance Erik is seeing.
