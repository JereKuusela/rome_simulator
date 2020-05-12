import { TestInfo, initInfo, createCohort, testReinforcement } from './utils'
import { UnitType, UnitAttribute, CohortDefinition, Setting } from 'types'

if (process.env.REACT_APP_GAME !== 'euiv') {

  describe('stack wipe', () => {
    let lowMorale = null as any as CohortDefinition
    let hardLimit = null as any as CohortDefinition
    let hardStrengthLimit = null as any as CohortDefinition
    let softLimit = null as any as CohortDefinition
    let lowStrength = null as any as CohortDefinition
    let normal = null as any as CohortDefinition

    const FULL_STRENGTH = 1.0
    const LOW_STRENGTH = 0.05
    const LIMIT_MORALE = 0.26
    const LIMIT_STRENGTH = 0.1
    const NO_STRENGTH = 0.0
    const FULL_MORALE = 3.0
    const LOW_MORALE = 0.1
    const NO_MORALE = 0.0

    let info: TestInfo
    beforeEach(() => {
      info = initInfo()
      lowMorale = createCohort(UnitType.Archers)
      lowMorale.baseValues![UnitAttribute.Morale] = { 'key': LOW_MORALE }
      lowMorale.baseValues![UnitAttribute.Strength] = { 'key': FULL_STRENGTH }
      lowStrength = createCohort(UnitType.Archers)
      lowStrength.baseValues![UnitAttribute.Morale] = { 'key': FULL_MORALE }
      lowStrength.baseValues![UnitAttribute.Strength] = { 'key': LOW_STRENGTH }
      hardLimit = createCohort(UnitType.Archers)
      hardLimit.baseValues![UnitAttribute.Morale] = { 'key': LIMIT_MORALE }
      hardLimit.baseValues![UnitAttribute.Strength] = { 'key': LIMIT_STRENGTH }
      hardStrengthLimit = createCohort(UnitType.Archers)
      hardStrengthLimit.baseValues![UnitAttribute.Morale] = { 'key': FULL_MORALE }
      hardStrengthLimit.baseValues![UnitAttribute.Strength] = { 'key': LIMIT_STRENGTH }
      softLimit = createCohort(UnitType.Archers)
      softLimit.baseValues![UnitAttribute.Morale] = { 'key': LIMIT_MORALE }
      softLimit.baseValues![UnitAttribute.Strength] = { 'key': FULL_STRENGTH / 2 }
      normal = createCohort(UnitType.Archers)
      normal.baseValues![UnitAttribute.Morale] = { 'key': FULL_MORALE }
      normal.baseValues![UnitAttribute.Strength] = { 'key': FULL_STRENGTH }
      info.settings[Setting.DailyDamageIncrease] = 0
      info.settings[Setting.StackwipeRounds] = 5
    })

    const testBothDefeated = (strengthA: number, strengthD: number, moraleA: number, moraleD: number, rounds: number = 0) => {
      const [attacker, defender] = testReinforcement(rounds, info)
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
      const [attacker, defender] = testReinforcement(rounds, info)
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
      const [attacker, defender] = testReinforcement(rounds, info)
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
      const [attacker, defender] = testReinforcement(rounds, info)
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
      info.armyA.reserve.push(lowMorale)
      info.armyA.reserve.push(lowMorale)
      info.armyD.reserve.push(normal)
      info.armyD.reserve.push(normal)
      testAttackerDefeated(NO_STRENGTH, FULL_STRENGTH, NO_MORALE, FULL_MORALE)
    })
    it('defender stack wipes when no cohorts deploy', () => {
      info.armyA.reserve.push(lowMorale)
      info.armyA.reserve.push(lowMorale)
      info.armyD.reserve.push(lowMorale)
      info.armyD.reserve.push(lowMorale)
      testBothDefeated(FULL_STRENGTH, NO_STRENGTH, LOW_MORALE, NO_MORALE)
    })
    it('attacker stack wipes when defender can hard wipe', () => {
      info.armyA.reserve.push(lowStrength)
      info.armyA.reserve.push(lowStrength)
      info.armyD.reserve.push(normal)
      info.armyD.reserve.push(normal)
      testAttackerDefeated(NO_STRENGTH, FULL_STRENGTH, NO_MORALE, FULL_MORALE)
    })
    it('defender stack wipes when attacker can hard wipe but not deploy', () => {
      info.armyA.reserve.push(lowMorale)
      info.armyA.reserve.push(lowMorale)
      info.armyD.reserve.push(lowStrength)
      info.armyD.reserve.push(lowStrength)
      testBothDefeated(FULL_STRENGTH, NO_STRENGTH, LOW_MORALE, NO_MORALE)
    })
    it('attacker stack wipes when defender can hard wipe at end', () => {
      info.armyA.reserve.push(hardLimit)
      info.armyA.reserve.push(hardLimit)
      info.armyD.reserve.push(normal)
      info.armyD.reserve.push(normal)
      testAttackerDefeated(NO_STRENGTH, 0.99712, NO_MORALE, 2.9972, 1)
    })
    it('defender stack wipes when attacker can hard wipe at end', () => {
      info.armyA.reserve.push(normal)
      info.armyA.reserve.push(normal)
      info.armyD.reserve.push(hardLimit)
      info.armyD.reserve.push(hardLimit)
      testDefenderDefeated(0.99712, NO_STRENGTH, 2.9972, NO_MORALE, 1)
    })
    it('attacker survives during battle even when defender could hard wipe', () => {
      info.armyA.reserve.push(hardStrengthLimit)
      info.armyA.reserve.push(hardStrengthLimit)
      info.armyD.reserve.push(normal)
      info.armyD.reserve.push(normal)
      testNoneDefeated(0.07, 0.99712, 2.676, 2.97, 1)
    })
    it('defender survives during battle even when attacker could hard wipe', () => {
      info.armyA.reserve.push(normal)
      info.armyA.reserve.push(normal)
      info.armyD.reserve.push(hardStrengthLimit)
      info.armyD.reserve.push(hardStrengthLimit)
      testNoneDefeated(0.99712, 0.07, 2.97, 2.676, 1)
    })
    it('attacker survives when defender can soft wipe after retreat limit', () => {
      info.armyA.reserve.push(softLimit)
      info.armyA.reserve.push(softLimit)
      info.armyD.reserve.push(normal)
      info.armyD.reserve.push(normal)
      info.round = info.settings[Setting.StackwipeRounds]
      testAttackerDefeated(0.471, 0.986, 0, 2.99, 1)
    })
    it('defender survives when attacker can soft wipe after retreat limit', () => {
      info.armyA.reserve.push(normal)
      info.armyA.reserve.push(normal)
      info.armyD.reserve.push(softLimit)
      info.armyD.reserve.push(softLimit)
      info.round = info.settings[Setting.StackwipeRounds]
      testDefenderDefeated(0.986, 0.471, 2.99, 0, 1)
    })
    it('attacker stack wipes when defender can soft wipe before retreat limit', () => {
      info.armyA.reserve.push(softLimit)
      info.armyA.reserve.push(softLimit)
      info.armyD.reserve.push(normal)
      info.armyD.reserve.push(normal)
      info.round = info.settings[Setting.StackwipeRounds] - 1
      testAttackerDefeated(NO_STRENGTH, 0.986, NO_MORALE, 2.99, 1)
    })
    it('defender stack wipes when attacker can soft wipe before retreat limit', () => {
      info.armyA.reserve.push(normal)
      info.armyA.reserve.push(normal)
      info.armyD.reserve.push(softLimit)
      info.armyD.reserve.push(softLimit)
      info.round = info.settings[Setting.StackwipeRounds] - 1
      testDefenderDefeated(0.986, NO_STRENGTH, 2.99, NO_MORALE, 1)
    })
  })
}

export default null
