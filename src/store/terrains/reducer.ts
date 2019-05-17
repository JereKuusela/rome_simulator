import { createReducer } from 'typesafe-actions'
import { Map } from 'immutable'
import { getDefaultDefinitions, LocationType, TerrainType, TerrainDefinition } from './data'
import { setBaseValue } from './actions'

const initialState = {
  terrains: Map<LocationType, Map<TerrainType, TerrainDefinition>>().set(LocationType.Border, getDefaultDefinitions(LocationType.Border)).set(LocationType.Tile, getDefaultDefinitions(LocationType.Tile))
}

export const terrainsReducer = createReducer(initialState)
  .handleAction(setBaseValue, (state, action: ReturnType<typeof setBaseValue>) => (
    { ...state, terrains: state.terrains.updateIn([action.payload.location, action.payload.terrain], (terrain: TerrainDefinition) => (
      terrain.add_base_value(action.payload.key, action.payload.attribute, action.payload.value)
    ))}
  ))
