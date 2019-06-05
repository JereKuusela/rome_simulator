import { createReducer } from 'typesafe-actions'
import { getDefaultDefinitions } from './data'
import { setBaseValue } from './actions'
import { add_base_value } from '../../base_definition'

export const terrainState = getDefaultDefinitions()

export const terrainsReducer = createReducer(terrainState)
  .handleAction(setBaseValue, (state, action: ReturnType<typeof setBaseValue>) => (
    state.update(action.payload.terrain, terrain => (
      add_base_value(terrain, action.payload.key, action.payload.attribute, action.payload.value)
    ))
  ))
