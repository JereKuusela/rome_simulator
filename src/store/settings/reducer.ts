import { ImmerReducer, createActionCreators, createReducerFunction, Actions } from 'immer-reducer'
import { CombatParameter } from './actions'
import { getDefaultLandSettings, getDefaultNavalSettings } from './data'
import { CountryName, createCountry, deleteCountry, changeCountryName } from '../countries'
import { DefinitionType, Mode } from '../../base_definition'
import { ObjSet, has } from '../../utils'

export type Settings = { [key in CombatParameter]: number }

export const getDefaultSettings = () => ({
  combat: {[DefinitionType.Land]: getDefaultLandSettings(), [DefinitionType.Naval]: getDefaultNavalSettings()},
  simple_mode: true,
  mode: DefinitionType.Land as Mode,
  country: CountryName.Country1,
  accordions: {} as ObjSet
})

const settings = getDefaultSettings()

class SettingsReducer extends ImmerReducer<typeof settings> {

  changeParameter(mode: Mode, key: CombatParameter, value: number) {
    this.draftState.combat[mode][key] = value
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
    if (has(this.state.accordions, key))
      delete this.draftState.accordions[key]
    else
      this.draftState.accordions[key] = true
  }
}

const actions = createActionCreators(SettingsReducer)

export const changeParameter = actions.changeParameter
export const selectCountry = actions.selectCountry
export const toggleAccordion = actions.toggleAccordion
export const toggleMode = actions.toggleMode
export const toggleSimpleMode = actions.toggleSimpleMode

export const reducer = createReducerFunction(SettingsReducer, settings)

export const settingsReducer = (state = settings, action: Actions<typeof SettingsReducer>) => {
  if (action.type === createCountry.type)
    return reducer(state, { payload: action.payload, type: actions.createCountry.type, args: true } as any)
  if (action.type === deleteCountry.type)
    return reducer(state, { payload: action.payload, type: actions.deleteCountry.type })
  if (action.type === changeCountryName.type)
    return reducer(state, { payload: action.payload, type: actions.changeCountryName.type, args: true } as any)
  return reducer(state, action)
}
