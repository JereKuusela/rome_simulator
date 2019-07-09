import { createReducer } from 'typesafe-actions'
import { OrderedMap, Map, Set } from 'immutable'
import { CombatParameter, changeParameter, toggleSimpleMode, toggleMode, selectCountry, selectArmy, toggleAccordion } from './actions'
import { getDefaultLandSettings, getDefaultNavalSettings, getDefaultAnySettings } from './data'
import { CountryName, changeCountryName, createCountry, deleteCountry } from '../countries'
import { ArmyName } from '../battle'
import { changeArmyName, createArmy, deleteArmy } from '../armies'
import { DefinitionType } from '../../base_definition'

export const settingsState = {
  combat: Map<DefinitionType, OrderedMap<CombatParameter, number>>()
    .set(DefinitionType.Global, getDefaultAnySettings())
    .set(DefinitionType.Land, getDefaultLandSettings())
    .set(DefinitionType.Naval, getDefaultNavalSettings()),
    simple_mode: true,
    mode: DefinitionType.Land,
    army: ArmyName.Attacker,
    country: CountryName.Country1,
    accordions: Set<string>()
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
  .handleAction(selectArmy, (state, action: ReturnType<typeof selectArmy>) => (
    { ...state, army: action.payload.army }
  ))
  .handleAction(changeArmyName, (state, action: ReturnType<typeof changeArmyName>) => (
    { ...state, army: state.army === action.payload.old_army ? action.payload.army : state.army }
  ))
  .handleAction(createArmy, (state, action: ReturnType<typeof createArmy>) => (
    { ...state, army: action.payload.army }
  ))
  .handleAction(deleteArmy, (state, action: ReturnType<typeof deleteArmy>) => (
    { ...state, army: state.army === action.payload.army ? '' as ArmyName : state.army }
  ))
  .handleAction(toggleAccordion, (state, action: ReturnType<typeof toggleAccordion>) => (
    { ...state, accordions: state.accordions.has(action.payload.key) ? state.accordions.remove(action.payload.key) : state.accordions.add(action.payload.key) }
  ))
