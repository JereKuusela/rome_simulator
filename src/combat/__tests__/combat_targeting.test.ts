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
      const { expectedA, expectedB } = initExpected(1)

      expectedA[1].front = [[archer.type, 0.956, 1.9140], [archer.type, 0.956, 1.9140]]
      expectedB[1].front = [[archer.type, 0.956, 1.914], [archer.type, 0.956, 1.914], [light.type, 1, 2.4], [light.type, 1, 2.4]]

      testCombat(state, rolls, expectedA, expectedB)
    })

    it('inner flank', () => {
      getSettingsTest(state)[Setting.FixTargeting] = false
      getSettingsTest(state)[Setting.DefenderAdvantage] = true

      addToReserveTest(state, SideType.A, [heavy, heavy, archer, archer])
      addToReserveTest(state, SideType.B, [archer, archer, archer, archer])
      setUnitPreference(getArmyTest(state, SideType.A), UnitPreferenceType.Primary, UnitType.HeavyCavalry)

      const rolls = [[5, 5]]
      const { expectedA, expectedB } = initExpected(5)

      expectedA[5].front = [[heavy.type, 0.826, 1.4929], [heavy.type, 0.826, 1.4929], [archer.type, 0.838, 1.0341], [archer.type, 0.838, 1.0341]]
      // Front line contains one defeated proxy cohort.
      expectedB[5].front = [[archer.type, 0.801, 0.8586], [archer.type, 0.690, 0.0134]]
      expectedB[5].defeated = [archer.type, archer.type, archer.type]

      testCombat(state, rolls, expectedA, expectedB)
    })

    it('inner flank (fixed)', () => {
      // Can't be tested in game.
      getSettingsTest(state)[Setting.FixTargeting] = true
      getSettingsTest(state)[Setting.DefenderAdvantage] = true

      addToReserveTest(state, SideType.A, [heavy, heavy, archer, archer])
      addToReserveTest(state, SideType.B, [archer, archer, archer, archer])
      setUnitPreference(getArmyTest(state, SideType.A), UnitPreferenceType.Primary, UnitType.HeavyCavalry)

      const rolls = [[5, 5], [0, 6]]
      const { expectedA, expectedB } = initExpected(5)

      expectedA[5].front = [[heavy.type, 0.826, 1.4929], [heavy.type, 0.826, 1.4929], [archer.type, 0.838, 1.0341], [archer.type, 0.838, 1.0341]]
      expectedB[5].front = [[archer.type, 0.746, 0.4360], [archer.type, 0.746, 0.4360]]
      expectedB[5].defeated = [archer.type, archer.type]

      testCombat(state, rolls, expectedA, expectedB)
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
      const { expectedA, expectedB } = initExpected(4, 15)

      expectedA[4].front = [[heavy.type, 0.918, 1.83]]
      expectedA[4].reserveFront = [archer.type]
      expectedB[4].front = [[archer.type, 1, 2.4]]
      expectedB[4].defeated = [archer.type]

      expectedA[15].front = [[archer.type, 1, 2.4]]
      expectedA[15].defeated = [heavy.type]
      expectedB[15].front = [[archer.type, 0.866, 1.72]]
      expectedB[15].reserveFront = [archer.type]
      expectedB[15].defeated = [archer.type, archer.type]

      testCombat(state, rolls, expectedA, expectedB)
    })
  })
}

export default null
