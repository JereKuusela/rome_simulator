import { calculateValue, BaseValuesDefinition } from '../../base_definition'

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
  readonly location: LocationType
}

export const valueToString = (definition: TerrainDefinition, type: ValueType): string => {
  const value = calculateValue(definition, type)
  return String(value)
}
