import { createReducer } from 'typesafe-actions'
import { Map } from 'immutable'
import { CombatParameter, changeParamater } from './actions'

export const settingsState = {
  combat: Map<CombatParameter, number>()
    .set(CombatParameter.BaseDamage, 0.08)
    .set(CombatParameter.DiceMaximum, 6)
    .set(CombatParameter.DiceMinimum, 1)
    .set(CombatParameter.ExperienceDamageReduction, 0.3)
    .set(CombatParameter.ManpowerLostMultiplier, 0.2)
    .set(CombatParameter.MoraleDamageBase, 2.0)
    .set(CombatParameter.MoraleLostMultiplier,  1.5)
    .set(CombatParameter.RollDamage, 0.02)
    .set(CombatParameter.MinimumMorale, 0.25)
    .set(CombatParameter.MinimumManpower, 0)
    .set(CombatParameter.RollFrequency, 5)
}


export const settingsReducer = createReducer(settingsState)
  .handleAction(changeParamater, (state, action: ReturnType<typeof changeParamater>) => (
    { ...state, combat: state.combat.set(action.payload.key, action.payload.value) }
  ))
