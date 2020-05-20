import { addValues } from 'definition_values'
import { getUnit, TestState, initState, initSide, testCombat, getSettingsTest, addToReserveTest, getArmyTest } from './utils'
import { UnitType, UnitAttribute, Setting, ValuesType, SideType, UnitRole, UnitPreferenceType } from 'types'
import { setUnitPreference } from 'managers/army'

if (process.env.REACT_APP_GAME !== 'euiv') {

  describe('targeting', () => {
    const archer = addValues(getUnit(UnitType.Archers), ValuesType.Modifier, 'Initial', [[UnitAttribute.Morale, -0.2]])
    const light = addValues(getUnit(UnitType.LightCavalry), ValuesType.Modifier, 'Initial', [[UnitAttribute.Morale, -0.2]])
    const heavy = addValues(getUnit(UnitType.HeavyCavalry), ValuesType.Modifier, 'Initial', [[UnitAttribute.Morale, -0.2]])

    let state: TestState
    beforeEach(() => state = initState(true))

    it('main and flanks', () => {
      addToReserveTest(state, SideType.Attacker, [archer, archer])
      addToReserveTest(state, SideType.Defender, [archer, archer, light, light])

      const rolls = [[5, 0]]
      const { attacker, defender } = initSide(1)

      attacker[0][14] = attacker[0][15] = [archer.type, 964, 0.9983]

      defender[0][13] = defender[0][16] = [light.type, 1000, 1.2]
      defender[0][14] = defender[0][15] = [archer.type, 964, 0.9982]

      testCombat(state, rolls, attacker, defender)
    })

    it('inner flank', () => {
      getSettingsTest(state)[Setting.FixTargeting] = false
      getSettingsTest(state)[Setting.DefenderAdvantage] = true

      addToReserveTest(state, SideType.Attacker, [heavy, heavy, archer, archer])
      addToReserveTest(state, SideType.Defender, [archer, archer, archer, archer])
      setUnitPreference(getArmyTest(state, SideType.Attacker), UnitPreferenceType.Primary, UnitType.HeavyCavalry)

      const rolls = [[5, 5], [0, 6]]
      const { attacker, defender } = initSide(6)

      attacker[0] = attacker[1] = attacker[2] = attacker[3] = attacker[4] = null as any
      defender[0] = defender[1] = defender[2] = defender[3] = defender[4] = null as any

      attacker[5][13] = attacker[5][16] = [archer.type, 832, 0.5106]
      attacker[5][14] = attacker[5][15] = [heavy.type, 825, 0.7620]

      defender[5][14] = [archer.type, 778, 0.3212]
      defender[5][15] = [archer.type, 819, 0.4788]

      testCombat(state, rolls, attacker, defender)
    })

    it('inner flank (fixed)', () => {
      // Can't be tested in game.
      getSettingsTest(state)[Setting.FixTargeting] = true
      getSettingsTest(state)[Setting.DefenderAdvantage] = true

      addToReserveTest(state, SideType.Attacker, [heavy, heavy, archer, archer])
      addToReserveTest(state, SideType.Defender, [archer, archer, archer, archer])
      setUnitPreference(getArmyTest(state, SideType.Attacker), UnitPreferenceType.Primary, UnitType.HeavyCavalry)

      const rolls = [[5, 5], [0, 6]]
      const { attacker, defender } = initSide(6)

      attacker[0] = attacker[1] = attacker[2] = attacker[3] = attacker[4] = null as any
      defender[0] = defender[1] = defender[2] = defender[3] = defender[4] = null as any

      attacker[5][13] = attacker[5][16] = [archer.type, 832, 0.5106]
      attacker[5][14] = attacker[5][15] = [heavy.type, 825, 0.7620]

      defender[5][14] = defender[5][15] = [archer.type, 798, 0.4]

      testCombat(state, rolls, attacker, defender)
    })
  })
}

export default null
