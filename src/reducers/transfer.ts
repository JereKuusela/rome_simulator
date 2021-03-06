import * as manager from 'managers/transfer'
import { TransferState } from 'types'
import { getDefaultTransferState } from 'data'
import { makeContainerReducer, ActionToFunction, makeActionRemoveFirst } from './utils'
import type { AppState } from 'reducers'

const transferMapping: ActionToFunction<TransferState> = {}

export const setExportKey = makeActionRemoveFirst(manager.setExportKey, transferMapping)
export const setResetMissing = makeActionRemoveFirst(manager.setResetMissing, transferMapping)

export const transferReducer = makeContainerReducer(getDefaultTransferState(), transferMapping)

const importMapping: ActionToFunction<AppState> = {}

export const importState = makeActionRemoveFirst(manager.importState, importMapping)
export const resetMissingState = makeActionRemoveFirst(manager.resetMissingState, importMapping)
export const resetState = makeActionRemoveFirst(manager.resetState, importMapping)

export const importReducer = makeContainerReducer({} as AppState, importMapping)
