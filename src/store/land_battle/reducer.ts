import { createReducer } from 'typesafe-actions'
import { getInitialArmy, getInitialTerrains } from './types'
import { selectUnit, selectTerrain, battle } from './actions'
import { ArmyType } from '../units'
import { battle as fight } from './combat'

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
      defender: { ...state.defender, army: action.payload.army === ArmyType.Defender ? state.defender.army.setIn([action.payload.row, action.payload.column], action.payload.unit) : state.defender.army }
    }
  ))
  .handleAction(selectTerrain, (state, action: ReturnType<typeof selectTerrain>) => (
    {
      ...state,
      terrains: state.terrains.set(action.payload.index, action.payload.terrain)
    }
  ))
  .handleAction(battle, (state, action: ReturnType<typeof battle>) => {
    let [attacker, defender] = fight(state.attacker.army, state.defender.army, 3, 3, state.day, state.terrains)
    return {
      ...state,
      attacker: { ...state.attacker, army: attacker},
      defender: { ...state.defender, army: defender},
      day: state.day + 1
    }
  }
  )