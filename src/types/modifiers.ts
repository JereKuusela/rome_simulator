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
  Distinction = 'Distinction',
  Effect = 'Effect'
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

export interface DataEntry {
  name: string
  key: string
  modifiers: Modifier[]
  relevant: boolean
  parent: string
}

export type DeityDefinition = DataEntry & { isOmen: boolean }

export type DictionaryData = Record<string, string>

type Culture = {
  name: string
  template: Record<string, number>
  primary: string
  secondary: string
  flank: string
}
export type CultureData = Record<string, Culture>
export type RegionData = Record<string, number[]>

export interface DataEntryEU4 {
  name: string
  key: string
  modifiers: Modifier[]
}
