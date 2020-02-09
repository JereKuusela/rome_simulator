import { TerrainValueType, ValuesType, Terrain, LocationType, DefinitionType, Terrains, TerrainType } from "types"
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

export const setTerrainMode = (terrain: Terrain, mode: DefinitionType) => {
  terrain.mode = mode
}

export const deleteTerrain = (terrains: Terrains, type: TerrainType) => {
  delete terrains[type]
}

export const createTerrain = (terrains: Terrains, type: TerrainType, mode: DefinitionType) => {
  terrains[type] = { type, mode, image: '', location: LocationType.Border }
}

export const setTerrainType = (terrains: Terrains, old_type: TerrainType, type: TerrainType) => {
  delete Object.assign(terrains, {[type]: terrains[old_type] })[old_type]
}