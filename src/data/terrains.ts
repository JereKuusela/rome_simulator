import { ValuesType, Mode, TerrainType, LocationType, TerrainCalc, Terrain, TerrainValueType, Terrains } from 'types'
import { addValues } from 'definition_values'
import { toObj } from 'utils'

import * as ir_data from './json/ir/terrains.json'
import * as euiv_data from './json/euiv/terrains.json'
import IconTerrain from 'images/terrain.png'

const createTerrainFromJson = (data: TerrainData): Terrain => {
  let terrain: Terrain = { type: data.type as TerrainType, mode: data.mode as Mode, image: IconTerrain, location: data.location as LocationType }
  const base_values: [TerrainValueType, number][] = [
    [TerrainCalc.Roll, data.roll]
  ]
  return addValues(terrain, ValuesType.Base, terrain.type, base_values)
}

const initializeDefaultTerrains = (): Terrains => {
  if (process.env.REACT_APP_GAME === 'euiv')
    return toObj(euiv_data.terrain.map(createTerrainFromJson), terrain => terrain.type)
  else
    return toObj(ir_data.terrain.map(createTerrainFromJson), terrain => terrain.type)
}

const defaultTerrains = initializeDefaultTerrains()

export const getDefaultTerrains = () => defaultTerrains
export const getDefaultTerrain = (type: TerrainType): Terrain => defaultTerrains[type]

interface TerrainData {
  type: string
  mode: string
  location: string
  roll: number
}

export const getDefaultTerrainState = () => getDefaultTerrains()
