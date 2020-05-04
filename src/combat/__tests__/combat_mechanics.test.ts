import { TestInfo, initInfo, setTactics, setCenterUnits, initSide, testCombat, createCohort } from './utils'
import { UnitType, UnitAttribute, TacticType, Cohort, CombatPhase, Settings, Setting, DisciplineValue } from 'types'
import { map } from 'utils'

if (process.env.REACT_APP_GAME !== 'euiv') {

  describe('mechanics', () => {
    let unit = null as any as Cohort

    let info: TestInfo
    beforeEach(() => {
      info = initInfo(false)
      unit = createCohort(UnitType.Archers)
      unit.is_loyal = true
      unit.base_values![UnitAttribute.Morale] = { 'key': 3 }
      unit.base_values![UnitAttribute.Strength] = { 'key': 1 }
      unit.base_values![UnitAttribute.MoraleDamageTaken] = { 'key': 0.25 }
      unit.base_values![UnitAttribute.MoraleDamageDone] = { 'key': 0.25 }
      unit.base_values![UnitAttribute.StrengthDamageDone] = { 'key': 0.25 }
      unit.base_values![UnitAttribute.StrengthDamageTaken] = { 'key': 0.25 }
      unit.base_values![UnitAttribute.CombatAbility] = { 'key': 0.3 }
      unit.base_values![CombatPhase.Fire] = { 'key': 0.5 }
      unit.base_values![UnitAttribute.FireDamageDone] = { 'key': 0.2 }
      unit.base_values![UnitAttribute.FireDamageTaken] = { 'key': -0.5 }
      unit.base_values![UnitAttribute.Offense] = { 'key': 0.6 }
      unit.base_values![UnitAttribute.Defense] = { 'key': 0.5 }
      unit.base_values![UnitAttribute.DamageDone] = { 'key': 0.6 }
      unit.base_values![UnitAttribute.DamageTaken] = { 'key': 0.5 }
      unit.base_values![UnitAttribute.Discipline] = { 'key': 0.75 }
      unit.base_values![UnitType.Archers] = { 'key': 0.2 }
      unit.base_values![UnitAttribute.OffensiveSupport] = { 'key': 0.5 }

      info.settings = map(info.settings, item => typeof item === 'boolean' ? false : item) as Settings
      info.settings[Setting.AttributeDiscipline] = DisciplineValue.Off
      setTactics(info, TacticType.Bottleneck, TacticType.ShockAction)
      setCenterUnits(info, unit, unit)
    })

    const test = (damage_multiplier_a: number, damage_multiplier_d: number, strength_multiplier: number, morale_multiplier: number) => {
      const rolls = [[3, 3]]
      const { attacker, defender } = initSide(1)

      const strength = 33.6 * (1 + strength_multiplier)
      const morale = 0.378 * (1 + morale_multiplier)
      const strength_a = Math.floor(1000 - strength * (1 + damage_multiplier_d))
      const strength_d = Math.floor(1000 - strength * (1 + damage_multiplier_a))
      const morale_a = (3.0 - morale * (1 + damage_multiplier_d)) / 2
      const morale_d = (3.0 - morale * (1 + damage_multiplier_a)) / 2

      attacker[0][15] = [unit.type, strength_a, morale_a]
      defender[0][15] = [unit.type, strength_d, morale_d]

      testCombat(info, rolls, attacker, defender)

    }

    it('no mechanics', () => {
      test(0, 0, 0, 0)
    })
    it('tactics', () => {
      info.settings[Setting.Tactics] = true
      test(0.1, -0.1, 0.1, 0)
    })
    it('unit types', () => {
      info.settings[Setting.AttributeUnitType] = true
      test(0.2, 0.2, 0, 0)
    })
    it('morale damage', () => {
      info.settings[Setting.AttributeMoraleDamage] = true
      test(0, 0, 0, 1.25 * 1.25 - 1)
    })
    it('strength damage', () => {
      info.settings[Setting.AttributeStrengthDamage] = true
      test(0, 0, 1.25 * 1.25 - 1, 0)
    })
    it('combat ability', () => {
      info.settings[Setting.AttributeCombatAbility] = true
      test(0.3, 0.3, 0, 0)
    })
    it('daily damage increase', () => {
      info.settings[Setting.DailyDamageIncrease] = 0.1
      test(0.1, 0.1, 0, 0)
    })
    it('phase damage', () => {
      info.settings[Setting.FireAndShock] = true
      test(-0.5, -0.5, 1.2 * 0.5 - 1, 0)
    })
    it('offense / defense', () => {
      info.settings[Setting.AttributeOffenseDefense] = true
      test(0.1, 0.1, 0, 0)
    })
    it('damage done / taken', () => {
      info.settings[Setting.AttributeDamage] = true
      test(1.6 * 1.5 - 1, 1.6 * 1.5 - 1, 0, 0)
    })
    it('loyality', () => {
      info.settings[Setting.AttributeLoyal] = true
      test(0.1, 0.1, 0, 0)
    })
    it('discipline damage done', () => {
      info.settings[Setting.AttributeDiscipline] = DisciplineValue.Damage
      test(0.75, 0.75, 0, 0)
    })
    it('discipline damage done and taken', () => {
      info.settings[Setting.AttributeDiscipline] = DisciplineValue.Both
      test(0, 0, 0, 0)
    })
    it('backrow damage', () => {
      info.army_a.frontline[1][15] = unit
      test(0.5, 0, 0, 0)
    })
  })
}

export default null
