import produce from 'immer'
import { getDefaultTactic, getDefaultTerrain, getDefaultUnit, getDefaultSettings } from 'data'
import { map, forEach } from 'utils'
import { mergeValues, clearAllValues } from 'definition_values'
import { getNextId } from 'army_utils'
import { ModeState, TacticDefinitions, TerrainDefinitions, Countries, SettingsAndOptions, UnitDefinitions } from 'types'



export const restoreDefaultTactics = (state: TacticDefinitions): TacticDefinitions => map(state, definition => mergeValues(clearAllValues(definition, definition.type), getDefaultTactic(definition.type)))
export const restoreDefaultTerrains = (state: TerrainDefinitions): TerrainDefinitions => map(state, definition => mergeValues(clearAllValues(definition, definition.type), getDefaultTerrain(definition.type)))
export const restoreDefaultUnits = (state: UnitDefinitions): UnitDefinitions => map(state, definition => mergeValues(clearAllValues(definition, definition.type), getDefaultUnit(definition.type)))
export const restoreDefaultSettings = (state: SettingsAndOptions): SettingsAndOptions => {
  const defaultSettings = getDefaultSettings()
  return { ...defaultSettings, ...state, siteSettings: { ...defaultSettings.siteSettings, ...state.siteSettings }, combatSettings: map(defaultSettings.combatSettings, ((_, mode) => ({ ...defaultSettings.combatSettings[mode], ...state.combatSettings[mode] }))) }
}

export const stripRounds = (battle: ModeState): ModeState => map(battle, value => ({ ...value, outdated: true, timestamp: 0, participants: map(value.participants, value => ({ ...value, rounds: [] })) }))

export const setIds = (countries: Countries): Countries => {
  return produce(countries, countries => {
    forEach(countries, country => forEach(country.armies, mode => forEach(mode, army => {
      forEach(army.frontline, row => forEach(row, unit => unit.id = getNextId()))
      army.reserve.forEach(unit => unit.id = getNextId())
      army.defeated.forEach(unit => unit.id = getNextId())
    })))
  })
}
