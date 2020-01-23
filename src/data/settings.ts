import { DefinitionType, CombatSettings, Setting, SiteSettings, SimulationSpeed, CountryName, Side, UnitCalc, SettingsAndOptions } from 'types'

export const getDefaultSettings = (): SettingsAndOptions => ({
  combatSettings: { [DefinitionType.Land]: getDefaultLandSettings(), [DefinitionType.Naval]: getDefaultNavalSettings() },
  siteSettings: getDefaultSiteSettings(),
  mode: DefinitionType.Land,
  country: CountryName.Country1,
  accordions: {},
  weariness: {
    [Side.Attacker]: { [UnitCalc.Morale]: { min: 0, max: 0 }, [UnitCalc.Strength]: { min: 0, max: 0 } },
    [Side.Defender]: { [UnitCalc.Morale]: { min: 0, max: 0 }, [UnitCalc.Strength]: { min: 0, max: 0 } }
  }
})

export const getDefaultLandSettings = (): CombatSettings => {
  return {
    ...getDefaultAnySettings(),
    [Setting.StrengthLostMultiplier]: 0.2,
    [Setting.MoraleLostMultiplier]: 0.75
  }
}

export const getDefaultNavalSettings = (): CombatSettings  => {
  return {
    ...getDefaultAnySettings(),
    [Setting.StrengthLostMultiplier]: 0.5,
    [Setting.MoraleLostMultiplier]: 1.0
  }
}

const getDefaultAnySettings = (): CombatSettings => {
  return {
    [Setting.BaseDamage]: 0.096,
    [Setting.RollDamage]: 0.024,
    [Setting.MaxBaseDamage]: 0.36,
    [Setting.DiceMinimum]: 1,
    [Setting.DiceMaximum]: 6,
    [Setting.RollFrequency]: 5,
    [Setting.CombatWidth]: 30,
    [Setting.ExperienceDamageReduction]: 0.3,
    [Setting.StrengthLostMultiplier]: 0.2,
    [Setting.MoraleLostMultiplier]: 0.75,
    [Setting.MinimumMorale]: 0.25,
    [Setting.MinimumStrength]: 0
  }
}

export const getDefaultSiteSettings = (): SiteSettings => {
  return {
    [Setting.FixExperience]: false,
    [Setting.DefenderAdvantage]: false,
    [Setting.FixTargeting]: true,
    [Setting.ChunkSize]: 10000,
    [Setting.MaxDepth]: 4,
    [Setting.PhaseLengthMultiplier]: 2.0,
    [Setting.Performance]: SimulationSpeed.Normal,
    [Setting.UpdateCasualties]: true
  }
}
