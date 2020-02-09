export enum ExportKey {
  Terrains = 'Terrain Definitions',
  Tactics = 'Tactic Definitions',
  Countries = 'Countries',
  Land = 'Land Armies',
  Naval = 'Naval Armies',
  Settings = 'Settings'
}

export type ExportKeys = { [key in ExportKey]: boolean }

export type TransferState = {
  export_keys: ExportKeys,
  reset_missing: boolean
}
