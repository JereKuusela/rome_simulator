import { Map } from 'immutable'
import { ImmerReducer, createActionCreators, createReducerFunction } from 'immer-reducer'
import { AppState } from '../'
import { ExportKey } from './index'

export const transferState = {
  export_keys: Map<ExportKey, boolean>(),
  reset_missing: false
}


class TransferReducer extends ImmerReducer<typeof transferState> {

  setExportKey(key: ExportKey, value: boolean) {
    this.draftState.export_keys = this.state.export_keys.set(key, value)
  }

  setResetMissing(value: boolean) {
    this.draftState.reset_missing = value
  }
}
const transferActions = createActionCreators(TransferReducer)

export const setResetMissing = transferActions.setResetMissing
export const setExportKey = transferActions.setExportKey

export const transferReducer = createReducerFunction(TransferReducer, transferState)

class ImportReducer extends ImmerReducer<AppState> {

  importState(state: any, reset_missing: boolean) {
    if (reset_missing)
      this.draftState = { ...this.state, transfer: this.state.transfer, ...state }
    else
      // Bit complicated logic needed to allow adding and partially updating definitions.
      // TODO: this.state vs state really messy.
      this.draftState = {
        ...this.state,
        ...state,
        tactics: state.tactics ? this.state.tactics.merge(state.tactics) : this.state.tactics,
        terrains: state.terrains ? this.state.terrains.merge(state.terrains) : this.state.terrains,
        global_stats: state.global_stats ? { ...this.state.global_stats, ...state.global_stats } : this.state.global_stats,
        units: state.units ? this.state.units.map((value, key) => value.merge(state.units.get(key))) : this.state.units
      }
  }
}

const importActions = createActionCreators(ImportReducer)

export const importState = importActions.importState

export const importReducer = createReducerFunction(ImportReducer, {} as any)