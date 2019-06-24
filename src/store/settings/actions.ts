import { createAction } from 'typesafe-actions'
import { DefinitionType } from '../../base_definition'

export enum CombatParameter {
  StrengthLostMultiplier = 'StrengthLostMultiplier',
  MoraleLostMultiplier = 'MoraleLostMultiplier',
  MoraleDamageBase = 'MoraleDamageBase',
  ExperienceDamageReduction = 'ExperienceDamageReduction',
  DiceMinimum = 'DiceMinimum',
  DiceMaximum = 'DiceMaximum',
  BaseDamage = 'BaseDamage',
  RollDamage = 'RollDamage',
  MinimumMorale = 'MinimumMorale',
  MinimumStrength = 'MinimumStrength',
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

export const changeParameter = createAction('@@settings/CHANGE_PARAMETER', action => {
  return (mode: DefinitionType, key: CombatParameter, value: number) => action({ mode, key, value })
})

export const toggleSimpleMode = createAction('@@settings/TOGGLE_SIMPLE_MODE', action => {
  return () => action({})
})

export const toggleMode = createAction('@@settings/TOGGLE_MODE', action => {
  return () => action({})
})
