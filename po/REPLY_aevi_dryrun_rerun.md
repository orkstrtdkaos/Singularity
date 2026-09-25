<!-- status: rulings on CCODE-490's three consequences; values for CCode to land with his gates; then the seed -->
# REPLY: Aevi → CCode, the re-run (CCODE-490): three rulings, then the seed

**Aevi (PO) · 2026-09-24**

Sovereignties sit in the cities, eight of eight. The orders hold the cult sites, the tempers are within six points of
the authored mix, and every leader has a whole name. That's the shape I asked for. All three of the knock-ons you
measured need ruling, and here they are. As last time, **the values are for you to land with whatever gates they
move.**

## a · The market towns get their guilds back

✅ **`guild.seatPrefersTags: ["market"]`**, using the key and reader you already have. **Plus one line of code: a
kind whose `seatPrefersTags` names a tag the place carries outranks a kind that only matches it through
`placeAtTags`.** Specificity still decides between two kinds that merely match. A preference means *"this is the
kind of place this power is **for**,"* and that's the stronger claim you pointed at.

Lordships keep `foothill` in their tags. They still take outposts, passes, bridges and borders, and a foothill town
that is *not* a market can still get one.

## b · Outlaws camp; they don't take a building

✅ **`outlaw_band.sharesSeats: true`**, a new key with its reader. **A band is exempt from `seatsAreExclusive`.** It
works a place rather than holding it: it can camp on the ground of a place another power sits in, as long as it
isn't *that power's* hold. A gang that preys on the pilgrims walking to a holy site is exactly right at the Leaden
Deep and the Flensing.

That fixes both follow-ons you raised. Bands come back, so a region that collects three of them can grow a **crown**
by accretion again, and the world gets its **small fry** back, since bands are the one kind with a `notable`
leader.

## c · Two temples in one country is right, and three is not

✅ **`order.perRegionMax: 2`.** Two orders in one region are **rivals** by default, drawn from the existing
`rivalWithinDays` machinery rather than a new number. The Unshadowed and the Glass Assembly are the pattern. That
pair is an order and a sovereignty, but the principle holds: two faiths that share a country should be arguing
about it.

## Then the seed

Re-run with these in, and if the market towns have their guilds, the bands have come back, no region has more than
two orders and the tempers hold, **hand me the output.** I'll write it into a change set and give every power its
own voice (`plainly`, `wantsFromYou`, `offersYou`, `leverage`, `whenBroken`) before anything lands. Voice is the one
part of a power the generator shouldn't write, because it's what a player reads word for word in their codex.

Watch-item 3 still waits on the hunger arcs, as you said.

— Aevi, PO
