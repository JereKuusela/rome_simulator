import { createReducer } from 'typesafe-actions'
import { setBaseValue, setModifierValue, UnitDefinition, ArmyType } from '../units'
import { setUnitModal } from './actions'

export const initialState = {
  unit_modal: null as (UnitDefinition | null),
  army: null as (ArmyType | null)
}

export const layoutReducer = createReducer(initialState)
  .handleAction(setUnitModal, (state, action: ReturnType<typeof setUnitModal>) => ({ ...state, unit_modal: action.payload.unit, army: action.payload.army }))
  .handleAction(setBaseValue, (state, action: ReturnType<typeof setBaseValue>) => {
    if (state.unit_modal)
      return { ...state, unit_modal: state.unit_modal.add_base_value(action.payload.key, action.payload.value_type, action.payload.value) }
    return state
  })
  .handleAction(setModifierValue, (state, action: ReturnType<typeof setModifierValue>) => {
    if (state.unit_modal)
      return { ...state, unit_modal: state.unit_modal.add_modifier_value(action.payload.key, action.payload.value_type, action.payload.value) }
    return state
  })
