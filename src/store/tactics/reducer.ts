import { createReducer } from 'typesafe-actions'
import { getDefaultTactics } from './data'
import { setBaseValue, deleteTactic, addTactic, changeImage, changeType, changeMode } from './actions'
import { addValues, ValuesType } from '../../base_definition'

export const tacticsState = getDefaultTactics()

export const tacticsReducer = createReducer(tacticsState)
  .handleAction(setBaseValue, (state, action: ReturnType<typeof setBaseValue>) => (
     state.update(action.payload.tactic, tactic => (
        addValues(tactic, ValuesType.Base, action.payload.key, [[action.payload.attribute, action.payload.value]])
    ))
  ))
  .handleAction(deleteTactic, (state, action: ReturnType<typeof deleteTactic>) => (
    state.delete(action.payload.type)
  ))
  .handleAction(addTactic, (state, action: ReturnType<typeof addTactic>) => (
    state.set(action.payload.type, { type: action.payload.type, mode: action.payload.mode, image: '' })
  ))
  .handleAction(changeImage, (state, action: ReturnType<typeof changeImage>) => (
    state.update(action.payload.type, tactic => ({ ...tactic, image: action.payload.image }))
  ))
  .handleAction(changeMode, (state, action: ReturnType<typeof changeMode>) => (
    state.update(action.payload.type, tactic => ({ ...tactic, mode: action.payload.mode }))
  ))
  .handleAction(changeType, (state, action: ReturnType<typeof changeType>) => (
    state.set(action.payload.new_type, { ...state.get(action.payload.old_type)!, type: action.payload.new_type }).delete(action.payload.old_type)
  ))
