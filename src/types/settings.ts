import { CountryName, Mode } from "types"

export enum Setting {
  GlobalTargeting = 'Units attack all targets',
  StrengthLostMultiplier = 'Multiplier for strength damage',
  MoraleLostMultiplier = 'Multiplier for morale damage',
  ExperienceDamageReduction = 'Damage reduction for 100% experience',
  DiceMinimum = 'Minimum dice roll',
  DiceMaximum = 'Maximum dice roll',
  BasePips = 'Base pips',
  MaxPips = 'Maximum pips',
  MaxGeneral = 'Maximum skill of generals',
  MaxCountering = 'Maximum countering bonus',
  CounteringDamage = 'Countering efficieny',
  CounteringMode = 'Countering mode',
  MinimumMorale = 'Minimum morale for combat',
  MinimumStrength = 'Minimum strength for combat',
  DamageLossForMissingMorale = 'Damage loss for missing morale',
  MoraleHitForNonSecondaryReinforcement = 'Morale damage for non-secondary reinforcements',
  MoraleHitForLateDeployment = 'Morale damage for late deployment',
  MoraleGainForWinning = 'Morale gain for winning',
  PhaseLength = 'Length of combat phases',
  Precision = 'Calculation precision',
  BaseCombatWidth = 'Base combat width',
  DefenderAdvantage = 'Defender\'s advantage',
  RelativePips = 'Relative pips',
  AttributeDiscipline = 'Enable discipline',
  DailyMoraleLoss = 'Daily morale loss',
  DailyDamageIncrease = 'Daily damage increase',
  FixExperience = 'Fix damage reduction from experience',
  FixFlankTargeting = 'Fix targeting',
  DynamicTargeting = 'Dynamic targeting',
  BackRow = 'Enable backrow',
  BackRowRetreat = 'Enable retreating from backrow',
  RetreatRounds = 'Minimum rounds for retreat',
  StackwipeRounds = 'Minimum rounds for soft stack wipe',
  SoftStackWipeLimit = 'Strength required for soft stack wipe',
  HardStackWipeLimit = 'Strength required for hard stack wipe',
  AttackerSwapping = 'Enable attacker swapping',
  Tactics = 'Enable tactics',
  Stackwipe = 'Enable stack wiping',
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
  AttributeLoyal = 'Enable Loyal attribute',
  AttributeDrill = 'Enable Drill attribute',
  AttributeExperience = 'Enable Experience attribute',
  AttributeMilitaryTactics = 'Enable Military tactics attribute',
  AttributeOffenseDefense = 'Enable Offense and Defense attributes',
  AttributeDamage = 'Enable Damage done and Damage taken attributes',
  AttributeMoraleDamage = 'Enable Morale damage done and Morale damage taken attributes',
  AttributeStrengthDamage = 'Enable Strength damage done and Strength damage taken attributes',
  AttributeTerrainType = 'Enable terrain type based attributes',
  MoraleDamageBasedOnTargetStrength = 'Enable morale damaged based on target strength',
  Performance = 'Performance',
  MaxPhases = 'Maximum phases',
  PhasesPerRoll = 'Amount of phases affected by each dice roll',
  ChunkSize = 'Chunk size',
  CalculateWinChance = 'Calculate win chance',
  CalculateCasualties = 'Calculate casualties',
  CalculateResourceLosses = 'Calculate resource losses',
  ReduceRolls = 'Reduce possible dice rolls',
  ShowGraphs = 'Show graphs',
  AutoRefresh = 'Automatic refresh',
  StackWipeCaptureChance = 'Capture chance when stack wiping'
}

export enum SimulationSpeed {
  Custom = 'Custom',
  VeryAccurate = 'Very accurate',
  Accurate = 'Accurate',
  Normal = 'Normal',
  Fast = 'Fast',
  VeryFast = 'Very fast'
}

export enum DisciplineValue {
  Off = 'Disabled',
  Damage = 'Only damage done',
  Both = 'Both damage done and taken'
}

export enum CounteringMode {
  Default = 'Default',
  OnlyPenalty = 'OnlyPenalty',
  OnlyBonus = 'OnlyBonus'
}

export enum SupportDeployValue {
  On = 'On',
  Separately = 'Separately',
  Off = 'Off'
}

