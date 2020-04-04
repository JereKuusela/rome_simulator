import { TestInfo, initInfo, setTactics, setCenterUnits, initSide, testCombat } from './utils'
import { UnitType, UnitAttribute, TacticType, Cohort, Mode, TerrainType, CombatPhase, Settings, Setting, DisciplineValue } from 'types'
import { values, toObj, map } from 'utils'

describe('mechanics', () => {
  let unit = null as any as  Cohort

  let info: TestInfo
  beforeEach(() => {
    info = initInfo()
    unit = {
      type: UnitType.Archers,
      id: 1,
      image: '',
      mode: Mode.Land,
      is_loyal: true,
      base_values: {
        ...toObj(values(UnitType), type => type, () => ({ 'key': 0 })),
        ...toObj(values(UnitAttribute), type => type, () => ({ 'key': 0 })),
        ...toObj(values(TerrainType), type => type, () => ({ 'key': 0 })),
        ...toObj(values(CombatPhase), type => type, () => ({ 'key': 0 })),
        [UnitAttribute.Morale]: { 'key': 3 },
        [UnitAttribute.Strength]: { 'key': 1 },
        [UnitAttribute.MoraleDamageTaken]: { 'key': 0.25 },
        [UnitAttribute.MoraleDamageDone]: { 'key': 0.25 },
        [UnitAttribute.StrengthDamageDone]: { 'key': 0.25 },
        [UnitAttribute.StrengthDamageTaken]: { 'key': 0.25 },
        [UnitAttribute.CombatAbility]: { 'key': 0.3 },
        [CombatPhase.Fire]: { 'key': 0.5 },
        [UnitAttribute.FireDamageDone]: { 'key': 0.2 },
        [UnitAttribute.FireDamageTaken]: { 'key': -0.5 },
        [UnitAttribute.Offense]: { 'key': 0.6 },
        [UnitAttribute.Defense]: { 'key': 0.5 },
        [UnitAttribute.DamageDone]: { 'key': 0.6 },
        [UnitAttribute.DamageTaken]: { 'key': 0.5 },
        [UnitAttribute.Discipline]: { 'key': 0.75 },
        [UnitType.Archers]: { 'key': 0.2 }
      }
    }
    info.settings = map(info.settings, item => typeof item === 'boolean' ? false: item) as Settings
    info.settings[Setting.DailyDamageIncrease] = 0
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
})

export default null
