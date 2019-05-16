import { createReducer } from 'typesafe-actions'
import { setBaseValue as setUnitBaseValue, setModifierValue, setLossValue, UnitDefinition, ArmyType, setGlobalBaseValue, setGlobalLossValue, setGlobalModifierValue } from '../units'
import { setUnitModal, setTacticModal, setTerrainModal } from './actions'
import { TacticDefinition, setBaseValue as setTacticBaseValue } from '../tactics'
import { TerrainDefinition, setBaseValue as setTerrainBaseValue, LocationType } from '../terrains'

export const initialState = {
  unit_modal: null as (UnitDefinition | null),
  army: null as (ArmyType | null),
  tactic_modal: null as (TacticDefinition | null),
  location: null as (LocationType | null),
  terrain_modal: null as (TerrainDefinition | null)
}

export const layoutReducer = createReducer(initialState)
  .handleAction(setUnitModal, (state, action: ReturnType<typeof setUnitModal>) => ({ ...state, unit_modal: action.payload.unit, army: action.payload.army }))
  .handleAction(setTacticModal, (state, action: ReturnType<typeof setTacticModal>) => ({ ...state, tactic_modal: action.payload.tactic }))
  .handleAction(setTerrainModal, (state, action: ReturnType<typeof setTerrainModal>) => ({ ...state, location: action.payload.location, terrain_modal: action.payload.terrain }))
  .handleAction(setUnitBaseValue, (state, action: ReturnType<typeof setUnitBaseValue>) => {
    if (state.unit_modal)
      return { ...state, unit_modal: state.unit_modal.add_base_value(action.payload.key, action.payload.value_type, action.payload.value) }
    return state
  })
  .handleAction(setGlobalBaseValue, (state, action: ReturnType<typeof setGlobalBaseValue>) => {
    if (state.unit_modal)
      return { ...state, unit_modal: state.unit_modal.add_base_value(action.payload.key, action.payload.value_type, action.payload.value) }
    return state
  })
  .handleAction(setGlobalLossValue, (state, action: ReturnType<typeof setGlobalLossValue>) => {
    if (state.unit_modal)
      return { ...state, unit_modal: state.unit_modal.add_modifier_value(action.payload.key, action.payload.value_type, action.payload.value) }
    return state
  })
  .handleAction(setGlobalModifierValue, (state, action: ReturnType<typeof setGlobalModifierValue>) => {
    if (state.unit_modal)
      return { ...state, unit_modal: state.unit_modal.add_loss_value(action.payload.key, action.payload.value_type, action.payload.value) }
    return state
  })
  .handleAction(setModifierValue, (state, action: ReturnType<typeof setModifierValue>) => {
    if (state.unit_modal)
      return { ...state, unit_modal: state.unit_modal.add_modifier_value(action.payload.key, action.payload.value_type, action.payload.value) }
    return state
  })
  .handleAction(setLossValue, (state, action: ReturnType<typeof setLossValue>) => {
    if (state.unit_modal)
      return { ...state, unit_modal: state.unit_modal.add_loss_value(action.payload.key, action.payload.value_type, action.payload.value) }
    return state
  })
  .handleAction(setTacticBaseValue, (state, action: ReturnType<typeof setTacticBaseValue>) => {
    if (state.tactic_modal)
      return { ...state, tactic_modal: state.tactic_modal.add_base_value(action.payload.key, action.payload.value_type, action.payload.value) }
    return state
  })
  .handleAction(setTerrainBaseValue, (state, action: ReturnType<typeof setTerrainBaseValue>) => {
    if (state.terrain_modal)
      return { ...state, terrain_modal: state.terrain_modal.add_base_value(action.payload.key, action.payload.value_type, action.payload.value) }
    return state
  })
