import { TestState, initState, initExpected, testCombat, createCohort, getArmyTest, getSettingsTest, addToReserveTest } from './utils'
import { UnitType, UnitAttribute, TacticType, CohortDefinition, CombatPhase, Settings, Setting, DisciplineValue, SideType, UnitRole } from 'types'
import { map } from 'utils'
import { selectTactic } from 'managers/army'

if (process.env.REACT_APP_GAME !== 'euiv') {

  describe('mechanics', () => {
    let unit = null as any as CohortDefinition

    const type = 'Test' as UnitType

    let state: TestState
    beforeEach(() => {
      state = initState()
      unit = createCohort(type)
      unit.role = UnitRole.Support
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
      unit.baseValues![type] = { 'key': 0.2 }
      unit.baseValues![UnitAttribute.OffensiveSupport] = { 'key': 0.5 }

      state.settings.siteSettings = map(state.settings.siteSettings , item => typeof item === 'boolean' ? false : item) as Settings
      getSettingsTest(state)[Setting.AttributeDiscipline] = DisciplineValue.Off
      getSettingsTest(state)[Setting.BackRow] = true
      getSettingsTest(state)[Setting.SupportPhase] = false

      state.tactics[TacticType.Bottleneck].baseValues![type] = { 'key': 0.5 }
      selectTactic(getArmyTest(state, SideType.A), TacticType.Bottleneck)
      selectTactic(getArmyTest(state, SideType.B), TacticType.ShockAction)
      addToReserveTest(state, SideType.A, [unit])
      addToReserveTest(state, SideType.B, [unit])
    })

    const test = (damageMultiplierA: number, damageMultiplierD: number, strengthMultiplier: number, moraleMultiplier: number) => {
      const rolls = [[3, 3]]
      const { expectedA, expectedB } = initExpected(1)

      const strength = 0.0336 * (1 + strengthMultiplier)
      const morale = 0.378 * (1 + moraleMultiplier)
      const strengthA = 1.0 - strength * (1 + damageMultiplierD)
      const strengthD = 1.0 - strength * (1 + damageMultiplierA)
      const moraleA = 3.0 - morale * (1 + damageMultiplierD)
      const moraleD = 3.0 - morale * (1 + damageMultiplierA)

      expectedA[1].front = [[unit.type, strengthA, moraleA]]
      expectedB[1].front = [[unit.type, strengthD, moraleD]]

      testCombat(state, rolls, expectedA, expectedB)

    }

    it('no mechanics', () => {
      test(0, 0, 0, 0)
    })
    it('tactics', () => {
      getSettingsTest(state)[Setting.Tactics] = true
      test(0.1, -0.1, 0.1, 0)
    })
    it('unit types', () => {
      getSettingsTest(state)[Setting.AttributeUnitType] = true
      test(0.2, 0.2, 0, 0)
    })
    it('morale damage', () => {
      getSettingsTest(state)[Setting.AttributeMoraleDamage] = true
      test(0, 0, 0, 1.25 * 1.25 - 1)
    })
    it('strength damage', () => {
      getSettingsTest(state)[Setting.AttributeStrengthDamage] = true
      test(0, 0, 1.25 * 1.25 - 1, 0)
    })
    it('combat ability', () => {
      getSettingsTest(state)[Setting.AttributeCombatAbility] = true
      test(0.3, 0.3, 0, 0)
    })
    it('daily damage increase', () => {
      getSettingsTest(state)[Setting.DailyDamageIncrease] = 0.1
      test(0.1, 0.1, 0, 0)
    })
    it('phase damage', () => {
      getSettingsTest(state)[Setting.FireAndShock] = true
      test(-0.5, -0.5, 1.2 * 0.5 - 1, 0)
    })
    it('offense / defense', () => {
      getSettingsTest(state)[Setting.AttributeOffenseDefense] = true
      test(0.1, 0.1, 0, 0)
    })
    it('damage done / taken', () => {
      getSettingsTest(state)[Setting.AttributeDamage] = true
      test(1.6 * 1.5 - 1, 1.6 * 1.5 - 1, 0, 0)
    })
    it('loyality', () => {
      getSettingsTest(state)[Setting.AttributeLoyal] = true
      test(0.1, 0.1, 0, 0)
    })
    it('discipline damage done', () => {
      getSettingsTest(state)[Setting.AttributeDiscipline] = DisciplineValue.Damage
      test(0.75, 0.75, 0, 0)
    })
    it('discipline damage done and taken', () => {
      getSettingsTest(state)[Setting.AttributeDiscipline] = DisciplineValue.Both
      test(0, 0, 0, 0)
    })
    it('backrow damage', () => {
      addToReserveTest(state, SideType.A, [unit])
      test(0.5, 0, 0, 0)
    })
  })
}

export default null
