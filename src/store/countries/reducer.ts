import { createReducer } from 'typesafe-actions'
import { Set, Map, OrderedMap } from 'immutable'
import {
  CountryName,
  deleteCountry, createCountry, changeCountryName, enableModifiers, clearModifiers,
  selectGovernment, selectReligion, setOmenPower, selectCulture, setGeneralMartial, toggleHasGeneral
} from './actions'
import { GovermentType, ReligionType, CultureType } from '../data'

export interface Selections {
  selections: Set<string>,
  culture: CultureType,
  government: GovermentType,
  religion: ReligionType,
  omen_power: number,
  general_martial: number,
  trait_martial:  Map<string, OrderedMap<string, number>>,
  has_general: boolean
}

const getDefaultSelections = () => (
  {
    selections: Set<string>(),
    government: GovermentType.Republic,
    religion: 'Hellenic' as ReligionType,
    culture: CultureType.Greek,
    omen_power: 100,
    general_martial: 0,
    trait_martial: Map<string, OrderedMap<string, number>>(),
    has_general: true
  }
)

const selectionsState = Map<CountryName, Selections>().set(CountryName.Country1, getDefaultSelections()).set(CountryName.Country2, getDefaultSelections())


export const selectionsReducer = createReducer(selectionsState)
  .handleAction(createCountry, (state, action: ReturnType<typeof createCountry>) => (
    state.set(action.payload.country, state.get(action.payload.source_country!, getDefaultSelections()))
  ))
  .handleAction(deleteCountry, (state, action: ReturnType<typeof deleteCountry>) => (
    state.delete(action.payload.country)
  ))
  .handleAction(changeCountryName, (state, action: ReturnType<typeof changeCountryName>) => (
    state.mapKeys(key => key === action.payload.old_country ? action.payload.country : key)
  ))
  .handleAction(enableModifiers, (state, action: ReturnType<typeof enableModifiers>) => (
    state.update(action.payload.country, value => ({ ...value, selections: value.selections.add(action.payload.key) }))
  ))
  .handleAction(clearModifiers, (state, action: ReturnType<typeof clearModifiers>) => (
    state.update(action.payload.country, value => ({ ...value, selections: value.selections.remove(action.payload.key) }))
  ))
  .handleAction(selectGovernment, (state, action: ReturnType<typeof selectGovernment>) => (
    state.update(action.payload.country, value => ({ ...value, government: action.payload.government }))
  ))
  .handleAction(selectReligion, (state, action: ReturnType<typeof selectReligion>) => (
    state.update(action.payload.country, value => ({ ...value, religion: action.payload.religion }))
  ))
  .handleAction(selectCulture, (state, action: ReturnType<typeof selectCulture>) => (
    state.update(action.payload.country, value => ({ ...value, culture: action.payload.culture }))
  ))
  .handleAction(setOmenPower, (state, action: ReturnType<typeof setOmenPower>) => (
    state.update(action.payload.country, value => ({ ...value, omen_power: action.payload.power }))
  ))
  .handleAction(setGeneralMartial, (state, action: ReturnType<typeof setGeneralMartial>) => (
    state.update(action.payload.country, value => ({ ...value, general_martial: action.payload.skill }))
  ))
  .handleAction(toggleHasGeneral, (state, action: ReturnType<typeof toggleHasGeneral>) => (
    state.update(action.payload.country, value => ({ ...value, has_general: !value.has_general }))
  ))
  .handleAction(enableModifiers, (state, action: ReturnType<typeof enableModifiers>) => {
    let next = state.get(action.payload.country)!
    if (!next)
      return state
    /*const change = action.payload.modifiers.filter(value => value.target === DefinitionType.Land || value.target === DefinitionType.Global)
    const baseLandValues = landValues.filter(value => value.type !== ValuesType.Modifier).map(value => [value.attribute, value.value] as [ValueType, number]).toArray()
    const modifierLandValues = landValues.filter(value => value.type === ValuesType.Modifier).map(value => [value.attribute, value.value] as [ValueType, number]).toArray()
    const navalValues = action.payload.modifiers.filter(value => value.target === DefinitionType.Naval || value.target === DefinitionType.Global)
    const baseNavalValues = navalValues.filter(value => value.type !== ValuesType.Modifier).map(value => [value.attribute, value.value] as [ValueType, number]).toArray()
    const modifierNavalValues = navalValues.filter(value => value.type === ValuesType.Modifier).map(value => [value.attribute, value.value] as [ValueType, number]).toArray()
    next = next.update(DefinitionType.Land, stats => regenerateValues(stats, ValuesType.Base, action.payload.key, baseLandValues))
    next = next.update(DefinitionType.Land, stats => regenerateValues(stats, ValuesType.Modifier, action.payload.key, modifierLandValues))
    next = next.update(DefinitionType.Naval, stats => regenerateValues(stats, ValuesType.Base, action.payload.key, baseNavalValues))
    next = next.update(DefinitionType.Naval, stats => regenerateValues(stats, ValuesType.Modifier, action.payload.key, modifierNavalValues))*/
    return state.set(action.payload.country, next)
  })
