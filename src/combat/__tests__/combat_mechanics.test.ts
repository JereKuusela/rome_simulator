import { TestState, initState, initSide, testCombat, createCohort, getArmy, getSettings } from './utils'
import { UnitType, UnitAttribute, TacticType, CohortDefinition, CombatPhase, Settings, Setting, DisciplineValue, CountryName, ArmyName, SideType } from 'types'
import { map } from 'utils'
import { selectTactic, addToReserve } from 'managers/army'

if (process.env.REACT_APP_GAME !== 'euiv') {

  describe('mechanics', () => {
    let unit = null as any as CohortDefinition

    let state: TestState
    beforeEach(() => {
      state = initState()
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

      state.environment.settings = map(state.environment.settings, item => typeof item === 'boolean' ? false : item) as Settings
      getSettings(state)[Setting.AttributeDiscipline] = DisciplineValue.Off
      selectTactic(getArmy(state, SideType.Attacker), TacticType.Bottleneck)
      selectTactic(getArmy(state, SideType.Defender), TacticType.ShockAction)
      addToReserve(getArmy(state, SideType.Attacker), [unit])
      addToReserve(getArmy(state, SideType.Defender), [unit])
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

      testCombat(state, rolls, attacker, defender)

    }

    it('no mechanics', () => {
      test(0, 0, 0, 0)
    })
    it('tactics', () => {
      getSettings(state)[Setting.Tactics] = true
      test(0.1, -0.1, 0.1, 0)
    })
    it('unit types', () => {
      getSettings(state)[Setting.AttributeUnitType] = true
      test(0.2, 0.2, 0, 0)
    })
    it('morale damage', () => {
      getSettings(state)[Setting.AttributeMoraleDamage] = true
      test(0, 0, 0, 1.25 * 1.25 - 1)
    })
    it('strength damage', () => {
      getSettings(state)[Setting.AttributeStrengthDamage] = true
      test(0, 0, 1.25 * 1.25 - 1, 0)
    })
    it('combat ability', () => {
      getSettings(state)[Setting.AttributeCombatAbility] = true
      test(0.3, 0.3, 0, 0)
    })
    it('daily damage increase', () => {
      getSettings(state)[Setting.DailyDamageIncrease] = 0.1
      test(0.1, 0.1, 0, 0)
    })
    it('phase damage', () => {
      getSettings(state)[Setting.FireAndShock] = true
      test(-0.5, -0.5, 1.2 * 0.5 - 1, 0)
    })
    it('offense / defense', () => {
      getSettings(state)[Setting.AttributeOffenseDefense] = true
      test(0.1, 0.1, 0, 0)
    })
    it('damage done / taken', () => {
      getSettings(state)[Setting.AttributeDamage] = true
      test(1.6 * 1.5 - 1, 1.6 * 1.5 - 1, 0, 0)
    })
    it('loyality', () => {
      getSettings(state)[Setting.AttributeLoyal] = true
      test(0.1, 0.1, 0, 0)
    })
    it('discipline damage done', () => {
      getSettings(state)[Setting.AttributeDiscipline] = DisciplineValue.Damage
      test(0.75, 0.75, 0, 0)
    })
    it('discipline damage done and taken', () => {
      getSettings(state)[Setting.AttributeDiscipline] = DisciplineValue.Both
      test(0, 0, 0, 0)
    })
    it('backrow damage', () => {
      addToReserve(getArmy(state, SideType.Attacker), [unit])
      test(0.5, 0, 0, 0)
    })
  })
}

export default null
