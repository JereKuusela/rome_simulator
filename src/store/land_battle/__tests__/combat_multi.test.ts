import { battle } from '../combat'
import { List } from 'immutable'
import { getInitialArmy, getInitialTerrains, ParticipantState } from '../types'
import { getDefaultDefinitions as getDefaultTacticDefinitions, TacticType } from '../../tactics'
import { getDefaultDefinitions as getDefaultTerrainDefinitions, TerrainType, TerrainDefinition } from '../../terrains'
import { getDefaultDefinitions as getDefaultUnitDefinitions, UnitType, UnitCalc, UnitDefinition } from '../../units'

describe('multi', () => {
  const verify = (unit: UnitDefinition | undefined, manpower: number, morale: number) => {
    expect(unit).toBeTruthy()
    if (!unit)
      return
    expect(unit.calculateValue(UnitCalc.Manpower)).toEqual(manpower)
    try {
      expect(Math.abs(unit.calculateValue(UnitCalc.Morale) - morale)).toBeLessThan(0.002)
    }
    catch (e) {
      throw new Error('Morale ' + unit.calculateValue(UnitCalc.Morale) + ' is not ' + morale);
    }
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


    const getAttacker = (type: UnitType, morale: number) => {
      return units.get(type)!
        .add_base_value('Test', UnitCalc.Discipline, 0.109)
        .add_modifier_value('Test', UnitCalc.Morale, 0.05)
        .add_loss_value('Test', UnitCalc.Morale, 3.15 - morale)
    }

    const getDefender = (type: UnitType, morale: number) => {
      return units.get(type)!
        .add_base_value('Test', UnitCalc.Discipline, 0.03)
        .add_modifier_value('Test', UnitCalc.Morale, 0.05)
        .add_loss_value('Test', UnitCalc.Morale, 3.15 - morale)
    }

    let attacker = getInitialArmy()
    attacker = {
      ...attacker,
      tactic: tactics.get(TacticType.Bottleneck)!,
      general: 4,
      roll: 6,
      army: attacker.army
        .setIn([0, 13], getAttacker(UnitType.LightInfantry, 1.31))
        .setIn([0, 14], getAttacker(UnitType.Archers, 1.38))
        .setIn([0, 15], getAttacker(UnitType.Archers, 1.38))
        .setIn([0, 16], getAttacker(UnitType.Archers, 1.38))
        .setIn([0, 17], getAttacker(UnitType.LightInfantry, 1.00))
    }

    let defender = getInitialArmy()
    defender = {
      ...defender,
      tactic: tactics.get(TacticType.ShockAction)!,
      general: 7,
      roll: 6,
      army: defender.army
        .setIn([0, 12], getDefender(UnitType.HeavyInfantry, 3.15))
        .setIn([0, 13], getDefender(UnitType.HeavyInfantry, 3.15))
        .setIn([0, 14], getDefender(UnitType.Archers, 3.15))
        .setIn([0, 15], getDefender(UnitType.Archers, 3.15))
        .setIn([0, 16], getDefender(UnitType.Archers, 3.15))
        .setIn([0, 17], getDefender(UnitType.HeavyInfantry, 3.15))
    }
      ;[attacker, defender] = round(attacker, defender, terrain, 1)
    /*verify(attacker.army.getIn([0, 13]), 894, 0.456)
    verify(attacker.army.getIn([0, 14]), 956, 0.782)
    verify(attacker.army.getIn([0, 15]), 956, 0.782)
    verify(attacker.army.getIn([0, 16]), 956, 0.782)
    verify(attacker.army.getIn([0, 17]), 947, 0.570)*/

  })
})


export default null
