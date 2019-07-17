import { Map, OrderedMap, fromJS } from 'immutable'
import { TerrainType, LocationType, TerrainCalc, TerrainDefinition, ValueType } from './actions'
import { addValues, ValuesType, DefinitionType } from '../../base_definition'
import * as data from './terrains.json'
import IconTerrain from '../../images/terrain.png'

const createTerrainFromJson = (data: TerrainData): TerrainDefinition => {
  let terrain: TerrainDefinition = {type: data.type as TerrainType, mode: data.mode as DefinitionType, image: IconTerrain, location: data.location as LocationType}
  const base_values: [ValueType, number][] = [
    [TerrainCalc.Roll, data.roll]
  ]
  return addValues(terrain, ValuesType.Base, terrain.type, base_values)
}

const initializeDefaultTerrains = (): OrderedMap<TerrainType, TerrainDefinition> => {
  let map = OrderedMap<TerrainType, TerrainDefinition>()
  for (const value of data.terrain) {
    const terrain = createTerrainFromJson(value)
    map = map.set(terrain.type, terrain)
  }
  return map
}

const defaultTerrains = initializeDefaultTerrains()

export const getDefaultTerrains = () => defaultTerrains

export const terrainFromJS = (object: Map<string, any>): TerrainDefinition | undefined => {
  if (!object)
    return undefined
  const image = object.get('image') || IconTerrain
  const mode = object.get('mode') as DefinitionType || DefinitionType.Global
  let base_values = object.has('base_values') ? fromJS(object.get('base_values')!.map((value: OrderedMap<string, number>) => fromJS(value))) : undefined
  return { type: object.get('type') as TerrainType, mode, image, location: object.get('location') as LocationType, base_values }
}

interface TerrainData {
  type: string
  mode: string
  location: string
  roll: number
}
