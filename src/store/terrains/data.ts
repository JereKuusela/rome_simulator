import { Map, OrderedSet, OrderedMap, fromJS } from 'immutable'
import { calculateValue, BaseValuesDefinition, addValues, ValuesType } from '../../base_definition'
import * as data from './terrains.json'
import IconTerrain from '../../images/terrain.png'

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
  Strait = 'Strait'
}

export enum LocationType {
  Border = 'Border',
  Tile = 'Tile'
}

export enum TerrainCalc {
  Roll = 'Roll'
}

export const getDefaultDefinitions = (): OrderedMap<TerrainType, TerrainDefinition> => {
  let map = OrderedMap<TerrainType, TerrainDefinition>()
  for (const value of data.terrain) {
    const terrain = createTerrainFromJson(value)
    map = map.set(terrain.type, terrain)
  }
  return map
}

export const getDefaultTypes = (): OrderedSet<TerrainType> => {
  const terrains = Object.keys(TerrainType).map(k => TerrainType[k as any]) as TerrainType[]
  return OrderedSet<TerrainType>(terrains)
}

export const terrainFromJS = (object: Map<string, any>): TerrainDefinition | undefined => {
  if (!object)
    return undefined
  const image = object.has('image') ? object.get('image') : IconTerrain
  let base_values = object.has('base_values') ? fromJS(object.get('base_values')!.map((value: OrderedMap<string, number>) => fromJS(value))) : undefined
  return { type: object.get('type') as TerrainType, image, location: object.get('location') as LocationType, base_values }
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
  let terrain: TerrainDefinition = {type: data.type as TerrainType, image: IconTerrain, location: data.location as LocationType}
  const base_values: [ValueType, number][] = [
    [TerrainCalc.Roll, data.roll]
  ]
  return addValues(terrain, ValuesType.Base, terrain.type, base_values)
}

interface TerrainData {
  type: string
  location: string
  roll: number
}
