import { ImmerReducer, createActionCreators, createReducerFunction } from 'immer-reducer'
import { TacticType, TacticValueType } from '../types/tactics'
import { ValuesType, DefinitionType } from '../base_definition'
import { addValues } from '../definition_values'
import { getDefaultTactics, getTacticIcon, TacticDefinitions } from 'data/tactics'

export const getDefaultTacticDefinitions = () => getDefaultTactics()

const tacticDefinitions = getDefaultTacticDefinitions()

class TacticsReducer extends ImmerReducer<TacticDefinitions> {

  setBaseValue(type: TacticType, key: string, attribute: TacticValueType, value: number) {
    this.draftState[type] = addValues(this.state[type], ValuesType.Base, key, [[attribute, value]])
  }

  deleteTactic(type: TacticType) {
    delete this.draftState[type]
  }

  addTactic(type: TacticType, mode: DefinitionType) {
    this.draftState[type] = { type, mode, image: getTacticIcon(type) }
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

export const setTacticBaseValue = actions.setBaseValue
export const deleteTactic = actions.deleteTactic
export const addTactic = actions.addTactic
export const changeTacticType = actions.changeType
export const changeTacticImage = actions.changeImage
export const changeTacticMode = actions.changeMode

export const tacticsReducer = createReducerFunction(TacticsReducer, tacticDefinitions)
