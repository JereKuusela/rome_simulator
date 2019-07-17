import { createReducer } from 'typesafe-actions'
import { getDefaultTerrains } from './data'
import { setBaseValue, deleteTerrain, addTerrain, changeLocation, changeImage, changeType, changeMode } from './actions'
import { addValues, ValuesType } from '../../base_definition'

export const terrainState = getDefaultTerrains()

export const terrainsReducer = createReducer(terrainState)
  .handleAction(setBaseValue, (state, action: ReturnType<typeof setBaseValue>) => (
    state.update(action.payload.type, terrain => (
        addValues(terrain, ValuesType.Base, action.payload.key, [[action.payload.attribute, action.payload.value]])
      ))
  ))
  .handleAction(deleteTerrain, (state, action: ReturnType<typeof deleteTerrain>) => (
    state.delete(action.payload.type)
  ))
  .handleAction(addTerrain, (state, action: ReturnType<typeof addTerrain>) => (
    state.set(action.payload.type, { type: action.payload.type, mode: action.payload.mode, image: '' })
  ))
  .handleAction(changeLocation, (state, action: ReturnType<typeof changeLocation>) => (
    state.update(action.payload.type, terrain => ({ ...terrain, location: action.payload.location}))
  ))
  .handleAction(changeImage, (state, action: ReturnType<typeof changeImage>) => (
    state.update(action.payload.type, terrain => ({ ...terrain, image: action.payload.image}))
  ))
  .handleAction(changeMode, (state, action: ReturnType<typeof changeMode>) => (
    state.update(action.payload.type, terrain => ({ ...terrain, mode: action.payload.mode}))
  ))
  .handleAction(changeType, (state, action: ReturnType<typeof changeType>) => (
    state.set(action.payload.new_type, { ...state.get(action.payload.old_type)!, type: action.payload.new_type }).delete(action.payload.old_type)
  ))
