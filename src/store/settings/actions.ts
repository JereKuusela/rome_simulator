
export type CombatSettings = { [key in CombatParameter]: number }
export type SimulationSettings = { [key in SimulationParameter]: number }

export enum CombatParameter {
  StrengthLostMultiplier = 'StrengthLostMultiplier',
  MoraleLostMultiplier = 'MoraleLostMultiplier',
  MoraleDamageBase = 'MoraleDamageBase',
  ExperienceDamageReduction = 'ExperienceDamageReduction',
  FixExperience = 'FixExperience',
  DiceMinimum = 'DiceMinimum',
  DiceMaximum = 'DiceMaximum',
  BaseDamage = 'BaseDamage',
  RollDamage = 'RollDamage',
  MaxBaseDamage = 'MaxBaseDamage',
  MinimumMorale = 'MinimumMorale',
  MinimumStrength = 'MinimumStrength',
  RollFrequency = 'RollFrequency',
  CombatWidth = 'CombatWidth',
  ReinforceFirst = 'ReinforceFirst',
  FixDamageTaken = 'FixDamageTaken',
  FixTargeting = 'FixTargeting'
}

export enum SimulationParameter {
  MaxDepth = 'MaxDepth',
  PhaseLengthMultiplier = 'PhaseLengthMultiplier',
  ChunkSize = 'ChunkSize',
  Speed = 'Speed',
  UpdateCasualties = 'UpdateCasualties'
}

export const parameterToDescription = (parameter: CombatParameter | SimulationParameter): string => {
  switch (parameter) {
    case CombatParameter.BaseDamage:
      return 'Initial base damage.'
    case CombatParameter.MaxBaseDamage:
      return 'Maximum base damage.'
    case CombatParameter.CombatWidth:
      return 'Width of the battlefield.'
    case CombatParameter.DiceMaximum:
      return 'Maximum roll for the dice.'
    case CombatParameter.DiceMinimum:
      return 'Minimum roll for the dice.'
    case CombatParameter.ExperienceDamageReduction:
      return 'Damage reduction given by 100% experience.'
    case CombatParameter.FixExperience:
      return 'Morale damage taken and strength damage taken affect damage reduction from experience.\nThis is probably a bug in the game. Set 1 to fix this.'
    case CombatParameter.StrengthLostMultiplier:
      return 'Multiplier for strength lost.'
    case CombatParameter.MinimumStrength:
      return 'Minimum strength required for combat.'
    case CombatParameter.MinimumMorale:
      return 'Minimum morale required for combat.'
    case CombatParameter.MoraleDamageBase:
      return 'Base value for morale damage.'
    case CombatParameter.MoraleLostMultiplier:
      return 'Multiplier for morale lost.'
    case CombatParameter.ReinforceFirst:
      return 'Attackers pick targets before defenders reinforce.\nThis makes attacker and defender behave differently.\nThis is probably a bug in the game. Set 1 to fix this.'
    case CombatParameter.FixDamageTaken:
      return 'Damage taken attribute is not used in calculations.\nDamage done attribute is used twice in calculations.\nThis is probably a bug in the game. Set 1 to fix this.'
    case CombatParameter.RollDamage:
      return 'Additional base damage per dice roll and other modifiers.'
    case CombatParameter.RollFrequency:
      return 'How many rounds dice rolls stay active.'
    case CombatParameter.FixTargeting:
      return '16th unit uses wrong targeting direction.\nThis makes the left and right sides behave slightly differently.\nThis is probably a bug in the game. Set 1 to fix this.'
    case SimulationParameter.MaxDepth:
      return 'How many dice rolls (phases) are simulated. Higher values reduce amount of draws but take significantly longer to calculate.'
    case SimulationParameter.PhaseLengthMultiplier:
      return 'Scales length of phases. Higher values reduce amount of draws but lower the precision significantly.'
    case SimulationParameter.ChunkSize:
      return 'How many battles are simulated in a row. Higher values slightly increase performance but make the UI less responsive.'
    case SimulationParameter.Speed:
      return 'Quick setting to tweak length of phases and amount of dice rolls at the same time.'
    case SimulationParameter.UpdateCasualties:
      return 'Set 1 to update charts in statistics.'
    default:
      return 'No description.'
  }
}
