import { CombatPhase, CharacterAttribute, CountryAttribute, UnitAttribute, Setting, Mode, ValuesType } from 'types'
import { toPercent } from 'formatters'
import { SiteSettings, DisciplineValue } from './settings'

export const formatAttribute = (value: number, attribute: string) => {
  if (
    attribute === CountryAttribute.CombatWidth ||
    attribute === CountryAttribute.MilitaryExperience ||
    attribute === CountryAttribute.CivicTech ||
    attribute === CountryAttribute.OratoryTech ||
    attribute === CountryAttribute.ReligiousTech ||
    attribute === CountryAttribute.MartialTech ||
    attribute === CountryAttribute.OmenPower ||
    attribute in CharacterAttribute ||
    attribute in CombatPhase
  )
    return String(value)
  return toPercent(value)
}

export const filterAttributes = <T extends string>(
  attributes: T[],
  settings: SiteSettings,
  mode?: Mode,
  showStatistics?: boolean
): T[] => attributes.filter(attribute => isAttributeEnabled(attribute, settings, mode, showStatistics))

export const getAttributeValuesType = (attribute: UnitAttribute) =>
  attribute === UnitAttribute.Morale ? ValuesType.Modifier : ValuesType.Base

export const isAttributeEnabled = (
  attribute: string,
  settings: SiteSettings,
  mode?: Mode,
  showStatistics?: boolean
) => {
  if (!showStatistics && (attribute === UnitAttribute.StrengthDepleted || attribute === UnitAttribute.MoraleDepleted))
    return false
  if (
    !settings[Setting.BackRow] &&
    (attribute === UnitAttribute.OffensiveSupport || attribute === UnitAttribute.DefensiveSupport)
  )
    return false
  if (mode !== Mode.Naval && (attribute === UnitAttribute.CaptureChance || attribute === UnitAttribute.CaptureResist))
    return false
  if (!settings[Setting.DailyMoraleLoss] && attribute === UnitAttribute.DailyLossResist) return false
  if (!settings[Setting.FireAndShock] && attribute in CombatPhase) return false
  if (
    !settings[Setting.FireAndShock] &&
    (attribute === UnitAttribute.FireDamageDone ||
      attribute === UnitAttribute.FireDamageTaken ||
      attribute === UnitAttribute.ShockDamageDone ||
      attribute === UnitAttribute.ShockDamageTaken)
  )
    return false
  if (
    !settings[Setting.FireAndShock] &&
    (attribute === UnitAttribute.OffensiveFirePips ||
      attribute === UnitAttribute.OffensiveMoralePips ||
      attribute === UnitAttribute.OffensiveShockPips)
  )
    return false
  if (
    !settings[Setting.FireAndShock] &&
    (attribute === UnitAttribute.DefensiveFirePips ||
      attribute === UnitAttribute.DefensiveMoralePips ||
      attribute === UnitAttribute.DefensiveShockPips)
  )
    return false
  if (
    !settings[Setting.FireAndShock] &&
    (attribute === UnitAttribute.DefensiveFirePips ||
      attribute === UnitAttribute.DefensiveMoralePips ||
      attribute === UnitAttribute.DefensiveShockPips)
  )
    return false
  if (!settings[Setting.AttributeCombatAbility] && attribute === UnitAttribute.CombatAbility) return false
  if (
    !settings[Setting.AttributeDamage] &&
    (attribute === UnitAttribute.DamageDone || attribute === UnitAttribute.DamageTaken)
  )
    return false
  if (!settings[Setting.AttributeExperience] && attribute === UnitAttribute.Experience) return false
  if (!settings[Setting.AttributeMilitaryTactics] && attribute === UnitAttribute.MilitaryTactics) return false
  if (
    !settings[Setting.AttributeMoraleDamage] &&
    (attribute === UnitAttribute.MoraleDamageDone || attribute === UnitAttribute.MoraleDamageTaken)
  )
    return false
  if (
    !settings[Setting.AttributeOffenseDefense] &&
    (attribute === UnitAttribute.Offense || attribute === UnitAttribute.Defense)
  )
    return false
  if (
    !settings[Setting.AttributeStrengthDamage] &&
    (attribute === UnitAttribute.StrengthDamageDone || attribute === UnitAttribute.StrengthDamageTaken)
  )
    return false
  if (!settings[Setting.AttributeDrill] && attribute === UnitAttribute.Drill) return false
  if (!settings[Setting.Martial] && attribute === CharacterAttribute.Martial) return false
  if (
    !settings[Setting.Food] &&
    (attribute === UnitAttribute.FoodConsumption || attribute === UnitAttribute.FoodStorage)
  )
    return false
  if (!settings[Setting.InsufficientSupportPenalty] && attribute === CountryAttribute.FlankRatio) return false
  if (attribute === CombatPhase.Default) return false
  if (settings[Setting.AttributeDiscipline] === DisciplineValue.Off && attribute === UnitAttribute.Discipline)
    return false
  return true
}
