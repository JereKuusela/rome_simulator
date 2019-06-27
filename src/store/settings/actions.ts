import { createAction } from 'typesafe-actions'
import { DefinitionType } from '../../base_definition'
import { CountryName } from '../countries'

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
  ReinforceFirst = 'ReinforceFirst',
  FixFlank = 'FixFlank',
  FlankCriteriaAttribute = 'FlankCriteriaAttribute',
  FlankCriteriaValue = 'FlankCriteriaValue',
  FlankCriteriaSign = 'FlankCriteriaSign',
  ReinforceMainAttribute = 'ReinforceMainAttribute',
  ReinforceMainSign = 'ReinforceMainSign',
  ReinforceFlankAttribute = 'ReinforceFlankAttribute',
  ReinforceFlankSign = 'ReinforceFlankSign'
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
    case CombatParameter.FixFlank:
      return 'Naval combat contains only flank.\nThis makes the preferred flanking unit deploy in the middle.\nThis is probably a bug in the game. Set 1 to fix this.'
    case CombatParameter.RollDamage:
      return 'Additional damage each unit deals per dice roll and other modifiers.'
    case CombatParameter.RollFrequency:
      return 'How many rounds dice rolls stay active.'
    case CombatParameter.FlankCriteriaAttribute:
      return 'Which attribute is used to determine whether an unit is a flanking unit.'
    case CombatParameter.FlankCriteriaValue:
      return 'Limit for the flanking unit check.'
    case CombatParameter.FlankCriteriaSign:
      return 'Sign for the flanking unit check. 1: Attribute must be higher than the value. 0: Attribute must be lower than the value.'
    case CombatParameter.ReinforceMainAttribute:
      return 'Which attribute is used to sort non-flanking units.'
    case CombatParameter.ReinforceMainSign:
      return 'Sign for the sort. 1: Units with a higher attribute have a priority. 0: Units with a lower priority have a priority.'
    case CombatParameter.ReinforceFlankAttribute:
      return 'Which attribute is used to sort flanking units.'
    case CombatParameter.ReinforceFlankSign:
      return 'Sign for the sort. 1: Units with a higher attribute have a priority. 0: Units with a lower priority have a priority.'
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

export const selectCountry = createAction('@@settings/SELECT_COUNTRY', action => {
  return (country: CountryName) => action({ country })
})
