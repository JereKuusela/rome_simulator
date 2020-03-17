import { Mode, CombatSettings, Setting, SiteSettings, SimulationSpeed, CountryName, Side, UnitAttribute, SettingsAndOptions } from 'types'

export const getDefaultSettings = (): SettingsAndOptions => ({
  combatSettings: process.env.REACT_APP_GAME === 'ir' ? { [Mode.Land]: getDefaultLandSettings(), [Mode.Naval]: getDefaultNavalSettings() } : { [Mode.Land]: getDefaultLandSettings() } as any,
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
    ...getDefaultAnySettings()
  }
}

export const getDefaultNavalSettings = (): CombatSettings => {
  return {
    ...getDefaultAnySettings(),
    [Setting.StrengthLostMultiplier]: 0.5,
    [Setting.MoraleLostMultiplier]: 1.0
  }
}

const getDefaultAnySettings = (): CombatSettings => {
  if (process.env.REACT_APP_GAME === 'euiv') {
    return {
      [Setting.BaseRoll]: 3,
      [Setting.RollDamage]: 0.005,
      [Setting.MaxRoll]: 100,
      [Setting.DiceMinimum]: 1,
      [Setting.DiceMaximum]: 9,
      [Setting.RollFrequency]: 3,
      [Setting.CombatWidth]: 15,
      [Setting.ExperienceDamageReduction]: 0,
      [Setting.StrengthLostMultiplier]: 1,
      [Setting.MoraleLostMultiplier]: 5 / 2.7,
      [Setting.MinimumMorale]: 0.25,
      [Setting.MinimumStrength]: 0
    }
  }
  else {
    return {
      [Setting.BaseRoll]: 4,
      [Setting.RollDamage]: 0.024,
      [Setting.MaxRoll]: 15,
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

}

export const getDefaultSiteSettings = (): SiteSettings => {
  if (process.env.REACT_APP_GAME === 'euiv') {
    return {
      [Setting.FixExperience]: false,
      [Setting.DefenderAdvantage]: true,
      [Setting.FixTargeting]: true,
      [Setting.BackRow]: true,
      [Setting.StrengthBasedFlank]: true,
      [Setting.ChunkSize]: 10000,
      [Setting.MaxDepth]: speedValues[SimulationSpeed.Normal][1],
      [Setting.PhaseLengthMultiplier]: speedValues[SimulationSpeed.Normal][0],
      [Setting.Performance]: SimulationSpeed.Normal,
      [Setting.CalculateWinChance]: true,
      [Setting.CalculateCasualties]: true,
      [Setting.CalculateResourceLosses]: true,
      [Setting.ShowGraphs]: false,
      [Setting.DisciplineDamageReduction]: true,
      [Setting.DailyMoraleLoss]: 0.03,
      [Setting.DailyDamageIncrease]: 0.01,
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
      [Setting.DailyDamageIncrease]: 0,
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

export const speedValues: { [key: string]: number[] } = {
  [SimulationSpeed.VeryAccurate]: [1.0, 5],
  [SimulationSpeed.Accurate]: [1.0, 4],
  [SimulationSpeed.Normal]: [1.5, 4],
  [SimulationSpeed.Fast]: [2.0, 4],
  [SimulationSpeed.VeryFast]: [3.0, 3]
}
