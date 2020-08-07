import { addValues } from 'definition_values'
import { getUnit, TestState, initState, initExpected, testCombatWithCustomRolls, getSettingsTest, addToReserveTest, getArmyTest, createArmyTest } from './utils'
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
      const expected = initExpected(1)

      expected[1].A.front = [[archer.type, 0.956, 1.9140], [archer.type, 0.956, 1.9140]]
      expected[1].B.front = [[archer.type, 0.956, 1.914], [archer.type, 0.956, 1.914], [light.type, 1, 2.4], [light.type, 1, 2.4]]

      testCombatWithCustomRolls(state, rolls, expected)
    })

    it('inner flank', () => {
      getSettingsTest(state)[Setting.FixTargeting] = false
      getSettingsTest(state)[Setting.DefenderAdvantage] = true

      addToReserveTest(state, SideType.A, [heavy, heavy, archer, archer])
      addToReserveTest(state, SideType.B, [archer, archer, archer, archer])
      setUnitPreference(getArmyTest(state, SideType.A), UnitPreferenceType.Primary, UnitType.HeavyCavalry)

      const rolls = [[5, 5]]
      const expected = initExpected(5)

      expected[5].A.front = [[heavy.type, 0.826, 1.4929], [heavy.type, 0.826, 1.4929], [archer.type, 0.838, 1.0341], [archer.type, 0.838, 1.0341]]
      // Front line contains one defeated proxy cohort.
      expected[5].B.front = [[archer.type, 0.801, 0.8586], [archer.type, 0.690, 0.0134]]
      expected[5].B.defeated = [archer.type, archer.type, archer.type]

      testCombatWithCustomRolls(state, rolls, expected)
    })

    it('inner flank (fixed)', () => {
      // Can't be tested in game.
      getSettingsTest(state)[Setting.FixTargeting] = true
      getSettingsTest(state)[Setting.DefenderAdvantage] = true

      addToReserveTest(state, SideType.A, [heavy, heavy, archer, archer])
      addToReserveTest(state, SideType.B, [archer, archer, archer, archer])
      setUnitPreference(getArmyTest(state, SideType.A), UnitPreferenceType.Primary, UnitType.HeavyCavalry)

      const rolls = [[5, 5], [0, 6]]
      const expected = initExpected(5)

      expected[5].A.front = [[heavy.type, 0.826, 1.4929], [heavy.type, 0.826, 1.4929], [archer.type, 0.838, 1.0341], [archer.type, 0.838, 1.0341]]
      expected[5].B.front = [[archer.type, 0.746, 0.4360], [archer.type, 0.746, 0.4360]]
      expected[5].B.defeated = [archer.type, archer.type]

      testCombatWithCustomRolls(state, rolls, expected)
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
      const expected = initExpected(4, 15)

      expected[4].A.front = [[heavy.type, 0.918, 1.83]]
      expected[4].A.reserveFront = [archer.type]
      expected[4].B.front = [[archer.type, 1, 2.4]]
      expected[4].B.defeated = [archer.type]

      expected[15].A.front = [[archer.type, 1, 2.4]]
      expected[15].A.defeated = [heavy.type]
      expected[15].B.front = [[archer.type, 0.866, 1.72]]
      expected[15].B.reserveFront = [archer.type]
      expected[15].B.defeated = [archer.type, archer.type]

      testCombatWithCustomRolls(state, rolls, expected)
    })
  })
}

export default null
