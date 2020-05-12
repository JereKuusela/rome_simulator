import { TestInfo, initInfo, setTactics, setCenterUnits, initSide, testCombat, createCohort } from './utils'
import { UnitType, UnitAttribute, TacticType, CohortDefinition, CombatPhase, Settings, Setting, DisciplineValue } from 'types'
import { map } from 'utils'

if (process.env.REACT_APP_GAME !== 'euiv') {

  describe('mechanics', () => {
    let unit = null as any as CohortDefinition

    let info: TestInfo
    beforeEach(() => {
      info = initInfo(false)
      unit = createCohort(UnitType.Archers)
      unit.isLoyal = true
      unit.baseValues![UnitAttribute.Morale] = { 'key': 3 }
      unit.baseValues![UnitAttribute.Strength] = { 'key': 1 }
      unit.baseValues![UnitAttribute.MoraleDamageTaken] = { 'key': 0.25 }
      unit.baseValues![UnitAttribute.MoraleDamageDone] = { 'key': 0.25 }
      unit.baseValues![UnitAttribute.StrengthDamageDone] = { 'key': 0.25 }
      unit.baseValues![UnitAttribute.StrengthDamageTaken] = { 'key': 0.25 }
      unit.baseValues![UnitAttribute.CombatAbility] = { 'key': 0.3 }
      unit.baseValues![CombatPhase.Fire] = { 'key': 0.5 }
      unit.baseValues![UnitAttribute.FireDamageDone] = { 'key': 0.2 }
      unit.baseValues![UnitAttribute.FireDamageTaken] = { 'key': -0.5 }
      unit.baseValues![UnitAttribute.Offense] = { 'key': 0.6 }
      unit.baseValues![UnitAttribute.Defense] = { 'key': 0.5 }
      unit.baseValues![UnitAttribute.DamageDone] = { 'key': 0.6 }
      unit.baseValues![UnitAttribute.DamageTaken] = { 'key': 0.5 }
      unit.baseValues![UnitAttribute.Discipline] = { 'key': 0.75 }
      unit.baseValues![UnitType.Archers] = { 'key': 0.2 }
      unit.baseValues![UnitAttribute.OffensiveSupport] = { 'key': 0.5 }

      info.settings = map(info.settings, item => typeof item === 'boolean' ? false : item) as Settings
      info.settings[Setting.AttributeDiscipline] = DisciplineValue.Off
      setTactics(info, TacticType.Bottleneck, TacticType.ShockAction)
      setCenterUnits(info, unit, unit)
    })

    const test = (damageMultiplierA: number, damageMultiplierD: number, strengthMultiplier: number, moraleMultiplier: number) => {
      const rolls = [[3, 3]]
      const { attacker, defender } = initSide(1)

      const strength = 33.6 * (1 + strengthMultiplier)
      const morale = 0.378 * (1 + moraleMultiplier)
      const strengthA = Math.floor(1000 - strength * (1 + damageMultiplierD))
      const strengthD = Math.floor(1000 - strength * (1 + damageMultiplierA))
      const moraleA = (3.0 - morale * (1 + damageMultiplierD)) / 2
      const moraleD = (3.0 - morale * (1 + damageMultiplierA)) / 2

      attacker[0][15] = [unit.type, strengthA, moraleA]
      defender[0][15] = [unit.type, strengthD, moraleD]

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
      info.armyA.frontline[1][15] = unit
      test(0.5, 0, 0, 0)
    })
  })
}

export default null
