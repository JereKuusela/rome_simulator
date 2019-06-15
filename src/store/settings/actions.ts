import { createAction } from 'typesafe-actions'

export enum CombatParameter {
  ManpowerLostMultiplier = 'ManpowerLostMultiplier',
  MoraleLostMultiplier = 'MoraleLostMultiplier',
  MoraleDamageBase = 'MoraleDamageBase',
  ExperienceDamageReduction = 'ExperienceDamageReduction',
  DiceMinimum = 'DiceMinimum',
  DiceMaximum = 'DiceMaximum',
  BaseDamage = 'BaseDamage',
  RollDamage = 'RollDamage',
  MinimumMorale = 'MinimumMorale',
  MinimumManpower = 'MinimumManpower',
  RollFrequency = 'RollFrequency',
  CombatWidth = 'CombatWidth',
  FlankTargetsOwnEdge = 'FlankTargetsOwnEdge',
  ReinforceFirst = 'ReinforceFirst'
}

export const parameterToDescription = (parameter: CombatParameter): string => {
  switch (parameter) {
    case CombatParameter.BaseDamage:
      return 'Base damage each unit deals.'
    case CombatParameter.CombatWidth:
      return 'Width of the battlefield.'
    case CombatParameter.DiceMaximum:
      return 'Maximum roll for the dice.'
    case CombatParameter.DiceMinimum:
      return 'Minimum roll for the dice.'
    case CombatParameter.ExperienceDamageReduction:
      return 'Damage reduction given by 100% experience.'
    case CombatParameter.ManpowerLostMultiplier:
      return 'Multiplier for manpower lost.'
    case CombatParameter.MinimumManpower:
      return 'Minimum manpower required for combat.'
    case CombatParameter.MinimumMorale:
      return 'Minimum morale required for combat.'
    case CombatParameter.MoraleDamageBase:
      return 'Base value for morale damage.'
    case CombatParameter.MoraleLostMultiplier:
      return 'Multiplier for morale lost.'
    case CombatParameter.FlankTargetsOwnEdge:
      return 'Flanking units target the left-most target.\nThis makes left and right flank behave differently.\nThis is probably a bug in the game. Set 1 to fix this.'
    case CombatParameter.ReinforceFirst:
      return 'Attackers pick targets before defenders reinforce.\nThis makes attacker and defender behave differently.\nThis is probably a bug in the game. Set 1 to fix this.'
    case CombatParameter.RollDamage:
      return 'Additional damage each unit deals per dice roll and other modifiers.'
    case CombatParameter.RollFrequency:
      return 'How many rounds dice rolls stay active.'
    default:
      return 'No description.'
  }
}

export const changeParamater = createAction('@@settings/CHANGE_PARAMETER', action => {
  return (key: CombatParameter, value: number) => action({ key, value })
})

