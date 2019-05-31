import { Map } from 'immutable'
import { createReducer } from 'typesafe-actions'
import { getDefaultDefinitions, getDefaultGlobalDefinition } from './data'
import { setValue, setGlobalValue } from './actions'
import { UnitType, UnitDefinition, ArmyName } from './types'

export const initialState = {
  units: Map<ArmyName, Map<UnitType, UnitDefinition>>().set(ArmyName.Attacker, getDefaultDefinitions()).set(ArmyName.Defender, getDefaultDefinitions()),
  global_stats: Map<ArmyName, UnitDefinition>().set(ArmyName.Attacker, getDefaultGlobalDefinition()).set(ArmyName.Defender, getDefaultGlobalDefinition())
}

export const unitsReducer = createReducer(initialState)
  .handleAction(setValue, (state, action: ReturnType<typeof setValue>) => (
    {
      ...state, units: state.units.updateIn([action.payload.army, action.payload.unit], (unit: UnitDefinition) => (
        unit.add_value(action.payload.type, action.payload.key, action.payload.attribute, action.payload.value)
      ))
    }
  ))
  .handleAction(setGlobalValue, (state, action: ReturnType<typeof setGlobalValue>) => (
    {
      ...state,
      global_stats: state.global_stats.update(action.payload.army, unit => unit.add_value(action.payload.type, action.payload.key, action.payload.attribute, action.payload.value)),
      units: state.units.update(action.payload.army, units => units.withMutations(units =>
        units.map(unit => unit.add_value(action.payload.type, action.payload.key, action.payload.attribute, action.payload.value))
      ))
    }
  ))
