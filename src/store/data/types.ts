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

export interface Modifier {
  readonly target: UnitType | DefinitionType | ModifierType | 'Text' | 'General'
  readonly attribute: string
  readonly negative?: boolean
  readonly type?: ValuesType
  readonly no_percent?: boolean
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
  readonly type: CultureType
  readonly paths: List<Path>
  readonly modifiers: List<Modifier>
}
export interface TradeDefinition {
  readonly name: string
  readonly type: TradeType
  readonly modifier: Modifier
}
export interface HeritageDefinition {
  readonly name: string
  readonly modifiers: List<Modifier>
}
export interface InventionDefinition {
  readonly name: string
  readonly inventions: List<List<Modifier>>
}
export interface OmenDefinition {
  readonly name: string
  readonly modifier: Modifier
}
export interface TraitDefinition {
  readonly name: string
  readonly modifiers: List<Modifier>
 }
export interface LawDefinition {
  readonly name: string
  readonly options: List<{
    readonly name: string
    readonly modifiers: List<Modifier>
  }>
}
export interface EconomyDefinition {
  readonly name: string
  readonly options: List<{
    readonly name: string
    readonly modifiers: List<Modifier>
  }>
}
export interface IdeaDefinition {
  readonly name: string
  readonly modifiers: List<Modifier>
}
export interface AbilityDefinition {
  readonly name: string
  readonly options: List<{
    readonly name: string
    readonly modifiers: List<Modifier>
  }>
}