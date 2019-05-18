import { createReducer } from 'typesafe-actions'
import { getInitialArmy, getInitialTerrains } from './types'
import { selectUnit } from './actions'
import { ArmyType } from '../units'

export const initialState = {
  attacker: getInitialArmy(),
  defender: getInitialArmy(),
  terrains: getInitialTerrains(),
  day: 0
}

export const landBattleReducer = createReducer(initialState)
  .handleAction(selectUnit, (state, action: ReturnType<typeof selectUnit>) => (
    {
      ...state,
      attacker: { ...state.attacker, army: action.payload.army === ArmyType.Attacker ? state.attacker.army.setIn([action.payload.row, action.payload.column], action.payload.unit) : state.attacker.army },
      defender: { ...state.defender,  army: action.payload.army === ArmyType.Defender ? state.defender.army.setIn([action.payload.row, action.payload.column], action.payload.unit) : state.defender.army }
    }
  ))