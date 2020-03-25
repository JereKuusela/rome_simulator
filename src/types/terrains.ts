import { Definition } from 'types'
import { DefinitionValues, calculateValue } from 'definition_values'
import { Mode } from './definition'

// Only listed what are required by code. There is actually a lot more terrains.
export enum TerrainType {
  Grasslands = 'Grasslands',
  None = 'None',
  Plains = 'Plains',
  Riverine = 'Riverine',
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
  mode: Mode
}

export const terrainValueToString = (definition: Terrain, type: TerrainValueType): string => {
  const value = calculateValue(definition, type)
  return String(value)
}
