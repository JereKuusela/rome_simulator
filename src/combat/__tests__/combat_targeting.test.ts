import { addValues } from 'definition_values'
import { getUnit, TestState, initState, initExpected, testCombat, getSettingsTest, addToReserveTest, getArmyTest, createArmyTest } from './utils'
import { UnitType, UnitAttribute, Setting, ValuesType, SideType, UnitRole, UnitPreferenceType } from 'types'
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
      const { attacker, defender } = initExpected(0)

      attacker[0][14] = attacker[0][15] = [archer.type, 956, 1.9140]

      defender[0][13] = defender[0][16] = [light.type, 1000, 2.4]
      defender[0][14] = defender[0][15] = [archer.type, 956, 1.914]

      testCombat(state, rolls, attacker, defender)
    })

    it('inner flank', () => {
      getSettingsTest(state)[Setting.FixTargeting] = false
      getSettingsTest(state)[Setting.DefenderAdvantage] = true

      addToReserveTest(state, SideType.A, [heavy, heavy, archer, archer])
      addToReserveTest(state, SideType.B, [archer, archer, archer, archer])
      setUnitPreference(getArmyTest(state, SideType.A), UnitPreferenceType.Primary, UnitType.HeavyCavalry)

      const rolls = [[5, 5]]
      const { attacker, defender } = initExpected(4)

      attacker[4][13] = attacker[4][16] = [archer.type, 838, 1.0341]
      attacker[4][14] = attacker[4][15] = [heavy.type, 826, 1.4929]

      defender[4][14] = [archer.type, 690, 0.0134]
      defender[4][15] = [archer.type, 801, 0.8586]

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
      const { attacker, defender } = initExpected(4)

      attacker[4][13] = attacker[4][16] = [archer.type, 838, 1.0341]
      attacker[4][14] = attacker[4][15] = [heavy.type, 826, 1.4929]

      defender[4][14] = defender[4][15] = [archer.type, 746, 0.4360]

      testCombat(state, rolls, attacker, defender)
    })

    it('defender\'s advantage', () => {
      getSettingsTest(state)[Setting.DefenderAdvantage] = true
      addToReserveTest(state, SideType.A, Array(30).fill(archer))
      addToReserveTest(state, SideType.A, Array(30).fill(heavy))
      setUnitPreference(getArmyTest(state, SideType.A), UnitPreferenceType.Primary, UnitType.HeavyCavalry)

      addToReserveTest(state, SideType.B, Array(60).fill(archer))
      createArmyTest(state, SideType.B)
      addToReserveTest(state, SideType.B, Array(60).fill(archer), 1)

      /*const rolls = [[5, 0]]
      const { attacker, defender } = initSide(1)

      attacker[0][14] = attacker[0][15] = [archer.type, 964, 0.9983]

      defender[0][13] = defender[0][16] = [light.type, 1000, 1.2]
      defender[0][14] = defender[0][15] = [archer.type, 964, 0.9982]

      testCombat(state, rolls, attacker, defender)*/
    })
  })
}

export default null
