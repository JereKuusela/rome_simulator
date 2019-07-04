import { createAction } from 'typesafe-actions'
import { List } from 'immutable'
import { UnitType } from '../units'
import { DefinitionType, ValuesType } from '../../base_definition'

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

export enum TradeType {
  Country = 'Country',
  Export = 'Export',
  Province = 'Province',
  Capital = 'Capital'
}

export enum CountryName {
  Country1 = 'Country 1',
  Country2 = 'Country 2'
}


export interface Modifier {
  readonly target: UnitType | DefinitionType | ModifierType
  readonly attribute: string
  readonly type?: ValuesType
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
export interface TradeDefinition {
  readonly name: string
  readonly type: TradeType
  readonly modifier: Modifier
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

export const enableModifiers = createAction('@@countries/ENABLE_MODIFIERS', action => {
  return (country: CountryName, key: string, modifiers: List<Modifier>) => action({ country, key, modifiers })
})

export const clearModifiers = createAction('@@countries/CLEAR_MODIFIERS', action => {
  return (country: CountryName, key: string) => action({ country, key })
})

export const selectGovernment = createAction('@@countries/SELECT_GOVERNMENT', action => {
  return (country: CountryName, government: GovermentType) => action({ country, government })
})

export const selectReligion = createAction('@@countries/SELECT_RELIGION', action => {
  return (country: CountryName, religion: ReligionType) => action({ country, religion })
})
