import { createAction } from 'typesafe-actions'
import { ValueType, TerrainType } from './data'

export const setBaseValue = createAction('@@terrain/SET_BASE_VALUE', action => {
  return (terrain: TerrainType, key: string, attribute: ValueType, value: number) => action({ terrain, key, attribute, value })
})
