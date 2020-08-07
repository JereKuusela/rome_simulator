import { addValues } from 'definition_values'
import { getUnit, TestState, initCleanState, initExpected, getSettingsTest, createCohort, createDefeatedCohort, testCombatWithDefaultRolls, addToReserveTest, selectTacticTest, createArmyTest, setGeneralAttributeTest, getArmyTest } from './utils'
import { UnitType, UnitAttribute, TacticType, ValuesType, SideType, Setting, Mode, GeneralAttribute } from 'types'

if (process.env.REACT_APP_GAME !== 'euiv') {

  describe('tactics', () => {
    const type = 'Type' as UnitType
    const neutralType = 'Neutral' as UnitType

    const unit = createCohort(type, true)
    const neutralUnit = createDefeatedCohort(neutralType)

    let state: TestState
    beforeEach(() => {
      state = initCleanState()
      getSettingsTest(state)[Setting.Tactics] = true
      getSettingsTest(state)[Setting.DefenderAdvantage] = false
      getSettingsTest(state)[Setting.Martial] = true
      state.settings.combatSettings[Mode.Land][Setting.MoraleLostMultiplier] = 50/3
      state.settings.combatSettings[Mode.Land][Setting.StrengthLostMultiplier] = 50/3
    })

    it('mixed casualties add up correctly', () => {
      selectTacticTest(state, SideType.A, TacticType.Skirmishing)
      selectTacticTest(state, SideType.B, TacticType.ShockAction)
      addToReserveTest(state, SideType.A, [unit])
      addToReserveTest(state, SideType.B, [unit])

      const expected = initExpected(1)
      expected[1].A.front = [[unit.type, 0.915, 0.9]]
      expected[1].B.front = [[unit.type, 0.915, 0.9]]

      testCombatWithDefaultRolls(state, expected)
    })

    it('tactic efficiency changes based on manpower', () => {
      state.tactics[TacticType.ShockAction].baseValues![type] = { 'key': 1 }
      selectTacticTest(state, SideType.A, TacticType.ShockAction)
      selectTacticTest(state, SideType.B, TacticType.PadmaVyuha)
      addToReserveTest(state, SideType.A, [unit, neutralUnit])
      addToReserveTest(state, SideType.B, [unit])

      const expected = initExpected(1, 2)

      expected[1].A.front = [[unit.type, 0.91, 0.91]]
      expected[1].A.defeated = [neutralUnit.type]
      expected[2].A.front = [[unit.type, 0.829, 0.83872]]
      expected[2].A.defeated = [neutralUnit.type]

      expected[1].B.front = [[unit.type, 0.89, 0.89]]
      expected[2].B.front = [[unit.type, 0.79, 0.7993]]

      testCombatWithDefaultRolls(state, expected)
    })

    it('retreated armies have no effect on efficiency', () => {
      state.tactics[TacticType.ShockAction].baseValues![type] = { 'key': 1 }
      createArmyTest(state, SideType.A, 1)
      selectTacticTest(state, SideType.A, TacticType.ShockAction)
      selectTacticTest(state, SideType.A, TacticType.ShockAction, 1)
      selectTacticTest(state, SideType.B, TacticType.PadmaVyuha)
      addToReserveTest(state, SideType.A, [neutralUnit])
      addToReserveTest(state, SideType.A, [unit], 1)
      addToReserveTest(state, SideType.B, [unit])

      const expected = initExpected(1, 2)
      expected[1].A.front = []
      expected[1].A.defeated = [neutralUnit.type]
      expected[2].A.front = [[unit.type, 0.91, 0.91]]
      expected[2].A.defeated = [neutralUnit.type]
      expected[2].B.front = [[unit.type, 0.88, 0.88]]

      testCombatWithDefaultRolls(state, expected)
    })

    it('incoming armies have no effect on efficiency', () => {
      state.tactics[TacticType.ShockAction].baseValues![type] = { 'key': 1 }
      createArmyTest(state, SideType.A, 2)
      selectTacticTest(state, SideType.A, TacticType.ShockAction)
      selectTacticTest(state, SideType.A, TacticType.ShockAction, 1)
      selectTacticTest(state, SideType.B, TacticType.PadmaVyuha)
      addToReserveTest(state, SideType.A, [unit])
      addToReserveTest(state, SideType.A, [neutralUnit], 1)
      addToReserveTest(state, SideType.B, [unit])

      const expected = initExpected(1)
      expected[1].A.front = [[unit.type, 0.91, 0.91]]
      expected[1].B.front = [[unit.type, 0.88, 0.88]]

      testCombatWithDefaultRolls(state, expected)
    })

    it('tactic changes when a stronger general joins', () => {
      state.tactics[TacticType.ShockAction].baseValues![type] = { 'key': 1 }
      createArmyTest(state, SideType.A, 2)
      selectTacticTest(state, SideType.A, TacticType.Bottleneck)
      selectTacticTest(state, SideType.A, TacticType.ShockAction, 1)
      selectTacticTest(state, SideType.B, TacticType.PadmaVyuha)
      setGeneralAttributeTest(state, SideType.A, GeneralAttribute.Martial, 1, 1)
      addToReserveTest(state, SideType.A, [unit])
      addToReserveTest(state, SideType.B, [unit])

      const expected = initExpected(1, 2)
      expected[1].A.front = [[unit.type, 0.91, 0.9]]
      expected[1].B.front = [[unit.type, 0.91, 0.9]]
      expected[2].A.front = [[unit.type, 0.828, 0.82629]]
      expected[2].B.front = [[unit.type, 0.8, 0.80172]]

      testCombatWithDefaultRolls(state, expected)
    })
  })
}

export default null
