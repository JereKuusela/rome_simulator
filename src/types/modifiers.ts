import { UnitType, ValuesType, CultureType } from 'types'
import { Mode } from './definition';
import { ObjSet } from 'utils';

export enum SelectionType {
  Trait = 'Trait',
  Ability = 'Ability',
  Tradition = 'Tradition',
  Invention = 'Invention',
  Heritage = 'Heritage',
  Law = 'Law',
  Omen = 'Omen',
  Econonomy = 'Econonomy',
  Idea = 'Idea',
  Trade = 'Trade'
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

export enum ReligionType {
  Dummy = 'Dummy'
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
export interface Tradition {
  name: string
  key: string
  modifiers: Modifier[]
}
export interface Invention {
  name: string
  index: number
  key: string
  modifiers: Modifier[]
}
export interface Path {
  name: string
  key: string
  traditions: Tradition[]
}
export interface TraditionDefinition {
  name: string
  key: CultureType
  paths: Path[]
  modifiers: Modifier[]
}
export interface TradeDefinition {
  name: string
  key: string
  index: number
  modifiers: Modifier[]
}
export interface HeritageDefinition {
  name: string
  key: string
  modifiers: Modifier[]
}
export interface InventionDefinition {
  name: string
  inventions: Invention[]
}
export interface OmenDefinition {
  name: string
  modifier: Modifier
}
export interface TraitDefinition {
  name: string
  key: string
  modifiers: Modifier[]
 }
export interface LawDefinition {
  name: string
  options: {
    name: string
    key: string
    modifiers: Modifier[]
  }[]
}
export interface EconomyDefinition {
  name: string
  options: {
    name: string
    key: string
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
    key: string
    modifiers: Modifier[]
  }[]
}
export interface TechDefinitionEUIV {
  name: string
  modifiers: Modifier[]
}
