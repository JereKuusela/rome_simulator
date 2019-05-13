import { Reducer } from 'redux'
import { getDefaultDefinitions } from './data'
import { UnitsState, UnitActionTypes } from './types'

const initialState: UnitsState = {
    attacker: getDefaultDefinitions(),
    defender: getDefaultDefinitions()
  }

// Thanks to Redux 4's much simpler typings, we can take away a lot of typings on the reducer side,
const reducer: Reducer<UnitsState> = (state = initialState, action): UnitsState => {
  switch (action.type) {
    case UnitActionTypes.SET_ATTACKER_BASE_VALUE: {
      const unit = state.attacker.get(action.payload.type)
      if (!unit)
        return state
      const new_unit = unit.add_base_value(action.payload.value_type, action.payload.key, action.payload.value)
      return { ...state, attacker: state.attacker.set(action.payload.type, new_unit) }
    }
    case UnitActionTypes.SET_ATTACKER_MODIFIER_VALUE: {
      const unit = state.attacker.get(action.payload.type)
      if (!unit)
        return state
      const new_unit = unit.add_modifier_value(action.payload.value_type, action.payload.key, action.payload.value)
      return { ...state, attacker: state.attacker.set(action.payload.type, new_unit) }
    }
    default: {
      return state
    }
  }
}

export { reducer as unitsReducer }
