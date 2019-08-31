
import { List } from 'immutable'
import { ImmerReducer, createActionCreators, createReducerFunction } from 'immer-reducer'
import { GovermentType, ReligionType, CultureType, Modifier } from '../data'
import { objGet, ObjSet } from '../../utils'

export enum CountryName {
  Country1 = 'Country 1',
  Country2 = 'Country 2'
}

export interface Country {
  readonly selections: ObjSet
  readonly culture: CultureType
  readonly government: GovermentType
  readonly religion: ReligionType
  readonly omen_power: number
  readonly general_martial: number
  readonly trait_martial: { [key: string]: number }
  readonly has_general: boolean
  readonly military_power: number
  readonly office_discipline: number
  readonly office_morale: number
}

export const defaultCountry: Country =
{
  selections: {},
  government: GovermentType.Republic,
  religion: 'Hellenic' as ReligionType,
  culture: CultureType.Greek,
  omen_power: 100,
  general_martial: 0,
  trait_martial: {},
  has_general: true,
  military_power: 0,
  office_discipline: 0,
  office_morale: 0
}

export const countriesState: { [key in CountryName]: Country } = {
  [CountryName.Country1]: defaultCountry,
  [CountryName.Country2]: defaultCountry
}

class CountriesReducer extends ImmerReducer<typeof countriesState> {

  createCountry(country: CountryName, source_country?: CountryName) {
    this.draftState[country] = objGet(this.state, source_country, defaultCountry)
  }

  deleteCountry(country: CountryName) {
    delete this.draftState[country]
  }

  changeCountryName(old_country: CountryName, country: CountryName) {
    delete Object.assign(this.draftState, {[country]: this.state[old_country] })[old_country]
  }

  enableModifiers(country: CountryName, key: string, modifiers: List<Modifier>) {
    const general_modifiers = modifiers.filter(value => value.target === 'General' && value.attribute === 'Martial').toMap().mapEntries(value => [key, value[1].value])
    createCountry(country, country)
    this.draftState[country].selections[key] = true
    this.draftState[country].trait_martial = { ...this.draftState[country].trait_martial, ...general_modifiers.toJS() as any }
  }

  clearModifiers(country: CountryName, key: string) {
    createCountry(country, country)
    delete this.draftState[country].selections[key]
    delete this.draftState[country].trait_martial[key]
  }

  selectGovernment(country: CountryName, government: GovermentType) {
    createCountry(country, country)
    this.draftState[country].government = government
  }

  selectReligion(country: CountryName, religion: ReligionType) {
    createCountry(country, country)
    this.draftState[country].religion = religion
  }

  selectCulture(country: CountryName, culture: CultureType) {
    createCountry(country, country)
    this.draftState[country].culture = culture
  }

  setOmenPower(country: CountryName, omen_power: number) {
    createCountry(country, country)
    this.draftState[country].omen_power = omen_power
  }

  setGeneralMartial(country: CountryName, general_martial: number) {
    createCountry(country, country)
    this.draftState[country].general_martial = general_martial
  }

  setHasGeneral(country: CountryName, has_general: boolean) {
    createCountry(country, country)
    this.draftState[country].has_general = has_general
  }

  setMilitaryPower(country: CountryName, military_power: number) {
    createCountry(country, country)
    this.draftState[country].military_power = military_power
  }

  setOfficeDiscipline(country: CountryName, office_discipline: number) {
    createCountry(country, country)
    this.draftState[country].office_discipline = office_discipline
  }

  setOfficeMorale(country: CountryName, office_morale: number) {
    createCountry(country, country)
    this.draftState[country].office_morale = office_morale
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

export const selectionsReducer = createReducerFunction(CountriesReducer, countriesState)

