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
  Dummy = 'Dummy'
}

export enum CultureType {
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

export enum ScopeType {
  Country = 'Country',
  Army = 'Army'
}

export interface Modifier {
  target: UnitType | DefinitionType | ModifierType | 'Text' | 'General'
  scope: ScopeType
  attribute: string
  negative?: boolean
  type: ValuesType
  no_percent?: boolean
  value: number
}
export interface Tradition {
  name: string
  modifiers: Modifier[]
}
export interface Path {
  name: string
  traditions: Tradition[]
}
export interface TraditionDefinition {
  type: CultureType
  paths: Path[]
  modifiers: Modifier[]
}
export interface TradeDefinition {
  name: string
  type: TradeType
  modifier: Modifier
}
export interface HeritageDefinition {
  name: string
  modifiers: Modifier[]
}
export interface InventionDefinition {
  name: string
  inventions: Modifier[][]
}
export interface OmenDefinition {
  name: string
  modifier: Modifier
}
export interface TraitDefinition {
  name: string
  modifiers: Modifier[]
 }
export interface LawDefinition {
  name: string
  options: {
    name: string
    modifiers: Modifier[]
  }[]
}
export interface EconomyDefinition {
  name: string
  options: {
    name: string
    modifiers: Modifier[]
  }[]
}
export interface IdeaDefinition {
  name: string
  modifiers: Modifier[]
}
export interface AbilityDefinition {
  name: string
  options: {
    name: string
    modifiers: Modifier[]
  }[]
}