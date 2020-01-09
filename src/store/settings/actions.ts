
export enum Setting {
  StrengthLostMultiplier = 'Multiplier for strength damage',
  MoraleLostMultiplier = 'Multiplier for morale damage',
  ExperienceDamageReduction = 'Damage reduction for 100% experience',
  DiceMinimum = 'Minimum dice roll',
  DiceMaximum = 'Maximum dice roll',
  BaseDamage = 'Base damage',
  RollDamage = 'Base damage per dice roll',
  MaxBaseDamage = 'Maximum base damage',
  MinimumMorale = 'Minimum morale for combat',
  MinimumStrength = 'Minimum strength for combat',
  RollFrequency = 'Length of combat phases',
  CombatWidth = 'Combat width',
  DefeatedPenalty = 'Penalty for defeated units',
  DefeatedPenaltyAmount = 'Amount of penalty',
  DefenderAdvantage = 'Defender\'s advantage',
  FixExperience = 'Fix damage reduction from experience',
  FixTargeting = 'Fix targeting',
  MaxDepth = 'Statistics: Maximum depth',
  PhaseLengthMultiplier = 'Statistics: Multiplier for phase length',
  ChunkSize = 'Statistics: Chunk size',
  Performance = 'Statistics: Performance',
  UpdateCasualties = 'Statistics: Update casualties'
}

export enum DefeatedPenalty {
  None = 'None',
  Damage = 'Damage',
  Kill = 'Kill'
}

export enum SimulationSpeed {
  VeryAccurate = 'Very accurate',
  Accurate = 'Accurate',
  Normal = 'Normal',
  Fast = 'Fast',
  VeryFast = 'Very fast',
  Custom = 'Custom'
}

export const parameterToDescription = (parameter: Setting, value: string | number | boolean): string => {
  switch (parameter) {
    case Setting.BaseDamage:
      return 'Base damage for all units.\nIncrease for faster battles and less randomness.\nDecrease for slower battles and more randomness.'
    case Setting.MaxBaseDamage:
      return 'Reduces and caps effect of high martial generals.\nIncrease for more benefit from skilled generals.\nDecrease for less benefit from skilled generals.'
    case Setting.CombatWidth:
      return 'How many units can fight at the same time.\nIncrease for faster big battles and more effective flanking.\nDecrease for slower big battles and less effective flanking.'
    case Setting.DiceMaximum:
      return 'Maximum roll for the dice.\nIncrease for faster battles and more randomness.\nDecrese for slower battles and less randomness.'
    case Setting.DiceMinimum:
      return 'Minimum roll for the dice.\nIncrease for faster battles and less randomness.\nDecrease for slower battles and more randomness.'
    case Setting.ExperienceDamageReduction:
      return 'Damage reduction given by 100% experience.\nIncrease for stronger experienced units.\nDecrease for weaker experienced units.'
    case Setting.FixExperience:
      if (value)
        return 'Damage reduction from experience is fixed.\nAll units benefit equally from the experience.'
      else
        return 'Experience works like in the game.\nStrength and morale damage taken affect the damage reduction.'
    case Setting.StrengthLostMultiplier:
      return 'Multiplier for strength lost.\nIncrease for slightly slower battles and more losses.\nDecrease for slightly faster battles and less losses.'
    case Setting.MinimumStrength:
      return 'Threshold for marking units defeated.\nIncrease for slightly faster battles and less losses.\nDecrease for slightly slower battles and more losses.'
    case Setting.MinimumMorale:
      return 'Threshold for marking units defeated.\nIncrease for faster battles and less losses.\nDecrease for slower battles and more losses.'
    case Setting.MoraleLostMultiplier:
      return 'Multiplier for morale lost.\nIncrease for faster battles and less losses.\nDecrease for slower battles and more losses.'
    case Setting.DefenderAdvantage:
      if (value)
        return 'Defending units can\'t be targeted when they reinforce.\nThis undocumented feature gives a minor advantage to the defender.'
      else
        return 'Defender\'s advantage is removed.\nDefender gets no undocumented benefits.'
    case Setting.RollDamage:
      return 'Additional base damage per dice roll and other modifiers.\nIncrease for faster battles, more randomness and stronger generals.\nDecrease for slower battles, less randomness and weaker generals.'
    case Setting.RollFrequency:
      return 'How many rounds dice rolls stay active.\nIncrease for more randomness.\nDecrease for less randomness.'
    case Setting.FixTargeting:
      if (value)
        return 'Targeting is fixed.\nLeft and right sides work exactly same.'
      else
        return '16th unit uses wrong targeting direction.\nLeft and right sides behave slightly differently.'
    case Setting.DefeatedPenalty:
      return 'Whether defeated units should suffer additional penalties.'
    case Setting.DefeatedPenaltyAmount:
      return 'How strong the penalty is.'
    case Setting.MaxDepth:
      return 'How many phases are simulated.\nIncrease for higher accuracy and less incomplete rounds.\nDecrease forg faster speed.'
    case Setting.PhaseLengthMultiplier:
      return 'Scales length of phases.\nIncrease for faster speed and less incomplete rounds.\nDecrease for higher accuracy.'
    case Setting.ChunkSize:
      return 'How many battles are simulated in a row. Higher values slightly increase performance but make the UI less responsive.'
    case Setting.Performance:
      return 'Quick setting for speed and accuracy.\nAffects phase length multiplier and maximum depth.'
    case Setting.UpdateCasualties:
      if (value)
        return 'Casualties and graphs are updated.\nThis slightly decreases performance.'
      else
        return 'Casualties and graphs are not updated.\nThis slightly improves performance.'
    default:
      return 'No description.'
  }
}

export type CombatSettings = {
  [Setting.BaseDamage]: number,
  [Setting.MaxBaseDamage]: number,
  [Setting.CombatWidth]: number,
  [Setting.DiceMaximum]: number,
  [Setting.DiceMinimum]: number,
  [Setting.ExperienceDamageReduction]: number,
  [Setting.StrengthLostMultiplier]: number,
  [Setting.MinimumStrength]: number,
  [Setting.MinimumMorale]: number,
  [Setting.MoraleLostMultiplier]: number,
  [Setting.RollDamage]: number,
  [Setting.RollFrequency]: number,
  [Setting.DefeatedPenalty]: DefeatedPenalty,
  [Setting.DefeatedPenaltyAmount]: number
}

export type SiteSettings = {
  [Setting.FixTargeting]: boolean,
  [Setting.DefenderAdvantage]: boolean,
  [Setting.FixExperience]: boolean,
  [Setting.ChunkSize]: number,
  [Setting.MaxDepth]: number,
  [Setting.PhaseLengthMultiplier]: number,
  [Setting.UpdateCasualties]: boolean,
  [Setting.Performance]: SimulationSpeed
}

export type Settings = CombatSettings & SiteSettings
