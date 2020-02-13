import { Mode, CombatSettings, Setting, SiteSettings, SimulationSpeed, CountryName, Side, UnitAttribute, SettingsAndOptions } from 'types'

export const getDefaultSettings = (): SettingsAndOptions => ({
  combatSettings: { [Mode.Land]: getDefaultLandSettings(), [Mode.Naval]: getDefaultNavalSettings() },
  siteSettings: getDefaultSiteSettings(),
  mode: Mode.Land,
  country: CountryName.Country1,
  accordions: {},
  weariness: {
    [Side.Attacker]: { [UnitAttribute.Morale]: { min: 0, max: 0 }, [UnitAttribute.Strength]: { min: 0, max: 0 } },
    [Side.Defender]: { [UnitAttribute.Morale]: { min: 0, max: 0 }, [UnitAttribute.Strength]: { min: 0, max: 0 } }
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
    [Setting.BackRow]: false,
    [Setting.ChunkSize]: 10000,
    [Setting.MaxDepth]: speedValues[SimulationSpeed.Normal][1],
    [Setting.PhaseLengthMultiplier]: speedValues[SimulationSpeed.Normal][0],
    [Setting.Performance]: SimulationSpeed.Normal,
    [Setting.CalculateWinChance]: true,
    [Setting.CalculateCasualties]: true,
    [Setting.CalculateResourceLosses]: true,
    [Setting.ShowGraphs]: false,
    [Setting.DisciplineDamageReduction]: false,
    [Setting.DailyMoraleLoss]: 0,
    [Setting.FireAndShock]: false
  }
}

export const speedValues: { [key: string]: number[] } = {
  [SimulationSpeed.VeryAccurate]: [1.0, 5],
  [SimulationSpeed.Accurate]: [1.0, 4],
  [SimulationSpeed.Normal]: [1.5, 4],
  [SimulationSpeed.Fast]: [2.0, 4],
  [SimulationSpeed.VeryFast]: [3.0, 3]
}
