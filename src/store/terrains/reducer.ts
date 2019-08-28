import { ImmerReducer, createActionCreators, createReducerFunction } from 'immer-reducer'
import { getDefaultTerrains } from './data'
import { TerrainType, ValueType, LocationType } from './actions'
import { addValues, ValuesType, DefinitionType } from '../../base_definition'

export const terrainsState = getDefaultTerrains()

class TerrainsReducer extends ImmerReducer<typeof terrainsState> {

  setBaseValue(type: TerrainType, key: string, attribute: ValueType, value: number) {
    this.draftState = this.state.update(type, terrain => (
      addValues(terrain, ValuesType.Base, key, [[attribute, value]])
    ))
  }

  deleteTerrain(type: TerrainType) {
    this.draftState = this.state.delete(type)
  }

  addTerrain(type: TerrainType, mode: DefinitionType) {
    this.draftState = this.state.set(type, { type, mode, image: '' })
  }

  changeType(old_type: TerrainType, type: TerrainType) {
    this.draftState = this.state.set(type, { ...this.state.get(old_type)!, type }).delete(old_type)
  }

  changeLocation(type: TerrainType, location: LocationType) {
    this.draftState = this.state.update(type, terrain => ({ ...terrain, location }))
  }

  changeImage(type: TerrainType, image: string) {
    this.draftState = this.state.update(type, terrain => ({ ...terrain, image }))
  }

  changeMode(type: TerrainType, mode: DefinitionType) {
    this.draftState = this.state.update(type, terrain => ({ ...terrain, mode }))
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

export const terrainsReducer = createReducerFunction(TerrainsReducer, terrainsState)
