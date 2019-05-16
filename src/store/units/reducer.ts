import { Map } from 'immutable'
import { createReducer } from 'typesafe-actions'
import { getDefaultDefinitions } from './data'
import { setBaseValue, setModifierValue } from './actions'
import { UnitType, UnitDefinition, ArmyType } from './types'

const initialState = {
  units: Map<ArmyType, Map<UnitType, UnitDefinition>>().set(ArmyType.Attacker, getDefaultDefinitions()).set(ArmyType.Defender, getDefaultDefinitions())
}

export const unitsReducer = createReducer(initialState)
  .handleAction(setBaseValue, (state, action: ReturnType<typeof setBaseValue>) => (
    { ...state, units: state.units.updateIn([action.payload.army, action.payload.type], (unit: UnitDefinition) => (
      unit.add_base_value(action.payload.key, action.payload.value_type, action.payload.value)
    ))}
  ))
  .handleAction(setModifierValue, (state, action: ReturnType<typeof setModifierValue>) => (
    { ...state, units: state.units.updateIn([action.payload.army, action.payload.type], (unit: UnitDefinition) => (
      unit.add_modifier_value(action.payload.key, action.payload.value_type, action.payload.value)
    ))}
  ))
