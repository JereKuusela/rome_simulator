import { ImmerReducer, createActionCreators, createReducerFunction } from 'immer-reducer'
import { getDefaultTerrains, TerrainDefinitions } from './data'
import { TerrainType, ValueType, LocationType } from './actions'
import { addValues, ValuesType, DefinitionType } from '../../base_definition'

export const getDefaultTerrainDefinitions = () => getDefaultTerrains()

const terrainDefinitions = getDefaultTerrainDefinitions()

class TerrainsReducer extends ImmerReducer<TerrainDefinitions> {

  setBaseValue(type: TerrainType, key: string, attribute: ValueType, value: number) {
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

export const setBaseValue = actions.setBaseValue
export const deleteTerrain = actions.deleteTerrain
export const addTerrain = actions.addTerrain
export const changeType = actions.changeType
export const changeLocation = actions.changeLocation
export const changeImage = actions.changeImage
export const changeMode = actions.changeMode

export const terrainsReducer = createReducerFunction(TerrainsReducer, terrainDefinitions)
