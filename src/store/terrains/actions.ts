import { createAction } from 'typesafe-actions'
import { ValueType, TerrainType, LocationType } from './data'

export const setBaseValue = createAction('@@terrain/SET_BASE_VALUE', action => {
  return (type: TerrainType, key: string, attribute: ValueType, value: number) => action({ type, key, attribute, value })
})

export const deleteTerrain = createAction('@@terrain/DELETE_TERRAIN', action => {
  return (type: TerrainType) => action({ type })
})

export const addTerrain = createAction('@@terrain/ADD_TERRAIN', action => {
  return (type: TerrainType) => action({ type })
})

export const changeType = createAction('@@terrain/CHANGE_TYPE', action => {
  return (old_type: TerrainType, new_type: TerrainType) => action({ old_type, new_type })
})

export const changeLocation = createAction('@@terrain/CHANGE_LOCATION', action => {
  return (type: TerrainType, location: LocationType) => action({ type, location })
})
