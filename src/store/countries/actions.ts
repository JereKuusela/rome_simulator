import { createAction } from 'typesafe-actions'
import { List } from 'immutable'
import { UnitType } from '../units'
import { DefinitionType } from '../../base_definition'

export enum ModifierType {
  Text = 'Text',
  Siege = 'Siege',
  Fort = 'Fort'
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
  return (country: CountryName) => action({ country })
})

export const duplicateCountry = createAction('@@countries/DUPLICATE_COUNTRY', action => {
  return (old_country: CountryName, country: CountryName) => action({ old_country, country })
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
