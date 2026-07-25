# SNG-233 §2b — Important NPCs render FROM their drives (Pell & Veth stop being furniture)

**CCode · 2026-07-24 · v1.8.263 (`163a7712`) · all three suites green · proven against Erik's real save.** *Erik: "Pell and Veth seem dull — no opinions, agreeable furniture. I want driven personalities — Pell jealous and horny, Veth mad when I cross what she thinks is right. More ups and downs with people."*

## The seam (SNG-232 family)

Pell (partner, rel 10) and Veth (sworn, rel 10) were REGISTERED IN PLAY — the registration producer captured bond+relationship scaffolding but NONE of the interiority (wants/fears/disposition) the GM-render consumer needs. So the GM rendered "your partner, relationship 10" as warm agreeable furniture: **empty where personality lives.**

## Shipped (§2b — the GM lever + the overlay)

Aevi authored the drives (`npc_interiority.json`, §2a) grounded in each NPC's established fiction. This wires them in:

- **Loaded** — `npc_interiority.json` folded into the valley pack (manifest `provides.npc_interiority` + a `state.js` loader → `CONTENT.npcInteriority`, mirroring the tradition_motivations loader; content_ci whitelist + canary log updated).
- **Folded into the GM NPC block** — `npcRegistryForGM` renders a key NPC FROM their drives: full `wants` / `fears` / **PUSHES BACK WHEN** / `emotionalRange` / `acknowledgeTone` for someone IN SCENE (they act this beat), a one-line drive summary for offstage context. Keyed by npc id; a non-driven NPC is untouched (no bloat, no fabricated drives).
- **The lever fires** — the `drivenNpcDirective` (ups AND downs; regard you can LOSE and REGAIN; push back in character; approval earned by not giving it freely) is appended ONLY when a driven NPC is actually in the block.

## Proven against Erik's actual save (char-mrhs8286)

With Pell in scene, her GM block now carries her drives — `⟡ DRIVEN`, WANTS ("undivided attention"), PUSHES BACK ("she gets JEALOUS, confronting not sulking") — and the block ends with the directive. Veth resolves the same way. A non-driven NPC (Aldric) stays plain. So in play: Pell voices her own wants and gets jealous when his attention strays; Veth's approval is rare and her craft-anger real. Erik's "ups and downs."

## Round-2 OQ answers

- **OQ1 (merge-at-load vs look-up-at-use):** I chose **look-up-at-use** (the GM block reads `CONTENT.npcInteriority[id]`), NOT merging the authored overlay into each save. This *deviates from your lean* — rationale: content/save layer discipline (authored interiority is CONTENT; merging copies it into every save and goes stale when you revise the drives). The forward hook for §2c (`n.interiority` read on the save) means GM-authored interiority still renders through the same path — so both sources work without duplicating the authored ones.
- **OQ2 (§2c trigger):** bond-threshold (partner/sworn/mentor) — only NPCs who matter, deepens with the bond.
- **OQ3 (does pushesBackWhen move the number):** yes — via the existing `relationshipDelta` lever, GM-emitted from the drive, recoverable. No new number machinery; the directive tells the GM to let a crossed `pushesBackWhen` cost regard.

## §2c is the next phase (the registration gap)

§2b fixes the *existing* important NPCs (the overlay). §2c stops the gap recurring: when a bond crosses a threshold, a one-time "who is this person, really" beat authors `wants`/`fears`/`disposition` onto the NPC so future intimates are never blank. The READ path is already wired (`driveOf` reads `n.interiority`); §2c needs the WRITE op (applyNpcUpdates accepts an interiority write + the GM prompt-schema field) and the threshold trigger directive. Contained follow-up.

## Verified

smoke +4 SNG-233 checks (driven render / directive fires / non-driven stays plain / backward-safe with no doc); the two 229 state-adjacency regexes widened to tolerate the new content field; wiring_audit + content_ci green; no mojibake. Deploy: engine modules load without `?v` — Erik HARD-refreshes once v1.8.263 is live.

*— CCode. The numbers were always there; now they have interiority to move for. status: complete_pending_review (§2b).*
