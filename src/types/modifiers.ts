import { UnitType, ValuesType, CultureType } from 'types'
import { Mode } from './definition'
import { ObjSet } from 'utils'

export enum SelectionType {
  Trait = 'Trait',
  Ability = 'Ability',
  Tradition = 'Tradition',
  Invention = 'Invention',
  Heritage = 'Heritage',
  Law = 'Law',
  Deity = 'Deity',
  Policy = 'Policy',
  Idea = 'Idea',
  Trade = 'Trade',
  Religion = 'Religion',
  Faction = 'Faction',
  Modifier = 'Modifier'
}

export type Selections = { [key in SelectionType]: ObjSet }

export enum ModifierType {
  Text = 'Text',
  Global = 'Global',
  General = 'General',
  Country = 'Country'
}

export enum GovermentType {
  Republic = 'Republic',
  Monarch = 'Monarch',
  Tribe = 'Tribe'
}

export interface Modifier {
  target: UnitType | ModifierType | Mode
  attribute: string
  negative?: boolean
  type: ValuesType
  no_percent?: boolean
  value: number
}

export interface ModifierWithKey extends Modifier {
  key: string
}
export interface Invention extends ListDefinition {
  index: number
}
export interface Path {
  name: string
  key: string
  traditions: ListDefinition[]
}
export interface TraditionDefinition {
  name: string
  key: CultureType
  paths: Path[]
  modifiers: Modifier[]
}
export type TradeDefinition = ListDefinition & { index: number }
export type TradeDefinitions = { [key: string]: TradeDefinition }
export interface ListDefinition {
  name: string
  key: string
  modifiers: Modifier[]
}
export type ListDefinition2 = { [key: string]: ListDefinition }
export type DeityDefinition = ListDefinition & { isOmen: boolean }
export type DeityDefinitions = { [key: string]: DeityDefinition }

export type OptionDefinition = ListDefinition[]

export interface TechDefinition {
  name: string
  inventions: Invention[]
}