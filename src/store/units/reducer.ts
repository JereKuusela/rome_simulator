import { Map } from 'immutable'
import { createReducer } from 'typesafe-actions'
import { getDefaultDefinitions } from './data'
import { setBaseValue, setModifierValue } from './actions'
import { UnitType, UnitDefinition, ArmyType } from './types'

const initialState = {
  units: Map<ArmyType, Map<UnitType, UnitDefinition>>().set(ArmyType.Attacker, getDefaultDefinitions()).set(ArmyType.Defender, getDefaultDefinitions())
}

export const unitsReducer = createReducer(initialState)
  .handleAction(setBaseValue, (state, action: ReturnType<typeof setBaseValue>) => {
    const army = state.units.get(action.payload.army)!
    const unit = army.get(action.payload.type)!
    const new_unit = unit.add_base_value(action.payload.key, action.payload.value_type, action.payload.value)
    return { ...state, units: state.units.set(action.payload.army, army.set(action.payload.type, new_unit)) }
  })
  .handleAction(setModifierValue, (state, action: ReturnType<typeof setModifierValue>) => {
    const army = state.units.get(action.payload.army)!
    const unit = army.get(action.payload.type)!
    const new_unit = unit.add_modifier_value(action.payload.key, action.payload.value_type, action.payload.value)
    return { ...state, units: state.units.set(action.payload.army, army.set(action.payload.type, new_unit)) }
  })
