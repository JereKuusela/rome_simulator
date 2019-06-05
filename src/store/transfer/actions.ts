import { createAction } from 'typesafe-actions'

export enum ExportKey {
  Units = 'Unit Definitions',
  Terrains = 'Terrain Definitions',
  Tactics = 'Tactic Definitions',
  Army = 'Armies',
  History = 'Previous Rounds'
}

export const setExportKey = createAction('@@settings/SET_EXPORT_KEY', action => {
  return (key: ExportKey, value: boolean) => action({ key, value })
})

export const setResetMissing = createAction('@@settings/SET_RESET_MISSING', action => {
  return (value: boolean) => action({ value })
})

export const importState = createAction('@@transfer/IMPORT_STATE', action => {
  return (state: any, reset_missing: boolean) => action({ state, reset_missing })
})
