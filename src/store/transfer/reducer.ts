import { createReducer } from 'typesafe-actions'
import { importState } from './actions'
import { Map } from 'immutable'
import { setExportKey, ExportKey, setResetMissing } from './actions'
import { initialState as initialStateBattle } from '../land_battle'
import { initialState as initialStateTactics } from '../tactics'
import { initialState as initialStateTerrains } from '../terrains'
import { initialState as initialStateUnits } from '../units'

export const initialState = {
  export_keys: Map<ExportKey, boolean>(),
  reset_missing: false
}

export const mergedInitialState = {
  tactics: initialStateTactics,
  terrains: initialStateTerrains,
  units: initialStateUnits,
  land: initialStateBattle,
  transfer: initialState
}

export const transferReducer = createReducer(initialState)
  .handleAction(setExportKey, (state, action: ReturnType<typeof setExportKey>) => (
    { ...state, export_keys: state.export_keys.set(action.payload.key, action.payload.value) }
  ))
  .handleAction(setResetMissing, (state, action: ReturnType<typeof setResetMissing>) => (
    { ...state, reset_missing: action.payload.value }
  ))

export const importReducer = createReducer(mergedInitialState)
  .handleAction(importState, (state, action: ReturnType<typeof importState>) => {
    if (action.payload.reset_missing)
      return { ...state, ...initialState, settings: state.transfer, ...action.payload.state }
    else
      return { ...state, ...action.payload.state }
  }
  )
