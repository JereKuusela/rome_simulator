import { battle } from '../combat'
import { List, Map } from 'immutable'
import { getInitialArmy, Participant } from '../../battle'
import { getDefaultDefinitions as getDefaultTacticDefinitions, TacticType } from '../../tactics'
import { getDefaultDefinitions as getDefaultTerrainDefinitions, TerrainType, TerrainDefinition } from '../../terrains'
import { getDefaultDefinitions as getDefaultUnitDefinitions, getDefaultGlobalDefinition, UnitType, UnitCalc, UnitDefinition } from '../../units'
import { addValues, ValuesType, mergeValues, DefinitionType } from '../../../base_definition'
import { verifyCenterUnits, setRolls, setTactics, setCenterUnits, getSettings } from './utils'
import { CountryName } from '../../countries'

describe('1 vs 1', () => {
  const global_stats = getDefaultGlobalDefinition().get(DefinitionType.Land)!
  const tactics = getDefaultTacticDefinitions()
  const terrains = getDefaultTerrainDefinitions()
  const units = getDefaultUnitDefinitions().map(unit => mergeValues(unit, global_stats))
  const unit = addValues(units.get(UnitType.Archers)!, ValuesType.Modifier, 'Initial', [[UnitCalc.Morale, -0.2]])
  const definitions = Map<CountryName, Map<UnitType, UnitDefinition>>().set(CountryName.Country1, units).set(CountryName.Country2, units)
  const settings = getSettings(DefinitionType.Land)

  let info = {
    attacker: null as any as Participant,
    defender: null as any as Participant,
    round: 0
  }
  let terrain: List<TerrainDefinition>

  beforeEach(() => {
    info.attacker = getInitialArmy(DefinitionType.Land)
    info.defender = getInitialArmy(DefinitionType.Land)
    terrain = List<TerrainDefinition>().push(terrains.get(TerrainType.Forest)!)
    setTactics(info, TacticType.Envelopment, TacticType.Envelopment)
    setCenterUnits(info, unit, unit)
    info.round = 0
  })

  const doRound = () => {
    info.round = info.round + 1
    const [a, d] = battle(definitions, { ...info.attacker, tactic: tactics.get(info.attacker.tactic)!, country: CountryName.Country1 }, { ...info.defender, tactic: tactics.get(info.defender.tactic)!, country: CountryName.Country2 }, info.round, terrain, settings)
    info.attacker = { ...info.attacker, ...a }
    info.defender = { ...info.defender, ...d }
  }

  it('should work without modifiers', () => {
    const test_unit = addValues(unit, ValuesType.Base, 'Test', [[UnitCalc.MoraleDamageTaken, -0.25]])
    setCenterUnits(info, test_unit, test_unit)
    setRolls(info, 1, 3)
    doRound()
    verifyCenterUnits(info, 972, 2.148, 984, 2.256)
    doRound()
    verifyCenterUnits(info, 945, 1.916, 969, 2.132)
    doRound()
    verifyCenterUnits(info, 918, 1.702, 954, 2.026)
  })

  it('should work with extra morale damage taken', () => {
    setRolls(info, 1, 3)
    doRound()
    verifyCenterUnits(info, 972, 2.084, 984, 2.220)
    doRound()
    verifyCenterUnits(info, 945, 1.800, 969, 2.070)
    doRound()
    verifyCenterUnits(info, 918, 1.540, 954, 1.944)
    doRound()
    verifyCenterUnits(info, 892, 1.298, 940, 1.840)
    doRound()
    verifyCenterUnits(info, 866, 1.074, 926, 1.754)
    setRolls(info, 1, 5)
    doRound()
    verifyCenterUnits(info, 833, 0.802, 913, 1.686)
    doRound()
    verifyCenterUnits(info, 801, 0.544, 900, 1.638)
    doRound()
    verifyCenterUnits(info, 769, 0.298, 888, 1.606)
  })

  it('should work with extra strength damage taken', () => {
    const test_unit = addValues(unit, ValuesType.Base, 'Test', [[UnitCalc.MoraleDamageTaken, -0.25], [UnitCalc.StrengthDamageTaken, 0.25]])
    setCenterUnits(info, test_unit, test_unit)
    setRolls(info, 3, 4)
    doRound()
    verifyCenterUnits(info, 960, 2.112, 970, 2.184)
    doRound()
    verifyCenterUnits(info, 922, 1.858, 942, 2.002)
    doRound()
    verifyCenterUnits(info, 885, 1.634, 915, 1.850)
    doRound()
    verifyCenterUnits(info, 849, 1.432, 889, 1.720)
    doRound()
    verifyCenterUnits(info, 814, 1.248, 864, 1.612)
  })

  it('should work with versus damage', () => {
    const test_unit = addValues(unit, ValuesType.Base, 'Test', [[UnitCalc.MoraleDamageTaken, -0.25], [UnitType.Archers, 0.25]] as [UnitCalc | UnitType, number][])
    setCenterUnits(info, test_unit, test_unit)
    setRolls(info, 5, 1)
    doRound()
    verifyCenterUnits(info, 975, 2.174, 960, 2.040)
    doRound()
    verifyCenterUnits(info, 951, 1.992, 921, 1.724)
    doRound()
    verifyCenterUnits(info, 928, 1.844, 883, 1.440)
    doRound()
    verifyCenterUnits(info, 906, 1.726, 846, 1.186)
    doRound()
    verifyCenterUnits(info, 885, 1.632, 810, 0.952)
    setRolls(info, 1, 3)
    doRound()
    verifyCenterUnits(info, 857, 1.532, 793, 0.846)
    doRound()
    verifyCenterUnits(info, 830, 1.446, 776, 0.748)
    doRound()
    verifyCenterUnits(info, 803, 1.370, 760, 0.658)
    doRound()
    verifyCenterUnits(info, 777, 1.306, 744, 0.578)
    doRound()
    verifyCenterUnits(info, 751, 1.252, 729, 0.502)
  })


  it('should work with discipline', () => {
    const unit_a = addValues(unit, ValuesType.Base, 'Test', [[UnitCalc.MoraleDamageTaken, -0.25], [UnitCalc.Discipline, 0.01]])
    const unit_d = addValues(unit, ValuesType.Base, 'Test', [[UnitCalc.MoraleDamageTaken, -0.25], [UnitCalc.Discipline, 0.045]])
    setCenterUnits(info, unit_a, unit_d)
    setRolls(info, 6, 4)
    doRound()
    verifyCenterUnits(info, 967, 2.100, 964, 2.074)
    doRound()
    verifyCenterUnits(info, 935, 1.852, 929, 1.800)
    doRound()
    verifyCenterUnits(info, 904, 1.644, 896, 1.566)
    doRound()
    //verifyCenterUnits(info,875, 1.470, 864, 1.368)
    doRound()
    //verifyCenterUnits(info,847, 1.324, 833, 1.194)
  })

  /*it('fake without modifiers', () => {
    // Morale multiplier and base set to 1.0
    // Can be enabled when these parameters can be changed.
    const tactics = getDefaultTacticDefinitions()
    const terrains = getDefaultTerrainDefinitions()
    const units = getDefaultUnitDefinitions()
    const unit = units.get(UnitType.Archers)!
      .add_modifier_value('Initial', UnitCalc.Morale, -0.2)
      .add_base_value('Test', UnitCalc.MoraleDamageTaken, -0.25)
    const terrain = getInitialTerrains().push(terrains.get(TerrainType.Forest)!)
 
    let attacker = getInitialArmy()
    attacker = {
      ...attacker,
      tactic: tactics.get(TacticType.Envelopment)!,
      general: 0,
      roll: 1,
      army: attacker.army.setIn([0, 15], unit)
    }
 
    let defender = getInitialArmy()
    defender = {
      ...defender,
      tactic: tactics.get(TacticType.Envelopment)!,
      general: 0,
      roll: 5,
      army: defender.army.setIn([0, 15], unit)
    }
    ;[attacker, defender] = round(attacker, defender, terrain, 1)
    verify(attacker.army.getIn([0, 15]), 964, 1.968)
    verify(defender.army.getIn([0, 15]), 984, 2.208)
    ;[attacker, defender] = round(attacker, defender, terrain, 2)
    verify(attacker.army.getIn([0, 15]), 929, 1.578)
    verify(defender.army.getIn([0, 15]), 969, 2.057)
    ;[attacker, defender] = round(attacker, defender, terrain, 3)
    verify(attacker.army.getIn([0, 15]), 895, 1.221)
    verify(defender.army.getIn([0, 15]), 955, 1.941)
    ;[attacker, defender] = round(attacker, defender, terrain, 4)
    verify(attacker.army.getIn([0, 15]), 861, 0.890)
    verify(defender.army.getIn([0, 15]), 941, 1.855)
    ;[attacker, defender] = round(attacker, defender, terrain, 5)
    verify(attacker.army.getIn([0, 15]), 828, 0.577)
    verify(defender.army.getIn([0, 15]), 928, 1.795)
    attacker = { ...attacker, roll: 3 }
    defender = { ...defender, roll: 4 }
    ;[attacker, defender] = round(attacker, defender, terrain, 6)
    verify(attacker.army.getIn([0, 15]), 799, 0.312)
    verify(defender.army.getIn([0, 15]), 909, 1.738)
  })*/

  /*it('fake without morale base', () => {
    // Morale base set to 1.0
    // Can be enabled when these parameters can be changed.
    const tactics = getDefaultTacticDefinitions()
    const terrains = getDefaultTerrainDefinitions()
    const units = getDefaultUnitDefinitions()
    const unit = units.get(UnitType.Archers)!
      .add_modifier_value('Initial', UnitCalc.Morale, -0.2)
      .add_base_value('Test', UnitCalc.MoraleDamageTaken, -0.25)
    const terrain = getInitialTerrains().push(terrains.get(TerrainType.Forest)!)
 
    let attacker = getInitialArmy()
    attacker = {
      ...attacker,
      tactic: tactics.get(TacticType.Envelopment)!,
      general: 0,
      roll: 1,
      army: attacker.army.setIn([0, 15], unit)
    }
 
    let defender = getInitialArmy()
    defender = {
      ...defender,
      tactic: tactics.get(TacticType.Envelopment)!,
      general: 0,
      roll: 4,
      army: defender.army.setIn([0, 15], unit)
    }
    ;[attacker, defender] = round(attacker, defender, terrain, 1)
    verify(attacker.army.getIn([0, 15]), 968, 1.824)
    verify(defender.army.getIn([0, 15]), 984, 2.112)
    ;[attacker, defender] = round(attacker, defender, terrain, 2)
    verify(attacker.army.getIn([0, 15]), 937, 1.328)
    verify(defender.army.getIn([0, 15]), 969, 1.902)
    ;[attacker, defender] = round(attacker, defender, terrain, 3)
    verify(attacker.army.getIn([0, 15]), 906, 0.887)
    verify(defender.army.getIn([0, 15]), 955, 1.755)
    ;[attacker, defender] = round(attacker, defender, terrain, 4)
    verify(attacker.army.getIn([0, 15]), 876, 0.488)
    verify(defender.army.getIn([0, 15]), 941, 1.661)
  })*/

  /*it('fake without morale base', () => {
    // Morale multiplier set to 1.0
    // Can be enabled when these parameters can be changed.
    const tactics = getDefaultTacticDefinitions()
    const terrains = getDefaultTerrainDefinitions()
    const units = getDefaultUnitDefinitions()
    const unit = units.get(UnitType.Archers)!
      .add_modifier_value('Initial', UnitCalc.Morale, -0.2)
      .add_base_value('Test', UnitCalc.MoraleDamageTaken, -0.25)
    const terrain = getInitialTerrains().push(terrains.get(TerrainType.Forest)!)
 
    let attacker = getInitialArmy()
    attacker = {
      ...attacker,
      tactic: tactics.get(TacticType.Envelopment)!,
      general: 0,
      roll: 6,
      army: attacker.army.setIn([0, 15], unit)
    }
 
    let defender = getInitialArmy()
    defender = {
      ...defender,
      tactic: tactics.get(TacticType.Envelopment)!,
      general: 0,
      roll: 4,
      army: defender.army.setIn([0, 15], unit)
    }
    ;[attacker, defender] = round(attacker, defender, terrain, 1)
    verify(attacker.army.getIn([0, 15]), 968, 2.208)
    verify(defender.army.getIn([0, 15]), 964, 2.184)
    ;[attacker, defender] = round(attacker, defender, terrain, 2)
    verify(attacker.army.getIn([0, 15]), 938, 2.040)
    verify(defender.army.getIn([0, 15]), 930, 1.992)
    ;[attacker, defender] = round(attacker, defender, terrain, 3)
    verify(attacker.army.getIn([0, 15]), 909, 1.893)
    verify(defender.army.getIn([0, 15]), 897, 1.821)
    ;[attacker, defender] = round(attacker, defender, terrain, 4)
    verify(attacker.army.getIn([0, 15]), 881, 1.763)
    verify(defender.army.getIn([0, 15]), 865, 1.667)
    ;[attacker, defender] = round(attacker, defender, terrain, 5)
    verify(attacker.army.getIn([0, 15]), 854, 1.648)
    verify(defender.army.getIn([0, 15]), 834, 1.528)
  })*/
})


export default null
