import { UnitType, ValuesType } from 'types'
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

export type Selections = Record<SelectionType, ObjSet>

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
  noPercent?: boolean
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

export interface ListDefinition {
  name: string
  key: string
  modifiers: Modifier[]
}
export type ListDefinitions = Record<string, ListDefinition>
export type DeityDefinition = ListDefinition & { isOmen: boolean }
export type DeityDefinitions = Record<string, DeityDefinition>

export type InventionDefinition = ListDefinition & {
  relevant: boolean
  tech: string
}

export type OptionDefinition = ListDefinition[]

type ListData = {
  name: string
  key: string
  modifiers: ModifierData[]
}

export type OptionData = ListData[]

export type DictionaryData = Record<string, string>

type ModifierData = {
  target: string
  attribute: string
  value: number
}

export type InventionData = {
  name: string
  inventions: {
    name: string
    key: string
    index: number
    modifiers: ModifierData[]
  }[]
}

export type Traditions = Record<string, ListDefinition[]>
