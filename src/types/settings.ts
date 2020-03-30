import { CountryName, Mode } from "types"
import { ObjSet } from "utils"

export enum Setting {
  StrengthLostMultiplier = 'Multiplier for strength damage',
  MoraleLostMultiplier = 'Multiplier for morale damage',
  ExperienceDamageReduction = 'Damage reduction for 100% experience',
  DiceMinimum = 'Minimum dice roll',
  DiceMaximum = 'Maximum dice roll',
  BasePips = 'Base pips',
  MaxPips = 'Maximum pips',
  MaxGeneral = 'Maximum skill of generals',
  MinimumMorale = 'Minimum morale for combat',
  MinimumStrength = 'Minimum strength for combat',
  MoraleHitForNonSecondaryReinforcement = 'Morale damage for non-secondary reinforcements',
  RollFrequency = 'Length of combat phases',
  Precision = 'Calculation precision',
  CombatWidth = 'Base combat width',
  DefenderAdvantage = 'Defender\'s advantage',
  DisciplineDamageReduction = 'Discipline also reduces damage',
  DailyMoraleLoss = 'Daily morale loss',
  DailyDamageIncrease = 'Daily damage increase',
  FixExperience = 'Fix damage reduction from experience',
  FixTargeting = 'Fix targeting',
  FixFlankTargeting = 'Fix targeting',
  DynamicTargeting = 'Dynamic targeting',
  BackRow = 'Enable backrow',
  BackRowRetreat = 'Enable retreating from backrow',
  RetreatRounds = 'Minimum rounds for retreat',
  Tactics = 'Enable tactics',
  Martial = 'Enable general martial',
  Tech = 'Enable tech based units',
  Food = 'Enable food attributes',
  Culture = 'Enable culture based units',
  CustomDeployment = 'Enable deployment customization',
  DynamicFlanking = 'Enable dynamic flanking',
  UseMaxMorale = 'Morale damage based on max morale',
  SupportPhase = 'Deploy support units separately',
  InsufficientSupportPenalty = 'Penalty for insufficient support',
  StrengthBasedFlank = 'Enable strength based flank',
  FireAndShock = 'Enable fire and shock phases',
  AttributeCombatAbility = 'Enable Combat ability attribute',
  AttributeDrill = 'Enable Drill attribute',
  AttributeExperience = 'Enable Experience attribute',
  AttributeMilitaryTactics = 'Enable Military tactics attribute',
  AttributeOffenseDefense = 'Enable Offense and Defense attributes',
  AttributeDamage = 'Enable Damage done and Damage taken attributes',
  AttributeMoraleDamage = 'Enable Morale damage done and Morale damage taken attributes',
  AttributeStrengthDamage = 'Enable Strength damage done and Strength damage taken attributes',
  AttributeTerrainType = 'Enable terrain type based attributes',
  AttributeUnitType = 'Enable unit type based attributes',
  Performance = 'Performance',
  MaxDepth = 'Maximum depth',
  PhaseLengthMultiplier = 'Multiplier for phase length',
  ChunkSize = 'Chunk size',
  CalculateWinChance = 'Calculate win chance',
  CalculateCasualties = 'Calculate casualties',
  CalculateResourceLosses = 'Calculate resource losses',
  ReduceRolls = 'Reduce possible dice rolls',
  ShowGraphs = 'Show graphs',
  AutoRefresh = 'Automatic refresh'
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
    case Setting.BasePips:
      return 'Base pips for all units. Affects how much damage units deal.'
    case Setting.MaxPips:
      return 'Maximum amount of pips. Affects how much damage units deal.'
    case Setting.MaxGeneral:
      return 'Maximum amount of pips on generals.'
    case Setting.CombatWidth:
      return 'Width of the frontline. Affects how many units can fight at the same time.'
    case Setting.DiceMaximum:
      return 'Maximum dice roll. Affects how much damage units deal.'
    case Setting.DiceMinimum:
      return 'Minimum dice roll. Affects how much damage units deal.'
    case Setting.ExperienceDamageReduction:
      return 'Damage reduction given at 100% experience.'
    case Setting.Precision:
      return 'Precision of combat calculations. Advanced setting.'
    case Setting.FixExperience:
      if (value)
        return 'Damage reduction from experience is fixed. All units benefit equally from the experience.'
      else
        return 'Experience works like in the game.Strength and morale damage taken affect the damage reduction.'
    case Setting.StrengthLostMultiplier:
      return 'Multiplier for strength damage. Affects how much strength damage units deal.'
    case Setting.MinimumStrength:
      return 'Strength required for combat.Affects how quicky units retreat.'
    case Setting.MoraleHitForNonSecondaryReinforcement:
      return 'Percentage of total morale lost when non-secondary units reinforce (Imperator).'
    case Setting.MinimumMorale:
      return 'Morale required for combat.Affects how quicky units retreat.'
    case Setting.MoraleLostMultiplier:
      return 'Multiplier for morale damage. Affects how much morale damage units deal.'
    case Setting.DefenderAdvantage:
      if (value)
        return 'Defending units can\'t be targeted when they reinforce (EUIV).'
      else
        return 'Defender gets no undocumented benefits (Imperator).'
    case Setting.BackRow:
      if (value)
        return 'Backrow enabled for support and reinforcement units (EUIV).'
      else
        return 'Only front row (Imperator).'
    case Setting.BackRowRetreat:
      if (value)
        return 'Units from backrow can\'t retreat. (EUIV).'
      else
        return 'Units can retreat from backrow.'
    case Setting.RetreatRounds:
      return 'How long the battle must last to enable retreat.'
    case Setting.CustomDeployment:
      if (value)
        return 'Preferred unit types can be selected (Imperator).'
      else
        return 'Preferred unit types are not available (EUIV).'
    case Setting.DynamicFlanking:
      if (value)
        return 'Enemy army size affects flanking slots (EUIV).'
      else
        return 'Amount of flanking slots is only based on preferred flanking (Imperator).'
    case Setting.Tactics:
      if (value)
        return 'Tactics not available (Imperator).'
      else
        return 'Tactics available (EUIV).'
    case Setting.Martial:
      if (value)
        return 'Martial attribute available (Imperator).'
      else
        return 'Martial not available (EUIV).'
    case Setting.Tech:
      if (value)
        return 'Tech level affects available units (EUIV).'
      else
        return 'Units are available regardless of tech level (Imperator).'
    case Setting.Culture:
      if (value)
        return 'Culture affects available units (EUIV).'
      else
        return 'Units are available regardless of culture (Imperator).'
    case Setting.Food:
      if (value)
        return 'Food consumption and storage are shown (Imperator).'
      else
        return 'Food attributes are not available (EUIV).'
    case Setting.StrengthBasedFlank:
      if (value)
        return 'Every 25% of lost strength reduces maneuveur by 25% (EUIV).'
      else
        return 'Cohort strength has no effect on maneuver (Imperator).'
    case Setting.DisciplineDamageReduction:
      if (value)
        return 'Discipline increases damage done and reduces damage taken (EUIV).'
      else
        return 'Discipline only increases damage done (Imperator).'
    case Setting.UseMaxMorale:
      if (value)
        return 'Morale damage is based on the maximum morale (EUIV).'
      else
        return 'Morale damage is based on the current morale (Imperator).'
    case Setting.FireAndShock:
      if (value)
        return 'Combat alternates between fire and shock phases (EUIV).'
      else
        return 'Combat only has one phase (Imperator).'
    case Setting.SupportPhase:
      if (value)
        return 'Support units are deployed when no other units are available (Imperator).'
      else
        return 'Support units deploy with other units. (EUIV).'
    case Setting.DailyMoraleLoss:
      return 'Amount of morale lost each round (EUIV).'
    case Setting.DailyDamageIncrease:
      return 'How much damage increases every round (EUIV).'
    case Setting.RollFrequency:
      return 'How often dice rolls and phases change.'
    case Setting.InsufficientSupportPenalty:
      return 'How much damage taken is increased for having too many flanking units (EUIV).'
    case Setting.FixTargeting:
      if (value)
        return 'Targeting is fixed.\nLeft and right flanks work exactly same.'
      else
        return '16th unit uses wrong targeting direction.\nLeft and right flanks behave slightly differently.'
    case Setting.FixFlankTargeting:
      if (value)
        return 'Targeting is fixed.\nLeft and right flanks work exactly same (Imperator).'
      else
        return 'Right flank prefers left-most units.\nLeft and right flanks behave differently (EUIV).'
    case Setting.DynamicTargeting:
      if (value)
        return 'Units may flank if the main target is considered too weak (EUIV).'
      else
        return 'Units always attack the main target (Imperator).'
    case Setting.AttributeCombatAbility:
      if (value)
        return 'Combat ability increases damage done (EUIV).'
      else
        return 'Combat ability is ignored (Imperator).'
    case Setting.AttributeDamage:
      if (value)
        return 'Damage done and Damage taken have an effect (Imperator, EUIV).'
      else
        return 'Damage done and Damage taken are ignored.'
    case Setting.AttributeDrill:
      if (value)
        return 'Drill increases damage done and reduces damage taken (EUIV).'
      else
        return 'Drill is ignored (Imperator).'
    case Setting.AttributeExperience:
      if (value)
        return 'Experience reduces damage taken (Imperator).'
      else
        return 'Experience is ignored (EUIV).'
    case Setting.AttributeMilitaryTactics:
      if (value)
        return 'Military tactics reduces damage taken (EUIV).'
      else
        return 'Military tactics is ignored (Imperator).'
    case Setting.AttributeMoraleDamage:
      if (value)
        return 'Morale damage done and Morale damage taken have an effect (Imperator).'
      else
        return 'Morale damage done and Morale damage taken are ignored (EUIV).'
    case Setting.AttributeOffenseDefense:
      if (value)
        return 'Offense increases damage done and Defense reduces damage taken (Imperator).'
      else
        return 'Offense and Defense are ignored (EUIV).'
    case Setting.AttributeStrengthDamage:
      if (value)
        return 'Strength damage done and Strength damage taken have an effect (Imperator).'
      else
        return 'Strength damage done and Strength damage taken are ignored (EUIV).'
    case Setting.AttributeTerrainType:
      if (value)
        return 'Terrain types may also increase damage done (Imperator).'
      else
        return 'Terrain types only affect dice rolls (EUIV).'
    case Setting.AttributeUnitType:
      if (value)
        return 'Unit types may increase or decrease damage done (Imperator).'
      else
        return 'Unit types are ignored (EUIV).'
    case Setting.MaxDepth:
      return 'How many phases are simulated.\nIncrease for higher accuracy and less incomplete rounds.\nDecrease forg faster speed.'
    case Setting.PhaseLengthMultiplier:
      return 'Scales length of phases.\nIncrease for faster speed and less incomplete rounds.\nDecrease for higher accuracy.'
    case Setting.ChunkSize:
      return 'How many battles are simulated in a row. Higher values slightly increase performance but make the UI less responsive.'
    case Setting.Performance:
      return 'Quick setting for speed and accuracy.\nAffects phase length multiplier and maximum depth.'
    case Setting.ReduceRolls:
      return 'Halves number of available dice rolls.\nMassively increases performance.'
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
    case Setting.AutoRefresh:
      if (value)
        return 'Battle refreshes automatically after any changes.'
      else
        return 'Battle only refreshes when going to previous or next rounds.'
    default:
      return 'No description.'
  }
}

