import { OrderedMap } from 'immutable'
import { CombatParameter } from './actions'
import { UnitCalc } from '../units'


export const getDefaultLandSettings = (): OrderedMap<CombatParameter, number> => {
  return OrderedMap<CombatParameter, number>()
  .set(CombatParameter.StrengthLostMultiplier, 0.2)
  .set(CombatParameter.MoraleLostMultiplier,  1.5)
  .set(CombatParameter.FlankCriteriaValue, 2)
}

export const getDefaultNavalSettings = (): OrderedMap<CombatParameter, number> => {
  return OrderedMap<CombatParameter, number>()
  .set(CombatParameter.StrengthLostMultiplier, 0.5)
  .set(CombatParameter.MoraleLostMultiplier,  2.0)
  .set(CombatParameter.FlankCriteriaValue, 100)
  .set(CombatParameter.FixFlank, 0)
}

export const getDefaultAnySettings = (): OrderedMap<CombatParameter, number> => {
  return OrderedMap<CombatParameter, number>()
  .set(CombatParameter.BaseDamage, 0.08)
  .set(CombatParameter.RollDamage, 0.02)
  .set(CombatParameter.DiceMinimum, 1)
  .set(CombatParameter.DiceMaximum, 6)
  .set(CombatParameter.RollFrequency, 5)
  .set(CombatParameter.CombatWidth, 30)
  .set(CombatParameter.ExperienceDamageReduction, 0.3)
  .set(CombatParameter.StrengthLostMultiplier, 0.2)
  .set(CombatParameter.MoraleLostMultiplier,  1.5)
  .set(CombatParameter.MoraleDamageBase, 2.0)
  .set(CombatParameter.MinimumMorale, 0.25)
  .set(CombatParameter.MinimumStrength, 0)
  .set(CombatParameter.FlankTargetsOwnEdge, 0)
  .set(CombatParameter.ReinforceFirst, 0)
  .set(CombatParameter.FixFlank, 1)
  .set(CombatParameter.FlankCriteriaAttribute, UnitCalc.Maneuver as unknown as number)
  .set(CombatParameter.FlankCriteriaSign, 1)
  .set(CombatParameter.FlankCriteriaValue, 2)
  .set(CombatParameter.ReinforceMainAttribute, UnitCalc.Cost as unknown as number)
  .set(CombatParameter.ReinforceMainSign, 0)
  .set(CombatParameter.ReinforceFlankAttribute, UnitCalc.Maneuver as unknown as number)
  .set(CombatParameter.ReinforceFlankSign, 0)
}
