import { createAction } from 'typesafe-actions'
import { ValueType, TerrainType, LocationType } from './data'

export const setBaseValue = createAction('@@terrains/SET_BASE_VALUE', action => {
  return (type: TerrainType, key: string, attribute: ValueType, value: number) => action({ type, key, attribute, value })
})

export const deleteTerrain = createAction('@@terrains/DELETE_TERRAIN', action => {
  return (type: TerrainType) => action({ type })
})

export const addTerrain = createAction('@@terrains/ADD_TERRAIN', action => {
  return (type: TerrainType) => action({ type })
})

export const changeType = createAction('@@terrains/CHANGE_TYPE', action => {
  return (old_type: TerrainType, new_type: TerrainType) => action({ old_type, new_type })
})

export const changeLocation = createAction('@@terrains/CHANGE_LOCATION', action => {
  return (type: TerrainType, location: LocationType) => action({ type, location })
})

export const changeImage = createAction('@@terrains/CHANGE_IMAGE', action => {
  return (type: TerrainType, image: string) => action({ type, image })
})