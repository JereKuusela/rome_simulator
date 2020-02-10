import produce from 'immer'
import { getDefaultTactic, getDefaultTerrain, getDefaultUnit, getDefaultSettings } from 'data'
import { map, forEach } from 'utils'
import { mergeValues, clearAllValues } from 'definition_values'
import { getNextId } from 'army_utils'
import { ModeState, Tactics, Terrains, UnitState, Countries, SettingsAndOptions } from 'types'



export const restoreBaseTactics = (state: Tactics): Tactics => map(state, (tactic, type) => mergeValues(clearAllValues(tactic, type), getDefaultTactic(type)))
export const restoreBaseTerrains = (state: Terrains): Terrains => map(state, (terrain, type) => mergeValues(clearAllValues(terrain, type), getDefaultTerrain(type)))
export const restoreBaseUnits = (state: UnitState): UnitState => map(state, definitions => map(definitions, (unit, type) => mergeValues(clearAllValues(unit, type), getDefaultUnit(type))))
export const restoreBaseSettings = (state: SettingsAndOptions): SettingsAndOptions => {
  const base = getDefaultSettings()
  return { ...base, ...state, siteSettings: { ...base.siteSettings, ...state.siteSettings }, combatSettings: map(base.combatSettings, ((_, mode) => ({ ...base.combatSettings[mode], ...state.combatSettings[mode] }))) }
}

export const stripRounds = (battle: ModeState): ModeState => map(battle, value => ({ ...value, outdated: true, participants: map(value.participants, value => ({ ...value, rounds: [] })) }))

export const setIds = (countries: Countries): Countries => {
  return produce(countries, countries => {
    forEach(countries, country => forEach(country.armies, mode => forEach(mode, army => {
      army.frontline.forEach(unit => unit ? unit.id = getNextId() : {})
      army.reserve.forEach(unit => unit.id = getNextId())
      army.defeated.forEach(unit => unit.id = getNextId())
    })))
  })
}
