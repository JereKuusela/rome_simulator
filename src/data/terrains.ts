import { ValuesType, TerrainType, LocationType, TerrainCalc, TerrainData, TerrainValueType, TerrainsData } from 'types'
import { addValues } from 'data_values'
import { toObj } from 'utils'

import dataIR from './json/ir/terrains.json'
import dataEU4 from './json/eu4/terrains.json'
import IconTerrain from 'images/terrain.png'

const createTerrainFromJson = (data: TerrainJSON): TerrainData => {
  const terrain: TerrainData = {
    type: data.type as TerrainType,
    image: IconTerrain,
    location: data.location as LocationType
  }
  const baseValues: [TerrainValueType, number][] = [
    [TerrainCalc.Roll, data.roll],
    [TerrainCalc.CombatWidth, data.combat_width]
  ]
  return addValues(terrain, ValuesType.Base, terrain.type, baseValues)
}

const initializeDefaultTerrains = (): TerrainsData => {
  const data = process.env.REACT_APP_GAME === 'EU4' ? Array.from(dataEU4.terrain) : Array.from(dataIR)
  return toObj(data.map(createTerrainFromJson), item => item.type)
}

const defaultTerrains = initializeDefaultTerrains()

export const getDefaultTerrains = () => defaultTerrains
export const getDefaultTerrain = (type: TerrainType) => defaultTerrains[type]

interface TerrainJSON {
  type: string
  location: string
  roll: number
  combat_width: number
}

export const getDefaultTerrainState = () => getDefaultTerrains()
