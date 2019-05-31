import { createReducer } from 'typesafe-actions'
import { getDefaultDefinitions } from './data'
import { setBaseValue } from './actions'
import { add_base_value } from '../../base_definition'

export const initialState = {
  tactics: getDefaultDefinitions()
}

export const tacticsReducer = createReducer(initialState)
  .handleAction(setBaseValue, (state, action: ReturnType<typeof setBaseValue>) => (
    { ...state, tactics: state.tactics.update(action.payload.tactic, tactic => (
      add_base_value(tactic, action.payload.key, action.payload.attribute, action.payload.value)
    ))}
  ))
