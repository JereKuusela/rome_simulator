import { createAction } from 'typesafe-actions'
import { List } from 'immutable'
import { UnitType } from '../units'
import { DefinitionType } from '../../base_definition'

export enum ModifierType {
  Text = 'Text',
  Siege = 'Siege',
  Fort = 'Fort'
}

export enum GovermentType {
  Republic = 'Republic',
  Monarch = 'Monarch',
  Tribe = 'Tribe'
}

export enum ReligionType {
  Greek = 'Greek',
  Etc = 'Etc'
}

export enum TraditionType {
  Celtic = 'Celtic',
  Greek = 'Greek',
  Latin = 'Latin',
  Levantine = 'Levantine',
  Mauryan = 'Mauryan',
  NorthAfrican = 'North African',
  Persian = 'Persian'
}

export enum CountryName {
  Country1 = 'Country 1',
  Country2 = 'Country 2'
}


export interface Modifier {
  readonly type: UnitType | DefinitionType | ModifierType
  readonly attribute: string
  readonly value: number
}
export interface Tradition {
  readonly name: string
  readonly modifiers: List<Modifier>
}
export interface Path {
  readonly name: string
  readonly traditions: List<Tradition>
}
export interface TraditionDefinition {
  readonly type: TraditionType
  readonly paths: List<Path>
}



export const deleteCountry = createAction('@@countries/DELETE_COUNTRY', action => {
  return (country: CountryName) => action({ country })
})

export const createCountry = createAction('@@countries/CREATE_COUNTRY', action => {
  return (country: CountryName, source_country?: CountryName) => action({ country, source_country })
})

export const changeCountryName = createAction('@@countries/CHANGE_COUNTRY_NAME', action => {
  return (old_country: CountryName, country: CountryName) => action({ old_country, country })
})

export const enableTradition = createAction('@@countries/ENABLE_TRADITION', action => {
  return (country: CountryName, key: string, tradition: Tradition) => action({ country, key, tradition })
})

export const clearTradition = createAction('@@countries/CLEAR_TRADITION', action => {
  return (country: CountryName, key: string) => action({ country, key })
})

export const selectGovernment = createAction('@@countries/SELECT_GOVERNMENT', action => {
  return (country: CountryName, government: GovermentType) => action({ country, government })
})

export const selectReligion = createAction('@@countries/SELECT_RELIGION', action => {
  return (country: CountryName, religion: ReligionType) => action({ country, religion })
})
