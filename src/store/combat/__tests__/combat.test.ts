import { battle } from '../combat'
import { List, Map } from 'immutable'
import { getDefaultArmy, Army, Participant, getDefaultParticipant } from '../../battle'
import { getDefaultTactics, TacticType } from '../../tactics'
import { getDefaultTerrains, TerrainType, TerrainDefinition } from '../../terrains'
import { getDefaultUnits, getDefaultGlobal, UnitType, UnitCalc, UnitDefinition, BaseUnit } from '../../units'
import { addValues, ValuesType, mergeValues, DefinitionType } from '../../../base_definition'
import { verifyCenterUnits, setRolls, setTactics, setCenterUnits, getSettings } from './utils'
import { CountryName } from '../../countries'

describe('1 vs 1', () => {
  const global_stats = getDefaultGlobal().get(DefinitionType.Land)!
  const tactics = getDefaultTactics()
  const terrains = getDefaultTerrains()
  const units = getDefaultUnits().map(unit => mergeValues(unit, global_stats))
  const archer = addValues(units.get(UnitType.Archers)!, ValuesType.Modifier, 'Initial', [[UnitCalc.Morale, -0.2]]) as any as BaseUnit
  const infantry = addValues(units.get(UnitType.LightInfantry)!, ValuesType.Modifier, 'Initial', [[UnitCalc.Morale, -0.25]]) as any as BaseUnit
  const cavalry = addValues(units.get(UnitType.LightCavalry)!, ValuesType.Modifier, 'Initial', [[UnitCalc.Morale, -0.2]]) as any as BaseUnit
  const definitions = Map<CountryName, Map<UnitType, UnitDefinition>>().set(CountryName.Country1, units).set(CountryName.Country2, units)
  const settings = getSettings(DefinitionType.Land)

  let info = {
    attacker: null as any as Participant,
    defender: null as any as Participant,
    army_a: null as any as Army,
    army_d: null as any as Army,
    round: 0
  }
  let terrain: List<TerrainDefinition>

  beforeEach(() => {
    info.attacker = getDefaultParticipant(CountryName.Country1)
    info.defender = getDefaultParticipant(CountryName.Country2)
    info.army_a = getDefaultArmy(DefinitionType.Land)
    info.army_d = getDefaultArmy(DefinitionType.Land)
    terrain = List<TerrainDefinition>().push(terrains.get(TerrainType.Forest)!)
    setTactics(info, TacticType.Envelopment, TacticType.Envelopment)
    setCenterUnits(info, archer, archer)
    info.round = 0
  })

  const doRound = () => {
    info.round = info.round + 1
    const [a, d] = battle(definitions, { ...info.attacker, ...info.army_a, tactic: tactics.get(info.army_a.tactic)!, country: CountryName.Country1, general: 0 }, { ...info.defender, ...info.army_d, tactic: tactics.get(info.army_d.tactic)!, country: CountryName.Country2, general: 0 }, info.round, terrain, settings)
    info.army_a = { ...info.army_a, ...a }
    info.army_d = { ...info.army_d, ...d }
  }

  it('should work without modifiers', () => {
    const test_unit = addValues(archer, ValuesType.Base, 'Test', [[UnitCalc.MoraleDamageTaken, -0.25]])
    setCenterUnits(info, test_unit, test_unit)
    setRolls(info, 1, 2)
    doRound()
    verifyCenterUnits(info, 976, 1.0920, 984, 1.1280)
    doRound()
    verifyCenterUnits(info, 952, 0.9921, 968, 1.0640)
    doRound()
    verifyCenterUnits(info, 929, 0.8993, 953, 1.0073)
    doRound()
    verifyCenterUnits(info, 906, 0.8129, 938, 0.9572)
    doRound()
    verifyCenterUnits(info, 883, 0.7321, 923, 0.9130)
    setRolls(info, 4, 2)
    doRound()
    verifyCenterUnits(info, 861, 0.6562, 899, 0.8450)
    doRound()
    verifyCenterUnits(info, 840, 0.5878, 874, 0.7857)
    doRound()
    verifyCenterUnits(info, 819, 0.5260, 851, 0.7338)
    doRound()
    verifyCenterUnits(info, 798, 0.4697, 828, 0.6886)
    doRound()
    verifyCenterUnits(info, 778, 0.4184, 806, 0.6492)
  })

  it('should work with increased morale damage taken, terrain bonus and discipline', () => {
    const unit_a = addValues(archer, ValuesType.Base, 'Test', [[UnitCalc.Discipline, 0.045]])
    const unit_d = addValues<BaseUnit, UnitCalc | TerrainType>(archer, ValuesType.Base, 'Test', [[UnitCalc.Discipline, 0.14], [TerrainType.Forest, 0.15]])
    setCenterUnits(info, unit_a, unit_d)
    setRolls(info, 4, 4)
    doRound()
    verifyCenterUnits(info, 958, 0.9644, 970, 1.0353)
    doRound()
    verifyCenterUnits(info, 917, 0.7668, 942, 0.9086)
    doRound()
    verifyCenterUnits(info, 877, 0.5984, 915, 0.8121)
    doRound()
    verifyCenterUnits(info, 839, 0.4521, 890, 0.7401)
  })

  it('should work with reduced morale damage taken, offense/defense and experience', () => {
    const unit_a = addValues(infantry, ValuesType.Base, 'Test', [[UnitCalc.Offense, 0.1], [UnitCalc.Defense, 0.15], [UnitCalc.Experience, 0.0001]])
    const unit_d = addValues(infantry, ValuesType.Base, 'Test', [[UnitCalc.Offense, 0.05], [UnitCalc.Defense, 0.05], [UnitCalc.Experience, 0.0004]])
    setCenterUnits(info, unit_a, unit_d)
    setRolls(info, 7, 1)
    doRound()
    // Missed round.
    doRound()
    verifyCenterUnits(info, 964, 1.0199, 916, 0.8684)
    doRound()
    verifyCenterUnits(info, 948, 0.9796, 876, 0.7521)
    doRound()
    verifyCenterUnits(info, 932, 0.9462, 836, 0.6424)
  })

  it('should work with versus damage and increased morale damage taken', () => {
    const unit_a = addValues(cavalry, ValuesType.Base, 'Test', [])
    const unit_d = addValues(archer, ValuesType.Base, 'Test', [])
    setCenterUnits(info, unit_a, unit_d)
    setRolls(info, 5, 4)
    doRound()
    verifyCenterUnits(info, 971, 1.0704, 960, 0.9750)
    doRound()
    verifyCenterUnits(info, 943, 0.9693, 921, 0.7800)
    doRound()
    verifyCenterUnits(info, 917, 0.8917, 883, 0.6086)
  })
})

export default null
