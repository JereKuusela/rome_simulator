import { createReducer } from 'typesafe-actions'
import { OrderedMap, Map } from 'immutable'
import { CombatParameter, changeParameter, toggleSimpleMode, toggleMode, selectCountry } from './actions'
import { getDefaultLandSettings, getDefaultNavalSettings, getDefaultAnySettings } from './data'
import { CountryName, changeCountryName, createCountry, deleteCountry } from '../countries'
import { DefinitionType } from '../../base_definition'

export const settingsState = {
  combat: Map<DefinitionType, OrderedMap<CombatParameter, number>>()
    .set(DefinitionType.Global, getDefaultAnySettings())
    .set(DefinitionType.Land, getDefaultLandSettings())
    .set(DefinitionType.Naval, getDefaultNavalSettings()),
    simple_mode: true,
    mode: DefinitionType.Land,
    country: CountryName.Country1
}


export const settingsReducer = createReducer(settingsState)
  .handleAction(changeParameter, (state, action: ReturnType<typeof changeParameter>) => (
    { ...state, combat: state.combat.setIn([action.payload.mode, action.payload.key], action.payload.value) }
  ))
  .handleAction(toggleSimpleMode, (state, action: ReturnType<typeof toggleSimpleMode>) => (
    { ...state, simple_mode: !state.simple_mode }
  ))
  .handleAction(toggleMode, (state, action: ReturnType<typeof toggleMode>) => (
    { ...state, mode: state.mode === DefinitionType.Land ? DefinitionType.Naval : DefinitionType.Land }
  ))
  .handleAction(selectCountry, (state, action: ReturnType<typeof selectCountry>) => (
    { ...state, country: action.payload.country }
  ))
  .handleAction(changeCountryName, (state, action: ReturnType<typeof changeCountryName>) => (
    { ...state, country: state.country === action.payload.old_country ? action.payload.country : state.country }
  ))
  .handleAction(createCountry, (state, action: ReturnType<typeof createCountry>) => (
    { ...state, country: action.payload.country }
  ))
  .handleAction(deleteCountry, (state, action: ReturnType<typeof deleteCountry>) => (
    { ...state, country: state.country === action.payload.country ? '' as CountryName : state.country }
  ))
