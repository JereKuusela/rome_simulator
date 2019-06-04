import { createReducer } from 'typesafe-actions'
import { importState } from './actions'
import { initialState as initialStateBattle } from '../land_battle'
import { initialState as initialStateTactics } from '../tactics'
import { initialState as initialStateTerrains } from '../terrains'
import { initialState as initialStateUnits } from '../units'
import { initialState as initialStateSettings } from '../settings'

export const initialState = {
  tactics: initialStateTactics,
  terrains: initialStateTerrains,
  units: initialStateUnits,
  land: initialStateBattle,
  settings: initialStateSettings
}

export const transferReducer = createReducer(initialState)
  .handleAction(importState, (state, action: ReturnType<typeof importState>) => {
    if (action.payload.reset_missing)
      return { ...state, ...initialState, settings: state.settings, ...action.payload.state }
    else
      return { ...state, ...action.payload.state }
  }
  )
