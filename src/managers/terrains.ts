import { TerrainValueType, ValuesType, Terrain, LocationType, Mode, Terrains, TerrainType } from "types"
import { addValuesWithMutate } from "definition_values"

export const setTerrainValue = (terrain: Terrain, type: ValuesType, key: string, attribute: TerrainValueType, value: number) => {
  addValuesWithMutate(terrain, type, key, [[attribute, value]])
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

export const deleteTerrain = (terrains: Terrains, type: TerrainType) => {
  delete terrains[type]
}

export const createTerrain = (terrains: Terrains, type: TerrainType, mode: Mode) => {
  terrains[type] = { type, mode, image: '', location: LocationType.Border }
}

export const setTerrainType = (terrains: Terrains, old_type: TerrainType, type: TerrainType) => {
  delete Object.assign(terrains, { [type]: { ...terrains[old_type], type } })[old_type]
}