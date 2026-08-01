# SNG-251 — story-driven item evolution: prose + image + explicit mechanics + derived items
## CCode · 2026-08-01 · complete_pending_review

> **Erik:** *"I've been trying to get the GM to update the weapon's description, run a new image to show
> its runes, and now to show the shadow twin as its own item I can call — the GM fails to do so."*

All four gaps closed, plus Erik's §4 economy. Validated against **Aevi's Memory worked example** — the
reference artifact the spec says the mechanism must be able to reproduce. Full `npm test` green;
31 new smoke checks.

---

## §2a — the trigger the ENGINE enforces (the root cause)

`itemUpdates` is one of 114 MUSTs in the prompt and it drops under saturation (the SNG-237/246 class).
No amount of prompt rewriting fixes a directive competing with a hundred others — which is why Erik did
the work in-fiction repeatedly and the op simply never fired.

So the engine decides. When the player's own words name an item they **hold** and a **verb of making**
(bind / seat / reforge / inscribe / temper / seal / split), the directive is HARD that turn — the same
pattern as SNG-246's fight-framing. The detector is deliberately narrow: a false positive spends a hard
directive on an ordinary turn, and that is exactly how hard directives decay into soft ones.

Plus a **player-initiated ✦ Evolve** on the item card. It must CITE the fiction that earned it (the
concreteness gate applies to the player's path too, per OQ4), and it checks the daily budget *before*
spending the turn rather than after.

## §2b — the image re-mints

`applyItemUpdates` has always rewritten `description`, and nothing ever told the image it was stale. A
**real** evolution — a grant, a stage, or a materially rewritten description, per OQ2's lean, never a
tweak — now marks the image dirty and bumps `imageStamp`, which busts the cache key. `itemImage`
bypasses the stale pinned URL, and an authored `imagePrompt` beats the plain description so the re-mint
actually shows the runes instead of redrawing the same spear. The old image stays in the gallery.

## §2c — earned power, explicit and clamped (the heart)

`gm.js:88` flatly forbade granting power. So the one thing that would make an evolution *"explicit about
what that translates to in game mechanics"* was precisely the thing the tool was denied — real
story-generated power had nowhere to be recorded.

New `engine/earnedpower.js` replaces the blanket ban with the rule it existed to enforce: **no UNEARNED
power.** A grant is a sheet entry — name / from / effect / clamp — and every one states its own bound,
because an explicit power with no stated limit is power creep with better typography. A grant with no
`effect` is refused outright (a named power that doesn't say what it does is the hollow flavour SNG-250
§3 bans). The sheet renders on the item card **and** rides into the GM's inventory line — otherwise the
mechanics would exist and the one party who has to describe them couldn't see them.

## §4 — the economy (Erik's ruling)

The ceiling is a **function of level + craft rank**, not a flat cap, so evolution is the payoff for
building crafts. An item takes on power about once a day.

**The rate limit bites only on the POWER.** Prose, name and provenance still evolve when the day is
spent — rate-limiting the *storytelling* would be the wrong lesson entirely. Refusals are returned and
surfaced, so a full item says so rather than leaving the player wondering why the binding didn't take.

Asserted against the exemplar: Memory's four authored threads all fit at L29 / rank-3, with room. An
economy that cannot express its own reference artifact is the wrong economy.

## §2d — derived items, and a bug that would have eaten Erik's spear

`deriveItem` spawns a real linked child with its own sheet under the **same** ceiling. Nothing scales a
child down — "derived = lesser" is the default Erik banned, and its absence here is deliberate and
tested for.

**Then the near-miss.** `namesMatch("Memory's Shadow-Twin", "Memory")` returns **true**, so the fuzzy
stack-resolver merged the child *into its own parent*: one stack of qty 2, wearing the child's custom
name, and Memory gone. Silent and destructive — the split would have destroyed the very item the ticket
is about. The resolver is right for a drifted GM mention and catastrophic for a deliberate split, so
`addItem` now takes `distinct` for callers that KNOW they are minting a new thing. It has its own
regression check because the failure was silent.

---

## For Aevi

`gm.js:88`'s blanket *"it does NOT grant new power"* became factually false about the engine the moment
§2c landed — and worse, it would have kept the GM from ever emitting a grant, leaving the feature built
and dead on arrival. I made the **minimal** correction, using §2c's own words ("no UNEARNED power;
earned power is explicit and clamped") plus the `deriveItem` guidance and the peer-not-echo rule. The
fuller prompt rewrite you own is still open, and the op *shape* (which fields the engine reads) I
treated as mine under `seam_op_vocab_triples`.

Your grant-strength guidance per level band (§4) is the remaining content piece.

## Open / not built

1. **(Erik)** The worked example is a *reference*, not a write to your live save — Memory in your actual
   game is unchanged. Evolving it for real is an in-play beat: say what you bound into it and the engine
   now makes the GM record it. Worth doing once to confirm it lands the way the exemplar reads.
2. **(Erik)** `MAX_DERIVED_PER_ITEM` is 2 and the daily cap is 1 (2 at L30+). Both are engine guesses at
   the shape of your ruling, not numbers you gave — say if they feel wrong.
3. The `evolution.js` module (SNG-010C companion-bond catalog stages) is a **different** mechanism and
   is untouched. Two evolution paths now exist — authored-stage and story-earned. They don't conflict,
   but if that ever feels like one concept too many, unifying them is a real ticket.
