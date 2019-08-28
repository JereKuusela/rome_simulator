import { ImmerReducer, createActionCreators, createReducerFunction } from 'immer-reducer'
import { getDefaultTactics } from './data'
import { TacticType, ValueType } from './actions'
import { addValues, ValuesType, DefinitionType } from '../../base_definition'

export const tacticsState = getDefaultTactics()

class TacticsReducer extends ImmerReducer<typeof tacticsState> {

  setBaseValue(tactic: TacticType, key: string, attribute: ValueType, value: number) {
    this.draftState = this.state.update(tactic, tactic => (
      addValues(tactic, ValuesType.Base, key, [[attribute, value]])
    ))
  }

  deleteTactic(type: TacticType) {
    this.draftState = this.state.delete(type)
  }

  addTactic(type: TacticType, mode: DefinitionType) {
    this.draftState = this.state.set(type, { type, mode, image: '' })
  }

  changeType(old_type: TacticType, type: TacticType) {
    this.draftState = this.state.set(type, { ...this.state.get(old_type)!, type }).delete(old_type)
  }

  changeImage(type: TacticType, image: string) {
    this.draftState = this.state.update(type, tactic => ({ ...tactic, image }))
  }

  changeMode(type: TacticType, mode: DefinitionType) {
    this.draftState = this.state.update(type, tactic => ({ ...tactic, mode }))
  }
}

const actions = createActionCreators(TacticsReducer)

export const setBaseValue = actions.setBaseValue
export const deleteTactic = actions.deleteTactic
export const addTactic = actions.addTactic
export const changeType = actions.changeType
export const changeImage = actions.changeImage
export const changeMode = actions.changeMode

export const tacticsReducer = createReducerFunction(TacticsReducer, tacticsState)
