import { Mode, CombatSettings, Setting, SiteSettings, SimulationSpeed, CountryName, SettingsAndOptions, DisciplineValue } from 'types'

export const getDefaultSettings = (): SettingsAndOptions => ({
  combatSettings: { [Mode.Land]: getDefaultLandSettings(), [Mode.Naval]: getDefaultNavalSettings() },
  siteSettings: getDefaultSiteSettings(),
  mode: Mode.Land,
  army: 0,
  country: CountryName.Country1
})

export const getDefaultLandSettings = (): CombatSettings => {
  if (process.env.REACT_APP_GAME === 'euiv') {
    return {
      [Setting.StrengthLostMultiplier]: 5,
      [Setting.MoraleLostMultiplier]: 25 / 2.7
    }
  }
  else {
    return {
      [Setting.StrengthLostMultiplier]: 4.8,
      [Setting.MoraleLostMultiplier]: 18
    }
  }
}

export const getDefaultNavalSettings = (): CombatSettings => {
  if (process.env.REACT_APP_GAME === 'euiv') {
    return {
      [Setting.StrengthLostMultiplier]: 5,
      [Setting.MoraleLostMultiplier]: 25 / 2.7
    }
  }
  else {
    return {
      [Setting.StrengthLostMultiplier]: 12,
      [Setting.MoraleLostMultiplier]: 24
    }
  }
}

export const getDefaultSiteSettings = (): SiteSettings => {
  if (process.env.REACT_APP_GAME === 'euiv') {
    return {
      [Setting.BasePips]: 3,
      [Setting.MaxPips]: 100,
      [Setting.MaxGeneral]: 6,
      [Setting.DiceMinimum]: 0,
      [Setting.DiceMaximum]: 9,
      [Setting.RollFrequency]: 3,
      [Setting.RetreatRounds]: 12,
      [Setting.StackwipeRounds]: 12,
      [Setting.Stackwipe]: true,
      [Setting.SoftStackWipeLimit]: 2,
      [Setting.HardStackWipeLimit]: 10,
      [Setting.CombatWidth]: 15,
      [Setting.ExperienceDamageReduction]: 0,
      [Setting.MinimumMorale]: 0,
      [Setting.MinimumStrength]: 0,
      [Setting.MoraleHitForNonSecondaryReinforcement]: 0,
      [Setting.FixExperience]: false,
      [Setting.DefenderAdvantage]: true,
      [Setting.FixTargeting]: true,
      [Setting.FixFlankTargeting]: false,
      [Setting.BackRow]: true,
      [Setting.DynamicTargeting]: true,
      [Setting.BackRowRetreat]: false,
      [Setting.StrengthBasedFlank]: true,
      [Setting.AttributeDiscipline]: DisciplineValue.Both,
      [Setting.DailyMoraleLoss]: 0.03,
      [Setting.DailyDamageIncrease]: 0.01,
      [Setting.UseMaxMorale]: true,
      [Setting.FireAndShock]: true,
      [Setting.InsufficientSupportPenalty]: 0.25,
      [Setting.AttributeCombatAbility]: true,
      [Setting.SupportPhase]: false,
      [Setting.AttributeDamage]: true,
      [Setting.AttributeDrill]: true,
      [Setting.AttributeLoyal]: false,
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
      [Setting.Food]: false,
      [Setting.Precision]: 3,
      [Setting.AutoRefresh]: true,
      [Setting.MoraleDamageBasedOnTargetStrength]: false, 
      [Setting.DamageLossForMissingMorale]: 0,
      // Analyze
      [Setting.Performance]: SimulationSpeed.Fast,
      [Setting.ChunkSize]: 10000,
      [Setting.MaxDepth]: speedValues[SimulationSpeed.Fast][1],
      [Setting.PhaseLengthMultiplier]: speedValues[SimulationSpeed.Fast][0],
      [Setting.ReduceRolls]: speedValues[SimulationSpeed.Fast][2],
      [Setting.CalculateWinChance]: true,
      [Setting.CalculateCasualties]: true,
      [Setting.CalculateResourceLosses]: true,
      [Setting.ShowGraphs]: false
    }
  }
  else {
    return {
      [Setting.BasePips]: 4,
      [Setting.MaxPips]: 15,
      [Setting.MaxGeneral]: 100,
      [Setting.DiceMinimum]: 1,
      [Setting.DiceMaximum]: 6,
      [Setting.RollFrequency]: 5,
      [Setting.RetreatRounds]: 0,
      [Setting.StackwipeRounds]: 5,
      [Setting.Stackwipe]: true,
      [Setting.SoftStackWipeLimit]: 2,
      [Setting.HardStackWipeLimit]: 10,
      [Setting.CombatWidth]: 30,
      [Setting.ExperienceDamageReduction]: 0.3,
      [Setting.MinimumMorale]: 0.25,
      [Setting.MinimumStrength]: 0,
      [Setting.MoraleHitForNonSecondaryReinforcement]: 0.05,
      [Setting.FixExperience]: false,
      [Setting.DefenderAdvantage]: false,
      [Setting.FixTargeting]: true,
      [Setting.FixFlankTargeting]: true,
      [Setting.DynamicTargeting]: false,
      [Setting.BackRow]: false,
      [Setting.BackRowRetreat]: false,
      [Setting.StrengthBasedFlank]: false,
      [Setting.SupportPhase]: true,
      [Setting.Precision]: 5,
      [Setting.ChunkSize]: 10000,
      [Setting.MaxDepth]: speedValues[SimulationSpeed.Fast][1],
      [Setting.PhaseLengthMultiplier]: speedValues[SimulationSpeed.Fast][0],
      [Setting.Performance]: SimulationSpeed.Fast,
      [Setting.ReduceRolls]: speedValues[SimulationSpeed.Fast][2],
      [Setting.CalculateWinChance]: true,
      [Setting.CalculateCasualties]: true,
      [Setting.CalculateResourceLosses]: true,
      [Setting.ShowGraphs]: false,
      [Setting.AttributeDiscipline]: DisciplineValue.Damage,
      [Setting.DailyMoraleLoss]: 0,
      [Setting.DailyDamageIncrease]: 0,
      [Setting.UseMaxMorale]: false,
      [Setting.FireAndShock]: false,
      [Setting.InsufficientSupportPenalty]: 0.0,
      [Setting.AttributeCombatAbility]: false,
      [Setting.AttributeDamage]: true,
      [Setting.AttributeDrill]: false,
      [Setting.AttributeExperience]: true,
      [Setting.AttributeLoyal]: true,
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
      [Setting.Food]: true,
      [Setting.AutoRefresh]: true,
      [Setting.MoraleDamageBasedOnTargetStrength]: false, 
      [Setting.DamageLossForMissingMorale]: 0,
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
