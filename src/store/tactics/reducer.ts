import { createReducer } from 'typesafe-actions'
import { getDefaultDefinitions } from './data'
import { setBaseValue } from './actions'

const initialState = {
  tactics: getDefaultDefinitions()
}

export const tacticsReducer = createReducer(initialState)
  .handleAction(setBaseValue, (state, action: ReturnType<typeof setBaseValue>) => (
    { ...state, tactics: state.tactics.update(action.payload.tactic, tactic => (
      tactic.add_base_value(action.payload.key, action.payload.value_type, action.payload.value)
    ))}
  ))
