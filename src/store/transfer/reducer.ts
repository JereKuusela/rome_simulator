import { createReducer } from 'typesafe-actions'
import { importState } from './actions'
import { Map } from 'immutable'
import { setExportKey, ExportKey, setResetMissing } from './actions'
import { initialState as initialStateBattle } from '../battle'
import { tacticsState } from '../tactics'
import { terrainState } from '../terrains'
import { globalStatsState, unitsState } from '../units'
import { governmentsState } from '../governments'
import { settingsState } from '../settings'

export const transferState = {
  export_keys: Map<ExportKey, boolean>(),
  reset_missing: false
}

export const initialState = {
  tactics: tacticsState,
  terrains: terrainState,
  units: unitsState,
  global_stats: globalStatsState,
  battle: initialStateBattle,
  transfer: transferState,
  governments: governmentsState,
  settings: settingsState
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
      return { ...state, ...initialState, transfer: state.transfer, ...action.payload.state }
    else
      // Bit complicated logic needed to allow adding and partially updating definitions.
      return {
        ...state,
        ...action.payload.state,
        tactics: {
          ...state.tactics,
          definitions: action.payload.state.tactics && action.payload.state.tactics.definitions ? state.tactics.definitions.merge(action.payload.state.tactics.definitions) : state.tactics.definitions
        },
        terrains: {
          ...state.terrains,
          definitions: action.payload.state.terrains && action.payload.state.terrains.definitions ? state.terrains.definitions.merge(action.payload.state.terrains.definitions) : state.terrains.definitions
        },
        global_stats: action.payload.state.global_stats ? state.global_stats.merge(action.payload.state.global_stats) : state.global_stats,
        units: {
          ...state.units,
          definitions: action.payload.state.units && action.payload.state.units.definitions ? state.units.definitions.map((value, key) => value.merge(action.payload.state.units.definitions.get(key))) : state.units.definitions
        }
      }
  }
  )
