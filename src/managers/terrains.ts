import { TerrainValueType, ValuesType, Terrain, LocationType, Mode, TerrainDefinitions, TerrainType } from 'types'
import { addValuesWithMutate } from 'definition_values'

export const setTerrainValue = (terrain: Terrain, key: string, attribute: TerrainValueType, value: number) => {
  addValuesWithMutate(terrain, ValuesType.Base, key, [[attribute, value]])
}

export const setTerrainLocation = (terrain: Terrain, location: LocationType) => {
  terrain.location = location
}

export const setTerrainImage = (terrain: Terrain, image: string) => {
  terrain.image = image
}

export const setTerrainMode = (terrain: Terrain, mode: Mode) => {
  terrain.mode = mode
}

export const deleteTerrain = (terrains: TerrainDefinitions, type: TerrainType) => {
  delete terrains[type]
}

export const createTerrain = (terrains: TerrainDefinitions, type: TerrainType, mode: Mode) => {
  terrains[type] = { type, mode, image: '', location: LocationType.Border }
}

export const setTerrainType = (terrains: TerrainDefinitions, oldType: TerrainType, type: TerrainType) => {
  delete Object.assign(terrains, { [type]: { ...terrains[oldType], type } })[oldType]
}
