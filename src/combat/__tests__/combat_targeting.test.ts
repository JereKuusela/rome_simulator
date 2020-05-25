import { addValues } from 'definition_values'
import { getUnit, TestState, initState, initExpected, testCombat, getSettingsTest, addToReserveTest, getArmyTest, createArmyTest } from './utils'
import { UnitType, UnitAttribute, Setting, ValuesType, SideType, UnitPreferenceType } from 'types'
import { setUnitPreference } from 'managers/army'

if (process.env.REACT_APP_GAME !== 'euiv') {

  describe('targeting', () => {
    const archer = addValues(getUnit(UnitType.Archers), ValuesType.Modifier, 'Initial', [[UnitAttribute.Morale, -0.2]])
    const light = addValues(getUnit(UnitType.LightCavalry), ValuesType.Modifier, 'Initial', [[UnitAttribute.Morale, -0.2]])
    const heavy = addValues(getUnit(UnitType.HeavyCavalry), ValuesType.Modifier, 'Initial', [[UnitAttribute.Morale, -0.2]])

    let state: TestState
    beforeEach(() => state = initState())

    it('main and flanks', () => {
      addToReserveTest(state, SideType.A, [archer, archer])
      addToReserveTest(state, SideType.B, [archer, archer, light, light])

      const rolls = [[5, 0]]
      const { attacker, defender } = initExpected(1)

      attacker[1][14] = attacker[1][15] = [archer.type, 956, 1.9140]

      defender[1][13] = defender[1][16] = [light.type, 1000, 2.4]
      defender[1][14] = defender[1][15] = [archer.type, 956, 1.914]

      testCombat(state, rolls, attacker, defender)
    })

    it('inner flank', () => {
      getSettingsTest(state)[Setting.FixTargeting] = false
      getSettingsTest(state)[Setting.DefenderAdvantage] = true

      addToReserveTest(state, SideType.A, [heavy, heavy, archer, archer])
      addToReserveTest(state, SideType.B, [archer, archer, archer, archer])
      setUnitPreference(getArmyTest(state, SideType.A), UnitPreferenceType.Primary, UnitType.HeavyCavalry)

      const rolls = [[5, 5]]
      const { attacker, defender } = initExpected(5)

      attacker[5][13] = attacker[5][16] = [archer.type, 838, 1.0341]
      attacker[5][14] = attacker[5][15] = [heavy.type, 826, 1.4929]

      defender[5][14] = [archer.type, 690, 0.0134]
      defender[5][15] = [archer.type, 801, 0.8586]

      testCombat(state, rolls, attacker, defender)
    })

    it('inner flank (fixed)', () => {
      // Can't be tested in game.
      getSettingsTest(state)[Setting.FixTargeting] = true
      getSettingsTest(state)[Setting.DefenderAdvantage] = true

      addToReserveTest(state, SideType.A, [heavy, heavy, archer, archer])
      addToReserveTest(state, SideType.B, [archer, archer, archer, archer])
      setUnitPreference(getArmyTest(state, SideType.A), UnitPreferenceType.Primary, UnitType.HeavyCavalry)

      const rolls = [[5, 5], [0, 6]]
      const { attacker, defender } = initExpected(5)

      attacker[5][13] = attacker[5][16] = [archer.type, 838, 1.0341]
      attacker[5][14] = attacker[5][15] = [heavy.type, 826, 1.4929]

      defender[5][14] = defender[5][15] = [archer.type, 746, 0.4360]

      testCombat(state, rolls, attacker, defender)
    })

    it('defender\'s advantage', () => {
      getSettingsTest(state)[Setting.DefenderAdvantage] = true
      getSettingsTest(state)[Setting.CombatWidth] = 1
      addToReserveTest(state, SideType.A, [archer])
      addToReserveTest(state, SideType.A, [heavy])
      setUnitPreference(getArmyTest(state, SideType.A), UnitPreferenceType.Primary, UnitType.HeavyCavalry)
      setUnitPreference(getArmyTest(state, SideType.A), UnitPreferenceType.Secondary, UnitType.Archers)

      addToReserveTest(state, SideType.B, [archer, archer])
      setUnitPreference(getArmyTest(state, SideType.B), UnitPreferenceType.Secondary, UnitType.Archers)
      createArmyTest(state, SideType.B, 10)
      addToReserveTest(state, SideType.B, [archer, archer], 1)

      const rolls = [[6, 1], [6, 1], [1, 6], [1, 6]]
      const { attacker, defender } = initExpected(4, 15)

      attacker[4][0] = [heavy.type, 918, 1.83]
      defender[4][0] = [archer.type, 1000, 2.4]
      attacker[15][0] = [archer.type, 1000, 2.4]
      defender[15][0] = [archer.type, 866, 1.72]

      testCombat(state, rolls, attacker, defender)
    })
  })
}

export default null
