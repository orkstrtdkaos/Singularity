import io, json, os
root = 'C:/Users/orkst/Desktop/Singularity'
sb = json.load(io.open(root + '/content/packs/core/rules/skill_battle_system.json', encoding='utf-8'))['engine']

# what each dial does, in Erik's terms. key path -> (what it controls, when you'd turn it)
DOC = {
 'momentum.meterMax': ('How far the meter must fill before a PRESSURE event fires.', 'Lower = pressure (and its damage) comes sooner; fights get sharper.'),
 'momentum.marginScale': ('How much a round\'s roll gap moves the meter.', 'THE big pacing dial. Higher = swingier, shorter fights.'),
 'momentum.surgeCrushEndsIt': ('The swing size that counts as an overwhelming blow.', 'Lower = crushing blows happen more often.'),
 'momentum.asModifier.perPoint': ('Roll bonus per point of momentum you hold.', 'Higher = leads snowball.'),
 'momentum.asModifier.max': ('Cap on the momentum roll bonus.', 'Higher = a big lead is decisive.'),
 'momentum.pressure.resetTo': ('Fraction of the meter you keep after being driven back.', 'Higher = pressure events come in quicker succession.'),
 'momentum.pressure.playerHealthLoss': ('Health you lose per pressure event.', 'THE danger dial for the player. Higher = fights hurt.'),
 'momentum.pressure.opponentEnergyLoss': ('Energy/composure the foe loses per pressure event.', 'Higher = you wear foes down faster.'),
 'momentum.pressure.breakAtPressure': ('Pressure events before the opponent breaks.', 'THE fight-length dial. 2 -> 1 roughly halves peer fights.'),
 'turn.senseMovesMomentum': ('Whether the SENSE step moves the meter.', 'true would make sensing cost you the exchange again. Leave false.'),
 'turn.setupBonusScale': ('How much a good read is worth on the action roll.', 'Higher = reading is stronger.'),
 'turn.setupBonusMax': ('Cap on the read bonus.', 'Higher = a great read can decide a turn.'),
 'turn.bonusOnDegrees': ('Which read results earn the BONUS action.', 'MEASURED: crit-only left 20% of peer fights unresolved. Adding "partial" would make bonus actions near-constant.'),
 'weave.bonusPerTier': ('Roll bonus per tier of the woven (second) craft.', 'Higher = braiding is stronger.'),
 'weave.maxBonus': ('Cap on the weave bonus.', ''),
 'weave.energyMultiplier': ('Energy cost multiplier for a woven round.', 'THE braid price dial. Too low and weaving is always correct.'),
 'persistentEffects.requiresDegree': ('Roll results that let an effect land.', 'Removing "partial" makes effects rarer.'),
 'persistentEffects.partialValueMult': ('Effect strength on a partial success.', ''),
 'persistentEffects.critBonusRounds': ('Extra rounds an effect lasts on a crit.', ''),
 'persistentEffects.maxActivePerSide': ('How many effects one side can hold at once.', 'Raise it if you want turtle/stacking builds to be viable.'),
 'oddsPreview.counterCraftBonus': ('Confidence gained from holding a counter-craft.', 'Higher = countering makes you a better judge of the odds.'),
 'oddsPreview.confidenceByFogTier': ('Fog tier -> confidence in the shown odds.', 'Raise to show real numbers sooner.'),
 'finisher.finisherTierAt': ('Tier at which an ordinary harm craft earns finishing potential.', 'Lower = more moves can end a fight.'),
 'finisher.alwaysAtHarmRung': ('Harm rungs that carry finishing potential from the start.', ''),
 'opponentPolicy.behindSurgeAt': ('How far behind a foe must be before they Surge.', ''),
 'opponentPolicy.aheadConserveAt': ('How far ahead before a foe paces themselves.', ''),
 'opponentSheetSynthesis.threatToAttribute': ('Threat -> foe attribute level.', 'THE foe-strength dial.'),
 'opponentSheetSynthesis.threatToTier': ('Threat -> foe craft tier.', ''),
 'opponentSheetSynthesis.threatToEnergy': ('Threat -> foe energy pool.', 'Higher = foes last longer.'),
 'appraisal.relativeTolerance': ('How different two stats must be to read as high/low in the pre-fight appraisal.', ''),
}

