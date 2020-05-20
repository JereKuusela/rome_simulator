import { TestState, initState, createCohort, testReinforcement, getSettingsTest, addToReserveTest, getBattleTest } from './utils'
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
    })

    const setRound = (round: number) => {
      getBattleTest(state).days.push({
        round: round - 1,
        startingPhaseNumber: 1
      })
    }

    const testBothDefeated = (strengthA: number, strengthD: number, moraleA: number, moraleD: number, rounds: number = 0) => {
      const [attacker, defender] = testReinforcement(rounds, state)
      expect(attacker.cohorts.defeated[0][UnitAttribute.Strength]).toBeCloseTo(strengthA)
      expect(attacker.cohorts.defeated[1][UnitAttribute.Strength]).toBeCloseTo(strengthA)
      expect(defender.cohorts.defeated[0][UnitAttribute.Strength]).toBeCloseTo(strengthD)
      expect(defender.cohorts.defeated[1][UnitAttribute.Strength]).toBeCloseTo(strengthD)
      expect(attacker.cohorts.defeated[0][UnitAttribute.Morale]).toBeCloseTo(moraleA)
      expect(attacker.cohorts.defeated[1][UnitAttribute.Morale]).toBeCloseTo(moraleA)
      expect(defender.cohorts.defeated[0][UnitAttribute.Morale]).toBeCloseTo(moraleD)
      expect(defender.cohorts.defeated[1][UnitAttribute.Morale]).toBeCloseTo(moraleD)
    }
    const testDefenderDefeated = (strengthA: number, strengthD: number, moraleA: number, moraleD: number, rounds: number = 0) => {
      const [attacker, defender] = testReinforcement(rounds, state)
      expect(attacker.cohorts.frontline[0][14]![UnitAttribute.Strength]).toBeCloseTo(strengthA)
      expect(attacker.cohorts.frontline[0][15]![UnitAttribute.Strength]).toBeCloseTo(strengthA)
      expect(defender.cohorts.defeated[0][UnitAttribute.Strength]).toBeCloseTo(strengthD)
      expect(defender.cohorts.defeated[1][UnitAttribute.Strength]).toBeCloseTo(strengthD)
      expect(attacker.cohorts.frontline[0][14]![UnitAttribute.Morale]).toBeCloseTo(moraleA)
      expect(attacker.cohorts.frontline[0][15]![UnitAttribute.Morale]).toBeCloseTo(moraleA)
      expect(defender.cohorts.defeated[0][UnitAttribute.Morale]).toBeCloseTo(moraleD)
      expect(defender.cohorts.defeated[1][UnitAttribute.Morale]).toBeCloseTo(moraleD)
    }
    const testAttackerDefeated = (strengthA: number, strengthD: number, moraleA: number, moraleD: number, rounds: number = 0) => {
      const [attacker, defender] = testReinforcement(rounds, state)
      expect(attacker.cohorts.defeated[0][UnitAttribute.Strength]).toBeCloseTo(strengthA)
      expect(attacker.cohorts.defeated[1][UnitAttribute.Strength]).toBeCloseTo(strengthA)
      expect(defender.cohorts.frontline[0][14]![UnitAttribute.Strength]).toBeCloseTo(strengthD)
      expect(defender.cohorts.frontline[0][15]![UnitAttribute.Strength]).toBeCloseTo(strengthD)
      expect(attacker.cohorts.defeated[0][UnitAttribute.Morale]).toBeCloseTo(moraleA)
      expect(attacker.cohorts.defeated[1][UnitAttribute.Morale]).toBeCloseTo(moraleA)
      expect(defender.cohorts.frontline[0][14]![UnitAttribute.Morale]).toBeCloseTo(moraleD)
      expect(defender.cohorts.frontline[0][15]![UnitAttribute.Morale]).toBeCloseTo(moraleD)
    }
    const testNoneDefeated = (strengthA: number, strengthD: number, moraleA: number, moraleD: number, rounds: number = 0) => {
      const [attacker, defender] = testReinforcement(rounds, state)
      expect(attacker.cohorts.frontline[0][14]![UnitAttribute.Strength]).toBeCloseTo(strengthA)
      expect(attacker.cohorts.frontline[0][15]![UnitAttribute.Strength]).toBeCloseTo(strengthA)
      expect(defender.cohorts.frontline[0][14]![UnitAttribute.Strength]).toBeCloseTo(strengthD)
      expect(defender.cohorts.frontline[0][15]![UnitAttribute.Strength]).toBeCloseTo(strengthD)
      expect(attacker.cohorts.frontline[0][14]![UnitAttribute.Morale]).toBeCloseTo(moraleA)
      expect(attacker.cohorts.frontline[0][15]![UnitAttribute.Morale]).toBeCloseTo(moraleA)
      expect(defender.cohorts.frontline[0][14]![UnitAttribute.Morale]).toBeCloseTo(moraleD)
      expect(defender.cohorts.frontline[0][15]![UnitAttribute.Morale]).toBeCloseTo(moraleD)
    }
    it('attacker stack wipes if it can\'t deploy', () => {
      addToReserveTest(state, SideType.Attacker, [lowMorale, lowMorale])
      addToReserveTest(state, SideType.Defender, [normal, normal])
      testAttackerDefeated(NO_STRENGTH, FULL_STRENGTH, NO_MORALE, FULL_MORALE)
    })
    it('defender stack wipes when no cohorts deploy', () => {
      addToReserveTest(state, SideType.Attacker, [lowMorale, lowMorale])
      addToReserveTest(state, SideType.Defender, [lowMorale, lowMorale])
      testBothDefeated(FULL_STRENGTH, NO_STRENGTH, LOW_MORALE, NO_MORALE)
    })
    it('attacker stack wipes when defender can hard wipe', () => {
      addToReserveTest(state, SideType.Attacker, [lowStrength, lowStrength])
      addToReserveTest(state, SideType.Defender, [normal, normal])
      testAttackerDefeated(NO_STRENGTH, FULL_STRENGTH, NO_MORALE, FULL_MORALE)
    })
    it('defender stack wipes when attacker can hard wipe but not deploy', () => {
      addToReserveTest(state, SideType.Attacker, [lowMorale, lowMorale])
      addToReserveTest(state, SideType.Defender, [lowStrength, lowStrength])
      testBothDefeated(FULL_STRENGTH, NO_STRENGTH, LOW_MORALE, NO_MORALE)
    })
    it('attacker stack wipes when defender can hard wipe at end', () => {
      addToReserveTest(state, SideType.Attacker, [hardLimit, hardLimit])
      addToReserveTest(state, SideType.Defender, [normal, normal])
      setRound(getSettingsTest(state)[Setting.StackwipeRounds])
      testAttackerDefeated(NO_STRENGTH, 0.99712, NO_MORALE, 2.9972)
    })
    it('defender stack wipes when attacker can hard wipe at end', () => {
      addToReserveTest(state, SideType.Attacker, [normal, normal])
      addToReserveTest(state, SideType.Defender, [hardLimit, hardLimit])
      setRound(getSettingsTest(state)[Setting.StackwipeRounds])
      testDefenderDefeated(0.99712, NO_STRENGTH, 2.9972, NO_MORALE)
    })
    it('attacker survives during battle even when defender could hard wipe', () => {
      addToReserveTest(state, SideType.Attacker, [hardStrengthLimit, hardStrengthLimit])
      addToReserveTest(state, SideType.Defender, [normal, normal])
      testNoneDefeated(0.07, 0.99712, 2.676, 2.97, 1)
    })
    it('defender survives during battle even when attacker could hard wipe', () => {
      addToReserveTest(state, SideType.Attacker, [normal, normal])
      addToReserveTest(state, SideType.Defender, [hardStrengthLimit, hardStrengthLimit])
      testNoneDefeated(0.99712, 0.07, 2.97, 2.676, 1)
    })
    it('attacker survives when defender can soft wipe after retreat limit', () => {
      addToReserveTest(state, SideType.Attacker, [softLimit, softLimit])
      addToReserveTest(state, SideType.Defender, [normal, normal])
      setRound(getSettingsTest(state)[Setting.StackwipeRounds])
      testAttackerDefeated(0.481, 0.986, 0.04, 2.99)
    })
    it('defender survives when attacker can soft wipe after retreat limit', () => {
      addToReserveTest(state, SideType.Attacker, [normal, normal])
      addToReserveTest(state, SideType.Defender, [softLimit, softLimit])
      setRound(getSettingsTest(state)[Setting.StackwipeRounds])
      testDefenderDefeated(0.986, 0.481, 2.99, 0.04)
    })
    it('attacker stack wipes when defender can soft wipe before retreat limit', () => {
      addToReserveTest(state, SideType.Attacker, [softLimit, softLimit])
      addToReserveTest(state, SideType.Defender, [normal, normal])
      setRound(getSettingsTest(state)[Setting.StackwipeRounds] - 1)
      testAttackerDefeated(NO_STRENGTH, 0.986, NO_MORALE, 2.99)
    })
    it('defender stack wipes when attacker can soft wipe before retreat limit', () => {
      addToReserveTest(state, SideType.Attacker, [normal, normal])
      addToReserveTest(state, SideType.Defender, [softLimit, softLimit])
      setRound(getSettingsTest(state)[Setting.StackwipeRounds] - 1)
      testDefenderDefeated(0.986, NO_STRENGTH, 2.99, NO_MORALE)
    })
  })
}

export default null
