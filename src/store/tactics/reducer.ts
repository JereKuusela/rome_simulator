import { createReducer } from 'typesafe-actions'
import { List } from 'immutable'
import { getDefaultDefinitions } from './data'
import { setBaseValue } from './actions'
import { add_base_value } from '../../base_definition'
import { TerrainType } from '../terrains';

export const tacticsState = {
  types: List<TerrainType>(),
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
