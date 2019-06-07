import { createAction } from 'typesafe-actions'
import { ValueType, TerrainType, TerrainDefinition } from './data'

export const setBaseValue = createAction('@@terrain/SET_BASE_VALUE', action => {
  return (type: TerrainType, key: string, attribute: ValueType, value: number) => action({ type, key, attribute, value })
})

export const deleteTerrain = createAction('@@terrain/DELETE_TERRAIN', action => {
  return (type: TerrainType) => action({ type })
})

export const addTerrain = createAction('@@terrain/ADD_TERRAIN', action => {
  return (type: TerrainType, terrain: TerrainDefinition) => action({ type, terrain })
})
