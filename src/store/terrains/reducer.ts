import { createReducer } from 'typesafe-actions'
import { List } from 'immutable'
import { getDefaultDefinitions, TerrainType } from './data'
import { setBaseValue } from './actions'
import { add_base_value } from '../../base_definition'

export const terrainState = {
  types: List<TerrainType>(),
  definitions: getDefaultDefinitions()
}

export const terrainsReducer = createReducer(terrainState)
  .handleAction(setBaseValue, (state, action: ReturnType<typeof setBaseValue>) => (
    {
      ...state,
      definitions: state.definitions.update(action.payload.terrain, terrain => (
        add_base_value(terrain, action.payload.key, action.payload.attribute, action.payload.value)
      ))
    }
  ))
