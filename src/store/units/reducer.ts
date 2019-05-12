import { Reducer } from 'redux'
import { getDefaultDefinitions } from './data'
import { UnitsState } from './types'

const initialState: UnitsState = {
    attacker: getDefaultDefinitions(),
    defender: getDefaultDefinitions()
  }

// Thanks to Redux 4's much simpler typings, we can take away a lot of typings on the reducer side,
const reducer: Reducer<UnitsState> = (state = initialState, action) => {
  switch (action.type) {
    // TODO: Allow editing of properties.
    default: {
      return state
    }
  }
}

export { reducer as unitsReducer }
