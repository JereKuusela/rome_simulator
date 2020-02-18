import { CountryName, Mode, Side, UnitAttribute } from "types"
import { ObjSet } from "utils"

export type WearinessValues = { [key in Side]: WearinessAttributes }
export type WearinessAttribute = UnitAttribute.Morale | UnitAttribute.Strength
export type WearinessAttributes = { [key in WearinessAttribute]: MinMax }
type MinMax = { min: number, max: number }


export enum Setting {
  StrengthLostMultiplier = 'Multiplier for strength damage',
  MoraleLostMultiplier = 'Multiplier for morale damage',
  ExperienceDamageReduction = 'Damage reduction for 100% experience',
  DiceMinimum = 'Minimum dice roll',
  DiceMaximum = 'Maximum dice roll',
  BaseRoll = 'Base roll',
  RollDamage = 'Base damage per dice roll',
  MaxRoll = 'Maximum roll',
  MinimumMorale = 'Minimum morale for combat',
  MinimumStrength = 'Minimum strength for combat',
  RollFrequency = 'Length of combat phases',
  CombatWidth = 'Base combat width',
  DefenderAdvantage = 'Defender\'s advantage',
  DisciplineDamageReduction = 'Discipline also reduces damage',
  DailyMoraleLoss = 'Daily morale loss',
  DailyDamageIncrease = 'Daily damage increase',
  FixExperience = 'Fix damage reduction from experience',
  FixTargeting = 'Fix targeting',
  BackRow = 'Enable backrow',
  FireAndShock = 'Enable fire and shock phases',
  MaxDepth = 'Statistics: Maximum depth',
  PhaseLengthMultiplier = 'Statistics: Multiplier for phase length',
  ChunkSize = 'Statistics: Chunk size',
  Performance = 'Statistics: Performance',
  CalculateWinChance = 'Statistics: Calculate win chance',
  CalculateCasualties = 'Statistics: Calculate casualties',
  CalculateResourceLosses = 'Statistics: Calculate resource losses',
  ShowGraphs = 'Statistics: Show graphs'
}

export enum SimulationSpeed {
  Custom = 'Custom',
  VeryAccurate = 'Very accurate',
  Accurate = 'Accurate',
  Normal = 'Normal',
  Fast = 'Fast',
  VeryFast = 'Very fast'
}

export const parameterToDescription = (parameter: Setting, value: string | number | boolean): string => {
  switch (parameter) {
    case Setting.BaseRoll:
      return 'Base roll for all units.\nIncrease for faster battles and less randomness.\nDecrease for slower battles and more randomness.'
    case Setting.MaxRoll:
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
    case Setting.BackRow:
      if (value)
        return 'Backrow enabled for support units (EUIV).'
      else
        return 'Only front row (Imperator).'
    case Setting.DisciplineDamageReduction:
      if (value)
        return 'Discipline increases damage done and reduces damage taken (EUIV).'
      else
        return 'Discipline only increases damage done (Imperator).'
    case Setting.FireAndShock:
      if (value)
        return 'Combat alternates between fire and shock phases (EUIV).'
      else
        return 'Combat only has one phase (Imperator).'
    case Setting.DailyMoraleLoss:
      return 'Amount of morale lost each round in battle (EUIV).'
    case Setting.DailyDamageIncrease:
      return 'Amount of increased damage every round (EUIV).'
    case Setting.RollDamage:
      return 'Additional base damage per dice roll and other modifiers.\nIncrease for faster battles, more randomness and stronger generals.\nDecrease for slower battles, less randomness and weaker generals.'
    case Setting.RollFrequency:
      return 'How many rounds dice rolls stay active.\nIncrease for more randomness.\nDecrease for less randomness.'
    case Setting.FixTargeting:
      if (value)
        return 'Targeting is fixed.\nLeft and right sides work exactly same.'
      else
        return '16th unit uses wrong targeting direction.\nLeft and right sides behave slightly differently.'
    case Setting.MaxDepth:
      return 'How many phases are simulated.\nIncrease for higher accuracy and less incomplete rounds.\nDecrease forg faster speed.'
    case Setting.PhaseLengthMultiplier:
      return 'Scales length of phases.\nIncrease for faster speed and less incomplete rounds.\nDecrease for higher accuracy.'
    case Setting.ChunkSize:
      return 'How many battles are simulated in a row. Higher values slightly increase performance but make the UI less responsive.'
    case Setting.Performance:
      return 'Quick setting for speed and accuracy.\nAffects phase length multiplier and maximum depth.'
    case Setting.CalculateWinChance:
      if (value)
        return 'Win chance and average rounds are calculated.\nThis slightly decreases performance.'
      else
        return 'Win chance and average rounds won\'t be calculated.\nThis slightly improves performance.'
    case Setting.CalculateCasualties:
      if (value)
        return 'Casualties are calculated.\nThis slightly decreases performance.'
      else
        return 'Casualties won\'t be calculated.\nThis slightly improves performance.'
    case Setting.CalculateResourceLosses:
      if (value)
        return 'Gold losses are calculated for naval combat.\nThis slightly decreases performance.'
      else
        return 'Gold losses won\'t be calculated for naval combat.\nThis slightly improves performance.'
    case Setting.ShowGraphs:
      if (value)
        return 'Graphs are shown.\nThis slightly decreases performance.'
      else
        return 'Graphs won\'t be shown.\nThis slightly improves performance.'
    default:
      return 'No description.'
  }
}

export type CombatSettings = {
  [Setting.BaseRoll]: number,
  [Setting.MaxRoll]: number,
  [Setting.CombatWidth]: number,
  [Setting.DiceMaximum]: number,
  [Setting.DiceMinimum]: number,
  [Setting.ExperienceDamageReduction]: number,
  [Setting.StrengthLostMultiplier]: number,
  [Setting.MinimumStrength]: number,
  [Setting.MinimumMorale]: number,
  [Setting.MoraleLostMultiplier]: number,
  [Setting.RollDamage]: number,
  [Setting.RollFrequency]: number
}

export type SiteSettings = {
  [Setting.FixTargeting]: boolean,
  [Setting.DefenderAdvantage]: boolean,
  [Setting.FixExperience]: boolean,
  [Setting.ChunkSize]: number,
  [Setting.MaxDepth]: number,
  [Setting.PhaseLengthMultiplier]: number,
  [Setting.CalculateWinChance]: boolean,
  [Setting.CalculateCasualties]: boolean,
  [Setting.CalculateResourceLosses]: boolean,
  [Setting.ShowGraphs]: boolean,
  [Setting.BackRow]: boolean,
  [Setting.DisciplineDamageReduction]: boolean,
  [Setting.FireAndShock]: boolean,
  [Setting.DailyMoraleLoss]: number,
  [Setting.DailyDamageIncrease]: number,
  [Setting.Performance]: SimulationSpeed
}

export type Settings = CombatSettings & SiteSettings

export type SettingsAndOptions = {
  combatSettings: { [key in Mode]: CombatSettings }
  siteSettings: SiteSettings
  mode: Mode
  country: CountryName
  accordions: ObjSet
  weariness: WearinessValues
}
