import { createAction } from 'typesafe-actions'
import { calculateValue, BaseValuesDefinition, DefinitionType } from '../../base_definition'

export enum TerrainType {
  Desert = 'Desert',
  Farmland = 'Farmland',
  Forest = 'Forest',
  Hills = 'Hills',
  Jungle = 'Jungle',
  Marsh = 'Marsh',
  Mountain = 'Mountain',
  Naval = 'Naval',
  None = 'None',
  Plains = 'Plains',
  River = 'River',
  Strait = 'Strait',
  Riverine = 'Riverine',
  Coastal = 'Coastal',
  Ocean = 'Ocean'
}

export enum LocationType {
  Border = 'Border',
  Tile = 'Tile'
}

export enum TerrainCalc {
  Roll = 'Roll'
}

export type ValueType = TerrainCalc

export interface TerrainDefinition extends BaseValuesDefinition<TerrainType, ValueType> {
  readonly location?: LocationType
}

export const valueToString = (definition: TerrainDefinition, type: ValueType): string => {
  const value = calculateValue(definition, type)
  return String(value)
}

export const setBaseValue = createAction('@@terrains/SET_BASE_VALUE', action => {
  return (type: TerrainType, key: string, attribute: ValueType, value: number) => action({ type, key, attribute, value })
})

export const deleteTerrain = createAction('@@terrains/DELETE_TERRAIN', action => {
  return (type: TerrainType) => action({ type })
})

export const addTerrain = createAction('@@terrains/ADD_TERRAIN', action => {
  return (type: TerrainType, mode: DefinitionType) => action({ type, mode })
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

export const changeMode = createAction('@@terrains/CHANGE_MODE', action => {
  return (type: TerrainType, mode: DefinitionType) => action({ type, mode })
})
