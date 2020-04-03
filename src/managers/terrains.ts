import { TerrainValueType, ValuesType, TerrainDefinition, LocationType, Mode, TerrainDefinitions, TerrainType } from "types"
import { addValuesWithMutate } from "definition_values"

export const setTerrainValue = (terrain: TerrainDefinition, key: string, attribute: TerrainValueType, value: number) => {
  addValuesWithMutate(terrain, ValuesType.Base, key, [[attribute, value]])
}

export const setTerrainLocation = (terrain: TerrainDefinition, location: LocationType) => {
  terrain.location = location
}

export const setTerrainImage = (terrain: TerrainDefinition, image: string) => {
  terrain.image = image
}

export const setTerrainMode = (terrain: TerrainDefinition, mode: Mode) => {
  terrain.mode = mode
}

export const deleteTerrain = (terrains: TerrainDefinitions, type: TerrainType) => {
  delete terrains[type]
}

export const createTerrain = (terrains: TerrainDefinitions, type: TerrainType, mode: Mode) => {
  terrains[type] = { type, mode, image: '', location: LocationType.Border }
}

export const setTerrainType = (terrains: TerrainDefinitions, old_type: TerrainType, type: TerrainType) => {
  delete Object.assign(terrains, { [type]: { ...terrains[old_type], type } })[old_type]
}