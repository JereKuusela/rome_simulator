import { battle } from '../combat'
import { List, Map } from 'immutable'
import { getInitialArmy, getInitialTerrains, Participant } from '../../land_battle/types'
import { getDefaultDefinitions as getDefaultTacticDefinitions, TacticType } from '../../tactics'
import { getDefaultDefinitions as getDefaultTerrainDefinitions, TerrainType, TerrainDefinition } from '../../terrains'
import { getDefaultDefinitions as getDefaultUnitDefinitions, UnitType, UnitCalc, UnitDefinition, ArmyName } from '../../units'
import { add_base_value, add_modifier_value, add_loss_value, calculateValue} from '../../../base_definition'

describe('multi', () => {
  const tactics = getDefaultTacticDefinitions()
  const terrains = getDefaultTerrainDefinitions()
  const units = getDefaultUnitDefinitions()
  const definitions = Map<ArmyName, Map<UnitType, UnitDefinition>>().set(ArmyName.Attacker, units).set(ArmyName.Defender, units)

  const verify = (unit: UnitDefinition | undefined, manpower: number, morale: number) => {
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
  const round = (attacker: Participant, defender: Participant, terrains: List<TerrainDefinition>, round: number): [Participant, Participant] => {
    const [attacker_new_army, defender_new_army] = battle(definitions, {...attacker, tactic: tactics.get(attacker.tactic)!}, {...defender, tactic: tactics.get(defender.tactic)!}, round, terrains)
    return [{ ...attacker, army: attacker_new_army }, { ...defender, army: defender_new_army }]
  }

  it('should work without modifiers', () => {
    const unit = add_base_value(add_modifier_value(units.get(UnitType.Archers)!, 'Initial', UnitCalc.Morale, -0.2), 'Test', UnitCalc.MoraleDamageTaken, -0.25)
    const terrain = getInitialTerrains().push(TerrainType.Forest).map(type => terrains.get(type)!)


    const getAttacker = (type: UnitType, morale: number) => {
      return add_loss_value(add_base_value(add_modifier_value(units.get(type)!, 'Initial', UnitCalc.Morale, 0.05), 'Test', UnitCalc.Discipline, 0.109), 'Test', UnitCalc.Morale, 3.15 - morale)
    }

    const getDefender = (type: UnitType, morale: number) => {
      return add_loss_value(add_base_value(add_modifier_value(units.get(type)!, 'Initial', UnitCalc.Morale, 0.05), 'Test', UnitCalc.Discipline, 0.03), 'Test', UnitCalc.Morale, 3.15 - morale)
    }

    let attacker = getInitialArmy()
    attacker = {
      ...attacker,
      tactic: TacticType.Bottleneck,
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
      tactic: TacticType.ShockAction,
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
