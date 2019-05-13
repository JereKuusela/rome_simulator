import { Reducer } from 'redux'
import { LayoutState, LayoutActionTypes } from './types'
import { UnitActionTypes } from '../units'

// Type-safe initialState!
export const initialState: LayoutState = {
  unit_modal: null,
  army: null
}

// Thanks to Redux 4's much simpler typings, we can take away a lot of typings on the reducer side,
// everything will remain type-safe.
const reducer: Reducer<LayoutState> = (state = initialState, action): LayoutState => {
  switch (action.type) {
    case LayoutActionTypes.SET_UNIT_MODAL: {
      return { ...state, unit_modal: action.payload.unit, army: action.payload.army }
    }
    case UnitActionTypes.SET_BASE_VALUE: {
      if (state.unit_modal)
        return { ...state, unit_modal: state.unit_modal.add_base_value(action.payload.value_type, action.payload.key, action.payload.value) }
      return state
    }
    case UnitActionTypes.SET_MODIFIER_VALUE: {
      if (state.unit_modal)
        return { ...state, unit_modal: state.unit_modal.add_modifier_value(action.payload.value_type, action.payload.key, action.payload.value) }
      return state
    }
    default: {
      return state
    }
  }
}

// Instead of using default export, we use named exports. That way we can group these exports
// inside the `index.js` folder.
export { reducer as layoutReducer }
