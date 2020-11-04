import { saveAs } from 'file-saver'
import { AppState, stripRounds, resetMissing, resetAll } from 'state'
import { Mode, ExportKey, ExportKeys, TransferState } from 'types'

const filterState = (state: AppState, exportKeys?: ExportKeys): any => {
  const filtered: any = { ...state }
  filtered._persist = undefined
  filtered.transfer = undefined
  filtered.data = undefined
  filtered.ui = undefined
  filtered.battle = stripRounds(filtered.battle)
  if (exportKeys && !exportKeys[ExportKey.Countries]) filtered.countries = undefined
  if (exportKeys && !exportKeys[ExportKey.Terrains]) filtered.terrains = undefined
  if (exportKeys && !exportKeys[ExportKey.Tactics]) filtered.tactics = undefined
  if (exportKeys && !exportKeys[ExportKey.Settings]) filtered.settings = undefined
  if (exportKeys && !exportKeys[ExportKey.Land]) delete filtered.battle[Mode.Land]
  if (exportKeys && !exportKeys[ExportKey.Naval]) delete filtered.battle[Mode.Naval]
  if (exportKeys && !exportKeys[ExportKey.Land] && !exportKeys[ExportKey.Naval]) filtered.battle = undefined
  return filtered
}

export const exportState = (state: AppState, exportKeys?: ExportKeys): string =>
  JSON.stringify(filterState(state, exportKeys), undefined, 2)

const pad = (value: number) => String(value).padStart(2, '0')

export const saveToFile = (data: string) => {
  const blob = new Blob([data], { type: 'text/plain;charset=utf-8' })
  const date = new Date()
  const formatted =
    date.getFullYear() +
    '-' +
    pad(date.getMonth()) +
    '-' +
    pad(date.getDate()) +
    '_' +
    pad(date.getHours()) +
    '-' +
    pad(date.getMinutes()) +
    '-' +
    pad(date.getSeconds())
  saveAs(blob, 'imperator-simulator_' + formatted + '.json')
}

export const setExportKey = (transfer: TransferState, key: ExportKey, value: boolean) => {
  transfer.exportKeys[key] = value
}

export const setResetMissing = (transfer: TransferState, value: boolean) => {
  transfer.resetMissing = value
}

export const resetState = (state: AppState) => {
  resetAll(state)
}

const combine = (a: any, b: any) => ({ ...(a ?? {}), ...(b ?? {}) })

export const importState = (state: AppState, imported: any, resetMissing: boolean) => {
  if (resetMissing) {
    resetMissingState(imported)
  }
  state.battle = combine(state.battle, imported.battle)
  state.countries = combine(state.countries, imported.countries)
  state.settings = combine(state.settings, imported.settings)
  state.tactics = combine(state.tactics, imported.tactics)
  state.terrains = combine(state.terrains, imported.terrains)
}

export const resetMissingState = (state: AppState) => {
  resetMissing(state)
}
