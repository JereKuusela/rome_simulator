import { createReducer } from 'typesafe-actions'
import { getDefaultDefinitions, getDefaultTypes } from './data'
import { setBaseValue, deleteTerrain, addTerrain, changeLocation, changeImage, changeType } from './actions'
import { addBaseValue } from '../../base_definition'

export const terrainState = {
  types: getDefaultTypes(),
  definitions: getDefaultDefinitions()
}

export const terrainsReducer = createReducer(terrainState)
  .handleAction(setBaseValue, (state, action: ReturnType<typeof setBaseValue>) => (
    {
      ...state,
      definitions: state.definitions.update(action.payload.type, terrain => (
        addBaseValue(terrain, action.payload.key, action.payload.attribute, action.payload.value)
      ))
    }
  ))
  .handleAction(deleteTerrain, (state, action: ReturnType<typeof deleteTerrain>) => (
    {
      ...state,
      definitions: state.definitions.delete(action.payload.type),
      types: state.types.delete(action.payload.type)
    }
  ))
  .handleAction(addTerrain, (state, action: ReturnType<typeof addTerrain>) => (
    {
      ...state,
      definitions: state.definitions.set(action.payload.type, { type: action.payload.type, image: '' }),
      types: state.types.add(action.payload.type)
    }
  ))
  .handleAction(changeLocation, (state, action: ReturnType<typeof changeLocation>) => (
    {
      ...state,
      definitions: state.definitions.update(action.payload.type, terrain => ({ ...terrain, location: action.payload.location}))
    }
  ))
  .handleAction(changeImage, (state, action: ReturnType<typeof changeImage>) => (
    {
      ...state,
      definitions: state.definitions.update(action.payload.type, terrain => ({ ...terrain, image: action.payload.image}))
    }
  ))
  .handleAction(changeType, (state, action: ReturnType<typeof changeType>) => (
    {
      ...state,
      types: state.types.map(value => value === action.payload.old_type ? action.payload.new_type : value),
      definitions: state.definitions.set(action.payload.new_type, { ...state.definitions.get(action.payload.old_type)!, type: action.payload.new_type }).delete(action.payload.old_type)
    }
  ))
