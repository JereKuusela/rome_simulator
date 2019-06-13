import { createReducer } from 'typesafe-actions'
import { getDefaultDefinitions, getDefaultTypes } from './data'
import { setBaseValue, deleteTactic, addTactic, changeImage, changeType } from './actions'
import { addValues, ValuesType } from '../../base_definition'

export const tacticsState = {
  types: getDefaultTypes(),
  definitions: getDefaultDefinitions()
}

export const tacticsReducer = createReducer(tacticsState)
  .handleAction(setBaseValue, (state, action: ReturnType<typeof setBaseValue>) => (
    {
      ...state, definitions: state.definitions.update(action.payload.tactic, tactic => (
        addValues(tactic, ValuesType.Base, action.payload.key, [[action.payload.attribute, action.payload.value]])
      ))
    }
  ))
  .handleAction(deleteTactic, (state, action: ReturnType<typeof deleteTactic>) => (
    {
      ...state,
      definitions: state.definitions.delete(action.payload.type),
      types: state.types.delete(action.payload.type)
    }
  ))
  .handleAction(addTactic, (state, action: ReturnType<typeof addTactic>) => (
    {
      ...state,
      definitions: state.definitions.set(action.payload.type, { type: action.payload.type, image: '' }),
      types: state.types.add(action.payload.type)
    }
  ))
  .handleAction(changeImage, (state, action: ReturnType<typeof changeImage>) => (
    {
      ...state,
      definitions: state.definitions.update(action.payload.type, tactic => ({ ...tactic, image: action.payload.image}))
    }
  ))
  .handleAction(changeType, (state, action: ReturnType<typeof changeType>) => (
    {
      ...state,
      types: state.types.map(value => value === action.payload.old_type ? action.payload.new_type : value),
      definitions: state.definitions.set(action.payload.new_type, { ...state.definitions.get(action.payload.old_type)!, type: action.payload.new_type }).delete(action.payload.old_type)
    }
  ))
