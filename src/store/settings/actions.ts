import { createAction } from 'typesafe-actions'

export enum ExportKey {
  Units = 'Unit Definitions',
  Terrains = 'Terrain Definitions',
  Tactics = 'Tactic Definitions',
  Army = 'Armies',
  History = 'Previous Rounds',
  Settings = 'Settings'
}

export const setExportKey = createAction('@@settings/SET_EXPORT_KEY', action => {
  return (key: ExportKey, value: boolean) => action({ key, value })
})
