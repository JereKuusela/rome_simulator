import { Map } from 'immutable'
import { Reducer } from 'redux'
import { getDefaultDefinitions } from './data'
import { UnitsState, UnitActionTypes, UnitType, UnitDefinition, ArmyType } from './types'

const initialState: UnitsState = {
    units: Map<ArmyType, Map<UnitType, UnitDefinition>>().set(ArmyType.Attacker, getDefaultDefinitions()).set(ArmyType.Defender, getDefaultDefinitions())
  }

// Thanks to Redux 4's much simpler typings, we can take away a lot of typings on the reducer side,
const reducer: Reducer<UnitsState> = (state = initialState, action): UnitsState => {
  switch (action.type) {
    case UnitActionTypes.SET_BASE_VALUE: {
      const army = state.units.get(action.payload.army)!
      const unit = army.get(action.payload.type)!
      const new_unit = unit.add_base_value(action.payload.value_type, action.payload.key, action.payload.value)
      return { ...state, units: state.units.set(action.payload.army, army.set(action.payload.type, new_unit)) }
    }
    case UnitActionTypes.SET_MODIFIER_VALUE: {
      const army = state.units.get(action.payload.army)!
      const unit = army.get(action.payload.type)!
      const new_unit = unit.add_modifier_value(action.payload.value_type, action.payload.key, action.payload.value)
      return { ...state, units: state.units.set(action.payload.army, army.set(action.payload.type, new_unit)) }
    }
    default: {
      return state
    }
  }
}

export { reducer as unitsReducer }
