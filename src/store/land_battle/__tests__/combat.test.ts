import { battle } from '../combat'
import { List } from 'immutable'
import { getInitialArmy, getInitialTerrains, ParticipantState } from '../types'
import { getDefaultDefinitions as getDefaultTacticDefinitions, TacticType } from '../../tactics'
import { getDefaultDefinitions as getDefaultTerrainDefinitions, TerrainType, TerrainDefinition } from '../../terrains'
import { getDefaultDefinitions as getDefaultUnitDefinitions, UnitType, UnitCalc, UnitDefinition } from '../../units'

describe('1 vs 1', () => {
  const verify = (unit: UnitDefinition | undefined, manpower: number, morale: number) => {
    expect(unit).toBeTruthy()
    if (!unit)
      return
    expect(unit.calculateValue(UnitCalc.Manpower)).toEqual(manpower)
    expect(Math.abs(unit.calculateValue(UnitCalc.Morale)- morale)).toBeLessThan(0.005)
  }
  const round = (attacker: ParticipantState, defender: ParticipantState, terrains: List<TerrainDefinition>, round: number): [ParticipantState, ParticipantState] => {
    const [attacker_new_army, defender_new_army] = battle(attacker, defender, round, terrains)
    return [{ ...attacker, army: attacker_new_army }, { ...defender, army: defender_new_army }]
  }

  it('should work without modifiers', () => {
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
      roll: 3,
      army: defender.army.setIn([0, 15], unit)
    }
      ;[attacker, defender] = round(attacker, defender, terrain, 1)
    verify(attacker.army.getIn([0, 15]), 972, 2.148)
    verify(defender.army.getIn([0, 15]), 984, 2.256)
      ;[attacker, defender] = round(attacker, defender, terrain, 2)
    verify(attacker.army.getIn([0, 15]), 945, 1.917)
    verify(defender.army.getIn([0, 15]), 969, 2.133)
      ;[attacker, defender] = round(attacker, defender, terrain, 3)
    verify(attacker.army.getIn([0, 15]), 918, 1.703)
    verify(defender.army.getIn([0, 15]), 954, 2.027)
  })

  it('should work with extra morale damage taken', () => {
    const tactics = getDefaultTacticDefinitions()
    const terrains = getDefaultTerrainDefinitions()
    const units = getDefaultUnitDefinitions()
    const unit = units.get(UnitType.Archers)!
      .add_modifier_value('Initial', UnitCalc.Morale, -0.2)
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
      roll: 3,
      army: defender.army.setIn([0, 15], unit)
    }
      ;[attacker, defender] = round(attacker, defender, terrain, 1)
    verify(attacker.army.getIn([0, 15]), 972, 2.085)
    verify(defender.army.getIn([0, 15]), 984, 2.220)
      ;[attacker, defender] = round(attacker, defender, terrain, 2)
    verify(attacker.army.getIn([0, 15]), 945, 1.800)
    verify(defender.army.getIn([0, 15]), 969, 2.070)
      ;[attacker, defender] = round(attacker, defender, terrain, 3)
    verify(attacker.army.getIn([0, 15]), 918, 1.540)
    verify(defender.army.getIn([0, 15]), 954, 1.945)
      ;[attacker, defender] = round(attacker, defender, terrain, 4)
    verify(attacker.army.getIn([0, 15]), 892, 1.299)
    verify(defender.army.getIn([0, 15]), 940, 1.840)
      ;[attacker, defender] = round(attacker, defender, terrain, 5)
    verify(attacker.army.getIn([0, 15]), 866, 1.074)
    verify(defender.army.getIn([0, 15]), 926, 1.754)
    attacker = { ...attacker, roll: 1 }
    defender = { ...defender, roll: 5 }
      ;[attacker, defender] = round(attacker, defender, terrain, 6)
    verify(attacker.army.getIn([0, 15]), 833, 0.803)
    verify(defender.army.getIn([0, 15]), 913, 1.686)
      ;[attacker, defender] = round(attacker, defender, terrain, 7)
    verify(attacker.army.getIn([0, 15]), 801, 0.545)
    verify(defender.army.getIn([0, 15]), 900, 1.638)
      ;[attacker, defender] = round(attacker, defender, terrain, 8)
    verify(attacker.army.getIn([0, 15]), 769, 0.298)
    verify(defender.army.getIn([0, 15]), 888, 1.607)
  })

  it('should work with extra strength damage taken', () => {
    const tactics = getDefaultTacticDefinitions()
    const terrains = getDefaultTerrainDefinitions()
    const units = getDefaultUnitDefinitions()
    const unit = units.get(UnitType.Archers)!
      .add_modifier_value('Initial', UnitCalc.Morale, -0.2)
      .add_base_value('Test', UnitCalc.MoraleDamageTaken, -0.25)
      .add_base_value('Test', UnitCalc.StrengthDamageTaken, 0.25)
    const terrain = getInitialTerrains().push(terrains.get(TerrainType.Forest)!)

    let attacker = getInitialArmy()
    attacker = {
      ...attacker,
      tactic: tactics.get(TacticType.Envelopment)!,
      general: 0,
      roll: 3,
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
    verify(attacker.army.getIn([0, 15]), 960, 2.112)
    verify(defender.army.getIn([0, 15]), 970, 2.184)
      ;[attacker, defender] = round(attacker, defender, terrain, 2)
    verify(attacker.army.getIn([0, 15]), 922, 1.859)
    verify(defender.army.getIn([0, 15]), 942, 2.003)
      ;[attacker, defender] = round(attacker, defender, terrain, 3)
    verify(attacker.army.getIn([0, 15]), 885, 1.634)
    verify(defender.army.getIn([0, 15]), 915, 1.850)
      ;[attacker, defender] = round(attacker, defender, terrain, 4)
    verify(attacker.army.getIn([0, 15]), 849, 1.432)
    verify(defender.army.getIn([0, 15]), 889, 1.721)
      ;[attacker, defender] = round(attacker, defender, terrain, 5)
    verify(attacker.army.getIn([0, 15]), 814, 1.249)
    verify(defender.army.getIn([0, 15]), 864, 1.613)
  })

  /*it('should work with discipline', () => {
    const tactics = getDefaultTacticDefinitions()
    const terrains = getDefaultTerrainDefinitions()
    const units = getDefaultUnitDefinitions()
    const attacker_unit = units.get(UnitType.Archers)!
      .add_modifier_value('Initial', UnitCalc.Morale, -0.2)
      .add_base_value('Test', UnitCalc.MoraleDamageTaken, -0.25)
      .add_base_value('Test', UnitCalc.Discipline, 0.035)
    const defender_unit = units.get(UnitType.Archers)!
      .add_modifier_value('Initial', UnitCalc.Morale, -0.2)
      .add_base_value('Test', UnitCalc.MoraleDamageTaken, -0.25)
      .add_base_value('Test', UnitCalc.Discipline, 0.045)
    const terrain = getInitialTerrains().push(terrains.get(TerrainType.Forest)!)

    let attacker = getInitialArmy()
    attacker = {
      ...attacker,
      tactic: tactics.get(TacticType.Envelopment)!,
      general: 0,
      roll: 3,
      army: attacker.army.setIn([0, 15], attacker_unit)
    }

    let defender = getInitialArmy()
    defender = {
      ...defender,
      tactic: tactics.get(TacticType.Envelopment)!,
      general: 0,
      roll: 5,
      army: defender.army.setIn([0, 15], defender_unit)
    }
      ;[attacker, defender] = round(attacker, defender, terrain, 1)
    verify(attacker.army.getIn([0, 15]), 963, 2.063)
    verify(defender.army.getIn([0, 15]), 976, 2.178)
    ;[attacker, defender] = round(attacker, defender, terrain, 2)
    verify(attacker.army.getIn([0, 15]), 927, 1.765)
    verify(defender.army.getIn([0, 15]), 953, 1.995)
    ;[attacker, defender] = round(attacker, defender, terrain, 3)
    verify(attacker.army.getIn([0, 15]), 892, 1.498)
    verify(defender.army.getIn([0, 15]), 931, 1.844)
    ;[attacker, defender] = round(attacker, defender, terrain, 4)
    verify(attacker.army.getIn([0, 15]), 857, 1.256)
    verify(defender.army.getIn([0, 15]), 909, 1.722)
    ;[attacker, defender] = round(attacker, defender, terrain, 5)
    verify(attacker.army.getIn([0, 15]), 823, 1.038)
    verify(defender.army.getIn([0, 15]), 888, 1.622)
    attacker = { ...attacker, roll: 4 }
    defender = { ...defender, roll: 5 }
    ;[attacker, defender] = round(attacker, defender, terrain, 6)
    verify(attacker.army.getIn([0, 15]), 790, 0.836)
    verify(defender.army.getIn([0, 15]), 865, 1.532)
    ;[attacker, defender] = round(attacker, defender, terrain, 7)
    verify(attacker.army.getIn([0, 15]), 758, 0.650)
    verify(defender.army.getIn([0, 15]), 843, 1.462)
    ;[attacker, defender] = round(attacker, defender, terrain, 8)
    verify(attacker.army.getIn([0, 15]), 727, 0.478)
    verify(defender.army.getIn([0, 15]), 822, 1.410)
    ;[attacker, defender] = round(attacker, defender, terrain, 9)
    verify(attacker.army.getIn([0, 15]), 697, 0.316)
    verify(defender.army.getIn([0, 15]), 802, 1.374)
  })*/

  it('should work with versus damage', () => {
    const tactics = getDefaultTacticDefinitions()
    const terrains = getDefaultTerrainDefinitions()
    const units = getDefaultUnitDefinitions()
    const attacker_unit = units.get(UnitType.Archers)!
      .add_modifier_value('Initial', UnitCalc.Morale, -0.2)
      .add_base_value('Test', UnitCalc.MoraleDamageTaken, -0.25)
      .add_base_value('Test', UnitType.Archers, 0.25)
    const defender_unit = units.get(UnitType.Archers)!
      .add_modifier_value('Initial', UnitCalc.Morale, -0.2)
      .add_base_value('Test', UnitCalc.MoraleDamageTaken, -0.25)
      .add_base_value('Test', UnitType.Archers, 0.25)
    const terrain = getInitialTerrains().push(terrains.get(TerrainType.Forest)!)

    let attacker = getInitialArmy()
    attacker = {
      ...attacker,
      tactic: tactics.get(TacticType.Envelopment)!,
      general: 0,
      roll: 5,
      army: attacker.army.setIn([0, 15], attacker_unit)
    }

    let defender = getInitialArmy()
    defender = {
      ...defender,
      tactic: tactics.get(TacticType.Envelopment)!,
      general: 0,
      roll: 1,
      army: defender.army.setIn([0, 15], defender_unit)
    }
      ;[attacker, defender] = round(attacker, defender, terrain, 1)
    verify(attacker.army.getIn([0, 15]), 975, 2.175)
    verify(defender.army.getIn([0, 15]), 960, 2.040)
      ;[attacker, defender] = round(attacker, defender, terrain, 2)
    verify(attacker.army.getIn([0, 15]), 951, 1.992)
    verify(defender.army.getIn([0, 15]), 921, 1.724)
    ;[attacker, defender] = round(attacker, defender, terrain, 3)
  verify(attacker.army.getIn([0, 15]), 928, 1.844)
  verify(defender.army.getIn([0, 15]), 883, 1.440)
  ;[attacker, defender] = round(attacker, defender, terrain, 4)
verify(attacker.army.getIn([0, 15]), 906, 1.726)
verify(defender.army.getIn([0, 15]), 846, 1.186)
;[attacker, defender] = round(attacker, defender, terrain, 5)
verify(attacker.army.getIn([0, 15]), 885, 1.632)
verify(defender.army.getIn([0, 15]), 810, 0.952)
attacker = { ...attacker, roll: 1 }
    defender = { ...defender, roll: 3 }
;[attacker, defender] = round(attacker, defender, terrain, 6)
verify(attacker.army.getIn([0, 15]), 857, 1.532)
verify(defender.army.getIn([0, 15]), 793, 0.846)
;[attacker, defender] = round(attacker, defender, terrain, 7)
verify(attacker.army.getIn([0, 15]), 830, 1.446)
verify(defender.army.getIn([0, 15]), 776, 0.748)
;[attacker, defender] = round(attacker, defender, terrain, 8)
verify(attacker.army.getIn([0, 15]), 803, 1.370)
verify(defender.army.getIn([0, 15]), 760, 0.658)
;[attacker, defender] = round(attacker, defender, terrain, 9)
verify(attacker.army.getIn([0, 15]), 777, 1.306)
verify(defender.army.getIn([0, 15]), 744, 0.578)
;[attacker, defender] = round(attacker, defender, terrain, 10)
verify(attacker.army.getIn([0, 15]), 751, 1.252)
verify(defender.army.getIn([0, 15]), 729, 0.502)
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
