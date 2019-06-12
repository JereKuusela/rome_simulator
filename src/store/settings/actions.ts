import { createAction } from 'typesafe-actions'

export enum CombatParameter {
  ManpowerLostMultiplier = 'Multiplier for manpower lost',
  MoraleLostMultiplier = 'Multiplier for morale lost',
  MoraleDamageBase = 'Base value for morale damage',
  ExperienceDamageReduction = 'Damage reduction given by 100% experience',
  DiceMinimum = 'Minimum roll for the dice',
  DiceMaximum = 'Maximum roll for the dice',
  BaseDamage = 'Base damage value',
  RollDamage = 'Extra damage per roll',
  MinimumMorale = 'Minimum morale required for combat',
  MinimumManpower = 'Minimum manpower required for combat',
  RollFrequency = 'How often the dice is rolled',
  CombatWidth = 'Width of the battlefield'

}

export const changeParamater = createAction('@@settings/CHANGE_PARAMETER', action => {
  return (key: CombatParameter, value: number) => action({ key, value })
})

