import { getDefaultTactic, getDefaultTerrain, getDefaultUnit, getDefaultSettings } from 'data'
import { map } from 'utils'
import { mergeValues, clearAllValues } from 'data_values'
import { ModeState, TacticsData, TerrainsData, Settings, UnitsData } from 'types'

export const restoreDefaultTactics = (state: TacticsData): TacticsData =>
  map(state, definition => mergeValues(clearAllValues(definition, definition.type), getDefaultTactic(definition.type)))
export const restoreDefaultTerrains = (state: TerrainsData): TerrainsData =>
  map(state, definition => mergeValues(clearAllValues(definition, definition.type), getDefaultTerrain(definition.type)))
export const restoreDefaultUnits = (state: UnitsData): UnitsData =>
  map(state, definition => mergeValues(clearAllValues(definition, definition.type), getDefaultUnit(definition.type)))
export const restoreDefaultSettings = (state: Settings): Settings => {
  const defaultSettings = getDefaultSettings()
  return {
    ...defaultSettings,
    ...state,
    sharedSettings: { ...defaultSettings.sharedSettings, ...state.sharedSettings },
    modeSettings: map(defaultSettings.modeSettings, (_, mode) => ({
      ...defaultSettings.modeSettings[mode],
      ...state.modeSettings[mode]
    }))
  }
}

export const stripRounds = (battle: ModeState): ModeState =>
  map(battle, value => ({
    ...value,
    outdated: false,
    timestamp: 0,
    sides: map(value.sides, value => ({ ...value, days: [] }))
  }))
