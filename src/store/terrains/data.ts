import { Map, List, OrderedMap, fromJS } from 'immutable'
import { calculateValue, BaseValuesDefinition, add_base_values } from '../../base_definition'
import * as data from './terrains.json'

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
  River = 'River'
}

export enum LocationType {
  Border = 'Border',
  Tile = 'Tile'
}

export enum TerrainCalc {
  Roll = 'Roll'
}

export const getDefaultDefinitions = (): Map<TerrainType, TerrainDefinition> => {
  let map = OrderedMap<TerrainType, TerrainDefinition>()
  for (const value of data.terrain) {
    const terrain = createTerrainFromJson(value)
    map = map.set(terrain.type, terrain)
  }
  return map
}

export const getDefaultTypes = (): List<TerrainType> => {
  const terrains = Object.keys(TerrainType).map(k => TerrainType[k as any]) as TerrainType[]
  return List<TerrainType>(terrains)
}

export const terrainFromJS = (object: Map<string, any>): TerrainDefinition | undefined => {
  if (!object)
    return undefined
  let base_values = object.has('base_values') ? fromJS(object.get('base_values')!.map((value: OrderedMap<string, number>) => fromJS(value))) : undefined
  return { type: object.get('type') as TerrainType, location: object.get('location') as LocationType, base_values }
}


export type ValueType = TerrainCalc

export interface TerrainDefinition extends BaseValuesDefinition<TerrainType, ValueType> {
  readonly location?: LocationType
}

export const valueToString = (definition: TerrainDefinition, type: ValueType): string => {
  const value = calculateValue(definition, type)
  return String(value)
}

const createTerrainFromJson = (data: TerrainData): TerrainDefinition => {
  let terrain: TerrainDefinition = {type: data.type as TerrainType, location: data.location as LocationType}
  const base_values: [ValueType, number][] = [
    [TerrainCalc.Roll, data.roll]
  ]
  return add_base_values(terrain, terrain.type, base_values)
}

interface TerrainData {
  type: string
  location: string
  roll: number
}
