import { createReducer } from 'typesafe-actions'
import { List } from 'immutable'
import { getDefaultDefinitions, TacticType } from './data'
import { setBaseValue } from './actions'
import { add_base_value } from '../../base_definition'

export const tacticsState = {
  types: List<TacticType>(),
  definitions: getDefaultDefinitions()
}

export const tacticsReducer = createReducer(tacticsState)
  .handleAction(setBaseValue, (state, action: ReturnType<typeof setBaseValue>) => (
    {
      ...state, definitions: state.definitions.update(action.payload.tactic, tactic => (
        add_base_value(tactic, action.payload.key, action.payload.attribute, action.payload.value)
      ))
    }
  ))
