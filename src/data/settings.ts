import { Mode, CombatSettings, Setting, SiteSettings, SimulationSpeed, CountryName, SettingsAndOptions } from 'types'

export const getDefaultSettings = (): SettingsAndOptions => ({
  combatSettings: process.env.REACT_APP_GAME === 'ir' ? { [Mode.Land]: getDefaultLandSettings(), [Mode.Naval]: getDefaultNavalSettings() } : { [Mode.Land]: getDefaultLandSettings() } as any,
  siteSettings: getDefaultSiteSettings(),
  mode: Mode.Land,
  country: CountryName.Country1,
  accordions: {}
})

export const getDefaultLandSettings = (): CombatSettings => {
  return {
    ...getDefaultAnySettings()
  }
}

export const getDefaultNavalSettings = (): CombatSettings => {
  return {
    ...getDefaultAnySettings(),
    [Setting.StrengthLostMultiplier]: 12,
    [Setting.MoraleLostMultiplier]: 24
  }
}

const getDefaultAnySettings = (): CombatSettings => {
  if (process.env.REACT_APP_GAME === 'euiv') {
    return {
      [Setting.BasePips]: 3,
      [Setting.MaxPips]: 100,
      [Setting.DiceMinimum]: 1,
      [Setting.DiceMaximum]: 9,
      [Setting.RollFrequency]: 3,
      [Setting.CombatWidth]: 15,
      [Setting.ExperienceDamageReduction]: 0,
      [Setting.StrengthLostMultiplier]: 5,
      [Setting.MoraleLostMultiplier]: 25 / 2.7,
      [Setting.MinimumMorale]: 0.25,
      [Setting.MinimumStrength]: 0
    }
  }
  else {
    return {
      [Setting.BasePips]: 4,
      [Setting.MaxPips]: 15,
      [Setting.DiceMinimum]: 1,
      [Setting.DiceMaximum]: 6,
      [Setting.RollFrequency]: 5,
      [Setting.CombatWidth]: 30,
      [Setting.ExperienceDamageReduction]: 0.3,
      [Setting.StrengthLostMultiplier]: 4.8,
      [Setting.MoraleLostMultiplier]: 18,
      [Setting.MinimumMorale]: 0.25,
      [Setting.MinimumStrength]: 0
    }
  }

}

export const getDefaultSiteSettings = (): SiteSettings => {
  if (process.env.REACT_APP_GAME === 'euiv') {
    return {
      [Setting.FixExperience]: false,
      [Setting.DefenderAdvantage]: true,
      [Setting.FixTargeting]: true,
      [Setting.BackRow]: true,
      [Setting.StrengthBasedFlank]: true,
      [Setting.Precision]: 3,
      [Setting.ChunkSize]: 10000,
      [Setting.MaxDepth]: speedValues[SimulationSpeed.Normal][1],
      [Setting.PhaseLengthMultiplier]: speedValues[SimulationSpeed.Normal][0],
      [Setting.Performance]: SimulationSpeed.Normal,
      [Setting.ReduceRolls]: speedValues[SimulationSpeed.Normal][2],
      [Setting.CalculateWinChance]: true,
      [Setting.CalculateCasualties]: true,
      [Setting.CalculateResourceLosses]: true,
      [Setting.ShowGraphs]: false,
      [Setting.DisciplineDamageReduction]: true,
      [Setting.DailyMoraleLoss]: 0.03,
      [Setting.DailyDamageIncrease]: 0.01,
      [Setting.UseMaxMorale]: true,
      [Setting.FireAndShock]: true,
      [Setting.InsufficientSupportPenalty]: 0.25,
      [Setting.AttributeCombatAbility]: true,
      [Setting.AttributeDamage]: true,
      [Setting.AttributeDrill]: true,
      [Setting.AttributeExperience]: false,
      [Setting.AttributeMilitaryTactics]: true,
      [Setting.AttributeMoraleDamage]: false,
      [Setting.AttributeOffenseDefense]: false,
      [Setting.AttributeStrengthDamage]: false,
      [Setting.AttributeTerrainType]: false,
      [Setting.AttributeUnitType]: false,
      [Setting.Tactics]: false,
      [Setting.Martial]: false,
      [Setting.CustomDeployment]: false,
      [Setting.DynamicFlanking]: true,
      [Setting.Tech]: true,
      [Setting.Culture]: true,
      [Setting.Food]: false
    }
  }
  else {
    return {
      [Setting.FixExperience]: false,
      [Setting.DefenderAdvantage]: false,
      [Setting.FixTargeting]: true,
      [Setting.BackRow]: false,
      [Setting.StrengthBasedFlank]: false,
      [Setting.Precision]: 5,
      [Setting.ChunkSize]: 10000,
      [Setting.MaxDepth]: speedValues[SimulationSpeed.Normal][1],
      [Setting.PhaseLengthMultiplier]: speedValues[SimulationSpeed.Normal][0],
      [Setting.Performance]: SimulationSpeed.Normal,
      [Setting.ReduceRolls]: speedValues[SimulationSpeed.Normal][2],
      [Setting.CalculateWinChance]: true,
      [Setting.CalculateCasualties]: true,
      [Setting.CalculateResourceLosses]: true,
      [Setting.ShowGraphs]: false,
      [Setting.DisciplineDamageReduction]: false,
      [Setting.DailyMoraleLoss]: 0,
      [Setting.DailyDamageIncrease]: 0,
      [Setting.UseMaxMorale]: false,
      [Setting.FireAndShock]: false,
      [Setting.InsufficientSupportPenalty]: 0.0,
      [Setting.AttributeCombatAbility]: false,
      [Setting.AttributeDamage]: true,
      [Setting.AttributeDrill]: false,
      [Setting.AttributeExperience]: true,
      [Setting.AttributeMilitaryTactics]: false,
      [Setting.AttributeMoraleDamage]: true,
      [Setting.AttributeOffenseDefense]: true,
      [Setting.AttributeStrengthDamage]: true,
      [Setting.AttributeTerrainType]: true,
      [Setting.AttributeUnitType]: true,
      [Setting.Tactics]: true,
      [Setting.Martial]: true,
      [Setting.CustomDeployment]: true,
      [Setting.DynamicFlanking]: false,
      [Setting.Tech]: false,
      [Setting.Culture]: false,
      [Setting.Food]: true
    }
  }
}

export const speedValues: { [key: string]: number[] } = process.env.REACT_APP_GAME === 'euiv' ?
  {
    [SimulationSpeed.VeryAccurate]: [1.0, 8, 1],
    [SimulationSpeed.Accurate]: [1.0, 7, 1],
    [SimulationSpeed.Normal]: [1.0, 7, 2],
    [SimulationSpeed.Fast]: [1.0, 7, 3],
    [SimulationSpeed.VeryFast]: [1.0, 5, 3]
  } :
  {
    [SimulationSpeed.VeryAccurate]: [1.0, 5, 0],
    [SimulationSpeed.Accurate]: [1.0, 4, 0],
    [SimulationSpeed.Normal]: [1.5, 4, 0],
    [SimulationSpeed.Fast]: [2.0, 4, 0],
    [SimulationSpeed.VeryFast]: [3.0, 3, 1]
  }
