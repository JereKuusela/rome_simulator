
import { Set, Map, List } from 'immutable'
import { ImmerReducer, createActionCreators, createReducerFunction } from 'immer-reducer'
import { GovermentType, ReligionType, CultureType, Modifier } from '../data'

export enum CountryName {
  Country1 = 'Country 1',
  Country2 = 'Country 2'
}

export interface Country {
  readonly selections: Set<string>
  readonly culture: CultureType
  readonly government: GovermentType
  readonly religion: ReligionType
  readonly omen_power: number
  readonly general_martial: number
  readonly trait_martial: Map<string, number>
  readonly has_general: boolean
  readonly military_power: number
  readonly office_discipline: number
  readonly office_morale: number
}

export const defaultCountry =
{
  selections: Set<string>(),
  government: GovermentType.Republic,
  religion: 'Hellenic' as ReligionType,
  culture: CultureType.Greek,
  omen_power: 100,
  general_martial: 0,
  trait_martial: Map<string, number>(),
  has_general: true,
  military_power: 0,
  office_discipline: 0,
  office_morale: 0
}

const selectionsState = Map<CountryName, Country>().set(CountryName.Country1, defaultCountry).set(CountryName.Country2, defaultCountry)

class CountriesReducer extends ImmerReducer<typeof selectionsState> {

  createCountry(country: CountryName, source_country?: CountryName) {
    this.draftState = this.state.set(country, this.state.get(source_country!, defaultCountry))
  }

  deleteCountry(country: CountryName) {
    this.draftState = this.state.delete(country)
  }

  changeCountryName(old_country: CountryName, country: CountryName) {
    this.draftState = this.state.mapKeys(key => key === old_country ? country : key)
  }

  enableModifiers(country: CountryName, key: string, modifiers: List<Modifier>) {
    const general_modifiers = modifiers.filter(value => value.target === 'General' && value.attribute === 'Martial').toMap().mapEntries(value => [key, value[1].value])
    this.draftState = this.state.update(country, defaultCountry, value => ({ ...value, selections: value.selections.add(key), trait_martial: value.trait_martial.merge(general_modifiers) }))
  }

  clearModifiers(country: CountryName, key: string) {
    this.draftState = this.state.update(country, defaultCountry, value => ({ ...value, selections: value.selections.remove(key), trait_martial: value.trait_martial.delete(key) }))
  }

  selectGovernment(country: CountryName, government: GovermentType) {
    this.draftState = this.state.update(country, defaultCountry, value => ({ ...value, government }))
  }

  selectReligion(country: CountryName, religion: ReligionType) {
    this.draftState = this.state.update(country, defaultCountry, value => ({ ...value, religion }))
  }

  selectCulture(country: CountryName, culture: CultureType) {
    this.draftState = this.state.update(country, defaultCountry, value => ({ ...value, culture }))
  }

  setOmenPower(country: CountryName, omen_power: number) {
    this.draftState = this.state.update(country, defaultCountry, value => ({ ...value, omen_power }))
  }

  setGeneralMartial(country: CountryName, general_martial: number) {
    this.draftState = this.state.update(country, defaultCountry, value => ({ ...value, general_martial }))
  }

  setHasGeneral(country: CountryName, has_general: boolean) {
    this.draftState = this.state.update(country, defaultCountry, value => ({ ...value, has_general }))
  }

  setMilitaryPower(country: CountryName, military_power: number) {
    this.draftState = this.state.update(country, defaultCountry, value => ({ ...value, military_power }))
  }

  setOfficeDiscipline(country: CountryName, office_discipline: number) {
    this.draftState = this.state.update(country, defaultCountry, value => ({ ...value, office_discipline }))
  }

  setOfficeMorale(country: CountryName, office_morale: number) {
    this.draftState = this.state.update(country, defaultCountry, value => ({ ...value, office_morale }))
  }
}
const actions = createActionCreators(CountriesReducer)

export const createCountry = actions.createCountry
export const deleteCountry = actions.deleteCountry
export const changeCountryName = actions.changeCountryName
export const enableModifiers = actions.enableModifiers
export const clearModifiers = actions.clearModifiers
export const selectGovernment = actions.selectGovernment
export const selectReligion = actions.selectReligion
export const selectCulture = actions.selectCulture
export const setOmenPower = actions.setOmenPower
export const setGeneralMartial = actions.setGeneralMartial
export const setHasGeneral = actions.setHasGeneral
export const setMilitaryPower = actions.setMilitaryPower
export const setOfficeDiscipline = actions.setOfficeDiscipline
export const setOfficeMorale = actions.setOfficeMorale

export const selectionsReducer = createReducerFunction(CountriesReducer, selectionsState)
