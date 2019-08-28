import { OrderedMap, Map, Set } from 'immutable'
import { ImmerReducer, createActionCreators, createReducerFunction, Actions } from 'immer-reducer'
import { CombatParameter } from './actions'
import { getDefaultLandSettings, getDefaultNavalSettings, getDefaultAnySettings } from './data'
import { CountryName, createCountry, deleteCountry, changeCountryName } from '../countries'
import { DefinitionType } from '../../base_definition'
import { toggle } from '../../utils'

export const settingsState = {
  combat: Map<DefinitionType, OrderedMap<CombatParameter, number>>()
    .set(DefinitionType.Global, getDefaultAnySettings())
    .set(DefinitionType.Land, getDefaultLandSettings())
    .set(DefinitionType.Naval, getDefaultNavalSettings()),
  simple_mode: true,
  mode: DefinitionType.Land,
  country: CountryName.Country1,
  accordions: Set<string>()
}

class SettingsReducer extends ImmerReducer<typeof settingsState> {

  changeParameter(mode: DefinitionType, key: CombatParameter, value: number) {
    this.draftState.combat = this.state.combat.update(mode, item => item.set(key, value))
  }

  toggleSimpleMode() {
    this.draftState.simple_mode = !this.state.simple_mode
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
    this.draftState.accordions = toggle(this.state.accordions, key)
  }
}

const actions = createActionCreators(SettingsReducer)

export const changeParameter = actions.changeParameter
export const selectCountry = actions.selectCountry
export const toggleAccordion = actions.toggleAccordion
export const toggleMode = actions.toggleMode
export const toggleSimpleMode = actions.toggleSimpleMode

export const reducer = createReducerFunction(SettingsReducer, settingsState)

export const settingsReducer = (state = settingsState, action: Actions<typeof SettingsReducer>) => {
  if (action.type === createCountry.type)
    return reducer(state, { payload: action.payload, type: actions.createCountry.type })
  if (action.type === deleteCountry.type)
    return reducer(state, { payload: action.payload, type: actions.deleteCountry.type })
  if (action.type === changeCountryName.type)
    return reducer(state, { payload: action.payload, type: actions.changeCountryName.type })
  return reducer(state, action)
}
