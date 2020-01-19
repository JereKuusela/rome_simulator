import { ImmerReducer, createActionCreators, createReducerFunction } from 'immer-reducer'
import { GovermentType, ReligionType, CultureType, Modifier, ScopeType } from '../data'
import { ObjSet, map } from '../../utils'
import { ValueType, GeneralCalc, UnitCalc, UnitType } from '../units'
import { regenerateValues, ValuesType, calculateValue, clearAllValues, BaseDefinitionValues, DefinitionValues, addValues } from '../../definition_values'
import { DefinitionType } from '../../base_definition'

export enum CountryName {
  Country1 = 'Country 1',
  Country2 = 'Country 2'
}


export interface General extends BaseDefinitionValues<GeneralCalc> {
  enabled: boolean
  definitions: { [key in UnitType | DefinitionType]: DefinitionValues<ValueType> }
}

export interface Country {
  selections: ObjSet
  culture: CultureType
  government: GovermentType
  religion: ReligionType
  omen_power: number
  military_power: number
  office_discipline: number
  office_morale: number
  general: General
}

export const defaultCountry: Country =
{
  selections: {},
  government: GovermentType.Republic,
  religion: 'Hellenic' as ReligionType,
  culture: CultureType.Greek,
  omen_power: 100,
  general: {
    enabled: true,
    definitions: {} as any
  },
  military_power: 0,
  office_discipline: 0,
  office_morale: 0
}

export const getDefaultCountryDefinitions = (): { [key in CountryName]: Country } => ({
  [CountryName.Country1]: defaultCountry,
  [CountryName.Country2]: defaultCountry
})

const countryDefinitions = getDefaultCountryDefinitions()

const BASE_MARTIAL_KEY = 'Base stat'

class CountriesReducer extends ImmerReducer<typeof countryDefinitions> {


  createCountry(country: CountryName, source_country?: CountryName) {
    this.draftState[country] = source_country ? this.state[source_country] : defaultCountry
  }

  deleteCountry(country: CountryName) {
    delete this.draftState[country]
  }

  changeCountryName(old_country: CountryName, country: CountryName) {
    delete Object.assign(this.draftState, { [country]: this.state[old_country] })[old_country]
  }

  setGeneralMartial(country: CountryName, value: number) {
    this.enableModifiers(country, BASE_MARTIAL_KEY, [{
      target: 'General',
      type: ValuesType.Base,
      scope: ScopeType.Army,
      attribute: GeneralCalc.Martial,
      value
    }])
  }

  enableModifiers(country: CountryName, key: string, modifiers: Modifier[]) {
    this.draftState[country].selections[key] = true

    modifiers = modifiers.filter(value => value.scope === ScopeType.Army)
    const definitions = map(this.state[country].general.definitions, definition => clearAllValues(definition, key))
    const otherModifiers = modifiers.filter(value => value.attribute !== GeneralCalc.Martial)

    otherModifiers.forEach(modifier => {
      const type = modifier.target as UnitType | DefinitionType
      if (!definitions[type])
        definitions[type] = {}
      if (modifier.type === ValuesType.Modifier)
        definitions[type] = addValues(definitions[type], ValuesType.Modifier, key, [[modifier.attribute, modifier.value]])
      else
        definitions[type] = addValues(definitions[type], ValuesType.Base, key, [[modifier.attribute, modifier.value]])
    })

    let definition = clearAllValues(this.state[country].general, key)
    const generalModifiers = modifiers.filter(value => value.attribute === GeneralCalc.Martial)
    const generalValues = generalModifiers.map(value => [value.attribute, value.value] as [ValueType, number])
    definition = regenerateValues(definition, ValuesType.Base, key, generalValues)
    const martial = calculateValue(definition, GeneralCalc.Martial)
    if (!definitions[DefinitionType.Naval])
        definitions[DefinitionType.Naval] = {}
    definitions[DefinitionType.Naval] = addValues(definitions[DefinitionType.Naval], ValuesType.Base, GeneralCalc.Martial, [[UnitCalc.CaptureChance, 0.002 * martial]])
    definition.definitions = definitions
    this.draftState[country].general = definition
  }

  clearModifiers(country: CountryName, key: string) {
    delete this.draftState[country].selections[key]
    
    const definition = clearAllValues(this.state[country].general, key)
    const definitions = map(this.state[country].general.definitions, definition => clearAllValues(definition, key))
    definition.definitions = definitions
    this.draftState[country].general = definition
  }

  selectGovernment(country: CountryName, government: GovermentType) {
    this.draftState[country].government = government
  }

  selectReligion(country: CountryName, religion: ReligionType) {
    this.draftState[country].religion = religion
  }

  selectCulture(country: CountryName, culture: CultureType) {
    this.draftState[country].culture = culture
  }

  setOmenPower(country: CountryName, omen_power: number) {
    this.draftState[country].omen_power = omen_power
  }

  setHasGeneral(country: CountryName, has_general: boolean) {
    this.draftState[country].general.enabled = has_general
  }

  setMilitaryPower(country: CountryName, military_power: number) {
    this.draftState[country].military_power = military_power
  }

  setOfficeDiscipline(country: CountryName, office_discipline: number) {
    this.draftState[country].office_discipline = office_discipline
  }

  setOfficeMorale(country: CountryName, office_morale: number) {
    this.draftState[country].office_morale = office_morale
  }
}
const actions = createActionCreators(CountriesReducer)

export const createCountry = actions.createCountry
export const deleteCountry = actions.deleteCountry
export const changeCountryName = actions.changeCountryName
export const setGeneralMartial = actions.setGeneralMartial
export const enableModifiers = actions.enableModifiers
export const clearModifiers = actions.clearModifiers
export const selectGovernment = actions.selectGovernment
export const selectReligion = actions.selectReligion
export const selectCulture = actions.selectCulture
export const setOmenPower = actions.setOmenPower
export const setHasGeneral = actions.setHasGeneral
export const setMilitaryPower = actions.setMilitaryPower
export const setOfficeDiscipline = actions.setOfficeDiscipline
export const setOfficeMorale = actions.setOfficeMorale

export const selectionsReducer = createReducerFunction(CountriesReducer, countryDefinitions)

