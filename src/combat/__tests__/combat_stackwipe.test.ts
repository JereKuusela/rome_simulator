import { TestInfo, initInfo, createCohort, testReinforcement } from './utils'
import { UnitType, UnitAttribute, Cohort, Setting } from 'types'

if (process.env.REACT_APP_GAME !== 'euiv') {

  describe('stack wipe', () => {
    let low_morale = null as any as Cohort
    let hard_limit = null as any as Cohort
    let hard_strength_limit = null as any as Cohort
    let soft_limit = null as any as Cohort
    let low_strength = null as any as Cohort
    let normal = null as any as Cohort

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
      low_morale = createCohort(UnitType.Archers)
      low_morale.base_values![UnitAttribute.Morale] = { 'key': LOW_MORALE }
      low_morale.base_values![UnitAttribute.Strength] = { 'key': FULL_STRENGTH }
      low_strength = createCohort(UnitType.Archers)
      low_strength.base_values![UnitAttribute.Morale] = { 'key': FULL_MORALE }
      low_strength.base_values![UnitAttribute.Strength] = { 'key': LOW_STRENGTH }
      hard_limit = createCohort(UnitType.Archers)
      hard_limit.base_values![UnitAttribute.Morale] = { 'key': LIMIT_MORALE }
      hard_limit.base_values![UnitAttribute.Strength] = { 'key': LIMIT_STRENGTH }
      hard_strength_limit = createCohort(UnitType.Archers)
      hard_strength_limit.base_values![UnitAttribute.Morale] = { 'key': FULL_MORALE }
      hard_strength_limit.base_values![UnitAttribute.Strength] = { 'key': LIMIT_STRENGTH }
      soft_limit = createCohort(UnitType.Archers)
      soft_limit.base_values![UnitAttribute.Morale] = { 'key': LIMIT_MORALE }
      soft_limit.base_values![UnitAttribute.Strength] = { 'key': FULL_STRENGTH / 2 }
      normal = createCohort(UnitType.Archers)
      normal.base_values![UnitAttribute.Morale] = { 'key': FULL_MORALE }
      normal.base_values![UnitAttribute.Strength] = { 'key': FULL_STRENGTH }
      info.settings[Setting.DailyDamageIncrease] = 0
      info.settings[Setting.StackwipeRounds] = 5
    })

    const testBothDefeated = (strength_a: number, strength_d: number, morale_a: number, morale_d: number, rounds: number = 0) => {
      const [attacker, defender] = testReinforcement(rounds, info)
      expect(attacker.cohorts.defeated[0][UnitAttribute.Strength]).toBeCloseTo(strength_a)
      expect(attacker.cohorts.defeated[1][UnitAttribute.Strength]).toBeCloseTo(strength_a)
      expect(defender.cohorts.defeated[0][UnitAttribute.Strength]).toBeCloseTo(strength_d)
      expect(defender.cohorts.defeated[1][UnitAttribute.Strength]).toBeCloseTo(strength_d)
      expect(attacker.cohorts.defeated[0][UnitAttribute.Morale]).toBeCloseTo(morale_a)
      expect(attacker.cohorts.defeated[1][UnitAttribute.Morale]).toBeCloseTo(morale_a)
      expect(defender.cohorts.defeated[0][UnitAttribute.Morale]).toBeCloseTo(morale_d)
      expect(defender.cohorts.defeated[1][UnitAttribute.Morale]).toBeCloseTo(morale_d)
    }
    const testDefenderDefeated = (strength_a: number, strength_d: number, morale_a: number, morale_d: number, rounds: number = 0) => {
      const [attacker, defender] = testReinforcement(rounds, info)
      expect(attacker.cohorts.frontline[0][14]![UnitAttribute.Strength]).toBeCloseTo(strength_a)
      expect(attacker.cohorts.frontline[0][15]![UnitAttribute.Strength]).toBeCloseTo(strength_a)
      expect(defender.cohorts.defeated[0][UnitAttribute.Strength]).toBeCloseTo(strength_d)
      expect(defender.cohorts.defeated[1][UnitAttribute.Strength]).toBeCloseTo(strength_d)
      expect(attacker.cohorts.frontline[0][14]![UnitAttribute.Morale]).toBeCloseTo(morale_a)
      expect(attacker.cohorts.frontline[0][15]![UnitAttribute.Morale]).toBeCloseTo(morale_a)
      expect(defender.cohorts.defeated[0][UnitAttribute.Morale]).toBeCloseTo(morale_d)
      expect(defender.cohorts.defeated[1][UnitAttribute.Morale]).toBeCloseTo(morale_d)
    }
    const testAttackerDefeated = (strength_a: number, strength_d: number, morale_a: number, morale_d: number, rounds: number = 0) => {
      const [attacker, defender] = testReinforcement(rounds, info)
      expect(attacker.cohorts.defeated[0][UnitAttribute.Strength]).toBeCloseTo(strength_a)
      expect(attacker.cohorts.defeated[1][UnitAttribute.Strength]).toBeCloseTo(strength_a)
      expect(defender.cohorts.frontline[0][14]![UnitAttribute.Strength]).toBeCloseTo(strength_d)
      expect(defender.cohorts.frontline[0][15]![UnitAttribute.Strength]).toBeCloseTo(strength_d)
      expect(attacker.cohorts.defeated[0][UnitAttribute.Morale]).toBeCloseTo(morale_a)
      expect(attacker.cohorts.defeated[1][UnitAttribute.Morale]).toBeCloseTo(morale_a)
      expect(defender.cohorts.frontline[0][14]![UnitAttribute.Morale]).toBeCloseTo(morale_d)
      expect(defender.cohorts.frontline[0][15]![UnitAttribute.Morale]).toBeCloseTo(morale_d)
    }
    const testNoneDefeated = (strength_a: number, strength_d: number, morale_a: number, morale_d: number, rounds: number = 0) => {
      const [attacker, defender] = testReinforcement(rounds, info)
      expect(attacker.cohorts.frontline[0][14]![UnitAttribute.Strength]).toBeCloseTo(strength_a)
      expect(attacker.cohorts.frontline[0][15]![UnitAttribute.Strength]).toBeCloseTo(strength_a)
      expect(defender.cohorts.frontline[0][14]![UnitAttribute.Strength]).toBeCloseTo(strength_d)
      expect(defender.cohorts.frontline[0][15]![UnitAttribute.Strength]).toBeCloseTo(strength_d)
      expect(attacker.cohorts.frontline[0][14]![UnitAttribute.Morale]).toBeCloseTo(morale_a)
      expect(attacker.cohorts.frontline[0][15]![UnitAttribute.Morale]).toBeCloseTo(morale_a)
      expect(defender.cohorts.frontline[0][14]![UnitAttribute.Morale]).toBeCloseTo(morale_d)
      expect(defender.cohorts.frontline[0][15]![UnitAttribute.Morale]).toBeCloseTo(morale_d)
    }
    it('attacker stack wipes if it can\'t deploy', () => {
      info.army_a.reserve.push(low_morale)
      info.army_a.reserve.push(low_morale)
      info.army_d.reserve.push(normal)
      info.army_d.reserve.push(normal)
      testAttackerDefeated(NO_STRENGTH, FULL_STRENGTH, NO_MORALE, FULL_MORALE)
    })
    it('defender stack wipes when no cohorts deploy', () => {
      info.army_a.reserve.push(low_morale)
      info.army_a.reserve.push(low_morale)
      info.army_d.reserve.push(low_morale)
      info.army_d.reserve.push(low_morale)
      testBothDefeated(FULL_STRENGTH, NO_STRENGTH, LOW_MORALE, NO_MORALE)
    })
    it('attacker stack wipes when defender can hard wipe', () => {
      info.army_a.reserve.push(low_strength)
      info.army_a.reserve.push(low_strength)
      info.army_d.reserve.push(normal)
      info.army_d.reserve.push(normal)
      testAttackerDefeated(NO_STRENGTH, FULL_STRENGTH, NO_MORALE, FULL_MORALE)
    })
    it('defender stack wipes when attacker can hard wipe but not deploy', () => {
      info.army_a.reserve.push(low_morale)
      info.army_a.reserve.push(low_morale)
      info.army_d.reserve.push(low_strength)
      info.army_d.reserve.push(low_strength)
      testBothDefeated(FULL_STRENGTH, NO_STRENGTH, LOW_MORALE, NO_MORALE)
    })
    it('attacker stack wipes when defender can hard wipe at end', () => {
      info.army_a.reserve.push(hard_limit)
      info.army_a.reserve.push(hard_limit)
      info.army_d.reserve.push(normal)
      info.army_d.reserve.push(normal)
      testAttackerDefeated(NO_STRENGTH, 0.99712, NO_MORALE, 2.9972, 1)
    })
    it('defender stack wipes when attacker can hard wipe at end', () => {
      info.army_a.reserve.push(normal)
      info.army_a.reserve.push(normal)
      info.army_d.reserve.push(hard_limit)
      info.army_d.reserve.push(hard_limit)
      testDefenderDefeated(0.99712, NO_STRENGTH, 2.9972, NO_MORALE, 1)
    })
    it('attacker survives during battle even when defender could hard wipe', () => {
      info.army_a.reserve.push(hard_strength_limit)
      info.army_a.reserve.push(hard_strength_limit)
      info.army_d.reserve.push(normal)
      info.army_d.reserve.push(normal)
      testNoneDefeated(0.07, 0.99712, 2.676, 2.97, 1)
    })
    it('defender survives during battle even when attacker could hard wipe', () => {
      info.army_a.reserve.push(normal)
      info.army_a.reserve.push(normal)
      info.army_d.reserve.push(hard_strength_limit)
      info.army_d.reserve.push(hard_strength_limit)
      testNoneDefeated(0.99712, 0.07, 2.97, 2.676, 1)
    })
    it('attacker survives when defender can soft wipe after retreat limit', () => {
      info.army_a.reserve.push(soft_limit)
      info.army_a.reserve.push(soft_limit)
      info.army_d.reserve.push(normal)
      info.army_d.reserve.push(normal)
      info.round = info.settings[Setting.StackwipeRounds]
      testAttackerDefeated(0.471, 0.986, 0, 2.99, 1)
    })
    it('defender survives when attacker can soft wipe after retreat limit', () => {
      info.army_a.reserve.push(normal)
      info.army_a.reserve.push(normal)
      info.army_d.reserve.push(soft_limit)
      info.army_d.reserve.push(soft_limit)
      info.round = info.settings[Setting.StackwipeRounds]
      testDefenderDefeated(0.986, 0.471, 2.99, 0, 1)
    })
    it('attacker stack wipes when defender can soft wipe before retreat limit', () => {
      info.army_a.reserve.push(soft_limit)
      info.army_a.reserve.push(soft_limit)
      info.army_d.reserve.push(normal)
      info.army_d.reserve.push(normal)
      info.round = info.settings[Setting.StackwipeRounds] - 1
      testAttackerDefeated(NO_STRENGTH, 0.986, NO_MORALE, 2.99, 1)
    })
    it('defender stack wipes when attacker can soft wipe before retreat limit', () => {
      info.army_a.reserve.push(normal)
      info.army_a.reserve.push(normal)
      info.army_d.reserve.push(soft_limit)
      info.army_d.reserve.push(soft_limit)
      info.round = info.settings[Setting.StackwipeRounds] - 1
      testDefenderDefeated(0.986, NO_STRENGTH, 2.99, NO_MORALE, 1)
    })
  })
}

export default null
