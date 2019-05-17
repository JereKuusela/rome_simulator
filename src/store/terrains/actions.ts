import { createAction } from 'typesafe-actions'
import { ValueType, TerrainType, LocationType } from './data'

export const setBaseValue = createAction('@@terrain/SET_BASE_VALUE', action => {
  return (location: LocationType, terrain: TerrainType, key: string, attribute: ValueType, value: number) => action({ location, terrain, key, attribute, value })
})
