
import { saveAs } from 'file-saver'
import { AppState, stripRounds, resetMissing } from 'state'
import { DefinitionType, ExportKey, ExportKeys, TransferState } from 'types'

const filterState = (state: AppState, export_keys?: ExportKeys): any => {
  const filtered: any = { ...state }
  filtered._persist = undefined
  filtered.transfer = undefined
  filtered.data = undefined
  filtered.battle = stripRounds(filtered.battle)
  if (export_keys && !export_keys[ExportKey.Countries])
    filtered.countries = undefined
  if (export_keys && !export_keys[ExportKey.Terrains])
    filtered.terrains = undefined
  if (export_keys && !export_keys[ExportKey.Tactics])
    filtered.tactics = undefined
  if (export_keys && !export_keys[ExportKey.Settings])
    filtered.settings = undefined
  if (export_keys && !export_keys[ExportKey.Land])
    delete filtered.battle[DefinitionType.Land]
  if (export_keys && !export_keys[ExportKey.Naval])
    delete filtered.battle[DefinitionType.Naval]
  if (export_keys && !export_keys[ExportKey.Land] && !export_keys[ExportKey.Naval])
    filtered.battle = undefined
  return filtered
}

export const exportState = (state: AppState, export_keys?: ExportKeys): string => JSON.stringify(filterState(state, export_keys), undefined, 2)

const pad = (value: number) => String(value).padStart(2, '0')

export const saveToFile = (data: string) => {
  const blob = new Blob([data], { type: 'text/plain;charset=utf-8' })
  const date = new Date()
  const formatted = date.getFullYear() + '-' + pad(date.getMonth()) + '-' + pad(date.getDate()) + '_' + pad(date.getHours()) + '-' + pad(date.getMinutes()) + '-' + pad(date.getSeconds())
  saveAs(blob, 'imperator-simulator_' + formatted + '.json');
}

export const setExportKey = (transfer: TransferState, key: ExportKey, value: boolean) => {
  transfer.export_keys[key] = value
}

export const setResetMissing = (transfer: TransferState, value: boolean) => {
  transfer.reset_missing = value
}

export const importState = (state: AppState, imported: any, reset_missing: boolean) => {
  if (reset_missing)
    state = { ...state, transfer: state.transfer, ...imported }
  else
    // Bit complicated logic needed to allow adding and partially updating definitions.
    // TODO: this.state vs state really messy.
    state = {
      ...state,
      ...imported,
      tactics: state.tactics ? { ...state.tactics, ...imported.tactics } : imported.tactics,
      terrains: state.terrains ? { ...state.terrains, ...imported.terrains } : imported.terrains
    }
}

export const reset = (state: AppState) => {
  resetMissing(state)
}
