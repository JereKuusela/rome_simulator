import { createReducer } from 'typesafe-actions'
import { getDefaultDefinitions, getDefaultTypes } from './data'
import { setBaseValue, deleteTerrain, addTerrain } from './actions'
import { add_base_value } from '../../base_definition'

export const terrainState = {
  types: getDefaultTypes(),
  definitions: getDefaultDefinitions()
}

export const terrainsReducer = createReducer(terrainState)
  .handleAction(setBaseValue, (state, action: ReturnType<typeof setBaseValue>) => (
    {
      ...state,
      definitions: state.definitions.update(action.payload.type, terrain => (
        add_base_value(terrain, action.payload.key, action.payload.attribute, action.payload.value)
      ))
    }
  ))
  .handleAction(deleteTerrain, (state, action: ReturnType<typeof deleteTerrain>) => (
    {
      ...state,
      definitions: state.definitions.delete(action.payload.type),
      types: state.types.delete(state.types.findIndex(value => value === action.payload.type))
    }
  ))
  .handleAction(addTerrain, (state, action: ReturnType<typeof addTerrain>) => (
    {
      ...state,
      definitions: state.definitions.set(action.payload.type, action.payload.terrain),
      types: state.types.push(action.payload.type)
    }
  ))
