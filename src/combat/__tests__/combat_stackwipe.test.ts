import { TestState, initState, createCohort, getSettingsTest, addToReserveTest, getBattleTest, initExpected, testCombatWithCustomRolls } from './utils'
import { UnitType, UnitAttribute, CohortDefinition, Setting, SideType } from 'types'

if (process.env.REACT_APP_GAME !== 'euiv') {


  describe('stack wipe', () => {
    let lowMorale = null as any as CohortDefinition
    let hardLimit = null as any as CohortDefinition
    let hardStrengthLimit = null as any as CohortDefinition
    let softLimit = null as any as CohortDefinition
    let lowStrength = null as any as CohortDefinition
    let normal = null as any as CohortDefinition
    
    const type = 'Test' as UnitType

    const FULL_STRENGTH = 1.0
    const LOW_STRENGTH = 0.05
    const LIMIT_MORALE = 0.26
    const LIMIT_STRENGTH = 0.1
    const NO_STRENGTH = 0.0
    const FULL_MORALE = 3.0
    const LOW_MORALE = 0.1
    const NO_MORALE = 0.0

    let state: TestState
    beforeEach(() => {
      state = initState()
      lowMorale = createCohort(type)
      lowMorale.baseValues![UnitAttribute.Morale] = { 'key': LOW_MORALE }
      lowMorale.baseValues![UnitAttribute.Strength] = { 'key': FULL_STRENGTH }
      lowStrength = createCohort(type)
      lowStrength.baseValues![UnitAttribute.Morale] = { 'key': FULL_MORALE }
      lowStrength.baseValues![UnitAttribute.Strength] = { 'key': LOW_STRENGTH }
      hardLimit = createCohort(type)
      hardLimit.baseValues![UnitAttribute.Morale] = { 'key': LIMIT_MORALE }
      hardLimit.baseValues![UnitAttribute.Strength] = { 'key': LIMIT_STRENGTH }
      hardStrengthLimit = createCohort(type)
      hardStrengthLimit.baseValues![UnitAttribute.Morale] = { 'key': FULL_MORALE }
      hardStrengthLimit.baseValues![UnitAttribute.Strength] = { 'key': LIMIT_STRENGTH }
      softLimit = createCohort(type)
      softLimit.baseValues![UnitAttribute.Morale] = { 'key': LIMIT_MORALE }
      softLimit.baseValues![UnitAttribute.Strength] = { 'key': FULL_STRENGTH / 2 }
      normal = createCohort(type)
      normal.baseValues![UnitAttribute.Morale] = { 'key': FULL_MORALE }
      normal.baseValues![UnitAttribute.Strength] = { 'key': FULL_STRENGTH }
      getSettingsTest(state)[Setting.DailyDamageIncrease] = 0
      getSettingsTest(state)[Setting.StackwipeRounds] = 5
      getSettingsTest(state)[Setting.MoraleHitForLateDeployment] = 0
    })

    const setRound = (round: number) => {
      getBattleTest(state).days.push({
        round: round - 1,
        startingPhaseNumber: 1,
        attacker: SideType.A
      })
    }

    const testBothDefeated = (strengthA: number, strengthB: number, moraleA: number, moraleB: number, rounds: number = 0) => {
      const expected = initExpected(rounds)
      expected[rounds].A.defeated = [[type, strengthA, moraleA], [type, strengthA, moraleA]]
      expected[rounds].B.defeated = [[type, strengthB, moraleB], [type, strengthB, moraleB]]
      testCombatWithCustomRolls(state, [], expected)
    }
    const testDefenderDefeated = (strengthA: number, strengthB: number, moraleA: number, moraleB: number, rounds: number = 0) => {
      const expected = initExpected(rounds)
      expected[rounds].A.front = [[type, strengthA, moraleA], [type, strengthA, moraleA]]
      expected[rounds].B.defeated = [[type, strengthB, moraleB], [type, strengthB, moraleB]]
      testCombatWithCustomRolls(state, [], expected)
    }
    const testAttackerDefeated = (strengthA: number, strengthB: number, moraleA: number, moraleB: number, rounds: number = 0) => {
      const expected = initExpected(rounds)
      expected[rounds].A.defeated = [[type, strengthA, moraleA], [type, strengthA, moraleA]]
      expected[rounds].B.front = [[type, strengthB, moraleB], [type, strengthB, moraleB]]
      testCombatWithCustomRolls(state, [], expected)
    }
    const testNoneDefeated = (strengthA: number, strengthB: number, moraleA: number, moraleB: number, rounds: number = 0) => {
      const expected = initExpected(rounds)
      expected[rounds].A.front = [[type, strengthA, moraleA], [type, strengthA, moraleA]]
      expected[rounds].B.front = [[type, strengthB, moraleB], [type, strengthB, moraleB]]
      testCombatWithCustomRolls(state, [], expected)
    }
    it('attacker stack wipes if it can\'t deploy', () => {
      addToReserveTest(state, SideType.A, [lowMorale, lowMorale])
      addToReserveTest(state, SideType.B, [normal, normal])
      testAttackerDefeated(NO_STRENGTH, FULL_STRENGTH, NO_MORALE, FULL_MORALE)
    })
    it('defender stack wipes when no cohorts deploy', () => {
      addToReserveTest(state, SideType.A, [lowMorale, lowMorale])
      addToReserveTest(state, SideType.B, [lowMorale, lowMorale])
      testBothDefeated(FULL_STRENGTH, NO_STRENGTH, LOW_MORALE, NO_MORALE)
    })
    it('attacker stack wipes when defender can hard wipe', () => {
      addToReserveTest(state, SideType.A, [lowStrength, lowStrength])
      addToReserveTest(state, SideType.B, [normal, normal])
      testAttackerDefeated(NO_STRENGTH, FULL_STRENGTH, NO_MORALE, FULL_MORALE)
    })
    it('defender stack wipes when attacker can hard wipe but not deploy', () => {
      addToReserveTest(state, SideType.A, [lowMorale, lowMorale])
      addToReserveTest(state, SideType.B, [lowStrength, lowStrength])
      testBothDefeated(FULL_STRENGTH, NO_STRENGTH, LOW_MORALE, NO_MORALE)
    })
    it('attacker stack wipes when defender can hard wipe at end', () => {
      addToReserveTest(state, SideType.A, [hardLimit, hardLimit])
      addToReserveTest(state, SideType.B, [normal, normal])
      setRound(getSettingsTest(state)[Setting.StackwipeRounds])
      testAttackerDefeated(NO_STRENGTH, 0.99712, NO_MORALE, 2.9972)
    })
    it('defender stack wipes when attacker can hard wipe at end', () => {
      addToReserveTest(state, SideType.A, [normal, normal])
      addToReserveTest(state, SideType.B, [hardLimit, hardLimit])
      setRound(getSettingsTest(state)[Setting.StackwipeRounds])
      testDefenderDefeated(0.99712, NO_STRENGTH, 2.9972, NO_MORALE)
    })
    it('attacker survives during battle even when defender could hard wipe', () => {
      addToReserveTest(state, SideType.A, [hardStrengthLimit, hardStrengthLimit])
      addToReserveTest(state, SideType.B, [normal, normal])
      testNoneDefeated(0.071, 0.99712, 2.676, 2.97, 1)
    })
    it('defender survives during battle even when attacker could hard wipe', () => {
      addToReserveTest(state, SideType.A, [normal, normal])
      addToReserveTest(state, SideType.B, [hardStrengthLimit, hardStrengthLimit])
      testNoneDefeated(0.99712, 0.071, 2.97, 2.676, 1)
    })
    it('attacker survives when defender can soft wipe after retreat limit', () => {
      addToReserveTest(state, SideType.A, [softLimit, softLimit])
      addToReserveTest(state, SideType.B, [normal, normal])
      setRound(getSettingsTest(state)[Setting.StackwipeRounds])
      testAttackerDefeated(0.471, 0.985, 0.0, 2.99)
    })
    it('defender survives when attacker can soft wipe after retreat limit', () => {
      addToReserveTest(state, SideType.A, [normal, normal])
      addToReserveTest(state, SideType.B, [softLimit, softLimit])
      setRound(getSettingsTest(state)[Setting.StackwipeRounds])
      testDefenderDefeated(0.985, 0.471, 2.99, 0.0)
    })
    it('attacker stack wipes when defender can soft wipe before retreat limit', () => {
      addToReserveTest(state, SideType.A, [softLimit, softLimit])
      addToReserveTest(state, SideType.B, [normal, normal])
      setRound(getSettingsTest(state)[Setting.StackwipeRounds] - 1)
      testAttackerDefeated(NO_STRENGTH, 0.985, NO_MORALE, 2.99)
    })
    it('defender stack wipes when attacker can soft wipe before retreat limit', () => {
      addToReserveTest(state, SideType.A, [normal, normal])
      addToReserveTest(state, SideType.B, [softLimit, softLimit])
      setRound(getSettingsTest(state)[Setting.StackwipeRounds] - 1)
      testDefenderDefeated(0.985, NO_STRENGTH, 2.99, NO_MORALE)
    })
  })
}

export default null
