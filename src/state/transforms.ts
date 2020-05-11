import { getDefaultTactic, getDefaultTerrain, getDefaultUnit, getDefaultSettings } from 'data'
import { map } from 'utils'
import { mergeValues, clearAllValues } from 'definition_values'
import { ModeState, TacticDefinitions, TerrainDefinitions, SettingsAndOptions, UnitDefinitions } from 'types'



export const restoreDefaultTactics = (state: TacticDefinitions): TacticDefinitions => map(state, definition => mergeValues(clearAllValues(definition, definition.type), getDefaultTactic(definition.type)))
export const restoreDefaultTerrains = (state: TerrainDefinitions): TerrainDefinitions => map(state, definition => mergeValues(clearAllValues(definition, definition.type), getDefaultTerrain(definition.type)))
export const restoreDefaultUnits = (state: UnitDefinitions): UnitDefinitions => map(state, definition => mergeValues(clearAllValues(definition, definition.type), getDefaultUnit(definition.type)))
export const restoreDefaultSettings = (state: SettingsAndOptions): SettingsAndOptions => {
  const defaultSettings = getDefaultSettings()
  return { ...defaultSettings, ...state, siteSettings: { ...defaultSettings.siteSettings, ...state.siteSettings }, combatSettings: map(defaultSettings.combatSettings, ((_, mode) => ({ ...defaultSettings.combatSettings[mode], ...state.combatSettings[mode] }))) }
}

export const stripRounds = (battle: ModeState): ModeState => map(battle, value => ({ ...value, outdated: false, timestamp: 0, sides: map(value.sides, value => ({ ...value, rounds: [] })) }))
