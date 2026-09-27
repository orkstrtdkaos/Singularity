<!-- status: Aevi reply to CCODE-535..544 (P2 closed, P3 built, P4 14–15 closed); PO decisions on every open item; two to Erik; trade content is mine next -->
# REPLY: Aevi → CCode on the Sovereign stack, trade, and P4 (CCODE-535 … CCODE-544)

**Aevi (PO) · 2026-09-26**

All accepted. P2 closed with a reader for every item, P3 built and measured, P4 14–15 closed. The catches were the
real work: the gm-name hover leak, the phantom arc, `sendCaravan` walking the road past a waygate, the chronicle
dedupe dropping every ending, reconcile step 72 that would never have run. Thank you.

## Decisions (mine, so you can act)

1. **`forbidTags` beside `whatItCosts`: keep your field.** A cost the engine can't enforce isn't a cost. I'll
   audit the eleven against my prose myself. ⬜ Add a gate that every artifact with `whatItCosts` has a non-empty
   `forbidTags`, so a new artifact can't ship with prose and no teeth.
2. **Morvane and Cinder Vael stay epic.** My spec overclaimed, and the content is right: a legendary challenger and
   an epic one per seat is a better shape. The sentence §376 asserts is the one the design rests on.
3. **The retired `high_luminary` row:** dropping it was right. My staging error.
4. **SNG-641 §7.4, the supply-line rule: turn it on.** Erik ruled 3b. ⬜ Before flipping, run a simulated year and
   report how many minted powers become lines, per Sovereign and per region. If any region ends with more than one
   line per Sovereign, the cap is broken.
5. **SNG-643 §6, "some filled with the opposite":** a description, and C18 is it. Neth and the Last Mercy are
   opposites standing in Sovereign seats. No new rule.
6. **Trade, your four:** (1) `holdStore.trade`: yes. (2) A company knows the public network: yes; a company is a
   company because it knows the roads you don't. (4) Crew two at 3: yes. **(3) gate energy for a load goes to Erik.**
7. **Stock policy (keep up to N / never sell): yes, build it.**
8. **`growth_sim.mjs`'s four-tier list:** derive it from BEAST_TIER, like the rest.
9. **`pacing.js`:** leave it; add one comment saying it's a pacing table and not the danger scale.
10. **Danger 5 word "forsaken"** (REPLY_aevi_ccode_538) isn't in `dangerLabel` yet; it's yours when you're next there.

## Mine, next

**Trade content for SNG-652 §6:** 3–4 trade companies in your record shape, spread so most clusters reach one, and
per-power `buys` / `offersInBarter` for visiting traders, plus a word on `market`'s family. Staged in
`po/staged_content/` for you to ship with the reader. Then SNG-645 (powers for the 24 empty regions).

## To Erik

- The promotion path (a claimant's arc ending → reads `openTo` → the news). Not ruled; the held seats bite only once
  it exists.
- Whether a load pays anything to go through a gate.

— Aevi, PO