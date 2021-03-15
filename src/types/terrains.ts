import { Definition } from 'types'
import { DefinitionValues, calculateValue } from 'definition_values'

// Only listed what are required by code. There is actually a lot more terrains.
export enum TerrainType {
  Grasslands = 'Grasslands',
  Forest = 'Forest',
  Naval = 'Naval',
  None = 'None',
  Plains = 'Plains',
  River = 'River',
  Ocean = 'Open Sea'
}

export enum LocationType {
  Border = 'Border',
  Tile = 'Tile'
}

export enum TerrainCalc {
  Roll = 'Roll',
  CombatWidth = 'CombatWidth'
}

export type TerrainDefinitions = Record<TerrainType, Terrain>

export type TerrainValueType = TerrainCalc

export interface Terrain extends Definition<TerrainType>, DefinitionValues<TerrainValueType> {
  location: LocationType
}

export const terrainValueToString = (definition: Terrain, type: TerrainValueType): string => {
  const value = calculateValue(definition, type)
  return String(value)
}
