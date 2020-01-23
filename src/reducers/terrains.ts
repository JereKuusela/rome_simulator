import { ImmerReducer, createActionCreators, createReducerFunction } from 'immer-reducer'
import { getDefaultTerrains } from 'data'
import { TerrainType, LocationType, TerrainValueType, ValuesType, DefinitionType, TerrainDefinitions } from 'types'
import { addValues } from 'definition_values'

class TerrainsReducer extends ImmerReducer<TerrainDefinitions> {

  setBaseValue(type: TerrainType, key: string, attribute: TerrainValueType, value: number) {
    this.draftState[type] = addValues(this.state[type], ValuesType.Base, key, [[attribute, value]])
  }

  deleteTerrain(type: TerrainType) {
    delete this.draftState[type]
  }

  addTerrain(type: TerrainType, mode: DefinitionType) {
    this.draftState[type] = { type, mode, image: '', location: LocationType.Border }
  }

  changeType(old_type: TerrainType, type: TerrainType) {
    delete Object.assign(this.draftState, {[type]: this.draftState[old_type] })[old_type]
  }

  changeLocation(type: TerrainType, location: LocationType) {
    this.draftState[type].location = location
  }

  changeImage(type: TerrainType, image: string) {
    this.draftState[type].image = image
  }

  changeMode(type: TerrainType, mode: DefinitionType) {
    this.draftState[type].mode = mode
  }
}

const actions = createActionCreators(TerrainsReducer)

export const setTerrainBaseValue = actions.setBaseValue
export const deleteTerrain = actions.deleteTerrain
export const addTerrain = actions.addTerrain
export const changeTerrainType = actions.changeType
export const changeTerrainLocation = actions.changeLocation
export const changeTerrainImage = actions.changeImage
export const changeTerrainMode = actions.changeMode

export const terrainsReducer = createReducerFunction(TerrainsReducer, getDefaultTerrains())
