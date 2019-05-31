import { battle } from '../combat'
import { List } from 'immutable'
import { getInitialArmy, ParticipantState } from '../types'
import { getDefaultDefinitions as getDefaultTacticDefinitions, TacticType } from '../../tactics'
import { getDefaultDefinitions as getDefaultTerrainDefinitions, TerrainType, TerrainDefinition } from '../../terrains'
import { getDefaultDefinitions as getDefaultUnitDefinitions, UnitType, UnitCalc, UnitDefinition } from '../../units'
import { add_base_values, add_base_value, add_modifier_value, calculateValue} from '../../../base_definition'

describe('1 vs 1', () => {
  const tactics = getDefaultTacticDefinitions()
  const terrains = getDefaultTerrainDefinitions()
  const units = getDefaultUnitDefinitions()
  const unit = add_modifier_value(units.get(UnitType.Archers)!, 'Initial', UnitCalc.Morale, -0.2)

  let attacker: ParticipantState
  let defender: ParticipantState
  let terrain: List<TerrainDefinition>
  let round: number

  beforeEach(() => {
    attacker = getInitialArmy()
    defender = getInitialArmy()
    terrain = List<TerrainDefinition>().push(terrains.get(TerrainType.Forest)!)
    setTactics(TacticType.Envelopment, TacticType.Envelopment)
    setUnits(unit, unit)
    round = 0
  })
  const verifySub = (unit: UnitDefinition | undefined, manpower: number, morale: number) => {
    expect(unit).toBeTruthy()
    if (!unit)
      return
    expect(calculateValue(unit, UnitCalc.Manpower)).toEqual(manpower)
    try {
      expect(Math.abs(calculateValue(unit, UnitCalc.Morale) - morale)).toBeLessThan(0.002)
    }
    catch (e) {
      throw new Error('Morale ' + calculateValue(unit, UnitCalc.Morale) + ' is not ' + morale);
    }
  }
  const verify = (manpower_a: number, morale_a: number, manpower_d: number, morale_d: number) => {
    verifySub(attacker.army.getIn([0, 15]), manpower_a, morale_a)
    verifySub(defender.army.getIn([0, 15]), manpower_d, morale_d)
  }
  const doRound = () => {
    round++
    const [attacker_new_army, defender_new_army] = battle({...attacker, tactic: tactics.get(attacker.tactic)!}, {...defender, tactic: tactics.get(defender.tactic)!}, round, terrain)
    attacker = { ...attacker, army: attacker_new_army }
    defender = { ...defender, army: defender_new_army }
  }
  const setRolls = (roll_a: number, roll_d: number) => {
    attacker = { ...attacker, roll: roll_a }
    defender = { ...defender, roll: roll_d }
  }
  const setTactics = (tactic_a: TacticType, tactic_d: TacticType) => {
    attacker = { ...attacker, tactic: tactic_a }
    defender = { ...defender, tactic: tactic_d }
  }
  const setUnits = (unit_a: UnitDefinition, unit_b: UnitDefinition) => {
    attacker = { ...attacker, army: attacker.army.setIn([0, 15], unit_a) }
    defender = { ...defender, army: defender.army.setIn([0, 15], unit_b) }
  }

  it('should work without modifiers', () => {
    const test_unit = add_base_value(unit, 'Test', UnitCalc.MoraleDamageTaken, -0.25)
    setUnits(test_unit, test_unit)
    setRolls(1, 3)
    doRound()
    verify(972, 2.148, 984, 2.256)
    doRound()
    verify(945, 1.916, 969, 2.132)
    doRound()
    verify(918, 1.702, 954, 2.026)
  })

  it('should work with extra morale damage taken', () => {
    setRolls(1, 3)
    doRound()
    verify(972, 2.084, 984, 2.220)
    doRound()
    verify(945, 1.800, 969, 2.070)
    doRound()
    verify(918, 1.540, 954, 1.944)
    doRound()
    verify(892, 1.298, 940, 1.840)
    doRound()
    verify(866, 1.074, 926, 1.754)
    setRolls(1, 5)
    doRound()
    verify(833, 0.802, 913, 1.686)
    doRound()
    verify(801, 0.544, 900, 1.638)
    doRound()
    verify(769, 0.298, 888, 1.606)
  })

  it('should work with extra strength damage taken', () => {
    const test_unit = add_base_values(unit, 'Test', [[UnitCalc.MoraleDamageTaken, -0.25], [UnitCalc.StrengthDamageTaken, 0.25]])
    setUnits(test_unit, test_unit)
    setRolls(3, 4)
    doRound()
    verify(960, 2.112, 970, 2.184)
    doRound()
    verify(922, 1.858, 942, 2.002)
    doRound()
    verify(885, 1.634, 915, 1.850)
    doRound()
    verify(849, 1.432, 889, 1.720)
    doRound()
    verify(814, 1.248, 864, 1.612)
  })

  it('should work with versus damage', () => {
    const test_unit = add_base_values(unit, 'Test', [[UnitCalc.MoraleDamageTaken, -0.25], [UnitType.Archers, 0.25]] as [UnitCalc | UnitType, number][])
    setUnits(test_unit, test_unit)
    setRolls(5, 1)
    doRound()
    verify(975, 2.174, 960, 2.040)
    doRound()
    verify(951, 1.992, 921, 1.724)
    doRound()
    verify(928, 1.844, 883, 1.440)
    doRound()
    verify(906, 1.726, 846, 1.186)
    doRound()
    verify(885, 1.632, 810, 0.952)
    setRolls(1, 3)
    doRound()
    verify(857, 1.532, 793, 0.846)
    doRound()
    verify(830, 1.446, 776, 0.748)
    doRound()
    verify(803, 1.370, 760, 0.658)
    doRound()
    verify(777, 1.306, 744, 0.578)
    doRound()
    verify(751, 1.252, 729, 0.502)
  })


  it('should work with discipline', () => {
    const unit_a = add_base_values(unit, 'Test', [[UnitCalc.MoraleDamageTaken, -0.25], [UnitCalc.Discipline, 0.01]])
    const unit_d = add_base_values(unit, 'Test', [[UnitCalc.MoraleDamageTaken, -0.25], [UnitCalc.Discipline, 0.045]])
    setUnits(unit_a, unit_d)
    setRolls(6, 4)
    doRound()
    verify(967, 2.100, 964, 2.074)
    doRound()
    verify(935, 1.852, 929, 1.800)
    doRound()
    verify(904, 1.644, 896, 1.566)
    doRound()
    //verify(875, 1.470, 864, 1.368)
    doRound()
    //verify(847, 1.324, 833, 1.194)
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
