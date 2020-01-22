import { Definition } from 'base_definition'
import { BaseDefinitionValues, calculateValue } from 'definition_values'

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

export type TerrainValueType = TerrainCalc

export interface TerrainDefinition extends Definition<TerrainType>, BaseDefinitionValues<TerrainValueType> {
  location: LocationType
}

export const terrainValueToString = (definition: TerrainDefinition, type: TerrainValueType): string => {
  const value = calculateValue(definition, type)
  return String(value)
}
