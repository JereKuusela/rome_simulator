
import { CombatPhase, GeneralAttribute, CountryAttribute, UnitAttribute, Setting, Mode, Settings } from 'types'
import { toPercent } from 'formatters'

export const formatAttribute = (value: number, attribute: string) => {
  if (attribute in CountryAttribute || attribute in GeneralAttribute || attribute in CombatPhase)
    return String(value)
  return toPercent(value)
}

export const filterAttributes = <T extends string>(attributes: T[], settings: Settings, mode?: Mode, show_statistics?: boolean): T[] => attributes.filter(attribute => isAttributeEnabled(attribute, settings, mode, show_statistics))

export const isAttributeEnabled = (attribute: string, settings: Settings, mode?: Mode, show_statistics?: boolean) => {
  if (!show_statistics && (attribute === UnitAttribute.StrengthDepleted || attribute === UnitAttribute.MoraleDepleted))
    return false
  if (!settings[Setting.BackRow] && attribute === UnitAttribute.OffensiveSupport)
    return false
  if (mode !== Mode.Naval && (attribute === UnitAttribute.CaptureChance || attribute === UnitAttribute.CaptureResist))
    return false
  if (!settings[Setting.DailyMoraleLoss] && attribute === UnitAttribute.DailyLossResist)
    return false
  if (!settings[Setting.FireAndShock] && attribute in CombatPhase)
    return false
  if (!settings[Setting.FireAndShock] && (attribute === UnitAttribute.FireDamageDone || attribute === UnitAttribute.FireDamageTaken || attribute === UnitAttribute.ShockDamageDone || attribute === UnitAttribute.ShockDamageTaken))
    return false
  if (!settings[Setting.FireAndShock] && (attribute === UnitAttribute.OffensiveFirePips || attribute === UnitAttribute.OffensiveMoralePips || attribute === UnitAttribute.OffensiveShockPips))
    return false
  if (!settings[Setting.FireAndShock] && (attribute === UnitAttribute.DefensiveFirePips || attribute === UnitAttribute.DefensiveMoralePips || attribute === UnitAttribute.DefensiveShockPips))
    return false
  if (!settings[Setting.FireAndShock] && (attribute === UnitAttribute.DefensiveFirePips || attribute === UnitAttribute.DefensiveMoralePips || attribute === UnitAttribute.DefensiveShockPips))
    return false
  if (!settings[Setting.AttributeCombatAbility] && attribute === UnitAttribute.CombatAbility)
    return false
  if (!settings[Setting.AttributeDamage] && (attribute === UnitAttribute.DamageDone || attribute === UnitAttribute.DamageTaken))
    return false
  if (!settings[Setting.AttributeExperience] && attribute === UnitAttribute.Experience)
    return false
  if (!settings[Setting.AttributeMilitaryTactics] && attribute === UnitAttribute.MilitaryTactics)
    return false
  if (!settings[Setting.AttributeMoraleDamage] && (attribute === UnitAttribute.MoraleDamageDone || attribute === UnitAttribute.MoraleDamageTaken))
    return false
  if (!settings[Setting.AttributeOffenseDefense] && (attribute === UnitAttribute.Offense || attribute === UnitAttribute.Defense))
    return false
  if (!settings[Setting.AttributeStrengthDamage] && (attribute === UnitAttribute.StrengthDamageDone || attribute === UnitAttribute.StrengthDamageTaken))
    return false
  if (!settings[Setting.AttributeDrill] && attribute === UnitAttribute.Drill)
    return false
  if (!settings[Setting.Martial] && attribute === GeneralAttribute.Martial)
    return false
  if (attribute === CombatPhase.Default)
    return false
  return true
}
