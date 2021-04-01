import { Data } from 'types'
import { DataValues, calculateValue } from 'data_values'

// Only listed what are required by code. There is actually a lot more terrains.
export enum TerrainType {
  Grasslands = 'Grasslands',
  Farmland = 'Farmland',
  Forest = 'Forest',
  CrossingShore = 'Crossing shore',
  None = 'None',
  Plains = 'Plains',
  River = 'River',
  Ocean = 'Open Sea',
  NoModifier = 'No modifier'
}

export enum LocationType {
  Border = 'Border',
  Tile = 'Tile',
  Modifier = 'Modifier'
}

export enum TerrainCalc {
  Roll = 'Roll',
  CombatWidth = 'CombatWidth'
}

export type TerrainsData = Record<TerrainType, TerrainData>

export type TerrainValueType = TerrainCalc

export interface TerrainData extends Data<TerrainType>, DataValues<TerrainValueType> {
  location: LocationType
}

export const terrainValueToString = (data: TerrainData, type: TerrainValueType): string => {
  const value = calculateValue(data, type)
  return String(value)
}