def get(path):
    cur = sb
    for k in path.split('.'):
        if not isinstance(cur, dict) or k not in cur: return None
        cur = cur[k]
    return cur

rows = []
for path, (what, when) in DOC.items():
    v = get(path)
    if v is None: continue
    rows.append((path, json.dumps(v, ensure_ascii=False), what, when))

out = []
out.append('# Combat dials — everything you can turn for balance')
out.append('')
out.append('**Auto-generated from `content/packs/core/rules/skill_battle_system.json` — values below are LIVE.**')
out.append('Regenerate after changing content so this never drifts. Every dial here is CONTENT: change the number,')
out.append('reload, play. No code change, no rebuild.')
out.append('')
out.append('> Erik, 2026-07-31: *"Keep a running list of all the dials I could turn - we may need to for balance eventually."*')
out.append('')
out.append('## The five that matter most')
out.append('')
out.append('| dial | now | what it does |')
out.append('|---|---|---|')
for p in ['momentum.marginScale', 'momentum.pressure.breakAtPressure', 'momentum.pressure.playerHealthLoss',
          'weave.energyMultiplier', 'opponentSheetSynthesis.threatToAttribute']:
    for r in rows:
        if r[0] == p:
            out.append('| `%s` | `%s` | %s **%s** |' % (r[0], r[1], r[2], r[3]))
out.append('')
out.append('## Everything, by system')
out.append('')
groups = {}
for r in rows:
    groups.setdefault(r[0].split('.')[0], []).append(r)
TITLES = {
 'momentum': 'Momentum & pressure — pacing, danger, how a fight ends',
 'turn': 'The turn — sense / action / bonus',
 'weave': 'Braiding two crafts in one step',
 'persistentEffects': 'Standing effects (guard up, insight, bound…)',
 'oddsPreview': 'What the player can SEE of the odds',
 'finisher': 'Finishing potential',
 'opponentPolicy': 'How the opponent chooses its move',
 'opponentSheetSynthesis': 'How a foe is built from its threat rating',
 'appraisal': 'The pre-fight read (stand and fight, or run)',
}
for g, rs in groups.items():
    out.append('### ' + TITLES.get(g, g))
    out.append('')
    out.append('| dial | now | what it does | when you\'d turn it |')
    out.append('|---|---|---|---|')
    for r in rs:
        out.append('| `%s` | `%s` | %s | %s |' % (r[0], r[1], r[2], r[3] or '—'))
    out.append('')

out.append('## Measured, not guessed')
out.append('')
out.append('Three of these were set by simulation rather than instinct — if you move them, it is worth re-running:')
out.append('')
out.append('- **`momentum.marginScale` (CCODE-34)** — at 0.5, a *typical* round exceeded both the meter and the crush')
out.append('  threshold: 47% of fights ended in ONE round and 90.6% by crush. 4000 fights/dial found 0.20.')
out.append('- **`momentum.pressure.*` (CCODE-38)** — after momentum stopped being an exit, 1500 fights/dial on the real')
out.append('  round path found 10 / 2 / 22: median ~15 rounds vs a peer with a genuine 32% player-loss rate.')
out.append('- **`turn.bonusOnDegrees` (CCODE-45)** — crit-only left **20% of peer fights unresolved**; crit+success gives')
out.append('  median 13 turns, 0% unresolved. The same sim showed sensing lifts the peer win-rate 53% -> 71%.')
out.append('')
out.append('The harnesses live in the session scratchpad; say the word and I will make them a permanent `npm run dials`.')
out.append('')

io.open(root + '/po/COMBAT_DIALS.md', 'w', encoding='utf-8', newline='\n').write('\n'.join(out) + '\n')
print('wrote po/COMBAT_DIALS.md with %d dials' % len(rows))
