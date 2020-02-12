import { Definition } from 'types'
import { DefinitionValues, calculateValue } from 'definition_values'
import { DefinitionType } from './definition'

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

export type Terrains = { [key in TerrainType]: Terrain }

export type TerrainValueType = TerrainCalc

export interface Terrain extends Definition<TerrainType>, DefinitionValues<TerrainValueType> {
  location: LocationType
  mode: DefinitionType
}

export const terrainValueToString = (definition: Terrain, type: TerrainValueType): string => {
  const value = calculateValue(definition, type)
  return String(value)
}
