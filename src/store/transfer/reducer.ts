import { createReducer } from 'typesafe-actions'
import { importState } from './actions'
import { Map } from 'immutable'
import { setExportKey, ExportKey, setResetMissing } from './actions'
import { initialState as initialStateBattle } from '../land_battle'
import { tacticsState } from '../tactics'
import { terrainState } from '../terrains'
import { globalStatsState, unitsState } from '../units'

export const transferState = {
  export_keys: Map<ExportKey, boolean>(),
  reset_missing: false
}

const initialState = {
  tactics: tacticsState,
  terrains: terrainState,
  units: unitsState,
  global_stats: globalStatsState,
  land: initialStateBattle,
  transfer: transferState
}

export const transferReducer = createReducer(transferState)
  .handleAction(setExportKey, (state, action: ReturnType<typeof setExportKey>) => (
    { ...state, export_keys: state.export_keys.set(action.payload.key, action.payload.value) }
  ))
  .handleAction(setResetMissing, (state, action: ReturnType<typeof setResetMissing>) => (
    { ...state, reset_missing: action.payload.value }
  ))

export const importReducer = createReducer(initialState)
  .handleAction(importState, (state, action: ReturnType<typeof importState>) => {
    if (action.payload.reset_missing)
      return { ...state, ...transferState, settings: state.transfer, ...action.payload.state }
    else
      return { ...state, ...action.payload.state }
  }
  )
