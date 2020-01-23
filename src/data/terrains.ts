import { ValuesType, DefinitionType, TerrainType, LocationType, TerrainCalc, TerrainDefinition, TerrainValueType, TerrainDefinitions } from 'types'
import { addValues } from 'definition_values'
import { toObj } from 'utils'

import * as data from './json/terrains.json'
import IconTerrain from 'images/terrain.png'

const createTerrainFromJson = (data: TerrainData): TerrainDefinition => {
  let terrain: TerrainDefinition = {type: data.type as TerrainType, mode: data.mode as DefinitionType, image: IconTerrain, location: data.location as LocationType}
  const base_values: [TerrainValueType, number][] = [
    [TerrainCalc.Roll, data.roll]
  ]
  return addValues(terrain, ValuesType.Base, terrain.type, base_values)
}

const initializeDefaultTerrains = (): TerrainDefinitions => toObj(data.terrain.map(createTerrainFromJson), unit => unit.type)

const defaultTerrains = initializeDefaultTerrains()

export const getDefaultTerrains = () => defaultTerrains
export const getDefaultTerrain = (type: TerrainType): TerrainDefinition => defaultTerrains[type]

interface TerrainData {
  type: string
  mode: string
  location: string
  roll: number
}

export const getDefaultTerrainDefinitions = () => getDefaultTerrains()
