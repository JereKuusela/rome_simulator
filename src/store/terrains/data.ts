import { Map, OrderedMap } from 'immutable'
import { BaseDefinition } from '../../utils'
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

export type ValueType = TerrainCalc
type MapValues = Map<ValueType, OrderedMap<string, number>>

export class TerrainDefinition extends BaseDefinition<TerrainType, ValueType> {

  constructor(type: TerrainType, public readonly location: LocationType, base_values: MapValues = Map()) {
    super(type, null, base_values)
  }

  valueToString = (type: ValueType): string => {
    const value = this.calculateValue(type)
    return String(value)
  }

  add_base_values = (key: string, values: [ValueType, number][]): TerrainDefinition => {
    const new_values = this.add_values(this.base_values, key, values)
    return new TerrainDefinition(this.type, this.location, new_values)
  }

  add_base_value = (key: string, type: ValueType, value: number): TerrainDefinition => {
    const new_values = this.add_values(this.base_values, key, [[type, value]])
    return new TerrainDefinition(this.type, this.location, new_values)
  }
}

const createTerrainFromJson = (data: TerrainData): TerrainDefinition => {
  let terrain = new TerrainDefinition(data.type as TerrainType, data.location as LocationType)
  const base_values: [ValueType, number][] = [
    [TerrainCalc.Roll, data.roll]
  ]
  return terrain.add_base_values(terrain.type, base_values)
}

interface TerrainData {
  type: string
  location: string
  roll: number
}
