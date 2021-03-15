/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  TestState,
  initCleanState,
  initExpected,
  getSettingsTest,
  createCohort,
  testCombatWithDefaultRolls,
  addToReserveTest,
  createArmyTest,
  setGeneralAttributeTest,
  Expected,
  createStrongCohort
} from './utils'
import { UnitType, SideType, Setting, GeneralAttribute, CombatPhase } from 'types'

if (process.env.REACT_APP_GAME === 'IR') {
  describe('leaders', () => {
    const cohort = createCohort('Type' as UnitType)
    const strongCohort = createStrongCohort('Strong' as UnitType)

    let expected: Expected[]
    let state: TestState
    beforeEach(() => {
      state = initCleanState()
      getSettingsTest(state)[Setting.Martial] = true
      getSettingsTest(state)[Setting.FireAndShock] = true
      addToReserveTest(state, SideType.A, [cohort])
      addToReserveTest(state, SideType.B, [cohort])
      expected = initExpected(2)
      expected[2].A.leader = 0
      expected[2].B.leader = 0
    })

    afterEach(() => {
      testCombatWithDefaultRolls(state, expected)
    })

    it('stronger leader takes over (martial)', () => {
      createArmyTest(state, SideType.A, 2)
      setGeneralAttributeTest(state, SideType.A, GeneralAttribute.Martial, 1, 1)

      expected[2].A.leader = 1
    })

    it('stronger leader takes over (shock + fire)', () => {
      createArmyTest(state, SideType.A, 2)
      setGeneralAttributeTest(state, SideType.A, CombatPhase.Fire, 1, 0)
      setGeneralAttributeTest(state, SideType.A, CombatPhase.Shock, 2, 1)

      expected[2].A.leader = 1
    })

    it('stronger leader is selected (martial)', () => {
      createArmyTest(state, SideType.A, 1)
      setGeneralAttributeTest(state, SideType.A, GeneralAttribute.Martial, 1, 1)

      expected[2].A.leader = 1
    })

    it('stronger leader is selected  (shock + fire)', () => {
      createArmyTest(state, SideType.A, 1)
      setGeneralAttributeTest(state, SideType.A, CombatPhase.Fire, 1, 0)
      setGeneralAttributeTest(state, SideType.A, CombatPhase.Shock, 2, 1)

      expected[2].A.leader = 1
    })

    it('current leader is prioritized on ties', () => {
      createArmyTest(state, SideType.A, 2)
      setGeneralAttributeTest(state, SideType.A, CombatPhase.Fire, 1, 0)
      setGeneralAttributeTest(state, SideType.A, CombatPhase.Shock, 1, 1)
    })

    it("retreated leader won't join the battle again", () => {
      cohort.baseValues![CombatPhase.Fire] = { key: 1 }
      strongCohort.baseValues![CombatPhase.Fire] = { key: 1 }
      createArmyTest(state, SideType.A, 2)
      addToReserveTest(state, SideType.A, [strongCohort], 1)
      addToReserveTest(state, SideType.B, [strongCohort])
      setGeneralAttributeTest(state, SideType.A, GeneralAttribute.Martial, 10, 0)
      expected[2].A.leader = 1
      expected[2].A.defeated = [cohort.type]
    })
  })
}
