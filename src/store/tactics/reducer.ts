import { ImmerReducer, createActionCreators, createReducerFunction } from 'immer-reducer'
import { getDefaultTactics, TacticDefinitions } from './data'
import { TacticType, ValueType } from './actions'
import { ValuesType, DefinitionType } from '../../base_definition'
import { getIcon } from '../tactics'
import { addValues } from '../../definition_values'

export const getDefaultTacticDefinitions = () => getDefaultTactics()

const tacticDefinitions = getDefaultTacticDefinitions()

class TacticsReducer extends ImmerReducer<TacticDefinitions> {

  setBaseValue(type: TacticType, key: string, attribute: ValueType, value: number) {
    this.draftState[type] = addValues(this.state[type], ValuesType.Base, key, [[attribute, value]])
  }

  deleteTactic(type: TacticType) {
    delete this.draftState[type]
  }

  addTactic(type: TacticType, mode: DefinitionType) {
    this.draftState[type] = { type, mode, image: getIcon(type) }
  }

  changeType(old_type: TacticType, type: TacticType) {
    delete Object.assign(this.draftState, {[type]: this.draftState[old_type] })[old_type]
  }

  changeImage(type: TacticType, image: string) {
    this.draftState[type].image = image
  }

  changeMode(type: TacticType, mode: DefinitionType) {
    this.draftState[type].mode = mode
  }
}

const actions = createActionCreators(TacticsReducer)

export const setBaseValue = actions.setBaseValue
export const deleteTactic = actions.deleteTactic
export const addTactic = actions.addTactic
export const changeType = actions.changeType
export const changeImage = actions.changeImage
export const changeMode = actions.changeMode

export const tacticsReducer = createReducerFunction(TacticsReducer, tacticDefinitions)
