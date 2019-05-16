import { Map } from 'immutable'
import { createReducer } from 'typesafe-actions'
import { getDefaultDefinitions, getDefaultGlobalDefinition } from './data'
import { setBaseValue, setModifierValue, setLossValue, setGlobalBaseValue, setGlobalModifierValue, setGlobalLossValue } from './actions'
import { UnitType, UnitDefinition, ArmyType } from './types'

const initialState = {
  units: Map<ArmyType, Map<UnitType, UnitDefinition>>().set(ArmyType.Attacker, getDefaultDefinitions()).set(ArmyType.Defender, getDefaultDefinitions()),
  global_stats: Map<ArmyType, UnitDefinition>().set(ArmyType.Attacker, getDefaultGlobalDefinition()).set(ArmyType.Defender, getDefaultGlobalDefinition())
}

export const unitsReducer = createReducer(initialState)
  .handleAction(setBaseValue, (state, action: ReturnType<typeof setBaseValue>) => (
    {
      ...state, units: state.units.updateIn([action.payload.army, action.payload.type], (unit: UnitDefinition) => (
        unit.add_base_value(action.payload.key, action.payload.value_type, action.payload.value)
      ))
    }
  ))
  .handleAction(setModifierValue, (state, action: ReturnType<typeof setModifierValue>) => (
    {
      ...state, units: state.units.updateIn([action.payload.army, action.payload.type], (unit: UnitDefinition) => (
        unit.add_modifier_value(action.payload.key, action.payload.value_type, action.payload.value)
      ))
    }
  ))
  .handleAction(setLossValue, (state, action: ReturnType<typeof setLossValue>) => ({
    ...state,
    units: state.units.updateIn([action.payload.army, action.payload.type], (unit: UnitDefinition) => (
      unit.add_loss_value(action.payload.key, action.payload.value_type, action.payload.value)
    ))
  }
  ))
  .handleAction(setGlobalBaseValue, (state, action: ReturnType<typeof setGlobalBaseValue>) => (
    {
      ...state,
      global_stats: state.global_stats.update(action.payload.army, unit => unit.add_base_value(action.payload.key, action.payload.value_type, action.payload.value)),
      units: state.units.update(action.payload.army, units => units.withMutations(units =>
        units.map(unit => unit.add_base_value(action.payload.key, action.payload.value_type, action.payload.value))
      ))
    }
  ))
  .handleAction(setGlobalModifierValue, (state, action: ReturnType<typeof setGlobalModifierValue>) => (
    {
      ...state,
      global_stats: state.global_stats.update(action.payload.army, unit => unit.add_modifier_value(action.payload.key, action.payload.value_type, action.payload.value)),
      units: state.units.update(action.payload.army, units => units.withMutations(units =>
        units.map(unit => unit.add_modifier_value(action.payload.key, action.payload.value_type, action.payload.value))
      ))
    }
  ))
  .handleAction(setGlobalLossValue, (state, action: ReturnType<typeof setGlobalLossValue>) => (
    {
      ...state,
      global_stats: state.global_stats.update(action.payload.army, unit => unit.add_loss_value(action.payload.key, action.payload.value_type, action.payload.value)),
      units: state.units.update(action.payload.army, units => units.withMutations(units =>
        units.map(unit => unit.add_loss_value(action.payload.key, action.payload.value_type, action.payload.value))
      ))
    }
  ))
