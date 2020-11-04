import {
  TestState,
  initExpected,
  getSettingsTest,
  addToReserveTest,
  createArmyTest,
  testCombatWithDefaultRolls,
  createCohort,
  createWeakCohort,
  initCleanState,
  createFlankingCohort
} from './utils'
import { UnitType, Setting, SideType, UnitAttribute } from 'types'

describe('targeting', () => {
  const cohort = createCohort('Type' as UnitType)
  const weakCohort = createWeakCohort('Weak' as UnitType)
  const flankingCohort = createFlankingCohort('Flanking' as UnitType)

  let state: TestState
  beforeEach(() => (state = initCleanState()))

  it('main and flanks (Imperator targeting)', () => {
    getSettingsTest(state)[Setting.FixFlankTargeting] = true
    addToReserveTest(state, SideType.A, [cohort, cohort])
    addToReserveTest(state, SideType.B, [flankingCohort, flankingCohort, flankingCohort, flankingCohort])

    const expected = initExpected(1)
    expected[1].A.targeting = [3, 2]
    expected[1].B.targeting = [1, 0, 1, 0]

    testCombatWithDefaultRolls(state, expected)
  })

  it('main and flanks (EU4 targeting)', () => {
    getSettingsTest(state)[Setting.FixFlankTargeting] = false
    addToReserveTest(state, SideType.A, [cohort, cohort])
    addToReserveTest(state, SideType.B, [flankingCohort, flankingCohort, flankingCohort, flankingCohort])

    const expected = initExpected(1)
    expected[1].A.targeting = [3, 2]
    expected[1].B.targeting = [1, 0, 0, 0]

    testCombatWithDefaultRolls(state, expected)
  })

  it('inner flank (IR targeting)', () => {
    getSettingsTest(state)[Setting.FixFlankTargeting] = true
    addToReserveTest(state, SideType.A, [flankingCohort, flankingCohort, flankingCohort, flankingCohort])
    addToReserveTest(state, SideType.B, [weakCohort, weakCohort, weakCohort, weakCohort, weakCohort, weakCohort])

    const expected = initExpected(2)
    expected[2].A.targeting = [1, 0, 1, 0]
    expected[2].B.targeting = [undefined, undefined, 1, 0]
    expected[2].B.defeated = [weakCohort, weakCohort, weakCohort, weakCohort, weakCohort, weakCohort]

    testCombatWithDefaultRolls(state, expected)
  })

  it('inner flank (EU4 targeting)', () => {
    getSettingsTest(state)[Setting.FixFlankTargeting] = false
    addToReserveTest(state, SideType.A, [flankingCohort, flankingCohort, flankingCohort, flankingCohort])
    addToReserveTest(state, SideType.B, [weakCohort, weakCohort, weakCohort, weakCohort, weakCohort, weakCohort])

    const expected = initExpected(2)
    expected[2].A.targeting = [0, 0, 1, 0]
    expected[2].B.targeting = [undefined, undefined, 1, 0]
    expected[2].B.defeated = [weakCohort, weakCohort, weakCohort, weakCohort, weakCohort, weakCohort]

    testCombatWithDefaultRolls(state, expected)
  })

  it('reinforcement', () => {
    getSettingsTest(state)[Setting.BaseCombatWidth] = 1
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
    getSettingsTest(state)[Setting.BaseCombatWidth] = 1
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
    getSettingsTest(state)[Setting.BaseCombatWidth] = 1
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

  it("reinforcement with defender's advantage", () => {
    getSettingsTest(state)[Setting.BaseCombatWidth] = 1
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

  const strengthBasedFlank = (amount: number, target: number) => {
    getSettingsTest(state)[Setting.StrengthBasedFlank] = true
    flankingCohort.baseValues![UnitAttribute.Strength] = { key: amount }
    flankingCohort.baseValues![UnitAttribute.Morale] = { key: 10 }
    addToReserveTest(state, SideType.A, [flankingCohort, flankingCohort, flankingCohort])
    addToReserveTest(state, SideType.B, Array(30).fill(weakCohort))

    const expected = initExpected(2)
    expected[2].A.targeting = [target, 26, 25]
    if (target === 25) expected[2].B.defeated = [weakCohort, weakCohort, weakCohort, weakCohort, weakCohort]
    else expected[2].B.defeated = [weakCohort, weakCohort, weakCohort, weakCohort, weakCohort, weakCohort]

    testCombatWithDefaultRolls(state, expected)
  }

  it('strength based flank 100%', () => {
    strengthBasedFlank(1, 19)
  })

  it('strength based flank 75%', () => {
    strengthBasedFlank(0.75, 23)
  })

  it('strength based flank 50%', () => {
    strengthBasedFlank(0.5, 25)
  })

  it('strength based flank 25%', () => {
    strengthBasedFlank(0.25, 25)
  })

  it('weak targeting', () => {
    getSettingsTest(state)[Setting.DynamicTargeting] = true
    getSettingsTest(state)[Setting.RetreatRounds] = 10
    getSettingsTest(state)[Setting.MinimumMorale] = 0.25
    addToReserveTest(state, SideType.A, [cohort])
    addToReserveTest(state, SideType.B, [weakCohort, weakCohort, weakCohort])

    const expected = initExpected(1, 2, 3, 4)
    expected[1].A.targeting = [2]
    // Switches over to next target when the primary is weak.
    expected[2].A.targeting = [0]
    // Switches over to the next target.
    expected[3].A.targeting = [1]
    // Switches back to primary when all targets are weak.
    expected[4].A.targeting = [2]

    testCombatWithDefaultRolls(state, expected)
  })
})

export default null
