import { TestState, initExpected, getSettingsTest, addToReserveTest, getArmyTest, createArmyTest, testCombatWithDefaultRolls, createCohort, createWeakCohort, initCleanState } from './utils'
import { UnitType, Setting, SideType, UnitPreferenceType } from 'types'
import { setUnitPreference } from 'managers/army'

if (process.env.REACT_APP_GAME !== 'euiv') {

  describe('targeting', () => {
    const cohort = createCohort('Type' as UnitType)
    const weakCohort = createWeakCohort('Weak' as UnitType)
    const flankingCohort = createCohort('Flanking' as UnitType)

    let state: TestState
    beforeEach(() => state = initCleanState())

    it('main and flanks', () => {
      addToReserveTest(state, SideType.A, [cohort, cohort])
      addToReserveTest(state, SideType.B, [cohort, cohort, cohort, cohort])

      const expected = initExpected(1)
      expected[1].A.targeting = [3, 2]
      expected[1].B.targeting = [1, 0, 1, 0]

      testCombatWithDefaultRolls(state, expected)
    })

    it('inner flank', () => {

      addToReserveTest(state, SideType.A, [cohort, cohort, flankingCohort, flankingCohort, flankingCohort, flankingCohort])
      addToReserveTest(state, SideType.B, [cohort, cohort, weakCohort, weakCohort, weakCohort, weakCohort])
      setUnitPreference(getArmyTest(state, SideType.A), UnitPreferenceType.Primary, flankingCohort.type)
      setUnitPreference(getArmyTest(state, SideType.B), UnitPreferenceType.Primary, weakCohort.type)

      const expected = initExpected(2)
      expected[2].A.targeting = [1, 0, 1, 0, 1, 0]
      expected[2].B.targeting = [undefined, undefined, 3, 2]
      expected[2].B.defeated = [weakCohort, weakCohort, weakCohort, weakCohort]

      testCombatWithDefaultRolls(state, expected)
    })

    it('reinforcement', () => {
      getSettingsTest(state)[Setting.CombatWidth] = 1 
      addToReserveTest(state, SideType.A, [cohort])
      addToReserveTest(state, SideType.B, [weakCohort, weakCohort])

      const expected = initExpected(1, 2)
      expected[1].A.targeting = [1]
      expected[1].B.targeting = [0]
      expected[1].B.reserveFront = [weakCohort]
      expected[1].B.defeated = [weakCohort]
      expected[2].A.targeting = [0]
      expected[2].B.targeting = [0]
      expected[2].B.defeated = [weakCohort, weakCohort]

      testCombatWithDefaultRolls(state, expected)
    })

    it('deployment after battle', () => {
      getSettingsTest(state)[Setting.CombatWidth] = 1 
      addToReserveTest(state, SideType.A, [cohort])
      addToReserveTest(state, SideType.B, [weakCohort])
      createArmyTest(state, SideType.B, 2)
      addToReserveTest(state, SideType.B, [weakCohort], 1)

      const expected = initExpected(1, 2)
      expected[1].A.targeting = [0]
      expected[1].B.targeting = [0]
      expected[1].B.defeated = [weakCohort]
      expected[2].A.targeting = [undefined]
      expected[2].B.targeting = [undefined]
      expected[2].B.defeated = [weakCohort]
      expected[2].attackerFlipped = true

      testCombatWithDefaultRolls(state, expected)
    })

    it('deployment during battle', () => {
      getSettingsTest(state)[Setting.CombatWidth] = 1 
      addToReserveTest(state, SideType.A, [cohort])
      addToReserveTest(state, SideType.B, [weakCohort, weakCohort])
      createArmyTest(state, SideType.B, 2)
      addToReserveTest(state, SideType.B, [weakCohort], 1)

      const expected = initExpected(1, 2)
      expected[1].A.targeting = [1]
      expected[1].B.targeting = [0]
      expected[1].B.reserveFront = [weakCohort]
      expected[1].B.defeated = [weakCohort]
      expected[2].A.targeting = [1000]
      expected[2].B.targeting = [0]
      expected[2].B.reserveFront = [weakCohort]
      expected[2].B.defeated = [weakCohort, weakCohort]

      testCombatWithDefaultRolls(state, expected)
    })
    
    it('reinforcement with defender\'s advantage', () => {
      getSettingsTest(state)[Setting.CombatWidth] = 1 
      getSettingsTest(state)[Setting.DefenderAdvantage] = true
      addToReserveTest(state, SideType.A, [cohort])
      addToReserveTest(state, SideType.B, [weakCohort, weakCohort])

      const expected = initExpected(1, 2)
      expected[1].A.targeting = [1]
      expected[1].B.targeting = [0]
      expected[1].B.reserveFront = [weakCohort]
      expected[1].B.defeated = [weakCohort]
      // Defender is untargetable right after reinforcing.
      expected[2].A.targeting = [undefined]
      expected[2].B.targeting = [0]
      expected[2].B.defeated = [weakCohort]

      testCombatWithDefaultRolls(state, expected)
    })
  })
}

export default null
