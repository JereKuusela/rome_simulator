import { createReducer } from 'typesafe-actions'
import { Map } from 'immutable'
import { setExportKey, ExportKey, setResetMissing } from './actions'

export const initialState = {
  export_keys: Map<ExportKey, boolean>(),
  reset_missing: false
}

export const settingsReducer = createReducer(initialState)
  .handleAction(setExportKey, (state, action: ReturnType<typeof setExportKey>) => (
    { ...state, export_keys: state.export_keys.set(action.payload.key, action.payload.value) }
  ))
  .handleAction(setResetMissing, (state, action: ReturnType<typeof setResetMissing>) => (
    { ...state, reset_missing: action.payload.value }
  ))
