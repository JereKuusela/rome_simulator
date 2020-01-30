import { ImmerReducer, createActionCreators, createReducerFunction, Actions } from 'immer-reducer'

import { has } from 'utils'
import { DefinitionType, Mode, CountryName, Side, SimulationSpeed, CombatSettings, SiteSettings, Setting, SettingsAndOptions, WearinessAttribute } from 'types'
import { createCountry, deleteCountry, changeCountryName } from './countries'
import { getDefaultSettings, speedValues } from 'data'

class SettingsReducer extends ImmerReducer<SettingsAndOptions> {

  changeCombatParameter(mode: Mode, key: keyof CombatSettings, value: number | boolean | string) {
    this.draftState.combatSettings[mode][key] = value as never
  }

  changeSiteParameter(key: keyof SiteSettings, value: number | boolean | string) {
    if (key === Setting.Performance && typeof value === 'string' && speedValues[value]) {
      this.draftState.siteSettings[Setting.PhaseLengthMultiplier] = speedValues[value][0]
      this.draftState.siteSettings[Setting.MaxDepth] = speedValues[value][1]
    }
    if (key === Setting.PhaseLengthMultiplier || key === Setting.MaxDepth) {
      this.draftState.siteSettings[Setting.Performance] = SimulationSpeed.Custom
    }
    this.draftState.siteSettings[key] = value as never
  }

  toggleMode() {
    this.draftState.mode = this.state.mode === DefinitionType.Land ? DefinitionType.Naval : DefinitionType.Land
  }

  selectCountry(country: CountryName) {
    this.draftState.country = country
  }

  changeCountryName(old_country: CountryName, country: CountryName) {
    if (this.state.country === old_country)
      this.selectCountry(country)
  }

  createCountry(country: CountryName) {
    this.selectCountry(country)
  }

  deleteCountry(country: CountryName) {
    if (this.state.country === country)
      this.selectCountry('' as CountryName)
  }

  toggleAccordion(key: string) {
    if (has(this.state.accordions, key))
      delete this.draftState.accordions[key]
    else
      this.draftState.accordions[key] = true
  }

  changeWeariness(side: Side, type: WearinessAttribute, min: number, max: number) {
    this.draftState.weariness[side][type].min = min
    this.draftState.weariness[side][type].max = max
  }
}

const actions = createActionCreators(SettingsReducer)

export const changeCombatParameter = actions.changeCombatParameter
export const changeSiteParameter = actions.changeSiteParameter
export const selectCountry = actions.selectCountry
export const toggleAccordion = actions.toggleAccordion
export const toggleMode = actions.toggleMode
export const changeWeariness = actions.changeWeariness

export const reducer = createReducerFunction(SettingsReducer, getDefaultSettings())

export const settingsReducer = (state = getDefaultSettings(), action: Actions<typeof SettingsReducer>) => {
  if (action.type === createCountry.type)
    return reducer(state, { payload: action.payload, type: actions.createCountry.type, args: true } as any)
  if (action.type === deleteCountry.type)
    return reducer(state, { payload: action.payload, type: actions.deleteCountry.type })
  if (action.type === changeCountryName.type)
    return reducer(state, { payload: action.payload, type: actions.changeCountryName.type, args: true } as any)
  return reducer(state, action)
}
