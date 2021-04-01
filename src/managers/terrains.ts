import { TerrainValueType, ValuesType, TerrainData, LocationType, TerrainsData, TerrainType } from 'types'
import { addValuesWithMutate } from 'data_values'
import { filter } from 'utils'

export const setTerrainValue = (terrain: TerrainData, key: string, attribute: TerrainValueType, value: number) => {
  addValuesWithMutate(terrain, ValuesType.Base, key, [[attribute, value]])
}

export const setTerrainLocation = (terrain: TerrainData, location: LocationType) => {
  terrain.location = location
}

export const setTerrainImage = (terrain: TerrainData, image: string) => {
  terrain.image = image
}

export const deleteTerrain = (terrains: TerrainsData, type: TerrainType) => {
  delete terrains[type]
}

export const createTerrain = (terrains: TerrainsData, type: TerrainType) => {
  terrains[type] = { type, image: '', location: LocationType.Border }
}

export const setTerrainType = (terrains: TerrainsData, oldType: TerrainType, type: TerrainType) => {
  delete Object.assign(terrains, { [type]: { ...terrains[oldType], type } })[oldType]
}

const filterTerrain = (terrain: TerrainData, location: LocationType) => terrain.location === location

export const filterTerrains = (terrains: TerrainsData, location: LocationType) =>
  filter(terrains, terrain => filterTerrain(terrain, location))
