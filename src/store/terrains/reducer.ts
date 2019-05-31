import { createReducer } from 'typesafe-actions'
import { getDefaultDefinitions } from './data'
import { setBaseValue } from './actions'
import { add_base_value } from '../../base_definition'

export const initialState = {
  terrains: getDefaultDefinitions()
}

export const terrainsReducer = createReducer(initialState)
  .handleAction(setBaseValue, (state, action: ReturnType<typeof setBaseValue>) => (
    { ...state, terrains: state.terrains.update(action.payload.terrain, terrain => (
      add_base_value(terrain, action.payload.key, action.payload.attribute, action.payload.value)
    ))}
  ))
