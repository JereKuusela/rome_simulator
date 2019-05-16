import { createAction } from 'typesafe-actions'
import { ValueType, TerrainType, LocationType } from './data'

export const setBaseValue = createAction('@@terrain/SET_BASE_VALUE', action => {
  return (location: LocationType, terrain: TerrainType, value_type: ValueType, key: string, value: number) => action({ location, terrain, value_type, key, value })
})