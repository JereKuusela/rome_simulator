import { createReducer } from 'typesafe-actions'
import { Map } from 'immutable'
import { setExportKey, ExportKey } from './actions'

export const initialState = {
  export_keys: Map<ExportKey, boolean>()
}

export const settingsReducer = createReducer(initialState)
  .handleAction(setExportKey, (state, action: ReturnType<typeof setExportKey>) => (
    { ...state, export_keys: state.export_keys.set(action.payload.key, action.payload.value) }
  ))
