import {
  ValuesType,
  Mode,
  TerrainType,
  LocationType,
  TerrainCalc,
  Terrain,
  TerrainValueType,
  TerrainDefinitions
} from 'types'
import { addValues } from 'definition_values'
import { toObj } from 'utils'

import * as dataIR from './json/ir/terrains.json'
import * as dataEU4 from './json/eu4/terrains.json'
import IconTerrain from 'images/terrain.png'

const createTerrainFromJson = (data: TerrainData): Terrain => {
  const terrain: Terrain = {
    type: data.type as TerrainType,
    mode: data.mode as Mode,
    image: IconTerrain,
    location: data.location as LocationType
  }
  const baseValues: [TerrainValueType, number][] = [[TerrainCalc.Roll, data.roll]]
  return addValues(terrain, ValuesType.Base, terrain.type, baseValues)
}

const initializeDefaultTerrains = (): TerrainDefinitions => {
  if (process.env.REACT_APP_GAME === 'EU4') return toObj(dataEU4.terrain.map(createTerrainFromJson), item => item.type)
  else return toObj(dataIR.terrain.map(createTerrainFromJson), item => item.type)
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
