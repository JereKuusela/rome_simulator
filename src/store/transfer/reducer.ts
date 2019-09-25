import { ImmerReducer, createActionCreators, createReducerFunction } from 'immer-reducer'
import { AppState } from '../'
import { ExportKey } from './index'
import { resetMissing } from '../utils'

type ExportKeys = { [key in ExportKey]: boolean }

export const transferState = {
  export_keys: {} as ExportKeys,
  reset_missing: false
}


class TransferReducer extends ImmerReducer<typeof transferState> {

  setExportKey(key: ExportKey, value: boolean) {
    this.draftState.export_keys[key] = value
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
        tactics: state.tactics ? { ...this.state.tactics, ...state.tactics } : this.state.tactics,
        terrains: state.terrains ? { ...this.state.terrains, ...state.terrains } : this.state.terrains,
        global_stats: state.global_stats ? { ...this.state.global_stats, ...state.global_stats } : this.state.global_stats,
        units: state.units ? { ...this.state.units, ...state.units } : this.state.units
      }
  }

  reset() {
    this.draftState = { ...this.state, ...resetMissing({} as any) }
  }
}

const importActions = createActionCreators(ImportReducer)

export const importState = importActions.importState
export const reset = importActions.reset


export const importReducer = createReducerFunction(ImportReducer, {} as any)