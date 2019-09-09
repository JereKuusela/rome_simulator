import { TerrainType, LocationType, TerrainCalc, TerrainDefinition, ValueType } from './actions'
import { addValues, ValuesType, DefinitionType } from '../../base_definition'
import { toObj } from '../../utils'

import * as data from './terrains.json'
import IconTerrain from '../../images/terrain.png'

const createTerrainFromJson = (data: TerrainData): TerrainDefinition => {
  let terrain: TerrainDefinition = {type: data.type as TerrainType, mode: data.mode as DefinitionType, image: IconTerrain, location: data.location as LocationType}
  const base_values: [ValueType, number][] = [
    [TerrainCalc.Roll, data.roll]
  ]
  return addValues(terrain, ValuesType.Base, terrain.type, base_values)
}

export type TerrainDefinitions = { [key in TerrainType]: TerrainDefinition }

const initializeDefaultTerrains = (): TerrainDefinitions => toObj(data.terrain.map(createTerrainFromJson), unit => unit.type)

const defaultTerrains = initializeDefaultTerrains()

export const getDefaultTerrains = () => defaultTerrains

interface TerrainData {
  type: string
  mode: string
  location: string
  roll: number
}