export type CombatSettings = {
  [Setting.MoraleLostMultiplier]: number,
  [Setting.StrengthLostMultiplier]: number
}

export type SiteSettings = {
  [Setting.BasePips]: number,
  [Setting.MaxPips]: number,
  [Setting.MaxGeneral]: number,
  [Setting.CombatWidth]: number,
  [Setting.DiceMaximum]: number,
  [Setting.DiceMinimum]: number,
  [Setting.ExperienceDamageReduction]: number,
  [Setting.MinimumStrength]: number,
  [Setting.MoraleHitForNonSecondaryReinforcement]: number,
  [Setting.MinimumMorale]: number,
  [Setting.RollFrequency]: number,
  [Setting.FixTargeting]: boolean,
  [Setting.DynamicTargeting]: boolean,
  [Setting.FixFlankTargeting]: boolean,
  [Setting.DefenderAdvantage]: boolean,
  [Setting.FixExperience]: boolean,
  [Setting.Precision]: number,
  [Setting.ChunkSize]: number,
  [Setting.MaxDepth]: number,
  [Setting.PhaseLengthMultiplier]: number,
  [Setting.ShowGraphs]: boolean,
  [Setting.BackRow]: boolean,
  [Setting.BackRowRetreat]: boolean,
  [Setting.RetreatRounds]: number,
  [Setting.Tactics]: boolean,
  [Setting.Martial]: boolean,
  [Setting.Tech]: boolean,
  [Setting.Culture]: boolean,
  [Setting.Food]: boolean,
  [Setting.CustomDeployment]: boolean,
  [Setting.DynamicFlanking]: boolean,
  [Setting.UseMaxMorale]: boolean,
  [Setting.StrengthBasedFlank]: boolean,
  [Setting.InsufficientSupportPenalty]: number,
  [Setting.DisciplineDamageReduction]: boolean,
  [Setting.FireAndShock]: boolean,
  [Setting.SupportPhase]: boolean,
  [Setting.DailyMoraleLoss]: number,
  [Setting.DailyDamageIncrease]: number,
  [Setting.AttributeCombatAbility]: boolean,
  [Setting.AttributeDamage]: boolean,
  [Setting.AttributeDrill]: boolean,
  [Setting.AttributeExperience]: boolean,
  [Setting.AttributeMilitaryTactics]: boolean,
  [Setting.AttributeMoraleDamage]: boolean,
  [Setting.AttributeOffenseDefense]: boolean,
  [Setting.AttributeStrengthDamage]: boolean,
  [Setting.AttributeTerrainType]: boolean,
  [Setting.AttributeUnitType]: boolean,
  [Setting.CalculateWinChance]: boolean,
  [Setting.CalculateCasualties]: boolean,
  [Setting.CalculateResourceLosses]: boolean,
  [Setting.ReduceRolls]: number,
  [Setting.Performance]: SimulationSpeed,
  [Setting.AutoRefresh]: boolean
}

export type Settings = CombatSettings & SiteSettings

export type SettingsAndOptions = {
  combatSettings: { [key in Mode]: CombatSettings }
  siteSettings: SiteSettings
  mode: Mode
  country: CountryName
  accordions: ObjSet
}
