import { Reducer } from 'redux'
import { UnitsState, UnitDefinition, UnitType } from './types'


const getDefaultDefinitions = (): Map<UnitType, UnitDefinition> => {
    let defitinion = new Map<UnitType, UnitDefinition>();
    // TODO: Init values.
    return defitinion;
}

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
