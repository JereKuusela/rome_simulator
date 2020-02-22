import { ValuesType, Mode, TerrainType, LocationType, TerrainCalc, Terrain, TerrainValueType, Terrains } from 'types'
import { addValues } from 'definition_values'
import { toObj } from 'utils'

import * as data from './json/ir/terrains.json'
import IconTerrain from 'images/terrain.png'

const createTerrainFromJson = (data: TerrainData): Terrain => {
  let terrain: Terrain = {type: data.type as TerrainType, mode: data.mode as Mode, image: IconTerrain, location: data.location as LocationType}
  const base_values: [TerrainValueType, number][] = [
    [TerrainCalc.Roll, data.roll]
  ]
  return addValues(terrain, ValuesType.Base, terrain.type, base_values)
}

const initializeDefaultTerrains = (): Terrains => toObj(data.terrain.map(createTerrainFromJson), unit => unit.type)

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
