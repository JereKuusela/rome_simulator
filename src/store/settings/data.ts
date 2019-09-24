import { CombatParameter } from './actions'


export const getDefaultLandSettings = (): { [key in CombatParameter]: number } => {
  return {
    ...getDefaultAnySettings(),
    [CombatParameter.StrengthLostMultiplier]: 0.2,
    [CombatParameter.MoraleLostMultiplier]: 1.5
  }
}

export const getDefaultNavalSettings = (): { [key in CombatParameter]: number } => {
  return {
    ...getDefaultAnySettings(),
    [CombatParameter.StrengthLostMultiplier]: 0.5,
    [CombatParameter.MoraleLostMultiplier]: 2.0
  }
}

const getDefaultAnySettings = (): { [key in CombatParameter]: number } => {
  return {
    [CombatParameter.BaseDamage]: 0.08,
    [CombatParameter.RollDamage]: 0.02,
    [CombatParameter.MaxBaseDamage]: 0.3,
    [CombatParameter.DiceMinimum]: 1,
    [CombatParameter.DiceMaximum]: 6,
    [CombatParameter.RollFrequency]: 5,
    [CombatParameter.CombatWidth]: 30,
    [CombatParameter.ExperienceDamageReduction]: 0.3,
    [CombatParameter.FixExperience]: 0,
    [CombatParameter.StrengthLostMultiplier]: 0.2,
    [CombatParameter.MoraleLostMultiplier]: 1.5,
    [CombatParameter.MoraleDamageBase]: 2.0,
    [CombatParameter.MinimumMorale]: 0.25,
    [CombatParameter.MinimumStrength]: 0,
    [CombatParameter.ReinforceFirst]: 0,
    [CombatParameter.FixDamageTaken]: 0
  }
}