export const parameterToDescription = (parameter: Setting, value: string | number | boolean): string => {
  switch (parameter) {
    case Setting.BasePips:
      return 'Base pips for all units. Affects how much damage units deal. (EU4, CK3, IR)'
    case Setting.MaxPips:
      return 'Maximum amount of pips. Affects how much damage units deal. (IR)'
    case Setting.MaxGeneral:
      return 'Maximum amount of pips on generals. (EU4)'
    case Setting.BaseCombatWidth:
      return 'Base width of the frontline. Affects how many units can fight at the same time. (EU4, IR)'
    case Setting.DiceMaximum:
      return 'Maximum dice roll. Affects how much damage units deal. (EU4, CK3, IR)'
    case Setting.DiceMinimum:
      return 'Minimum dice roll. Affects how much damage units deal. (EU4, CK3, IR)'
    case Setting.ExperienceDamageReduction:
      return 'Damage reduction given at 100% experience. (IR)'
    case Setting.Precision:
      return 'Precision of combat calculations. Advanced setting. (EU4, CK3, IR)'
    case Setting.StackWipeCaptureChance:
      return 'Additional unit capture chance when stack wiping an army. (IR)'
    case Setting.GlobalTargeting:
      if (value)
        return 'All units simultaneously attack all targets. (CK3)'
      else
        return 'Units attack a single target. (EU4, IR)'
    case Setting.FixExperience:
      if (value)
        return 'Damage reduction from experience is fixed. All units benefit equally from the experience.'
      else
        return 'Experience works like in the game. Strength and morale damage taken affect the damage reduction. (IR)'
    case Setting.StrengthLostMultiplier:
      return 'Multiplier for strength damage. Affects how much strength damage units deal. (EU4, CK3, IR)'
    case Setting.MinimumStrength:
      return 'Strength required for combat. Affects how quicky units retreat.'
    case Setting.DamageLossForMissingMorale:
      return 'Reduced damage done for lost morale.'
    case Setting.MoraleHitForNonSecondaryReinforcement:
      return 'Percentage of total morale lost when non-secondary units reinforce. (IR)'
    case Setting.MoraleHitForLateDeployment:
      return 'Percentage of total morale lost when armies deploy after retreat is available. (IR)'
    case Setting.MoraleGainForWinning:
      return 'Percentage of total morale gained when winning a battle. (EU4)'
    case Setting.MinimumMorale:
      return 'Morale required for combat. Affects how quicky units retreat. (IR)'
    case Setting.MoraleLostMultiplier:
      return 'Multiplier for morale damage. Affects how much morale damage units deal. (EU4, IR)'
    case Setting.DefenderAdvantage:
      if (value)
        return 'Defending units can\'t be targeted when they reinforce.'
      else
        return 'Defender gets no undocumented benefits. (EU4. IR)'
    case Setting.RelativePips:
      if (value)
        return 'The difference of pips is only applied to the side with a higher amount (CK3)'
      else
        return 'Pips are applied independently to both sides. (EU4. IR)'
    case Setting.BackRow:
      if (value)
        return 'Backrow enabled for support and reinforcement units. (EU4)'
      else
        return 'Only front row. (CK3, IR)'
    case Setting.BackRowRetreat:
      if (value)
        return 'Units can retreat from backrow'
      else
        return 'Units from backrow can\'t retreat. (EU4)'
    case Setting.RetreatRounds:
      return 'How long the battle must last to enable retreat. (CK3, EU4, IR)'
    case Setting.StackwipeRounds:
      return 'How long the battle must last to disable soft stack wiping. (CK3, EU4, IR)'
    case Setting.SoftStackWipeLimit:
      return 'Strength multiplier for soft stack wiping. (EU4, IR)'
    case Setting.HardStackWipeLimit:
      return 'Strength multiplier for hard stack wiping. (EU4, IR)'
    case Setting.Stackwipe:
      if (value)
        return 'Stacking wiping rules are checked. (CK3, EU4, IR)'
      else
        return 'Stack wiping is not possible.'
    case Setting.MoraleDamageBasedOnTargetStrength:
      if (value)
        return 'Lower strength increases morale damage taken.'
      else
        return 'Strength doesn\'t affect morale damage taken. (EU4, IR).'
    case Setting.CustomDeployment:
      if (value)
        return 'Preferred unit types can be selected. (IR)'
      else
        return 'Preferred unit types are not available. (EU4)'
    case Setting.DynamicFlanking:
      if (value)
        return 'Enemy army size affects flanking slots. (EU4)'
      else
        return 'Amount of flanking slots is only based on preferred flanking. (IR)'
    case Setting.Tactics:
      if (value)
        return 'Tactics available. (IR)'
      else
        return 'Tactics not available. (CK3, EU4)'
    case Setting.AttackerSwapping:
      if (value)
        return 'With multiple battles, the attacker becomes defender if it wins a battle. (CK3, EU4, IR)'
      else
        return 'With multiple battles, the original attacker always stays attacker.'
    case Setting.Martial:
      if (value)
        return 'Martial attribute available. (IR)'
      else
        return 'Martial not available. (CK3, EU4)'
    case Setting.Tech:
      if (value)
        return 'Tech level affects available units. (EU4)'
      else
        return 'Units are available regardless of tech level. (CK3, IR)'
    case Setting.Culture:
      if (value)
        return 'Culture affects available units. (EU4)'
      else
        return 'Units are available regardless of culture. (CK3, IR)'
    case Setting.Food:
      if (value)
        return 'Food consumption and storage are shown. (IR)'
      else
        return 'Food attributes are not available. (CK3, EU4)'
    case Setting.StrengthBasedFlank:
      if (value)
        return 'Every 25% of lost strength reduces maneuveur by 25%. (EU4)'
      else
        return 'Cohort strength has no effect on maneuver. (IR)'
    case Setting.AttributeDiscipline:
      if (value === DisciplineValue.Damage)
        return 'Discipline only increases damage done. (IR)'
      else if (value === DisciplineValue.Both)
        return 'Discipline increaes damage done and reduces damage taken. (EU4)'
      else
        return 'Discipline has no effect.'
    case Setting.CounteringMode:
      if (value === CounteringMode.OnlyPenalty)
        return 'Bonus is applied as a penalty to the opponent. (CK3).'
      else if (value === CounteringMode.OnlyBonus)
        return 'Penalty is applied as a bonus to the opponent.'
      else
        return 'Both bonus and penalty work. (IR)'
    case Setting.UseMaxMorale:
      if (value)
        return 'Morale damage is based on the maximum morale. (EU4)'
      else
        return 'Morale damage is based on the current morale. (IR)'
    case Setting.FireAndShock:
      if (value)
        return 'Combat alternates between fire and shock phases. (EU4)'
      else
        return 'Combat only has one phase, (CK3, IR).'
    case Setting.SupportPhase:
      if (value === SupportDeployValue.Separately)
        return 'Support units are deployed when no other units are available. (IR)'
      else if (value === SupportDeployValue.Off)
        return 'Support units won\t deploy. (CK3)'
      else
        return 'Support units deploy with other units. (EU4)'
    case Setting.MaxCountering:
      return 'Maximum amount of countering. (CK3)'
    case Setting.CounteringDamage:
      return 'Damage multiplier for countering bonus and penalty. (CK3)'
    case Setting.DailyMoraleLoss:
      return 'Amount of morale lost each round. (EU4)'
    case Setting.DailyDamageIncrease:
      return 'How much damage increases every round. (EU4)'
    case Setting.PhaseLength:
      return 'How often dice rolls and phases change. (CK3, EU4, IR)'
    case Setting.InsufficientSupportPenalty:
      return 'How much damage taken is increased for having too many flanking units. (EU4)'
    case Setting.FixFlankTargeting:
      if (value)
        return 'Targeting is fixed.\nLeft and right flanks work exactly same. (IR)'
      else
        return 'Right flank prefers left-most units.\nLeft and right flanks behave differently. (EU4)'
    case Setting.DynamicTargeting:
      if (value)
        return 'Units may flank if the main target is considered too weak. (EU4)'
      else
        return 'Units always attack the main target. (IR)'
    case Setting.AttributeCombatAbility:
      if (value)
        return 'Combat ability increases damage done. (EU4)'
      else
        return 'Combat ability is ignored.'
    case Setting.AttributeDamage:
      if (value)
        return 'Damage done and Damage taken have an effect. (IR, EU4)'
      else
        return 'Damage done and Damage taken are ignored.'
    case Setting.AttributeLoyal:
      if (value)
        return 'Loyalty increase damage done. (IR)'
      else
        return 'Loyalty is ignored.'
    case Setting.AttributeDrill:
      if (value)
        return 'Drill increases damage done and reduces damage taken. (EU4)'
      else
        return 'Drill is ignored.'
    case Setting.AttributeExperience:
      if (value)
        return 'Experience reduces damage taken. (IR)'
      else
        return 'Experience is ignored.'
    case Setting.AttributeMilitaryTactics:
      if (value)
        return 'Military tactics reduces damage taken. (EU4)'
      else
        return 'Military tactics is ignored.'
    case Setting.AttributeMoraleDamage:
      if (value)
        return 'Morale damage done and Morale damage taken have an effect. (IR).'
      else
        return 'Morale damage done and Morale damage taken are ignored.'
    case Setting.AttributeOffenseDefense:
      if (value)
        return 'Offense increases damage done and Defense reduces damage taken. (IR)'
      else
        return 'Offense and Defense are ignored.'
    case Setting.AttributeStrengthDamage:
      if (value)
        return 'Strength damage done and Strength damage taken have an effect. (IR)'
      else
        return 'Strength damage done and Strength damage taken are ignored.'
    case Setting.AttributeTerrainType:
      if (value)
        return 'Terrain types affect pips and unit damage (CK3, IR).'
      else
        return 'Terrain types only affect pips (EU4).'
    case Setting.MaxPhases:
      return 'How many phases are simulated.\nIncrease for higher accuracy and less incomplete rounds.\nDecrease forg faster speed.'
    case Setting.PhasesPerRoll:
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
  [Setting.StrengthLostMultiplier]: number,
  [Setting.StackWipeCaptureChance]: number
}

export type SiteSettings = {
  [Setting.GlobalTargeting]: boolean,
  [Setting.BasePips]: number,
  [Setting.MaxPips]: number,
  [Setting.MaxGeneral]: number,
  [Setting.CounteringDamage]: number,
  [Setting.CounteringMode]: CounteringMode,
  [Setting.MaxCountering]: number,
  [Setting.BaseCombatWidth]: number,
  [Setting.DiceMaximum]: number,
  [Setting.DiceMinimum]: number,
  [Setting.ExperienceDamageReduction]: number,
  [Setting.MinimumStrength]: number,
  [Setting.MoraleHitForNonSecondaryReinforcement]: number,
  [Setting.MoraleHitForLateDeployment]: number,
  [Setting.MoraleGainForWinning]: number,
  [Setting.MinimumMorale]: number,
  [Setting.PhaseLength]: number,
  [Setting.DynamicTargeting]: boolean,
  [Setting.FixFlankTargeting]: boolean,
  [Setting.DefenderAdvantage]: boolean,
  [Setting.FixExperience]: boolean,
  [Setting.Precision]: number,
  [Setting.ChunkSize]: number,
  [Setting.MaxPhases]: number,
  [Setting.PhasesPerRoll]: number,
  [Setting.ShowGraphs]: boolean,
  [Setting.BackRow]: boolean,
  [Setting.RelativePips]: boolean,
  [Setting.BackRowRetreat]: boolean,
  [Setting.RetreatRounds]: number,
  [Setting.Stackwipe]: boolean,
  [Setting.StackwipeRounds]: number,
  [Setting.SoftStackWipeLimit]: number,
  [Setting.HardStackWipeLimit]: number,
  [Setting.MoraleDamageBasedOnTargetStrength]: boolean,
  [Setting.DamageLossForMissingMorale]: number,
  [Setting.Tactics]: boolean,
  [Setting.AttackerSwapping]: boolean,
  [Setting.Martial]: boolean,
  [Setting.Tech]: boolean,
  [Setting.Culture]: boolean,
  [Setting.Food]: boolean,
  [Setting.CustomDeployment]: boolean,
  [Setting.DynamicFlanking]: boolean,
  [Setting.UseMaxMorale]: boolean,
  [Setting.StrengthBasedFlank]: boolean,
  [Setting.InsufficientSupportPenalty]: number,
  [Setting.AttributeDiscipline]: DisciplineValue,
  [Setting.FireAndShock]: boolean,
  [Setting.SupportPhase]: SupportDeployValue,
  [Setting.DailyMoraleLoss]: number,
  [Setting.DailyDamageIncrease]: number,
  [Setting.AttributeCombatAbility]: boolean,
  [Setting.AttributeDamage]: boolean,
  [Setting.AttributeDrill]: boolean,
  [Setting.AttributeLoyal]: boolean,
  [Setting.AttributeExperience]: boolean,
  [Setting.AttributeMilitaryTactics]: boolean,
  [Setting.AttributeMoraleDamage]: boolean,
  [Setting.AttributeOffenseDefense]: boolean,
  [Setting.AttributeStrengthDamage]: boolean,
  [Setting.AttributeTerrainType]: boolean,
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
  army: number
}
