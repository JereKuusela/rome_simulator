import { battle } from '../combat'
import { List, Map } from 'immutable'
import { getInitialArmy, getInitialTerrains, Participant, ArmyName } from '../../battle'
import { getDefaultDefinitions as getDefaultTacticDefinitions, TacticType } from '../../tactics'
import { getDefaultDefinitions as getDefaultTerrainDefinitions, TerrainType, TerrainDefinition } from '../../terrains'
import { getDefaultDefinitions as getDefaultUnitDefinitions, UnitType, UnitCalc, UnitDefinition } from '../../units'
import { addValues, ValuesType, calculateValue, DefinitionType } from '../../../base_definition'
import { getSettings } from './utils'
import { CountryName } from '../../countries'

describe('multi', () => {
  const tactics = getDefaultTacticDefinitions()
  const terrains = getDefaultTerrainDefinitions()
  const units = getDefaultUnitDefinitions()
  const definitions = Map<CountryName, Map<UnitType, UnitDefinition>>().set(CountryName.Country1, units).set(CountryName.Country2, units)
  const settings = getSettings(DefinitionType.Land)

  const verify = (unit: UnitDefinition | undefined, manpower: number, morale: number) => {
    expect(unit).toBeTruthy()
    if (!unit)
      return
    expect(calculateValue(unit, UnitCalc.Strength)).toEqual(manpower)
    try {
      expect(Math.abs(calculateValue(unit, UnitCalc.Morale) - morale)).toBeLessThan(0.002)
    }
    catch (e) {
      throw new Error('Morale ' + calculateValue(unit, UnitCalc.Morale) + ' is not ' + morale);
    }
  }
  const round = (attacker: Participant, defender: Participant, terrains: List<TerrainDefinition>, round: number): [Participant, Participant] => {
    const [a, d] = battle(definitions, {...attacker, tactic: tactics.get(attacker.tactic)!, name: ArmyName.Attacker}, {...defender, tactic: tactics.get(defender.tactic)!, name: ArmyName.Defender}, round, terrains, settings)
    return [{ ...attacker, ...a }, { ...defender, ...d }]
  }

  it('should work without modifiers', () => {
    const unit = addValues(addValues(units.get(UnitType.Archers)!, ValuesType.Modifier, 'Initial', [[UnitCalc.Morale, -0.2]]), ValuesType.Loss, 'Test', [[UnitCalc.MoraleDamageTaken, -0.25]])
    const terrain = getInitialTerrains(DefinitionType.Land).push(TerrainType.Forest).map(type => terrains.get(type)!)


    const getAttacker = (type: UnitType, morale: number) => {
      return addValues(addValues(addValues(units.get(type)!, ValuesType.Modifier, 'Initial', [[UnitCalc.Morale, 0.05]]), ValuesType.Base, 'Test', [[UnitCalc.Discipline, 0.109]]), ValuesType.Loss, 'Test', [[UnitCalc.Morale, 3.15 - morale]])
    }

    const getDefender = (type: UnitType, morale: number) => {
      return addValues(addValues(addValues(units.get(type)!, ValuesType.Modifier, 'Initial', [[UnitCalc.Morale, 0.05]]), ValuesType.Base, 'Test', [[UnitCalc.Discipline, 0.03]]), ValuesType.Loss, 'Test', [[UnitCalc.Morale, 3.15 - morale]])
    }

    let attacker = getInitialArmy(DefinitionType.Land, CountryName.Country1)
    attacker = {
      ...attacker,
      tactic: TacticType.Bottleneck,
      general: 4,
      roll: 6,
      frontline: attacker.frontline
        .set(13, getAttacker(UnitType.LightInfantry, 1.31))
        .set(14, getAttacker(UnitType.Archers, 1.38))
        .set(15, getAttacker(UnitType.Archers, 1.38))
        .set(16, getAttacker(UnitType.Archers, 1.38))
        .set(17, getAttacker(UnitType.LightInfantry, 1.00))
    }

    let defender = getInitialArmy(DefinitionType.Land, CountryName.Country2)
    defender = {
      ...defender,
      tactic: TacticType.ShockAction,
      general: 7,
      roll: 6,
      frontline: defender.frontline
        .set(12, getDefender(UnitType.HeavyInfantry, 3.15))
        .set(13, getDefender(UnitType.HeavyInfantry, 3.15))
        .set(14, getDefender(UnitType.Archers, 3.15))
        .set(15, getDefender(UnitType.Archers, 3.15))
        .set(16, getDefender(UnitType.Archers, 3.15))
        .set(17, getDefender(UnitType.HeavyInfantry, 3.15))
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
